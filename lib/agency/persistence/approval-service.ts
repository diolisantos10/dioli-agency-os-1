import { prisma } from "@/lib/db/client";
// ── A GRAMÁTICA DE `reviewedBy` É TRAVA, NÃO CONVENÇÃO (15/08/2026) ──────────
// Este arquivo tem os DOIS pontos por onde uma decisão vira linha no banco
// (`updateApprovalStatus` e `decidirIrmaosGenericos`). Conferir aqui é o que
// impede que a próxima rota escrita amanhã invente uma terceira grafia — ou
// repita o `"cliente"` seco que mentia dos dois lados. Prompt é aviso; código é
// trava (guardrail 4).
import { exigirCarimbo } from "@/lib/agency/esteira/autoria-da-aprovacao";
// ── E A MESMA IDEIA PARA O CONTEÚDO (15/08/2026) ────────────────────────────
// `reviewNote` com `clientVisible: true` é a tela do cliente. Em 15/08 ela
// chegou a mostrar o custo em dólar de cada agente da casa — a margem da agência
// na tela de quem compra. A régua está no caminho de escrita, e não num aviso:
// quem precisa do rastro técnico grava do lado da equipe (`addApprovalComment`
// com `isClientVisible: false`). Ver `esteira/vazamento-ao-cliente.ts`.
import { exigirTextoLimpo } from "@/lib/agency/esteira/vazamento-ao-cliente";

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "revision_requested"
  | "rejected"
  | "cancelled";

export interface CreateApprovalRequestInput {
  /** A solicitação (fluxo Brain). Opcional desde 04/08/2026: cliente criado
   *  DIRETO não tem ClientRequestDb — a posse passa a ser este campo OU
   *  `clientId`. Pelo menos um é obrigatório. */
  clientRequestId?: string;
  /** O dono quando não há solicitação (cliente direto — caso Foocci). */
  clientId?: string;
  department: string;
  artifactId?: string;
  requestedBy?: string;
  clientVisible?: boolean;
  expiresAt?: Date;
  /** O corpo do card como o portal renderiza: "Título\n\nconteúdo". */
  reviewNote?: string;
  /** Posts do calendário que este card decide — marca a ORIGEM calendário e é
   *  o que a decisão do cliente propaga (aprovar/ajustar). */
  sourcePostIds?: string[];
}

export interface AddCommentInput {
  approvalRequestId: string;
  authorName: string;
  authorRole?: "internal" | "client";
  /** "comment" (default) · "question" (dúvida do cliente, presa ao card) ·
   *  "answer" (resposta da agência à dúvida). */
  kind?: "comment" | "question" | "answer";
  body: string;
  isClientVisible?: boolean;
}

/**
 * Uma DECISÃO por departamento, não uma por especialista.
 *
 * ── Por que isto existe (CEO, 07/08/2026) ─────────────────────────────────
 * O motor de produção (`run-execution`) chama `createApprovalRequest` uma vez
 * **por especialista**, sempre com `department: dept.id`. Social Media tem três
 * especialistas (Pauta do mês · Copy dos posts · Roteiros) — então nasciam TRÊS
 * `ApprovalRequest` com o mesmo departamento, sem `reviewNote` própria, sem
 * versão vinculada e sem posts. No portal os três liam o MESMO corpo (o
 * `deliverableContentFor` do departamento) e apareciam como
 * "Pauta do Mês — <negócio>" três vezes.
 *
 * E não eram três decisões: `refazerPorPedidoDoCliente` e `aprovarPacote` agem
 * **por departamento**. Decidir um card já decidia o assunto inteiro — os
 * outros dois eram o mesmo clique pedido de novo. O cliente olhava a tela e não
 * sabia se já tinha decidido, que é exatamente o que o CEO reclamou.
 *
 * A trava é aqui, na escrita: card genérico (sem nota, sem versão, sem posts)
 * de um departamento que JÁ tem card pendente não vira registro novo — reusa o
 * que existe. Card com conteúdo próprio (proposta, calendário, versão) continua
 * criando normalmente: aquilo sim é uma decisão distinta.
 */
async function cardGenericoJaPendente(input: CreateApprovalRequestInput) {
  const temConteudoProprio =
    !!input.reviewNote?.trim() || (input.sourcePostIds?.length ?? 0) > 0 || !!input.artifactId;
  if (temConteudoProprio) return null;
  const dono = input.clientRequestId
    ? { clientRequestId: input.clientRequestId }
    : { clientId: input.clientId! };
  return prisma.approvalRequest.findFirst({
    where: {
      ...dono,
      department: input.department,
      status: "pending",
      reviewNote: null,
      deliverableVersionId: null,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createApprovalRequest(input: CreateApprovalRequestInput) {
  // Aprovação sem dono é card órfão: ninguém consegue vê-lo nem decidi-lo.
  // Falhar aqui, alto, é melhor do que gravar um registro invisível.
  if (!input.clientRequestId && !input.clientId) {
    throw new Error("createApprovalRequest: informe clientRequestId ou clientId — aprovação precisa de dono");
  }
  // Card que o cliente abre não carrega custo da casa, id de banco nem slug de
  // agente. LANÇA em vez de gravar: um 500 que alguém vê no mesmo minuto é
  // melhor que a margem da agência exposta em silêncio.
  if (input.clientVisible) exigirTextoLimpo("ApprovalRequest.reviewNote", input.reviewNote);
  const jaExiste = await cardGenericoJaPendente(input);
  if (jaExiste) return jaExiste;
  return prisma.approvalRequest.create({
    data: {
      clientRequestId: input.clientRequestId ?? null,
      clientId:        input.clientId ?? null,
      department:      input.department,
      artifactId:      input.artifactId,
      requestedBy:     input.requestedBy  ?? "internal",
      clientVisible:   input.clientVisible ?? false,
      expiresAt:       input.expiresAt,
      reviewNote:      input.reviewNote,
      sourcePostIdsJson: JSON.stringify(input.sourcePostIds ?? []),
      status:          "pending",
    },
  });
}

/** Um card é GENÉRICO quando nada nele o distingue dos outros do mesmo
 *  departamento: sem nota própria, sem versão vinculada, sem posts de
 *  calendário. Dois cards genéricos do mesmo departamento não são duas
 *  decisões — são a mesma decisão duplicada pelo motor de produção. */
export function cardGenerico(ap: {
  reviewNote: string | null;
  deliverableVersionId: string | null;
  sourcePostIdsJson: string | null;
}): boolean {
  let posts: unknown = [];
  try { posts = JSON.parse(ap.sourcePostIdsJson ?? "[]"); } catch { posts = []; }
  return !ap.reviewNote?.trim()
    && !ap.deliverableVersionId
    && (!Array.isArray(posts) || posts.length === 0);
}

/**
 * A decisão de um card genérico vale para os IRMÃOS genéricos do mesmo
 * departamento — porque os efeitos (`refazerPorPedidoDoCliente`,
 * `aprovarPacote`) já agem por departamento, nunca por card.
 *
 * Sem isto, esconder a duplicata na tela deixaria irmãos "pending" no banco
 * para sempre: `restantes === 0` nunca aconteceria e o pacote nunca abriria a
 * operação contínua. Esconder sem fechar seria trocar um bug visível por um
 * invisível.
 */
export async function decidirIrmaosGenericos(input: {
  id: string;
  clientRequestId: string | null;
  clientId: string | null;
  department: string;
  status: ApprovalStatus;
  reviewedBy: string;
}): Promise<number> {
  const dono = input.clientRequestId
    ? { clientRequestId: input.clientRequestId }
    : input.clientId
      ? { clientId: input.clientId }
      : null;
  if (!dono) return 0;
  const irmaos = await prisma.approvalRequest.findMany({
    where: {
      ...dono,
      department: input.department,
      status: "pending",
      id: { not: input.id },
    },
    select: { id: true, reviewNote: true, deliverableVersionId: true, sourcePostIdsJson: true },
  });
  const alvos = irmaos.filter(cardGenerico).map((a) => a.id);
  if (alvos.length === 0) return 0;
  // A duplicata fecha com o MESMO carimbo do card original — e passa pela mesma
  // régua. Sem isto, a grafia recusada entraria por esta porta lateral.
  const carimbo = input.status === "pending" ? null : exigirCarimbo(input.reviewedBy);
  const r = await prisma.approvalRequest.updateMany({
    where: { id: { in: alvos } },
    data: { status: input.status, reviewedBy: carimbo, reviewedAt: new Date() },
  });
  return r.count;
}

export async function updateApprovalStatus(
  id: string,
  status: ApprovalStatus,
  reviewedBy?: string,
  reviewNote?: string,
) {
  // ── QUEM DECIDIU, OU NÃO GRAVA ────────────────────────────────────────────
  // Só "pending" pode ficar sem autor — é o estado de card REABERTO, e ali a
  // ausência é a informação certa. Qualquer outro status é uma decisão, e
  // decisão sem autor não é decisão. `exigirCarimbo` LANÇA em vez de gravar em
  // silêncio: um caminho novo que esqueça a regra quebra alto.
  const carimbo = status === "pending" ? null : exigirCarimbo(reviewedBy);

  return prisma.approvalRequest.update({
    where: { id },
    data: {
      status,
      reviewedBy: carimbo,
      reviewedAt: new Date(),
      // Sem nota nova, a existente FICA: no card de calendário o reviewNote é o
      // corpo que o cliente leu — apagá-lo no "aprovar" deixaria a decisão
      // registrada sem dizer o que foi decidido.
      ...(reviewNote !== undefined ? { reviewNote } : {}),
    },
  });
}

export async function addApprovalComment(input: AddCommentInput) {
  // Mesma régua do corpo do card: comentário marcado como visível ao cliente é
  // tela do cliente. O rastro técnico entra como comentário INTERNO — que é o
  // caminho certo para ele, e continua existindo.
  if (input.isClientVisible) exigirTextoLimpo("ApprovalComment.body", input.body);

  const comment = await prisma.approvalComment.create({
    data: {
      approvalRequestId: input.approvalRequestId,
      authorName:        input.authorName,
      authorRole:        input.authorRole ?? "internal",
      kind:              input.kind ?? "comment",
      body:              input.body,
      isClientVisible:   input.isClientVisible ?? false,
    },
  });

  // ── DESPAUSA DO PRAZO (Fase 2, T5b) ──────────────────────────────────────
  // Dúvida aberta pausa o `expiresAt`: o relógio não corre contra o cliente
  // enquanto a bola está com a agência. Quando a agência responde no card
  // (comentário interno visível ao cliente), o tempo que ficou pausado é
  // DEVOLVIDO ao prazo — despausar sem devolver seria punir quem perguntou.
  if ((input.authorRole ?? "internal") !== "client" && (input.isClientVisible ?? false)) {
    const approval = await prisma.approvalRequest.findUnique({
      where: { id: input.approvalRequestId },
      select: { questionOpenedAt: true, expiresAt: true },
    });
    if (approval?.questionOpenedAt) {
      const pausadoMs = Date.now() - approval.questionOpenedAt.getTime();
      await prisma.approvalRequest.update({
        where: { id: input.approvalRequestId },
        data: {
          questionOpenedAt: null,
          ...(approval.expiresAt
            ? { expiresAt: new Date(approval.expiresAt.getTime() + Math.max(0, pausadoMs)) }
            : {}),
        },
      });
    }
  }

  return comment;
}

export async function setApprovalVisibility(id: string, clientVisible: boolean) {
  // ABRIR um card ao cliente é o mesmo ato que criá-lo visível: o texto que ele
  // vai ler passa pela mesma régua. Sem isto, bastaria criar interno e abrir
  // depois para contornar a trava — porta lateral é a forma que todo guardrail
  // desta casa já foi burlado uma vez.
  //
  // ⚠️ Lacuna conhecida e declarada: `esteira/marcos.ts` e `esteira/mes.ts`
  // viram `clientVisible` por `prisma.approvalRequest.update` DIRETO, sem passar
  // por aqui. Aqueles caminhos abrem cards de pacote/calendário, cujo corpo é
  // montado por `cards-de-aprovacao.corpoDoCard` (sem custo e sem id por
  // construção) — por isso não são o buraco de hoje. Fechar a porta neles é
  // item próprio, não carona nesta correção.
  if (clientVisible) {
    const atual = await prisma.approvalRequest.findUnique({ where: { id }, select: { reviewNote: true } });
    exigirTextoLimpo("ApprovalRequest.reviewNote", atual?.reviewNote);
  }
  return prisma.approvalRequest.update({
    where: { id },
    data: { clientVisible },
  });
}

export async function getApprovalsForRequest(clientRequestId: string) {
  return prisma.approvalRequest.findMany({
    where: { clientRequestId },
    include: { comments: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLatestApproval(clientRequestId: string, department: string) {
  return prisma.approvalRequest.findFirst({
    where: { clientRequestId, department },
    orderBy: { createdAt: "desc" },
    include: { comments: true },
  });
}
