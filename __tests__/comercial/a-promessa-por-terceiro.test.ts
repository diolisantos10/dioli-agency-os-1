// "A EQUIPE ENTRA EM CONTATO" — a promessa que a régua não pegava.
//
// ═══ MEDIDO COM O CLIENTE 001 NA TELA (29/08/2026) ═════════════════════════
//
// A conversa do primeiro cliente real da casa terminou assim:
//
//   "Já deixei essa observação registrada no seu escopo para a equipe analisar
//    a viabilidade e entrar em contato para alinhar os detalhes com o CEO da
//    Foocci."
//
// E parou. **Sem prazo, sem canal, sem dizer se ele espera ali ou pode fechar a
// janela.** O CEO chamou de descaso.
//
// ⚠️ O ACHADO NÃO É A FRASE — É QUE A RÉGUA JÁ EXISTIA E NÃO PEGOU.
// `promessa-que-a-maquina-nao-cumpre.ts` nasceu no #356 exatamente para isto, e
// tem chamador de verdade (`app/api/sdr/chat/route.ts`). Mas os padrões dela
// cobriam só a primeira pessoa — "eu preparo e te envio". A frase acima
// **terceiriza**: quem analisa e quem entra em contato é "a equipe".
//
// Mesma dívida com o cliente, sujeito diferente. *Régua verde sobre o padrão
// errado é pior que régua nenhuma.*

import { describe, it, expect } from "vitest";
import {
  promessasSoltas,
  temPromessaSolta,
  O_QUE_DIZER_NO_LUGAR,
} from "@/lib/agency/comercial/promessa-que-a-maquina-nao-cumpre";

/** A frase EXATA que o cliente 001 leu. É por ela que este arquivo existe. */
const A_FRASE_DO_CLIENTE_001 =
  "Já deixei essa observação registrada no seu escopo para a equipe analisar a " +
  "viabilidade e entrar em contato para alinhar os detalhes com o CEO da Foocci.";

describe("a frase que o cliente 001 leu", () => {
  it("🔴 é barrada — era o que a régua deveria ter feito e não fez", () => {
    expect(
      temPromessaSolta(A_FRASE_DO_CLIENTE_001),
      "a frase que deixou o primeiro cliente real no escuro passaria de novo",
    ).toBe(true);
  });

  it("e o motivo diz o que está errado, não só que está errado", () => {
    const achadas = promessasSoltas(A_FRASE_DO_CLIENTE_001);
    expect(achadas.length).toBeGreaterThan(0);
    expect(achadas[0]!.porque).toMatch(/ningu[ée]m agendou|dívida|divida/i);
  });
});

describe("a família da promessa por terceiro", () => {
  for (const frase of [
    "A equipe entra em contato para alinhar os detalhes.",
    "Nosso time retorna assim que analisar.",
    "Alguém do atendimento te avisa.",
    "Vou levar isso para a equipe.",
    "Vou passar para o time comercial.",
  ]) {
    it(`🔒 barra: "${frase.slice(0, 42)}…"`, () => {
      expect(temPromessaSolta(frase), "passou uma promessa sem dono nem prazo").toBe(true);
    });
  }
});

describe("⛔ o que NÃO pode ser barrado — senão a régua vira mordaça", () => {
  for (const frase of [
    // Prazo E canal declarados: é informação, não promessa vazia.
    "A equipe responde por e-mail em até 1 dia útil — pode fechar a janela.",
    "Vou levar isso para a direção hoje e te aviso por e-mail ainda hoje.",
    // Nada a ver com contato.
    "A equipe usa esse dado na hora de escrever os posts.",
    "Seu escopo está pronto. Confira o resumo e confirme abaixo.",
    "É aqui que entra gente da nossa equipe, publicação e Google gerenciado.",
    // ⚠️ CANAL declarado dispensa a régua — decisão do #356 ("quem promete é
    // gente, e gente cumpre"), que este conserto NÃO reverte. A tensão com a
    // reclamação do CEO (faltou PRAZO) está declarada no código e foi levada ao
    // Diretor Geral: é decisão de doutrina, não minha.
    "Nossa equipe entra em contato com você por este e-mail.",
    "O pessoal responde por aqui mesmo.",
  ]) {
    it(`✅ deixa passar: "${frase.slice(0, 44)}…"`, () => {
      expect(
        temPromessaSolta(frase),
        "a régua barrou uma frase legítima — régua que barra demais é desligada na primeira reclamação",
      ).toBe(false);
    });
  }
});

describe("a instrução gêmea — proibir sem dizer o que falar empurra para o contorno", () => {
  it("diz as TRÊS coisas que faltaram ao cliente 001", () => {
    // Por onde vem a resposta · em quanto tempo · se pode fechar a janela.
    expect(O_QUE_DIZER_NO_LUGAR).toMatch(/POR ONDE/);
    expect(O_QUE_DIZER_NO_LUGAR).toMatch(/EM QUANTO TEMPO/i);
    expect(O_QUE_DIZER_NO_LUGAR).toMatch(/fechar a janela/i);
  });

  it("⛔ e proíbe inventar prazo que a casa não cumpre", () => {
    expect(O_QUE_DIZER_NO_LUGAR).toMatch(/s[óo] se a casa cumprir|n[ãa]o sabe o prazo/i);
  });
});
