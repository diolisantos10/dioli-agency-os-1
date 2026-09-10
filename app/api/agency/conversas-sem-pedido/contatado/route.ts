// POST /api/agency/conversas-sem-pedido/contatado — A CASA DIZ QUE JÁ
// CONTATOU um lead da fila de conversas paradas.
//
// ─── POR QUE ESTA ROTA É NOVA, E NÃO UM DESVIO DA `atribuir` ────────────────
//
// Medido em 29/08/2026, ANTES de escrever esta rota:
//
//   • `POST /api/agency/conversas-sem-pedido/atribuir` exige um `Client` que
//     já exista (`atribuir-conversa-orfa.ts:116-121` recusa com
//     `cliente_inexistente`). O lead a quem a casa PROMETEU contato é um
//     VISITANTE ANÔNIMO — não tem `Client`. Atribuir é o ato certo para outro
//     caso (a conversa de um cliente já conhecido), não para este.
//   • `grep -rn "contatadoEm\|contatadoPor\|marcarComoContatado\|contatado"
//     lib app --include=*.ts --include=*.tsx` devolvia VAZIO: nada nesta casa
//     marcava "um humano contatou esta pessoa".
//   • A ÚNICA saída da fila era APAGAR o rastro (`resolverRastroPeloFio`), e
//     só em dois caminhos: o briefing virar pedido, ou a promoção automática
//     de parceiro. Não havia saída para "já falei com a pessoa" — e um humano
//     que liga ou escreve para um visitante que ainda não é cliente não tinha
//     ONDE registrar que o fez.
//
// A porta nasce porque o ato não existia em lugar nenhum — não porque era
// cômodo espremer mais um caso dentro da rota que já existe.
//
// ─── AS GUARDAS (as MESMAS de `/api/agency/conversas-sem-pedido/atribuir`) ──
//
//   1. Sessão de AGÊNCIA. Sessão de portal (com `clientId`) NÃO entra — nem
//      como leitora. O cliente não declara que a própria casa o contatou.
//   2. CSRF: é mutação, e mutação cross-site é barrada.
//   3. `contatadoPor` sai da SESSÃO, nunca do corpo. Um autor que o próprio
//      operador digita não é testemunha de nada.
//   4. `workspaceId` sai da SESSÃO. A fronteira de inquilino vale nos dois
//      lados: o rastro tem de ser desta casa.
//
// ─── O QUE ELA NÃO FAZ ───────────────────────────────────────────────────────
//
//   • ⛔ Não envia nada a ninguém. Nenhum e-mail, nenhuma notificação, nenhuma
//     chamada de IA. É registro de um ato que o humano JÁ FEZ por fora.
//   • ⛔ Não apaga o rastro. "Contatado" é ESTADO, não desaparecimento — ver
//     `marcar-conversa-contatada.ts`.
//   • ⛔ Não carimba prazo nenhum. `venceEm` da rota de leitura continua
//     `null` — o CEO ainda não ratificou SLA.
//   • Não sobrescreve em silêncio. Já contatado → idempotente, devolve a data
//     e o autor do ato ORIGINAL.

import { NextRequest, NextResponse } from "next/server";
import { getSession, isAgencyRole } from "@/lib/auth/session";
import { deveBloquearMutacaoCrossSite } from "@/lib/security/navegacao-cross-site";
import { marcarConversaComoContatada } from "@/lib/agency/comercial/marcar-conversa-contatada";

/** Falha de infraestrutura. Fail-closed com o código honesto: repetir daqui a
 *  pouco pode funcionar, e um 400 faria o operador procurar erro no que
 *  digitou — a mesma distinção que a rota `atribuir` já faz. */
const INDISPONIVEL = new Set(["leitura_falhou", "escrita_falhou"]);

const MAX_TEXTO = 300;
const texto = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, MAX_TEXTO) : "");

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  // Sessão de portal carrega `clientId`. Ela não entra — nem como leitora.
  if (session.clientId || !isAgencyRole(session.role)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (deveBloquearMutacaoCrossSite(req)) {
    return NextResponse.json(
      { ok: false, error: "Origem não confiável para esta ação." },
      { status: 403 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const r = await marcarConversaComoContatada({
    fio: texto(body.fio),
    // ⛔ DA SESSÃO, e de lugar nenhum mais. A mesma lei de `atribuidoPor` na
    // rota irmã: se isto voltar a ler o corpo, qualquer operador assinaria o
    // ato com o nome de outro.
    contatadoPor: session.userId,
    workspaceId: session.workspaceId,
  });

  if (!r.ok) {
    const status = INDISPONIVEL.has(r.recusa) ? 503 : 400;
    return NextResponse.json({ ok: false, recusa: r.recusa, error: r.motivo }, { status });
  }

  return NextResponse.json({
    ok: true,
    jaExistia: r.jaExistia,
    contatadoEm: r.contatadoEm,
    contatadoPor: r.contatadoPor,
    mensagem: r.jaExistia
      ? "Esta conversa já estava marcada como contatada. Nada foi alterado — a data do ato original é a que vale."
      : "Marcado como contatado. O rastro continua na lista, com o registro de quando e por quem — " +
        "marcar como contatado não envia nada a ninguém: é o registro de um ato que já aconteceu por fora desta casa.",
  });
}
