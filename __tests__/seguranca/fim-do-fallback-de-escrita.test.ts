// F7 — o fallback de ESCRITA na rota de LEITURA. `.despachos/F7-fim-do-fallback-de-escrita.md`
//
// `app/api/piloto/diagnostico/route.ts` autorizava com
// `process.env.PILOTO_SECRET || process.env.CRON_SECRET`. `CRON_SECRET` é o
// segredo que autoriza ESCRITA em `cron/v2`, e o segredo desta rota trafega em
// `?chave=`, que aparece em log de proxy/CDN. Com `PILOTO_SECRET` ausente ou
// vazia em produção, um segredo de ESCRITA passava a circular em URL de uma
// rota de LEITURA — e por fora era indistinguível de "está tudo certo", porque
// nada quebrava.
//
// O CONSERTO: a rota exige `PILOTO_SECRET`, e só ela. Ausente OU vazia (`""`)
// fecha (503) — nunca autoriza pelo `CRON_SECRET`.
//
// Este teste guarda as DUAS metades: barra o caso plantado (fallback
// reaparecendo) e não inventa problema no caso limpo (`?chave=` e `Bearer`
// continuam funcionando com a chave certa).

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";

const CAMINHO = "app/api/piloto/diagnostico/route.ts";
const ARQUIVO = readFileSync(join(process.cwd(), CAMINHO), "utf8");

describe("no CÓDIGO-FONTE: o caminho de autorização não conhece mais CRON_SECRET", () => {
  it("nenhuma das funções de autorização referencia CRON_SECRET", () => {
    // Corta o arquivo a partir de `segredoConfigurado` (onde a checagem vive)
    // até o fim de `GET` — se `CRON_SECRET` reaparecer aqui, o fallback voltou.
    const inicio = ARQUIVO.indexOf("function segredoConfigurado");
    expect(inicio, "a função segredoConfigurado sumiu do arquivo").toBeGreaterThan(-1);
    const trechoDeAutorizacao = ARQUIVO.slice(inicio);
    expect(trechoDeAutorizacao, "CRON_SECRET voltou a aparecer no caminho de autorização").not.toContain(
      "CRON_SECRET",
    );
  });

  it("segredoConfigurado trata string vazia como ausente, explicitamente", () => {
    expect(ARQUIVO).toMatch(/valor\s*&&\s*valor\.length\s*>\s*0\s*\?\s*valor\s*:\s*null/);
  });

  it("segredoConfere continua sendo a comparação usada — não se inventa uma nova", () => {
    expect(ARQUIVO).toContain("segredoConfere");
  });
});

const bancoMock = vi.hoisted(() => ({
  clientRequestDb: { findMany: vi.fn() },
  conviteDeParceria: { findMany: vi.fn() },
  parceriaDoCliente: { findMany: vi.fn() },
  client: { findMany: vi.fn() },
  approvalRequest: { findMany: vi.fn() },
  pagamentoConfirmado: { findMany: vi.fn() },
}));

vi.mock("@/lib/db/client", () => ({ prisma: bancoMock }));

describe("a ROTA DE VERDADE — PILOTO_SECRET é a única chave que autoriza", () => {
  const PILOTO = "segredo-piloto-de-teste";
  const CRON = "segredo-cron-de-teste-nao-pode-abrir-a-leitura";
  const ANTES = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    bancoMock.clientRequestDb.findMany.mockResolvedValue([]);
    bancoMock.conviteDeParceria.findMany.mockResolvedValue([]);
    bancoMock.parceriaDoCliente.findMany.mockResolvedValue([]);
    bancoMock.client.findMany.mockResolvedValue([]);
    bancoMock.approvalRequest.findMany.mockResolvedValue([]);
    bancoMock.pagamentoConfirmado.findMany.mockResolvedValue([]);
  });

  afterEach(() => {
    process.env = { ...ANTES };
  });

  it("PILOTO_SECRET presente e correto (Bearer) → autoriza (200)", async () => {
    process.env.PILOTO_SECRET = PILOTO;
    delete process.env.CRON_SECRET;
    const { GET } = await import("@/app/api/piloto/diagnostico/route");
    const req = new NextRequest("http://localhost/api/piloto/diagnostico", {
      headers: { authorization: `Bearer ${PILOTO}` },
    });
    const res = await GET(req);
    expect(res.status, JSON.stringify(await res.clone().json())).toBe(200);
  });

  it("PILOTO_SECRET presente e correto (?chave=) → autoriza (200)", async () => {
    process.env.PILOTO_SECRET = PILOTO;
    delete process.env.CRON_SECRET;
    const { GET } = await import("@/app/api/piloto/diagnostico/route");
    const req = new NextRequest(`http://localhost/api/piloto/diagnostico?chave=${PILOTO}`);
    const res = await GET(req);
    expect(res.status, JSON.stringify(await res.clone().json())).toBe(200);
  });

  it("PILOTO_SECRET AUSENTE → 503, mesmo sem CRON_SECRET no ambiente", async () => {
    delete process.env.PILOTO_SECRET;
    delete process.env.CRON_SECRET;
    const { GET } = await import("@/app/api/piloto/diagnostico/route");
    const req = new NextRequest("http://localhost/api/piloto/diagnostico");
    const res = await GET(req);
    expect(res.status).toBe(503);
    const corpo = await res.json();
    expect(corpo.error).toMatch(/PILOTO_SECRET não configurado/);
  });

  it('PILOTO_SECRET VAZIA ("") → 503 — string vazia é tratada como ausente', async () => {
    process.env.PILOTO_SECRET = "";
    delete process.env.CRON_SECRET;
    const { GET } = await import("@/app/api/piloto/diagnostico/route");
    const req = new NextRequest("http://localhost/api/piloto/diagnostico");
    const res = await GET(req);
    expect(res.status).toBe(503);
  });

  it("O TESTE QUE FECHA O DEFEITO: CRON_SECRET presente e PILOTO_SECRET ausente → 503, NUNCA autoriza pelo CRON_SECRET", async () => {
    delete process.env.PILOTO_SECRET;
    process.env.CRON_SECRET = CRON;
    const { GET } = await import("@/app/api/piloto/diagnostico/route");

    // Tenta entrar com a chave de ESCRITA, pelos dois canais que a rota aceita.
    const porHeader = await GET(
      new NextRequest("http://localhost/api/piloto/diagnostico", {
        headers: { authorization: `Bearer ${CRON}` },
      }),
    );
    expect(porHeader.status).toBe(503);

    const porQuery = await GET(new NextRequest(`http://localhost/api/piloto/diagnostico?chave=${CRON}`));
    expect(porQuery.status).toBe(503);
  });

  it("CRON_SECRET presente e PILOTO_SECRET VAZIA → 503, nunca autoriza pelo CRON_SECRET", async () => {
    process.env.PILOTO_SECRET = "";
    process.env.CRON_SECRET = CRON;
    const { GET } = await import("@/app/api/piloto/diagnostico/route");
    const req = new NextRequest(`http://localhost/api/piloto/diagnostico?chave=${CRON}`);
    const res = await GET(req);
    expect(res.status).toBe(503);
  });

  it("chave errada, com PILOTO_SECRET configurado, é 401 (não 503, não 200)", async () => {
    process.env.PILOTO_SECRET = PILOTO;
    delete process.env.CRON_SECRET;
    const { GET } = await import("@/app/api/piloto/diagnostico/route");
    const req = new NextRequest("http://localhost/api/piloto/diagnostico?chave=chave-errada");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
