// promessa-que-a-maquina-nao-cumpre.ts — O SDR NÃO PROMETE O QUE NADA DISPARA.
//
// ═══════════════════════════════════════════════════════════════════════════
// O DEFEITO (medido em produção, 27/08/2026 — cliente 001 da agência)
// ═══════════════════════════════════════════════════════════════════════════
//
// 01:31  SDR: *"Assim que você confirmar o @ do Instagram, **eu finalizo o
//        orçamento e envio para você**."*
// 01:34  O cliente confirma o @ e anexa o Briefing Mestre e o Brand Book.
// 01:34  SDR: *"Já preparei o escopo… **Vou preparar seu orçamento
//        personalizado**… estou à disposição 😊"* — e se despede.
// depois **NADA.** Nenhum orçamento, nenhum e-mail, nenhum evento. A tela do
//        cliente ficou parada, **sem um único botão**.
//
// Ele entregou tudo o que foi pedido e não tinha próxima ação. A despedida
// educada — *"estou à disposição"* — era a porta de um beco.
//
// ═══════════════════════════════════════════════════════════════════════════
// POR QUE ISTO É CÓDIGO E NÃO UMA LINHA NO PROMPT
// ═══════════════════════════════════════════════════════════════════════════
//
// O prompt do SDR **já** manda apontar o resumo e o botão de confirmar — os
// textos prontos de `prospect-engine.ts` dizem exatamente isso: *"Confira o
// resumo do seu pedido e confirme para eu preparar seu orçamento."* O que saiu
// em produção foi texto LIVRE do modelo, que inventou um compromisso da casa em
// primeira pessoa.
//
// *Prompt é aviso; código é trava.* Um pedido no prompt é obedecido na maioria
// das vezes — e a minoria das vezes é justamente quando um cliente real está
// olhando a tela. Esta é a mesma família de defeito que a casa já matou duas
// vezes ("a equipe refaz e te manda", em `refacao.ts`) e a mesma solução da
// legenda (`direcao-interna.ts`): a frase é barrada NO FUNIL por onde ela passa.
//
// ═══════════════════════════════════════════════════════════════════════════
// A REGRA, E ELA É ESTREITA DE PROPÓSITO
// ═══════════════════════════════════════════════════════════════════════════
//
// O que se barra é **a máquina se comprometendo, em primeira pessoa, com um ato
// futuro que nenhum código dispara**: "eu envio", "eu finalizo e mando", "vou
// preparar e te envio", "em seguida te retorno".
//
// O que **NÃO** se barra, e a diferença é a alma desta régua:
//   • o que a casa REALMENTE faz quando o cliente confirma ("confirme para eu
//     preparar seu orçamento") — isso é instrução, não promessa solta;
//   • a EQUIPE prometendo por si ("nossa equipe entra em contato") quando há
//     fila de gente de verdade atrás — quem promete é gente, e gente cumpre;
//   • o passado ("preparei o escopo"), que é relato do que já aconteceu.
//
// Régua larga demais aqui barraria o SDR de conversar. Uma régua que barra
// conversa legítima é desligada na primeira reclamação — e aí não protege nada.

/** Uma promessa encontrada no texto que ia para o cliente. */
export interface PromessaSolta {
  trecho: string;
  /** Por que ela é promessa e não instrução. Vai para o log e para o teste. */
  porque: string;
}

/**
 * Os padrões. Cada um é a MÁQUINA falando de si, no futuro, sobre um ato que
 * ela não dispara.
 *
 * A primeira pessoa (`eu`, `vou`) é o que separa promessa de instrução: *"eu
 * finalizo e envio"* é a casa se comprometendo; *"confirme para eu preparar"* é
 * a casa dizendo o que o cliente precisa fazer.
 */
const PADROES: ReadonlyArray<{ re: RegExp; porque: string }> = [
  {
    // "eu finalizo o orçamento e envio", "vou preparar e te envio",
    // "eu monto a proposta e mando"
    re: /\b(eu\s+)?(vou\s+)?(finaliz|prepar|mont|elabor|gerar?|fa[çz])\w*\s+(o\s+|a\s+|seu\s+|sua\s+)?(or[çc]amento|proposta|escopo)[^.!?\n]{0,80}?\b(e\s+)?(envio|mando|te\s+envio|te\s+mando|encaminho|retorno)\b/gi,
    porque: "a máquina promete finalizar E enviar — nada nesta casa dispara esse envio sozinho",
  },
  {
    // "já te envio", "te envio em seguida", "envio para você em breve"
    re: /\b(j[áa]\s+)?(te\s+)?(envio|mando|encaminho|retorno)\s+(o\s+|a\s+|seu\s+|sua\s+)?(or[çc]amento|proposta)[^.!?\n]{0,40}/gi,
    porque: "a máquina promete um envio futuro do orçamento — não há gatilho para ele",
  },
  {
    // "vou preparar seu orçamento personalizado" (sem pedir confirmação)
    re: /\bvou\s+(preparar|montar|elaborar|fazer)\s+(o\s+|seu\s+|sua\s+)?(or[çc]amento|proposta)\b(?![^.!?\n]{0,60}\bconfirm)/gi,
    porque: "a máquina anuncia que VAI preparar sozinha, sem apontar o que o cliente precisa fazer",
  },
  {
    // "em breve", "logo mais", "em instantes" — prazo que ninguém controla
    re: /\b(em\s+breve|logo\s+mais|em\s+instantes|dentro\s+de\s+(pouco|instantes)|j[áa]\s+j[áa])\b/gi,
    porque: "prazo prometido por máquina é dívida que a agência paga",
  },
];

/** A despedida que fecha a conversa sem deixar próxima ação. */
// ═══ A PROMESSA POR TERCEIRO (29/08/2026) ═══════════════════════════════════
//
// ── O DEFEITO, MEDIDO COM O CLIENTE 001 NA TELA ────────────────────────────
// A conversa do primeiro cliente real terminou assim:
//
//   *"Já deixei essa observação registrada no seu escopo para a equipe analisar
//    a viabilidade e entrar em contato para alinhar os detalhes."*
//
// E parou. Sem prazo, sem canal, sem dizer se ele espera ali ou pode fechar a
// janela. O CEO chamou de descaso, e tinha razão.
//
// ⚠️ ESTA RÉGUA JÁ EXISTIA E NÃO PEGOU — e é esse o achado, não a frase. Os
// padrões acima cobrem a promessa em PRIMEIRA pessoa ("eu preparo e te envio").
// A frase acima terceiriza: **"a equipe" analisa, "a equipe" entra em contato**.
// Mesma dívida com o cliente, sujeito diferente — e a régua media só um sujeito.
//
// *Régua verde sobre o padrão errado é pior que régua nenhuma.*
//
// ── POR QUE É PROMESSA SOLTA, e não informação ─────────────────────────────
// "A equipe entra em contato" só é verdade se ALGUÉM for avisado. Se nada
// dispara aviso nenhum, a frase é uma dívida que a casa não tem como pagar — e
// o cliente fica esperando um retorno que não foi agendado por ninguém.
// *Toda promessa precisa da instrução gêmea, e toda instrução precisa de porta
// alcançável.*
const PROMESSA_POR_TERCEIRO: ReadonlyArray<{ re: RegExp; porque: string }> = [
  {
    // "a equipe / o time / alguém / nosso pessoal" + "entra em contato / retorna
    // / responde / avisa" — em qualquer ordem razoável, sem prazo declarado.
    // ⚠️ O lookahead NEGATIVO separa promessa de INFORMAÇÃO: dispensa quando há
    // CANAL **ou** PRAZO. A frase do cliente 001 não tinha nenhum dos dois.
    //
    // ── POR QUE CANAL SOZINHO AINDA DISPENSA, e isto é deliberado ──────────
    // O #356 já decidiu que "Nossa equipe entra em contato por este e-mail"
    // PASSA — o teste dele diz, com todas as letras: *"quem promete é gente, e
    // gente cumpre"*. Essa decisão é anterior a este conserto e **não é minha
    // para reverter no meio de um P0**.
    //
    // 🚩 E há uma tensão real aqui, levada ao Diretor Geral em 29/08: o CEO
    // reclamou justamente da falta de PRAZO. Canal sem prazo ainda deixa o
    // cliente sem saber **se espera ali**. Exigir os dois barraria a frase que
    // o #356 aprovou — por isso a régua atual pede um OU outro, e a pergunta
    // "canal basta?" está aberta para quem decide doutrina, não para mim.
    re: /\b(a|o)?\s*(equipe|time|pessoal|atendimento|consultor\w*|algu[ée]m)\b[^.!?\n]{0,60}?\b(entra\s+em\s+contato|entrar[áa]?\s+em\s+contato|retorna|retornar[áa]?|responde|responder[áa]?|te\s+avisa|avisar[áa]?|te\s+procura)\b(?![^.!?\n]{0,90}\b(por\s+(este\s+|esse\s+)?e-?mail|por\s+whats\w*|por\s+aqui|neste\s+chat|em\s+at[ée]|at[ée]\s+\d|prazo|hoje|amanh[ãa]|\d+\s*(h\b|horas|dias?|dia\s+[úu]til))\b)/gi,
    porque:
      "promete que ALGUÉM entra em contato. Se nada avisa essa pessoa, é dívida que a casa não paga — " +
      "e o cliente fica esperando um retorno que ninguém agendou.",
  },
  {
    // "vou levar para a equipe / vou passar para o time" sem dizer o que
    // acontece depois.
    re: /\b(vou\s+)?(levar|passar|encaminhar|repassar)\s+(isso\s+|essa\s+\w+\s+|o\s+\w+\s+)?(para|pra|ao|à)\s+(a\s+|o\s+)?(equipe|time|pessoal|dire[çc][ãa]o|CEO)\b(?![^.!?\n]{0,90}\b(em\s+at[ée]|prazo|hoje|amanh[ãa]|\d+\s*(h\b|horas|dias?))\b)/gi,
    porque:
      "encaminha para alguém e não diz o que acontece depois nem quando — o cliente sai sem saber se espera ali.",
  },
];

const DESPEDIDAS = /\b(estou|fico|estamos|ficamos)\s+(à|a)\s+disposi[çc][ãa]o\b|\bqualquer\s+d[úu]vida,?\s+(é\s+)?s[óo]\s+chamar\b|\bat[ée]\s+(logo|breve)\b/gi;

/** Acha as promessas soltas no texto. Lista vazia = pode falar. */
export function promessasSoltas(texto: string | null | undefined): PromessaSolta[] {
  const t = (texto ?? "").trim();
  if (!t) return [];
  const achadas: PromessaSolta[] = [];
  for (const { re, porque } of [...PADROES, ...PROMESSA_POR_TERCEIRO]) {
    for (const m of t.matchAll(re)) {
      achadas.push({ trecho: m[0].trim(), porque });
    }
  }
  return achadas;
}

export function temPromessaSolta(texto: string | null | undefined): boolean {
  return promessasSoltas(texto).length > 0;
}

/**
 * A despedida só é DEFEITO quando fecha a conversa sem próxima ação.
 *
 * *"Estou à disposição"* depois de apontar o botão é educação. A mesma frase
 * quando não há botão nenhum é a porta de um beco — foi o que o cliente 001 leu.
 */
export function despedidaSemPorta(texto: string | null | undefined, temProximaAcao: boolean): boolean {
  if (temProximaAcao) return false;
  return DESPEDIDAS.test((texto ?? "").trim());
}

/**
 * A INSTRUÇÃO GÊMEA. *Toda proibição precisa dela* — proibição sem alternativa
 * empurra o modelo para o contorno, e o contorno é outra frase igualmente vazia.
 *
 * O que o SDR deve dizer no lugar: o que a casa REALMENTE faz, e o que o cliente
 * precisa apertar para que aconteça.
 */
export const O_QUE_DIZER_NO_LUGAR =
  "Não prometa que você envia o orçamento: nada dispara esse envio sozinho. " +
  "Diga o que é verdade e o que depende dele — 'Seu escopo está pronto. " +
  "Confira o resumo e confirme para a casa calcular o seu orçamento' — e aponte " +
  "o botão. Se não houver botão, não se despeça: escale para a equipe dizendo isso. " +
  // ── A METADE QUE FALTAVA (29/08/2026) ────────────────────────────────────
  // O cliente 001 saiu sem saber se esperava ali. Proibir "a equipe entra em
  // contato" sem dizer o que falar no lugar empurraria o modelo para outra
  // frase igualmente vazia.
  "E NUNCA prometa que 'a equipe entra em contato': se você precisa levar algo " +
  "a uma pessoa, diga as três coisas que ele precisa para não ficar no escuro — " +
  "POR ONDE vem a resposta, EM QUANTO TEMPO, e se ele pode fechar a janela. " +
  "Prazo só se a casa cumprir; se você não sabe o prazo, diga que não sabe e " +
  "diga por onde ele será avisado.";

/**
 * Substitui a promessa pela verdade, preservando o resto da fala.
 *
 * ⚠️ LIMPAR É O ÚLTIMO RECURSO, e só vale aqui porque o texto ainda NÃO foi ao
 * cliente. Na legenda a casa se recusa a reescrever na saída (seria a agência
 * mudando o que o cliente aprovou); aqui a fala é da própria casa e ainda está
 * na mão dela — deixar sair uma promessa falsa é pior que ajustar a frase.
 */
export function limparPromessaSolta(texto: string | null | undefined): string {
  let t = (texto ?? "");
  for (const { re } of PADROES) t = t.replace(re, "");
  return t.replace(/[ \t]{2,}/g, " ").replace(/\s+([.,!?])/g, "$1").replace(/\n{3,}/g, "\n\n").trim();
}

/** O motivo, em uma linha, para o log e para a tela de quem opera. */
export function motivoDaPromessa(achadas: PromessaSolta[]): string {
  if (achadas.length === 0) return "";
  const lista = achadas.map((p) => `"${p.trecho}" (${p.porque})`).join("; ");
  return `o SDR prometeu o que a máquina não cumpre: ${lista}. ${O_QUE_DIZER_NO_LUGAR}`;
}
