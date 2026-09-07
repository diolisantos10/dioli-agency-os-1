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
//
// ═══════════════════════════════════════════════════════════════════════════
// P0 AO VIVO — O CLIENTE PARCEIRO (30/08/2026, Marcos, Foocci)
// ═══════════════════════════════════════════════════════════════════════════
//
// Marcos cobrou uma proposta atrasada há mais de 1h. O SDR respondeu:
// *"Vou conferir com o gerente de projeto se cabe no cronograma. (…) precisa
// de aprovação de gestão. Vou trazer essas duas respostas para você ainda
// hoje — pode deixar comigo. 🙂"*
//
// SEIS DE SEIS frases passaram pela régua de então. Não existe gerente sendo
// consultado, não existe pedido de aprovação, não existe tarefa nem prazo nem
// dono — a fala é plausível e não tem mecanismo nenhum atrás dela.
//
// Isto é uma FAMÍLIA NOVA de promessa solta, e ela ganhou o campo `tipo`:
//
//   • `escalacao` — a máquina anuncia que vai CONSULTAR ALGUÉM ("vou conferir
//     com o gerente", "precisa de aprovação de gestão"). Diferente das outras,
//     escalar É uma coisa que a casa consegue fazer de verdade — então quem
//     chama esta função (`app/api/sdr/chat/route.ts`) tenta registrar um
//     COMPROMISSO real (`compromisso-do-sdr.ts`, dono + prazo) no mesmo ato.
//     Se o registro nascer, a fala pode dizer a verdade (a equipe VAI olhar,
//     com prazo de verdade). Se não nascer, a régua barra como sempre —
//     "escalar é ato, não frase".
//   • `generica` — as demais. Sempre barradas: "pode deixar comigo", "vou
//     trazer... ainda hoje", "vou verificar e te aviso" são a mesma dívida de
//     sempre, só com palavras diferentes.

/** Uma promessa encontrada no texto que ia para o cliente. */
export interface PromessaSolta {
  trecho: string;
  /** Por que ela é promessa e não instrução. Vai para o log e para o teste. */
  porque: string;
  /**
   * `escalacao` — promete CONSULTAR ALGUÉM (gerente, equipe, gestão). É a
   * única família que pode virar verdade: quem chama tenta registrar um
   * compromisso real antes de deixar a fala sair. `generica` — todo o resto,
   * sempre barrada.
   */
  tipo: "escalacao" | "generica";
}

/**
 * Os padrões. Cada um é a MÁQUINA falando de si, no futuro, sobre um ato que
 * ela não dispara.
 *
 * A primeira pessoa (`eu`, `vou`) é o que separa promessa de instrução: *"eu
 * finalizo e envio"* é a casa se comprometendo; *"confirme para eu preparar"* é
 * a casa dizendo o que o cliente precisa fazer.
 */
const PADROES: ReadonlyArray<{ re: RegExp; porque: string; tipo: "escalacao" | "generica" }> = [
  {
    // "eu finalizo o orçamento e envio", "vou preparar e te envio",
    // "eu monto a proposta e mando"
    re: /\b(eu\s+)?(vou\s+)?(finaliz|prepar|mont|elabor|gerar?|fa[çz])\w*\s+(o\s+|a\s+|seu\s+|sua\s+)?(or[çc]amento|proposta|escopo)[^.!?\n]{0,80}?\b(e\s+)?(envio|mando|te\s+envio|te\s+mando|encaminho|retorno)\b/gi,
    porque: "a máquina promete finalizar E enviar — nada nesta casa dispara esse envio sozinho",
    tipo: "generica",
  },
  {
    // "já te envio", "te envio em seguida", "envio para você em breve"
    re: /\b(j[áa]\s+)?(te\s+)?(envio|mando|encaminho|retorno)\s+(o\s+|a\s+|seu\s+|sua\s+)?(or[çc]amento|proposta)[^.!?\n]{0,40}/gi,
    porque: "a máquina promete um envio futuro do orçamento — não há gatilho para ele",
    tipo: "generica",
  },
  {
    // "vou preparar seu orçamento personalizado" (sem pedir confirmação)
    re: /\bvou\s+(preparar|montar|elaborar|fazer)\s+(o\s+|seu\s+|sua\s+)?(or[çc]amento|proposta)\b(?![^.!?\n]{0,60}\bconfirm)/gi,
    porque: "a máquina anuncia que VAI preparar sozinha, sem apontar o que o cliente precisa fazer",
    tipo: "generica",
  },
  {
    // "em breve", "logo mais", "em instantes" — prazo que ninguém controla
    re: /\b(em\s+breve|logo\s+mais|em\s+instantes|dentro\s+de\s+(pouco|instantes)|j[áa]\s+j[áa])\b/gi,
    porque: "prazo prometido por máquina é dívida que a agência paga",
    tipo: "generica",
  },
  // ─── A FAMÍLIA NOVA, MEDIDA NA CONVERSA COM O MARCOS (30/08/2026) ─────────
  {
    // "vou conferir/verificar/checar/confirmar com o gerente/equipe/time/PM/gestão"
    re: /\bvou\s+(conferir|verificar|checar|confirmar)\s+com\s+(o\s+|a\s+)?(gerente(\s+de\s+projeto)?|equipe|time|pm|gest[ãa]o)\b[^.!?\n]{0,60}/gi,
    porque: "a máquina anuncia consulta a um gerente/equipe que nenhum código aciona — escalar é ato, não frase",
    tipo: "escalacao",
  },
  {
    // "isso precisa de aprovação de gestão/equipe/gerente" — anúncio sem pedido
    re: /\b(isso\s+)?precisa(r[áa]?)?\s+de\s+aprova[çc][ãa]o\s+(de\s+|da\s+)?(gest[ãa]o|equipe|gerente)\b/gi,
    porque: "a máquina anuncia que precisa de aprovação de gestão sem que nenhum pedido de aprovação exista",
    tipo: "escalacao",
  },
  {
    // "pode deixar comigo" — compromisso vazio, sem objeto nem prazo
    re: /\bpode\s+deixar\s+comigo\b/gi,
    porque: "'pode deixar comigo' é compromisso sem mecanismo — nada dispara o retorno",
    tipo: "generica",
  },
  {
    // "vou trazer …", "vou te trazer …", "trago …", "te trago …" — a família
    // toda, DETECTADA SOZINHA: não depende de achar "para você" nem um prazo
    // logo depois. P0 30/08/2026: exigir os dois no MESMO regex foi o que
    // deixou a frase real do Marcos ("Vou trazer essas duas respostas para
    // você ainda hoje") passar batido — ver o cabeçalho do módulo.
    //
    // ⚠️ Este padrão de propósito NÃO fecha com `\b` logo depois de
    // "voc[êe]": em JS, `\b` só enxerga [A-Za-z0-9_] como "palavra" — "ê" não
    // é `\w`, então a fronteira entre "ê" e o espaço seguinte NUNCA existe (os
    // dois lados são "não-palavra"). Era esse `\bpara\s+voc[êe]\b` do padrão
    // antigo que sumia toda vez que "você" vinha acentuado, e é por isso que
    // as frases B e C da tabela do despacho passavam mesmo tendo "para você"
    // no meio — a régua nunca chegava a olhar para o resto.
    re: /\b(vou\s+te\s+trazer|vou\s+trazer|te\s+trago|trago)\b[^.!?\n]{0,80}/gi,
    porque: "a máquina promete trazer uma resposta/retorno no futuro — nada nesta casa dispara esse retorno sozinho",
    tipo: "generica",
  },
  {
    // "vou verificar (com a equipe) e te aviso/retorno/respondo/falo"
    re: /\bvou\s+(verificar|conferir|checar)\s+(com\s+a\s+equipe\s+)?e\s+te\s+(aviso|retorno|respondo|falo)\b[^.!?\n]{0,40}/gi,
    porque: "a máquina promete um retorno depois de 'verificar', sem que nada dispare esse retorno",
    tipo: "generica",
  },
];

/** A despedida que fecha a conversa sem deixar próxima ação. */
const DESPEDIDAS = /\b(estou|fico|estamos|ficamos)\s+(à|a)\s+disposi[çc][ãa]o\b|\bqualquer\s+d[úu]vida,?\s+(é\s+)?s[óo]\s+chamar\b|\bat[ée]\s+(logo|breve)\b/gi;

/** Acha as promessas soltas no texto. Lista vazia = pode falar. */
export function promessasSoltas(texto: string | null | undefined): PromessaSolta[] {
  const t = (texto ?? "").trim();
  if (!t) return [];
  const achadas: PromessaSolta[] = [];
  for (const { re, porque, tipo } of PADROES) {
    for (const m of t.matchAll(re)) {
      achadas.push({ trecho: m[0].trim(), porque, tipo });
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
  "o botão. Se não houver botão, não se despeça: escale para a equipe dizendo isso.";

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
