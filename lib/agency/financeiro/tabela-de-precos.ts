// tabela-de-precos.ts — A TABELA DE PREÇOS DA CASA. Uma fonte, e é esta.
//
// ─── A ORDEM QUE CRIOU ISTO (CEO, 27/08/2026) ───────────────────────────────
//
//   *"A gente precisa criar uma tabela de preço com todos os serviços que a
//   gente faz. Com preço de custo, preço final, margem de desconto — até onde eu
//   posso dar de desconto, pro SDR negociador ter na manga. Isso tem que estar
//   claríssimo pro negociador."*
//
// E, junto, o freio: *"o SDR não pode oferecer abaixo do piso"*.
//
// ─── A RESPOSTA HONESTA, E ELA NÃO É A QUE SE ESPERAVA ──────────────────────
//
// O CEO disse: *"Espero que o financeiro já tenha os gastos e custo da agência
// prontinho, porque está aí."* **Foi medido, e não tem.** O que existe hoje:
//
//   ✅ **Custo de IA** — existe registro por chamada (`AIRunLog`), lido pelo DRE.
//      Medido em produção em 27/08/2026, janela de 30 dias: **US$ 13,74 em 1.747
//      chamadas**. ⚠️ E com um buraco DENTRO do número: **485 dessas chamadas
//      não têm preço gravado** (`chamadasSemPreco`) e 543 não têm token. Ou
//      seja: 28% das chamadas do mês entram na conta como zero. O custo de IA é
//      medido **por baixo**, e é o único custo que esta casa mede.
//
//   ❌ **Taxa do gateway (Mercado Pago)** — NÃO MEDIDA. Varredura no código:
//      `app/api/self-serve/webhook/route.ts` e `order/route.ts` falam com o
//      gateway e **não há constante de taxa em lugar nenhum** do repositório.
//   ❌ **Infraestrutura** (Railway, banco, volume) — NÃO MEDIDA, e não há
//      rateio por cliente em parte alguma.
//   ❌ **Domínio e e-mail** (Resend) — NÃO MEDIDO.
//   ❌ **Hora humana** — NÃO MEDIDA. Já estava declarado em `docs/precos.md`:
//      *"é o custo real desses dois degraus e não há medição dela nesta casa"*.
//   ❌ **Impostos** — NÃO MEDIDOS.
//
// ─── POR QUE ISSO DECIDE O PISO, EM VEZ DE SÓ ENFEITAR O RODAPÉ ─────────────
//
// A ordem trazia duas regras que, juntas, respondem sozinhas:
//
//   • *"Piso com margem negativa é proibido."*
//   • *"Sem faixa configurada, desconto nenhum."*
//
// Margem no piso = preço no piso − custo. Com o custo `nao_medido`, a margem no
// piso é `nao_medido` — e **não se pode provar que uma margem desconhecida não é
// negativa**. Logo, enquanto o custo tiver buraco, o piso de desconto É O PREÇO
// DE TABELA: desconto zero, por construção.
//
// Isto não é timidez: é a doutrina da casa aplicada onde ela dói. *Margem
// calculada sobre custo incompleto é pior que margem nenhuma — ela dá confiança
// falsa para o negociador descer o preço.* Régua verde sobre o componente errado
// é pior que régua nenhuma.
//
// O dia em que o CEO autorizar uma faixa (`descontoAutorizado`), ela passa a
// valer — declarada, limitada e registrada. Até lá o SDR **não consegue**
// descer um centavo, e isso é código, não recomendação.
//
// ⚠️ O QUE ESTA TABELA **NÃO** FAZ: reabrir os três planos. Ritmo R$ 290/12,
// Presença R$ 490/20 e Conteúdo R$ 790/36 estão fechados por decisão do CEO
// (D-0B6). Ela CERCA os planos — piso, margem e avulsos —, não os remarca.

import { emReais, medido, somar, type Dinheiro } from "@/lib/agency/financeiro/dinheiro";
import { PLANOS } from "@/lib/agency/planos";

/** Teto de produção da casa, em peças/mês. Vender acima disto é dívida com
 *  outro rosto — `docs/precos.md`: *"nenhum plano passa disso"*. */
export const TETO_DE_PECAS_POR_MES = 36;

/**
 * O QUE A CASA PRODUZ DE VERDADE.
 *
 * ⛔ Serviço sem produtor não entra nesta tabela. *Vitrine é promessa; promessa
 * sem produtor é dívida.* Vídeo e reel seguem FORA por isso — não há quem
 * produza, e um preço de tabela os transformaria em venda.
 */
export type Produtor =
  /** A esteira de IA, sem revisão humana. */
  | "maquina"
  /** A esteira de IA com direção de arte humana em cima. */
  | "maquina_com_direcao"
  /** Pessoa da casa. Hoje só do Presença para cima. */
  | "humano";

/**
 * A natureza da cobrança — DADO EXPLÍCITO, não heurística sobre `chave`/`nome`.
 *
 * Até 29/08/2026 esta distinção só existia no PREFIXO da `chave` (`plano_` ·
 * `balcao_` · `avulso_`) e na cabeça de quem escreveu o texto que descreve o
 * serviço — e por isso a casa dizia "R$ 190,00/mês" para um item de compra
 * única. Ver `docs/diagnosticos/o-avulso-que-virou-mensalidade-29-08.md`.
 */
export type FormaDeCobranca = "recorrente_mensal" | "uma_vez";

export interface ServicoDaCasa {
  chave: string;
  nome: string;
  /** Preço de tabela, em centavos de real. */
  precoFinalCentavos: number;
  /**
   * Quantas peças o serviço entrega por mês (0 quando não se aplica).
   *
   * ⚠️ Sob `cobranca: "uma_vez"` este número é **peças na entrega**, não peças
   * por mês — o nome do campo ficou de "por mês" porque renomeá-lo aqui teria
   * ripple grande demais para esta frente. É dívida declarada, não corrigida.
   */
  pecasPorMes: number;
  /** Cobra todo mês enquanto durar, ou cobra uma vez e acabou. Obrigatório —
   *  quem cadastra um serviço novo é forçado pelo `tsc` a declarar qual é. */
  cobranca: FormaDeCobranca;
  produtor: Produtor;
  /**
   * O custo apurado deste serviço. `nao_medido` sempre que QUALQUER parcela
   * faltar — `somar` já contagia, de propósito.
   */
  custo: Dinheiro;
  /**
   * A faixa de desconto que o CEO autorizou, em pontos percentuais.
   *
   * `null` = **nenhuma autorizada**. Não é "ainda não decidimos e o SDR
   * improvisa": é desconto zero, travado.
   */
  descontoAutorizadoPct: number | null;
}

// ── AS PARCELAS DE CUSTO, uma a uma, com a fonte de cada número ─────────────

/**
 * Custo de IA por peça. **A única parcela medida desta casa.**
 *
 * US$ 0,17/peça é o número que `docs/precos.md` já usava e que a medição de
 * 27/08 sustenta na ordem de grandeza. Fica em USD de propósito: converter aqui
 * criaria uma segunda taxa de câmbio na casa.
 */
export const CUSTO_DE_IA_POR_PECA_USD = 0.17;

/** As parcelas que a casa NÃO mede, cada uma com o motivo que vira empurrão. */
export const CUSTOS_NAO_MEDIDOS: ReadonlyArray<{ rotulo: string; motivo: string; dono: string }> = [
  {
    rotulo: "taxa do gateway (Mercado Pago)",
    motivo:
      "o gateway foi ligado em 27/08/2026 e NENHUM pagamento real passou por ele ainda — " +
      "a partir deste PR o webhook grava `fee_details` do provedor em `PagamentoConfirmado.taxaCentavos`, " +
      "e a taxa passa a ser MEDIDA (não estimada) no primeiro pagamento aprovado. " +
      "⚠️ E há um bloqueio antes disso: `MERCADOPAGO_WEBHOOK_SECRET` NÃO existe nas variáveis de produção, " +
      "então hoje todo aviso do Mercado Pago volta 401 e nenhum pagamento chega a ser registrado.",
    dono: "CEO — definir MERCADOPAGO_WEBHOOK_SECRET no Railway com o valor do painel do Mercado Pago",
  },
  {
    rotulo: "infraestrutura (Railway, banco, volume)",
    motivo:
      "MEIO MEDIDA em 27/08/2026: o CONSUMO foi medido na fonte (Railway, produção, 7 dias, " +
      "10.081 amostras — ver `custo-de-infraestrutura.ts`). O que falta é a FATURA: a casa não sabe " +
      "qual plano está contratado, nem se há crédito ou franquia. Multiplicar consumo medido por preço " +
      "de catálogo daria um número com cara de medido e sangue de chute",
    dono: "CEO — informar o total DEBITADO pela Railway no último mês fechado (não a tabela de preços)",
  },
  {
    rotulo: "domínio e e-mail (Resend)",
    motivo: "nenhum registro de custo desses serviços entra na casa",
    dono: "CEO — informar o custo mensal",
  },
  {
    rotulo: "hora humana",
    motivo: "não há apontamento de horas; já declarado em docs/precos.md como dívida",
    dono: "CEO — decidir se haverá apontamento, ou um custo/hora de referência",
  },
  {
    rotulo: "impostos",
    motivo: "regime tributário não declarado à casa",
    dono: "CEO — informar o regime e a alíquota efetiva",
  },
] as const;

/**
 * Monta o custo de um serviço: a parcela medida (IA) mais as que faltam.
 *
 * A soma **se recusa a inventar** — é `somar` do DRE que decide, e ela contagia
 * `nao_medido` para o total quando qualquer parcela falta. É por isso que todo
 * serviço desta tabela sai com custo `nao_medido` hoje: não porque a IA não foi
 * medida, mas porque as outras cinco não foram.
 */
function custoDoServico(pecasPorMes: number): Dinheiro {
  const parcelas: Array<{ rotulo: string; valor: Dinheiro }> = [
    {
      rotulo: "IA",
      valor: medido(Math.round(pecasPorMes * CUSTO_DE_IA_POR_PECA_USD * 100), "registro_de_ia", "USD"),
    },
    ...CUSTOS_NAO_MEDIDOS.map((c) => ({
      rotulo: c.rotulo,
      valor: { estado: "nao_medido", motivo: c.motivo } as Dinheiro,
    })),
  ];
  return somar(parcelas);
}

/**
 * A TABELA. Todo mundo lê daqui: o SDR, a vitrine, a proposta e a cobrança.
 *
 * Os três planos vêm de D-0B6 e **não se remarcam**. Os avulsos vêm da seção
 * "Preço por serviço" de `docs/precos.md`.
 */
/**
 * ⚠️ OS PLANOS NÃO SÃO DIGITADOS AQUI — e a primeira versão deste arquivo os
 * digitava, o que teria criado a TERCEIRA cópia da tabela. O erro foi meu e
 * fica registrado, porque é exatamente o defeito que este módulo existe para
 * matar: `lib/agency/planos.ts` já é a fonte de D-0B6 (preço, peças e nome), e
 * a tabela financeira DERIVA dela. Se o CEO remarcar um plano, ele muda um
 * arquivo — não três.
 *
 * O Pulso (R$ 49) fica de fora: `pecasPorMes: 0`, não entrega peça, e não há o
 * que negociar nele.
 */
const PLANOS_DA_TABELA: ServicoDaCasa[] = PLANOS
  .filter((p) => p.pecasPorMes > 0)
  .map((p) => ({
    chave: `plano_${p.id}`,
    nome: p.nome,
    precoFinalCentavos: p.preco * 100,
    pecasPorMes: p.pecasPorMes,
    // Gente entra a partir do Presença (`docs/precos.md`). O Ritmo é máquina —
    // é só por isso que R$ 290 pode existir sem dar prejuízo.
    produtor: p.id === "ritmo" ? ("maquina" as const) : ("humano" as const),
    custo: custoDoServico(p.pecasPorMes),
    descontoAutorizadoPct: null,
    cobranca: "recorrente_mensal" as const,
  }));

export const TABELA_DE_PRECOS: ReadonlyArray<ServicoDaCasa> = [
  ...PLANOS_DA_TABELA,
  // ── Balcão: 100% automático, pago antes da produção ────────────────────
  { chave: "balcao_post",     nome: "Post (balcão)",      precoFinalCentavos:  7900, pecasPorMes: 1, produtor: "maquina",             custo: custoDoServico(1), descontoAutorizadoPct: null, cobranca: "uma_vez" },
  { chave: "balcao_carrossel",nome: "Carrossel (balcão)", precoFinalCentavos: 12900, pecasPorMes: 1, produtor: "maquina",             custo: custoDoServico(1), descontoAutorizadoPct: null, cobranca: "uma_vez" },
  // ── Avulso para quem já é cliente: com direção de arte e 2 rodadas ──────
  { chave: "avulso_post",     nome: "Post avulso",        precoFinalCentavos: 19000, pecasPorMes: 1, produtor: "maquina_com_direcao", custo: custoDoServico(1), descontoAutorizadoPct: null, cobranca: "uma_vez" },
  { chave: "avulso_carrossel",nome: "Carrossel avulso",   precoFinalCentavos: 29000, pecasPorMes: 1, produtor: "maquina_com_direcao", custo: custoDoServico(1), descontoAutorizadoPct: null, cobranca: "uma_vez" },
];

export function servicoPorChave(chave: string): ServicoDaCasa | null {
  return TABELA_DE_PRECOS.find((s) => s.chave === chave) ?? null;
}

// ─── COMO A CASA FALA O PREÇO — um formatador, e só um ──────────────────────
//
// Até 29/08/2026 três lugares diferentes montavam "preço + volume" na mão —
// `correcaoDoPiso` e `contextoDaNegociacao` (em `negociacao-da-proposta.ts`) e
// `comoSeguirSemBaixarOPreco` (aqui embaixo) — e dois deles escreviam "/mês"
// em cima de item de compra única. `comoSeApresenta` é o único lugar da casa
// que faz essa conta; todo o resto CHAMA, nunca reescreve.

/**
 * A forma de cobrança deste serviço — ou `null` quando o valor não é uma das
 * duas constantes conhecidas.
 *
 * ⛔ Compara contra a LISTA DE LITERAIS, nunca contra texto de `chave` ou
 * `nome`. É este `null` que sustenta o fail-closed: dado vindo de fora, spread
 * mal formado, mock de teste ou item futuro sem `cobranca` declarada cai aqui,
 * não em "recorrente_mensal" por acaso.
 */
export function formaDeCobranca(s: ServicoDaCasa): FormaDeCobranca | null {
  if (s.cobranca === "recorrente_mensal" || s.cobranca === "uma_vez") return s.cobranca;
  return null;
}

/**
 * O único lugar da casa que monta "preço + volume" para o cliente ou para o
 * prompt do SDR. `null` quando a forma de cobrança é indeterminada — **ausência
 * de informação não é informação**, e quem chama esta função decide, na
 * ausência, calar (fail-closed), nunca chutar um rótulo.
 *
 *   recorrente_mensal → "R$ 290,00/mês, 12 peças/mês"
 *   uma_vez           → "R$ 190,00, 1 peça (cobrança única)"
 *
 * Concordância acompanha o número nos dois ramos: "1 peça" / "N peças".
 */
export function comoSeApresenta(s: ServicoDaCasa): string | null {
  const forma = formaDeCobranca(s);
  if (forma === null) return null;
  const preco = emReais(medido(s.precoFinalCentavos, "contrato"));
  const peca = s.pecasPorMes === 1 ? "peça" : "peças";
  if (forma === "recorrente_mensal") {
    return `${preco}/mês, ${s.pecasPorMes} ${peca}/mês`;
  }
  return `${preco}, ${s.pecasPorMes} ${peca} (cobrança única)`;
}

/**
 * O PISO: o menor preço que o SDR pode oferecer, em centavos.
 *
 * Sem faixa autorizada, o piso É o preço de tabela. Ver o cabeçalho: com custo
 * `nao_medido`, não há como provar que a margem no piso não é negativa.
 */
export function pisoDoServico(s: ServicoDaCasa): number {
  // Sem faixa autorizada, não há o que descer.
  if (s.descontoAutorizadoPct === null || s.descontoAutorizadoPct <= 0) {
    return s.precoFinalCentavos;
  }

  // ⛔ TRAVA 1 — CUSTO COM BURACO ANULA O DESCONTO AUTORIZADO.
  //
  // Esta linha é a que o CEO comprou quando disse "margem mínima de dez por
  // cento": sem custo, não há como PROVAR que o preço com desconto deixa 10% —
  // pode deixar 40% e pode ser prejuízo, e as duas hipóteses são igualmente
  // sustentadas pelos dados que a casa tem. *Margem calculada sobre custo
  // incompleto é pior que margem nenhuma: dá confiança falsa ao negociador para
  // descer o preço até um lugar que parece lucro e é prejuízo.*
  //
  // Repare no que isso protege: alguém pode autorizar 15% de desconto neste
  // arquivo, num dia corrido, e a trava continua segurando sozinha. Não depende
  // de ninguém lembrar da regra.
  if (s.custo.estado !== "medido") return s.precoFinalCentavos;

  const pct = Math.min(s.descontoAutorizadoPct, 100);
  const comDesconto = Math.round(s.precoFinalCentavos * (1 - pct / 100));

  // ⛔ O CHÃO DE LUCRO DO CEO (27/08/2026): *"margem mínima nesse início: dez
  // por cento de lucro"*.
  //
  // A faixa autorizada NÃO passa por cima dele. Se o desconto autorizado
  // levasse o preço abaixo do chão, quem vence é o chão — *piso com margem
  // negativa é proibido*, e um desconto autorizado sobre um custo que subiu
  // depois é exatamente como se vende abaixo do custo sem ninguém errar uma
  // conta.
  //
  // Com o custo `nao_medido` este ramo NÃO roda: não se calcula 10% sobre um
  // número que não existe. Vale a regra de cima — piso = preço cheio.
  return Math.max(comDesconto, precoQueFechaAMargemMinima(s.custo.centavos));
}

/**
 * O lucro mínimo que o CEO aceita, em pontos percentuais.
 *
 * *"Margem mínima nesse início: dez por cento de lucro, está ótimo."* — CEO,
 * 27/08/2026. É chão, não meta: nada nesta casa se vende abaixo dele.
 */
export const MARGEM_MINIMA_PCT = 10;

/**
 * ⚠️ **DUAS LEITURAS DA MESMA ORDEM, E A CASA FICOU COM A QUE PROTEGE.**
 *
 * "Dez por cento de lucro" cabe em duas contas diferentes, e elas dão preços
 * diferentes:
 *
 *   • **10% EM CIMA DO CUSTO** — `custo × 1,10`. Sobre custo de R$ 500 dá
 *     R$ 550, e a margem sobre a RECEITA é de **9,09%**.
 *   • **10% DO PREÇO** — `custo ÷ 0,90`. Sobre o mesmo custo dá R$ 555,56, e a
 *     margem sobre a receita é de **10,0%** cravados.
 *
 * Duas sessões desta casa escreveram as duas, em paralelo, no mesmo dia — e a
 * primeira versão a entrar usava `× 1,10`. Isto aqui é a unificação, e ela
 * ficou com `÷ 0,90` por duas razões:
 *
 *   1. **"Dez por cento de lucro" é dez por cento QUE SOBRA**, e o que sobra se
 *      mede contra o que entra. `× 1,10` entrega 9,09% e chamaria de dez.
 *   2. Onde duas leituras da mesma ordem são defensáveis, a casa fica com a que
 *      protege — e escreve qual escolheu, para o CEO poder discordar sabendo da
 *      diferença. Ela é de R$ 5,56 em cada R$ 500 de custo: pouco por venda,
 *      doze vezes por ano numa assinatura.
 *
 * `Math.ceil` de propósito: arredondar para baixo entregaria 9,9992% e chamaria
 * de dez por cento.
 */
export function precoQueFechaAMargemMinima(custoCentavos: number): number {
  return Math.ceil(custoCentavos / (1 - MARGEM_MINIMA_PCT / 100));
}

/**
 * O preço deste serviço fecha os 10%? `null` quando o custo não é medido — e
 * `null` aqui é a resposta honesta, não um "sim" tímido.
 *
 * Serviço que não fecha 10% nem no preço de tabela é serviço que dá prejuízo, e
 * o CEO pediu para saber por nome. Ver `servicosQueNaoFechamAMargem()`.
 */
export function fechaMargemMinima(s: ServicoDaCasa): boolean | null {
  if (s.custo.estado !== "medido") return null;
  return s.precoFinalCentavos >= precoQueFechaAMargemMinima(s.custo.centavos);
}

/** Os serviços que dão prejuízo no preço de tabela, por nome. Lista vazia
 *  significa "nenhum" OU "não dá para saber" — `coberturaDeCusto()` separa os
 *  dois, e o relatório precisa dizer qual dos dois é. */
export function servicosQueNaoFechamAMargem(): ServicoDaCasa[] {
  return TABELA_DE_PRECOS.filter((s) => fechaMargemMinima(s) === false);
}

/**
 * A margem que sobra no piso, em pontos percentuais **do preço**. `null` quando
 * o custo não é medido — **nunca um número otimista**.
 */
export function margemNoPisoPct(s: ServicoDaCasa): number | null {
  if (s.custo.estado !== "medido") return null;
  const piso = pisoDoServico(s);
  if (piso <= 0) return null;
  return ((piso - s.custo.centavos) / piso) * 100;
}

/** A margem que sobra no piso. `nao_medido` enquanto o custo tiver buraco. */
export function margemNoPiso(s: ServicoDaCasa): Dinheiro {
  if (s.custo.estado !== "medido") {
    return { estado: "nao_medido", motivo: `a margem depende do custo, e ${s.custo.estado === "nao_medido" ? s.custo.motivo : "não há custo lançado"}` };
  }
  return medido(pisoDoServico(s) - s.custo.centavos, "derivado", s.custo.moeda);
}

// ─── O FREIO DO NEGOCIADOR ──────────────────────────────────────────────────

export type VereditoDaOferta =
  | { pode: true; precoCentavos: number }
  | { pode: false; motivo: string; pisoCentavos: number; comoSeguir: string };

/**
 * ⛔ **A TRAVA. Código, não prompt.**
 *
 * O SDR passa por aqui antes de dizer qualquer preço. Um prompt pedindo "não
 * ofereça abaixo do piso" é um aviso que a próxima geração do modelo ignora sem
 * avisar ninguém; isto é uma função que devolve `pode: false`.
 *
 * E ela nunca devolve um beco: quando recusa, devolve **como seguir** — porque
 * o caminho certo para "achei caro" existe e tem preço (o degrau de baixo).
 * *Botão que cai na mesma parada é pior que botão nenhum.*
 */
export function podeOfertar(chave: string, precoCentavos: number): VereditoDaOferta {
  const s = servicoPorChave(chave);
  if (!s) {
    return {
      pode: false,
      motivo: `"${chave}" não está na tabela de preços da casa`,
      pisoCentavos: 0,
      comoSeguir:
        "Serviço fora da tabela não se oferta — e serviço sem produtor não entra na tabela. " +
        "Chame o gerente do projeto para orçar à parte.",
    };
  }
  const piso = pisoDoServico(s);
  if (!Number.isFinite(precoCentavos) || precoCentavos < piso) {
    return {
      pode: false,
      motivo:
        `${s.nome} não pode ser ofertado por ${emReais(medido(Math.max(0, Math.round(precoCentavos || 0)), "derivado"))}: ` +
        `o piso é ${emReais(medido(piso, "derivado"))}` +
        (s.descontoAutorizadoPct === null
          ? " (nenhuma faixa de desconto foi autorizada para este serviço)"
          : ` (desconto autorizado: até ${s.descontoAutorizadoPct}%)`),
      pisoCentavos: piso,
      comoSeguir: comoSeguirSemBaixarOPreco(s),
    };
  }
  return { pode: true, precoCentavos: Math.round(precoCentavos) };
}

/**
 * O caminho honesto para "achei caro": **muda-se de degrau, não de preço.**
 *
 * Oferecer o degrau de baixo é venda — ele existe, tem preço e entrega menos.
 * Baixar o preço do mesmo degrau é sangria. Quando não há degrau abaixo, a
 * resposta é gente, com dono e próxima ação — nunca um beco.
 */
export function comoSeguirSemBaixarOPreco(s: ServicoDaCasa): string {
  const abaixo = TABELA_DE_PRECOS
    // Fail-closed: item com forma de cobrança indeterminada não entra na
    // conversa — ausência de informação não é informação.
    .filter((o) => o.precoFinalCentavos < s.precoFinalCentavos && o.pecasPorMes > 0 && formaDeCobranca(o) !== null)
    .sort((a, b) => b.precoFinalCentavos - a.precoFinalCentavos)[0];
  if (abaixo) {
    return (
      `Ofereça o degrau de baixo: ${abaixo.nome}, ${comoSeApresenta(abaixo)}. ` +
      "Mudar de degrau é venda; baixar o preço do degrau é sangria."
    );
  }
  return (
    "Este já é o degrau mais barato da casa — não há para onde descer. " +
    "Escale ao gerente do projeto com o que o cliente disse: quem decide abrir exceção é gente, não a esteira."
  );
}

/**
 * O que o SDR pode PROMETER. Vitrine é promessa.
 *
 * Volume acima da capacidade não se vende, e o que a casa não produz não se
 * oferece — vídeo e reel continuam fora porque não têm produtor.
 */
export function podePrometerVolume(pecasPorMes: number): { pode: boolean; motivo?: string } {
  if (pecasPorMes > TETO_DE_PECAS_POR_MES) {
    return {
      pode: false,
      motivo:
        `${pecasPorMes} peças/mês passa da capacidade da casa (${TETO_DE_PECAS_POR_MES}). ` +
        "Vender acima do que se produz é dívida com outro rosto.",
    };
  }
  return { pode: true };
}

/** O quanto desta tabela está apoiado em custo medido. Para o relatório — e
 *  para a tela, no dia em que houver uma. */
export function coberturaDeCusto(): { medidos: number; total: number; parcelasEmFalta: number } {
  return {
    medidos: TABELA_DE_PRECOS.filter((s) => s.custo.estado === "medido").length,
    total: TABELA_DE_PRECOS.length,
    parcelasEmFalta: CUSTOS_NAO_MEDIDOS.length,
  };
}

// ─── O QUE A CASA RESPONDE SOBRE UM PEDIDO (27/08/2026) ─────────────────────
//
// Medido no escopo do cliente 001, no painel: **"Posts: 28/mês"** e **"Vídeo: A
// definir"**. As duas linhas são defeito, e por razões diferentes:
//
//   • **28 não existe na tabela** (12 · 20 · 36). Mostrar o pedido cru como se
//     fosse o contratado é o caminho mais curto para um preço inventado — e
//     para o cliente descobrir na fatura que comprou outra coisa.
//   • **"A definir" para vídeo é a pior resposta possível.** Vídeo **não tem
//     produtor** nesta casa. "A definir" soa como "ainda vamos combinar", o
//     cliente conta com aquilo, e a casa descobre depois que não produz.
//     *Vitrine é promessa; promessa sem produtor é dívida.* A resposta honesta
//     é curta: **não fazemos**.

/** O que a casa responde a um volume pedido. */
export type RespostaDeVolume =
  | { vende: true; degrau: ServicoDaCasa; pedido: number; frase: string }
  | { vende: false; pedido: number; frase: string };

/**
 * Encaixa o volume pedido no degrau que a casa VENDE — e diz isso em voz alta.
 *
 * O degrau escolhido é o menor que **cobre** o pedido: quem pede 28 recebe 36,
 * nunca 20. Arredondar para baixo entregaria menos do que foi pedido sem
 * ninguém avisar, que é a forma silenciosa de quebrar contrato.
 */
export function volumeQueACasaVende(pecasPedidas: number): RespostaDeVolume {
  const pedido = Math.max(0, Math.round(Number(pecasPedidas) || 0));
  const teto = podePrometerVolume(pedido);
  if (!teto.pode) {
    return { vende: false, pedido, frase: teto.motivo ?? "acima da capacidade da casa" };
  }
  const degraus = TABELA_DE_PRECOS
    .filter((s) => s.pecasPorMes > 0 && s.chave.startsWith("plano_"))
    .sort((a, b) => a.pecasPorMes - b.pecasPorMes);
  const degrau = degraus.find((d) => d.pecasPorMes >= pedido);
  if (!degrau) {
    return { vende: false, pedido, frase: `${pedido} peças/mês não cabe em nenhum plano da casa` };
  }
  const frase = degrau.pecasPorMes === pedido
    ? `${pedido} peças/mês: plano ${degrau.nome}.`
    : `Você pediu ${pedido} peças/mês. A casa vende em degraus, e o que cobre esse volume é o ` +
      `plano ${degrau.nome}, com ${degrau.pecasPorMes} peças/mês — você recebe mais, não menos.`;
  return { vende: true, degrau, pedido, frase };
}

/**
 * A casa produz este serviço? Se não, a resposta é **não fazemos** — nunca
 * "a definir".
 *
 * ⛔ NUNCA devolva texto de indefinição aqui. "A definir" e "sob consulta" são
 * promessas com a assinatura em branco: o cliente conta, a casa não produz, e a
 * conversa difícil acontece depois de ele já ter dito sim.
 */
export function aCasaProduz(servico: string): { produz: boolean; frase: string } {
  const s = servicoPorChave(servico)
    ?? TABELA_DE_PRECOS.find((x) => x.nome.toLowerCase() === servico.trim().toLowerCase());
  if (s) return { produz: true, frase: `${s.nome}: sim, a casa produz.` };
  return {
    produz: false,
    frase:
      `${servico}: **não fazemos** hoje — não temos quem produza, e por isso não está na nossa tabela. ` +
      "Preferimos dizer isso agora do que prometer e não entregar.",
  };
}
