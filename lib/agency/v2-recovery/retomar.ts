// "RETOMAR PROCESSO" — idempotente, exclusivo de PM/Diretor, por correlação,
// e SÓ dentro da própria casa.
//
// Marco 6 da V2. O 05: "botão Retomar processo exclusivo de PM/Diretor,
// idempotente; reprocessamento por correlation_id, nunca por duplicação
// manual". Retomar NÃO cria efeito novo: devolve à fila os efeitos desta
// correlação que morreram ou falharam — as MESMAS linhas, as MESMAS chaves de
// idempotência. Rodar duas vezes seguidas: a segunda não encontra nada para
// devolver, e devolver nada é sucesso.
//
// ─── POR QUE O RECORTE DE WORKSPACE ENTROU (15/08/2026) ──────────────────────
//
// `correlationId` chegava do CORPO da requisição e ia direto à consulta: um PM
// autenticado de qualquer casa devolvia à fila os efeitos de qualquer outra,
// bastando saber (ou adivinhar) a correlação. Hoje o dano é ZERO porque o
// `OutboxV2` não tem escritor de produção nem executor de saída — o defeito
// está inerte, não ausente. Trava posta agora custa três linhas; posta no dia
// em que o primeiro efeito com consequência externa nascer, custa um incidente.
//
// `OutboxV2` NÃO TEM coluna de dono, e pôr uma é migration (outra frente). A
// posse é derivada do rastro que já existe: `ExecucaoV2` tem `clienteId`, e
// `Client` tem `workspaceId`. Sem rastro, não retoma — fecha por omissão.
//
// ⚠️ O RECORTE VALE NAS DUAS CONSULTAS. Filtrar só a leitura e depois atualizar
// por `id` deixa aberta a janela entre uma e outra: meia trava parece inteira.
// Por isso `devolverParaFila` recebe a correlação e a usa no `where`, junto do
// id — a escrita repete o predicado da leitura em vez de confiar nela.

import type { PerfilOrganizacional } from "@/lib/agency/organizacao/autoridade";

export interface ArmazemDeRetomada {
  /**
   * Existe rastro desta correlação DENTRO deste workspace?
   *
   * Fecha por omissão: correlação sem nenhuma execução com cliente desta casa
   * devolve `false`. "Não sei de quem é" nunca vira "pode".
   */
  correlacaoDoWorkspace(correlationId: string, workspaceId: string): Promise<boolean>;
  /** Efeitos failed/dead desta correlação. */
  efeitosParaRetomar(correlationId: string): Promise<string[]>;
  /**
   * Volta os efeitos para pending com tentativa zerada e próxima tentativa =
   * agora. A correlação vem junto e É PARA SER USADA no filtro da escrita —
   * ver o aviso do cabeçalho.
   */
  devolverParaFila(correlationId: string, ids: string[], agora: Date): Promise<void>;
  /** O rastro da retomada — quem, quando, o quê. */
  registrarRetomada(correlationId: string, atorId: string, efeitos: number, agora: Date): Promise<void>;
}

export type ResultadoDaRetomada =
  | { ok: true; efeitosDevolvidos: number }
  | { ok: false; motivo: string };

/** PM/Diretor: autoridade de direção, ou perfil que escreve em project-management. */
export function podeRetomar(perfil: PerfilOrganizacional): boolean {
  if (perfil.autoridade === "master" || perfil.autoridade === "director") return true;
  return perfil.departamentos.includes("project-management" as never);
}

export async function retomarProcesso(
  correlationId: string,
  perfil: PerfilOrganizacional,
  atorId: string,
  workspaceId: string,
  armazem: ArmazemDeRetomada,
  agora: Date,
): Promise<ResultadoDaRetomada> {
  if (!podeRetomar(perfil)) {
    return { ok: false, motivo: "Retomar processo é ação de PM/Diretor." };
  }
  if (!correlationId.trim()) {
    return { ok: false, motivo: "correlationId é obrigatório — retomada sem correlação é chute." };
  }
  if (!workspaceId.trim()) {
    return { ok: false, motivo: "workspaceId é obrigatório — retomada sem casa é retomada de qualquer casa." };
  }
  // A posse vem ANTES da consulta e antes do registro: correlação que não é
  // desta casa não deixa nem rastro de tentativa no processo alheio.
  const daCasa = await armazem.correlacaoDoWorkspace(correlationId, workspaceId);
  if (!daCasa) {
    return { ok: false, motivo: "Esta correlação não tem rastro nesta casa." };
  }
  const ids = await armazem.efeitosParaRetomar(correlationId);
  if (ids.length > 0) {
    await armazem.devolverParaFila(correlationId, ids, agora);
  }
  // Retomada registrada MESMO quando devolveu zero: "tentei retomar e não
  // havia nada" é informação de operação, não ruído.
  await armazem.registrarRetomada(correlationId, atorId, ids.length, agora);
  return { ok: true, efeitosDevolvidos: ids.length };
}
