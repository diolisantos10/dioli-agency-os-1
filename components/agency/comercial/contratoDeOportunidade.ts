// ─── Contrato de leitura do Radar de Oportunidades ───────────────────────────
//
// POR QUE este arquivo existe:
//
// 1. A tela e o backend (`lib/agency/comercial/oportunidade.ts` +
//    `/api/agency/oportunidades`) estão sendo escritos em paralelo. Se a tela
//    lesse `json.oportunidades[0].nota` direto, qualquer divergência de nome de
//    campo derrubaria a página inteira em produção — e o operador veria "erro"
//    onde na verdade havia trabalho pronto. Aqui a leitura é TOLERANTE na
//    entrada (aceita os apelidos mais prováveis) e ESTRITA na saída (um tipo só,
//    que o resto da tela consome).
//
// 2. Ausência de informação não é informação (regra da casa). Campo que não veio
//    vira `null` — nunca "R$ 0", nunca "sem nota". Quem decide o que mostrar no
//    lugar é a tela, com texto honesto.
// ─────────────────────────────────────────────────────────────────────────────

import { REGRA_ENVIO_BLOQUEADO_POR_CUSTO_DESCONHECIDO } from "@/lib/marketplaces/99freelas/marcador-de-envio-bloqueado";

export type StatusDaOportunidade = "nova" | "aprovada" | "recusada" | "enviada";

/** Um motivo de reprovação do Compliance Validator, pronto para a tela. */
export interface AchadoDeConformidade {
  regra: string;
  /** O trecho exato que disparou. Dizer "tem link" sem mostrar qual obriga o
   *  operador a caçar dentro do texto que ele ia mandar ao cliente. */
  trecho: string;
  fonte: string;
}

/**
 * O julgamento do Compliance Validator sobre esta proposta.
 *
 * ⚠️ TRÊS estados, não dois — e a distinção é o produto desta tela:
 *   • `nao_julgada`  — ninguém passou pelo portão (linha antiga, ou a IA não
 *                      respondeu). O caminho é analisar de novo.
 *   • `aprovada`     — passou. Há texto e ele é copiável.
 *   • `reprovada`    — passou e FOI BARRADA. Não há texto, de propósito, e o
 *                      caminho NÃO é analisar de novo: é ler o que está errado.
 * Colapsar `reprovada` em `nao_julgada` faria a tela pedir reanálise para uma
 * violação — e a reanálise devolveria a mesma violação.
 */
export type EstadoDaConformidade = "nao_julgada" | "aprovada" | "reprovada";

/** A procedência do preço. `null` quando o Pricing Engine não foi executado. */
export interface DetalheDoPreco {
  ok: boolean;
  ofertaADigitar: number;
  pisoDaCasa: number;
  pisoDaCategoria: number | null;
  pisoQueVenceu: string;
  taxaPercentual: number;
  taxaEmReais: number;
  ofertaFinalQueOClienteVe: number;
  motivo: string;
}

export interface Oportunidade {
  id: string;
  /** Chave da plataforma, já normalizada para as chaves de PLATAFORMAS. */
  plataforma: string;
  titulo: string;
  /** 0 a 100. `null` quando a análise ainda não produziu nota. */
  nota: number | null;
  servicoSugerido: string | null;
  /** Já formatado para leitura (ex.: "R$ 2.400"). `null` = não estimado. */
  valorSugerido: string | null;
  /**
   * O orçamento que o ANUNCIANTE declarou — não é a nossa sugestão de preço, e
   * por isso não compartilha campo com ela. Trocar um pelo outro na tela é a
   * receita de proposta enviada com o preço do cliente.
   */
  orcamentoInformado: string | null;
  /** Prazo declarado no anúncio, em texto. `null` = o anúncio não disse. */
  prazoInformado: string | null;
  categoria: string | null;
  /** O porquê da nota, em uma linha. */
  raciocinio: string | null;
  /** O texto do projeto como chegou da plataforma. */
  textoOriginal: string;
  /** A proposta pronta para colar dentro da plataforma. `null` = ainda não gerada. */
  proposta: string | null;
  url: string | null;
  status: StatusDaOportunidade;
  criadaEm: string | null;

  /** O veredito do Compliance Validator. Ver `EstadoDaConformidade`. */
  conformidade: EstadoDaConformidade;
  /** Os motivos, quando reprovada. Vazio nos outros estados. */
  achados: AchadoDeConformidade[];
  /** `true` quando o rascunho do modelo trazia link ou contato e o código tirou.
   *  Aparece na tela: gerador que precisa ser limpo toda vez é gerador que vai
   *  escapar no dia em que a limpeza falhar. */
  higienizada: boolean;
  /** De onde saiu o valor sugerido. `null` = o Pricing Engine não rodou. */
  preco: DetalheDoPreco | null;
}

export const PLATAFORMAS: { id: string; label: string }[] = [
  { id: "99freelas", label: "99Freelas" },
  { id: "workana", label: "Workana" },
  { id: "upwork", label: "Upwork" },
  { id: "guru", label: "Guru" },
  { id: "peopleperhour", label: "PeoplePerHour" },
  { id: "freelancer", label: "Freelancer.com" },
  // A chave é "desconhecida" porque o catálogo do backend
  // (`lib/agency/comercial/oportunidade.ts`) é FECHADO — mandar "outra" daqui
  // vira uma origem que nenhum agrupamento reconhece. O rótulo é que fala com
  // o operador; a chave fala com o banco.
  { id: "desconhecida", label: "Outra" },
];

const ROTULO_POR_ID = new Map(PLATAFORMAS.map((p) => [p.id, p.label]));

/** Rótulo humano da plataforma. Chave desconhecida vira o próprio texto, nunca "undefined". */
export function rotuloDaPlataforma(chave: string): string {
  return ROTULO_POR_ID.get(chave) ?? (chave.trim() || "Outra");
}

/**
 * Texto colado que é SÓ um link. O backend usa `url` para deduzir a plataforma
 * e para o time abrir o anúncio depois — mandar o campo separado é o que faz
 * "colar o link" funcionar tão bem quanto "colar o texto".
 */
export function urlSolta(texto: string): string | null {
  const t = texto.trim();
  if (/\s/.test(t)) return null;
  return /^https?:\/\/\S+$/i.test(t) ? t : null;
}

/** Normaliza a chave da plataforma vinda da API ("99Freelas", "FREELANCER.COM"…). */
function normalizarPlataforma(bruto: unknown): string {
  const texto = typeof bruto === "string" ? bruto.trim().toLowerCase() : "";
  if (!texto) return "outra";
  const semRuido = texto.replace(/[\s._-]/g, "").replace(/\.com(\.br)?$/, "");
  const achou = PLATAFORMAS.find((p) => p.id.replace(/[\s._-]/g, "") === semRuido);
  return achou?.id ?? texto;
}

const STATUS_VALIDOS: Record<string, StatusDaOportunidade> = {
  nova: "nova",
  new: "nova",
  pendente: "nova",
  pending: "nova",
  aprovada: "aprovada",
  aprovado: "aprovada",
  approved: "aprovada",
  recusada: "recusada",
  recusado: "recusada",
  rejected: "recusada",
  enviada: "enviada",
  enviado: "enviada",
  sent: "enviada",
};

function normalizarStatus(bruto: unknown): StatusDaOportunidade {
  const texto = typeof bruto === "string" ? bruto.trim().toLowerCase() : "";
  return STATUS_VALIDOS[texto] ?? "nova";
}

/** Primeiro campo presente entre os apelidos possíveis. */
function campo(fonte: Record<string, unknown>, ...chaves: string[]): unknown {
  for (const c of chaves) {
    const v = fonte[c];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

function texto(bruto: unknown): string | null {
  if (typeof bruto === "string" && bruto.trim()) return bruto.trim();
  if (typeof bruto === "number" && Number.isFinite(bruto)) return String(bruto);
  return null;
}

/** Valor pode chegar como número (centavos ou reais) ou como texto já formatado. */
function valorLegivel(bruto: unknown): string | null {
  if (typeof bruto === "number" && Number.isFinite(bruto)) {
    return bruto.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  }
  return texto(bruto);
}

function notaLegivel(bruto: unknown): number | null {
  const n = typeof bruto === "number" ? bruto : Number(bruto);
  if (!Number.isFinite(n)) return null;
  // Nota fora da escala é dado errado — mostrar 137/100 é pior que não mostrar.
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function normalizarOportunidade(bruta: unknown): Oportunidade | null {
  if (!bruta || typeof bruta !== "object") return null;
  const o = bruta as Record<string, unknown>;
  const id = texto(campo(o, "id", "_id", "uuid"));
  if (!id) return null; // sem id não há como decidir sobre ela

  return {
    id,
    plataforma: normalizarPlataforma(campo(o, "plataforma", "platform", "origem", "source")),
    titulo: texto(campo(o, "titulo", "title", "nome", "name")) ?? "Oportunidade sem título",
    nota: notaLegivel(campo(o, "nota", "score", "pontuacao", "notaFit")),
    servicoSugerido: texto(campo(o, "servicoSugerido", "servico", "suggestedService", "service")),
    valorSugerido: valorLegivel(campo(o, "valorSugerido", "valor", "suggestedValue", "preco", "price")),
    orcamentoInformado: valorLegivel(campo(o, "orcamentoInformado", "orcamento", "budget")),
    prazoInformado: texto(campo(o, "prazoInformado", "prazo", "deadline")),
    categoria: texto(campo(o, "categoria", "category")),
    raciocinio: texto(campo(o, "raciocinio", "reasoning", "justificativa", "porque", "rationale")),
    textoOriginal: texto(campo(o, "textoOriginal", "texto", "originalText", "descricao", "description", "conteudo")) ?? "",
    proposta: texto(campo(o, "propostaTexto", "proposta", "propostaPronta", "proposal", "mensagem")),
    url: texto(campo(o, "url", "urlExterna", "link", "sourceUrl")),
    status: normalizarStatus(campo(o, "status", "situacao", "state")),
    criadaEm: texto(campo(o, "criadaEm", "createdAt", "created_at", "data")),
    conformidade: normalizarConformidade(o.conformidadeOk),
    achados: normalizarAchados(o.conformidadeAchados),
    // ⚠️ Só `true` literal vira `true`. Ausente é NÃO — e "não sei se limpou"
    // não pode virar "limpou".
    higienizada: o.propostaHigienizada === true,
    preco: normalizarPreco(o.precoDetalhe),
  };
}

/** `null`/ausente = ninguém julgou. É diferente de reprovada, e a tela usa a
 *  diferença para escolher entre "analise de novo" e "leia o que está errado". */
function normalizarConformidade(bruto: unknown): EstadoDaConformidade {
  if (bruto === true) return "aprovada";
  if (bruto === false) return "reprovada";
  return "nao_julgada";
}

/** Regra sintética — nunca gravada pelo agente, só produzida AQUI, na leitura,
 *  quando `conformidadeAchados` não é JSON válido. `temEnvioBloqueado` (abaixo)
 *  trata a presença dela como bloqueio: um parse que falhou não prova que o
 *  marcador de envio não estava lá dentro. Fail-closed, não "sem problema". */
const REGRA_REGISTRO_ILEGIVEL = "registro_ilegivel";

/** Os achados chegam como TEXTO JSON do banco. JSON quebrado não pode derrubar a
 *  tela nem, pior, virar "nenhum problema encontrado": vira uma linha honesta. */
function normalizarAchados(bruto: unknown): AchadoDeConformidade[] {
  if (Array.isArray(bruto)) return lerAchados(bruto);
  if (typeof bruto !== "string" || !bruto.trim()) return [];
  try {
    const j: unknown = JSON.parse(bruto);
    return Array.isArray(j) ? lerAchados(j) : [];
  } catch {
    return [
      {
        regra: REGRA_REGISTRO_ILEGIVEL,
        trecho: "não consegui ler o registro da reprovação",
        fonte: "banco de dados desta casa",
      },
    ];
  }
}

// ── O MARCADOR DE ENVIO BLOQUEADO, LIDO — ficha 06/09/2026 ──────────────────
//
// A pergunta que faltava: "esta oportunidade tem o envio bloqueado?". O
// portão NÃO reprovou (`conformidade` não é `"reprovada"`) — o texto foi
// escrito e aprovado — mas o custo em conexões desta interação não foi lido
// da tela do 99Freelas, e a régua desta casa é "trava, não aviso".
//
// Fail-closed: se `conformidadeAchados` veio malformado, `normalizarAchados`
// já devolveu `REGRA_REGISTRO_ILEGIVEL` em vez de lista vazia — e aqui isso
// TAMBÉM conta como bloqueado. Um JSON quebrado não é prova de que o marcador
// de custo desconhecido não estava lá; tratá-lo como "liberado" seria o
// oposto de fail-closed.
export function temEnvioBloqueado(achados: AchadoDeConformidade[]): boolean {
  return achados.some(
    (a) =>
      a.regra === REGRA_ENVIO_BLOQUEADO_POR_CUSTO_DESCONHECIDO || a.regra === REGRA_REGISTRO_ILEGIVEL,
  );
}

function lerAchados(lista: unknown[]): AchadoDeConformidade[] {
  return lista
    .filter((a): a is Record<string, unknown> => Boolean(a) && typeof a === "object")
    .map((a) => ({
      regra: texto(a.regra) ?? "regra_sem_nome",
      trecho: texto(a.trecho) ?? "",
      fonte: texto(a.fonte) ?? "",
    }));
}

function normalizarPreco(bruto: unknown): DetalheDoPreco | null {
  const j: unknown = typeof bruto === "string" ? seguroJson(bruto) : bruto;
  if (!j || typeof j !== "object") return null;
  const p = j as Record<string, unknown>;
  const n = (v: unknown, padrao: number): number => (typeof v === "number" && Number.isFinite(v) ? v : padrao);
  return {
    ok: p.ok === true,
    ofertaADigitar: n(p.ofertaADigitar, 0),
    pisoDaCasa: n(p.pisoDaCasa, 0),
    pisoDaCategoria: typeof p.pisoDaCategoria === "number" ? p.pisoDaCategoria : null,
    pisoQueVenceu: texto(p.pisoQueVenceu) ?? "nenhum",
    taxaPercentual: n(p.taxaPercentual, 0),
    taxaEmReais: n(p.taxaEmReais, 0),
    ofertaFinalQueOClienteVe: n(p.ofertaFinalQueOClienteVe, 0),
    motivo: texto(p.motivo) ?? "",
  };
}

function seguroJson(bruto: string): unknown {
  try {
    return JSON.parse(bruto);
  } catch {
    return null;
  }
}

/** O nome humano de cada regra. O operador precisa saber O QUE está errado, não
 *  o identificador interno. Regra desconhecida devolve o próprio id — nunca
 *  "undefined", e nunca some da lista: motivo que some é motivo que não existe. */
export const NOME_DA_REGRA: Record<string, string> = {
  link_externo: "Link externo antes do contrato",
  dado_de_contato: "Dado de contato (telefone, e-mail, @, rede social)",
  pagamento_fora: "Pagamento por fora da plataforma",
  referencia_a_comissao: "Referência à comissão ou à taxa da plataforma",
  pagamento_comissionado: "Pagamento comissionado ou participação nos lucros",
  permuta_ou_teste_gratis: "Permuta, teste grátis ou trabalho sem custo",
  spam_por_repeticao: "Parecida demais com uma proposta já enviada (spam)",
  [REGRA_REGISTRO_ILEGIVEL]: "Registro da reprovação ilegível",
  [REGRA_ENVIO_BLOQUEADO_POR_CUSTO_DESCONHECIDO]: "Custo em conexões não lido da tela",
};

export function nomeDaRegra(regra: string): string {
  return NOME_DA_REGRA[regra] ?? regra;
}

/** Aceita `[...]`, `{oportunidades}`, `{items}`, `{data}` — o que o backend decidir. */
export function normalizarLista(json: unknown): Oportunidade[] {
  const cru = Array.isArray(json)
    ? json
    : json && typeof json === "object"
      ? ((json as Record<string, unknown>).oportunidades ??
         (json as Record<string, unknown>).items ??
         (json as Record<string, unknown>).data ??
         (json as Record<string, unknown>).list)
      : null;
  if (!Array.isArray(cru)) return [];
  return cru
    .map(normalizarOportunidade)
    .filter((o): o is Oportunidade => o !== null)
    // A tela é uma fila de decisão: quem vale mais fica em cima. Sem nota vai
    // para o fim — nunca some da lista.
    .sort((a, b) => (b.nota ?? -1) - (a.nota ?? -1));
}

// ─── Faixa da nota ───────────────────────────────────────────────────────────
// DESIGN.md §2.4: cor NUNCA é o único sinal de estado. Por isso a faixa carrega
// rótulo em texto ("Forte"/"Média"/"Fraca") junto da cor — daltônico lê igual.

export interface FaixaDaNota {
  rotulo: string;
  /** Classes de superfície + texto, sempre em token. */
  classe: string;
  /** Cor do ponto que acompanha o rótulo. */
  ponto: string;
}

export function faixaDaNota(nota: number | null): FaixaDaNota {
  if (nota === null) {
    return {
      rotulo: "Sem nota",
      classe: "bg-[var(--accent)] text-[var(--text-muted)] border-[var(--border)]",
      ponto: "bg-[var(--text-subtle)]",
    };
  }
  if (nota >= 70) {
    return {
      rotulo: "Forte",
      classe: "bg-[var(--success-bg)] text-[var(--success)] border-[#BBF7D0]",
      ponto: "bg-[var(--success)]",
    };
  }
  if (nota >= 40) {
    return {
      rotulo: "Média",
      classe: "bg-[var(--warning-bg)] text-[var(--warning)] border-[#FDE68A]",
      ponto: "bg-[var(--warning)]",
    };
  }
  return {
    rotulo: "Fraca",
    classe: "bg-[var(--accent)] text-[var(--text-secondary)] border-[var(--border)]",
    ponto: "bg-[var(--text-subtle)]",
  };
}

// ─── Abas de triagem ─────────────────────────────────────────────────────────

export const ABAS: { id: StatusDaOportunidade | "todas"; label: string }[] = [
  { id: "nova", label: "Para decidir" },
  { id: "aprovada", label: "Aprovadas" },
  { id: "enviada", label: "Enviadas" },
  { id: "recusada", label: "Recusadas" },
  { id: "todas", label: "Todas" },
];
