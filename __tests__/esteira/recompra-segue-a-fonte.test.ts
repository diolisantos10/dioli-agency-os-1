// A PROVA DE QUE O TOQUE DE RECOMPRA SEGUE A FONTE — nunca uma cópia.
//
// Por que este teste vive num ARQUIVO PRÓPRIO, e não dentro de
// `recompra.test.ts`: `SELF_SERVE_CATALOG` lê `PLANOS` no CARREGAMENTO do
// módulo (`self-serve-catalog.ts:51`, `const RITMO = PLANOS.find(...)`), e o
// mesmo vale para `negociacao.ts`. O mock de módulo do vitest é por arquivo —
// se este caso convivesse com os outros testes de `recompra.ts`, mockar
// `@/lib/agency/planos` aqui contaminaria todos eles. Isolado, cada `it` pode
// trocar só o que a fonte diz e reconstruir o módulo do zero
// (`vi.resetModules` + `vi.doMock` + `import()` dinâmico DENTRO do teste), o
// que é exatamente a prova que a ficha pediu: mude a fonte, e só a fonte, e a
// mensagem muda junto — sem tocar em `recompra.ts`.

import { describe, it, expect, vi, beforeEach } from "vitest";

const db = { clientNotice: { create: vi.fn() } };

function ancora(over: Record<string, unknown> = {}) {
  return {
    clientId: "cli-1",
    workspaceId: "ws-1",
    projectId: "prj-1",
    clienteNome: "José da Silva",
    email: "ze@padaria.com",
    telefone: "11999999999",
    itemDeCatalogo: "balcao-carrossel-5",
    itemLabel: "Carrossel até 5 telas",
    entregaId: "del-1",
    entregueEm: new Date("2026-07-01T12:00:00Z"),
    compras: 4,
    ...over,
  };
}

beforeEach(() => {
  vi.resetModules();
  vi.doMock("@/lib/db/client", () => ({ prisma: db }));
  vi.doMock("@/lib/agency/esteira/triagem", () => ({ avisarCliente: vi.fn(async () => undefined) }));
});

describe("o texto do degrau segue a FONTE, nunca uma cópia", () => {
  it('mudou "pecasPorMes" do plano ritmo na fonte para 17 → a mensagem diz 17, não 12', async () => {
    vi.doMock("@/lib/agency/planos", async (importOriginal) => {
      const real = await importOriginal<typeof import("@/lib/agency/planos")>();
      return {
        ...real,
        PLANOS: real.PLANOS.map((p) => (p.id === "ritmo" ? { ...p, pecasPorMes: 17 } : p)),
      };
    });

    const { redigirToque } = await import("@/lib/agency/esteira/recompra");
    const { corpo } = redigirToque(60, ancora() as Parameters<typeof redigirToque>[1]);

    expect(corpo).toContain("17 peças por mês");
    expect(corpo).not.toMatch(/\b12 peças\b/);
  });

  it('fonte com "pecasPorMes: 0" no ritmo: o toque de 60 dias NÃO cita pacote do mês nem número de peça de plano', async () => {
    // A metade fail-closed. Não removemos o plano inteiro de propósito:
    // `self-serve-catalog.ts:51` faz `PLANOS.find(p => p.id === "ritmo")!` —
    // um plano ausente derrubaria o CARREGAMENTO do catálogo (e junto dele o
    // de `recompra.ts`), o que testaria um crash, não o fail-closed do toque.
    // `pecasPorMes: 0` é o mesmo defeito (volume que a fonte não confirma como
    // válido) sem quebrar o resto do módulo — e é a alternativa que a própria
    // ficha desta correção previu.
    vi.doMock("@/lib/agency/planos", async (importOriginal) => {
      const real = await importOriginal<typeof import("@/lib/agency/planos")>();
      return {
        ...real,
        PLANOS: real.PLANOS.map((p) => (p.id === "ritmo" ? { ...p, pecasPorMes: 0 } : p)),
      };
    });

    const { redigirToque } = await import("@/lib/agency/esteira/recompra");
    const { corpo, plano } = redigirToque(60, ancora() as Parameters<typeof redigirToque>[1]);

    expect(plano?.pecasPorMes).toBeNull();
    expect(corpo).not.toMatch(/pacote do mês/i);
    expect(corpo).not.toMatch(/\d+\s+peças\s+por\s+mês/i);
  });
});
