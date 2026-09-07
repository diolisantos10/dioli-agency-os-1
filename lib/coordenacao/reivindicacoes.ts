// A trava de reivindicação — a régua, sem I/O e sem rede.
//
// ── O CASO QUE ISTO EXISTE PARA MATAR (16/08/2026) ─────────────────────────
// Três frentes foram construídas EM DOBRO no mesmo dia, por chats diferentes,
// cegos uns para os outros, na mesma branch:
//
//   1. `parse_error` do SDR — dois commits, ~3h cada, um descartado;
//   2. "verba declarada vs estimativa" — DOIS módulos com a MESMA
//      responsabilidade e nomes de arquivo DIFERENTES
//      (`verba-declarada.ts` e `verba-vs-estimativa.ts`). Colisão por caminho
//      de arquivo não pegaria este caso — só colisão por RESPONSABILIDADE
//      declarada pega;
//   3. e-mail de "orçamento pronto" — colisão em 4 arquivos.
//
// A doutrina (`docs/kit/13-quem-esta-vivo.md` §3) já mandava "escreva a
// reivindicação, commite antes de começar" desde 02/08/2026. As três colisões
// acima aconteceram com a regra ESCRITA. Prompt é sugestão; isto é mecanismo.
//
// Este arquivo é só a régua: funções puras, testáveis sem git e sem disco. Quem
// fala com o git, o disco e o remoto é `scripts/reivindicar.mts` — a mesma
// separação que `porta-de-emergencia.ts` já usa nesta casa (regra testável,
// I/O num script fino por cima).

import { createHash } from "node:crypto";

/** Uma reivindicação de frente de trabalho, como grava em `reivindicacoes/*.json`. */
export type Reivindicacao = {
  /** Slug da responsabilidade, ex.: "comercial/verba-vs-estimativa". */
  id: string;
  /**
   * Identidade da sessão que abriu — SEMPRE DERIVADA, nunca digitada por
   * quem chama o comando. Dois formatos possíveis, e a diferença importa:
   *
   *   • "ses-" + 10 hex de sha256(caminho do worktree + "|" + âncora de
   *     sessão) — RODADA 5 (16/08/2026): quando o ambiente oferece um sinal
   *     de SESSÃO (`CLAUDE_CODE_SESSION_ID` ou PID+starttime — ver
   *     `descobrirAncoraDeSessao` em `scripts/reivindicar.mts`), a
   *     identidade distingue SESSÕES dentro do MESMO worktree. Ex.:
   *     "ses-7c1a9e4f02". (Prefixo era "id-" na primeira versão da rodada 5;
   *     trocado para "ses-" no laudo de qualidade que reprovou aquela
   *     versão — "id-" é ruim de ler num arquivo onde todo objeto já tem um
   *     campo "id" ao lado.)
   *   • "wt-" + 10 hex de sha256(caminho do worktree) — RODADA 4
   *     (16/08/2026), preservado como o modo DEGRADADO: sem sinal de
   *     sessão, a identidade cai para o worktree inteiro (várias sessões no
   *     mesmo worktree ficam indistinguíveis — o script AVISA em voz alta
   *     quando cai neste modo, nunca em silêncio). Ex.: "wt-3f2a91bc4d".
   *
   * Por que a rodada 4 não bastou: esta casa roda VÁRIAS sessões no MESMO
   * worktree (o worktree principal é compartilhado). Medido em disco em
   * 16/08/2026: duas sessões diferentes, mesmo worktree, calcularam a
   * MESMA identidade "wt-09f81bb764" — um FALSO NEGATIVO (a trava não
   * reconheceria a colisão entre elas). O mesmo defeito, pelo lado oposto,
   * barrou uma sessão pela PRÓPRIA reivindicação: o rótulo em
   * ".dioli-quem" (arquivo único no worktree) foi sobrescrito por outra
   * sessão no mesmo disco. A saída é acrescentar, à derivação, uma âncora
   * que distingue SESSÕES — não só worktrees.
   *
   * Reivindicações gravadas ANTES da rodada 4 têm este campo no formato
   * ANTIGO, declarado à mão (ex.: "pm-a27b5772") — isto é esperado e
   * INOFENSIVO: uma identidade derivada nunca vai bater, por acaso, com uma
   * string digitada por gente, então essas reivindicações antigas
   * simplesmente nunca serão reconhecidas como "minhas" por ninguém. É o
   * lado SEGURO do não-reconhecimento — ele barra, nunca aprova por engano.
   * A mesma lógica vale entre "wt-" e "ses-": espaços de valores disjuntos
   * por construção (prefixo diferente), então uma reivindicação "wt-"
   * antiga nunca é confundida com uma "ses-" nova, e vice-versa.
   */
  quem: string;
  /**
   * Rótulo LEGÍVEL, opcional, só para gente ler ("pm do bloco do espelho").
   * NUNCA decide posse — só `quem` (a identidade derivada) decide isso. Ver
   * `pegarRotulo` em `scripts/reivindicar.mts`.
   */
  rotulo?: string;
  /** Uma frase: o que está sendo feito. */
  frente: string;
  /** A PERGUNTA que o código responde, normalizada. */
  responsabilidade: string;
  /** Caminhos que a frente vai tocar — arquivo ou prefixo de pasta. */
  arquivos: string[];
  /** ISO-8601. */
  abertaEm: string;
  encerradaEm: string | null;
  forcadaPor?: { quem: string; motivo: string; em: string };
  /**
   * Presente quando esta reivindicação foi aberta em modo DEGRADADO (sem
   * âncora de sessão no ambiente — ver `descobrirAncoraDeSessao` em
   * `scripts/reivindicar.mts`) e a sessão decidiu seguir mesmo assim, via
   * `--aceitar-identidade-degradada --motivo-identidade-degradada "<texto>"`.
   * Mesmo desenho de `forcadaPor`: a decisão de aceitar o risco fica
   * registrada, com motivo, nunca silenciosa. Ver FURO 1 do laudo de
   * qualidade da rodada 5 — `abrir` recusa modo degradado por padrão;
   * este campo é o rastro de quem escolheu destravar de propósito.
   */
  degradadaPor?: { motivo: string; em: string };
};

/** Só o que `conferirColisao` precisa para julgar uma reivindicação nova —
 *  antes dela ganhar `id`/`abertaEm`, que quem grava (o script) decide. */
export type PropostaDeReivindicacao = Pick<Reivindicacao, "quem" | "responsabilidade" | "arquivos">;

export type EstadoDaReivindicacao = "viva" | "velha" | "encerrada";

export type ResultadoDeColisao = {
  colide: boolean;
  /** Motivos que BLOQUEIAM — reivindicação viva de outra sessão. */
  motivos: string[];
  /** Avisos que NÃO bloqueiam — reivindicação velha (>= teto de horas). */
  avisos: string[];
  /**
   * O `quem` de cada reivindicação que BLOQUEOU (dedup, na ordem em que
   * apareceu) — separado de `motivos` (texto para gente ler) porque quem
   * CHAMA (`scripts/reivindicar.mts`) precisa do valor estruturado para
   * reconhecer o ESQUEMA da identidade que bloqueou (FURO 2 do laudo de
   * qualidade da rodada 5: uma reivindicação viva sob esquema ANTIGO
   * — "wt-…" por worktree, ou uma string declarada à mão tipo "pm-…" —
   * pode ser a PRÓPRIA sessão, sob identidade que mudou de baixo dos pés
   * com a chegada da identidade por sessão). Parsear isto de dentro de
   * `motivos` (texto livre) seria frágil; melhor devolver estruturado.
   */
  quemColidiu: string[];
};

export type ResultadoDoRegistro = {
  ok: boolean;
  /** Um problema por par de reivindicações vivas em conflito. REPROVA. */
  problemas: string[];
  /**
   * Um aviso ALTO por par de reivindicações vivas que colidem mas cuja colisão
   * foi FORÇADA, com motivo de substância, pela saída de emergência sancionada
   * (`--forcar --motivo "<por quê>"`). NÃO reprova — mas quem lê precisa poder
   * julgar se a justificativa se sustenta, então cada aviso carrega os DOIS
   * donos, os arquivos em comum e o motivo escrito de cada lado que forçou.
   *
   * Ver `conferirRegistro` para o porquê desta régua existir.
   */
  avisos: string[];
};

/**
 * Piso de substância do motivo de uma forçada, em caracteres.
 *
 * Mesmo raciocínio (e mesma ordem de grandeza) do `MINIMO_DE_CONTEUDO` que
 * `lib/agency/esteira/conteudo.ts` já usa para separar entrega de cartão
 * vazio. Não se duplica a constante de lá porque `lib/coordenacao/` é puro e
 * não importa a esteira — mas a régua é a mesma ideia: texto abaixo disto não
 * é justificativa, é carimbo.
 */
export const MINIMO_DE_MOTIVO_FORCADO = 40;

/** Quantas palavras DISTINTAS o motivo precisa ter. O piso de caracteres
 *  sozinho é comprável com uma palavra repetida ("urgente urgente urgente…")
 *  ou com uma fileira de pontuação; contar palavras distintas fecha isso. */
export const MINIMO_DE_PALAVRAS_DO_MOTIVO = 6;

/**
 * O motivo de uma forçada tem substância suficiente para valer como
 * justificativa auditável?
 *
 * Deliberadamente MAIS DURO que "não vazio": a forçada é a saída de
 * emergência sancionada da casa, e o que a mantém honesta é o rastro que ela
 * deixa. Um ponto final, uma palavra ("urgente"), ou a mesma palavra repetida
 * até encher o piso de caracteres não podem COMPRAR uma forçada — quem lê o
 * aviso depois precisa conseguir julgar a decisão pelo texto.
 *
 * Duas réguas, as duas obrigatórias:
 *   • pelo menos `MINIMO_DE_MOTIVO_FORCADO` caracteres depois do trim;
 *   • pelo menos `MINIMO_DE_PALAVRAS_DO_MOTIVO` palavras DISTINTAS (>= 2
 *     letras/dígitos cada, comparadas sem acento e sem caixa — a mesma
 *     canonização de `normalizarResponsabilidade`, para "ARQUIVO" e "arquivo"
 *     contarem como uma palavra só).
 */
export function motivoDeForcadaTemSubstancia(motivo: string | null | undefined): boolean {
  if (typeof motivo !== "string") return false;
  const texto = motivo.trim();
  if (texto.length < MINIMO_DE_MOTIVO_FORCADO) return false;

  const distintas = new Set(
    normalizarResponsabilidade(texto)
      .split("/")
      .map((p) => p.replace(/[^\p{L}\p{N}]/gu, ""))
      .filter((p) => p.length >= 2),
  );
  return distintas.size >= MINIMO_DE_PALAVRAS_DO_MOTIVO;
}

/**
 * A forçada SANCIONADA desta reivindicação, ou `null` se não há uma.
 *
 * Só conta como sancionada quando as três coisas valem juntas:
 *   • existe `forcadaPor`;
 *   • o motivo tem substância (`motivoDeForcadaTemSubstancia`);
 *   • quem forçou é o PRÓPRIO dono da reivindicação (`forcadaPor.quem ===
 *     r.quem`) — ninguém força em nome de outra sessão. É esse casamento que
 *     faz `forcadaPor.quem` significar "quem assumiu o risco"; sem ele o
 *     rastro de auditoria não aponta para ninguém em particular.
 *
 * Fail-closed de propósito: qualquer uma das três faltando, a colisão volta a
 * REPROVAR como sempre reprovou. A saída de emergência não pode ser mais fácil
 * de usar errado do que de usar certo.
 */
export function forcadaSancionada(r: Reivindicacao): { quem: string; motivo: string; em: string } | null {
  const f = r.forcadaPor;
  if (!f) return null;
  if (f.quem !== r.quem) return null;
  if (!motivoDeForcadaTemSubstancia(f.motivo)) return null;
  return f;
}

/** 24h — o teto padrão da casa. Sessão que morre sem encerrar não pode travar
 *  a frente para sempre (guardrail 5: a proteção não pode ser mais destrutiva
 *  que o problema que ela existe para evitar). */
export const TETO_HORAS_PADRAO = 24;

/** O que "achar um sinal de SESSÃO no ambiente" devolve — não só de
 *  worktree. `ancora` é o valor a somar à derivação (`null` = não achei
 *  nenhum sinal). `degradado` é verdadeiro exatamente quando `ancora` é
 *  `null`, e carrega o motivo em `motivo` para quem chama AVISAR em voz
 *  alta — nunca decidir isto em silêncio (ver a RODADA 5 no cabeçalho de
 *  `derivarIdentidade`, abaixo). */
export type AncoraDeSessao = { ancora: string | null; degradado: boolean; motivo?: string };

/**
 * As três leituras cruas de que `calcularAncoraDeSessao` precisa — cada uma
 * já resolvida por quem chama (o script, que fala com `process.env` e
 * `/proc`). Esta função nunca lê env nem `/proc` diretamente: é por isso que
 * ela é testável sem processo real (FURO 4 do laudo de qualidade da rodada
 * 5 — "descobrirAncoraDeSessao" não era exercitada por nenhum teste, porque
 * a leitura de I/O estava misturada com a régua).
 */
export type FonteDeAncora = {
  /** `process.env.CLAUDE_CODE_SESSION_ID`, ou `null` se ausente/vazia. */
  sessionId: string | null;
  /** `process.env.CLAUDE_PID`, ou `null` se ausente/vazia (ainda como texto — o parse de número é regra, não I/O, e mora aqui dentro). */
  pidBruto: string | null;
  /** Lê o starttime (campo 22 de `/proc/<pid>/stat`) do PID dado — `null` se
   *  não existir/não for legível. Injetada, nunca chamada por esta função
   *  diretamente: é a única peça que ainda depende do SO, e fica isolada
   *  atrás de uma função para o teste poder fabricar qualquer um dos três
   *  ramos sem `/proc` de verdade. */
  starttimeDoPid: (pid: number) => string | null;
};

/**
 * A régua PURA por trás de `descobrirAncoraDeSessao` (em
 * `scripts/reivindicar.mts`) — mesma separação que `derivarIdentidade` já
 * usa: nenhuma leitura de env/`/proc`/git/disco/rede aqui, só interpretação
 * do que já foi lido. Três ramos, na mesma ordem de preferência da RODADA 5
 * (ver o cabeçalho de `derivarIdentidade`, abaixo):
 *
 *   (a) `sessionId` presente → usa direto, `degradado: false`;
 *   (b) `sessionId` ausente, `pidBruto` presente e `starttimeDoPid(pid)`
 *       devolve algo → `pid:<pid>:<starttime>`, `degradado: false`;
 *   (c) nenhum dos dois → `ancora: null`, `degradado: true`, com o motivo
 *       pronto para quem chama avisar em voz alta.
 */
export function calcularAncoraDeSessao(fonte: FonteDeAncora): AncoraDeSessao {
  const sessionId = fonte.sessionId?.trim();
  if (sessionId) {
    return { ancora: sessionId, degradado: false };
  }

  const pidTexto = fonte.pidBruto?.trim();
  if (pidTexto) {
    const pid = Number.parseInt(pidTexto, 10);
    if (Number.isFinite(pid) && pid > 0) {
      const starttime = fonte.starttimeDoPid(pid);
      if (starttime) {
        return { ancora: `pid:${pid}:${starttime}`, degradado: false };
      }
    }
  }

  return {
    ancora: null,
    degradado: true,
    motivo:
      'não consegui achar "CLAUDE_CODE_SESSION_ID" nem "CLAUDE_PID" (com "/proc/<pid>/stat" legível) neste ' +
      "ambiente — não dá para distinguir SESSÕES dentro do mesmo worktree aqui. A identidade caiu para o " +
      'worktree inteiro (prefixo "wt-", como na rodada 4): duas sessões neste MESMO caminho vão calcular a ' +
      "MESMA identidade, e a trava não vai enxergar colisão entre elas. Se isto é CI ou um terminal fora do " +
      "Claude Code, é esperado — mas fique ciente do risco.",
  };
}

/**
 * A função PURA por trás da identidade da sessão: recebe um caminho absoluto
 * (o RAIZ de um worktree) e uma ÂNCORA DE SESSÃO opcional, e devolve a
 * identidade derivada dos dois. Mora aqui — no módulo puro, sem I/O e sem
 * rede — porque é exatamente isso que ela é: nenhuma chamada a env, `/proc`,
 * git, disco ou rede, só hash de string. Toda DESCOBERTA da âncora (ler
 * `CLAUDE_CODE_SESSION_ID`, ler `/proc/<pid>/stat`) é I/O e mora em
 * `scripts/reivindicar.mts` (`descobrirAncoraDeSessao`) — esta função só
 * recebe o resultado já pronto como argumento.
 *
 * Dois modos, e o prefixo do resultado DIZ qual foi usado:
 *
 *   • `ancoraDeSessao` presente (RODADA 5, 16/08/2026): a identidade passa a
 *     depender de `caminhoAbsoluto + "|" + ancoraDeSessao`, prefixo "ses-".
 *     Isto é o que faltava na rodada 4 — duas sessões no MESMO worktree
 *     (o caso normal desta casa: o worktree principal é compartilhado)
 *     calculavam a MESMA identidade só de `caminhoAbsoluto`, o que já
 *     produziu um falso negativo medido em disco (duas sessões distintas,
 *     ambas "wt-09f81bb764") e, pelo lado oposto, uma sessão barrada pela
 *     PRÓPRIA reivindicação porque o rótulo em cache (arquivo único no
 *     worktree) foi sobrescrito por outra sessão. Com a âncora, sessões
 *     distintas no mesmo worktree divergem sem que ninguém precise digitar
 *     nada — a mesma garantia da rodada 4 (determinística, impossível de
 *     herdar, impossível de digitar errado), agora por SESSÃO.
 *   • `ancoraDeSessao` ausente/vazia (o modo DEGRADADO, preservado da
 *     rodada 4, prefixo "wt-"): sem sinal de sessão no ambiente, a
 *     identidade cai para o worktree inteiro — sessões diferentes no mesmo
 *     worktree voltam a ficar indistinguíveis entre si. Isto é seguro só
 *     porque quem chama (`comandoAbrir`/`comandoConferir`, em
 *     `scripts/reivindicar.mts`) AVISA em voz alta sempre que cai aqui —
 *     nunca em silêncio (ver `descobrirAncoraDeSessao` e `calcularAncoraDeSessao`).
 *
 * Os dois espaços de valores ("ses-" e "wt-") são disjuntos por construção
 * (prefixo diferente): uma identidade "wt-" (degradada, ou de antes da
 * rodada 5) nunca é confundida com uma "ses-" (com âncora de sessão).
 */
export function derivarIdentidade(caminhoAbsoluto: string, ancoraDeSessao?: string | null): string {
  if (!ancoraDeSessao) {
    const hash = createHash("sha256").update(caminhoAbsoluto, "utf8").digest("hex");
    return "wt-" + hash.slice(0, 10);
  }
  const hash = createHash("sha256").update(`${caminhoAbsoluto}|${ancoraDeSessao}`, "utf8").digest("hex");
  return "ses-" + hash.slice(0, 10);
}

/**
 * minúsculas, sem acento, separador único "/".
 *
 * Aceita que quem digita a responsabilidade use espaço, `_`, `\` ou `/`
 * misturados — é texto de gente, não de máquina — e reduz tudo a um único
 * formato canônico. É esta canonização que faz "comercial/verba-vs-estimativa"
 * e "Comercial / Verba Vs Estimativa" colidirem: sem ela, o caso 2 do
 * 16/08/2026 (nomes de ARQUIVO diferentes, mesma responsabilidade) não seria
 * pego só por texto ligeiramente diferente.
 */
export function normalizarResponsabilidade(s: string): string {
  const semAcento = Array.from(s.normalize("NFD"))
    // A forma NFD separa toda letra acentuada em "letra-base" + "marca
    // combinante" (ex.: "ê" vira "e" + acento circunflexo à parte). Descartar
    // o que sobra nessa faixa de código apaga o acento sem tocar na letra.
    //
    // Comparação por NÚMERO decimal de código de caractere — não por regex
    // com faixa `\uXXXX` nem por caractere literal colado no arquivo — porque
    // as duas formas anteriores já saíram corrompidas ao serem escritas aqui
    // (o editor normaliza/renderiza o escape antes de gravar). Número decimal
    // não tem como ser "renderizado" errado.
    .filter((ch) => {
      const codigo = ch.codePointAt(0) ?? 0;
      const ehMarcaCombinante = codigo >= 768 && codigo <= 879; // bloco Unicode "Combining Diacritical Marks"
      return !ehMarcaCombinante;
    })
    .join("");

  return semAcento
    .toLowerCase()
    .trim()
    .split(/[\\/\s_]+/) // qualquer um destes conta como separador
    .filter(Boolean)
    .join("/");
}

/** sem `./`, sem barra final. Só o suficiente para "a/b" e "./a/b/" contarem
 *  como o mesmo caminho — sem virar um resolvedor de path completo, que este
 *  arquivo não precisa (não há sistema de arquivos aqui). */
export function normalizarCaminho(p: string): string {
  let out = p.trim().replace(/\\/g, "/");
  while (out.startsWith("./")) out = out.slice(2);
  while (out.length > 1 && out.endsWith("/")) out = out.slice(0, -1);
  return out;
}

/** Nome do arquivo que grava esta responsabilidade em `reivindicacoes/`.
 *  Um arquivo por reivindicação: duas sessões pegando a MESMA responsabilidade
 *  colidem no MESMO nome de arquivo — o sinal que se quer, e de graça, porque
 *  o próprio git recusa dois arquivos iguais sem que ninguém escreva a régua
 *  duas vezes. */
export function nomeDoArquivo(responsabilidadeNormalizada: string): string {
  return `${responsabilidadeNormalizada.replace(/\//g, "-")}.json`;
}

/** Dois caminhos "se tocam" quando são iguais OU um é prefixo de diretório do
 *  outro — nunca quando um é só prefixo de TEXTO do outro (`lib/email` não
 *  pode colidir com `lib/email-templates`). */
function seTocam(a: string, b: string): boolean {
  if (a === b) return true;
  return a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
}

/**
 * Encerrada nunca está viva. Aberta há mais de `tetoHoras` NÃO bloqueia —
 * devolve "velha", não "viva". Ver o guardrail 5 no cabeçalho do arquivo:
 * trava eterna é trava que alguém arranca por fora, e aí ela para de proteger
 * qualquer coisa.
 */
export function estaViva(r: Reivindicacao, agora: Date, tetoHoras: number = TETO_HORAS_PADRAO): EstadoDaReivindicacao {
  if (r.encerradaEm) return "encerrada";
  const abertaEmMs = Date.parse(r.abertaEm);
  if (Number.isNaN(abertaEmMs)) return "velha"; // data ilegível não pode bloquear ninguém
  const horas = (agora.getTime() - abertaEmMs) / (1000 * 60 * 60);
  return horas > tetoHoras ? "velha" : "viva";
}

/**
 * A régua de colisão — duas regras independentes, cada uma pega um dos casos
 * reais de 16/08/2026:
 *
 *   • mesma responsabilidade normalizada → colide (caso 2: nomes de arquivo
 *     diferentes, mesma pergunta respondida duas vezes);
 *   • sobreposição de arquivo (igual ou prefixo de pasta) → colide (casos 1 e 3).
 *
 * Reivindicação encerrada nunca colide. Reivindicação velha entra em
 * `avisos`, nunca em `motivos` — ela NÃO bloqueia. A própria reivindicação do
 * mesmo `quem` nunca colide consigo mesma (reabrir/conferir a própria frente
 * não pode acusar a própria sessão de invasão).
 */
export function conferirColisao(
  nova: PropostaDeReivindicacao,
  existentes: Reivindicacao[],
  agora: Date,
  tetoHoras: number = TETO_HORAS_PADRAO,
): ResultadoDeColisao {
  const motivos: string[] = [];
  const avisos: string[] = [];
  const quemColidiu: string[] = [];

  const respostaDaNova = normalizarResponsabilidade(nova.responsabilidade);
  const arquivosDaNova = nova.arquivos.map(normalizarCaminho);

  for (const existente of existentes) {
    if (existente.quem === nova.quem) continue; // nunca colide consigo mesma

    const estado = estaViva(existente, agora, tetoHoras);
    if (estado === "encerrada") continue;

    const mesmaResponsabilidade = normalizarResponsabilidade(existente.responsabilidade) === respostaDaNova;
    const arquivosDaExistente = existente.arquivos.map(normalizarCaminho);
    const arquivoEmComum = arquivosDaNova.find((a) => arquivosDaExistente.some((b) => seTocam(a, b)));

    if (!mesmaResponsabilidade && !arquivoEmComum) continue;

    const motivo = mesmaResponsabilidade
      ? `mesma responsabilidade "${existente.responsabilidade}" já reivindicada por ${existente.quem} (frente: "${existente.frente}")`
      : `arquivo "${arquivoEmComum}" já reivindicado por ${existente.quem} (frente: "${existente.frente}")`;

    if (estado === "velha") {
      avisos.push(`[reivindicação velha, não bloqueia] ${motivo} — aberta em ${existente.abertaEm}.`);
    } else {
      motivos.push(motivo);
      if (!quemColidiu.includes(existente.quem)) quemColidiu.push(existente.quem);
    }
  }

  return { colide: motivos.length > 0, motivos, avisos, quemColidiu };
}

/**
 * O registro inteiro contra si mesmo — usado pelo sentinela que roda em
 * `npm test`. Reusa `conferirColisao` par a par (mesma régua do `abrir`, de
 * propósito: duas réguas para a mesma pergunta divergem no dia em que alguém
 * "otimiza" uma delas — ver `porta-de-emergencia.ts` para o mesmo raciocínio
 * aplicado ao sentinela do deploy).
 *
 * ── O SENTINELA PASSA A LER `forcadaPor` (30/08/2026) ──────────────────────
 *
 * `--forcar --motivo "<por quê>"` é a saída de emergência SANCIONADA desta
 * casa: ela existe, é oficial, `scripts/reivindicar.mts` a valida (recusa
 * `--forcar` sem `--motivo`), grava `forcadaPor` com o texto e imprime o
 * rastro em voz alta. Só que NENHUMA régua de colisão lia esse campo —
 * `forcadaPor` era escrito, validado e impresso, e nada mais. Este laço era
 * um dos que não o liam.
 *
 * O efeito, medido em disco em 30/08/2026: duas frentes colidiram em
 * `prisma/schema.prisma`, as duas usaram a saída sancionada, as duas
 * escreveram justificativas corretas e auditadas — e o sentinela reprovou
 * assim mesmo, deixando a suíte da casa VERMELHA e travando TODOS os PRs do
 * repositório. As duas justificativas diziam a mesma coisa, e ela estava
 * certa: era colisão de ARQUIVO, não de responsabilidade — as duas frentes só
 * ACRESCENTAVAM modelo ao schema, zero remoções, perguntas disjuntas, e o
 * merge da base rodou sem um único conflito.
 *
 * A régua agora é esta, e as duas metades andam juntas:
 *
 *   • colisão FORÇADA, com motivo de substância (`forcadaSancionada`) → AVISO
 *     ALTO, não reprovação;
 *   • colisão NÃO forçada → REPROVA exatamente como antes, sem nenhum
 *     afrouxamento.
 *
 * O RACIOCÍNIO, para quem for mexer nisto depois: um mecanismo que PUNE quem
 * usa a saída sancionada ensina todo mundo a não usá-la — e aí a colisão volta
 * a ser silenciosa, que é exatamente o que este sentinela existe para impedir.
 * O defeito não era a regra; era o sentinela não ler o campo que a própria
 * regra manda preencher.
 *
 * BASTA UM DOS DOIS LADOS ter forçado, e isso não é frouxidão: quem chega
 * PRIMEIRO abre limpo, não tem contra o que forçar, e nunca vai ter
 * `forcadaPor`. Exigir os dois lados deixaria a saída de emergência sem efeito
 * justamente no par em que ela foi usada — o defeito de novo, com outra roupa.
 * O que fecha o buraco é o piso de `forcadaSancionada` (motivo com substância,
 * assinado pelo próprio dono) e o aviso alto, que põe os dois motivos na cara
 * de quem lê para ele julgar se a justificativa se sustenta.
 */
export function conferirRegistro(reivindicacoes: Reivindicacao[], agora: Date, tetoHoras: number = TETO_HORAS_PADRAO): ResultadoDoRegistro {
  const problemas: string[] = [];
  const avisos: string[] = [];

  for (let i = 0; i < reivindicacoes.length; i++) {
    for (let j = i + 1; j < reivindicacoes.length; j++) {
      const a = reivindicacoes[i]!;
      const b = reivindicacoes[j]!;

      // `conferirColisao` foi escrita para o comando `abrir`, onde só o lado
      // "existente" pode estar morto — a "nova" acabou de nascer, então ela
      // nunca é nem encerrada nem velha. Aqui os dois lados são reivindicações
      // DE VERDADE, e o laço par a par passa `a` no papel de "nova":
      // `conferirColisao` só olha o estado de `b`, e o de `a` passaria em
      // branco. Por isso a checagem simétrica mora aqui, e não dentro de
      // `conferirColisao` — mexer nela quebraria o uso do `abrir`.
      //
      // ── E ELA VALE PARA "VELHA", NÃO SÓ PARA "ENCERRADA" (25/08/2026) ────
      //
      // Estava só `=== "encerrada"`, e o efeito foi medido no branch padrão:
      // uma reivindicação ABERTA EM 16/08 e nunca encerrada — 213 horas, quase
      // nove vezes o teto de 24h — reprovou a CI de uma frente aberta hoje, e
      // com ela TODA implantação do repositório. A sessão dona daquele arquivo
      // não existe mais para encerrá-lo.
      //
      // Isso contradizia o guardrail 5 escrito no cabeçalho deste arquivo, que
      // `estaViva` já implementa: *sessão que morre sem encerrar não pode
      // travar a frente para sempre — trava eterna é trava que alguém arranca
      // por fora, e aí ela para de proteger qualquer coisa.* O teto existia, e
      // este laço era o único lugar da casa que não o consultava: bastava a
      // morta cair na posição `a` do par.
      //
      // A régua agora é a que o tipo do resultado já prometia — "um problema
      // por par de reivindicações VIVAS em conflito". Nada foi afrouxado: duas
      // reivindicações vivas dentro do teto colidem exatamente como antes.
      if (estaViva(a, agora, tetoHoras) !== "viva" || estaViva(b, agora, tetoHoras) !== "viva") continue;

      const r = conferirColisao(a, [b], agora, tetoHoras);
      if (!r.colide) continue;

      const par = `"${a.id}" (${a.quem}) × "${b.id}" (${b.quem})`;
      const forcadaA = forcadaSancionada(a);
      const forcadaB = forcadaSancionada(b);

      if (!forcadaA && !forcadaB) {
        problemas.push(`${par}: ${r.motivos.join("; ")}`);
        continue;
      }

      avisos.push(avisoDeColisaoForcada(par, a, b, r.motivos, forcadaA, forcadaB));
    }
  }

  return { ok: problemas.length === 0, problemas, avisos };
}

/**
 * O texto do AVISO ALTO de uma colisão forçada.
 *
 * Aviso invisível é o mesmo que aviso nenhum: quem lê precisa dos DOIS donos,
 * dos arquivos em comum e do MOTIVO ESCRITO de cada lado que forçou — é com
 * isso, e só com isso, que dá para julgar se a justificativa se sustenta. O
 * lado que NÃO forçou é nomeado como tal, de propósito: normalmente é quem
 * chegou primeiro e abriu limpo, e essa assimetria é informação, não lacuna.
 */
function avisoDeColisaoForcada(
  par: string,
  a: Reivindicacao,
  b: Reivindicacao,
  motivosDaColisao: string[],
  forcadaA: { quem: string; motivo: string; em: string } | null,
  forcadaB: { quem: string; motivo: string; em: string } | null,
): string {
  const arquivosDeB = b.arquivos.map(normalizarCaminho);
  const arquivosEmComum = a.arquivos
    .map(normalizarCaminho)
    .filter((x) => arquivosDeB.some((y) => seTocam(x, y)));

  const linhaDoLado = (r: Reivindicacao, f: { quem: string; motivo: string; em: string } | null): string =>
    f
      ? `   FORÇADA por ${f.quem} em ${f.em}\n      frente ..: "${r.frente}"\n      motivo ..: "${f.motivo}"`
      : `   NÃO forçada: ${r.quem} — "${r.frente}" (abriu sem colidir com ninguém, ou não registrou forçada).`;

  return [
    `🚨 COLISÃO FORÇADA — AVISO ALTO, não reprova: ${par}`,
    `   colisão ....: ${motivosDaColisao.join("; ")}`,
    `   arquivo(s) em comum: ${arquivosEmComum.length > 0 ? arquivosEmComum.join(", ") : "(nenhum — a colisão é de RESPONSABILIDADE, não de arquivo)"}`,
    linhaDoLado(a, forcadaA),
    linhaDoLado(b, forcadaB),
    `   ⚠️  Ninguém conferiu isto por você. Leia os motivos acima e julgue se as duas frentes`,
    `      realmente não se pisam. Se pisam, a saída é conversa entre as duas sessões e`,
    `      \`npm run reivindicar -- encerrar\` pelo DONO da frente — nunca conserto de arquivo alheio.`,
  ].join("\n");
}

/**
 * Extrai os CAMINHOS de linhas CRUAS de `git status --porcelain` — cada
 * elemento do array é UMA linha, exatamente como veio de `String.split("\n")`
 * sobre a saída bruta, **sem** a string inteira ter passado por `.trim()`
 * antes de dividir.
 *
 * ── DEFEITO 2 (medido em 16/08/2026, EXERCITANDO "npm run reivindicar --
 * abrir" com o working tree sujo, não lendo o código) ───────────────────────
 * A implementação antiga lia a saída de "git status --porcelain" assim:
 * `execFileSync(...).trim().split("\n")`. O formato porcelain v1 é
 * "XY CAMINHO" (dois caracteres de status + um espaço = 3 de prefixo) — e o
 * código de status de um arquivo modificado e NÃO staged é " M" (o "X" é um
 * ESPAÇO). Quando essa é a PRIMEIRA linha da saída, `.trim()` na string
 * INTEIRA remove esse espaço aí — só dali, porque `.trim()` só mexe nas
 * pontas da string toda, não em cada linha. O resultado: a primeira linha
 * perdia um caractere ANTES do `slice(3)` rodar, e
 * "__tests__/coordenacao/reivindicacoes.test.ts" virava
 * "_tests__/coordenacao/reivindicacoes.test.ts" — um caminho que não existe
 * em disco e não é colável em lugar nenhum. Só a primeira linha sofria;
 * exatamente o padrão observado no exercício real do comando.
 *
 * A correção estrutural: quem LÊ o processo (`scripts/reivindicar.mts`) nunca
 * mais aplica `.trim()` na saída inteira antes de dividir por linha — só
 * remove o '\r' de fim de linha (CRLF) e linhas totalmente vazias, aqui
 * dentro, DEPOIS de já estar dividida. Esta função é pura por isso: dá para
 * testar o parsing sem precisar de um `git status` de verdade.
 */
export function caminhosDoStatusPorcelain(linhasCruas: string[]): string[] {
  return linhasCruas
    .map((l) => l.replace(/\r$/, ""))
    .filter((l) => l.length > 0)
    .map((l) => l.slice(3).trim()) // "XY CAMINHO" — os 2 primeiros chars são o código de status, +1 de separador
    .filter(Boolean)
    .map((l) => (l.includes(" -> ") ? l.split(" -> ")[1]! : l)); // renomeios: "de -> para"
}

/** Os campos que TODO JSON de `reivindicacoes/` precisa ter. Usado pelo
 *  sentinela para reprovar arquivo malformado, e citado aqui — não duplicado —
 *  para o teste e a validação nunca divergirem sobre o que é "obrigatório". */
export const CAMPOS_OBRIGATORIOS: ReadonlyArray<keyof Reivindicacao> = [
  "id",
  "quem",
  "frente",
  "responsabilidade",
  "arquivos",
  "abertaEm",
  "encerradaEm",
];

function ehDataIsoValida(v: unknown): v is string {
  return typeof v === "string" && v.length > 0 && !Number.isNaN(Date.parse(v));
}

/**
 * Valida um JSON cru (de disco ou de `git show`) contra o formato de
 * `Reivindicacao`. Lança com uma mensagem que nomeia o arquivo de origem e o
 * campo — quem lê o erro do sentinela não pode ter que adivinhar qual dos
 * arquivos está quebrado.
 */
export function validarReivindicacao(dado: unknown, origem: string): Reivindicacao {
  if (typeof dado !== "object" || dado === null || Array.isArray(dado)) {
    throw new Error(`${origem}: não é um objeto JSON válido.`);
  }
  const d = dado as Record<string, unknown>;

  for (const campo of CAMPOS_OBRIGATORIOS) {
    if (!(campo in d)) throw new Error(`${origem}: falta o campo obrigatório "${campo}".`);
  }
  if (typeof d.id !== "string" || !d.id.trim()) throw new Error(`${origem}: "id" tem que ser string não vazia.`);
  if (typeof d.quem !== "string" || !d.quem.trim()) throw new Error(`${origem}: "quem" tem que ser string não vazia.`);
  if (typeof d.frente !== "string" || !d.frente.trim()) throw new Error(`${origem}: "frente" tem que ser string não vazia.`);
  if (typeof d.responsabilidade !== "string" || !d.responsabilidade.trim()) {
    throw new Error(`${origem}: "responsabilidade" tem que ser string não vazia.`);
  }
  if (!Array.isArray(d.arquivos) || d.arquivos.length === 0 || d.arquivos.some((a: unknown) => typeof a !== "string")) {
    throw new Error(`${origem}: "arquivos" tem que ser uma lista não vazia de strings.`);
  }
  if (!ehDataIsoValida(d.abertaEm)) throw new Error(`${origem}: "abertaEm" tem que ser data ISO-8601 válida.`);
  if (d.encerradaEm !== null && !ehDataIsoValida(d.encerradaEm)) {
    throw new Error(`${origem}: "encerradaEm" tem que ser null ou data ISO-8601 válida.`);
  }
  // "rotulo" é OPCIONAL e nunca decide posse (ver o comentário no tipo
  // `Reivindicacao`) — mas, se vier, tem que ser string, para não deixar
  // lixo de tipo entrar no registro sem ninguém notar.
  if (d.rotulo !== undefined && typeof d.rotulo !== "string") {
    throw new Error(`${origem}: "rotulo", se presente, tem que ser string.`);
  }

  const reivindicacao: Reivindicacao = {
    id: d.id,
    quem: d.quem,
    frente: d.frente,
    responsabilidade: d.responsabilidade,
    arquivos: d.arquivos as string[],
    abertaEm: d.abertaEm,
    encerradaEm: (d.encerradaEm as string | null) ?? null,
  };
  if (typeof d.rotulo === "string") reivindicacao.rotulo = d.rotulo;

  if (d.forcadaPor !== undefined) {
    const f = d.forcadaPor;
    if (
      typeof f !== "object" ||
      f === null ||
      typeof (f as Record<string, unknown>).quem !== "string" ||
      typeof (f as Record<string, unknown>).motivo !== "string" ||
      typeof (f as Record<string, unknown>).em !== "string"
    ) {
      throw new Error(`${origem}: "forcadaPor" presente mas malformado (precisa de quem/motivo/em, todos string).`);
    }
    const ff = f as { quem: string; motivo: string; em: string };
    reivindicacao.forcadaPor = { quem: ff.quem, motivo: ff.motivo, em: ff.em };
  }

  if (d.degradadaPor !== undefined) {
    const g = d.degradadaPor;
    if (
      typeof g !== "object" ||
      g === null ||
      typeof (g as Record<string, unknown>).motivo !== "string" ||
      typeof (g as Record<string, unknown>).em !== "string"
    ) {
      throw new Error(`${origem}: "degradadaPor" presente mas malformado (precisa de motivo/em, ambos string).`);
    }
    const gg = g as { motivo: string; em: string };
    reivindicacao.degradadaPor = { motivo: gg.motivo, em: gg.em };
  }

  return reivindicacao;
}
