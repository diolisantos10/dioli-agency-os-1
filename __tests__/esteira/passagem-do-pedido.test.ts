// A PASSAGEM DO PEDIDO DO CLIENTE — as duas metades da prova.
//
// A regressão que estes testes existem para impedir tem data e id: o pedido
// `cmsg7anke00030ps260acx43s` (roteiro de vídeo do Foocci) entrou em 05/08 às
// 14h47 e ficou com `status: "novo"` até o CEO cobrar dois dias depois. "Novo"
// não aciona ninguém.
//
// As duas metades, como sempre:
//   1. pedido legítimo atravessa a esteira inteira — triagem, departamento
//      certo, preço da TABELA, prazo, peça e card no portal;
//   2. pedido impossível de classificar PARA na porta certa, com o motivo em
//      português, e não vira default silencioso.
// Mais a terceira que a casa já aprendeu a exigir: duplo clique não vira dois
// projetos, e a trava é o banco.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { escadaToda } from "../_escada";

// ── O banco, em memória, com as escritas condicionais de verdade ────────────
// `updateMany` é a trava de concorrência dos dois módulos: ele SÓ escreve se o
// estado no WHERE ainda for o esperado. Um mock que sempre devolve `count: 1`
// provaria o contrário do que interessa.
interface Registro { [k: string]: unknown }
const pedidos = new Map<string, Registro>();

/** O calendário da Foocci — os 6 carrosséis já aprovados e agendados. */
interface PostDoCalendario { id: string; clientId: string; status: string; scheduledFor: Date | null; caption: string }
let calendario: PostDoCalendario[] = [];

function casa(reg: Registro, where: Registro): boolean {
  for (const [k, v] of Object.entries(where)) {
    if (k === "OR") {
      if (!(v as Registro[]).some((o) => casa(reg, o))) return false;
      continue;
    }
    if (v !== null && typeof v === "object" && !(v instanceof Date)) {
      const cond = v as Record<string, unknown>;
      if ("lt" in cond) {
        const atual = reg[k];
        if (!(atual instanceof Date) || atual >= (cond.lt as Date)) return false;
        continue;
      }
      if ("in" in cond) {
        if (!(cond.in as unknown[]).includes(reg[k])) return false;
        continue;
      }
    }
    if (reg[k] !== v) return false;
  }
  return true;
}

const db = {
  contentRequest: {
    findUnique: vi.fn(({ where }: { where: { id: string } }) => Promise.resolve(pedidos.get(where.id) ?? null)),
    findUniqueOrThrow: vi.fn(({ where }: { where: { id: string } }) => {
      const r = pedidos.get(where.id);
      if (!r) throw new Error("não encontrado");
      return Promise.resolve(r);
    }),
    findFirst: vi.fn(() => Promise.resolve(null)),
    update: vi.fn(({ where, data }: { where: { id: string }; data: Registro }) => {
      const r = pedidos.get(where.id)!;
      Object.assign(r, data, { updatedAt: new Date() });
      return Promise.resolve(r);
    }),
    updateMany: vi.fn(({ where, data }: { where: Registro; data: Registro }) => {
      const r = pedidos.get(where.id as string);
      if (!r || !casa(r, where)) return Promise.resolve({ count: 0 });
      Object.assign(r, data, { updatedAt: new Date() });
      return Promise.resolve({ count: 1 });
    }),
  },
  client: {
    findUnique: vi.fn(() => Promise.resolve({
      id: "cli-1", name: "Foocci", workspaceId: "ws-1", industry: "Alimentação",
      email: "contato@foocci.com.br", phone: null, brandBrain: null,
    })),
    findUniqueOrThrow: vi.fn(() => Promise.resolve({
      id: "cli-1", name: "Foocci", workspaceId: "ws-1", industry: "Alimentação",
      email: "contato@foocci.com.br", phone: null, brandBrain: null,
    })),
  },
  project: {
    findFirst: vi.fn<() => Promise<{ id: string; name: string } | null>>(
      () => Promise.resolve({ id: "prj-1", name: "Foocci" }),
    ),
    findUnique: vi.fn<() => Promise<{ clientRequestId: string | null } | null>>(
      () => Promise.resolve({ clientRequestId: null }),
    ),
    findUniqueOrThrow: vi.fn(() => Promise.resolve({
      id: "prj-1", name: "Foocci", goal: "Vender mais no almoço",
      workspaceId: "ws-1", clientId: "cli-1", clientRequestId: null,
    })),
  },
  cycle: { findFirst: vi.fn<() => Promise<{ id: string } | null>>(() => Promise.resolve(null)) },
  clientRequestDb: { findUnique: vi.fn<() => Promise<{ services: string } | null>>(() => Promise.resolve(null)) },
  task: {
    create: vi.fn((_args: { data: Registro }) => Promise.resolve({ id: "task-1" })),
    findUnique: vi.fn<() => Promise<{ id: string; agentId: string | null } | null>>(
      () => Promise.resolve({ id: "task-1", agentId: "social-roteiro-video" }),
    ),
    update: vi.fn(() => Promise.resolve({})),
  },
  deliverable: { create: vi.fn((_args: { data: Registro }) => Promise.resolve({ id: "del-1" })) },
  // O que o cliente JÁ entregou. Vazio aqui é o caso limpo: ele não mandou
  // material. Existe no mock porque desde 15/08 a produção do pedido lê isto —
  // antes gravava `materiaisEntregues: []` FIXO, o que fazia o especialista
  // pedir de novo o logo que o cliente já tinha mandado.
  materialRequest: { findMany: vi.fn(() => Promise.resolve([] as { type: string }[])) },
  approvalRequest: { findFirst: vi.fn(() => Promise.resolve(null)) },
  timelineEvent: { create: vi.fn(() => Promise.resolve({})) },
  activityEvent: { create: vi.fn(() => Promise.resolve({})) },
  portalMessage: { create: vi.fn(() => Promise.resolve({})) },
  // A gaveta das PROIBIÇÕES do cliente (`esteira/proibicoes.ts`). Sem ela, a
  // leitura falha e o piso de verdade REPROVA a peça — que é o comportamento
  // certo (fail-closed) e não o que estas suítes estão provando. Vazia aqui
  // significa "este cliente não proibiu nada", que é o caso limpo.
  brainArtifact: { findFirst: vi.fn(() => Promise.resolve(null)), findMany: vi.fn(() => Promise.resolve([])), create: vi.fn(() => Promise.resolve({})) },
  // O calendário do cliente — a FAMÍLIA 3 de pedido (operação sobre trabalho já
  // contratado) mexe aqui e em nada mais.
  socialPost: {
    findMany: vi.fn(() => Promise.resolve(calendario)),
    update: vi.fn(({ where, data }: { where: { id: string }; data: Registro }) => {
      const p = calendario.find((x) => x.id === where.id)!;
      Object.assign(p, data);
      return Promise.resolve(p);
    }),
  },
  // A escada de exposição, com o departamento em `wide`: esta suíte é sobre a
  // passagem legítima do pedido, e a metade legítima TEM que atravessar sem
  // atrito. A metade que retém está em `__tests__/qualidade/escada-de-exposicao.test.ts`.
  departmentLadder: {
    findMany: vi.fn(() => Promise.resolve(escadaToda("wide"))),
    findUnique: vi.fn(() => Promise.resolve({ degrau: "wide" })),
    create: vi.fn(() => Promise.resolve({})),
    update: vi.fn(() => Promise.resolve({})),
  },
  departmentLadderRecord: { create: vi.fn(() => Promise.resolve({})), findMany: vi.fn(() => Promise.resolve([])) },
};
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


// Permissivo de propósito: cada teste decide o que a IA responde, e a forma da
// resposta muda por chamada (classificação, peça, parecer do juiz).
const generate = vi.fn<(...a: unknown[]) => Promise<unknown>>();
vi.mock("@/lib/ai/generate", () => ({ generate: (...a: unknown[]) => generate(...a) }));

const criarCard = vi.fn<(input: Record<string, unknown>) => Promise<{ id: string }>>(
  () => Promise.resolve({ id: "apr-1" }),
);
vi.mock("@/lib/agency/persistence/approval-service", () => ({
  createApprovalRequest: (input: Record<string, unknown>) => criarCard(input),
}));

vi.mock("@/app/api/messages/conversa", () => ({
  conversaDoCliente: () => Promise.resolve({ ancora: { clientId: "cli-1", clientRequestId: null } }),
}));

const { triarPedido, ATENDIMENTOS, somarDiasUteis, precoDaTabela } = await import("@/lib/agency/esteira/triagem");
const { produzirPedido, atenderPedido } = await import("@/lib/agency/esteira/producao-de-pedido");
// A porta é lida pelo MESMO leitor da rota do portal (`/api/portal/pedidos`).
// Ler o JSON à mão aqui deixaria o teste concordar com uma porta que a tela
// não consegue abrir.
const { lerPergunta } = await import("@/lib/agency/esteira/porta-da-pergunta");

/** Três roteiros: é o que o contrato de saída de `social-roteiro-video` exige. */
function roteirosValidos() {
  return {
    title: "Roteiros de Vídeo — Foocci",
    summary: "Três roteiros de reels para o horário do almoço.",
    items: [
      { headline: "O combo que salva a segunda", note: "GANCHO (0-2s): o prato saindo da cozinha. Cenas: 3s prato, 4s cliente comendo, 3s chamada.", visual: "Close no prato montado, luz natural", caption: "Segunda também merece almoço bom." },
      { headline: "Quem faz o seu almoço", note: "GANCHO (0-2s): as mãos abrindo a marmita. Cenas: 4s cozinha, 4s montagem, 2s entrega.", visual: "Bastidor da cozinha, câmera na mão", caption: "Feito hoje, para você comer hoje." },
      { headline: "O que tem hoje", note: "GANCHO (0-2s): a pergunta na tela. Cenas: 3s balcão, 5s pratos, 2s chamada.", visual: "Panorâmica do balcão de pratos do dia", caption: "O cardápio de hoje está no perfil." },
    ],
  };
}

function novoPedido(over: Registro = {}) {
  pedidos.clear();
  const p: Registro = {
    id: "pc-1",
    clientId: "cli-1",
    clientRequestId: null,
    projectId: null,
    title: "Quero um reel pronto do combo do almoço",
    // O caso LIMPO: ele quer a PEÇA FINAL, no singular. É a metade que tem de
    // atravessar sem atrito — a metade que retém está no fim deste arquivo.
    description: "Quero um reel pronto mostrando o combo do almoço, com o preço aparecendo na tela.",
    objective: "Vender mais no horário de almoço",
    desiredFor: null,
    attachmentsJson: "[]",
    status: "novo",
    scopeDecision: null,
    quotedPrice: null, quoteNote: null, quoteStatus: null,
    taskId: null, promisedFor: null, deliverableId: null, productionAttempts: 0,
    triagedBy: null, triagedAt: null, declineReason: null,
    createdAt: new Date("2026-08-06T12:00:00Z"),
    updatedAt: new Date("2026-08-06T12:00:00Z"),
    ...over,
  };
  pedidos.set(p.id as string, p);
  return p;
}

beforeEach(() => {
  vi.clearAllMocks();
  db.cycle.findFirst.mockResolvedValue(null);
  db.project.findFirst.mockResolvedValue({ id: "prj-1", name: "Foocci" });
  db.task.findUnique.mockResolvedValue({ id: "task-1", agentId: "social-roteiro-video" });
  criarCard.mockResolvedValue({ id: "apr-1" });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("metade 1 — o pedido legítimo atravessa a esteira inteira", () => {
  it("tria para o departamento certo, com preço da TABELA e prazo", async () => {
    novoPedido();
    generate.mockResolvedValueOnce({
      ok: true,
      data: { atendimentoId: "producao-de-video", confianca: 92, motivo: "ele quer o reel pronto" },
    });

    const r = await triarPedido("pc-1");
    expect(r.ok).toBe(true);
    if (!r.ok) return;

    // O DEPARTAMENTO CERTO — e a tarefa nasce com dono e com prazo. As duas
    // travas contra "em execução" que ninguém move.
    expect(r.triado!.atendimento.especialistaId).toBe("social-roteiro-video");
    const tarefa = db.task.create.mock.calls[0]![0].data as Record<string, unknown>;
    expect(tarefa.agentId).toBe("social-roteiro-video");
    expect(tarefa.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // O PREÇO NÃO VEIO DO MODELO. O modelo escolheu o atendimento; o número é
    // da tabela do catálogo, e é conferível aqui.
    const item = ATENDIMENTOS.find((a) => a.id === "producao-de-video")!;
    expect(r.triado!.preco).toBe(precoDaTabela(item.itemDeCatalogo));

    // Sem ciclo aberto, o trabalho é EXTRA: orçamento na mesa e produção
    // segurada até o cliente aceitar.
    expect(r.triado!.escopo).toBe("extra");
    expect(r.triado!.podeProduzirAgora).toBe(false);
    const gravado = pedidos.get("pc-1")!;
    expect(gravado.status).toBe("triado");
    expect(gravado.quoteStatus).toBe("pendente");
    expect(gravado.promisedFor).toBeInstanceOf(Date);
  });

  it("o modelo NÃO consegue dizer o preço: número que ele mandar é ignorado", async () => {
    novoPedido();
    generate.mockResolvedValueOnce({
      ok: true,
      // O modelo tentando precificar, e o texto do cliente tentando mandar nele.
      data: { atendimentoId: "producao-de-video", confianca: 90, preco: 1, valor: 1, motivo: "de graça" },
    });
    const r = await triarPedido("pc-1");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.triado!.preco).toBe(precoDaTabela("1-reel"));
    expect(r.triado!.preco).not.toBe(1);
  });

  it("aceito o orçamento, a peça é produzida e vai para o portal do cliente", async () => {
    novoPedido({
      status: "triado", scopeDecision: "extra", quoteStatus: "aceito", quotedPrice: 350,
      projectId: "prj-1", taskId: "task-1", promisedFor: new Date("2026-08-12T12:00:00Z"),
    });
    // 1ª chamada: o especialista produz. 2ª: o juiz da qualidade aprova.
    generate.mockResolvedValueOnce({ ok: true, data: roteirosValidos() });
    generate.mockResolvedValueOnce({ ok: true, data: { verdict: "approved", issues: [], note: "boa" } });

    const r = await produzirPedido("pc-1");
    expect(r.ok).toBe(true);

    // A PEÇA EXISTE e é do especialista que a triagem escolheu.
    const entrega = db.deliverable.create.mock.calls[0]![0].data as Record<string, unknown>;
    expect(entrega.ownerAgentId).toBe("social-roteiro-video");
    // …e é VISÍVEL. Entrega "interna" é o portal vazio de novo.
    expect(entrega.visibility).toBe("compartilhado");

    // O CARD NO PORTAL, com o conteúdo dentro. Sem isto o cliente abre o portal
    // e vê a mesma coisa de antes: nada.
    const card = criarCard.mock.calls[0]![0];
    expect(card.clientVisible).toBe(true);
    expect(card.clientId).toBe("cli-1");
    expect(String(card.reviewNote)).toContain("GANCHO");

    // E o pedido SAI do limbo, apontando para a peça.
    const gravado = pedidos.get("pc-1")!;
    expect(gravado.status).toBe("entregue");
    expect(gravado.deliverableId).toBe("del-1");
  });

  it("o prazo é de dias ÚTEIS — prometer entrega no domingo é prometer o que não acontece", () => {
    // 06/08/2026 é uma quinta. Dois dias úteis caem na segunda, 10/08.
    const segunda = somarDiasUteis(new Date("2026-08-06T12:00:00Z"), 2);
    expect(segunda.getDay()).not.toBe(0);
    expect(segunda.getDay()).not.toBe(6);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("metade 2 — o que a máquina não sabe classificar PARA, e com motivo", () => {
  it("modelo responde 'nao_sei': vira precisa_decisao, nunca um default silencioso", async () => {
    novoPedido({ description: "Quero renegociar a mensalidade e marcar uma reunião com o dono." });
    generate.mockResolvedValueOnce({
      ok: true,
      data: { atendimentoId: "nao_sei", confianca: 95, motivo: "é assunto comercial, não é peça" },
    });

    const r = await triarPedido("pc-1");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.parou).toBe(true);

    const gravado = pedidos.get("pc-1")!;
    expect(gravado.status).toBe("precisa_decisao");
    // O motivo é português de gente, não um código — os dois lados leem este campo.
    expect(String(gravado.declineReason).length).toBeGreaterThan(20);
    expect(String(gravado.declineReason)).toMatch(/equipe/i);
    // E NADA foi criado: sem departamento, não nasce tarefa órfã.
    expect(db.task.create).not.toHaveBeenCalled();
  });

  it("confiança baixa também para — chutar aqui é produzir a peça errada", async () => {
    novoPedido();
    generate.mockResolvedValueOnce({
      ok: true,
      data: { atendimentoId: "post-ou-carrossel", confianca: 20, motivo: "não deu para entender" },
    });
    const r = await triarPedido("pc-1");
    expect(r.ok).toBe(false);
    expect(pedidos.get("pc-1")!.status).toBe("precisa_decisao");
    expect(db.task.create).not.toHaveBeenCalled();
  });

  it("sem IA, o pedido NÃO volta para 'novo' (onde some): fica visível, com o motivo", async () => {
    novoPedido();
    generate.mockResolvedValueOnce({ ok: false, error: "sem chave de IA" });
    await triarPedido("pc-1");
    const gravado = pedidos.get("pc-1")!;
    expect(gravado.status).toBe("precisa_decisao");
    expect(String(gravado.declineReason)).toContain("sem chave de IA");
  });

  it("cliente sem projeto aberto: para com motivo, em vez de criar tarefa que ninguém executa", async () => {
    novoPedido();
    db.project.findFirst.mockResolvedValue(null);
    generate.mockResolvedValueOnce({ ok: true, data: { atendimentoId: "producao-de-video", confianca: 99, motivo: "ok" } });
    const r = await triarPedido("pc-1");
    expect(r.ok).toBe(false);
    expect(pedidos.get("pc-1")!.status).toBe("precisa_decisao");
    expect(db.task.create).not.toHaveBeenCalled();
  });

  it("peça reprovada no piso de verdade NÃO vai ao cliente — e o pedido não fica preso", async () => {
    novoPedido({
      status: "triado", scopeDecision: "extra", quoteStatus: "aceito", quotedPrice: 350,
      projectId: "prj-1", taskId: "task-1",
    });
    // O especialista inventa um telefone. Duas vezes: a produção e a correção.
    const comTelefone = () => {
      const d = roteirosValidos();
      d.items[0]!.caption = "Peça pelo (11) 98888-7777 agora mesmo.";
      return d;
    };
    generate.mockResolvedValueOnce({ ok: true, data: comTelefone() });
    generate.mockResolvedValueOnce({ ok: true, data: comTelefone() });

    const r = await produzirPedido("pc-1");
    expect(r.ok).toBe(false);
    // NÃO publicou.
    expect(db.deliverable.create).not.toHaveBeenCalled();
    expect(criarCard).not.toHaveBeenCalled();
    // E não sumiu: virou decisão visível.
    expect(pedidos.get("pc-1")!.status).toBe("precisa_decisao");
    expect(String(pedidos.get("pc-1")!.declineReason)).toMatch(/confirmar/i);

    // ── E A PARADA TEM PORTA (26/08/2026) ────────────────────────────────
    //
    // Até aqui a frase era "A equipe vai revisar com você antes de entregar" e
    // o cartão do portal não tinha um único botão. Nenhum varredor desta casa
    // lê pedido em `precisa_decisao` para revisar coisa nenhuma: a promessa
    // era um relógio que ninguém deu corda. Prompt é aviso, código é trava —
    // e o aviso não pode prometer o que a trava não faz.
    const motivo = String(pedidos.get("pc-1")!.declineReason);
    expect(motivo, "a frase não pode prometer uma refação que nada dispara")
      .not.toMatch(/equipe vai (revisar|refazer)/i);
    expect(motivo, "dono").toMatch(/Quem está com isso:/);
    expect(motivo, "próxima ação").toMatch(/Próxima ação:/);

    const porta = lerPergunta(pedidos.get("pc-1")!.pendingQuestionJson as string | null);
    expect(porta, "parada do piso continuava sem porta — selo amarelo e nenhum botão").not.toBeNull();
    expect(porta!.opcoes.length).toBeGreaterThanOrEqual(2);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 🔴 A SEGUNDA PARADA SEM PORTA: a Qualidade da própria casa
  // ═══════════════════════════════════════════════════════════════════════
  it("peça reprovada pela QUALIDADE não vai ao cliente — e a parada tem porta", async () => {
    novoPedido({
      status: "triado", scopeDecision: "extra", quoteStatus: "aceito", quotedPrice: 350,
      projectId: "prj-1", taskId: "task-1",
    });
    // A reprovação vem da régua DETERMINÍSTICA de texto, dentro de
    // `auditDeliverable` — o superlativo sem lastro. É de propósito: assim o
    // teste não depende da ordem das chamadas de IA, e a reprovação acontece
    // pela mesma trava que reprova em produção, sem provedor no caminho.
    const comSuperlativo = () => {
      const d = roteirosValidos();
      d.items[0]!.caption = "A melhor comida da cidade, sem dúvida nenhuma.";
      return d;
    };
    // Produção, correção do juiz, e a peça continua reprovada.
    generate.mockResolvedValue({ ok: true, data: comSuperlativo() });

    const r = await produzirPedido("pc-1");
    expect(r.ok).toBe(false);
    expect(criarCard, "a casa NÃO entrega o que ela mesma reprovou").not.toHaveBeenCalled();
    expect(pedidos.get("pc-1")!.status).toBe("precisa_decisao");

    const motivo = String(pedidos.get("pc-1")!.declineReason);
    // A frase antiga: "A equipe vai refazer e te avisar." Nada refazia.
    expect(motivo, "a frase prometia uma refação que nenhuma linha desta casa fazia")
      .not.toMatch(/vai refazer/i);
    expect(motivo, "dono").toMatch(/Quem está com isso:/);
    expect(motivo, "próxima ação").toMatch(/Próxima ação:/);

    const porta = lerPergunta(pedidos.get("pc-1")!.pendingQuestionJson as string | null);
    expect(porta, "parada da Qualidade continuava sem porta").not.toBeNull();
    expect(porta!.opcoes.length).toBeGreaterThanOrEqual(2);
    // ⚠️ E NUNCA um botão que compra do cliente o risco que é nosso: a casa
    // reprovou a própria peça; "aprovar assim mesmo" seria transferir para ele
    // o que este freio existe para segurar.
    for (const o of porta!.opcoes) {
      expect(o.rotulo, "nenhuma opção pode oferecer entregar o que a casa reprovou")
        .not.toMatch(/assim mesmo|do mesmo jeito|aprovar/i);
    }
  });

  it("IA fora do ar é PISCADA, não decisão: volta para a fila e o despertador retoma", async () => {
    novoPedido({
      status: "triado", scopeDecision: "ciclo", projectId: "prj-1", taskId: "task-1",
    });
    generate.mockResolvedValueOnce({ ok: false, error: "sem chave de IA" });

    const r = await produzirPedido("pc-1");
    expect(r.ok).toBe(false);
    const gravado = pedidos.get("pc-1")!;
    // Continua "triado" — a fila que o despertador varre — com o motivo visível
    // e o contador andando. Chamar gente por causa de rede é caro num item barato.
    expect(gravado.status).toBe("triado");
    expect(gravado.productionAttempts).toBe(1);
    expect(String(gravado.declineReason)).toContain("sem chave de IA");
  });

  it("depois do teto de tentativas a piscada vira problema de gente, com o número", async () => {
    novoPedido({
      status: "triado", scopeDecision: "ciclo", projectId: "prj-1", taskId: "task-1",
      productionAttempts: 4,
    });
    generate.mockResolvedValueOnce({ ok: false, error: "sem chave de IA" });

    await produzirPedido("pc-1");
    const gravado = pedidos.get("pc-1")!;
    expect(gravado.status).toBe("precisa_decisao");
    expect(String(gravado.declineReason)).toContain("5 vezes");
  });

  it("escopo extra sem o aceite do cliente NÃO produz — o gatilho de aprovação é do servidor", async () => {
    novoPedido({
      status: "triado", scopeDecision: "extra", quoteStatus: "pendente", quotedPrice: 350,
      projectId: "prj-1", taskId: "task-1",
    });
    const r = await produzirPedido("pc-1");
    expect(r.ok).toBe(false);
    expect(generate).not.toHaveBeenCalled();
    expect(db.deliverable.create).not.toHaveBeenCalled();
    // Continua triado: esperar o cliente não é defeito.
    expect(pedidos.get("pc-1")!.status).toBe("triado");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("duplo clique — a idempotência é do BANCO, nunca da memória", () => {
  it("dois envios simultâneos triam UMA vez só: quem perde a trava não roda", async () => {
    novoPedido();
    generate.mockResolvedValue({
      ok: true,
      data: { atendimentoId: "producao-de-video", confianca: 92, motivo: "reel pronto" },
    });

    const [a, b] = await Promise.all([triarPedido("pc-1"), triarPedido("pc-1")]);
    const ganharam = [a, b].filter((r) => r.ok);
    expect(ganharam).toHaveLength(1);
    // UMA tarefa. Duas seriam dois trabalhos e duas cobranças.
    expect(db.task.create).toHaveBeenCalledTimes(1);
  });

  it("produzir duas vezes o mesmo pedido devolve a peça que já existe", async () => {
    novoPedido({
      status: "triado", scopeDecision: "ciclo",
      projectId: "prj-1", taskId: "task-1",
    });
    generate.mockResolvedValueOnce({ ok: true, data: roteirosValidos() });
    generate.mockResolvedValueOnce({ ok: true, data: { verdict: "approved", issues: [], note: "boa" } });

    const primeira = await produzirPedido("pc-1");
    expect(primeira.ok).toBe(true);

    const segunda = await produzirPedido("pc-1");
    expect(segunda).toMatchObject({ ok: true, deliverableId: "del-1", jaExistia: true });
    // UMA peça. Duas seriam o cliente recebendo o mesmo trabalho em dobro.
    expect(db.deliverable.create).toHaveBeenCalledTimes(1);
  });

  it("a passagem inteira numa chamada: no ciclo, o cliente aperta enviar e já sai peça", async () => {
    novoPedido();
    // Cliente com contrato de social em ciclo aberto → o trabalho já está pago.
    db.cycle.findFirst.mockResolvedValue({ id: "ciclo-1" });
    db.project.findUnique.mockResolvedValue({ clientRequestId: "req-1" });
    db.clientRequestDb.findUnique.mockResolvedValue({ services: JSON.stringify(["Social Media"]) });

    generate.mockResolvedValueOnce({ ok: true, data: { atendimentoId: "producao-de-video", confianca: 95, motivo: "reel pronto" } });
    generate.mockResolvedValueOnce({ ok: true, data: roteirosValidos() });
    generate.mockResolvedValueOnce({ ok: true, data: { verdict: "approved", issues: [], note: "boa" } });

    const r = await atenderPedido("pc-1");
    expect(r.produziu).toBe(true);
    expect(r.status).toBe("entregue");
    // No ciclo NÃO se cobra: a peça já está paga pela mensalidade.
    expect(r.preco).toBeNull();
    expect(criarCard).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// O VERBO E A QUANTIDADE — a regressão de 06/08/2026, com as duas metades
//
// O pedido `cmsg7anke00030ps260acx43s` foi orçado como "1 Reel — R$ 350" quando
// o cliente tinha escrito "PRECISO DO ROTEIRO COM AS FALAS para produzir os
// videos". Três erros de uma vez: insumo classificado como peça final,
// quantidade no plural virando 1, e trabalho já entregue sendo cobrado.
//
// A metade que BARRA vem primeiro; a metade que NÃO PODE atrapalhar vem logo
// depois, porque uma trava que também barra o caso limpo não é trava, é atrito.
describe("o verbo do pedido — insumo não é peça final", () => {
  it("o texto exato do CEO NÃO vira orçamento de reel", async () => {
    novoPedido({
      title: "Precisamos criar videos meus falando das principais features do foocc…",
      description:
        "Precisamos criar videos meus falando das principais features do foocci para reels e Youtube. " +
        "Preciso do roteiro com as falas paras produzir os videos e assim usar nas redes sociais e no site. " +
        "Alem disso preciso de videos explicando os produtos para os clientes que serao atendidos pelo SDR no whatsapp.",
    });
    // O modelo repete o erro de 06/08 — de propósito. A trava não pode depender
    // de o modelo acertar: é justamente ele que errou.
    generate.mockResolvedValueOnce({
      ok: true,
      data: { atendimentoId: "producao-de-video", confianca: 95, motivo: "é vídeo para reels" },
    });

    const r = await triarPedido("pc-1");
    expect(r.ok).toBe(false);

    const gravado = pedidos.get("pc-1")!;
    expect(gravado.status).toBe("precisa_decisao");
    // NENHUM número na frente do CEO. Este é o bullet que ele leu no celular.
    expect(gravado.quotedPrice ?? null).toBeNull();
    expect(gravado.quoteStatus ?? null).toBeNull();
    // E nada foi produzido nem cobrado.
    expect(db.task.create).not.toHaveBeenCalled();
    expect(String(gravado.declineReason)).toMatch(/texto|roteiro/i);
  });

  it("“preciso do roteiro” classificado como reel PARA — mesmo com confiança alta", async () => {
    novoPedido({ description: "Preciso do roteiro com as falas para eu gravar o vídeo do combo." });
    generate.mockResolvedValueOnce({
      ok: true,
      data: { atendimentoId: "producao-de-video", confianca: 99, motivo: "vídeo" },
    });
    const r = await triarPedido("pc-1");
    expect(r.ok).toBe(false);
    expect(pedidos.get("pc-1")!.status).toBe("precisa_decisao");
    expect(pedidos.get("pc-1")!.quotedPrice ?? null).toBeNull();
  });

  it("roteiro avulso não tem preço de tabela — e preço que não existe NÃO se inventa", async () => {
    novoPedido({ description: "Preciso do roteiro com as falas para eu gravar o vídeo do combo." });
    // Agora o modelo acerta o atendimento. Mesmo assim não sai número: a casa
    // não tem linha de tabela para roteiro avulso, e nulo não vira palpite.
    generate.mockResolvedValueOnce({
      ok: true,
      data: { atendimentoId: "roteiro-de-video", confianca: 97, motivo: "ele pediu o roteiro" },
    });
    const r = await triarPedido("pc-1");
    expect(r.ok).toBe(false);
    const gravado = pedidos.get("pc-1")!;
    expect(gravado.status).toBe("precisa_decisao");
    expect(gravado.quotedPrice ?? null).toBeNull();
    expect(String(gravado.declineReason)).toMatch(/orçamento/i);
  });

  // ── A METADE QUE NÃO PODE ATRAPALHAR ──────────────────────────────────────
  it("“quero um reel pronto” continua virando reel, sem atrito e com preço da tabela", async () => {
    novoPedido({ description: "Quero um reel pronto do combo do almoço, editado e com legenda animada." });
    generate.mockResolvedValueOnce({
      ok: true,
      data: { atendimentoId: "producao-de-video", confianca: 93, motivo: "ele quer o vídeo pronto" },
    });
    const r = await triarPedido("pc-1");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.triado!.preco).toBe(precoDaTabela("1-reel"));
    expect(pedidos.get("pc-1")!.status).toBe("triado");
  });

  it("“um reel COM roteiro e edição”: o roteiro é atributo da peça, não o pedido", async () => {
    novoPedido({ description: "Quero um reel com roteiro, edição e legendas animadas para o cardápio novo." });
    generate.mockResolvedValueOnce({
      ok: true,
      data: { atendimentoId: "producao-de-video", confianca: 91, motivo: "reel completo" },
    });
    const r = await triarPedido("pc-1");
    expect(r.ok).toBe(true);
  });
});

describe("a quantidade — não contada NÃO vira 1", () => {
  it("plural sem número para, e o motivo diz que não deu para contar", async () => {
    novoPedido({ description: "Quero uns reels prontos mostrando os pratos do cardápio novo." });
    generate.mockResolvedValueOnce({
      ok: true,
      data: { atendimentoId: "producao-de-video", confianca: 96, motivo: "reels" },
    });
    const r = await triarPedido("pc-1");
    expect(r.ok).toBe(false);
    const gravado = pedidos.get("pc-1")!;
    expect(gravado.status).toBe("precisa_decisao");
    expect(gravado.quotedPrice ?? null).toBeNull();
    expect(String(gravado.declineReason)).toMatch(/quantas|contar/i);
  });

  it("pediu 3 e a tabela só tem preço de 1: para, com o número na mensagem", async () => {
    novoPedido({ description: "Quero 3 reels prontos para a semana do dia das mães." });
    generate.mockResolvedValueOnce({
      ok: true,
      data: { atendimentoId: "producao-de-video", confianca: 96, motivo: "reels" },
    });
    const r = await triarPedido("pc-1");
    expect(r.ok).toBe(false);
    expect(String(pedidos.get("pc-1")!.declineReason)).toContain("3");
    expect(pedidos.get("pc-1")!.quotedPrice ?? null).toBeNull();
  });

  it("item de PACOTE não é barrado pela contagem — o preço dele já é de um conjunto", async () => {
    novoPedido({ description: "Quero mais posts esse mês, uns oito, para o calendário de agosto." });
    generate.mockResolvedValueOnce({
      ok: true,
      data: { atendimentoId: "pauta-do-mes", confianca: 94, motivo: "é o mês inteiro" },
    });
    const r = await triarPedido("pc-1");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.triado!.preco).toBe(precoDaTabela("balcao-pacote-mes"));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// A TERCEIRA FAMÍLIA — operação sobre o trabalho já contratado
//
// A junta que arrebentou em 06/08/2026: cada peça passava no seu teste e o
// pedido `cmshiesdq00000pp2adk7zxe4` mesmo assim parou. A triagem só conhecia
// "peça nova no ciclo" e "peça nova como escopo extra"; "adiantem o calendário
// um dia" não é nenhuma das duas, não casou com a carta de atendimentos e virou
// `precisa_decisao` esperando gente que nunca veio.
describe("família 3 — OPERAÇÃO sobre o que já existe", () => {
  const PEDIDO_DO_CEO =
    "Eu quero que você adiante. É preciso dar calendário de posts para hoje. Então, ao invés do primeiro post, o primeiro carrossel, que está programado pra amanhã, é preciso que vocês adiantem um dia e possam o primeiro carrossel hoje.";

  // O calendário nasce RELATIVO ao relógio, não em datas fixas. A versão
  // anterior fixava 2026-08-07/08/09 às 10:00 — e no dia 07, a partir das 10:01,
  // as duas asserções desta prova viravam impossíveis ao mesmo tempo: "nenhuma
  // data no passado" exige > agora, e "andou para trás" exigia < 07 às 10:00.
  // Não era regressão do código: era o teste marcando encontro com o calendário.
  // O comentário abaixo já avisava disso e a fixture não seguiu o próprio aviso.
  const UM_DIA = 24 * 60 * 60_000;
  let original: number[] = [];

  beforeEach(() => {
    // Duas casas de folga à frente: sobra espaço para a peça andar UM dia para
    // trás e ainda assim continuar no futuro, a qualquer hora que isto rode.
    const base = new Date(Date.now() + 2 * UM_DIA);
    base.setHours(10, 0, 0, 0);
    calendario = ["Carrossel 1", "Carrossel 2", "Carrossel 3"].map((c, i) => ({
      id: `sp-${i + 1}`, clientId: "cli-1", status: "scheduled",
      scheduledFor: new Date(base.getTime() + i * UM_DIA), caption: c,
    }));
    original = calendario.map((p) => p.scheduledFor!.getTime());
  });

  it("METADE 1 — o pedido do CEO é EXECUTADO, sem IA e sem virar decisão humana", async () => {
    novoPedido({ title: "Adiantar o calendário", description: PEDIDO_DO_CEO });

    const r = await triarPedido("pc-1");

    expect(r.ok, "a operação tem de ser executada, não parada").toBe(true);
    expect(r.ok && r.executado?.movidas).toBe(3);
    // NENHUMA chamada de IA: operação simples não pode depender de provedor.
    expect(generate).not.toHaveBeenCalled();
    // O pedido saiu do balde com estado próprio, lido pelos dois lados.
    expect(pedidos.get("pc-1")!.status).toBe("executado");
    expect(pedidos.get("pc-1")!.declineReason).toBeNull();
    // As datas andaram para trás mantendo o ESPAÇAMENTO, e nenhuma caiu no
    // passado. A asserção é relativa de propósito: a triagem usa o relógio de
    // verdade, e travar a prova numa data fixa faria o teste quebrar por hora
    // do dia — que é ruído, não regressão.
    const novas = calendario.map((p) => p.scheduledFor!.getTime());
    expect(novas[1]! - novas[0]!).toBe(UM_DIA);
    expect(novas[2]! - novas[1]!).toBe(UM_DIA);
    for (const t of novas) expect(t, "nenhuma data no passado").toBeGreaterThan(Date.now());
    // Comparação contra a data que a fixture REALMENTE criou, não contra uma
    // constante escrita à mão — e o tanto que andou é exatamente um dia.
    for (const [i, t] of novas.entries()) {
      expect(t, "andou para TRÁS").toBeLessThan(original[i]!);
      expect(original[i]! - t, "andou exatamente um dia").toBe(UM_DIA);
    }
    // E o cliente recebe as DATAS, não um "ok".
    const chamadas = db.portalMessage.create.mock.calls as unknown as Array<[{ data: { body: string } }]>;
    const recado = chamadas.at(-1)![0];
    expect(recado.data.body).toMatch(/→/);
    expect(recado.data.body).toMatch(/Carrossel 1/);
  });

  // A OUTRA METADE DA TRAVA DO PISO. A fixture antiga exercitava este caminho
  // por acidente (o calendário nascia no dia corrente) e depois afirmava o
  // contrário do que o código faz — por isso quebrava. Agora o caso do piso tem
  // prova PRÓPRIA, e a de cima tem folga para provar o adiantamento limpo.
  it("TRAVA DO PISO — adiantar para o passado empurra o BLOCO, sem esmagar o espaçamento", async () => {
    // Calendário colado no relógio: recuar um dia jogaria a primeira peça para
    // ontem, que é exatamente o que a trava tem de impedir.
    const base = new Date(Date.now() + 2 * 60 * 60_000);
    calendario = ["Carrossel 1", "Carrossel 2", "Carrossel 3"].map((c, i) => ({
      id: `sp-${i + 1}`, clientId: "cli-1", status: "scheduled",
      scheduledFor: new Date(base.getTime() + i * UM_DIA), caption: c,
    }));
    novoPedido({ title: "Adiantar o calendário", description: PEDIDO_DO_CEO });

    const r = await triarPedido("pc-1");

    expect(r.ok).toBe(true);
    expect(r.ok && r.executado?.empurradoPeloPiso, "o piso tem de se declarar").toBe(true);
    const novas = calendario.map((p) => p.scheduledFor!.getTime());
    // Nenhuma no passado — o que a trava existe para garantir.
    for (const t of novas) expect(t, "nenhuma data no passado").toBeGreaterThan(Date.now());
    // E o espaçamento aprovado pelo cliente continua de pé: o bloco andou
    // inteiro, não só a primeira peça (que a juntaria com a segunda).
    expect(novas[1]! - novas[0]!).toBe(UM_DIA);
    expect(novas[2]! - novas[1]!).toBe(UM_DIA);
  });

  it("METADE 2 — com o calendário já PUBLICADO, a operação recusa nomeando o estado", async () => {
    for (const p of calendario) p.status = "published";
    const antes = calendario.map((p) => p.scheduledFor!.getTime());
    novoPedido({ title: "Adiantar o calendário", description: PEDIDO_DO_CEO });

    const r = await triarPedido("pc-1");

    expect(r.ok).toBe(false);
    expect(pedidos.get("pc-1")!.status).toBe("precisa_decisao");
    expect(String(pedidos.get("pc-1")!.declineReason)).toMatch(/published/);
    expect(calendario.map((p) => p.scheduledFor!.getTime()), "nada foi tocado").toEqual(antes);
  });

  it("pedido de PEÇA NOVA continua indo para o classificador — a família 3 não sequestra", async () => {
    novoPedido();
    generate.mockResolvedValueOnce({
      ok: true,
      data: { atendimentoId: "producao-de-video", confianca: 92, motivo: "ele quer o reel pronto" },
    });
    const r = await triarPedido("pc-1");
    expect(r.ok).toBe(true);
    expect(r.ok && r.triado?.atendimento.id).toBe("producao-de-video");
    expect(generate).toHaveBeenCalled();
  });
});
