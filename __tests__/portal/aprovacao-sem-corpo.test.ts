// APROVAÇÃO SEM CORPO NÃO PEDE DECISÃO
//
// A história (CEO, 07/08/2026): ele abriu duas aprovações no portal de produção
// e as duas estavam LITERALMENTE vazias — título "Estratégia", subtítulo
// "Estratégia", os três botões de decisão, e nada mais. A segunda, idêntica,
// dizia "Analytics"/"Analytics". Ele estava sendo convidado a aprovar um
// trabalho que não podia ver.
//
// Num piloto 100% IA, sem revisão humana, isso é pior do que um botão faltando:
// é a assinatura do cliente num trabalho que ninguém conferiu. É o mesmo erro
// que "sem gate = aprovado", com a diferença de que aqui a culpa fica com quem
// clicou.
//
// ── A CAUSA, PROVADA (não era "o entregável não existe") ─────────────────────
//
// O entregável EXISTIA no banco. O que falhava era a PUBLICAÇÃO, em duas
// camadas empilhadas — e cada uma sozinha bastava para esvaziar o card:
//
// 1. `apresentar()` publicava as aprovações ANTES de a escada de exposição
//    decidir quais entregas podiam ser compartilhadas, e o fazia com um
//    `updateMany` sem condição: TODA aprovação pendente virava `clientVisible`.
//    Departamento em SOMBRA tinha a entrega retida (certo — é o que "sombra"
//    quer dizer) e mesmo assim o card de decisão dele ia para a tela.
//    **A escada protegia o conteúdo e deixava passar o pedido de decisão.**
//
// 2. O portal casava entrega→departamento por um mapa de TRÊS linhas
//    (`{ a3, a2, a4 }`) contra os ~14 especialistas da casa. Todo id fora dessas
//    três letras — inclusive `strategy-posicionamento` e `a5`, de Estratégia e
//    Analytics — resolvia `undefined` e a entrega era descartada em silêncio.
//
// Este arquivo prova as DUAS METADES de cada trava: que ela barra o problema
// plantado, e que ela NÃO inventa problema no caso limpo.

import { describe, it, expect, beforeEach, vi } from "vitest";

const db = vi.hoisted(() => ({
  project: { findUnique: vi.fn(), update: vi.fn() },
  task: { findMany: vi.fn() },
  deliverable: { findMany: vi.fn(), updateMany: vi.fn() },
  materialRequest: { count: vi.fn() },
  approvalRequest: { updateMany: vi.fn() },
  portalMessage: { create: vi.fn() },
  cycle: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  activityEvent: { create: vi.fn() },
  departmentLadder: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
}));
vi.mock("@/lib/db/client", () => ({ prisma: db }));

// ── O PORTÃO DE MARCA (15/08/2026) — POR QUE ESTE DUBLÊ EXISTE ──────────────
// `escadaFiltraEntregas` passou a consultar a régua de marca antes do degrau
// (ordem do CEO: "marca sem régua, peça não sai"). Com o prisma dublado, a
// leitura da ficha falha e o fail-closed reteria TUDO — mascarando o que este
// arquivo mede. Só o VEREDITO é dublado; o resto do módulo continua real.
// O portão tem prova própria, com as duas metades, em
// `__tests__/esteira/portao-de-marca-na-entrega.test.ts`.
vi.mock("@/lib/agency/esteira/contrato-de-marca", async (original) => ({
  ...(await original<typeof import("@/lib/agency/esteira/contrato-de-marca")>()),
  portaoDeMarca: vi.fn(async () => ({ pode: true, motivo: "" })),
}));

vi.mock("@/lib/agency/execution/run-execution", () => ({ runProjectExecution: vi.fn() }));

import { apresentar } from "@/lib/agency/esteira/marcos";
import { departamentoDoAgente } from "@/lib/agency/escada/degraus";
import { escadaToda } from "../_escada";

const PROJETO = {
  id: "p1", name: "Padaria do João", clientRequestId: "cr1",
  directionApprovedAt: new Date("2026-08-01"),
  presentedAt: null as Date | null,
  clientApprovedAt: null as Date | null,
};

beforeEach(() => {
  vi.clearAllMocks();
  db.project.findUnique.mockResolvedValue({ ...PROJETO });
  db.project.update.mockResolvedValue({});
  db.deliverable.updateMany.mockResolvedValue({});
  db.activityEvent.create.mockResolvedValue({});
  db.materialRequest.count.mockResolvedValue(0);
  db.approvalRequest.updateMany.mockResolvedValue({ count: 1 });
});

describe("a escada decide ANTES, e o card só nasce visível com corpo liberado", () => {
  it("METADE QUE BARRA: departamento em SOMBRA não ganha card visível — nem o corpo, nem o botão", async () => {
    // A entrega de Estratégia existe e está pronta. A escada mantém Estratégia
    // em sombra: o corpo NÃO pode chegar ao cliente.
    db.deliverable.findMany.mockResolvedValue([
      { id: "d-strategy", name: "Posicionamento", revisionStatus: "quality_ok", ownerAgentId: "strategy-posicionamento" },
    ]);
    db.departmentLadder.findMany.mockResolvedValue(escadaToda("sombra"));

    const r = await apresentar("p1");
    expect(r.ok).toBe(true);

    // O corpo ficou retido — a escada funcionando.
    expect(db.deliverable.updateMany).not.toHaveBeenCalled();

    // E ESTA é a linha que o defeito produzia: o card NÃO pode ter sido
    // publicado. Antes, um `updateMany` sem condição rodava aqui e punha os três
    // botões na frente do cliente com a entrega retida atrás deles.
    expect(db.approvalRequest.updateMany).not.toHaveBeenCalled();
  });

  it("METADE QUE NÃO ATRAPALHA: departamento liberado publica corpo E card, sem atrito novo", async () => {
    db.deliverable.findMany.mockResolvedValue([
      { id: "d-strategy", name: "Posicionamento", revisionStatus: "quality_ok", ownerAgentId: "strategy-posicionamento" },
    ]);
    db.departmentLadder.findMany.mockResolvedValue(escadaToda("wide"));

    const r = await apresentar("p1");
    expect(r.ok).toBe(true);

    // O corpo foi compartilhado…
    expect(db.deliverable.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: ["d-strategy"] } } }),
    );
    // …e só então o card ficou visível, restrito ao departamento liberado.
    expect(db.approvalRequest.updateMany).toHaveBeenCalledTimes(1);
    const chamada = db.approvalRequest.updateMany.mock.calls[0][0];
    expect(chamada.data).toEqual({ clientVisible: true });
    expect(chamada.where.department).toEqual({ in: ["strategy"] });
  });

  it("publica SÓ o departamento liberado quando um está aberto e outro em sombra", async () => {
    db.deliverable.findMany.mockResolvedValue([
      { id: "d-social", name: "Pacote Social", revisionStatus: "quality_ok", ownerAgentId: "a3" },
      { id: "d-analytics", name: "Plano de medição", revisionStatus: "quality_ok", ownerAgentId: "a5" },
    ]);
    // Social aberto; Analytics em sombra.
    db.departmentLadder.findMany.mockResolvedValue(
      escadaToda("wide").map((l: { departmentId: string }) =>
        l.departmentId === "analytics" ? { ...l, degrau: "sombra" } : l,
      ),
    );

    await apresentar("p1");

    const depts = db.approvalRequest.updateMany.mock.calls[0][0].where.department.in;
    expect(depts).toContain("social-media");
    // O card de Analytics — exatamente o que o CEO abriu vazio — não sobe.
    expect(depts).not.toContain("analytics");
  });
});

describe("o mapa agente→departamento cobre a casa inteira, não três letras", () => {
  // O mapa antigo do portal era `{ a3: "social-media", a2: "design", a4: "paid-traffic" }`.
  // Estes são os ids que ele deixava cair no chão — e com eles o corpo do card.
  it("resolve os especialistas de Estratégia e Analytics (os dois cards vazios do CEO)", () => {
    expect(departamentoDoAgente("strategy-posicionamento")).toBe("strategy");
    expect(departamentoDoAgente("strategy-concorrencia")).toBe("strategy");
    expect(departamentoDoAgente("a5")).toBe("analytics");
    expect(departamentoDoAgente("analytics-otimizacao")).toBe("analytics");
  });

  it("continua resolvendo os três que o mapa antigo acertava — nada regrediu", () => {
    expect(departamentoDoAgente("a3")).toBe("social-media");
    expect(departamentoDoAgente("a2")).toBe("design");
    expect(departamentoDoAgente("a4")).toBe("paid-traffic");
  });

  it("executor desconhecido continua sem departamento — fail-closed preservado", () => {
    expect(departamentoDoAgente("designer-externo")).toBeNull();
    expect(departamentoDoAgente(null)).toBeNull();
  });
});
