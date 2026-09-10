// FURO 1 — A CONVERSA DO PORTAL VAZAVA LATERALMENTE ENTRE CLIENTES
// (ficha de despacho "furo 1", 29/08/2026 — conserto preso no PR #153,
// branch `origin/fix/portal-conversa-de-outro-cliente`, head `bf7497564bba`)
//
// ── O FURO ────────────────────────────────────────────────────────────────
// `montarFiltro`, em `app/api/messages/conversa.ts`, lia a conversa pela
// UNIÃO de duas chaves: `clientId` do dono e `clientRequestId: {in: [...]}`
// de TODAS as solicitações dele. `ClientRequestDb.clientId` não é imutável —
// `/api/admin/reset` zera o campo, e a criação de projeto/aplicação de
// escopo RE-APONTA a mesma solicitação para um `Client` novo. Mensagem
// antiga, gravada só com `clientRequestId` (o formato das escritas legadas,
// sem `clientId` carimbado), casava com a união pelo lado da solicitação —
// e o dono NOVO da solicitação passava a ler a conversa do dono ANTIGO.
// Explorável com o TOKEN DE PORTAL DO PRÓPRIO CLIENTE — não precisa de
// credencial alheia.
//
// ── O QUE ESTE ARQUIVO PORTA, E O QUE NÃO PORTA ─────────────────────────────
// O PR #153 tem 84 arquivos e DUAS partes. Só a Parte A foi portada (a
// inversão de `montarFiltro` para `{ clientId }` puro, e a cerca do ramo do
// prospect): ela fecha ESTE furo sozinha, sem depender de nada mais.
//
// A Parte B (`conversaDoToken` passando a usar um resolvedor único de
// identidade, `escopoDoToken`/`donoDoToken`) NÃO existe nesta base e NÃO foi
// portada — ela resolve um bug DIFERENTE (identidade escolhida antes do
// filtro, quando o próprio token aponta para uma solicitação cujo dono já
// mudou). Por isso este arquivo porta só o "MECANISMO 1" do teste original
// (`conversa-de-outro-cliente.test.ts` do PR) — o que exercita exatamente a
// união pelo lado da solicitação. O "MECANISMO 2" do teste original (cookie
// `dioli_portal` divergindo da tela, `/api/portal/vista`, `donoDaTela`) usa
// infraestrutura que não existe nesta base (rota `/vista` devolve outro
// formato, sem campo `dono`) e pertence a uma frente diferente.
//
// ── AS DUAS METADES ──────────────────────────────────────────────────────
//   ⛔ o dono NOVO de uma solicitação re-apontada NÃO lê mais a conversa do
//      dono ANTIGO — nem uma linha, nem a contagem.
//   ✅ (custo declarado) o dono de sempre continua lendo a própria conversa
//      no caso limpo — MENOS a linha legada sem `clientId` carimbado, que
//      fica oculta até alguém escrever de quem é (não há, nesta base, censo
//      de recuperação — isso também é Parte B).

import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { NextRequest } from "next/server";

const DB_PATH = vi.hoisted(() => {
  const caminho = `${process.cwd()}/prisma/conversa-nao-vaza-entre-clientes.db`;
  process.env.DATABASE_URL = `file:${caminho}`;
  return caminho;
});

const requireSession = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth/api-guard", () => ({ requireSession }));

import { prisma } from "@/lib/db/client";
import { GET as lerConversa } from "@/app/api/portal/messages/route";

const SEGREDO_1 = "SEGREDO-DO-ALFA-1 a combinacao comercial";
const SEGREDO_2 = "SEGREDO-DO-ALFA-2 os valores do briefing";

let ws = "";
let alfa = "";
let beta = "";
let reqAlfa = "";
const TOKEN_ALFA = "tok-alfa-1";
const TOKEN_BETA = "tok-beta-1";

function get(url: string): NextRequest {
  return new NextRequest(`http://localhost${url}`);
}
async function corpos(res: Response): Promise<string[]> {
  const j = (await res.json()) as { messages?: { body: string }[] };
  return (j.messages ?? []).map((m) => m.body);
}

beforeAll(async () => {
  if (existsSync(DB_PATH)) rmSync(DB_PATH);
  execSync("npx prisma db push --accept-data-loss", {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: `file:${DB_PATH}` },
    stdio: "pipe",
  });

  ws = (await prisma.agencyWorkspace.create({ data: { name: "Dioli", slug: `vaz-${Date.now()}` } })).id;
  alfa = (await prisma.client.create({ data: { workspaceId: ws, name: "Agência ALFA" } })).id;
  beta = (await prisma.client.create({ data: { workspaceId: ws, name: "Loja BETA" } })).id;

  // ALFA veio pelo briefing público: tem solicitação. É ela que vai mudar de dono.
  reqAlfa = (await prisma.clientRequestDb.create({
    data: {
      workspaceId: ws, clientId: alfa, businessName: "Agência ALFA", segment: "agência",
      services: "[]", objectives: "[]", status: "in_progress", rawContext: "x",
    },
  })).id;

  // As duas mensagens do ALFA, carimbadas com AS DUAS chaves — o formato que
  // a rota grava hoje.
  await prisma.portalMessage.create({
    data: { clientId: alfa, clientRequestId: reqAlfa, authorRole: "team", authorName: "Equipe Dioli",
            body: SEGREDO_1, createdAt: new Date("2026-08-08T13:28:00Z") },
  });
  await prisma.portalMessage.create({
    data: { clientId: alfa, clientRequestId: reqAlfa, authorRole: "client", authorName: "Agência ALFA",
            body: SEGREDO_2, createdAt: new Date("2026-08-08T14:41:00Z") },
  });
  // Uma mensagem LEGADA: só `clientRequestId`, sem `clientId` — o formato das
  // escritas antigas. Ela é exatamente o que a cerca esconde agora (custo
  // declarado, não perda silenciosa).
  await prisma.portalMessage.create({
    data: { clientRequestId: reqAlfa, authorRole: "team", authorName: "Equipe Dioli",
            body: "recado-legado-sem-clientid", createdAt: new Date("2026-08-07T10:00:00Z") },
  });
  // BETA é cliente DIRETO: sem solicitação nenhuma.
  await prisma.portalMessage.create({
    data: { clientId: beta, authorRole: "client", authorName: "Loja BETA", body: "recado-da-beta" },
  });

  await prisma.portalAccess.create({ data: { token: TOKEN_ALFA, clientId: alfa, clientRequestId: reqAlfa } });
  await prisma.portalAccess.create({ data: { token: TOKEN_BETA, clientId: beta } });

  requireSession.mockResolvedValue({ session: { name: "PM", workspaceId: ws, role: "master" }, error: null });
});

beforeEach(async () => {
  // Estado limpo: a solicitação pertence a quem a criou.
  await prisma.clientRequestDb.update({ where: { id: reqAlfa }, data: { clientId: alfa } });
});

describe("a solicitação muda de dono e leva a conversa junto", () => {
  it("⛔ [CASO PLANTADO] o portal do BETA não vê UMA linha do ALFA depois do re-apontamento", async () => {
    // O re-apontamento que acontece de verdade nesta casa: reset zera o dono,
    // e a criação de projeto/aplicação de escopo aponta a MESMA solicitação
    // para um Client novo.
    await prisma.clientRequestDb.update({ where: { id: reqAlfa }, data: { clientId: beta } });

    const lidas = await corpos(await lerConversa(get(`/api/portal/messages?token=${TOKEN_BETA}`)));

    expect(lidas).not.toContain(SEGREDO_1);
    expect(lidas).not.toContain(SEGREDO_2);
    // Nem o texto, nem a CONTAGEM: o BETA continua com a conversa dele e só.
    expect(lidas).toEqual(["recado-da-beta"]);
  });

  it("✅ (controle) o ALFA nunca teve caminho para a conversa do BETA", async () => {
    await prisma.clientRequestDb.update({ where: { id: reqAlfa }, data: { clientId: beta } });
    const lidas = await corpos(await lerConversa(get(`/api/portal/messages?token=${TOKEN_ALFA}`)));
    expect(lidas).not.toContain("recado-da-beta");
  });

  it("✅ [CASO LIMPO, custo declarado] no caso limpo, só o que tem dono ESCRITO é servido", async () => {
    const lidas = await corpos(await lerConversa(get(`/api/portal/messages?token=${TOKEN_ALFA}`)));
    expect(lidas).toContain(SEGREDO_1);
    expect(lidas).toContain(SEGREDO_2);
    // A linha legada fica de fora — é o custo desta cerca, e é declarado, não
    // silencioso: a casa escolheu "vê menos histórico" a "vê o preço do
    // vizinho".
    expect(lidas).not.toContain("recado-legado-sem-clientid");
  });

  it("⛔ a marcação de lida também é cercada — o BETA não carimba mensagem do ALFA", async () => {
    // Uma mensagem NOVA da equipe para o ALFA, não lida por ele.
    const nova = await prisma.portalMessage.create({
      data: { clientId: alfa, clientRequestId: reqAlfa, authorRole: "team", authorName: "Equipe Dioli",
              body: "nao-lida-do-alfa", readByClient: false },
    });

    await prisma.clientRequestDb.update({ where: { id: reqAlfa }, data: { clientId: beta } });
    await lerConversa(get(`/api/portal/messages?token=${TOKEN_BETA}`));

    const depois = await prisma.portalMessage.findUnique({ where: { id: nova.id } });
    // Se o BETA "lê" a mensagem do ALFA, o alerta de não-lida do ALFA some e o
    // vazamento apaga o próprio rastro.
    expect(depois?.readByClient).toBe(false);

    await prisma.portalMessage.delete({ where: { id: nova.id } });
  });
});
