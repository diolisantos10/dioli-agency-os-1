// O RAMO QUE NÃO EXISTIA — app/api/portal/approvals/route.ts, ação "cancel".
//
// Ordem do CEO, 29/08/2026: "Cancelar avisa cliente e agência, e interrompe a
// produção na hora." Até 29/08 as OUTRAS três decisões do contrato
// (`portal/decisoes-do-portal.ts`) tinham chamador — só "cancel" gravava o
// status e parava aí. Este arquivo prende a JUNTA: a rota CHAMA a função certa,
// com os dados certos, e só quando o comentário existe.

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
const cancelarPorPedidoDoCliente = vi.hoisted(() => vi.fn());
const recusarPorPedidoDoCliente = vi.hoisted(() => vi.fn());
const refazerPorPedidoDoCliente = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/client", () => ({ prisma: db }));
vi.mock("@/lib/agency/persistence/portal-access-service", () => ({ validatePortalAccess }));
vi.mock("@/lib/agency/persistence/approval-service", () => ({ updateApprovalStatus, addApprovalComment }));
vi.mock("@/lib/agency/execution/create-project-from-request", () => ({ createProjectFromRequest: vi.fn() }));
vi.mock("@/lib/agency/execution/run-execution", () => ({ runProjectExecution: vi.fn() }));
vi.mock("@/lib/agency/execution/negotiate-proposal", () => ({ negotiateProposal: vi.fn() }));
vi.mock("@/lib/agency/execution/assess-resources", () => ({ assessResources: vi.fn() }));
vi.mock("@/lib/agency/esteira/refacao", () => ({
  cancelarPorPedidoDoCliente, recusarPorPedidoDoCliente, refazerPorPedidoDoCliente,
}));

import { POST } from "@/app/api/portal/approvals/route";

const APROVACAO = {
  id: "ap1", clientRequestId: "cr1", department: "social-media",
  clientVisible: true, status: "pending", questionOpenedAt: null as Date | null,
  clientRequest: { id: "cr1", clientId: "c1" },
  sourcePostIdsJson: "[]",
  deliverableVersion: null as { deliverableId: string } | null,
};

function req(body: Record<string, unknown>): NextRequest {
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
  db.socialPost.updateMany.mockResolvedValue({ count: 0 });
  updateApprovalStatus.mockResolvedValue({ id: "ap1", status: "cancelled", reviewedAt: new Date() });
  addApprovalComment.mockResolvedValue({ id: "cm1" });
  cancelarPorPedidoDoCliente.mockResolvedValue({
    entregasCanceladas: ["Pauta do Mês"], escalado: true, avisouCliente: true,
  });
});

describe("cancelar exige ressalva — mesma régua da recusa e do ajuste", () => {
  it("cancelar SEM comentário → 400, e a corrente inteira fica parada", async () => {
    const res = await POST(req({ action: "cancel" }));
    expect(res.status).toBe(400);
    expect(updateApprovalStatus).not.toHaveBeenCalled();
    expect(cancelarPorPedidoDoCliente).not.toHaveBeenCalled();
  });

  it("comentário só de espaços não conta", async () => {
    const res = await POST(req({ action: "cancel", comment: "   " }));
    expect(res.status).toBe(400);
  });
});

describe("cancelar COM ressalva chama o motor certo, com os dados certos", () => {
  it("o RAMO EXISTE agora: cancelarPorPedidoDoCliente é chamado", async () => {
    const res = await POST(req({ action: "cancel", comment: "não precisamos mais disso" }));
    expect(res.status).toBe(200);
    expect(cancelarPorPedidoDoCliente).toHaveBeenCalledOnce();
  });

  it("a rota manda o comentário DELE, o departamento do card e a peça apontada por FK", async () => {
    db.approvalRequest.findUnique.mockResolvedValue({
      ...APROVACAO, deliverableVersion: { deliverableId: "d1" },
    });
    await POST(req({ action: "cancel", comment: "cancela essa peça" }));
    expect(cancelarPorPedidoDoCliente).toHaveBeenCalledWith(expect.objectContaining({
      clientRequestId: "cr1",
      department: "social-media",
      comentario: "cancela essa peça",
      deliverableId: "d1",
    }));
  });

  it("card de proposta NÃO chama cancelarPorPedidoDoCliente — cancelar proposta não produz nada a parar", async () => {
    db.approvalRequest.findUnique.mockResolvedValue({ ...APROVACAO, department: "proposal" });
    await POST(req({ action: "cancel", comment: "não quero mais a proposta" }));
    expect(cancelarPorPedidoDoCliente).not.toHaveBeenCalled();
  });

  it("uma falha em cancelarPorPedidoDoCliente não derruba a resposta ao cliente (best-effort declarado)", async () => {
    cancelarPorPedidoDoCliente.mockRejectedValue(new Error("banco fora do ar"));
    const res = await POST(req({ action: "cancel", comment: "cancela" }));
    expect(res.status).toBe(200);
  });
});

describe("cancelar NÃO reabre nem promove nada — é a mesma trava que a recusa já tem", () => {
  it("cancelar não aciona a refação nem a recusa — são três motores distintos", async () => {
    await POST(req({ action: "cancel", comment: "cancela" }));
    expect(refazerPorPedidoDoCliente).not.toHaveBeenCalled();
    expect(recusarPorPedidoDoCliente).not.toHaveBeenCalled();
  });
});
