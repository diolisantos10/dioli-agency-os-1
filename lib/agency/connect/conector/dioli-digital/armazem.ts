/**
 * O LIVRO DE PENDÊNCIAS DA DIOLI DIGITAL, no banco.
 *
 * ─── LIGAÇÃO LOCAL, E SÓ ISSO ───────────────────────────────────────────────
 *
 * É aqui, e só aqui, que o conector desta casa sabe que existe Prisma e que a
 * tabela se chama `PendenciaDeConsulta`. O contrato comum (`../pendencias`) não
 * conhece banco nenhum: ele exige quatro perguntas respondidas e **uma coisa
 * só** de infraestrutura — que a resposta **sobreviva a um restart**.
 *
 * ⚠️ E aqui isso não é teoria. Esta casa reinicia o container a cada deploy
 * (Railway). Uma pendência guardada em memória de processo sumiria no próximo
 * `git push`, e o cliente que estava esperando a decisão do gerente viraria
 * órfão sem ninguém perceber: o retorno do núcleo chegaria, não acharia o
 * protocolo, e seria recusado como `protocoloDesconhecido` — uma recusa correta
 * sobre um estado que o produto perdeu. É o corte "perde conexão e volta", e é
 * por isso que isto é tabela.
 *
 * ⛔ Nenhum método aqui escreve em pedido, cliente, cobrança ou qualquer tabela
 * de negócio. A forma do contrato é o que garante isso — não a boa intenção.
 */

import { prisma } from "@/lib/db/client";
import {
  ESTADOS_DA_PENDENCIA,
  ESTADOS_NAO_RESOLVIDOS,
  type ArmazemDePendencias,
  type EstadoDaPendencia,
  type Pendencia,
  type PendenciaNova,
} from "../pendencias";
import type { DecisaoDoGerente } from "../contrato";

/** O mínimo que este armazém usa do Prisma. Digitado para o teste poder trocá-lo
 *  por um dublê sem arrastar o cliente inteiro. */
export interface BancoDePendencias {
  pendenciaDeConsulta: {
    create(args: { data: Record<string, unknown> }): Promise<LinhaDaPendencia>;
    findUnique(args: { where: { protocolo: string } }): Promise<LinhaDaPendencia | null>;
    updateMany(args: {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    }): Promise<{ count: number }>;
    findMany(args: {
      where: Record<string, unknown>;
      orderBy?: Record<string, unknown>;
    }): Promise<LinhaDaPendencia[]>;
  };
}

export interface LinhaDaPendencia {
  protocolo: string;
  produto: string;
  conversa: string;
  canal: string;
  agente: string;
  fio: string | null;
  assunto: string;
  estado: string;
  avisadoEm: Date | null;
  respondidaEm: Date | null;
  criadaEm: Date;
}

/**
 * A coluna `estado` é TEXT (SQLite não tem enum), então o valor lido é
 * conferido contra a lista fechada em vez de sofrer um cast.
 *
 * ⚠️ E o desconhecido cai em `ENCERRADA`, **nunca** em `PENDENTE`: tratar uma
 * linha corrompida como pendente abriria a porta para entregar a resposta de um
 * gerente a partir de um estado que o produto não consegue mais explicar. O
 * fail-closed aqui custa uma pendência que não fecha; o fail-open custa uma
 * mensagem no cliente errado.
 */
function normalizarEstado(bruto: string): EstadoDaPendencia {
  return (ESTADOS_DA_PENDENCIA as readonly string[]).includes(bruto)
    ? (bruto as EstadoDaPendencia)
    : "ENCERRADA";
}

/**
 * ⭐ O ESTADO FINAL, e ele depende de DUAS coisas — a decisão C4 em código.
 *
 * `entregueAoCliente: false` NUNCA vira RESPONDIDA, por mais que o gerente
 * tenha respondido: a consulta ainda é assunto do cliente, porque o cliente não
 * recebeu nada. Ela vai para `AGUARDANDO_ENVIO`, que é fila humana pronta para
 * envio — e não existe "entregue" que signifique "alguém vai entregar depois".
 *
 * ⚠️ E `respondidaEm` só é carimbado quando o cliente RECEBEU. A coluna
 * responde "quando esta pessoa foi respondida", não "quando o gerente falou";
 * carimbá-la no recebimento faria o relatório da casa contar como atendido
 * alguém que continua esperando.
 */
function estadoFinal(decisao: DecisaoDoGerente, entregueAoCliente: boolean): EstadoDaPendencia {
  if (!entregueAoCliente) return "AGUARDANDO_ENVIO";
  return decisao === "respondida" ? "RESPONDIDA" : "ENCERRADA";
}

function daLinha(l: LinhaDaPendencia): Pendencia {
  return {
    protocolo: l.protocolo,
    produto: l.produto,
    conversa: l.conversa,
    canal: l.canal,
    agente: l.agente,
    fio: l.fio,
    assunto: l.assunto,
    estado: normalizarEstado(l.estado),
    avisadoEm: l.avisadoEm,
    respondidaEm: l.respondidaEm,
    criadaEm: l.criadaEm,
  };
}

export function armazemDePendenciasNoBanco(
  db: BancoDePendencias = prisma as unknown as BancoDePendencias,
): ArmazemDePendencias {
  return {
    async abrir(nova: PendenciaNova): Promise<Pendencia> {
      const linha = await db.pendenciaDeConsulta.create({
        data: {
          protocolo: nova.protocolo,
          produto: nova.produto,
          conversa: nova.conversa,
          canal: nova.canal,
          agente: nova.agente,
          fio: nova.fio,
          assunto: nova.assunto,
          estado: "PENDENTE",
          avisadoEm: nova.avisadoEm,
          criadaEm: nova.criadaEm,
        },
      });
      return daLinha(linha);
    },

    async porProtocolo(protocolo: string): Promise<Pendencia | null> {
      const linha = await db.pendenciaDeConsulta.findUnique({ where: { protocolo } });
      return linha ? daLinha(linha) : null;
    },

    async marcarAvisado(protocolo: string, em: Date): Promise<void> {
      // `avisadoEm: null` no `where`: o PRIMEIRO aviso é o que conta, e um
      // segundo não reescreve a data do primeiro — senão a janela do aviso
      // andaria para frente e o cliente ouviria a mesma frase de novo.
      await db.pendenciaDeConsulta.updateMany({
        where: { protocolo, avisadoEm: null },
        data: { avisadoEm: em },
      });
    },

    /**
     * ⭐ A decisão chegou (C4).
     *
     * Idempotente por construção: o `where` exige `estado: "PENDENTE"`, então um
     * segundo retorno do núcleo não sobrescreve o primeiro.
     *
     * `updateMany` e não `update` de propósito — `update` lançaria quando não
     * achasse a linha, e "já estava registrada" não é erro: é o núcleo
     * reentregando o que ele não teve certeza de ter entregue.
     */
    async registrarResposta(
      protocolo: string,
      dados: { decisao: DecisaoDoGerente; entregueAoCliente: boolean; em: Date },
    ): Promise<void> {
      await db.pendenciaDeConsulta.updateMany({
        where: { protocolo, estado: "PENDENTE" },
        data: {
          estado: estadoFinal(dados.decisao, dados.entregueAoCliente),
          // ⚠️ Só carimba quando o cliente RECEBEU. Ver `estadoFinal`.
          respondidaEm: dados.entregueAoCliente ? dados.em : null,
        },
      });
    },

    /**
     * As que continuam sendo assunto do cliente.
     *
     * ⚠️ Inclui `AGUARDANDO_ENVIO`: uma decisão que voltou e não chegou ao
     * cliente ainda é uma pessoa esperando. Filtrar só `PENDENTE` aqui faria a
     * casa parar de enxergar exatamente o caso que a C4 criou para não perder.
     */
    async abertasDaConversa(conversa: string): Promise<Pendencia[]> {
      const linhas = await db.pendenciaDeConsulta.findMany({
        where: { conversa, estado: { in: [...ESTADOS_NAO_RESOLVIDOS] } },
        orderBy: { criadaEm: "asc" },
      });
      return linhas.map(daLinha);
    },
  };
}
