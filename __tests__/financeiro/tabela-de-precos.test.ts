// A TABELA DE PREÇOS E O FREIO DO NEGOCIADOR — 27/08/2026.
//
// Ordem do CEO: *"preço de custo, preço final, margem de desconto — até onde eu
// posso dar de desconto, pro SDR negociador ter na manga. Isso tem que estar
// claríssimo pro negociador."* E o freio: o SDR **não pode** ofertar abaixo do
// piso.
//
// Estes testes travam as duas metades: a tabela (uma fonte só) e a recusa.

import { describe, it, expect } from "vitest";
import {
  TABELA_DE_PRECOS, TETO_DE_PECAS_POR_MES, CUSTOS_NAO_MEDIDOS,
  podeOfertar, podePrometerVolume, pisoDoServico, margemNoPiso,
  servicoPorChave, coberturaDeCusto, volumeQueACasaVende, aCasaProduz,
  MARGEM_MINIMA_PCT, fechaMargemMinima, servicosQueNaoFechamAMargem,
  margemNoPisoPct, precoQueFechaAMargemMinima,
} from "@/lib/agency/financeiro/tabela-de-precos";
import { medido } from "@/lib/agency/financeiro/dinheiro";

describe("a tabela é a fonte única", () => {
  it("os três planos entram com o preço fechado em D-0B6 — e não são remarcados", () => {
    expect(servicoPorChave("plano_ritmo")!.precoFinalCentavos).toBe(29000);
    expect(servicoPorChave("plano_presenca")!.precoFinalCentavos).toBe(49000);
    expect(servicoPorChave("plano_conteudo")!.precoFinalCentavos).toBe(79000);
  });

  it("os planos entregam exatamente o volume da decisão — 12, 20 e 36", () => {
    expect(servicoPorChave("plano_ritmo")!.pecasPorMes).toBe(12);
    expect(servicoPorChave("plano_presenca")!.pecasPorMes).toBe(20);
    expect(servicoPorChave("plano_conteudo")!.pecasPorMes).toBe(36);
  });

  it("todo serviço tem produtor — vitrine é promessa, e promessa sem produtor é dívida", () => {
    for (const s of TABELA_DE_PRECOS) {
      expect(s.produtor, `${s.nome} sem produtor`).toBeTruthy();
      expect(["maquina", "maquina_com_direcao", "humano"]).toContain(s.produtor);
    }
  });

  it("vídeo e reel NÃO estão na tabela — não há quem produza", () => {
    const nomes = TABELA_DE_PRECOS.map((s) => s.nome.toLowerCase()).join(" ");
    expect(nomes).not.toMatch(/v[ií]deo|reel|stories?\b/);
    expect(podeOfertar("video", 50000).pode).toBe(false);
    expect(podeOfertar("reel", 50000).pode).toBe(false);
  });

  it("nenhum plano passa da capacidade da casa", () => {
    for (const s of TABELA_DE_PRECOS) {
      expect(s.pecasPorMes).toBeLessThanOrEqual(TETO_DE_PECAS_POR_MES);
    }
  });
});

describe("o custo é honesto sobre o que não sabe", () => {
  it("nenhum serviço tem custo dado como medido — cinco parcelas faltam", () => {
    // O CEO esperava que o Financeiro já tivesse tudo. Foi medido: não tem.
    for (const s of TABELA_DE_PRECOS) {
      expect(s.custo.estado, `${s.nome} finge saber o próprio custo`).toBe("nao_medido");
    }
    expect(coberturaDeCusto().medidos).toBe(0);
    expect(coberturaDeCusto().parcelasEmFalta).toBe(CUSTOS_NAO_MEDIDOS.length);
  });

  it("cada custo não medido tem motivo E dono — buraco sem dono é buraco esquecido", () => {
    expect(CUSTOS_NAO_MEDIDOS.length).toBeGreaterThan(0);
    for (const c of CUSTOS_NAO_MEDIDOS) {
      expect(c.motivo.length, `${c.rotulo} sem motivo`).toBeGreaterThan(10);
      expect(c.dono, `${c.rotulo} sem dono`).toMatch(/CEO|gerente/i);
    }
  });

  it("a margem no piso NÃO é inventada quando o custo não é medido", () => {
    // Margem calculada sobre custo incompleto é pior que margem nenhuma: dá
    // confiança falsa para o negociador descer o preço.
    for (const s of TABELA_DE_PRECOS) {
      expect(margemNoPiso(s).estado).toBe("nao_medido");
    }
  });
});

describe("o piso: sem faixa autorizada, desconto nenhum", () => {
  it("hoje o piso É o preço de tabela — nenhuma faixa foi autorizada", () => {
    for (const s of TABELA_DE_PRECOS) {
      expect(s.descontoAutorizadoPct).toBeNull();
      expect(pisoDoServico(s)).toBe(s.precoFinalCentavos);
    }
  });

  // ⚠️ ESTE TESTE MUDOU DE RESPOSTA EM 27/08/2026, E A MUDANÇA É A ORDEM DO CEO.
  //
  // Ele afirmava que uma faixa autorizada baixava o piso: 79000 − 10% = 71100.
  // Estava certo até a ordem *"margem mínima nesse início: dez por cento de
  // lucro"*. Com o custo `nao_medido`, ninguém consegue PROVAR que 71100 deixa
  // 10% — pode deixar 40% e pode ser prejuízo, e os dados da casa sustentam as
  // duas hipóteses igualmente. O que não se prova não vale, e o piso NÃO desce.
  //
  // Não é o teste que ficou chato: é a régua que subiu, e o teste seguiu a régua.
  it("faixa autorizada NÃO baixa o piso enquanto o custo tiver buraco", () => {
    const s = { ...servicoPorChave("plano_conteudo")!, descontoAutorizadoPct: 10 };
    expect(s.custo.estado).toBe("nao_medido");
    expect(pisoDoServico(s)).toBe(79000);
    // E o SDR bate na trava mesmo com a autorização escrita ao lado dele.
    expect(margemNoPisoPct(s)).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// A MARGEM MÍNIMA DE 10% — ordem do CEO, 27/08/2026
// ═══════════════════════════════════════════════════════════════════════════

describe("⛔ dez por cento de lucro é o chão, e é código", () => {
  const comCusto = (centavos: number, desconto: number | null) => ({
    ...servicoPorChave("plano_conteudo")!,
    custo: medido(centavos, "manual" as const),
    descontoAutorizadoPct: desconto,
  });

  // A LEITURA ESCOLHIDA, ESCRITA: 10% DO PREÇO, não 10% em cima do custo.
  // "custo × 1,10" daria 9,1% de margem e passaria por baixo da ordem sem
  // ninguém ver a diferença. Onde há duas leituras, a casa fica com a que
  // protege — e diz qual escolheu.
  it("o piso é custo ÷ 0,90, não custo × 1,10", () => {
    expect(precoQueFechaAMargemMinima(9000)).toBe(10000);
    expect(precoQueFechaAMargemMinima(45000)).toBe(50000);
  });

  // MUTAÇÃO QUE DERRUBA: trocar `Math.max(comDesconto, comMargemMinima)` por
  // `comDesconto` em `pisoDoServico`. O CEO autoriza 40% num serviço cujo custo
  // come 70% do preço, e o SDR fecha a venda no prejuízo achando que cumpriu a
  // regra.
  it("o piso SOBE quando o desconto autorizado passaria por baixo dos 10%", () => {
    // Custo R$ 553,00 sobre preço R$ 790,00. Com 40% autorizados o preço iria a
    // R$ 474,00 — prejuízo de R$ 79,00. O piso sobe para 55300 ÷ 0,90.
    const s = comCusto(55300, 40);
    expect(pisoDoServico(s)).toBe(61445);
    // ≥ 10, nunca 9,99. O `Math.ceil` do piso é de propósito: arredondar para
    // baixo entregaria 9,9992% e chamaria de dez por cento.
    expect(margemNoPisoPct(s)!).toBeGreaterThanOrEqual(MARGEM_MINIMA_PCT);
    expect(margemNoPisoPct(s)!).toBeLessThan(MARGEM_MINIMA_PCT + 0.01);
    expect(podeOfertar("plano_conteudo", 47400).pode).toBe(false);
  });

  it("quando o desconto CABE nos 10%, ele vale — a trava não estrangula a venda", () => {
    // Custo R$ 100,00, desconto 10% → R$ 711,00, margem de 85,9%. Passa.
    const s = comCusto(10000, 10);
    expect(pisoDoServico(s)).toBe(71100);
    expect(margemNoPisoPct(s)!).toBeGreaterThan(10);
  });

  // MUTAÇÃO QUE DERRUBA: tirar o `if (s.custo.estado !== "medido") return
  // s.precoFinalCentavos;`. É a linha que impede *margem otimista sobre custo
  // incompleto* — a que dá confiança falsa ao negociador para descer o preço até
  // um lugar que parece lucro e é prejuízo.
  it("custo NÃO MEDIDO anula qualquer faixa autorizada, em todos os serviços", () => {
    for (const s of TABELA_DE_PRECOS) {
      const comFaixa = { ...s, descontoAutorizadoPct: 40 };
      expect(pisoDoServico(comFaixa), `${s.nome} deixou o desconto passar`).toBe(s.precoFinalCentavos);
      expect(margemNoPisoPct(comFaixa)).toBeNull();
    }
  });

  it("a margem no piso NUNCA é um número quando o custo não é um número", () => {
    for (const s of TABELA_DE_PRECOS) {
      expect(margemNoPisoPct(s), `${s.nome} inventou uma margem`).toBeNull();
    }
  });
});

describe("⛔ o SDR não consegue ofertar abaixo do piso", () => {
  it("recusa um centavo abaixo do piso", () => {
    const v = podeOfertar("plano_conteudo", 78999);
    expect(v.pode).toBe(false);
    if (!v.pode) {
      expect(v.pisoCentavos).toBe(79000);
      expect(v.motivo).toMatch(/piso/i);
    }
  });

  it("recusa o desconto que o cliente pediu de boca — 'faz por 500'", () => {
    expect(podeOfertar("plano_conteudo", 50000).pode).toBe(false);
    expect(podeOfertar("plano_presenca", 30000).pode).toBe(false);
    expect(podeOfertar("plano_ritmo", 19000).pode).toBe(false);
  });

  it("aceita o preço de tabela, e aceita acima dele", () => {
    expect(podeOfertar("plano_conteudo", 79000).pode).toBe(true);
    expect(podeOfertar("plano_conteudo", 99000).pode).toBe(true);
  });

  it("preço inválido (NaN, negativo) é recusa, nunca passagem", () => {
    // Fail-closed: número que não é número não pode virar oferta.
    expect(podeOfertar("plano_ritmo", Number.NaN).pode).toBe(false);
    expect(podeOfertar("plano_ritmo", -1).pode).toBe(false);
    expect(podeOfertar("plano_ritmo", Number.NEGATIVE_INFINITY).pode).toBe(false);
  });

  it("a recusa NUNCA vira beco: vem com como seguir", () => {
    const v = podeOfertar("plano_conteudo", 50000);
    expect(v.pode).toBe(false);
    if (!v.pode) {
      // Muda-se de degrau, não de preço — e o degrau de baixo tem nome e preço.
      expect(v.comoSeguir).toMatch(/Presença/);
      expect(v.comoSeguir).toMatch(/degrau/i);
    }
  });

  it("no degrau mais barato a saída é GENTE, com próxima ação", () => {
    const v = podeOfertar("balcao_post", 1000);
    expect(v.pode).toBe(false);
    if (!v.pode) {
      expect(v.comoSeguir).toMatch(/gerente do projeto/i);
      expect(v.comoSeguir).not.toMatch(/degrau de baixo/i);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// E2 (30/08/2026) — A CASA RECUSA VIRA PREÇO. O CEO PROIBIU A RECUSA.
// ═══════════════════════════════════════════════════════════════════════════
//
// *"Não existe volume acima ou abaixo. Se o cliente quiser trezentos
// carrosséis por dia, a gente vai ter que dar um jeito. Não é exceção — o que
// ele está comprando é um pacote personalizado."* — CEO, 30/08/2026.
//
// Os testes abaixo SUBSTITUEM os que existiam: a versão anterior desta
// suíte travava exatamente o comportamento que o CEO proibiu —
// `podePrometerVolume(37).pode === false` e `volumeQueACasaVende(60).vende
// === false`. Rodar esta suíte contra o código de ANTES do E2 (com a recusa
// reposta) é o que prova a mutação: os testes ficam VERMELHOS, porque
// `.pode`/`.vende` não existem mais no retorno e a recusa que eles checavam
// não acontece.
describe("o SDR nunca recusa volume — devolve preço e prazo, sempre", () => {
  it("o teto é 36 — continua um fato do mundo, mas agora vira PRAZO, nunca recusa", () => {
    expect(TETO_DE_PECAS_POR_MES).toBe(36);
    const dentro = podePrometerVolume(36);
    expect(dentro.cabeNaCapacidadeAtual).toBe(true);
    expect(dentro.prazoEmMeses).toBe(1);
    expect(dentro.precoCentavos).toBeGreaterThan(0);
  });

  it("37 (1 acima do teto) NÃO é recusado — sai preço e prazo de 2 meses", () => {
    const v = podePrometerVolume(37);
    expect(v.cabeNaCapacidadeAtual).toBe(false);
    expect(v.precoCentavos).toBeGreaterThan(0);
    expect(v.prazoEmMeses).toBe(2);
    // Nenhuma das duas frases antigas de recusa pode voltar.
    expect(v.frase).not.toMatch(/dívida com outro rosto/i);
    expect(v.frase).not.toMatch(/não pode|não vend/i);
    expect(v.frase).toMatch(/capacidade/i);
    expect(v.frase).toMatch(/CEO/);
  });

  it("100 peças/mês (quase 3× o teto): número e prazo, nunca 'não'", () => {
    const v = podePrometerVolume(100);
    expect(v.cabeNaCapacidadeAtual).toBe(false);
    expect(v.precoCentavos).toBe(100 * 55 * 100);
    expect(v.prazoEmMeses).toBe(Math.ceil(100 / 36));
    expect(v.frase).not.toMatch(/não pode|não vend/i);
  });

  it("⚠️ MUTAÇÃO: repor `if (pecasPorMes > TETO_DE_PECAS_POR_MES) return { pode: false, ... }` " +
    "faz este teste VERMELHO — `.pode` não existe no tipo novo, e o TS já barra a leitura",
    () => {
      // Prova por contrato: o retorno não tem mais `pode` nem `motivo` de recusa.
      const v = podePrometerVolume(37) as unknown as Record<string, unknown>;
      expect(v.pode).toBeUndefined();
      expect(v.motivo).toBeUndefined();
    });

  it("300 carrosséis por DIA — a fala literal do CEO — não gera recusa", () => {
    // "300 por dia" convertido a peças/mês (30 dias): o caso que o CEO deu,
    // usado literalmente, na escala em que ele foi dito.
    const pedidoMensal = 300 * 30;
    const v = podePrometerVolume(pedidoMensal);
    expect(v.cabeNaCapacidadeAtual).toBe(false);
    expect(v.precoCentavos).toBeGreaterThan(0);
    expect(v.prazoEmMeses).toBeGreaterThan(1);
    expect(v.frase).not.toMatch(/não pode|não vend|dívida/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OS DOIS DEFEITOS DO PAINEL DO CLIENTE 001 — 27/08/2026, ATUALIZADO PELO E2
//   "Posts: 28/mês"  → antes virava "36/mês (você pediu 28)"; agora é
//   precificado COMO PEDIDO, com o plano mais barato como OFERTA.
// ─────────────────────────────────────────────────────────────────────────────
describe("28 peças/mês: a casa precifica o que foi pedido — e OFERECE o plano mais barato", () => {
  it("28 é precificado como 28, à carta — nunca vira 36 calado", () => {
    const r = volumeQueACasaVende(28);
    expect(r.pedido).toBe(28);
    expect(r.precoCentavos).toBe(28 * 55 * 100);
    expect(r.cabeNaCapacidadeAtual).toBe(true);
    // A oferta existe (Conteúdo é mais barato), mas é OFERTA — o preço
    // cobrado por padrão continua sendo o da composição pedida.
    expect(r.ofertaMaisBarata).not.toBeNull();
    expect(r.ofertaMaisBarata!.servico.nome).toBe("Conteúdo");
    expect(r.frase).toMatch(/28/);
    expect(r.frase).toMatch(/quer\?/i);
  });

  it("o volume exato de um plano também recebe a oferta — nunca é escondida", () => {
    // 20 é o próprio tamanho do Presença: à carta (R$ 1.100) é mais caro que
    // o plano (R$ 490), e a casa diz isso — não finge que os dois empatam.
    const r = volumeQueACasaVende(20);
    expect(r.pedido).toBe(20);
    expect(r.precoCentavos).toBe(20 * 55 * 100);
    expect(r.ofertaMaisBarata!.servico.pecasPorMes).toBe(20);
  });

  it("acima da capacidade a casa NÃO recusa — devolve preço e prazo, nunca 'não vendemos'", () => {
    const r = volumeQueACasaVende(60);
    expect(r.cabeNaCapacidadeAtual).toBe(false);
    expect(r.precoCentavos).toBeGreaterThan(0);
    expect(r.prazoEmMeses).toBeGreaterThan(1);
    expect(r.frase).toMatch(/capacidade/i);
    expect(r.frase).not.toMatch(/não vend/i);
    // Nenhum plano de tabela cobre 60 (o maior é 36) — logo não há oferta de
    // preset mais barato para ofertar, e isto também precisa ficar honesto.
    expect(r.ofertaMaisBarata).toBeNull();
  });

  it("72 peças/mês (2× a capacidade): MESMO preço, o prazo é que muda com a decisão do CEO", () => {
    const r = volumeQueACasaVende(72);
    expect(r.precoCentavos).toBe(72 * 55 * 100);
    expect(r.prazoEmMeses).toBe(2);
    expect(r.frase).toMatch(/CEO/);
    expect(r.frase).toMatch(/escalar/i);
    // O despacho é literal: o preço é o MESMO nos dois caminhos (2 meses no
    // ritmo de hoje, ou 1 mês se o CEO escalar) — só o prazo muda.
    expect(r.frase).toMatch(/preço não muda/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// O VOCABULÁRIO PROIBIDO — item 4 do despacho E2. Regex sobre o texto
// devolvido, no molde do veto do jurídico.
// ─────────────────────────────────────────────────────────────────────────────
describe("⛔ nenhuma frase de volume usa o vocabulário proibido", () => {
  const PROIBIDO = /fora do plano|acima do plano|abaixo do plano|não cabe em nenhum plano|\bexceção\b|\bcustomizado\b|a definir|sob consulta/i;

  it("em nenhum dos casos do despacho — 28, 30, 36, 60, 72, 300/dia — a frase usa o vocabulário vetado", () => {
    const pedidosMensais = [28, 30, 36, 60, 72, 300 * 30];
    for (const pedido of pedidosMensais) {
      const capacidade = podePrometerVolume(pedido);
      expect(capacidade.frase, `podePrometerVolume(${pedido})`).not.toMatch(PROIBIDO);
      const volume = volumeQueACasaVende(pedido);
      expect(volume.frase, `volumeQueACasaVende(${pedido})`).not.toMatch(PROIBIDO);
    }
  });
});

describe("vídeo: 'não fazemos', nunca 'a definir'", () => {
  it("serviço sem produtor recebe uma recusa clara", () => {
    const r = aCasaProduz("Vídeo institucional");
    expect(r.produz).toBe(false);
    expect(r.frase).toMatch(/não fazemos/i);
  });

  it("⛔ a resposta NUNCA é indefinição — promessa com assinatura em branco", () => {
    for (const servico of ["Vídeo", "Reel", "Stories em vídeo", "TikTok"]) {
      const r = aCasaProduz(servico);
      expect(r.produz).toBe(false);
      expect(r.frase.toLowerCase()).not.toContain("a definir");
      expect(r.frase.toLowerCase()).not.toContain("sob consulta");
      expect(r.frase.toLowerCase()).not.toContain("a combinar");
    }
  });

  it("o que a casa produz responde que sim", () => {
    expect(aCasaProduz("plano_conteudo").produz).toBe(true);
    expect(aCasaProduz("Post avulso").produz).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// O CHÃO DE LUCRO — "margem mínima nesse início: dez por cento" (CEO, 27/08)
// ─────────────────────────────────────────────────────────────────────────────
describe("os 10% de lucro são chão, não meta", () => {
  it("o número é 10, cravado — não a constante contra ela mesma", () => {
    // A lição da prova de mutação do teto de capacidade: um teste que compara a
    // constante com ela mesma acompanha a mudança em vez de barrá-la.
    expect(MARGEM_MINIMA_PCT).toBe(10);
  });

  it("com custo NÃO MEDIDO, a resposta é `null` — nunca um 'sim' tímido", () => {
    for (const s of TABELA_DE_PRECOS) {
      expect(fechaMargemMinima(s)).toBeNull();
    }
    // E a lista de prejuízo vem vazia POR NÃO SABER, não por estar tudo bem.
    // Quem separa os dois é `coberturaDeCusto`, e o relatório tem de dizer qual.
    expect(servicosQueNaoFechamAMargem()).toEqual([]);
    expect(coberturaDeCusto().medidos).toBe(0);
  });

  it("o chão VENCE a faixa autorizada quando ela desceria demais", () => {
    // Custo R$ 500 medido → chão = R$ 550. Um desconto de 30% sobre R$ 790
    // daria R$ 553, que passa; 40% daria R$ 474, que o chão barra em R$ 550.
    const base = {
      ...servicoPorChave("plano_conteudo")!,
      custo: { estado: "medido", centavos: 50000, moeda: "BRL", origem: "manual" },
    } as never as Parameters<typeof pisoDoServico>[0];
    // ⚠️ ESTES NÚMEROS MUDARAM NA UNIFICAÇÃO DE 27/08/2026, e a mudança é a
    // doutrina: "dez por cento de lucro" passou a ser 10% DO PREÇO
    // (custo ÷ 0,90 = R$ 555,56) e não 10% em cima do custo (× 1,10 = R$ 550,00,
    // que entrega 9,09% e chamaria de dez). O porquê está em
    // `precoQueFechaAMargemMinima`. Agora o chão vence os DOIS descontos.
    expect(pisoDoServico({ ...base, descontoAutorizadoPct: 30 })).toBe(55556);
    expect(pisoDoServico({ ...base, descontoAutorizadoPct: 40 })).toBe(55556);
    // 55556 = ceil(50000 ÷ 0,90) — o chão, não o desconto.
  });

  it("serviço que não fecha 10% nem no preço de tabela aparece POR NOME", () => {
    const caro = {
      ...servicoPorChave("balcao_post")!,
      custo: { estado: "medido", centavos: 9000, moeda: "BRL", origem: "manual" },
    } as never as Parameters<typeof fechaMargemMinima>[0];
    // R$ 79 de preço contra R$ 90 de custo: prejuízo declarado.
    expect(fechaMargemMinima(caro)).toBe(false);
  });
});
