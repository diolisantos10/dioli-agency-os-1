// compromisso-do-sdr.ts — a metade PURA da fechadura (P0 30/08/2026, Marcos,
// Foocci). Ver o cabeçalho do módulo para o caso medido.

import { describe, it, expect } from "vitest";
import {
  prazoPadraoDoCompromisso,
  compromissosVencidos,
  fraseDoCompromissoVencido,
  type CompromissoAberto,
} from "@/lib/agency/comercial/compromisso-do-sdr";

function compromisso(over: Partial<CompromissoAberto> = {}): CompromissoAberto {
  return {
    fio: "sdr:marcos",
    workspaceId: "ws-foocci",
    clienteNome: "Marcos (Foocci)",
    texto: "Vou conferir com o gerente de projeto se cabe no cronograma.",
    dono: "PM",
    prazo: new Date("2026-08-30T18:00:00Z"),
    registradoEm: new Date("2026-08-30T17:00:00Z"),
    ...over,
  };
}

describe("prazoPadraoDoCompromisso — o padrão desta casa para 'ainda hoje'", () => {
  it("vira o fim do dia civil quando ainda há tempo", () => {
    const agora = new Date("2026-08-30T14:00:00");
    const prazo = prazoPadraoDoCompromisso(agora);
    expect(prazo.getDate()).toBe(agora.getDate());
    expect(prazo.getHours()).toBe(23);
    expect(prazo.getMinutes()).toBe(59);
  });

  it("nunca nasce um compromisso já vencido — depois das 23:59, vira o dia SEGUINTE", () => {
    const agora = new Date("2026-08-30T23:59:30");
    const prazo = prazoPadraoDoCompromisso(agora);
    expect(prazo.getTime()).toBeGreaterThan(agora.getTime());
    expect(prazo.getDate()).toBe(31);
  });

  it("é conservador: dá NO MÍNIMO até o fim do dia, nunca menos", () => {
    const agora = new Date("2026-08-30T09:00:00");
    const prazo = prazoPadraoDoCompromisso(agora);
    // Mais de 14h de folga a partir das 9h — nunca um prazo apertado demais.
    expect(prazo.getTime() - agora.getTime()).toBeGreaterThan(14 * 60 * 60_000);
  });
});

describe("compromissosVencidos — a metade que grita", () => {
  it("separa o que venceu do que ainda está no prazo", () => {
    const agora = new Date("2026-08-30T20:00:00Z");
    const vencido = compromisso({ fio: "sdr:a", prazo: new Date("2026-08-30T18:00:00Z") });
    const noPrazo = compromisso({ fio: "sdr:b", prazo: new Date("2026-08-30T23:00:00Z") });

    const r = compromissosVencidos([vencido, noPrazo], agora);
    expect(r).toHaveLength(1);
    expect(r[0].fio).toBe("sdr:a");
  });

  it("lista vazia não vence nada", () => {
    expect(compromissosVencidos([], new Date())).toEqual([]);
  });
});

describe("fraseDoCompromissoVencido — nome do cliente, o que foi prometido, há quanto tempo", () => {
  it("carrega os três, com o cliente identificado", () => {
    const agora = new Date("2026-08-30T20:15:00Z"); // 2h15 depois do prazo (18:00Z)
    const frase = fraseDoCompromissoVencido(compromisso(), agora);
    expect(frase).toContain("Marcos (Foocci)");
    expect(frase).toContain("Vou conferir com o gerente de projeto");
    expect(frase).toMatch(/vencido há 2h/);
  });

  it("sem cliente identificado, cai no fio — nunca inventa um nome", () => {
    const agora = new Date("2026-08-30T18:30:00Z");
    const frase = fraseDoCompromissoVencido(compromisso({ clienteNome: null, fio: "sdr:anon" }), agora);
    expect(frase).toContain("conversa sdr:anon");
  });

  it("atraso em minutos quando é recente, em dias quando é antigo", () => {
    const prazo = new Date("2026-08-30T18:00:00Z");
    expect(fraseDoCompromissoVencido(compromisso({ prazo }), new Date("2026-08-30T18:10:00Z"))).toMatch(/vencido há 10 min/);
    expect(fraseDoCompromissoVencido(compromisso({ prazo }), new Date("2026-09-02T18:00:00Z"))).toMatch(/vencido há 3d/);
  });
});
