/**
 * ⭐⭐ A TRAVA DA PALAVRA (ordem do CEO, 30/08/2026).
 *
 * "Enquanto o cliente não recebeu o texto, diga **resposta preservada e
 * reagendada**. ⛔ Nunca 'recuperação concluída' ou 'entregue'."
 *
 * Prompt é aviso; código é trava. Este arquivo é a trava: quem escrever a
 * palavra proibida em `lib/` ou `app/` reprova na CI, e o relatório não sai
 * dizendo que acabou uma coisa que não acabou.
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  RESPOSTA_PRESERVADA_E_REAGENDADA,
  TERMOS_PROIBIDOS_ANTES_DA_ENTREGA,
  relatarRespostaNaoEntregue,
} from "@/lib/agency/connect/vocabulario-do-relato";

const RAIZ = process.cwd();
const PASTAS = ["lib", "app", "scripts"];

function arquivosDeCodigo(dir: string, achados: string[] = []): string[] {
  let entradas: fs.Dirent[];
  try {
    entradas = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return achados;
  }
  for (const e of entradas) {
    const caminho = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === "generated" || e.name.startsWith(".")) continue;
      arquivosDeCodigo(caminho, achados);
    } else if (/\.(ts|tsx|mts)$/.test(e.name)) {
      achados.push(caminho);
    }
  }
  return achados;
}

describe("a palavra que esta casa usa para uma resposta que ainda não chegou", () => {
  it("a frase é exatamente a que o CEO mandou", () => {
    expect(RESPOSTA_PRESERVADA_E_REAGENDADA).toBe("resposta preservada e reagendada");
  });

  it("o relato não afirma conclusão — deixa a pergunta aberta", () => {
    const relato = relatarRespostaNaoEntregue("canal não entrega sozinho");
    expect(relato).toContain("resposta preservada e reagendada");
    expect(relato.toLowerCase()).not.toContain("conclu");
    expect(relato.toLowerCase()).not.toContain("entregue");
  });

  it("⭐⭐ NENHUM arquivo de código escreve 'recuperação concluída'", () => {
    const ofensores: string[] = [];

    for (const pasta of PASTAS) {
      for (const arquivo of arquivosDeCodigo(path.join(RAIZ, pasta))) {
        // ⚠️ O PRÓPRIO arquivo da trava cita os termos proibidos — é o que ele
        // existe para proibir. Citação não é uso; reprovar a definição seria a
        // lição errada ("apague a lista"), que é o contrário do que se quer.
        if (arquivo.endsWith("vocabulario-do-relato.ts")) continue;

        const texto = fs.readFileSync(arquivo, "utf8").toLowerCase();
        for (const termo of TERMOS_PROIBIDOS_ANTES_DA_ENTREGA) {
          if (texto.includes(termo)) {
            ofensores.push(`${arquivo.replace(RAIZ + "/", "")} — "${termo}"`);
          }
        }
      }
    }

    expect(
      ofensores,
      "Ordem do CEO de 30/08/2026: enquanto o cliente não recebeu, diz-se " +
        `"${RESPOSTA_PRESERVADA_E_REAGENDADA}". Use ` +
        "`relatarRespostaNaoEntregue()` de `lib/agency/connect/vocabulario-do-relato.ts`.",
    ).toEqual([]);
  });
});
