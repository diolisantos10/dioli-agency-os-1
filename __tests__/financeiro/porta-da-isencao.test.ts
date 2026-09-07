// A PORTA DA ISENÇÃO — as guardas da rota, e a idempotência que não mente.
//
// Esta rota nasceu de um erro meu, e ele está escrito no próprio arquivo da
// rota: eu construí a conferência, escrevi a instrução em documento e decidi
// NÃO fazer rota. O resultado literal foi "não concedi porque não alcanço o
// banco" — trava construída sem fechadura, pela terceira vez na mesma noite,
// agora por minha mão. Porta que só existe em documento parece resolvida, e é
// pior que porta nenhuma.
//
// O molde é `POST /api/admin/pagamentos`: sessão de agência, CSRF, dono na
// linha vindo da SESSÃO. Ato administrativo sensível com auditoria — nunca foi
// considerado furar a trava.

import { describe, it, expect, vi, beforeEach } from "vitest";

const sessao = vi.hoisted(() => ({ atual: null as unknown }));
const guarda = vi.hoisted(() => ({ bloquear: false }));
const lib = vi.hoisted(() => ({ conceder: vi.fn() }));

vi.mock("@/lib/auth/session", () => ({
  getSession: async () => sessao.atual,
  isAgencyRole: (r: string) => ["master", "pm", "diretor"].includes(r),
}));
vi.mock("@/lib/security/navegacao-cross-site", () => ({
  deveBloquearMutacaoCrossSite: () => guarda.bloquear,
}));
vi.mock("@/lib/agency/financeiro/conceder-isencao", () => ({
  concederIsencaoDeParceria: lib.conceder,
}));
// ── POR QUE ESTE ARQUIVO GANHOU UM DUBLÊ DE POSSE (29/08/2026) ─────────────
//
// O assunto DESTE arquivo são as GUARDAS da rota (dono da sessão, fail-closed,
// idempotência, respostas) — nunca a posse. Sem dublê, `solicitacaoDoWorkspace`
// caía no Prisma de verdade, não achava "req_foocci" em nenhum banco e a rota
// devolvia 404 em todo caso que passasse das guardas, mascarando o que este
// arquivo existe para provar.
//
// A POSSE NÃO FICOU SEM PROVA: ela é exercitada, de verdade, contra um banco
// fiel ao `where`, em `__tests__/seguranca/posse-nas-cinco-rotas-de-pagamento-e-
// parceria.test.ts` (bloco "POST /api/admin/isencoes-de-parceria"), inclusive o
// caso do clientRequestId do vizinho devolvendo 404. Dublar o Prisma aqui só
// para este arquivo, honrando o `where`, duplicaria aquela prova sem acrescentar
// trava nova — por isso a escolha foi dublar `@/lib/auth/posse-de-workspace`
// (mantendo `naoEncontrado` real, via `importOriginal`), e não o módulo de
// posse inteiro sem motivo declarado.
vi.mock("@/lib/auth/posse-de-workspace", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/posse-de-workspace")>()),
  solicitacaoDoWorkspace: vi.fn(async () => true),
}));

const { POST } = await import("@/app/api/admin/isencoes-de-parceria/route");

const VALIDO = new Date("2026-11-27T00:00:00.000Z");

function req(body: unknown) {
  return new Request("https://www.diolidigital.com.br/api/admin/isencoes-de-parceria", {
    method: "POST",
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof POST>[0];
}

const CORPO_BOM = {
  clientRequestId: "req_foocci",
  autorizadaPor: "Dioli Santos (CEO) — D-0B9",
  validaAte: "2026-11-27",
  escopo: "Social Media — cliente 001",
  pecasContratadas: 12,
  tetoDeIaCentavosUsd: 200,
};

beforeEach(() => {
  sessao.atual = { userId: "u_master", role: "master" };
  guarda.bloquear = false;
  lib.conceder.mockReset().mockResolvedValue({ ok: true, id: "isen_1", validaAte: VALIDO, jaExistia: false });
});

describe("as guardas — as mesmas de /api/admin/pagamentos", () => {
  it("sem sessão: 401, e NADA é concedido", async () => {
    sessao.atual = null;
    const r = await POST(req(CORPO_BOM));
    expect(r.status).toBe(401);
    expect(lib.conceder).not.toHaveBeenCalled();
  });

  it("sessão de PORTAL (com clientId): 403 — o cliente não declara a própria isenção", async () => {
    sessao.atual = { userId: "u1", role: "master", clientId: "c_foocci" };
    const r = await POST(req(CORPO_BOM));
    expect(r.status).toBe(403);
    expect(lib.conceder).not.toHaveBeenCalled();
  });

  it("papel que não é da agência: 403", async () => {
    sessao.atual = { userId: "u1", role: "visitante" };
    const r = await POST(req(CORPO_BOM));
    expect(r.status).toBe(403);
    expect(lib.conceder).not.toHaveBeenCalled();
  });

  it("mutação cross-site: 403 — isto libera gasto real", async () => {
    guarda.bloquear = true;
    const r = await POST(req(CORPO_BOM));
    expect(r.status).toBe(403);
    expect(lib.conceder).not.toHaveBeenCalled();
  });

  it("NUNCA é pública: toda porta fechada barra ANTES de qualquer escrita", async () => {
    for (const preparar of [
      () => { sessao.atual = null; },
      () => { sessao.atual = { userId: "u1", role: "master", clientId: "c1" }; },
      () => { guarda.bloquear = true; },
    ]) {
      lib.conceder.mockClear();
      sessao.atual = { userId: "u_master", role: "master" };
      guarda.bloquear = false;
      preparar();
      const r = await POST(req(CORPO_BOM));
      expect(r.status).toBeGreaterThanOrEqual(401);
      expect(lib.conceder).not.toHaveBeenCalled();
    }
  });
});

describe("o dono sai da SESSÃO, nunca do corpo", () => {
  it("registradaPor é o usuário da sessão", async () => {
    await POST(req(CORPO_BOM));
    expect(lib.conceder.mock.calls[0][0].registradaPor).toBe("u_master");
  });

  it("o corpo NÃO consegue escolher quem registrou", async () => {
    await POST(req({ ...CORPO_BOM, registradaPor: "outra_pessoa" }));
    expect(lib.conceder.mock.calls[0][0].registradaPor).toBe("u_master");
    expect(lib.conceder.mock.calls[0][0].registradaPor).not.toBe("outra_pessoa");
  });

  it("autorizadaPor VEM do corpo — é a fonte da autorização, e é digitada", async () => {
    await POST(req(CORPO_BOM));
    expect(lib.conceder.mock.calls[0][0].autorizadaPor).toContain("D-0B9");
  });
});

describe("nenhum campo ganha valor padrão", () => {
  it("número ausente vira NaN, NUNCA zero — zero é decisão, não ausência", async () => {
    await POST(req({ ...CORPO_BOM, tetoDeIaCentavosUsd: undefined, pecasContratadas: undefined }));
    const a = lib.conceder.mock.calls[0][0];
    expect(Number.isNaN(a.tetoDeIaCentavosUsd)).toBe(true);
    expect(Number.isNaN(a.pecasContratadas)).toBe(true);
    expect(a.tetoDeIaCentavosUsd).not.toBe(0);
  });

  it("zero EXPLÍCITO passa como zero — a régua distingue os dois", async () => {
    await POST(req({ ...CORPO_BOM, tetoDeIaCentavosUsd: 0 }));
    expect(lib.conceder.mock.calls[0][0].tetoDeIaCentavosUsd).toBe(0);
  });

  it("texto ausente vira vazio e a conferência recusa — a rota não inventa", async () => {
    await POST(req({ ...CORPO_BOM, autorizadaPor: undefined }));
    expect(lib.conceder.mock.calls[0][0].autorizadaPor).toBe("");
  });
});

describe("as respostas", () => {
  it("concessão nova: 200, e a resposta diz que NÃO é pagamento", async () => {
    const r = await POST(req(CORPO_BOM));
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.ok).toBe(true);
    expect(j.jaExistia).toBe(false);
    expect(j.mensagem).toMatch(/não é pagamento/i);
    expect(j.mensagem).toMatch(/margem negativa/i);
  });

  it("IDEMPOTENTE: a mesma concessão repetida devolve 200, sem alarde", async () => {
    lib.conceder.mockResolvedValue({ ok: true, id: "isen_1", validaAte: VALIDO, jaExistia: true });
    const r = await POST(req(CORPO_BOM));
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.jaExistia).toBe(true);
    expect(j.mensagem).toMatch(/já existia/i);
    expect(j.mensagem).toMatch(/nada foi alterado/i);
  });

  it("termos DIFERENTES sobre isenção existente: 409, nunca 200", async () => {
    lib.conceder.mockResolvedValue({
      ok: false, recusa: "ja_existe_com_outros_termos", motivo: "termos diferentes",
    });
    const r = await POST(req(CORPO_BOM));
    expect(r.status).toBe(409);
    expect((await r.json()).ok).toBe(false);
  });

  it("campo faltando: 400, com a recusa nomeada", async () => {
    lib.conceder.mockResolvedValue({ ok: false, recusa: "sem_dono", motivo: "isenção sem dono é buraco" });
    const r = await POST(req(CORPO_BOM));
    expect(r.status).toBe(400);
    expect((await r.json()).recusa).toBe("sem_dono");
  });
});
