// ─────────────────────────────────────────────────────────────────────────
// DEFEITO 1 — o mais grave, medido em 16/08/2026 EXERCITANDO o comando de
// verdade (duas sessões no mesmo worktree), não lendo o código.
//
// A mensagem de colisão por esquema antigo manda a pessoa rodar
// "npm run reivindicar -- encerrar --responsabilidade <slug>" NO MEIO do
// próprio trabalho (é o próprio caso que a mensagem existe para resolver).
// Seguir esse conselho, de verdade, produzia:
//
//   🚫 "git pull --rebase origin ..." falhou porque HÁ TRABALHO NÃO
//   COMMITADO no seu próprio worktree — isto NÃO é colisão com outra
//   sessão. Commite (ou "git stash") o que está solto e rode "npm run
//   reivindicar -- encerrar --responsabilidade ..." de novo.
//
// "abrir" tem um escape para working tree sujo
// (--mesmo-com-trabalho-em-andamento). "encerrar" NÃO tinha nenhum — e quem
// é barrado por identidade de esquema antigo é, por definição, alguém que
// JÁ ESTÁ TRABALHANDO (tree sujo é o estado NORMAL de quem chama
// "encerrar" no meio de uma frente). A saída recomendada batia numa segunda
// parede exatamente para o único público dela.
//
// O CONSERTO (`scripts/reivindicar.mts`, `commitarEEmpurrar`,
// parâmetro `autostashNoRebase`): quando "encerrar" precisa rebasear (o
// push direto foi recusado porque a branch andou), o comando roda
// `git -c rebase.autoStash=true pull --rebase origin <branch>` em vez do
// `git pull --rebase` puro — o git GUARDA (stash) o que está solto,
// rebaseia, e DEVOLVE (pop) automaticamente. Só "encerrar" pede isso:
// "abrir" continua exigindo tree limpo (ou o escape explícito) ANTES de
// commitar, porque "abrir" é quem TOMA POSSE de uma frente nova — é lá que
// o rigor pertence. "Encerrar" só REMOVE uma reivindicação já registrada:
// é o ato MENOS perigoso do comando inteiro, e exigir tree limpo dele era
// rigor no lugar errado.
//
// ── ⚠️ 30/08/2026 — O MECANISMO DESCRITO ACIMA SAIU DO SCRIPT ─────────────
// `commitarEEmpurrar` não rebaseia mais nada, então não há `autostashNoRebase`
// nem `git pull --rebase` em `scripts/reivindicar.mts`. O push da reivindicação
// passou a levar um commit CONSTRUÍDO sobre `origin/<branch>` (só o arquivo do
// registro dentro), e quando a base anda o commit é RECONSTRUÍDO sobre a base
// nova — nunca rebaseando a branch de quem chamou, que desde a ordem do CEO é
// uma branch de PR com trabalho dentro. Ver
// `__tests__/coordenacao/reivindicacao-em-branch-de-pr.test.ts`.
//
// O DEFEITO 1 continua resolvido, e melhor: "encerrar" não exige working tree
// limpo porque NADA no caminho do push toca o working tree — deixou de ser um
// escape (`rebase.autoStash=true`) e passou a ser propriedade do desenho.
//
// Este arquivo FICA como o registro medido daquela decisão: ele exercita git
// puro (não o script), e é ele que documenta por que o rebase era uma parede
// para quem chamava "encerrar" no meio do trabalho. Se alguém trouxer o rebase
// de volta, é aqui que está escrito o que aconteceu da última vez.
//
// ── POR QUE ESTE TESTE NÃO INVOCA "scripts/reivindicar.mts" DIRETO ────────
// O script fixa `RAIZ` a partir do PRÓPRIO caminho do arquivo (o repositório
// real desta casa) e usa `cwd: RAIZ` em TODO comando git — não há como
// apontar o script para um repositório temporário isolado sem reescrever a
// casca inteira dele, e um teste automatizado nunca deve escrever/empurrar
// no repositório real deste projeto. Por isso este teste exercita o MESMO
// MECANISMO GIT que `commitarEEmpurrar` passou a usar
// (`git -c rebase.autoStash=true pull --rebase`), num par de clones
// efêmeros criados só para o teste — provando que o mecanismo escolhido
// resolve de verdade a classe de falha medida em produção, e não só que o
// código "parece certo" lido na tela.
// ─────────────────────────────────────────────────────────────────────────

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

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

type ResultadoGit = { ok: boolean; saida: string };

function gitPermiteFalha(cwd: string, args: string[]): ResultadoGit {
  try {
    const saida = execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      env: AMBIENTE_GIT,
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { ok: true, saida };
  } catch (e) {
    const erro = e as { stdout?: string; stderr?: string; message?: string };
    return { ok: false, saida: `${erro.stderr ?? ""}\n${erro.stdout ?? ""}\n${erro.message ?? ""}` };
  }
}

describe("DEFEITO 1 — 'encerrar' não pode depender de working tree limpo para rebasear", () => {
  let raiz: string;
  let remoto: string;
  let clone1: string; // simula "a outra sessão" que empurrou primeiro
  let clone2: string; // simula a sessão que está ENCERRANDO, no meio do trabalho

  beforeEach(() => {
    raiz = mkdtempSync(join(tmpdir(), "dioli-reivindicar-rebase-"));
    remoto = join(raiz, "remoto.git");
    clone1 = join(raiz, "clone1");
    clone2 = join(raiz, "clone2");

    git(raiz, ["init", "--bare", remoto]);

    git(raiz, ["clone", remoto, clone1]);
    git(clone1, ["checkout", "-b", "main"]);
    writeFileSync(join(clone1, "reivindicacao.json"), "{}\n", "utf8");
    // Arquivo JÁ RASTREADO desde o commit inicial — é a peça que faltava na
    // primeira versão deste teste. Ver nota abaixo.
    writeFileSync(join(clone1, "arquivo-rastreado.ts"), "// versão inicial, já commitada\n", "utf8");
    git(clone1, ["add", "reivindicacao.json", "arquivo-rastreado.ts"]);
    git(clone1, ["commit", "-m", "estado inicial"]);
    git(clone1, ["push", "origin", "main"]);

    git(raiz, ["clone", remoto, clone2]);
    git(clone2, ["checkout", "main"]);

    // Simula "a branch andou" — outra sessão empurrou entre o push recusado
    // e o rebase, o cenário que faz "commitarEEmpurrar" precisar rebasear.
    writeFileSync(join(clone1, "outro-arquivo.json"), "{}\n", "utf8");
    git(clone1, ["add", "outro-arquivo.json"]);
    git(clone1, ["commit", "-m", "outra sessão avançou a branch"]);
    git(clone1, ["push", "origin", "main"]);

    // clone2 tem trabalho NÃO COMMITADO num arquivo JÁ RASTREADO — o cenário
    // real medido em 16/08/2026 (lib/coordenacao/reivindicacoes.ts e
    // scripts/reivindicar.mts, ambos já commitados e alterados no working
    // tree quando "encerrar" bateu na parede).
    //
    // ── POR QUE ISTO IMPORTA (e por que a v1 deste teste passou por engano) ──
    // A v1 criava "trabalho-em-andamento.ts" como arquivo NOVO — UNTRACKED.
    // O git NÃO recusa "pull --rebase" por causa de arquivo untracked (ele
    // não precisa tocar nele para rebasear); só recusa por arquivo JÁ
    // RASTREADO e modificado, porque aplicar os commits remotos exigiria
    // sobrescrever uma mudança que ainda não foi salva em lugar nenhum. Um
    // cenário com só arquivo untracked nunca bate na parede que este teste
    // existe para provar — por isso o primeiro `it()` (que espera RECUSA)
    // falhava com `expected true to be false`: o `pull --rebase` puro
    // simplesmente funcionava, silenciando o próprio propósito do teste.
    // Se alguém, meses depois, "simplificar" este arquivo de volta para
    // criar um arquivo novo em vez de modificar um rastreado, o teste volta
    // a ficar verde por engano.
    writeFileSync(join(clone2, "arquivo-rastreado.ts"), "// mudança local, ainda não commitada\n", "utf8");
  });

  afterEach(() => {
    rmSync(raiz, { recursive: true, force: true });
  });

  it("o COMPORTAMENTO ANTIGO: 'git pull --rebase' puro RECUSA rodar com o tree sujo — a parede que barrava 'encerrar'", () => {
    const resultado = gitPermiteFalha(clone2, ["pull", "--rebase", "origin", "main"]);

    expect(resultado.ok).toBe(false);
    // A mesma causa que "diagnosticarFalhaDoRebase" (scripts/reivindicar.mts)
    // reconhece como "trabalho não commitado no próprio worktree".
    expect(/cannot pull with rebase|unstaged changes|local changes/i.test(resultado.saida)).toBe(true);

    // O git recusou ANTES de tocar em qualquer coisa — o trabalho solto
    // continua intacto.
    expect(readFileSync(join(clone2, "arquivo-rastreado.ts"), "utf8")).toContain("mudança local, ainda não commitada");
  });

  it("o CONSERTO — 'git -c rebase.autoStash=true pull --rebase' (o que 'encerrar' passa a usar) TERMINA com sucesso e devolve o trabalho solto intacto", () => {
    const resultado = gitPermiteFalha(clone2, ["-c", "rebase.autoStash=true", "pull", "--rebase", "origin", "main"]);

    expect(resultado.ok).toBe(true);

    // O commit que "a outra sessão" empurrou chegou.
    expect(existsSync(join(clone2, "outro-arquivo.json"))).toBe(true);

    // E o trabalho solto voltou intacto depois do stash pop automático —
    // "encerrar" não perde nada de quem estava no meio de uma frente.
    expect(readFileSync(join(clone2, "arquivo-rastreado.ts"), "utf8")).toContain("mudança local, ainda não commitada");

    // A branch de clone2 está limpa depois — sem stash pendurado, sem
    // resíduo de operação de rebase em andamento.
    // Lido pelo caminho CRU, de propósito: o helper `git()` acima aplica
    // `.trim()` na saída inteira, e `git status --porcelain` codifica o
    // estado nos DOIS primeiros caracteres da linha (" M" = modificado só no
    // working tree; "M " = modificado no índice). Um `.trim()` come o espaço
    // inicial e transforma " M" em "M" — some justamente o bit que diz se a
    // mudança está staged. É o mesmo defeito 2 desta frente (o caminho
    // impresso com um "_" comido em `arquivosNaoCommitados`), reaparecendo
    // dentro do teste que veio provar outra coisa. Por isso a comparação
    // abaixo é feita sobre a saída sem trim.
    const status = gitPermiteFalha(clone2, ["status", "--porcelain"]).saida;
    // Só a própria modificação solta, nunca commitada, e ainda NÃO staged —
    // o autostash devolveu o trabalho exatamente no estado em que o pegou.
    expect(status).toBe(" M arquivo-rastreado.ts\n");
  });
});
