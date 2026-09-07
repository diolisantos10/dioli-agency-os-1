// library.ts — a BIBLIOTECA VIVA do Radar Dioli.
//
// O acervo de tendências/atualizações de mercado que abastece TODOS os agentes
// (insumo de produção) e as diretrizes da QUALIDADE. É a versão generalizada do
// "Experience Vault" do FOOCCI: um depósito de verdade que todo o sistema consome.
//
// GOVERNANÇA (regra do dono) — RECORTADA EM 05/08/2026:
//   • source "official" diz que A FONTE é confiável (Meta/TikTok/Google).
//   • `extraction` diz se O TEXTO que está entrando veio da fonte ou de um
//     modelo lendo a fonte. São coisas DIFERENTES, e tratá-las como a mesma era
//     o furo.
//   • Só entra ATIVA na hora a combinação `official` + `literal_da_fonte`.
//     Todo o resto entra PENDENTE, à espera de humano.
//
// ─── O FURO QUE ISTO FECHA ──────────────────────────────────────────────────
//
// `addInsight({ source: "official" })` gravava `status: "active"`,
// `approvedBy: "official-source"`, na hora. Só que o `guidance` NÃO era da
// fonte: era o que um modelo extraiu dela (`radar-agent.ts` → `scanSource`),
// com um "NÃO invente" no prompt como única proteção. Prompt é sugestão.
//
// E o destino desse texto é o pior possível: ele entra (a) no prompt de TODOS
// os especialistas sob o rótulo "siga estas diretrizes" e (b) no prompt do
// AUDITOR DE QUALIDADE como régua de julgamento. Uma alucinação virava diretriz
// da agência inteira e a própria Qualidade passava a auditar contra ela —
// contaminando todos os clientes ao mesmo tempo, sem ninguém no caminho.
//
// "A fonte é oficial" nunca foi prova de que "a extração está certa".
//
// VERSIONAMENTO: cada insight tem um `topic`. Ao ATIVAR um insight, os anteriores
// ATIVOS do mesmo tópico são ARQUIVADOS — o "era assim → agora é assim".

import { prisma } from "@/lib/db/client";

export type InsightDomain = "social" | "design" | "paid-traffic" | "analytics" | "seo" | "general";
export type InsightSource = "official" | "trend";

/**
 * COMO O TEXTO CHEGOU AQUI — a distinção que faltava.
 *
 * `literal_da_fonte`: cada afirmação do `guidance` tem lastro verificado no
 * texto publicado pela fonte. Quem grava isto teve de PROVAR, em código.
 *
 * `modelo`: um modelo leu a fonte e escreveu o `guidance` com as próprias
 * palavras. Pode estar certo; não está verificado. É o default, e o default é
 * desconfiança de propósito — quem esquecer de declarar cai no lado seguro.
 */
export type InsightExtraction = "literal_da_fonte" | "modelo";

export interface AddInsightInput {
  workspaceId: string;
  domain: InsightDomain;
  topic: string;
  title: string;
  guidance: string;
  source: InsightSource;
  /** Omitir = `"modelo"`. Ver `InsightExtraction`. */
  extraction?: InsightExtraction;
  sourceName?: string;
  sourceUrl?: string;
}

/** Arquiva os insights ATIVOS de um tópico (dá lugar à versão nova). */
async function archiveActiveTopic(workspaceId: string, topic: string): Promise<void> {
  await prisma.marketInsight.updateMany({
    where: { workspaceId, topic, status: "active" },
    data: { status: "archived" },
  });
}

/**
 * Adiciona um insight. Só a combinação FONTE OFICIAL + EXTRAÇÃO LITERAL entra
 * ATIVA na hora (e supersede o tópico). Todo o resto — inclusive fonte oficial
 * com texto escrito por modelo — entra PENDENTE, à espera de humano.
 *
 * Nunca inventa: quem chama fornece o texto; a biblioteca só governa o estado.
 */
export async function addInsight(input: AddInsightInput): Promise<{ id: string; status: string }> {
  const extraction: InsightExtraction = input.extraction ?? "modelo";
  // A conjunção é o ponto do arquivo inteiro: `official` sozinho NÃO ativa.
  const isOfficial = input.source === "official" && extraction === "literal_da_fonte";
  if (isOfficial) await archiveActiveTopic(input.workspaceId, input.topic);
  const row = await prisma.marketInsight.create({
    data: {
      workspaceId: input.workspaceId,
      domain: input.domain,
      topic: input.topic,
      title: input.title,
      guidance: input.guidance,
      source: input.source,
      sourceName: input.sourceName
        ? `${input.sourceName}${extraction === "modelo" ? " (texto extraído por modelo — não conferido palavra a palavra)" : ""}`
        : null,
      sourceUrl: input.sourceUrl ?? null,
      status: isOfficial ? "active" : "pending",
      approvedBy: isOfficial ? "official-source" : null,
      approvedAt: isOfficial ? new Date() : null,
    },
    select: { id: true, status: true },
  });
  return row;
}

/** Aprova uma tendência pendente (validação humana) → entra em vigor e supersede o tópico. */
/**
 * ⛔ `workspaceId` OBRIGATÓRIO (varredura de 28/08). Sem ele, uma agência
 * aprovava o insight de outra — e `archiveActiveTopic` usava o workspace LIDO
 * do insight alheio, mexendo na biblioteca do vizinho.
 */
export async function approveInsight(id: string, approvedBy: string, workspaceId: string): Promise<boolean> {
  const insight = await prisma.marketInsight.findFirst({ where: { id, workspaceId }, select: { workspaceId: true, topic: true, status: true } });
  if (!insight || insight.status !== "pending") return false;
  await archiveActiveTopic(insight.workspaceId, insight.topic);
  await prisma.marketInsight.updateMany({ where: { id, workspaceId }, data: { status: "active", approvedBy, approvedAt: new Date() } });
  return true;
}

/** ⛔ `workspaceId` OBRIGATÓRIO — mesma razão de `approveInsight`. */
export async function rejectInsight(id: string, by: string, workspaceId: string): Promise<boolean> {
  const r = await prisma.marketInsight.updateMany({ where: { id, workspaceId, status: "pending" }, data: { status: "rejected", approvedBy: by } });
  return r.count > 0;
}

/** Tendências pendentes de validação humana (a fila do humano). */
export async function listPending(workspaceId: string) {
  return prisma.marketInsight.findMany({ where: { workspaceId, status: "pending" }, orderBy: { createdAt: "desc" } });
}

/**
 * As diretrizes VIGENTES (ativas) de um domínio — o insumo que os agentes usam.
 * Inclui sempre "general" (tendências transversais). Bounded para não estourar o prompt.
 */
export async function getActiveInsights(workspaceId: string, domain: InsightDomain, limit = 8) {
  return prisma.marketInsight.findMany({
    where: { workspaceId, status: "active", domain: { in: [domain, "general"] } },
    orderBy: { approvedAt: "desc" },
    take: limit,
    select: { title: true, guidance: true, source: true, sourceName: true },
  });
}

/** Bloco de texto das diretrizes atuais, pra injetar no prompt (produção e auditoria). */
export function buildInsightBlock(insights: Array<{ title: string; guidance: string; source: string; sourceName: string | null }>): string {
  if (!insights.length) return "";
  const lines = insights.map((i) => {
    const tag = i.source === "official" ? `OFICIAL${i.sourceName ? ` (${i.sourceName})` : ""}` : "tendência";
    return `• [${tag}] ${i.title}: ${i.guidance}`;
  });
  return [
    "━━━ RADAR DIOLI — o que está ATUAL no mercado (siga estas diretrizes) ━━━",
    ...lines,
    "━━━",
  ].join("\n");
}
