/**
 * ⭐⭐ O CONTRATO DO DESPACHO, MEDIDO CONTRA O NÚCLEO REAL (30/08/2026).
 *
 * O operador técnico disparou o corpo EXATO que `conector/dioli-digital/
 * escalada.ts` montava e trouxe a resposta literal do núcleo em produção. Dois
 * defeitos desta casa saíram dali, e este arquivo trava os dois.
 *
 *   DEFEITO A — o campo é `foraDaAlcada`, não `assuntos`:
 *     {"estado":"recusado","codigo":"sem_assuntos_fora_da_alcada",
 *      "motivo":"o despacho nao declarou 'foraDaAlcada' ..."}
 *     Toda escalada da Dioli Digital era recusada. E `pergunta` não é lido: o
 *     campo é `mensagem`.
 *
 *   DEFEITO B — a resposta traz `fioId`, e o produto lia `fio`. ⚠️ Este é o
 *     silencioso: a consulta ABRE no núcleo e o produto a grava sem fio,
 *     dizendo no rastro que "o núcleo não devolveu fio". Cliente esperando a
 *     resposta de uma pergunta que a empresa acha que abriu pela metade.
 *
 * ⚠️ O QUE AINDA NÃO ESTÁ AQUI: o núcleo também exige `de` e `para`, chaves
 * resolvidas contra o diretório corporativo dele. As da Dioli Digital não foram
 * medidas, e crachá não se inventa — ver o PR. Só o PRIMEIRO erro aparece por
 * vez na resposta do núcleo, então o `de`/`para` só será visto depois que estes
 * dois estiverem corrigidos lá.
 */

import { describe, it, expect, vi } from "vitest";
import { escaladaDaDioliDigital } from "@/lib/agency/connect/conector/dioli-digital/escalada";
import { VARIAVEL_DA_URL_DO_NUCLEO } from "@/lib/agency/connect/conector/contrato";
import { VARIAVEL_DO_SEGREDO } from "@/lib/agency/connect/porta";
import { DE, PARA, AGENTE } from "@/lib/agency/connect/conector/dioli-digital/ligacaoLocal";
import { nucleoDeMentira, type ChamadaAoNucleo } from "./_nucleo-de-mentira";

// segredo-permitido: fixture inventada, não existe fora deste arquivo
const SEGREDO_FALSO = "segredo-de-teste-com-mais-de-16-caracteres";

const ENV = {
  [VARIAVEL_DA_URL_DO_NUCLEO]: "https://nucleo.invalido",
  [VARIAVEL_DO_SEGREDO]: SEGREDO_FALSO,
} as unknown as NodeJS.ProcessEnv;

const CONTEXTO = {
  referenciaDoCliente: "cliente-1",
  pergunta: "posso ter desconto?",
  canal: "portal-do-cliente",
  agente: "pm-responde",
};

const PEDIDO = {
  protocolo: "dioli-digital:cliente-1:u1",
  assuntos: [{ assunto: "preco_ou_desconto", motivo: "m" }],
  politicaRecusada: null,
};

function respostaDoNucleo(corpo: unknown) {
  return vi.fn(async () => ({ ok: true, status: 200, json: async () => corpo }) as unknown as Response);
}

describe("DEFEITO A — o corpo do despacho fala a língua do núcleo", () => {
  it("⭐ manda `foraDaAlcada`, e NÃO `assuntos`", async () => {
    const chamadas: ChamadaAoNucleo[] = [];
    const buscar = nucleoDeMentira(chamadas, { politica: {}, fio: "f-1" });

    await escaladaDaDioliDigital(CONTEXTO, { buscar: buscar as unknown as typeof fetch, env: ENV })(PEDIDO);

    const despacho = chamadas.find((c) => c.url.endsWith("/api/connect/despacho"));
    expect(despacho, "a escalada nem chamou o despacho").toBeTruthy();
    expect(despacho!.corpo.foraDaAlcada).toEqual([{ assunto: "preco_ou_desconto", motivo: "m" }]);
    expect(
      despacho!.corpo.assuntos,
      "`assuntos` no despacho é o defeito medido — o núcleo recusa com sem_assuntos_fora_da_alcada",
    ).toBeUndefined();
  });

  it("⭐ manda `mensagem`, e NÃO `pergunta` (que o núcleo não lê)", async () => {
    const chamadas: ChamadaAoNucleo[] = [];
    const buscar = nucleoDeMentira(chamadas, { politica: {}, fio: "f-1" });

    await escaladaDaDioliDigital(CONTEXTO, { buscar: buscar as unknown as typeof fetch, env: ENV })(PEDIDO);

    const despacho = chamadas.find((c) => c.url.endsWith("/api/connect/despacho"))!;
    expect(despacho.corpo.mensagem).toBe("posso ter desconto?");
    expect(despacho.corpo.pergunta).toBeUndefined();
  });

  it("⭐⭐ A TRAVA: um despacho com `assuntos` é RECUSADO, com o código literal do núcleo", async () => {
    const chamadas: ChamadaAoNucleo[] = [];
    const nucleo = nucleoDeMentira(chamadas, { politica: {} });

    const r = await nucleo("https://n.invalido/api/connect/despacho", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        produto: "dioli-digital",
        agente: "pm-responde",
        de: "conversational-sdr",
        para: "manager-atendimento",
        assuntos: [{ assunto: "preco_ou_desconto", motivo: "m" }],
      }),
    } as RequestInit);

    expect(r.ok).toBe(false);
    await expect(r.json()).resolves.toMatchObject({ codigo: "sem_assuntos_fora_da_alcada" });
  });
});

describe("DEFEITO B — a escalada lê `fioId`, que é o que o núcleo devolve", () => {
  it("⭐⭐ `fioId` na resposta vira o fio da pendência (sem isto, fio era SEMPRE null)", async () => {
    const buscar = respostaDoNucleo({ aberta: true, fioId: "fio-do-nucleo-9" });

    const r = await escaladaDaDioliDigital(CONTEXTO, { buscar: buscar as unknown as typeof fetch, env: ENV })(PEDIDO);

    expect(r.aberta).toBe(true);
    expect(
      r.fio,
      "lendo `corpo.fio` de uma resposta que traz `fioId`, isto seria null e a consulta ficaria sem fio",
    ).toBe("fio-do-nucleo-9");
    expect(r.detalhe).not.toContain("não devolveu fio");
  });

  it("o nome ANTIGO (`fio`) continua aceito — leitor tolerante na entrada", async () => {
    const buscar = respostaDoNucleo({ aberta: true, fio: "fio-velho" });

    const r = await escaladaDaDioliDigital(CONTEXTO, { buscar: buscar as unknown as typeof fetch, env: ENV })(PEDIDO);

    expect(r.fio).toBe("fio-velho");
  });

  it("⚠️ sem fio nenhum, a consulta abre mas DIZ que veio sem fio — não inventa", async () => {
    const buscar = respostaDoNucleo({ aberta: true });

    const r = await escaladaDaDioliDigital(CONTEXTO, { buscar: buscar as unknown as typeof fetch, env: ENV })(PEDIDO);

    expect(r.aberta).toBe(true);
    expect(r.fio).toBeNull();
    expect(r.detalhe).toContain("não devolveu fio");
  });

  it("⭐ o duplo estrito devolve `fioId`, como o real — antes ele devolvia `fio` e errava JUNTO com o produto", async () => {
    const chamadas: ChamadaAoNucleo[] = [];
    const nucleo = nucleoDeMentira(chamadas, { politica: {}, fio: "f-7" });

    const r = await nucleo("https://n.invalido/api/connect/despacho", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        produto: "dioli-digital",
        agente: "pm-responde",
        de: "conversational-sdr",
        para: "manager-atendimento",
        foraDaAlcada: [{ assunto: "preco_ou_desconto", motivo: "m" }],
      }),
    } as RequestInit);

    await expect(r.json()).resolves.toMatchObject({ aberta: true, fioId: "f-7" });
  });
});

describe("AS IDENTIDADES — quem pergunta e quem decide, medidas contra o núcleo real", () => {
  it("⭐⭐ o despacho leva `de` e `para` do diretório corporativo", async () => {
    const chamadas: ChamadaAoNucleo[] = [];
    const buscar = nucleoDeMentira(chamadas, { politica: {}, fio: "f-1" });

    await escaladaDaDioliDigital(CONTEXTO, { buscar: buscar as unknown as typeof fetch, env: ENV })(
      PEDIDO,
    );

    const despacho = chamadas.find((c) => c.url.endsWith("/api/connect/despacho"))!;
    expect(despacho.corpo.de).toBe("conversational-sdr");
    expect(despacho.corpo.para).toBe("manager-atendimento");
  });

  it("⭐ `de` é quem ATENDE o cliente, não outro crachá da mesma sala", () => {
    // A sala tem seis fichas. Quatro delas nunca falam com quem está esperando;
    // mandar uma dessas passaria na trava do diretório e assinaria a consulta
    // com o nome errado — o gerente decidiria sem saber de quem veio.
    const naoAtendemOCliente = [
      "prospecting",
      "qualification",
      "initial-diagnosis",
      "opportunity-crm",
      "manager-atendimento",
    ];
    expect(naoAtendemOCliente).not.toContain(DE);
    expect(DE).toBe("conversational-sdr");
    // E quem decide é o gerente — não pode ser o mesmo que pergunta.
    expect(PARA).not.toBe(DE);
  });

  it("⛔ `de` NÃO é o `agente`: são perguntas diferentes", () => {
    // `agente` é o processo desta casa (o laço do relógio). `de` é a identidade
    // no organograma. Confundir os dois foi o defeito que a medição pegou.
    expect(DE).not.toBe(AGENTE);
  });
});
