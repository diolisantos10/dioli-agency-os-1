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
import { PLANOS, PRECO_DA_PECA_AVULSA, composicaoDoPlano as composicaoDoPresetPlano } from "@/lib/agency/planos";

/**
 * Teto de PRODUÇÃO da casa, em peças/mês — `docs/precos.md`: *"nenhum plano
 * passa disso"*. Nenhum PLANO de tabela promete acima dele (ver o teste que
 * trava isso).
 *
 * ⚠️ NÃO é mais teto de VENDA (E2, 30/08/2026). Até 30/08 este comentário dizia
 * "vender acima disto é dívida com outro rosto", e o código recusava o pedido
 * — o CEO revogou isso: *"não existe volume acima ou abaixo [...] não é
 * exceção — o que ele está comprando é um pacote personalizado"*. Pedido
 * acima deste número não se recusa: vira PRAZO maior (`podePrometerVolume`),
 * nunca "não".
 */
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

// ─── AS TRÊS PEÇAS QUE ERAM UMA SÓ (E$1, 30/08/2026) ────────────────────────
//
// Antes deste despacho, "1 peça além do combinado, com direção de arte, para
// quem já é cliente" tinha DOIS preços vivos ao mesmo tempo: R$ 90
// (`PECA_EXTRA`, em `planos.ts`) e R$ 190/290 (`avulso_post`/`avulso_carrossel`,
// aqui). MESMO cenário comercial, dois números — quem cobrava dependia de qual
// caminho de código respondia. Os dois convergem para `PRECO_DA_PECA_AVULSA`
// (R$ 55), que agora é a ÚNICA fonte — ver o cabeçalho dela em `planos.ts` para
// a conta completa de por que R$ 55 e não outro número.
//
// O BALCÃO (`balcao_post`/`balcao_carrossel`, R$ 79/R$ 129) FICA DE FORA da
// convergência, DE PROPÓSITO — é produto diferente, não a mesma peça:
//   • pago ANTES da produção, sem contrato e sem relação prévia com a casa;
//   • produção 100% automática, ZERO direção de arte, ZERO rodada de ajuste;
//   • aberto a qualquer pessoa — não precisa ser cliente de plano.
// `avulso_post`/`avulso_carrossel` (agora R$ 55) é a promessa OPOSTA: cliente
// já dentro da casa, com direção de arte e 2 rodadas de revisão — o mesmo
// serviço que `PECA_EXTRA` descrevia, por isso os dois se fundem e o balcão
// não. (O balcão ficar hoje mais caro que o avulso com direção é um artefato
// dessa fusão — está registrado no relato desta frente, não escondido.)
export const TABELA_DE_PRECOS: ReadonlyArray<ServicoDaCasa> = [
  ...PLANOS_DA_TABELA,
  // ── Balcão: 100% automático, pago antes da produção ────────────────────
  { chave: "balcao_post",     nome: "Post (balcão)",      precoFinalCentavos:  7900, pecasPorMes: 1, produtor: "maquina",             custo: custoDoServico(1), descontoAutorizadoPct: null, cobranca: "uma_vez" },
  { chave: "balcao_carrossel",nome: "Carrossel (balcão)", precoFinalCentavos: 12900, pecasPorMes: 1, produtor: "maquina",             custo: custoDoServico(1), descontoAutorizadoPct: null, cobranca: "uma_vez" },
  // ── Avulso para quem já é cliente: com direção de arte e 2 rodadas ──────
  // Preço único, `PRECO_DA_PECA_AVULSA` — não mais 190/290 digitados aqui, nem
  // 90 digitado em `planos.ts` (`PECA_EXTRA` morreu). Ver o bloco acima.
  { chave: "avulso_post",     nome: "Post avulso",        precoFinalCentavos: PRECO_DA_PECA_AVULSA * 100, pecasPorMes: 1, produtor: "maquina_com_direcao", custo: custoDoServico(1), descontoAutorizadoPct: null, cobranca: "uma_vez" },
  { chave: "avulso_carrossel",nome: "Carrossel avulso",   precoFinalCentavos: PRECO_DA_PECA_AVULSA * 100, pecasPorMes: 1, produtor: "maquina_com_direcao", custo: custoDoServico(1), descontoAutorizadoPct: null, cobranca: "uma_vez" },
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
 *
 * ⚠️ O "DEGRAU ABAIXO" SÓ EXISTE DENTRO DA MESMA ESCADA (E1, 30/08/2026). Desde
 * que `avulso_post`/`avulso_carrossel` convergiram para `PRECO_DA_PECA_AVULSA`
 * (R$ 55), eles ficaram MAIS BARATOS que o balcão (R$ 79/129) — uma inversão
 * conhecida e registrada em `planos.ts`. Sem esta restrição, um prospect que
 * achasse o balcão caro seria mandado para o "avulso", que é serviço EXCLUSIVO
 * de quem já é cliente de plano — oferecer isso a um desconhecido é vender o
 * que ele não pode comprar. Por isso a busca só compara PLANOS com PLANOS:
 * é a única família que forma uma escada de verdade (mais peça por mais
 * dinheiro, mesmo produto). Balcão e avulso são itens únicos, cada um para o
 * seu público — sem degrau abaixo, a saída correta sempre foi (e continua
 * sendo) chamar gente.
 */
export function comoSeguirSemBaixarOPreco(s: ServicoDaCasa): string {
  const abaixo = s.chave.startsWith("plano_")
    ? TABELA_DE_PRECOS
        .filter((o) => o.chave.startsWith("plano_") && o.precoFinalCentavos < s.precoFinalCentavos && o.pecasPorMes > 0 && formaDeCobranca(o) !== null)
        .sort((a, b) => b.precoFinalCentavos - a.precoFinalCentavos)[0]
    : undefined;
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

// ═══════════════════════════════════════════════════════════════════════════
// O QUE A CASA RESPONDE A UM VOLUME PEDIDO (E2, 30/08/2026) — E O QUE MORREU
// ═══════════════════════════════════════════════════════════════════════════
//
// ORDEM DO CEO, contra o que este arquivo dizia até esta rodada:
//
//   *"Não existe volume acima ou abaixo. Se o cliente quiser trezentos
//   carrosséis por dia, a gente vai ter que dar um jeito. Não é exceção — o
//   que ele está comprando é um pacote personalizado."*
//
// E a régua: *cliente que pede uma composição que ninguém nunca pediu recebe
// PREÇO, não recebe "vou verificar".*
//
// `podePrometerVolume` devolvia `{ pode: false, motivo: "... dívida com outro
// rosto" }` para qualquer pedido acima de `TETO_DE_PECAS_POR_MES`. Era o
// avesso da ordem: transformava um teto de PRODUÇÃO (o que a casa entrega por
// mês, hoje) num teto de VENDA (o que ela aceita vender). Foram medidas quatro
// respostas de "vou verificar" com um parceiro real por causa deste código.
//
// ⛔ `TETO_DE_PECAS_POR_MES` NÃO SOME. Continua sendo verdade: é o que a casa
// produz por mês, hoje, e nada nesta função finge o contrário. O que muda é o
// que se faz com ele — teto de ENTREGA vira PRAZO, nunca teto de VENDA.
export interface RespostaDeCapacidade {
  /** O pedido, normalizado (inteiro, não negativo). */
  pecasPorMes: number;
  /** O preço da composição, cobrada como pedida — nunca "a definir" nem "sob consulta". */
  precoCentavos: number;
  /** Em quantos meses a casa ENTREGA esse volume, na capacidade de HOJE
   *  (`TETO_DE_PECAS_POR_MES`). `0` só quando o pedido é `0`. */
  prazoEmMeses: number;
  /** O pedido cabe dentro de UM mês, na capacidade de produção de hoje? */
  cabeNaCapacidadeAtual: boolean;
  /** A frase para o cliente: SEMPRE número + prazo. Acima da capacidade,
   *  nomeia que encurtar o prazo é decisão do CEO — nunca insinuado, nunca
   *  escondido atrás de uma recusa. */
  frase: string;
}

/**
 * O que a casa promete de um volume — em PREÇO e PRAZO, nunca em recusa.
 *
 * ⛔ Vitrine é promessa, mas a promessa que este arquivo fazia era vazia:
 * dizer "não" para um pedido grande não é proteção, é dívida com o cliente que
 * queria comprar. A proteção de verdade é dizer a VERDADE sobre o prazo — a
 * casa não finge que entrega em uma semana o que leva dois meses — e deixar a
 * decisão de acelerar (contratar, escalar) com quem manda: o CEO.
 *
 * Vídeo e reel continuam fora da tabela porque não têm produtor — isso não é
 * teto de volume, é ausência de serviço, e `aCasaProduz` responde por ele.
 */
export function podePrometerVolume(pecasPorMes: number): RespostaDeCapacidade {
  const pedido = Math.max(0, Math.round(Number(pecasPorMes) || 0));
  const precoCentavos = pedido * PRECO_DA_PECA_AVULSA * 100;
  const cabeNaCapacidadeAtual = pedido <= TETO_DE_PECAS_POR_MES;
  // Quantas "levas" de capacidade atual (36/mês) o pedido exige, arredondado
  // para cima: sobra de peça não vira mês inteiro escondido, mas falta de um
  // mês inteiro tem de aparecer no prazo.
  const prazoEmMeses = pedido === 0 ? 0 : Math.max(1, Math.ceil(pedido / TETO_DE_PECAS_POR_MES));

  const frase = pedido === 0
    ? "Nenhuma peça pedida."
    : cabeNaCapacidadeAtual
      ? `${pedido} peças/mês: ${emReais(medido(precoCentavos, "derivado"))}, entregue em até 1 mês.`
      : `${pedido} peças/mês passa da capacidade de PRODUÇÃO de hoje (${TETO_DE_PECAS_POR_MES}/mês), ` +
        `não da capacidade de VENDA: ${emReais(medido(precoCentavos, "derivado"))}, entregue em ` +
        `${prazoEmMeses} ${prazoEmMeses === 1 ? "mês" : "meses"} no ritmo atual. ` +
        "Encurtar esse prazo é decisão do CEO — dá para escalar a produção; o preço não muda, o prazo sim.";

  return { pecasPorMes: pedido, precoCentavos, prazoEmMeses, cabeNaCapacidadeAtual, frase };
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

// ─── O QUE A CASA RESPONDE SOBRE UM PEDIDO — E2 REESCREVE ISTO (30/08/2026) ─
//
// Até esta rodada, `volumeQueACasaVende` fazia DUAS coisas que o CEO proibiu:
//
//   1. Acima de `TETO_DE_PECAS_POR_MES`, devolvia `vende: false` — recusa.
//   2. Abaixo do teto, **empurrava** o pedido para o degrau mais próximo que
//      cobre ("a casa vende em degraus") — o pedido de 28 virava "36, plano
//      Conteúdo" como se fosse a resposta, não uma oferta.
//
// A ordem: *"Não é exceção — o que ele está comprando é um pacote
// personalizado."* Isso vira código assim:
//
//   • **A composição pedida é precificada COMO PEDIDA** — à carta,
//     `pedido × PRECO_DA_PECA_AVULSA`. 28 peças custam o preço de 28 peças,
//     nunca o de 36.
//   • **O preset (plano) só entra quando é MAIS BARATO** para o volume pedido
//     — e aí é OFERTA, dita como pergunta ("o plano X sai mais barato e te dá
//     mais peças; quer?"), nunca encaixe forçado nem resposta única.
//   • **Acima da capacidade, preço e prazo — nunca recusa.** Ver
//     `podePrometerVolume`, que esta função reaproveita.
export interface RespostaDeVolume {
  pedido: number;
  /** O preço da composição pedida, à carta — nunca forçado num degrau. */
  precoCentavos: number;
  /** Em quantos meses a casa entrega, na capacidade de hoje. */
  prazoEmMeses: number;
  /** Cabe dentro de um mês, na capacidade de hoje? */
  cabeNaCapacidadeAtual: boolean;
  /**
   * Quando existe um PLANO pronto que entrega este volume (ou mais) por
   * MENOS do que a composição à carta, a oferta — nunca imposição.
   * `null` quando nenhum preset é mais barato que o pedido à carta.
   */
  ofertaMaisBarata: { servico: ServicoDaCasa; economiaCentavos: number } | null;
  /** A frase para o cliente: preço, prazo e — quando existir — a oferta do
   *  preset mais barato, sempre como pergunta, nunca como fato consumado. */
  frase: string;
}

/**
 * O preço e o prazo de um volume pedido — pela composição PEDIDA, nunca por
 * um degrau imposto. Quando um plano de tabela entrega esse volume (ou mais)
 * por menos, ele entra como OFERTA — não como resposta.
 */
export function volumeQueACasaVende(pecasPedidas: number): RespostaDeVolume {
  const capacidade = podePrometerVolume(pecasPedidas);
  const pedido = capacidade.pecasPorMes;

  // O menor plano que já entrega este volume (ou mais) — candidato a oferta,
  // nunca a resposta. Planos de tabela nunca passam do teto (provado em
  // teste), então nenhum plano cobre pedidos acima da capacidade — correto:
  // não há o que ofertar de mais barato para um volume que a casa ainda não
  // produz num mês só.
  const presetQueCobre = TABELA_DE_PRECOS
    .filter((s) => s.chave.startsWith("plano_") && s.pecasPorMes >= pedido)
    .sort((a, b) => a.pecasPorMes - b.pecasPorMes)[0];
  const ofertaMaisBarata = presetQueCobre && pedido > 0 && presetQueCobre.precoFinalCentavos < capacidade.precoCentavos
    ? { servico: presetQueCobre, economiaCentavos: capacidade.precoCentavos - presetQueCobre.precoFinalCentavos }
    : null;

  let frase = capacidade.frase;
  if (ofertaMaisBarata) {
    frase +=
      ` O plano ${ofertaMaisBarata.servico.nome} sai mais barato ` +
      `(${emReais(medido(ofertaMaisBarata.servico.precoFinalCentavos, "contrato"))}/mês, ` +
      `${ofertaMaisBarata.servico.pecasPorMes} peças/mês) e te dá mais peças; quer?`;
  }

  return {
    pedido,
    precoCentavos: capacidade.precoCentavos,
    prazoEmMeses: capacidade.prazoEmMeses,
    cabeNaCapacidadeAtual: capacidade.cabeNaCapacidadeAtual,
    ofertaMaisBarata,
    frase,
  };
}

/**
 * A COMPOSIÇÃO DE UM PEDIDO CUSTOMIZADO CONTRA A CURVA DE VOLUME — item 3 do
 * despacho E1 (30/08/2026), com o cálculo atualizado pela régua do E2: o
 * preço-base agora é sempre a composição pedida à carta (nunca um degrau
 * imposto); a economia, quando existe, vem da OFERTA de um preset mais
 * barato — não de um encaixe automático.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * O QUE ISTO SIGNIFICA PARA O CASO QUE MOTIVOU O E1 (28–30 peças/mês)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 28 peças/mês: `somaAvulsaCentavos` = 28 × R$ 55 = **R$ 1.540** — esse é o
 * preço da composição PEDIDA, e é o que esta função (e `volumeQueACasaVende`)
 * cobram por padrão agora. O plano Conteúdo (36 peças, R$ 790) continua
 * existindo como OFERTA mais barata — `economiaCentavos` = R$ 1.540 − R$ 790 =
 * **R$ 750** —, mas deixou de ser a resposta automática: o cliente decide se
 * quer trocar 28 peças à carta por 36 num plano mais barato, ou ficar com o
 * que pediu.
 */
export interface ContaDaComposicao {
  pedido: number;
  /** `pedido × PRECO_DA_PECA_AVULSA`, em centavos — o preço da composição
   *  pedida, à carta. É o mesmo número de `respostaPelaCurvaDeVolume.precoCentavos`
   *  quando o pedido cabe na capacidade atual — mantido aqui por compatibilidade
   *  de leitura e para deixar a igualdade explícita, não implícita. */
  somaAvulsaCentavos: number;
  /** O preço, o prazo e a oferta (quando existir) para este pedido. */
  respostaPelaCurvaDeVolume: RespostaDeVolume;
  /** Quanto a oferta de preset economiza sobre a composição à carta. `null`
   *  quando não há preset mais barato para este volume. */
  economiaCentavos: number | null;
}

export function contaDaComposicao(pecasPedidas: number): ContaDaComposicao {
  const pedido = Math.max(0, Math.round(Number(pecasPedidas) || 0));
  const somaAvulsaCentavos = pedido * PRECO_DA_PECA_AVULSA * 100;
  const respostaPelaCurvaDeVolume = volumeQueACasaVende(pedido);
  const economiaCentavos = respostaPelaCurvaDeVolume.ofertaMaisBarata
    ? respostaPelaCurvaDeVolume.ofertaMaisBarata.economiaCentavos
    : null;
  return { pedido, somaAvulsaCentavos, respostaPelaCurvaDeVolume, economiaCentavos };
}

/**
 * A composição do preço de um PLANO (soma da carta menos desconto do atalho) —
 * item 2 do despacho E1. Só existe para serviços `plano_*`; `null` para
 * balcão/avulso, que já são uma peça só (nada a compor), e para o Pulso, que
 * não entrega peça.
 */
export function composicaoDoServico(s: ServicoDaCasa) {
  if (!s.chave.startsWith("plano_")) return null;
  const id = s.chave.slice("plano_".length);
  const plano = PLANOS.find((p) => p.id === id);
  if (!plano) return null;
  return composicaoDoPresetPlano(plano);
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
