// ─── "NÃO SEI SE CABE" ≠ "NÃO CABE" ─────────────────────────────────────────
//
// Ficha: docs/celula-prospeccao/despachos/2026-09-06-custo-desconhecido.md
//
// `avaliarSaldo` devolve `pode: false` em DOIS casos diferentes:
//   A — não cabe: custo é um número FINITO, maior que o que resta.
//   B — não sei se cabe: custo é `Infinity` porque a tela não disse o número.
//
// Antes deste conserto, os dois casos paravam o fluxo ANTES de escrever, com
// o mesmo desfecho "parado". Como o 99Freelas não publica a tabela de custo em
// conexões (zero ocorrências de "conexão"/"conexões" nos fixtures reais),
// TODO projeto coletado publicamente caía no caso B — e nenhuma proposta era
// escrita, jamais. Este arquivo prova as DUAS metades de cada trava: o
// problema plantado é barrado, E o caso limpo não inventa problema.

import { describe, it, expect } from "vitest";
import { processarProjeto, rodada, type ProjetoBruto, type ContextoDaRodada } from "@/lib/marketplaces/99freelas/agente";

const DESCRICAO_LONGA = `Precisamos de uma identidade visual completa para a nossa padaria de bairro,
que existe há doze anos e nunca teve marca formalizada. Queremos manter o azul
da fachada. Precisa servir para embalagem, sacola, fachada e redes sociais.
O prazo é de 20 dias e o orçamento previsto é de R$ 1.200.`;

const PROPOSTA_LIMPA = `Olá! Li o pedido de identidade visual para a padaria e chamou atenção o
ponto de vocês quererem manter o azul da fachada atual na nova marca.

Faço o logotipo em três rotas visuais, com aplicação em fachada, embalagem e
perfil de rede social, e entrego os arquivos abertos. Trabalho com duas rodadas
de ajuste incluídas no valor.

Uma pergunta que muda o escopo: a nova marca vai conviver com a placa antiga
por algum tempo ou a troca é de uma vez?`;

/** Quatro propostas sem parentesco nenhum entre si — evita a trava de spam. */
const TEXTOS_DISTINTOS = [
  "Bom dia. Vi que a padaria funciona há doze anos sem marca formalizada e que o azul da fachada precisa sobreviver à mudança. Faço três rotas de logotipo com aplicação em sacola e embalagem, e entrego arquivo aberto. Qual é a prioridade: a fachada ou a embalagem?",
  "Olá. O ponto que mais muda o custo aqui é a quantidade de peças de embalagem. Trabalho por pacote fechado, com duas rodadas de ajuste, e devolvo o material em formato editável. Quantos tipos de embalagem existem hoje na loja?",
  "Oi! Chamou minha atenção o pedido de manter a paleta atual. Consigo derivar uma família tipográfica que converse com a placa existente sem parecer remendo. Vocês têm foto da fachada em boa resolução?",
  "Boa tarde. Antes de propor qualquer desenho, costumo mapear onde a marca vai aparecer: uniforme, cartão, delivery, rede social. Isso muda o entregável inteiro. Existe entrega por aplicativo hoje?",
];

const redigir = async () => ({ ok: true as const, texto: PROPOSTA_LIMPA, item: "copy", nota: 82 });

/** Plano declarado é PREMIUM na política corrente ⇒ sem janela de 24h. */
const projetoBom: ProjetoBruto = {
  url: "https://www.99freelas.com.br/project/custo-desconhecido-1",
  conteudoDeTerceiro: `Título: Identidade visual para padaria\nCategoria: Vendas & Marketing\nDescrição: ${DESCRICAO_LONGA}`,
  custoEmConexoesLidoDaTela: 2,
  horasDesdeAPublicacao: 30,
};

const ctxBase = (over: Partial<ContextoDaRodada> = {}): ContextoDaRodada => ({
  workspaceId: "w1",
  conexoesGastasNoMes: 0,
  redigirProposta: redigir,
  ...over,
});

describe("CASO B — custo em conexões DESCONHECIDO não é cota estourada", () => {
  it("1. custo null + cota folgada ⇒ texto_pronto_envio_bloqueado, com texto e motivo nomeando o custo não lido", async () => {
    const c = await processarProjeto(
      { ...projetoBom, custoEmConexoesLidoDaTela: null },
      ctxBase({ conexoesGastasNoMes: 0 }),
    );
    expect(c.desfecho).toBe("texto_pronto_envio_bloqueado");
    expect(c.texto).toBeTruthy();
    expect(c.preco).toBeTruthy();
    expect(c.nota).not.toBeNull();
    expect(c.ofertaADigitar).not.toBeNull();
    expect(c.motivo).toMatch(/custo em conexões/i);
    expect(c.motivo).toMatch(/não foi lido da tela/i);
    // A OUTRA METADE do próprio caso limpo: nunca pode ser confundido com o
    // desfecho de envio liberado.
    expect(c.desfecho).not.toBe("aguardando_clique_humano");
  });

  it("2. custo null + portão dando BLOCK (texto sujo) ⇒ parado, texto nulo — o portão manda", async () => {
    // Referência à comissão, e não link: `higienizar` TIRA link do rascunho
    // (teste próprio em 99freelas.test.ts), então um texto só com link seria
    // limpo ANTES de chegar ao portão e nunca provaria este caminho. A
    // referência à comissão é o que `higienizar` deliberadamente NÃO reescreve
    // — mudar preço em silêncio seria pior — e por isso chega suja ao portão.
    const c = await processarProjeto(
      { ...projetoBom, custoEmConexoesLidoDaTela: null },
      ctxBase({
        redigirProposta: async () => ({
          ok: true as const,
          texto: `${PROPOSTA_LIMPA}\n\nEsse valor já considera a taxa da plataforma.`,
          item: "copy",
          nota: 70,
        }),
      }),
    );
    expect(c.desfecho).toBe("parado");
    expect(c.texto).toBeNull();
    expect(c.decisao?.veredito).toBe("BLOCK");
    expect(c.achados.map((a) => a.regra)).toContain("referencia_a_comissao");
  });

  it("3. custo FINITO maior que o restante ⇒ continua parado, e redigirProposta NÃO é chamado", async () => {
    let chamadas = 0;
    const c = await processarProjeto(
      { ...projetoBom, custoEmConexoesLidoDaTela: 2 },
      ctxBase({
        conexoesGastasNoMes: 240, // cota do plano premium já esgotada
        redigirProposta: async () => {
          chamadas += 1;
          return { ok: true as const, texto: PROPOSTA_LIMPA, item: "copy", nota: 82 };
        },
      }),
    );
    expect(c.desfecho).toBe("parado");
    expect(c.texto).toBeNull();
    expect(chamadas).toBe(0); // a prova pedida: contador, não leitura do texto
    expect(c.motivo).toMatch(/cota/i);
  });

  it("4. custo FINITO que cabe ⇒ continua aguardando_clique_humano — sem regressão no caminho normal", async () => {
    const c = await processarProjeto(projetoBom, ctxBase({ conexoesGastasNoMes: 0 }));
    expect(c.desfecho).toBe("aguardando_clique_humano");
    expect(c.texto).toBeTruthy();
    expect(c.decisao?.veredito).toBe("HUMAN_GATE");
  });

  it("5. rodada() com um item de custo desconhecido não contamina a projeção de cota dos itens seguintes", async () => {
    const projetos: ProjetoBruto[] = [
      { ...projetoBom, url: "https://www.99freelas.com.br/project/0", custoEmConexoesLidoDaTela: null },
      { ...projetoBom, url: "https://www.99freelas.com.br/project/1", custoEmConexoesLidoDaTela: 2 },
    ];
    const r = await rodada(
      projetos,
      ctxBase({
        conexoesGastasNoMes: 0,
        redigirProposta: async ({ url }) => {
          const n = Number(url.split("/").pop() ?? "0");
          return { ok: true as const, item: "copy", nota: 80, texto: TEXTOS_DISTINTOS[n % TEXTOS_DISTINTOS.length] };
        },
      }),
    );

    const desconhecido = r.find((c) => c.url.endsWith("/0"));
    const finito = r.find((c) => c.url.endsWith("/1"));

    expect(desconhecido?.desfecho).toBe("texto_pronto_envio_bloqueado");
    expect(desconhecido?.saldo?.custo).toBe(Infinity);

    // A prova pedida: a projeção de cota do item seguinte é um número finito
    // normal — nunca `Infinity`, nunca `NaN`.
    expect(finito?.saldo).toBeTruthy();
    expect(Number.isFinite(finito!.saldo!.restantes)).toBe(true);
    expect(Number.isNaN(finito!.saldo!.restantes)).toBe(false);
    // Com 0 gastas e nenhuma reserva do item de custo desconhecido, o segundo
    // item vê a cota inteira do plano (premium = 240) menos o que ele mesmo
    // custa não é subtraído do "restantes" ANTES de ser avaliado — é o mesmo
    // número que veria isolado.
    expect(finito?.saldo?.restantes).toBe(240);
    expect(finito?.desfecho).toBe("aguardando_clique_humano");
  });
});
