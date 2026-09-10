// ─────────────────────────────────────────────────────────────────────────
// A LEI DO GIT NESTA CASA: `merge-base` vazio NÃO é "não há ancestral".
// Ver o cabeçalho de `lib/coordenacao/historico-completo.ts` para a história
// completa de 28/08/2026 — aqui as DUAS METADES exigidas pela ficha:
//
//   METADE 1 (barra o problema plantado): um clone `--depth 1` de verdade
//   tem que responder `{ estado: "nao_medido", motivo: "clone_raso" }` —
//   NUNCA `sem_ancestral`, que foi o veredito errado que custou 12 dias — e
//   `exigirHistoricoCompleto` tem que LANÇAR ali.
//
//   METADE 2 (não inventa problema no caso limpo): num repositório com
//   histórico completo, dois refs realmente parentes têm que responder
//   `{ estado: "medido", sha }`, e duas raízes órfãs de verdade têm que
//   responder `{ estado: "sem_ancestral" }` — sem lançar.
//
// ── POR QUE ESTE TESTE NÃO USA "este worktree" COMO O CASO LIMPO ──────────
// A ficha original sugere medir a METADE 2 contra o próprio worktree deste
// repositório. Não fiz isso: `lib/coordenacao/portao-de-push.ts` já registra,
// por experiência PAGA nesta mesma árvore (26/08/2026), que "o runner faz
// checkout raso" — um teste que mede o REPOSITÓRIO AO REDOR, em vez de medir
// só a régua, passa aqui e reprova no CI (ou o oposto). Esta suíte constrói
// os DOIS repositórios que precisa — um raso, um completo — inteiramente
// dentro de diretórios temporários, com `git init`/`git clone` locais, sem
// rede e sem depender do estado (raso ou não) do worktree que a executa. É
// o mesmo padrão hermético já validado em
// `__tests__/coordenacao/encerrar-com-tree-sujo.test.ts`.
// ─────────────────────────────────────────────────────────────────────────

import { afterEach, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { ancestralComum, cloneEhRaso, exigirHistoricoCompleto } from "@/lib/coordenacao/historico-completo";

const AMBIENTE_GIT = {
  ...process.env,
  GIT_AUTHOR_NAME: "teste-dioli",
  GIT_AUTHOR_EMAIL: "teste-dioli@example.com",
  GIT_COMMITTER_NAME: "teste-dioli",
  GIT_COMMITTER_EMAIL: "teste-dioli@example.com",
};

function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8", env: AMBIENTE_GIT }).trim();
}

/**
 * Monta, num diretório temporário, um repositório com histórico COMPLETO
 * contendo os dois casos que a METADE 2 precisa medir ao mesmo tempo:
 *   - `root1` → `principal` (HEAD): dois commits REALMENTE parentes.
 *   - `principal` × `raizNaoRelacionada`: duas raízes órfãs, sem parentesco
 *     nenhum (criadas com `git checkout --orphan`, como a ficha sugere).
 */
function repoComHistoricoCompleto(): { dir: string; principal: string; root1: string; raizNaoRelacionada: string } {
  const dir = mkdtempSync(join(tmpdir(), "historico-completo-limpo-"));
  git(dir, ["init", "-q"]);
  const principal = git(dir, ["symbolic-ref", "--short", "HEAD"]);

  git(dir, ["commit", "-q", "--allow-empty", "-m", "root1"]);
  const root1 = git(dir, ["rev-parse", "HEAD"]);

  git(dir, ["commit", "-q", "--allow-empty", "-m", "filho-de-root1"]);

  const raizNaoRelacionada = "raiz-nao-relacionada";
  git(dir, ["checkout", "-q", "--orphan", raizNaoRelacionada]);
  git(dir, ["commit", "-q", "--allow-empty", "-m", "root2-sem-parentesco-nenhum"]);
  git(dir, ["checkout", "-q", principal]);

  return { dir, principal, root1, raizNaoRelacionada };
}

const diretoriosParaLimpar: string[] = [];

afterEach(() => {
  for (const dir of diretoriosParaLimpar.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("ancestralComum / exigirHistoricoCompleto — a lei do git nesta casa", () => {
  it("METADE 1 — clone raso de verdade: NUNCA 'sem_ancestral', sempre 'nao_medido'/'clone_raso', e a trava LANÇA", () => {
    const origem = repoComHistoricoCompleto();
    diretoriosParaLimpar.push(origem.dir);

    const raso = mkdtempSync(join(tmpdir(), "historico-completo-raso-"));
    diretoriosParaLimpar.push(raso);
    // Clone raso DE VERDADE — mesmo mecanismo replantado na Prova 4 da
    // forense, só que local e sem rede.
    //
    // ⚠️ O `file://` NÃO É ENFEITE, e a primeira versão deste teste caiu por
    // causa dele. Com um CAMINHO local puro (`/tmp/...`) o git faz um clone
    // "local" e IGNORA `--depth` em silêncio (a documentação do git diz, com
    // essas palavras: "--depth is ignored in local clones; use file://
    // instead"). O clone nascia COMPLETO, `cloneEhRaso` respondia `false` e a
    // METADE 1 deixava de exercitar o que existe para exercitar. Medido em
    // 29/08/2026, rodando o teste: sem `file://` ele reprovava em
    // `expect(cloneEhRaso(raso))` — não por defeito da trava, mas porque o
    // problema plantado nunca chegava a ser plantado. Teste que não planta o
    // defeito não prova coisa nenhuma.
    execFileSync("git", ["clone", "-q", "--depth", "1", `file://${origem.dir}`, raso], { encoding: "utf8", env: AMBIENTE_GIT });

    expect(cloneEhRaso(raso)).toBe(true);

    // Comparar HEAD contra si mesmo: se a checagem de clone raso não viesse
    // ANTES da medição, `merge-base HEAD HEAD` mediria sem erro (um commit é
    // ancestral de si mesmo) e o defeito de 28/08 passaria batido aqui.
    const resultado = ancestralComum("HEAD", "HEAD", raso);
    expect(resultado.estado).not.toBe("sem_ancestral");
    expect(resultado).toEqual({ estado: "nao_medido", motivo: "clone_raso" });

    expect(() => exigirHistoricoCompleto("teste do plantado", raso)).toThrow(/CLONE RASO/);
  });

  it("METADE 2 — repositório com histórico completo: ancestral real vira 'medido', raízes órfãs viram 'sem_ancestral', e a trava NÃO lança", () => {
    const origem = repoComHistoricoCompleto();
    diretoriosParaLimpar.push(origem.dir);

    expect(cloneEhRaso(origem.dir)).toBe(false);

    const medido = ancestralComum(origem.root1, origem.principal, origem.dir);
    expect(medido).toEqual({ estado: "medido", sha: origem.root1 });

    const semAncestral = ancestralComum(origem.principal, origem.raizNaoRelacionada, origem.dir);
    expect(semAncestral).toEqual({ estado: "sem_ancestral" });

    expect(() => exigirHistoricoCompleto("teste do limpo", origem.dir)).not.toThrow();
  });

  it("ref inexistente também é 'nao_medido' — nunca 'sem_ancestral' — num repositório de histórico completo", () => {
    const origem = repoComHistoricoCompleto();
    diretoriosParaLimpar.push(origem.dir);

    const resultado = ancestralComum(origem.principal, "este-ref-nao-existe-em-lugar-nenhum", origem.dir);
    expect(resultado).toEqual({ estado: "nao_medido", motivo: "ref_ausente" });
  });
});
