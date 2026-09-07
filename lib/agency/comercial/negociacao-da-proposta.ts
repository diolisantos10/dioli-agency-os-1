// negociacao-da-proposta.ts — O SDR NA PÁGINA DO ORÇAMENTO.
//
// ═══════════════════════════════════════════════════════════════════════════
// A ORDEM (CEO, 27/08/2026)
// ═══════════════════════════════════════════════════════════════════════════
//
//   *"A página onde vai estar o orçamento tem que ter o agente de SDR pronto
//   para negociar valores e não deixar o cliente desistir."*
//
// Até aqui `app/proposta/[token]/page.tsx` tinha DOIS botões: aceitar e "agora
// não". **Cliente que só tem esses dois botões e acha caro não negocia —
// some**, e a casa nem fica sabendo que houve objeção. É exatamente o cliente
// que esta ordem existe para segurar.
//
// ═══════════════════════════════════════════════════════════════════════════
// NÃO É UM SEGUNDO SDR — É O MESMO, COM OUTRO ASSUNTO
// ═══════════════════════════════════════════════════════════════════════════
//
// A conversa continua passando por `POST /api/sdr/chat`, o mesmo funil, com os
// mesmos guardas (vazamento de preço, promessa que a máquina não cumpre, tetos
// de ritmo). *Verdade escrita em dois lugares já está errada em um deles* — e
// um segundo SDR seria a segunda cópia da voz da casa.
//
// O que muda é o CONTEXTO. Na sala de briefing ele está LEVANTANDO: não sabe
// quem é, não sabe o volume, não pode falar preço. Aqui ele já sabe **quem é o
// cliente, o que foi orçado e por quanto** — e o assunto é a DECISÃO.
//
// ═══════════════════════════════════════════════════════════════════════════
// O QUE ELE TEM NA MANGA — e não é desconto
// ═══════════════════════════════════════════════════════════════════════════
//
// O piso hoje É o preço de tabela: `descontoAutorizadoPct` é `null` em todos os
// serviços porque cinco das seis parcelas de custo são NÃO MEDIDAS, e não se
// prova que uma margem desconhecida não é negativa. **Desconto autorizado: zero.**
//
// Então a manga dele é outra, e é melhor: **trocar de degrau**. O cliente que
// acha R$ 790 caro não recebe R$ 600 pelo mesmo escopo — recebe o Presença a
// R$ 490, que existe, tem preço e entrega menos. *Mudar de degrau é venda;
// baixar o preço do degrau é sangria.*
//
// ⛔ E A TRAVA NÃO É O PROMPT. `pisoRespeitado()` roda sobre a fala PRONTA,
// depois do modelo — porque prompt é aviso e código é trava. Um modelo que
// resolva ser generoso encontra a recusa na saída, não uma recomendação.

import {
  TABELA_DE_PRECOS, TETO_DE_PECAS_POR_MES,
  podeOfertar, pisoDoServico, comoSeguirSemBaixarOPreco, servicoPorChave,
  formaDeCobranca, comoSeApresenta,
  type ServicoDaCasa,
} from "@/lib/agency/financeiro/tabela-de-precos";
import { emReais, medido } from "@/lib/agency/financeiro/dinheiro";
import { dataPorExtenso, type IsencaoVisivel } from "@/lib/agency/comercial/aviso-de-isencao";

/** Só para leitura humana no prompt e nas mensagens. */
function reais(centavos: number): string {
  return emReais(medido(centavos, "contrato"));
}

/**
 * Qual serviço da tabela esta proposta ofertou?
 *
 * Casa pelo VALOR mensal já escrito na proposta. `null` quando o orçamento não
 * é um plano de tabela (projeto orçado à parte) — e `null` aqui **não libera
 * nada**: sem serviço conhecido não há piso conhecido, e sem piso não há
 * autorização de preço nenhuma. Mesma regra fail-closed de `podeFechar`.
 */
export function servicoDaProposta(totalMin?: number, totalMax?: number): ServicoDaCasa | null {
  const alvo = Number(totalMin ?? totalMax);
  if (!Number.isFinite(alvo) || alvo <= 0) return null;
  const centavos = Math.round(alvo * 100);
  return TABELA_DE_PRECOS.find((s) => s.precoFinalCentavos === centavos) ?? null;
}

/** Os degraus abaixo do ofertado, do mais caro para o mais barato. É o que ele
 *  oferece quando o cliente diz "está caro".
 *
 * ⛔ Fail-closed: item com forma de cobrança indeterminada (`formaDeCobranca`
 * devolve `null`) NUNCA aparece aqui — ausência de informação não é
 * informação, e é melhor oferecer menos opções que uma frase falsa. */
export function degrausAbaixo(s: ServicoDaCasa): ServicoDaCasa[] {
  return TABELA_DE_PRECOS
    .filter((o) => o.pecasPorMes > 0 && o.precoFinalCentavos < s.precoFinalCentavos && formaDeCobranca(o) !== null)
    .sort((a, b) => b.precoFinalCentavos - a.precoFinalCentavos);
}

/**
 * O bloco de contexto que entra no prompt do SDR nesta página.
 *
 * ⚠️ O PISO NÃO ENTRA AQUI. Ele é número INTERNO, e este texto vai para um
 * prompt que o interlocutor pode tentar extrair — a mesma regra que
 * `negociacao.ts` já aplica em `blocoDeNegociacaoParaPrompt`. O que o modelo
 * recebe é o que ele PODE oferecer (os degraus, que são públicos); quem barra o
 * que ele não pode é `pisoRespeitado`, no servidor, depois da fala.
 */
export function contextoDaNegociacao(entrada: {
  negocio: string;
  servico: ServicoDaCasa | null;
  textoDaProposta: string;
  avisoDeAgendamento: string | null;
  /**
   * A ISENÇÃO POR PARCERIA deste cliente, quando ela existe e está VIVA.
   *
   * ── Por que ela muda o assunto (27/08/2026) ───────────────────────────────
   * Este bloco inteiro foi escrito para NEGOCIAR PREÇO: o que pode ofertar, o
   * degrau de baixo, o que fazer quando o cliente diz que está caro. **Nada
   * disso existe para quem não paga.** Um SDR oferecendo "trocar para um plano
   * mais barato" a um parceiro isento está negociando um desconto sobre zero —
   * e, pior, está dizendo a ele que há uma conta a pagar.
   *
   * Sob parceria a conversa é sobre ESCOPO: o que entra, o que não entra.
   *
   * ⚠️ Ausente/`null` = cliente PAGANTE, e o bloco sai exatamente como saía. E
   * quem decide não é o modelo nem o visitante: é `parceriaVivaDoCliente`, no
   * servidor, a partir do `clientId` derivado do token da proposta.
   *
   * ⛔ ISTO NÃO É A TRAVA, e não afrouxa a que existe. `pisoRespeitado` continua
   * rodando sobre a fala PRONTA, com as mesmas regras — inclusive a de recusar
   * qualquer valor quando não há serviço conhecido. *Prompt é aviso; código é
   * trava.*
   */
  isento?: IsencaoVisivel | null;
}): string {
  const linhas: string[] = [];
  linhas.push(
    "VOCÊ ESTÁ NA PÁGINA DO ORÇAMENTO. O cliente já recebeu a proposta e está decidindo AGORA.",
    "Seu trabalho aqui não é levantar informação — é responder dúvida e objeção para ele não desistir em silêncio.",
    "",
    `CLIENTE: ${entrada.negocio || "(negócio não informado)"}`,
    "",
    "A PROPOSTA QUE ELE ESTÁ VENDO:",
    entrada.textoDaProposta.slice(0, 4000),
    "",
  );

  if (entrada.isento) {
    // ⚠️ ANTES do bloco de preço, e no lugar dele: os dois na mesma janela
    // deixariam o modelo escolher, e a escolha errada é uma cobrança.
    const ate = dataPorExtenso(entrada.isento.validaAte);
    linhas.push(
      "⛔ ESTE CLIENTE NÃO PAGA NADA. PARCERIA ISENTA, 100%, JÁ DECIDIDA PELA CASA.",
      "",
      `A casa autorizou esta parceria fora desta conversa (por ${entrada.isento.autorizadaPor})` +
        `${ate ? `, válida até ${ate}` : ""}. Isso NÃO foi deduzido do que ele escreveu.`,
      ...(entrada.isento.escopo.trim() ? [`O que a parceria cobre: ${entrada.isento.escopo.trim()}.`] : []),
      "",
      "O QUE MUDA, e é a conversa inteira:",
      "- NÃO HÁ PREÇO A NEGOCIAR. Não há piso a defender, não há desconto a dar e não há degrau a trocar.",
      "- NÃO ofereça plano mais barato, não fale de mensalidade, não sugira 'o que cabe no orçamento'.",
      "- O valor que aparece na proposta é REFERÊNCIA do que o trabalho vale. Se ele perguntar,",
      "  diga isso com todas as letras: nada será cobrado dele.",
      "- O ASSUNTO É O ESCOPO: o que entra, o que não entra, o que ele quer trocar por outra coisa.",
      "",
      "O QUE NÃO MUDA:",
      "- Você continua PROIBIDO de prometer o que não foi acordado e de inventar prazo ou resultado.",
      "- O que a casa não produz continua não sendo oferecido.",
      "",
    );
  } else if (entrada.servico) {
    const s = entrada.servico;
    linhas.push(
      `O QUE FOI OFERTADO: ${s.nome}, ${comoSeApresenta(s) ?? `${reais(s.precoFinalCentavos)} (forma de cobrança não informada)`}.`,
      "",
      "⛔ VOCÊ NÃO PODE DAR DESCONTO. Nenhum. A casa não autorizou faixa de desconto para este serviço.",
      "Se ele disser que está caro, NÃO invente um valor menor pelo mesmo escopo — isso é o que a casa proíbe.",
      "O que você faz é OFERECER O DEGRAU DE BAIXO, que existe e entrega menos:",
    );
    const abaixo = degrausAbaixo(s);
    if (abaixo.length > 0) {
      for (const d of abaixo.slice(0, 3)) {
        linhas.push(`  • ${d.nome} — ${comoSeApresenta(d)}.`);
      }
    } else {
      linhas.push(
        "  • (não há degrau abaixo deste — é o mais barato da casa.)",
        "  Se ele ainda achar caro, NÃO invente alternativa: diga que vai chamar o gerente do projeto e escale.",
      );
    }
  } else {
    linhas.push(
      "⛔ ESTE ORÇAMENTO NÃO É UM PLANO DE TABELA. Você NÃO tem autorização de preço nenhuma aqui.",
      "Não confirme, não ajuste e não sugira valor. Se ele falar de preço, diga que quem responde por esse número",
      "é o gerente do projeto e que você já está passando o pedido — e passe.",
    );
  }

  linhas.push(
    "",
    "O QUE A CASA NÃO PRODUZ, e você NUNCA oferece:",
    "  • vídeo, reel e qualquer peça em vídeo — não temos quem produza. Diga 'não fazemos', nunca 'a definir'.",
    `  • volume acima de ${TETO_DE_PECAS_POR_MES} peças/mês — é a capacidade inteira da casa.`,
    "",
    "COMO VOCÊ FALA:",
    "  • Sem pressão falsa. Nada de 'última vaga', 'só hoje', escassez inventada ou prazo que não existe.",
    "  • Não prometa que VOCÊ envia, finaliza ou retorna algo — nada dispara isso sozinho.",
    "    Aponte o que ele pode fazer AGORA nesta tela: aceitar, ou dizer o que precisa mudar.",
    "  • Objeção que você não resolve não vira silêncio: diga que vai chamar o gerente do projeto.",
    "  • Nunca invente prazo de entrega, resultado garantido ou número que não está na proposta.",
  );

  if (entrada.avisoDeAgendamento) {
    linhas.push(
      "",
      "AVISO QUE ELE PRECISA SABER ANTES DE ACEITAR (repita se ele perguntar de Instagram/publicação):",
      entrada.avisoDeAgendamento,
    );
  }

  return linhas.join("\n");
}

// ═══════════════════════════════════════════════════════════════════════════
// A TRAVA: O PISO, SOBRE A FALA PRONTA
// ═══════════════════════════════════════════════════════════════════════════

/** Todo valor em reais que aparece na fala, em centavos. */
export function valoresNaFala(texto: string): number[] {
  const achados: number[] = [];
  // "R$ 1.234,56" · "R$ 490" · "R$490,00" — o espaço pode ser o inquebrável.
  for (const m of (texto ?? "").matchAll(/R\$\s*([\d.]+(?:,\d{2})?)/gi)) {
    const cru = m[1]!;
    const normalizado = cru.replace(/\./g, "").replace(",", ".");
    const n = Number(normalizado);
    if (Number.isFinite(n) && n > 0) achados.push(Math.round(n * 100));
  }
  return achados;
}

export type VereditoDaFala =
  | { ok: true }
  | { ok: false; menorOfertado: number; piso: number; motivo: string; correcao: string };

/**
 * A fala respeita o piso?
 *
 * ⛔ FAIL-CLOSED EM DOIS PONTOS, e os dois já custaram caro nesta casa:
 *
 *   1. **Sem serviço conhecido, qualquer valor é recusado.** Ausência de piso
 *      não é piso zero: é ausência de autorização (a mesma regra de
 *      `podeFechar`, que devolve `Infinity` para item fora da tabela).
 *   2. **Vale o MENOR valor da fala.** Uma frase que cita o preço cheio e
 *      depois "mas consigo fazer por R$ 600" passaria se olhássemos só o
 *      primeiro número — e é exatamente essa a frase perigosa.
 *
 * Valor ACIMA do piso passa: o cliente pode estar falando do preço cheio, de um
 * plano maior, ou do faturamento dele. Barrar para cima seria censurar conversa.
 */
export function pisoRespeitado(texto: string, servico: ServicoDaCasa | null): VereditoDaFala {
  const valores = valoresNaFala(texto);
  if (valores.length === 0) return { ok: true };

  const menor = Math.min(...valores);

  if (!servico) {
    return {
      ok: false,
      menorOfertado: menor,
      piso: Number.POSITIVE_INFINITY,
      motivo:
        "a fala cita valor e este orçamento não é um plano de tabela — sem piso conhecido não há autorização de preço",
      correcao:
        "Sobre o valor, quem responde por esse número é o gerente do projeto — já estou passando o seu pedido para ele, " +
        "com o que você me disse. Aqui na tela você pode aceitar a proposta ou me contar o que precisa mudar.",
    };
  }

  const veredito = podeOfertar(servico.chave, menor);
  if (veredito.pode) return { ok: true };

  return {
    ok: false,
    menorOfertado: menor,
    piso: pisoDoServico(servico),
    motivo: veredito.motivo,
    correcao: correcaoDoPiso(servico),
  };
}

/**
 * O que a casa diz no lugar da fala barrada.
 *
 * ⚠️ NUNCA é um "não" seco. *Botão que cai na mesma parada é pior que botão
 * nenhum*: a recusa vem com o caminho que EXISTE — o degrau de baixo, com nome
 * e preço, ou gente com rosto quando não há degrau.
 */
export function correcaoDoPiso(servico: ServicoDaCasa): string {
  const abaixo = degrausAbaixo(servico);
  if (abaixo.length > 0) {
    const d = abaixo[0]!;
    const apresentacao = comoSeApresenta(d) ?? reais(d.precoFinalCentavos);
    // "Trocar de plano" só é verdade quando o degrau de baixo É um plano
    // mensal. Avulso e balcão não são plano — dizer que são é a mesma
    // mentira que este conserto existe para matar.
    const comoTrocar = formaDeCobranca(d) === "uma_vez"
      ? `O que dá para fazer é trocar para o ${d.nome}: sai por ${apresentacao}`
      : `O que dá para fazer é trocar de plano: o ${d.nome} sai por ${apresentacao}`;
    return (
      `Nesse valor eu não consigo fechar, e prefiro te dizer isso agora a combinar uma coisa que não se sustenta. ` +
      `${comoTrocar} — é menos volume, pelo preço que cabe. Quer que eu troque para esse?`
    );
  }
  return (
    "Nesse valor eu não consigo fechar, e este já é o degrau mais barato da casa — não tenho para onde descer. " +
    "Vou chamar o gerente do projeto com o que você me disse, e ele te responde por aqui mesmo."
  );
}

/**
 * A fala que vai ao cliente: a original, ou a correção quando ela furou o piso.
 *
 * Substituir a fala inteira (em vez de remendar a frase) é deliberado: uma
 * negociação com o número errado apagado no meio vira um texto incoerente, e
 * texto incoerente na hora de decidir preço é pior que uma resposta clara.
 */
export function falaQueRespeitaOPiso(texto: string, servico: ServicoDaCasa | null): {
  fala: string;
  corrigida: boolean;
  motivo?: string;
} {
  const v = pisoRespeitado(texto, servico);
  if (v.ok) return { fala: texto, corrigida: false };
  return { fala: v.correcao, corrigida: true, motivo: v.motivo };
}

/** O caminho honesto quando não há o que oferecer — para o log e para a tela. */
export { comoSeguirSemBaixarOPreco, servicoPorChave };
