// E1 — A TABELA NO CÓDIGO (30/08/2026). Ver `.despachos/E1-tabela-no-codigo.md`.
//
// TRÊS COISAS, NA ORDEM DO DESPACHO:
//
//   1. `PECA_EXTRA` (R$ 90, `planos.ts`) e `avulso_post`/`avulso_carrossel`
//      (R$ 190/290, `tabela-de-precos.ts`) eram TRÊS preços vivos para a mesma
//      venda. Convergem para `PRECO_DA_PECA_AVULSA` (R$ 55) — uma fonte só.
//   2. Cada plano vira COMPOSIÇÃO (soma da carta − desconto), sem mexer no
//      preço final fechado pelo CEO (R$ 49/290/490/790).
//   3. O SDR responde sozinho "quanto custa N peças/mês", pelo CAMINHO REAL
//      (`computeEstimate`, o mesmo que a sala de briefing roda ao vivo) — não
//      por uma função solta chamada à mão.
//
// ⚠️ O PONTO DELICADO, TESTADO EXPLICITAMENTE: o despacho esperava R$ 700/mês
// para 28–30 peças. R$ 55 × 28 = R$ 1.540 (não fecha). A curva de volume real
// desta casa (os degraus dos planos) produz **R$ 790/mês**, não R$ 700 — ver
// `contaDaComposicao` em `tabela-de-precos.ts` para a conta completa e por que
// nenhuma curva desta casa foi forçada a bater com R$ 700.

import { describe, it, expect } from "vitest";
import { PLANOS, PRECO_DA_PECA_AVULSA, composicaoDoPlano } from "@/lib/agency/planos";
import {
  TABELA_DE_PRECOS, servicoPorChave, composicaoDoServico, contaDaComposicao,
  volumeQueACasaVende, podeOfertar, comoSeguirSemBaixarOPreco,
} from "@/lib/agency/financeiro/tabela-de-precos";
import { degrausAbaixo } from "@/lib/agency/comercial/negociacao-da-proposta";
import { computeEstimate } from "@/lib/agency/live-calculator";
import type { BriefingScope } from "@/lib/agency/briefing-conversation";

// ─────────────────────────────────────────────────────────────────────────────
describe("1. a peça avulsa tem UMA fonte — PECA_EXTRA e o avulso convergem", () => {
  it("avulso_post e avulso_carrossel são PRECO_DA_PECA_AVULSA, não mais 190/290", () => {
    expect(servicoPorChave("avulso_post")!.precoFinalCentavos).toBe(PRECO_DA_PECA_AVULSA * 100);
    expect(servicoPorChave("avulso_carrossel")!.precoFinalCentavos).toBe(PRECO_DA_PECA_AVULSA * 100);
    expect(PRECO_DA_PECA_AVULSA).toBe(55);
  });

  it("os três planos com peça extra apontam para a MESMA constante — não um literal cada", () => {
    // MUTAÇÃO QUE PROVA: troque `pecaExtra: PRECO_DA_PECA_AVULSA` por
    // `pecaExtra: 90` em qualquer um dos três planos — esta linha cai.
    for (const p of PLANOS.filter((x) => x.pecaExtra !== null)) {
      expect(p.pecaExtra, `${p.nome} tem peça extra fora da fonte única`).toBe(PRECO_DA_PECA_AVULSA);
    }
  });

  it("o balcão NÃO converge — é produto diferente, e continua com preço próprio", () => {
    // Preservado de propósito: self-serve, sem direção de arte, pago antes da
    // produção, aberto a qualquer pessoa. Ver o cabeçalho de `planos.ts`.
    expect(servicoPorChave("balcao_post")!.precoFinalCentavos).toBe(7900);
    expect(servicoPorChave("balcao_carrossel")!.precoFinalCentavos).toBe(12900);
  });

  it("nenhum serviço da tabela ainda carrega os preços mortos (90/190/290)", () => {
    const precosVivos = new Set(TABELA_DE_PRECOS.map((s) => s.precoFinalCentavos));
    // 9000 = R$ 90 (PECA_EXTRA morto). 19000/29000 já não aparecem em avulso_*
    // (viraram 5500), e não sobra nenhum serviço cravado neles.
    expect([...precosVivos]).not.toContain(9000);
  });

  // ── O EFEITO COLATERAL DA CONVERGÊNCIA, E O CONSERTO QUE ELE EXIGIU ────────
  //
  // Unificar `avulso_*` para R$ 55 fez a peça avulsa (com direção de arte,
  // exclusiva de quem já é cliente de plano) ficar MAIS BARATA que o balcão
  // (R$ 79/129, self-serve, aberto a qualquer um). Sem o conserto em
  // `comoSeguirSemBaixarOPreco` e `degrausAbaixo`, essa inversão faria a casa
  // oferecer "avulso" como "degrau de baixo" para um prospect do balcão, ou
  // como "próximo degrau" de um plano — os dois errados, porque avulso não é
  // recorrente e não é um produto de entrada. Estes dois testes travam isso.
  it("balcão caro NÃO empurra o cliente para o avulso (que ele não pode comprar)", () => {
    const v = podeOfertar("balcao_carrossel", 1000);
    expect(v.pode).toBe(false);
    if (!v.pode) {
      expect(v.comoSeguir).not.toMatch(/avulso/i);
      expect(v.comoSeguir).toMatch(/gerente do projeto/i);
    }
  });

  it("o 'degrau abaixo' de um plano NUNCA é o avulso — só outro plano", () => {
    const conteudo = servicoPorChave("plano_conteudo")!;
    const abaixo = degrausAbaixo(conteudo);
    expect(abaixo.every((s) => s.chave.startsWith("plano_"))).toBe(true);
    expect(comoSeguirSemBaixarOPreco(conteudo)).not.toMatch(/avulso/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("2. o plano é composição — soma da carta menos desconto, preço final intocado", () => {
  it("os quatro preços fechados pelo CEO não mudaram: 49 / 290 / 490 / 790", () => {
    const porId = Object.fromEntries(PLANOS.map((p) => [p.id, p.preco]));
    expect(porId.pulso).toBe(49);
    expect(porId.ritmo).toBe(290);
    expect(porId.presenca).toBe(490);
    expect(porId.conteudo).toBe(790);
  });

  it("Pulso não compõe — zero peça, nada para somar", () => {
    const pulso = PLANOS.find((p) => p.id === "pulso")!;
    expect(composicaoDoPlano(pulso)).toBeNull();
  });

  it("Ritmo: 12 × R$ 55 = R$ 660, desconto de R$ 370 (56,06%) para chegar em R$ 290", () => {
    const c = composicaoDoPlano(PLANOS.find((p) => p.id === "ritmo")!)!;
    expect(c.somaCentavos).toBe(66000);
    expect(c.precoFinalCentavos).toBe(29000);
    expect(c.descontoCentavos).toBe(37000);
    expect(c.descontoPct).toBeCloseTo(56.06, 1);
  });

  it("Conteúdo: 36 × R$ 55 = R$ 1.980, desconto de R$ 1.190 (60,10%) para chegar em R$ 790", () => {
    const c = composicaoDoPlano(PLANOS.find((p) => p.id === "conteudo")!)!;
    expect(c.somaCentavos).toBe(198000);
    expect(c.precoFinalCentavos).toBe(79000);
    expect(c.descontoCentavos).toBe(119000);
    expect(c.descontoPct).toBeCloseTo(60.1, 1);
  });

  it("a tabela financeira expõe a MESMA composição, pelo serviço `plano_*`", () => {
    const s = servicoPorChave("plano_conteudo")!;
    const c = composicaoDoServico(s)!;
    expect(c.precoFinalCentavos).toBe(s.precoFinalCentavos);
    expect(c.somaCentavos).toBe(198000);
  });

  it("balcão e avulso não compõem — já são uma peça só", () => {
    expect(composicaoDoServico(servicoPorChave("balcao_post")!)).toBeNull();
    expect(composicaoDoServico(servicoPorChave("avulso_carrossel")!)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. O SDR RESPONDE SOZINHO — pelo caminho real, não por função solta
// ─────────────────────────────────────────────────────────────────────────────
describe("3. o SDR responde 'quanto custa 28-30 peças/mês' pelo caminho real do cliente", () => {
  function escopoDePosts(postsPerWeek: number): BriefingScope {
    return {
      objectives: [],
      wantsSocialMedia: true,
      social: { platforms: ["Instagram"], postsPerWeek },
    };
  }

  it("28 peças/mês (7/semana): o caminho REAL do briefing (computeEstimate) responde R$ 790, não R$ 700", () => {
    // `computeEstimate` é a MESMA função que `app/api/portal/briefing/proposta`
    // e a sala de briefing ao vivo rodam — não uma função solta inventada para
    // este teste. Ela chama `detectPackage`, que já é testado e usado em
    // produção (`live-calculator.ts`).
    const e = computeEstimate(escopoDePosts(7));
    expect(e.totalMin).toBe(790);
    expect(e.totalMax).toBe(790);
    expect(e.totalMin).not.toBe(700);
    // E o item da proposta nomeia o plano — o cliente lê o que está pagando.
    expect(e.items[0]!.label).toBe("Plano Conteúdo");
  });

  it("30 peças/mês (o teto do pedido do Marcos): precificado como pedido, com o Conteúdo OFERECIDO por ser mais barato", () => {
    // 30 não é múltiplo de 4; o que o cliente pede em VOLUME MENSAL é o que
    // importa — `volumeQueACasaVende` já prova isso para o número exato.
    //
    // ⚠️ ATUALIZADO PELO DESPACHO E2 (30/08/2026): a casa PARA de empurrar o
    // pedido para o degrau mais próximo. 30 é precificado como 30, à carta —
    // o plano Conteúdo entra como OFERTA (mais barato), não como resposta.
    const r = volumeQueACasaVende(30);
    expect(r.pedido).toBe(30);
    expect(r.precoCentavos).toBe(30 * 55 * 100); // R$ 1.650, à carta — o pedido, como pedido.
    expect(r.ofertaMaisBarata).not.toBeNull();
    expect(r.ofertaMaisBarata!.servico.nome).toBe("Conteúdo");
    expect(r.ofertaMaisBarata!.servico.precoFinalCentavos).toBe(79000);
  });

  it("⚠️ A CONTA QUE O DESPACHO E1 PEDIU, ATUALIZADA PELO E2: 28 peças custam R$ 1.540 (à carta); R$ 790 é a OFERTA, não a resposta", () => {
    const conta = contaDaComposicao(28);
    // Curva 1 — soma à carta: 28 × R$ 55.
    expect(conta.somaAvulsaCentavos).toBe(154000); // R$ 1.540 — bate com o despacho E1.
    // ⚠️ MUDANÇA DO E2: esta soma à carta agora É o preço que a casa cobra por
    // padrão — não mais o "caminho que ninguém escolhe". A curva de volume
    // (o degrau que cobre o pedido) virou OFERTA, sujeita ao "quer?" do
    // cliente, nunca imposição.
    const resposta = conta.respostaPelaCurvaDeVolume;
    expect(resposta.precoCentavos).toBe(154000);
    expect(resposta.ofertaMaisBarata).not.toBeNull();
    const precoDoPlanoOfertadoCentavos = resposta.ofertaMaisBarata!.servico.precoFinalCentavos;
    expect(precoDoPlanoOfertadoCentavos).toBe(79000); // R$ 790 — a OFERTA, não mais "a resposta".
    // NENHUMA das duas é R$ 700 (70000 centavos) — a régua desta casa (sem
    // faixa de desconto declarada, "sem faixa configurada, desconto nenhum")
    // não sustenta o número esperado no despacho E1. Isto NÃO É defeito deste
    // teste: é o relato que o despacho pediu — "PARE e relate o número real".
    expect(conta.somaAvulsaCentavos).not.toBe(70000);
    expect(precoDoPlanoOfertadoCentavos).not.toBe(70000);
    // A economia de trocar para o plano em vez de ficar à carta — para o registro.
    expect(conta.economiaCentavos).toBe(75000); // R$ 750 de economia, não R$ 840 (que R$ 700 exigiria).
  });

  it("⛔ E2 (30/08/2026): acima da capacidade (37+) a casa NÃO recusa — devolve preço e prazo, nunca 'não vende'", () => {
    // Este teste SUBSTITUI o que existia (`r.vende === false`). O anterior
    // travava exatamente a recusa que o CEO proibiu. Rodar esta suíte contra
    // o código de antes do E2 é o que prova a mutação: `.vende` nem existe
    // mais no tipo de retorno.
    const r = volumeQueACasaVende(300);
    expect(r.cabeNaCapacidadeAtual).toBe(false);
    expect(r.precoCentavos).toBe(300 * 55 * 100);
    expect(r.prazoEmMeses).toBe(Math.ceil(300 / 36));
    expect(r.frase).toMatch(/capacidade/i);
    expect(r.frase).not.toMatch(/não vend|dívida com outro rosto/i);
  });
});
