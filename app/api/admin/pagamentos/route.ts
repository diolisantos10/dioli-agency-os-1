// POST /api/admin/pagamentos — REGISTRAR QUE O DINHEIRO ENTROU, FORA DO GATEWAY.
//
// ── POR QUE ESTA ROTA EXISTE ────────────────────────────────────────────────
//
// O portão de pagamento (`lib/agency/financeiro/portao-de-pagamento.ts`) recusa
// produzir sem prova de que o cliente pagou, e a recusa diz ao cliente: *"se
// você já pagou por Pix ou transferência, mande o comprovante que a gente
// confirma e libera na hora"*.
//
// **Toda proibição precisa da instrução gêmea.** Sem esta rota, aquela frase
// seria mentira: o time receberia o comprovante e não teria onde registrá-lo —
// e proibição sem alternativa empurra o operador para o contorno (mexer no
// banco à mão, ou arrancar a trava). Esta é a alternativa, e ela é auditada.
//
// ── O QUE ELA NÃO FAZ ───────────────────────────────────────────────────────
//
//   • **Não mexe em preço.** O valor é o que o operador diz ter RECEBIDO.
//   • **Não lança no DRE.** `LancamentoFinanceiro` é outro livro, com regime de
//     competência e natureza estimado/realizado. Testemunha de portão e
//     livro-caixa são coisas diferentes; misturá-las faria o CEO ler como
//     resultado uma linha que existe só para destravar produção.
//   • **Não altera pedido nem cliente.** Só nasce a linha da testemunha.
//   • **Não apaga nem sobrescreve.** `registrarPagamento` é um upsert que NÃO
//     atualiza: o primeiro registro é o que vale. Reenviar o mesmo comprovante
//     não reescreve valor nem data de um pagamento já auditado.
//
// ── AS GUARDAS ─────────────────────────────────────────────────────────────
//
//   1. Sessão de AGÊNCIA. Sessão de portal (com `clientId`) não entra — o
//      cliente não declara o próprio pagamento.
//   2. CSRF: isto libera gasto real, então mutação cross-site é barrada.
//   3. Valor em CENTAVOS, inteiro e `> 0`. Zero é recusado na escrita, não só
//      na leitura — uma linha de R$ 0,00 não deve nem nascer.
//   4. DONO obrigatório: `registradoPor` sai da SESSÃO, nunca do corpo. Quem
//      confirmou fica na linha, e não é o operador quem escolhe o nome.

import { NextRequest, NextResponse } from "next/server";
import { getSession, isAgencyRole } from "@/lib/auth/session";
import { deveBloquearMutacaoCrossSite } from "@/lib/security/navegacao-cross-site";
import { solicitacaoDoWorkspace, naoEncontrado } from "@/lib/auth/posse-de-workspace";
import { registrarPagamento } from "@/lib/agency/financeiro/portao-de-pagamento";

const MAX_OBSERVACAO = 500;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.clientId || !isAgencyRole(session.role)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (deveBloquearMutacaoCrossSite(req)) {
    return NextResponse.json({ ok: false, error: "Origem não confiável para esta ação." }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    clientRequestId?: unknown;
    valorCentavos?: unknown;
    observacao?: unknown;
  };

  const clientRequestId = typeof body.clientRequestId === "string" ? body.clientRequestId.trim() : "";
  if (!clientRequestId) {
    return NextResponse.json(
      { ok: false, error: "Informe o pedido (clientRequestId) que foi pago." },
      { status: 400 },
    );
  }

  // POSSE ANTES DA ESCRITA. O `clientRequestId` já foi validado como presente
  // acima; a partir daqui, "não é seu" e "não existe" são a mesma porta fechada.
  if (!(await solicitacaoDoWorkspace(clientRequestId, session.workspaceId))) return naoEncontrado();

  // ⚠️ CENTAVOS, inteiro. Dinheiro em ponto flutuante é erro de arredondamento
  // com nome de bug. E o zero é recusado AQUI, não só no portão: esta casa já
  // leu um "0" como "sem limite" em outro produto, e a defesa contra isso é o
  // zero nunca chegar a existir como registro.
  const valorCentavos =
    typeof body.valorCentavos === "number" && Number.isInteger(body.valorCentavos)
      ? body.valorCentavos
      : NaN;
  if (!Number.isFinite(valorCentavos) || valorCentavos <= 0) {
    return NextResponse.json(
      { ok: false, error: "Informe o valor RECEBIDO em centavos, inteiro e maior que zero (ex.: 7900 para R$ 79,00)." },
      { status: 400 },
    );
  }

  const observacao =
    typeof body.observacao === "string" ? body.observacao.trim().slice(0, MAX_OBSERVACAO) : null;

  const r = await registrarPagamento({
    clientRequestId,
    origem: "manual",
    valorCentavos,
    // O DONO SAI DA SESSÃO. Registro manual sempre tem dono, e não é o corpo da
    // requisição que o escolhe.
    registradoPor: session.userId,
    observacao,
  });

  if (!r.ok) {
    return NextResponse.json({ ok: false, error: r.motivo }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    mensagem:
      "Pagamento registrado. A produção deste projeto é liberada na próxima rodada da esteira " +
      "(o despertador passa a cada 5 minutos) — não é preciso empurrar nada à mão.",
  });
}
