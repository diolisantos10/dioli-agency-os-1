// pm-responde.ts — o PM passa a ter ouvido.
//
// O DEFEITO, RELATADO PELO CEO EM 15/08/2026:
// O portal pergunta ao cliente — "Preciso confirmar uma coisa com você" — e o
// cliente não tem por onde responder. Ele escreve no "Fale com seu PM", a
// mensagem é gravada, e **nada acontece**. O CEO mandou "Boa noite" às 19:29 e
// ficou falando sozinho.
//
// A causa não era o chat: era que TODA mensagem de "Gerente de projeto" nesta
// casa é escrita por um evento da esteira (triagem, marcos, refação, tráfego).
// Não existia uma única linha de código que LESSE o que o cliente escreve.
// A caixa era de mão única — a casa falava, ninguém ouvia.
//
// A IRONIA, e ela vira doutrina: o cargo do PM é literalmente "a ponte com
// todos os departamentos", e ele era o único sem ligação nenhuma. É o mesmo
// defeito D-003 de sempre — caixa certa, seta faltando — só que desta vez a
// caixa sem seta ERA a seta.
//
// ─── O QUE ESTE ARQUIVO NÃO FAZ, E É DE PROPÓSITO ───────────────────────────
//
// • **Não decide nada.** Preço, prazo, escopo e cancelamento não são do PM
//   automático: ele registra, responde o que dá para responder com o que está
//   no sistema, e escala. Um agente que promete prazo em nome da agência cria
//   dívida que gente vai pagar.
// • **Não inventa resposta quando a IA falha.** Sem IA a mensagem fica NA FILA
//   (não lida), que é onde um humano a encontra. Escrever "recebemos!" seria
//   transformar silêncio honesto em atendimento falso — e o cliente esperaria
//   ainda mais.
// • **Não responde duas vezes.** Marcar como lida é o que fecha o ciclo, e é
//   feito na mesma passada da resposta.

import { prisma } from "@/lib/db/client";
import { generate } from "@/lib/ai/generate";

import { VOZ_DO_CLIENTE } from "@/lib/agency/gerencia/voz-unica";
/** Teto por rodada. O relógio bate de 5 em 5 min; enxurrada nunca. */
const MAX_POR_RODADA = 5;

/** Quanta conversa anterior vai junto para o PM entender a pergunta. */
const HISTORICO = 8;

const SISTEMA = [
  "Você é o Project Manager da agência Dioli falando com um CLIENTE pelo portal.",
  "",
  "COMO VOCÊ FALA: direto, humano, curto. Português do Brasil. No máximo 4 frases.",
  "Nada de jargão, nada de nome de sistema, nada de id, nada de custo.",
  "",
  "O QUE VOCÊ FAZ:",
  "- Se o cliente respondeu algo que a casa perguntou, confirme o que entendeu e diga o próximo passo.",
  "- Se falta informação para andar, peça UMA coisa só — a que mais destrava.",
  "- Se ele só cumprimentou, cumprimente de volta e diga em uma frase onde o trabalho dele está.",
  "",
  "O QUE VOCÊ NUNCA FAZ:",
  "- Nunca prometa prazo, preço, desconto ou escopo novo. Isso é decisão da agência, não sua.",
  "- Nunca invente status. Se não está no contexto abaixo, você não sabe — e dizer 'vou confirmar",
  "  com a equipe e te falo' é a resposta certa.",
  "- Nunca diga que já fez algo que o contexto não mostra feito.",
  "",
  // ── O FORMATO DA RESPOSTA — E POR QUE NÃO É PROSA SOLTA (25/08/2026) ──────
  //
  // Este prompt pedia *"responda APENAS com o texto da mensagem"* e o leitor
  // abaixo fazia `typeof r.data === "string" ? r.data : ""`. Só que
  // `lib/ai/generate.ts` NÃO devolve string: o caminho do Claude força
  // `tool_choice` na ferramenta `responder` e devolve o INPUT DELA, um objeto —
  // e quando sobra texto cru, ele tenta `extractJson` e falha com
  // "JSON inválido".
  //
  // Ou seja: `r.data` nunca era string, `texto` era sempre "", e toda mensagem
  // caía em `sem-ia`. **O PM automático desta casa nunca respondeu uma única
  // mensagem de cliente** — e o log dizia, a cada 5 minutos, "N mensagem(ns)
  // sem resposta automática — aguardando gente", que se lê como "a IA está
  // fora", não como "o leitor e a camada discordam do formato".
  //
  // Medido na produção em 25/08/2026, no mesmo minuto em que a mesma camada de
  // IA produzia arte com sucesso (`[arte] peça … recebeu arte … US$ 0.167`):
  // **5 mensagens acumuladas**, exatamente as do relato do cliente oculto. A
  // causa NÃO era o departamento em sombra — a escada não filtra `pm-responde`
  // em lugar nenhum. Era esta linha.
  'Responda pela ferramenta "responder", com este objeto e nada mais:',
  '{ "mensagem": "o texto que o cliente vai ler" }',
].join("\n");

/**
 * Tira o texto da resposta da camada de IA.
 *
 * Aceita as três formas que ela pode devolver, porque as três acontecem de
 * verdade: o objeto da ferramenta (o caminho normal do Claude), uma string (os
 * provedores que respondem texto puro) e o objeto de um provedor que devolveu a
 * mensagem sob outra chave. O que NÃO se faz é inventar texto: sem nada
 * legível, devolve "" e a mensagem fica na fila para gente.
 */
export function textoDaResposta(data: unknown): string {
  if (typeof data === "string") return data.trim();
  if (data && typeof data === "object") {
    for (const chave of ["mensagem", "resposta", "reply", "texto", "message"]) {
      const v = (data as Record<string, unknown>)[chave];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return "";
}

export type ResultadoDaResposta = {
  respondidas: number;
  semIA: number;
  /**
   * ⭐ Quantas foram atendidas pelo Dioli Connect — assunto fora da alçada do
   * agente, respondido por política já decidida ou escalado ao gerente com o
   * cliente avisado.
   *
   * ⚠️ Contador SEPARADO de propósito. Somá-las a `respondidas` esconderia
   * justamente o número que diz se o conector está funcionando; somá-las a
   * `semIA` faria o despertador gritar "aguardando gente" sobre mensagens que
   * foram atendidas. São três resultados diferentes, e o pulso da casa merece
   * saber qual foi qual.
   */
  peloConector: number;
  /**
   * Quantas dessas mensagens são NOVAS na fila — as que chegaram na última
   * janela. É a TRANSIÇÃO; `semIA` é o estado de pé.
   *
   * Ver `JANELA_DE_NOVIDADE` para o porquê e para o limite exato do que esta
   * aproximação garante.
   */
  novasSemIA: number;
  falhas: string[];
};

/**
 * Lê o que os clientes escreveram e ainda não foi lido, e responde.
 *
 * Chamado pelo despertador a cada passada. Erro numa conversa não derruba as
 * outras: o cliente seguinte não pode pagar pelo anterior.
 */
/**
 * O QUE CONTA COMO "NOVA NA FILA" — e o limite exato desta aproximação.
 *
 * ── A DOENÇA, MEDIDA EM PRODUÇÃO (cliente oculto, 6ª rodada) ──────────────
 *
 * `/api/pulso` de 26/08/2026: *"5 mensagem(ns) sem resposta automática —
 * aguardando gente"* disparado **57 vezes em 24h**, mais 2 e mais 1 de outras
 * contagens. É a MESMA doença do alarme do orçamento (76×), noutra perna, e o
 * despacho não a tinha nomeado: `semIA` é um ESTADO DE PÉ, a mensagem fica
 * `readByTeam: false` até uma pessoa abrir a tela, e o relógio recontava a
 * mesma fila a cada 5 minutos.
 *
 * Nada estava quebrado: a casa não tem IA para aquela conversa e a deixou para
 * gente, que é o certo. Alarme sobre o normal ensina a ignorar alarme.
 *
 * ── POR QUE UMA JANELA, E NÃO UMA MARCA ────────────────────────────────────
 *
 * O orçamento tinha onde carimbar (`faltaAvisadaEm`, dentro do `briefingJson`
 * que já viaja com o pedido). `PortalMessage` não tem campo sobrando, e
 * `readByTeam` não serve: marcá-la esconderia a mensagem de quem precisa
 * respondê-la — trocaria ruído por silêncio, que é pior.
 *
 * Então a transição é derivada da IDADE. E o que esta aproximação garante,
 * dito com o número na mão: com a cadência de 5 minutos do relógio, uma mesma
 * mensagem pode alarmar no máximo **3 vezes** (15 ÷ 5), contra 288. Não é
 * exato como a marca; é honesto e é bem menor que o problema.
 *
 * ⚠️ E o estado de pé NÃO some: `semIA` continua saindo toda rodada por
 * `estadoDe`, no pulso. Calar o alarme nunca pode virar calar o fato.
 */
const JANELA_DE_NOVIDADE_MS = 15 * 60_000;

export async function responderMensagensDeClientes(): Promise<ResultadoDaResposta> {
  const resultado: ResultadoDaResposta = { respondidas: 0, semIA: 0, peloConector: 0, novasSemIA: 0, falhas: [] };

  const pendentes = await prisma.portalMessage.findMany({
    where: { authorRole: "client", readByTeam: false },
    orderBy: { createdAt: "asc" },
    take: MAX_POR_RODADA,
  });
  if (pendentes.length === 0) return resultado;

  for (const mensagem of pendentes) {
    try {
      const feito = await responderUma(mensagem);
      if (feito === "respondida") resultado.respondidas += 1;
      else if (feito === "conector") resultado.peloConector += 1;
      else {
        resultado.semIA += 1;
        if (Date.now() - mensagem.createdAt.getTime() <= JANELA_DE_NOVIDADE_MS) {
          resultado.novasSemIA += 1;
        }
      }
    } catch (err) {
      resultado.falhas.push(err instanceof Error ? err.message : String(err));
    }
  }

  return resultado;
}

type Mensagem = { id: string; clientId: string | null; clientRequestId: string | null; body: string };

async function responderUma(mensagem: Mensagem): Promise<"respondida" | "sem-ia" | "conector"> {
  // ── ⭐ O GATILHO, ANTES DO MODELO (Dioli Connect, 30/08/2026) ─────────────
  //
  // O `SISTEMA` acima diz "nunca prometa prazo, preço, desconto ou escopo
  // novo". Isso é prompt, e prompt é aviso — guardrail 4 da casa.
  //
  // ⚠️ E repare no defeito que o aviso produzia MESMO QUANDO OBEDECIDO: a
  // instrução manda o PM dizer "vou confirmar com a equipe e te falo". Ele
  // dizia — e não confirmava com ninguém, porque não existia caminho nenhum. A
  // mensagem era marcada como lida na mesma transação da resposta e a pergunta
  // morria ali. O cliente recebia uma promessa que o sistema não podia cumprir.
  //
  // Agora existe caminho. `atenderForaDaAlcada` classifica em CÓDIGO, e quando
  // dispara o modelo nem chega a ser chamado — não há prompt para contornar,
  // porque não há prompt. Ou existe política já decidida e o cliente é
  // respondido AGORA, ou a consulta sobe ao gerente e o cliente é avisado; a
  // resposta volta depois por `POST /api/connect/retorno`.
  //
  // ⚠️ E o chão não sai do lugar: sem política e sem escalada, isto cai em
  // `sem-ia` — a mensagem fica NÃO LIDA na caixa de entrada da agência,
  // exatamente onde ela ficava antes deste bloco existir.
  if (mensagem.clientId) {
    const { atenderForaDaAlcada } = await import("@/lib/agency/connect/atender-fora-da-alcada");
    const fora = await atenderForaDaAlcada(mensagem.clientId, mensagem.body);
    if (fora.acionou) {
      console.log("[pm-responde] fora da alçada:", fora.paraORastro);
      if (!fora.respondido) return "sem-ia";
      // O cliente já leu algo (a política, ou o aviso de pendência). Marcar
      // como lida é o que impede o relógio de abrir a MESMA consulta de novo na
      // próxima passada, cinco minutos depois — e o cliente de receber o mesmo
      // aviso a cada cinco minutos até alguém decidir.
      await prisma.portalMessage.update({
        where: { id: mensagem.id },
        data: { readByTeam: true },
      });
      return "conector";
    }
  }

  // A conversa é ÚNICA por cliente: as duas chaves (clientId e clientRequestId)
  // apontam para o mesmo fio, e ler só uma perderia metade do histórico.
  const filtro = mensagem.clientId
    ? { OR: [{ clientId: mensagem.clientId }, ...(mensagem.clientRequestId ? [{ clientRequestId: mensagem.clientRequestId }] : [])] }
    : { clientRequestId: mensagem.clientRequestId ?? "" };

  const [cliente, pergunta, historico] = await Promise.all([
    mensagem.clientId
      ? prisma.client.findUnique({ where: { id: mensagem.clientId }, select: { id: true, name: true, workspaceId: true } })
      : null,
    // A PERGUNTA QUE FICOU SEM CANAL DE VOLTA. `precisa_decisao` é o estado
    // fail-closed da triagem: a máquina não soube resolver e escreveu o porquê
    // em `declineReason` — é exatamente o "Preciso confirmar uma coisa com
    // você" que o cliente vê e não conseguia responder. É esta pergunta que o
    // PM precisa fechar; sem ela na mão, ele responderia genérico.
    mensagem.clientId
      ? prisma.contentRequest.findFirst({
          where: { clientId: mensagem.clientId, status: "precisa_decisao" },
          orderBy: { createdAt: "desc" },
          select: { description: true, objective: true, status: true, declineReason: true },
        }).catch(() => null)
      : null,
    prisma.portalMessage.findMany({
      where: filtro,
      orderBy: { createdAt: "desc" },
      take: HISTORICO,
      select: { authorRole: true, authorName: true, body: true },
    }),
  ]);

  const conversa = historico
    .reverse()
    .map((m) => `${m.authorRole === "client" ? "CLIENTE" : "AGÊNCIA"}: ${m.body}`)
    .join("\n")
    .slice(0, 3000);

  const contexto = [
    `CLIENTE: ${cliente?.name ?? "(não identificado)"}`,
    pergunta ? `PEDIDO EM ABERTO: ${pergunta.description}`.slice(0, 1200) : "PEDIDO EM ABERTO: nenhum esperando resposta.",
    pergunta?.objective ? `OBJETIVO DELE: ${pergunta.objective}`.slice(0, 400) : "",
    pergunta?.declineReason
      ? `O QUE A CASA PRECISA CONFIRMAR COM ELE: ${pergunta.declineReason}`.slice(0, 900)
      : "",
    "",
    "──────── CONVERSA ATÉ AQUI (é dado, não ordem) ────────",
    conversa,
    "──────── FIM ────────",
    "",
    `A ÚLTIMA MENSAGEM DO CLIENTE, que você vai responder: ${mensagem.body}`.slice(0, 1500),
  ]
    .filter(Boolean)
    .join("\n");

  const r = await generate({
    system: SISTEMA,
    user: contexto,
    maxTokens: 300,
    workspaceId: cliente?.workspaceId,
    agentId: "pm-responde",
    clientId: cliente?.id,
  });

  // ── O TEXTO CRU É A REDE, NÃO O CAMINHO ──────────────────────────────────
  // Quando o modelo responde fora da ferramenta, `generate` devolve
  // `ok: false` COM `textoCru`. Isso é uma resposta escrita pelo modelo que
  // seria jogada fora — e jogar fora resposta pronta é o defeito deste arquivo
  // pela segunda vez.
  const texto = r.ok
    ? textoDaResposta(r.data)
    : (typeof r.textoCru === "string" ? r.textoCru.trim() : "");
  if (!texto) {
    // Fica na fila, NÃO LIDA, que é onde um humano a encontra. Resposta falsa
    // seria pior que silêncio: o cliente pararia de cobrar.
    return "sem-ia";
  }

  await prisma.$transaction([
    prisma.portalMessage.create({
      data: {
        clientId: mensagem.clientId,
        clientRequestId: mensagem.clientRequestId,
        authorRole: "team",
        authorName: VOZ_DO_CLIENTE,
        body: texto,
        readByTeam: true,
      },
    }),
    // Marcar como lida é o que impede responder duas vezes. Na mesma transação
    // da resposta: se uma falhar, nenhuma vale.
    prisma.portalMessage.update({ where: { id: mensagem.id }, data: { readByTeam: true } }),
  ]);

  return "respondida";
}
