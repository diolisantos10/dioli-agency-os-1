import { describe, it, expect, beforeEach, vi } from "vitest";
import { escadaToda } from "../_escada";

const db = vi.hoisted(() => ({
  project: { findUnique: vi.fn(), update: vi.fn() },
  cycle: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), create: vi.fn() },
  socialPost: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
  metaConnection: { findFirst: vi.fn() },
  adCampaign: { findMany: vi.fn() },
  activityEvent: { create: vi.fn() },
  departmentLadder: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  deliverable: { findMany: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
  approvalRequest: { updateMany: vi.fn() },
  portalMessage: { create: vi.fn() },
  task: { findMany: vi.fn() },
  // A virada do mês lê a verdade OPERACIONAL do cliente (horário, área de
  // entrega, canal) para o piso poder conferir o que o relatório afirma. Sem
  // estes três no mock, `virarOMes` estourava antes de medir — e o teste
  // acusaria "a virada quebrou" quando o que faltava era o dublê.
  clientRequestDb: { findUnique: vi.fn() },
  client: { findUnique: vi.fn() },
  brandBrain: { findUnique: vi.fn() },
}));
const generate = vi.hoisted(() => vi.fn());
const lerMetricasDaConta = vi.hoisted(() => vi.fn());
const fecharCiclo = vi.hoisted(() => vi.fn());
const falarComOCliente = vi.hoisted(() => vi.fn());
const auditDeliverable = vi.hoisted(() => vi.fn());

// O relatório mensal passa por ÁRBITRO desde 04/08/2026. O tradutor
// veredito→banco (`revisionStatusDoVeredito`) fica REAL de propósito.
vi.mock("@/lib/agency/execution/quality-auditor", async (orig) => ({
  ...(await orig<typeof import("@/lib/agency/execution/quality-auditor")>()),
  auditDeliverable,
}));
vi.mock("@/lib/db/client", () => ({ prisma: db }));

// ── O PORTÃO DE MARCA (15/08/2026) — POR QUE ESTE DUBLÊ EXISTE ──────────────
// `escadaFiltraEntregas` passou a consultar a régua de marca antes do degrau
// (ordem do CEO: "marca sem régua, peça não sai"). Com o prisma dublado, a
// leitura da ficha falha e o fail-closed reteria TUDO — mascarando o que este
// arquivo mede. Só o VEREDITO é dublado; o resto do módulo continua real.
// O portão tem prova própria, com as duas metades, em
// `__tests__/esteira/portao-de-marca-na-entrega.test.ts`.
vi.mock("@/lib/agency/esteira/contrato-de-marca", async (original) => ({
  ...(await original<typeof import("@/lib/agency/esteira/contrato-de-marca")>()),
  portaoDeMarca: vi.fn(async () => ({ pode: true, motivo: "" })),
}));

vi.mock("@/lib/ai/generate", () => ({ generate }));
vi.mock("@/lib/integrations/meta/leitura", () => ({ lerMetricasDaConta }));
vi.mock("@/lib/agency/esteira/marcos", () => ({ falarComOCliente }));
vi.mock("@/lib/agency/esteira/ciclos", async (orig) => ({
  ...(await orig<Record<string, unknown>>()),
  fecharCiclo,
}));

import {
  medirOMes, escreverRelatorio, virarOMes, apresentarCiclo,
  numerosComparaveis, compararComOMesAnterior, mesmaBaseDeMedicao, versaoDaMedicao,
  metricasForaDaComparacao, VERSAO_DA_MEDICAO, trechoComRessalva,
} from "@/lib/agency/esteira/mes";

const CICLO = {
  id: "cy1", referencia: "2026-07", status: "aberto" as const,
  comeca: "2026-07-01", termina: "2026-07-31",
  itens: [{ agentId: "a3", titulo: "Pacote de social" }], resumo: null,
};

const VERDADE = { businessName: "Padaria do João", telefones: [], emails: [], servicos: [], valores: [] };

beforeEach(() => {
  vi.clearAllMocks();
  db.project.findUnique.mockResolvedValue({
    id: "p1", workspaceId: "ws1", clientId: "c1", clientRequestId: "cr1",
    client: { name: "Padaria do João", phone: null, email: null },
  });
  db.project.update.mockResolvedValue({});
  // Cliente sem verdade operacional gravada: o piso trata tudo como "não
  // informado" e barra quem AFIRMAR horário/área/canal. O relatório genérico
  // destes testes não afirma nada disso — e é essa a metade que prova que a
  // trava não mata o fluxo bom.
  db.clientRequestDb.findUnique.mockResolvedValue(null);
  db.client.findUnique.mockResolvedValue(null);
  db.brandBrain.findUnique.mockResolvedValue(null);
  db.socialPost.count.mockResolvedValue(8);
  db.metaConnection.findFirst.mockResolvedValue({ id: "mc1" });
  db.adCampaign.findMany.mockResolvedValue([]);
  db.cycle.findFirst.mockResolvedValue(null);
  db.activityEvent.create.mockResolvedValue({});
  db.departmentLadder.findMany.mockResolvedValue(escadaToda("wide"));
  db.deliverable.create.mockResolvedValue({ id: "d9" });
  db.deliverable.updateMany.mockResolvedValue({});
  db.cycle.update.mockResolvedValue({});
  lerMetricasDaConta.mockResolvedValue({
    ok: true,
    perfil: { seguidores: 812, totalDePosts: 96 },
    periodo: { desde: "2026-07-01", ate: "2026-07-31" },
    totais: { alcance: 4200, visualizacoes: 9100, contasComEngajamento: 250, interacoes: 310 },
    alcanceOrigem: "unicas_no_periodo",
    serie: [{ data: "2026-07-01", alcance: 4200 }],
  });
  fecharCiclo.mockResolvedValue({ fechado: true, proximo: { referencia: "2026-08", id: "cy2" } });
  falarComOCliente.mockResolvedValue(true);
  auditDeliverable.mockResolvedValue({ verdict: "aprovado", issues: [], note: "números sustentados" });
  generate.mockResolvedValue({
    ok: true,
    data: {
      title: "Relatório de julho",
      summary: "Publicamos 8 posts e o alcance foi de 4.200 contas.",
      items: [{ headline: "Alcance", note: "4.200 contas alcançadas no mês." }],
    },
  });
});

describe("medir o mês: null é 'não sei', zero é 'medi e deu zero'", () => {
  it("mede o que foi publicado e o que a Meta devolveu", async () => {
    const m = await medirOMes("p1", CICLO);
    expect(m.postsPublicados).toBe(8);
    expect(m.alcance).toBe(4200);
    expect(m.porQueNaoMediu).toBeNull();
  });

  it("sem Instagram conectado, não mede — e diz por quê", async () => {
    // O estado vem da camada de leitura, que resolve cliente→conexão.
    lerMetricasDaConta.mockResolvedValue({ ok: false, error: "o cliente ainda não conectou o Instagram", semConexao: true });
    const m = await medirOMes("p1", CICLO);
    expect(m.alcance).toBeNull();
    expect(m.porQueNaoMediu).toMatch(/não conectou/);
  });

  it("Meta fora do ar não vira zero — vira 'não medido'", async () => {
    // Confundir os dois é o começo de um relatório que mente: zero alcance é
    // uma notícia terrível, "não medi" é um problema técnico.
    lerMetricasDaConta.mockResolvedValue({ ok: false, error: "token expirado", precisaReconectar: true });
    const m = await medirOMes("p1", CICLO);
    expect(m.alcance).toBeNull();
    expect(m.porQueNaoMediu).toBe("token expirado");
  });
});

describe("o relatório só pode usar o que foi medido", () => {
  const medicao = {
    postsPublicados: 8, postsAgendadosNaoPublicados: 0,
    alcance: 4200, visualizacoes: 9100, seguidores: 812, engajamento: 310,
    pago: null, porQueNaoMediu: null,
  };

  it("os números entregues à IA são exatamente os medidos", async () => {
    await escreverRelatorio({
      workspaceId: "ws1", nomeDoNegocio: "Padaria do João", referencia: "2026-07",
      medicao, planoDoMes: ["Pacote de social"], verdade: VERDADE,
      mesAtual: numerosComparaveis(medicao),
    });
    const prompt = generate.mock.calls[0]![0].user as string;
    expect(prompt).toContain("Alcance: 4200");
    expect(generate.mock.calls[0]![0].system).toMatch(/PROIBIDO inventar/);
  });

  it("quando não mediu, a IA é mandada dizer isso — e proibida de estimar", async () => {
    await escreverRelatorio({
      workspaceId: "ws1", nomeDoNegocio: "Padaria do João", referencia: "2026-07",
      medicao: { ...medicao, alcance: null, visualizacoes: null, seguidores: null, engajamento: null, porQueNaoMediu: "token expirado" },
      planoDoMes: [], verdade: VERDADE, mesAtual: numerosComparaveis({ ...medicao, alcance: null }),
    });
    const prompt = generate.mock.calls[0]![0].user as string;
    expect(prompt).toMatch(/NÃO foram medidas/);
    expect(prompt).toMatch(/NÃO estime/);
  });

  it("relatório que inventa telefone é reprovado pelo piso — nem chega ao cliente", async () => {
    generate.mockResolvedValue({
      ok: true,
      data: {
        title: "Relatório", summary: "Um mês forte para a padaria, com bom volume de publicações no período.",
        items: [{ headline: "Contato", note: "Ligue para (11) 98888-7777 e fale com a gente sobre os resultados." }],
      },
    });
    const r = await escreverRelatorio({
      workspaceId: "ws1", nomeDoNegocio: "Padaria do João", referencia: "2026-07",
      medicao, planoDoMes: [], verdade: VERDADE, mesAtual: numerosComparaveis(medicao),
    });
    expect(r).toBeNull();
  });
});

describe("a virada do mês — sem ela o cliente vitalício recebia uma entrega na vida", () => {
  it("mede, grava o relatório, fecha o ciclo e abre o próximo", async () => {
    const r = await virarOMes("p1", CICLO);
    expect(r.relatorioEntregue).toBe(true);
    expect(r.proximaReferencia).toBe("2026-08");
    expect(fecharCiclo).toHaveBeenCalledOnce();
  });

  it("o relatório é gravado NO CICLO que fechou — senão a competência se perde", async () => {
    await virarOMes("p1", CICLO);
    expect(db.deliverable.create.mock.calls[0]![0].data.cycleId).toBe("cy1");
    expect(db.deliverable.create.mock.calls[0]![0].data.type).toBe("report");
  });

  it("mês novo aberto → o projeto volta para a fila de produção (a folha em branco)", async () => {
    await virarOMes("p1", CICLO);
    const dados = db.project.update.mock.calls[0]![0].data;
    expect(dados.executionStatus).toBe("pending");
    expect(dados.executionAttempts).toBe(0);
  });

  it("IA fora do ar NÃO impede o fechamento — a operação não para por uma frase", async () => {
    generate.mockResolvedValue({ ok: false, error: "sem provedor" });
    const r = await virarOMes("p1", CICLO);
    expect(r.relatorioEntregue).toBe(false);
    expect(fecharCiclo).toHaveBeenCalledOnce();
    expect(r.proximaReferencia).toBe("2026-08");
  });

  // 6ª auditoria (04/08/2026): antes, sem relatório o cliente não recebia NADA.
  // Segurar o texto é certo; sumir o mês inteiro é o bug de silêncio que esta
  // casa já pagou duas vezes. A frase neutra não afirma número nenhum.
  it("sem relatório, o cliente recebe uma frase neutra — não o silêncio", async () => {
    generate.mockResolvedValue({ ok: false, error: "sem provedor" });
    await virarOMes("p1", CICLO);
    expect(falarComOCliente).toHaveBeenCalledOnce();
    const corpo = falarComOCliente.mock.calls[0]![1] as string;
    expect(corpo).toContain("2026-07");
    expect(corpo).toMatch(/sendo finalizado/);
    expect(corpo, "frase neutra não afirma resultado").not.toMatch(/\d{1,3}\.\d{3}|cresc/i);
  });
});

// ── O RELATÓRIO MENSAL PASSA POR ÁRBITRO (5ª auditoria, 04/08/2026) ─────────
//
// Esta peça nascia `quality_ok` sem NUNCA ter sido auditada. É a peça que o
// cliente mais lê e a única com a qual ele decide se continua pagando — afirma
// números, compara com o mês anterior e explica queda. Era a peça mais exposta
// da casa e a única fora do alcance do juiz. Custo do conserto: uma chamada de
// IA por projeto por mês.
describe("o relatório mensal é AUDITADO de verdade — não se auto-aprova", () => {
  it("o árbitro é chamado com o relatório inteiro, não com um resumo", async () => {
    await virarOMes("p1", CICLO);
    expect(auditDeliverable).toHaveBeenCalledTimes(1);
    const pedido = auditDeliverable.mock.calls[0]![0];
    expect(pedido.content).toContain("4.200");
    expect(pedido.brandContext, "o juiz precisa saber que todo número aqui foi medido").toMatch(/medido, não estimado/);
  });

  it("METADE 1 — aprovado pelo árbitro → `quality_ok` e o cliente recebe", async () => {
    const r = await virarOMes("p1", CICLO);
    expect(db.deliverable.create.mock.calls[0]![0].data.revisionStatus).toBe("quality_ok");
    expect(r.relatorioEntregue).toBe(true);
    expect(falarComOCliente).toHaveBeenCalled();
  });

  it("METADE 2 — REPROVADO pelo árbitro → o TEXTO não vai ao cliente, nem em trecho", async () => {
    auditDeliverable.mockResolvedValue({ verdict: "reprovado", issues: ["afirma crescimento que os números não mostram"], note: "" });
    const r = await virarOMes("p1", CICLO);

    expect(db.deliverable.create.mock.calls[0]![0].data.revisionStatus).toBe("quality_flag");
    expect(r.relatorioEntregue, "reprovado não é entregue").toBe(false);

    // O freio é sobre o TEXTO barrado, não sobre a existência da conversa.
    // Sumir o mês inteiro (6ª auditoria, 04/08/2026) trocava um erro por outro:
    // o cliente pagante fecharia o mês sem uma palavra da agência.
    const corpo = falarComOCliente.mock.calls[0]![1] as string;
    expect(corpo, "nem um trecho do relatório barrado").not.toMatch(/4\.200|8 posts/);
    expect(corpo, "nem a briga interna").not.toMatch(/reprovad|Qualidade/i);
    expect(corpo).toMatch(/revisão final/);
  });

  it("reprovado CHAMA GENTE — barrar em silêncio seria o mesmo buraco de antes", async () => {
    auditDeliverable.mockResolvedValue({ verdict: "reprovado", issues: ["número sem base"], note: "" });
    await virarOMes("p1", CICLO);
    const eventos = db.activityEvent.create.mock.calls.map((c) => c[0].data.type as string);
    expect(eventos).toContain("relatorio_reprovado");
  });

  it("reprovado NÃO trava a operação: o ciclo fecha e o mês novo nasce", async () => {
    auditDeliverable.mockResolvedValue({ verdict: "reprovado", issues: ["x"], note: "" });
    const r = await virarOMes("p1", CICLO);
    expect(fecharCiclo).toHaveBeenCalledOnce();
    expect(r.proximaReferencia).toBe("2026-08");
  });

  it("texto reprovado também não vira o resumo do ciclo — as telas leem isso", async () => {
    auditDeliverable.mockResolvedValue({ verdict: "reprovado", issues: ["x"], note: "" });
    await virarOMes("p1", CICLO);
    expect(fecharCiclo.mock.calls[0]![0].resumo).toMatch(/barrado pela Qualidade/);
  });

  it("árbitro INDISPONÍVEL: entrega, mas gravada como `quality_nao_auditado` — nunca como aprovada", async () => {
    // Indisponibilidade não bloqueia (a operação não pode parar porque um
    // provedor caiu), mas o estado fica declarado e contável.
    auditDeliverable.mockResolvedValue({ verdict: "nao_auditado", issues: [], note: "NÃO AUDITADA: a IA caiu.", motivo: "ia_indisponivel" });
    const r = await virarOMes("p1", CICLO);
    expect(db.deliverable.create.mock.calls[0]![0].data.revisionStatus).toBe("quality_nao_auditado");
    expect(r.relatorioEntregue).toBe(true);
  });

  it("auditoria que ESTOURA vira 'ninguém olhou', jamais 'está bom'", async () => {
    auditDeliverable.mockRejectedValue(new Error("boom"));
    await virarOMes("p1", CICLO);
    expect(db.deliverable.create.mock.calls[0]![0].data.revisionStatus).toBe("quality_nao_auditado");
    expect(fecharCiclo, "e a virada do mês não cai por causa disso").toHaveBeenCalledOnce();
  });
});

describe("apresentar o pacote do mês", () => {
  beforeEach(() => {
    db.cycle.findUnique.mockResolvedValue({ id: "cy2", reference: "2026-08", presentedAt: null });
    db.deliverable.findMany.mockResolvedValue([{ id: "d1", name: "Calendário de agosto", revisionStatus: "quality_ok", ownerAgentId: "a3" }]);
    db.approvalRequest.updateMany.mockResolvedValue({});
    db.socialPost.findMany.mockResolvedValue([]);
    db.socialPost.findFirst.mockResolvedValue(null);
  });

  it("o carimbo é DO CICLO — senão o mês 2 nunca seria apresentado", async () => {
    const r = await apresentarCiclo("p1", "cy2");
    expect(r.ok).toBe(true);
    expect(db.cycle.update.mock.calls[0]![0].data.presentedAt).toBeInstanceOf(Date);
  });

  it("apresentar É o ato de compartilhar: as entregas do ciclo viram 'compartilhado'", async () => {
    // Sem este carimbo o portal, que agora filtra por `visibility` fail-closed,
    // mostraria o card de aprovação sem o corpo da entrega (Hub, Lote 1).
    await apresentarCiclo("p1", "cy2");
    // Por LISTA DE IDS: quem escolhe quais é a escada de exposição. Neste teste
    // o departamento está em `wide` e a entrega legítima passa sem atrito.
    expect(db.deliverable.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: { in: ["d1"] } },
      data: { visibility: "compartilhado" },
    }));
  });

  it("ciclo já apresentado não apresenta de novo", async () => {
    db.cycle.findUnique.mockResolvedValue({ id: "cy2", reference: "2026-08", presentedAt: new Date() });
    const r = await apresentarCiclo("p1", "cy2");
    expect(r.ok).toBe(true);
    expect(db.cycle.update).not.toHaveBeenCalled();
  });

  it("peça com ressalva da Qualidade não vai ao cliente sozinha", async () => {
    db.deliverable.findMany.mockResolvedValue([{ id: "d1", name: "X", revisionStatus: "quality_flag" }]);
    const r = await apresentarCiclo("p1", "cy2");
    expect(r.ok).toBe(false);
    expect(r.erro).toMatch(/ressalva/);
  });

  it("ciclo sem nenhuma entrega não é apresentado", async () => {
    db.deliverable.findMany.mockResolvedValue([]);
    const r = await apresentarCiclo("p1", "cy2");
    expect(r.ok).toBe(false);
  });
});

describe("'agosto foi melhor que julho' — a frase que segura cliente por anos", () => {
  const medicao = {
    postsPublicados: 8, postsAgendadosNaoPublicados: 0,
    alcance: 5200, visualizacoes: 9100, seguidores: 812, engajamento: 310,
    pago: null, porQueNaoMediu: null,
  };

  it("a comparação chega à IA JÁ CALCULADA, e ela é proibida de recalcular", async () => {
    await escreverRelatorio({
      workspaceId: "ws1", nomeDoNegocio: "Padaria do João", referencia: "2026-08",
      medicao, planoDoMes: [], verdade: VERDADE, mesAtual: numerosComparaveis(medicao),
      mesAnterior: { alcance: 4000, "posts publicados": 8, seguidores: 800, engajamento: 300 },
      referenciaAnterior: "2026-07",
    });
    const prompt = generate.mock.calls[0]![0].user as string;
    expect(prompt).toContain("+30%");
    expect(prompt).toMatch(/PROIBIDO recalcular/);
  });

  it("primeiro ciclo diz que não há base — não inventa evolução", async () => {
    await escreverRelatorio({
      workspaceId: "ws1", nomeDoNegocio: "Padaria do João", referencia: "2026-07",
      medicao, planoDoMes: [], verdade: VERDADE, mesAnterior: null,
      mesAtual: numerosComparaveis(medicao),
    });
    const prompt = generate.mock.calls[0]![0].user as string;
    expect(prompt).toMatch(/NÃO há mês anterior/);
    expect(prompt).toMatch(/NÃO invente evolução/);
  });

  it("o que piorou é mandado dizer com todas as letras", async () => {
    await escreverRelatorio({
      workspaceId: "ws1", nomeDoNegocio: "Padaria do João", referencia: "2026-08",
      medicao: { ...medicao, alcance: 2000 }, planoDoMes: [], verdade: VERDADE,
      mesAtual: numerosComparaveis({ ...medicao, alcance: 2000 }),
      mesAnterior: { alcance: 4000 }, referenciaAnterior: "2026-07",
    });
    const prompt = generate.mock.calls[0]![0].user as string;
    expect(prompt).toMatch(/O QUE PIOROU/);
    expect(prompt).toMatch(/Esconder queda/);
  });
});

describe("a virada busca o mês passado e alerta o time", () => {
  beforeEach(() => {
    db.cycle.findFirst.mockResolvedValue({
      reference: "2026-06",
      // MESMA base de medição do mês atual (v2, alcance deduplicado) — é o que
      // torna a comparação legítima. O caso de bases diferentes tem teste próprio.
      resultsJson: JSON.stringify({
        schemaVersao: 2, alcanceOrigem: "unicas_no_periodo",
        postsPublicados: 8, alcance: 9000, seguidores: 900, engajamento: 400, pago: null,
      }),
    });
    db.activityEvent = { create: vi.fn().mockResolvedValue({}) };
  });

  it("lê os resultados do ciclo fechado anterior", async () => {
    await virarOMes("p1", CICLO);
    expect(db.cycle.findFirst.mock.calls[0]![0].where.status).toBe("fechado");
    const prompt = generate.mock.calls[0]![0].user as string;
    expect(prompt).toContain("2026-06");
  });

  it("queda vira alerta interno — o time sabe ANTES do cliente reclamar", async () => {
    // Alcance de 9000 (junho) para 4200 (julho, do lerMetricasDaConta mockado).
    await virarOMes("p1", CICLO);
    const evento = db.activityEvent.create.mock.calls[0]![0].data;
    expect(evento.type).toBe("queda_no_ciclo");
    expect(evento.message).toMatch(/Alcance/);
  });

  it("sem ciclo anterior, nenhum alerta falso é disparado", async () => {
    db.cycle.findFirst.mockResolvedValue(null);
    await virarOMes("p1", CICLO);
    expect(db.activityEvent.create).not.toHaveBeenCalled();
  });
});

// ── A TRAVA DO "+2694%" ─────────────────────────────────────────────────────
// Até 04/08/2026 `alcance` era o reach de UM DIA; virou o reach do CICLO
// INTEIRO. Julho gravou 340 (um dia), agosto gravaria 9.500 (31 dias), e o
// relatório entregue a um cliente pagante anunciaria "+2694%" — sem revisão
// humana, isso chega nele. Comparar bases diferentes é mentir com gráfico.
describe("versão da medição: o mês passado medido noutra régua NÃO vira percentual", () => {
  const v1 = JSON.stringify({
    // ciclo antigo: nenhum `schemaVersao` gravado — é v1 por definição
    postsPublicados: 8, alcance: 340, seguidores: 900, engajamento: null, pago: null,
  });

  it("medição nova nasce carimbada com a versão da base", async () => {
    const m = await medirOMes("p1", CICLO);
    expect(versaoDaMedicao(m)).toBe(VERSAO_DA_MEDICAO);
    expect(m.alcanceOrigem).toBe("unicas_no_periodo");
  });

  it("ciclo anterior v1 + atual v2 → NENHUMA linha de percentual de alcance", async () => {
    db.cycle.findFirst.mockResolvedValue({ reference: "2026-06", resultsJson: v1 });
    await virarOMes("p1", CICLO);
    const prompt = generate.mock.calls[0]![0].user as string;
    const blocoDaComparacao = prompt.slice(prompt.indexOf("COMPARAÇÃO COM"));
    expect(blocoDaComparacao).not.toMatch(/Alcance:.*%/);
    expect(blocoDaComparacao).not.toContain("1135.3%"); // 340 → 4200
    expect(blocoDaComparacao).not.toMatch(/Engajamento:.*%/);
  });

  it("a IA é mandada dizer por que a comparação não existe — mas mandar não é garantir", async () => {
    db.cycle.findFirst.mockResolvedValue({ reference: "2026-06", resultsJson: v1 });
    await virarOMes("p1", CICLO);
    const prompt = generate.mock.calls[0]![0].user as string;
    expect(prompt).toMatch(/MÉTRICAS FORA DA COMPARAÇÃO/);
  });

  // ESTE é o teste que importa: a IA IGNORA a instrução (o mock devolve um
  // texto que não fala em base de medição nenhuma) e a ressalva TEM que estar
  // no documento que o cliente lê. Sem ela, ele tem o relatório de julho na
  // mão, vê 9.500 em agosto e faz o "+2694%" na própria cabeça — e a agência
  // nunca desmentiu.
  it("a ressalva está no ENTREGÁVEL mesmo quando a IA não a escreve", async () => {
    db.cycle.findFirst.mockResolvedValue({ reference: "2026-06", resultsJson: v1 });
    generate.mockResolvedValue({
      ok: true,
      data: {
        title: "Relatório de julho",
        summary: "Foi um mês de bom volume de publicações e o alcance cresceu bastante em relação ao período anterior.",
        items: [{ headline: "Alcance", note: "4.200 contas alcançadas no mês, um salto forte." }],
      },
    });
    await virarOMes("p1", CICLO);

    const corpo = String(db.deliverable.create.mock.calls[0]![0].data.content);
    expect(corpo).toContain("alcance e engajamento não entram na comparação");
    expect(corpo).toMatch(/não são comparáveis entre si/);
    expect(corpo).toMatch(/começa no mês que vem/);
    // E a mensagem que vai ao cliente sai do mesmo corpo.
    expect(String(falarComOCliente.mock.calls[0]![1])).toContain("não entram na comparação");
  });

  // O bug que este teste existe para impedir: a ressalva mora no FIM do corpo,
  // e a mensagem levava `corpo.slice(0, 900)`. Com relatório curto (o mock do
  // teste acima) ela cabia e tudo parecia certo; com relatório de tamanho real
  // o corte caía no miolo e a mensagem saía SEM o aviso — o documento avisava,
  // a mensagem não. Quem lê a mensagem com o relatório do mês passado na mão é
  // exatamente quem faz a conta errada.
  it("com relatório de tamanho REAL, a ressalva sobrevive ao corte da mensagem", async () => {
    db.cycle.findFirst.mockResolvedValue({ reference: "2026-06", resultsJson: v1 });
    const secao = "Publicamos no ritmo combinado e o conteúdo de bastidor puxou conversa na caixa de entrada. ";
    generate.mockResolvedValue({
      ok: true,
      data: {
        title: "Relatório de julho",
        summary: secao.repeat(12),
        items: Array.from({ length: 5 }, (_, i) => ({
          headline: `Frente ${i + 1}`,
          note: secao.repeat(4),
        })),
      },
    });
    await virarOMes("p1", CICLO);

    const mensagem = String(falarComOCliente.mock.calls[0]![1]);
    expect(mensagem.length).toBeGreaterThan(900); // é um corpo grande de verdade
    expect(mensagem).toContain("não entram na comparação");
    expect(mensagem).toMatch(/começa no mês que vem/);
  });

  it("trechoComRessalva corta o miolo, nunca o aviso", () => {
    const ressalva = "Observação sobre a comparação: alcance não entra na comparação com o mês anterior.";
    const corpo = `${"miolo ".repeat(600)}\n\n---\n\n${ressalva}`;

    const cortado = trechoComRessalva(corpo, ressalva, 900);
    expect(cortado).toContain(ressalva);
    expect(cortado.length).toBeLessThanOrEqual(900);

    // Sem ressalva, é o corte simples de sempre.
    expect(trechoComRessalva(corpo, null, 50)).toHaveLength(50);
    // Corpo que não termina com a cauda (a IA não a escreveu): anexa uma vez só.
    const semCauda = "so o miolo";
    expect(trechoComRessalva(semCauda, ressalva, 900).match(/Observação sobre a comparação/g)).toHaveLength(1);
  });

  it("base diferente não dispara alerta de queda — o time não liga para o cliente por causa de régua", async () => {
    // v1 gravou 9.000 (um dia bom); v2 mede 4.200 no ciclo. Isso NÃO é queda.
    db.cycle.findFirst.mockResolvedValue({
      reference: "2026-06",
      resultsJson: JSON.stringify({ postsPublicados: 8, alcance: 9000, seguidores: 812, engajamento: 400, pago: null }),
    });
    await virarOMes("p1", CICLO);
    const alertas = db.activityEvent.create.mock.calls
      .map((c) => String(c[0].data.message));
    expect(alertas.join(" ")).not.toMatch(/Alcance/);
  });

  it("mesma versão, mas alcance de origem diferente, também não compara", async () => {
    // `soma_diaria` (soma do reach de cada dia) e `unicas_no_periodo` (reach
    // deduplicado) são números diferentes mesmo dentro da v2.
    const somaDiaria = {
      schemaVersao: 2, alcanceOrigem: "soma_diaria" as const,
      postsPublicados: 8, postsAgendadosNaoPublicados: 0,
      alcance: 9000, visualizacoes: null, seguidores: 900, engajamento: 400,
      pago: null, porQueNaoMediu: null,
    };
    const unicas = { ...somaDiaria, alcanceOrigem: "unicas_no_periodo" as const, alcance: 4200 };
    expect(mesmaBaseDeMedicao(unicas, somaDiaria)).toBe(false);
    expect(numerosComparaveis(unicas, somaDiaria).alcance).toBeNull();
    expect(numerosComparaveis(unicas, unicas).alcance).toBe(4200);
  });

  // A METADE QUE PASSA. `alcanceOrigem` descreve SÓ o alcance; `engajamento` é
  // `total_interactions` nas duas origens — a régua dele não mudou. Derrubar o
  // engajamento aqui reprovava comparação legítima E dizia ao cliente que "a
  // forma de medir mudou" para uma métrica cuja forma de medir não mudou.
  it("origem do alcance divergente derruba SÓ o alcance — o engajamento continua comparando", async () => {
    const base = {
      schemaVersao: 2, postsPublicados: 8, postsAgendadosNaoPublicados: 0,
      visualizacoes: null, seguidores: 900, pago: null, porQueNaoMediu: null,
    };
    const atual = { ...base, alcanceOrigem: "unicas_no_periodo" as const, alcance: 4200, engajamento: 310 };
    const anterior = { ...base, alcanceOrigem: "soma_diaria" as const, alcance: 9000, engajamento: 300 };

    expect(metricasForaDaComparacao(atual, anterior)).toEqual(["alcance"]);

    const par = compararComOMesAnterior(atual, anterior);
    expect(par.atual.alcance).toBeNull();
    expect(par.anterior!.alcance).toBeNull();
    expect(par.atual.engajamento).toBe(310);
    expect(par.anterior!.engajamento).toBe(300);
    // A ressalva fala no singular e NÃO cita engajamento.
    expect(par.ressalvaDeBase).toContain("alcance não entra na comparação");
    expect(par.ressalvaDeBase).not.toContain("engajamento");
  });

  it("versão diferente derruba as duas — v1 não media engajamento nenhum", () => {
    const v2 = {
      schemaVersao: 2, alcanceOrigem: "unicas_no_periodo" as const,
      postsPublicados: 8, postsAgendadosNaoPublicados: 0,
      alcance: 4200, visualizacoes: null, seguidores: 900, engajamento: 310,
      pago: null, porQueNaoMediu: null,
    };
    const antigo = { ...v2, schemaVersao: undefined, alcanceOrigem: null, alcance: 340, engajamento: null };
    expect(metricasForaDaComparacao(v2, antigo)).toEqual(["alcance", "engajamento"]);
  });

  it("mesma base segue comparando normalmente — a trava não pode matar a comparação boa", async () => {
    const par = compararComOMesAnterior(
      { schemaVersao: 2, alcanceOrigem: "unicas_no_periodo", postsPublicados: 8, postsAgendadosNaoPublicados: 0,
        alcance: 5200, visualizacoes: null, seguidores: 812, engajamento: 310, pago: null, porQueNaoMediu: null },
      { schemaVersao: 2, alcanceOrigem: "unicas_no_periodo", postsPublicados: 8, postsAgendadosNaoPublicados: 0,
        alcance: 4000, visualizacoes: null, seguidores: 800, engajamento: 300, pago: null, porQueNaoMediu: null },
    );
    expect(par.ressalvaDeBase).toBeNull();
    expect(par.atual.alcance).toBe(5200);
    expect(par.anterior!.alcance).toBe(4000);
  });
});
