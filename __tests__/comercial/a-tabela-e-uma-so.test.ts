// A TABELA É UMA SÓ — e o portão é código, não alarme.
//
// ═══ ESTE ARQUIVO SUCEDE `duas-tabelas-vivas.test.ts` ════════════════════════
//
// Aquele prendia a DIVERGÊNCIA medida em produção e dizia, no próprio corpo,
// quando sairia: *"no dia em que houver UMA tabela"*. É hoje.
//
// ── A medição que ele guardava (cliente oculto, 26/08/2026) ────────────────
//
// Pedido cmt9exi95001f0xo74bhonn77, em produção:
//   • proposta emitida por `SOCIAL_PACKAGES`: "Plano Essencial — R$ 590/mês"
//     (a tabela inteira: 590 · 990 · 1790);
//   • `/planos`, no mesmo minuto: Pulso 49 · Ritmo 297 · Presença 790 ·
//     Conteúdo 1.390 · Crescimento 2.590.
//
// O cliente foi cotado num plano cujo NOME e cujo PREÇO não existiam na página
// que ele acabara de ler. "Crescimento" existia nos dois lados com preços 2,6×
// diferentes.
//
// ── O que mudou, e por que a FORMA importa mais que o número ───────────────
//
// A tabela foi fechada pelo Diretor Geral em 26/08/2026, por delegação do CEO.
// Mas trocar os números de um lado pelos do outro teria durado até o próximo
// conserto apressado: dois lugares que CONCORDAM ainda são dois lugares.
//
// `SOCIAL_PACKAGES`, `SOCIAL_MARGINS` e o `cheio` de `TABELA_DE_PISO` passaram
// a ser DERIVADOS de `PLANOS`. Não é "os arquivos concordam": é não haver dois
// números para concordar. Este arquivo prova a derivação e guarda os freios.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { SOCIAL_PACKAGES, detectPackage, getPackageDef, computeEstimate } from "@/lib/agency/live-calculator";
import { PLANOS, PRECO_DA_PECA_AVULSA, CAPACIDADE_MENSAL, precoEmReais } from "@/lib/agency/planos";
import { TABELA_DE_PISO, FAIXAS } from "@/lib/agency/comercial/negociacao";
import { SOCIAL_MARGINS } from "@/lib/agency/pricing-margins";
import { somaDosItens, temPreco } from "@/lib/agency/comercial/preco-do-item";

/** Os preços que a esteira pode COTAR e que não existem na página pública.
 *  É a pergunta exata que a ordem do CEO mandou transformar em trava. */
function precosQueNaoExistemNaVitrine(): string[] {
  const daVitrine = new Set(PLANOS.map((p) => p.preco));
  return SOCIAL_PACKAGES
    .filter((p) => !daVitrine.has(p.minPrice) || !daVitrine.has(p.maxPrice))
    .map((p) => `${p.label} R$ ${p.minPrice}`);
}

// ─────────────────────────────────────────────────────────────────────────────
describe("uma fonte só — e a prova é a derivação, não a coincidência", () => {
  it("NENHUM preço que a esteira cota está fora da vitrine", () => {
    // MUTAÇÃO QUE PROVA: troque `minPrice: plano.preco` por um literal em
    // `live-calculator.ts` (era exatamente assim: 590/990/1790) e esta linha
    // cai, nomeando o preço. É o defeito medido, virado régua.
    expect(precosQueNaoExistemNaVitrine()).toEqual([]);
  });

  it("cada degrau da esteira É um plano da vitrine — mesmo id, mesmo nome, mesmo preço", () => {
    for (const pkg of SOCIAL_PACKAGES) {
      const plano = PLANOS.find((p) => p.id === pkg.id);
      expect(plano, `o degrau "${pkg.id}" não existe na vitrine`).toBeDefined();
      expect(pkg.label).toBe(`Plano ${plano!.nome}`);
      expect(pkg.minPrice).toBe(plano!.preco);
      expect(pkg.maxPrice).toBe(plano!.preco);
      expect(pkg.postsPerMonth).toBe(plano!.pecasPorMes);
    }
    // E a esteira não inventa degrau: só o Pulso (que não entrega peça) fica
    // de fora, e por definição.
    expect(SOCIAL_PACKAGES.length).toBe(PLANOS.filter((p) => p.pecasPorMes > 0).length);
  });

  it("a MARGEM é medida contra o preço que a casa cobra", () => {
    for (const [id, m] of Object.entries(SOCIAL_MARGINS)) {
      expect(m.targetPrice, id).toBe(PLANOS.find((p) => p.id === id)!.preco);
    }
  });

  it("o `cheio` da negociação é o preço da vitrine — não uma quarta cópia", () => {
    for (const plano of PLANOS.filter((p) => p.pecasPorMes > 0)) {
      const linha = TABELA_DE_PISO[plano.id as keyof typeof TABELA_DE_PISO];
      expect(linha, `${plano.id} sumiu da tabela de piso`).toBeDefined();
      expect(linha.cheio).toBe(plano.preco);
      // ⚠️ ESTE TESTE EXIGIA `piso < cheio` ATÉ 27/08/2026 — ou seja, EXIGIA a
      // existência de um desconto. E o desconto existia mesmo: um `preco * 0.78`
      // escondido numa multiplicação, 22% que ninguém autorizou.
      //
      // Ordem do CEO em 27/08: *"desconto que a casa não autorizou não existe;
      // sem faixa configurada, desconto nenhum"*. E a razão é mais dura que a
      // ordem: o piso precisa de margem positiva PROVADA, e o custo desta casa
      // está medido pela metade (só IA). Não se prova que 78% do preço cobre um
      // custo que ninguém conhece.
      //
      // O piso agora vem de `tabela-de-precos.ts`. Enquanto não houver faixa
      // autorizada, ele É o cheio.
      expect(linha.piso).toBe(plano.preco);
    }
    // E o degrau que saiu da tabela saiu da negociação junto: não se negocia o
    // que não se vende.
    expect(Object.keys(TABELA_DE_PISO)).not.toContain("crescimento");
  });

  it("os cortes de volume são os volumes da tabela, não números digitados", () => {
    for (const plano of PLANOS.filter((p) => p.pecasPorMes > 0)) {
      // O volume exato do degrau cai NELE.
      expect(detectPackage(plano.pecasPorMes)).toBe(plano.id);
      // Uma peça a mais sobe um degrau — a não ser no maior, que é o teto.
      const acima = detectPackage(plano.pecasPorMes + 1);
      if (plano.pecasPorMes < CAPACIDADE_MENSAL) expect(acima).not.toBe(plano.id);
    }
    // MUTAÇÃO QUE PROVA: volte os `if (postsPerMonth <= 12)` digitados e mude
    // um volume em `planos.ts` — os cortes ficam no número velho e esta linha
    // cai. Era a segunda cópia dos volumes, escondida dentro de um `if`.
    expect(getPackageDef(detectPackage(1000)).postsPerMonth).toBe(CAPACIDADE_MENSAL);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("os freios da ordem — nenhum é opcional", () => {
  it("NENHUM plano promete acima da capacidade provada (36 = 3 levas × 12)", () => {
    for (const p of PLANOS) {
      expect(p.pecasPorMes, `${p.nome} promete ${p.pecasPorMes}`).toBeLessThanOrEqual(CAPACIDADE_MENSAL);
    }
    // E o teto da tabela ENCOSTA na capacidade: uma tabela cujo maior degrau
    // fica muito abaixo do que a casa produz está deixando dinheiro na mesa —
    // o oposto do defeito, e também um defeito.
    expect(Math.max(...PLANOS.map((p) => p.pecasPorMes))).toBe(CAPACIDADE_MENSAL);
  });

  it("vídeo e reel continuam FORA de todo plano — não há produtor", () => {
    for (const p of PLANOS) {
      for (const linha of p.inclui) {
        expect(/\b(reel|reels|v[íi]deo)\b/i.test(linha), `${p.nome}: "${linha}"`).toBe(false);
      }
    }
    for (const pkg of SOCIAL_PACKAGES) expect(pkg.reelsPerMonth).toBe(0);
  });

  it("a tabela INTEIRA fica abaixo do piso do mercado (R$ 800/mês)", () => {
    // O número do mercado, pesquisado em ago/2026 e registrado em
    // `docs/precos.md`: gestão básica de redes sociais para pequeno negócio
    // local custa de R$ 800 a R$ 1.500/mês. A régua do CEO foi "abaixo, por
    // decisão" — então é o TETO da tabela que tem de caber, não a média.
    const PISO_DO_MERCADO = 800;
    expect(Math.max(...PLANOS.map((p) => p.preco))).toBeLessThan(PISO_DO_MERCADO);
    // Peça avulsa: mercado R$ 120–190.
    expect(PRECO_DA_PECA_AVULSA).toBeLessThan(120);
  });

  it("a conta fecha: o custo de IA de um mês cheio é fração pequena da receita", () => {
    // US$ 0,167 por peça (`PRECOS_DE_IMAGEM`, gpt-image-1 alta) a R$ 5,60/US$.
    const CUSTO_POR_PECA = 0.167 * 5.6;
    for (const p of PLANOS.filter((x) => x.pecasPorMes > 0)) {
      const custo = p.pecasPorMes * CUSTO_POR_PECA;
      expect(custo / p.preco, `${p.nome}`).toBeLessThan(0.1);
    }
    // ⚠️ Hora de gente NÃO entra nesta conta, e não é esquecimento: esta casa
    // não a mede. Dívida declarada — ver `docs/precos.md`.
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("o que a vitrine não precifica, a esteira não cota", () => {
  const ESCOPO = {
    wantsSocialMedia: true,
    social: { platforms: ["Instagram"], postsPerWeek: 3 },
    wantsPaidTraffic: true,
    traffic: { monthlyAdBudget: "R$ 1.000", platforms: ["Instagram"] },
    branding: { requested: true, wantsRebrand: false },
  } as never;

  it("tráfego e identidade entram COM escopo e SEM preço — nunca como R$ 0", () => {
    const e = computeEstimate(ESCOPO);
    const trafego = e.items.find((i) => i.label.startsWith("Tráfego"))!;
    const marca = e.items.find((i) => i.label === "Identidade Visual")!;

    // MUTAÇÃO QUE PROVA: devolva `minPrice: 500` no bloco de tráfego (era
    // `P.trafficMgmt.min`) e as duas linhas abaixo caem. R$ 500–1.200 não
    // existe em `/planos` — cotá-lo era prometer preço que a vitrine não tem.
    expect(temPreco(trafego)).toBe(false);
    expect(temPreco(marca)).toBe(false);
    // O pedido do cliente NÃO some: ele continua na proposta, dito.
    expect(trafego.detail).toContain("orçado à parte");
    expect(marca.detail).toContain("orçado à parte");
  });

  it("e o TOTAL não os soma — nem como zero, que diria que são de graça", () => {
    const e = computeEstimate(ESCOPO);
    const soPlano = e.items.filter(temPreco);
    expect(soPlano).toHaveLength(1);
    expect(e.totalMin).toBe(somaDosItens(e.items).min);
    expect(e.totalMin).toBe(soPlano[0]!.minPrice);
    // E existem itens sem preço — o total precisa poder dizer isso.
    expect(somaDosItens(e.items).semPreco).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("as tabelas concorrentes morreram — não coexistem", () => {
  it("nenhum CAMPO DE PREÇO é preenchido com número literal fora de `planos.ts`", () => {
    // A régua olha a ATRIBUIÇÃO, não o número solto: `piso: 49` de um item de
    // balcão é legítimo e colide com o preço do Pulso. O que não pode voltar é
    // um campo de preço de PLANO recebendo um literal — que é a forma exata que
    // as tabelas concorrentes tinham (`minPrice: 590`, `targetPrice: 990`,
    // `cheio: 297`).
    const CAMPO_COM_LITERAL = /\b(minPrice|maxPrice|targetPrice|cheio)\s*:\s*\d+/g;
    for (const arquivo of [
      "lib/agency/live-calculator.ts",
      "lib/agency/pricing-margins.ts",
      "lib/agency/comercial/negociacao.ts",
    ]) {
      const codigo = readFileSync(arquivo, "utf8")
        // Comentário é a história desta casa e cita preço velho de propósito.
        .split("\n").filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*")).join("\n");
      const achados = [...codigo.matchAll(CAMPO_COM_LITERAL)].map((m) => m[0]);
      // MUTAÇÃO QUE PROVA: escreva `minPrice: 590` de volta em
      // `live-calculator.ts` e esta linha cai, citando a atribuição.
      expect(achados, `${arquivo} digita preço em campo de plano`).toEqual([]);
    }
  });

  it("a fonte única se apresenta como tal, e o `precoEmReais` é o formatador de todos", () => {
    expect(precoEmReais(290)).toContain("290");
    expect(readFileSync("lib/agency/live-calculator.ts", "utf8")).toContain('from "./planos"');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("a página não mente sobre a própria página", () => {
  it("nenhum número da vitrine é escrito à mão em `/planos`", () => {
    // MEDIDO NO AR em 26/08/2026, minutos depois do deploy da tabela nova: a
    // página servia Pulso 49 · Ritmo 290 · Presença 490 · Conteúdo 790 e o
    // subtítulo dizia **"Cinco degraus"**, com a meta-descrição prometendo
    // "ao R$ 2.590 que cresce" — um plano que tinha acabado de sair.
    //
    // Não foi a tabela que falhou: foi o TEXTO em volta dela, que ninguém
    // deriva. É a mesma classe de defeito dos preços, um andar acima.
    const pagina = readFileSync("app/planos/page.tsx", "utf8")
      .split("\n").filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*")).join("\n");
    for (const p of PLANOS) {
      expect(
        new RegExp(`(?<![\\d.])${p.preco}(?![\\d.])`).test(pagina),
        `a página digita o preço ${p.preco} — ele tem de vir de PLANOS`,
      ).toBe(false);
    }
    // E a CONTAGEM de degraus também não: "Cinco degraus" era literal.
    expect(/\b(tr[êe]s|quatro|cinco|seis)\s+degraus/i.test(pagina), "a contagem de degraus está escrita à mão").toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// A BOCA DO SDR — 27/08/2026
//
// As FAIXAS de `negociacao.ts` são o texto que o SDR usa para OFERECER. Elas
// eram strings digitadas à mão e tinham apodrecido em produção: ofereciam o
// Ritmo por R$ 297 com 8 peças, o Presença por R$ 790 (que é o preço do
// Conteúdo), o Conteúdo por R$ 1.390 e o **Crescimento por R$ 2.590 — um plano
// que já não existe**. Quatro preços errados na boca de quem fecha negócio.
// ─────────────────────────────────────────────────────────────────────────────
describe("o que o SDR OFERECE sai da tabela, não de texto digitado", () => {
  it("nenhuma faixa carrega preço de plano digitado à mão", () => {
    const precosVivos = PLANOS.map((p) => String(p.preco));
    for (const f of FAIXAS) {
      const texto = `${f.principal} ${f.alternativa}`;
      // Todo "R$ N/mês" que aparecer numa oferta tem de ser um preço VIVO.
      for (const m of texto.matchAll(/R\$\s?([\d.]+)\s*\/\s*mês/g)) {
        const numero = m[1]!.replace(/\./g, "");
        expect(precosVivos, `oferta com preço morto: ${m[0]}`).toContain(numero);
      }
    }
  });

  it("o plano descontinuado não é oferecido em lugar nenhum", () => {
    const tudo = FAIXAS.map((f) => `${f.principal} ${f.alternativa}`).join(" ");
    expect(tudo).not.toMatch(/2\.590/);
    expect(tudo).not.toMatch(/1\.390/);
    expect(tudo).not.toMatch(/\b297\b/);
  });

  it("os três planos vivos aparecem com o preço e o volume da tabela", () => {
    const tudo = FAIXAS.map((f) => `${f.principal} ${f.alternativa}`).join(" ");
    for (const id of ["ritmo", "presenca", "conteudo"] as const) {
      const p = PLANOS.find((x) => x.id === id)!;
      expect(tudo, `${p.nome} não é oferecido`).toContain(p.nome);
    }
    // E o preço que aparece junto do nome é o preço vivo.
    const presenca = PLANOS.find((p) => p.id === "presenca")!;
    // `precoEmReais` usa o espaço INQUEBRÁVEL que o pt-BR insere depois do
    // "R$". Comparar com espaço comum reprova um texto correto — a mesma
    // armadilha já documentada em orcamento-do-briefing.test.ts.
    expect(tudo).toContain(`Plano ${presenca.nome} (${precoEmReais(presenca.preco)}/mês, ${presenca.pecasPorMes} peças)`);
  });
});
