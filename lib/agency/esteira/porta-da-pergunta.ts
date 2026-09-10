// porta-da-pergunta.ts — TODA PROIBIÇÃO PRECISA DA INSTRUÇÃO GÊMEA.
//
// ─── O DEFEITO, MEDIDO EM PRODUÇÃO EM 25/08/2026 ─────────────────────────────
//
// A Ana pediu 1 story. A casa só vende pacote de 4 e **parou para perguntar** —
// e isso está certo, é a TRAVA 2-B fazendo o trabalho dela. O texto que ela leu
// terminava assim:
//
//   "…a equipe confirma com você se prefere o pacote ou um orçamento avulso,
//    e responde por aqui."
//
// A Ana respondeu, na conversa do portal: **"pode ser o pacote de 4"**.
//
// E aí acabou o mundo. `precisa_decisao` não tem saída pelo lado do cliente:
// `/api/portal/pedidos` só sabe LER (`GET`) e ABRIR pedido novo (`POST`), e o
// cartão do portal (`SolicitarAlgo.tsx`) mostra um selo amarelo e o texto do
// `declineReason` — sem um único botão. A única saída de `precisa_decisao` no
// repositório inteiro é `app/api/messages/pedidos/route.ts`: a triagem MANUAL,
// por sessão da agência, numa tela que o cliente não alcança.
//
// A resposta dela foi para o chat livre. O único leitor do chat é
// `pm-responde.ts`, e a ficha dele proíbe, com todas as letras: *"Nunca prometa
// prazo, preço, desconto ou **escopo novo**"*. Ou seja: mesmo no melhor caso —
// IA acordada, departamento liberado, PM respondendo — a resposta certa dele é
// educada e inconsequente. **O pedido não anda.** Cinco mensagens acumuladas.
//
// A proibição ("só vendemos pacote de 4") estava construída em CÓDIGO. A
// instrução gêmea ("e é assim que você diz sim") não existia em lugar nenhum.
//
// ─── POR QUE ISSO DEIXOU DE SER DETALHE ──────────────────────────────────────
//
// Um humano releva: insiste, liga, manda WhatsApp, xinga o CEO. Um **agente de
// IA representando uma marca** — que é o cliente que esta agência vai atender —
// só sabe usar a porta. Se a porta não existe, ele fica preso pedindo, para
// sempre, educadamente. A régua nova do pronto é essa: *um cliente que só sabe
// usar a porta consegue ir do primeiro contato até a peça na mão.*
//
// ─── O MECANISMO, E NÃO O AVISO ──────────────────────────────────────────────
//
// Quando a triagem para, ela grava — junto do motivo em português — a
// **pergunta estruturada**: o que se está perguntando e quais são as respostas
// possíveis. Isso mora em `ContentRequest.pendingQuestionJson`.
//
//   • Cada opção carrega o EFEITO dela, não só um rótulo. `quantidade` faz a
//     triagem rodar de novo com aquele número; `escalar` entrega para gente com
//     dono e próxima ação escritos.
//   • A resposta do cliente entra na conversa como mensagem DELE
//     (`authorRole: "client"`) — a casa escutou, e está escrito onde os dois
//     lados leem.
//   • Respondida, a pergunta é APAGADA. Pergunta que sobrevive à resposta vira
//     a mesma pergunta duas vezes, que é como o cliente aprende a ignorar o
//     portal.
//
// ─── O QUE ESTE ARQUIVO NÃO FAZ, E É DE PROPÓSITO ───────────────────────────
//
// • **Não adivinha a resposta.** Opção que não está na lista é 422, não é um
//   palpite. Texto livre só é aceito onde a pergunta pede um NÚMERO, e só se
//   for um número de verdade.
// • **Não inventa preço nem escopo.** Ele devolve o pedido à triagem, que é
//   quem tem a tabela. Quem responde "pode ser o pacote de 4" recebe o preço da
//   tabela do pacote de 4 — não um número novo nascido aqui.
// • **Não liga departamento em sombra.** A escada continua inteira: esta porta
//   é a resposta do CLIENTE entrando, não uma saída de agente para o cliente.

import { prisma } from "@/lib/db/client";

/** Uma resposta possível — com o EFEITO dela, não só o rótulo. */
export interface OpcaoDaPergunta {
  /** Estável, curto, e é o que o cliente manda de volta. */
  id: string;
  /** O que o cliente lê no botão. Linguagem de dono de negócio. */
  rotulo: string;
  /**
   * Escolher esta opção CONFIRMA esta quantidade e manda a triagem rodar de
   * novo. É a instrução gêmea da proibição: o caminho depois do "pode ser".
   */
  quantidade?: number;
  /**
   * Esta opção não é resolvível por máquina: vai para gente. NÃO é silêncio —
   * `dono` e `proximaAcao` são obrigatórios junto, e viram texto que o cliente
   * lê no cartão.
   */
  escalar?: boolean;
  dono?: string;
  proximaAcao?: string;
  /**
   * Escolher esta opção CONFIRMA qual dos dois trabalhos o cliente quer — a
   * PEÇA pronta ou o INSUMO (texto/roteiro) — e manda a triagem rodar de novo.
   *
   * Existe pelo mesmo motivo que `quantidade`: a leitura do entregável é léxica
   * e roda no texto ORIGINAL, que continua ambíguo depois de o cliente ter
   * dito qual é. Sem gravar a escolha dele, a releitura reproduziria a mesma
   * parada, para sempre — a porta abriria para o mesmo beco.
   */
  entregavel?: "peca" | "insumo";
  /**
   * Escolher esta opção CONFIRMA a chamada para ação da peça — o que a pessoa
   * deve fazer depois de ver o post — e manda a PRODUÇÃO continuar de onde
   * parou.
   *
   * ⚠️ É o único efeito que NÃO volta para a triagem, e a diferença importa:
   * este pedido já foi triado, precificado e aceito. Devolvê-lo à triagem
   * reabriria preço e escopo de uma compra já fechada. O que falta aqui é uma
   * informação de PRODUÇÃO, então quem retoma é a produção.
   */
  cta?: string;
}

export interface PerguntaAoCliente {
  /** A pergunta, em uma frase, em português de gente. */
  pergunta: string;
  opcoes: OpcaoDaPergunta[];
  /**
   * A pergunta aceita um NÚMERO digitado além das opções? Só quando o que
   * falta é literalmente uma contagem ("quantas peças são?").
   */
  aceitaNumero?: boolean;
  abertaEm: string;
}

export function serializarPergunta(p: Omit<PerguntaAoCliente, "abertaEm">): string {
  return JSON.stringify({ ...p, abertaEm: new Date().toISOString() });
}

/**
 * Lê a pergunta guardada. Qualquer coisa ilegível vira `null` — e `null` é
 * honesto: sem pergunta legível, o cartão não mostra botão nenhum, em vez de
 * mostrar um botão que não faz nada.
 */
export function lerPergunta(json: string | null | undefined): PerguntaAoCliente | null {
  if (!json) return null;
  try {
    const p = JSON.parse(json) as Partial<PerguntaAoCliente>;
    if (typeof p.pergunta !== "string" || !p.pergunta.trim()) return null;
    const opcoes = Array.isArray(p.opcoes)
      ? p.opcoes.filter((o): o is OpcaoDaPergunta =>
          !!o && typeof o.id === "string" && typeof o.rotulo === "string")
      : [];
    if (opcoes.length === 0 && !p.aceitaNumero) return null;
    return {
      pergunta: p.pergunta,
      opcoes,
      aceitaNumero: p.aceitaNumero === true,
      abertaEm: typeof p.abertaEm === "string" ? p.abertaEm : "",
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// A RESPOSTA DO CLIENTE
// ─────────────────────────────────────────────────────────────────────────────

export type ResultadoDaResposta =
  | { ok: true; status: string; recado: string }
  | { ok: false; erro: string; codigo: number; pergunta?: PerguntaAoCliente };

/** Teto de sanidade: ninguém pede 500 peças por um botão. */
const MAX_QUANTIDADE = 200;

/**
 * O cliente responde a pergunta que a casa fez.
 *
 * O dono já vem RESOLVIDO do token pela rota — esta função nunca aceita
 * `clientId` de corpo. Ela confere que o pedido é dele antes de qualquer coisa.
 */
export async function responderPergunta(input: {
  clientId: string;
  pedidoId: string;
  /** O id de uma das opções, quando o cliente clicou num botão. */
  opcaoId?: string | null;
  /** Um número digitado, quando a pergunta pede contagem. */
  numero?: number | null;
}): Promise<ResultadoDaResposta> {
  const pedido = await prisma.contentRequest.findFirst({
    where: { id: input.pedidoId, clientId: input.clientId },
    select: { id: true, status: true, pendingQuestionJson: true, clientRequestId: true, title: true, taskId: true, projectId: true },
  }).catch(() => null);

  // "Não é seu" e "não existe" saem iguais: a distinção já é o vazamento.
  // (O `where` acima já combina id + posse; este comentário dizia a regra
  // certa e o `codigo` a quebrava — 403 confirma ao chamador que o pedidoId
  // existe. 404 é a convenção da casa: ver `app/api/portal/materiais/route.ts`
  // e `app/api/agency/clients/[id]/marca/route.ts`.)
  if (!pedido) return { ok: false, erro: "Pedido não encontrado", codigo: 404 };

  const pergunta = lerPergunta(pedido.pendingQuestionJson);
  if (!pergunta) {
    // Não é erro do cliente: ou já foi respondida, ou nunca houve pergunta.
    // Dizer isso é melhor que um 500 — e é o que impede o clique duplo de virar
    // duas triagens.
    return { ok: false, erro: "Este pedido não está esperando resposta sua agora.", codigo: 409 };
  }

  // ── A ESCOLHA. NADA DE ADIVINHAR ──────────────────────────────────────────
  let escolhida: OpcaoDaPergunta | null = null;
  let quantidade: number | null = null;
  let entregavel: "peca" | "insumo" | null = null;
  let cta: string | null = null;
  let textoDaResposta = "";

  if (input.opcaoId) {
    escolhida = pergunta.opcoes.find((o) => o.id === input.opcaoId) ?? null;
    if (!escolhida) {
      return { ok: false, erro: "Não reconheci essa resposta.", codigo: 422, pergunta };
    }
    textoDaResposta = escolhida.rotulo;
    if (typeof escolhida.quantidade === "number") quantidade = escolhida.quantidade;
    if (escolhida.entregavel === "peca" || escolhida.entregavel === "insumo") entregavel = escolhida.entregavel;
    if (typeof escolhida.cta === "string" && escolhida.cta.trim()) cta = escolhida.cta.trim().slice(0, 200);
  } else if (input.numero != null) {
    if (!pergunta.aceitaNumero) {
      return { ok: false, erro: "Esta pergunta se responde escolhendo uma das opções.", codigo: 422, pergunta };
    }
    const n = Math.trunc(input.numero);
    if (!Number.isFinite(n) || n < 1 || n > MAX_QUANTIDADE) {
      return {
        ok: false,
        erro: `Preciso de um número entre 1 e ${MAX_QUANTIDADE}. Quantas peças são?`,
        codigo: 422,
        pergunta,
      };
    }
    quantidade = n;
    textoDaResposta = `${n} ${n === 1 ? "peça" : "peças"}`;
  } else {
    return { ok: false, erro: "Escolha uma das opções ou me diga o número.", codigo: 422, pergunta };
  }

  // ── A CASA ESCUTOU, E ESTÁ ESCRITO ────────────────────────────────────────
  // A resposta entra na conversa como mensagem DO CLIENTE. Não é enfeite: é o
  // que faz o histórico do portal contar a verdade, é o que a equipe lê, e é o
  // que o `pm-responde` vê como contexto. Coluna gravada não é cliente
  // informado — e resposta que não vira mensagem não é conversa.
  await escreverRespostaNaConversa(input.clientId, pedido.clientRequestId, pergunta.pergunta, textoDaResposta);

  // ── PERGUNTA RESPONDIDA É PERGUNTA APAGADA ────────────────────────────────
  // Na MESMA escrita em que a resposta é guardada. Pergunta que sobrevive à
  // resposta é a mesma pergunta duas vezes.
  if (escolhida?.escalar) {
    const dono = escolhida.dono ?? "a equipe";
    const proxima = escolhida.proximaAcao ?? "te responde por aqui";
    const recado = `Anotado: ${textoDaResposta}. Quem cuida disso agora é ${dono} — ${proxima}.`;
    await prisma.contentRequest.update({
      where: { id: pedido.id },
      data: { pendingQuestionJson: null, declineReason: recado.slice(0, 600) },
    });
    return { ok: true, status: "precisa_decisao", recado };
  }

  // ── A CHAMADA PARA AÇÃO RETOMA A PRODUÇÃO, NÃO A TRIAGEM ─────────────────
  //
  // Este pedido já foi triado, precificado e o cliente já aceitou o valor. O
  // que faltava era uma informação de PRODUÇÃO — o que a pessoa deve fazer
  // depois de ver a peça. Mandá-lo de volta para a triagem reabriria preço e
  // escopo de uma compra fechada, e um segundo orçamento na tela de quem já
  // aprovou o primeiro é a casa se desdizendo.
  //
  // ⚠️ E a volta é para "triado", que é o ÚNICO estado que `produzirPedido`
  // aceita. Sem tarefa ou sem projeto, não há produção a retomar: a resposta
  // fica gravada, a pergunta fechada, e o pedido continua visível para gente —
  // nunca um sucesso falso.
  if (cta != null) {
    const podeRetomar = !!pedido.taskId && !!pedido.projectId;
    await prisma.contentRequest.update({
      where: { id: pedido.id },
      data: {
        pendingQuestionJson: null,
        confirmedCta: cta,
        declineReason: podeRetomar ? null : "Anotei a sua resposta. A equipe retoma a produção deste pedido por aqui.",
        ...(podeRetomar ? { status: "triado" } : {}),
      },
    });
    if (!podeRetomar) {
      return { ok: true, status: "precisa_decisao", recado: `Anotei: ${textoDaResposta}. A equipe retoma a produção e te avisa por aqui.` };
    }
    const { produzirPedido } = await import("@/lib/agency/esteira/producao-de-pedido");
    const feito = await produzirPedido(pedido.id).catch((e: unknown) => {
      console.error("[porta-da-pergunta] a produção falhou depois da resposta:", e);
      return null;
    });
    if (feito?.ok) {
      return { ok: true, status: "entregue", recado: `Anotei: ${textoDaResposta}. A peça está pronta no portal para você decidir.` };
    }
    // A resposta ESTÁ guardada e a pergunta ESTÁ fechada. O que falhou foi o
    // passo seguinte — e o pedido em "triado" é retomado pelo despertador.
    return {
      ok: true,
      status: "triado",
      recado: feito && !feito.ok
        ? `Anotei: ${textoDaResposta}. ${feito.motivo}`
        : `Anotei: ${textoDaResposta}. Estou produzindo a sua peça e te aviso por aqui.`,
    };
  }

  await prisma.contentRequest.update({
    where: { id: pedido.id },
    data: {
      pendingQuestionJson: null,
      // O NÚMERO CONFIRMADO PELO CLIENTE. É ele que a triagem passa a usar no
      // lugar da leitura léxica — a leitura lê o texto antigo, que continua
      // dizendo "1 story". Sem esta coluna, rodar a triagem de novo daria
      // exatamente a mesma parada, para sempre.
      ...(quantidade != null ? { confirmedQuantity: quantidade } : {}),
      // O ENTREGÁVEL CONFIRMADO PELO CLIENTE, pela mesma razão exata: a leitura
      // léxica continua lendo o texto antigo, que continua ambíguo.
      ...(entregavel != null ? { confirmedDeliverable: entregavel } : {}),
      declineReason: null,
      // Volta para a fila da triagem. `novo` (e não `em_triagem`) porque a
      // trava atômica de `atenderPedido` é quem move para `em_triagem`; entrar
      // já em `em_triagem` faria a retomada do despertador achar que há uma
      // triagem viva presa há 10 minutos.
      status: "novo",
    },
  });

  // ── E AGORA A CASA ANDA ───────────────────────────────────────────────────
  // Import dinâmico: `producao-de-pedido` importa meia esteira, e um import
  // estático aqui faria a rota do portal carregar tudo isso só para ler uma
  // pergunta.
  const { atenderPedido } = await import("@/lib/agency/esteira/producao-de-pedido");
  const atendimento = await atenderPedido(pedido.id).catch((e: unknown) => {
    console.error("[porta-da-pergunta] a triagem falhou depois da resposta:", e);
    return null;
  });

  if (!atendimento) {
    // A resposta ESTÁ guardada e a pergunta ESTÁ fechada — nada disso se
    // desfaz. O que falhou foi o passo seguinte, e o despertador retoma pedido
    // em `novo`. O cliente é informado do estado real, não de um sucesso falso.
    return {
      ok: true,
      status: "novo",
      recado: "Anotei sua resposta. Estou reavaliando o pedido e te respondo por aqui.",
    };
  }

  return {
    ok: true,
    status: atendimento.status,
    recado: atendimento.recado ?? "Anotei sua resposta e o pedido voltou a andar.",
  };
}

/** Escreve a resposta do cliente na conversa dele, com a pergunta ao lado —
 *  resposta solta ("pode ser") não se entende seis mensagens depois. */
async function escreverRespostaNaConversa(
  clientId: string,
  clientRequestId: string | null,
  pergunta: string,
  resposta: string,
): Promise<void> {
  try {
    const { conversaDoCliente } = await import("@/app/api/messages/conversa");
    const conversa = await conversaDoCliente(clientId);
    await prisma.portalMessage.create({
      data: {
        clientId: conversa.ancora.clientId,
        clientRequestId: conversa.ancora.clientRequestId ?? clientRequestId,
        authorRole: "client",
        authorName: "Cliente",
        body: `Sobre “${pergunta}”: ${resposta}`.slice(0, 2000),
        // NÃO LIDA PELA EQUIPE de propósito: a resposta do cliente é notícia
        // para gente, mesmo quando a máquina já andou com ela.
        readByTeam: false,
        readByClient: true,
      },
    });
  } catch (e) {
    // Best-effort: o registro da conversa não pode impedir o pedido de andar.
    console.warn("[porta-da-pergunta] não consegui escrever a resposta na conversa:", e instanceof Error ? e.message : e);
  }
}
