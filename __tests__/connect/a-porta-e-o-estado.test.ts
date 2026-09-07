/**
 * ⭐ A PORTA DO RETORNO E OS ESTADOS DA PENDÊNCIA.
 *
 * Duas coisas que só se provam separadas do fluxo feliz:
 *
 *   1. ⚠️ A ARMADILHA DO NEXT. O contrato avisa: middleware que derruba rota
 *      fora de `PUBLIC_PATHS` faz o handler NUNCA RODAR, e o 401 genérico do
 *      middleware se disfarça de recusa da porta. Aqui o `proxy` de verdade é
 *      chamado com a URL de verdade.
 *   2. ⭐ A DECISÃO C4. "Recebeu" e "entregou ao cliente" são duas coisas, e
 *      receber sem entregar mantém a pendência ABERTA — em `AGUARDANDO_ENVIO`,
 *      que é fila humana pronta para envio e NÃO conta como respondida.
 */

import { describe, it, expect } from "vitest";
import { proxy } from "@/proxy";
import { armazemDePendenciasNoBanco } from "@/lib/agency/connect/conector/dioli-digital/armazem";
import { receberRetorno } from "@/lib/agency/connect/conector/retorno";
import { VERSAO_DO_CONTRATO } from "@/lib/agency/connect/conector/versao";
import { CAMINHO_DO_RETORNO } from "@/lib/agency/connect/conector/contrato";
import { bancoDeMentira } from "./_banco-de-mentira";
import type { LigacaoLocal } from "@/lib/agency/connect/conector/ligacaoLocal";

// ═══════════════════════════════════════════════════════════════════════════
describe("⚠️ A ARMADILHA DO NEXT — o handler PRECISA chegar a rodar", () => {
  function requisicao(pathname: string) {
    return {
      nextUrl: { pathname, clone: () => new URL(`https://d.test${pathname}`), searchParams: new URLSearchParams() },
      cookies: { get: () => undefined },
      headers: { get: () => null },
      url: `https://d.test${pathname}`,
    };
  }

  it("⭐ /api/connect/retorno ATRAVESSA o middleware — sem redirect, sem 401", async () => {
    const r = await proxy(requisicao(CAMINHO_DO_RETORNO) as never);
    // `NextResponse.next()` não redireciona e não carrega o cabeçalho de negação.
    expect(r.status, "o middleware barrou a rota do retorno").toBeLessThan(300);
    expect(r.headers.get("x-dioli-acesso")).not.toBe("negado");
    expect(r.headers.get("location")).toBeNull();
  });

  it("⭐ o caminho EXATO do contrato é o que foi conferido, não um parecido", () => {
    // Se alguém renomear a rota e esquecer o middleware, é aqui que aparece.
    expect(CAMINHO_DO_RETORNO).toBe("/api/connect/retorno");
  });

  it("⭐ A OUTRA METADE — uma rota protegida CONTINUA sendo barrada", async () => {
    // Se `proxy` liberasse tudo, o teste acima passaria sem medir nada.
    const r = await proxy(requisicao("/agency/settings") as never);
    expect(r.status >= 300 || r.headers.get("x-dioli-acesso") === "negado").toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("⭐⭐ C4 — receber não é entregar", () => {
  /** Uma ligação local cuja fala com o cliente FALHA, de propósito. */
  function ligacaoQueNaoConsegueFalar(banco: ReturnType<typeof bancoDeMentira>): LigacaoLocal {
    return {
      produto: "dioli-digital",
      canal: "portal-do-cliente",
      agente: "pm-responde",
      armazem: armazemDePendenciasNoBanco(banco),
      async falarComOCliente() {
        return { registrada: false, entregue: false, causa: "canalIndisponivel" };
      },
    };
  }

  function comPendenciaAberta() {
    const banco = bancoDeMentira();
    const protocolo = "dioli-digital:cliente-x:sufixo-1";
    banco.linhas.push({
      protocolo,
      produto: "dioli-digital",
      conversa: "cliente-x",
      canal: "portal-do-cliente",
      agente: "pm-responde",
      fio: "fio-1",
      assunto: "desconto",
      estado: "PENDENTE",
      avisadoEm: new Date("2026-08-30T12:00:00.000Z"),
      respondidaEm: null,
      criadaEm: new Date("2026-08-30T12:00:00.000Z"),
    });
    return { banco, protocolo };
  }

  const RETORNO = {
    versaoDoContrato: VERSAO_DO_CONTRATO,
    decisao: "respondida" as const,
    respostaAoCliente: "Consigo 10% no trimestre.",
  };

  it("⭐ a fala falhou: a pendência NÃO é dada por respondida", async () => {
    const { banco, protocolo } = comPendenciaAberta();

    const r = await receberRetorno({ ...RETORNO, protocolo }, ligacaoQueNaoConsegueFalar(banco));

    expect(r.estado).toBe("recusado");
    const p = banco.linhas[0]!;
    // ⭐ Continua sendo assunto do cliente, e `respondidaEm` NÃO foi carimbado.
    expect(p.estado).toBe("PENDENTE");
    expect(p.respondidaEm).toBeNull();
    // ⛔ E nada foi escrito na conversa.
    expect(banco.mensagens).toHaveLength(0);
  });

  it("⭐ registrarResposta com entregueAoCliente:false → AGUARDANDO_ENVIO", async () => {
    const { banco, protocolo } = comPendenciaAberta();
    const armazem = armazemDePendenciasNoBanco(banco);

    await armazem.registrarResposta(protocolo, {
      decisao: "respondida",
      entregueAoCliente: false,
      em: new Date("2026-08-30T13:00:00.000Z"),
    });

    const p = banco.linhas[0]!;
    expect(p.estado).toBe("AGUARDANDO_ENVIO");
    // ⚠️ `respondidaEm` responde "quando ESTA PESSOA foi respondida". Ela não foi.
    expect(p.respondidaEm).toBeNull();
    // ⭐ E ela continua aparecendo como assunto aberto daquele cliente.
    const abertas = await armazem.abertasDaConversa("cliente-x");
    expect(abertas.map((a) => a.estado)).toEqual(["AGUARDANDO_ENVIO"]);
  });

  it("⭐ A OUTRA METADE — entregueAoCliente:true → RESPONDIDA, e sai da fila", async () => {
    const { banco, protocolo } = comPendenciaAberta();
    const armazem = armazemDePendenciasNoBanco(banco);
    const em = new Date("2026-08-30T13:00:00.000Z");

    await armazem.registrarResposta(protocolo, { decisao: "respondida", entregueAoCliente: true, em });

    expect(banco.linhas[0]!.estado).toBe("RESPONDIDA");
    expect(banco.linhas[0]!.respondidaEm).toEqual(em);
    expect(await armazem.abertasDaConversa("cliente-x")).toHaveLength(0);
  });

  it("⭐ `recusada` e `encerrada` entregues terminam em ENCERRADA — não em RESPONDIDA", async () => {
    for (const decisao of ["recusada", "encerrada"] as const) {
      const { banco, protocolo } = comPendenciaAberta();
      const armazem = armazemDePendenciasNoBanco(banco);
      await armazem.registrarResposta(protocolo, { decisao, entregueAoCliente: true, em: new Date() });
      expect(banco.linhas[0]!.estado, `decisão "${decisao}"`).toBe("ENCERRADA");
    }
  });

  it("⭐ registrarResposta é IDEMPOTENTE — o segundo retorno não reescreve o primeiro", async () => {
    const { banco, protocolo } = comPendenciaAberta();
    const armazem = armazemDePendenciasNoBanco(banco);
    const primeira = new Date("2026-08-30T13:00:00.000Z");

    await armazem.registrarResposta(protocolo, { decisao: "respondida", entregueAoCliente: true, em: primeira });
    await armazem.registrarResposta(protocolo, {
      decisao: "encerrada",
      entregueAoCliente: false,
      em: new Date("2026-08-30T20:00:00.000Z"),
    });

    // ⚠️ A segunda não achou nada em PENDENTE — e é assim que a reentrega do
    // núcleo não desfaz uma entrega que já aconteceu.
    expect(banco.linhas[0]!.estado).toBe("RESPONDIDA");
    expect(banco.linhas[0]!.respondidaEm).toEqual(primeira);
  });

  it("⭐ marcarAvisado só grava a PRIMEIRA vez", async () => {
    const banco = bancoDeMentira();
    const armazem = armazemDePendenciasNoBanco(banco);
    const p = await armazem.abrir({
      protocolo: "dioli-digital:cliente-y:s1",
      produto: "dioli-digital",
      conversa: "cliente-y",
      canal: "portal-do-cliente",
      agente: "pm-responde",
      fio: null,
      assunto: "prazo",
      criadaEm: new Date("2026-08-30T12:00:00.000Z"),
      avisadoEm: null,
    });
    expect(p.avisadoEm).toBeNull();

    const primeiro = new Date("2026-08-30T12:01:00.000Z");
    await armazem.marcarAvisado(p.protocolo, primeiro);
    await armazem.marcarAvisado(p.protocolo, new Date("2026-08-30T18:00:00.000Z"));

    // Se a data andasse, o cliente ouviria a mesma frase de novo mais tarde.
    expect(banco.linhas[0]!.avisadoEm).toEqual(primeiro);
  });

  it("⚠️ estado corrompido no banco é lido como ENCERRADA, nunca como PENDENTE", async () => {
    const { banco, protocolo } = comPendenciaAberta();
    banco.linhas[0]!.estado = "LIXO_QUE_NAO_EXISTE";
    const armazem = armazemDePendenciasNoBanco(banco);

    const p = await armazem.porProtocolo(protocolo);
    // Fail-closed: uma linha que o produto não sabe explicar não entrega nada.
    expect(p!.estado).toBe("ENCERRADA");
  });
});
