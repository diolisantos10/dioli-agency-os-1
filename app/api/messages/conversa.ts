// conversa.ts — a âncora da conversa cliente ↔ agência, num lugar só.
//
// ── O defeito que este arquivo fecha ─────────────────────────────────────────
// A thread era ancorada SÓ em `clientRequestId`, e o campo era obrigatório.
// Cliente criado direto pela agência (`/api/clients`) nunca tem
// `ClientRequestDb` — é o caso da Foocci. Resultado no dia do lançamento: o CEO
// abriu o portal, escreveu, e a rota devolveu 404 "No conversation thread for
// this token yet". A bolha sumia, o texto voltava para a caixa e a tela dizia
// "Não foi possível enviar. Tente novamente." — para sempre.
//
// ── A regra nova, em uma frase ───────────────────────────────────────────────
// A conversa pertence ao CLIENTE, não à solicitação.
//
// Por isso a ESCRITA carimba as duas chaves quando ambas são deriváveis — é o
// que mantém o histórico junto quando o cliente direto ganha uma solicitação
// depois. A LEITURA, porém, não é mais a união das duas: ver o cabeçalho de
// `montarFiltro`, abaixo, para o porquê (furo 1, 07/08→15/08/2026) — a união
// deixava vazar, para o dono NOVO de uma solicitação re-apontada, a conversa
// do dono ANTIGO, sempre que a mensagem antiga não tinha `clientId` carimbado.
//
// ── A trava de isolamento ────────────────────────────────────────────────────
// Nenhuma chave deste filtro vem do cliente. `clientId` deriva do token (regra
// da casa, 03/08/2026: derivação, nunca comparação) ou da sessão + posse de
// workspace. `{ clientId: null }` NUNCA entra no filtro como chave solta —
// casaria com toda mensagem órfã do banco. Só entra como EXIGÊNCIA dentro de
// um `AND`, cercando o ramo do prospect (que ainda não tem dono nenhum).

import { prisma } from "@/lib/db/client";
import { validatePortalAccess } from "@/lib/agency/persistence/portal-access-service";

/** O filtro Prisma de uma conversa. Objeto simples de propósito: os testes
 *  mockam o prisma e comparam a forma. */
export type FiltroDaConversa =
  | { clientId: string }
  | { clientRequestId: { in: string[] } }
  /** Ramo do PROSPECT: só o que ainda não tem dono escrito. */
  | { AND: [{ clientRequestId: { in: string[] } }, { clientId: null }] };

export interface Conversa {
  /** O dono. Nulo só quando a conversa é de um PROSPECT (solicitação de
   *  briefing que ainda não virou cliente). */
  clientId: string | null;
  /** Todas as solicitações daquele cliente — o histórico que já existe. */
  clientRequestIds: string[];
  /** Onde uma mensagem NOVA deste lado é gravada. */
  ancora: { clientId: string | null; clientRequestId: string | null };
  /** O filtro de leitura. Nulo = não existe conversa nenhuma para ancorar. */
  filtro: FiltroDaConversa | null;
}

const VAZIA: Conversa = {
  clientId: null,
  clientRequestIds: [],
  ancora: { clientId: null, clientRequestId: null },
  filtro: null,
};

// ── FURO 1 (medido 07/08→15/08/2026, fechado aqui) ───────────────────────────
// Esta função unia as duas chaves (`OR: [{clientId}, {clientRequestId:{in}}]`)
// para não partir o histórico quando um cliente ganhava uma solicitação. Mas
// `ClientRequestDb.clientId` NÃO é imutável — `/api/admin/reset` zera o campo
// e a criação de projeto/aplicação de escopo RE-APONTA a mesma solicitação
// para um cliente novo. Mensagem antiga, gravada só com `clientRequestId` (o
// formato das escritas legadas, sem `clientId` carimbado), casava com a união
// pelo lado da solicitação — e o dono NOVO da solicitação lia a conversa do
// dono ANTIGO. Explorável com o token de portal do PRÓPRIO cliente.
//
// A regra da casa resolve isto: ausência de informação não é informação. Não
// se exclui o que se prova alheio — serve-se APENAS o que se prova próprio.
// Prova de pertencimento é UMA coisa: `clientId` escrito e igual ao dono.
// Linha sem esse carimbo não é servida a ninguém pelo portal — nem ao dono
// velho, nem ao novo. A união por `clientRequestId` morre de propósito.
function montarFiltro(clientId: string | null, requestIds: string[]): FiltroDaConversa | null {
  if (clientId) return { clientId };
  // Sem cliente identificado: só o ramo do PROSPECT — cercado, para não
  // devolver linha já carimbada com o `clientId` de um cliente de verdade.
  if (requestIds.length > 0) {
    return { AND: [{ clientRequestId: { in: requestIds } }, { clientId: null }] };
  }
  return null;
}

/** Monta a conversa de um cliente já identificado (dono derivado, nunca vindo
 *  de query/corpo em caminho público). */
export async function conversaDoCliente(
  clientId: string,
  solicitacaoPreferida?: string | null,
): Promise<Conversa> {
  const solicitacoes = await prisma.clientRequestDb.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  const ids = solicitacoes.map((s) => s.id);
  // A solicitação preferida (a que o token aponta) só vale se for DESTE cliente
  // — senão a âncora escreveria na conversa de outro.
  const ancoraRequest =
    solicitacaoPreferida && ids.includes(solicitacaoPreferida)
      ? solicitacaoPreferida
      : ids[0] ?? null;
  return {
    clientId,
    clientRequestIds: ids,
    ancora: { clientId, clientRequestId: ancoraRequest },
    filtro: montarFiltro(clientId, ids),
  };
}

/** Monta a conversa a partir de uma solicitação. Se ela já tem cliente, a
 *  conversa é a DO CLIENTE — a solicitação é só o ponto de entrada. */
export async function conversaDaSolicitacao(clientRequestId: string): Promise<Conversa> {
  const solicitacao = await prisma.clientRequestDb.findUnique({
    where: { id: clientRequestId },
    select: { id: true, clientId: true },
  });
  if (!solicitacao) return VAZIA;
  if (solicitacao.clientId) return conversaDoCliente(solicitacao.clientId, clientRequestId);
  // Prospect puro: ainda não é cliente. A conversa vive presa à solicitação —
  // e cercada: só o que AINDA não tem dono. Linha já carimbada com um
  // `clientId` pertence a um cliente de verdade e não pode voltar a aparecer
  // por uma porta de prospect (o caminho de volta do furo 1, quando a
  // solicitação é desvinculada por `/api/admin/reset`).
  return {
    clientId: null,
    clientRequestIds: [clientRequestId],
    ancora: { clientId: null, clientRequestId },
    filtro: { AND: [{ clientRequestId: { in: [clientRequestId] } }, { clientId: null }] },
  };
}

export type ResultadoDoToken =
  | { ok: true; conversa: Conversa }
  | { ok: false; status: number; reason?: string };

/** Resolve a conversa a partir do token do portal — o ÚNICO caminho público. */
export async function conversaDoToken(token: string): Promise<ResultadoDoToken> {
  const acesso = await validatePortalAccess(token);
  if (!acesso.valid || !acesso.record) {
    return { ok: false, status: 403, reason: acesso.reason };
  }
  const registro = acesso.record;
  if (registro.clientId) {
    return { ok: true, conversa: await conversaDoCliente(registro.clientId, registro.clientRequestId) };
  }
  if (registro.clientRequestId) {
    return { ok: true, conversa: await conversaDaSolicitacao(registro.clientRequestId) };
  }
  // Token válido sem dono nenhum — não existe onde escrever. Não é erro do
  // cliente, é acesso mal emitido; quem trata é a agência.
  return { ok: true, conversa: VAZIA };
}

// Posse: "estar logado não é ser dono". A conferência vivia COPIADA aqui e
// já tinha divergido da original (esta reprovava a solicitação órfã sem
// cliente; a de `portal-data` a aprovava quando existe um workspace só) — duas
// políticas de segurança com o mesmo nome, e nada na tela dizendo qual valia.
// Agora as duas são a mesma, em `lib/auth/posse-de-workspace.ts`; o re-export
// existe para não quebrar quem já importava daqui.
export { clienteDoWorkspace, solicitacaoDoWorkspace } from "@/lib/auth/posse-de-workspace";
