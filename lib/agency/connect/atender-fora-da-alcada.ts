/**
 * ⭐⭐ O CHAMADOR — onde o conector entra no caminho de PRODUÇÃO desta casa.
 *
 * ─── "QUEM CHAMA ISSO?", RESPONDIDO ANTES DE ALGUÉM PERGUNTAR ───────────────
 *
 * Uma peça pronta, testada e sem chamador não é uma peça: é uma pasta. O
 * caminho real, de ponta a ponta, é este e não tem desvio:
 *
 *   despertador (relógio, a cada 5 min)
 *     └── `responderMensagensDeClientes()`            [pm-responde.ts]
 *          └── `responderUma(mensagem)`
 *               └── ⭐ `atenderForaDaAlcada(...)`     [ESTE ARQUIVO]
 *                    └── `atenderComOConector(...)`   [conector, comum]
 *
 * E o retorno chega pelo outro sentido, empurrado pelo núcleo:
 *
 *   núcleo → `POST /api/connect/retorno` → `receberRetorno` → `falarComOCliente`
 *
 * ─── ⚠️ ONDE EXATAMENTE ELE ENTRA, E POR QUE ANTES DO MODELO ────────────────
 *
 * Ele entra **antes da chamada de IA**, e isso é o ponto inteiro. O PM
 * automático tinha a regra "nunca prometa prazo, preço, desconto ou escopo
 * novo" escrita no prompt — um aviso. Aviso falha em silêncio. O gatilho
 * (`fora-da-alcada.ts`) decide em código, sem rede e sem custo, e quando ele
 * dispara **o modelo nem é chamado**: não há prompt para contornar, porque não
 * há prompt.
 *
 * ─── ⚠️ E O CHÃO NÃO SAI DO LUGAR ──────────────────────────────────────────
 *
 * Quando não há política **e** a escalada não abre, esta função devolve
 * `respondido: false`. Quem chama **não marca a mensagem como lida**, e ela
 * fica na caixa de entrada da agência exatamente como ficava antes de existir
 * Connect nenhum. Um canal novo que deixasse o cliente esperando em silêncio
 * seria pior que o defeito que ele conserta.
 *
 * **Nunca lança.** Quem chama está numa passada do relógio que atende outros
 * clientes na mesma rodada, e uma exceção aqui derrubaria os seguintes.
 */

import { atenderComOConector, type ResultadoDoConector } from "./conector/atendimento";
import { ligacaoDaDioliDigital, CANAL, AGENTE } from "./conector/dioli-digital/ligacaoLocal";
import { escaladaDaDioliDigital } from "./conector/dioli-digital/escalada";
import { foraDaAlcadaNaMensagem } from "./fora-da-alcada";
import { traduzirAssuntosParaONucleo } from "./vocabulario-do-nucleo";
import type { LigacaoLocal } from "./conector/ligacaoLocal";

export type ResultadoDoAtendimento =
  | {
      /** O gatilho não disparou: o PM responde como sempre respondeu. */
      acionou: false;
    }
  | {
      /** O conector cuidou disto. `respondido` diz se o cliente já leu algo. */
      acionou: true;
      /** ⭐ O cliente recebeu texto AGORA — resposta imediata por política, ou
       *  o aviso de que a decisão está pendente. */
      respondido: boolean;
      resultado: ResultadoDoConector;
      /** Uma frase para o log da casa. ⛔ Sem segredo e sem dado pessoal. */
      paraORastro: string;
    };

export interface DependenciasDoAtendimento {
  ligacao?: LigacaoLocal;
  buscar?: typeof fetch;
  env?: NodeJS.ProcessEnv;
  novoSufixo?: () => string;
  agora?: Date;
}

/**
 * ⭐ A mensagem deste cliente exige decisão da agência? Então o conector atende.
 *
 * @param conversa  o `Client.id` — é o id da conversa neste produto.
 * @param mensagem  o texto que o cliente acabou de escrever.
 */
export async function atenderForaDaAlcada(
  conversa: string,
  mensagem: string,
  deps: DependenciasDoAtendimento = {},
): Promise<ResultadoDoAtendimento> {
  // ── O gatilho, em código, antes do modelo ────────────────────────────────
  const assuntos = foraDaAlcadaNaMensagem(mensagem);
  if (assuntos.length === 0) return { acionou: false };

  // ⚠️ Sem identificador de conversa não há onde a resposta pousar depois. O
  // conector não é acionado, e a mensagem segue para gente — que é o chão.
  if (!conversa || !conversa.trim()) return { acionou: false };

  // ── ⭐ A TRADUÇÃO, ANTES DA REDE (medido em 30/08/2026) ───────────────────
  //
  // O núcleo tem vocabulário FECHADO para `assunto`, e assunto fora dele faz o
  // núcleo recusar a consulta INTEIRA. A classificação desta casa é local
  // ("desconto", "prazo", …) e não é a língua dele. Quem traduz é o produto —
  // decisão D3, e é por isso que a tradução mora em `vocabulario-do-nucleo.ts`
  // e não em nenhum arquivo comum do conector.
  //
  // ⚠️ O gatilho já disparou ACIMA, com a lista LOCAL: nada aqui pode fazer a
  // mensagem voltar para o modelo. Traduzir mexe só no que viaja.
  const { paraORede: assuntosParaONucleo } = traduzirAssuntosParaONucleo(assuntos);

  const ligacao = deps.ligacao ?? ligacaoDaDioliDigital();

  try {
    const resultado = await atenderComOConector(
      ligacao,
      {
        conversa,
        // ⭐ A referência do cliente é o `Client.id`, e ela existe por um motivo
        // só: sem saber QUEM pergunta, o núcleo não distingue uma exceção
        // concedida a este cliente de uma regra da empresa. ⛔ Nenhum outro
        // dado pessoal atravessa — nada de nome, e-mail ou telefone.
        referenciaDoCliente: conversa,
        assuntos: assuntosParaONucleo,
        pergunta: mensagem.slice(0, 1500),
        agora: deps.agora,
      },
      escaladaDaDioliDigital(
        {
          referenciaDoCliente: conversa,
          pergunta: mensagem.slice(0, 1500),
          canal: CANAL,
          agente: AGENTE,
        },
        { buscar: deps.buscar, env: deps.env },
      ),
      { buscar: deps.buscar, env: deps.env, novoSufixo: deps.novoSufixo },
    );

    const respondido = resultado.respondeu
      ? true
      : resultado.escalou
        ? resultado.avisouOCliente
        : false;

    return { acionou: true, respondido, resultado, paraORastro: resultado.paraORastro };
  } catch (e) {
    // ⚠️ `atenderComOConector` promete nunca lançar. Este `catch` existe para o
    // dia em que essa promessa falhar: a mensagem volta para a fila humana em
    // vez de derrubar a rodada inteira do relógio.
    return {
      acionou: true,
      respondido: false,
      resultado: {
        respondeu: false,
        escalou: false,
        causaDaPolitica: "nucleoInalcancavel",
        detalhe: e instanceof Error ? e.name : "erro sem nome",
        paraORastro: "O conector falhou de forma inesperada; a mensagem continua na fila humana.",
      },
      paraORastro: "O conector falhou de forma inesperada; a mensagem continua na fila humana.",
    };
  }
}
