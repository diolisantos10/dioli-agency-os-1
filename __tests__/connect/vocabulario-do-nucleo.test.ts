/**
 * ⭐⭐ AS DUAS METADES DO DEFEITO DE CLASSE (30/08/2026).
 *
 *   METADE 1 — O SINTOMA: a Dioli Digital falava uma língua que o núcleo não
 *   entende, e toda consulta seria recusada com `assunto_fora_do_vocabulario`.
 *
 *   METADE 2 — A CAUSA: nenhuma suíte pegou isso porque o núcleo de mentira
 *   aceitava qualquer coisa. Interlocutor complacente não mede nada.
 *
 * Este arquivo prova as duas, e prova a SEGUNDA por mutação: o mesmo corpo que
 * o duplo estrito recusa, o duplo complacente aceita — que é exatamente como o
 * defeito atravessou duas suítes verdes.
 */

import { describe, it, expect } from "vitest";
import {
  ASSUNTOS_DO_NUCLEO,
  TRADUCAO_DA_DIOLI_DIGITAL,
  traduzirAssuntosParaONucleo,
} from "@/lib/agency/connect/vocabulario-do-nucleo";
import { REGRAS_FORA_DA_ALCADA, foraDaAlcadaNaMensagem } from "@/lib/agency/connect/fora-da-alcada";
import { nucleoDeMentira, type ChamadaAoNucleo } from "./_nucleo-de-mentira";

const URL_CONSULTA = "https://nucleo.invalido/api/connect/politicas/consulta";

function corpo(assuntos: Array<{ assunto: string; motivo: string }>) {
  return {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      produto: "dioli-digital",
      agente: "pm-responde",
      protocolo: "dioli-digital:c1:u1",
      referenciaDoCliente: "c1",
      assuntos,
      pergunta: "p",
    }),
  } as RequestInit;
}

/** Um DESPACHO, que é onde `de`/`para` são exigidos. */
function corpoDeDespacho(de = "conversational-sdr", para = "manager-atendimento") {
  return {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      produto: "dioli-digital",
      agente: "pm-responde",
      de,
      para,
      foraDaAlcada: [{ assunto: "preco_ou_desconto", motivo: "m" }],
      mensagem: "m",
    }),
  } as RequestInit;
}

const URL_DESPACHO = "https://nucleo.invalido/api/connect/despacho";

describe("METADE 1 — o produto passa a falar a língua do núcleo", () => {
  it("⛔ ANTES: a classificação CRUA da casa não tem UM termo que o núcleo aceite", () => {
    const crus = REGRAS_FORA_DA_ALCADA.map((r) => r.assunto);
    const intersecao = crus.filter((a) => (ASSUNTOS_DO_NUCLEO as readonly string[]).includes(a));
    // Este é o defeito medido: zero interseção. Se algum dia esta linha falhar
    // porque a interseção CRESCEU, ótimo — mas alguém precisa reler a tradução.
    expect(
      intersecao,
      "a classificação local não deveria coincidir com o vocabulário do núcleo — é por isso que existe tradução",
    ).toEqual([]);
  });

  it("⭐ DEPOIS: tudo o que viaja está no vocabulário fechado do núcleo", () => {
    const assuntos = foraDaAlcadaNaMensagem(
      "queria um desconto, e qual o prazo? isso é fora do contrato",
    );
    expect(assuntos.length).toBeGreaterThan(0);

    const { paraORede } = traduzirAssuntosParaONucleo(assuntos);
    expect(paraORede.length).toBeGreaterThan(0);
    for (const a of paraORede) {
      expect(
        ASSUNTOS_DO_NUCLEO as readonly string[],
        `"${a.assunto}" não está no vocabulário fechado — o núcleo recusaria a consulta inteira`,
      ).toContain(a.assunto);
    }
  });

  it("os quatro mapeamentos limpos são os que o operador mediu", () => {
    expect(TRADUCAO_DA_DIOLI_DIGITAL.desconto).toBe("preco_ou_desconto");
    expect(TRADUCAO_DA_DIOLI_DIGITAL.preco).toBe("preco_ou_desconto");
    expect(TRADUCAO_DA_DIOLI_DIGITAL.prazo).toBe("prazo_de_entrega");
    expect(TRADUCAO_DA_DIOLI_DIGITAL.escopo).toBe("escopo_fora_do_contratado");
  });

  it("⚠️ os dois SEM termo estão registrados como ausência, não esquecidos", () => {
    expect(TRADUCAO_DA_DIOLI_DIGITAL.cancelamento).toBeNull();
    expect(TRADUCAO_DA_DIOLI_DIGITAL.contrato).toBeNull();

    const { semTermoNoNucleo } = traduzirAssuntosParaONucleo([
      { assunto: "cancelamento", motivo: "m" },
      { assunto: "contrato", motivo: "m" },
    ]);
    expect(semTermoNoNucleo).toEqual(["cancelamento", "contrato"]);
  });

  it("⭐ misturando traduzível e não traduzível, só o traduzível viaja — antes a consulta INTEIRA caía", () => {
    const { paraORede } = traduzirAssuntosParaONucleo([
      { assunto: "desconto", motivo: "m" },
      { assunto: "cancelamento", motivo: "m" },
    ]);
    expect(paraORede).toEqual([{ assunto: "preco_ou_desconto", motivo: "m" }]);
  });

  it("⚠️ não havendo NENHUM traduzível, a lista vai intacta — comportamento idêntico ao de hoje", () => {
    const entrada = [{ assunto: "cancelamento", motivo: "m" }];
    const { paraORede } = traduzirAssuntosParaONucleo(entrada);
    expect(paraORede).toEqual(entrada);
  });

  it("⭐⭐ A TRAVA DO FUTURO: toda regra da casa está mapeada ou registrada como ausente", () => {
    const naoRegistradas = REGRAS_FORA_DA_ALCADA.map((r) => r.assunto).filter(
      (a) => !(a in TRADUCAO_DA_DIOLI_DIGITAL),
    );
    expect(
      naoRegistradas,
      "regra nova sem linha em TRADUCAO_DA_DIOLI_DIGITAL viajaria como assunto desconhecido e o " +
        "núcleo recusaria a consulta inteira — registre o termo, ou registre `null` dizendo que não há",
    ).toEqual([]);
  });
});

describe("METADE 2 — a CAUSA: o núcleo de mentira deixou de ser complacente", () => {
  it("⭐ recusa assunto fora do vocabulário, como o real", async () => {
    const chamadas: ChamadaAoNucleo[] = [];
    const nucleo = nucleoDeMentira(chamadas, { politica: {} });

    const r = await nucleo(URL_CONSULTA, corpo([{ assunto: "cancelamento", motivo: "m" }]));

    expect(r.ok).toBe(false);
    await expect(r.json()).resolves.toEqual({ codigo: "assunto_fora_do_vocabulario" });
  });

  it("⭐ recusa remetente que o diretório não conhece, como o real", async () => {
    const chamadas: ChamadaAoNucleo[] = [];
    const nucleo = nucleoDeMentira(chamadas, { politica: {} });

    const r = await nucleo(URL_DESPACHO, corpoDeDespacho("agente-que-nao-existe"));

    expect(r.ok).toBe(false);
    await expect(r.json()).resolves.toEqual({ codigo: "remetente_desconhecido" });
  });

  it("aceita o que está certo — trava que reprova o legítimo seria incidente, não trava", async () => {
    const chamadas: ChamadaAoNucleo[] = [];
    const nucleo = nucleoDeMentira(chamadas, { politica: { politica: null } });

    const r = await nucleo(URL_CONSULTA, corpo([{ assunto: "preco_ou_desconto", motivo: "m" }]));

    expect(r.ok).toBe(true);
    expect(chamadas).toHaveLength(1);
  });

  it("⭐⭐ POR MUTAÇÃO: o duplo COMPLACENTE aceita os dois corpos que o estrito recusa", async () => {
    const chamadas: ChamadaAoNucleo[] = [];
    const complacente = nucleoDeMentira(chamadas, { politica: {}, estrito: false });

    const foraDoVocabulario = await complacente(
      URL_CONSULTA,
      corpo([{ assunto: "cancelamento", motivo: "m" }]),
    );
    const remetenteDesconhecido = await complacente(
      URL_DESPACHO,
      corpoDeDespacho("agente-que-nao-existe"),
    );

    // É ISTO que deixou o defeito atravessar duas suítes verdes.
    expect(foraDoVocabulario.ok).toBe(true);
    expect(remetenteDesconhecido.ok).toBe(true);
  });
});
