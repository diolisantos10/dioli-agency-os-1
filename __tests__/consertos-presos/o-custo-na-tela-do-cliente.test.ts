// O CUSTO NA TELA DO CLIENTE — a prova de que não volta.
//
// 15/08/2026, portal do City Jobs, aba Aprovações, card "Aguardando sua
// decisão". O que o cliente leu:
//
//   Ciclo assistido assistido:cmsut87lr00000xml1hmi1uw6:cmsut8fn800030xmlwx5xc5z5
//   — pacote da cadeia completa aguardando aprovação humana.
//   project-management/pm-orchestrator: executado ($0.0085) ·
//   branding/brand-architect: executado ($0.0060) · …
//
// Três defeitos: o custo que a AGÊNCIA pagou (a margem dela) na tela de quem
// compra; vocabulário de máquina; e um pedido de aprovação que não mostrava a
// peça. Estes testes falham se qualquer um dos três voltar.
//
// Portado do PR #158 (branch origin/claude/card-do-cliente-sem-custo,
// commit 8f6c83b7) — furo 5 do inventário de consertos presos. Só a metade
// "corpo do cliente sem custo" veio junto; a metade de deduplicação de
// cliente por nome do mesmo commit foi reprovada e ficou de fora.

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  procurarVazamentos,
  redigirParaOCliente,
  exigirTextoLimpo,
} from "@/lib/agency/esteira/vazamento-ao-cliente";
import { corpoParaOCliente, resumoParaAEquipe } from "@/lib/agency/esteira-assistida/card-do-cliente";

const CARD_QUE_O_CEO_VIU =
  "Ciclo assistido assistido:cmsut87lr00000xml1hmi1uw6:cmsut8fn800030xmlwx5xc5z5 — pacote da " +
  "cadeia completa aguardando aprovação humana. project-management/pm-orchestrator: executado " +
  "($0.0085) · branding/brand-architect: executado ($0.0060) · social-media/social-strategist: " +
  "executado ($0.0069) · social-media/editorial-planner: executado ($0.0105) · " +
  "social-media/copywriter: executado ($0.0170) · design/graphic-designer: executado ($0.0193)";

describe("a régua do que o cliente pode ver", () => {
  it("reprova o card exato que foi para produção — nos três motivos", () => {
    const achados = procurarVazamentos(CARD_QUE_O_CEO_VIU);
    const tipos = new Set(achados.map((a) => a.tipo));
    expect(tipos.has("custo")).toBe(true);
    expect(tipos.has("identificador")).toBe(true);
    expect(tipos.has("nome-interno")).toBe(true);
    expect(achados.some((a) => a.trecho.includes("0.0085"))).toBe(true);
  });

  it("custo em dólar é vazamento; preço em real NÃO é", () => {
    // A casa cobra em R$ e paga o provedor de IA em US$. Confundir os dois
    // apagaria a proposta comercial do portal, que é onde o preço DEVE estar.
    expect(procurarVazamentos("$0.0085")).toHaveLength(1);
    expect(procurarVazamentos("US$ 12,50")).toHaveLength(1);
    expect(procurarVazamentos("custoUsd")).toHaveLength(1);
    expect(procurarVazamentos("Investimento do mês: R$ 3.500,00")).toHaveLength(0);
    expect(procurarVazamentos("Seu plano custa R$ 890 por mês.")).toHaveLength(0);
  });

  it("id de banco e correlationId são vazamento", () => {
    expect(procurarVazamentos("cmsut87lr00000xml1hmi1uw6")).toHaveLength(1);
    expect(procurarVazamentos("assistido:cmsut87lr00000xml1hmi1uw6:cmsut8fn800030xmlwx5xc5z5").length)
      .toBeGreaterThan(0);
  });

  it("slug de agente é vazamento; português corrente não vira falso positivo", () => {
    expect(procurarVazamentos("graphic-designer").map((v) => v.tipo)).toContain("nome-interno");
    const textoLegitimo = [
      "Pacote de conteúdo — City Jobs",
      "",
      "O que está neste pacote: direção de marca · plano editorial.",
      "- Formato: Carrossel",
      "- Data proposta: 20/08",
      "Nosso time de design entrega as artes até sexta, e o investimento segue R$ 2.400.",
    ].join("\n");
    expect(procurarVazamentos(textoLegitimo)).toHaveLength(0);
  });

  it("redigir tira o dado e mantém o texto legível", () => {
    const limpo = redigirParaOCliente(CARD_QUE_O_CEO_VIU);
    expect(procurarVazamentos(limpo)).toHaveLength(0);
    expect(limpo).not.toContain("0.0085");
    expect(limpo).not.toContain("pm-orchestrator");
  });

  it("exigirTextoLimpo LANÇA, e o erro diz o que vazou", () => {
    expect(() => exigirTextoLimpo("campo", CARD_QUE_O_CEO_VIU)).toThrow(/custo/);
    expect(() => exigirTextoLimpo("campo", "Tudo certo por aqui.")).not.toThrow();
  });
});

describe("o corpo do card que o cliente lê", () => {
  const artefatos = {
    "pm-orchestrator": "Plano interno: distribuir para branding e social.",
    "brand-architect": "Tom de voz: direto, sem jargão. Cores: azul e branco.",
    "social-strategist": "Foco em vagas operacionais na região metropolitana.",
    "editorial-planner": "Seg: vaga da semana · Qua: bastidores · Sex: depoimento.",
    copywriter: "“Sua próxima vaga começa aqui.” Legenda completa dos 3 posts.",
    "graphic-designer": "Carrossel de 3 telas, capa com foto real de candidato.",
  };
  const corpo = corpoParaOCliente({
    nomeDoCliente: "City Jobs",
    solicitacao: "Quero divulgar as vagas abertas desta semana no Instagram.",
    artefatos,
  });

  it("não carrega custo, id nem slug de agente — a trava, não o cuidado", () => {
    expect(procurarVazamentos(corpo.reviewNote)).toHaveLength(0);
  });

  it("MOSTRA a peça: aprovar às cegas é assinatura em branco", () => {
    expect(corpo.reviewNote).toContain("Sua próxima vaga começa aqui.");
    expect(corpo.reviewNote).toContain("Carrossel de 3 telas");
    expect(corpo.reviewNote).toContain("Textos das publicações");
    expect(corpo.reviewNote).toContain("Direção visual das peças");
  });

  it("não mostra a coordenação interna da agência", () => {
    expect(corpo.reviewNote).not.toContain("distribuir para branding e social");
  });

  it("primeira linha é o título que o portal lê (≤ 90 chars)", () => {
    const primeira = corpo.reviewNote.split("\n")[0]!;
    expect(primeira).toBe("Pacote de conteúdo — City Jobs");
    expect(primeira.length).toBeLessThanOrEqual(90);
  });

  it("sobrevive a artefato que cita o próprio id da função", () => {
    const sujo = corpoParaOCliente({
      nomeDoCliente: "City Jobs",
      solicitacao: "Vagas da semana",
      artefatos: { copywriter: "saída de copywriter, custo $0.0170, ciclo cmsut87lr00000xml1hmi1uw6" },
    });
    expect(procurarVazamentos(sujo.reviewNote)).toHaveLength(0);
  });

  it("o rastro técnico continua existindo — do lado da equipe", () => {
    const rastro = resumoParaAEquipe({
      correlationId: "assistido:cli-1:req-1",
      passos: [{ funcaoId: "copywriter", departamentoId: "social-media", decisao: "executado", custoUsd: 0.017 }],
      custoTotalUsd: 0.0682,
      pecasIncluidas: ["Textos das publicações"],
    });
    expect(rastro).toContain("$0.0170");
    expect(rastro).toContain("social-media/copywriter");
    // E ele é justamente o texto que a régua recusaria no campo do cliente —
    // é essa a prova de que os dois públicos estão separados de verdade.
    expect(procurarVazamentos(rastro).length).toBeGreaterThan(0);
  });
});

// ─── A TRAVA NO CAMINHO DE ESCRITA ──────────────────────────────────────────
// Régua que só existe no módulo puro protege o módulo puro. O que protege o
// cliente é ela estar no caminho que grava.

const db = {
  approvalRequest: { findFirst: vi.fn(), create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  approvalComment: { create: vi.fn() },
};
vi.mock("@/lib/db/client", () => ({ prisma: db }));
const { createApprovalRequest, addApprovalComment, setApprovalVisibility } = await import(
  "@/lib/agency/persistence/approval-service"
);

describe("nada com custo vira linha visível ao cliente", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.approvalRequest.findFirst.mockResolvedValue(null);
    db.approvalRequest.create.mockResolvedValue({ id: "ap-1" });
    db.approvalComment.create.mockResolvedValue({ id: "cm-1" });
    db.approvalRequest.update.mockResolvedValue({ id: "ap-1" });
  });

  it("createApprovalRequest recusa o card exato que foi para produção", async () => {
    await expect(
      createApprovalRequest({
        clientId: "cli-1",
        department: "design",
        clientVisible: true,
        reviewNote: CARD_QUE_O_CEO_VIU,
      }),
    ).rejects.toThrow(/dado interno da agência/);
    expect(db.approvalRequest.create).not.toHaveBeenCalled();
  });

  it("o mesmo texto passa quando o card é INTERNO — o rastro não some", async () => {
    await createApprovalRequest({
      clientId: "cli-1",
      department: "design",
      clientVisible: false,
      reviewNote: CARD_QUE_O_CEO_VIU,
    });
    expect(db.approvalRequest.create).toHaveBeenCalled();
  });

  it("comentário visível ao cliente passa pela mesma régua", async () => {
    await expect(
      addApprovalComment({
        approvalRequestId: "ap-1",
        authorName: "esteira",
        isClientVisible: true,
        body: "Custou $0.0193 produzir.",
      }),
    ).rejects.toThrow(/dado interno da agência/);
    // Interno grava normalmente — é o caminho certo do rastro.
    await addApprovalComment({
      approvalRequestId: "ap-1",
      authorName: "esteira",
      isClientVisible: false,
      body: "Custou $0.0193 produzir.",
    });
    expect(db.approvalComment.create).toHaveBeenCalledTimes(1);
  });

  it("abrir ao cliente um card sujo é a mesma porta — e está fechada", async () => {
    db.approvalRequest.findUnique.mockResolvedValue({ reviewNote: CARD_QUE_O_CEO_VIU });
    await expect(setApprovalVisibility("ap-1", true)).rejects.toThrow(/dado interno da agência/);
    expect(db.approvalRequest.update).not.toHaveBeenCalled();
  });
});
