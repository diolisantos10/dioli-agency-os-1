// link-do-portal-do-cliente.ts — O LINK QUE O AVISO CARREGA TEM DE ABRIR.
//
// ── PROVENIÊNCIA ────────────────────────────────────────────────────────────
// Este módulo veio do PR #159 (branch `claude/quadro-ceo-15-08`), praticamente
// literal — a leitura de token vivo, os dois caminhos de posse (`clientId` e
// `clientRequestId`), `baseDoPortal()` e o contrato `LinkDoPortal` são dele.
// **O que mudou aqui foi só o comentário de cabeçalho** (proveniência +
// divergência abaixo); nenhuma linha de lógica foi alterada. Não escreva um
// segundo módulo para isto — é o defeito de 16/08 (a mesma responsabilidade
// resolvida duas vezes, em conversas cegas uma à outra).
//
// ── O DEFEITO, MEDIDO CONTRA O CÓDIGO EM 15/08/2026 ─────────────────────────
//
// `avisos.ts` montava o link do portal assim:
//
//     select: { phone: true, portalToken: true }          // Client.portalToken
//     return `${base}/portal/access/${portalToken}`
//
// E TODA porta do portal resolve o token pelo OUTRO lado:
//
//     prisma.portalAccess.findUnique({ where: { token } })
//     // portal-access-service.ts:46 (validatePortalAccess)
//     // → resolvePortalClient → /api/portal/vista, /api/media, /api/portal/*
//
// `Client.portalToken` e `PortalAccess.token` são **duas colunas de duas
// tabelas diferentes**, geradas independentemente (`@default(cuid())` numa,
// `randomBytes(32)` na outra). Nada no repositório copia uma na outra —
// `createPortalAccess` e `levantarLinksDoPortal` sorteiam token novo, e nenhuma
// consulta do repositório procura `client.findUnique({ where: { portalToken } })`.
//
// **Consequência:** todo aviso que a esteira mandou ao cliente carregava um link
// que responde **403 "Acesso negado"**. O aviso saía, o registro ficava de
// comprovante, o painel dizia "enviado" — e o cliente clicava num link morto.
//
// ── A REGRA QUE ESTE MÓDULO CARREGA ────────────────────────────────────────
//
// 1. **Uma leitura, não duas.** Quem precisa do link do portal de um cliente
//    chama aqui. Duas montagens do mesmo link divergem, e foi assim que a que
//    diverge ficou meses apontando para lugar nenhum.
//
// 2. **NÃO EMITE NADA.** Este módulo lê token vivo e só. Emitir credencial de
//    acesso por efeito colateral de "montar um aviso" é como credencial vaza —
//    a mesma decisão declarada em `links-do-portal.ts`. Cliente sem token vivo
//    volta com `link: null` e o MOTIVO escrito.
//
// ── ⚠️ ONDE ESTE MÓDULO DIVERGE DO #159 — POR ORDEM DO DIRETOR, 29/08/2026 ──
//
// A decisão 3 original do #159 era: *"sem link, o aviso não some — ele vai sem
// link e diz por quê"* (ou seja: tenta WhatsApp/e-mail com o texto puro,
// registra `status: "enviado"` se algum canal aceitar o texto sem endereço).
//
// **O Diretor substituiu essa decisão em 29/08/2026:** *"se não existir
// `PortalAccess` vivo para aquele cliente, não envie o aviso e não grave
// 'enviado'. Registre a falta como falta."* Quem aplica isso é `avisos.ts`
// (`avisarCliente`), não este arquivo — este só lê e informa; a trava
// fail-closed mora em quem decide se envia.
//
// Isso NÃO é silêncio: a fila manual já existe e tem tela. `ClientNotice`
// com `status: "pendente"` é lido por `filaDeAvisos` (`avisos.ts`), servido por
// `app/api/avisos/route.ts`, consumido por `components/agency/FilaDeAvisos.tsx`
// e montado no painel em `app/agency/dashboard/operacao/page.tsx`. A falta cai
// onde gente olha — ela só não sai mascarada de "enviado".
//
// Por que a ordem do Diretor vence: mandar o texto sem endereço faz o cliente
// ler "veja no portal" sem link nenhum — pior que não mandar, porque parece
// instrução incompleta da agência, não falta de credencial. E gravar
// `status: "enviado"` sem link é o MESMO comprovante-de-entrega-de-coisa-não-
// entregue que o defeito original produzia, só que com o texto certo e o
// endereço ausente. Divergência silenciosa entre dois PRs é como uma regra
// morre — por isso ela está escrita aqui, com a razão.

import { prisma } from "@/lib/db/client";
import { HOST_PADRAO, tokenVivo } from "@/lib/agency/esteira/links-do-portal";

export interface LinkDoPortal {
  /** O endereço que ABRE. Nulo sempre que não há token vivo — nunca inferido. */
  link: string | null;
  /** Em português. É o que aparece no lugar do link. */
  motivo: string;
  /** O token usado, para perícia. Nunca vai para tela de cliente. */
  token: string | null;
}

/** A base do link. O host próprio é o que funciona ponta a ponta (é o único
 *  registrado como redirect no Google); o do ambiente vence quando existe,
 *  porque em pré-produção o host próprio apontaria o cliente para a produção. */
export function baseDoPortal(): string {
  const doAmbiente = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "").trim();
  return (doAmbiente || HOST_PADRAO).replace(/\/+$/, "");
}

/**
 * O link de portal VIVO deste cliente.
 *
 * Procura nos dois caminhos de posse que o `PortalAccess` admite — `clientId`
 * direto e via `clientRequestId` —, porque o cliente que nasceu de uma
 * solicitação tem o acesso preso à solicitação, e ler só um dos dois deixaria
 * metade dos clientes sem link com cara de "nunca teve portal".
 *
 * Nunca lança: um banco fora do ar não pode derrubar o aviso que o originou.
 */
export async function linkVivoDoPortal(
  clientId: string,
  agora: Date = new Date(),
): Promise<LinkDoPortal> {
  if (!clientId?.trim()) {
    return { link: null, motivo: "sem cliente não há portal", token: null };
  }
  try {
    const solicitacoes = await prisma.clientRequestDb.findMany({
      where: { clientId },
      select: { id: true },
      take: 50,
    }).catch(() => [] as Array<{ id: string }>);

    const acessos = await prisma.portalAccess.findMany({
      where: {
        OR: [
          { clientId },
          ...(solicitacoes.length > 0
            ? [{ clientRequestId: { in: solicitacoes.map((s) => s.id) } }]
            : []),
        ],
      },
      orderBy: { grantedAt: "desc" },
      take: 50,
    });

    const bom = acessos.find((a) => tokenVivo(a, agora));
    if (!bom) {
      return {
        link: null,
        token: null,
        motivo: acessos.length === 0
          ? "este cliente nunca teve token de portal — nada foi emitido aqui, porque emitir credencial é ato explícito"
          : "todos os tokens de portal deste cliente estão revogados ou vencidos — nada foi emitido aqui",
      };
    }

    return {
      link: `${baseDoPortal()}/portal/access/${bom.token}`,
      token: bom.token,
      motivo: "token de portal vivo, reaproveitado — nada foi gravado",
    };
  } catch (e) {
    // Falha de leitura NUNCA vira "não tem portal": as duas coisas são opostas,
    // e confundi-las faria a fila mandar cliente com portal para o cadastro.
    return {
      link: null,
      token: null,
      motivo: `não consegui ler o portal deste cliente: ${e instanceof Error ? e.message.slice(0, 120) : "erro"}`,
    };
  }
}
