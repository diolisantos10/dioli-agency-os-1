// O ATRASO FABRICADO — como o piloto tem um caso atrasado sem tocar dado real.
//
// ─── O QUE ISTO FABRICA, E ONDE ────────────────────────────────────────────
//
// O caso-piloto é "um atendimento fictício atrasado". Nada aqui é simulado no
// papel: são LINHAS DE VERDADE nas tabelas de verdade — um `HandoffV2`
// entregue há mais de 4 horas e nunca aceito, e uma `Task` sem dono num estado
// canônico cujo prazo já estourou. Depois de plantadas, elas são LIDAS de volta
// e passadas pela varredura REAL do PM (`varrerOQueEstaParado`), a mesma que o
// despertador da casa chama. O dossiê que sobe ao Gerente do SDR é a saída
// dessa varredura, não um texto escrito à mão.
//
// ─── AS TRÊS GARANTIAS DE QUE NÃO TOCA DADO REAL ───────────────────────────
//
// 1. **O carimbo é condição de execução.** O nome do cliente precisa carregar
//    `[TESTE]` (`MARCA_DO_CLIENTE_FALSO`) e o e-mail precisa terminar no
//    domínio `.invalid` do cliente falso — reservado pela RFC 2606 justamente
//    para não existir. Sem os dois, esta função LANÇA antes de escrever uma
//    linha. É a mesma dupla de cadeados que `trava-de-saida.ts` usa.
// 2. **`sintetico: true` é argumento obrigatório e literal.** Não há padrão.
// 3. **O banco é de quem chama.** Esta função recebe o `PrismaClient` — ela
//    não importa o singleton da casa. Nos testes ele aponta para um SQLite
//    descartável em `/tmp`; nada aqui sabe abrir o banco de produção sozinho.
//
// E ela não manda nada para lugar nenhum: não chama e-mail, WhatsApp,
// publicação nem avaliação. As portas de saída da casa nem são importadas
// aqui — o que não se importa não se chama por engano.

import {
  DOMINIO_DO_CLIENTE_FALSO,
  MARCA_DO_CLIENTE_FALSO,
} from "@/lib/agency/cliente-falso/trava-de-saida";
import type { PrismaClient } from "@/lib/generated/prisma/client";
import {
  varrerOQueEstaParado,
  HORAS_ATE_COBRAR_HANDOFF,
  type Cobranca,
  type HandoffPendente,
  type TrabalhoMonitorado,
} from "@/lib/agency/pm/varredura";

/** O cliente fictício do piloto — o mesmo nome do roteiro do cliente falso. */
export const CLIENTE_DO_PILOTO = `Cantina da Prova ${MARCA_DO_CLIENTE_FALSO}`;

/**
 * O estado canônico do trabalho plantado e o prazo dele.
 * `production` tem régua de 72h em `SLA_POR_ESTADO_HORAS` — escolher um estado
 * COM régua é de propósito: estado sem régua sai da varredura como achado
 * ("estadosSemRegua"), não como cobrança, e o piloto precisa da cobrança.
 */
export const ESTADO_DO_TRABALHO_PLANTADO = "production";

/** Há quantas horas o bastão foi entregue e ninguém pegou. */
export const HORAS_DO_HANDOFF_PARADO = HORAS_ATE_COBRAR_HANDOFF + 1;

/** Há quantas horas o trabalho não se mexe (régua de `production` é 72h). */
export const HORAS_DO_TRABALHO_PARADO = 96;

export interface AtrasoFabricado {
  workspaceId: string;
  clienteId: string;
  clienteNome: string;
  projetoId: string;
  tarefaId: string;
  handoffId: string;
  cobrancas: Cobranca[];
  /** O que o dossiê diz em uma frase — para o pedido que sobe ao gerente. */
  demanda: string;
}

export interface OpcoesDoAtraso {
  db: PrismaClient;
  agora: Date;
  /** Literal `true`. Sem padrão: fabricar dado exige dizer que é sintético. */
  sintetico: boolean;
  /** Nome do cliente fictício. Tem que carregar o carimbo. */
  cliente?: string;
}

/**
 * Planta o atraso e devolve o dossiê já apurado pela varredura de verdade.
 *
 * Lança — não devolve recusa — quando as condições de segurança não valem:
 * quem chama isto errado precisa parar, não continuar com um resultado vazio.
 */
export async function fabricarAtrasoDoClienteFalso(opcoes: OpcoesDoAtraso): Promise<AtrasoFabricado> {
  if (opcoes.sintetico !== true) {
    throw new Error("fabricarAtrasoDoClienteFalso exige sintetico: true — não existe fabricação de dado 'real'");
  }
  const nome = opcoes.cliente ?? CLIENTE_DO_PILOTO;
  if (!nome.includes(MARCA_DO_CLIENTE_FALSO)) {
    throw new Error(
      `cliente "${nome}" sem o carimbo ${MARCA_DO_CLIENTE_FALSO} — o fabricador de atraso só escreve sobre cliente fictício`,
    );
  }

  const { db, agora } = opcoes;
  const email = `contato@${DOMINIO_DO_CLIENTE_FALSO}`;

  const workspace = await db.agencyWorkspace.create({
    data: { name: `Homologação Connect ${MARCA_DO_CLIENTE_FALSO}`, slug: `connect-homolog-${Date.now()}` },
    select: { id: true },
  });
  const cliente = await db.client.create({
    data: { workspaceId: workspace.id, name: nome, email },
    select: { id: true },
  });

  const paradoDesde = new Date(agora.getTime() - HORAS_DO_TRABALHO_PARADO * 3_600_000);
  const projeto = await db.project.create({
    data: {
      workspaceId: workspace.id,
      clientId: cliente.id,
      name: `Atendimento atrasado ${MARCA_DO_CLIENTE_FALSO}`,
      estadoCanonico: ESTADO_DO_TRABALHO_PLANTADO,
    },
    select: { id: true },
  });
  // A tarefa nasce SEM dono e com prazo no passado — os dois defeitos que o
  // portão do PM reprova e que a varredura classifica como "sem_dono".
  const prazoVencido = new Date(agora.getTime() - 48 * 3_600_000).toISOString().slice(0, 10);
  const tarefa = await db.task.create({
    data: {
      projectId: projeto.id,
      title: `Responder o atendimento do cliente ${MARCA_DO_CLIENTE_FALSO}`,
      estadoCanonico: ESTADO_DO_TRABALHO_PLANTADO,
      agentId: null,
      dueDate: prazoVencido,
      updatedAt: paradoDesde,
    },
    select: { id: true },
  });

  const handoff = await db.handoffV2.create({
    data: {
      deDepartamento: "project-management",
      paraDepartamento: "client-service-sdr",
      responsavelEntrega: "pm-orchestrator",
      entrada: `Atendimento do cliente ${nome} aguardando retorno`,
      saida: `Pedido de retorno consolidado ${MARCA_DO_CLIENTE_FALSO}`,
      versaoArtefato: "v1",
      criterios: "responder ao cliente com situação, motivo, próxima ação e prazo",
      correlationId: `connect-homologacao:${cliente.id}`,
      status: "aguardando_recebimento",
      criadoEm: new Date(agora.getTime() - HORAS_DO_HANDOFF_PARADO * 3_600_000),
    },
    select: { id: true },
  });

  // ── A LEITURA DE VOLTA: a varredura julga o que está NO BANCO ────────────
  const handoffs: HandoffPendente[] = (
    await db.handoffV2.findMany({ where: { status: "aguardando_recebimento" } })
  ).map((h) => ({
    id: h.id,
    deDepartamento: h.deDepartamento,
    paraDepartamento: h.paraDepartamento,
    responsavelEntrega: h.responsavelEntrega,
    criadoEm: h.criadoEm,
    cobradoEm: h.cobradoEm,
  }));

  const trabalhos: TrabalhoMonitorado[] = (
    await db.task.findMany({ where: { projectId: projeto.id } })
  ).map((t) => ({
    id: t.id,
    entidadeTipo: "task",
    estadoCanonico: t.estadoCanonico,
    atualizadoEm: t.updatedAt,
    donoDepartamento: t.agentId ? "client-service-sdr" : null,
  }));

  const varredura = varrerOQueEstaParado({ handoffs, trabalhos }, agora);

  return {
    workspaceId: workspace.id,
    clienteId: cliente.id,
    clienteNome: nome,
    projetoId: projeto.id,
    tarefaId: tarefa.id,
    handoffId: handoff.id,
    cobrancas: varredura.cobrancas,
    demanda:
      `Objetivo: destravar o atendimento de ${nome}. ` +
      `Critério de aceite: devolver situação, motivo, próxima ação e prazo ao Gerente Geral. ` +
      `Prazo: hoje. Apurado pela varredura do PM: ${varredura.totalParado} ponto(s) parado(s).`,
  };
}
