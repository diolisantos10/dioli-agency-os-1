// PREÇO CHEIO APÓS NEGOCIAÇÃO — quem pediu ajuste e recebeu o valor de tabela.
//
// ═══ O DANO (auditoria de 30/08/2026, ordem do Diretor Geral) ══════════════
//
// A tabela de preço fechado — `minPrice === maxPrice` por construção, ver
// `lib/agency/live-calculator.ts:51` ("aprovada pelo CEO em 25/08/2026") e
// `:141` — deixou a trava de `negotiateProposal`
// (`lib/agency/execution/negotiate-proposal.ts:39`) com uma condição
// IMPOSSÍVEL:
//
//   data.newTotal >= floor && data.newTotal < est.totalMax
//
// Como `floor` (`est.totalMin`) e `est.totalMax` são o MESMO número desde
// 25/08, nenhum valor satisfaz as duas pontas ao mesmo tempo. `newTotal` é
// sempre `null`, e a proposta reaberta sai com o preço cheio de tabela — não
// com a "condição especial" que o SDR pode ter sugerido na mensagem.
//
// **Consequência:** desde 25/08, TODO pedido de ajuste de preço, dentro do
// piloto, produziu uma proposta reaberta no preço cheio. Este módulo lista
// quem pediu.
//
// ═══ MÓDULO PURO — sem Prisma, sem banco ════════════════════════════════════
//
// Recebe linhas JÁ LIDAS pela rota (`app/api/piloto/diagnostico/route.ts`) e
// devolve o retrato. Não decide o que fazer com a lista — isso é do CEO.
//
// ═══ O SINAL DE QUE HOUVE NEGOCIAÇÃO ════════════════════════════════════════
//
// `negotiateProposal` deixa DOIS fatos, sempre juntos, em
// `lib/agency/execution/negotiate-proposal.ts:66-67`:
//
//   1. um `ApprovalRequest` NOVO com `department: "proposal"`;
//   2. o `reviewNote` desse registro começa, literalmente, com
//      `"Proposta ajustada — "` (a mesma string usada para montar
//      `proposalText`, linha 56).
//
// Nenhum outro caminho da casa escreve essa string neste campo — é a marca do
// SDR renegociando, não da proposta original (que nasce sem `reviewNote`
// nesse formato). Por isso ela é a MARCA REAL, e não uma heurística por cima
// do estado: estado (`proposal_pending`) é usado por proposta nova e por
// proposta renegociada da mesma forma (de propósito — ver o comentário de
// `negotiate-proposal.ts:68-105`), então SÓ o texto do `reviewNote` separa as
// duas. Se este texto mudar de wording um dia, esta marca para de achar linha
// — e isso deve ser dito, não escondido atrás de um retrato vazio.
//
// ═══ QUANTO — o número que o CLIENTE viu ════════════════════════════════════
//
// Não recalculamos o preço: lemos o valor que está escrito na linha "Total"
// do próprio `reviewNote` — é literalmente a proposta que a pessoa recebeu.
// Dado o defeito acima, esse valor É o preço cheio (`est.totalMin`), nunca um
// valor negociado — mas o módulo não afirma isso por inferência: ele lê o que
// está escrito.
//
// ═══ O QUE NUNCA SAI DAQUI (corrigido em 07/09/2026, `seguranca`) ═══════════
//
// A ficha original desta auditoria (`.despachos/F1-auditoria-preco-cheio.md`)
// autorizava devolver `businessName` junto com o id, por decisão do Diretor.
// **Essa autorização estava errada** — a rota que chama este módulo
// (`app/api/piloto/diagnostico/route.ts`) já declara no próprio cabeçalho
// "nenhum nome de prospect", e o segredo dela trafega em `?chave=`, que
// aparece em log de proxy/CDN. Quem capturar a chave passaria a ler nome de
// cliente, não só contagem — uma trava não se afrouxa porque quem pediu tinha
// pressa. Guarda: `__tests__/plataforma/diagnostico-mede-e-nao-escreve.test.ts`.
//
// Nada além de: id do pedido (`clientRequestId` — quem, com precisão, para
// quem já tem sessão no painel), valor, data, e se há pagamento confirmado
// ligado ao pedido. Sem nome, sem telefone, sem e-mail, sem frase de conversa.

/** A marca que `negotiateProposal` grava — e SÓ ela — quando renegocia. */
export const MARCA_DA_PROPOSTA_AJUSTADA = "Proposta ajustada — ";

/**
 * O início da janela investigada: quando a tabela de preço fechado entrou em
 * vigor, segundo o próprio código (`live-calculator.ts:51`,
 * "aprovada pelo CEO em 25/08/2026" — é essa mudança que tornou
 * `minPrice === maxPrice` e, com ela, a condição de `negotiateProposal`
 * impossível). Comparado por instante (00:00 UTC do dia), não por data civil
 * de fuso — declarado aqui para quem for auditar o corte.
 */
export const INICIO_DA_JANELA = new Date("2026-08-25T00:00:00.000Z");

/** Um `ApprovalRequest`, como a rota o lê do banco — só os campos que decidem
 *  se a linha é uma proposta renegociada. */
export type LinhaDeAprovacaoBruta = {
  clientRequestId: string | null;
  department: string;
  reviewNote: string | null;
  createdAt: Date;
};

/** Um `PagamentoConfirmado`, como a rota o lê do banco. A EXISTÊNCIA da linha
 *  é a prova de pagamento — nunca um status derivado. */
export type LinhaDePagamentoBruta = {
  clientRequestId: string;
  confirmadoEm: Date;
  valorCentavos: number;
};

export type LinhaDeCobrancaNegociada = {
  /** "Quem" com precisão, sem PII: quem tem a lista de ids abre o painel,
   *  com sessão, e vê o nome — como deve ser. */
  clientRequestId: string;
  /** O valor que está escrito na linha "Total" do `reviewNote`, em CENTAVOS.
   *  `null` quando o texto não tem o formato esperado — declarado, não
   *  chutado em zero. */
  valorNaPropostaCentavos: number | null;
  /** Quando ESTA proposta renegociada foi criada — a data da negociação. */
  negociadoEm: Date;
  pago: boolean;
  /** `null` quando `pago` é `false`. */
  pagoEm: Date | null;
  valorPagoCentavos: number | null;
};

/**
 * É esta linha uma proposta renegociada por `negotiateProposal`?
 *
 * As duas condições são as descritas no cabeçalho: departamento `"proposal"`
 * E o `reviewNote` começando pela marca exata. Uma condição sem a outra não
 * basta — `department: "proposal"` sozinho pega TAMBÉM a proposta original
 * (que nunca foi negociada), e a marca sozinha, em outro departamento, seria
 * coincidência de texto.
 */
export function ehPropostaRenegociada(linha: LinhaDeAprovacaoBruta): linha is LinhaDeAprovacaoBruta & { clientRequestId: string; reviewNote: string } {
  return (
    linha.department === "proposal" &&
    typeof linha.reviewNote === "string" &&
    linha.reviewNote.startsWith(MARCA_DA_PROPOSTA_AJUSTADA) &&
    typeof linha.clientRequestId === "string" &&
    linha.clientRequestId.length > 0
  );
}

/**
 * O valor da linha "Total" dentro do `reviewNote`, em CENTAVOS.
 *
 * Lê o PRIMEIRO "R$ <número>" da primeira linha que começa com "Total" — é
 * assim que `negotiate-proposal.ts` monta o texto, nos dois formatos
 * possíveis (`"Total (condição especial): R$ X / mês"` e
 * `"Total: R$ X a R$ Y / mês"`). Não soma, não escolhe o maior: o primeiro
 * número é o que a pessoa lê primeiro.
 *
 * `null` para texto sem essa linha, ou sem número reconhecível — nunca 0.
 * Zero centavos seria "cobrou de graça", que é um fato diferente de "não
 * consegui ler o valor".
 */
export function valorDaLinhaDeTotal(reviewNote: string): number | null {
  const linhaTotal = reviewNote.split("\n").find((l) => l.trim().startsWith("Total"));
  if (!linhaTotal) return null;
  const achado = linhaTotal.match(/R\$\s*([\d.]+)/);
  if (!achado) return null;
  const reais = Number(achado[1]!.replace(/\./g, ""));
  if (!Number.isFinite(reais) || reais <= 0) return null;
  return Math.round(reais * 100);
}

/**
 * O retrato: toda proposta renegociada dentro da janela, com quem, quanto,
 * quando e se pagou.
 *
 * Fail-closed na entrada: `aprovacoes` e `pagamentos` vazios ou ausentes
 * devolvem lista vazia — porque É uma lista vazia (não houve o que juntar),
 * nunca porque o módulo escondeu um erro. Quem decide "a leitura falhou, não
 * é zero" é o CHAMADOR (a rota), antes de chegar aqui — este módulo não sabe
 * distinguir "o banco não respondeu" de "não achei nada", e não deve fingir
 * que sabe.
 */
export function negociacoesEmPrecoCheio(
  aprovacoes: LinhaDeAprovacaoBruta[],
  pagamentos: LinhaDePagamentoBruta[],
  inicio: Date = INICIO_DA_JANELA,
): LinhaDeCobrancaNegociada[] {
  const pagamentoDoPedido = new Map(pagamentos.map((p) => [p.clientRequestId, p]));

  return aprovacoes
    .filter(ehPropostaRenegociada)
    .filter((a) => a.createdAt >= inicio)
    .map((a) => {
      const pagamento = pagamentoDoPedido.get(a.clientRequestId);
      return {
        clientRequestId: a.clientRequestId,
        valorNaPropostaCentavos: valorDaLinhaDeTotal(a.reviewNote),
        negociadoEm: a.createdAt,
        pago: Boolean(pagamento),
        pagoEm: pagamento?.confirmadoEm ?? null,
        valorPagoCentavos: pagamento?.valorCentavos ?? null,
      } satisfies LinhaDeCobrancaNegociada;
    });
}

export type RetratoDePrecoCheio = {
  total: number;
  pagos: number;
  naoPagos: number;
  linhas: LinhaDeCobrancaNegociada[];
};

/** O resumo que a rota devolve — contagem antes da lista, mesmo padrão do
 *  diário do piloto ("existe ou não existe" primeiro). */
export function retratoDoLote(
  aprovacoes: LinhaDeAprovacaoBruta[],
  pagamentos: LinhaDePagamentoBruta[],
  inicio: Date = INICIO_DA_JANELA,
): RetratoDePrecoCheio {
  const linhas = negociacoesEmPrecoCheio(aprovacoes, pagamentos, inicio);
  return {
    total: linhas.length,
    pagos: linhas.filter((l) => l.pago).length,
    naoPagos: linhas.filter((l) => !l.pago).length,
    linhas,
  };
}
