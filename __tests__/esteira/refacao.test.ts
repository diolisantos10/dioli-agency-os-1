import { describe, it, expect, beforeEach, vi } from "vitest";

const db = vi.hoisted(() => ({
  // O PEDIDO QUE GEROU A PEÇA — a refação lê `produtoId` daqui para saber
  // quantas peças o cliente comprou (`contrato-do-pedido.ts`). `null` = peça
  // sem produto canônico, e aí vale o contrato do ESPECIALISTA, que é o
  // comportamento que estas suítes provam.
  contentRequest: { findFirst: vi.fn(async () => null) },
  // O PORTÃO DE PAGAMENTO (lib/agency/financeiro/portao-de-pagamento.ts) roda
  // antes de qualquer produção. Estes testes são sobre o que acontece DEPOIS de
  // o cliente pagar, então a testemunha diz "pago". Quem testa a trava em si é
  // __tests__/financeiro/portao-de-pagamento.test.ts.
  pagamentoConfirmado: {
    findUnique: vi.fn(async () => ({
      valorCentavos: 7900,
      origem: "mercadopago",
      confirmadoEm: new Date("2026-08-25T00:00:00.000Z"),
    })),
  },
  project: { findFirst: vi.fn() },
  clientRequestDb: { findUnique: vi.fn() },
  cycle: { findFirst: vi.fn() },
  deliverable: { findMany: vi.fn(), update: vi.fn() },
  approvalRequest: { updateMany: vi.fn() },
  portalMessage: { create: vi.fn() },
  // A gaveta das PROIBIÇÕES do cliente (`esteira/proibicoes.ts`). Sem ela, a
  // leitura falha e o piso de verdade REPROVA a peça — que é o comportamento
  // certo (fail-closed) e não o que estas suítes estão provando. Vazia aqui
  // significa "este cliente não proibiu nada", que é o caso limpo.
  brainArtifact: { findFirst: vi.fn(() => Promise.resolve(null)), findMany: vi.fn(() => Promise.resolve([])), create: vi.fn(() => Promise.resolve({})) },
  activityEvent: { create: vi.fn() },
}));
const generate = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db/client", () => ({ prisma: db }));
vi.mock("@/lib/ai/generate", () => ({ generate }));

import {
  refazerPorPedidoDoCliente, MAX_REFACOES_DO_CLIENTE,
  cancelarPorPedidoDoCliente, REVISION_STATUS_DO_CANCELAMENTO,
} from "@/lib/agency/esteira/refacao";

const ENTREGA = {
  id: "d1", name: "Calendário de conteúdo", content: "**1. Post**\n- Legenda: texto antigo",
  ownerAgentId: "a3", version: 1, clientFeedback: null as string | null,
};

beforeEach(() => {
  vi.clearAllMocks();
  db.project.findFirst.mockResolvedValue({
    id: "p1", workspaceId: "ws1", clientId: "c1", clientRequestId: "cr1",
    client: { name: "Padaria do João", phone: null, email: null },
  });
  db.clientRequestDb.findUnique.mockResolvedValue({ businessName: "Padaria do João" });
  db.cycle.findFirst.mockResolvedValue({ id: "cy1" });
  db.deliverable.findMany.mockResolvedValue([{ ...ENTREGA }]);
  db.deliverable.update.mockResolvedValue({});
  db.approvalRequest.updateMany.mockResolvedValue({});
  db.portalMessage.create.mockResolvedValue({});
  db.activityEvent.create.mockResolvedValue({});
  generate.mockResolvedValue({
    ok: true,
    data: {
      title: "Calendário de conteúdo",
      summary: "Ajustado para um tom mais próximo do bairro.",
      // QUATRO semanas: é o que `contratoDaPauta` exige de `a3` (4 a 8). O
      // fixture tinha UMA, e passava porque este caminho não conferia o
      // contrato de saída — a refação podia encolher o calendário do mês
      // inteiro para um post e ninguém ficava vermelho.
      items: [
        { headline: "Pão quentinho", caption: "Saiu do forno agora, passa aqui que a gente te espera." },
        { headline: "A fornada das seis", caption: "Todo dia às seis sai a primeira fornada, e o cheiro toma a rua." },
        { headline: "Quem faz o seu pão", caption: "O time da casa chega às quatro para o pão estar pronto quando você acorda." },
        { headline: "O bolo do fim de semana", caption: "Sábado tem bolo de fubá saindo quente durante toda a manhã." },
      ],
    },
  });
});

describe("pedido de mudança do cliente é refeito na hora", () => {
  it("as palavras DELE vão para o especialista", async () => {
    await refazerPorPedidoDoCliente({
      clientRequestId: "cr1", department: "social-media",
      comentario: "está muito formal, quero mais próximo do jeito do bairro",
    });
    const prompt = generate.mock.calls[0]![0].user as string;
    expect(prompt).toContain("mais próximo do jeito do bairro");
    expect(generate.mock.calls[0]![0].system).toMatch(/O CLIENTE/);
  });

  it("a peça é atualizada e o cliente é avisado do que mudou", async () => {
    const r = await refazerPorPedidoDoCliente({
      clientRequestId: "cr1", department: "social-media", comentario: "muda o tom",
    });
    expect(r.refeitas).toEqual(["Calendário de conteúdo"]);
    expect(r.avisouCliente).toBe(true);
    expect(db.deliverable.update).toHaveBeenCalledOnce();
  });

  // ── O ESTADO NÃO MENTE (5ª auditoria, 04/08/2026) ───────────────────────
  //
  // Gravávamos `quality_ok` aqui. A peça tinha passado pelo PISO e por mais
  // nada — piso é chão, não é parecer: ele barra dado inventado, não julga
  // tom, promessa nem aderência ao briefing. Nenhum auditor olhou esta versão,
  // e é assim que fica escrito. Quem julga neste caminho é o CLIENTE, na
  // rodada de aprovação reaberta logo abaixo.
  it("METADE 1 — a versão nova NÃO se declara aprovada pela Qualidade", async () => {
    await refazerPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media", comentario: "muda o tom" });
    const gravado = db.deliverable.update.mock.calls[0]![0].data.revisionStatus;
    expect(gravado).not.toBe("quality_ok");
    expect(gravado).toBe("quality_nao_auditado");
  });

  it("METADE 2 — e mesmo assim a peça SEGUE: não auditada não é bloqueio", async () => {
    // Quem pediu a mudança foi o dono do briefing. Um juiz que reprovasse o
    // que o cliente pediu explicitamente poria a máquina contra ele.
    const r = await refazerPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media", comentario: "muda o tom" });
    expect(r.refeitas).toHaveLength(1);
    expect(r.escalado).toBe(false);
    expect(db.approvalRequest.updateMany.mock.calls[0]![0].data.clientVisible).toBe(true);
  });

  it("a aprovação volta a pendente — o 'sim' antigo não vale para a versão nova", async () => {
    await refazerPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media", comentario: "muda o tom" });
    expect(db.approvalRequest.updateMany.mock.calls[0]![0].data.status).toBe("pending");
  });

  it("mexe só no departamento que o cliente apontou — o resto não se toca", async () => {
    // Reclamou do texto do social; não quer o logo dele redesenhado.
    await refazerPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media", comentario: "muda o tom" });
    const where = db.deliverable.findMany.mock.calls[0]![0].where;
    expect(where.ownerAgentId.in).toContain("a3");
    expect(where.ownerAgentId.in).not.toContain("a2");
  });

  it("refaz dentro do ciclo corrente — não mexe no que já foi entregue mês passado", async () => {
    await refazerPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media", comentario: "muda o tom" });
    expect(db.deliverable.findMany.mock.calls[0]![0].where.cycleId).toBe("cy1");
  });
});

// ── A REPROVAÇÃO DA QUALIDADE NÃO SE APAGA POR AQUI (6ª auditoria, 04/08/2026)
//
// Este caminho grava `quality_nao_auditado`. Numa peça `quality_flag` isso é
// ABSOLVIÇÃO: a ressalva some e `apresentar` (que só barra `quality_flag`)
// passa a mostrar ao cliente a peça que a própria casa reprovou. O gatilho é
// alcançável sem má-fé — o card de aprovação é por DEPARTAMENTO e fica visível
// mesmo sendo de ciclo anterior, então um clique legítimo em "pedir revisão"
// levava a peça barrada de carona.
//
// "Aqui o árbitro é o cliente" não cobre esta peça: ela nunca foi apresentada,
// logo ele não a viu e não pode arbitrar sobre ela.
describe("peça reprovada pela Qualidade não é absolvida pelo pedido do cliente", () => {
  const BARRADA = { ...ENTREGA, id: "d2", name: "Post reprovado", revisionStatus: "quality_flag" };

  it("a peça em quality_flag NÃO é refeita nem tem o status sobrescrito", async () => {
    db.deliverable.findMany.mockResolvedValue([{ ...BARRADA }]);
    const r = await refazerPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media", comentario: "muda o tom" });
    expect(r.refeitas).toHaveLength(0);
    expect(db.deliverable.update, "sobrescrever o status é a absolvição").not.toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
  });

  it("de carona não passa: a boa é refeita, a barrada continua barrada", async () => {
    db.deliverable.findMany.mockResolvedValue([{ ...ENTREGA }, { ...BARRADA }]);
    const r = await refazerPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media", comentario: "muda o tom" });
    expect(r.refeitas).toEqual(["Calendário de conteúdo"]);
    const tocados = db.deliverable.update.mock.calls.map((c) => c[0].where.id as string);
    expect(tocados).toEqual(["d1"]);
    // E gente fica sabendo que o pedido dele também toca a peça barrada.
    const eventos = db.activityEvent.create.mock.calls.map((c) => c[0].data.message as string);
    expect(eventos.some((m) => m.includes("Post reprovado"))).toBe(true);
  });

  it("departamento inteiro barrado: o cliente NÃO ouve 'não achei sua entrega'", async () => {
    db.deliverable.findMany.mockResolvedValue([{ ...BARRADA }]);
    const r = await refazerPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media", comentario: "muda o tom" });
    expect(r.escalado).toBe(true);
    expect(r.motivo).toMatch(/reprovada pela Qualidade/);
    const corpo = db.portalMessage.create.mock.calls[0]![0].data.body as string;
    expect(corpo, "a entrega existe — dizer que não achei é mentira").toMatch(/em revisão aqui com a equipe/);
    expect(corpo).not.toMatch(/não achei|não encontrei/i);
  });
});

describe("o que a máquina NÃO deve tentar adivinhar", () => {
  it("pedido sem palavras: pergunta, em vez de refazer no escuro", async () => {
    // Refazer sem saber o quê produz outra peça errada e queima uma tentativa.
    const r = await refazerPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media" });
    expect(generate).not.toHaveBeenCalled();
    expect(r.avisouCliente).toBe(true);
    expect(db.portalMessage.create.mock.calls[0]![0].data.body).toMatch(/o que você quer diferente/i);
  });

  it("cliente que já pediu duas vezes vira gente — mais IA só aumenta a frustração", async () => {
    db.deliverable.findMany.mockResolvedValue([{ ...ENTREGA, version: MAX_REFACOES_DO_CLIENTE + 1 }]);
    const r = await refazerPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media", comentario: "ainda não é isso" });
    expect(r.refeitas).toHaveLength(0);
    expect(r.escalado).toBe(true);
    expect(db.activityEvent.create.mock.calls[0]![0].data.type).toBe("refacao_escalada");
  });

  it("mesmo escalando, o cliente NUNCA fica no silêncio — o silêncio era o bug", async () => {
    db.deliverable.findMany.mockResolvedValue([{ ...ENTREGA, version: 9 }]);
    const r = await refazerPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media", comentario: "ainda não" });
    expect(r.avisouCliente).toBe(true);
  });

  it("IA fora do ar não gasta tentativa nem finge que refez", async () => {
    generate.mockResolvedValue({ ok: false, error: "sem provedor" });
    const r = await refazerPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media", comentario: "muda" });
    expect(r.refeitas).toHaveLength(0);
    expect(db.deliverable.update).not.toHaveBeenCalled();
    expect(r.escalado).toBe(true);
  });

  it("refação que inventa telefone não chega ao cliente", async () => {
    generate.mockResolvedValue({
      ok: true,
      // O calendário INTEIRO (o contrato de saída é conferido antes do piso),
      // com um telefone inventado numa das semanas: o que está sob teste é o
      // PISO, e ele não pode ser mascarado por uma reprovação de formato.
      data: {
        title: "X",
        summary: "Novo texto do calendário do mês para a padaria.",
        items: [
          { headline: "Contato", note: "Ligue (11) 98888-7777 agora mesmo para reservar o seu." },
          { headline: "A fornada das seis", note: "Todo dia às seis sai a primeira fornada da casa." },
          { headline: "Quem faz o seu pão", note: "O time chega às quatro para o pão estar pronto cedo." },
          { headline: "O bolo do fim de semana", note: "Sábado tem bolo de fubá saindo quente de manhã." },
        ],
      },
    });
    const r = await refazerPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media", comentario: "põe contato" });
    expect(r.refeitas).toHaveLength(0);
    expect(r.escalado).toBe(true);
    expect(r.motivo).toMatch(/inventou dado/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// O CANCELAMENTO — ordem do CEO, 29/08/2026: "avisa cliente e agência, e
// interrompe a produção na hora". Estes testes provam as DUAS metades.
// ═══════════════════════════════════════════════════════════════════════════
describe("o cliente cancelou", () => {
  it("METADE B — a entrega é carimbada FORA de 'quality_ok', que é a única porta que agendarPostsDaEntrega aceita", async () => {
    await cancelarPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media", comentario: "não precisamos mais disso" });
    expect(db.deliverable.update).toHaveBeenCalledOnce();
    const gravado = db.deliverable.update.mock.calls[0]![0].data.revisionStatus;
    expect(gravado).toBe(REVISION_STATUS_DO_CANCELAMENTO);
    expect(gravado).not.toBe("quality_ok");
  });

  it("a entrega carimbada é a prova devolvida — não um silêncio disfarçado de sucesso", async () => {
    const r = await cancelarPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media", comentario: "cancela" });
    expect(r.entregasCanceladas).toEqual(["Calendário de conteúdo"]);
  });

  it("não chama IA — cancelamento não produz peça nenhuma", async () => {
    await cancelarPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media", comentario: "cancela" });
    expect(generate).not.toHaveBeenCalled();
  });

  it("METADE A (cliente) — o portal recebe uma confirmação, não o eco do próprio comentário do cliente", async () => {
    const r = await cancelarPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media", comentario: "não preciso mais" });
    expect(r.avisouCliente).toBe(true);
    const corpo = db.portalMessage.create.mock.calls[0]![0].data.body as string;
    expect(corpo).toMatch(/[Cc]ancelamento registrado/);
    expect(corpo).toContain("não preciso mais");
  });

  it("METADE A (agência) — vira ActivityEvent, a MESMA tela que a recusa já usa (/agency/dashboard)", async () => {
    const r = await cancelarPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media", comentario: "cancela isso" });
    expect(r.escalado).toBe(true);
    expect(db.activityEvent.create).toHaveBeenCalledOnce();
    const evento = db.activityEvent.create.mock.calls[0]![0].data;
    expect(evento.message).toMatch(/CANCELOU/);
    expect(evento.workspaceId).toBe("ws1");
  });

  it("sem ressalva ainda assim cancela e avisa — a ressalva não é condição para parar", async () => {
    const r = await cancelarPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media" });
    expect(r.entregasCanceladas).toEqual(["Calendário de conteúdo"]);
    expect(r.avisouCliente).toBe(true);
    expect(r.escalado).toBe(true);
  });

  it("sem clientRequestId nem clientId, não inventa dono — devolve o motivo e não escreve nada", async () => {
    const r = await cancelarPorPedidoDoCliente({ department: "social-media", comentario: "cancela" });
    expect(r.motivo).toMatch(/sem dono/);
    expect(db.deliverable.update).not.toHaveBeenCalled();
  });

  // ── O VEDADO DO CEO (29/08/2026): nada de regra de dinheiro por aqui ──────
  it("VEDADO — nenhuma mensagem (cliente ou agência) fala de multa, reembolso, devolução ou desistência", async () => {
    const r = await cancelarPorPedidoDoCliente({ clientRequestId: "cr1", department: "social-media", comentario: "cancela" });
    expect(r.avisouCliente).toBe(true);
    const paraOCliente = db.portalMessage.create.mock.calls[0]![0].data.body as string;
    const paraAAgencia = db.activityEvent.create.mock.calls[0]![0].data.message as string;
    const PROIBIDO = /multa|reembolso|devolu[cç][aã]o|desist[êe]ncia/i;
    expect(paraOCliente).not.toMatch(PROIBIDO);
    expect(paraAAgencia).not.toMatch(PROIBIDO);
  });
});
