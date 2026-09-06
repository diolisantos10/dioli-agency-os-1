// ─── A TRAVA DE ESCOPO DECLARADO — o preço não pode chutar ─────────────────
//
// Despacho: docs/celula-prospeccao/despachos/2026-09-06-o-preco-nao-pode-chutar.md
//
// `precificar()` cobra o ITEM do catálogo (uma unidade). Ela não sabe se o
// ANÚNCIO pede uma unidade ou um pacote inteiro. As DUAS metades de cada
// trava aqui: barra o problema real medido em produção (a proposta do TikTok
// Shop, R$ 350 para um pedido de ~400 vídeos/mês) E não inventa volume onde
// o anúncio não declarou nenhum.

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/lib/generated/prisma/client";

import { lerEscopoDeclarado } from "@/lib/marketplaces/99freelas/escopo-declarado";
import { extrairProjeto, paraProjetoBruto } from "@/lib/marketplaces/99freelas/coleta";
import { processarProjeto } from "@/lib/marketplaces/99freelas/agente";
import { gravarCandidatura } from "@/lib/marketplaces/99freelas/gravar-candidatura";
import type { Candidatura } from "@/lib/marketplaces/99freelas/agente";
import type { ProjetoColetado } from "@/lib/marketplaces/99freelas/coleta";

const RAIZ = resolve(__dirname, "../..");

// ═══════════════════════════════════════════════════════════════════════════
// 1. lerEscopoDeclarado — puro, sem IA
// ═══════════════════════════════════════════════════════════════════════════
describe("lerEscopoDeclarado", () => {
  it("o projeto REAL do TikTok Shop (extraído do fixture, não recopiado à mão) ⇒ volume", () => {
    const html = readFileSync(
      resolve(RAIZ, "__tests__/fixtures/99freelas/projeto-781493-2026-09-06.html"),
      "utf8",
    );
    const coletado = extrairProjeto(html, "https://www.99freelas.com.br/project/edicao-de-videos-curtos-para-tiktok-shop-781493");
    expect(coletado).not.toBeNull();
    const bruto = paraProjetoBruto(coletado!);

    const escopo = lerEscopoDeclarado(bruto.conteudoDeTerceiro);
    expect(escopo.tipo).toBe("volume");
    // O anúncio declara "aproximadamente 400 vídeos por mês" ANTES de
    // qualquer faixa ("20 a 30 vídeos por dia") ou palavra de recorrência
    // ("demanda recorrente") — o sinal mais concreto (quantidade explícita)
    // é o que vence, não o que aparece primeiro no texto.
    if (escopo.tipo === "volume") {
      expect(escopo.quantidade).toBe(400);
      expect(escopo.porQue).toMatch(/400/);
    }
  });

  it("um anúncio unitário claro NÃO vira volume — a metade que prova que não trava todo mundo", () => {
    const texto = [
      "Logotipo e identidade visual para padaria de bairro",
      "",
      "Precisamos de um logotipo novo, com aplicação em fachada, sacola e cartão de visita.",
      "A padaria funciona há 12 anos e nunca teve marca formalizada. Queremos manter o azul",
      "da fachada atual na nova marca, e o material final deve ser entregue em arquivo aberto.",
      "",
      "Categoria: Design & Criação",
    ].join("\n");
    expect(lerEscopoDeclarado(texto)).toEqual({ tipo: "unitario" });
  });

  it("texto sem NENHUM sinal de volume não inventa volume, mesmo tendo números soltos", () => {
    // "20 dias" (prazo) e "R$ 1.200" (orçamento) são números que não são
    // quantidade de peça nenhuma — uma trava ingênua por "qualquer dígito"
    // acertaria aqui por acidente e erraria no primeiro projeto real.
    const texto =
      "Precisamos de uma identidade visual completa para a nossa padaria de bairro, " +
      "que existe há doze anos e nunca teve marca formalizada. Queremos manter o azul " +
      "da fachada. Precisa servir para embalagem, sacola, fachada e redes sociais. " +
      "O prazo é de 20 dias e o orçamento previsto é de R$ 1.200.";
    expect(lerEscopoDeclarado(texto)).toEqual({ tipo: "unitario" });
  });

  it("periodicidade declarada em PALAVRA, sem número por perto, é RECORRENTE — não volume, não unitário", () => {
    const texto = "Buscamos parceiro para gestão de redes sociais em regime mensal, com reunião semanal de alinhamento.";
    const escopo = lerEscopoDeclarado(texto);
    expect(escopo.tipo).toBe("recorrente");
    if (escopo.tipo === "recorrente") expect(escopo.porQue).toMatch(/mensal/i);
  });

  it("ausência total de texto não vira volume por acidente de regex", () => {
    expect(lerEscopoDeclarado("")).toEqual({ tipo: "unitario" });
    expect(lerEscopoDeclarado("   ")).toEqual({ tipo: "unitario" });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. processarProjeto — recusa precificar quando o escopo excede o item
// ═══════════════════════════════════════════════════════════════════════════
describe("processarProjeto respeita o escopo declarado antes de montar a candidatura", () => {
  it("o projeto REAL do TikTok Shop ⇒ desfecho PARADO, ofertaADigitar NULL — mas texto e preço ficam para o diagnóstico do CEO", async () => {
    const html = readFileSync(
      resolve(RAIZ, "__tests__/fixtures/99freelas/projeto-781493-2026-09-06.html"),
      "utf8",
    );
    const coletado = extrairProjeto(html, "https://www.99freelas.com.br/project/edicao-de-videos-curtos-para-tiktok-shop-781493");
    const bruto = paraProjetoBruto(coletado!);

    const TEXTO_REDIGIDO = "Proposta para o pedido de edição de vídeos curtos, específica para o escopo descrito.";
    const c = await processarProjeto(bruto, {
      workspaceId: "w-teste",
      conexoesGastasNoMes: 0,
      redigirProposta: async () => ({ ok: true as const, texto: TEXTO_REDIGIDO, item: "copy", nota: 75 }),
    });

    expect(c.desfecho).toBe("parado");
    // Nunca ofereça um número que a casa não sabe defender.
    expect(c.ofertaADigitar).toBeNull();
    // Mas o diagnóstico não some: o CEO precisa ler o quê e o porquê.
    expect(c.texto).toBe(TEXTO_REDIGIDO);
    expect(c.preco).not.toBeNull();
    expect(c.preco?.ok).toBe(true);
    expect(c.motivo).toMatch(/n[ãa]o h[áa] oferta a digitar/i);
    expect(c.motivo).toMatch(/volume|recorr[êe]ncia/i);
    // Nenhuma multiplicação inventada (350 × 400, ou qualquer outra conta).
    expect(c.motivo).not.toMatch(/\d+\s*[x×]\s*\d+\s*=\s*\d+/);
  });

  it("um projeto UNITÁRIO claro continua aguardando_clique_humano, COM número — a outra metade", async () => {
    // Vocabulário deliberadamente alinhado ao serviço "social-media-pecas"
    // (`lib/agency/celula/catalogo-ofertavel.ts` — "artes de feed, story e
    // carrossel em JPEG, com legenda no tom da marca"), que é REALMENTE
    // ofertável hoje (as duas capacidades de que depende têm ponto de
    // produção real). Um projeto sobre logotipo/identidade visual não serviria
    // aqui: aquela capacidade tem `ponto: null` — o projeto seria ELIMINADO
    // por "fora do que a Dioli entrega hoje" antes de chegar ao escopo
    // declarado, e o teste provaria a trava errada.
    const bruto = {
      url: "https://www.99freelas.com.br/project/carrossel-padaria-1",
      conteudoDeTerceiro: [
        "Carrossel único para o Instagram da nossa padaria de bairro",
        "",
        "Preciso de um carrossel com arte e legenda no tom da marca, aplicando a identidade",
        "visual que já temos hoje. É um projeto pontual, só essa peça mesmo — não é um",
        "serviço contínuo. Prazo de 10 dias e orçamento de referência de R$ 500.",
        "",
        "Categoria: Design & Criação",
      ].join("\n"),
      custoEmConexoesLidoDaTela: 2,
      horasDesdeAPublicacao: 30,
    };

    // Confirma a premissa do teste ANTES de rodar o agente: se o escopo já
    // não fosse `unitario`, este teste provaria outra coisa por acidente.
    expect(lerEscopoDeclarado(bruto.conteudoDeTerceiro)).toEqual({ tipo: "unitario" });

    const c = await processarProjeto(bruto, {
      workspaceId: "w-teste",
      conexoesGastasNoMes: 0,
      redigirProposta: async () => ({
        ok: true as const,
        texto: "Olá! Vi o pedido do carrossel para a padaria e o ponto de já ter a identidade visual pronta. Faço a arte e a legenda no tom da marca, com uma rodada de ajuste incluída. Uma pergunta: vocês já têm as fotos dos produtos ou preciso considerar produção de imagem?",
        item: "carrossel",
        nota: 80,
      }),
    });

    expect(c.desfecho).toBe("aguardando_clique_humano");
    expect(typeof c.ofertaADigitar).toBe("number");
    expect(c.ofertaADigitar).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. gravarCandidatura acompanha — valorSugerido segue ofertaADigitar, NUNCA
//    preco.ofertaADigitar direto (era exatamente esse o bug: um preço
//    unitário indo para o campo "Sua oferta" como se fosse o preço do pacote).
// ═══════════════════════════════════════════════════════════════════════════

// `coleta.ts` NÃO é mockado aqui, de propósito: ao contrário do teste
// original de `gravar-candidatura.test.ts` (escrito quando a extração ainda
// era obra de outro especialista em paralelo), este arquivo já usa
// `extrairProjeto`/`paraProjetoBruto` REAIS acima — e `gravarCandidatura`
// chama exatamente essas mesmas funções por dentro. Mockar o módulo aqui
// substituiria a extração real usada pelos testes 1 e 2 por uma versão
// simplificada, sem ganhar nada em troca.

function subirEsquema(dbPath: string) {
  execFileSync("npx", ["prisma", "migrate", "deploy"], {
    env: { ...process.env, DATABASE_URL: `file:${dbPath}` },
    stdio: "pipe",
  });
}

let pasta = "";
let arquivo = "";
let db: PrismaClient;

beforeEach(async () => {
  pasta = await mkdtemp(path.join(tmpdir(), "escopo-declarado-"));
  arquivo = path.join(pasta, "db.sqlite");
  subirEsquema(arquivo);
  db = new PrismaClient({ adapter: new PrismaLibSql({ url: `file:${arquivo}` }) });
}, 120_000);

afterEach(async () => {
  await db?.$disconnect().catch(() => {});
  await rm(pasta, { recursive: true, force: true });
});

function coletado(overrides: Record<string, unknown> = {}): ProjetoColetado {
  return {
    titulo: "Edição de vídeos curtos para TikTok Shop",
    descricao: "Demanda recorrente de aproximadamente 400 vídeos por mês, pacote mensal.",
    categoria: "Fotografia & AudioVisual",
    subcategoria: "Vídeo - Edição e Produção",
    orcamento: "Aberto",
    orcamentoInformado: null,
    nivel: "Intermediário",
    numeroDePropostas: 1,
    publicadoEm: null,
    valorMinimo: null,
    ...overrides,
  } as unknown as ProjetoColetado;
}

/** A candidatura exatamente como `processarProjeto` devolve para o caso
 *  desta ficha: desfecho `parado`, `ofertaADigitar: null`, mas `preco`
 *  preenchido (o piso do item unitário) para o diagnóstico do CEO. */
function candidaturaDeEscopoDeVolume(): Candidatura {
  return {
    desfecho: "parado",
    url: "https://www.99freelas.com.br/project/edicao-de-videos-curtos-para-tiktok-shop-781493",
    titulo: "Edição de vídeos curtos para TikTok Shop",
    categoriaDeclarada: "Fotografia & AudioVisual",
    texto: "Proposta para o pedido de edição de vídeos, específica para o escopo descrito.",
    ofertaADigitar: null,
    preco: {
      ok: true,
      ofertaADigitar: 350,
      pisoDaCasa: 350,
      pisoDaCategoria: 50,
      pisoQueVenceu: "casa",
      taxaPercentual: 10,
      taxaEmReais: 38.89,
      regime: "ACRESCIMO_AO_CLIENTE",
      ofertaFinalQueOClienteVe: 388.89,
      motivo: "piso da casa aplicado",
    },
    nota: 75,
    saldo: null,
    decisao: null,
    achados: [],
    motivo: 'Não há oferta a digitar: o anúncio pede volume ("400 vídeos"), e a casa só sabe precificar a unidade.',
    competencia: "2026-09",
  };
}

describe("gravarCandidatura — valorSugerido NUNCA vem direto de preco.ofertaADigitar", () => {
  it("caso 1 da ficha: ofertaADigitar é null (escopo de volume) ⇒ valorSugerido gravado é NULL, mesmo com preco.ofertaADigitar = 350", async () => {
    const cand = candidaturaDeEscopoDeVolume();
    expect(cand.ofertaADigitar).toBeNull();
    expect(cand.preco?.ofertaADigitar).toBe(350); // o dado ainda existe — só não vai para "Sua oferta"

    const r = await gravarCandidatura({ workspaceId: "w-escopo-1", coletado: coletado(), candidatura: cand }, db);
    const linha = await db.oportunidade.findUniqueOrThrow({ where: { id: r.id } });

    expect(linha.valorSugerido).toBeNull();
    // O preço unitário continua registrado para diagnóstico — só não é o
    // número oferecido.
    const preco = JSON.parse(linha.precoDetalhe ?? "null");
    expect(preco.ofertaADigitar).toBe(350);
  });

  it("a outra metade: quando ofertaADigitar existe, valorSugerido continua sendo gravado normalmente", async () => {
    const cand: Candidatura = {
      ...candidaturaDeEscopoDeVolume(),
      desfecho: "aguardando_clique_humano",
      ofertaADigitar: 50,
      decisao: {
        veredito: "HUMAN_GATE",
        acao: "enviarProposta",
        plataforma: "99freelas",
        motivo: "Pronto para o clique.",
        razoes: [],
        achadosDeConteudo: [],
        saldo: null,
        politica: { plataforma: "99freelas", versao: "1", verificadaEm: "2026-08-01" },
      },
    };
    const r = await gravarCandidatura({ workspaceId: "w-escopo-2", coletado: coletado(), candidatura: cand }, db);
    const linha = await db.oportunidade.findUniqueOrThrow({ where: { id: r.id } });
    expect(linha.valorSugerido).toBe(50);
  });
});
