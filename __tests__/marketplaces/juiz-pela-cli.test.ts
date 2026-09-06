// ─── DEFEITO 2 da ficha 06/09/2026 ───────────────────────────────────────────
//
// docs/celula-prospeccao/despachos/2026-09-06-consertos-do-chamador.md
//
// Prova medida na rodada real de hoje: com `--redator=cli`, os 3 projetos
// coletados vieram todos "[parado]" — "Juiz editorial indisponível: (...)
// Nenhuma IA conectada. Conecte uma chave em Integrações." O redator já ia
// por `claude -p`; o juiz continuava preso a `generate()`, que exige chave.
// Meia-ponte é ponte que não atravessa: com `--redator=cli`, NADA era
// escrito, nunca.
//
// `construirPortaDoJuiz("cli", executorInjetado)` fecha isso reaproveitando o
// MESMO mecanismo de `spawn` que o redator já usava — o executor é INJETADO
// aqui, então nenhum destes testes dá `spawn` de verdade.
//
// A trava mais importante da ficha: "parse que falha é juiz INDISPONÍVEL,
// nunca juiz que aprovou." Os casos 3 e 4 provam exatamente isso.

import { describe, expect, it } from "vitest";
import { construirPortaDoJuiz } from "@/lib/marketplaces/99freelas/redator";
import { julgarTexto, type PortaDoJuiz } from "@/lib/agency/celula/mensagens/juiz-editorial";

type ResultadoDoExecutor = { ok: true; saida: string } | { ok: false; motivo: string };
type ExecutorFalso = (prompt: string, timeoutMs?: number) => Promise<ResultadoDoExecutor>;

function executorQueDevolve(saida: string): ExecutorFalso {
  return async () => ({ ok: true, saida });
}

function executorQueFalha(motivo: string): ExecutorFalso {
  return async () => ({ ok: false, motivo });
}

async function julgar(porta: PortaDoJuiz, texto = "Proposta direta e específica para o projeto pedido.") {
  return julgarTexto({ texto, porta, casoDaIndisponibilidade: null });
}

describe('o juiz editorial via "claude -p" (--redator=cli)', () => {
  it("1. CLI devolve JSON de reprovação ⇒ veredito reprova", async () => {
    const porta = construirPortaDoJuiz(
      "cli",
      executorQueDevolve(JSON.stringify({ aprovado: false, categorias: ["exageros"], explicacao: "promete demais." })),
    );

    const veredicto = await julgar(porta);

    expect(veredicto.ok).toBe(false);
    if (veredicto.ok) throw new Error("deveria ter reprovado");
    expect(veredicto.motivo).toBe("reprovado");
    if (veredicto.motivo === "reprovado") {
      expect(veredicto.categorias).toEqual(["exageros"]);
    }
  });

  it("2. CLI devolve JSON de aprovação ⇒ veredito aprova", async () => {
    const porta = construirPortaDoJuiz("cli", executorQueDevolve(JSON.stringify({ aprovado: true, categorias: [] })));

    const veredicto = await julgar(porta);

    expect(veredicto).toEqual({ ok: true });
  });

  it("2b. aprovação embrulhada em cerca de markdown (```json ... ```) ainda é lida — CLI de chat não é API JSON", async () => {
    const saida = ['Aqui está a avaliação:', "```json", JSON.stringify({ aprovado: true, categorias: [] }), "```"].join("\n");
    const porta = construirPortaDoJuiz("cli", executorQueDevolve(saida));

    const veredicto = await julgar(porta);

    expect(veredicto).toEqual({ ok: true });
  });

  it("3. CLI devolve lixo que NÃO é JSON ⇒ INDISPONÍVEL, nunca aprovado", async () => {
    const porta = construirPortaDoJuiz("cli", executorQueDevolve("Desculpe, não posso ajudar com essa avaliação."));

    const veredicto = await julgar(porta);

    expect(veredicto.ok).toBe(false);
    if (veredicto.ok) throw new Error("lixo NUNCA pode virar aprovação");
    expect(veredicto.motivo).toBe("indisponivel_sem_caso");
  });

  it("4. CLI estoura o timeout ⇒ INDISPONÍVEL, nunca aprovado", async () => {
    const porta = construirPortaDoJuiz("cli", executorQueFalha('"claude -p" excedeu o timeout de 90000ms.'));

    const veredicto = await julgar(porta);

    expect(veredicto.ok).toBe(false);
    if (veredicto.ok) throw new Error("timeout NUNCA pode virar aprovação");
    expect(veredicto.motivo).toBe("indisponivel_sem_caso");
    if (veredicto.motivo === "indisponivel_sem_caso") {
      expect(veredicto.causa).toContain("timeout");
    }
  });

  it("JSON com aprovado:true e categorias não-vazias é contraditório ⇒ INDISPONÍVEL, nunca aprovado", () =>
    julgar(
      construirPortaDoJuiz(
        "cli",
        executorQueDevolve(JSON.stringify({ aprovado: true, categorias: ["exageros"], explicacao: "" })),
      ),
    ).then((veredicto) => {
      expect(veredicto.ok).toBe(false);
      if (veredicto.ok) throw new Error("contraditório NUNCA pode virar aprovação");
      expect(veredicto.motivo).toBe("indisponivel_sem_caso");
    }));
});
