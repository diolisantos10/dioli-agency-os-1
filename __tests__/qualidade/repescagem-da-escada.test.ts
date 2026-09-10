// A REPESCAGEM — as duas metades.
//
// Metade 1: o que a escada reteve ONTEM sai quando o degrau abre. Sem isto,
//           soltar a escada é trocar um valor no banco e não entregar nada — o
//           ato de apresentar roda uma vez só e não se repete.
// Metade 2: ela não vira porta dos fundos — não passa por cima da Qualidade,
//           não antecipa ciclo não apresentado, não reapresenta, não avisa
//           ninguém, não publica, e não solta o que a escada continua retendo.

import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const db = vi.hoisted(() => ({
  deliverable: { findMany: vi.fn(), updateMany: vi.fn() },
  cycle: { findMany: vi.fn() },
  departmentLadder: { findMany: vi.fn(), create: vi.fn() },
  approvalRequest: { updateMany: vi.fn() },
  activityEvent: { create: vi.fn() },
  project: { update: vi.fn(), findUnique: vi.fn() },
}));
vi.mock("@/lib/db/client", () => ({ prisma: db }));

// ── O PORTÃO DE MARCA (15/08/2026) — POR QUE ESTE DUBLÊ EXISTE ──────────────
// `escadaFiltraEntregas` passou a consultar a régua de marca antes do degrau
// (ordem do CEO: "marca sem régua, peça não sai"). Este arquivo testa O DEGRAU,
// não o portão de marca — com o prisma dublado, `contratoDeMarca` explodiria e o
// fail-closed reteria tudo, mascarando o que aqui se quer medir.
// A marca entra CONSTITUÍDA de propósito, para o degrau ser a única variável.
// O portão de marca tem prova própria, com as duas metades, em
// `__tests__/esteira/portao-de-marca-na-entrega.test.ts`.
const marcaDoPortao = vi.hoisted(() => ({
  portaoDeMarca: vi.fn(async () => ({ pode: true, motivo: "" })),
  ehPecaDeMarca: (d: string | null | undefined) => d === "design" || d === "social-media",
}));
vi.mock("@/lib/agency/esteira/contrato-de-marca", () => marcaDoPortao);

import { repescarEntregasRetidas } from "@/lib/agency/escada/repescagem";
import { escadaToda } from "../_escada";

const CLIENTE = "cli1";

function entrega(over: Record<string, unknown> = {}) {
  return {
    id: "d1",
    // `a3` é o especialista de social-media (o que escreve a peça de feed).
    ownerAgentId: "a3",
    revisionStatus: "quality_ok",
    cycleId: null,
    project: {
      id: "p1", workspaceId: "ws1", clientId: CLIENTE,
      clientRequestId: "cr1", presentedAt: new Date("2026-08-07"),
    },
    ...over,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  db.deliverable.updateMany.mockResolvedValue({ count: 1 });
  db.approvalRequest.updateMany.mockResolvedValue({ count: 1 });
  db.activityEvent.create.mockResolvedValue({});
  db.cycle.findMany.mockResolvedValue([]);
  db.departmentLadder.create.mockResolvedValue({});
});

// ── METADE 1 — o que estava preso sai ────────────────────────────────────────

describe("metade 1 — a repescagem entrega o que o degrau prendeu", () => {
  it("degrau ABERTO para o cliente: a entrega retida vira visível e o card de decisão vai junto", async () => {
    db.deliverable.findMany.mockResolvedValue([entrega()]);
    db.departmentLadder.findMany.mockResolvedValue(escadaToda("allowlist", [CLIENTE]));

    const r = await repescarEntregasRetidas();

    expect(r.liberadas).toBe(1);
    expect(db.deliverable.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["d1"] } },
      data: { visibility: "compartilhado" },
    });
    // Corpo sem botão é a metade inútil: o cliente veria a peça sem poder
    // aprová-la.
    const card = db.approvalRequest.updateMany.mock.calls[0][0];
    expect(card.where.department).toEqual({ in: ["social-media"] });
    expect(card.data).toEqual({ clientVisible: true });
    // Fica rastro: uma entrega que aparece dias depois precisa de explicação.
    expect(db.activityEvent.create).toHaveBeenCalled();
    expect(db.activityEvent.create.mock.calls[0][0].data.type).toBe("escada_repescou_entrega");
  });

  it("entrega de CICLO já apresentado também é repescada", async () => {
    db.deliverable.findMany.mockResolvedValue([
      entrega({ cycleId: "cy1", project: { ...entrega().project, presentedAt: null } }),
    ]);
    db.cycle.findMany.mockResolvedValue([{ id: "cy1" }]);
    db.departmentLadder.findMany.mockResolvedValue(escadaToda("wide"));

    const r = await repescarEntregasRetidas();
    expect(r.liberadas).toBe(1);
  });
});

// ── METADE 2 — o que ela NÃO solta ───────────────────────────────────────────

describe("metade 2 — a repescagem não é porta dos fundos", () => {
  it("degrau FECHADO: nada é liberado, e o motivo concreto volta", async () => {
    db.deliverable.findMany.mockResolvedValue([entrega()]);
    db.departmentLadder.findMany.mockResolvedValue(escadaToda("sombra"));

    const r = await repescarEntregasRetidas();
    expect(r.liberadas).toBe(0);
    expect(db.deliverable.updateMany).not.toHaveBeenCalled();
    expect(db.approvalRequest.updateMany).not.toHaveBeenCalled();
    expect(r.aindaRetidas[0].motivo).toMatch(/SOMBRA/);
  });

  it("allowlist SEM este cliente: continua retida", async () => {
    db.deliverable.findMany.mockResolvedValue([entrega()]);
    db.departmentLadder.findMany.mockResolvedValue(escadaToda("allowlist", ["outro"]));

    const r = await repescarEntregasRetidas();
    expect(r.liberadas).toBe(0);
    expect(db.deliverable.updateMany).not.toHaveBeenCalled();
  });

  it("a QUALIDADE não é contornada — `quality_flag` fica fora da própria consulta", async () => {
    db.deliverable.findMany.mockResolvedValue([]);
    db.departmentLadder.findMany.mockResolvedValue(escadaToda("wide"));
    await repescarEntregasRetidas();
    const consulta = db.deliverable.findMany.mock.calls[0][0];
    expect(consulta.where.NOT).toEqual({ revisionStatus: "quality_flag" });
    expect(consulta.where.visibility).toBe("interno");
  });

  it("projeto NÃO apresentado: a entrega espera o ato dele, não a repescagem", async () => {
    db.deliverable.findMany.mockResolvedValue([
      entrega({ project: { ...entrega().project, presentedAt: null } }),
    ]);
    db.departmentLadder.findMany.mockResolvedValue(escadaToda("wide"));

    const r = await repescarEntregasRetidas();
    expect(r.liberadas).toBe(0);
    expect(db.deliverable.updateMany).not.toHaveBeenCalled();
  });

  it("ciclo NÃO apresentado: a repescagem não adianta o mês", async () => {
    db.deliverable.findMany.mockResolvedValue([
      entrega({ cycleId: "cy1", project: { ...entrega().project, presentedAt: new Date() } }),
    ]);
    // O ciclo existe e NÃO está apresentado — a consulta de ciclos volta vazia.
    db.cycle.findMany.mockResolvedValue([]);
    db.departmentLadder.findMany.mockResolvedValue(escadaToda("wide"));

    const r = await repescarEntregasRetidas();
    expect(r.liberadas).toBe(0);
  });

  it("NÃO reapresenta e NÃO avisa o cliente: `presentedAt` não é tocado", async () => {
    db.deliverable.findMany.mockResolvedValue([entrega()]);
    db.departmentLadder.findMany.mockResolvedValue(escadaToda("wide"));
    await repescarEntregasRetidas();
    // Reapresentar mandaria uma segunda mensagem ao cliente pelo mesmo pacote.
    expect(db.project.update).not.toHaveBeenCalled();
  });

  it("casa em dia: zero entrega retida ⇒ zero escrita", async () => {
    db.deliverable.findMany.mockResolvedValue([]);
    const r = await repescarEntregasRetidas();
    expect(r).toEqual({ liberadas: 0, aindaRetidas: [], projetos: 0, avisos: [] });
    expect(db.deliverable.updateMany).not.toHaveBeenCalled();
  });

  it("banco fora do ar: aviso, não exceção, e nada liberado", async () => {
    db.deliverable.findMany.mockRejectedValue(new Error("db down"));
    const r = await repescarEntregasRetidas();
    expect(r.liberadas).toBe(0);
    expect(r.avisos.join(" ")).toMatch(/db down/);
  });

  it("escada ilegível: fail-closed — retém tudo em vez de soltar tudo", async () => {
    db.deliverable.findMany.mockResolvedValue([entrega()]);
    db.departmentLadder.findMany.mockRejectedValue(new Error("sem escada"));
    const r = await repescarEntregasRetidas();
    expect(r.liberadas).toBe(0);
    expect(db.deliverable.updateMany).not.toHaveBeenCalled();
  });
});

// ── O ARQUIVO ────────────────────────────────────────────────────────────────

describe("o arquivo em si", () => {
  const fonte = readFileSync(join(process.cwd(), "lib/agency/escada/repescagem.ts"), "utf8");

  it("usa a MESMA função de decisão da apresentação — não uma segunda cópia da regra", () => {
    expect(fonte).toMatch(/escadaFiltraEntregas/);
    // Reimplementar `decidirEntrega` aqui faria as duas cópias divergirem — é o
    // defeito que já cegou o corpo do card no portal.
    expect(fonte).not.toMatch(/degrau === "sombra"/);
  });

  // ⚠️ 13/08/2026 — ESTA ASSERÇÃO MEDIA A COISA ERRADA.
  //
  // Chamava-se "não publica" e conferia `not.toMatch(/esteira\/publicacao/)`:
  // media MENÇÃO AO ARQUIVO, não o ato de publicar. A diferença apareceu no dia
  // em que a repescagem passou a montar o CALENDÁRIO do que ela libera — posts
  // em `draft`, que continuam exigindo o aval do cliente para virar
  // `scheduled`, e portanto não publicam nada.
  //
  // Escrita como estava, ela proibia o conserto certo e teria empurrado a
  // solução para uma CÓPIA da regra em outro arquivo, que é a doença que este
  // repositório mais paga. Agora confere o ATO.
  it("não fala com plataforma nenhuma e não dispara publicação", () => {
    expect(fonte).not.toMatch(/integrations\/(meta|google|tiktok)/);
    expect(fonte).not.toMatch(/publishPost/);
    expect(fonte).not.toMatch(/publicarAgendados/);
    // Promover rascunho a agendado é o consentimento do cliente — não é aqui.
    expect(fonte).not.toMatch(/aprovarCalendario|promoverParaAgendado/);
  });

  it("monta o calendário do que libera — senão o portão abre e nada passa", () => {
    // O simétrico do conserto de 13/08: `agendarPostsDaEntrega` passou a
    // recusar entrega que a escada não liberou. Sem esta chamada, a entrega
    // liberada DEPOIS da apresentação nunca viraria calendário — o ato de
    // apresentar é o único gatilho de agendamento, e ele não repete.
    expect(fonte).toMatch(/agendarPostsDaEntrega/);
  });

  it("não manda aviso ao cliente", () => {
    expect(fonte).not.toMatch(/avisarCliente/);
  });
});
