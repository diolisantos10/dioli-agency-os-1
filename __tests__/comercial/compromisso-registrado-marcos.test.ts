// P0 AO VIVO — 30/08/2026. Marcos (Foocci, PARCEIRO REAL) cobrou a proposta
// atrasada há mais de 1h e o SDR respondeu com uma escalação inteiramente
// fictícia. Este teste dispara a conversa REAL contra a ROTA REAL — exercitar
// só `promessasSoltas`/`registrarCompromisso` provaria as funções, não o
// caminho do cliente, que é a régua que este arquivo já pagou caro uma vez
// (ver `conversa-sem-pedido-nao-some.test.ts`).
//
// A FALA REAL:
// "Vou conferir com o gerente de projeto se cabe no cronograma. (…) precisa
// de aprovação de gestão. Vou trazer essas duas respostas para você ainda
// hoje — pode deixar comigo. 🙂"

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const db = vi.hoisted(() => ({
  aIRunLog: { findMany: vi.fn(async () => []) },
  portalMessage: { create: vi.fn(), findFirst: vi.fn() },
  clientRequestDb: { findUnique: vi.fn() },
  activityEvent: {
    findFirst:  vi.fn(),
    create:     vi.fn(),
    update:     vi.fn(),
    findMany:   vi.fn(async (): Promise<Array<{ clientId: string; message: string; timestamp: Date }>> => []),
    deleteMany: vi.fn(async () => ({ count: 0 })),
  },
  rateLimitBucket: {
    updateMany: vi.fn(async () => ({ count: 1 })),
    create: vi.fn(),
    findUnique: vi.fn(),
    deleteMany: vi.fn(async () => ({ count: 0 })),
  },
}));
vi.mock("@/lib/db/client", () => ({ prisma: db }));

const chaveDeRotaPublica = vi.hoisted(() => vi.fn());
vi.mock("@/lib/ai/chave-publica", () => ({
  chaveDeRotaPublica,
  workspaceDaRotaPublica: async () => "ws-de-teste",
  primeiraChaveDeRotaPublica: async () => {
    const chave = await chaveDeRotaPublica("claude");
    return chave ? { provider: "claude", chave } : null;
  },
  chavesDeRotaPublica: async () => {
    const chave = await chaveDeRotaPublica("claude");
    return chave ? [{ provider: "claude", chave }] : [];
  },
}));

import { POST } from "@/app/api/sdr/chat/route";
import { TIPO_COMPROMISSO_DO_SDR, lerCargaDoCompromisso } from "@/lib/agency/comercial/compromisso-do-sdr";

type Criada = { workspaceId: string; type: string; clientId: string; message: string };
const criadas = (): Criada[] =>
  (db.activityEvent.create.mock.calls as unknown as Array<[{ data: Criada }]>).map((c) => c[0].data);

const FALA_AO_MARCOS =
  "Vou conferir com o gerente de projeto se cabe no cronograma. Isso precisa de " +
  "aprovação de gestão. Vou trazer essas duas respostas para você ainda hoje — " +
  "pode deixar comigo. 🙂";

function respostaDoModelo(reply: string, scope: Record<string, unknown> = {}) {
  return {
    ok: true,
    json: async () => ({
      content: [{ type: "text", text: JSON.stringify({ reply, needsClarification: false, scope }) }],
    }),
  };
}

function chamarSdr(corpo: Record<string, unknown>) {
  return POST(new NextRequest("http://localhost/api/sdr/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(corpo),
  }));
}

beforeEach(() => {
  vi.clearAllMocks();
  chaveDeRotaPublica.mockResolvedValue({ apiKey: "chave", source: "db", model: null });
  db.portalMessage.create.mockResolvedValue({});
  db.portalMessage.findFirst.mockResolvedValue(null);
  db.clientRequestDb.findUnique.mockResolvedValue(null);
  db.activityEvent.findFirst.mockResolvedValue(null);
  db.activityEvent.create.mockResolvedValue({});
  db.activityEvent.update.mockResolvedValue({});
});

describe("VERMELHO sem a fechadura, VERDE com ela — a conversa real com o Marcos", () => {
  it("a fala crua da escalação fictícia NUNCA chega ao cliente", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaDoModelo(FALA_AO_MARCOS)));

    const res = await chamarSdr({
      messages: [{ role: "user", text: "Já se passou mais de 1h desde a promessa de retorno 'ainda hoje'." }],
      currentMessage: "e a proposta?",
      sessionId: "marcos-foocci",
      scope: {},
    });
    const corpo = await res.json();
    expect(corpo.ok).toBe(true);

    const falaFinal = String(corpo.reply).toLowerCase();
    // As SEIS frases da tabela do P0 — nenhuma pode sobreviver inteira.
    expect(falaFinal).not.toContain("vou conferir com o gerente");
    expect(falaFinal).not.toContain("precisa de aprovação de gestão");
    expect(falaFinal).not.toContain("pode deixar comigo");
  });

  it("QUANDO o registro nasce, a fala vira VERDADE — compromisso real com dono e prazo", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaDoModelo(FALA_AO_MARCOS)));

    const res = await chamarSdr({
      messages: [],
      currentMessage: "e a proposta?",
      sessionId: "marcos-foocci",
      scope: {},
    });
    const corpo = await res.json();

    // 1. Quem CHAMA: `app/api/sdr/chat/route.ts` registrou de verdade.
    const compromissos = criadas().filter((l) => l.type === TIPO_COMPROMISSO_DO_SDR);
    expect(compromissos).toHaveLength(1);
    expect(compromissos[0].clientId).toBe("sdr:marcos-foocci");
    expect(compromissos[0].workspaceId).toBe("ws-de-teste");

    const carga = lerCargaDoCompromisso(compromissos[0].message);
    expect(carga).not.toBeNull();
    expect(carga!.dono).toBe("PM");
    expect(carga!.cumprido).toBe(false);
    expect(carga!.texto.toLowerCase()).toMatch(/gerente|aprova[çc][ãa]o/);
    // O prazo é uma DATA real, não uma frase — e está no futuro.
    expect(new Date(carga!.prazoISO).getTime()).toBeGreaterThan(Date.now());

    // 2. A fala que o cliente recebeu agora é honesta: diz que registrou.
    expect(String(corpo.reply)).toContain("Registrei isso com a equipe");
  });

  it("QUANDO o registro NÃO nasce (banco fora do ar), a casa diz a verdade em vez de inventar prazo", async () => {
    db.activityEvent.findFirst.mockRejectedValue(new Error("banco fora do ar"));
    vi.stubGlobal("fetch", vi.fn(async () => respostaDoModelo(FALA_AO_MARCOS)));

    const res = await chamarSdr({
      messages: [],
      currentMessage: "e a proposta?",
      sessionId: "marcos-sem-banco",
      scope: {},
    });
    const corpo = await res.json();
    expect(corpo.ok).toBe(true); // nunca derruba a conversa do cliente

    // Nenhum compromisso foi criado — o banco recusou.
    expect(criadas().filter((l) => l.type === TIPO_COMPROMISSO_DO_SDR)).toHaveLength(0);

    const falaFinal = String(corpo.reply);
    expect(falaFinal).not.toContain("Registrei isso com a equipe");
    expect(falaFinal.toLowerCase()).not.toContain("pode deixar comigo");
    expect(falaFinal.toLowerCase()).not.toContain("vou conferir com o gerente");
    // O item 4 do P0: um "não sei" verdadeiro, nunca um prazo inventado.
    expect(falaFinal).toContain("Não tenho como te confirmar isso");
  });

  it("uma fala SEM escalação (o piso da régua antiga) continua intacta", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaDoModelo("Perfeito! Qual é o seu Instagram?")));

    const res = await chamarSdr({
      messages: [], currentMessage: "oi", sessionId: "visitante-comum", scope: {},
    });
    const corpo = await res.json();
    expect(corpo.reply).toBe("Perfeito! Qual é o seu Instagram?");
    expect(criadas().filter((l) => l.type === TIPO_COMPROMISSO_DO_SDR)).toHaveLength(0);
  });
});
