// AS CHAVES QUE SÃO DO GATEWAY, E QUE O CHAMADOR NÃO PREENCHE — nunca.
//
// ─── A MEDIÇÃO QUE ORIGINOU ESTE ARQUIVO (auditoria independente, 30/08/2026) ─
//
// O dossiê era a porta dos fundos da validação. Pela porta da FRENTE, uma
// cobrança inventada (`cobrancas: [{motivo: "INVENTADO"}]`) era recusada com
// 400 pelo conferidor. Pela porta dos FUNDOS, a mesma informação escrita em
// `dossie["cobrancas_da_varredura"]` atravessava inteira: `despacho.ts` só
// sobrescrevia aquela chave SE houvesse conteúdo validado, e sem conteúdo o
// valor do chamador sobrevivia. `lerCobrancas()` então o consumia como se
// fosse apuração.
//
// O resultado medido: HTTP 200, e o artefato AFIRMANDO
//
//   situacao: "ATRASADO — 1 ponto(s) parado(s); o mais antigo há 9999h com juridico"
//   motivo:   "FRAUDE-INVENTADA-PELO-CHAMADOR: pague agora"
//
// com agente, tarefa e prazo nomeados para uma cobrança que nunca existiu.
// `realizar-sintetico.ts` afirma, em letra de comentário, que "a situação vem
// da varredura REAL, não de adjetivo" — e isso era falso. Comentário não
// conserta nada; por isso o conserto é este arquivo mais duas travas de código.
//
// ─── POR QUE UM MÓDULO SÓ PARA AS CHAVES ───────────────────────────────────
//
// Porque a lista precisa ser lida por TRÊS lugares que não podem se importar em
// círculo: `contrato.ts` (que RECUSA o chamador que mandar uma delas no
// dossiê), `despacho.ts` (que as SOBRESCREVE incondicionalmente, mesmo quando
// o valor é vazio) e `realizar-sintetico.ts` (que as LÊ). Deixar a lista em
// qualquer um dos três criaria ciclo de import ou uma cópia — e uma cópia é
// como a quinta chave, um dia, nasce protegida em dois lugares e aberta no
// terceiro.
//
// ─── AS DUAS TRAVAS, E POR QUE SÃO DUAS ────────────────────────────────────
//
//   1. `contrato.ts` RECUSA o pedido cujo dossiê traga qualquer uma destas
//      chaves. Recusar (e não ignorar) diz na cara que essa escolha não existe
//      — ignorar deixaria quem chama achando que escolheu.
//   2. `despacho.ts` monta as entradas DESCARTANDO estas chaves do dossiê e
//      escrevendo as suas por cima, SEMPRE, inclusive com valor vazio. Esta é
//      a que vale contra código, não contra chamador: `despachar` é chamado
//      direto por teste e por qualquer futuro chamador interno que não passe
//      pelo conferidor.
//
// A metade que já funcionava e virou o modelo: `cliente_ficticio` e
// `pergunta_do_diretor_geral` já eram sobrescritas incondicionalmente. O
// conserto foi estender esse desenho às outras, e transformar "as quatro que
// alguém lembrou" em "a lista, e o código percorre a lista".

/** A pergunta do Diretor Geral, como ela chegou no pedido conferido. */
export const CHAVE_PERGUNTA = "pergunta_do_diretor_geral";
/** O fio: turnos do pedido MAIS as execuções que o banco conhece. */
export const CHAVE_HISTORICO = "historico_da_conversa";
/** A saída da varredura REAL do PM — nunca um texto que o chamador digitou. */
export const CHAVE_COBRANCAS = "cobrancas_da_varredura";
/** O nome do cliente RESOLVIDO pelo gateway, no banco. */
export const CHAVE_CLIENTE = "cliente_ficticio";
/**
 * ⭐ Se a leitura do fio funcionou. Nasceu do defeito A-6 da mesma auditoria:
 * `antecedentes` falhando virava 200 com `turnos_anteriores: 0` e um `catch`
 * vazio — quem lia não tinha como distinguir "o fio está vazio" de "eu não
 * consegui ler o fio". Duas coisas muito diferentes com a mesma aparência.
 */
export const CHAVE_FIO = "leitura_do_fio";

/**
 * A LISTA. É ela que o código percorre — em nenhum dos três lugares as chaves
 * aparecem escritas à mão uma a uma, justamente para que acrescentar a sexta
 * chave não deixe um dos lados para trás.
 */
export const CHAVES_RESERVADAS_DO_GATEWAY: readonly string[] = [
  CHAVE_PERGUNTA,
  CHAVE_HISTORICO,
  CHAVE_COBRANCAS,
  CHAVE_CLIENTE,
  CHAVE_FIO,
];

export function chaveEReservada(chave: string): boolean {
  return CHAVES_RESERVADAS_DO_GATEWAY.includes(chave);
}

/** O valor de `CHAVE_FIO` quando o banco respondeu. */
export const FIO_LIDO = "ok";
/** O prefixo do valor de `CHAVE_FIO` quando o banco NÃO respondeu. */
export const FIO_ILEGIVEL = "FALHOU";
