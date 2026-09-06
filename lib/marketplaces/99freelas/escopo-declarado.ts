// ─── ESCOPO DECLARADO — o anúncio pede UNIDADE ou pede VOLUME/RECORRÊNCIA? ──
//
// Despacho: docs/celula-prospeccao/despachos/2026-09-06-o-preco-nao-pode-chutar.md
//
// ── O DEFEITO MEDIDO ─────────────────────────────────────────────────────────
// `precificar()` (`lib/marketplaces/99freelas/preco.ts`) cobra o ITEM DO
// CATÁLOGO DA CASA — uma peça, um vídeo. Ela nunca soube, e não é dela saber,
// se o ESCOPO DO ANÚNCIO pede uma unidade ou um pacote inteiro. No 99Freelas
// esse número vai para o campo "Sua oferta" — e R$ 350 (o piso de UM vídeo)
// num anúncio que pede "pacote mensal de aproximadamente 400 vídeos" lê como
// R$ 350 PELO PACOTE INTEIRO. Número errado com cara de cálculo é pior que
// número ausente.
//
// ── O QUE ESTE ARQUIVO FAZ, E O QUE ELE NÃO FAZ ─────────────────────────────
// Só LÊ o texto do anúncio e classifica o escopo declarado. Não decide preço,
// não multiplica nada, não usa IA. É trava de dinheiro — determinística de
// propósito, pela mesma razão que `encaixe.ts` e `eliminar()` já são: uma
// trava que depende do modelo acertar não é trava.
//
// ── AUSÊNCIA DE SINAL ⇒ UNITÁRIO, NUNCA VOLUME INVENTADO ────────────────────
// Não concluir volume não é o mesmo que concluir volume. Um anúncio que não
// declara quantidade nem periodicidade é tratado como pedido de uma unidade —
// inventar "provavelmente é recorrente" seria travar candidatura boa sem
// nenhum dado que sustente a trava.
//
// ── A ORDEM DE PRIORIDADE DENTRO DO TEXTO IMPORTA ───────────────────────────
// Um mesmo anúncio pode conter, ao mesmo tempo, uma palavra de recorrência
// ("demanda recorrente") ANTES de uma quantidade explícita ("400 vídeos por
// mês") — foi exatamente o que aconteceu no projeto real do TikTok Shop
// (fixture `projeto-781493-2026-09-06.html`). Se o primeiro sinal encontrado
// no texto vencesse, "recorrente" apareceria primeiro e o número mais
// concreto (400) nunca seria lido. Por isso a busca não é "o que aparece
// primeiro no texto", é "qual FAMÍLIA de sinal é mais concreta": quantidade
// explícita > faixa/intervalo > periodicidade isolada > "pacote"/"lote" sem
// número. Dentro de cada família, o primeiro match no texto vale.

export type EscopoDeclarado =
  | { tipo: "unitario" }
  | { tipo: "volume"; quantidade: number | null; porQue: string }
  | { tipo: "recorrente"; porQue: string };

// U+0300–U+036F: os diacríticos que o NFD separa da letra-base. Mesmo
// intervalo de `encaixe.ts` e `oportunidade.ts` — duplicado de propósito
// (nenhum dos dois exporta este detalhe interno).
const FAIXA_DE_DIACRITICOS = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  "g",
);

/** Só para decidir SE um trecho tem letra (evita classificar texto vazio). */
function normalizar(s: string): string {
  return (s ?? "").normalize("NFD").replace(FAIXA_DE_DIACRITICOS, "").toLowerCase();
}

/** "400" → 400. "1.000" → 1000 (ponto é milhar, igual a `numeroBr` de
 *  `coleta.ts` — mesma convenção pt-BR, duplicada por não ser exportada de
 *  lá). `null` quando o trecho capturado não vira um número finito — melhor
 *  "não sei o número" do que um número inventado por um parse otimista. */
function numeroDoSinal(bruto: string): number | null {
  const limpo = bruto.replace(/\./g, "").replace(",", ".");
  const n = Number(limpo);
  return Number.isFinite(n) ? Math.round(n) : null;
}

// A unidade de contagem: vídeos, posts, peças, itens, unidades. Aceita as
// duas grafias (com e sem acento) porque o texto pode chegar já decodificado
// (`decodificarEntidadesHtml`, em `coleta.ts`) OU cru, dependendo de quem
// escreveu o anúncio.
const UNIDADE = String.raw`v[íi]deos?|posts?|pe[çc]as?|itens?|unidades?|lotes?`;
const PERIODO = String.raw`dia|semana|m[êe]s`;

// Não é o começo de uma faixa ("20 a 30 vídeos") — sem isto, "30 vídeos"
// dentro de "20 a 30 vídeos" passaria por uma quantidade ÚNICA de 30, quando
// na verdade é a ponta de cima de um INTERVALO (ver `RE_FAIXA_*` abaixo).
// Lookbehind de tamanho variável — suportado desde ES2018, e V8 (Node) não
// tem a restrição de "tamanho fixo" que outros motores de regex impõem.
const NAO_E_CAUDA_DE_FAIXA = String.raw`(?<!\d[\d.,]*\s*(?:a|à)\s*)`;

// Quantidade explícita e ÚNICA, junto de um substantivo de unidade:
// "400 vídeos", "100 posts".
const RE_NUMERO_COM_UNIDADE = new RegExp(String.raw`${NAO_E_CAUDA_DE_FAIXA}\b(\d[\d.,]*)\s*(?:${UNIDADE})\b`, "i");
// Quantidade explícita e ÚNICA, junto de um período: "100 por semana".
const RE_NUMERO_POR_PERIODO = new RegExp(String.raw`${NAO_E_CAUDA_DE_FAIXA}\b(\d[\d.,]*)\s*por\s*(?:${PERIODO})\b`, "i");

// Faixa/intervalo — "20 a 30 vídeos", "20 a 30 vídeos por dia", "20 a 30 por
// dia". Um intervalo NÃO vira um número único: escolher a ponta de baixo ou
// de cima seria inventar um dado que o anúncio não deu.
const RE_FAIXA_COM_UNIDADE = new RegExp(String.raw`\b\d[\d.,]*\s*(?:a|à)\s*\d[\d.,]*\s*(?:${UNIDADE})\b`, "i");
const RE_FAIXA_POR_PERIODO = new RegExp(String.raw`\b\d[\d.,]*\s*(?:a|à)\s*\d[\d.,]*\s*(?:${UNIDADE}\s*)?por\s*(?:${PERIODO})\b`, "i");

// Periodicidade declarada em PALAVRA, sem número por perto — "mensal",
// "recorrente", "todo mês", "semanal". Sozinha, não diz QUANTO, só que o
// serviço se repete — por isso vira `recorrente`, não `volume`.
const RE_PERIODICIDADE_PALAVRA = /\b(mensalidade|mensalmente|mensal|semanalmente|semanal|recorrente|todo\s+m[êe]s|toda\s+semana)\b/i;

// "Pacote"/"lote" sem número declarado — mais de uma unidade, sem quantidade
// conhecida.
const RE_PACOTE_OU_LOTE = /\b(pacote|lote)\b/i;

/**
 * Lê o ESCOPO que o anúncio declara — nunca o item que a casa venderia.
 *
 * Determinístico, sem IA: é a trava de dinheiro descrita no cabeçalho.
 */
export function lerEscopoDeclarado(texto: string): EscopoDeclarado {
  const t = texto ?? "";
  if (normalizar(t).trim().length === 0) return { tipo: "unitario" };

  // 1) Quantidade explícita e única — o sinal mais concreto que existe.
  const numeroUnidade = RE_NUMERO_COM_UNIDADE.exec(t);
  const numeroPeriodo = RE_NUMERO_POR_PERIODO.exec(t);
  const numero = numeroUnidade ?? numeroPeriodo;
  if (numero) {
    return {
      tipo: "volume",
      quantidade: numeroDoSinal(numero[1]),
      porQue: `o anúncio declara quantidade explícita ("${numero[0].trim()}") — mais de uma unidade.`,
    };
  }

  // 2) Faixa/intervalo — concreto (é volume), mas SEM um número único a
  //    extrair sem inventar.
  const faixa = RE_FAIXA_COM_UNIDADE.exec(t) ?? RE_FAIXA_POR_PERIODO.exec(t);
  if (faixa) {
    return {
      tipo: "volume",
      quantidade: null,
      porQue: `o anúncio declara uma faixa ("${faixa[0].trim()}"), não uma unidade — a quantidade exata não é inventada a partir do intervalo.`,
    };
  }

  // 3) Periodicidade isolada — diz "se repete", não diz "quanto".
  const periodicidade = RE_PERIODICIDADE_PALAVRA.exec(t);
  if (periodicidade) {
    return {
      tipo: "recorrente",
      porQue: `o anúncio declara periodicidade ("${periodicidade[0].trim()}"), sem quantidade — é um serviço recorrente, não um projeto de unidade única.`,
    };
  }

  // 4) "Pacote"/"lote" solto — mais de uma unidade, sem número.
  const pacote = RE_PACOTE_OU_LOTE.exec(t);
  if (pacote) {
    return {
      tipo: "volume",
      quantidade: null,
      porQue: `o anúncio fala em "${pacote[0].trim()}" — mais de uma unidade, sem quantidade declarada.`,
    };
  }

  // 5) Nenhum sinal ⇒ unitário. Ausência de sinal não é sinal de volume.
  return { tipo: "unitario" };
}
