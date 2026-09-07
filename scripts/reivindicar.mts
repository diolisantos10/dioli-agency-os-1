/**
 * A trava de reivindicação — a CLI que descobre ANTES do `git pull --rebase`.
 *
 *     npm run reivindicar -- abrir --frente "<frase>" \
 *       --responsabilidade <slug> --arquivos <a,b,c> \
 *       [--rotulo "<apelido-legível>"] \
 *       [--forcar --motivo "<texto>"] [--mesmo-com-trabalho-em-andamento] \
 *       [--aceitar-identidade-degradada --motivo-identidade-degradada "<texto>"]
 *     npm run reivindicar -- conferir
 *     npm run reivindicar -- encerrar --responsabilidade <slug>
 *     npm run reivindicar -- listar
 *     npm run reivindicar -- instalar-gancho [--silencioso]
 *
 * ── POR QUE ISTO EXISTE (16/08/2026) ────────────────────────────────────────
 * Três frentes foram construídas EM DOBRO no mesmo dia, por chats cegos uns
 * para os outros: `parse_error` do SDR (dois commits, um descartado),
 * "verba declarada vs estimativa" (dois módulos, DOIS arquivos, mesma
 * responsabilidade — os dois ainda estão na branch) e o e-mail de "orçamento
 * pronto" (colisão em 4 arquivos). A doutrina já mandava "escreva a
 * reivindicação, commite antes de começar" desde 02/08. Isto vira mecanismo.
 *
 * A régua de colisão mora em `lib/coordenacao/reivindicacoes.ts` — pura, sem
 * I/O. Este script é só a casca: fala com o git e com o disco.
 *
 * ── A ÚNICA FONTE QUE DUAS SESSÕES ISOLADAS COMPARTILHAM É O REMOTO ────────
 * Por isso `abrir` e `conferir` sempre começam com `git fetch origin <branch>`
 * e leem `origin/<branch>:reivindicacoes/` — nunca o working tree local, que
 * pode estar desatualizado sem ninguém perceber.
 *
 * ── DECISÃO DE DESENHO: HEAD local vs. branch de coordenação ────────────────
 * Worktrees de agente rodam em branches próprias (`worktree-agent-<hash>`),
 * mas TODA sessão precisa coordenar contra o mesmo lugar — senão a trava não
 * trava nada. Por isso o padrão de fetch/leitura/push NÃO é
 * `git rev-parse --abbrev-ref HEAD` (que devolveria a branch privada do
 * worktree): é a branch de deploy, sempre, a menos que `--branch` diga outra.
 * O HEAD local só é usado para o COMMIT em si (`git commit`) e para o
 * `git push origin HEAD:<branch>` — o commit nasce onde a sessão está, mas
 * pousa sempre no mesmo lugar.
 *
 * ── FALSO NEGATIVO MEDIDO EM 16/08/2026 (RODADA 4) — IDENTIDADE PASSA A SER
 * DERIVADA, NUNCA DECLARADA ──────────────────────────────────────────────────
 * As três rodadas anteriores (ver o bloco "Identidade da sessão", abaixo)
 * tentaram consertar identidade DECLARADA — `--quem <id>` digitado, gravado
 * em arquivo ou em `git config`, e OBEDECIDO. Isso quebrou de um jeito pior
 * do que qualquer bug anterior: uma sessão copiou, sem pensar, o `--quem
 * pm-XXXX` sugerido pela PRÓPRIA mensagem de aviso do comando para "confirmar
 * identidade herdada" — e o "pm-XXXX" era de OUTRA sessão. O comando passou a
 * tratar essa identidade alheia como CONFIÁVEL, e `conferir` aprovou ("✅ Sem
 * colisão…") uma mudança que pisava em cima de uma reivindicação VIVA de
 * outra sessão. Falso positivo (barrar por engano) é barulhento e barato —
 * quem lê o erro perde um minuto. FALSO NEGATIVO (aprovar por engano) é
 * SILENCIOSO: ninguém percebe até o `git pull --rebase` de outra sessão
 * encontrar o estrago, exatamente o caso que esta trava existe para matar.
 *
 * A causa raiz, em uma frase: um ID digitado é uma DECLARAÇÃO NÃO VERIFICADA,
 * e o código antigo passava a CONFIAR nela só porque alguém a escreveu. A
 * partir de agora a identidade não é mais escrita por ninguém — é CALCULADA
 * a partir do caminho absoluto do worktree (`descobrirAncoraDeSessao` +
 * `derivarIdentidade`, abaixo).
 * Ninguém digita, então ninguém digita errado; dois worktrees têm caminhos
 * diferentes, então não há como herdar a identidade de outro. `--quem` (e o
 * arquivo `.dioli-quem`) sobrevivem só como RÓTULO legível para gente — nunca
 * mais como prova de posse. Detalhe completo no bloco abaixo.
 */

import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  calcularAncoraDeSessao,
  caminhosDeSchemaSemModelo,
  caminhosDoStatusPorcelain,
  conferirColisao,
  derivarIdentidade,
  estaViva,
  nomeDoArquivo,
  normalizarCaminho,
  normalizarResponsabilidade,
  validarReivindicacao,
  type AncoraDeSessao,
  type Reivindicacao,
} from "../lib/coordenacao/reivindicacoes.ts";
import { lerReivindicacoesDoDisco } from "../lib/coordenacao/leitura-do-registro.ts";
import {
  vereditoDoPortao, refsDaEntradaPadrao, PASTA_QUE_PASSA_DIRETO,
} from "../lib/coordenacao/portao-de-push.ts";
import { soLevaAReivindicacao } from "../lib/coordenacao/so-o-commit-da-reivindicacao.ts";

// RAIZ é sempre o repositório real onde este arquivo vive — SALVO quando um
// teste automatizado pede explicitamente, via REIVINDICAR_RAIZ_DE_TESTE, para
// apontar para um repositório git TEMPORÁRIO e descartável. Só variável de
// ambiente, nunca argumento de linha de comando — ninguém digita isto por
// engano, só um teste define. Em produção a variável não existe, e o
// comportamento é idêntico ao de antes desta linha.
//
// ── POR QUE ISTO PRECISOU EXISTIR (29/08/2026, ficha B1) ───────────────────
// Sem isto, NENHUM teste consegue rodar `scripts/reivindicar.mts` COMO
// PROCESSO — que é o único jeito de provar ORDEM de execução (escrita antes
// ou depois da guarda), em vez de só ler o código e confiar que a ordem que
// os olhos veem é a ordem que o processo de fato executa. `cwd: RAIZ` é usado
// em TODO comando git deste arquivo; sem um jeito de trocar RAIZ, testar a
// guarda de verdade exigiria rodar o script contra ESTE repositório — o que
// `__tests__/coordenacao/encerrar-com-tree-sujo.test.ts` já registrou como
// inaceitável (teste automatizado nunca escreve/empurra no repositório real).
const RAIZ = process.env.REIVINDICAR_RAIZ_DE_TESTE
  ? resolve(process.env.REIVINDICAR_RAIZ_DE_TESTE)
  : resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PASTA_REIVINDICACOES = join(RAIZ, "reivindicacoes");

/** Onde o RÓTULO (não a identidade — ver o bloco "Identidade da sessão",
 *  abaixo) fica em cache, DENTRO do worktree. A partir da rodada 4
 *  (16/08/2026) este arquivo não decide mais posse de nada: a identidade é
 *  sempre CALCULADA (`descobrirAncoraDeSessao()` + `derivarIdentidade()`), nunca lida daqui. Formato
 *  NOVO, uma linha só — o rótulo. Se o arquivo estiver no formato ANTIGO
 *  (duas linhas: identidade declarada + caminho do worktree, das rodadas 2 e
 *  3), ele é reconhecido, IGNORADO para qualquer decisão e o motivo é
 *  avisado — nunca lido como se ainda valesse. */
const CAMINHO_IDENTIDADE = join(RAIZ, ".dioli-quem");

/** A branch que TODAS as sessões — inclusive as de worktree — compartilham.
 *  Ver o bloco "DECISÃO DE DESENHO" no cabeçalho do arquivo. */
const BRANCH_DE_COORDENACAO_PADRAO = "claude/dioli-agency-os-architecture-kk7kp";

// ─────────────────────────────────────────────────────────────────────────
// Leitura de argumentos — `--nome valor` (espaço), não `--nome=valor`, para
// casar com os exemplos da própria ficha de despacho.
// ─────────────────────────────────────────────────────────────────────────

function pegarArg(argv: string[], nome: string): string | null {
  const i = argv.indexOf(`--${nome}`);
  if (i === -1) return null;
  const v = argv[i + 1];
  if (v === undefined || v.startsWith("--")) return "";
  return v;
}

function temFlag(argv: string[], nome: string): boolean {
  return argv.includes(`--${nome}`);
}

function branchAlvo(argv: string[]): string {
  return pegarArg(argv, "branch") || BRANCH_DE_COORDENACAO_PADRAO;
}

// ─────────────────────────────────────────────────────────────────────────
// A casca do git — tudo que fala com o remoto ou grava commit vive aqui.
// ─────────────────────────────────────────────────────────────────────────

function git(args: string[]): string {
  return execFileSync("git", args, { cwd: RAIZ, encoding: "utf8" }).trim();
}

function gitOuNulo(args: string[]): string | null {
  try {
    return execFileSync("git", args, { cwd: RAIZ, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch {
    return null;
  }
}

/**
 * QUANTOS COMMITS ESTE BRANCH LEVARIA ALÉM DA REIVINDICAÇÃO?
 *
 * Mede contra `origin/<branch>` DEPOIS do fetch que `abrir`/`encerrar` já
 * fizeram. Falhou a leitura → `mediu: false`, e a régua recusa: *"não sei o que
 * iria junto" nunca vira "então vai"*.
 */
function medirOQuePushLevaria(branch: string): { commitsAlemDaReivindicacao: number; titulos: string[]; mediu: boolean } {
  const bruto = gitOuNulo(["log", "--oneline", `origin/${branch}..HEAD`]);
  if (bruto === null) return { commitsAlemDaReivindicacao: 0, titulos: [], mediu: false };
  const titulos = bruto.split("\n").map((l) => l.trim()).filter(Boolean);
  return { commitsAlemDaReivindicacao: titulos.length, titulos, mediu: true };
}

/**
 * O PORTÃO, COMO OS COMANDOS O CHAMAM — e ele roda ANTES de tocar o disco.
 *
 * ⚠️ A POSIÇÃO É METADE DO CONSERTO. A primeira versão conferia dentro de
 * `commitarEEmpurrar`, que roda DEPOIS do `writeFileSync` — a recusa saía com a
 * frase "o disco está como estava" e **o arquivo já estava lá**. Medido
 * exercitando o comando de verdade, não lendo o código: a recusa mentia.
 *
 * Recusa que mente sobre o próprio efeito é pior que recusa nenhuma — quem lê
 * confia e não limpa. Agora ela roda antes de escrever, e a frase é verdade.
 */
function exigirBranchAlinhado(branch: string): void {
  const veredito = soLevaAReivindicacao(medirOQuePushLevaria(branch));
  if (veredito.pode) return;
  // ⚠️ IMPRIME E SAI, no padrão das outras recusas deste arquivo (🚫 +
  // `process.exit(1)`) — e NÃO `throw`. Medido exercitando: o `try/catch` de
  // `comandoAbrir` só envolve `commitarEEmpurrar`, então um `throw` daqui subia
  // como STACK TRACE de Node na cara de quem rodou o comando. Recusa que sai
  // como stack não é lida: ela parece defeito da ferramenta, não decisão dela.
  console.error(`🚫 reivindicação NÃO empurrada: ${veredito.motivo}`);
  console.error("   (nada foi escrito, commitado ou empurrado — o disco está como estava.)");
  process.exit(1);
}

/** `git fetch origin <branch>` — o primeiro passo de `abrir` e `conferir`,
 *  porque conferir só o disco local não descobre nada sobre a OUTRA sessão. */
function buscarRemoto(branch: string): { ok: true } | { ok: false; erro: string } {
  try {
    execFileSync("git", ["fetch", "origin", branch], { cwd: RAIZ, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : String(e) };
  }
}

/** Lê e valida as reivindicações que estão em `origin/<branch>:reivindicacoes/`
 *  — nunca o working tree, que pode estar velho sem ninguém perceber. Pasta
 *  ausente no remoto (repositório recém-criado) devolve lista vazia. */
function lerReivindicacoesRemotas(branch: string): Reivindicacao[] {
  const listagem = gitOuNulo(["ls-tree", "-r", "--name-only", `origin/${branch}`, "--", "reivindicacoes"]);
  if (listagem === null) {
    throw new Error(`não consegui listar "reivindicacoes/" em origin/${branch}. A branch existe no remoto?`);
  }
  const arquivos = listagem
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.endsWith(".json"));

  return arquivos.map((caminho) => {
    const conteudo = git(["show", `origin/${branch}:${caminho}`]);
    let bruto: unknown;
    try {
      bruto = JSON.parse(conteudo);
    } catch (e) {
      throw new Error(`${caminho}: JSON malformado em origin/${branch} (${e instanceof Error ? e.message : String(e)}).`);
    }
    return validarReivindicacao(bruto, caminho);
  });
}

/** O formato que `execFileSync` lança quando o processo falha e `stdio` tem
 *  `pipe` em stdout/stderr: além de `message`, o erro carrega `stdout` e
 *  `stderr` como string (porque passamos `encoding: "utf8"`). */
type ErroDeProcesso = { message?: string; stdout?: string; stderr?: string };

/** Traduz a falha do `git pull --rebase` na causa REAL, medida na saída do
 *  próprio git — nunca advinhada. Antes deste conserto, TODA falha de rebase
 *  virava "provável outra sessão pegou a mesma responsabilidade", mesmo
 *  quando a causa era trivial (working tree sujo no PRÓPRIO worktree, sem
 *  nenhuma outra sessão envolvida). Trava que diagnostica errado ensina quem
 *  lê a desconfiar dela — e trava em que ninguém confia é trava que some.
 *
 *  `comandoParaRepetir` é a linha EXATA, pronta para colar, que refaz o
 *  comando que estava rodando quando o rebase falhou — FURO 3, ponto 1, do
 *  laudo de qualidade da rodada 5: antes, esta mensagem sempre dizia "rode
 *  'npm run reivindicar -- abrir' de novo", inclusive quando quem estava
 *  rodando era `encerrar` — mandando quem estava ENCERRANDO para o comando
 *  ERRADO. Quem chama (`commitarEEmpurrar`) já sabe se é `abrir` ou
 *  `encerrar`; é ela quem decide o texto certo. */
function diagnosticarFalhaDoRebase(erro: unknown, branch: string, comandoParaRepetir: string): string {
  const bruto = erro as ErroDeProcesso;
  const saida = `${bruto.stderr ?? ""}\n${bruto.stdout ?? ""}`.trim();
  const detalhe = saida || (erro instanceof Error ? erro.message : String(erro));
  const comumATodas =
    `O commit local ainda existe; resolva à mão ("git rebase --abort" desfaz) e rode "${comandoParaRepetir}" de novo depois.`;

  // (a) O git recusa "pull --rebase" com working tree sujo — isto acontece no
  // PRÓPRIO worktree, sem nenhuma outra sessão por perto. É a causa mais
  // comum e a mais fácil de confirmar sem adivinhar nada.
  if (/cannot pull with rebase/i.test(detalhe) || /you have unstaged changes/i.test(detalhe) || /error: your local changes/i.test(detalhe)) {
    return (
      `"git pull --rebase origin ${branch}" falhou porque HÁ TRABALHO NÃO COMMITADO no seu próprio worktree — ` +
      `isto NÃO é colisão com outra sessão. Commite (ou "git stash") o que está solto e rode "${comandoParaRepetir}" de novo. ` +
      `Detalhe: ${detalhe}`
    );
  }

  // (b) Conflito de merge de verdade — aqui sim pode ser outra sessão mexendo
  // no MESMO arquivo, porque o rebase chegou a tentar aplicar o commit e as
  // duas versões não conciliam.
  if (/CONFLICT/i.test(detalhe)) {
    return (
      `"git pull --rebase origin ${branch}" falhou com CONFLITO DE VERDADE (provável outra sessão na mesma responsabilidade). ${comumATodas} ` +
      `Detalhe: ${detalhe}`
    );
  }

  // (c) Qualquer outra causa: mostramos a saída crua em vez de inventar um
  // motivo. Regra da casa — nunca afirmar causa que não foi medida.
  return (
    `"git pull --rebase origin ${branch}" falhou por um motivo que não reconheço — mostrando a saída crua em vez de adivinhar causa. ${comumATodas} ` +
    `Detalhe: ${detalhe}`
  );
}

/** Escreve o arquivo local da reivindicação, `git add` + `git commit`, e
 *  tenta o `git push`. Se o push falhar por a branch remota ter andado,
 *  reconfere a colisão contra o estado NOVO do remoto antes de repetir —
 *  nunca empurra às cegas depois de um rebase. */
function commitarEEmpurrar(
  caminhoRelativo: string,
  mensagem: string,
  branch: string,
  nova: Pick<Reivindicacao, "quem" | "responsabilidade" | "arquivos">,
  // Propaga o `--forcar` original para a reconferência pós-rebase. Sem isto,
  // uma sessão que forçou de propósito e precisou rebasear por uma corrida
  // seria barrada na retentativa mesmo tendo decidido, com motivo registrado,
  // seguir apesar da colisão — o force perderia efeito no pior momento.
  permitirColisaoNaReconferencia = false,
  // A linha EXATA para colar caso o rebase falhe — ver o comentário grande em
  // `diagnosticarFalhaDoRebase` (FURO 3, ponto 1): `abrir` e `encerrar`
  // precisam de comandos DIFERENTES aqui, e só quem chamou sabe qual é.
  comandoParaRepetir: string,
  // ── DEFEITO 1 (medido em 16/08/2026, EXERCITANDO o comando de verdade —
  // não lendo o código) ────────────────────────────────────────────────────
  // A mensagem de colisão por esquema antigo (`explicarEsquemaAntigo`, acima)
  // manda quem foi barrado rodar "encerrar" e depois "abrir" de novo, NO MEIO
  // do próprio trabalho. Isso é correto — mas quando o `git push` direto é
  // recusado (a branch andou) e este passo tenta `git pull --rebase`, o git
  // RECUSA rebasear com o working tree sujo, mesmo que a sujeira não tenha
  // NADA a ver com o arquivo da reivindicação. `abrir` já tem um escape
  // explícito para isso (`--mesmo-com-trabalho-em-andamento`, conferido ANTES
  // de escrever qualquer coisa) — `encerrar` não tinha NENHUM, e por
  // definição quem chama "encerrar" está no meio do trabalho: a saída
  // recomendada batia numa segunda parede, exatamente para o único público
  // que ela existe para ajudar.
  //   A escolha de desenho: NÃO copiar o escape explícito do `abrir`
  // (`--algo-em-andamento`) para o `encerrar`. "Encerrar" não toma posse nem
  // escreve código — é o ato MENOS perigoso do comando inteiro (só REMOVE uma
  // reivindicação já registrada); pedir uma flag de confirmação para o ato
  // menos arriscado reintroduz a MESMA fricção que se está consertando, só
  // adiada por um passo — e ninguém além do próprio autor da reivindicação
  // consegue encerrá-la de qualquer forma (`comandoEncerrar` só localiza pelo
  // slug da responsabilidade). Em vez disso, o `git pull --rebase` deste
  // passo roda com `rebase.autoStash=true` quando `autostashNoRebase` é
  // verdadeiro: o git GUARDA (stash) o que está solto, rebaseia, e DEVOLVE
  // (pop) automaticamente — sem exigir tree limpo e sem perder nada do
  // trabalho em andamento. Isto ataca a CAUSA (rebase exige tree limpo) em
  // vez de pedir para quem chama provar, de novo, que sabe o que está
  // fazendo.
  //   Só `encerrar` passa `true` aqui — `abrir` nunca passa, e continua
  // exigindo tree limpo (ou `--mesmo-com-trabalho-em-andamento` explícito)
  // ANTES de commitar: `abrir` está TOMANDO POSSE de uma frente nova, e é lá
  // que o rigor pertence. Isto não afrouxa a COLISÃO em si — a reconferência
  // contra o remoto atualizado, logo abaixo, roda exatamente igual, com ou
  // sem autostash.
  autostashNoRebase = false,
): void {
  // ═══ SEGUNDA TRAVA (28/08/2026) ══════════════════════════════════════════
  //
  // `abrir` e `encerrar` já chamaram `exigirBranchAlinhado` ANTES de escrever o
  // arquivo — é lá que a recusa é barata e honesta. Esta aqui existe porque um
  // caminho novo pode chegar a este ponto sem passar por lá, e o dano deste
  // ponto em diante é irreversível: um push para o deploy não se desfaz.
  // Duas travas para o mesmo dano, de propósito.
  exigirBranchAlinhado(branch);

  git(["add", caminhoRelativo]);
  // ⛔ `--only <caminho>` — MEDIDO EM 28/08/2026, EXERCITANDO O COMANDO.
  //
  // `git commit -m` sem `--only` commita **tudo o que estiver no index**, não só
  // o que este comando adicionou. Provando o conserto do push, o próprio
  // conserto (dois arquivos que eu tinha deixado staged) subiu junto com a
  // reivindicação, para o deploy, sem PR e sem CI — a MESMA família do defeito
  // que este arquivo está consertando, um andar abaixo.
  //
  // O portão do push conferia COMMITS além da base e via zero, corretamente: o
  // vazamento não estava nos commits, estava no ÍNDICE. Duas portas, e eu só
  // tinha fechado uma.
  //
  // `--only` faz o commit conter exatamente os caminhos nomeados, ignorando o
  // resto do index — e o que estava staged continua staged, intocado.
  git(["commit", "--only", "-m", mensagem, "--", caminhoRelativo]);

  // `--no-verify` É DELIBERADO — não é atalho, é o CONSERTO do deadlock medido
  // em 16/08/2026. Sem ele, este push aciona o gancho pre-push, que roda
  // "conferir", que por sua vez lê a MESMA responsabilidade que este comando
  // acabou de gravar/encerrar — e pode barrar o push PELA PRÓPRIA
  // reivindicação que ele está tentando empurrar. Isto já aconteceu: um "pm"
  // fez tudo certo (abriu antes de trabalhar) e ficou trancado, porque
  // "encerrar" só sai por push, e o push estava barrado pelo gancho que o
  // próprio "encerrar" ia disparar.
  //   A conferência de colisão contra o remoto já rodou, linhas acima
  // (`conferirColisao` em `abrir`, ou a leitura de `existentes` em
  // `encerrar`) — pedir para o gancho conferir de NOVO é conferência dupla, e
  // conferência dupla contra o próprio commit que a gente está tentando subir
  // só pode dar falso positivo. `abrir` já recusou colisão ANTES de escrever
  // qualquer coisa; `encerrar` só REMOVE reivindicação, nunca adiciona risco.
  // Nenhum dos dois precisa do gancho para se auto-policiar.
  // ⛔ O SHA DO COMMIT, NUNCA `HEAD:` — defesa em profundidade.
  //
  // O portão acima já garantiu que não há mais nada no branch; empurrar o SHA
  // garante que, se um dia o portão falhar ou for contornado, o que sobe ainda
  // é UM commit nomeado, e não "tudo o que o HEAD tiver". Duas travas para o
  // mesmo dano, de propósito: esta linha é a que não depende de ninguém ter
  // medido nada.
  //
  // ⚠️ `--no-verify` FICA, e a justificativa é a de sempre (deadlock medido em
  // 16/08: o gancho pre-push chama `conferir`, que lê a MESMA responsabilidade
  // que este comando acabou de gravar, e barra o push pela própria
  // reivindicação que ele está empurrando). O que mudou é que ele deixou de ser
  // a ÚNICA defesa: antes, desligar o gancho era desligar tudo; agora o portão
  // acima roda sempre, e ele é mais preciso que o gancho para este risco
  // específico — o gancho confere COLISÃO, não o que o push carrega.
  const tentarPush = () => {
    const sha = git(["rev-parse", "HEAD"]);
    return execFileSync("git", ["push", "--no-verify", "origin", `${sha}:${branch}`], { cwd: RAIZ, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  };

  try {
    tentarPush();
    return;
  } catch {
    console.log(`   push recusado — a branch ${branch} andou. Rebaseando…`);
  }

  try {
    // Ver o comentário grande no parâmetro `autostashNoRebase`, acima
    // (DEFEITO 1): só `encerrar` pede autostash — `abrir` continua exigindo
    // tree limpo antes de chegar até aqui.
    const argsDoRebase = autostashNoRebase
      ? ["-c", "rebase.autoStash=true", "pull", "--rebase", "origin", branch]
      : ["pull", "--rebase", "origin", branch];
    execFileSync("git", argsDoRebase, { cwd: RAIZ, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    throw new Error(diagnosticarFalhaDoRebase(e, branch, comandoParaRepetir));
  }

  // Depois do rebase, reconfere contra o remoto ATUALIZADO — de novo, `git
  // fetch` primeiro, porque o rebase só trouxe o que já estava no remoto NO
  // MOMENTO do fetch anterior; alguém pode ter empurrado de novo enquanto o
  // rebase rodava.
  const busca = buscarRemoto(branch);
  if (!busca.ok) {
    throw new Error(`rebase deu certo mas não consegui reconferir o remoto antes de empurrar de novo (${busca.erro}). Nada foi empurrado — rode de novo.`);
  }
  // `conferirColisao` já ignora reivindicações do mesmo `quem` — inclusive a
  // que estamos abrindo/encerrando agora, se por algum motivo ela já tiver
  // chegado ao remoto entre o fetch anterior e este. Não precisa filtro extra.
  const existentesAgora = lerReivindicacoesRemotas(branch);
  const reconferencia = conferirColisao(nova, existentesAgora, new Date());
  if (reconferencia.colide && !permitirColisaoNaReconferencia) {
    throw new Error(
      `depois do rebase, a reivindicação colide com quem chegou primeiro:\n` + reconferencia.motivos.map((m) => `   - ${m}`).join("\n") + `\nNada foi empurrado.`,
    );
  }
  if (reconferencia.colide && permitirColisaoNaReconferencia) {
    console.log("   ⚠️  ainda colide depois do rebase, mas --forcar segue valendo — empurrando mesmo assim.");
  }

  tentarPush();
}

// ─────────────────────────────────────────────────────────────────────────
// Identidade da sessão — DERIVADA, não persistida, não declarada
// ─────────────────────────────────────────────────────────────────────────
//
// HISTÓRICO CURTO (16/08/2026, três rodadas de conserto — todas em cima de
// identidade DECLARADA):
//   Rodada 1 — gravar "quem sou eu" em `git config --local dioli.quem`.
//   Rodada 2 — `git config` é compartilhado por TODOS os worktrees do mesmo
//     git-common-dir; a gravação migrou para ".dioli-quem", um arquivo DENTRO
//     de cada worktree.
//   Rodada 3 — mesmo ".dioli-quem" podia conter identidade de OUTRO worktree
//     (copiado, herdado, ou escrito por código anterior à marca de origem);
//     a leitura passou a exigir que o caminho gravado batesse com o worktree
//     atual, e tratava qualquer coisa que não batesse como "suspeita".
//
// RODADA 4 (o falso negativo que matou a abordagem inteira): mesmo com toda
// a suspeita da rodada 3, o comando ainda IMPRIMIA a linha
// "--quem pm-XXXX" como sugestão de "confirme se isto é você" — e uma
// sessão colou essa linha sem checar de quem era o "pm-XXXX". Ao fazer isso,
// ela GRAVOU a identidade de outra sessão como CONFIÁVEL, e "conferir" passou
// a comparar colisão usando o "quem" ERRADO: aprovou ("Sem colisão…") uma
// mudança que pisava numa reivindicação VIVA de outra sessão. Nenhuma
// quantidade de aviso resolve isto, porque o defeito não está no AVISO — está
// em existir, em algum lugar do sistema, um caminho onde uma STRING DIGITADA
// vira "prova de quem eu sou". Enquanto esse caminho existir, alguém vai
// segui-lo sem pensar, e a trava vai aprovar o que devia barrar — em
// silêncio, que é o pior jeito de falhar aqui: falso positivo (barrar por
// engano) custa um minuto relendo o erro; falso negativo (aprovar por
// engano) só aparece quando a OUTRA sessão descobre o estrago no próprio
// "git pull --rebase".
//
// A SAÍDA: a identidade deixa de ser QUALQUER FORMA de declaração — digitada,
// gravada em arquivo ou em git config — e passa a ser CALCULADA, sempre, a
// partir do único dado que já identifica a sessão sem que ninguém precise
// dizer nada: o CAMINHO ABSOLUTO deste worktree (RAIZ). Ver
// `derivarIdentidade()`, logo abaixo. Três propriedades, todas consequência
// direta de ser uma função pura de RAIZ, nenhuma delas alcançável por
// declaração:
//   • DETERMINÍSTICA — o mesmo worktree sempre calcula o mesmo valor, então
//     "conferir" enxerga como "minhas" exatamente as reivindicações que EU
//     abri, sem precisar de cache, arquivo nem flag para isso funcionar;
//   • IMPOSSÍVEL DE HERDAR — dois worktrees têm RAIZ diferente por
//     definição (é o próprio conceito de worktree), logo o hash é diferente;
//     não existe "copiar a identidade de outra sessão" quando não existe
//     campo nenhum para copiar PARA;
//   • IMPOSSÍVEL DE DIGITAR ERRADO — ninguém digita. Não há flag que defina
//     "quem", não há arquivo que precise bater formato, não há "confirme se
//     isto é você" para copiar sem ler.
//
// O que sobra de "--quem" e de ".dioli-quem" é só CONVENIÊNCIA PARA GENTE
// LER — um RÓTULO ("rotulo"), gravado ao lado da identidade na reivindicação,
// jamais comparado por "conferirColisao". Rótulo errado no pior caso confunde
// quem LÊ o "listar"; identidade errada no pior caso derruba a trava inteira.
// São problemas de gravidade completamente diferentes, e por isso só um dos
// dois precisa de mecanismo — o outro (o rótulo) pode continuar sendo texto
// livre, sem verificação nenhuma, porque o pior que ele causa é cosmético.
//
// "git config dioli.quem" (rodada 1) e o formato ANTIGO de ".dioli-quem"
// (rodadas 2 e 3, duas linhas: identidade + caminho do worktree) continuam
// podendo existir em disco, escritos por sessões de antes desta rodada. Os
// dois são só VESTÍGIO agora: nenhum dos dois é lido para decidir posse —
// "avisarSeGitConfigVestigio()" e "lerRotuloDoCache()", abaixo, tratam os
// dois como texto morto, e avisam (sem apagar sozinhos: o vestígio pode
// pertencer a uma sessão ainda viva).
//
// E as reivindicações JÁ GRAVADAS no remoto, no formato ANTIGO de "quem"
// (ex.: "pm-a27b5772", declarado à mão) não quebram nada: uma identidade
// DERIVADA (ex.: "wt-3f2a91bc4d") nunca vai, por acaso, ser igual a uma
// string que uma pessoa digitou — então essas reivindicações antigas
// simplesmente nunca serão reconhecidas como "minhas" por ninguém. Isto é o
// lado SEGURO do não-reconhecimento: ele faz a trava BARRAR uma colisão que
// talvez já não exista de verdade (falso positivo, barulhento e barato),
// nunca APROVAR uma que existe (falso negativo, silencioso e caro — o
// próprio bug desta rodada). Nenhum erro de leitura, nenhuma migração
// necessária: o formato antigo é só um "quem" que não bate com nada.
// ─────────────────────────────────────────────────────────────────────────
//
// ── RODADA 5 (16/08/2026) — A RODADA 4 RESOLVEU WORKTREE. FALTAVA SESSÃO. ──
// A rodada 4 derivava a identidade só de RAIZ (o caminho absoluto do
// worktree). Isso resolve "dois worktrees não se confundem" — mas esta casa
// roda VÁRIAS SESSÕES no MESMO worktree (o worktree principal,
// "/home/user/diolidigital", é compartilhado por várias conversas ao mesmo
// tempo). Medido em disco em 16/08/2026, no MESMO dia da rodada 4:
//
//   - reivindicacoes/seguranca-reset-habilitado-denuncia.json, aberta
//     19:46, quem = "wt-09f81bb764";
//   - reivindicacoes/coordenacao-identidade-por-sessao.json, aberta 20:03,
//     de uma sessão DIFERENTE, quem = "wt-09f81bb764" — o MESMO valor.
//
// Duas sessões distintas, identidade idêntica: o falso negativo que o
// próprio cabeçalho deste arquivo já chamava de "pior caso" — elas não
// colidiriam entre si e construiriam a mesma frente em dobro, exatamente o
// estrago que fez esta trava nascer. E, pelo lado oposto, às 19:37 uma
// sessão foi BARRADA pela PRÓPRIA reivindicação ("já reivindicado por
// pm-defeitos-do-ceo", sendo ELA MESMA pm-defeitos-do-ceo) porque
// ".dioli-quem" — arquivo ÚNICO no worktree — tinha sido sobrescrito por
// OUTRA sessão no mesmo disco. As duas faces são o mesmo defeito: a
// identidade da rodada 4 enxergava o WORKTREE, não a SESSÃO.
//
// A SAÍDA: sem voltar a aceitar nada DECLARADO (isso já matou as rodadas
// 1-3 — ver acima), soma-se à derivação uma ÂNCORA DE SESSÃO descoberta no
// ambiente, nunca digitada por ninguém:
//
//   1. CLAUDE_CODE_SESSION_ID (variável de ambiente, uuid) — estável
//      durante a sessão inteira. Fonte preferida: já é a identidade da
//      sessão, ninguém precisa inventar nada em cima dela.
//   2. Se ausente: CLAUDE_PID (o PID do processo da sessão) combinado com
//      o starttime (campo 22 de "/proc/<pid>/stat") do MESMO processo — o
//      starttime carimba o PID contra reuso (um PID pode ser reciclado
//      pelo SO depois que o processo morre; sem o carimbo, uma sessão nova
//      que reaproveitasse o mesmo PID de uma sessão antiga já encerrada
//      herdaria a identidade dela por acidente).
//   3. Se nenhum dos dois existir (rodando fora do Claude Code — CI, dev
//      humano no terminal): NÃO HÁ como distinguir sessões neste ambiente.
//      A identidade cai para o modo DEGRADADO da rodada 4 (só RAIZ, prefixo
//      "wt-") — mas a degradação é sempre AVISADA em voz alta na saída do
//      comando, nunca silenciosa (ver "descobrirAncoraDeSessao", abaixo, e
//      "comandoAbrir"/"comandoConferir", que decidem o que fazer com o
//      aviso — ver o laudo de qualidade da rodada 5, FURO 1). Silêncio aqui
//      reintroduziria o falso negativo desta rodada sem ninguém saber que
//      voltou.
//
// A função PURA ("derivarIdentidade", em "lib/coordenacao/reivindicacoes.ts")
// só recebe a âncora já pronta — nenhuma leitura de env, "/proc" ou git
// dentro dela. A régua que INTERPRETA env/`/proc` já lidos ("calcularAncoraDeSessao")
// também é pura e mora no mesmo módulo — só a LEITURA de fato (I/O) fica
// aqui, em "descobrirAncoraDeSessao" e "starttimeDoProcesso". O prefixo do
// resultado ("ses-" com âncora, "wt-" sem) deixa o modo visível em qualquer
// "listar" — nunca é preciso adivinhar qual dos dois foi usado.
// ─────────────────────────────────────────────────────────────────────────

// `AncoraDeSessao` e a régua que decide os três ramos (sessão / pid+starttime
// / degradado) moram em `lib/coordenacao/reivindicacoes.ts`
// (`calcularAncoraDeSessao`) — módulo puro, testável sem processo real. Este
// arquivo só faz a LEITURA de I/O (env, `/proc`) e repassa para a régua. Ver
// FURO 4 do laudo de qualidade da rodada 5: antes desta separação, nenhum
// teste exercitava os três ramos porque a leitura e a régua estavam
// misturadas na mesma função.

/** Campo 22 de `/proc/<pid>/stat` (starttime), contando os campos como o
 *  kernel documenta. O formato do arquivo é
 *  "<pid> (<comm>) <state> <ppid> ... <starttime> ..." — e `<comm>` (o nome
 *  do processo) PODE conter espaços e até parênteses, então não dá para
 *  simplesmente fazer `split(" ")` no conteúdo inteiro: corta-se depois do
 *  ÚLTIMO ")", que é sempre o fim de `<comm>` por definição do próprio
 *  kernel (ele escapa parênteses internos do nome do processo). Depois do
 *  corte, o campo 3 (`state`) vira o índice 0; o campo 22 (`starttime`) cai
 *  no índice 19 (22 − 3). Devolve `null` se o arquivo não existir, não for
 *  legível (SO sem `/proc`, ex.: macOS/Windows) ou tiver formato inesperado —
 *  nunca lança, porque isto é só UMA das fontes possíveis de âncora, não a
 *  única, e quem chama já sabe cair para o modo degradado se isto faltar. */
function starttimeDoProcesso(pid: number): string | null {
  try {
    const conteudo = readFileSync(`/proc/${pid}/stat`, "utf8");
    const apósComm = conteudo.slice(conteudo.lastIndexOf(")") + 2);
    const campos = apósComm.trim().split(/\s+/);
    const starttime = campos[19];
    return starttime && starttime.length > 0 ? starttime : null;
  } catch {
    return null;
  }
}

/** Descobre a âncora de SESSÃO no ambiente — a peça que faltava na rodada 4
 *  (que só olhava para `RAIZ`, o worktree). Casca fina de I/O: lê
 *  `process.env` e repassa `starttimeDoProcesso` (a única leitura de `/proc`)
 *  para `calcularAncoraDeSessao` (a régua, pura, em
 *  `lib/coordenacao/reivindicacoes.ts`) decidir os três ramos. Chamar esta
 *  função várias vezes na MESMA sessão sempre devolve o MESMO valor, porque
 *  nem o env nem o `/proc/<pid>/stat` do próprio processo mudam durante a
 *  vida da sessão — é essa propriedade que faz "abrir", "conferir" e
 *  "encerrar", chamados em momentos diferentes, reconhecerem a mesma
 *  reivindicação como "minha". */
function descobrirAncoraDeSessao(): AncoraDeSessao {
  return calcularAncoraDeSessao({
    sessionId: process.env.CLAUDE_CODE_SESSION_ID ?? null,
    pidBruto: process.env.CLAUDE_PID ?? null,
    starttimeDoPid: starttimeDoProcesso,
  });
}

/** A linha que LIMPA "git config dioli.quem" — vestígio da rodada 1. Só é
 *  IMPRESSA, nunca EXECUTADA por este script: a chave mora no
 *  git-common-dir e é vista por TODOS os worktrees que o compartilham — pode
 *  pertencer a uma sessão ainda viva, e apagar estado alheio sem pedir não é
 *  o tipo de conveniência que esta casa aceita. Quem decide apagar é sempre
 *  a pessoa, lendo o aviso. */
function linhaParaLimparGitConfig(): string {
  return "git config --unset dioli.quem";
}

/** Se "git config dioli.quem" (rodada 1, vestígio) ainda existir, avisa —
 *  uma vez, curto — que ela não é mais lida para NADA: a identidade agora é
 *  sempre derivada (`descobrirAncoraDeSessao()` + `derivarIdentidade()`). Não apaga sozinho: pode ser de
 *  outra sessão viva. Chamado no início de todo subcomando que faz sentido
 *  avisar (abrir e conferir — os dois que decidem posse). */
function avisarSeGitConfigVestigio(): void {
  const v = gitOuNulo(["config", "--get", "dioli.quem"]);
  if (!v || !v.trim()) return;
  console.warn(
    "⚠️  Achei \"git config dioli.quem\" = \"" + v.trim() + "\" — vestígio de um mecanismo antigo de identidade " +
      "DECLARADA. Ele não é mais lido para nada: a identidade agora é sempre DERIVADA do caminho do worktree. Se " +
      "tiver certeza de que não pertence a uma sessão ainda viva, limpe com:",
  );
  console.warn("   " + linhaParaLimparGitConfig());
}

/**
 * O RÓTULO — texto livre, só para gente ler, nunca comparado para decidir
 * posse (ver o bloco acima). Resolvido nesta ordem:
 *   (a) "--rotulo <texto>", se foi dado;
 *   (b) "--quem <texto>" (nome ANTIGO da flag, de antes da rodada 4) —
 *       aceito por compatibilidade, mas avisa que deixou de definir
 *       identidade e vira só rótulo;
 *   (c) nenhum dos dois: null — reivindicar sem rótulo é válido, a
 *       identidade sozinha (`descobrirAncoraDeSessao()` + `derivarIdentidade()`) já basta para tudo que
 *       importa de verdade.
 */
function pegarRotulo(argv: string[]): string | null {
  const doRotulo = pegarArg(argv, "rotulo");
  if (doRotulo) return doRotulo;

  const doQuemLegado = pegarArg(argv, "quem");
  if (doQuemLegado) {
    console.warn(
      "⚠️  \"--quem\" não define mais identidade (ver \"Identidade da sessão\", no topo deste arquivo) — a " +
        "identidade agora é sempre DERIVADA do caminho do worktree. Usando \"" + doQuemLegado + "\" como RÓTULO " +
        "legível, não como posse. Prefira \"--rotulo\" a partir de agora.",
    );
    return doQuemLegado;
  }

  return null;
}

/** Lê o RÓTULO em cache de ".dioli-quem", se houver. Formato NOVO (uma linha
 *  só) é lido direto. Formato ANTIGO (duas linhas: identidade declarada +
 *  caminho do worktree, das rodadas 2 e 3) é reconhecido, IGNORADO — não
 *  virou rótulo automaticamente, o formato é ambíguo demais para reaproveitar
 *  sem risco — e avisado como vestígio, uma vez. */
function lerRotuloDoCache(): string | null {
  if (!existsSync(CAMINHO_IDENTIDADE)) return null;
  try {
    const linhas = readFileSync(CAMINHO_IDENTIDADE, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (linhas.length === 0) return null;
    if (linhas.length >= 2) {
      console.warn(
        "⚠️  \"" + CAMINHO_IDENTIDADE + "\" está no formato ANTIGO (identidade declarada + caminho do worktree, " +
          "das rodadas 2 e 3) — não decide mais posse nem vira rótulo automaticamente. Ignorando. Pode apagar o " +
          "arquivo à vontade.",
      );
      return null;
    }
    return linhas[0]!;
  } catch {
    return null;
  }
}

/** Grava o RÓTULO em cache — conveniência pura, nunca fonte de posse. Falha
 *  aqui (permissão, disco somente-leitura) NUNCA precisa travar nem avisar
 *  alto: o pior resultado possível é "o próximo listar mostra o worktree
 *  sem apelido", nunca "a trava aprovou uma colisão real" — a diferença de
 *  gravidade que justifica todo este conserto (ver o bloco acima). */
function gravarRotuloDoCache(rotulo: string): void {
  try {
    writeFileSync(CAMINHO_IDENTIDADE, rotulo + "\n", "utf8");
  } catch {
    // silencioso de propósito — ver o comentário da função.
  }
}

// ─────────────────────────────────────────────────────────────────────────
// FURO 2 do laudo de qualidade (rodada 5) — "isto pode ser sua própria
// reivindicação sob esquema antigo"
// ─────────────────────────────────────────────────────────────────────────
//
// No minuto em que a identidade por sessão ("ses-…") passa a valer, TODA
// reivindicação viva gravada sob um esquema ANTIGO — "wt-…" (por worktree,
// rodada 4, sem âncora) ou uma string DIGITADA à mão tipo "pm-defeitos-do-
// ceo" (de antes da rodada 4) — passa a parecer "de outra sessão" para quem
// a abriu: a identidade dela mudou de baixo dos pés, e "conferirColisao" só
// enxerga "quem" bater ou não bater, nunca "é a mesma pessoa sob outro
// esquema". Sem esta mensagem, o dono de cada uma seria barrado pela
// PRÓPRIA reivindicação — exatamente o sintoma que a rodada 5 existe para
// matar, repetido no ato de corrigi-lo.
//
// "encerrar" não confere `quem` (ver `comandoEncerrar`, abaixo) — a saída já
// existe: encerrar sob o nome antigo, reabrir sob o novo. O que faltava era
// a MENSAGEM dizer isso, com o comando pronto para colar.

/** Reconhece o ESQUEMA de uma identidade `quem` já gravada no registro —
 *  usado só para MENSAGEM, nunca para decidir posse (isso continua sendo só
 *  `conferirColisao`). Devolve `null` quando o esquema já é o atual
 *  ("ses-…") — aí sim é outra sessão de verdade, sem nada a explicar. */
function explicarEsquemaAntigo(quemExistente: string): string | null {
  if (quemExistente.startsWith("ses-")) return null;
  const esquema = quemExistente.startsWith("wt-")
    ? 'identidade por WORKTREE ("wt-…", rodada 4, 16/08/2026 — sem âncora de sessão)'
    : 'identidade DECLARADA (formato pré-rodada-4, digitada à mão via "--quem")';
  return (
    `"${quemExistente}" é ${esquema}. PODE SER A SUA PRÓPRIA SESSÃO sob o esquema antigo — sua identidade hoje é ` +
    "CALCULADA (nunca digitada) e mudou de valor com a chegada da identidade por sessão. Se a frente listada " +
    'acima é sua, não precisa recomeçar do zero: "encerrar" não confere quem abriu (só o slug da responsabilidade), ' +
    "então dá para encerrar sob o nome antigo e reabrir sob a identidade nova:"
  );
}

/** Monta, para cada `quem` bloqueante que NÃO está no esquema atual, o
 *  parágrafo de `explicarEsquemaAntigo` seguido do par de comandos colável
 *  (encerrar + reabrir) — usando o slug, a frente e os arquivos REAIS da
 *  reivindicação de origem (achada em `existentes`), não da tentativa nova.
 *  Devolve `[]` quando nenhum dos bloqueantes está em esquema antigo. */
function avisosDeEsquemaAntigo(quemColidiu: string[], existentes: Reivindicacao[]): string[] {
  const linhas: string[] = [];
  for (const quem of quemColidiu) {
    const explicacao = explicarEsquemaAntigo(quem);
    if (!explicacao) continue;
    const origem = existentes.find((r) => r.quem === quem && !r.encerradaEm);
    linhas.push(explicacao);
    if (origem) {
      linhas.push(`   npm run reivindicar -- encerrar --responsabilidade ${origem.responsabilidade}`);
      linhas.push(
        `   npm run reivindicar -- abrir --frente "${origem.frente}" --responsabilidade ${origem.responsabilidade} --arquivos ${origem.arquivos.join(",")}`,
      );
    } else {
      // Não deveria acontecer (o `quem` veio de uma colisão contra
      // `existentes` viva) — mas se acontecer, nunca inventa um slug: aponta
      // "listar" em vez de um comando que pode estar errado.
      linhas.push(`   npm run reivindicar -- listar   (para achar o slug exato dessa reivindicação)`);
    }
  }
  return linhas;
}

// ─────────────────────────────────────────────────────────────────────────
// abrir
// ─────────────────────────────────────────────────────────────────────────

/** `git status --porcelain`, devolvendo as LINHAS CRUAS — nunca a saída
 *  inteira passada por `.trim()` antes de dividir por linha (ver DEFEITO 2,
 *  medido em 16/08/2026, e o comentário grande em
 *  `caminhosDoStatusPorcelain`, em `lib/coordenacao/reivindicacoes.ts`:
 *  `.trim()` na string INTEIRA comia o primeiro caractere da PRIMEIRA linha
 *  sempre que o código de status dela começava com espaço — " M", " D" — e
 *  "__tests__/..." virava "_tests__/...", um caminho colável em lugar
 *  nenhum). Aqui só se descarta o '\r' de CRLF e linhas vazias — a régua de
 *  parsing de verdade (o `slice(3)`, o tratamento de renomeio) é pura e mora
 *  em `caminhosDoStatusPorcelain`, testável sem processo de git nenhum. */
function linhasCruasDoStatus(): string[] {
  try {
    const bruto = execFileSync("git", ["status", "--porcelain"], { cwd: RAIZ, encoding: "utf8" });
    return bruto.split("\n");
  } catch {
    return [];
  }
}

/** O que está solto no working tree AGORA — staged, unstaged ou untracked —
 *  ignorando `caminhoIgnorado` (o próprio arquivo de reivindicação que
 *  `abrir` está prestes a escrever; sem o filtro, o comando acusaria a
 *  mudança que ELE MESMO vai fazer). Mesma leitura de `git status
 *  --porcelain` que `arquivosNoWorkingTree` usa para o gancho pre-push. */
function arquivosNaoCommitados(caminhoIgnorado: string): string[] {
  return caminhosDoStatusPorcelain(linhasCruasDoStatus()).filter((caminho) => caminho !== caminhoIgnorado);
}

function comandoAbrir(argv: string[]): void {
  const branch = branchAlvo(argv);
  // `lerRotuloDoCache()` roda SEMPRE (não só quando o valor dela é usado) —
  // é ela quem avisa se ".dioli-quem" está no formato ANTIGO (das rodadas 2
  // e 3), e esse aviso precisa aparecer mesmo quando "--rotulo"/"--quem" já
  // resolveu o valor por outra via.
  const rotuloDoCache = lerRotuloDoCache();
  const rotulo = pegarRotulo(argv) ?? rotuloDoCache ?? undefined;
  const frente = (pegarArg(argv, "frente") || "").trim();
  const responsabilidade = (pegarArg(argv, "responsabilidade") || "").trim();
  const arquivosBrutos = (pegarArg(argv, "arquivos") || "").trim();
  const forcar = temFlag(argv, "forcar");
  const motivo = (pegarArg(argv, "motivo") || "").trim();
  const mesmoComTrabalhoEmAndamento = temFlag(argv, "mesmo-com-trabalho-em-andamento");
  const aceitarIdentidadeDegradada = temFlag(argv, "aceitar-identidade-degradada");
  const motivoIdentidadeDegradada = (pegarArg(argv, "motivo-identidade-degradada") || "").trim();

  if (!frente || !responsabilidade || !arquivosBrutos) {
    console.error(
      'Uso: npm run reivindicar -- abrir --frente "<frase>" --responsabilidade <slug> --arquivos <a,b,c> [--rotulo "<apelido>"]',
    );
    process.exit(1);
  }
  if (forcar && !motivo) {
    console.error('--forcar exige --motivo "<texto>" não vazio. Forçar sem motivo é desligar a trava sem deixar rastro.');
    console.error(`Comando completo:  npm run reivindicar -- abrir --frente "${frente}" --responsabilidade ${responsabilidade} --arquivos ${arquivosBrutos} --forcar --motivo "<por quê>"`);
    process.exit(1);
  }

  // ── PORTA DE ENTRADA (30/08/2026, `.despachos/F3-schema-exige-modelo.md`) ──
  // Exige o MODELO em toda reivindicação NOVA que cite "prisma/schema.prisma"
  // — validação pura sobre os argumentos crus, ANTES de qualquer rede ou
  // disco (ancora de sessão, fetch do remoto, working tree). NÃO é forçável
  // por "--forcar": "--forcar" existe para seguir apesar de uma COLISÃO
  // encontrada contra outra reivindicação viva; isto aqui não é colisão, é
  // formato — o mesmo tipo de exigência que já barra "abrir" sem "--frente"
  // ou sem "--arquivos", acima.
  //   ⛔ Isto NÃO mexe na régua de colisão (`seTocamNoSchema` /
  // `partirCaminhoDeSchema`, em `lib/coordenacao/reivindicacoes.ts`) — as
  // reivindicações JÁ GRAVADAS sem modelo continuam existindo, e continuam
  // sem colidir com nada, exatamente como o despacho F2 deixou. Só a PORTA
  // fecha: quem tenta abrir uma reivindicação NOVA sem modelo é recusado
  // antes de escrever uma linha.
  const arquivosBrutosLista = arquivosBrutos.split(",").map((a) => a.trim()).filter(Boolean);
  const semModelo = caminhosDeSchemaSemModelo(arquivosBrutosLista);
  if (semModelo.length > 0) {
    console.error('🚫 "prisma/schema.prisma" exige o MODELO — não escrevi, commitei nem empurrei nada:');
    for (const c of semModelo) console.error(`   - ${c}`);
    console.error(
      "A colisão do schema é POR MODELO (despacho F2, 30/08/2026): sem o modelo declarado, esta reivindicação " +
        'NÃO colidiria com nada — nem com outra também sem modelo — e sumiria da trava sem avisar ninguém. ' +
        'Diga qual modelo você está mudando, no formato "prisma/schema.prisma#NomeDoModelo".',
    );
    console.error("   Exemplo real: prisma/schema.prisma#ParceriaDoCliente");
    const arquivosCorrigidos = arquivosBrutosLista
      .map((a) => (a === "prisma/schema.prisma" ? "prisma/schema.prisma#<NomeDoModelo>" : a))
      .join(",");
    console.error(
      `Comando corrigido:  npm run reivindicar -- abrir --frente "${frente}" --responsabilidade ${responsabilidade} --arquivos ${arquivosCorrigidos}`,
    );
    process.exit(1);
  }

  // ── FURO 1 do laudo de qualidade (rodada 5): "abrir" em modo DEGRADADO
  // (sem âncora de sessão no ambiente) RECUSA por padrão. "abrir" é TOMAR
  // POSSE — e posse com uma identidade que já produziu os dois falsos
  // negativos medidos em 16/08/2026 (ver o bloco "RODADA 5", acima) não é
  // posse com risco, é posse que não protege nada. Custo de recusar aqui é
  // baixo: quem chama "abrir" ainda não escreveu uma linha — recomeçar não
  // perde trabalho (mesma lógica da assimetria "sem rede", abaixo).
  const infoAncora = descobrirAncoraDeSessao();
  if (infoAncora.degradado && !aceitarIdentidadeDegradada) {
    console.error("🚫 Identidade DEGRADADA neste ambiente — não abro por padrão:");
    console.error(`   ${infoAncora.motivo}`);
    console.error(
      "Abrir em modo degradado significa TOMAR POSSE com uma identidade que já causou falso negativo medido " +
        "(duas sessões, mesmo worktree, mesma identidade — ver o cabeçalho deste arquivo). Se você sabe o que " +
        "está fazendo e aceita o risco, repita com o motivo escrito:",
    );
    console.error(
      `   npm run reivindicar -- abrir --frente "${frente}" --responsabilidade ${responsabilidade} --arquivos ${arquivosBrutos} --aceitar-identidade-degradada --motivo-identidade-degradada "<por quê>"`,
    );
    process.exit(1);
  }
  if (aceitarIdentidadeDegradada && !motivoIdentidadeDegradada) {
    console.error('--aceitar-identidade-degradada exige --motivo-identidade-degradada "<texto>" não vazio. Destravar sem motivo é desligar a proteção sem deixar rastro.');
    console.error(`Comando completo:  npm run reivindicar -- abrir --frente "${frente}" --responsabilidade ${responsabilidade} --arquivos ${arquivosBrutos} --aceitar-identidade-degradada --motivo-identidade-degradada "<por quê>"`);
    process.exit(1);
  }
  if (infoAncora.degradado && aceitarIdentidadeDegradada) {
    console.warn(`⚠️  Seguindo em modo DEGRADADO por decisão explícita. Motivo: "${motivoIdentidadeDegradada}"`);
  }
  // A identidade NUNCA é lida de flag, arquivo ou git config — é sempre
  // CALCULADA (ver o bloco "Identidade da sessão", acima). O único jeito de
  // mudar o RESULTADO é o ambiente oferecer (ou não) uma âncora de sessão —
  // nunca digitar um valor.
  const quem = derivarIdentidade(RAIZ, infoAncora.ancora);

  // A linha EXATA para repetir este mesmo "abrir" — usada tanto na mensagem
  // de colisão quanto se o rebase do push falhar (FURO 3, ponto 1). Monta os
  // MESMOS argumentos usados agora, nunca um comando genérico.
  let comandoParaRepetir = `npm run reivindicar -- abrir --frente "${frente}" --responsabilidade ${responsabilidade} --arquivos ${arquivosBrutos}`;
  if (forcar) comandoParaRepetir += ` --forcar --motivo "${motivo}"`;
  if (aceitarIdentidadeDegradada) comandoParaRepetir += ` --aceitar-identidade-degradada --motivo-identidade-degradada "${motivoIdentidadeDegradada}"`;

  avisarSeGitConfigVestigio();
  // O rótulo é conveniência pura — grava em cache para o próximo comando
  // reaproveitar sem precisar repetir "--rotulo". Nunca decide posse.
  if (rotulo) gravarRotuloDoCache(rotulo);

  // O caminho que este comando está PRESTES a escrever — calculado cedo só
  // para poder ser ignorado na conferência de terreno abaixo.
  const id = normalizarResponsabilidade(responsabilidade);
  const nomeArquivo = nomeDoArquivo(id);
  const caminhoRelativo = join("reivindicacoes", nomeArquivo);

  // ── Conferir o terreno ANTES de escrever ou commitar qualquer coisa ───────
  // Reivindicação se abre ANTES de começar o trabalho: working tree limpo é
  // o estado normal de quem chega para abrir uma frente nova. Hoje "abrir"
  // commitava primeiro e só descobria o problema no push — deixando um
  // commit local órfão (com trabalho alheio embarcado) quando o push falhava.
  // Descobrir terreno sujo AQUI, antes de qualquer escrita, é mais barato do
  // que desfazer um commit depois.
  if (!mesmoComTrabalhoEmAndamento) {
    const soltos = arquivosNaoCommitados(caminhoRelativo);
    if (soltos.length > 0) {
      console.error("🚫 Há mudança não commitada no working tree — não escrevi nem commitei nada:");
      for (const a of soltos) console.error(`   - ${a}`);
      console.error(
        "Reivindicação se abre ANTES de começar o trabalho: working tree limpo é o estado normal. " +
          'Commite ou guarde ("git stash") o que está solto e rode "npm run reivindicar -- abrir" de novo.',
      );
      console.error(
        "Se você sabe o que está fazendo (ex.: reabrindo a reivindicação de um trabalho que já está em andamento), " +
          "repita com --mesmo-com-trabalho-em-andamento.",
      );
      process.exit(1);
    }
  }

  // Reaproveita a mesma lista já separada na porta de entrada, acima — nunca
  // reparte a string duas vezes.
  const arquivos = arquivosBrutosLista;
  const nova = { quem, responsabilidade, arquivos };

  // ── ASSIMETRIA DELIBERADA (ver o espelho desta nota em `comandoConferir`) ──
  // `abrir` falha FECHADO sem rede: sem ler `origin/<branch>:reivindicacoes/`
  // não há como saber se a responsabilidade ou o arquivo já pertencem a outra
  // sessão. Reivindicar às cegas não é "reivindicar com risco" — é uma
  // reivindicação que ninguém mais enxerga, o que é PIOR do que não
  // reivindicar nada: dá a quem abriu a falsa sensação de posse, sem
  // proteger de fato. E o custo de recusar aqui é baixo: quem chama `abrir`
  // ainda não escreveu uma linha de código — recomeçar não perde trabalho.
  console.log(`Buscando origin/${branch}…`);
  const busca = buscarRemoto(branch);
  if (!busca.ok) {
    console.error(`Não consegui alcançar o remoto (${busca.erro}). Sem conferir o remoto, não se reivindica nada — nada foi gravado.`);
    process.exit(1);
  }

  const existentes = lerReivindicacoesRemotas(branch);
  const resultado = conferirColisao(nova, existentes, new Date());

  if (resultado.colide && !forcar) {
    console.error("🚫 Colisão — não gravei nada:");
    for (const m of resultado.motivos) console.error(`   - ${m}`);
    if (resultado.avisos.length) {
      console.error("   (avisos, não bloqueiam):");
      for (const a of resultado.avisos) console.error(`   - ${a}`);
    }
    // FURO 2 do laudo de qualidade (rodada 5) — ver o comentário grande
    // acima de `explicarEsquemaAntigo`.
    for (const linha of avisosDeEsquemaAntigo(resultado.quemColidiu, existentes)) console.error(linha);
    // ── DEFEITO 3 (medido em 16/08/2026, EXERCITANDO o comando de verdade)──
    // A mensagem antiga oferecia SÓ "--forcar", sozinha — a única porta
    // mostrada era a de emergência, e porta de emergência oferecida sozinha
    // ensina a usar a porta de emergência. Mesmo padrão de `comandoConferir`
    // (que já lista as opções, uma por linha, antes de propor forçar): as
    // opções que RESOLVEM a colisão sem contorná-la vêm primeiro
    // ("encerre a frente antiga" e "veja o que está reivindicado"); a que
    // ignora a trava ("--forcar") vem por ÚLTIMO. A colisão em si não muda
    // — nada aqui afrouxa o bloqueio, só a ordem em que as saídas aparecem.
    console.error("Para seguir, uma destas opções:");
    console.error(`   - se a frente já terminou, encerre-a:  npm run reivindicar -- encerrar --responsabilidade <slug-da-frente-listada-acima>`);
    console.error(`   - para ver todas as reivindicações vivas e escolher:  npm run reivindicar -- listar`);
    console.error(`   - se ainda assim precisa seguir apesar da colisão, force com motivo:  npm run reivindicar -- abrir --frente "${frente}" --responsabilidade ${responsabilidade} --arquivos ${arquivosBrutos} --forcar --motivo "<por quê>"`);
    process.exit(1);
  }

  for (const a of resultado.avisos) console.log(`⚠️  ${a}`);

  const agora = new Date();
  const reivindicacao: Reivindicacao = {
    id,
    quem,
    frente,
    responsabilidade,
    arquivos: arquivos.map(normalizarCaminho),
    abertaEm: agora.toISOString(),
    encerradaEm: null,
  };
  if (rotulo) reivindicacao.rotulo = rotulo;
  if (resultado.colide && forcar) {
    reivindicacao.forcadaPor = { quem, motivo, em: agora.toISOString() };
  }
  if (infoAncora.degradado && aceitarIdentidadeDegradada) {
    reivindicacao.degradadaPor = { motivo: motivoIdentidadeDegradada, em: agora.toISOString() };
  }

  mkdirSync(PASTA_REIVINDICACOES, { recursive: true });
  const caminhoAbsoluto = join(PASTA_REIVINDICACOES, nomeArquivo);
  // ⛔ ANTES de escrever: a recusa promete que nada foi tocado, e a promessa
  // tem de ser verdade. Ver `exigirBranchAlinhado`.
  exigirBranchAlinhado(branch);
  writeFileSync(caminhoAbsoluto, `${JSON.stringify(reivindicacao, null, 2)}\n`, "utf8");

  try {
    commitarEEmpurrar(caminhoRelativo, `reivindica: ${frente}`, branch, nova, forcar, comandoParaRepetir);
  } catch (e) {
    console.error(`🚫 ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }

  if (resultado.colide && forcar) {
    console.log(`🚨 REIVINDICAÇÃO FORÇADA por ${quem}, apesar da colisão. Motivo registrado: "${motivo}"`);
  }
  const identificacao = rotulo ? `${quem} (rótulo: ${rotulo})` : quem;
  console.log(`✅ Reivindicado: "${responsabilidade}" por ${identificacao} — ${caminhoRelativo}, empurrado para ${branch}.`);
}

// ─────────────────────────────────────────────────────────────────────────
// conferir — o comando da abertura de turno, e o que o gancho pre-push chama
// ─────────────────────────────────────────────────────────────────────────

/**
 * O que "está no meu working tree", para efeito de conferência. Duas fontes,
 * de propósito:
 *
 *   • `git status --porcelain` — o que ainda não foi commitado (staged,
 *     unstaged, untracked). É o caso de quem está no MEIO de escrever.
 *   • `git diff --name-only origin/<branch>...HEAD` — o que JÁ foi commitado
 *     mas ainda não chegou ao remoto. Este é o caso que importa de verdade
 *     para o gancho pre-push: quando o hook roda, o working tree geralmente
 *     está limpo (tudo já commitado) — só o diff contra o remoto revela o que
 *     está prestes a subir. Sem esta fonte, o gancho ficaria cego bem no
 *     momento em que ele precisa enxergar.
 */
function arquivosNoWorkingTree(branch: string): string[] {
  const doStatus = caminhosDoStatusPorcelain(linhasCruasDoStatus());

  const doDiff = (gitOuNulo(["diff", "--name-only", `origin/${branch}...HEAD`]) ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return Array.from(new Set([...doStatus, ...doDiff]));
}

/**
 * AVISO DE VIZINHANÇA — o único ângulo automático possível contra o pior dos
 * três casos de 16/08/2026: `lib/agency/comercial/verba-declarada.ts` e
 * `lib/agency/comercial/verba-vs-estimativa.ts` respondem à MESMA pergunta
 * comercial, com nomes de ARQUIVO diferentes, e os dois estão na branch. A
 * colisão por sobreposição exata de caminho (`conferirColisao`, acima) NUNCA
 * pegaria este caso — nomes diferentes não se tocam. E não existe mecanismo
 * automático que prove que dois arquivos de nomes distintos respondem à mesma
 * pergunta: só quem declara a responsabilidade sabe.
 *
 * O que dá para fazer sem inventar prova onde não há: quando um arquivo que
 * estou tocando cai no MESMO DIRETÓRIO de um arquivo já reivindicado, vivo,
 * por OUTRA sessão — mesmo sem bater o caminho exato — isto é INDÍCIO, não
 * prova. Por isso é AVISO, e nunca BLOQUEIO: duas frentes legítimas e
 * independentes convivem no mesmo diretório o tempo todo — é assim que
 * trabalho em paralelo acontece nesta casa —, e travar por vizinhança
 * bloquearia exatamente o paralelismo que a régua de sobreposição exata já
 * preserva. O aviso nomeia a outra sessão, a frente dela e a responsabilidade
 * dela, e pergunta na cara: isto responde à mesma pergunta?
 */
function avisosDeVizinhanca(arquivosDaSessao: string[], quem: string, existentes: Reivindicacao[], agora: Date): string[] {
  const avisos: string[] = [];

  const dirDe = (caminho: string): string => {
    const norm = normalizarCaminho(caminho);
    const i = norm.lastIndexOf("/");
    return i === -1 ? "." : norm.slice(0, i);
  };

  // A RAIZ do repositório NUNCA gera aviso de vizinhança. Um arquivo solto na
  // raiz (ex.: "vitest.config.ts") tem diretório ".", e "." é o diretório de
  // TODO arquivo de primeiro nível — package.json, README.md, tsconfig.json,
  // AGENTS.md, CLAUDE.md, dezenas deles, sem relação nenhuma entre si além de
  // estarem no mesmo nível de pasta. Tratar "." como vizinhança real faria
  // QUALQUER mudança na raiz soar vizinha de QUALQUER outra — um aviso que
  // dispara sempre é um aviso que vira ruído de fundo e que ninguém lê mais
  // (o próprio comentário desta função já diz: vizinhança é indício, não
  // prova — mas na raiz nem indício é, porque não distingue nada). Só
  // diretório de verdade (um subdiretório nomeado) carrega indício.
  const ehDiretorioRaiz = (dir: string): boolean => dir === "." || dir === "" || dir === "./";

  const meusDiretorios = new Set(arquivosDaSessao.map(dirDe).filter((d) => !ehDiretorioRaiz(d)));
  const meusArquivosNormalizados = new Set(arquivosDaSessao.map(normalizarCaminho));

  // Um aviso por PAR (outra sessão × responsabilidade dela) — não um por
  // arquivo, para não repetir o mesmo indício dez vezes se dez arquivos meus
  // caírem no mesmo diretório da mesma reivindicação alheia.
  const jaAvisados = new Set<string>();

  for (const existente of existentes) {
    if (existente.quem === quem) continue; // nunca avisa contra a própria sessão
    if (estaViva(existente, agora) !== "viva") continue; // encerrada/velha não gera indício

    for (const arquivoExistente of existente.arquivos) {
      const caminhoExistenteNormalizado = normalizarCaminho(arquivoExistente);
      if (meusArquivosNormalizados.has(caminhoExistenteNormalizado)) continue; // sobreposição exata já é BLOQUEIO em outro lugar — não duplica aviso
      if (!meusDiretorios.has(dirDe(arquivoExistente))) continue;

      const chave = `${existente.quem}|${existente.responsabilidade}`;
      if (jaAvisados.has(chave)) continue;
      jaAvisados.add(chave);

      avisos.push(
        `[vizinhança] você toca "${dirDe(arquivoExistente)}/", onde ${existente.quem} tem reivindicação VIVA ` +
          `— frente: "${existente.frente}", responsabilidade: "${existente.responsabilidade}" (arquivo: "${caminhoExistenteNormalizado}"). ` +
          `Não é sobreposição de arquivo — isto é indício, não prova, e por isso é aviso, não bloqueio. ` +
          `Isto responde à MESMA pergunta que a frente de ${existente.quem}?`,
      );
    }
  }

  return avisos;
}

function comandoConferir(argv: string[]): void {
  const branch = branchAlvo(argv);

  // A identidade é sempre CALCULADA — nunca lida de flag, arquivo ou git
  // config (ver "Identidade da sessão", acima). Não existe mais estado
  // "desconhecido" nem "suspeito": o mesmo worktree calcula sempre o mesmo
  // valor, então "conferir" SEMPRE sabe distinguir "minha reivindicação" de
  // "reivindicação de outra sessão" — inclusive na primeira chamada, sem
  // precisar de "abrir" ter rodado antes, e inclusive dentro do gancho
  // pre-push, que não passa nenhuma flag.
  const infoAncora = descobrirAncoraDeSessao();
  const quem = derivarIdentidade(RAIZ, infoAncora.ancora);

  // ── FURO 1 do laudo de qualidade (rodada 5): "conferir" CONTINUA rodando
  // em modo degradado (é leitura, e é o que o gancho pre-push chama —
  // travar o push de todo mundo seria proteção mais destrutiva que o
  // problema). Mas a degradação deixa de ser um "console.warn" perdido no
  // meio da saída: vira um BLOCO DESTACADO logo aqui (sempre que degradado,
  // não importa o desfecho) — e uma linha na CONCLUSÃO final, abaixo, seja
  // ela "sem colisão" ou "colide".
  if (infoAncora.degradado) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("⚠️  IDENTIDADE DEGRADADA — não distingo SESSÕES neste ambiente (só o worktree).");
    console.error(`   ${infoAncora.motivo}`);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }

  avisarSeGitConfigVestigio();

  console.log(`Buscando origin/${branch}…`);
  const busca = buscarRemoto(branch);
  if (!busca.ok) {
    // ── ASSIMETRIA DELIBERADA (ver o espelho desta nota em `comandoAbrir`) ──
    // `conferir` falha ABERTO sem rede — o oposto de `abrir`, e de propósito.
    // A diferença não é descuido, é QUEM chama e o que já está em jogo:
    // `abrir` ainda não começou nada, recusar não custa trabalho perdido.
    // `conferir` é quem o gancho pre-push chama, DEPOIS de horas de trabalho
    // já commitadas — barrar aqui por falta de REDE (não por colisão real)
    // ensina a pessoa a usar `--no-verify` na primeira vez que a conexão
    // cai, e a partir daí o gancho deixa de proteger qualquer coisa, mesmo
    // nos dias em que a rede volta. Deixar passar sem rede é o único jeito
    // da trava sobreviver ao primeiro dia de conexão ruim.
    console.warn(`⚠️  Não consegui alcançar o remoto (${busca.erro}). Sem rede não dá para conferir — deixando passar.`);
    process.exit(0);
  }

  let existentes: Reivindicacao[];
  try {
    existentes = lerReivindicacoesRemotas(branch);
  } catch (e) {
    console.warn(`⚠️  Remoto alcançável mas o registro não leu (${e instanceof Error ? e.message : String(e)}). Deixando passar — registro quebrado não pode travar todo mundo.`);
    process.exit(0);
  }

  const arquivos = arquivosNoWorkingTree(branch);
  if (arquivos.length === 0) {
    console.log("Nada alterado no working tree. Nada a conferir.");
    process.exit(0);
  }

  // `conferirColisao` também checa "mesma responsabilidade" — aqui só importa
  // ARQUIVO (esta sessão pode nem ter aberto reivindicação ainda). Uma
  // responsabilidade-isca, que não bate com nenhuma reivindicação real, deixa
  // só o canal de arquivo ativo — MESMA régua, sem duplicar lógica.
  const propostaSomenteArquivos = {
    quem,
    responsabilidade: `__conferir-apenas-arquivos__/${Date.now()}`,
    arquivos,
  };
  const resultado = conferirColisao(propostaSomenteArquivos, existentes, new Date());

  for (const a of resultado.avisos) console.log(`⚠️  ${a}`);

  // Aviso de vizinhança — ver o comentário na função. Roda sempre, colidindo
  // ou não: é indício, não bloqueio, então não depende de `resultado.colide`.
  for (const a of avisosDeVizinhanca(arquivos, quem, existentes, new Date())) console.log(`⚠️  ${a}`);

  if (resultado.colide) {
    console.error("🚫 O que você alterou pisa em frente reivindicada por outra sessão:");
    for (const m of resultado.motivos) console.error(`   - ${m}`);

    // FURO 2 do laudo de qualidade (rodada 5) — ver o comentário grande
    // acima de `explicarEsquemaAntigo`: pode ser a PRÓPRIA sessão, sob um
    // "quem" que mudou de esquema.
    for (const linha of avisosDeEsquemaAntigo(resultado.quemColidiu, existentes)) console.error(linha);

    // NENHUM CAMINHO TERMINA EM BECO SEM SAÍDA — toda vez que "conferir"
    // BARRA, a saída termina com as opções concretas e copiáveis. Desde a
    // rodada 4, "gravar identidade" NÃO é mais uma delas: a identidade é
    // sempre a mesma para a MESMA sessão (calculada por worktree + sessão,
    // não só por worktree), então, se isto está barrando E o "quem" já está
    // no esquema atual ("ses-…"), a reivindicação em cima é MESMO de outra
    // sessão — não há "confirmar que sou eu" para tentar de novo.
    console.error("Para seguir, uma destas opções:");
    console.error(`   - se a frente já terminou, encerre-a:  npm run reivindicar -- encerrar --responsabilidade <slug-da-frente-listada-acima>`);
    console.error(`   - se precisa seguir apesar da colisão, force com motivo:  npm run reivindicar -- abrir --frente "<...>" --responsabilidade <slug> --arquivos <a,b,c> --forcar --motivo "<por quê>"`);
    console.error(`   - para ver todas as reivindicações vivas e escolher:  npm run reivindicar -- listar`);
    if (infoAncora.degradado) {
      console.error("⚠️  CONCLUSÃO: identidade degradada — não distingo sessões neste ambiente. Esta checagem só enxerga o worktree, não a sessão.");
    }
    process.exit(1);
  }

  console.log("✅ Sem colisão com reivindicações vivas de outras sessões.");
  if (infoAncora.degradado) {
    console.log("⚠️  CONCLUSÃO: identidade degradada — não distingo sessões neste ambiente. Esta checagem só enxerga o worktree, não a sessão.");
  }
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────────────────
// encerrar
// ─────────────────────────────────────────────────────────────────────────

function comandoEncerrar(argv: string[]): void {
  const branch = branchAlvo(argv);
  const responsabilidade = (pegarArg(argv, "responsabilidade") || "").trim();
  if (!responsabilidade) {
    console.error("Uso: npm run reivindicar -- encerrar --responsabilidade <slug>");
    process.exit(1);
  }
  const id = normalizarResponsabilidade(responsabilidade);

  // A linha EXATA para repetir este "encerrar" — usada abaixo (FURO 3,
  // pontos 2 e 3) e se o rebase do push falhar (FURO 3, ponto 1).
  const comandoParaRepetir = `npm run reivindicar -- encerrar --responsabilidade ${responsabilidade}`;

  console.log(`Buscando origin/${branch}…`);
  const busca = buscarRemoto(branch);
  if (!busca.ok) {
    console.error(`Não consegui alcançar o remoto (${busca.erro}). Nada foi encerrado.`);
    console.error(`Confira a conexão e rode de novo:  ${comandoParaRepetir}`);
    process.exit(1);
  }

  const existentes = lerReivindicacoesRemotas(branch);
  const alvo = existentes.find((r) => r.id === id && !r.encerradaEm);
  if (!alvo) {
    console.error(`Nenhuma reivindicação VIVA com responsabilidade "${responsabilidade}" (normalizada: "${id}") em origin/${branch}.`);
    console.error(`Para ver o slug exato de cada reivindicação viva:  npm run reivindicar -- listar`);
    process.exit(1);
  }

  const encerrada: Reivindicacao = { ...alvo, encerradaEm: new Date().toISOString() };
  mkdirSync(PASTA_REIVINDICACOES, { recursive: true });
  const nomeArquivo = nomeDoArquivo(id);
  const caminhoRelativo = join("reivindicacoes", nomeArquivo);
  // ⛔ ANTES de escrever — mesma razão do `abrir`.
  exigirBranchAlinhado(branch);
  writeFileSync(join(RAIZ, caminhoRelativo), `${JSON.stringify(encerrada, null, 2)}\n`, "utf8");

  try {
    // `autostashNoRebase: true` — só "encerrar" passa isto (ver DEFEITO 1 no
    // parâmetro `autostashNoRebase` de `commitarEEmpurrar`): encerrar não
    // toma posse nem escreve código, então não há por que exigir tree limpo
    // dele quando o rebase precisa rodar.
    commitarEEmpurrar(caminhoRelativo, `encerra: ${alvo.frente}`, branch, { quem: alvo.quem, responsabilidade: alvo.responsabilidade, arquivos: alvo.arquivos }, false, comandoParaRepetir, true);
  } catch (e) {
    console.error(`🚫 ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }

  const identificacao = alvo.rotulo ? `${alvo.quem} (rótulo: ${alvo.rotulo})` : alvo.quem;
  console.log(`✅ Encerrada: "${alvo.responsabilidade}" (era de ${identificacao}).`);
}

// ─────────────────────────────────────────────────────────────────────────
// listar
// ─────────────────────────────────────────────────────────────────────────

function comandoListar(argv: string[]): void {
  const branch = branchAlvo(argv);
  const agora = new Date();

  let existentes: Reivindicacao[];
  let origem: string;
  const busca = buscarRemoto(branch);
  if (busca.ok) {
    try {
      existentes = lerReivindicacoesRemotas(branch);
      origem = `origin/${branch}`;
    } catch (e) {
      console.warn(`⚠️  Remoto alcançável mas não li o registro (${e instanceof Error ? e.message : String(e)}). Mostrando o disco local.`);
      existentes = lerReivindicacoesDoDisco(PASTA_REIVINDICACOES);
      origem = "disco local (registro remoto não leu)";
    }
  } else {
    console.warn(`⚠️  Não alcancei o remoto (${busca.erro}). Mostrando o disco local — pode estar desatualizado.`);
    existentes = lerReivindicacoesDoDisco(PASTA_REIVINDICACOES);
    origem = "disco local (sem rede)";
  }

  if (existentes.length === 0) {
    console.log(`Nenhuma reivindicação em ${origem}.`);
    return;
  }

  console.log(`Reivindicações em ${origem}:\n`);
  for (const r of existentes.sort((a, b) => a.abertaEm.localeCompare(b.abertaEm))) {
    const estado = estaViva(r, agora);
    const estadoRotulo = estado === "encerrada" ? "ENCERRADA" : estado === "velha" ? "VELHA (não bloqueia)" : "VIVA";
    console.log(`── [${estadoRotulo}] ${r.responsabilidade}`);
    console.log(`   quem ......... ${r.quem}${r.rotulo ? ` (rótulo: ${r.rotulo})` : ""}`);
    console.log(`   frente ....... ${r.frente}`);
    console.log(`   arquivos ..... ${r.arquivos.join(", ")}`);
    console.log(`   aberta em .... ${r.abertaEm}`);
    if (r.encerradaEm) console.log(`   encerrada em . ${r.encerradaEm}`);
    if (r.forcadaPor) console.log(`   FORÇADA por .. ${r.forcadaPor.quem}: "${r.forcadaPor.motivo}" (${r.forcadaPor.em})`);
    console.log("");
  }
}

// ─────────────────────────────────────────────────────────────────────────
// instalar-gancho
// ─────────────────────────────────────────────────────────────────────────

const CONTEUDO_DO_GANCHO = `#!/bin/sh
# Instalado por "npm run reivindicar -- instalar-gancho".
#
# Roda \`conferir\` antes de cada push: se o que você tocou pisa em frente
# reivindicada por outra sessão, o push é barrado AQUI — antes do
# "git pull --rebase", que é onde a colisão apareceria sem aviso nenhum.
#
# Sem rede, "conferir" avisa e deixa passar (a régua fica dentro dele, não
# aqui): portão que barra por falha de infraestrutura ensina todo mundo a usar
# --no-verify, e aí ele deixa de existir.
npx tsx "$(git rev-parse --show-toplevel)/scripts/reivindicar.mts" conferir || exit 1

# ── AS DUAS CATRACAS DA FASE 1 (26/08/2026) ────────────────────────────────
#
# Prompt é aviso; código é trava. As duas regras abaixo estavam escritas no
# CLAUDE.md e foram furadas assim mesmo — uma vez o push direto na branch de
# deploy, CINCO vezes o CI barrado no \`tsc --noEmit\`. Regra que só existe em
# prosa é uma regra que a próxima sessão não lê.
npx tsx "$(git rev-parse --show-toplevel)/scripts/reivindicar.mts" portao-de-push "$@"
`;

/** Escreve o gancho de fato. Lança em vez de chamar `process.exit` — quem
 *  decide o código de saída é `comandoInstalarGancho`, que precisa de um
 *  ÚNICO ponto de decisão para respeitar `--silencioso` (ver o comentário
 *  grande logo abaixo, sobre por que esta chamada existe). */
function escreverGancho(silencioso: boolean): void {
  const commonDir = gitOuNulo(["rev-parse", "--git-common-dir"]);
  if (!commonDir) {
    throw new Error("Não consegui achar o git-common-dir. Rode isto de dentro do repositório.");
  }
  const pastaGanchos = resolve(RAIZ, commonDir, "hooks");
  mkdirSync(pastaGanchos, { recursive: true });
  const caminhoGancho = join(pastaGanchos, "pre-push");
  if (existsSync(caminhoGancho) && !silencioso) {
    console.log(`Já existe um gancho pre-push em ${caminhoGancho} — sobrescrevendo.`);
  }
  writeFileSync(caminhoGancho, CONTEUDO_DO_GANCHO, "utf8");
  chmodSync(caminhoGancho, 0o755);
  if (!silencioso) {
    console.log(`✅ Gancho pre-push instalado em ${caminhoGancho}.`);
    console.log("   Vale para este worktree e para os outros que compartilham este git-common-dir.");
  }
}

/**
 * ── POR QUE ESTE GANCHO SE AUTO-INSTALA (16/08/2026) ────────────────────────
 * Um gancho que só existe se alguém LEMBRAR de rodar
 * "npm run reivindicar -- instalar-gancho" na mão é um gancho que metade da
 * equipe não tem — e a trava de colisão do `conferir` só protege quem
 * instalou por conta própria. `package.json` chama este comando no script
 * "prepare", que o npm roda SOZINHO em todo "npm install"/"npm ci": o gancho
 * passa a existir pelo simples fato de alguém ter clonado o repo e instalado
 * as dependências — sem precisar de um segundo passo que ninguém documenta e
 * ninguém lembra de rodar.
 *
 * Duas regras não-negociáveis para ESTA chamada específica (a do "prepare"):
 *
 *   1. NUNCA pode derrubar o "npm install"/"npm ci". Um gancho opcional que
 *      falha (não é repositório git, permissão negada, git-common-dir
 *      sumido) não pode ser motivo para a instalação INTEIRA falhar — por
 *      isso "prepare" chama com "--silencioso": qualquer erro aqui sai 0, em
 *      silêncio, sem barrar nada. O pior resultado possível é "o gancho não
 *      ficou instalado", nunca "o npm install quebrou por causa de um gancho
 *      que ninguém pediu para ver".
 *   2. "--silencioso" também cala a saída de SUCESSO. "npm install" já é
 *      barulhento por natureza, e duas linhas de gancho no meio do log de
 *      toda instalação é ruído que ninguém pediu.
 *
 * Rodar na mão sem a flag ("npm run reivindicar -- instalar-gancho") continua
 * falhando alto e mostrando o erro de verdade — é o modo de quem está
 * depurando o próprio gancho, não o modo do npm install.
 */
function comandoInstalarGancho(argv: string[]): void {
  const silencioso = temFlag(argv, "silencioso");
  try {
    escreverGancho(silencioso);
  } catch (e) {
    if (silencioso) {
      // Ver a regra 1 acima: falhar aqui NUNCA pode derrubar "npm install"/"npm ci".
      process.exit(0);
    }
    console.error(`🚫 ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// portao-de-push — AS DUAS CATRACAS DA FASE 1 (26/08/2026)
// ─────────────────────────────────────────────────────────────────────────
//
// ── CATRACA 1: NINGUÉM EMPURRA DIRETO NA BRANCH DE DEPLOY ──────────────────
//
// A regra está no CLAUDE.md e foi furada uma vez, declarada por quem furou. O
// remédio de prosa já falhou; este é o de código.
//
// ⚠️ COM UMA EXCEÇÃO, E ELA NÃO É CONVENIÊNCIA: `reivindicacoes/` é a ÚNICA
// fonte que duas sessões isoladas compartilham, e o próprio `abrir`/`encerrar`
// publica lá com `git push origin HEAD:<branch de deploy>`. Barrar isso
// quebraria a trava de colisão da casa — trocaria uma catraca por outra.
// Então a catraca é precisa: push na branch de deploy que mexa em QUALQUER
// coisa fora de `reivindicacoes/` é barrado.
//
// ── CATRACA 2: `tsc --noEmit`, COM O CÓDIGO DE SAÍDA CONFERIDO ─────────────
//
// O CLAUDE.md tem uma seção inteira sobre isto e a casa barrou o CI CINCO
// vezes pelo mesmo motivo, sempre em arquivo de teste novo que estava verde no
// `vitest` — que não checa tipo. "Teste verde não é teste que compila" estava
// escrito; o que faltava era alguém conferir.
//
// ── POR QUE NÃO BARRA POR FALHA DE INFRAESTRUTURA ─────────────────────────
//
// Mesma regra do `conferir` logo acima, e ela é da casa: portão que barra por
// falta de rede ou por `tsc` ausente ensina todo mundo a usar `--no-verify`, e
// aí ele deixa de existir. Falta de ferramenta AVISA e deixa passar. O que
// barra é o veredito de verdade — `tsc` que rodou e reprovou.

/**
 * A CASCA. A DECISÃO mora em `lib/coordenacao/portao-de-push.ts`, e o motivo
 * está escrito lá: o teste da primeira versão passou aqui e REPROVOU no CI,
 * porque media o repositório em volta em vez de medir a régua.
 */
function comandoPortaoDePush(argv: string[]): void {
  const branchDeDeploy = branchAlvo(argv);

  let bruto = "";
  try { bruto = readFileSync(0, "utf8"); } catch { bruto = ""; }
  const refs = refsDaEntradaPadrao(bruto);

  // ── CATRACA 1 ────────────────────────────────────────────────────────────
  //
  // `arquivosTocados: null` é "não consegui comparar", NUNCA "nada mudou". Num
  // checkout raso (CI) `origin/<deploy>` não existe local, e a régua trata a
  // ausência como ausência.
  const base = gitOuNulo(["merge-base", "HEAD", `origin/${branchDeDeploy}`])
    ?? gitOuNulo(["rev-parse", `origin/${branchDeDeploy}`]);
  const arquivosTocados = base
    ? (gitOuNulo(["diff", "--name-only", `${base}..HEAD`]) ?? "")
        .split("\n").map((l) => l.trim()).filter(Boolean)
    : null;

  const veredito = vereditoDoPortao({ refs, branchDeDeploy, arquivosTocados });
  if (veredito.barrar) {
    const fora = veredito.foraDaReivindicacao;
    console.error(
      `🚫 PUSH DIRETO NA BRANCH DE DEPLOY (${branchDeDeploy}) — barrado aqui.\n\n` +
        `   ${fora.length} arquivo(s) fora de \`${PASTA_QUE_PASSA_DIRETO}\`:\n` +
        fora.slice(0, 10).map((f) => `     • ${f}`).join("\n") +
        (fora.length > 10 ? `\n     … e mais ${fora.length - 10}` : "") +
        "\n\n   A regra desta casa é PR + CI. Abra a sua branch e o PR:\n" +
        "     git switch -c claude/<o-que-voce-esta-fazendo>\n" +
        "     git push -u origin HEAD\n\n" +
        `   \`${PASTA_QUE_PASSA_DIRETO}\` continua passando direto — é a única fonte que duas\n` +
        "   sessões isoladas compartilham, e barrá-la quebraria a trava de colisão.",
    );
    process.exit(1);
  }
  if (veredito.aviso) console.warn(`⚠️  portao-de-push: ${veredito.aviso}`);

  // ── CATRACA 2 ────────────────────────────────────────────────────────────
  const r = spawnSync("npx", ["tsc", "--noEmit"], { cwd: RAIZ, encoding: "utf8" });
  if (r.error) {
    console.warn("⚠️  portao-de-push: não consegui rodar `tsc --noEmit` — deixo passar. Ferramenta ausente não é defeito do código.");
    return;
  }
  if (r.status !== 0) {
    console.error(
      "🚫 `tsc --noEmit` REPROVOU — barrado aqui, e não no CI.\n\n" +
        (r.stdout ?? "").split("\n").slice(0, 20).join("\n") +
        "\n\n   Esta casa barrou o CI CINCO vezes pelo mesmo motivo, sempre em arquivo\n" +
        "   de teste novo que estava verde no `vitest` — que não checa tipo.\n" +
        "   Teste verde não é teste que compila.",
    );
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────

function main(): void {
  const [subcomando, ...resto] = process.argv.slice(2);

  switch (subcomando) {
    case "abrir":
      return comandoAbrir(resto);
    case "conferir":
      return comandoConferir(resto);
    case "encerrar":
      return comandoEncerrar(resto);
    case "listar":
      return comandoListar(resto);
    case "instalar-gancho":
      return comandoInstalarGancho(resto);
    case "portao-de-push":
      return comandoPortaoDePush(resto);
    default:
      console.error("Uso: npm run reivindicar -- <abrir|conferir|encerrar|listar|instalar-gancho|portao-de-push> [opções]");
      process.exit(1);
  }
}

main();
