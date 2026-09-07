// A TELA QUE O CLIENTE 001 LEU — medida contra o que ela deveria ter dito.
//
// Os números aqui são os do escopo REAL do Foocci em 27/08/2026: 7 posts/semana
// (28/mês), vídeo pedido, modalidade "projeto pontual", ciclo de 30 dias.
// Número inventado provaria a régua contra si mesma.

import { describe, it, expect } from "vitest";
import {
  linhaDeVolume,
  linhaDeVideo,
  linhaDeModalidade,
  temVolumeRecorrente,
} from "@/lib/agency/comercial/escopo-na-voz-da-casa";
import type { BriefingScope, SocialScope } from "@/lib/agency/briefing-conversation";

const socialDoFoocci: SocialScope = {
  platforms: ["Instagram"],
  postsPerWeek: 7,          // → 28/mês, que NÃO existe na tabela
  storiesPerWeek: 0,
  reelsPerMonth: 0,
  needsVideoProduction: true,
};

const escopoDoFoocci: BriefingScope = {
  businessName: "Foocci",
  objectives: [],
  serviceMode: "one_off",   // "projeto pontual" — com 28 peças/MÊS
  wantsSocialMedia: true,
  social: socialDoFoocci,
};

// ═══════════════════════════════════════════════════════════════════════════
// E2 (30/08/2026): a casa parou de EMPURRAR para degrau e de RECUSAR volume.
// Este describe SUBSTITUI o anterior — que travava as duas coisas que o CEO
// proibiu ("encaixa no degrau que cobre" e "acima da capacidade: não
// vendemos"). Rodar esta suíte contra o código de antes do E2 é o que prova a
// mutação: as asserções abaixo ficam VERMELHAS contra o comportamento antigo.
// ═══════════════════════════════════════════════════════════════════════════
describe("28/mês: a casa mostra o número PEDIDO, precificado como pedido", () => {
  it("mostra o número pedido — 28, não mais o degrau que o substituía (36)", () => {
    const l = linhaDeVolume("Posts", 28);
    expect(l.value).toBe("28/mês");
    expect(l.value).not.toContain("36/mês");
  });

  it("a oferta do plano mais barato vem no detalhe, nunca no valor principal", () => {
    const l = linhaDeVolume("Posts", 28);
    expect(l.alerta).toBe(true);
    expect(l.dim).toBeFalsy();
    expect(l.detalhe ?? "").toMatch(/Conteúdo|quer\?/i);
  });

  it("volume que bate no tamanho de um plano ainda ganha a oferta — a diferença de preço é real e não se esconde", () => {
    // 36 à carta (R$ 1.980) é mais caro que o próprio plano Conteúdo (R$ 790)
    // que entrega exatamente 36 — a casa avisa, não finge que os dois empatam.
    const l = linhaDeVolume("Posts", 36);
    expect(l.value).toBe("36/mês");
    expect(l.alerta).toBe(true);
    expect(l.detalhe ?? "").toMatch(/Conteúdo/);
  });

  it("acima da capacidade da casa a resposta é preço e prazo — nunca 'não vendemos'", () => {
    const l = linhaDeVolume("Posts", 60);
    expect(l.value).not.toMatch(/não vendemos/i);
    expect(l.value).toMatch(/60\/mês/);
    expect(l.alerta).toBe(true);
    expect(l.detalhe ?? "").toMatch(/CEO|capacidade/i);
  });

  it("zero é ausência, não problema", () => {
    const l = linhaDeVolume("Stories", 0);
    expect(l.value).toBe("Não incluído");
    expect(l.dim).toBe(true);
  });
});

describe("vídeo não tem produtor — a casa diz NÃO FAZEMOS nos dois ramos", () => {
  it("o ramo em que o cliente PEDE vídeo não promete produção", () => {
    const l = linhaDeVideo({ platforms: [], needsVideoProduction: true })!;
    expect(l.value).toBe("Não fazemos");
    expect(l.value).not.toMatch(/produção pela dioli/i);
  });

  it("o ramo sem videomaker e sem pedido também não diz 'a definir'", () => {
    const l = linhaDeVideo({ platforms: [], hasVideomaker: false })!;
    expect(l.value).toBe("Não fazemos");
  });

  it("NENHUM ramo devolve texto de indefinição", () => {
    const ramos: SocialScope[] = [
      { platforms: [], needsVideoProduction: true },
      { platforms: [], needsVideoProduction: false },
      { platforms: [], hasVideomaker: false },
      { platforms: [], hasVideomaker: true },
      { platforms: [], hasVideomaker: false, needsVideoProduction: false },
    ];
    for (const r of ramos) {
      const l = linhaDeVideo(r);
      expect(l).not.toBeNull();
      expect(l!.value).not.toMatch(/a definir|a combinar|sob consulta|em breve/i);
    }
  });

  it("videomaker do cliente é dele, e a tela diz de quem é", () => {
    const l = linhaDeVideo({ platforms: [], hasVideomaker: true })!;
    expect(l.value).toMatch(/próprio/i);
    expect(l.alerta).toBeFalsy();
  });

  it("briefing que não tocou no assunto não inventa a linha", () => {
    expect(linhaDeVideo({ platforms: [] })).toBeNull();
    expect(linhaDeVideo(undefined)).toBeNull();
  });
});

describe("pontual e recorrente cobram diferente — a casa não afirma os dois", () => {
  it("'projeto pontual' com peças/mês vira gestão mensal, declarada", () => {
    const l = linhaDeModalidade(escopoDoFoocci);
    expect(l.value).toBe("Gestão mensal");
    expect(l.value).not.toMatch(/pontual/i);
    expect(l.alerta).toBe(true);
  });

  it("a correção diz o que foi corrigido e por quê — e devolve a palavra ao cliente", () => {
    const d = linhaDeModalidade(escopoDoFoocci).detalhe ?? "";
    expect(d).toMatch(/pontual/i);
    expect(d).toMatch(/m[êe]s/i);
    expect(d).toMatch(/cobram diferente|refazemos|é só dizer/i);
  });

  it("pontual DE VERDADE (sem volume recorrente) continua pontual", () => {
    const l = linhaDeModalidade({
      ...escopoDoFoocci,
      social: { platforms: [], postsPerWeek: 0, storiesPerWeek: 0, reelsPerMonth: 0 },
    });
    expect(l.value).toBe("Projeto pontual");
    expect(l.alerta).toBeFalsy();
  });

  it("modalidade não declarada NUNCA vira 'A definir'", () => {
    for (const social of [socialDoFoocci, undefined]) {
      const l = linhaDeModalidade({ ...escopoDoFoocci, serviceMode: undefined, social });
      expect(l.value).not.toMatch(/a definir/i);
    }
  });

  it("'unsure' também não vira 'A definir' — o volume responde", () => {
    const l = linhaDeModalidade({ ...escopoDoFoocci, serviceMode: "unsure" });
    expect(l.value).toBe("Gestão mensal");
  });

  it("guarda-chuva é preservado", () => {
    const l = linhaDeModalidade({ ...escopoDoFoocci, serviceMode: "umbrella" });
    expect(l.value).toMatch(/guarda-chuva/i);
  });
});

describe("a leitura de recorrência", () => {
  it("qualquer uma das três quantidades já torna o escopo recorrente", () => {
    expect(temVolumeRecorrente({ platforms: [], postsPerWeek: 7 })).toBe(true);
    expect(temVolumeRecorrente({ platforms: [], storiesPerWeek: 3 })).toBe(true);
    expect(temVolumeRecorrente({ platforms: [], reelsPerMonth: 2 })).toBe(true);
  });
  it("tudo em zero, ou ausente, não é recorrente", () => {
    expect(temVolumeRecorrente({ platforms: [], postsPerWeek: 0, storiesPerWeek: 0, reelsPerMonth: 0 })).toBe(false);
    expect(temVolumeRecorrente(undefined)).toBe(false);
  });
});
