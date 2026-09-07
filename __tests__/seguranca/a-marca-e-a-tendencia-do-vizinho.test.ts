// A MARCA E A TENDÊNCIA DO VIZINHO — os outros dois furos da varredura de 28/08.
//
// Mesma família do anterior: rota que recebe um id e não confere de quem ele é.
// Estes dois foram consertados junto, e estes testes existem porque as mutações
// deles SOBREVIVERAM na primeira rodada — o conserto estava lá e nada o mordia.

import { describe, it, expect, beforeEach, vi } from "vitest";

const db = vi.hoisted(() => ({
  brainUpdate: { findUnique: vi.fn(), update: vi.fn() },
  clientRequestDb: { findFirst: vi.fn() },
  brandBrain: { update: vi.fn(), findUnique: vi.fn() },
  marketInsight: { findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
}));
vi.mock("@/lib/db/client", () => ({ prisma: db }));

import { applyBrainUpdate } from "@/lib/dioli-brain/brain-update";
import { approveInsight, rejectInsight } from "@/lib/agency/radar/library";

beforeEach(() => {
  vi.clearAllMocks();
  db.brandBrain.update.mockResolvedValue({});
  db.brainUpdate.update.mockResolvedValue({});
  db.marketInsight.updateMany.mockResolvedValue({ count: 0 });
});

describe("a atualização de marca de um cliente de OUTRO inquilino", () => {
  it("🔒 não se aplica — a posse é derivada do pedido, e o pedido não é dele", async () => {
    // O update existe; o PEDIDO dele não é do workspace de quem chamou.
    db.brainUpdate.findUnique.mockResolvedValue({
      id: "upd-1", clientRequestId: "req-da-agencia-B", status: "pending",
      fieldChanged: "purposeAndPromise", proposedValue: "texto novo",
    });
    db.clientRequestDb.findFirst.mockResolvedValue(null); // não é do workspace A

    await expect(applyBrainUpdate("upd-1", "ws-agencia-A")).rejects.toThrow(/not found/i);

    // ⛔ A ficha de marca alheia não foi tocada. Ela é o que a produção lê para
    // escrever a peça daquele cliente.
    expect(db.brandBrain.update, "escreveu na ficha de marca de outro inquilino").not.toHaveBeenCalled();
    expect(db.brainUpdate.update, "marcou como aplicada uma atualização alheia").not.toHaveBeenCalled();
  });

  it("⚠️ diz 'não encontrado', não 'proibido' — confirmar que existe já é vazamento", async () => {
    db.brainUpdate.findUnique.mockResolvedValue({
      id: "upd-1", clientRequestId: "req-B", status: "pending",
      fieldChanged: "purposeAndPromise", proposedValue: "x",
    });
    db.clientRequestDb.findFirst.mockResolvedValue(null);
    await expect(applyBrainUpdate("upd-1", "ws-A")).rejects.toThrow(/not found/i);
  });

  it("✅ o dono aplica normalmente", async () => {
    db.brainUpdate.findUnique.mockResolvedValue({
      id: "upd-1", clientRequestId: "req-A", status: "pending",
      fieldChanged: "purposeAndPromise", proposedValue: "texto novo",
    });
    db.clientRequestDb.findFirst.mockResolvedValue({ id: "req-A" });
    db.brandBrain.findUnique.mockResolvedValue({ clientId: "c1" });

    await applyBrainUpdate("upd-1", "ws-A").catch(() => { /* o resto do fluxo não é o assunto */ });
    expect(
      db.clientRequestDb.findFirst.mock.calls[0]?.[0],
      "a conferência do dono não levou o workspace",
    ).toMatchObject({ where: { workspaceId: "ws-A" } });
  });
});

describe("a tendência do vizinho", () => {
  it("🔒 aprovar insight de outro workspace não acha nada — e não arquiva tópico alheio", async () => {
    db.marketInsight.findFirst.mockResolvedValue(null);
    const ok = await approveInsight("ins-da-B", "quem@a.com", "ws-agencia-A");
    expect(ok, "aprovou a tendência de outra agência").toBe(false);
    expect(db.marketInsight.updateMany, "escreveu na biblioteca do vizinho").not.toHaveBeenCalled();
  });

  it("⛔ o workspace vai no WHERE da busca", async () => {
    db.marketInsight.findFirst.mockResolvedValue(null);
    await approveInsight("ins-1", "x", "ws-A");
    expect(db.marketInsight.findFirst.mock.calls[0]?.[0]).toMatchObject({ where: { workspaceId: "ws-A" } });
  });

  it("⛔ rejeitar também leva o workspace no WHERE", async () => {
    await rejectInsight("ins-1", "x", "ws-A");
    expect(db.marketInsight.updateMany.mock.calls[0]?.[0]).toMatchObject({ where: { workspaceId: "ws-A" } });
  });
});
