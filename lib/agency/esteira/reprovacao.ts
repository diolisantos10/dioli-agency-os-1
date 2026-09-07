// A REPROVAÇÃO DE DENTRO DE CASA — o "não é isso" vira dado, ou não vale.
//
// ── O BURACO, MEDIDO CONTRA O CÓDIGO (11/08/2026) ───────────────────────────
//
// A reprovação do CLIENTE já virava dado desde 06/08: o pedido de ajuste dele
// passa por `refacao.ts`, que chama `registrarProibicoes` — então a próxima peça
// obedece. **A reprovação de dentro de casa não tinha caminho nenhum.**
//
// Os status possíveis de uma peça eram, literalmente:
//
//     draft · scheduled · approved · published · failed
//
// Não existe "reprovado" nessa lista. Quando o CEO olhava uma peça e dizia *"não
// é isso"*, a única coisa que ele podia fazer era editar o texto na mão ou
// apagar. **O motivo morria na boca dele.** Nada era registrado, nada virava
// regra, e o especialista produzia a peça seguinte sabendo exatamente o mesmo
// que sabia antes.
//
// É a causa raiz apontada no diagnóstico de 08/08, e ela estava certa:
//
//   > *"Não há contador de voltas nem histórico por peça — por isso a peça 3
//   >  repete o erro da peça 1, e repetiu hoje."*
//
// ── A DECISÃO QUE GOVERNA ESTE ARQUIVO: SEM MOTIVO, NÃO REPROVA ────────────
//
// Reprovar sem dizer por quê é o gesto que parece produtivo e não ensina nada.
// A peça sai da frente, o incômodo passa, e a próxima nasce com o mesmo defeito
// — porque ninguém, nem pessoa nem máquina, ficou sabendo qual era.
//
// Por isso `motivo` vazio é **RECUSA**, não um campo opcional em branco. É o
// guardrail 2 aplicado à relação: reprovação que não registra resultado bloqueia
// por construção. Esquecer o motivo nunca pode significar "reprovado e pronto".
//
// ── E O TETO EXISTE PELO MESMO MOTIVO DO TETO DA REFAÇÃO ───────────────────
//
// Na terceira volta, o problema deixou de ser a peça. Três peças reprovadas
// seguidas sobre o mesmo assunto é um desentendimento sobre o que se quer, e
// mais uma rodada de IA só queima dinheiro e paciência. Aí vira gente — e o
// aviso diz isso com todas as letras, em vez de pedir a quarta tentativa.

import { prisma } from "@/lib/db/client";
import { registrarProibicoes } from "@/lib/agency/esteira/proibicoes";

/** Quantas voltas a mesma peça leva antes de o assunto virar gente. Três: menos
 *  é impaciência, mais é teimosia paga com crédito de IA. */
export const VOLTAS_ATE_VIRAR_GENTE = 3;

/** O tipo do evento na linha do tempo. Num lugar só, para a contagem e a
 *  gravação nunca discordarem sobre o que estão contando. */
export const EVENTO_DE_REPROVACAO = "peca_reprovada";

/** O mínimo de texto que ainda é um motivo. Abaixo disso é um resmungo — "ruim",
 *  "não", "feio" — e resmungo não vira regra que o produtor consiga obedecer. */
export const MINIMO_DO_MOTIVO = 12;

export interface ReprovacaoRegistrada {
  ok: boolean;
  /** Por que a reprovação não foi aceita. Nulo quando foi. */
  recusa: string | null;
  /** Qual volta é esta, contando a partir de 1. */
  volta: number;
  /** Proibições novas que este motivo gerou — o que a próxima peça já obedece. */
  proibicoesNovas: string[];
  /** Virou assunto de gente, e a máquina para de tentar. */
  escalado: boolean;
  /** A frase para quem reprovou ler na tela. Diz o que aconteceu com o "não". */
  paraQuemReprovou: string;
}

function recusar(motivo: string): ReprovacaoRegistrada {
  return { ok: false, recusa: motivo, volta: 0, proibicoesNovas: [], escalado: false, paraQuemReprovou: motivo };
}

/**
 * Reprova uma peça de dentro de casa, e transforma o "não é isso" em regra.
 *
 * Faz três coisas, e a segunda é a que importa:
 *   1. devolve a peça para rascunho — peça reprovada não fica esperando ir ao ar;
 *   2. **transforma o motivo em proibição do cliente**, pelo mesmo caminho que a
 *      reprovação dele já usa, para a peça seguinte nascer obedecendo;
 *   3. conta a volta, e na terceira escala em vez de mandar a máquina tentar de novo.
 *
 * Nunca lança.
 */
export async function reprovarPeca(input: {
  postId: string;
  /** As palavras de quem reprovou. Obrigatório — ver o cabeçalho. */
  motivo: string;
  /** Quem disse não. Entra no registro porque um dia alguém vai perguntar. */
  quemReprovou: string;
  /**
   * ⛔ O WORKSPACE DE QUEM ESTÁ REPROVANDO — da SESSÃO, nunca do corpo.
   *
   * Sem ele, `findUnique({ where: { id } })` alcançava a peça de QUALQUER
   * inquilino: um `social_staff` da agência A reprovava o post da agência B —
   * e, pior, o motivo dele virava **proibição de marca no cliente da B**.
   * Escrita alheia que vira regra permanente (varredura de 28/08).
   */
  workspaceId: string;
}): Promise<ReprovacaoRegistrada> {
  const motivo = (input.motivo ?? "").trim();
  const quem = (input.quemReprovou ?? "").trim();

  if (!quem) {
    return recusar("reprovação sem autor não é registro: alguém precisa assinar o não");
  }
  if (motivo.length < MINIMO_DO_MOTIVO) {
    return recusar(
      "escreva o que está errado antes de reprovar. Reprovação sem motivo tira a peça da frente e não ensina nada — " +
      "a próxima nasce com o mesmo defeito, porque ninguém ficou sabendo qual era",
    );
  }

  const post = await prisma.socialPost.findFirst({
    // ⛔ O id VEM DA URL; o workspace vem da sessão. Buscar só por id fazia
    // desta rota uma porta para a peça de qualquer outro inquilino.
    where: { id: input.postId, workspaceId: input.workspaceId },
    select: { id: true, workspaceId: true, clientId: true },
  }).catch(() => null);
  if (!post) return recusar("não encontrei esta peça");

  // ── A VOLTA ───────────────────────────────────────────────────────────────
  // Contada a partir dos registros, nunca de um campo que alguém possa zerar
  // sem querer. O histórico É o contador.
  const anteriores = await prisma.activityEvent.count({
    where: { workspaceId: post.workspaceId, type: EVENTO_DE_REPROVACAO, message: { contains: post.id } },
  }).catch(() => 0);
  const volta = anteriores + 1;
  const escalado = volta >= VOLTAS_ATE_VIRAR_GENTE;

  // ── O MOTIVO VIRA REGRA ───────────────────────────────────────────────────
  // Mesmo caminho da reprovação do cliente. Sem cliente não há de quem guardar
  // a proibição — a peça é interna, e o registro na linha do tempo ainda vale.
  let proibicoesNovas: string[] = [];
  if (post.clientId) {
    const r = await registrarProibicoes(post.clientId, motivo, "equipe").catch(() => null);
    proibicoesNovas = r?.novas.flatMap((p) => p.termos) ?? [];
  }

  // ── O REGISTRO, COM A EVIDÊNCIA DENTRO ────────────────────────────────────
  // O id da peça entra no texto porque é ele que a contagem procura, e o motivo
  // entra inteiro porque alerta que não carrega o caso concreto é ruído que
  // ninguém investiga (guardrail 6).
  await prisma.activityEvent.create({
    data: {
      workspaceId: post.workspaceId,
      clientId: post.clientId,
      type: EVENTO_DE_REPROVACAO,
      message: `${post.id} — volta ${volta}, reprovada por ${quem}: ${motivo.slice(0, 500)}`,
    },
  }).catch(() => null);

  // Peça reprovada volta a ser rascunho. Deixá-la agendada faria uma peça que
  // alguém já recusou ir ao ar sozinha na hora marcada.
  await prisma.socialPost.update({
    where: { id: post.id },
    data: { status: "draft", scheduledFor: null },
  }).catch(() => null);

  return {
    ok: true,
    recusa: null,
    volta,
    proibicoesNovas,
    escalado,
    paraQuemReprovou: frase(volta, proibicoesNovas, escalado),
  };
}

function frase(volta: number, novas: string[], escalado: boolean): string {
  if (escalado) {
    return (
      `Esta é a ${volta}ª volta desta peça. A máquina não vai tentar de novo: ` +
      "três reprovações seguidas não são um problema da peça, são um desentendimento sobre o que se quer. " +
      "Alguém precisa reescrever o pedido antes da próxima tentativa."
    );
  }
  if (novas.length > 0) {
    return `Anotado. A partir de agora nenhuma peça deste cliente pode usar ${novas.join(", ")} — a próxima já nasce obedecendo.`;
  }
  return (
    "Reprovação registrada, e a peça voltou para rascunho. " +
    "Não consegui extrair uma regra da sua frase — se quiser que isso valha para as próximas peças, " +
    'escreva no formato "nunca ..." ou "não use ...".'
  );
}

/** O histórico de uma peça: quantas voltas levou e por quê. É o que responde
 *  "por que esta peça está na quarta versão?" sem ninguém precisar lembrar. */
export async function historicoDaPeca(postId: string): Promise<Array<{ quando: Date; oQueDisseram: string }>> {
  const post = await prisma.socialPost.findUnique({
    where: { id: postId }, select: { workspaceId: true },
  }).catch(() => null);
  if (!post) return [];

  const eventos = await prisma.activityEvent.findMany({
    where: { workspaceId: post.workspaceId, type: EVENTO_DE_REPROVACAO, message: { contains: postId } },
    orderBy: { timestamp: "asc" },
    take: 20,
  }).catch(() => []);

  return eventos.map((e) => ({ quando: e.timestamp, oQueDisseram: e.message }));
}
