// A reprovação de dentro de casa.
//
// A trava central: **reprovar sem dizer por quê não reprova.** É o gesto que
// parece produtivo e não ensina nada — a peça sai da frente, o incômodo passa, e
// a próxima nasce com o mesmo defeito porque ninguém ficou sabendo qual era.
//
// É a causa raiz que o diagnóstico de 08/08 apontou:
//   *"Não há contador de voltas nem histórico por peça — por isso a peça 3
//    repete o erro da peça 1, e repetiu hoje."*

import { describe, it, expect, beforeEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";

const db = vi.hoisted(() => ({
  // `reprovarPeca` usa findFirst (agora filtra workspace); `historicoDaPeca`
  // ainda usa findUnique — os dois precisam existir no dublê.
  socialPost: { findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  activityEvent: { count: vi.fn(), create: vi.fn() },
}));
vi.mock("@/lib/db/client", () => ({ prisma: db }));

const proib = vi.hoisted(() => ({ registrarProibicoes: vi.fn() }));
vi.mock("@/lib/agency/esteira/proibicoes", () => proib);

import {
  reprovarPeca, historicoDaPeca, VOLTAS_ATE_VIRAR_GENTE, MINIMO_DO_MOTIVO,
  EVENTO_DE_REPROVACAO,
} from "@/lib/agency/esteira/reprovacao";

const MOTIVO = "nunca escreva o nome da marca em texto gigante na capa";

beforeEach(() => {
  vi.clearAllMocks();
  db.socialPost.findFirst.mockResolvedValue({ id: "p1", workspaceId: "ws1", clientId: "c1" });
  // `historicoDaPeca` ainda busca por `findUnique` — ver a dívida declarada no
  // documento da varredura de 28/08 (é LEITURA de histórico, não escrita).
  db.socialPost.findUnique.mockResolvedValue({ id: "p1", workspaceId: "ws1", clientId: "c1" });
  db.socialPost.update.mockResolvedValue({});
  db.activityEvent.count.mockResolvedValue(0);
  db.activityEvent.create.mockResolvedValue({});
  proib.registrarProibicoes.mockResolvedValue({ novas: [{ frase: MOTIVO, termos: ["texto gigante"] }], total: 1 });
});

describe("sem motivo não reprova — e essa é a regra inteira", () => {
  it("motivo vazio é RECUSADO, e nada acontece com a peça", async () => {
    const r = await reprovarPeca({ postId: "p1", motivo: "", quemReprovou: "Dioli" , workspaceId: "ws-1"});
    expect(r.ok).toBe(false);
    expect(r.recusa).toMatch(/escreva o que está errado/i);
    expect(db.socialPost.update).not.toHaveBeenCalled();
    expect(db.activityEvent.create).not.toHaveBeenCalled();
  });

  it('resmungo curto — "ruim", "feio" — também não passa', async () => {
    // Resmungo não vira regra que o produtor consiga obedecer.
    for (const resmungo of ["ruim", "feio", "não gostei", "nao"]) {
      const r = await reprovarPeca({ postId: "p1", motivo: resmungo, quemReprovou: "Dioli" , workspaceId: "ws-1"});
      expect(r.ok, `"${resmungo}" passou`).toBe(false);
    }
    expect(MINIMO_DO_MOTIVO).toBeGreaterThan(4);
  });

  it("reprovação sem autor não é registro", async () => {
    const r = await reprovarPeca({ postId: "p1", motivo: MOTIVO, quemReprovou: "  " , workspaceId: "ws-1"});
    expect(r.ok).toBe(false);
    expect(r.recusa).toMatch(/assinar/i);
  });

  it("A METADE OPOSTA: com motivo de verdade, reprova e registra", async () => {
    const r = await reprovarPeca({ postId: "p1", motivo: MOTIVO, quemReprovou: "Dioli" , workspaceId: "ws-1"});
    expect(r.ok).toBe(true);
    expect(r.recusa).toBeNull();
  });
});

describe("o motivo vira REGRA — é isto que impede a peça 3 de repetir a peça 1", () => {
  it("o que foi dito na reprovação vira proibição do cliente", async () => {
    await reprovarPeca({ postId: "p1", motivo: MOTIVO, quemReprovou: "Dioli" , workspaceId: "ws-1"});
    expect(proib.registrarProibicoes).toHaveBeenCalledWith("c1", MOTIVO, "equipe");
  });

  it("e a resposta diz ao humano o que passou a valer", async () => {
    const r = await reprovarPeca({ postId: "p1", motivo: MOTIVO, quemReprovou: "Dioli" , workspaceId: "ws-1"});
    expect(r.proibicoesNovas).toContain("texto gigante");
    expect(r.paraQuemReprovou).toContain("texto gigante");
  });

  it("quando nenhuma regra sai da frase, ele DIZ isso em vez de fingir que aprendeu", async () => {
    proib.registrarProibicoes.mockResolvedValue({ novas: [], total: 0 });
    const r = await reprovarPeca({ postId: "p1", motivo: "achei que ficou fraco demais para o público", quemReprovou: "Dioli" , workspaceId: "ws-1"});
    expect(r.ok).toBe(true);
    expect(r.paraQuemReprovou).toMatch(/não consegui extrair uma regra/i);
  });

  it("peça sem cliente não quebra — o registro vale, a proibição não tem dono", async () => {
    db.socialPost.findFirst.mockResolvedValue({ id: "p1", workspaceId: "ws1", clientId: null });
    const r = await reprovarPeca({ postId: "p1", motivo: MOTIVO, quemReprovou: "Dioli" , workspaceId: "ws-1"});
    expect(r.ok).toBe(true);
    expect(proib.registrarProibicoes).not.toHaveBeenCalled();
    expect(db.activityEvent.create).toHaveBeenCalled();
  });
});

describe("a volta é contada, e na terceira vira gente", () => {
  it("primeira reprovação é a volta 1", async () => {
    const r = await reprovarPeca({ postId: "p1", motivo: MOTIVO, quemReprovou: "Dioli" , workspaceId: "ws-1"});
    expect(r.volta).toBe(1);
    expect(r.escalado).toBe(false);
  });

  it("a contagem vem do HISTÓRICO, não de um campo que alguém zera sem querer", async () => {
    db.activityEvent.count.mockResolvedValue(1);
    const r = await reprovarPeca({ postId: "p1", motivo: MOTIVO, quemReprovou: "Dioli" , workspaceId: "ws-1"});
    expect(r.volta).toBe(2);
    const where = db.activityEvent.count.mock.calls[0]![0].where;
    expect(where.type).toBe(EVENTO_DE_REPROVACAO);
    expect(where.message).toEqual({ contains: "p1" });
  });

  it("na terceira volta a máquina PARA de tentar", async () => {
    db.activityEvent.count.mockResolvedValue(VOLTAS_ATE_VIRAR_GENTE - 1);
    const r = await reprovarPeca({ postId: "p1", motivo: MOTIVO, quemReprovou: "Dioli" , workspaceId: "ws-1"});
    expect(r.escalado).toBe(true);
    expect(r.paraQuemReprovou).toMatch(/não vai tentar de novo/i);
    expect(r.paraQuemReprovou).toMatch(/reescrever o pedido/i);
  });
});

describe("o registro carrega a evidência, e a peça sai da fila", () => {
  it("o motivo inteiro entra no evento — alerta sem o caso concreto é ruído", async () => {
    await reprovarPeca({ postId: "p1", motivo: MOTIVO, quemReprovou: "Dioli" , workspaceId: "ws-1"});
    const dados = db.activityEvent.create.mock.calls[0]![0].data;
    expect(dados.type).toBe(EVENTO_DE_REPROVACAO);
    expect(dados.message).toContain(MOTIVO);
    expect(dados.message).toContain("Dioli");
    expect(dados.message).toContain("p1");
  });

  it("peça reprovada VOLTA para rascunho e perde a data — não vai ao ar sozinha", async () => {
    // Deixá-la agendada faria uma peça que alguém já recusou subir na hora marcada.
    await reprovarPeca({ postId: "p1", motivo: MOTIVO, quemReprovou: "Dioli" , workspaceId: "ws-1"});
    const dados = db.socialPost.update.mock.calls[0]![0].data;
    expect(dados.status).toBe("draft");
    expect(dados.scheduledFor).toBeNull();
  });

  it("peça que não existe é recusada sem escrever nada", async () => {
    db.socialPost.findFirst.mockResolvedValue(null);
    const r = await reprovarPeca({ postId: "x", motivo: MOTIVO, quemReprovou: "Dioli" , workspaceId: "ws-1"});
    expect(r.ok).toBe(false);
    expect(db.socialPost.update).not.toHaveBeenCalled();
  });
});

describe("o histórico responde 'por que esta peça está na quarta versão?'", () => {
  it("devolve o que foi dito, em ordem", async () => {
    const eventos = vi.fn().mockResolvedValue([
      { timestamp: new Date("2026-08-01"), message: "p1 — volta 1, reprovada por Dioli: sem foto real" },
      { timestamp: new Date("2026-08-02"), message: "p1 — volta 2, reprovada por Dioli: texto gigante de novo" },
    ]);
    (db.activityEvent as Record<string, unknown>).findMany = eventos;
    const h = await historicoDaPeca("p1");
    expect(h).toHaveLength(2);
    expect(h[0]!.oQueDisseram).toContain("sem foto real");
  });
});

// ── ESTE ARQUIVO REGISTRA. ELE NÃO PRODUZ. ──────────────────────────────────

describe("reprovar não dispara produção sozinho", () => {
  const BRUTO = fs.readFileSync(path.join(process.cwd(), "lib/agency/esteira/reprovacao.ts"), "utf8");
  const SRC = BRUTO.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  it("não chama IA nem publica", () => {
    for (const p of ["generate(", "publishPost", "produzir", "refazer"]) {
      expect(SRC.includes(p), `passou a produzir (${p}) — reprovar é registrar, não refazer`).toBe(false);
    }
  });
});
