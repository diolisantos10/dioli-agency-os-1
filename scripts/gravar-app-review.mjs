// Gravador de screencast do App Review da Meta — 29/08/2026.
//
// POR QUE ESTE SCRIPT EXISTE, E O QUE ELE **NÃO** É
// ─────────────────────────────────────────────────
// O roteiro do CEO (docs/plataformas/meta/roteiro-do-video.md, 15/08) precisa de
// login real no Facebook e de publicação real no Instagram da Dioli. Neste
// ambiente NÃO existe `META_APP_ID`/`META_APP_SECRET`/`META_REDIRECT_URI`, então
// `isMetaConfigured()` é falso e o botão "Conectar" nem monta a URL do OAuth.
//
// Este script grava **só o que é honesto gravar sem conta da Meta**: as telas do
// produto, incluindo o estado real de "não configurado". Ele NUNCA finge conexão,
// NUNCA injeta credencial e NUNCA desenha dado que não veio do banco local.
//
// Uso:
//   node scripts/gravar-app-review.mjs                 # grava todas as cenas
//   node scripts/gravar-app-review.mjs cena-01 cena-03 # grava só algumas
//
// Saída: docs/plataformas/meta/gravacoes/<cena>.webm + quadros PNG.

import { chromium } from "playwright";
import { mkdirSync, existsSync, readdirSync, renameSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const EMAIL = process.env.REC_EMAIL || "master@dioli.studio";
const SENHA = process.env.REC_SENHA;
const OUT = resolve(process.env.REC_OUT || "docs/plataformas/meta/gravacoes");

if (!SENHA) {
  console.error(
    "REC_SENHA não está definida. Este script NÃO inventa senha e NÃO cai num padrão.\n" +
      "Rode com: REC_SENHA='<a senha do seed local>' node scripts/gravar-app-review.mjs",
  );
  process.exit(1);
}

const EXECS = [
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
];

// 1280x720: o mínimo que a Meta pede para screencast legível, e o formato em que
// o revisor vê. Não é escolha estética.
const VIEWPORT = { width: 1280, height: 720 };

mkdirSync(OUT, { recursive: true });

const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

/** Digita devagar, como uma pessoa. Vídeo em que o texto aparece de uma vez
 *  parece automação — e automação em ritmo de máquina foi o que restringiu esta
 *  casa em 03/08. */
async function digitar(page, seletor, texto) {
  await page.click(seletor);
  await page.type(seletor, texto, { delay: 55 });
}

/** Move o mouse até o elemento antes de clicar, para o revisor ver o cursor. */
async function apontarEClicar(page, seletor) {
  const el = await page.waitForSelector(seletor, { timeout: 15000 });
  const box = await el.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 22 });
    await pausa(500);
  }
  await el.click();
}

async function entrar(page) {
  await page.goto(`${BASE}/auth/signin`, { waitUntil: "networkidle", timeout: 45000 });
  await pausa(1400);
  await digitar(page, "#email", EMAIL);
  await pausa(400);
  // A senha vai num campo type="password": a tela mostra pontos, não o texto.
  // Conferido quadro a quadro antes de entregar — ver o documento da entrega.
  await digitar(page, "#password", SENHA);
  await pausa(600);
  await apontarEClicar(page, 'button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith("/auth/signin"), { timeout: 30000 }).catch(() => {});
  await pausa(2000);
  await fecharGuiaDeBoasVindas(page);
}

/** O "Guia do Master" abre por cima do painel no primeiro acesso e tapa a tela
 *  inteira. Sem fechar, TODA cena grava o modal em vez do produto. */
async function fecharGuiaDeBoasVindas(page) {
  const alvos = [
    'button:has-text("Entendi, começar")',
    'button:has-text("Entendi")',
    '[aria-label="Fechar"]',
  ];
  for (const seletor of alvos) {
    const el = await page.$(seletor);
    if (el && (await el.isVisible().catch(() => false))) {
      await el.click().catch(() => {});
      await pausa(1200);
      return true;
    }
  }
  return false;
}

/** Navega e fecha o guia se ele reaparecer. Toda cena passa por aqui. */
async function irPara(page, rota) {
  await page.goto(`${BASE}${rota}`, { waitUntil: "networkidle", timeout: 45000 });
  await pausa(1800);
  await fecharGuiaDeBoasVindas(page);
  await pausa(1200);
}

/** Rola devagar até o fim da página e volta — é assim que o revisor lê a tela. */
async function passearPelaTela(page, voltas = 1) {
  for (let v = 0; v < voltas; v++) {
    const altura = await page.evaluate(() => document.body.scrollHeight);
    const passos = Math.max(1, Math.min(12, Math.round(altura / 320)));
    for (let i = 1; i <= passos; i++) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "smooth" }), (altura / passos) * i);
      await pausa(900);
    }
    await pausa(1200);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await pausa(1400);
  }
}

// ─── As cenas ────────────────────────────────────────────────────────────────
// Cada cena declara QUAL permissão ela cobre. Cena sem permissão declarada não
// entra — vídeo que não prova nada só ocupa o tempo do revisor.

const CENAS = [
  {
    id: "cena-01-entrar-no-produto",
    permissoes: ["(nenhuma — contexto)"],
    descricao: "Login no produto Dioli Digital e abertura do painel da agência.",
    async rodar(page) {
      await entrar(page);
      await pausa(2500);
    },
  },
  {
    id: "cena-02-integracoes-estado-real",
    permissoes: ["pages_show_list", "pages_read_engagement", "instagram_basic"],
    descricao:
      "A tela Ferramentas & Integrações, cartão da Meta. Mostra ONDE o dono do " +
      "negócio conecta a conta e autoriza Página/Instagram. Neste ambiente as " +
      "credenciais do app não existem, então a tela mostra o estado NÃO CONFIGURADO — " +
      "que é a verdade, não um erro do vídeo.",
    async rodar(page) {
      await entrar(page);
      await irPara(page, "/agency/integrations");
      await pausa(1500);
      await passearPelaTela(page);
    },
  },
  {
    id: "cena-03-clientes-e-redes",
    permissoes: ["instagram_basic", "instagram_manage_insights"],
    descricao:
      "Clientes → o cliente → Redes. É a tela que exibe usuário do Instagram, " +
      "foto de perfil, grade de publicações e métricas lidas da Graph API.",
    async rodar(page) {
      await entrar(page);
      await irPara(page, "/agency/clients");
      await pausa(1500);
      await passearPelaTela(page);
    },
  },
  {
    id: "cena-04-planner-publicacao",
    permissoes: ["instagram_content_publish"],
    descricao:
      "Planner — onde a peça aprovada pelo cliente é agendada e onde fica o " +
      "botão que dispara POST /{ig-user-id}/media + /media_publish.",
    async rodar(page) {
      await entrar(page);
      await irPara(page, "/agency/planner");
      await pausa(1500);
      await passearPelaTela(page);
    },
  },
  {
    id: "cena-05-aprovacao-do-cliente",
    permissoes: ["instagram_content_publish (argumento de consentimento)"],
    descricao:
      "Fila de aprovações. É o argumento central do texto de justificativa: " +
      "nada é publicado sem o cliente aprovar, peça por peça.",
    async rodar(page) {
      await entrar(page);
      await irPara(page, "/agency/approvals");
      await pausa(1500);
      await passearPelaTela(page);
    },
  },
  {
    id: "cena-06-desempenho-pago",
    permissoes: ["ads_read"],
    descricao:
      "Desempenho pago — a tela que consome me/adaccounts, /campaigns e /insights.",
    async rodar(page) {
      await entrar(page);
      await irPara(page, "/agency/desempenho-pago");
      await pausa(1500);
      await passearPelaTela(page);
    },
  },
  {
    id: "cena-07-ads-agent",
    permissoes: ["ads_management"],
    descricao:
      "Agente de anúncios — onde o plano de campanha é montado antes de virar " +
      "POST /{ad-account}/campaigns, /adsets, /adcreatives e /ads.",
    async rodar(page) {
      await entrar(page);
      await irPara(page, "/agency/ads-agent");
      await pausa(1500);
      await passearPelaTela(page);
    },
  },
  {
    id: "cena-08-whatsapp",
    permissoes: ["whatsapp_business_messaging", "whatsapp_business_management"],
    descricao:
      "WhatsApp — a caixa de atendimento que consome {phone_id}/messages e a " +
      "tela de modelos que consome {waba}/message_templates.",
    async rodar(page) {
      await entrar(page);
      await irPara(page, "/agency/whatsapp");
      await pausa(1500);
      await passearPelaTela(page);
    },
  },
];

// ─── Execução ────────────────────────────────────────────────────────────────

const pedidas = process.argv.slice(2);
const aRodar = pedidas.length ? CENAS.filter((c) => pedidas.some((p) => c.id.includes(p))) : CENAS;

if (!aRodar.length) {
  console.error(`Nenhuma cena casou com: ${pedidas.join(", ")}`);
  console.error(`Cenas disponíveis:\n${CENAS.map((c) => "  " + c.id).join("\n")}`);
  process.exit(1);
}

// AQUECER AS ROTAS ANTES DE GRAVAR — não é otimização, é conserto de defeito.
// A primeira gravação saiu com ~20 SEGUNDOS de tela branca na frente de cada
// cena: o Next em modo dev compila a rota no primeiro acesso, e a câmera já
// estava rodando. Vídeo que começa com 20s de branco não é vídeo, é espera
// filmada. Aqui a rota é compilada ANTES de o contexto de vídeo existir.
const ROTAS_A_AQUECER = [
  "/auth/signin",
  ...CENAS.flatMap((c) => (String(c.rodar).match(/irPara\(page, "([^"]+)"\)/g) ?? [])
    .map((m) => m.match(/"([^"]+)"/)[1])),
];
process.stdout.write("aquecendo rotas");
for (const rota of [...new Set(ROTAS_A_AQUECER)]) {
  await fetch(BASE + rota, { redirect: "manual" }).catch(() => {});
  process.stdout.write(".");
}
console.log(" ok\n");

let executablePath;
for (const e of EXECS) if (existsSync(e)) { executablePath = e; break; }

const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
const relatorio = [];

try {
  for (const cena of aRodar) {
    const tmpDir = resolve(OUT, `.tmp-${cena.id}`);
    rmSync(tmpDir, { recursive: true, force: true });
    mkdirSync(tmpDir, { recursive: true });

    const ctx = await browser.newContext({
      viewport: VIEWPORT,
      recordVideo: { dir: tmpDir, size: VIEWPORT },
      locale: "pt-BR",
      timezoneId: "America/Sao_Paulo",
    });
    const page = await ctx.newPage();
    const erros = [];
    page.on("pageerror", (e) => erros.push(String(e)));

    const t0 = Date.now();
    let falha = null;
    try {
      await cena.rodar(page);
      // Quadro final em PNG: prova de que a cena chegou onde devia, e o que a
      // conferência de segredo inspeciona sem precisar abrir vídeo.
      await page.screenshot({ path: resolve(OUT, `${cena.id}-quadro-final.png`) });
    } catch (e) {
      falha = String(e?.message ?? e);
    }
    const duracaoMs = Date.now() - t0;

    const video = page.video();
    await ctx.close(); // fecha ANTES de mexer no arquivo — o webm só existe depois
    let destino = null;
    if (video) {
      const bruto = await video.path().catch(() => null);
      const achado = bruto && existsSync(bruto)
        ? bruto
        : readdirSync(tmpDir).map((f) => resolve(tmpDir, f)).find((f) => f.endsWith(".webm"));
      if (achado) {
        destino = resolve(OUT, `${cena.id}.webm`);
        renameSync(achado, destino);
      }
    }
    rmSync(tmpDir, { recursive: true, force: true });

    relatorio.push({
      cena: cena.id,
      permissoes: cena.permissoes,
      segundos: Math.round(duracaoMs / 1000),
      video: destino,
      erroDeJs: erros.length ? erros.slice(0, 3) : null,
      falha,
    });
    console.log(
      `${falha ? "✗" : "✓"} ${cena.id.padEnd(34)} ${String(Math.round(duracaoMs / 1000)).padStart(3)}s  ` +
        `${destino ? "vídeo ok" : "SEM VÍDEO"}${erros.length ? `  · ${erros.length} erro(s) de JS` : ""}` +
        `${falha ? `  · FALHA: ${falha.slice(0, 90)}` : ""}`,
    );
  }
} finally {
  await browser.close();
}

console.log("\n" + JSON.stringify(relatorio, null, 2));
