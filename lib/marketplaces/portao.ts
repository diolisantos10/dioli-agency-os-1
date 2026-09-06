// ─── COMPLIANCE GATE ────────────────────────────────────────────────────────
//
// §49 da especificação 01 do CEO. TODA ação que toca uma plataforma passa por
// aqui e sai com um dos três vereditos:
//
//   ALLOW       — pode acontecer sozinho, agora.
//   HUMAN_GATE  — o sistema faz TUDO menos o clique. Um humano confirma.
//   BLOCK       — não acontece, e o motivo é nomeado.
//
// ── HUMAN_GATE NÃO É FALHA (§51) ────────────────────────────────────────────
// É parte da arquitetura. O agente localiza, lê, elimina, pontua, precifica,
// escreve a proposta individualizada e PREENCHE a candidatura. Ele para no
// clique. Chamar isso de erro faria alguém "consertar" o portão.
//
// ── A REGRA OFICIAL DO CEO (07/08/2026) ─────────────────────────────────────
// "Os termos públicos atuais do 99Freelas não trazem proibição explícita de
// bots/automação, mas também não fornecem autorização expressa para automação
// de candidaturas. Como spam e violações podem resultar inclusive em banimento
// de OUTRAS CONTAS DO MESMO USUÁRIO, não liberar submissão automática até obter
// autorização formal do 99Freelas."
//
// ── O DIA EM QUE O SUPORTE RESPONDER ────────────────────────────────────────
// O envio vira automático trocando UMA LINHA DE DADO no `policy.json`:
// `autorizacao_do_suporte.status = "autorizado"`, com `respondido_em` e
// `evidencia`. Não existe flag de ambiente, não existe `if (process.env...)` e
// não existe parâmetro `{ forcar: true }` — os três são a porta dos fundos que
// vira o caminho normal na primeira sexta-feira apertada.

import {
  politicaDe, autorizacaoDoSuporte, type Politica, type Capacidade,
} from "@/lib/marketplaces/politica";
import { validarTexto, similaridade, TETO_DE_SIMILARIDADE, type Achado } from "@/lib/marketplaces/99freelas/conformidade";
import { avaliarSaldo, type Saldo } from "@/lib/marketplaces/99freelas/conexoes";

export type Veredito = "ALLOW" | "HUMAN_GATE" | "BLOCK";

/** O catálogo FECHADO de ações. Ação que não estiver aqui é BLOCK — e é de
 *  propósito: uma ação nova tem de ser pensada, não herdar permissão. */
export const ACOES = [
  /** Listar projetos na área PÚBLICA. */
  "descobrir",
  /** Abrir e ler o briefing de um projeto público. */
  "lerProjeto",
  /** Pontuar, precificar, escrever, priorizar. NÃO TOCA A PLATAFORMA. */
  "qualificar",
  /** O clique em "Enviar proposta". */
  "enviarProposta",
  /** Pergunta ao cliente / chat. Também gasta conexão. */
  "mensagem",
  /** Reler o estado de propostas já enviadas. */
  "sincronizarStatus",
  /** Login com credencial. */
  "login",
  /** Resolver CAPTCHA, proxy, fingerprint, delay que imita gente. */
  "contornarAntiBot",
] as const;
export type Acao = (typeof ACOES)[number];

/** De que capability do `policy.json` cada ação depende. */
const CAPABILITY_DA_ACAO: Partial<Record<Acao, string>> = {
  descobrir: "discovery",
  lerProjeto: "projectRead",
  enviarProposta: "proposalSubmission",
  mensagem: "messaging",
  sincronizarStatus: "statusSync",
};

/** Ações que NUNCA são autorizadas, independentemente de política. */
const SEMPRE_BLOQUEADAS: Acao[] = ["contornarAntiBot"];

export interface PedidoDeAcao {
  plataforma: string;
  acao: Acao;
  /** O texto que sairia para a plataforma. Obrigatório em `enviarProposta` e
   *  `mensagem` — sem texto não há o que julgar, e não julgar é aprovar. */
  texto?: string | null;
  /** Textos já enviados, para a trava de spam por repetição. */
  textosJaEnviados?: string[];
  /** Custo em conexões LIDO DA TELA. `null`/ausente ⇒ Infinity ⇒ não passa. */
  custoEmConexoesLidoDaTela?: number | null;
  /** Conexões já gastas na competência corrente. */
  conexoesGastasNoMes?: number;
}

export interface Decisao {
  veredito: Veredito;
  acao: Acao;
  plataforma: string;
  /** Uma frase, em português, que serve para a tela do CEO. */
  motivo: string;
  /** Cada razão que empurrou a decisão, com a fonte. É o rastro auditável. */
  razoes: Array<{ regra: string; detalhe: string; fonte: string }>;
  achadosDeConteudo: Achado[];
  saldo: Saldo | null;
  politica: { plataforma: string; versao: string; verificadaEm: string };
}

function vereditoDaCapacidade(c: Capacidade): Veredito {
  if (c === "AUTHORIZED_API" || c === "AUTHORIZED_BROWSER") return "ALLOW";
  if (c === "MANUAL") return "HUMAN_GATE";
  return "BLOCK";
}

/** BLOCK vence HUMAN_GATE, que vence ALLOW. O pior sempre ganha. */
function pior(a: Veredito, b: Veredito): Veredito {
  const peso: Record<Veredito, number> = { ALLOW: 0, HUMAN_GATE: 1, BLOCK: 2 };
  return peso[a] >= peso[b] ? a : b;
}

/**
 * O portão. Ninguém toca uma plataforma sem passar por aqui.
 *
 * Puro de propósito: não lê banco, não faz rede, não depende de sessão. Um
 * portão que precisa de I/O é um portão que alguém contorna "porque o teste
 * ficou lento" — e é assim que a checagem some.
 */
export function portaoDeConformidade(pedido: PedidoDeAcao): Decisao {
  const politica = politicaDe(pedido.plataforma);
  const razoes: Decisao["razoes"] = [];
  const cabecalho = {
    plataforma: politica.plataforma,
    versao: politica.versao,
    verificadaEm: politica.verificadaEm,
  };

  const fechado = (motivo: string, achados: Achado[] = [], saldo: Saldo | null = null): Decisao => ({
    veredito: "BLOCK", acao: pedido.acao, plataforma: pedido.plataforma,
    motivo, razoes, achadosDeConteudo: achados, saldo, politica: cabecalho,
  });

  // ── 1. Existe política, e ela está ativa? ─────────────────────────────────
  if (!politica.ativa) {
    razoes.push({
      regra: "politica_ausente_ou_inativa",
      detalhe: `Não há política ATIVA para "${pedido.plataforma}".`,
      fonte: "lib/marketplaces/politica.ts · fail closed",
    });
    return fechado(
      `Sem política de plataforma ativa para "${pedido.plataforma}". Ausência de informação não é informação: porta fechada. Escreva o policy.json com parecer e fontes antes de qualquer ação.`,
    );
  }

  // ── 2. Ação do catálogo? ──────────────────────────────────────────────────
  if (!(ACOES as readonly string[]).includes(pedido.acao)) {
    razoes.push({ regra: "acao_desconhecida", detalhe: String(pedido.acao), fonte: "catálogo fechado de ações" });
    return fechado(`Ação "${pedido.acao}" não está no catálogo. Ação nova não herda permissão de nenhuma outra.`);
  }

  // ── 3. As que nunca passam ────────────────────────────────────────────────
  if (SEMPRE_BLOQUEADAS.includes(pedido.acao)) {
    razoes.push({
      regra: "anti_bot",
      detalhe: "Contornar CAPTCHA, proxy, fingerprint ou delay que imita gente.",
      fonte: "policy.json · anti_bot · §61 da especificação 01",
    });
    return fechado(
      "Contornar proteção anti-bot é fraude na lista de Sanções do 99Freelas e é proibido pela §61 da especificação do CEO. Ao encontrar um desafio, o agente PARA e escala.",
    );
  }

  // ── 4. Login: fora desta rodada, por ordem explícita ──────────────────────
  if (pedido.acao === "login") {
    razoes.push({
      regra: "login_nao_autorizado",
      detalhe: "Nenhum login no 99Freelas foi autorizado.",
      fonte: "ordem do CEO, 07/08/2026 · policy.json · anti_bot.rate_limit = null",
    });
    return fechado(
      "Login não autorizado. A tela de entrada tem reCAPTCHA e Cloudflare Turnstile, e o comportamento do lado autenticado (rate limit, fingerprint) NÃO foi medido — não é sabido, e o que não é sabido não é permitido.",
    );
  }

  // ── 5. Trabalho que não toca a plataforma ─────────────────────────────────
  if (pedido.acao === "qualificar") {
    razoes.push({
      regra: "nao_toca_a_plataforma",
      detalhe: "Pontuar, precificar, escrever e priorizar acontecem dentro de casa.",
      fonte: "parecer 2026-08-07 · matriz de operações",
    });
    return {
      veredito: "ALLOW", acao: pedido.acao, plataforma: pedido.plataforma,
      motivo: "Qualificação roda 100% automática: nada disto toca o 99Freelas.",
      razoes, achadosDeConteudo: [], saldo: null, politica: cabecalho,
    };
  }

  // ── 6. O que a política declara para esta ação ────────────────────────────
  const capability = CAPABILITY_DA_ACAO[pedido.acao];
  const capacidade = capability ? politica.capacidades[capability] ?? "BLOCKED" : "BLOCKED";
  let veredito = vereditoDaCapacidade(capacidade);
  razoes.push({
    regra: "capability",
    detalhe: `${capability} = ${capacidade}`,
    fonte: `policy.json v${politica.versao} · capabilities`,
  });

  // ── 7. As duas que ESCREVEM na plataforma ─────────────────────────────────
  const escreve = pedido.acao === "enviarProposta" || pedido.acao === "mensagem";
  let achados: Achado[] = [];
  let saldo: Saldo | null = null;

  if (escreve) {
    // 7a. A autorização escrita do suporte — a única coisa que destrava.
    const autorizacao = autorizacaoDoSuporte(politica);
    const flagDaPolitica = pedido.acao === "enviarProposta" ? politica.autoSubmissaoPermitida : politica.autoMensagemPermitida;
    if (!(flagDaPolitica && autorizacao.valeParaOGate)) {
      veredito = pior(veredito, "HUMAN_GATE");
      razoes.push({
        regra: "sem_autorizacao_escrita",
        detalhe: `autorizacao_do_suporte.status = "${autorizacao.status}"${autorizacao.valeParaOGate ? "" : " (sem data de resposta e/ou sem evidência arquivada)"}. Silêncio da plataforma não é autorização.`,
        fonte: "regra oficial do CEO, 07/08/2026 · §60/§61 da especificação 01",
      });
    }
    if (politica.humanGateObrigatorio) {
      veredito = pior(veredito, "HUMAN_GATE");
      razoes.push({
        regra: "human_gate_obrigatorio",
        detalhe: "human_gate_required = true na política.",
        fonte: `policy.json v${politica.versao}`,
      });
    }

    // 7b. O TEXTO. Sem texto não há o que julgar — e não julgar é aprovar.
    const texto = pedido.texto ?? "";
    if (!texto.trim()) {
      razoes.push({
        regra: "texto_ausente",
        detalhe: "Nenhum texto foi apresentado ao portão.",
        fonte: "compliance validator",
      });
      return fechado(
        "Nada a enviar: o texto não chegou ao portão. Um portão que aprova o vazio é um portão que aprova o que não conferiu.",
      );
    }
    const conformidade = validarTexto(texto);
    achados = conformidade.achados;
    if (!conformidade.ok) {
      veredito = "BLOCK";
      for (const a of achados) {
        razoes.push({ regra: a.regra, detalhe: `trecho: "${a.trecho}"`, fonte: a.fonte });
      }
    }

    // 7c. SPAM por repetição. Texto igual entre projetos é o vetor de sanção.
    const anteriores = pedido.textosJaEnviados ?? [];
    for (const antigo of anteriores) {
      const s = similaridade(texto, antigo);
      if (s >= TETO_DE_SIMILARIDADE) {
        veredito = "BLOCK";
        razoes.push({
          regra: "spam_por_repeticao",
          detalhe: `${Math.round(s * 100)}% igual a uma proposta já enviada (teto: ${Math.round(TETO_DE_SIMILARIDADE * 100)}%). Proposta genérica repetida entre projetos é spam.`,
          fonte: "Termos de Uso · Sanções · propagação de spams",
        });
        break;
      }
    }

    // 7d. A COTA. Conexão gasta não volta.
    //
    // `avaliarSaldo` devolve `pode: false` em DOIS casos que NÃO são o mesmo
    // problema — ver docs/celula-prospeccao/despachos/2026-09-06-custo-desconhecido.md:
    //   A — custo FINITO maior que o restante: a cota REALMENTE está estourada.
    //   B — custo `Infinity`: a tela não disse o número. "Não sei se cabe" não
    //       é "não cabe".
    // Tratar os dois como BLOCK aqui recriaria, dentro do portão, a MESMA
    // confusão que `lib/marketplaces/99freelas/agente.ts` foi corrigido para
    // não cometer mais — um texto limpo, escrito e precificado, seria
    // descartado (`texto: null`) só porque o custo é desconhecido, e o
    // chamador nunca teria como distinguir os dois casos pelo resultado.
    //
    // O caso A continua BLOCK: gastar IA e preencher uma candidatura que não
    // cabe de verdade é o desperdício que este passo sempre existiu para
    // evitar. O caso B NÃO força BLOCK aqui — e isso não afrouxa nenhuma trava
    // de envio: `enviarProposta`/`mensagem` já são HUMAN_GATE no mínimo (7a
    // acima), então nada aqui autoriza envio automático. Quem decide o
    // desfecho final do caso B é quem chama o portão (o novo
    // `"texto_pronto_envio_bloqueado"` em `agente.ts`), nunca este portão
    // sozinho.
    saldo = avaliarSaldo({
      gastasNoMes: pedido.conexoesGastasNoMes ?? 0,
      custoLidoDaTela: pedido.custoEmConexoesLidoDaTela,
    });
    if (!saldo.pode && Number.isFinite(saldo.custo)) {
      veredito = "BLOCK";
      razoes.push({
        regra: "cota_de_conexoes",
        detalhe: saldo.motivo,
        fonte: "policy.json · limites_da_plataforma · fontes/ajuda-o-que-sao-conexoes.md",
      });
    } else {
      razoes.push({
        regra: saldo.pode ? "cota_de_conexoes" : "cota_de_conexoes_desconhecida",
        detalhe: saldo.motivo,
        fonte: "policy.json · limites_da_plataforma",
      });
    }
  }

  const motivo =
    veredito === "BLOCK"
      ? `BLOQUEADO: ${razoes.filter((r) => r.regra !== "capability" && r.regra !== "human_gate_obrigatorio").map((r) => r.detalhe).join(" · ") || "a política não autoriza esta ação."}`
      : veredito === "HUMAN_GATE"
        ? "PRONTO PARA O CLIQUE. O sistema fez tudo — localizou, leu, eliminou, pontuou, precificou, escreveu a proposta individualizada e preencheu a candidatura. O clique final em \"Enviar proposta\" é do CEO, porque o 99Freelas não autoriza automação EXPRESSAMENTE e silêncio não é autorização. Isto não é falha: é a arquitetura."
        : "Autorizado: a política da plataforma cobre esta ação.";

  return {
    veredito, acao: pedido.acao, plataforma: pedido.plataforma,
    motivo, razoes, achadosDeConteudo: achados, saldo, politica: cabecalho,
  };
}

/**
 * O veredito da POLÍTICA sozinha, sem olhar texto nem cota.
 *
 * É o que uma tela mostra ("o envio nesta plataforma é HUMAN_GATE") e é o que
 * muda quando o suporte responder. Separado do portão de propósito: misturar
 * "a plataforma permite?" com "este texto está limpo?" faria uma proposta suja
 * parecer um problema de política, e alguém "consertaria" a política.
 */
export function vereditoDePolitica(plataforma: string, acao: Acao): Veredito {
  const politica = politicaDe(plataforma);
  if (!politica.ativa) return "BLOCK";
  if (SEMPRE_BLOQUEADAS.includes(acao) || acao === "login") return "BLOCK";
  if (acao === "qualificar") return "ALLOW";
  const capability = CAPABILITY_DA_ACAO[acao];
  let v = vereditoDaCapacidade(capability ? politica.capacidades[capability] ?? "BLOCKED" : "BLOCKED");
  if (acao === "enviarProposta" || acao === "mensagem") {
    const autorizacao = autorizacaoDoSuporte(politica);
    const flag = acao === "enviarProposta" ? politica.autoSubmissaoPermitida : politica.autoMensagemPermitida;
    if (!(flag && autorizacao.valeParaOGate)) v = pior(v, "HUMAN_GATE");
    if (politica.humanGateObrigatorio) v = pior(v, "HUMAN_GATE");
  }
  return v;
}

/** Atalho de leitura para telas e relatórios. */
export function resumoDaPolitica(plataforma: string): {
  plataforma: string; versao: string; verificadaEm: string;
  envio: Veredito; mensagem: Veredito; descoberta: Veredito; autorizacao: string;
} {
  const p: Politica = politicaDe(plataforma);
  const a = autorizacaoDoSuporte(p);
  return {
    plataforma: p.plataforma, versao: p.versao, verificadaEm: p.verificadaEm,
    envio: vereditoDePolitica(plataforma, "enviarProposta"),
    mensagem: vereditoDePolitica(plataforma, "mensagem"),
    descoberta: vereditoDePolitica(plataforma, "descobrir"),
    autorizacao: a.status,
  };
}
