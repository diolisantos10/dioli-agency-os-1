// A trava de espaço de RASCUNHO — teste em disco de verdade (`os.tmpdir()`),
// sem mock: este módulo trabalha em `tmpdir`, e é mais barato (e mais
// confiável) exercitar o filesystem real do que fabricar um mock de `fs`
// inteiro (ver a mesma escolha em `__tests__/coordenacao/*`).
//
// Ver `lib/rascunho/espaco-da-frente.ts` para o incidente completo: o
// scratchpad de sessão (`/tmp/claude-0/.../scratchpad`) não é isolado por
// construção, e um único diretório compartilhado acumulou rascunhos de
// frentes diferentes sob nomes quase-colidentes. Este módulo garante que o
// espaço de RASCUNHO — `.fichas/<id-da-frente>/` — não repete o erro.

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  RascunhoDeOutraFrenteError,
  RascunhoForaDoEspacoError,
  caminhoDeRascunho,
  conferirEscritaEm,
  escreverRascunho,
  espacoDaFrente,
  estaDentroDoEspaco,
  identidadeDaFrente,
  type DonoGravado,
} from "@/lib/rascunho/espaco-da-frente";

const dirsCriados: string[] = [];

/** Uma raiz de worktree de mentira — só um diretório tmp único. */
function raizDeMentira(prefixo: string): string {
  const dir = mkdtempSync(path.join(tmpdir(), `${prefixo}-`));
  dirsCriados.push(dir);
  return dir;
}

afterEach(() => {
  while (dirsCriados.length > 0) {
    const dir = dirsCriados.pop()!;
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("identidadeDaFrente / espacoDaFrente — determinismo", () => {
  it("mesma raiz produz o mesmo id, em chamadas diferentes", () => {
    const raiz = raizDeMentira("determinismo-a");
    const f1 = identidadeDaFrente(raiz, "claude/branch-1");
    const f2 = identidadeDaFrente(raiz, "claude/branch-1");
    expect(f1.id).toBe(f2.id);
  });

  it("raízes diferentes produzem ids diferentes", () => {
    const raizA = raizDeMentira("determinismo-b1");
    const raizB = raizDeMentira("determinismo-b2");
    const fa = identidadeDaFrente(raizA, "claude/branch-a");
    const fb = identidadeDaFrente(raizB, "claude/branch-b");
    expect(fa.id).not.toBe(fb.id);
  });

  it("branch diferente na MESMA raiz não muda o id — só o rótulo muda", () => {
    const raiz = raizDeMentira("determinismo-c");
    const f1 = identidadeDaFrente(raiz, "claude/branch-x");
    const f2 = identidadeDaFrente(raiz, "claude/branch-y");
    expect(f1.id).toBe(f2.id);
    expect(f1.rotulo).not.toBe(f2.rotulo);
  });

  it("o id tem o prefixo 'frente-' e 12 hex", () => {
    const raiz = raizDeMentira("determinismo-d");
    const f = identidadeDaFrente(raiz, "claude/branch");
    expect(f.id).toMatch(/^frente-[0-9a-f]{12}$/);
  });
});

describe("estaDentroDoEspaco — prefixo de TEXTO não é contenção", () => {
  it("'frente-ab' NÃO contém 'frente-abc' — só porque a string bate não quer dizer que o diretório bate", () => {
    // Este é o teste que impede o defeito do `.includes("wip")` (ou
    // `startsWith` em string crua) de renascer: comparação por SEGMENTO de
    // caminho, nunca por prefixo de texto.
    expect(estaDentroDoEspaco("/a/.fichas/frente-ab", "/a/.fichas/frente-abc/x.md")).toBe(false);
  });

  it("um arquivo dentro do próprio espaço está contido", () => {
    expect(estaDentroDoEspaco("/a/.fichas/frente-ab", "/a/.fichas/frente-ab/x.md")).toBe(true);
  });

  it("um arquivo em subpasta do espaço também está contido", () => {
    expect(estaDentroDoEspaco("/a/.fichas/frente-ab", "/a/.fichas/frente-ab/sub/x.md")).toBe(true);
  });

  it("um caminho fora completamente não está contido", () => {
    expect(estaDentroDoEspaco("/a/.fichas/frente-ab", "/a/.fichas/outra-coisa/x.md")).toBe(false);
  });
});

describe("caminhoDeRascunho — escape de diretório é rejeitado antes de tocar disco", () => {
  it("'../fora.md' lança", () => {
    const raiz = raizDeMentira("escape-a");
    const f = identidadeDaFrente(raiz, "claude/branch");
    expect(() => caminhoDeRascunho("../fora.md", f)).toThrow();
  });

  it("'/etc/x' (caminho absoluto) lança", () => {
    const raiz = raizDeMentira("escape-b");
    const f = identidadeDaFrente(raiz, "claude/branch");
    expect(() => caminhoDeRascunho("/etc/x", f)).toThrow();
  });

  it("nome vazio lança", () => {
    const raiz = raizDeMentira("escape-c");
    const f = identidadeDaFrente(raiz, "claude/branch");
    expect(() => caminhoDeRascunho("", f)).toThrow();
    expect(() => caminhoDeRascunho("   ", f)).toThrow();
  });

  it("'sub/../../fora.md' (escape disfarçado por subpasta) lança", () => {
    const raiz = raizDeMentira("escape-d");
    const f = identidadeDaFrente(raiz, "claude/branch");
    expect(() => caminhoDeRascunho("sub/../../fora.md", f)).toThrow();
  });
});

describe("escreverRascunho — a outra metade da trava: o caso LIMPO não pode ser barrado", () => {
  it("duas frentes com raízes diferentes, cada uma no seu espaço, MESMO nome de arquivo: as duas escrevem, nenhuma lança", () => {
    const raizA = raizDeMentira("limpo-a");
    const raizB = raizDeMentira("limpo-b");
    const frenteA = identidadeDaFrente(raizA, "claude/frente-a");
    const frenteB = identidadeDaFrente(raizB, "claude/frente-b");

    const caminhoA = escreverRascunho("body.md", "conteúdo da frente A", frenteA);
    const caminhoB = escreverRascunho("body.md", "conteúdo da frente B", frenteB);

    expect(caminhoA).not.toBe(caminhoB);
    expect(readFileSync(caminhoA, "utf8")).toBe("conteúdo da frente A");
    expect(readFileSync(caminhoB, "utf8")).toBe("conteúdo da frente B");
  });
});

describe("escreverRascunho — o caso do incidente: dono estrangeiro barra a escrita, sem tocar o conteúdo", () => {
  // ── POR QUE A "PASTA COMPARTILHADA" É SEMEADA À MÃO NESTE TESTE ───────────
  //
  // Por construção, `espacoDaFrente` deriva o caminho do RAIZ de cada frente
  // — então duas frentes com raízes DIFERENTES (o caso normal) já caem em
  // diretórios PAI diferentes, e o teste "caso limpo" acima prova que elas
  // nunca colidem sozinhas. Isso é o próprio mecanismo funcionando: a
  // incidência do scratchpad compartilhado (chave que não distinguia frente)
  // não pode se repetir aqui por construção.
  //
  // O que ESTE teste prova é a defesa em PROFUNDIDADE: se, por qualquer
  // motivo fora do controle deste módulo — cópia manual entre pastas (o
  // próprio incidente relata isso: "cdm.bak"/"cdm2.bak", contorno à mão),
  // um bug em outra camada, ou um `.fichas/` restaurado de outro lugar — o
  // espaço de uma frente aparecer com o `.dono.json` de OUTRA frente
  // gravado nele, a escrita ainda é barrada, e o conteúdo já escrito não é
  // tocado. Por isso o `.dono.json` "estrangeiro" é plantado diretamente no
  // disco aqui (não via API deste módulo) — é exatamente o defeito de origem
  // desconhecida que a trava precisa sobreviver.
  it("frente B encontra o espaço com dono gravado = frente A e é barrada, com o conteúdo original intacto", () => {
    const raizA = raizDeMentira("incidente-a");
    const raizB = raizDeMentira("incidente-b");
    const frenteA = identidadeDaFrente(raizA, "claude/frente-a");
    const frenteB = identidadeDaFrente(raizB, "claude/frente-b");

    const espacoB = espacoDaFrente(frenteB);
    mkdirSync(espacoB, { recursive: true });
    writeFileSync(path.join(espacoB, "body.md"), "conteúdo original, escrito por A", "utf8");
    const donoEstrangeiro: DonoGravado = {
      id: frenteA.id,
      rotulo: frenteA.rotulo,
      raiz: frenteA.raiz,
      criadoEm: "2026-08-20T12:00:00.000Z",
    };
    writeFileSync(path.join(espacoB, ".dono.json"), JSON.stringify(donoEstrangeiro, null, 2) + "\n", "utf8");

    expect(() => escreverRascunho("body.md", "conteúdo novo, tentado por B", frenteB)).toThrow(RascunhoDeOutraFrenteError);

    // byte a byte idêntico ao original — a tentativa barrada não pode ter
    // tocado o arquivo.
    expect(readFileSync(path.join(espacoB, "body.md"), "utf8")).toBe("conteúdo original, escrito por A");
  });

  it("a mensagem de erro nomeia o id e o rótulo da frente dona, e desde quando", () => {
    const raizA = raizDeMentira("incidente-c");
    const raizB = raizDeMentira("incidente-d");
    const frenteA = identidadeDaFrente(raizA, "claude/frente-dona");
    const frenteB = identidadeDaFrente(raizB, "claude/frente-invasora");

    const espacoB = espacoDaFrente(frenteB);
    mkdirSync(espacoB, { recursive: true });
    const donoEstrangeiro: DonoGravado = {
      id: frenteA.id,
      rotulo: frenteA.rotulo,
      raiz: frenteA.raiz,
      criadoEm: "2026-08-20T12:00:00.000Z",
    };
    writeFileSync(path.join(espacoB, ".dono.json"), JSON.stringify(donoEstrangeiro, null, 2) + "\n", "utf8");

    // Sem `expect.unreachable` (não existe nesta versão do vitest, medido em
    // `node_modules/@vitest/expect`) — captura o erro à mão e afirma sobre
    // ele fora do `try`, para que um `escreverRascunho` que NÃO lançasse
    // reprovasse o teste no `toBeInstanceOf` (comparando `undefined`), não
    // silenciosamente.
    let capturado: unknown = null;
    try {
      escreverRascunho("outro-nome.md", "x", frenteB);
    } catch (e) {
      capturado = e;
    }
    expect(capturado).toBeInstanceOf(RascunhoDeOutraFrenteError);
    const msg = (capturado as Error).message;
    expect(msg).toContain(frenteA.id);
    expect(msg).toContain("claude/frente-dona");
    expect(msg).toContain("2026-08-20T12:00:00.000Z");

    // nada foi criado — a escrita nunca chegou a tocar o disco.
    expect(existsSync(path.join(espacoB, "outro-nome.md"))).toBe(false);
  });
});

describe("escreverRascunho — o próprio dono pode escrever mais de um rascunho no espaço já aberto", () => {
  it("segunda escrita da mesma frente não colide consigo mesma", () => {
    const raiz = raizDeMentira("mesma-frente");
    const f = identidadeDaFrente(raiz, "claude/branch");
    escreverRascunho("um.md", "conteúdo 1", f);
    const caminhoDois = escreverRascunho("dois.md", "conteúdo 2", f);
    expect(readFileSync(caminhoDois, "utf8")).toBe("conteúdo 2");
  });
});

// ── RODADA 2 — o furo que a auditoria achou ─────────────────────────────
//
// `caminhoDeRascunho`/`escreverRascunho` só protegem um caminho MONTADO por
// elas mesmas, dentro do próprio espaço — quem escreve num caminho ESCOLHIDO
// por fora (ex.: `/tmp/.../scratchpad/body.md`, ou o `.fichas` de outra
// frente, apontados diretamente) não passava por nenhuma checagem. É
// exatamente o cenário do incidente real descrito no cabeçalho do módulo:
// um scratchpad compartilhado, sem dono nenhum gravado, onde rascunhos de
// frentes diferentes se atropelavam sob nomes quase-colidentes.
// `conferirEscritaEm` é o guarda para esse caso.
describe("conferirEscritaEm — o guarda para um caminho de destino escolhido por quem chama", () => {
  it("caso limpo, obrigatório: um alvo dentro do próprio espaço da frente não lança", () => {
    const raiz = raizDeMentira("guarda-limpo");
    const f = identidadeDaFrente(raiz, "claude/branch");
    const alvo = path.join(espacoDaFrente(f), "algo.md");
    expect(() => conferirEscritaEm(alvo, f)).not.toThrow();
  });

  it("o caso do incidente, agora de verdade: frente B tenta escrever no body.md que A criou pela API — lança nomeando A, e o conteúdo de A não é tocado", () => {
    const raizA = raizDeMentira("guarda-incidente-a");
    const raizB = raizDeMentira("guarda-incidente-b");
    const frenteA = identidadeDaFrente(raizA, "claude/frente-a-dona");
    const frenteB = identidadeDaFrente(raizB, "claude/frente-b-invasora");

    // A abre o espaço dela e escreve de verdade, pela API — não plantado à mão.
    const caminhoBodyDeA = escreverRascunho("body.md", "conteúdo de A", frenteA);

    let capturado: unknown = null;
    try {
      conferirEscritaEm(caminhoBodyDeA, frenteB);
    } catch (e) {
      capturado = e;
    }
    expect(capturado).toBeInstanceOf(RascunhoDeOutraFrenteError);
    const msg = (capturado as Error).message;
    expect(msg).toContain(frenteA.id);
    expect(msg).toContain("claude/frente-a-dona");

    // A é dona, A não perde nada — byte a byte idêntico ao original.
    expect(readFileSync(caminhoBodyDeA, "utf8")).toBe("conteúdo de A");
  });

  it("terra de ninguém: pasta sem .dono.json em nenhum ancestral lança RascunhoForaDoEspacoError, e a mensagem contém o espaço da própria frente", () => {
    const raiz = raizDeMentira("guarda-terra-de-ninguem");
    const f = identidadeDaFrente(raiz, "claude/branch");
    // uma pasta tmp qualquer, irmã de `raiz` — sem `.dono.json` em nenhum
    // ancestral dela: o scratchpad compartilhado do incidente real.
    const scratchpadDeMentira = raizDeMentira("scratchpad-de-mentira");
    const alvo = path.join(scratchpadDeMentira, "body.md");

    let capturado: unknown = null;
    try {
      conferirEscritaEm(alvo, f);
    } catch (e) {
      capturado = e;
    }
    expect(capturado).toBeInstanceOf(RascunhoForaDoEspacoError);
    expect((capturado as Error).message).toContain(espacoDaFrente(f));
  });

  it("prefixo não é contenção, de novo, agora no guarda: o id da frente com sufixo colado não conta como 'dentro'", () => {
    const raiz = raizDeMentira("guarda-prefixo");
    const f = identidadeDaFrente(raiz, "claude/branch");
    const espaco = espacoDaFrente(f); // ".../.fichas/frente-xxxxxxxxxxxx/" (barra final)
    // mesmo prefixo de TEXTO do id, mas é outro diretório — "frente-xxxxxxxxxxxxYZW"
    const espacoParecido = espaco.replace(/[\\/]$/, "") + "xyz" + path.sep;
    mkdirSync(espacoParecido, { recursive: true });
    const alvo = path.join(espacoParecido, "arquivo.md");

    // Nem dentro do espaço real (comparação por segmento reprova o prefixo de
    // texto) nem com dono gravado em ancestral nenhum → terra de ninguém.
    expect(() => conferirEscritaEm(alvo, f)).toThrow(RascunhoForaDoEspacoError);
  });

  it("subida para ancestral termina na raiz do filesystem sem travar, num caminho fundo dentro do tmpdir, sem dono", () => {
    const raiz = raizDeMentira("guarda-fundo");
    const f = identidadeDaFrente(raiz, "claude/branch");
    const fundo = path.join(raiz, "a", "b", "c", "d", "e", "f", "g", "h");
    mkdirSync(fundo, { recursive: true });
    const alvo = path.join(fundo, "arquivo.md");

    // Se o laço de `encontrarDonoAncestral` não tivesse teto, isto travaria
    // (ou estouraria pilha) em vez de terminar com o erro certo.
    expect(() => conferirEscritaEm(alvo, f)).toThrow(RascunhoForaDoEspacoError);
  });

  it("dono ancestral com o MESMO id da frente que chama não lança — mata a mutação que remove 'if (dono.id === f.id) return;' (Achado 4, rodada 4)", () => {
    // Reproduz por mutação: remover essa linha faz `conferirEscritaEm`
    // lançar SEMPRE que houver dono ancestral, mesmo quando o dono é a
    // própria frente que chama — e a suíte inteira continuava verde sem
    // este teste (confirmado pela auditoria: 21 de 21 testes passavam com a
    // linha removida). O `.dono.json` é plantado num diretório ANCESTRAL que
    // fica FORA do espaço desta frente (`.fichas/<id>/`), mas com o mesmo
    // `id` — o cenário que só a linha em questão cobre.
    const raiz = raizDeMentira("guarda-mesmo-dono-ancestral");
    const f = identidadeDaFrente(raiz, "claude/branch");

    const dirAncestral = path.join(raiz, "outra-pasta-do-mesmo-worktree");
    mkdirSync(dirAncestral, { recursive: true });
    const donoIgual: DonoGravado = { id: f.id, rotulo: f.rotulo, raiz: f.raiz, criadoEm: new Date().toISOString() };
    writeFileSync(path.join(dirAncestral, ".dono.json"), JSON.stringify(donoIgual, null, 2) + "\n", "utf8");

    const alvo = path.join(dirAncestral, "sub", "arquivo.md");
    expect(() => conferirEscritaEm(alvo, f)).not.toThrow();
  });
});

// ── RODADA 4 — os quatro achados da auditoria ───────────────────────────

describe("Achado 3 (rodada 4) — subpasta legítima não estoura ENOENT", () => {
  it("escreverRascunho('sub/nota.md', ...) cria o diretório pai e grava — a mensagem de RascunhoForaDoEspacoError promete isso, e antes não cumpria", () => {
    const raiz = raizDeMentira("achado3-subpasta");
    const f = identidadeDaFrente(raiz, "claude/branch");

    const caminho = escreverRascunho("sub/nota.md", "conteúdo em subpasta", f);

    expect(readFileSync(caminho, "utf8")).toBe("conteúdo em subpasta");
  });

  it("subpasta de mais de um nível também funciona", () => {
    const raiz = raizDeMentira("achado3-subpasta-funda");
    const f = identidadeDaFrente(raiz, "claude/branch");

    const caminho = escreverRascunho("sub/mais/fundo/nota.md", "x", f);

    expect(readFileSync(caminho, "utf8")).toBe("x");
  });
});

describe("Achado 1 (rodada 4) — a trava não segura symlink", () => {
  it("caso do incidente reproduzido: B cria symlink no espaço dela apontando pro body.md de A; escreverRascunho(link) lança, e o conteúdo de A volta byte a byte igual ao original", () => {
    const raizA = raizDeMentira("achado1-escrever-a");
    const raizB = raizDeMentira("achado1-escrever-b");
    const frenteA = identidadeDaFrente(raizA, "claude/frente-a");
    const frenteB = identidadeDaFrente(raizB, "claude/frente-b");

    const caminhoBodyDeA = escreverRascunho("body.md", "ORIGINAL DE A", frenteA);

    const espacoB = espacoDaFrente(frenteB);
    mkdirSync(espacoB, { recursive: true });
    const link = path.join(espacoB, "link.md");
    symlinkSync(caminhoBodyDeA, link);

    expect(() => escreverRascunho("link.md", "B ATROPELOU A", frenteB)).toThrow();

    expect(readFileSync(caminhoBodyDeA, "utf8")).toBe("ORIGINAL DE A");
  });

  it("o mesmo furo, agora em conferirEscritaEm: alvo é symlink dentro do espaço de B apontando pro arquivo de A → lança, e A não é tocada", () => {
    const raizA = raizDeMentira("achado1-conferir-a");
    const raizB = raizDeMentira("achado1-conferir-b");
    const frenteA = identidadeDaFrente(raizA, "claude/frente-a");
    const frenteB = identidadeDaFrente(raizB, "claude/frente-b");

    const caminhoBodyDeA = escreverRascunho("body.md", "ORIGINAL DE A", frenteA);

    const espacoB = espacoDaFrente(frenteB);
    mkdirSync(espacoB, { recursive: true });
    const link = path.join(espacoB, "link.md");
    symlinkSync(caminhoBodyDeA, link);

    expect(() => conferirEscritaEm(link, frenteB)).toThrow();

    expect(readFileSync(caminhoBodyDeA, "utf8")).toBe("ORIGINAL DE A");
  });

  it("caso limpo com symlink LEGÍTIMO: symlink dentro do espaço apontando para outro arquivo do MESMO espaço não lança, e escreve", () => {
    const raiz = raizDeMentira("achado1-legitimo");
    const f = identidadeDaFrente(raiz, "claude/branch");

    const alvoReal = escreverRascunho("real.md", "conteúdo real", f);
    const espaco = espacoDaFrente(f);
    const link = path.join(espaco, "link-legitimo.md");
    symlinkSync(alvoReal, link);

    expect(() => escreverRascunho("link-legitimo.md", "escrito através do link", f)).not.toThrow();
    expect(readFileSync(alvoReal, "utf8")).toBe("escrito através do link");

    expect(() => conferirEscritaEm(link, f)).not.toThrow();
  });

  it("caso limpo comum (arquivo novo, sem symlink nenhum) continua passando depois da defesa contra symlink", () => {
    const raiz = raizDeMentira("achado1-caso-comum");
    const f = identidadeDaFrente(raiz, "claude/branch");

    const caminho = escreverRascunho("comum.md", "sem symlink nenhum", f);

    expect(readFileSync(caminho, "utf8")).toBe("sem symlink nenhum");
    expect(() => conferirEscritaEm(caminho, f)).not.toThrow();
  });
});
