// Phase E tests — learning loop. proposeBrainUpdate records a pending row but
// never touches BrandBrain; applyBrainUpdate mutates BrandBrain + marks applied;
// double-apply is guarded.

import { describe, it, expect, vi, beforeEach } from "vitest";

const requestFindUnique = vi.fn();
const brandFindUnique = vi.fn();
const brandUpsert = vi.fn();
const updateCreate = vi.fn();
const updateFindUnique = vi.fn();
const updateUpdate = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: {
    // A posse do BrainUpdate é DERIVADA do pedido (varredura de 28/08): o
    // aplicador confere que a solicitação é do workspace de quem chamou. Aqui o
    // dono existe — os casos deste arquivo são todos do próprio inquilino.
    clientRequestDb: { findFirst: vi.fn(async () => ({ id: "req-1" })), findUnique: (...a: unknown[]) => requestFindUnique(...a) },
    brandBrain: {
      findUnique: (...a: unknown[]) => brandFindUnique(...a),
      upsert: (...a: unknown[]) => brandUpsert(...a),
    },
    brainUpdate: {
      create: (...a: unknown[]) => updateCreate(...a),
      findUnique: (...a: unknown[]) => updateFindUnique(...a),
      update: (...a: unknown[]) => updateUpdate(...a),
      findMany: vi.fn(),
    },
  },
}));

import { proposeBrainUpdate, applyBrainUpdate } from "@/lib/dioli-brain/brain-update";

beforeEach(() => {
  requestFindUnique.mockReset();
  brandFindUnique.mockReset();
  brandUpsert.mockReset();
  updateCreate.mockReset();
  updateFindUnique.mockReset();
  updateUpdate.mockReset();
});

describe("proposeBrainUpdate", () => {
  it("creates a pending record and does NOT modify BrandBrain", async () => {
    requestFindUnique.mockResolvedValue({ id: "req1", clientId: "cli1" });
    brandFindUnique.mockResolvedValue({ clientId: "cli1", positioning: "Antigo posicionamento" });
    updateCreate.mockResolvedValue({ id: "upd1" });

    const r = await proposeBrainUpdate({
      clientRequestId: "req1",
      department: "strategy",
      fieldChanged: "positioning",
      proposedValue: "Novo posicionamento premium",
      source: "approved_delivery",
    });

    expect(r.id).toBe("upd1");
    const created = updateCreate.mock.calls[0][0].data;
    expect(created.status).toBe("pending");
    expect(created.previousValue).toBe("Antigo posicionamento");
    expect(created.proposedValue).toBe("Novo posicionamento premium");
    // BrandBrain must NOT be mutated by a proposal.
    expect(brandUpsert).not.toHaveBeenCalled();
  });
});

describe("applyBrainUpdate", () => {
  it("modifies BrandBrain and marks the update applied", async () => {
    updateFindUnique.mockResolvedValue({
      id: "upd1", clientRequestId: "req1", department: "strategy",
      fieldChanged: "positioning", proposedValue: "Novo posicionamento", status: "pending",
    });
    requestFindUnique.mockResolvedValue({ id: "req1", clientId: "cli1" });
    brandFindUnique.mockResolvedValue({ clientId: "cli1", positioning: "Antigo" });
    brandUpsert.mockResolvedValue({});
    updateUpdate.mockResolvedValue({});

    await applyBrainUpdate("upd1", "ws-1");

    expect(brandUpsert).toHaveBeenCalledOnce();
    const upsertArg = brandUpsert.mock.calls[0][0];
    expect(upsertArg.where.clientId).toBe("cli1");
    expect(upsertArg.update.positioning).toBe("Novo posicionamento");
    const updArg = updateUpdate.mock.calls[0][0];
    expect(updArg.data.status).toBe("applied");
    expect(updArg.data.appliedAt).toBeInstanceOf(Date);
  });

  it("double-apply throws (idempotency guard) and does not touch BrandBrain again", async () => {
    updateFindUnique.mockResolvedValue({
      id: "upd1", clientRequestId: "req1", department: "strategy",
      fieldChanged: "positioning", proposedValue: "X", status: "applied",
    });
    await expect(applyBrainUpdate("upd1", "ws-1")).rejects.toThrow(/already applied/);
    expect(brandUpsert).not.toHaveBeenCalled();
  });

  it("unknown update id throws", async () => {
    updateFindUnique.mockResolvedValue(null);
    await expect(applyBrainUpdate("nope", "ws-1")).rejects.toThrow(/not found/);
  });

  it("refuses to apply when the field is not a writable BrandBrain column", async () => {
    updateFindUnique.mockResolvedValue({
      id: "upd2", clientRequestId: "req1", department: "social",
      fieldChanged: "preferredChannels", proposedValue: "Instagram", status: "pending",
    });
    requestFindUnique.mockResolvedValue({ id: "req1", clientId: "cli1" });
    await expect(applyBrainUpdate("upd2", "ws-1")).rejects.toThrow(/Cannot apply/);
    expect(brandUpsert).not.toHaveBeenCalled();
  });
});
