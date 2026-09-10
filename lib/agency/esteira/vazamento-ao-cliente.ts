// vazamento-ao-cliente.ts — O QUE NUNCA PODE APARECER NA TELA DE QUEM COMPRA.
// PURO: sem prisma, sem HTTP, sem esteira.
//
// ─── O DEFEITO QUE ISTO FECHA (15/08/2026) ──────────────────────────────────
//
// O piloto assistido subiu às 20:23 e, no portal do City Jobs, a aba Aprovações
// mostrou ao cliente um card "Aguardando sua decisão" com este corpo:
//
//   Ciclo assistido assistido:cmsut87lr...:cmsut8fn8... — pacote da cadeia
//   completa aguardando aprovação humana. project-management/pm-orchestrator:
//   executado ($0.0085) · branding/brand-architect: executado ($0.0060) · …
//
// Três erros de uma vez, e o primeiro NÃO é de engenharia:
//
//   1. **A margem da agência na tela de quem compra.** `$0.0085` é o que a casa
//      pagou ao provedor de IA para produzir o que o cliente contratou. Nenhum
//      cliente deveria saber isso — é estrutura de custo, é dado comercial, e
//      uma vez visto não se desvê.
//   2. **Vocabulário de máquina.** `cmsut87lr…`, `pm-orchestrator`,
//      `editorial-planner` não significam nada para ele: denunciam o maquinário
//      em vez de mostrar o trabalho.
//   3. **Aprovação às cegas.** O card pedia decisão sobre uma entrega de Design
//      e não mostrava a peça. Quem assina em branco uma vez não assina duas.
//
// ─── POR QUE UMA TRAVA, E NÃO UM CUIDADO ────────────────────────────────────
//
// O texto do card veio de uma interpolação de uma linha, escrita por quem estava
// pensando em auditoria — e auditoria é uma necessidade REAL: o rastro de custo
// por agente é o que diz se a operação assistida se paga. O erro não foi querer
// o rastro; foi pô-lo no campo que o cliente lê. A próxima rota escrita amanhã
// vai querer o mesmo rastro pelo mesmo motivo legítimo.
//
// Por isso a régua mora no caminho de ESCRITA (`approval-service`), não num
// aviso de code review: custo em campo com `clientVisible: true` **lança**, e o
// caminho que precisa do rastro o grava do lado da equipe. Guardrail 4 da casa —
// prompt é sugestão, código é trava.
//
// ─── O QUE É VAZAMENTO E O QUE NÃO É ────────────────────────────────────────
//
// • **Custo em dólar é vazamento; preço em real NÃO é.** A casa cobra em R$ e
//   paga o provedor de IA em US$. `R$ 3.500` numa proposta é exatamente o que o
//   cliente tem que ler; `$0.0085` é a margem dela. A distinção é a moeda, e ela
//   é confiável neste negócio.
// • **Identificador de banco é vazamento.** `cuid` (25 chars começando em `c`) e
//   correlationId (`assistido:<id>:<id>`) só existem para a máquina.
// • **Slug de função/departamento do catálogo é vazamento.** `graphic-designer`
//   é nome de engrenagem; "Direção visual das peças" é o nome do trabalho. Só
//   entram na lista os slugs com hífen — palavra solta em português ("design",
//   "copywriter" numa frase) não vira falso positivo.

import { DEPARTAMENTOS_V2, FUNCOES_V2 } from "@/lib/agency/catalogo-v2/catalogo";

export type TipoDeVazamento =
  /** Valor monetário em dólar — o que a casa PAGOU, nunca o que o cliente paga. */
  | "custo"
  /** Identificador de banco: cuid, correlationId, chave técnica. */
  | "identificador"
  /** Slug interno de função ou departamento do catálogo V2. */
  | "nome-interno";

export interface Vazamento {
  tipo: TipoDeVazamento;
  /** O trecho exato encontrado — para o erro dizer O QUE, não só "tem algo". */
  trecho: string;
}

/** O que substitui o trecho quando o texto é redigido em vez de recusado. */
export const MARCA_DE_REDACAO = "[…]";

// ── Os detectores ───────────────────────────────────────────────────────────
//
// Cada um é uma regex com `g` — e regex com `g` guarda `lastIndex` entre usos.
// Por isso elas são CRIADAS a cada varredura (função, não constante): módulo
// puro que carrega estado entre chamadas é bug esperando o segundo teste.

function detectores(): Array<{ tipo: TipoDeVazamento; re: RegExp }> {
  // Slugs do catálogo com hífen — os únicos que não se confundem com palavra
  // corrente. Ordenados do maior para o menor para que `social-media` case
  // antes de um eventual prefixo mais curto.
  const slugs = [
    ...FUNCOES_V2.map((f) => f.id),
    ...DEPARTAMENTOS_V2.map((d) => d.id),
  ]
    .filter((id) => id.includes("-"))
    .sort((a, b) => b.length - a.length)
    .map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  return [
    // US$ 1,23 · USD 0.0085 · $0.0085 — mas nunca R$ 1,23.
    { tipo: "custo", re: /\b(?:US\$|USD)\s?\d+(?:[.,]\d+)?/gi },
    { tipo: "custo", re: /(?<![A-Za-z0-9])\$\s?\d+(?:[.,]\d+)?/g },
    // O nome do campo também entrega o número: "custoUsd", "custo_usd".
    { tipo: "custo", re: /\bcusto[_\s]?(?:total[_\s]?)?usd\b/gi },
    // cuid: 'c' + 24 alfanuméricos minúsculos. Não existe em prosa.
    { tipo: "identificador", re: /\bc[a-z0-9]{24,}\b/g },
    // correlationId da esteira: "assistido:<id>:<id>" e parentes. O segmento
    // depois dos dois-pontos precisa ter DÍGITO — sem isso, "Formato:Carrossel"
    // num card legítimo viraria falso positivo e derrubaria a entrega.
    { tipo: "identificador", re: /\b[a-z][a-z-]{2,}:(?=[a-z0-9]*\d)[a-z0-9]{8,}(?::(?=[a-z0-9]*\d)[a-z0-9]{8,})*/g },
    { tipo: "identificador", re: /\b(?:correlationId|funcaoId|departamentoId|clienteId|workspaceId)\b/g },
    ...(slugs.length > 0
      ? [{ tipo: "nome-interno" as const, re: new RegExp(`\\b(?:${slugs.join("|")})\\b`, "g") }]
      : []),
  ];
}

/**
 * Tudo que este texto carrega e o cliente não pode ver. Lista vazia = limpo.
 *
 * Devolve os trechos, não uma contagem: quem lê o erro precisa saber O QUE
 * vazou para consertar a origem — contagem manda adivinhar (guardrail 6).
 */
export function procurarVazamentos(texto: string | null | undefined): Vazamento[] {
  if (!texto) return [];
  const achados: Vazamento[] = [];
  const vistos = new Set<string>();
  for (const { tipo, re } of detectores()) {
    for (const m of texto.matchAll(re)) {
      const chave = `${tipo}:${m[0]}`;
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      achados.push({ tipo, trecho: m[0] });
    }
  }
  return achados;
}

/**
 * O texto sem o que o cliente não pode ver.
 *
 * Usado onde a origem é INCONFIÁVEL por natureza — a saída de um modelo, que
 * pode devolver o próprio id da função no meio do artefato. Redigir ali é
 * higiene de entrada; o portão de escrita (`exigirTextoLimpo`) continua sendo
 * quem garante. Um sem o outro seria ou frágil (só redação) ou fora do ar por
 * motivo cosmético (só recusa).
 */
export function redigirParaOCliente(texto: string): string {
  let saida = texto;
  for (const { re } of detectores()) {
    saida = saida.replace(re, MARCA_DE_REDACAO);
  }
  // Redação em sequência vira ruído: "[…] […] […]" não informa mais que um.
  return saida.replace(
    new RegExp(`(?:${MARCA_DE_REDACAO.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s·,;-]*){2,}`, "g"),
    `${MARCA_DE_REDACAO} `,
  ).trim();
}

export class VazamentoAoCliente extends Error {
  constructor(
    readonly campo: string,
    readonly vazamentos: Vazamento[],
  ) {
    super(
      `${campo}: conteúdo visível ao cliente carrega dado interno da agência — ` +
        vazamentos.map((v) => `${v.tipo} (${v.trecho})`).join(", ") +
        ". Custo, id e slug de agente ficam do lado da equipe (comentário interno), nunca em campo com clientVisible.",
    );
    this.name = "VazamentoAoCliente";
  }
}

/**
 * LANÇA se o texto não pode ser mostrado ao cliente. Chamado no caminho de
 * escrita, antes de virar linha no banco.
 *
 * Falhar alto é a escolha, e é a mesma que `createApprovalRequest` já faz para
 * card sem dono: gravar em silêncio um card que expõe a margem da casa é pior
 * que um 500 que alguém vê no mesmo minuto. Quem precisa do dado tem caminho —
 * o rastro da equipe.
 */
export function exigirTextoLimpo(campo: string, texto: string | null | undefined): void {
  const vazamentos = procurarVazamentos(texto);
  if (vazamentos.length > 0) throw new VazamentoAoCliente(campo, vazamentos);
}
