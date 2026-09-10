// A ESCADA TEM UMA REGRA SÓ — e o pedido retido volta sozinho.
//
// ═══════════════════════════════════════════════════════════════════════════
// O DEFEITO QUE ESTE ARQUIVO EXISTE PARA MATAR (25/08/2026)
// ═══════════════════════════════════════════════════════════════════════════
//
// Medido em produção, duas vezes, com 64 segundos entre os fatos:
//
//   17:02:12 — `escadaFiltraEntregas` reteve a peça ("design está em ALLOWLIST
//              e o cliente não está na lista") e o pedido parou;
//   17:03:16 — o despertador aplicou `DECISOES_DO_DONO` e incluiu a MESMA
//              cliente, sozinho, na lista.
//
// A casa recusava o que ela mesma liberava um minuto depois — e nada voltava a
// olhar o pedido retido.
//
// ── POR QUE O CONSERTO ANTERIOR NÃO PEGOU, E É A LIÇÃO DESTE ARQUIVO ───────
//
// O conserto de 08/2026 ensinou a decisão do dono à porta MANUAL
// (`liberarCliente`) e a régua ficou VERDE em cima dela. Só que a porta manual
// não é a que retém a peça. **Régua verde sobre o componente errado é pior que
// régua nenhuma**: a régua nenhuma deixa a dúvida viva; a verde no lugar errado
// mata a dúvida e deixa o defeito.
//
// Por isso a pergunta obrigatória de todo teste daqui é: *ele alcança
// `escadaFiltraEntregas`, que é o caminho que retém a peça de verdade?* Os
// testes de identidade abaixo REPROVAM se alguém consertar só a porta lateral.

import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const db = vi.hoisted(() => ({
  departmentLadder: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  departmentLadderRecord: { findMany: vi.fn(), create: vi.fn() },
  deliverable: { findMany: vi.fn(), updateMany: vi.fn() },
  contentRequest: { findMany: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
  project: { findMany: vi.fn() },
  task: { findUnique: vi.fn() },
  activityEvent: { create: vi.fn() },
  cycle: { findMany: vi.fn() },
  approvalRequest: { updateMany: vi.fn() },
}));
vi.mock("@/lib/db/client", () => ({ prisma: db }));

// ── O PORTÃO DE MARCA (15/08/2026) — POR QUE ESTE DUBLÊ EXISTE ──────────────
// `escadaFiltraEntregas` passou a consultar a régua de marca antes do degrau
// (ordem do CEO: "marca sem régua, peça não sai"). Este arquivo testa a
// IDENTIDADE decisão-do-dono ↔ escadaFiltraEntregas ↔ liberarCliente — não o
// portão de marca. Com o prisma dublado (sem `client`/`brandBrain`),
// `contratoDeMarca` explodiria e o fail-closed reteria TODA peça de "design"
// (o executor `a2` deste arquivo), mascarando a variável que aqui se mede.
// A marca entra CONSTITUÍDA de propósito. O portão de marca tem prova própria,
// com as duas metades, em `__tests__/consertos-presos/portao-de-marca-na-entrega.test.ts`.
const marcaDoPortao = vi.hoisted(() => ({
  portaoDeMarca: vi.fn(async () => ({ pode: true, motivo: "" })),
  ehPecaDeMarca: (d: string | null | undefined) => d === "design" || d === "social-media",
}));
vi.mock("@/lib/agency/esteira/contrato-de-marca", () => marcaDoPortao);

// ── A FONTE ÚNICA, SUBSTITUÍDA ────────────────────────────────────────────────
//
// Este mock é o instrumento da PROVA POR IDENTIDADE. Ele não troca um valor no
// banco: ele troca A FUNÇÃO que decide se a decisão do dono cobre alguém. Duas
// tabelas gêmeas com o mesmo conteúdo passariam num teste de igualdade de
// valor; nenhuma cópia sobrevive a este, porque uma cópia continuaria
// respondendo o que respondia enquanto a função substituída muda de resposta.
const decisao = vi.hoisted(() => ({ cobre: vi.fn() }));
vi.mock("@/lib/agency/escada/decisoes-do-dono", () => ({
  decisaoQueCobre: (p: unknown) => decisao.cobre(p),
  provaDaDecisao: () => JSON.stringify({ origem: "decisao-do-dono" }),
}));

import { escadaFiltraEntregas, liberarCliente } from "@/lib/agency/escada/registro";
import { departamentosDaCasa } from "@/lib/agency/escada/degraus";
import {
  repescarPedidosRetidosPelaEscada, MAX_REPESCAGENS_DO_PEDIDO,
} from "@/lib/agency/escada/repescagem";

const COBERTURA = {
  decisao: {
    id: "2026-08-08-solta-a-producao-de-peca", em: "2026-08-08", quem: "Dioli (CEO)",
    fala: "x".repeat(40), departamentos: ["design"], escopo: { tipo: "clientes_com_projeto" as const },
  },
  motivo: "liberado por DECISÃO DO DONO",
};

/** A casa inteira num degrau só — evita que `garantirEscada` tente semear. */
function linhas(por: Record<string, { degrau: string; clientes?: string[] }>) {
  return departamentosDaCasa().map((departmentId) => ({
    departmentId,
    degrau: por[departmentId]?.degrau ?? "sombra",
    clientesLiberados: JSON.stringify(por[departmentId]?.clientes ?? []),
  }));
}

beforeEach(() => {
  vi.clearAllMocks();
  db.departmentLadder.create.mockResolvedValue({});
  db.departmentLadder.update.mockResolvedValue({});
  db.departmentLadderRecord.findMany.mockResolvedValue([]);
  db.deliverable.findMany.mockResolvedValue([]);
  db.activityEvent.create.mockResolvedValue({});
  // A casa já semeada: `garantirEscada` acha tudo e não cria nada.
  db.departmentLadder.findMany.mockResolvedValue(linhas({ design: { degrau: "allowlist", clientes: [] } }));
  db.departmentLadder.findUnique.mockResolvedValue({
    departmentId: "design", degrau: "allowlist", clientesLiberados: "[]",
  });
  decisao.cobre.mockResolvedValue(null);
});

// ═════════════════════════════════════════════════════════════════════════════
// 1 · A REPRODUÇÃO — o minuto de 17:02, no caminho que retém a peça de verdade
// ═════════════════════════════════════════════════════════════════════════════

describe("a porta que retém a peça (escadaFiltraEntregas)", () => {
  it("SEM decisão que cubra, ela retém — a escada continua de pé", async () => {
    const r = await escadaFiltraEntregas({
      workspaceId: "w1", clientId: "cli-nova",
      entregas: [{ id: "peca", ownerAgentId: "a2" }],
    });
    expect(r.liberados).toEqual([]);
    expect(r.retidos[0].motivo).toMatch(/ALLOWLIST/);
  });

  it("COM a decisão do dono cobrindo, ela deixa passar — o desencontro de 64s morreu", async () => {
    decisao.cobre.mockResolvedValue(COBERTURA);
    const r = await escadaFiltraEntregas({
      workspaceId: "w1", clientId: "cli-nova",
      entregas: [{ id: "peca", ownerAgentId: "a2" }],
    });
    expect(r.liberados).toEqual(["peca"]);
    expect(r.retidos).toEqual([]);
  });

  it("ela pergunta pelo departamento e pelo cliente CERTOS — não por um genérico", async () => {
    decisao.cobre.mockResolvedValue(COBERTURA);
    await escadaFiltraEntregas({
      workspaceId: "w1", clientId: "cli-nova",
      entregas: [{ id: "peca", ownerAgentId: "a2" }],
    });
    expect(decisao.cobre).toHaveBeenCalledWith({
      workspaceId: "w1", departmentId: "design", clientId: "cli-nova",
    });
  });

  it("departamento em SOMBRA coberto pela decisão passa — é o que o relógio faria", async () => {
    // `aplicarDecisoesDoDono` leva a `allowlist` qualquer departamento coberto
    // que esteja em degrau igual ou abaixo. Deixar `sombra` de fora aqui
    // reproduziria o MESMO desencontro de um minuto, com outra roupa.
    db.departmentLadder.findMany.mockResolvedValue(linhas({ design: { degrau: "sombra" } }));
    decisao.cobre.mockResolvedValue(COBERTURA);
    const r = await escadaFiltraEntregas({
      workspaceId: "w1", clientId: "cli-nova",
      entregas: [{ id: "peca", ownerAgentId: "a2" }],
    });
    expect(r.liberados).toEqual(["peca"]);
  });

  it("sem cliente identificado, decisão nenhuma libera — 'todos' nunca é escopo", async () => {
    decisao.cobre.mockResolvedValue(COBERTURA);
    const r = await escadaFiltraEntregas({
      workspaceId: "w1", clientId: null,
      entregas: [{ id: "peca", ownerAgentId: "a2" }],
    });
    expect(r.liberados).toEqual([]);
    expect(decisao.cobre).not.toHaveBeenCalled();
  });

  it("executor de departamento desconhecido continua fail-closed", async () => {
    decisao.cobre.mockResolvedValue(COBERTURA);
    const r = await escadaFiltraEntregas({
      workspaceId: "w1", clientId: "cli-nova",
      entregas: [{ id: "peca", ownerAgentId: "agente-que-nao-existe" }],
    });
    expect(r.liberados).toEqual([]);
    expect(r.retidos[0].motivo).toMatch(/fail-closed/);
  });

  it("erro ao ler a decisão NÃO libera — fail-closed também aqui", async () => {
    decisao.cobre.mockRejectedValue(new Error("banco caiu"));
    const r = await escadaFiltraEntregas({
      workspaceId: "w1", clientId: "cli-nova",
      entregas: [{ id: "peca", ownerAgentId: "a2" }],
    });
    expect(r.liberados).toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2 · A PROVA POR IDENTIDADE — uma fonte só, e não duas que hoje concordam
// ═════════════════════════════════════════════════════════════════════════════
//
// Este é o teste que o conserto anterior não tinha. Ele substitui A FUNÇÃO e
// exige que AS DUAS portas mudem de resposta na mesma troca.

describe("as duas portas leem a MESMA fonte", () => {
  it("função devolvendo `null`: as duas recusam", async () => {
    decisao.cobre.mockResolvedValue(null);
    const portao = await escadaFiltraEntregas({
      workspaceId: "w1", clientId: "cli-nova",
      entregas: [{ id: "peca", ownerAgentId: "a2" }],
    });
    const manual = await liberarCliente({
      workspaceId: "w1", departmentId: "design", clientId: "cli-nova", quem: "teste",
    });
    expect(portao.liberados).toEqual([]);
    expect(manual.ok).toBe(false);
    expect(manual.erro).toMatch(/evidência insuficiente/);
  });

  it("MESMA função devolvendo cobertura: as duas aceitam — mudaram juntas", async () => {
    decisao.cobre.mockResolvedValue(COBERTURA);
    const portao = await escadaFiltraEntregas({
      workspaceId: "w1", clientId: "cli-nova",
      entregas: [{ id: "peca", ownerAgentId: "a2" }],
    });
    const manual = await liberarCliente({
      workspaceId: "w1", departmentId: "design", clientId: "cli-nova", quem: "teste",
    });
    expect(portao.liberados).toEqual(["peca"]);
    expect(manual.ok).toBe(true);
    expect(manual.porDecisaoDoDono?.id).toBe(COBERTURA.decisao.id);
  });

  it("MUTAÇÃO: desligada a fonte, as DUAS quebram — nenhuma tem cópia própria", async () => {
    // Se alguém reimplementasse a regra dentro de `registro.ts` (a "tabela
    // gêmea"), esta asserção falharia: a cópia continuaria liberando com a
    // fonte desligada. É exatamente esse o defeito que se quer impossível.
    decisao.cobre.mockImplementation(() => { throw new Error("fonte desligada"); });
    const portao = await escadaFiltraEntregas({
      workspaceId: "w1", clientId: "cli-nova",
      entregas: [{ id: "peca", ownerAgentId: "a2" }],
    });
    const manual = await liberarCliente({
      workspaceId: "w1", departmentId: "design", clientId: "cli-nova", quem: "teste",
    });
    expect(portao.liberados).toEqual([]);
    expect(manual.ok).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3 · A PORTA QUE EXIGE EVIDÊNCIA NÃO FOI AFROUXADA
// ═════════════════════════════════════════════════════════════════════════════

describe("a régua de evidência continua inteira", () => {
  it("quem a decisão não cobre continua ouvindo o mesmo 409", async () => {
    decisao.cobre.mockResolvedValue(null);
    const r = await liberarCliente({
      workspaceId: "w1", departmentId: "design", clientId: "cli-de-fora", quem: "teste",
    });
    expect(r.ok).toBe(false);
    expect(r.erro).toMatch(/evidência insuficiente/);
    expect(db.departmentLadder.update).not.toHaveBeenCalled();
  });

  it("o portão não virou enfeite: sem cobertura, nada passa em sombra nem em allowlist", async () => {
    decisao.cobre.mockResolvedValue(null);
    for (const degrau of ["sombra", "allowlist"]) {
      db.departmentLadder.findMany.mockResolvedValue(linhas({ design: { degrau } }));
      const r = await escadaFiltraEntregas({
        workspaceId: "w1", clientId: "cli-nova",
        entregas: [{ id: "peca", ownerAgentId: "a2" }],
      });
      expect(r.liberados).toEqual([]);
    }
  });

  it("a decisão do dono NUNCA leva a wide: em wide a lista já não tem efeito", async () => {
    // Nada aqui promove ninguém a `wide`. O portão só CONSULTA a decisão para
    // quem está em degrau que o relógio mexeria; `wide` se conquista com número.
    const fonte = readFileSync(resolve(process.cwd(), "lib/agency/escada/registro.ts"), "utf8");
    expect(fonte).not.toMatch(/degrau:\s*"wide"/);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 4 · A RETENTATIVA — o empurrão manual que sobrava
// ═════════════════════════════════════════════════════════════════════════════

const PEDIDO = {
  id: "ped1", clientId: "cli-nova", taskId: "t1", projectId: "p1", escadaRepescagens: 0,
};

function arrumarPedido(over: Partial<typeof PEDIDO> = {}) {
  db.contentRequest.findMany.mockResolvedValue([{ ...PEDIDO, ...over }]);
  db.project.findMany.mockResolvedValue([{ id: "p1", workspaceId: "w1", clientId: "cli-nova" }]);
  db.task.findUnique.mockResolvedValue({ agentId: "a2" });
  db.contentRequest.updateMany.mockResolvedValue({ count: 1 });
}

describe("o pedido retido volta sozinho", () => {
  it("degrau abriu (decisão passou a cobrir): o pedido volta para `triado` sem mão", async () => {
    arrumarPedido();
    decisao.cobre.mockResolvedValue(COBERTURA);
    const r = await repescarPedidosRetidosPelaEscada();
    expect(r.rearmados).toBe(1);
    const escrita = db.contentRequest.updateMany.mock.calls[0][0];
    expect(escrita.data.status).toBe("triado");
    expect(escrita.data.escadaRetidaEm).toBeNull();
    expect(escrita.data.escadaRepescagens).toBe(1);
    // A trava: só rearma o que ainda está parado.
    expect(escrita.where.status).toBe("precisa_decisao");
  });

  it("degrau ainda fechado: NÃO rearma, NÃO queima IA e NÃO consome tentativa", async () => {
    arrumarPedido();
    decisao.cobre.mockResolvedValue(null);
    const r = await repescarPedidosRetidosPelaEscada();
    expect(r.rearmados).toBe(0);
    expect(r.aindaRetidos).toHaveLength(1);
    expect(db.contentRequest.updateMany).not.toHaveBeenCalled();
  });

  it("só olha quem a ESCADA reteve — não o que a Qualidade reprovou", async () => {
    arrumarPedido();
    decisao.cobre.mockResolvedValue(COBERTURA);
    await repescarPedidosRetidosPelaEscada();
    const where = db.contentRequest.findMany.mock.calls[0][0].where;
    // O carimbo, e não substring de `declineReason` — que é frase para o
    // cliente ler e muda quando alguém a melhora.
    expect(where.escadaRetidaEm).toEqual({ not: null });
    expect(where.status).toBe("precisa_decisao");
    const fonte = readFileSync(resolve(process.cwd(), "lib/agency/escada/repescagem.ts"), "utf8");
    expect(fonte).not.toMatch(/declineReason:\s*\{\s*contains/);
  });

  it("a decisão é perguntada pelo MESMO portão que reteve — não por uma cópia", async () => {
    arrumarPedido();
    decisao.cobre.mockResolvedValue(COBERTURA);
    await repescarPedidosRetidosPelaEscada();
    // Se a repescagem reimplementasse a regra, ela não chamaria a fonte.
    expect(decisao.cobre).toHaveBeenCalledWith({
      workspaceId: "w1", departmentId: "design", clientId: "cli-nova",
    });
  });

  it("FREIO: no teto ela PARA, e a parada é declarada com motivo, dono e próxima ação", async () => {
    // Número LITERAL de propósito: `MAX_REPESCAGENS_DO_PEDIDO` como entrada do
    // teste faria a asserção passar mesmo com o teto trocado por `Infinity`
    // (Infinity >= Infinity é verdade) — o freio some e a régua fica verde.
    expect(MAX_REPESCAGENS_DO_PEDIDO).toBe(3);
    arrumarPedido({ escadaRepescagens: 3 });
    decisao.cobre.mockResolvedValue(COBERTURA);
    const r = await repescarPedidosRetidosPelaEscada();
    expect(r.rearmados).toBe(0);
    expect(r.desistidos).toHaveLength(1);
    const m = r.desistidos[0].motivo;
    expect(m).toMatch(/PAREI de tentar/);
    expect(m).toMatch(/Motivo:/);
    expect(m).toMatch(/Dono:/);
    expect(m).toMatch(/Próxima ação:/);
    expect(db.contentRequest.updateMany).not.toHaveBeenCalled();
  });

  it("MUTAÇÃO do freio: o teto é um número REAL, não um comentário", async () => {
    // Se `MAX_REPESCAGENS_DO_PEDIDO` virar `Infinity`, esta asserção morre.
    expect(Number.isInteger(MAX_REPESCAGENS_DO_PEDIDO)).toBe(true);
    expect(MAX_REPESCAGENS_DO_PEDIDO).toBeGreaterThan(0);
    expect(MAX_REPESCAGENS_DO_PEDIDO).toBeLessThan(5);
    // E ele é conferido ANTES de qualquer escrita, uma volta acima do teto.
    arrumarPedido({ escadaRepescagens: MAX_REPESCAGENS_DO_PEDIDO + 7 });
    decisao.cobre.mockResolvedValue(COBERTURA);
    const r = await repescarPedidosRetidosPelaEscada();
    expect(r.rearmados).toBe(0);
  });

  it("pedido sem tarefa com especialista não é adivinhado — vira aviso", async () => {
    arrumarPedido();
    db.task.findUnique.mockResolvedValue(null);
    decisao.cobre.mockResolvedValue(COBERTURA);
    const r = await repescarPedidosRetidosPelaEscada();
    expect(r.rearmados).toBe(0);
    expect(r.avisos.join(" ")).toMatch(/especialista/);
  });

  it("NUNCA lança: erro de banco vira aviso, e a rodada do despertador segue", async () => {
    db.contentRequest.findMany.mockRejectedValue(new Error("banco caiu"));
    const r = await repescarPedidosRetidosPelaEscada();
    expect(r.rearmados).toBe(0);
    expect(r.avisos).toHaveLength(1);
  });

  it("casa em dia: zero pedido carimbado, zero escrita", async () => {
    db.contentRequest.findMany.mockResolvedValue([]);
    const r = await repescarPedidosRetidosPelaEscada();
    expect(r).toEqual({ rearmados: 0, aindaRetidos: [], desistidos: [], avisos: [] });
    expect(db.contentRequest.updateMany).not.toHaveBeenCalled();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 5 · SEM RELÓGIO NOVO — a carona no despertador que já bate a cada 5 minutos
// ═════════════════════════════════════════════════════════════════════════════

describe("a retentativa pega carona, não cria relógio", () => {
  const fonteDespertador = () =>
    readFileSync(resolve(process.cwd(), "lib/agency/despertador.ts"), "utf8");

  it("o despertador chama a repescagem de pedidos", () => {
    expect(fonteDespertador()).toMatch(/repescarPedidosRetidosPelaEscada/);
  });

  it("ela roda DEPOIS da decisão do dono — mesma batida, e não a seguinte", () => {
    const f = fonteDespertador();
    expect(f.indexOf("aplicarDecisoesDoDonoNaCasa")).toBeLessThan(f.indexOf("repescarPedidosRetidosPelaEscada"));
  });

  it("nenhum cron, setInterval ou agendador próprio nasceu no conserto", () => {
    const f = readFileSync(resolve(process.cwd(), "lib/agency/escada/repescagem.ts"), "utf8");
    expect(f).not.toMatch(/setInterval|setTimeout|node-cron|new CronJob/);
  });

  it("o pedido é marcado no ponto EXATO em que a escada o retém", () => {
    const f = readFileSync(resolve(process.cwd(), "lib/agency/esteira/producao-de-pedido.ts"), "utf8");
    const bloco = f.slice(f.indexOf("escada_reteve_entrega"), f.indexOf("escada_reteve_entrega") + 1400);
    expect(bloco).toMatch(/escadaRetidaEm/);
  });
});
