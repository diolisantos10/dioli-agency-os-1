// A FICHA CHEGA EM PRODUÇÃO? — o risco levantado, o conserto, e a medição dele.
//
// ─── O RISCO, EM UMA FRASE ─────────────────────────────────────────────────
//
// `lib/agency/catalogo-v2/specs.ts:59` lê a ficha do DISCO em tempo de
// execução:
//
//     const RAIZ = path.join(process.cwd(), "agentes", "linha");
//
// e recusa NOMEADAMENTE quando não acha o arquivo ("sem ficha não se executa").
// `lib/agency/catalogo-v2/regras-da-ficha.ts:54` faz o mesmo caminho.
//
// Em produção o processo é `.next/standalone/server.js`, e o `server.js` que o
// Next gera começa com `process.chdir(__dirname)` (o template está em
// `node_modules/next/dist/build/utils.js:1084`). Ou seja: em produção
// `process.cwd()` **não é a raiz do repositório**, é `.next/standalone`. Se
// `agentes/` não viajar para lá, o motor de fichas recusa TODAS as funções —
// e recusa em silêncio para quem só olha o log de deploy, porque o app sobe
// normalmente.
//
// ─── O QUE FOI MEDIDO EM 30/08/2026, E O QUE MUDOU ─────────────────────────
//
// `npm run build` já produzia `.next/standalone/agentes/linha/` com as 93
// fichas — mas por ACIDENTE, não por decisão: o próprio build imprimia, quatro
// vezes,
//
//   "Encountered unexpected file in NFT list — A file was traced that indicates
//    that the whole project was traced unintentionally."
//
// e era esse rastreio acidentalmente total que carregava `agentes/` junto.
// `npm run build` copia explicitamente só `.next/static` e `public`, e
// `outputFileTracingIncludes` nomeava só arquivos do playwright. **No dia em
// que alguém consertasse aquele aviso — que é um conserto legítimo, de tamanho
// de imagem — o motor de fichas pararia de achar as fichas em produção, e
// nenhum teste da casa acusaria.**
//
// O empacotamento agora é EXPLÍCITO: `next.config.ts` nomeia
// `"agentes/linha/**/*.md"` em `outputFileTracingIncludes`. Este arquivo guarda
// as DUAS metades desse conserto, e cada uma morde sozinha:
//
//   • metade 1 — a DECLARAÇÃO existe (e a dependência de disco que a exige
//     também). Tirar a linha do `next.config.ts` deixa esta metade VERMELHA.
//   • metade 2 — o ARTEFATO construído de fato carrega as fichas. Quebrar o
//     empacotamento (build sem a inclusão, ou fichas apagadas do contêiner)
//     deixa esta metade VERMELHA.
//
// ─── POR QUE AQUI NÃO HÁ `it.skipIf` ───────────────────────────────────────
//
// A metade 2 já foi `it.skipIf(!construido)`: sem `.next/standalone` ela era
// PULADA. Pulado é o defeito que esta casa persegue — *a palavra do protocolo
// é ok e o código de saída é zero; qualquer leitor lê aprovação*. Nos dois
// portões de CI o pulo era o estado NORMAL, porque nenhum deles construía
// antes de testar: a prova mais importante deste arquivo nunca rodou em CI
// nenhum, e o verde dizia o contrário.
//
// Agora o CI constrói ANTES de testar (`.github/workflows/ci.yml` e
// `connect.yml`), e a ausência do artefato REPROVA em vez de pular: "não medi"
// nunca mais passa por "está certo". Quem roda a suíte na mão faz o mesmo que
// o CI faz — `npm run build` antes de `npx vitest run`.

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { FUNCOES_V2 } from "@/lib/agency/catalogo-v2/catalogo";

const RAIZ = process.cwd();

describe("metade 1 — a dependência de disco existe, e o empacotamento dela é DECLARADO", () => {
  it("`specs.ts` lê a ficha de `process.cwd()/agentes/linha` em runtime", () => {
    const fonte = fs.readFileSync(path.join(RAIZ, "lib/agency/catalogo-v2/specs.ts"), "utf8");
    expect(fonte).toContain('path.join(process.cwd(), "agentes", "linha")');
    expect(fonte).toContain("readFileSync");
  });

  it("o `server.js` do standalone troca o cwd — por isso a raiz do repo não vale lá", () => {
    const template = fs.readFileSync(path.join(RAIZ, "node_modules/next/dist/build/utils.js"), "utf8");
    expect(
      template.includes("process.chdir(__dirname)"),
      "o template do standalone mudou; refaça a medição do cwd de produção antes de confiar neste raciocínio",
    ).toBe(true);
  });

  // ⛔ A TRAVA CONTRA O CONSERTO LEGÍTIMO DO VIZINHO.
  // Nenhum `import`/`require` leva às fichas (são `.md` abertos por caminho
  // montado em runtime), então o rastreador do `output: "standalone"` não tem
  // como segui-las. Enquanto elas viajavam pelo rastreio acidentalmente total,
  // quem consertasse o aviso do NFT — conserto certo, e de outra frente —
  // derrubaria o motor de fichas em produção sem uma linha vermelha em lugar
  // nenhum. Esta é a linha vermelha.
  it("`next.config.ts` NOMEIA as fichas no rastreio — o empacotamento é decisão, não acidente", () => {
    const config = fs.readFileSync(path.join(RAIZ, "next.config.ts"), "utf8");
    expect(
      config.includes("outputFileTracingIncludes"),
      "outputFileTracingIncludes saiu de next.config.ts — nada mais garante o que viaja para o contêiner",
    ).toBe(true);
    expect(
      config.includes("agentes/linha/**/*.md"),
      'a inclusão explícita das fichas ("agentes/linha/**/*.md") saiu de outputFileTracingIncludes em ' +
        "next.config.ts. Sem ela as fichas só chegam ao contêiner pelo rastreio acidentalmente total que o " +
        'próprio build denuncia ("the whole project was traced unintentionally") — e o motor recusaria TODAS ' +
        'as funções em produção com "sem ficha não se executa" no dia em que esse acidente fosse consertado.',
    ).toBe(true);
  });
});

describe("metade 2 — o artefato construído realmente carrega as fichas", () => {
  const pastaDeFichas = path.join(RAIZ, ".next/standalone/agentes/linha");

  // ⛔ SEM ARTEFATO, REPROVA — NÃO PULA. Ver o bloco "POR QUE AQUI NÃO HÁ
  // `it.skipIf`" no cabeçalho. Esta é a primeira asserção de propósito: sem
  // ela, as duas provas abaixo quebrariam com um `ENOENT` cru, que se lê como
  // defeito do teste em vez de "o portão não construiu antes de medir".
  it("o artefato de produção existe — sem ele não há o que medir, e 'não medi' não é 'está certo'", () => {
    expect(
      fs.existsSync(path.join(RAIZ, ".next/standalone/server.js")),
      "não existe `.next/standalone/server.js`: o artefato de produção não foi construído antes deste teste. " +
        "Rode `npm run build` antes de `npx vitest run` — é o que os dois portões de CI fazem " +
        "(`.github/workflows/ci.yml` e `connect.yml` constroem ANTES dos testes). Este teste REPROVA em vez " +
        "de pular porque pulado passa por aprovado para quem lê o verde.",
    ).toBe(true);
  });

  it("toda função do catálogo tem a ficha dentro de `.next/standalone`", () => {
    const faltando = FUNCOES_V2.filter(
      (f) => !fs.existsSync(path.join(pastaDeFichas, f.departamentoId, `${f.id}.md`)),
    ).map((f) => `${f.departamentoId}/${f.id}`);

    expect(
      faltando,
      `${faltando.length} ficha(s) não viajaram para o contêiner — o motor recusaria essas funções em produção ` +
        `com "sem ficha não se executa". Confira se "agentes/linha/**/*.md" continua em ` +
        `outputFileTracingIncludes (next.config.ts) e se o build rodou depois disso.`,
    ).toEqual([]);
  });

  it("a ficha do gerente do piloto está lá e continua legível por máquina", () => {
    const caminho = path.join(pastaDeFichas, "client-service-sdr", "manager-atendimento.md");
    const conteudo = fs.readFileSync(caminho, "utf8");
    const bloco = conteudo.match(/```json\n([\s\S]*?)\n```/);
    expect(bloco, "a ficha chegou sem o bloco de especificação — o motor recusaria por ficha ilegível").not.toBeNull();
    const spec = JSON.parse(bloco![1]!) as { funcao: string; ativa: boolean };
    expect(spec.funcao).toBe("manager-atendimento");
    // E ela chega DESLIGADA, como tem de ser: este piloto não ligou nada.
    expect(spec.ativa).toBe(false);
  });
});
