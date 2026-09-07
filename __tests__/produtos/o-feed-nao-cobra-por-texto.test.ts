// O FEED PRODUZ ARQUIVO — PELAS PORTAS DE VERDADE.
//
// ═══════════════════════════════════════════════════════════════════════════
// O DEFEITO QUE ESTE ARQUIVO REPRODUZ E TRAVA (medido em produção, 25/08/2026)
// ═══════════════════════════════════════════════════════════════════════════
//
// O cliente pedia uma peça para o feed pelo portal, a triagem mandava para
// `post-ou-carrossel` (R$ 79) e o pedido seguia SEM `produtoId`. Sem produto,
// `producao-de-pedido.ts` desviava para o caminho de TEXTO: um `Deliverable`
// com a descrição da arte, um card no portal e o pedido carimbado "entregue".
//
//   • nenhum `SocialPost`;
//   • nenhum `mediaUrl`;
//   • nenhuma imagem.
//
// No portal do cliente aparecia "entregas disponíveis para você" — e não havia
// arquivo para baixar. O dinheiro já tinha entrado.
//
// ═══════════════════════════════════════════════════════════════════════════
// A RÉGUA QUE ESTE ARQUIVO OBEDECE — E A PERGUNTA OBRIGATÓRIA
// ═══════════════════════════════════════════════════════════════════════════
//
// *"O teste alcança o caminho que atende o cliente de verdade, ou um irmão
// pouco usado?"* Nesta operação, sete vezes o defeito estava dentro da régua
// que deveria pegá-lo.
//
// Então aqui não se escreve `SocialPost` na mão e não se chama a orquestradora
// por dentro. Bate-se nas MESMAS portas do navegador do cliente:
//
//   POST /api/portal/pedidos             → o cliente pede, em texto livre
//   POST /api/portal/pedidos/orcamento   → o cliente aceita o orçamento
//   POST /api/admin/pagamentos           → o pagamento, pelo caminho legítimo
//   GET  /api/media/[id]                 → o cliente VÊ a imagem
//   GET  /api/brain/portal-data          → o card chega ao portal dele
//
// Contra BANCO de verdade, CHROMIUM de verdade rasterizando o molde e `sharp`
// de verdade medindo os pixels do arquivo servido. Nenhuma trava é dublada:
// contrato de saída, piso de verdade, juiz da Qualidade, escada de exposição,
// portão de pagamento, gatilho do orçamento, briefing mínimo, portão do fundo,
// trava de texto e a conferência dos bytes rodam todos.
//
// Dublados: as DUAS chamadas pagas (gerador de texto e gerador de imagem), pela
// mesma razão declarada em `story-instagram-v1-ponta-a-ponta.test.ts` — o que
// está sob teste é o TRANSPORTE, não a redação do modelo.
//
// ═══════════════════════════════════════════════════════════════════════════
// A PROVA POR MUTAÇÃO (conferida à mão em 25/08/2026)
// ═══════════════════════════════════════════════════════════════════════════
//
// Desligar o conserto derruba este arquivo, e derruba pelo motivo certo:
//
//   • tirar `produtoId: ID_POST_FEED_V1` do atendimento `post-feed` em
//     `triagem.ts` → "o produto de feed viaja com o pedido" fica vermelho, e
//     logo abaixo "existe peça publicável" acusa 0 `SocialPost`. É exatamente o
//     defeito de produção reaparecendo;
//   • tirar `INSTAGRAM_POST_FEED_V1` de `PRODUTOS_CANONICOS` → a carta de
//     atendimentos nem CARREGA (a catraca de `triagem.ts` derruba o módulo);
//   • trocar `formatoDaPeca: "feed"` por `"story"` no registro → a medida do
//     arquivo servido acusa 1080×1920 contra 1080×1350 exigidos.

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { NextRequest } from "next/server";
import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

const DB_PATH = vi.hoisted(() => {
  const caminho = `${process.cwd()}/prisma/feed-v1-e2e.db`;
  process.env.DATABASE_URL = `file:${caminho}`;
  process.env.RAILWAY_VOLUME_MOUNT_PATH = `${process.cwd()}/.tmp-feed-v1-e2e-midia`;
  return caminho;
});

// ── O TEXTO DO ESPECIALISTA ─────────────────────────────────────────────────
//
// UMA peça, porque o item de tabela (`balcao-post-feed`, R$ 79) cobre uma. É a
// diferença que importa em relação ao Story: aqui o portão de quantidade da
// corrente espera 1, e ele espera 1 porque leu `quantidadeDePecas` do registro
// — não porque alguém digitou o número na corrente.
//
// `direction` nomeia SUJEITO, LUGAR e LUZ porque o portão da direção
// fotografável exige os três e roda de verdade nesta suíte.
const UM_POST = {
  title: "Post de feed — Cantina do Bairro",
  summary: "Uma arte de feed sobre o molho que cozinha desde cedo.",
  items: [
    {
      headline: "O molho que cozinha desde cedo",
      direction: "as mãos do cozinheiro mexendo a panela de molho na cozinha da cantina, luz de janela pela manhã",
      palette: "vermelho e madeira",
      note: "O molho da casa começa a cozinhar antes de a porta abrir.",
    },
  ],
};

const CLASSIFICACAO_DE_FEED = {
  atendimentoId: "post-feed",
  confianca: 95,
  motivo: "o cliente pediu uma arte para o feed do perfil, com todas as letras",
};

const PARECER_APROVADO = { verdict: "aprovado", issues: [], note: "peça no tom da marca" };

vi.mock("@/lib/ai/generate", () => ({
  generate: vi.fn(async (p: { system?: string; user?: string }) => {
    const texto = `${p.system ?? ""}\n${p.user ?? ""}`;
    if (/atendimentoId/.test(texto)) return { ok: true, data: CLASSIFICACAO_DE_FEED };
    if (/agente de Qualidade/i.test(texto)) return { ok: true, data: PARECER_APROVADO };
    return { ok: true, data: UM_POST };
  }),
  anyProviderConfigured: vi.fn(async () => true),
}));

// A foto sintética FOTOGRAFÁVEL — estrutura em 160px ampliada, porque é a
// escala em que `medirFundo` olha. O portão do fundo continua valendo: ele não
// foi contornado, o dublê foi feito fotografável.
vi.mock("@/lib/ai/design-engine", () => ({
  generateDesign: vi.fn(async () => {
    const { default: sharp } = await import("sharp");
    const { createHash } = await import("node:crypto");
    const l = 160, a = 200;
    const dados = Buffer.allocUnsafe(l * a * 3);
    let bloco = createHash("sha256").update("feed-v1-fotografavel").digest();
    for (let i = 0; i < dados.length; i += 32) {
      bloco.copy(dados, i, 0, Math.min(32, dados.length - i));
      bloco = createHash("sha256").update(bloco).digest();
    }
    const png = await sharp(dados, { raw: { width: l, height: a, channels: 3 } })
      .resize(1080, 1350, { kernel: "nearest" })
      .png()
      .toBuffer();
    return { ok: true as const, url: `data:image/png;base64,${png.toString("base64")}`, model: "duble-de-teste" };
  }),
}));

// ── 29/08/2026: `workspaceId: null` ERA UM ESTADO IMPOSSÍVEL ───────────────
//
// `Session.workspaceId` é `string`, não nulável — login de verdade nunca
// devolve sessão de agência sem workspace. Um dublê que encena esse estado
// impossível deixa de proteger: ele testa contra algo que a autenticação real
// não produz.
//
// O `workspaceId` real (do workspace criado no `beforeAll`, mais abaixo) é
// lido de forma PREGUIÇOSA — dentro da função `async () => ({...})`, nunca no
// corpo do módulo — porque `vi.mock` é içado e roda antes de
// `let workspaceId = ""` ser inicializado. A leitura só acontece quando
// `getSession()` é de fato chamada, já dentro de um `it`.
vi.mock("@/lib/auth/session", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/session")>()),
  getSession: vi.fn(async () => ({
    userId: "op-1", role: "master", workspaceId, clientId: null, email: "operador@dioli.test",
  })),
}));

vi.mock("@/lib/agency/radar/library", () => ({
  getActiveInsights: vi.fn(async () => []),
  buildInsightBlock: vi.fn(() => ""),
}));

import { prisma } from "@/lib/db/client";
import { departamentosDaCasa } from "@/lib/agency/escada/degraus";
import { INSTAGRAM_POST_FEED_V1, ID_POST_FEED_V1, dimensaoExigida } from "@/lib/agency/produtos/registro";
import { MIME_DE_IMAGEM_ACEITO } from "@/lib/integrations/meta/formato-de-midia";
import { POST as postPedido } from "@/app/api/portal/pedidos/route";
import { POST as postOrcamento } from "@/app/api/portal/pedidos/orcamento/route";
import { POST as postPagamento } from "@/app/api/admin/pagamentos/route";
import { GET as getMidia } from "@/app/api/media/[id]/route";

// A palavra "story" NÃO aparece — a TRAVA 1-B pararia o pedido, e corretamente.
// A chamada para ação está escrita porque este produto exige briefing mínimo, e
// o portão dele roda de verdade (há um caso abaixo provando isso).
const PEDIDO_DO_CLIENTE =
  "Quero uma arte para o feed do Instagram da cantina falando do molho da casa, " +
  "aquela peça que fica publicada no perfil. Quero que a pessoa venha almoçar aqui.";
const OBJETIVO_DO_CLIENTE = "fazer o pessoal do bairro conhecer o molho da casa";

let workspaceId = "";

interface ClienteDeTeste { clientId: string; clientRequestId: string; projectId: string; token: string; nome: string }

async function abrirClienteFicticio(nome: string): Promise<ClienteDeTeste> {
  // Marcador SEM colchete e contato em `.invalid` — a convenção dos fictícios.
  // Colchete na assinatura da marca é reprovado pela trava de texto, e a peça
  // sairia sem a camada de letra. A trava está certa; quem se adapta é a
  // convenção.
  const nomeFicticio = `${nome} TESTE`;
  const cliente = await prisma.client.create({
    data: {
      workspaceId, name: nomeFicticio, industry: "Alimentação",
      email: `${nome.replace(/\W+/g, "-").toLowerCase()}@teste.invalid`,
      brandBrain: {
        create: {
          primaryColor: "#7A1F1F", secondaryColor: "#E8C89A",
          typography: "serifada", tone: "próximo, de bairro, sem exagero",
        },
      },
    },
  });
  const solicitacao = await prisma.clientRequestDb.create({
    data: {
      workspaceId, clientId: cliente.id, businessName: nomeFicticio, segment: "Alimentação",
      services: JSON.stringify(["social media"]),
      objectives: JSON.stringify([OBJETIVO_DO_CLIENTE]),
      briefingJson: JSON.stringify({ scope: { targetAudience: "moradores do bairro" } }),
      status: "accepted",
    },
  });
  const projeto = await prisma.project.create({
    data: {
      workspaceId, clientId: cliente.id, clientRequestId: solicitacao.id,
      name: `Social — ${nomeFicticio}`, goal: OBJETIVO_DO_CLIENTE,
      stage: "producao", directionApprovedAt: new Date(),
    },
  });
  const acesso = await prisma.portalAccess.create({ data: { clientId: cliente.id, clientRequestId: solicitacao.id } });
  return { clientId: cliente.id, clientRequestId: solicitacao.id, projectId: projeto.id, token: acesso.token, nome: nomeFicticio };
}

function req(url: string, corpo?: unknown): NextRequest {
  return new NextRequest(`http://localhost${url}`, {
    method: corpo === undefined ? "GET" : "POST",
    headers: { "content-type": "application/json", "sec-fetch-site": "same-origin" },
    ...(corpo === undefined ? {} : { body: JSON.stringify(corpo) }),
  });
}

async function pagar(c: ClienteDeTeste, centavos: number): Promise<void> {
  const r = await postPagamento(req("/api/admin/pagamentos", {
    clientRequestId: c.clientRequestId, valorCentavos: centavos,
    observacao: "piloto do feed — cliente fictício de teste",
  }));
  expect(r.status, `pagamento de ${c.nome}`).toBe(200);
}

async function pedirPeloPortal(
  c: ClienteDeTeste, descricao = PEDIDO_DO_CLIENTE, objetivo = OBJETIVO_DO_CLIENTE,
): Promise<{ pedidoId: string }> {
  const r = await postPedido(req("/api/portal/pedidos", { token: c.token, descricao, objetivo }));
  const corpo = await r.json() as Record<string, unknown>;
  const pedidoId = (corpo.pedido as Record<string, unknown>).id as string;
  const emEspera = await prisma.contentRequest.findUniqueOrThrow({ where: { id: pedidoId } });
  if (emEspera.quoteStatus === "pendente") {
    // NADA é produzido antes do aceite — o gatilho do orçamento é do servidor.
    expect(emEspera.deliverableId, "nada é produzido antes de o cliente aceitar o orçamento").toBeNull();
    const ro = await postOrcamento(req("/api/portal/pedidos/orcamento", { token: c.token, pedidoId, decisao: "aceito" }));
    expect(ro.status, `aceite do orçamento de ${c.nome}`).toBe(200);
  }
  return { pedidoId };
}

async function baixarMidia(mediaUrl: string, token: string) {
  const id = mediaUrl.split("/").filter(Boolean).pop()!;
  const r = await getMidia(req(`/api/media/${id}?token=${token}`), { params: Promise.resolve({ id }) } as never);
  return { status: r.status, mime: r.headers.get("content-type"), bytes: Buffer.from(await r.arrayBuffer()) };
}

async function pecasDoPedido(pedidoId: string) {
  const pedido = await prisma.contentRequest.findUniqueOrThrow({ where: { id: pedidoId } });
  const posts = await prisma.socialPost.findMany({ where: { deliverableId: pedido.deliverableId ?? "—" }, orderBy: { createdAt: "asc" } });
  const card = await prisma.approvalRequest.findFirst({ where: { department: `pedido:${pedidoId}` } });
  return { pedido, posts, card };
}

beforeAll(async () => {
  if (existsSync(DB_PATH)) rmSync(DB_PATH);
  if (existsSync(process.env.RAILWAY_VOLUME_MOUNT_PATH!)) {
    rmSync(process.env.RAILWAY_VOLUME_MOUNT_PATH!, { recursive: true, force: true });
  }
  execSync("npx prisma db push --accept-data-loss", {
    cwd: process.cwd(), env: { ...process.env, DATABASE_URL: `file:${DB_PATH}` }, stdio: "pipe",
  });
  const ws = await prisma.agencyWorkspace.create({ data: { name: "Dioli Agência", slug: `feed-e2e-${Date.now()}` } });
  workspaceId = ws.id;
  // A escada é REAL. O que se faz aqui é LIBERAR o degrau, que é a decisão que
  // uma pessoa toma antes de um piloto — a retenção tem teste próprio.
  for (const departmentId of departamentosDaCasa()) {
    await prisma.departmentLadder.create({
      data: { workspaceId, departmentId, degrau: "wide", motivo: "piloto do feed", decididoPor: "diretor" },
    });
  }
}, 300_000);

afterAll(async () => {
  await prisma.$disconnect().catch(() => {});
  if (existsSync(DB_PATH)) rmSync(DB_PATH);
  if (existsSync(process.env.RAILWAY_VOLUME_MOUNT_PATH!)) {
    rmSync(process.env.RAILWAY_VOLUME_MOUNT_PATH!, { recursive: true, force: true });
  }
});

describe("o pedido de FEED vira JPEG 1080x1350 aprovável — não um card de texto", () => {
  it("pedido pelo portal → arquivo real → o cliente vê a imagem", async () => {
    const c = await abrirClienteFicticio("Cantina do Bairro");
    await pagar(c, 7900);

    const { pedidoId } = await pedirPeloPortal(c);
    const { pedido, posts, card } = await pecasDoPedido(pedidoId);

    // ── 1. A IDENTIDADE SOBREVIVEU À TRIAGEM ──────────────────────────────
    // Era ESTA linha que faltava em produção. Sem `produtoId`, tudo abaixo
    // acontecia do mesmo jeito — menos o arquivo.
    expect(pedido.produtoId, "o produto de feed viaja com o pedido").toBe(ID_POST_FEED_V1);
    expect(
      pedido.status,
      `nenhuma falha termina em outro estado que não 'entregue' — motivo: ${pedido.declineReason}`,
    ).toBe("entregue");

    // ── 2. EXISTE PEÇA PUBLICÁVEL, E ELA É DE FEED ────────────────────────
    // Em produção este número era ZERO: nenhum `SocialPost`, nenhum `mediaUrl`.
    expect(posts.length, "o pedido de feed não produziu peça nenhuma — é o defeito de 25/08/2026")
      .toBe(INSTAGRAM_POST_FEED_V1.quantidadeDePecas);
    for (const p of posts) {
      expect(p.format, "SocialPost.format = feed").toBe("feed");
      expect(p.mediaUrl, "mediaUrl gravada").toBeTruthy();
      // A peça NÃO nasce agendada: quem a põe no caminho do relógio é a decisão
      // do cliente, não a produção.
      expect(p.status).toBe("draft");
      // Molde neutro NÃO é degradação aceitável: entregar o cinza padrão
      // chamando de identidade do cliente é risco nomeado no plano.
      expect(p.lastError ?? "", `peça ${p.id} saiu sem a marca do cliente`).not.toMatch(/molde neutro/);
      // `[molde] texto barrado pela trava` = o título não virou pixel. Peça sem
      // título é peça quebrada com cara de peça, e o banco não denuncia.
      expect(p.lastError ?? "", `peça ${p.id} saiu SEM título`).not.toMatch(/texto barrado/);
    }

    // ── 3. O ARQUIVO, PELA ROTA PÚBLICA, MEDIDO NOS PIXELS ────────────────
    //
    // Os BYTES que a rota serve ao cliente — não o campo do banco. É a
    // diferença entre "está entregue" e "há arquivo para baixar", que é
    // exatamente a diferença que o cliente oculto mediu no portal.
    const { default: sharp } = await import("sharp");
    const exigida = dimensaoExigida(INSTAGRAM_POST_FEED_V1);
    expect(exigida, "feed é 1080×1350, e a medida sai do molde que o renderizador obedece")
      .toEqual({ largura: 1080, altura: 1350 });
    for (const p of posts) {
      const baixado = await baixarMidia(p.mediaUrl!, c.token);
      expect(baixado.status, `HTTP de ${p.mediaUrl}`).toBe(200);
      expect(baixado.bytes.length, "o arquivo tem bytes").toBeGreaterThan(1000);
      // JPEG conferido no CABEÇALHO dos bytes servidos.
      expect(baixado.bytes[0]).toBe(0xff);
      expect(baixado.bytes[1]).toBe(0xd8);
      expect(baixado.mime).toContain(MIME_DE_IMAGEM_ACEITO);
      const m = await sharp(baixado.bytes).metadata();
      expect({ largura: m.width, altura: m.height }, "o formato do cliente não sobreviveu à corrente")
        .toEqual(exigida);
    }

    // ── 4. A MARCA ESTÁ NO ARQUIVO ────────────────────────────────────────
    {
      const { conferirMarcaNaPecaFinal } = await import("@/lib/agency/produtos/regua-da-marca-na-peca");
      const marca = await prisma.brandBrain.findFirstOrThrow({ where: { clientId: c.clientId } });
      for (const p of posts) {
        const arquivo = await baixarMidia(p.mediaUrl!, c.token);
        const v = await conferirMarcaNaPecaFinal({ bytes: arquivo.bytes, corDaMarca: marca.primaryColor!, ondeEsta: `peça ${p.id}` });
        expect(v.ok, `entregue como "com a marca aplicada" e o arquivo não carrega a marca: ${v.motivo}`).toBe(true);
      }
    }

    // ── 5. O CARD DO PORTAL TEM A PEÇA DENTRO ─────────────────────────────
    //
    // O que o cliente oculto viu em produção foi o contrário disto: "2 entregas
    // disponíveis para você" e nada para baixar.
    expect(card, "o cliente tem onde decidir").toBeTruthy();
    expect(card!.clientVisible).toBe(true);
    expect(JSON.parse(card!.sourcePostIdsJson ?? "[]"), "o card aponta as peças").toEqual(posts.map((p) => p.id));

    const { GET: portalData } = await import("@/app/api/brain/portal-data/route");
    const resposta = await portalData(new NextRequest(`http://local/api/brain/portal-data?token=${c.token}`));
    expect(resposta.status, "a porta real do portal responde").toBe(200);
    const dados = await resposta.json();
    const cardNoPortal = (dados.approvals ?? []).find((a: { id: string }) => a.id === card!.id);
    expect(cardNoPortal, "o card chega ao portal do cliente").toBeTruthy();
    expect(cardNoPortal.semConteudo, "card sem corpo visual é reprovação imediata").not.toBe(true);
    expect(cardNoPortal.pecas.length).toBe(posts.length);
    for (const peca of cardNoPortal.pecas) {
      expect(peca.capa, "peça sem capa é cartão sem corpo visual").toBeTruthy();
      expect(peca.format).toBe("feed");
    }

    // E o componente REAL monta com esse card: o que se afirma é o HTML que o
    // navegador dele recebe, com a imagem dentro.
    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { AprovacoesDoCliente } = await import("@/components/portal/AprovacoesDoCliente");
    const html = renderToStaticMarkup(
      createElement(AprovacoesDoCliente, {
        aprovacoes: [cardNoPortal], token: c.token, abertaId: cardNoPortal.id,
        onAbrir: () => {}, enviando: false, erro: null, onDecidir: async () => true,
      }),
    );
    expect(
      [...html.matchAll(/<img[^>]+\/api\/media\//g)].length,
      "o cliente é chamado a aprovar sem ver a peça — foi exatamente isto que a produção fez",
    ).toBe(posts.length);
    expect(html, "e os botões de decisão estão na mesma tela").toContain("Aprovar");
  }, 600_000);

  // ── O PORTÃO DO BRIEFING MÍNIMO RODA DE VERDADE ─────────────────────────
  //
  // Sem este caso, a régua de cima poderia estar verde sobre um produto que
  // simplesmente não cobra briefing. `exigeBriefingMinimo: true` no feed é uma
  // decisão, e decisão sem prova é intenção.
  it("sem chamada para ação, o feed NÃO produz e NÃO gasta IA de imagem", async () => {
    const c = await abrirClienteFicticio("Cantina Sem Chamada");
    await pagar(c, 7900);
    // NENHUM dos dois campos tem chamada para ação — e os dois são conferidos
    // (`briefing-minimo.ts` procura nos dois de propósito, porque "para quê" e
    // "o que a pessoa deve fazer" são a mesma pergunta na cabeça de quem
    // escreve). "conhecer", que está no objetivo do caso normal, É chamada.
    const { pedidoId } = await pedirPeloPortal(
      c,
      "Quero uma arte para o feed do Instagram da cantina falando do molho da casa.",
      "deixar o perfil da cantina mais bonito",
    );
    const { pedido, posts } = await pecasDoPedido(pedidoId);
    expect(pedido.status, "produção iniciada sem o briefing mínimo").not.toBe("entregue");
    expect(pedido.declineReason ?? "", "a parada tem de dizer O QUE FALTA, e ser acionável")
      .toMatch(/O QUE VOCÊ QUER QUE A PESSOA FAÇA/i);
    expect(posts.length, "nenhuma peça — e nenhuma imagem paga — antes do briefing").toBe(0);
  }, 300_000);
});
