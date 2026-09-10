// "há N dias" que uma pessoa lê sem tropeçar.
//
// ⚠️ ESTE ARQUIVO NASCEU DE UMA CAPTURA AO VIVO, NÃO DE UM TESTE.
//
// Em 29/08/2026, ao clicar em "Marcar como contatado" no navegador de verdade,
// o selo respondeu **"Contatada há 0 dias"**. Aritmeticamente certo; frase que
// ninguém fala. E o pior: o segundo seguinte ao clique é justamente o momento
// em que esse texto MAIS é lido — o pior caso estava com a pior redação.
//
// Nenhum teste de unidade pegaria isso, porque nenhum teste sabe o que soa
// errado em português. A tela ao vivo pega o que o teste não pega — e é por
// isso que a captura é obrigatória, não enfeite de relatório.

import { describe, it, expect } from "vitest";
import { idadeEmDias } from "@/app/agency/leads/page";

describe("idadeEmDias — o texto que a pessoa lê", () => {
  it("hoje não vira 'há 0 dias'", () => {
    expect(idadeEmDias(0)).toBe("hoje");
  });

  it("número negativo (relógio torto, data no futuro) também é 'hoje' — nunca 'há -1 dias'", () => {
    // `diasDesde` já trunca em 0, mas uma função pura não confia no chamador:
    // ela é usada em três lugares e vai ser usada num quarto.
    expect(idadeEmDias(-3)).toBe("hoje");
  });

  it("um dia é singular", () => {
    expect(idadeEmDias(1)).toBe("há 1 dia");
  });

  it("dois ou mais é plural", () => {
    expect(idadeEmDias(2)).toBe("há 2 dias");
    expect(idadeEmDias(30)).toBe("há 30 dias");
  });
});
