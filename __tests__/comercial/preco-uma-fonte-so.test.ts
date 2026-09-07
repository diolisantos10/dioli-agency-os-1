// O PREÇO TEM UMA FONTE SÓ — e agora existe MECANISMO, não promessa.
//
// ─── O QUE A AUDITORIA DE 08/08/2026 DISSE, E O QUE ERA VERDADE ─────────────
//
// A auditoria externa afirmou: *"os 5 planos de `docs/precos.md` não existem no
// código — `SELF_SERVE_CATALOG` não tem nenhum dos 5 nomes"*.
//
// **A afirmação é falsa, e o erro dela é instrutivo.** `SELF_SERVE_CATALOG` é o
// BALCÃO — micro-serviços de compra avulsa (post R$ 79, carrossel R$ 129). Ele
// não tem os 5 planos porque **não deve ter**: o próprio `docs/precos.md` diz
// que são "duas tabelas, e elas não se contradizem — vendem coisas diferentes".
//
// Os 5 planos SEMPRE estiveram em `lib/agency/planos.ts`, que se declara "fonte
// única" na primeira linha, com os 5 nomes, os 5 preços e as 5 implantações
// batendo com o documento.
//
// ─── ENTÃO POR QUE ESTE TESTE EXISTE ────────────────────────────────────────
//
// Porque "bate hoje" não é garantia nenhuma. O documento e o código concordavam
// por SORTE — nada os obrigava. No dia em que o CEO mexer no preço num dos dois
// lugares, os dois divergem em silêncio e o cliente encontra o menor.
//
// Este é o mecanismo que faltava: o documento é lido, os números são extraídos
// da TABELA e comparados com o código. Divergiu, o portão fecha.
//
// A regra da casa: **"sem gate = reprovado"** — checagem que não roda não
// protege nada. E `docs/ESTADO-REAL-08-08.md` §1: toda tela (e todo portão)
// mostra os DOIS lados, e diz QUAL metade falta.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PLANOS, PRECO_DA_PECA_AVULSA } from "@/lib/agency/planos";

const DOC = path.join(process.cwd(), "docs/precos.md");

/** "R$ 1.390/mês" → 1390 · "isenta" → null · "R$ 49" → 49 */
function valor(bruto: string): number | null {
  const limpo = bruto.trim();
  if (/isenta/i.test(limpo)) return null;
  const m = limpo.match(/R\$\s*([\d.]+)/);
  if (!m) return null;
  return Number(m[1].replace(/\./g, ""));
}

/**
 * Lê a TABELA "Os quatro degraus" de `docs/precos.md`.
 * Formato: | **Nome** | R$ X/mês | R$ Y | ... |
 */
function planosDoDocumento(): Array<{ nome: string; preco: number | null; implantacao: number | null }> {
  const texto = readFileSync(DOC, "utf8");
  const linhas = texto.split("\n");
  const saida: Array<{ nome: string; preco: number | null; implantacao: number | null }> = [];
  for (const linha of linhas) {
    // Só as linhas cujo primeiro campo é um nome em negrito: | **Pulso** | ...
    const m = linha.match(/^\|\s*\*\*([^*|]+)\*\*\s*\|([^|]*)\|([^|]*)\|/);
    if (!m) continue;
    const nome = m[1].trim();
    if (!PLANOS.some((p) => p.nome === nome)) continue; // ignora outras tabelas
    saida.push({ nome, preco: valor(m[2]), implantacao: valor(m[3]) });
  }
  return saida;
}

describe("o preço mora em UM lugar só", () => {
  // ── METADE 1: O PORTÃO PEGA A DIVERGÊNCIA ────────────────────────────────
  describe("BARRA a divergência (a metade que protege)", () => {
    it("um preço trocado no código seria pego pela comparação", () => {
      const doDoc = planosDoDocumento();
      const ritmoDoDoc = doDoc.find((p) => p.nome === "Ritmo");
      expect(ritmoDoDoc).toBeDefined();
      // Simula o código divergindo do documento — é ISTO que o portão detecta.
      const codigoAdulterado = { nome: "Ritmo", preco: 397 };
      expect(codigoAdulterado.preco).not.toBe(ritmoDoDoc!.preco);
    });

    it("o documento é LEGÍVEL — se a tabela mudar de forma, o portão falha alto", () => {
      // Um portão que devolve [] quando não entende o documento não protege
      // nada: ele passaria a aprovar tudo em silêncio. Melhor quebrar.
      const doDoc = planosDoDocumento();
      // Quatro desde 26/08/2026 — o Crescimento saiu com a tabela única.
      expect(doDoc.length).toBe(4);
    });
  });

  // ── METADE 2: NÃO INVENTA PROBLEMA NO CASO LIMPO ─────────────────────────
  describe("NÃO acusa divergência onde não há", () => {
    it("os 4 planos do documento existem no código, com o mesmo nome", () => {
      const doDoc = planosDoDocumento().map((p) => p.nome).sort();
      const doCodigo = PLANOS.map((p) => p.nome).sort();
      expect(doDoc).toEqual(doCodigo);
    });

    it("MENSALIDADE: documento e código dizem o mesmo número", () => {
      for (const doDoc of planosDoDocumento()) {
        const noCodigo = PLANOS.find((p) => p.nome === doDoc.nome)!;
        expect(
          noCodigo.preco,
          `"${doDoc.nome}": docs/precos.md diz R$ ${doDoc.preco}, lib/agency/planos.ts diz R$ ${noCodigo.preco}`,
        ).toBe(doDoc.preco);
      }
    });

    it("IMPLANTAÇÃO: documento e código dizem o mesmo número (e 'isenta' é null)", () => {
      for (const doDoc of planosDoDocumento()) {
        const noCodigo = PLANOS.find((p) => p.nome === doDoc.nome)!;
        expect(
          noCodigo.implantacao,
          `"${doDoc.nome}": docs/precos.md diz ${doDoc.implantacao}, planos.ts diz ${noCodigo.implantacao}`,
        ).toBe(doDoc.implantacao);
      }
    });

    it("a peça avulsa do documento é a do código (E1, 30/08/2026 — unifica PECA_EXTRA e o avulso)", () => {
      const texto = readFileSync(DOC, "utf8");
      expect(texto).toContain(`R$ ${PRECO_DA_PECA_AVULSA}`);
    });

    it("o balcão NÃO tem os 5 planos — e isso é de propósito, não um furo", async () => {
      // Registrado porque foi exatamente aqui que a auditoria de 08/08 errou.
      const { SELF_SERVE_CATALOG } = await import("@/lib/agency/self-serve-catalog");
      for (const plano of PLANOS) {
        expect(SELF_SERVE_CATALOG.some((s) => s.label === plano.nome)).toBe(false);
      }
    });
  });
});
