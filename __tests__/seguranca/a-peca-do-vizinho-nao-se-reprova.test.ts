// A PEÇA DO VIZINHO NÃO SE REPROVA — e o motivo dele não vira regra na sua marca.
//
// ═══ O FURO, ACHADO NA VARREDURA DE 28/08/2026 ═════════════════════════════
//
// `POST /api/social-posts/{id}/reprovar` conferia PAPEL (`requireSession`) e não
// conferia POSSE. `reprovarPeca` buscava a peça com
// `findUnique({ where: { id } })` — sem o workspace de quem chamou.
//
// **Um `social_staff` da agência A reprovava a peça da agência B.** E é pior que
// ler: o motivo escrito por ele virava **proibição de marca no cliente da B** —
// uma regra permanente, que a produção passa a obedecer ao escrever as próximas
// peças daquele cliente.
//
// Escrita alheia que vira regra é o pior caso desta família: não some quando
// alguém percebe.
//
// ⚠️ ESTES TESTES EXERCITAM A RECUSA. Uma trava só existe se ela recusa.

import { describe, it, expect, beforeEach, vi } from "vitest";

const db = vi.hoisted(() => ({
  socialPost: { findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  activityEvent: { count: vi.fn(), create: vi.fn(), findMany: vi.fn() },
}));
vi.mock("@/lib/db/client", () => ({ prisma: db }));

const proib = vi.hoisted(() => ({
  registrarProibicoes: vi.fn(async (): Promise<{ novas: { frase: string; termos: string[] }[]; total: number }> => ({ novas: [], total: 0 })),
}));
vi.mock("@/lib/agency/esteira/proibicoes", () => proib);

import { reprovarPeca } from "@/lib/agency/esteira/reprovacao";

const MOTIVO = "o texto está gigante e sem foto real";

beforeEach(() => {
  vi.clearAllMocks();
  db.socialPost.update.mockResolvedValue({});
  db.activityEvent.count.mockResolvedValue(0);
  db.activityEvent.create.mockResolvedValue({});
  proib.registrarProibicoes.mockResolvedValue({ novas: [{ frase: MOTIVO, termos: ["texto gigante"] }], total: 1 });
});

describe("reprovar peça de outro inquilino", () => {
  it("🔒 a peça do vizinho NÃO é encontrada — a busca leva o workspace junto", async () => {
    // O banco responde como responderia de verdade: filtrando por workspace, a
    // peça da agência B não existe para a agência A.
    db.socialPost.findFirst.mockResolvedValue(null);

    const r = await reprovarPeca({
      postId: "post-da-agencia-B",
      motivo: MOTIVO,
      quemReprovou: "alguém da agência A",
      workspaceId: "ws-agencia-A",
    });

    expect(r.ok, "a agência A reprovou a peça da agência B").toBe(false);

    // ⛔ E o que mais importa: NADA foi escrito.
    expect(db.socialPost.update, "alterou a peça alheia").not.toHaveBeenCalled();
    expect(
      proib.registrarProibicoes,
      "o motivo do vizinho virou PROIBIÇÃO DE MARCA no cliente alheio — regra permanente",
    ).not.toHaveBeenCalled();
    expect(db.activityEvent.create, "registrou o ato no workspace alheio").not.toHaveBeenCalled();
  });

  it("⛔ o workspace vai no WHERE da busca — não é conferido depois", async () => {
    db.socialPost.findFirst.mockResolvedValue(null);
    await reprovarPeca({ postId: "p1", motivo: MOTIVO, quemReprovou: "x", workspaceId: "ws-A" });

    // Escopo no `where` e não numa comparação posterior: comparar depois
    // funciona até alguém acrescentar um caminho de saída antes do `if`.
    const chamada = db.socialPost.findFirst.mock.calls[0]?.[0] as { where?: Record<string, unknown> } | undefined;
    expect(chamada?.where, "a busca não levou o workspace").toMatchObject({ workspaceId: "ws-A" });
  });

  it("✅ o dono legítimo reprova normalmente — a trava não vira parede", async () => {
    db.socialPost.findFirst.mockResolvedValue({ id: "p1", workspaceId: "ws-A", clientId: "c1" });

    const r = await reprovarPeca({
      postId: "p1",
      motivo: MOTIVO,
      quemReprovou: "Dioli",
      workspaceId: "ws-A",
    });

    expect(r.ok, "a trava barrou o próprio dono da peça").toBe(true);
    expect(db.socialPost.update).toHaveBeenCalled();
    expect(proib.registrarProibicoes).toHaveBeenCalled();
  });

  it("⛔ sem motivo continua recusando, mesmo sendo o dono — a regra antiga não afrouxou", () => {
    db.socialPost.findFirst.mockResolvedValue({ id: "p1", workspaceId: "ws-A", clientId: "c1" });
    return reprovarPeca({ postId: "p1", motivo: "  ", quemReprovou: "Dioli", workspaceId: "ws-A" })
      .then((r) => {
        expect(r.ok).toBe(false);
        expect(db.socialPost.update).not.toHaveBeenCalled();
      });
  });
});
