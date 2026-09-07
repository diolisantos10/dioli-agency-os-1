// O RELÓGIO COBRA O COMPROMISSO DO SDR — item 2 do P0 de 30/08/2026.
//
// "Compromisso vencido GRITA." Marcos (Foocci, PARCEIRO REAL) cobrou uma
// escalação que o SDR prometeu e ninguém cumpriu. Este teste prova que a
// perna nova do relógio (`despertador.ts`) acha o compromisso vencido e
// grita com nome do cliente, o que foi prometido e há quanto tempo — sem
// depender das outras dezenas de pernas do relógio, que este arquivo não
// mexe e não precisa mockar por inteiro (o padrão já usado por
// `__tests__/execution/despertador.test.ts`: o que não é mockado falha
// silenciosamente, e o relógio nunca morre por isso).

import { describe, it, expect, beforeEach, vi } from "vitest";

const db = vi.hoisted(() => ({
  project: { findMany: vi.fn(async (): Promise<Array<{ id: string }>> => []), update: vi.fn() },
  activityEvent: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    // Sem tipo no `vi.fn()` inicial de propósito: este mock troca de
    // implementação por teste, com `args` tipado no próprio `mockImplementation`
    // — anotar o retorno aqui travaria a assinatura em zero parâmetros.
    findMany: vi.fn(),
    deleteMany: vi.fn(async () => ({ count: 0 })),
  },
  client: { findMany: vi.fn() },
}));
vi.mock("@/lib/db/client", () => ({ prisma: db }));

const runProjectExecution = vi.hoisted(() => vi.fn());
vi.mock("@/lib/agency/execution/run-execution", () => ({ runProjectExecution }));
const dispatchWhatsAppNotifications = vi.hoisted(() => vi.fn());
vi.mock("@/lib/integrations/meta/notifications", () => ({ dispatchWhatsAppNotifications }));
const destravarPacote = vi.hoisted(() => vi.fn());
const pacotesTravados = vi.hoisted(() => vi.fn());
const reauditarSemArbitro = vi.hoisted(() =>
  vi.fn(async () => ({ aprovadas: [] as string[], reprovadas: [] as string[], aindaSemArbitro: [] as string[] })),
);
vi.mock("@/lib/agency/esteira/pacote-travado", () => ({ destravarPacote, pacotesTravados, reauditarSemArbitro }));

import { baterORelogio } from "@/lib/agency/despertador";
import { TIPO_COMPROMISSO_DO_SDR } from "@/lib/agency/comercial/compromisso-do-sdr";

beforeEach(() => {
  vi.clearAllMocks();
  db.project.findMany.mockResolvedValue([]);
  db.project.update.mockResolvedValue({});
  runProjectExecution.mockResolvedValue({ ok: true, status: "done", produced: [], askedClient: [], skipped: [] });
  dispatchWhatsAppNotifications.mockResolvedValue({ scanned: 0, sent: 0, failed: 0, skipped: 0, details: [] });
  pacotesTravados.mockResolvedValue([]);
  destravarPacote.mockResolvedValue({ projectId: "p1", corrigidas: [], persistentes: [], escalado: false });
  db.activityEvent.findMany.mockResolvedValue([]);
  db.client.findMany.mockResolvedValue([]);
});

describe("o relógio cobra o compromisso do SDR vencido", () => {
  it("grita com nome do cliente, o que foi prometido e há quanto tempo", async () => {
    const vencido = {
      v: 1,
      texto: "Vou conferir com o gerente de projeto se cabe no cronograma.",
      dono: "PM",
      prazoISO: new Date(Date.now() - 3 * 60 * 60_000).toISOString(),
      criadoEm: new Date(Date.now() - 4 * 60 * 60_000).toISOString(),
      clientId: "cli-marcos",
      cumprido: false,
    };
    db.activityEvent.findMany.mockImplementation(async (args: unknown) => {
      const where = (args as { where?: { type?: string } } | undefined)?.where;
      if (where?.type === TIPO_COMPROMISSO_DO_SDR) {
        return [{ clientId: "sdr:marcos-foocci", workspaceId: "ws-1", message: JSON.stringify(vencido) }];
      }
      return [];
    });
    db.client.findMany.mockResolvedValue([{ id: "cli-marcos", name: "Marcos (Foocci)" }]);

    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    await baterORelogio();
    const linhas = spy.mock.calls.map((c) => String(c[0]));
    spy.mockRestore();

    expect(
      linhas.some(
        (l) => l.includes("compromisso-do-sdr") && l.includes("Marcos (Foocci)") && l.includes("vencido há"),
      ),
      `nenhuma linha gritou o compromisso vencido. Linhas: ${JSON.stringify(linhas.slice(0, 20))}`,
    ).toBe(true);
  });

  it("compromisso ainda dentro do prazo NÃO grita, mas fica visível como estado", async () => {
    const noPrazo = {
      v: 1,
      texto: "Vou conferir com o gerente de projeto se cabe no cronograma.",
      dono: "PM",
      prazoISO: new Date(Date.now() + 3 * 60 * 60_000).toISOString(),
      criadoEm: new Date().toISOString(),
      clientId: null,
      cumprido: false,
    };
    db.activityEvent.findMany.mockImplementation(async (args: unknown) => {
      const where = (args as { where?: { type?: string } } | undefined)?.where;
      if (where?.type === TIPO_COMPROMISSO_DO_SDR) {
        return [{ clientId: "sdr:ainda-no-prazo", workspaceId: "ws-1", message: JSON.stringify(noPrazo) }];
      }
      return [];
    });

    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    await baterORelogio();
    const linhas = spy.mock.calls.map((c) => String(c[0]));
    spy.mockRestore();

    // Não grita como falha...
    expect(linhas.some((l) => l.includes("compromisso-do-sdr falhou"))).toBe(false);
    // ...mas fica visível como ESTADO (a mudança de estado é o que vira linha,
    // ver `transicaoDeEstado` — "aberto e dentro do prazo" é a régua funcionando).
    expect(linhas.some((l) => l.includes("compromisso-do-sdr") && l.includes("dentro do prazo"))).toBe(true);
  });
});
