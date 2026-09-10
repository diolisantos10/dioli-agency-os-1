// A CASA DIZ QUE JÁ CONTATOU — o ato que tira o lead da fila de dívida, sem
// apagá-lo da história.
//
// ═══ O QUE FALTAVA, MEDIDO EM 29/08/2026 (NÃO PRESUMIDO) ════════════════════
//
// `POST /api/agency/conversas-sem-pedido/atribuir` existe e funciona, mas
// exige um `Client` que já exista (`atribuir-conversa-orfa.ts:116-121` recusa
// com `cliente_inexistente`). O lead a quem a casa PROMETEU contato
// (`prometidoEm`, ver `promessa-de-contato.ts`) é um visitante anônimo — ele
// não tem `Client`, e atribuir é o ato certo para OUTRO caso (a conversa de um
// cliente já conhecido), não para este.
//
// Nada nesta casa marca "um humano contatou esta pessoa". Prova do nada:
//
//   grep -rn "contatadoEm\|contatadoPor\|marcarComoContatado\|contatado" \
//     lib app --include=*.ts --include=*.tsx
//
// devolvia VAZIO antes deste arquivo. A única saída da fila era APAGAR o
// rastro (`resolverRastroPeloFio`), e só em dois caminhos: o briefing virar
// pedido, e a promoção automática de parceiro. Não havia saída para "já falei
// com a pessoa" — e um humano que liga ou escreve para um visitante que ainda
// não virou cliente não tem ONDE registrar que o fez.
//
// ═══ A RÉGUA QUE ESTE MÓDULO IMPLEMENTA ═════════════════════════════════════
//
// *Marcar como contatado é registrar um ato que JÁ ACONTECEU por fora desta
// casa.* Este módulo não liga para ninguém, não manda e-mail, não notifica —
// ele CARIMBA que um humano já fez isso. A régua de "declarar, não deduzir"
// de `atribuir-conversa-orfa.ts` vale aqui do mesmo jeito: quem contatou
// entra pela SESSÃO, nunca pelo corpo da requisição.
//
// ═══ AS TRAVAS, E POR QUE CADA UMA ══════════════════════════════════════════
//
//  1. **`fio` e `contatadoPor` vêm de fora** — o `contatadoPor` da SESSÃO,
//     nunca do corpo. A mesma lei de `atribuidoPor`.
//  2. **O rastro tem de existir, e no mesmo workspace** — a fronteira de
//     inquilino que o resto da casa defende.
//  3. **IDEMPOTENTE.** Já contatado → devolve `jaExistia: true`, preserva a
//     data (e o autor) do ato ORIGINAL, e NÃO reescreve — a primeira vez é a
//     que vale, a mesma lei de `prometidoEm`.
//  4. ⛔ **NÃO APAGA O RASTRO.** "Contatado" é um ESTADO do rastro, não um
//     motivo para sumir com ele. A conversa continua listável, com a história
//     inteira — inclusive para quem quiser ver quando e por quem foi
//     contatada. Apagar aqui repetiria o defeito que este módulo existe para
//     corrigir: um lead que passou pela casa e não deixou vestígio.
//  5. **FAIL-CLOSED em toda leitura.** Banco fora do ar → recusa com motivo,
//     jamais um "ok" otimista. *"Não sei" nunca vira "pode ir".*

import { prisma } from "@/lib/db/client";
import { TIPO_CONVERSA_SEM_PEDIDO, lerCargaDoRastro, type CargaDoRastro } from "@/lib/agency/comercial/conversa-sem-pedido";

/** Mesmo teto da carga do rastro — o corte tem de ser o mesmo dos dois lados,
 *  senão um JSON truncado vira ilegível para o próximo leitor. */
const TETO_DA_CARGA = 20_000;

export type RecusaDoContato =
  | "dados_incompletos"
  | "rastro_inexistente"
  | "rastro_ilegivel"
  | "leitura_falhou"
  | "escrita_falhou";

export type ResultadoDoContato =
  | { ok: true; contatadoEm: string; contatadoPor: string; jaExistia: boolean }
  | { ok: false; recusa: RecusaDoContato; motivo: string };

function recusar(recusa: RecusaDoContato, motivo: string): ResultadoDoContato {
  return { ok: false, recusa, motivo };
}

const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/**
 * MARCA UM RASTRO COMO CONTATADO — o ato declarado pela casa.
 *
 * Nunca lança: é chamada de dentro de uma rota, e o operador do outro lado
 * precisa de um motivo em texto, não de um 500 sem explicação.
 */
export async function marcarConversaComoContatada(input: {
  /** O fio (`sdr:...`), como a lista de conversas paradas o mostra. */
  fio: string;
  /** O `userId` da SESSÃO. ⛔ NUNCA do corpo da requisição. */
  contatadoPor: string;
  /** O workspace da SESSÃO. A fronteira de inquilino. */
  workspaceId: string;
  agora?: Date;
}): Promise<ResultadoDoContato> {
  const fio = texto(input.fio);
  const contatadoPor = texto(input.contatadoPor);
  const workspaceId = texto(input.workspaceId);
  const agora = input.agora ?? new Date();

  // Nenhum campo com valor padrão. Padrão em campo de testemunha é a forma
  // silenciosa de dar o ato a quem não o fez.
  if (!fio || !contatadoPor || !workspaceId) {
    return recusar("dados_incompletos", "Informe o fio da conversa. O autor sai da sessão.");
  }
  // `fioDaConversa` devolve `sdr:sem-sessao` para entrada vazia — um fio
  // coletivo, que não é conversa de ninguém em particular.
  if (fio.endsWith("sem-sessao")) {
    return recusar("rastro_inexistente", "Este fio não identifica uma conversa: é o balde das sessões sem id.");
  }

  try {
    // ── 1. O RASTRO EXISTE, E É DESTA CASA ───────────────────────────────
    const linha = await prisma.activityEvent.findFirst({
      where: { type: TIPO_CONVERSA_SEM_PEDIDO, clientId: fio, workspaceId },
      select: { id: true, message: true },
    });
    if (!linha) {
      return recusar("rastro_inexistente", "Não há conversa parada com este fio neste workspace.");
    }

    const carga = lerCargaDoRastro(linha.message);
    if (!carga) {
      // Carga ilegível é "não sei o que estou reescrevendo". Sobrescrever
      // seria apagar o escopo do cliente — o próprio bem que o rastro existe
      // para guardar.
      return recusar("rastro_ilegivel", "O registro desta conversa está ilegível; não se reescreve o que não se lê.");
    }

    // ── 2. A PRIMEIRA MARCAÇÃO VALE ──────────────────────────────────────
    const jaContatadoEm = typeof carga.contatadoEm === "string" && carga.contatadoEm ? carga.contatadoEm : null;
    const jaContatadoPor = typeof carga.contatadoPor === "string" && carga.contatadoPor ? carga.contatadoPor : null;
    if (jaContatadoEm) {
      // Já marcado — nada muda, nem se for outro operador clicando de novo. O
      // ato ORIGINAL (data e autor) é preservado, e nada é reescrito no banco.
      return { ok: true, contatadoEm: jaContatadoEm, contatadoPor: jaContatadoPor ?? contatadoPor, jaExistia: true };
    }

    const contatadoEmIso = agora.toISOString();

    // ── 3. A ESCRITA: preserva TUDO que já estava, acrescenta só o ato ──
    // ⛔ NÃO É UM `resolverRastroPeloFio`. O rastro continua existindo — ele
    // muda de estado, não desaparece. Ver o cabeçalho deste arquivo.
    const novaCarga: CargaDoRastro = {
      ...carga,
      v: 5,
      contatadoEm: contatadoEmIso,
      contatadoPor,
    };
    await prisma.activityEvent.update({
      where: { id: linha.id },
      // ⚠️ `timestamp` NÃO é tocado, pela mesma razão de `atribuir-conversa-orfa.ts`:
      // ele significa "quando a conversa parou", e reordenar a fila pelo
      // trabalho da casa (em vez da espera do cliente) inverteria o que a
      // ordenação existe para medir.
      data: { message: JSON.stringify(novaCarga).slice(0, TETO_DA_CARGA) },
    });

    return { ok: true, contatadoEm: contatadoEmIso, contatadoPor, jaExistia: false };
  } catch (e) {
    // Leitura ou escrita que falha NÃO vira "ok". Sem esta linha, um banco
    // fora do ar devolveria sucesso e o operador iria embora achando que o
    // contato ficou registrado.
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[marcar-conversa-contatada] ${fio}: ${msg}`);
    return recusar("leitura_falhou", `Não foi possível concluir o registro: ${msg}`);
  }
}
