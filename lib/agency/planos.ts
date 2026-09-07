// OS PLANOS DA CASA — fonte única.
//
// Decidido pelo CEO em 05/08/2026 (ver `docs/precos.md`). Esta lista é a fonte
// da página pública `/planos` e de qualquer proposta que a esteira emitir. Preço
// de plano escrito em dois lugares vira dois preços diferentes na semana em que
// um deles muda — e o cliente sempre acha o menor.
//
// A REGRA QUE SUSTENTA A BASE DA TABELA: gente entra a partir do Presença.
// Abaixo disso a operação é máquina, e é só por isso que R$ 49 e R$ 297 fecham.
// Se a publicação do Ritmo virar nossa, o degrau quebra.
//
// O QUE NÃO PODE ENTRAR AQUI:
//   • serviço que a casa não entrega hoje com código rodando em produção. Desde
//     24/08/2026 isso não é só um aviso escrito: `so-vende-o-que-produz.test.ts`
//     passa cada linha de `inclui` pela régua de `capacidade-de-producao.ts` e
//     quebra se alguém prometer capacidade sem caminho de produção;
//   • vídeo (gravação, edição ou geração) — decisão do CEO: é o item de maior
//     custo real e sai da mensalidade, sempre;
//   • a tabela por serviço. Ela é interna, para cliente de carteira — não vai
//     para página pública.

export type Plano = {
  id: "pulso" | "ritmo" | "presenca" | "conteudo";
  nome: string;
  preco: number;
  /** Cobrada uma vez, na entrada. `null` = isenta. */
  implantacao: number | null;
  paraQuem: string;
  /** O que muda em relação ao degrau de baixo — a frase que vende o degrau. */
  salto: string;
  /** Escopo numerado. Numerado de propósito: é o que vai para o contrato. */
  inclui: string[];
  /** O que NÃO está incluído. É esta lista que evita briga no terceiro mês. */
  naoInclui: string[];
  /** Meses de permanência mínima. */
  permanencia: number;
  /** Preço da peça além do contratado, em reais. `null` = não se aplica. */
  pecaExtra: number | null;
  /**
   * QUANTAS PEÇAS O PLANO ENTREGA POR MÊS — o campo que faltava, e sem o qual a
   * esteira precisava de uma tabela PRÓPRIA para saber que volume cabe em que
   * preço. Era essa a razão de existir de `SOCIAL_PACKAGES`, e é por isso que
   * ela morre com este campo nascendo.
   *
   * ⚠️ TETO: `CAPACIDADE_MENSAL`. Plano que prometa acima disso quebra o teste
   * — vender mais do que se produz é a dívida de D-0A3 com outro rosto.
   */
  pecasPorMes: number;
  /** O degrau que deve receber metade da carteira. */
  destaque?: boolean;
};

/**
 * A CAPACIDADE PROVADA DA CASA, em peças por mês: 3 levas de 12
 * (`contrato-de-quantidade.ts`). É o teto de TODA promessa desta tabela.
 */
export const CAPACIDADE_MENSAL = 36;

/**
 * Quantas peças cada degrau entrega por mês. UMA declaração, usada tanto no
 * campo estruturado `pecasPorMes` quanto na frase de `inclui[]` que o cliente
 * lê em /planos — era a divergência entre esses dois números que produzia o
 * defeito medido em 29/08/2026: o toque de recompra redigitou "8 peças por
 * mês" enquanto a fonte dizia 12, e a mensagem saiu errada ao cliente por cron
 * diário (PR #396). Aqui os dois números vivem no mesmo objeto `Plano`, a três
 * linhas de distância um do outro, e ainda assim eram duas declarações — que
 * é exatamente como a divergência começa.
 */
export const PECAS_POR_MES = {
  pulso: 0,
  ritmo: 12,
  presenca: 20,
  conteudo: CAPACIDADE_MENSAL,
} as const;

/**
 * A peça além do contratado. Mercado 2026: post avulso de agência ou freelancer
 * fica entre R$ 120 e R$ 190 — este fica abaixo, pela mesma decisão de
 * posicionamento de entrada que fixou as mensalidades.
 */
export const PECA_EXTRA = 90;

// ═══════════════════════════════════════════════════════════════════════════
// A TABELA ÚNICA — fechada em 26/08/2026, e agora ela É a única
// ═══════════════════════════════════════════════════════════════════════════
//
// ── O QUE HAVIA, MEDIDO ────────────────────────────────────────────────────
//
// A esteira COTAVA Essencial R$ 590 · Crescimento R$ 990 · Completo R$ 1.790
// (`live-calculator.SOCIAL_PACKAGES`) e esta página VENDIA 49 · 297 · 790 ·
// 1.390 · 2.590. **Nenhum dos três cotados existia na vitrine**, e "Crescimento"
// existia nas duas com preços 2,6× diferentes. O cliente oculto recebeu uma
// proposta de "Plano Essencial · R$ 590" — nome e preço que não existiam na
// página que ele acabara de ler. Verdade escrita em dois lugares já está errada
// em um deles; ali estava errada nos dois.
//
// ── QUEM DECIDIU ───────────────────────────────────────────────────────────
//
// O CEO, em 26/08/2026, tirou a decisão das costas dele e a passou ao Diretor
// Geral, com uma régua só: **agência nova, sem fama nenhuma, começando do zero
// — preço de entrada, abaixo do mercado, por decisão e não por acaso.**
//
// ── O MERCADO, PESQUISADO (agosto/2026) ────────────────────────────────────
//
//   • gestão de redes sociais BÁSICA para pequeno negócio local:
//     **R$ 800 a R$ 1.500/mês**;
//   • freelancer iniciante: R$ 800 a R$ 1.500/mês por cliente;
//   • média empresa: R$ 2.000 a R$ 4.000/mês;
//   • post avulso: R$ 120 a R$ 190.
//
// **O teto desta tabela (R$ 790) fica ABAIXO do piso do mercado (R$ 800).** Não
// é um degrau que ficou barato: é a tabela INTEIRA posicionada abaixo do menor
// preço que o mercado pratica — que é o que "pegar cliente barato" quer dizer.
//
// ── O TETO DE VOLUME É A CAPACIDADE PROVADA, não um número redondo ─────────
//
// A casa produz **3 levas × 12 = 36 peças/mês**. O degrau mais alto entrega
// exatamente 36, e o teste não deixa nenhum passar disso.
//
// ── A CONTA FECHA? (custo de IA, medido) ───────────────────────────────────
//
// Cada peça custa ~US$ 0,17 de imagem (`PRECOS_DE_IMAGEM`, gpt-image-1 alta) —
// ~R$ 0,95 a R$ 5,60/US$. Por degrau, o custo de IA de imagem no mês cheio:
//
//   Ritmo    12 peças → US$ 2,04 ≈ R$ 11  sobre R$ 290 = **3,8% da receita**
//   Presença 20 peças → US$ 3,40 ≈ R$ 19  sobre R$ 490 = **3,9%**
//   Conteúdo 36 peças → US$ 6,12 ≈ R$ 33  sobre R$ 790 = **4,2%**
//
// O texto é fração de centavo por chamada e não move a conta. ⚠️ O que NÃO
// está nesta conta, e é honesto dizer: a HORA HUMANA do Presença para cima
// (atendimento por WhatsApp, resposta a avaliação). Ela é o custo real desses
// dois degraus, e não há medição dela nesta casa — é dívida declarada, não
// número omitido.
//
// ── O QUE MORREU PARA ESTA SER A ÚNICA ────────────────────────────────────
//
//   • `live-calculator.SOCIAL_PACKAGES` (590/990/1790) — agora DERIVADO daqui;
//   • `live-calculator.P` (reel 150–400, tráfego 500–1200, branding 1200–2500 e
//     2000–4000) — a esteira parou de cotar número para o que a vitrine não
//     precifica. O que a casa não vende na vitrine, ela não cota na proposta;
//   • o `cheio` dos planos em `negociacao.TABELA_DE_PISO` — derivado daqui;
//   • o plano **Crescimento (R$ 2.590)** saiu da tabela: R$ 2.590 é preço de
//     agência com nome, e o que ele vendia (campanha paga desenhada) é
//     maturidade que esta casa ainda não tem. Tráfego pago continua existindo
//     como projeto à parte, sem preço de tabela — onde sempre esteve, em
//     `FORA_DE_TODO_PLANO`.
//
// A trava não é este comentário: é
// `__tests__/comercial/a-tabela-e-uma-so.test.ts`. Mude um preço num lugar só e
// a casa fica vermelha.
export const PLANOS: Plano[] = [
  {
    id: "pulso",
    nome: "Pulso",
    preco: 49,
    implantacao: null,
    paraQuem: "Para quem posta sozinho e não faz ideia se está funcionando.",
    salto: "Observa, mede e avisa — não produz.",
    inclui: [
      "Painel de resultados ao vivo: alcance, visualizações, engajamento e seguidores, direto do Instagram",
      "Relatório mensal escrito só com número medido — o que não foi medido é declarado, nunca estimado",
      "Métricas por post: qual peça rendeu e qual não rendeu",
      "Leitura do seu perfil na entrada: temas, tom, formatos e o que mais engaja",
      "Portal próprio, com acesso só seu",
    ],
    naoInclui: ["Nenhuma peça de conteúdo", "Nenhuma publicação", "Google, tráfego e vídeo"],
    permanencia: 0,
    pecaExtra: null,
    pecasPorMes: PECAS_POR_MES.pulso,
  },
  {
    id: "ritmo",
    nome: "Ritmo",
    // Mercado: o básico (publicar em 1–2 redes) começa em R$ 800/mês. Este
    // degrau entrega 12 peças por R$ 290 — 2,8× abaixo do piso do mercado.
    preco: 290,
    // Implantação isenta no degrau de entrada, de propósito: cobrar entrada de
    // quem está experimentando a casa é o atrito exato que uma agência sem
    // nome não pode se dar ao luxo de criar.
    implantacao: null,
    paraQuem: "Para quem quer conteúdo constante e publica ele mesmo.",
    salto: "O degrau que faltava entre medir e contratar uma agência.",
    inclui: [
      "Tudo do Pulso",
      "Pauta do mês: quantos posts, de que tipo, sobre o quê e em que ordem",
      `${PECAS_POR_MES.ritmo} peças por mês — carrossel de até 6 telas ou post único, com a arte pronta`,
      "Legenda de cada peça, no seu tom e ancorada no que você informou",
      "Calendário com data e hora, visível no portal",
      "Aprovação no portal vendo imagem e legenda, peça por peça",
      "2 rodadas de ajuste por peça",
    ],
    naoInclui: [
      "A publicação é sua — entregamos pronto e agendado; quem posta é você",
      "Vídeo, em qualquer forma",
      "Ficha do Google e avaliações",
      "Tráfego pago",
    ],
    permanencia: 3,
    pecaExtra: PECA_EXTRA,
    pecasPorMes: PECAS_POR_MES.ritmo,
  },
  {
    id: "presenca",
    nome: "Presença",
    // Ainda abaixo do piso do mercado (R$ 800), e é AQUI que entra hora humana.
    preco: 490,
    implantacao: 390,
    paraQuem: "Para o negócio que precisa aparecer no Google e não tem ninguém cuidando disso.",
    salto: "É aqui que entra gente da nossa equipe.",
    inclui: [
      `Tudo do Ritmo, com ${PECAS_POR_MES.presenca} peças por mês`,
      "Nós publicamos no Instagram e no Facebook",
      "Gestão de avaliações: elogio respondido; reclamação vira rascunho e chama gente",
      "Atendimento humano por WhatsApp, em horário comercial",
      "Otimização do ciclo: o que muda no mês seguinte, com base no que aconteceu",
    ],
    naoInclui: [
      "Vídeo, em qualquer forma",
      "Stories",
      "Tráfego pago e verba de mídia",
      "Site e material impresso",
      // 24/08/2026 — auditoria. Estas duas linhas estavam em `inclui` e foram
      // vendidas por R$ 790/mês sem existir uma linha de código que as
      // executasse: `publicarNoGoogle` não tem chamador em produção e não há
      // NENHUMA escrita na ficha do Google no repositório (só `listarLocais`,
      // que lê). Voltam para `inclui` no dia em que o caminho existir — e o
      // teste `so-vende-o-que-produz` avisa quando esse dia chegar.
      "Publicação no perfil do Google (post de novidade, oferta ou evento)",
      "Manutenção da ficha do Google: locais, horários e informações",
    ],
    permanencia: 3,
    pecaExtra: PECA_EXTRA,
    pecasPorMes: PECAS_POR_MES.presenca,
    destaque: true,
  },
  {
    id: "conteudo",
    nome: "Conteúdo",
    // O TETO DA TABELA, e ele é R$ 10 abaixo do piso do mercado — entregando o
    // volume que o mercado só cobre na faixa de R$ 2.000 a R$ 4.000.
    preco: 790,
    implantacao: 690,
    paraQuem: "Para quem já vive do digital e precisa de volume e formato variado.",
    salto: "Mais peça, mais formato e alguém lendo os números todo mês com você.",
    inclui: [
      `Tudo do Presença, com ${PECAS_POR_MES.conteudo} peças por mês — a capacidade INTEIRA da casa`,
      "4 sequências de stories por mês, no formato vertical protegido",
      "Plano de medição: o que vamos medir e qual número significa sucesso, combinado antes",
      "Pesquisa de concorrência atualizada a cada ciclo",
      "Reunião mensal de leitura dos números",
      "3 rodadas de ajuste por peça",
    ],
    naoInclui: [
      // 25/08/2026 — decisão do CEO. Esta linha prometia "4 roteiros de reels"
      // em `inclui`. Vídeo e reel NÃO entram em plano nenhum: a casa não grava,
      // não edita e não gera vídeo, e o roteiro sozinho é a mesma dívida de
      // D-0A3 — promessa sem produtor. O que se tira é a PROMESSA; o produtor
      // não existe para ser tirado.
      "Vídeo e reel, em qualquer forma — roteiro, gravação, edição ou geração",
      "Tráfego pago e verba de mídia",
      "Site e material impresso",
    ],
    permanencia: 6,
    pecaExtra: PECA_EXTRA,
    pecasPorMes: PECAS_POR_MES.conteudo,
  },
  // ── O DEGRAU QUE SAIU: Crescimento, R$ 2.590 (26/08/2026) ─────────────────
  //
  // Ele vendia a campanha paga desenhada, a R$ 2.590/mês. Duas razões, e
  // nenhuma delas é o preço em si:
  //
  //   1. **posicionamento.** A régua desta tabela é agência NOVA, sem fama,
  //      pegando cliente barato. R$ 2.590 é a faixa de média empresa
  //      (R$ 2.000–4.000 no mercado) — é o preço de quem já tem nome. Um degrau
  //      desses no fim da escada não é ambição, é a tabela dizendo duas coisas
  //      opostas sobre quem a casa é;
  //   2. **volume.** Ele prometia 18 peças "além" do Conteúdo, que já entregava
  //      14 — e a casa produz 36 no total. A escada inteira agora cabe dentro
  //      da capacidade provada, com o teto colado nela.
  //
  // Tráfego pago não sumiu da casa: continua em `FORA_DE_TODO_PLANO`, como
  // projeto orçado à parte. O que sumiu foi a MENSALIDADE que o embrulhava.
];

/** O que fica fora de TODO plano. Não é falta de escopo: o custo destes quatro
 *  não é conteúdo — é hora, processamento ou projeto. */
export const FORA_DE_TODO_PLANO = [
  {
    titulo: "Vídeo",
    texto:
      "Gravação, edição, roteiro e vídeo gerado por IA. A casa não produz vídeo hoje — em nenhum plano, em nenhuma forma. Quando houver quem produza, entra na tabela; até lá, não é escopo.",
  },
  {
    titulo: "Marca",
    texto:
      "Posicionamento, identidade visual e manual de marca. São projeto com começo e fim, não entrega mensal — e podem vir antes do plano.",
  },
  {
    titulo: "Site e página de captura",
    texto: "Projeto próprio, com prazo próprio. Orçado caso a caso.",
  },
  {
    titulo: "Verba de mídia",
    texto:
      "Nunca entra na mensalidade e nunca passa pela nossa conta. Você paga a plataforma direto, na sua conta, no seu nome.",
  },
];

export function precoEmReais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}
