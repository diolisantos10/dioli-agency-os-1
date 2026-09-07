// O CONVITE DO MARCOS APONTA PARA O CADASTRO ERRADO — a hipótese, medida.
//
// ═══ O QUE ESTE ARQUIVO PROVA (29/08/2026) ═══════════════════════════════════
//
// `docs/diagnosticos/fusao-de-cliente-duplicado.md`: a FOOCCI nasceu DUAS
// VEZES em 27/08 21:22, com sete segundos de diferença (double-submit). Um
// cadastro carrega a parceria e o convite; o outro é lixo — mas os dois se
// chamam "FOOCCI". Se o link do Marcos foi cunhado apontando para o cadastro
// SEM a parceria, ele é tratado como visitante anônimo e cobrado.
//
// Este arquivo prova três coisas:
//
//   1. `examinarConviteDeParceria` — o código REAL que resolve o link em
//      produção (`app/api/sdr/chat/route.ts:766` → `resolverConviteDeParceria`
//      → `examinarConviteDeParceria`) — devolve `parceria_nao_esta_viva` para
//      um convite que aponta para um cadastro sem parceria, mesmo quando OUTRO
//      cadastro do MESMO NOME tem parceria viva.
//   2. O retrato (`retrato-dos-convites.ts`, lido pelo diagnóstico em
//      `app/api/piloto/diagnostico/route.ts`) aponta a mesma coisa E denuncia
//      o grupo de nome colidente — sem tocar banco, sem vazar o token inteiro.
//   3. As duas concordam, porque as duas usam a MESMA função
//      (`decidirConvite`, em `regra-do-convite.ts`) — não duas cópias da regra.
//
// ⛔ Nenhum cadastro de produção é tocado. Tudo aqui é `vi.mock`.
import { describe, it, expect, vi, beforeEach } from "vitest";

// Tipos só para dar forma às fixtures deste arquivo — NÃO tipam os `vi.fn()`.
// `vi.fn()` sem assinatura, como nos outros dois arquivos de teste de convite
// desta casa: com assinatura, `mockImplementation`/`mockResolvedValue` com
// formatos variados (aqui: `null`, convite, convite com campo trocado) vira o
// erro de `tsc` já documentado (`Tuple type '[]' ... no element at index`).
type LinhaConviteDb = { id: string; clientId: string; expiraEm: Date; revogadoEm: Date | null };
type LinhaParceriaDb = {
  id: string; clientId: string; autorizadaPor: string; validaAte: Date; escopo: string;
  pecasContratadas: number; tetoDeIaCentavosUsd: number; revogadaEm: Date | null;
};

const db = vi.hoisted(() => ({
  conviteDeParceria: {
    findUnique: vi.fn(), update: vi.fn(), create: vi.fn(), updateMany: vi.fn(),
  },
  parceriaDoCliente: {
    findUnique: vi.fn(), update: vi.fn(), create: vi.fn(), delete: vi.fn(),
  },
}));
vi.mock("@/lib/db/client", () => ({ prisma: db }));

const { examinarConviteDeParceria } = await import("@/lib/agency/comercial/convite-de-parceria");
const { decidirConvite } = await import("@/lib/agency/comercial/regra-do-convite");
const { montarRetratoDosConvites } = await import("@/lib/agency/comercial/retrato-dos-convites");

const AGORA = new Date("2026-08-29T13:00:00.000Z");
const DEPOIS = new Date("2026-09-29T00:00:00.000Z");
const JA_PASSOU = new Date("2026-08-01T00:00:00.000Z");

beforeEach(() => {
  vi.clearAllMocks();
  db.conviteDeParceria.update.mockResolvedValue({});
});

// ════════════════════════════════════════════════════════════════════════════
// (b) O CORAÇÃO: cliente A e B com o mesmo nome; parceria viva só em B; o
// convite do Marcos foi cunhado apontando para A.
// ════════════════════════════════════════════════════════════════════════════
describe("o coração: o convite aponta para o cadastro SEM a parceria", () => {
  const CLIENT_A = "cli_foocci_a_lixo";
  const CLIENT_B = "cli_foocci_b_com_parceria";

  const CONVITE_DO_MARCOS = {
    id: "cv_marcos", clientId: CLIENT_A, expiraEm: DEPOIS, revogadoEm: null,
  };
  const PARCERIA_VIVA_DE_B: LinhaParceriaDb = {
    id: "p_b", clientId: CLIENT_B, autorizadaPor: "Dioli Santos (CEO)", validaAte: DEPOIS,
    escopo: "Social Media", pecasContratadas: 12, tetoDeIaCentavosUsd: 200, revogadaEm: null,
  };

  it("(b) examinarConviteDeParceria REAL devolve 'parceria_nao_esta_viva' — não 'token_desconhecido', não outra coisa", async () => {
    db.conviteDeParceria.findUnique.mockResolvedValue(CONVITE_DO_MARCOS);
    // A parceria só existe para B — consultar por A (o cliente do convite) dá null.
    db.parceriaDoCliente.findUnique.mockImplementation(
      async ({ where }: { where: { clientId: string } }) =>
        where.clientId === CLIENT_B ? PARCERIA_VIVA_DE_B : null,
    );

    const r = await examinarConviteDeParceria("tok_do_marcos", AGORA);

    expect(r.convite).toBeNull();
    expect(r.motivo).toBe("parceria_nao_esta_viva");
    // A régua foi consultada pelo cliente do CONVITE (A), nunca pelo nome.
    expect(db.parceriaDoCliente.findUnique).toHaveBeenCalledWith({ where: { clientId: CLIENT_A } });
  });

  it("(c) o retrato aponta o mesmo convite como 'parceria_nao_esta_viva' E denuncia o grupo — B tem parceria viva, A não", () => {
    const convitesBrutos = [
      // segredo-permitido: fixture inventada. Convite real é randomBytes(32).base64url (43 caracteres); o banco aqui é vi.mock.
      { token: "tok_do_marcos_1234567890", clientId: CLIENT_A, expiraEm: DEPOIS, revogadoEm: null, usos: 0, ultimoUsoEm: null },
    ];
    const parceriasBrutas = [
      { clientId: CLIENT_B, revogadaEm: null, validaAte: DEPOIS },
    ];
    const clientesBrutos = [
      { id: CLIENT_A, name: "FOOCCI" },
      { id: CLIENT_B, name: "FOOCCI" },
    ];

    const retrato = montarRetratoDosConvites(convitesBrutos, parceriasBrutas, clientesBrutos, AGORA);

    expect(retrato.convites).toHaveLength(1);
    expect(retrato.convites[0]!.clientId).toBe(CLIENT_A);
    expect(retrato.convites[0]!.motivo).toBe("parceria_nao_esta_viva");

    expect(retrato.gruposDeNomeColidente).toHaveLength(1);
    const grupo = retrato.gruposDeNomeColidente[0]!;
    const a = grupo.clientes.find((c) => c.id === CLIENT_A);
    const b = grupo.clientes.find((c) => c.id === CLIENT_B);
    expect(a?.temParceriaViva, "a causa é exatamente esta: A não tem parceria").toBe(false);
    expect(b?.temParceriaViva, "B — o cadastro que carrega o convite deveria ter apontado — tem").toBe(true);
  });

  it("(f) o retrato e o exame real CONCORDAM sobre a mesma linha, neste cenário", async () => {
    db.conviteDeParceria.findUnique.mockResolvedValue(CONVITE_DO_MARCOS);
    db.parceriaDoCliente.findUnique.mockImplementation(
      async ({ where }: { where: { clientId: string } }) =>
        where.clientId === CLIENT_B ? PARCERIA_VIVA_DE_B : null,
    );
    const real = await examinarConviteDeParceria("tok_do_marcos", AGORA);

    const retrato = montarRetratoDosConvites(
      // segredo-permitido: a mesma fixture inventada do caso (c), para provar que retrato e exame real concordam. Sem banco real.
      [{ token: "tok_do_marcos_1234567890", clientId: CLIENT_A, expiraEm: DEPOIS, revogadoEm: null, usos: 0, ultimoUsoEm: null }],
      [{ clientId: CLIENT_B, revogadaEm: null, validaAte: DEPOIS }],
      [{ id: CLIENT_A, name: "FOOCCI" }, { id: CLIENT_B, name: "FOOCCI" }],
      AGORA,
    );

    expect(retrato.convites[0]!.motivo).toBe(real.motivo);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// (a) examinarConviteDeParceria REAL cobre os SEIS motivos
// ════════════════════════════════════════════════════════════════════════════
describe("(a) examinarConviteDeParceria real cobre os seis motivos", () => {
  const CONVITE_BOM = { id: "c1", clientId: "cli_x", expiraEm: DEPOIS, revogadoEm: null };
  const PARCERIA_VIVA: LinhaParceriaDb = {
    id: "p1", clientId: "cli_x", autorizadaPor: "Dioli Santos (CEO)", validaAte: DEPOIS,
    escopo: "Social Media", pecasContratadas: 12, tetoDeIaCentavosUsd: 200, revogadaEm: null,
  };

  it("sem_token", async () => {
    expect((await examinarConviteDeParceria(undefined, AGORA)).motivo).toBe("sem_token");
    expect(db.conviteDeParceria.findUnique).not.toHaveBeenCalled();
  });

  it("token_desconhecido", async () => {
    db.conviteDeParceria.findUnique.mockResolvedValue(null);
    expect((await examinarConviteDeParceria("tok_fantasma", AGORA)).motivo).toBe("token_desconhecido");
  });

  it("revogado", async () => {
    db.conviteDeParceria.findUnique.mockResolvedValue({ ...CONVITE_BOM, revogadoEm: JA_PASSOU });
    expect((await examinarConviteDeParceria("tok", AGORA)).motivo).toBe("revogado");
  });

  it("vencido", async () => {
    db.conviteDeParceria.findUnique.mockResolvedValue({ ...CONVITE_BOM, expiraEm: JA_PASSOU });
    expect((await examinarConviteDeParceria("tok", AGORA)).motivo).toBe("vencido");
  });

  it("parceria_nao_esta_viva", async () => {
    db.conviteDeParceria.findUnique.mockResolvedValue(CONVITE_BOM);
    db.parceriaDoCliente.findUnique.mockResolvedValue(null);
    expect((await examinarConviteDeParceria("tok", AGORA)).motivo).toBe("parceria_nao_esta_viva");
  });

  it("erro_de_banco", async () => {
    db.conviteDeParceria.findUnique.mockRejectedValue(new Error("sem conexao"));
    expect((await examinarConviteDeParceria("tok", AGORA)).motivo).toBe("erro_de_banco");
  });

  it("e o caminho feliz: convite bom + parceria viva → motivo null", async () => {
    db.conviteDeParceria.findUnique.mockResolvedValue(CONVITE_BOM);
    db.parceriaDoCliente.findUnique.mockResolvedValue(PARCERIA_VIVA);
    const r = await examinarConviteDeParceria("tok", AGORA);
    expect(r.motivo).toBeNull();
    expect(r.convite?.clientId).toBe("cli_x");
  });
});

// ════════════════════════════════════════════════════════════════════════════
// (f) concordância — os quatro desfechos que existem como "linha" nos dois
// lados (token_desconhecido/sem_token/erro_de_banco são estado de QUEM CHAMA,
// não de uma linha lida do banco — o retrato não os produz, por desenho).
// ════════════════════════════════════════════════════════════════════════════
describe("(f) o retrato e o exame real concordam, linha a linha", () => {
  const CLIENT = "cli_concordancia";
  const CASOS: Array<{
    nome: string;
    convite: LinhaConviteDb;
    parceria: LinhaParceriaDb | null;
    esperado: string | null;
  }> = [
    {
      nome: "convite bom + parceria viva → vale",
      convite: { id: "c1", clientId: CLIENT, expiraEm: DEPOIS, revogadoEm: null },
      parceria: { id: "p1", clientId: CLIENT, autorizadaPor: "x", validaAte: DEPOIS, escopo: "s", pecasContratadas: 1, tetoDeIaCentavosUsd: 1, revogadaEm: null },
      esperado: null,
    },
    {
      nome: "revogado",
      convite: { id: "c2", clientId: CLIENT, expiraEm: DEPOIS, revogadoEm: JA_PASSOU },
      parceria: { id: "p1", clientId: CLIENT, autorizadaPor: "x", validaAte: DEPOIS, escopo: "s", pecasContratadas: 1, tetoDeIaCentavosUsd: 1, revogadaEm: null },
      esperado: "revogado",
    },
    {
      nome: "vencido",
      convite: { id: "c3", clientId: CLIENT, expiraEm: JA_PASSOU, revogadoEm: null },
      parceria: { id: "p1", clientId: CLIENT, autorizadaPor: "x", validaAte: DEPOIS, escopo: "s", pecasContratadas: 1, tetoDeIaCentavosUsd: 1, revogadaEm: null },
      esperado: "vencido",
    },
    {
      nome: "parceria_nao_esta_viva (sem parceria nenhuma)",
      convite: { id: "c4", clientId: CLIENT, expiraEm: DEPOIS, revogadoEm: null },
      parceria: null,
      esperado: "parceria_nao_esta_viva",
    },
  ];

  for (const caso of CASOS) {
    it(caso.nome, async () => {
      db.conviteDeParceria.findUnique.mockResolvedValue(caso.convite);
      db.parceriaDoCliente.findUnique.mockResolvedValue(caso.parceria);

      const real = await examinarConviteDeParceria("tok", AGORA);
      expect(real.motivo).toBe(caso.esperado);

      const retrato = montarRetratoDosConvites(
        // segredo-permitido: fixture do laço dos seis motivos — o que se mede é o MOTIVO devolvido, não o valor, que é de mentira.
        [{ token: "tok_1234567890", clientId: CLIENT, expiraEm: caso.convite.expiraEm, revogadoEm: caso.convite.revogadoEm, usos: 0, ultimoUsoEm: null }],
        caso.parceria ? [{ clientId: caso.parceria.clientId, revogadaEm: caso.parceria.revogadaEm, validaAte: caso.parceria.validaAte }] : [],
        [{ id: CLIENT, name: "Qualquer Nome" }],
        AGORA,
      );

      expect(retrato.convites[0]!.motivo).toBe(caso.esperado ?? "vale");
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// (d) o retrato NÃO escreve
// ════════════════════════════════════════════════════════════════════════════
describe("(d) o retrato não escreve nada", () => {
  it("nenhum create/update/updateMany/delete foi chamado ao montar o retrato", () => {
    const convitesBrutos = [
      // segredo-permitido: fixture do caso "o retrato não escreve" — valor inventado para um cliente inventado (cli_1).
      { token: "tok_abc12345", clientId: "cli_1", expiraEm: DEPOIS, revogadoEm: null, usos: 3, ultimoUsoEm: DEPOIS },
      // segredo-permitido: segunda fixture inventada (cli_2, já vencida). Marca própria porque a isenção do sentinela é de LINHA.
      { token: "tok_def67890", clientId: "cli_2", expiraEm: JA_PASSOU, revogadoEm: null, usos: 0, ultimoUsoEm: null },
    ];
    const parceriasBrutas = [{ clientId: "cli_1", revogadaEm: null, validaAte: DEPOIS }];
    const clientesBrutos = [{ id: "cli_1", name: "Cliente Um" }, { id: "cli_2", name: "Cliente Dois" }];

    montarRetratoDosConvites(convitesBrutos, parceriasBrutas, clientesBrutos, AGORA);

    expect(db.conviteDeParceria.create).not.toHaveBeenCalled();
    expect(db.conviteDeParceria.update).not.toHaveBeenCalled();
    expect(db.conviteDeParceria.updateMany).not.toHaveBeenCalled();
    expect(db.conviteDeParceria.findUnique).not.toHaveBeenCalled();
    expect(db.parceriaDoCliente.create).not.toHaveBeenCalled();
    expect(db.parceriaDoCliente.update).not.toHaveBeenCalled();
    expect(db.parceriaDoCliente.delete).not.toHaveBeenCalled();
    expect(db.parceriaDoCliente.findUnique).not.toHaveBeenCalled();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// (e) o token não vaza
// ════════════════════════════════════════════════════════════════════════════
describe("(e) o token inteiro nunca aparece na saída do retrato", () => {
  it("só os 8 primeiros caracteres saem — o resto do token não trafega em campo nenhum", () => {
    const TOKEN_INTEIRO = "tok_segredo_super_longo_que_nunca_deveria_vazar_0000000000";
    const convitesBrutos = [
      { token: TOKEN_INTEIRO, clientId: "cli_1", expiraEm: DEPOIS, revogadoEm: null, usos: 1, ultimoUsoEm: null },
    ];
    const retrato = montarRetratoDosConvites(convitesBrutos, [], [{ id: "cli_1", name: "Cliente Um" }], AGORA);

    const bruto = JSON.stringify(retrato);
    expect(bruto).not.toContain(TOKEN_INTEIRO);
    expect(retrato.convites[0]!.prefixo).toBe(TOKEN_INTEIRO.slice(0, 8));
    expect(retrato.convites[0]!.prefixo.length).toBe(8);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// (g) normalização de nome: falso positivo e falso negativo
// ════════════════════════════════════════════════════════════════════════════
describe("(g) a colisão de nome é por normalização, não por igualdade crua", () => {
  it("acento, caixa e espaço duplo diferentes entram no MESMO grupo", () => {
    const clientesBrutos = [
      { id: "c1", name: "FOOCCI" },
      { id: "c2", name: "foocci" },
      { id: "c3", name: "  Foocci  " },
    ];
    const retrato = montarRetratoDosConvites([], [], clientesBrutos, AGORA);
    expect(retrato.gruposDeNomeColidente).toHaveLength(1);
    expect(retrato.gruposDeNomeColidente[0]!.clientes).toHaveLength(3);
  });

  it("nomes de verdade diferentes NÃO viram falso positivo", () => {
    const clientesBrutos = [
      { id: "c1", name: "FOOCCI" },
      { id: "c2", name: "Outra Empresa Ltda" },
    ];
    const retrato = montarRetratoDosConvites([], [], clientesBrutos, AGORA);
    expect(retrato.gruposDeNomeColidente).toHaveLength(0);
  });

  it("nome único não forma grupo — grupo exige DOIS ou mais", () => {
    const retrato = montarRetratoDosConvites([], [], [{ id: "c1", name: "Solo" }], AGORA);
    expect(retrato.gruposDeNomeColidente).toHaveLength(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// (h) CORRIGIDO em 07/09/2026 (`seguranca`, `.despachos/F5-duplicado-sem-nome.md`):
// o grupo de nome colidente devolvia `nome` (cru) e `nomeNormalizado`, na
// mesma rota cuja chave (`?chave=`) trafega em URL e aparece em log de
// proxy/CDN. Calcula-se com o nome (o agrupamento); não se emite o nome.
// ════════════════════════════════════════════════════════════════════════════
describe("(h) o grupo de nome colidente calcula com o nome e não o emite", () => {
  it("nem `nome` nem `nomeNormalizado` sobrevivem à saída — checado por Object.keys, não por campo isolado", () => {
    const clientesBrutos = [
      { id: "cli_a_lixo", name: "FOOCCI" },
      { id: "cli_b_com_parceria", name: "foocci" },
    ];
    const retrato = montarRetratoDosConvites([], [], clientesBrutos, AGORA);

    expect(retrato.gruposDeNomeColidente).toHaveLength(1);
    const grupo = retrato.gruposDeNomeColidente[0]!;

    // asserção negativa por Object.keys — pega tanto "nome" quanto qualquer
    // renomeação do mesmo campo (o desvio que a auditoria de cobrança já viu).
    expect(Object.keys(grupo)).not.toContain("nome");
    expect(Object.keys(grupo)).not.toContain("nomeNormalizado");
    for (const cliente of grupo.clientes) {
      expect(Object.keys(cliente)).not.toContain("nome");
      expect(Object.keys(cliente)).not.toContain("nomeNormalizado");
    }

    // e o VALOR do nome não sobrevive em nenhum canto da estrutura serializada.
    const bruto = JSON.stringify(retrato);
    expect(bruto).not.toContain("FOOCCI");
    expect(bruto).not.toContain("foocci");
  });

  it("MUTAÇÃO DE PROPÓSITO — repor `nome` no cliente do grupo faz a asserção da guarda acusar", () => {
    const clientesBrutos = [
      { id: "cli_a_lixo", name: "FOOCCI" },
      { id: "cli_b_com_parceria", name: "foocci" },
    ];
    const retrato = montarRetratoDosConvites([], [], clientesBrutos, AGORA);
    const grupo = retrato.gruposDeNomeColidente[0]!;

    // O código de produção, hoje, NÃO tem `nome` em `cliente` (é a asserção
    // acima, verde). Aqui simulamos, de propósito, o defeito que este
    // despacho fechou — alguém repondo `nome` na saída de um cliente do
    // grupo — e provamos que a MESMA asserção usada como guarda (`Object.keys`
    // não contém "nome") vira VERMELHA para este objeto.
    const clienteComDefeitoReposto = { ...grupo.clientes[0]!, nome: clientesBrutos[0]!.name };

    expect(
      () => expect(Object.keys(clienteComDefeitoReposto)).not.toContain("nome"),
      "a guarda precisa ACUSAR quando o campo `nome` volta — se não lançar, a guarda está cega",
    ).toThrow();
  });

  it("a pergunta do cadastro duplicado continua respondida sem o nome: ids do grupo + quem tem parceria viva + tamanho", () => {
    const CLIENT_A = "cli_foocci_a_lixo";
    const CLIENT_B = "cli_foocci_b_com_parceria";
    const clientesBrutos = [
      { id: CLIENT_A, name: "FOOCCI" },
      { id: CLIENT_B, name: "FOOCCI" },
    ];
    const parceriasBrutas = [{ clientId: CLIENT_B, revogadaEm: null, validaAte: DEPOIS }];

    const retrato = montarRetratoDosConvites([], parceriasBrutas, clientesBrutos, AGORA);

    expect(retrato.gruposDeNomeColidente).toHaveLength(1);
    const grupo = retrato.gruposDeNomeColidente[0]!;

    // 1. tamanho do grupo
    expect(grupo.tamanho).toBe(2);
    expect(grupo.tamanho).toBe(grupo.clientes.length);

    // 2. ids do grupo — quem tem a lista sabe QUAIS cadastros colidem, mesmo
    //    sem o nome, porque abre o painel com sessão para ver o nome lá.
    expect(grupo.clientes.map((c) => c.id).sort()).toEqual([CLIENT_A, CLIENT_B].sort());

    // 3. quem tem parceria viva — a causa do caso do Marcos continua visível.
    const a = grupo.clientes.find((c) => c.id === CLIENT_A);
    const b = grupo.clientes.find((c) => c.id === CLIENT_B);
    expect(a?.temParceriaViva, "A é o cadastro sem parceria — a causa do caso").toBe(false);
    expect(b?.temParceriaViva, "B carrega a parceria viva").toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// decidirConvite: a régua pura, isolada — reforça que a ordem é a documentada
// ════════════════════════════════════════════════════════════════════════════
describe("decidirConvite: a ordem é token_desconhecido → revogado → vencido → parceria_nao_esta_viva", () => {
  it("convite nulo → token_desconhecido, mesmo com parceria viva", () => {
    expect(decidirConvite(null, { revogadaEm: null, validaAte: DEPOIS }, AGORA)).toBe("token_desconhecido");
  });

  it("revogado tem prioridade sobre vencido", () => {
    const convite = { clientId: "x", expiraEm: JA_PASSOU, revogadoEm: JA_PASSOU };
    expect(decidirConvite(convite, { revogadaEm: null, validaAte: DEPOIS }, AGORA)).toBe("revogado");
  });

  it("parceria exatamente no instante 'agora' ainda VALE (é '<', não '<=')", () => {
    const convite = { clientId: "x", expiraEm: DEPOIS, revogadoEm: null };
    expect(decidirConvite(convite, { revogadaEm: null, validaAte: AGORA }, AGORA)).toBeNull();
  });
});
