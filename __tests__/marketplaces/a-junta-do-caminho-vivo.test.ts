// ─── A JUNTA: a máquina de conformidade LIGADA no caminho que a tela usa ─────
//
// ── O QUE ESTE ARQUIVO EXISTE PARA IMPEDIR (08/08/2026) ─────────────────────
//
// Havia DUAS implementações do 99Freelas nesta casa:
//
//   • VIVA — `/agency/oportunidades`, `lib/agency/comercial/qualificar.ts`. É o
//     que o CEO abre e de onde ele copia a proposta.
//   • MORTA — `lib/marketplaces/`: Policy Engine, Compliance Validator, Pricing
//     Engine, contador de conexões. **113 testes verdes sobre código que o app
//     nunca executava.**
//
// Resultado: a proposta que o CEO ia copiar não passava pelo Compliance
// Validator, não aplicava o piso do Pricing Engine e não contava conexão.
// Construímos a trava e deixamos a porta ao lado aberta — "cada peça verde, a
// junta rompida", o mesmo padrão do incidente do Drive de 07/08.
//
// **Testar as peças de novo não protege de nada: elas já estavam verdes.** O que
// protege é testar A JUNTA. Por isso boa parte deste arquivo lê o CÓDIGO-FONTE
// do caminho vivo: uma trava que só existe em unidade volta a ser desligada no
// dia em que alguém "simplificar" a rota, e nenhum teste de unidade percebe.
//
// Cada trava tem AS DUAS METADES: barra o problema plantado E não inventa
// problema no caso limpo.

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { julgarProposta } from "@/lib/agency/comercial/qualificar";
import { precificar } from "@/lib/marketplaces/99freelas/preco";
import { cotaMensal, avaliarSaldo } from "@/lib/marketplaces/99freelas/conexoes";
import { politicaDe, autorizacaoDoSuporte } from "@/lib/marketplaces/politica";
import { temCotaDeConexoes } from "@/lib/marketplaces/cotas";
import { TABELA_DE_PISO } from "@/lib/agency/comercial/negociacao";

const raiz = process.cwd();
const ler = (p: string) => fs.readFileSync(path.join(raiz, p), "utf8");

const QUALIFICAR = "lib/agency/comercial/qualificar.ts";
const PIPELINE = "lib/agency/comercial/pipeline.ts";
const ROTA_COLAR = "app/api/agency/oportunidades/route.ts";
const ROTA_EMAIL = "app/api/agency/oportunidades/email/route.ts";
const ROTA_DECISAO = "app/api/agency/oportunidades/[id]/route.ts";
const CARTAO = "components/agency/comercial/CartaoDeOportunidade.tsx";

/** Uma proposta realista e LIMPA. É a segunda metade de quase toda trava daqui:
 *  um validador que reprova isto é ruído que a equipe aprende a ignorar. */
const PROPOSTA_LIMPA = `Olá! Li que vocês precisam de um carrossel por semana para a linha de cosméticos veganos e que o público é feminino de 25 a 40 anos.

Trabalho com social media para marcas pequenas e consigo entregar a arte e a legenda no mesmo pacote, com revisão inclusa. Começaria pelo tom de voz, já que vocês citaram que a concorrência fala de um jeito muito clínico.

Uma dúvida que muda o escopo: as fotos dos produtos já existem ou preciso considerar produção de imagem?`;

// ─── 1. O COMPLIANCE VALIDATOR ESTÁ NO CAMINHO VIVO ─────────────────────────

describe("a proposta que a tela oferece PASSA pelo Compliance Validator", () => {
  it("A JUNTA — o qualificador do caminho vivo importa a máquina de marketplaces", () => {
    const fonte = ler(QUALIFICAR);
    // Se estas importações sumirem, a tela volta a copiar texto não conferido —
    // e os 113 testes de `lib/marketplaces/` continuariam verdes.
    expect(fonte).toContain("@/lib/marketplaces/99freelas/conformidade");
    expect(fonte).toContain("@/lib/marketplaces/99freelas/preco");
    expect(fonte).toContain("@/lib/marketplaces/politica");
    expect(fonte).toMatch(/validarTexto|julgarProposta/);
  });

  it("A JUNTA — o mapa de política escrito à mão NÃO voltou ao qualificador", () => {
    const fonte = ler(QUALIFICAR);
    // `LINK_PERMITIDO: Record<string, boolean>` era a política da plataforma
    // repetida em código, ao lado do `policy.json`. Segunda fonte de verdade é
    // o defeito que quebrou o portal em 07/08 — lá o mapa de 3 linhas já
    // divergia da forma canônica em 11 de 14 casos.
    expect(fonte).not.toMatch(/const\s+LINK_PERMITIDO/);
    expect(fonte).toContain("politicaDe(");
  });

  it("metade 1 — referência à comissão BARRA, e o motivo é nomeado", () => {
    const j = julgarProposta({
      rascunho: "Faço o carrossel por R$ 300. Esse valor já considera a taxa da plataforma.",
      plataforma: "99freelas",
    });
    expect(j.ok).toBe(false);
    expect(j.achados.map((a) => a.regra)).toContain("referencia_a_comissao");
    // O trecho exato viaja junto: dizer "não conforme" sem mostrar o quê obriga
    // o operador a caçar dentro do texto que ele ia mandar ao cliente.
    expect(j.achados[0]!.trecho.length).toBeGreaterThan(0);
    expect(j.achados[0]!.fonte.length).toBeGreaterThan(0);
  });

  it("metade 1 — permuta e pagamento comissionado também barram", () => {
    for (const frase of [
      "Posso fazer o primeiro post em permuta para vocês avaliarem.",
      "Aceito trabalhar por comissão sobre as vendas do primeiro mês.",
      "Se preferir, pode pagar por fora via pix.",
    ]) {
      const j = julgarProposta({ rascunho: frase, plataforma: "99freelas" });
      expect(j.ok, frase).toBe(false);
    }
  });

  it("metade 2 — a proposta LIMPA passa, sem invenção de problema", () => {
    const j = julgarProposta({ rascunho: PROPOSTA_LIMPA, plataforma: "99freelas" });
    expect(j.achados).toEqual([]);
    expect(j.ok).toBe(true);
    // E ela sai inteira: um julgamento que passa mas devolve o texto mutilado é
    // um julgamento que estragou o produto em silêncio.
    expect(j.texto).toBe(PROPOSTA_LIMPA);
    expect(j.higienizado).toBe(false);
  });

  it("link no rascunho é RETIRADO e o fato fica registrado — não é apagado em silêncio", () => {
    const j = julgarProposta({
      rascunho: `${PROPOSTA_LIMPA}\n\nDá para ver trabalhos parecidos aqui: https://exemplo.com/eu`,
      plataforma: "99freelas",
    });
    // Passa (link dá para tirar sem mudar o sentido comercial)…
    expect(j.ok).toBe(true);
    expect(j.texto).not.toContain("https://");
    // …mas o fato NÃO some. Gerador que precisa ser limpo toda vez é gerador que
    // vai escapar no dia em que a limpeza falhar.
    expect(j.higienizado).toBe(true);
  });

  it("metade 1 — proposta gêmea de uma já enviada é SPAM e barra", () => {
    const j = julgarProposta({
      rascunho: PROPOSTA_LIMPA,
      plataforma: "99freelas",
      propostasJaEnviadas: [PROPOSTA_LIMPA],
    });
    expect(j.ok).toBe(false);
    expect(j.achados.map((a) => a.regra)).toContain("spam_por_repeticao");
  });

  it("metade 2 — proposta DIFERENTE, com histórico, não vira spam", () => {
    const outra = `Boa tarde! Vi que o projeto é de identidade visual para uma cafeteria em Curitiba e que vocês já têm o nome definido.

Consigo entregar a marca principal, a versão reduzida e a paleta, com duas rodadas de ajuste. Começo pelo posicionamento, porque isso muda o desenho inteiro.

O que mais muda o escopo: vocês já têm alguma referência de marca que gostam?`;
    const j = julgarProposta({
      rascunho: outra,
      plataforma: "99freelas",
      propostasJaEnviadas: [PROPOSTA_LIMPA],
    });
    expect(j.ok).toBe(true);
  });
});

describe("a proposta REPROVADA não fica copiável", () => {
  it("o julgamento reprovado NÃO devolve proposta pela porta do qualificador", () => {
    const fonte = ler(QUALIFICAR);
    // `propostaTexto` só recebe o texto quando o julgamento passou. Se alguém
    // trocar isto por `julgamento.texto` direto, a tela volta a oferecer o
    // "Copiar" sobre um texto que o portão barrou.
    expect(fonte).toMatch(/propostaTexto:\s*julgamento\.ok\s*\?\s*julgamento\.texto\s*:\s*null/);
  });

  it("o cartão trava a CÓPIA na função, não só no `disabled` do botão", () => {
    const fonte = ler(CARTAO);
    // `disabled` é aparência: atalho de teclado, teste e `click()` de console
    // passam por cima. A recusa mora dentro de `copiarProposta`.
    //
    // Ficha 06/09/2026 ("a fila precisa mostrar o bloqueio") acrescentou uma
    // TERCEIRA condição — `bloqueada` (envio bloqueado por custo em conexões
    // desconhecido) — à mesma trava. Continua sendo a MESMA junta: a recusa de
    // copiar mora na função, nunca só no atributo `disabled`.
    expect(fonte).toMatch(/if\s*\(barrada\s*\|\|\s*bloqueada\s*\|\|\s*!o\.proposta\)\s*return false;/);
    // E o motivo aparece na tela — "não conforme" sem o porquê faz o operador
    // adivinhar, e ele adivinha para o lado de mandar assim mesmo.
    expect(fonte).toContain("nomeDaRegra");
  });
});

// ─── 2. O PISO DE PREÇO ─────────────────────────────────────────────────────

describe("o preço sai da tabela da casa, nunca do modelo", () => {
  it("A JUNTA — o qualificador chama `precificar` e não usa número do JSON da IA", () => {
    const fonte = ler(QUALIFICAR);
    expect(fonte).toContain("precificar(");
    expect(fonte).toMatch(/valorSugerido:\s*preco\.ok\s*\?\s*preco\.ofertaADigitar\s*:\s*null/);
    // O modelo só escolhe `servicoId`. Se alguém acrescentar `bruto.valor` ou
    // `bruto.preco`, o preço volta a ser opinião de LLM.
    expect(fonte).not.toMatch(/bruto\.(valor|preco|price)\b/);
  });

  it("metade 1 — vale o MAIOR piso: o da plataforma quando ele é maior", () => {
    // `copy` tem piso de casa R$ 29; "Vendas & Marketing" impõe R$ 60.
    const p = precificar({ item: "copy", categoriaDaPlataforma: "Vendas & Marketing", plataforma: "99freelas" });
    expect(p.ok).toBe(true);
    expect(p.pisoDaCasa).toBe(TABELA_DE_PISO.copy.piso);
    expect(p.ofertaADigitar).toBe(60);
    expect(p.pisoQueVenceu).toBe("plataforma");
  });

  it("metade 2 — e o da CASA quando ele é maior (a plataforma não puxa o preço para baixo)", () => {
    // `presenca` tem piso R$ 690; "Design & Criação" impõe R$ 50.
    const p = precificar({ item: "presenca", categoriaDaPlataforma: "Design & Criação", plataforma: "99freelas" });
    expect(p.ofertaADigitar).toBe(TABELA_DE_PISO.presenca.piso);
    expect(p.pisoQueVenceu).toBe("casa");
  });

  it("item fora da tabela NÃO ganha preço inventado", () => {
    const p = precificar({ item: "servico-que-a-ia-inventou", plataforma: "99freelas" });
    expect(p.ok).toBe(false);
    expect(p.motivo).toMatch(/não se inventa/i);
  });

  it("categoria fora da tabela DO 99FREELAS para — desconhecido não vale zero", () => {
    const p = precificar({ item: "copy", categoriaDaPlataforma: "Categoria Inexistente", plataforma: "99freelas" });
    expect(p.ok).toBe(false);
  });

  it("metade 2 do caso acima — plataforma SEM tabela de categoria não trava o preço", () => {
    // A Upwork não declara `piso_por_categoria_reais`. "Categoria que a tabela
    // não reconhece" e "plataforma que não tem tabela" pareciam a mesma coisa e
    // não são: colapsar as duas fazia toda oportunidade da Upwork que declarasse
    // categoria sair SEM PREÇO — um fail closed que não protege regra nenhuma.
    const p = precificar({ item: "copy", categoriaDaPlataforma: "Writing", plataforma: "upwork" });
    expect(p.ok).toBe(true);
    expect(p.pisoQueVenceu).toBe("casa");
    expect(p.ofertaADigitar).toBe(TABELA_DE_PISO.copy.piso);
  });

  it("a taxa é ACRESCENTADA por cima — a agência recebe o que digitou", () => {
    const p = precificar({ item: "presenca", plataforma: "99freelas" });
    expect(p.regime).toBe("ACRESCIMO_AO_CLIENTE");
    expect(p.ofertaFinalQueOClienteVe).toBeGreaterThan(p.ofertaADigitar);
    // E o texto da proposta nunca pode dizer isso: é violação, e o validador
    // barra. As duas regras se sustentam mutuamente.
    expect(julgarProposta({ rascunho: p.motivo, plataforma: "99freelas" }).ok).toBe(false);
  });
});

// ─── 3. O CONTADOR DE CONEXÕES ──────────────────────────────────────────────

describe("a cota de conexões, e o fail closed intacto", () => {
  it("metade 1 — com Premium declarado no policy.json, a cota é 240", () => {
    const c = cotaMensal("99freelas");
    expect(c.plano).toBe("premium");
    expect(c.planoFoiDeclarado).toBe(true);
    expect(c.cota).toBe(240);
    // Procedência na frase, não em log: o CEO declarou, ninguém leu da tela.
    expect(c.motivo).toMatch(/declarado pelo CEO/i);
  });

  it("metade 2 — SEM declaração o sistema cai para 10 (Free), sozinho", () => {
    // Plataforma sem `plano_declarado_da_conta` na política. Não é um caso
    // hipotético: apagar aquela linha do JSON produz exatamente isto, e é assim
    // que o fail closed prova que ainda está lá.
    const c = cotaMensal("workana");
    expect(c.planoFoiDeclarado).toBe(false);
    expect(c.cota).toBe(10);
    expect(c.motivo).toMatch(/NINGUÉM DECLAROU O PLANO/);
  });

  it("custo não lido da tela vale Infinity, e Infinity fecha a porta", () => {
    const s = avaliarSaldo({ gastasNoMes: 0, custoLidoDaTela: null });
    expect(s.pode).toBe(false);
    expect(s.custo).toBe(Infinity);
  });

  it("metade 2 — custo lido da tela e cota sobrando: PASSA", () => {
    const s = avaliarSaldo({ gastasNoMes: 10, custoLidoDaTela: 2 });
    expect(s.pode).toBe(true);
    expect(s.restantes).toBe(230);
  });

  it("A JUNTA — a rota de decisão EXIGE o custo lido da tela para marcar enviada", () => {
    const fonte = ler(ROTA_DECISAO);
    expect(fonte).toContain("registrarGasto");
    expect(fonte).toContain("temCotaDeConexoes");
    // Sem número, 400 — e nada muda de estado. Aceitar "enviada" sem o custo
    // deixaria o contador otimista em silêncio, e contador otimista é o mesmo
    // que não ter contador.
    expect(fonte).toMatch(/custoEmConexoes/);
    expect(fonte).toMatch(/status:\s*400/);
    // O gasto é registrado ANTES da mudança de status: o contrário deixaria uma
    // proposta contada como enviada e uma conexão fora do livro.
    expect(fonte.indexOf("registrarGasto")).toBeLessThan(fonte.indexOf("prisma.oportunidade.updateMany"));
  });

  it("A JUNTA — a tela mostra o saldo, e a rota que o serve existe", () => {
    expect(fs.existsSync(path.join(raiz, "app/api/agency/oportunidades/conexoes/route.ts"))).toBe(true);
    const pagina = ler("app/agency/oportunidades/page.tsx");
    expect(pagina).toContain("SaldoDeConexoes");
    const saldo = ler("components/agency/comercial/SaldoDeConexoes.tsx");
    // Falha de leitura NÃO vira "0 gastas, tudo disponível" — a lição dos três
    // `.catch(() => null)` de 07/08 aplicada a cota.
    expect(saldo).toMatch(/não sei/i);
    expect(saldo).toContain("confiavel");
  });

  it("só quem tem cota declarada é contado — e ausência de cota não vira cota infinita", () => {
    expect(temCotaDeConexoes("99freelas")).toBe(true);
    expect(temCotaDeConexoes("upwork")).toBe(false);
    expect(temCotaDeConexoes("")).toBe(false);
  });
});

// ─── 4. O POLICY ENGINE NO MEIO DO CAMINHO ──────────────────────────────────

describe("a política é DADO versionado, não `if` no código", () => {
  it("o que a plataforma permite é lido do policy.json", () => {
    const p = politicaDe("99freelas");
    expect(p.ativa).toBe(true);
    expect(p.linkExternoPermitidoAntesDoContrato).toBe(false);
    expect(p.contatoExternoPermitidoAntesDoContrato).toBe(false);
    expect(p.humanGateObrigatorio).toBe(true);
  });

  it("plataforma sem política é porta FECHADA, não porta aberta", () => {
    const p = politicaDe("uma-plataforma-que-ninguem-analisou");
    expect(p.ativa).toBe(false);
    expect(p.linkExternoPermitidoAntesDoContrato).toBe(false);
    // E o qualificador herda isso: nada de link, nada de contato.
    const j = julgarProposta({
      rascunho: "Me chama no zap 11 99999-8888 que a gente resolve.",
      plataforma: "uma-plataforma-que-ninguem-analisou",
    });
    expect(j.ok).toBe(false);
  });

  it("o envio continua em HUMAN_GATE — esta rodada não destravou nada", () => {
    const p = politicaDe("99freelas");
    expect(p.autoSubmissaoPermitida).toBe(false);
    expect(autorizacaoDoSuporte(p).valeParaOGate).toBe(false);
  });
});

// ─── 5. A PORTA DO E-MAIL DEIXOU DE SER MUDA ────────────────────────────────

describe("as DUAS portas de entrada qualificam pela MESMA função", () => {
  it("a porta do e-mail chama a qualificação — não só ingere", () => {
    const fonte = ler(ROTA_EMAIL);
    // Antes disto, oportunidade que chegava por e-mail nascia sem nota. A fila
    // ordena por nota e no SQLite NULL é o menor valor: ela nascia no rodapé da
    // lista e ninguém a pegava. A porta mais barata era a única que não
    // produzia nada.
    expect(fonte).toContain("qualificarEGravar");
  });

  it("a porta de colar chama a MESMA função — não uma cópia da regra", () => {
    const colar = ler(ROTA_COLAR);
    expect(colar).toContain("qualificarEGravar");
    // Duas cópias da mesma regra é o defeito que quebrou o portal em 07/08.
    // Nenhuma das rotas pode ter o bloco de update próprio de volta.
    expect(colar).not.toMatch(/data:\s*\{[\s\S]*?servicoSugerido:/);
  });

  it("a função compartilhada grava o julgamento, não só a nota", () => {
    const fonte = ler(PIPELINE);
    for (const campo of ["conformidadeOk", "conformidadeAchados", "propostaHigienizada", "precoDetalhe"]) {
      expect(fonte).toContain(campo);
    }
    // E alimenta a trava de spam com o que JÁ SAIU — uma trava sem entrada é uma
    // trava que passa sempre.
    expect(fonte).toContain("propostasJaEnviadas");
    expect(fonte).toMatch(/status:\s*"enviada"/);
  });

  it("falha na qualificação NÃO perde a oportunidade já ingerida", () => {
    const fonte = ler(PIPELINE);
    expect(fonte).toMatch(/catch\s*\(e\)/);
    expect(fonte).toMatch(/gravou:\s*false/);
  });
});

// ─── 6. O QUE ESTA RODADA NÃO PODE TER FEITO ────────────────────────────────

describe("nenhuma escrita e nenhuma leitura autenticada no 99Freelas", () => {
  it("o BrowserComputer continua sem chamador fora dos testes", () => {
    const usos = [QUALIFICAR, PIPELINE, ROTA_COLAR, ROTA_EMAIL, ROTA_DECISAO];
    for (const arquivo of usos) {
      const fonte = ler(arquivo);
      expect(fonte, arquivo).not.toContain("BrowserComputer");
      expect(fonte, arquivo).not.toContain("lib/marketplaces/navegador");
      expect(fonte, arquivo).not.toContain("99freelas.com.br");
    }
  });

  it("nenhuma rota do radar fala com a plataforma", () => {
    for (const arquivo of [ROTA_COLAR, ROTA_EMAIL, ROTA_DECISAO, "app/api/agency/oportunidades/conexoes/route.ts"]) {
      const fonte = ler(arquivo);
      // `fetch(` numa rota do radar seria a rajada de GET que restringiu a conta
      // da agência na Meta em 03/08 — a mesma assinatura, outra plataforma.
      expect(fonte, arquivo).not.toMatch(/\bfetch\s*\(/);
    }
  });
});

// ─── 7. O REGISTRO QUE CONTRADIZIA O FATO ───────────────────────────────────

describe("o registro da pergunta ao suporte bate com o que aconteceu", () => {
  const policy = JSON.parse(ler("docs/plataformas/99freelas/policy.json")) as Record<string, unknown>;
  const autorizacao = policy.autorizacao_do_suporte as Record<string, unknown>;

  it("o CEO PERGUNTOU em 07/08 — e o registro não diz mais que ele não perguntou", () => {
    // Registro que contradiz o fato é pior que registro ausente: ele faz a casa
    // decidir de novo o que já foi feito. O `.md` já dizia "ENVIADA"; o JSON
    // dizia `nao_perguntado`, e é o JSON que o Policy Engine lê.
    //
    // 30/08/2026 — ONDA 2B/D: esta asserção deixou de prender a string exata
    // "perguntado". Na recaptura de 30/08 o status evoluiu para "sem_resposta"
    // (23 dias corridos sem resposta de suporte@99freelas.com.br — ver
    // `status_atualizado_em_2026_08_30` no próprio policy.json): justificativa
    // escrita no arquivo, `sem_resposta` já previsto em `status_valores` e nada
    // destravado (metade 2 abaixo continua fechada). Isso é a política
    // evoluindo de forma LEGÍTIMA, não regredindo — o fato que o CEO corrigiu
    // em 08/08 (ele perguntou, o registro não pode voltar a dizer o contrário)
    // é o invariante, não a letra "perguntado". Prender a string fixa faria a
    // casa reescrever o registro toda vez que ele evoluísse corretamente.
    expect(autorizacao.status).not.toBe("nao_perguntado");
    expect(autorizacao.status_valores as string[]).toContain(autorizacao.status);
    expect(["perguntado", "sem_resposta", "autorizado", "negado"]).toContain(autorizacao.status);
    expect(autorizacao.perguntado_em).toBe("2026-08-07");
    expect(autorizacao.canal).toBeTruthy();
  });

  it("metade 2 — nenhum destes estados destrava o envio sozinho", () => {
    // A parte fácil de escrever com otimismo é o status. O gate exige os três
    // campos juntos, e nenhum estado só de "a pergunta foi feita" basta.
    const a = autorizacaoDoSuporte(politicaDe("99freelas"));
    expect(a.valeParaOGate).toBe(false);
    expect(autorizacao.respondido_em).toBeNull();
    expect(autorizacao.evidencia).toBeNull();
    expect(policy.auto_submission_allowed).toBe(false);
  });

  it("se o status virar 'autorizado', o gate só abre com respondido_em E evidência juntos", () => {
    // Prova com um objeto de política construído no teste — o arquivo real não
    // é tocado. Impede a próxima quebra boba: alguém escrever "autorizado" sem
    // arquivar a resposta.
    const base = politicaDe("99freelas");
    const soStatus = autorizacaoDoSuporte({ ...base, cru: { autorizacao_do_suporte: { status: "autorizado" } } });
    expect(soStatus.valeParaOGate).toBe(false);

    const semEvidencia = autorizacaoDoSuporte({
      ...base,
      cru: { autorizacao_do_suporte: { status: "autorizado", respondido_em: "2026-08-30" } },
    });
    expect(semEvidencia.valeParaOGate).toBe(false);

    const semData = autorizacaoDoSuporte({
      ...base,
      cru: { autorizacao_do_suporte: { status: "autorizado", evidencia: "docs/plataformas/99freelas/resposta-do-suporte.md" } },
    });
    expect(semData.valeParaOGate).toBe(false);

    const completo = autorizacaoDoSuporte({
      ...base,
      cru: {
        autorizacao_do_suporte: {
          status: "autorizado",
          respondido_em: "2026-08-30",
          evidencia: "docs/plataformas/99freelas/resposta-do-suporte.md",
        },
      },
    });
    expect(completo.valeParaOGate).toBe(true);
  });

  it("a divergência de Upwork e Freelancer ficou ESCRITA, não resolvida por palpite", () => {
    // Os `.md` dizem "ENVIADO em 07/08"; os `policy.json` dizem
    // `nao_perguntado`; `docs/pendencias.md` lista o envio como pendência
    // aberta. O CEO confirmou por escrito APENAS o caso do 99Freelas. Sem
    // confirmação, o status não se mexe — e o conflito não pode ficar mudo.
    for (const plataforma of ["upwork", "freelancer"]) {
      const j = JSON.parse(ler(`docs/plataformas/${plataforma}/policy.json`)) as Record<string, unknown>;
      const a = j.autorizacao_do_provedor as Record<string, unknown>;
      expect(a.status, plataforma).toBe("nao_perguntado");
      expect(a._divergencia_de_registro_2026_08_08, plataforma).toBeTruthy();
      expect(ler(`docs/plataformas/${plataforma}/pedido-de-api.md`), plataforma).toMatch(/CONFLITO|NÃO CONFIRMADO/);
    }
  });
});
