import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// A ROTA QUE MEDE PRODUÇÃO SEM CREDENCIAL DE TERMINAL — 16/08/2026
//
// Três vezes no mesmo dia a medição de produção parou no mesmo muro:
// `npx @railway/cli whoami → "Unauthorized"`, e `railway login` é interativo.
// Duas ferramentas de saneamento subiram ao CEO com o tamanho da sujeira
// DESCONHECIDO — não por falta de regra, mas por falta de acesso.
//
// A rota roda DENTRO do container, onde o banco de produção é local. Com ela, a
// decisão que sobe ao CEO deixa de ser "me dá credencial?" e passa a ser "o
// tamanho é este, corrijo?".
//
// O QUE ESTE TESTE GUARDA: que ela continue sendo o que foi desenhada para ser —
// **uma rota que MEDE**. No dia em que alguém acrescentar um `update` "só para
// facilitar", isto cai.
// ─────────────────────────────────────────────────────────────────────────────

const CAMINHO = "app/api/piloto/diagnostico/route.ts";
const ARQUIVO = readFileSync(join(process.cwd(), CAMINHO), "utf8");
const CODIGO = ARQUIVO
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .split("\n")
  .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*"))
  .join("\n");

describe("a rota NÃO escreve — nenhum caminho, nenhum verbo", () => {
  it("só existe GET", () => {
    expect(CODIGO).toMatch(/export async function GET/);
    for (const verbo of ["POST", "PUT", "PATCH", "DELETE"]) {
      expect(CODIGO, `apareceu um ${verbo} nesta rota`).not.toMatch(new RegExp(`export async function ${verbo}`));
    }
  });

  it("o único verbo de banco é findMany", () => {
    // Prova por mutação: qualquer escrita de Prisma que alguém acrescente aqui
    // derruba este teste. É o que separa "somente leitura" de "somente leitura
    // por enquanto".
    for (const escrita of ["update", "updateMany", "create", "createMany", "delete", "deleteMany", "upsert", "$executeRaw"]) {
      expect(CODIGO, `a rota de diagnóstico passou a chamar ${escrita}`).not.toMatch(
        new RegExp(`prisma\\.[A-Za-z]+\\.${escrita.replace("$", "\\$")}`),
      );
    }
    expect(CODIGO).toMatch(/prisma\.clientRequestDb\.findMany/);
  });

  it("não importa as ferramentas de correção", () => {
    // As regras de DIAGNÓSTICO são importadas (puras, testadas). Os SCRIPTS que
    // escrevem, não — importar um deles traria o caminho de escrita junto.
    // Só as linhas de IMPORT valem: a resposta cita o nome dos scripts em texto,
    // de propósito, para quem lê o JSON não ter de perguntar como corrigir.
    // Citar não é importar — e um teste que confunde as duas coisas proíbe a
    // documentação em vez do defeito.
    const imports = CODIGO.split("\n").filter((l) => l.trim().startsWith("import"));
    for (const l of imports) {
      expect(l, `a rota importou um script de correção: ${l}`).not.toMatch(/scripts\//);
    }
  });
});

describe("segredo ausente não vira porta aberta", () => {
  it("sem segredo configurado, responde 503 e não mede nada", () => {
    // O `if (secret)` que só protege quando a variável existe deixa a porta
    // escancarada em produção mal configurada — e tudo continua funcionando,
    // então ninguém percebe.
    expect(CODIGO).toMatch(/if \(!esperado\)[\s\S]{0,200}status: 503/);
    // E a checagem de autorização também falha fechada.
    expect(CODIGO).toMatch(/if \(!esperado\) return false/);
  });

  it("chave errada responde 401", () => {
    expect(CODIGO).toMatch(/status: 401/);
  });

  it("usa a comparação timing-safe da casa, não uma nova", () => {
    // Não se inventa proteção quando a casa já tem uma provada — e comparação de
    // string com `===` vaza o segredo por tempo de resposta.
    expect(CODIGO).toContain("segredoConfere");
    expect(CODIGO).not.toMatch(/esperado\s*===\s*(doHeader|daQuery)/);
  });
});

describe("devolve o tamanho, não o conteúdo", () => {
  it("os três estados do volume aparecem SEPARADOS", () => {
    // Somar "não recuperável" com "confere" esconderia o buraco: ausência de
    // conversa gravada não é atestado de que está certo.
    expect(CODIGO).toMatch(/confere:/);
    expect(CODIGO).toMatch(/subestimado:/);
    expect(CODIGO).toMatch(/nao_recuperavel:/);
  });

  it("não devolve PII do prospect nem o briefing inteiro", () => {
    // Contagens e ids bastam para dimensionar. A frase original é prova, e vive
    // no relatório do script — que roda no terminal de quem já tem o banco.
    for (const vazamento of ["frase", "businessName:", "briefingJson:", "prospectName", "prospectPhone", "transcript"]) {
      expect(CODIGO, `a resposta passou a carregar ${vazamento}`).not.toMatch(
        new RegExp(`\\b${vazamento.replace(":", "")}\\b\\s*[,:]\\s*(m\\.|l\\.|linha)`),
      );
    }
    expect(CODIGO).toMatch(/ids_subestimados: volume\.mudancas\.map\(\(m\) => m\.id\)/);
  });

  it("falha de leitura não vira zero", () => {
    // "Não há sujeira" e "não consegui olhar" são fatos opostos. O segundo com
    // cara do primeiro é como esta casa deixou uma fila invisível por 7 semanas.
    expect(CODIGO).toMatch(/medido: false/);
    expect(CODIGO).toMatch(/NÃO são zero|não são zero/i);
  });

  it("reaproveita as regras já testadas — não escreve uma terceira versão", () => {
    expect(CODIGO).toContain("comercial/volume-subestimado");
    expect(CODIGO).toContain("comercial/diagnostico-do-negocio");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// VARREDURA DE 07/09/2026 (`.despachos/F6-varredura-de-pii-na-rota.md`)
//
// Os testes acima leem o ARQUIVO como texto e procuram um padrão de código.
// Isso prende "alguém escreveu `businessName:` na resposta" — mas não prende
// "alguém espalhou (`...m`) um objeto interno inteiro dentro da resposta", nem
// "alguém deu outro NOME ao mesmo campo". Dois achados de PII na mesma rota, no
// mesmo dia (`businessName` na auditoria de preço, `nome`/`nomeNormalizado` no
// retrato dos convites) foram os dois desse tipo.
//
// Este bloco chama a rota DE VERDADE, com prisma mockado carregando PII em CADA
// família (nome, e-mail, telefone, trecho de conversa, token inteiro), e varre
// o JSON DE VERDADE que ela devolve — por CHAVE (`Object.keys` recursivo, para
// que um campo novo com outro nome também caia) e por VALOR (os canários — se o
// literal aparecer em QUALQUER lugar do corpo, vazou, não importa a chave).
//
// A OUTRA METADE, no mesmo teste: prova que a pergunta que cada seção respondia
// continua respondida só com id/prefixo/contagem — para não confundir "varredura"
// com "esvaziar a resposta".
// ═════════════════════════════════════════════════════════════════════════════

const bancoMock = vi.hoisted(() => ({
  clientRequestDb: { findMany: vi.fn() },
  conviteDeParceria: { findMany: vi.fn() },
  parceriaDoCliente: { findMany: vi.fn() },
  client: { findMany: vi.fn() },
  approvalRequest: { findMany: vi.fn() },
  pagamentoConfirmado: { findMany: vi.fn() },
}));

vi.mock("@/lib/db/client", () => ({ prisma: bancoMock }));

/** Toda chave, em qualquer profundidade — de objeto e de item de array. */
function coletarChaves(valor: unknown, achadas: Set<string> = new Set()): Set<string> {
  if (Array.isArray(valor)) {
    for (const item of valor) coletarChaves(item, achadas);
  } else if (valor && typeof valor === "object") {
    for (const [chave, v] of Object.entries(valor as Record<string, unknown>)) {
      achadas.add(chave);
      coletarChaves(v, achadas);
    }
  }
  return achadas;
}

/** A família inteira de PII que já vazou nesta rota, ou que poderia vazar do
 *  mesmo jeito: nome de pessoa/negócio, contato, e o objeto de diagnóstico
 *  INTEIRO (que carrega `frase`/`atual`/`novo` — a prova em texto livre) sendo
 *  espalhado em vez de reduzido a um id. NÃO inclui `motivo`: é o nome real de
 *  um campo legítimo desta rota (o enum do convite — "vale"/"revogado"/...),
 *  e confundir os dois é o próprio erro de "meia trava" que vira carimbo. */
const CHAVES_PROIBIDAS = new Set([
  "businessName", "briefingJson", "sdrHandoffJson", "transcript", "rawContext",
  "prospectName", "prospectEmail", "prospectPhone", "chaveDoProspect",
  "nome", "name", "email", "telefone", "phone", "endereco", "address",
  "frase", "reviewNote", "token", "atual", "novo", "gravado", "correto", "veredito",
]);

function chavesProibidasEncontradas(corpo: unknown): string[] {
  return [...coletarChaves(corpo)].filter((c) => CHAVES_PROIBIDAS.has(c));
}

describe("a GUARDA em si acusa quando o campo volta — prova de que ela não é vazia", () => {
  it("um objeto com `businessName` escondido dentro de uma seção nova é detectado", () => {
    // Não muda a rota: prova que o MECANISMO de varredura funciona antes de
    // confiar nele para atestar a rota real, logo abaixo.
    const respostaComRegressao = {
      nome_do_negocio: { ids_a_corrigir: ["a"], secao_nova: { businessName: "vazou" } },
    };
    expect(chavesProibidasEncontradas(respostaComRegressao)).toEqual(["businessName"]);
  });

  it("uma resposta limpa (só ids e contagens) não acusa nada", () => {
    const respostaLimpa = { nome_do_negocio: { ids_a_corrigir: ["a", "b"], intactos: 3 } };
    expect(chavesProibidasEncontradas(respostaLimpa)).toEqual([]);
  });
});

describe("a ROTA DE VERDADE, com PII plantada em cada família, no banco mockado", () => {
  const SEGREDO = "segredo-de-teste-nao-eh-de-producao";
  const ANTES = { ...process.env };

  beforeEach(() => {
    process.env.PILOTO_SECRET = SEGREDO;
    vi.clearAllMocks();

    // 1) NOME DO NEGÓCIO: uma linha suja — o campo guarda o E-MAIL da pessoa
    //    (`PARECE_EMAIL`), e não há nome de negócio em lugar nenhum da linha.
    //    `diagnostico-do-negocio.ts` decide "declarar" e o `atual`/`novo` dela
    //    NÃO pode atravessar para o JSON.
    // 2) VOLUME: uma linha com transcript real — a frase do cliente carrega
    //    telefone dela mesma, de propósito, para provar que a frase inteira
    //    (canário do telefone incluso) não atravessa.
    bancoMock.clientRequestDb.findMany.mockResolvedValue([
      {
        id: "req-negocio-sujo",
        businessName: "maria.correntista@example.com",
        briefingJson: JSON.stringify({ scope: {} }),
      },
      {
        id: "req-volume-sujo",
        businessName: "Negócio Limpo Ltda",
        briefingJson: JSON.stringify({
          scope: { social: { postsPerWeek: 2 } },
          transcript: [
            {
              role: "client",
              text: "Quero 2 posts por dia, na verdade são 3 por semana — meu telefone é 11999998888",
            },
          ],
        }),
      },
    ]);

    // 3) CONVITES: token inteiro só pode sobreviver como PREFIXO de 8.
    bancoMock.conviteDeParceria.findMany.mockResolvedValue([
      {
        token: "TOKENSECRETVALUE1234567890ABC",
        clientId: "cli-1",
        expiraEm: new Date("2099-01-01"),
        revogadoEm: null,
        usos: 1,
        ultimoUsoEm: new Date("2026-09-01"),
      },
    ]);
    bancoMock.parceriaDoCliente.findMany.mockResolvedValue([
      { clientId: "cli-1", revogadaEm: null, validaAte: new Date("2099-01-01") },
    ]);

    // 4) CLIENTE DUPLICADO: dois cadastros de nome colidente — o nome é usado
    //    para AGRUPAR e não pode sair, nem cru nem normalizado.
    bancoMock.client.findMany.mockResolvedValue([
      { id: "cli-1", name: "João da Padaria" },
      { id: "cli-2", name: "joão   da padaria" },
    ]);

    // 5) PREÇO CHEIO APÓS NEGOCIAÇÃO: o `reviewNote` é o texto REAL que
    //    `negotiateProposal` grava (`lib/agency/execution/negotiate-proposal.ts:56`)
    //    — a primeira linha É `"Proposta ajustada — " + businessName`, aqui
    //    sujo com e-mail e telefone, exatamente como `diagnostico-do-negocio.ts`
    //    mostra que a coluna pode vir. Só o número da linha "Total" pode sair;
    //    o texto inteiro, nunca.
    bancoMock.approvalRequest.findMany.mockResolvedValue([
      {
        clientRequestId: "req-negociado",
        department: "proposal",
        reviewNote:
          "Proposta ajustada — Padaria da Maria (cliente@exemplo.com / 11988887777)\n\n" +
          "✨ O QUE VOCÊ RECEBE\n• Social\n\n💰 INVESTIMENTO\nTotal: R$ 350 / mês\n\n" +
          "✅ Se ficar bom pra você, é só aprovar aqui embaixo que a gente começa.",
        createdAt: new Date("2026-08-26T00:00:00.000Z"),
      },
    ]);
    bancoMock.pagamentoConfirmado.findMany.mockResolvedValue([
      { clientRequestId: "req-negociado", confirmadoEm: new Date("2026-08-27"), valorCentavos: 35000 },
    ]);
  });

  afterEach(() => {
    process.env = { ...ANTES };
  });

  it("nenhuma chave da família de PII sobrevive na resposta de verdade", async () => {
    const { GET } = await import("@/app/api/piloto/diagnostico/route");
    const req = new NextRequest("http://localhost/api/piloto/diagnostico", {
      headers: { authorization: `Bearer ${SEGREDO}` },
    });
    const res = await GET(req);
    const corpo = await res.json();

    expect(res.status, JSON.stringify(corpo)).toBe(200);
    expect(chavesProibidasEncontradas(corpo)).toEqual([]);
  });

  it("nenhum LITERAL de PII plantado aparece em lugar nenhum do corpo — por valor, não só por chave", async () => {
    const { GET } = await import("@/app/api/piloto/diagnostico/route");
    const req = new NextRequest("http://localhost/api/piloto/diagnostico", {
      headers: { authorization: `Bearer ${SEGREDO}` },
    });
    const res = await GET(req);
    const corpoTexto = JSON.stringify(await res.json());

    const CANARIOS = [
      "maria.correntista@example.com",
      "11999998888",
      "Quero 2 posts por dia",
      "TOKENSECRETVALUE1234567890ABC", // o token INTEIRO — só o prefixo pode sobreviver
      "João da Padaria",
      "joão   da padaria",
      "Padaria da Maria",
      "cliente@exemplo.com",
      "11988887777",
      "Proposta ajustada", // o `reviewNote` INTEIRO — só o valor extraído pode sobreviver
    ];
    for (const canario of CANARIOS) {
      expect(corpoTexto, `vazou o canário de PII: "${canario}"`).not.toContain(canario);
    }
  });

  it("A OUTRA METADE: cada pergunta que a seção respondia CONTINUA respondida só com id/prefixo/contagem", async () => {
    const { GET } = await import("@/app/api/piloto/diagnostico/route");
    const req = new NextRequest("http://localhost/api/piloto/diagnostico", {
      headers: { authorization: `Bearer ${SEGREDO}` },
    });
    const res = await GET(req);
    const corpo = await res.json();

    // "Qual pedido tem o nome do negócio sujo?" — ainda dá pra saber, pelo id.
    expect(corpo.nome_do_negocio.ids_a_corrigir).toContain("req-negocio-sujo");

    // "Qual pedido está com o volume subestimado?" — ainda dá pra saber, pelo id.
    expect(corpo.volume.ids_subestimados).toContain("req-volume-sujo");

    // "O token existe, e dá pra reconhecer nos logs sem virar credencial?" —
    // sim: o prefixo de 8 sobrevive.
    expect(corpo.parcerias.convites[0]?.prefixo).toBe("TOKENSEC");

    // "Há cadastro duplicado, e qual tem parceria viva?" — sim, por id.
    const grupo = corpo.parcerias.clientes_de_nome_colidente[0];
    expect(grupo.tamanho).toBe(2);
    expect(grupo.clientes.map((c: { id: string }) => c.id).sort()).toEqual(["cli-1", "cli-2"]);
    expect(grupo.clientes.find((c: { id: string }) => c.id === "cli-1")?.temParceriaViva).toBe(true);

    // "Quem negociou, quanto, e pagou?" — sim, por id + valor extraído.
    const caso = corpo.preco_cheio_apos_negociacao.casos[0];
    expect(caso.client_request_id).toBe("req-negociado");
    expect(caso.valor_na_proposta_centavos).toBe(35000);
    expect(caso.pago).toBe(true);
  });
});
