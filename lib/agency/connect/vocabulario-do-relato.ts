/**
 * ⭐⭐ AS PALAVRAS COM QUE ESTA CASA RELATA UMA RESPOSTA QUE AINDA NÃO CHEGOU.
 *
 * ─── ORDEM DO CEO, 30/08/2026 ───────────────────────────────────────────────
 *
 * **Enquanto o cliente não recebeu o texto, diz-se "resposta preservada e
 * reagendada".** ⛔ Nunca "recuperação concluída". Nunca "entregue". No código,
 * no log e no relatório.
 *
 * ─── POR QUE ISTO É UMA CONSTANTE, E NÃO UM COMBINADO ───────────────────────
 *
 * Guardrail 4 desta casa: *prompt é aviso; código é trava.* "Combinamos de não
 * escrever 'concluída'" sobrevive a uma semana e a três autores. O que sobrevive
 * é uma frase que mora num lugar só, e um teste que reprova quem escrever a
 * palavra proibida — ver `__tests__/connect/vocabulario-do-relato.test.ts`.
 *
 * ─── ⚠️ E POR QUE A PALAVRA IMPORTA MESMO ──────────────────────────────────
 *
 * "Concluída" e "entregue" fecham a pergunta na cabeça de quem lê. Quem lê um
 * relatório que diz "recuperação concluída" para de procurar — e o cliente
 * continua esperando, agora sem ninguém olhando para ele. É o mesmo defeito que
 * `AGUARDANDO_ENVIO` já existe para impedir no BANCO (decisões C4/C5): receber
 * não é entregar. Esta constante leva a mesma regra para a LÍNGUA.
 */

/** ⭐ A frase exata. Um lugar só, para não haver duas versões dela. */
export const RESPOSTA_PRESERVADA_E_REAGENDADA = "resposta preservada e reagendada";

/**
 * ⛔ O que NÃO se escreve sobre uma resposta que o cliente ainda não recebeu.
 *
 * Com e sem acento: o log da casa passa por lugares que comem acento, e uma
 * trava que só pega a forma acentuada não pega a metade dos casos.
 */
export const TERMOS_PROIBIDOS_ANTES_DA_ENTREGA = [
  "recuperação concluída",
  "recuperacao concluida",
  "recuperação concluida",
  "recuperacao concluída",
] as const;

/**
 * O relato honesto de uma decisão que voltou do gerente e ainda não chegou ao
 * cliente.
 *
 * ⚠️ Repare no que esta frase NÃO diz: não diz que acabou. Ela diz as duas
 * coisas verdadeiras — a resposta não se perdeu, e há um próximo passo marcado
 * — e deixa a pergunta ABERTA, que é onde ela tem que ficar enquanto tiver
 * gente esperando.
 */
export function relatarRespostaNaoEntregue(detalhe?: string): string {
  return detalhe
    ? `${RESPOSTA_PRESERVADA_E_REAGENDADA} (${detalhe})`
    : RESPOSTA_PRESERVADA_E_REAGENDADA;
}
