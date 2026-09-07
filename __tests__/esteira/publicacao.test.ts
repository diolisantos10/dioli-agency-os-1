import { describe, it, expect, beforeEach, vi } from "vitest";

const db = vi.hoisted(() => ({
  project: { findUnique: vi.fn() },
  deliverable: { findMany: vi.fn() },
  socialPost: { findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  metaConnection: { findFirst: vi.fn() },
  activityEvent: { create: vi.fn() },
  // 08/08/2026: a publicação passou a conferir o MIME de cada arquivo antes de
  // falar com a Meta (o Instagram só aceita JPEG). Ver
  // `lib/integrations/meta/formato-de-midia.ts`.
  mediaAsset: { findMany: vi.fn() },
}));

/** Toda mídia pedida existe e é JPEG — o caso limpo destes testes, que são
 *  sobre O RELÓGIO, não sobre formato de arquivo. O formato tem teste próprio
 *  em `__tests__/meta/formato-de-midia.test.ts`. */
const midiaTodaJpeg = async (args?: { where?: { id?: { in?: string[] } } }) =>
  (args?.where?.id?.in ?? []).map((id) => ({ id, mimeType: "image/jpeg" }));
const publishPost = vi.hoisted(() => vi.fn());
const conexaoDoCliente = vi.hoisted(() => vi.fn());
// 09/08/2026: a entrega passou a consultar a régua de marca antes de publicar
// (`lib/agency/esteira/contrato-de-marca.ts`). Estes testes são sobre O RELÓGIO,
// então o caso limpo é uma marca constituída; o portão tem teste próprio.
const contratoDeMarca = vi.hoisted(() => vi.fn());
vi.mock("@/lib/agency/esteira/contrato-de-marca", () => ({ contratoDeMarca }));
vi.mock("@/lib/db/client", () => ({ prisma: db }));
vi.mock("@/lib/integrations/meta/client", () => ({ publishPost }));
vi.mock("@/lib/integrations/meta/connections", () => ({ conexaoDoCliente }));
vi.mock("@/lib/agency/media/armazenamento", () => ({
  caminhoPublicoAssinado: (id: string) => `/api/media/${id}?exp=1&sig=abc`,
}));

import {
  agendarPecasAprovadas,
  agendarPostsDaEntrega,
  aprovarCalendario,
  publicarAgendados,
  extrairPecas,
  motivoParaNaoVirarCalendario,
} from "@/lib/agency/esteira/publicacao";
// A prova de que o cancelamento (`refacao.ts`) e o calendário (este arquivo)
// falam a MESMA língua: o único valor que passa por `motivoParaNaoVirarCalendario`
// é "quality_ok" — então marcar `REVISION_STATUS_DO_CANCELAMENTO` tranca esta
// porta por construção, sem que este arquivo precise conhecer o nome do estado.
import { REVISION_STATUS_DO_CANCELAMENTO } from "@/lib/agency/esteira/refacao";

const CONTEUDO = `**1. Bastidor da produção**
- Pilar: Bastidores
- Formato: Reels
- Legenda: Todo dia às 5 da manhã a massa já está descansando. É esse tempo que dá o sabor.

**2. O pão do dia**
- Pilar: Produto
- Formato: Feed
- Legenda: Saiu do forno agora. Se você passar aqui até as 10, pega quentinho.`;

const projeto = {
  id: "p1", workspaceId: "ws1", clientId: "c1", clientRequestId: "cr1",
  presentedAt: new Date("2026-08-01"),
};

beforeEach(() => {
  contratoDeMarca.mockResolvedValue({
    texto: "QUEM É\nMarca: Cliente", marcaVersao: "mv_teste0001",
    lacunas: [], cortado: [], naoConstituida: false,
  });
  vi.clearAllMocks();
  db.mediaAsset.findMany.mockImplementation(midiaTodaJpeg);
  db.project.findUnique.mockResolvedValue({ ...projeto });
  // ⚠️ 13/08/2026 — `visibility` e `revisionStatus` passaram a ser
  // OBRIGATÓRIOS na fixture, e a exigência é o conserto em si: o agendamento
  // recusa entrega que a escada não liberou ou que a Qualidade não aprovou
  // (`publicacao.ts`, `motivoParaNaoVirarCalendario`). Esta fixture não os
  // declarava — e uma entrega sem os dois campos é exatamente o que pôs 10
  // peças reprovadas no calendário do CityJobs em 07/08. Estes testes são
  // sobre O RELÓGIO, então o caso limpo é a entrega liberada e aprovada; a
  // recusa tem bloco próprio no fim do arquivo.
  db.deliverable.findMany.mockResolvedValue([
    { id: "d1", name: "Calendário de conteúdo", content: CONTEUDO, type: "social",
      visibility: "compartilhado", revisionStatus: "quality_ok" },
  ]);
  db.socialPost.findMany.mockResolvedValue([]);
  db.socialPost.findFirst.mockResolvedValue(null);
  // A confirmação de estado, na hora, antes de falar com a Meta: o caso limpo
  // destes testes é a peça CONTINUAR agendada — quem prova a decisão do
  // cliente chegando no meio da rodada é `cancelamento-para-a-producao.test.ts`.
  db.socialPost.findUnique.mockResolvedValue({ status: "scheduled" });
  db.socialPost.create.mockResolvedValue({});
  db.socialPost.update.mockResolvedValue({});
  conexaoDoCliente.mockResolvedValue({ id: "mc1", status: "connected" });
  db.activityEvent.create.mockResolvedValue({});
  publishPost.mockResolvedValue({ ok: true, externalPostId: "ig_1", permalink: "https://insta/p/1" });
});

describe("a entrega vira calendário", () => {
  it("cada peça do texto vira um post com data", async () => {
    const r = await agendarPostsDaEntrega("p1");
    expect(r.criados).toBe(2);
    expect(db.socialPost.create).toHaveBeenCalledTimes(2);
  });

  it("o post nasce em rascunho — quem aprova o calendário é o cliente", async () => {
    await agendarPostsDaEntrega("p1");
    for (const call of db.socialPost.create.mock.calls) {
      expect(call[0].data.status).toBe("draft");
    }
  });

  it("nada é agendado antes de o cliente ver o pacote", async () => {
    db.project.findUnique.mockResolvedValue({ ...projeto, presentedAt: null });
    const r = await agendarPostsDaEntrega("p1");
    expect(r.criados).toBe(0);
    expect(db.socialPost.create).not.toHaveBeenCalled();
  });

  it("a primeira data é no futuro — o cliente merece olhar antes de algo ir ao ar", async () => {
    await agendarPostsDaEntrega("p1");
    const primeira = db.socialPost.create.mock.calls[0]![0].data.scheduledFor as Date;
    expect(primeira.getTime()).toBeGreaterThan(Date.now());
  });

  it("entrega que já virou calendário não vira de novo — senão o relógio duplica tudo", async () => {
    db.socialPost.findMany.mockResolvedValue([{ deliverableId: "d1" }]);
    const r = await agendarPostsDaEntrega("p1");
    expect(r.criados).toBe(0);
    expect(r.jaAgendadas).toBe(1);
  });

  it("a idempotência é POR ENTREGA — o mês 2 precisa poder ser agendado", async () => {
    // Mês 1 já agendado; uma entrega nova chega. Se a trava fosse por projeto,
    // o cliente pagaria o mês 2 e não sairia post nenhum.
    db.deliverable.findMany.mockResolvedValue([
      { id: "d1", name: "Mês 1", content: CONTEUDO, type: "social",
        visibility: "compartilhado", revisionStatus: "quality_ok" },
      { id: "d2", name: "Mês 2", content: CONTEUDO, type: "social",
        visibility: "compartilhado", revisionStatus: "quality_ok" },
    ]);
    db.socialPost.findMany.mockResolvedValue([{ deliverableId: "d1" }]);
    const r = await agendarPostsDaEntrega("p1");
    expect(r.jaAgendadas).toBe(1);
    expect(r.criados).toBe(2);
  });

  it("o mês 2 começa depois do fim do mês 1 — não em cima", async () => {
    const fimDoMes1 = new Date(Date.now() + 20 * 24 * 60 * 60_000);
    db.socialPost.findFirst.mockResolvedValue({ scheduledFor: fimDoMes1 });
    await agendarPostsDaEntrega("p1");
    const primeira = db.socialPost.create.mock.calls[0]![0].data.scheduledFor as Date;
    expect(primeira.getTime()).toBeGreaterThan(fimDoMes1.getTime());
  });

  it("entrega que o leitor não entende é relatada, não engolida", async () => {
    db.deliverable.findMany.mockResolvedValue([
      { id: "d9", name: "Calendário estranho", content: "texto solto sem peças", type: "social",
        visibility: "compartilhado", revisionStatus: "quality_ok" },
    ]);
    const r = await agendarPostsDaEntrega("p1");
    expect(r.criados).toBe(0);
    expect(r.naoInterpretadas).toEqual(["Calendário estranho"]);
  });
});

// ─── O FURO DA ESCADA, FECHADO (13/08/2026) ─────────────────────────────────
//
// Medido em produção em 07/08 e aberto por seis dias
// (`docs/projetos/cityjobs-registro-07-08.md:172`): a escada de exposição
// guardava o `Deliverable` e o `SocialPost` não passava por ela. As 10 peças
// reprovadas à mão apareceram no calendário do cliente como "compartilhado".
//
// Cada teste abaixo tem as DUAS metades: o que barra e o que continua passando.
// Sem a segunda, um filtro que reprovasse tudo passaria neste arquivo.

describe("o calendário só recebe o que a escada liberou e a Qualidade aprovou", () => {
  const entrega = (extra: Record<string, unknown>) => [{
    id: "d1", name: "Social — semana 1", content: CONTEUDO, type: "social",
    visibility: "compartilhado", revisionStatus: "quality_ok", ...extra,
  }];

  it("entrega retida pela escada (interno) NÃO vira post", async () => {
    db.deliverable.findMany.mockResolvedValue(entrega({ visibility: "interno" }));
    const r = await agendarPostsDaEntrega("p1");
    expect(r.criados).toBe(0);
    expect(db.socialPost.create).not.toHaveBeenCalled();
    expect(r.retidas[0]!.motivo).toMatch(/escada/i);
  });

  it("entrega liberada pela escada VIRA post — a trava não pode barrar tudo", async () => {
    db.deliverable.findMany.mockResolvedValue(entrega({}));
    const r = await agendarPostsDaEntrega("p1");
    expect(r.criados).toBe(2);
    expect(r.retidas).toEqual([]);
  });

  it("entrega REPROVADA pela Qualidade NÃO vira post", async () => {
    db.deliverable.findMany.mockResolvedValue(entrega({ revisionStatus: "quality_flag" }));
    const r = await agendarPostsDaEntrega("p1");
    expect(r.criados).toBe(0);
    expect(db.socialPost.create).not.toHaveBeenCalled();
    expect(r.retidas[0]!.motivo).toContain("quality_flag");
  });

  it("entrega SEM parecer da Qualidade NÃO vira post — ausência não é aprovação", async () => {
    db.deliverable.findMany.mockResolvedValue(entrega({ revisionStatus: null }));
    const r = await agendarPostsDaEntrega("p1");
    expect(r.criados).toBe(0);
    expect(r.retidas[0]!.motivo).toMatch(/ausência não é aprovação/i);
  });

  it("entrega NÃO AUDITADA NÃO vira post — auditor mudo nunca é aprovado", async () => {
    // ── A DECISÃO VIROU EM 26/08/2026, E É UMA DECISÃO ────────────────────
    // Até aqui este teste afirmava o contrário, com o comentário certo: "este
    // teste existe para que mudar isso seja uma decisão, e não um efeito
    // colateral". A decisão foi tomada com a medida na mão — 9 entregas
    // chegaram ao cliente sem árbitro nenhum (cliente oculto em produção,
    // 25/08/2026) — e igualou esta política à que `marcos.ts:208` já aplicava
    // na APRESENTAÇÃO desde 24/08. Duas políticas sobre o mesmo estado eram o
    // defeito; a que ficou é a fail-closed.
    db.deliverable.findMany.mockResolvedValue(entrega({ revisionStatus: "quality_nao_auditado" }));
    const r = await agendarPostsDaEntrega("p1");
    expect(r.criados).toBe(0);
    // E ela NÃO some: sai com nome e motivo, para ser destravada por quem
    // conectar a auditoria. Peça retida em silêncio seria o defeito oposto.
    expect(r.retidas[0]!.motivo).toContain("quality_nao_auditado");
  });

  it("a retenção NÃO é silenciosa — vira ActivityEvent com nome e motivo", async () => {
    db.deliverable.findMany.mockResolvedValue(entrega({ visibility: "interno" }));
    await agendarPostsDaEntrega("p1");
    const evento = db.activityEvent.create.mock.calls
      .map((c: unknown[]) => (c[0] as { data: { type: string; message: string } }).data)
      .find((e) => e.type === "calendario_reteve_entrega");
    expect(evento).toBeTruthy();
    // O alerta carrega a própria evidência: QUAL entrega e POR QUÊ.
    expect(evento!.message).toContain("Social — semana 1");
    expect(evento!.message).toMatch(/escada/i);
  });

  // ── A PROVA DO CONSERTO DE 29/08/2026 ──────────────────────────────────
  // "Cancelar avisa e PARA a produção — inclusive o que ainda não virou peça."
  // `cancelarPorPedidoDoCliente` (refacao.ts) carimba a entrega com este
  // status; é esta régua, e só ela, que precisa recusá-lo — sem isso, uma
  // entrega cancelada que sobrevive até `aprovarPacote` vira post do mesmo
  // jeito, como se nunca tivesse sido cancelada.
  it("entrega CANCELADA pelo cliente NÃO vira post — nem quando o pacote inteiro é aprovado depois", async () => {
    db.deliverable.findMany.mockResolvedValue(entrega({ revisionStatus: REVISION_STATUS_DO_CANCELAMENTO }));
    const r = await agendarPostsDaEntrega("p1");
    expect(r.criados).toBe(0);
    expect(db.socialPost.create).not.toHaveBeenCalled();
    expect(r.retidas[0]!.motivo).toContain(REVISION_STATUS_DO_CANCELAMENTO);
  });

  it("uma retida não derruba a liberada que veio junto", async () => {
    db.deliverable.findMany.mockResolvedValue([
      { id: "d1", name: "Retida", content: CONTEUDO, type: "social",
        visibility: "interno", revisionStatus: "quality_ok" },
      { id: "d2", name: "Liberada", content: CONTEUDO, type: "social",
        visibility: "compartilhado", revisionStatus: "quality_ok" },
    ]);
    const r = await agendarPostsDaEntrega("p1");
    expect(r.criados).toBe(2);
    expect(r.retidas.map((x) => x.nome)).toEqual(["Retida"]);
  });
});

// ── A RÉGUA, TESTADA DIRETO ─────────────────────────────────────────────────
// `motivoParaNaoVirarCalendario` é exportada justamente para isto: régua que só
// existe dentro de um laço de 60 linhas é régua que ninguém consegue provar.

describe("a régua de quem pode virar calendário", () => {
  it("só passa quem tem as DUAS coisas", () => {
    expect(motivoParaNaoVirarCalendario({ visibility: "compartilhado", revisionStatus: "quality_ok" })).toBeNull();
  });

  it.each([
    ["visibilidade interna", { visibility: "interno", revisionStatus: "quality_ok" }],
    ["visibilidade ausente", { visibility: null, revisionStatus: "quality_ok" }],
    ["estado intermediário do Hub", { visibility: "aguardando_publicacao", revisionStatus: "quality_ok" }],
    ["reprovada pela Qualidade", { visibility: "compartilhado", revisionStatus: "quality_flag" }],
    ["sem parecer", { visibility: "compartilhado", revisionStatus: null }],
    ["parecer desconhecido", { visibility: "compartilhado", revisionStatus: "revisado_por_alguem" }],
  ])("barra: %s", (_caso, entrada) => {
    expect(motivoParaNaoVirarCalendario(entrada)).not.toBeNull();
  });
});

describe("o cliente aprovou → o calendário passa a valer", () => {
  beforeEach(() => {
    db.project.findUnique.mockResolvedValue({ clientRequestId: "cr1", clientApprovedAt: new Date() });
    db.socialPost.findMany.mockResolvedValue([
      { id: "sp1", scheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60_000) },
    ]);
  });

  it("sem aprovação do cliente nada sai de rascunho — é o consentimento de postar", async () => {
    db.project.findUnique.mockResolvedValue({ clientRequestId: "cr1", clientApprovedAt: null });
    const r = await aprovarCalendario("p1");
    expect(r.agendados).toBe(0);
    expect(db.socialPost.update).not.toHaveBeenCalled();
  });

  it("aprovado, o rascunho vira agendado", async () => {
    const r = await aprovarCalendario("p1");
    expect(r.agendados).toBe(1);
    expect(db.socialPost.update.mock.calls[0]![0].data.status).toBe("scheduled");
  });

  it("data que venceu enquanto o cliente pensava é empurrada — nunca dispara em rajada", async () => {
    db.socialPost.findMany.mockResolvedValue([
      { id: "sp1", scheduledFor: new Date(Date.now() - 3 * 24 * 60 * 60_000) },
      { id: "sp2", scheduledFor: new Date(Date.now() - 2 * 24 * 60 * 60_000) },
    ]);
    await aprovarCalendario("p1");
    const d1 = db.socialPost.update.mock.calls[0]![0].data.scheduledFor as Date;
    const d2 = db.socialPost.update.mock.calls[1]![0].data.scheduledFor as Date;
    expect(d1.getTime()).toBeGreaterThan(Date.now());
    expect(d2.getTime() - d1.getTime()).toBeGreaterThanOrEqual(24 * 60 * 60_000);
  });
});

describe("o relógio publica o que está agendado", () => {
  const agendado = {
    id: "sp1", workspaceId: "ws1", clientId: "c1", caption: "Saiu do forno agora.",
    format: "feed", mediaUrl: "/api/media/m1", status: "scheduled",
  };

  beforeEach(() => {
    process.env.PUBLIC_BASE_URL = "https://app.dioli.studio";
    db.socialPost.findMany.mockResolvedValue([{ ...agendado }]);
  });

  it("só olha o que está agendado e já venceu — rascunho não vai ao ar", async () => {
    await publicarAgendados();
    expect(db.socialPost.findMany.mock.calls[0]![0].where.status).toBe("scheduled");
  });

  it("publica e guarda o id externo — sem ele o relatório mensal vira chute", async () => {
    const r = await publicarAgendados();
    expect(r.publicados).toBe(1);
    const dados = db.socialPost.update.mock.calls[0]![0].data;
    expect(dados.status).toBe("published");
    expect(dados.externalPostId).toBe("ig_1");
  });

  // ── O PORTÃO DE MARCA (09/08/2026) ───────────────────────────────────────
  // O Conselho listou como condição de tudo: "não existe rota alternativa para
  // entregar contornando o portão". Esta função ERA a rota.

  it("marca não constituída NÃO publica — e nem chega a falar com a Meta", async () => {
    contratoDeMarca.mockResolvedValue({
      texto: "MARCA NÃO CONSTITUÍDA", marcaVersao: "mv_vazio0000",
      lacunas: ["proibições"], cortado: [], naoConstituida: true,
    });
    const r = await publicarAgendados();
    expect(r.publicados).toBe(0);
    expect(publishPost, "publicou sem saber por qual régua a peça foi feita").not.toHaveBeenCalled();
    expect(r.falhas[0]!.erro).toMatch(/marca não constituída/i);
  });

  it("a metade oposta: marca constituída publica normalmente", async () => {
    const r = await publicarAgendados();
    expect(r.publicados).toBe(1);
    expect(publishPost).toHaveBeenCalled();
  });

  it("não conseguir LER a régua também barra — erro de leitura nunca vira permissão", async () => {
    contratoDeMarca.mockRejectedValue(new Error("banco fora do ar"));
    const r = await publicarAgendados();
    expect(r.publicados).toBe(0);
    expect(publishPost).not.toHaveBeenCalled();
    expect(r.falhas[0]!.erro).toMatch(/régua de marca/i);
  });

  it("a mídia vai à Meta como link público assinado — os servidores dela precisam alcançar", async () => {
    await publicarAgendados();
    const url = publishPost.mock.calls[0]![1].mediaUrl as string;
    expect(url).toBe("https://app.dioli.studio/api/media/m1?exp=1&sig=abc");
  });

  it("sem domínio público configurado o post não vai ao ar às cegas", async () => {
    delete process.env.PUBLIC_BASE_URL;
    delete process.env.RAILWAY_PUBLIC_DOMAIN;
    const r = await publicarAgendados();
    expect(r.publicados).toBe(0);
    expect(r.falhas[0]!.erro).toMatch(/domínio público/);
  });

  it("posta na conta DO CLIENTE, nunca na da agência", async () => {
    await publicarAgendados();
    // A resolução mora em conexaoDoCliente — e leva o clientId do post.
    expect(conexaoDoCliente).toHaveBeenCalledWith("ws1", "c1", "instagram");
  });

  it("conexão com token vencido pede RECONEXÃO — não 'conecte', nem publica", async () => {
    conexaoDoCliente.mockResolvedValue({ id: "mc1", status: "expired" });
    const r = await publicarAgendados();
    expect(r.publicados).toBe(0);
    expect(r.falhas[0]!.erro).toMatch(/precisa ser refeita/);
    expect(publishPost).not.toHaveBeenCalled();
  });

  it("cliente sem Instagram conectado não é erro do sistema — é pendência visível", async () => {
    conexaoDoCliente.mockResolvedValue(null);
    const r = await publicarAgendados();
    expect(r.publicados).toBe(0);
    expect(r.falhas[0]!.erro).toMatch(/não conectou o Instagram/);
    // Continua agendado: a conta pode ser conectada amanhã.
    expect(db.socialPost.update.mock.calls[0]![0].data.status).toBeUndefined();
  });

  it("peça sem imagem não vira post — o Instagram não aceita só legenda", async () => {
    db.socialPost.findMany.mockResolvedValue([{ ...agendado, mediaUrl: null }]);
    const r = await publicarAgendados();
    expect(r.publicados).toBe(0);
    expect(r.falhas[0]!.erro).toMatch(/ainda não tem imagem/);
    expect(publishPost).not.toHaveBeenCalled();
  });

  it("a Meta caindo não derruba a rodada nem enterra o post", async () => {
    publishPost.mockRejectedValue(new Error("Graph API fora do ar"));
    const r = await publicarAgendados();
    expect(r.falhas[0]!.erro).toBe("Graph API fora do ar");
    expect(db.socialPost.update.mock.calls[0]![0].data.lastError).toBe("Graph API fora do ar");
  });
});

describe("o leitor de peças erra para menos", () => {
  it("legenda curta demais não vira post", () => {
    expect(extrairPecas("**1. X**\n- Legenda: Oi", "social")).toHaveLength(0);
  });

  it("peça que confessa falta de dado não vai para o perfil do cliente", () => {
    // A confissão é honesta para a agência ler — não para o seguidor ler.
    const texto = "**1. X**\n- Legenda: Nosso telefone é PRECISO CONFIRMAR com o cliente antes.";
    expect(extrairPecas(texto, "social")).toHaveLength(0);
  });

  it("entrega de vídeo vira reel mesmo sem o campo Formato", () => {
    const texto = "**1. X**\n- Legenda: Um roteiro inteiro para gravar no celular, cena a cena.";
    expect(extrairPecas(texto, "video")[0]!.formato).toBe("reel");
  });

  it("texto que não segue o formato não vira post quebrado no perfil do cliente", () => {
    expect(extrairPecas("prosa solta sem estrutura nenhuma aqui", "social")).toHaveLength(0);
  });
});

describe("carrossel e story no leitor de peças", () => {
  it("telas descritas viram carrossel, mesmo se o especialista escreveu 'feed'", () => {
    // A estrutura do conteúdo manda mais que o rótulo que o modelo digitou.
    const t = `**1. Como escolher seu pão**
- Formato: Feed
- Cenas: 1) O trigo · 2) A fermentação · 3) O forno
- Legenda: Três coisas que mudam tudo no pão que você leva pra casa.`;
    const p = extrairPecas(t, "social")[0]!;
    expect(p.formato).toBe("carousel");
    expect(p.cenas).toEqual(["O trigo", "A fermentação", "O forno"]);
  });

  it("carrossel com UMA tela vira feed — não publica com o nome errado", () => {
    const t = `**1. X**
- Formato: Carrossel
- Cenas: 1) Só uma tela aqui
- Legenda: Uma legenda longa o suficiente para virar post de verdade.`;
    expect(extrairPecas(t, "social")[0]!.formato).toBe("feed");
  });

  it("story continua story", () => {
    const t = `**1. X**
- Formato: Story
- Legenda: Bastidor de hoje: o forno já está quente desde as quatro da manhã.`;
    expect(extrairPecas(t, "social")[0]!.formato).toBe("story");
  });

  it("peça normal não ganha cenas do nada", () => {
    const t = `**1. X**
- Formato: Feed
- Legenda: Saiu do forno agora, passa aqui que a gente te espera com café.`;
    const p = extrairPecas(t, "social")[0]!;
    expect(p.formato).toBe("feed");
    expect(p.cenas).toEqual([]);
  });
});

describe("publicar carrossel", () => {
  const CARROSSEL = {
    id: "sp9", workspaceId: "ws1", clientId: "c1", caption: "Três coisas que mudam tudo.",
    format: "carousel", mediaUrl: "/api/media/m1", status: "scheduled",
    mediaUrlsJson: JSON.stringify(["/api/media/m1", "/api/media/m2", "/api/media/m3"]),
  };

  beforeEach(() => {
    process.env.PUBLIC_BASE_URL = "https://app.dioli.studio";
    db.socialPost.findMany.mockResolvedValue([{ ...CARROSSEL }]);
    conexaoDoCliente.mockResolvedValue({ id: "mc1", status: "connected" });
  });

  it("manda as três telas, não uma imagem só", async () => {
    const r = await publicarAgendados();
    expect(r.publicados).toBe(1);
    const arg = publishPost.mock.calls[0]![1];
    expect(arg.format).toBe("carousel");
    expect(arg.mediaUrls).toHaveLength(3);
    expect(arg.mediaUrl).toBeUndefined();
  });

  it("carrossel incompleto NÃO vai ao ar — sequência com buraco perde o sentido", async () => {
    db.socialPost.findMany.mockResolvedValue([{ ...CARROSSEL, mediaUrlsJson: JSON.stringify(["/api/media/m1"]) }]);
    const r = await publicarAgendados();
    expect(r.publicados).toBe(0);
    expect(publishPost).not.toHaveBeenCalled();
  });

  it("JSON corrompido não derruba a rodada — vira pendência legível", async () => {
    db.socialPost.findMany.mockResolvedValue([{ ...CARROSSEL, mediaUrlsJson: "{quebrado" }]);
    const r = await publicarAgendados();
    expect(r.falhas[0]!.erro).toMatch(/ainda não tem as artes/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// A LIMPEZA DO AVISO NA PROMOÇÃO — item 2 da 6ª auditoria
// ─────────────────────────────────────────────────────────────────────────────
//
// O achado: o Auditor apagou `avisoAoCliente: null` de `promoverParaAgendado`
// e a suíte inteira ficou VERDE. Uma peça que já tinha sido declarada presa
// ("⚠️ você aprovou esta peça, mas ela ainda não entrou na fila") continuaria
// mostrando esse aviso ao cliente DEPOIS de entrar na fila — o ruído que o
// comentário do próprio arquivo diz combater, e que ensina o cliente a ignorar
// o aviso verdadeiro da próxima vez.
//
// A limpeza GÊMEA, em `refazer-a-arte-do-ajuste.ts`, tem régua e fica vermelha
// quando cai. Uma tinha, a outra não — e verde que pode sumir em silêncio é
// exatamente o que esta operação passou seis rodadas consertando.
//
// `promoverParaAgendado` é interna e é A ÚNICA escrita de "scheduled" da casa;
// esta régua a alcança pela porta que o cliente usa (`agendarPecasAprovadas`),
// que é o mesmo fio que a rota do portal atravessa. Régua sobre a constante do
// módulo não valeria: mediria a intenção, não a escrita.

describe("quem entra na fila para de dizer que não entrou", () => {
  beforeEach(() => {
    db.socialPost.update.mockResolvedValue({});
  });

  it("promover LIMPA o aviso da parada — aviso que sobrevive ao conserto vira ruído", async () => {
    db.socialPost.findMany.mockResolvedValue([
      { id: "sp1", scheduledFor: null, status: "draft" },
      { id: "sp2", scheduledFor: null, status: "approved" },
    ]);

    const r = await agendarPecasAprovadas({ clientId: "c1", postIds: ["sp1", "sp2"] });
    expect(r.agendados).toBe(2);

    expect(db.socialPost.update).toHaveBeenCalledTimes(2);
    for (const call of db.socialPost.update.mock.calls) {
      expect(call[0].data.status).toBe("scheduled");
      // A asserção que fica VERMELHA quando a linha some: `undefined` não é
      // `null`. Prisma ignora a chave ausente e o aviso velho sobrevive no
      // banco — que é precisamente o defeito.
      expect(call[0].data).toHaveProperty("avisoAoCliente");
      expect(call[0].data.avisoAoCliente).toBeNull();
    }
  });

  it("a peça que a fila NÃO aceita não é tocada — e volta declarada em `ignorados`", async () => {
    // O outro lado da mesma régua: limpar o aviso de quem continua preso seria
    // apagar a única coisa que o cliente tem para saber que a peça parou.
    db.socialPost.findMany.mockResolvedValue([
      { id: "sp1", scheduledFor: null, status: "revision_requested" },
    ]);

    const r = await agendarPecasAprovadas({ clientId: "c1", postIds: ["sp1"] });
    expect(r.agendados).toBe(0);
    expect(r.ignorados).toEqual([{ postId: "sp1", status: "revision_requested" }]);
    expect(db.socialPost.update).not.toHaveBeenCalled();
  });
});
