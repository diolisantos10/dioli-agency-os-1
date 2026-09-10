// POSSE — as cinco rotas de PAGAMENTO e PARCERIA que aceitavam um id sem
// provar que ele era do requisitante (varredura de 29/08/2026).
//
// A regra da casa em uma frase: **estar logado não é ser dono**. As cinco
// rotas conferiam sessão de agência e nada mais. O id vinha do corpo ou da
// query, e o id é GLOBAL — então a segunda pergunta nunca é opcional.
//
// ⚠️ ESTE CONSERTO NÃO FOI APLICADO EM PRODUÇÃO. Ele mexe em pagamento e em
// parceria (SEGURANÇA §3/§8 desta casa), e exige autorização explícita do
// CEO antes do merge — ver `docs/diagnosticos/os-cinco-consertos-que-esperam-palavra.md`.
// Este arquivo prova que o conserto FUNCIONA, para que a distância entre a
// palavra do CEO e a proteção no ar seja de minutos, não de uma rodada de
// trabalho.
//
// O que cada uma deixava acontecer, com um id copiado da tela do vizinho:
//   • `POST /api/agency/parcerias`            — autorizar parceria PARA O
//     CLIENTE DE OUTRA AGÊNCIA (isenta a produção dele de graça);
//   • `DELETE /api/agency/parcerias`          — revogar a parceria de um
//     cliente de outra agência (nega serviço ao parceiro alheio);
//   • `POST /api/agency/convites-de-parceria` — cunhar, para um cliente
//     alheio, um TOKEN que dispensa a pergunta de verba no briefing dele;
//   • `POST /api/admin/isencoes-de-parceria`  — conceder isenção de
//     pagamento a um PEDIDO de outra agência (produção de graça no crédito
//     alheio);
//   • `POST /api/admin/pagamentos`            — registrar, num PEDIDO de
//     outra agência, que um Pix entrou — testemunha falsa que libera a
//     esteira de um projeto que não é seu.
//
// AS DUAS METADES, em toda rota: o id do VIZINHO é barrado, 404, e NADA é
// escrito (a função de biblioteca nem é chamada); o id PRÓPRIO passa sem
// atrito, com os MESMOS argumentos de hoje.

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const db = vi.hoisted(() => ({
  client: { findFirst: vi.fn() },
  agencyWorkspace: { findMany: vi.fn() },
  clientRequestDb: { findFirst: vi.fn() },
}));

const getSession = vi.hoisted(() => vi.fn());

// ⚠️ Todo mock abaixo declara o PARÂMETRO, não só o retorno: sem isso o
// TypeScript infere `[]` (tupla vazia) para `mock.calls`, e
// `mock.calls[0]![0]` vira TS2493 — verde no vitest, vermelho no `tsc` do CI
// (o mesmo defeito que já barrou três PRs desta casa).
const autorizarParceriaDoCliente = vi.hoisted(() =>
  vi.fn(
    async (
      _pedido: Record<string, unknown>,
    ): Promise<{
      ok: boolean;
      id?: string;
      clientId?: string;
      validaAte?: Date;
      jaExistia?: boolean;
      recusa?: string;
      motivo?: string;
    }> => ({ ok: true, id: "auto-1", clientId: "cli-A", validaAte: new Date("2027-01-01"), jaExistia: false }),
  ),
);
const revogarParceriaDoCliente = vi.hoisted(() =>
  vi.fn(async (_clientId: string): Promise<boolean> => true),
);

const cunharConviteDeParceria = vi.hoisted(() =>
  vi.fn(
    async (
      _pedido: Record<string, unknown>,
    ): Promise<{
      ok: boolean;
      token?: string;
      expiraEm?: Date;
      clientId?: string;
      recusa?: string;
      motivo?: string;
    }> => ({ ok: true, token: "tok-1", expiraEm: new Date("2026-12-01"), clientId: "cli-A" }),
  ),
);
const revogarConviteDeParceria = vi.hoisted(() =>
  vi.fn(async (_token: string): Promise<boolean> => true),
);

const concederIsencaoDeParceria = vi.hoisted(() =>
  vi.fn(
    async (
      _pedido: Record<string, unknown>,
    ): Promise<{
      ok: boolean;
      id?: string;
      validaAte?: Date;
      jaExistia?: boolean;
      recusa?: string;
      motivo?: string;
    }> => ({ ok: true, id: "isen-1", validaAte: new Date("2027-01-01"), jaExistia: false }),
  ),
);

const registrarPagamento = vi.hoisted(() =>
  vi.fn(
    async (_entrada: Record<string, unknown>): Promise<{ ok: boolean; motivo?: string }> => ({ ok: true }),
  ),
);

vi.mock("@/lib/db/client", () => ({ prisma: db }));
vi.mock("@/lib/auth/session", () => ({
  getSession,
  isAgencyRole: (role: string) => role === "master",
}));
vi.mock("@/lib/agency/financeiro/parceria-do-parceiro", () => ({
  autorizarParceriaDoCliente,
  revogarParceriaDoCliente,
}));
vi.mock("@/lib/agency/comercial/convite-de-parceria", () => ({
  cunharConviteDeParceria,
  revogarConviteDeParceria,
}));
vi.mock("@/lib/agency/financeiro/conceder-isencao", () => ({
  concederIsencaoDeParceria,
}));
vi.mock("@/lib/agency/financeiro/portao-de-pagamento", () => ({
  registrarPagamento,
}));

import { POST as autorizarParceria, DELETE as revogarParceria } from "@/app/api/agency/parcerias/route";
import { POST as cunharConvite } from "@/app/api/agency/convites-de-parceria/route";
import { POST as concederIsencao } from "@/app/api/admin/isencoes-de-parceria/route";
import { POST as registrarPagamentoRota } from "@/app/api/admin/pagamentos/route";

/** O banco de dois inquilinos de CLIENTE. O mock HONRA o `where` — se a rota
 *  esquecer o `workspaceId`, ele devolve a linha e o teste passa; por isso ele
 *  filtra, como o Prisma faria. Sem isso o teste provaria o mock, não a trava. */
function bancoDeClientes() {
  const clientes: Record<string, string> = { "cli-A": "ws-A", "cli-B": "ws-B" };
  db.client.findFirst.mockImplementation(
    ({ where }: { where: { id: string; workspaceId?: string } }) => {
      const dono = clientes[where.id];
      if (!dono) return Promise.resolve(null);
      if (where.workspaceId && where.workspaceId !== dono) return Promise.resolve(null);
      return Promise.resolve({ id: where.id });
    },
  );
}

/** O banco de dois inquilinos de SOLICITAÇÃO (`clientRequestId`), honrando o
 *  `OR: [{ workspaceId }, { workspaceId: null }]` que `posseDaSolicitacao`
 *  usa — a mesma política das outras rotas desta casa, não uma nova. */
function bancoDeSolicitacoes() {
  const solicitacoes: Record<string, { workspaceId: string | null; clientId: string | null }> = {
    "cr-A": { workspaceId: "ws-A", clientId: null },
    "cr-B": { workspaceId: "ws-B", clientId: null },
  };
  db.clientRequestDb.findFirst.mockImplementation(
    ({
      where,
    }: {
      where: { id: string; OR?: Array<{ workspaceId: string | null }> };
    }) => {
      const cr = solicitacoes[where.id];
      if (!cr) return Promise.resolve(null);
      if (where.OR) {
        const chamadorWs = where.OR.find((o) => o.workspaceId !== null)?.workspaceId ?? null;
        const bate = cr.workspaceId === chamadorWs || cr.workspaceId === null;
        return Promise.resolve(bate ? { id: where.id, workspaceId: cr.workspaceId, clientId: cr.clientId } : null);
      }
      // A segunda consulta (sem OR) só confere EXISTÊNCIA, para distinguir
      // "alheia" de "inexistente" — ver `posse-de-workspace.ts`.
      return Promise.resolve({ id: where.id });
    },
  );
}

function post(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json", "sec-fetch-site": "same-origin" },
    body: JSON.stringify(body),
  });
}

function del(url: string): NextRequest {
  return new NextRequest(url, { method: "DELETE", headers: { "sec-fetch-site": "same-origin" } });
}

beforeEach(() => {
  vi.clearAllMocks();
  getSession.mockResolvedValue({
    userId: "u1", email: "master@a.com", name: "M", role: "master", workspaceId: "ws-A",
  });
  bancoDeClientes();
  bancoDeSolicitacoes();
  // Duas agências na base: nenhuma órfã pode ser adivinhada (fail-closed) —
  // não é exercitado por estes testes (nenhuma solicitação aqui é órfã), mas
  // é o estado real desta casa e o que a ficha pede.
  db.agencyWorkspace.findMany.mockResolvedValue([{ id: "ws-A" }, { id: "ws-B" }]);

  autorizarParceriaDoCliente.mockResolvedValue({
    ok: true, id: "auto-1", clientId: "cli-A", validaAte: new Date("2027-01-01"), jaExistia: false,
  });
  revogarParceriaDoCliente.mockResolvedValue(true);
  cunharConviteDeParceria.mockResolvedValue({
    ok: true, token: "tok-1", expiraEm: new Date("2026-12-01"), clientId: "cli-A",
  });
  concederIsencaoDeParceria.mockResolvedValue({
    ok: true, id: "isen-1", validaAte: new Date("2027-01-01"), jaExistia: false,
  });
  registrarPagamento.mockResolvedValue({ ok: true });
});

// ── 1. POST /api/agency/parcerias ────────────────────────────────────────────
//
// ANTES: qualquer master de QUALQUER agência autorizava parceria — e portanto
// isentava de pagamento — o `clientId` de OUTRA agência, só copiando o id da
// tela. `autorizarParceriaDoCliente` nunca conferia de quem era o cliente.

describe("POST /api/agency/parcerias — clientId do vizinho não autoriza mais parceria alheia", () => {
  const url = "http://localhost/api/agency/parcerias";
  const corpo = {
    clientId: "cli-B",
    autorizadaPor: "CEO",
    validaAte: "2027-01-01",
    escopo: "tudo",
    pecasContratadas: 10,
    tetoDeIaCentavosUsd: 500,
  };

  it("clientId do VIZINHO: 404 e autorizarParceriaDoCliente NUNCA é chamada", async () => {
    const res = await autorizarParceria(post(url, corpo));
    expect(res.status).toBe(404);
    expect(autorizarParceriaDoCliente).not.toHaveBeenCalled();
  });

  it("A OUTRA METADE: clientId PRÓPRIO passa, com os MESMOS argumentos de hoje", async () => {
    const res = await autorizarParceria(post(url, { ...corpo, clientId: "cli-A" }));
    expect(res.status).toBe(200);
    expect(autorizarParceriaDoCliente).toHaveBeenCalledOnce();
    expect(autorizarParceriaDoCliente.mock.calls[0]![0]).toMatchObject({
      clientId: "cli-A",
      autorizadaPor: "CEO",
      validaAte: "2027-01-01",
      escopo: "tudo",
      pecasContratadas: 10,
      tetoDeIaCentavosUsd: 500,
      registradaPor: "u1",
    });
  });
});

// ── 2. DELETE /api/agency/parcerias ──────────────────────────────────────────
//
// ANTES: qualquer master de QUALQUER agência revogava a parceria de um
// cliente alheio — negando o serviço a um parceiro que não é seu.

describe("DELETE /api/agency/parcerias — clientId do vizinho não revoga mais parceria alheia", () => {
  it("clientId do VIZINHO: 404 e revogarParceriaDoCliente NUNCA é chamada", async () => {
    const res = await revogarParceria(del("http://localhost/api/agency/parcerias?clientId=cli-B"));
    expect(res.status).toBe(404);
    expect(revogarParceriaDoCliente).not.toHaveBeenCalled();
  });

  it("A OUTRA METADE: clientId PRÓPRIO passa e revoga normal", async () => {
    const res = await revogarParceria(del("http://localhost/api/agency/parcerias?clientId=cli-A"));
    expect(res.status).toBe(200);
    expect(revogarParceriaDoCliente).toHaveBeenCalledWith("cli-A");
  });
});

// ── 3. POST /api/agency/convites-de-parceria ─────────────────────────────────
//
// ANTES: qualquer master de QUALQUER agência cunhava, para o `clientId` de
// outra agência, um TOKEN que dispensa a pergunta de verba no briefing dele —
// uma credencial entregue sobre um cliente que não é seu.

describe("POST /api/agency/convites-de-parceria — clientId do vizinho não recebe mais convite alheio", () => {
  const url = "http://localhost/api/agency/convites-de-parceria";

  it("clientId do VIZINHO: 404 e cunharConviteDeParceria NUNCA é chamada", async () => {
    const res = await cunharConvite(post(url, { clientId: "cli-B" }));
    expect(res.status).toBe(404);
    expect(cunharConviteDeParceria).not.toHaveBeenCalled();
  });

  it("A OUTRA METADE: clientId PRÓPRIO passa, com os MESMOS argumentos de hoje", async () => {
    const res = await cunharConvite(post(url, { clientId: "cli-A", observacao: "ok" }));
    expect(res.status).toBe(200);
    expect(cunharConviteDeParceria).toHaveBeenCalledOnce();
    expect(cunharConviteDeParceria.mock.calls[0]![0]).toMatchObject({
      clientId: "cli-A",
      observacao: "ok",
      criadoPor: "u1",
    });
  });
});

// ── 4. POST /api/admin/isencoes-de-parceria ──────────────────────────────────
//
// ANTES: qualquer master de QUALQUER agência concedia isenção de pagamento a
// um PEDIDO de outra agência, só copiando o `clientRequestId` — produção de
// graça no crédito de IA de um cliente que não é seu.

describe("POST /api/admin/isencoes-de-parceria — clientRequestId do vizinho não recebe mais isenção", () => {
  const url = "http://localhost/api/admin/isencoes-de-parceria";
  const corpo = {
    clientRequestId: "cr-B",
    autorizadaPor: "CEO",
    validaAte: "2027-01-01",
    escopo: "tudo",
    pecasContratadas: 10,
    tetoDeIaCentavosUsd: 500,
  };

  it("clientRequestId do VIZINHO: 404 e concederIsencaoDeParceria NUNCA é chamada", async () => {
    const res = await concederIsencao(post(url, corpo));
    expect(res.status).toBe(404);
    expect(concederIsencaoDeParceria).not.toHaveBeenCalled();
  });

  it("A OUTRA METADE: clientRequestId PRÓPRIO passa, com os MESMOS argumentos de hoje", async () => {
    const res = await concederIsencao(post(url, { ...corpo, clientRequestId: "cr-A" }));
    expect(res.status).toBe(200);
    expect(concederIsencaoDeParceria).toHaveBeenCalledOnce();
    expect(concederIsencaoDeParceria.mock.calls[0]![0]).toMatchObject({
      clientRequestId: "cr-A",
      autorizadaPor: "CEO",
      escopo: "tudo",
      pecasContratadas: 10,
      tetoDeIaCentavosUsd: 500,
      registradaPor: "u1",
    });
  });
});

// ── 5. POST /api/admin/pagamentos ────────────────────────────────────────────
//
// ANTES: qualquer master de QUALQUER agência registrava, num PEDIDO de outra
// agência, uma testemunha de pagamento manual (`origem: "manual"`) — uma
// afirmação falsa de que dinheiro entrou, que libera a esteira de produção de
// um projeto que não é seu.

describe("POST /api/admin/pagamentos — clientRequestId do vizinho não recebe mais testemunha de pagamento", () => {
  const url = "http://localhost/api/admin/pagamentos";

  it("clientRequestId do VIZINHO: 404 e registrarPagamento NUNCA é chamada", async () => {
    const res = await registrarPagamentoRota(post(url, { clientRequestId: "cr-B", valorCentavos: 7900 }));
    expect(res.status).toBe(404);
    expect(registrarPagamento).not.toHaveBeenCalled();
  });

  it("A OUTRA METADE: clientRequestId PRÓPRIO passa, com os MESMOS argumentos de hoje", async () => {
    const res = await registrarPagamentoRota(
      post(url, { clientRequestId: "cr-A", valorCentavos: 7900, observacao: "pix" }),
    );
    expect(res.status).toBe(200);
    expect(registrarPagamento).toHaveBeenCalledOnce();
    expect(registrarPagamento.mock.calls[0]![0]).toMatchObject({
      clientRequestId: "cr-A",
      origem: "manual",
      valorCentavos: 7900,
      registradoPor: "u1",
      observacao: "pix",
    });
  });
});
