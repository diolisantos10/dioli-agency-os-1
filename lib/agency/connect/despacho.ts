// O DESPACHO DO DIOLI CONNECT — e a regra de que quem executou é que carimba.
//
// ─── A MEDIÇÃO QUE ORIGINOU ESTE ARQUIVO ───────────────────────────────────
//
// Medido em 30/08/2026 pelo Diretor Geral, no mecanismo de acionamento da
// plataforma: **ele devolve "sucesso" e não entrega nada.** Um despachante que
// responde 200 por ter conseguido POSTAR é um despachante que mente sobre o
// mundo — e quem lê a resposta não tem como saber.
//
// Determinação literal, e é o coração desta porta:
//
//   "O despachante disse ok é proibido como prova. Quem executou é que carimba."
//
// Então esta função NÃO deriva o resultado do que ela mesma fez. Ela chama o
// executor de verdade (`executarFuncao`), e depois **relê do banco** a linha de
// `ExecucaoV2` que o executor mandou gravar. O identificador que volta na
// resposta é o id daquela linha, lido de volta — não um id que esta função
// inventou, não um booleano que ela deduziu.
//
// ─── OS TRÊS ESTADOS, E O TERCEIRO NUNCA PASSA POR VERDE ───────────────────
//
//   executado        → há linha em ExecucaoV2, com início, fim e artefato.
//   recusado         → o motor disse não, com o motivo (ficha desligada, modo
//                      errado, entrada faltando, gatilho humano…).
//   nao_verificavel  → tudo o mais: o motor estourou, o trabalho falhou nas
//                      tentativas, ou a linha não voltou do banco. NUNCA vira
//                      sucesso, e o motivo vem junto.
//
// A ordem dos testes importa: `executado` só é devolvido DEPOIS da releitura.
// Se a releitura falhar ou vier vazia, o estado cai para `nao_verificavel`
// mesmo com o executor tendo dito "executado" — fail-closed até o fim.

// ─── E O QUE A AUDITORIA INDEPENDENTE DE 30/08/2026 ACRESCENTOU AQUI ───────
//
// Três defeitos ALTOS foram reproduzidos contra banco real neste arquivo, e os
// três tinham a mesma forma: **uma prova que provava menos do que dizia.**
//
//   A-2 — o `correlationId` era aceito de quem chama e `antecedentes` filtrava
//         só por ele. Fio alheio ⇒ leitura da conversa de terceiro DENTRO do
//         artefato, e escrita da homologação DENTRO do fio do cliente pagante.
//         Conserto em duas travas: o formato do fio (`contrato.ts`, e repetido
//         aqui porque `despachar` é chamado direto) e a POSSE reconferida em
//         código sobre cada linha que o banco devolveu (`linhaPertenceAoFio`).
//
//   A-3 — o dossiê era a porta dos fundos da validação. Ver `chaves.ts`.
//
//   A-4 — a releitura provava que a linha EXISTE, não que ela é DESTA execução:
//         `if (!linha || !linha.fim || !linha.resultado)` e mais nada. Armazém
//         devolvendo linha de outra função, outro fio, outro cliente e datada
//         de 2020 resultava em `estado: "executado"`, HTTP 200 e
//         `prova.relido_do_banco: true` — com o texto alheio no `artefato`. O
//         irmão Foocci já tinha a trava (`linhaPertenceAoFio`, em
//         `src/services/connect/armazem.ts:98`) e a doutrina dela em uma frase:
//         **"o banco filtrou" não é o mesmo que "eu conferi".**
//
//   A-6 — `antecedentes` falhando virava 200 com `turnos_anteriores: 0` e um
//         `catch` vazio. "O fio está vazio" e "não consegui ler o fio" são
//         coisas muito diferentes, e tinham a mesma aparência.

import { specDaFuncao, type ResultadoDeSpec } from "@/lib/agency/catalogo-v2/specs";
import {
  executarFuncao,
  type AtorDaExecucao,
  type ContextoDeExecucao,
  type DependenciasDoExecutor,
  type ResultadoDaExecucao,
  type PacoteDeEscalada,
} from "@/lib/agency/execucao-v2/executor";
import type { RegistroDeExecucao } from "@/lib/agency/execucao-v2/registro";
import type { PerfilOrganizacional } from "@/lib/agency/organizacao/autoridade";
import {
  MOTIVO_SEM_CLIENTE_SINTETICO,
  type ClienteDeHomologacao,
} from "./cliente-de-homologacao";
import { realizarSinteticoDoConnect } from "./realizar-sintetico";
import {
  CHAVES_RESERVADAS_DO_GATEWAY,
  CHAVE_CLIENTE,
  CHAVE_COBRANCAS,
  CHAVE_FIO,
  CHAVE_HISTORICO,
  CHAVE_PERGUNTA,
  FIO_ILEGIVEL,
  FIO_LIDO,
} from "./chaves";
import {
  FUNCOES_PERMITIDAS,
  MODO_EXIGIDO,
  fioDoConnect,
  fioEDoConnect,
  motivoDeFioAlheio,
  type PedidoConferido,
} from "./contrato";

/** Quem assina a execução. Não é humano, e não é modelo de IA: é o motor de
 *  regras determinístico da homologação — e o rastro diz isso com estas
 *  palavras, porque registro que mente sobre o autor não serve de prova. */
export const ATOR_DO_CONNECT: AtorDaExecucao = {
  ator: "ia",
  modelo: "rule-based-sintetico",
  versaoModelo: "connect-v1",
};

/** A linha de execução como ela volta do banco — a prova relida. */
export interface LinhaDeExecucaoLida {
  id: string;
  funcaoId: string;
  departamentoId: string;
  correlationId: string;
  inicio: Date;
  fim: Date | null;
  resultado: string | null;
  ator: string;
  modelo: string | null;
  custoUsd: number | null;
  /** ⭐ De quem é a linha. Entrou em 30/08/2026: sem este campo não existe
   *  conferência de posse possível — era o que faltava para o A-2 e o A-4. */
  clienteId: string | null;
}

/**
 * ⭐ O DONO DE UM FIO — as três coordenadas que fazem uma linha ser "minha".
 *
 * Não basta o `correlationId`: ele é o que o auditor forjou. Uma linha é deste
 * despacho quando as TRÊS batem — o fio, o cliente que o gateway resolveu no
 * banco, e uma função que esta porta pode despachar.
 */
export interface DonoDoFio {
  correlationId: string;
  clienteId: string;
  funcoes: readonly string[];
}

/**
 * A RECONFERÊNCIA EM CÓDIGO do que o banco devolveu — o equivalente desta casa
 * ao `linhaPertenceAoFio` do irmão Foocci (`src/services/connect/armazem.ts:98`).
 *
 * "O banco filtrou" não é o mesmo que "eu conferi", e a distância entre as duas
 * frases é o defeito A-4 inteiro: a consulta pode ser trocada numa refatoração,
 * o armazém pode ser um dublê, o índice pode mudar — e nada disso alcança esta
 * função, que compara os campos da linha que está na mão. Sem ela, bastaria um
 * armazém devolver a linha errada para a porta assinar embaixo.
 */
export function linhaPertenceAoFio(linha: LinhaDeExecucaoLida, dono: DonoDoFio): boolean {
  if (linha.correlationId !== dono.correlationId) return false;
  if (linha.clienteId !== dono.clienteId) return false;
  return dono.funcoes.includes(linha.funcaoId);
}

/**
 * ⭐ A LEITURA DO FIO, dita em voz alta (defeito A-6).
 *
 * O fio continua sendo CONTEXTO e não portão — perder a leitura não derruba o
 * despacho, e isso é decisão antiga desta porta. O que mudou é que o fracasso
 * deixou de ser invisível: quem lê a resposta distingue, sem adivinhar, "o fio
 * está vazio" de "eu não consegui ler o fio". E quando `lido` é `false`, o
 * `turno` da resposta é um PISO, não um fato — está dito aqui e no artefato.
 */
export type LeituraDoFio =
  | { lido: true; turnos_anteriores: number }
  | { lido: false; turnos_anteriores: null; motivo: string };

/**
 * O armazém do Connect. Injetado de propósito: `despachar` não conhece Prisma,
 * e o teste que PROVA a execução usa a implementação de banco de verdade num
 * SQLite descartável (`armazem-prisma.ts`).
 */
export interface ArmazemDoConnect {
  gravarExecucao(registro: RegistroDeExecucao): Promise<{ id: string }>;
  gravarRecusa(recusa: {
    funcaoId: string;
    motivo: string;
    correlationId: string;
    clienteId?: string;
    em: Date;
  }): Promise<{ id: string }>;
  /** A RELEITURA. É esta chamada que transforma "eu gravei" em prova. */
  relerExecucao(id: string): Promise<LinhaDeExecucaoLida | null>;
  /**
   * O fio: as execuções que já aconteceram sob o mesmo fio — E do mesmo dono.
   *
   * A assinatura mudou em 30/08/2026 e a mudança é o conserto: antes ela
   * recebia só o `correlationId`, e um fio forjado devolvia a conversa de
   * outro cliente. Agora o recorte é o DONO inteiro, e mesmo assim o resultado
   * é reconferido em código por `linhaPertenceAoFio` — porque uma implementação
   * de armazém que ignore o recorte não pode conseguir mentir para o despacho.
   */
  antecedentes(dono: DonoDoFio): Promise<LinhaDeExecucaoLida[]>;
  /**
   * ⭐ QUEM ESCOLHE O CLIENTE. Não é quem chama — é isto, contra o banco.
   * Devolve `null` quando não há cliente sintético de homologação plantado, e
   * aí a porta recusa em vez de inventar um.
   */
  clienteDeHomologacao(): Promise<ClienteDeHomologacao | null>;
}

export interface DependenciasDoDespacho {
  armazem: ArmazemDoConnect;
  perfil: PerfilOrganizacional;
  agora(): Date;
  /** Injetável só para PROVAR que o corte do acionamento vira nao_verificavel. */
  realizar?: DependenciasDoExecutor["realizar"];
  /** Injetável só para teste; o padrão é o executor de verdade. */
  executar?: typeof executarFuncao;
  specDe?: (funcaoId: string) => ResultadoDeSpec;
}

export interface ProvaDaExecucao {
  /** Onde a prova mora, e que ela foi LIDA de volta — não deduzida. */
  tabela: "ExecucaoV2";
  relido_do_banco: true;
  execucaoId: string;
  /**
   * ⭐ DE QUAL EXECUÇÃO ISTO FOI RELIDO — os dois campos que a sonda 16 cobrava.
   *
   * A trava interna existia e está certa: as quatro conferências de identidade
   * logo antes do retorno de sucesso. Mas ela conferia **para si**. A resposta
   * declarava `relido_do_banco: true` e não publicava nada que permitisse a um
   * TERCEIRO refazer a conferência — quem lê tinha que acreditar. Um bloco que
   * se diz relido do banco tem que dizer de QUAL linha, e "qual" é o fio e a
   * função dela; sem isso, `relido_do_banco: true` é a mesma classe de
   * afirmação que "o despachante disse ok".
   *
   * Os dois vêm da LINHA, nunca do pedido — e isso não é promessa de
   * comentário: `provaDaLinha` não RECEBE o pedido. Ver a nota lá.
   */
  correlationId: string;
  funcao: string;
  inicio: string;
  fim: string;
  duracaoMs: number;
  ator: string;
  modelo: string | null;
  custoUsd: number | null;
}

/**
 * A PROVA, MONTADA A PARTIR DA LINHA RELIDA — e de mais nada.
 *
 * ⭐ A ASSINATURA É A TRAVA, e ela É o conserto. `prompt é aviso; código é
 * trava`: o defeito que a sonda 16 existe para pegar é uma prova que ECOA o
 * pedido de volta. Devolver `pedido.funcao` no lugar de `linha.funcaoId` daria
 * uma resposta idêntica no caminho feliz — as quatro conferências de identidade
 * garantem que os dois valores coincidem lá — e uma prova VAZIA no único
 * caminho em que ela importa, o de um armazém que devolve linha alheia. Ou
 * seja: um defeito que nenhum teste de caixa-preta consegue ver.
 *
 * Um comentário pedindo "leia da linha" seria aviso. Isto é trava: esta função
 * não recebe o pedido, então não existe caminho, dentro dela, em que o pedido
 * seja ecoado. Quem quiser reintroduzir o defeito tem que mudar a assinatura —
 * e aí o vermelho tem nome e endereço.
 *
 * `fim` entra no tipo do parâmetro (e não como `Date | null`) porque prova de
 * execução pela metade não é prova: quem chama já provou que a linha tem fim,
 * e o tipo carrega essa prova em vez de repeti-la aqui com um `!`.
 */
export function provaDaLinha(linha: LinhaDeExecucaoLida & { fim: Date }): ProvaDaExecucao {
  return {
    tabela: "ExecucaoV2",
    relido_do_banco: true,
    execucaoId: linha.id,
    correlationId: linha.correlationId,
    funcao: linha.funcaoId,
    inicio: linha.inicio.toISOString(),
    fim: linha.fim.toISOString(),
    duracaoMs: linha.fim.getTime() - linha.inicio.getTime(),
    ator: linha.ator,
    modelo: linha.modelo,
    custoUsd: linha.custoUsd,
  };
}

/**
 * ⚠️ O QUE A CONTROL ROOM LÊ PARA SABER QUE ISTO NÃO É O GERENTE FALANDO.
 *
 * Determinação do CEO (30/08/2026): a resposta determinística **continua
 * identificada como RASCUNHO**, e o campo que a Control Room lê tem que deixar
 * isso inequívoco. Antes a única declaração vivia DENTRO do artefato, num campo
 * `origem` que só aparece para quem abre o JSON e lê até o fim — quem lesse a
 * resposta de fora via `estado: "executado"` e mais nada.
 *
 * Agora são três campos no primeiro nível da resposta, e eles são redundantes
 * de propósito: um booleano para a máquina decidir, um rótulo curto para a tela,
 * e a frase inteira para quem for ler. Nenhum deles depende de abrir o artefato.
 */
export interface SeloDeRascunho {
  /** Para a máquina: nunca `false` enquanto não houver provedor de IA. */
  rascunho: true;
  /** Para a tela: uma palavra, em caixa alta, que não dá para ler como outra coisa. */
  natureza: "RASCUNHO";
  /** Para quem lê: o que isto é e o que isto não é. */
  aviso: string;
}

export const SELO_DE_RASCUNHO: SeloDeRascunho = {
  rascunho: true,
  natureza: "RASCUNHO",
  aviso:
    "RASCUNHO — saída de motor de regras determinístico, sem provedor de IA e sem credencial. NÃO é a " +
    "comunicação final e inteligente do gerente, e não deve ser apresentada como tal a cliente nenhum. " +
    "Serve para provar o acionamento e o rastro; a redação sobe quando o dono configurar um provedor.",
};

export type ResultadoDoDespacho =
  | ({
      estado: "executado";
      funcao: string;
      correlationId: string;
      /** O turno CONTADO. Só é fato quando `leitura_do_fio.lido` é `true`;
       *  com a leitura falha ele é um piso, e o campo ao lado diz isso. */
      turno: number;
      leitura_do_fio: LeituraDoFio;
      execucaoId: string;
      prova: ProvaDaExecucao;
      artefato: string;
      /** O cliente que o GATEWAY resolveu. Não veio no pedido; não podia vir. */
      cliente: ClienteDeHomologacao;
    } & SeloDeRascunho)
  | {
      estado: "recusado";
      funcao: string;
      correlationId: string;
      turno: number;
      leitura_do_fio: LeituraDoFio;
      motivo: string;
      recusaId: string | null;
      escalada?: PacoteDeEscalada;
      entradas_exigidas_pela_ficha?: string[];
    }
  | {
      estado: "nao_verificavel";
      funcao: string;
      correlationId: string;
      turno: number;
      leitura_do_fio: LeituraDoFio;
      motivo: string;
      /**
       * O id da linha gravada QUANDO houve uma.
       *
       * Era `null` fixo, e isso mentia no caso do A-5: a execução que estourou o
       * teto DEPOIS de concluir está gravada, e quem lê precisa poder ir olhar.
       * O estado continua `nao_verificavel` e o HTTP continua 502 — o que mudou
       * é que a resposta deixou de esconder a linha que existe.
       */
      execucaoId: string | null;
    };

/** O fio quando a leitura nem chegou a acontecer (recusa antes dos antecedentes). */
const FIO_NAO_CONSULTADO: LeituraDoFio = { lido: true, turnos_anteriores: 0 };

function entradasDoDespacho(
  pedido: PedidoConferido,
  cliente: ClienteDeHomologacao,
  antecedentes: LinhaDeExecucaoLida[],
  leitura: LeituraDoFio,
): Record<string, string> {
  // O fio tem duas fontes e as duas entram: o que o chamador mandou e o que o
  // BANCO já sabe sobre este fio. A segunda é a que sobrevive a um chamador que
  // perdeu o próprio histórico.
  const linhas: string[] = [];
  for (const t of pedido.historico) linhas.push(`${t.de}: ${t.texto}`);
  for (const a of antecedentes) {
    linhas.push(`execucao-anterior(${a.id}) em ${a.inicio.toISOString()}: ${a.funcaoId}`);
  }

  /** O que o GATEWAY apurou, chave a chave. Nada aqui vem do corpo do pedido
   *  sem ter passado por conferência: o cliente foi resolvido no banco, a
   *  pergunta e o histórico foram validados, a varredura passou pelo campo
   *  `cobrancas`, e a leitura do fio é o que o próprio despacho mediu. */
  const doGateway: Record<string, string> = {
    [CHAVE_CLIENTE]: cliente.nome,
    [CHAVE_PERGUNTA]: pedido.pergunta,
    [CHAVE_HISTORICO]: linhas.join("\n"),
    [CHAVE_COBRANCAS]: JSON.stringify(pedido.cobrancas),
    [CHAVE_FIO]: leitura.lido ? FIO_LIDO : `${FIO_ILEGIVEL}: ${leitura.motivo}`,
  };

  // ── ⭐ A PORTA DOS FUNDOS, FECHADA POR CÓDIGO (defeito A-3) ──────────────
  //
  // O dossiê entra primeiro; a LISTA de chaves reservadas escreve por cima
  // depois, INCONDICIONALMENTE — inclusive com valor vazio.
  //
  // "Incondicionalmente" é a palavra inteira do conserto. Antes, `historico` e
  // `cobrancas` só eram escritas SE houvesse conteúdo, e sem conteúdo o valor
  // que o chamador pôs no dossiê sobrevivia e virava "a apuração". O modelo a
  // seguir eram as duas que já funcionavam — cliente e pergunta, escritas
  // sempre.
  //
  // E a escrita percorre `CHAVES_RESERVADAS_DO_GATEWAY`, nunca as cinco à mão:
  // é isso que garante que a SEXTA chave reservada nasça protegida sem ninguém
  // lembrar. Uma chave da lista sem valor apurado vira string vazia — nunca o
  // texto de quem chamou. `contrato.ts` já recusa quem as mandar; esta trava é
  // a que vale contra CÓDIGO, porque `despachar` é chamado direto por teste e
  // por qualquer chamador interno futuro que não passe pelo conferidor.
  const entradas: Record<string, string> = { ...pedido.dossie };
  for (const chave of CHAVES_RESERVADAS_DO_GATEWAY) {
    entradas[chave] = doGateway[chave] ?? "";
  }
  return entradas;
}

/**
 * Escalada técnica x escalada por regra — e por que a distinção decide o estado.
 *
 * O executor usa `escalado` para TRÊS coisas muito diferentes: o "não sem
 * aprovação" da regra (gatilho humano da ficha, autonomia B diante de efeito
 * externo), a falha técnica depois de esgotadas as tentativas, e o estouro de
 * teto DEPOIS de a execução ter concluído e sido gravada. A primeira é um "não"
 * com motivo — é `recusado`. As outras duas não são sucesso — mas não são a
 * mesma coisa, e chamá-las pelo mesmo nome foi o defeito A-5.
 *
 * ─── POR QUE ISTO DEIXOU DE ADIVINHAR PELA PROSA ───────────────────────────
 *
 * A versão anterior discriminava por `gatilhos.length === 0` e por uma regex
 * sobre a FRASE que o executor escreve (`/^falha técnica/i`). Duas fontes
 * frágeis: o estouro pós-execução também vem sem gatilho, e por isso era
 * classificado como falha técnica e devolvido como *"o acionamento não se
 * completou"* — para uma execução que se completou e está gravada no banco. A
 * resposta era fail-closed (certo) e o motivo era falso (errado).
 *
 * Agora o executor DECLARA a natureza da escalada num campo, e esta função lê o
 * campo. Prosa não é contrato. O `??` no fim é a rede para um pacote vindo de
 * código antigo sem o campo, e ele mantém o padrão mais severo: sem declaração,
 * é falha técnica.
 */
export function escaladaEFalhaTecnica(pacote: PacoteDeEscalada): boolean {
  if (pacote.natureza) return pacote.natureza === "falha_tecnica";
  return pacote.gatilhos.length === 0 || /^falha t[ée]cnica/i.test(pacote.motivo);
}

/** A execução ACONTECEU e está gravada — o que estourou foi o teto, depois. */
export function escaladaEEstouroAposExecucao(pacote: PacoteDeEscalada): boolean {
  return pacote.natureza === "estouro_apos_execucao";
}

export async function despachar(
  pedido: PedidoConferido,
  deps: DependenciasDoDespacho,
): Promise<ResultadoDoDespacho> {
  const especificacao = (deps.specDe ?? specDaFuncao)(pedido.funcao);
  const exigidas = especificacao.ok ? especificacao.spec.entradas_obrigatorias : undefined;

  // ── ⭐ O FIO ALHEIO PARA AQUI, ANTES DE LER E ANTES DE ESCREVER (A-2) ─────
  //
  // `contrato.ts` já recusa isto na entrada da rota. A trava é repetida aqui de
  // propósito, e a repetição não é desleixo: `despachar` é chamado DIRETO por
  // teste e por qualquer chamador interno futuro, e o guardrail 4 da casa
  // ("prompt é aviso; código é trava") vale também contra código nosso. Um fio
  // aceito aqui contaminaria a escrita mesmo que a resposta fosse uma recusa —
  // porque a recusa também é gravada, e também com o `correlationId`.
  if (pedido.correlationId !== undefined && !fioEDoConnect(pedido.correlationId)) {
    return {
      estado: "recusado",
      funcao: pedido.funcao,
      correlationId: "connect:fio-recusado",
      turno: 0,
      leitura_do_fio: FIO_NAO_CONSULTADO,
      motivo: motivoDeFioAlheio(pedido.correlationId),
      recusaId: null,
    };
  }

  // ── ⭐ O CLIENTE É RESOLVIDO AQUI, ANTES DE QUALQUER COISA ACONTECER ──────
  //
  // Antes do executor, antes do fio, antes de qualquer linha ser gravada: se
  // não há cliente sintético de homologação, nada roda. Fail-closed — e a
  // recusa é NOMEADA, com o que falta, porque "não abriu" sem motivo obriga
  // quem chama a adivinhar.
  let cliente: ClienteDeHomologacao | null = null;
  try {
    cliente = await deps.armazem.clienteDeHomologacao();
  } catch (e) {
    return {
      estado: "nao_verificavel",
      funcao: pedido.funcao,
      correlationId: pedido.correlationId ?? "connect:sem-fio",
      turno: 0,
      leitura_do_fio: FIO_NAO_CONSULTADO,
      execucaoId: null,
      motivo: `a resolução do cliente sintético falhou: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
  if (!cliente) {
    return {
      estado: "recusado",
      funcao: pedido.funcao,
      correlationId: pedido.correlationId ?? "connect:sem-fio",
      turno: 0,
      leitura_do_fio: FIO_NAO_CONSULTADO,
      motivo: MOTIVO_SEM_CLIENTE_SINTETICO,
      recusaId: null,
    };
  }

  const correlationId = pedido.correlationId ?? fioDoConnect(cliente.nome);

  // ── ⭐ O DONO DO FIO — as três coordenadas, montadas UMA vez e usadas nas
  //    duas leituras (os antecedentes e a releitura da prova). ───────────────
  const dono: DonoDoFio = { correlationId, clienteId: cliente.id, funcoes: FUNCOES_PERMITIDAS };

  // ── O fio: contexto, não portão — mas o fracasso não é mais mudo (A-6) ────
  let antecedentes: LinhaDeExecucaoLida[] = [];
  let leituraDoFio: LeituraDoFio;
  try {
    const brutos = await deps.armazem.antecedentes(dono);
    // "O banco filtrou" não é o mesmo que "eu conferi": a consulta já recorta
    // por dono, e ainda assim cada linha é reconferida aqui. Uma implementação
    // de armazém que ignore o recorte não consegue mentir para o despacho.
    antecedentes = brutos.filter((l) => linhaPertenceAoFio(l, dono));
    leituraDoFio = { lido: true, turnos_anteriores: antecedentes.length };
  } catch (e) {
    // Perder o fio não derruba o despacho — mas some do silêncio: antes isto
    // era um `catch` vazio que virava `turnos_anteriores: 0`, indistinguível de
    // um fio de fato vazio. Agora quem lê a resposta sabe qual dos dois foi.
    antecedentes = [];
    leituraDoFio = {
      lido: false,
      turnos_anteriores: null,
      motivo: `a leitura do fio falhou: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
  const turno = antecedentes.length + 1;

  const contexto: ContextoDeExecucao = {
    modo: MODO_EXIGIDO,
    sintetico: true,
    entradas: entradasDoDespacho(pedido, cliente, antecedentes, leituraDoFio),
    // Nenhuma ferramenta é prevista: esta porta não toca o mundo, e ferramenta
    // não pedida é ferramenta que a ficha não precisa autorizar.
    ferramentasPrevistas: [],
    gatilhosDetectados: pedido.gatilhos,
    // `informar` é o MENOR efeito que existe. A porta corporativa consulta e
    // devolve; ela nunca pede autorização para preparar nem para publicar.
    efeito: "informar",
    custoPrevistoUsd: 0,
    correlationId,
    // Homologação não consulta flag de produção; escopo vazio é o honesto.
    escopos: [],
    // O id que vai para o rastro é o RESOLVIDO. Nunca mais um id que chegou no
    // corpo do pedido sem ninguém conferir de quem era.
    clienteId: cliente.id,
  };

  // O que o executor mandou gravar, capturado aqui para a releitura ter um id.
  let idGravado: string | null = null;
  let idDaRecusa: string | null = null;

  const dependenciasDoExecutor: DependenciasDoExecutor = {
    specDe: deps.specDe,
    async flagLigada() {
      // Em homologação o executor nem consulta a flag; se um dia consultar,
      // a resposta honesta é "não" — a porta do Connect não liga nada.
      return false;
    },
    async gravarExecucao(registro) {
      const { id } = await deps.armazem.gravarExecucao(registro);
      idGravado = id;
    },
    async gravarRecusa(recusa) {
      const { id } = await deps.armazem.gravarRecusa(recusa);
      idDaRecusa = id;
    },
    realizar: deps.realizar ?? realizarSinteticoDoConnect(deps.agora),
    agora: deps.agora,
  };

  let resultado: ResultadoDaExecucao;
  try {
    resultado = await (deps.executar ?? executarFuncao)(
      pedido.funcao,
      deps.perfil,
      contexto,
      ATOR_DO_CONNECT,
      dependenciasDoExecutor,
    );
  } catch (e) {
    // O motor estourou. Isto NUNCA é sucesso, e o motivo vai inteiro.
    return {
      estado: "nao_verificavel",
      funcao: pedido.funcao,
      correlationId,
      turno,
      leitura_do_fio: leituraDoFio,
      execucaoId: null,
      motivo: `o executor lançou antes de concluir: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  if (resultado.decisao === "recusado") {
    return {
      estado: "recusado",
      funcao: pedido.funcao,
      correlationId,
      turno,
      leitura_do_fio: leituraDoFio,
      motivo: resultado.motivo,
      recusaId: idDaRecusa,
      ...(exigidas ? { entradas_exigidas_pela_ficha: exigidas } : {}),
    };
  }

  if (resultado.decisao === "escalado") {
    // ── ⭐ A-5: o estouro DEPOIS do fato não é "o acionamento não se completou" ──
    //
    // O executor gravou a linha e SÓ ENTÃO viu que o custo ou a duração real
    // estourou o teto da ficha. A retenção é certa e continua — `nao_verificavel`
    // e HTTP 502, ninguém dá isto por bom. O que estava errado era só a frase:
    // ela dizia que o acionamento não aconteceu, e ele aconteceu, e está
    // gravado. Agora o motivo diz o que houve e a resposta ENTREGA o id, para
    // quem lê poder ir olhar a linha em vez de acreditar.
    if (escaladaEEstouroAposExecucao(resultado.pacote)) {
      return {
        estado: "nao_verificavel",
        funcao: pedido.funcao,
        correlationId,
        turno,
        leitura_do_fio: leituraDoFio,
        execucaoId: idGravado,
        motivo:
          `a execução SE COMPLETOU e está gravada em ExecucaoV2` +
          `${idGravado ? ` (${idGravado})` : ""}, e foi RETIDA por estourar o limite da ficha: ` +
          `${resultado.pacote.motivo}. Isto não é falha de acionamento — o trabalho aconteceu; o que não se ` +
          `pode dar por bom é o resultado, e por isso ele não sai como executado.`,
      };
    }
    if (escaladaEFalhaTecnica(resultado.pacote)) {
      return {
        estado: "nao_verificavel",
        funcao: pedido.funcao,
        correlationId,
        turno,
        leitura_do_fio: leituraDoFio,
        execucaoId: null,
        motivo: `o acionamento não se completou: ${resultado.pacote.motivo}`,
      };
    }
    return {
      estado: "recusado",
      funcao: pedido.funcao,
      correlationId,
      turno,
      leitura_do_fio: leituraDoFio,
      motivo: `escalado para humano — ${resultado.pacote.motivo}`,
      recusaId: idDaRecusa,
      escalada: resultado.pacote,
    };
  }

  // ── Daqui para baixo o executor disse "executado". Isso ainda NÃO é prova. ──
  if (!idGravado) {
    return {
      estado: "nao_verificavel",
      funcao: pedido.funcao,
      correlationId,
      turno,
      leitura_do_fio: leituraDoFio,
      execucaoId: null,
      motivo:
        "o executor concluiu mas nenhuma linha de ExecucaoV2 foi gravada — sem carimbo de quem executou, " +
        "não há o que verificar",
    };
  }

  let linha: LinhaDeExecucaoLida | null = null;
  try {
    linha = await deps.armazem.relerExecucao(idGravado);
  } catch (e) {
    return {
      estado: "nao_verificavel",
      funcao: pedido.funcao,
      correlationId,
      turno,
      leitura_do_fio: leituraDoFio,
      execucaoId: null,
      motivo: `a releitura da execução ${idGravado} falhou: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  if (!linha || !linha.fim || !linha.resultado) {
    return {
      estado: "nao_verificavel",
      funcao: pedido.funcao,
      correlationId,
      turno,
      leitura_do_fio: leituraDoFio,
      execucaoId: null,
      motivo: linha
        ? `a execução ${idGravado} está no banco sem fim ou sem resultado — execução pela metade não é execução`
        : `a execução ${idGravado} não voltou do banco — "eu gravei" não é prova de que gravou`,
    };
  }

  // ── ⭐ A-4: A LINHA EXISTE. FALTA PROVAR QUE ELA É DESTA EXECUÇÃO. ────────
  //
  // Até aqui a releitura provava só que ALGUMA linha voltou com fim e
  // resultado. O auditor fez o armazém devolver uma linha de outra função,
  // outro fio, outro cliente, datada de 2020 — e a porta respondeu 200,
  // `estado: "executado"`, `prova.relido_do_banco: true`, com o texto alheio
  // no `artefato`. A prova provava a existência de uma linha, não a identidade
  // dela; e uma prova que não é da coisa provada não é prova.
  //
  // Quatro conferências, e as quatro são baratas:
  //   • é o id que EU mandei reler (armazém que devolve outra linha para o
  //     mesmo id não passa);
  //   • é o meu fio, o meu cliente e uma função que esta porta despacha
  //     (`linhaPertenceAoFio`, o equivalente do irmão Foocci);
  //   • e é a função DESTE pedido, não uma qualquer da lista.
  const daExecucao: DonoDoFio = { ...dono, funcoes: [pedido.funcao] };
  if (linha.id !== idGravado || !linhaPertenceAoFio(linha, daExecucao)) {
    return {
      estado: "nao_verificavel",
      funcao: pedido.funcao,
      correlationId,
      turno,
      leitura_do_fio: leituraDoFio,
      execucaoId: null,
      motivo:
        `a linha relida do banco NÃO é a desta execução e foi descartada: pedi ${idGravado} do fio ` +
        `${correlationId}, função "${pedido.funcao}", cliente ${cliente.id}; voltou a linha ${linha.id} do fio ` +
        `${linha.correlationId}, função "${linha.funcaoId}", cliente ${linha.clienteId ?? "nenhum"}. ` +
        `Uma releitura só é prova quando prova a identidade — "existe uma linha" não é "é a minha linha".`,
    };
  }

  return {
    estado: "executado",
    // O selo vem PRIMEIRO no objeto, e no primeiro nível: quem lê a resposta
    // não precisa abrir o artefato para saber que isto é rascunho.
    ...SELO_DE_RASCUNHO,
    funcao: pedido.funcao,
    correlationId,
    turno,
    leitura_do_fio: leituraDoFio,
    execucaoId: linha.id,
    cliente,
    artefato: linha.resultado,
    // ⭐ A prova sai de `provaDaLinha`, e ela recebe A LINHA — não o pedido, não
    //    o `correlationId` local, não `pedido.funcao`. Ver a nota da função: é
    //    a assinatura dela que impede o eco, não a boa intenção deste retorno.
    prova: provaDaLinha({ ...linha, fim: linha.fim }),
  };
}
