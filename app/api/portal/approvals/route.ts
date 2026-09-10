// Client-facing approval actions — authenticated by portal token, not session.
// The client can approve / request revision / reject ONLY approvals that:
//   - belong to the request (or client) the token was issued for
//   - are marked clientVisible
//   - are still pending

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { validatePortalAccess } from "@/lib/agency/persistence/portal-access-service";
import { tokenDoPortal } from "@/lib/agency/persistence/portal-cookie";
import {
  updateApprovalStatus,
  addApprovalComment,
  cardGenerico,
  decidirIrmaosGenericos,
  type ApprovalStatus,
} from "@/lib/agency/persistence/approval-service";
import { pertenceAoToken } from "@/lib/agency/portal/posse-da-aprovacao";
import {
  DECISAO_PARA_STATUS,
  DECISAO_PARA_ESTADO_CANONICO,
  DECISOES_QUE_EXIGEM_COMENTARIO,
  ACAO_DUVIDA,
  STATUS_DA_PECA_RECUSADA,
} from "@/lib/agency/portal/decisoes-do-portal";
import { createProjectFromRequest } from "@/lib/agency/execution/create-project-from-request";
import { runProjectExecution } from "@/lib/agency/execution/run-execution";
import { negotiateProposal } from "@/lib/agency/execution/negotiate-proposal";
import { assessResources } from "@/lib/agency/execution/assess-resources";
import { deveBloquearMutacaoCrossSite } from "@/lib/security/navegacao-cross-site";
import { pecasApontadasPeloAjuste } from "@/lib/agency/esteira/mira-da-peca";
import { devolveADecisao, classificarParada } from "@/lib/agency/esteira/porta-do-ajuste";

import { VOZ_DO_CLIENTE } from "@/lib/agency/gerencia/voz-unica";
// V2 (M5): as QUATRO decisões do cliente + a dúvida vivem num contrato único
// (`lib/agency/portal/decisoes-do-portal.ts`) — rota e tela leem a mesma
// tabela. `cancel` encerra a entrega com ressalva e auditoria; nada apaga
// versão anterior.
const ACTION_TO_STATUS = DECISAO_PARA_STATUS;
const ACTION_QUESTION = ACAO_DUVIDA;
const ACTIONS_REQUIRING_COMMENT = DECISOES_QUE_EXIGEM_COMENTARIO;

/** Lê os ids de post de um card de calendário. JSON quebrado vira lista vazia —
 *  nunca exceção: um campo corrompido não pode engolir a decisão do cliente. */
function lerListaDeIds(bruto: string | null | undefined): string[] {
  try {
    const v = JSON.parse(bruto ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: {
    token?: string;
    approvalRequestId?: string;
    action?: string;
    comment?: string;
    authorName?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // A4: o token pode vir no corpo (links antigos) ou no cookie httpOnly de
  // sessão do portal — o cookie é o caminho novo, o corpo é compatibilidade.
  const token = tokenDoPortal(request, body.token);
  const { approvalRequestId, action } = body;
  if (!token || !approvalRequestId || !action) {
    return NextResponse.json(
      { error: "token, approvalRequestId, action required" },
      { status: 400 },
    );
  }

  // FAIXA 1 do CSRF: a decisão do cliente aprova proposta, cria projeto e
  // dispara produção real — autenticada por cookie httpOnly do portal.
  if (deveBloquearMutacaoCrossSite(request)) {
    return NextResponse.json({ error: "Origem não confiável para esta ação." }, { status: 403 });
  }

  const status = ACTION_TO_STATUS[action];
  if (!status && action !== ACTION_QUESTION) {
    return NextResponse.json(
      { error: `Invalid action. Valid: ${[...Object.keys(ACTION_TO_STATUS), ACTION_QUESTION].join(", ")}` },
      { status: 400 },
    );
  }

  // Validado ANTES de qualquer efeito: até 03/08/2026 o código aceitava
  // "solicitar ajustes" sem uma palavra — e a refação, sem as palavras do
  // cliente, refazia no escuro (Fase 1, 1.10). A UI reforça; a trava é aqui.
  if (ACTIONS_REQUIRING_COMMENT.has(action) && !body.comment?.trim()) {
    return NextResponse.json(
      { error: "Comentário obrigatório: conte o que precisa mudar (ou qual é a dúvida) para a equipe agir." },
      { status: 400 },
    );
  }

  // 1. Validate the portal token.
  const access = await validatePortalAccess(token);
  if (!access.valid || !access.record) {
    return NextResponse.json({ error: "Access denied", reason: access.reason }, { status: 403 });
  }

  try {
    // 2. Load the approval and verify it belongs to this token's scope.
    const approval = await prisma.approvalRequest.findUnique({
      where: { id: approvalRequestId },
      include: {
        clientRequest: { select: { id: true, clientId: true } },
        // QUAL PEÇA este card decide. É o vínculo por FK, e é ele que a refação
        // usa para mirar a entrega certa em vez do departamento inteiro.
        deliverableVersion: { select: { deliverableId: true } },
      },
    });
    if (!approval) {
      return NextResponse.json({ error: "Approval not found" }, { status: 404 });
    }

    // Posse por OR: a aprovação pode pertencer ao token pela SOLICITAÇÃO
    // (fluxo Brain) ou pelo CLIENTE direto (`ApprovalRequest.clientId` —
    // caso Foocci, sem ClientRequestDb). Dono sempre derivado do token; a
    // derivação por clientId só roda quando a chave de solicitação não bateu.
    // V2 (M5): a posse virou função PURA (posse-da-aprovacao.ts) para o gate
    // de isolamento ser provado por teste — o comportamento é o mesmo de
    // sempre, INCLUSIVE a preguiça: a solicitação do token só é buscada quando
    // a checagem direta não bastou (o caminho quente não paga a consulta).
    const tokenRequestId = access.record.clientRequestId;
    const formaDaAprovacao = {
      clientRequestId: approval.clientRequestId,
      clientId: approval.clientId,
      clientRequestClientId: approval.clientRequest?.clientId ?? null,
    };
    const formaDoToken = { clientRequestId: tokenRequestId, clientId: access.record.clientId };
    let belongsToToken = pertenceAoToken(formaDaAprovacao, formaDoToken, null);
    if (!belongsToToken && !access.record.clientId && tokenRequestId) {
      const solicitacao = await prisma.clientRequestDb.findUnique({
        where: { id: tokenRequestId }, select: { clientId: true },
      });
      belongsToToken = pertenceAoToken(formaDaAprovacao, formaDoToken, solicitacao?.clientId ?? null);
    }
    if (!belongsToToken) {
      // 404, e a MESMA mensagem do "não existe" (linha ~121 acima): o approval
      // JÁ EXISTE (passou o !approval logo acima) mas é de outro token/cliente.
      // 403 aqui confirmaria a existência do id a quem está sondando — oráculo
      // de enumeração (convenção da casa: ver `app/api/agency/clients/[id]/marca/route.ts`).
      return NextResponse.json({ error: "Approval not found" }, { status: 404 });
    }

    if (!approval.clientVisible) {
      return NextResponse.json({ error: "Approval is not client-visible" }, { status: 403 });
    }
    if (approval.status !== "pending") {
      return NextResponse.json(
        { error: `Approval already decided (${approval.status})` },
        { status: 409 },
      );
    }

    const clientIdentity = body.authorName?.trim() || `portal:${token.slice(0, 8)}…`;

    // ── CAMINHO C — "TENHO UMA DÚVIDA" ────────────────────────────────────────
    // Não decide nada: o status continua "pending", a dúvida fica PRESA ao card
    // (ApprovalComment kind "question", não numa thread geral) e o relógio do
    // prazo pausa — não pode correr contra o cliente enquanto a bola está com
    // a agência (Fase 2, T5). A resposta da agência despausa
    // (approval-service.addApprovalComment).
    if (action === ACTION_QUESTION) {
      await addApprovalComment({
        approvalRequestId,
        authorName:      clientIdentity,
        authorRole:      "client",
        kind:            "question",
        body:            body.comment!.trim(),
        isClientVisible: true,
      });
      if (!approval.questionOpenedAt) {
        await prisma.approvalRequest.update({
          where: { id: approvalRequestId },
          data: { questionOpenedAt: new Date() },
        });
      }
      return NextResponse.json({ id: approvalRequestId, status: "pending", questionOpen: true });
    }

    // Card de CALENDÁRIO (origem: /api/social-posts/aprovacao): o reviewNote é
    // o corpo que o cliente leu — a decisão não pode reescrevê-lo com o
    // comentário (que já fica registrado como ApprovalComment logo abaixo).
    // ── ⚠️ CARD SEM PEÇAS = AJUSTE QUE NÃO ALCANÇA A ARTE (26/08/2026) ────
    //
    // Tudo o que refaz ARTE, daqui para baixo, vive dentro de
    // `if (postsDoCard.length > 0 …)`. Quando o card não carrega peças, esse
    // ramo inteiro é pulado — em silêncio.
    //
    // Medido pelo cliente oculto em produção (projeto
    // cmt9f1f7w001y0xo781zi2jt4): ele pediu "as duas artes mais claras", a rota
    // devolveu 200 com `revision_requested`, e SEIS MINUTOS depois os dois
    // arquivos eram byte a byte os mesmos (sha256 reconferido). O que mudou foi
    // um TEXTO — `Pauta do Mês`, v2, com `lastFeedback: "Refeita a pedido do
    // cliente: As duas artes estao escuras dem…"`. Pior que não fazer nada: o
    // registro diz "refeita a pedido do cliente".
    //
    // A causa é estrutural: o card da esteira PADRÃO nasce em
    // `esteira/marcos.ts → apresentar()`, e os `SocialPost` só são criados
    // DEPOIS, em `esteira/publicacao.ts → agendarPostsDaEntrega()`. Na hora em
    // que o card nasce, não há peça para ligar. Os caminhos de PRODUTO
    // (`produtos/story-instagram-v1.ts:609`, `esteira/producao-de-pedido.ts:740`)
    // criam o card depois das peças e por isso funcionam.
    //
    // NÃO consertado aqui: ligar o card às peças muda o momento em que o
    // cliente é chamado a decidir, em toda a esteira padrão — é decisão de
    // desenho, com dono (`marcos.ts` + `publicacao.ts`). Registro completo em
    // `docs/medicoes/o-ajuste-nao-alcanca-a-arte-26-08.md`.
    const postsDoCard = lerListaDeIds(approval.sourcePostIdsJson);

    // 3. Apply the decision. reviewedBy records the client identity.
    // (`status` é garantido aqui: a única ação sem status é "question", que já
    // retornou acima.)
    const updated = await updateApprovalStatus(
      approvalRequestId,
      status!,
      `client:${clientIdentity}`,
      postsDoCard.length > 0 ? undefined : (body.comment?.trim() || undefined),
    );

    // 3a-V2. ── TODA DECISÃO DEIXA RASTRO CANÔNICO ─────────────────────────
    // TransicaoDeEstado com chave idempotente: a mesma decisão nunca audita
    // duas vezes, e auditoria NUNCA derruba a decisão do cliente (best-effort
    // declarado). client_approval → estado do mapa das quatro decisões.
    //
    // ── A CHAVE ERA DO CARD, E O CARD DECIDE MAIS DE UMA VEZ (5ª auditoria) ──
    //
    // Ela era `portal:<card>:decisao` — UMA por card, para sempre. Mas o ciclo
    // do ajuste tem DUAS decisões no mesmo card: o cliente pede a mudança, o
    // card reabre com a versão nova, e ele aprova. A segunda batia em
    // `Unique constraint failed on (chaveIdempotencia)` e o erro era engolido
    // como "rastro canônico não gravado (não-fatal)".
    //
    // Resultado medido: a autoria no card sobrevivia (`reviewedBy`), o registro
    // IMUTÁVEL não. E o buraco passava porque o teste da RECUSA exige o rastro
    // e o do AJUSTE não pedia — a única decisão que roda duas vezes era a única
    // sem régua.
    //
    // A chave agora carrega a RODADA, e a rodada é o INSTANTE em que esta
    // decisão foi carimbada — `reviewedAt`, que `updateApprovalStatus` acabou
    // de escrever três linhas acima. Duas decisões do mesmo card são dois
    // instantes; a mesma decisão é sempre o mesmo instante.
    //
    // ⚠️ Contar rastros no banco também resolveria, e foi a primeira tentativa.
    // Foi descartada por uma razão que esta casa já pagou: era uma consulta a
    // mais ANTES do `try`, e uma consulta que estoura ali derruba a decisão do
    // cliente com 503 — exatamente o que a linha acima promete que nunca
    // acontece ("auditoria NUNCA derruba a decisão do cliente"). A auditoria
    // não pode cobrar um preço do cliente. Aqui não há consulta: o dado já
    // está na mão.
    //
    // ⚠️ E ATÉ ONDE ISSO PROTEGE — MEDIDO, NÃO SUPOSTO (6ª auditoria)
    //
    // O duplo-clique HUMANO não chega até aqui: a rota devolve 409 para card
    // que não está `pending` (bloco acima), e é lá que a idempotência do
    // clique repetido mora.
    //
    // O que este comentário dizia antes — *"a chave única continua sendo a
    // trava final contra duas requisições simultâneas"* — **não é mais
    // verdade, e a doutrina da casa é que doutrina que descreve o
    // comportamento antigo é pior que doutrina nenhuma.**
    //
    // Ela deixou de ser verdade quando a chave passou a carregar `reviewedAt`:
    // `updateApprovalStatus` grava `reviewedAt: new Date()` SEM guarda de
    // `status: "pending"`. Duas requisições verdadeiramente simultâneas passam
    // as duas pelo 409 (que é ler-depois-escrever, sem trava no banco),
    // carimbam dois instantes diferentes e produzem duas chaves diferentes —
    // logo, DOIS rastros para uma decisão. A chave única segue impedindo o
    // reprocessamento da MESMA decisão (mesmo instante), que é para o que ela
    // serve; ela não é, e não era, a trava da corrida.
    //
    // A trava real da corrida continua sendo o 409, com a fraqueza declarada:
    // é leitura seguida de escrita, não um compare-and-set. Fechá-la de
    // verdade é um `updateMany({ where: { id, status: "pending" } })` em
    // `updateApprovalStatus`, que atravessa todos os chamadores dela — está
    // no registro da dívida, não escondido aqui. O dano do resíduo é rastro
    // duplicado (ruído de auditoria); a decisão do cliente, o estado do card e
    // as peças permanecem corretos, porque as duas requisições escrevem a
    // MESMA decisão.
    const rodadaDaDecisao = (updated.reviewedAt ?? new Date()).toISOString();
    try {
      await prisma.transicaoDeEstado.create({
        data: {
          entidadeTipo: "ApprovalRequest",
          entidadeId: approvalRequestId,
          de: "client_approval",
          para: DECISAO_PARA_ESTADO_CANONICO[action] ?? "revision",
          atorTipo: "humano",
          atorId: `cliente:${clientIdentity}`,
          motivo: body.comment?.trim() || `decisão do cliente: ${action}`,
          origem: "portal",
          versaoLida: 0,
          chaveIdempotencia: `portal:${approvalRequestId}:decisao:${action}:${rodadaDaDecisao}`,
          correlationId: approval.clientRequestId ?? approval.clientId ?? approvalRequestId,
        },
      });
    } catch (e) {
      // Chave repetida (decisão reprocessada) ou falha de escrita: registrada, nunca fatal.
      console.warn("[portal/approvals] rastro canônico não gravado (não-fatal)", e instanceof Error ? e.message : e);
    }

    // 3b. ── A DUPLICATA FECHA JUNTO ──────────────────────────────────────────
    // Card genérico (sem nota, sem versão, sem posts) tem irmãos genéricos do
    // mesmo departamento quando o motor rodou vários especialistas — eram três
    // "Pauta do Mês" na tela do cliente para UMA decisão. O portal agora mostra
    // um só; aqui os outros fecham com a mesma decisão, para não sobrar
    // "pending" invisível travando `aprovarPacote`.
    // Best-effort declarado: fechar a duplicata é higiene, e higiene nunca
    // pode derrubar a decisão que o cliente acabou de tomar.
    try {
      if (cardGenerico(approval)) {
        const fechados = await decidirIrmaosGenericos({
          id: approval.id,
          clientRequestId: approval.clientRequestId,
          clientId: approval.clientId,
          department: approval.department,
          status: status!,
          reviewedBy: `client:${clientIdentity}`,
        });
        if (fechados > 0) {
          console.warn(`[portal/approvals] ${fechados} card(s) duplicado(s) de ${approval.department} fecharam junto com ${approval.id}`);
        }
      }
    } catch (e) {
      console.error("[portal/approvals] fechamento das duplicatas falhou", e);
    }

    // 4. Persist the comment as a client-visible ApprovalComment.
    if (body.comment?.trim()) {
      await addApprovalComment({
        approvalRequestId,
        authorName:      clientIdentity,
        authorRole:      "client",
        body:            body.comment.trim(),
        isClientVisible: true,
      });
    }

    // ── A DECISÃO PROPAGA AOS POSTS DO CARD ───────────────────────────────────
    // É o fechamento do circuito do Lote 1: o clique do cliente nunca pode
    // "gravar um status e acabar ali".
    //
    // 05/08/2026 — o beco sem saída: aprovar gravava `status: "approved"` e
    // NADA no repositório movia `approved → scheduled`. `publicarAgendados` só
    // olha "scheduled". O cliente aprovava os 6 carrosséis, o portal escrevia
    // "Aprovado por você", e nenhum post ia ao ar — nunca, sem ninguém saber.
    // Agora a aprovação PROMOVE a peça a "scheduled" pela mesma função que
    // atende o pacote e o ciclo (esteira/publicacao.ts), com o mesmo empurrão
    // de datas — um caminho só para o estado que autoriza publicar.
    //
    // Pedir ajuste ou recusar → "revision_requested", e o comentário
    // (obrigatório nas duas) já está no registro do card como ApprovalComment.
    // Filtro por clientId do CARD nos dois ramos: um id de post de outro cliente
    // dentro do JSON não é tocado.
    if (postsDoCard.length > 0 && approval.clientId) {
      if (status === "approved") {
        try {
          // Import dinâmico: publicacao.ts fala com a Meta e não deve entrar no
          // pacote desta rota só por causa de um ramo.
          const { agendarPecasAprovadas } = await import("@/lib/agency/esteira/publicacao");
          const r = await agendarPecasAprovadas({ clientId: approval.clientId, postIds: postsDoCard });
          if (r.ignorados.length > 0) {
            // ── `console.error` NÃO É PARADA DECLARADA (5ª auditoria) ──────
            //
            // Até aqui esta era a única coisa que acontecia com `ignorados`:
            // uma linha de log. Nada no estado, nada para o PM, nada para o
            // cliente. E o log do teste VERDE do ajuste imprimia o defeito
            // (`…=revision_requested, …`) enquanto o teste passava por cima.
            //
            // Peça aprovada que não virou calendário é trabalho PAGO preso num
            // estado que o relógio não lê. O critério F exige motivo, dono e
            // próxima ação — e exige que quem precisa saber saiba.
            const { declararPecasAprovadasQueNaoEntraramNaFila } =
              await import("@/lib/agency/esteira/peca-aprovada-que-nao-agendou");
            await declararPecasAprovadasQueNaoEntraramNaFila({
              ignorados: r.ignorados,
              clientId: approval.clientId,
              clientRequestId: approval.clientRequestId,
            });
          }
        } catch (e) { console.error("[portal/approvals] agendamento das peças falhou", e); }
      } else {
        // V2 (M5): cancelar ENCERRA — a peça sai do caminho do relógio
        // ("cancelled" é inerte para publicarAgendados) e nenhuma versão é
        // apagada. Ajuste/recusa seguem para revisão, como sempre.
        // ── TRÊS DECISÕES, TRÊS ESTADOS (25/08/2026) ──────────────────────
        // Eram dois: cancelar virava "cancelled" e TODO o resto virava
        // "revision_requested" — inclusive a RECUSA. A peça recusada ficava
        // marcada "em ajuste", que quer dizer "alguém está refazendo isto", que
        // era mentira: ninguém estava, e o cliente tinha dito não.
        // `rejected` é terminal para a máquina: `publicarAgendados` só lê
        // "scheduled", e `ESTADOS_EXAMINAVEIS` não o inclui — a peça não volta
        // a ser oferecida para decisão sozinha.
        const statusDosPosts =
          status === "cancelled" ? "cancelled"
          : status === "rejected" ? STATUS_DA_PECA_RECUSADA
          : "revision_requested";

        // ── A MIRA VALE PARA O ESTADO, NÃO SÓ PARA O PIXEL (5ª auditoria) ──
        //
        // O achado, medido contra o controle: o cliente apontou UMA peça de
        // quatro; a arte nova saiu certa, nela e só nela — e as OUTRAS TRÊS
        // terminaram em `revision_requested`. `ESTADOS_PROMOVIVEIS`
        // (esteira/publicacao.ts) não inclui esse estado, de propósito. Ou
        // seja: três quartos do que o cliente pagou e aprovou nunca entravam
        // na fila de entrega. Silenciosamente.
        //
        // A causa era esta linha: ela carimbava `revision_requested` em TODAS
        // as peças do card. A mira que a rodada anterior construiu acertava a
        // imagem paga e errava o estado — o mesmo defeito do risco 4 do plano
        // ("refação sem mira"), visto do outro lado.
        //
        // Quem o cliente APONTOU entra em revisão. Quem ele NÃO apontou fica
        // exatamente como estava: ele não disse nada sobre aquelas peças, e
        // "ele não falou" não é "ele recusou" (guardrail 1 — ausência de
        // informação não é informação). Elas seguem decidíveis, e o "sim" que
        // vier no card reaberto as agenda pelo caminho de sempre.
        //
        // Vale SÓ para o ajuste. Recusa e cancelamento são do CARD inteiro: ele
        // não está apontando uma peça, está dizendo não ao que recebeu.
        const alvosDoEstado =
          status === "revision_requested"
            ? pecasApontadasPeloAjuste(postsDoCard, body.comment)
            : postsDoCard;

        if (alvosDoEstado.length > 0) {
          await prisma.socialPost.updateMany({
            where: { id: { in: alvosDoEstado }, clientId: approval.clientId },
            data: { status: statusDosPosts },
          }).catch((e) => console.error("[portal/approvals] propagação aos posts falhou", e));
        }
      }
    }

    // The client approving a PROPOSAL is what creates the project and sets the
    // agents running — the whole point of "the client decides". Best-effort:
    // a failure here never blocks the approval response (a cron also recovers
    // stuck execution).
    let projectId: string | undefined;
    if (approval.department === "proposal" && status === "approved" && approval.clientRequestId) {
      try {
        const created = await createProjectFromRequest(approval.clientRequestId, `client:${clientIdentity}`);
        if (created.ok) {
          projectId = created.projectId;
          // Resource gate: do we have everything to create what the client asked
          // for? YES → produce. NO → request exactly what's missing and hold.
          const gate = await assessResources(approval.clientRequestId);
          if (gate.sufficient) {
            void runProjectExecution(created.projectId).catch(() => {});
          } else {
            for (const m of gate.missing) {
              await prisma.materialRequest.create({ data: { projectId: created.projectId, type: m.type, description: m.description } });
            }
            const list = gate.missing.map((m) => `• ${m.description}`).join("\n");
            await prisma.portalMessage.create({
              data: {
                clientRequestId: approval.clientRequestId, authorRole: "team", authorName: VOZ_DO_CLIENTE,
                body: `Seu projeto foi aprovado! 🎉 Pra gente começar a produzir com qualidade, só precisamos de alguns materiais seus:\n\n${list}\n\nÉ só enviar na aba "Materiais" aqui do portal — assim que chegarem, os agentes começam na hora. 💛`,
                readByTeam: false,
              },
            });
          }
        }
      } catch (e) {
        console.error("[portal/approvals] proposal→project error", e);
      }
    }

    // Client rejected or asked to revise the proposal → the SDR re-engages to
    // negotiate (within the budget agent's floor) and re-opens an offer.
    if (approval.department === "proposal" && (status === "rejected" || status === "revision_requested") && approval.clientRequestId) {
      try { await negotiateProposal(approval.clientRequestId, body.comment); }
      catch (e) { console.error("[portal/approvals] negotiate error", e); }
    }

    // ── O CLIENTE FALOU SOBRE UMA ENTREGA ─────────────────────────────────────
    // Até 02/08/2026 nada acontecia aqui. Os três botões existiam no portal e
    // só o de proposta fazia efeito: o clique numa ENTREGA gravava um status e
    // acabava ali. Nada refeito, ninguém avisado, e a tela do cliente dizia
    // "revisão solicitada" para sempre. Ele acreditava que tinha pedido; a
    // agência não sabia que fora pedido.
    //
    // Best-effort de propósito: a resposta ao clique do cliente nunca depende
    // de uma chamada de IA dar certo.
    // A condição era `department !== "proposal" && approval.clientRequestId`, e
    // o segundo termo era o buraco (05/08/2026): card de CLIENTE DIRETO nasce
    // só com `clientId` (por design de /api/social-posts/aprovacao — o caso
    // Foocci). Ele caía fora do `if` inteiro: o cliente escrevia o que queria
    // mudar, a peça virava "revision_requested", e nada refazia, ninguém
    // escalava, ninguém avisava — o mesmo defeito que refacao.ts dizia ter
    // consertado, sobrevivendo pelo outro ramo. A posse agora é pelas DUAS
    // chaves, como na conversa (app/api/messages/conversa.ts).
    const clienteDoCard = approval.clientId ?? approval.clientRequest?.clientId ?? null;
    if (approval.department !== "proposal" && (approval.clientRequestId || clienteDoCard)) {
      // ── A RECUSA PARA. O AJUSTE REFAZ. (25/08/2026) ────────────────────
      //
      // Os dois caíam AQUI, na mesma chamada, e o efeito era idêntico: refazia
      // com IA, criava versão nova e REABRIA o card em "pending". O cliente
      // apertava "recusar" e a máquina respondia "então faça de novo" —
      // devolvendo a peça para ele decidir outra vez, sem que ninguém da equipe
      // soubesse que ele tinha dito não.
      //
      // Isso valia para TODOS os produtos da casa, não só para o que esbarrou
      // nisso primeiro. Recusa não é pedido de segunda tentativa.
      if (status === "rejected") {
        try {
          const { recusarPorPedidoDoCliente } = await import("@/lib/agency/esteira/refacao");
          await recusarPorPedidoDoCliente({
            clientRequestId: approval.clientRequestId,
            clientId: clienteDoCard,
            department: approval.department,
            comentario: body.comment,
            deliverableId: approval.deliverableVersion?.deliverableId ?? null,
            // As peças que ele estava VENDO quando disse não.
            postIds: postsDoCard,
          });
        } catch (e) { console.error("[portal/approvals] recusa error", e); }
      } else if (status === "revision_requested") {
        try {
          const { refazerPorPedidoDoCliente } = await import("@/lib/agency/esteira/refacao");
          const feita = await refazerPorPedidoDoCliente({
            clientRequestId: approval.clientRequestId,
            clientId: clienteDoCard,
            department: approval.department,
            comentario: body.comment,
            // ── A PEÇA, E QUAL DOS DOIS ATOS FOI ─────────────────────────────
            // Até 24/08/2026 esta chamada mandava só o DEPARTAMENTO, e mandava
            // o mesmo objeto para "pedir ajuste" e para "recusar". Os dois
            // buracos eram visíveis daqui: o card sabe qual versão está sendo
            // decidida (`deliverableVersionId`) e a rota sabe qual botão o
            // cliente apertou (`status`) — as duas informações existiam e
            // nenhuma das duas atravessava a fronteira.
            deliverableId: approval.deliverableVersion?.deliverableId ?? null,
            // ── AS PEÇAS QUE ELE ESTAVA VENDO (25/08/2026) ─────────────────
            //
            // A recusa já recebia isto; o AJUSTE não. E era esse o buraco que a
            // 4ª auditoria mediu: sem os `postIds`, `refazerPorPedidoDoCliente`
            // refazia o TEXTO e nada chamava o rasterizador — o cliente pedia
            // "a terceira mais clara", recebia 200, e 0 de 4 arquivos mudavam.
            //
            // A ORDEM importa e é a mesma que o cartão mostrou: é ela que faz
            // "a terceira peça" ser a terceira imagem, e não outra.
            postIds: postsDoCard,
            // Só o AJUSTE chega aqui agora. `modo` continua no contrato de
            // `refazerPorPedidoDoCliente` porque a agência ainda pode mandar
            // refazer uma peça recusada DEPOIS de falar com o cliente — o que
            // acabou é a máquina fazer isso sozinha, no lugar dele.
            modo: "ajuste",
          });

          // ═══════════════════════════════════════════════════════════════
          // O AJUSTE NÃO PODE VIRAR BECO (26/08/2026, cliente oculto)
          // ═══════════════════════════════════════════════════════════════
          //
          // ── O QUE FOI MEDIDO ──────────────────────────────────────────
          // A cliente apontou a terceira de quatro peças pagas. A refação
          // reescreveu o texto e o PISO DE VERDADE barrou — o texto novo
          // usava justamente o que ela tinha registrado como proibido.
          // **Parar foi certo e continua certo**; nada aqui afrouxa isso.
          //
          // O defeito era o depois: sem peça nova, o card ficava carimbado
          // `revision_requested` para sempre, e a partir dali esta mesma
          // rota devolvia **409 "já decidido"** para aprovar, recusar E
          // cancelar. Um clique consumia o direito de decidir sobre quatro
          // peças que ela já tinha pago e que estavam na mão dela.
          //
          // Para um humano isso é uma semana perdida. Para um AGENTE DE IA
          // representando uma marca — o que vem por aí — é laço infinito.
          //
          // ── POR QUE ISSO NÃO CRIA O DEFEITO OPOSTO ────────────────────
          // "Deixar decidir sempre" abriria a janela em que ele aprova a
          // peça ENQUANTO a refação dela roda, e a casa entrega a versão
          // velha depois de ter mandado refazer.
          //
          // Não há janela aqui, e o motivo é o MOMENTO: o `await` acima
          // esperou a refação INTEIRA — texto, arte e a reabertura que ela
          // mesma faz quando nasceu versão nova. Quando esta linha roda, ou
          // existe peça nova (e o card já reabriu apontando para ELA, e
          // `devolveADecisao` é falso), ou a refação parou de vez.
          //
          // E a escrita é um COMPARE-AND-SET: `updateMany` com
          // `status: "revision_requested"` no `where`. Se qualquer outro
          // caminho já mexeu no card, nada acontece — esta linha jamais
          // sobrepõe um estado que não é o que a rota acabou de deixar. Não
          // é prompt pedindo cuidado; é a condição na cláusula.
          // ⚠️ A PERGUNTA É FEITA AQUI, E NÃO LIDA DE UM CAMPO — e a razão foi
          // medida em produção 20 minutos depois do primeiro conserto.
          //
          // A primeira versão lia `feita.devolveADecisao`, um campo que
          // `refacao.ts` preenchia no FIM do caminho principal. Só que aquela
          // função tem SEIS retornos antecipados (sem projeto, sem entrega
          // correspondente, portão de pagamento, pedido sem descrição…) e
          // nenhum deles passava por essa linha: o campo voltava `undefined`,
          // que é falso, e a porta continuava trancada.
          //
          // Foi exatamente o que aconteceu no cliente oculto de produção: card
          // novo, ajuste pedido, "sem entrega correspondente" — e 409 nas três
          // portas outra vez. Um campo que alguém precisa lembrar de preencher
          // é prompt, não trava.
          //
          // A função pura decide sobre o que SEMPRE existe na saída (`refeitas`
          // e `arte`). Todo caminho de retorno passa a ser coberto por
          // construção, inclusive os que ainda nem foram escritos.
          if (devolveADecisao(feita)) {
            await prisma.approvalRequest.updateMany({
              where: { id: approvalRequestId, status: "revision_requested" },
              // `reviewedAt`/`reviewedBy` voltam a nulo porque a decisão
              // ANTERIOR (o pedido de ajuste) já cumpriu o seu papel e está
              // gravada no comentário e no rastro canônico. Deixá-los aqui
              // faria o portal mostrar "decidido por você" sobre um card que
              // está pedindo decisão.
              data: { status: "pending", reviewedAt: null, reviewedBy: null },
            }).catch((e) => console.error("[portal/approvals] devolução da decisão falhou", e));

            // ── E ELE LÊ O PORQUÊ NO PRÓPRIO CARD ───────────────────────
            // O comentário do card é renderizado no histórico da aprovação
            // (`components/portal/AprovacoesDoCliente.tsx`), que é onde ele
            // está olhando quando decide. A mensagem na aba de conversa e o
            // aviso na peça continuam — três superfícies, porque nesta
            // operação o aviso já morreu numa coluna três vezes.
            // Sem parada CLASSIFICADA (caminhos antigos de retorno antecipado),
            // o cliente ainda lê o porquê: a classe conservadora é "precisa de
            // gente", que é verdade em todos eles. Silêncio aqui seria repetir
            // metade do defeito — porta aberta e nenhuma explicação.
            const parada = feita.parada
              ?? classificarParada({ causa: "sem_entrega", detalhe: feita.motivo });
            {
              await addApprovalComment({
                approvalRequestId,
                authorName:      "Gerente de projeto",
                // "internal" é a grafia desta casa para "a agência falou"
                // (`approval-service.ts`); ela também DESPAUSA o prazo, que é
                // o comportamento certo: a bola volta para o cliente.
                authorRole:      "internal",
                kind:            "answer",
                body:            parada.avisoAoCliente,
                isClientVisible: true,
              }).catch((e) => console.error("[portal/approvals] aviso da parada não gravado", e));
            }
          }
        } catch (e) { console.error("[portal/approvals] refação error", e); }
      }

      // Aprovou a última pendência? Então ele aprovou o pacote — e é isso que
      // abre a operação contínua. Sem esta ponte, `aprovarPacote` só era
      // alcançável por alguém da agência clicando por ele.
      if (status === "approved" && approval.clientRequestId) {
        try {
          const restantes = await prisma.approvalRequest.count({
            where: { clientRequestId: approval.clientRequestId, status: "pending", clientVisible: true },
          });
          if (restantes === 0) {
            const projeto = await prisma.project.findFirst({
              where: { clientRequestId: approval.clientRequestId, presentedAt: { not: null } },
              select: { id: true, clientApprovedAt: true },
              orderBy: { createdAt: "desc" },
            });
            if (projeto && !projeto.clientApprovedAt) {
              const { aprovarPacote } = await import("@/lib/agency/esteira/marcos");
              // A MESMA identidade que acabou de decidir o card — derivada do
              // token do portal, e gravada com a MESMA grafia (`client:<nome>`)
              // que `updateApprovalStatus` acabou de escrever três blocos acima.
              await aprovarPacote(projeto.id, { tipo: "cliente", nome: clientIdentity });
            } else if (projeto) {
              // ── DO MÊS 2 EM DIANTE (05/08/2026) ─────────────────────────────
              // `aprovarPacote` aborta de saída quando `clientApprovedAt` já
              // existe, e ele era o ÚNICO chamador de `aprovarCalendario`.
              // Resultado: o cliente de mensalidade aprovava o mês 2 depois de
              // ler "Aprove e a gente já agenda as publicações" (mes.ts,
              // apresentarCiclo) e o mês inteiro ficava em rascunho. Todo mês.
              // O consentimento do mês é do CICLO, e agora tem caminho próprio.
              const { aprovarCalendarioDoCicloCorrente } = await import("@/lib/agency/esteira/publicacao");
              const r = await aprovarCalendarioDoCicloCorrente(projeto.id);
              if (r.agendados === 0 && r.motivo) {
                console.warn(`[portal/approvals] calendário do ciclo não agendou nada: ${r.motivo}`);
              }
            }
          }
        } catch (e) { console.error("[portal/approvals] aprovarPacote/ciclo error", e); }
      }
    }

    return NextResponse.json({
      id:         updated.id,
      status:     updated.status,
      reviewedAt: updated.reviewedAt,
      ...(projectId ? { projectId, executionStarted: true } : {}),
    });
  } catch (e) {
    console.error("[portal/approvals] POST error", e);
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
}
