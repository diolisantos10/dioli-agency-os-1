// O CONTRATO DE MARCA — a régua que chega a QUEM PRODUZ, antes de produzir.
//
// ── Por que este arquivo existe (09/08/2026) ────────────────────────────────
//
// Medido neste dia, contra o código em produção: do cérebro de marca, o
// produtor recebia **três coisas** — público-alvo, tom, e um sim/não de "tem
// material de marca" (`run-execution.ts`, montagem do `Ctx`). Todo o resto do
// que a casa sabe sobre a marca ficava guardado e não chegava.
//
// A constituição do `branding` (dioli-brain-kit, doutrina 23) nomeia esse
// defeito e dá o remédio:
//
//   > "Campo que ninguém lê é decoração. O desenho tem que dizer como a regra
//   >  CHEGA A QUEM PRODUZ, não apenas onde ela fica guardada."
//
// E dá também a forma: **um contrato de no máximo UMA TELA**, entregue antes da
// execução. O limite não é estético — é o que impede o contrato de crescer até
// ninguém ler. O próprio Conselho listou "o contrato cresce até ninguém ler"
// como risco, e avisou que o limite de uma tela "será a primeira coisa violada
// 'só desta vez'". Por isso o teto aqui é código, não recomendação.
//
// ── O QUE ESTE ARQUIVO NÃO FAZ ──────────────────────────────────────────────
//
//   • **Não julga peça.** Julgar é do portão; isto é a régua ANTES do trabalho.
//   • **Não inventa regra.** Campo vazio vira LACUNA NOMEADA, nunca um valor
//     plausível. Ausência de informação não é informação.
//   • **Não escreve nada.** Só lê. É a mesma trava do agente `branding`.
//
// ── AS PROIBIÇÕES JÁ FUNCIONAVAM ───────────────────────────────────────────
//
// Registrado porque eu mesmo errei isto em 09/08 e quase repeti o erro da
// auditoria de 08/08: as proibições do cliente **existem e já chegam ao
// produtor** (`lerProibicoes`, guardadas em `BrainArtifact`). Elas não estão em
// `BrandBrain`, e é por isso que quem olha só as colunas conclui que não
// existem. Este contrato as REÚNE com o resto — não as substitui.

import { createHash } from "node:crypto";
import { lerFichaDeMarca, type CampoNaFicha } from "@/lib/agency/esteira/ficha-de-marca";
import { lerProibicoes } from "@/lib/agency/esteira/proibicoes";
import { instrucaoGemea } from "@/lib/agency/execution/piso-de-verdade";
import { materiaisDeMarca } from "@/lib/agency/esteira/material-do-drive";

/** Teto do contrato, em caracteres. ~Uma tela de celular lida sem rolar duas
 *  vezes. Passou disto, o excedente é CORTADO E DECLARADO — nunca truncado em
 *  silêncio, porque corte silencioso vira "a regra não existia". */
export const TETO_DO_CONTRATO = 1800;

export interface ContratoDeMarca {
  /** O texto que vai para quem produz. Nunca passa de `TETO_DO_CONTRATO`. */
  texto: string;
  /** Identidade do conteúdo deste contrato. É o `marca_versao` que o artefato
   *  carrega — o que permite, depois, saber com qual régua a peça foi feita.
   *  Derivado do CONTEÚDO, não do relógio: mesmo conteúdo, mesma versão. */
  marcaVersao: string;
  /** O que a marca ainda não declarou. Nomeado, um por linha, para virar
   *  pergunta ao dono — nunca preenchido por inferência. */
  lacunas: string[];
  /** O que não coube no teto. Vazio quando coube tudo. */
  cortado: string[];
  /** `true` quando a marca não tem nenhuma regra registrada. É o estado
   *  `marca_nao_constituida` da constituição: legítimo, declarado, e não
   *  autoriza ninguém a julgar peça por identidade. */
  naoConstituida: boolean;
}

/**
 * Monta o contrato de marca de um cliente.
 *
 * Nunca lança: falha de leitura vira lacuna declarada, porque produção parada
 * por causa do contrato é pior do que produção avisada de que a régua faltou.
 */
export async function contratoDeMarca(clientId: string | null | undefined): Promise<ContratoDeMarca> {
  if (!clientId) {
    return {
      texto: "SEM CLIENTE — não há marca para obedecer nesta peça.",
      marcaVersao: versaoDe("sem-cliente"),
      lacunas: [],
      cortado: [],
      naoConstituida: true,
    };
  }

  const [ficha, materiais, proibicoes] = await Promise.all([
    lerFichaDeMarca(clientId),
    materiaisDeMarca(clientId).catch(() => []),
    // A régua lê a lista INTEIRA, não o resumo da ficha. A ficha encurta para
    // caber na tela de quem olha; proibição encurtada em silêncio vira regra
    // que sumiu — e quem produz obedece o pedaço e inventa o resto.
    lerProibicoes(clientId).catch(() => ({ lidas: false, itens: [] })),
  ]);

  const lacunas: string[] = [];
  const partes: string[] = [];
  const cortado: string[] = [];

  const definido = (campo: string): CampoNaFicha | undefined =>
    ficha.campos.find((c) => c.campo === campo && c.estado === "definido");

  // ── 1. QUEM É, e COM QUEM FALA ───────────────────────────────────────────
  const identidade = [
    definido("proposito_e_promessa") && `Promessa: ${definido("proposito_e_promessa")!.valor}`,
    definido("publico_e_relacao") && `Fala com: ${definido("publico_e_relacao")!.valor}`,
  ].filter(Boolean) as string[];
  if (identidade.length > 0) partes.push(`QUEM É\n${identidade.join("\n")}`);

  // ── 2. O QUE NUNCA FAZER ─────────────────────────────────────────────────
  // Logo depois da identidade, de propósito: é o único bloco que permite
  // reprovar, e é o que o cliente já disse em voz alta.
  //
  // ── E CADA "NUNCA" VEM COM A INSTRUÇÃO GÊMEA (24/08/2026) ────────────────
  // Proibição sozinha engessa a marca. Lendo só "não use 'imperdível'", o
  // produtor tem duas saídas e as duas são ruins: repetir a palavra (e ser
  // barrado) ou **cortar o assunto da peça** — e aí é reprovado por obedecer.
  // Esta casa já viu isso acontecer.
  //
  // `instrucaoGemea` é a MESMA redação que o piso usa no motivo da violação, e
  // ela carrega fonte e data: regra de marca sem procedência não é auditável, e
  // trava que não se explica é desligada na primeira semana.
  const linhas = (proibicoes.itens ?? []).filter((i) => i?.frase).map(instrucaoGemea);
  if (linhas.length > 0) partes.push(`NUNCA\n${linhas.map((f) => `— ${f}`).join("\n")}`);

  const limites = definido("limites_de_promessa");
  if (limites) partes.push(`NÃO AFIRMAR, mesmo sendo verdade\n${limites.valor}`);

  // ── 3. COMO SE FALA ──────────────────────────────────────────────────────
  // Pares de exemplo, nunca adjetivo: "tom natural e direto" não é verificável
  // por ninguém, e por isso não vira régua.
  const voz = definido("voz");
  if (voz) partes.push(`COMO FALAMOS\n${voz.valor}`);
  const lex = definido("lexico");
  if (lex) partes.push(`PALAVRAS\n${lex.valor}`);

  // ── 4. COM O QUE SE PARECE ───────────────────────────────────────────────
  const forma = definido("atributos_formais");
  if (forma) partes.push(`FORMA\n${forma.valor}`);
  const refs = definido("referencias");
  if (refs) partes.push(`REFERÊNCIAS\n${refs.valor}`);

  const logo = materiais.find((m) => m.papel === "logo");
  const referenciasDeArquivo = materiais.filter((m) => m.papel === "referencia");
  const material: string[] = [];
  if (logo) material.push(`logo: ${logo.nome}`);
  else lacunas.push("arquivo de logo");
  if (referenciasDeArquivo.length > 0) {
    material.push(`arquivos de referência: ${referenciasDeArquivo.map((r) => r.nome).slice(0, 3).join(", ")}`);
  }
  if (material.length > 0) partes.push(`MATERIAL\n${material.join("\n")}`);

  // ── 5. O QUE A MARCA AINDA NÃO DECIDIU ───────────────────────────────────
  // Vai DENTRO do contrato, não num relatório à parte: quem produz precisa
  // saber que ali não há régua — senão preenche com o próprio gosto e ninguém
  // fica sabendo.
  lacunas.push(...ficha.lacunas.map((c) => c.rotulo.toLowerCase()));
  if (lacunas.length > 0) {
    partes.push(
      `AINDA NÃO DECIDIDO (${lacunas.length})\n` +
        lacunas.map((l) => `— ${l}`).join("\n") +
        `\nNão invente estes. Se a peça depender de um deles, diga que dependeu.`,
    );
  }

  const naoConstituida = ficha.naoConstituida;
  if (naoConstituida) {
    partes.unshift(
      "MARCA NÃO CONSTITUÍDA — esta marca ainda não declarou regra suficiente.\n" +
        "Produza com o que o briefing disser e NÃO afirme nada sobre a marca que\n" +
        "não esteja escrito nele.",
    );
  }

  // ── O TETO, aplicado por bloco inteiro ───────────────────────────────────
  // Cortar no meio de um bloco entregaria meia regra, que é pior que nenhuma:
  // quem lê "NUNCA — não cite conc" obedece o pedaço e inventa o resto.
  const mantidos: string[] = [];
  let tamanho = 0;
  for (const bloco of partes) {
    const custo = bloco.length + 2;
    if (tamanho + custo > TETO_DO_CONTRATO) {
      cortado.push(bloco.split("\n")[0] ?? "bloco");
      continue;
    }
    mantidos.push(bloco);
    tamanho += custo;
  }
  if (cortado.length > 0) {
    const aviso = `(${cortado.length} bloco(s) não couberam: ${cortado.join(", ")})`;
    if (tamanho + aviso.length + 2 <= TETO_DO_CONTRATO) mantidos.push(aviso);
  }

  const texto = mantidos.join("\n\n");
  return { texto, marcaVersao: versaoDe(texto), lacunas, cortado, naoConstituida };
}

/** A versão é do CONTEÚDO: mesma régua, mesma versão, em qualquer máquina e em
 *  qualquer dia. Derivar do relógio faria duas peças idênticas parecerem feitas
 *  sob réguas diferentes. */
export function versaoDe(texto: string): string {
  return `mv_${createHash("sha256").update(texto).digest("hex").slice(0, 10)}`;
}

// ─── O PORTÃO DE MARCA NA ENTREGA — 15/08/2026 ──────────────────────────────
//
// Ordem do CEO: *"o portão que RECUSA entregar peça de marca não constituída.
// Portão, não recomendação: marca sem régua, peça não sai."*
//
// ── O QUE JÁ EXISTIA, E ONDE ESTAVA O BURACO ────────────────────────────────
//
// Desde 09/08 existe um portão de marca em `publicacao.ts:703` — mas ele guarda
// UMA porta: a publicação no Instagram. A outra porta pela qual a peça chega ao
// cliente é `escadaFiltraEntregas`, o ponto em que uma entrega vira
// `visibility: "compartilhado"` e aparece no portal. Essa porta não perguntava
// nada sobre marca. Medido em 15/08: nenhum dos quatro chamadores da escada
// (`marcos.ts`, `mes.ts`, `producao-de-pedido.ts`, `escada/repescagem.ts`)
// consultava `contratoDeMarca`.
//
// Portão numa porta só não é portão — é a "rota alternativa para entregar
// contornando o portão" que o próprio Conselho listou como condição de tudo.
//
// ── POR QUE A DEFINIÇÃO MORA AQUI ───────────────────────────────────────────
//
// "Marca constituída" NÃO é redefinida neste arquivo. Ela já tem um dono único:
// `lerFichaDeMarca` (`ficha-de-marca.ts:456-489`) — cinco campos exigidos
// (promessa, público, voz, léxico, hierarquia/dono), no mínimo 3 proibições
// vigentes e no mínimo 2 referências (uma que É a cara da marca e uma que NÃO
// é). Uma segunda conta para a mesma pergunta é como a tela mostrou 22% com a
// porta fechada e ninguém entendeu por quê (`ficha-de-marca.ts:459`).
//
// O que mora aqui é o VEREDITO e a FRASE — para que as duas portas recusem pelo
// mesmo critério e digam a mesma coisa a quem for consertar.

/**
 * Os departamentos cuja entrega É peça de marca.
 *
 * ── POR QUE NÃO É "TODA ENTREGA", e isso não é afrouxamento ────────────────
 *
 * Peça de marca é o que sai com a identidade do cliente para o mundo ver: arte,
 * post, criativo. São os dois departamentos que o próprio CEO nomeou como
 * "peça" ao soltar a escada em 08/08 (`docs/pendencias.md`, "o que NÃO foi
 * solto": relatório, plano e proposta **não são peça**).
 *
 * Um diagnóstico de estratégia ou um relatório de números não carrega a
 * identidade do cliente para o público — e barrar a agência inteira porque o
 * cliente ainda não respondeu 5 perguntas da ficha pararia a casa no dia 1, que
 * é exatamente o defeito que a semeadura da escada existe para evitar
 * (`escada/registro.ts:37`).
 *
 * ⚠️ Nada aqui afrouxa a outra porta: `publicacao.ts` continua barrando TODO
 * post agendado de marca não constituída, de qualquer departamento.
 */
export const DEPARTAMENTOS_DE_PECA_DE_MARCA: ReadonlySet<string> = new Set([
  "design",
  "social-media",
]);

export function ehPecaDeMarca(departmentId: string | null | undefined): boolean {
  return !!departmentId && DEPARTAMENTOS_DE_PECA_DE_MARCA.has(departmentId);
}

export interface VeredictoDoPortaoDeMarca {
  /** `true` = a peça pode chegar ao cliente. */
  pode: boolean;
  /** Em português, dizendo O QUE FAZER. Vazio quando `pode`. */
  motivo: string;
}

/** A frase única da recusa. Diz o conserto, não só o defeito — recusa que não
 *  diz o que fazer vira ruído que ninguém age. */
export const MOTIVO_MARCA_NAO_CONSTITUIDA =
  "marca não constituída: este cliente não declarou régua de marca suficiente " +
  "(faltam campos da ficha, proibições ou referências). Entregar peça em nome " +
  "dele agora é a agência escolhendo a marca por ele. Preencha a ficha de marca " +
  "e a peça sai sozinha na próxima passada.";

/**
 * Esta marca pode receber peça?
 *
 * **FAIL-CLOSED.** Não conseguir LER a régua não vira permissão — é a mesma lei
 * do "sem gate = reprovado". Sem `clientId` também recusa: peça de marca sem
 * cliente dono não tem marca que a autorize.
 *
 * Não julga a peça. Pergunta uma coisa só, e é a mais básica: **esta marca
 * chegou a declarar alguma regra?** Julgar identidade é do agente `branding`, e
 * ele não pode fazê-lo sem régua registrada.
 */
export async function portaoDeMarca(
  clientId: string | null | undefined,
): Promise<VeredictoDoPortaoDeMarca> {
  if (!clientId) {
    return { pode: false, motivo: "entrega sem cliente dono — não há marca que autorize esta peça" };
  }
  const contrato = await contratoDeMarca(clientId).catch(() => null);
  if (!contrato) {
    return {
      pode: false,
      motivo:
        "não consegui ler a régua de marca deste cliente — não entrego peça sem " +
        "saber por qual régua ela foi feita",
    };
  }
  if (contrato.naoConstituida) return { pode: false, motivo: MOTIVO_MARCA_NAO_CONSTITUIDA };
  return { pode: true, motivo: "" };
}
