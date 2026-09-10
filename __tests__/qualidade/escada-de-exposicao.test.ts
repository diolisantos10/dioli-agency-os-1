// A ESCADA DE EXPOSIÇÃO — as duas metades da prova.
//
// Metade 1 (a que todo mundo escreve): SOMBRA não chega ao cliente.
// Metade 2 (a que quase ninguém escreve, e é a que faz o portão sobreviver):
//   WIDE chega SEM ATRITO. Um portão que retém o legítimo treina o time inteiro
//   a ignorar o alarme — e aí ele deixa de proteger tanto quanto se não
//   existisse. Metade dos testes de um detector prova que o legítimo passa.
//
// Metade 3, que é do mesmo tipo: SUBIR exige número, DESCER não exige nada.

import { describe, it, expect, beforeEach, vi } from "vitest";

const db = vi.hoisted(() => ({
  departmentLadder: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  departmentLadderRecord: { findMany: vi.fn(), create: vi.fn() },
  deliverable: { findMany: vi.fn() },
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

import {
  decidirEntrega, degrauDeclarado, departamentoDoAgente, avaliarSubida,
  contarJanela, departamentosDaCasa, CRITERIO,
} from "@/lib/agency/escada/degraus";
import {
  escadaFiltraEntregas, subirDegrau, descerDegrau, liberarCliente, garantirEscada,
} from "@/lib/agency/escada/registro";

/** A casa inteira num degrau só — evita que `garantirEscada` tente semear. */
function linhas(por: Record<string, { degrau: string; clientes?: string[] }>) {
  return departamentosDaCasa().map((departmentId) => ({
    departmentId,
    degrau: por[departmentId]?.degrau ?? "sombra",
    clientesLiberados: JSON.stringify(por[departmentId]?.clientes ?? []),
  }));
}

function registros(n: number, resultado: string, clientId = "c1") {
  return Array.from({ length: n }, () => ({ resultado, clientId }));
}

beforeEach(() => {
  vi.clearAllMocks();
  db.departmentLadder.create.mockResolvedValue({});
  db.departmentLadder.update.mockResolvedValue({});
  db.departmentLadderRecord.findMany.mockResolvedValue([]);
  db.deliverable.findMany.mockResolvedValue([]);
});

// ── METADE 1 — o que NÃO pode chegar ─────────────────────────────────────────

describe("metade 1 — sombra NÃO chega ao cliente", () => {
  it("departamento em sombra: a peça é produzida e retida", () => {
    const v = decidirEntrega({ departmentId: "design", degrau: "sombra", clientesLiberados: ["c1"] }, "c1");
    expect(v.chega).toBe(false);
    // O alerta carrega a evidência: quem lê o log sabe QUAL departamento e por quê.
    expect(v.motivo).toMatch(/design/);
    expect(v.motivo).toMatch(/SOMBRA/);
  });

  it("allowlist: quem não está na lista não recebe", () => {
    const estado = { departmentId: "social-media", degrau: "allowlist" as const, clientesLiberados: ["c1"] };
    expect(decidirEntrega(estado, "c2").chega).toBe(false);
    expect(decidirEntrega(estado, "c2").motivo).toMatch(/c2/);
  });

  it("allowlist sem cliente identificado NÃO vira 'para todos'", () => {
    const estado = { departmentId: "social-media", degrau: "allowlist" as const, clientesLiberados: ["c1"] };
    expect(decidirEntrega(estado, null).chega).toBe(false);
  });

  it("departamento SEM linha na escada é sombra — o silêncio nunca aprova", () => {
    const v = decidirEntrega(null, "c1");
    expect(v.chega).toBe(false);
    expect(v.motivo).toMatch(/fail-closed/);
  });
});

describe("o valor gravado é lido como TRAVA, não como texto", () => {
  // O adversário aqui não é o atacante: é o dedo de quem corrige um registro à
  // mão em produção, e o `as Degrau` de quem escreveu a leitura com pressa.
  it.each([
    [null, "nulo"],
    [undefined, "ausente"],
    ["", "vazio"],
    ["WIDE", "maiúsculas"],
    ["widee", "typo"],
    [" wide", "espaço à esquerda"],
    ["wide ", "espaço à direita"],
    ["allowlist,wide", "colado"],
    ["true", "outro tipo virado string"],
  ])("%s (%s) vira sombra", (valor: string | null | undefined, _porque: string) => {
    expect(degrauDeclarado(valor)).toBe("sombra");
  });

  it("e o valor exato continua valendo — senão a trava viraria um 'nada passa'", () => {
    expect(degrauDeclarado("wide")).toBe("wide");
    expect(degrauDeclarado("allowlist")).toBe("allowlist");
    expect(degrauDeclarado("sombra")).toBe("sombra");
  });
});

describe("de quem é a peça — executor desconhecido não herda degrau", () => {
  it("reconhece os especialistas declarados", () => {
    expect(departamentoDoAgente("a3")).toBe("social-media");
    expect(departamentoDoAgente("a2")).toBe("design");
    expect(departamentoDoAgente("design-kit-de-marca")).toBe("design");
    expect(departamentoDoAgente("relatorio-mensal")).toBe("analytics");
  });

  it("executor nulo ou desconhecido não pertence a departamento nenhum", () => {
    expect(departamentoDoAgente(null)).toBeNull();
    expect(departamentoDoAgente("")).toBeNull();
    // O caso que a resolução por prefixo deixaria passar: um nome novo que
    // COMEÇA igual ao de um departamento maduro.
    expect(departamentoDoAgente("designer-externo")).toBeNull();
    expect(departamentoDoAgente("design")).toBeNull();
  });
});

// ── METADE 2 — o que TEM que chegar ──────────────────────────────────────────

describe("metade 2 — wide chega sem atrito", () => {
  it("wide entrega a qualquer cliente, inclusive sem cliente identificado", () => {
    const estado = { departmentId: "social-media", degrau: "wide" as const, clientesLiberados: [] };
    expect(decidirEntrega(estado, "c1").chega).toBe(true);
    expect(decidirEntrega(estado, "c99").chega).toBe(true);
    expect(decidirEntrega(estado, null).chega).toBe(true);
  });

  it("allowlist entrega a quem está marcado", () => {
    const estado = { departmentId: "design", degrau: "allowlist" as const, clientesLiberados: ["c1", "c7"] };
    expect(decidirEntrega(estado, "c7").chega).toBe(true);
    expect(decidirEntrega(estado, "c7").motivo).toBeUndefined();
  });
});

describe("o filtro no caminho da entrega — as duas metades na mesma passada", () => {
  it("separa: o de wide vai, o de sombra fica, e cada retido traz o caso concreto", async () => {
    db.departmentLadder.findMany.mockResolvedValue(linhas({
      "social-media": { degrau: "wide" },
      design: { degrau: "sombra" },
    }));

    const r = await escadaFiltraEntregas({
      workspaceId: "w1", clientId: "c1",
      entregas: [
        { id: "d-social", ownerAgentId: "a3" },
        { id: "d-design", ownerAgentId: "a2" },
        { id: "d-orfa", ownerAgentId: null },
      ],
    });

    expect(r.liberados).toEqual(["d-social"]);
    expect(r.retidos.map((x) => x.id).sort()).toEqual(["d-design", "d-orfa"]);
    expect(r.retidos.find((x) => x.id === "d-design")!.motivo).toMatch(/SOMBRA/);
    expect(r.retidos.find((x) => x.id === "d-orfa")!.motivo).toMatch(/não pertence a departamento conhecido/);
  });

  it("banco fora do ar RETÉM tudo — nunca libera tudo", async () => {
    db.departmentLadder.findMany.mockRejectedValue(new Error("db caiu"));
    const r = await escadaFiltraEntregas({
      workspaceId: "w1", clientId: "c1",
      entregas: [{ id: "d1", ownerAgentId: "a3" }],
    });
    expect(r.liberados).toEqual([]);
    expect(r.retidos[0]!.motivo).toMatch(/fail-closed/);
  });

  it("lista vazia não consulta nada — o portão não cobra pedágio de quem não passa", async () => {
    const r = await escadaFiltraEntregas({ workspaceId: "w1", clientId: "c1", entregas: [] });
    expect(r.liberados).toEqual([]);
    expect(db.departmentLadder.findMany).not.toHaveBeenCalled();
  });

  it("JSON de allowlist corrompido é lista VAZIA, não 'todos liberados'", async () => {
    db.departmentLadder.findMany.mockResolvedValue(
      departamentosDaCasa().map((departmentId) => ({
        departmentId, degrau: "allowlist", clientesLiberados: "{isto não é json",
      })),
    );
    const r = await escadaFiltraEntregas({
      workspaceId: "w1", clientId: "c1", entregas: [{ id: "d1", ownerAgentId: "a3" }],
    });
    expect(r.liberados).toEqual([]);
  });
});

// ── A EVIDÊNCIA — número, não opinião ────────────────────────────────────────

describe("a evidência que autoriza subir", () => {
  it("sem histórico nenhum, não sobe — e diz quanto falta, em número", () => {
    const a = avaliarSubida("sombra", [])!;
    expect(a.pode).toBe(false);
    expect(a.alvo).toBe("allowlist");
    expect(a.faltam.join(" ")).toMatch(/5 entrega\(s\) aprovada\(s\)/);
  });

  it("cinco entregas limpas em 30 dias sobem de sombra para allowlist", () => {
    const a = avaliarSubida("sombra", registros(5, "aprovada"))!;
    expect(a.pode).toBe(true);
  });

  it("UMA peça barrada no piso de verdade trava a subida, por mais volume que haja", () => {
    // Dado inventado não é "qualidade abaixo do esperado": é afirmação falsa em
    // nome de um cliente pagante. A tolerância é zero, e não uma taxa.
    const a = avaliarSubida("sombra", [...registros(30, "aprovada"), { resultado: "barrada_piso", clientId: "c1" }])!;
    expect(a.pode).toBe(false);
    expect(a.faltam.join(" ")).toMatch(/piso de verdade/);
  });

  it("'sem árbitro' NÃO conta como aprovada — verde não é prova, e ninguém-olhou menos ainda", () => {
    const a = avaliarSubida("sombra", registros(20, "sem_arbitro"))!;
    expect(a.pode).toBe(false);
    expect(a.contagem.aprovadas).toBe(0);
    expect(a.contagem.semArbitro).toBe(20);
  });

  it("resultado desconhecido não vira aprovação por default", () => {
    const c = contarJanela([{ resultado: "coisa_nova_que_alguem_inventou" }]);
    expect(c.aprovadas).toBe(0);
    expect(c.total).toBe(1);
  });

  it("wide exige DOIS clientes distintos — não se prova 'para todos' com um só", () => {
    const a = avaliarSubida("allowlist", registros(25, "aprovada", "c1"))!;
    expect(a.pode).toBe(false);
    expect(a.faltam.join(" ")).toMatch(/cliente\(s\) distinto\(s\)/);

    const b = avaliarSubida("allowlist", [
      ...registros(13, "aprovada", "c1"),
      ...registros(12, "aprovada", "c2"),
    ])!;
    expect(b.pode).toBe(true);
    expect(b.alvo).toBe("wide");
  });

  it("a taxa de reprovação tem teto, e ele aperta no degrau de cima", () => {
    expect(CRITERIO.allowlist.taxaMaximaDeReprovacao).toBeGreaterThan(CRITERIO.wide.taxaMaximaDeReprovacao);
    // 20 aprovadas + 4 reprovadas = 16,6% > 10% do teto de wide.
    const a = avaliarSubida("allowlist", [
      ...registros(20, "aprovada", "c1"), ...registros(4, "reprovada_qualidade", "c2"),
    ])!;
    expect(a.pode).toBe(false);
    expect(a.faltam.join(" ")).toMatch(/taxa de reprovação/);
  });

  it("no topo não há próximo degrau", () => {
    expect(avaliarSubida("wide", registros(100, "aprovada"))).toBeNull();
  });
});

// ── SUBIR É NÚMERO; DESCER É IMEDIATO ────────────────────────────────────────

describe("subir e descer são assimétricos de propósito", () => {
  beforeEach(() => {
    db.departmentLadder.findMany.mockResolvedValue(linhas({ design: { degrau: "sombra" } }));
  });

  it("subir sem evidência é RECUSADO, e a recusa devolve o número que falta", async () => {
    db.departmentLadder.findUnique.mockResolvedValue({ degrau: "sombra", clientesLiberados: "[]" });
    db.departmentLadderRecord.findMany.mockResolvedValue(registros(2, "aprovada"));

    const r = await subirDegrau({ workspaceId: "w1", departmentId: "design", quem: "diretor" });
    expect(r.ok).toBe(false);
    expect(r.faltam!.join(" ")).toMatch(/3 entrega\(s\) aprovada\(s\)/);
    expect(db.departmentLadder.update).not.toHaveBeenCalled();
  });

  it("com evidência, sobe UM degrau e congela a prova", async () => {
    db.departmentLadder.findUnique.mockResolvedValue({ degrau: "sombra", clientesLiberados: "[]" });
    db.departmentLadderRecord.findMany.mockResolvedValue(registros(6, "aprovada"));

    const r = await subirDegrau({ workspaceId: "w1", departmentId: "design", quem: "diretor" });
    expect(r.ok).toBe(true);
    // UM degrau: de sombra vai para allowlist, nunca direto para wide.
    expect(r.degrau).toBe("allowlist");
    const dados = db.departmentLadder.update.mock.calls[0]![0].data;
    expect(dados.degrau).toBe("allowlist");
    // A prova é congelada porque a janela move: sem isto, ninguém consegue
    // conferir depois com que número a subida aconteceu.
    expect(JSON.parse(dados.provaJson).contagem.aprovadas).toBe(6);
  });

  it("descer não pergunta nada — nem evidência, nem contagem", async () => {
    db.departmentLadder.findUnique.mockResolvedValue({ degrau: "wide", clientesLiberados: "[]" });
    const r = await descerDegrau({ workspaceId: "w1", departmentId: "design", motivo: "peça errada no ar", quem: "diretor" });
    expect(r.ok).toBe(true);
    expect(r.degrau).toBe("sombra");
    // Nem consultou o histórico: contenção atrasada é o incidente inteiro.
    expect(db.departmentLadderRecord.findMany).not.toHaveBeenCalled();
  });

  it("'descer' não pode ser usado para subir pela porta dos fundos", async () => {
    db.departmentLadder.findUnique.mockResolvedValue({ degrau: "sombra", clientesLiberados: "[]" });
    const r = await descerDegrau({ workspaceId: "w1", departmentId: "design", para: "wide", motivo: "atalho", quem: "alguem" });
    expect(r.ok).toBe(false);
    expect(db.departmentLadder.update).not.toHaveBeenCalled();
  });

  it("acrescentar cliente à allowlist exige a MESMA evidência — senão a lista vira wide sem subir", async () => {
    db.departmentLadder.findUnique.mockResolvedValue({ degrau: "allowlist", clientesLiberados: '["c1"]' });
    db.departmentLadderRecord.findMany.mockResolvedValue(registros(1, "aprovada"));
    const r = await liberarCliente({ workspaceId: "w1", departmentId: "design", clientId: "c2", quem: "diretor" });
    expect(r.ok).toBe(false);
    expect(db.departmentLadder.update).not.toHaveBeenCalled();
  });

  it("e com evidência, o cliente entra sem apagar quem já estava", async () => {
    db.departmentLadder.findUnique.mockResolvedValue({ degrau: "allowlist", clientesLiberados: '["c1"]' });
    db.departmentLadderRecord.findMany.mockResolvedValue(registros(8, "aprovada"));
    const r = await liberarCliente({ workspaceId: "w1", departmentId: "design", clientId: "c2", quem: "diretor" });
    expect(r.ok).toBe(true);
    expect(JSON.parse(db.departmentLadder.update.mock.calls[0]![0].data.clientesLiberados).sort()).toEqual(["c1", "c2"]);
  });
});

// ── A SEMEADURA — ligar a escada sem desligar a agência ──────────────────────

describe("semeadura: a escada entra sem parar a casa e sem inventar degrau", () => {
  it("departamento que JÁ entregava nasce em allowlist, com exatamente os clientes que já atendia", async () => {
    db.departmentLadder.findMany.mockResolvedValue([]);
    db.deliverable.findMany.mockResolvedValue([
      { ownerAgentId: "a3", project: { clientId: "c1" } },
      { ownerAgentId: "a3", project: { clientId: "c1" } },
      { ownerAgentId: "a3", project: { clientId: "c2" } },
    ]);

    await garantirEscada("w1");
    const criados = db.departmentLadder.create.mock.calls.map((c) => c[0].data);
    const social = criados.find((d) => d.departmentId === "social-media")!;
    expect(social.degrau).toBe("allowlist");
    expect(JSON.parse(social.clientesLiberados).sort()).toEqual(["c1", "c2"]);
  });

  it("quem nunca entregou nasce em SOMBRA — o degrau de nascimento", async () => {
    db.departmentLadder.findMany.mockResolvedValue([]);
    db.deliverable.findMany.mockResolvedValue([{ ownerAgentId: "a3", project: { clientId: "c1" } }]);

    await garantirEscada("w1");
    const criados = db.departmentLadder.create.mock.calls.map((c) => c[0].data);
    expect(criados.find((d) => d.departmentId === "design")!.degrau).toBe("sombra");
    expect(criados.find((d) => d.departmentId === "quality")!.degrau).toBe("sombra");
  });

  it("WIDE nunca é semeado: para chegar lá, só com evidência", async () => {
    db.departmentLadder.findMany.mockResolvedValue([]);
    db.deliverable.findMany.mockResolvedValue(
      departamentosDaCasa().map(() => ({ ownerAgentId: "a3", project: { clientId: "c1" } })),
    );
    await garantirEscada("w1");
    const degraus = db.departmentLadder.create.mock.calls.map((c) => c[0].data.degrau);
    expect(degraus).not.toContain("wide");
  });

  it("todo departamento da casa ganha linha — inclusive o que não está nos 8 do Brain", async () => {
    db.departmentLadder.findMany.mockResolvedValue([]);
    await garantirEscada("w1");
    const ids = db.departmentLadder.create.mock.calls.map((c) => c[0].data.departmentId).sort();
    expect(ids).toEqual(departamentosDaCasa());
    // `financeiro` produz entrega e NÃO está em BRAIN_DEPARTMENTS. Sem esta
    // união ele ficaria sem linha: em sombra (certo) e invisível (errado).
    expect(ids).toContain("financeiro");
  });

  it("é idempotente: com as linhas no lugar, não cria nada nem consulta histórico", async () => {
    db.departmentLadder.findMany.mockResolvedValue(
      departamentosDaCasa().map((departmentId) => ({ departmentId })),
    );
    await garantirEscada("w1");
    expect(db.departmentLadder.create).not.toHaveBeenCalled();
    expect(db.deliverable.findMany).not.toHaveBeenCalled();
  });
});

// ── O 12º DEPARTAMENTO — PRODUTO & TECNOLOGIA NÃO FICA FORA DA ESCADA ────────
//
// POR QUE ESTE BLOCO EXISTE: `product-technology` é o departamento mais
// perigoso da casa — ele edita CÓDIGO e fichas de agente (`guarda-de-patch.ts`
// existe exatamente por isso: ele poderia reescrever a própria autonomia, o
// próprio teto de custo e o próprio gatilho de escalada). Ele produz
// `ExecucaoV2`/`RecusaV2`, não `Deliverable` — por isso nunca herdaria degrau
// por `departamentoDoAgente` (que só resolve a partir de `DEPARTAMENTOS` e
// `EXECUTORES_AVULSOS`). Sem entrar em `DEPARTAMENTOS_SEM_ESPECIALISTA_DE_ENTREGAVEL`,
// ele nasceria SEM linha na escada — fail-closed por acidente (nunca teria
// `DepartmentLadder`, então `estado === null` em toda decisão), e não por
// mecanismo declarado em código. As DUAS metades: ele aparece (não é
// invisível) e nasce contido (não herda liberação de ninguém).
describe("o 12º departamento (produto & tecnologia) tem degrau declarado, não invisível", () => {
  it("aparece na união de departamentos da casa", () => {
    expect(departamentosDaCasa()).toContain("product-technology");
  });

  it("nasce em SOMBRA na semeadura, mesmo quando OUTRO departamento tem histórico de entrega", async () => {
    db.departmentLadder.findMany.mockResolvedValue([]);
    // Histórico real de entrega — mas de social-media (`a3`), nunca de
    // product-technology, que não produz `Deliverable`. Confirma que ele não
    // herda liberação por estar simplesmente presente na varredura.
    db.deliverable.findMany.mockResolvedValue([
      { ownerAgentId: "a3", project: { clientId: "c1" } },
    ]);

    await garantirEscada("w1");
    const criados = db.departmentLadder.create.mock.calls.map((c) => c[0].data);
    const tecnologia = criados.find((d) => d.departmentId === "product-technology")!;
    expect(tecnologia).toBeDefined();
    expect(tecnologia.degrau).toBe("sombra");
    expect(JSON.parse(tecnologia.clientesLiberados)).toEqual([]);
  });

  it("sem linha declarada, uma peça dele fica retida — fail-closed, nunca 'passa por não ter dono'", () => {
    const v = decidirEntrega(null, "c1");
    expect(v.chega).toBe(false);
    expect(v.motivo).toMatch(/fail-closed/);
  });

  it("com a linha semeada em sombra, a peça é produzida e retida — igual a qualquer outro departamento", () => {
    const v = decidirEntrega({ departmentId: "product-technology", degrau: "sombra", clientesLiberados: [] }, "c1");
    expect(v.chega).toBe(false);
    expect(v.motivo).toMatch(/product-technology/);
    expect(v.motivo).toMatch(/SOMBRA/);
  });
});
