// ─── MEDIR-ENCAIXE-99FREELAS — mede `encaixe.ts` contra o 99Freelas real ────
//
// Despacho: docs/celula-prospeccao/despachos/2026-09-06-medir-o-encaixe.md
//
// ── ISTO É MEDIÇÃO, NÃO PRODUÇÃO ─────────────────────────────────────────────
// `encaixe.ts` entrou em 06/09/2026 e já muda dinheiro: decide se a casa gasta
// IA e se a proposta existe. Ele casa por palavra solta e já errou uma vez
// medido ("Criação de roteiros para vídeos de viagens" casou em "vídeo" e
// sugeriu edição, não roteiro). O erro caro é o FALSO-NEGATIVO (projeto bom
// eliminado), que é invisível por construção — projeto eliminado não deixa
// proposta para ninguém conferir. Por isso este script:
//   • NÃO chama IA nenhuma — só `extrairProjeto` + `medirProjeto`
//     (`encaixaNaCasa` + `eliminar`, por dentro — ver
//     `lib/marketplaces/99freelas/medicao-de-encaixe.ts`);
//   • NÃO grava nada em `Oportunidade`, não decide nada, não altera
//     `encaixe.ts`;
//   • Grava o resultado em disco (`docs/celula-prospeccao/medicoes/`) para a
//     rotulagem HUMANA do que era certo acontecer depois — esta ficha proíbe
//     que essa rotulagem aconteça aqui.
//
// ── RITMO DE GENTE, NUNCA DE MÁQUINA ─────────────────────────────────────────
// Sequencial, nunca `Promise.all`. Pausa de NO MÍNIMO 3s entre CADA requisição
// HTTP ao 99Freelas — página de busca ou página de projeto, todas contam para
// o mesmo relógio (`requisitarComRitmo`, abaixo). É a mesma régua que faltou
// em 03/08/2026 e custou a conta de anúncios da Meta: automação em ritmo de
// máquina é o que dispara moderação. Só GET. Login nunca.
//
// ── REUSA O CLIENTE HTTP QUE JÁ EXISTE ──────────────────────────────────────
// `esperar`/`buscarHtml`/`resolverUrl` vêm de `scripts/coletar-99freelas.mts`
// (ganharam `export` para isto — nenhuma mudança de comportamento). Escrever
// um segundo cliente HTTP para o mesmo site seria pagar duas vezes pela mesma
// dívida de manutenção.
//
// ── ⚠️ A PAGINAÇÃO NÃO FOI CONFIRMADA CONTRA O SITE AO VIVO ─────────────────
// O único fixture capturado (`__tests__/fixtures/99freelas/busca-2026-09-06.html`)
// mostra a paginação como um componente client-side (`<span class="page-item"
// data-page="2">`, alimentado por um payload JSON com a chave `"page"`, não
// por um link `href` navegável) — não há, no fixture, uma URL de página 2
// capturada para confirmar o formato de query string. Este script tenta
// `?page=<N>` (a chave que o próprio payload da página usa) para páginas além
// da primeira, mas isto é uma INFERÊNCIA, não um fato observado. Quem rodar
// este script contra o site ao vivo deve conferir se a página 2 realmente
// traz projetos DIFERENTES da página 1 antes de confiar na contagem de
// páginas > 1 — o script já avisa no console quantos links são NOVOS por
// página (ver `linksNovos` abaixo), para essa conferência ser visível sem
// precisar ler HTML na mão.
//
// Uso:
//   npx tsx scripts/medir-encaixe-99freelas.mts
//   npx tsx scripts/medir-encaixe-99freelas.mts --paginas 5
//
// `import "dotenv/config"` como primeira linha — mesmo defeito medido em
// `coletar-99freelas.mts` (sem isto um script "tsx" avulso não carrega o
// ".env" e qualquer leitura de banco cai no fallback errado). Este script não
// lê banco, mas herda a mesma disciplina por ser o mesmo tipo de processo.
import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
// Import RELATIVO, não pelo alias `@/`: o `tsconfig` exclui `scripts/` do
// programa, então `@/scripts/...` compila (o alias existe) e QUEBRA EM
// EXECUÇÃO — `ERR_MODULE_NOT_FOUND` no primeiro `npx tsx`. O `tsc` não pega
// isso. Medido em 06/09/2026.
import { esperar, buscarHtml, resolverUrl } from "./coletar-99freelas.mts";
import { extrairLinksDaBusca, extrairProjeto } from "@/lib/marketplaces/99freelas/coleta";
import {
  medirProjeto,
  resumirMedicao,
  type ProjetoMedido,
  type ResumoDaMedicao,
} from "@/lib/marketplaces/99freelas/medicao-de-encaixe";

const BASE_URL = "https://www.99freelas.com.br";
const URL_BUSCA = `${BASE_URL}/projects`;

/** Nunca menos que isto entre duas requisições HTTP ao 99Freelas — busca ou
 *  detalhe, todas contam para o mesmo relógio. */
const PAUSA_MINIMA_MS = 3_000;

const PASTA_DE_MEDICOES = path.resolve(process.cwd(), "docs/celula-prospeccao/medicoes");

// ── Flags ─────────────────────────────────────────────────────────────────

interface Flags {
  paginas: number;
}

function lerFlags(argv: string[]): Flags {
  let paginas = 3;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--paginas") {
      const v = Number(argv[++i]);
      if (Number.isInteger(v) && v > 0) paginas = v;
    }
  }
  return { paginas };
}

/** Ver o AVISO no cabeçalho do arquivo — inferida, não confirmada ao vivo. */
function urlDaPagina(pagina: number): string {
  return pagina <= 1 ? URL_BUSCA : `${URL_BUSCA}?page=${pagina}`;
}

// ── O relógio único de ritmo, compartilhado por busca E detalhe ────────────

let requisicoesFeitas = 0;

async function requisitarComRitmo(url: string): Promise<string> {
  if (requisicoesFeitas > 0) {
    console.log(`  aguardando ${PAUSA_MINIMA_MS}ms (ritmo de gente, nunca de máquina)...`);
    await esperar(PAUSA_MINIMA_MS);
  }
  requisicoesFeitas++;
  return buscarHtml(url);
}

// ── O resumo, formatado para o console ──────────────────────────────────────

function imprimirResumo(resumo: ResumoDaMedicao): void {
  console.log(`\n── RESUMO — ${resumo.total} projeto(s) medido(s) ──────────────────────────\n`);
  console.log(`  encaixaram:              ${resumo.encaixaram} (${resumo.percentualQueEncaixou}%)`);
  console.log(`  não encaixaram:          ${resumo.naoEncaixaram}`);
  console.log(`  eliminados (plataforma): ${resumo.eliminadosPorPlataforma}`);
  console.log(`\n  distribuição por categoria declarada do 99Freelas:`);
  const categorias = Object.entries(resumo.porCategoriaDeclarada).sort((a, b) => b[1] - a[1]);
  if (categorias.length === 0) {
    console.log(`    (nenhum projeto medido)`);
  } else {
    for (const [categoria, contagem] of categorias) {
      console.log(`    ${categoria}: ${contagem}`);
    }
  }
}

// ── A gravação em disco — JSON + tabela legível ─────────────────────────────

function dataDeHoje(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Escapa `|` e quebra de linha — o que quebraria uma tabela Markdown. */
function paraCelulaDeTabela(texto: string | null): string {
  if (!texto) return "";
  return texto.replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
}

function paraMarkdown(itens: ProjetoMedido[], resumo: ResumoDaMedicao, paginas: number): string {
  const linhas: string[] = [];
  linhas.push(`# Medição do encaixe — ${dataDeHoje()}`);
  linhas.push("");
  linhas.push(
    `Despacho: \`docs/celula-prospeccao/despachos/2026-09-06-medir-o-encaixe.md\`. ` +
      `${paginas} página(s) de busca percorridas. Isto MEDE \`encaixe.ts\`; não decide nada e não altera o critério.`,
  );
  linhas.push("");
  linhas.push(`## Resumo`);
  linhas.push("");
  linhas.push(`- Total medido: **${resumo.total}**`);
  linhas.push(`- Encaixaram: **${resumo.encaixaram}** (${resumo.percentualQueEncaixou}%)`);
  linhas.push(`- Não encaixaram: **${resumo.naoEncaixaram}**`);
  linhas.push(`- Eliminados por motivo de plataforma: **${resumo.eliminadosPorPlataforma}**`);
  linhas.push("");
  linhas.push(`### Distribuição por categoria declarada`);
  linhas.push("");
  const categorias = Object.entries(resumo.porCategoriaDeclarada).sort((a, b) => b[1] - a[1]);
  if (categorias.length === 0) {
    linhas.push(`(nenhum projeto medido)`);
  } else {
    linhas.push(`| Categoria | Quantidade |`);
    linhas.push(`|---|---|`);
    for (const [categoria, contagem] of categorias) {
      linhas.push(`| ${paraCelulaDeTabela(categoria)} | ${contagem} |`);
    }
  }
  linhas.push("");
  linhas.push(`## Por projeto`);
  linhas.push("");
  linhas.push(`| Veredito | Título | Categoria declarada | Serviços possíveis | Motivo de eliminação | URL |`);
  linhas.push(`|---|---|---|---|---|---|`);
  for (const item of itens) {
    linhas.push(
      `| ${item.veredito} | ${paraCelulaDeTabela(item.titulo)} | ${paraCelulaDeTabela(item.categoriaDeclarada)} | ` +
        `${item.servicosPossiveis.join(", ")} | ${paraCelulaDeTabela(item.motivoDeEliminacao)} | ${item.url} |`,
    );
  }
  linhas.push("");
  return linhas.join("\n");
}

function gravarEmDisco(itens: ProjetoMedido[], resumo: ResumoDaMedicao, paginas: number): { json: string; md: string } {
  fs.mkdirSync(PASTA_DE_MEDICOES, { recursive: true });
  const base = `encaixe-${dataDeHoje()}`;
  const caminhoJson = path.join(PASTA_DE_MEDICOES, `${base}.json`);
  const caminhoMd = path.join(PASTA_DE_MEDICOES, `${base}.md`);

  fs.writeFileSync(
    caminhoJson,
    JSON.stringify({ medidoEm: new Date().toISOString(), paginas, resumo, itens }, null, 2),
    "utf-8",
  );
  fs.writeFileSync(caminhoMd, paraMarkdown(itens, resumo, paginas), "utf-8");

  return { json: caminhoJson, md: caminhoMd };
}

// ── main ──────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const flags = lerFlags(process.argv.slice(2));
  console.log(`Medindo encaixe.ts contra ${flags.paginas} página(s) de ${URL_BUSCA} — sem IA, sem gravar Oportunidade.`);

  const linksVistos = new Set<string>();
  const linksNaOrdem: string[] = [];

  for (let pagina = 1; pagina <= flags.paginas; pagina++) {
    const url = urlDaPagina(pagina);
    console.log(`\nBuscando página ${pagina}/${flags.paginas}: ${url}`);
    let html: string;
    try {
      html = await requisitarComRitmo(url);
    } catch (e) {
      console.log(`  ⚠️ falhou ao buscar a página ${pagina}: ${e instanceof Error ? e.message : e} — pulando esta página.`);
      continue;
    }
    const linksDaPagina = extrairLinksDaBusca(html).map(resolverUrl);
    const novos = linksDaPagina.filter((l) => !linksVistos.has(l));
    for (const l of novos) {
      linksVistos.add(l);
      linksNaOrdem.push(l);
    }
    console.log(`  ${linksDaPagina.length} link(s) na página, ${novos.length} novo(s) (ver AVISO da paginação no topo do arquivo).`);
  }

  console.log(`\n${linksNaOrdem.length} link(s) de projeto, no total, para medir.`);
  if (linksNaOrdem.length === 0) {
    console.log("Nenhum link para medir. Fim.");
    return;
  }

  const itens: ProjetoMedido[] = [];

  for (let i = 0; i < linksNaOrdem.length; i++) {
    const url = linksNaOrdem[i];
    console.log(`\nLendo projeto ${i + 1}/${linksNaOrdem.length}: ${url}`);
    let html: string;
    try {
      html = await requisitarComRitmo(url);
    } catch (e) {
      console.log(`  ⚠️ falhou ao buscar ${url}: ${e instanceof Error ? e.message : e} — pulando.`);
      continue;
    }
    const projeto = extrairProjeto(html, url);
    if (!projeto) {
      console.log(`  ⚠️ não deu para extrair o projeto de ${url} — pulando.`);
      continue;
    }
    const medido = medirProjeto(projeto);
    itens.push(medido);
    console.log(`  [${medido.veredito}] ${medido.titulo}`);
  }

  const resumo = resumirMedicao(itens);
  imprimirResumo(resumo);

  const caminhos = gravarEmDisco(itens, resumo, flags.paginas);
  console.log(`\nGravado:\n  ${caminhos.json}\n  ${caminhos.md}`);
}

// Guarda de execução — mesmo padrão de `scripts/coletar-99freelas.mts`: só
// dispara `main()` (rede real) quando este arquivo é o PONTO DE ENTRADA do
// processo.
const executadoDireto = process.argv[1] && import.meta.url === `file://${path.resolve(process.argv[1])}`;

if (executadoDireto) {
  main().catch((e) => {
    console.error("Falha ao medir o encaixe:", e instanceof Error ? e.stack ?? e.message : e);
    process.exitCode = 1;
  });
}
