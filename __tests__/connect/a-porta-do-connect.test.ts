// A PORTA DO CONNECT — o que ela BARRA, na própria rota HTTP.
//
// As travas de entrada valem pelo que recusam, e recusa só é recusa se for
// medida no lugar onde ela acontece: a rota. Aqui a rota é a de verdade
// (`app/api/connect/despacho/route.ts`), com `NextRequest` montado à mão; só o
// banco é de mentira, porque nenhuma destas provas depende do que está gravado
// — e a metade que DEPENDE do banco tem arquivo próprio
// (`execucao-carimbada.test.ts`), com SQLite real.
//
// As duas metades da regra da casa estão distribuídas assim:
//   • aqui: o problema plantado é BARRADO (segredo de outra finalidade, segredo
//     ausente, segredo errado, modo de produção, sintético falso, função fora da
//     lista de uma, cliente escolhido por quem chama, ficha que não existe) — e
//     o caso limpo NÃO é barrado por engano;
//   • lá: o caminho legítimo executa e devolve o identificador relido.
//
// ─── AS TRÊS TRAVAS DA HOMOLOGAÇÃO FINAL (30/08/2026) ──────────────────────
//
// Três determinações do CEO viraram trava, e cada uma tem aqui o seu par:
//   3. `CONNECT_SECRET` e mais nada — `PILOTO_SECRET` não abre mais;
//   4. a função é lista de uma — `manager-atendimento` e nenhuma outra;
//   5. ⭐ o cliente não vem de quem chama — `cliente` e `clienteId` são recusa.

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";

// ── O banco de mentira, mínimo: só o que a rota toca antes de decidir. ──────
const memoria = vi.hoisted(() => ({
  execucoes: [] as Record<string, unknown>[],
  recusas: [] as Record<string, unknown>[],
  // O cliente sintético que o GATEWAY vai resolver sozinho. A lista é regulável
  // por teste: esvaziá-la é como se prova que a porta recusa sem cliente
  // plantado, em vez de inventar um.
  clientes: [] as { id: string; name: string; email: string | null }[],
  // ⭐ O balde do freio de ritmo. Ele CONTA de verdade (não é um `true` fixo):
  // sem contar, nem a metade que barra nem a metade que passa seriam medidas.
  baldes: new Map<string, { contagem: number; resetAt: number }>(),
  /** Liga o "banco fora do ar" só para o balde — é como se prova o fail-closed. */
  baldeQuebrado: false,
}));
const db = vi.hoisted(() => ({
  execucaoV2: {
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      const linha = { id: `exec-${memoria.execucoes.length + 1}`, ...data };
      memoria.execucoes.push(linha);
      return linha;
    }),
    findUnique: vi.fn(async ({ where }: { where: { id: string } }) =>
      memoria.execucoes.find((e) => e.id === where.id) ?? null),
    findMany: vi.fn(async () => []),
  },
  recusaV2: {
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      const linha = { id: `recusa-${memoria.recusas.length + 1}`, ...data };
      memoria.recusas.push(linha);
      return linha;
    }),
  },
  client: {
    findMany: vi.fn(async () => memoria.clientes),
  },
  // A janela fixa de `lib/security/limite-no-banco.ts`, no mínimo que a rota
  // exercita: incrementar dentro do teto, reciclar a janela vencida, criar.
  rateLimitBucket: {
    updateMany: vi.fn(
      async ({ where, data }: { where: Record<string, never>; data: Record<string, never> }) => {
        if (memoria.baldeQuebrado) throw new Error("contador fora do ar");
        const w = where as unknown as {
          chave: string;
          resetAt?: { gt?: Date; lte?: Date };
          contagem?: { lt: number };
        };
        const d = data as unknown as { contagem?: number | { increment: number }; resetAt?: Date };
        const balde = memoria.baldes.get(w.chave);
        if (!balde) return { count: 0 };
        const agora = Date.now();
        if (w.resetAt?.gt && !(balde.resetAt > agora)) return { count: 0 };
        if (w.resetAt?.lte && !(balde.resetAt <= agora)) return { count: 0 };
        if (w.contagem?.lt !== undefined && !(balde.contagem < w.contagem.lt)) return { count: 0 };
        if (typeof d.contagem === "number") balde.contagem = d.contagem;
        else if (d.contagem) balde.contagem += d.contagem.increment;
        if (d.resetAt) balde.resetAt = d.resetAt.getTime();
        return { count: 1 };
      },
    ),
    create: vi.fn(async ({ data }: { data: { chave: string; contagem: number; resetAt: Date } }) => {
      if (memoria.baldeQuebrado) throw new Error("contador fora do ar");
      if (memoria.baldes.has(data.chave)) throw new Error("chave duplicada");
      memoria.baldes.set(data.chave, { contagem: data.contagem, resetAt: data.resetAt.getTime() });
      return data;
    }),
    findUnique: vi.fn(async ({ where }: { where: { chave: string } }) => {
      const balde = memoria.baldes.get(where.chave);
      return balde ? { resetAt: new Date(balde.resetAt) } : null;
    }),
    deleteMany: vi.fn(async () => ({ count: 0 })),
  },
}));
vi.mock("@/lib/db/client", () => ({ prisma: db }));

import { POST } from "@/app/api/connect/despacho/route";
import {
  DOMINIO_DO_CLIENTE_FALSO,
  MARCA_DO_CLIENTE_FALSO,
} from "@/lib/agency/cliente-falso/trava-de-saida";
import { FUNCAO_DO_PILOTO } from "@/lib/agency/connect/contrato";
import {
  BALDE_DAS_TENTATIVAS_FALHAS,
  BALDE_DO_TRABALHO,
  CHAMADAS_AUTENTICADAS_POR_JANELA,
  TENTATIVAS_FALHAS_POR_JANELA,
} from "@/lib/agency/connect/porta-do-despacho";

const SEGREDO = "segredo-de-homologacao-do-connect";
/** O segredo de OUTRA finalidade. Ele existe no ambiente — e não abre nada. */
const SEGREDO_DO_PILOTO = "segredo-do-piloto-interno-que-nao-abre-esta-porta";
const CLIENTE = `Cantina da Prova ${MARCA_DO_CLIENTE_FALSO}`;

/**
 * O IP do chamador, fixado para que a CHAVE do balde seja conferível no teste.
 * `203.0.113.7` é TEST-NET-3 (RFC 5737): endereço reservado para documentação,
 * que não é de ninguém e não roteia para lugar nenhum.
 */
const IP = "203.0.113.7";
const daControlRoom = { "x-forwarded-for": IP };
const CHAVE_DAS_FALHAS = `${BALDE_DAS_TENTATIVAS_FALHAS}:${IP}`;
const CHAVE_DO_TRABALHO = `${BALDE_DO_TRABALHO}:${IP}`;

function pedir(corpo: unknown, cabecalhos: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost/api/connect/despacho", {
    method: "POST",
    headers: { "content-type": "application/json", ...cabecalhos },
    body: JSON.stringify(corpo),
  });
}

/** Um corpo bem formado — cada teste estraga UM campo dele. Repare no que NÃO
 *  está aqui: cliente nenhum. O corpo legítimo não escolhe cliente. */
function corpoLimpo(extra: Record<string, unknown> = {}) {
  return {
    modo: "homologacao",
    sintetico: true,
    funcao: FUNCAO_DO_PILOTO,
    pergunta: "Por que o atendimento da Cantina está atrasado?",
    dossie: {
      "demanda do Gerente Geral com objetivo, prazo e critério de aceite": "Destravar o atendimento até hoje.",
      "capacidade atual do departamento (quem está livre e quem está ocupado)": "conversational-sdr livre.",
    },
    ...extra,
  };
}

const autorizado = { authorization: `Bearer ${SEGREDO}` };

beforeEach(() => {
  memoria.execucoes.length = 0;
  memoria.recusas.length = 0;
  memoria.clientes.length = 0;
  memoria.baldes.clear();
  memoria.baldeQuebrado = false;
  memoria.clientes.push({ id: "cli-sintetico-1", name: CLIENTE, email: `contato@${DOMINIO_DO_CLIENTE_FALSO}` });
  vi.stubEnv("CONNECT_SECRET", SEGREDO);
  // ⚠️ O segredo do piloto fica LIGADO na maioria dos casos de propósito: é
  // assim que se prova que ele não faz diferença nenhuma nesta porta.
  vi.stubEnv("PILOTO_SECRET", SEGREDO_DO_PILOTO);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

// ───────────────────────────────────────────────────────────────────────────
// TRAVA 3 do CEO — o segredo é próprio, e é o único.
// ───────────────────────────────────────────────────────────────────────────
describe("trava 1 — o segredo desta porta, e só ele", () => {
  it("⭐ com PILOTO_SECRET configurado e CONNECT_SECRET ausente, a porta PERMANECE FECHADA", async () => {
    // O encosto que o CEO mandou tirar: antes, este mesmo cenário abria a porta
    // corporativa para quem tivesse o segredo do piloto interno.
    vi.stubEnv("CONNECT_SECRET", "");
    vi.stubEnv("PILOTO_SECRET", SEGREDO_DO_PILOTO);

    const r = await POST(pedir(corpoLimpo(), { authorization: `Bearer ${SEGREDO_DO_PILOTO}` }));

    expect(r.status).toBe(503);
    const corpo = await r.json();
    expect(corpo.estado).toBe("recusado");
    expect(corpo.motivo).toMatch(/CONNECT_SECRET não está configurado/i);
    expect(corpo.motivo).toMatch(/segredo de outra finalidade não abre porta corporativa/i);
    // A prova de que não abriu por herança: nada foi executado.
    expect(memoria.execucoes).toHaveLength(0);
  });

  it("SEM segredo nenhum configurado a porta NÃO abre: 503, e não 401", async () => {
    vi.stubEnv("CONNECT_SECRET", "");
    vi.stubEnv("PILOTO_SECRET", "");
    const r = await POST(pedir(corpoLimpo(), autorizado));
    expect(r.status).toBe(503);
    expect((await r.json()).motivo).toMatch(/CONNECT_SECRET não está configurado/i);
    expect(memoria.execucoes).toHaveLength(0);
  });

  it("com CONNECT_SECRET configurado, apresentar o PILOTO_SECRET é 401", async () => {
    const r = await POST(pedir(corpoLimpo(), { authorization: `Bearer ${SEGREDO_DO_PILOTO}` }));
    expect(r.status).toBe(401);
    expect(memoria.execucoes).toHaveLength(0);
  });

  it("com segredo configurado e cabeçalho errado: 401", async () => {
    const r = await POST(pedir(corpoLimpo(), { authorization: "Bearer chute" }));
    expect(r.status).toBe(401);
    expect(memoria.execucoes).toHaveLength(0);
  });

  it("sem cabeçalho nenhum: 401", async () => {
    const r = await POST(pedir(corpoLimpo()));
    expect(r.status).toBe(401);
  });

  it("a outra metade — o segredo CERTO atravessa, com PILOTO_SECRET ligado ao lado", async () => {
    const r = await POST(pedir(corpoLimpo(), autorizado));
    expect(r.status, JSON.stringify(await r.clone().json())).toBe(200);
  });

  // ── ⭐ A-1 da auditoria independente, NA ROTA, com os valores do auditor ──
  it("⭐ CONNECT_SECRET=\"x\" + Bearer x: 503, e NADA é executado nem gravado", async () => {
    // A reprodução literal: o auditor obteve HTTP 200, `estado: executado`, e
    // linha gravada no banco. As três coisas são cobradas aqui.
    vi.stubEnv("CONNECT_SECRET", "x");
    const r = await POST(pedir(corpoLimpo(), { authorization: "Bearer x" }));

    expect(r.status, "o segredo de um caractere voltou a abrir a porta").toBe(503);
    const corpo = await r.json();
    expect(corpo.estado).toBe("recusado");
    expect(corpo.estado).not.toBe("executado");
    expect(corpo.motivo).toMatch(/permanece fechada/i);
    expect(memoria.execucoes, "houve linha gravada por uma porta que devia estar desligada").toHaveLength(0);
    expect(memoria.recusas).toHaveLength(0);
  });

  it("⭐ e o marcador de lugar de 16 caracteres iguais também não abre", async () => {
    // A variante vizinha: passa no piso de comprimento e não é segredo.
    vi.stubEnv("CONNECT_SECRET", "xxxxxxxxxxxxxxxx");
    const r = await POST(pedir(corpoLimpo(), { authorization: "Bearer xxxxxxxxxxxxxxxx" }));
    expect(r.status).toBe(503);
    expect(memoria.execucoes).toHaveLength(0);
  });

  it("um segredo de 16 caracteres VARIADOS abre normalmente — o piso não reprova o legítimo", async () => {
    vi.stubEnv("CONNECT_SECRET", "K7pQ2mZ9xR4tB6wL");
    const r = await POST(pedir(corpoLimpo(), { authorization: "Bearer K7pQ2mZ9xR4tB6wL" }));
    expect(r.status, JSON.stringify(await r.clone().json())).toBe(200);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// ⭐ O FREIO DE RITMO — DOIS BALDES, PORQUE SÃO DUAS POPULAÇÕES.
//
// ── O que este bloco media antes, e por que ele mudou ──────────────────────
//
// O freio nasceu junto com o piso do segredo, e a intenção estava certa: sem
// teto, 300 palpites passavam em 4 ms. O que ele NÃO tinha era separação — um
// balde só, por IP, cobrado antes de autenticar, contando na mesma janela quem
// adivinha e quem trabalha. O CI do PR #7 da Control Room ficou vermelho em
// três passos por isso (17 · porta dos fundos → 429; 4 · destinatário recebe e
// aceita → nao_verificavel com "ritmo excedido"; 13 · autoridade indevida →
// 429 ao segredo ERRADO), e nenhum dos três era defeito do chamador.
//
// ⚠️ UM TESTE DESTE BLOCO FOI REESCRITO, E VALE DIZER QUAL. Havia aqui um
// "o freio conta a tentativa ERRADA" que, depois de encher o balde com erros,
// EXIGIA 429 também para o segredo certo — "a consequência aceita", dizia o
// comentário. Não era consequência aceita: era o defeito medido, escrito como
// expectativa. O teste continua existindo com a mesma primeira metade (o erro
// enche o balde) e a segunda metade invertida (o acerto atravessa), que é a
// única leitura compatível com a bateria de homologação.
//
// ── As duas metades, e as duas são medidas, não raciocinadas ───────────────
//
//   BARRA: 300 palpites de segredo errado — 20 passam por 401 e 280 levam 429.
//   PASSA: a bateria legítima de 127 chamadas atravessa INTEIRA, sem um 429.
// ───────────────────────────────────────────────────────────────────────────
describe("o teto de ritmo — dois baldes, porque são duas populações", () => {
  // ── A METADE QUE BARRA ───────────────────────────────────────────────────

  it("⭐ os 300 palpites de segredo errado continuam sendo barrados — nada afrouxou", async () => {
    // O número é o do ataque medido: 300 palpites. O barulho do `console.warn`
    // do contador é capturado — e conferido, porque o rastro do estouro é
    // metade do valor do freio para quem opera.
    const avisos: string[] = [];
    const espia = vi.spyOn(console, "warn").mockImplementation((...a: unknown[]) => {
      avisos.push(a.map(String).join(" "));
    });
    try {
      const status: number[] = [];
      for (let i = 0; i < 300; i++) {
        const r = await POST(
          pedir(corpoLimpo(), { ...daControlRoom, authorization: `Bearer palpite-numero-${i}` }),
        );
        status.push(r.status);
      }

      expect(status.filter((s) => s === 401)).toHaveLength(TENTATIVAS_FALHAS_POR_JANELA);
      expect(status.filter((s) => s === 429)).toHaveLength(300 - TENTATIVAS_FALHAS_POR_JANELA);
      expect(status.filter((s) => s === 200), "um palpite atravessou").toHaveLength(0);
      expect(memoria.execucoes, "adivinhação gravou linha em ExecucaoV2").toHaveLength(0);

      // O rastro nomeia o balde — e NUNCA o identificador (o IP não vai ao log).
      expect(avisos.some((a) => a.includes(`balde=${BALDE_DAS_TENTATIVAS_FALHAS}`))).toBe(true);
      expect(avisos.some((a) => a.includes(IP)), "o IP vazou para o log").toBe(false);
    } finally {
      espia.mockRestore();
    }
  }, 60_000);

  it("⭐ adivinhação NÃO gasta vaga do balde de trabalho — os baldes são separados", async () => {
    for (let i = 0; i < 40; i++) {
      await POST(pedir(corpoLimpo(), { ...daControlRoom, authorization: `Bearer erro-${i}` }));
    }
    expect(memoria.baldes.get(CHAVE_DAS_FALHAS)?.contagem).toBe(TENTATIVAS_FALHAS_POR_JANELA);
    expect(
      memoria.baldes.has(CHAVE_DO_TRABALHO),
      "o balde do trabalho foi mordido por quem nem autenticou — é a mistura de populações de volta",
    ).toBe(false);
  });

  it("⭐ o freio continua contando a tentativa ERRADA — e é o acerto que atravessa", async () => {
    // PRIMEIRA METADE (inalterada): um freio que só contasse ACERTO não frearia
    // adivinhação nenhuma. Só houve erro aqui, e o balde encheu.
    for (let i = 0; i < 40; i++) {
      await POST(pedir(corpoLimpo(), { ...daControlRoom, authorization: `Bearer erro-${i}` }));
    }
    const maisUmErro = await POST(
      pedir(corpoLimpo(), { ...daControlRoom, authorization: "Bearer erro-41" }),
    );
    expect(maisUmErro.status).toBe(429);

    // SEGUNDA METADE (invertida, e é o conserto): o segredo CERTO, do MESMO IP,
    // na MESMA janela, atravessa. O 429 no acerto era o dano colateral medido —
    // é ele que derrubava a bateria da Control Room.
    const r = await POST(pedir(corpoLimpo(), { ...daControlRoom, ...autorizado }));
    expect(r.status, "quem tem o segredo foi barrado pelo balde de quem não tem").toBe(200);
  });

  it("⭐ o balde do trabalho é TETO, não enfeite: a chamada acima do teto para", async () => {
    // O balde é semeado no contador em vez de gastar 600 chamadas de verdade:
    // o que este teste prova é o LIMIAR, e o limiar é uma decisão do contador,
    // que já tem prova própria em `__tests__/security`. Gastar 600 execuções do
    // motor aqui mediria o mesmo e custaria minutos.
    memoria.baldes.set(CHAVE_DO_TRABALHO, {
      contagem: CHAMADAS_AUTENTICADAS_POR_JANELA - 1,
      resetAt: Date.now() + 60_000,
    });

    const ultimaQueCabe = await POST(pedir(corpoLimpo(), { ...daControlRoom, ...autorizado }));
    expect(ultimaQueCabe.status, "a chamada 600 foi barrada — o teto está um a menos").toBe(200);

    const primeiraQueNaoCabe = await POST(pedir(corpoLimpo(), { ...daControlRoom, ...autorizado }));
    expect(primeiraQueNaoCabe.status).toBe(429);
    const corpo = await primeiraQueNaoCabe.json();
    expect(corpo.motivo).toMatch(/tráfego JÁ AUTENTICADO/);
    expect(corpo.motivo).toContain(String(CHAMADAS_AUTENTICADAS_POR_JANELA));
    expect(primeiraQueNaoCabe.headers.get("Retry-After")).toBeTruthy();
    // Estourou ANTES de despachar: nada executou.
    expect(memoria.execucoes).toHaveLength(1);
  });

  it("os dois 429 dizem em QUAL balde se bateu — senão o operador não sabe o que houve", async () => {
    memoria.baldes.set(CHAVE_DAS_FALHAS, {
      contagem: TENTATIVAS_FALHAS_POR_JANELA,
      resetAt: Date.now() + 60_000,
    });
    memoria.baldes.set(CHAVE_DO_TRABALHO, {
      contagem: CHAMADAS_AUTENTICADAS_POR_JANELA,
      resetAt: Date.now() + 60_000,
    });

    const adivinhando = await POST(
      pedir(corpoLimpo(), { ...daControlRoom, authorization: "Bearer chute" }),
    );
    const trabalhando = await POST(pedir(corpoLimpo(), { ...daControlRoom, ...autorizado }));

    expect(adivinhando.status).toBe(429);
    expect(trabalhando.status).toBe(429);
    const m1 = (await adivinhando.json()).motivo as string;
    const m2 = (await trabalhando.json()).motivo as string;
    expect(m1).toMatch(/tentativas MALSUCEDIDAS/);
    expect(m2).toMatch(/tráfego JÁ AUTENTICADO/);
    expect(m1, "as duas recusas dizem a mesma coisa — o operador não distingue laço de ataque").not.toBe(m2);
  });

  // ── A OUTRA METADE: O TRABALHO LEGÍTIMO ATRAVESSA ────────────────────────

  it("⭐ A OUTRA METADE — a bateria legítima de 127 chamadas atravessa INTEIRA", async () => {
    // O número é o medido no CI do PR #7: 127 chamadas em 43 s (≈177/min), das
    // quais 107 levaram 429. Aqui elas cabem todas na MESMA janela fixa de 60 s
    // (o teste roda em bem menos que 43 s), o que torna a prova mais dura que a
    // corrida real: lá a rajada podia se partir entre duas janelas e aliviar o
    // teto; aqui ela não se parte.
    const status: number[] = [];
    for (let i = 0; i < 127; i++) {
      const r = await POST(pedir(corpoLimpo(), { ...daControlRoom, ...autorizado }));
      status.push(r.status);
    }

    expect(status.filter((s) => s === 429), "a bateria legítima voltou a levar 429").toHaveLength(0);
    expect(status.filter((s) => s === 200)).toHaveLength(127);
    expect(memoria.execucoes).toHaveLength(127);
    expect(memoria.baldes.get(CHAVE_DO_TRABALHO)?.contagem).toBe(127);
    // E o balde da adivinhação não foi tocado: trabalho não é palpite.
    expect(memoria.baldes.has(CHAVE_DAS_FALHAS)).toBe(false);
  }, 120_000);

  it("⭐ A BATERIA COMO ELA É — 127 legítimas MAIS as 9 batidas de credencial inválida", async () => {
    // A reprodução do vermelho do CI. A bateria não é só tráfego legítimo: ela
    // empurra a porta de propósito NOVE vezes (a sonda 14 bate com sete
    // segredos curtos e uma vez sem cabeçalho; o passo 13 bate com um segredo
    // errado), e essas nove precisam receber 401 — não 429. Um 429 não prova
    // que a porta OLHOU o segredo, e é isso que a sonda 13 existe para medir.
    const CURTOS = ["", "x", "1234", "segredo", "connect", "0123456789", "a".repeat(15)];
    const invalidas: number[] = [];
    const legitimas: number[] = [];

    for (const curto of CURTOS) {
      const r = await POST(pedir(corpoLimpo(), { ...daControlRoom, authorization: `Bearer ${curto}` }));
      invalidas.push(r.status);
    }
    // A batida sem cabeçalho nenhum (o "controle" da sonda 14).
    invalidas.push((await POST(pedir(corpoLimpo(), daControlRoom))).status);
    // E o segredo errado do passo 13.
    invalidas.push(
      (await POST(pedir(corpoLimpo(), { ...daControlRoom, authorization: "Bearer segredo-errado-de-proposito" })))
        .status,
    );

    for (let i = 0; i < 127; i++) {
      legitimas.push((await POST(pedir(corpoLimpo(), { ...daControlRoom, ...autorizado }))).status);
    }

    expect(invalidas).toHaveLength(9);
    expect(
      invalidas.filter((s) => s === 401),
      "a porta respondeu 429 ao segredo errado — é o vermelho da sonda 13 de volta",
    ).toHaveLength(9);
    expect(legitimas.filter((s) => s === 200), "a bateria legítima foi derrubada").toHaveLength(127);
    // As nove nunca chegaram perto do teto de vinte, e por isso não roubam nada.
    expect(memoria.baldes.get(CHAVE_DAS_FALHAS)?.contagem).toBe(9);
  }, 120_000);

  it("A OUTRA METADE, curta — dentro do teto, o caso legítimo atravessa sem tropeçar", async () => {
    for (let i = 0; i < 5; i++) {
      const r = await POST(pedir(corpoLimpo(), autorizado));
      expect(r.status, `a requisição legítima nº ${i + 1} foi barrada por engano`).toBe(200);
    }
  });

  // ── OS CASOS DE BORDA DOS DOIS BALDES ────────────────────────────────────

  it("⭐ a porta DESLIGADA responde 503 sem gastar vaga nenhuma — não há segredo a adivinhar", async () => {
    vi.stubEnv("CONNECT_SECRET", "");
    for (let i = 0; i < 50; i++) {
      const r = await POST(pedir(corpoLimpo(), { ...daControlRoom, authorization: `Bearer tentativa-${i}` }));
      expect(r.status).toBe(503);
    }
    expect(
      memoria.baldes.size,
      "a porta desligada gastou escrita no banco por batida não autenticada — amplificação de graça",
    ).toBe(0);
    expect(memoria.execucoes).toHaveLength(0);
  });

  it("⭐ contador fora do ar NEGA — contador que não conta não autoriza", async () => {
    memoria.baldeQuebrado = true;
    const r = await POST(pedir(corpoLimpo(), { ...daControlRoom, ...autorizado }));
    expect(r.status).toBe(503);
    expect((await r.json()).motivo).toMatch(/contador que não conta não autoriza/i);
    expect(memoria.execucoes).toHaveLength(0);
  });

  it("⭐ contador fora do ar nega TAMBÉM quem errou o segredo — o fail-closed é dos dois baldes", async () => {
    memoria.baldeQuebrado = true;
    const r = await POST(pedir(corpoLimpo(), { ...daControlRoom, authorization: "Bearer chute" }));
    expect(r.status).toBe(503);
    expect((await r.json()).motivo).toMatch(/contador que não conta não autoriza/i);
    expect(memoria.execucoes).toHaveLength(0);
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe("travas 2 e 3 — homologação com dado sintético, e nada além disso", () => {
  it('modo "producao" é recusado com o motivo, e nunca executa', async () => {
    const r = await POST(pedir(corpoLimpo({ modo: "producao" }), autorizado));
    expect(r.status).toBe(400);
    const corpo = await r.json();
    expect(corpo.estado).toBe("recusado");
    expect(corpo.motivo).toMatch(/modo inválido/i);
    expect(corpo.motivo).toMatch(/homologacao/);
    expect(memoria.execucoes).toHaveLength(0);
  });

  it("modo ausente NÃO ganha padrão — a trava não é parâmetro", async () => {
    const semModo = corpoLimpo();
    delete (semModo as Record<string, unknown>).modo;
    const r = await POST(pedir(semModo, autorizado));
    expect(r.status).toBe(400);
    expect((await r.json()).motivo).toMatch(/modo inválido/i);
  });

  it("sintetico: false é recusado", async () => {
    const r = await POST(pedir(corpoLimpo({ sintetico: false }), autorizado));
    expect(r.status).toBe(400);
    expect((await r.json()).motivo).toMatch(/sintetico inválido/i);
    expect(memoria.execucoes).toHaveLength(0);
  });

  it('sintetico: "true" em TEXTO não passa por true', async () => {
    const r = await POST(pedir(corpoLimpo({ sintetico: "true" }), autorizado));
    expect(r.status).toBe(400);
    expect((await r.json()).motivo).toMatch(/sintetico inválido/i);
  });

  it("sintetico ausente é recusado — não existe padrão", async () => {
    const sem = corpoLimpo();
    delete (sem as Record<string, unknown>).sintetico;
    const r = await POST(pedir(sem, autorizado));
    expect(r.status).toBe(400);
    expect((await r.json()).motivo).toMatch(/sintetico inválido/i);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// TRAVA 4 do CEO — a função é uma lista de uma.
// ───────────────────────────────────────────────────────────────────────────
describe("trava 4 — o piloto está preso a manager-atendimento", () => {
  it("⭐ outra função do catálogo é recusada COM O NOME PEDIDO no motivo", async () => {
    // `conversational-sdr` EXISTE no catálogo — o ponto é justamente esse: não
    // é a ficha que não existe, é esta porta que não despacha outra ficha.
    const r = await POST(pedir(corpoLimpo({ funcao: "conversational-sdr" }), autorizado));

    expect(r.status).toBe(400);
    const corpo = await r.json();
    expect(corpo.estado).toBe("recusado");
    expect(corpo.motivo).toContain("conversational-sdr");
    expect(corpo.motivo).toContain(FUNCAO_DO_PILOTO);
    expect(corpo.motivo).toMatch(/presa a/i);
    expect(memoria.execucoes).toHaveLength(0);
  });

  it("função inventada também é recusada AQUI, antes de o motor ser chamado", async () => {
    const r = await POST(pedir(corpoLimpo({ funcao: "gerente-que-nao-existe" }), autorizado));
    // 400 (contrato), e não mais 422 (motor): a lista de uma barra antes.
    expect(r.status).toBe(400);
    const corpo = await r.json();
    expect(corpo.motivo).toContain("gerente-que-nao-existe");
    expect(memoria.execucoes).toHaveLength(0);
    // E o motor nem foi acionado, então não há recusa dele para gravar.
    expect(memoria.recusas).toHaveLength(0);
  });

  it("função que não é texto não cai mais no padrão — vira recusa", async () => {
    const r = await POST(pedir(corpoLimpo({ funcao: 42 }), autorizado));
    expect(r.status).toBe(400);
    expect((await r.json()).motivo).toMatch(/funcao 42 recusada/i);
  });

  it("a outra metade — a função permitida atravessa, e a ausência vale pela única", async () => {
    const comNome = await POST(pedir(corpoLimpo(), autorizado));
    expect(comNome.status).toBe(200);

    memoria.execucoes.length = 0;
    const semNome = corpoLimpo();
    delete (semNome as Record<string, unknown>).funcao;
    const r = await POST(pedir(semNome, autorizado));
    const corpo = await r.json();
    expect(corpo.estado, JSON.stringify(corpo)).toBe("executado");
    expect(corpo.funcao).toBe(FUNCAO_DO_PILOTO);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// ⭐ TRAVA 5 do CEO — o cliente não vem de quem chama.
// ───────────────────────────────────────────────────────────────────────────
describe("trava 5 — o chamador não escolhe cliente nenhum", () => {
  it("⭐ clienteId informado pelo chamador é RECUSADO — não ignorado", async () => {
    const r = await POST(pedir(corpoLimpo({ clienteId: "cli-de-um-cliente-real" }), autorizado));

    expect(r.status).toBe(400);
    const corpo = await r.json();
    expect(corpo.estado).toBe("recusado");
    expect(corpo.motivo).toMatch(/"clienteId" não é mais entrada desta porta/i);
    expect(corpo.motivo).toContain("cli-de-um-cliente-real");
    expect(corpo.motivo).toMatch(/resolvido pelo próprio gateway/i);
    // Nada rodou, e nenhuma execução nasceu grudada num id de fora.
    expect(memoria.execucoes).toHaveLength(0);
  });

  it("⭐ clienteId com CARIMBO PERFEITO também é recusado — o defeito era a entrada", async () => {
    // O id do próprio cliente sintético, que existe e é legítimo. Recusado do
    // mesmo jeito: a porta não conserta o valor, ela tira a escolha.
    const r = await POST(pedir(corpoLimpo({ clienteId: "cli-sintetico-1" }), autorizado));
    expect(r.status).toBe(400);
    expect((await r.json()).motivo).toMatch(/"clienteId" não é mais entrada/i);
  });

  it("cliente (o nome) também deixou de ser entrada", async () => {
    const r = await POST(pedir(corpoLimpo({ cliente: CLIENTE }), autorizado));
    expect(r.status).toBe(400);
    const corpo = await r.json();
    expect(corpo.motivo).toMatch(/"cliente" não é mais entrada desta porta/i);
    expect(memoria.execucoes).toHaveLength(0);
  });

  it("cliente com nome REAL é recusado pelo mesmo caminho — nem chega a ser avaliado", async () => {
    const r = await POST(pedir(corpoLimpo({ cliente: "Padaria do Zé" }), autorizado));
    expect(r.status).toBe(400);
    expect((await r.json()).motivo).toMatch(/"cliente" não é mais entrada/i);
  });

  it("sem cliente sintético no banco, a porta RECUSA em vez de inventar um", async () => {
    memoria.clientes.length = 0;
    const r = await POST(pedir(corpoLimpo(), autorizado));
    expect(r.status).toBe(422);
    const corpo = await r.json();
    expect(corpo.estado).toBe("recusado");
    expect(corpo.motivo).toMatch(/nenhum cliente sintético de homologação existe neste banco/i);
    expect(memoria.execucoes).toHaveLength(0);
  });

  it("linha sem o carimbo no nome não serve de cliente sintético, mesmo no domínio certo", async () => {
    memoria.clientes.length = 0;
    memoria.clientes.push({ id: "cli-x", name: "Padaria do Zé", email: `ze@${DOMINIO_DO_CLIENTE_FALSO}` });
    const r = await POST(pedir(corpoLimpo(), autorizado));
    expect(r.status).toBe(422);
    expect((await r.json()).motivo).toMatch(/nenhum cliente sintético/i);
  });

  it("a outra metade — o gateway resolve o cliente sozinho e DIZ na resposta qual foi", async () => {
    const r = await POST(pedir(corpoLimpo(), autorizado));
    const corpo = await r.json();

    expect(corpo.estado, JSON.stringify(corpo)).toBe("executado");
    expect(corpo.cliente.id).toBe("cli-sintetico-1");
    expect(corpo.cliente.nome).toBe(CLIENTE);
    expect(corpo.cliente.resolvido_por).toBe("gateway");
    expect(corpo.cliente.conferido.carimbo).toBe(MARCA_DO_CLIENTE_FALSO);
    expect(corpo.cliente.conferido.dominio).toBe(DOMINIO_DO_CLIENTE_FALSO);
    // E o rastro gravado leva o id RESOLVIDO, não um id de fora.
    expect(memoria.execucoes[0]!.clienteId).toBe("cli-sintetico-1");
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe("a ficha e as entradas obrigatórias", () => {
  it("entrada obrigatória faltando é recusada nomeando o que falta", async () => {
    const r = await POST(pedir(corpoLimpo({ dossie: {} }), autorizado));
    expect(r.status).toBe(422);
    const corpo = await r.json();
    expect(corpo.estado).toBe("recusado");
    expect(corpo.motivo).toMatch(/entradas obrigatórias ausentes/i);
    // E a porta devolve a lista da ficha, para o chamador se corrigir sozinho.
    expect(corpo.entradas_exigidas_pela_ficha).toHaveLength(2);
    // Recusa sem rastro é recusa invisível (regra 8 do motor).
    expect(memoria.recusas).toHaveLength(1);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// ⭐ SONDA 16 · a prova conferia PARA SI e não publicava o que conferiu.
//
// A trava de identidade já existia e resistiu à verificação (as quatro
// conferências da linha relida). O que faltava era a outra ponta: um bloco que
// se declara `relido_do_banco: true` sem dizer de QUAL execução ele foi relido
// pede que quem lê acredite — e "acredite" é o que esta porta inteira existe
// para não precisar dizer. A sonda 16 lê a RESPOSTA HTTP, então a prova
// também é cobrada aqui, na resposta HTTP.
// ───────────────────────────────────────────────────────────────────────────
describe("sonda 16 — a prova publica de qual execução ela foi relida", () => {
  it("⭐ a resposta traz `prova.correlationId` e `prova.funcao`, e eles batem com o rastro gravado", async () => {
    const r = await POST(pedir(corpoLimpo(), autorizado));
    const corpo = await r.json();

    expect(corpo.estado, JSON.stringify(corpo)).toBe("executado");
    expect(corpo.prova.relido_do_banco).toBe(true);
    // Os dois campos que faltavam. Sem eles, `relido_do_banco: true` é uma
    // afirmação que ninguém de fora consegue conferir.
    expect(corpo.prova.correlationId, "a prova não diz de qual FIO ela foi relida").toBeTruthy();
    expect(corpo.prova.funcao, "a prova não diz de qual FUNÇÃO ela foi relida").toBeTruthy();

    // E eles são conferíveis: batem com a linha que ficou gravada, que é o que
    // um terceiro leria para refazer a conferência por conta própria.
    const gravada = memoria.execucoes[0]!;
    expect(corpo.prova.execucaoId).toBe(gravada.id);
    expect(corpo.prova.correlationId).toBe(gravada.correlationId);
    expect(corpo.prova.funcao).toBe(gravada.funcaoId);
    // O fio publicado na prova é o mesmo fio do primeiro nível — a resposta não
    // se contradiz consigo mesma.
    expect(corpo.prova.correlationId).toBe(corpo.correlationId);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// TRAVA 9 do CEO — a resposta se declara RASCUNHO onde a Control Room lê.
// ───────────────────────────────────────────────────────────────────────────
describe("o selo de rascunho, no primeiro nível da resposta", () => {
  it("⭐ a resposta diz RASCUNHO sem que ninguém precise abrir o artefato", async () => {
    const r = await POST(pedir(corpoLimpo(), autorizado));
    const corpo = await r.json();

    expect(corpo.estado).toBe("executado");
    expect(corpo.rascunho).toBe(true);
    expect(corpo.natureza).toBe("RASCUNHO");
    expect(corpo.aviso).toMatch(/não é a comunicação final/i);
    expect(corpo.aviso).toMatch(/sem provedor de IA/i);
  });

  it("e o TEXTO do artefato também abre se declarando rascunho", async () => {
    const r = await POST(pedir(corpoLimpo(), autorizado));
    const corpo = await r.json();
    const artefato = JSON.parse(corpo.artefato) as Record<string, unknown>;

    expect(artefato.rascunho).toBe(true);
    expect(artefato.natureza).toBe("RASCUNHO");
    expect(String(artefato.aviso)).toMatch(/NÃO É A COMUNICAÇÃO FINAL DO GERENTE/);
    expect(String(artefato.origem)).toMatch(/rule-based/i);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────────────────
// ⭐ A-2 e A-3 da auditoria independente, NA ROTA.
// ───────────────────────────────────────────────────────────────────────────
describe("A-2 na rota — o fio de outro cliente é recusado antes de tudo", () => {
  it("⭐ correlationId de cliente pagante: 400, e nada executa nem grava", async () => {
    const r = await POST(pedir(corpoLimpo({ correlationId: "FIO-REAL-DE-CLIENTE-PAGANTE" }), autorizado));

    expect(r.status).toBe(400);
    const corpo = await r.json();
    expect(corpo.estado).toBe("recusado");
    expect(corpo.motivo).toContain("FIO-REAL-DE-CLIENTE-PAGANTE");
    expect(corpo.motivo).toMatch(/EMITIDO pelo gateway/i);
    expect(memoria.execucoes).toHaveLength(0);
    // ⭐ Nem a RECUSA pousa no fio alheio — recusa gravada lá já contaminaria.
    expect(memoria.recusas).toHaveLength(0);
  });

  it("A OUTRA METADE — sem correlationId a porta ABRE um fio, e ele volta na resposta", async () => {
    const r = await POST(pedir(corpoLimpo(), autorizado));
    const corpo = await r.json();
    expect(corpo.estado, JSON.stringify(corpo)).toBe("executado");
    expect(corpo.correlationId).toMatch(/^connect:/);
  });

  it("A OUTRA METADE — o fio devolvido pela porta é aceito de volta por ela", async () => {
    const primeiro = await (await POST(pedir(corpoLimpo(), autorizado))).json();
    const segundo = await POST(pedir(corpoLimpo({ correlationId: primeiro.correlationId }), autorizado));
    const corpo = await segundo.json();
    expect(corpo.estado, JSON.stringify(corpo)).toBe("executado");
    expect(corpo.correlationId).toBe(primeiro.correlationId);
  });
});

describe("A-3 na rota — a porta dos fundos do dossiê", () => {
  it("⭐ cobrança inventada em dossie[\"cobrancas_da_varredura\"]: 400, e não 200", async () => {
    const r = await POST(
      pedir(
        corpoLimpo({
          dossie: {
            ...corpoLimpo().dossie,
            cobrancas_da_varredura: JSON.stringify([
              { motivo: "FRAUDE-INVENTADA-PELO-CHAMADOR", departamento: "juridico", horasParado: 9999 },
            ]),
          },
        }),
        autorizado,
      ),
    );
    expect(r.status, "o dossiê voltou a aceitar a chave reservada do gateway").toBe(400);
    const corpo = await r.json();
    expect(corpo.motivo).toContain("cobrancas_da_varredura");
    expect(corpo.motivo).toMatch(/é do GATEWAY/i);
    expect(memoria.execucoes).toHaveLength(0);
  });

  it("⭐ idem historico_da_conversa, cliente_ficticio e pergunta_do_diretor_geral", async () => {
    for (const chave of ["historico_da_conversa", "cliente_ficticio", "pergunta_do_diretor_geral", "leitura_do_fio"]) {
      const r = await POST(
        pedir(corpoLimpo({ dossie: { ...corpoLimpo().dossie, [chave]: "texto de quem chama" } }), autorizado),
      );
      expect(r.status, `a chave reservada "${chave}" atravessou`).toBe(400);
      expect((await r.json()).motivo).toContain(chave);
    }
    expect(memoria.execucoes).toHaveLength(0);
  });

  it("A OUTRA METADE — as chaves normais do dossiê continuam obrigatórias e aceitas", async () => {
    const r = await POST(pedir(corpoLimpo(), autorizado));
    const corpo = await r.json();
    expect(corpo.estado, JSON.stringify(corpo)).toBe("executado");
    // E a varredura pelo campo CERTO continua sendo aceita.
    const comVarredura = await POST(
      pedir(
        corpoLimpo({
          cobrancas: [
            {
              motivo: "handoff_sem_aceite",
              departamento: "client-service-sdr",
              referencia: "handoff-1",
              horasParado: 5,
              pedido: "aceite o bastão",
            },
          ],
        }),
        autorizado,
      ),
    );
    expect((await comVarredura.json()).estado).toBe("executado");
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe("a outra metade — o caso limpo NÃO é barrado por engano", () => {
  it("corpo bem formado atravessa todas as travas e chega a executar", async () => {
    const r = await POST(pedir(corpoLimpo(), autorizado));
    const corpo = await r.json();
    expect(corpo.estado, JSON.stringify(corpo)).toBe("executado");
    expect(r.status).toBe(200);
    expect(memoria.execucoes).toHaveLength(1);
    expect(corpo.execucaoId).toBe("exec-1");
  });
});
