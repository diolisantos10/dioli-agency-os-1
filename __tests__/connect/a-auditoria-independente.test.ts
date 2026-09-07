// OS SEIS DEFEITOS DA AUDITORIA INDEPENDENTE — reproduzidos, e depois mortos.
//
// ─── O QUE ESTE ARQUIVO É ──────────────────────────────────────────────────
//
// Em 30/08/2026 um auditor independente reproduziu, CONTRA BANCO REAL, seis
// defeitos no gateway Connect — quatro deles ALTOS e bloqueadores da ONDA 1.
// Cada `describe` aqui é a reprodução DELE, com os mesmos valores que ele usou,
// virada do avesso: onde ele obteve `HTTP 200 · estado: executado`, o teste
// agora exige a recusa; e ao lado, sempre, a metade que prova que o caso
// legítimo continua atravessando.
//
// ─── POR QUE SQLITE DE VERDADE, E NÃO MOCK ─────────────────────────────────
//
// Porque o furo do A-2 e o do A-4 são sobre O QUE O BANCO DEVOLVE. Um mock
// devolve o que o autor do mock quis — provaria exatamente nada. Aqui as
// execuções alheias que o auditor plantou são plantadas de verdade, com
// `prisma.execucaoV2.create`, no mesmo banco, e é o `WHERE` real que tem que
// não trazê-las.
//
// ─── AS DUAS METADES, E A TERCEIRA MEDIÇÃO ─────────────────────────────────
//
// Regra da casa: prove que BARRA e prove que o caso legítimo PASSA. As duas
// estão em cada bloco. A terceira — quebrar a implementação de propósito e
// confirmar que o teste fica vermelho — foi feita à mão, defeito por defeito,
// e está registrada no relatório da frente: teste que não fica vermelho quando
// o código quebra não testa nada.

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "node:child_process";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PERFIL_DO_PAPEL } from "@/lib/agency/roles";
import { specDaFuncao } from "@/lib/agency/catalogo-v2/specs";
import { armazemDoConnectNoBanco } from "@/lib/agency/connect/armazem-prisma";
import {
  despachar,
  escaladaEEstouroAposExecucao,
  escaladaEFalhaTecnica,
  linhaPertenceAoFio,
  type ArmazemDoConnect,
  type DonoDoFio,
  type LinhaDeExecucaoLida,
} from "@/lib/agency/connect/despacho";
import {
  conferirPedido,
  fioDoConnect,
  fioEDoConnect,
  FUNCAO_DO_PILOTO,
  type PedidoConferido,
} from "@/lib/agency/connect/contrato";
import {
  CHAVES_RESERVADAS_DO_GATEWAY,
  CHAVE_COBRANCAS,
  CHAVE_HISTORICO,
} from "@/lib/agency/connect/chaves";
import {
  fabricarAtrasoDoClienteFalso,
  type AtrasoFabricado,
} from "@/lib/agency/connect/atraso-do-cliente-falso";
import { caminhoDeBancoDescartavel, limparArquivosDoBanco } from "../v2/_infra/banco-descartavel";

const CAMINHO_DB = caminhoDeBancoDescartavel("connect-auditoria");
let prisma: PrismaClient;
let armazem: ArmazemDoConnect;
let atraso: AtrasoFabricado;

const AGORA = new Date("2026-08-30T15:00:00Z");
const PERFIL = PERFIL_DO_PAPEL.diretor;

// ─── OS VALORES EXATOS DA REPRODUÇÃO DO AUDITOR ────────────────────────────
const FIO_ALHEIO = "FIO-REAL-DE-CLIENTE-PAGANTE";
const FUNCAO_ALHEIA = "funcao-real-secreta";
const CLIENTE_ALHEIO = "cliente-real-999";
const ARTEFATO_ALHEIO = "SEGREDO COMERCIAL DO CLIENTE PAGANTE — proposta de R$ 480.000";

beforeAll(async () => {
  limparArquivosDoBanco(CAMINHO_DB);
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: `file:${CAMINHO_DB}` },
    stdio: "pipe",
    timeout: 240_000,
  });
  prisma = new PrismaClient({ adapter: new PrismaLibSql({ url: `file:${CAMINHO_DB}` }) });
  armazem = armazemDoConnectNoBanco(prisma);
  atraso = await fabricarAtrasoDoClienteFalso({ db: prisma, agora: AGORA, sintetico: true });

  // ⭐ A EXECUÇÃO REAL ALHEIA, plantada como o auditor plantou: outra função,
  // outro cliente, sob o fio de um cliente pagante. Ela existe no MESMO banco.
  await prisma.execucaoV2.create({
    data: {
      ator: "ia",
      modelo: "modelo-de-producao",
      funcaoId: FUNCAO_ALHEIA,
      departamentoId: "departamento-real",
      correlationId: FIO_ALHEIO,
      clienteId: CLIENTE_ALHEIO,
      inicio: new Date("2020-01-01T10:00:00Z"),
      fim: new Date("2020-01-01T10:05:00Z"),
      resultado: ARTEFATO_ALHEIO,
    },
  });
}, 300_000);

afterAll(async () => {
  await prisma.$disconnect();
  limparArquivosDoBanco(CAMINHO_DB);
});

function pedidoDoPiloto(extra: Record<string, unknown> = {}): PedidoConferido {
  const spec = specDaFuncao(FUNCAO_DO_PILOTO);
  if (!spec.ok) throw new Error(spec.motivo);
  const [primeira, segunda] = spec.spec.entradas_obrigatorias;
  const conferencia = conferirPedido({
    modo: "homologacao",
    sintetico: true,
    funcao: FUNCAO_DO_PILOTO,
    pergunta: "O atendimento da Cantina está atrasado. O que houve?",
    dossie: {
      [primeira!]: atraso.demanda,
      [segunda!]: "conversational-sdr livre; prospecting ocupado até amanhã.",
    },
    cobrancas: atraso.cobrancas,
    ...extra,
  });
  if (!conferencia.ok) throw new Error(`o pedido legítimo foi recusado: ${conferencia.motivo}`);
  return conferencia.pedido;
}

// ═══════════════════════════════════════════════════════════════════════════
// A-2 · ALTA — o correlationId aceito sem dono: lê e escreve no fio de terceiro
// ═══════════════════════════════════════════════════════════════════════════
describe("A-2 — o fio de outro cliente não entra, nem para ler nem para escrever", () => {
  it("⭐ o fio do cliente pagante é RECUSADO na porta, com o motivo", () => {
    const r = conferirPedido({
      modo: "homologacao",
      sintetico: true,
      pergunta: "e aí?",
      correlationId: FIO_ALHEIO,
    });
    expect(r.ok, "o fio de um cliente pagante voltou a atravessar a porta").toBe(false);
    if (r.ok) return;
    expect(r.motivo).toContain(FIO_ALHEIO);
    expect(r.motivo).toMatch(/EMITIDO pelo gateway/i);
  });

  it("⭐ e o núcleo recusa sozinho, sem depender de o conferidor ter rodado", async () => {
    // `despachar` é chamado direto por teste e por chamador interno. A trava do
    // contrato não alcança esses caminhos — esta alcança.
    const r = await despachar(
      { ...pedidoDoPiloto(), correlationId: FIO_ALHEIO },
      { armazem, perfil: PERFIL, agora: () => AGORA },
    );
    expect(r.estado).toBe("recusado");
    if (r.estado !== "recusado") return;
    expect(r.motivo).toMatch(/EMITIDO pelo gateway/i);
  });

  it("⭐ NADA foi escrito no fio do cliente pagante — nem execução, nem recusa", async () => {
    const antesExec = await prisma.execucaoV2.count({ where: { correlationId: FIO_ALHEIO } });
    const antesRecusa = await prisma.recusaV2.count({ where: { correlationId: FIO_ALHEIO } });

    await despachar(
      { ...pedidoDoPiloto(), correlationId: FIO_ALHEIO },
      { armazem, perfil: PERFIL, agora: () => AGORA },
    );

    // A execução alheia plantada continua sendo a ÚNICA linha daquele fio: o
    // `turno: 2` que o auditor obteve dentro da conversa do cliente pagante não
    // acontece mais. E a recusa também não pousa lá — recusa gravada no fio de
    // terceiro já seria contaminação de escrita.
    expect(await prisma.execucaoV2.count({ where: { correlationId: FIO_ALHEIO } })).toBe(antesExec);
    expect(await prisma.recusaV2.count({ where: { correlationId: FIO_ALHEIO } })).toBe(antesRecusa);
  });

  it("⭐ e NADA da execução alheia vaza para o artefato — nem id, nem horário, nem função", async () => {
    // O vazamento de LEITURA do auditor, medido pelo outro lado: mesmo que o
    // fio alheio chegasse até os antecedentes, o recorte por dono não o traz.
    const dono: DonoDoFio = {
      correlationId: FIO_ALHEIO,
      clienteId: atraso.clienteId,
      funcoes: [FUNCAO_DO_PILOTO],
    };
    expect(await armazem.antecedentes(dono)).toEqual([]);
  });

  it("a consulta pode ser generosa; a conferência em código não é", () => {
    // "O banco filtrou" não é "eu conferi": esta é a trava que sobrevive à
    // troca da consulta, ao dublê de armazém e ao índice novo.
    const alheia: LinhaDeExecucaoLida = {
      id: "x",
      funcaoId: FUNCAO_ALHEIA,
      departamentoId: "d",
      correlationId: FIO_ALHEIO,
      inicio: AGORA,
      fim: AGORA,
      resultado: ARTEFATO_ALHEIO,
      ator: "ia",
      modelo: null,
      custoUsd: null,
      clienteId: CLIENTE_ALHEIO,
    };
    const meu: DonoDoFio = { correlationId: "connect:x:1", clienteId: "cli-1", funcoes: [FUNCAO_DO_PILOTO] };
    expect(linhaPertenceAoFio(alheia, meu)).toBe(false);
    // Cada coordenada sozinha basta para reprovar — e as três são medidas.
    expect(linhaPertenceAoFio({ ...alheia, correlationId: meu.correlationId }, meu)).toBe(false);
    expect(linhaPertenceAoFio({ ...alheia, correlationId: meu.correlationId, clienteId: "cli-1" }, meu)).toBe(false);
    expect(
      linhaPertenceAoFio(
        { ...alheia, correlationId: meu.correlationId, clienteId: "cli-1", funcaoId: FUNCAO_DO_PILOTO },
        meu,
      ),
    ).toBe(true);
  });

  it("⭐ ARMAZÉM DESONESTO: se a consulta trouxer linha alheia, o CÓDIGO a descarta", async () => {
    // O mutante que sobreviveu à primeira rodada de quebra proposital: tirar o
    // `filter(linhaPertenceAoFio)` e confiar só no `WHERE`. Ele sobrevivia
    // porque nenhum teste tinha um armazém que ignorasse o recorte — e é
    // exatamente esse o mundo contra o qual a reconferência existe: consulta
    // trocada numa refatoração, índice novo, implementação alternativa de
    // armazém. "O banco filtrou" não é "eu conferi".
    const desonesto: ArmazemDoConnect = {
      ...armazem,
      async antecedentes() {
        const l = await prisma.execucaoV2.findFirst({ where: { correlationId: FIO_ALHEIO } });
        return [
          {
            id: l!.id,
            funcaoId: l!.funcaoId,
            departamentoId: l!.departamentoId,
            correlationId: l!.correlationId,
            inicio: l!.inicio,
            fim: l!.fim,
            resultado: l!.resultado,
            ator: l!.ator,
            modelo: l!.modelo,
            custoUsd: l!.custoUsd,
            clienteId: l!.clienteId,
          },
        ];
      },
    };

    const r = await despachar(pedidoDoPiloto(), { armazem: desonesto, perfil: PERFIL, agora: () => AGORA });
    expect(r.estado, JSON.stringify(r)).toBe("executado");
    if (r.estado !== "executado") return;

    // Nada da execução alheia atravessou: nem o id, nem a função, nem o
    // horário de 2020 — que foi o vazamento de leitura medido pelo auditor.
    expect(r.artefato).not.toContain(FUNCAO_ALHEIA);
    expect(r.artefato).not.toContain("2020-01-01");
    expect(r.artefato).not.toContain(FIO_ALHEIO);
    // E o turno não foi inflado por uma execução que não é desta conversa.
    expect(r.turno).toBe(1);
    expect(r.leitura_do_fio.lido && r.leitura_do_fio.turnos_anteriores).toBe(0);

    // E o RASTRO gravado também não guarda o que vazaria — o furo do auditor
    // ficava PERSISTIDO em `ExecucaoV2.entradas`.
    const gravada = await prisma.execucaoV2.findUnique({ where: { id: r.execucaoId } });
    expect(String(gravada!.entradas)).not.toContain(FUNCAO_ALHEIA);
  });

  it("A OUTRA METADE — o fio que o GATEWAY emitiu continua mantendo a conversa", async () => {
    const primeiro = await despachar(pedidoDoPiloto(), { armazem, perfil: PERFIL, agora: () => AGORA });
    expect(primeiro.estado, JSON.stringify(primeiro)).toBe("executado");
    if (primeiro.estado !== "executado") return;
    expect(primeiro.turno).toBe(1);
    // O fio que voltou é aceitável de volta — a emissão e a conferência casam.
    expect(fioEDoConnect(primeiro.correlationId)).toBe(true);

    const segundo = await despachar(pedidoDoPiloto({ correlationId: primeiro.correlationId }), {
      armazem,
      perfil: PERFIL,
      agora: () => AGORA,
    });
    expect(segundo.estado, JSON.stringify(segundo)).toBe("executado");
    if (segundo.estado !== "executado") return;
    expect(segundo.turno).toBe(2);
    expect(segundo.correlationId).toBe(primeiro.correlationId);
    // O fio traz a execução ANTERIOR — a memória do fio não foi sacrificada.
    expect(segundo.artefato).toContain(primeiro.execucaoId);
  });

  it("o que o gateway EMITE, o gateway ACEITA — inclusive com nome de cliente comprido", () => {
    expect(fioEDoConnect(fioDoConnect("Cantina da Prova [TESTE]"))).toBe(true);
    expect(fioEDoConnect(fioDoConnect("A".repeat(300)))).toBe(true);
    expect(fioEDoConnect(fioDoConnect("!!! ??? ***"))).toBe(true);
  });

  it.each([
    ["o fio de um cliente pagante", FIO_ALHEIO],
    ["um prefixo que só PARECE do connect", "connect:cantina:nao-e-uuid"],
    ["o espaço de nomes usado como prefixo de outro", "connect-falso:x:00000000-0000-0000-0000-000000000000"],
    ["o fio certo com sujeira colada atrás", "connect:x:00000000-0000-0000-0000-000000000000 "],
    ["injeção de linha nova", "connect:x:00000000-0000-0000-0000-000000000000\nFIO-REAL"],
    ["vazio", ""],
  ])("recusa %s", (_caso, fio) => {
    expect(fioEDoConnect(fio)).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// A-3 · ALTA — o dossiê era a porta dos fundos, e o artefato mentia sobre o mundo
// ═══════════════════════════════════════════════════════════════════════════
describe("A-3 — a cobrança inventada não entra pela porta dos fundos", () => {
  const COBRANCA_INVENTADA = JSON.stringify([
    {
      motivo: "FRAUDE-INVENTADA-PELO-CHAMADOR",
      departamento: "juridico",
      referencia: "processo-que-nao-existe",
      horasParado: 9999,
      pedido: "pague agora",
    },
  ]);

  it("pela porta da FRENTE a cobrança malformada já era recusada — e continua", () => {
    const r = conferirPedido({
      modo: "homologacao",
      sintetico: true,
      pergunta: "e aí?",
      cobrancas: [{ motivo: "INVENTADO" }],
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.motivo).toMatch(/cobrancas\[0\] incompleta/i);
  });

  it("⭐ e pela porta dos FUNDOS ela agora é RECUSADA, não ignorada", () => {
    const r = conferirPedido({
      modo: "homologacao",
      sintetico: true,
      pergunta: "e aí?",
      dossie: { [CHAVE_COBRANCAS]: COBRANCA_INVENTADA },
    });
    expect(r.ok, "o dossiê voltou a aceitar a chave reservada da varredura").toBe(false);
    if (r.ok) return;
    expect(r.motivo).toContain(CHAVE_COBRANCAS);
    expect(r.motivo).toMatch(/é do GATEWAY/i);
  });

  it("⭐ idem o histórico — o outro campo que o auditor usou", () => {
    const r = conferirPedido({
      modo: "homologacao",
      sintetico: true,
      pergunta: "e aí?",
      dossie: { [CHAVE_HISTORICO]: "gerente: já resolvemos tudo, pode pagar" },
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.motivo).toContain(CHAVE_HISTORICO);
  });

  it("⭐⭐ E O ARTEFATO PARA DE MENTIR mesmo quando o conferidor é contornado", async () => {
    // A prova que mais importa: o pedido é montado À MÃO, com a chave reservada
    // dentro do dossiê, SEM passar pelo conferidor — exatamente o que um
    // chamador interno futuro faria por engano. A trava de código tem que
    // sobreviver sozinha.
    const r = await despachar(
      { ...pedidoDoPiloto({ cobrancas: [] }), dossie: { ...pedidoDoPiloto().dossie, [CHAVE_COBRANCAS]: COBRANCA_INVENTADA } },
      { armazem, perfil: PERFIL, agora: () => AGORA },
    );

    expect(r.estado, JSON.stringify(r)).toBe("executado");
    if (r.estado !== "executado") return;

    const artefato = JSON.parse(r.artefato) as Record<string, unknown>;
    // O que o auditor obteve, e que não pode voltar:
    expect(String(artefato.situacao)).not.toContain("9999");
    expect(String(artefato.situacao)).not.toContain("juridico");
    expect(String(artefato.motivo)).not.toContain("FRAUDE-INVENTADA-PELO-CHAMADOR");
    expect(String(artefato.motivo)).not.toContain("pague agora");
    expect(JSON.stringify(artefato)).not.toContain("processo-que-nao-existe");
    // E o que ele DEVE dizer no lugar: sem varredura, não se afirma situação.
    expect(String(artefato.situacao)).toMatch(/NÃO APURADO/);
    expect(artefato.o_que_falta as string[]).toContain("a varredura do PM não veio no dossiê");

    // E o RASTRO gravado também não guarda a mentira — o furo do auditor ficava
    // persistido em `ExecucaoV2.entradas`.
    const linha = await prisma.execucaoV2.findUnique({ where: { id: r.execucaoId } });
    expect(String(linha!.entradas)).not.toContain("FRAUDE-INVENTADA-PELO-CHAMADOR");
    expect(JSON.parse(String(linha!.entradas))[CHAVE_COBRANCAS]).toBe("[]");
  });

  it("⭐ A LISTA INTEIRA é do gateway — nenhuma chave reservada sobrevive do dossiê", async () => {
    // A trava não é "as cinco chaves que alguém lembrou": é a LISTA, percorrida.
    // Este teste morde a lista, não as cinco — é ele que garante que a sexta
    // chave reservada nasça protegida sem ninguém ter de lembrar de escrevê-la
    // numa segunda linha em `entradasDoDespacho`.
    const veneno = "VALOR-PLANTADO-POR-QUEM-CHAMOU";
    const dossieEnvenenado = { ...pedidoDoPiloto().dossie };
    for (const chave of CHAVES_RESERVADAS_DO_GATEWAY) dossieEnvenenado[chave] = veneno;

    const r = await despachar(
      { ...pedidoDoPiloto(), dossie: dossieEnvenenado },
      { armazem, perfil: PERFIL, agora: () => AGORA },
    );
    expect(r.estado, JSON.stringify(r)).toBe("executado");
    if (r.estado !== "executado") return;

    const gravada = await prisma.execucaoV2.findUnique({ where: { id: r.execucaoId } });
    const entradas = JSON.parse(String(gravada!.entradas)) as Record<string, string>;
    for (const chave of CHAVES_RESERVADAS_DO_GATEWAY) {
      expect(entradas[chave], `a chave reservada "${chave}" veio de quem chamou`).not.toBe(veneno);
      expect(entradas[chave], `a chave reservada "${chave}" não foi escrita pelo gateway`).toBeDefined();
    }
    expect(String(gravada!.entradas)).not.toContain(veneno);
    expect(r.artefato).not.toContain(veneno);
  });

  it("A OUTRA METADE — a varredura REAL, pelo campo certo, continua chegando inteira", async () => {
    const r = await despachar(pedidoDoPiloto(), { armazem, perfil: PERFIL, agora: () => AGORA });
    expect(r.estado, JSON.stringify(r)).toBe("executado");
    if (r.estado !== "executado") return;

    const artefato = JSON.parse(r.artefato) as Record<string, unknown>;
    expect(String(artefato.situacao)).toMatch(/ATRASADO/);
    expect(String(artefato.motivo)).toMatch(/handoff_sem_aceite|sem_dono/);
    expect(artefato.o_que_falta as string[]).not.toContain("a varredura do PM não veio no dossiê");
  });

  it("A OUTRA METADE — uma chave comum do dossiê continua atravessando normalmente", () => {
    const r = conferirPedido({
      modo: "homologacao",
      sintetico: true,
      pergunta: "e aí?",
      dossie: { "capacidade atual do departamento": "todo mundo livre" },
    });
    expect(r.ok, r.ok ? "" : r.motivo).toBe(true);
    if (!r.ok) return;
    expect(r.pedido.dossie["capacidade atual do departamento"]).toBe("todo mundo livre");
  });

  it("gatilho declarado pelo chamador sai ROTULADO como declaração, não como apuração", async () => {
    // A variante vizinha do A-3: o outro campo em que texto de quem chama
    // aparece no artefato ao lado de coisas apuradas.
    const r = await despachar(pedidoDoPiloto({ gatilhos: ["inventei este gatilho"] }), {
      armazem,
      perfil: PERFIL,
      agora: () => AGORA,
    });
    expect(r.estado).toBe("executado");
    if (r.estado !== "executado") return;
    const falta = (JSON.parse(r.artefato) as { o_que_falta: string[] }).o_que_falta;
    expect(falta.find((f) => f.includes("inventei este gatilho"))).toMatch(/DECLARADO por quem chamou/);
    expect(falta.find((f) => f.includes("inventei este gatilho"))).toMatch(/não conferido/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// A-7 — grafia alternativa ignorada em silêncio: negada por PADRÃO, não caçada
// ═══════════════════════════════════════════════════════════════════════════
describe("A-7 — campo que a porta não conhece é recusa, não silêncio", () => {
  it.each([
    ["cliente_id"],
    ["clientId"],
    ["customerId"],
    ["CLIENTEID"],
    ["cliente-id"],
    ["clienteid"],
    ["campo_que_ninguem_imaginou"],
  ])("⭐ recusa %s sem que ele precise estar em lista nenhuma", (campo) => {
    // A prova de que o conserto é o DESENHO e não uma denylist maior: nenhum
    // destes nomes aparece em lugar nenhum do código. Eles são recusados por
    // não estarem na lista do que a porta conhece.
    const r = conferirPedido({ modo: "homologacao", sintetico: true, pergunta: "e aí?", [campo]: "cli-real-999" });
    expect(r.ok, `"${campo}" foi ignorado em silêncio`).toBe(false);
    if (r.ok) return;
    expect(r.motivo).toContain(`"${campo}" não é um campo desta porta`);
    expect(r.motivo).toMatch(/recusado em vez de ignorado/i);
  });

  it("os DOIS nomes proibidos mantêm a mensagem própria — ela ensina outra coisa", () => {
    // "campo desconhecido" não ensinaria que o cliente é resolvido no banco.
    for (const campo of ["clienteId", "cliente"]) {
      const r = conferirPedido({ modo: "homologacao", sintetico: true, pergunta: "e aí?", [campo]: "x" });
      expect(r.ok).toBe(false);
      if (r.ok) return;
      expect(r.motivo).toContain(`"${campo}" não é mais entrada desta porta`);
      expect(r.motivo).toMatch(/resolvido pelo próprio gateway/i);
    }
  });

  it("A OUTRA METADE — o corpo com todos os campos conhecidos atravessa inteiro", () => {
    const r = conferirPedido({
      modo: "homologacao",
      sintetico: true,
      funcao: FUNCAO_DO_PILOTO,
      pergunta: "e aí?",
      dossie: { "uma chave qualquer": "um valor" },
      historico: [{ de: "diretor-geral", texto: "oi" }],
      cobrancas: [],
      gatilhos: [],
      correlationId: fioDoConnect("Cantina [TESTE]"),
    });
    expect(r.ok, r.ok ? "" : r.motivo).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// A-4 · ALTA — a releitura provava que a linha existe, não que ela é desta execução
// ═══════════════════════════════════════════════════════════════════════════
describe("A-4 — releitura que devolve linha alheia não vira prova", () => {
  /** O armazém do auditor: grava certo, e na releitura devolve a linha ALHEIA. */
  function armazemQueDevolveLinhaAlheia(): ArmazemDoConnect {
    return {
      ...armazem,
      async relerExecucao() {
        const l = await prisma.execucaoV2.findFirst({ where: { correlationId: FIO_ALHEIO } });
        return {
          id: l!.id,
          funcaoId: l!.funcaoId,
          departamentoId: l!.departamentoId,
          correlationId: l!.correlationId,
          inicio: l!.inicio,
          fim: l!.fim,
          resultado: l!.resultado,
          ator: l!.ator,
          modelo: l!.modelo,
          custoUsd: l!.custoUsd,
          clienteId: l!.clienteId,
        };
      },
    };
  }

  it("⭐ linha de outra função, outro fio, outro cliente e de 2020 NÃO é executado", async () => {
    const r = await despachar(pedidoDoPiloto(), {
      armazem: armazemQueDevolveLinhaAlheia(),
      perfil: PERFIL,
      agora: () => AGORA,
    });

    expect(r.estado, JSON.stringify(r)).toBe("nao_verificavel");
    expect(r.estado).not.toBe("executado");
    if (r.estado !== "nao_verificavel") return;
    expect(r.motivo).toMatch(/NÃO é a desta execução/i);
    expect(r.motivo).toContain(FUNCAO_ALHEIA);
    expect(r.motivo).toContain(CLIENTE_ALHEIO);
  });

  it("⭐ e o artefato ALHEIO não sai na resposta — era o texto do segredo comercial", async () => {
    const r = await despachar(pedidoDoPiloto(), {
      armazem: armazemQueDevolveLinhaAlheia(),
      perfil: PERFIL,
      agora: () => AGORA,
    });
    expect(JSON.stringify(r)).not.toContain(ARTEFATO_ALHEIO);
    expect(JSON.stringify(r)).not.toContain("480.000");
    // E a resposta não carimba `relido_do_banco` numa prova que não é prova.
    expect(JSON.stringify(r)).not.toContain("relido_do_banco");
  });

  it.each([
    ["outro FIO", { correlationId: "connect:outro:00000000-0000-0000-0000-000000000000" }],
    ["outro CLIENTE", { clienteId: "cliente-de-outra-pessoa" }],
    ["outra FUNÇÃO", { funcaoId: "conversational-sdr" }],
    ["outro ID que não é o que eu mandei reler", { id: "id-que-eu-nao-pedi" }],
  ])("cada coordenada sozinha reprova a releitura: %s", async (_caso, adulteracao) => {
    // Uma a uma: a linha é a certa em tudo, MENOS num campo. As quatro têm que
    // morder sozinhas — senão três delas seriam decoração.
    const adulterado: ArmazemDoConnect = {
      ...armazem,
      async relerExecucao(id) {
        const l = await armazem.relerExecucao(id);
        return l ? { ...l, ...adulteracao } : null;
      },
    };
    const r = await despachar(pedidoDoPiloto(), { armazem: adulterado, perfil: PERFIL, agora: () => AGORA });
    expect(r.estado, `a adulteração "${_caso}" passou por prova`).toBe("nao_verificavel");
  });

  it("A OUTRA METADE — a releitura HONESTA continua provando, e a prova volta inteira", async () => {
    const r = await despachar(pedidoDoPiloto(), { armazem, perfil: PERFIL, agora: () => AGORA });
    expect(r.estado, JSON.stringify(r)).toBe("executado");
    if (r.estado !== "executado") return;
    expect(r.prova.relido_do_banco).toBe(true);

    const linha = await prisma.execucaoV2.findUnique({ where: { id: r.execucaoId } });
    expect(linha!.funcaoId).toBe(FUNCAO_DO_PILOTO);
    expect(linha!.clienteId).toBe(atraso.clienteId);
    expect(linha!.correlationId).toBe(r.correlationId);
    expect(r.artefato).toBe(linha!.resultado);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// A-5 · MÉDIA-ALTA — o motivo mentia sobre uma execução que se completou
// ═══════════════════════════════════════════════════════════════════════════
describe("A-5 — estouro DEPOIS do fato: retém, mas não minta sobre o que houve", () => {
  /** O trabalho custa caro. O motor grava, e só então vê o estouro. */
  const custaCaro = async () => ({ saida: JSON.stringify({ a: "resposta longa o bastante para passar" }), custoUsd: 999 });

  it("⭐ continua NÃO sendo sucesso — a segurança não foi relaxada", async () => {
    const r = await despachar(pedidoDoPiloto(), {
      armazem,
      perfil: PERFIL,
      agora: () => AGORA,
      realizar: custaCaro,
    });
    expect(r.estado).toBe("nao_verificavel");
    expect(r.estado).not.toBe("executado");
  });

  it("⭐ e o motivo passa a dizer a verdade: a execução SE COMPLETOU e está gravada", async () => {
    const r = await despachar(pedidoDoPiloto(), {
      armazem,
      perfil: PERFIL,
      agora: () => AGORA,
      realizar: custaCaro,
    });
    if (r.estado !== "nao_verificavel") throw new Error(`estado inesperado: ${r.estado}`);

    // A frase falsa que o auditor mediu, e que não pode voltar:
    expect(r.motivo).not.toMatch(/o acionamento não se completou/i);
    // A frase verdadeira:
    expect(r.motivo).toMatch(/SE COMPLETOU e está gravada/i);
    expect(r.motivo).toMatch(/RETIDA por estourar o limite da ficha/i);
    expect(r.motivo).toContain("999");

    // ⭐ E a resposta ENTREGA o id da linha, para quem lê poder ir olhar em vez
    // de acreditar. Era `null` fixo, e por isso a linha existia escondida.
    expect(r.execucaoId).not.toBeNull();
    const linha = await prisma.execucaoV2.findUnique({ where: { id: r.execucaoId! } });
    expect(linha, "o id devolvido não existe — a resposta mentiria de novo").not.toBeNull();
    expect(linha!.fim).not.toBeNull();
    expect(linha!.custoUsd).toBe(999);
  });

  it("⭐ a natureza é DECLARADA pelo motor, não adivinhada pela prosa", async () => {
    // A variante vizinha: a discriminação antiga era uma regex sobre `motivo`.
    // Uma escalada por REGRA cuja frase começasse com "falha técnica" seria
    // classificada como falha técnica; e o estouro pós-execução, que também vem
    // sem gatilho, era lido como falha técnica. Agora o campo decide.
    const gatilho = "qualquer ação irreversível, gasto ou risco legal";
    const porRegra = await despachar(pedidoDoPiloto({ gatilhos: [gatilho] }), {
      armazem,
      perfil: PERFIL,
      agora: () => AGORA,
    });
    expect(porRegra.estado).toBe("recusado");
    if (porRegra.estado !== "recusado") return;
    expect(porRegra.escalada!.natureza).toBe("regra");
    expect(porRegra.escalada!.registroGravado).toBe(false);
    expect(escaladaEFalhaTecnica(porRegra.escalada!)).toBe(false);
    expect(escaladaEEstouroAposExecucao(porRegra.escalada!)).toBe(false);
  });

  it("A OUTRA METADE — a falha técnica de verdade continua dizendo que não se completou", async () => {
    const r = await despachar(pedidoDoPiloto(), {
      armazem,
      perfil: PERFIL,
      agora: () => AGORA,
      realizar: async () => {
        throw new Error("acionamento cortado de propósito");
      },
    });
    expect(r.estado).toBe("nao_verificavel");
    if (r.estado !== "nao_verificavel") return;
    expect(r.motivo).toMatch(/o acionamento não se completou/i);
    // Aqui NADA foi gravado — e por isso aqui o id É nulo, com razão.
    expect(r.execucaoId).toBeNull();
  });

  it("A OUTRA METADE — o custo dentro do teto executa normalmente", async () => {
    const r = await despachar(pedidoDoPiloto(), { armazem, perfil: PERFIL, agora: () => AGORA });
    expect(r.estado, JSON.stringify(r)).toBe("executado");
    if (r.estado !== "executado") return;
    expect(r.prova.custoUsd).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// A-6 · "fio vazio" e "não consegui ler o fio" param de ter a mesma cara
// ═══════════════════════════════════════════════════════════════════════════
describe("A-6 — a leitura do fio que falha deixa de sumir no silêncio", () => {
  const cego: ArmazemDoConnect = {
    get gravarExecucao() {
      return armazem.gravarExecucao;
    },
    get gravarRecusa() {
      return armazem.gravarRecusa;
    },
    get relerExecucao() {
      return armazem.relerExecucao;
    },
    get clienteDeHomologacao() {
      return armazem.clienteDeHomologacao;
    },
    async antecedentes() {
      throw new Error("banco do fio fora do ar");
    },
  };

  it("⭐ a resposta DIZ que não conseguiu ler — e não finge um fio vazio", async () => {
    const r = await despachar(pedidoDoPiloto(), { armazem: cego, perfil: PERFIL, agora: () => AGORA });
    expect(r.estado, JSON.stringify(r)).toBe("executado");
    expect(r.leitura_do_fio.lido).toBe(false);
    if (r.leitura_do_fio.lido) return;
    expect(r.leitura_do_fio.turnos_anteriores).toBeNull();
    expect(r.leitura_do_fio.motivo).toMatch(/a leitura do fio falhou/i);
    expect(r.leitura_do_fio.motivo).toContain("banco do fio fora do ar");
  });

  it("⭐ e o ARTEFATO também diz, no lugar onde antes aparecia um zero limpo", async () => {
    const r = await despachar(pedidoDoPiloto(), { armazem: cego, perfil: PERFIL, agora: () => AGORA });
    if (r.estado !== "executado") throw new Error(r.estado);
    const artefato = JSON.parse(r.artefato) as { fio: Record<string, unknown>; o_que_falta: string[] };
    expect(artefato.fio.lido).toBe(false);
    expect(artefato.fio.turnos_anteriores).toBeNull(); // era 0 — indistinguível de fio vazio
    expect(String(artefato.fio.leitura)).toMatch(/^FALHOU/);
    expect(artefato.o_que_falta.some((f) => f.includes("o fio não pôde ser lido"))).toBe(true);
  });

  it("A OUTRA METADE — fio de fato VAZIO continua sendo zero, e diz que foi lido", async () => {
    const r = await despachar(pedidoDoPiloto(), { armazem, perfil: PERFIL, agora: () => AGORA });
    expect(r.estado).toBe("executado");
    expect(r.leitura_do_fio.lido).toBe(true);
    if (!r.leitura_do_fio.lido) return;
    expect(r.leitura_do_fio.turnos_anteriores).toBe(0);
    if (r.estado !== "executado") return;
    const artefato = JSON.parse(r.artefato) as { fio: Record<string, unknown> };
    expect(artefato.fio.lido).toBe(true);
    expect(artefato.fio.leitura).toBe("ok");
  });

  it("A OUTRA METADE — perder o fio continua NÃO derrubando o despacho", async () => {
    // O fio é contexto, não portão. Isso era decisão antiga desta porta e não
    // mudou: o que mudou é que agora o fracasso é visível.
    const r = await despachar(pedidoDoPiloto(), { armazem: cego, perfil: PERFIL, agora: () => AGORA });
    expect(r.estado).toBe("executado");
  });
});
