// A PROPOSTA RENEGOCIADA NÃO COTA ZERO — e sem escopo ela não cota nada.
//
// ─── O DEFEITO, MEDIDO EM 15/08/2026 ────────────────────────────────────────
//
// `negotiateProposal` lê `JSON.parse(briefingJson)?.scope ?? {}` e joga isso em
// `computeEstimate`. Escopo vazio devolve `totalMin: 0, totalMax: 0, items: []`.
// O resultado ia GRAVADO no card que o cliente lê no portal:
//
//     💰 INVESTIMENTO
//     Total: R$ 0 a R$ 0 / mês
//     ✅ Se ficar bom pra você, é só aprovar aqui embaixo que a gente começa.
//
// E o caminho é real, não hipotético: o pedido de balcão
// (`app/api/self-serve/order/route.ts`) grava `briefingJson` SEM a chave
// `scope`. Quem comprou um carrossel de R$ 129 e clicou em "pedir revisão"
// recebia uma proposta de R$ 0 a R$ 0 por mês, pronta para aprovar.
//
// O dano maior era invisível: `floor = est.totalMin = 0` deixava a guarda
// `newTotal >= floor` VAZIA. O modelo podia propor qualquer valor acima de zero
// e ele passava — o piso, única trava de margem deste caminho, não existia.
//
// ─── AS DUAS METADES ────────────────────────────────────────────────────────
// 1. BARRA: sem escopo, nenhuma linha de preço sai e nenhum `newTotal` é aceito.
// 2. NÃO ATRAPALHA: com escopo real, o preço sai igual ao de antes e o piso
//    continua sendo respeitado (nem afrouxado, nem apertado).

import { describe, it, expect, vi, beforeEach } from "vitest";

const db = {
  clientRequestDb: { findUnique: vi.fn(), update: vi.fn() },
  portalMessage: { create: vi.fn() },
  approvalRequest: { update: vi.fn() },
};
vi.mock("@/lib/db/client", () => ({ prisma: db }));

const generate = vi.fn();
vi.mock("@/lib/ai/generate", () => ({ generate }));

const createApprovalRequest = vi.fn();
vi.mock("@/lib/agency/persistence/approval-service", () => ({ createApprovalRequest }));

const { negotiateProposal } = await import("@/lib/agency/execution/negotiate-proposal");

/** O texto da proposta que o cliente lê — é o `reviewNote` do card. */
function textoDaProposta(): string {
  const call = db.approvalRequest.update.mock.calls[0];
  return (call?.[0]?.data?.reviewNote as string) ?? "";
}

/** O prompt que foi para o modelo. */
function promptDoModelo(): string {
  return (generate.mock.calls[0]?.[0]?.user as string) ?? "";
}

/** `briefingJson` de um pedido de BALCÃO — exatamente o formato gravado por
 *  `app/api/self-serve/order/route.ts`: não existe a chave `scope`. */
const BRIEFING_DE_BALCAO = JSON.stringify({
  serviceId: "balcao-carrossel-5",
  precoPago: 129,
  businessName: "Padaria do Zé",
  segment: "balcao",
  objectives: ["Sequência de até cinco telas com capa e legenda."],
  wantsSocialMedia: false,
  wantsPaidTraffic: false,
  branding: { requested: false, wantsRebrand: false },
  budgetRange: "R$ 129",
  prospectName: "José da Silva",
  prospectEmail: "ze@padaria.com",
  prospectPhone: "11999999999",
});

/** `briefingJson` de um briefing de verdade — com escopo que produz valor. */
const BRIEFING_COM_ESCOPO = JSON.stringify({
  scope: {
    wantsSocialMedia: true,
    objectives: ["Aparecer mais"],
    social: { platforms: ["instagram"], postsPerWeek: 7, storiesPerWeek: 10 },
  },
});

function pedido(briefingJson: string) {
  return {
    id: "req-1",
    businessName: "Padaria do Zé",
    briefingJson,
    workspaceId: "ws-1",
    clientId: "cli-1",
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  db.clientRequestDb.update.mockResolvedValue({});
  db.portalMessage.create.mockResolvedValue({});
  db.approvalRequest.update.mockResolvedValue({});
  createApprovalRequest.mockResolvedValue({ id: "apr-1" });
  generate.mockResolvedValue({ ok: true, data: { message: "Oi! Vamos achar um caminho.", newTotal: null } });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("METADE 1 — sem escopo, o card NÃO cota (e não cota zero)", () => {
  beforeEach(() => {
    db.clientRequestDb.findUnique.mockResolvedValue(pedido(BRIEFING_DE_BALCAO));
  });

  it("nenhuma linha 'Total' e nenhum R$ 0 chegam ao cliente", async () => {
    await negotiateProposal("req-1", "achei caro");
    const texto = textoDaProposta();

    expect(texto).not.toMatch(/R\$\s*0\b/);
    expect(texto).not.toMatch(/^Total/m);
    expect(texto).not.toMatch(/Total.*\/\s*m[êe]s/i);
    // Nenhum valor em reais, de forma nenhuma.
    expect(texto).not.toMatch(/R\$/);
  });

  it("não pede aprovação de um valor que não existe — pede o escopo", async () => {
    await negotiateProposal("req-1", "achei caro");
    const texto = textoDaProposta();
    expect(texto).not.toMatch(/é só aprovar/i);
    expect(texto).toMatch(/não tenho como fechar o valor|escopo não está definido/i);
  });

  it("a linha de entregáveis para de afirmar 'escopo combinado' — nada foi combinado", async () => {
    await negotiateProposal("req-1", "achei caro");
    expect(textoDaProposta()).not.toMatch(/Escopo combinado no briefing/i);
    expect(textoDaProposta()).toMatch(/preciso confirmar/i);
  });

  it("O PISO NÃO VIRA ZERO: valor proposto pelo modelo é DESCARTADO", async () => {
    // Este é o dano invisível. Com piso 0, `newTotal >= 0` aceitava qualquer
    // coisa — inclusive R$ 1 por mês, gravado como "condição especial".
    generate.mockResolvedValue({ ok: true, data: { message: "Consigo uma condição!", newTotal: 1 } });
    await negotiateProposal("req-1", "muito caro");
    expect(textoDaProposta()).not.toMatch(/condição especial/i);
    expect(textoDaProposta()).not.toMatch(/R\$/);
  });

  it("o modelo é instruído a NÃO citar número — a trava não é só na saída", async () => {
    await negotiateProposal("req-1", "achei caro");
    const prompt = promptDoModelo();
    expect(prompt).not.toMatch(/R\$\s*0\b/);
    expect(prompt).toMatch(/NÃO existe escopo fechado nem orçamento calculado/i);
    expect(prompt).toMatch(/NÃO cite valor/i);
  });

  it("a conversa do portal continua acontecendo — o cliente não fica no vácuo", async () => {
    await negotiateProposal("req-1", "achei caro");
    expect(db.portalMessage.create).toHaveBeenCalledOnce();
    expect(createApprovalRequest).toHaveBeenCalledOnce();
    expect(db.clientRequestDb.update).toHaveBeenCalledOnce();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("METADE 2 — com escopo real, nada foi afrouxado nem apertado", () => {
  beforeEach(() => {
    db.clientRequestDb.findUnique.mockResolvedValue(pedido(BRIEFING_COM_ESCOPO));
  });

  it("a proposta com escopo continua saindo com preço e com o pedido de aprovação", async () => {
    await negotiateProposal("req-1", "quero rever");
    const texto = textoDaProposta();
    expect(texto).toMatch(/Total:\s*R\$/);
    expect(texto).toMatch(/\/\s*m[êe]s/);
    expect(texto).toMatch(/é só aprovar/i);
    expect(texto).not.toMatch(/R\$\s*0\b/);
  });

  it("o piso continua barrando valor abaixo dele", async () => {
    // ⚠️ Comentário corrigido em 29/08/2026 (achado ao investigar o furo do
    // teste seguinte): a tabela de planos virou PREÇO FECHADO em 26/08/2026
    // (`lib/agency/planos.ts`) — `minPrice === maxPrice` sempre. Para
    // `BRIEFING_COM_ESCOPO` (7 posts/semana) o plano resolvido é "Conteúdo",
    // R$ 790 a R$ 790 — não "Growth: R$ 1.500 a R$ 2.400", que não existe mais
    // nesta base. R$ 900 aqui fura por estar ACIMA do teto (790), não abaixo
    // do piso — mas o efeito prático é o mesmo: nenhum "condição especial"
    // pode sair, e é isso que esta asserção prova.
    generate.mockResolvedValue({ ok: true, data: { message: "Consigo!", newTotal: 900 } });
    await negotiateProposal("req-1", "muito caro");
    expect(textoDaProposta()).not.toMatch(/condição especial/i);
  });

  // ── ⚠️ ESTA ASSERÇÃO MUDOU DE PERGUNTA, E O PORQUÊ IMPORTA ────────────────
  //
  // O teste original do #159 provava aqui a "metade limpa" do piso: um
  // `newTotal` DENTRO da faixa vira contraproposta ("condição especial").
  // Essa pergunta não tem resposta possível na base de hoje, e a causa NÃO é
  // o conserto do furo 7 — é anterior a ele:
  //
  //   `lib/agency/live-calculator.ts:144-145` monta todo plano com
  //   `minPrice: plano.preco, maxPrice: plano.preco` (preço fechado, 26/08/2026).
  //   Logo `est.totalMin === est.totalMax` para QUALQUER escopo.
  //   E `negotiate-proposal.ts` exige `newTotal >= totalMin && newTotal < totalMax`.
  //   Os dois juntos pedem `n >= X` e `n < X` ao mesmo tempo: insatisfazível.
  //
  // Ou seja: o caminho de contraproposta está MORTO na base — nenhum valor,
  // de nenhum modelo, para nenhum cliente, vira "condição especial".
  //
  // Mexer nisso é mexer em FRONTEIRA DE PREÇO, que não é decisão de quem
  // porta conserto — subiu ao CEO como item próprio (ver
  // `docs/diagnosticos/os-consertos-que-ficaram-presos-29-08.md`).
  //
  // Então esta asserção passa a TRAVAR A VERDADE DE HOJE, em vez de fingir
  // verde ou de ficar vermelha por um defeito que não é o furo 7. Se alguém
  // consertar a fronteira, este teste QUEBRA — e é assim que a casa fica
  // sabendo que o caminho voltou a existir.
  it("HOJE nenhum valor vira contraproposta — o caminho está morto por preço fechado (escalado ao CEO)", async () => {
    generate.mockResolvedValue({ ok: true, data: { message: "Consigo!", newTotal: 790 } });
    await negotiateProposal("req-1", "muito caro");
    // A proposta continua saindo, com o preço real — o cliente NÃO fica no vácuo.
    expect(textoDaProposta()).toMatch(/Total:\s*R\$/);
    expect(textoDaProposta()).toMatch(/790/);
    // Mas a contraproposta não acontece: `newTotal` é descartado pela fronteira.
    expect(textoDaProposta()).not.toMatch(/condição especial/i);
  });

  it("valor inválido do modelo (NaN, texto, infinito) nunca vira preço", async () => {
    for (const lixo of [Number.NaN, Number.POSITIVE_INFINITY, "1500" as unknown as number, null]) {
      vi.clearAllMocks();
      db.clientRequestDb.findUnique.mockResolvedValue(pedido(BRIEFING_COM_ESCOPO));
      createApprovalRequest.mockResolvedValue({ id: "apr-1" });
      generate.mockResolvedValue({ ok: true, data: { message: "oi", newTotal: lixo } });
      await negotiateProposal("req-1", "caro");
      expect(textoDaProposta(), `newTotal = ${String(lixo)}`).not.toMatch(/condição especial/i);
    }
  });
});
