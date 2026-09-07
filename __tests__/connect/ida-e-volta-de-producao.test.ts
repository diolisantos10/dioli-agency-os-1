/**
 * ⭐⭐ A PROVA REAL CONTROLADA — IDA e VOLTA, pelo caminho de PRODUÇÃO.
 *
 * ─── POR QUE ESTE ARQUIVO NÃO CHAMA O CONECTOR DIRETAMENTE ──────────────────
 *
 * Porque isso provaria o conector, não o produto. Quatro peças prontas,
 * testadas e SEM CHAMADOR apareceram nesta casa hoje; o jeito de não produzir a
 * quinta é entrar pelo mesmo lugar por onde a produção entra:
 *
 *   despertador (relógio) → `responderMensagensDeClientes()` → conector → núcleo
 *   núcleo → `POST /api/connect/retorno` (o handler de verdade) → conversa
 *
 * `responderMensagensDeClientes` é a função que `lib/agency/despertador.ts:764`
 * chama a cada cinco minutos, e o handler é o exportado por
 * `app/api/connect/retorno/route.ts`. Nenhum atalho: o gatilho, o `import`
 * dinâmico, o `process.env`, o `fetch` global e a guarda do segredo são os de
 * produção. O que é falso aqui é só a fronteira — o banco e o núcleo.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { bancoDeMentira, type BancoDeMentira } from "./_banco-de-mentira";

// ── A FRONTEIRA FALSA, E SÓ ELA ──────────────────────────────────────────────
const estado = vi.hoisted(() => ({ banco: null as unknown as BancoDeMentira }));
const generate = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/client", () => ({
  get prisma() {
    return estado.banco;
  },
}));
vi.mock("@/lib/ai/generate", () => ({ generate }));
vi.mock("@/app/api/messages/conversa", () => ({
  // A âncora do jeito que a casa resolve: a conversa pertence ao CLIENTE.
  conversaDoCliente: async (clientId: string) => ({
    clientId,
    clientRequestIds: [],
    ancora: { clientId, clientRequestId: null },
    filtro: { clientId },
  }),
}));

import { responderMensagensDeClientes } from "@/lib/agency/esteira/pm-responde";
import { POST as retornoPOST } from "@/app/api/connect/retorno/route";
import { CABECALHO_DO_SEGREDO } from "@/lib/agency/connect/porta";
import { VERSAO_DO_CONTRATO } from "@/lib/agency/connect/conector/versao";
import { nucleoDeMentira } from "./_nucleo-de-mentira";

// ── O AMBIENTE, como o operador o configura ─────────────────────────────────
const SEGREDO = "segredo-de-teste-com-mais-de-16-caracteres"; // segredo-permitido: fixture inventada, não existe fora deste arquivo
const NUCLEO = "https://nucleo.invalido";

const CLIENTE_A = "cliente-aaa";
const CLIENTE_B = "cliente-bbb";

let buscar: ReturnType<typeof vi.fn>;

/** O que o núcleo respondeu em cada chamada, para o teste conferir a IDA. */
let chamadas: Array<{ url: string; corpo: Record<string, unknown>; segredo: string | null }>;

function respostaJson(corpo: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => corpo,
  } as unknown as Response;
}

/**
 * O núcleo de mentira — agora o ESTRITO, compartilhado (`_nucleo-de-mentira.ts`).
 *
 * ⚠️ ELE ERA COMPLACENTE ATÉ 30/08/2026, e é por isso que esta suíte ficava
 * verde com a Dioli Digital mandando um vocabulário que o núcleo real recusa
 * inteiro. O duplo agora aplica as duas travas do real — vocabulário fechado e
 * remetente resolvido —, então esta bateria passou a medir o contrato, e não a
 * educação do duplo. Ver o cabeçalho daquele arquivo.
 */
function nucleo(politica: unknown, fio: string | null = "fio-1") {
  return nucleoDeMentira(chamadas, { politica, fio });
}

/** Uma mensagem do cliente chegando na caixa, como o portal a grava. */
function mensagemDoCliente(banco: BancoDeMentira, clientId: string, body: string) {
  return banco.portalMessage.create({
    data: {
      clientId,
      clientRequestId: null,
      authorRole: "client",
      authorName: "Cliente",
      body,
      readByTeam: false,
      readByClient: true,
      createdAt: new Date("2026-08-30T12:00:00.000Z"),
    },
  });
}

/** O retorno do núcleo batendo na rota de verdade. */
async function baterNaRotaDeRetorno(corpo: unknown, segredo: string | null = SEGREDO) {
  const req = {
    headers: { get: (h: string) => (h === CABECALHO_DO_SEGREDO && segredo ? segredo : null) },
    json: async () => corpo,
  };
  const resposta = await retornoPOST(req as never);
  return { status: resposta.status, corpo: (await resposta.json()) as Record<string, unknown> };
}

const POLITICA_VIVA = {
  encontrada: true,
  politica: {
    politicaId: "pol-desconto-10",
    versao: 2,
    escopo: "regra",
    valeApenasPara: null,
    vigenteDe: "2026-01-01T00:00:00.000Z",
    vigenteAte: null,
    revogadaEm: null,
    respostaAoCliente: "Consigo aplicar 10% no plano trimestral. Quer que eu já deixe assim?",
    fundamentacaoInterna: "margem aprovada pelo Diretor na reunião de julho",
    decididaPor: "Diretor Comercial",
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  chamadas = [];
  estado.banco = bancoDeMentira();
  process.env.DIOLI_CONNECT_URL = NUCLEO;
  process.env.DIOLI_CONNECT_SECRET = SEGREDO;
  buscar = nucleo({ encontrada: false });
  vi.stubGlobal("fetch", buscar);
  // A IA responde, para provar que o gatilho a DISPENSA — e não que ela falhou.
  generate.mockResolvedValue({ ok: true, data: "resposta genérica do PM" });
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.DIOLI_CONNECT_URL;
  delete process.env.DIOLI_CONNECT_SECRET;
});

// ═══════════════════════════════════════════════════════════════════════════
describe("⭐⭐ IDA — a pergunta sobe pelo caminho de produção", () => {
  it("⭐ sem política: escala ao gerente, grava a pendência e AVISA o cliente", async () => {
    await mensagemDoCliente(estado.banco, CLIENTE_A, "dá pra fazer um desconto no plano?");

    const r = await responderMensagensDeClientes();

    // 1. O conector atendeu — e a IA NÃO foi chamada.
    expect(r.peloConector).toBe(1);
    expect(r.respondidas).toBe(0);
    expect(generate).not.toHaveBeenCalled();

    // 2. A pergunta foi ao núcleo, com o segredo e a versão do contrato.
    const consulta = chamadas.find((c) => c.url.endsWith("/api/connect/politicas/consulta"));
    expect(consulta, "a consulta de política não saiu").toBeDefined();
    expect(consulta!.segredo).toBe(SEGREDO);
    expect(consulta!.corpo.produto).toBe("dioli-digital");
    expect(consulta!.corpo.versaoDoContrato).toBe(VERSAO_DO_CONTRATO);
    expect(consulta!.corpo.referenciaDoCliente).toBe(CLIENTE_A);
    // ⭐ NA LÍNGUA DO NÚCLEO, e não na desta casa. Até 30/08/2026 esta linha
    // exigia `"desconto"` — ou seja, o teste CODIFICAVA o defeito: cobrava do
    // produto exatamente o vocabulário que o núcleo real recusa inteiro, com
    // `assunto_fora_do_vocabulario`. O duplo complacente deixava passar.
    // A classificação local segue "desconto"; quem traduz para a rede é o
    // produto (decisão D3, `lib/agency/connect/vocabulario-do-nucleo.ts`).
    expect((consulta!.corpo.assuntos as { assunto: string }[]).map((a) => a.assunto)).toContain(
      "preco_ou_desconto",
    );

    // 3. A escalada abriu.
    const despacho = chamadas.find((c) => c.url.endsWith("/api/connect/despacho"));
    expect(despacho, "a escalada ao gerente não saiu").toBeDefined();
    expect(despacho!.segredo).toBe(SEGREDO);

    // 4. ⭐ A pendência está gravada, PENDENTE, com a conversa certa.
    expect(estado.banco.linhas).toHaveLength(1);
    const p = estado.banco.linhas[0]!;
    expect(p.estado).toBe("PENDENTE");
    expect(p.conversa).toBe(CLIENTE_A);
    expect(p.produto).toBe("dioli-digital");
    expect(p.protocolo.startsWith(`dioli-digital:${CLIENTE_A}:`)).toBe(true);

    // 5. ⚠️ O cliente NÃO ficou no escuro.
    const aviso = estado.banco.mensagens.find((m) => m.authorRole === "team");
    expect(aviso, "o cliente não foi avisado da pendência").toBeDefined();
    expect(aviso!.body).toMatch(/levei pra quem decide|assim que tiver a resposta/i);
    expect(p.avisadoEm).not.toBeNull();

    // 6. ⛔ E o aviso NÃO conta como a empresa decide por dentro.
    expect(aviso!.body).not.toContain(p.protocolo);
    expect(aviso!.body).not.toMatch(/gerente|diretor|protocolo/i);
  });

  it("⭐ COM política válida: responde AGORA e NÃO escala — o CEO sai do meio", async () => {
    buscar = nucleo(POLITICA_VIVA);
    vi.stubGlobal("fetch", buscar);
    await mensagemDoCliente(estado.banco, CLIENTE_A, "dá pra fazer um desconto no plano?");

    const r = await responderMensagensDeClientes();

    expect(r.peloConector).toBe(1);
    // ⭐ Nenhuma escalada: a empresa já tinha decidido isto.
    expect(chamadas.some((c) => c.url.endsWith("/api/connect/despacho"))).toBe(false);
    // ⭐ Nenhuma pendência: não há o que esperar.
    expect(estado.banco.linhas).toHaveLength(0);

    const resposta = estado.banco.mensagens.find((m) => m.authorRole === "team");
    expect(resposta!.body).toBe(POLITICA_VIVA.politica.respostaAoCliente);
    // ⛔ A BARREIRA: a fundamentação e quem decidiu NÃO atravessaram.
    expect(resposta!.body).not.toContain("margem aprovada");
    expect(resposta!.body).not.toContain("Diretor Comercial");
  });

  it("⚠️ a mensagem que NÃO é fora da alçada segue para a IA, como sempre seguiu", async () => {
    await mensagemDoCliente(estado.banco, CLIENTE_A, "bom dia! como está o carrossel?");
    const r = await responderMensagensDeClientes();

    expect(r.peloConector).toBe(0);
    expect(r.respondidas).toBe(1);
    expect(generate).toHaveBeenCalledTimes(1);
    // O conector nem encostou no núcleo.
    expect(chamadas).toHaveLength(0);
  });

  it("⚠️ O CHÃO — núcleo fora do ar: nada quebra, e a mensagem fica para GENTE", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    }));
    const m = await mensagemDoCliente(estado.banco, CLIENTE_A, "quero um desconto");

    const r = await responderMensagensDeClientes();

    // Não foi atendida, e não explodiu.
    expect(r.falhas).toEqual([]);
    expect(r.semIA).toBe(1);
    // ⭐ A mensagem continua NÃO LIDA — é a caixa de entrada da agência.
    const guardada = estado.banco.mensagens.find((x) => x.id === m.id)!;
    expect(guardada.readByTeam).toBe(false);
    // E nenhuma pendência órfã foi aberta.
    expect(estado.banco.linhas).toHaveLength(0);
  });

  it("⚠️ FECHADO POR CONSTRUÇÃO — sem segredo configurado, nada é tentado", async () => {
    delete process.env.DIOLI_CONNECT_SECRET;
    const m = await mensagemDoCliente(estado.banco, CLIENTE_A, "me dá um desconto");

    const r = await responderMensagensDeClientes();

    expect(chamadas, "o produto tentou falar com o núcleo sem segredo").toEqual([]);
    expect(r.semIA).toBe(1);
    expect(estado.banco.mensagens.find((x) => x.id === m.id)!.readByTeam).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("⭐⭐ VOLTA — a resposta do gerente entra na conversa original", () => {
  /** Faz a IDA e devolve o protocolo aberto. */
  async function ida(cliente = CLIENTE_A, texto = "dá pra fazer um desconto?") {
    await mensagemDoCliente(estado.banco, cliente, texto);
    await responderMensagensDeClientes();
    const p = estado.banco.linhas.find((l) => l.conversa === cliente);
    expect(p, "a IDA não abriu pendência").toBeDefined();
    return p!.protocolo;
  }

  it("⭐⭐ o retorno chega pela ROTA e o cliente é efetivamente respondido", async () => {
    const protocolo = await ida();
    const antes = estado.banco.mensagens.length;

    const { status, corpo } = await baterNaRotaDeRetorno({
      protocolo,
      versaoDoContrato: VERSAO_DO_CONTRATO,
      decisao: "respondida",
      respostaAoCliente: "Consigo 10% se você fechar o trimestre. Fechado assim?",
      notaInterna: "margem apertada, não repetir",
      decididaPor: "Diretor Comercial",
      fio: "fio-1",
    });

    expect(status).toBe(200);
    expect(corpo.estado).toBe("entregue");
    expect(corpo.conversa).toBe(CLIENTE_A);
    // ⭐ C4: as DUAS confirmações, separadas.
    expect(corpo.entregueAoCliente).toBe(true);

    // ⭐ O cliente leu, na conversa dele, o texto do gerente.
    expect(estado.banco.mensagens.length).toBe(antes + 1);
    const entregue = estado.banco.mensagens[estado.banco.mensagens.length - 1]!;
    expect(entregue.clientId).toBe(CLIENTE_A);
    expect(entregue.authorRole).toBe("team");
    expect(entregue.body).toBe("Consigo 10% se você fechar o trimestre. Fechado assim?");
    // Não lida por ele: é o que faz o aviso aparecer na tela.
    expect(entregue.readByClient).toBe(false);

    // ⛔ A BARREIRA — nada interno atravessou.
    expect(entregue.body).not.toContain("margem apertada");
    expect(entregue.body).not.toContain("Diretor Comercial");
    expect(entregue.body).not.toContain(protocolo);
    expect(entregue.body).not.toContain("fio-1");

    // A pendência fechou, e só agora.
    const p = estado.banco.linhas.find((l) => l.protocolo === protocolo)!;
    expect(p.estado).toBe("RESPONDIDA");
    expect(p.respondidaEm).not.toBeNull();
  });

  it("⭐ reentrega do núcleo é DUPLICADO (200), e o cliente não lê duas vezes", async () => {
    const protocolo = await ida();
    const retorno = {
      protocolo,
      versaoDoContrato: VERSAO_DO_CONTRATO,
      decisao: "respondida" as const,
      respostaAoCliente: "Consigo 10% no trimestre.",
    };

    const primeira = await baterNaRotaDeRetorno(retorno);
    const depoisDaPrimeira = estado.banco.mensagens.length;
    const segunda = await baterNaRotaDeRetorno(retorno);

    expect(primeira.corpo.estado).toBe("entregue");
    // ⚠️ 200, e não erro: a reentrega é o núcleo sendo cuidadoso (decisão D2).
    expect(segunda.status).toBe(200);
    expect(segunda.corpo.estado).toBe("duplicado");
    expect(estado.banco.mensagens.length).toBe(depoisDaPrimeira);
  });

  it("⛔ a porta é FECHADA sem o segredo, e o motivo não cita segredo nenhum", async () => {
    const protocolo = await ida();
    const errado = await baterNaRotaDeRetorno(
      { protocolo, decisao: "respondida", respostaAoCliente: "oi" },
      "segredo-errado-mas-com-16+",
    );
    expect(errado.status).toBe(401);
    expect(errado.corpo.estado).toBe("recusado");
    expect(JSON.stringify(errado.corpo)).not.toContain(SEGREDO);
    // Nada foi entregue a ninguém.
    expect(estado.banco.mensagens.some((m) => m.body === "oi")).toBe(false);
    expect(estado.banco.linhas.find((l) => l.protocolo === protocolo)!.estado).toBe("PENDENTE");
  });

  it("⛔ VAZAMENTO INTERNO — recusa, e a pendência CONTINUA ABERTA", async () => {
    const protocolo = await ida();

    const { status, corpo } = await baterNaRotaDeRetorno({
      protocolo,
      versaoDoContrato: VERSAO_DO_CONTRATO,
      decisao: "respondida",
      // O gerente colou a nota interna dentro do texto do cliente.
      respostaAoCliente: "Consigo 10%, mas não conta que a margem está apertada demais.",
      notaInterna: "a margem está apertada demais",
    });

    expect(status).toBe(422);
    expect(corpo.estado).toBe("recusado");
    // ⭐ Nada foi entregue — e nada foi CORTADO para caber.
    expect(estado.banco.mensagens.some((m) => m.body.includes("margem está apertada"))).toBe(false);
    // ⭐ E a pendência continua aberta: ninguém foi dado por respondido.
    expect(estado.banco.linhas.find((l) => l.protocolo === protocolo)!.estado).toBe("PENDENTE");
  });

  it("⛔ MAIOR incompatível é BLOQUEADO no portão 0 (C3)", async () => {
    const protocolo = await ida();
    const { status, corpo } = await baterNaRotaDeRetorno({
      protocolo,
      versaoDoContrato: "9.0.0",
      decisao: "respondida",
      respostaAoCliente: "texto que não pode sair",
    });
    expect(status).toBe(422);
    expect(corpo.estado).toBe("recusado");
    expect(estado.banco.mensagens.some((m) => m.body === "texto que não pode sair")).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("⭐⭐ OS CORTES", () => {
  async function idaDe(cliente: string, texto = "dá pra fazer um desconto?") {
    await mensagemDoCliente(estado.banco, cliente, texto);
    await responderMensagensDeClientes();
    return estado.banco.linhas.find((l) => l.conversa === cliente)!.protocolo;
  }

  it("⭐ CORTE 1 — DOIS CLIENTES AO MESMO TEMPO, e eles não se misturam", async () => {
    const protoA = await idaDe(CLIENTE_A);
    const protoB = await idaDe(CLIENTE_B);
    expect(protoA).not.toBe(protoB);

    await baterNaRotaDeRetorno({
      protocolo: protoA,
      versaoDoContrato: VERSAO_DO_CONTRATO,
      decisao: "respondida",
      respostaAoCliente: "RESPOSTA EXCLUSIVA DO CLIENTE A",
    });

    const paraA = estado.banco.mensagens.filter(
      (m) => m.authorRole === "team" && m.body === "RESPOSTA EXCLUSIVA DO CLIENTE A",
    );
    expect(paraA).toHaveLength(1);
    expect(paraA[0]!.clientId).toBe(CLIENTE_A);
    // ⭐ O cliente B não recebeu nada do A, e a pendência dele segue aberta.
    expect(estado.banco.mensagens.some((m) => m.clientId === CLIENTE_B && m.body.includes("EXCLUSIVA"))).toBe(
      false,
    );
    expect(estado.banco.linhas.find((l) => l.protocolo === protoB)!.estado).toBe("PENDENTE");
  });

  it("⭐ CORTE 1b — protocolo bem-formado com a conversa de OUTRO é recusado", async () => {
    const protoA = await idaDe(CLIENTE_A);
    // Um protocolo forjado: mesma pendência, conversa trocada.
    const forjado = `dioli-digital:${CLIENTE_B}:${protoA.split(":")[2]}`;

    const { status, corpo } = await baterNaRotaDeRetorno({
      protocolo: forjado,
      versaoDoContrato: VERSAO_DO_CONTRATO,
      decisao: "respondida",
      respostaAoCliente: "texto que não pode chegar a ninguém",
    });

    expect(status).toBe(422);
    expect(String(corpo.motivo)).toMatch(/protocoloDesconhecido|conversaDivergente/);
    expect(estado.banco.mensagens.some((m) => m.body.includes("não pode chegar"))).toBe(false);
  });

  it("⭐ CORTE 1c — protocolo de OUTRO PRODUTO é recusado nesta porta", async () => {
    const protoA = await idaDe(CLIENTE_A);
    const deOutroProduto = protoA.replace("dioli-digital:", "cityjobs:");

    const { corpo } = await baterNaRotaDeRetorno({
      protocolo: deOutroProduto,
      versaoDoContrato: VERSAO_DO_CONTRATO,
      decisao: "respondida",
      respostaAoCliente: "resposta do CityJobs",
    });
    expect(String(corpo.motivo)).toContain("produtoErrado");
    expect(estado.banco.mensagens.some((m) => m.body === "resposta do CityJobs")).toBe(false);
  });

  it("⭐⭐ CORTE 2 — O PRODUTO PERDE CONEXÃO E VOLTA: a pendência sobrevive", async () => {
    const protocolo = await idaDe(CLIENTE_A);
    const linhasNoDisco = estado.banco.linhas.map((l) => ({ ...l }));

    // ⚠️ O RESTART: o processo morre. Objetos em memória somem; o banco fica.
    // Um banco NOVO é montado sobre as mesmas linhas — é literalmente o que o
    // Railway faz a cada deploy.
    estado.banco = bancoDeMentira(linhasNoDisco);

    const { status, corpo } = await baterNaRotaDeRetorno({
      protocolo,
      versaoDoContrato: VERSAO_DO_CONTRATO,
      decisao: "respondida",
      respostaAoCliente: "Depois do restart, a resposta ainda acha o cliente certo.",
    });

    expect(status).toBe(200);
    expect(corpo.estado).toBe("entregue");
    expect(corpo.conversa).toBe(CLIENTE_A);
    expect(corpo.entregueAoCliente).toBe(true);
    const entregue = estado.banco.mensagens[estado.banco.mensagens.length - 1]!;
    expect(entregue.clientId).toBe(CLIENTE_A);
    expect(entregue.body).toContain("Depois do restart");
  });

  it("⭐ CORTE 2b — A OUTRA METADE: pendência em MEMÓRIA teria perdido o cliente", async () => {
    const protocolo = await idaDe(CLIENTE_A);

    // A mutação: o restart apaga tudo, como faria um armazém em memória.
    estado.banco = bancoDeMentira([]);

    const { status, corpo } = await baterNaRotaDeRetorno({
      protocolo,
      versaoDoContrato: VERSAO_DO_CONTRATO,
      decisao: "respondida",
      respostaAoCliente: "esta resposta viraria órfã",
    });

    // ⭐ É esta a diferença que a TABELA compra. Sem persistência, o retorno
    // chega e não acha onde pousar — e o cliente espera para sempre.
    expect(status).toBe(422);
    expect(String(corpo.motivo)).toContain("protocoloDesconhecido");
    expect(estado.banco.mensagens).toHaveLength(0);
  });

  it("⭐⭐ CORTE 3 — EXCEÇÃO NÃO VIRA REGRA", async () => {
    // Uma exceção concedida ao cliente B. O cliente A pergunta o mesmo.
    buscar = nucleo({
      encontrada: true,
      politica: {
        politicaId: "pol-excecao-b",
        versao: 1,
        escopo: "excecao",
        valeApenasPara: [CLIENTE_B],
        vigenteDe: "2026-01-01T00:00:00.000Z",
        vigenteAte: null,
        revogadaEm: null,
        respostaAoCliente: "Fechamos 30% para você.",
      },
    });
    vi.stubGlobal("fetch", buscar);

    await mensagemDoCliente(estado.banco, CLIENTE_A, "dá pra fazer um desconto?");
    await responderMensagensDeClientes();

    // ⭐ O cliente A NÃO recebeu os 30% do cliente B.
    expect(estado.banco.mensagens.some((m) => m.body.includes("30%"))).toBe(false);
    // ⭐ E o assunto SUBIU, em vez de ser respondido sozinho.
    const despacho = chamadas.find((c) => c.url.endsWith("/api/connect/despacho"));
    expect(despacho, "a exceção de outro deveria ter escalado").toBeDefined();
    // ⚠️ E quem vai decidir sabe que houve decisão anterior que não valeu.
    expect(String(despacho!.corpo.politicaRecusada)).toMatch(/exce/i);
    expect(estado.banco.linhas[0]!.estado).toBe("PENDENTE");
  });

  it("⭐ CORTE 3b — A OUTRA METADE: a exceção VALE para o dono dela", async () => {
    buscar = nucleo({
      encontrada: true,
      politica: {
        politicaId: "pol-excecao-b",
        versao: 1,
        escopo: "excecao",
        valeApenasPara: [CLIENTE_B],
        vigenteDe: "2026-01-01T00:00:00.000Z",
        vigenteAte: null,
        revogadaEm: null,
        respostaAoCliente: "Fechamos 30% para você.",
      },
    });
    vi.stubGlobal("fetch", buscar);

    await mensagemDoCliente(estado.banco, CLIENTE_B, "dá pra fazer um desconto?");
    await responderMensagensDeClientes();

    // O dono da exceção é respondido na hora, e nada escala.
    expect(estado.banco.mensagens.some((m) => m.authorRole === "team" && m.body.includes("30%"))).toBe(true);
    expect(chamadas.some((c) => c.url.endsWith("/api/connect/despacho"))).toBe(false);
  });

  it("⭐⭐ CORTE 4 — POLÍTICA REVOGADA não responde, e escala DIZENDO que caiu", async () => {
    buscar = nucleo({
      encontrada: true,
      politica: {
        politicaId: "pol-antiga",
        versao: 3,
        escopo: "regra",
        valeApenasPara: null,
        vigenteDe: "2026-01-01T00:00:00.000Z",
        vigenteAte: null,
        // ⭐ O núcleo devolve o FATO; quem aplica a regra é o produto.
        revogadaEm: "2026-08-01T00:00:00.000Z",
        respostaAoCliente: "Damos 20% para todo mundo.",
      },
    });
    vi.stubGlobal("fetch", buscar);

    await mensagemDoCliente(estado.banco, CLIENTE_A, "dá pra fazer um desconto?");
    await responderMensagensDeClientes();

    // ⭐ O agente NÃO afirmou ao cliente uma condição que a empresa revogou.
    expect(estado.banco.mensagens.some((m) => m.body.includes("20%"))).toBe(false);
    const despacho = chamadas.find((c) => c.url.endsWith("/api/connect/despacho"));
    expect(despacho).toBeDefined();
    // ⚠️ "não existe" e "existiu e caiu" são perguntas diferentes para o gerente.
    expect(String(despacho!.corpo.politicaRecusada)).toMatch(/revogad/i);
  });

  it("⭐ CORTE 4b — revogação AGENDADA para o futuro não cala o agente hoje", async () => {
    buscar = nucleo({
      encontrada: true,
      politica: {
        politicaId: "pol-que-cai-depois",
        versao: 1,
        escopo: "regra",
        valeApenasPara: null,
        vigenteDe: "2026-01-01T00:00:00.000Z",
        vigenteAte: null,
        revogadaEm: "2099-01-01T00:00:00.000Z",
        respostaAoCliente: "Vale 15% até o fim do ano.",
      },
    });
    vi.stubGlobal("fetch", buscar);

    await mensagemDoCliente(estado.banco, CLIENTE_A, "dá pra fazer um desconto?");
    await responderMensagensDeClientes();

    expect(estado.banco.mensagens.some((m) => m.authorRole === "team" && m.body.includes("15%"))).toBe(true);
    expect(chamadas.some((c) => c.url.endsWith("/api/connect/despacho"))).toBe(false);
  });
});
