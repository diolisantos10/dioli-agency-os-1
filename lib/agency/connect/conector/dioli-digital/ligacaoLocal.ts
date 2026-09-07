/**
 * ⭐⭐ A LIGAÇÃO LOCAL DA DIOLI DIGITAL — o único arquivo que este produto escreve.
 *
 * ─── AS OITO RESPOSTAS, MEDIDAS NO CÓDIGO DESTA CASA ────────────────────────
 *
 * O contrato comum faz oito perguntas locais. Elas foram respondidas lendo o
 * produto, não supondo:
 *
 *   1. **qual agente atende** → o PM automático (`pm-responde.ts`). É o único
 *      agente desta casa que LÊ o que o cliente escreve; todos os outros
 *      escrevem por evento da esteira. Agente que não lê não pode ser o que
 *      atende.
 *   2. **qual canal/tela** → o portal do cliente, aba "Fale com seu PM".
 *   3. ⭐ **qual id é a conversa** → o **`Client.id`**. No Foocci é o `leadId`;
 *      aqui NÃO é o `clientRequestId`, e a diferença foi medida:
 *      `app/api/messages/conversa.ts` diz, com todas as letras, *"A conversa
 *      pertence ao CLIENTE, não à solicitação"*. Ancorar na solicitação
 *      quebraria a conversa em pedaços — e já quebrou: o cliente-piloto, criado
 *      direto e sem `ClientRequestDb`, não conseguia mandar mensagem nenhuma.
 *   4. **como se fala com o cliente** → uma linha em `PortalMessage` com
 *      `authorRole: "team"`, na voz única da casa (`VOZ_DO_CLIENTE`).
 *   5. **onde a pendência grava** → tabela `PendenciaDeConsulta` (`./armazem`).
 *      Sobrevive a restart, que é o que o contrato exige e o que o Railway
 *      cobra a cada deploy.
 *   6. **qual fila humana é o chão** → a caixa de entrada da agência, que conta
 *      `PortalMessage` com `readByTeam: false`. Ver `filaHumana` abaixo.
 *   7. **qual gatilho** classifica "fora da alçada" → `../../fora-da-alcada`,
 *      em código, antes do modelo. **Não existia**; foi construído.
 *   8. **qual escalada sobe** → `./escalada`, POST ao núcleo.
 *
 * ─── ⭐ REGISTRADA × ENTREGUE NESTE PRODUTO (decisão C4) ────────────────────
 *
 * O contrato pede duas confirmações separadas: *recebeu* e *conseguiu entregar
 * ao cliente*. Neste produto as duas coincidem, e é preciso dizer POR QUE, em
 * vez de deixar parecer descuido:
 *
 * O portal do cliente **lê a tabela `PortalMessage` diretamente**. Não há chave
 * de entrega, provedor externo, janela de 24 h nem webhook de status no meio —
 * diferente do Foocci, onde a mensagem é registrada na conversa e só depois SAI
 * por um canal que pode recusar. Aqui, gravar a linha É a entrega: no instante
 * seguinte ela está na tela de quem abrir o portal.
 *
 * Então `entregue` espelha `registrada` **honestamente**, e não por preguiça. O
 * dia em que esta casa mandar a resposta também por WhatsApp ou e-mail, os dois
 * campos se separam de verdade — e é aqui que a separação vai morar.
 *
 * ─── ⛔ O QUE ESTE ARQUIVO NÃO DECIDE ───────────────────────────────────────
 *
 * Se a política vale, se a exceção se estende, o que atravessa a barreira, como
 * o retorno casa com a conversa. Tudo isso é comum, e continua comum. Este
 * arquivo transporta e identifica; ele não julga.
 */

import { prisma } from "@/lib/db/client";
import type { FalaAoCliente, LigacaoLocal } from "../ligacaoLocal";
import type { ArmazemDePendencias } from "../pendencias";
import { armazemDePendenciasNoBanco } from "./armazem";

/**
 * A assinatura com que a casa fala com o cliente no portal.
 *
 * ⚠️ É o MESMO texto que `pm-responde.ts` já usa ao gravar em `PortalMessage`.
 * Tem de ser: uma resposta do Connect assinada por outro nome apareceria na
 * conversa como se fosse outra pessoa, e o cliente não faz ideia de que existe
 * um Connect — para ele é o mesmo gerente que já vinha falando.
 */
export const VOZ_DO_CLIENTE = "Gerente de projeto";

/** O nome deste produto no Dioli Connect. Um lugar só — ele entra no protocolo,
 *  e um protocolo com o nome errado é recusado como `produtoErrado`. */
export const PRODUTO = "dioli-digital";

/** A tela por onde esta conversa acontece. Entra no rastro da pendência. */
export const CANAL = "portal-do-cliente";

/** Quem atende. É o PM automático — o único agente desta casa com ouvido. */
export const AGENTE = "pm-responde";

/**
 * ⭐⭐ AS DUAS IDENTIDADES DO DIRETÓRIO CORPORATIVO — medidas, não supostas.
 *
 * ⚠️ NÃO CONFUNDIR COM `AGENTE`. `AGENTE` é o nome do processo DESTA casa
 * (`pm-responde`, o laço do relógio que lê a caixa do portal). `DE` e `PARA`
 * são **chaves do diretório do NÚCLEO**, que ele resolve e recorta pelo produto
 * do portão. São perguntas diferentes: "que código meu disparou isto?" e "quem,
 * no organograma da empresa, está perguntando e quem tem alçada para decidir?".
 *
 * Medidas contra o núcleo real em 30/08/2026 — este par voltou **201**, com
 * `{"estado":"entregue","consultaId":…,"fioId":…}`, e resolveu para
 * `dioli.dioli-digital.client-service-sdr.conversational-sdr` e
 * `…client-service-sdr.manager-atendimento`.
 *
 * ⛔ Não se inventa crachá aqui. Chave que o diretório não conhece faz o núcleo
 * recusar com `remetente_desconhecido`, e chave que ele conhece mas que não é
 * quem atendeu é PIOR: passa, e assina a consulta com o nome errado.
 */

/** Quem pergunta: o SDR conversacional — o único da sala que lê o cliente. */
export const DE = "conversational-sdr";

/** Quem decide: o gerente da sala de atendimento. */
export const PARA = "manager-atendimento";

/** Teto da linha de `PortalMessage.body` já praticado na casa
 *  (`porta-da-pergunta.ts` corta em 2000). O conector nunca corta texto de
 *  gerente: quem recusa por tamanho é `receberRetorno`, com teto de 4000. Este
 *  número existe só para a checagem local não gravar um corpo maior do que a
 *  casa escreve em qualquer outro lugar. */
export const MAX_CORPO = 2_000;

export interface DependenciasDaLigacao {
  /** Injetável para o teste. Em produção é o Prisma da casa. */
  db?: typeof prisma;
  armazem?: ArmazemDePendencias;
}

/**
 * ⭐ A ligação local desta casa, pronta para o conector comum.
 */
export function ligacaoDaDioliDigital(deps: DependenciasDaLigacao = {}): LigacaoLocal {
  const db = deps.db ?? prisma;
  const armazem =
    deps.armazem ?? armazemDePendenciasNoBanco(db as unknown as Parameters<typeof armazemDePendenciasNoBanco>[0]);

  return {
    produto: PRODUTO,
    canal: CANAL,
    agente: AGENTE,
    armazem,

    /**
     * Escreve na conversa do cliente.
     *
     * ⚠️ **Nunca lança.** Quem chama está num turno de webhook (ou na rota de
     * retorno do núcleo), e uma exceção aqui viraria reentrega — que, do outro
     * lado, é a mesma resposta chegando duas vezes ao mesmo cliente. Tudo o que
     * dá errado volta em `causa`, nomeado e sem segredo dentro.
     *
     * ⚠️ E o texto que chega aqui **já passou pela barreira**. Esta função não
     * decide o que pode ser dito — ela transporta. Se um dia ela começar a
     * reescrever, encurtar ou "melhorar" o texto, a casa passou a entregar ao
     * cliente algo diferente do que o gerente escreveu, sem ninguém saber.
     */
    async falarComOCliente(conversa: string, texto: string, ctx: { agora: Date }): Promise<FalaAoCliente> {
      if (!conversa || !conversa.trim()) {
        return { registrada: false, entregue: false, causa: "conversaSemIdentificador" };
      }
      const corpo = typeof texto === "string" ? texto.trim() : "";
      if (!corpo) {
        return { registrada: false, entregue: false, causa: "textoVazio" };
      }
      if (corpo.length > MAX_CORPO) {
        // Recusa, e não corte. Entregar metade da frase do gerente é entregar
        // outra frase — e a metade que sobra costuma ser a que promete.
        return { registrada: false, entregue: false, causa: "textoAcimaDoTetoDoCanal" };
      }

      try {
        // A âncora resolvida do jeito que a casa inteira resolve. Reusar
        // `conversaDoCliente` é o que mantém a mensagem do conector no MESMO
        // fio que o cliente já lê — uma âncora própria aqui criaria uma segunda
        // conversa invisível para ele.
        const { conversaDoCliente } = await import("@/app/api/messages/conversa");
        const fio = await conversaDoCliente(conversa);

        // ⚠️ A âncora precisa apontar para ESTE cliente. Se `conversaDoCliente`
        // não devolveu o dono, não há onde gravar com segurança — e gravar
        // "mais ou menos" é como uma resposta chega ao cliente errado.
        if (fio.ancora.clientId !== conversa) {
          return { registrada: false, entregue: false, causa: "conversaNaoEncontrada" };
        }

        const linha = await db.portalMessage.create({
          data: {
            clientId: fio.ancora.clientId,
            clientRequestId: fio.ancora.clientRequestId,
            authorRole: "team",
            authorName: VOZ_DO_CLIENTE,
            body: corpo,
            // Já lida pela equipe: foi a própria casa que escreveu. Deixá-la
            // não-lida encheria a caixa de entrada da agência com o que a
            // agência acabou de dizer.
            readByTeam: true,
            // NÃO lida pelo cliente: é justamente o que faz o badge aparecer
            // para ele. Marcar como lida aqui esconderia a resposta que este
            // conector inteiro existe para entregar.
            readByClient: false,
            createdAt: ctx.agora,
          },
        });

        // ⭐ Neste produto gravar É entregar — ver o cabeçalho. Os dois campos
        // continuam separados no contrato porque em outro canal eles divergem.
        return { registrada: true, entregue: true, mensagemId: linha.id };
      } catch (e) {
        return {
          registrada: false,
          entregue: false,
          // ⛔ Sem segredo e sem dado de cliente dentro da causa: ela vai para
          // log e para a resposta ao núcleo.
          causa: e instanceof Error ? `falhaAoGravar:${e.name}` : "falhaAoGravar",
        };
      }
    },
  };
}

/**
 * ⚠️ A FILA HUMANA — o chão que não sai do lugar, e ele já existia.
 *
 * Quando não há política, a escalada não abre e o conector devolve
 * `escalou: false`, a pergunta do cliente **continua** com `readByTeam: false`
 * em `PortalMessage`. Isso não é um resto esquecido: é exatamente a caixa de
 * entrada da agência, que conta por esse índice (`@@index([readByTeam,
 * authorRole])`) e é a tela onde uma pessoa encontra a mensagem.
 *
 * ⭐ E é por isso que este conector **não inventou fila nova**. A regra da casa
 * (`pm-responde.ts`) já é: *sem resposta, a mensagem fica NA FILA, não lida,
 * que é onde um humano a encontra*. Uma fila paralela do Connect seria um
 * segundo lugar para olhar, e o segundo lugar é o que ninguém olha.
 *
 * Decisão C5, aplicada: mensagem que não pôde ser respondida automaticamente
 * fica pronta para gente **e não é marcada como entregue ao cliente** — não
 * existe "entregue" que signifique "alguém vai entregar depois".
 */
export function aMensagemContinuaNaFilaHumana(): true {
  return true;
}
