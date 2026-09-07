// A REIVINDICAÇÃO EMPURRA SÓ O COMMIT DELA — e a RECUSA é o mecanismo.
//
// ═══ O INCIDENTE (28/08/2026) ══════════════════════════════════════════════
//
// `npm run reivindicar -- encerrar` levou QUATRO commits de um PR aberto direto
// para a branch de deploy — sem PR, sem CI, sem revisão. A linha culpada:
//
//   git push --no-verify origin HEAD:<branch>
//
// `HEAD:` empurra tudo o que o HEAD tem e o remoto não. O trabalho era bom e
// nada quebrou — **foi sorte, não desenho.**
//
// ⚠️ ESTES TESTES EXERCITAM A RECUSA, NÃO O CAMINHO FELIZ. Uma trava só existe
// se ela recusa: um teste que só prova "quando está tudo certo, passa" descreve
// o comportamento normal e não mede a trava nenhuma vez. Foi por isso que uma
// mutação sobreviveu nesta casa hoje de manhã, e a lição está aplicada aqui.

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { oQuePushCarrega, soLevaAReivindicacao } from "@/lib/coordenacao/so-o-commit-da-reivindicacao";

describe("o portão do push da reivindicação", () => {
  it("🔒 RECUSA quando há commits além da reivindicação — o incidente de 28/08", () => {
    const v = soLevaAReivindicacao({
      commitsAlemDaReivindicacao: 4,
      titulos: [
        "a1b2c3 O fio entre a rota e a sala ganha teste",
        "d4e5f6 O parceiro para de ser perguntado sobre verba",
        "789abc reivindica: Ligar a parceria à sala",
        "def012 tsc pegou o SocialScope sem platforms",
      ],
      mediu: true,
    });
    expect(v.pode, "o portão deixou passar exatamente o caso que ele existe para barrar").toBe(false);
    if (v.pode) return;
    // A recusa DIZ o que teria acontecido — recusa muda não ensina ninguém.
    expect(v.motivo).toContain("4 commits");
    expect(v.motivo).toContain("sem PR e sem CI");
    // E diz a saída, em comando colável.
    expect(v.motivo).toContain("git checkout -B");
    // E promete o que importa para quem foi barrado: nada do trabalho se perde.
    expect(v.motivo).toMatch(/nada foi tocado|fica onde está/i);
  });

  it("🔒 RECUSA por UM commit só — não há limiar de tolerância", () => {
    const v = soLevaAReivindicacao({ commitsAlemDaReivindicacao: 1, titulos: ["a1 qualquer coisa"], mediu: true });
    expect(v.pode).toBe(false);
    // Singular, não "1 commits": a recusa é lida por gente.
    if (!v.pode) expect(v.motivo).toContain("1 commit que");
  });

  it("⛔ RECUSA quando NÃO CONSEGUIU MEDIR — 'não sei' nunca vira 'então vai'", () => {
    const v = soLevaAReivindicacao({ commitsAlemDaReivindicacao: 0, mediu: false });
    expect(
      v.pode,
      "a leitura falhou e o portão liberou assim mesmo — fail-OPEN é o pior desenho possível numa trava",
    ).toBe(false);
    if (!v.pode) expect(v.motivo).toContain("não consegui medir");
  });

  it("⛔ e RECUSA mesmo com contagem zero, se a medição não aconteceu", () => {
    // O caso traiçoeiro: zero por padrão de struct, não por medição. Se o
    // portão olhasse só o número, este passaria.
    const v = soLevaAReivindicacao({ commitsAlemDaReivindicacao: 0, titulos: [], mediu: false });
    expect(v.pode).toBe(false);
  });

  it("✅ LIBERA no caso legítimo: worktree de agente, nada além da reivindicação", () => {
    // A premissa original do comando, e ela continua valendo: branch privada
    // cujo HEAD só carrega o commit da reivindicação.
    const v = soLevaAReivindicacao({ commitsAlemDaReivindicacao: 0, titulos: [], mediu: true });
    expect(v.pode, "o portão barrou o uso normal — a trava virou parede").toBe(true);
  });

  it("a recusa cita no máximo 5 commits — mensagem que ninguém lê não protege", () => {
    const muitos = Array.from({ length: 40 }, (_, i) => `sha${i} commit número ${i}`);
    const v = soLevaAReivindicacao({ commitsAlemDaReivindicacao: 40, titulos: muitos, mediu: true });
    expect(v.pode).toBe(false);
    if (v.pode) return;
    expect(v.motivo).toContain("40 commits");
    expect(v.motivo).toContain("commit número 4");
    expect(v.motivo, "despejou os 40 na tela").not.toContain("commit número 6");
  });

  it("sem títulos, ainda recusa e ainda explica", () => {
    // `titulos` é opcional: quem chama pode não ter conseguido a lista, e a
    // recusa não pode depender dela.
    const v = soLevaAReivindicacao({ commitsAlemDaReivindicacao: 2, mediu: true });
    expect(v.pode).toBe(false);
    if (!v.pode) expect(v.motivo).toContain("2 commits");
  });
});

// ── O QUE SE MEDE, E POR QUE ISSO ERA METADE DO DEFEITO (30/08/2026) ────────
//
// A régua acima nunca esteve errada. Errada estava a PERGUNTA que a casca fazia
// antes de consultá-la: `git log origin/<branch>..HEAD` responde "quanto o meu
// BRANCH tem a mais que o deploy", não "o que este PUSH carrega". Enquanto o
// push era o HEAD, as duas frases coincidiam. Quando o push passou a levar um
// commit construído sobre a base, elas se separaram — e medir o branch barrava
// toda frente nascida em branch de PR, `encerrar` inclusive.
describe("o que o push carrega — a leitura do `git log`, agora pura", () => {
  it("🔒 a carona continua sendo contada e NOMEADA — o caso de 28/08 inteiro", () => {
    // A saída real de `git log --oneline origin/<base>..<branch de PR>`: o
    // commit da reivindicação no topo, o trabalho da branch embaixo.
    const estado = oQuePushCarrega(
      [
        "aaa1111 reivindica: uma frente qualquer",
        "bbb2222 trabalho 2 da frente",
        "ccc3333 trabalho 1 da frente",
      ].join("\n"),
    );
    expect(estado.mediu).toBe(true);
    expect(estado.commitsAlemDaReivindicacao).toBe(2);

    const v = soLevaAReivindicacao(estado);
    expect(v.pode, "a carona passou — é o incidente de 28/08 outra vez").toBe(false);
    if (v.pode) return;
    expect(v.motivo).toContain("2 commits");
    expect(v.motivo).toContain("trabalho 1 da frente");
  });

  it("✅ só o commit da reivindicação: zero carona — o push que o conserto constrói", () => {
    const estado = oQuePushCarrega("aaa1111 reivindica: uma frente qualquer");
    expect(estado.commitsAlemDaReivindicacao).toBe(0);
    expect(soLevaAReivindicacao(estado).pode).toBe(true);
  });

  it("push que não move nada também é zero carona", () => {
    expect(oQuePushCarrega("").commitsAlemDaReivindicacao).toBe(0);
    expect(soLevaAReivindicacao(oQuePushCarrega("")).pode).toBe(true);
  });

  it("⛔ `null` (o `git log` falhou) é fail-CLOSED, nunca zero", () => {
    const estado = oQuePushCarrega(null);
    expect(
      estado.mediu,
      "leitura falha virou medição bem-sucedida com contagem zero — o pior desenho possível numa trava",
    ).toBe(false);
    expect(soLevaAReivindicacao(estado).pode).toBe(false);
  });

  it("linhas em branco e espaço solto não viram commit fantasma", () => {
    // MUTAÇÃO QUE PROVA: tire o `.filter(Boolean)` e o "\n" final do `git log`
    // vira um commit a mais — a guarda barraria o caminho legítimo.
    expect(oQuePushCarrega("aaa1111 reivindica: x\n").commitsAlemDaReivindicacao).toBe(0);
    expect(oQuePushCarrega("  aaa1111 reivindica: x  \n\n").commitsAlemDaReivindicacao).toBe(0);
  });
});

// ── QUEM CHAMA ISTO? — o elo, e por que ele é guarda de texto ───────────────
//
// 🚩 DECLARADO: isto é GUARDA ESTRUTURAL, não execução. `scripts/reivindicar.mts`
// é um executável que opera sobre o repositório REAL (`RAIZ` é a raiz deste
// repo) e faz `git push` de verdade. Não há como exercitá-lo numa suíte sem
// apontá-lo para um repo de mentira — refatoração maior do que o conserto que
// ele está recebendo, e não é hora.
//
// O que este bloco garante é o que a noite de 28/08 ensinou: a régua existir e
// **ninguém chamar** é o defeito, não a exceção. Ele falha se alguém remover a
// chamada, inverter a ordem, ou trazer o `HEAD:` de volta.
describe("o script CHAMA o portão — e na ordem certa", () => {
  const fonte = fs.readFileSync(path.join(process.cwd(), "scripts/reivindicar.mts"), "utf8");

  it("o portão existe, chama a régua, e é CHAMADO pelos dois comandos", () => {
    expect(fonte).toContain("so-o-commit-da-reivindicacao");
    // A régua pura, dentro do portão do script.
    expect(
      /function exigirQueOPushSoLeveAReivindicacao[\s\S]{0,400}soLevaAReivindicacao\(/.test(fonte),
      "o portão parou de consultar a régua",
    ).toBe(true);
    // E o portão é chamado — na pré-escrita de `abrir` e de `encerrar` (via
    // `exigirBaseDeCoordenacaoLegivel`), antes do push e na retentativa.
    const chamadas = (fonte.match(/exigirQueOPushSoLeveAReivindicacao\(/g) ?? []).length;
    expect(
      chamadas,
      "o portão foi escrito e ninguém o chama — exatamente o defeito que ele conserta",
    ).toBeGreaterThanOrEqual(4); // a definição + 3 chamadas, no mínimo
    const preEscrita = (fonte.match(/^\s*exigirBaseDeCoordenacaoLegivel\(branch\);/gm) ?? []).length;
    expect(preEscrita, "`abrir` ou `encerrar` deixou de conferir antes de escrever").toBeGreaterThanOrEqual(2);
  });

  it("⛔ o `HEAD:<branch>` NÃO voltou — é a linha que causou o incidente", () => {
    expect(
      /push[^\n]*HEAD:\$\{branch\}/.test(fonte),
      "`HEAD:${branch}` está de volta no push: ele empurra tudo o que o HEAD tiver",
    ).toBe(false);
    expect(fonte).toContain("`${sha}:${branch}`");
  });

  // ── 30/08/2026 — O `${sha}:` AINDA ERA `HEAD:` COM OUTRO NOME ─────────────
  //
  // Empurrar um SHA empurra TODOS OS ANCESTRAIS dele. Enquanto esse `sha` fosse
  // `git rev-parse HEAD`, `${sha}:${branch}` carregava o branch inteiro
  // exatamente como `HEAD:${branch}` — a única coisa que impedia o estrago era
  // a guarda RECUSAR o push, o que também barrava quem tinha razão (frente que
  // nasce em branch de PR). O conserto tornou a promessa ESTRUTURAL: o objeto
  // empurrado é construído sobre `origin/<branch>` e não tem ancestral nenhum
  // do branch de quem chamou.
  //
  // MUTAÇÃO QUE PROVA: troque a chamada a `construirCommitSoDaReivindicacao`
  // dentro de `construirOPushDaReivindicacao` por qualquer forma de
  // "o SHA do HEAD" e este `it()` cai — junto com os cinco de
  // `reivindicacao-em-branch-de-pr.test.ts`, que medem o efeito no remoto.
  //
  // ⚠️ A PRIMEIRA VERSÃO DESTE `it()` SOBREVIVEU À MUTAÇÃO. Ela proibia a
  // grafia exata `git(["rev-parse", "HEAD"])`, e a mutação usou `gitOuNulo`.
  // Régua que casa com UMA GRAFIA do defeito não mede o defeito, mede a grafia
  // — é a lição que este arquivo já carrega no cabeçalho, reaparecendo dentro
  // dele. Agora a régua exige o ELO POSITIVO (quem alimenta o push) em vez de
  // tentar enumerar as maneiras de escrever o errado.
  it("⛔ o que sobe é CONSTRUÍDO sobre `origin/<branch>` — não o SHA do HEAD", () => {
    // O elo: o que alimenta o push é o commit construído, e nada mais.
    expect(
      /const construirOPushDaReivindicacao = \(\): string => \{\s*const sha = construirCommitSoDaReivindicacao\(branch, caminhoRelativo, mensagem\);/.test(fonte),
      "o objeto empurrado deixou de ser o commit construído sobre a base",
    ).toBe(true);
    // …e as duas atribuições de `sha` (a primeira e a da retentativa) saem DELE.
    const atribuicoes = fonte.match(/^\s*(?:let |)sha = [^;]+;/gm) ?? [];
    expect(atribuicoes.length, "as atribuições de `sha` mudaram de forma").toBe(2);
    for (const linha of atribuicoes) {
      expect(
        linha,
        `o push voltou a levar outra coisa que não o commit construído: ${linha.trim()}`,
      ).toContain("construirOPushDaReivindicacao()");
    }

    // O commit nasce de plumbing, com `origin/<branch>` como único pai.
    expect(fonte).toContain('gitOuNulo(["commit-tree", arvore, "-p", base, "-m", mensagem])');
    expect(fonte).toContain('gitOuNulo(["rev-parse", "--verify", `origin/${branch}^{commit}`])');
    // E `git commit-tree` recebe a ÁRVORE do índice temporário — não o HEAD.
    expect(fonte).toContain("GIT_INDEX_FILE: indiceTemporario");
  });

  it("⚠️ a guarda mede a REF QUE SOBE, não o branch de quem chamou", () => {
    // Foi medir `origin/<branch>..HEAD` que colou duas perguntas diferentes e
    // barrou toda frente nascida em branch de PR — inclusive o `encerrar`, que
    // é a saída legítima de uma colisão. Ver o cabeçalho de
    // `__tests__/coordenacao/reivindicacao-em-branch-de-pr.test.ts`.
    expect(
      /origin\/\$\{branch\}\.\.HEAD/.test(fonte),
      "a guarda voltou a medir o HEAD: frente em branch de PR não consegue mais se registrar nem se encerrar",
    ).toBe(false);
    expect(fonte).toContain("`origin/${branch}..${refDoPush}`");
    // E a interpretação da medição mora na régua PURA, não na casca.
    expect(fonte).toContain("oQuePushCarrega(");
  });

  it("⛔ o push NÃO rebaseia a branch de quem chamou", () => {
    // O `git pull --rebase origin <branch de coordenação>` da retentativa fazia
    // sentido enquanto o que subia era o HEAD. Com `abrir`/`encerrar` rodando de
    // dentro de branches de PR, ele reescreveria o PR de quem chamou para
    // empurrar UM arquivo de registro. Se a base andou, reconstrói-se o commit.
    expect(
      /"pull", "--rebase"/.test(fonte),
      "o rebase voltou: um comando de coordenação não reorganiza o trabalho de quem o chama",
    ).toBe(false);
  });

  it("⛔ o commit usa `--only` — o ÍNDICE era a segunda porta", () => {
    // Medido em 28/08 exercitando o próprio conserto: sem `--only`, o que
    // estivesse staged subia junto com a reivindicação, para o deploy.
    expect(
      /git\(\["commit", "--only", "-m", mensagem, "--", caminhoRelativo\]\)/.test(fonte),
      "o commit voltou a levar tudo o que estiver no índice, não só a reivindicação",
    ).toBe(true);
  });

  it("⚠️ o portão roda ANTES de escrever o arquivo — a recusa promete que nada foi tocado", () => {
    // Cada `writeFileSync` de reivindicação tem de ter o portão ANTES dele.
    for (const marca of [
      "writeFileSync(caminhoAbsoluto,",
      "writeFileSync(join(RAIZ, caminhoRelativo),",
    ]) {
      const ondeEscreve = fonte.indexOf(marca);
      expect(ondeEscreve, `não achei a escrita: ${marca}`).toBeGreaterThan(-1);
      const antes = fonte.slice(Math.max(0, ondeEscreve - 400), ondeEscreve);
      expect(
        antes.includes("exigirBaseDeCoordenacaoLegivel(branch);"),
        `a escrita "${marca}" ficou sem o portão antes dela — a recusa passaria a mentir`,
      ).toBe(true);
    }
  });

  it("cada recusa descreve o momento CERTO — a trava não pode mentir sobre o próprio efeito", () => {
    // A ficha B1 é sobre uma recusa que dizia "nada foi escrito" com o arquivo
    // já no disco. Por isso `oQueJaAconteceu` é PARÂMETRO: a frase é escrita por
    // quem chama, que sabe em que ponto da operação está.
    expect(
      /function exigirQueOPushSoLeveAReivindicacao\(estado: EstadoDoPush, oQueJaAconteceu: string\)/.test(fonte),
      "a recusa voltou a ter uma frase fixa — em algum ponto de chamada ela vai mentir",
    ).toBe(true);
    // A pré-escrita é a única que pode prometer que o disco está intocado.
    expect(fonte).toContain("(nada foi escrito, commitado ou empurrado — o disco está como estava.)");
    // Depois de escrever, a recusa diz a verdade sobre o arquivo…
    expect(fonte).toContain("(o arquivo está no disco; nada foi commitado nem empurrado.)");
    // …e depois de commitar, sobre o commit.
    expect(fonte).toContain("(o commit local do registro existe no seu branch; NADA foi empurrado.)");
  });

  it("a recusa INTERROMPE o processo — não é aviso impresso", () => {
    const bloco = fonte.slice(
      fonte.indexOf("function exigirQueOPushSoLeveAReivindicacao"),
      fonte.indexOf("function exigirQueOPushSoLeveAReivindicacao") + 1200,
    );
    expect(
      /process\.exit\(1\)/.test(bloco),
      "a recusa virou aviso: aviso não trava nada, e prompt é sugestão",
    ).toBe(true);
  });

  it("o `--no-verify` que ficou tem justificativa escrita no arquivo", () => {
    // O Diretor Geral autorizou tirá-lo OU justificá-lo no código. Ele fica: o
    // deadlock de 16/08 é real — o gancho chama `conferir`, que barraria o push
    // pela própria reivindicação que ele está empurrando.
    expect(fonte).toContain("--no-verify");
    expect(
      /deadlock|gancho pre-push chama/.test(fonte),
      "o --no-verify ficou sem a justificativa escrita que o autoriza",
    ).toBe(true);
  });
});
