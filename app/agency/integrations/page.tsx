"use client";

import { useState } from "react";
import Link from "next/link";
import AgencyHeader from "@/components/agency/layout/AgencyHeader";
import AiKeyManager from "@/components/agency/AiKeyManager";
import MetaConnectManager from "@/components/agency/MetaConnectManager";
import ProvedorPorCliente from "@/components/agency/ProvedorPorCliente";
import GastoDeIa from "@/components/agency/GastoDeIa";
import { useAgencyStore } from "@/store/agency-store";
import { formatarDataCurta } from "@/lib/data-na-tela";
import {
  MOCK_INTEGRATIONS,
  CATEGORY_LABELS,
  integracoesDaAgencia,
  integracoesDoCliente,
  CATEGORY_ORDER,
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  AGENT_LABELS,
  computeIntegrationReadiness,
  type IntegrationCategory,
  type Integration,
} from "@/lib/agency/integrations";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ReadinessRing({ score }: { score: number }) {
  const color = score >= 70 ? "#16A34A" : score >= 40 ? "#D97706" : "#DC2626";
  const label = score >= 70 ? "Bom" : score >= 40 ? "Em progresso" : "Inicial";
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center border-4 shrink-0"
        style={{ borderColor: color }}
      >
        <span className="text-[18px] font-bold" style={{ color }}>{score}%</span>
      </div>
      <div>
        <div className="text-[13px] font-semibold" style={{ color }}>{label}</div>
        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Integrações prontas / total</div>
      </div>
    </div>
  );
}

function CategoryIcon({ cat }: { cat: IntegrationCategory }) {
  const icons: Record<IntegrationCategory, string> = {
    ai_provider:  "🤖",
    design_tool:  "🎨",
    ads_platform: "📢",
    storage:      "☁️",
    automation:   "⚙️",
    analytics:    "📊",
    publishing:   "📤",
  };
  return <span>{icons[cat] ?? "🔌"}</span>;
}

export function TestBadge({ status, at }: { status: string; at?: string }) {
  if (status === "pass") {
    const dataFormatada = formatarDataCurta(at);
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[var(--success-bg)] text-[var(--success)]">
        ✓ Teste OK{dataFormatada ? ` · ${dataFormatada}` : ""}
      </span>
    );
  }
  if (status === "fail") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[#FEE2E2] text-[var(--danger)]">
        ✗ Falhou
      </span>
    );
  }
  return (
    <span className="text-[10px] text-[var(--text-subtle)]">Não testado</span>
  );
}

// ─── Config Panel ─────────────────────────────────────────────────────────────

type ConfigPanelProps = {
  integration: Integration;
  onClose: () => void;
};

function ConfigPanel({ integration, onClose }: ConfigPanelProps) {
  const { integrationConfigs, saveIntegrationConfig } = useAgencyStore();
  const config = integrationConfigs.find((c) => c.integrationId === integration.id);

  const [model, setModel] = useState(config?.selectedModel ?? "");
  const [workspace, setWorkspace] = useState(config?.workspace ?? "");
  const [accountId, setAccountId] = useState(config?.accountId ?? "");
  const [folder, setFolder] = useState(config?.folder ?? "");
  const [webhookUrl, setWebhookUrl] = useState(config?.webhookUrl ?? "");
  const [savedNow, setSavedNow] = useState(false);

  const AI_MODELS: Record<string, string[]> = {
    "int-openai":        ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    "int-openai-images": ["dall-e-3", "dall-e-2"],
    // Só apelidos móveis: os nomes versionados devolvem 404 (verificado 06/08/2026).
    "int-gemini":        ["gemini-flash-latest", "gemini-pro-latest", "gemini-flash-lite-latest"],
    "int-claude":        ["claude-sonnet-4-6", "claude-opus-4-8", "claude-haiku-4-5"],
    "int-deepseek":      ["deepseek-v4-flash", "deepseek-v4-pro"],
    "int-perplexity":    ["sonar", "sonar-pro", "sonar-reasoning"],
  };
  const modelOptions = AI_MODELS[integration.id] ?? [];

  function handleSave() {
    const patch: Parameters<typeof saveIntegrationConfig>[1] = {
      configured: true,
      configuredManually: true,
    };
    if (model) patch.selectedModel = model;
    if (workspace) patch.workspace = workspace;
    if (accountId) patch.accountId = accountId;
    if (folder) patch.folder = folder;
    if (webhookUrl) patch.webhookUrl = webhookUrl;
    saveIntegrationConfig(integration.id, patch);
    setSavedNow(true);
    setTimeout(onClose, 800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="bg-white rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.15)] w-full max-w-[520px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <div className="text-[14px] font-semibold text-[var(--text-primary)]">Configurar {integration.name}</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{CATEGORY_LABELS[integration.category]}</div>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-[20px] leading-none">×</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Purpose */}
          <div className="bg-[var(--bg-elevated)] rounded-[8px] px-4 py-3 border border-[var(--border)]">
            <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">Finalidade</div>
            <p className="text-[12px] text-[var(--text-primary)]">{integration.purpose}</p>
          </div>

          {/* AI Provider fields */}
          {integration.category === "ai_provider" && (
            <>
              {modelOptions.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1.5">Modelo</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full border border-[var(--border)] rounded-[7px] px-3 py-2 text-[13px] text-[var(--text-primary)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/30"
                  >
                    <option value="">Selecionar modelo…</option>
                    {modelOptions.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}
              {/* API Key placeholder — never stores real keys */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1.5">Chave de API</label>
                <input
                  type="password"
                  disabled
                  placeholder="sk-••••••••••••••• (desabilitado em V1)"
                  className="w-full border border-[var(--border)] rounded-[7px] px-3 py-2 text-[13px] text-[var(--text-subtle)] bg-[var(--bg-elevated)] cursor-not-allowed"
                />
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  🔒 Chaves reais serão armazenadas com segurança quando o backend estiver ativo.
                </p>
              </div>
            </>
          )}

          {/* Design tool fields */}
          {integration.category === "design_tool" && (
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1.5">Workspace / Conta</label>
              <input
                type="text"
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                placeholder="Ex.: minha-agencia ou ID do workspace"
                className="w-full border border-[var(--border)] rounded-[7px] px-3 py-2 text-[13px] text-[var(--text-primary)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/30"
              />
            </div>
          )}

          {/* Ads platform fields */}
          {integration.category === "ads_platform" && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1.5">ID da Conta de Anúncio</label>
                <input
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="Ex.: act_1234567890"
                  className="w-full border border-[var(--border)] rounded-[7px] px-3 py-2 text-[13px] text-[var(--text-primary)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/30"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1.5">Business Account ID</label>
                <input
                  type="text"
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                  placeholder="Ex.: 123456789"
                  className="w-full border border-[var(--border)] rounded-[7px] px-3 py-2 text-[13px] text-[var(--text-primary)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/30"
                />
              </div>
            </>
          )}

          {/* Storage fields */}
          {integration.category === "storage" && (
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1.5">Pasta / Workspace</label>
              <input
                type="text"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="Ex.: /Clientes/DigiAgência ou ID do Drive"
                className="w-full border border-[var(--border)] rounded-[7px] px-3 py-2 text-[13px] text-[var(--text-primary)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/30"
              />
            </div>
          )}

          {/* Automation / publishing fields */}
          {(integration.category === "automation" || integration.category === "publishing" || integration.category === "analytics") && (
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1.5">
                {integration.category === "automation" ? "Webhook URL" : "ID da Conta / Propriedade"}
              </label>
              <input
                type="text"
                value={integration.category === "automation" ? webhookUrl : accountId}
                onChange={(e) => integration.category === "automation"
                  ? setWebhookUrl(e.target.value)
                  : setAccountId(e.target.value)
                }
                placeholder={integration.category === "automation"
                  ? "https://hook.make.com/..."
                  : "Ex.: G-XXXXXXXXXX ou UA-XXXXXXXX"
                }
                className="w-full border border-[var(--border)] rounded-[7px] px-3 py-2 text-[13px] text-[var(--text-primary)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/30"
              />
            </div>
          )}

          {/* Capabilities */}
          <div>
            <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Capacidades</div>
            <ul className="space-y-1">
              {integration.capabilities.map((c) => (
                <li key={c} className="flex items-start gap-1.5 text-[11px] text-[var(--text-primary)]">
                  <span className="text-[var(--success)] shrink-0 mt-0.5">✓</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Agents using it */}
          <div>
            <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Agentes que usam</div>
            <div className="flex flex-wrap gap-1.5">
              {integration.assignedAgents.map((ag) => (
                <span key={ag} className="text-[11px] bg-[var(--accent-light)] text-[var(--navy)] px-2 py-0.5 rounded font-medium">
                  {AGENT_LABELS[ag]}
                </span>
              ))}
            </div>
          </div>

          {/* Limitations */}
          <div>
            <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Limitações V2</div>
            <ul className="space-y-1">
              {integration.limitations.map((l) => (
                <li key={l} className="flex items-start gap-1.5 text-[11px] text-[var(--text-secondary)]">
                  <span className="text-[var(--warning)] shrink-0 mt-0.5">⚠</span>
                  {l}
                </li>
              ))}
            </ul>
          </div>

          {/* Cost */}
          {integration.costHint && (
            <div className="bg-[var(--bg-elevated)] rounded-[8px] px-4 py-3 border border-[var(--border)]">
              <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">Custo estimado</div>
              <div className="text-[12px] text-[var(--text-primary)]">{integration.costHint}</div>
            </div>
          )}

          {/* Security notice */}
          <div className="bg-[#EFF4FF] border border-[#E6EEFF] rounded-[8px] px-4 py-3 flex items-start gap-2">
            <span className="text-[14px] shrink-0">🔒</span>
            <p className="text-[11px] text-[var(--navy)]">
              Chaves reais serão armazenadas com segurança quando o backend estiver ativo.
              Esta configuração é salva localmente como mapeamento operacional.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)]">
          <button onClick={onClose} className="px-4 py-2 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Cancelar
          </button>
          {savedNow ? (
            <span className="px-4 py-2 bg-[var(--success-bg)] text-[var(--success)] rounded-[7px] text-[13px] font-semibold">
              ✓ Salvo!
            </span>
          ) : (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[var(--navy)] text-white rounded-[7px] text-[13px] font-semibold hover:bg-[#0D1230] transition-colors"
            >
              Salvar configuração
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Integration Card V2 ──────────────────────────────────────────────────────

type IntegrationCardProps = {
  integration: Integration;
  onConfigure: () => void;
};

function IntegrationCard({ integration, onConfigure }: IntegrationCardProps) {
  const { integrationConfigs, runIntegrationTest } = useAgencyStore();
  const config = integrationConfigs.find((c) => c.integrationId === integration.id);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [testing, setTesting] = useState(false);

  const statusStyle = STATUS_COLORS[
    config?.configured ? "configured" : integration.status
  ];
  const priorityStyle = PRIORITY_COLORS[integration.priority];

  async function handleTest() {
    setTesting(true);
    await new Promise((r) => setTimeout(r, 600));
    runIntegrationTest(integration.id);
    setTesting(false);
  }

  return (
    <div className="bg-white border border-[var(--border)] rounded-[10px] overflow-hidden">
      {/* Card header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-[var(--text-primary)]">{integration.name}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] ${statusStyle.bg} ${statusStyle.text}`}>
              {config?.configured ? "Configurado" : STATUS_LABELS[integration.status]}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] ${priorityStyle}`}>
              {PRIORITY_LABELS[integration.priority]}
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{integration.purpose}</p>
          <div className="flex flex-wrap gap-1 mt-1.5 items-center">
            {integration.assignedAgents.slice(0, 3).map((ag) => (
              <span key={ag} className="text-[10px] bg-[var(--accent)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded">
                {AGENT_LABELS[ag]}
              </span>
            ))}
            {integration.assignedAgents.length > 3 && (
              <span className="text-[10px] text-[var(--text-muted)]">+{integration.assignedAgents.length - 3}</span>
            )}
            <span className="ml-auto">
              <TestBadge status={config?.lastTestStatus ?? "not_run"} at={config?.lastTestAt} />
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-[var(--border)] bg-[var(--bg-elevated)]">
        <button
          onClick={onConfigure}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--navy)] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#0D1230] transition-colors"
        >
          ⚙ Configurar
        </button>
        <button
          onClick={handleTest}
          disabled={testing}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border)] text-[var(--text-secondary)] text-[12px] font-medium rounded-[6px] hover:bg-[var(--accent)] transition-colors disabled:opacity-50"
        >
          {testing ? "Testando…" : "⚡ Testar conexão"}
        </button>
        <button
          onClick={() => setDetailsOpen((v) => !v)}
          className="ml-auto text-[12px] text-[var(--text-muted)] hover:text-[var(--navy)] transition-colors"
        >
          {detailsOpen ? "Ocultar detalhes ▴" : "Ver detalhes ▾"}
        </button>
      </div>

      {/* Test result message */}
      {config?.lastTestMessage && (
        <div className={`px-4 py-2 text-[11px] border-t ${
          config.lastTestStatus === "pass"
            ? "bg-[#F0FDF4] border-[var(--success-bg)] text-[var(--success)]"
            : "bg-[#FFF5F5] border-[#FEE2E2] text-[var(--danger)]"
        }`}>
          {config.lastTestMessage}
        </div>
      )}

      {/* Expanded details */}
      {detailsOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-[var(--border)] pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Capacidades</div>
              <ul className="space-y-1">
                {integration.capabilities.map((c) => (
                  <li key={c} className="flex items-start gap-1.5 text-[11px] text-[var(--text-primary)]">
                    <span className="text-[var(--success)] shrink-0 mt-0.5">✓</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Limitações V2</div>
              <ul className="space-y-1">
                {integration.limitations.map((l) => (
                  <li key={l} className="flex items-start gap-1.5 text-[11px] text-[var(--text-secondary)]">
                    <span className="text-[var(--warning)] shrink-0 mt-0.5">⚠</span>
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {integration.costHint && (
            <div className="text-[11px] text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-muted)]">Custo: </span>{integration.costHint}
            </div>
          )}
          {config?.selectedModel && (
            <div className="text-[11px] text-[var(--navy)]">
              <span className="font-semibold">Modelo configurado: </span>{config.selectedModel}
            </div>
          )}
          {config?.lastConfiguredAt && (
            <div className="text-[10px] text-[var(--text-muted)]">
              Configurado em {new Date(config.lastConfiguredAt).toLocaleDateString("pt-BR")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const { integrationConfigs } = useAgencyStore();
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory | "all">("all");
  const [configPanelId, setConfigPanelId] = useState<string | null>(null);

  // Compute readiness from live config
  const liveIntegrations = MOCK_INTEGRATIONS.map((i) => {
    const cfg = integrationConfigs.find((c) => c.integrationId === i.id);
    return cfg?.configured ? { ...i, status: "configured" as const } : i;
  });
  const readiness = computeIntegrationReadiness(liveIntegrations);

  // ESTA TELA É DA AGÊNCIA. Só aparecem aqui as ferramentas cuja conta é da
  // Dioli — uma assinatura que serve todos os clientes. Instagram, Google Ads e
  // Analytics são contas DO CLIENTE: conectá-las aqui não teria significado
  // ("Analytics de quem?") e uma conexão global só atenderia um cliente.
  const daAgencia = integracoesDaAgencia(MOCK_INTEGRATIONS);
  const doCliente = integracoesDoCliente(MOCK_INTEGRATIONS);
  const categoriasDaAgencia = CATEGORY_ORDER.filter((cat) => daAgencia.some((i) => i.category === cat));

  const filteredIntegrations =
    activeCategory === "all"
      ? daAgencia
      : daAgencia.filter((i) => i.category === activeCategory);

  const groupedByCategory = categoriasDaAgencia.map((cat) => ({
    category: cat,
    integrations: daAgencia.filter((i) => i.category === cat),
  }));

  const panelIntegration = configPanelId
    ? MOCK_INTEGRATIONS.find((i) => i.id === configPanelId) ?? null
    : null;

  return (
    <div className="max-w-[960px] mx-auto px-6 py-8">
      {/* Header */}
      <AgencyHeader
        title="Ferramentas & Integrações"
        subtitle="Configure provedores de IA por agente, teste conexões e gerencie ferramentas externas."
        meta={
          <span className="text-[11px] bg-[var(--accent)] text-[var(--text-muted)] px-2 py-0.5 rounded font-medium">V2 — Central Operacional</span>
        }
      />

      {/* Readiness Overview */}
      <div className="bg-white border border-[var(--border)] rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 mb-6">
        <div className="flex items-start gap-8 flex-wrap">
          <ReadinessRing score={readiness.score} />
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center">
              <div className="text-[22px] font-bold text-[var(--navy)] mono-num">{readiness.configuredCount}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Configurados</div>
            </div>
            <div className="text-center">
              <div className="text-[22px] font-bold text-[#0891B2] mono-num">{readiness.availableCount}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-[22px] font-bold text-[var(--text-muted)] mono-num">{readiness.plannedCount}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Planejados</div>
            </div>
            <div className="text-center">
              <div className="text-[22px] font-bold text-[var(--warning)] mono-num">{readiness.unavailableCount}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Indisponíveis</div>
            </div>
          </div>
          <div className="flex-1 min-w-[200px] bg-[var(--bg-elevated)] rounded-[8px] px-4 py-3 border border-[var(--border)]">
            <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">Próxima prioridade</div>
            <div className="text-[12px] text-[var(--text-primary)]">{readiness.topMissing}</div>
          </div>
        </div>
        {readiness.usableToday.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Disponível hoje</div>
            <div className="flex flex-wrap gap-1.5">
              {readiness.usableToday.map((name) => (
                <span key={name} className="text-[11px] bg-[var(--success-bg)] text-[var(--success)] px-2 py-0.5 rounded font-medium">
                  ✓ {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Real AI key connection — paste, test, done */}
      <AiKeyManager />

      {/* As ferramentas DO CLIENTE — não se conectam aqui, e a tela precisa dizer
          isso. Some-las sem explicação faria parecer que a função foi perdida. */}
      <div className="bg-white border border-[var(--border)] rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden mb-6">
        <div className="px-5 py-3.5 border-b border-[var(--border)]">
          <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">Ferramentas do cliente</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {doCliente.length} integrações · a conta é <strong>de cada cliente</strong>, não da agência — conectam-se no painel dele
          </p>
        </div>
        <div className="p-4">
          <div className="mb-3 rounded-[8px] border border-[var(--border)] bg-[var(--accent)] px-3.5 py-2.5">
            <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
              Estas não aparecem para conectar aqui de propósito. Não existe &ldquo;o Google Analytics da
              agência&rdquo; — existe o do <em>Sushi Cazza</em> e o da <em>Beatriz</em>. Uma conexão só
              atenderia um cliente, e a autorização de acessar as contas dele é dele, não nossa.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {doCliente.map((int) => (
              <div
                key={int.id}
                className="flex items-center justify-between gap-3 rounded-[8px] border border-[var(--border)] px-3.5 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <CategoryIcon cat={int.category} />
                    <span className="text-[13px] font-medium text-[var(--text-primary)]">{int.name}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">{int.purpose}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[10.5px] font-medium text-[var(--text-secondary)]">
                  no painel do cliente
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meta (Instagram / Facebook / WhatsApp) — connect real accounts via OAuth */}
      <MetaConnectManager />

      {/* A escolha que MANDA de verdade: provedor de IA por cliente.
          Substituiu a seção "IAs dos Agentes", que gravava e ninguém lia. */}
      <ProvedorPorCliente />

      {/* O leitor do AIRunLog — o primeiro número real de gasto com IA. */}
      <GastoDeIa />

      {/* Integration Cards */}
      <div className="bg-white border border-[var(--border)] rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden mb-6">
        <div className="px-5 py-3.5 border-b border-[var(--border)]">
          <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">Ferramentas da agência</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {daAgencia.length} integrações · contas da Dioli, uma assinatura que serve todos os clientes
          </p>
        </div>

        {/* Category filter tabs */}
        <div className="flex items-center gap-1 px-4 py-3 border-b border-[var(--border)] overflow-x-auto">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors ${
              activeCategory === "all" ? "bg-[var(--text-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--accent)]"
            }`}
          >
            Todos ({daAgencia.length})
          </button>
          {categoriasDaAgencia.map((cat) => {
            const count = daAgencia.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors ${
                  activeCategory === cat ? "bg-[var(--text-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--accent)]"
                }`}
              >
                <CategoryIcon cat={cat} />
                {CATEGORY_LABELS[cat]} ({count})
              </button>
            );
          })}
        </div>

        <div className="p-4">
          {activeCategory === "all" ? (
            <div className="space-y-6">
              {groupedByCategory.map(({ category, integrations }) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <CategoryIcon cat={category} />
                    <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">{CATEGORY_LABELS[category]}</h3>
                    <span className="text-[11px] text-[var(--text-muted)]">({integrations.length})</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {integrations.map((int) => (
                      <IntegrationCard
                        key={int.id}
                        integration={int}
                        onConfigure={() => setConfigPanelId(int.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {filteredIntegrations.map((int) => (
                <IntegrationCard
                  key={int.id}
                  integration={int}
                  onConfigure={() => setConfigPanelId(int.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security notice */}
      <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-[10px] px-5 py-4 flex items-start gap-3">
        <span className="text-[16px] shrink-0">🔒</span>
        <div>
          <div className="text-[13px] font-semibold text-[var(--success)]">Suas chaves estão seguras</div>
          <p className="text-[12px] text-[var(--text-secondary)] mt-1">
            As chaves de IA são criptografadas (AES-256) antes de serem guardadas e nunca aparecem de volta na tela —
            só mostramos uma dica (ex.: <span className="font-mono">sk-ant-…a1b2</span>). Conecte na seção
            &ldquo;Conectar Inteligências Artificiais&rdquo; acima. Para reforço extra em produção, defina a variável
            <span className="font-mono"> CREDENTIALS_SECRET</span> no Railway.
          </p>
          <Link href="/agency/settings" className="text-[12px] text-[var(--success)] font-medium hover:underline mt-1 inline-block">
            Ver diagnóstico completo em Saúde do Sistema →
          </Link>
        </div>
      </div>

      {/* Config Panel modal */}
      {panelIntegration && (
        <ConfigPanel
          integration={panelIntegration}
          onClose={() => setConfigPanelId(null)}
        />
      )}
    </div>
  );
}
