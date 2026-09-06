// ─── Testes da PONTE HTML → ProjetoBruto (99Freelas) ────────────────────────
//
// Contra os DOIS fixtures reais capturados com `curl` em 06/09/2026 — nunca
// HTML inventado. A regra que mais importa aqui é a de ausência: "Aberto" (ou
// qualquer orçamento textual sem número) tem que virar `null`, nunca `0`.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  extrairLinksDaBusca,
  extrairProjeto,
  paraProjetoBruto,
  valorEmReaisDoTexto,
  horasDesdePublicacao,
  decodificarEntidadesHtml,
  type ProjetoColetado,
} from "@/lib/marketplaces/99freelas/coleta";

const FIXTURES = path.join(process.cwd(), "__tests__/fixtures/99freelas");
const HTML_BUSCA = readFileSync(path.join(FIXTURES, "busca-2026-09-06.html"), "utf-8");
const HTML_PROJETO = readFileSync(path.join(FIXTURES, "projeto-781493-2026-09-06.html"), "utf-8");
const URL_PROJETO = "https://www.99freelas.com.br/project/edicao-de-videos-curtos-para-tiktok-shop-781493";

// ── extrairLinksDaBusca ──────────────────────────────────────────────────────

describe("extrairLinksDaBusca", () => {
  it("encontra todos os projetos listados na busca, como URL absoluta", () => {
    const links = extrairLinksDaBusca(HTML_BUSCA);

    // O fixture tem 10 <li class="with-flag" ...> no result-list — não 8. É o
    // que o `curl` real trouxe em 06/09/2026 (conferido por
    // `grep -c '<li class="with-flag'`), e o teste prova contra o fixture, não
    // contra um número lembrado de memória.
    expect(links).toHaveLength(10);

    for (const link of links) {
      expect(link).toMatch(/^https:\/\/www\.99freelas\.com\.br\/project\/[a-z0-9-]+-\d+$/);
    }

    // O projeto usado no fixture de detalhe está entre os da busca.
    expect(links).toContain(URL_PROJETO);
  });

  it("ignora /project/new", () => {
    const links = extrairLinksDaBusca(HTML_BUSCA);
    expect(links.some((l) => l.endsWith("/project/new"))).toBe(false);
  });

  it("não duplica", () => {
    const links = extrairLinksDaBusca(HTML_BUSCA);
    expect(new Set(links).size).toBe(links.length);
  });

  it("devolve lista vazia para HTML sem projeto nenhum", () => {
    expect(extrairLinksDaBusca("")).toEqual([]);
    expect(extrairLinksDaBusca("<html><body>nada aqui</body></html>")).toEqual([]);
  });
});

// ── extrairProjeto — o caso limpo ────────────────────────────────────────────

describe("extrairProjeto — fixture real de detalhe", () => {
  const p = extrairProjeto(HTML_PROJETO, URL_PROJETO);

  it("extrai sem devolver null", () => {
    expect(p).not.toBeNull();
  });

  it("extrai o título, decodificado", () => {
    expect(p!.titulo).toBe("Edição de vídeos curtos para TikTok Shop");
  });

  it("extrai a descrição inteira, não um resumo", () => {
    // Não vazia, não truncada, e sem sobra de tag/entidade — prova que o texto
    // é o briefing de verdade, não um pedaço arbitrário do HTML.
    expect(p!.descricao.length).toBeGreaterThan(300);
    expect(p!.descricao).toContain("Buscamos editor(a) para uma demanda recorrente");
    expect(p!.descricao).toContain("20 a 30 vídeos por dia");
    expect(p!.descricao).toContain("pacote mensal");
    expect(p!.descricao).not.toMatch(/<[a-z]/i);
    expect(p!.descricao).not.toMatch(/&[a-zA-Z]+;/);
  });

  it("extrai a descrição com o texto EXATO, não uma versão truncada+duplicada", () => {
    // Regressão do bug real de 06/09/2026: o `<div>` da descrição tem um
    // atributo `data-content="...<br/><br/>..."` cujo VALOR carrega, como
    // texto literal, a sequência `<br/>` — que inclui um `>`. Um regex de
    // fechamento de tag ingênuo (`[^>]*>`) parava nesse `>` embutido, no meio
    // do atributo, e não no fechamento real da tag. Resultado: a descrição
    // perdia a primeira frase, ganhava um `">` solto no meio e duplicava o
    // resto do texto (capturava até o `</div>` seguinte, que é o corpo
    // visível da própria div — a MESMA descrição de novo).
    //
    // Uma asserção de substring (`toContain`) nunca pegaria isso: um texto
    // truncado-e-duplicado ainda "contém" as frases esperadas. Só comparar o
    // texto EXATO, caractere a caractere, pina o bug.
    expect(p!.descricao).toBe(
      "Buscamos editor(a) para uma demanda recorrente de aproximadamente 400 vídeos por mês / 100 por semana.\n\n" +
        "São vídeos muito simples, de até 1min30, normalmente divididos em abertura, conteúdo e encerramento. " +
        "A edição consiste basicamente em cortes, aproximações/afastamentos de zoom, pequenos ajustes e " +
        "variações de encerramento. Não envolve edição complexa ou motion design.\n\n" +
        "O material é gravado em grande escala e buscamos alguém com capacidade para editar aproximadamente " +
        "20 a 30 vídeos por dia.\n\n" +
        "Na proposta, informe sua capacidade diária e o valor para o pacote mensal de aproximadamente 400 " +
        "vídeos curtos de até 1min30.\n\n" +
        "Podemos iniciar com um pequeno lote remunerado para avaliação do padrão e da produtividade.",
    );
  });

  it("extrai categoria e subcategoria, como aparecem na tela", () => {
    expect(p!.categoria).toBe("Fotografia & AudioVisual");
    expect(p!.subcategoria).toBe("Vídeo - Edição e Produção");
  });

  it("extrai nível de experiência", () => {
    expect(p!.nivel).toBe("Intermediário");
  });

  it("extrai o número de propostas da tabela (275), não o do cabeçalho da lista (273)", () => {
    // O fixture tem duas contagens diferentes: "Propostas: 275" na tabela de
    // Informações adicionais e "Propostas (273)" no cabeçalho da lista de
    // propostas (275 menos as 2 excluídas). A tabela é o dado estruturado; o
    // cabeçalho é rótulo de UI. `numeroDePropostas` usa a tabela.
    expect(p!.numeroDePropostas).toBe(275);
  });

  it("extrai a data de publicação como o texto disse, sem recalcular", () => {
    expect(p!.publicadoEm).toBe("03/09/2026 às 08:25");
  });

  it("extrai o valor mínimo em reais", () => {
    expect(p!.valorMinimo).toBe(50);
  });

  it("guarda a URL recebida por parâmetro", () => {
    expect(p!.url).toBe(URL_PROJETO);
  });
});

// ── extrairProjeto — a regra de ausência ─────────────────────────────────────

describe("extrairProjeto — ausência de orçamento não vira zero", () => {
  it('orçamento "Aberto" é preservado como string, mas orcamentoInformado é null', () => {
    const p = extrairProjeto(HTML_PROJETO, URL_PROJETO)!;
    expect(p.orcamento).toBe("Aberto");
    expect(p.orcamentoInformado).toBeNull();
    // A trava explícita: nunca 0, nunca string vazia.
    expect(p.orcamentoInformado).not.toBe(0);
  });
});

// ── extrairProjeto — não é página de projeto ─────────────────────────────────

describe("extrairProjeto — páginas que não são um projeto", () => {
  it("devolve null para a página de busca (é uma página real, mas não é a de detalhe)", () => {
    expect(extrairProjeto(HTML_BUSCA, "https://www.99freelas.com.br/projects")).toBeNull();
  });

  it("devolve null para HTML vazio", () => {
    expect(extrairProjeto("", URL_PROJETO)).toBeNull();
  });

  it("devolve null para um trecho de erro sem marcação de projeto", () => {
    const paginaDeErro = "<html><body><h1>404</h1><p>Projeto não encontrado ou removido.</p></body></html>";
    expect(extrairProjeto(paginaDeErro, URL_PROJETO)).toBeNull();
  });
});

// ── valorEmReaisDoTexto — as duas metades ────────────────────────────────────

describe("valorEmReaisDoTexto", () => {
  it("funciona no caso limpo: um valor único", () => {
    expect(valorEmReaisDoTexto("R$ 500,00")).toBe(500);
  });

  it("funciona no caso limpo: uma faixa — grava o PISO, não o teto", () => {
    expect(valorEmReaisDoTexto("R$ 500,00 - R$ 1.000,00")).toBe(500);
  });

  it("não inventa dado no caso ausente: Aberto", () => {
    expect(valorEmReaisDoTexto("Aberto")).toBeNull();
  });

  it("não inventa dado no caso ausente: texto sem número", () => {
    expect(valorEmReaisDoTexto("A combinar")).toBeNull();
  });

  it("não inventa dado no caso ausente: null/undefined/vazio", () => {
    expect(valorEmReaisDoTexto(null)).toBeNull();
    expect(valorEmReaisDoTexto(undefined)).toBeNull();
    expect(valorEmReaisDoTexto("")).toBeNull();
  });
});

// ── horasDesdePublicacao — as duas metades ───────────────────────────────────

describe("horasDesdePublicacao", () => {
  it("funciona no caso limpo, com `agora` injetado (determinístico)", () => {
    const agora = new Date(2026, 8, 6, 8, 25); // 3 dias exatos depois
    expect(horasDesdePublicacao("03/09/2026 às 08:25", agora)).toBe(72);
  });

  it("não inventa dado quando o texto não bate no formato conhecido", () => {
    expect(horasDesdePublicacao("há 2 dias")).toBeNull();
    expect(horasDesdePublicacao(null)).toBeNull();
    expect(horasDesdePublicacao(undefined)).toBeNull();
  });
});

// ── decodificarEntidadesHtml ──────────────────────────────────────────────────

describe("decodificarEntidadesHtml", () => {
  it("decodifica as entidades nomeadas vistas nos fixtures reais", () => {
    expect(decodificarEntidadesHtml("Edi&ccedil;&atilde;o de v&iacute;deos")).toBe("Edição de vídeos");
  });

  it("decodifica entidade numérica como fallback", () => {
    expect(decodificarEntidadesHtml("A&#231;&#227;o")).toBe("Ação");
  });
});

// ── paraProjetoBruto ──────────────────────────────────────────────────────────

describe("paraProjetoBruto — caso limpo, a partir do fixture real", () => {
  const coletado = extrairProjeto(HTML_PROJETO, URL_PROJETO)!;
  const bruto = paraProjetoBruto(coletado);

  it("usa a URL do projeto", () => {
    expect(bruto.url).toBe(URL_PROJETO);
  });

  it("monta conteudoDeTerceiro com título, descrição, categoria e orçamento visíveis", () => {
    expect(bruto.conteudoDeTerceiro).toContain(coletado.titulo);
    expect(bruto.conteudoDeTerceiro).toContain("Buscamos editor(a) para uma demanda recorrente");
    expect(bruto.conteudoDeTerceiro).toContain("Categoria: Fotografia & AudioVisual");
    expect(bruto.conteudoDeTerceiro).toContain("Subcategoria: Vídeo - Edição e Produção");
    expect(bruto.conteudoDeTerceiro).toContain("Orçamento: Aberto");
  });

  it("custoEmConexoesLidoDaTela é sempre null — a tela pública não mostra isso", () => {
    expect(bruto.custoEmConexoesLidoDaTela).toBeNull();
  });

  it("calcula horasDesdeAPublicacao a partir de publicadoEm", () => {
    expect(typeof bruto.horasDesdeAPublicacao).toBe("number");
    expect(bruto.horasDesdeAPublicacao!).toBeGreaterThan(0);
  });
});

describe("paraProjetoBruto — não inventa dado no caso ausente", () => {
  const semNadaDeclarado: ProjetoColetado = {
    url: "https://www.99freelas.com.br/project/algo-sem-nada-999999",
    titulo: "Projeto sem categoria nem orçamento declarados",
    descricao: "Descrição mínima do projeto, sem mais detalhes por enquanto.",
    categoria: null,
    subcategoria: null,
    orcamento: null,
    orcamentoInformado: null,
    nivel: null,
    numeroDePropostas: null,
    publicadoEm: null,
    valorMinimo: null,
  };

  const bruto = paraProjetoBruto(semNadaDeclarado);

  it("não escreve uma linha 'Categoria:' ou 'Orçamento:' inventada quando o dado não existe", () => {
    // A asserção mira a LINHA DE RÓTULO, não a palavra solta. A primeira versão
    // deste teste usava `/categoria/i` sobre o texto inteiro e reprovava o
    // próprio título do caso de teste ("Projeto sem categoria nem orçamento
    // declarados") — reprovava o DADO REAL do anúncio, não o rótulo inventado.
    // Um anúncio de verdade pode dizer "categoria" ou "orçamento" na descrição,
    // e apagar isso seria mutilar o texto do cliente.
    expect(bruto.conteudoDeTerceiro).not.toMatch(/^Categoria\s*:/im);
    expect(bruto.conteudoDeTerceiro).not.toMatch(/^Or[çc]amento\s*:/im);
    // Mas título e descrição de verdade continuam lá.
    expect(bruto.conteudoDeTerceiro).toContain(semNadaDeclarado.titulo);
    expect(bruto.conteudoDeTerceiro).toContain(semNadaDeclarado.descricao);
  });

  it("horasDesdeAPublicacao é null quando publicadoEm é null", () => {
    expect(bruto.horasDesdeAPublicacao).toBeNull();
  });

  it("custoEmConexoesLidoDaTela continua null", () => {
    expect(bruto.custoEmConexoesLidoDaTela).toBeNull();
  });
});
