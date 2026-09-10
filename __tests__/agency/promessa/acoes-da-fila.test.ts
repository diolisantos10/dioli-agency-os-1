// OS DOIS ATOS — `marcarContatado` e `confirmarCliente` (`app/agency/leads/page.tsx`).
//
// Rodada "a fila deixa de ser só leitura": a tela ganha dois botões que
// escrevem. Este arquivo prova as duas funções puras extraídas para o
// `fetch`, exatamente como `carregamento-das-conversas-paradas.test.ts` prova
// `carregarConversasParadas` — esta casa não tem jsdom nem testing-library
// (`vitest.config.ts` usa `environment: "node"`), então não há como "clicar"
// em teste aqui. O caminho é: extrair o `fetch` para fora do componente,
// chamar com um duplo de `global.fetch`, e provar URL, método, corpo e os
// três resultados (sucesso / recusa do servidor / rede caiu).
//
// As garantias da ficha de despacho:
//   1. a URL e o MÉTODO exatos de cada ato, e o corpo com o `fio` (e
//      `clientId`, no caso de confirmarCliente) certos;
//   2. `ok: true` → sucesso;
//   3. 409/400/503 → erro, com a MENSAGEM do servidor, nunca uma genérica;
//   4. `fetch` que lança → erro legível, nunca sucesso silencioso.

import { describe, it, expect, afterEach, vi } from "vitest";
import { marcarContatado, confirmarCliente } from "@/app/agency/leads/page";

/** Duplo de `fetch` com assinatura anotada — sem isso o TypeScript infere
 *  `never` para os parâmetros e o `tsc --noEmit` do CI quebra (TS2322/TS2493)
 *  mesmo com o vitest verde. */
function dubleDeFetch() {
  return vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
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

describe("marcarContatado", () => {
  it("chama POST /api/agency/conversas-sem-pedido/contatado, com { fio } no corpo", async () => {
    const duble = dubleDeFetch();
    duble.mockResolvedValue(respostaJson({ ok: true, jaExistia: false, contatadoEm: "2026-08-29T00:00:00.000Z", contatadoPor: "u1" }));
    vi.stubGlobal("fetch", duble);

    const resultado = await marcarContatado("sdr:foocci");

    expect(duble).toHaveBeenCalledTimes(1);
    const [url, init] = duble.mock.calls[0];
    expect(url).toBe("/api/agency/conversas-sem-pedido/contatado");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({ fio: "sdr:foocci" });
    expect(resultado).toEqual({ ok: true });
  });

  it("ok: true (mesmo já existindo — idempotente) é sucesso", async () => {
    const duble = dubleDeFetch();
    duble.mockResolvedValue(
      respostaJson({ ok: true, jaExistia: true, contatadoEm: "2026-08-20T00:00:00.000Z", contatadoPor: "u1" }),
    );
    vi.stubGlobal("fetch", duble);

    expect(await marcarContatado("sdr:foocci")).toEqual({ ok: true });
  });

  it("400 (cliente_inexistente etc.) vira erro COM a mensagem do servidor", async () => {
    const duble = dubleDeFetch();
    duble.mockResolvedValue(respostaJson({ ok: false, recusa: "fio_invalido", error: "conversa não encontrada" }, 400));
    vi.stubGlobal("fetch", duble);

    expect(await marcarContatado("sdr:x")).toEqual({ ok: false, error: "conversa não encontrada" });
  });

  it("503 (banco fora do ar) também vira erro com a mensagem do servidor", async () => {
    const duble = dubleDeFetch();
    duble.mockResolvedValue(respostaJson({ ok: false, recusa: "escrita_falhou", error: "não consegui gravar agora" }, 503));
    vi.stubGlobal("fetch", duble);

    expect(await marcarContatado("sdr:x")).toEqual({ ok: false, error: "não consegui gravar agora" });
  });

  it("resposta sem mensagem reconhecível cai no motivo padrão, nunca em undefined", async () => {
    const duble = dubleDeFetch();
    duble.mockResolvedValue(respostaJson({}, 400));
    vi.stubGlobal("fetch", duble);

    expect(await marcarContatado("sdr:x")).toEqual({ ok: false, error: "o servidor não confirmou o registro" });
  });

  it("fetch que lança (rede caiu) NUNCA vira sucesso silencioso", async () => {
    const duble = vi.fn(async (): Promise<Response> => {
      throw new Error("network error");
    });
    vi.stubGlobal("fetch", duble);

    expect(await marcarContatado("sdr:x")).toEqual({
      ok: false,
      error: "não consegui falar com o servidor — tente de novo",
    });
  });
});

describe("confirmarCliente", () => {
  it("chama POST /api/agency/conversas-sem-pedido/atribuir, com { fio, clientId } no corpo", async () => {
    const duble = dubleDeFetch();
    duble.mockResolvedValue(
      respostaJson({
        ok: true,
        jaExistia: false,
        atribuicao: { clientId: "client_1", atribuidoPor: "u1", atribuidoEm: "2026-08-29T00:00:00.000Z", fio: "sdr:convite" },
      }),
    );
    vi.stubGlobal("fetch", duble);

    const resultado = await confirmarCliente("sdr:convite", "client_1");

    expect(duble).toHaveBeenCalledTimes(1);
    const [url, init] = duble.mock.calls[0];
    expect(url).toBe("/api/agency/conversas-sem-pedido/atribuir");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({ fio: "sdr:convite", clientId: "client_1" });
    expect(resultado).toEqual({ ok: true });
  });

  it("409 (já atribuída a outro / já virou pedido) vira erro COM a mensagem do servidor", async () => {
    const duble = dubleDeFetch();
    duble.mockResolvedValue(
      respostaJson({ ok: false, recusa: "ja_atribuida_a_outro", error: "esta conversa já é de outro cliente" }, 409),
    );
    vi.stubGlobal("fetch", duble);

    expect(await confirmarCliente("sdr:convite", "client_1")).toEqual({
      ok: false,
      error: "esta conversa já é de outro cliente",
    });
  });

  it("400 (cliente_inexistente) vira erro com a mensagem do servidor", async () => {
    const duble = dubleDeFetch();
    duble.mockResolvedValue(respostaJson({ ok: false, recusa: "cliente_inexistente", error: "este cliente não existe" }, 400));
    vi.stubGlobal("fetch", duble);

    expect(await confirmarCliente("sdr:convite", "client_x")).toEqual({
      ok: false,
      error: "este cliente não existe",
    });
  });

  it("503 (banco fora do ar) vira erro com a mensagem do servidor", async () => {
    const duble = dubleDeFetch();
    duble.mockResolvedValue(respostaJson({ ok: false, recusa: "leitura_falhou", error: "não consegui ler agora" }, 503));
    vi.stubGlobal("fetch", duble);

    expect(await confirmarCliente("sdr:convite", "client_1")).toEqual({
      ok: false,
      error: "não consegui ler agora",
    });
  });

  it("fetch que lança (rede caiu) NUNCA vira sucesso silencioso", async () => {
    const duble = vi.fn(async (): Promise<Response> => {
      throw new Error("network error");
    });
    vi.stubGlobal("fetch", duble);

    expect(await confirmarCliente("sdr:convite", "client_1")).toEqual({
      ok: false,
      error: "não consegui falar com o servidor — tente de novo",
    });
  });
});
