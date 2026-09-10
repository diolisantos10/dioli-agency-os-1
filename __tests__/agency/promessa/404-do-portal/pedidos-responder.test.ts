// POST /api/portal/pedidos/responder — posse negada é 404, NUNCA 403.
//
// ═══════════════════════════════════════════════════════════════════════════
// O QUE ESTE ARQUIVO PROVA
// ═══════════════════════════════════════════════════════════════════════════
//
// `responderPergunta` (lib/agency/esteira/porta-da-pergunta.ts) já tinha o
// comentário certo — "'Não é seu' e 'não existe' saem iguais: a distinção já
// é o vazamento" — e o `codigo` contradizia o próprio comentário: 403.
// 403 confirma ao chamador que o pedidoId existe, virando oráculo de
// enumeração. Corrigido para 404, e esta rota (a única saída HTTP daquela
// função) devolve o mesmo `codigo` sem tradução.
//
// As DUAS metades: barra o caso plantado (outro dono → 404) e não acusa o
// caso limpo (dono legítimo → 200).

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const db = vi.hoisted(() => ({
  contentRequest: { findFirst: vi.fn(), update: vi.fn() },
  portalMessage: { create: vi.fn() },
  clientRequestDb: { update: vi.fn(), findMany: vi.fn() },
  $transaction: vi.fn(async (ops: unknown[]) => ops),
}));
const resolvePortalClient = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/client", () => ({ prisma: db }));
vi.mock("@/lib/agency/persistence/portal-access-service", () => ({ resolvePortalClient }));
vi.mock("@/lib/agency/persistence/portal-cookie", () => ({
  tokenDoPortal: (_r: unknown, q: string | null) => q,
}));
const conversa = vi.hoisted(() => ({ conversaDoCliente: vi.fn() }));
vi.mock("@/app/api/messages/conversa", () => conversa);
const esteira = vi.hoisted(() => ({ atenderPedido: vi.fn() }));
vi.mock("@/lib/agency/esteira/producao-de-pedido", () => esteira);

import { POST } from "@/app/api/portal/pedidos/responder/route";
import { serializarPergunta } from "@/lib/agency/esteira/porta-da-pergunta";

const PERGUNTA = serializarPergunta({
  pergunta: "Você pediu 1, e a minha tabela tem o pacote de 4. Como prefere?",
  opcoes: [{ id: "pacote", rotulo: "Pode ser o pacote de 4", quantidade: 4 }],
});

function req(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/portal/pedidos/responder", {
    method: "POST",
    body: JSON.stringify({ token: "tok-dono", pedidoId: "p1", opcaoId: "pacote", ...body }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  resolvePortalClient.mockResolvedValue({ clientId: "c1", workspaceId: "ws1" });
  db.contentRequest.update.mockResolvedValue({});
  db.portalMessage.create.mockResolvedValue({ id: "pm1" });
  conversa.conversaDoCliente.mockResolvedValue({ ancora: { clientId: "c1", clientRequestId: "cr1" } });
  esteira.atenderPedido.mockResolvedValue({ status: "triado", recado: "Fechado." });
});

describe("posse do pedido — 404, nunca 403", () => {
  it("🔴 pedido de OUTRO cliente: 404, e o corpo não diz que o id existe", async () => {
    // O `where` de `responderPergunta` já combina id + clientId do token — um
    // pedido de outro cliente nunca sai desta consulta.
    db.contentRequest.findFirst.mockResolvedValue(null);
    const r = await POST(req({ pedidoId: "p-de-outro-cliente" }));
    expect(r.status).toBe(404);
    const corpo = await r.json();
    expect(corpo.error).toBe("Pedido não encontrado");
  });

  it("pedidoId que nunca existiu: MESMO status, MESMO corpo do caso 'de outro cliente'", async () => {
    db.contentRequest.findFirst.mockResolvedValue(null);
    const r1 = await POST(req({ pedidoId: "existe-mas-e-de-outro" }));
    const r2 = await POST(req({ pedidoId: "nunca-existiu" }));
    expect(r1.status).toBe(r2.status);
    expect(await r1.json()).toEqual(await r2.json());
  });

  it("🟢 a metade que falta: o DONO legítimo continua respondendo (200)", async () => {
    db.contentRequest.findFirst.mockResolvedValue({
      id: "p1", status: "precisa_decisao", pendingQuestionJson: PERGUNTA,
      clientRequestId: "cr1", title: "1 story", taskId: null, projectId: null,
    });
    const r = await POST(req({ pedidoId: "p1" }));
    expect(r.status).toBe(200);
    const corpo = await r.json();
    expect(corpo.ok).toBe(true);
  });

  it("a consulta de posse é SEMPRE filtrada pelo cliente do token, nunca por um clientId do corpo", async () => {
    db.contentRequest.findFirst.mockResolvedValue({
      id: "p1", status: "precisa_decisao", pendingQuestionJson: PERGUNTA,
      clientRequestId: "cr1", title: "1 story", taskId: null, projectId: null,
    });
    await POST(req({ pedidoId: "p1" }));
    const where = db.contentRequest.findFirst.mock.calls[0]![0].where;
    expect(where.clientId).toBe("c1");
  });
});
