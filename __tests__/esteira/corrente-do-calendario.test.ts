// A CORRENTE DO CALENDÁRIO, ANDADA ATÉ O FIM (05/08/2026).
//
// Cada peça tinha teste próprio e todos passavam. O que ninguém tinha andado
// eram as JUNTAS — e era exatamente lá que a esteira arrebentava:
//
//   1. O cliente aprovava o card e o post virava `status: "approved"`.
//      `publicarAgendados` só busca `"scheduled"`. NADA no repositório inteiro
//      movia `approved → scheduled`. O portal escrevia "Aprovado por você" e
//      nenhum post ia ao ar — nunca, e sem ninguém ser avisado.
//
//   2. `aprovarCalendario` era chamado só por `aprovarPacote`, que aborta de
//      saída se `clientApprovedAt` já existe. Do mês 2 em diante o cliente lia
//      "Aprove e a gente já agenda as publicações" (mes.ts), aprovava, e o mês
//      inteiro ficava em rascunho. Todo mês. Receita recorrente sem entrega.
//
// Estes testes não conferem "o estado foi gravado". Eles conferem que o estado
// gravado é ENCONTRADO pela etapa seguinte — que é a única coisa que impede a
// próxima divergência.

import { describe, it, expect, beforeEach, vi } from "vitest";

const db = vi.hoisted(() => ({
  project: { findUnique: vi.fn() },
  cycle: { findUnique: vi.fn(), findFirst: vi.fn() },
  deliverable: { findMany: vi.fn() },
  socialPost: { findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  activityEvent: { create: vi.fn() },
  // 08/08/2026: a publicação confere o MIME antes de falar com a Meta (só
  // JPEG). Ver `lib/integrations/meta/formato-de-midia.ts`.
  mediaAsset: { findMany: vi.fn() },
}));

/** Caso limpo: toda mídia existe e é JPEG. Estes testes são sobre as JUNTAS da
 *  corrente, não sobre formato de arquivo (que tem teste próprio). */
const midiaTodaJpeg = async (args?: { where?: { id?: { in?: string[] } } }) =>
  (args?.where?.id?.in ?? []).map((id) => ({ id, mimeType: "image/jpeg" }));
const publishPost = vi.hoisted(() => vi.fn());
const conexaoDoCliente = vi.hoisted(() => vi.fn());
// 09/08/2026: a entrega passou a consultar a régua de marca antes de publicar
// (`lib/agency/esteira/contrato-de-marca.ts`). Estes testes são sobre O RELÓGIO,
// então o caso limpo é uma marca constituída; o portão tem teste próprio.
const contratoDeMarca = vi.hoisted(() => vi.fn());
vi.mock("@/lib/agency/esteira/contrato-de-marca", () => ({ contratoDeMarca }));
vi.mock("@/lib/db/client", () => ({ prisma: db }));
vi.mock("@/lib/integrations/meta/client", () => ({ publishPost }));
vi.mock("@/lib/integrations/meta/connections", () => ({ conexaoDoCliente }));
vi.mock("@/lib/agency/media/armazenamento", () => ({
  caminhoPublicoAssinado: (id: string) => `/api/media/${id}?exp=1&sig=abc`,
}));

import {
  agendarPecasAprovadas,
  aprovarCalendario,
  aprovarCalendarioDoCiclo,
  aprovarCalendarioDoCicloCorrente,
  publicarAgendados,
} from "@/lib/agency/esteira/publicacao";

/** O banco, de mentira, mas com a REGRA de verdade: `update` grava e `findMany`
 *  filtra por status e data — que é o que torna a junta testável. */
const banco = new Map<string, { id: string; status: string; scheduledFor: Date | null }>();

function semear(ids: string[], status: string, quando: (i: number) => Date | null) {
  banco.clear();
  ids.forEach((id, i) => banco.set(id, { id, status, scheduledFor: quando(i) }));
}

/** O que `publicarAgendados` procura, aplicado ao banco de mentira. */
function oRelogioEncontra(agora: Date) {
  return [...banco.values()].filter(
    (p) => p.status === "scheduled" && p.scheduledFor != null && p.scheduledFor <= agora,
  );
}

const ONTEM = new Date(Date.now() - 24 * 60 * 60_000);
const SEIS = ["sp1", "sp2", "sp3", "sp4", "sp5", "sp6"];

beforeEach(() => {
  contratoDeMarca.mockResolvedValue({
    texto: "QUEM É\nMarca: Cliente", marcaVersao: "mv_teste0001",
    lacunas: [], cortado: [], naoConstituida: false,
  });
  vi.clearAllMocks();
  db.mediaAsset.findMany.mockImplementation(midiaTodaJpeg);
  banco.clear();
  // O filtro de STATUS é aplicado de verdade: é ele que torna a promoção
  // idempotente, e um mock que ignorasse o `where` esconderia justamente isso.
  db.socialPost.findMany.mockImplementation(async (args?: { where?: { status?: string | { in: string[] } } }) => {
    const filtro = args?.where?.status;
    return [...banco.values()].filter((p) =>
      filtro == null ? true
      : typeof filtro === "string" ? p.status === filtro
      : filtro.in.includes(p.status),
    );
  });
  db.socialPost.update.mockImplementation(async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
    const p = banco.get(where.id);
    if (p) Object.assign(p, data);
    return p;
  });
  // A confirmação de estado, na hora, antes de publicar: lê do MESMO banco de
  // mentira que `update` escreve — se uma junta anterior já mudou o status,
  // esta leitura enxerga a mudança de verdade, em vez de uma fotografia presa.
  db.socialPost.findUnique.mockImplementation(async ({ where }: { where: { id: string } }) => {
    const p = banco.get(where.id);
    return p ? { status: p.status } : null;
  });
  db.socialPost.findFirst.mockResolvedValue(null);
  db.activityEvent.create.mockResolvedValue({});
});

// ── 1. O CARD APROVADO CHEGA AO RELÓGIO ────────────────────────────────────

describe("o cliente aprova o card → o relógio ENCONTRA a peça", () => {
  it("aprovar promove as 6 peças a 'scheduled' — e nenhuma fica em 'approved'", async () => {
    semear(SEIS, "draft", (i) => new Date(Date.now() + (i + 3) * 24 * 60 * 60_000));
    const r = await agendarPecasAprovadas({ clientId: "cli-foocci", postIds: SEIS });

    expect(r.agendados).toBe(6);
    expect([...banco.values()].every((p) => p.status === "scheduled")).toBe(true);
    expect([...banco.values()].some((p) => p.status === "approved")).toBe(false);
  });

  it("A JUNTA: o estado gravado é o que `publicarAgendados` procura", async () => {
    // O beco sem saída em uma linha: com "approved", este número era ZERO para
    // sempre — e ninguém ficava sabendo.
    semear(SEIS, "draft", () => ONTEM);
    await agendarPecasAprovadas({ clientId: "cli-foocci", postIds: SEIS });

    const daquiUmaSemana = new Date(Date.now() + 7 * 24 * 60 * 60_000);
    expect(oRelogioEncontra(daquiUmaSemana)).toHaveLength(6);
  });

  it("data que venceu enquanto o cliente pensava é EMPURRADA — nunca 6 posts de uma vez", async () => {
    semear(SEIS, "draft", () => ONTEM);
    await agendarPecasAprovadas({ clientId: "cli-foocci", postIds: SEIS });

    // Nada vai ao ar no instante da aprovação.
    expect(oRelogioEncontra(new Date())).toHaveLength(0);
    // E os empurrados ficam com pelo menos um dia entre si.
    const datas = [...banco.values()].map((p) => p.scheduledFor!.getTime()).sort((a, b) => a - b);
    for (let i = 1; i < datas.length; i++) {
      expect(datas[i]! - datas[i - 1]!).toBeGreaterThanOrEqual(24 * 60 * 60_000);
    }
  });

  it("peça em 'approved' de antes do conserto é RESGATADA pela mesma porta", async () => {
    // Não é um segundo caminho de publicação: é a promoção reconhecendo o
    // estado em que peça paga ficou presa.
    semear(SEIS, "approved", (i) => new Date(Date.now() + (i + 2) * 24 * 60 * 60_000));
    const r = await agendarPecasAprovadas({ clientId: "cli-foocci", postIds: SEIS });
    expect(r.agendados).toBe(6);
    expect(oRelogioEncontra(new Date(Date.now() + 30 * 24 * 60 * 60_000))).toHaveLength(6);
  });

  it("peça que o cliente mandou ajustar NÃO é agendada de carona — e o desvio é visível", async () => {
    semear(SEIS, "draft", (i) => new Date(Date.now() + (i + 2) * 24 * 60 * 60_000));
    banco.get("sp3")!.status = "revision_requested";

    const r = await agendarPecasAprovadas({ clientId: "cli-foocci", postIds: SEIS });
    expect(r.agendados).toBe(5);
    expect(banco.get("sp3")!.status).toBe("revision_requested");
    // Trabalho que não andou não some em silêncio.
    expect(r.ignorados).toEqual([{ postId: "sp3", status: "revision_requested" }]);
  });

  it("peça já publicada não é reagendada", async () => {
    semear(SEIS, "published", () => ONTEM);
    const r = await agendarPecasAprovadas({ clientId: "cli-foocci", postIds: SEIS });
    expect(r.agendados).toBe(0);
    expect(db.socialPost.update).not.toHaveBeenCalled();
  });

  it("a busca é FILTRADA pelo dono do card — id de post alheio no JSON não é tocado", async () => {
    semear(SEIS, "draft", () => null);
    await agendarPecasAprovadas({ clientId: "cli-foocci", postIds: SEIS });
    expect(db.socialPost.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: { in: SEIS }, clientId: "cli-foocci" },
    }));
  });

  it("sem dono não agenda nada — nem consulta o banco", async () => {
    await agendarPecasAprovadas({ clientId: "", postIds: SEIS });
    expect(db.socialPost.findMany).not.toHaveBeenCalled();
  });
});

// ── 2. O MÊS 2 EM DIANTE ───────────────────────────────────────────────────

describe("o calendário do CICLO vale sem passar por aprovarPacote", () => {
  beforeEach(() => {
    db.cycle.findUnique.mockResolvedValue({ id: "cy2", projectId: "p1", presentedAt: new Date("2026-09-01") });
    db.cycle.findFirst.mockResolvedValue({ id: "cy2" });
    db.deliverable.findMany.mockResolvedValue([{ id: "d-set" }]);
  });

  it("aprovar o mês 2 agenda o mês 2 — mesmo com o projeto já aprovado há meses", async () => {
    semear(["sp-set-1", "sp-set-2"], "draft", (i) => new Date(Date.now() + (i + 4) * 24 * 60 * 60_000));
    const r = await aprovarCalendarioDoCiclo("p1", "cy2");

    expect(r.agendados).toBe(2);
    expect(oRelogioEncontra(new Date(Date.now() + 30 * 24 * 60 * 60_000))).toHaveLength(2);
  });

  it("o recorte é POR CICLO: só as peças das entregas daquele mês", async () => {
    semear(["sp-set-1"], "draft", () => null);
    await aprovarCalendarioDoCiclo("p1", "cy2");
    // O mês 3, que ainda nem foi apresentado, não entra de carona.
    expect(db.socialPost.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ deliverableId: { in: ["d-set"] } }),
    }));
  });

  it("ciclo NÃO apresentado não agenda nada — o cliente não consente com o que não viu", async () => {
    db.cycle.findUnique.mockResolvedValue({ id: "cy3", projectId: "p1", presentedAt: null });
    semear(["sp-out-1"], "draft", () => null);
    const r = await aprovarCalendarioDoCiclo("p1", "cy3");
    expect(r.agendados).toBe(0);
    expect(r.motivo).toMatch(/não foi apresentado/);
    expect(db.socialPost.update).not.toHaveBeenCalled();
  });

  it("ciclo de OUTRO projeto não é agendado por este projeto", async () => {
    db.cycle.findUnique.mockResolvedValue({ id: "cy-alheio", projectId: "p-outro", presentedAt: new Date() });
    const r = await aprovarCalendarioDoCiclo("p1", "cy-alheio");
    expect(r.agendados).toBe(0);
    expect(db.socialPost.update).not.toHaveBeenCalled();
  });

  it("o ciclo corrente é o último APRESENTADO", async () => {
    semear(["sp-set-1"], "draft", () => null);
    const r = await aprovarCalendarioDoCicloCorrente("p1");
    expect(r.cycleId).toBe("cy2");
    expect(r.agendados).toBe(1);
    expect(db.cycle.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { projectId: "p1", presentedAt: { not: null } },
    }));
  });

  it("rodar de novo não agenda de novo — o mês 2 não vira rajada por um duplo clique", async () => {
    semear(["sp-set-1", "sp-set-2"], "draft", () => null);
    await aprovarCalendarioDoCicloCorrente("p1");
    const antes = [...banco.values()].map((p) => p.scheduledFor!.getTime());
    const segunda = await aprovarCalendarioDoCicloCorrente("p1");
    expect(segunda.agendados).toBe(0);
    expect([...banco.values()].map((p) => p.scheduledFor!.getTime())).toEqual(antes);
  });
});

// ── 3. A PORTA DO PACOTE INICIAL CONTINUA INTEIRA ──────────────────────────

describe("aprovarCalendario (pacote inicial) não regrediu", () => {
  it("sem o aval do cliente no projeto, nada é agendado", async () => {
    db.project.findUnique.mockResolvedValue({ clientRequestId: "cr1", clientApprovedAt: null });
    semear(SEIS, "draft", () => null);
    const r = await aprovarCalendario("p1");
    expect(r.agendados).toBe(0);
    expect(db.socialPost.update).not.toHaveBeenCalled();
  });

  it("com o aval, o pacote inteiro vira calendário que o relógio lê", async () => {
    db.project.findUnique.mockResolvedValue({ clientRequestId: "cr1", clientApprovedAt: new Date() });
    semear(SEIS, "draft", () => ONTEM);
    const r = await aprovarCalendario("p1");
    expect(r.agendados).toBe(6);
    expect(oRelogioEncontra(new Date(Date.now() + 30 * 24 * 60 * 60_000))).toHaveLength(6);
  });
});

// ── 4. O RELÓGIO, DE VERDADE ───────────────────────────────────────────────

describe("publicarAgendados só enxerga o que passou pelo consentimento", () => {
  it("peça promovida pela decisão do card é publicada quando chega a hora", async () => {
    // A corrente inteira num teste só: decisão → promoção → relógio → Meta.
    semear(["sp1"], "draft", () => ONTEM);
    await agendarPecasAprovadas({ clientId: "cli-foocci", postIds: ["sp1"] });
    const promovido = banco.get("sp1")!;

    // O relógio busca por status + hora; aqui devolvemos o que ele acharia
    // amanhã, já com os campos que a publicação precisa.
    db.socialPost.findMany.mockResolvedValue([{
      ...promovido, workspaceId: "ws1", clientId: "cli-foocci",
      caption: "Legenda do carrossel", format: "feed",
      mediaUrl: "/api/media/m1", mediaUrlsJson: "[]",
    }]);
    conexaoDoCliente.mockResolvedValue({ id: "mc1", status: "connected" });
    publishPost.mockResolvedValue({ ok: true, externalPostId: "ig_1", permalink: "https://insta/p/1" });
    process.env.PUBLIC_BASE_URL = "https://dioli.studio";

    const r = await publicarAgendados();
    expect(r.publicados).toBe(1);
    expect(db.socialPost.findMany).toHaveBeenLastCalledWith(expect.objectContaining({
      where: expect.objectContaining({ status: "scheduled" }),
    }));
  });
});
