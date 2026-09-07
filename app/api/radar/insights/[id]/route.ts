// Radar Dioli — validar uma tendência pendente.
//   PATCH { action: "approve" | "reject" } — a validação humana. Aprovar coloca
//   a tendência em vigor (e supersede o tópico); rejeitar a descarta.

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/api-guard";
import { approveInsight, rejectInsight } from "@/lib/agency/radar/library";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { session, error } = await requireSession(["master", "project_manager"]);
  if (error) return error;
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({})) as { action?: string };

  if (body.action === "approve") {
    const ok = await approveInsight(id, session.email ?? session.workspaceId, session.workspaceId);
    return ok ? NextResponse.json({ ok: true, status: "active" }) : NextResponse.json({ error: "tendência não encontrada ou já decidida" }, { status: 404 });
  }
  if (body.action === "reject") {
    const ok = await rejectInsight(id, session.email ?? session.workspaceId, session.workspaceId);
    return ok ? NextResponse.json({ ok: true, status: "rejected" }) : NextResponse.json({ error: "tendência não encontrada ou já decidida" }, { status: 404 });
  }
  return NextResponse.json({ error: "action deve ser 'approve' ou 'reject'" }, { status: 400 });
}
