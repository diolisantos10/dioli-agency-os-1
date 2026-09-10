// O CARIMBO `prometidoEm` NO RASTRO — quando a casa passou a dever contato.
//
// Prova, nesta ordem: (1) o rastro nasce com `prometidoEm` quando o turno
// prometeu, e com `null` quando não; (2) a PRIMEIRA promessa vale — um turno
// posterior não reinicia o relógio; (3) a conversa que virou pedido some da
// fila mesmo já tendo um carimbo gravado; (4) a leitura devolve `prometidoEm`
// como `Date` (ou `null` para rastro antigo sem o campo).

import { describe, it, expect, beforeEach, vi } from "vitest";

const db = vi.hoisted(() => ({
  activityEvent: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(
      async (): Promise<Array<{ clientId: string; message: string; timestamp: Date; workspaceId: string }>> => [],
    ),
    deleteMany: vi.fn(async (): Promise<{ count: number }> => ({ count: 0 })),
  },
}));
vi.mock("@/lib/db/client", () => ({ prisma: db }));

import {
  guardarRastroDaConversa,
  resolverRastroDaConversa,
  conversasSemPedido,
  TIPO_CONVERSA_SEM_PEDIDO,
} from "@/lib/agency/comercial/conversa-sem-pedido";

beforeEach(() => {
  vi.clearAllMocks();
  db.activityEvent.findFirst.mockResolvedValue(null);
  db.activityEvent.create.mockResolvedValue({});
  db.activityEvent.update.mockResolvedValue({});
});

function cargaCriada(): Record<string, unknown> {
  const chamada = db.activityEvent.create.mock.calls[0] as unknown as [{ data: { message: string } }];
  return JSON.parse(chamada[0].data.message) as Record<string, unknown>;
}

function cargaAtualizada(): Record<string, unknown> {
  const chamada = db.activityEvent.update.mock.calls[0] as unknown as [{ data: { message: string } }];
  return JSON.parse(chamada[0].data.message) as Record<string, unknown>;
}

describe("o rastro nasce com o carimbo certo", () => {
  it("prometeuContato:true grava prometidoEm (v4, ISO válido)", async () => {
    const ok = await guardarRastroDaConversa({
      sessionId: "s1",
      workspaceId: "ws",
      escopo: { businessName: "Foocci" },
      prometeuContato: true,
    });
    expect(ok).toBe(true);
    const carga = cargaCriada();
    // A versão da carga é CONTRATO, e este `toBe` é um arame de tropeço de
    // propósito: subir a versão tem de ser ato consciente de quem sobe, com o
    // leitor das versões antigas ajustado no mesmo commit. `4` virou `5` em
    // 29/08/2026, quando o ato "a casa contatou esta pessoa" entrou na carga.
    expect(carga.v).toBe(5);
    expect(typeof carga.prometidoEm).toBe("string");
    expect(new Date(carga.prometidoEm as string).toString()).not.toBe("Invalid Date");
  });

  it("sem prometeuContato o rastro nasce com prometidoEm: null", async () => {
    await guardarRastroDaConversa({
      sessionId: "s1",
      workspaceId: "ws",
      escopo: { businessName: "Foocci" },
    });
    expect(cargaCriada().prometidoEm).toBeNull();
  });
});

describe("a PRIMEIRA promessa é a que vale", () => {
  it("um turno posterior com prometeuContato:true NÃO reinicia o relógio", async () => {
    const primeiraCarga = {
      v: 4,
      escopo: { businessName: "Foocci" },
      contato: null,
      turnos: 1,
      prometidoEm: "2026-08-29T01:00:00.000Z",
    };
    db.activityEvent.findFirst.mockResolvedValue({ id: "ev-1", message: JSON.stringify(primeiraCarga) });

    await guardarRastroDaConversa({
      sessionId: "s1",
      workspaceId: "ws",
      escopo: { businessName: "Foocci", extra: true },
      prometeuContato: true, // segunda promessa, turno seguinte
    });

    expect(db.activityEvent.update).toHaveBeenCalledTimes(1);
    expect(cargaAtualizada().prometidoEm).toBe("2026-08-29T01:00:00.000Z");
  });

  it("uma conversa que NUNCA prometeu segue null mesmo depois de vários turnos", async () => {
    const semPromessa = { v: 4, escopo: {}, contato: null, turnos: 3, prometidoEm: null };
    db.activityEvent.findFirst.mockResolvedValue({ id: "ev-1", message: JSON.stringify(semPromessa) });

    await guardarRastroDaConversa({
      sessionId: "s1",
      workspaceId: "ws",
      escopo: { extra: true },
    });

    expect(cargaAtualizada().prometidoEm).toBeNull();
  });
});

describe("a conversa que virou pedido some da fila", () => {
  it("resolverRastroDaConversa apaga a linha mesmo com prometidoEm gravado", async () => {
    db.activityEvent.deleteMany.mockResolvedValue({ count: 1 });
    expect(await resolverRastroDaConversa("prospect-com-promessa")).toBe(1);
    expect(db.activityEvent.deleteMany).toHaveBeenCalledWith({
      where: { type: TIPO_CONVERSA_SEM_PEDIDO, clientId: "sdr:prospect-com-promessa" },
    });
  });
});

describe("a leitura devolve o carimbo", () => {
  it("prometidoEm vira Date quando gravado, e null para rastro v1 sem o campo", async () => {
    db.activityEvent.findMany.mockResolvedValue([
      {
        clientId: "sdr:a",
        message: JSON.stringify({
          v: 4, escopo: {}, contato: null, turnos: 1, prometidoEm: "2026-08-29T01:00:00.000Z",
        }),
        timestamp: new Date("2026-08-29T02:00:00.000Z"),
        workspaceId: "ws",
      },
      {
        clientId: "sdr:b",
        message: JSON.stringify({ v: 1, escopo: {}, contato: null, turnos: 1 }),
        timestamp: new Date("2026-08-27T01:00:00.000Z"),
        workspaceId: "ws",
      },
    ]);

    const r = await conversasSemPedido("ws");
    expect(r).toHaveLength(2);
    expect(r[0]!.prometidoEm).toEqual(new Date("2026-08-29T01:00:00.000Z"));
    expect(r[1]!.prometidoEm).toBeNull();
  });
});
