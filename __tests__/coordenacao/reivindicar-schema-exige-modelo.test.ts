// A PORTA DE ENTRADA: "abrir" recusa "prisma/schema.prisma" SEM modelo.
//
// ── O BURACO QUE ISTO FECHA (`.despachos/F3-schema-exige-modelo.md`, 30/08) ─
// O despacho F2 (`.despachos/F2-schema-colide-por-modelo.md`) fez a régua de
// colisão do schema passar a ser POR MODELO — e, para não quebrar as
// reivindicações já gravadas sem modelo, decidiu que "sem modelo" NÃO colide
// com nada, nem com outra também sem modelo. Isso é fail-OPEN: uma
// reivindicação NOVA que omitisse o modelo simplesmente SUMIA da trava, sem
// avisar ninguém — `lib/coordenacao/reivindicacoes.ts:356-376` documenta a
// decisão deliberada, mas não fechava a porta.
//
// Este arquivo mede, RODANDO O PROCESSO DE VERDADE (`tsx
// scripts/reivindicar.mts`, o mesmo molde de
// `reivindicar-guarda-antes-de-escrever.test.ts`, ficha B1), que:
//
//   1. `--arquivos prisma/schema.prisma` (sem modelo) → recusa, e NADA é
//      escrito, commitado ou empurrado — nem local, nem no remoto BARE;
//   2. `--arquivos prisma/schema.prisma#ModeloDeTeste` → abre normalmente;
//   3. `--arquivos lib/qualquer.ts` → abre normalmente (a exigência é só do
//      schema, nada mais fica mais rígido);
//   4. a régua de COLISÃO (não a porta) continua tratando reivindicações já
//      gravadas sem modelo como "sem colisão" — provado sem tocar em
//      `seTocamNoSchema`/`partirCaminhoDeSchema`, só lendo o arquivo fonte,
//      porque este despacho proíbe expressamente mexer nessa régua.

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const RAIZ_DO_REPO = join(__dirname, "..", "..");
const SCRIPT = join(RAIZ_DO_REPO, "scripts", "reivindicar.mts");
const TSX = join(RAIZ_DO_REPO, "node_modules", ".bin", "tsx");

const AMBIENTE_GIT = {
  GIT_AUTHOR_NAME: "teste-dioli",
  GIT_AUTHOR_EMAIL: "teste-dioli@example.com",
  GIT_COMMITTER_NAME: "teste-dioli",
  GIT_COMMITTER_EMAIL: "teste-dioli@example.com",
};

function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8", env: { ...process.env, ...AMBIENTE_GIT } }).trim();
}

function logDe(cwd: string, ref: string): string {
  try {
    return execFileSync("git", ["log", "--oneline", ref], {
      cwd,
      encoding: "utf8",
      env: { ...process.env, ...AMBIENTE_GIT },
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    return "";
  }
}

type Resultado = { code: number; saida: string };

/** Roda o SCRIPT DE VERDADE como processo — mesmo molde de
 *  `reivindicar-guarda-antes-de-escrever.test.ts` (ficha B1). */
function rodarReivindicar(localDir: string, args: string[]): Resultado {
  const r = spawnSync(TSX, [SCRIPT, ...args], {
    cwd: localDir,
    encoding: "utf8",
    env: {
      ...process.env,
      ...AMBIENTE_GIT,
      REIVINDICAR_RAIZ_DE_TESTE: localDir,
      CLAUDE_CODE_SESSION_ID: "sessao-de-teste-reivindicar-schema-modelo",
    },
  });
  return { code: r.status ?? -1, saida: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

let raiz: string;
let remoto: string;
let local: string;

beforeEach(() => {
  raiz = mkdtempSync(join(tmpdir(), "dioli-reivindicar-schema-modelo-"));
  remoto = join(raiz, "remoto.git");
  local = join(raiz, "local");

  git(raiz, ["init", "--bare", remoto]);
  git(raiz, ["clone", remoto, local]);
  git(local, ["checkout", "-b", "main"]);
  writeFileSync(join(local, "raiz.md"), "# repositório de teste\n", "utf8");
  git(local, ["add", "raiz.md"]);
  git(local, ["commit", "-m", "estado inicial"]);
  git(local, ["push", "origin", "main"]);
});

afterEach(() => {
  rmSync(raiz, { recursive: true, force: true });
});

describe("abrir: prisma/schema.prisma SEM modelo — recusa na porta, antes de escrever", () => {
  it("nenhum arquivo, nenhum commit, nenhum push — e a mensagem ensina o formato certo", () => {
    const logLocalAntes = logDe(local, "main");
    const logRemotoAntes = logDe(remoto, "main");

    const caminhoDaReivindicacao = join(local, "reivindicacoes", "schema-sem-modelo-teste.json");
    expect(existsSync(caminhoDaReivindicacao)).toBe(false);

    const { code, saida } = rodarReivindicar(local, [
      "abrir",
      "--branch", "main",
      "--frente", "frente de teste: schema sem modelo tem que ser barrado",
      "--responsabilidade", "schema-sem-modelo-teste",
      "--arquivos", "prisma/schema.prisma",
    ]);

    // 1. Recusou, e a mensagem ensina — cita o formato e um exemplo real.
    expect(code).not.toBe(0);
    expect(saida).toContain("exige o MODELO");
    expect(saida).toContain("prisma/schema.prisma#");
    expect(saida.toLowerCase()).toContain("exemplo");

    // 2. MEDIDO — nada nasceu, nem local nem no remoto.
    expect(existsSync(caminhoDaReivindicacao)).toBe(false);
    expect(logDe(local, "main")).toBe(logLocalAntes);
    expect(logDe(remoto, "main")).toBe(logRemotoAntes);
  });

  it("também recusa com '#' vazio (\"prisma/schema.prisma#\") — mesma falta de prova", () => {
    const { code, saida } = rodarReivindicar(local, [
      "abrir",
      "--branch", "main",
      "--frente", "frente de teste: '#' vazio não conta como modelo",
      "--responsabilidade", "schema-hash-vazio-teste",
      "--arquivos", "prisma/schema.prisma#",
    ]);

    expect(code).not.toBe(0);
    expect(saida).toContain("exige o MODELO");
  });
});

describe("abrir: prisma/schema.prisma#Modelo — abre normalmente, a porta não bloqueia quem declarou", () => {
  it("cria, commita e empurra de verdade", () => {
    const logRemotoAntes = logDe(remoto, "main");

    const { code, saida } = rodarReivindicar(local, [
      "abrir",
      "--branch", "main",
      "--frente", "frente de teste: com modelo declarado passa",
      "--responsabilidade", "schema-com-modelo-teste",
      "--arquivos", "prisma/schema.prisma#ModeloDeTeste",
    ]);

    expect(code).toBe(0);
    expect(saida).toContain("✅ Reivindicado");

    const caminhoDaReivindicacao = join(local, "reivindicacoes", "schema-com-modelo-teste.json");
    expect(existsSync(caminhoDaReivindicacao)).toBe(true);
    const conteudo = JSON.parse(readFileSync(caminhoDaReivindicacao, "utf8"));
    expect(conteudo.arquivos).toEqual(["prisma/schema.prisma#ModeloDeTeste"]);

    const logRemotoDepois = logDe(remoto, "main");
    expect(logRemotoDepois).not.toBe(logRemotoAntes);
  });
});

describe("abrir: arquivo comum sem '#' — a exigência é só do schema, nada mais ficou mais rígido", () => {
  it("cria, commita e empurra normalmente", () => {
    const { code, saida } = rodarReivindicar(local, [
      "abrir",
      "--branch", "main",
      "--frente", "frente de teste: arquivo comum não é afetado pela porta do schema",
      "--responsabilidade", "arquivo-comum-teste",
      "--arquivos", "lib/qualquer.ts",
    ]);

    expect(code).toBe(0);
    expect(saida).toContain("✅ Reivindicado");

    const caminhoDaReivindicacao = join(local, "reivindicacoes", "arquivo-comum-teste.json");
    expect(existsSync(caminhoDaReivindicacao)).toBe(true);
  });
});

describe("a régua de COLISÃO (não a porta) não foi tocada — prova lendo o arquivo fonte", () => {
  it("seTocamNoSchema/partirCaminhoDeSchema continuam devolvendo `false` para 'sem modelo', nunca `null`", () => {
    // O despacho F3 proíbe expressamente mexer na régua de colisão — só a
    // porta de entrada (comando `abrir`) fecha. Isto é medido lendo o
    // arquivo-fonte da régua (não reimplementando a lógica aqui): a mesma
    // garantia que `__tests__/coordenacao/reivindicacoes.test.ts` já prova
    // via `conferirColisao` continua valendo, palavra por palavra, no código.
    const fonte = readFileSync(join(RAIZ_DO_REPO, "lib", "coordenacao", "reivindicacoes.ts"), "utf8");
    expect(fonte).toContain("if (pa.modelo === null || pb.modelo === null) return false;");
  });

  it("a nova função da porta (caminhosDeSchemaSemModelo) é PURA e separada da régua de colisão (seTocamNoSchema)", () => {
    const fonte = readFileSync(join(RAIZ_DO_REPO, "lib", "coordenacao", "reivindicacoes.ts"), "utf8");
    // A função da porta existe...
    expect(fonte).toContain("export function caminhosDeSchemaSemModelo(");
    // ...e a régua de colisão continua sendo a MESMA função de sempre, sem
    // nenhuma chamada nova para a função da porta dentro dela (elas não se
    // misturam).
    const indiceDaRegua = fonte.indexOf("function seTocamNoSchema(");
    const corpoDaRegua = fonte.slice(indiceDaRegua, indiceDaRegua + 500);
    expect(corpoDaRegua).not.toContain("caminhosDeSchemaSemModelo");
  });
});
