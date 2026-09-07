import { describe, it, expect, beforeEach, vi } from "vitest";

const db = vi.hoisted(() => ({
  marketInsight: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() },
}));
vi.mock("@/lib/db/client", () => ({ prisma: db }));

import { addInsight, approveInsight, getActiveInsights, buildInsightBlock } from "@/lib/agency/radar/library";

beforeEach(() => {
  vi.clearAllMocks();
  db.marketInsight.updateMany.mockResolvedValue({ count: 0 });
  db.marketInsight.update.mockResolvedValue({});
  db.marketInsight.updateMany.mockResolvedValue({ count: 1 });
  db.marketInsight.create.mockImplementation(async ({ data }: { data: { status: string } }) => ({ id: "i1", status: data.status }));
});

describe("Radar Dioli — biblioteca (governança oficial vs tendência)", () => {
  // ⚠️ REGRA MUDADA EM 05/08/2026 — este teste afirmava o contrário.
  //
  // Ele checava que `source: "official"` bastava para entrar ATIVO na hora. Só
  // que quem chamava com `official` era o `scanSource`, e o texto que ele passa
  // é escrito por um MODELO lendo o feed — não pela plataforma. "Fonte
  // confiável" nunca foi prova de "extração correta", e a diferença importa
  // porque esse texto vira diretriz de todos os especialistas E régua do
  // auditor de qualidade. Agora `extraction` responde pelo texto, e só a
  // conjunção ativa.
  it("fonte OFICIAL com texto NÃO conferido entra PENDENTE — 'official' não atesta a extração", async () => {
    const r = await addInsight({ workspaceId: "ws1", domain: "social", topic: "ig-algo", title: "Novo ranking IG", guidance: "priorizar reels de até 30s", source: "official", sourceName: "Meta" });
    expect(r.status).toBe("pending");
    // não arquiva o tópico vigente: nada entrou em vigor
    expect(db.marketInsight.updateMany).not.toHaveBeenCalled();
    expect(db.marketInsight.create.mock.calls[0][0].data.approvedBy).toBeNull();
  });

  it("fonte OFICIAL com extração LITERAL entra ATIVA na hora e supersede o tópico", async () => {
    const r = await addInsight({ workspaceId: "ws1", domain: "social", topic: "ig-algo", title: "Novo ranking IG", guidance: "priorizar reels de até 30s", source: "official", extraction: "literal_da_fonte", sourceName: "Meta" });
    expect(r.status).toBe("active");
    // arquivou o tópico ativo anterior (versionamento)
    expect(db.marketInsight.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ topic: "ig-algo", status: "active" }) }));
    const created = db.marketInsight.create.mock.calls[0][0].data;
    expect(created.status).toBe("active");
    expect(created.approvedBy).toBe("official-source");
  });

  it("TENDÊNCIA não-oficial entra PENDENTE (aguarda validação humana)", async () => {
    const r = await addInsight({ workspaceId: "ws1", domain: "social", topic: "trend-x", title: "Formato viral", guidance: "carrossel com gancho no 1º slide", source: "trend" });
    expect(r.status).toBe("pending");
    const created = db.marketInsight.create.mock.calls[0][0].data;
    expect(created.approvedAt).toBeNull();
    // não arquiva nada até ser aprovada
    expect(db.marketInsight.updateMany).not.toHaveBeenCalled();
  });

  it("aprovar tendência pendente → entra em vigor e supersede o tópico", async () => {
    db.marketInsight.findFirst.mockResolvedValue({ workspaceId: "ws1", topic: "trend-x", status: "pending" });
    const ok = await approveInsight("i1", "diego", "ws-1");
    expect(ok).toBe(true);
    expect(db.marketInsight.updateMany).toHaveBeenCalled(); // arquivou o tópico
    expect(db.marketInsight.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "active", approvedBy: "diego" }) }));
  });

  it("getActiveInsights busca ativos do domínio + general", async () => {
    db.marketInsight.findMany.mockResolvedValue([{ title: "T", guidance: "G", source: "official", sourceName: "Meta" }]);
    await getActiveInsights("ws1", "design");
    expect(db.marketInsight.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ status: "active", domain: { in: ["design", "general"] } }),
    }));
  });

  it("buildInsightBlock marca OFICIAL vs tendência", () => {
    const block = buildInsightBlock([
      { title: "Ranking IG", guidance: "reels curtos", source: "official", sourceName: "Meta" },
      { title: "Gancho", guidance: "1º slide forte", source: "trend", sourceName: null },
    ]);
    expect(block).toMatch(/OFICIAL \(Meta\)/);
    expect(block).toMatch(/tendência/);
    expect(block).toContain("RADAR DIOLI");
  });
});
