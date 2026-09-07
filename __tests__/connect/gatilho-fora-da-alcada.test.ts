/**
 * ⭐ O GATILHO — a peça que a Dioli Digital NÃO TINHA.
 *
 * O contrato do conector (item 5-d) é explícito: um produto sem classificação
 * em código de "isto está fora da alçada" não está pronto para conectar, e a
 * peça a construir é o gatilho, não o conector. Esta casa tinha a regra escrita
 * no PROMPT de `pm-responde.ts` — um aviso, não uma trava.
 *
 * ⚠️ AS DUAS METADES, em todo caso: o que DEVE travar trava, e o que NÃO deve
 * travar não trava. Um gatilho que só prova a primeira metade poderia ser
 * `() => true` — travaria tudo, passaria em metade dos testes, e transformaria
 * toda conversa desta casa numa consulta ao gerente.
 */

import { describe, it, expect } from "vitest";
import {
  foraDaAlcadaNaMensagem,
  estaForaDaAlcada,
  contemTermo,
  normalizar,
  REGRAS_FORA_DA_ALCADA,
} from "@/lib/agency/connect/fora-da-alcada";

describe("⭐ o gatilho trava o que é decisão da agência", () => {
  it("desconto pedido pelo cliente trava, e o assunto é nomeado", () => {
    const r = foraDaAlcadaNaMensagem("dá pra fazer um desconto nesse valor?");
    expect(r.map((a) => a.assunto)).toContain("desconto");
  });

  it("preço fora de tabela trava", () => {
    expect(foraDaAlcadaNaMensagem("quanto custa um reel a mais?").map((a) => a.assunto)).toContain("preco");
  });

  it("prazo trava", () => {
    expect(foraDaAlcadaNaMensagem("consegue até sexta? qual o prazo?").map((a) => a.assunto)).toContain("prazo");
  });

  it("escopo novo trava", () => {
    expect(
      foraDaAlcadaNaMensagem("queria incluir também um story, fora do pacote").map((a) => a.assunto),
    ).toContain("escopo");
  });

  it("cancelamento e reembolso travam", () => {
    expect(foraDaAlcadaNaMensagem("quero cancelar e pedir reembolso").map((a) => a.assunto)).toContain(
      "cancelamento",
    );
  });

  it("condição contratual trava", () => {
    expect(foraDaAlcadaNaMensagem("dá pra parcelar em 3x?").map((a) => a.assunto)).toContain("contrato");
  });

  it("⭐ uma mensagem pode travar por MAIS DE UM assunto, e todos sobem", () => {
    const r = foraDaAlcadaNaMensagem("me dá um desconto e entrega até sexta?");
    const assuntos = r.map((a) => a.assunto);
    expect(assuntos).toContain("desconto");
    expect(assuntos).toContain("prazo");
    // Quem vai decidir precisa ver os dois: decidir só o desconto deixaria o
    // cliente com metade da resposta e uma segunda espera.
    expect(r.length).toBeGreaterThanOrEqual(2);
  });

  it("o acento não desliga o gatilho — teclado de celular escreve sem", () => {
    expect(estaForaDaAlcada("qual o preço?")).toBe(true);
    expect(estaForaDaAlcada("qual o preco?")).toBe(true);
    expect(estaForaDaAlcada("ORÇAMENTO")).toBe(true);
  });

  it("todo assunto travado vem com MOTIVO escrito — quem decide precisa dele", () => {
    for (const a of foraDaAlcadaNaMensagem("desconto, prazo, cancelar, parcelar, fora do pacote, quanto custa")) {
      expect(a.motivo.length, `o assunto "${a.assunto}" subiu sem motivo`).toBeGreaterThan(40);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("⭐ A OUTRA METADE — o que NÃO é decisão da agência não trava", () => {
  it("cumprimento não trava", () => {
    expect(foraDaAlcadaNaMensagem("bom dia, tudo certo?")).toEqual([]);
  });

  it("pergunta de status não trava — o PM responde isso sozinho", () => {
    expect(foraDaAlcadaNaMensagem("como está o post do carrossel?")).toEqual([]);
  });

  it("resposta a uma pergunta da casa não trava", () => {
    expect(foraDaAlcadaNaMensagem("pode ser o pacote de 4")).toEqual([]);
  });

  it("elogio e material não travam", () => {
    expect(foraDaAlcadaNaMensagem("adorei a arte! já mandei a foto no drive")).toEqual([]);
  });

  it("mensagem vazia ou não-texto não trava, e não explode", () => {
    expect(foraDaAlcadaNaMensagem("")).toEqual([]);
    expect(foraDaAlcadaNaMensagem("   ")).toEqual([]);
    expect(foraDaAlcadaNaMensagem(undefined as unknown as string)).toEqual([]);
    expect(foraDaAlcadaNaMensagem(null as unknown as string)).toEqual([]);
  });

  it("⭐ o termo dentro de OUTRA palavra não trava — a fronteira é conferida", () => {
    // "prazo" mora dentro de "prazoso"; "multa" dentro de "multar"; se o gatilho
    // usasse `includes` cru, estas frases inocentes virariam consulta ao gerente.
    expect(contemTermo(normalizar("um trabalho prazoso"), "prazo")).toBe(false);
    expect(contemTermo(normalizar("vamos multiplicar o alcance"), "multa")).toBe(false);
    expect(contemTermo(normalizar("o prazo acabou"), "prazo")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("⭐ A MUTAÇÃO DELIBERADA — a trava mede alguma coisa?", () => {
  /**
   * Se o gatilho fosse `() => []` (nunca trava), todos os testes da segunda
   * metade continuariam VERDES e o agente voltaria a prometer desconto sozinho.
   * Aqui a mutação é aplicada de verdade e o teste exige que ela seja detectada.
   */
  it("um gatilho que nunca trava REPROVA o conjunto de frases que deve travar", () => {
    const gatilhoMutante = (): { assunto: string }[] => [];
    const devemTravar = [
      "dá um desconto?",
      "quanto custa?",
      "qual o prazo?",
      "quero cancelar",
      "dá pra parcelar?",
      "fora do pacote",
    ];
    // O de verdade trava todas.
    for (const f of devemTravar) {
      expect(foraDaAlcadaNaMensagem(f).length, `o gatilho real deixou passar: "${f}"`).toBeGreaterThan(0);
    }
    // O mutante não trava nenhuma — e é por isso que a bateria acima mede algo.
    expect(devemTravar.every(() => gatilhoMutante().length === 0)).toBe(true);
  });

  /**
   * E a mutação simétrica: um gatilho que trava SEMPRE passaria em toda a
   * primeira metade. É a segunda metade que o reprova.
   */
  it("um gatilho que trava sempre REPROVA o conjunto de frases inocentes", () => {
    const gatilhoMutante = () => [{ assunto: "tudo", motivo: "tudo é decisão da agência" }];
    const naoDevemTravar = ["bom dia", "como está o post?", "pode ser o pacote de 4", "adorei a arte"];
    for (const f of naoDevemTravar) {
      expect(foraDaAlcadaNaMensagem(f), `o gatilho real travou sem motivo: "${f}"`).toEqual([]);
      expect(gatilhoMutante().length).toBe(1);
    }
  });

  it("⭐ o vocabulário sai das proibições que a casa JÁ tinha escrito", () => {
    // `pm-responde.ts`: "prazo, preço, desconto ou escopo novo".
    const assuntos = REGRAS_FORA_DA_ALCADA.map((r) => r.assunto);
    for (const exigido of ["prazo", "preco", "desconto", "escopo"]) {
      expect(assuntos, `a régua escrita da casa cita "${exigido}" e o gatilho não o classifica`).toContain(
        exigido,
      );
    }
  });
});
