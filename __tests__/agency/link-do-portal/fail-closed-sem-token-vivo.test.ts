// FAIL-CLOSED — a metade que faltava de toda trava.
//
// Ordem do Diretor, 29/08/2026 (substitui a decisão 3 do PR #159): sem
// `PortalAccess` vivo para o cliente, `avisarCliente` (`avisos.ts`) NÃO tenta
// nenhum canal — nem WhatsApp, nem e-mail — e NÃO grava `status: "enviado"`.
// A falta vira `ClientNotice` com `status: "pendente"`, que a fila manual
// (`filaDeAvisos` → `/api/avisos` → `FilaDeAvisos.tsx` →
// `app/agency/dashboard/operacao/page.tsx`) mostra para gente de verdade.
//
// Com acesso vivo, o caminho de sempre continua funcionando — este arquivo
// prova as duas metades, não só a nova.

import { describe, it, expect, beforeEach, vi } from "vitest";

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
  clientNotice: { create: vi.fn(), findMany: vi.fn(), update: vi.fn() },
  clientRequestDb: { findMany: vi.fn(async (): Promise<Array<{ id: string }>> => []) },
  portalAccess: { findMany: vi.fn(async (): Promise<AcessoFake[]> => []) },
}));
const sendWhatsAppMessage = vi.hoisted(() => vi.fn());
const sendEmail = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/client", () => ({ prisma: db }));
vi.mock("@/lib/integrations/meta", () => ({ sendWhatsAppMessage }));
vi.mock("@/lib/email/send", () => ({ sendEmail }));
vi.mock("@/lib/agency/consentimento/quem-pode-receber", () => ({
  provaParaTelefone: async () => ({ natureza: "abordagem", origem: "contato_entregue_pelo_proprio_dono" }),
  provaParaEmail: async () => ({ natureza: "abordagem", origem: "contato_entregue_pelo_proprio_dono" }),
}));

const { avisarCliente } = await import("@/lib/agency/esteira/avisos");

const PEDIDO = {
  workspaceId: "ws1",
  clientId: "c1",
  tipo: "material" as const,
  texto: "Precisamos do seu logo para começar as artes.",
};

const ACESSO_VIVO: AcessoFake = {
  token: "tok-vivo", clientId: "c1", clientRequestId: null,
  revokedAt: null, expiresAt: null, grantedAt: new Date("2026-01-01"),
};

beforeEach(() => {
  vi.clearAllMocks();
  db.client.findUnique.mockResolvedValue({ phone: "+55 11 99999-8888", name: "Padaria do João" });
  db.metaConnection.findFirst.mockResolvedValue({ id: "conn1" });
  db.clientNotice.create.mockResolvedValue({ id: "n1" });
  db.clientRequestDb.findMany.mockResolvedValue([]);
  db.portalAccess.findMany.mockResolvedValue([]); // sem acesso vivo por padrão neste arquivo
  sendWhatsAppMessage.mockResolvedValue({ ok: true });
  sendEmail.mockResolvedValue({ ok: true });
});

describe("sem PortalAccess vivo — nada sai, nada é 'enviado'", () => {
  it("não tenta WhatsApp", async () => {
    await avisarCliente(PEDIDO);
    expect(sendWhatsAppMessage).not.toHaveBeenCalled();
  });

  it("não tenta e-mail", async () => {
    await avisarCliente(PEDIDO);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("grava ClientNotice com status pendente, channel nenhum, link nulo, e SEM sentAt", async () => {
    await avisarCliente(PEDIDO);
    const gravado = db.clientNotice.create.mock.calls[0]![0].data;
    expect(gravado.status).toBe("pendente");
    expect(gravado.channel).toBe("nenhum");
    expect(gravado.link).toBeNull();
    expect(gravado.sentAt).toBeUndefined();
    expect(gravado.failReason).toMatch(/sem token de portal vivo/i);
  });

  it("o retorno diz enviadoAutomaticamente: false, com o motivo", async () => {
    const r = await avisarCliente(PEDIDO);
    expect(r.enviadoAutomaticamente).toBe(false);
    expect(r.canal).toBe("nenhum");
    expect(r.motivo).toMatch(/sem token de portal vivo/i);
  });

  it("token revogado também é fail-closed — 'não vivo' não é só 'nunca existiu'", async () => {
    db.portalAccess.findMany.mockResolvedValue([{ ...ACESSO_VIVO, revokedAt: new Date("2026-01-05") }]);
    const r = await avisarCliente(PEDIDO);
    expect(r.enviadoAutomaticamente).toBe(false);
    expect(sendWhatsAppMessage).not.toHaveBeenCalled();
  });

  it("token vencido também é fail-closed", async () => {
    db.portalAccess.findMany.mockResolvedValue([{ ...ACESSO_VIVO, expiresAt: new Date("2020-01-01") }]);
    const r = await avisarCliente(PEDIDO);
    expect(r.enviadoAutomaticamente).toBe(false);
    expect(sendWhatsAppMessage).not.toHaveBeenCalled();
  });
});

describe("com acesso vivo — o caminho limpo continua enviando", () => {
  beforeEach(() => {
    db.portalAccess.findMany.mockResolvedValue([ACESSO_VIVO]);
  });

  it("o WhatsApp sai, com o link vivo no corpo", async () => {
    const r = await avisarCliente(PEDIDO);
    expect(r.enviadoAutomaticamente).toBe(true);
    expect(r.canal).toBe("whatsapp");
    const texto = sendWhatsAppMessage.mock.calls[0]![1].text as string;
    expect(texto).toContain("portal/access/tok-vivo");
  });

  it("grava status enviado, com sentAt", async () => {
    await avisarCliente(PEDIDO);
    const gravado = db.clientNotice.create.mock.calls[0]![0].data;
    expect(gravado.status).toBe("enviado");
    expect(gravado.sentAt).toBeInstanceOf(Date);
    expect(gravado.link).toContain("tok-vivo");
  });
});
