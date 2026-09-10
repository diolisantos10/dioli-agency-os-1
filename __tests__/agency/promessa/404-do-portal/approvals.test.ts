// POST /api/portal/approvals — posse negada é 404, NUNCA 403.
//
// ═══════════════════════════════════════════════════════════════════════════
// O QUE ESTE ARQUIVO PROVA
// ═══════════════════════════════════════════════════════════════════════════
//
// `belongsToToken === false` respondia 403 "Approval not accessible with
// this token" — e o approval JÁ EXISTIA (passou o `!approval` de cima, que
// devolve 404 "Approval not found"). 403 ali confirmava a um chamador
// sondando ids que aquele approvalRequestId existe e pertence a outra conta.
// Convertido para 404, com a MESMA mensagem do "não existe".
//
// As DUAS metades: barra o caso plantado (outro dono → 404) e não acusa o
// caso limpo (dono legítimo → 200).

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
vi.mock("@/lib/agency/esteira/refacao", () => ({
  refazerPorPedidoDoCliente: vi.fn(),
  recusarPorPedidoDoCliente: vi.fn(),
}));

import { POST } from "@/app/api/portal/approvals/route";

const APROVACAO_DO_DONO = {
  id: "ap1", clientRequestId: "cr1", department: "social-media",
  clientVisible: true, status: "pending", questionOpenedAt: null as Date | null,
  clientRequest: { id: "cr1", clientId: "c1" },
};

function req(body: Record<string, unknown>): NextRequest {
  // "sec-fetch-site: same-origin" satisfaz a FAIXA 1 do CSRF — não é o que
  // este arquivo mede.
  return new NextRequest("http://localhost/api/portal/approvals", {
    method: "POST",
    headers: { "sec-fetch-site": "same-origin" },
    body: JSON.stringify({ token: "tok-c1", approvalRequestId: "ap1", ...body }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  db.approvalRequest.update.mockResolvedValue({});
  db.approvalRequest.count.mockResolvedValue(1);
  addApprovalComment.mockResolvedValue({ id: "cm1" });
});

describe("posse do approval — 404, nunca 403", () => {
  it("🔴 approval de OUTRO cliente: 404 com a MESMA mensagem do 'não existe'", async () => {
    validatePortalAccess.mockResolvedValue({ valid: true, record: { clientRequestId: "cr-DE-OUTRO", clientId: null } });
    db.approvalRequest.findUnique.mockResolvedValue({ ...APROVACAO_DO_DONO }); // existe, mas é de cr1/c1
    db.clientRequestDb.findUnique.mockResolvedValue({ clientId: "c-nada-a-ver" });

    const res = await POST(req({ action: "question", comment: "oi" }));
    expect(res.status).toBe(404);
    const corpo = await res.json();
    expect(corpo.error).toBe("Approval not found");
    expect(updateApprovalStatus).not.toHaveBeenCalled();
    expect(addApprovalComment).not.toHaveBeenCalled();
  });

  it("approvalRequestId que nunca existiu: MESMO status, MESMO corpo do caso 'de outro cliente'", async () => {
    validatePortalAccess.mockResolvedValue({ valid: true, record: { clientRequestId: "cr-DE-OUTRO", clientId: null } });

    // Caso 1: o id não existe de verdade.
    db.approvalRequest.findUnique.mockResolvedValueOnce(null);
    const rNaoExiste = await POST(req({ action: "question", comment: "oi" }));

    // Caso 2: o id existe, mas é de outro cliente.
    db.approvalRequest.findUnique.mockResolvedValueOnce({ ...APROVACAO_DO_DONO });
    db.clientRequestDb.findUnique.mockResolvedValue({ clientId: "c-nada-a-ver" });
    const rDeOutro = await POST(req({ action: "question", comment: "oi" }));

    expect(rNaoExiste.status).toBe(rDeOutro.status);
    expect(await rNaoExiste.json()).toEqual(await rDeOutro.json());
  });

  it("🟢 a metade que falta: o DONO legítimo continua decidindo (200)", async () => {
    validatePortalAccess.mockResolvedValue({ valid: true, record: { clientRequestId: "cr1", clientId: null } });
    db.approvalRequest.findUnique.mockResolvedValue({ ...APROVACAO_DO_DONO });

    const res = await POST(req({ action: "question", comment: "essa peça vai no feed?" }));
    expect(res.status).toBe(200);
    const corpo = await res.json();
    expect(corpo.status).toBe("pending");
    expect(corpo.questionOpen).toBe(true);
    expect(addApprovalComment).toHaveBeenCalled();
  });
});
