// card-do-cliente.ts — O QUE O CLIENTE LÊ, E O QUE A EQUIPE LÊ. PURO.
//
// ─── POR QUE SÃO DOIS TEXTOS, E NÃO UM ──────────────────────────────────────
//
// Até 15/08/2026 o ciclo assistido montava UMA frase e a punha no card que o
// cliente abre: passos, slugs de agente, correlationId e o custo em dólar de
// cada passo. O texto servia a um leitor real — a operação, que precisa saber
// se o ciclo se paga — mas foi entregue ao leitor errado.
//
// O conserto não é apagar o rastro: é separar os públicos.
//
//   • `corpoParaOCliente`  → o que foi PRODUZIDO, em português de gente, com a
//     peça dentro. Sem id, sem nome de agente, sem custo.
//   • `resumoParaAEquipe`  → passos, custo por função, correlationId. Vai para
//     comentário interno do card (`isClientVisible: false`), onde sempre
//     deveria ter estado.
//
// ─── POR QUE A PEÇA VAI DENTRO DO CORPO ─────────────────────────────────────
//
// O card pedia decisão sobre uma entrega de Design e não mostrava a entrega.
// Aprovar sem ver não é aprovação, é assinatura em branco — e um cliente que
// assina em branco uma vez não assina duas: da segunda ele para de responder, e
// a esteira inteira trava atrás de um card que ninguém decide.
//
// ─── POR QUE ISTO É PURO ────────────────────────────────────────────────────
//
// Sem prisma e sem HTTP: dá para afirmar em teste que o corpo do cliente não
// tem custo nem id sem montar meia casa — que é exatamente o teste que faltava.

import { redigirParaOCliente } from "@/lib/agency/esteira/vazamento-ao-cliente";

/**
 * As peças da cadeia assistida com o nome que o CLIENTE entende, na ordem em
 * que ele deve lê-las.
 *
 * `pm-orchestrator` NÃO está aqui de propósito: é coordenação interna, não é
 * entrega. Mostrar ao cliente o plano de quem-faz-o-quê dentro da agência é o
 * mesmo erro do custo, só que mais barato.
 */
export const PECAS_DO_CLIENTE: readonly { funcaoId: string; rotulo: string }[] = [
  { funcaoId: "brand-architect", rotulo: "Direção de marca" },
  { funcaoId: "social-strategist", rotulo: "Estratégia de conteúdo" },
  { funcaoId: "editorial-planner", rotulo: "Plano editorial" },
  { funcaoId: "copywriter", rotulo: "Textos das publicações" },
  { funcaoId: "graphic-designer", rotulo: "Direção visual das peças" },
];

export interface PedidoDoCard {
  nomeDoCliente: string;
  /** O que o cliente pediu, no texto dele. */
  solicitacao: string;
  /** Saída de cada função da cadeia (funcaoId → texto). */
  artefatos: Record<string, string>;
}

/**
 * O corpo do card no formato que o portal já renderiza: primeira linha = título
 * (`AprovacoesDoCliente.tituloDaPeca` lê ≤ 90 chars), resto é texto corrido.
 *
 * Toda saída de modelo passa por `redigirParaOCliente` antes de entrar: o
 * artefato pode citar o próprio id da função no meio do texto, e a régua da
 * escrita (que LANÇA) derrubaria a entrega por isso. Higiene na entrada,
 * portão na saída.
 */
export function corpoParaOCliente(pedido: PedidoDoCard): {
  titulo: string;
  reviewNote: string;
  /** Quais peças entraram — o chamador registra isto no rastro da equipe. */
  pecasIncluidas: string[];
} {
  const presentes = PECAS_DO_CLIENTE.filter((p) => (pedido.artefatos[p.funcaoId] ?? "").trim());
  const titulo = `Pacote de conteúdo — ${pedido.nomeDoCliente}`.slice(0, 90);

  const pedidoLimpo = redigirParaOCliente(pedido.solicitacao.trim());
  const abertura = [
    `Preparamos este material a partir do que você pediu:`,
    `“${pedidoLimpo}”`,
    ``,
    presentes.length > 0
      ? `O que está neste pacote: ${presentes.map((p) => p.rotulo.toLowerCase()).join(" · ")}.`
      : `O material ainda está em produção — assim que a primeira peça ficar pronta ela aparece aqui.`,
    ``,
    `Leia abaixo e responda: aprovar, pedir ajuste ou tirar uma dúvida. Nada é publicado sem a sua decisão.`,
  ].join("\n");

  const blocos = presentes.map((p) => {
    const texto = redigirParaOCliente(pedido.artefatos[p.funcaoId]!.trim());
    return `## ${p.rotulo}\n${texto}`;
  });

  return {
    titulo,
    reviewNote: [titulo, "", abertura, ...(blocos.length > 0 ? ["", ...blocos] : [])].join("\n"),
    pecasIncluidas: presentes.map((p) => p.rotulo),
  };
}

export interface PassoDoRastro {
  funcaoId: string;
  departamentoId: string;
  decisao: string;
  custoUsd?: number;
  motivo?: string;
}

/**
 * O rastro técnico — para comentário INTERNO do card, nunca para o corpo.
 *
 * Este texto existe porque a pergunta que ele responde é legítima e cara: a
 * operação assistida se paga? Ele só não pode ser lido por quem compra.
 */
export function resumoParaAEquipe(entrada: {
  correlationId: string;
  passos: readonly PassoDoRastro[];
  custoTotalUsd: number;
  pecasIncluidas?: readonly string[];
}): string {
  const linhas = entrada.passos.map((p) => {
    const custo = p.custoUsd !== undefined ? ` ($${p.custoUsd.toFixed(4)})` : "";
    const motivo = p.motivo ? ` — ${p.motivo}` : "";
    return `- ${p.departamentoId}/${p.funcaoId}: ${p.decisao}${custo}${motivo}`;
  });
  return [
    `Rastro do ciclo assistido (interno — não visível ao cliente)`,
    `correlationId: ${entrada.correlationId}`,
    `custo total: $${entrada.custoTotalUsd.toFixed(4)}`,
    ...(entrada.pecasIncluidas?.length
      ? [`peças no card do cliente: ${entrada.pecasIncluidas.join(" · ")}`]
      : []),
    ``,
    ...linhas,
  ].join("\n");
}
