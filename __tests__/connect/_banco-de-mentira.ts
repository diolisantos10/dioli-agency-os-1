/**
 * Um banco de mentira que se comporta como o de verdade NAS QUATRO CHAMADAS que
 * o armazém do conector faz — e em mais nenhuma.
 *
 * ⚠️ Ele não é um `vi.fn()` que devolve o que o teste mandou. Ele guarda linhas
 * de verdade, aplica o `where` de verdade (inclusive `{ in: [...] }` e
 * `avisadoEm: null`) e conta as escritas. A diferença importa: um dublê que
 * sempre diz "sim" prova que a função foi chamada, não que ela está certa — e o
 * que se quer provar aqui é idempotência e estado, que só existem se o `where`
 * existir.
 *
 * ⭐ E `linhas` fica exposto de propósito: é ele que permite simular o RESTART.
 * O processo morre, o objeto do armazém some, as linhas continuam — e um
 * armazém novo montado sobre as mesmas linhas acha a mesma pendência. É a prova
 * de "o produto perde conexão e volta" sem precisar derrubar um container.
 */

import type { LinhaDaPendencia } from "@/lib/agency/connect/conector/dioli-digital/armazem";

export interface BancoDeMentira {
  linhas: LinhaDaPendencia[];
  mensagens: MensagemGravada[];
  pendenciaDeConsulta: {
    create(a: { data: Record<string, unknown> }): Promise<LinhaDaPendencia>;
    findUnique(a: { where: { protocolo: string } }): Promise<LinhaDaPendencia | null>;
    updateMany(a: { where: Record<string, unknown>; data: Record<string, unknown> }): Promise<{ count: number }>;
    findMany(a: { where: Record<string, unknown>; orderBy?: Record<string, unknown> }): Promise<LinhaDaPendencia[]>;
  };
  portalMessage: {
    create(a: { data: Record<string, unknown> }): Promise<{ id: string }>;
    update(a: { where: { id: string }; data: Record<string, unknown> }): Promise<{ id: string }>;
    findMany(a?: unknown): Promise<MensagemGravada[]>;
  };
  /** O caminho da IA, que roda quando o gatilho NÃO dispara. Está aqui para que
   *  o teste possa provar que a mensagem inocente continua indo para o PM — sem
   *  isso, "não travou" e "quebrou" ficariam indistinguíveis. */
  client: { findUnique(a: unknown): Promise<{ id: string; name: string; workspaceId: string } | null> };
  contentRequest: { findFirst(a: unknown): Promise<null> };
  $transaction(ops: unknown[]): Promise<unknown[]>;
}

export interface MensagemGravada {
  id: string;
  clientId: string | null;
  clientRequestId: string | null;
  authorRole: string;
  authorName: string;
  body: string;
  readByTeam: boolean;
  readByClient: boolean;
  createdAt: Date;
}

/** O `where` do Prisma, no pedacinho que este conector usa. */
function casa(linha: Record<string, unknown>, where: Record<string, unknown>): boolean {
  return Object.entries(where).every(([campo, esperado]) => {
    const valor = linha[campo];
    if (esperado && typeof esperado === "object" && "in" in (esperado as Record<string, unknown>)) {
      return ((esperado as { in: unknown[] }).in).includes(valor);
    }
    return valor === esperado;
  });
}

export function bancoDeMentira(linhasIniciais: LinhaDaPendencia[] = []): BancoDeMentira {
  const linhas: LinhaDaPendencia[] = [...linhasIniciais];
  const mensagens: MensagemGravada[] = [];
  let seq = 0;

  return {
    linhas,
    mensagens,
    pendenciaDeConsulta: {
      async create({ data }) {
        // O `protocolo` é PRIMARY KEY: gravar duas vezes é erro, como no banco.
        if (linhas.some((l) => l.protocolo === data.protocolo)) {
          throw new Error("UNIQUE constraint failed: PendenciaDeConsulta.protocolo");
        }
        const linha: LinhaDaPendencia = {
          protocolo: String(data.protocolo),
          produto: String(data.produto),
          conversa: String(data.conversa),
          canal: String(data.canal),
          agente: String(data.agente),
          fio: (data.fio as string | null) ?? null,
          assunto: String(data.assunto),
          estado: String(data.estado ?? "PENDENTE"),
          avisadoEm: (data.avisadoEm as Date | null) ?? null,
          respondidaEm: null,
          criadaEm: (data.criadaEm as Date) ?? new Date(),
        };
        linhas.push(linha);
        return { ...linha };
      },
      async findUnique({ where }) {
        const l = linhas.find((x) => x.protocolo === where.protocolo);
        return l ? { ...l } : null;
      },
      async updateMany({ where, data }) {
        let count = 0;
        for (const l of linhas) {
          if (!casa(l as unknown as Record<string, unknown>, where)) continue;
          Object.assign(l, data);
          count += 1;
        }
        return { count };
      },
      async findMany({ where }) {
        return linhas
          .filter((l) => casa(l as unknown as Record<string, unknown>, where))
          .map((l) => ({ ...l }))
          .sort((a, b) => a.criadaEm.getTime() - b.criadaEm.getTime());
      },
    },
    portalMessage: {
      async create({ data }) {
        seq += 1;
        const m: MensagemGravada = {
          id: `msg-${seq}`,
          clientId: (data.clientId as string | null) ?? null,
          clientRequestId: (data.clientRequestId as string | null) ?? null,
          authorRole: String(data.authorRole),
          authorName: String(data.authorName),
          body: String(data.body),
          readByTeam: data.readByTeam === true,
          readByClient: data.readByClient === true,
          createdAt: (data.createdAt as Date) ?? new Date(),
        };
        mensagens.push(m);
        return { id: m.id };
      },
      async update({ where, data }) {
        const m = mensagens.find((x) => x.id === where.id);
        if (m) Object.assign(m, data);
        return { id: where.id };
      },
      async findMany() {
        return mensagens.map((m) => ({ ...m }));
      },
    },
    client: {
      async findUnique() {
        return { id: "cliente", name: "Cliente de Teste", workspaceId: "ws-1" };
      },
    },
    contentRequest: {
      async findFirst() {
        return null;
      },
    },
    /** O Prisma executa as promessas da lista; o dublê faz o mesmo. As chamadas
     *  já foram disparadas na montagem do array, então basta esperá-las. */
    async $transaction(ops: unknown[]) {
      return Promise.all(ops as Promise<unknown>[]);
    },
  };
}
