// AS TRÊS TRAVAS DA HOMOLOGAÇÃO FINAL — o núcleo puro, sem rota e sem banco.
//
// `a-porta-do-connect.test.ts` prova as travas ONDE ELAS ACONTECEM (a rota) e
// `execucao-carimbada.test.ts` prova a resolução do cliente contra SQLite de
// verdade. Este arquivo é a terceira camada, e existe por um motivo específico:
// as regras que decidem — a lista de uma, a recusa do cliente informado, a
// escolha entre linhas candidatas — são funções puras, e função pura merece
// teste que roda em milissegundos e nomeia o caso limite.
//
// Determinações do CEO de 30/08/2026 cobertas aqui:
//   3. o segredo é `CONNECT_SECRET` e mais nada — e o encosto não volta calado;
//   4. a função é uma lista de uma;
//   5. ⭐ o cliente não vem de quem chama;
//   9. a resposta continua identificada como RASCUNHO.

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  DOMINIO_DO_CLIENTE_FALSO,
  MARCA_DO_CLIENTE_FALSO,
} from "@/lib/agency/cliente-falso/trava-de-saida";
import {
  conferirPedido,
  FUNCAO_DO_PILOTO,
  FUNCOES_PERMITIDAS,
  CAMPOS_DE_CLIENTE_PROIBIDOS,
} from "@/lib/agency/connect/contrato";
import {
  CARACTERES_DISTINTOS_MINIMOS,
  TAMANHO_MINIMO_DO_SEGREDO,
  VARIAVEL_DO_SEGREDO,
  conferirSegredo,
  segredoApresentado,
  segredoDaPorta,
} from "@/lib/agency/connect/porta-do-despacho";
import {
  escolherClienteDeHomologacao,
  type LinhaDeCliente,
} from "@/lib/agency/connect/cliente-de-homologacao";
import {
  SELO_DE_RASCUNHO,
  provaDaLinha,
  type LinhaDeExecucaoLida,
} from "@/lib/agency/connect/despacho";
import { AVISO_DE_RASCUNHO } from "@/lib/agency/connect/realizar-sintetico";

const RAIZ = process.cwd();

/** O corpo mínimo que atravessa o conferidor. Sem cliente — não existe campo. */
function corpo(extra: Record<string, unknown> = {}) {
  return {
    modo: "homologacao",
    sintetico: true,
    pergunta: "e aí, como está o atendimento?",
    ...extra,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ⭐ A-1 da auditoria independente (30/08/2026) — O PISO DO SEGREDO.
//
// A reprodução do auditor: `CONNECT_SECRET="x"` mais `authorization: Bearer x`
// devolviam HTTP 200, estado executado, com linha gravada no banco. A guarda
// era `process.env.CONNECT_SECRET?.trim() || null` — sem piso nenhum. O irmão
// Foocci já tinha o piso de 16 (`src/services/connect/porta.ts:63`).
//
// Aqui a decisão é medida onde ela MORA (função pura); o comportamento pela
// rota tem o par em `a-porta-do-connect.test.ts`.
// ═══════════════════════════════════════════════════════════════════════════
describe("A-1 — segredo abaixo do piso é porta DESLIGADA, não porta fraca", () => {
  /** Um segredo que cumpre tudo: comprido e variado. */
  const BOM = "segredo-de-homologacao-do-connect";

  /** Um ambiente com UMA variável, e nenhuma outra — a guarda é pura, e é isso
   *  que permite montar o mundo inteiro dela numa linha. */
  function ambiente(segredo: string): NodeJS.ProcessEnv {
    return { [VARIAVEL_DO_SEGREDO]: segredo } as unknown as NodeJS.ProcessEnv;
  }

  it.each([
    ["o segredo de UM caractere que o auditor usou", "x"],
    ["quinze caracteres — um a menos que o piso", "a".repeat(7) + "bcdefgh"],
    ["vazio", ""],
    ["só espaço em branco", "        "],
    ["curto com espaços em volta para parecer longo", "   x   "],
  ])("desliga a porta com %s", (_caso, valor) => {
    expect(segredoDaPorta(ambiente(valor))).toBeNull();
  });

  it("⭐ A VARIANTE VIZINHA — dezesseis caracteres repetidos também é porta desligada", () => {
    // O piso de comprimento sozinho fecharia o buraco medido e deixaria este,
    // um metro ao lado: `xxxxxxxxxxxxxxxx` tem o tamanho e não é um segredo.
    for (const marcador of ["x".repeat(16), "ab".repeat(10), "1234".repeat(5), "-".repeat(20)]) {
      expect(marcador.length).toBeGreaterThanOrEqual(TAMANHO_MINIMO_DO_SEGREDO);
      expect(
        segredoDaPorta(ambiente(marcador)),
        `"${marcador}" passou no piso — marcador de lugar não é segredo`,
      ).toBeNull();
    }
  });

  it("A OUTRA METADE — o segredo legítimo passa, e passa com espaço em volta", () => {
    expect(segredoDaPorta(ambiente(BOM))).toBe(BOM);
    expect(segredoDaPorta(ambiente(`  ${BOM}\n`))).toBe(BOM);
    // E um segredo aleatório do tamanho mínimo — o caso real de produção.
    const aleatorio = "K7pQ2mZ9xR4tB6wL";
    expect(aleatorio.length).toBe(TAMANHO_MINIMO_DO_SEGREDO);
    expect(new Set(aleatorio).size).toBeGreaterThanOrEqual(CARACTERES_DISTINTOS_MINIMOS);
    expect(segredoDaPorta(ambiente(aleatorio))).toBe(aleatorio);
  });

  it("⭐ o segredo curto NÃO é comparado com coisa nenhuma: é 503, e nunca 401", () => {
    // A ordem importa. Se a comparação viesse primeiro, `Bearer x` contra
    // `CONNECT_SECRET="x"` conferiria — que é exatamente o 200 do auditor.
    const r = conferirSegredo("Bearer x", ambiente("x"));
    expect(r.ok, "o segredo de um caractere voltou a abrir a porta").toBe(false);
    if (r.ok) return;
    expect(r.status).toBe(503);
    expect(r.motivo).toMatch(/permanece fechada/i);
    expect(r.motivo).toContain(String(TAMANHO_MINIMO_DO_SEGREDO));
  });

  it("com a porta LIGADA, o cabeçalho errado é 401 — a distinção não se perdeu", () => {
    const env = ambiente(BOM);
    expect(conferirSegredo("Bearer chute", env)).toEqual({ ok: false, status: 401, motivo: "segredo inválido" });
    expect(conferirSegredo(null, env)).toMatchObject({ status: 401 });
    expect(conferirSegredo(`Basic ${BOM}`, env)).toMatchObject({ status: 401 });
    expect(conferirSegredo(BOM, env)).toMatchObject({ status: 401 }); // sem o esquema
  });

  it("A OUTRA METADE — o cabeçalho certo atravessa, com o esquema em qualquer caixa", () => {
    const env = ambiente(BOM);
    expect(conferirSegredo(`Bearer ${BOM}`, env)).toEqual({ ok: true });
    expect(conferirSegredo(`bearer ${BOM}`, env)).toEqual({ ok: true });
    expect(conferirSegredo(`BEARER  ${BOM}  `, env)).toEqual({ ok: true });
  });

  it("o valor do segredo NUNCA é normalizado — normalizar apaga diferença que conta", () => {
    expect(segredoApresentado(`Bearer ${BOM.toUpperCase()}`)).toBe(BOM.toUpperCase());
    expect(conferirSegredo(`Bearer ${BOM.toUpperCase()}`, ambiente(BOM)))
      .toMatchObject({ status: 401 });
  });
});

// ───────────────────────────────────────────────────────────────────────────
// TRAVA 3 — segredo de outra finalidade não abre porta corporativa.
// ───────────────────────────────────────────────────────────────────────────
describe("trava 3 — o encosto no PILOTO_SECRET não pode voltar sem alguém ver", () => {
  // A trava de comportamento está em `a-porta-do-connect.test.ts` (503 com o
  // segredo do piloto configurado). Esta aqui é a trava contra o RETORNO
  // SILENCIOSO: um `|| process.env.PILOTO_SECRET` reintroduzido numa refatoração
  // futura passaria por aquele teste apenas se alguém também mexesse nele. Aqui
  // o próprio arquivo da rota é lido, e a leitura só admite uma menção — a que
  // EXPLICA por que ele não é aceito.
  const rota = fs.readFileSync(path.join(RAIZ, "app/api/connect/despacho/route.ts"), "utf8");
  // ⚠️ A GUARDA MUDOU DE CASA em 30/08/2026 (defeito A-1 da auditoria): ela é
  // função pura em `lib/agency/connect/porta.ts` e a rota virou casca. Esta
  // leitura acompanha a mudança e fica MAIS estrita, não menos — antes se exigia
  // que a rota lesse UM segredo só; agora se exige que ela não leia NENHUM, e
  // que o único lugar que lê o segredo desta porta seja o módulo da guarda.
  const porta = fs.readFileSync(path.join(RAIZ, "lib/agency/connect/porta-do-despacho.ts"), "utf8");

  /**
   * O CÓDIGO, sem os comentários. A distinção importa e não é preciosismo: os
   * dois arquivos CITAM `process.env.CONNECT_SECRET?.trim() || null` — a linha
   * que a auditoria reprovou — para registrar o que foi consertado. Uma leitura
   * que não separasse citação de leitura reprovaria a própria explicação, e a
   * lição seria "apague o comentário", que é o contrário do que se quer.
   */
  function codigoSemComentarios(fonte: string): string {
    return fonte.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  }

  it("a guarda lê CONNECT_SECRET e nenhum outro segredo de ambiente", () => {
    const codigo = codigoSemComentarios(porta);
    const lidos = [...codigo.matchAll(/env\[\s*([A-Za-z_"'`]+)\s*\]|process\.env\.([A-Z_]+)/g)].map((m) =>
      (m[1] ?? m[2])!.replace(/["'`]/g, ""),
    );
    // A leitura é indireta, pela constante — e a constante é CONNECT_SECRET.
    expect(lidos).toContain("VARIAVEL_DO_SEGREDO");
    expect(codigo).toContain('VARIAVEL_DO_SEGREDO = "CONNECT_SECRET"');
    expect(
      lidos.filter((v) => v !== "VARIAVEL_DO_SEGREDO"),
      "a porta do Connect voltou a ler outro segredo de ambiente — segredo de outra finalidade não abre porta corporativa",
    ).toEqual([]);
  });

  it("⭐ a ROTA não lê variável de ambiente nenhuma — a decisão mora na guarda pura", () => {
    expect(
      [...codigoSemComentarios(rota).matchAll(/process\.env\.([A-Z_]+)/g)].map((m) => m[1]),
      "a rota voltou a decidir sobre segredo por conta própria; a decisão tem que morar em porta.ts, onde ela é testável nas duas metades sem levantar HTTP",
    ).toEqual([]);
  });

  it("PILOTO_SECRET só aparece como explicação, nunca como leitura", () => {
    // O comentário que registra a decisão, e a FRASE de recusa que o operador
    // lê ("não existe encosto em PILOTO_SECRET…"), continuam vivos — os dois
    // são explicação, e explicação é o que se quer manter.
    expect(rota + porta).toContain("PILOTO_SECRET");
    // O que não pode voltar é a LEITURA. O teste anterior já prova o caso geral
    // (a guarda lê uma variável só); este nomeia o encosto que já existiu aqui,
    // para que a reintrodução tenha um vermelho com o nome dela.
    const codigo = codigoSemComentarios(rota) + codigoSemComentarios(porta);
    expect(codigo).not.toMatch(/process\.env\.PILOTO_SECRET/);
    expect(codigo).not.toMatch(/env\[\s*["'`]?PILOTO_SECRET/);
    expect(codigo).not.toMatch(/VARIAVEL_DO_SEGREDO\s*=\s*["'`]PILOTO_SECRET/);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// TRAVA 4 — a função é uma lista de uma.
// ───────────────────────────────────────────────────────────────────────────
describe("trava 4 — a lista de uma", () => {
  it("a lista tem exatamente um item, e é o gerente do piloto", () => {
    expect(FUNCOES_PERMITIDAS).toEqual([FUNCAO_DO_PILOTO]);
    expect(FUNCAO_DO_PILOTO).toBe("manager-atendimento");
  });

  it.each([
    ["conversational-sdr", "outra ficha real do catálogo"],
    ["pm-orchestrator", "uma ficha de outro departamento"],
    ["manager-atendimento ", "o nome certo com espaço à direita"],
    ["Manager-Atendimento", "o nome certo com caixa trocada"],
    ["", "vazio"],
  ])("recusa %s (%s), nomeando o que foi pedido", (funcao) => {
    const r = conferirPedido(corpo({ funcao }));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.motivo).toContain(JSON.stringify(funcao));
    expect(r.motivo).toContain(FUNCAO_DO_PILOTO);
  });

  it.each([[42], [true], [{ funcao: "manager-atendimento" }], [["manager-atendimento"]]])(
    "tipo errado (%s) não cai mais no padrão silencioso — vira recusa",
    (funcao) => {
      const r = conferirPedido(corpo({ funcao }));
      expect(r.ok).toBe(false);
    },
  );

  it("a outra metade — a função permitida passa, e a ausência vale pela única", () => {
    const comNome = conferirPedido(corpo({ funcao: FUNCAO_DO_PILOTO }));
    expect(comNome.ok).toBe(true);
    if (comNome.ok) expect(comNome.pedido.funcao).toBe(FUNCAO_DO_PILOTO);

    const semNome = conferirPedido(corpo());
    expect(semNome.ok).toBe(true);
    if (semNome.ok) expect(semNome.pedido.funcao).toBe(FUNCAO_DO_PILOTO);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// ⭐ TRAVA 5 — o cliente não vem de quem chama.
// ───────────────────────────────────────────────────────────────────────────
describe("trava 5 — nenhum campo de cliente é entrada", () => {
  it("os dois campos proibidos estão nomeados em um lugar só", () => {
    expect([...CAMPOS_DE_CLIENTE_PROIBIDOS]).toEqual(["clienteId", "cliente"]);
  });

  it.each([
    ["clienteId", "cli-de-producao-de-alguem"],
    ["clienteId", ""],
    ["clienteId", null],
    ["cliente", `Cantina da Prova ${MARCA_DO_CLIENTE_FALSO}`],
    ["cliente", "Padaria do Zé"],
    ["cliente", null],
  ])("recusa quando %s vem no corpo, mesmo valendo %s", (campo, valor) => {
    const r = conferirPedido(corpo({ [campo]: valor }));
    expect(r.ok, `"${campo}" passou — a porta voltou a deixar o chamador escolher cliente`).toBe(false);
    if (r.ok) return;
    expect(r.motivo).toContain(`"${campo}" não é mais entrada desta porta`);
    expect(r.motivo).toMatch(/resolvido pelo próprio gateway/i);
  });

  it("o pedido conferido não tem onde guardar cliente — nem por engano de código", () => {
    const r = conferirPedido(corpo());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(Object.keys(r.pedido)).not.toContain("cliente");
    expect(Object.keys(r.pedido)).not.toContain("clienteId");
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe("trava 5 — a escolha entre linhas candidatas", () => {
  const sintetico: LinhaDeCliente = {
    id: "cli-sintetico",
    name: `Cantina da Prova ${MARCA_DO_CLIENTE_FALSO}`,
    email: `contato@${DOMINIO_DO_CLIENTE_FALSO}`,
  };

  it("aceita a linha que cumpre AS DUAS condições", () => {
    const r = escolherClienteDeHomologacao([sintetico]);
    expect(r).not.toBeNull();
    expect(r!.id).toBe("cli-sintetico");
    expect(r!.conferido.carimbo).toBe(MARCA_DO_CLIENTE_FALSO);
    expect(r!.conferido.dominio).toBe(DOMINIO_DO_CLIENTE_FALSO);
  });

  it.each<[string, LinhaDeCliente]>([
    ["domínio real, carimbo certo", { id: "a", name: `Loja ${MARCA_DO_CLIENTE_FALSO}`, email: "a@loja.com.br" }],
    ["domínio certo, sem carimbo", { id: "b", name: "Padaria do Zé", email: `b@${DOMINIO_DO_CLIENTE_FALSO}` }],
    ["sem e-mail nenhum", { id: "c", name: `Loja ${MARCA_DO_CLIENTE_FALSO}`, email: null }],
    ["e-mail vazio", { id: "d", name: `Loja ${MARCA_DO_CLIENTE_FALSO}`, email: "   " }],
    [
      "domínio só PARECIDO — sufixo colado sem ponto nem arroba",
      { id: "e", name: `Loja ${MARCA_DO_CLIENTE_FALSO}`, email: `x@fake${DOMINIO_DO_CLIENTE_FALSO}` },
    ],
    [
      "o domínio fictício como PREFIXO de um domínio real",
      { id: "f", name: `Loja ${MARCA_DO_CLIENTE_FALSO}`, email: `x@${DOMINIO_DO_CLIENTE_FALSO}.com.br` },
    ],
  ])("descarta: %s", (_caso, linha) => {
    expect(escolherClienteDeHomologacao([linha])).toBeNull();
  });

  it("com lixo na frente, a escolha é a primeira linha que passa nas duas", () => {
    const r = escolherClienteDeHomologacao([
      { id: "real", name: "Padaria do Zé", email: "ze@padaria.com.br" },
      { id: "meio-caminho", name: "Padaria do Zé", email: `ze@${DOMINIO_DO_CLIENTE_FALSO}` },
      sintetico,
    ]);
    expect(r!.id).toBe("cli-sintetico");
  });

  it("lista vazia devolve null — e é isso que faz a porta recusar em vez de inventar", () => {
    expect(escolherClienteDeHomologacao([])).toBeNull();
  });
});

// ───────────────────────────────────────────────────────────────────────────
// TRAVA 9 — a resposta continua identificada como RASCUNHO.
// ───────────────────────────────────────────────────────────────────────────
describe("trava 9 — o selo de rascunho é inequívoco nos dois lugares", () => {
  it("o campo que a Control Room lê não deixa margem: booleano, rótulo e frase", () => {
    expect(SELO_DE_RASCUNHO.rascunho).toBe(true);
    expect(SELO_DE_RASCUNHO.natureza).toBe("RASCUNHO");
    expect(SELO_DE_RASCUNHO.aviso).toMatch(/^RASCUNHO —/);
    expect(SELO_DE_RASCUNHO.aviso).toMatch(/NÃO é a comunicação final e inteligente do gerente/);
    expect(SELO_DE_RASCUNHO.aviso).toMatch(/sem provedor de IA/);
  });

  it("o texto do artefato abre com o aviso, em palavras que qualquer um entende", () => {
    expect(AVISO_DE_RASCUNHO).toMatch(/RASCUNHO/);
    expect(AVISO_DE_RASCUNHO).toMatch(/NÃO É A COMUNICAÇÃO FINAL DO GERENTE/);
    expect(AVISO_DE_RASCUNHO).toMatch(/não envie a cliente/i);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ⭐ SONDA 16 — a prova conferia PARA SI, e não publicava o que conferiu.
//
// A trava interna estava certa e continua onde estava: as quatro conferências
// de identidade sobre a linha relida (fio, cliente, função e o próprio id).
// O defeito era do outro lado do balcão — a `prova` devolvida não trazia
// `correlationId` nem `funcao`, então quem lê a resposta não tinha como
// conferir DE QUAL EXECUÇÃO aquele `relido_do_banco: true` estava falando.
//
// ─── E POR QUE ESTE TESTE É DE UMA FUNÇÃO PURA, E NÃO DE PONTA A PONTA ─────
//
// O defeito que a sonda 16 caça é uma prova que ECOA o pedido de volta. Ele é
// invisível de fora: no caminho feliz, `pedido.funcao` e `linha.funcaoId` são
// obrigatoriamente iguais (a conferência de identidade garante isso), e no
// caminho em que eles diferem a porta nem chega a devolver prova — devolve
// `nao_verificavel`. Ou seja: **nenhuma asserção de caixa-preta distingue o
// certo do errado aqui.**
//
// Por isso o conserto não é um teste, é a ASSINATURA: `provaDaLinha` recebe a
// LINHA e não recebe o pedido, então o eco não é uma coisa que alguém tem que
// lembrar de não fazer — é uma coisa que não dá para escrever. `prompt é
// aviso; código é trava`. O que este teste faz é fixar isso: ele monta uma
// linha cujo fio e cuja função NÃO SÃO os de pedido nenhum desta porta, e
// exige que a prova saia com os valores DELA.
// ═══════════════════════════════════════════════════════════════════════════
describe("sonda 16 — a prova diz de qual execução ela foi relida", () => {
  /** Uma linha relida cujos valores não coincidem com pedido nenhum: fio de
   *  outro formato, função que não está na lista de uma, datas próprias. */
  const linha: LinhaDeExecucaoLida & { fim: Date } = {
    id: "exec-da-linha-relida",
    funcaoId: "funcao-que-so-existe-na-linha",
    departamentoId: "client-service-sdr",
    correlationId: "fio-que-so-existe-na-linha",
    inicio: new Date("2026-08-30T15:00:00.000Z"),
    fim: new Date("2026-08-30T15:00:02.500Z"),
    resultado: '{"situacao":"ok"}',
    ator: "ia",
    modelo: "rule-based-sintetico",
    custoUsd: 0,
    clienteId: "cli-sintetico",
  };

  it("⭐ os dois campos que faltavam saem da LINHA — fio e função", () => {
    const prova = provaDaLinha(linha);
    expect(prova.correlationId).toBe("fio-que-so-existe-na-linha");
    expect(prova.funcao).toBe("funcao-que-so-existe-na-linha");
    // E nenhum deles é o que um pedido legítimo carregaria: se a prova ecoasse
    // o pedido, o valor que sairia aqui seria "manager-atendimento".
    expect(prova.funcao).not.toBe(FUNCAO_DO_PILOTO);
  });

  it("a prova inteira vem da linha, campo a campo — nada é deduzido", () => {
    expect(provaDaLinha(linha)).toEqual({
      tabela: "ExecucaoV2",
      relido_do_banco: true,
      execucaoId: "exec-da-linha-relida",
      correlationId: "fio-que-so-existe-na-linha",
      funcao: "funcao-que-so-existe-na-linha",
      inicio: "2026-08-30T15:00:00.000Z",
      fim: "2026-08-30T15:00:02.500Z",
      duracaoMs: 2500,
      ator: "ia",
      modelo: "rule-based-sintetico",
      custoUsd: 0,
    });
  });

  it("trocar QUALQUER coordenada da linha troca a prova — nenhum campo é constante disfarçada", () => {
    const outra = provaDaLinha({
      ...linha,
      id: "outro-id",
      funcaoId: "outra-funcao",
      correlationId: "outro-fio",
    });
    expect(outra.execucaoId).toBe("outro-id");
    expect(outra.funcao).toBe("outra-funcao");
    expect(outra.correlationId).toBe("outro-fio");
  });

  // ── A TRAVA ESTRUTURAL: o defeito não pode voltar pela porta do lado ──────
  //
  // `provaDaLinha` impede o eco DENTRO dela. O que sobra é o ponto de chamada:
  // alguém poderia, numa refatoração, voltar a montar o objeto `prova` à mão
  // no retorno de `despachar` e ecoar `pedido.funcao` ali. Nenhuma asserção de
  // comportamento pega isso (ver a nota grande acima). Esta leitura pega — e é
  // o mesmo instrumento que a trava 3 usa para o `PILOTO_SECRET`.
  it("⭐ o retorno de sucesso monta a prova com `provaDaLinha`, e não à mão", () => {
    const fonte = fs.readFileSync(path.join(RAIZ, "lib/agency/connect/despacho.ts"), "utf8");
    const codigo = fonte.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

    // `prova:` aparece em dois papéis no arquivo: a ANOTAÇÃO DE TIPO no
    // contrato da resposta (`prova: ProvaDaExecucao;`) e o VALOR, no retorno de
    // sucesso. Separar os dois é o que faz esta leitura mirar no valor.
    const ehAnotacaoDeTipo = (v: string) => /^[A-Z][A-Za-z]*;$/.test(v);
    const ocorrencias = [...codigo.matchAll(/\bprova:\s*([^\n]*)/g)].map((m) => m[1]!.trim());
    const valores = ocorrencias.filter((v) => !ehAnotacaoDeTipo(v));

    expect(ocorrencias.filter(ehAnotacaoDeTipo), "o contrato da resposta mudou de forma").toHaveLength(1);
    expect(valores, "o número de lugares que MONTAM a prova mudou").toHaveLength(1);
    expect(
      valores[0],
      "a prova voltou a ser montada à mão no retorno — é por ali que o eco do pedido volta",
    ).toMatch(/^provaDaLinha\(/);

    // E a função que monta a prova não conhece o pedido: se `pedido` aparecer
    // na assinatura dela, a trava deixou de ser a assinatura.
    const assinatura = codigo.match(/export function provaDaLinha\(([^)]*)\)/);
    expect(assinatura, "provaDaLinha sumiu ou mudou de forma").not.toBeNull();
    expect(
      assinatura![1],
      "provaDaLinha passou a receber o pedido — o eco voltou a ser possível de escrever",
    ).not.toMatch(/pedido/);
  });
});
