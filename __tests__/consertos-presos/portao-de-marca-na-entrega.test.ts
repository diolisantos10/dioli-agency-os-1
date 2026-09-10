// O PORTÃO QUE RECUSA ENTREGAR PEÇA DE MARCA NÃO CONSTITUÍDA.
//
// Ordem do CEO (15/08/2026): *"o portão que recusa entregar peça de marca não
// constituída. Portão, não recomendação: marca sem régua, peça não sai."*
//
// ── O QUE JÁ EXISTIA, E O BURACO QUE FICAVA ────────────────────────────────
//
// Desde 09/08 há um portão de marca em `publicacao.ts:703`, provado por
// `__tests__/esteira/portao-de-marca.test.ts`. Ele guarda UMA porta: a
// publicação no Instagram.
//
// A outra porta pela qual a peça chega ao cliente é `escadaFiltraEntregas` — o
// ponto em que a entrega vira `visibility: "compartilhado"` e aparece no portal.
// Medido em 15/08: NENHUM dos quatro chamadores dela (`marcos.ts`, `mes.ts`,
// `producao-de-pedido.ts`, `escada/repescagem.ts`) consultava a régua de marca.
// Portão numa porta só é a "rota alternativa para entregar contornando o
// portão" que o Conselho listou como condição de tudo.
//
// ── POR QUE O PORTÃO FOI POSTO DENTRO DA ESCADA, E NÃO EM `marcos.ts` ──────
//
// Porque `escada/repescagem.ts` existe para SOLTAR DEPOIS o que ficou retido
// antes. Um portão em `marcos.ts` seria contornado pela repescagem no dia
// seguinte, em silêncio. O único choke point é `escadaFiltraEntregas`.
//
// ── AS DUAS METADES, e a segunda é a que faz o portão sobreviver ───────────
//
//   ⛔ marca SEM régua  → a peça de marca é RETIDA, com motivo concreto.
//   ✅ marca CONSTITUÍDA → passa sem atrito. Portão que retém o legítimo é
//      portão que o time desliga.
//
// E uma terceira, que é a mais fácil de errar: relatório e plano NÃO são peça
// de marca e não podem ser barrados por ela — senão o portão para a agência
// inteira no dia 1, que é o defeito que a semeadura da escada existe para
// evitar.

import { describe, it, expect, beforeEach, vi } from "vitest";

const db = vi.hoisted(() => ({
  departmentLadder: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  departmentLadderRecord: { findMany: vi.fn(), create: vi.fn() },
  deliverable: { findMany: vi.fn() },
}));
vi.mock("@/lib/db/client", () => ({ prisma: db }));

/** A ficha de marca, dublada na FONTE — é dela que `contratoDeMarca` deriva
 *  `naoConstituida`. Dublar `contratoDeMarca` inteiro provaria o dublê; dublar
 *  a ficha faz o contrato de verdade rodar, inclusive a decisão do portão. */
const ficha = vi.hoisted(() => ({ lerFichaDeMarca: vi.fn() }));
vi.mock("@/lib/agency/esteira/ficha-de-marca", () => ficha);

const proib = vi.hoisted(() => ({ lerProibicoes: vi.fn() }));
vi.mock("@/lib/agency/esteira/proibicoes", () => proib);

const material = vi.hoisted(() => ({ materiaisDeMarca: vi.fn() }));
vi.mock("@/lib/agency/esteira/material-do-drive", () => material);

import { escadaFiltraEntregas } from "@/lib/agency/escada/registro";
import { departamentosDaCasa } from "@/lib/agency/escada/degraus";
import {
  portaoDeMarca, ehPecaDeMarca, DEPARTAMENTOS_DE_PECA_DE_MARCA,
} from "@/lib/agency/esteira/contrato-de-marca";

/** A casa inteira em WIDE: o degrau deixa de ser variável, e o que sobra a
 *  medir é só o portão de marca. */
function todosEmWide() {
  return departamentosDaCasa().map((departmentId) => ({
    departmentId, degrau: "wide", clientesLiberados: "[]",
  }));
}

/** Uma marca CONSTITUÍDA, no formato que `lerFichaDeMarca` devolve. */
const MARCA_BOA = {
  clientId: "c1", campos: [], definidos: 9, lacunas: [],
  naoConstituida: false, oQueFaltaParaPublicar: [],
};
/** Uma marca que nunca declarou régua nenhuma. */
const MARCA_CRUA = {
  clientId: "c1", campos: [], definidos: 0,
  lacunas: [{ rotulo: "Voz" }, { rotulo: "Léxico" }],
  naoConstituida: true,
  oQueFaltaParaPublicar: ["Voz", "Léxico"],
};

/** Executores REAIS desta casa (`especialistas.ts`) —
 *  `departamentoDoAgente` tem de mapeá-los, senão o teste mediria outra coisa. */
const PECA_DE_DESIGN = { id: "d1", ownerAgentId: "design-criativo-social" };
const PECA_DE_SOCIAL = { id: "d2", ownerAgentId: "social-copy" };
const RELATORIO = { id: "d3", ownerAgentId: "analytics-otimizacao" };

beforeEach(() => {
  vi.clearAllMocks();
  db.departmentLadder.findMany.mockResolvedValue(todosEmWide());
  db.departmentLadder.create.mockResolvedValue({});
  db.departmentLadder.update.mockResolvedValue({});
  db.departmentLadderRecord.findMany.mockResolvedValue([]);
  db.deliverable.findMany.mockResolvedValue([]);
  proib.lerProibicoes.mockResolvedValue({ lidas: true, itens: [] });
  material.materiaisDeMarca.mockResolvedValue([]);
  ficha.lerFichaDeMarca.mockResolvedValue(MARCA_BOA);
});

// ── A DEFINIÇÃO, num lugar só ───────────────────────────────────────────────

describe("o que conta como PEÇA DE MARCA está escrito em UM lugar", () => {
  it("são design e social-media — os dois que o CEO chamou de 'peça'", () => {
    expect([...DEPARTAMENTOS_DE_PECA_DE_MARCA].sort()).toEqual(["design", "social-media"]);
  });

  it("relatório, plano e proposta NÃO são peça de marca", () => {
    for (const d of ["analytics", "strategy", "financeiro", "pm"]) {
      expect(ehPecaDeMarca(d), `${d} virou peça de marca — o portão vai parar a casa`).toBe(false);
    }
    expect(ehPecaDeMarca(null)).toBe(false);
  });
});

// ── O VEREDITO, isolado ─────────────────────────────────────────────────────

describe("portaoDeMarca — o veredito, e ele é fail-closed", () => {
  it("⛔ marca não constituída: NÃO PODE, e o motivo diz o conserto", async () => {
    ficha.lerFichaDeMarca.mockResolvedValue(MARCA_CRUA);
    const v = await portaoDeMarca("c1");
    expect(v.pode).toBe(false);
    // Recusa que não diz o que fazer vira ruído que ninguém age.
    expect(v.motivo).toMatch(/ficha de marca/i);
  });

  it("✅ marca constituída: PODE, e sem ressalva", async () => {
    const v = await portaoDeMarca("c1");
    expect(v.pode).toBe(true);
    expect(v.motivo).toBe("");
  });

  it("⛔ FALHA DE LEITURA não vira permissão — sem portão é reprovado", async () => {
    ficha.lerFichaDeMarca.mockRejectedValue(new Error("banco fora do ar"));
    const v = await portaoDeMarca("c1");
    expect(v.pode, "o erro de leitura virou licença para entregar").toBe(false);
  });

  it("⛔ entrega sem cliente dono não passa — não há marca que a autorize", async () => {
    expect((await portaoDeMarca(null)).pode).toBe(false);
    expect((await portaoDeMarca(undefined)).pode).toBe(false);
  });
});

// ── O PORTÃO NO CAMINHO DA ENTREGA ──────────────────────────────────────────

describe("metade 1 — marca sem régua: a peça NÃO SAI", () => {
  it("⛔ com TODOS os degraus em WIDE, a peça de marca continua retida", async () => {
    ficha.lerFichaDeMarca.mockResolvedValue(MARCA_CRUA);

    const r = await escadaFiltraEntregas({
      workspaceId: "ws1", clientId: "c1", entregas: [PECA_DE_DESIGN, PECA_DE_SOCIAL],
    });

    // WIDE é o degrau mais aberto que existe. Se a peça passasse aqui, o portão
    // seria decoração ao lado do caminho.
    expect(r.liberados, "peça de marca não constituída foi liberada ao cliente").toEqual([]);
    expect(r.retidos.map((x) => x.id).sort()).toEqual(["d1", "d2"]);
    for (const retido of r.retidos) {
      expect(retido.motivo).toMatch(/marca não constituída/i);
    }
  });

  it("⛔ e a REPESCAGEM não é porta dos fundos: o mesmo filtro a barra", async () => {
    // `repescarEntregasRetidas` existe para soltar depois o que ficou retido
    // antes, e passa por ESTA função. Portão fora daqui seria contornado por ela
    // no dia seguinte, em silêncio.
    ficha.lerFichaDeMarca.mockResolvedValue(MARCA_CRUA);
    const r = await escadaFiltraEntregas({
      workspaceId: "ws1", clientId: "c1", entregas: [PECA_DE_DESIGN],
    });
    expect(r.liberados).toEqual([]);
  });

  it("⛔ o portão vence o degrau: WIDE não compra o direito de entregar sem régua", async () => {
    ficha.lerFichaDeMarca.mockResolvedValue(MARCA_CRUA);
    const r = await escadaFiltraEntregas({
      workspaceId: "ws1", clientId: "c1", entregas: [PECA_DE_DESIGN],
    });
    // O motivo é o da MARCA, não o do degrau — é assim que quem lê o alarme
    // sabe o que consertar.
    expect(r.retidos[0]!.motivo).not.toMatch(/SOMBRA/);
    expect(r.retidos[0]!.motivo).toMatch(/marca não constituída/i);
  });
});

// ── A BUSCA POR ROTA ALTERNATIVA (a passada adversarial) ────────────────────
//
// Um portão só vale se não houver outra porta. Varridas em 15/08 todas as
// escritas de `visibility: "compartilhado"` do repositório:
//
//   • `marcos.ts:235`, `mes.ts:733`, `escada/repescagem.ts:133`,
//     `producao-de-pedido.ts:431` → todas atrás de `escadaFiltraEntregas` ✅
//   • `publicacao.ts:401` → cria `SocialPost` (a peça do CALENDÁRIO) já
//     compartilhado, e NÃO passa pela escada. Parecia a porta dos fundos.
//   • `app/api/social-posts/route.ts:137` → é filtro de LEITURA, não escrita.
//   • `app/api/messages/pedidos/route.ts:467` → entrega feita À MÃO por um
//     operador com sessão. **Continua fora do portão, e está declarado no
//     relato.** Não é a máquina entregando: é uma pessoa.
//
// O caso do calendário é o que este bloco trava, porque a defesa dele é
// indireta e uma refatoração descuidada a apaga sem ninguém notar.

describe("a rota do CALENDÁRIO não contorna o portão", () => {
  it("peça retida nunca vira post do calendário — a defesa é o visibility", async () => {
    const { motivoParaNaoVirarCalendario } = await import("@/lib/agency/esteira/publicacao");

    // O que o portão de marca produz é uma entrega que NUNCA recebe
    // "compartilhado". `agendarPostsDaEntrega` só monta calendário a partir de
    // entrega compartilhada — então a retenção se propaga sozinha.
    const retida = { visibility: "interno", revisionStatus: "quality_ok" };
    expect(motivoParaNaoVirarCalendario(retida)).toMatch(/escada de exposição não liberou/);

    // A outra metade: a liberada VIRA calendário. Sem isto, o teste acima
    // passaria mesmo se a função recusasse tudo.
    const liberada = { visibility: "compartilhado", revisionStatus: "quality_ok" };
    expect(motivoParaNaoVirarCalendario(liberada)).toBeNull();
  });
});

describe("metade 2 — a que faz o portão sobreviver: o legítimo passa sem atrito", () => {
  it("✅ marca constituída em WIDE: a peça vai ao cliente", async () => {
    const r = await escadaFiltraEntregas({
      workspaceId: "ws1", clientId: "c1", entregas: [PECA_DE_DESIGN, PECA_DE_SOCIAL],
    });
    expect(r.liberados.sort()).toEqual(["d1", "d2"]);
    expect(r.retidos).toEqual([]);
  });

  it("✅ RELATÓRIO passa mesmo com a marca crua — ele não é peça de marca", async () => {
    ficha.lerFichaDeMarca.mockResolvedValue(MARCA_CRUA);
    const r = await escadaFiltraEntregas({
      workspaceId: "ws1", clientId: "c1", entregas: [RELATORIO],
    });
    // Se isto quebrar, o portão parou a agência inteira para todo cliente que
    // ainda não respondeu as 5 perguntas da ficha.
    expect(r.liberados).toEqual(["d3"]);
  });

  it("✅ no MESMO lote: o relatório sai e a peça fica — a separação é por entrega", async () => {
    ficha.lerFichaDeMarca.mockResolvedValue(MARCA_CRUA);
    const r = await escadaFiltraEntregas({
      workspaceId: "ws1", clientId: "c1", entregas: [PECA_DE_DESIGN, RELATORIO],
    });
    expect(r.liberados).toEqual(["d3"]);
    expect(r.retidos.map((x) => x.id)).toEqual(["d1"]);
  });

  it("a régua é consultada UMA vez por lote, e só quando há peça de marca", async () => {
    await escadaFiltraEntregas({
      workspaceId: "ws1", clientId: "c1", entregas: [RELATORIO],
    });
    // Lote sem peça de marca não paga a leitura da ficha.
    expect(ficha.lerFichaDeMarca).not.toHaveBeenCalled();

    await escadaFiltraEntregas({
      workspaceId: "ws1", clientId: "c1",
      entregas: [PECA_DE_DESIGN, PECA_DE_SOCIAL, RELATORIO],
    });
    expect(ficha.lerFichaDeMarca).toHaveBeenCalledTimes(1);
  });
});
