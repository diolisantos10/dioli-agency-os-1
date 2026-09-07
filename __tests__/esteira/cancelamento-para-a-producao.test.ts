// CANCELAR PARA A PRODUÇÃO — inclusive o que já está EM VOO.
//
// Ordem do CEO, 29/08/2026: "Ache TODO caminho que produz peça e prove que o
// cancelamento alcança os que já estão em voo — não só os que ainda não
// começaram."
//
// A rodada de publicação (`publicarAgendados`) tira uma FOTOGRAFIA do banco no
// início (`findMany`) e depois publica até 10 peças, uma de cada vez, cada uma
// com upload de mídia e chamada à Meta — segundos a minutos de trabalho. Se o
// cliente CANCELAR uma dessas peças nesse intervalo, o `post` que o laço segura
// na mão ainda diz "scheduled": foi assim que ele chegou. Sem reconferir, a
// peça vai ao ar do mesmo jeito — publicação em nome do cliente depois que ele
// já disse não.
//
// Este arquivo prende as DUAS metades da última porta:
//   ⛔ a peça que mudou de estado ENTRE a fotografia e a publicação NÃO é
//      publicada — mesmo continuando "encontrável" no array `pendentes`;
//   ✅ e isso NÃO é tratado como falha (`lastError` fica limpo, sem
//      `activityEvent` de "publicacao_falhou") — decisão do cliente não é erro;
//   ⛔ não conseguir CONFIRMAR o estado também não publica — fail-closed.

import { describe, it, expect, beforeEach, vi } from "vitest";

const db = vi.hoisted(() => ({
  socialPost: { findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
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

import { publicarAgendados, ESTADO_QUE_A_FILA_LE } from "@/lib/agency/esteira/publicacao";

const AGORA_JA_PASSOU = new Date(Date.now() - 60_000);

/** A fotografia que `publicarAgendados` tira no início da rodada: a peça
 *  ainda "scheduled", porque foi assim que a consulta a encontrou. */
function pecaNaFotografia(over: Record<string, unknown> = {}) {
  return {
    id: "sp1", workspaceId: "ws1", clientId: "c1",
    caption: "Saiu do forno agora.", format: "feed", pillar: null,
    mediaUrl: "/api/media/m1", mediaUrlsJson: "[]",
    scheduledFor: AGORA_JA_PASSOU, status: ESTADO_QUE_A_FILA_LE, lastError: null,
    ...over,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.PUBLIC_BASE_URL = "https://app.dioli.studio";
  contratoDeMarca.mockResolvedValue({ texto: "x", marcaVersao: "mv1", lacunas: [], cortado: [], naoConstituida: false });
  conexaoDoCliente.mockResolvedValue({ id: "mc1", status: "connected" });
  db.mediaAsset.findMany.mockImplementation(async (args?: { where?: { id?: { in?: string[] } } }) =>
    (args?.where?.id?.in ?? []).map((id) => ({ id, mimeType: "image/jpeg" })));
  db.socialPost.findMany.mockResolvedValue([pecaNaFotografia()]);
  db.socialPost.findFirst.mockResolvedValue(null); // nunca publicou antes neste perfil
  db.socialPost.update.mockResolvedValue({});
  db.activityEvent.create.mockResolvedValue({});
  publishPost.mockResolvedValue({ ok: true, externalPostId: "ig1", permalink: "https://i/p/1" });
});

describe("a peça cancelada NO MEIO DA RODADA não vai ao ar", () => {
  it("cliente cancelou entre a fotografia e a publicação → publishPost NUNCA é chamado", async () => {
    db.socialPost.findUnique.mockResolvedValue({ status: "cancelled" });
    const r = await publicarAgendados();
    expect(publishPost).not.toHaveBeenCalled();
    expect(r.publicados).toBe(0);
  });

  it("a peça cancelada vai para 'adiados', com o motivo — não é silêncio", async () => {
    db.socialPost.findUnique.mockResolvedValue({ status: "cancelled" });
    const r = await publicarAgendados();
    expect(r.adiados).toHaveLength(1);
    expect(r.adiados[0]!.postId).toBe("sp1");
    expect(r.adiados[0]!.motivo).toMatch(/scheduled/);
  });

  it("mesma coisa para RECUSA — 'rejected' no meio da rodada também segura a peça", async () => {
    db.socialPost.findUnique.mockResolvedValue({ status: "rejected" });
    const r = await publicarAgendados();
    expect(publishPost).not.toHaveBeenCalled();
    expect(r.adiados).toHaveLength(1);
  });

  it("decisão do cliente NÃO é falha — nenhum lastError, nenhum evento de falha", async () => {
    db.socialPost.findUnique.mockResolvedValue({ status: "cancelled" });
    const r = await publicarAgendados();
    expect(r.falhas).toHaveLength(0);
    expect(db.socialPost.update).not.toHaveBeenCalled();
    const eventos = db.activityEvent.create.mock.calls.map((c) => (c[0] as { data: { type: string } }).data.type);
    expect(eventos).not.toContain("publicacao_falhou");
  });

  it("não conseguir CONFIRMAR o estado também não publica — fail-closed, como o resto da rodada", async () => {
    db.socialPost.findUnique.mockRejectedValue(new Error("db down"));
    const r = await publicarAgendados();
    expect(publishPost).not.toHaveBeenCalled();
    expect(r.adiados[0]!.motivo).toMatch(/não consegui confirmar/);
  });

  it("peça removida entre a fotografia e a publicação (findUnique → null) também não publica", async () => {
    db.socialPost.findUnique.mockResolvedValue(null);
    const r = await publicarAgendados();
    expect(publishPost).not.toHaveBeenCalled();
    expect(r.adiados[0]!.motivo).toMatch(/peça removida/);
  });

  it("O CASO FELIZ: a peça continua 'scheduled' na hora de publicar → publica normalmente", async () => {
    db.socialPost.findUnique.mockResolvedValue({ status: "scheduled" });
    const r = await publicarAgendados();
    expect(publishPost).toHaveBeenCalledOnce();
    expect(r.publicados).toBe(1);
  });

  it("a reconfirmação é POR PEÇA — o id certo é consultado, não um id fixo", async () => {
    db.socialPost.findUnique.mockResolvedValue({ status: "scheduled" });
    await publicarAgendados();
    expect(db.socialPost.findUnique).toHaveBeenCalledWith({
      where: { id: "sp1" }, select: { status: true },
    });
  });
});
