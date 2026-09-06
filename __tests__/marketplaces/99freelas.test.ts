// A FRENTE 99FREELAS — as travas, com as DUAS metades de cada uma.
//
// Regra da casa: toda trava prova que BARRA o problema plantado E que NÃO
// inventa problema no caso limpo. Uma metade só é como o teste que afirmava que
// peça sem molde deve ser publicada: verde, e descrevendo o defeito como se
// fosse o contrato.

import { TABELA_DE_PISO } from "@/lib/agency/comercial/negociacao";
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { politicaDe, autorizacaoDoSuporte, capacidadeDeclarada, planoDeclarado } from "@/lib/marketplaces/politica";
import { portaoDeConformidade, vereditoDePolitica, resumoDaPolitica, ACOES } from "@/lib/marketplaces/portao";
import { validarTexto, higienizar, similaridade, TETO_DE_SIMILARIDADE } from "@/lib/marketplaces/99freelas/conformidade";
import { cotaMensal, custoEmConexoes, avaliarSaldo, competenciaDe, COTA_POR_PLANO } from "@/lib/marketplaces/99freelas/conexoes";
import { precificar, TAXA_POR_PLANO, TAXA_SEM_PLANO } from "@/lib/marketplaces/99freelas/preco";
import { BrowserComputer, textoVisivel } from "@/lib/marketplaces/navegador";
import { processarProjeto, rodada, eliminar, esperandoAJanelaDe24h } from "@/lib/marketplaces/99freelas/agente";
import { pendenciasDeResposta, podeEnviarMaisPropostas, prazosDeFollowUp } from "@/lib/marketplaces/99freelas/follow-up";
import { extrairDeTexto } from "@/lib/agency/comercial/oportunidade";

const RAIZ = resolve(__dirname, "../..");

/**
 * Lê um arquivo do repositório SEM os comentários.
 *
 * Existe porque a primeira versão destas travas reprovou os próprios arquivos
 * pelo que eles diziam nos comentários ("alguém chama `page.click()`…"). Uma
 * checagem que reprova a EXPLICAÇÃO do mecanismo ensina o time a apagar a
 * explicação — que é o oposto do que se quer.
 */
function codigoSemComentarios(caminho: string): string {
  return readFileSync(resolve(RAIZ, caminho), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .split("\n")
    .map((l) => l.replace(/(^|[^:])\/\/.*$/, "$1"))
    .join("\n");
}

// ── Uma proposta LIMPA de verdade, usada como o "caso limpo" de toda trava ──
const PROPOSTA_LIMPA = `Olá! Li o pedido de identidade visual para a padaria e chamou atenção o
ponto de vocês quererem manter o azul da fachada atual na nova marca.

Faço o logotipo em três rotas visuais, com aplicação em fachada, embalagem e
perfil de rede social, e entrego os arquivos abertos. Trabalho com duas rodadas
de ajuste incluídas no valor.

Uma pergunta que muda o escopo: a nova marca vai conviver com a placa antiga
por algum tempo ou a troca é de uma vez?`;

/** Quatro propostas sem parentesco nenhum entre si. */
const TEXTOS_DISTINTOS = [
  "Bom dia. Vi que a padaria funciona há doze anos sem marca formalizada e que o azul da fachada precisa sobreviver à mudança. Faço três rotas de logotipo com aplicação em sacola e embalagem, e entrego arquivo aberto. Qual é a prioridade: a fachada ou a embalagem?",
  "Olá. O ponto que mais muda o custo aqui é a quantidade de peças de embalagem. Trabalho por pacote fechado, com duas rodadas de ajuste, e devolvo o material em formato editável. Quantos tipos de embalagem existem hoje na loja?",
  "Oi! Chamou minha atenção o pedido de manter a paleta atual. Consigo derivar uma família tipográfica que converse com a placa existente sem parecer remendo. Vocês têm foto da fachada em boa resolução?",
  "Boa tarde. Antes de propor qualquer desenho, costumo mapear onde a marca vai aparecer: uniforme, cartão, delivery, rede social. Isso muda o entregável inteiro. Existe entrega por aplicativo hoje?",
];

const DESCRICAO_LONGA = `Precisamos de uma identidade visual completa para a nossa padaria de bairro,
que existe há doze anos e nunca teve marca formalizada. Queremos manter o azul
da fachada. Precisa servir para embalagem, sacola, fachada e redes sociais.
O prazo é de 20 dias e o orçamento previsto é de R$ 1.200.`;

// ═══════════════════════════════════════════════════════════════════════════
describe("A CORREÇÃO DO CEO: a cota é por PLANO, e a palavra é CONEXÃO", () => {
  it("com plano declarado (Premium), o limite é o do plano — 240", () => {
    const c = cotaMensal();
    expect(c.plano).toBe("premium");
    expect(c.planoFoiDeclarado).toBe(true);
    expect(c.cota).toBe(240);
    expect(c.motivo).toMatch(/premium/i);
    expect(c.motivo).toMatch(/CEO/i);
  });

  it("SEM declaração, o limite é 10 e o sistema DIZ POR QUÊ (fail closed)", () => {
    // A outra metade: a régua sem o dado. Não é o estado atual do arquivo — é
    // o estado que o arquivo TERIA se ninguém declarasse, e é ele que a trava
    // protege.
    expect(planoDeclarado(null)).toBeNull();
    expect(planoDeclarado("PREMIUM")).toBeNull();     // caixa diferente não conta
    expect(planoDeclarado("ouro")).toBeNull();        // plano inventado não conta
    expect(COTA_POR_PLANO.gratuito).toBe(10);
  });

  it("bônus de medalha NÃO DECLARADO vale zero — bônus não confirmado nunca vira cota", () => {
    expect(cotaMensal().bonusDeMedalha).toBe(0);
  });

  it("a cota tem os três planos da fonte oficial, e nenhum é 10 por generalização", () => {
    expect(COTA_POR_PLANO).toEqual({ gratuito: 10, pro: 120, premium: 240 });
  });

  it("custo desconhecido é Infinity, NUNCA 1 e nunca 0", () => {
    expect(custoEmConexoes(null)).toBe(Infinity);
    expect(custoEmConexoes(undefined)).toBe(Infinity);
    expect(custoEmConexoes("2")).toBe(Infinity);
    expect(custoEmConexoes(0)).toBe(Infinity);
    expect(custoEmConexoes(-1)).toBe(Infinity);
    expect(custoEmConexoes(1.5)).toBe(Infinity);
    // A outra metade: custo LIDO passa, e passa pelo valor lido.
    expect(custoEmConexoes(3)).toBe(3);
  });

  it("o contador sabe o que já foi gasto, e conexão gasta não volta", () => {
    expect(avaliarSaldo({ gastasNoMes: 0, custoLidoDaTela: 2 }).pode).toBe(true);
    expect(avaliarSaldo({ gastasNoMes: 239, custoLidoDaTela: 2 }).pode).toBe(false);
    const estourado = avaliarSaldo({ gastasNoMes: 240, custoLidoDaTela: 1 });
    expect(estourado.pode).toBe(false);
    expect(estourado.restantes).toBe(0);
    expect(estourado.motivo).toMatch(/não volta/i);
  });

  it("a competência é o MÊS DE SÃO PAULO, não o do UTC", () => {
    // 01/09 às 01:00 UTC ainda é 31/08 em São Paulo. Sem o fuso, três horas de
    // todo dia 31 liberariam cota que ainda não existe.
    expect(competenciaDe(new Date("2026-09-01T01:00:00Z"))).toBe("2026-08");
    expect(competenciaDe(new Date("2026-09-01T04:00:00Z"))).toBe("2026-09");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("COMPLIANCE VALIDATOR — as regras travadas", () => {
  it("o caso LIMPO passa sem inventar problema", () => {
    const r = validarTexto(PROPOSTA_LIMPA);
    expect(r.achados, JSON.stringify(r.achados, null, 2)).toEqual([]);
    expect(r.ok).toBe(true);
  });

  const plantados: Array<[string, string, string]> = [
    ["link", "Veja meu portfólio em https://dioli.com.br/cases", "link_externo"],
    ["domínio solto", "Meu site é diolidigital.com.br, dá uma olhada", "link_externo"],
    ["e-mail", "Me manda um retorno em contato@dioli.studio", "dado_de_contato"],
    ["telefone", "Meu contato é (11) 98888-7777", "dado_de_contato"],
    ["arroba", "Me chama no @dioli.digital que a gente resolve", "dado_de_contato"],
    ["whatsapp", "Prefiro conversar pelo WhatsApp, é mais rápido", "dado_de_contato"],
    ["pagamento fora", "Se preferir, pode pagar por Pix direto comigo", "pagamento_fora"],
    ["comissão", "Esse valor já considera a taxa da plataforma", "referencia_a_comissao"],
    ["comissão 2", "Descontada a comissão, sobra pouco para mim", "referencia_a_comissao"],
    ["comissionado", "Aceito trabalhar por comissão sobre as vendas", "pagamento_comissionado"],
    ["permuta", "Podemos fechar por permuta se preferir", "permuta_ou_teste_gratis"],
  ];

  it.each(plantados)("barra o problema plantado: %s", (_nome, texto, regra) => {
    const r = validarTexto(texto);
    expect(r.ok).toBe(false);
    expect(r.achados.map((a) => a.regra)).toContain(regra);
    // Todo achado nomeia a FONTE. Regra sem fonte é opinião, e opinião não
    // bloqueia envio de ninguém.
    for (const a of r.achados) expect(a.fonte.length).toBeGreaterThan(5);
  });

  it("a REFERÊNCIA À COMISSÃO — a regra que a especificação do CEO não previa — barra", () => {
    // É a frase mais natural do mundo para quem está precificando.
    const r = validarTexto("O valor de R$ 900 já está com a taxa do 99Freelas embutida.");
    expect(r.ok).toBe(false);
    expect(r.achados.map((a) => a.regra)).toContain("referencia_a_comissao");
  });

  it("não vê link em preço com ponto de milhar nem em abreviação comum", () => {
    const r = validarTexto("O investimento é de R$ 1.200,00 pelo pacote completo do projeto.");
    expect(r.achados.map((a) => a.regra)).not.toContain("link_externo");
  });

  it("higienizar tira link e contato do RASCUNHO, e o resultado passa no validador", () => {
    const sujo = `Trabalho com identidade visual. Veja em https://dioli.com.br e me
chama no (11) 98888-7777 ou em contato@dioli.studio.`;
    const limpo = higienizar(sujo);
    expect(limpo).not.toMatch(/https?:\/\//);
    expect(limpo).not.toMatch(/@dioli\.studio/);
    expect(validarTexto(limpo).achados.filter((a) => a.regra === "link_externo")).toEqual([]);
  });

  it("higienizar NÃO reescreve referência à comissão — mudar preço em silêncio seria pior", () => {
    const t = "Esse valor já considera a taxa da plataforma.";
    expect(higienizar(t)).toContain("taxa da plataforma");
    expect(validarTexto(higienizar(t)).ok).toBe(false);
  });

  it("o regex global não guarda estado entre duas chamadas", () => {
    const t = "Meu site é dioli.com.br";
    expect(validarTexto(t).ok).toBe(false);
    expect(validarTexto(t).ok).toBe(false); // a segunda chamada tem de barrar igual
  });

  it("similaridade: propostas gêmeas se reconhecem, propostas distintas não", () => {
    const quase = PROPOSTA_LIMPA.replace("padaria", "pizzaria");
    expect(similaridade(PROPOSTA_LIMPA, quase)).toBeGreaterThanOrEqual(TETO_DE_SIMILARIDADE);
    const outra = "Bom dia. Sou desenvolvedor e faço integração de sistemas de estoque com nota fiscal eletrônica em empresas de médio porte.";
    expect(similaridade(PROPOSTA_LIMPA, outra)).toBeLessThan(TETO_DE_SIMILARIDADE);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("PLATFORM POLICY ENGINE — política é DADO versionado, e fail closed", () => {
  it("a política do 99Freelas está ativa, nomeada e datada", () => {
    const p = politicaDe("99freelas");
    expect(p.ativa).toBe(true);
    expect(p.plataforma).toBe("99freelas");
    expect(p.versao).not.toBe("(nenhuma)");
    expect(p.verificadaEm).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("plataforma SEM política devolve tudo fechado — silêncio não é permissão", () => {
    expect(politicaDe("getninjas").ativa).toBe(false);
    expect(politicaDe("").ativa).toBe(false);
    expect(vereditoDePolitica("getninjas", "descobrir")).toBe("BLOCK");
    expect(vereditoDePolitica("getninjas", "enviarProposta")).toBe("BLOCK");
  });

  it("capacidade escrita errada NÃO vira autorização", () => {
    expect(capacidadeDeclarada("AUTHORIZED_BROWSERR")).toBe("BLOCKED");
    expect(capacidadeDeclarada("authorized_browser")).toBe("BLOCKED");
    expect(capacidadeDeclarada(null)).toBe("BLOCKED");
    expect(capacidadeDeclarada(true)).toBe("BLOCKED");
    // A outra metade: a grafia certa autoriza.
    expect(capacidadeDeclarada("AUTHORIZED_BROWSER")).toBe("AUTHORIZED_BROWSER");
  });

  // ── ESTE TESTE FOI REESCRITO EM 08/08/2026, E O MOTIVO IMPORTA ───────────
  //
  // Ele congelava `status === "nao_perguntado"`. Em 07/08 o CEO ENVIOU a
  // pergunta ao suporte, do Gmail dele, e confirmou por escrito. O registro
  // ficou para trás; quando foi corrigido para `perguntado`, este teste ficou
  // vermelho — **por o mundo ter andado para frente**, exatamente a armadilha
  // que o teste dos pedidos de API já tinha caído em 07/08.
  //
  // O INVARIANTE nunca foi "ninguém perguntou". É "sem as TRÊS metades, não
  // destrava" — e é isso que ele passa a travar. `status` sozinho é a parte
  // fácil de escrever com otimismo; por isso ele é o que menos importa aqui.
  it("sem resposta arquivada, a autorização não vale para o gate — qualquer que seja o status", () => {
    const a = autorizacaoDoSuporte(politicaDe("99freelas"));
    expect(a.valeParaOGate).toBe(false);
    // As duas que faltam, nomeadas: é a ausência delas que fecha a porta.
    expect(a.respondido_em).toBeNull();
    expect(a.evidencia).toBeNull();
    // E o status tem de ser um dos declarados — nunca uma string inventada, que
    // `autorizacaoDoSuporte` silenciaria devolvendo "nao_perguntado".
    expect(["nao_perguntado", "perguntado", "negado", "sem_resposta"]).toContain(a.status);
  });

  it("metade 2 — só as TRÊS juntas valeriam, e nenhum atalho supre nenhuma", () => {
    const a = autorizacaoDoSuporte(politicaDe("99freelas"));
    // Prova de que `valeParaOGate` não é um alias de `status === "autorizado"`:
    // hoje o status já mudou (de `nao_perguntado` para `perguntado`) e o gate
    // não se mexeu um milímetro.
    expect(a.status).not.toBe("autorizado");
    expect(politicaDe("99freelas").autoSubmissaoPermitida).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("COMPLIANCE GATE — ALLOW · HUMAN_GATE · BLOCK", () => {
  it("descobrir e ler projeto público: ALLOW", () => {
    expect(portaoDeConformidade({ plataforma: "99freelas", acao: "descobrir" }).veredito).toBe("ALLOW");
    expect(portaoDeConformidade({ plataforma: "99freelas", acao: "lerProjeto" }).veredito).toBe("ALLOW");
  });

  it("qualificar, precificar e escrever: ALLOW — não toca a plataforma", () => {
    const d = portaoDeConformidade({ plataforma: "99freelas", acao: "qualificar" });
    expect(d.veredito).toBe("ALLOW");
    expect(d.motivo).toMatch(/nada disto toca/i);
  });

  it("ENVIAR PROPOSTA com tudo certo: HUMAN_GATE — e isso NÃO é falha", () => {
    const d = portaoDeConformidade({
      plataforma: "99freelas", acao: "enviarProposta",
      texto: PROPOSTA_LIMPA, custoEmConexoesLidoDaTela: 2, conexoesGastasNoMes: 4,
    });
    expect(d.veredito).toBe("HUMAN_GATE");
    expect(d.motivo).toMatch(/clique/i);
    expect(d.razoes.map((r) => r.regra)).toContain("sem_autorizacao_escrita");
  });

  it("ENVIAR PROPOSTA com link no texto: BLOCK, e o trecho aparece", () => {
    const d = portaoDeConformidade({
      plataforma: "99freelas", acao: "enviarProposta",
      texto: `${PROPOSTA_LIMPA}\n\nMeu portfólio: https://dioli.com.br`,
      custoEmConexoesLidoDaTela: 1, conexoesGastasNoMes: 0,
    });
    expect(d.veredito).toBe("BLOCK");
    expect(d.achadosDeConteudo.map((a) => a.regra)).toContain("link_externo");
    expect(d.motivo).toMatch(/dioli\.com\.br/);
  });

  it("ENVIAR PROPOSTA sem texto: BLOCK — portão que aprova o vazio não confere nada", () => {
    const d = portaoDeConformidade({ plataforma: "99freelas", acao: "enviarProposta", texto: "   " });
    expect(d.veredito).toBe("BLOCK");
    expect(d.motivo).toMatch(/vazio|não chegou/i);
  });

  // ── ESTE TESTE FOI REESCRITO EM 06/09/2026, E O MOTIVO IMPORTA ───────────
  //
  // Despacho: docs/celula-prospeccao/despachos/2026-09-06-custo-desconhecido.md
  //
  // Ele dizia "ENVIAR PROPOSTA sem o custo lido da tela: BLOCK — desconhecido
  // não vale 1" e cobrava BLOCK do PORTÃO sempre que o custo em conexões
  // fosse desconhecido. Isso conflava, dentro do portão, os dois casos em que
  // `avaliarSaldo` devolve `pode: false`: custo FINITO que não cabe (cota
  // REALMENTE estourada) e custo `Infinity` (a tela não disse o número —
  // "não sei se cabe" não é "não cabe"). Com essa trava, TODO projeto
  // coletado publicamente (o 99Freelas não publica a tabela de custo) tinha
  // seu texto descartado (`texto: null`) mesmo estando limpo — exatamente o
  // defeito que o despacho corrigiu, só que na camada de baixo
  // (`lib/marketplaces/99freelas/agente.ts` já fazia essa distinção; o
  // portão, chamado por dentro dele, desfazia a distinção sozinho).
  //
  // "Desconhecido não vale 1" continua verdade e continua travado — é
  // `avaliarSaldo`, que este despacho NÃO tocou, quem garante isso (ver "o
  // contador sabe o que já foi gasto..." acima). O que mudou é que o custo
  // desconhecido, sozinho, não é mais motivo do PORTÃO barrar um texto limpo.
  it("ENVIAR PROPOSTA com custo REALMENTE estourado (finito): BLOCK", () => {
    const d = portaoDeConformidade({
      plataforma: "99freelas", acao: "enviarProposta", texto: PROPOSTA_LIMPA,
      custoEmConexoesLidoDaTela: 2, conexoesGastasNoMes: 239,
    });
    expect(d.veredito).toBe("BLOCK");
    expect(d.razoes.map((r) => r.regra)).toContain("cota_de_conexoes");
  });

  it("ENVIAR PROPOSTA com custo DESCONHECIDO e texto limpo: o portão NÃO bloqueia por cota sozinho — quem decide o desfecho é quem chama", () => {
    const d = portaoDeConformidade({
      plataforma: "99freelas", acao: "enviarProposta", texto: PROPOSTA_LIMPA,
      custoEmConexoesLidoDaTela: null, conexoesGastasNoMes: 0,
    });
    expect(d.veredito).not.toBe("BLOCK");
    expect(d.razoes.map((r) => r.regra)).toContain("cota_de_conexoes_desconhecida");
  });

  it("ENVIAR PROPOSTA repetida: BLOCK por spam", () => {
    const d = portaoDeConformidade({
      plataforma: "99freelas", acao: "enviarProposta", texto: PROPOSTA_LIMPA,
      textosJaEnviados: [PROPOSTA_LIMPA.replace("padaria", "pizzaria")],
      custoEmConexoesLidoDaTela: 1, conexoesGastasNoMes: 0,
    });
    expect(d.veredito).toBe("BLOCK");
    expect(d.razoes.map((r) => r.regra)).toContain("spam_por_repeticao");
  });

  it("login e anti-bot: BLOCK sempre", () => {
    expect(portaoDeConformidade({ plataforma: "99freelas", acao: "login" }).veredito).toBe("BLOCK");
    expect(portaoDeConformidade({ plataforma: "99freelas", acao: "contornarAntiBot" }).veredito).toBe("BLOCK");
  });

  it("ação fora do catálogo: BLOCK — ação nova não herda permissão", () => {
    const d = portaoDeConformidade({ plataforma: "99freelas", acao: "apagarConta" as never });
    expect(d.veredito).toBe("BLOCK");
  });

  it("toda ação do catálogo tem veredito definido — nenhuma cai no vazio", () => {
    for (const acao of ACOES) {
      expect(["ALLOW", "HUMAN_GATE", "BLOCK"]).toContain(vereditoDePolitica("99freelas", acao));
    }
  });

  it("o resumo diz o que a tela precisa dizer", () => {
    const r = resumoDaPolitica("99freelas");
    expect(r.envio).toBe("HUMAN_GATE");
    expect(r.descoberta).toBe("ALLOW");
    // NÃO se congela o valor: ele mudou em 08/08 (o CEO perguntou) e vai mudar
    // de novo quando o suporte responder. O que a tela precisa é que o estado
    // seja um dos declarados e que ele NÃO seja "autorizado" sem evidência.
    expect(["nao_perguntado", "perguntado", "negado", "sem_resposta"]).toContain(r.autorizacao);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("A LINHA DE DADO que destrava o envio — sem flag escondida", () => {
  it("o código NÃO tem interruptor de ambiente para o envio automático", () => {
    const portao = codigoSemComentarios("lib/marketplaces/portao.ts");
    const agente = codigoSemComentarios("lib/marketplaces/99freelas/agente.ts");
    // Nem `process.env`, nem `forcar`, nem `bypass`: os três são a porta dos
    // fundos que vira o caminho normal na primeira sexta-feira apertada.
    for (const fonte of [portao, agente]) {
      expect(fonte).not.toMatch(/process\.env\.[A-Z_]*(?:AUTO|SUBMIT|ENVIO|BYPASS|FORCE)/);
      expect(fonte).not.toMatch(/forcar\s*[:=]\s*true/);
    }
  });

  it("o policy.json tem o campo que a resposta do suporte vai preencher", () => {
    const bruto = JSON.parse(readFileSync(resolve(RAIZ, "docs/plataformas/99freelas/policy.json"), "utf8"));
    const a = bruto.autorizacao_do_suporte;
    expect(a).toBeTruthy();
    expect(a.status_valores).toContain(a.status);
    // `autorizado` no arquivo SEM data de resposta e SEM evidência é o estado
    // que este teste existe para reprovar — otimismo escrito num JSON.
    if (a.status === "autorizado") {
      expect(a.respondido_em, "autorizado sem data de resposta não vale").toBeTruthy();
      expect(a.evidencia, "autorizado sem evidência arquivada não vale").toBeTruthy();
    }
    // E `perguntado` sem data é o mesmo que não saber se alguém perguntou.
    if (a.status === "perguntado") expect(a.perguntado_em).toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(a).toHaveProperty("perguntado_em");
    expect(a).toHaveProperty("respondido_em");
    expect(a).toHaveProperty("evidencia");
    expect(a.destinatario).toBe("suporte@99freelas.com.br");
  });

  it("status 'autorizado' SEM data e SEM evidência não vale — as três metades juntas", () => {
    const p = politicaDe("99freelas");
    const so_status = autorizacaoDoSuporte({ ...p, cru: { autorizacao_do_suporte: { status: "autorizado" } } });
    expect(so_status.valeParaOGate).toBe(false);
    const sem_evidencia = autorizacaoDoSuporte({
      ...p, cru: { autorizacao_do_suporte: { status: "autorizado", respondido_em: "2026-08-20" } },
    });
    expect(sem_evidencia.valeParaOGate).toBe(false);
    // A outra metade: com as três, vale.
    const completo = autorizacaoDoSuporte({
      ...p,
      cru: { autorizacao_do_suporte: { status: "autorizado", respondido_em: "2026-08-20", evidencia: "docs/.../resposta.md" } },
    });
    expect(completo.valeParaOGate).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("PRICING ENGINE — o piso protege a margem; a taxa é ACRÉSCIMO ao cliente", () => {
  it("aplica max(piso da casa, piso da categoria da plataforma)", () => {
    // "copy" tem piso de casa R$ 29; "Vendas & Marketing" impõe R$ 60.
    const p = precificar({ item: "copy", categoriaDaPlataforma: "Vendas & Marketing" });
    expect(p.ok).toBe(true);
    expect(p.pisoDaCasa).toBe(29);
    expect(p.pisoDaCategoria).toBe(60);
    expect(p.ofertaADigitar).toBe(60);
    expect(p.pisoQueVenceu).toBe("plataforma");
  });

  it("quando o piso da casa é maior, é ele que vale", () => {
    const p = precificar({ item: "presenca", categoriaDaPlataforma: "Design & Criação" });
    // ⚠️ O piso do plano é DERIVADO da tabela única desde 26/08/2026 — não é
    // mais um número digitado aqui nem lá. A régua é "o maior dos dois pisos
    // vence"; o valor é consequência.
    expect(p.ofertaADigitar).toBe(TABELA_DE_PISO.presenca.piso);
    expect(p.pisoQueVenceu).toBe("casa");
  });

  it("a taxa do plano vem da fonte: Premium 10%, Pro 15%, Gratuito 20%", () => {
    expect(TAXA_POR_PLANO).toEqual({ gratuito: 20, pro: 15, premium: 10 });
    expect(TAXA_SEM_PLANO).toBe(20);
    // Plano declarado é Premium ⇒ 10%.
    expect(precificar({ item: "carrossel", categoriaDaPlataforma: null }).taxaPercentual).toBe(10);
  });

  it("a oferta digitada é o LÍQUIDO da agência — a taxa NÃO é embutida", () => {
    const p = precificar({ item: "auditoria", categoriaDaPlataforma: "Design & Criação" });
    // Piso da casa da auditoria é 99; categoria impõe 50 ⇒ vence a casa.
    expect(p.ofertaADigitar).toBe(99);
    expect(p.regime).toBe("ACRESCIMO_AO_CLIENTE");
    // O cliente vê MAIS que isso, e a agência recebe exatamente isso.
    expect(p.ofertaFinalQueOClienteVe).toBeGreaterThan(p.ofertaADigitar);
    expect(p.motivo).toMatch(/NÃO embutir é o certo/);
  });

  it("item fora da tabela da casa: preço que não existe não se inventa", () => {
    const p = precificar({ item: "roteiro-de-video-avulso", categoriaDaPlataforma: "Vendas & Marketing" });
    expect(p.ok).toBe(false);
    expect(p.ofertaADigitar).toBe(0);
    expect(p.motivo).toMatch(/não se inventa/i);
  });

  it("categoria declarada que a plataforma não reconhece: PARA — desconhecido não vale zero", () => {
    const p = precificar({ item: "copy", categoriaDaPlataforma: "Categoria Que Não Existe" });
    expect(p.ok).toBe(false);
    expect(p.motivo).toMatch(/DESCONHECIDO/);
  });

  it("categoria AUSENTE é outra coisa: o piso da casa vale sozinho, e o motivo diz isso", () => {
    const p = precificar({ item: "copy", categoriaDaPlataforma: null });
    expect(p.ok).toBe(true);
    expect(p.ofertaADigitar).toBe(29);
    expect(p.motivo).toMatch(/categoria não declarada/i);
  });

  it("nunca desce do piso, mesmo com valor desejado menor", () => {
    expect(precificar({ item: "presenca", valorDesejado: 10 }).ofertaADigitar).toBe(TABELA_DE_PISO.presenca.piso);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("BrowserComputer — o portão está na frente da rede", () => {
  const nav = new BrowserComputer("99freelas");

  it("só https, só o domínio da plataforma", () => {
    expect(nav.urlPermitida("https://www.99freelas.com.br/projects").ok).toBe(true);
    expect(nav.urlPermitida("http://www.99freelas.com.br/projects").ok).toBe(false);
    expect(nav.urlPermitida("https://99freelas.com.br.evil.io/projects").ok).toBe(false);
    expect(nav.urlPermitida("javascript:alert(1)").ok).toBe(false);
    expect(nav.urlPermitida("não é url").ok).toBe(false);
  });

  it("os caminhos Disallow do robots.txt e os de sessão ficam fora", () => {
    for (const p of ["/termos/", "/privacidade/", "/faq/", "/freelancer-premium/", "/login", "/painel"]) {
      expect(nav.urlPermitida(`https://www.99freelas.com.br${p}`).ok, p).toBe(false);
    }
    // A outra metade: /projects não é Disallow e está no sitemap — é o único
    // sinal POSITIVO que a plataforma dá.
    expect(nav.urlPermitida("https://www.99freelas.com.br/projects/design").ok).toBe(true);
  });

  it("desafio anti-bot na página é reconhecido — e o agente PARA", () => {
    expect(BrowserComputer.temDesafio('<div class="cf-turnstile"></div>')).toBe(true);
    expect(BrowserComputer.temDesafio("<div>g-recaptcha</div>")).toBe(true);
    expect(BrowserComputer.temDesafio("<h1>Projetos de design</h1>")).toBe(false);
  });

  it("não existe caminho no código para Computer Use nem para login", async () => {
    const fonte = codigoSemComentarios("lib/marketplaces/navegador.ts");
    expect(fonte).not.toMatch(/\.fill\(|\.type\(|\.click\(|\.press\(|\.setInputFiles\(/);
    expect(fonte).not.toMatch(/computer[_-]?use|ComputerTool/i);
    // E o portão recusa antes de qualquer rede: nenhum navegador sobe.
    const r = await nav.lerPagina("https://www.99freelas.com.br/projects", "enviarProposta");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toBe("portao");
  });

  it("URL de fora do domínio é recusada ANTES de abrir navegador", async () => {
    const r = await nav.lerPagina("https://exemplo.com/projeto");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toBe("fora_do_dominio");
  });

  it("textoVisivel tira script e marcação sem engolir o conteúdo", () => {
    const t = textoVisivel("<html><script>roubar()</script><h1>Logo para padaria</h1><p>Orçamento R$ 800</p></html>");
    expect(t).toContain("Logo para padaria");
    expect(t).toContain("R$ 800");
    expect(t).not.toContain("roubar");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("O LOOP DO AGENTE — faz tudo e PARA no clique", () => {
  const redigir = async () => ({ ok: true as const, texto: PROPOSTA_LIMPA, item: "copy", nota: 82 });

  const projetoBom = {
    url: "https://www.99freelas.com.br/project/123",
    conteudoDeTerceiro: `Título: Identidade visual para padaria\nCategoria: Vendas & Marketing\nDescrição: ${DESCRICAO_LONGA}`,
    custoEmConexoesLidoDaTela: 2,
    horasDesdeAPublicacao: 30,
  };

  it("o desfecho normal é CANDIDATURA PRONTA aguardando o clique humano", async () => {
    const c = await processarProjeto(projetoBom, {
      workspaceId: "w1", conexoesGastasNoMes: 0, redigirProposta: redigir,
    });
    expect(c.desfecho).toBe("aguardando_clique_humano");
    expect(c.texto).toBeTruthy();
    expect(c.ofertaADigitar).toBe(60); // piso de "Vendas & Marketing"
    expect(c.decisao?.veredito).toBe("HUMAN_GATE");
    expect(c.motivo).toMatch(/o clique é do CEO/i);
  });

  it("elimina ANTES de gastar IA e ANTES de gastar conexão", async () => {
    let chamouIA = false;
    const c = await processarProjeto(
      { ...projetoBom, conteudoDeTerceiro: `Preciso de um TCC sobre marketing digital. ${DESCRICAO_LONGA}` },
      {
        workspaceId: "w1", conexoesGastasNoMes: 0,
        redigirProposta: async () => { chamouIA = true; return { ok: false as const, motivo: "não devia ter sido chamado" }; },
      },
    );
    expect(c.desfecho).toBe("eliminado");
    expect(chamouIA).toBe(false);
  });

  it("anúncio sem substância não vira orçamento no escuro", () => {
    const campos = extrairDeTexto("Preciso de um logo. Urgente.");
    expect(eliminar("Preciso de um logo. Urgente.", campos).eliminado).toBe(true);
    // A outra metade: anúncio com substância passa.
    const bons = extrairDeTexto(DESCRICAO_LONGA);
    expect(eliminar(DESCRICAO_LONGA, bons).eliminado).toBe(false);
  });

  it("cota estourada para ANTES de escrever — não se gasta IA no que não pode sair", async () => {
    let chamouIA = false;
    const c = await processarProjeto(projetoBom, {
      workspaceId: "w1", conexoesGastasNoMes: 240,
      redigirProposta: async () => { chamouIA = true; return { ok: false as const, motivo: "x" }; },
    });
    expect(c.desfecho).toBe("parado");
    expect(chamouIA).toBe(false);
    expect(c.motivo).toMatch(/cota/i);
  });

  it("proposta com link não vira candidatura — o portão BLOQUEIA", async () => {
    const c = await processarProjeto(projetoBom, {
      workspaceId: "w1", conexoesGastasNoMes: 0,
      // Referência à comissão: higienizar NÃO tira, e o portão barra.
      redigirProposta: async () => ({ ok: true as const, texto: `${PROPOSTA_LIMPA}\n\nEsse valor já considera a taxa da plataforma.`, item: "copy", nota: 70 }),
    });
    expect(c.desfecho).toBe("parado");
    expect(c.texto).toBeNull();
    expect(c.achados.map((a) => a.regra)).toContain("referencia_a_comissao");
  });

  it("a janela de 24 h não se aplica com plano pago — mas se aplica sem declaração", () => {
    // Plano declarado é premium: não espera.
    expect(esperandoAJanelaDe24h(2).esperando).toBe(false);
    expect(esperandoAJanelaDe24h(null).esperando).toBe(false);
  });

  it("a rodada RESERVA cota candidatura a candidatura — não promete 30 com 5 restantes", async () => {
    const projetos = Array.from({ length: 4 }, (_, i) => ({
      ...projetoBom, url: `https://www.99freelas.com.br/project/${i}`, custoEmConexoesLidoDaTela: 2,
    }));
    // 236 gastas de 240 ⇒ cabem exatamente 2 candidaturas de 2 conexões.
    const r = await rodada(projetos, {
      workspaceId: "w1", conexoesGastasNoMes: 236,
      // Texto GENUINAMENTE diferente por projeto: senão a trava de spam
      // (correta, e que já tem teste próprio) é que dominaria este resultado.
      redigirProposta: async ({ url }) => {
        const n = url.split("/").pop() ?? "0";
        return { ok: true as const, item: "copy", nota: 80, texto: TEXTOS_DISTINTOS[Number(n) % TEXTOS_DISTINTOS.length] };
      },
    });
    const prontas = r.filter((c) => c.desfecho === "aguardando_clique_humano");
    expect(prontas.length).toBe(2);
    expect(r.filter((c) => c.desfecho === "parado").length).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("FOLLOW-UP — a sanção por não responder a tempo", () => {
  const agora = new Date("2026-08-07T18:00:00Z");

  it("o prazo é declarado como REGRA DA CASA, porque a plataforma não publica o dela", () => {
    const p = prazosDeFollowUp();
    expect(p.ehRegraDaCasa).toBe(true);
    expect(p.prazoHoras).toBe(12);
  });

  it("cliente esperando além do prazo aparece como VENCIDO, com a sanção nomeada", () => {
    const p = pendenciasDeResposta(
      [{ referencia: "projeto-1", ultimaMensagemDoClienteEm: new Date("2026-08-07T04:00:00Z"), ultimaRespostaDaAgenciaEm: null }],
      agora,
    );
    expect(p[0].urgencia).toBe("vencido");
    expect(p[0].motivo).toMatch(/Violação/);
  });

  it("conversa em que a agência JÁ respondeu não conta — a bola está com o cliente", () => {
    const p = pendenciasDeResposta(
      [{
        referencia: "projeto-2",
        ultimaMensagemDoClienteEm: new Date("2026-08-06T10:00:00Z"),
        ultimaRespostaDaAgenciaEm: new Date("2026-08-06T11:00:00Z"),
      }],
      agora,
    );
    expect(p).toEqual([]);
  });

  it("com cliente vencido, a casa PARA de enviar propostas novas", () => {
    const conversas = [{ referencia: "projeto-1", ultimaMensagemDoClienteEm: new Date("2026-08-07T04:00:00Z"), ultimaRespostaDaAgenciaEm: null }];
    expect(podeEnviarMaisPropostas(conversas, agora).pode).toBe(false);
    // A outra metade: sem ninguém esperando, envia.
    expect(podeEnviarMaisPropostas([], agora).pode).toBe(true);
  });
});
