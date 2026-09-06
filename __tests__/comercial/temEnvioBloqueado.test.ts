// ─── `temEnvioBloqueado` — a leitura do marcador, uma vez só ────────────────
//
// Ficha 06/09/2026 ("a fila precisa mostrar o bloqueio"). Este arquivo testa a
// CAMADA DE CONTRATO (`contratoDeOportunidade.ts`), sem tela: a função que
// responde "esta oportunidade tem o envio bloqueado?" e a normalização que a
// alimenta.
//
// As duas metades exigidas pela ficha (item "Definição de pronto"):
//   1. oportunidade COM o marcador ⇒ bloqueada.
//   2. oportunidade SEM o marcador e `conformidadeOk: true` ⇒ NÃO bloqueada —
//      a metade que prova que a trava não pegou todo mundo.
//   3. `conformidadeOk: false` ⇒ comportamento de "reprovada" não regride
//      (conferido aqui na normalização; a tela em outro arquivo).
//   4. `conformidadeAchados` malformado (não é JSON) ⇒ fail-closed: bloqueada.
//
// A MESMA constante usada pela gravação (`gravar-candidatura.ts`) é usada
// aqui para montar os dados de teste — nunca a string digitada à mão duas
// vezes, que é exatamente a divergência que a ficha pede para evitar.

import { describe, it, expect } from "vitest";
import {
  temEnvioBloqueado,
  normalizarOportunidade,
  type AchadoDeConformidade,
} from "@/components/agency/comercial/contratoDeOportunidade";
import { REGRA_ENVIO_BLOQUEADO_POR_CUSTO_DESCONHECIDO } from "@/lib/marketplaces/99freelas/marcador-de-envio-bloqueado";

const MARCADOR: AchadoDeConformidade = {
  regra: REGRA_ENVIO_BLOQUEADO_POR_CUSTO_DESCONHECIDO,
  trecho: "custo em conexões desta interação não foi lido da tela.",
  fonte: "lib/marketplaces/99freelas/agente.ts · desfecho texto_pronto_envio_bloqueado",
};

describe("temEnvioBloqueado — a função pura", () => {
  it("1. COM o marcador ⇒ true", () => {
    expect(temEnvioBloqueado([MARCADOR])).toBe(true);
  });

  it("1b. o marcador ao lado de outros achados (não some no meio da lista)", () => {
    const outro: AchadoDeConformidade = { regra: "link_externo", trecho: "wa.me/551199", fonte: "compliance" };
    expect(temEnvioBloqueado([outro, MARCADOR])).toBe(true);
  });

  it("2. SEM o marcador (lista vazia) ⇒ false — não trava quem não tem o problema", () => {
    expect(temEnvioBloqueado([])).toBe(false);
  });

  it("2b. SEM o marcador (achados de outra regra, ex.: compliance normal) ⇒ false", () => {
    const outro: AchadoDeConformidade = { regra: "dado_de_contato", trecho: "11999999999", fonte: "compliance" };
    expect(temEnvioBloqueado([outro])).toBe(false);
  });

  it("4. registro ilegível (produzido pela normalização de JSON quebrado) ⇒ true, fail-closed", () => {
    const ilegivel: AchadoDeConformidade = {
      regra: "registro_ilegivel",
      trecho: "não consegui ler o registro da reprovação",
      fonte: "banco de dados desta casa",
    };
    expect(temEnvioBloqueado([ilegivel])).toBe(true);
  });
});

describe("normalizarOportunidade — a mesma pergunta, a partir do dado cru do banco", () => {
  const base = {
    id: "cmtpvf2b80000mz7d8ssk2rph",
    titulo: "Projeto de teste",
    status: "nova",
    conformidadeOk: true,
  };

  it("1. conformidadeOk true + achados com o marcador (JSON válido) ⇒ bloqueada", () => {
    const o = normalizarOportunidade({
      ...base,
      conformidadeAchados: JSON.stringify([MARCADOR]),
    });
    expect(o).not.toBeNull();
    expect(o!.conformidade).toBe("aprovada"); // o portão NÃO reprovou — honesto, per ficha
    expect(temEnvioBloqueado(o!.achados)).toBe(true);
  });

  it("2. conformidadeOk true + achados vazios (\"[]\") ⇒ NÃO bloqueada", () => {
    const o = normalizarOportunidade({ ...base, conformidadeAchados: "[]" });
    expect(o).not.toBeNull();
    expect(o!.conformidade).toBe("aprovada");
    expect(temEnvioBloqueado(o!.achados)).toBe(false);
  });

  it("3. conformidadeOk false (reprovada) continua reprovada, com ou sem o marcador — sem regressão", () => {
    const o = normalizarOportunidade({
      ...base,
      conformidadeOk: false,
      conformidadeAchados: JSON.stringify([{ regra: "link_externo", trecho: "wa.me/551199", fonte: "compliance" }]),
    });
    expect(o).not.toBeNull();
    expect(o!.conformidade).toBe("reprovada");
  });

  it("4. conformidadeAchados malformado (string que não é JSON) ⇒ fail-closed: bloqueada, nunca pronta", () => {
    const o = normalizarOportunidade({
      ...base,
      conformidadeAchados: "{ isto não fecha",
    });
    expect(o).not.toBeNull();
    // O portão continua não tendo reprovado (conformidadeOk chegou `true`) —
    // então NÃO é "barrada". Mas o parse falhou, e falha de leitura não pode
    // virar "liberado": o mecanismo de bloqueio precisa acusar `true` mesmo
    // sem o texto exato do marcador, porque não dá para provar que ele não
    // estava ali.
    expect(o!.conformidade).toBe("aprovada");
    expect(temEnvioBloqueado(o!.achados)).toBe(true);
  });
});
