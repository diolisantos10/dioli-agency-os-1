/**
 * historico-completo.ts — o ÚNICO caminho autorizado desta casa para
 * perguntar parentesco de commits (`merge-base`, "é ancestral de", "é órfão").
 *
 * ── A HISTÓRIA DE 28/08/2026, EM 5 LINHAS ──────────────────────────────────
 * Um diagnóstico rodou `git merge-base` dentro de um clone RASO
 * (`git clone --depth`) e leu "vazio" como "não há ancestral comum" —
 * declarando 7 PRs irrecuperáveis e mandando fechar 3 deles. Num clone raso
 * o ancestral existe e está ABAIXO do corte: o git responde
 * `refusing to merge unrelated histories` para históricos que SÃO parentes.
 * Um único `git fetch --unshallow origin`, sem mexer em nenhum ref, desfez o
 * diagnóstico inteiro: a branch de deploy tem uma raiz só, de 21/03/2026, e
 * os 13 PRs medidos de novo TINHAM ancestral comum — treze de treze. A casa
 * já sabia a lei certa ("ausência de informação não é informação") escrita
 * para UM `merge-base`, em `comandoPortaoDePush`
 * (`scripts/reivindicar.mts`) — nunca tinha sido generalizada. Este módulo
 * generaliza: o vazio de "não consegui medir" nunca mais sai disfarçado de
 * "medi e não há parente".
 *
 * Regra da casa: "trava, não aviso" — o TIPO abaixo é o que obriga quem
 * consome a tratar o terceiro estado (`nao_medido`); o texto de erro é só
 * cortesia para quem lê o log. `exigirHistoricoCompleto` é a trava de
 * verdade: ela RECUSA, não descreve.
 */

import { execFileSync } from "node:child_process";

export type Ancestral =
  | { estado: "medido"; sha: string }
  | { estado: "sem_ancestral" }
  | { estado: "nao_medido"; motivo: "clone_raso" | "ref_ausente" };

function git(args: string[], cwd?: string): string | null {
  try {
    return execFileSync("git", args, { encoding: "utf8", cwd }).trim();
  } catch {
    return null;
  }
}

/**
 * `cwd` é opcional (default: diretório de trabalho atual do processo) e
 * existe para o gate poder apontar para um clone de verdade — inclusive um
 * clone raso montado num diretório temporário. Sem este parâmetro a trava
 * não é exercitável, e "trava que não pode ser exercitada não existe".
 */
export function cloneEhRaso(cwd?: string): boolean {
  return git(["rev-parse", "--is-shallow-repository"], cwd) === "true";
}

/**
 * O ÚNICO caminho autorizado para perguntar parentesco nesta casa.
 *
 * A ordem importa e é o núcleo da trava: a checagem de clone raso vem
 * ANTES de qualquer medição. Medir primeiro e conferir depois é literalmente
 * como o erro de 28/08/2026 aconteceu — por isso `cloneEhRaso` decide o
 * resultado antes mesmo de `a` e `b` serem verificados.
 */
export function ancestralComum(a: string, b: string, cwd?: string): Ancestral {
  if (cloneEhRaso(cwd)) return { estado: "nao_medido", motivo: "clone_raso" };

  for (const ref of [a, b]) {
    if (git(["rev-parse", "--verify", `${ref}^{commit}`], cwd) === null) {
      return { estado: "nao_medido", motivo: "ref_ausente" };
    }
  }

  const sha = git(["merge-base", a, b], cwd);
  return sha ? { estado: "medido", sha } : { estado: "sem_ancestral" };
}

/**
 * A trava que RECUSA, não só descreve. Toda rotina que vai CONCLUIR algo
 * sobre ancestralidade ("isto é mesclável", "isto é órfão", "isto é
 * parente") chama esta função antes de concluir — nunca `cloneEhRaso`
 * sozinha, e nunca `ancestralComum` sem tratar o terceiro estado por conta
 * própria. Regra da casa: "prompt é sugestão, código é trava".
 *
 * `ondeEstouConcluindo` entra na mensagem de erro só para quem lê o log
 * saber qual rotina foi interrompida — não muda o comportamento.
 */
export function exigirHistoricoCompleto(ondeEstouConcluindo: string, cwd?: string): void {
  if (cloneEhRaso(cwd)) {
    throw new Error(
      `🔴 CLONE RASO — não posso concluir "${ondeEstouConcluindo}": este worktree não tem histórico ` +
      `completo. Todo veredito de "mesclável", "ancestral" ou "órfão" medido aqui é INVÁLIDO — foi ` +
      `exatamente essa ambiguidade que, em 28/08/2026, fez a casa declarar 7 PRs irrecuperáveis e mandar ` +
      `fechar 3 deles, sem que nenhum estivesse de fato perdido. Conserto (um comando, não destrutivo): ` +
      `git fetch --unshallow origin`
    );
  }
}
