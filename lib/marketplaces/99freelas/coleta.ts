// ─── COLETA — a ponte entre o HTML público do 99Freelas e o `ProjetoBruto` ──
//
// `agente.ts` (`processarProjeto`/`rodada`) já decide tudo: elimina, pontua,
// precifica, redige e aplica o portão. Este arquivo não decide nada — ele só
// TRADUZ o que está na tela pública em algo que `agente.ts` sabe ler.
//
// ── PURO, DE PROPÓSITO ───────────────────────────────────────────────────────
// Nenhum `fetch` aqui. A rede entra por injeção em `lerProjeto`
// (`lib/marketplaces/navegador.ts`); este arquivo só recebe string de HTML já
// baixada e devolve dado estruturado. É o que permite testar contra os
// fixtures REAIS em disco, sem Chromium e sem rede.
//
// ── O QUE OS DOIS FIXTURES ENSINARAM SOBRE O HTML REAL (06/09/2026) ─────────
// A casca do site (título da página, meta tags, o texto dentro dos `<li>` da
// busca) sai com HTML entities numeradas em português (`&ccedil;`, `&atilde;`,
// `&iacute;`...). A tabela "Informações adicionais" da página de detalhe (onde
// moram categoria, orçamento, nível, propostas) sai em UTF-8 LITERAL — sem
// entity nenhuma. As duas formas convivem na MESMA página. Um parser que só
// soubesse decodificar `&amp;`/`&lt;`/`&gt;` (como `textoVisivel` em
// `navegador.ts`) leria "Edi&ccedil;&atilde;o" errado. Por isso
// `decodificarEntidadesHtml` cobre as entidades nomeadas vistas nos dois
// fixtures, mais um fallback numérico (`&#123;`/`&#x7B;`) para o que não foi
// visto ainda — decodificar de mais nunca inventa acento; decodificar de menos
// deixa `&ccedil;` cru na tela do CEO.
//
// ── A REGRA DAS FAIXAS DE ORÇAMENTO ─────────────────────────────────────────
// Espelha a mesma decisão já tomada em
// `lib/agency/comercial/oportunidade.ts` (`extrairOrcamento`): uma faixa
// "R$ 500,00 - R$ 1.000,00" grava o PISO (500), nunca o teto — contar o teto
// seria vender ao resto da casa uma expectativa que o anúncio não fez.

import type { ProjetoBruto } from "@/lib/marketplaces/99freelas/agente";

const BASE_URL = "https://www.99freelas.com.br";

// ── Decodificação de entidades ───────────────────────────────────────────────

/** As entidades nomeadas REALMENTE vistas nos dois fixtures capturados em
 *  06/09/2026, mais o punhado óbvio (aspas, `&amp;`, travessão) que qualquer
 *  página HTML pode trazer. Lista aberta por natureza — o fallback numérico
 *  cobre o resto. */
const ENTIDADES_NOMEADAS: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  aacute: "á", Aacute: "Á", eacute: "é", Eacute: "É", iacute: "í", Iacute: "Í",
  oacute: "ó", Oacute: "Ó", uacute: "ú", Uacute: "Ú",
  atilde: "ã", Atilde: "Ã", otilde: "õ", Otilde: "Õ",
  acirc: "â", Acirc: "Â", ecirc: "ê", Ecirc: "Ê", ocirc: "ô", Ocirc: "Ô",
  agrave: "à", Agrave: "À", egrave: "è", Egrave: "È",
  ccedil: "ç", Ccedil: "Ç",
  ndash: "–", mdash: "—", bull: "•", hellip: "…",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
};

/** Decodifica entidades HTML nomeadas e numéricas. Exportada porque decodificar
 *  errado é o tipo de bug que só aparece na tela do CEO, nunca no teste que
 *  esquece de olhar o texto de verdade. */
export function decodificarEntidadesHtml(texto: string): string {
  return (texto ?? "")
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, nome: string) => ENTIDADES_NOMEADAS[nome] ?? m);
}

/** Um fragmento de HTML (célula de tabela, `<span>`, `<div>`) vira texto visível:
 *  `<br>` é quebra de linha real (não espaço — perderia estrutura do briefing),
 *  o resto das tags cai fora, entidades são decodificadas, espaço repetido
 *  colapsa. Não usa `textoVisivel` de `navegador.ts` de propósito: aquela
 *  função decodifica só 4 entidades e serve a um objetivo diferente (o texto
 *  bruto da página inteira para o portão de conformidade avaliar), não a
 *  extração precisa de campo por campo que este arquivo faz. */
function textoDeHtml(fragmento: string): string {
  const semTags = decodificarEntidadesHtml(
    (fragmento ?? "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(?:p|div|li|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  );
  return semTags
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function escaparParaRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── Fechamento de tag robusto a `>` dentro de valor de atributo ──────────────
//
// BUG REAL, achado em 06/09/2026 contra o fixture de detalhe: o `<div>` da
// descrição tem um atributo `data-content="...<br/><br/>..."` — o valor do
// atributo carrega, como TEXTO LITERAL, a sequência `<br/>`, que inclui um
// `>`. Um padrão ingênuo de "atributos até o fechamento" como `[^>]*>` para no
// PRIMEIRO `>` que encontra, que é esse `>` de dentro do valor do atributo —
// ainda no meio da tag, não no fechamento real. O resultado: a captura
// começava depois desse ponto (perdendo a primeira frase), carregava um `">`
// solto (o resto do atributo + o `>` de fechamento real, presos dentro da
// captura) e ia até o `</div>` seguinte — duplicando o corpo visível da div,
// que repete a mesma descrição.
//
// A correção: HTML bem-formado nunca tem `"` cru dentro do valor de um
// atributo (viraria `&quot;`), mas PODE ter `>` cru lá dentro. Então, em vez
// de varrer "qualquer coisa até o primeiro `>`", varremos pares
// `nome="valor sem aspas cruas"` repetidos até o `>` que sobra sozinho depois
// deles — esse sim é o fechamento real da tag, não importa o que more dentro
// dos valores dos atributos.
const ATRIBUTOS_ATE_FECHAR = String.raw`(?:\s+[a-zA-Z_:][a-zA-Z0-9_:.-]*="[^"]*")*\s*`;

// ── Números em pt-BR ─────────────────────────────────────────────────────────

/** Espelha `numeroBr` de `lib/agency/comercial/oportunidade.ts` — duplicado de
 *  propósito, não importado: aquela função não é exportada de lá (é interna à
 *  extração de texto solto), e este arquivo não deve depender de detalhe
 *  privado de outro módulo. A REGRA é a mesma: ponto é milhar, vírgula é
 *  decimal — o inverso do en-US. */
function numeroBr(s: string): number | null {
  const limpo = s.replace(/\s/g, "");
  if (!/^\d[\d.,]*$/.test(limpo)) return null;
  const temDecimal = /,\d{1,2}$/.test(limpo);
  const inteiroTxt = temDecimal ? limpo.slice(0, limpo.lastIndexOf(",")) : limpo;
  const decimalTxt = temDecimal ? limpo.slice(limpo.lastIndexOf(",") + 1) : "";
  const inteiro = Number(inteiroTxt.replace(/[.,]/g, ""));
  if (!Number.isFinite(inteiro)) return null;
  const decimal = decimalTxt ? Number(`0.${decimalTxt}`) : 0;
  return Math.round(inteiro + decimal);
}

/**
 * Tira um valor em reais INTEIROS de um texto livre ("R$ 500,00",
 * "R$ 500,00 - R$ 1.000,00", "Aberto", "A combinar"). `null` quando o texto
 * não declara nenhum número — "Aberto" é o caso normal desta plataforma, não
 * um erro de leitura, e vira `null`, nunca `0`.
 *
 * Numa faixa, grava o PISO (o primeiro valor com "R$"): ver o cabeçalho do
 * arquivo.
 */
export function valorEmReaisDoTexto(texto: string | null | undefined): number | null {
  if (!texto) return null;
  const numeros: number[] = [];
  const re = /R\$\s*([\d.,]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto)) !== null) {
    const n = numeroBr(m[1]);
    if (n !== null) numeros.push(n);
  }
  return numeros.length > 0 ? numeros[0] : null;
}

// ── Data de publicação → horas decorridas ────────────────────────────────────

const RE_DATA_PUBLICACAO = /(\d{2})\/(\d{2})\/(\d{4})\s*(?:às|as)?\s*(\d{2}):(\d{2})/i;

/**
 * "03/09/2026 às 08:25" → horas desde essa data até `agora`. `null` quando o
 * texto não bate no formato conhecido — a janela de 24h de `agente.ts` já
 * trata `null` como "não sei, então espero" (`esperandoAJanelaDe24h`); inventar
 * um número aqui seria destravar uma proposta que a plataforma ainda não
 * libera para o plano gratuito.
 *
 * `agora` é injetável de propósito — é o que deixa o teste determinístico sem
 * depender do relógio da máquina que roda a suíte.
 */
export function horasDesdePublicacao(publicadoEm: string | null | undefined, agora: Date = new Date()): number | null {
  if (!publicadoEm) return null;
  const m = RE_DATA_PUBLICACAO.exec(publicadoEm);
  if (!m) return null;
  const [, dia, mes, ano, hora, minuto] = m;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto));
  if (Number.isNaN(data.getTime())) return null;
  const horas = (agora.getTime() - data.getTime()) / 3_600_000;
  return Math.max(0, Math.round(horas * 10) / 10);
}

// ── extrairLinksDaBusca ──────────────────────────────────────────────────────

/**
 * Devolve as URLs absolutas de projeto encontradas na página de busca.
 *
 * `/project/<slug>-<id>` é o único formato aceito — o caractere de classe
 * `[a-z0-9-]+` não inclui `/`, então caminhos aninhados como
 * `/project/message/<slug>-<id>` ou `/project/bid/<slug>-<id>` (ações da
 * página de detalhe, não o projeto em si) já ficam de fora sozinhos. `/project/new`
 * também cai fora sozinho — não termina em `-<dígitos>` — mas a exclusão
 * explícita fica aqui como documentação, não só como acidente de regex.
 */
export function extrairLinksDaBusca(html: string): string[] {
  const vistos = new Set<string>();
  const resultado: string[] = [];
  const re = /href="(\/project\/[^"?#]+)(?:[?#][^"]*)?"/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html ?? "")) !== null) {
    const caminho = m[1];
    if (caminho === "/project/new") continue;
    if (!/^\/project\/[a-z0-9-]+-\d+$/i.test(caminho)) continue;
    const absoluta = `${BASE_URL}${caminho}`;
    if (vistos.has(absoluta)) continue;
    vistos.add(absoluta);
    resultado.push(absoluta);
  }
  return resultado;
}

// ── extrairProjeto ───────────────────────────────────────────────────────────

export interface ProjetoColetado {
  /**
   * O link público do projeto. NÃO está entre os campos extraídos DO html — é
   * o `url` recebido por parâmetro, repassado. `paraProjetoBruto` precisa dele
   * para montar `ProjetoBruto.url`, e a página de detalhe não repete a própria
   * URL em lugar nenhum do corpo de forma confiável (o `<link rel="canonical">`
   * não tem `?fs=t`, por exemplo — outra URL, mesmo projeto).
   */
  url: string;
  titulo: string;
  descricao: string;
  categoria: string | null;
  subcategoria: string | null;
  /** A string EXATAMENTE como está na tela ("R$ 500,00 - R$ 1.000,00", "Aberto"). */
  orcamento: string | null;
  /** Só um número, só quando há valor numérico real. "Aberto" ou textual sem
   *  número → `null`, nunca `0`. Ausência não é informação. */
  orcamentoInformado: number | null;
  nivel: string | null;
  numeroDePropostas: number | null;
  /** Como o texto disser ("03/09/2026 às 08:25") — nunca uma data recalculada. */
  publicadoEm: string | null;
  valorMinimo: number | null;
}

/** Tira o valor de uma linha `<th>rótulo</th><td>...</td>` da tabela de
 *  "Informações adicionais". `null` quando a linha não existe — a tabela é
 *  montada condicionalmente pelo servidor (subcategoria e valor mínimo, por
 *  exemplo, somem quando o projeto não os tem).
 *
 *  O `<td[^>]*>` abaixo usa o padrão ingênuo (para no primeiro `>`, mesmo que
 *  esteja dentro do valor de um atributo) que causou o bug real de corrupção
 *  na descrição do projeto (ver `ATRIBUTOS_ATE_FECHAR` acima). Aqui é seguro
 *  porque foi CONFERIDO contra os dois fixtures reais: os `<td>` desta tabela
 *  não têm atributo nenhum com `>` embutido — na prática, boa parte nem tem
 *  atributo. Se um dia esta tabela ganhar um `<td>` com atributo (`data-*`,
 *  `style`, etc.) que carregue `>` cru no valor, troque para
 *  `<td${ATRIBUTOS_ATE_FECHAR}>` — não reintroduza o bug por economia de
 *  linha. */
function linhaDaTabela(html: string, rotulo: string): string | null {
  const re = new RegExp(`<th>${escaparParaRegex(rotulo)}</th>\\s*<td[^>]*>([\\s\\S]*?)<\\/td>`, "i");
  const m = re.exec(html);
  if (!m) return null;
  const valor = textoDeHtml(m[1]);
  return valor.length > 0 ? valor : null;
}

/**
 * Extrai da página de DETALHE do projeto. Devolve `null` quando a página não
 * parece uma página de projeto de verdade (404, projeto removido, ou
 * qualquer outra página do site, como a própria busca).
 */
export function extrairProjeto(html: string, url: string): ProjetoColetado | null {
  const doc = html ?? "";

  const tituloBruto = /<span class="nomeProjeto">([\s\S]*?)<\/span>/i.exec(doc)?.[1];
  const ehPaginaDeProjeto = /class="box-project-view-container"/.test(doc);
  if (!tituloBruto || !ehPaginaDeProjeto) return null;

  const titulo = textoDeHtml(tituloBruto);
  if (!titulo) return null;

  const RE_DIV_DESCRICAO = new RegExp(
    `<div class="item-text project-description formatted-text"${ATRIBUTOS_ATE_FECHAR}>([\\s\\S]*?)<\\/div>`,
    "i",
  );
  const descricaoBruta = RE_DIV_DESCRICAO.exec(doc)?.[1] ?? "";
  const descricao = textoDeHtml(descricaoBruta);

  const categoria = linhaDaTabela(doc, "Categoria:");
  const subcategoria = linhaDaTabela(doc, "Subcategoria:");
  const orcamento = linhaDaTabela(doc, "Orçamento:");
  const nivel = linhaDaTabela(doc, "Nível de experiência:");

  const propostasTexto = linhaDaTabela(doc, "Propostas:");
  const numeroDePropostas = propostasTexto ? parseNumeroInteiro(propostasTexto) : null;

  const valorMinimoTexto = linhaDaTabela(doc, "Valor Mínimo:");
  const valorMinimo = valorEmReaisDoTexto(valorMinimoTexto);

  const publicadoEmBruto = /<span class="data-hora icon-published"[^>]*>([\s\S]*?)<\/span>/i.exec(doc)?.[1] ?? null;
  const publicadoEm = publicadoEmBruto ? textoDeHtml(publicadoEmBruto) || null : null;

  return {
    url,
    titulo,
    descricao,
    categoria,
    subcategoria,
    orcamento,
    orcamentoInformado: valorEmReaisDoTexto(orcamento),
    nivel,
    numeroDePropostas,
    publicadoEm,
    valorMinimo,
  };
}

function parseNumeroInteiro(texto: string): number | null {
  const digitos = texto.replace(/\D/g, "");
  if (!digitos) return null;
  const n = Number(digitos);
  return Number.isFinite(n) ? n : null;
}

// ── paraProjetoBruto ─────────────────────────────────────────────────────────

/**
 * Monta o que `agente.ts` consome.
 *
 * `custoEmConexoesLidoDaTela` é SEMPRE `null` aqui — a página pública não
 * mostra quanto custa propor; esse número só aparece dentro da conta logada,
 * e login é BLOCK nesta rodada (`navegador.ts`).
 *
 * O `conteudoDeTerceiro` só inclui a linha de categoria/orçamento quando o
 * dado existe. Escrever "Categoria: não informada" pareceria bonito, mas
 * `extrairDeTexto` (`lib/agency/comercial/oportunidade.ts`) lê texto por
 * rótulo — "não informada" viraria um valor de categoria de verdade para
 * quem processar esse texto depois. Omitir a linha é a única forma de a
 * ausência continuar sendo ausência rio abaixo.
 */
export function paraProjetoBruto(p: ProjetoColetado): ProjetoBruto {
  const linhasDeMetadado: string[] = [];
  if (p.categoria) linhasDeMetadado.push(`Categoria: ${p.categoria}`);
  if (p.subcategoria) linhasDeMetadado.push(`Subcategoria: ${p.subcategoria}`);
  if (p.orcamento) linhasDeMetadado.push(`Orçamento: ${p.orcamento}`);

  const conteudoDeTerceiro = [p.titulo, "", p.descricao, "", ...linhasDeMetadado]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    url: p.url,
    conteudoDeTerceiro,
    custoEmConexoesLidoDaTela: null,
    horasDesdeAPublicacao: horasDesdePublicacao(p.publicadoEm),
  };
}
