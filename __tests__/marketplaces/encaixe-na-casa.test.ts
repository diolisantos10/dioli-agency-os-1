// ─── A CASA SÓ PROPÕE O QUE ELA SABE FAZER ──────────────────────────────────
//
// Despacho: docs/celula-prospeccao/despachos/2026-09-06-nao-propor-fora-do-escopo.md
//
// O defeito medido numa rodada REAL: `npx tsx scripts/coletar-99freelas.mts
// --limite 3 --gravar` gravou na fila do CEO uma proposta para "Melhoria
// visual do meu quarto" (decoração de quarto, móveis, estilo boho — nota 3).
// A casa gastou IA para redigir uma recusa educada, e essa recusa foi parar
// na fila como se fosse proposta pronta para o clique.
//
// ⚠️ O texto ORIGINAL do anúncio do quarto não está capturado em nenhum
// fixture deste repositório (conferido: nenhuma ocorrência de "quarto" fora
// deste despacho e deste teste). O texto abaixo é uma RECONSTRUÇÃO fiel à
// descrição do despacho ("decoração de quarto, móveis, estilo boho"), não uma
// cópia do HTML capturado — registrado aqui para quem for auditar depois.

import { describe, it, expect } from "vitest";
import {
  encaixaNaCasa,
  encaixarContra,
  derivarVocabularioDeEncaixe,
  type ServicoParaEncaixe,
} from "@/lib/marketplaces/99freelas/encaixe";
import { eliminar } from "@/lib/marketplaces/99freelas/agente";
import { extrairDeTexto } from "@/lib/agency/comercial/oportunidade";
import { SERVICOS_DA_CELULA, avaliarServico } from "@/lib/agency/celula/catalogo-ofertavel";

// ── Reconstrução do projeto do quarto (ver aviso acima) ─────────────────────
const TITULO_DO_QUARTO = "Melhoria visual do meu quarto";
const DESCRICAO_DO_QUARTO = `Quero redecorar o meu quarto e deixar mais aconchegante, com um estilo
boho. Preciso de ideias de organização dos móveis, escolha de cortina,
tapete e cabeceira, além de sugestões de iluminação e cores para as
paredes. O quarto é pequeno, então preciso aproveitar bem o espaço com
prateleiras e nichos. Também gostaria de referências de plantas e
almofadas para compor a decoração. Orçamento em torno de R$ 800 e prazo
de 15 dias para entregar o resultado completo.`;

describe("encaixaNaCasa — só encaixa o que a Dioli entrega HOJE", () => {
  it("1. o texto do projeto do quarto (decoração, móveis, boho) NÃO encaixa", () => {
    const r = encaixaNaCasa({
      titulo: TITULO_DO_QUARTO,
      descricao: DESCRICAO_DO_QUARTO,
      categoriaDeclarada: null,
    });
    expect(r.encaixa).toBe(false);
    if (!r.encaixa) {
      expect(r.motivo).toMatch(/nenhuma palavra|fora do que a (casa|dioli)/i);
    }
  });

  it("2. um projeto de social media / design para redes sociais ENCAIXA, e nomeia o serviço", () => {
    const r = encaixaNaCasa({
      titulo: "Preciso de artes para redes sociais",
      descricao:
        "Preciso de um pacote de artes para redes sociais: posts de feed, " +
        "story e carrossel, com legenda alinhada à marca da minha loja de " +
        "roupas. Preciso de 12 peças por mês, prazo de 30 dias, orçamento " +
        "de R$ 900.",
      categoriaDeclarada: "Design & Criação",
    });
    expect(r.encaixa).toBe(true);
    if (r.encaixa) {
      expect(r.servicosPossiveis).toContain("social-media-pecas");
    }
  });

  it("3. texto ambíguo ou vazio NÃO encaixa — e é por FAIL-CLOSED, não por acidente", () => {
    const vazio = encaixaNaCasa({ titulo: "", descricao: "", categoriaDeclarada: null });
    const ambiguo = encaixaNaCasa({ titulo: "oi", descricao: "?", categoriaDeclarada: null });

    for (const r of [vazio, ambiguo]) {
      expect(r.encaixa).toBe(false);
      if (!r.encaixa) {
        // A prova de que é FAIL-CLOSED por ausência de informação, e não o
        // mesmo motivo de "nenhuma palavra corresponde" que um texto CLARO
        // mas fora de escopo produziria (ver teste 1) — os dois têm de ser
        // frases DIFERENTES, senão a distinção não está provada.
        expect(r.motivo).toMatch(/vazio|curto demais/i);
      }
    }

    // A outra metade: o motivo do texto do quarto (claro, mas fora de
    // escopo) NÃO é o mesmo motivo do fail-closed por ambiguidade.
    const doQuarto = encaixaNaCasa({
      titulo: TITULO_DO_QUARTO,
      descricao: DESCRICAO_DO_QUARTO,
      categoriaDeclarada: null,
    });
    if (!doQuarto.encaixa && !vazio.encaixa) {
      expect(doQuarto.motivo).not.toBe(vazio.motivo);
      expect(doQuarto.motivo).not.toMatch(/vazio|curto demais/i);
    }
  });

  it("4. serviço cuja capacidade está fechada no mapa NÃO aparece em servicosPossiveis", () => {
    // Pede EXPLICITAMENTE um serviço fechado (logotipo — depende de
    // "logotipo-de-cliente", que tem `ponto: null` no mapa de capacidades) e,
    // ao mesmo tempo, algo que a casa entrega (redes sociais). O ponto do
    // teste: mesmo pedindo os dois, só o que a casa produz aparece.
    const r = encaixaNaCasa({
      titulo: "Preciso de peças para redes sociais e também um logotipo",
      descricao:
        "Preciso de um pacote de peças para redes sociais e também um " +
        "logotipo novo para a minha marca.",
      categoriaDeclarada: null,
    });
    expect(r.encaixa).toBe(true);
    if (r.encaixa) {
      expect(r.servicosPossiveis).toContain("social-media-pecas");
      // branding-identidade depende só de "logotipo-de-cliente", que não tem
      // ponto de produção — por construção ele nunca entra no vocabulário
      // (é filtrado em `servicosRealmenteOfertaveis`, antes de qualquer
      // palavra ser comparada), então não pode aparecer aqui.
      expect(r.servicosPossiveis).not.toContain("branding-identidade");
    }

    // A confirmação independente, direto na fonte: `avaliarServico` diz que
    // branding-identidade não é ofertável hoje.
    expect(avaliarServico("branding-identidade", { modoAutomatico: false }).ofertavel).toBe(false);
  });

  it("5. A PROVA ANTI-LISTA: um serviço NOVO no catálogo entra no encaixe sem editar encaixe.ts", () => {
    // `encaixarContra`/`derivarVocabularioDeEncaixe` recebem QUALQUER lista
    // de serviços — não só `SERVICOS_DA_CELULA`. Aqui a lista é FABRICADA,
    // com um serviço que não existe na casa: se o mecanismo fosse uma lista
    // de palavras-chave escrita à mão (o que o despacho proíbe), este
    // serviço jamais seria reconhecido, porque ninguém o digitou em lugar
    // nenhum deste arquivo.
    const catalogoComServicoNovo: ServicoParaEncaixe[] = [
      {
        id: "edicao-de-podcast",
        nome: "edição de podcast semanal",
        textos: ["corte, nivelamento e masterização de áudio de podcast semanal"],
      },
    ];

    const vocabulario = derivarVocabularioDeEncaixe(catalogoComServicoNovo);
    const termosDoNovo = vocabulario.get("edicao-de-podcast") ?? [];
    expect(termosDoNovo.length).toBeGreaterThan(0);

    const r = encaixarContra(catalogoComServicoNovo, {
      titulo: "Preciso de edição do meu podcast",
      descricao:
        "Tenho um podcast semanal e preciso de corte, nivelamento e " +
        "masterização de áudio toda semana, arquivo final em mp3.",
      categoriaDeclarada: null,
    });
    expect(r.encaixa).toBe(true);
    if (r.encaixa) expect(r.servicosPossiveis).toContain("edicao-de-podcast");

    // E a prova negativa: o MESMO texto contra o catálogo REAL de hoje não
    // encaixa em "edicao-de-podcast" — porque esse serviço não existe na
    // casa. A diferença entre os dois vem inteiramente da LISTA passada, não
    // de nada hardcoded neste arquivo.
    const hoje = encaixaNaCasa({
      titulo: "Preciso de edição do meu podcast",
      descricao:
        "Tenho um podcast semanal e preciso de corte, nivelamento e " +
        "masterização de áudio toda semana, arquivo final em mp3.",
      categoriaDeclarada: null,
    });
    if (hoje.encaixa) expect(hoje.servicosPossiveis).not.toContain("edicao-de-podcast");
  });

  it("nenhum termo do vocabulário nasce de uma palavra puramente de MERCADO (cliente, projeto, orçamento...)", () => {
    // Confere a afirmação do comentário do arquivo: as palavras filtradas
    // como "genéricas de mercado" não aparecem em `nome`/`textos` de nenhum
    // serviço ofertável — então filtrá-las não apaga nenhum serviço real.
    const ofertaveis = SERVICOS_DA_CELULA.filter(
      (s) => avaliarServico(s.id, { modoAutomatico: false }).ofertavel,
    );
    const vocabulario = derivarVocabularioDeEncaixe(ofertaveis);
    const todos = [...vocabulario.values()].flat();
    for (const generica of ["cliente", "projeto", "orcamento", "prazo"]) {
      expect(todos).not.toContain(generica);
    }
  });
});

describe("eliminar() consulta o encaixe — a trava está LIGADA, não só escrita", () => {
  it("o projeto do quarto é ELIMINADO por 'fora do que a Dioli entrega hoje', não vira proposta", () => {
    const textoCompleto = `Título: ${TITULO_DO_QUARTO}\nDescrição: ${DESCRICAO_DO_QUARTO}`;
    const campos = extrairDeTexto(textoCompleto);
    const r = eliminar(textoCompleto, campos);
    expect(r.eliminado).toBe(true);
    expect(r.motivo).toMatch(/fora do que a dioli entrega hoje/i);
  });
});
