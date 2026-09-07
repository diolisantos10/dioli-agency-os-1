// A trava de reivindicação — as duas metades.
//
// METADE 1 (tem que barrar de verdade): os TRÊS casos reais de 16/08/2026,
// como fixture — não um exemplo inventado. Se esta metade sozinha existisse,
// bastaria fazer `conferirColisao` gritar "colide" sempre e o teste passaria
// sem proteger nada.
//
// METADE 2 (não pode barrar quem tem razão): três PMs trabalhando em paralelo,
// em responsabilidades e arquivos distintos, é exatamente o que a casa fez de
// CERTO no mesmo dia — e não pode acender alarme nenhum. Sem esta metade, uma
// trava "colide sempre" também passaria.
//
// O dia que escreveu isto: 16/08/2026 — três frentes construídas em dobro na
// mesma branch, por chats cegos uns para os outros, com a regra de coordenação
// já escrita em `docs/kit/13-quem-esta-vivo.md` §3 e ignorada por ser prompt.

import { describe, expect, it } from "vitest";
import {
  caminhosDeSchemaSemModelo,
  conferirColisao,
  estaViva,
  nomeDoArquivo,
  normalizarCaminho,
  normalizarResponsabilidade,
  type Reivindicacao,
} from "@/lib/coordenacao/reivindicacoes";

const AGORA = new Date("2026-08-16T18:00:00Z");

/** Uma reivindicação viva, aberta agora mesmo, com os campos que cada teste
 *  não precisa repetir.
 *
 *  Escrito campo a campo, sem `...spread` no final: espalhar um `Partial<T>`
 *  por cima de um literal faz o TypeScript tratar toda propriedade opcional
 *  como `T | undefined`, e o objeto resultante deixa de bater estruturalmente
 *  com o tipo `Reivindicacao` (que não aceita `id`/`frente` undefined). */
function reivindicacao(parcial: Partial<Reivindicacao> & Pick<Reivindicacao, "quem" | "responsabilidade" | "arquivos">): Reivindicacao {
  return {
    id: parcial.id ?? normalizarResponsabilidade(parcial.responsabilidade),
    quem: parcial.quem,
    frente: parcial.frente ?? "(frente de teste)",
    responsabilidade: parcial.responsabilidade,
    arquivos: parcial.arquivos,
    abertaEm: parcial.abertaEm ?? AGORA.toISOString(),
    encerradaEm: parcial.encerradaEm ?? null,
    forcadaPor: parcial.forcadaPor,
  };
}

describe("normalizarResponsabilidade — minúsculas, sem acento, separador único", () => {
  it("reduz espaço, maiúscula e acento ao mesmo slug", () => {
    expect(normalizarResponsabilidade("Comercial / Verba Vs Estimativa")).toBe("comercial/verba/vs/estimativa");
    expect(normalizarResponsabilidade("comercial/verba-vs-estimativa")).toBe("comercial/verba-vs-estimativa");
  });

  it("acento não sobrevive, letra sim", () => {
    expect(normalizarResponsabilidade("Não Informação")).toBe("nao/informacao");
  });
});

describe("normalizarCaminho — sem ./, sem barra final", () => {
  it("remove prefixo ./ repetido e barra final repetida", () => {
    expect(normalizarCaminho("./lib/email/")).toBe("lib/email");
    expect(normalizarCaminho("././a/b//")).toBe("a/b");
  });

  it("caminho já limpo não muda", () => {
    expect(normalizarCaminho("lib/email/orcamento-pronto.ts")).toBe("lib/email/orcamento-pronto.ts");
  });
});

describe("estaViva — encerrada nunca está viva; velha não é a mesma coisa que bloqueada", () => {
  it("encerrada é encerrada mesmo se foi aberta agora mesmo", () => {
    const r = reivindicacao({ quem: "a", responsabilidade: "x/y", arquivos: ["a.ts"], encerradaEm: AGORA.toISOString() });
    expect(estaViva(r, AGORA)).toBe("encerrada");
  });

  it("aberta há 1h está viva", () => {
    const r = reivindicacao({ quem: "a", responsabilidade: "x/y", arquivos: ["a.ts"], abertaEm: new Date(AGORA.getTime() - 60 * 60 * 1000).toISOString() });
    expect(estaViva(r, AGORA)).toBe("viva");
  });

  it("aberta há 25h é 'velha', não 'viva' — o guardrail 5: a trava não pode ser eterna", () => {
    const r = reivindicacao({ quem: "a", responsabilidade: "x/y", arquivos: ["a.ts"], abertaEm: new Date(AGORA.getTime() - 25 * 60 * 60 * 1000).toISOString() });
    expect(estaViva(r, AGORA)).toBe("velha");
  });
});

describe("nomeDoArquivo — o próprio nome do arquivo é o sinal de colisão", () => {
  it("responsabilidades iguais geram o MESMO nome de arquivo", () => {
    expect(nomeDoArquivo(normalizarResponsabilidade("comercial/verba-vs-estimativa"))).toBe("comercial-verba-vs-estimativa.json");
  });
});

describe("⛔ conferirColisao — BARRA os três casos reais de 16/08/2026", () => {
  it("caso 1: mesma responsabilidade, ARQUIVOS COM NOMES DIFERENTES — colide mesmo assim", () => {
    // `verba-declarada.ts` e `verba-vs-estimativa.ts` são arquivos DIFERENTES.
    // Colisão por caminho de arquivo não pegaria isto — só por responsabilidade.
    const existente = reivindicacao({
      quem: "sessao-a",
      frente: "verba declarada vs estimativa — módulo comercial",
      responsabilidade: "comercial/verba-vs-estimativa",
      arquivos: ["lib/agency/comercial/verba-declarada.ts"],
    });
    const nova = {
      quem: "sessao-b",
      responsabilidade: "Comercial/Verba-Vs-Estimativa", // mesma responsabilidade, maiúscula diferente
      arquivos: ["lib/agency/comercial/verba-vs-estimativa.ts"],
    };

    const r = conferirColisao(nova, [existente], AGORA);
    expect(r.colide).toBe(true);
    expect(r.motivos.join(" ")).toMatch(/responsabilidade/);
    expect(r.motivos.join(" ")).toContain("sessao-a");
    expect(r.quemColidiu).toEqual(["sessao-a"]);
  });

  it("caso 2: duas frentes tocando app/api/sdr/chat/route.ts — colide por arquivo", () => {
    const existente = reivindicacao({
      quem: "sessao-a",
      frente: "conserta o parse_error do SDR",
      responsabilidade: "sdr/parse-error",
      arquivos: ["app/api/sdr/chat/route.ts"],
    });
    const nova = {
      quem: "sessao-b",
      responsabilidade: "sdr/outro-ajuste-qualquer", // responsabilidade DIFERENTE — só o arquivo colide
      arquivos: ["app/api/sdr/chat/route.ts"],
    };

    const r = conferirColisao(nova, [existente], AGORA);
    expect(r.colide).toBe(true);
    expect(r.motivos.join(" ")).toMatch(/arquivo/);
    expect(r.motivos.join(" ")).toContain("app/api/sdr/chat/route.ts");
  });

  it("caso 3: pasta lib/email/ reivindicada de um lado, arquivo lib/email/orcamento-pronto.ts do outro — colide por prefixo", () => {
    const existente = reivindicacao({
      quem: "sessao-a",
      frente: "revisão geral de e-mails transacionais",
      responsabilidade: "email/revisao-geral",
      arquivos: ["lib/email/"], // a PASTA inteira
    });
    const nova = {
      quem: "sessao-b",
      responsabilidade: "email/orcamento-pronto",
      arquivos: ["lib/email/orcamento-pronto.ts"], // um ARQUIVO dentro da pasta
    };

    const r = conferirColisao(nova, [existente], AGORA);
    expect(r.colide).toBe(true);
    expect(r.motivos.join(" ")).toMatch(/lib\/email/);
  });

  it("prefixo é de DIRETÓRIO, não de texto — lib/email não colide com lib/email-templates", () => {
    const existente = reivindicacao({
      quem: "sessao-a",
      frente: "revisão geral de e-mails",
      responsabilidade: "email/revisao-geral",
      arquivos: ["lib/email/"],
    });
    const nova = {
      quem: "sessao-b",
      responsabilidade: "email-templates/refactor",
      arquivos: ["lib/email-templates/base.ts"],
    };

    expect(conferirColisao(nova, [existente], AGORA).colide).toBe(false);
  });
});

describe("✅ conferirColisao — NÃO INVENTA problema no caso limpo (três PMs em paralelo, como em 16/08)", () => {
  it("três reivindicações em responsabilidades e arquivos distintos: nenhuma colisão", () => {
    const existentes = [
      reivindicacao({ quem: "pm-1", responsabilidade: "sdr/parse-error", arquivos: ["app/api/sdr/chat/route.ts"] }),
      reivindicacao({ quem: "pm-2", responsabilidade: "comercial/verba-vs-estimativa", arquivos: ["lib/agency/comercial/verba-vs-estimativa.ts"] }),
    ];
    const nova = {
      quem: "pm-3",
      responsabilidade: "email/orcamento-pronto",
      arquivos: ["lib/email/orcamento-pronto.ts"],
    };

    const r = conferirColisao(nova, existentes, AGORA);
    expect(r.colide).toBe(false);
    expect(r.motivos).toHaveLength(0);
    expect(r.quemColidiu).toHaveLength(0);
  });

  it("reivindicação ENCERRADA não bloqueia ninguém", () => {
    const existente = reivindicacao({
      quem: "sessao-a",
      responsabilidade: "comercial/verba-vs-estimativa",
      arquivos: ["lib/agency/comercial/verba-vs-estimativa.ts"],
      encerradaEm: new Date(AGORA.getTime() - 10 * 60 * 1000).toISOString(),
    });
    const nova = { quem: "sessao-b", responsabilidade: "comercial/verba-vs-estimativa", arquivos: ["lib/agency/comercial/verba-declarada.ts"] };

    const r = conferirColisao(nova, [existente], AGORA);
    expect(r.colide).toBe(false);
    expect(r.avisos).toHaveLength(0);
  });

  it("reivindicação aberta há 25h entra como AVISO e NÃO bloqueia", () => {
    const existente = reivindicacao({
      quem: "sessao-a",
      responsabilidade: "comercial/verba-vs-estimativa",
      arquivos: ["lib/agency/comercial/verba-declarada.ts"],
      abertaEm: new Date(AGORA.getTime() - 25 * 60 * 60 * 1000).toISOString(),
    });
    const nova = { quem: "sessao-b", responsabilidade: "comercial/verba-vs-estimativa", arquivos: ["lib/agency/comercial/verba-vs-estimativa.ts"] };

    const r = conferirColisao(nova, [existente], AGORA);
    expect(r.colide).toBe(false);
    expect(r.motivos).toHaveLength(0);
    expect(r.avisos).toHaveLength(1);
    expect(r.avisos[0]).toMatch(/velha/);
  });

  it("a própria reivindicação do mesmo `quem` nunca colide consigo mesma", () => {
    const existente = reivindicacao({
      quem: "pm-a27b5772",
      responsabilidade: "comercial/verba-vs-estimativa",
      arquivos: ["lib/agency/comercial/verba-vs-estimativa.ts"],
    });
    // A mesma sessão reabrindo/reconferindo a própria frente — mesma
    // responsabilidade, mesmo arquivo, mesmo `quem`.
    const nova = { quem: "pm-a27b5772", responsabilidade: "comercial/verba-vs-estimativa", arquivos: ["lib/agency/comercial/verba-vs-estimativa.ts"] };

    const r = conferirColisao(nova, [existente], AGORA);
    expect(r.colide).toBe(false);
    expect(r.avisos).toHaveLength(0);
  });
});

// ── AS DUAS METADES DE `prisma/schema.prisma` COLIDIR POR MODELO ───────────
//
// Ordem do Diretor Geral, 30/08/2026 (`.despachos/F2-schema-colide-por-modelo.md`):
// o schema deixa de colidir por ARQUIVO e passa a colidir por MODELO. Nomes
// FICTÍCIOS de propósito — a ficha proíbe usar `ParceriaDoCliente` e
// `Publication`, que têm frente viva de verdade.
describe("⚖️ conferirColisao — prisma/schema.prisma colide por MODELO, não por arquivo inteiro", () => {
  it("METADE 1 — modelos DIFERENTES do schema NÃO colidem (o caso limpo de 30/08: três sessões, três modelos)", () => {
    const existente = reivindicacao({
      quem: "sessao-a",
      frente: "colunas de preço",
      responsabilidade: "schema/colunas-de-preco",
      arquivos: ["prisma/schema.prisma#ModeloDeTestePreco"],
    });
    const nova = {
      quem: "sessao-b",
      responsabilidade: "schema/conta-de-servico",
      arquivos: ["prisma/schema.prisma#ModeloDeTesteContaDeServico"],
    };

    const r = conferirColisao(nova, [existente], AGORA);
    expect(r.colide).toBe(false);
    expect(r.motivos).toHaveLength(0);
  });

  it("METADE 2 — o MESMO modelo do schema continua colidindo, e o motivo nomeia o modelo", () => {
    const existente = reivindicacao({
      quem: "sessao-a",
      frente: "colunas de preço",
      responsabilidade: "schema/colunas-de-preco",
      arquivos: ["prisma/schema.prisma#ModeloDeTestePreco"],
    });
    const nova = {
      quem: "sessao-b",
      responsabilidade: "schema/outro-ajuste-no-mesmo-modelo",
      arquivos: ["prisma/schema.prisma#ModeloDeTestePreco"],
    };

    const r = conferirColisao(nova, [existente], AGORA);
    expect(r.colide).toBe(true);
    expect(r.motivos.join(" ")).toContain("ModeloDeTestePreco");
    expect(r.quemColidiu).toEqual(["sessao-a"]);
  });

  it("compatibilidade — reivindicação ANTIGA sem modelo (bare) não vira coringa contra uma nova com modelo", () => {
    const existenteBare = reivindicacao({
      quem: "sessao-a",
      frente: "reivindicação de antes desta régua",
      responsabilidade: "schema/reivindicacao-antiga",
      arquivos: ["prisma/schema.prisma"], // formato ANTIGO, sem "#modelo"
    });
    const nova = {
      quem: "sessao-b",
      responsabilidade: "schema/colunas-de-preco",
      arquivos: ["prisma/schema.prisma#ModeloDeTestePreco"],
    };

    const r = conferirColisao(nova, [existenteBare], AGORA);
    expect(r.colide).toBe(false);
  });

  it("compatibilidade — duas reivindicações ANTIGAS, ambas bare, NÃO colidem mais entre si (é o caso real de 30/08: sem modelo declarado, não dá para provar 'mesmo modelo')", () => {
    // Fixture inspirada no caso REAL medido em disco em 30/08/2026:
    // `reivindicacoes/mesa-de-comando-diretriz-do-sdr.json` e
    // `conta-de-servico-diretor-geral.json` citam as DUAS só "prisma/schema.prisma"
    // (sem "#modelo") e colidiam sob a régua de arquivo antiga — apesar de a
    // auditoria do Diretor ter confirmado que acrescentavam modelos distintos.
    const existenteBare = reivindicacao({
      quem: "sessao-a",
      frente: "reivindicação antiga 1",
      responsabilidade: "schema/antiga-1",
      arquivos: ["prisma/schema.prisma"],
    });
    const novaBare = {
      quem: "sessao-b",
      responsabilidade: "schema/antiga-2",
      arquivos: ["prisma/schema.prisma"],
    };

    const r = conferirColisao(novaBare, [existenteBare], AGORA);
    expect(r.colide).toBe(false);
  });

  it("fora do schema.prisma, a régua por arquivo inteiro continua valendo — nada mais foi afrouxado", () => {
    const existente = reivindicacao({
      quem: "sessao-a",
      frente: "outra frente qualquer",
      responsabilidade: "outra/frente",
      arquivos: ["lib/agency/outro-arquivo.ts"],
    });
    const nova = {
      quem: "sessao-b",
      responsabilidade: "mais-uma/frente",
      arquivos: ["lib/agency/outro-arquivo.ts"],
    };

    expect(conferirColisao(nova, [existente], AGORA).colide).toBe(true);
  });
});

// ── A PORTA DE ENTRADA: `caminhosDeSchemaSemModelo` ─────────────────────────
//
// Ficha `.despachos/F3-schema-exige-modelo.md`, 30/08/2026: a compatibilidade
// acima (metades "compatibilidade" do describe anterior) é fail-OPEN de
// propósito — sem modelo não colide com NADA, nem com outra sem modelo. Isto
// aqui NÃO é a régua de colisão: é a função pura que a PORTA
// (`scripts/reivindicar.mts`, comando `abrir`) usa para recusar ANTES de
// escrever. As duas convivem: a régua acima continua idêntica (nenhum destes
// testes toca `conferirColisao`), só a entrada fecha.
describe("🚪 caminhosDeSchemaSemModelo — a porta que o comando `abrir` usa antes de escrever", () => {
  it("aponta prisma/schema.prisma SEM modelo", () => {
    expect(caminhosDeSchemaSemModelo(["prisma/schema.prisma"])).toEqual(["prisma/schema.prisma"]);
  });

  it("aponta prisma/schema.prisma com '#' vazio — mesma falta de prova que sem '#' nenhum", () => {
    expect(caminhosDeSchemaSemModelo(["prisma/schema.prisma#"])).toEqual(["prisma/schema.prisma#"]);
    // Devolve o caminho COMO O OPERADOR DIGITOU, com o "#" solto: a mensagem de
    // recusa mostra a ele o proprio erro, em vez de uma versao limpa que ele nao
    // reconhece. Eco do que foi digitado ensina; eco normalizado confunde.
  });

  it("NÃO aponta prisma/schema.prisma#Modelo — modelo declarado", () => {
    expect(caminhosDeSchemaSemModelo(["prisma/schema.prisma#ModeloDeTeste"])).toEqual([]);
  });

  it("NÃO aponta arquivo comum, mesmo sem '#'", () => {
    expect(caminhosDeSchemaSemModelo(["lib/qualquer.ts"])).toEqual([]);
  });

  it("lista mista: só o que é o schema sem modelo entra na lista", () => {
    expect(
      caminhosDeSchemaSemModelo(["lib/qualquer.ts", "prisma/schema.prisma", "prisma/schema.prisma#ModeloDeTeste"]),
    ).toEqual(["prisma/schema.prisma"]);
  });

  it("tolera caminho cru, não normalizado ('./prisma/schema.prisma/')", () => {
    expect(caminhosDeSchemaSemModelo(["./prisma/schema.prisma/"])).toEqual(["prisma/schema.prisma"]);
  });

  it("lista vazia para lista vazia", () => {
    expect(caminhosDeSchemaSemModelo([])).toEqual([]);
  });
});
