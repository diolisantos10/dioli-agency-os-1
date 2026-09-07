// A correção do 360° do portal (04/08/2026): cliente criado DIRETO — sem
// ClientRequestDb, o caso Foocci — passa a ter aprovação de verdade.
//
// O que estes testes travam:
//   1. A rota de EQUIPE (/api/social-posts/aprovacao) cria UM card clientVisible
//      por clientId, com os posts referenciados — e só a equipe abre.
//   2. A decisão do cliente PROPAGA aos posts: aprovar → "approved";
//      ajuste → "revision_requested" (com o comentário obrigatório intacto).
//   3. Posse por OR sem vazamento: card por clientId aparece no portal do DONO
//      e nunca no de outro cliente.
//   4. A4 fechado até o DOM: em modo cookie a URL de mídia sai SEM ?token=,
//      e a rota de mídia autentica pelo cookie httpOnly.

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const db = vi.hoisted(() => ({
  approvalRequest: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), count: vi.fn() },
  clientRequestDb: { findUnique: vi.fn(), findFirst: vi.fn() },
  socialPost: { findMany: vi.fn(), updateMany: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
  client: { findUnique: vi.fn() },
  brainArtifact: { findMany: vi.fn() },
  project: { findFirst: vi.fn() },
  deliverable: { findMany: vi.fn() },
  materialRequest: { create: vi.fn() },
  portalMessage: { create: vi.fn() },
  activityEvent: { create: vi.fn() },
  mediaAsset: { findUnique: vi.fn() },
}));
const validatePortalAccess = vi.hoisted(() => vi.fn());
const requireSession = vi.hoisted(() => vi.fn());
const createApprovalRequest = vi.hoisted(() => vi.fn());
const updateApprovalStatus = vi.hoisted(() => vi.fn());
const addApprovalComment = vi.hoisted(() => vi.fn());
const getSession = vi.hoisted(() => vi.fn());
const lerArquivo = vi.hoisted(() => vi.fn());
const assinaturaValida = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/client", () => ({ prisma: db }));
vi.mock("@/lib/agency/persistence/portal-access-service", () => ({ validatePortalAccess }));
vi.mock("@/lib/auth/api-guard", () => ({ requireSession }));
vi.mock("@/lib/auth/session", () => ({ getSession }));
vi.mock("@/lib/agency/media/armazenamento", () => ({ lerArquivo, assinaturaValida }));
vi.mock("@/lib/agency/persistence/approval-service", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/agency/persistence/approval-service")>();
  return { ...real, createApprovalRequest, updateApprovalStatus, addApprovalComment };
});
vi.mock("@/lib/agency/execution/create-project-from-request", () => ({ createProjectFromRequest: vi.fn() }));
vi.mock("@/lib/agency/execution/run-execution", () => ({ runProjectExecution: vi.fn() }));
vi.mock("@/lib/agency/execution/negotiate-proposal", () => ({ negotiateProposal: vi.fn() }));
vi.mock("@/lib/agency/execution/assess-resources", () => ({ assessResources: vi.fn() }));
vi.mock("@/lib/agency/esteira/refacao", () => ({ refazerPorPedidoDoCliente: vi.fn() }));

import { POST as abrirAprovacao } from "@/app/api/social-posts/aprovacao/route";
import { POST as decidir } from "@/app/api/portal/approvals/route";
import { GET as portalData } from "@/app/api/brain/portal-data/route";
import { GET as servirMidia } from "@/app/api/media/[id]/route";
import { urlDeMidiaDoPortal } from "@/lib/agency/portal/midia";
import { PORTAL_COOKIE } from "@/lib/agency/persistence/portal-cookie";

// ── Fixtures ────────────────────────────────────────────────────────────────

const SESSAO_MASTER = {
  session: { userId: "u1", email: "master@dioli.studio", name: "Master", role: "master", workspaceId: "ws1" },
  error: null,
};

function postFoocci(i: number, over: Record<string, unknown> = {}) {
  return {
    id: `sp${i}`, clientId: "cli-foocci", caption: `Carrossel ${i} — como o Foocci resolve o dia do dono de restaurante.`,
    format: "carousel", pillar: "lançamento", status: "draft", visibility: "compartilhado",
    scenesJson: JSON.stringify([`capa da peça ${i}`, `dor do dono ${i}`, `CTA ${i}`]),
    scheduledFor: new Date(2026, 7, 10 + i),
    ...over,
  };
}
const SEIS_POSTS = [1, 2, 3, 4, 5, 6].map((i) => postFoocci(i));
const SEIS_IDS = SEIS_POSTS.map((p) => p.id);

const CARD_FOOCCI = {
  id: "ap-cal", clientRequestId: null, clientId: "cli-foocci",
  department: "social-media", clientVisible: true, status: "pending",
  questionOpenedAt: null, clientRequest: null,
  sourcePostIdsJson: JSON.stringify(SEIS_IDS),
  reviewNote: "Carrosséis de lançamento — 6 peças\n\n…",
};

function reqEquipe(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/social-posts/aprovacao", {
    method: "POST", body: JSON.stringify(body),
  });
}
function reqDecisao(body: Record<string, unknown>): NextRequest {
  // "sec-fetch-site: same-origin" — a FAIXA 1 do CSRF (navegacao-cross-site.ts)
  // bloqueia por padrão sem este sinal; aqui simulamos o navegador legítimo.
  return new NextRequest("http://localhost/api/portal/approvals", {
    method: "POST",
    headers: { "sec-fetch-site": "same-origin" },
    body: JSON.stringify({ token: "tok-foocci", approvalRequestId: "ap-cal", ...body }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  requireSession.mockResolvedValue(SESSAO_MASTER);
  db.socialPost.findMany.mockResolvedValue(SEIS_POSTS);
  db.socialPost.updateMany.mockResolvedValue({ count: 6 });
  db.activityEvent.create.mockResolvedValue({});
  db.portalMessage.create.mockResolvedValue({});
  db.socialPost.update.mockResolvedValue({});
  db.socialPost.findFirst.mockResolvedValue(null);
  db.approvalRequest.findMany.mockResolvedValue([]);
  db.approvalRequest.findUnique.mockResolvedValue({ ...CARD_FOOCCI });
  db.approvalRequest.update.mockResolvedValue({});
  db.approvalRequest.count.mockResolvedValue(0);
  createApprovalRequest.mockResolvedValue({ id: "ap-cal" });
  updateApprovalStatus.mockResolvedValue({ id: "ap-cal", status: "approved", reviewedAt: new Date() });
  addApprovalComment.mockResolvedValue({ id: "cm1" });
  validatePortalAccess.mockResolvedValue({ valid: true, record: { clientRequestId: null, clientId: "cli-foocci" } });
});

// ── 1. A rota de equipe abre o card ─────────────────────────────────────────

describe("POST /api/social-posts/aprovacao — a equipe abre a aprovação do calendário", () => {
  it("cria UM card clientVisible por clientId, com os 6 posts referenciados", async () => {
    const res = await abrirAprovacao(reqEquipe({ postIds: SEIS_IDS }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.approvalRequestId).toBe("ap-cal");
    expect(json.titulo).toBe("Carrosséis de lançamento — 6 peças");

    expect(createApprovalRequest).toHaveBeenCalledTimes(1);
    const arg = createApprovalRequest.mock.calls[0]![0];
    expect(arg.clientId).toBe("cli-foocci");
    expect(arg.clientVisible).toBe(true);
    expect(arg.department).toBe("social-media");
    expect(arg.sourcePostIds).toEqual(SEIS_IDS);
    // Origem marcada: quem abriu foi a equipe, não o fluxo Brain.
    expect(arg.requestedBy).toContain("equipe:");
    // O corpo é o formato que o portal já renderiza: título na 1ª linha,
    // peças com legenda e TELAS (scenesJson) no resto.
    expect(arg.reviewNote.split("\n")[0]).toBe("Carrosséis de lançamento — 6 peças");
    expect(arg.reviewNote).toContain("- Telas: 1) capa da peça 1");
    expect(arg.reviewNote).toContain("- Legenda: Carrossel 3");
  });

  it("sem sessão de equipe → 401; cliente não abre aprovação para si", async () => {
    requireSession.mockResolvedValue({ session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) });
    const res = await abrirAprovacao(reqEquipe({ postIds: SEIS_IDS }));
    expect(res.status).toBe(401);
    expect(createApprovalRequest).not.toHaveBeenCalled();
  });

  it("posts de clientes MISTURADOS não viram um card — um cliente não decide pelo outro", async () => {
    db.socialPost.findMany.mockResolvedValue([postFoocci(1), postFoocci(2, { clientId: "cli-outro" })]);
    const res = await abrirAprovacao(reqEquipe({ postIds: ["sp1", "sp2"] }));
    expect(res.status).toBe(400);
    expect(createApprovalRequest).not.toHaveBeenCalled();
  });

  it("post 'interno' não entra em card clientVisible — fail-closed", async () => {
    db.socialPost.findMany.mockResolvedValue([postFoocci(1, { visibility: "interno" })]);
    const res = await abrirAprovacao(reqEquipe({ postIds: ["sp1"] }));
    expect(res.status).toBe(400);
    expect(createApprovalRequest).not.toHaveBeenCalled();
  });

  it("post já num card pendente → 409; a mesma peça não se decide duas vezes", async () => {
    db.approvalRequest.findMany.mockResolvedValue([
      { id: "ap-antigo", sourcePostIdsJson: JSON.stringify(["sp3"]) },
    ]);
    const res = await abrirAprovacao(reqEquipe({ postIds: SEIS_IDS }));
    expect(res.status).toBe(409);
    expect(createApprovalRequest).not.toHaveBeenCalled();
  });

  it("id de post que não existe (ou de outro workspace) → 404", async () => {
    db.socialPost.findMany.mockResolvedValue([postFoocci(1)]);
    const res = await abrirAprovacao(reqEquipe({ postIds: ["sp1", "sp-fantasma"] }));
    expect(res.status).toBe(404);
  });
});

// ── 2. A decisão propaga aos posts ──────────────────────────────────────────

describe("decisão do cliente propaga status aos posts do card", () => {
  // 05/08/2026 — o beco sem saída. Aprovar gravava "approved", e NADA no
  // repositório movia `approved → scheduled`: `publicarAgendados` só busca
  // "scheduled". O cliente aprovava os 6 carrosséis, a tela dizia "Aprovado por
  // você", e nenhum post ia ao ar — nunca. A decisão agora PROMOVE a peça.
  it("aprovar → as 6 peças viram 'scheduled', que é o único estado que o relógio publica", async () => {
    const res = await decidir(reqDecisao({ action: "approve" }));
    expect(res.status).toBe(200);
    // Nenhuma peça fica em "approved": um segundo nome para o mesmo estado é
    // como nasce a próxima divergência.
    expect(db.socialPost.updateMany).not.toHaveBeenCalled();
    expect(db.socialPost.update).toHaveBeenCalledTimes(6);
    for (const call of db.socialPost.update.mock.calls) {
      expect(call[0].data.status).toBe("scheduled");
    }
    // A busca das peças é filtrada pelo dono do CARD — id de post de outro
    // cliente dentro do JSON continua intocável.
    expect(db.socialPost.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: { in: SEIS_IDS }, clientId: "cli-foocci" },
    }));
  });

  // A prova de que a corrente fecha: o estado gravado pela decisão é exatamente
  // o que `publicarAgendados` procura, e a data nunca é passado.
  it("a peça aprovada é ENCONTRADA por publicarAgendados — e nunca com data vencida", async () => {
    await decidir(reqDecisao({ action: "approve" }));
    const gravados = db.socialPost.update.mock.calls.map((c) => c[0].data as { status: string; scheduledFor: Date });

    // O filtro do relógio, escrito aqui como contrato: status + hora chegada.
    const relogio = (p: { status: string; scheduledFor: Date }, agora: Date) =>
      p.status === "scheduled" && p.scheduledFor <= agora;

    // Hoje nenhuma vai ao ar (todas no futuro): o cliente aprovou, não mandou
    // publicar agora. Amanhã de madrugada, o relógio encontra todas.
    expect(gravados.some((p) => relogio(p, new Date()))).toBe(false);
    const daquiUmMes = new Date(Date.now() + 31 * 24 * 60 * 60_000);
    expect(gravados.filter((p) => relogio(p, daquiUmMes))).toHaveLength(6);
  });

  it("pedir ajuste COM comentário → SÓ A PEÇA APONTADA vira 'revision_requested'", async () => {
    // ═══════════════════════════════════════════════════════════════════════
    // ⚠️ ESTA RÉGUA MUDOU DE LADO EM 25/08/2026 (Auditor, 5ª rodada)
    // ═══════════════════════════════════════════════════════════════════════
    //
    // Ela exigia `{ id: { in: SEIS_IDS } }` — as SEIS peças em
    // `revision_requested` por causa de um comentário que aponta UMA. Era a
    // régua carimbando o defeito como contrato.
    //
    // O que ele mediu, contra o controle: `ESTADOS_PROMOVIVEIS`
    // (`esteira/publicacao.ts`) não inclui `revision_requested`, de propósito.
    // Então as peças não apontadas ficavam INAGENDÁVEIS — trabalho pago e
    // aprovado que a fila de entrega nunca lê, sem ninguém ficar vermelho.
    //
    // Repare que o comentário deste próprio teste sempre disse "a peça 2".
    // A mira estava escrita aqui desde o começo; só o efeito é que ignorava.
    updateApprovalStatus.mockResolvedValue({ id: "ap-cal", status: "revision_requested", reviewedAt: new Date() });
    const res = await decidir(reqDecisao({ action: "request_revision", comment: "troca a capa da peça 2" }));
    expect(res.status).toBe(200);
    expect(db.socialPost.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [SEIS_IDS[1]] }, clientId: "cli-foocci" },
      data: { status: "revision_requested" },
    });

    // E as outras CINCO não são tocadas — é isso que as mantém agendáveis.
    const alvos = db.socialPost.updateMany.mock.calls[0]![0].where.id.in as string[];
    for (const [i, id] of SEIS_IDS.entries()) {
      if (i === 1) continue;
      expect(
        alvos,
        `a peça ${i + 1} não foi apontada e não pode entrar em revisão — ` +
        "revisão é estado que a fila de entrega não lê",
      ).not.toContain(id);
    }
    expect(addApprovalComment).toHaveBeenCalledWith(expect.objectContaining({
      approvalRequestId: "ap-cal", authorRole: "client", isClientVisible: true,
      body: "troca a capa da peça 2",
    }));
  });

  it("ajuste SEM comentário continua 400 — nada propaga (não regride o Lote 1)", async () => {
    const res = await decidir(reqDecisao({ action: "request_revision" }));
    expect(res.status).toBe(400);
    expect(db.socialPost.updateMany).not.toHaveBeenCalled();
    expect(updateApprovalStatus).not.toHaveBeenCalled();
  });

  it("o corpo do card (reviewNote) NÃO é reescrito pela decisão — a nota vai só ao ApprovalComment", async () => {
    updateApprovalStatus.mockResolvedValue({ id: "ap-cal", status: "revision_requested", reviewedAt: new Date() });
    await decidir(reqDecisao({ action: "request_revision", comment: "ajusta o tom" }));
    // 4º argumento (reviewNote) undefined = preserva o corpo que o cliente leu.
    expect(updateApprovalStatus).toHaveBeenCalledWith("ap-cal", "revision_requested", expect.any(String), undefined);
  });
});

// ── 3. Posse: o card aparece para o dono e NUNCA para outro ─────────────────

describe("posse por clientId — dono derivado do token, sem vazamento", () => {
  it("token de OUTRO cliente não decide o card da Foocci → 404, nunca 403 (oráculo de enumeração)", async () => {
    validatePortalAccess.mockResolvedValue({ valid: true, record: { clientRequestId: null, clientId: "cli-outro" } });
    const res = await decidir(reqDecisao({ action: "approve" }));
    expect(res.status).toBe(404);
    expect(updateApprovalStatus).not.toHaveBeenCalled();
    expect(db.socialPost.updateMany).not.toHaveBeenCalled();
  });

  it("portal-data do cliente direto busca aprovações PELO clientId do token", async () => {
    db.clientRequestDb.findFirst.mockResolvedValue(null); // sem solicitação Brain
    db.client.findUnique.mockResolvedValue({ id: "cli-foocci", name: "Foocci" });
    db.approvalRequest.findMany.mockResolvedValue([{
      ...CARD_FOOCCI, reviewedAt: null, expiresAt: null, deliverableVersion: null, comments: [],
    }]);

    const res = await portalData(new NextRequest("http://localhost/api/brain/portal-data?token=tok-foocci"));
    const json = await res.json();

    // A consulta deriva o dono do TOKEN — nunca de query/corpo.
    expect(db.approvalRequest.findMany.mock.calls[0]![0].where).toMatchObject({
      clientId: "cli-foocci", clientVisible: true,
    });
    // O Início e a aba de Aprovações passam a ter a MESMA fonte: este payload.
    expect(json.approvals).toHaveLength(1);
    expect(json.approvals[0].status).toBe("pending");
    expect(json.approvals[0].reviewNote).toContain("Carrosséis de lançamento");
  });

  it("portal-data por solicitação inclui o OR por clientId — as duas chaves do mesmo dono", async () => {
    validatePortalAccess.mockResolvedValue({ valid: true, record: { clientRequestId: "cr1", clientId: null } });
    db.clientRequestDb.findUnique.mockResolvedValue({
      id: "cr1", clientId: "cli-foocci", businessName: "Foocci", status: "in_production",
      services: "[]", objectives: "[]", briefingJson: "{}", segment: "", createdAt: new Date(),
    });
    db.brainArtifact.findMany.mockResolvedValue([]);
    db.project.findFirst.mockResolvedValue(null);

    await portalData(new NextRequest("http://localhost/api/brain/portal-data?token=tok-foocci"));
    expect(db.approvalRequest.findMany.mock.calls[0]![0].where).toMatchObject({
      clientVisible: true,
      OR: [{ clientRequestId: "cr1" }, { clientId: "cli-foocci" }],
    });
  });
});

// ── 4. A4 até o DOM: mídia sem token em modo cookie ─────────────────────────

describe("mídia sem credencial no DOM (modo cookie)", () => {
  it("urlDeMidiaDoPortal: token vazio → URL limpa; token presente → compatibilidade", () => {
    expect(urlDeMidiaDoPortal("/api/media/m1", "")).toBe("/api/media/m1");
    expect(urlDeMidiaDoPortal("/api/media/m1", "tok")).toBe("/api/media/m1?token=tok");
    expect(urlDeMidiaDoPortal("/api/media/m1?x=1", "tok")).toBe("/api/media/m1?x=1&token=tok");
    expect(urlDeMidiaDoPortal(null, "tok")).toBeNull();
  });

  it("a rota de mídia serve a capa SÓ com o cookie httpOnly — sem ?token= na URL", async () => {
    db.mediaAsset.findUnique.mockResolvedValue({
      id: "m1", clientId: "cli-foocci", clientRequestId: null, workspaceId: "ws1",
      mimeType: "image/png", sizeBytes: 4, fileName: "capa.png", storagePath: "/x/capa.png",
    });
    assinaturaValida.mockReturnValue(false);
    lerArquivo.mockResolvedValue(Buffer.from("png!"));

    const req = new NextRequest("http://localhost/api/media/m1", {
      headers: { cookie: `${PORTAL_COOKIE}=tok-foocci` },
    });
    const res = await servirMidia(req, { params: Promise.resolve({ id: "m1" }) });

    expect(res.status).toBe(200);
    // A credencial usada foi a do cookie — derivação do dono intacta.
    expect(validatePortalAccess).toHaveBeenCalledWith("tok-foocci");
  });

  it("cookie de OUTRO cliente não abre a mídia — 404, nunca 403", async () => {
    db.mediaAsset.findUnique.mockResolvedValue({
      id: "m1", clientId: "cli-foocci", clientRequestId: null, workspaceId: "ws1",
      mimeType: "image/png", sizeBytes: 4, fileName: "capa.png", storagePath: "/x/capa.png",
    });
    assinaturaValida.mockReturnValue(false);
    validatePortalAccess.mockResolvedValue({ valid: true, record: { clientRequestId: null, clientId: "cli-outro" } });

    const req = new NextRequest("http://localhost/api/media/m1", {
      headers: { cookie: `${PORTAL_COOKIE}=tok-outro` },
    });
    const res = await servirMidia(req, { params: Promise.resolve({ id: "m1" }) });
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// A FIAÇÃO DA PARADA DECLARADA — item 1 da 6ª auditoria
// ─────────────────────────────────────────────────────────────────────────────
//
// O achado, e ele é da classe que pegou esta operação cinco vezes: o Auditor
// devolveu o `console.error` no lugar da chamada a
// `declararPecasAprovadasQueNaoEntraramNaFila` em `/api/portal/approvals` e
// rodou a suíte inteira — 419 arquivos, VERDE. Os únicos testes que tocavam a
// função a chamavam DIRETO.
//
// Ou seja: a peça funcionava e a régua mirava o COMPONENTE, nunca o FIO. O
// mecanismo mais caro da rodada — a parada declarada, o bloqueio do item F —
// podia ser apagado sem uma única régua ficar vermelha. Verde que some em
// silêncio é pior que régua nenhuma: a régua nenhuma deixa a dúvida viva.
//
// Este bloco atravessa o fio inteiro pela porta do cliente: a ROTA real chama
// a promoção REAL (`agendarPecasAprovadas`), que devolve `ignorados`, que
// chega à declaração REAL, que escreve nos TRÊS destinatários. Nada aqui é
// dublê a não ser o banco. Apague a chamada na rota e os três caem juntos.

describe("a fiação da parada declarada — o clique do cliente chega aos três destinatários", () => {
  /** As seis peças do card PRESAS: aprovadas pelo cliente e num estado que
   *  `ESTADOS_PROMOVIVEIS` não aceita. É o caso do item F, medido de ponta a
   *  ponta e não montado na mão. */
  function seisPecasPresas() {
    db.socialPost.findMany.mockResolvedValue(
      SEIS_POSTS.map((p) => ({ ...p, workspaceId: "ws1", status: "revision_requested" })),
    );
  }

  it("aprovar peça presa → aviso NA PEÇA, ActivityEvent do PM e PortalMessage do cliente", async () => {
    seisPecasPresas();
    const res = await decidir(reqDecisao({ action: "approve" }));

    // A decisão do cliente vale, sempre: a declaração é best-effort e nunca
    // derruba o 200 de quem acabou de aprovar.
    expect(res.status).toBe(200);

    // 1. A PEÇA fala — é o que vira PIXEL na tela de decisão.
    expect(db.socialPost.updateMany).toHaveBeenCalledTimes(1);
    const aviso = db.socialPost.updateMany.mock.calls[0]![0];
    expect(aviso.where.id.in).toEqual(SEIS_IDS);
    expect(aviso.data.avisoAoCliente).toContain("NÃO ENTROU NA FILA");
    // Motivo, dono e próxima ação — as três palavras do critério F.
    expect(aviso.data.avisoAoCliente).toContain("Quem está com isso");
    expect(aviso.data.avisoAoCliente).toContain("Próxima ação");

    // 2. O PM recebe, no workspace das peças.
    expect(db.activityEvent.create).toHaveBeenCalledTimes(1);
    const aoPm = db.activityEvent.create.mock.calls[0]![0].data;
    expect(aoPm.workspaceId).toBe("ws1");
    expect(aoPm.type).toBe("peca_aprovada_nao_agendada");
    expect(aoPm.message).toContain("6 peça(s) APROVADAS");
    expect(aoPm.message).toContain("Próxima ação");

    // 3. O CLIENTE recebe na conversa, na língua dele.
    expect(db.portalMessage.create).toHaveBeenCalledTimes(1);
    const aoCliente = db.portalMessage.create.mock.calls[0]![0].data;
    expect(aoCliente.clientId).toBe("cli-foocci");
    expect(aoCliente.body).toContain("não entrou na fila de entrega");
    expect(aoCliente.body).toContain("não precisa aprovar de novo");
  });

  it("caso normal — NADA disso acontece: alarme sem parada mata o alarme verdadeiro", async () => {
    // As seis promovem normalmente. Sem esta metade, a régua acima ficaria
    // verde para um código que declara parada em toda aprovação.
    const res = await decidir(reqDecisao({ action: "approve" }));
    expect(res.status).toBe(200);
    expect(db.socialPost.updateMany).not.toHaveBeenCalled();
    expect(db.activityEvent.create).not.toHaveBeenCalled();
    expect(db.portalMessage.create).not.toHaveBeenCalled();
  });

  it("peça JÁ na fila não vira alarme — `scheduled` em `ignorados` é sucesso, não parada", async () => {
    db.socialPost.findMany.mockResolvedValue(
      SEIS_POSTS.map((p) => ({ ...p, workspaceId: "ws1", status: "scheduled" })),
    );
    const res = await decidir(reqDecisao({ action: "approve" }));
    expect(res.status).toBe(200);
    expect(db.activityEvent.create).not.toHaveBeenCalled();
    expect(db.portalMessage.create).not.toHaveBeenCalled();
  });
});
