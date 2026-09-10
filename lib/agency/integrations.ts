// ─── Agent Tools & Integrations — V1 Configuration Layer ──────────────────────
//
// Pure data model + static mock configuration.
// No real API keys, no backend. Defines the intended mapping between
// agents and their tool/provider dependencies for planning and readiness display.
// ─────────────────────────────────────────────────────────────────────────────

export type IntegrationCategory =
  | "ai_provider"
  | "design_tool"
  | "ads_platform"
  | "storage"
  | "automation"
  | "analytics"
  | "publishing";

export type IntegrationStatus =
  | "active"
  | "configured"
  | "available"
  | "planned"
  | "unavailable"
  | "error";

export type IntegrationPriority = "p0" | "p1" | "p2" | "future";

/**
 * DE QUEM É A CONTA que esta integração conecta. É a distinção que faltava, e
 * ela não é organizacional — é operacional.
 *
 * `agencia` — uma assinatura da Dioli que serve TODOS os clientes: os provedores
 *   de IA, o Canva, o Drive, o Zapier. Conectar uma vez basta.
 *
 * `cliente` — a conta DAQUELE cliente: o Instagram dele, o Google Ads dele, o
 *   Analytics dele. Uma por cliente, autorizada e revogável por ele.
 *
 * Por que misturar os dois quebra: a pergunta do CEO em 01/08/2026 —
 * *"o que eu vou conectar aqui o Google Analytics? De quem?"* — não tem
 * resposta numa tela global. Uma conexão global de Analytics só consegue
 * atender UM cliente, e com cinco entrando isso quebra no segundo. Além disso,
 * autorizar o acesso às contas dele é direito do cliente, não da agência.
 */
export type IntegrationScope = "agencia" | "cliente";

/** A categoria já diz de quem é a conta — não há caso ambíguo entre elas. */
const ESCOPO_POR_CATEGORIA: Record<IntegrationCategory, IntegrationScope> = {
  ai_provider: "agencia",
  design_tool: "agencia",
  storage:     "agencia",
  automation:  "agencia",
  ads_platform: "cliente",
  analytics:    "cliente",
  publishing:   "cliente",
};

export function escopoDaIntegracao(categoria: IntegrationCategory): IntegrationScope {
  return ESCOPO_POR_CATEGORIA[categoria];
}

/** As que devem ser conectadas na tela da AGÊNCIA. */
export function integracoesDaAgencia(todas: Integration[]): Integration[] {
  return todas.filter((i) => escopoDaIntegracao(i.category) === "agencia");
}

/** As que devem ser conectadas no painel DE CADA CLIENTE — e, idealmente, pelo
 *  próprio cliente, no portal dele. */
export function integracoesDoCliente(todas: Integration[]): Integration[] {
  return todas.filter((i) => escopoDaIntegracao(i.category) === "cliente");
}

export type AssignedAgent =
  | "strategy_room"
  | "project_manager"
  | "social"
  | "design"
  | "ads"
  | "brand_hub"
  | "system_doctor";

export interface Integration {
  id: string;
  name: string;
  provider: string;
  category: IntegrationCategory;
  assignedAgents: AssignedAgent[];
  purpose: string;
  status: IntegrationStatus;
  priority: IntegrationPriority;
  costHint?: string;
  setupNotes?: string;
  capabilities: string[];
  limitations: string[];
}

export type AgentId =
  | "strategy_room"
  | "pm_agent"
  | "social"
  | "design"
  | "ads"
  | "brand_hub"
  | "system_doctor";

export type AgentMode = "rule_based" | "ai_powered" | "hybrid";

export interface AgentAIConfig {
  agentId: AgentId;
  agentName: string;
  currentMode: AgentMode;
  currentProvider: string;
  plannedProvider: string;
  externalTools: string[];
  readyToday: boolean;
  missingConfig: string[];
  futureUpgrades: string[];
}

// ─── Mock Integrations ────────────────────────────────────────────────────────

export const MOCK_INTEGRATIONS: Integration[] = [
  // ── AI Providers ──────────────────────────────────────────────────────────
  {
    id: "int-openai",
    name: "OpenAI",
    provider: "OpenAI",
    category: "ai_provider",
    assignedAgents: ["strategy_room", "social", "ads", "brand_hub", "project_manager"],
    purpose: "Geração de texto, análise e raciocínio para agentes principais",
    status: "available",
    priority: "p0",
    costHint: "~$20–$100/mês (GPT-4o, uso moderado)",
    setupNotes: "Adicionar OPENAI_API_KEY no backend. V1: placeholder — sem chave real.",
    capabilities: [
      "Geração de copy e conteúdo",
      "Análise estratégica",
      "Sumarização de briefings",
      "Classificação e extração",
    ],
    limitations: [
      "Sem acesso a dados de tempo real",
      "Custos por token",
      "Requer backend seguro para chave de API",
    ],
  },
  {
    id: "int-openai-images",
    name: "OpenAI Images (DALL-E 3)",
    provider: "OpenAI",
    category: "ai_provider",
    assignedAgents: ["design"],
    purpose: "Geração de imagens e mockups para o Agente de Design",
    status: "configured",
    priority: "p0",
    costHint: "~$0.04–$0.12 por imagem gerada",
    setupNotes: "Conectado via /api/generate-image. Usa OPENAI_API_KEY do ambiente.",
    capabilities: [
      "Geração de imagens por prompt",
      "Mockups visuais para aprovação",
      "Variações de criativo",
    ],
    limitations: [
      "Não edita imagens existentes em V1",
      "Sem acesso a brand assets do cliente",
      "Limite de resolução e proporções",
    ],
  },
  {
    id: "int-gemini",
    name: "Google Gemini",
    provider: "Google",
    category: "ai_provider",
    assignedAgents: ["brand_hub", "strategy_room"],
    purpose: "Análise de brand guidelines e documentos extensos (long context)",
    status: "planned",
    priority: "p1",
    costHint: "~$10–$50/mês (Gemini 1.5 Pro)",
    setupNotes: "Adicionar GOOGLE_AI_API_KEY. Alternativa ao OpenAI para documentos longos.",
    capabilities: [
      "Contexto de 1M tokens",
      "Análise de PDFs e brand books",
      "Extração de guidelines visuais",
    ],
    limitations: [
      "Sem geração de imagens nativa",
      "Requer backend seguro para a chave",
    ],
  },
  {
    id: "int-claude",
    name: "Claude (Anthropic)",
    provider: "Anthropic",
    category: "ai_provider",
    assignedAgents: ["strategy_room", "project_manager", "system_doctor"],
    purpose: "Raciocínio avançado, análise de projeto e diagnósticos contextuais",
    status: "available",
    priority: "p1",
    costHint: "~$15–$75/mês (Claude Sonnet)",
    setupNotes: "Adicionar ANTHROPIC_API_KEY no backend. Excelente para análise complexa.",
    capabilities: [
      "Raciocínio de longa cadeia",
      "Análise de projetos complexos",
      "Diagnóstico e recomendações",
      "Contexto estendido (200k tokens)",
    ],
    limitations: [
      "Sem geração de imagens",
      "Requer backend seguro",
    ],
  },
  {
    id: "int-deepseek",
    name: "DeepSeek",
    provider: "DeepSeek",
    category: "ai_provider",
    assignedAgents: ["strategy_room", "project_manager", "social", "design", "ads"],
    purpose: "Raciocínio e texto a custo baixo — reserva quando outro provedor cai ou fica caro",
    status: "available",
    priority: "p2",
    costHint: "~$0,14 por milhão de tokens de entrada (V4-Flash) — o mais barato da casa",
    setupNotes: "Cole a chave em Chaves de IA (platform.deepseek.com → API keys). API compatível com OpenAI.",
    capabilities: [
      "Contexto de 1M tokens",
      "Saída em JSON (usada por todos os agentes)",
      "Custo ~10x menor que os provedores de topo",
    ],
    limitations: [
      "Sem geração de imagens",
      "Não é a primeira escolha para texto que vai direto ao cliente",
    ],
  },
  {
    id: "int-perplexity",
    name: "Perplexity",
    provider: "Perplexity AI",
    category: "ai_provider",
    assignedAgents: ["strategy_room", "ads"],
    purpose: "Pesquisa de mercado em tempo real e inteligência competitiva",
    status: "planned",
    priority: "p2",
    costHint: "~$20/mês (Pro plan)",
    setupNotes: "Adicionar PERPLEXITY_API_KEY. Útil para análise de tendências e benchmarks.",
    capabilities: [
      "Pesquisa com fontes atualizadas",
      "Análise de concorrentes",
      "Tendências de mercado em tempo real",
    ],
    limitations: [
      "Custo por query",
      "Dados podem ter pequena latência",
    ],
  },
  // ── Design Tools ──────────────────────────────────────────────────────────
  {
    id: "int-canva",
    name: "Canva",
    provider: "Canva",
    category: "design_tool",
    assignedAgents: ["design", "social"],
    purpose: "Criação e exportação de criativos, posts e materiais visuais",
    status: "planned",
    priority: "p1",
    costHint: "~$15/mês (Canva Pro)",
    setupNotes: "Requer OAuth Canva Connect API. Não disponível em V1.",
    capabilities: [
      "Templates de posts e stories",
      "Exportação em múltiplos formatos",
      "Brand kit integrado",
      "Publicação direta",
    ],
    limitations: [
      "OAuth não implementado em V1",
      "Requer conta Canva Pro ativa",
    ],
  },
  {
    id: "int-gamma",
    name: "Gamma",
    provider: "Gamma App",
    category: "design_tool",
    assignedAgents: ["strategy_room", "design"],
    purpose: "Geração de apresentações e decks de proposta com IA",
    status: "planned",
    priority: "p2",
    costHint: "~$15/mês (Pro plan)",
    setupNotes: "Gamma API em beta. Previsto para apresentações de Strategy Room.",
    capabilities: [
      "Decks de proposta gerados por IA",
      "Apresentações de Strategy Room",
      "Export para PDF e PPT",
    ],
    limitations: [
      "API em beta — sem garantia de estabilidade",
      "Customização limitada por template",
    ],
  },
  {
    id: "int-capcut",
    name: "CapCut",
    provider: "ByteDance",
    category: "design_tool",
    assignedAgents: ["social", "design"],
    purpose: "Edição de vídeos curtos para Reels, TikTok e YouTube Shorts",
    status: "planned",
    priority: "p2",
    costHint: "Gratuito / ~$10/mês (Pro)",
    setupNotes: "Sem API pública para automação. Integração futura via Make/Zapier.",
    capabilities: [
      "Edição de vídeo com templates",
      "Legendas automáticas",
      "Efeitos e transições para vídeo social",
    ],
    limitations: [
      "Sem API pública para automação direta",
      "Processo manual em V1",
    ],
  },
  // ── Ads Platforms ─────────────────────────────────────────────────────────
  {
    id: "int-meta-ads",
    name: "Meta Ads",
    provider: "Meta",
    category: "ads_platform",
    assignedAgents: ["ads"],
    purpose: "Criação e publicação de campanhas no Facebook e Instagram",
    status: "planned",
    priority: "p0",
    costHint: "Orçamento de mídia separado (definido por campanha)",
    setupNotes: "Requer Meta Business Manager + OAuth Graph API. Não implementado em V1.",
    capabilities: [
      "Campanhas de performance e branding",
      "Segmentação avançada de público",
      "A/B testing de criativos",
      "Relatórios de conversão",
    ],
    limitations: [
      "OAuth Meta não implementado em V1",
      "Requer conta Business Manager ativa",
      "Revisão e aprovação manual de anúncios",
    ],
  },
  {
    id: "int-google-ads",
    name: "Google Ads",
    provider: "Google",
    category: "ads_platform",
    assignedAgents: ["ads"],
    purpose: "Campanhas de search, display e YouTube",
    status: "planned",
    priority: "p0",
    costHint: "Orçamento de mídia separado (mínimo ~R$1.000/mês recomendado)",
    setupNotes: "Requer Google Ads API + OAuth. Não implementado em V1.",
    capabilities: [
      "Campanhas de Search (alta intenção)",
      "Display e YouTube Ads",
      "Smart bidding automatizado",
    ],
    limitations: [
      "OAuth Google não implementado",
      "Requer conta Google Ads verificada",
    ],
  },
  // ── Storage & Assets ──────────────────────────────────────────────────────
  {
    id: "int-gdrive",
    name: "Google Drive",
    provider: "Google",
    category: "storage",
    assignedAgents: ["brand_hub", "design", "social"],
    purpose: "Armazenamento e acesso a brand assets, briefings e aprovações",
    status: "planned",
    priority: "p1",
    costHint: "Gratuito (15GB) / R$7,99/mês (100GB)",
    setupNotes: "Requer Google OAuth. Permite upload/download de brand assets e brand books.",
    capabilities: [
      "Upload de brand book e assets visuais",
      "Compartilhamento com cliente",
      "Versionamento de arquivos",
    ],
    limitations: [
      "OAuth não implementado em V1",
      "Sem sync automático de assets",
    ],
  },
  // ── Publishing & Scheduling ───────────────────────────────────────────────
  {
    id: "int-instagram-publish",
    name: "Instagram / Facebook Publishing",
    provider: "Meta",
    category: "publishing",
    assignedAgents: ["social"],
    purpose: "Publicação e agendamento direto de posts e stories",
    status: "planned",
    priority: "p1",
    costHint: "Incluído na Meta Ads (sem custo adicional)",
    setupNotes: "Requer Meta Graph API + permissões de publicação. Não implementado em V1.",
    capabilities: [
      "Publicação direta de feed e stories",
      "Agendamento de conteúdo",
      "Upload de mídia",
    ],
    limitations: [
      "OAuth Meta necessário",
      "Sem aprovação automatizada do cliente em V1",
    ],
  },
  // ── Analytics & Reporting ─────────────────────────────────────────────────
  {
    id: "int-google-analytics",
    name: "Google Analytics 4",
    provider: "Google",
    category: "analytics",
    assignedAgents: ["ads", "strategy_room"],
    purpose: "Métricas de performance, conversões e comportamento do usuário",
    status: "planned",
    priority: "p1",
    costHint: "Gratuito",
    setupNotes: "Requer propriedade GA4 + Google OAuth. Essencial para conversões de Ads.",
    capabilities: [
      "Tracking de conversões",
      "Análise de funil",
      "Dados de audiência para Ads",
    ],
    limitations: [
      "Sem dados históricos sem propriedade existente",
      "OAuth Google não implementado",
    ],
  },
  {
    id: "int-search-console",
    name: "Google Search Console",
    provider: "Google",
    category: "analytics",
    assignedAgents: ["strategy_room"],
    purpose: "Desempenho de SEO e visibilidade orgânica do cliente",
    status: "planned",
    priority: "p2",
    costHint: "Gratuito",
    setupNotes: "Requer Google OAuth + acesso à propriedade do cliente.",
    capabilities: [
      "Rankings de palavras-chave",
      "Cliques e impressões orgânicas",
      "Relatórios de indexação",
    ],
    limitations: [
      "Necessário acesso do cliente à propriedade",
      "Dados com delay de 2–3 dias",
    ],
  },
  // ── Automation ────────────────────────────────────────────────────────────
  {
    id: "int-zapier",
    name: "Zapier",
    provider: "Zapier",
    category: "automation",
    assignedAgents: ["social", "project_manager"],
    purpose: "Automação de fluxos: notificações de aprovação, publicação, alertas",
    status: "planned",
    priority: "p2",
    costHint: "~$20/mês (Starter)",
    setupNotes: "Conecta ferramentas sem código. Útil para notificações e publicação.",
    capabilities: [
      "Webhooks para notificações automáticas",
      "Gatilhos de aprovação",
      "Integração entre plataformas",
    ],
    limitations: [
      "Custo por execução",
      "Latência entre eventos",
    ],
  },
  {
    id: "int-make",
    name: "Make (ex-Integromat)",
    provider: "Make",
    category: "automation",
    assignedAgents: ["social", "project_manager", "ads"],
    purpose: "Automação visual com lógica complexa para pipelines de aprovação",
    status: "planned",
    priority: "p2",
    costHint: "~$10/mês (Core plan)",
    setupNotes: "Alternativa ao Zapier com mais controle de fluxo. Útil para campanhas.",
    capabilities: [
      "Fluxos condicionais complexos",
      "Processamento de webhooks",
      "Integração com Meta e Google APIs",
    ],
    limitations: [
      "Curva de aprendizado maior que Zapier",
      "Custo por operação",
    ],
  },
];

// ─── Agent AI Configuration ───────────────────────────────────────────────────

export const AGENT_AI_CONFIGS: AgentAIConfig[] = [
  {
    agentId: "strategy_room",
    agentName: "Strategy Room",
    currentMode: "rule_based",
    currentProvider: "Rule-based V2",
    plannedProvider: "OpenAI GPT-4o",
    externalTools: [],
    readyToday: true,
    missingConfig: ["OpenAI API key para geração estratégica real"],
    futureUpgrades: ["Análise competitiva com Perplexity", "Decks automáticos com Gamma"],
  },
  {
    agentId: "pm_agent",
    agentName: "PM Agent",
    currentMode: "rule_based",
    currentProvider: "Rule-based (priorização local)",
    plannedProvider: "OpenAI GPT-4o",
    externalTools: [],
    readyToday: true,
    missingConfig: ["OpenAI API key para análise de risco de projeto"],
    futureUpgrades: ["Notificações via Zapier/Make", "Análise preditiva de prazo"],
  },
  {
    agentId: "social",
    agentName: "Social Media",
    currentMode: "rule_based",
    currentProvider: "Rule-based + templates",
    plannedProvider: "OpenAI GPT-4o",
    externalTools: [],
    readyToday: true,
    missingConfig: [
      "OpenAI API key para geração de copy real",
      "Meta Graph API para publicação direta",
    ],
    futureUpgrades: [
      "Publicação automática via Instagram API",
      "CapCut para vídeos curtos",
      "Canva para criativos",
    ],
  },
  {
    agentId: "design",
    agentName: "Design",
    currentMode: "hybrid",
    currentProvider: "Rule-based + DALL-E 3",
    plannedProvider: "OpenAI GPT-4o Vision + DALL-E 3",
    externalTools: ["DALL-E 3 (/api/generate-image)"],
    readyToday: true,
    missingConfig: ["Canva API para criação de layouts reais"],
    futureUpgrades: [
      "Canva Connect API para export",
      "Adobe Express integration",
    ],
  },
  {
    agentId: "ads",
    agentName: "Tráfego Pago",
    currentMode: "rule_based",
    currentProvider: "Rule-based + templates de copy",
    plannedProvider: "OpenAI GPT-4o",
    externalTools: [],
    readyToday: true,
    missingConfig: [
      "OpenAI API key para otimização de copy",
      "Meta Ads API para publicação de campanhas",
      "Google Ads API para campanhas de search",
    ],
    futureUpgrades: [
      "Meta Ads API (publicação direta)",
      "Google Ads API (smart bidding)",
      "GA4 (tracking de conversão)",
    ],
  },
  {
    agentId: "brand_hub",
    agentName: "Brand Hub / Parser",
    currentMode: "rule_based",
    currentProvider: "Rule-based (parser de texto)",
    plannedProvider: "Google Gemini 1.5 Pro",
    externalTools: [],
    readyToday: true,
    missingConfig: [
      "Gemini API para extração de guidelines de documentos extensos",
      "Google Drive para upload de brand books",
    ],
    futureUpgrades: [
      "Extração automática de brand guidelines de PDFs",
      "Google Drive sync de assets",
    ],
  },
  {
    agentId: "system_doctor",
    agentName: "System Doctor",
    currentMode: "rule_based",
    currentProvider: "Rule-based (diagnóstico local)",
    plannedProvider: "OpenAI GPT-4o",
    externalTools: [],
    readyToday: true,
    missingConfig: ["OpenAI para diagnósticos contextuais e sugestões adaptativas"],
    futureUpgrades: ["Diagnóstico preditivo com IA", "Alertas proativos baseados em padrões"],
  },
];

// ─── Integration Readiness ────────────────────────────────────────────────────

export interface IntegrationReadiness {
  score: number;
  activeCount: number;
  configuredCount: number;
  availableCount: number;
  plannedCount: number;
  unavailableCount: number;
  topMissing: string;
  usableToday: string[];
}

export function computeIntegrationReadiness(integrations: Integration[]): IntegrationReadiness {
  const activeCount = integrations.filter((i) => i.status === "active").length;
  const configuredCount = integrations.filter((i) => i.status === "configured").length;
  const availableCount = integrations.filter((i) => i.status === "available").length;
  const plannedCount = integrations.filter((i) => i.status === "planned").length;
  const unavailableCount = integrations.filter(
    (i) => i.status === "unavailable" || i.status === "error"
  ).length;

  const readyCount = activeCount + configuredCount;
  const total = integrations.length;
  const score = total === 0 ? 100 : Math.round((readyCount / total) * 100);

  const missing = integrations
    .filter((i) => i.status !== "active" && i.status !== "configured")
    .sort((a, b) => {
      const order: Record<IntegrationPriority, number> = { p0: 0, p1: 1, p2: 2, future: 3 };
      return order[a.priority] - order[b.priority];
    });
  const topMissing = missing[0]
    ? `Configurar ${missing[0].name}: ${missing[0].purpose}`
    : "Todas as integrações prioritárias configuradas.";

  const usableToday = integrations
    .filter((i) => i.status === "active" || i.status === "configured")
    .map((i) => i.name);

  return {
    score,
    activeCount,
    configuredCount,
    availableCount,
    plannedCount,
    unavailableCount,
    topMissing,
    usableToday,
  };
}

// ─── V2 Operational Config ────────────────────────────────────────────────────

export type ProviderOption = "rule_based" | "openai" | "gemini" | "claude" | "perplexity" | "deepseek";
export type TestStatus = "pass" | "fail" | "not_run";

export interface IntegrationConfig {
  integrationId: string;
  configured: boolean;
  selectedModel?: string;
  workspace?: string;
  accountId?: string;
  folder?: string;
  webhookUrl?: string;
  assignedAgents: AssignedAgent[];
  lastTestStatus: TestStatus;
  lastTestAt?: string;
  lastTestMessage?: string;
  lastConfiguredAt?: string;
  configuredManually?: boolean;
}

// ⚠️ `AgentProviderConfig`, `PROVIDER_OPTIONS` e `buildDefaultAgentProviderConfigs`
// FORAM REMOVIDOS em 06/08/2026, junto com a seção "IAs dos Agentes" da tela de
// Integrações, a rota `/api/agent-configs` e a tabela `DbAgentProviderConfig`.
//
// Por quê: a tela gravava a escolha e NINGUÉM a lia. A decisão real de provedor
// estava (e está) em `lib/agency/execution/especialistas.ts`, e o motor único é
// `lib/ai/generate.ts`. Três coisas erradas de uma vez:
//   • o operador configurava e nada acontecia, sem mensagem nenhuma;
//   • a lista de agentes (`strategy_room`, `pm_agent`, `brand_hub`…) é vocabulário
//     da V1 e não corresponde a nenhum departamento nem especialista que o motor
//     executa hoje — a tela nem falava das mesmas entidades;
//   • `rule_based` era uma opção que não existe: não há motor de texto por regras.
//
// O que ocupou o lugar dela MANDA de verdade: a escolha de provedor **por
// cliente** (`ClientAiProvider` → `lib/ai/escolha-por-cliente.ts` → `generate()`).

export const PROVIDER_INTEGRATION_MAP: Record<ProviderOption, string | null> = {
  rule_based:  null,
  openai:      "int-openai",
  gemini:      "int-gemini",
  claude:      "int-claude",
  deepseek:    "int-deepseek",
  perplexity:  "int-perplexity",
};

// Função PURA — sem `new Date()`, sem `Date.now()`, sem nada que dependa do
// instante em que ela é chamada. É o estado inicial da store zustand, avaliado
// uma vez no servidor (durante o render) e de novo no navegador (durante a
// hidratação); se o valor dependesse do relógio, os dois instantes produziriam
// marcações diferentes e quebrariam a hidratação (ver
// `__tests__/agency/integracoes-hidratacao.test.ts`).
//
// Além disso, "quando o teste rodou" para uma configuração pré-instalada é
// informação que não existe — nenhum teste rodou de fato. Lei da casa: ausência
// de informação não é informação. `lastTestAt` fica `undefined`.
export function buildDefaultIntegrationConfigs(): IntegrationConfig[] {
  return MOCK_INTEGRATIONS.map((i) => ({
    integrationId: i.id,
    configured: i.status === "configured" || i.status === "active",
    assignedAgents: [...i.assignedAgents],
    lastTestStatus: (i.status === "configured" || i.status === "active") ? "pass" : "not_run",
    lastTestAt: undefined,
    lastTestMessage: (i.status === "configured" || i.status === "active")
      ? "Configuração pré-instalada — simulação OK."
      : undefined,
  }));
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  ai_provider:  "Provedores de IA",
  design_tool:  "Design & Criação",
  ads_platform: "Plataformas de Ads",
  storage:      "Storage & Assets",
  automation:   "Automação",
  analytics:    "Analytics",
  publishing:   "Publicação",
};

export const CATEGORY_ORDER: IntegrationCategory[] = [
  "ai_provider",
  "design_tool",
  "ads_platform",
  "storage",
  "publishing",
  "analytics",
  "automation",
];

export const STATUS_LABELS: Record<IntegrationStatus, string> = {
  active:      "Ativo",
  configured:  "Configurado",
  available:   "Disponível",
  planned:     "Planejado",
  unavailable: "Indisponível",
  error:       "Erro",
};

export const STATUS_COLORS: Record<IntegrationStatus, { bg: string; text: string; dot: string }> = {
  active:      { bg: "bg-[#DCFCE7]", text: "text-[#16A34A]", dot: "bg-[#16A34A]" },
  configured:  { bg: "bg-[#E6FBFA]", text: "text-[#070A1F]", dot: "bg-[#070A1F]" },
  available:   { bg: "bg-[#E6FBFA]", text: "text-[#0891B2]", dot: "bg-[#0891B2]" },
  planned:     { bg: "bg-[#F4F4F0]", text: "text-[#9B9B95]", dot: "bg-[#C0C0BA]" },
  unavailable: { bg: "bg-[#FEF3C7]", text: "text-[#D97706]", dot: "bg-[#D97706]" },
  error:       { bg: "bg-[#FEE2E2]", text: "text-[#DC2626]", dot: "bg-[#DC2626]" },
};

export const PRIORITY_LABELS: Record<IntegrationPriority, string> = {
  p0: "Crítico",
  p1: "Alta",
  p2: "Média",
  future: "Futuro",
};

export const PRIORITY_COLORS: Record<IntegrationPriority, string> = {
  p0:     "text-[#DC2626] bg-[#FEE2E2]",
  p1:     "text-[#D97706] bg-[#FEF3C7]",
  p2:     "text-[#9B9B95] bg-[#F4F4F0]",
  future: "text-[#9B9B95] bg-[#F4F4F0]",
};

export const MODE_LABELS: Record<AgentMode, string> = {
  rule_based: "Regras locais",
  ai_powered: "IA externa",
  hybrid:     "Híbrido",
};

export const MODE_COLORS: Record<AgentMode, string> = {
  rule_based: "text-[#9B9B95] bg-[#F4F4F0]",
  ai_powered: "text-[#16A34A] bg-[#DCFCE7]",
  hybrid:     "text-[#070A1F] bg-[#E6FBFA]",
};

export const AGENT_LABELS: Record<AssignedAgent, string> = {
  strategy_room:   "Strategy Room",
  project_manager: "PM Agent",
  social:          "Social",
  design:          "Design",
  ads:             "Ads",
  brand_hub:       "Brand Hub",
  system_doctor:   "System Doctor",
};

export const AGENT_ID_LABELS: Record<AgentId, string> = {
  strategy_room:  "Strategy Room",
  pm_agent:       "PM Agent",
  social:         "Social Media",
  design:         "Design",
  ads:            "Tráfego Pago",
  brand_hub:      "Brand Hub",
  system_doctor:  "System Doctor",
};
