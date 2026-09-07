// O AVULSO NÃO VIRA MENSALIDADE — 29/08/2026, atualizado em 07/09/2026.
//
// ─── O DEFEITO MEDIDO (29/08) ────────────────────────────────────────────────
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
// ─── O QUE MUDOU EM 07/09, E POR QUE ESTE ARQUIVO FICOU MAIS FORTE ──────────
//
// O despacho **E1** (`.despachos/E1-tabela-no-codigo.md`, decisão do Diretor
// Geral por despacho do CEO em 30/08) mudou DUAS coisas que este arquivo
// afirmava:
//
//   • **o preço da peça avulsa** passou de R$ 190/R$ 290 para **R$ 55** único,
//     e `PECA_EXTRA` morreu;
//   • **`degrausAbaixo` passou a comparar SÓ PLANO COM PLANO** — item de compra
//     única deixou de ser oferecido como "degrau" de uma assinatura.
//
// ⚠️ **A segunda mudança torna o defeito original IMPOSSÍVEL POR CONSTRUÇÃO**:
// se compra única nunca é oferecida como degrau, ela nunca sai com "/mês" nesse
// caminho. Este arquivo então deixou de afirmar *"o avulso aparece, e aparece
// escrito certo"* e passou a afirmar o mais forte: **compra única NUNCA aparece
// como degrau, e a regra de palavra continua valendo onde o item aparece.**
//
// ⛔ Nenhum preço é decidido aqui. Os números vêm da TABELA, nunca digitados
// neste arquivo — número redigitado em teste envelhece sozinho e passa a
// proteger a mentira, que foi exatamente o defeito de `recompra.ts` (8 peças
// onde a casa vende 12).

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

/** O preço vem da FONTE, nunca digitado aqui. */
function reais(chave: string): string {
  const centavos = servicoPorChave(chave)!.precoFinalCentavos;
  return (centavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

describe("a frase que o cliente lê não mente sobre a cobrança", () => {
  it("ofertado Presença: a correção cita o Ritmo, e o Ritmo (mensalidade) continua com '/mês'", () => {
    const presenca = servicoPorChave("plano_presenca")!;
    const frase = correcaoDoPiso(presenca);
    expect(frase).toContain("Ritmo");
    expect(frase).toContain("/mês");
  });

  it("ofertado Presença: a correção continua chamando o Ritmo de 'trocar de plano' (mensalidade continua mensalidade)", () => {
    const presenca = servicoPorChave("plano_presenca")!;
    expect(correcaoDoPiso(presenca)).toContain("trocar de plano");
  });

  // ── O CASO QUE SUBSTITUIU "o avulso aparece escrito certo" ────────────────
  // Ritmo é o plano mais barato. Depois do E1 não há degrau abaixo dele — e a
  // casa PRECISA dizer isso, em vez de oferecer uma compra única disfarçada de
  // assinatura, que era o defeito de 29/08.
  it("ofertado Ritmo (o mais barato): a casa NÃO oferece compra única disfarçada — diz que não tem para onde descer", () => {
    const ritmo = servicoPorChave("plano_ritmo")!;
    const frase = correcaoDoPiso(ritmo);
    expect(degrausAbaixo(ritmo)).toHaveLength(0);
    expect(frase).not.toContain("Post avulso");
    expect(frase).not.toContain("Carrossel avulso");
    expect(frase).not.toContain("trocar de plano");
  });

  it("ofertado Ritmo: a promessa de resposta humana declara o CANAL — promessa sem canal nem prazo é a que a máquina não cumpre", () => {
    const ritmo = servicoPorChave("plano_ritmo")!;
    const frase = correcaoDoPiso(ritmo);
    // A régua de `promessa-que-a-maquina-nao-cumpre` dispensa quando há canal
    // OU prazo declarado. Aqui o canal é "por aqui mesmo".
    expect(frase).toMatch(/por aqui mesmo|neste chat|por e-?mail|no portal/i);
  });

  it("NENHUM degrau ofertado é de compra única — em nenhum plano da casa", () => {
    for (const s of TABELA_DE_PRECOS.filter((x) => x.chave.startsWith("plano_"))) {
      for (const d of degrausAbaixo(s)) {
        expect(formaDeCobranca(d), `${d.nome} virou degrau de ${s.nome}`).toBe("recorrente_mensal");
      }
    }
  });

  it("o bloco enviado ao modelo (contextoDaNegociacao): nenhuma linha de degrau descreve compra única", () => {
    const presenca = servicoPorChave("plano_presenca")!;
    const bloco = contextoDaNegociacao({
      negocio: "Salão da Ana",
      servico: presenca,
      textoDaProposta: "Proposta — Salão da Ana",
      avisoDeAgendamento: null,
    });
    for (const linha of bloco.split("\n").filter((l) => l.trim().startsWith("•"))) {
      expect(linha, linha).not.toContain("cobrança única");
    }
  });

  it("o bloco enviado ao modelo, ofertado Presença: a linha do degrau Ritmo (mensalidade) traz '/mês'", () => {
    const presenca = servicoPorChave("plano_presenca")!;
    const bloco = contextoDaNegociacao({
      negocio: "Salão da Ana",
      servico: presenca,
      textoDaProposta: "Proposta — Salão da Ana",
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
    expect(s).toBe(`R$ ${reais("avulso_post")}, 1 peça (cobrança única)`);
  });

  it("mensalidade: plural, com barra de mês nos dois números", () => {
    const ritmo = servicoPorChave("plano_ritmo")!;
    expect(comoSeApresenta(ritmo)).toBe(
      `R$ ${reais("plano_ritmo")}/mês, ${ritmo.pecasPorMes} peças/mês`,
    );
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

  // ⚠️ O ITEM INJETADO É UM `plano_`, DE PROPÓSITO. Depois do E1 o filtro exige
  // `chave.startsWith("plano_")`; injetar um `balcao_*` faria este teste passar
  // pelo motivo ERRADO — barrado pelo prefixo, não pela trava de cobrança. Um
  // teste que passa pelo motivo errado é decoração.
  it("um PLANO com cobrança inválida injetado na tabela NUNCA aparece como degrau de baixo", async () => {
    vi.resetModules();
    vi.doMock("@/lib/agency/financeiro/tabela-de-precos", async () => {
      const real = await vi.importActual<typeof import("@/lib/agency/financeiro/tabela-de-precos")>(
        "@/lib/agency/financeiro/tabela-de-precos",
      );
      const base = real.servicoPorChave("plano_ritmo")!;
      const invalido = {
        ...base,
        chave: "plano_fantasma_com_cobranca_desconhecida",
        nome: "Plano fantasma",
        precoFinalCentavos: base.precoFinalCentavos - 1000,
        cobranca: "invalido" as unknown as FormaDeCobranca,
      };
      return { ...real, TABELA_DE_PRECOS: [...real.TABELA_DE_PRECOS, invalido] };
    });

    const { degrausAbaixo: degrausComInjecao } = await import(
      "@/lib/agency/comercial/negociacao-da-proposta"
    );
    const { servicoPorChave: porChaveComInjecao } = await import(
      "@/lib/agency/financeiro/tabela-de-precos"
    );

    const presenca = porChaveComInjecao("plano_presenca")!;
    const abaixo = degrausComInjecao(presenca);
    expect(abaixo.some((s) => s.chave === "plano_fantasma_com_cobranca_desconhecida")).toBe(false);
    // E o degrau de verdade continua lá — a trava não apaga a oferta real.
    expect(abaixo.some((s) => s.chave === "plano_ritmo")).toBe(true);
  });
});

describe("fronteira: este arquivo não decide preço nem oferta", () => {
  it("a palavra acompanha o número, qualquer que ele seja — nenhum preço digitado aqui", () => {
    for (const s of TABELA_DE_PRECOS) {
      const texto = comoSeApresenta(s);
      expect(texto, s.nome).not.toBeNull();
      expect(texto!, s.nome).toContain(
        (s.precoFinalCentavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
      );
    }
  });

  it("compra única nunca traz '/mês'; mensalidade sempre traz", () => {
    for (const s of TABELA_DE_PRECOS) {
      const texto = comoSeApresenta(s)!;
      if (formaDeCobranca(s) === "uma_vez") expect(texto, s.nome).not.toContain("/mês");
      else expect(texto, s.nome).toContain("/mês");
    }
  });

  it("nenhum item ganhou desconto autorizado", () => {
    for (const s of TABELA_DE_PRECOS) {
      expect(s.descontoAutorizadoPct).toBeNull();
    }
  });
});
