// A CORRENTE DO STORY, DE PONTA A PONTA, PELAS PORTAS DE VERDADE.
//
// ═══════════════════════════════════════════════════════════════════════════
// A REGRA QUE ESTE ARQUIVO OBEDECE
// ═══════════════════════════════════════════════════════════════════════════
//
// O contrato de aceite da Operação Salvaguarda tem uma condição de reprovação
// escrita com todas as letras: **"teste que chama função interna e ignora a
// porta real do portal REPROVA a entrega"**.
//
// Então aqui não se escreve `SocialPost` na mão e não se chama a orquestradora
// por dentro. O que este arquivo faz é bater nas MESMAS portas que o navegador
// do cliente bate:
//
//   POST /api/portal/pedidos             → o cliente pede
//   POST /api/portal/pedidos/orcamento   → o cliente aceita o orçamento
//   POST /api/admin/pagamentos           → o pagamento, pelo caminho legítimo
//   GET  /api/media/[id]                 → o cliente vê a imagem
//   POST /api/portal/approvals           → aprova, ajusta ou recusa
//   GET  /api/social-posts/[id]/download → o cliente baixa o arquivo
//
// E contra um BANCO DE VERDADE (SQLite, tabelas reais, chaves reais), com o
// CHROMIUM DE VERDADE rasterizando o molde e o `sharp` DE VERDADE medindo os
// pixels do arquivo que saiu.
//
// ═══════════════════════════════════════════════════════════════════════════
// O QUE É DUBLADO, E POR QUE SÓ ISSO
// ═══════════════════════════════════════════════════════════════════════════
//
// Duas chamadas PAGAS a provedores externos, e nada mais:
//
//   • o gerador de texto — o que está sob teste é o TRANSPORTE, não a redação
//     do modelo (mesma razão declarada em `esteira/jornada-real.test.ts`). Isto
//     inclui a OPINIÃO do juiz de Qualidade, que é uma chamada paga como as
//     outras. **A metade determinística do juiz NÃO é dublada** e é ela que
//     reprova a peça no teste da Qualidade abaixo — sem consultar modelo
//     nenhum. O terceiro estado (sem árbitro) também é exercitado de verdade,
//     derrubando o provedor;
//   • o gerador de imagem — devolve uma foto sintética REAL, com estrutura
//     suficiente para passar no portão do fundo de verdade. Um dublê chapado
//     seria barrado por ele, e corretamente.
//
// **Nenhuma trava é dublada.** Contrato de saída, piso de verdade, juiz da
// qualidade, escada de exposição, portão de pagamento, gatilho do orçamento,
// direção fotografável, portão do fundo, trava de texto na arte, CSRF e a
// conferência do arquivo final rodam todos de verdade. Dublar uma trava faria
// este arquivo concordar com um defeito.
//
// A sessão da agência é dublada PARCIALMENTE (só `getSession`) porque este
// processo não tem navegador logado. `isAgencyRole` — a régua de permissão —
// continua sendo a real.

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { NextRequest } from "next/server";
import { execSync } from "node:child_process";
import { existsSync, rmSync, mkdirSync, writeFileSync } from "node:fs";

/**
 * ONDE A EVIDÊNCIA VISUAL FICA.
 *
 * Os arquivos que a corrente produziu são copiados para cá na primeira rodada,
 * para que uma pessoa possa ABRIR a peça e olhar. É evidência produzida PELA
 * corrente construída — não montada à mão por fora dela, que o contrato de
 * aceite reprova.
 *
 * `EVIDENCIA_STORY_V1=1 npx vitest run __tests__/produtos/...` liga a cópia.
 * Sem a variável, nada é escrito: a suíte de todo dia não suja o repositório.
 */
const PASTA_DE_EVIDENCIA = `${process.cwd()}/.evidencia-story-v1`;
const GUARDAR_EVIDENCIA = process.env.EVIDENCIA_STORY_V1 === "1";

// O caminho do banco tem de estar no ambiente ANTES de qualquer import ser
// avaliado — o cliente Prisma lê DATABASE_URL na criação.
const DB_PATH = vi.hoisted(() => {
  const caminho = `${process.cwd()}/prisma/story-v1-e2e.db`;
  process.env.DATABASE_URL = `file:${caminho}`;
  // O armazenamento de mídia desta rodada, isolado do disco de desenvolvimento.
  // `raizDaMidia()` deriva deste caminho — é o mesmo que produção usa.
  process.env.RAILWAY_VOLUME_MOUNT_PATH = `${process.cwd()}/.tmp-story-v1-e2e-midia`;
  return caminho;
});

// ── O TEXTO DO ESPECIALISTA ─────────────────────────────────────────────────
//
// Quatro peças, porque o item de tabela cobre quatro. `headline` é o título que
// vira pixel; `note` é o texto da peça; `direction` é o que a IMAGEM mostra, e
// nunca vira letra.
//
// Cada `direction` nomeia SUJEITO, LUGAR e LUZ porque o portão da direção
// fotografável (`design/direcao-fotografavel.ts`) exige os três — e ele roda de
// verdade nesta suíte. Uma direção vaga aqui pararia a peça antes de gastar
// imagem, que é exatamente o que ele deve fazer.
//
// Nenhum preço, telefone ou data — e nenhuma AFIRMAÇÃO DE PRAZO. As duas
// travas rodam de verdade: o piso de verdade sobre o texto, e a trava de texto
// na arte (`design/trava-de-texto.ts`), que barra prazo virando pixel porque
// pixel não passa pelo piso. Uma legenda com "hoje... amanhã" sai da peça sem
// título — o teste abaixo prova que isso NÃO acontece no caso normal.
const QUATRO_STORIES = {
  title: "Stories — Padaria da Esquina",
  summary: "Quatro stories verticais sobre a fermentação natural.",
  items: [
    { headline: "O pão que descansa a noite toda", direction: "as mãos do padeiro virando a massa na bancada da padaria, luz de janela pela manhã", palette: "âmbar e marrom", note: "A massa descansa antes de virar pão." },
    { headline: "A casca que estala", direction: "o padeiro partindo o pão ao meio sobre o balcão da padaria, luz de lâmpada quente", palette: "dourado e preto", note: "Quando a casca estala, o miolo está no ponto." },
    { headline: "Quem acorda antes de você", direction: "o padeiro abrindo o forno na cozinha da padaria na madrugada, penumbra e contraluz", palette: "laranja e azul noite", note: "A padaria acende as luzes quando a rua ainda está escura." },
    { headline: "Farinha boa não é a mais branca", direction: "as mãos do padeiro peneirando farinha na bancada da cozinha, luz natural de janela", palette: "bege e cinza", note: "Farinha boa é a que fermenta sem pressa." },
  ],
};

/**
 * ── O QUE O ESPECIALISTA DEVOLVE QUANDO O CLIENTE PEDE AJUSTE ──────────────
 *
 * O gerador de texto é dublado (é chamada paga; o que está sob teste é o
 * TRANSPORTE, não a redação do modelo). Mas um dublê que devolve o MESMO texto
 * numa refação não é um dublê fiel: ele encena um modelo que ignorou o cliente.
 * Com ele, a imagem refeita sairia byte a byte idêntica — e o teste do ajuste
 * ficaria verde sobre um ajuste que não ajustou.
 *
 * Este dublê faz o que o modelo real faz com "a terceira está escura demais,
 * quero ela mais clara": reescreve a TERCEIRA (título, texto e direção de arte,
 * agora com luz) e **preserva as outras três palavra por palavra** — que é o
 * que o prompt da refação manda fazer.
 *
 * O que continua não dublado, e é o que está sob teste: QUAL peça recebe
 * imagem nova. Isso é decisão da casa (`mira-da-peca.ts`), não do modelo — o
 * dublê devolve as quatro, como um modelo devolveria.
 */
const QUATRO_STORIES_COM_A_TERCEIRA_MAIS_CLARA = {
  ...QUATRO_STORIES,
  items: QUATRO_STORIES.items.map((it, i) =>
    i === 2
      ? {
          headline: "A padaria acende antes do sol",
          direction: "o padeiro abrindo o forno na cozinha da padaria ao amanhecer, luz clara de manhã entrando pela janela",
          palette: "creme e dourado claro",
          note: "Quando o bairro acorda, o primeiro pão já saiu do forno.",
        }
      : it,
  ),
};

/**
 * A MESMA peça, com uma afirmação que NADA sustenta.
 *
 * "a melhor padaria da cidade" é superlativo não sustentável — a classe que
 * `conferirReguaDoTexto` (dentro de `auditDeliverable`) reprova em CÓDIGO,
 * antes de consultar qualquer modelo. É a reprovação de Qualidade mais honesta
 * que existe para provar em teste: nenhum dublê pode "convencê-la".
 */
const PECA_COM_SUPERLATIVO = {
  ...{ title: "Stories — Padaria da Esquina", summary: "Quatro stories verticais." },
  items: [
    { headline: "A melhor padaria da cidade", direction: "as mãos do padeiro virando a massa na bancada da padaria, luz de janela pela manhã", palette: "âmbar", note: "Somos a melhor padaria da cidade, líder de mercado no bairro." },
    { headline: "A casca que estala", direction: "o padeiro partindo o pão ao meio sobre o balcão da padaria, luz de lâmpada quente", palette: "dourado", note: "Somos a melhor padaria da cidade, líder de mercado no bairro." },
    { headline: "Quem acorda antes de você", direction: "o padeiro abrindo o forno na cozinha da padaria na madrugada, penumbra e contraluz", palette: "laranja", note: "Somos a melhor padaria da cidade, líder de mercado no bairro." },
    { headline: "Farinha boa", direction: "as mãos do padeiro peneirando farinha na bancada da cozinha, luz natural de janela", palette: "bege", note: "Somos a melhor padaria da cidade, líder de mercado no bairro." },
  ],
};

const CLASSIFICACAO_DE_STORY = {
  atendimentoId: "story-instagram",
  confianca: 95,
  motivo: "o cliente pediu stories verticais para o Instagram, com todas as letras",
};

/** O que a Qualidade responde. Aprovado — o laço de correção do juiz tem teste
 *  próprio, e não é o objeto deste arquivo. */
const PARECER_APROVADO = { verdict: "aprovado", issues: [], note: "peça no tom da marca" };

/**
 * O ROTEIRO DA RODADA — o que os provedores PAGOS respondem nesta prova.
 *
 * Dirigível de propósito. Um dublê que responde sempre a mesma coisa só
 * consegue provar o caminho feliz, e o caminho feliz é justamente o que não
 * precisa de prova.
 *
 * ⚠️ O QUE ESTÁ SENDO DUBLADO É O PROVEDOR, NÃO O JUIZ. `auditDeliverable`
 * roda INTEIRA e de verdade: a régua determinística de texto
 * (`conferirReguaDoTexto`), a escolha do árbitro independente do autor, o mapa
 * veredito → `revisionStatus` e os TRÊS estados (aprovado / reprovado / sem
 * árbitro). O que o roteiro decide é só a opinião do modelo — e a reprovação
 * mais importante desta suíte (`peca` = PECA_COM_SUPERLATIVO) nem chega a
 * consultar modelo nenhum: ela é barrada pela régua de código, antes de
 * qualquer chamada.
 */
const roteiro = vi.hoisted(() => ({
  /** O que o especialista devolve. */
  peca: "boa" as "boa" | "superlativo",
  /** O provedor do JUIZ responde, ou cai? Cair = "sem árbitro", que NUNCA é
   *  aprovação. */
  juizResponde: true,
}));

// A mesma função `generate` atende a triagem, a produção e o juiz na esteira
// real, e aqui também: o dublê distingue pelo conteúdo do prompt, em vez de
// manter dois.
vi.mock("@/lib/ai/generate", () => ({
  generate: vi.fn(async (p: { system?: string; user?: string }) => {
    const texto = `${p.system ?? ""}\n${p.user ?? ""}`;
    if (/atendimentoId/.test(texto)) return { ok: true, data: CLASSIFICACAO_DE_STORY };
    if (/agente de Qualidade/i.test(texto)) {
      // O provedor do juiz CAIU. `auditDeliverable` devolve `nao_auditado` —
      // um estado próprio, que a casa declara e que não vale como aprovação.
      if (!roteiro.juizResponde) return { ok: false, error: "provedor do árbitro indisponível" };
      return { ok: true, data: PARECER_APROVADO };
    }
    // A REFAÇÃO. O marcador é a frase que só o prompt de ajuste escreve
    // (`esteira/refacao.ts`) — o dublê responde ao PEDIDO, não a um interruptor
    // escondido no teste.
    if (/O QUE O CLIENTE PEDIU, com as palavras dele/.test(texto)) {
      return { ok: true, data: QUATRO_STORIES_COM_A_TERCEIRA_MAIS_CLARA };
    }
    return { ok: true, data: roteiro.peca === "superlativo" ? PECA_COM_SUPERLATIVO : QUATRO_STORIES };
  }),
  anyProviderConfigured: vi.fn(async () => true),
}));

// ── A FOTO SINTÉTICA, FOTOGRAFÁVEL DE VERDADE ───────────────────────────────
//
// `travaDeRiquezaDoFundo` exige >=600 cores distintas, cor dominante <=45% e
// textura >=0,012 — medidas por `medirFundo`, que REDUZ a imagem para 160px de
// largura antes de contar.
//
// Ruído gerado direto em 1080x1920 é média-zerado por essa redução (45 pixels
// aleatórios viram um cinza) e o portão o reprova como "paleta de ilustração"
// — corretamente. Por isso a estrutura nasce em 160px e é ampliada: é a escala
// em que o portão vai olhar, e é assim que uma foto se comporta (estrutura
// grande, não só grão).
//
// O portão do fundo continua VALENDO nesta suíte. Ele não foi contornado: o
// dublê foi feito fotografável.
vi.mock("@/lib/ai/design-engine", () => ({
  // ── 27/08/2026: O DUBLÊ PASSOU A OBEDECER AO PEDIDO DE LUZ ───────────────
  //
  // Ele devolvia SEMPRE a mesma foto (semente fixa) — inclusive depois de o
  // cliente pedir "quero ela mais clara". Isso não era fidelidade: era encenar
  // um gerador que ignora a direção de arte, exatamente o que a nova régua da
  // refação (`esteira/regua-da-refacao.ts`) existe para barrar. Com a régua
  // ligada, o dublê antigo derrubava o caso do ajuste — e estava CERTO em
  // derrubar: a peça voltava com a mesma luz de antes.
  //
  // Agora o dublê clareia quando a direção de arte fala em luz/claro, que é o
  // que um gerador de verdade faz. A semente segue fixa: a mesma foto em toda
  // rodada, clara ou escura.
  generateDesign: vi.fn(async (req?: { prompt?: string }) => {
    const { default: sharp } = await import("sharp");
    const { createHash } = await import("node:crypto");
    const l = 160, a = 284;
    const dados = Buffer.allocUnsafe(l * a * 3);
    // Cadeia de sha256 com semente fixa: bytes de alta qualidade e a MESMA
    // foto em toda rodada — uma diferença entre rodadas é sempre da corrente,
    // nunca do dublê.
    let bloco = createHash("sha256").update("salvaguarda-story-v1").digest();
    for (let i = 0; i < dados.length; i += 32) {
      bloco.copy(dados, i, 0, Math.min(32, dados.length - i));
      bloco = createHash("sha256").update(bloco).digest();
    }
    // ⚠️ A PALAVRA "luz" SOZINHA NÃO SERVE: o compositor a acrescenta a TODO
    // prompt ("… Luz: …"). Casar por ela clarearia as quatro peças igualmente e
    // a refação sairia com a mesma luz de antes — que é exatamente o que a
    // régua barra. O que separa as duas cenas do caso é a HORA: a peça original
    // é "madrugada, penumbra"; a refeita é "ao amanhecer, luz clara".
    const cena = req?.prompt ?? "";
    const brilho = /penumbra|madrugada|contraluz|noite/i.test(cena)
      ? 0.7
      : /amanhecer|luz clara|luz natural|dourado/i.test(cena)
        ? 1.6
        : 1;
    const png = await sharp(dados, { raw: { width: l, height: a, channels: 3 } })
      .resize(1080, 1920, { kernel: "nearest" })
      // `brightness > 1` sobe a luminância de verdade — é o que a régua mede.
      .modulate({ brightness: brilho })
      .png()
      .toBuffer();
    // A forma REAL de `DesignResult`: uma `url` renderável. Inventar um campo
    // que o contrato não tem faria o dublê "funcionar" aqui e o caminho real
    // devolver nada.
    return { ok: true as const, url: `data:image/png;base64,${png.toString("base64")}`, model: "duble-de-teste" };
  }),
}));

// PARCIAL de propósito: só `getSession` é encenado. `isAgencyRole` — a régua de
// PERMISSÃO — continua sendo a real e continua julgando o papel de verdade.
//
// ── 29/08/2026: `workspaceId: null` ERA UM ESTADO IMPOSSÍVEL ───────────────
//
// `Session.workspaceId` é `string`, não nulável — login de verdade nunca
// devolve sessão de agência sem workspace. Um dublê que encena esse estado
// impossível não testa a rota de sessão contra o que a autenticação real
// produz; ele testa contra algo que não existe, e um teste que passa sobre um
// estado impossível não protege nada.
//
// O `workspaceId` real do workspace criado por esta suíte (`beforeAll`, mais
// abaixo) é lido de forma PREGUIÇOSA — dentro da função `async () => ({...})`,
// nunca no corpo do módulo — porque `vi.mock` é içado e roda antes de
// `let workspaceId = ""` ser inicializado. A leitura só acontece quando
// `getSession()` é de fato chamada, já dentro de um `it`, depois do
// `beforeAll` ter preenchido a variável.
vi.mock("@/lib/auth/session", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/session")>()),
  getSession: vi.fn(async () => ({
    userId: "op-1", role: "master", workspaceId, clientId: null, email: "operador@dioli.test",
  })),
}));

// O Radar é insumo, não parte da corrente.
vi.mock("@/lib/agency/radar/library", () => ({
  getActiveInsights: vi.fn(async () => []),
  buildInsightBlock: vi.fn(() => ""),
}));

import { prisma } from "@/lib/db/client";
import { departamentosDaCasa } from "@/lib/agency/escada/degraus";
import { INSTAGRAM_STORY_ESTATICO_V1, ID_STORY_V1, dimensaoExigida } from "@/lib/agency/produtos/registro";
import { MIME_DE_IMAGEM_ACEITO } from "@/lib/integrations/meta/formato-de-midia";

import { POST as postPedido } from "@/app/api/portal/pedidos/route";
import { POST as postOrcamento } from "@/app/api/portal/pedidos/orcamento/route";
import { POST as postAprovacao } from "@/app/api/portal/approvals/route";
import { POST as postPagamento } from "@/app/api/admin/pagamentos/route";
import { GET as getMidia } from "@/app/api/media/[id]/route";
import { tituloSaiuIlegivel } from "@/lib/agency/execution/artes";

const PEDIDO_DO_CLIENTE =
  "Quero 4 stories para o Instagram da padaria falando do pão de fermentação natural, " +
  // A CHAMADA PARA AÇÃO — item 3 da entrada mínima do plano. Sem ela o portão
  // do briefing PARA o pedido antes de gastar um centavo, e há um teste abaixo
  // provando exatamente isso.
  "aqueles verticais de tela cheia. Quero que a pessoa venha encomendar na loja.";
const OBJETIVO_DO_CLIENTE = "fazer o pessoal do bairro conhecer o pão de fermentação natural";

/**
 * AS DEGRADAÇÕES QUE ESTE PILOTO ACEITA — lista FECHADA, com o motivo de cada
 * uma. Tudo que a peça gravar fora daqui reprova o teste.
 *
 * Não é indulgência: é o contrário. A régua anterior proibia UMA string
 * conhecida e deixava passar todas as outras. Esta obriga a nomear cada
 * degradação que de fato acontece — e a decidir, uma por uma, se ela é
 * aceitável no piloto.
 */
const DEGRADACOES_ACEITAS_E_DECLARADAS = [
  // O repertório criativo é CÓDIGO POR MARCA (`design/repertorio-registrado.ts`,
  // hoje: Foocci e CityJobs). Um cliente fictício não tem repertório — e
  // inventar um dentro do código de produção só para o teste ficar bonito seria
  // a pior troca possível. A peça sai na composição base da casa, declarado.
  // ⚠️ É DÍVIDA DE PROVA, não "funciona": marca COM repertório não foi medida
  // por esta suíte.
  "[composição foto-cheia]",
  // O logo real do cliente é ARQUIVO, e o cliente fictício não enviou nenhum. A
  // peça é assinada com o monograma das iniciais, e a casa declara isso.
  // ⚠️ Também é dívida de prova: assinatura com o arquivo oficial não foi
  // exercitada.
  "[sem logo]",
];

/**
 * O QUE ESTA SUÍTE NÃO MEDE — declarado, para não ser confundido com verde.
 *
 * Régua verde sobre o componente errado é pior que régua nenhuma. O corolário:
 * um verde que não diz o que ficou de fora vira, na leitura de quem não
 * construiu, uma promessa maior do que a que foi feita. Então fica escrito:
 *
 *  1. LOGO REAL — nenhum arquivo de logo oficial foi assinado numa peça; a
 *     assinatura exercitada é o monograma. Dívida de prova.
 *  2. REPERTÓRIO DE MARCA — o repertório criativo é código por marca e o
 *     cliente fictício não tem um. A composição base foi a única exercitada.
 *     Dívida de prova.
 *  3. CONTRASTE SOBRE FUNDO FOTOGRÁFICO — **FECHADA em 25/08/2026.** Ela dizia
 *     que o portão de contraste mede pares de superfície CHAPADA e que o par
 *     "título branco sobre foto de alto ruído" não era medido por ninguém. O
 *     Auditor conferiu com os olhos na 4ª rodada e confirmou: praticamente
 *     ilegível.
 *
 *     Agora é medido, e no ARQUIVO: `legibilidade-do-titulo.ts` lê os pixels do
 *     JPEG dentro da caixa que o título ocupa no DOM (`tituloCaixa`, tomada
 *     depois do encolhimento) e mede o PIOR pedaço do fundo contra a tinta —
 *     pior e não média, porque a pessoa lê a linha inteira, não a média dela.
 *
 *     O número, na corrente: **2,15–2,35:1 antes, 3,20–3,74:1 depois**, com
 *     piso de 3:1 (WCAG, texto grande). A causa estava achada e era mecânica: o
 *     degradê do molde subia do PÉ e já era transparente acima de 62%, enquanto
 *     a caixa do título fica em y=290..530 de 1920 — o título estava sobre a
 *     foto crua. O degradê ganhou a segunda metade (`molde.ts`).
 *
 *     ⚠️ O QUE **AINDA NÃO** É: uma trava que impeça a peça de sair. A produção
 *     DECLARA (`[titulo ilegivel]`, com o número, no `lastError`) e esta suíte
 *     REPROVA, mas uma peça abaixo do piso ainda seria gravada. É escolha
 *     declarada: a medida erra para o lado seguro (a média da faixa inclui os
 *     pixels da própria letra, o que baixa a razão), e jogar fora uma peça paga
 *     por uma medida conservadora troca um prejuízo por outro. Fica na mesa.
 * 3-B. A RÉGUA DA MARCA (25/08/2026) mede o que dá para medir: a primária do
 *     cliente está na tinta do rodapé do JPEG. Ela NÃO julga se a peça está
 *     "na cara da marca", não vê tipografia e não vê o logo.
 *  4. PIXELS EM NAVEGADOR — a camada visual é medida por HTML renderizado
 *     (`react-dom/server`) e por CSS compilado, nunca aplicando um ao outro e
 *     medindo a caixa resultante. Legibilidade tipográfica também não é medida.
 *  5. PUBLICAÇÃO META (fase H) — fora de escopo por ordem do plano. Nenhuma
 *     conta real foi tocada.
 *  6. A MIRA DO AJUSTE lê ORDINAIS EXPLÍCITOS ("a terceira", "peça 3", "a
 *     última"). Cliente que aponta a peça pelo ASSUNTO ("aquela do forno")
 *     não é entendido, e aí a casa refaz o conjunto — caro, mas atende. Não
 *     medido: mira por descrição.
 *
 * ══ ACRESCENTADOS NA 6ª AUDITORIA (25/08/2026) ═══════════════════════════════
 *
 * O Auditor conferiu este registro item a item e nada tinha sumido caladamente.
 * Mas ele achou DOIS pontos fracos que pertenciam aqui e não estavam. Ponto
 * fraco declarado é dívida; ponto fraco SILENCIOSO é armadilha.
 *
 *  7. O NÚMERO DO CONTRASTE VALE PARA O DUBLÊ, NÃO PARA TODA FOTO.
 *     Os 3,20–3,74:1 do item 3 foram medidos sobre a foto que `generateDesign`
 *     produz AQUI: ruído de sha256 ampliado, cuja média cai perto do cinza
 *     médio. Fundo claro de verdade — céu estourado, parede branca, prato sob
 *     luz dura — é o caso adversarial que este dublê NÃO representa.
 *     O Auditor estendeu por conta própria, trocou o dublê por uma foto clara e
 *     o piso continuou de pé; isso é notícia boa e não é a mesma coisa que uma
 *     régua permanente. O que esta suíte prova é: **o piso segura para a foto
 *     deste dublê.** A cobertura por famílias de fundo (claro, escuro, saturado)
 *     não existe.
 *
 *  8. O 409 DO CARD É LER-DEPOIS-ESCREVER, NÃO COMPARE-AND-SET.
 *     `/api/portal/approvals` lê `approval.status !== "pending"` e só depois
 *     escreve. Duas requisições verdadeiramente SIMULTÂNEAS passam as duas,
 *     e como `updateApprovalStatus` grava `reviewedAt: new Date()` sem guarda
 *     de estado, elas carimbam dois instantes, produzem duas chaves de
 *     idempotência e deixam DOIS rastros canônicos para uma decisão.
 *     O dano é ruído de auditoria: as duas escrevem a MESMA decisão, então o
 *     card, as peças e a resposta ao cliente ficam corretos. Fechar de verdade
 *     é um `updateMany({ where: { id, status: "pending" } })` em
 *     `updateApprovalStatus`, que atravessa todos os chamadores dela — fora do
 *     escopo desta operação, e por isso declarado aqui em vez de escondido num
 *     comentário que jurava uma garantia que a chave não dá.
 *     NÃO MEDIDO: a corrida em si. O achado é por leitura do código.
 *
 *  9. A FIAÇÃO DA PARADA DECLARADA (item 1 da 6ª auditoria) FOI PAGA, com a
 *     ressalva do banco. `__tests__/portal/aprovacao-cliente-direto.test.ts`
 *     agora atravessa rota real → promoção real → declaração real e reprova a
 *     mutação exata que o Auditor usou (trocar a chamada por `console.error`).
 *     O que continua dublado ali é o PRISMA: o teste mede as ESCRITAS pedidas,
 *     não as linhas gravadas. O e2e desta suíte é quem toca banco de verdade.
 */
export const O_QUE_NAO_FOI_MEDIDO = [
  "logo real do cliente numa peça",
  "repertório de marca registrado",
  // Medido desde 25/08/2026 (ver item 3 acima). O que continua fora é a TRAVA:
  // a produção declara e a suíte reprova, mas nada impede a peça de ser gravada.
  "trava de produção para título abaixo do piso de legibilidade (hoje só declarado + régua de teste)",
  "pixels e legibilidade em navegador real",
  "publicação na Meta (fase 5)",
  "mira do ajuste por descrição do assunto (só ordinal explícito é lido)",
  // ── Acrescentados na 6ª auditoria (ver itens 7 e 8 acima) ──────────────────
  "contraste do título sobre FAMÍLIAS de fundo (o número medido vale para a foto do dublê: ruído de sha256, média perto do cinza médio)",
  "a corrida real de duas decisões simultâneas no mesmo card (o 409 é ler-depois-escrever; o resíduo é rastro canônico duplicado)",
];

let workspaceId = "";

// ─────────────────────────────────────────────────────────────────────────────
// A instrumentação: um cliente ISOLADO por rodada
// ─────────────────────────────────────────────────────────────────────────────
//
// Três rodadas com o MESMO cliente não provariam três rodadas: a segunda e a
// terceira herdariam estado (peças, cards, orçamento de imagens do dia) e a
// primeira teria feito o trabalho pelas outras. Cada rodada tem cliente,
// solicitação, projeto e token PRÓPRIOS.

interface ClienteDeTeste {
  clientId: string;
  clientRequestId: string;
  projectId: string;
  token: string;
  nome: string;
}

async function abrirClienteFicticio(nome: string): Promise<ClienteDeTeste> {
  // ── A CONVENÇÃO DOS FICTÍCIOS (Auditor, 4ª rodada) ───────────────────────
  //
  // Marcador no nome e contato em `.invalid`. Inerte neste banco efêmero — e a
  // convenção não existe por causa deste banco: as travas de saída desta casa
  // barram POR DADO, e um fictício que não se parece com fictício é exatamente
  // o registro que atravessa quando alguém aponta a suíte para o lugar errado.
  // `.invalid` é reservado por RFC 2606: nenhum servidor de e-mail o entrega.
  //
  // ⚠️ **SEM COLCHETES, e isso foi MEDIDO aqui, não escolhido por estilo.**
  //
  // A grafia `[TESTE]` da convenção derrubou as três rodadas do caso normal na
  // primeira tentativa: `Client.name` é a ASSINATURA que o molde rasteriza na
  // peça (`artes.ts`, `assinatura: marca.nome`), e a trava de texto reprova
  // rótulo com pontuação — "rótulo com caractere que não é de rótulo". Toda
  // peça passou a sair com `[molde] texto barrado pela trava`, ou seja, sem a
  // camada de texto.
  //
  // A trava está CERTA e não foi afrouxada: assinatura de marca com colchete
  // não é assinatura. Quem se adapta é a convenção — o marcador vira palavra,
  // que é o que o cliente fictício quer dizer de qualquer forma, e a peça sai
  // assinada dizendo TESTE, o que é ainda mais difícil de confundir com a peça
  // de um cliente real.
  const nomeFicticio = `${nome} TESTE`;
  const cliente = await prisma.client.create({
    data: {
      workspaceId, name: nomeFicticio, industry: "Alimentação",
      email: `${nome.replace(/\W+/g, "-").toLowerCase()}@teste.invalid`,
      // ── A MARCA DO CLIENTE ────────────────────────────────────────────────
      //
      // Sem isto, `moldeDoCliente` devolve `origem: "neutro"` e a peça sai no
      // CINZA PADRÃO DA CASA — degradação declarada, e correta, mas não é o que
      // a régua do concluído pede ("JPEG 1080×1920 COM A MARCA APLICADA").
      //
      // Um piloto rodado sobre cliente sem marca provaria a corrente e NÃO
      // provaria a marca — e "molde neutro tratado como identidade do cliente"
      // é um dos riscos nomeados no plano de recuperação.
      brandBrain: {
        create: {
          primaryColor: "#7A3B12",
          secondaryColor: "#E8C89A",
          typography: "serifada",
          tone: "próximo, de bairro, sem exagero",
        },
      },
    },
  });
  const solicitacao = await prisma.clientRequestDb.create({
    data: {
      workspaceId, clientId: cliente.id,
      businessName: nomeFicticio, segment: "Alimentação",
      services: JSON.stringify(["social media"]),
      objectives: JSON.stringify([OBJETIVO_DO_CLIENTE]),
      briefingJson: JSON.stringify({ scope: { targetAudience: "moradores do bairro" } }),
      status: "accepted",
    },
  });
  const projeto = await prisma.project.create({
    data: {
      workspaceId, clientId: cliente.id, clientRequestId: solicitacao.id,
      name: `Social — ${nomeFicticio}`, goal: OBJETIVO_DO_CLIENTE,
      stage: "producao", directionApprovedAt: new Date(),
    },
  });
  const acesso = await prisma.portalAccess.create({
    data: { clientId: cliente.id, clientRequestId: solicitacao.id },
  });
  return {
    clientId: cliente.id, clientRequestId: solicitacao.id,
    projectId: projeto.id, token: acesso.token, nome: nomeFicticio,
  };
}

/**
 * A requisição, como o NAVEGADOR a monta.
 *
 * `sec-fetch-site: same-origin` é o que todo navegador manda numa chamada da
 * própria página. A trava de CSRF das rotas continua real e continua valendo:
 * trocar este valor por "cross-site" faz as rotas devolverem 403, que é
 * exatamente o comportamento que ela deve ter.
 */
function req(url: string, corpo?: unknown): NextRequest {
  // `NextRequest` e não `Request`: as rotas de mídia leem `nextUrl.searchParams`
  // (é de lá que sai o token do portal). Um `Request` cru estoura ali — e
  // estourar é o certo: a rota real recebe `NextRequest`, e um teste que usasse
  // outro tipo estaria exercitando um caminho que produção não tem.
  return new NextRequest(`http://localhost${url}`, {
    method: corpo === undefined ? "GET" : "POST",
    headers: { "content-type": "application/json", "sec-fetch-site": "same-origin" },
    ...(corpo === undefined ? {} : { body: JSON.stringify(corpo) }),
  });
}

/** O PAGAMENTO, PELO CAMINHO LEGÍTIMO. A trava de pagamento vale inteira nesta
 *  suíte — nenhum registro é escrito à mão no banco. */
async function pagar(c: ClienteDeTeste, centavos: number): Promise<void> {
  const r = await postPagamento(req("/api/admin/pagamentos", {
    clientRequestId: c.clientRequestId,
    valorCentavos: centavos,
    observacao: "piloto Story V1 — cliente fictício de teste",
  }));
  expect(r.status, `pagamento de ${c.nome}`).toBe(200);
}

/**
 * O cliente PEDE e ACEITA O ORÇAMENTO, os dois pela porta do portal.
 *
 * Os dois passos, porque a corrente real tem os dois. Stories avulsos não estão
 * no ciclo mensal deste cliente, então a triagem os classifica como ESCOPO
 * EXTRA e para com o preço na mesa: `podeProduzirAgora` é falso enquanto
 * `quoteStatus !== "aceito"`, e essa checagem é do servidor, não da tela.
 *
 * **Este gate NÃO é contornado.** Ele é atravessado pela mesma rota que o
 * cliente usa. Pular direto para a produção provaria uma corrente que nenhum
 * cliente percorre.
 */
async function pedirPeloPortal(c: ClienteDeTeste): Promise<{ pedidoId: string }> {
  const r = await postPedido(req("/api/portal/pedidos", {
    token: c.token, descricao: PEDIDO_DO_CLIENTE, objetivo: OBJETIVO_DO_CLIENTE,
  }));
  const corpo = await r.json() as Record<string, unknown>;
  const pedidoId = (corpo.pedido as Record<string, unknown>).id as string;

  const emEspera = await prisma.contentRequest.findUniqueOrThrow({ where: { id: pedidoId } });
  if (emEspera.quoteStatus === "pendente") {
    // NADA foi produzido antes do aceite — é o gatilho de aprovação, e ele
    // vale: escopo extra não vira peça (nem fatura de IA) sem o cliente dizer
    // sim.
    expect(emEspera.deliverableId, "nada é produzido antes de o cliente aceitar o orçamento").toBeNull();
    const ro = await postOrcamento(req("/api/portal/pedidos/orcamento", {
      token: c.token, pedidoId, decisao: "aceito",
    }));
    expect(ro.status, `aceite do orçamento de ${c.nome}`).toBe(200);
  }
  return { pedidoId };
}

/** Os bytes que a rota pública REALMENTE serve para este cliente. É a prova de
 *  `mediaUrl` — não o campo do banco, mas a resposta HTTP. */
async function baixarMidia(
  mediaUrl: string, token: string,
): Promise<{ status: number; mime: string | null; bytes: Buffer }> {
  const id = mediaUrl.split("/").filter(Boolean).pop()!;
  const r = await getMidia(
    req(`/api/media/${id}?token=${token}`),
    { params: Promise.resolve({ id }) } as never,
  );
  return { status: r.status, mime: r.headers.get("content-type"), bytes: Buffer.from(await r.arrayBuffer()) };
}

async function pecasDoPedido(pedidoId: string) {
  const pedido = await prisma.contentRequest.findUniqueOrThrow({ where: { id: pedidoId } });
  const posts = await prisma.socialPost.findMany({
    where: { deliverableId: pedido.deliverableId ?? "—" },
    orderBy: { createdAt: "asc" },
  });
  const card = await prisma.approvalRequest.findFirst({ where: { department: `pedido:${pedidoId}` } });
  return { pedido, posts, card };
}

beforeAll(async () => {
  if (existsSync(DB_PATH)) rmSync(DB_PATH);
  if (existsSync(process.env.RAILWAY_VOLUME_MOUNT_PATH!)) {
    rmSync(process.env.RAILWAY_VOLUME_MOUNT_PATH!, { recursive: true, force: true });
  }
  execSync("npx prisma db push --accept-data-loss", {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: `file:${DB_PATH}` },
    stdio: "pipe",
  });

  const ws = await prisma.agencyWorkspace.create({
    data: { name: "Dioli Agência", slug: `story-e2e-${Date.now()}` },
  });
  workspaceId = ws.id;

  // A ESCADA DE EXPOSIÇÃO É REAL e continua valendo — o que se faz aqui é
  // LIBERAR o degrau, que é a decisão que uma pessoa toma antes de um piloto.
  // Sem esta semeadura a peça é retida em "sombra", e isso está provado em
  // `__tests__/qualidade/escada-de-exposicao.test.ts`, não aqui.
  for (const departmentId of departamentosDaCasa()) {
    await prisma.departmentLadder.create({
      data: { workspaceId, departmentId, degrau: "wide", motivo: "piloto Story V1", decididoPor: "diretor" },
    });
  }
}, 300_000);

afterAll(async () => {
  await prisma.$disconnect().catch(() => {});
  if (existsSync(DB_PATH)) rmSync(DB_PATH);
  if (existsSync(process.env.RAILWAY_VOLUME_MOUNT_PATH!)) {
    rmSync(process.env.RAILWAY_VOLUME_MOUNT_PATH!, { recursive: true, force: true });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO NORMAL — TRÊS RODADAS CONSECUTIVAS, TRÊS CLIENTES ISOLADOS
// ═══════════════════════════════════════════════════════════════════════════

describe("caso normal — o pedido do cliente vira JPEG 1080x1920 aprovável", () => {
  for (const rodada of [1, 2, 3]) {
    it(`rodada ${rodada}: pedido pelo portal → arquivo real → aprovação → download`, async () => {
      const c = await abrirClienteFicticio(`Padaria da Esquina ${rodada}`);
      await pagar(c, 9900);

      // ── 1. O CLIENTE PEDE, PELA PORTA DO PORTAL ─────────────────────────
      const { pedidoId } = await pedirPeloPortal(c);
      const { pedido, posts, card } = await pecasDoPedido(pedidoId);

      // ── 2. A IDENTIDADE SOBREVIVEU À TRIAGEM ────────────────────────────
      expect(pedido.produtoId, "o produto canônico viaja com o pedido").toBe(ID_STORY_V1);
      expect(
        pedido.status,
        `nenhuma falha termina em outro estado que não 'entregue' — motivo: ${pedido.declineReason}`,
      ).toBe("entregue");

      // ── 3. EXISTE PEÇA PUBLICÁVEL, E ELA É STORY ────────────────────────
      expect(posts.length).toBe(INSTAGRAM_STORY_ESTATICO_V1.quantidadeDePecas);
      const { tituloDaFonte } = await import("@/lib/agency/design/trava-de-texto");
      for (const p of posts) {
        expect(p.format, "SocialPost.format = story").toBe("story");
        expect(p.mediaUrl, "mediaUrl gravada").toBeTruthy();
        // A peça NÃO nasce agendada: quem a põe no caminho do relógio é a
        // decisão do cliente, não a produção.
        expect(p.status).toBe("draft");

        // ── A MARCA FOI APLICADA, E TODA DEGRADAÇÃO É CONHECIDA ────────────
        //
        // A primeira versão desta régua proibia a string `molde neutro` e
        // pronto. Estava MIRADA NO IRMÃO: as peças gravavam outra degradação
        // ("[composição foto-cheia] esta marca não registrou o formato de post
        // simples") e a régua passava verde por cima dela.
        //
        // Proibir uma string conhecida só pega o defeito que já se conhece. A
        // régua certa é a inversa: **toda degradação presente tem de estar numa
        // lista fechada e declarada.** Degradação nova aparece vermelha aqui, em
        // vez de passar calada — que é exatamente como a de cima passou.
        //
        // ⚠️ `molde neutro` NÃO está na lista, e não pode estar: entregar o
        // cinza padrão chamando de identidade do cliente é um dos riscos
        // nomeados no plano de recuperação, não uma degradação aceitável.
        expect(p.lastError ?? "", `peça ${p.id} saiu sem a marca do cliente`).not.toMatch(/molde neutro/);
        for (const marcador of (p.lastError ?? "").match(/\[[^\]]+\]/g) ?? []) {
          expect(
            DEGRADACOES_ACEITAS_E_DECLARADAS,
            `peça ${p.id} gravou uma degradação que este teste não conhece: ${marcador} — ` +
            "declare-a (com o porquê) ou conserte-a; passar calado é como a anterior passou",
          ).toContain(marcador);
        }

        // ── O TEXTO RASTERIZADO É O TEXTO APROVADO ─────────────────────────
        // `[molde] texto barrado pela trava` é o que a casa grava quando o
        // título NÃO virou pixel — a peça sai só com a foto e a assinatura.
        // Story sem título é peça quebrada com cara de peça, e o estado do
        // banco não denuncia: `mediaUrl` fica preenchido do mesmo jeito.
        expect(p.lastError ?? "", `peça ${p.id} saiu SEM título`).not.toMatch(/texto barrado/);
        // E o título é trecho LITERAL da legenda auditada — nunca texto novo.
        const titulo = tituloDaFonte(p.caption);
        expect(titulo, `peça ${p.id} não tem título derivável da legenda`).toBeTruthy();
        expect(p.caption).toContain(titulo!);
      }

      // ── 4. O ARQUIVO, PELA ROTA PÚBLICA, MEDIDO NOS PIXELS ──────────────
      const { default: sharp } = await import("sharp");
      const exigida = dimensaoExigida(INSTAGRAM_STORY_ESTATICO_V1);
      for (const p of posts) {
        const baixado = await baixarMidia(p.mediaUrl!, c.token);
        expect(baixado.status, `HTTP de ${p.mediaUrl}`).toBe(200);
        expect(baixado.bytes.length, "o arquivo tem bytes").toBeGreaterThan(1000);
        // JPEG conferido no CABEÇALHO dos bytes servidos, não no campo do banco.
        expect(baixado.bytes[0]).toBe(0xff);
        expect(baixado.bytes[1]).toBe(0xd8);
        expect(baixado.mime).toContain(MIME_DE_IMAGEM_ACEITO);
        const m = await sharp(baixado.bytes).metadata();
        expect({ largura: m.width, altura: m.height }).toEqual(exigida);

        // A EVIDÊNCIA, escrita a partir dos MESMOS bytes que a rota pública
        // acabou de servir ao cliente — não de uma segunda geração.
        if (GUARDAR_EVIDENCIA && rodada === 1) {
          mkdirSync(PASTA_DE_EVIDENCIA, { recursive: true });
          writeFileSync(`${PASTA_DE_EVIDENCIA}/story-${p.id}.jpg`, baixado.bytes);
          writeFileSync(
            `${PASTA_DE_EVIDENCIA}/story-${p.id}.txt`,
            [
              `pedido:      ${pedidoId}`,
              `produto:     ${pedido.produtoId}`,
              `SocialPost:  ${p.id}`,
              `format:      ${p.format}`,
              `mediaUrl:    ${p.mediaUrl}`,
              `HTTP:        ${baixado.status}`,
              `content-type:${baixado.mime}`,
              `bytes:       ${baixado.bytes.length}`,
              `dimensao:    ${m.width}x${m.height}`,
              `legenda:     ${p.caption}`,
              `lastError:   ${p.lastError ?? "(vazio)"}`,
            ].join("\n"),
          );
        }
      }

      // ── 4-A2. O TÍTULO É LEGÍVEL SOBRE A FOTO (dívida nº 3, fechada) ────
      //
      // ═══════════════════════════════════════════════════════════════════
      // A DÍVIDA QUE A CASA ESCREVEU CONTRA SI MESMA, E QUE AGORA TEM RÉGUA
      // ═══════════════════════════════════════════════════════════════════
      //
      // Item 3 do `O_QUE_NAO_FOI_MEDIDO`: *"o portão de contraste mede pares de
      // superfície CHAPADA. Na peça que saiu, o título é branco sobre foto de
      // alto ruído, e ninguém mede esse par."* O Auditor abriu a peça na 4ª
      // rodada e confirmou com os olhos: praticamente ilegível. Era a dívida de
      // maior consequência para quem paga — o título é a primeira coisa que o
      // cliente do cliente lê, e a única se estiver com pressa.
      //
      // MEDIDO na corrente, antes do conserto: a caixa do título ficava em
      // y=290..530 de 1920, e o degradê do molde subia do PÉ e já era
      // transparente acima de 62%. O título estava sobre a FOTO CRUA, sem
      // proteção nenhuma. Contraste no pior pedaço: **2,15 a 2,35:1**, contra
      // um piso de 3:1 para texto grande.
      //
      // O conserto é MECANISMO, não aviso: o degradê ganhou a segunda metade,
      // descendo do topo na primária da marca e segurando a força ATRAVESSANDO
      // a faixa do título (`molde.ts`). Depois: **3,20 a 3,74:1**.
      //
      // Esta régua mede o ARQUIVO — os pixels do JPEG que a rota pública acabou
      // de servir, dentro da caixa que o título ocupa no DOM. Não é a coluna,
      // não é a constante do molde, não é a intenção do degradê.
      for (const p of posts) {
        expect(
          tituloSaiuIlegivel(p.lastError),
          `a peça ${p.id} saiu com o título abaixo do piso de legibilidade sobre a foto — ` +
          `a produção declarou: ${p.lastError ?? "(vazio)"}`,
        ).toBe(false);
      }

      // ── 4-B. A RÉGUA DA MARCA OLHA A PEÇA FINAL (critério D) ────────────
      //
      // Achado 7 da 4ª auditoria: nada nesta casa media o JPEG contra a marca.
      // O contrato de marca ia ao PRODUTOR, o juiz auditava o TEXTO e o portão
      // de contraste media cores DECLARADAS antes de a imagem existir. Três
      // réguas, nenhuma abrindo o arquivo.
      //
      // Aqui a pergunta cai sobre os bytes que a rota pública serviu — e a
      // régua sabe reprovar: `__tests__/produtos/a-marca-esta-na-peca-final.test.ts`
      // rasteriza a mesma peça no molde neutro e ela fica vermelha.
      {
        const { conferirMarcaNaPecaFinal } = await import("@/lib/agency/produtos/regua-da-marca-na-peca");
        const marcaDoCliente = await prisma.brandBrain.findFirstOrThrow({ where: { clientId: c.clientId } });
        for (const p of posts) {
          const arquivo = await baixarMidia(p.mediaUrl!, c.token);
          const v = await conferirMarcaNaPecaFinal({
            bytes: arquivo.bytes,
            corDaMarca: marcaDoCliente.primaryColor!,
            ondeEsta: `peça ${p.id}`,
          });
          expect(
            v.ok,
            `a peça foi entregue como "com a marca aplicada" e o arquivo não carrega a marca: ${v.motivo}`,
          ).toBe(true);
        }
      }

      // ── 5. O CARD DO PORTAL TEM A PEÇA DENTRO ───────────────────────────
      expect(card, "o cliente tem onde decidir").toBeTruthy();
      expect(card!.clientVisible).toBe(true);
      expect(card!.status).toBe("pending");
      expect(
        JSON.parse(card!.sourcePostIdsJson ?? "[]"),
        "o card aponta as peças — é o que põe a imagem no cartão",
      ).toEqual(posts.map((p) => p.id));

      // ── A PROVA DE QUE O CLIENTE VÊ A IMAGEM, PELA PORTA REAL ──────────
      //
      // ⚠️ Esta passagem chamava `montarPecas` DIRETO — função interna. O
      // Auditor apontou (4ª rodada) que é a mesma classe que o contrato lista
      // como reprovação imediata: "teste que chama função interna e ignora a
      // porta real do portal". Não foi consumada porque o teste do sem-árbitro
      // já cobria o componente pela porta real, mas o caso normal sozinho não
      // provaria nada — e é o caso normal que se repete três vezes.
      //
      // Agora a pergunta vai à MESMA porta que o navegador do cliente chama, e
      // a resposta é montada no MESMO componente que ele enxerga.
      const { GET: portalDataNormal } = await import("@/app/api/brain/portal-data/route");
      const respostaDoPortal = await portalDataNormal(
        new NextRequest(`http://local/api/brain/portal-data?token=${c.token}`),
      );
      expect(respostaDoPortal.status, "a porta real do portal responde").toBe(200);
      const dadosDoPortal = await respostaDoPortal.json();
      const cardNoPortal = (dadosDoPortal.approvals ?? []).find((a: { id: string }) => a.id === card!.id);
      expect(cardNoPortal, "o card chega ao portal do cliente").toBeTruthy();
      expect(cardNoPortal.semConteudo, "card sem corpo visual é reprovação imediata").not.toBe(true);
      expect(cardNoPortal.pecas.length, "o cartão leva as quatro peças").toBe(posts.length);
      for (const peca of cardNoPortal.pecas) {
        expect(peca.capa, "peça sem capa é cartão sem corpo visual").toBeTruthy();
        expect(peca.format).toBe("story");
      }

      // E o componente REAL monta com esse card: o que se afirma é o HTML.
      const { createElement: criarElemento } = await import("react");
      const { renderToStaticMarkup: paraHtml } = await import("react-dom/server");
      const { AprovacoesDoCliente: TelaDoCliente } = await import("@/components/portal/AprovacoesDoCliente");
      const htmlDoCartao = paraHtml(
        criarElemento(TelaDoCliente, {
          aprovacoes: [cardNoPortal], token: c.token, abertaId: cardNoPortal.id,
          onAbrir: () => {}, enviando: false, erro: null, onDecidir: async () => true,
        }),
      );
      const imagensNaTela = [...htmlDoCartao.matchAll(/<img[^>]+\/api\/media\//g)];
      expect(
        imagensNaTela.length,
        "o cliente é chamado a aprovar sem ver a peça — 'card sem corpo visual' é reprovação imediata",
      ).toBe(posts.length);
      expect(htmlDoCartao, "e os botões de decisão estão na mesma tela").toContain("Aprovar");
      // A proporção do Story, na tela em que ele decide: quadrado corta o topo
      // e a base, que é onde o molde põe o título e a assinatura da marca.
      const { proporcaoDaPeca: proporcaoNaTela } = await import("@/lib/agency/portal/proporcao-da-peca");
      expect(htmlDoCartao).toContain(proporcaoNaTela("story"));
      expect(htmlDoCartao, "formato quadrado é reprovação imediata").not.toMatch(/aspect-square/);

      // ── 6. O CLIENTE APROVA, PELA PORTA DO PORTAL ───────────────────────
      const rAprovacao = await postAprovacao(req("/api/portal/approvals", {
        token: c.token, approvalRequestId: card!.id, action: "approve", authorName: c.nome,
      }));
      expect(rAprovacao.status).toBe(200);

      const decidido = await prisma.approvalRequest.findUniqueOrThrow({ where: { id: card!.id } });
      expect(decidido.status).toBe("approved");
      // AUTORIA: aprovação sem autor não é aprovação, é carimbo.
      expect(decidido.reviewedBy).toBe(`client:${c.nome}`);
      expect(decidido.reviewedAt).toBeTruthy();

      // ── 7. O DOWNLOAD, DEPOIS DA APROVAÇÃO ──────────────────────────────
      const { GET: getDownload } = await import("@/app/api/social-posts/[id]/download/route");
      const primeiro = posts[0]!;
      const rDownload = await getDownload(
        req(`/api/social-posts/${primeiro.id}/download?token=${c.token}`) as never,
        { params: Promise.resolve({ id: primeiro.id }) } as never,
      );
      expect(rDownload.status, "o cliente consegue baixar o arquivo aprovado").toBe(200);
      expect(Buffer.from(await rDownload.arrayBuffer()).length).toBeGreaterThan(1000);
    }, 600_000);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO DE AJUSTE
// ═══════════════════════════════════════════════════════════════════════════

describe("caso de ajuste — a peça apontada volta como ARQUIVO NOVO", () => {
  it("o cliente aponta a TERCEIRA peça: só ela ganha imagem nova, e ele aprova a versão nova", async () => {
    // ═══════════════════════════════════════════════════════════════════════
    // ⚠️ O QUE FOI MEDIDO CONTRA MIM (Auditor, 4ª rodada, 25/08/2026)
    // ═══════════════════════════════════════════════════════════════════════
    //
    // Sonda dele, na corrente rodando: o cliente escreveu "A TERCEIRA peça
    // está escura demais, quero ela mais clara". A rota devolveu **200** e
    // **0 de 4 arquivos mudaram** — `mediaUrl` idêntica, bytes idênticos
    // (923.426 → 923.426). Três batidas do relógio depois, continuava 0 de 4.
    //
    // E a versão anterior DESTE teste afirmava o defeito como se fosse virtude:
    //
    //     expect(agora.map(p => p.mediaUrl)).toEqual(arquivosAntes)
    //     // rotulado "nenhum arquivo anterior foi apagado"
    //
    // Leia de novo: essa linha EXIGIA que os arquivos fossem os mesmos. Ela
    // transformava "o ajuste não fez nada" em verde — régua verde sobre o
    // componente errado, dentro do teste que devia proteger o cliente.
    //
    // **Preservar a versão anterior e PRODUZIR uma nova são coisas diferentes.**
    // Este teste agora exige as duas, e exige a MIRA: a terceira muda, as
    // outras três não. Refazer as quatro gastaria quatro imagens pagas para
    // destruir três peças que estavam boas.
    const c = await abrirClienteFicticio("Padaria do Ajuste");
    await pagar(c, 9900);
    const { pedidoId } = await pedirPeloPortal(c);
    const { posts, card } = await pecasDoPedido(pedidoId);
    expect(posts.length).toBe(4);

    // Os arquivos de ANTES, e os BYTES de antes: `mediaUrl` diferente com bytes
    // iguais também seria mentira, e é barato demais conferir para não conferir.
    const urlAntes = posts.map((p) => p.mediaUrl!);
    const bytesAntes = await Promise.all(urlAntes.map(async (u) => (await baixarMidia(u, c.token)).bytes.length));

    // ── QUANTAS IMAGENS PAGAS O AJUSTE VAI GASTAR ────────────────────────
    //
    // A régua de "somente a peça apontada volta" NÃO pode ser só "as outras
    // não mudaram": o dublê do especialista preserva o texto das outras três
    // palavra por palavra, então mesmo refazendo as quatro os arquivos delas
    // sairiam idênticos e a régua ficaria verde sobre quatro imagens PAGAS
    // jogadas fora. Foi assim que a mira quase passou sem trava.
    //
    // O que a mira protege é dinheiro e é a peça boa. Então o que se conta é a
    // CHAMADA PAGA — `generateDesign`, a mesma que o teto diário conta.
    const design2 = await import("@/lib/ai/design-engine");
    const imagensAntesDoAjuste = vi.mocked(design2.generateDesign).mock.calls.length;

    const r = await postAprovacao(req("/api/portal/approvals", {
      token: c.token, approvalRequestId: card!.id, action: "request_revision",
      comment: "A terceira peça está escura demais, quero ela mais clara.", authorName: c.nome,
    }));
    expect(r.status).toBe(200);

    expect(
      vi.mocked(design2.generateDesign).mock.calls.length - imagensAntesDoAjuste,
      "o cliente apontou UMA peça e a casa comprou imagem para mais de uma — " +
      "refação sem mira é o risco 4 do plano: gasta o dinheiro da casa para PIORAR " +
      "as três peças que estavam boas",
    ).toBe(1);

    const depois = await prisma.approvalRequest.findUniqueOrThrow({
      where: { id: card!.id }, include: { comments: true },
    });

    // ── 1. A PEÇA APONTADA GANHOU ARQUIVO NOVO ───────────────────────────
    const agora = await prisma.socialPost.findMany({
      where: { id: { in: posts.map((p) => p.id) } }, orderBy: { createdAt: "asc" },
    });
    expect(agora.length).toBe(4);

    const TERCEIRA = 2; // índice 0-based da peça que ele apontou
    expect(
      agora[TERCEIRA]!.mediaUrl,
      "o cliente pediu ajuste NA TERCEIRA e recebeu de volta exatamente a mesma imagem — " +
      "'ajustável' é a régua do concluído, e ela não é atendida por um 200",
    ).not.toBe(urlAntes[TERCEIRA]);
    expect(agora[TERCEIRA]!.mediaUrl, "e o arquivo novo existe").toBeTruthy();

    // ── 2. E É UM JPEG 1080×1920 DE VERDADE, servido pela rota pública ────
    // Arquivo novo que não abre, ou que abre com outra dimensão, é pior que
    // arquivo velho: o cliente aprova o que a casa não pode publicar.
    const nova = await baixarMidia(agora[TERCEIRA]!.mediaUrl!, c.token);
    expect(nova.status, "a imagem nova é servida ao cliente").toBe(200);
    expect(nova.mime).toBe("image/jpeg");
    const { default: sharp } = await import("sharp");
    const exigidaNoAjuste = dimensaoExigida(INSTAGRAM_STORY_ESTATICO_V1);
    const medidaNova = await sharp(nova.bytes).metadata();
    expect(medidaNova.width).toBe(exigidaNoAjuste.largura);
    expect(medidaNova.height).toBe(exigidaNoAjuste.altura);
    expect(nova.bytes.length, "e os BYTES são outros — não é a mesma imagem com nome novo")
      .not.toBe(bytesAntes[TERCEIRA]);

    // ── 3. SOMENTE A PEÇA APONTADA VOLTA ─────────────────────────────────
    // Risco 4 do plano ("refação sem mira"). As outras três não foram tocadas:
    // nem arquivo novo, nem imagem paga gasta.
    for (const i of [0, 1, 3]) {
      expect(
        agora[i]!.mediaUrl,
        `a peça ${i + 1} não foi apontada e não podia mudar — refazer o que estava bom é prejuízo da casa e frustração dele`,
      ).toBe(urlAntes[i]);
    }

    // ── 4. A VERSÃO ANTERIOR É PRESERVADA ────────────────────────────────
    // O arquivo velho da TERCEIRA não foi apagado: ele continua servível. É
    // isto que a frase do contrato quer dizer — e é diferente de "não mudou".
    for (const u of urlAntes) {
      expect((await baixarMidia(u, c.token)).status, "o arquivo anterior continua acessível").toBe(200);
    }

    // ── 5. O CARD REABRE COM A VERSÃO NOVA ───────────────────────────────
    expect(depois.status, "o card reabre com a versão nova para o cliente decidir").toBe("pending");
    expect(depois.reviewedBy, "o sim anterior não vale para a versão nova").toBeNull();

    // O COMENTÁRIO FICA REGISTRADO — sem ele, a refação refaz no escuro.
    expect(depois.comments.some((x) => /escura demais/.test(x.body))).toBe(true);
    expect(depois.comments.some((x) => x.authorRole === "client")).toBe(true);

    // E EXISTE UMA VERSÃO NOVA DO TEXTO, com o pedido do cliente citado nela.
    const deliverableId = (await prisma.contentRequest.findUniqueOrThrow({ where: { id: pedidoId } })).deliverableId!;
    const versoes = await prisma.deliverableVersion.findMany({
      where: { deliverableId }, orderBy: { number: "asc" },
    });
    expect(versoes.length, "o ajuste produz uma versão nova").toBeGreaterThanOrEqual(1);
    expect(versoes.some((v) => /escura demais/.test(v.note ?? "")), "a versão nova cita o que o cliente pediu").toBe(true);

    // Nenhuma peça foi para o caminho do relógio por causa de um AJUSTE.
    for (const p of agora) expect(p.status, "peça em ajuste não vai ao ar").not.toBe("scheduled");

    // ── 6. O CLIENTE APROVA A VERSÃO NOVA — o ciclo fecha ────────────────
    //
    // Achado 4 da 4ª auditoria: o caso de ajuste terminava sem a SEGUNDA
    // decisão do cliente, que é justamente o que fecha o ciclo. Um ajuste que
    // nunca é aprovado não prova que o cliente conseguiu chegar ao fim.
    const rAprova = await postAprovacao(req("/api/portal/approvals", {
      token: c.token, approvalRequestId: card!.id, action: "approve", authorName: c.nome,
    }));
    expect(rAprova.status, "o cliente consegue aprovar a versão nova pelo portal").toBe(200);

    const fechado = await prisma.approvalRequest.findUniqueOrThrow({ where: { id: card!.id } });
    expect(fechado.status, "a versão nova fica aprovada").toBe("approved");
    expect(fechado.reviewedBy, "aprovação sem autoria do cliente é reprovação imediata").toBe(`client:${c.nome}`);
    expect(fechado.reviewedAt).toBeTruthy();

    // E o que ele aprovou é a imagem NOVA — não a que ele tinha recusado.
    const noFim = await prisma.socialPost.findMany({
      where: { id: { in: posts.map((p) => p.id) } }, orderBy: { createdAt: "asc" },
    });
    expect(noFim[TERCEIRA]!.mediaUrl).toBe(agora[TERCEIRA]!.mediaUrl);
    expect(noFim[TERCEIRA]!.mediaUrl).not.toBe(urlAntes[TERCEIRA]);

    // E ele consegue BAIXAR o arquivo aprovado.
    const baixado = await baixarMidia(noFim[TERCEIRA]!.mediaUrl!, c.token);
    expect(baixado.status).toBe(200);
    expect(baixado.bytes.length).toBeGreaterThan(10_000);

    // ── 7. 🔴 AS QUATRO PEÇAS ANDAM (Auditor, 5ª rodada, 25/08/2026) ─────
    //
    // O BLOQUEIO do item F, medido por ele contra um controle sem ajuste:
    //
    //              peça 1              peça 2              peça 3     peça 4
    //   ajuste:    revision_requested  revision_requested  scheduled  revision_requested
    //   controle:  scheduled           scheduled           scheduled  scheduled
    //
    // A rota carimbava `revision_requested` em TODAS as peças do cartão. A mira
    // construída na rodada anterior acertava a IMAGEM PAGA e errava o ESTADO —
    // e `ESTADOS_PROMOVIVEIS` (`esteira/publicacao.ts`) não inclui esse estado,
    // de propósito. Resultado: **três quartos do que o cliente pagou e aprovou
    // nunca entravam na fila de entrega**. Em silêncio.
    //
    // É o espelho do risco 4 do plano ("refação sem mira"), do outro lado.
    //
    // E repare no que esta régua NÃO é: não é ler a coluna do ajuste. É medir
    // o mesmo que o Auditor mediu — onde a peça PARA depois de o cliente ter
    // aprovado, que é o que decide se ela vai ao ar ou não.
    const { ESTADO_QUE_A_FILA_LE } = await import("@/lib/agency/esteira/publicacao");
    for (const [i, p] of noFim.entries()) {
      expect(
        p.status,
        `a peça ${i + 1} ficou em '${p.status}' depois de o cliente APROVAR: ` +
        "trabalho pago e aprovado que a fila de entrega nunca lê, sem ninguém ficar vermelho. " +
        "O controle (o mesmo pedido sem ajuste) põe as quatro em 'scheduled'",
      ).toBe(ESTADO_QUE_A_FILA_LE);
    }

    // ── 8. 🟠 A APROVAÇÃO DA VERSÃO NOVA DEIXA RASTRO CANÔNICO ──────────
    //
    // O achado: `TransicaoDeEstado` estourava com
    // `Unique constraint failed on (chaveIdempotencia)` na SEGUNDA decisão do
    // mesmo card, e o erro era engolido como "rastro canônico não gravado
    // (não-fatal)". A chave era `portal:<card>:decisao` — UMA por card, para
    // sempre — e o ciclo do ajuste tem DUAS decisões no mesmo card.
    //
    // O buraco passava porque o teste da RECUSA exige o rastro e o do AJUSTE
    // não pedia: a única decisão que roda duas vezes era a única sem régua.
    // A autoria no card sobrevivia; o registro IMUTÁVEL, não.
    const rastros = await prisma.transicaoDeEstado.findMany({
      where: { entidadeTipo: "ApprovalRequest", entidadeId: card!.id },
      orderBy: { criadoEm: "asc" },
    });
    expect(
      rastros.length,
      "o ciclo do ajuste tem DUAS decisões do cliente (pedir a mudança e aprovar a nova) " +
      "e só a primeira deixou registro imutável",
    ).toBe(2);
    // O estado canônico vem do MAPA da casa, não de uma literal copiada para
    // dentro do `expect` — copiar aqui faria a régua ficar verde no dia em que
    // o mapa mudasse e o rastro passasse a dizer outra coisa.
    const { DECISAO_PARA_ESTADO_CANONICO } = await import("@/lib/agency/portal/decisoes-do-portal");
    expect(rastros[0]!.para, "a primeira decisão foi o pedido de ajuste")
      .toBe(DECISAO_PARA_ESTADO_CANONICO.request_revision);
    expect(rastros[1]!.para, "a segunda foi a aprovação da versão nova")
      .toBe(DECISAO_PARA_ESTADO_CANONICO.approve);
    expect(rastros[0]!.para, "e as duas decisões não podem cair no mesmo estado")
      .not.toBe(rastros[1]!.para);
    for (const t of rastros) {
      expect(t.atorId, "registro sem autor não é registro").toBe(`cliente:${c.nome}`);
    }
  }, 900_000);

  it("🟠 A ARTE DO AJUSTE FALHA: o cliente LÊ isso na peça, não só no log", async () => {
    // ═══════════════════════════════════════════════════════════════════════
    // O ACHADO (Auditor, 5ª rodada, 25/08/2026)
    // ═══════════════════════════════════════════════════════════════════════
    //
    // Ele derrubou o gerador DURANTE o ajuste. Por dentro a casa se portou bem:
    // o card corretamente NÃO reabriu, e a equipe foi escalada com boa mensagem
    // (`refacao_escalada`, com dono e próxima ação).
    //
    // Mas na TELA do cliente a peça 3 exibia o **texto refeito** sobre a
    // **imagem que ele acabara de recusar**. Ele varreu o HTML inteiro: **zero**
    // ocorrências de "não consegui", "não foi possível", "equipe", "erro",
    // "problema".
    //
    // A mensagem do commit anterior afirmava "o cliente lê a frase honesta".
    // **Ele não lia.** A frase ia para a aba de MENSAGENS e para o log. É a
    // mesma classe do aviso "sem árbitro" que ficava na coluna e nunca virava
    // pixel — corrigido ali e repetido aqui.
    //
    // ── A PERGUNTA OBRIGATÓRIA ────────────────────────────────────────────
    // *O teste alcança o que o cliente de verdade vê?* Se a resposta for "a
    // coluna" ou "o log", errou de novo. Então esta régua tem DUAS pernas e
    // nenhuma delas é a coluna: o card sai pela PORTA REAL do portal, e o
    // componente REAL é montado com ele. O que se afirma é o HTML.
    const c = await abrirClienteFicticio("Padaria da Arte que Não Saiu");
    await pagar(c, 9900);
    const { pedidoId } = await pedirPeloPortal(c);
    const { posts, card } = await pecasDoPedido(pedidoId);
    expect(posts.length).toBe(4);
    const TERCEIRA = 2;
    const urlAntes = posts.map((p) => p.mediaUrl!);

    // O gerador cai NO MEIO DO AJUSTE — depois de a peça já existir. É esta
    // ordem que produz o defeito: o texto é refeito, a imagem não.
    const renderizar = await import("@/lib/agency/design/renderizar");
    const espiao = vi.spyOn(renderizar, "renderizadorDisponivel")
      .mockResolvedValue({ disponivel: false, caminho: null });

    let naTela = "";
    try {
      const r = await postAprovacao(req("/api/portal/approvals", {
        token: c.token, approvalRequestId: card!.id, action: "request_revision",
        comment: "A terceira peça está escura demais, quero ela mais clara.", authorName: c.nome,
      }));
      expect(r.status).toBe(200);

      const agora = await prisma.socialPost.findMany({
        where: { id: { in: posts.map((p) => p.id) } }, orderBy: { createdAt: "asc" },
      });

      // Controle: o cenário é MESMO o que o Auditor montou — a arte não saiu.
      expect(
        agora[TERCEIRA]!.mediaUrl,
        "este teste só vale se a arte realmente NÃO saiu; com arte nova ele mediria outro caso",
      ).toBe(urlAntes[TERCEIRA]);

      // ═══════════════════════════════════════════════════════════════════
      // ⚠️ ESTA AFIRMAÇÃO VIROU AO CONTRÁRIO EM 26/08/2026 — e a inversão é o
      //    conserto, não uma concessão.
      // ═══════════════════════════════════════════════════════════════════
      //
      // Ela dizia: `not.toBe("pending")` — "o card não reabre com a arte
      // recusada". A INTENÇÃO estava certa e continua valendo: a casa não
      // CONVIDA o cliente a aprovar de novo a mesma imagem, e é por isso que a
      // peça segue em `revision_requested` (inagendável) e a tela dele carrega,
      // logo abaixo, a frase que diz que a imagem ainda é a anterior.
      //
      // Mas "não convidar" tinha virado "NÃO DEIXAR". Medido em produção com
      // cliente oculto (26/08/2026): com o card carimbado, `POST
      // /api/portal/approvals` passava a devolver **409 "já decidido"** para
      // aprovar, RECUSAR e CANCELAR. O cliente ficava preso — sem arquivo novo
      // e sem nenhuma saída — numa entrega de quatro peças que ele já pagou.
      // Um clique em "pedir ajuste" comia o direito de decidir.
      //
      // Pedir ajuste não pode consumir o direito de decidir a peça que já está
      // na mão dele. O card volta a ser decidível; o que muda é o que a TELA
      // diz — e é isso que as asserções de HTML abaixo continuam cobrando.
      const cardDepois = await prisma.approvalRequest.findUniqueOrThrow({ where: { id: card!.id } });
      expect(cardDepois.status, "o cliente não pode ficar preso: a porta continua aberta").toBe("pending");

      // ── A PORTA REAL DO PORTAL ─────────────────────────────────────────
      const { GET: portalData } = await import("@/app/api/brain/portal-data/route");
      const resposta = await portalData(
        new NextRequest(`http://local/api/brain/portal-data?token=${c.token}`),
      );
      expect(resposta.status, "a porta real do portal responde").toBe(200);
      const dados = await resposta.json();
      const cardDoPortal = (dados.approvals ?? []).find((a: { id: string }) => a.id === card!.id);
      expect(cardDoPortal, "o card chega ao portal do cliente").toBeTruthy();
      expect(cardDoPortal.pecas.length, "e chega COM as peças").toBe(4);

      // ── O COMPONENTE REAL, MONTADO COM O CARD REAL ─────────────────────
      const { createElement } = await import("react");
      const { renderToStaticMarkup } = await import("react-dom/server");
      const { AprovacoesDoCliente } = await import("@/components/portal/AprovacoesDoCliente");
      naTela = renderToStaticMarkup(
        createElement(AprovacoesDoCliente, {
          aprovacoes: [cardDoPortal],
          token: c.token,
          abertaId: cardDoPortal.id,
          onAbrir: () => {},
          enviando: false,
          erro: null,
          onDecidir: async () => true,
        }),
      );
    } finally {
      espiao.mockRestore();
    }

    if (GUARDAR_EVIDENCIA) {
      mkdirSync(PASTA_DE_EVIDENCIA, { recursive: true });
      writeFileSync(`${PASTA_DE_EVIDENCIA}/tela-do-cliente-arte-do-ajuste-nao-saiu.html`, naTela, "utf8");
    }

    const soTexto = naTela.replace(/<[^>]+>/g, " ");

    // Controle: a tela que estamos medindo é MESMO a tela da peça.
    expect(soTexto, "esta é a tela em que o cliente vê as peças").toMatch(/Peça 3 de 4/);

    // ── AS PALAVRAS QUE ELE PROCUROU E NÃO ACHOU ───────────────────────
    expect(
      soTexto,
      "o cliente está vendo o texto refeito sobre a imagem que ele acabou de recusar, " +
      "e nada na TELA dele diz isso",
    ).toMatch(/não consegui gerar a imagem nova/i);
    expect(soTexto, "e a tela diz o que NÃO mudou — a imagem ainda é a anterior")
      .toMatch(/a imagem desta peça ainda é a anterior/i);

    // MOTIVO, DONO E PRÓXIMA AÇÃO — as três, com estas palavras (critério F).
    expect(soTexto, "dono").toMatch(/equipe de produção/i);
    expect(soTexto, "próxima ação").toMatch(/próxima ação/i);

    // E o aviso não pode se disfarçar de "refizemos".
    expect(soTexto, "e não promete o que não entregou")
      .toMatch(/não vou te pedir para aprovar de novo/i);

    // ── A PARADA É SÓ DA PEÇA PARADA ───────────────────────────────────
    // Alarme nas quatro ensinaria o cliente a ignorar o alarme — e aí ele
    // ignora o da vez em que importa.
    const avisos = (soTexto.match(/A IMAGEM DESTA PEÇA AINDA É A ANTERIOR/gi) ?? []).length;
    expect(avisos, "só a peça apontada está parada; as outras três não podem alarmar").toBe(1);
  }, 900_000);

  it("comentário é OBRIGATÓRIO no ajuste — sem as palavras do cliente não se refaz", async () => {
    const c = await abrirClienteFicticio("Padaria do Ajuste Mudo");
    await pagar(c, 9900);
    const { pedidoId } = await pedirPeloPortal(c);
    const { card } = await pecasDoPedido(pedidoId);

    const r = await postAprovacao(req("/api/portal/approvals", {
      token: c.token, approvalRequestId: card!.id, action: "request_revision", authorName: c.nome,
    }));
    expect(r.status).toBe(400);
    expect((await prisma.approvalRequest.findUniqueOrThrow({ where: { id: card!.id } })).status).toBe("pending");
  }, 600_000);
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO DE RECUSA
// ═══════════════════════════════════════════════════════════════════════════

describe("caso de recusa — a peça não entra na fila de publicação", () => {
  it("o cliente recusa com motivo: nada é agendado e nada é publicado", async () => {
    const c = await abrirClienteFicticio("Padaria da Recusa");
    await pagar(c, 9900);
    const { pedidoId } = await pedirPeloPortal(c);
    const { posts, card } = await pecasDoPedido(pedidoId);

    const r = await postAprovacao(req("/api/portal/approvals", {
      token: c.token, approvalRequestId: card!.id, action: "reject",
      comment: "Não é essa a linha que eu quero para a padaria. Nunca use fundo escuro nas nossas peças.", authorName: c.nome,
    }));
    expect(r.status).toBe(200);

    // ── A RECUSA FICA RECUSADA (25/08/2026) ───────────────────────────────
    //
    // Até esta data `/api/portal/approvals` mandava "recusar" e "pedir ajuste"
    // para a MESMA função: refazia com IA, criava versão nova e REABRIA o card
    // em "pending". Em nenhum produto da casa a recusa ficava recusada — o
    // cliente dizia não e a máquina respondia "então faça de novo".
    const depois = await prisma.approvalRequest.findUniqueOrThrow({ where: { id: card!.id } });
    expect(depois.status, "o estado FICA recusado — a máquina não reabre").toBe("rejected");
    expect(depois.reviewedBy, "recusa sem autor não é recusa").toBe(`client:${c.nome}`);
    expect(depois.reviewedAt).toBeTruthy();

    // A DECISÃO DEIXA RASTRO, com autoria e com o motivo do cliente.
    const decisoes = await prisma.transicaoDeEstado.findMany({
      where: { entidadeId: card!.id, entidadeTipo: "ApprovalRequest" },
    });
    expect(decisoes.length).toBeGreaterThan(0);
    expect(decisoes[0]!.atorId).toBe(`cliente:${c.nome}`);
    expect(decisoes[0]!.motivo ?? "").toMatch(/linha que eu quero/);

    const comentarios = await prisma.approvalComment.findMany({ where: { approvalRequestId: card!.id } });
    expect(comentarios.some((x) => /linha que eu quero/.test(x.body))).toBe(true);

    // ── NENHUMA VERSÃO NOVA FOI FABRICADA ────────────────────────────────
    // É a metade que prova que a máquina PAROU: recusar não dispara refação.
    const entrega = (await prisma.contentRequest.findUniqueOrThrow({ where: { id: pedidoId } })).deliverableId!;
    const versoes = await prisma.deliverableVersion.findMany({ where: { deliverableId: entrega } });
    expect(versoes.length, "recusa NÃO manda a máquina tentar de novo sozinha").toBe(0);

    // A entrega fica carimbada como recusada PELO CLIENTE — não como reprovada
    // pela Qualidade, que é outro problema com outro conserto.
    const { REVISION_STATUS_DA_RECUSA } = await import("@/lib/agency/esteira/refacao");
    const deliverable = await prisma.deliverable.findUniqueOrThrow({ where: { id: entrega } });
    expect(deliverable.revisionStatus).toBe(REVISION_STATUS_DA_RECUSA);
    expect(deliverable.clientFeedback ?? "").toMatch(/linha que eu quero/);

    // ── AS PEÇAS SAEM DO CAMINHO DO RELÓGIO, COM ESTADO PRÓPRIO ──────────
    const { STATUS_DA_PECA_RECUSADA } = await import("@/lib/agency/portal/decisoes-do-portal");
    for (const p of await prisma.socialPost.findMany({ where: { id: { in: posts.map((x) => x.id) } } })) {
      expect(p.status, "peça recusada tem estado próprio, não 'em ajuste'").toBe(STATUS_DA_PECA_RECUSADA);
      // "scheduled" é o ÚNICO estado que `publicarAgendados` lê.
      expect(p.status).not.toBe("scheduled");
      expect(p.publishedAt, "nada foi publicado").toBeNull();
      expect(p.externalPostId).toBeNull();
    }

    // ── O PM RECEBE A PRÓXIMA AÇÃO ───────────────────────────────────────
    const escalado = await prisma.activityEvent.findMany({
      where: { clientId: c.clientId },
    });
    expect(
      escalado.some((e) => /RECUSOU/.test(e.message ?? "") && /PRÓXIMA AÇÃO/.test(e.message ?? "")),
      "recusa sem próxima ação é peça engavetada",
    ).toBe(true);

    // ── A RECUSA VIRA REGRA ──────────────────────────────────────────────
    // O que ele recusou não pode reaparecer na peça seguinte. O ajuste já
    // registrava proibição desde 06/08; a recusa não registrava nada, porque
    // nem chegava a este caminho. Agora registra — com origem própria, para que
    // "o que ele já RECUSOU?" seja uma pergunta respondível.
    const { lerProibicoes } = await import("@/lib/agency/esteira/proibicoes");
    const proibicoes = await lerProibicoes(c.clientId);
    expect(proibicoes.lidas, "leitura fail-closed: não lida NÃO é 'não há'").toBe(true);
    expect(
      proibicoes.itens.some((x) => /fundo escuro/i.test(x.frase ?? "") || x.termos.some((t) => /fundo escuro/i.test(t))),
      "a recusa do cliente virou regra para as próximas peças",
    ).toBe(true);
    expect(
      proibicoes.itens.some((x) => x.origem === "recusa"),
      "e ficou marcada como vinda de uma RECUSA, não de um ajuste",
    ).toBe(true);
  }, 600_000);
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO DE FALHA — NENHUMA TERMINA EM `done`
// ═══════════════════════════════════════════════════════════════════════════

describe("caso de falha — a corrente para com motivo, e nunca com falso entregue", () => {
  it("SEM RENDERIZADOR: para ANTES de gastar imagem, e o pedido não fica entregue", async () => {
    const c = await abrirClienteFicticio("Padaria Sem Chromium");
    await pagar(c, 9900);

    // O renderizador some — a falha que já quebrou nesta casa, e que fez a peça
    // sair como foto crua sem ninguém perceber.
    const renderizar = await import("@/lib/agency/design/renderizar");
    const espiao = vi.spyOn(renderizar, "renderizadorDisponivel")
      .mockResolvedValue({ disponivel: false, caminho: null });
    const design = await import("@/lib/ai/design-engine");
    const gastosAntes = vi.mocked(design.generateDesign).mock.calls.length;

    try {
      const { pedidoId } = await pedirPeloPortal(c);
      const { pedido, posts, card } = await pecasDoPedido(pedidoId);

      expect(pedido.status, "nenhuma falha termina em 'entregue'").not.toBe("entregue");
      expect(pedido.declineReason ?? "").toMatch(/Chromium|renderizad/i);
      expect(card, "nenhum arquivo inválido é apresentado ao cliente").toBeNull();
      expect(posts.length, "nenhuma peça órfã foi criada").toBe(0);
      // O DINHEIRO: nenhuma imagem foi paga depois da porta fechada.
      expect(vi.mocked(design.generateDesign).mock.calls.length).toBe(gastosAntes);

      const tarefa = await prisma.task.findUnique({ where: { id: pedido.taskId! } });
      expect(tarefa?.status, "a tarefa não vira done").not.toBe("done");
    } finally {
      espiao.mockRestore();
    }
  }, 600_000);

  it("PEÇA SEM TÍTULO para a corrente — não vai capenga para o portal", async () => {
    // `comporComMolde` DEGRADA de propósito quando a chamada não vira pixel: a
    // peça sai só com a foto e a assinatura, e a degradação fica declarada em
    // `lastError`. Para o calendário isso está certo — uma peça a menos no mês
    // é pior que uma peça sem headline.
    //
    // Para um produto que o cliente PEDIU e PAGOU, não: o estado do banco não
    // denuncia nada (`mediaUrl` preenchido), o cartão mostra uma imagem, e ele
    // aprova sem ver o buraco. Decisão do CEO: a corrente PARA.
    //
    // A alavanca é o rasterizador reprovando a letra por CONTEÚDO — o caminho
    // real dessa degradação, não um atalho de teste.
    const c = await abrirClienteFicticio("Padaria Sem Título");
    await pagar(c, 9900);

    const renderizar = await import("@/lib/agency/design/renderizar");
    const espiao = vi.spyOn(renderizar, "renderizarHtml").mockResolvedValue({
      ok: false, motivo: "texto_cortado", erro: "o título não coube depois de encolher",
    });

    try {
      const { pedidoId } = await pedirPeloPortal(c);
      const { pedido, card } = await pecasDoPedido(pedidoId);

      expect(pedido.status, "peça sem título NUNCA vira entrega").not.toBe("entregue");
      expect(pedido.declineReason ?? "").toMatch(/SEM TÍTULO|só com a foto/i);
      expect(card, "o cliente não é chamado a aprovar peça capenga").toBeNull();
    } finally {
      espiao.mockRestore();
    }
  }, 600_000);

  it("TEXTO NA ZONA MORTA para a corrente — a frase da margem é MERECIDA, não copiada", async () => {
    // O cartão do cliente afirma que o texto foi conferido contra a área segura
    // do Instagram. Esta é a prova de que a afirmação tem lastro: quando o
    // rasterizador REPROVA por invasão da zona morta (`texto_na_zona_morta` —
    // o motivo real, medido no DOM), a corrente para e o cartão não nasce.
    //
    // Sem isto, a frase seria conclusão sem régua indo para a tela do cliente.
    const c = await abrirClienteFicticio("Padaria da Zona Morta");
    await pagar(c, 9900);

    const renderizar = await import("@/lib/agency/design/renderizar");
    const espiao = vi.spyOn(renderizar, "renderizarHtml").mockResolvedValue({
      ok: false, motivo: "texto_na_zona_morta",
      erro: "o título caiu sob a barra de progresso do Instagram",
    });

    try {
      const { pedidoId } = await pedirPeloPortal(c);
      const { pedido, card } = await pecasDoPedido(pedidoId);
      expect(pedido.status, "peça com texto na zona morta NUNCA vira entrega").not.toBe("entregue");
      expect(card, "e o cliente não recebe cartão nenhum afirmando margem respeitada").toBeNull();
    } finally {
      espiao.mockRestore();
    }
  }, 600_000);

  it("BRIEFING INCOMPLETO para ANTES de gastar: sem chamada para ação, pergunta", async () => {
    // Item B do contrato: "o briefing mínimo é cobrado ANTES da produção".
    // Estava inteiro descoberto — a casa produzia e descobria a falta depois de
    // já ter gasto IA e imagem.
    //
    // O que sai daqui é uma SOLICITAÇÃO ACIONÁVEL: a pergunta chega ao cliente
    // com exemplos do que responder.
    const c = await abrirClienteFicticio("Padaria Sem Chamada");
    await pagar(c, 9900);

    const geradorDeTexto = await import("@/lib/ai/generate");
    const design = await import("@/lib/ai/design-engine");
    const textosAntes = vi.mocked(geradorDeTexto.generate).mock.calls.length;
    const imagensAntes = vi.mocked(design.generateDesign).mock.calls.length;

    const r = await postPedido(req("/api/portal/pedidos", {
      token: c.token,
      // O que comunicar e o objetivo estão lá. A CHAMADA PARA AÇÃO, não —
      // e não está em NENHUM dos dois campos. Desde 25/08/2026 a régua procura
      // a ação também no objetivo (achado 6.7 do Auditor), então o objetivo
      // usado aqui não pode ser o do caso normal: `OBJETIVO_DO_CLIENTE` diz
      // "conhecer o pão", e "conhecer" É uma chamada para ação. Um objetivo
      // que só descreve intenção da marca é o que isola a falta de verdade.
      descricao: "Quero 4 stories verticais para o Instagram da padaria falando do pão de fermentação natural.",
      objetivo: "aumentar a presença digital da padaria no bairro",
    }));
    const corpo = await r.json() as Record<string, unknown>;
    const pedidoId = (corpo.pedido as Record<string, unknown>).id as string;

    // O orçamento é aceito — o portão do briefing é DEPOIS do aceite e ANTES da
    // produção, que é exatamente onde o critério o quer.
    const emEspera = await prisma.contentRequest.findUniqueOrThrow({ where: { id: pedidoId } });
    if (emEspera.quoteStatus === "pendente") {
      await postOrcamento(req("/api/portal/pedidos/orcamento", {
        token: c.token, pedidoId, decisao: "aceito",
      }));
    }

    const { pedido, posts, card } = await pecasDoPedido(pedidoId);
    expect(pedido.status, "sem briefing mínimo não se produz").not.toBe("entregue");
    expect(pedido.status).toBe("precisa_decisao");
    // A PERGUNTA é acionável: diz o que falta e dá exemplos do que responder.
    expect(pedido.declineReason ?? "").toMatch(/O QUE VOCÊ QUER QUE A PESSOA FAÇA/i);
    expect(pedido.declineReason ?? "").toMatch(/WhatsApp|loja|link da bio/i);

    expect(posts.length, "nenhuma peça criada").toBe(0);
    expect(card, "e o cliente não é chamado a decidir sobre nada").toBeNull();

    // ── O DINHEIRO: NADA FOI GASTO ────────────────────────────────────────
    // Nem imagem, nem UMA chamada de texto ao especialista. O portão roda antes
    // do primeiro `generate` da produção.
    expect(
      vi.mocked(design.generateDesign).mock.calls.length,
      "nenhuma imagem paga",
    ).toBe(imagensAntes);
    // A triagem usa `generate` (classificação); a PRODUÇÃO não chegou a usar.
    // Uma chamada a mais que a da triagem já seria o especialista tendo rodado.
    expect(
      vi.mocked(geradorDeTexto.generate).mock.calls.length - textosAntes,
      "só a triagem falou com o modelo — o especialista nem foi acionado",
    ).toBeLessThanOrEqual(1);
  }, 600_000);

  it("CONTRASTE INSUFICIENTE da marca para a corrente — antes de gastar imagem", async () => {
    // `tintaSobre` ESCOLHE a tinta; até agora ninguém CONFERIA o resultado. O
    // cinza médio é o caso de livro: a heurística escolhe branco e entrega
    // 3,95:1 — abaixo do piso — em silêncio. A peça sai legível na tela de quem
    // a produziu e ilegível na de quem a lê.
    const c = await abrirClienteFicticio("Padaria do Cinza");
    await pagar(c, 9900);
    // A marca deste cliente cai exatamente naquela faixa.
    await prisma.brandBrain.updateMany({
      where: { clientId: c.clientId },
      data: { primaryColor: "#808080", secondaryColor: "#909090" },
    });

    const design = await import("@/lib/ai/design-engine");
    const imagensAntes = vi.mocked(design.generateDesign).mock.calls.length;

    const { pedidoId } = await pedirPeloPortal(c);
    const { pedido, posts, card } = await pecasDoPedido(pedidoId);

    expect(pedido.status, "marca que não dá contraste NÃO vira entrega").not.toBe("entregue");
    // A frase tem o NÚMERO e o dono — quem conserta precisa saber de quanto
    // para quanto, e de quem é a próxima ação.
    expect(pedido.declineReason ?? "").toMatch(/3\.95:1/);
    expect(pedido.declineReason ?? "").toMatch(/Brand Hub/);
    expect(card, "e o cliente não é chamado a aprovar peça ilegível").toBeNull();
    expect(posts.length, "nenhuma peça criada").toBe(0);
    expect(
      vi.mocked(design.generateDesign).mock.calls.length,
      "nem uma imagem paga: cor de marca é dado de cadastro, se descobre de graça",
    ).toBe(imagensAntes);
  }, 600_000);

  it("MATERIAL JÁ ENVIADO não é pedido de novo — o produtor sabe o que já chegou", async () => {
    // ── O laço cruel que isto impede ─────────────────────────────────────
    // O cliente manda o logo, a produção retoma, o campo continua vazio e o
    // especialista pede o logo DE NOVO. Ele é cobrado para sempre por algo que
    // já entregou. `materiaisEntregues` existe para isso — e o Auditor apontou
    // que ninguém exercitava.
    //
    // O que se afirma aqui é a metade MENSURÁVEL: o fato de que o material já
    // entregue CHEGA ao produtor. O que o modelo faz com o fato é opinião dele,
    // e opinião não se afirma em teste.
    const c = await abrirClienteFicticio("Padaria do Material");
    await pagar(c, 9900);

    // O cliente já mandou o logo, e a solicitação já foi atendida.
    await prisma.materialRequest.create({
      data: {
        projectId: c.projectId,
        type: "logo",
        description: "arquivo do logo da padaria",
        status: "received",
      },
    });

    const geradorDeTexto = await import("@/lib/ai/generate");
    vi.mocked(geradorDeTexto.generate).mockClear();

    const { pedidoId } = await pedirPeloPortal(c);
    const { pedido } = await pecasDoPedido(pedidoId);
    expect(pedido.status).toBe("entregue");

    // O prompt do ESPECIALISTA (não o da triagem, não o do juiz) carrega o que
    // já chegou.
    const prompts = vi.mocked(geradorDeTexto.generate).mock.calls
      .map((a) => `${(a[0] as { system?: string }).system ?? ""}\n${(a[0] as { user?: string }).user ?? ""}`);
    const doEspecialista = prompts.filter((t) => !/atendimentoId/.test(t) && !/agente de Qualidade/i.test(t));
    expect(doEspecialista.length, "o especialista foi acionado").toBeGreaterThan(0);
    expect(
      doEspecialista.some((t) => /logo/i.test(t)),
      "o material já entregue tem de chegar a quem produz — senão ele pede de novo",
    ).toBe(true);
  }, 600_000);
});

// ═══════════════════════════════════════════════════════════════════════════
// QUALIDADE — OS TRÊS ESTADOS, E O QUE CADA UM FAZ COM O CLIENTE
// ═══════════════════════════════════════════════════════════════════════════

describe("qualidade — reprovada não chega ao cliente como aprovada", () => {
  it("REPROVADA pela régua de código (sem IA): a peça NÃO chega ao portal", async () => {
    // A reprovação aqui é DETERMINÍSTICA: `conferirReguaDoTexto`, dentro de
    // `auditDeliverable`, barra "a melhor padaria da cidade" (superlativo não
    // sustentável) ANTES de consultar qualquer modelo. Nenhum dublê pode
    // convencê-la — é por isso que ela é a prova certa deste critério.
    const c = await abrirClienteFicticio("Padaria do Superlativo");
    await pagar(c, 9900);
    roteiro.peca = "superlativo";

    try {
      const { pedidoId } = await pedirPeloPortal(c);
      const { pedido, posts, card } = await pecasDoPedido(pedidoId);

      expect(pedido.status, "peça reprovada NUNCA vira entrega").not.toBe("entregue");
      expect(card, "reprovada pela Qualidade não chega ao cliente").toBeNull();
      expect(posts.length, "e não gastou imagem: a Qualidade barra antes da arte").toBe(0);

      // A parada é declarada, com dono e próxima ação.
      expect(pedido.declineReason ?? "").toMatch(/revis|reprov|não foi entregue/i);

      // E o rastro nomeia QUEM barrou — sem isso, a equipe discute com o juiz
      // uma recusa que não é dele.
      const eventos = await prisma.activityEvent.findMany({ where: { clientId: c.clientId } });
      expect(
        eventos.some((e) => /qualidade_reprovou|piso_de_verdade_barrou|regua/i.test(e.type ?? "")),
        "a reprovação deixa rastro com o nome de quem barrou",
      ).toBe(true);
    } finally {
      roteiro.peca = "boa";
    }
  }, 600_000);

  it("SEM ÁRBITRO: o CLIENTE lê que ninguém julgou — coluna gravada não é cliente informado", async () => {
    // ── O QUE FOI MEDIDO CONTRA MIM (25/08/2026) ─────────────────────────
    //
    // A versão anterior deste teste olhava SÓ a coluna interna
    // (`revisionStatus = nao_auditado`) e o evento. E a coluna estava certa —
    // enquanto isso o pedido virava `entregue`, o cartão abria e quatro peças
    // iam para a mesa do cliente **sem uma palavra dizendo que ninguém as
    // julgou**. Régua mirada no irmão, de novo.
    //
    // O critério D tem DUAS metades: estado próprio **e não como aprovação**.
    // A segunda só existe se o cliente conseguir LER a diferença.
    const c = await abrirClienteFicticio("Padaria Sem Árbitro");
    await pagar(c, 9900);
    roteiro.juizResponde = false;

    try {
      const { pedidoId } = await pedirPeloPortal(c);
      const { pedido, card } = await pecasDoPedido(pedidoId);

      // ── 1. O ESTADO PRÓPRIO (primeira metade — já valia) ───────────────
      const { REVISION_STATUS_DA_QUALIDADE } = await import("@/lib/agency/execution/quality-auditor");
      const entrega = await prisma.deliverable.findUniqueOrThrow({ where: { id: pedido.deliverableId! } });
      expect(entrega.revisionStatus).toBe(REVISION_STATUS_DA_QUALIDADE.nao_auditado);
      expect(entrega.revisionStatus).not.toBe(REVISION_STATUS_DA_QUALIDADE.aprovado);

      const eventos = await prisma.activityEvent.findMany({ where: { clientId: c.clientId } });
      expect(eventos.some((e) => /qualidade_nao_auditou/.test(e.type ?? ""))).toBe(true);

      // ── 2. E NÃO COMO APROVAÇÃO (a metade que faltava) ─────────────────
      //
      // ⚠️ O QUE FOI MEDIDO CONTRA MIM DE NOVO (Auditor, 25/08/2026) ────────
      //
      // A versão anterior desta metade afirmava sobre `card.reviewNote` — uma
      // COLUNA DO BANCO — e escrevia no comentário "a régua agora olha
      // exatamente o que o cliente vê". Não olhava. O componente do portal
      // descartava o corpo inteiro quando o card tinha peças
      // (`corpo = temPecas ? null : ...`), e o aviso, gravado e correto, nunca
      // virava pixel. Régua verde sobre o componente errado — que é o pior
      // defeito desta casa, porque MATA a dúvida e deixa o furo.
      //
      // Agora a régua tem duas pernas e nenhuma delas é a coluna:
      //
      //   a) o card sai pela PORTA REAL do portal (`GET /api/brain/portal-data`,
      //      a mesma que o navegador do cliente chama, com o token do cliente);
      //   b) o componente REAL (`AprovacoesDoCliente`) é MONTADO com esse card
      //      e o que se afirma é o HTML que sai dele.
      //
      // Se o aviso não estiver na tela, este teste fica vermelho — mesmo com a
      // coluna gravada certinho.
      expect(card, "a casa entrega mesmo sem árbitro — mas não pode entregar calada").toBeTruthy();

      const { GET: portalData } = await import("@/app/api/brain/portal-data/route");
      const resposta = await portalData(
        new NextRequest(`http://local/api/brain/portal-data?token=${c.token}`),
      );
      expect(resposta.status, "a porta real do portal responde").toBe(200);
      const dados = await resposta.json();
      const cardDoPortal = (dados.approvals ?? []).find((a: { id: string }) => a.id === card!.id);
      expect(cardDoPortal, "o card do pedido chega ao portal do cliente").toBeTruthy();
      expect(
        cardDoPortal.pecas.length,
        "e chega COM as peças — é justamente este caso que a tela descartava",
      ).toBeGreaterThan(0);

      // O componente de verdade, montado com o card de verdade. `createElement`
      // e não JSX só porque este arquivo é `.ts`; é o mesmo componente que a
      // página do portal renderiza, sem dublê e sem variante de teste.
      const { createElement } = await import("react");
      const { renderToStaticMarkup } = await import("react-dom/server");
      const { AprovacoesDoCliente } = await import("@/components/portal/AprovacoesDoCliente");
      const naTela = renderToStaticMarkup(
        createElement(AprovacoesDoCliente, {
          aprovacoes: [cardDoPortal],
          token: c.token,
          // `abertaId` = o card ABERTO: é a tela em que os botões Aprovar /
          // Solicitar ajustes / Recusar aparecem. Se o aviso não estiver AQUI,
          // ele não existe no momento em que o cliente decide.
          abertaId: cardDoPortal.id,
          onAbrir: () => {},
          enviando: false,
          erro: null,
          onDecidir: async () => true,
        }),
      );

      // Controle: a tela que estamos medindo é MESMO a tela de decisão.
      expect(naTela, "esta é a tela em que o cliente aprova").toContain("Aprovar");

      // A evidência que uma PESSOA pode abrir: o HTML que saiu do componente,
      // com o card que veio da porta real. Produzida pela corrente, não à mão.
      if (GUARDAR_EVIDENCIA) {
        mkdirSync(PASTA_DE_EVIDENCIA, { recursive: true });
        writeFileSync(`${PASTA_DE_EVIDENCIA}/tela-do-cliente-sem-arbitro.html`, naTela, "utf8");
      }

      const soTexto = naTela.replace(/<[^>]+>/g, " ");
      expect(
        soTexto,
        "o cliente é chamado a aprovar uma peça que ninguém julgou e nada na TELA dele diz isso",
      ).toMatch(/NÃO PASSOU PELA NOSSA REVISÃO DE QUALIDADE/i);
      expect(soTexto, "e o aviso não pode se disfarçar de aprovação")
        .toMatch(/NÃO quer dizer que a peça está aprovada/i);

      // ── 3. O AVISO VEM ANTES DA PEÇA, NO DOM ───────────────────────────
      // Aviso depois de quatro imagens é aviso que ninguém lê. A ordem medida
      // é a do HTML, não a de uma string do banco.
      const posicaoDoAviso = naTela.search(/NÃO PASSOU PELA NOSSA REVISÃO/i);
      const posicaoDaPrimeiraImagem = naTela.search(/<img[^>]+\/api\/media\//);
      expect(posicaoDoAviso).toBeGreaterThanOrEqual(0);
      expect(posicaoDaPrimeiraImagem, "as peças estão na tela").toBeGreaterThanOrEqual(0);
      expect(
        posicaoDoAviso,
        "conclusão primeiro: o cliente lê o aviso ANTES de ver a peça e decidir",
      ).toBeLessThan(posicaoDaPrimeiraImagem);

      // ── 4. A MUTAÇÃO QUE PROVA A RÉGUA ─────────────────────────────────
      // O mesmo componente, o mesmo card, com o aviso removido do corpo: se a
      // tela fosse cega ao aviso (o defeito de origem), os dois HTMLs seriam
      // iguais. Eles não podem ser.
      const semAviso = renderToStaticMarkup(
        createElement(AprovacoesDoCliente, {
          aprovacoes: [{
            ...cardDoPortal,
            reviewNote: String(cardDoPortal.reviewNote ?? "").replace(
              /⚠️ ATENÇÃO[\s\S]*?revisar primeiro\./,
              "",
            ),
          }],
          token: c.token,
          abertaId: cardDoPortal.id,
          onAbrir: () => {},
          enviando: false,
          erro: null,
          onDecidir: async () => true,
        }),
      );
      expect(
        semAviso,
        "MUTAÇÃO: tirar o aviso do corpo TEM de mudar a tela — se não muda, a tela não lê o aviso",
      ).not.toMatch(/NÃO PASSOU PELA NOSSA REVISÃO/i);
      expect(semAviso.length, "e o resto da tela continua de pé").toBeGreaterThan(500);

    } finally {
      roteiro.juizResponde = true;
    }
  }, 600_000);
});

// ═══════════════════════════════════════════════════════════════════════════
// REENTRADA
// ═══════════════════════════════════════════════════════════════════════════

describe("reentrada não cria segunda peça", () => {
  it("produzir de novo o mesmo pedido devolve o trabalho que já existe", async () => {
    const c = await abrirClienteFicticio("Padaria do Clique Duplo");
    await pagar(c, 9900);
    const { pedidoId } = await pedirPeloPortal(c);
    const antes = await pecasDoPedido(pedidoId);
    expect(antes.posts.length).toBe(4);

    const { produzirPedido } = await import("@/lib/agency/esteira/producao-de-pedido");
    expect((await produzirPedido(pedidoId)).ok).toBe(true);

    const depois = await pecasDoPedido(pedidoId);
    expect(depois.posts.map((p) => p.id), "as MESMAS quatro peças, não oito")
      .toEqual(antes.posts.map((p) => p.id));
    expect(await prisma.approvalRequest.count({ where: { department: `pedido:${pedidoId}` } })).toBe(1);
  }, 600_000);

  it("O RELÓGIO recupera a corrente que MORREU no meio (processo caiu), sem duplicar", async () => {
    // ── O NOME ANTERIOR MENTIA, E O AUDITOR PEGOU ────────────────────────
    //
    // Ele dizia "sem ninguém escrever no banco" — e o teste escrevia. Nome de
    // teste é doutrina, e doutrina que descreve outra coisa é pior que
    // doutrina nenhuma. O nome agora diz o que o teste faz.
    //
    // ── O QUE ESTÁ SENDO REPRODUZIDO, COM PRECISÃO ───────────────────────
    //
    // Falha COM MOTIVO (provedor recusou, arquivo não serve) termina em
    // `precisa_decisao`, e o relógio NÃO a retenta de propósito: parada com
    // dono e próxima ação é para gente resolver, não para a máquina insistir.
    // Isso é afirmado no fim deste teste.
    //
    // O que o relógio recupera é o outro caso: o PROCESSO MORREU no meio —
    // contêiner reiniciado, timeout, deploy no meio da rodada — e o pedido
    // ficou preso em `em_producao` sem ninguém para terminá-lo. Não existe
    // maneira de matar um processo de dentro do próprio processo, então a
    // morte é encenada da única forma possível: deixando no banco exatamente o
    // estado que ela deixa. É encenação declarada, não empurrão disfarçado.
    //
    // ── E O DEFEITO QUE ISTO PEGOU ERA REAL ──────────────────────────────
    //
    // O `where` do despertador exigia `deliverableId: null`, e a corrente
    // visual grava o elo ANTES da arte. Uma corrente morta assim ficava
    // invisível ao relógio PARA SEMPRE.
    const c = await abrirClienteFicticio("Padaria do Relógio");
    await pagar(c, 9900);

    // Primeira passada: o gerador de imagem cai. As peças nascem, o entregável
    // é gravado, e nenhuma peça recebe arquivo.
    const design = await import("@/lib/ai/design-engine");
    vi.mocked(design.generateDesign).mockResolvedValueOnce({
      ok: false, reason: "provider_error", error: "provedor fora do ar",
    } as never);

    const { pedidoId } = await pedirPeloPortal(c);
    const parado = await pecasDoPedido(pedidoId);
    expect(parado.pedido.status, "nenhuma falha termina em 'entregue'").not.toBe("entregue");
    expect(parado.card, "sem arquivo, o cliente não é chamado a decidir").toBeNull();
    expect(parado.posts.length, "as peças existem esperando arquivo").toBe(4);
    expect(parado.pedido.deliverableId, "o elo está gravado — é a chave da retomada").toBeTruthy();

    // ── A PARADA COM MOTIVO NÃO É RETENTADA PELO RELÓGIO ─────────────────
    // Primeiro o relógio bate SOBRE o estado real da falha. Ele não pode mexer:
    // `precisa_decisao` é trabalho de gente.
    const { baterORelogio } = await import("@/lib/agency/despertador");
    expect(parado.pedido.status).toBe("precisa_decisao");
    await baterORelogio();
    const aindaParado = await pecasDoPedido(pedidoId);
    expect(
      aindaParado.pedido.status,
      "parada com dono e próxima ação é para gente — a máquina não insiste sozinha",
    ).toBe("precisa_decisao");
    expect(aindaParado.card).toBeNull();

    // ── AGORA O CASO DO RELÓGIO: O PROCESSO MORREU ───────────────────────
    // Encenação declarada: o estado que uma morte de processo deixa. Nenhuma
    // outra coluna é tocada — nem `deliverableId`, nem tentativas, nem peças.
    const TRAVA_MS = (await import("@/lib/agency/esteira/triagem")).TRAVA_MS;
    await prisma.contentRequest.update({
      where: { id: pedidoId },
      data: { status: "em_producao", updatedAt: new Date(Date.now() - TRAVA_MS - 60_000) },
    });

    await baterORelogio();

    const feito = await pecasDoPedido(pedidoId);
    expect(feito.pedido.status, "o relógio terminou o trabalho sozinho").toBe("entregue");
    expect(feito.card, "e o cliente ganhou onde decidir").toBeTruthy();
    // SEM DUPLICATA — o critério F pede as duas metades juntas.
    expect(feito.posts.map((p) => p.id), "as MESMAS quatro peças, não oito")
      .toEqual(parado.posts.map((p) => p.id));
    expect(await prisma.approvalRequest.count({ where: { department: `pedido:${pedidoId}` } })).toBe(1);
    for (const p of feito.posts) {
      expect(p.format).toBe("story");
      expect((await baixarMidia(p.mediaUrl!, c.token)).status).toBe(200);
    }
  }, 600_000);

  it("RETOMADA de corrente que parou no meio reaproveita as peças — não cria outras quatro", async () => {
    // ── POR QUE ESTE TESTE EXISTE, SEPARADO DO DE CIMA ───────────────────
    //
    // O teste anterior NÃO alcança a idempotência da orquestradora: com card
    // aberto, `produzirPedido` devolve o trabalho pronto no atalho de reentrada
    // e nunca chega à corrente. Provado por mutação — zerar a lista de peças
    // reaproveitadas dentro da porta deixa aquele teste VERDE.
    //
    // Régua verde sobre o componente errado é pior que régua nenhuma. Este
    // teste põe a corrente no estado que realmente importa: peças criadas,
    // arquivo NÃO produzido, nenhum card — e manda produzir de novo.
    const c = await abrirClienteFicticio("Padaria da Retomada");
    await pagar(c, 9900);

    // Primeira passada: o gerador de imagem cai. As quatro peças nascem, e
    // nenhuma recebe arquivo.
    const design = await import("@/lib/ai/design-engine");
    const caiu = vi.mocked(design.generateDesign).mockResolvedValueOnce({
      ok: false, reason: "provider_error", error: "provedor fora do ar",
    } as never);

    const { pedidoId } = await pedirPeloPortal(c);
    const parado = await pecasDoPedido(pedidoId);
    expect(parado.pedido.status, "nenhuma falha termina em 'entregue'").not.toBe("entregue");
    expect(parado.card, "sem arquivo, o cliente não é chamado a decidir").toBeNull();
    expect(parado.posts.length, "as peças existem e estão esperando arquivo").toBe(4);
    expect(parado.pedido.deliverableId, "o elo já está gravado — é a chave da retomada").toBeTruthy();
    caiu.mockReset();

    // A equipe reabre o pedido na caixa de entrada — é a próxima ação que a
    // parada declarou. Daqui em diante quem trabalha é a corrente de sempre.
    await prisma.contentRequest.update({ where: { id: pedidoId }, data: { status: "triado" } });

    const { produzirPedido } = await import("@/lib/agency/esteira/producao-de-pedido");
    const retomada = await produzirPedido(pedidoId);
    expect(retomada.ok, "a retomada conclui").toBe(true);

    const feito = await pecasDoPedido(pedidoId);
    expect(feito.pedido.status).toBe("entregue");
    expect(feito.posts.map((p) => p.id), "as MESMAS quatro peças, não oito")
      .toEqual(parado.posts.map((p) => p.id));
    for (const p of feito.posts) {
      expect(p.format).toBe("story");
      expect(p.mediaUrl, "agora com arquivo").toBeTruthy();
      expect((await baixarMidia(p.mediaUrl!, c.token)).status).toBe(200);
    }
  }, 600_000);
});
