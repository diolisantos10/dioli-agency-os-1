// A RÉGUA DE RECOMPRA — o que a casa faz quando o cliente do balcão some.
//
// ── O buraco ────────────────────────────────────────────────────────────────
// Alguém compra um carrossel de R$ 129, recebe a peça, e acabou. **Hoje nada
// acontece.** Não existe segundo contato, não existe lembrete, não existe fila
// — o cliente que a casa gastou aquisição para conquistar sai pela porta e
// ninguém percebe. A régua é o mecanismo que reabre a conversa em 30, 60 e 90
// dias, e depois PARA.
//
// ── AS CINCO TRAVAS, e por que cada uma existe ──────────────────────────────
//
// 1. ANCORAGEM. A mensagem só fala de coisa que está no banco. "Faz 30 dias do
//    seu carrossel" exige (a) o item comprado, lido do pedido pago, e (b) uma
//    peça `visibility: "compartilhado"` — a prova de que ele RECEBEU. Sem os
//    dois, o toque não sai. Zero inferência sobre o negócio dele: a régua não
//    sabe se ele vende bolo ou consórcio, e não finge saber.
//
// 2. IDEMPOTÊNCIA NO BANCO, não em memória. O `ClientNotice` do toque nasce com
//    um **id determinístico** (`recompra-<marco>-<hash>`). Rodar o cron duas
//    vezes é uma violação de chave primária, capturada e tratada como no-op.
//    Mesmo molde de `balcao/producao.ts`: a trava é a linha que já existe.
//
// 3. FAIL-CLOSED NO CANAL E NO CONSENTIMENTO. **A régua não dispara WhatsApp.**
//    Não é limitação técnica, é a trava de plataforma:
//      • a política da Meta exige opt-in explícito do destinatário antes de
//        qualquer contato (`docs/plataformas/meta/fontes/whatsapp-politica-de-
//        mensagens.md`, §1 "You may only contact people on WhatsApp if…"), e
//        esta casa NÃO tem onde registrar esse opt-in — não existe coluna, logo
//        não existe prova, logo não existe autorização;
//      • fora da janela de 24h só sai Modelo aprovado (mesma fonte, §2 · e
//        `whatsapp-modelos.md`), e um toque de 30 dias está sempre fora da
//        janela por definição. A casa não tem template de marketing aprovado.
//    Sem parecer do especialista `meta` e sem template, a régua **gera rascunho
//    para a equipe aprovar e disparar** — e grava o motivo por escrito.
//
// 4. PREÇO SÓ COM DUAS TABELAS DE ACORDO. O valor citado tem de existir no
//    catálogo (`SELF_SERVE_CATALOG`) **e** ser autorizado por
//    `comercial/negociacao.ts` (`podeFechar`). Discordou, ou o item não está na
//    tabela de piso? A mensagem sai **sem número**. E a régua não dá desconto
//    nenhum, em marco nenhum — desconto automático é leilão com o próprio
//    preço.
//
// 5. VOLUME SÓ DA FONTE, NUNCA REDIGITADO. Até 29/08/2026 o texto do marco 60
//    escrevia "8 peças por mês" à mão — resíduo do tempo em que o item do
//    balcão tinha volume PRÓPRIO, antes de virar o Ritmo
//    (`self-serve-catalog.ts:175`). A fonte (`planos.ts`) já dizia 12: o
//    cliente recebia, por cron diário e sem revisão humana, uma oferta 4
//    peças menor do que a casa realmente vende. E o teste que deveria
//    proteger isso EXIGIA literalmente o número errado
//    (`__tests__/esteira/recompra.test.ts:132`, antes desta correção) — teste
//    verde sobre número errado é pior que teste nenhum, porque dá confiança
//    falsa. `planoDoDegrau()` lê `PLANOS` em tempo de chamada, nunca no topo
//    do módulo, e `numerosDePecasNaoAncorados` varre o texto final: todo
//    número de peça citado tem de vir de um valor que o código REALMENTE
//    derivou da fonte (`pecasPorMes` do plano, ou `a.compras`). Sobrou algum
//    que não veio de lá? O toque fica de fora — fail-closed, igual à trava de
//    promessa.
//
// ── O QUE ESTE ARQUIVO NÃO FAZ ──────────────────────────────────────────────
// Não chama IA. Nenhuma linha de texto que chega ao cliente é gerada por
// modelo: são moldes fixos com lacunas preenchidas por dado do banco. Num toque
// de recompra, o que o modelo acrescentaria é exatamente o que não pode existir
// — promessa de resultado e fato inventado sobre o negócio do cliente.
//
// ── NENHUM ESTADO NOVO, DE PROPÓSITO ────────────────────────────────────────
// A régua não inventa status. Ela escreve num `ClientNotice` `pendente`, que é
// o que `GET /api/avisos` já lista (`esteira/avisos.ts:146`), e numa
// `PortalMessage`, que é o que a conversa do portal já mostra. Estado sem tela
// é vazamento; aqui não nasce nenhum.

import { createHash } from "crypto";
import { prisma } from "@/lib/db/client";
import { SELF_SERVE_CATALOG } from "@/lib/agency/self-serve-catalog";
import { podeFechar, type ItemNegociavel } from "@/lib/agency/comercial/negociacao";
import { PLANOS, precoEmReais } from "@/lib/agency/planos";
import { avisarCliente } from "@/lib/agency/esteira/triagem";

const DIA_MS = 24 * 60 * 60 * 1000;

/** Os três toques. Depois do terceiro, a casa cala — cliente que não voltou em
 *  90 dias não volta por insistência, volta por vontade. */
export const MARCOS = [30, 60, 90] as const;
export type Marco = (typeof MARCOS)[number];

/**
 * A janela em que um marco ainda vale.
 *
 * Sem ela, ligar a régua num banco com histórico dispararia os três toques em
 * dias seguidos para clientes de um ano atrás — "faz 30 dias do seu carrossel"
 * dito sobre uma peça de 2025. Fora da janela o marco simplesmente não existe:
 * é função pura do tempo, não precisa de estado, e por isso não pode divergir.
 */
export const TOLERANCIA_DIAS = 15;

/** Teto por passada. O cron é rede de segurança, não fila de disparo em massa —
 *  e ritmo de máquina é como se perde acesso a plataforma. */
export const MAX_POR_PASSADA = 40;

// ─────────────────────────────────────────────────────────────────────────────
// 1. O marco devido — pura, testável, sem banco
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Qual toque é devido para quem recebeu a peça há `dias`.
 *
 * Devolve o MENOR marco cuja janela contém `dias`. Devolve `null` quando
 * nenhuma janela contém — inclusive no caso do cliente antigo demais, que é o
 * caso que a tolerância existe para barrar.
 */
export function marcoDevido(dias: number): Marco | null {
  if (typeof dias !== "number" || !Number.isFinite(dias)) return null;
  for (const m of MARCOS) {
    if (dias >= m && dias <= m + TOLERANCIA_DIAS) return m;
  }
  return null;
}

export function diasEntre(de: Date, ate: Date): number {
  return Math.floor((ate.getTime() - de.getTime()) / DIA_MS);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. O preço: as duas tabelas têm que concordar
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Item do catálogo → linha da tabela de piso do comercial.
 *
 * Deliberadamente PARCIAL. O que não está aqui (packs, reels, banner,
 * identidade, setup de anúncio) não tem piso declarado em `negociacao.ts`, e
 * item sem piso não é item barato: é item sem autorização de venda. Nesses
 * casos a régua fala do trabalho **sem citar número**.
 */
const ITEM_NEGOCIAVEL_DO_CATALOGO: Record<string, ItemNegociavel> = {
  "balcao-post-feed": "post",
  "balcao-carrossel-5": "carrossel",
  "balcao-4-stories": "stories",
  "balcao-legenda": "copy",
  "balcao-auditoria-perfil": "auditoria",
  "balcao-pacote-mes": "ritmo",
};

export interface PrecoAutorizado {
  /** `null` = a régua NÃO cita valor nenhum nesta mensagem. */
  valor: number | null;
  texto: string;
  motivo: string;
}

/**
 * O preço que a régua pode dizer. `null` sempre que houver qualquer dúvida.
 *
 * Exige as DUAS tabelas: o catálogo dá o número, e `podeFechar` do comercial
 * autoriza. Se o catálogo mudar de preço e o piso não acompanhar (ou o
 * contrário), o resultado é ausência de número — nunca o número errado saindo
 * para o cliente. Duas fontes que precisam concordar é o que transforma
 * "esqueceram de atualizar" em silêncio, e não em prejuízo.
 */
export function precoParaOferecer(itemDeCatalogo: string): PrecoAutorizado {
  const item = SELF_SERVE_CATALOG.find((s) => s.id === itemDeCatalogo);
  if (!item) {
    return { valor: null, texto: "", motivo: `"${itemDeCatalogo}" não está no catálogo` };
  }

  const negociavel = Object.hasOwn(ITEM_NEGOCIAVEL_DO_CATALOGO, itemDeCatalogo)
    ? ITEM_NEGOCIAVEL_DO_CATALOGO[itemDeCatalogo]
    : undefined;
  if (!negociavel) {
    return { valor: null, texto: "", motivo: `"${itemDeCatalogo}" não tem piso em negociacao.ts` };
  }

  // Preço CHEIO, sempre. A régua não desconta: um desconto que sai sozinho, sem
  // ninguém pedir, ensina a carteira inteira que o preço cheio era encenação.
  const veredicto = podeFechar(negociavel, item.price);
  if (!veredicto.pode) {
    return {
      valor: null,
      texto: "",
      motivo: `o comercial não autoriza ${precoEmReais(item.price)} para "${itemDeCatalogo}": ${veredicto.motivo}`,
    };
  }

  return { valor: item.price, texto: precoEmReais(item.price), motivo: "catálogo e piso concordam" };
}

export interface PlanoDoDegrau {
  /** `null` = a fonte não respondeu (plano ausente ou volume inválido); o
   *  toque NÃO cita plano nenhum. */
  pecasPorMes: number | null;
  precoTexto: string;
  valor: number | null;
  motivo: string;
}

/**
 * O plano do degrau (Ritmo), lido de `PLANOS` NO MOMENTO DA CHAMADA — nunca
 * congelado no topo do módulo, porque é essa leitura tardia que deixa provar,
 * em teste, que a mensagem acompanha a fonte quando a fonte muda.
 *
 * `pecasPorMes` só sai preenchido se vier da fonte como inteiro finito > 0.
 * Preço e volume são conferidos por caminhos independentes (o preço reaproveita
 * `precoParaOferecer`, que já exige as duas tabelas de acordo) — quem chama
 * decide se precisa das duas coisas ou só de uma.
 */
export function planoDoDegrau(): PlanoDoDegrau {
  const plano = PLANOS.find((p) => p.id === "ritmo");
  const preco = precoParaOferecer("balcao-pacote-mes");

  const pecas = plano?.pecasPorMes;
  const pecasValidas =
    typeof pecas === "number" && Number.isFinite(pecas) && Number.isInteger(pecas) && pecas > 0;

  const motivos: string[] = [];
  if (!plano) motivos.push('plano "ritmo" não está em PLANOS');
  else if (!pecasValidas) motivos.push(`pecasPorMes inválido no plano ritmo: ${String(pecas)}`);
  if (preco.valor === null) motivos.push(`preço não autorizado para "balcao-pacote-mes": ${preco.motivo}`);

  return {
    pecasPorMes: pecasValidas ? (pecas as number) : null,
    precoTexto: preco.texto,
    valor: preco.valor,
    motivo: motivos.length > 0 ? motivos.join("; ") : "fonte e piso concordam",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. A trava de linguagem — nada de promessa de resultado
// ─────────────────────────────────────────────────────────────────────────────
//
// Os moldes abaixo são fixos e revisados, então esta trava nunca deveria
// disparar. Ela existe porque o texto tem LACUNAS: nome do cliente, rótulo do
// item. O dia em que alguém cadastrar um serviço chamado "Pacote que dobra suas
// vendas", a promessa entra no molde limpo pela porta do dado. Trava, não aviso.

const PROMESSA_DE_RESULTADO =
  /\b(garant\w*|dobr\w+|tripl\w+|resultado\w*|retorno|roi|faturament\w*|lucr\w+|vend\w+ mais|mais vendas|crescimento garantid\w*|viraliz\w+|milhar\w* de seguidor\w*)\b/i;

export function temPromessaDeResultado(texto: string): boolean {
  return typeof texto === "string" && PROMESSA_DE_RESULTADO.test(texto);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3a. A trava de volume — nenhum número de peça sem dono na fonte
// ─────────────────────────────────────────────────────────────────────────────
//
// Mesmo molde da trava acima: o incidente que a fez existir é a mesma peça de
// texto onde a promessa se esconde. Aqui o dado é "8 peças por mês" — número
// digitado à mão que discordava da fonte (`planos.ts` dizia 12) e que o teste
// antigo EXIGIA literalmente (ver cabeçalho, trava 5). A trava varre o corpo
// final por "<número> peça(s)" e falha fechado se algum não vier de um valor
// que o código realmente leu do banco ou da tabela de planos.

const NUMERO_DE_PECAS = /\b(\d+)\s+peças?\b/gi;

export function numerosDePecasNaoAncorados(corpo: string, ancorados: number[]): number[] {
  if (typeof corpo !== "string") return [];
  const achados = new Set<number>();
  for (const m of corpo.matchAll(NUMERO_DE_PECAS)) {
    const n = Number(m[1]);
    if (Number.isFinite(n) && !ancorados.includes(n)) achados.add(n);
  }
  return [...achados];
}

/**
 * Os números de peça que já vêm DENTRO do rótulo do item.
 *
 * O rótulo (`SELF_SERVE_CATALOG[].label`) é texto DERIVADO do catálogo, que
 * deriva de `PLANOS` — `self-serve-catalog.ts:186` monta
 * `Pacote mês — ${RITMO.pecasPorMes} peças` a partir da fonte, nunca
 * redigitado à mão. Um número que chega ao corpo pela porta do rótulo já
 * passou pela fonte antes de chegar aqui; a trava de §3a chamava esse número
 * de invenção só porque a montagem de `ancorados`, em `registrarToque`, não
 * olhava para dentro do rótulo. Reaproveita o próprio `NUMERO_DE_PECAS`
 * porque é o mesmo padrão de texto ("<número> peça(s)") em outro lugar.
 *
 * A BORDA, com todas as letras: se um dia alguém cadastrar um item de
 * catálogo com o rótulo DIGITADO à mão (número que não veio de `PLANOS`),
 * esta função confia nele — ela só sabe ler o texto do rótulo, não sabe de
 * onde ele veio. Quem cobre essa borda é a régua do próprio catálogo
 * (garantir que todo `label` com contagem de peça seja montado a partir da
 * fonte, nunca escrito solto), não esta trava.
 */
export function numerosDePecasNoRotulo(label: string): number[] {
  if (typeof label !== "string") return [];
  const achados = new Set<number>();
  for (const m of label.matchAll(NUMERO_DE_PECAS)) {
    const n = Number(m[1]);
    if (Number.isFinite(n)) achados.add(n);
  }
  return [...achados];
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. A âncora — o que ele comprou e recebeu DE VERDADE
// ─────────────────────────────────────────────────────────────────────────────

export interface Ancora {
  clientId: string;
  workspaceId: string;
  projectId: string;
  clienteNome: string;
  email: string | null;
  telefone: string | null;
  /** Id de `SELF_SERVE_CATALOG`. Lido do pedido PAGO, nunca deduzido. */
  itemDeCatalogo: string;
  /** Como o catálogo chama o item. É isto que aparece na mensagem. */
  itemLabel: string;
  /** A peça que ele recebeu — `visibility: "compartilhado"` é a prova. */
  entregaId: string;
  entregueEm: Date;
  /** Quantas compras de balcão este cliente já fez. Contagem, não estimativa. */
  compras: number;
}

/** O `serviceId` mora dentro do `briefingJson` do pedido — mesmo caminho que
 *  `balcao/producao.ts` usa para produzir. Ler de outro lugar seria criar uma
 *  segunda verdade sobre o que a pessoa comprou. */
function serviceIdDoPedido(briefingJson: string | null): string {
  try {
    const b = JSON.parse(briefingJson ?? "{}") as Record<string, unknown>;
    return typeof b.serviceId === "string" ? b.serviceId : "";
  } catch {
    return "";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Os três textos
// ─────────────────────────────────────────────────────────────────────────────
//
// Escritos por extenso, um por marco, para serem lidos por gente antes de irem
// ao ar. Nenhum promete nada; todos convidam e nenhum cobra. O de 90 dias
// **avisa que é o último** — porque régua que não termina vira perseguição, e
// porque um cliente que pediu para não ser mais incomodado tem de ser atendido
// (política da Meta, §1) mesmo quando o pedido nunca foi feito.

/**
 * A frase de tempo de cada marco, indexada pelo PRÓPRIO tipo `Marco` — que é
 * derivado de `MARCOS`. Não é o número redigitado de novo: é a única outra
 * cópia que existe, e o compilador barra se `MARCOS` ganhar ou perder um
 * marco sem que esta tabela seja atualizada junto (`Record<Marco, string>`
 * exige uma entrada por membro do tipo). Antes desta correção cada frase
 * vivia solta dentro do `if` do marco — três lugares que podiam divergir de
 * `MARCOS` em silêncio, exatamente o defeito desta ficha.
 */
const FRASE_DO_MARCO: Record<Marco, string> = {
  30: "Faz 30 dias",
  60: "Faz dois meses",
  90: "Faz três meses",
};

export interface ToqueRedigido {
  corpo: string;
  /** O valor citado, quando existe. Serve para o teste e para a auditoria. */
  valorCitado: number | null;
  /**
   * O parecer da fonte sobre o plano do degrau. `null` quando o plano nem foi
   * consultado (marco diferente de 60, ou marco 60 com `compras < 2`) — não
   * confundir com "consultado e recusado", que é `PlanoDoDegrau` com
   * `pecasPorMes: null`. Serve para a auditoria e para montar `ancorados` na
   * trava de números de peça (§3a).
   */
  plano: PlanoDoDegrau | null;
}

export function redigirToque(marco: Marco, a: Ancora): ToqueRedigido {
  const primeiroNome = (a.clienteNome ?? "").trim().split(/\s+/)[0] || "Oi";
  const preco = precoParaOferecer(a.itemDeCatalogo);
  const comValor = preco.valor !== null ? ` por ${preco.texto}` : "";
  const faz = FRASE_DO_MARCO[marco];

  if (marco === 30) {
    return {
      valorCitado: preco.valor,
      plano: null,
      corpo:
        `Oi, ${primeiroNome}. ${faz} que entreguei seu ${a.itemLabel.toLowerCase()}. ` +
        `Se quiser outra peça do mesmo tipo, eu produzo${comValor} — é só me responder por aqui. ` +
        `E se o que você precisa agora for outra coisa, me conta o que é que eu te digo se a gente faz.`,
    };
  }

  if (marco === 60) {
    // O degrau do plano só é oferecido a quem JÁ comprou mais de uma vez. Dizer
    // "você compra sempre" para quem comprou uma vez é inventar um fato sobre o
    // cliente — e é o tipo de erro que a pessoa percebe na hora.
    const plano = a.compras >= 2 ? planoDoDegrau() : null;

    // A condição fica INTEIRA dentro do `if` (não extraída para uma variável
    // booleana à parte) de propósito: é o que deixa o TypeScript estreitar
    // `plano` para `PlanoDoDegrau` dentro do bloco — extrair para um booleano
    // solto perderia esse estreitamento e o compilador voltaria a tratar
    // `plano` como possivelmente nulo nas linhas abaixo.
    if (plano !== null && plano.pecasPorMes !== null && plano.valor !== null) {
      const valorPlano = ` (${plano.precoTexto} por mês)`;
      return {
        valorCitado: plano.valor,
        plano,
        corpo:
          `Oi, ${primeiroNome}. Já são ${a.compras} peças que você pediu avulsas aqui — a última foi seu ${a.itemLabel.toLowerCase()}. ` +
          `Existe o pacote do mês${valorPlano}: ${plano.pecasPorMes} peças por mês, você aprova pelo portal e publica quando quiser. ` +
          `Se quiser que eu te explique o que entra, é só responder.`,
      };
    }

    // FAIL-CLOSED: sem plano válido (fonte não tem `ritmo`, volume inválido, ou
    // preço não autorizado) o toque cai no texto genérico de 60 dias, que não
    // faz afirmação nenhuma sobre plano nenhum. Ausência de informação não é
    // informação — melhor não prometer do que redigitar um número.
    return {
      valorCitado: preco.valor,
      plano,
      corpo:
        `Oi, ${primeiroNome}. ${faz} do seu ${a.itemLabel.toLowerCase()}. ` +
        `Se aparecer outra peça para fazer, eu continuo aqui${comValor ? ` — a mesma peça sai${comValor}` : ""}. ` +
        `Me diz o que você precisa que eu te respondo.`,
    };
  }

  return {
    valorCitado: null,
    plano: null,
    corpo:
      `Oi, ${primeiroNome}. ${faz} do seu ${a.itemLabel.toLowerCase()}. ` +
      `Este é o último lembrete automático que eu te mando — não vou ficar te procurando. ` +
      `Quando precisar de outra peça, é só chamar por aqui que eu produzo. Obrigado por ter comprado com a gente.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. A idempotência — o id é a trava
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O id do `ClientNotice` deste toque. **Determinístico**: mesma âncora + mesmo
 * marco = mesmo id, hoje e daqui a um mês.
 *
 * A trava não é "consulta antes de criar" — essa perde a corrida entre duas
 * passadas simultâneas do cron. A trava é a CHAVE PRIMÁRIA: a segunda escrita
 * estoura P2002 e vira no-op. É a única forma de "o cliente recebe uma vez" que
 * continua verdadeira sob concorrência.
 *
 * O hash inclui a entrega âncora: se um dia o cliente comprar de novo e a
 * âncora mudar, o toque novo é outro toque — o que é o certo, porque é outra
 * peça e outra data.
 */
export function idDoToque(a: Pick<Ancora, "clientId" | "entregaId">, marco: Marco): string {
  const impressao = createHash("sha256")
    .update(`${a.clientId}|${a.entregaId}|${marco}`, "utf8")
    .digest("hex")
    .slice(0, 32);
  return `recompra-${marco}-${impressao}`;
}

function ehViolacaoDeUnicidade(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: string }).code === "P2002";
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Por que o toque NÃO sai sozinho — o parecer de plataforma, por escrito
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O motivo gravado em `ClientNotice.failReason`, que a equipe lê em
 * `/api/avisos`. Escrito com todas as letras porque a pessoa que for disparar
 * precisa saber que ela é a autorização, e não um atalho.
 */
export const MOTIVO_SEM_DISPARO_AUTOMATICO =
  "Rascunho para a equipe aprovar e disparar. A régua NÃO manda sozinha: " +
  "a política do WhatsApp exige opt-in registrado do destinatário (não temos onde registrar isso) e, " +
  "fora da janela de 24h, só sai Modelo de mensagem aprovado — que a casa ainda não tem. " +
  "Liberar o disparo automático depende de parecer do especialista `meta` + template de marketing aprovado.";

// ─────────────────────────────────────────────────────────────────────────────
// 8. O toque
// ─────────────────────────────────────────────────────────────────────────────

export type ResultadoDoToque =
  | { ok: true; marco: Marco; noticeId: string; jaExistia: boolean; corpo: string }
  | { ok: false; motivo: string };

/**
 * Registra UM toque para UMA âncora. Não envia nada por plataforma de terceiro.
 *
 * O que acontece, na ordem:
 *   1. redige o texto do molde e passa pela trava de promessa;
 *   2. cria o `ClientNotice` com id determinístico — é aqui que a idempotência
 *      mora, e é aqui que a segunda passada morre;
 *   3. só se o (2) foi uma criação de verdade, escreve na conversa do portal.
 *      Amarrado assim de propósito: um único ponto de idempotência para os dois
 *      efeitos. Se a mensagem do portal tivesse guarda própria, um dia as duas
 *      divergiriam e o cliente veria o toque duplicado num dos lados.
 */
export async function registrarToque(a: Ancora, marco: Marco): Promise<ResultadoDoToque> {
  const toque = redigirToque(marco, a);

  if (temPromessaDeResultado(toque.corpo)) {
    // Fail-closed: não sai nem como rascunho. Um rascunho com promessa de
    // resultado é justamente o que alguém apressado copia e cola.
    return {
      ok: false,
      motivo: `texto barrado pela trava de promessa de resultado (marco ${marco}, cliente ${a.clientId})`,
    };
  }

  // VOLUME: todo número de peça citado no corpo tem de vir de um valor que o
  // código REALMENTE derivou da fonte — o `pecasPorMes` do plano, quando o
  // texto o cita, e a contagem de `compras`. Sobrou algum número de peça que
  // não veio de nenhum dos dois? É texto redigitado à mão (o "8" do incidente
  // desta trava) e o toque fica de fora, fail-closed, mesmo molde da trava de
  // promessa acima.
  const ancorados = [
    a.compras,
    ...(toque.plano?.pecasPorMes != null ? [toque.plano.pecasPorMes] : []),
    // O rótulo do item vem do catálogo, e o catálogo deriva de `PLANOS` — não
    // é redigitado. Barrar o número que está DENTRO do rótulo é a trava
    // chamando a própria fonte de mentira (achado por execução: cliente do
    // `balcao-pacote-mes` perdia o toque de 30 dias porque "12" só aparecia
    // pela porta de `a.itemLabel`, e no marco 30 não há `plano` para ancorá-lo
    // por outro caminho). BORDA: se um dia um `label` de catálogo for
    // digitado à mão com número errado, esta trava confia nele — quem cobre
    // isso é a régua do catálogo, não esta.
    ...numerosDePecasNoRotulo(a.itemLabel),
  ];
  const naoAncorados = numerosDePecasNaoAncorados(toque.corpo, ancorados);
  if (naoAncorados.length > 0) {
    return {
      ok: false,
      motivo:
        `texto barrado pela trava de números de peça não ancorados na fonte ` +
        `(${naoAncorados.join(", ")}) — marco ${marco}, cliente ${a.clientId}`,
    };
  }

  // CANAL: sem e-mail e sem telefone não existe para quem mandar. O toque entra
  // na fila mesmo assim — com o motivo — porque o problema é de CADASTRO e
  // alguém tem de vê-lo. Sumir em silêncio é o comportamento que a régua veio
  // corrigir, não repetir.
  const semCanal = !a.email?.trim() && !a.telefone?.trim();
  const motivo = semCanal
    ? `Cliente sem e-mail e sem telefone no cadastro — não há canal para entregar este toque. ${MOTIVO_SEM_DISPARO_AUTOMATICO}`
    : MOTIVO_SEM_DISPARO_AUTOMATICO;

  const id = idDoToque(a, marco);

  try {
    await prisma.clientNotice.create({
      data: {
        id,
        workspaceId: a.workspaceId,
        clientId: a.clientId,
        projectId: a.projectId,
        kind: "recompra",
        body: toque.corpo,
        link: null,
        // "pendente" é o que `filaDeAvisos` lista. Nenhum status novo nasce aqui.
        status: "pendente",
        channel: "nenhum",
        failReason: motivo.slice(0, 600),
      },
    });
  } catch (e) {
    if (ehViolacaoDeUnicidade(e)) {
      // Cron rodou duas vezes. É o caso NORMAL, não erro.
      return { ok: true, marco, noticeId: id, jaExistia: true, corpo: toque.corpo };
    }
    return { ok: false, motivo: e instanceof Error ? e.message.slice(0, 200) : "falha ao registrar o toque" };
  }

  // A conversa do portal é superfície NOSSA — não é a Meta, não precisa de
  // template nem de opt-in. Escrever aqui não persegue ninguém: aparece quando
  // o cliente entra. É o traço de que a casa não sumiu, e nada mais que isso.
  await avisarCliente(a.clientId, toque.corpo);

  return { ok: true, marco, noticeId: id, jaExistia: false, corpo: toque.corpo };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. A passada — quem entra na régua
// ─────────────────────────────────────────────────────────────────────────────

export interface LinhaDaPassada {
  clientId: string;
  projectId: string;
  /** `null` quando nada foi feito; o `motivo` diz por quê. */
  marco: Marco | null;
  motivo: string;
}

export interface ResultadoDaPassada {
  avaliados: number;
  registrados: number;
  repetidos: number;
  linhas: LinhaDaPassada[];
}

/**
 * Roda a régua para um workspace.
 *
 * A busca é limitada pelo tempo (só projetos de balcão na faixa dos marcos) e
 * pela quantidade. Quem já voltou não entra: uma compra depois da âncora
 * significa que o cliente não sumiu, e mandar "faz 30 dias que você não
 * aparece" para quem comprou ontem é o erro que faz a pessoa bloquear o contato.
 */
export async function rodarReguaDeRecompra(
  workspaceId: string,
  agora: Date = new Date(),
): Promise<ResultadoDaPassada> {
  const maisAntigo = new Date(agora.getTime() - (MARCOS[MARCOS.length - 1] + TOLERANCIA_DIAS + 30) * DIA_MS);
  const maisRecente = new Date(agora.getTime() - MARCOS[0] * DIA_MS);

  const projetos = await prisma.project.findMany({
    where: {
      workspaceId,
      type: "balcao",
      clientRequestId: { not: null },
      createdAt: { gte: maisAntigo, lte: maisRecente },
    },
    orderBy: { createdAt: "asc" },
    take: MAX_POR_PASSADA,
    select: {
      id: true,
      workspaceId: true,
      clientId: true,
      clientRequestId: true,
      client: { select: { id: true, name: true, email: true, phone: true } },
      deliverables: {
        // A prova de que ele RECEBEU: o portal só mostra "compartilhado".
        where: { visibility: "compartilhado" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, createdAt: true },
      },
    },
  });

  const linhas: LinhaDaPassada[] = [];
  let registrados = 0;
  let repetidos = 0;

  for (const p of projetos) {
    const entrega = p.deliverables[0];
    if (!entrega) {
      linhas.push({ clientId: p.clientId, projectId: p.id, marco: null, motivo: "nada foi entregue ao cliente ainda" });
      continue;
    }

    const dias = diasEntre(entrega.createdAt, agora);
    const marco = marcoDevido(dias);
    if (marco === null) {
      linhas.push({ clientId: p.clientId, projectId: p.id, marco: null, motivo: `${dias} dias desde a entrega — nenhum marco na janela` });
      continue;
    }

    // ── ELE VOLTOU? ────────────────────────────────────────────────────────
    // Compra nova, pedido novo ou peça nova depois da âncora = cliente ativo.
    // A régua é para quem sumiu; para quem está aqui ela é ruído.
    const voltou = await clienteVoltouDepoisDe(p.clientId, entrega.createdAt);
    if (voltou) {
      linhas.push({ clientId: p.clientId, projectId: p.id, marco: null, motivo: `cliente voltou depois da entrega (${voltou})` });
      continue;
    }

    // ── O ITEM COMPRADO, do pedido pago ────────────────────────────────────
    const pedido = await prisma.clientRequestDb.findUnique({
      where: { id: p.clientRequestId! },
      select: { briefingJson: true },
    });
    const itemDeCatalogo = serviceIdDoPedido(pedido?.briefingJson ?? null);
    const item = SELF_SERVE_CATALOG.find((s) => s.id === itemDeCatalogo);
    if (!item) {
      // Sem saber o que ele comprou, não há frase ancorada possível — e frase
      // não-ancorada é exatamente o que esta régua não pode produzir.
      linhas.push({ clientId: p.clientId, projectId: p.id, marco: null, motivo: "não consegui identificar no banco o item comprado" });
      continue;
    }

    const compras = await prisma.project.count({ where: { clientId: p.clientId, type: "balcao" } });

    const ancora: Ancora = {
      clientId: p.clientId,
      workspaceId: p.workspaceId,
      projectId: p.id,
      clienteNome: p.client?.name ?? "",
      email: p.client?.email ?? null,
      telefone: p.client?.phone ?? null,
      itemDeCatalogo,
      itemLabel: item.label,
      entregaId: entrega.id,
      entregueEm: entrega.createdAt,
      compras,
    };

    const r = await registrarToque(ancora, marco);
    if (!r.ok) {
      linhas.push({ clientId: p.clientId, projectId: p.id, marco: null, motivo: r.motivo });
      continue;
    }
    if (r.jaExistia) {
      repetidos++;
      linhas.push({ clientId: p.clientId, projectId: p.id, marco, motivo: "toque já registrado — nada foi duplicado" });
      continue;
    }
    registrados++;
    linhas.push({ clientId: p.clientId, projectId: p.id, marco, motivo: "rascunho na fila da equipe + registro no portal" });
  }

  return { avaliados: projetos.length, registrados, repetidos, linhas };
}

/**
 * O cliente deu sinal de vida depois da entrega âncora?
 *
 * Três sinais, todos fatos do banco: projeto novo, pedido de conteúdo novo, ou
 * mensagem escrita POR ELE no portal. Falar com quem está falando com você é
 * pior que não falar — soa como robô que não lê.
 */
async function clienteVoltouDepoisDe(clientId: string, quando: Date): Promise<string | null> {
  const projetoNovo = await prisma.project.findFirst({
    where: { clientId, createdAt: { gt: quando } },
    select: { id: true },
  });
  if (projetoNovo) return "abriu outro projeto";

  const pedidoNovo = await prisma.contentRequest.findFirst({
    where: { clientId, createdAt: { gt: quando } },
    select: { id: true },
  });
  if (pedidoNovo) return "mandou outro pedido";

  const falou = await prisma.portalMessage.findFirst({
    where: { clientId, authorRole: "client", createdAt: { gt: quando } },
    select: { id: true },
  });
  if (falou) return "escreveu no portal";

  return null;
}
