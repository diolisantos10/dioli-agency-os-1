/**
 * ⭐ A ESCALADA DA DIOLI DIGITAL — a consulta ao gerente sobe pelo Dioli Connect.
 *
 * ─── LIGAÇÃO LOCAL, E A ÚNICA COISA QUE O ORQUESTRADOR DELEGA ───────────────
 *
 * `atendimento.ts` (comum) sabe QUANDO escalar; ele não sabe COMO, e é de
 * propósito: no Foocci a escalada é `consultarGerente`; aqui é este arquivo. O
 * que o conector exige de volta são duas informações e nada mais — **abriu?** e
 * **qual fio?**.
 *
 * ─── ⛔ E ELA NÃO DECIDE NADA ───────────────────────────────────────────────
 *
 * Este arquivo abre a consulta e devolve o fio. Ele não lê a resposta do
 * gerente, não a interpreta e não a entrega: a resposta volta pela porta
 * `/api/connect/retorno`, empurrada pelo núcleo, e quem a entrega é
 * `receberRetorno` (comum). Se um dia aparecer aqui um `await` esperando
 * decisão, alguém transformou o turno de um cliente em sala de espera de
 * reunião.
 *
 * ─── FAIL-CLOSED, NOS DOIS SENTIDOS ─────────────────────────────────────────
 *
 * Sem `DIOLI_CONNECT_URL` + `DIOLI_CONNECT_SECRET`, esta função não tenta nada e
 * devolve `aberta: false` com o motivo escrito. Isso não é uma falha: é o
 * conector **fechado por construção**, e o produto segue para a fila humana
 * exatamente como seguia antes de existir Connect nenhum. Nada quebra, e nada
 * abre por omissão.
 *
 * ⛔ O segredo aparece em UM lugar — o cabeçalho — e em nenhum log, motivo ou
 * texto de cliente.
 */

import { CAMINHO_DO_DESPACHO, VARIAVEL_DA_URL_DO_NUCLEO } from "../contrato";
import { CABECALHO_DO_SEGREDO, VARIAVEL_DO_SEGREDO, segredoDaPorta } from "../../porta";
import type { Escalar } from "../atendimento";
import { DE, PARA } from "./ligacaoLocal";

/**
 * O teto da consulta ao gerente: 8 s.
 *
 * ⚠️ É MAIOR que os 3 s da consulta de política, e a diferença é o desenho. A
 * consulta de política roda no turno do cliente, que está olhando a tela. Esta
 * roda depois — o cliente já vai receber o aviso de pendência de qualquer jeito,
 * e o que importa aqui é a consulta REALMENTE abrir, não abrir rápido.
 */
export const TETO_DO_DESPACHO_MS = 8_000;

export interface DependenciasDaEscalada {
  buscar?: typeof fetch;
  env?: NodeJS.ProcessEnv;
}

/**
 * Monta a escalada desta casa.
 *
 * `pergunta` e `referenciaDoCliente` entram por fora porque o `Escalar` comum só
 * carrega protocolo, assuntos e a política recusada — o resto é contexto do
 * produto, e é o produto que sabe montá-lo.
 *
 * ⚠️ `referenciaDoCliente` é o `Client.id`. **Nunca** nome, e-mail ou telefone:
 * o núcleo precisa saber QUEM pergunta para distinguir exceção de regra, e não
 * precisa de mais nada sobre a pessoa para isso.
 */
export function escaladaDaDioliDigital(
  contexto: { referenciaDoCliente: string; pergunta: string; canal: string; agente: string },
  deps: DependenciasDaEscalada = {},
): Escalar {
  return async ({ protocolo, assuntos, politicaRecusada }) => {
    const env = deps.env ?? process.env;
    const buscar = deps.buscar ?? fetch;

    const segredo = segredoDaPorta(env);
    const base = env[VARIAVEL_DA_URL_DO_NUCLEO]?.trim().replace(/\/$/, "");
    if (!segredo || !base) {
      return {
        aberta: false,
        fio: null,
        detalhe:
          `O Dioli Connect não está configurado neste ambiente (${VARIAVEL_DA_URL_DO_NUCLEO} e ` +
          `${VARIAVEL_DO_SEGREDO} precisam existir). Nenhuma consulta foi tentada, e o assunto segue ` +
          "para a fila humana como seguia antes.",
      };
    }

    const controle = new AbortController();
    const relogio = setTimeout(() => controle.abort(), TETO_DO_DESPACHO_MS);

    let resposta: Response;
    try {
      resposta = await buscar(`${base}${CAMINHO_DO_DESPACHO}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          // ⛔ O único lugar em que o segredo aparece.
          [CABECALHO_DO_SEGREDO]: segredo,
        },
        body: JSON.stringify({
          produto: "dioli-digital",
          protocolo,
          agente: contexto.agente,
          canal: contexto.canal,
          referenciaDoCliente: contexto.referenciaDoCliente,
          // ⭐⭐ QUEM PERGUNTA E QUEM DECIDE — chaves LOCAIS, resolvidas pelo
          // núcleo contra o diretório corporativo e recortadas pelo produto do
          // portão. Medidas contra o núcleo real em 30/08/2026: este par
          // devolveu 201 `{"estado":"entregue","consultaId":…,"fioId":…}` e
          // resolveu para `dioli.dioli-digital.client-service-sdr.*`.
          //
          // ⚠️ POR QUE `conversational-sdr`, E NÃO O PRIMEIRO DA LISTA. A sala
          // `client-service-sdr` tem seis fichas — `prospecting`,
          // `qualification`, `initial-diagnosis`, `opportunity-crm`,
          // `conversational-sdr` e o gerente. Quem LÊ o que o cliente escreveu
          // no portal é o SDR conversacional (ver
          // `agentes/linha/client-service-sdr/conversational-sdr.md`); os
          // outros quatro nunca falam com quem está esperando. Mandar o crachá
          // errado não daria erro — daria uma consulta assinada por quem não
          // atendeu, e o gerente decidiria sem saber de quem veio.
          de: DE,
          // O gerente daquela sala: é ele quem tem alçada sobre o que o agente
          // não pode decidir. `manager-atendimento` é a mesma ficha que o
          // artefato de produção já empacota como "o gerente do piloto".
          para: PARA,
          // ⭐ `foraDaAlcada`, e NÃO `assuntos` — medido contra o núcleo real em
          // 30/08/2026. Com `assuntos` o núcleo recusa a escalada inteira:
          //   {"estado":"recusado","codigo":"sem_assuntos_fora_da_alcada",
          //    "motivo":"o despacho nao declarou 'foraDaAlcada' ..."}
          // O nome do campo é do núcleo; quem traduz é o produto (decisão D3).
          foraDaAlcada: assuntos,
          // ⭐ `mensagem`, e NÃO `pergunta`: o núcleo não lê `pergunta`. Era
          // texto viajando para lugar nenhum.
          mensagem: contexto.pergunta,
          // ⭐ Quem vai decidir precisa saber que JÁ HOUVE decisão sobre isto e
          // que ela não valeu para este caso. Sem esta linha o gerente responde
          // a pergunta errada — ele acha que é a primeira vez.
          politicaRecusada,
        }),
        signal: controle.signal,
      });
    } catch (e) {
      const abortou = e instanceof Error && e.name === "AbortError";
      return {
        aberta: false,
        fio: null,
        detalhe: abortou
          ? `A consulta ao gerente não abriu em ${TETO_DO_DESPACHO_MS} ms.`
          : `Não deu para falar com o núcleo: ${e instanceof Error ? e.message : String(e)}.`,
      };
    } finally {
      clearTimeout(relogio);
    }

    if (!resposta.ok) {
      return {
        aberta: false,
        fio: null,
        detalhe: `O núcleo respondeu HTTP ${resposta.status} à consulta ao gerente.`,
      };
    }

    let corpo: { fioId?: unknown; fio?: unknown; aberta?: unknown } | null = null;
    try {
      corpo = (await resposta.json()) as { fioId?: unknown; fio?: unknown; aberta?: unknown };
    } catch {
      // ⚠️ 200 com corpo ilegível NÃO é consulta aberta. Ausência de informação
      // não é informação: dar por aberta uma consulta que não se sabe se abriu
      // gravaria uma pendência esperando um retorno que nunca vem.
      return {
        aberta: false,
        fio: null,
        detalhe: "O núcleo respondeu 200 com um corpo que não é JSON; a consulta não pode ser dada por aberta.",
      };
    }

    // ⭐⭐ `fioId`, E NÃO `fio` — medido contra o núcleo real em 30/08/2026.
    //
    // ⚠️ O DEFEITO QUE ISTO FECHA, e ele é dos silenciosos: lendo `corpo.fio`
    // de uma resposta que traz `fioId`, o fio saía SEMPRE `null`. A consulta
    // fica aberta no núcleo, o produto grava a pendência sem fio, e o rastro
    // passa a dizer "o núcleo não devolveu fio" sobre uma consulta que o núcleo
    // gravou direitinho. Cliente esperando a resposta de uma pergunta que a
    // empresa acha que abriu pela metade.
    //
    // O CityJobs e o FOOCCI Manager tinham o mesmo e já consertaram.
    //
    // `fio` continua aceito como nome ANTIGO: leitor tolerante na ENTRADA não é
    // complacência — complacência era o duplo de teste aceitar qualquer coisa.
    // Aqui aceitar os dois nomes só evita quebrar se algum núcleo mais velho
    // ainda responder pelo campo antigo.
    const fioBruto =
      typeof corpo?.fioId === "string" && corpo.fioId.trim()
        ? corpo.fioId
        : typeof corpo?.fio === "string" && corpo.fio.trim()
          ? corpo.fio
          : null;
    const fio = fioBruto ? fioBruto.trim() : null;
    return {
      aberta: true,
      fio,
      detalhe: fio
        ? "A consulta ao gerente foi aberta no Dioli Connect."
        : "A consulta ao gerente foi aberta no Dioli Connect (o núcleo não devolveu fio).",
    };
  };
}
