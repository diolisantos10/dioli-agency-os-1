// ─── gravar-candidatura.test.ts — banco real, sem mockar o Prisma ───────────
//
// `gravarCandidatura` recebe o cliente Prisma por INJEÇÃO (segundo parâmetro),
// então este teste não precisa mockar `@/lib/db/client` — só sobe um SQLite
// temporário pelas migrations reais da casa (mesmo padrão de
// `__tests__/celula/jornada-ponta-a-ponta.test.ts`) e passa o cliente direto.
//
// `lib/marketplaces/99freelas/coleta.ts` é mockado aqui de propósito: é obra
// de outro especialista, construída em paralelo por contrato
// (`extrairLinksDaBusca`, `extrairProjeto`, `paraProjetoBruto`), e este teste
// não pode depender da extração REAL de HTML para provar a gravação. O mock
// de `paraProjetoBruto` só faz o que a assinatura promete: transforma o
// `ProjetoColetado` estruturado num `ProjetoBruto` com `conteudoDeTerceiro` —
// aqui, de forma determinística, a partir de título+descrição+categoria, o
// suficiente para provar dedup por conteúdo (mesmo texto → mesma impressão
// digital; texto diferente → impressão diferente).

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/lib/generated/prisma/client";
import {
  gravarCandidatura,
  REGRA_ENVIO_BLOQUEADO_POR_CUSTO_DESCONHECIDO,
} from "@/lib/marketplaces/99freelas/gravar-candidatura";
import type { Candidatura } from "@/lib/marketplaces/99freelas/agente";
import type { ProjetoColetado } from "@/lib/marketplaces/99freelas/coleta";
import type { Achado } from "@/lib/marketplaces/99freelas/conformidade";
import { SERVICOS_DA_CELULA } from "@/lib/agency/celula/catalogo-ofertavel";

vi.mock("@/lib/marketplaces/99freelas/coleta", () => ({
  paraProjetoBruto: (p: { titulo: string; descricao: string; categoria: string | null }) => ({
    url: null,
    conteudoDeTerceiro: `${p.titulo}\n${p.descricao}\nCategoria: ${p.categoria ?? ""}`,
    custoEmConexoesLidoDaTela: null,
    horasDesdeAPublicacao: null,
  }),
}));

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
  pasta = await mkdtemp(path.join(tmpdir(), "gravar-candidatura-"));
  arquivo = path.join(pasta, "db.sqlite");
  subirEsquema(arquivo);
  db = new PrismaClient({ adapter: new PrismaLibSql({ url: `file:${arquivo}` }) });
}, 120_000);

afterEach(async () => {
  await db?.$disconnect().catch(() => {});
  await rm(pasta, { recursive: true, force: true });
});

const W = "ws-99freelas-teste";

/** `as unknown as ProjetoColetado`: o contrato exato da interface é de outro
 *  especialista (em construção em paralelo). O teste fixa só os campos que a
 *  ficha garante existirem (título, descrição, categoria, orçamento) — o
 *  resto é preenchido por completude, sem depender da forma final exata. */
function coletado(overrides: Record<string, unknown> = {}): ProjetoColetado {
  return {
    titulo: "Preciso de social media para clínica odontológica",
    descricao:
      "Buscamos profissional para gerir redes sociais de clínica odontológica: 12 posts/mês, stories, e resposta a comentários. Prazo inicial de 30 dias.",
    categoria: "Marketing Digital",
    subcategoria: "Social Media",
    orcamento: "R$ 1.500",
    orcamentoInformado: 1500,
    nivel: "intermediario",
    numeroDePropostas: 3,
    publicadoEm: "2026-09-01T10:00:00Z",
    valorMinimo: null,
    ...overrides,
  } as unknown as ProjetoColetado;
}

function candidaturaBase(overrides: Partial<Candidatura> = {}): Candidatura {
  return {
    desfecho: "aguardando_clique_humano",
    url: "https://www.99freelas.com.br/project/exemplo-123",
    titulo: "Preciso de social media para clínica odontológica",
    categoriaDeclarada: "Marketing Digital",
    texto: "Proposta redigida, específica para este projeto de social media odontológico.",
    ofertaADigitar: 800,
    preco: {
      ok: true,
      ofertaADigitar: 800,
      pisoDaCasa: 800,
      pisoDaCategoria: null,
      pisoQueVenceu: "casa",
      taxaPercentual: 20,
      taxaEmReais: 200,
      regime: "ACRESCIMO_AO_CLIENTE",
      ofertaFinalQueOClienteVe: 1000,
      motivo: "piso da casa aplicado",
    },
    nota: 82,
    saldo: null,
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
    achados: [],
    motivo: "Candidatura pronta para o clique.",
    competencia: "2026-09",
    // Default coerente com o texto de exemplo acima ("social media para
    // clínica odontológica"): um serviço real do catálogo, não um id
    // inventado. Testes que precisam de outro cenário passam `overrides`.
    servicosPossiveis: ["social-media-pecas"],
    ...overrides,
  } as Candidatura;
}

describe("gravarCandidatura", () => {
  it("é idempotente por impressão digital: mesmo texto não duplica, texto diferente cria segunda linha", async () => {
    const r1 = await gravarCandidatura({ workspaceId: W, coletado: coletado(), candidatura: candidaturaBase() }, db);
    expect(r1.criada).toBe(true);

    // Rodar de novo com o MESMO coletado/candidatura — mesma impressão digital.
    const r2 = await gravarCandidatura({ workspaceId: W, coletado: coletado(), candidatura: candidaturaBase() }, db);
    expect(r2.criada).toBe(false);
    expect(r2.id).toBe(r1.id);

    const totalMesmoTexto = await db.oportunidade.count({ where: { workspaceId: W } });
    expect(totalMesmoTexto).toBe(1);

    // Texto DIFERENTE (título e descrição distintos) — não pode colapsar com o
    // primeiro: idempotência falsa é tão ruim quanto ausência de idempotência.
    const outroColetado = coletado({
      titulo: "Preciso de tradução técnica de manual de engenharia",
      descricao:
        "Manual de 80 páginas em inglês técnico de engenharia mecânica, precisa de tradução fiel para português, com glossário próprio da empresa.",
      categoria: "Tradução",
    });
    const outraCandidatura = candidaturaBase({
      titulo: "Preciso de tradução técnica de manual de engenharia",
      categoriaDeclarada: "Tradução",
      url: "https://www.99freelas.com.br/project/outro-456",
      texto: "Proposta específica para a tradução do manual de engenharia.",
    });
    const r3 = await gravarCandidatura({ workspaceId: W, coletado: outroColetado, candidatura: outraCandidatura }, db);
    expect(r3.criada).toBe(true);
    expect(r3.id).not.toBe(r1.id);

    const totalComOSegundo = await db.oportunidade.count({ where: { workspaceId: W } });
    expect(totalComOSegundo).toBe(2);
  });

  it("aguardando_clique_humano grava propostaTexto preenchido e status SEMPRE nova", async () => {
    const cand = candidaturaBase({ desfecho: "aguardando_clique_humano" });
    const r = await gravarCandidatura(
      { workspaceId: `${W}-clique`, coletado: coletado(), candidatura: cand },
      db,
    );
    const linha = await db.oportunidade.findUniqueOrThrow({ where: { id: r.id } });

    expect(linha.status).toBe("nova");
    expect(linha.propostaTexto).toBe(cand.texto);
    expect(linha.conformidadeOk).toBe(true);
    // Nunca "aprovada" nem "enviada" — mesmo no desfecho bom. A máquina não se
    // auto-aprova; o clique é do CEO.
    expect(["aprovada", "enviada"]).not.toContain(linha.status);
  });

  it("eliminado/parado gravam a oportunidade (não somem) com propostaTexto nulo e o motivo em raciocinio", async () => {
    for (const desfecho of ["eliminado", "parado"] as const) {
      const workspaceId = `${W}-${desfecho}`;
      const motivo = `Motivo do desfecho ${desfecho}: reprovado sem gastar nada.`;
      const cand = candidaturaBase({
        desfecho,
        texto: null,
        preco: null,
        decisao: null,
        achados: [],
        motivo,
        url: `https://www.99freelas.com.br/project/${desfecho}-1`,
      });
      const r = await gravarCandidatura({ workspaceId, coletado: coletado(), candidatura: cand }, db);
      const linha = await db.oportunidade.findUniqueOrThrow({ where: { id: r.id } });

      // O descartado APARECE — não some. Continua na tabela, com status "nova".
      expect(linha.status).toBe("nova");
      expect(linha.propostaTexto).toBeNull();
      expect(linha.raciocinio).toContain(desfecho);
      // Portão nunca chegou a julgar (eliminado/parado antes dele): nulo, não
      // `false` — os dois nulos do schema não podem ser colapsados.
      expect(linha.conformidadeOk).toBeNull();
      // Nem `eliminado` nem `parado` carregam o marcador de envio bloqueado —
      // ele é exclusivo do desfecho `texto_pronto_envio_bloqueado`.
      const achadosDoDescarte = JSON.parse(linha.conformidadeAchados ?? "[]");
      expect(
        achadosDoDescarte.some(
          (a: { regra: string }) => a.regra === REGRA_ENVIO_BLOQUEADO_POR_CUSTO_DESCONHECIDO,
        ),
      ).toBe(false);
    }
  });

  it("texto_pronto_envio_bloqueado NÃO descarta a proposta e grava o marcador de envio bloqueado, legível por código — ficha 06/09/2026", async () => {
    const cand = candidaturaBase({
      desfecho: "texto_pronto_envio_bloqueado",
      texto: "Proposta redigida e precificada, mas o envio está bloqueado por custo desconhecido.",
      motivo:
        "Texto pronto, mas o ENVIO está bloqueado: o custo em conexões desta interação não foi lido da tela.",
      achados: [],
    });
    const r = await gravarCandidatura(
      { workspaceId: `${W}-bloqueado`, coletado: coletado(), candidatura: cand },
      db,
    );
    const linha = await db.oportunidade.findUniqueOrThrow({ where: { id: r.id } });

    // 1. O TEXTO NÃO É DESCARTADO — este era o defeito da ficha: caía no
    //    `null` do `propostaPronta` booleano por não ser exatamente
    //    "aguardando_clique_humano".
    expect(linha.propostaTexto).toBe(cand.texto);

    // A máquina continua sem se auto-aprovar, mesmo neste desfecho novo.
    expect(linha.status).toBe("nova");

    // `conformidadeOk` continua HONESTO: o portão não deu BLOCK, então não é
    // `false` só para colorir a tela de vermelho.
    expect(linha.conformidadeOk).toBe(true);

    // 2. O marcador de envio bloqueado está gravado e é LEGÍVEL POR CÓDIGO —
    //    não só uma frase em `raciocinio` que um humano precisa ler.
    const achados = JSON.parse(linha.conformidadeAchados ?? "[]");
    expect(achados).toContainEqual(
      expect.objectContaining({ regra: REGRA_ENVIO_BLOQUEADO_POR_CUSTO_DESCONHECIDO }),
    );
  });

  it("aguardando_clique_humano NÃO carrega o marcador de envio bloqueado — prova que nem todo mundo é carimbado", async () => {
    const cand = candidaturaBase({ desfecho: "aguardando_clique_humano" });
    const r = await gravarCandidatura(
      { workspaceId: `${W}-sem-marcador`, coletado: coletado(), candidatura: cand },
      db,
    );
    const linha = await db.oportunidade.findUniqueOrThrow({ where: { id: r.id } });

    const achados = JSON.parse(linha.conformidadeAchados ?? "[]");
    expect(
      achados.some(
        (a: { regra: string }) => a.regra === REGRA_ENVIO_BLOQUEADO_POR_CUSTO_DESCONHECIDO,
      ),
    ).toBe(false);
  });

  it("conformidadeAchados e precoDetalhe vão como JSON válido, parseável de volta", async () => {
    const achado: Achado = { regra: "link_externo", trecho: "www.exemplo.com", fonte: "Termos de Uso" };
    const cand = candidaturaBase({
      desfecho: "parado",
      texto: null,
      achados: [achado],
      decisao: {
        veredito: "BLOCK",
        acao: "enviarProposta",
        plataforma: "99freelas",
        motivo: "BLOQUEADO: link externo no texto.",
        razoes: [],
        achadosDeConteudo: [achado],
        saldo: null,
        politica: { plataforma: "99freelas", versao: "1", verificadaEm: "2026-08-01" },
      },
    });
    const r = await gravarCandidatura({ workspaceId: `${W}-json`, coletado: coletado(), candidatura: cand }, db);
    const linha = await db.oportunidade.findUniqueOrThrow({ where: { id: r.id } });

    expect(linha.conformidadeOk).toBe(false);

    const achados = JSON.parse(linha.conformidadeAchados ?? "[]");
    expect(achados).toEqual([achado]);

    const preco = JSON.parse(linha.precoDetalhe ?? "null");
    expect(preco.ofertaADigitar).toBe(800);
    expect(preco.ofertaFinalQueOClienteVe).toBe(1000);
  });

  // ── servicoSugerido — ficha 06/09/2026, "a fila diz 'a definir' três vezes" ──
  describe("servicoSugerido", () => {
    it("candidatura com UM serviço grava o NOME LEGÍVEL do catálogo, nunca o id técnico", async () => {
      const cand = candidaturaBase({ servicosPossiveis: ["social-media-pecas"] });
      const r = await gravarCandidatura(
        { workspaceId: `${W}-servico-um`, coletado: coletado(), candidatura: cand },
        db,
      );
      const linha = await db.oportunidade.findUniqueOrThrow({ where: { id: r.id } });

      expect(linha.servicoSugerido).toBe("pacote de peças para redes sociais");
      expect(linha.servicoSugerido).not.toBe("social-media-pecas");
    });

    it("candidatura com ZERO serviços grava servicoSugerido NULO — a metade que prova que não carimbou todo mundo", async () => {
      const cand = candidaturaBase({ servicosPossiveis: [] });
      const r = await gravarCandidatura(
        { workspaceId: `${W}-servico-zero`, coletado: coletado(), candidatura: cand },
        db,
      );
      const linha = await db.oportunidade.findUniqueOrThrow({ where: { id: r.id } });

      expect(linha.servicoSugerido).toBeNull();
    });

    it("candidatura com DOIS serviços lista os DOIS — nenhum é escolhido como 'principal'", async () => {
      const cand = candidaturaBase({ servicosPossiveis: ["social-media-pecas", "trafego-meta"] });
      const r = await gravarCandidatura(
        { workspaceId: `${W}-servico-dois`, coletado: coletado(), candidatura: cand },
        db,
      );
      const linha = await db.oportunidade.findUniqueOrThrow({ where: { id: r.id } });

      expect(linha.servicoSugerido).toContain("pacote de peças para redes sociais");
      expect(linha.servicoSugerido).toContain("campanha de tráfego pago na Meta");
    });

    it("o valor gravado EXISTE DE FATO em SERVICOS_DA_CELULA — nunca um nome digitado à mão", async () => {
      const cand = candidaturaBase({
        servicosPossiveis: ["social-media-com-publicacao", "trafego-meta"],
      });
      const r = await gravarCandidatura(
        { workspaceId: `${W}-servico-catalogo`, coletado: coletado(), candidatura: cand },
        db,
      );
      const linha = await db.oportunidade.findUniqueOrThrow({ where: { id: r.id } });

      const nomesDoCatalogo = SERVICOS_DA_CELULA.map((s) => s.nome);
      expect(linha.servicoSugerido).not.toBeNull();
      for (const nome of (linha.servicoSugerido ?? "").split(" · ")) {
        expect(nomesDoCatalogo).toContain(nome);
      }
    });
  });
});
