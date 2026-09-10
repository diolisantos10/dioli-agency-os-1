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
vi.mock("@/lib/db/client", () => ({ prisma: db }));
vi.mock("@/lib/integrations/meta", () => ({ sendWhatsAppMessage }));

import { avisarCliente, filaDeAvisos, marcarComoEnviado, dispensar } from "@/lib/agency/esteira/avisos";

// O token vem de um `PortalAccess` VIVO agora — não mais de `Client.portalToken`
// (esse era exatamente o defeito: as duas colunas nunca coincidem). Ver
// `lib/agency/esteira/link-do-portal-do-cliente.ts`.
const ACESSO_VIVO: AcessoFake = {
  token: "tok123", clientId: "c1", clientRequestId: null,
  revokedAt: null, expiresAt: null, grantedAt: new Date("2026-01-01"),
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_APP_URL = "https://app.dioli.studio";
  db.client.findUnique.mockResolvedValue({ phone: "+55 11 99999-8888", name: "Padaria do João" });
  db.clientRequestDb.findMany.mockResolvedValue([]);
  db.portalAccess.findMany.mockResolvedValue([ACESSO_VIVO]);
  db.metaConnection.findFirst.mockResolvedValue({ id: "conn1" });
  db.clientNotice.create.mockResolvedValue({ id: "n1" });
  db.clientNotice.findMany.mockResolvedValue([]);
  db.clientNotice.update.mockResolvedValue({});
  sendWhatsAppMessage.mockResolvedValue({ ok: true });
});

const PEDIDO = {
  workspaceId: "ws1",
  clientId: "c1",
  projectId: "p1",
  tipo: "material" as const,
  texto: "Precisamos do seu logo para começar as artes.",
};

describe("o aviso NUNCA se perde", () => {
  it("saiu pelo WhatsApp → registra como enviado, com comprovante", async () => {
    const r = await avisarCliente(PEDIDO);
    expect(r.enviadoAutomaticamente).toBe(true);
    expect(r.canal).toBe("whatsapp");

    const gravado = db.clientNotice.create.mock.calls[0][0].data;
    expect(gravado.status).toBe("enviado");
    expect(gravado.sentAt).toBeInstanceOf(Date);
  });

  it("SEM conexão de WhatsApp → vira fila, não some", async () => {
    db.metaConnection.findFirst.mockResolvedValue(null);
    const r = await avisarCliente(PEDIDO);

    expect(r.registrado).toBe(true);
    expect(r.enviadoAutomaticamente).toBe(false);
    expect(db.clientNotice.create.mock.calls[0][0].data.status).toBe("pendente");
  });

  it("cliente sem telefone → vira fila, com o motivo explícito", async () => {
    db.client.findUnique.mockResolvedValue({ phone: null, name: "Padaria do João" });
    await avisarCliente(PEDIDO);
    expect(db.clientNotice.create.mock.calls[0][0].data.failReason).toMatch(/telefone/i);
  });

  it("SEM token de portal vivo → não tenta nenhum canal, não grava 'enviado' (fail-closed)", async () => {
    db.portalAccess.findMany.mockResolvedValue([]);
    const r = await avisarCliente(PEDIDO);

    expect(sendWhatsAppMessage).not.toHaveBeenCalled();
    expect(r.enviadoAutomaticamente).toBe(false);
    expect(r.canal).toBe("nenhum");
    const gravado = db.clientNotice.create.mock.calls[0][0].data;
    expect(gravado.status).toBe("pendente");
    expect(gravado.channel).toBe("nenhum");
    expect(gravado.link).toBeNull();
    expect(gravado.sentAt).toBeUndefined();
    expect(gravado.failReason).toMatch(/sem token de portal vivo/i);
  });

  it("a Meta recusa fora da janela de 24h → vira fila com o motivo dela", async () => {
    sendWhatsAppMessage.mockResolvedValue({ ok: false, error: "fora da janela de 24h — use template aprovado" });
    const r = await avisarCliente(PEDIDO);

    expect(r.enviadoAutomaticamente).toBe(false);
    expect(db.clientNotice.create.mock.calls[0][0].data.failReason).toMatch(/24h/);
  });

  it("o envio explodindo não derruba o registro", async () => {
    sendWhatsAppMessage.mockRejectedValue(new Error("rede caiu"));
    const r = await avisarCliente(PEDIDO);
    expect(r.registrado).toBe(true);
    expect(db.clientNotice.create).toHaveBeenCalled();
  });

  it("nem o aviso inteiro falhando derruba quem chamou", async () => {
    db.clientNotice.create.mockRejectedValue(new Error("banco fora"));
    await expect(avisarCliente(PEDIDO)).resolves.toMatchObject({ registrado: false });
  });
});

describe("o link do portal vai junto", () => {
  it("a mensagem enviada carrega o link que resolve o aviso", async () => {
    await avisarCliente(PEDIDO);
    const texto = sendWhatsAppMessage.mock.calls[0][1].text as string;
    expect(texto).toContain("Precisamos do seu logo");
    expect(texto).toContain("https://app.dioli.studio/portal/access/tok123");
  });

  it("o telefone vai só com dígitos, como a Meta exige", async () => {
    await avisarCliente(PEDIDO);
    expect(sendWhatsAppMessage.mock.calls[0][1].to).toBe("5511999998888");
  });
});

describe("a fila para o time disparar", () => {
  it("entrega o texto pronto, com link, sem precisar escrever nada", async () => {
    db.clientNotice.findMany.mockResolvedValue([
      {
        id: "n1", kind: "material", body: "Precisamos do seu logo.",
        link: "https://app.dioli.studio/portal/access/tok123",
        failReason: "cliente sem telefone cadastrado",
        createdAt: new Date("2026-07-29T10:00:00Z"),
        client: { name: "Padaria do João" },
      },
    ]);

    const fila = await filaDeAvisos("ws1");
    expect(fila).toHaveLength(1);
    expect(fila[0]!.cliente).toBe("Padaria do João");
    expect(fila[0]!.textoParaEnviar).toContain("Precisamos do seu logo.");
    expect(fila[0]!.textoParaEnviar).toContain("portal/access/tok123");
    expect(fila[0]!.porQueNaoSaiuSozinho).toMatch(/telefone/i);
  });

  it("banco fora do ar devolve fila vazia em vez de quebrar o painel", async () => {
    db.clientNotice.findMany.mockRejectedValue(new Error("db down"));
    expect(await filaDeAvisos("ws1")).toEqual([]);
  });

  it("marcar como enviado registra quem mandou", async () => {
    expect(await marcarComoEnviado("n1", "dioli@studio")).toBe(true);
    const d = db.clientNotice.update.mock.calls[0][0].data;
    expect(d.status).toBe("enviado");
    expect(d.channel).toBe("manual");
    expect(d.sentBy).toBe("dioli@studio");
  });

  it("dispensar sai da fila sem fingir que foi enviado", async () => {
    expect(await dispensar("n1", "dioli@studio")).toBe(true);
    expect(db.clientNotice.update.mock.calls[0][0].data.status).toBe("dispensado");
  });
});
