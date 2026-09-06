// ─── MEDIÇÃO DO ENCAIXE — mede `encaixe.ts` contra o 99Freelas real ─────────
//
// Despacho: docs/celula-prospeccao/despachos/2026-09-06-medir-o-encaixe.md
//
// ── ISTO NÃO CONSERTA NADA ───────────────────────────────────────────────────
// `encaixe.ts` entrou em 06/09/2026 e já muda dinheiro (decide se a casa gasta
// IA e se a proposta existe). Ele erra por palavra solta ("Criação de
// roteiros para vídeos" casou em "vídeo" e sugeriu edição, não roteiro). O
// erro caro é o FALSO-NEGATIVO (projeto bom eliminado), que é invisível por
// construção — projeto eliminado não deixa proposta para ninguém conferir.
// Por isso a ordem é: medir primeiro, trocar o critério depois, nunca ao
// mesmo tempo. Este arquivo é a lógica PURA e testável dessa medição; quem
// busca HTML de verdade é `scripts/medir-encaixe-99freelas.mts`.
//
// ── POR QUE ISTO CHAMA `eliminar()` E TAMBÉM `encaixaNaCasa()` ─────────────
// `eliminar()` já chama `encaixaNaCasa()` por dentro, mas só DEPOIS de
// descartar os motivos de PLATAFORMA (trabalho acadêmico, teste grátis,
// comissionado, vaga CLT) — projeto eliminado por esses motivos nunca chega a
// ser avaliado pelo encaixe, então `corte.servicosPossiveis` fica `[]` para
// ele. Só o que `eliminar()` devolve não basta para responder "esta ficha
// pergunta": *o `encaixe.ts` acertaria ou erraria este projeto, mesmo os que a
// plataforma já reprovaria por outro motivo?* Por isso `medirProjeto` chama
// `encaixaNaCasa()` de novo, sempre, e guarda o resultado à parte
// (`encaixariaIndependenteDaPlataforma`) — dado de auditoria, não usado no
// veredito de três baldes abaixo.
//
// ── OS TRÊS BALDES DO VEREDITO SÃO MUTUAMENTE EXCLUSIVOS ────────────────────
// "encaixa" / "não encaixa" / "eliminado por plataforma" somam sempre o
// total: é a MESMA ordem que `eliminar()` já aplica em produção (plataforma
// primeiro, encaixe depois), só que aqui exposta como três contagens em vez
// de um `boolean` de tudo-ou-nada. Um projeto eliminado por descrição curta
// demais SÓ chega a essa checagem depois de o encaixe já ter dito "sim" (é a
// ordem escrita em `eliminar()`), então ele entra no balde "encaixa" — a
// descrição curta é um motivo de eliminação diferente, registrado à parte em
// `motivoDeEliminacao`, não uma quarta categoria de veredito.
//
// ── NÃO REIMPLEMENTA A LISTA DE MOTIVOS DE PLATAFORMA ───────────────────────
// `MOTIVOS_DE_ELIMINACAO` é privada a `agente.ts`, e esta ficha proíbe editar
// aquele arquivo. `categorizarMotivoDeEliminacao` lê o TEXTO que `eliminar()`
// já produz — o único contrato público disponível sem duplicar a lógica de
// lá. Se a redação de `eliminar()` mudar um dia, esta função para de
// reconhecer o motivo e devolve "desconhecida", que o veredito trata como
// FAIL-CLOSED (nunca conta como "encaixa" por omissão) — nunca silenciosa.

import { extrairDeTexto } from "@/lib/agency/comercial/oportunidade";
import { eliminar } from "@/lib/marketplaces/99freelas/agente";
import { encaixaNaCasa } from "@/lib/marketplaces/99freelas/encaixe";
import { paraProjetoBruto, type ProjetoColetado } from "@/lib/marketplaces/99freelas/coleta";

export type Veredito = "encaixa" | "nao_encaixa" | "eliminado_por_plataforma";

export type CategoriaDeEliminacao =
  | "plataforma"
  | "fora_do_escopo"
  | "descricao_incompleta"
  | "desconhecida";

/**
 * Classifica o `motivo` de `Eliminacao.motivo` (`eliminar()`, em `agente.ts`).
 * Ver o cabeçalho do arquivo — isto lê texto, não reimplementa regra.
 */
export function categorizarMotivoDeEliminacao(motivo: string | null): CategoriaDeEliminacao | null {
  if (!motivo) return null;
  if (motivo.includes("reprovado pela própria plataforma")) return "plataforma";
  if (motivo.includes("fora do que a Dioli entrega hoje")) return "fora_do_escopo";
  if (motivo.includes("descrição curta demais")) return "descricao_incompleta";
  return "desconhecida";
}

export interface ProjetoMedido {
  url: string;
  titulo: string;
  categoriaDeclarada: string | null;
  veredito: Veredito;
  /** Os ids que `encaixaNaCasa` achou compatíveis — vazio quando o veredito
   *  não é "encaixa" (herdado de `corte.servicosPossiveis`, que já é `[]`
   *  nesses casos). */
  servicosPossiveis: string[];
  /** `null` quando o projeto NÃO foi eliminado. */
  motivoDeEliminacao: string | null;
  /** Ver o cabeçalho do arquivo — dado de auditoria, não usado no veredito. */
  encaixariaIndependenteDaPlataforma: boolean;
}

/**
 * O núcleo da medição: um `ProjetoColetado` (o que `extrairProjeto`, de
 * `coleta.ts`, devolve) vira uma linha medida. Determinística, sem IA, sem
 * rede — o mesmo caminho que `agente.ts` percorre no passo 1 de
 * `processarProjeto`, só que aqui exposto para leitura, não para decidir nada.
 */
export function medirProjeto(p: ProjetoColetado): ProjetoMedido {
  const bruto = paraProjetoBruto(p);
  const campos = extrairDeTexto(bruto.conteudoDeTerceiro);
  const corte = eliminar(bruto.conteudoDeTerceiro, campos);
  const encaixeIndependente = encaixaNaCasa({
    titulo: p.titulo,
    descricao: p.descricao,
    categoriaDeclarada: p.categoria,
  });

  const categoria = corte.eliminado ? categorizarMotivoDeEliminacao(corte.motivo) : null;
  const veredito: Veredito =
    categoria === "plataforma"
      ? "eliminado_por_plataforma"
      : categoria === "fora_do_escopo"
        ? "nao_encaixa"
        : categoria === "desconhecida"
          ? "nao_encaixa" // fail-closed: eliminado por um motivo que não reconhecemos — nunca conta como "encaixa" por omissão.
          : "encaixa"; // não eliminado, ou eliminado só por "descricao_incompleta" — nos dois casos o encaixe já disse "sim".

  return {
    url: p.url,
    titulo: p.titulo,
    categoriaDeclarada: p.categoria,
    veredito,
    servicosPossiveis: corte.servicosPossiveis,
    motivoDeEliminacao: corte.eliminado ? corte.motivo : null,
    encaixariaIndependenteDaPlataforma: encaixeIndependente.encaixa,
  };
}

export interface ResumoDaMedicao {
  total: number;
  encaixaram: number;
  naoEncaixaram: number;
  eliminadosPorPlataforma: number;
  /** 0 a 100, uma casa decimal. `0` quando `total` é `0` — nunca `NaN`. */
  percentualQueEncaixou: number;
  porCategoriaDeclarada: Record<string, number>;
}

const SEM_CATEGORIA_DECLARADA = "sem categoria declarada";

/**
 * As contagens que o resumo do script imprime. Pura: recebe qualquer lista de
 * itens já medidos (real ou fabricada) — é o que permite ao teste provar as
 * duas metades (amostra com mistura de veredito, e amostra vazia) sem tocar
 * em `medirProjeto` nem em HTML nenhum.
 */
export function resumirMedicao(
  itens: readonly Pick<ProjetoMedido, "veredito" | "categoriaDeclarada">[],
): ResumoDaMedicao {
  const resumo: ResumoDaMedicao = {
    total: itens.length,
    encaixaram: 0,
    naoEncaixaram: 0,
    eliminadosPorPlataforma: 0,
    percentualQueEncaixou: 0,
    porCategoriaDeclarada: {},
  };

  for (const item of itens) {
    if (item.veredito === "encaixa") resumo.encaixaram++;
    else if (item.veredito === "nao_encaixa") resumo.naoEncaixaram++;
    else resumo.eliminadosPorPlataforma++;

    const chave = item.categoriaDeclarada ?? SEM_CATEGORIA_DECLARADA;
    resumo.porCategoriaDeclarada[chave] = (resumo.porCategoriaDeclarada[chave] ?? 0) + 1;
  }

  // Divisão só depois do loop, e só quando há total — sem isto, amostra vazia
  // vira `0/0 = NaN` impresso na tela do CEO.
  resumo.percentualQueEncaixou =
    resumo.total === 0 ? 0 : Math.round((resumo.encaixaram / resumo.total) * 1000) / 10;

  return resumo;
}
