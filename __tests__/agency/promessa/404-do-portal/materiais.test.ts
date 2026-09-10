// POST /api/portal/materiais — posse negada é 404, NUNCA 403.
//
// ═══════════════════════════════════════════════════════════════════════════
// O QUE ESTE ARQUIVO PROVA
// ═══════════════════════════════════════════════════════════════════════════
//
// A rota respondia 403 "Acesso negado" quando `pedidoId` não pertencia ao
// cliente do token (ou não existia). 403 CONFIRMA que o id existe e é de
// outra conta — é oráculo de enumeração. A convenção da casa é 404, e o
// corpo não pode diferenciar "não existe" de "existe mas não é seu"
// (`app/api/agency/clients/[id]/marca/route.ts`).
//
// As DUAS metades da trava, como manda a doutrina: ela barra o caso plantado
// (posse negada → 404) E não acusa o caso limpo (dono legítimo → 200).

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const db = vi.hoisted(() => ({
  materialRequest: { findFirst: vi.fn(), update: vi.fn() },
  portalMessage: { create: vi.fn() },
  $transaction: vi.fn(async (ops: unknown[]) => ops),
}));
const resolvePortalClient = vi.hoisted(() => vi.fn());
const destravarPorMaterial = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/client", () => ({ prisma: db }));
vi.mock("@/lib/agency/persistence/portal-access-service", () => ({ resolvePortalClient }));
vi.mock("@/lib/agency/persistence/portal-cookie", () => ({
  tokenDoPortal: (_r: unknown, q: string | null) => q,
}));
vi.mock("@/lib/agency/esteira/materiais", () => ({ destravarPorMaterial }));

import { POST } from "@/app/api/portal/materiais/route";

function req(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/portal/materiais", {
    method: "POST",
    body: JSON.stringify({ token: "tok-dono", pedidoId: "mr1", resposta: "já mandei", ...body }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  resolvePortalClient.mockResolvedValue({ clientId: "cli-dono", workspaceId: "ws1" });
  destravarPorMaterial.mockResolvedValue({ aindaFaltam: 0, producaoRetomada: true });
  db.portalMessage.create.mockResolvedValue({ id: "pm1" });
  db.materialRequest.update.mockResolvedValue({});
});

describe("posse do pedido de material — 404, nunca 403", () => {
  it("🔴 pedido de OUTRO cliente: 404, e o corpo não diz que o id existe", async () => {
    // O `where` da rota já filtra por `project: { clientId: dono.clientId }` —
    // pedido de outro cliente nunca aparece nesta consulta, exatamente como
    // um id inexistente.
    db.materialRequest.findFirst.mockResolvedValue(null);
    const r = await POST(req({ pedidoId: "mr-de-outro-cliente" }));
    expect(r.status).toBe(404);
    const corpo = await r.json();
    expect(corpo.error).toBe("Pedido não encontrado");
  });

  it("pedidoId que nunca existiu: MESMO status, MESMO corpo do caso 'de outro cliente'", async () => {
    db.materialRequest.findFirst.mockResolvedValue(null);
    const r1 = await POST(req({ pedidoId: "existe-mas-e-de-outro" }));
    const r2 = await POST(req({ pedidoId: "nunca-existiu" }));
    expect(r1.status).toBe(r2.status);
    expect(await r1.json()).toEqual(await r2.json());
  });

  it("🟢 a metade que falta: o DONO legítimo continua recebendo 200", async () => {
    db.materialRequest.findFirst.mockResolvedValue({
      id: "mr1", description: "Foto do produto", projectId: "p1", requestedByAgentId: "a1",
      project: { clientRequestId: "cr1" },
    });
    const r = await POST(req({ pedidoId: "mr1" }));
    expect(r.status).toBe(200);
    const corpo = await r.json();
    expect(corpo.ok).toBe(true);
  });

  it("a consulta de posse é SEMPRE filtrada pelo cliente do token, nunca por um clientId do corpo", async () => {
    db.materialRequest.findFirst.mockResolvedValue({
      id: "mr1", description: "x", projectId: "p1", requestedByAgentId: "a1",
      project: { clientRequestId: "cr1" },
    });
    await POST(req({ pedidoId: "mr1" }));
    const where = db.materialRequest.findFirst.mock.calls[0]![0].where;
    expect(where.project.clientId).toBe("cli-dono");
  });
});
