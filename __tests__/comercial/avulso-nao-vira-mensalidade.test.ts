// O AVULSO NÃO VIRA MENSALIDADE — 29/08/2026.
//
// ─── O DEFEITO MEDIDO ────────────────────────────────────────────────────────
//
// `ServicoDaCasa` não tinha campo de recorrência: a distinção
// recorrente/compra-única só existia no PREFIXO da `chave` (`plano_` ·
// `balcao_` · `avulso_`) e na cabeça de quem escreveu o texto. Consequência
// medida em produção (ofertado = Ritmo, degrau de baixo = Post avulso):
//
//   "…o Post avulso sai por R$ 190,00/mês com 1 peças/mês — é menos volume,
//   pelo preço que cabe."
//
// Falso em dois pontos: "/mês" num item de compra única, e "1 peças" (deveria
// ser "1 peça"). Ver `docs/diagnosticos/o-avulso-que-virou-mensalidade-29-08.md`.
//
// Este arquivo prova que a PALAVRA foi corrigida — sem tocar em preço, piso ou
// em qual item é oferecido (ver a fronteira da ficha de despacho).

import { describe, it, expect, afterEach, vi } from "vitest";
import {
  servicoPorChave,
  formaDeCobranca,
  comoSeApresenta,
  TABELA_DE_PRECOS,
  type FormaDeCobranca,
} from "@/lib/agency/financeiro/tabela-de-precos";
import {
  correcaoDoPiso,
  contextoDaNegociacao,
  degrausAbaixo,
} from "@/lib/agency/comercial/negociacao-da-proposta";

describe("a frase que o cliente lê não mente sobre a cobrança", () => {
  it("ofertado Presença: a correção cita o Ritmo, e o Ritmo (mensalidade) continua com '/mês'", () => {
    const presenca = servicoPorChave("plano_presenca")!;
    const frase = correcaoDoPiso(presenca);
    expect(frase).toContain("Ritmo");
    expect(frase).toContain("/mês");
  });

  it("ofertado Ritmo: a correção cita o Post avulso, SEM '/mês' e SEM '1 peças'", () => {
    const ritmo = servicoPorChave("plano_ritmo")!;
    const frase = correcaoDoPiso(ritmo);
    expect(frase).toContain("Post avulso");
    expect(frase).not.toContain("/mês");
    expect(frase).not.toContain("1 peças");
  });

  it("ofertado Ritmo: a correção não chama compra única de 'trocar de plano'", () => {
    const ritmo = servicoPorChave("plano_ritmo")!;
    const frase = correcaoDoPiso(ritmo);
    expect(frase).not.toContain("trocar de plano");
    expect(frase).toContain("trocar para o Post avulso");
  });

  it("ofertado Presença: a correção continua chamando o Ritmo de 'trocar de plano' (mensalidade continua mensalidade)", () => {
    const presenca = servicoPorChave("plano_presenca")!;
    const frase = correcaoDoPiso(presenca);
    expect(frase).toContain("trocar de plano");
  });

  it("o bloco enviado ao modelo (contextoDaNegociacao), ofertado Ritmo: nenhuma linha de degrau traz '/mês'", () => {
    const ritmo = servicoPorChave("plano_ritmo")!;
    const bloco = contextoDaNegociacao({
      negocio: "Padaria Teste",
      servico: ritmo,
      textoDaProposta: "Proposta de teste.",
      avisoDeAgendamento: null,
    });
    // O bloco tem '•' em QUATRO seções (degraus, "o que a casa não produz",
    // "como você fala"): um filtro global sobre o texto inteiro cobraria de
    // frases verdadeiras ("volume acima de 36 peças/mês") uma regra que só
    // vale para os degraus. Por isso ancoramos na linha que ABRE a lista de
    // degrau e paramos na primeira linha que não é bullet — só essa faixa.
    const linhas = bloco.split("\n");
    const inicio = linhas.findIndex((l) => l.includes("OFERECER O DEGRAU DE BAIXO"));
    expect(inicio).toBeGreaterThanOrEqual(0);
    const linhasDeDegrau: string[] = [];
    for (let i = inicio + 1; i < linhas.length; i++) {
      const l = linhas[i]!;
      if (!l.trim().startsWith("• ")) break;
      linhasDeDegrau.push(l);
    }
    // Prova que o seletor pegou os degraus certos, e só eles — os três
    // esperados (Post avulso, Carrossel (balcão), Post (balcão)), nesta
    // ordem. Sem isto, um seletor que devolvesse ZERO linhas passaria pela
    // asserção de baixo sem ter olhado nada.
    expect(linhasDeDegrau).toHaveLength(3);
    expect(linhasDeDegrau[0]).toContain("Post avulso");
    expect(linhasDeDegrau[1]).toContain("Carrossel (balcão)");
    expect(linhasDeDegrau[2]).toContain("Post (balcão)");
    // Os três degraus abaixo do Ritmo são TODOS de compra única — nenhum
    // deles pode trazer "/mês".
    for (const linha of linhasDeDegrau) {
      expect(linha).not.toContain("/mês");
    }
  });

  it("o bloco enviado ao modelo, ofertado Presença: a linha do degrau Ritmo (mensalidade) traz '/mês'", () => {
    const presenca = servicoPorChave("plano_presenca")!;
    const bloco = contextoDaNegociacao({
      negocio: "Padaria Teste",
      servico: presenca,
      textoDaProposta: "Proposta de teste.",
      avisoDeAgendamento: null,
    });
    const linhaDoRitmo = bloco.split("\n").find((l) => l.trim().startsWith("• Ritmo"));
    expect(linhaDoRitmo).toBeDefined();
    expect(linhaDoRitmo).toContain("/mês");
  });
});

describe("concordância: peça no singular, peças no plural", () => {
  it("compra única com 1 peça: singular, sem barra de mês", () => {
    const s = comoSeApresenta(servicoPorChave("avulso_post")!);
    expect(s).toBe("R$ 190,00, 1 peça (cobrança única)");
  });

  it("mensalidade com 12 peças: plural, com barra de mês nos dois números", () => {
    const s = comoSeApresenta(servicoPorChave("plano_ritmo")!);
    expect(s).toBe("R$ 290,00/mês, 12 peças/mês");
  });
});

describe("fail-closed: forma de cobrança desconhecida não vira frase, nem opção", () => {
  it("formaDeCobranca e comoSeApresenta devolvem null para um valor fora das duas constantes conhecidas", () => {
    const base = servicoPorChave("balcao_post")!;
    const invalido = { ...base, cobranca: "invalido" as unknown as FormaDeCobranca };
    expect(formaDeCobranca(invalido)).toBeNull();
    expect(comoSeApresenta(invalido)).toBeNull();
  });

  it("todo item real da tabela hoje tem forma de cobrança conhecida (nenhum null na tabela viva)", () => {
    for (const s of TABELA_DE_PRECOS) {
      expect(formaDeCobranca(s), `${s.nome} sem forma de cobrança`).not.toBeNull();
    }
  });

  afterEach(() => {
    vi.doUnmock("@/lib/agency/financeiro/tabela-de-precos");
    vi.resetModules();
  });

  it("um item com cobrança inválida injetado na tabela NUNCA aparece como degrau de baixo", async () => {
    vi.resetModules();
    vi.doMock("@/lib/agency/financeiro/tabela-de-precos", async () => {
      const real = await vi.importActual<typeof import("@/lib/agency/financeiro/tabela-de-precos")>(
        "@/lib/agency/financeiro/tabela-de-precos",
      );
      const base = real.servicoPorChave("balcao_post")!;
      const invalido = {
        ...base,
        chave: "balcao_post_com_cobranca_desconhecida",
        nome: "Item fantasma",
        precoFinalCentavos: 5000,
        cobranca: "invalido" as unknown as FormaDeCobranca,
      };
      return {
        ...real,
        TABELA_DE_PRECOS: [...real.TABELA_DE_PRECOS, invalido],
      };
    });

    const { degrausAbaixo: degrausAbaixoComInjecao } = await import(
      "@/lib/agency/comercial/negociacao-da-proposta"
    );
    const { servicoPorChave: servicoPorChaveComInjecao } = await import(
      "@/lib/agency/financeiro/tabela-de-precos"
    );

    const ritmo = servicoPorChaveComInjecao("plano_ritmo")!;
    const abaixo = degrausAbaixoComInjecao(ritmo);
    expect(abaixo.some((s) => s.chave === "balcao_post_com_cobranca_desconhecida")).toBe(false);
    // E os degraus de verdade continuam lá — a trava não apaga a oferta real.
    expect(abaixo.some((s) => s.chave === "avulso_post")).toBe(true);
  });
});

describe("fronteira: nada de preço, piso ou oferta mudou — só a palavra", () => {
  it("os 7 itens da tabela mantêm exatamente o preço de hoje", () => {
    const precos: Record<string, number> = {
      plano_ritmo: 29000,
      plano_presenca: 49000,
      plano_conteudo: 79000,
      balcao_post: 7900,
      balcao_carrossel: 12900,
      avulso_post: 19000,
      avulso_carrossel: 29000,
    };
    for (const [chave, preco] of Object.entries(precos)) {
      expect(servicoPorChave(chave)!.precoFinalCentavos, chave).toBe(preco);
    }
  });

  it("o degrau escolhido para o Ritmo continua sendo o Post avulso (a OFERTA não mudou)", () => {
    const ritmo = servicoPorChave("plano_ritmo")!;
    const abaixo = degrausAbaixo(ritmo);
    expect(abaixo[0]!.chave).toBe("avulso_post");
  });

  it("nenhum item ganhou desconto autorizado", () => {
    for (const s of TABELA_DE_PRECOS) {
      expect(s.descontoAutorizadoPct).toBeNull();
    }
  });
});
