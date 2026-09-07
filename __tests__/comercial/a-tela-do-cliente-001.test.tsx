// O HTML QUE O CLIENTE 001 LÊ — medido, não deduzido.
//
// ── Por que este teste existe, e por que ele renderiza ──────────────────────
// Em 27/08/2026 o conserto dos três defeitos de escopo foi escrito, testado e
// provado por mutação em `tabela-de-precos.ts` — e **nenhuma tela chamava as
// funções**. A suíte ficou verde e o cliente continuou lendo "Posts: 28/mês" e
// "Vídeo: A definir".
//
// A pergunta obrigatória da casa é *"o teste alcança o código que responde ao
// cliente?"*. Provar a função isolada responde NÃO. Por isso aqui se renderiza
// `ScopeSection`, que é o quadro que o Foocci teve na frente, e se mede o texto
// que sai dele.
//
// ── E3 (30/08/2026): reconciliação, não relaxamento ─────────────────────────
// O conserto "recusa vira preço e prazo" (E2, `escopo-na-voz-da-casa.ts` e
// `tabela-de-precos.ts`) mudou o que a tela DEVE dizer e deixou cinco
// asserções deste arquivo vermelhas — elas ainda cobravam a doutrina que o
// CEO revogou: empurrar o pedido para o degrau mais próximo ("36/mês (você
// pediu 28)") e recusar acima da capacidade ("Não vendemos esse volume").
//
// As cinco foram REESCRITAS abaixo — cada uma com o "por quê" no corpo,
// citando a ordem do CEO de 30/08. Nenhuma foi apagada ou afrouxada: elas
// passaram a cobrar o comportamento novo com o MESMO rigor (renderização de
// verdade, números exatos, nunca texto livre). As guardas que continuam
// valendo — nunca "a definir", nunca "projeto pontual" para volume mensal,
// nunca promessa de vídeo — não foram tocadas.

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ScopeSection } from "@/components/agency/briefing/PublicBriefingRoom";
import type { BriefingScope } from "@/lib/agency/briefing-conversation";

/** O escopo REAL do cliente 001 em 27/08/2026. */
const foocci: BriefingScope = {
  businessName: "Foocci",
  segment: "B2B SaaS para restaurantes",
  objectives: [],
  serviceMode: "one_off",
  wantsSocialMedia: true,
  social: {
    platforms: ["Instagram"],
    postsPerWeek: 7,            // 28/mês
    storiesPerWeek: 0,
    reelsPerMonth: 0,
    needsVideoProduction: true, // ele PEDE vídeo
  },
};

function texto(scope: BriefingScope): string {
  // Sem as tags: é o que o olho lê, não o que o navegador recebe. Medir o HTML
  // cru reprovaria classe CSS que por acaso contenha a palavra procurada.
  return renderToStaticMarkup(<ScopeSection scope={scope} />)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#x27;|&quot;/g, " ")
    .replace(/\s+/g, " ");
}

describe("a tela do cliente 001 — os três defeitos, na saída", () => {
  it("estampa 28/mês — o que ele pediu, à carta, com preço (ORDEM DO CEO, 30/08/2026)", () => {
    // MUDOU: até 30/08 este teste proibia "28/mês" porque a tela não tinha
    // preço nem explicação do lado — 28 sozinho lia como promessa. O CEO
    // revogou o empurrão para o degrau ("não existe volume acima ou abaixo
    // [...] é um pacote personalizado"), e a correção não é apagar o número —
    // é precificá-lo: 28 peças à carta (28 × R$ 55) = R$ 1.540,00. O número
    // pedido aparece, e ao lado dele o preço, nunca "a definir".
    const t = texto(foocci);
    expect(t).toMatch(/Posts\s*28\/mês/);
    expect(t).toMatch(/R\$\s?1\.540,00/);
    expect(t).not.toMatch(/a definir|sob consulta/i);
  });

  it("oferece o plano mais barato (36) como PERGUNTA — nunca mais como resposta imposta", () => {
    // MUDOU: a versão anterior exigia o texto "você pediu 28" ao lado de
    // "36/mês" — a frase do ENCAIXE que o CEO proibiu em 30/08 ("Cliente que
    // pede uma composição que ninguém nunca pediu recebe PREÇO, não recebe
    // 'vou verificar'" — e muito menos recebe o pedido substituído). O plano
    // Conteúdo (36) continua aparecendo, porque é mais barato para o volume
    // pedido — mas como OFERTA que o cliente aceita ou não ("quer?"), nunca
    // como o número que "de fato" vale.
    const t = texto(foocci);
    expect(t).toMatch(/plano Conteúdo/i);
    expect(t).toMatch(/36 peças\/mês/);
    expect(t).toMatch(/quer\?/);
    expect(t).not.toMatch(/você pediu 28/i);
  });

  it("explica a oferta na própria tela, não só no código", () => {
    // MUDOU: a explicação de 27/08 era "isto é o degrau que cobre seu
    // pedido" ("recebe mais, não menos"). Com o encaixe revogado (CEO,
    // 30/08), a explicação virou "isto é uma alternativa mais barata, você
    // decide" — a EXIGÊNCIA de explicar na tela (não só no código) é a mesma;
    // só a doutrina explicada mudou.
    const t = texto(foocci);
    expect(t).toMatch(/sai mais barato/i);
    expect(t).toMatch(/te dá mais peças/i);
  });

  it("NÃO promete produção de vídeo a quem pediu vídeo", () => {
    const t = texto(foocci);
    expect(t).not.toMatch(/Produção pela Dioli/i);
    expect(t).toMatch(/Vídeo\s*Não fazemos/);
  });

  it("NÃO escreve 'A definir' em lugar nenhum do quadro", () => {
    const t = texto(foocci);
    expect(t).not.toMatch(/a definir/i);
  });

  it("não afirma 'projeto pontual' sobre um escopo com peças por mês", () => {
    const t = texto(foocci);
    expect(t).toMatch(/Modalidade\s*Gestão mensal/);
    expect(t).not.toMatch(/Projeto pontual/);
  });

  it("diz ao cliente o que foi corrigido e devolve a palavra a ele", () => {
    expect(texto(foocci)).toMatch(/é só dizer|refazemos/i);
  });
});

describe("as travas não valem só para o Foocci", () => {
  it("nenhum ramo de vídeo escreve indefinição ou promessa", () => {
    for (const social of [
      { platforms: ["Instagram"], postsPerWeek: 3, needsVideoProduction: true },
      { platforms: ["Instagram"], postsPerWeek: 3, needsVideoProduction: false },
      { platforms: ["Instagram"], postsPerWeek: 3, hasVideomaker: false },
      { platforms: ["Instagram"], postsPerWeek: 3, hasVideomaker: true },
    ]) {
      const t = texto({ ...foocci, social });
      expect(t).not.toMatch(/a definir|Produção pela Dioli/i);
    }
  });

  it("todo volume de 1 a 36 aparece na tela como o número PEDIDO — nunca substituído por um degrau", () => {
    // MUDOU o sentido inteiro do teste. Até 30/08 ele provava o OPOSTO do que
    // prova agora: que só 12, 20 ou 36 podiam sair da tela — ou seja, que todo
    // pedido fora desses três números era substituído. Essa era, letra por
    // letra, a doutrina que o CEO revogou em 30/08 ("não existe volume acima
    // ou abaixo"). A prova correta é a inversa: o número que o cliente pediu
    // é o que aparece, sempre — nunca trocado por um degrau vizinho.
    for (let n = 1; n <= 36; n++) {
      const t = texto({ ...foocci, social: { platforms: [], postsPerWeek: 0, reelsPerMonth: n } });
      expect(t).toContain(`${n}/mês`);
    }
  });

  it("volume acima da capacidade sai preço e prazo — nunca 'Não vendemos esse volume' (ORDEM DO CEO, 30/08/2026)", () => {
    // MUDOU: até 30/08 a tela recusava a venda acima de 36/mês e o número
    // sumia da tela. O CEO revogou a recusa: *"Cliente que pede uma
    // composição que ninguém nunca pediu recebe PREÇO, não recebe 'vou
    // verificar'"*. Acima do teto de PRODUÇÃO de hoje (36/mês), a tela agora
    // mostra o número pedido, o preço à carta e um prazo maior — nunca a
    // ausência do número, nunca uma recusa.
    const t = texto({ ...foocci, social: { platforms: [], postsPerWeek: 0, reelsPerMonth: 60 } });
    expect(t).toMatch(/60\/mês/);
    expect(t).toMatch(/R\$\s?3\.300,00/);
    expect(t).toMatch(/2 meses/);
    expect(t).not.toMatch(/Não vendemos esse volume/i);
    expect(t).not.toMatch(/a definir|sob consulta/i);
  });
});
