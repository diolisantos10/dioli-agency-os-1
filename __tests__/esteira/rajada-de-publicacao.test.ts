// A RAJADA — seis peças no mesmo minuto, no perfil de um cliente.
//
// O cenário é o do CityJobs, medido: 6 peças em `scheduled` com data JÁ
// VENCIDA, `MAX_PUBLICACOES_POR_RODADA = 10`, e o relógio batendo de 5 em 5
// minutos. No instante em que o freio de plataforma for solto, as 6 sairiam
// juntas — e ninguém pediu isso.
//
// O que este arquivo prende:
//   ⛔ seis peças vencidas do MESMO perfil não saem na mesma rodada;
//   ✅ e as que ficaram aparecem em `adiados`, com motivo — fila parada tem
//      testemunha, e adiado NÃO vira `lastError` vermelho na ficha da peça;
//   ✅ perfis diferentes não se atrapalham (o freio é POR PERFIL);
//   ✅ a publicação manual, registrada à mão, também segura o relógio;
//   ⛔ não conseguir MEDIR a última publicação não vira permissão (fail-closed);
//   ⛔ nada aqui mexe no freio de plataforma (`PUBLICACAO_ORGANICA`).

import { describe, it, expect, beforeEach, vi } from "vitest";

const db = vi.hoisted(() => ({
  project: { findUnique: vi.fn() },
  deliverable: { findMany: vi.fn() },
  socialPost: { findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  activityEvent: { create: vi.fn() },
  mediaAsset: { findMany: vi.fn() },
}));
const publishPost = vi.hoisted(() => vi.fn());
const conexaoDoCliente = vi.hoisted(() => vi.fn());
const contratoDeMarca = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/client", () => ({ prisma: db }));
vi.mock("@/lib/integrations/meta/client", () => ({ publishPost }));
vi.mock("@/lib/integrations/meta/connections", () => ({ conexaoDoCliente }));
vi.mock("@/lib/agency/esteira/contrato-de-marca", () => ({ contratoDeMarca }));
vi.mock("@/lib/agency/media/armazenamento", () => ({
  caminhoPublicoAssinado: (id: string) => `/api/media/${id}?exp=1&sig=abc`,
}));

import {
  publicarAgendados, faltaEsperar, INTERVALO_MINIMO_POR_PERFIL_MS,
} from "@/lib/agency/esteira/publicacao";

const ONTEM = new Date(Date.now() - 24 * 60 * 60_000);

/** As 6 do CityJobs: mesmo cliente, todas vencidas, todas prontas. */
function seisVencidasDoMesmoPerfil() {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `sp${i + 1}`, workspaceId: "ws1", clientId: "cityjobs",
    caption: `Peça ${i + 1}`, format: "feed", pillar: null,
    mediaUrl: "/api/media/m1", mediaUrlsJson: "[]",
    scheduledFor: new Date(ONTEM.getTime() + i * 60_000), status: "scheduled", lastError: null,
  }));
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.PUBLIC_BASE_URL = "https://app.dioli.studio";
  contratoDeMarca.mockResolvedValue({ texto: "x", marcaVersao: "mv1", lacunas: [], cortado: [], naoConstituida: false });
  conexaoDoCliente.mockResolvedValue({ id: "mc1", status: "connected" });
  db.mediaAsset.findMany.mockImplementation(async (args?: { where?: { id?: { in?: string[] } } }) =>
    (args?.where?.id?.in ?? []).map((id) => ({ id, mimeType: "image/jpeg" })));
  db.socialPost.findMany.mockResolvedValue(seisVencidasDoMesmoPerfil());
  // Nunca publicou antes: a primeira peça pode ir.
  db.socialPost.findFirst.mockResolvedValue(null);
  // A confirmação de estado, na hora, antes de publicar: nenhuma das 6 mudou
  // de ideia durante a rodada — a régua da rajada é sobre ESPAÇAMENTO, não
  // sobre cancelamento no meio do caminho.
  db.socialPost.findUnique.mockResolvedValue({ status: "scheduled" });
  db.socialPost.update.mockResolvedValue({});
  db.activityEvent.create.mockResolvedValue({});
  publishPost.mockResolvedValue({ ok: true, externalPostId: "ig1", permalink: "https://i/p/1" });
});

describe("a régua do espaçamento", () => {
  it("perfil que nunca publicou não espera nada", () => {
    expect(faltaEsperar(null, new Date())).toBe(0);
  });

  it("publicou agora: espera quase o intervalo inteiro", () => {
    const agora = new Date("2026-08-15T12:00:00Z");
    expect(faltaEsperar(agora, agora)).toBe(INTERVALO_MINIMO_POR_PERFIL_MS);
  });

  it("passou o intervalo: libera", () => {
    const agora = new Date("2026-08-15T12:00:00Z");
    const antes = new Date(agora.getTime() - INTERVALO_MINIMO_POR_PERFIL_MS);
    expect(faltaEsperar(antes, agora)).toBe(0);
  });

  it("data de publicação NO FUTURO (relógio torto) erra para o lado seguro", () => {
    const agora = new Date("2026-08-15T12:00:00Z");
    const depois = new Date(agora.getTime() + 60 * 60_000);
    expect(faltaEsperar(depois, agora)).toBe(INTERVALO_MINIMO_POR_PERFIL_MS);
  });

  it("o intervalo é MENOR que as 24h que o calendário já garante — o freio não vira dono da agenda", () => {
    expect(INTERVALO_MINIMO_POR_PERFIL_MS).toBeLessThan(24 * 60 * 60_000);
    expect(INTERVALO_MINIMO_POR_PERFIL_MS).toBeGreaterThan(30 * 60_000);
  });
});

describe("a rodada", () => {
  it("as 6 vencidas do mesmo perfil NÃO saem juntas — uma sai, cinco esperam", async () => {
    const r = await publicarAgendados();
    expect(r.publicados).toBe(1);
    expect(publishPost).toHaveBeenCalledTimes(1);
    expect(r.adiados).toHaveLength(5);
    expect(r.falhas).toHaveLength(0);
  });

  it("a que saiu é a MAIS ANTIGA — a fila não vira sorteio", async () => {
    await publicarAgendados();
    expect(db.socialPost.update.mock.calls[0]![0].where.id).toBe("sp1");
  });

  it("adiar NÃO pinta a ficha da peça de vermelho", async () => {
    const r = await publicarAgendados();
    // Nenhum `lastError` gravado, nenhum evento de falha: adiado não é falha.
    const escritas = db.socialPost.update.mock.calls.map((c) => c[0].data);
    expect(escritas.filter((d: Record<string, unknown>) => "lastError" in d && d.lastError)).toHaveLength(0);
    const eventos = db.activityEvent.create.mock.calls.map((c) => c[0].data.type);
    expect(eventos).not.toContain("publicacao_falhou");
    // Mas o motivo existe e é legível.
    expect(r.adiados[0]!.motivo).toMatch(/perfil|rajada/i);
  });

  it("perfis diferentes não se atrapalham — o freio é POR PERFIL", async () => {
    db.socialPost.findMany.mockResolvedValue([
      { ...seisVencidasDoMesmoPerfil()[0]!, id: "a1", clientId: "cliA" },
      { ...seisVencidasDoMesmoPerfil()[0]!, id: "b1", clientId: "cliB" },
      { ...seisVencidasDoMesmoPerfil()[0]!, id: "a2", clientId: "cliA" },
    ]);
    const r = await publicarAgendados();
    expect(r.publicados).toBe(2);
    expect(r.adiados.map((a) => a.postId)).toEqual(["a2"]);
  });

  it("publicação de HOJE já no banco segura a próxima — inclusive a registrada à mão", async () => {
    // É o caso real do CityJobs: o CEO posta o carrossel com as próprias mãos,
    // registra, e o relógio não pode despejar a peça seguinte em cima.
    db.socialPost.findFirst.mockResolvedValue({ publishedAt: new Date(Date.now() - 10 * 60_000) });
    const r = await publicarAgendados();
    expect(r.publicados).toBe(0);
    expect(publishPost).not.toHaveBeenCalled();
    expect(r.adiados).toHaveLength(6);
    // E a medida é feita UMA vez por perfil, não seis.
    expect(db.socialPost.findFirst).toHaveBeenCalledTimes(1);
  });

  it("a medida procura publicação DE VERDADE, não peça agendada", async () => {
    await publicarAgendados();
    const where = db.socialPost.findFirst.mock.calls[0]![0].where;
    expect(where.clientId).toBe("cityjobs");
    expect(where.status).toBe("published");
  });

  it("não conseguir medir não vira permissão — fail-closed", async () => {
    db.socialPost.findFirst.mockRejectedValue(new Error("db down"));
    const r = await publicarAgendados();
    expect(r.publicados).toBe(0);
    expect(publishPost).not.toHaveBeenCalled();
    expect(r.adiados[0]!.motivo).toContain("não consegui medir");
  });

  it("o freio corre ANTES de qualquer preparo — não gasta trabalho para jogar fora", async () => {
    db.socialPost.findFirst.mockResolvedValue({ publishedAt: new Date() });
    await publicarAgendados();
    expect(contratoDeMarca).not.toHaveBeenCalled();
    expect(conexaoDoCliente).not.toHaveBeenCalled();
    expect(db.mediaAsset.findMany).not.toHaveBeenCalled();
  });

  it("quem publica pelo relógio fica marcado como `esteira`", async () => {
    await publicarAgendados();
    expect(db.socialPost.update.mock.calls[0]![0].data.publishedBy).toBe("esteira");
  });
});
