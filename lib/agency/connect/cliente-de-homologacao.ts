// O CLIENTE SINTÉTICO É RESOLVIDO AQUI DENTRO — o chamador não escolhe nenhum.
//
// ─── O PADRÃO Nº 2 DO RAIO-X DESTA CASA, E POR QUE ELE MORRE AQUI ───────────
//
// Até 30/08/2026 esta porta aceitava `clienteId` no corpo do pedido e escrevia
// aquele identificador direto na linha de `ExecucaoV2`. Ninguém conferia de
// quem era. É literalmente o "id aceito sem conferir de quem é" — o segundo
// padrão do raio-x desta casa, e a forma clássica do furo de referência direta:
// quem chama manda o id de um cliente REAL e a execução de homologação nasce
// grudada nele, no rastro, para sempre.
//
// Determinação do CEO (30/08/2026):
//
//   "Não aceite clienteId informado pelo chamador. Prefiro resolver
//    internamente: o que o chamador não escolhe, ele não força."
//
// Então é isto que este arquivo faz. O gateway vai ao banco e resolve, sozinho,
// QUAL é o cliente sintético de homologação. O corpo do pedido não tem mais
// campo nenhum de cliente — nem `clienteId`, nem `cliente`. Não existe entrada
// para forçar.
//
// ─── AS DUAS CONDIÇÕES SÃO CONFERIDAS NA LINHA QUE VOLTOU, NÃO NO PEDIDO ────
//
// A consulta filtra pelo domínio; as DUAS condições são reconferidas em código,
// aqui, sobre a linha que o banco devolveu:
//
//   1. o e-mail vive em `cliente-falso.invalid` — domínio reservado pela
//      RFC 2606 justamente para não existir. Nenhuma pessoa de verdade tem
//      endereço lá;
//   2. o nome carrega `[TESTE]` — o carimbo que a trava de saída da casa usa
//      para reconhecer dado fictício.
//
// Uma linha que falhe QUALQUER das duas não é candidata. E se nenhuma linha
// passar, a porta **não inventa cliente e não segue sem ele**: recusa com o
// motivo. Ambiente de homologação sem cliente de homologação plantado é
// ambiente não preparado — e seguir assim seria exatamente o "abre por
// omissão" que o guardrail 4 da casa proíbe.

import type { PrismaClient } from "@/lib/generated/prisma/client";
import {
  DOMINIO_DO_CLIENTE_FALSO,
  MARCA_DO_CLIENTE_FALSO,
} from "@/lib/agency/cliente-falso/trava-de-saida";

/** O cliente sintético como o gateway o resolveu — nunca como alguém o pediu. */
export interface ClienteDeHomologacao {
  id: string;
  nome: string;
  /** Como esta identidade foi obtida. Vai para a resposta, para quem lê saber. */
  resolvido_por: "gateway";
  /** As duas condições que a linha do banco cumpriu para ser aceita. */
  conferido: {
    carimbo: typeof MARCA_DO_CLIENTE_FALSO;
    dominio: typeof DOMINIO_DO_CLIENTE_FALSO;
  };
}

/**
 * Quantas linhas do domínio fictício entram na disputa. Teto explícito para a
 * consulta não varrer a tabela inteira num banco grande.
 */
export const CANDIDATOS_CONSIDERADOS = 50;

/** A linha mínima que a resolução precisa ler. */
export interface LinhaDeCliente {
  id: string;
  name: string;
  email: string | null;
}

/**
 * A escolha, separada da consulta para ter teste puro: entre as linhas do
 * domínio fictício, a primeira que cumpre AS DUAS condições. A ordem já vem
 * decidida pela consulta (mais recente primeiro), e a checagem é refeita aqui
 * porque "o banco filtrou" não é o mesmo que "eu conferi".
 */
export function escolherClienteDeHomologacao(linhas: LinhaDeCliente[]): ClienteDeHomologacao | null {
  for (const l of linhas) {
    const email = (l.email ?? "").trim().toLowerCase();
    if (!email.endsWith(`@${DOMINIO_DO_CLIENTE_FALSO}`) && !email.endsWith(`.${DOMINIO_DO_CLIENTE_FALSO}`)) continue;
    if (!l.name.includes(MARCA_DO_CLIENTE_FALSO)) continue;
    return {
      id: l.id,
      nome: l.name,
      resolvido_por: "gateway",
      conferido: { carimbo: MARCA_DO_CLIENTE_FALSO, dominio: DOMINIO_DO_CLIENTE_FALSO },
    };
  }
  return null;
}

/**
 * O motivo da recusa quando não há cliente sintético plantado. Exportado para o
 * teste cobrar a frase, e para a frase existir em um lugar só.
 */
export const MOTIVO_SEM_CLIENTE_SINTETICO =
  `nenhum cliente sintético de homologação existe neste banco: a porta procura uma linha de cliente com o ` +
  `carimbo ${MARCA_DO_CLIENTE_FALSO} no nome E e-mail no domínio ${DOMINIO_DO_CLIENTE_FALSO}, e não achou. ` +
  `Esta porta NÃO aceita cliente informado por quem chama e NÃO cria cliente: sem o cliente fictício plantado, ` +
  `o ambiente de homologação não está preparado e a porta permanece fechada.`;

/**
 * A resolução contra o banco. Ordem determinística: o cliente fictício mais
 * recente primeiro (é o que a rodada de homologação acabou de plantar), com o
 * id como desempate para duas linhas do mesmo instante nunca disputarem a vez.
 */
export async function resolverClienteDeHomologacao(
  db: PrismaClient,
): Promise<ClienteDeHomologacao | null> {
  const linhas = await db.client.findMany({
    where: { email: { endsWith: DOMINIO_DO_CLIENTE_FALSO } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: CANDIDATOS_CONSIDERADOS,
    select: { id: true, name: true, email: true },
  });
  return escolherClienteDeHomologacao(linhas);
}
