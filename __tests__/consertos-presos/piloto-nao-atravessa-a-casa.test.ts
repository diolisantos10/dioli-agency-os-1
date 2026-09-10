// O PILOTO ASSISTIDO NÃO ATRAVESSA A CASA — o recorte de workspace na rota.
//
// ─── O DEFEITO, E POR QUE ELE TINHA DANO HOJE ────────────────────────────────
//
// `POST /api/v2/assistido` recebia `clienteId` do CORPO e fazia
// `prisma.client.findUnique({ where: { id: clienteId } })` — sem uma palavra
// sobre workspace. Quem tivesse a porta aberta escolhia o cliente de qualquer
// casa, e a consequência não era teórica:
//
//   • `acao: "ciclo"` roda a cadeia de IA inteira → GASTA DINHEIRO de verdade;
//   • cria `ClientRequest` na ficha alheia;
//   • termina em `createApprovalRequest({ clientVisible: true })` → um card que
//     APARECE NO PORTAL de um cliente que não é seu.
//
//   • `acao: "status"` despejava execução, recusa e handoff de TODOS os
//     clientes de TODAS as casas — nome, função, custo e correlação.
//
// E a porta abria com `PILOTO_SECRET || CRON_SECRET`: o segredo do relógio (que
// serve para bater heartbeat e ler censo) virava, de carona, segredo de gastar
// dinheiro e escrever no portal do cliente.
//
// ─── AS DUAS METADES ─────────────────────────────────────────────────────────
//
// Metade 1 — BARRA: cliente de outra casa não roda cadeia, não cria pedido e
//            não cria card; o status de uma casa não enxerga a outra; o
//            `CRON_SECRET` sozinho não abre mais nada.
// Metade 2 — NÃO INVENTA PROBLEMA NO CASO LIMPO: o operador da própria casa
//            roda o ciclo, cria o card e lê o próprio status como sempre; e o
//            `PILOTO_SECRET` continua abrindo a porta.
//
// ⚠️ Nada aqui é JSON escrito à mão sobre o resultado: tudo entra pela ROTA de
// produção, contra um banco de mentira que GUARDA o que recebe.

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

// ── O banco de mentira ──────────────────────────────────────────────────────

interface Linha { [campo: string]: unknown }

const dados = vi.hoisted(() => ({
  workspaces: [] as Linha[],
  clients: [] as Linha[],
  flags: [] as Linha[],
  execucoes: [] as Linha[],
  recusas: [] as Linha[],
  handoffs: [] as Linha[],
  pedidosAtualizados: [] as string[],
}));

const helpers = vi.hoisted(() => {
  function comparar(valor: unknown, cond: unknown): boolean {
    if (cond && typeof cond === "object" && !Array.isArray(cond) && !(cond instanceof Date)) {
      const c = cond as Record<string, unknown>;
      if ("in" in c) return (c.in as unknown[]).includes(valor);
      if ("startsWith" in c) return typeof valor === "string" && valor.startsWith(c.startsWith as string);
      if ("not" in c) return valor !== c.not;
    }
    return valor === cond;
  }
  function casa(linha: Record<string, unknown>, where?: Record<string, unknown>): boolean {
    if (!where) return true;
    const { OR, ...resto } = where as { OR?: Record<string, unknown>[] } & Record<string, unknown>;
    if (OR && !OR.some((w) => casa(linha, w))) return false;
    return Object.entries(resto).every(([campo, cond]) => comparar(linha[campo], cond));
  }
  return { casa };
});

const db = vi.hoisted(() => {
  const { casa } = helpers;
  const tabela = (linhas: () => Record<string, unknown>[]) => ({
    findMany: vi.fn(async (args?: { where?: Record<string, unknown>; take?: number }) => {
      const achadas = linhas().filter((l) => casa(l, args?.where));
      return args?.take ? achadas.slice(0, args.take) : achadas;
    }),
    findFirst: vi.fn(async (args?: { where?: Record<string, unknown> }) =>
      linhas().find((l) => casa(l, args?.where)) ?? null),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      const linha = { id: `novo-${linhas().length}`, ...data };
      linhas().push(linha);
      return linha;
    }),
  });
  return {
    agencyWorkspace: tabela(() => dados.workspaces),
    client: tabela(() => dados.clients),
    flagV2: tabela(() => dados.flags),
    execucaoV2: tabela(() => dados.execucoes),
    recusaV2: tabela(() => dados.recusas),
    handoffV2: tabela(() => dados.handoffs),
    clientRequestDb: {
      update: vi.fn(async ({ where }: { where: { id: string } }) => {
        dados.pedidosAtualizados.push(where.id);
        return { id: where.id };
      }),
    },
  };
});
vi.mock("@/lib/db/client", () => ({ prisma: db }));

// ── A sessão (o portão de direção) ──────────────────────────────────────────

const sessao = vi.hoisted(() => ({
  atual: null as null | { userId: string; workspaceId: string },
}));
vi.mock("@/lib/agency/organizacao/guarda", () => ({
  exigirAdministracao: vi.fn(async () => {
    if (!sessao.atual) {
      const { NextResponse } = await import("next/server");
      return { acesso: null, erro: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
    }
    return {
      acesso: {
        session: { userId: sessao.atual.userId, workspaceId: sessao.atual.workspaceId },
        perfil: { autoridade: "director", departamentos: [] },
      },
      erro: null,
    };
  }),
}));

// ── A cadeia e os escritores: espiões, para provar que NÃO foram chamados ───

const cadeia = vi.hoisted(() => ({
  executarCicloAssistido: vi.fn(async () => ({
    ok: true,
    passos: [{ departamentoId: "design", funcaoId: "peca", decisao: "feito", custoUsd: 0.42 }],
    custoTotalUsd: 0.42,
    artefatos: {},
    parouEm: null,
  })),
}));
vi.mock("@/lib/agency/esteira-assistida/cadeia", () => cadeia);
vi.mock("@/lib/agency/esteira-assistida/adaptador-de-ia", () => ({ realizarComIA: () => async () => ({ saida: "", custoUsd: 0 }) }));

const escritores = vi.hoisted(() => ({
  createClientRequest: vi.fn(async () => ({ id: "req-novo" })),
  createApprovalRequest: vi.fn(async (): Promise<{ id: string }> => ({ id: "card-novo" })),
  // O rastro tecnico foi para o comentario INTERNO quando o furo do custo na
  // tela do cliente fechou (porte do #158). O dublê precisa conhecer o export
  // novo, senao a rota explode antes de chegar na assercao de posse.
  addApprovalComment: vi.fn(async (): Promise<{ id: string }> => ({ id: "comentario-novo" })),
}));
vi.mock("@/lib/agency/persistence/client-request-service", () => ({ createClientRequest: escritores.createClientRequest }));
vi.mock("@/lib/agency/persistence/approval-service", () => ({
  createApprovalRequest: escritores.createApprovalRequest,
  addApprovalComment: escritores.addApprovalComment,
}));

import { POST } from "@/app/api/v2/assistido/route";

// ── O cenário: duas casas, um cliente em cada ───────────────────────────────

const CASA_A = "ws-a";
const CASA_B = "ws-b";
const CLIENTE_A = "cli-a";
const CLIENTE_B = "cli-b";

function pedir(corpo: unknown, cabecalhos: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost/api/v2/assistido", {
    method: "POST",
    body: JSON.stringify(corpo),
    // ⚠️ AJUSTE em relação ao #161 (que não conhece a guarda CSRF, adicionada
    // depois pelo commit 21899530): sem `Sec-Fetch-Site`/`Origin`/`Referer` a
    // FAIXA 1 (`deveBloquearMutacaoCrossSite`) bloqueia por padrão (caso 4 —
    // os três ausentes), e todo teste do caminho de SESSÃO cairia em 403 antes
    // de alcançar o recorte de workspace que este arquivo prova. O caminho por
    // segredo (Authorization Bearer) não passa por essa guarda — ver a rota —
    // então só o caso "mesma origem" precisa ser simulado aqui.
    headers: { "content-type": "application/json", "sec-fetch-site": "same-origin", ...cabecalhos },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.PILOTO_SECRET;
  delete process.env.CRON_SECRET;
  sessao.atual = { userId: "u-dir-a", workspaceId: CASA_A };
  dados.workspaces = [
    { id: CASA_A, createdAt: new Date("2026-01-01") },
    { id: CASA_B, createdAt: new Date("2026-02-01") },
  ];
  dados.clients = [
    { id: CLIENTE_A, workspaceId: CASA_A, name: "Cliente da Casa A" },
    { id: CLIENTE_B, workspaceId: CASA_B, name: "Cliente da Casa B" },
  ];
  // A chave do piloto virada nos DOIS clientes: o que barra tem de ser o
  // workspace, não a flag desligada por acaso.
  dados.flags = [
    { chave: "v2_execucao", escopo: CLIENTE_A, ligada: true, motivo: "piloto", decididoPor: "ceo" },
    { chave: "v2_execucao", escopo: CLIENTE_B, ligada: true, motivo: "piloto", decididoPor: "ceo" },
  ];
  dados.execucoes = [
    { funcaoId: "peca", clienteId: CLIENTE_A, ator: "ia", modelo: "m", custoUsd: 0.1, correlationId: `assistido:${CLIENTE_A}:r1`, inicio: new Date("2026-08-15") },
    { funcaoId: "peca", clienteId: CLIENTE_B, ator: "ia", modelo: "m", custoUsd: 9.9, correlationId: `assistido:${CLIENTE_B}:r2`, inicio: new Date("2026-08-15") },
  ];
  dados.recusas = [
    { funcaoId: "peca", motivo: "sem marca", clienteId: CLIENTE_A, correlationId: `assistido:${CLIENTE_A}:r1`, em: new Date("2026-08-15") },
    { funcaoId: "peca", motivo: "segredo do cliente B", clienteId: CLIENTE_B, correlationId: `assistido:${CLIENTE_B}:r2`, em: new Date("2026-08-15") },
  ];
  dados.handoffs = [
    { deDepartamento: "design", paraDepartamento: "social-media", status: "aceito", correlationId: `assistido:${CLIENTE_A}:r1`, criadoEm: new Date("2026-08-15") },
    { deDepartamento: "design", paraDepartamento: "social-media", status: "aceito", correlationId: `assistido:${CLIENTE_B}:r2`, criadoEm: new Date("2026-08-15") },
  ];
  dados.pedidosAtualizados = [];
});

describe('acao "ciclo" — o clienteId do corpo não atravessa a casa', () => {
  it("⛔ cliente de OUTRA casa: 404, cadeia NÃO roda, pedido NÃO nasce, card NÃO aparece no portal", async () => {
    const res = await POST(pedir({ acao: "ciclo", clienteId: CLIENTE_B, solicitacao: "faz um post" }));
    expect(res.status).toBe(404);

    // As três consequências reais, uma a uma.
    expect(cadeia.executarCicloAssistido).not.toHaveBeenCalled();   // dinheiro
    expect(escritores.createClientRequest).not.toHaveBeenCalled();  // ficha alheia
    expect(escritores.createApprovalRequest).not.toHaveBeenCalled(); // portal do cliente
  });

  it("⛔ e a recusa NÃO conta a quem tentou que o id existe", async () => {
    const res = await POST(pedir({ acao: "ciclo", clienteId: CLIENTE_B, solicitacao: "faz um post" }));
    const corpo = await res.json();
    expect(corpo.error).not.toContain("Casa B");
    expect(corpo.error).not.toContain("workspace");
  });

  it("✅ o MESMO pedido, com o cliente da própria casa, roda inteiro", async () => {
    const res = await POST(pedir({ acao: "ciclo", clienteId: CLIENTE_A, solicitacao: "faz um post" }));
    expect(res.status).toBe(200);
    const corpo = await res.json();
    expect(corpo.ok).toBe(true);
    expect(cadeia.executarCicloAssistido).toHaveBeenCalledTimes(1);
    expect(escritores.createClientRequest).toHaveBeenCalledTimes(1);
    expect(escritores.createApprovalRequest).toHaveBeenCalledTimes(1);
    expect(corpo.approvalRequestId).toBe("card-novo");
  });

  it("✅ o operador da casa B alcança o cliente B — o recorte separa, não achata", async () => {
    sessao.atual = { userId: "u-dir-b", workspaceId: CASA_B };
    const res = await POST(pedir({ acao: "ciclo", clienteId: CLIENTE_B, solicitacao: "faz um post" }));
    expect(res.status).toBe(200);
    expect(cadeia.executarCicloAssistido).toHaveBeenCalledTimes(1);
  });
});

describe('acao "status" — a auditoria de uma casa só', () => {
  it("⛔ não devolve execução, recusa nem handoff da outra casa", async () => {
    const res = await POST(pedir({ acao: "status" }));
    const corpo = await res.json();
    const texto = JSON.stringify(corpo);
    expect(texto).not.toContain(CLIENTE_B);
    expect(texto).not.toContain("segredo do cliente B");
    expect(texto).not.toContain("9.9");
  });

  it("✅ devolve o que é da própria casa — chave, execução, recusa e handoff", async () => {
    const res = await POST(pedir({ acao: "status" }));
    const corpo = await res.json();
    expect(corpo.chaves.map((c: { escopo: string }) => c.escopo)).toEqual([CLIENTE_A]);
    expect(corpo.execucoes).toHaveLength(1);
    expect(corpo.execucoes[0].clienteId).toBe(CLIENTE_A);
    expect(corpo.recusas).toHaveLength(1);
    expect(corpo.handoffs).toHaveLength(1);
    expect(corpo.handoffs[0].correlationId).toBe(`assistido:${CLIENTE_A}:r1`);
  });

  it("casa sem cliente nenhum devolve VAZIO — nunca tudo", async () => {
    sessao.atual = { userId: "u-dir-c", workspaceId: "ws-vazia" };
    const res = await POST(pedir({ acao: "status" }));
    const corpo = await res.json();
    expect(corpo).toEqual({ chaves: [], execucoes: [], recusas: [], handoffs: [] });
  });
});

describe("🔴 o segredo do RELÓGIO não abre mais a porta de gastar dinheiro", () => {
  it("⛔ Bearer CRON_SECRET, sem sessão: NÃO passa, e nada roda", async () => {
    process.env.CRON_SECRET = "segredo-do-relogio";
    sessao.atual = null; // sem sessão: só o token poderia abrir
    const res = await POST(
      pedir({ acao: "ciclo", clienteId: CLIENTE_A, solicitacao: "faz um post" }, { authorization: "Bearer segredo-do-relogio" }),
    );
    expect(res.status).toBe(401);
    expect(cadeia.executarCicloAssistido).not.toHaveBeenCalled();
    expect(escritores.createApprovalRequest).not.toHaveBeenCalled();
  });

  it("✅ PILOTO_SECRET continua abrindo — a trava é a reutilização, não o token", async () => {
    process.env.PILOTO_SECRET = "segredo-do-piloto";
    process.env.CRON_SECRET = "segredo-do-relogio";
    sessao.atual = null;
    const res = await POST(
      pedir({ acao: "ciclo", clienteId: CLIENTE_A, solicitacao: "faz um post" }, { authorization: "Bearer segredo-do-piloto" }),
    );
    expect(res.status).toBe(200);
    expect(cadeia.executarCicloAssistido).toHaveBeenCalledTimes(1);
  });

  it("⛔ sem PILOTO_SECRET no ambiente o caminho por token nem abre (fail-closed)", async () => {
    sessao.atual = null;
    const res = await POST(pedir({ acao: "status" }, { authorization: "Bearer qualquer-coisa" }));
    expect(res.status).toBe(401);
  });

  it("o operador da sala de controle opera A CASA — o workspace mais antigo, e só ele", async () => {
    process.env.PILOTO_SECRET = "segredo-do-piloto";
    sessao.atual = null;
    const res = await POST(pedir({ acao: "status" }, { authorization: "Bearer segredo-do-piloto" }));
    const corpo = await res.json();
    expect(JSON.stringify(corpo)).not.toContain(CLIENTE_B);
    expect(corpo.execucoes[0].clienteId).toBe(CLIENTE_A);
  });
});
