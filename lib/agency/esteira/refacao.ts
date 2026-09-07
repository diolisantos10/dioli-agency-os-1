// refacao.ts — O CLIENTE PEDIU MUDANÇA. É a hora mais perigosa da relação.
//
// O buraco: o portal tinha os três botões — aprovar, pedir revisão, reprovar —
// e SÓ o de proposta fazia alguma coisa. Quando a aprovação era de uma ENTREGA,
// o clique do cliente gravava um status no banco e acabava ali. Nada era
// refeito, ninguém era avisado, e do lado dele a tela dizia "revisão
// solicitada" para sempre. É a pior forma de falhar que existe: o cliente
// acredita que pediu, a agência não sabe que foi pedido, e o silêncio é lido
// como descaso.
//
// O que este arquivo garante: pedido de mudança do cliente é refeito na hora,
// COM AS PALAVRAS DELE na mão do especialista, e o cliente é avisado do que
// mudou. Sem gente no meio.
//
// O teto existe pelo motivo oposto do da Qualidade. Lá, o teto protege o
// dinheiro de IA. Aqui, o teto protege a RELAÇÃO: se o cliente pediu a mesma
// peça três vezes, o problema não é a peça — é um desentendimento sobre o que
// ele quer, e mais uma rodada de IA só aumenta a frustração dele. Na terceira,
// vira gente.
//
// ── 05/08/2026: o mesmo bug sobrevivia pelo OUTRO ramo ───────────────────────
// Tudo aqui dentro era ancorado SÓ em `clientRequestId`, e a rota do portal só
// chamava esta função quando o card tinha esse campo. Card de CLIENTE DIRETO
// (criado por /api/social-posts/aprovacao, que nasce só com `clientId` — o caso
// Foocci) caía fora do `if`: o cliente escrevia o que queria mudar, a peça virava
// "revision_requested", o comentário ficava gravado, e NADA acontecia. Não
// refazia, não escalava, não avisava. O portal dizia "Ajustes solicitados" para
// sempre — que é literalmente o defeito que este arquivo dizia ter consertado.
//
// A regra nova é a mesma que a conversa já adotou (`app/api/messages/conversa.ts`):
// o pedido pertence ao CLIENTE, não à solicitação. A leitura une as duas chaves,
// a escrita carimba as duas quando ambas são deriváveis, e nenhuma chave nula
// entra em filtro — `{ clientId: null }` casaria com todo registro órfão do
// banco, que é vazamento entre clientes.
//
// E o SILÊNCIO deixou de ser possível: quando não há projeto (cliente direto,
// posts sem entregável), esta função não devolve mais um objeto e vai embora —
// ela escala para a equipe e escreve no portal antes de retornar. Pedido de
// cliente que não chega a ninguém é a pior falha que esta casa conhece.

import { prisma } from "@/lib/db/client";
import { renderizarEntrega, ESQUEMA_DA_ENTREGA, quantosItens, itensDaEntrega } from "@/lib/agency/esteira/renderizar-entrega";
import { escopoDoAjuste, congelarItens, motivoDoCongelamento } from "@/lib/agency/esteira/escopo-do-ajuste";
import { buildVerdadeOperacional } from "@/lib/dioli-brain/client-snapshot";
import { generate } from "@/lib/ai/generate";
import { TODOS_OS_ESPECIALISTAS, conferirContrato } from "@/lib/agency/execution/especialistas";
import { contratoDoPedido } from "@/lib/agency/esteira/contrato-do-pedido";
import { conferirPisoDeVerdade, resumirViolacoes, instrucaoGemea, type VerdadeDoCliente } from "@/lib/agency/execution/piso-de-verdade";
import { preservarVersaoAtual, registrarNovaVersao } from "@/lib/agency/esteira/versoes";
import { lerProibicoes, registrarProibicoes } from "@/lib/agency/esteira/proibicoes";
import { STATUS_DA_PECA_RECUSADA } from "@/lib/agency/portal/decisoes-do-portal";
import {
  auditDeliverable, revisionStatusDoVeredito, arbitragemDoVeredito, type Arbitragem,
  foiAprovadaPelaQualidade, foiReprovadaPelaQualidade, camposDaDecisaoHumana,
} from "@/lib/agency/execution/quality-auditor";
import { entregaMostradaPorDepartamento } from "@/lib/agency/esteira/pacote";
import { conferirPagamentoDaAncora } from "@/lib/agency/financeiro/portao-de-pagamento";
import { refazerArteDoAjuste, AVISO_DA_ARTE_QUE_NAO_SAIU, type ArteDoAjuste } from "@/lib/agency/esteira/refazer-a-arte-do-ajuste";
import { pecasDoEspecialista } from "@/lib/agency/esteira/producao-de-pedido";
import { pecasApontadasPeloAjuste } from "@/lib/agency/esteira/mira-da-peca";
import { miraPorNomeDaEntrega } from "@/lib/agency/esteira/mira-por-nome";
import { VOZ_DO_CLIENTE } from "@/lib/agency/gerencia/voz-unica";
import {
  classificarParada,
  causaDasViolacoesDoPiso,
  MAX_TENTATIVAS_TRANSITORIAS,
  MAX_REFACOES_DO_CLIENTE,
  CONVITE_A_DECIDIR,
  valeChamarAIa,
  PARADAS_QUE_NAO_MUDAM,
  causaDaParadaAnterior,
  carimboDaParada,
  type ParadaDoAjuste,
} from "@/lib/agency/esteira/porta-do-ajuste";

/** Quantas vezes a máquina refaz por pedido do CLIENTE antes de virar gente.
 *  O número mora em `porta-do-ajuste.ts`, com a frase que o cliente lê — duas
 *  cópias divergem, e a que divergir vai ser a da tela. Reexportado porque
 *  meio mundo já importa daqui. */
export { MAX_REFACOES_DO_CLIENTE } from "@/lib/agency/esteira/porta-do-ajuste";

export interface RefacaoFeita {
  /** Entregas efetivamente refeitas, pelo nome. */
  refeitas: string[];
  /** Ids das `DeliverableVersion` recém-nascidas — a rodada nova de aprovação
   *  precisa registrar QUAL versão será decidida (Fase 2, T3/T7). */
  versoesNovas: string[];
  /**
   * O QUE ACONTECEU COM AS IMAGENS. `null` = a entrega não tem peça visual
   * (pauta, roteiro, relatório) e não havia arte para refazer.
   *
   * ⚠️ Este campo nasceu do defeito da 4ª auditoria (25/08/2026): a refação
   * refazia o TEXTO, criava a versão nova, reabria o card — e **0 de 4
   * arquivos mudavam**. "Refeita" sem arquivo novo é a mesma classe de mentira
   * de estado que `done` sem `mediaUrl`. Agora a refação só se declara feita
   * do lado visual quando o `mediaUrl` de fato mudou.
   */
  arte: ArteDoAjuste | null;
  /** Virou assunto de gente — e por quê. */
  escalado: boolean;
  motivo?: string;
  avisouCliente: boolean;
  /**
   * A PARADA, CLASSIFICADA — `null` quando o ajuste saiu inteiro.
   *
   * Nasceu do beco medido em 26/08/2026: a refação parava (certíssimo, o texto
   * novo violava uma regra que a própria cliente tinha registrado), o card
   * ficava carimbado `revision_requested` para sempre, e a porta do portal
   * passava a devolver 409 para aprovar, recusar E cancelar.
   *
   * `motivo` sozinho não bastava: é uma string livre, e quem chama não
   * conseguia distinguir "o provedor caiu" (retenta) de "o pedido dele briga
   * com uma regra dele" (não adianta retentar — é conversa). Ver
   * `esteira/porta-do-ajuste.ts`.
   */
  parada?: ParadaDoAjuste | null;
  /**
   * OS CAMPOS QUE O AJUSTE NÃO TEVE DIREITO DE MUDAR — `"2:caption"`, item e
   * campo. Vazio quando o pedido era amplo (ou quando nada tentou mudar).
   *
   * É a prova do congelamento (27/08/2026): sem este campo, "o resto ficou
   * como estava" seria uma afirmação sem medida — e foi exatamente uma
   * afirmação sem medida que deixou a legenda ser reescrita na rodada paga.
   */
  congelados: string[];
}

/** Onde uma mensagem deste pedido é gravada. As DUAS chaves quando ambas são
 *  deriváveis — é o que mantém a conversa única por cliente. */
interface AncoraDoPedido {
  clientId: string | null;
  clientRequestId: string | null;
}

/**
 * Refaz o que o cliente pediu para mudar.
 *
 * `department` vem da `ApprovalRequest`: é a casa que produziu a peça, e serve
 * para achar a PEÇA — não para ser o alvo. O alvo é uma entrega só: aquela que
 * o cliente estava olhando quando apertou o botão. Ele reclamou de um título da
 * Pauta do Mês; não pediu os Roteiros de Vídeo de volta.
 *
 * Aceita as DUAS chaves de dono e exige pelo menos uma. `clientRequestId` é o
 * caminho do fluxo Brain; `clientId` é o do cliente criado direto, que não tem
 * solicitação nenhuma e até 05/08/2026 não era atendido por ninguém.
 */
export async function refazerPorPedidoDoCliente(input: {
  clientRequestId?: string | null;
  clientId?: string | null;
  department: string;
  comentario?: string;
  /**
   * A PEÇA que o cliente apontou. Vem do vínculo por FK do card
   * (`ApprovalRequest.deliverableVersion.deliverableId`) quando ele existe.
   * Ausente, a peça é derivada do card genérico pela MESMA regra que decidiu o
   * que ele leu na tela (`entregaMostradaPorDepartamento`).
   */
  deliverableId?: string | null;
  /**
   * Os DOIS atos do cliente, que ele distingue e o código passou a distinguir:
   *
   *   • `"ajuste"` — "pedir ajuste": ele quer UMA coisa diferente e o resto
   *     fica. Refazer do zero aqui é devolver pior o que ele já tinha aceitado.
   *   • `"recusa"` — "recusar e refazer": a peça inteira volta ao autor, com o
   *     motivo dele na mão.
   *
   * Até 24/08/2026 os dois caíam no MESMO prompt, palavra por palavra: o
   * portal mapeava `request_revision` e `reject` para a mesma chamada e nada
   * lá dentro sabia qual dos dois tinha sido. Default `"ajuste"` — o ato
   * conservador é o certo quando o chamador não declarou.
   */
  modo?: "ajuste" | "recusa";
  /**
   * AS PEÇAS QUE O CARD ESTAVA MOSTRANDO, na ordem em que ele as mostrou.
   * Vêm de `ApprovalRequest.sourcePostIdsJson` — o mesmo campo que a recusa já
   * recebia. É por elas que o texto refeito vira IMAGEM refeita; sem elas a
   * refação continua sendo só de texto, que era o defeito de 25/08/2026.
   */
  postIds?: string[];
}): Promise<RefacaoFeita> {
  const saida: RefacaoFeita = { refeitas: [], versoesNovas: [], arte: null, escalado: false, avisouCliente: false, congelados: [] };
  /** Os campos que o congelamento segurou nesta rodada. Ver `escopo-do-ajuste.ts`. */
  const congelamentos: string[] = [];

  const clientRequestId = input.clientRequestId?.trim() || null;
  // O dono: quando só veio a solicitação, o cliente é derivado dela. Derivação,
  // nunca invenção — solicitação de prospect (sem cliente) fica com `null`, e
  // aí a âncora é só a solicitação mesmo.
  let clientId = input.clientId?.trim() || null;
  const req = clientRequestId
    ? await prisma.clientRequestDb.findUnique({
        where: { id: clientRequestId },
        select: { businessName: true, clientId: true },
      }).catch(() => null)
    : null;
  if (!clientId) clientId = req?.clientId ?? null;

  if (!clientRequestId && !clientId) {
    // Sem nenhuma das duas chaves não existe a quem responder nem onde escrever.
    // Devolver "escalado" sem escalar seria repetir o silêncio; aqui o retorno
    // é honesto e quem chama (a rota) registra o erro.
    return { ...saida, escalado: true, motivo: "pedido sem dono: nem clientRequestId nem clientId" };
  }

  // ── O PORTÃO DE PAGAMENTO ────────────────────────────────────────────────
  // Refazer é PRODUZIR: gera peça nova, gasta token e imagem. E ela é chamada
  // de `app/api/portal/approvals/route.ts` e de `approval-service.ts`, que não
  // passam por `run-execution` — o portão tem de estar aqui dentro.
  //
  // `escalado: true` com o motivo em português: a rota que chama já sabe
  // registrar isso, e o cliente recebe a instrução gêmea em vez de um silêncio.
  const pagamento = await conferirPagamentoDaAncora({ clientRequestId, clientId });
  if (!pagamento.liberado) {
    return { ...saida, escalado: true, motivo: pagamento.mensagemAoCliente };
  }

  const ancora: AncoraDoPedido = { clientId, clientRequestId };

  // ── A PROIBIÇÃO NASCE AQUI, e é aqui que ela mais nasce ──────────────────
  // O pedido de ajuste é onde o cliente escreve "não use mais essa palavra".
  // Registrar ANTES de montar a verdade faz a proibição valer já nesta refação
  // — registrar depois a faria valer só na próxima peça, que é exatamente a
  // demora que ele reclamou. Best-effort: registro não derruba refação.
  if (clientId && input.comentario?.trim()) {
    await registrarProibicoes(clientId, input.comentario, "ajuste");
  }

  // O projeto é procurado pelas DUAS chaves. Só por `clientRequestId`, todo
  // cliente direto caía em "projeto não encontrado" — e saía por uma porta que
  // não avisava ninguém.
  const chavesDoProjeto = [
    ...(clientRequestId ? [{ clientRequestId }] : []),
    ...(clientId ? [{ clientId }] : []),
  ];
  const projeto = await prisma.project.findFirst({
    where: { OR: chavesDoProjeto },
    select: {
      id: true, workspaceId: true, clientId: true, clientRequestId: true,
      client: { select: { name: true, phone: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // O cliente é lido mesmo sem projeto: é dele que sai o workspace onde a
  // escalação será registrada, e o nome do negócio da mensagem.
  const cliente = clientId
    ? await prisma.client.findUnique({
        where: { id: clientId },
        select: { name: true, workspaceId: true },
      }).catch(() => null)
    : null;

  const negocio = req?.businessName ?? projeto?.client?.name ?? cliente?.name ?? "o cliente";
  const workspaceId = projeto?.workspaceId ?? cliente?.workspaceId ?? null;
  const dono = {
    id: projeto?.id ?? null,
    workspaceId,
    clientId: projeto?.clientId ?? clientId,
  };

  const comentario = input.comentario?.trim();

  // ── SEM PROJETO: não há o que a máquina refaça — mas ALGUÉM precisa saber ──
  // É o caso do cliente direto cujas peças nasceram no calendário, sem
  // `Deliverable`. Antes, esta linha era um `return` mudo. Agora é o caminho
  // curto e completo: registra para a equipe e responde ao cliente.
  if (!projeto) {
    await escalar(dono, negocio,
      `pedido de mudança do cliente sem projeto correspondente (departamento "${input.department}") — ` +
      `as peças estão marcadas "em ajuste" no calendário e esperam alguém da equipe`,
      comentario ?? "(sem descrição)");
    const avisou = await escreverNoPortal(ancora, comentario
      ? "Recebi seu pedido de ajuste e já passei para a equipe olhar. Te retorno em breve com a mudança feita. 💛"
      : "Recebi seu pedido de ajuste! Só me conta em uma frase o que você quer diferente — assim a equipe já refaz certo. 💛");
    return { ...saida, escalado: true, avisouCliente: avisou, motivo: "projeto não encontrado" };
  }

  // Um pedido sem palavras é o caso mais comum e o mais perigoso: refazer no
  // escuro produz outra peça igualmente errada e queima uma das tentativas.
  // Perguntar é mais rápido e mais barato do que adivinhar.
  if (!comentario) {
    const avisou = await escreverNoPortal(ancora,
      "Recebi seu pedido de ajuste! Só me conta em uma frase o que você quer diferente — assim eu refaço já certo, sem te fazer pedir de novo. 💛");
    return { ...saida, escalado: false, avisouCliente: avisou, motivo: "pedido sem descrição — perguntei ao cliente" };
  }

  const cicloAtual = await prisma.cycle.findFirst({
    where: { projectId: projeto.id, status: { in: ["aberto", "entregue"] } },
    orderBy: { reference: "desc" },
    select: { id: true },
  }).catch(() => null);

  // Quais especialistas moram no departamento que o cliente apontou.
  const idsDoDepartamento = TODOS_OS_ESPECIALISTAS
    .filter((e) => e.departamentoId === input.department)
    .map((e) => e.id);

  const candidatas = await prisma.deliverable.findMany({
    where: {
      projectId: projeto.id,
      ...(cicloAtual ? { cycleId: cicloAtual.id } : {}),
      ...(idsDoDepartamento.length > 0 ? { ownerAgentId: { in: idsDoDepartamento } } : {}),
    },
    select: { id: true, name: true, content: true, ownerAgentId: true, version: true, clientFeedback: true, lastFeedback: true, revisionStatus: true, type: true },
  });

  // ── A PEÇA REPROVADA PELA QUALIDADE NÃO ENTRA DE CARONA (6ª auditoria, 04/08/2026)
  //
  // Este caminho grava um estado por cima do anterior. Numa peça `quality_flag`
  // isso seria ABSOLVIÇÃO: a ressalva some, e `apresentar` (marcos.ts) — que
  // barra `quality_flag` — passa a mostrar ao cliente a peça que a própria casa
  // reprovou. O gatilho é alcançável sem má-fé: o card de aprovação é POR
  // DEPARTAMENTO, então um clique legítimo em "pedir revisão" levava a peça
  // barrada de carona.
  //
  // O argumento "aqui o árbitro é o cliente" não cobre a peça de CARONA: ela
  // não foi apresentada, logo ele não a viu e não pode arbitrar sobre ela.
  // Cobre — e só ela — a peça que ele APONTOU, e é essa a exceção da mira logo
  // abaixo.
  //
  // A exclusão é feita aqui, e não no `where`, de propósito: `revisionStatus` é
  // anulável, e `{ not: "quality_flag" }` depende da semântica de NULL do ORM
  // para não descartar silenciosamente toda peça sem status. Filtrar em memória
  // é decidível pela leitura — e ainda me deixa contar as barradas, que é o que
  // permite falar a verdade certa ao cliente logo abaixo.
  const barradas = candidatas.filter((d) => d.revisionStatus === "quality_flag");
  const naoBarradas = candidatas.filter((d) => d.revisionStatus !== "quality_flag");

  // ── A MIRA: A PEÇA QUE ELE APONTOU, NÃO O DEPARTAMENTO INTEIRO ──────────
  //
  // ⚠️ MEDIDO EM PRODUÇÃO (Farol 27, rodada 4, 24/08/2026) — o pior defeito da
  // rodada. O cliente abriu o card que mostrava a **Pauta do Mês**, apertou
  // "Pedir ajuste" e escreveu que queria trocar um título. A máquina reescreveu
  // os **Roteiros de Vídeo** — outra peça, que estava boa — e não encostou na
  // Pauta. Ele recusou dizendo com todas as letras *"vocês mexeram na peça
  // errada"*, e ela refez a peça errada de novo.
  //
  // A causa era o alvo ser o DEPARTAMENTO. Social Media tem três especialistas
  // (Pauta do mês `a3` · Copy `social-copy` · Roteiro `social-roteiro-video`),
  // então "pedir ajuste no card de social" varria os três — e destruía o que
  // estava bom para não corrigir o que ele apontou.
  //
  // Por que isso é caro em dinheiro, e não só em irritação: refação é prejuízo
  // da casa. O preço já está fechado e o pagamento vem antes da produção. Errar
  // o alvo gasta uma rodada de IA para PIORAR a entrega, e obriga outra rodada
  // para consertar o que ela quebrou.
  //
  // A mira, em ordem de firmeza:
  //
  //   1. o `deliverableId` que o chamador declarou — o vínculo por FK do card
  //      (`ApprovalRequest.deliverableVersion`). É a única forma que prova QUE
  //      PEÇA estava na mesa, e por isso é a única que pode trazer de volta uma
  //      peça `quality_flag`: se o card apontava para ela, ele a viu;
  //   2. a peça que o card GENÉRICO estava mostrando, pela MESMA função que
  //      montou o texto que ele leu (`entregaMostradaPorDepartamento`) — "o que
  //      ele viu" e "o que volta ao autor" viram a mesma peça por construção.
  //      Aqui a barrada continua fora: a derivação é uma inferência, e
  //      inferência não é prova de que ele viu a peça;
  //   3. sem nenhuma das duas, o departamento — o comportamento antigo, que
  //      continua certo para o chamador que não sabe de peça nenhuma.
  let alvos = naoBarradas;
  // ── 1.5. O CARD DO PEDIDO AVULSO NOMEIA O PEDIDO, NÃO O DEPARTAMENTO ────
  //
  // ⚠️ MEDIDO EM PRODUÇÃO (cliente oculto, 26/08/2026), e é o segundo motivo
  // pelo qual nenhum arquivo novo saiu naquele ajuste.
  //
  // `department` de um card de pedido é `pedido:<id>` — a grafia existe para
  // que o caminho de volta exista sem adivinhação (`producao-de-pedido.ts`).
  // `recusarPorPedidoDoCliente` já lia esse prefixo desde 25/08. **O AJUSTE
  // não lia.** Consequência, na ordem em que ela acontece:
  //
  //   • `entregaMostradaPorDepartamento` não tem chave `"pedido:cmt…"`, então
  //     a mira falhava e caía no fallback nº 3 — "o departamento";
  //   • sem especialista nenhum nesse "departamento", o filtro por
  //     `ownerAgentId` some e o alvo vira TODA entrega do ciclo. O cliente
  //     apontou uma peça e a máquina reescreveu cinco;
  //   • e o laço de arte exige `alvos.length === 1` (a mira da imagem só é
  //     decidível sobre UMA entrega). Com cinco, ele **nunca roda** — nenhum
  //     `mediaUrl` muda, aconteça o que acontecer com o texto.
  //
  // Derivação, nunca invenção: o id vem do próprio card, e a leitura carrega o
  // projeto no `where` — entrega de outro cliente não entra por aqui.
  const idDoPedido = input.department.startsWith("pedido:")
    ? input.department.slice("pedido:".length).trim()
    : null;
  const entregaDoPedido = idDoPedido
    ? (await prisma.contentRequest.findUnique({
        where: { id: idDoPedido }, select: { deliverableId: true },
      }).catch(() => null))?.deliverableId ?? null
    : null;

  // ── 1.6. AS PEÇAS QUE ELE ESTAVA VENDO DIZEM QUAL É A ENTREGA ───────────
  //
  // ⚠️ MEDIDO EM PRODUÇÃO (cliente oculto, 6ª rodada): o cliente pediu ajuste,
  // a rota devolveu 200, e **0 de 2 arquivos mudaram** — sha256 reconferido
  // seis minutos depois, idêntico.
  //
  // A rodada anterior fechou o caminho do TÍTULO e o caminho do `pedido:<id>`.
  // Este é outro, e é o do card genérico: sem `deliverableId` no card e sem
  // entrada em `entregaMostradaPorDepartamento`, a mira caía no fallback nº 3
  // (o departamento) e `alvos` ficava com VÁRIAS entregas. Aí, três linhas
  // abaixo, `alvos.length === 1` reprova e o laço de arte **nunca roda**.
  // Nenhum `mediaUrl` muda, e — o pior — nada diz isso a ninguém: `saida.arte`
  // fica `null`, `arteDevia` fica `false`, e o card REABRE em `pending` como se
  // tivesse dado tudo certo. O cliente é chamado a decidir outra vez sobre
  // exatamente a imagem que ele acabou de recusar.
  //
  // O dado que faltava já estava no banco: `SocialPost.deliverableId` é a chave
  // de idempotência de quem gerou a peça. As peças que o card mostrou APONTAM
  // para a entrega que as fez, por FK. Isso é PROVA, não inferência — a mesma
  // firmeza do nível 1, e por isso entra logo depois dele.
  //
  // Fail-closed em dois pontos, os dois de propósito:
  //   • as peças têm de apontar para UMA entrega só. Duas entregas no mesmo
  //     card e a posição volta a ser indecidível — refazer o texto de uma na
  //     imagem da outra é pior que não refazer;
  //   • a entrega apontada tem de estar entre as candidatas do projeto. FK que
  //     leva para fora do ciclo corrente não é atalho para refazer peça alheia.
  const pecasDoCardParaMira = (input.postIds ?? []).filter((x) => typeof x === "string" && x.length > 0);
  let entregaDasPecas: string | null = null;
  if (!input.deliverableId?.trim() && !entregaDoPedido && pecasDoCardParaMira.length > 0) {
    const donas = await prisma.socialPost
      .findMany({
        where: { id: { in: pecasDoCardParaMira }, deliverableId: { not: null } },
        select: { deliverableId: true },
      })
      .catch(() => [] as Array<{ deliverableId: string | null }>);
    const unicas = [...new Set(donas.map((d) => d.deliverableId).filter((x): x is string => !!x))];
    if (unicas.length === 1) entregaDasPecas = unicas[0]!;
  }

  const idExplicito = input.deliverableId?.trim() || entregaDoPedido || entregaDasPecas;
  if (idExplicito) {
    // A posse é conferida nas duas pontas: entre as candidatas (que já nascem
    // filtradas por projeto) ou, se o card aponta para fora do ciclo corrente,
    // por uma leitura que carrega `projectId` no `where` — id de peça de outro
    // cliente não é refeito por aqui.
    const apontada =
      candidatas.find((d) => d.id === idExplicito)
      ?? await prisma.deliverable.findFirst({
        where: { id: idExplicito, projectId: projeto.id },
        select: { id: true, name: true, content: true, ownerAgentId: true, version: true, clientFeedback: true, lastFeedback: true, revisionStatus: true, type: true },
      }).catch(() => null);
    if (apontada) alvos = [apontada];
  } else {
    const mostrada = await entregaMostradaPorDepartamento(projeto.id)
      .then((m) => m.get(input.department)?.id ?? null)
      .catch(() => null);
    const apontada = mostrada ? naoBarradas.find((d) => d.id === mostrada) : undefined;
    if (apontada) alvos = [apontada];
  }

  // ── 0. O QUE ELE ESCREVEU MANDA MAIS QUE ONDE ELE CLICOU ────────────────
  //
  // ⚠️ MEDIDO EM PRODUÇÃO POR sha256 (cliente oculto, 7ª volta, 26/08/2026) —
  // o pior achado da operação. O cliente escreveu "nas LEGENDAS PRONTAS: tirem
  // (…). A pauta do mês está boa, NÃO MEXAM NELA." A casa refez a Pauta do Mês
  // (v1→v2, `fe9ceede…`→`c9d28b2d…`) e deixou as Legendas Prontas intactas
  // (v1, `873510ae…`). **A mira não estava ausente: estava invertida.**
  //
  // A causa está inteira nos degraus 1 a 3 acima: todos são ESTRUTURAIS —
  // respondem "que peça estava na mesa", nunca "que peça ele apontou". Quando
  // as duas divergem, a estrutura acerta a mesa e erra o cliente. E a divergência
  // é normal: um card de departamento mostra uma entrega e o cliente escreve
  // sobre outra do mesmo pacote, que ele acabou de ler na mesma tela.
  //
  // Por isso este degrau roda DEPOIS e SOBREPÕE: as palavras do cliente são a
  // instrução; a estrutura é a inferência de contexto que só vale enquanto ele
  // não disse o nome. Ver `esteira/mira-por-nome.ts`.
  //
  // A leitura é do CICLO inteiro, não de `candidatas`: `candidatas` já vem
  // filtrada pelo departamento do card, e a peça que ele nomeou pode ser de
  // outro especialista do mesmo pacote — foi exatamente o caso medido. O
  // `where` carrega `projectId`, então nada de outro cliente entra por aqui.
  const doCiclo = await prisma.deliverable.findMany({
    where: { projectId: projeto.id, ...(cicloAtual ? { cycleId: cicloAtual.id } : {}) },
    select: { id: true, name: true, content: true, ownerAgentId: true, version: true, clientFeedback: true, lastFeedback: true, revisionStatus: true, type: true },
  }).catch(() => [] as typeof candidatas);

  const miraNome = miraPorNomeDaEntrega(comentario, doCiclo.map((d) => ({ id: d.id, name: d.name })));

  // A PEÇA QUE ELE NOMEOU vira o alvo. Barrada pela Qualidade continua fora:
  // nomear uma peça não prova que ele a viu apresentada — a exceção da barrada
  // continua sendo só o vínculo por FK do card (degrau 1).
  if (miraNome.apontadas.length > 0) {
    const nomeadas = doCiclo.filter(
      (d) => miraNome.apontadas.includes(d.id) && d.revisionStatus !== "quality_flag",
    );
    if (nomeadas.length > 0) alvos = nomeadas;
  }

  // ── A PROIBIÇÃO ESCRITA É TRAVA, NÃO DICA ───────────────────────────────
  //
  // "A pauta do mês está boa, não mexam nela." Ainda que TODA a escada
  // estrutural aponte para ela — e no caso medido apontava — ela sai do alvo.
  // Este é o pedaço que segura o dano irrecuperável: não achar a peça certa é
  // caro; destruir a peça que ele pediu para preservar não tem volta, porque a
  // versão nova já foi cobrada e ele acredita que foi atendido.
  const tiradasPelaProibicao = alvos.filter((a) => miraNome.proibidas.includes(a.id));
  if (tiradasPelaProibicao.length > 0) {
    alvos = alvos.filter((a) => !miraNome.proibidas.includes(a.id));
    // Silêncio aqui seria a mesma doença de sempre: a casa deixaria de fazer
    // algo e ninguém saberia. A equipe fica sabendo QUE peça foi poupada e por
    // qual frase dele.
    await escalar(
      dono, negocio,
      `o cliente PROIBIU tocar em ${tiradasPelaProibicao.map((d) => d.name).join(", ")} ` +
      `("${tiradasPelaProibicao.map((d) => miraNome.trechos[d.id] ?? "").filter(Boolean).join(" / ")}") — ` +
      `essa(s) entrega(s) foi(ram) retirada(s) do alvo do ajuste`,
      comentario,
    );
  }

  // Ele proibiu a única peça que a escada achou e não nomeou nenhuma outra.
  // Refazer assim mesmo seria repetir o defeito de 26/08 com a proibição na
  // mão. Vira conversa, não rodada de IA.
  if (alvos.length === 0 && tiradasPelaProibicao.length > 0) {
    const avisou = await escreverNoPortal(ancora,
      `Entendi — e não vou mexer em ${tiradasPelaProibicao.map((d) => d.name).join(", ")}, como você pediu. ` +
      "Só me confirma em qual entrega você quer o ajuste que eu já refaço certo. 💛");
    return {
      ...saida,
      escalado: true,
      avisouCliente: avisou,
      motivo: `cliente proibiu tocar em ${tiradasPelaProibicao.map((d) => d.name).join(", ")} e não nomeou outra entrega`,
    };
  }

  // A barrada que É o alvo não é "de carona": ela é o pedido. Escalar sobre ela
  // como se tivesse ficado de fora seria dizer a gente o contrário do que a
  // máquina acabou de fazer.
  const barradasDeCarona = barradas.filter((b) => !alvos.some((a) => a.id === b.id));

  if (alvos.length === 0) {
    // Duas ausências diferentes, duas frases diferentes. Dizer "não achei sua
    // entrega" quando a entrega EXISTE e está barrada é mentira — e das que o
    // cliente descobre sozinho no mês seguinte.
    const tudoBarrado = barradasDeCarona.length > 0;
    const motivo = tudoBarrado
      ? "entrega do departamento está reprovada pela Qualidade — o pedido do cliente precisa entrar na refação dela"
      : "sem entrega correspondente";
    await escalar(
      dono, negocio,
      tudoBarrado
        ? `pedido de mudança do cliente sobre entrega BARRADA pela Qualidade (${barradasDeCarona.map((d) => d.name).join(", ")}) — junte o que ele pediu à correção antes de apresentar`
        : `pedido de mudança do cliente sem entrega correspondente (departamento "${input.department}")`,
      comentario,
    );
    const avisou = await escreverNoPortal(ancora, tudoBarrado
      ? "Recebi seu pedido de ajuste! Essa entrega ainda está em revisão aqui com a equipe — vou juntar o que você pediu na versão nova e te aviso assim que ela ficar pronta. 💛"
      : "Recebi seu pedido de ajuste e já passei para a equipe olhar. Te retorno em breve com a mudança feita. 💛");
    return { ...saida, escalado: true, motivo, avisouCliente: avisou };
  }

  // Parcial: o cliente pediu ajuste num departamento onde ALGUMA peça está
  // barrada. As boas seguem refeitas abaixo; a barrada continua com a Qualidade,
  // mas o pedido dele não pode se perder no caminho — vira registro para gente.
  if (barradasDeCarona.length > 0) {
    await escalar(dono, negocio,
      `o pedido do cliente também toca entrega(s) barrada(s) pela Qualidade (${barradasDeCarona.map((d) => d.name).join(", ")}) — essas não foram refeitas por aqui`,
      comentario);
  }

  const verdade: VerdadeDoCliente = {
    businessName: negocio,
    telefones: [projeto.client?.phone].filter((v): v is string => !!v),
    emails: [projeto.client?.email].filter((v): v is string => !!v),
    servicos: [], valores: [],
    // Sem a verdade operacional lida do banco, o piso trata toda classe como
    // "não informada" e barra a refação que apenas repete o horário ou o canal
    // que o cliente já tinha contado. Fail-closed é o default certo; deixar de
    // ligar a fiação transforma isso em falso positivo.
    // A verdade operacional é lida pela solicitação — a do pedido, ou a que o
    // projeto carrega. Cliente direto não tem nenhuma das duas: aí a operação
    // fica `undefined` e o piso volta a ser fail-closed para essas classes, que
    // é o comportamento certo quando a verdade não existe para ser conferida.
    operacao:
      (clientRequestId ?? projeto.clientRequestId)
        ? (await buildVerdadeOperacional((clientRequestId ?? projeto.clientRequestId)!)) ?? undefined
        : undefined,
    // As PROIBIÇÕES valem com força extra aqui: a refação nasce de um pedido de
    // ajuste, e o pedido de ajuste é onde o cliente costuma dizer "nunca mais
    // use isso". Refazer violando de novo o que ele acabou de proibir é o pior
    // desfecho possível deste caminho. Ver `esteira/proibicoes.ts`.
    proibicoes: await lerProibicoes(projeto.clientId),
  };

  // ── OS DOIS ATOS SÃO DOIS ATOS ──────────────────────────────────────────
  // "Pedir ajuste" e "recusar e refazer" chegavam aqui idênticos: mesma
  // função, mesmo prompt, mesma frase "preserve o resto". O cliente distingue
  // os dois no portal (são dois botões, com dois textos), e o especialista
  // precisa saber qual deles aconteceu — recusar é dizer "isto aqui não
  // serve", e responder a isso preservando o que ele acabou de recusar é não
  // ter ouvido.
  const recusou = input.modo === "recusa";

  // ── A REGRA QUE JULGA TEM DE SER A REGRA QUE O PRODUTOR LEU (26/08/2026) ──
  //
  // As proibições do cliente entravam SÓ no piso — a régua de saída. O prompt
  // desta refação nunca as viu. A casa julgava por uma regra que nunca contou
  // a quem escreve, e o desfecho medido em produção foi exatamente esse: o
  // modelo usou o termo proibido porque ninguém lhe disse que era proibido, o
  // piso barrou (certo), e o pedido do cliente morreu no meio.
  //
  // Isto NÃO é o conserto do beco — o beco é o que acontece depois da recusa,
  // e ele está fechado abaixo. Isto é a metade que evita chegar lá.
  //
  // `instrucaoGemea` é a MESMA redação que o piso usa no motivo da violação:
  // uma regra, um texto. Duas redações seriam a segunda verdade, e o produtor
  // obedeceria uma para ser cobrado pela outra.
  //
  // ⚠️ E a instrução gêmea vai junto de propósito: "não use X" sozinho faz o
  // modelo CORTAR o assunto da peça, e aí o cliente perde o conteúdo que
  // comprou por causa de uma regra de forma.
  const regrasDoCliente = (verdade.proibicoes?.itens ?? []).map((p) => `• ${instrucaoGemea(p)}`);

  // O JSON REFEITO, guardado para virar imagem. A refação já o tem em mãos; o
  // que faltava era ele atravessar para o lado visual. Ver o bloco "O TEXTO
  // NOVO VIRA IMAGEM NOVA", abaixo.
  let dadosRefeitos: Record<string, unknown> | null = null;

  /**
   * REGISTRA A PARADA — uma porta só para o `escalado`.
   *
   * Antes cada ramo escrevia `saida.escalado = true; saida.motivo = "..."` na
   * mão, e a string livre era tudo o que sobrava para quem chamava. Nenhum
   * chamador conseguia distinguir "o provedor caiu" de "o pedido dele briga
   * com uma regra dele" — e a segunda é a única que não se resolve tentando de
   * novo.
   *
   * ⚠️ O CONFLITO COM REGRA DO CLIENTE TEM PRIORIDADE sobre as outras paradas
   * do mesmo pedido. Com mais de uma entrega no alvo, a última a falhar
   * sobrescrevia a anterior — e perder o conflito ali trocaria a CONVERSA que
   * resolve por um "a equipe está olhando" que não resolve nada.
   */
  /**
   * As paradas a CARIMBAR na entrega — `[parada:<causa>]` no `lastFeedback`.
   * É a memória curta que impede o pedido repetido de queimar outra tentativa
   * paga (`valeChamarAIa`, em `porta-do-ajuste.ts`). Gravadas depois do laço,
   * de uma vez: escrever dentro do laço faria uma parada de uma entrega
   * atropelar o texto de outra.
   */
  const carimbos: Array<{ id: string; causa: ParadaDoAjuste["causa"] }> = [];

  function registrarParada(nova: ParadaDoAjuste, entregaId?: string): void {
    // ⚠️ SÓ O QUE NÃO MUDA VIRA MEMÓRIA (`PARADAS_QUE_NAO_MUDAM`). Uma queda
    // de provedor, uma saída fora do contrato ou um dado inventado NÃO deixam
    // rastro: os três podem sair certos na chamada seguinte, e barrar a
    // próxima tentativa do cliente por causa deles seria a casa recusando
    // trabalho que ela sabe fazer. Além disso, esses caminhos não escrevem no
    // `Deliverable` de propósito — gravar seria mexer na peça sem ter refeito
    // nada (`refacao.test.ts`, "não finge que refez").
    if (entregaId && PARADAS_QUE_NAO_MUDAM.has(nova.causa)) carimbos.push({ id: entregaId, causa: nova.causa });
    saida.escalado = true;
    const jaTemConflito = saida.parada?.classe === "conflito_com_regra_do_cliente";
    if (jaTemConflito && nova.classe !== "conflito_com_regra_do_cliente") return;
    saida.parada = nova;
    saida.motivo = nova.motivoInterno;
  }

  for (const entrega of alvos) {
    if (entrega.version > MAX_REFACOES_DO_CLIENTE) {
      registrarParada(classificarParada({
        causa: "teto_de_refacoes",
        detalhe: `"${entrega.name}" já foi refeita ${entrega.version - 1}x a pedido do cliente`,
      }), entrega.id);
      continue;
    }

    const esp = TODOS_OS_ESPECIALISTAS.find((e) => e.id === entrega.ownerAgentId);

    // ── A RETENTATIVA, COM FREIO (26/08/2026) ──────────────────────────────
    //
    // Antes: UMA chamada. Provedor fora do ar por dois segundos = pedido do
    // cliente parado até alguém perceber. Agora tenta de novo — e só o que
    // vale a pena tentar.
    //
    // O que ENTRA no laço: provedor indisponível e saída vazia. São falhas da
    // máquina, não do pedido: a mesma chamada um segundo depois passa.
    //
    // O que NÃO entra, de propósito: contrato de saída e PISO DE VERDADE. Os
    // dois rodam em código, sem IA — e o piso é justamente onde a proibição do
    // cliente barra. Retentar ali daria o mesmo resultado, gastando dinheiro de
    // IA para adiar a única coisa que resolve, que é FALAR com ele.
    // ── O PEDIDO REPETIDO NÃO QUEIMA OUTRA TENTATIVA PAGA (27/08/2026) ────
    //
    // Medido: um cliente com 3 peças, ~9 tentativas pagas e ZERO entregues.
    // Cada clique dele disparava uma chamada de IA que ia parar exatamente no
    // mesmo lugar — e o dinheiro saía do mesmo teto que protege a casa.
    //
    // Pedido IGUAL sobre uma parada que não se retenta vira PORTA, não
    // tentativa. Pedido diferente sempre passa: quem reescreve está dizendo
    // outra coisa.
    if (!valeChamarAIa({
      causaAnterior: causaDaParadaAnterior(entrega.lastFeedback),
      pedidoAnterior: entrega.clientFeedback,
      pedidoNovo: comentario,
    })) {
      registrarParada(classificarParada({
        causa: "pedido_repetido_sem_mudanca",
        detalhe: `"${entrega.name}" já parou por ${causaDaParadaAnterior(entrega.lastFeedback)} com este mesmo pedido`,
      }), entrega.id);
      continue;
    }

    let r: Awaited<ReturnType<typeof generate>> | null = null;
    let corpo = "";
    let tentativas = 0;
    let causaTransitoria: "provedor_indisponivel" | "saida_vazia" | null = null;
    while (tentativas < MAX_TENTATIVAS_TRANSITORIAS) {
      tentativas++;
      r = await generate({
        system:
          `Você é o especialista de ${esp?.label ?? "produção"} de uma agência de marketing brasileira. ` +
          (recusou
            ? "O CLIENTE — não a Qualidade, o cliente que paga — RECUSOU esta entrega e mandou refazer. "
            : "O CLIENTE — não a Qualidade, o cliente que paga — pediu um AJUSTE nesta entrega. ") +
          "O pedido dele é a instrução final: atenda o que ele pediu, sem discutir e sem defender a versão anterior. " +
          (recusou
            ? "Ele recusou a entrega INTEIRA: refaça-a por completo atendendo o motivo que ele deu. Não tente salvar a versão anterior — foi ela que ele recusou. "
            : "Mude o que ele apontou e preserve o resto — refazer do zero o que ele não reclamou faz o cliente sentir que perdeu o que já tinha aprovado. ") +
          "Responda SOMENTE com JSON válido, no mesmo formato.",
        user: [
          `NEGÓCIO: ${negocio}`,
          `ENTREGA ATUAL — "${entrega.name}":`,
          entrega.content ?? "",
          "",
          recusou
            ? `POR QUE ELE RECUSOU, com as palavras dele: "${comentario}"`
            : `O QUE O CLIENTE PEDIU, com as palavras dele: "${comentario}"`,
          entrega.clientFeedback ? `\nELE JÁ TINHA PEDIDO ANTES: "${entrega.clientFeedback}" — não repita o erro anterior.` : "",
          "",
          'Onde faltar informação do cliente, escreva "PRECISO CONFIRMAR: <o quê>" — nunca invente para preencher.',
          ...(regrasDoCliente.length > 0
            ? [
                "",
                "REGRAS QUE O PRÓPRIO CLIENTE REGISTROU — elas são conferidas EM CÓDIGO na saída,",
                "e a peça que violar qualquer uma NÃO é entregue (nem quando o pedido de ajuste",
                "parecer pedir o contrário). Atenda o pedido dele RESPEITANDO estas regras:",
                ...regrasDoCliente,
              ]
            : []),
          // `cenas` NÃO é opcional aqui, e a razão não é de formato: se o item
          // tinha telas e volta sem elas, `extrairPecas` lê `cenas=[]` e
          // `publicacao.ts:1046` REBAIXA o carrossel para feed. O cliente comprou
          // 5 telas e recebe uma imagem, sem ninguém ficar vermelho.
          ESQUEMA_DA_ENTREGA,
          "Se o item já tinha CENAS (telas de carrossel), devolva TODAS elas no mesmo formato numerado. Carrossel que volta sem telas deixa de ser carrossel.",
          // ── O NÚMERO DE ITENS, DITO ANTES DE ESCREVER (26/08/2026) ──────
          //
          // O contrato de saída já barra a entrega magra, e continua barrando.
          // Mas barrar é o segundo melhor desfecho: o pedido do cliente morre
          // em `fora_do_contrato` e vira gente. O melhor é o produtor SABER o
          // número — o caso medido é ele pedir "muda só o gancho do primeiro"
          // e o modelo devolver um item só, com os outros sumindo.
          //
          // O número vem da ENTREGA ATUAL, contada pela leitura inversa do
          // renderizador (`quantosItens`) — nunca de uma segunda régua. Zero
          // (texto sem cabeçalho de item) não vira palpite: a linha não sai.
          ...(quantosItens(entrega.content) > 0
            ? [
                `A ENTREGA ATUAL TEM ${quantosItens(entrega.content)} ITEM(NS). Devolva EXATAMENTE ${quantosItens(entrega.content)} — ` +
                  "mudar o que ele apontou nunca é motivo para os outros sumirem: ele pagou por todos.",
              ]
            : []),
        ].join("\n"),
        maxTokens: 1800,
        workspaceId: projeto.workspaceId,
        preferredProvider: esp?.provedor ?? "claude",
        agentId: "esteira-refacao",
        clientId: projeto.clientId ?? null,
        projectId: projeto.id,
        });

      if (!r.ok) { causaTransitoria = "provedor_indisponivel"; continue; }
      corpo = renderizar(r.data as Record<string, unknown>);
      if (corpo.length < 60) { causaTransitoria = "saida_vazia"; continue; }
      causaTransitoria = null;
      break;
    }

    // ── PARADA DECLARADA AO ESGOTAR O TETO ──────────────────────────────────
    // Motivo, dono e próxima ação — e o cliente NÃO fica bloqueado por isso.
    if (!r || !r.ok || causaTransitoria) {
      registrarParada(classificarParada({
        causa: causaTransitoria ?? "provedor_indisponivel",
        detalhe: r && !r.ok ? "o provedor de IA não respondeu" : "a refação saiu vazia",
        tentativas,
      }), entrega.id);
      continue;
    }

    let dados = r.data as Record<string, unknown>;

    // ═══════════════════════════════════════════════════════════════════════
    // O CONGELAMENTO — o ajuste só mexe no que o cliente apontou (27/08/2026)
    // ═══════════════════════════════════════════════════════════════════════
    //
    // A regra do Diretor Geral, virada mecânica. O prompt acima JÁ pedia
    // "mude o que ele apontou e preserve o resto" — e a rodada paga mediu o
    // resultado disso: pedido VISUAL, legenda reescrita, com dia da semana
    // que não existe no calendário dele e o briefing dentro do texto.
    // *Prompt é aviso; código é trava.*
    //
    // O anterior é lido do texto que o cliente está vendo, pelo leitor inverso
    // do próprio renderizador (`itensDaEntrega`) — nunca por um segundo
    // vocabulário.
    //
    // ⚠️ RECUSA NÃO CONGELA. Quando ele RECUSOU a entrega inteira, o pedido é
    // justamente refazer tudo: segurar campos ali devolveria a ele pedaços da
    // versão que ele acabou de recusar. O congelamento é do AJUSTE.
    const escopo = escopoDoAjuste(comentario);
    if (!recusou) {
      const itensNovos = Array.isArray(dados.items)
        ? (dados.items as unknown[]).map((x) => (x && typeof x === "object" ? { ...(x as Record<string, unknown>) } : {}))
        : [];
      const congelado = congelarItens(itensDaEntrega(entrega.content), itensNovos, escopo);
      if (congelado.segurados.length > 0) {
        dados = { ...dados, items: congelado.itens };
        // O corpo é RE-RENDERIZADO a partir dos itens congelados: `corpo` foi
        // escrito dentro do laço de tentativa, com o que o modelo devolveu.
        corpo = renderizar(dados);
        congelamentos.push(...congelado.segurados);
        console.warn(`[refacao] ${motivoDoCongelamento(escopo, congelado)}`);
      }
    }

    // ── O CONTRATO DE SAÍDA VALE AQUI TAMBÉM ────────────────────────────────
    //
    // Este caminho tinha o piso e NÃO tinha o contrato. A diferença aparece no
    // caso mais comum da refação: o cliente pede "muda só o gancho do primeiro"
    // e o modelo devolve UM item — os outros dois somem. O piso aprova (nada
    // foi inventado), o cliente pediu a mudança (não há árbitro), e a peça é
    // gravada com um terço do que ele comprou.
    //
    // "O cliente mandou" vale para o CONTEÚDO, não para a contagem: ninguém
    // pediu para receber menos. Encolheu, não grava — a versão que ele está
    // vendo continua de pé e o caso vira decisão de gente, com o motivo.
    // ── E O CONTRATO CONHECE O TAMANHO DO PEDIDO (26/08/2026) ─────────────
    //
    // Era `conferirContrato(esp, …)` — a régua de LOTE do especialista, `3 a 8
    // criativos`, escrita para o pacote do mês. Um pedido avulso de UMA peça
    // batia de frente nela em TODA refação: a produção descrevia 1 peça, o
    // contrato exigia 3, e o ajuste do cliente morria em `fora_do_contrato`.
    //
    // ⚠️ Isto NÃO afrouxa nada. `contratoDoPedido` troca `3..8` por `n === n`,
    // que é mais estrito: nem a menos (entrega magra por preço cheio) nem a
    // mais (imagem paga que ninguém comprou). Pedido sem produto canônico
    // declarado continua caindo no contrato do especialista, como sempre.
    //
    // E o produto vem do PEDIDO QUE GEROU ESTA PEÇA, nunca do card: o card diz
    // qual peça está na mesa, o pedido diz o que foi comprado. Por isso a
    // leitura é pela PEÇA (`deliverableId`) e vale para todo alvo — inclusive
    // quando o ajuste veio pelo card genérico do departamento.
    const contrato = conferirContrato(
      contratoDoPedido(esp, await produtoQueComprouAPeca(entrega.id)),
      dados,
    );
    if (!contrato.cumpriu) {
      registrarParada(classificarParada({
        causa: "fora_do_contrato",
        detalhe: `a refação saiu fora do formato contratado (${contrato.violacoes.join("; ")})`,
      }), entrega.id);
      continue;
    }

    // O piso vale igual: peça refeita a pedido do cliente vai direto ao cliente.
    const piso = conferirPisoDeVerdade(corpo, verdade);
    if (!piso.aprovado) {
      // ── A RECUSA CONTINUA. O RÓTULO DELA É QUE ESTAVA ERRADO ────────────
      //
      // Esta linha dizia SEMPRE `"a refação inventou dado: …"`. Foi o que o
      // cliente oculto leu no log de produção quando o piso barrou por
      // PROIBIÇÃO REGISTRADA — a casa se acusando de inventar dado no exato
      // momento em que estava respeitando uma regra do cliente.
      //
      // Não é firula de redação: é a bifurcação que decide se vale a pena
      // tentar de novo. Dado inventado é problema de produção (gente).
      // Proibição do cliente é CONVERSA com ele — e nenhuma retentativa
      // atravessa uma régua determinística. Ver `porta-do-ajuste.ts`.
      const causa = causaDasViolacoesDoPiso(piso.violacoes);
      registrarParada(classificarParada({
        causa,
        detalhe: causa === "proibicao_do_cliente"
          ? regraProibidaLegivel(piso.violacoes)
          : `a refação inventou dado: ${resumirViolacoes(piso.violacoes)}`,
      }), entrega.id);
      continue;
    }

    // ── AFIRMAÇÃO MEDIDA TEM PRAZO DE VALIDADE ─────────────────────────────
    //
    // A peça que a Qualidade já JULGOU não pode sair daqui carregando o
    // veredito antigo: ele foi dado sobre um texto que não existe mais. Isso
    // corta os dois lados do mesmo defeito:
    //
    //   • verde velho — a peça que passou pela auditoria e foi reescrita não
    //     herda o "aprovado". O que foi medido foi a versão anterior;
    //   • barrada absolvida — a peça `quality_flag` que agora É o alvo do
    //     ajuste (e por isso deixou de ser pulada) não pode virar "não
    //     auditada" por cima da ressalva. Sem árbitro, ela CONTINUA barrada:
    //     ausência de parecer não é absolvição (a mesma regra de
    //     `pacote-travado.ts`).
    //
    // Peça que NUNCA teve juiz continua sem juiz e sem chamada de IA extra:
    // neste caminho o árbitro é o cliente, que decide a versão nova na rodada
    // de aprovação reaberta logo abaixo. O custo do juiz só é pago onde havia
    // uma afirmação a vencer.
    const jaTinhaVeredito =
      entrega.revisionStatus === "quality_ok" || entrega.revisionStatus === "quality_flag";
    let statusDaVersaoNova = revisionStatusDoVeredito("nao_auditado");
    // QUEM julgou ESTA versão. Nasce "ninguém", que é a verdade do caminho em
    // que o árbitro é o cliente — e só muda se um árbitro de verdade responder.
    let arbitroDaVersaoNova: string | null = null;
    let arbitragemDaVersaoNova: Arbitragem = "sem_arbitro";
    let parecerDaQualidade: string | null = null;
    if (jaTinhaVeredito) {
      const veredito = await auditDeliverable({
        deptLabel: esp?.departamentoLabel ?? "Produção",
        title: typeof dados.title === "string" && dados.title.trim() ? dados.title : entrega.name,
        content: corpo,
        brandContext: negocio,
        tipoDaEntrega: entrega.type,
        workspaceId: projeto.workspaceId,
        clientId: projeto.clientId ?? null,
        projectId: projeto.id,
      }).catch(() => null);

      if (veredito) {
        arbitroDaVersaoNova = veredito.arbitro ?? null;
        arbitragemDaVersaoNova = arbitragemDoVeredito(veredito);
      }
      if (veredito && foiAprovadaPelaQualidade(veredito.verdict)) {
        statusDaVersaoNova = revisionStatusDoVeredito("aprovado");
        parecerDaQualidade = `Reauditada após pedido do cliente e APROVADA. ${veredito.note}`;
      } else if (veredito && foiReprovadaPelaQualidade(veredito.verdict)) {
        statusDaVersaoNova = revisionStatusDoVeredito("reprovado");
        parecerDaQualidade = `Reauditada após pedido do cliente e REPROVADA: ${veredito.issues.join("; ") || veredito.note}`;
      } else if (entrega.revisionStatus === "quality_flag") {
        // Sem árbitro sobre uma peça que já estava barrada: a única opinião que
        // existe sobre ela continua sendo "reprovada".
        statusDaVersaoNova = revisionStatusDoVeredito("reprovado");
        parecerDaQualidade = "Refeita a pedido do cliente, mas sem parecer novo da Qualidade — segue barrada.";
      } else {
        // Estava verde e ninguém olhou a versão nova: o verde não se herda.
        parecerDaQualidade = "Refeita a pedido do cliente — a aprovação anterior da Qualidade não vale para esta versão.";
      }
    }

    // A versão que o cliente estava vendo vira registro imutável ANTES da
    // sobrescrita — era exatamente aqui que a v1 sumia do mundo (Hub, Fase 1,
    // 1.9). `content` continua sendo gravado, mas agora como cache da corrente.
    await preservarVersaoAtual(entrega);

    await prisma.deliverable.update({
      where: { id: entrega.id },
      data: {
        name: typeof dados.title === "string" && dados.title.trim() ? dados.title : entrega.name,
        content: corpo,
        version: { increment: 1 },
        // ── NINGUÉM DA QUALIDADE OLHOU ESTA VERSÃO — e é assim que fica escrito.
        //
        // Até 04/08/2026 gravávamos `quality_ok` aqui. Era mentira de estado:
        // a peça passou pelo piso determinístico (acima) e por mais nada. Piso
        // é chão, não é parecer — ele barra dado inventado, não julga tom,
        // promessa ou aderência ao briefing.
        //
        // Por que NÃO chamamos o auditor aqui, ao contrário do relatório mensal
        // e do pacote reprovado: neste caminho o árbitro é o CLIENTE. Ele pediu
        // a mudança com as palavras dele, e logo abaixo a aprovação volta a
        // ficar PENDENTE para ele decidir a versão nova. Um auditor que
        // reprovasse o que o cliente pediu explicitamente colocaria a máquina
        // contra o dono do briefing — e o briefing do cliente manda. O que
        // devíamos ao sistema não era um juiz a mais; era parar de afirmar um
        // veredito que não existe.
        revisionStatus: statusDaVersaoNova,
        // O veredito pode ser herdado (peça que já estava barrada segue
        // barrada); o ÁRBITRO nunca é. Ver os comentários acima.
        qualityArbiter: arbitroDaVersaoNova,
        qualityArbitragem: arbitragemDaVersaoNova,
        clientFeedback: comentario.slice(0, 500),
        lastFeedback: (parecerDaQualidade
          ? `${recusou ? "Refeita após recusa do cliente" : "Refeita a pedido do cliente"}: ${comentario} — ${parecerDaQualidade}`
          : `${recusou ? "Refeita após recusa do cliente" : "Refeita a pedido do cliente"}: ${comentario}`
        ).slice(0, 500),
      },
    });

    dadosRefeitos = dados;

    const novaVersao = await registrarNovaVersao({
      deliverableId: entrega.id,
      number: entrega.version + 1,
      content: corpo,
      createdBy: entrega.ownerAgentId,
      note: `${recusou ? "Refeita após RECUSA do cliente" : "Refeita a pedido do cliente"}: "${comentario.slice(0, 260)}"`,
    });
    if (novaVersao) saida.versoesNovas.push(novaVersao.id);
    saida.refeitas.push(entrega.name);
    saida.congelados = [...congelamentos];
  }

  // ── O CARIMBO DA PARADA ─────────────────────────────────────────────────
  //
  // A memória curta que impede o beco de OFICINA FAROL: a próxima vez que
  // este mesmo pedido chegar sobre esta mesma peça, a casa não paga outra
  // chamada de IA para chegar ao mesmo lugar — ela abre a porta.
  //
  // Grava também o pedido do cliente em `clientFeedback`: as duas metades da
  // comparação (a causa e o pedido) têm de sobreviver juntas, senão a memória
  // responde "não sei" e a tentativa é queimada de novo.
  for (const c of carimbos) {
    await prisma.deliverable.update({
      where: { id: c.id },
      data: {
        clientFeedback: comentario.slice(0, 500),
        lastFeedback: `${carimboDaParada(c.causa)} ${saida.motivo ?? ""}`.slice(0, 500),
      },
    }).catch(() => { /* best-effort: a parada já está na resposta e no portal */ });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // O TEXTO NOVO VIRA IMAGEM NOVA — a metade que faltava (Auditor, 25/08/2026)
  // ═══════════════════════════════════════════════════════════════════════
  //
  // Até aqui esta função refazia o TEXTO e criava a versão. Nada chamava o
  // rasterizador: a sonda do Auditor pediu "a TERCEIRA peça está escura
  // demais", recebeu 200, e **0 de 4 arquivos mudaram** — mesma `mediaUrl`,
  // mesmos bytes. O card reabria em `pending` e o cliente era chamado a
  // decidir de novo sobre exatamente as imagens que ele acabara de recusar.
  //
  // A mira da PEÇA (qual das quatro) mora em `mira-da-peca.ts` e a fiação +
  // o laço de arte em `refazer-a-arte-do-ajuste.ts`. Nenhum dos dois compõe
  // imagem: quem compõe é `produzirArtesPendentes`, o laço de sempre.
  //
  // Só no AJUSTE. A recusa tem caminho próprio (`recusarPorPedidoDoCliente`),
  // que retira a peça em vez de redesenhá-la.
  const pecasDoCard = (input.postIds ?? []).filter((x) => typeof x === "string" && x.length > 0);
  if (!recusou && saida.refeitas.length > 0 && alvos.length === 1 && pecasDoCard.length > 0) {
    saida.arte = await refazerArteDoAjuste({
      clientId: projeto.clientId ?? clientId,
      postIds: pecasDoCard,
      // O JSON refeito do especialista, lido pelo MESMO leitor da produção.
      pecasNovas: pecasDoEspecialista(dadosRefeitos ?? {}),
      comentario,
    }).catch((e: unknown): ArteDoAjuste => ({
      refeitas: [], preservadas: [], mira: null, regua: [], reprovadasPelaRegua: [],
      motivo: `não consegui refazer as imagens (${e instanceof Error ? e.message : "erro desconhecido"}). ` +
        "A arte anterior continua de pé. Dono: a agência (produção).",
    }));
    if (saida.arte.motivo) {
      saida.escalado = true;
      saida.motivo = saida.arte.motivo;
    }
  } else if (!recusou && saida.refeitas.length > 0 && pecasDoCard.length > 0) {
    // ═══════════════════════════════════════════════════════════════════════
    // O LAÇO DE ARTE NÃO RODOU — E ISSO NUNCA MAIS SAI CALADO (6ª rodada)
    // ═══════════════════════════════════════════════════════════════════════
    //
    // Este `else` não existia, e a falta dele é metade do defeito medido.
    // Quando a mira não colapsa em UMA entrega, o `if` acima não entra,
    // `saida.arte` fica `null` — e três linhas abaixo `arteDevia` se calcula
    // como `saida.arte != null && …`, ou seja, **false**. `podeReabrir` vira
    // `true`, o card reabre em `pending`, a rota devolve 200, e o cliente é
    // chamado a decidir de novo sobre a MESMA imagem que ele acabou de
    // recusar. Nenhum log, nenhum vermelho, nenhuma escalada.
    //
    // "Não rodou" e "rodou e não mudou nada" tinham comportamentos opostos
    // sendo o mesmo fato para quem paga: o arquivo continua igual. Agora os
    // dois passam pela mesma porta.
    //
    // A régua é `refeitas.length === 0`, então `arteDevia` fica verdadeiro,
    // `podeReabrir` fica falso, a equipe é escalada com dono e próxima ação, e
    // a peça recebe na TELA o aviso honesto de que a imagem ainda é a anterior
    // — a mesma frase do outro caminho (`AVISO_DA_ARTE_QUE_NAO_SAIU`), porque
    // duas redações para o mesmo fato é como as duas verdades nascem.
    const motivo =
      `a mira da imagem não fechou: o seu pedido alcançou ${alvos.length} entrega(s) e a ` +
      "correspondência peça↔texto só é decidível sobre UMA — escrever o texto de uma peça na " +
      "imagem de outra é pior do que não refazer. O TEXTO foi ajustado; as imagens NÃO foram tocadas " +
      "e nenhuma peça foi apagada. Dono: a agência (produção). Próxima ação: apontar a entrega do card " +
      "(`deliverableId`) ou ligar as peças à entrega (`SocialPost.deliverableId`) e refazer a arte.";
    saida.arte = { refeitas: [], preservadas: pecasDoCard, mira: null, motivo, regua: [], reprovadasPelaRegua: [] };
    saida.escalado = true;
    saida.motivo = motivo;
    await prisma.socialPost.updateMany({
      where: { id: { in: pecasDoCard } },
      data: { avisoAoCliente: AVISO_DA_ARTE_QUE_NAO_SAIU },
    }).catch(() => { /* best-effort: a escalada continua de pé */ });
  }

  // ── QUANDO O CARD **NÃO** PODE REABRIR ──────────────────────────────────
  //
  // Se a entrega TEM peças visuais e nenhuma ganhou arquivo novo, reabrir em
  // `pending` seria pedir ao cliente que decidisse outra vez sobre a mesma
  // imagem — com a tela dizendo "refizemos". É a mentira de estado que esta
  // rodada veio fechar. Nesse caso o card fica em "Ajustes solicitados", a
  // equipe é acionada (`escalar`, abaixo) e o cliente recebe a mensagem
  // honesta de que a casa está trabalhando nisso.
  // ── "DEVIA TER SAÍDO ARTE?" É PERGUNTA SOBRE A PEÇA, NÃO SOBRE O OBJETO ──
  // Era `saida.arte != null && …`, e o `null` do laço que nem rodou respondia
  // "não devia" — a falha se autoabsolvia. A pergunta certa é a do cliente:
  // este card mostrava imagem? Se mostrava, arte devia sair.
  const arteDevia = !recusou && pecasDoCard.length > 0;
  const arteSaiu = (saida.arte?.refeitas.length ?? 0) > 0;
  const podeReabrir = !arteDevia || arteSaiu;

  if (saida.refeitas.length > 0 && podeReabrir) {
    // A aprovação volta a ficar pendente: a peça mudou, e o "sim" anterior não
    // vale para uma versão que o cliente ainda não viu. A rodada nova aponta
    // para a versão recém-nascida — quando a refação produziu UMA versão; com
    // várias entregas no mesmo departamento o vínculo 1:1 não é decidível aqui
    // (o card de aprovação é por departamento) e fica nulo, que é o estado
    // honesto: sem vínculo, o portal não mostra corpo (regra anti-A2).
    // Posse pelas DUAS chaves, com a MESMA guarda da conversa: só entra chave
    // com valor. `{ clientId: null }` casaria com toda aprovação órfã do banco
    // e reabriria card de outro cliente — vazamento, não conserto.
    await prisma.approvalRequest.updateMany({
      where: {
        OR: [
          ...(clientRequestId ? [{ clientRequestId }] : []),
          ...(clientId ? [{ clientId }] : []),
        ],
        department: input.department,
      },
      data: {
        status: "pending", clientVisible: true, reviewedAt: null, reviewedBy: null,
        // Dúvida aberta era sobre a versão anterior; a rodada nova zera o relógio.
        questionOpenedAt: null,
        deliverableVersionId: saida.versoesNovas.length === 1 ? saida.versoesNovas[0] : null,
      },
    }).catch(() => { /* best-effort */ });

    // ── O QUE A MENSAGEM PODE AFIRMAR ────────────────────────────────────
    // "Refiz" só é dito sobre o que de fato mudou. Quando o cliente apontou
    // UMA peça, a mensagem diz qual e diz que as outras ficaram como estavam —
    // é isso que o transforma de "eles mexeram em tudo" em "eles ouviram".
    const arte = saida.arte;
    const linhaDaArte: string[] = [];
    if (arte && arte.refeitas.length > 0) {
      linhaDaArte.push(
        arte.mira
          ? `Refiz a imagem da peça ${arte.mira.indice} — foi a que você apontou ("${arte.mira.trecho}").`
          : `Refiz a imagem de ${arte.refeitas.length} peça(s).`,
      );
      if (arte.preservadas.length > 0) {
        linhaDaArte.push(`As outras ${arte.preservadas.length} ficaram exatamente como estavam.`);
      }
    }

    saida.avisouCliente = await escreverNoPortal(ancora, [
      "Refiz o que você pediu! ✏️",
      "",
      ...saida.refeitas.map((n) => `• ${n}`),
      ...(linhaDaArte.length > 0 ? ["", ...linhaDaArte] : []),
      "",
      `Ajustei com base no que você falou: "${comentario.slice(0, 200)}"`,
      "Dá uma olhada na aba de aprovações e me diz se ficou como você queria.",
    ].join("\n"));
  }

  // ═══════════════════════════════════════════════════════════════════════
  // A CASA NÃO ENTREGOU PEÇA NOVA — E AÍ ELA DEVE DUAS COISAS, JUNTAS
  // ═══════════════════════════════════════════════════════════════════════
  //
  // (26/08/2026, cliente oculto.) Até aqui, quando o ajuste não saía, a casa
  // fazia UMA das duas metades: escalava a equipe e escrevia uma frase gentil
  // na aba de mensagens. E deixava o card carimbado "ajustes solicitados" para
  // sempre — a partir dali a porta do portal devolvia 409 para aprovar,
  // recusar E cancelar. Um clique em "pedir ajuste" comia o direito de decidir
  // sobre quatro peças pagas.
  //
  // As duas metades agora andam juntas, e nenhuma delas existe sem a outra:
  //
  //   1. O CLIENTE É INFORMADO, NA TELA, do que aconteceu e POR QUÊ — no card
  //      onde ele decide, não só na aba de mensagens (que foi exatamente onde
  //      o aviso da rodada anterior ficou preso). Quando a razão é uma regra
  //      dele, a frase diz isso com todas as letras: é conversa, não erro.
  //   2. O CLIENTE CONTINUA PODENDO DECIDIR. Quem responde a isso é
  //      `devolveADecisao(saida)`, e a ROTA é quem a chama — não um campo
  //      preenchido aqui.
  //
  //      ⚠️ A primeira versão gravava um campo `saida.devolveADecisao` NESTA
  //      linha. Medido em produção 20 minutos depois: esta função tem seis
  //      retornos antecipados (sem projeto, sem entrega correspondente, portão
  //      de pagamento…) e nenhum deles chega aqui. O campo voltava `undefined`,
  //      a rota lia falso, e o 409 renascia inteiro. Campo que alguém precisa
  //      lembrar de preencher é prompt; função pura sobre o que sempre existe
  //      na saída é trava.

  // O texto foi refeito e a IMAGEM não: isso também é uma parada, e ela não
  // tinha classe nenhuma. Sem esta linha, o caminho "arte não saiu" chegava à
  // rota sem `parada` e o cliente ficava sem a frase no card.
  if (!podeReabrir && !saida.parada) {
    saida.escalado = true;
    saida.parada = classificarParada({
      causa: "arte_nao_saiu",
      detalhe: saida.arte?.motivo ?? "a imagem nova não ficou pronta",
    });
    saida.motivo = saida.parada.motivoInterno;
  }

  // ── A FRASE VAI PARA A PEÇA, QUE É ONDE ELE DECIDE ─────────────────────
  //
  // `SocialPost.avisoAoCliente` é renderizado ACIMA da imagem
  // (`components/portal/AprovacoesDoCliente.tsx`) e no detalhe da peça. É a
  // única superfície desta casa em que uma parada vira PIXEL. Escrever só no
  // log e na conversa é a régua verde sobre o componente errado — três vezes
  // nesta operação o aviso morreu numa coluna.
  //
  // Só nas peças que ele APONTOU: alarme falso nas outras mata o alarme
  // verdadeiro. Quando o ajuste não mirou peça nenhuma (entrega sem arte), a
  // frase chega pelo card, escrita pela rota.
  if (saida.parada && !recusou) {
    // A MESMA conta que a rota usa para carimbar o ESTADO
    // (`pecasApontadasPeloAjuste`). Duas contas divergentes poriam o aviso numa
    // peça e a revisão em outra — e o cliente leria o alarme na peça errada.
    const apontadas = pecasApontadasPeloAjuste(pecasDoCard, comentario);
    if (apontadas.length > 0 && clientId) {
      // ── E O ESTADO DA PEÇA VOLTA A SER VERDADE ─────────────────────────
      //
      // `revision_requested` quer dizer "alguém está refazendo isto", e
      // `ESTADOS_PROMOVIVEIS` (esteira/publicacao.ts) não a inclui de
      // propósito: peça em revisão não vai ao ar.
      //
      // Quando NADA foi refeito, a peça no card é byte a byte a mesma que ele
      // já tinha — e ninguém está refazendo. Deixá-la em revisão faria o "sim"
      // dele não agendar nada: ele aprovaria o card, a peça cairia em
      // `ignorados`, e o beco reapareceria do outro lado.
      //
      // ⚠️ Quando o TEXTO foi refeito e só a ARTE não saiu, a peça FICA em
      // revisão — a imagem no ar seria a que ele acabou de recusar. Aí o card
      // continua decidível (recusar, cancelar, pedir outro ajuste) e o aviso
      // acima explica por quê. As duas coisas são diferentes e o código as
      // trata como diferentes.
      const nadaMudou = saida.refeitas.length === 0;

      // ⚠️ QUANDO A ARTE NÃO SAIU, A FRASE JÁ EXISTE — e é melhor que a minha.
      //
      // `refazer-a-arte-do-ajuste.ts` já escreveu `AVISO_DA_ARTE_QUE_NAO_SAIU`
      // nesta mesma coluna, e ela diz a coisa específica que o cliente precisa
      // saber: "a IMAGEM ainda é a anterior; o TEXTO já mudou". Sobrescrever
      // com a frase genérica seria a segunda verdade sobre o mesmo fato — e a
      // pior das duas. O que faltava ali era só a segunda metade: o convite a
      // decidir. Então ela é ACRESCENTADA, não trocada.
      const soFaltouAArte = saida.parada.causa === "arte_nao_saiu";
      const jaEscritos = soFaltouAArte
        ? await prisma.socialPost.findMany({
            where: { id: { in: apontadas }, clientId },
            select: { id: true, avisoAoCliente: true },
          }).catch(() => [])
        : [];
      const jaTemFrase = new Map(jaEscritos.map((p) => [p.id, p.avisoAoCliente]));

      for (const id of apontadas) {
        const anterior = jaTemFrase.get(id);
        const texto = anterior?.trim()
          ? `${anterior.trim()}\n\n${CONVITE_A_DECIDIR}`
          : saida.parada.avisoAoCliente;
        await prisma.socialPost.updateMany({
          where: { id, clientId },
          data: {
            avisoAoCliente: texto,
            ...(nadaMudou ? { status: "draft" } : {}),
          },
        }).catch(() => { /* best-effort: a escalada e o card continuam de pé */ });
      }
    }
  }

  if (saida.escalado) {
    await escalar(dono, negocio, saida.motivo ?? "refação não concluída", comentario);
    // O SILÊNCIO CONTINUA IMPOSSÍVEL — e agora ele também não é VAGO.
    //
    // A frase de antes ("Recebi seu pedido e já estou olhando com atenção")
    // era verdadeira e inútil: não dizia o que travou, e mandava o cliente
    // esperar por gente que, no caso medido, nunca ia vir — porque o que
    // faltava não era trabalho da equipe, era uma resposta DELE.
    if (saida.parada) {
      saida.avisouCliente = await escreverNoPortal(ancora, saida.parada.avisoAoCliente);
    } else if (saida.refeitas.length === 0) {
      saida.avisouCliente = await escreverNoPortal(ancora,
        "Recebi seu pedido e já estou olhando com atenção. Te retorno em breve com o ajuste. 💛");
    }
  }

  return saida;
}

// ─── Internos ───────────────────────────────────────────────────────────────

/**
 * Escreve no portal carimbando as DUAS chaves quando ambas existem — a regra de
 * `app/api/messages/conversa.ts`: a conversa pertence ao cliente, e a leitura
 * une `clientId` com as solicitações dele. Carimbar só uma partia o histórico
 * do cliente que ganha (ou troca de) solicitação depois.
 */
/**
 * O PRODUTO QUE COMPROU ESTA PEÇA — e portanto quantas peças ela deve ter.
 *
 * A pergunta é feita à PEÇA e não ao card: o card diz o que está na mesa, o
 * pedido diz o que foi pago. `null` (peça do ciclo, peça anterior ao produto
 * canônico, peça sem pedido) devolve `null`, e `null` faz o contrato do
 * ESPECIALISTA valer — ausência de produto não vira quantidade inventada.
 */
async function produtoQueComprouAPeca(deliverableId: string): Promise<string | null> {
  try {
    const pedido = await prisma.contentRequest.findFirst({
      where: { deliverableId },
      select: { produtoId: true },
    });
    return pedido?.produtoId ?? null;
  } catch (e) {
    // Leitura que falha NÃO vira quantidade inventada: cai no contrato do
    // ESPECIALISTA, que é a régua histórica e a mais exigente das duas para
    // baixo. Falhar para o lado de barrar é recuperável; falhar para o lado de
    // gravar entrega magra não é. Mas fica RUIDOSO — silêncio aqui esconderia o
    // conserto do beco B tendo parado de funcionar.
    console.warn("[refacao] não consegui ler o produto do pedido desta peça:", e instanceof Error ? e.message : e);
    return null;
  }
}

async function escreverNoPortal(ancora: AncoraDoPedido, corpo: string): Promise<boolean> {
  if (!ancora.clientId && !ancora.clientRequestId) return false;
  try {
    await prisma.portalMessage.create({
      data: {
        ...(ancora.clientRequestId ? { clientRequestId: ancora.clientRequestId } : {}),
        ...(ancora.clientId ? { clientId: ancora.clientId } : {}),
        authorRole: "team", authorName: VOZ_DO_CLIENTE, body: corpo, readByTeam: true,
      },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Manda o pedido para gente.
 *
 * `workspaceId` pode faltar (cliente sem workspace legível): sem ele o
 * `ActivityEvent` nem existe no modelo. Nesse caso o log do servidor é o último
 * recurso — mas ele GRITA, porque o pedido de um cliente pagante acabou de
 * ficar sem destinatário e alguém tem que descobrir isso hoje, não no mês que vem.
 */
async function escalar(
  dono: { id: string | null; workspaceId: string | null; clientId: string | null },
  negocio: string,
  motivo: string,
  comentario: string,
): Promise<void> {
  const mensagem =
    `${negocio} pediu mudança e a máquina não resolveu: ${motivo}. O que ele pediu: "${comentario}"`.slice(0, 900);
  if (!dono.workspaceId) {
    console.error("[refacao] PEDIDO DE CLIENTE SEM DESTINATÁRIO (sem workspace):", mensagem);
    return;
  }
  await prisma.activityEvent.create({
    data: {
      workspaceId: dono.workspaceId,
      ...(dono.id ? { projectId: dono.id } : {}),
      clientId: dono.clientId,
      type: "refacao_escalada",
      message: mensagem,
    },
  }).catch(() => { /* best-effort */ });
}

/**
 * A REGRA DO CLIENTE, com as palavras dele, tirada das violações do piso.
 *
 * O piso já monta a frase com a INSTRUÇÃO GÊMEA junto (`instrucaoGemea`) — é
 * ela que o cliente precisa ler, porque diz o que fazer no lugar. O que sai
 * daqui vai direto para a TELA dele, então nada de id de violação nem nome de
 * módulo.
 */
function regraProibidaLegivel(violacoes: ReadonlyArray<{ id: string; trecho: string; motivo: string }>): string {
  const doCliente = violacoes.filter((v) => v.id === "proibicao_do_cliente");
  if (doCliente.length === 0) return "";
  return doCliente
    .map((v) => `«${v.trecho}» — ${v.motivo.replace(/^O cliente PROIBIU isto:\s*/i, "").split(". Peça que viola")[0]!.trim()}`)
    .join(" · ");
}

/** O markdown que o cliente lê. Era uma CÓPIA que se declarava "mesmo
 *  formato de texto que o motor usa" e NÃO era: faltava a linha
 *  `["cenas","Cenas"]`, e sem ela o carrossel refeito perdia as telas,
 *  `extrairPecas` lia `cenas=[]` e `publicacao.ts:1046` rebaixava a peça
 *  para feed. Comentário dizendo "igual ao motor" não é mecanismo; import é. */
const renderizar = renderizarEntrega;

// ═══════════════════════════════════════════════════════════════════════════
// A RECUSA — O "NÃO" DO CLIENTE É UM ATO, NÃO UM PEDIDO DE SEGUNDA TENTATIVA
// ═══════════════════════════════════════════════════════════════════════════
//
// ── O DEFEITO, MEDIDO (25/08/2026) ──────────────────────────────────────────
//
// `/api/portal/approvals` mandava "pedir ajuste" e "recusar" para a MESMA
// função — `refazerPorPedidoDoCliente` — e a única coisa que `modo: "recusa"`
// mudava era o PROMPT. O efeito era idêntico nos dois casos: refazia com IA,
// criava versão nova e **reabria o card em "pending"**.
//
// Quer dizer: **em nenhum produto desta casa a recusa ficava recusada.** O
// cliente apertava "recusar", e a máquina respondia "então faça de novo" — e
// devolvia a peça para ele decidir outra vez, sem que ninguém da equipe
// soubesse que ele tinha dito não.
//
// Isso não é um defeito do Story. É um defeito da casa inteira, e o Story só
// foi o primeiro produto a esbarrar nele.
//
// ── OS DOIS ATOS, AGORA COM DOIS EFEITOS ────────────────────────────────────
//
//   • "pedir ajuste" → `refazerPorPedidoDoCliente`. A máquina refaz. O cliente
//     quer a peça, com uma coisa diferente.
//   • "recusar"      → esta função. **A máquina PARA.** O cliente disse que
//     não é isso — e responder a um "não" com outra tentativa automática é
//     não ter ouvido. Quem decide o próximo passo é gente.
//
// ── O QUE ELA NÃO FAZ, E É O PONTO ──────────────────────────────────────────
//
// Não chama IA. Não cria versão. Não reabre o card. Não devolve a peça para a
// fila de entrega nem para a de publicação. Custa zero e não pode ser barrada
// por portão de pagamento: **cobrar do cliente o direito de dizer não seria a
// pior trava que esta casa já escreveu.**
//
// ── O QUE ELA FAZ ───────────────────────────────────────────────────────────
//
//   1. registra a PROIBIÇÃO — a recusa vira regra, como o ajuste já virava;
//   2. carimba a entrega como recusada pelo cliente, com as palavras dele;
//   3. tira as peças do caminho do relógio, com estado próprio;
//   4. **escala para o PM**, com a próxima ação escrita;
//   5. responde ao cliente a verdade: não vamos publicar, e alguém vai falar
//      com você.

// O estado da peça recusada vem do CONTRATO das quatro decisões
// (`portal/decisoes-do-portal.ts`), que é onde ele pertence e onde a rota do
// portal também o lê. Reexportado para quem já importa deste módulo — uma
// verdade, dois nomes de import, nunca dois valores.
export { STATUS_DA_PECA_RECUSADA };

/** O `revisionStatus` da entrega recusada PELO CLIENTE. Não é `quality_flag`:
 *  aquele é o veredito do juiz da casa, e confundir os dois faria o painel
 *  contar recusa de cliente como reprovação interna — dois problemas
 *  diferentes, com dois consertos diferentes. */
export const REVISION_STATUS_DA_RECUSA = "recusado_pelo_cliente";

export interface RecusaRegistrada {
  /** Os nomes das entregas carimbadas como recusadas. */
  entregasRecusadas: string[];
  /** As peças tiradas do caminho do relógio. */
  pecasRetiradas: string[];
  /** O PM foi acionado com a próxima ação? */
  escalado: boolean;
  avisouCliente: boolean;
  /** Por que não deu para registrar por inteiro, quando não deu. */
  motivo?: string;
}

/**
 * O CLIENTE RECUSOU. A corrente PARA aqui.
 *
 * Aceita as duas chaves de dono, como a irmã, e pelo mesmo motivo: o cliente
 * criado direto não tem solicitação nenhuma.
 *
 * **Sem motivo não há recusa.** É a mesma régua de `reprovacao.ts` ("recusar
 * sem dizer por quê é o gesto que parece produtivo e não ensina nada"), agora
 * do lado do cliente. A rota já exige o comentário; esta guarda existe porque
 * a trava do dano real tem de morar onde o dano acontece, não só na porta.
 */
export async function recusarPorPedidoDoCliente(input: {
  clientRequestId?: string | null;
  clientId?: string | null;
  department: string;
  comentario?: string;
  /** A entrega que o cliente apontou, quando o card a nomeia por FK. */
  deliverableId?: string | null;
  /** As peças do card. Vêm de `sourcePostIdsJson` — é o que liga a recusa às
   *  imagens que ele estava vendo. */
  postIds?: string[];
}): Promise<RecusaRegistrada> {
  const saida: RecusaRegistrada = {
    entregasRecusadas: [], pecasRetiradas: [], escalado: false, avisouCliente: false,
  };

  const clientRequestId = input.clientRequestId?.trim() || null;
  let clientId = input.clientId?.trim() || null;
  const req = clientRequestId
    ? await prisma.clientRequestDb.findUnique({
        where: { id: clientRequestId },
        select: { businessName: true, clientId: true },
      }).catch(() => null)
    : null;
  if (!clientId) clientId = req?.clientId ?? null;

  if (!clientRequestId && !clientId) {
    return { ...saida, escalado: true, motivo: "recusa sem dono: nem clientRequestId nem clientId" };
  }

  const comentario = input.comentario?.trim();
  const ancora: AncoraDoPedido = { clientId, clientRequestId };

  if (!comentario) {
    // Recusa muda não é recusa: ninguém sabe o que refazer, e a próxima peça
    // nasce com o mesmo defeito. Perguntar é o único caminho honesto.
    const avisou = await escreverNoPortal(ancora,
      "Vi que você recusou. Para eu não repetir o erro, me conta em uma frase o que não serviu — " +
      "e enquanto isso NÃO vou publicar nada. 💛");
    return { ...saida, avisouCliente: avisou, motivo: "recusa sem motivo — perguntei ao cliente" };
  }

  // ── A RECUSA VIRA REGRA ──────────────────────────────────────────────────
  // Mesmo mecanismo do ajuste, e com mais razão ainda: o que ele recusou não
  // pode reaparecer na peça seguinte. Best-effort — registro não derruba a
  // recusa, que já aconteceu.
  if (clientId) {
    await registrarProibicoes(clientId, comentario, "recusa").catch(() => { /* rastro */ });
  }

  const projeto = await prisma.project.findFirst({
    where: { OR: [
      ...(clientRequestId ? [{ clientRequestId }] : []),
      ...(clientId ? [{ clientId }] : []),
    ] },
    select: {
      id: true, workspaceId: true, clientId: true,
      client: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  }).catch(() => null);

  const cliente = clientId
    ? await prisma.client.findUnique({
        where: { id: clientId }, select: { name: true, workspaceId: true },
      }).catch(() => null)
    : null;

  const negocio = req?.businessName ?? projeto?.client?.name ?? cliente?.name ?? "o cliente";
  const dono = {
    id: projeto?.id ?? null,
    workspaceId: projeto?.workspaceId ?? cliente?.workspaceId ?? null,
    clientId: projeto?.clientId ?? clientId,
  };

  // ── A ENTREGA FICA CARIMBADA COMO RECUSADA ───────────────────────────────
  // Pelo vínculo do card quando ele existe; sem vínculo, pelas entregas
  // compartilhadas do departamento que ele apontou — a MESMA regra que decidiu
  // o que ele leu na tela. Nunca "todas as entregas do projeto".
  if (projeto) {
    const idsDoDepartamento = TODOS_OS_ESPECIALISTAS
      .filter((e) => e.departamentoId === input.department)
      .map((e) => e.id);

    // ── O CARD DO PEDIDO AVULSO NOMEIA O PEDIDO, NÃO O DEPARTAMENTO ───────
    //
    // `department` de um card de pedido é `pedido:<id>` — a grafia existe
    // justamente para que o caminho de volta exista sem adivinhação por ordem
    // (ver `producao-de-pedido.ts`). Sem ler esse prefixo, a busca por
    // especialistas do "departamento `pedido:cmt…`" não acha ninguém, e a
    // recusa passaria SEM carimbar a entrega — silenciosamente, que é o tipo de
    // buraco que esta função inteira veio fechar.
    //
    // Derivação, nunca invenção: o id vem do próprio card.
    const idDoPedido = input.department.startsWith("pedido:")
      ? input.department.slice("pedido:".length).trim()
      : null;
    const entregaDoPedido = idDoPedido
      ? (await prisma.contentRequest.findUnique({
          where: { id: idDoPedido }, select: { deliverableId: true },
        }).catch(() => null))?.deliverableId ?? null
      : null;

    const idAlvo = input.deliverableId ?? entregaDoPedido;

    const alvos = await prisma.deliverable.findMany({
      where: idAlvo
        ? { id: idAlvo }
        : {
            projectId: projeto.id,
            visibility: "compartilhado",
            ownerAgentId: { in: idsDoDepartamento.length > 0 ? idsDoDepartamento : ["__nenhum__"] },
          },
      select: { id: true, name: true },
    }).catch(() => [] as Array<{ id: string; name: string }>);

    for (const alvo of alvos) {
      await prisma.deliverable.update({
        where: { id: alvo.id },
        data: {
          // ── QUEM DISSE NÃO TEM NOME ────────────────────────────────────
          // `revisionStatus` é veredito, e veredito sem árbitro gravado é o
          // defeito do Farol 27: valor medido e não persistido é o mesmo que
          // não medido. Aqui quem julgou não é IA — é o CLIENTE, pela tela do
          // portal, autenticado por token. Por isso `camposDaDecisaoHumana`
          // (arbitragem `decisao_humana`) e não `camposDaQualidade`: dizer
          // "árbitro independente" numa recusa de cliente seria mentir sobre a
          // origem do veredito. O nome vem do dono do card, nunca inventado.
          ...camposDaDecisaoHumana(
            REVISION_STATUS_DA_RECUSA,
            `cliente:${clientId ?? clientRequestId ?? "desconhecido"}`,
          ),
          clientFeedback: comentario.slice(0, 2000),
        },
      }).catch(() => { /* rastro */ });
      saida.entregasRecusadas.push(alvo.name);
    }
  }

  // ── AS PEÇAS SAEM DO CAMINHO DO RELÓGIO ──────────────────────────────────
  // Filtradas pelo DONO, sempre: um id de peça de outro cliente dentro do JSON
  // do card não é tocado. Mesma guarda que a rota já aplica.
  const ids = (input.postIds ?? []).filter((x) => typeof x === "string" && x.length > 0);
  if (ids.length > 0 && clientId) {
    const alcancadas = await prisma.socialPost.updateMany({
      where: { id: { in: ids }, clientId },
      data: { status: STATUS_DA_PECA_RECUSADA },
    }).catch(() => ({ count: 0 }));
    if (alcancadas.count > 0) saida.pecasRetiradas = ids;
  }

  // ── O PM RECEBE A PRÓXIMA AÇÃO ───────────────────────────────────────────
  // É o critério E do contrato de aceite, e é o que separa "recusado" de
  // "engavetado": alguém tem de saber que o cliente disse não, hoje.
  await escalar(dono, negocio,
    `O CLIENTE RECUSOU a entrega do departamento "${input.department}". ` +
    `A peça NÃO foi refeita automaticamente e NÃO entra na fila de publicação — ` +
    "recusa não é pedido de segunda tentativa. " +
    "PRÓXIMA AÇÃO: falar com o cliente e decidir se refaz com direção nova, se muda o escopo ou se devolve.",
    comentario,
  ).catch(() => { /* o escalonamento é rastro; a recusa já valeu */ });
  saida.escalado = true;

  saida.avisouCliente = await escreverNoPortal(ancora, [
    "Entendido — recusa registrada, e eu NÃO vou publicar nada disso. 🛑",
    "",
    `O que você disse ficou anotado: "${comentario.slice(0, 300)}"`,
    "",
    "Não vou simplesmente tentar de novo no escuro: alguém da equipe vai falar com você para " +
    "acertar a direção antes de qualquer peça nova.",
  ].join("\n"));

  return saida;
}

// ═══════════════════════════════════════════════════════════════════════════
// O CANCELAMENTO — a produção PARA, inclusive o que ainda não virou peça
// ═══════════════════════════════════════════════════════════════════════════
//
// Ordem do CEO, 29/08/2026: "Cancelar avisa cliente e agência, e interrompe a
// produção na hora." Até aqui, `cancel` era a quarta decisão do contrato
// (`portal/decisoes-do-portal.ts`) sem NENHUM ramo próprio na rota do portal —
// o status era gravado no `ApprovalRequest` e, quando o card já tinha
// `SocialPost` vinculado, esses posts saíam do caminho do relógio. Ponto.
// Ninguém era avisado, e a ENTREGA que deu origem ao card nunca era tocada.
//
// ── O BURACO, MEDIDO NA PRÓPRIA ESTRUTURA DA CASA ───────────────────────────
//
// A esteira PADRÃO nasce card ANTES de post: `esteira/marcos.ts → apresentar()`
// cria o `ApprovalRequest`, e só DEPOIS — quando o pacote inteiro é aprovado
// (`aprovarPacote`) ou o ciclo (`aprovarCalendarioDoCicloCorrente`) —
// `esteira/publicacao.ts → agendarPostsDaEntrega()` lê TODO `Deliverable` do
// projeto com `revisionStatus === "quality_ok"` (o ÚNICO valor que passa,
// `REVISOES_QUE_PODEM_VIRAR_POST`) e vira post com data.
//
// Sem esta função, cancelar um card SEM posts ainda vinculados era cancelar
// NADA: a `ApprovalRequest` virava "cancelled", e a `Deliverable` continuava
// `quality_ok`, elegível. O cliente cancela a Pauta do Mês, aprova o resto do
// pacote, `aprovarPacote` roda, `agendarPostsDaEntrega` varre o projeto — e a
// Pauta CANCELADA vira posts com data, exatamente como se nunca tivesse sido
// cancelada. É "produção que já está em voo" na forma mais literal: o
// cancelamento não alcança o que ainda ia nascer.
//
// ── O QUE ESTA FUNÇÃO FAZ, e é o MESMO mecanismo da recusa ─────────────────
// Marca a(s) entrega(s) deste card com um `revisionStatus` que NÃO é
// `quality_ok` — `REVISION_STATUS_DO_CANCELAMENTO`. Como
// `REVISOES_QUE_PODEM_VIRAR_POST` só aceita `quality_ok`, isso tranca, pela
// MESMA porta, TODOS os caminhos que chamam `agendarPostsDaEntrega`
// (`marcos.ts`, `mes.ts`, `escada/repescagem.ts`, `execution/produzir-agora.ts`)
// — sem precisar ensinar cada um deles a conhecer "cancelado".
//
// Não chama IA, não cria versão, não mexe no que já é `SocialPost` (isso é da
// rota, que já tira os posts do caminho do relógio antes de chamar aqui).
export const REVISION_STATUS_DO_CANCELAMENTO = "cancelado_pelo_cliente";

export interface CancelamentoRegistrado {
  /** Os nomes das entregas carimbadas como canceladas — a prova de que a
   *  porta de `agendarPostsDaEntrega` foi fechada para elas. */
  entregasCanceladas: string[];
  /** O PM foi acionado? */
  escalado: boolean;
  avisouCliente: boolean;
  /** Por que não deu para registrar por inteiro, quando não deu. */
  motivo?: string;
}

/**
 * O CLIENTE CANCELOU. Nem o que já existe como peça, nem o que ainda ia
 * nascer, segue adiante.
 *
 * Aceita as duas chaves de dono, como a irmã (`recusarPorPedidoDoCliente`), e
 * pelo mesmo motivo: o cliente criado direto não tem solicitação nenhuma.
 */
export async function cancelarPorPedidoDoCliente(input: {
  clientRequestId?: string | null;
  clientId?: string | null;
  department: string;
  comentario?: string;
  /** A entrega que o cliente apontou, quando o card a nomeia por FK. */
  deliverableId?: string | null;
}): Promise<CancelamentoRegistrado> {
  const saida: CancelamentoRegistrado = {
    entregasCanceladas: [], escalado: false, avisouCliente: false,
  };

  const clientRequestId = input.clientRequestId?.trim() || null;
  let clientId = input.clientId?.trim() || null;
  const req = clientRequestId
    ? await prisma.clientRequestDb.findUnique({
        where: { id: clientRequestId },
        select: { businessName: true, clientId: true },
      }).catch(() => null)
    : null;
  if (!clientId) clientId = req?.clientId ?? null;

  if (!clientRequestId && !clientId) {
    return { ...saida, escalado: true, motivo: "cancelamento sem dono: nem clientRequestId nem clientId" };
  }

  const comentario = input.comentario?.trim();
  const ancora: AncoraDoPedido = { clientId, clientRequestId };

  const projeto = await prisma.project.findFirst({
    where: { OR: [
      ...(clientRequestId ? [{ clientRequestId }] : []),
      ...(clientId ? [{ clientId }] : []),
    ] },
    select: {
      id: true, workspaceId: true, clientId: true,
      client: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  }).catch(() => null);

  const cliente = clientId
    ? await prisma.client.findUnique({
        where: { id: clientId }, select: { name: true, workspaceId: true },
      }).catch(() => null)
    : null;

  const negocio = req?.businessName ?? projeto?.client?.name ?? cliente?.name ?? "o cliente";
  const dono = {
    id: projeto?.id ?? null,
    workspaceId: projeto?.workspaceId ?? cliente?.workspaceId ?? null,
    clientId: projeto?.clientId ?? clientId,
  };

  // ── A ENTREGA FICA CARIMBADA COMO CANCELADA ──────────────────────────────
  // Mesma mira de `recusarPorPedidoDoCliente`: pelo vínculo do card quando ele
  // existe; sem vínculo, pelas entregas compartilhadas do departamento que o
  // cliente apontou — nunca "todo o projeto".
  if (projeto) {
    const idsDoDepartamento = TODOS_OS_ESPECIALISTAS
      .filter((e) => e.departamentoId === input.department)
      .map((e) => e.id);

    // Card de PEDIDO AVULSO nomeia o pedido, não o departamento — mesma leitura
    // de `recusarPorPedidoDoCliente` (`producao-de-pedido.ts`).
    const idDoPedido = input.department.startsWith("pedido:")
      ? input.department.slice("pedido:".length).trim()
      : null;
    const entregaDoPedido = idDoPedido
      ? (await prisma.contentRequest.findUnique({
          where: { id: idDoPedido }, select: { deliverableId: true },
        }).catch(() => null))?.deliverableId ?? null
      : null;

    const idAlvo = input.deliverableId ?? entregaDoPedido;

    const alvos = await prisma.deliverable.findMany({
      where: idAlvo
        ? { id: idAlvo }
        : {
            projectId: projeto.id,
            visibility: "compartilhado",
            ownerAgentId: { in: idsDoDepartamento.length > 0 ? idsDoDepartamento : ["__nenhum__"] },
          },
      select: { id: true, name: true },
    }).catch(() => [] as Array<{ id: string; name: string }>);

    for (const alvo of alvos) {
      await prisma.deliverable.update({
        where: { id: alvo.id },
        data: {
          ...camposDaDecisaoHumana(
            REVISION_STATUS_DO_CANCELAMENTO,
            `cliente:${clientId ?? clientRequestId ?? "desconhecido"}`,
          ),
          ...(comentario ? { clientFeedback: comentario.slice(0, 2000) } : {}),
        },
      }).catch(() => { /* rastro */ });
      saida.entregasCanceladas.push(alvo.name);
    }
  }

  // ── O PM RECEBE A PRÓXIMA AÇÃO ───────────────────────────────────────────
  // Mesma tela que já lê `recusarPorPedidoDoCliente`: `ActivityEvent` →
  // `/api/agency/central` → `/agency/dashboard`.
  await escalar(dono, negocio,
    `O CLIENTE CANCELOU a entrega do departamento "${input.department}". ` +
    "Ela NÃO vira post nem entra na fila de publicação, nem agora nem quando o pacote inteiro for aprovado — " +
    "cancelamento é definitivo, não é pedido de segunda tentativa. " +
    "PRÓXIMA AÇÃO: confirmar com o cliente se o cancelamento é só desta peça ou do pacote, e se algo precisa nascer no lugar dela.",
    comentario ?? "(sem ressalva)",
  ).catch(() => { /* o escalonamento é rastro; o cancelamento já valeu */ });
  saida.escalado = true;

  saida.avisouCliente = await escreverNoPortal(ancora, [
    "Cancelamento registrado — essa entrega NÃO vai ser produzida nem publicada. 🛑",
    ...(comentario
      ? ["", `A ressalva que você deixou ficou anotada: "${comentario.slice(0, 300)}"`]
      : []),
    "",
    "Alguém da equipe vai confirmar com você os próximos passos.",
  ].join("\n"));

  return saida;
}
