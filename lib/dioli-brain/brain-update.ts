// SERVER-ONLY. The Brain learning loop.
//
// Records a proposed brand-brain update derived from an approved deliverable or a
// quality review. NEVER auto-applies — proposeBrainUpdate only writes a pending
// BrainUpdate row; applyBrainUpdate (called only from an approved API route)
// mutates the actual BrandBrain and marks the update applied. (Law 2.)

import { prisma } from "@/lib/db/client";

export type BrainUpdateSource = "approved_delivery" | "quality_review" | "human_edit";

// Maps a proposed snapshot/brand field name → the BrandBrain DB column it writes.
// Only mappable fields can be applied; unmappable fields are recorded for human
// review but applyBrainUpdate refuses to touch the BrandBrain (no invented columns).
const FIELD_TO_COLUMN: Record<string, keyof BrandBrainWritable> = {
  brandVoice: "tone",
  tone: "tone",
  positioning: "positioning",
  targetAudience: "targetAudience",
  tagline: "tagline",
  brandName: "brandName",
  typography: "typography",
  fonts: "typography",
  primaryColor: "primaryColor",
  secondaryColor: "secondaryColor",
};

interface BrandBrainWritable {
  tone: string | null;
  positioning: string | null;
  targetAudience: string | null;
  tagline: string | null;
  brandName: string | null;
  typography: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

async function resolveBrandBrainColumn(
  clientRequestId: string,
  fieldChanged: string,
): Promise<{ clientId: string; column: keyof BrandBrainWritable; previousValue: string | null } | null> {
  const column = FIELD_TO_COLUMN[fieldChanged];
  if (!column) return null;
  const req = await prisma.clientRequestDb.findUnique({ where: { id: clientRequestId } });
  if (!req?.clientId) return null;
  const bb = await prisma.brandBrain.findUnique({ where: { clientId: req.clientId } });
  const previousValue = (bb ? (bb as unknown as Record<string, unknown>)[column] : null) as string | null;
  return { clientId: req.clientId, column, previousValue: previousValue ?? null };
}

export async function proposeBrainUpdate(params: {
  clientRequestId: string;
  department: string;
  fieldChanged: string;
  proposedValue: string;
  source: BrainUpdateSource;
}): Promise<{ id: string }> {
  // Capture the current value for the audit trail (best-effort; never invents).
  const resolved = await resolveBrandBrainColumn(params.clientRequestId, params.fieldChanged).catch(() => null);

  const rec = await prisma.brainUpdate.create({
    data: {
      clientRequestId: params.clientRequestId,
      department: params.department,
      fieldChanged: params.fieldChanged,
      previousValue: resolved?.previousValue ?? null,
      proposedValue: params.proposedValue,
      source: params.source,
      status: "pending",
    },
  });
  return { id: rec.id };
}

/**
 * ⛔ `workspaceId` OBRIGATÓRIO — da sessão, nunca do corpo (varredura de 28/08).
 *
 * A busca era `findUnique({ where: { id } })`: qualquer papel de agência
 * aplicava a atualização de marca de um cliente de OUTRO inquilino. É escrita
 * na ficha que a produção lê para escrever a peça do cliente.
 */
export async function applyBrainUpdate(updateId: string, workspaceId: string): Promise<void> {
  const update = await prisma.brainUpdate.findUnique({ where: { id: updateId } });

  // ⛔ A POSSE É DERIVADA DO PEDIDO. `BrainUpdate` não carrega `workspaceId` —
  // ele aponta `clientRequestId`, e é a solicitação que tem dono. Conferir aqui,
  // e não confiar em quem chamou, é o que fecha a porta: sem isto qualquer papel
  // de agência aplicava a atualização de marca de um cliente de OUTRO inquilino
  // (varredura de 28/08), e a ficha de marca é o que a produção lê para escrever
  // a peça do cliente.
  //
  // ⚠️ Silêncio de propósito: devolve como se não existisse, sem dizer que
  // existe e é de outra conta — confirmar a existência já é vazamento.
  if (update) {
    const dono = await prisma.clientRequestDb.findFirst({
      where: { id: update.clientRequestId, workspaceId },
      select: { id: true },
    });
    if (!dono) throw new Error("Brain update not found");
  }
  if (!update) throw new Error(`BrainUpdate ${updateId} not found`);
  // Idempotency guard — an already-applied update can never be applied twice.
  if (update.status === "applied") {
    throw new Error(`BrainUpdate ${updateId} already applied`);
  }

  const resolved = await resolveBrandBrainColumn(update.clientRequestId, update.fieldChanged);
  if (!resolved) {
    throw new Error(`Cannot apply BrainUpdate ${updateId}: field "${update.fieldChanged}" is not a writable BrandBrain field or client is unlinked.`);
  }

  // Upsert the BrandBrain field. BrandBrain is 1:1 with Client.
  await prisma.brandBrain.upsert({
    where: { clientId: resolved.clientId },
    update: { [resolved.column]: update.proposedValue },
    create: { clientId: resolved.clientId, [resolved.column]: update.proposedValue },
  });

  await prisma.brainUpdate.update({
    where: { id: updateId },
    data: { status: "applied", appliedAt: new Date() },
  });
}

export async function listPendingBrainUpdates(clientRequestId?: string) {
  return prisma.brainUpdate.findMany({
    where: { status: "pending", ...(clientRequestId ? { clientRequestId } : {}) },
    orderBy: { createdAt: "desc" },
  });
}
