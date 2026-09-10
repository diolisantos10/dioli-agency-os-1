// A CONVERSA PERTENCE AO CLIENTE — as duas metades.
//
// O defeito de origem: `PortalMessage.clientRequestId` era obrigatório e a
// thread era ancorada SÓ nele. Cliente criado direto pela agência (Foocci) não
// tem `ClientRequestDb` — a rota devolvia 404, a bolha voltava para a caixa e a
// tela dizia "Não foi possível enviar. Tente novamente." para sempre.
//
// Este arquivo anda a corrente inteira, e anda as duas metades de cada coisa:
//   • cliente COM solicitação e cliente DIRETO conseguem enviar;
//   • a leitura filtra SÓ por `clientId` — a união com `clientRequestId`
//     morreu (furo 1, 15/08/2026): era ela que deixava vazar, para o dono
//     NOVO de uma solicitação re-apontada, a conversa do dono ANTIGO;
//   • mensagem de um cliente NUNCA entra no filtro de outro;
//   • o lado da equipe abre por clientId, e workspace alheio não abre;
//   • acesso sem dono nenhum não é mais 404 mudo: é 409 explicado, e a tela
//     desliga a caixa de texto em vez de prometer reenvio eterno.

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const db = vi.hoisted(() => ({
  portalMessage: { create: vi.fn(), findMany: vi.fn(), updateMany: vi.fn() },
  clientRequestDb: { findFirst: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() },
  client: { findFirst: vi.fn() },
}));
const validatePortalAccess = vi.hoisted(() => vi.fn());
const requireSession = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/client", () => ({ prisma: db }));
vi.mock("@/lib/agency/persistence/portal-access-service", () => ({ validatePortalAccess }));
vi.mock("@/lib/auth/api-guard", () => ({ requireSession }));

import { POST, GET } from "@/app/api/portal/messages/route";
import { conversaDoCliente, conversaDaSolicitacao } from "@/app/api/messages/conversa";

const AGORA = new Date("2026-08-05T10:00:00Z");

function post(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/portal/messages", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
function get(query = ""): NextRequest {
  return new NextRequest(`http://localhost/api/portal/messages${query}`);
}

beforeEach(() => {
  vi.clearAllMocks();
  db.portalMessage.create.mockResolvedValue({
    id: "m1", authorRole: "client", authorName: "Foocci", body: "oi", createdAt: AGORA,
  });
  db.portalMessage.findMany.mockResolvedValue([]);
  db.portalMessage.updateMany.mockResolvedValue({ count: 0 });
  db.clientRequestDb.findMany.mockResolvedValue([]);
  requireSession.mockResolvedValue({ session: { name: "PM", workspaceId: "ws1", role: "master" }, error: null });
});

// ── METADE 1: o cliente DIRETO (o caso Foocci) ───────────────────────────────
describe("cliente criado DIRETO, sem solicitação de briefing", () => {
  beforeEach(() => {
    validatePortalAccess.mockResolvedValue({ valid: true, record: { clientId: "cli-foocci", clientRequestId: null } });
    db.clientRequestDb.findMany.mockResolvedValue([]); // ele não tem nenhuma
  });

  it("CONSEGUE enviar — era exatamente isto que devolvia 404", async () => {
    const res = await POST(post({ token: "tok", body: "Quero falar com vocês" }));
    expect(res.status).toBe(201);
    const data = db.portalMessage.create.mock.calls[0]![0].data;
    expect(data.clientId).toBe("cli-foocci");
    expect(data.clientRequestId).toBeNull();
    expect(data.readByTeam).toBe(false); // acende o badge da agência
  });

  it("a leitura filtra só por clientId — sem chave de solicitação sobrando", async () => {
    await GET(get("?token=tok"));
    expect(db.portalMessage.findMany.mock.calls[0]![0].where).toEqual({ clientId: "cli-foocci" });
  });
});

// ── METADE 2: o cliente que veio do briefing ─────────────────────────────────
describe("cliente COM solicitação", () => {
  beforeEach(() => {
    validatePortalAccess.mockResolvedValue({ valid: true, record: { clientId: "cli1", clientRequestId: "cr1" } });
    db.clientRequestDb.findMany.mockResolvedValue([{ id: "cr1" }, { id: "cr0" }]);
  });

  it("envia carimbando AS DUAS chaves — a conversa não se parte quando o cliente ganha solicitação", async () => {
    const res = await POST(post({ token: "tok", body: "oi" }));
    expect(res.status).toBe(201);
    const data = db.portalMessage.create.mock.calls[0]![0].data;
    expect(data.clientId).toBe("cli1");
    expect(data.clientRequestId).toBe("cr1");
  });

  // ⚠️ FURO 1 (conserto portado de origin/fix/portal-conversa-de-outro-cliente,
  // 15/08/2026): a leitura NÃO une mais as duas chaves. A união pelo lado da
  // solicitação era o que deixava vazar, para o dono NOVO de uma solicitação
  // re-apontada, a conversa do dono ANTIGO — ver `montarFiltro` em
  // `app/api/messages/conversa.ts` e
  // `__tests__/consertos-presos/conversa-nao-vaza-entre-clientes.test.ts`.
  it("a leitura filtra só por clientId — a união por clientRequestId morreu de propósito", async () => {
    await GET(get("?token=tok"));
    expect(db.portalMessage.findMany.mock.calls[0]![0].where).toEqual({ clientId: "cli1" });
  });

  it("ao abrir, marca como lidas as mensagens da EQUIPE — no mesmo filtro cercado", async () => {
    await GET(get("?token=tok"));
    const where = db.portalMessage.updateMany.mock.calls[0]![0].where;
    expect(where.authorRole).toBe("team");
    expect(where.readByClient).toBe(false);
    expect(where.clientId).toBe("cli1");
    expect(JSON.stringify(where)).not.toContain("clientRequestId");
  });
});

// ── A TRAVA: nunca o cliente errado ──────────────────────────────────────────
describe("isolamento entre clientes", () => {
  it("solicitação de OUTRO cliente apontada pelo token não vira âncora", async () => {
    // O token diz clientId=cli1 e clientRequestId=cr-de-outro. As solicitações
    // de cli1 são cr1/cr0 — a preferida é descartada por não ser dele.
    validatePortalAccess.mockResolvedValue({ valid: true, record: { clientId: "cli1", clientRequestId: "cr-de-outro" } });
    db.clientRequestDb.findMany.mockResolvedValue([{ id: "cr1" }, { id: "cr0" }]);

    await POST(post({ token: "tok", body: "oi" }));
    const data = db.portalMessage.create.mock.calls[0]![0].data;
    expect(data.clientRequestId).toBe("cr1");
    expect(data.clientRequestId).not.toBe("cr-de-outro");
  });

  it("prospect (solicitação SEM cliente) fica preso à própria solicitação — nunca a um clientId nulo solto", async () => {
    db.clientRequestDb.findUnique.mockResolvedValue({ id: "cr-prospect", clientId: null });
    const prospect = await conversaDaSolicitacao("cr-prospect");
    // ⚠️ Furo 1: o ramo do prospect ganhou cerca. `{ clientId: null }` como
    // CHAVE SOLTA casaria com toda mensagem órfã do banco — vazamento entre
    // clientes. Como EXIGÊNCIA dentro de um `AND`, ao lado da solicitação, ele
    // restringe: só volta o que ainda não tem dono nenhum.
    expect(prospect.filtro).toEqual({
      AND: [{ clientRequestId: { in: ["cr-prospect"] } }, { clientId: null }],
    });
    expect(prospect.ancora).toEqual({ clientId: null, clientRequestId: "cr-prospect" });
    expect(prospect.filtro).not.toEqual({ clientId: null });
  });

  it("cliente sem nada (nem solicitação, nem id) tem filtro NULO — não lê o banco inteiro", async () => {
    db.clientRequestDb.findUnique.mockResolvedValue(null);
    const vazia = await conversaDaSolicitacao("nao-existe");
    expect(vazia.filtro).toBeNull();
  });
});

// ── O lado da EQUIPE ────────────────────────────────────────────────────────
describe("a equipe abre a conversa", () => {
  it("por clientId — o caminho que serve o cliente direto", async () => {
    db.client.findFirst.mockResolvedValue({ id: "cli-foocci" });
    db.clientRequestDb.findMany.mockResolvedValue([]);
    const res = await GET(get("?clientId=cli-foocci"));
    expect(res.status).toBe(200);
    expect(db.portalMessage.findMany.mock.calls[0]![0].where).toEqual({ clientId: "cli-foocci" });
    // Ao ver, as mensagens do CLIENTE ficam lidas para a equipe — é o que
    // apaga o badge da caixa de entrada.
    expect(db.portalMessage.updateMany.mock.calls[0]![0].where.readByTeam).toBe(false);
  });

  it("estar logado NÃO é ser dono: cliente de outro workspace → 404", async () => {
    db.client.findFirst.mockResolvedValue(null);
    const res = await GET(get("?clientId=cli-alheio"));
    expect(res.status).toBe(404);
    expect(db.portalMessage.findMany).not.toHaveBeenCalled();
  });

  it("sem sessão → 401, e nada é lido", async () => {
    requireSession.mockResolvedValue({
      session: null,
      error: new Response(null, { status: 401 }) as unknown as Response,
    });
    const res = await GET(get("?clientId=cli1"));
    expect(res.status).toBe(401);
  });

  it("a mensagem da equipe nasce readByClient=false — o cliente precisa VER que respondemos", async () => {
    db.client.findFirst.mockResolvedValue({ id: "cli1" });
    db.clientRequestDb.findMany.mockResolvedValue([{ id: "cr1" }]);
    await POST(post({ clientId: "cli1", body: "respondendo" }));
    const data = db.portalMessage.create.mock.calls[0]![0].data;
    expect(data.authorRole).toBe("team");
    expect(data.authorName).toBe("PM");
    expect(data.readByTeam).toBe(true);
    expect(data.readByClient).toBe(false);
  });
});

// ── Acesso sem dono: o erro deixa de ser mudo ────────────────────────────────
describe("token válido que não aponta para ninguém", () => {
  beforeEach(() => {
    validatePortalAccess.mockResolvedValue({ valid: true, record: { clientId: null, clientRequestId: null } });
  });

  it("GET diz que a conversa não pode receber mensagem (podeEnviar=false)", async () => {
    const res = await GET(get("?token=tok"));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.podeEnviar).toBe(false);
    expect(json.motivo).toBe("sem-dono");
  });

  it("POST devolve 409 com instrução — não o 404 genérico que travava o CEO", async () => {
    const res = await POST(post({ token: "tok", body: "oi" }));
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toMatch(/link novo/i);
    expect(db.portalMessage.create).not.toHaveBeenCalled();
  });
});

// ── A âncora, isolada ───────────────────────────────────────────────────────
describe("conversaDoCliente", () => {
  it("prefere a solicitação mais recente quando não há preferência", async () => {
    db.clientRequestDb.findMany.mockResolvedValue([{ id: "cr-novo" }, { id: "cr-velho" }]);
    const c = await conversaDoCliente("cli1");
    expect(c.ancora).toEqual({ clientId: "cli1", clientRequestId: "cr-novo" });
    expect(c.clientRequestIds).toEqual(["cr-novo", "cr-velho"]);
  });
});
