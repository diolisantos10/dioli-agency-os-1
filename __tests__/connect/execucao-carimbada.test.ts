// QUEM EXECUTOU É QUE CARIMBA — a prova, contra banco de verdade.
//
// ─── A MEDIÇÃO QUE ORIGINOU ESTE ARQUIVO ───────────────────────────────────
//
// 30/08/2026, Diretor Geral, sobre o mecanismo de acionamento da plataforma:
// **"ele devolve sucesso e não entrega nada."** Daí a determinação que este
// arquivo existe para provar:
//
//   "O despachante disse ok é proibido como prova. Quem executou é que carimba."
//
// ─── POR QUE SQLITE DE VERDADE, E NÃO MOCK ─────────────────────────────────
//
// A prova aqui é "a linha voltou do banco". Um mock devolve o que o autor do
// mock quis — provaria exatamente nada. Este arquivo sobe um SQLite descartável
// com as migrations reais (mesmo arranjo de `__tests__/v2/homologacao-62.test.ts`),
// planta o atraso com linhas de verdade, e faz o motor de verdade rodar.
//
// ─── O TESTE MAIS IMPORTANTE ESTÁ EM "o acionamento cortado" ───────────────
//
// Lá o acionamento é sabotado de propósito (o trabalho lança) e o teste exige
// que a resposta vire `nao_verificavel` — nunca sucesso, nunca sucesso vazio.
// Ele é o único teste desta suíte que, falhando, invalida a porta inteira.

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PERFIL_DO_PAPEL } from "@/lib/agency/roles";
import { specDaFuncao } from "@/lib/agency/catalogo-v2/specs";
import { executarFuncao, type ContextoDeExecucao } from "@/lib/agency/execucao-v2/executor";
import { armazemDoConnectNoBanco } from "@/lib/agency/connect/armazem-prisma";
import { despachar, ATOR_DO_CONNECT, type ArmazemDoConnect } from "@/lib/agency/connect/despacho";
import { conferirPedido, FUNCAO_DO_PILOTO, type PedidoConferido } from "@/lib/agency/connect/contrato";
import { MOTIVO_SEM_CLIENTE_SINTETICO } from "@/lib/agency/connect/cliente-de-homologacao";
import {
  fabricarAtrasoDoClienteFalso,
  CLIENTE_DO_PILOTO,
  type AtrasoFabricado,
} from "@/lib/agency/connect/atraso-do-cliente-falso";
import { MARCA_DO_CLIENTE_FALSO } from "@/lib/agency/cliente-falso/trava-de-saida";
import { caminhoDeBancoDescartavel, limparArquivosDoBanco } from "../v2/_infra/banco-descartavel";

const CAMINHO_DB = caminhoDeBancoDescartavel("connect-despacho");
let prisma: PrismaClient;
let armazem: ArmazemDoConnect;
let atraso: AtrasoFabricado;

const AGORA = new Date("2026-08-30T15:00:00Z");
const PERFIL = PERFIL_DO_PAPEL.diretor;

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
}, 300_000);

afterAll(async () => {
  await prisma.$disconnect();
  limparArquivosDoBanco(CAMINHO_DB);
});

/** O pedido do caso-piloto, montado pelo MESMO conferidor que a rota usa.
 *  Repare no que sumiu daqui em 30/08/2026: `cliente` e `clienteId`. O pedido
 *  legítimo não carrega cliente nenhum — quem resolve é o gateway. */
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
  if (!conferencia.ok) throw new Error(conferencia.motivo);
  return conferencia.pedido;
}

// ───────────────────────────────────────────────────────────────────────────
describe("o atraso do cliente fictício é fabricado, não simulado no papel", () => {
  it("as linhas existem no banco, carimbadas, e o cliente vive em domínio que não existe", async () => {
    const cliente = await prisma.client.findUnique({ where: { id: atraso.clienteId } });
    expect(cliente?.name).toBe(CLIENTE_DO_PILOTO);
    expect(cliente?.name).toContain(MARCA_DO_CLIENTE_FALSO);
    expect(cliente?.email).toMatch(/\.invalid$/);

    const handoff = await prisma.handoffV2.findUnique({ where: { id: atraso.handoffId } });
    expect(handoff?.status).toBe("aguardando_recebimento");
    expect(handoff?.aceitoEm ?? null).toBeNull();
    const horas = (AGORA.getTime() - handoff!.criadoEm.getTime()) / 3_600_000;
    expect(horas).toBeGreaterThan(4);

    const tarefa = await prisma.task.findUnique({ where: { id: atraso.tarefaId } });
    expect(tarefa?.agentId ?? null).toBeNull(); // sem dono
    expect(tarefa!.dueDate! < "2026-08-30").toBe(true); // prazo no passado
  });

  it("é a VARREDURA REAL do PM que classifica — o dossiê é a saída dela", () => {
    const motivos = atraso.cobrancas.map((c) => c.motivo);
    expect(motivos).toContain("handoff_sem_aceite");
    expect(motivos).toContain("sem_dono");
    expect(atraso.cobrancas[0]!.horasParado).toBeGreaterThan(4);
  });

  it("o fabricador RECUSA cliente sem carimbo e recusa dado não sintético", async () => {
    await expect(
      fabricarAtrasoDoClienteFalso({ db: prisma, agora: AGORA, sintetico: true, cliente: "Padaria do Zé" }),
    ).rejects.toThrow(/carimbo/i);
    await expect(
      fabricarAtrasoDoClienteFalso({ db: prisma, agora: AGORA, sintetico: false }),
    ).rejects.toThrow(/sintetico: true/);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// ⭐ TRAVA 5 do CEO, contra BANCO DE VERDADE: o cliente é resolvido aqui dentro.
// ───────────────────────────────────────────────────────────────────────────
describe("o cliente sintético é resolvido pelo gateway, no banco", () => {
  it("acha o cliente plantado, e as duas condições vêm conferidas na linha lida", async () => {
    const resolvido = await armazem.clienteDeHomologacao();
    expect(resolvido, "o gateway não achou o cliente sintético que ele mesmo planta").not.toBeNull();
    expect(resolvido!.id).toBe(atraso.clienteId);
    expect(resolvido!.nome).toContain(MARCA_DO_CLIENTE_FALSO);
    expect(resolvido!.resolvido_por).toBe("gateway");

    // E a linha do banco cumpre de fato as duas condições que a resolução exige.
    const linha = await prisma.client.findUnique({ where: { id: resolvido!.id } });
    expect(linha!.name).toContain(MARCA_DO_CLIENTE_FALSO);
    expect(linha!.email).toMatch(/\.invalid$/);
  });

  it("⭐ um cliente REAL no mesmo banco NUNCA é escolhido — nem sendo o mais recente", async () => {
    // O pior caso possível: um cliente de verdade, criado DEPOIS do sintético,
    // no mesmo workspace. A ordenação é "mais recente primeiro" — então se a
    // resolução dependesse só da ordem, este seria o escolhido.
    const real = await prisma.client.create({
      data: { workspaceId: atraso.workspaceId, name: "Padaria do Zé", email: "ze@padariadoze.com.br" },
      select: { id: true },
    });

    const resolvido = await armazem.clienteDeHomologacao();
    expect(resolvido!.id, "um cliente real foi escolhido pela porta de homologação").not.toBe(real.id);
    expect(resolvido!.id).toBe(atraso.clienteId);

    // E o despacho inteiro continua gravando o id do sintético, não o do real.
    const r = await despachar(pedidoDoPiloto(), { armazem, perfil: PERFIL, agora: () => AGORA });
    expect(r.estado).toBe("executado");
    if (r.estado !== "executado") return;
    expect(r.cliente.id).toBe(atraso.clienteId);

    await prisma.client.delete({ where: { id: real.id } });
  });

  it("sem cliente sintético nenhum, o despacho RECUSA — não inventa e não segue sem", async () => {
    const semCliente: ArmazemDoConnect = { ...armazem, clienteDeHomologacao: async () => null };
    const r = await despachar(pedidoDoPiloto(), { armazem: semCliente, perfil: PERFIL, agora: () => AGORA });

    expect(r.estado).toBe("recusado");
    if (r.estado !== "recusado") return;
    expect(r.motivo).toBe(MOTIVO_SEM_CLIENTE_SINTETICO);
    expect(r.motivo).toMatch(/permanece fechada/i);
  });

  it("a resolução estourando não vira sucesso: cai em nao_verificavel", async () => {
    const quebrado: ArmazemDoConnect = {
      ...armazem,
      clienteDeHomologacao: async () => {
        throw new Error("banco fora do ar");
      },
    };
    const r = await despachar(pedidoDoPiloto(), { armazem: quebrado, perfil: PERFIL, agora: () => AGORA });
    expect(r.estado).toBe("nao_verificavel");
    if (r.estado !== "nao_verificavel") return;
    expect(r.motivo).toMatch(/resolução do cliente sintético falhou/i);
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe("o caminho legítimo — e o carimbo que volta do banco", () => {
  it("executa de verdade e devolve o identificador da execução", async () => {
    const r = await despachar(pedidoDoPiloto(), { armazem, perfil: PERFIL, agora: () => AGORA });

    expect(r.estado, JSON.stringify(r)).toBe("executado");
    if (r.estado !== "executado") return;

    // A prova NÃO é o retorno da função: é a linha no banco, consultada aqui
    // por fora, com o id que a resposta afirmou.
    const linha = await prisma.execucaoV2.findUnique({ where: { id: r.execucaoId } });
    expect(linha, "o id devolvido não existe em ExecucaoV2 — a resposta mentiria").not.toBeNull();
    expect(linha!.funcaoId).toBe(FUNCAO_DO_PILOTO);
    expect(linha!.departamentoId).toBe("client-service-sdr");
    // ⭐ O id gravado é o que o GATEWAY resolveu no banco — e ele bate com o
    // cliente sintético plantado, sem ninguém ter informado id nenhum.
    expect(linha!.clienteId).toBe(atraso.clienteId);
    expect(r.cliente.id).toBe(atraso.clienteId);
    expect(r.cliente.resolvido_por).toBe("gateway");
    expect(linha!.inicio).toBeInstanceOf(Date);
    expect(linha!.fim).toBeInstanceOf(Date);
    expect(linha!.resultado).toBeTruthy();
    expect(linha!.modelo).toBe(ATOR_DO_CONNECT.modelo);

    // E o que a porta devolveu bate com o que está gravado.
    expect(r.prova.relido_do_banco).toBe(true);
    expect(r.prova.inicio).toBe(linha!.inicio.toISOString());
    expect(r.prova.fim).toBe(linha!.fim!.toISOString());
    expect(r.artefato).toBe(linha!.resultado);
    expect(r.prova.custoUsd).toBe(0); // homologação sintética não gasta
  });

  it("⭐ sonda 16 — a prova PUBLICA de qual execução ela foi relida, contra banco de verdade", async () => {
    // A trava de identidade (as quatro conferências) já existia e não mudou.
    // O que mudou é que a resposta agora deixa um TERCEIRO refazer a
    // conferência: com `execucaoId`, `correlationId` e `funcao` na mão, quem lê
    // consulta `ExecucaoV2` e vê a mesma linha. É isso que este teste faz —
    // consulta o banco por fora, com o que a resposta publicou.
    const r = await despachar(pedidoDoPiloto(), { armazem, perfil: PERFIL, agora: () => AGORA });
    expect(r.estado, JSON.stringify(r)).toBe("executado");
    if (r.estado !== "executado") return;

    expect(r.prova.correlationId, "a prova não diz de qual FIO ela foi relida").toBeTruthy();
    expect(r.prova.funcao, "a prova não diz de qual FUNÇÃO ela foi relida").toBeTruthy();

    // A releitura de fora, feita SÓ com o que a resposta publicou.
    const conferida = await prisma.execucaoV2.findUnique({ where: { id: r.prova.execucaoId } });
    expect(conferida).not.toBeNull();
    expect(conferida!.correlationId).toBe(r.prova.correlationId);
    expect(conferida!.funcaoId).toBe(r.prova.funcao);

    // E a prova não se contradiz com o primeiro nível da resposta.
    expect(r.prova.correlationId).toBe(r.correlationId);
    expect(r.prova.funcao).toBe(r.funcao);
  });

  it("o gerente devolve situação, motivo, próxima ação e prazo — e nomeia a quem delega", async () => {
    const r = await despachar(pedidoDoPiloto(), { armazem, perfil: PERFIL, agora: () => AGORA });
    expect(r.estado).toBe("executado");
    if (r.estado !== "executado") return;

    const artefato = JSON.parse(r.artefato) as Record<string, unknown>;
    expect(artefato.situacao).toMatch(/ATRASADO/);
    expect(String(artefato.motivo)).toMatch(/handoff_sem_aceite|sem_dono/);
    expect(String(artefato.proxima_acao)).toBeTruthy();
    expect(String(artefato.prazo)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    // Delegou a um agente OPERACIONAL do departamento, não a si mesmo.
    const agentes = artefato.agente_de_cada_uma as string[];
    expect(agentes.length).toBeGreaterThan(0);
    expect(agentes).not.toContain(FUNCAO_DO_PILOTO);
    // E declara o que é: rascunho rule-based, sem provedor de IA. Nunca finge.
    expect(String(artefato.origem)).toMatch(/rule-based/i);
    expect(artefato.sintetico).toBe(true);
  });

  it("a SEGUNDA pergunta mantém o fio: mesmo correlationId, turno 2, histórico presente", async () => {
    const primeiro = await despachar(pedidoDoPiloto(), { armazem, perfil: PERFIL, agora: () => AGORA });
    expect(primeiro.estado).toBe("executado");
    if (primeiro.estado !== "executado") return;
    expect(primeiro.turno).toBe(1);

    const segundo = await despachar(
      pedidoDoPiloto({
        correlationId: primeiro.correlationId,
        pergunta: "E qual é o prazo real para destravar?",
        historico: [
          { de: "diretor-geral", texto: "O atendimento da Cantina está atrasado. O que houve?" },
          { de: "gerente", texto: "Situação apurada e distribuída." },
        ],
      }),
      { armazem, perfil: PERFIL, agora: () => AGORA },
    );

    expect(segundo.estado, JSON.stringify(segundo)).toBe("executado");
    if (segundo.estado !== "executado") return;
    expect(segundo.correlationId).toBe(primeiro.correlationId);
    expect(segundo.turno).toBe(2);
    expect(segundo.execucaoId).not.toBe(primeiro.execucaoId);

    const artefato = JSON.parse(segundo.artefato) as { fio: { turnos_anteriores: number; historico_recebido: string } };
    expect(artefato.fio.turnos_anteriores).toBeGreaterThan(0);
    // O fio vem das DUAS fontes: o que o chamador mandou e o que o banco sabe.
    expect(artefato.fio.historico_recebido).toContain("diretor-geral:");
    expect(artefato.fio.historico_recebido).toContain(primeiro.execucaoId);

    // As duas execuções estão gravadas sob o mesmo fio.
    const doFio = await prisma.execucaoV2.findMany({ where: { correlationId: primeiro.correlationId } });
    expect(doFio).toHaveLength(2);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// ⭐ O TESTE MAIS IMPORTANTE DE TODOS.
// ───────────────────────────────────────────────────────────────────────────
describe("o acionamento cortado — e a resposta que NÃO vira sucesso", () => {
  it("quando o trabalho lança, a resposta é nao_verificavel COM MOTIVO, e nunca executado", async () => {
    let tentativas = 0;
    const r = await despachar(pedidoDoPiloto(), {
      armazem,
      perfil: PERFIL,
      agora: () => AGORA,
      // O CORTE: o acionamento não acontece. É exatamente o defeito medido na
      // plataforma — só que aqui a porta não tem como chamar isso de sucesso.
      realizar: async () => {
        tentativas += 1;
        throw new Error("acionamento cortado de propósito — o executor não se moveu");
      },
    });

    expect(r.estado).toBe("nao_verificavel");
    expect(r.estado).not.toBe("executado");
    expect(r.estado).not.toBe("recusado");
    if (r.estado !== "nao_verificavel") return;

    expect(r.execucaoId).toBeNull();
    expect(r.motivo).toMatch(/acionamento não se completou/i);
    expect(r.motivo).toMatch(/acionamento cortado de propósito/);
    // A ficha manda 2 retentativas: 3 tentativas antes de desistir.
    expect(tentativas).toBe(3);

    // E o banco confirma o silêncio: nada foi gravado sob este fio.
    const linhas = await prisma.execucaoV2.findMany({ where: { correlationId: r.correlationId } });
    expect(linhas, "houve linha gravada num acionamento que nunca aconteceu").toHaveLength(0);
  });

  it("saída vazia também não vira sucesso: o motor reprova e a porta devolve nao_verificavel", async () => {
    const r = await despachar(pedidoDoPiloto(), {
      armazem,
      perfil: PERFIL,
      agora: () => AGORA,
      realizar: async () => ({ saida: "  ", custoUsd: 0 }),
    });
    expect(r.estado).toBe("nao_verificavel");
    if (r.estado !== "nao_verificavel") return;
    expect(r.motivo).toMatch(/vazia|curta/i);
  });

  it('"eu gravei" não é prova: id que não volta do banco vira nao_verificavel', async () => {
    // O armazém MENTE: diz que gravou, devolve um id, e o id não existe. É o
    // despachante otimista que a determinação do CEO proíbe.
    const mentiroso: ArmazemDoConnect = {
      ...armazem,
      gravarExecucao: async () => ({ id: "id-que-nunca-existiu" }),
    };
    const r = await despachar(pedidoDoPiloto(), { armazem: mentiroso, perfil: PERFIL, agora: () => AGORA });
    expect(r.estado).toBe("nao_verificavel");
    if (r.estado !== "nao_verificavel") return;
    expect(r.motivo).toMatch(/não voltou do banco/i);
  });

  it("execução gravada pela metade (sem fim) também não é sucesso", async () => {
    const semFim: ArmazemDoConnect = {
      ...armazem,
      relerExecucao: async (id) => {
        const l = await armazem.relerExecucao(id);
        return l ? { ...l, fim: null } : null;
      },
    };
    const r = await despachar(pedidoDoPiloto(), { armazem: semFim, perfil: PERFIL, agora: () => AGORA });
    expect(r.estado).toBe("nao_verificavel");
    if (r.estado !== "nao_verificavel") return;
    expect(r.motivo).toMatch(/sem fim ou sem resultado/i);
  });

  it("o motor explodindo por inteiro também não vira sucesso", async () => {
    const r = await despachar(pedidoDoPiloto(), {
      armazem,
      perfil: PERFIL,
      agora: () => AGORA,
      executar: async () => {
        throw new Error("o executor explodiu");
      },
    });
    expect(r.estado).toBe("nao_verificavel");
    if (r.estado !== "nao_verificavel") return;
    expect(r.motivo).toMatch(/lançou antes de concluir/i);
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe("as recusas nomeadas, pelo núcleo", () => {
  it("ficha inexistente: recusa com nome, e o rastro da recusa fica no banco", async () => {
    // ⚠️ O pedido é montado À MÃO, sem passar pelo conferidor, DE PROPÓSITO.
    // Desde 30/08/2026 a lista de uma (`FUNCOES_PERMITIDAS`) barra qualquer
    // outra função no contrato, antes do motor — então o único jeito de ainda
    // provar que o MOTOR recusa ficha inexistente e grava o rastro é entrar por
    // baixo da trava de entrada. As duas camadas ficam cobertas: a de fora em
    // `a-porta-do-connect.test.ts`, esta aqui.
    const antes = await prisma.recusaV2.count();
    const r = await despachar({ ...pedidoDoPiloto(), funcao: "cargo-inventado" }, {
      armazem,
      perfil: PERFIL,
      agora: () => AGORA,
    });
    expect(r.estado).toBe("recusado");
    if (r.estado !== "recusado") return;
    expect(r.motivo).toContain("cargo-inventado");
    expect(r.recusaId).toBeTruthy();
    expect(await prisma.recusaV2.count()).toBe(antes + 1);
  });

  it("gatilho humano da ficha escala — e escalada por regra NÃO é sucesso", async () => {
    const gatilho = "qualquer ação irreversível, gasto ou risco legal";
    const r = await despachar(pedidoDoPiloto({ gatilhos: [gatilho] }), {
      armazem,
      perfil: PERFIL,
      agora: () => AGORA,
    });
    expect(r.estado).toBe("recusado");
    if (r.estado !== "recusado") return;
    expect(r.motivo).toMatch(/escalado para humano/i);
    expect(r.escalada?.gatilhos).toContain(gatilho);
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe("nenhuma ficha foi ligada, e produção continua fechada", () => {
  it('a ficha do gerente segue "ativa": false no disco', () => {
    const ficha = fs.readFileSync(
      path.join(process.cwd(), "agentes", "linha", "client-service-sdr", `${FUNCAO_DO_PILOTO}.md`),
      "utf8",
    );
    expect(ficha).toContain('"ativa": false');
    const spec = specDaFuncao(FUNCAO_DO_PILOTO);
    expect(spec.ok && spec.spec.ativa).toBe(false);
  });

  it("a MESMA função em produção é recusada pelo motor — o corredor é só o de homologação", async () => {
    const spec = specDaFuncao(FUNCAO_DO_PILOTO);
    if (!spec.ok) throw new Error(spec.motivo);
    const contexto: ContextoDeExecucao = {
      modo: "producao",
      entradas: Object.fromEntries(spec.spec.entradas_obrigatorias.map((e) => [e, "conteúdo sintético"])),
      ferramentasPrevistas: [],
      custoPrevistoUsd: 0,
      correlationId: "connect:prova-de-producao",
      escopos: [atraso.clienteId],
    };
    const r = await executarFuncao(FUNCAO_DO_PILOTO, PERFIL, contexto, ATOR_DO_CONNECT, {
      async flagLigada() {
        return false;
      },
      async gravarExecucao() {},
      async realizar() {
        throw new Error("não deveria chegar aqui");
      },
      agora: () => AGORA,
    });
    expect(r.decisao).toBe("recusado");
    if (r.decisao !== "recusado") return;
    expect(r.motivo).toMatch(/DESLIGADA na ficha/);
  });

  it("o despacho SEMPRE monta o contexto em homologação sintética — a segunda trava, no motor", async () => {
    let visto: ContextoDeExecucao | null = null;
    await despachar(pedidoDoPiloto(), {
      armazem,
      perfil: PERFIL,
      agora: () => AGORA,
      executar: async (_f, _p, contexto) => {
        visto = contexto;
        return { decisao: "recusado", motivo: "parei aqui de propósito" };
      },
    });
    expect(visto).not.toBeNull();
    const c = visto! as ContextoDeExecucao;
    expect(c.modo).toBe("homologacao");
    expect(c.sintetico).toBe(true);
    expect(c.efeito).toBe("informar"); // o menor efeito que existe
    expect(c.ferramentasPrevistas).toEqual([]); // não toca o mundo
    expect(c.custoPrevistoUsd).toBe(0);
  });
});
