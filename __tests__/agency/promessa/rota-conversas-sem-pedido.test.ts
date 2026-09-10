// GET /api/agency/conversas-sem-pedido devolve o carimbo — e NUNCA inventa
// prazo. `prometidoEm` é fato observável; `venceEm` é sempre `null` porque
// ninguém definiu SLA de resposta nesta casa (LACUNA de decisão do CEO).

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const requireSession = vi.hoisted(() => vi.fn());
const conversasSemPedido = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/api-guard", () => ({ requireSession }));
vi.mock("@/lib/agency/comercial/conversa-sem-pedido", async () => {
  const real = await vi.importActual<typeof import("@/lib/agency/comercial/conversa-sem-pedido")>(
    "@/lib/agency/comercial/conversa-sem-pedido",
  );
  return { ...real, conversasSemPedido };
});

import { GET } from "@/app/api/agency/conversas-sem-pedido/route";

const SESSAO = { workspaceId: "ws-1", userId: "u1" };

beforeEach(() => {
  vi.clearAllMocks();
  requireSession.mockResolvedValue({ session: SESSAO, error: null });
});

function chamar() {
  return GET(new NextRequest("http://localhost/api/agency/conversas-sem-pedido"));
}

describe("a rota devolve o carimbo, sem inventar prazo", () => {
  it("conversa que já foi prometida: prometidoEm vem ISO, venceEm é sempre null", async () => {
    conversasSemPedido.mockResolvedValue([
      {
        fio: "sdr:foocci",
        escopo: { businessName: "Foocci" },
        contato: { whatsapp: "5511900000000" },
        turnos: 5,
        paradaEm: new Date("2026-08-29T02:00:00.000Z"),
        clienteDoConvite: null,
        atribuicao: null,
        workspaceId: "ws-1",
        prometidoEm: new Date("2026-08-29T01:00:00.000Z"),
      },
    ]);

    const res = await chamar();
    const body = await res.json();

    expect(body.conversas).toHaveLength(1);
    const linha = body.conversas[0];
    expect(linha.prometidoEm).toBe("2026-08-29T01:00:00.000Z");
    expect(linha.venceEm).toBeNull();
    // O motivo carrega o ENDEREÇO DA EVIDÊNCIA, não um rótulo vago: a casa já
    // promete "24h úteis" ao cliente em `PublicBriefingRoom.tsx:835` e nunca
    // ratificou isso como decisão. Quem ler este campo tem de conseguir ir
    // conferir sem perguntar a ninguém.
    expect(linha.motivoDoPrazo).toContain("sla_nao_ratificado");
    expect(linha.motivoDoPrazo).toContain("PublicBriefingRoom.tsx:835");
  });

  it("conversa que nunca prometeu: prometidoEm é null", async () => {
    conversasSemPedido.mockResolvedValue([
      {
        fio: "sdr:curioso",
        escopo: { businessName: "Loja X" },
        contato: null,
        turnos: 2,
        paradaEm: new Date("2026-08-29T02:00:00.000Z"),
        clienteDoConvite: null,
        atribuicao: null,
        workspaceId: "ws-1",
        prometidoEm: null,
      },
    ]);

    const res = await chamar();
    const body = await res.json();
    expect(body.conversas[0].prometidoEm).toBeNull();
    expect(body.conversas[0].venceEm).toBeNull();
  });

  it("sem sessão, 401 — a régua de auth de sempre", async () => {
    requireSession.mockResolvedValue({
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const res = await chamar();
    expect(res.status).toBe(401);
    expect(conversasSemPedido).not.toHaveBeenCalled();
  });
});
