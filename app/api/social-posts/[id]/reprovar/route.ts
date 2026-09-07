// POST /api/social-posts/{id}/reprovar — a casa diz "não é isso", e o não vira regra.
//
// Por que esta rota existe separada do PATCH: no PATCH, `status` é um campo
// entre outros, e "reprovado" não estava nem na lista de status válidos
// (`draft · scheduled · approved · published · failed`). Reprovar não é mudar um
// campo — é um ATO, com autor e motivo obrigatórios, que gera regra para as
// próximas peças. Enfiar isso num PATCH genérico faria o motivo virar opcional,
// e motivo opcional é motivo que ninguém escreve.
//
// Ver `lib/agency/esteira/reprovacao.ts` para o porquê de o motivo ser exigido.

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/api-guard";
import { reprovarPeca } from "@/lib/agency/esteira/reprovacao";

interface Params { id: string }

export async function POST(request: NextRequest, ctx: { params: Promise<Params> }): Promise<NextResponse> {
  const { session, error } = await requireSession(["master", "project_manager", "social_staff"]);
  if (error) return error;
  const { id } = await ctx.params;

  let body: { motivo?: unknown };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const resultado = await reprovarPeca({
    postId: id,
    motivo: typeof body.motivo === "string" ? body.motivo : "",
    // O autor vem da SESSÃO, nunca do corpo. Quem reprovou não viaja em request:
    // um dia alguém vai perguntar quem mandou refazer, e a resposta tem de ser
    // confiável.
    quemReprovou: session.name?.trim() || session.email?.trim() || "equipe",
    // ⛔ Da SESSÃO. Sem isto a rota alcançava a peça de qualquer inquilino
    // (varredura de 28/08) — e o motivo virava proibição de marca no cliente
    // alheio.
    workspaceId: session.workspaceId,
  });

  // 422 e não 400: o pedido está bem formado, o que falta é conteúdo — e a
  // diferença importa para a tela saber que é para pedir o motivo ao humano,
  // em vez de mostrar "erro".
  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.recusa }, { status: 422 });
  }

  return NextResponse.json({
    ok: true,
    volta: resultado.volta,
    escalado: resultado.escalado,
    proibicoesNovas: resultado.proibicoesNovas,
    mensagem: resultado.paraQuemReprovou,
  });
}
