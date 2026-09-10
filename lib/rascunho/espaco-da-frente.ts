// A trava de espaço de RASCUNHO — cada frente escreve só no próprio quintal.
//
// ── O INCIDENTE QUE ISTO EXISTE PARA MATAR (medido em 29/08/2026, nesta
// máquina, com comando — ver `.fichas/ficha-espaco-de-rascunho.md`) ─────────
//
// `/tmp/claude-0/<slug-do-cwd>/<CLAUDE_CODE_SESSION_ID>/scratchpad` foi medido
// como o único espaço de sessão que NÃO é isolado por construção: 14
// worktrees têm `.fichas/` própria e por isso já são isolados por worktree
// (gitignorada só a partir da rodada 4, 29/08/2026 — ver Achado 2 da
// auditoria, `.fichas/ficha-rodada-4.md`: até ali `.fichas/` NÃO tinha
// entrada no `.gitignore`, apesar deste comentário e do de `espacoDaFrente`
// abaixo afirmarem o contrário); o scratchpad de sessão, não. Num único
// diretório de scratchpad compartilhado
// (`-home-user-diolidigital`, 55 arquivos) conviviam rascunhos de frentes
// DIFERENTES sob nomes genéricos e quase-colidentes — `body.md`, `pr-body.md`,
// `prbody.md`, `saida.txt`, `saida-qualidade.txt`, `pr.json` — e o dedo
// digital de colisão contornada à mão: `cdm.bak`/`cdm2.bak`,
// `reg.bak`/`reg2.bak`. E o motivo pelo qual não dava para usar
// `CLAUDE_CODE_SESSION_ID` como chave: nesta máquina ele é **o mesmo valor
// para todas as frentes e subagentes** — não distingue frente nenhuma.
//
// A ÚNICA chave que sobrou realmente única por frente é o RAIZ do worktree.
// Por isso a identidade aqui (`Frente.id`) é sempre `sha256(raiz)`, nunca
// sessão, nunca branch, nunca nome digitado — a mesma lição que
// `lib/coordenacao/reivindicacoes.ts` já aprendeu (leia o cabeçalho de lá
// antes de mexer aqui: identidade DECLARADA já quebrou esta casa três vezes
// em 16/08/2026 por um caminho diferente — string digitada tratada como prova
// de identidade). Aqui a lição é aplicada de novo, para um problema vizinho:
// não "quem sou eu para reivindicar uma responsabilidade", mas "qual
// diretório em disco é garantidamente só meu".
//
// Este arquivo é o NÚCLEO PURO (sem I/O) + uma casca fina de I/O, seguindo o
// mesmo desenho de `lib/coordenacao/reivindicacoes.ts`: a régua é testável
// sem git, sem disco e sem processo real; só as funções de I/O, no fim do
// arquivo, falam com `fs`/`git`.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";

// ─────────────────────────────────────────────────────────────────────────
// Núcleo puro
// ─────────────────────────────────────────────────────────────────────────

/** Uma frente de trabalho, identificada pelo RAIZ do worktree — nunca pela
 *  branch, nunca pela sessão (ver o cabeçalho: nenhum dos dois distingue
 *  frente nesta casa, hoje). */
export type Frente = {
  /** Caminho absoluto do raiz do worktree. */
  raiz: string;
  /** A branch — texto legível, para gente ler. NUNCA usado para comparar
   *  identidade (duas frentes na mesma branch, em worktrees diferentes,
   *  continuam sendo frentes DIFERENTES). */
  rotulo: string;
  /** `sha256(raiz)` truncado em 12 hex, prefixo `frente-`. Identidade é o
   *  hash do CAMINHO, não o nome da branch — nome se digita errado, caminho
   *  não (a mesma garantia de `derivarIdentidade` em
   *  `lib/coordenacao/reivindicacoes.ts`, reaplicada aqui). */
  id: string;
};

/** O que fica gravado em `.dono.json`, dentro do espaço da frente — o
 *  registro de QUEM criou aquele diretório primeiro. */
export type DonoGravado = {
  id: string;
  rotulo: string;
  raiz: string;
  criadoEm: string;
};

/** `sha256(caminhoAbsoluto)`, 12 hex, prefixo `frente-`. Função isolada
 *  porque `identidadeDaFrente` e os testes de determinismo precisam do
 *  MESMO cálculo — nunca duas fórmulas para a mesma pergunta (a lição de
 *  `conferirRegistro`, em `lib/coordenacao/reivindicacoes.ts`: duas réguas
 *  para a mesma pergunta divergem no dia em que alguém "otimiza" uma delas). */
function idDoRaiz(raizNormalizada: string): string {
  const hash = createHash("sha256").update(raizNormalizada, "utf8").digest("hex");
  return `frente-${hash.slice(0, 12)}`;
}

/**
 * PURA — nenhuma leitura de disco, git, env ou processo. Recebe o RAIZ (já
 * resolvido por quem chama — `descobrirFrente`, na casca de I/O) e a branch,
 * devolve a identidade calculada.
 *
 * `path.resolve` aqui não é I/O: chamado com um único argumento JÁ absoluto,
 * ele só normaliza a string (remove `..`, barra final, etc.) sem tocar em
 * `process.cwd()` — a normalização existe para que `"/a/b"` e `"/a/b/"`
 * produzam o MESMO `id` (o mesmo raiz, escrito de duas formas, não pode virar
 * duas frentes).
 */
export function identidadeDaFrente(raizDoWorktree: string, branch: string): Frente {
  const raiz = path.resolve(raizDoWorktree);
  return { raiz, rotulo: branch, id: idDoRaiz(raiz) };
}

/** `<raiz>/.fichas/<f.id>/` — dentro de `.fichas`, que já era isolada por
 *  worktree antes deste módulo existir, mas só passou a ser GITIGNORADA na
 *  rodada 4 (29/08/2026 — ver Achado 2 da auditoria, `.fichas/ficha-rodada-4.md`;
 *  ver o cabeçalho do arquivo para o detalhe). Este módulo só adiciona a
 *  subpasta por frente para o caso em que mais de
 *  uma sessão compartilha o MESMO worktree — o mesmo cenário que forçou a
 *  identidade por sessão em `lib/coordenacao/reivindicacoes.ts`, mas aqui
 *  resolvido por convenção de diretório, não por identidade calculada de
 *  sessão (este módulo não usa sessão — ver o cabeçalho, por quê). */
export function espacoDaFrente(f: Frente): string {
  return path.join(f.raiz, ".fichas", f.id) + path.sep;
}

/** Quebra um caminho absoluto (já resolvido) em segmentos de diretório,
 *  descartando entradas vazias (o separador inicial de um caminho absoluto
 *  em POSIX produz um segmento vazio no início). */
function segmentos(caminhoAbsoluto: string): string[] {
  return path.resolve(caminhoAbsoluto).split(path.sep).filter(Boolean);
}

/**
 * PURA. `alvo` está DENTRO de `espaco` quando, comparados SEGMENTO A
 * SEGMENTO, todo segmento de `espaco` bate com o segmento correspondente de
 * `alvo` (e `alvo` não é mais curto que `espaco`).
 *
 * ⛔ NUNCA `startsWith` em string crua — é exatamente esse defeito que este
 * teste está aqui para impedir de renascer: `"/a/.fichas/frente-ab"` NÃO
 * pode "conter" `"/a/.fichas/frente-abc"` só porque a STRING
 * `"/a/.fichas/frente-ab"` é um prefixo de texto de
 * `"/a/.fichas/frente-abc/x.md"`. Comparando por segmento, o terceiro
 * segmento é `"frente-ab"` de um lado e `"frente-abc"` do outro — diferentes,
 * fim de história.
 */
export function estaDentroDoEspaco(espaco: string, alvo: string): boolean {
  const segEspaco = segmentos(espaco);
  const segAlvo = segmentos(alvo);
  if (segAlvo.length < segEspaco.length) return false;
  for (let i = 0; i < segEspaco.length; i++) {
    if (segEspaco[i] !== segAlvo[i]) return false;
  }
  return true;
}

/** Lançado quando uma frente tenta escrever num espaço de rascunho que já
 *  tem dono — e o dono não é ela. Mensagem NOMEADA: id e rótulo da frente
 *  DONA, o caminho em questão, e desde quando o espaço é dela — quem lê o
 *  erro não pode ter que adivinhar de quem é o quintal. */
export class RascunhoDeOutraFrenteError extends Error {
  constructor(donoGravado: DonoGravado, caminho: string) {
    super(
      `"${caminho}" pertence à frente "${donoGravado.rotulo}" (${donoGravado.id}, raiz "${donoGravado.raiz}"), ` +
        `dona deste espaço desde ${donoGravado.criadoEm}. Esta frente não pode escrever aqui — cada frente tem o ` +
        `próprio espaço de rascunho, exatamente para o incidente que este mecanismo existe para matar (ver o ` +
        `cabeçalho de "lib/rascunho/espaco-da-frente.ts").`,
    );
    this.name = "RascunhoDeOutraFrenteError";
  }
}

/** Lançado por `conferirEscritaEm` quando `alvo` está fora do espaço desta
 *  frente e NENHUM ancestral do caminho tem `.dono.json` — terra de
 *  ninguém, sem dono nenhum a nomear. É o caso mais comum do incidente real:
 *  o scratchpad compartilhado de sessão (`/tmp/claude-0/.../scratchpad`, ver
 *  o cabeçalho deste arquivo) nunca teve `.dono.json` gravado em lugar
 *  nenhum — não é que outra frente é dona, é que ali não é quintal de
 *  ninguém. Classe NOMEADA e distinta de `RascunhoDeOutraFrenteError` de
 *  propósito: quem chama precisa poder diferenciar "tem dono, e não é você"
 *  de "não tem dono nenhum" sem fazer parsing de texto de mensagem. */
export class RascunhoForaDoEspacoError extends Error {
  constructor(alvo: string, espacoDaFrenteAtual: string) {
    super(
      `"${alvo}" está FORA do espaço desta frente, e não achei dono gravado em nenhum ancestral dele. ` +
        `O espaço desta frente é "${espacoDaFrenteAtual}" — escreva aí (ou numa subpasta dele), não em outro ` +
        `lugar do disco.`,
    );
    this.name = "RascunhoForaDoEspacoError";
  }
}

/**
 * PURA. Confere se `eu` pode escrever num espaço cujo dono gravado é
 * `donoGravado`. Igualdade EXATA de `id` — nunca por `rotulo` (branch se
 * repete entre worktrees; `id`, por construção, não). `donoGravado === null`
 * significa "espaço ainda sem dono": passa, silenciosamente — é o caso do
 * primeiro escritor.
 *
 * `caminhoParaErro` é OPCIONAL, de propósito: a assinatura exigida pela
 * ficha de despacho é `conferirDono(donoGravado, eu): void`, e ela continua
 * válida com dois argumentos — só que a mensagem de erro fica mais pobre
 * (usa `donoGravado.raiz` como aproximação de "onde"). Quem já tem o
 * caminho exato em mãos (`abrirEspaco`, que sabe o espaço que acabou de
 * abrir) passa o terceiro argumento e ganha a mensagem completa exigida pela
 * ficha: id, rótulo, caminho e desde quando.
 */
export function conferirDono(donoGravado: DonoGravado | null, eu: Frente, caminhoParaErro?: string): void {
  if (donoGravado === null) return;
  if (donoGravado.id === eu.id) return;
  throw new RascunhoDeOutraFrenteError(donoGravado, caminhoParaErro ?? donoGravado.raiz);
}

/** PURA. Valida o `nome` de um rascunho ANTES de qualquer I/O — vazio,
 *  absoluto ou com `..` (escape de diretório) são rejeitados aqui, cedo,
 *  para que `caminhoDeRascunho` nunca precise checar `estaDentroDoEspaco`
 *  como única linha de defesa (defesa em profundidade: o nome já chega
 *  limpo, e o `estaDentroDoEspaco` no fim é o cinto por cima do suspensório). */
export function validarNomeDeRascunho(nome: string): void {
  if (!nome || !nome.trim()) {
    throw new Error('nome de rascunho vazio — não dá para escrever "nada".');
  }
  if (path.isAbsolute(nome)) {
    throw new Error(`nome de rascunho não pode ser um caminho absoluto: "${nome}".`);
  }
  const partes = nome.split(/[\\/]+/);
  if (partes.some((p) => p === "..")) {
    throw new Error(`nome de rascunho não pode conter ".." (escape de diretório): "${nome}".`);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Casca de I/O — fala com disco e git. Cada função com o mínimo de disco.
// ─────────────────────────────────────────────────────────────────────────

function caminhoDoDono(espaco: string): string {
  return path.join(espaco, ".dono.json");
}

/**
 * Resolve o caminho REAL (seguindo symlink) do ancestral mais próximo que
 * EXISTE, e remonta por cima dele os segmentos que ainda não existem.
 *
 * Existe para o Achado 1 da auditoria da rodada 4: `path.resolve` só
 * normaliza TEXTO ("remove `..`, barra dupla etc.") — ele não segue link
 * simbólico nenhum. Um symlink criado dentro do espaço de UMA frente,
 * apontando para um arquivo de OUTRA, passava as duas checagens de texto
 * (`estaDentroDoEspaco`) porque, como texto, o caminho é mesmo interno ao
 * espaço; só o caminho REAL (pós-symlink) revela que ele aponta para fora.
 * `writeFileSync` segue o link; a checagem, sem isto, não seguia.
 *
 * Por que o ancestral mais PRÓXIMO, e não `realpathSync` direto no alvo:
 * `realpathSync` LANÇA `ENOENT` em caminho que ainda não existe — e o alvo de
 * uma escrita nova é, por definição, um caminho que ainda não existe (e, no
 * caso de subpasta nova — Achado 3 —, o diretório pai dele também ainda não
 * existe). Resolver o ancestral mais próximo que já existe, e remontar os
 * segmentos que faltam por cima do caminho real dele, captura o caso que
 * importa — um symlink em QUALQUER nível já existente do caminho — sem
 * quebrar o caso comum de arquivo/subpasta ainda inexistente.
 */
function realpathAproximado(caminho: string): string {
  const resolvido = path.resolve(caminho);
  if (existsSync(resolvido)) return realpathSync(resolvido);
  const pai = path.dirname(resolvido);
  if (pai === resolvido) return resolvido; // raiz do filesystem — salvaguarda, nunca deveria chegar aqui.
  return path.join(realpathAproximado(pai), path.basename(resolvido));
}

function lerDonoGravado(espaco: string): DonoGravado | null {
  const caminho = caminhoDoDono(espaco);
  if (!existsSync(caminho)) return null;
  const bruto = readFileSync(caminho, "utf8");
  const dado = JSON.parse(bruto) as DonoGravado;
  return dado;
}

/**
 * Cria o diretório do espaço da frente (se ainda não existir) e grava
 * `.dono.json` na primeira vez. Se o espaço já existir com dono GRAVADO
 * diferente, LANÇA `RascunhoDeOutraFrenteError` — e lança antes de gravar
 * qualquer coisa nova: `mkdirSync` com um diretório já existente é inócuo
 * (não sobrescreve nada), então o único jeito de "tocar o disco" aqui é
 * escrever `.dono.json` pela primeira vez, e isso só acontece depois da
 * checagem de dono passar.
 *
 * Devolve o caminho do espaço (com barra final — ver `espacoDaFrente`).
 */
export function abrirEspaco(f: Frente): string {
  const espaco = espacoDaFrente(f);
  mkdirSync(espaco, { recursive: true });

  const donoAtual = lerDonoGravado(espaco);
  conferirDono(donoAtual, f, espaco);

  if (donoAtual === null) {
    const dono: DonoGravado = { id: f.id, rotulo: f.rotulo, raiz: f.raiz, criadoEm: new Date().toISOString() };
    writeFileSync(caminhoDoDono(espaco), JSON.stringify(dono, null, 2) + "\n", "utf8");
  }

  return espaco;
}

/**
 * Abre o espaço da frente (criando e/ou conferindo dono — LANÇA se for de
 * outra frente) e devolve o caminho absoluto e seguro para `nome` dentro
 * dele. Valida o nome ANTES de montar o caminho, e confere
 * `estaDentroDoEspaco` DEPOIS de montado — defesa em profundidade, nunca
 * confiando só numa das duas.
 */
export function caminhoDeRascunho(nome: string, f: Frente): string {
  validarNomeDeRascunho(nome);
  const espaco = abrirEspaco(f);
  const candidato = path.resolve(path.join(espaco, nome));
  if (!estaDentroDoEspaco(espaco, candidato)) {
    throw new Error(`nome de rascunho "${nome}" escaparia do espaço da frente ("${espaco}"): "${candidato}".`);
  }

  // Achado 1 (rodada 4): a checagem acima é de TEXTO. Um symlink já
  // existente dentro do espaço (criado por outra frente, ou por qualquer
  // caminho fora do controle deste módulo) pode passar nela e ainda assim
  // apontar para fora por trás do link — resolve pelo caminho REAL antes de
  // aprovar. Ver `realpathAproximado`.
  const espacoReal = realpathAproximado(espaco);
  const candidatoReal = realpathAproximado(candidato);
  if (!estaDentroDoEspaco(espacoReal, candidatoReal)) {
    throw new Error(
      `nome de rascunho "${nome}" aponta para FORA do espaço da frente por symlink: resolve para ` +
        `"${candidatoReal}", fora de "${espacoReal}" (espaço desta frente: "${espaco}").`,
    );
  }

  return candidato;
}

/**
 * Escreve `conteudo` em `nome`, dentro do espaço da frente. Usa
 * `caminhoDeRascunho`, que já LANÇA (via `abrirEspaco` → `conferirDono`, e via
 * a checagem de symlink do Achado 1) ANTES de qualquer `writeFileSync` desta
 * função rodar, se o dono do espaço não bater ou o caminho escapar por link —
 * a escrita de conteúdo NUNCA acontece antes de toda a checagem de posse e
 * contenção passar. SÓ DEPOIS disso, cria o diretório pai de `nome` se ele
 * ainda não existir (Achado 3: `nome` pode ser uma subpasta nova, ex.
 * `"sub/nota.md"` — sem isto, `writeFileSync` estourava `ENOENT` mesmo com o
 * caminho aprovado). Devolve o caminho absoluto onde gravou.
 */
export function escreverRascunho(nome: string, conteudo: string, f: Frente): string {
  const caminho = caminhoDeRascunho(nome, f);
  mkdirSync(path.dirname(caminho), { recursive: true });
  writeFileSync(caminho, conteudo, "utf8");
  return caminho;
}

/**
 * Sobe os diretórios ANCESTRAIS de `alvoResolvido` (do mais fundo — o
 * diretório que contém o próprio arquivo — para o mais raso, a raiz do
 * filesystem) procurando um `.dono.json` legível. Existe para
 * `conferirEscritaEm` não repetir o defeito de origem ("o defeito
 * `.includes(\"wip\")`", ver `estaDentroDoEspaco`): a ficha de despacho pede
 * EXPLICITAMENTE para não usar heurística de nome de pasta (não procurar a
 * palavra `.fichas` em texto, não usar `includes`) — a prova de posse tem
 * que ser a presença real do arquivo que `abrirEspaco` grava, não uma
 * suposição sobre como o caminho está escrito.
 *
 * Teto de subida explícito em `path.parse(dir).root`, e uma salvaguarda para
 * o caso degenerado em que `path.dirname` para de subir — para nunca laçar
 * num caminho patológico.
 *
 * `.dono.json` presente mas ilegível/corrompido NÃO conta como dono — a
 * ficha pede um `.dono.json` "legível"; um arquivo corrompido não prova
 * posse de ninguém, então o laço continua subindo em vez de parar nele.
 */
function encontrarDonoAncestral(alvoResolvido: string): DonoGravado | null {
  let dir = path.dirname(alvoResolvido);
  while (true) {
    const candidato = caminhoDoDono(dir);
    if (existsSync(candidato)) {
      try {
        return JSON.parse(readFileSync(candidato, "utf8")) as DonoGravado;
      } catch {
        // ilegível — não conta como dono; segue subindo em vez de parar aqui.
      }
    }
    const raizFs = path.parse(dir).root;
    if (dir === raizFs) return null;
    const pai = path.dirname(dir);
    if (pai === dir) return null; // salvaguarda: nunca deveria acontecer, mas fecha o laço de qualquer forma.
    dir = pai;
  }
}

/**
 * O GUARDA para um caminho de destino ESCOLHIDO POR QUEM CHAMA — o oposto de
 * `caminhoDeRascunho`, que devolve um caminho que ELE MESMO montou (e por
 * isso nunca escapa do espaço por construção). Este existe para o buraco que
 * `caminhoDeRascunho`/`escreverRascunho` NÃO cobrem: alguém monta o destino
 * por fora — um editor de arquivo genérico, um script que recebeu o caminho
 * como argumento — e escreve fora do espaço da própria frente sem passar por
 * nenhuma das funções acima. Antes desta função, essa escrita não encontrava
 * trava nenhuma: sem erro, sem nome, sem nada — exatamente o furo que a
 * auditoria da rodada 1 achou, e exatamente o cenário do incidente real (o
 * scratchpad compartilhado de sessão, `/tmp/claude-0/.../scratchpad`, ver o
 * cabeçalho deste arquivo) e o `.fichas` de outra frente, alcançados sem
 * checagem nenhuma.
 *
 * Três desfechos, nesta ordem:
 *  1. `alvo` já está dentro do espaço DESTA frente → passa calado. O caso
 *     limpo nunca pode ser barrado — é a garantia irmã de `escreverRascunho`
 *     para o caso normal.
 *  2. `alvo` está fora, mas um ANCESTRAL dele tem `.dono.json` legível: se o
 *     dono é OUTRA frente, lança `RascunhoDeOutraFrenteError` NOMEANDO quem é
 *     a dona — é literalmente o requisito do Diretor ("falha alto e nomeada,
 *     dizendo qual frente é dona do lugar"). Se o dono é a PRÓPRIA frente
 *     (por exemplo um symlink já resolvido que aponta pro próprio espaço por
 *     outro caminho), passa calado.
 *  3. `alvo` está fora e NENHUM ancestral tem dono gravado — terra de
 *     ninguém, o caso mais comum do incidente real (o scratchpad
 *     compartilhado nunca teve `.dono.json` nenhum, para frente nenhuma) —
 *     lança `RascunhoForaDoEspacoError`, dizendo qual é o espaço certo desta
 *     frente para a pessoa copiar e colar.
 *
 * Achado 1 (rodada 4): o desfecho 1 acima era uma checagem de TEXTO
 * (`estaDentroDoEspaco` em `path.resolve`) — um `alvo` que é symlink DENTRO
 * do próprio espaço da frente, apontando para um arquivo de FORA (por
 * exemplo, do espaço de outra frente), passava nela calado. Por isso, quando
 * o desfecho 1 bate, a função resolve o caminho REAL de `espaco` e de `alvo`
 * (`realpathAproximado`) e confere de novo — o symlink legítimo (aponta para
 * dentro do próprio espaço) continua passando calado; o que aponta para fora
 * agora lança, nomeado.
 */
export function conferirEscritaEm(alvo: string, f: Frente): void {
  const alvoResolvido = path.resolve(alvo);
  const espaco = espacoDaFrente(f);
  if (estaDentroDoEspaco(espaco, alvoResolvido)) {
    const espacoReal = realpathAproximado(espaco);
    const alvoReal = realpathAproximado(alvoResolvido);
    if (!estaDentroDoEspaco(espacoReal, alvoReal)) {
      throw new Error(
        `"${alvo}" está dentro do espaço da frente por texto, mas aponta para FORA por symlink: resolve para ` +
          `"${alvoReal}", fora de "${espacoReal}" (espaço desta frente: "${espaco}").`,
      );
    }
    return;
  }

  const dono = encontrarDonoAncestral(alvoResolvido);
  if (dono !== null) {
    if (dono.id === f.id) return;
    throw new RascunhoDeOutraFrenteError(dono, alvoResolvido);
  }

  throw new RascunhoForaDoEspacoError(alvoResolvido, espaco);
}

/**
 * Descobre a `Frente` atual perguntando ao git — `--show-toplevel` para o
 * raiz do worktree, `--abbrev-ref HEAD` para o rótulo (a branch). Ambos via
 * `execFileSync` com args SEPARADOS (nunca `shell: true`, nunca string
 * montada por concatenação) — a mesma trava contra injeção que
 * `scripts/reivindicar.mts` já usa em toda chamada de `git`.
 *
 * Se `git` falhar (não é um worktree git, ou o binário não existe), lança
 * erro CLARO dizendo isso — rascunho fora de worktree git não tem espaço
 * garantido por este mecanismo, porque a identidade inteira depende do raiz
 * que só o git sabe apontar de forma confiável.
 */
export function descobrirFrente(cwd: string = process.cwd()): Frente {
  let raiz: string;
  let branch: string;
  try {
    raiz = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd, encoding: "utf8" }).trim();
  } catch (e) {
    throw new Error(
      `não consegui achar o raiz do worktree git a partir de "${cwd}" — rascunho fora de worktree git não tem ` +
        `espaço garantido por este mecanismo. Detalhe: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
  try {
    branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd, encoding: "utf8" }).trim();
  } catch (e) {
    throw new Error(
      `achei o raiz do worktree ("${raiz}") mas não consegui ler a branch atual. Detalhe: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
  return identidadeDaFrente(raiz, branch);
}
