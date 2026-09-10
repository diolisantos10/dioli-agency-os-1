// A PROVA DO CHAMADOR — rodada 2 do despacho `interface` (29/08/2026).
//
// A rodada 1 provou que `SecaoConversasParadas` RENDERIZA quando recebe
// `resposta` por prop. Ela NÃO provava que alguém chama
// `/api/agency/conversas-sem-pedido` — se o `fetch` fosse apagado de
// `app/agency/leads/page.tsx`, aquela suíte continuava verde e a fila
// voltava a ser invisível. Exatamente a "trava sem fechadura" que esta
// segunda fonte existe para fechar, um nível abaixo.
//
// Este arquivo mede `carregarConversasParadas`, a função pura extraída de
// `LeadsPage` para carregar a fila: ela FAZ o `fetch`, lê o corpo e devolve
// o estado — sem tocar em `useState`. É chamada direto, com um duplo de
// `fetch` no lugar do `global.fetch`, porque esta casa não tem jsdom nem
// testing-library (`vitest.config.ts` usa `environment: "node"`) e
// `useEffect` não roda em teste aqui.
//
// As quatro garantias da ficha de despacho:
//   1. a URL chamada é exatamente `/api/agency/conversas-sem-pedido`;
//   2. resposta 200 bem formada → estado `ok` com as conversas;
//   3. resposta 503 → estado `nao_medido` (nunca lista vazia);
//   4. `fetch` que lança → estado `nao_medido` com motivo honesto.

import { describe, it, expect, afterEach, vi } from "vitest";
import { carregarConversasParadas } from "@/app/agency/leads/page";

/** Duplo de `fetch` com assinatura anotada — sem isso o TypeScript infere
 *  `never` para o corpo em `mockResolvedValue`/`mockRejectedValue` e o
 *  `tsc --noEmit` do CI quebra (TS2322/TS2493) mesmo com o vitest verde. */
function dubleDeFetch() {
  return vi.fn<(input: RequestInfo | URL) => Promise<Response>>(
    async () => new Response("{}", { status: 200 }),
  );
}

function respostaJson(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("a URL chamada é exatamente a da rota", () => {
  it("chama /api/agency/conversas-sem-pedido, e nenhuma outra", async () => {
    const duble = dubleDeFetch();
    duble.mockResolvedValue(respostaJson({ total: 0, conversas: [] }));
    vi.stubGlobal("fetch", duble);

    await carregarConversasParadas();

    expect(duble).toHaveBeenCalledTimes(1);
    const [urlChamada] = duble.mock.calls[0];
    expect(urlChamada).toBe("/api/agency/conversas-sem-pedido");
  });
});

describe("resposta 200 bem formada", () => {
  it("estado vira ok, com total e conversas repassados sem reescrita", async () => {
    const conversa = {
      fio: "sdr:foocci",
      turnos: 5,
      paradaEm: "2026-08-27T12:00:00.000Z",
      contato: { nome: "Foocci", whatsapp: "5511900000000" },
      escopo: { businessName: "Foocci" },
      proximaAcao: "responder por WhatsApp",
      prometidoEm: "2026-08-26T12:00:00.000Z",
    };
    const duble = dubleDeFetch();
    duble.mockResolvedValue(respostaJson({ total: 1, conversas: [conversa] }));
    vi.stubGlobal("fetch", duble);

    const resultado = await carregarConversasParadas();

    expect(resultado).toEqual({ estado: "ok", total: 1, conversas: [conversa] });
  });

  it("sem `total` no corpo, usa o tamanho da lista de conversas", async () => {
    const duble = dubleDeFetch();
    duble.mockResolvedValue(respostaJson({ conversas: [] }));
    vi.stubGlobal("fetch", duble);

    const resultado = await carregarConversasParadas();

    expect(resultado).toEqual({ estado: "ok", total: 0, conversas: [] });
  });
});

describe("resposta 503 (ou qualquer !ok) vira nao_medido — NUNCA lista vazia", () => {
  it("503 com corpo de erro: estado nao_medido, motivo repassado", async () => {
    const duble = dubleDeFetch();
    duble.mockResolvedValue(respostaJson({ error: "o banco não respondeu agora" }, 503));
    vi.stubGlobal("fetch", duble);

    const resultado = await carregarConversasParadas();

    expect(resultado).toEqual({
      estado: "nao_medido",
      motivo: "o banco não respondeu agora",
    });
  });

  it("200 com corpo mal formado (sem `conversas` como array) também vira nao_medido", async () => {
    const duble = dubleDeFetch();
    duble.mockResolvedValue(respostaJson({ ok: true }));
    vi.stubGlobal("fetch", duble);

    const resultado = await carregarConversasParadas();

    expect(resultado.estado).toBe("nao_medido");
  });

  it("503 sem corpo de erro reconhecível cai no motivo padrão da tela, não em undefined", async () => {
    const duble = dubleDeFetch();
    duble.mockResolvedValue(respostaJson({}, 503));
    vi.stubGlobal("fetch", duble);

    const resultado = await carregarConversasParadas();

    expect(resultado).toEqual({
      estado: "nao_medido",
      motivo: "as conversas que pararam na sala não puderam ser lidas agora",
    });
  });
});

describe("fetch que lança (rede caiu) vira nao_medido com motivo honesto", () => {
  it("nunca lança para fora, nunca vira lista vazia", async () => {
    const duble = vi.fn(async (): Promise<Response> => {
      throw new Error("network error");
    });
    vi.stubGlobal("fetch", duble);

    const resultado = await carregarConversasParadas();

    expect(resultado).toEqual({
      estado: "nao_medido",
      motivo: "não consegui falar com o servidor — esta lista não é zero, é desconhecida",
    });
  });
});
