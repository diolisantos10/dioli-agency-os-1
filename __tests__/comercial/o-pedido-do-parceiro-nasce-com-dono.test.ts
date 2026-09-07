// O PEDIDO DO PARCEIRO NASCE COM DONO — a fronteira que o #373 não cruzava.
//
// ═══ O P0 DE 29/08/2026, COM O CLIENTE 001 NA TELA ═════════════════════════
//
// O Marcos entrou pelo link de parceiro, conversou, o briefing subiu — e a
// proposta dele saiu **cobrando**: "a estimativa é de R$ 290 por mês", botão
// "Aceitar e começar", "ficou com dúvida no valor?". Para um parceiro isento
// autorizado pelo CEO.
//
// A causa não estava na proposta. Estava aqui: `app/briefing/page.tsx` submetia
// o briefing **sem o convite**, e `/api/brain/client-requests` criava o pedido
// **sem `clientId`**. Pedido órfão → `parceriaVivaDoCliente(null)` → `null` → a
// tela desenha, corretamente, um cliente pagante.
//
// ═══ POR QUE O TESTE DO #373 ESTAVA VERDE ══════════════════════════════════
//
// Ele **montava o pedido já com `clientId`** e provava que a proposta mostra a
// isenção. Provava *"dado um pedido de parceiro, a proposta acerta"* — e nunca
// *"o pedido do parceiro nasce com o clientId"*.
//
// A fronteira que ele não cruzava é exatamente onde o defeito morava. Este
// arquivo cruza: mede o que o pedido RECEBE no nascimento.

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";

const db = vi.hoisted(() => ({
  clientRequestDb: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn() },
  activityEvent: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
  rateLimitBucket: { updateMany: vi.fn(async () => ({ count: 1 })), create: vi.fn(), findUnique: vi.fn(), deleteMany: vi.fn(async () => ({ count: 0 })) },
}));
vi.mock("@/lib/db/client", () => ({ prisma: db }));

// ⛔ A resolução do convite é o ponto de decisão — dublada para o teste
// controlar o cenário. Que o token seja BOM é assunto de outro arquivo.
const resolverConviteDeParceria = vi.hoisted(() => vi.fn());
vi.mock("@/lib/agency/comercial/convite-de-parceria", () => ({ resolverConviteDeParceria }));

const criado = vi.hoisted(() => vi.fn());
vi.mock("@/lib/agency/persistence/client-request-service", async (orig) => ({
  ...(await orig<Record<string, unknown>>()),
  createClientRequest: criado,
}));

vi.mock("@/lib/ai/generate", () => ({
  generate: vi.fn(async () => ({ ok: false, error: "dublada" })),
  anyProviderConfigured: vi.fn(async () => false),
}));

import { POST } from "@/app/api/brain/client-requests/route";

function submeter(corpo: Record<string, unknown>) {
  return POST(new NextRequest("http://localhost/api/brain/client-requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      businessName: "FOOCCI",
      segment: "SaaS de CRM",
      services: ["social media"],
      objectives: ["aparecer para donos de restaurante"],
      prospectEmail: "marcos@foocci.com.br",
      ...corpo,
    }),
  }));
}

/** O que `createClientRequest` recebeu — é isso que decide o dono do pedido. */
const entrada = () => (criado.mock.calls[0]?.[0] ?? {}) as { clientId?: string };

beforeEach(() => {
  vi.clearAllMocks();
  criado.mockResolvedValue({ id: "req-1", status: "new" });
  db.activityEvent.findFirst.mockResolvedValue(null);
  db.activityEvent.create.mockResolvedValue({});
  db.activityEvent.deleteMany.mockResolvedValue({ count: 0 });
  resolverConviteDeParceria.mockResolvedValue(null);
});

describe("o briefing do parceiro vira pedido DELE", () => {
  it("🔴 com convite bom, o pedido nasce AMARRADO ao cliente parceiro", async () => {
    resolverConviteDeParceria.mockResolvedValue({
      clientId: "cli_foocci",
      parceria: { autorizadaPor: "Dioli Santos (CEO)", validaAte: new Date(Date.now() + 2.6e9) },
    });

    await submeter({ convite: "token-bom" });

    expect(
      entrada().clientId,
      "o pedido do parceiro nasceu órfão — a proposta dele vai sair COBRANDO",
    ).toBe("cli_foocci");
  });

  it("⛔ o TOKEN é que resolve — um `clientId` no corpo NÃO é aceito", async () => {
    // A trava da rota pública continua de pé: aceitar `clientId` do corpo
    // deixava qualquer pessoa plantar pedido na caixa de entrada de uma agência
    // escolhida a dedo. O conserto não afrouxou isso.
    resolverConviteDeParceria.mockResolvedValue(null);

    await submeter({ clientId: "cli_de_outra_agencia" });

    expect(
      entrada().clientId,
      "um `clientId` vindo do corpo foi aceito — a trava da rota pública caiu",
    ).toBeUndefined();
  });

  it("⛔ token inventado resolve null — e o pedido nasce órfão, como sempre foi", async () => {
    resolverConviteDeParceria.mockResolvedValue(null);
    await submeter({ convite: "eu-inventei-este-token" });
    expect(entrada().clientId).toBeUndefined();
  });

  it("✅ sem convite nenhum, nada muda — o visitante comum segue igual", async () => {
    await submeter({});
    expect(entrada().clientId).toBeUndefined();
    expect(criado, "o pedido do visitante comum deixou de nascer").toHaveBeenCalled();
  });

  it("⚠️ a resolução do convite é feita no SERVIDOR, com o token recebido", async () => {
    resolverConviteDeParceria.mockResolvedValue(null);
    await submeter({ convite: "tok-123" });
    expect(
      resolverConviteDeParceria,
      "a rota não consultou o servidor sobre o convite",
    ).toHaveBeenCalledWith("tok-123");
  });
});

// ── O OUTRO LADO DA FRONTEIRA: A SALA MANDA O CONVITE ──────────────────────
//
// 🚩 GUARDA ESTRUTURAL, declarado. A mutação "a sala para de mandar o convite"
// SOBREVIVEU aos testes acima — eles chamam a rota direto, e o submit mora num
// componente React que este repositório não consegue renderizar com estado
// (vitest em `environment: "node"`, sem testing-library).
//
// Ele não prova que a tela funciona. Prova que **a linha não sumiu** — que é
// exatamente como esta regressão voltaria, e como ela nasceu: o convite existia
// na URL, era mandado ao SDR em todo turno, e simplesmente não ia no submit.
describe("a sala leva o convite no submit — o elo do lado do cliente", () => {
  const fonte = fs.readFileSync(path.join(process.cwd(), "app/briefing/page.tsx"), "utf8");

  it("🔴 o submit do briefing envia `convite`", () => {
    expect(
      /convite:\s*conviteDaUrl\(\)/.test(fonte),
      "o submit parou de mandar o convite — o pedido do parceiro volta a nascer órfão e a proposta dele volta a COBRAR",
    ).toBe(true);
  });

  it("o convite sai da URL, não de um estado guardado", () => {
    // `conviteDaUrl()` lê `window.location.search` na hora. Um estado guardado
    // se perderia num recarregamento no meio do briefing.
    expect(fonte).toContain("conviteDaUrl");
    expect(fonte).toMatch(/import \{[^}]*conviteDaUrl[^}]*\} from "@\/components\/agency\/briefing\/PublicBriefingRoom"/);
  });
});
