// O coração do portal (Fase 2 do Hub): os três caminhos da aprovação.
//
// Estes testes travam as duas regras novas do backend:
// 1. "Solicitar ajustes" / "Rejeitar" SEM comentário → 400. Refazer no escuro
//    produz outra peça errada e queima tentativa (Fase 1, 1.10 fechado).
// 2. "Tenho uma dúvida" NÃO decide: status continua "pending", a dúvida fica
//    presa ao card e o prazo PAUSA — o relógio não corre contra o cliente
//    enquanto a bola está com a agência (T5/T5b da tabela de transições).

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const db = vi.hoisted(() => ({
  approvalRequest: { findUnique: vi.fn(), update: vi.fn(), count: vi.fn() },
  clientRequestDb: { findUnique: vi.fn() },
  socialPost: { updateMany: vi.fn() },
  project: { findFirst: vi.fn() },
  materialRequest: { create: vi.fn() },
  portalMessage: { create: vi.fn() },
}));
const validatePortalAccess = vi.hoisted(() => vi.fn());
const updateApprovalStatus = vi.hoisted(() => vi.fn());
const addApprovalComment = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/client", () => ({ prisma: db }));
vi.mock("@/lib/agency/persistence/portal-access-service", () => ({ validatePortalAccess }));
vi.mock("@/lib/agency/persistence/approval-service", () => ({ updateApprovalStatus, addApprovalComment }));
vi.mock("@/lib/agency/execution/create-project-from-request", () => ({ createProjectFromRequest: vi.fn() }));
vi.mock("@/lib/agency/execution/run-execution", () => ({ runProjectExecution: vi.fn() }));
vi.mock("@/lib/agency/execution/negotiate-proposal", () => ({ negotiateProposal: vi.fn() }));
vi.mock("@/lib/agency/execution/assess-resources", () => ({ assessResources: vi.fn() }));
const refazer = vi.hoisted(() => vi.fn());
vi.mock("@/lib/agency/esteira/refacao", () => ({ refazerPorPedidoDoCliente: refazer }));

import { POST } from "@/app/api/portal/approvals/route";

const APROVACAO = {
  id: "ap1", clientRequestId: "cr1", department: "social-media",
  clientVisible: true, status: "pending", questionOpenedAt: null as Date | null,
  clientRequest: { id: "cr1", clientId: "c1" },
};

function req(body: Record<string, unknown>): NextRequest {
  // "sec-fetch-site: same-origin" — a FAIXA 1 do CSRF (navegacao-cross-site.ts)
  // bloqueia por padrão sem este sinal; aqui simulamos o navegador legítimo.
  return new NextRequest("http://localhost/api/portal/approvals", {
    method: "POST",
    headers: { "sec-fetch-site": "same-origin" },
    body: JSON.stringify({ token: "tok-1", approvalRequestId: "ap1", ...body }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  validatePortalAccess.mockResolvedValue({ valid: true, record: { clientRequestId: "cr1", clientId: null } });
  db.approvalRequest.findUnique.mockResolvedValue({ ...APROVACAO });
  db.approvalRequest.update.mockResolvedValue({});
  db.approvalRequest.count.mockResolvedValue(1);
  updateApprovalStatus.mockResolvedValue({ id: "ap1", status: "revision_requested", reviewedAt: new Date() });
  addApprovalComment.mockResolvedValue({ id: "cm1" });
  refazer.mockResolvedValue({ refeitas: [], versoesNovas: [], escalado: false, avisouCliente: true });
});

describe("comentário obrigatório — a spec manda 400 no backend", () => {
  it("solicitar ajustes sem comentário → 400 e NENHUM efeito", async () => {
    const res = await POST(req({ action: "request_revision" }));
    expect(res.status).toBe(400);
    expect(updateApprovalStatus).not.toHaveBeenCalled();
    expect(refazer).not.toHaveBeenCalled();
  });

  it("comentário só de espaços não conta como comentário", async () => {
    const res = await POST(req({ action: "request_revision", comment: "   " }));
    expect(res.status).toBe(400);
  });

  it("rejeitar sem motivo também é 400 — rejeição muda não ensina nada à refação", async () => {
    const res = await POST(req({ action: "reject" }));
    expect(res.status).toBe(400);
    expect(updateApprovalStatus).not.toHaveBeenCalled();
  });

  it("com comentário, o ajuste segue o fluxo normal e a refação recebe as palavras do cliente", async () => {
    const res = await POST(req({ action: "request_revision", comment: "muito formal, quero mais leve" }));
    expect(res.status).toBe(200);
    expect(updateApprovalStatus).toHaveBeenCalledWith("ap1", "revision_requested", expect.any(String), "muito formal, quero mais leve");
    expect(refazer.mock.calls[0]![0].comentario).toBe("muito formal, quero mais leve");
  });

  it("aprovar continua funcionando SEM comentário — só decisão negativa exige palavras", async () => {
    updateApprovalStatus.mockResolvedValue({ id: "ap1", status: "approved", reviewedAt: new Date() });
    const res = await POST(req({ action: "approve" }));
    expect(res.status).toBe(200);
  });
});

describe("tenho uma dúvida — não decide, pausa o prazo", () => {
  it("não muda o status: updateApprovalStatus nunca é chamado", async () => {
    const res = await POST(req({ action: "question", comment: "esse post vai no feed ou no story?" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("pending");
    expect(json.questionOpen).toBe(true);
    expect(updateApprovalStatus).not.toHaveBeenCalled();
    expect(refazer).not.toHaveBeenCalled();
  });

  it("a dúvida fica PRESA ao card: ApprovalComment kind 'question', visível ao cliente", async () => {
    await POST(req({ action: "question", comment: "para que serve essa peça?" }));
    expect(addApprovalComment).toHaveBeenCalledWith(expect.objectContaining({
      approvalRequestId: "ap1", kind: "question", isClientVisible: true, authorRole: "client",
      body: "para que serve essa peça?",
    }));
  });

  it("abre a pausa do prazo: questionOpenedAt é gravado", async () => {
    await POST(req({ action: "question", comment: "dúvida" }));
    expect(db.approvalRequest.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "ap1" },
      data: { questionOpenedAt: expect.any(Date) },
    }));
  });

  it("segunda dúvida com pausa já aberta NÃO reinicia o relógio", async () => {
    db.approvalRequest.findUnique.mockResolvedValue({ ...APROVACAO, questionOpenedAt: new Date("2026-08-01") });
    await POST(req({ action: "question", comment: "outra dúvida" }));
    expect(db.approvalRequest.update).not.toHaveBeenCalled();
  });

  it("dúvida sem texto é card mudo → 400", async () => {
    const res = await POST(req({ action: "question" }));
    expect(res.status).toBe(400);
    expect(addApprovalComment).not.toHaveBeenCalled();
  });

  it("posse antes de tudo: dúvida em aprovação de outro dono não passa (404, nunca 403 — oráculo de enumeração)", async () => {
    // Outro dono DE VERDADE: outra solicitação E outro cliente. (A posse agora
    // é por OR — solicitação OU clientId derivado — então o fixture precisa
    // divergir nas duas chaves para ser "de outro".)
    db.approvalRequest.findUnique.mockResolvedValue({
      ...APROVACAO, clientRequestId: "cr-DE-OUTRO", clientId: null,
      clientRequest: { id: "cr-DE-OUTRO", clientId: "c-DE-OUTRO" },
    });
    db.clientRequestDb.findUnique.mockResolvedValue({ clientId: "c1" });
    const res = await POST(req({ action: "question", comment: "dúvida" }));
    expect(res.status).toBe(404);
    expect(addApprovalComment).not.toHaveBeenCalled();
  });
});
