// A PROMESSA DE CONTATO HUMANO — a casa passou a dever alguma coisa.
//
// ═══════════════════════════════════════════════════════════════════════════
// O QUE ESTE MÓDULO NÃO É
// ═══════════════════════════════════════════════════════════════════════════
//
// Ele NÃO BARRA NADA. Ele não impede o SDR de falar, não limpa a fala, não
// devolve erro. `lib/agency/comercial/promessa-que-a-maquina-nao-cumpre.ts` já
// existe e responde a outra pergunta — *"a máquina pode falar isso?"* — e barra
// (limpa) o texto quando a MÁQUINA promete um ato que nada dispara ("eu
// finalizo e envio"). Aquele módulo continua intocado; esta rodada não mexe
// nele.
//
// A pergunta AQUI é diferente: *"esta fala prometeu que um HUMANO da equipe vai
// entrar em contato?"* — e essa promessa é LEGÍTIMA (é exatamente o que
// `promessa-que-a-maquina-nao-cumpre.ts` recomenda dizer no lugar da promessa
// da máquina: "a EQUIPE prometendo por si… quem promete é gente, e gente
// cumpre"). Legítima não é grátis: a partir do instante em que ela sai, a casa
// tem uma dívida com data de origem. Este módulo só REGISTRA essa data —
// quem cobra é a fila de `conversa-sem-pedido.ts`, lida por gente.
//
// ═══════════════════════════════════════════════════════════════════════════
// DÍVIDA DECLARADA — NÃO CONSERTAR AGORA
// ═══════════════════════════════════════════════════════════════════════════
//
// Existe, em branch ainda NÃO mesclado
// (`origin/claude/p0-o-convite-nao-foi-reconhecido`), um conjunto de padrões
// `PROMESSA_POR_TERCEIRO` que reconhece uma família de falas parecida com a
// desta régua ("a equipe entra em contato" etc.), usado para outro fim.
//
// **Quando aquele PR mesclar, os dois devem passar a compartilhar UMA fonte de
// padrão** — duas listas de regex para a mesma família de fala é a mesma
// doença que esta casa já pagou (verdade escrita em dois lugares diverge na
// primeira mudança). Não é consertado AGORA porque aquele arquivo está
// reivindicado por outra frente nesta mesma janela de trabalho; mexer nele
// aqui seria pisar em reivindicação alheia. Fica escrito para quem for
// integrar as duas depois de o merge acontecer.
//
// ═══════════════════════════════════════════════════════════════════════════
// A REGRA, E POR QUE ELA É ESTREITA
// ═══════════════════════════════════════════════════════════════════════════
//
// Só conta como promessa a EQUIPE/ALGUÉM (terceiro) entrando em contato ou
// retornando — nunca a máquina falando de si ("eu te aviso", que é o domínio
// do outro módulo) e nunca uma instrução neutra ("confirme para eu preparar o
// orçamento"). Régua larga demais aqui inflaria a fila de "está devendo
// contato" com conversa que não prometeu nada, e uma fila que grita à toa
// aprende-se a ignorar — o mesmo defeito do alarme cego do `cron-execute`.

/** Uma promessa de contato humano encontrada no texto do SDR. */
export interface PromessaDeContato {
  trecho: string;
  porque: string;
}

/**
 * Os padrões. Cada um é a EQUIPE (terceiro), nunca a máquina em primeira
 * pessoa, prometendo entrar em contato, retornar, procurar ou analisar para
 * depois procurar.
 */
const PADROES: ReadonlyArray<{ re: RegExp; porque: string }> = [
  {
    // "nossa equipe entra em contato com você", "a equipe vai entrar em
    // contato", "o time entrará em contato"
    re: /\b(nossa\s+|a\s+|o\s+)?(equipe|time)\b[^.!?\n]{0,60}?\b(entra(r[aá])?|vai\s+entrar|entrar[aá])\s+em\s+contato\b/gi,
    porque: "a equipe promete entrar em contato — a casa passa a dever esse contato",
  },
  {
    // "a equipe retorna", "o time te retorna", "a equipe responde em breve"
    re: /\b(a\s+|o\s+)?(equipe|time)\s+(te\s+)?(retorna|responde|volta\s+a\s+falar)\b/gi,
    porque: "a equipe promete retornar",
  },
  {
    // "alguém do time te procura", "um especialista da equipe vai te ligar",
    // "um consultor nosso entra em contato"
    re: /\b(algu[ée]m|um\s+especialista|um\s+consultor)\b[^.!?\n]{0,40}?\b(do\s+time|da\s+equipe|nosso|nossa)?\b[^.!?\n]{0,40}?\b(te\s+)?(procura|liga|chama|entra\s+em\s+contato|retorna)\b/gi,
    porque: "alguém da equipe promete procurar o cliente",
  },
  {
    // "vou levar isso para a equipe" / "vou levar isso pra o time"
    re: /\bvou\s+levar\s+isso\s+(para|pra)\s+(a\s+)?(equipe|time)\b/gi,
    porque: "o SDR promete escalar para a equipe, que passa a dever resposta",
  },
  {
    // "já deixei registrado para a equipe analisar e entrar em contato"
    re: /\bj[áa]\s+deixei\s+registrad[oa]\s+para\s+(a\s+)?equipe\b[^.!?\n]{0,80}?\b(analisar|entrar|contato)\b/gi,
    porque: "o SDR registra para a equipe analisar e entrar em contato",
  },
];

/**
 * O TRECHO da promessa, se houver. `null` = a fala não prometeu contato
 * humano. Usado tanto pelo log quanto pelo teste — trecho, não booleano, é o
 * que se confere.
 */
export function trechoDaPromessaDeContato(texto: string | null | undefined): string | null {
  const t = (texto ?? "").trim();
  if (!t) return null;
  for (const { re } of PADROES) {
    re.lastIndex = 0; // regex global reaproveitada entre chamadas: sem isto o `exec` anda o cursor e a segunda chamada perde o achado.
    const m = re.exec(t);
    if (m) return m[0].trim();
  }
  return null;
}

/** `true` quando esta fala prometeu que um HUMANO da equipe entra em contato. */
export function prometeuContatoHumano(texto: string | null | undefined): boolean {
  return trechoDaPromessaDeContato(texto) !== null;
}

/** As promessas de contato encontradas, com o porquê — para log estruturado. */
export function promessasDeContato(texto: string | null | undefined): PromessaDeContato[] {
  const t = (texto ?? "").trim();
  if (!t) return [];
  const achadas: PromessaDeContato[] = [];
  for (const { re, porque } of PADROES) {
    re.lastIndex = 0;
    for (const m of t.matchAll(re)) achadas.push({ trecho: m[0].trim(), porque });
  }
  return achadas;
}
