// A CONVERSA QUE NÃO VIRA PEDIDO SUMIA EM SILÊNCIO (27/08/2026).
//
// O cliente 001 (Foocci) conversou com o SDR às 01:34, o escopo apareceu montado
// na tela, o SDR se despediu — e a produção não tinha UMA linha dele. Medido com
// sessão de master: 19 solicitações, nenhuma é Foocci.
//
// A causa, medida e não presumida: o ÚNICO caminho que grava um
// `ClientRequestDb` é o botão de enviar, e o botão é travado por
// `canSubmitProposal` — nome + negócio + serviço + zero perguntas obrigatórias
// em aberto. Conversa que morre antes disso não tinha porta de gravação
// nenhuma. O escopo acumulado chegava ao servidor a cada turno (`body.scope`) e
// era jogado fora.
//
// ⚠️ **O TESTE QUE IMPORTA É O 1, E ELE ANDA PELA ROTA REAL.** Exercitar só
// `guardarRastroDaConversa` provaria a minha função, não o caminho do cliente —
// e essa é exatamente a régua verde sobre o componente errado que esta casa já
// pagou quatro vezes. O caso 1 dispara `POST /api/sdr/chat` com uma conversa
// que **não fecha o escopo** (é o caso do Foocci) e cobra a linha no banco.

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
import {
  guardarRastroDaConversa,
  resolverRastroDaConversa,
  conversasSemPedido,
  proximaAcaoDoRastro,
  TIPO_CONVERSA_SEM_PEDIDO,
} from "@/lib/agency/comercial/conversa-sem-pedido";

type Criada = { workspaceId: string; type: string; clientId: string; message: string };
const criadas = (): Criada[] =>
  (db.activityEvent.create.mock.calls as unknown as Array<[{ data: Criada }]>).map((c) => c[0].data);

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

// ── 1. O CAMINHO REAL: a conversa do Foocci deixa rastro ────────────────────

describe("a rota que o cliente de verdade usa guarda o escopo", () => {
  it("conversa que NÃO fecha o escopo (o caso do Foocci) deixa rastro recuperável", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaDoModelo("Perfeito, Marcos! Já preparei o escopo.")));

    // O escopo do Foocci como ele estava às 01:34: negócio e pessoa
    // identificados, serviço escolhido — e a conversa termina aqui. Isto NÃO
    // passa em `canSubmitProposal`, então o botão de enviar nunca ficaria
    // disponível e nada seria gravado antes deste conserto.
    const res = await chamarSdr({
      messages: [{ role: "user", text: "oi" }, { role: "assistant", text: "olá!" }],
      currentMessage: "somos um SaaS de CRM para restaurantes",
      sessionId: "prospect-foocci",
      scope: {
        prospectName: "Marcos",
        businessName: "Foocci",
        wantsSocialMedia: true,
        social: { platforms: ["Instagram"] },
      },
    });
    expect((await res.json()).ok).toBe(true);

    const linhas = criadas().filter((l) => l.type === TIPO_CONVERSA_SEM_PEDIDO);
    expect(linhas).toHaveLength(1);
    expect(linhas[0].clientId).toBe("sdr:prospect-foocci");
    expect(linhas[0].workspaceId).toBe("ws-de-teste");

    // O que se recupera é o que a pessoa CONTOU — não um resumo, não um id.
    const carga = JSON.parse(linhas[0].message);
    expect(carga.escopo.businessName).toBe("Foocci");
    expect(carga.escopo.prospectName).toBe("Marcos");
    expect(carga.contato).toEqual({ nome: "Marcos" });
    // 2 turnos anteriores + este.
    expect(carga.turnos).toBe(3);
  });

  it("o rastro é guardado MESMO quando o teto de gasto barra a chamada paga", async () => {
    // O teto de gasto derruba a chamada ao modelo, e a conversa segue pelo
    // motor de regras. O que a pessoa já contou vale exatamente o mesmo —
    // guardar rastro é escrita em banco, não chamada paga. Sem chave, a rota
    // não gasta e ainda assim tem de guardar.
    chaveDeRotaPublica.mockResolvedValue(null);
    vi.stubGlobal("fetch", vi.fn(async () => respostaDoModelo("nunca chamado")));

    await chamarSdr({
      messages: [],
      currentMessage: "quero divulgar meu negócio",
      sessionId: "prospect-sem-chave",
      scope: { businessName: "Foocci", prospectName: "Marcos" },
    });

    expect(criadas().filter((l) => l.type === TIPO_CONVERSA_SEM_PEDIDO)).toHaveLength(1);
  });

  it("visitante que não contou NADA não vira linha — ausência não é informação", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaDoModelo("Oi! Como posso ajudar?")));

    await chamarSdr({ messages: [], currentMessage: "oi", sessionId: "curioso", scope: {} });

    expect(criadas().filter((l) => l.type === TIPO_CONVERSA_SEM_PEDIDO)).toHaveLength(0);
  });

  it("gravar o rastro NUNCA derruba a conversa do cliente", async () => {
    // Registro é nosso; a conversa é dele. Um erro de banco não pode virar tela
    // de erro para o prospect.
    db.activityEvent.findFirst.mockRejectedValue(new Error("banco fora do ar"));
    vi.stubGlobal("fetch", vi.fn(async () => respostaDoModelo("Certo!")));

    const res = await chamarSdr({
      messages: [],
      currentMessage: "oi",
      sessionId: "s-quebrado",
      scope: { businessName: "Foocci" },
    });
    expect((await res.json()).ok).toBe(true);
  });
});

// ── 2. Um rastro por fio, não um por turno ──────────────────────────────────

describe("um rastro por fio", () => {
  it("o segundo turno ATUALIZA o rastro em vez de criar outro", async () => {
    db.activityEvent.findFirst.mockResolvedValue({ id: "ev-1" });

    await guardarRastroDaConversa({
      sessionId: "s1",
      workspaceId: "ws",
      escopo: { businessName: "Foocci", wantsSocialMedia: true },
      turnos: 7,
    });

    expect(db.activityEvent.create).not.toHaveBeenCalled();
    expect(db.activityEvent.update).toHaveBeenCalledTimes(1);
    const arg = db.activityEvent.update.mock.calls[0][0] as { where: { id: string }; data: { message: string } };
    expect(arg.where.id).toBe("ev-1");
    expect(JSON.parse(arg.data.message).escopo.wantsSocialMedia).toBe(true);
  });
});

// ── 3. A conversa que VIRA pedido sai da lista de paradas ───────────────────

describe("resolver o rastro", () => {
  it("apaga o rastro daquele fio quando o briefing sobe", async () => {
    db.activityEvent.deleteMany.mockResolvedValue({ count: 1 });

    expect(await resolverRastroDaConversa("prospect-foocci")).toBe(1);
    expect(db.activityEvent.deleteMany).toHaveBeenCalledWith({
      where: { type: TIPO_CONVERSA_SEM_PEDIDO, clientId: "sdr:prospect-foocci" },
    });
  });

  it("envio SEM fio não apaga o rastro de outra pessoa", async () => {
    // `fioDaConversa` devolve `sdr:sem-sessao` para entrada vazia. Sem esta
    // guarda, um envio sem sessão limparia de uma vez a parada de TODAS as
    // conversas anônimas — um cliente apagando o rastro de outro.
    expect(await resolverRastroDaConversa(undefined)).toBe(0);
    expect(await resolverRastroDaConversa("")).toBe(0);
    expect(db.activityEvent.deleteMany).not.toHaveBeenCalled();
  });
});

// ── 4. A leitura: dono e próxima ação ───────────────────────────────────────

describe("a lista das conversas paradas", () => {
  it("devolve o escopo guardado e não quebra com uma carga ilegível", async () => {
    db.activityEvent.findMany.mockResolvedValue([
      { clientId: "sdr:a", message: "{ isto não é json", timestamp: new Date("2026-08-27T01:00:00Z") },
      {
        clientId: "sdr:b",
        message: JSON.stringify({ v: 1, escopo: { businessName: "Foocci" }, contato: { email: "m@x.invalid" }, turnos: 9 }),
        timestamp: new Date("2026-08-27T01:34:00Z"),
      },
    ]);

    const r = await conversasSemPedido("ws");
    // A linha corrompida é pulada; ela NÃO derruba a lista inteira — esconder
    // todas as conversas perdidas por causa de uma é o contrário do motivo
    // desta função existir.
    expect(r).toHaveLength(1);
    expect(r[0].escopo.businessName).toBe("Foocci");
    expect(r[0].turnos).toBe(9);
  });

  it("a próxima ação é DERIVADA do que o rastro tem, nunca constante", async () => {
    // `clienteDoConvite`/`workspaceId` entraram no rastro em 27/08/2026 para a
    // promoção automática saber DE QUEM é a conversa. A próxima ação não
    // depende deles — segue derivando só do contato declarado.
    const base = {
      fio: "sdr:a", escopo: {}, turnos: 3, paradaEm: new Date(),
      clienteDoConvite: null, atribuicao: null, workspaceId: "ws_1",
      // `prometidoEm` entrou em 29/08/2026 (o carimbo de quando a casa
      // prometeu contato). Aqui é `null` de propósito: estes quatro casos
      // medem a ação derivada do CONTATO, sem promessa nenhuma no meio. A
      // frase que muda quando há promessa tem teste próprio, em
      // `__tests__/agency/promessa/`.
      prometidoEm: null,
      // `contatadoEm`/`contatadoPor` entraram em 29/08/2026 (o ato "a casa
      // contatou esta pessoa"). `null` aqui é de propósito: estes quatro casos
      // medem a ação derivada do CONTATO DECLARADO PELO VISITANTE, sem ato da
      // casa no meio. A frase que muda quando a casa já contatou tem teste
      // próprio, em `__tests__/agency/promessa/`.
      contatadoEm: null,
      contatadoPor: null,
    };

    expect(proximaAcaoDoRastro({ ...base, contato: { email: "m@x.invalid" } })).toContain("e-mail");
    expect(proximaAcaoDoRastro({ ...base, contato: { whatsapp: "551190000" } })).toContain("WhatsApp");
    // Só o nome: a casa NÃO promete retomada que não tem como cumprir.
    expect(proximaAcaoDoRastro({ ...base, contato: { nome: "Marcos" } })).toContain("Não há como retomar");
    expect(proximaAcaoDoRastro({ ...base, contato: null })).toContain("Sem contato nenhum");
  });
});
