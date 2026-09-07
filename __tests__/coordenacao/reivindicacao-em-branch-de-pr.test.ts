// A FRENTE QUE NASCE EM BRANCH DE PR CONSEGUE SE REGISTRAR — E SE ENCERRAR.
//
// ═══ O DEFEITO, MEDIDO EM 30/08/2026 EXERCITANDO O COMANDO ═════════════════
//
// `npm run reivindicar -- abrir`, rodado de dentro de uma branch de PR com dois
// commits que a branch de coordenação não tinha, RECUSAVA:
//
//   🚫 reivindicação NÃO empurrada: este branch tem 2 commits que o deploy não
//   tem, além da reivindicação — e empurrá-la daqui levaria todos eles junto,
//   sem PR e sem CI.
//   (nada foi escrito, commitado ou empurrado — o disco está como estava.)
//
// `encerrar` caía na MESMA guarda. E como `encerrar` é a saída LEGÍTIMA de uma
// colisão de reivindicação, a colisão ficava insolúvel de dentro do fluxo
// correto: para se registrar era preciso sair da branch de PR, e a doutrina da
// casa manda trabalhar em branch de PR. *Guarda que barra a saída de emergência
// não protege — ensina a contornar.*
//
// ═══ O QUE A GUARDA PROTEGIA, E POR QUE ELA NÃO SAIU ═══════════════════════
//
// Ela nasceu do incidente de 28/08/2026: `encerrar` levou QUATRO commits de um
// PR aberto direto para a branch de deploy, sem PR, sem CI, sem revisão — porque
// o push era `HEAD:<branch>` (e depois `${sha}:<branch>` com o SHA do HEAD, que
// é a mesma coisa: empurrar um SHA empurra todos os ancestrais dele).
//
// A separação que este arquivo mede é a de DUAS perguntas que estavam coladas
// numa só medição (`git log origin/<branch>..HEAD`):
//
//   (a) "este push leva trabalho de branch para o deploy?"  → tem de BARRAR.
//   (b) "o branch de quem chamou está à frente do deploy?"  → nunca foi motivo
//       para recusar um REGISTRO, e era o que de fato estava sendo medido.
//
// A régua (`soLevaAReivindicacao`) não mudou uma linha. Mudou o que se mede: a
// REF QUE VAI SER EMPURRADA, que agora é um commit construído sobre
// `origin/<branch>` com só o arquivo da reivindicação dentro. Com (a) e (b)
// separadas, o caso perigoso continua caindo na guarda e o caso legítimo passa.
//
// ═══ AS DUAS DIREÇÕES, E AS DUAS IMPORTAM ══════════════════════════════════
// 1. `abrir` e `encerrar` FUNCIONAM a partir de uma branch de PR à frente da base.
// 2. E o trabalho da branch NÃO chega junto — provado no remoto BARE, não na
//    mensagem: a ponta da branch de coordenação ganha o arquivo da reivindicação
//    e MAIS NADA, o commit empurrado tem a base como único pai, e a branch de PR
//    de quem chamou continua exatamente onde estava (ninguém a rebaseou).
// 3. A MESMA régua, alimentada com o HEAD daquela mesma branch — o que o
//    mecanismo antigo empurrava —, continua RECUSANDO e nomeando os commits que
//    teriam ido de carona. Nada foi afrouxado; a pergunta é que ficou honesta.

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { oQuePushCarrega, soLevaAReivindicacao } from "@/lib/coordenacao/so-o-commit-da-reivindicacao";

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

type Resultado = { code: number; saida: string };

/** Roda o SCRIPT DE VERDADE como processo, contra o repositório descartável.
 *  Ver `reivindicar-guarda-antes-de-escrever.test.ts` para o porquê de
 *  `REIVINDICAR_RAIZ_DE_TESTE` e de `CLAUDE_CODE_SESSION_ID` fixo. */
function rodarReivindicar(local: string, args: string[]): Resultado {
  const r = spawnSync(TSX, [SCRIPT, ...args], {
    cwd: local,
    encoding: "utf8",
    env: {
      ...process.env,
      ...AMBIENTE_GIT,
      REIVINDICAR_RAIZ_DE_TESTE: local,
      CLAUDE_CODE_SESSION_ID: "sessao-de-teste-branch-de-pr",
    },
  });
  return { code: r.status ?? -1, saida: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

let raiz: string;
let remoto: string;
let local: string;
/** O commit que era a ponta de `main` antes de qualquer reivindicação. */
let baseInicial: string;

beforeEach(() => {
  raiz = mkdtempSync(join(tmpdir(), "dioli-reivindicar-pr-"));
  remoto = join(raiz, "remoto.git");
  local = join(raiz, "local");

  git(raiz, ["init", "--bare", remoto]);
  git(raiz, ["clone", remoto, local]);
  git(local, ["checkout", "-b", "main"]);
  writeFileSync(join(local, "raiz.md"), "# repositório de teste\n", "utf8");
  git(local, ["add", "raiz.md"]);
  git(local, ["commit", "-m", "estado inicial"]);
  git(local, ["push", "origin", "main"]);
  baseInicial = git(local, ["rev-parse", "HEAD"]);

  // ── A BRANCH DE PR: o fluxo que o CEO mandou usar, e o que a guarda barrava.
  // Dois commits de trabalho que a branch de coordenação não tem.
  git(local, ["checkout", "-b", "minha-frente-de-pr"]);
  writeFileSync(join(local, "trabalho-1.ts"), "// primeira parte da frente\n", "utf8");
  git(local, ["add", "trabalho-1.ts"]);
  git(local, ["commit", "-m", "trabalho 1 da frente"]);
  writeFileSync(join(local, "trabalho-2.ts"), "// segunda parte da frente\n", "utf8");
  git(local, ["add", "trabalho-2.ts"]);
  git(local, ["commit", "-m", "trabalho 2 da frente"]);
});

afterEach(() => {
  rmSync(raiz, { recursive: true, force: true });
});

describe("✅ DIREÇÃO 1 — o fluxo correto deixou de ser barrado", () => {
  it("`abrir` funciona a partir de uma branch de PR com commits à frente da base", () => {
    const { code, saida } = rodarReivindicar(local, [
      "abrir",
      "--branch", "main",
      "--frente", "frente que nasce em branch de PR",
      "--responsabilidade", "frente-em-branch-de-pr",
      "--arquivos", "lib/algo-da-frente.ts",
    ]);

    expect(code, `abrir recusou de dentro da branch de PR:\n${saida}`).toBe(0);
    expect(saida).toContain("✅ Reivindicado");
    // A recusa que ESTE conserto matou não pode voltar disfarçada de sucesso.
    expect(saida).not.toContain("commits que o deploy não tem");

    // E a reivindicação está no REMOTO — que é a única fonte que duas sessões
    // isoladas compartilham. Reivindicação só local não coordena ninguém.
    git(local, ["fetch", "origin", "main"]);
    const registrado = JSON.parse(
      git(local, ["show", "origin/main:reivindicacoes/frente-em-branch-de-pr.json"]),
    );
    expect(registrado.responsabilidade).toBe("frente-em-branch-de-pr");
    expect(registrado.encerradaEm).toBeNull();
  });

  it("`encerrar` também — e é ele que torna uma colisão SOLÚVEL de dentro do fluxo correto", () => {
    const abertura = rodarReivindicar(local, [
      "abrir",
      "--branch", "main",
      "--frente", "frente que nasce em branch de PR",
      "--responsabilidade", "frente-em-branch-de-pr",
      "--arquivos", "lib/algo-da-frente.ts",
    ]);
    expect(abertura.code, abertura.saida).toBe(0);

    const { code, saida } = rodarReivindicar(local, [
      "encerrar",
      "--branch", "main",
      "--responsabilidade", "frente-em-branch-de-pr",
    ]);

    expect(code, `encerrar recusou de dentro da branch de PR:\n${saida}`).toBe(0);
    expect(saida).toContain("✅ Encerrada");
    expect(saida).not.toContain("commits que o deploy não tem");

    git(local, ["fetch", "origin", "main"]);
    const registrado = JSON.parse(
      git(local, ["show", "origin/main:reivindicacoes/frente-em-branch-de-pr.json"]),
    );
    expect(registrado.encerradaEm, "encerrou sem gravar a data — a frente segue viva para todo mundo").not.toBeNull();
  });
});

describe("⛔ DIREÇÃO 2 — e o trabalho da branch continua NÃO chegando junto", () => {
  it("a branch de coordenação recebe o arquivo da reivindicação e MAIS NADA", () => {
    const { code, saida } = rodarReivindicar(local, [
      "abrir",
      "--branch", "main",
      "--frente", "frente que nasce em branch de PR",
      "--responsabilidade", "frente-em-branch-de-pr",
      "--arquivos", "lib/algo-da-frente.ts",
    ]);
    expect(code, saida).toBe(0);

    git(local, ["fetch", "origin", "main"]);

    // 1. O QUE MUDOU na branch de coordenação, medido no git — não na mensagem.
    const mudou = git(local, ["diff", "--name-only", baseInicial, "origin/main"]).split("\n").filter(Boolean);
    expect(
      mudou,
      "algo além da reivindicação chegou à branch de coordenação — é o incidente de 28/08 outra vez",
    ).toEqual(["reivindicacoes/frente-em-branch-de-pr.json"]);

    // 2. Os arquivos do trabalho da frente NÃO existem lá.
    const arquivosLa = git(local, ["ls-tree", "-r", "--name-only", "origin/main"]).split("\n");
    expect(arquivosLa).not.toContain("trabalho-1.ts");
    expect(arquivosLa).not.toContain("trabalho-2.ts");

    // 3. O commit empurrado tem a BASE como único pai — ele foi construído
    //    sobre `origin/main`, não descende da branch de PR. É a garantia
    //    ESTRUTURAL: não existe ancestral do trabalho para levar de carona.
    const pais = git(local, ["rev-list", "--parents", "-n", "1", "origin/main"]).split(" ");
    expect(pais.slice(1), "o commit da reivindicação não foi construído sobre a base").toEqual([baseInicial]);
  });

  it("a branch de PR de quem chamou fica EXATAMENTE onde estava — ninguém a rebaseou", () => {
    const antes = git(local, ["log", "--oneline", "minha-frente-de-pr"]);
    const trabalhoAntes = git(local, ["rev-parse", "minha-frente-de-pr~0", "minha-frente-de-pr~1"]);

    const { code, saida } = rodarReivindicar(local, [
      "abrir",
      "--branch", "main",
      "--frente", "frente que nasce em branch de PR",
      "--responsabilidade", "frente-em-branch-de-pr",
      "--arquivos", "lib/algo-da-frente.ts",
    ]);
    expect(code, saida).toBe(0);

    // O commit do registro entra no topo da branch (é o registro local, que
    // viaja no PR de quem abriu) — e os commits de trabalho que já estavam lá
    // continuam os MESMOS SHAs. Rebase teria reescrito todos eles.
    const depois = git(local, ["log", "--oneline", "minha-frente-de-pr"]);
    expect(depois).toContain("trabalho 1 da frente");
    expect(depois).toContain("trabalho 2 da frente");
    expect(depois.split("\n")).toHaveLength(antes.split("\n").length + 1);
    expect(
      git(local, ["rev-parse", "minha-frente-de-pr~1", "minha-frente-de-pr~2"]),
      "os commits de trabalho mudaram de SHA — o comando de coordenação rebaseou o PR de quem o chamou",
    ).toBe(trabalhoAntes);

    // E o trabalho continua no disco, intocado.
    expect(readFileSync(join(local, "trabalho-1.ts"), "utf8")).toContain("primeira parte da frente");
  });

  it("🔒 a MESMA régua, alimentada com o HEAD da branch — o que o mecanismo antigo empurrava — continua RECUSANDO", () => {
    // Esta é a metade que não pode afrouxar, medida sobre um `git log` REAL do
    // repositório de teste, não sobre uma fixture escrita à mão.
    const abertura = rodarReivindicar(local, [
      "abrir",
      "--branch", "main",
      "--frente", "frente que nasce em branch de PR",
      "--responsabilidade", "frente-em-branch-de-pr",
      "--arquivos", "lib/algo-da-frente.ts",
    ]);
    expect(abertura.code, abertura.saida).toBe(0);
    git(local, ["fetch", "origin", "main"]);

    // O que o push levaria SE ele voltasse a empurrar o HEAD da branch de PR.
    const seFosseOHead = git(local, ["log", "--oneline", "origin/main..minha-frente-de-pr"]);
    const veredito = soLevaAReivindicacao(oQuePushCarrega(seFosseOHead));

    expect(
      veredito.pode,
      "a guarda deixou passar o caso que ela existe para barrar — empurrar o HEAD levaria o trabalho da branch",
    ).toBe(false);
    if (veredito.pode) return;
    expect(veredito.motivo).toContain("2 commits");
    expect(veredito.motivo).toContain("sem PR e sem CI");
    // E ela NOMEIA o que teria ido de carona — recusa muda não ensina ninguém.
    expect(veredito.motivo).toContain("trabalho 1 da frente");
    expect(veredito.motivo).toContain("trabalho 2 da frente");

    // …enquanto o objeto que o comando de fato empurrou passa, porque não leva
    // carona nenhuma. As duas metades, lado a lado, sobre o mesmo repositório.
    const oQueDeFatoSubiu = git(local, ["log", "--oneline", `${baseInicial}..origin/main`]);
    expect(soLevaAReivindicacao(oQuePushCarrega(oQueDeFatoSubiu)).pode).toBe(true);
  });
});

// ── A CORRIDA: A BASE ANDA ENTRE O FETCH E O PUSH ───────────────────────────
//
// Aqui morava um `git pull --rebase origin <branch de coordenação>`. Ele fazia
// sentido enquanto o que subia era o HEAD (para empurrar o HEAD, ele precisa
// descender do remoto). Com `abrir`/`encerrar` rodando de dentro de branches de
// PR, esse rebase reescreveria o PR de quem chamou — todos os SHAs do trabalho
// dele — para conseguir empurrar UM arquivo de registro.
//
// O commit da reivindicação não precisa de rebase: ele é construído sobre a
// base. Se a base andou, constrói-se sobre a base nova. Este teste força a
// corrida de propósito, com um gancho `pre-receive` que RECUSA o primeiro push e
// move `main` por baixo (fora da quarentena de objetos, senão o git proíbe o
// update-ref) — e cobra as três coisas que não podem quebrar.
describe("a base andou por baixo — reconstrói sobre a base nova, não rebaseia", () => {
  it("o commit da outra sessão é PRESERVADO, a reivindicação sobe em cima dele, e o PR fica intacto", () => {
    // Um commit "de outra sessão" pronto no remoto, num branch auxiliar: o
    // gancho só troca uma ref, sem criar objeto nenhum (dentro do gancho o git
    // proíbe escrever objetos fora da quarentena).
    git(local, ["checkout", "-b", "parada", "main"]);
    writeFileSync(join(local, "de-outra-sessao.txt"), "trabalho que ja estava la\n", "utf8");
    git(local, ["add", "de-outra-sessao.txt"]);
    git(local, ["commit", "-m", "outra sessao avancou a branch"]);
    git(local, ["push", "origin", "parada"]);
    git(local, ["checkout", "minha-frente-de-pr"]);
    git(local, ["branch", "-D", "parada"]);

    const gancho = join(remoto, "hooks", "pre-receive");
    writeFileSync(
      gancho,
      [
        "#!/bin/sh",
        'if [ -f "$GIT_DIR/ja-correu" ]; then exit 0; fi',
        'touch "$GIT_DIR/ja-correu"',
        "env -u GIT_QUARANTINE_PATH -u GIT_OBJECT_DIRECTORY -u GIT_ALTERNATE_OBJECT_DIRECTORIES \\",
        "  git update-ref refs/heads/main refs/heads/parada",
        "exit 1",
        "",
      ].join("\n"),
      "utf8",
    );
    chmodSync(gancho, 0o755);

    const { code, saida } = rodarReivindicar(local, [
      "abrir",
      "--branch", "main",
      "--frente", "frente que pega a branch andando",
      "--responsabilidade", "frente-na-corrida",
      "--arquivos", "lib/algo-da-frente.ts",
    ]);

    expect(code, saida).toBe(0);
    expect(saida).toContain("Reconstruindo o commit sobre a base nova");

    git(local, ["fetch", "origin", "main"]);
    const historico = git(local, ["log", "--oneline", "origin/main"]);

    // 1. O trabalho da outra sessão continua lá — reconstruir não é sobrescrever.
    expect(
      historico,
      "a reconstrução apagou o commit que a outra sessão tinha acabado de empurrar",
    ).toContain("outra sessao avancou a branch");
    expect(git(local, ["ls-tree", "-r", "--name-only", "origin/main"])).toContain("de-outra-sessao.txt");

    // 2. E a reivindicação chegou, em cima da base NOVA.
    expect(historico).toContain("reivindica: frente que pega a branch andando");
    const pais = git(local, ["rev-list", "--parents", "-n", "1", "origin/main"]).split(" ");
    expect(pais.slice(1)).toEqual([git(local, ["rev-parse", "origin/main~1"])]);

    // 3. E o PR de quem chamou não foi tocado: os SHAs do trabalho são os mesmos.
    expect(git(local, ["log", "--oneline", "minha-frente-de-pr"])).toContain("trabalho 1 da frente");
    expect(git(local, ["ls-tree", "-r", "--name-only", "origin/main"])).not.toContain("trabalho-1.ts");
  });
});
