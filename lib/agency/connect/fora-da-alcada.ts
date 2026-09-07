/**
 * ⭐ O GATILHO — "isto está fora da alçada do agente", decidido EM CÓDIGO.
 *
 * ─── POR QUE ESTE ARQUIVO PRECISOU NASCER ───────────────────────────────────
 *
 * O contrato do conector (30/08/2026, item 5-d) pede que cada produto tenha uma
 * classificação **em código, antes do modelo**, do que o agente não pode decidir
 * sozinho. Sem ela o conector nunca é chamado, e a resposta do contrato é
 * explícita: *a peça a construir é o gatilho, não o conector*.
 *
 * A Dioli Digital não tinha. O que ela tinha era esta linha, em
 * `lib/agency/esteira/pm-responde.ts`:
 *
 *   "- Nunca prometa prazo, preço, desconto ou escopo novo. Isso é decisão da
 *      agência, não sua."
 *
 * Isso é **prompt**, e prompt é aviso. Guardrail 4 da casa: *prompt é aviso;
 * código é trava*. Um aviso no sistema falha do jeito mais silencioso que
 * existe — o modelo obedece nove vezes e na décima escreve "consigo fazer por
 * R$ 400" para um cliente real, e ninguém fica sabendo até a cobrança.
 *
 * ⚠️ E repare no defeito ESPECÍFICO que o aviso produzia mesmo quando obedecido:
 * a instrução manda o PM dizer *"vou confirmar com a equipe e te falo"*. Ele
 * dizia — e não confirmava com ninguém, porque não existia caminho. A mensagem
 * do cliente era marcada como lida na mesma transação da resposta, e a pergunta
 * morria ali. O cliente recebia uma promessa de retorno que o sistema não tinha
 * como cumprir. Este arquivo é o começo do caminho que faz a promessa ser
 * verdadeira.
 *
 * ─── ⚠️ DE QUE LADO ESTE GATILHO ERRA, E POR QUÊ ────────────────────────────
 *
 * Ele erra para MAIS escalada, não para menos, e isso é uma escolha:
 *
 *   · Falso positivo → o cliente lê "levei pra quem decide isso aqui" e recebe,
 *     depois, uma resposta de gente (ou de uma política já registrada). Custo:
 *     uma consulta a mais e alguns minutos.
 *   · Falso negativo → o agente responde sozinho sobre preço, prazo ou desconto,
 *     **por escrito, em nome da agência**. Custo: uma dívida comercial que uma
 *     pessoa vai ter de pagar ou desdizer na frente do cliente.
 *
 * Os dois erros não são do mesmo tamanho, então o gatilho não tenta ser
 * equilibrado. Ele é conservador de propósito.
 *
 * ─── ⛔ O QUE ELE NÃO FAZ ───────────────────────────────────────────────────
 *
 * · **Não chama modelo.** É léxico e puro: mesma entrada, mesma saída, sempre,
 *   sem rede e sem custo. Um classificador que depende de IA cai junto com a IA
 *   — e o momento em que a IA cai é exatamente o momento em que o produto mais
 *   precisa saber que aquela pergunta não é dele.
 * · **Não decide o que responder.** Ele nomeia o assunto e o motivo, e entrega
 *   ao conector. Quem sabe se a empresa já decidiu aquilo é o núcleo.
 * · **Não olha o histórico.** A pergunta que trava é a que o cliente acabou de
 *   fazer. Varrer a conversa inteira faria uma pergunta de preço respondida na
 *   semana passada travar toda mensagem seguinte, para sempre.
 */

import type { AssuntoForaDaAlcada } from "./conector/contrato";

/**
 * O VOCABULÁRIO, e ele não foi inventado aqui.
 *
 * Cada assunto abaixo sai de uma proibição que a casa **já tinha escrito** —
 * `pm-responde.ts` ("prazo, preço, desconto ou escopo novo") e `avaliacoes.ts`
 * ("desconto, cupom, brinde, reembolso ou qualquer compensação"). O gatilho não
 * amplia a régua da casa; ele passa a aplicá-la em código em vez de em prosa.
 *
 * ⚠️ Os termos são conferidos com fronteira de palavra e sem acento, contra o
 * texto normalizado. "Prazo" não pode casar dentro de "prazoso", e um cliente
 * que escreve "desconto" sem acento não escapa do gatilho por causa disso.
 */
interface Regra {
  assunto: string;
  motivo: string;
  termos: string[];
}

export const REGRAS_FORA_DA_ALCADA: readonly Regra[] = [
  {
    assunto: "desconto",
    motivo:
      "o cliente está pedindo abatimento no valor. Conceder desconto é decisão comercial da agência: " +
      "um agente que concede cria preço novo sem ninguém ter decidido, e o próximo cliente pede o mesmo.",
    termos: [
      "desconto", "descontos", "abatimento", "cupom", "cupons", "voucher",
      "mais barato", "baixar o preco", "baixar o valor", "reduzir o valor",
      "condicao especial", "condicoes especiais", "cortesia", "brinde", "de graca", "gratis",
    ],
  },
  {
    assunto: "preco",
    motivo:
      "o cliente está pedindo um valor que não é o da tabela, ou um valor para algo que a tabela não " +
      "cobre. Preço fora de tabela é decisão da agência — a triagem já se recusa a inventar número, e o " +
      "agente de conversa não pode fazer pela porta dos fundos o que a esteira se recusa a fazer.",
    termos: [
      "quanto custa", "quanto fica", "quanto sai", "qual o valor", "qual o preco",
      "me passa o valor", "faz por", "fecha por", "orcamento", "orcar",
      "tabela de preco", "tabela de precos", "valor fechado", "pacote fechado",
    ],
  },
  {
    assunto: "prazo",
    motivo:
      "o cliente está pedindo compromisso de data. Prazo prometido por um agente é um SLA que não existe " +
      "em lugar nenhum do sistema e que ninguém confere — e é gente que paga quando ele estoura.",
    termos: [
      "prazo", "ate quando", "para quando", "quando fica pronto", "quando sai",
      "quando entrega", "quanto tempo", "urgente para", "preciso para", "consegue ate",
      "data de entrega", "entrega ate",
    ],
  },
  {
    assunto: "escopo",
    motivo:
      "o cliente está pedindo trabalho fora do que foi contratado. Escopo novo é venda: aceitar sem " +
      "decisão é a agência produzindo de graça, e recusar sem decisão é a agência perdendo a venda — " +
      "nenhuma das duas é do agente.",
    termos: [
      "fora do contrato", "fora do pacote", "alem do combinado", "alem do contratado",
      "incluir tambem", "incluir mais", "adicionar ao pacote", "trocar o pacote",
      "mudar o plano", "aumentar o pacote", "servico novo", "escopo",
    ],
  },
  {
    assunto: "cancelamento",
    motivo:
      "o cliente está falando em encerrar, suspender ou reverter a contratação. Cancelamento, reembolso " +
      "e pausa mexem em dinheiro já cobrado e em contrato — é decisão da agência, e um agente que " +
      "confirma um cancelamento fecha uma conta que ninguém autorizou fechar.",
    termos: [
      "cancelar", "cancelamento", "reembolso", "estorno", "devolver o dinheiro",
      "quero sair", "encerrar o contrato", "rescindir", "rescisao",
      "suspender o contrato", "pausar o contrato", "parar de pagar",
    ],
  },
  {
    assunto: "contrato",
    motivo:
      "o cliente está pedindo alteração de condição contratual (exclusividade, fidelidade, forma de " +
      "pagamento, multa). Isso é jurídico e comercial da agência, e não se ajusta numa conversa de portal.",
    termos: [
      "exclusividade", "fidelidade", "multa", "clausula", "clausulas",
      "forma de pagamento", "parcelar", "parcelamento", "nota fiscal antecipada",
      "mudar o vencimento", "renegociar",
    ],
  },
] as const;

/**
 * Tira acento, baixa a caixa e achata o espaço.
 *
 * O acento sai porque cliente digita "orçamento" e "orcamento" com a mesma
 * intenção, e um gatilho que só pega a forma acentuada é um gatilho que um
 * teclado de celular desliga.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * O termo aparece como PALAVRA, e não como pedaço de outra?
 *
 * `includes` cru transformaria "prazo" em refém de "prazoso" e "escopo" em
 * refém de qualquer coisa que o contivesse. A fronteira é conferida à mão
 * porque `\b` do JavaScript não entende que "ç" já virou "c" mas continua sendo
 * letra em outras palavras.
 */
export function contemTermo(textoNormalizado: string, termo: string): boolean {
  const alvo = normalizar(termo);
  let de = 0;
  for (;;) {
    const i = textoNormalizado.indexOf(alvo, de);
    if (i < 0) return false;
    const antes = i === 0 ? "" : textoNormalizado[i - 1]!;
    const depois = textoNormalizado[i + alvo.length] ?? "";
    const letra = /[a-z0-9]/;
    if (!letra.test(antes) && !letra.test(depois)) return true;
    de = i + 1;
  }
}

/**
 * ⭐ O GATILHO. Puro, sem rede, sem modelo, sem banco.
 *
 * Devolve a lista de assuntos que o agente **não pode decidir sozinho**. Lista
 * vazia significa uma coisa exata: nada nesta mensagem exige decisão da agência,
 * e o agente segue respondendo como sempre respondeu.
 *
 * ⚠️ Lista vazia NÃO significa "está tudo certo com a mensagem". Este gatilho
 * responde uma pergunta só, e é bom que ele responda só uma.
 */
export function foraDaAlcadaNaMensagem(mensagem: string): AssuntoForaDaAlcada[] {
  if (typeof mensagem !== "string" || !mensagem.trim()) return [];
  const texto = normalizar(mensagem);
  const achados: AssuntoForaDaAlcada[] = [];
  for (const regra of REGRAS_FORA_DA_ALCADA) {
    if (regra.termos.some((t) => contemTermo(texto, t))) {
      achados.push({ assunto: regra.assunto, motivo: regra.motivo });
    }
  }
  return achados;
}

/** Atalho legível para quem só quer saber se trava. */
export function estaForaDaAlcada(mensagem: string): boolean {
  return foraDaAlcadaNaMensagem(mensagem).length > 0;
}
