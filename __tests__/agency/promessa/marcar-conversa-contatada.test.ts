// O CARIMBO `contatadoEm`/`contatadoPor` — a saída da fila que não apaga o
// rastro.
//
// Prova, nesta ordem, exatamente o que a ficha de despacho pede:
// 1. o rastro nasce sem `contatadoEm`; depois do ato, tem;
// 2. o ato SOBREVIVE ao próximo turno do SDR — o teste que mais importa;
// 3. idempotência: marcar duas vezes não move a data;
// 4. o rastro NÃO é apagado pelo ato;
// 5. a rota nova: sem sessão → 401; sessão de portal → 403; CSRF → 403; o
//    autor gravado é o da sessão, mesmo quando o corpo manda outro;
// 6. a rota de leitura devolve `contatadoEm`.

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const WS = "ws_dioli";
const OUTRO_WS = "ws_outra_agencia";
const FIO = "sdr:conversa-lead-2901";
const OPERADOR = "user_diretor";
const OUTRO_OPERADOR = "user_outro";

// ─── O BANCO FALSO COM ESTADO ────────────────────────────────────────────────
const estado = vi.hoisted(() => ({
  eventos: [] as { id: string; clientId: string | null; message: string; timestamp: Date; workspaceId: string; type: string }[],
}));

const db = vi.hoisted(() => {
  const e = estado;
  let seq = 0;
  return {
    activityEvent: {
      findFirst: vi.fn(
        async ({ where }: { where: { type?: string; clientId?: string; workspaceId?: string } }) =>
          e.eventos.find(
            (l) =>
              (!where.type || l.type === where.type) &&
              (where.clientId === undefined || l.clientId === where.clientId) &&
              (!where.workspaceId || l.workspaceId === where.workspaceId),
          ) ?? null,
      ),
      findMany: vi.fn(
        async ({ where }: { where: { type?: string; workspaceId?: string } }) =>
          e.eventos.filter(
            (l) => (!where.type || l.type === where.type) && (!where.workspaceId || l.workspaceId === where.workspaceId),
          ),
      ),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const l = e.eventos.find((x) => x.id === where.id);
        if (l) Object.assign(l, data);
        return l;
      }),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const linha = { id: `ev_${++seq}`, timestamp: new Date(), ...data } as (typeof e.eventos)[number];
        e.eventos.push(linha);
        return linha;
      }),
      deleteMany: vi.fn(async ({ where }: { where: { clientId: string } }) => {
        const antes = e.eventos.length;
        e.eventos = e.eventos.filter((l) => l.clientId !== where.clientId);
        return { count: antes - e.eventos.length };
      }),
    },
  };
});
vi.mock("@/lib/db/client", () => ({ prisma: db }));

const sessao = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("@/lib/auth/session", async (original) => {
  const real = await original<typeof import("@/lib/auth/session")>();
  return { ...real, getSession: sessao.getSession };
});

import { guardarRastroDaConversa, conversasSemPedido, proximaAcaoDoRastro } from "@/lib/agency/comercial/conversa-sem-pedido";
import { marcarConversaComoContatada } from "@/lib/agency/comercial/marcar-conversa-contatada";
import { POST } from "@/app/api/agency/conversas-sem-pedido/contatado/route";
import { GET } from "@/app/api/agency/conversas-sem-pedido/route";

const SESSAO_AGENCIA = { userId: OPERADOR, email: "diretor@dioli.com", name: "Diretor", role: "master", workspaceId: WS };

function rastroOrfao(over: { workspaceId?: string; fio?: string } = {}) {
  return {
    id: "ev_rastro",
    type: "conversa_sem_pedido",
    clientId: over.fio ?? FIO,
    workspaceId: over.workspaceId ?? WS,
    timestamp: new Date("2026-08-27T16:43:00.000Z"),
    message: JSON.stringify({
      v: 4,
      escopo: { businessName: "Lead 2901" },
      contato: { nome: "Fulano", email: "fulano@lead.com" },
      turnos: 5,
      prometidoEm: "2026-08-27T16:43:00.000Z",
    }),
  };
}

function pedidoDeContato(corpo: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/agency/conversas-sem-pedido/contatado", {
    method: "POST",
    headers: { "content-type": "application/json", "sec-fetch-site": "same-origin" },
    body: JSON.stringify(corpo),
  });
}

function pedidoDeLeitura() {
  return new NextRequest("http://localhost/api/agency/conversas-sem-pedido", {
    method: "GET",
    headers: { "sec-fetch-site": "same-origin" },
  });
}

beforeEach(() => {
  estado.eventos = [];
  vi.clearAllMocks();
  sessao.getSession.mockResolvedValue(SESSAO_AGENCIA);
});

// ════════════════════════════════════════════════════════════════════════════
describe("1. o rastro nasce sem contatadoEm, e o ato o grava", () => {
  it("guardarRastroDaConversa nasce com contatadoEm: null", async () => {
    await guardarRastroDaConversa({ sessionId: "s1", workspaceId: WS, escopo: { businessName: "X" } });
    const [r] = await conversasSemPedido(WS, 50);
    expect(r.contatadoEm).toBeNull();
    expect(r.contatadoPor).toBeNull();
  });

  it("marcarConversaComoContatada grava contatadoEm/contatadoPor no rastro existente", async () => {
    estado.eventos.push(rastroOrfao());
    const res = await marcarConversaComoContatada({ fio: FIO, contatadoPor: OPERADOR, workspaceId: WS });
    expect(res.ok).toBe(true);

    const [r] = await conversasSemPedido(WS, 50);
    expect(r.contatadoEm).toBeInstanceOf(Date);
    expect(r.contatadoPor).toBe(OPERADOR);
  });

  it("a próxima ação muda de tom quando contatado", async () => {
    estado.eventos.push(rastroOrfao());
    await marcarConversaComoContatada({ fio: FIO, contatadoPor: OPERADOR, workspaceId: WS });
    const [r] = await conversasSemPedido(WS, 50);
    expect(proximaAcaoDoRastro(r)).toMatch(/já contatou/i);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe("2. o ato SOBREVIVE ao próximo turno do SDR — a trava que mais importa", () => {
  it("guardarRastroDaConversa preserva contatadoEm/contatadoPor já gravados", async () => {
    estado.eventos.push(rastroOrfao());
    const marcado = await marcarConversaComoContatada({ fio: FIO, contatadoPor: OPERADOR, workspaceId: WS });
    expect(marcado.ok).toBe(true);

    // O cliente volta à aba e escreve mais uma coisa. `guardarRastroDaConversa`
    // reescreve a carga inteira — e o ato do humano tem de sobreviver a isso.
    await guardarRastroDaConversa({
      sessionId: "conversa-lead-2901",
      workspaceId: WS,
      escopo: { businessName: "Lead 2901", extra: true },
      turnos: 6,
    });

    const [r] = await conversasSemPedido(WS, 50);
    // ── A MUTAÇÃO QUE ESTE `expect` MATA ────────────────────────────────
    // Apague a preservação de `contatadoEm`/`contatadoPor` em
    // `guardarRastroDaConversa`. O próximo turno do SDR apaga o ato do
    // humano em silêncio, e a fila volta a cobrar um contato que já houve.
    expect(r.contatadoEm).toBeInstanceOf(Date);
    expect(r.contatadoPor).toBe(OPERADOR);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe("3. idempotência — marcar duas vezes não move a data", () => {
  it("a segunda marcação devolve jaExistia:true e preserva a data e o autor originais", async () => {
    estado.eventos.push(rastroOrfao());
    const primeira = await marcarConversaComoContatada({ fio: FIO, contatadoPor: OPERADOR, workspaceId: WS });
    expect(primeira.ok).toBe(true);
    if (!primeira.ok) throw new Error("unreachable");

    // Outro operador clica depois — o ato original é o que vale.
    const segunda = await marcarConversaComoContatada({ fio: FIO, contatadoPor: OUTRO_OPERADOR, workspaceId: WS });
    expect(segunda.ok).toBe(true);
    if (!segunda.ok) throw new Error("unreachable");

    expect(segunda.jaExistia).toBe(true);
    expect(segunda.contatadoEm).toBe(primeira.contatadoEm);
    expect(segunda.contatadoPor).toBe(OPERADOR);
    expect(segunda.contatadoPor).not.toBe(OUTRO_OPERADOR);

    // E nenhuma segunda escrita ocorreu.
    expect(db.activityEvent.update).toHaveBeenCalledTimes(1);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe("4. o ato NÃO apaga o rastro", () => {
  it("o rastro continua legível e listável depois de marcado", async () => {
    estado.eventos.push(rastroOrfao());
    await marcarConversaComoContatada({ fio: FIO, contatadoPor: OPERADOR, workspaceId: WS });

    expect(estado.eventos.filter((l) => l.type === "conversa_sem_pedido")).toHaveLength(1);
    const [r] = await conversasSemPedido(WS, 50);
    expect(r.fio).toBe(FIO);
    expect(r.escopo).toEqual({ businessName: "Lead 2901" });
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe("5. a rota nova — as mesmas guardas da rota irmã", () => {
  it("sem sessão: 401", async () => {
    sessao.getSession.mockResolvedValue(null);
    const res = await POST(pedidoDeContato({ fio: FIO }));
    expect(res.status).toBe(401);
  });

  it("⛔ sessão de PORTAL (com clientId) não marca contato — 403", async () => {
    estado.eventos.push(rastroOrfao());
    sessao.getSession.mockResolvedValue({ ...SESSAO_AGENCIA, clientId: "algum_cliente" });
    const res = await POST(pedidoDeContato({ fio: FIO }));
    expect(res.status).toBe(403);
    expect(estado.eventos[0].message).not.toContain("contatadoEm");
  });

  it("papel que não é de agência: 403", async () => {
    sessao.getSession.mockResolvedValue({ ...SESSAO_AGENCIA, role: "client" });
    expect((await POST(pedidoDeContato({ fio: FIO }))).status).toBe(403);
  });

  it("mutação cross-site é barrada — CSRF", async () => {
    estado.eventos.push(rastroOrfao());
    const req = new NextRequest("http://localhost/api/agency/conversas-sem-pedido/contatado", {
      method: "POST",
      headers: { "content-type": "application/json", "sec-fetch-site": "cross-site" },
      body: JSON.stringify({ fio: FIO }),
    });
    expect((await POST(req)).status).toBe(403);
    expect(estado.eventos[0].message).not.toContain("contatadoEm");
  });

  it("⛔ contatadoPor sai da SESSÃO — o corpo é IGNORADO", async () => {
    estado.eventos.push(rastroOrfao());
    const res = await POST(pedidoDeContato({ fio: FIO, contatadoPor: "user_falsificado" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.contatadoPor).toBe(OPERADOR);
    expect(json.contatadoPor).not.toBe("user_falsificado");

    const [r] = await conversasSemPedido(WS, 50);
    expect(r.contatadoPor).toBe(OPERADOR);
  });

  it("rastro de OUTRO workspace não é marcável — a fronteira de inquilino", async () => {
    estado.eventos.push(rastroOrfao({ workspaceId: OUTRO_WS }));
    const res = await POST(pedidoDeContato({ fio: FIO }));
    expect(res.status).toBe(400);
    expect((await res.json()).recusa).toBe("rastro_inexistente");
  });

  it("fio ausente: recusa, nunca um padrão de conveniência", async () => {
    expect((await POST(pedidoDeContato({}))).status).toBe(400);
  });

  it("fio inexistente: 400 com rastro_inexistente", async () => {
    const res = await POST(pedidoDeContato({ fio: "sdr:nao-existe" }));
    expect(res.status).toBe(400);
    expect((await res.json()).recusa).toBe("rastro_inexistente");
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe("6. a rota de leitura devolve o carimbo", () => {
  it("GET devolve contatadoEm/contatadoPor depois do ato, e null antes", async () => {
    estado.eventos.push(rastroOrfao());

    const antes = await GET(pedidoDeLeitura());
    const jAntes = await antes.json();
    expect(jAntes.conversas[0].contatadoEm).toBeNull();
    expect(jAntes.conversas[0].contatadoPor).toBeNull();

    await POST(pedidoDeContato({ fio: FIO }));

    const depois = await GET(pedidoDeLeitura());
    const jDepois = await depois.json();
    expect(typeof jDepois.conversas[0].contatadoEm).toBe("string");
    expect(jDepois.conversas[0].contatadoPor).toBe(OPERADOR);
    // ⛔ venceEm continua null — o CEO não ratificou prazo.
    expect(jDepois.conversas[0].venceEm).toBeNull();
  });
});
