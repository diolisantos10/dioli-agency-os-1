// A RÉGUA DE NEGOCIAÇÃO DO SDR — fonte única do piso, da faixa e da barganha.
//
// Decisão do CEO em 05/08/2026: o objetivo do SDR é FECHAR TODO CLIENTE, desde
// que não haja prejuízo. Isso muda o desenho do comercial em três pontos:
//
//   1. Ele descobre CEDO quanto o cliente pode gastar. Faixa perguntada no fim
//      da conversa é faixa descoberta depois de já ter ancorado o preço errado —
//      ou o cliente some antes de responder.
//   2. Dentro da faixa, ele monta o MAIOR valor possível. Vender abaixo do que a
//      pessoa podia pagar não é gentileza, é dinheiro deixado na mesa.
//   3. Ele desce o preço só até um PISO calculado. Abaixo do piso não existe
//      "fechar com prejuízo pequeno": existe carteira inteira ancorada no menor
//      preço que alguém já conseguiu.
//
// ─── POR QUE ESTE MÓDULO É FAIL-CLOSED ───────────────────────────────────────
// Esta casa roda 100% IA, sem revisor humano antes do cliente. Um item fora da
// tabela — nome novo, id digitado errado, serviço que alguém inventou na
// conversa — NÃO pode ser autorizado "por omissão". Ausência de piso não é piso
// zero: é ausência de autorização. Por isso `podeFechar` devolve `pode: false`
// para item desconhecido, e o piso vem como `Infinity` (nenhum valor passa).
//
// ─── O QUE NÃO MORA AQUI, DE PROPÓSITO ───────────────────────────────────────
// Os números de piso são INTERNOS. Eles nunca entram no prompt de uma rota
// pública: prompt é texto que o interlocutor pode tentar extrair. O que vai para
// o prompt é `blocoDeNegociacaoParaPrompt()`, que renderiza só a parte pública
// (as faixas e as regras de conduta). A trava do piso é executada no servidor,
// aqui — trava, não aviso.
//
// ─── O CONFLITO QUE ESTAVA ABERTO AQUI FOI FECHADO (27/08/2026) ──────────────
// Este cabeçalho declarava uma contradição viva: `docs/precos.md` dizia
// "desconto sai do prazo ou da implantação, nunca da mensalidade", e este
// módulo descontava a mensalidade em 22% (`preco * 0.78`).
//
// O CEO decidiu, e decidiu para o lado mais apertado: *"desconto que a casa não
// autorizou não existe; sem faixa configurada, desconto nenhum"*. O piso agora
// vem de `lib/agency/financeiro/tabela-de-precos.ts`, que é a fonte única — e
// lá ele só desce se houver faixa DECLARADA, o que hoje não há.
//
// `moedasDeTroca` continua sendo a primeira resposta, e agora é a ÚNICA: o que
// se negocia é prazo, escopo e degrau — nunca a mensalidade.

import { precoEmReais, PLANOS } from "../planos";
import { pisoDoServico, servicoPorChave } from "@/lib/agency/financeiro/tabela-de-precos";
import { SELF_SERVE_CATALOG } from "../self-serve-catalog";

// ─────────────────────────────────────────────────────────────────────────────
// 1. FAIXAS DE INVESTIMENTO — o que se oferece para cada bolso
// ─────────────────────────────────────────────────────────────────────────────

/** Id da faixa. `indefinida` existe porque não saber a faixa é um estado real da
 *  conversa — e tratar "não sei" como se fosse a faixa mais barata (ou a mais
 *  cara) é inventar dado do cliente. */
export type FaixaId = "balcao" | "pacote" | "presenca" | "gestao" | "projeto" | "indefinida";

export interface Oferta {
  faixa: FaixaId;
  /** Como a faixa é dita ao cliente. Vira opção de escolha na conversa. */
  rotulo: string;
  /** Limite inferior (exclusivo) e superior (inclusivo) em reais. */
  de: number;
  ate: number;
  /** A oferta que o SDR monta primeiro — o maior valor honesto da faixa. */
  principal: string;
  /** O plano B da MESMA faixa. Serve para o cliente escolher entre dois "sim",
   *  nunca entre "sim" e "não". */
  alternativa: string;
  /** A condição que faz essa faixa fechar sem prejuízo. */
  condicao: string;
  /** true quando a faixa foi deduzida em vez de informada: o SDR precisa
   *  confirmar antes de propor qualquer coisa. */
  confirmarAntes: boolean;
}

/** As cinco faixas, na ordem. Ordem importa: `ofertaParaFaixa` percorre de baixo
 *  para cima e devolve a primeira que couber. */
/**
 * COMO O SDR NOMEIA UM PLANO. Nome e preço vêm de `planos.ts` — nunca digitados.
 *
 * ⛔ AQUI MORAVA O DEFEITO MAIS CARO DESTE ARQUIVO, e ele estava vivo em
 * produção: as ofertas eram strings digitadas à mão, e tinham envelhecido sem
 * que ninguém relesse. O SDR que conversa com prospect de verdade estava
 * oferecendo, em 27/08/2026:
 *
 *   • *"Plano Ritmo (R$ 297/mês): 8 peças"*      → hoje é R$ 290 e 12 peças
 *   • *"Plano Presença (R$ 790/mês)"*            → hoje é R$ 490 (R$ 790 é o CONTEÚDO)
 *   • *"Plano Conteúdo (R$ 1.390/mês)"*          → hoje é R$ 790
 *   • *"Plano Crescimento (R$ 2.590/mês)"*       → **este plano NÃO EXISTE MAIS**
 *
 * Quatro preços errados e um plano descontinuado sendo vendido. Não é detalhe
 * de texto: é a casa cobrando o número errado na boca de quem fecha negócio.
 *
 * A lição é a da casa inteira: *verdade escrita em dois lugares já está errada
 * em um deles* — e a cópia que apodrece é sempre a que ninguém relê.
 */
function ofertaDoPlano(id: "ritmo" | "presenca" | "conteudo"): string {
  const p = PLANOS.find((x) => x.id === id);
  if (!p) return "Plano sob consulta";
  return `Plano ${p.nome} (${precoEmReais(p.preco)}/mês, ${p.pecasPorMes} peças)`;
}

export const FAIXAS: Oferta[] = [
  {
    faixa: "balcao",
    rotulo: "até R$ 150",
    de: 0,
    ate: 150,
    principal: "Balcão: peça única (post, carrossel ou stories), produção por máquina, pagamento antes da entrega",
    alternativa: "Só a copy da peça, se o cliente já tem a arte",
    // Por que pagar antes: no balcão não há contrato nem permanência. Sem
    // pagamento antecipado, o custo de produção vira prejuízo na inadimplência.
    condicao: "Pagamento antes da produção. Sem hora humana — se entrar gente, o degrau quebra.",
    confirmarAntes: false,
  },
  {
    faixa: "pacote",
    rotulo: "entre R$ 150 e R$ 500",
    de: 150,
    ate: 500,
    principal: `${ofertaDoPlano("ritmo")}: pauta, peças prontas e aprovação no portal — quem publica é o cliente`,
    alternativa: "Pacote de peças avulsas montado dentro do que ele tem para gastar",
    condicao: "No Ritmo a publicação é do cliente. Publicar por ele derruba a conta do degrau.",
    confirmarAntes: false,
  },
  {
    faixa: "presenca",
    rotulo: "entre R$ 500 e R$ 1.500",
    de: 500,
    ate: 1500,
    principal: `${ofertaDoPlano("presenca")}: é aqui que entra gente da nossa equipe, publicação e Google gerenciado`,
    alternativa: "Projeto de marca (identidade visual ou posicionamento), com começo e fim",
    condicao: "Projeto de marca não é mensalidade — é entrega com prazo próprio.",
    confirmarAntes: false,
  },
  {
    faixa: "gestao",
    rotulo: "entre R$ 1.500 e R$ 5.000",
    de: 1500,
    ate: 5000,
    principal: `${ofertaDoPlano("conteudo")}: o volume inteiro da casa, stories, plano de medição e reunião mensal`,
    alternativa: "Projeto orçado à parte (campanha paga desenhada), com escopo, prazo e preço fechados antes de começar",
    // A verba de mídia fica FORA. Se ela entrar na conta da faixa, o cliente
    // acha que R$ 2.000 cobrem plano + anúncio, e a agência trabalha de graça.
    condicao: "A verba de mídia é sempre à parte, paga por ele direto à plataforma. Zero promessa de retorno.",
    confirmarAntes: false,
  },
  {
    faixa: "projeto",
    rotulo: "acima de R$ 5.000",
    de: 5000,
    ate: Number.POSITIVE_INFINITY,
    principal: "Projeto em fases: cada fase com escopo, prazo e preço fechados antes de começar",
    alternativa: `${ofertaDoPlano("conteudo")} como base, com as fases entrando por cima mês a mês`,
    condicao: "Fase seguinte só é vendida com a anterior entregue. Nada de escopo aberto.",
    confirmarAntes: false,
  },
];

/** A faixa que não é faixa: o cliente ainda não disse quanto pode gastar.
 *  Não devolve "nada para você" — devolve o menor compromisso possível E a
 *  ordem de confirmar antes de propor. Ausência de informação não é informação. */
const FAIXA_INDEFINIDA: Oferta = {
  faixa: "indefinida",
  rotulo: "ainda não informada",
  de: Number.NaN,
  ate: Number.NaN,
  principal: "Perguntar a faixa antes de propor. Se precisar de algo na mesa agora, use a peça única do balcão.",
  alternativa: "Nenhuma — propor plano sem saber a faixa é chutar o bolso do cliente.",
  condicao: "Não montar proposta com faixa deduzida. Perguntar.",
  confirmarAntes: true,
};

/**
 * Dado quanto o cliente pode gastar (em reais), devolve o que se oferece.
 *
 * Valor inválido (NaN, negativo, infinito) NÃO cai na faixa mais barata: cai em
 * `indefinida`. Deduzir a faixa a partir de lixo é preencher gap por inferência.
 */
export function ofertaParaFaixa(valorEmReais: number): Oferta {
  if (typeof valorEmReais !== "number" || !Number.isFinite(valorEmReais) || valorEmReais < 0) {
    return FAIXA_INDEFINIDA;
  }
  // R$ 0 informado é informação: o cliente disse que não tem verba agora.
  // Ainda assim tem produto — o balcão — só que ele precisa confirmar.
  if (valorEmReais === 0) return { ...FAIXAS[0], confirmarAntes: true };

  return FAIXAS.find((f) => valorEmReais > f.de && valorEmReais <= f.ate) ?? FAIXAS[FAIXAS.length - 1];
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. A TABELA DE PISO — preço cheio → o mais baixo que pode ser vendido
// ─────────────────────────────────────────────────────────────────────────────

export type ItemNegociavel =
  | "post"
  | "carrossel"
  | "stories"
  | "copy"
  | "auditoria"
  // ⚠️ Os planos vêm da TABELA ÚNICA. `crescimento` saiu em 26/08/2026, junto
  // com o degrau — não se negocia o que não se vende.
  | "ritmo"
  | "presenca"
  | "conteudo";

export interface LinhaDaTabela {
  id: ItemNegociavel;
  nome: string;
  /** Preço cheio, o que o cliente vê primeiro. */
  cheio: number;
  /** O mais baixo autorizado. Abaixo disto ninguém fecha — nem o Diretor. */
  piso: number;
  /** É mensalidade ou compra única? Muda a conversa: em mensalidade, o desconto
   *  se repete todo mês. */
  recorrente: boolean;
  /** O que se oferece quando o preço bate no piso: escopo menor, nunca margem
   *  menor. Escrito por extenso porque é isto que o SDR fala. */
  versaoMenor: string;
}

export const TABELA_DE_PISO: Record<ItemNegociavel, LinhaDaTabela> = {
  // ── OS AVULSOS SÃO DERIVADOS DO BALCÃO (26/08/2026) ──────────────────────
  //
  // `cheio` e `piso` eram digitados aqui — 79/49, 129/79, 99/59, 39/29,
  // 149/99 — e são, número por número, o `price` e o `precoMinimo` do mesmo
  // item em `self-serve-catalog.ts`. Concordavam por sorte. Agora vêm de lá,
  // pela mesma razão que os planos vêm de `planos.ts`: verdade escrita em dois
  // lugares já está errada em um deles.
  ...(avulsoDoBalcao("post", "balcao-post-feed", "Post único com arte e legenda",
    "só a legenda pronta, com a arte por conta dele") as Record<"post", LinhaDaTabela>),
  ...(avulsoDoBalcao("carrossel", "balcao-carrossel-5", "Carrossel",
    "um post único no lugar do carrossel") as Record<"carrossel", LinhaDaTabela>),
  ...(avulsoDoBalcao("stories", "balcao-4-stories", "Sequência de stories",
    "uma sequência mais curta, com menos telas") as Record<"stories", LinhaDaTabela>),
  // A copy é o item mais barato da casa: não existe degrau abaixo dela. Aqui a
  // saída é prazo, não escopo — e isso está dito com todas as letras.
  ...(avulsoDoBalcao("copy", "balcao-legenda", "Copy / legenda",
    "sem versão menor: a saída é prazo maior de entrega, não preço") as Record<"copy", LinhaDaTabela>),
  ...(avulsoDoBalcao("auditoria", "balcao-auditoria-perfil", "Auditoria de perfil",
    "uma leitura mais curta, só com o diagnóstico, sem o plano de ação") as Record<"auditoria", LinhaDaTabela>),
  // ── OS PLANOS SÃO DERIVADOS DA TABELA ÚNICA (26/08/2026) ─────────────────
  //
  // `cheio` era digitado aqui: 297 · 790 · 1390 · 2590 — uma quarta cópia dos
  // preços da vitrine. Ela CONCORDAVA com a vitrine por sorte; nada a obrigava.
  // No dia em que um preço mudasse num lugar só, o comercial negociaria contra
  // um "cheio" que ninguém cobra — e desconto sobre preço errado é prejuízo com
  // aparência de disciplina.
  //
  // `piso` é ~78% do cheio: piso COMERCIAL, o quanto a casa aceita descontar
  // num recorrente. Derivado do mesmo número, pela mesma razão.
  //
  // O plano Crescimento saiu da tabela (ver `planos.ts`) e sai daqui junto: não
  // se negocia o que não se vende.
  ...(planosNegociaveis() as Record<"ritmo" | "presenca" | "conteudo", LinhaDaTabela>),
};

/**
 * Uma linha de negociação a partir do item do BALCÃO. Preço cheio e piso saem
 * do catálogo; o que mora aqui é o vocabulário da negociação (o nome que o
 * comercial usa e a versão menor que ele oferece no lugar do desconto).
 *
 * Item sem `precoMinimo` no catálogo NÃO ganha piso inventado: cai em 70% do
 * cheio, que é a mesma régua comercial dos planos — e nunca em zero, que
 * autorizaria dar o trabalho de graça.
 */
function avulsoDoBalcao(
  id: ItemNegociavel,
  idNoCatalogo: string,
  nome: string,
  versaoMenor: string,
): Record<string, LinhaDaTabela> {
  const item = SELF_SERVE_CATALOG.find((s) => s.id === idNoCatalogo);
  if (!item) {
    // Fail-closed com barulho: um id de catálogo que sumiu não pode virar uma
    // linha de negociação silenciosamente ausente — o comercial pediria piso e
    // receberia `undefined`, que `dentroDoPiso` já trata como recusa.
    throw new Error(`negociacao.ts: o item "${idNoCatalogo}" não existe em SELF_SERVE_CATALOG`);
  }
  return {
    [id]: {
      id,
      nome,
      cheio: item.price,
      piso: item.precoMinimo ?? Math.round(item.price * 0.7),
      recorrente: false,
      versaoMenor,
    } satisfies LinhaDaTabela,
  };
}

/** Uma linha de negociação por plano que ENTREGA PEÇA — o Pulso não se negocia
 *  (R$ 49 não tem degrau abaixo e não há escopo a tirar). */
function planosNegociaveis(): Record<string, LinhaDaTabela> {
  const comPeca = PLANOS.filter((p) => p.pecasPorMes > 0);
  return Object.fromEntries(
    comPeca.map((p: (typeof PLANOS)[number], i: number) => {
      const abaixo = i > 0 ? comPeca[i - 1]! : PLANOS[0]!;
      return [
        p.id,
        {
          id: p.id as ItemNegociavel,
          nome: `Plano ${p.nome}`,
          cheio: p.preco,
          // ⛔ AQUI HAVIA `Math.round(p.preco * 0.78)` — um desconto de 22%
          // que NINGUÉM autorizou, embutido numa multiplicação.
          //
          // Ordem do CEO em 27/08/2026: *"desconto que a casa não autorizou não
          // existe; sem faixa configurada, desconto nenhum"*. E o motivo é mais
          // duro que a ordem: o piso tem de ter margem positiva PROVADA, e o
          // custo desta casa está medido pela metade (só IA; gateway, infra,
          // e-mail, hora humana e impostos são NÃO MEDIDOS — ver
          // `tabela-de-precos.ts`). Não se prova que 78% do preço cobre um custo
          // que ninguém conhece. Um coeficiente escolhido a olho é exatamente a
          // "régua verde sobre o componente errado".
          //
          // O piso passa a vir da tabela única. Hoje ele é o preço cheio. No dia
          // em que o CEO autorizar uma faixa, ela entra lá — num campo só, com
          // dono — e este arquivo obedece sem ser tocado.
          piso: pisoDoServico(servicoPorChave(`plano_${p.id}`) ?? {
            chave: `plano_${p.id}`, nome: p.nome, precoFinalCentavos: p.preco * 100,
            pecasPorMes: p.pecasPorMes, produtor: "humano",
            custo: { estado: "nao_medido", motivo: "plano fora da tabela financeira" },
            descontoAutorizadoPct: null,
            cobranca: "recorrente_mensal",
          }) / 100,
          recorrente: true,
          versaoMenor: `o ${abaixo.nome} (${precoEmReais(abaixo.preco)})`,
        } satisfies LinhaDaTabela,
      ];
    }),
  );
}

export interface VeredictoDePreco {
  pode: boolean;
  /** `Infinity` quando não há piso conhecido: nenhum valor finito passa. */
  piso: number;
  motivo: string;
}

function linha(item: string): LinhaDaTabela | undefined {
  // `hasOwn` não é preciosismo: sem ele, `TABELA_DE_PISO["constructor"]` devolve
  // uma função herdada de Object — objeto truthy, `piso` undefined — e a
  // comparação `valor < undefined` é false, ou seja, o portão AUTORIZARIA um
  // item inexistente. Fail-closed de verdade começa aqui.
  if (typeof item !== "string" || !Object.hasOwn(TABELA_DE_PISO, item)) return undefined;
  return TABELA_DE_PISO[item as ItemNegociavel];
}

/**
 * O portão. Devolve se um valor pode ser fechado para um item.
 *
 * FAIL-CLOSED em três situações — todas devolvem `pode: false`:
 *   • item que não está na tabela (piso = Infinity, nenhum valor passa);
 *   • valor não-numérico, NaN, infinito ou negativo;
 *   • valor abaixo do piso.
 *
 * Nunca devolve `true` por omissão. Se você está lendo isto pensando em
 * adicionar um `default: return { pode: true }`, leia o cabeçalho do arquivo.
 */
export function podeFechar(item: string, valorProposto: number): VeredictoDePreco {
  const l = linha(item);

  if (!l) {
    return {
      pode: false,
      piso: Number.POSITIVE_INFINITY,
      motivo:
        `"${item}" não está na tabela de piso. Sem piso conhecido não existe autorização de venda — ` +
        `preciso confirmar antes de falar preço deste item.`,
    };
  }

  if (typeof valorProposto !== "number" || !Number.isFinite(valorProposto) || valorProposto <= 0) {
    return {
      pode: false,
      piso: l.piso,
      motivo: `Valor proposto inválido para ${l.nome}. O piso é ${precoEmReais(l.piso)}.`,
    };
  }

  if (valorProposto < l.piso) {
    return {
      pode: false,
      piso: l.piso,
      motivo:
        `${precoEmReais(valorProposto)} está abaixo do piso de ${l.nome} (${precoEmReais(l.piso)}). ` +
        `Não desço mais o preço — ofereço ${l.versaoMenor}.`,
    };
  }

  if (valorProposto === l.piso) {
    return {
      pode: true,
      piso: l.piso,
      motivo: `${precoEmReais(valorProposto)} é exatamente o piso de ${l.nome}. Fecha, e daqui não desce mais.`,
    };
  }

  const desconto = l.cheio - valorProposto;
  return {
    pode: true,
    piso: l.piso,
    motivo:
      desconto > 0
        ? `${precoEmReais(valorProposto)} fecha ${l.nome} (cheio ${precoEmReais(l.cheio)}, piso ${precoEmReais(l.piso)}). ` +
          `São ${precoEmReais(desconto)} de desconto — peça moeda de troca.`
        : `${precoEmReais(valorProposto)} fecha ${l.nome} sem desconto.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. A REGRA DA BARGANHA — desconto nunca sai de graça
// ─────────────────────────────────────────────────────────────────────────────
//
// Desconto dado sem contrapartida ensina duas coisas erradas de uma vez: que o
// preço cheio era mentira, e que basta insistir. A moeda de troca conserta as
// duas — o cliente paga menos porque DEU alguma coisa, e o preço cheio continua
// de pé para o próximo.
//
// A ordem não é arbitrária: começa pelo que não custa margem nenhuma (dinheiro
// na frente, prazo folgado) e só depois vai para o que custa (rodadas de ajuste,
// permanência, uso do case). É a mesma preferência de `docs/precos.md`.

export type MoedaId = "a_vista" | "prazo" | "rodadas" | "contrato" | "case";

export interface MoedaDeTroca {
  id: MoedaId;
  nome: string;
  /** A frase que o SDR usa. Pedido, não aviso. */
  pedido: string;
  /** Por que essa moeda vale o desconto — o que ela devolve para a casa. */
  porQue: string;
}

/** Em ordem de preferência. Índice menor = pedido primeiro. */
export const MOEDAS: MoedaDeTroca[] = [
  {
    id: "a_vista",
    nome: "Pagamento à vista",
    pedido: "Consigo esse valor com pagamento à vista, na confirmação. Fecha assim?",
    porQue: "Não custa margem: só antecipa caixa e elimina risco de inadimplência.",
  },
  {
    id: "prazo",
    nome: "Prazo maior de entrega",
    pedido: "Se eu puder entregar com alguns dias a mais, encaixo esse valor.",
    porQue: "Prazo folgado deixa a produção entrar na janela ociosa. Custo cai sem cortar escopo.",
  },
  {
    id: "rodadas",
    nome: "Menos rodadas de ajuste",
    pedido: "Nesse valor a peça vai com uma rodada de ajuste em vez de duas. Serve?",
    porQue: "Rodada de ajuste é o custo variável que mais dispara. Reduzir é cortar escopo, não margem.",
  },
  {
    id: "contrato",
    nome: "Contrato mais longo",
    pedido: "Esse valor eu seguro com um compromisso mais longo — em vez do mínimo.",
    porQue: "Permanência maior dilui o custo de entrada e dá previsibilidade de caixa.",
  },
  {
    id: "case",
    nome: "Autorização de usar o case",
    pedido: "E, para fechar nesse valor, preciso da sua autorização para mostrar o resultado como case.",
    porQue: "Vale como aquisição. Nunca peça a quem já sinalizou sigilo.",
  },
];

export interface Barganha {
  /** Desconto considerado, em reais. */
  desconto: number;
  /** Quantas moedas pedir. Cresce com o desconto. */
  quantidade: number;
  moedas: MoedaDeTroca[];
  /** O que o SDR fala, já montado. */
  frase: string;
}

/** Degraus de exigência. Quanto maior o desconto, mais coisas ele pede.
 *  Os cortes são em reais porque é assim que o SDR raciocina na conversa. */
const DEGRAUS: { ate: number; quantidade: number }[] = [
  { ate: 30, quantidade: 1 },
  { ate: 80, quantidade: 2 },
  { ate: 200, quantidade: 3 },
  { ate: 400, quantidade: 4 },
  { ate: Number.POSITIVE_INFINITY, quantidade: 5 },
];

/**
 * O que pedir em troca de um desconto. Desconto zero ou inválido devolve lista
 * vazia — não há o que cobrar por um desconto que não foi dado.
 */
export function moedasDeTroca(descontoEmReais: number): Barganha {
  const desconto =
    typeof descontoEmReais === "number" && Number.isFinite(descontoEmReais) && descontoEmReais > 0
      ? descontoEmReais
      : 0;

  if (desconto === 0) {
    return {
      desconto: 0,
      quantidade: 0,
      moedas: [],
      frase: "Sem desconto na mesa — nada a pedir em troca. Feche no preço cheio.",
    };
  }

  const quantidade = DEGRAUS.find((d) => desconto <= d.ate)!.quantidade;
  const moedas = MOEDAS.slice(0, quantidade);

  return {
    desconto,
    quantidade,
    moedas,
    frase:
      `${precoEmReais(desconto)} de desconto custa ${quantidade} contrapartida${quantidade > 1 ? "s" : ""}: ` +
      moedas.map((m) => m.nome.toLowerCase()).join(", ") + ".",
  };
}

/** Atalho para o uso real: dado item e valor proposto, diz se fecha E o que
 *  pedir em troca. Existe para o chamador não ter que calcular o desconto na
 *  mão — cálculo repetido na mão é onde o piso costuma vazar. */
export function barganhaPara(item: string, valorProposto: number): {
  veredicto: VeredictoDePreco;
  barganha: Barganha;
} {
  const veredicto = podeFechar(item, valorProposto);
  const l = linha(item);
  const desconto = l && veredicto.pode ? l.cheio - valorProposto : 0;
  return { veredicto, barganha: moedasDeTroca(desconto) };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CHEGOU NO PISO — a hora de parar de baixar preço
// ─────────────────────────────────────────────────────────────────────────────

export interface SaidaDoPiso {
  /** true = pare de baixar preço. A conversa agora é sobre ESCOPO. */
  noPiso: boolean;
  piso: number;
  /** O escopo menor que entra no lugar do desconto. */
  versaoMenor: string;
  /** A frase de saída, pronta para ser dita. */
  frase: string;
  /** true quando o item é desconhecido: não é "chegou no piso", é "não sei o
   *  piso" — e a saída é escalar, não improvisar. */
  precisaConfirmar: boolean;
}

/**
 * Quando o valor bate (ou passa por baixo do) piso, devolve a frase de saída:
 * parar de baixar preço e oferecer uma VERSÃO MENOR. Corta escopo, nunca margem.
 *
 * Item desconhecido devolve `noPiso: true` + `precisaConfirmar: true`. Parar é
 * sempre a direção segura: quem não sabe o piso não tem o que oferecer.
 */
export function chegouNoPiso(item: string, valor: number): SaidaDoPiso {
  const l = linha(item);

  if (!l) {
    return {
      noPiso: true,
      piso: Number.POSITIVE_INFINITY,
      versaoMenor: "",
      precisaConfirmar: true,
      frase:
        `Não tenho "${item}" na minha tabela, então não falo preço dele por conta própria — ` +
        `preciso confirmar internamente e te trago o valor certo.`,
    };
  }

  const valorValido = typeof valor === "number" && Number.isFinite(valor);
  const noPiso = !valorValido || valor <= l.piso;

  if (!noPiso) {
    return {
      noPiso: false,
      piso: l.piso,
      versaoMenor: l.versaoMenor,
      precisaConfirmar: false,
      frase: `Ainda há espaço acima do piso (${precoEmReais(l.piso)}) — mas todo desconto pede contrapartida.`,
    };
  }

  return {
    noPiso: true,
    piso: l.piso,
    versaoMenor: l.versaoMenor,
    precisaConfirmar: false,
    frase:
      `${precoEmReais(l.piso)} é o menor valor que ${l.nome} tem. Daqui eu não desço mais — ` +
      `o que eu faço é ajustar o que entra: ${l.versaoMenor}. Assim cabe no seu bolso sem eu entregar menos do que prometi.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. O QUE VAI PARA O PROMPT — só a parte pública
// ─────────────────────────────────────────────────────────────────────────────
//
// A rota `/api/sdr/chat` é PÚBLICA e sem autenticação. Tudo que entra no system
// prompt é texto que alguém pode tentar extrair da conversa. Por isso este bloco
// renderiza as FAIXAS (informação que o próprio cliente escolhe) e as REGRAS DE
// CONDUTA, e nunca a tabela de piso. O piso é executado no servidor, por
// `podeFechar` — trava, não aviso.

/** As opções de faixa que o cliente escolhe na conversa. Geradas da mesma lista
 *  usada por `ofertaParaFaixa` para as duas não divergirem. */
export function opcoesDeFaixa(): string[] {
  return FAIXAS.map((f) => f.rotulo);
}

export function blocoDeNegociacaoParaPrompt(): string {
  return [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "NEGOCIAÇÃO — a faixa de investimento (decisão do CEO, 05/08/2026)",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "Seu objetivo é FECHAR TODO CLIENTE. Toda faixa tem produto nesta casa — você",
    "NUNCA diz, nem sugere, que não temos nada para a pessoa. Se o valor for baixo,",
    "existe peça única; se for alto, existe projeto em fases.",
    "",
    "A FAIXA É A TERCEIRA PERGUNTA. Depois de saber quem é a pessoa e o que o",
    "negócio faz, pergunte a faixa — nunca no fim da conversa. Faixa descoberta no",
    "fim é conversa inteira montada no escuro. Pergunte com naturalidade e OFEREÇA",
    "AS OPÇÕES para ela escolher (é mais fácil escolher do que declarar um número):",
    "",
    ...opcoesDeFaixa().map((r) => `  • ${r}`),
    "",
    'Ex.: "Pra eu já montar a proposta certa pro seu momento: quanto você pensa em',
    'investir por mês — até R$ 150, entre R$ 150 e R$ 500, entre R$ 500 e R$ 1.500,',
    'entre R$ 1.500 e R$ 5.000, ou acima disso?"',
    "",
    "Se a pessoa não quiser dizer, siga a conversa e volte ao assunto UMA vez mais",
    "adiante. Nunca deduza a faixa pelo segmento, pelo tamanho do negócio ou pela",
    "forma de falar — faixa deduzida é chute sobre o bolso do cliente.",
    "",
    "REGRAS DE PREÇO QUE VOCÊ NÃO QUEBRA:",
    "1. Esta pergunta é a ÚNICA hora em que você diz números nesta conversa, e são",
    "   só os números das faixas acima. Você não cota, não dá 'a partir de', não",
    "   estima e não fala de desconto aqui — o orçamento é montado pelo sistema.",
    "2. Você NUNCA oferece nada abaixo do piso. O piso é calculado pelo servidor;",
    "   você não o conhece e não o inventa.",
    "3. Todo desconto tem contrapartida: pagamento à vista, prazo maior de entrega,",
    "   menos rodadas de ajuste, contrato mais longo, ou autorização de usar o case.",
    "   Desconto sem pedido em troca não existe.",
    "4. Quando o preço chega no piso, você para de baixar e oferece uma VERSÃO",
    "   MENOR. Corta escopo, nunca margem.",
    "5. Você não promete resultado, alcance, faturamento nem retorno. Nunca.",
    "",
    "PREENCHIMENTO: registre a faixa escolhida em budgetRange, usando EXATAMENTE",
    "um destes valores: " + FAIXAS.map((f) => `"${f.faixa}"`).join(" · ") + ".",
    "Se a pessoa não disse, omita o campo — não escreva um palpite.",
  ].join("\n");
}

// ── A exceção da pergunta de faixa, para a trava de preço da rota ────────────
// A rota pública barra qualquer "R$ <número>" na fala do SDR. Isso era certo
// enquanto ele nunca falava de dinheiro — mas a faixa virou a TERCEIRA pergunta.
// Sem esta exceção, toda vez que o SDR fizesse a pergunta CERTA o turno seria
// descartado e o motor de regras assumiria: a regra nova nunca rodaria.
//
// A exceção é estreita de propósito. Só passa se as três valerem juntas:
//   1. a fala é sobre investimento/orçamento — é pergunta, não cotação;
//   2. TODO valor monetário citado é um limite de faixa (150, 500, 1.500, 5.000);
//   3. aparecem pelo menos TRÊS limites distintos — a régua inteira.
//
// O item 3 é o que separa "escolha entre estas faixas" de "o seu fica em R$ 500":
// cotação cita um valor, a pergunta da faixa cita a escada toda. O custo dessa
// escolha é conhecido: se o modelo abreviar as opções e citar só dois limites com
// R$, o turno é descartado e cai no motor de regras. Descartar de vez em quando a
// pergunta certa é barato; deixar passar uma cotação, não.
const LIMITES_DE_FAIXA = new Set(["150", "500", "1500", "5000"]);
const VALOR_MONETARIO = /r\$\s*([\d.,]+)|(\d[\d.,]*)\s*reais/gi;

export function ehPerguntaDeFaixa(reply: string): boolean {
  if (typeof reply !== "string") return false;
  if (/desconto/i.test(reply)) return false; // desconto não se negocia nesta conversa
  if (!/investir|investimento|or[çc]amento|verba|gastar|faixa/i.test(reply)) return false;

  const citados = new Set<string>();
  for (const m of reply.matchAll(VALOR_MONETARIO)) {
    // Normaliza "1.500" e "1.500,00" para "1500": em pt-BR o ponto é separador
    // de milhar, e centavos não mudam a faixa.
    const bruto = (m[1] ?? m[2] ?? "").replace(/,\d{1,2}$/, "").replace(/[.,]/g, "");
    if (!LIMITES_DE_FAIXA.has(bruto)) return false; // valor fora da régua = cotação
    citados.add(bruto);
  }
  return citados.size >= 3;
}

/**
 * QUANTOS DEGRAUS DA RÉGUA a fala citou, e quantos valores fora dela.
 *
 * ─── POR QUE ISTO EXISTE (24/08/2026) ───────────────────────────────────────
 *
 * A bateria ao vivo achou `price_leak ×1` em CADA rodada, sempre uma só. A
 * leitura mais provável era a exceção da régua não fechando — `ehPerguntaDeFaixa`
 * exige TRÊS degraus distintos, e o comentário dela já previa o caso: *"se o
 * modelo abreviar as opções e citar só dois limites com R$, o turno é
 * descartado"*. Batia com o dado (há exatamente um turno de pergunta de faixa
 * por rodada), mas seguia sendo **hipótese, não fato medido**.
 *
 * Medir exigia saber o que a fala tinha — e a fala barrada NÃO é gravada, de
 * propósito: repetir no diário o que o guarda impediu de sair seria contrabando.
 * A saída é a mesma que funcionou no `malformado`: gravar a FORMA, nunca o
 * conteúdo. Dois números respondem a pergunta inteira:
 *
 *   • `degraus` — quantos limites da régua apareceram. 2 = a hipótese
 *     confirmada (o modelo abreviou as opções e a exceção, corretamente, não
 *     fechou). 0 = não era a pergunta da faixa: era cotação de verdade, e o
 *     guarda pegou o que existe para pegar.
 *   • `foraDaRegua` — valores citados que NÃO são degrau. Qualquer coisa acima
 *     de zero é cotação, não pergunta.
 *
 * ⚠️ Isto NÃO afrouxa a exceção e não deve virar desculpa para alargá-la. O
 * comentário de `ehPerguntaDeFaixa` decidiu certo: descartar de vez em quando a
 * pergunta certa é barato; deixar passar uma cotação, não. Aqui só se MEDE.
 */
export function formaDoPrecoNaFala(reply: string): { degraus: number; foraDaRegua: number } {
  if (typeof reply !== "string") return { degraus: 0, foraDaRegua: 0 };
  const degraus = new Set<string>();
  let foraDaRegua = 0;
  for (const m of reply.matchAll(VALOR_MONETARIO)) {
    const bruto = (m[1] ?? m[2] ?? "").replace(/,\d{1,2}$/, "").replace(/[.,]/g, "");
    if (LIMITES_DE_FAIXA.has(bruto)) degraus.add(bruto);
    else foraDaRegua += 1;
  }
  return { degraus: degraus.size, foraDaRegua };
}

/** Ids de faixa aceitos vindos do modelo. Existe porque a rota faz allowlist:
 *  qualquer outra coisa que o modelo escreva em `budgetRange` é descartada. */
export const FAIXAS_VALIDAS: readonly string[] = FAIXAS.map((f) => f.faixa);

export function faixaValida(valor: unknown): valor is FaixaId {
  return typeof valor === "string" && FAIXAS_VALIDAS.includes(valor);
}

/**
 * O TETO da faixa que o cliente declarou, em reais — ou `null` quando não dá
 * para saber.
 *
 * Existe por causa do CityJobs (16/08/2026). O cliente disse, com todas as
 * letras, *"estamos pensando algo em torno de R$ 500 por mês"*. A faixa foi
 * capturada e guardada certinho em `budgetRange`. E aí ninguém mais olhou para
 * ela: a estimativa saiu em R$ 1.800–3.400 — 3,6× o que ele disse poder pagar —
 * sem uma linha reconhecendo a diferença.
 *
 * Faixa que só serve para aparecer no painel não é trava, é enfeite. Para o
 * número ser CONFRONTADO com a verba, alguém precisa conseguir transformar
 * "entre R$ 150 e R$ 500" de volta num número — e é isto aqui.
 *
 * Aceita o id e o rótulo pelo mesmo motivo que `normalizarFaixa`: o que fica
 * gravado no escopo é o rótulo, não o id.
 *
 * `null` para qualquer outra coisa, e `null` significa "não sei a verba" — que
 * é diferente de "a verba é zero" e de "a verba é infinita". Ausência de
 * informação não é informação.
 */
export function tetoDaFaixa(valor: unknown): number | null {
  if (typeof valor !== "string") return null;
  const limpo = valor.trim().toLowerCase();
  if (!limpo) return null;
  const achou = FAIXAS.find((f) => f.faixa === limpo || f.rotulo.toLowerCase() === limpo);
  return achou ? achou.ate : null;
}

/**
 * Converte o que o modelo escreveu em `budgetRange` no RÓTULO que o cliente lê.
 * Devolve `null` para qualquer outra coisa — e `null` significa "some com o
 * campo", não "chuta uma faixa".
 *
 * Aceita o id ("gestao") E o próprio rótulo ("entre R$ 1.500 e R$ 5.000") de
 * propósito: o painel público mostra o rótulo, e nos turnos seguintes o modelo
 * recebe o scope acumulado e devolve o que viu. Se só o id fosse aceito, a faixa
 * apareceria no resumo do cliente e sumiria na mensagem seguinte.
 */
export function normalizarFaixa(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const limpo = valor.trim().toLowerCase();
  if (!limpo) return null;
  const achou = FAIXAS.find((f) => f.faixa === limpo || f.rotulo.toLowerCase() === limpo);
  return achou ? achou.rotulo : null;
}

/**
 * A FAIXA QUE O CLIENTE ESCOLHEU DO CARDÁPIO — quando ele repetiu o rótulo.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * POR QUE ISTO EXISTE (cliente oculto, 8ª volta, 26/08/2026)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ MEDIDO EM PRODUÇÃO, no 3º turno da jornada. O SDR ofereceu a régua inteira
 * — "até R$ 150, entre R$ 150 e R$ 500, entre R$ 500 e R$ 1.500, …" — e o
 * cliente respondeu, palavra por palavra:
 *
 *     "Entre R$ 500 e R$ 1.500."
 *
 * O escopo saiu com **`budgetRange: "entre R$ 150 e R$ 500"`** — o degrau de
 * BAIXO. E o SDR respondeu "Anotei sua faixa de investimento": a casa confirmou
 * ter registrado o que ele disse, e registrou outra coisa. É a mesma família da
 * mira invertida, agora num campo de DINHEIRO.
 *
 * ── A CAUSA, E ELA É UM CONSERTO ANTERIOR ─────────────────────────────────
 *
 * A 6ª volta acertou uma regra: *"quando o cliente disse um número, o número
 * manda"* — nasceu de *"meu teto é R$ 900"* virar "entre R$ 150 e R$ 500".
 * Certa para uma FALA COM VALOR.
 *
 * Só que aqui o cliente não disse um valor: ele **repetiu um RÓTULO do cardápio
 * que a casa acabou de oferecer**. `parseBudgetAmount` pegou o primeiro número
 * do rótulo (500) e `ofertaParaFaixa(500)` escolheu, corretamente pela própria
 * régua (`500 > 150 && 500 <= 500`), o degrau de baixo — porque 500 é o TETO de
 * um degrau e o PISO do seguinte. A regra do número atropelou a escolha explícita.
 *
 * ── A HIERARQUIA CERTA ────────────────────────────────────────────────────
 *
 * Escolher do cardápio é a evidência MAIS FORTE que existe: não há o que
 * derivar, ele apontou o degrau. Por isso esta função roda ANTES do número, e
 * o número continua mandando em tudo o que não for uma escolha explícita.
 *
 * Casa por NÚMEROS, não por texto: os dois valores da fala têm de ser os dois
 * limites de um degrau. Uma comparação de string tropeçaria em "R$ 1.500" contra
 * "R$1500" e em maiúscula, acento e pontuação — e uma régua frouxa aqui erra
 * para o lado caro ou barato do bolso do cliente.
 */
export function faixaEscolhidaNaFala(fala: unknown): string | null {
  if (typeof fala !== "string" || !fala.trim()) return null;
  const t = fala.toLowerCase();

  // Os números da fala, com a pontuação brasileira desfeita: "1.500" é mil e
  // quinhentos, não um e meio.
  const numeros = [...t.matchAll(/\d[\d.,]*/g)]
    .map((m) => Number(m[0].replace(/\.(?=\d{3}\b)/g, "").replace(",", ".")))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (numeros.length === 0) return null;

  // 1. O DEGRAU FECHADO — "entre R$ 500 e R$ 1.500". Os dois limites, na fala.
  //    É o caso medido, e o mais forte: dois números que casam com um degrau
  //    inteiro não são coincidência.
  for (const f of FAIXAS) {
    if (!Number.isFinite(f.ate)) continue;
    if (numeros.includes(f.de) && numeros.includes(f.ate)) return f.rotulo;
  }

  // 2. O DEGRAU ABERTO PARA CIMA — "acima de R$ 5.000", "mais de 5000".
  //    Sem isto, `ofertaParaFaixa(5000)` devolveria "entre R$ 1.500 e R$ 5.000",
  //    pela mesma aritmética de borda que causou o defeito medido.
  if (/\b(?:acima|mais)\s+de\b/.test(t)) {
    const f = FAIXAS.find((x) => numeros.includes(x.de));
    if (f) return f.rotulo;
  }

  // 3. O DEGRAU ABERTO PARA BAIXO — "até R$ 150". Aqui a aritmética de borda já
  //    acerta (150 <= 150), mas a escolha explícita não deve depender disso.
  // `é` não é caractere de palavra: um `\b` depois dele NUNCA casa, e a régua
  // devolvia `null` para "até R$ 150" — o próprio teste de cardápio pegou.
  // É a mesma armadilha que `mira-da-peca.ts` já registrou sobre `ª`/`º`.
  if (/\bat[ée](?![a-z])/.test(t)) {
    const f = FAIXAS.find((x) => Number.isFinite(x.ate) && numeros.includes(x.ate));
    if (f) return f.rotulo;
  }

  // Ele falou de dinheiro, mas não apontou um degrau. Quem responde é o número
  // — a regra da 6ª volta, intacta.
  return null;
}
