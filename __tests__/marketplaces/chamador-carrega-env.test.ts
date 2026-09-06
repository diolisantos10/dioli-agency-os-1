// ─── DEFEITO 1 da ficha 06/09/2026 ───────────────────────────────────────────
//
// docs/celula-prospeccao/despachos/2026-09-06-consertos-do-chamador.md
//
// Prova medida na rodada real de hoje: `scripts/coletar-99freelas.mts`, rodado
// como `npx tsx` avulso, não carregava o `.env` — `DATABASE_URL` ficava
// indefinido, `lib/db/client.ts` caía no fallback `file:./prisma/dev.db` (um
// banco VAZIO, sem a tabela `ConexaoGasta`), e `conexoesGastasNoMes` caía no
// `catch` fail-closed: "o mês conta como esgotado", 240 de 240 conexões
// gastas — em silêncio, com uma mensagem que dizia "cota estourada" quando o
// problema real era "li o banco errado".
//
// Duas metades:
//   1. o import de `dotenv/config` está lá, como a PRIMEIRA linha de import
//      (regressão estrutural — é isso que resolve a causa-raiz);
//   2. a DECISÃO ("contador não confiável ⇒ recusa seguir") é uma função
//      pura, testável sem banco e sem `spawn` — nunca de novo um aviso que o
//      script ignora e segue em frente.

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { recusarSeContadorNaoConfiavel } from "@/lib/marketplaces/99freelas/redator";

const CAMINHO_DO_SCRIPT = path.join(process.cwd(), "scripts/coletar-99freelas.mts");
const FONTE_DO_SCRIPT = readFileSync(CAMINHO_DO_SCRIPT, "utf-8");

describe("o chamador carrega o .env antes de falar com o banco", () => {
  it('importa "dotenv/config" como a PRIMEIRA linha de import do arquivo', () => {
    const primeiraLinhaDeImport = FONTE_DO_SCRIPT.split("\n").find((linha) => linha.trim().startsWith("import "));
    expect(primeiraLinhaDeImport?.trim()).toBe('import "dotenv/config";');
  });

  it('o import de "dotenv/config" vem ANTES do import de "@/lib/db/client"', () => {
    // Busca pela linha de código EXATA (com `;` no fim) — não pela substring,
    // que também aparece dentro do comentário que explica a decisão (linha
    // acima), e isso mascararia uma regressão em que alguém movesse o import
    // de verdade para depois de `@/lib/db/client` sem mover o comentário.
    const posicaoDotenv = FONTE_DO_SCRIPT.indexOf('import "dotenv/config";');
    const posicaoDbClient = FONTE_DO_SCRIPT.indexOf('from "@/lib/db/client"');
    expect(posicaoDotenv).toBeGreaterThan(-1);
    expect(posicaoDbClient).toBeGreaterThan(-1);
    expect(posicaoDotenv).toBeLessThan(posicaoDbClient);
  });

  it('o script NÃO voltou a declarar a lógica que saiu para "lib/marketplaces/99freelas/redator.ts" — a duplicação não pode renascer em silêncio', () => {
    expect(FONTE_DO_SCRIPT).not.toContain("function construirPortaDoJuiz");
    expect(FONTE_DO_SCRIPT).toContain('from "@/lib/marketplaces/99freelas/redator"');
  });
});

describe("recusarSeContadorNaoConfiavel — a trava contra decisão silenciosa", () => {
  it("METADE 1 — contador NÃO confiável ⇒ o script recusa seguir", () => {
    const decisao = recusarSeContadorNaoConfiavel({
      confiavel: false,
      motivo:
        "NÃO CONSEGUI LER O CONTADOR (SQLITE_ERROR: no such table: main.ConexaoGasta). Fail closed: o mês conta como esgotado.",
    });

    expect(decisao.recusar).toBe(true);
    if (!decisao.recusar) throw new Error("deveria ter recusado");
    // A mensagem precisa apontar a causa real (banco/env), não repetir "cota
    // estourada" como se fosse o problema — é exatamente o que a prova da
    // ficha diz que aconteceu hoje.
    expect(decisao.mensagem).toMatch(/DATABASE_URL/);
    expect(decisao.mensagem).toMatch(/não é confiável/);
    expect(decisao.mensagem).toContain("SQLITE_ERROR");
  });

  it("METADE 2 — contador confiável ⇒ segue normalmente", () => {
    const decisao = recusarSeContadorNaoConfiavel({
      confiavel: true,
      motivo: "0 conexão(ões) gasta(s) em 2026-09.",
    });

    expect(decisao).toEqual({ recusar: false });
  });
});
