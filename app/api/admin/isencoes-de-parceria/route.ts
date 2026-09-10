// POST /api/admin/isencoes-de-parceria — CONCEDER A ISENÇÃO DE PARCERIA.
//
// ── POR QUE ESTA ROTA EXISTE (e por que a decisão anterior estava errada) ───
//
// O portão de pagamento recusa produzir sem prova de pagamento, e devolve
// `parceria_isenta` quando existe isenção viva. A tabela nasceu em #356 com o
// portão que a LÊ e o reset que a APAGA — e **nada que a criasse**. O cliente
// 001 (Foocci), que entra por parceria e não paga nada, era INCONCEDÍVEL.
//
// Eu construí a conferência e um script, e decidi NÃO fazer rota: "isto libera
// produção de graça, e uma porta dessas na internet custa o crédito da casa".
// **Essa decisão estava errada, e o erro tem nome — é o mesmo padrão que eu
// tinha acabado de caçar duas vezes na mesma noite.** O resultado literal foi:
// *"não concedi porque não alcanço o banco"*. Trava construída sem fechadura,
// pela terceira vez, agora por minha mão. Porta que só existe em documento é
// pior que porta nenhuma, porque **parece resolvida**.
//
// O precedente certo já estava nesta casa: `POST /api/admin/pagamentos`
// registra um Pix recebido fora do gateway — ato administrativo, sensível, que
// move a trava de dinheiro — e é uma rota da agência com sessão, CSRF e dono na
// linha. Nunca foi considerado furar a trava, porque **é auditado e tem dono**.
// A concessão de parceria é da mesma natureza e recebe a mesma porta.
//
// *Onde duas leituras são defensáveis, a casa fica com a que protege* — e a que
// protege é a que funciona COM auditoria, não a que não funciona.
//
// ── O QUE ELA NÃO FAZ ───────────────────────────────────────────────────────
//
//   • **Não é pagamento.** Não encosta em `PagamentoConfirmado`, não cria
//     receita. O veredito do portão vira `parceria_isenta` — outra palavra, de
//     propósito, para que nenhum relatório some isto como venda.
//   • **Não altera isenção existente.** Repetir a MESMA concessão devolve
//     sucesso (idempotência); repetir com termos DIFERENTES é RECUSADO —
//     alterar uma isenção auditada não é conceder.
//   • **Não mexe em preço, pedido nem cliente.**
//   • **Não isenta de medir.** No DRE a linha do parceiro passa a mostrar
//     R$ 0,00 de origem `parceria`, com o custo contado normalmente e a margem
//     negativa à vista. Ordem do CEO (D-0B9): *"tudo tem que ser medido,
//     inclusive as parcerias"*.
//
// ── AS GUARDAS (as mesmas da irmã, mais as da isenção) ─────────────────────
//
//   1. Sessão de AGÊNCIA. Sessão de portal (com `clientId`) não entra — o
//      cliente não declara a própria isenção.
//   2. CSRF: isto libera gasto real, então mutação cross-site é barrada.
//   3. DONO DA SESSÃO em `registradaPor`, nunca do corpo. `autorizadaPor` é a
//      FONTE da autorização (o CEO, citando D-0B9) e é digitada; um campo que o
//      operador escolhe não pode ser a única testemunha do ato.
//   4. Fail-closed em TODO campo obrigatório, e **nenhum tem valor padrão** —
//      padrão em campo de isenção é a forma silenciosa de escancarar a porta.
//   5. Nada é escrito antes de todas as conferências passarem: recusar depois
//      de escrever é liberar.

import { NextRequest, NextResponse } from "next/server";
import { getSession, isAgencyRole } from "@/lib/auth/session";
import { deveBloquearMutacaoCrossSite } from "@/lib/security/navegacao-cross-site";
import { solicitacaoDoWorkspace, naoEncontrado } from "@/lib/auth/posse-de-workspace";
import { concederIsencaoDeParceria } from "@/lib/agency/financeiro/conceder-isencao";

const MAX_TEXTO = 500;

/** Recusas que são culpa do pedido (400) e não do estado do mundo. */
const CONFLITO = new Set(["ja_existe", "ja_existe_com_outros_termos"]);

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.clientId || !isAgencyRole(session.role)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (deveBloquearMutacaoCrossSite(req)) {
    return NextResponse.json({ ok: false, error: "Origem não confiável para esta ação." }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const texto = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, MAX_TEXTO) : "");

  // ⚠️ Números NUNCA caem em zero por ausência. `Number(undefined)` é NaN, e a
  // conferência recusa NaN — que é o comportamento certo. Um `?? 0` aqui
  // transformaria a omissão de um teto num teto de zero silencioso, e zero é
  // uma DECISÃO, não uma ausência.
  const numero = (v: unknown) => (typeof v === "number" ? v : Number.NaN);

  const clientRequestId = texto(body.clientRequestId);

  // POSSE ANTES DA ESCRITA. `clientRequestId` vazio segue para a função de
  // biblioteca, que recusa com `sem_pedido` (400) — a mesma resposta de hoje.
  if (clientRequestId && !(await solicitacaoDoWorkspace(clientRequestId, session.workspaceId))) {
    return naoEncontrado();
  }

  const r = await concederIsencaoDeParceria({
    clientRequestId,
    autorizadaPor: texto(body.autorizadaPor),
    validaAte: texto(body.validaAte),
    escopo: texto(body.escopo),
    pecasContratadas: numero(body.pecasContratadas),
    tetoDeIaCentavosUsd: numero(body.tetoDeIaCentavosUsd),
    observacao: texto(body.observacao) || null,
    // O DONO SAI DA SESSÃO. Sempre.
    registradaPor: session.userId,
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
    validaAte: r.validaAte.toISOString(),
    jaExistia: r.jaExistia,
    mensagem: r.jaExistia
      ? "Esta isenção já existia, com exatamente os mesmos termos. Nada foi alterado."
      : "Isenção concedida. A produção deste pedido é liberada na próxima rodada da esteira " +
        "(o despertador passa a cada 5 minutos) — não é preciso empurrar nada à mão. " +
        "NÃO é pagamento: receita R$ 0 marcada como parceria, custo contado normalmente, " +
        "margem negativa visível no financeiro.",
  });
}
