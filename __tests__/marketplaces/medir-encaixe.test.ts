// ─── MEDIÇÃO DO ENCAIXE — o resumo conta certo, sem gastar IA nem tocar rede ─
//
// Despacho: docs/celula-prospeccao/despachos/2026-09-06-medir-o-encaixe.md
//
// Esta ficha MEDE `encaixe.ts`; não conserta e não altera o critério (ver o
// cabeçalho de `lib/marketplaces/99freelas/medicao-de-encaixe.ts`). Os testes
// abaixo cobrem só a lógica PURA — nenhum HTML, nenhuma rede, nenhuma IA — que
// é exatamente o que a definição de pronto exige: o resumo conta certo numa
// amostra fabricada, e a metade oposta (amostra vazia) não divide por zero.

import { describe, it, expect } from "vitest";
import {
  categorizarMotivoDeEliminacao,
  medirProjeto,
  resumirMedicao,
  type ProjetoMedido,
} from "@/lib/marketplaces/99freelas/medicao-de-encaixe";
import type { ProjetoColetado } from "@/lib/marketplaces/99freelas/coleta";

// ── categorizarMotivoDeEliminacao ────────────────────────────────────────────

describe("categorizarMotivoDeEliminacao — lê o texto que eliminar() já produz", () => {
  it("null quando não houve eliminação", () => {
    expect(categorizarMotivoDeEliminacao(null)).toBeNull();
  });

  it("reconhece o motivo de PLATAFORMA", () => {
    expect(
      categorizarMotivoDeEliminacao("trabalho acadêmico — reprovado pela própria plataforma."),
    ).toBe("plataforma");
  });

  it("reconhece o motivo de FORA DO ESCOPO (encaixe.ts)", () => {
    expect(
      categorizarMotivoDeEliminacao(
        "fora do que a Dioli entrega hoje: nenhuma palavra deste projeto corresponde a um serviço.",
      ),
    ).toBe("fora_do_escopo");
  });

  it("reconhece o motivo de DESCRIÇÃO INCOMPLETA", () => {
    expect(
      categorizarMotivoDeEliminacao(
        "projeto indefinido ou incompleto — descrição curta demais para orçar sem inventar.",
      ),
    ).toBe("descricao_incompleta");
  });

  it("motivo desconhecido (contrato de eliminar() mudou) vira 'desconhecida', nunca um dos três — fail loud", () => {
    expect(categorizarMotivoDeEliminacao("um motivo qualquer que eliminar() nunca escreveu")).toBe(
      "desconhecida",
    );
  });
});

// ── resumirMedicao ────────────────────────────────────────────────────────────

function item(veredito: ProjetoMedido["veredito"], categoriaDeclarada: string | null): Pick<ProjetoMedido, "veredito" | "categoriaDeclarada"> {
  return { veredito, categoriaDeclarada };
}

describe("resumirMedicao — as contagens dizem se o critério está largo ou estreito", () => {
  it("1. conta certo uma amostra fabricada mista, e as três contagens somam o total", () => {
    const amostra = [
      item("encaixa", "Design Gráfico"),
      item("encaixa", "Design Gráfico"),
      item("nao_encaixa", "Decoração"),
      item("eliminado_por_plataforma", null),
      item("encaixa", "Marketing Digital"),
    ];

    const resumo = resumirMedicao(amostra);

    expect(resumo.total).toBe(5);
    expect(resumo.encaixaram).toBe(3);
    expect(resumo.naoEncaixaram).toBe(1);
    expect(resumo.eliminadosPorPlataforma).toBe(1);
    // A régua central da ficha: as três contagens somam o total, sempre.
    expect(resumo.encaixaram + resumo.naoEncaixaram + resumo.eliminadosPorPlataforma).toBe(
      resumo.total,
    );
    expect(resumo.percentualQueEncaixou).toBeCloseTo(60, 5); // 3 de 5

    expect(resumo.porCategoriaDeclarada).toEqual({
      "Design Gráfico": 2,
      "Decoração": 1,
      "sem categoria declarada": 1,
      "Marketing Digital": 1,
    });
  });

  it("2. amostra vazia ⇒ resumo com zeros, sem divisão por zero (nunca NaN)", () => {
    const resumo = resumirMedicao([]);

    expect(resumo).toEqual({
      total: 0,
      encaixaram: 0,
      naoEncaixaram: 0,
      eliminadosPorPlataforma: 0,
      percentualQueEncaixou: 0,
      porCategoriaDeclarada: {},
    });
    expect(Number.isNaN(resumo.percentualQueEncaixou)).toBe(false);
  });
});

// ── medirProjeto — a ponte com o formato real de ProjetoColetado ────────────

function projetoColetado(sobrescritas: Partial<ProjetoColetado>): ProjetoColetado {
  return {
    url: "https://www.99freelas.com.br/project/exemplo-123",
    titulo: "Um projeto qualquer",
    descricao:
      "Uma descrição longa o bastante para não ser eliminada por falta de substância, com mais de cento e vinte caracteres de verdade, sem inventar nada.",
    categoria: null,
    subcategoria: null,
    orcamento: null,
    orcamentoInformado: null,
    nivel: null,
    numeroDePropostas: null,
    publicadoEm: null,
    valorMinimo: null,
    ...sobrescritas,
  };
}

describe("medirProjeto — os três baldes do veredito, na mesma ordem que eliminar() aplica", () => {
  it("trabalho acadêmico é 'eliminado_por_plataforma', mesmo que o texto também mencione um serviço da casa", () => {
    const p = projetoColetado({
      titulo: "TCC sobre redes sociais",
      descricao:
        "Preciso de ajuda com a minha monografia de TCC sobre o uso de redes sociais em pequenas empresas, com direito a apresentação e defesa perante a banca da faculdade.",
      categoria: "Marketing Digital",
    });

    const medido = medirProjeto(p);

    expect(medido.veredito).toBe("eliminado_por_plataforma");
    expect(medido.motivoDeEliminacao ?? "").toMatch(/reprovado pela própria plataforma/);
    expect(medido.servicosPossiveis).toEqual([]);
  });

  it("um pedido claramente fora do que a Dioli entrega hoje (decoração de quarto) é 'nao_encaixa'", () => {
    const p = projetoColetado({
      titulo: "Melhoria visual do meu quarto",
      descricao:
        "Quero redecorar o meu quarto e deixar mais aconchegante, com um estilo boho. Preciso de ideias de organização dos móveis, escolha de cortina, tapete e cabeceira, além de sugestões de iluminação e cores para as paredes do ambiente.",
      categoria: "Decoração",
    });

    const medido = medirProjeto(p);

    expect(medido.veredito).toBe("nao_encaixa");
    expect(medido.motivoDeEliminacao ?? "").toMatch(/fora do que a Dioli entrega hoje/);
    expect(medido.encaixariaIndependenteDaPlataforma).toBe(false);
  });

  it("texto vazio/curto demais é 'nao_encaixa' (fail-closed nº 1 do encaixe.ts)", () => {
    const p = projetoColetado({ titulo: "Oi", descricao: "" });

    const medido = medirProjeto(p);

    expect(medido.veredito).toBe("nao_encaixa");
  });

  it("bate no vocabulário mas a descrição é curta demais para orçar: 'encaixa' (o encaixe já disse sim; a eliminação é por outro motivo)", () => {
    const p = projetoColetado({
      titulo: "Preciso de peças para redes sociais",
      descricao: "Quero peças para minhas redes sociais.",
      categoria: "Design Gráfico",
    });

    const medido = medirProjeto(p);

    expect(medido.veredito).toBe("encaixa");
    expect(medido.motivoDeEliminacao ?? "").toMatch(/descrição curta demais/);
    expect(medido.servicosPossiveis.length).toBeGreaterThan(0);
  });
});
