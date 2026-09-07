/**
 * ⭐⭐ A TRADUÇÃO DO VOCABULÁRIO — o produto fala a língua do núcleo.
 *
 * ─── O DEFEITO QUE ISTO CONSERTA (medido em 30/08/2026) ─────────────────────
 *
 * O núcleo do Dioli Connect tem um vocabulário **FECHADO** para
 * `assuntos[].assunto`. Assunto fora dele não é "um assunto que o núcleo não
 * conhece": é a consulta INTEIRA recusada, com
 * `{"codigo":"assunto_fora_do_vocabulario"}`.
 *
 * O Foocci foi medido contra o núcleo real e reprovou: mandava `permuta`,
 * `escopoAcimaDaCapacidade` e `prazoDeImplantacao` — **zero interseção** com o
 * vocabulário. A Dioli Digital classificava em `desconto`, `preco`, `prazo`,
 * `escopo`, `cancelamento` e `contrato` — também zero interseção. O mesmo
 * defeito, noutro produto.
 *
 * ─── ⚠️ POR QUE NENHUMA SUÍTE PEGOU ────────────────────────────────────────
 *
 * Porque o núcleo de mentira aceitava QUALQUER assunto. Um interlocutor
 * complacente não mede nada: ele responde 200 para o certo e para o errado, e o
 * verde que ele produz é sobre a educação dele, não sobre o nosso contrato.
 * A causa está consertada em `__tests__/connect/_nucleo-de-mentira.ts`, que
 * agora recusa como o real. Este arquivo conserta o SINTOMA.
 *
 * ─── ONDE ESTA TRADUÇÃO MORA, E POR QUE AQUI ───────────────────────────────
 *
 * Decisão D3: **o núcleo manda no contrato, o produto traduz.** Então a
 * tradução é LOCAL — este arquivo é da Dioli Digital e de mais ninguém.
 *
 * ⛔ Ela NÃO pode morar em `conector/politicas.ts` nem em nenhum outro arquivo
 * comum: aqueles têm impressão digital gravada em `conector/versao.ts` e são os
 * MESMOS nos quatro produtos (trava C3). Um `if` de vocabulário da Dioli Digital
 * dentro do comum viraria quatro contratos que se parecem — o defeito-mãe que a
 * C3 existe para impedir.
 */

import type { AssuntoForaDaAlcada } from "./conector/contrato";

/**
 * ⭐ O VOCABULÁRIO FECHADO DO NÚCLEO, literal.
 *
 * ⚠️ Esta lista não é opinião desta casa: é o que o núcleo aceita, medido
 * contra ele. Mudou lá? Muda aqui — e não o contrário. Acrescentar um termo
 * aqui que o núcleo não conhece não abre porta nenhuma; só troca a recusa de
 * lugar.
 */
export const ASSUNTOS_DO_NUCLEO = [
  "volume_dentro_da_capacidade",
  "volume_acima_da_capacidade",
  "preco_ou_desconto",
  "forma_de_pagamento_nao_padrao",
  "prazo_de_entrega",
  "escopo_fora_do_contratado",
] as const;

export type AssuntoDoNucleo = (typeof ASSUNTOS_DO_NUCLEO)[number];

export function ehAssuntoDoNucleo(a: string): a is AssuntoDoNucleo {
  return (ASSUNTOS_DO_NUCLEO as readonly string[]).includes(a);
}

/**
 * ⭐ DE COMO A DIOLI DIGITAL CLASSIFICA → PARA COMO O NÚCLEO ENTENDE.
 *
 * `null` quer dizer uma coisa exata e honesta: **o vocabulário do núcleo não
 * tem termo para isto.** Não é esquecimento e não é "ainda não mapeei" — é a
 * ausência registrada, para que ninguém a confunda com um mapeamento que
 * alguém deixou pela metade.
 *
 * ⚠️ E POR QUE NÃO CHUTAR UM TERMO PARECIDO. Porque o assunto é o que diz ao
 * gerente QUAL pergunta ele está respondendo. Mandar `cancelamento` como
 * `escopo_fora_do_contratado` não faria a consulta passar: faria o gerente
 * decidir escopo enquanto o cliente pede reembolso. Uma resposta entregue com
 * base num campo que mudou de sentido é pior do que uma resposta que não saiu
 * — é a mesma régua que o `contratoCompativel` já aplica em `versao.ts`.
 */
export const TRADUCAO_DA_DIOLI_DIGITAL: Readonly<Record<string, AssuntoDoNucleo | null>> = {
  // Os dois caem no MESMO termo do núcleo, e isso é correto: lá a pergunta é
  // "mexeu no valor?", e tanto pedir abatimento quanto pedir preço fora de
  // tabela mexem.
  desconto: "preco_ou_desconto",
  preco: "preco_ou_desconto",
  prazo: "prazo_de_entrega",
  escopo: "escopo_fora_do_contratado",

  // ⛔ SEM TERMO NO NÚCLEO — e as duas estão registradas, não escondidas.
  //
  // `cancelamento` (cancelar, reembolso, estorno, rescisão) não tem nada
  // parecido entre os seis: o vocabulário do núcleo fala de volume, valor,
  // forma de pagamento, prazo e escopo — encerrar contratação não é nenhum
  // deles.
  //
  // `contrato` é PARCIAL, que é pior do que ausente para quem chuta: os termos
  // de pagamento ("parcelar", "forma de pagamento", "mudar o vencimento")
  // caberiam em `forma_de_pagamento_nao_padrao`, mas exclusividade, fidelidade,
  // multa e cláusula não cabem em termo nenhum. Uma regra só, com dois sentidos
  // dentro, não se traduz em um termo só sem mentir sobre metade dela.
  //
  // Enquanto não houver decisão do dono do núcleo, estas duas seguem indo como
  // vão hoje: o núcleo recusa, a escalada não abre e a mensagem fica na fila
  // humana — exatamente o chão de antes deste arquivo existir.
  cancelamento: null,
  contrato: null,
};

export interface AssuntosTraduzidos {
  /** O que vai no corpo de rede. */
  paraORede: AssuntoForaDaAlcada[];
  /** Os assuntos locais que não têm termo no núcleo, para o rastro. */
  semTermoNoNucleo: string[];
}

/**
 * ⭐ Traduz a lista para a língua do núcleo.
 *
 * ⚠️ A REGRA DO "NENHUM TRADUZÍVEL" É DELIBERADA, e é o que impede esta
 * mudança de piorar alguma coisa:
 *
 *   • **Havendo ao menos um traduzível**, só os traduzíveis viajam. Antes, uma
 *     mensagem que misturasse "desconto" e "cancelamento" era recusada INTEIRA
 *     pelo núcleo por causa do segundo, e o cliente perdia também a resposta do
 *     primeiro. Agora o desconto passa.
 *
 *   • **Não havendo nenhum**, a lista viaja INTACTA — de propósito. O núcleo
 *     recusa, como já recusa hoje, e a mensagem cai na fila humana pelo mesmo
 *     caminho de sempre. Inventar aqui um estado novo ("nem tentei") exigiria
 *     uma causa nova em `conector/politicas.ts`, que é arquivo comum com
 *     impressão digital — e produto não reescreve contrato comum por conta
 *     própria. Então o comportamento fica IDÊNTICO ao de hoje nesse caso, e a
 *     decisão sobe para quem manda no núcleo.
 */
export function traduzirAssuntosParaONucleo(
  assuntos: readonly AssuntoForaDaAlcada[],
): AssuntosTraduzidos {
  const paraORede: AssuntoForaDaAlcada[] = [];
  const semTermoNoNucleo: string[] = [];

  for (const a of assuntos) {
    // Já veio na língua do núcleo? Passa direto — assim um produto que já
    // classifique certo não é traduzido duas vezes.
    if (ehAssuntoDoNucleo(a.assunto)) {
      paraORede.push(a);
      continue;
    }
    const termo = TRADUCAO_DA_DIOLI_DIGITAL[a.assunto] ?? null;
    if (termo) paraORede.push({ assunto: termo, motivo: a.motivo });
    else semTermoNoNucleo.push(a.assunto);
  }

  // Ver o comentário grande acima: sem nenhum traduzível, nada muda.
  if (paraORede.length === 0) {
    return { paraORede: [...assuntos], semTermoNoNucleo };
  }
  return { paraORede, semTermoNoNucleo };
}
