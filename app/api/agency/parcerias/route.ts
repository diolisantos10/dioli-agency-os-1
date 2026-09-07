// POST /api/agency/parcerias — AUTORIZAR A PARCERIA DE UM CLIENTE.
// DELETE — revogar a parceria (e, com ela, os convites do parceiro).
//
// ── POR QUE ESTA ROTA EXISTE ───────────────────────────────────────────────
//
// Ela é o elo que ROMPE O CÍRCULO. Até 27/08/2026 a única autorização de
// parceria era a `IsencaoDeParceria`, que exige um `clientRequestId` — um
// pedido. E o pedido nasce do briefing, que no caso do parceiro só corre liso
// com o convite, que exigia a isenção. Fechado:
//
//     convite → isenção → pedido → briefing → (convite)
//
// A porta existia e não podia ser aberta a primeira vez. Esta rota abre — no
// nível do PARCEIRO, antes de qualquer pedido —, e a isenção de cada pedido
// passa a ser derivada dela.
//
// ── AS GUARDAS (as mesmas de `/api/admin/isencoes-de-parceria`) ────────────
//
//   1. Sessão de AGÊNCIA. Sessão de portal (com `clientId`) não entra — o
//      cliente não declara a própria parceria.
//   2. CSRF: isto libera produção de graça; mutação cross-site é barrada.
//   3. `registradaPor` sai da SESSÃO, nunca do corpo. `autorizadaPor` é a FONTE
//      (o CEO, citando D-0B9) e é digitada — um campo que o operador escolhe
//      não pode ser a única testemunha do ato.
//   4. Fail-closed em TODO campo, e NENHUM com valor padrão: padrão em campo de
//      parceria é a forma silenciosa de escancarar a porta.
//
// ── O QUE ELA NÃO FAZ ──────────────────────────────────────────────────────
//
//   • ⛔ **Não cria pagamento.** Não encosta em `PagamentoConfirmado`. Receita
//     de parceria é R$ 0 com o custo contado normalmente, e a margem negativa
//     fica à vista. *Parceria não é grátis: é investimento, e investimento se
//     mede* (D-0B9).
//   • **Não cunha convite.** São dois atos, e de propósito: autorizar é decidir;
//     cunhar é entregar uma chave.
//   • **Não altera autorização viva com outros termos** — revogue antes.

import { NextRequest, NextResponse } from "next/server";
import { getSession, isAgencyRole } from "@/lib/auth/session";
import { deveBloquearMutacaoCrossSite } from "@/lib/security/navegacao-cross-site";
import { clienteDoWorkspace, naoEncontrado } from "@/lib/auth/posse-de-workspace";
import {
  autorizarParceriaDoCliente, revogarParceriaDoCliente,
} from "@/lib/agency/financeiro/parceria-do-parceiro";

const MAX_TEXTO = 500;
const CONFLITO = new Set(["ja_existe_com_outros_termos"]);

const texto = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, MAX_TEXTO) : "");
// `Number(undefined)` é NaN, e NaN é RECUSA — nunca zero. Um `?? 0` aqui
// transformaria a omissão de um teto num teto de zero silencioso, e zero é uma
// DECISÃO, não uma ausência.
const numero = (v: unknown) => (typeof v === "number" ? v : Number.NaN);

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

  // POSSE ANTES DA ESCRITA. `clientId` vazio segue para a função de biblioteca
  // sem esta checagem — ela mesma recusa com `sem_cliente` (400), a mesma
  // resposta de hoje. Não é 404 porque não é uma questão de posse: é campo
  // ausente, e a mensagem de recusa não pode mudar.
  if (clientId && !(await clienteDoWorkspace(clientId, g.session!.workspaceId))) {
    return naoEncontrado();
  }

  const r = await autorizarParceriaDoCliente({
    clientId,
    autorizadaPor: texto(body.autorizadaPor),
    validaAte: texto(body.validaAte),
    escopo: texto(body.escopo),
    pecasContratadas: numero(body.pecasContratadas),
    tetoDeIaCentavosUsd: numero(body.tetoDeIaCentavosUsd),
    observacao: texto(body.observacao) || null,
    registradaPor: g.session!.userId,
  });

  if (!r.ok) {
    return NextResponse.json(
      { ok: false, recusa: r.recusa, error: r.motivo },
      { status: CONFLITO.has(r.recusa) ? 409 : 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    id: r.id,
    clientId: r.clientId,
    validaAte: r.validaAte.toISOString(),
    jaExistia: r.jaExistia,
    mensagem: r.jaExistia
      ? "Esta parceria já estava autorizada, com exatamente os mesmos termos. Nada foi alterado."
      : "Parceria autorizada. Agora cunhe o convite (POST /api/agency/convites-de-parceria) e entregue " +
        "o LINK ao parceiro. A isenção de CADA pedido dele passa a ser derivada desta autorização — " +
        "não é preciso conceder isenção pedido a pedido. NÃO é pagamento: receita R$ 0 marcada como " +
        "parceria, custo contado normalmente, margem negativa visível no financeiro.",
  });
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const g = await guarda(req);
  if (g.erro) return g.erro;

  const clientId = texto(new URL(req.url).searchParams.get("clientId"));
  if (!clientId) return NextResponse.json({ ok: false, error: "Informe o clientId." }, { status: 400 });

  // POSSE ANTES DA ESCRITA. Vem depois da validação de "presente" — o 400 de
  // campo ausente continua sendo 400; só o vizinho vira 404.
  if (!(await clienteDoWorkspace(clientId, g.session!.workspaceId))) return naoEncontrado();

  const revogou = await revogarParceriaDoCliente(clientId);
  return NextResponse.json({
    ok: true,
    revogou,
    mensagem: revogou
      ? "Parceria revogada. Os CONVITES deste parceiro morrem no mesmo instante (eles conferem a " +
        "parceria a cada uso), e novos pedidos dele voltam a travar no portão de pagamento. As " +
        "isenções JÁ derivadas de pedidos anteriores continuam como estão — elas são o registro do " +
        "que valia naquele momento, e reescrever isso mudaria a história de uma produção que já correu."
      : "Nada a revogar: este cliente não tem parceria viva.",
  });
}
