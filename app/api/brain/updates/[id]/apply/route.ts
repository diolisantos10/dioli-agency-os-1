// POST /api/brain/updates/[id]/apply — applies a pending BrainUpdate to the
// actual BrandBrain. Agency role only. This is the human-approval gate of the
// learning loop: nothing mutates the BrandBrain without this explicit call.

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/api-guard";
import { applyBrainUpdate } from "@/lib/dioli-brain/brain-update";

const AGENCY_ROLES = ["master", "project_manager"] as const;

type Params = { id: string };

export async function POST(
  _request: NextRequest,
  context: { params: Promise<Params> },
): Promise<NextResponse> {
  const { session, error } = await requireSession([...AGENCY_ROLES]);
  if (error) return error;
  if (session.clientId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;
  try {
    await applyBrainUpdate(id, session.workspaceId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Falha ao aplicar atualização.";
    // Idempotency / not-found / unwritable field → 409 (conflict), not 500.
    const status = /already applied|not found|Cannot apply/.test(msg) ? 409 : 503;
    return NextResponse.json({ error: msg }, { status });
  }
}
