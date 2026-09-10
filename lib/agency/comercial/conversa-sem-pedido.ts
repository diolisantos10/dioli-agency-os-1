// O RASTRO DA CONVERSA QUE NÃO VIROU PEDIDO — o sexto "trava sem fechadura",
// e o primeiro que some com o CLIENTE em vez de com o código.
//
// ─── O DEFEITO, MEDIDO EM 27/08/2026 (NÃO PRESUMIDO) ────────────────────────
//
// O cliente 001 (Foocci) conversou com o SDR às 01:34, o escopo apareceu montado
// na tela, o SDR se despediu — e a produção não tem UMA linha dele. Medido com
// sessão de master: `GET /api/brain/client-requests` devolve 19 registros (teto
// de 100, lista inteira) e nenhum é Foocci; `clients`, `messages`,
// `deliverables`, `activity-events`, `financeiro` e `gasto-de-ia` também não.
//
// A causa tem duas metades, e as duas precisavam de conserto:
//
// 1. **O ESCOPO SÓ EXISTIA NO NAVEGADOR.** O único caminho que grava um
//    `ClientRequestDb` é o botão de enviar (`app/briefing/page.tsx:72`), e o
//    botão é travado por `canSubmitProposal` (`lib/agency/sdr-agent.ts:368`),
//    que exige nome, negócio, serviço e **zero perguntas obrigatórias em
//    aberto**. Conversa que morre antes disso não tem porta de gravação
//    NENHUMA: o escopo acumulado vive em estado de React e morre com a aba.
//    O servidor RECEBIA esse escopo a cada turno (`body.scope`, em
//    `app/api/sdr/chat/route.ts`) e o jogava fora.
//
// 2. **O TEXTO ERA GRAVADO ONDE, POR DESENHO, NINGUÉM OLHA.**
//    `registrarTurnoDoSdr` grava cada turno em `PortalMessage` — mas com
//    `readByTeam: true, readByClient: true`, e o comentário diz o porquê em voz
//    alta: *"nasce lida dos dois lados para não virar fila do PM nem alarme
//    falso do raio-x"*. Some-se a isso que **todo leitor de `PortalMessage`
//    filtra por `clientId` de cliente real ou por `clientRequestId`** — e um fio
//    `sdr:` sem pedido não é lido por nada. A decisão 2 estava certa para o
//    fio que VIRA pedido, e é exatamente o que apaga o fio que NÃO vira.
//
// Resultado: a casa guardava o texto num lugar sem dono e sem alarme, e
// descartava o escopo em silêncio. **Coluna gravada não é cliente informado;
// conversa sem dono é cliente perdido.**
//
// ─── A RÉGUA QUE ESTE MÓDULO IMPLEMENTA ─────────────────────────────────────
//
// *Nenhuma conversa de cliente pode terminar sem deixar rastro recuperável.*
// Se o escopo não estiver completo, a casa **guarda o que tem** e **para com
// dono e próxima ação** — nunca descarta em silêncio.
//
// ─── POR QUE `ActivityEvent`, E NÃO TABELA NOVA ─────────────────────────────
//
// `ActivityEvent` já é onde esta casa registra parada com dono — é dele que sai
// o `caminho_automatico_parou` que o diário do piloto lê. Ele tem `type`,
// `clientId`, `workspaceId` e `timestamp` como COLUNAS, e o índice
// `@@index([type, timestamp])` já existe no schema. Zero migração num volume
// SQLite vivo, e a porta de leitura (`GET /api/activity-events`) já está no ar.
//
// ⚠️ O escopo viaja como JSON dentro de `message`, e isso NÃO é o blob que esta
// casa já condenou. A condenação (ver `ClientRequestDb.chaveDoProspect`) é sobre
// **indexar ou agrupar por dentro de um JSON no SQLite**, que o SQLite não faz.
// Aqui não se busca por dentro de nada: a busca é por `type` e por `clientId`,
// as duas colunas de verdade e as duas indexadas. O JSON é carga, não chave.
//
// ─── UM RASTRO POR FIO, NÃO UM POR TURNO ────────────────────────────────────
//
// Uma conversa de vinte turnos deixaria vinte linhas contando a mesma história
// com escopos cada vez mais completos, e quem lesse teria de adivinhar qual é a
// boa. O rastro é ATUALIZADO no lugar: o `timestamp` passa a ser "quando ela
// parou", que é a informação que decide quem se atende primeiro.

import { prisma } from "@/lib/db/client";
import { fioDaConversa } from "@/lib/agency/comercial/registro-da-conversa";
import { atribuicaoValida, type AtribuicaoDaCasa } from "@/lib/agency/comercial/dono-do-rastro";

/** O tipo do evento. Uma constante porque é lido em três lugares, e verdade
 *  escrita em três lugares já está errada em dois. */
export const TIPO_CONVERSA_SEM_PEDIDO = "conversa_sem_pedido";

/** Teto do JSON guardado. Escopo de briefing real vive na casa das unidades de
 *  KB; 20 mil caracteres é uma ordem de grandeza acima do maior já visto, e o
 *  alvo do teto é abuso da rota pública, não cliente. */
const TETO_DA_CARGA = 20_000;

/** O contato como a porta o declara. Nunca deduzido de arroba nem de nome de
 *  negócio — a inferência que esta casa proíbe. */
export type ContatoDoRastro = {
  nome?: string;
  email?: string;
  whatsapp?: string;
};

export type RastroDaConversa = {
  /** O fio (`sdr:...`), já higienizado. Nunca o id cru do navegador. */
  fio: string;
  /** O que o cliente já tinha contado quando a conversa parou. */
  escopo: Record<string, unknown>;
  /** `null` quando a pessoa não declarou canal — ausência, não erro. */
  contato: ContatoDoRastro | null;
  /** Quantos turnos a conversa teve. Um turno é curiosidade; doze é um lead. */
  turnos: number;
  /** Quando ela parou. */
  paradaEm: Date;
  /** De quem é a conversa, quando o SERVIDOR conseguiu derivar — ver
   *  `clienteDoConvite` na carga. `null` é o caso comum (visitante anônimo). */
  clienteDoConvite: string | null;
  /** De quem a CASA declarou que é a conversa, por ato de um operador com
   *  sessão de agência (`atribuir-conversa-orfa.ts`). É a segunda — e única
   *  outra — fonte honesta de dono, para os rastros v1 que não sabem de quem
   *  são. `null` é o caso comum. */
  atribuicao: AtribuicaoDaCasa | null;
  /** A quem a parada pertence. Necessário para o pedido nascer com dono. */
  workspaceId: string;
  /**
   * QUANDO A CASA PROMETEU CONTATO HUMANO — carimbo de 29/08/2026. `null` =
   * nenhuma fala desta conversa prometeu ("nossa equipe entra em contato" e
   * variantes — ver `lib/agency/esteira/promessa-de-contato.ts`). Uma vez
   * gravada, esta data NÃO se move: é a origem de uma dívida, não um contador
   * que reinicia a cada turno. Ver `guardarRastroDaConversa`.
   */
  prometidoEm: Date | null;
  /**
   * QUANDO UM HUMANO DA CASA CONTATOU ESTA PESSOA — carimbo de 29/08/2026, o
   * ato que SAI da dívida declarada por `prometidoEm`. `null` = ninguém
   * marcou ainda. Gravado por `marcarConversaComoContatada`
   * (`lib/agency/comercial/marcar-conversa-contatada.ts`), nunca deduzido. A
   * PRIMEIRA marcação vale — ver `guardarRastroDaConversa`.
   */
  contatadoEm: Date | null;
  /** O `userId` de quem marcou o contato. `null` quando `contatadoEm` é
   *  `null`. Nunca do corpo de uma requisição pública — só da sessão de
   *  agência que fez o ato. */
  contatadoPor: string | null;
};

/** O que sai gravado no `message`. Formato próprio e versionado: um leitor de
 *  amanhã precisa saber que forma está lendo antes de confiar nela. */
export type CargaDoRastro = {
  /** `1` é a forma original (sem `clienteDoConvite`); `2` a acrescenta; `3`
   *  acrescenta `atribuicao`; `4` acrescenta `prometidoEm`; `5` acrescenta
   *  `contatadoEm`/`contatadoPor`. As CINCO continuam sendo lidas: um rastro
   *  gravado ontem não pode virar ilegível hoje — ele é justamente o cliente
   *  que a casa já quase perdeu uma vez, e é um v1 que este conserto veio
   *  salvar. */
  v: 1 | 2 | 3 | 4 | 5;
  escopo: Record<string, unknown>;
  contato: ContatoDoRastro | null;
  turnos: number;
  /**
   * ═══ DE QUEM É ESTA CONVERSA — DERIVADO, NUNCA ACEITO ═══════════════════
   *
   * O `clientId` real de quem conversa NÃO existe na sala pública: o fio
   * (`sdr:...`) é texto do navegador e não é identidade de ninguém. A ÚNICA
   * origem honesta é o convite de parceria, que o servidor resolve por token
   * (`resolverConviteDeParceria`) e devolve o cliente — *derivação, não
   * comparação*.
   *
   * ⛔ NUNCA sai do corpo da requisição, e NUNCA se deduz de e-mail digitado no
   * chat: bastaria alguém escrever o e-mail de um parceiro para ser promovido a
   * pedido isento. Convite ausente, vencido ou revogado → `null` → a conversa
   * fica sendo o que sempre foi (uma parada com dono humano), e é isso que a
   * promoção automática exige para NÃO agir. Fail-closed.
   */
  clienteDoConvite?: string | null;
  /**
   * ═══ O ATO DECLARADO PELA CASA ═════════════════════════════════════════
   *
   * Escrito EXCLUSIVAMENTE por `atribuirRastroAoCliente`, chamada de uma rota
   * com sessão de AGÊNCIA. Nunca chega pelo corpo da rota pública do SDR: o
   * turno do chat sequer conhece este campo, e `guardarRastroDaConversa` o
   * PRESERVA do que já estava gravado em vez de aceitar um valor novo — ver a
   * leitura da carga existente lá embaixo.
   *
   * Declarar não é deduzir: a diferença está por extenso em `dono-do-rastro.ts`.
   */
  atribuicao?: AtribuicaoDaCasa | null;
  /**
   * ═══ QUANDO A CASA PASSOU A DEVER CONTATO ═══════════════════════════════
   *
   * ISO de quando uma fala do SDR prometeu contato humano pela primeira vez
   * (`prometeuContatoHumano`, em `lib/agency/esteira/promessa-de-contato.ts`).
   * `null`/ausente = nenhuma promessa ainda.
   *
   * ⚠️ A PRIMEIRA VALE. `guardarRastroDaConversa` PRESERVA este campo do que
   * já estava gravado — a mesma lei que já vale para `atribuicao` duas linhas
   * acima. A dívida nasce na primeira fala que prometeu; um turno seguinte que
   * repete "a equipe entra em contato" não empurra o relógio para frente.
   */
  prometidoEm?: string | null;
  /**
   * ═══ QUANDO UM HUMANO DA CASA CONTATOU ═══════════════════════════════════
   *
   * ISO de quando `marcarConversaComoContatada` gravou o ato pela primeira
   * vez. Escrito EXCLUSIVAMENTE por aquele módulo, chamado de uma rota com
   * sessão de AGÊNCIA — a mesma disciplina de `atribuicao` duas seções acima.
   * A rota pública do SDR sequer conhece este campo.
   *
   * ⚠️ A PRIMEIRA MARCAÇÃO VALE. `guardarRastroDaConversa` PRESERVA este
   * campo do que já estava gravado — a mesma lei de `atribuicao` e
   * `prometidoEm`. Sem isso, o próximo turno do SDR (que reescreve a carga
   * inteira a cada mensagem) apagaria em silêncio o ato de um humano que já
   * ligou ou escreveu para a pessoa — o mesmo defeito que a lei da
   * `atribuicao` existe para impedir.
   */
  contatadoEm?: string | null;
  /** O `userId` de quem marcou o contato — sempre da SESSÃO, nunca do corpo.
   *  Preservado junto com `contatadoEm`: a testemunha do ato original é a que
   *  vale, mesmo que outro operador reabra a mesma tela depois. */
  contatadoPor?: string | null;
};

/** Só os três campos que a PESSOA declara. Copiar o objeto inteiro do corpo da
 *  rota pública seria deixar o cliente escolher o que a casa guarda. */
function contatoLimpo(bruto: unknown): ContatoDoRastro | null {
  if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return null;
  const b = bruto as Record<string, unknown>;
  const texto = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, 200) : "");
  const contato: ContatoDoRastro = {};
  if (texto(b.nome))     contato.nome     = texto(b.nome);
  if (texto(b.email))    contato.email    = texto(b.email);
  if (texto(b.whatsapp)) contato.whatsapp = texto(b.whatsapp);
  return Object.keys(contato).length > 0 ? contato : null;
}

/**
 * A CARGA, LIDA DE UMA VEZ SÓ — usada pela listagem e pela atribuição.
 *
 * Uma segunda cópia deste `JSON.parse` em outro arquivo seria uma segunda régua
 * de "que forma é esta", e duas réguas divergem na primeira versão nova. Carga
 * ilegível vira `null`: quem chama decide o que fazer com "não sei ler", e
 * nenhum caminho trata `null` como permissão.
 */
export function lerCargaDoRastro(message: string): CargaDoRastro | null {
  try {
    const bruto = JSON.parse(message) as unknown;
    if (!bruto || typeof bruto !== "object") return null;
    const v = (bruto as CargaDoRastro).v;
    if (v !== 1 && v !== 2 && v !== 3 && v !== 4 && v !== 5) return null;
    return bruto as CargaDoRastro;
  } catch {
    return null;
  }
}

/**
 * GUARDA O QUE TEM. Chamado a cada turno do SDR, com o escopo acumulado.
 *
 * Não decide se a conversa foi abandonada — ninguém sabe isso no momento do
 * turno, e esperar para ter certeza é exatamente como o escopo se perdia. Grava
 * sempre; quem resolve o rastro é `resolverRastroDaConversa`, quando o pedido
 * nasce de verdade.
 *
 * ⚠️ **NUNCA LANÇA.** Rastro é nosso, a conversa é do cliente — a mesma decisão
 * 3 de `registro-da-conversa.ts`. Um erro de banco não pode transformar uma
 * resposta pronta em tela de erro para o prospect. Devolve `false` e segue.
 */
export async function guardarRastroDaConversa(input: {
  sessionId: unknown;
  /** `null` quando a rota pública não resolveu dono — ver a guarda abaixo. */
  workspaceId: string | null;
  escopo: unknown;
  contato?: unknown;
  turnos?: number;
  /** O cliente DERIVADO do convite de parceria pelo servidor. Ver a carga. */
  clienteDoConvite?: string | null;
  /**
   * A FALA DESTE TURNO prometeu contato humano? (`prometeuContatoHumano`,
   * calculado por quem chama — este módulo não lê texto de fala, só carimba).
   * `true` grava `prometidoEm = agora` SE ainda não havia um; `false`/ausente
   * não apaga um carimbo já existente — ver a leitura de `anterior` abaixo.
   */
  prometeuContato?: boolean;
}): Promise<boolean> {
  const fio = fioDaConversa(input.sessionId);

  // SEM DONO, NÃO GRAVA. `workspaceDaRotaPublica` devolve `null` quando não há
  // workspace resolvido, e `ActivityEvent.workspaceId` é obrigatório no schema.
  //
  // A saída errada seria carimbar um workspace qualquer para a linha caber: o
  // rastro apareceria na lista de uma agência que nunca falou com essa pessoa.
  // Falha fechada é a mesma escolha que o teto de gasto faz três linhas adiante
  // na rota — sem dono, não age. E o custo aqui é o de antes deste conserto,
  // não um custo novo.
  if (!input.workspaceId) return false;

  // Escopo vazio não é rastro: uma conversa em que a pessoa não contou NADA não
  // tem o que recuperar, e uma linha por visitante que só disse "oi" enche a
  // lista de quem precisa ser atendido com quem não pediu nada. Ausência de
  // informação não é informação — nos dois sentidos.
  const escopo =
    input.escopo && typeof input.escopo === "object" && !Array.isArray(input.escopo)
      ? (input.escopo as Record<string, unknown>)
      : {};
  if (Object.keys(escopo).length === 0) return false;

  const cliente = typeof input.clienteDoConvite === "string" ? input.clienteDoConvite.trim() : "";

  try {
    // Um por fio. `findFirst` + `update`/`create` em vez de `upsert` porque
    // `(type, clientId)` não é chave única no schema, e inventar uma exigiria
    // migração num volume vivo para resolver um problema que duas consultas
    // sobre índice já resolvem.
    const existente = await prisma.activityEvent.findFirst({
      where: { type: TIPO_CONVERSA_SEM_PEDIDO, clientId: fio },
      select: { id: true, message: true },
    });

    // ⚠️ A ATRIBUIÇÃO DA CASA SOBREVIVE AO PRÓXIMO TURNO.
    //
    // Este `update` reescreve a carga inteira. Sem esta linha, um operador
    // atribuiria a conversa órfã e o turno seguinte do cliente — ou uma aba
    // esquecida aberta — apagaria o ato em silêncio, sem ninguém saber. A
    // atribuição NÃO chega por `input`: ela só pode ser preservada do que já
    // estava gravado, o que também é a trava de que a rota pública do SDR não
    // consegue escrevê-la nem por acidente.
    const anterior = existente ? lerCargaDoRastro(existente.message) : null;
    const atribuicao = atribuicaoValida(anterior?.atribuicao);

    // ═══ A PRIMEIRA PROMESSA É A QUE VALE ═══════════════════════════════════
    //
    // Mesma lei da `atribuicao` duas linhas acima: a dívida nasce na primeira
    // fala que prometeu contato, e o turno seguinte não reinicia o relógio. Se
    // já havia `prometidoEm` gravado (mesmo que malformado — aceita qualquer
    // string não vazia, porque quem grava esta carga é sempre este mesmo
    // módulo), preserva. Só grava um novo quando NÃO havia nenhum e a fala de
    // agora prometeu.
    const prometidoEmAnterior =
      typeof anterior?.prometidoEm === "string" && anterior.prometidoEm ? anterior.prometidoEm : null;
    const prometidoEm =
      prometidoEmAnterior ?? (input.prometeuContato ? new Date().toISOString() : null);

    // ═══ O ATO DO HUMANO SOBREVIVE AO PRÓXIMO TURNO ═══════════════════════
    //
    // Mesma lei de `atribuicao` e `prometidoEm`, três linhas acima: este
    // `update` reescreve a carga inteira a cada turno do SDR. Sem preservar
    // aqui, um cliente que reabre a aba depois de já ter sido contatado por
    // um humano apagaria esse ato em silêncio — ninguém saberia, e a fila
    // voltaria a cobrar um contato que já aconteceu. `contatadoEm`/
    // `contatadoPor` NUNCA chegam por `input`: a rota pública do SDR não
    // conhece este campo, só `marcarConversaComoContatada` o escreve.
    const contatadoEm =
      typeof anterior?.contatadoEm === "string" && anterior.contatadoEm ? anterior.contatadoEm : null;
    const contatadoPor =
      typeof anterior?.contatadoPor === "string" && anterior.contatadoPor ? anterior.contatadoPor : null;

    const carga: CargaDoRastro = {
      v: 5,
      escopo,
      contato: contatoLimpo(input.contato),
      turnos: typeof input.turnos === "number" && input.turnos > 0 ? Math.floor(input.turnos) : 1,
      // Ausente vira `null`, nunca string vazia: `null` é "não sei de quem é", e
      // é o valor que a promoção automática lê como "não agir".
      clienteDoConvite: cliente || null,
      atribuicao,
      prometidoEm,
      contatadoEm,
      contatadoPor,
    };
    const message = JSON.stringify(carga).slice(0, TETO_DA_CARGA);

    if (existente) {
      await prisma.activityEvent.update({
        where: { id: existente.id },
        data: { message, timestamp: new Date() },
      });
    } else {
      await prisma.activityEvent.create({
        data: {
          workspaceId: input.workspaceId,
          type: TIPO_CONVERSA_SEM_PEDIDO,
          clientId: fio,
          message,
        },
      });
    }
    return true;
  } catch (e) {
    console.error(
      `[conversa-sem-pedido] rastro não guardado: ${e instanceof Error ? e.message : String(e)}`,
    );
    return false;
  }
}

/**
 * A CONVERSA VIROU PEDIDO — o rastro deixa de ser uma parada.
 *
 * Sem isto a lista mentiria para cima: toda conversa bem-sucedida apareceria
 * para sempre como abandonada, e uma lista que acusa o que está certo é uma
 * lista que se aprende a ignorar — o mesmo alarme cego do `cron-execute`.
 *
 * Não lança: um rastro que sobra é ruído visível, e ruído visível é muito menos
 * caro que um briefing perdido. Fail-open aqui é a escolha certa e é a exceção.
 */
export async function resolverRastroDaConversa(sessionId: unknown): Promise<number> {
  const fio = fioDaConversa(sessionId);
  // `fioDaConversa` devolve `sdr:sem-sessao` para entrada vazia. Apagar por esse
  // fio limparia o rastro de TODAS as conversas sem id de sessão de uma vez —
  // um envio sem sessão apagaria a parada de outra pessoa.
  if (fio.endsWith("sem-sessao")) return 0;
  try {
    const r = await prisma.activityEvent.deleteMany({
      where: { type: TIPO_CONVERSA_SEM_PEDIDO, clientId: fio },
    });
    return r.count;
  } catch (e) {
    console.error(
      `[conversa-sem-pedido] rastro não resolvido: ${e instanceof Error ? e.message : String(e)}`,
    );
    return 0;
  }
}

/**
 * O MESMO "resolver", pelo FIO JÁ PRONTO.
 *
 * `resolverRastroDaConversa` recebe o id CRU do navegador e o higieniza. Quem
 * já tem o fio (`sdr:...`) não pode passar por lá: `fioDaConversa("sdr:abc")`
 * tira os dois-pontos e devolve `sdr:sdrabc` — apagaria um rastro que não
 * existe e deixaria o verdadeiro de pé, ressuscitando a conversa a cada rodada.
 *
 * Não lança, pelo mesmo motivo da irmã: rastro que sobra é ruído visível, e
 * ruído visível custa muito menos que um briefing perdido.
 */
export async function resolverRastroPeloFio(fio: string): Promise<number> {
  const limpo = fio.trim();
  if (!limpo || limpo.endsWith("sem-sessao")) return 0;
  try {
    const r = await prisma.activityEvent.deleteMany({
      where: { type: TIPO_CONVERSA_SEM_PEDIDO, clientId: limpo },
    });
    return r.count;
  } catch (e) {
    console.error(
      `[conversa-sem-pedido] rastro não resolvido: ${e instanceof Error ? e.message : String(e)}`,
    );
    return 0;
  }
}

/**
 * AS CONVERSAS QUE PARARAM — com dono e próxima ação.
 *
 * Ordenadas pela mais recente: uma conversa de dez minutos atrás ainda dá para
 * salvar; uma de dez dias virou história.
 */
export async function conversasSemPedido(
  /** `null` lê TODOS os workspaces — e só o relógio faz isso. Ele não tem
   *  sessão, logo não tem workspace, e a promoção precisa varrer a casa
   *  inteira. Toda porta com gente do outro lado passa o workspace da sessão:
   *  é a mesma fronteira de inquilino que `orcamento-do-briefing.ts` já
   *  declarou, e ela não se afrouxa por conveniência de leitura. */
  workspaceId: string | null,
  teto = 50,
): Promise<RastroDaConversa[]> {
  const linhas = await prisma.activityEvent.findMany({
    where: { type: TIPO_CONVERSA_SEM_PEDIDO, ...(workspaceId ? { workspaceId } : {}) },
    orderBy: { timestamp: "desc" },
    take: Math.min(teto, 200),
    select: { clientId: true, message: true, timestamp: true, workspaceId: true },
  });

  const rastros: RastroDaConversa[] = [];
  for (const l of linhas) {
    // Carga ilegível não derruba a lista inteira: uma linha corrompida
    // esconderia todas as outras conversas perdidas, que é o contrário do
    // motivo desta função existir.
    const carga = lerCargaDoRastro(l.message);
    if (!carga) continue;
    rastros.push({
      fio: l.clientId ?? "",
      escopo: carga.escopo ?? {},
      contato: carga.contato ?? null,
      turnos: carga.turnos ?? 1,
      paradaEm: l.timestamp,
      // Rastro v1 não tem o campo — e ausência é `null`, "não sei de quem é",
      // nunca um cliente escolhido para a linha caber.
      clienteDoConvite: typeof carga.clienteDoConvite === "string" && carga.clienteDoConvite
        ? carga.clienteDoConvite
        : null,
      // Conferida campo a campo pela régua pura: meia atribuição não é
      // atribuição, e uma forma que não confere não vira dono.
      atribuicao: atribuicaoValida(carga.atribuicao),
      workspaceId: l.workspaceId,
      // `v1`/`v2`/`v3` não têm o campo — ausência é `null`, "ainda não
      // prometeu", nunca uma data inventada para a linha caber.
      prometidoEm:
        typeof carga.prometidoEm === "string" && carga.prometidoEm ? new Date(carga.prometidoEm) : null,
      // `v1`–`v4` não têm o campo — ausência é `null`, "ninguém marcou ainda".
      contatadoEm:
        typeof carga.contatadoEm === "string" && carga.contatadoEm ? new Date(carga.contatadoEm) : null,
      contatadoPor:
        typeof carga.contatadoPor === "string" && carga.contatadoPor ? carga.contatadoPor : null,
    });
  }
  return rastros;
}

/**
 * A PRÓXIMA AÇÃO, derivada do que o rastro TEM — nunca uma frase constante.
 *
 * Uma frase fixa ("procurar o cliente") é a mesma para quem deixou e-mail e para
 * quem não deixou nada, e as duas exigem coisas opostas de quem vai atender.
 */
export function proximaAcaoDoRastro(rastro: RastroDaConversa): string {
  const c = rastro.contato;

  // ═══ A CASA JÁ CONTATOU — sai da dívida, sem prometer o que vem depois ═════
  //
  // Isto vem ANTES da checagem de `prometidoEm`: uma vez que um humano marcou
  // o contato, a frase deixa de cobrar — ela não vira "retomar por e-mail" de
  // novo, e também não finge que a promessa nunca existiu. Diz o que é FATO
  // (a casa já agiu) e nada além disso: nenhum prazo novo, nenhuma garantia de
  // que a pessoa vai responder.
  if (rastro.contatadoEm) {
    return "A casa já contatou esta pessoa — aguardando a pessoa responder.";
  }

  // ═══ A CASA PROMETEU — o tom muda de "pode" para "deve" ═══════════════════
  //
  // "Retomar por e-mail" é uma sugestão de oportunidade; quando o SDR disse
  // "nossa equipe entra em contato" a mesma linha é uma DÍVIDA com data de
  // origem, não uma ideia de quem ler a fila. Nenhum prazo é inventado aqui —
  // SLA de resposta é LACUNA de decisão do CEO (ver a rota de leitura) — mas o
  // fato de já ter sido prometido, isso o código sabe, e diz.
  if (rastro.prometidoEm) {
    if (c?.email || c?.whatsapp) {
      const canal = c.email ? "e-mail" : "WhatsApp";
      return `A casa PROMETEU contato e ainda não cumpriu — responder por ${canal} é dívida, não sugestão.`;
    }
    if (c?.nome) {
      return "A casa PROMETEU contato, mas não há canal declarado — a dívida existe e não há como cumpri-la sozinho.";
    }
    return "A casa PROMETEU contato sem ter canal nem nome — a dívida existe e não há a quem cobrar.";
  }

  if (c?.email || c?.whatsapp) {
    const canal = c.email ? "e-mail" : "WhatsApp";
    return `Retomar por ${canal}: a conversa parou com escopo pela metade e o canal está declarado.`;
  }
  if (c?.nome) {
    return "Sem canal declarado — só o nome. Não há como retomar sozinho; depende de a pessoa voltar.";
  }
  return "Sem contato nenhum. O rastro serve para medir quantas conversas morrem na sala, não para retomar esta.";
}
