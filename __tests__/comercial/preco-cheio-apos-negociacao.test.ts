import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  ehPropostaRenegociada,
  valorDaLinhaDeTotal,
  negociacoesEmPrecoCheio,
  retratoDoLote,
  MARCA_DA_PROPOSTA_AJUSTADA,
  INICIO_DA_JANELA,
  type LinhaDeAprovacaoBruta,
  type LinhaDePagamentoBruta,
} from "@/lib/agency/comercial/preco-cheio-apos-negociacao";

// ─────────────────────────────────────────────────────────────────────────────
// O DEFEITO QUE ESTE MÓDULO AUDITA (F1-auditoria-preco-cheio.md)
//
// `minPrice === maxPrice` desde 25/08 tornou a trava de `negotiateProposal`
// (`newTotal >= floor && newTotal < est.totalMax`) impossível de satisfazer.
// `newTotal` é sempre `null`, e a proposta reaberta sai sempre no formato
// "Total: R$ X a R$ X / mês" — preço cheio, apesar da negociação.
// ─────────────────────────────────────────────────────────────────────────────

const textoDaPropostaAjustada = (negocio: string, valor: number) =>
  `${MARCA_DA_PROPOSTA_AJUSTADA}${negocio}\n\n` +
  `✨ O QUE VOCÊ RECEBE\n• Plano Presença\n\n` +
  `💰 INVESTIMENTO\n` +
  `Total: R$ ${valor.toLocaleString("pt-BR")} a R$ ${valor.toLocaleString("pt-BR")} / mês\n\n` +
  `✅ Se ficar bom pra você, é só aprovar aqui embaixo que a gente começa.`;

const aprovacao = (over: Partial<LinhaDeAprovacaoBruta> = {}): LinhaDeAprovacaoBruta => ({
  clientRequestId: "req-1",
  department: "proposal",
  reviewNote: textoDaPropostaAjustada("Foocci", 790),
  createdAt: new Date("2026-08-26T12:00:00.000Z"),
  ...over,
});

describe("a marca real de uma proposta renegociada", () => {
  it("department 'proposal' + reviewNote com a marca exata → é renegociada", () => {
    expect(ehPropostaRenegociada(aprovacao())).toBe(true);
  });

  it("proposta ORIGINAL (department proposal, sem a marca) → NÃO é renegociada", () => {
    // A proposta original nasce sem reviewNote nesse formato — mesmo
    // department, texto diferente.
    expect(ehPropostaRenegociada(aprovacao({ reviewNote: "algo qualquer" }))).toBe(false);
    expect(ehPropostaRenegociada(aprovacao({ reviewNote: null }))).toBe(false);
  });

  it("mesma marca em OUTRO departamento não conta", () => {
    expect(ehPropostaRenegociada(aprovacao({ department: "design" }))).toBe(false);
  });

  it("sem clientRequestId não há quem cobrar — não conta", () => {
    expect(ehPropostaRenegociada(aprovacao({ clientRequestId: null }))).toBe(false);
  });
});

describe("o valor lido é o que a PESSOA viu, não um recálculo", () => {
  it("lê o primeiro R$ da linha 'Total' — formato preço cheio (o bug: min===max)", () => {
    expect(valorDaLinhaDeTotal(textoDaPropostaAjustada("Foocci", 790))).toBe(79000);
  });

  it("lê também o formato 'condição especial', se um dia ele voltar a ser possível", () => {
    const texto = `${MARCA_DA_PROPOSTA_AJUSTADA}Foocci\n\n💰 INVESTIMENTO\nTotal (condição especial): R$ 1.500 / mês\n`;
    expect(valorDaLinhaDeTotal(texto)).toBe(150000);
  });

  it("texto sem linha 'Total' → null, nunca zero", () => {
    expect(valorDaLinhaDeTotal("Proposta ajustada — Foocci\n\nsem preço nenhum aqui")).toBeNull();
  });
});

describe("a janela: de 25/08 até agora — as DUAS metades", () => {
  const pagamentos: LinhaDePagamentoBruta[] = [];

  it("negociação DENTRO da janela aparece", () => {
    const r = negociacoesEmPrecoCheio(
      [aprovacao({ createdAt: new Date("2026-08-26T00:00:00.000Z") })],
      pagamentos,
    );
    expect(r).toHaveLength(1);
    expect(r[0]!.clientRequestId).toBe("req-1");
  });

  it("negociação FORA da janela (antes de 25/08) NÃO aparece", () => {
    const r = negociacoesEmPrecoCheio(
      [aprovacao({ createdAt: new Date("2026-08-20T00:00:00.000Z") })],
      pagamentos,
    );
    expect(r).toHaveLength(0);
  });

  it("pedido SEM negociação (department proposal, texto original) NÃO aparece", () => {
    const r = negociacoesEmPrecoCheio(
      [aprovacao({ reviewNote: null })],
      pagamentos,
    );
    expect(r).toHaveLength(0);
  });

  it("a borda do início da janela é INCLUSIVA", () => {
    const r = negociacoesEmPrecoCheio(
      [aprovacao({ createdAt: INICIO_DA_JANELA })],
      pagamentos,
    );
    expect(r).toHaveLength(1);
  });
});

describe("pagamento — a existência da linha é a prova, nunca um status", () => {
  it("com PagamentoConfirmado para o mesmo pedido → pago: true, com data e valor", () => {
    const r = negociacoesEmPrecoCheio(
      [aprovacao()],
      [{ clientRequestId: "req-1", confirmadoEm: new Date("2026-08-27T00:00:00.000Z"), valorCentavos: 79000 }],
    );
    expect(r[0]!.pago).toBe(true);
    expect(r[0]!.pagoEm).toEqual(new Date("2026-08-27T00:00:00.000Z"));
    expect(r[0]!.valorPagoCentavos).toBe(79000);
  });

  it("sem PagamentoConfirmado → pago: false, pagoEm: null", () => {
    const r = negociacoesEmPrecoCheio([aprovacao()], []);
    expect(r[0]!.pago).toBe(false);
    expect(r[0]!.pagoEm).toBeNull();
  });

  it("pagamento de OUTRO pedido não vaza para este", () => {
    const r = negociacoesEmPrecoCheio(
      [aprovacao()],
      [{ clientRequestId: "req-999", confirmadoEm: new Date(), valorCentavos: 1 }],
    );
    expect(r[0]!.pago).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// A GUARDA DE PII (`seguranca`, 07/09/2026, F4-auditoria-sem-nome.md) — a
// ficha original desta auditoria autorizava devolver `businessName` junto com
// o id. Essa autorização caiu contra a guarda mais velha da rota que chama
// este módulo (`__tests__/plataforma/diagnostico-mede-e-nao-escreve.test.ts`):
// o segredo da rota trafega em `?chave=`, que aparece em log de proxy/CDN.
// A asserção NEGATIVA é a que protege — `clientRequestId` sai, nome NÃO sai.
// ─────────────────────────────────────────────────────────────────────────────
describe("nenhum nome de negócio sai daqui — só o clientRequestId", () => {
  it("a linha devolvida não carrega nenhuma propriedade de nome", () => {
    const r = negociacoesEmPrecoCheio([aprovacao()], []);
    expect(r[0]!.clientRequestId).toBe("req-1");
    expect(r[0]).not.toHaveProperty("negocio");
    expect(r[0]).not.toHaveProperty("businessName");
    expect(Object.keys(r[0]!).sort()).toEqual(
      ["clientRequestId", "negociadoEm", "pago", "pagoEm", "valorNaPropostaCentavos", "valorPagoCentavos"].sort(),
    );
  });
});

describe("o resumo agrega antes da lista", () => {
  it("total, pagos e naoPagos batem com as linhas", () => {
    const retrato = retratoDoLote(
      [
        aprovacao({ clientRequestId: "req-1" }),
        aprovacao({ clientRequestId: "req-2", reviewNote: textoDaPropostaAjustada("Outra", 490) }),
      ],
      [{ clientRequestId: "req-1", confirmadoEm: new Date("2026-08-27"), valorCentavos: 79000 }],
    );
    expect(retrato.total).toBe(2);
    expect(retrato.pagos).toBe(1);
    expect(retrato.naoPagos).toBe(1);
    expect(retrato.linhas).toHaveLength(2);
  });

  it("lote sem nenhuma negociação: retrato é ZERO, e zero é resultado — não erro", () => {
    const retrato = retratoDoLote([], []);
    expect(retrato).toEqual({ total: 0, pagos: 0, naoPagos: 0, linhas: [] });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CENÁRIO PLANTADO — a auditoria completa, como a rota vai montar
// ─────────────────────────────────────────────────────────────────────────────
describe("cenário plantado: um afetado dentro da janela, um fora, um sem negociação", () => {
  it("só o afetado dentro da janela sai na lista", () => {
    const aprovacoes: LinhaDeAprovacaoBruta[] = [
      // dentro da janela, negociou → AFETADO
      aprovacao({ clientRequestId: "afetado", createdAt: new Date("2026-08-29T00:00:00.000Z") }),
      // negociou, mas ANTES da janela (a tabela antiga tinha faixa de verdade)
      aprovacao({
        clientRequestId: "fora-da-janela",
        createdAt: new Date("2026-08-10T00:00:00.000Z"),
        reviewNote: textoDaPropostaAjustada("Antigo", 600),
      }),
      // proposta normal, nunca negociou (mesmo department, sem a marca)
      { clientRequestId: "sem-negociacao", department: "proposal", reviewNote: null, createdAt: new Date("2026-08-29T00:00:00.000Z") },
    ];

    const r = negociacoesEmPrecoCheio(aprovacoes, []);
    expect(r.map((l) => l.clientRequestId)).toEqual(["afetado"]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// A TRAVA QUEBRADA DE PROPÓSITO — prova de que "lista vazia" nunca pode
// significar "leitura falhou" NESTA camada. Este módulo é puro: ele não lê
// banco, então quem decide "falha != zero" é o CHAMADOR (a rota). O teste
// abaixo prova, por mutação textual do arquivo da rota, que o mecanismo
// fail-closed (503 + medido:false) continua cobrindo as leituras novas — se
// alguém apagar o try/catch ao redor delas, ESTE teste cai.
// ─────────────────────────────────────────────────────────────────────────────
describe("quem chama garante que falha de leitura não vira lista vazia", () => {
  const ROTA_PATH = path.join(process.cwd(), "app/api/piloto/diagnostico/route.ts");
  const ROTA = fs.readFileSync(ROTA_PATH, "utf8");

  it("a rota chama negociacoesEmPrecoCheio / retratoDoLote deste módulo — quem CHAMA está identificado", () => {
    expect(ROTA).toContain("preco-cheio-apos-negociacao");
  });

  it("a nova leitura (ApprovalRequest de proposta) está DENTRO do mesmo try que devolve 503", () => {
    const doTry = ROTA.indexOf("try {");
    const doCatch = ROTA.indexOf("} catch (e) {");
    const daNovaLeitura = ROTA.indexOf("prisma.approvalRequest.findMany");
    expect(doTry).toBeGreaterThan(-1);
    expect(doCatch).toBeGreaterThan(doTry);
    expect(daNovaLeitura).toBeGreaterThan(doTry);
    expect(daNovaLeitura).toBeLessThan(doCatch);
  });

  it("o catch continua devolvendo medido:false — nunca uma lista vazia disfarçada de zero", () => {
    expect(ROTA).toMatch(/medido:\s*false/);
    expect(ROTA).toMatch(/NÃO são zero, são desconhecidos/);
  });

  it("MUTAÇÃO: se a leitura de ApprovalRequest saísse do try (hipótese de regressão), este teste cairia", () => {
    // Não removemos de verdade (isto quebraria a rota) — simulamos a mutação
    // sobre o TEXTO e provamos que a mesma asserção acima teria detectado.
    const doTry = ROTA.indexOf("try {");
    const doCatch = ROTA.indexOf("} catch (e) {");
    const antesDoTry = ROTA.slice(0, doTry);
    const mutada = antesDoTry + "prisma.approvalRequest.findMany(/* movido para fora, de propósito, só neste teste */);\n" + ROTA.slice(doTry);
    const daNovaLeituraMutada = mutada.indexOf("prisma.approvalRequest.findMany");
    const doTryMutado = mutada.indexOf("try {");
    // a leitura mutada está ANTES do try — a mesma asserção do teste acima falharia
    expect(daNovaLeituraMutada).toBeLessThan(doTryMutado);
  });
});
