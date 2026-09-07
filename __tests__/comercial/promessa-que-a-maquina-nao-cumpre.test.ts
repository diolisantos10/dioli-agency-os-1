// O SDR NÃO PROMETE O QUE NADA DISPARA — 27/08/2026.
//
// Medido em produção, com o CLIENTE 001 da agência na tela:
//
//   01:31  "Assim que você confirmar o @ do Instagram, eu finalizo o orçamento
//          e envio para você."
//   01:34  "Já preparei o escopo… Vou preparar seu orçamento personalizado…
//          estou à disposição 😊"  — e se despediu.
//   depois NADA. Nenhum orçamento, nenhum e-mail, nenhum botão.
//
// As frases abaixo são as REAIS. Um teste que inventasse frases parecidas
// provaria a régua contra si mesma.

import { describe, it, expect } from "vitest";
import {
  promessasSoltas, temPromessaSolta, despedidaSemPorta,
  limparPromessaSolta, motivoDaPromessa, O_QUE_DIZER_NO_LUGAR,
} from "@/lib/agency/comercial/promessa-que-a-maquina-nao-cumpre";

const FALA_01_31 = "Assim que você confirmar o @ do Instagram, eu finalizo o orçamento e envio para você.";
const FALA_01_34 = "Já preparei o escopo com base no Briefing Mestre. Vou preparar seu orçamento personalizado. Estou à disposição 😊";

describe("as duas falas que o cliente 001 recebeu", () => {
  it("barra 'eu finalizo o orçamento e envio para você'", () => {
    expect(temPromessaSolta(FALA_01_31)).toBe(true);
    expect(promessasSoltas(FALA_01_31)[0]!.porque).toMatch(/nada nesta casa dispara/i);
  });

  it("barra 'vou preparar seu orçamento personalizado'", () => {
    expect(temPromessaSolta(FALA_01_34)).toBe(true);
  });

  it("a despedida educada É o beco quando não há próxima ação", () => {
    expect(despedidaSemPorta(FALA_01_34, false)).toBe(true);
    // E deixa de ser defeito quando existe botão: educação com porta é educação.
    expect(despedidaSemPorta(FALA_01_34, true)).toBe(false);
  });
});

describe("o que a régua NÃO pode barrar — senão vira régua desligada", () => {
  it("deixa passar a instrução verdadeira da casa", () => {
    // É o texto pronto de `prospect-engine.ts`. Ele diz o que o CLIENTE faz
    // para o orçamento nascer — instrução, não promessa.
    for (const ok of [
      "Confira o resumo do seu pedido e confirme para eu preparar seu orçamento.",
      "Tenho as informações principais! Confira o resumo do seu pedido e confirme para eu preparar seu orçamento.",
      "Perfeito! Tenho todas as informações que preciso. Confira o resumo do seu pedido e confirme para eu preparar seu orçamento personalizado.",
    ]) {
      expect(temPromessaSolta(ok), `barrou instrução legítima: ${ok}`).toBe(false);
    }
  });

  it("deixa passar o PASSADO — relato não é promessa", () => {
    expect(temPromessaSolta("Já preparei o escopo com base no Briefing Mestre.")).toBe(false);
    expect(temPromessaSolta("Montei o resumo do seu pedido.")).toBe(false);
  });

  it("deixa passar a EQUIPE prometendo — quem promete é gente, e gente cumpre", () => {
    expect(temPromessaSolta("Nossa equipe entra em contato com você por este e-mail.")).toBe(false);
  });

  it("deixa passar conversa normal do SDR", () => {
    for (const ok of [
      "Qual é o @ do Instagram do seu negócio?",
      "Entendi: vocês vendem sistema de CRM para restaurantes.",
      "Você prefere que a gente fale por e-mail ou WhatsApp?",
    ]) {
      expect(temPromessaSolta(ok), `barrou conversa normal: ${ok}`).toBe(false);
    }
  });
});

describe("prazo prometido por máquina é dívida", () => {
  it("barra 'em breve' e parentes", () => {
    expect(temPromessaSolta("Te retorno em breve com os valores.")).toBe(true);
    expect(temPromessaSolta("Em instantes você recebe.")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// P0 AO VIVO — MARCOS (FOOCCI), 30/08/2026. As SEIS frases da conversa real
// que passaram inteiras pela régua anterior. Ver o cabeçalho do módulo.
// ═══════════════════════════════════════════════════════════════════════════
describe("P0 30/08/2026 — a conversa real com o Marcos (Foocci)", () => {
  it("as seis frases que passavam agora são detectadas", () => {
    const frases = [
      "Vou conferir com o gerente de projeto se cabe no cronograma.",
      "Isso precisa de aprovação de gestão.",
      "Vou trazer essas duas respostas para você ainda hoje — pode deixar comigo. 🙂",
      "pode deixar comigo",
      "Vou verificar com a equipe e te retorno ainda hoje.",
      "Vou conferir e te aviso.",
    ];
    for (const f of frases) {
      expect(temPromessaSolta(f), `deveria ter barrado: "${f}"`).toBe(true);
    }
  });

  it("a fala real e completa do SDR ao Marcos é detectada por inteiro", () => {
    const FALA_AO_MARCOS =
      "Vou conferir com o gerente de projeto se cabe no cronograma. Isso precisa de " +
      "aprovação de gestão. Vou trazer essas duas respostas para você ainda hoje — " +
      "pode deixar comigo. 🙂";
    expect(temPromessaSolta(FALA_AO_MARCOS)).toBe(true);
    expect(promessasSoltas(FALA_AO_MARCOS).length).toBeGreaterThanOrEqual(3);
  });

  it("'vou conferir com o gerente' e 'precisa de aprovação de gestão' nascem tipo 'escalacao'", () => {
    const escalacoes = [
      "Vou conferir com o gerente de projeto se cabe no cronograma.",
      "Isso precisa de aprovação de gestão.",
      "Vou verificar com a equipe e te retorno ainda hoje.",
    ];
    for (const f of escalacoes) {
      const achadas = promessasSoltas(f);
      expect(achadas.length, `sem achado em: "${f}"`).toBeGreaterThan(0);
      expect(achadas.some((a) => a.tipo === "escalacao"), `sem tipo escalacao em: "${f}"`).toBe(true);
    }
  });

  it("'pode deixar comigo' e 'vou trazer... ainda hoje' nascem tipo 'generica'", () => {
    for (const f of ["pode deixar comigo", "Vou trazer essas duas respostas para você ainda hoje."]) {
      const achadas = promessasSoltas(f);
      expect(achadas.length).toBeGreaterThan(0);
      expect(achadas.every((a) => a.tipo === "generica")).toBe(true);
    }
  });

  it("continua deixando passar a EQUIPE prometendo por si — a fila de gente de verdade", () => {
    // Não é "vou conferir COM a equipe" (a máquina anunciando consulta); é a
    // equipe entrando em contato diretamente. A diferença é a alma da régua.
    expect(temPromessaSolta("Nossa equipe entra em contato com você por este e-mail.")).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// P0b 30/08/2026 — "vou trazer … ainda hoje" continuava passando. A régua
// antiga exigia achar "para você" E um prazo NO MESMO regex — e sumia toda
// vez que "você" vinha acentuado (\b não existe depois de "ê" em JS). A
// tabela abaixo é a exata do despacho `P0b-vou-trazer-ainda-passa.md`.
// ═══════════════════════════════════════════════════════════════════════════
describe("P0b 30/08/2026 — 'vou trazer … ainda hoje' sozinha, a tabela A–D", () => {
  it("A — 'pode deixar comigo' continua pega", () => {
    expect(temPromessaSolta("pode deixar comigo")).toBe(true);
  });

  it("B — 'Vou trazer essas duas respostas para você ainda hoje.' (com ponto, com acento)", () => {
    expect(temPromessaSolta("Vou trazer essas duas respostas para você ainda hoje.")).toBe(true);
  });

  it("C — 'Vou trazer essas duas respostas para você ainda hoje' (sem ponto)", () => {
    expect(temPromessaSolta("Vou trazer essas duas respostas para você ainda hoje")).toBe(true);
  });

  it("D — 'Vou trazer as respostas ainda hoje.' (sem 'para você')", () => {
    expect(temPromessaSolta("Vou trazer as respostas ainda hoje.")).toBe(true);
  });

  it("a família inteira é pega sozinha — com e sem acento em 'você', com e sem ponto final", () => {
    const frases = [
      "Vou trazer as respostas.",
      "Vou trazer isso pra voce.",           // sem acento
      "Vou trazer isso pra você",            // com acento, sem ponto
      "Vou te trazer o valor ainda hoje.",
      "Vou te trazer o valor ainda hoje",
      "Trago essas respostas amanhã.",
      "Trago isso pra você ainda hoje",
      "Te trago o retorno ainda hoje.",
      "Te trago o retorno.",
    ];
    for (const f of frases) {
      expect(temPromessaSolta(f), `deveria ter barrado: "${f}"`).toBe(true);
      expect(promessasSoltas(f).every((a) => a.tipo === "generica"), `tipo errado em: "${f}"`).toBe(true);
    }
  });
});

describe("a instrução gêmea", () => {
  it("o motivo diz o que fazer no lugar — proibição sem alternativa vira contorno", () => {
    const motivo = motivoDaPromessa(promessasSoltas(FALA_01_31));
    expect(motivo).toContain(O_QUE_DIZER_NO_LUGAR);
    expect(motivo).toMatch(/confirme/i);
  });

  it("texto limpo perde a promessa e mantém o resto da fala", () => {
    const limpo = limparPromessaSolta(FALA_01_34);
    expect(limpo).toContain("Já preparei o escopo");
    expect(limpo).not.toMatch(/vou preparar seu orçamento/i);
    expect(temPromessaSolta(limpo)).toBe(false);
  });

  it("texto sem promessa passa intacto", () => {
    const ok = "Confira o resumo do seu pedido e confirme para eu preparar seu orçamento.";
    expect(limparPromessaSolta(ok)).toBe(ok);
  });
});

describe("bordas", () => {
  it("vazio e nulo não são promessa", () => {
    expect(temPromessaSolta("")).toBe(false);
    expect(temPromessaSolta(null)).toBe(false);
    expect(temPromessaSolta(undefined)).toBe(false);
    expect(limparPromessaSolta(null)).toBe("");
  });
});
