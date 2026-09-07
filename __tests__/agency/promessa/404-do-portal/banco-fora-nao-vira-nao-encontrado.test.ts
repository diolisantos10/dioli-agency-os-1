// FALHA DE BANCO NÃO É FATO SOBRE O PEDIDO DO CLIENTE — 07/09/2026.
//
// ─── O DEFEITO ───────────────────────────────────────────────────────────────
//
// `responderPergunta` buscava o pedido com `.catch(() => null)`. Banco fora do
// ar → `pedido` vira `null` → o cliente lê **"Pedido não encontrado"**.
//
// Uma afirmação FALSA sobre o pedido dele, indistinguível de "esse id não é
// seu", num momento em que o sistema não sabia de nada. É a mesma família que
// custou um MÊS de Google Drive a esta casa (`docs/pendencias.md`, 07/08):
// **infraestrutura quebrada virando fato sobre o cliente.**
//
// A regra que manda aqui: *ausência de informação não é informação.* Busca que
// NÃO RODOU não autoriza nenhuma conclusão sobre o que ela procuraria.
//
// ─── AS DUAS METADES ────────────────────────────────────────────────────────
//
//   • banco fora  → 503, e a frase convida a tentar de novo;
//   • busca rodou e não achou → 404, e o corpo não diz se o id existe.
//
// Sem a segunda metade, "consertar" seria só trocar uma mentira por outra.

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const db = vi.hoisted(() => ({
  contentRequest: { findFirst: vi.fn(), update: vi.fn() },
  portalMessage: { create: vi.fn() },
  clientRequestDb: { update: vi.fn(), findMany: vi.fn() },
  $transaction: vi.fn(async (ops: unknown[]) => ops),
}));
const resolvePortalClient = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/client", () => ({ prisma: db }));
vi.mock("@/lib/agency/persistence/portal-access-service", () => ({ resolvePortalClient }));
vi.mock("@/lib/agency/persistence/portal-cookie", () => ({
  tokenDoPortal: (_r: unknown, q: string | null) => q,
}));
const conversa = vi.hoisted(() => ({ conversaDoCliente: vi.fn() }));
vi.mock("@/app/api/messages/conversa", () => conversa);
const esteira = vi.hoisted(() => ({ atenderPedido: vi.fn() }));
vi.mock("@/lib/agency/esteira/producao-de-pedido", () => esteira);

import { POST } from "@/app/api/portal/pedidos/responder/route";

function req(): NextRequest {
  return new NextRequest("http://localhost/api/portal/pedidos/responder", {
    method: "POST",
    body: JSON.stringify({ token: "tok-dono", pedidoId: "p1", opcaoId: "pacote" }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  resolvePortalClient.mockResolvedValue({ clientId: "c1", workspaceId: "ws1" });
});

describe("banco fora do ar não vira 'pedido não encontrado'", () => {
  it("🔴 o banco falha: 503, e o cliente NÃO ouve que o pedido dele não existe", async () => {
    db.contentRequest.findFirst.mockRejectedValue(new Error("database is locked"));

    const r = await POST(req());
    const corpo = (await r.json()) as { error?: string };

    expect(r.status).toBe(503);
    // A frase não pode afirmar nada sobre o pedido — o sistema não sabe.
    expect(corpo.error ?? "").not.toMatch(/não encontrado|not found|acesso negado/i);
    expect(corpo.error ?? "").toMatch(/tente de novo|instantes/i);
  });

  it("A OUTRA METADE: a busca RODOU e não achou → 404, e o corpo não diz se o id existe", async () => {
    db.contentRequest.findFirst.mockResolvedValue(null);

    const r = await POST(req());
    const corpo = (await r.json()) as { error?: string };

    expect(r.status).toBe(404);
    expect(JSON.stringify(corpo)).not.toMatch(/existe|pertence|outro cliente/i);
  });

  it("os dois casos são DISTINGUÍVEIS entre si — é isso que o conserto compra", async () => {
    db.contentRequest.findFirst.mockRejectedValue(new Error("database is locked"));
    const caiu = await POST(req());

    vi.clearAllMocks();
    resolvePortalClient.mockResolvedValue({ clientId: "c1", workspaceId: "ws1" });
    db.contentRequest.findFirst.mockResolvedValue(null);
    const naoAchou = await POST(req());

    expect(caiu.status).not.toBe(naoAchou.status);
  });
});
