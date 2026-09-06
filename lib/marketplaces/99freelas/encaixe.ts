// ─── ENCAIXE NA CASA — a casa só propõe o que ela sabe fazer ────────────────
//
// Despacho: docs/celula-prospeccao/despachos/2026-09-06-nao-propor-fora-do-escopo.md
//
// ── O DEFEITO MEDIDO ─────────────────────────────────────────────────────────
// `eliminar()` (lib/marketplaces/99freelas/agente.ts) só conhecia o que a
// PLATAFORMA proíbe (acadêmico, teste grátis, comissionado, vaga CLT). Ele não
// sabia o que a DIOLI faz — e por isso gastou IA escrevendo uma recusa
// educada para "Melhoria visual do meu quarto" (decoração de quarto, móveis,
// estilo boho — nota 3), e essa recusa foi parar na fila do CEO como se fosse
// uma proposta pronta para o clique. Clicar nela queimaria uma conexão que
// não volta para dizer a um desconhecido que não somos a empresa certa.
//
// ── POR QUE NÃO HÁ UMA LISTA DE PALAVRAS-CHAVE AQUI ─────────────────────────
// Seria o caminho óbvio: `const TERMOS = ["social media", "post", ...]`. E
// seria o MESMO erro que a Decisão 5 do CEO já reprovou em
// `catalogo-ofertavel.ts`: uma lista escrita à mão CONGELA um diagnóstico. No
// dia em que a casa ganhar um serviço novo, a lista continua sem ele até
// alguém lembrar de editá-la — e ninguém lembra.
//
// Aqui os termos são DERIVADOS do próprio catálogo: de cada serviço que
// `avaliarServico(id, { modoAutomatico: false })` já declara ofertável hoje,
// tiram-se as palavras de `nome` + `textos` — a régua de promessa por escrito
// da Decisão 5, o que está escrito ali é o que a casa promete, então é isso
// que decide o que ela reconhece. Ligou um motor novo, o serviço volta a ser
// ofertável e as palavras dele entram no vocabulário sozinhas, sem editar
// este arquivo.
//
// A prova disso é `derivarVocabularioDeEncaixe`/`encaixarContra`: as duas
// recebem QUALQUER lista de serviços, não só a real, e o teste
// (`__tests__/marketplaces/encaixe-na-casa.test.ts`) passa um catálogo
// FABRICADO, com um serviço que não existe na casa, para provar que o
// mecanismo é genérico — e não uma segunda lista disfarçada de função. Isto
// também é o que permite provar a genericidade sem tocar em
// `catalogo-ofertavel.ts`, que este despacho proíbe editar.
//
// ── FAIL-CLOSED, DAS DUAS FORMAS ─────────────────────────────────────────────
// 1. Texto vazio ou curto demais para dizer qualquer coisa ⇒ NÃO encaixa. Não
//    concluir que encaixa não é o mesmo que concluir que não encaixa, mas
//    propor no escuro custa conexão — então na dúvida, não propõe.
// 2. Texto claro, mas nenhuma palavra bate com nenhum serviço ofertável hoje
//    ⇒ NÃO encaixa.
// As duas têm motivo diferente, de propósito: o teste prova que a primeira é
// fail-closed por ausência de informação, não por acidente de não achar nada.
//
// ── O QUE ISTO NÃO FAZ ────────────────────────────────────────────────────────
// Não julga qualidade do lead, não decide preço, não usa IA. É determinístico
// de propósito: é trava de cota (a IA que redige e a conexão que se gasta), e
// trava que depende do modelo acertar não é trava — o mesmo motivo que já
// está escrito no comentário de `eliminar()`.

import {
  SERVICOS_DA_CELULA,
  avaliarServico,
} from "@/lib/agency/celula/catalogo-ofertavel";

export type Encaixe =
  | { encaixa: true; servicosPossiveis: string[] }
  | { encaixa: false; motivo: string };

/**
 * A forma mínima de um serviço para derivar vocabulário — só `id`, `nome` e
 * `textos`. Não exige `requer` nem `exigeDecisaoSupervisionada` porque é só
 * disso que o vocabulário precisa, e é isto que permite ao teste provar a
 * genericidade com um serviço FABRICADO, sem importar nem tocar em
 * `catalogo-ofertavel.ts`.
 */
export interface ServicoParaEncaixe {
  id: string;
  nome: string;
  textos: readonly string[];
}

export interface ProjetoParaEncaixe {
  titulo: string;
  descricao: string;
  categoriaDeclarada: string | null;
}

const MIN_CARACTERES_PARA_AVALIAR = 12;
const TAMANHO_MINIMO_DO_TERMO = 4;

/**
 * Puramente gramatical (artigo, preposição, pronome, verbo auxiliar) — nomeia
 * a LÍNGUA, não um serviço. Filtrar isto não é decidir o que a casa vende, é
 * reduzir ruído que qualquer texto em português carrega.
 */
const PARADAS_LINGUISTICAS = new Set([
  "para", "com", "sem", "por", "que", "seu", "sua", "seus", "suas",
  "este", "esta", "esse", "essa", "isso", "isto", "aquele", "aquela",
  "onde", "quando", "quais", "cada", "todo", "toda", "todos", "todas",
  "mais", "menos", "entre", "desde", "apos", "ainda", "assim", "muito",
  "muita", "muitos", "muitas", "pouco", "pouca", "poucos", "poucas",
  "sobre", "sendo", "sido", "pode", "podem", "poderia", "deve", "devem",
  "deveria", "fazer", "feito", "feita", "ser", "ter", "estar", "nosso",
  "nossa", "nossos", "nossas", "dele", "dela", "deles", "delas", "pelo",
  "pela", "pelos", "pelas", "outro", "outra", "outros", "outras", "quero",
  "queremos", "gostaria",
]);

/**
 * Genéricas de MERCADO — aparecem em qualquer anúncio de freelancer,
 * independentemente do serviço pedido ("cliente", "orçamento", "prazo").
 * Filtrar estas palavras não apaga nenhum serviço do vocabulário: nenhum
 * `nome`/`textos` de `SERVICOS_DA_CELULA` as usa para SE DESCREVER — e isso é
 * conferido pelo teste de vocabulário em `encaixe-na-casa.test.ts`, não só
 * afirmado aqui.
 */
const PARADAS_DE_MERCADO = new Set([
  "cliente", "clientes", "projeto", "projetos", "servico", "servicos",
  "empresa", "trabalho", "trabalhos", "necessario", "necessaria",
  "precisamos", "preciso", "precisa", "orcamento", "prazo",
  "valor", "dias", "semana", "semanas", "mes", "meses",
]);

const PARADAS = new Set([...PARADAS_LINGUISTICAS, ...PARADAS_DE_MERCADO]);

// U+0300–U+036F: os diacríticos que o NFD separa da letra-base (o acento vira
// caractere próprio). Construído por `fromCharCode` com o código NUMÉRICO, em
// vez de um literal de regex com o caractere combinante embutido no
// código-fonte: caractere combinante solto no arquivo sobrevive mal a editor,
// terminal e diff de git — o mesmo intervalo que
// `lib/agency/comercial/oportunidade.ts` (`normalizarParaImpressao`) escreve
// como `̀-ͯ`.
const FAIXA_DE_DIACRITICOS = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  "g",
);

function normalizar(s: string): string {
  return (s ?? "")
    .normalize("NFD")
    .replace(FAIXA_DE_DIACRITICOS, "")
    .toLowerCase();
}

function palavras(s: string): string[] {
  return normalizar(s).match(/[a-z]+/g) ?? [];
}

/** As palavras que IDENTIFICAM um serviço — o que sobra depois de tirar
 *  gramática e ruído de mercado. É isto, e só isto, que vira vocabulário. */
function termosDoServico(s: ServicoParaEncaixe): string[] {
  const bruto = `${s.nome} ${s.textos.join(" ")}`;
  return [
    ...new Set(
      palavras(bruto).filter(
        (p) => p.length >= TAMANHO_MINIMO_DO_TERMO && !PARADAS.has(p),
      ),
    ),
  ];
}

/**
 * O vocabulário, DERIVADO de uma lista de serviços — qualquer lista, real ou
 * fabricada. Exportada para o teste provar que o mecanismo não é uma segunda
 * lista escrita à mão disfarçada de função: um serviço que o teste inventa
 * entra no vocabulário do mesmo jeito que um real entraria, sem editar nada
 * neste arquivo.
 */
export function derivarVocabularioDeEncaixe(
  servicos: readonly ServicoParaEncaixe[],
): Map<string, string[]> {
  const mapa = new Map<string, string[]>();
  for (const s of servicos) mapa.set(s.id, termosDoServico(s));
  return mapa;
}

/**
 * O núcleo, parametrizado pela lista de serviços. É esta função — não
 * `encaixaNaCasa` — que o teste chama com um catálogo fabricado para provar a
 * genericidade sem tocar em `catalogo-ofertavel.ts` (o despacho proíbe editar
 * aquele arquivo; isto prova o mecanismo sem precisar editá-lo).
 */
export function encaixarContra(
  servicosOfertaveis: readonly ServicoParaEncaixe[],
  p: ProjetoParaEncaixe,
): Encaixe {
  const alvo = `${p.titulo ?? ""} ${p.descricao ?? ""} ${p.categoriaDeclarada ?? ""}`;
  const todasAsPalavras = palavras(alvo);

  // FAIL-CLOSED Nº 1: não deu para ler nada com substância. Ausência de
  // informação não é informação — não concluir que encaixa não vira "serve".
  if (todasAsPalavras.join("").length < MIN_CARACTERES_PARA_AVALIAR) {
    return {
      encaixa: false,
      motivo:
        "texto vazio ou curto demais para avaliar se a Dioli entrega isto — " +
        "fail-closed: não concluiu, então não encaixa.",
    };
  }

  const alvoComoConjunto = new Set(todasAsPalavras);
  const vocabulario = derivarVocabularioDeEncaixe(servicosOfertaveis);
  const servicosPossiveis: string[] = [];
  for (const [id, termos] of vocabulario) {
    if (termos.some((t) => alvoComoConjunto.has(t))) servicosPossiveis.push(id);
  }

  // FAIL-CLOSED Nº 2: texto claro, mas nenhuma palavra bate com nenhum
  // serviço que a casa oferece HOJE.
  if (servicosPossiveis.length === 0) {
    return {
      encaixa: false,
      motivo:
        "nenhuma palavra deste projeto corresponde a um serviço que a Dioli " +
        "entrega hoje — fora do que a casa produz.",
    };
  }

  return { encaixa: true, servicosPossiveis };
}

/**
 * Os serviços REALMENTE ofertáveis agora — os que `avaliarServico` (a régua
 * da Decisão 5) aprova no modo supervisionado. `modoAutomatico: false` de
 * propósito: aqui só importa se a casa SABE produzir, não se o CEO exige
 * revisão humana antes de automatizar — essa segunda trava roda depois, na
 * hora de montar a proposta (`montarItemDeProposta`), não aqui.
 */
function servicosRealmenteOfertaveis(): ServicoParaEncaixe[] {
  return SERVICOS_DA_CELULA.filter(
    (s) => avaliarServico(s.id, { modoAutomatico: false }).ofertavel,
  );
}

/** O que `eliminar()` chama de verdade. */
export function encaixaNaCasa(p: ProjetoParaEncaixe): Encaixe {
  return encaixarContra(servicosRealmenteOfertaveis(), p);
}
