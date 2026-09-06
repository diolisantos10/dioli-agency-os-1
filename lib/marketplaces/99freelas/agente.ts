// ─── O PRIMEIRO LOOP REAL DO AGENTE DE PROSPECÇÃO ───────────────────────────
//
// Ele faz, em ordem, tudo o que o CEO autorizou em 07/08/2026:
//
//   localizar → ler o briefing → ELIMINAR o que não presta → pontuar →
//   precificar → escrever a proposta individualizada → PREENCHER a candidatura
//   → PARAR no clique.
//
// ── A ORDEM NÃO É ESTÉTICA: É DINHEIRO ──────────────────────────────────────
// A eliminação vem ANTES da qualificação por IA, e a qualificação vem antes de
// qualquer coisa que gaste conexão. Trabalho acadêmico, teste não remunerado e
// pagamento comissionado são reprovados pela própria plataforma — propor neles
// queima conexão (que não volta) e chama a moderação. Filtrar depois de gastar
// é filtrar tarde.
//
// ── ONDE ELE PARA ───────────────────────────────────────────────────────────
// No `enviarProposta`, sempre. O resultado é uma CANDIDATURA PREENCHIDA: valor,
// prazo, texto, e o veredito do portão. Ninguém digita nada em nome da agência;
// o clique é do CEO. §51: Human Gate não é falha.
//
// ── ESTE ARQUIVO NÃO ABRE NAVEGADOR SOZINHO ─────────────────────────────────
// A leitura entra por injeção (`lerProjeto`). Sem isto, todo teste desta lógica
// precisaria de Chromium e de rede — e teste que precisa de rede é teste que
// alguém desliga.

import { portaoDeConformidade, type Decisao } from "@/lib/marketplaces/portao";
import { validarTexto, higienizar, type Achado } from "@/lib/marketplaces/99freelas/conformidade";
import { precificar, type Preco } from "@/lib/marketplaces/99freelas/preco";
import { avaliarSaldo, competenciaDe, type Saldo } from "@/lib/marketplaces/99freelas/conexoes";
import { politicaDe } from "@/lib/marketplaces/politica";
import { extrairDeTexto, type CamposExtraidos } from "@/lib/agency/comercial/oportunidade";
import { encaixaNaCasa } from "@/lib/marketplaces/99freelas/encaixe";
import { lerEscopoDeclarado } from "@/lib/marketplaces/99freelas/escopo-declarado";

// ── O que entra ─────────────────────────────────────────────────────────────

export interface ProjetoBruto {
  /** O link público do projeto. */
  url: string;
  /** O texto da página, COMO VEIO. Conteúdo de terceiro — dado, nunca ordem. */
  conteudoDeTerceiro: string;
  /** O custo em conexões LIDO DA TELA. `null` quando não foi lido. */
  custoEmConexoesLidoDaTela: number | null;
  /** Quantas horas desde a publicação. Nulo quando a tela não disse. */
  horasDesdeAPublicacao?: number | null;
}

export interface ContextoDaRodada {
  workspaceId: string;
  /** Conexões já gastas na competência corrente, lidas do contador da casa. */
  conexoesGastasNoMes: number;
  /** Textos já enviados — a trava de spam por repetição compara com eles. */
  textosJaEnviados?: string[];
  /** Quem escreve a proposta. Injetado para o teste não precisar de IA. */
  redigirProposta: (p: {
    campos: CamposExtraidos;
    url: string;
    conteudoDeTerceiro: string;
  }) => Promise<{ ok: true; texto: string; item: string; nota: number } | { ok: false; motivo: string }>;
  agora?: Date;
}

// ── O que sai ───────────────────────────────────────────────────────────────

export type Desfecho =
  /** Eliminado antes de gastar qualquer coisa. */
  | "eliminado"
  /** A casa não conseguiu escrever/precificar — nada saiu, e o motivo é dito. */
  | "parado"
  /**
   * O texto foi escrito, precificado e passou pelo portão — mas o custo em
   * conexões desta interação NÃO foi lido da tela, então não se sabe se cabe
   * na cota. "Não sei se cabe" não é "não cabe": por isso o texto não é
   * jogado fora. Mas por isso mesmo o envio fica bloqueado até alguém ler o
   * número na tela — NUNCA confundir com `aguardando_clique_humano`.
   */
  | "texto_pronto_envio_bloqueado"
  /** PRONTO PARA O CLIQUE. É o desfecho normal e bom. */
  | "aguardando_clique_humano";

export interface Candidatura {
  desfecho: Desfecho;
  url: string;
  titulo: string;
  categoriaDeclarada: string | null;
  /** O texto que vai no campo "Detalhes". Já higienizado E já validado. */
  texto: string | null;
  /** O número que vai no campo "Sua oferta". */
  ofertaADigitar: number | null;
  preco: Preco | null;
  nota: number | null;
  saldo: Saldo | null;
  decisao: Decisao | null;
  achados: Achado[];
  /** Uma frase para a tela do CEO. Conclusão primeiro. */
  motivo: string;
  competencia: string;
  /**
   * Os ids de `SERVICOS_DA_CELULA` que o encaixe (`eliminar()` →
   * `encaixaNaCasa`) achou compatíveis com este projeto. Vazio quando não
   * houver nenhum. Calculado UMA vez, em `eliminar()` — nunca recalculado
   * aqui nem em `gravarCandidatura`. Ficha 06/09/2026.
   */
  servicosPossiveis: string[];
}

// ── A eliminação, antes de gastar ───────────────────────────────────────────

/** Fonte: fontes/ajuda-projetos-nao-permitidos.md — a própria plataforma os
 *  reprova. Propor neles queima conexão e chama a moderação. */
const MOTIVOS_DE_ELIMINACAO: Array<{ nome: string; re: RegExp }> = [
  { nome: "trabalho acadêmico", re: /\b(?:tcc|monografia|disserta[çc][ãa]o|tese|trabalho\s+(?:acad[êe]mico|da\s+faculdade|escolar)|artigo\s+cient[íi]fico\s+para\s+entregar)\b/i },
  { nome: "teste não remunerado", re: /\b(?:teste\s+(?:n[ãa]o\s+remunerado|gratuito|sem\s+pagamento)|amostra\s+gr[áa]tis|fa[çc]a\s+uma\s+pr[ée]via\s+gr[áa]tis|trabalho\s+de\s+teste\s+sem)\b/i },
  { nome: "pagamento comissionado ou permuta", re: /\b(?:comissionad[oa]|por\s+comiss[ãa]o|permuta|escambo|participa[çc][ãa]o\s+nos\s+lucros|s[óo]cio\s+investidor|%\s*(?:das|sobre\s+as)\s+vendas)\b/i },
  { nome: "vaga de emprego", re: /\b(?:vaga\s+(?:de\s+emprego|clt|efetiva)|contrata[çc][ãa]o\s+clt|regime\s+clt|carteira\s+assinada|per[íi]odo\s+de\s+experi[êe]ncia\s+de\s+90)\b/i },
];

export interface Eliminacao {
  eliminado: boolean;
  motivo: string | null;
  /**
   * Os ids de `SERVICOS_DA_CELULA` que `encaixaNaCasa` achou compatíveis —
   * ficha 06/09/2026 ("a fila diz 'a definir' três vezes"). Vazio quando o
   * encaixe nunca chegou a rodar (eliminado antes por motivo da PLATAFORMA)
   * ou quando rodou e não achou nada. Esta é a ÚNICA chamada a
   * `encaixaNaCasa` do arquivo — `processarProjeto` lê este campo, nunca
   * calcula de novo.
   */
  servicosPossiveis: string[];
}

/**
 * Elimina antes de qualquer gasto. Determinística e sem IA de propósito: é a
 * trava que protege a cota, e uma trava que depende do modelo acertar não é
 * trava — foi o modelo que errou em 06/08 lendo assunto em vez de verbo.
 */
export function eliminar(texto: string, campos: CamposExtraidos): Eliminacao {
  const alvo = `${campos.titulo}\n${texto ?? ""}`;
  for (const m of MOTIVOS_DE_ELIMINACAO) {
    if (m.re.test(alvo)) return { eliminado: true, motivo: `${m.nome} — reprovado pela própria plataforma.`, servicosPossiveis: [] };
  }

  // NOVO (06/09/2026) — depois dos motivos da PLATAFORMA, antes de qualquer
  // gasto (IA, conexão): fora do que a DIOLI entrega hoje. Sem isto a casa
  // gastava IA redigindo uma recusa educada para pedidos como "Melhoria
  // visual do meu quarto" (decoração, nota 3) e essa recusa virava fila de
  // aprovação como se fosse proposta. Fonte:
  // docs/celula-prospeccao/despachos/2026-09-06-nao-propor-fora-do-escopo.md
  const encaixe = encaixaNaCasa({
    titulo: campos.titulo,
    descricao: campos.descricao,
    categoriaDeclarada: campos.categoria,
  });
  if (!encaixe.encaixa) {
    return { eliminado: true, motivo: `fora do que a Dioli entrega hoje: ${encaixe.motivo}`, servicosPossiveis: [] };
  }

  // Anúncio sem substância não dá para orçar, e orçar no escuro é o caminho do
  // preço errado. Não é rejeição do cliente: é reconhecer que falta informação.
  if ((campos.descricao ?? "").replace(/\s+/g, " ").trim().length < 120) {
    return {
      eliminado: true,
      motivo: "projeto indefinido ou incompleto — descrição curta demais para orçar sem inventar.",
      // O encaixe RODOU e achou serviço, mas a candidatura foi eliminada por
      // outro motivo antes de virar proposta — o dado fica registrado do
      // mesmo jeito (não é usado no cartão porque `propostaTexto` é nulo em
      // "eliminado", mas não há razão para descartar o que já foi calculado).
      servicosPossiveis: encaixe.servicosPossiveis,
    };
  }
  return { eliminado: false, motivo: null, servicosPossiveis: encaixe.servicosPossiveis };
}

/**
 * A janela de 24 h dos assinantes.
 *
 * No plano GRATUITO só se pode propor 24 h depois da publicação. Com plano
 * pago, não há janela. A pergunta é feita à política, não a uma constante: se o
 * plano voltar a ser gratuito, o comportamento muda sozinho.
 */
export function esperandoAJanelaDe24h(horasDesdeAPublicacao: number | null | undefined): { esperando: boolean; motivo: string } {
  const politica = politicaDe("99freelas");
  const limites = (politica.cru.limites_da_plataforma ?? {}) as Record<string, unknown>;
  const plano = limites.plano_declarado_da_conta;
  if (plano === "pro" || plano === "premium") {
    return { esperando: false, motivo: `plano ${plano}: sem janela de espera — as primeiras 24 h são exclusivas de assinantes, e a conta é assinante.` };
  }
  const janela = typeof limites.janela_exclusiva_de_assinantes_horas === "number" ? limites.janela_exclusiva_de_assinantes_horas : 24;
  if (typeof horasDesdeAPublicacao !== "number" || !Number.isFinite(horasDesdeAPublicacao)) {
    // Não sei há quanto tempo foi publicado ⇒ não sei se posso ⇒ espero.
    return { esperando: true, motivo: `a tela não disse há quanto tempo o projeto foi publicado, e no plano gratuito só se pode propor após ${janela} h. Ausência de informação não é informação.` };
  }
  if (horasDesdeAPublicacao < janela) {
    return { esperando: true, motivo: `publicado há ${horasDesdeAPublicacao} h — no plano gratuito a proposta só é possível após ${janela} h.` };
  }
  return { esperando: false, motivo: "fora da janela exclusiva de assinantes." };
}

// ── O loop ──────────────────────────────────────────────────────────────────

/**
 * Uma passada completa sobre UM projeto.
 *
 * Devolve sempre uma `Candidatura` — inclusive quando elimina ou para. Retornar
 * `null` num caminho de falha é como um projeto some da fila sem ninguém saber
 * por quê.
 */
export async function processarProjeto(projeto: ProjetoBruto, ctx: ContextoDaRodada): Promise<Candidatura> {
  const agora = ctx.agora ?? new Date();
  const competencia = competenciaDe(agora);
  const texto = projeto.conteudoDeTerceiro ?? "";
  const campos = extrairDeTexto(texto);

  // 1. ELIMINAR — antes de gastar IA, antes de gastar conexão. Também é aqui
  //    que o encaixe roda: `base` carrega `servicosPossiveis` para TODOS os
  //    retornos que a espalham (`...base`), então nenhum caminho de saída
  //    precisa recalcular nem esquecer o campo.
  const corte = eliminar(texto, campos);
  const base: Candidatura = {
    desfecho: "parado", url: projeto.url, titulo: campos.titulo,
    categoriaDeclarada: campos.categoria, texto: null, ofertaADigitar: null,
    preco: null, nota: null, saldo: null, decisao: null, achados: [],
    motivo: "", competencia, servicosPossiveis: corte.servicosPossiveis,
  };

  if (corte.eliminado) {
    return { ...base, desfecho: "eliminado", motivo: `Eliminado sem gastar nada: ${corte.motivo}` };
  }

  // 2. A janela de 24 h. Também antes de gastar IA.
  const janela = esperandoAJanelaDe24h(projeto.horasDesdeAPublicacao);
  if (janela.esperando) {
    return { ...base, desfecho: "parado", motivo: `Ainda não dá para propor: ${janela.motivo}` };
  }

  // 3. A COTA, antes de escrever. `avaliarSaldo` devolve `pode: false` em DOIS
  //    casos diferentes, e eles NÃO são o mesmo problema:
  //      A — não cabe: custo é um número finito, maior que o que resta.
  //      B — não sei se cabe: custo é `Infinity` porque a tela não disse.
  //    Escrever uma proposta que REALMENTE não cabe (A) é gastar IA para
  //    produzir algo que ninguém vai poder enviar — isso continua parando
  //    aqui, sem mudança. Mas "não sei" (B) não é "não cabe": o caso B segue
  //    para escrever, precificar, higienizar e passar pelo portão como um
  //    projeto normal. O envio dele fica bloqueado no FIM do fluxo (passo 8),
  //    não aqui.
  const saldo = avaliarSaldo({
    gastasNoMes: ctx.conexoesGastasNoMes,
    custoLidoDaTela: projeto.custoEmConexoesLidoDaTela,
    competencia,
  });
  const custoDesconhecido = !Number.isFinite(saldo.custo);
  if (!saldo.pode && !custoDesconhecido) {
    // Caso A — cota realmente estourada. Para antes de gastar IA, como hoje.
    return { ...base, desfecho: "parado", saldo, motivo: `Não dá para enviar: ${saldo.motivo}` };
  }

  // 4. ESCREVER. O conteúdo de terceiro vai delimitado — é dado, nunca ordem.
  const redacao = await ctx.redigirProposta({ campos, url: projeto.url, conteudoDeTerceiro: texto });
  if (!redacao.ok) {
    return { ...base, desfecho: "parado", saldo, motivo: `Nada foi escrito: ${redacao.motivo}` };
  }

  // 5. PRECIFICAR. Da tabela da casa, com o piso da categoria por cima.
  const preco = precificar({ item: redacao.item, categoriaDaPlataforma: campos.categoria });
  if (!preco.ok) {
    return { ...base, desfecho: "parado", saldo, nota: redacao.nota, motivo: `Sem preço: ${preco.motivo}` };
  }

  // 5.5. ESCOPO DECLARADO — ficha 06/09/2026 "o preço não pode chutar".
  //
  // `preco` acima cobra o ITEM DO CATÁLOGO DA CASA (uma peça, um vídeo). Ele
  // não sabe, e não é dele saber, se o ANÚNCIO pede uma unidade ou um pacote
  // inteiro. Um anúncio de volume ou recorrência com preço de item unitário
  // é um número errado com cara de cálculo — pior que número ausente. Por
  // isso PARA aqui: nenhuma multiplicação é inventada (a casa não tem tabela
  // de desconto por volume; isso é decisão comercial do CEO, não deste
  // módulo), e `ofertaADigitar` fica `null` (herdado de `base`, não
  // sobrescrito) porque ninguém deve digitar um número que a casa não sabe
  // defender. O texto e o preço unitário SÃO mantidos no retorno — não para
  // envio, mas para o CEO ler o diagnóstico completo.
  const escopo = lerEscopoDeclarado(texto);
  if (escopo.tipo === "volume" || escopo.tipo === "recorrente") {
    const quantidade = escopo.tipo === "volume" && escopo.quantidade !== null ? ` (quantidade lida: ${escopo.quantidade})` : "";
    return {
      ...base,
      desfecho: "parado",
      saldo,
      nota: redacao.nota,
      preco,
      texto: redacao.texto,
      motivo:
        `Não há oferta a digitar: ${escopo.porQue}${quantidade} A casa só sabe precificar a unidade ` +
        `"${redacao.item}" (R$ ${preco.ofertaADigitar}, o piso do item do catálogo) — oferecer esse número ` +
        `no campo "Sua oferta" de um pedido de volume/recorrência seria dizer ao cliente que é o preço do ` +
        `pacote inteiro. Multiplicar por conta própria (ex.: ${preco.ofertaADigitar} × quantidade) inventaria ` +
        `uma política de desconto por volume que a casa não tem. Preço de volume é decisão do CEO.`,
    };
  }

  // 6. HIGIENIZAR o rascunho e então JULGAR o que sai. Nesta ordem: limpa-se o
  //    rascunho, julga-se o texto final. Julgar o rascunho sujo reprovaria o que
  //    a limpeza já resolveu; limpar depois de julgar esconderia a reincidência.
  const limpo = higienizar(redacao.texto);
  const conformidade = validarTexto(limpo);

  // 7. O PORTÃO. É ele — e não este arquivo — que decide.
  const decisao = portaoDeConformidade({
    plataforma: "99freelas",
    acao: "enviarProposta",
    texto: limpo,
    textosJaEnviados: ctx.textosJaEnviados ?? [],
    custoEmConexoesLidoDaTela: projeto.custoEmConexoesLidoDaTela,
    conexoesGastasNoMes: ctx.conexoesGastasNoMes,
  });

  if (decisao.veredito === "BLOCK") {
    return {
      ...base, desfecho: "parado", saldo, nota: redacao.nota, preco,
      texto: null, achados: conformidade.achados, decisao,
      motivo: `A proposta NÃO pode sair: ${decisao.motivo}`,
    };
  }

  // 8. Caso B chegou até aqui com o portão NÃO dando BLOCK: o texto existe,
  //    o preço existe, mas o custo em conexões não foi lido da tela — não se
  //    sabe se cabe, então o envio fica bloqueado. Isto é DIFERENTE de
  //    `aguardando_clique_humano`: aqui NINGUÉM deve clicar em "Enviar", nem
  //    o CEO, até o número aparecer na tela.
  if (custoDesconhecido) {
    return {
      desfecho: "texto_pronto_envio_bloqueado",
      url: projeto.url,
      titulo: campos.titulo,
      categoriaDeclarada: campos.categoria,
      texto: limpo,
      ofertaADigitar: preco.ofertaADigitar,
      preco,
      nota: redacao.nota,
      saldo,
      decisao,
      achados: [],
      competencia,
      servicosPossiveis: corte.servicosPossiveis,
      motivo: `Texto pronto, mas o ENVIO está bloqueado: o custo em conexões desta interação não foi lido da tela (o 99Freelas não publica a tabela). "Não sei se cabe" não é "não cabe" — o texto não foi descartado — mas sem o número não se pode confirmar a cota, e por isso ninguém deve clicar em enviar. Leia o custo na tela do projeto antes de decidir.`,
    };
  }

  // 9. A CANDIDATURA PREENCHIDA. Aqui o agente para, por desenho.
  return {
    desfecho: "aguardando_clique_humano",
    url: projeto.url,
    titulo: campos.titulo,
    categoriaDeclarada: campos.categoria,
    texto: limpo,
    ofertaADigitar: preco.ofertaADigitar,
    preco,
    nota: redacao.nota,
    saldo,
    decisao,
    achados: [],
    competencia,
    servicosPossiveis: corte.servicosPossiveis,
    motivo: `Candidatura pronta para o clique: R$ ${preco.ofertaADigitar} em "Sua oferta" (o cliente verá R$ ${preco.ofertaFinalQueOClienteVe.toFixed(2)}), custo ${saldo.custo} conexão(ões), restam ${saldo.restantes} de ${saldo.cota.cota} em ${competencia}. O sistema não clica — o clique é do CEO.`,
  };
}

/** Uma rodada sobre vários projetos. Ordena pelo que mais importa: nota. */
export async function rodada(projetos: ProjetoBruto[], ctx: ContextoDaRodada): Promise<Candidatura[]> {
  const saida: Candidatura[] = [];
  // Sequencial e não `Promise.all`: paralelizar aqui é operar em ritmo de
  // máquina contra a plataforma, que é exatamente o comportamento que custou a
  // conta de anúncios da Meta em 03/08.
  let gastasProjetadas = ctx.conexoesGastasNoMes;
  for (const p of projetos) {
    const c = await processarProjeto(p, { ...ctx, conexoesGastasNoMes: gastasProjetadas });
    saida.push(c);
    // A cota é RESERVADA já na candidatura pronta. Se o CEO clicar em todas, a
    // conta fecha; se não clicar, a reserva é devolvida quando a candidatura
    // for descartada. Reservar depois do clique deixaria 30 candidaturas
    // prontas para 5 conexões restantes.
    //
    // `Number.isFinite` aqui não é redundante: `texto_pronto_envio_bloqueado`
    // já não cai neste `if` (o desfecho é outro), mas o custo desconhecido é
    // `Infinity`, e somar `Infinity` a uma projeção contaminaria toda conta
    // seguinte — a trava fica no NÚMERO, não só no nome do desfecho.
    if (c.desfecho === "aguardando_clique_humano" && c.saldo && Number.isFinite(c.saldo.custo)) {
      gastasProjetadas += c.saldo.custo;
    }
    // Os textos já produzidos entram na comparação de similaridade da próxima:
    // duas propostas gêmeas na MESMA rodada é o caso mais provável de spam.
    if (c.texto) ctx = { ...ctx, textosJaEnviados: [...(ctx.textosJaEnviados ?? []), c.texto] };
  }
  return saida.sort((a, b) => (b.nota ?? -1) - (a.nota ?? -1));
}
