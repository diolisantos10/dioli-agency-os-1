// ─── COLETAR-99FREELAS — o CHAMADOR da ponta a ponta, sem enviar nada ───────
//
// busca → extrai links → lê cada projeto (com pausa) → agente decide → grava
// (ou só imprime). Nenhum POST no 99Freelas. Nenhum login. O que sai daqui é,
// no máximo, uma linha `Oportunidade` com `status: "nova"` — esperando o CEO
// clicar depois (§51 do portão, `lib/marketplaces/portao.ts`).
//
// ── POR QUE `--redator=cli` EXISTE HOJE (medido em 06/09/2026) ──────────────
// Não há `ANTHROPIC_API_KEY` neste ambiente. `--redator=ia` é o caminho de
// PRODUÇÃO: passa por `lib/ai/generate.ts`, a camada única de IA da casa, com
// dono registrado (`prospeccao-marketplace` em `lib/ai/donos.ts`) e fallback
// entre provedores. `--redator=cli` é o atalho de HOJE — chama `claude -p` via
// `spawn` (nunca `execSync`: precisamos poder aplicar timeout) para não parar
// o piloto por falta de chave. O dia em que uma chave estiver conectada,
// `--redator=ia` é o único caminho que se usa de verdade.
//
// A mesma flag escolhe o JUIZ EDITORIAL também (desde a ficha de 06/09/2026,
// DEFEITO 2): `--redator=cli` monta redator E juiz sobre `claude -p`; só
// `--redator=ia` usa `generate()` para os dois. Antes deste conserto o juiz
// ficava sempre preso a `generate()`, então `--redator=cli` nunca escrevia
// nada — o juiz reprovava por falta de chave antes do redator ter chance.
//
// ── RITMO DE GENTE, NUNCA DE MÁQUINA ─────────────────────────────────────────
// Uma pausa de NO MÍNIMO 3s entre cada requisição HTTP ao 99Freelas, sempre
// SEQUENCIAL — nunca `Promise.all`. É a mesma régua que faltou em 03/08/2026 e
// custou a conta de anúncios da Meta: automação em ritmo de máquina é o que
// dispara moderação. User-Agent de navegador real em toda requisição.
//
// ── A IA É ADVISORY, NUNCA UMA TRAVA QUE DERRUBA O SCRIPT ────────────────────
// Depois de redigida (por qualquer uma das duas fontes), a proposta passa por
// `avaliarAntiGenerico` (a trava que o CEO chamou de INDISPENSÁVEL contra texto
// repetido/genérico) e por `julgarTexto` (o juiz das 8 categorias proibidas por
// conteúdo). Reprovação de QUALQUER um dos dois vira um `{ ok: false, motivo }`
// devolvido a `processarProjeto` — o próprio `agente.ts` já sabe transformar
// isso em desfecho `"parado"`, com o motivo impresso. Nunca uma exceção que
// derruba o script inteiro por causa de UM projeto ruim.
//
// ── O QUE ESTE SCRIPT NÃO FAZ ────────────────────────────────────────────────
// Não decide (isso é `lib/marketplaces/99freelas/agente.ts`, intocado). Não
// inventa uma segunda extração de HTML (isso é `coleta.ts`, de outro
// especialista, usado aqui só pelo contrato combinado). Não clica em nada.
//
// Uso:
//   npx tsx scripts/coletar-99freelas.mts --redator=cli
//   npx tsx scripts/coletar-99freelas.mts --redator=ia --limite 5 --gravar --workspace ws-123
//
// ── POR QUE `import "dotenv/config"` É A PRIMEIRA LINHA (medido em 06/09/2026) ──
// O Next carrega o `.env` sozinho; um script `tsx` avulso, não. Sem isto,
// `lib/db/client.ts` caía no fallback `file:./prisma/dev.db` — um banco
// vazio — e `conexoesGastasNoMes` lia "tabela não existe" e fechava a porta
// por fail-closed (240 de 240 conexões "gastas"), em silêncio: a mensagem
// dizia "cota estourada", nunca "li o banco errado". Ver
// `docs/celula-prospeccao/despachos/2026-09-06-consertos-do-chamador.md`,
// DEFEITO 1. Precisa vir ANTES de `@/lib/db/client` para valer.
import "dotenv/config";

import path from "node:path";
import { prisma } from "@/lib/db/client";
import {
  extrairLinksDaBusca,
  extrairProjeto,
  paraProjetoBruto,
  type ProjetoColetado,
} from "@/lib/marketplaces/99freelas/coleta";
import { rodada, type ProjetoBruto, type Candidatura } from "@/lib/marketplaces/99freelas/agente";
import { gravarCandidatura } from "@/lib/marketplaces/99freelas/gravar-candidatura";
import { conexoesGastasNoMes } from "@/lib/marketplaces/99freelas/contador";
import {
  construirRedator,
  recusarSeContadorNaoConfiavel,
} from "@/lib/marketplaces/99freelas/redator";

// ── A DONDE ISTO BUSCA ───────────────────────────────────────────────────────
//
// Confirmado contra `__tests__/fixtures/99freelas/busca-2026-09-06.html`
// (06/09/2026): o og:title do fixture é "Projetos e Trabalhos para
// Profissionais Freelancers | 99Freelas" — a listagem GERAL, não uma busca com
// filtro — e os 11 links `/project/<slug>-<id>?fs=t` que ele carrega são
// exatamente do formato que `extrairLinksDaBusca` precisa devolver. Não há
// `<link rel="canonical">` nem comentário de captura no arquivo dizendo a URL
// exata; esta é a leitura mais direta da evidência disponível — sinalizado no
// relatório para quem despachou conferir contra a captura original.
const BASE_URL = "https://www.99freelas.com.br";
const URL_BUSCA = `${BASE_URL}/projects`;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

/** Nunca menos que isto entre duas requisições HTTP ao 99Freelas. */
const PAUSA_MINIMA_MS = 3_000;

// ── Flags ─────────────────────────────────────────────────────────────────

interface Flags {
  limite: number;
  gravar: boolean;
  redator: "ia" | "cli";
  workspaceId: string | null;
}

function lerFlags(argv: string[]): Flags {
  let limite = 3;
  let gravar = false;
  let redator: "ia" | "cli" | null = null;
  let workspaceId: string | null = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--limite") {
      const v = Number(argv[++i]);
      if (Number.isInteger(v) && v > 0) limite = v;
    } else if (arg === "--gravar") {
      gravar = true;
    } else if (arg === "--dry-run") {
      gravar = false; // já é o padrão — aceito explicitamente por clareza de uso
    } else if (arg.startsWith("--redator=")) {
      const v = arg.slice("--redator=".length);
      if (v === "ia" || v === "cli") redator = v;
    } else if (arg === "--workspace") {
      workspaceId = argv[++i] ?? null;
    }
  }

  if (!redator) {
    console.error('⛔ Falta escolher o redator: use "--redator=ia" (produção) ou "--redator=cli" (hoje, sem chave).');
    process.exit(1);
  }
  if (gravar && !workspaceId) {
    console.error('⛔ "--gravar" exige "--workspace <id>" — sem isso não há dono para a linha em Oportunidade.');
    process.exit(1);
  }

  return { limite, gravar, redator, workspaceId: workspaceId ?? "ws-99freelas-dry-run" };
}

// ── HTTP, sempre em ritmo de gente ───────────────────────────────────────────

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function buscarHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      Accept: "text/html,application/xhtml+xml",
    },
  });
  if (!res.ok) throw new Error(`GET ${url} → HTTP ${res.status}`);
  return await res.text();
}

function resolverUrl(link: string): string {
  try {
    return new URL(link, BASE_URL).toString();
  } catch {
    return link;
  }
}

// ── main ──────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const flags = lerFlags(process.argv.slice(2));
  console.log(`Modo: ${flags.gravar ? "GRAVANDO no banco" : "DRY-RUN (só imprime, nada é gravado)"} · redator=${flags.redator} · limite=${flags.limite}`);

  console.log(`\nBuscando projetos em ${URL_BUSCA} ...`);
  const htmlDaBusca = await buscarHtml(URL_BUSCA);
  const links = extrairLinksDaBusca(htmlDaBusca).map(resolverUrl);
  console.log(`${links.length} link(s) de projeto encontrados na busca.`);

  const alvos = links.slice(0, flags.limite);
  if (alvos.length === 0) {
    console.log("Nenhum link para processar. Fim.");
    return;
  }

  const brutos: ProjetoBruto[] = [];
  const coletadoPorUrl = new Map<string, ProjetoColetado>();

  for (let i = 0; i < alvos.length; i++) {
    // Pausa ANTES de cada requisição de detalhe — inclusive a primeira, que
    // vem depois da busca: nunca duas requisições ao 99Freelas em sequência
    // sem intervalo, nem a primeira do lote.
    console.log(`  aguardando ${PAUSA_MINIMA_MS}ms (ritmo de gente, nunca de máquina)...`);
    await esperar(PAUSA_MINIMA_MS);

    const url = alvos[i];
    console.log(`Lendo projeto ${i + 1}/${alvos.length}: ${url}`);
    let html: string;
    try {
      html = await buscarHtml(url);
    } catch (e) {
      console.log(`  ⚠️ falhou ao buscar ${url}: ${e instanceof Error ? e.message : e} — pulando.`);
      continue;
    }
    const projeto = extrairProjeto(html, url);
    if (!projeto) {
      console.log(`  ⚠️ não deu para extrair o projeto de ${url} — pulando.`);
      continue;
    }
    const bruto = paraProjetoBruto(projeto);
    brutos.push(bruto);
    coletadoPorUrl.set(bruto.url, projeto);
  }

  if (brutos.length === 0) {
    console.log("\nNenhum projeto extraído com sucesso. Nada para o agente decidir.");
    return;
  }

  console.log(`\n${brutos.length} projeto(s) prontos para o agente. Lendo o saldo de conexões do mês...`);
  const saldo = await conexoesGastasNoMes({ workspaceId: flags.workspaceId! });
  const decisaoDoContador = recusarSeContadorNaoConfiavel(saldo);
  if (decisaoDoContador.recusar) {
    // Contador não confiável NUNCA vira decisão silenciosa (DEFEITO 1). Sem
    // isto, o script seguiria com `saldo.gastas` == a cota inteira (o pior
    // caso do fail-closed) e recusaria todo projeto por "cota estourada" —
    // uma mensagem que mentiria sobre a causa real.
    console.error(decisaoDoContador.mensagem);
    process.exitCode = 1;
    return;
  }

  const redigirProposta = construirRedator(flags.redator);
  const resultados: Candidatura[] = await rodada(brutos, {
    workspaceId: flags.workspaceId!,
    conexoesGastasNoMes: saldo.gastas,
    redigirProposta,
  });

  console.log(`\n── ${resultados.length} candidatura(s) processada(s) ──────────────────────\n`);

  for (const candidatura of resultados) {
    const coletado = coletadoPorUrl.get(candidatura.url);
    console.log(`• [${candidatura.desfecho}] ${candidatura.titulo}`);
    console.log(`  ${candidatura.url}`);
    console.log(`  ${candidatura.motivo}`);

    if (!coletado) {
      console.log(`  ⚠️ não achei o ProjetoColetado correspondente a esta URL — não gravado.`);
      continue;
    }

    if (flags.gravar) {
      const r = await gravarCandidatura({ workspaceId: flags.workspaceId!, coletado, candidatura }, prisma);
      console.log(`  ${r.criada ? "GRAVADO (nova linha)" : "ATUALIZADO (já existia)"}: Oportunidade ${r.id}, status sempre "nova".`);
    } else {
      console.log("  [dry-run] nada foi gravado. Candidatura completa:");
      console.log(JSON.stringify(candidatura, null, 2).replace(/^/gm, "    "));
    }
    console.log("");
  }
}

// Guarda de execução: só dispara `main()` (busca HTTP real, banco real) quando
// este arquivo é o PONTO DE ENTRADA do processo. Um teste que IMPORTA as
// funções puras de `lib/marketplaces/99freelas/redator.ts`
// (`recusarSeContadorNaoConfiavel`, `construirPortaDoJuiz`) nem passa por
// aqui — mesmo padrão já usado em `scripts/distancia-do-deploy.mts` e
// `scripts/backup-antes-da-migration.mjs`.
const executadoDireto = process.argv[1] && import.meta.url === `file://${path.resolve(process.argv[1])}`;

if (executadoDireto) {
  main()
    .catch((e) => {
      console.error("Falha ao rodar a coleta:", e instanceof Error ? e.stack ?? e.message : e);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect().catch(() => {});
    });
}
