// A saída de emergência sancionada passa a ser HONRADA pelo sentinela.
//
// ── O DEFEITO (medido em 30/08/2026) ─────────────────────────────────────────
// `--forcar --motivo "<por quê>"` é oficial nesta casa: `scripts/reivindicar.mts`
// recusa `--forcar` sem `--motivo`, grava `forcadaPor` com o texto e imprime o
// rastro em voz alta. Só que NENHUMA régua de colisão lia esse campo — varrido
// o repositório, `forcadaPor` só era ESCRITO, VALIDADO e IMPRESSO.
//
// O efeito ficou visível em disco: duas frentes colidiram em
// `prisma/schema.prisma`, as duas usaram a saída sancionada, as duas
// escreveram justificativas corretas — e `registro-de-reivindicacao.test.ts`
// reprovou assim mesmo, deixando a suíte da casa VERMELHA e travando todos os
// PRs do repositório.
//
// Já existiu uma frente para consertar isto — `coordenacao/sentinela-vs-forcada`,
// aberta 29/08 03:12:10Z e encerrada 03:39:58Z (27 minutos) — que prometia
// exatamente este arquivo e não entregou uma linha. Ele existe agora.
//
// ── AS DUAS METADES, E ELAS ANDAM JUNTAS ────────────────────────────────────
// METADE 1 (a saída sancionada abre): colisão FORÇADA com motivo de substância
// vira AVISO ALTO, e o aviso APARECE, com os dois donos, os arquivos e o
// motivo de cada um.
// METADE 2 (nada foi afrouxado): colisão NÃO forçada continua REPROVANDO;
// forçada sem motivo, com motivo trivial, ou assinada por outra sessão,
// REPROVA igual. Só a primeira metade seria uma régua que aprova qualquer
// coisa — que é como este defeito nasceria de novo, do lado oposto.

import { describe, expect, it } from "vitest";

import {
  conferirRegistro,
  motivoDeForcadaTemSubstancia,
  type Reivindicacao,
} from "@/lib/coordenacao/reivindicacoes";

const AGORA = new Date("2026-08-30T03:00:00Z");

/** Os dois motivos REAIS das duas frentes que travaram a casa em 30/08/2026,
 *  copiados verbatim de `reivindicacoes/`. Ficam aqui como FIXTURE, e não
 *  lidos do disco, de propósito: o dia em que os donos legítimos encerrarem
 *  essas frentes, esta prova continua valendo. Ler o disco aqui plantaria a
 *  mesma trava eterna que `registro-de-reivindicacao.test.ts` já documenta. */
const MOTIVO_CONTA_DE_SERVICO =
  "Simetrica a forcada de ses-b8ee2d70ad, e pelo mesmo raciocinio, que eu confirmo estar correto: colisao de " +
  "ARQUIVO, nao de responsabilidade. As duas frentes so ACRESCENTAM model ao prisma/schema.prisma — la Diretriz " +
  "(mesa de comando do SDR), aqui RastroDoDiretorGeral. Provado, nao afirmado: meu diff no schema e 65 insercoes " +
  "e ZERO remocoes, e o merge da base nesta branch rodou sem um unico conflito. Perguntas disjuntas: la, que " +
  "orientacao o agente le antes de responder; aqui, quem e o Diretor Geral e o que ele nao pode fazer. " +
  "Registrado pelo Diretor apos auditoria.";

const MOTIVO_MESA_DE_COMANDO =
  "Colisao de ARQUIVO, nao de responsabilidade. ses-0f653c553f reivindicou prisma/schema.prisma para a conta de " +
  "servico do Diretor Geral (modelos proprios de credencial e rastro append-only). Esta frente ACRESCENTA um " +
  "modelo novo e independente (Diretriz, a mesa de comando) e nao altera nenhuma linha existente do schema nem " +
  "nenhum modelo daquela frente. Perguntas respondidas sao disjuntas: la, quem e o Diretor Geral e como ele se " +
  "autentica; aqui, que orientacao o agente em producao le antes de responder. Nenhum outro arquivo colide.";

function reivindicacao(p: Partial<Reivindicacao> & Pick<Reivindicacao, "id" | "quem">): Reivindicacao {
  return {
    frente: `frente de ${p.id}`,
    responsabilidade: p.id,
    arquivos: ["prisma/schema.prisma"],
    abertaEm: "2026-08-30T02:00:00Z",
    encerradaEm: null,
    ...p,
  };
}

/** As duas frentes vivas de 30/08, como estavam no registro no instante em que
 *  a suíte da casa ficou vermelha. */
function asDuasQueTravaramACasa(): [Reivindicacao, Reivindicacao] {
  return [
    reivindicacao({
      id: "conta-de-servico-diretor-geral",
      quem: "ses-0f653c553f",
      frente: "conta de servico do Diretor Geral: chave propria, travas no codigo, rastro append-only",
      responsabilidade: "conta-de-servico-diretor-geral",
      arquivos: ["lib/auth/conta-de-servico.ts", "prisma/schema.prisma"],
      abertaEm: "2026-08-30T02:43:05.464Z",
      forcadaPor: { quem: "ses-0f653c553f", motivo: MOTIVO_CONTA_DE_SERVICO, em: "2026-08-30T02:43:05.464Z" },
    }),
    reivindicacao({
      id: "mesa-de-comando-diretriz-do-sdr",
      quem: "ses-b8ee2d70ad",
      frente: "MESA DE COMANDO: diretriz operacional lida pelo agente em producao a cada turno",
      responsabilidade: "mesa-de-comando-diretriz-do-sdr",
      arquivos: ["lib/agency/comercial/mesa-de-comando.ts", "prisma/schema.prisma"],
      abertaEm: "2026-08-30T01:04:36.499Z",
      forcadaPor: { quem: "ses-b8ee2d70ad", motivo: MOTIVO_MESA_DE_COMANDO, em: "2026-08-30T01:04:36.499Z" },
    }),
  ];
}

describe("✅ METADE 1 — a forçada sancionada vira AVISO ALTO, não reprovação", () => {
  it("as duas frentes REAIS de 30/08 em prisma/schema.prisma: registro OK, zero problemas", () => {
    const r = conferirRegistro(asDuasQueTravaramACasa(), AGORA);

    expect(r.problemas).toHaveLength(0);
    expect(r.ok).toBe(true);
  });

  it("e o AVISO APARECE — com os dois donos, o arquivo em comum e o motivo de CADA um", () => {
    const r = conferirRegistro(asDuasQueTravaramACasa(), AGORA);

    expect(r.avisos).toHaveLength(1);
    const aviso = r.avisos[0]!;

    // Alto: quem lê a saída da suíte não pode ter que ir procurar.
    expect(aviso).toMatch(/COLISÃO FORÇADA/);
    expect(aviso).toMatch(/AVISO ALTO, não reprova/);

    // Os DOIS donos, nomeados.
    expect(aviso).toContain("ses-0f653c553f");
    expect(aviso).toContain("ses-b8ee2d70ad");

    // O arquivo que os dois pegaram.
    expect(aviso).toContain("prisma/schema.prisma");

    // E o motivo ESCRITO de cada um, inteiro — é ele que deixa quem lê julgar
    // se a justificativa se sustenta. Aviso que só diz "houve uma forçada" não
    // serve para julgar nada.
    expect(aviso).toContain(MOTIVO_CONTA_DE_SERVICO);
    expect(aviso).toContain(MOTIVO_MESA_DE_COMANDO);
  });

  it("basta UM lado ter forçado — quem chegou primeiro abriu limpo e nunca teria forcadaPor", () => {
    const [a, b] = asDuasQueTravaramACasa();
    // `b` é a que chegou primeiro (01:04 < 02:43): tira a forçada dela.
    delete b.forcadaPor;

    const r = conferirRegistro([a, b], AGORA);

    expect(r.ok).toBe(true);
    expect(r.avisos).toHaveLength(1);
    // O lado que não forçou é NOMEADO como tal — a assimetria é informação.
    expect(r.avisos[0]!).toMatch(/NÃO forçada: ses-b8ee2d70ad/);
    expect(r.avisos[0]!).toContain(MOTIVO_CONTA_DE_SERVICO);
  });
});

describe("⛔ METADE 2 — nada foi afrouxado", () => {
  it("colisão NÃO forçada continua REPROVANDO, e diz qual arquivo", () => {
    const [a, b] = asDuasQueTravaramACasa();
    delete a.forcadaPor;
    delete b.forcadaPor;

    const r = conferirRegistro([a, b], AGORA);

    expect(r.ok).toBe(false);
    expect(r.avisos).toHaveLength(0);
    expect(r.problemas).toHaveLength(1);
    expect(r.problemas[0]!).toMatch(/arquivo "prisma\/schema\.prisma" já reivindicado/);
  });

  it("colisão de RESPONSABILIDADE não forçada continua REPROVANDO", () => {
    const r = conferirRegistro(
      [
        reivindicacao({ id: "a", quem: "ses-a", responsabilidade: "comercial/verba-vs-estimativa", arquivos: ["lib/a.ts"] }),
        reivindicacao({ id: "b", quem: "ses-b", responsabilidade: "Comercial/Verba-Vs-Estimativa", arquivos: ["lib/b.ts"] }),
      ],
      AGORA,
    );

    expect(r.ok).toBe(false);
    expect(r.problemas[0]!).toMatch(/mesma responsabilidade/);
  });

  it("forçada SEM motivo (string vazia) REPROVA — forçar sem motivo é desligar a trava sem rastro", () => {
    const [a, b] = asDuasQueTravaramACasa();
    delete b.forcadaPor;
    a.forcadaPor = { quem: a.quem, motivo: "", em: "2026-08-30T02:43:05.464Z" };

    const r = conferirRegistro([a, b], AGORA);

    expect(r.ok).toBe(false);
    expect(r.avisos).toHaveLength(0);
  });

  it("motivo TRIVIAL não compra uma forçada — ponto final, uma palavra, ou a mesma palavra repetida", () => {
    const triviais = [
      ".",
      "   ",
      "urgente",
      "porque sim",
      "................................................", // enche o piso de caracteres, zero palavra
      "urgente urgente urgente urgente urgente urgente urgente urgente", // enche os dois pisos com UMA palavra
      "preciso preciso preciso preciso preciso preciso preciso.",
    ];

    for (const motivo of triviais) {
      const [a, b] = asDuasQueTravaramACasa();
      delete b.forcadaPor;
      a.forcadaPor = { quem: a.quem, motivo, em: "2026-08-30T02:43:05.464Z" };

      const r = conferirRegistro([a, b], AGORA);
      expect(r.ok, `motivo trivial passou e não devia: ${JSON.stringify(motivo)}`).toBe(false);
      expect(r.avisos).toHaveLength(0);
    }
  });

  it("forçada ASSINADA POR OUTRA SESSÃO REPROVA — ninguém assume risco em nome de terceiro", () => {
    const [a, b] = asDuasQueTravaramACasa();
    delete b.forcadaPor;
    a.forcadaPor = { quem: "ses-outra-qualquer", motivo: MOTIVO_CONTA_DE_SERVICO, em: "2026-08-30T02:43:05.464Z" };

    const r = conferirRegistro([a, b], AGORA);

    expect(r.ok).toBe(false);
    expect(r.avisos).toHaveLength(0);
  });

  it("forçada NÃO cria colisão onde não havia — arquivos e responsabilidades disjuntos seguem limpos", () => {
    const r = conferirRegistro(
      [
        reivindicacao({ id: "a", quem: "ses-a", responsabilidade: "a/a", arquivos: ["lib/a.ts"] }),
        reivindicacao({ id: "b", quem: "ses-b", responsabilidade: "b/b", arquivos: ["lib/b.ts"] }),
      ],
      AGORA,
    );

    expect(r.ok).toBe(true);
    expect(r.avisos).toHaveLength(0);
  });
});

describe("o piso de substância do motivo, sozinho", () => {
  it("recusa vazio, curto, trivial e de uma palavra só", () => {
    for (const m of ["", "   ", ".", "urgente", "porque sim", "a".repeat(60), "x x x x x x x x x x x x x x x x"]) {
      expect(motivoDeForcadaTemSubstancia(m), `devia recusar: ${JSON.stringify(m)}`).toBe(false);
    }
    expect(motivoDeForcadaTemSubstancia(null)).toBe(false);
    expect(motivoDeForcadaTemSubstancia(undefined)).toBe(false);
  });

  it("aceita os dois motivos REAIS que a casa já escreveu", () => {
    expect(motivoDeForcadaTemSubstancia(MOTIVO_CONTA_DE_SERVICO)).toBe(true);
    expect(motivoDeForcadaTemSubstancia(MOTIVO_MESA_DE_COMANDO)).toBe(true);
  });

  it("não se engana com CAIXA nem ACENTO — as mesmas palavras não viram palavras diferentes", () => {
    // Seis "palavras" que são três, repetidas em caixa/acento diferentes.
    expect(motivoDeForcadaTemSubstancia("Colisão colisao COLISÃO arquivo Arquivo ARQUIVO schema Schema")).toBe(false);
  });
});
