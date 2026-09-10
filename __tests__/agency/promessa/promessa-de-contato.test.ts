// A RÉGUA PURA: esta fala prometeu que um HUMANO da equipe entra em contato?
//
// Não confundir com `promessa-que-a-maquina-nao-cumpre.ts` — aquela barra a
// MÁQUINA prometendo em primeira pessoa ("eu envio"); esta reconhece a
// promessa LEGÍTIMA da equipe ("nossa equipe entra em contato"), que passa a
// ser uma dívida com data de origem.

import { describe, it, expect } from "vitest";
import {
  prometeuContatoHumano,
  trechoDaPromessaDeContato,
  promessasDeContato,
} from "@/lib/agency/esteira/promessa-de-contato";

describe("reconhece a equipe prometendo contato", () => {
  it.each([
    "Perfeito! Nossa equipe entra em contato com você em breve.",
    "A equipe vai entrar em contato para fechar os últimos detalhes.",
    "Já deixei registrado para a equipe analisar e entrar em contato.",
    "Vou levar isso para a equipe e eles te procuram.",
    "Alguém do time te procura para confirmar os próximos passos.",
    "O time retorna assim que revisar o seu caso.",
  ])("reconhece: %s", (fala) => {
    expect(prometeuContatoHumano(fala)).toBe(true);
    expect(trechoDaPromessaDeContato(fala)).not.toBeNull();
  });
});

describe("NÃO reconhece fala neutra ou promessa da MÁQUINA (outro módulo)", () => {
  it.each([
    "Confira o resumo do seu pedido e confirme para eu preparar seu orçamento.",
    "Qual é a sua faixa de investimento mensal?",
    "Perfeito, Marcos! Já preparei o escopo.",
    "Obrigado pelas informações, vamos seguir com o briefing.",
    // Promessa da MÁQUINA em primeira pessoa — domínio do OUTRO módulo, não deste.
    "Eu finalizo o orçamento e te envio em seguida.",
  ])("não reconhece: %s", (fala) => {
    expect(prometeuContatoHumano(fala)).toBe(false);
    expect(trechoDaPromessaDeContato(fala)).toBeNull();
  });
});

describe("entradas vazias", () => {
  it.each([null, undefined, "", "   "])("%s não é promessa", (v) => {
    expect(prometeuContatoHumano(v)).toBe(false);
    expect(trechoDaPromessaDeContato(v)).toBeNull();
    expect(promessasDeContato(v)).toEqual([]);
  });
});

describe("promessasDeContato carrega o porquê, para log", () => {
  it("devolve trecho e motivo", () => {
    const achadas = promessasDeContato("Nossa equipe entra em contato com você ainda hoje.");
    expect(achadas.length).toBeGreaterThan(0);
    expect(achadas[0]!.trecho.length).toBeGreaterThan(0);
    expect(achadas[0]!.porque.length).toBeGreaterThan(0);
  });
});
