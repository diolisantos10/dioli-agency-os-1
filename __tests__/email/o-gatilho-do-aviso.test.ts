// O GATILHO — o e-mail sai do EVENTO REAL, não de um segundo caminho.
//
// *Verdade escrita em dois lugares já está errada em um deles.* Por isso o
// e-mail não ganhou porta própria: ele entrou no canal ÚNICO do cliente
// (`avisarCliente`), que já existia, já registrava `ClientNotice` e já tentava
// WhatsApp. Quem dispara continua sendo a esteira:
//
//   peça pronta → `apresentar()` → `falarComOCliente` → avisarCliente("entrega")
//   atraso      → Gerente Geral  → `gravarMensagem`   → avisarCliente("atraso")
//
// ── O BURACO QUE ISTO FECHA, medido em produção 27/08/2026 ─────────────────
// `CanalDeAviso` listava `"email"` desde sempre e **nada enviava um**. O log
// repetia, cliente a cliente:
//   `aviso parado por CADASTRO — o telefone do cliente não está cadastrado`
// Sem WhatsApp, o aviso virava fila manual e o cliente não sabia de nada.

import { describe, it, expect, vi, beforeEach } from "vitest";

interface AcessoFake {
  token: string;
  clientId: string | null;
  clientRequestId: string | null;
  revokedAt: Date | null;
  expiresAt: Date | null;
  grantedAt: Date;
}

const db = vi.hoisted(() => ({
  client: { findUnique: vi.fn() },
  metaConnection: { findFirst: vi.fn() },
  clientNotice: { create: vi.fn() },
  clientRequestDb: { findMany: vi.fn(async (): Promise<Array<{ id: string }>> => []) },
  portalAccess: { findMany: vi.fn(async (): Promise<AcessoFake[]> => []) },
}));
const correio = vi.hoisted(() => ({ enviar: vi.fn() }));

vi.mock("@/lib/db/client", () => ({ prisma: db }));
vi.mock("@/lib/email/send", () => ({ sendEmail: correio.enviar }));
vi.mock("@/lib/agency/consentimento/quem-pode-receber", () => ({
  provaParaEmail: async () => ({ natureza: "abordagem", origem: "contato_entregue_pelo_proprio_dono" }),
  provaParaTelefone: async () => ({ natureza: "abordagem", origem: "contato_entregue_pelo_proprio_dono" }),
}));
vi.mock("@/lib/agency/esteira/aviso-de-agendamento-manual", () => ({
  avisoDeAgendamentoManual: async () => "A publicação ainda é feita à mão pela nossa equipe.",
}));

const { avisarCliente } = await import("@/lib/agency/esteira/avisos");

const CLIENTE_SO_COM_EMAIL = { phone: null, name: "Foocci" };

// O token vem de um `PortalAccess` VIVO — não mais de `Client.portalToken`.
// Ver `lib/agency/esteira/link-do-portal-do-cliente.ts`.
const ACESSO_VIVO: AcessoFake = {
  token: "tok_abc", clientId: "c1", clientRequestId: null,
  revokedAt: null, expiresAt: null, grantedAt: new Date("2026-01-01"),
};

beforeEach(() => {
  db.client.findUnique.mockReset().mockResolvedValue(CLIENTE_SO_COM_EMAIL);
  db.metaConnection.findFirst.mockReset().mockResolvedValue(null);
  db.clientNotice.create.mockReset().mockResolvedValue({});
  db.clientRequestDb.findMany.mockReset().mockResolvedValue([]);
  db.portalAccess.findMany.mockReset().mockResolvedValue([ACESSO_VIVO]);
  correio.enviar.mockReset().mockResolvedValue({ ok: true, id: "re_1" });
  process.env.NEXT_PUBLIC_APP_URL = "https://www.diolidigital.com.br";
});

/** O cliente do log de produção: sem telefone, com e-mail. */
function clienteSemTelefoneComEmail() {
  db.client.findUnique.mockImplementation(async ({ select }: { select: Record<string, boolean> }) =>
    select?.email ? { email: "marcos@foocci-teste.invalid", name: "Foocci" } : CLIENTE_SO_COM_EMAIL,
  );
}

describe("a peça pronta CHEGA ao cliente sem WhatsApp", () => {
  it("dispara o e-mail quando o WhatsApp não dá", async () => {
    clienteSemTelefoneComEmail();
    const r = await avisarCliente({ workspaceId: "w1", clientId: "c1", tipo: "entrega", texto: "Terminamos!" });
    expect(correio.enviar).toHaveBeenCalledTimes(1);
    expect(r.canal).toBe("email");
    expect(r.enviadoAutomaticamente).toBe(true);
  });

  it("é o molde da PEÇA PRONTA, não um genérico", async () => {
    clienteSemTelefoneComEmail();
    await avisarCliente({ workspaceId: "w1", clientId: "c1", tipo: "entrega", texto: "Terminamos!" });
    expect(correio.enviar.mock.calls[0][0].subject).toMatch(/material está pronto/i);
  });

  it("o aviso da publicação manual entra por DERIVAÇÃO, não constante", async () => {
    clienteSemTelefoneComEmail();
    await avisarCliente({ workspaceId: "w1", clientId: "c1", tipo: "entrega", texto: "Terminamos!" });
    expect(correio.enviar.mock.calls[0][0].html).toContain("à mão");
  });

  it("o registro grava o canal REAL — 'email', não 'nenhum'", async () => {
    clienteSemTelefoneComEmail();
    await avisarCliente({ workspaceId: "w1", clientId: "c1", tipo: "entrega", texto: "Terminamos!" });
    const data = db.clientNotice.create.mock.calls[0][0].data;
    expect(data.channel).toBe("email");
    expect(data.status).toBe("enviado");
    expect(data.sentAt).toBeInstanceOf(Date);
  });
});

describe("o atraso e o link do portal têm molde próprio", () => {
  it("atraso → o e-mail de atraso", async () => {
    clienteSemTelefoneComEmail();
    await avisarCliente({ workspaceId: "w1", clientId: "c1", tipo: "atraso", texto: "o prazo queimou" });
    expect(correio.enviar.mock.calls[0][0].subject).toMatch(/prazo/i);
  });

  it("portal → o e-mail do link", async () => {
    clienteSemTelefoneComEmail();
    await avisarCliente({ workspaceId: "w1", clientId: "c1", tipo: "portal", texto: "seu acesso" });
    expect(correio.enviar.mock.calls[0][0].subject).toMatch(/acesso ao portal/i);
  });

  it("tipo SEM molde não improvisa um e-mail genérico", async () => {
    clienteSemTelefoneComEmail();
    const r = await avisarCliente({ workspaceId: "w1", clientId: "c1", tipo: "material", texto: "mande as fotos" });
    expect(correio.enviar).not.toHaveBeenCalled();
    expect(r.canal).toBe("nenhum");
    expect(r.motivo ?? "").toMatch(/sem molde/i);
  });
});

describe("a escada de canais — e o motivo de cada degrau é preservado", () => {
  it("WhatsApp que FUNCIONA não dispara e-mail — a casa não fala duas vezes", async () => {
    db.client.findUnique.mockResolvedValue({ phone: "5511999999999", name: "Foocci" });
    db.metaConnection.findFirst.mockResolvedValue({ id: "conn1" });
    vi.doMock("@/lib/integrations/meta", () => ({ sendWhatsAppMessage: async () => ({ ok: true }) }));
    const { avisarCliente: fresco } = await import("@/lib/agency/esteira/avisos");
    const r = await fresco({ workspaceId: "w1", clientId: "c1", tipo: "entrega", texto: "Terminamos!" });
    expect(r.canal).toBe("whatsapp");
    expect(correio.enviar).not.toHaveBeenCalled();
  });

  it("os dois canais falhando vira fila manual, com OS DOIS motivos", async () => {
    db.client.findUnique.mockImplementation(async ({ select }: { select: Record<string, boolean> }) =>
      select?.email ? { email: null, name: "Foocci" } : CLIENTE_SO_COM_EMAIL,
    );
    const r = await avisarCliente({ workspaceId: "w1", clientId: "c1", tipo: "entrega", texto: "Terminamos!" });
    expect(r.canal).toBe("nenhum");
    expect(r.enviadoAutomaticamente).toBe(false);
    expect(r.motivo).toMatch(/whatsapp:/);
    expect(r.motivo).toMatch(/e-mail:/);
    // O aviso NUNCA se perde: fica pendente para a mão humana.
    expect(db.clientNotice.create.mock.calls[0][0].data.status).toBe("pendente");
  });

  it("a porta de e-mail recusando NÃO vira 'enviado' — recusa é recusa", async () => {
    clienteSemTelefoneComEmail();
    correio.enviar.mockResolvedValue({ ok: false, error: "valor_no_corpo: o corpo estampa R$" });
    const r = await avisarCliente({ workspaceId: "w1", clientId: "c1", tipo: "entrega", texto: "Terminamos!" });
    expect(r.enviadoAutomaticamente).toBe(false);
    expect(r.canal).toBe("nenhum");
    expect(r.motivo).toMatch(/valor_no_corpo/);
  });

  it("o aviso NUNCA derruba o marco que o gerou — falha no envio não lança", async () => {
    clienteSemTelefoneComEmail();
    correio.enviar.mockRejectedValue(new Error("rede caiu"));
    await expect(
      avisarCliente({ workspaceId: "w1", clientId: "c1", tipo: "entrega", texto: "Terminamos!" }),
    ).resolves.toBeTruthy();
  });
});
