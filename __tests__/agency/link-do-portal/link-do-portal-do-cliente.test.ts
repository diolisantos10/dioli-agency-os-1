// O link que o aviso carrega TEM DE ABRIR.
//
// Prova, nos dois sentidos, que `linkVivoDoPortal` (o que monta o link) e
// `validatePortalAccess` (o que a porta do portal usa para decidir) leem a
// MESMA fonte: `PortalAccess.token`. É a garantia contra a regressão de
// 15/08/2026 — `avisos.ts` montava o link a partir de `Client.portalToken`,
// uma coluna DIFERENTE, e todo aviso automático saía com um link que a
// própria casa recusava (403).
//
// A "porta" aqui é a MESMA função de produção (`validatePortalAccess`), lendo
// da mesma tabela fake que alimenta `linkVivoDoPortal` — não uma reimplementação
// paralela da regra.

import { describe, it, expect, beforeEach, vi } from "vitest";

interface LinhaDeAcesso {
  id: string;
  token: string;
  clientId: string | null;
  clientRequestId: string | null;
  revokedAt: Date | null;
  expiresAt: Date | null;
  grantedAt: Date;
  accessCount: number;
  lastAccessedAt: Date | null;
  createdAt: Date;
}

interface LinhaDeSolicitacao {
  id: string;
  clientId: string;
}

const estado = vi.hoisted(() => ({
  acessos: [] as LinhaDeAcesso[],
  solicitacoes: [] as LinhaDeSolicitacao[],
}));

const db = vi.hoisted(() => ({
  clientRequestDb: {
    findMany: vi.fn(async ({ where }: { where: { clientId: string } }): Promise<Array<{ id: string }>> =>
      estado.solicitacoes
        .filter((s) => s.clientId === where.clientId)
        .map((s) => ({ id: s.id })),
    ),
  },
  portalAccess: {
    findMany: vi.fn(async ({ where }: { where: { OR: Array<Record<string, unknown>> } }): Promise<LinhaDeAcesso[]> => {
      return estado.acessos.filter((a) => where.OR.some((cond) => {
        if ("clientId" in cond) return a.clientId === (cond as { clientId: string }).clientId;
        if ("clientRequestId" in cond) {
          const alvo = (cond as { clientRequestId: { in: string[] } }).clientRequestId;
          return a.clientRequestId != null && alvo.in.includes(a.clientRequestId);
        }
        return false;
      })).sort((a, b) => b.grantedAt.getTime() - a.grantedAt.getTime());
    }),
    findUnique: vi.fn(async ({ where }: { where: { token: string } }): Promise<LinhaDeAcesso | null> =>
      estado.acessos.find((a) => a.token === where.token) ?? null,
    ),
    update: vi.fn(async ({ where, data }: { where: { token: string }; data: { lastAccessedAt: Date; accessCount: { increment: number } } }) => {
      const linha = estado.acessos.find((a) => a.token === where.token);
      if (linha) {
        linha.lastAccessedAt = data.lastAccessedAt;
        linha.accessCount += data.accessCount.increment;
      }
      return linha;
    }),
  },
}));

vi.mock("@/lib/db/client", () => ({ prisma: db }));

const { linkVivoDoPortal, baseDoPortal } = await import("@/lib/agency/esteira/link-do-portal-do-cliente");
const { validatePortalAccess } = await import("@/lib/agency/persistence/portal-access-service");

function novoAcesso(over: Partial<LinhaDeAcesso> = {}): LinhaDeAcesso {
  return {
    id: `acc_${Math.random().toString(36).slice(2)}`,
    token: `tok_${Math.random().toString(36).slice(2)}`,
    clientId: null,
    clientRequestId: null,
    revokedAt: null,
    expiresAt: null,
    grantedAt: new Date("2026-01-01"),
    accessCount: 0,
    lastAccessedAt: null,
    createdAt: new Date("2026-01-01"),
    ...over,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  estado.acessos = [];
  estado.solicitacoes = [];
  delete process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.APP_URL;
});

describe("o link montado é o que a porta aceita", () => {
  it("com PortalAccess vivo, o link termina com AQUELE token, e a porta aceita", async () => {
    // "tok-vivo-123" é um token FALSO, de uma tabela falsa, que nunca existiu em
    // banco nenhum. Ele precisa ser LITERAL aqui porque o teste prova que o link
    // montado termina exatamente neste token e que a porta o aceita — um valor
    // sorteado não provaria a identidade entre os dois lados, que é a coisa toda
    // que este arquivo existe para medir. A isenção é de LINHA, e por isso a marca
    // fica coladinha na linha que ela isenta:
    // segredo-permitido
    const acesso = novoAcesso({ token: "tok-vivo-123", clientId: "c1" });
    estado.acessos = [acesso];

    const r = await linkVivoDoPortal("c1");
    expect(r.link).toBe(`${baseDoPortal()}/portal/access/tok-vivo-123`);

    const tokenNoLink = r.link!.split("/portal/access/")[1]!;
    const veredito = await validatePortalAccess(tokenNoLink);
    expect(veredito.valid).toBe(true);
  });

  it("um link montado a partir de um cuid AVULSO (o formato antigo de Client.portalToken) é RECUSADO", async () => {
    // Simula exatamente o defeito de 15/08: um token que nunca foi gravado em
    // PortalAccess — porque veio de outra coluna, gerada independentemente.
    // "tok-vivo-123" é um token FALSO, de uma tabela falsa, que nunca existiu em
    // banco nenhum. Ele precisa ser LITERAL aqui porque o teste prova que o link
    // montado termina exatamente neste token e que a porta o aceita — um valor
    // sorteado não provaria a identidade entre os dois lados, que é a coisa toda
    // que este arquivo existe para medir. A isenção é de LINHA, e por isso a marca
    // fica coladinha na linha que ela isenta:
    // segredo-permitido
    estado.acessos = [novoAcesso({ token: "tok-vivo-123", clientId: "c1" })];

    const cuidQueNuncaFoiEmitidoAqui = "ckxx000000000000clientptoken";
    const veredito = await validatePortalAccess(cuidQueNuncaFoiEmitidoAqui);
    expect(veredito.valid).toBe(false);
    expect(veredito.reason).toBe("not_found");
  });
});

describe("token revogado e token vencido contam como 'não vivo'", () => {
  it("revogado → sem link", async () => {
    estado.acessos = [novoAcesso({ token: "tok-revogado", clientId: "c1", revokedAt: new Date("2026-01-02") })];
    const r = await linkVivoDoPortal("c1");
    expect(r.link).toBeNull();
    expect(r.motivo).toMatch(/revogados ou vencidos/);
  });

  it("vencido → sem link", async () => {
    estado.acessos = [novoAcesso({
      token: "tok-vencido", clientId: "c1",
      expiresAt: new Date("2020-01-01"), // no passado
    })];
    const r = await linkVivoDoPortal("c1", new Date("2026-08-29"));
    expect(r.link).toBeNull();
    expect(r.motivo).toMatch(/revogados ou vencidos/);
  });

  it("nunca teve token → motivo diferente de 'revogado/vencido'", async () => {
    estado.acessos = [];
    const r = await linkVivoDoPortal("c1");
    expect(r.link).toBeNull();
    expect(r.motivo).toMatch(/nunca teve token/);
  });
});

describe("cliente cujo acesso está preso ao clientRequestId", () => {
  it("acha o link mesmo sem PortalAccess.clientId preenchido", async () => {
    estado.solicitacoes = [{ id: "req1", clientId: "c2" }];
    estado.acessos = [novoAcesso({ token: "tok-via-solicitacao", clientId: null, clientRequestId: "req1" })];

    const r = await linkVivoDoPortal("c2");
    expect(r.link).toBe(`${baseDoPortal()}/portal/access/tok-via-solicitacao`);

    const veredito = await validatePortalAccess("tok-via-solicitacao");
    expect(veredito.valid).toBe(true);
  });

  it("sem essa leitura, metade da base ficaria com cara de 'nunca teve portal' — a prova é que a leitura direta (só clientId) NÃO acharia nada aqui", async () => {
    estado.solicitacoes = [{ id: "req1", clientId: "c2" }];
    estado.acessos = [novoAcesso({ token: "tok-via-solicitacao", clientId: null, clientRequestId: "req1" })];

    const soPorClientId = estado.acessos.filter((a) => a.clientId === "c2");
    expect(soPorClientId).toHaveLength(0); // provaria "sem portal" se lêssemos só um caminho

    const r = await linkVivoDoPortal("c2");
    expect(r.link).not.toBeNull(); // a função real lê os dois caminhos e acha
  });
});
