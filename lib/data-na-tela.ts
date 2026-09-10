// data-na-tela.ts — formatação de data com fuso EXPLÍCITO, em UM lugar só.
//
// ── Por que este arquivo existe ─────────────────────────────────────────────
// `/agency/integrations` quebrava hidratação (defeito de 2026-08-29):
// `new Date(at).toLocaleDateString("pt-BR")` sem `timeZone` usa o fuso do
// AMBIENTE que roda o código. O servidor roda em UTC; o navegador do CEO roda
// em `America/Sao_Paulo`. O MESMO instante ISO vira dois dias diferentes perto
// da virada — 02:00 UTC de um dia é 23:00 de São Paulo no dia anterior — e o
// HTML do servidor diverge do HTML que o cliente produz na hidratação.
//
// A casa já tinha o precedente (`lib/raio-x/por-cliente.ts`,
// `lib/agency/vigia-da-madrugada.ts`): fuso da casa é sempre
// `America/Sao_Paulo`, declarado, nunca implícito.
//
// Entrada inválida ou ausente devolve `null` — nunca "Invalid Date" na tela.

const FUSO_DA_CASA = "America/Sao_Paulo";

/** `dd/mm/aaaa` no fuso de São Paulo, com fuso EXPLÍCITO — o mesmo texto sai
 *  do servidor (UTC) e do navegador (qualquer fuso), sempre. */
export function formatarDataCurta(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO_DA_CASA,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(data);
}
