// O ESCOPO DITO NA VOZ DA CASA — uma fonte, duas plateias.
//
// ── Por que isto existe ─────────────────────────────────────────────────────
// Medido em 27/08/2026 no escopo do CLIENTE 001 (Foocci), na tela que ELE lê
// (`PublicBriefingRoom`) e no painel interno (`app/agency/requests`):
//
//   • "Posts: 28/mês"           → 28 não existe na tabela (12 · 20 · 36);
//   • "Vídeo: A definir"        → vídeo NÃO TEM PRODUTOR nesta casa;
//   • "Vídeo: Produção pela Dioli" → o mesmo campo, no ramo em que o cliente
//     PEDE vídeo, prometia produção. É pior que "a definir": é um sim;
//   • "Modalidade: Projeto pontual" com 28 peças/MÊS e ciclo de 30 dias —
//     pontual e recorrente cobram diferente, e a tela afirmava os dois.
//
// ── A correção anterior existia e não alcançava ninguém ─────────────────────
// `volumeQueACasaVende` e `aCasaProduz` nasceram em `tabela-de-precos.ts` no
// mesmo dia, com teste e mutação — e **nenhuma tela as chamava**. Régua verde
// sobre o componente errado é pior que régua nenhuma: a régua nenhuma deixa a
// dúvida viva; a verde no lugar errado mata a dúvida e deixa o defeito. Este
// arquivo é o fio que faltava, e é por ele que as duas telas passam a falar.
//
// ⛔ NUNCA devolva "a definir", "sob consulta" ou "a combinar" daqui. Promessa
// com a assinatura em branco é dívida: o cliente conta, a casa não produz, e a
// conversa difícil acontece depois de ele já ter dito sim.
//
// ── E2 (30/08/2026): `volumeQueACasaVende` parou de recusar e de empurrar ──
// `linhaDeVolume` mostrava o pedido encaixado no degrau mais próximo ("36/mês
// (você pediu 28)") e, acima da capacidade, "Não vendemos esse volume". As
// duas saíram: a casa não recusa venda, e não finge que o pedido é outro
// número. Agora a tela mostra o número PEDIDO, o preço dele à carta e, quando
// existe, a oferta de um plano mais barato — nunca um encaixe forçado.

import { volumeQueACasaVende, aCasaProduz } from "@/lib/agency/financeiro/tabela-de-precos";
import type { BriefingScope, SocialScope } from "@/lib/agency/briefing-conversation";

/** Uma linha do quadro de escopo, na voz da casa. */
export type LinhaDeEscopo = {
  label: string;
  value: string;
  /** Apagada: é uma ausência, não um problema ("Não incluído"). */
  dim?: boolean;
  /** Destacada: a casa está dizendo NÃO, ou corrigindo o pedido. É o oposto de
   *  `dim` — precisa ser lida, não passada por cima. */
  alerta?: boolean;
  /** A explicação por extenso, quando a resposta curta não basta sozinha. */
  detalhe?: string;
};

/** Há volume que se repete todo mês neste escopo? */
export function temVolumeRecorrente(social: SocialScope | undefined): boolean {
  if (!social) return false;
  return (social.postsPerWeek ?? 0) > 0
    || (social.storiesPerWeek ?? 0) > 0
    || (social.reelsPerMonth ?? 0) > 0;
}

/**
 * O VOLUME — no número PEDIDO, precificado como pedido. Nunca um encaixe
 * forçado, nunca uma recusa (E2, 30/08/2026: "não existe volume acima ou
 * abaixo" — ver `volumeQueACasaVende`).
 *
 * Acima da capacidade de hoje, a tela continua mostrando preço e prazo — só
 * que o prazo passa de "até 1 mês" para os meses que a produção atual exige,
 * com a nota de que encurtar é decisão do CEO.
 */
export function linhaDeVolume(label: string, pecasPorMes: number): LinhaDeEscopo {
  if (pecasPorMes <= 0) return { label, value: "Não incluído", dim: true };

  const resposta = volumeQueACasaVende(pecasPorMes);

  if (!resposta.cabeNaCapacidadeAtual) {
    return {
      label,
      value: `${pecasPorMes}/mês — prazo de ${resposta.prazoEmMeses} meses na capacidade de hoje`,
      alerta: true,
      detalhe: resposta.frase,
    };
  }
  if (!resposta.ofertaMaisBarata) {
    return { label, value: `${pecasPorMes}/mês` };
  }
  // Existe um plano pronto mais barato para este volume — é OFERTA, não
  // encaixe: o número que o cliente pediu continua sendo o que aparece.
  return {
    label,
    value: `${pecasPorMes}/mês`,
    alerta: true,
    detalhe: resposta.frase,
  };
}

/**
 * O VÍDEO — a casa não produz, e diz isso nos DOIS ramos.
 *
 * O ramo perigoso não era "a definir": era `needsVideoProduction`, que
 * respondia "Produção pela Dioli". Um sim para um serviço sem produtor.
 */
export function linhaDeVideo(social: SocialScope | undefined): LinhaDeEscopo | null {
  if (!social) return null;
  if (social.hasVideomaker === undefined && social.needsVideoProduction === undefined) return null;

  if (social.needsVideoProduction) {
    const veredito = aCasaProduz("Vídeo");
    return {
      label: "Vídeo",
      value: "Não fazemos",
      alerta: true,
      detalhe: veredito.frase.replace(/\*\*/g, ""),
    };
  }
  if (social.hasVideomaker) {
    return { label: "Vídeo", value: "Videomaker próprio (seu)" };
  }
  // Nem pediu produção, nem tem quem produza. A resposta honesta continua sendo
  // a nossa incapacidade, não um "vamos ver".
  return {
    label: "Vídeo",
    value: "Não fazemos",
    alerta: true,
    detalhe: aCasaProduz("Vídeo").frase.replace(/\*\*/g, ""),
  };
}

/**
 * A MODALIDADE — e a incoerência resolvida em voz alta.
 *
 * "Projeto pontual" com peças/MÊS e ciclo de 30 dias são duas afirmações que
 * não podem ser verdade ao mesmo tempo, e elas cobram diferente. A casa decide
 * pelo que o cliente DESCREVEU (volume que se repete = mensalidade), diz que
 * decidiu, e diz por quê. Calar seria escolher também — só que escondido.
 */
export function linhaDeModalidade(scope: BriefingScope): LinhaDeEscopo {
  const recorrente = temVolumeRecorrente(scope.social);

  if (scope.serviceMode === "umbrella") {
    return { label: "Modalidade", value: "Parceria contínua (guarda-chuva)" };
  }
  if (scope.serviceMode === "one_off" && recorrente) {
    return {
      label: "Modalidade",
      value: "Gestão mensal",
      alerta: true,
      detalhe:
        "Você marcou projeto pontual, mas descreveu peças por MÊS, que se repetem. " +
        "Pontual e recorrente cobram diferente, e volume que volta todo mês é mensalidade. " +
        "Seguimos como gestão mensal — se a intenção era uma entrega única, é só dizer que refazemos.",
    };
  }
  if (scope.serviceMode === "one_off") {
    return { label: "Modalidade", value: "Projeto pontual" };
  }
  if (scope.serviceMode === "monthly") {
    return { label: "Modalidade", value: "Gestão mensal" };
  }
  // Sem modalidade declarada: o volume responde. Nunca "a definir".
  return recorrente
    ? {
        label: "Modalidade",
        value: "Gestão mensal",
        detalhe: "Deduzida do volume que você descreveu — peças que se repetem todo mês.",
      }
    : { label: "Modalidade", value: "Projeto pontual" };
}
