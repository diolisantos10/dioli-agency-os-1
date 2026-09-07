// POST /api/agency/convites-de-parceria — CUNHAR O CONVITE DO PARCEIRO.
// DELETE — revogar o convite que vazou.
//
// ── POR QUE ESTA ROTA NASCE JUNTO COM O MECANISMO ──────────────────────────
//
// Esta casa teve SEIS "travas sem fechadura" em 24 horas — mecanismos escritos,
// testados, provados por mutação e sem NENHUMA porta que os acionasse. A
// própria `IsencaoDeParceria` foi uma delas: nasceu com o portão que a lê e o
// reset que a apaga, e nada que a criasse. O resultado literal foi *"não
// concedi porque não alcanço o banco"*.
//
// **A pergunta obrigatória é "quem CHAMA isto?", e ela se responde ANTES de dar
// o conserto por fechado.** Por isso o convite e a porta dele nascem no mesmo
// commit — e por isso `docs/` ganha o passo a passo de como se cunha e se
// entrega. Mecanismo que só existe em documento parece resolvido, e é pior que
// mecanismo nenhum.
//
// ── AS GUARDAS (as mesmas de `/api/admin/isencoes-de-parceria`) ────────────
//
//   1. Sessão de AGÊNCIA. Sessão de portal (com `clientId`) não entra — o
//      cliente não cunha o próprio convite.
//   2. CSRF: isto entrega uma credencial, então mutação cross-site é barrada.
//   3. DONO DA SESSÃO em `criadoPor`, nunca do corpo.
//   4. Fail-closed em todo campo, e nenhum com valor padrão perigoso: a única
//      ausência tolerada é a validade, que cai em `VALIDADE_PADRAO_DIAS` — um
//      prazo CURTO, nunca "sem prazo".
//
// ── O QUE ELA NÃO FAZ ──────────────────────────────────────────────────────
//
//   • **Não concede parceria.** O convite só APONTA para uma `IsencaoDeParceria`
//     viva; sem ela, a cunhagem é recusada. Autorizar continua sendo outro ato,
//     com outra porta e outro dono.
//   • **Não devolve o token de novo.** Ele aparece UMA vez, na resposta da
//     cunhagem. Quem perdeu, revoga e cunha outro — é mais barato que uma rota
//     que relê credencial.

import { NextRequest, NextResponse } from "next/server";
import { getSession, isAgencyRole } from "@/lib/auth/session";
import { deveBloquearMutacaoCrossSite } from "@/lib/security/navegacao-cross-site";
import { clienteDoWorkspace, naoEncontrado } from "@/lib/auth/posse-de-workspace";
import {
  cunharConviteDeParceria, revogarConviteDeParceria,
} from "@/lib/agency/comercial/convite-de-parceria";

const MAX_TEXTO = 500;
const CONFLITO = new Set(["sem_isencao_viva", "passa_da_isencao"]);

function texto(v: unknown): string {
  return typeof v === "string" ? v.trim().slice(0, MAX_TEXTO) : "";
}

async function guarda(req: NextRequest) {
  const session = await getSession();
  if (!session) return { erro: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  if (session.clientId || !isAgencyRole(session.role)) {
    return { erro: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }) };
  }
  if (deveBloquearMutacaoCrossSite(req)) {
    return { erro: NextResponse.json({ ok: false, error: "Origem não confiável para esta ação." }, { status: 403 }) };
  }
  return { session };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const g = await guarda(req);
  if (g.erro) return g.erro;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const clientId = texto(body.clientId);

  // POSSE ANTES DA ESCRITA. `clientId` vazio segue para a função de biblioteca,
  // que recusa com `sem_cliente` (400) — a mesma resposta de hoje.
  if (clientId && !(await clienteDoWorkspace(clientId, g.session!.workspaceId))) {
    return naoEncontrado();
  }

  const r = await cunharConviteDeParceria({
    clientId,
    expiraEm: texto(body.expiraEm) || null,
    observacao: texto(body.observacao) || null,
    // O DONO SAI DA SESSÃO. Sempre.
    criadoPor: g.session!.userId,
  });

  if (!r.ok) {
    return NextResponse.json(
      { ok: false, recusa: r.recusa, error: r.motivo },
      { status: CONFLITO.has(r.recusa) ? 409 : 400 },
    );
  }

  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ?? "";
  return NextResponse.json({
    ok: true,
    clientId: r.clientId,
    expiraEm: r.expiraEm.toISOString(),
    // ⚠️ APARECE UMA VEZ SÓ. Não há rota que releia este token.
    token: r.token,
    link: `${base}/briefing?convite=${encodeURIComponent(r.token)}`,
    mensagem:
      "Convite cunhado. Entregue o LINK ao parceiro — é ele que faz a casa saber que a conversa é dele " +
      "e dispensar a pergunta da verba. Quem abrir a sala sem este link continua sendo perguntado, " +
      "e isso é o comportamento correto. O convite morre sozinho no vencimento, e morre na hora se a " +
      "isenção for revogada ou vencer.",
  });
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const g = await guarda(req);
  if (g.erro) return g.erro;

  const token = texto(new URL(req.url).searchParams.get("token"));
  if (!token) return NextResponse.json({ ok: false, error: "Informe o token a revogar." }, { status: 400 });

  const revogou = await revogarConviteDeParceria(token);
  return NextResponse.json({
    ok: true,
    revogou,
    mensagem: revogou
      ? "Convite revogado. O link deixa de valer imediatamente."
      : "Nada a revogar: o convite não existe ou já estava revogado.",
  });
}
