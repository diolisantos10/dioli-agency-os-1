// A ORDEM DA FILA DE DÍVIDA (`ordemDaFila`, `app/agency/leads/page.tsx`) —
// rodada 3 do despacho `interface`.
//
// A captura ao vivo (29/08/2026) mostrou a seção "Conversas que pararam na
// sala" fora de ordem: a promessa mais velha (6 dias) ficava embaixo de uma
// conversa sem promessa nenhuma (parada há 1 dia), e o cabeçalho da própria
// página promete "o mais antigo em cima" — a seção nova contradizia o
// cabeçalho na mesma tela.
//
// A regra provada aqui: quem tem `prometidoEm` vem primeiro, da promessa
// MAIS ANTIGA para a mais nova; quem não tem vem depois, da parada mais
// antiga para a mais nova. E a função nunca muta o array recebido.

import { describe, it, expect } from "vitest";
import { ordemDaFila, type ConversaParada } from "@/app/agency/leads/page";

function conversa(parcial: Partial<ConversaParada> & { fio: string }): ConversaParada {
  return {
    turnos: 1,
    paradaEm: "2026-08-28T12:00:00.000Z",
    contato: null,
    escopo: {},
    proximaAcao: "",
    prometidoEm: null,
    contatadoEm: null,
    contatadoPor: null,
    clienteDoConvite: null,
    atribuicao: null,
    ...parcial,
  };
}

describe("ordemDaFila", () => {
  it("coloca a dívida mais velha em cima: promessa mais antiga primeiro, depois sem promessa, depois parada mais antiga", () => {
    // O caso exato da captura ao vivo, misturando as três situações:
    const ivo = conversa({
      fio: "sdr:ivo",
      turnos: 2,
      paradaEm: "2026-08-28T12:00:00.000Z", // parada há 1 dia, sem promessa
      prometidoEm: null,
    });
    const aurora = conversa({
      fio: "sdr:aurora",
      turnos: 9,
      paradaEm: "2026-08-26T12:00:00.000Z", // parada há 3 dias
      prometidoEm: "2026-08-26T12:00:00.000Z", // promessa há 3 dias
    });
    const semNome = conversa({
      fio: "sdr:sem-nome",
      turnos: 4,
      paradaEm: "2026-08-23T12:00:00.000Z", // parada há 6 dias
      prometidoEm: "2026-08-23T12:00:00.000Z", // promessa há 6 dias — a MAIS velha
    });

    const entrada = [ivo, aurora, semNome];
    const ordenada = ordemDaFila(entrada);

    expect(ordenada.map((c) => c.fio)).toEqual([
      "sdr:sem-nome", // promessa há 6 dias — a mais velha, vem primeiro
      "sdr:aurora",   // promessa há 3 dias
      "sdr:ivo",      // sem promessa — vem depois de toda promessa, mesmo sendo a parada mais recente
    ]);
  });

  it("entre duas com promessa, a promessa mais antiga vem antes da mais nova", () => {
    const promessaNova = conversa({ fio: "nova", prometidoEm: "2026-08-28T12:00:00.000Z" });
    const promessaVelha = conversa({ fio: "velha", prometidoEm: "2026-08-20T12:00:00.000Z" });

    expect(ordemDaFila([promessaNova, promessaVelha]).map((c) => c.fio)).toEqual(["velha", "nova"]);
  });

  it("entre duas sem promessa, a parada mais antiga vem antes da mais nova", () => {
    const paradaNova = conversa({ fio: "nova", paradaEm: "2026-08-28T12:00:00.000Z", prometidoEm: null });
    const paradaVelha = conversa({ fio: "velha", paradaEm: "2026-08-20T12:00:00.000Z", prometidoEm: null });

    expect(ordemDaFila([paradaNova, paradaVelha]).map((c) => c.fio)).toEqual(["velha", "nova"]);
  });

  it("NÃO muta o array recebido", () => {
    const a = conversa({ fio: "a", paradaEm: "2026-08-28T12:00:00.000Z", prometidoEm: null });
    const b = conversa({ fio: "b", prometidoEm: "2026-08-20T12:00:00.000Z" });
    const entrada = [a, b];
    const copia = [...entrada];

    ordemDaFila(entrada);

    expect(entrada).toEqual(copia);
    expect(entrada[0]).toBe(a);
    expect(entrada[1]).toBe(b);
  });

  it("lista vazia devolve lista vazia", () => {
    expect(ordemDaFila([])).toEqual([]);
  });
});

// A regra nova (rodada "a fila deixa de ser só leitura"): dívida QUITADA
// desce para o fim, mesmo que tivesse a promessa mais velha de todas —
// senão marcar como contatado não move o cartão, e a fila parece parada.
describe("ordemDaFila — quem já foi CONTATADO desce para o fim", () => {
  it("contatada com a promessa MAIS VELHA ainda assim vai para o fim, atrás de quem não tem promessa nenhuma", () => {
    const semPromessaNaoContatada = conversa({
      fio: "sem-promessa",
      paradaEm: "2026-08-28T12:00:00.000Z",
      prometidoEm: null,
    });
    const prometidaEContatada = conversa({
      fio: "prometida-e-contatada",
      paradaEm: "2026-08-20T12:00:00.000Z",
      prometidoEm: "2026-08-20T12:00:00.000Z", // a mais velha de todas
      contatadoEm: "2026-08-27T12:00:00.000Z",
    });

    const ordenada = ordemDaFila([prometidaEContatada, semPromessaNaoContatada]);

    expect(ordenada.map((c) => c.fio)).toEqual(["sem-promessa", "prometida-e-contatada"]);
  });

  it("entre duas contatadas, cai no mesmo desempate de quem não tem promessa (parada mais antiga primeiro)", () => {
    const contatadaRecente = conversa({
      fio: "contatada-recente",
      paradaEm: "2026-08-20T12:00:00.000Z",
      contatadoEm: "2026-08-28T12:00:00.000Z",
    });
    const contatadaAntiga = conversa({
      fio: "contatada-antiga",
      paradaEm: "2026-08-10T12:00:00.000Z",
      contatadoEm: "2026-08-27T12:00:00.000Z",
    });

    expect(ordemDaFila([contatadaRecente, contatadaAntiga]).map((c) => c.fio)).toEqual([
      "contatada-antiga",
      "contatada-recente",
    ]);
  });
});
