/**
 * ─── O PORTÃO DO ERRO DE HIDRATAÇÃO EM /agency/integrations ────────────────
 *
 * 29/08/2026. O `TestBadge` de `/agency/integrations` produzia marcação
 * diferente no servidor e no cliente, por DUAS causas somadas:
 *
 *   Causa 1 — `buildDefaultIntegrationConfigs()` chamava `new Date()` no
 *   instante do render. Servidor e navegador avaliam a função em instantes
 *   diferentes → dois `lastTestAt` diferentes. É também um dado inventado:
 *   configuração pré-instalada nunca rodou teste nenhum, não existe "quando
 *   o teste rodou".
 *
 *   Causa 2 — `new Date(at).toLocaleDateString("pt-BR")` sem `timeZone` usa
 *   o fuso do AMBIENTE. O servidor roda em UTC; o navegador do CEO roda em
 *   `America/Sao_Paulo`. O MESMO instante vira dois dias diferentes perto da
 *   virada.
 *
 * As duas metades abaixo provam cada causa isoladamente — corrigir só uma
 * deixa o outro caminho de divergência aberto.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildDefaultIntegrationConfigs } from "@/lib/agency/integrations";
import { TestBadge } from "@/app/agency/integrations/page";

describe("buildDefaultIntegrationConfigs · a função é pura (Causa 1)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("chamada duas vezes, com o relógio movido entre as chamadas, devolve resultados profundamente iguais", () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date("2026-08-28T23:30:00.000Z"));
    const primeira = buildDefaultIntegrationConfigs();

    vi.setSystemTime(new Date("2026-08-29T02:00:00.000Z"));
    const segunda = buildDefaultIntegrationConfigs();

    expect(segunda).toEqual(primeira);
  });

  it("nenhuma configuração pré-instalada inventa um `lastTestAt` — ausência de informação não é informação", () => {
    const configs = buildDefaultIntegrationConfigs();
    for (const c of configs) {
      expect(c.lastTestAt).toBeUndefined();
    }
  });
});

describe("TestBadge · a formatação tem fuso explícito, em um lugar só (Causa 2)", () => {
  const TZ_ORIGINAL = process.env.TZ;

  beforeEach(() => {
    process.env.TZ = TZ_ORIGINAL;
  });

  afterEach(() => {
    process.env.TZ = TZ_ORIGINAL;
  });

  function renderizar(at: string): string {
    return renderToStaticMarkup(
      createElement(TestBadge, { status: "pass", at }),
    );
  }

  it("produz a MESMA marcação em UTC e em America/Sao_Paulo, no instante de fronteira em que o defeito aparecia", () => {
    // 2026-08-29T02:00:00.000Z é 28/08 às 23h em São Paulo e 29/08 em UTC —
    // exatamente o instante em que `toLocaleDateString` sem `timeZone`
    // divergia.
    const instanteDeFronteira = "2026-08-29T02:00:00.000Z";

    process.env.TZ = "UTC";
    const htmlUtc = renderizar(instanteDeFronteira);

    process.env.TZ = "America/Sao_Paulo";
    const htmlSaoPaulo = renderizar(instanteDeFronteira);

    expect(htmlSaoPaulo).toBe(htmlUtc);
    // E o valor não é arbitrário: fuso da casa é São Paulo, então o instante
    // de fronteira deve mostrar 28/08 (o dia em São Paulo), não 29/08.
    expect(htmlUtc).toContain("28/08/2026");
  });

  it("sem data (`at` ausente), o badge não inventa nada — nem 'Invalid Date'", () => {
    const html = renderToStaticMarkup(
      createElement(TestBadge, { status: "pass", at: undefined }),
    );
    expect(html).not.toContain("Invalid Date");
    expect(html).toContain("Teste OK");
  });
});
