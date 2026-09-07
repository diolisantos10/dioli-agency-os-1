// A VITRINE NÃO PROMETE ACIMA DO QUE A CASA ENTREGA — a catraca, agora no zero.
//
// ═══ O ACHADO (25/08/2026) ══════════════════════════════════════════════════
//
// Fechando o case Farol 27 ficou à vista um buraco maior que o conserto: a
// tabela de planos anunciava de 2,8× a 13,3× o que a produção entregava num
// mês. A casa fazia UMA passada por mês, de 12 peças, e o Premium anunciava
// 160.
//
// ═══ O QUE MUDOU, E POR QUE A CATRACA APERTOU EM VEZ DE AFROUXAR ════════════
//
// O CEO escolheu o conserto (b): a PRODUÇÃO passou a entregar mais. Três levas
// de até 12 peças por ciclo, uma a cada dez dias, sem relógio novo — pegando
// carona no despertador que já bate a cada 5 minutos. Teto mensal: 36.
//
// Com a capacidade no lugar, a tabela nova coube: 12, 20 e 32 peças/mês. E aí a
// catraca deixou de segurar o tamanho de uma dívida e passou a exigir que ela
// seja ZERO — que é o único estado em que a vitrine e a entrega dizem a mesma
// coisa.
//
// ⚠️ A ORDEM É PARTE DA REGRA: a capacidade sobe primeiro, a tabela depois. Este
// teste é o que impede a ordem inversa — um plano novo acima do teto não
// compila, e não existe caminho de aprová-lo sem mexer na capacidade.

import { describe, it, expect } from "vitest";
import { SOCIAL_PACKAGES } from "@/lib/agency/live-calculator";
import { PLANOS, PECAS_POR_MES } from "@/lib/agency/planos";
import {
  MISTURA_DE_FORMATOS,
} from "@/lib/agency/execution/especialistas";
import {
  LIMITES_POR_FORMATO, DIVIDA_DA_VITRINE, ENTREGAS_POR_MES,
  TETO_MENSAL, TETO_DE_PECAS_POR_PASSADA_ESPELHO, TETO_SEMANAL_DA_CASA,
  receitaDoLote, misturaDoLote,
} from "@/lib/agency/contrato-de-quantidade";
import {
  TETO_DE_PECAS_POR_ENTREGA, TETO_MENSAL_DE_PECAS, LEVAS_POR_CICLO,
  DIAS_ENTRE_LEVAS, planoDeLevas, levaDevidaEm,
} from "@/lib/agency/execution/escopo-do-cliente";

/** O que o plano anuncia por mês. A mesma conta que a descrição dele mostra. */
const prometidoPorMes = (p: (typeof SOCIAL_PACKAGES)[number]) =>
  p.postsPerWeek * 4 + p.storiesPerWeek * 4 + p.reelsPerMonth;

describe("a medição, para ninguém ter de refazê-la de cabeça", () => {
  it("a casa faz TRÊS levas por ciclo, de até 12 peças — 36/mês", () => {
    expect(ENTREGAS_POR_MES).toBe(3);
    expect(LEVAS_POR_CICLO).toBe(3);
    expect(TETO_DE_PECAS_POR_ENTREGA).toBe(12);
    expect(TETO_MENSAL_DE_PECAS).toBe(36);
  });

  it("o teto que a VENDA usa e o teto que a PRODUÇÃO aplica são o mesmo número", () => {
    // `contrato-de-quantidade` não pode importar o motor (a sala de briefing
    // roda no navegador), então ele espelha o número. Espelho sem prova é a
    // segunda tabela que envelhece sozinha — a prova é esta.
    expect(TETO_DE_PECAS_POR_PASSADA_ESPELHO).toBe(TETO_DE_PECAS_POR_ENTREGA);
    expect(TETO_MENSAL).toBe(TETO_MENSAL_DE_PECAS);
    expect(TETO_SEMANAL_DA_CASA).toBe(9);
  });

  it("o ritmo das levas cabe em qualquer mês", () => {
    // Três levas de dez em dez dias entram em fevereiro e em janeiro igual.
    expect(DIAS_ENTRE_LEVAS * (LEVAS_POR_CICLO - 1)).toBeLessThan(28);
  });
});

describe("a catraca: a dívida é ZERO, e o registro tem de mostrar isso", () => {
  it("o registro da dívida está VAZIO — dívida paga sai do registro", () => {
    expect(Object.keys(DIVIDA_DA_VITRINE)).toEqual([]);
  });

  for (const p of SOCIAL_PACKAGES) {
    it(`${p.id}: cabe no que a casa entrega`, () => {
      const real = prometidoPorMes(p);
      expect(
        real,
        `O plano "${p.id}" promete ${real} peças/mês e a casa entrega ${TETO_MENSAL}. ` +
        "A capacidade sobe PRIMEIRO (levas, em `escopo-do-cliente.ts`); a tabela, depois. " +
        "Subir a promessa antes da capacidade é a casa voltar a prometer o que não entrega — " +
        "desta vez por escrito e aprovada, que é pior.",
      ).toBeLessThanOrEqual(TETO_MENSAL);
      expect(DIVIDA_DA_VITRINE[p.id], `"${p.id}" cabe no teto e não pode estar no registro de dívida.`).toBeUndefined();
    });
  }

  it("a tabela é a ÚNICA (26/08/2026) — derivada de `PLANOS`, e o teto encosta na capacidade", () => {
    // ⚠️ NADA AQUI É DIGITADO. A fotografia anterior travava 590/12 · 990/20 ·
    // 1790/32 — os números da segunda tabela, que não existiam na vitrine.
    // Repetir esse erro seria travar os números NOVOS num teste: a régua passa
    // a ser a DERIVAÇÃO, e o número, consequência.
    const daVitrine = PLANOS.filter((p) => p.pecasPorMes > 0);
    expect(SOCIAL_PACKAGES.map((p) => [p.id, p.minPrice, p.maxPrice, prometidoPorMes(p)])).toEqual(
      daVitrine.map((p) => [p.id, p.preco, p.preco, p.pecasPorMes]),
    );
    // Preço FECHADO, não faixa: proposta automática com faixa é o vendedor
    // decidindo sozinho quanto cobrar.
    for (const p of SOCIAL_PACKAGES) expect(p.minPrice).toBe(p.maxPrice);
  });

  it("plano NOVO acima do teto quebra o build — a dívida não volta em silêncio", () => {
    const planoNovo = { id: "hipotetico", postsPerWeek: 10, storiesPerWeek: 5, reelsPerMonth: 4 };
    // 40 + 20 + 4 = 64 > 36. É esta conjunção que o teste acima aplica a cada
    // plano de verdade: ou cabe, ou entra no registro e alguém tem de saber.
    const cabe = prometidoPorMes(planoNovo as never) <= TETO_MENSAL;
    const registrado = DIVIDA_DA_VITRINE[planoNovo.id] !== undefined;
    expect(cabe || registrado).toBe(false);
  });
});

describe("VÍDEO E REEL NÃO ENTRAM — promessa sem produtor é a dívida de D-0A3", () => {
  it("nenhum plano da tabela promete reel", () => {
    for (const p of SOCIAL_PACKAGES) {
      expect(p.reelsPerMonth, `"${p.id}" promete ${p.reelsPerMonth} reels e a casa não edita vídeo.`).toBe(0);
      expect(/reel|v[ií]deo/i.test(p.description), `a descrição de "${p.id}" promete vídeo.`).toBe(false);
    }
  });

  it("nenhum plano da página pública promete reel, roteiro de reel ou vídeo", () => {
    // A SEGUNDA tabela da casa (`/planos`) estava fora da catraca — e prometia
    // "4 roteiros de reels" no plano Conteúdo. Duas tabelas, uma régua só.
    for (const p of PLANOS) {
      for (const linha of p.inclui) {
        expect(/reels?|v[ií]deo/i.test(linha), `o plano "${p.id}" INCLUI "${linha}" — vídeo não entra em plano nenhum.`).toBe(false);
      }
    }
  });

  it("os planos públicos também cabem no teto do mês, e a frase bate com pecasPorMes — não só <= teto", () => {
    // Antes (29/08/2026), este teste só conferia `<= TETO_MENSAL` e, com
    // `if (!m) continue`, PULAVA EM SILÊNCIO qualquer plano cuja frase tivesse
    // perdido o número — o irmão do defeito do PR #396 (recompra redigitando
    // "8" com a fonte em 12). Mude `pecasPorMes` do Ritmo para 10 sem tocar na
    // frase de `inclui[]`: o teste antigo continuava verde e a vitrine mentia.
    // Agora exige IGUALDADE com o campo estruturado, e falha — não pula — se a
    // frase não trouxer nenhum número.
    for (const p of PLANOS) {
      const m = /(\d+)\s*peças por mês/.exec(p.inclui.join(" · "));
      if (p.pecasPorMes === 0) {
        // O Pulso (pecasPorMes: 0) não promete peça — e diz isso em
        // `naoInclui`, não em `inclui`. Fica de fora desta checagem de
        // propósito, não por acaso.
        expect(
          p.naoInclui,
          `"${p.id}" tem pecasPorMes 0 e devia declarar em naoInclui que não inclui peça de conteúdo.`,
        ).toContain("Nenhuma peça de conteúdo");
        continue;
      }
      expect(
        m,
        `o plano "${p.id}" tem pecasPorMes=${p.pecasPorMes} mas a frase de inclui[] não traz nenhum número de peças por mês — pulo silencioso proibido.`,
      ).not.toBeNull();
      expect(
        Number(m![1]),
        `o plano público "${p.id}" promete ${m![1]} peças/mês na frase, mas pecasPorMes é ${p.pecasPorMes} — os dois têm de bater.`,
      ).toBe(p.pecasPorMes);
      expect(
        Number(m![1]),
        `o plano público "${p.id}" promete ${m![1]} peças/mês contra um teto de ${TETO_MENSAL}.`,
      ).toBeLessThanOrEqual(TETO_MENSAL);
    }
  });

  it("a frase de inclui[] deriva de PECAS_POR_MES, não de um número redigitado no teste", () => {
    // A metade que faltava: provar que a frase segue a MESMA constante que
    // `pecasPorMes` usa, e não um número solto que por acaso bate hoje. Se
    // planos.ts voltar a escrever "12 peças por mês" à mão em vez de
    // interpolar `PECAS_POR_MES.ritmo`, este teste não tem como saber — por
    // isso ele também confere que PECAS_POR_MES e pecasPorMes são o mesmo
    // valor, para os dois lados da divergência ficarem cobertos.
    for (const p of PLANOS) {
      const volume = PECAS_POR_MES[p.id];
      expect(volume, `PECAS_POR_MES não tem entrada para o plano "${p.id}".`).toBe(p.pecasPorMes);
      if (volume === 0) continue;
      const frase = p.inclui.join(" · ");
      expect(
        frase.includes(`${volume} peças por mês`),
        `a frase de "${p.id}" não contém "${volume} peças por mês", montada a partir de PECAS_POR_MES.${p.id} — não de um número redigitado neste teste.`,
      ).toBe(true);
    }
  });
});

describe("a mistura vira proporção do lote — e continua sendo UMA tabela só", () => {
  it("MISTURA_DE_FORMATOS e LIMITES_POR_FORMATO são o MESMO objeto", () => {
    expect(MISTURA_DE_FORMATOS).toBe(LIMITES_POR_FORMATO);
  });

  it("a receita SEMPRE soma o lote — nenhuma aritmética sobra para o modelo", () => {
    for (const lote of [1, 3, 4, 7, 10, 11, 12]) {
      for (const permitidos of [
        ["feed"], ["carrossel", "feed"], ["carrossel", "story", "feed"],
      ] as const) {
        const r = receitaDoLote(lote, permitidos);
        const soma = r.carrossel + r.story + r.feed;
        expect(soma, `lote ${lote} com [${permitidos}] somou ${soma}`).toBe(lote);
        // Formato fora do escopo NÃO recebe peça: entregar o que o cliente
        // excluiu é entregar outra coisa.
        for (const f of ["carrossel", "story", "feed"] as const) {
          if (!permitidos.includes(f as never)) expect(r[f]).toBe(0);
        }
      }
    }
  });

  it("o lote grande do Completo e o lote pequeno do Essencial cabem os dois", () => {
    // Era aqui que a régua absoluta reprovava os DOIS extremos: o lote de 11
    // porque os tetos somavam 8, e o lote de 4 porque os mínimos somavam 5.
    for (const lote of [4, 11]) {
      const regua = misturaDoLote(lote, ["carrossel", "story", "feed"]);
      const somaDosMinimos = regua.carrossel[0] + regua.story[0] + regua.feed[0];
      const somaDosTetos = regua.carrossel[1] + regua.story[1] + regua.feed[1];
      expect(somaDosMinimos).toBeLessThanOrEqual(lote);
      expect(somaDosTetos).toBeGreaterThanOrEqual(lote);
    }
  });
});

describe("o mês comprado se reparte entre as levas", () => {
  it("32 peças viram três levas, nenhuma acima do teto da passada", () => {
    const plano = planoDeLevas(32);
    expect(plano).toEqual([11, 11, 10]);
    expect(plano.reduce((a, b) => a + b, 0)).toBe(32);
    for (const n of plano) expect(n).toBeLessThanOrEqual(TETO_DE_PECAS_POR_ENTREGA);
  });

  it("12 e 20 também se repartem — ninguém recebe o mês num dia só", () => {
    expect(planoDeLevas(12)).toEqual([4, 4, 4]);
    expect(planoDeLevas(20)).toEqual([7, 7, 6]);
  });

  it("o que passa do teto do mês NÃO é prometido", () => {
    expect(planoDeLevas(100).reduce((a, b) => a + b, 0)).toBe(TETO_MENSAL_DE_PECAS);
  });

  it("a leva devida anda de dez em dez dias e para na terceira", () => {
    const inicio = new Date("2026-09-01T00:00:00Z");
    const em = (dia: number) => levaDevidaEm(inicio, new Date(`2026-09-${String(dia).padStart(2, "0")}T12:00:00Z`));
    expect(em(1)).toBe(1);
    expect(em(10)).toBe(1);
    expect(em(11)).toBe(2);
    expect(em(21)).toBe(3);
    // Ciclo atrasado não vira crédito de peça.
    expect(levaDevidaEm(inicio, new Date("2026-12-01T00:00:00Z"))).toBe(3);
  });
});
