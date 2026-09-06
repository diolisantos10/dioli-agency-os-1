// ─── O cartão mostra o envio bloqueado — ficha 06/09/2026 ───────────────────
//
// O DEFEITO: `CartaoDeOportunidade.tsx` só renderizava `achados` no ramo
// "barrada" (`conformidade === "reprovada"`). Uma oportunidade com o texto
// pronto e o portão OK (`conformidadeOk: true`), mas com o marcador
// `envio_bloqueado_custo_desconhecido` gravado em `conformidadeAchados`,
// aparecia como se estivesse pronta para copiar — o defeito que esta ficha
// fecha.
//
// Renderização de VERDADE com `react-dom/server` (ver `vitest.config.ts`,
// 15/08/2026): ler o código-fonte à procura de string pega texto que sumiu,
// mas não pega botão habilitado para quem não devia, nem estado que não
// monta. As quatro travas da "Definição de pronto" da ficha, cada uma com as
// duas metades onde aplicável.

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import CartaoDeOportunidade from "@/components/agency/comercial/CartaoDeOportunidade";
import { REGRA_ENVIO_BLOQUEADO_POR_CUSTO_DESCONHECIDO } from "@/lib/marketplaces/99freelas/marcador-de-envio-bloqueado";
import type { Oportunidade } from "@/components/agency/comercial/contratoDeOportunidade";

/** Uma oportunidade "pronta" comum — o piso de onde cada teste desvia só o
 *  necessário. Todos os campos que a tela lê estão preenchidos, para o teste
 *  não confundir "campo ausente" com "estado bloqueado". */
function oportunidadeBase(overrides: Partial<Oportunidade> = {}): Oportunidade {
  return {
    id: "cmtpvf2b80000mz7d8ssk2rph",
    plataforma: "99freelas",
    titulo: "Preciso de um site institucional",
    nota: 82,
    servicoSugerido: "Site institucional",
    valorSugerido: "R$ 2.400",
    orcamentoInformado: "R$ 2.000 a R$ 3.000",
    prazoInformado: "15 dias",
    categoria: "Desenvolvimento Web",
    raciocinio: "Escopo claro, orçamento compatível com o piso da categoria.",
    textoOriginal: "Preciso de um site institucional com 5 páginas, para clínica odontológica.",
    proposta: "Olá! Tenho experiência com sites institucionais para clínicas...",
    url: "https://www.99freelas.com.br/projetos/12345",
    status: "nova",
    criadaEm: "2026-09-06T12:00:00.000Z",
    conformidade: "aprovada",
    achados: [],
    higienizada: false,
    preco: null,
    ...overrides,
  };
}

function renderCartao(o: Oportunidade, cobraConexao = true): string {
  return renderToStaticMarkup(
    <CartaoDeOportunidade
      oportunidade={o}
      aberta
      onAlternar={() => {}}
      onDecidir={() => {}}
      decidindo={false}
      cobraConexao={cobraConexao}
    />,
  );
}

describe("CartaoDeOportunidade — o quarto estado (pronta, mas o envio bloqueado)", () => {
  it("1. COM o marcador ⇒ estado bloqueado visível, distinto de 'barrada' e de 'pronta'", () => {
    const html = renderCartao(
      oportunidadeBase({
        conformidade: "aprovada", // o portão NÃO reprovou — de propósito
        achados: [
          {
            regra: REGRA_ENVIO_BLOQUEADO_POR_CUSTO_DESCONHECIDO,
            trecho: "custo em conexões desta interação não foi lido da tela.",
            fonte: "lib/marketplaces/99freelas/agente.ts · desfecho texto_pronto_envio_bloqueado",
          },
        ],
      }),
    );

    // O selo aparece já no cabeçalho colapsado (a FILA mostra, não só o painel).
    expect(html).toContain("Envio bloqueado");
    // A explicação de negócio, não o identificador técnico cru.
    expect(html).toContain("o envio está bloqueado");
    expect(html).toContain("Abra o anúncio na plataforma");
    // NÃO é o vermelho de reprovação — a tela não pode afirmar que o portão
    // reprovou quando ele não reprovou.
    expect(html).not.toContain("Barrada antes de virar texto copiável");
    expect(html).not.toContain("viola a regra da plataforma");
  });

  it("1b. a ação de envio/cópia fica desabilitada, com o motivo ao lado do controle", () => {
    const html = renderCartao(
      oportunidadeBase({
        achados: [
          {
            regra: REGRA_ENVIO_BLOQUEADO_POR_CUSTO_DESCONHECIDO,
            trecho: "custo desconhecido",
            fonte: "agente.ts",
          },
        ],
      }),
    );

    // O botão "Copiar" do painel some habilitado — mesmo texto do defeito
    // relatado na ficha ("botão de copiar habilitado").
    const copiarPainel = html.match(/<button[^>]*>Copiar<\/button>/);
    expect(copiarPainel).not.toBeNull();
    expect(copiarPainel![0]).toContain("disabled=\"\"");

    // "Aprovar e copiar" não promete cópia que não vai acontecer — vira só
    // "Aprovar" (mesma regra que já vale para "barrada").
    expect(html).not.toContain("Aprovar e copiar");
    expect(html).toContain(">Aprovar<");

    // "Marcar como enviada" fica desabilitado, e o motivo aparece do lado.
    const marcarEnviada = html.match(/<button[^>]*>\s*Marcar como enviada\s*<\/button>/);
    expect(marcarEnviada).not.toBeNull();
    expect(marcarEnviada![0]).toContain("disabled=\"\"");
    expect(html).toContain("Envio desabilitado até alguém ler o custo em conexões");

    // "Recusar" continua disponível — bloqueio de envio não é bloqueio de
    // toda decisão sobre a oportunidade.
    const recusar = html.match(/<button[^>]*>Recusar<\/button>/);
    expect(recusar).not.toBeNull();
    expect(recusar![0]).not.toContain("disabled=\"\"");
  });

  it("2. SEM o marcador e conformidadeOk true ⇒ continua pronta, ação habilitada (não trava todo mundo)", () => {
    const html = renderCartao(oportunidadeBase({ conformidade: "aprovada", achados: [] }));

    expect(html).not.toContain("Envio bloqueado");
    expect(html).not.toContain("o envio está bloqueado");
    expect(html).toContain("Aprovar e copiar");

    const copiarPainel = html.match(/<button[^>]*>Copiar<\/button>/);
    expect(copiarPainel).not.toBeNull();
    expect(copiarPainel![0]).not.toContain("disabled=\"\"");

    const marcarEnviada = html.match(/<button[^>]*>\s*Marcar como enviada\s*<\/button>/);
    expect(marcarEnviada).not.toBeNull();
    expect(marcarEnviada![0]).not.toContain("disabled=\"\"");
  });

  it("3. conformidade reprovada continua no estado 'barrada' de hoje — sem regressão", () => {
    const html = renderCartao(
      oportunidadeBase({
        conformidade: "reprovada",
        proposta: null,
        achados: [{ regra: "link_externo", trecho: "wa.me/551199", fonte: "compliance" }],
      }),
    );

    expect(html).toContain("Barrada antes de virar texto copiável");
    expect(html).toContain("Link externo antes do contrato");
    // O selo de "Envio bloqueado" é OUTRO estado — não aparece aqui.
    expect(html).not.toContain("Envio bloqueado");
  });

  it("3b. reprovada AO MESMO TEMPO com o marcador de envio bloqueado ⇒ barrada vence, sem regressão", () => {
    // Caso de borda que a ficha não descreve, mas que a função de leitura
    // torna possível: as duas condições juntas. Barrada precisa vencer —
    // continuar sem mostrar texto nenhum é o requisito mais rígido dos dois.
    const html = renderCartao(
      oportunidadeBase({
        conformidade: "reprovada",
        proposta: null,
        achados: [
          { regra: "link_externo", trecho: "wa.me/551199", fonte: "compliance" },
          {
            regra: REGRA_ENVIO_BLOQUEADO_POR_CUSTO_DESCONHECIDO,
            trecho: "custo desconhecido",
            fonte: "agente.ts",
          },
        ],
      }),
    );

    expect(html).toContain("Barrada antes de virar texto copiável");
    expect(html).not.toContain("Escrita e aprovada — mas o envio está bloqueado");
  });

  it("4. conformidadeAchados malformado (registro_ilegivel) ⇒ fail-closed: bloqueada, nunca pronta", () => {
    const html = renderCartao(
      oportunidadeBase({
        conformidade: "aprovada",
        achados: [
          {
            regra: "registro_ilegivel",
            trecho: "não consegui ler o registro da reprovação",
            fonte: "banco de dados desta casa",
          },
        ],
      }),
    );

    expect(html).toContain("Envio bloqueado");
    const copiarPainel = html.match(/<button[^>]*>Copiar<\/button>/);
    expect(copiarPainel![0]).toContain("disabled=\"\"");
    expect(html).not.toContain("Aprovar e copiar");
  });
});
