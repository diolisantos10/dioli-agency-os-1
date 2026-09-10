// O GATE DO MARCO 6 — testes de FALHA e de RETOMADA, sem esperar de verdade.

import { describe, it, expect } from "vitest";
import {
  processarOutbox,
  proximaTentativaEm,
  MAX_TENTATIVAS,
  type ArmazemDeOutbox,
  type EfeitoPendente,
} from "@/lib/agency/v2-recovery/processador-outbox";
import { detectarAusencias } from "@/lib/agency/v2-recovery/heartbeat";
import { detectarParados } from "@/lib/agency/v2-recovery/detector-de-parados";
import { retomarProcesso, podeRetomar, type ArmazemDeRetomada } from "@/lib/agency/v2-recovery/retomar";
import { PERFIL_DO_PAPEL } from "@/lib/agency/roles";

const AGORA = new Date("2026-08-15T12:00:00Z");

function filaDeMemoria(efeitos: Array<Partial<EfeitoPendente> & { id: string }>) {
  const estado = new Map(
    efeitos.map((e) => [e.id, {
      id: e.id, tipo: e.tipo ?? "registro_de_teste", payload: e.payload ?? "{}",
      tentativas: e.tentativas ?? 0, chaveIdempotencia: e.chaveIdempotencia ?? `k-${e.id}`,
      correlationId: e.correlationId ?? "c-1",
      status: "pending" as string, proximaTentativa: new Date(0), ultimoErro: null as string | null,
    }]),
  );
  const armazem: ArmazemDeOutbox = {
    async pendentesProntos(agora, limite) {
      return [...estado.values()]
        .filter((e) => e.status === "pending" && e.proximaTentativa <= agora)
        .slice(0, limite)
        .map(({ id, tipo, payload, tentativas, chaveIdempotencia, correlationId }) =>
          ({ id, tipo, payload, tentativas, chaveIdempotencia, correlationId }));
    },
    async marcarEnviado(id) { estado.get(id)!.status = "sent"; },
    async marcarFalha(id, tentativas, proxima, erro) {
      const e = estado.get(id)!;
      e.tentativas = tentativas; e.proximaTentativa = proxima; e.ultimoErro = erro;
    },
    async marcarMorto(id, erro) {
      const e = estado.get(id)!;
      e.status = "dead"; e.ultimoErro = erro;
    },
  };
  return { armazem, estado };
}

describe("processador do outbox — falha vira retentativa, insistência vira fila morta", () => {
  it("efeito com executor que funciona é enviado uma vez", async () => {
    const chamadas: unknown[] = [];
    const { armazem, estado } = filaDeMemoria([{ id: "e1" }]);
    const r = await processarOutbox({ registro_de_teste: async (p) => { chamadas.push(p); } }, armazem, AGORA);
    expect(r).toEqual({ processados: 1, enviados: 1, reagendados: 0, mortos: 0 });
    expect(chamadas).toHaveLength(1);
    expect(estado.get("e1")!.status).toBe("sent");
  });

  it("executor que falha reagenda com backoff DOBRANDO — 2, 4, 8 minutos", async () => {
    const { armazem, estado } = filaDeMemoria([{ id: "e1" }]);
    const quebrado = { registro_de_teste: async () => { throw new Error("instabilidade"); } };
    await processarOutbox(quebrado, armazem, AGORA);
    expect(estado.get("e1")!.tentativas).toBe(1);
    expect(proximaTentativaEm(1, AGORA).getTime() - AGORA.getTime()).toBe(2 * 60_000);
    expect(proximaTentativaEm(2, AGORA).getTime() - AGORA.getTime()).toBe(4 * 60_000);
    expect(proximaTentativaEm(3, AGORA).getTime() - AGORA.getTime()).toBe(8 * 60_000);
  });

  it("na tentativa MAX o efeito morre — e a fila morta guarda o motivo", async () => {
    const { armazem, estado } = filaDeMemoria([{ id: "e1", tentativas: MAX_TENTATIVAS - 1 }]);
    const quebrado = { registro_de_teste: async () => { throw new Error("falha permanente"); } };
    const r = await processarOutbox(quebrado, armazem, AGORA);
    expect(r.mortos).toBe(1);
    expect(estado.get("e1")!.status).toBe("dead");
    expect(estado.get("e1")!.ultimoErro).toContain("falha permanente");
  });

  it("tipo SEM executor é falha declarada — nunca sucesso silencioso", async () => {
    const { armazem, estado } = filaDeMemoria([{ id: "e1", tipo: "tipo_futuro" }]);
    const r = await processarOutbox({}, armazem, AGORA);
    expect(r.reagendados).toBe(1);
    expect(estado.get("e1")!.ultimoErro).toContain("sem executor");
  });

  it("payload que não é JSON falha com nome, não explode o lote", async () => {
    const { armazem } = filaDeMemoria([{ id: "e1", payload: "{quebrado" }, { id: "e2" }]);
    const r = await processarOutbox({ registro_de_teste: async () => {} }, armazem, AGORA);
    expect(r.enviados).toBe(1);
    expect(r.reagendados).toBe(1);
  });
});

describe("heartbeat — quem não bateu aparece", () => {
  it("relógio que nunca bateu é achado, não silêncio", () => {
    const r = detectarAusencias(["cron-v2"], [], AGORA, 30);
    expect(r).toEqual([{ relogio: "cron-v2", motivo: "nunca_bateu", atrasoMinutos: null }]);
  });

  it("atrasado além da tolerância alarma com o atraso em minutos; em dia não alarma", () => {
    const r = detectarAusencias(
      ["cron-v2", "cron-execute"],
      [
        { relogio: "cron-v2", ultimaBatida: new Date(AGORA.getTime() - 45 * 60_000) },
        { relogio: "cron-execute", ultimaBatida: new Date(AGORA.getTime() - 5 * 60_000) },
      ],
      AGORA,
      30,
    );
    expect(r).toEqual([{ relogio: "cron-v2", motivo: "atrasado", atrasoMinutos: 45 }]);
  });
});

describe("detector de parados — estado + SLA, nunca impressão", () => {
  it("item além do SLA do estado aparece com as horas e a régua", () => {
    const r = detectarParados(
      [{ id: "t1", entidadeTipo: "Task", estadoCanonico: "production", atualizadoEm: new Date(AGORA.getTime() - 100 * 3_600_000) }],
      AGORA,
    );
    expect(r.parados).toEqual([{ id: "t1", entidadeTipo: "Task", estadoCanonico: "production", horasParado: 100, slaHoras: 72 }]);
  });

  it("dentro do SLA não alarma; estado sem régua é listado; terminal é ignorado", () => {
    const r = detectarParados(
      [
        { id: "a", entidadeTipo: "Task", estadoCanonico: "production", atualizadoEm: new Date(AGORA.getTime() - 3_600_000) },
        { id: "b", entidadeTipo: "Task", estadoCanonico: "estado_novo_sem_regua", atualizadoEm: new Date(0) },
        { id: "c", entidadeTipo: "Task", estadoCanonico: "cancelled", atualizadoEm: new Date(0) },
        { id: "d", entidadeTipo: "Task", estadoCanonico: null, atualizadoEm: new Date(0) },
      ],
      AGORA,
    );
    expect(r.parados).toHaveLength(0);
    expect(r.semRegua).toEqual(["estado_novo_sem_regua"]);
  });
});

describe("retomar — PM/Diretor, por correlação, idempotente", () => {
  const CASA = "ws-da-casa";

  function armazemDeRetomada(efeitosMortos: string[], opcoes: { daCasa?: boolean } = {}) {
    const daCasa = opcoes.daCasa ?? true;
    let fila = [...efeitosMortos];
    const retomadas: Array<{ correlationId: string; efeitos: number }> = [];
    const posseConsultada: Array<{ correlationId: string; workspaceId: string }> = [];
    const devolucoes: Array<{ correlationId: string; ids: string[] }> = [];
    const armazem: ArmazemDeRetomada = {
      async correlacaoDoWorkspace(correlationId, workspaceId) {
        posseConsultada.push({ correlationId, workspaceId });
        return daCasa;
      },
      async efeitosParaRetomar() { return fila; },
      async devolverParaFila(correlationId, ids) {
        devolucoes.push({ correlationId, ids });
        fila = fila.filter((id) => !ids.includes(id));
      },
      async registrarRetomada(correlationId, _ator, efeitos) { retomadas.push({ correlationId, efeitos }); },
    };
    return { armazem, retomadas, filaRestante: () => fila, posseConsultada, devolucoes };
  }

  it("staff NÃO retoma; master, diretor e PM retomam", () => {
    expect(podeRetomar(PERFIL_DO_PAPEL.social_staff)).toBe(false);
    expect(podeRetomar(PERFIL_DO_PAPEL.ads_staff)).toBe(false);
    expect(podeRetomar(PERFIL_DO_PAPEL.master)).toBe(true);
    expect(podeRetomar(PERFIL_DO_PAPEL.diretor)).toBe(true);
    expect(podeRetomar(PERFIL_DO_PAPEL.project_manager)).toBe(true);
  });

  it("retomada devolve os mortos à fila — as MESMAS linhas, nada duplicado", async () => {
    const { armazem, retomadas, filaRestante } = armazemDeRetomada(["e1", "e2"]);
    const r = await retomarProcesso("c-1", PERFIL_DO_PAPEL.project_manager, "u-pm", CASA, armazem, AGORA);
    expect(r).toEqual({ ok: true, efeitosDevolvidos: 2 });
    expect(filaRestante()).toHaveLength(0);
    expect(retomadas).toEqual([{ correlationId: "c-1", efeitos: 2 }]);
  });

  it("a SEGUNDA retomada devolve zero — e zero é sucesso, com registro", async () => {
    const { armazem, retomadas } = armazemDeRetomada([]);
    const r = await retomarProcesso("c-1", PERFIL_DO_PAPEL.diretor, "u-dir", CASA, armazem, AGORA);
    expect(r).toEqual({ ok: true, efeitosDevolvidos: 0 });
    expect(retomadas).toHaveLength(1);
  });

  it("sem permissão nada acontece — nem consulta, nem registro", async () => {
    const { armazem, retomadas, filaRestante, posseConsultada } = armazemDeRetomada(["e1"]);
    const r = await retomarProcesso("c-1", PERFIL_DO_PAPEL.social_staff, "u-s", CASA, armazem, AGORA);
    expect(r.ok).toBe(false);
    expect(filaRestante()).toEqual(["e1"]);
    expect(retomadas).toHaveLength(0);
    expect(posseConsultada).toHaveLength(0);
  });

  it("correlação vazia é recusada com nome", async () => {
    const { armazem } = armazemDeRetomada([]);
    const r = await retomarProcesso("  ", PERFIL_DO_PAPEL.master, "u-m", CASA, armazem, AGORA);
    expect(r.ok).toBe(false);
  });

  // ─── O RECORTE DE WORKSPACE, AS DUAS METADES ───────────────────────────────
  //
  // Metade 1 — BARRA: correlação de outra casa não devolve efeito à fila e não
  //            deixa nem rastro de tentativa no processo alheio.
  // Metade 2 — NÃO BARRA O LEGÍTIMO: o PM da própria casa continua retomando,
  //            e continua sendo idempotente.

  it("⛔ correlação de OUTRA casa: não devolve nada, não registra, e diz por quê", async () => {
    const { armazem, retomadas, filaRestante, devolucoes } = armazemDeRetomada(["e1", "e2"], { daCasa: false });
    const r = await retomarProcesso("assistido:cliente-alheio:req-9", PERFIL_DO_PAPEL.master, "u-m", CASA, armazem, AGORA);
    expect(r.ok).toBe(false);
    expect(r.ok === false && r.motivo).toContain("nesta casa");
    // O efeito do outro continua exatamente onde estava.
    expect(filaRestante()).toEqual(["e1", "e2"]);
    expect(devolucoes).toHaveLength(0);
    expect(retomadas).toHaveLength(0);
  });

  it("✅ a MESMA chamada, com a correlação da própria casa, continua funcionando", async () => {
    const { armazem, retomadas, filaRestante, posseConsultada } = armazemDeRetomada(["e1", "e2"], { daCasa: true });
    const r = await retomarProcesso("assistido:cliente-da-casa:req-1", PERFIL_DO_PAPEL.master, "u-m", CASA, armazem, AGORA);
    expect(r).toEqual({ ok: true, efeitosDevolvidos: 2 });
    expect(filaRestante()).toHaveLength(0);
    expect(retomadas).toHaveLength(1);
    // A posse foi perguntada com a casa de QUEM PEDIU, não com nada do corpo.
    expect(posseConsultada).toEqual([{ correlationId: "assistido:cliente-da-casa:req-1", workspaceId: CASA }]);
  });

  it("workspace vazio é recusado — retomada sem casa seria retomada de qualquer casa", async () => {
    const { armazem, filaRestante } = armazemDeRetomada(["e1"]);
    const r = await retomarProcesso("c-1", PERFIL_DO_PAPEL.master, "u-m", "   ", armazem, AGORA);
    expect(r.ok).toBe(false);
    expect(filaRestante()).toEqual(["e1"]);
  });

  it("🔑 a ESCRITA repete o predicado da leitura — a correlação vai no filtro do update", async () => {
    // Meia trava parece inteira: filtrar só o select e atualizar por `id`
    // deixa a janela entre as duas consultas aberta. O motor entrega a
    // correlação ao armazém justamente para que ela entre no `where`.
    const { armazem, devolucoes } = armazemDeRetomada(["e1", "e2"]);
    await retomarProcesso("c-42", PERFIL_DO_PAPEL.diretor, "u-dir", CASA, armazem, AGORA);
    expect(devolucoes).toEqual([{ correlationId: "c-42", ids: ["e1", "e2"] }]);
  });
});
