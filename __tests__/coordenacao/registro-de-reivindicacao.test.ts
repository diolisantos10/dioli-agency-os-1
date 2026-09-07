// O sentinela do registro — o que sobrevive a quem esquece.
//
// Diferente do teste de `conferirColisao` (que confere a régua em memória),
// este lê `reivindicacoes/*.json` DO DISCO — sem rede, sem git — porque é
// exatamente assim que ele roda dentro de `npm test`: no CI, na máquina de
// qualquer um, sem depender de alcançar o GitHub. No instante em que a segunda
// sessão fizer `git pull --rebase` depois de uma colisão, as duas
// reivindicações se encontram no mesmo registro local e esta suíte fica
// VERMELHA — antes do push, não depois do merge.
//
// METADE 1 (tem que barrar de verdade): registro com colisão de
// responsabilidade, registro com colisão de arquivo, e JSON malformado — as
// três formas de reprovação que a ficha exige.
// METADE 2 (não pode barrar quem tem razão): registro limpo com reivindicações
// paralelas passa, reivindicação encerrada não conta, e o registro REAL deste
// repositório — o que de fato roda em `npm test` — está e continua limpo.

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

import { conferirRegistroNoDisco, lerReivindicacoesDoDisco } from "@/lib/coordenacao/leitura-do-registro";

const AGORA = new Date("2026-08-16T18:00:00Z");

/** A pasta `reivindicacoes/` DE VERDADE deste repositório — não uma fixture. */
const REGISTRO_REAL = fileURLToPath(new URL("../../reivindicacoes", import.meta.url));

let pastaDeTeste: string | null = null;

function pastaTemporaria(): string {
  pastaDeTeste = mkdtempSync(join(tmpdir(), "reivindicacoes-teste-"));
  return pastaDeTeste;
}

function gravar(pasta: string, nomeDoArquivo: string, conteudo: unknown): void {
  writeFileSync(join(pasta, nomeDoArquivo), typeof conteudo === "string" ? conteudo : JSON.stringify(conteudo, null, 2), "utf8");
}

afterEach(() => {
  if (pastaDeTeste) rmSync(pastaDeTeste, { recursive: true, force: true });
  pastaDeTeste = null;
});

const BASE = {
  frente: "(frente de teste)",
  abertaEm: AGORA.toISOString(),
  encerradaEm: null as string | null,
};

describe("⛔ o sentinela BARRA — as três formas de reprovação exigidas", () => {
  it("duas reivindicações VIVAS com a mesma responsabilidade normalizada", () => {
    const pasta = pastaTemporaria();
    gravar(pasta, "a.json", { ...BASE, id: "comercial/verba-vs-estimativa", quem: "sessao-a", responsabilidade: "comercial/verba-vs-estimativa", arquivos: ["lib/agency/comercial/verba-declarada.ts"] });
    gravar(pasta, "b.json", { ...BASE, id: "comercial-verba-vs-estimativa-2", quem: "sessao-b", responsabilidade: "Comercial/Verba-Vs-Estimativa", arquivos: ["lib/agency/comercial/verba-vs-estimativa.ts"] });

    const r = conferirRegistroNoDisco(pasta, AGORA);
    expect(r.ok).toBe(false);
    expect(r.problemas.join(" ")).toMatch(/responsabilidade/);
  });

  it("duas reivindicações VIVAS que se sobrepõem em arquivo", () => {
    const pasta = pastaTemporaria();
    gravar(pasta, "a.json", { ...BASE, id: "sdr/parse-error", quem: "sessao-a", responsabilidade: "sdr/parse-error", arquivos: ["app/api/sdr/chat/route.ts"] });
    gravar(pasta, "b.json", { ...BASE, id: "sdr/outro-ajuste", quem: "sessao-b", responsabilidade: "sdr/outro-ajuste", arquivos: ["app/api/sdr/chat/route.ts"] });

    const r = conferirRegistroNoDisco(pasta, AGORA);
    expect(r.ok).toBe(false);
    expect(r.problemas.join(" ")).toMatch(/arquivo/);
  });

  it("JSON malformado reprova, e nomeia o arquivo quebrado", () => {
    const pasta = pastaTemporaria();
    gravar(pasta, "quebrado.json", "{ isto não é json válido");

    expect(() => lerReivindicacoesDoDisco(pasta)).toThrow(/quebrado\.json/);
  });

  it("JSON válido mas sem campo obrigatório reprova, e nomeia o campo", () => {
    const pasta = pastaTemporaria();
    gravar(pasta, "sem-quem.json", { ...BASE, id: "x/y", responsabilidade: "x/y", arquivos: ["a.ts"] }); // falta "quem"

    expect(() => lerReivindicacoesDoDisco(pasta)).toThrow(/quem/);
  });
});

describe("✅ o sentinela NÃO INVENTA problema no caso limpo", () => {
  it("três reivindicações paralelas, em responsabilidades e arquivos distintos: registro OK", () => {
    const pasta = pastaTemporaria();
    gravar(pasta, "a.json", { ...BASE, id: "sdr/parse-error", quem: "pm-1", responsabilidade: "sdr/parse-error", arquivos: ["app/api/sdr/chat/route.ts"] });
    gravar(pasta, "b.json", { ...BASE, id: "comercial/verba-vs-estimativa", quem: "pm-2", responsabilidade: "comercial/verba-vs-estimativa", arquivos: ["lib/agency/comercial/verba-vs-estimativa.ts"] });
    gravar(pasta, "c.json", { ...BASE, id: "email/orcamento-pronto", quem: "pm-3", responsabilidade: "email/orcamento-pronto", arquivos: ["lib/email/orcamento-pronto.ts"] });

    const r = conferirRegistroNoDisco(pasta, AGORA);
    expect(r.ok).toBe(true);
    expect(r.problemas).toHaveLength(0);
  });

  it("reivindicação ENCERRADA que colidiria se estivesse viva não conta", () => {
    const pasta = pastaTemporaria();
    gravar(pasta, "a.json", { ...BASE, id: "comercial/verba-vs-estimativa", quem: "sessao-a", responsabilidade: "comercial/verba-vs-estimativa", arquivos: ["lib/agency/comercial/verba-declarada.ts"], encerradaEm: AGORA.toISOString() });
    gravar(pasta, "b.json", { ...BASE, id: "comercial-verba-vs-estimativa-2", quem: "sessao-b", responsabilidade: "comercial/verba-vs-estimativa", arquivos: ["lib/agency/comercial/verba-vs-estimativa.ts"] });

    const r = conferirRegistroNoDisco(pasta, AGORA);
    expect(r.ok).toBe(true);
  });

  it("arquivo que não termina em .json (como LEIA.md) é ignorado, não interpretado como reivindicação", () => {
    const pasta = pastaTemporaria();
    gravar(pasta, "LEIA.md", "# não é json, e nem deveria ser lido como um");

    expect(() => lerReivindicacoesDoDisco(pasta)).not.toThrow();
    expect(lerReivindicacoesDoDisco(pasta)).toHaveLength(0);
  });

  it("pasta ausente é registro vazio, não erro — repositório recém-clonado não pode reprovar sozinho", () => {
    expect(() => lerReivindicacoesDoDisco(join(tmpdir(), "esta-pasta-nao-existe-" + Date.now()))).not.toThrow();
  });

  // ── A TRAVA ETERNA, MEDIDA NO BRANCH PADRÃO (25/08/2026) ──────────────────
  //
  // Uma reivindicação aberta em 16/08 e nunca encerrada (213h, quase 9x o teto
  // de 24h) reprovava a CI de uma frente aberta HOJE — e com ela toda
  // implantação do repositório. A sessão dona não existia mais para encerrá-la.
  //
  // `estaViva` já sabia dizer "velha"; `conferirRegistro` só consultava
  // "encerrada", então bastava a morta cair na primeira posição do par. Era o
  // guardrail 5 do próprio arquivo sendo contrariado pelo único laço que não o
  // lia: *trava eterna é trava que alguém arranca por fora.*
  //
  // Os DOIS testes abaixo andam juntos de propósito — um prova que a morta
  // solta, o outro que a viva continua barrando. Só o primeiro seria uma régua
  // que aprova qualquer coisa.
  it("reivindicação VELHA (além do teto) NÃO trava uma frente aberta hoje", () => {
    const pasta = pastaTemporaria();
    const antiga = new Date(AGORA.getTime() - 213 * 60 * 60 * 1000).toISOString();
    // A morta na PRIMEIRA posição do par: é exatamente o caso que passava
    // batido, porque `conferirColisao` só olha o estado do segundo.
    gravar(pasta, "a.json", { ...BASE, abertaEm: antiga, id: "fila-antiga", quem: "sessao-morta", responsabilidade: "esteira-orcamento-fila", arquivos: ["lib/agency/esteira/orcamento-do-briefing.ts"] });
    gravar(pasta, "b.json", { ...BASE, id: "porta-de-hoje", quem: "sessao-viva", responsabilidade: "porta-de-resposta", arquivos: ["lib/agency/esteira/orcamento-do-briefing.ts"] });

    expect(conferirRegistroNoDisco(pasta, AGORA).ok).toBe(true);
  });

  it("mas duas VIVAS no mesmo arquivo continuam colidindo — nada foi afrouxado", () => {
    const pasta = pastaTemporaria();
    gravar(pasta, "a.json", { ...BASE, id: "fila-de-hoje", quem: "sessao-a", responsabilidade: "esteira-orcamento-fila", arquivos: ["lib/agency/esteira/orcamento-do-briefing.ts"] });
    gravar(pasta, "b.json", { ...BASE, id: "porta-de-hoje", quem: "sessao-b", responsabilidade: "porta-de-resposta", arquivos: ["lib/agency/esteira/orcamento-do-briefing.ts"] });

    expect(conferirRegistroNoDisco(pasta, AGORA).ok).toBe(false);
  });

  it("O REGISTRO REAL deste repositório — o que roda de verdade em `npm test` — está limpo", () => {
    const r = conferirRegistroNoDisco(REGISTRO_REAL, new Date());

    // ── O AVISO ALTO SAI AQUI (30/08/2026) ────────────────────────────────
    //
    // Colisão FORÇADA não reprova mais (ver `conferirRegistro`), mas aviso que
    // ninguém vê é o mesmo que aviso nenhum — e "não reprova" viraria "passou
    // batido". Este é o ponto da casa em que o registro REAL é lido em
    // `npm test`, então é aqui que o aviso tem que APARECER, na saída da
    // suíte, com os dois donos e o motivo escrito de cada um.
    for (const aviso of r.avisos) console.warn(`\n${aviso}\n`);

    // E ele tem que ser LEGÍVEL, não um marcador vazio: quem lê julga a
    // justificativa pelo texto, então todo aviso nomeia os dois donos e
    // carrega o motivo de cada lado que forçou. Asserção ESTRUTURAL de
    // propósito — cravar aqui o `quem` das frentes vivas de hoje viraria a
    // trava eterna que este mesmo arquivo já documenta mais acima: o teste
    // ficaria vermelho no dia em que o dono legítimo encerrasse a frente.
    for (const aviso of r.avisos) {
      expect(aviso).toMatch(/COLISÃO FORÇADA/);
      expect(aviso).toMatch(/arquivo\(s\) em comum:/);
      expect(aviso.split("\n").filter((l) => l.includes("FORÇADA por")).length).toBeGreaterThanOrEqual(1);
      expect(aviso).toMatch(/motivo \.+:/);
    }

    expect(
      r.ok,
      `reivindicacoes/ tem colisão viva NÃO forçada: ${r.problemas.join(" | ")}`,
    ).toBe(true);
  });
});
