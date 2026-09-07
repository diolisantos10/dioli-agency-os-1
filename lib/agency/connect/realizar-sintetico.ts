// O TRABALHO EM MODO HOMOLOGAÇÃO — determinístico, offline, custo zero.
//
// ─── POR QUE O CONNECT NÃO CHAMA PROVEDOR DE IA, NUNCA ─────────────────────
//
// As proibições desta obra são travas, não preferências: **sem credencial
// real, sem cliente real, sem produção, sem mensagem real.** O adaptador de
// produção da casa (`esteira-assistida/adaptador-de-ia.ts`) chama `generate()`
// quando existe provedor configurado — e existe, em produção. Reusá-lo aqui
// deixaria a decisão de gastar chave paga para o AMBIENTE, e "não tinha chave
// na minha máquina" é sorte de ambiente, não trava (é o mesmo raciocínio que
// obrigou a `trava-de-saida.ts` a existir).
//
// Então esta é a implementação de `deps.realizar` do Connect, e ela é a única
// que a porta usa: sem rede, sem chave, `custoUsd` sempre 0.
//
// ─── E ELA SE DECLARA RASCUNHO ─────────────────────────────────────────────
//
// Lei 2 da casa: IA dá pensamento, não poder — sem provedor, DEGRADA para o
// rascunho rule-based, e **o rascunho diz o que é**. O campo `origem` do JSON
// devolvido carrega essa frase em toda saída. Nenhuma parte deste módulo
// tenta parecer um agente pensante: ele deriva o que dá para derivar das
// entradas e da própria ficha (SLA, métrica de sucesso, quem recebe o
// bastão), e o que não tem fonte sai como "não apurado" — ausência de
// informação não é informação (guardrail 1).

import { departamentoV2 } from "@/lib/agency/catalogo-v2/catalogo";
import { rascunhoRuleBased } from "@/lib/agency/esteira-assistida/adaptador-de-ia";
import type { ContextoDeExecucao, DependenciasDoExecutor } from "@/lib/agency/execucao-v2/executor";
import type { SpecOperacional } from "@/lib/agency/catalogo-v2/specs";
import type { Cobranca } from "@/lib/agency/pm/varredura";
import { FUNCAO_DO_PILOTO } from "./contrato";
import {
  CHAVE_CLIENTE,
  CHAVE_COBRANCAS,
  CHAVE_FIO,
  CHAVE_HISTORICO,
  CHAVE_PERGUNTA,
  FIO_ILEGIVEL,
} from "./chaves";

/**
 * As chaves com que o Connect acrescenta o seu próprio contexto às entradas da
 * ficha. Elas NÃO substituem as `entradas_obrigatorias` — são adicionais, e
 * viajam junto para o rastro (`ExecucaoV2.entradas`) porque a pergunta que
 * originou uma execução é parte do rastro dela.
 *
 * Elas MUDARAM DE CASA em 30/08/2026 (defeito A-3): moram em `chaves.ts`, onde
 * `contrato.ts` também as alcança para RECUSAR quem tentar preenchê-las pelo
 * dossiê. Ficam reexportadas aqui só para não quebrar quem já importava daqui.
 */
export { CHAVE_PERGUNTA, CHAVE_HISTORICO, CHAVE_COBRANCAS, CHAVE_CLIENTE, CHAVE_FIO };

export const ORIGEM_DO_RASCUNHO =
  "rule-based determinístico do Dioli Connect — homologação com dado sintético, sem provedor de IA e sem " +
  "credencial. Rascunho estruturado que se declara rascunho (Lei 2 da casa): a qualidade da prosa sobe " +
  "quando o dono configurar um provedor; o que este piloto prova é o acionamento e o rastro, não a eloquência.";

/**
 * ⚠️ A PRIMEIRA LINHA DE TEXTO DO ARTEFATO, EM PALAVRAS DE GENTE.
 *
 * Determinação do CEO (30/08/2026): "não apresente como comunicação final e
 * inteligente do gerente… o texto do artefato também". O campo `origem` já
 * dizia, mas dizia em jargão e no meio do JSON. Este aqui é a frase que alguém
 * lê sem precisar de contexto nenhum, e ela abre o artefato.
 */
export const AVISO_DE_RASCUNHO =
  "⚠️ RASCUNHO — NÃO É A COMUNICAÇÃO FINAL DO GERENTE. Este texto saiu de um motor de regras determinístico, " +
  "sem provedor de IA, em homologação com dado sintético. Não envie a cliente, não trate como resposta " +
  "pronta e não apresente como fala inteligente do gerente: ele prova que o acionamento aconteceu e ficou " +
  "com rastro, e mais nada.";

function lerCobrancas(contexto: ContextoDeExecucao): Cobranca[] {
  const bruto = contexto.entradas[CHAVE_COBRANCAS];
  if (!bruto) return [];
  try {
    const lista = JSON.parse(bruto) as unknown;
    return Array.isArray(lista) ? (lista as Cobranca[]) : [];
  } catch {
    return [];
  }
}

/**
 * A quem este gerente delega. Vem do CATÁLOGO, não de uma lista escrita à mão:
 * são as funções do próprio departamento, menos ele mesmo. Se um agente
 * operacional nascer amanhã, ele aparece aqui sem ninguém editar este arquivo.
 */
export function agentesOperacionais(spec: SpecOperacional): string[] {
  const dep = departamentoV2(spec.departamento);
  if (!dep) return [];
  return dep.funcoes.map((f) => f.id).filter((id) => id !== spec.funcao);
}

/**
 * Escolhe o agente para uma tarefa, de forma determinística e explicável:
 * quando a cobrança nomeia um departamento diferente do nosso, quem recebe é o
 * primeiro operacional da casa; a rotação por índice existe só para o gerente
 * não empilhar tudo em um agente só (que é o "inaceitável" do golden set da
 * própria ficha).
 */
function agenteDaVez(operacionais: string[], indice: number): string {
  if (operacionais.length === 0) return "sem agente operacional no departamento — o gerente executa e registra";
  return operacionais[indice % operacionais.length]!;
}

function iso(d: Date): string {
  return d.toISOString();
}

/**
 * O gerente respondendo pelo motor de regras: situação, motivo, próxima ação e
 * prazo — os quatro campos que o Diretor Geral pediu — mais a distribuição no
 * esquema que a própria ficha declara (`tarefas[]`, agente, prazo, critério de
 * aceite, o que falta).
 */
export function respostaDoGerente(
  spec: SpecOperacional,
  contexto: ContextoDeExecucao,
  agora: Date,
): { saida: string; custoUsd: number } {
  const cobrancas = lerCobrancas(contexto);
  const operacionais = agentesOperacionais(spec);
  const prazo = new Date(agora.getTime() + spec.sla_horas * 3_600_000);

  // A situação vem da varredura REAL, não de adjetivo. Sem cobrança apurada, a
  // resposta diz "não apurado" — e nunca "está tudo em dia", que seria concluir
  // uma negação do silêncio.
  //
  // ⚠️ Até 30/08/2026 esta frase era FALSA, e a auditoria provou: a chave
  // `cobrancas_da_varredura` podia ser preenchida pelo chamador via `dossie`, e
  // então "ATRASADO — 1 ponto(s) parado(s)… há 9999h com juridico" saía com a
  // autoridade de uma apuração para uma cobrança que nunca existiu. O conserto
  // não mora neste arquivo — mora em `chaves.ts`, `contrato.ts` e
  // `despacho.ts`, porque comentário não conserta nada. Aqui a frase voltou a
  // ser verdadeira porque o que chega em `contexto.entradas` já é só do gateway.
  const pior = cobrancas[0];
  const situacao = pior
    ? `ATRASADO — ${cobrancas.length} ponto(s) parado(s); o mais antigo há ${pior.horasParado}h com ${pior.departamento}`
    : "NÃO APURADO — nenhuma cobrança da varredura foi enviada com este despacho; sem varredura não se afirma que está em dia";

  const motivo = pior
    ? `${pior.motivo}: ${pior.pedido}`
    : "sem cobrança no dossiê, o motivo do atraso não tem fonte — e o que não tem fonte não ganha valor aqui";

  const tarefas = (cobrancas.length > 0 ? cobrancas : [null]).map((c, i) => ({
    tarefa: c
      ? `Destravar ${c.referencia} (${c.motivo}, ${c.horasParado}h parado) e devolver o aceite ou o impedimento por escrito`
      : `Apurar a situação de "${contexto.entradas[CHAVE_PERGUNTA] ?? "a demanda recebida"}" e devolver com dono e prazo`,
    agente_de_cada_uma: agenteDaVez(operacionais, i),
    prazo: iso(prazo),
    criterio_de_aceite: spec.metrica_sucesso,
  }));

  const proxima_acao = `${tarefas[0]!.agente_de_cada_uma} assume "${tarefas[0]!.tarefa}" e devolve ao Gerente Geral até ${iso(prazo)} (SLA de ${spec.sla_horas}h da ficha).`;

  const oQueFalta: string[] = [];
  // A pergunta é "houve varredura?", e a resposta é a LISTA, não a presença da
  // chave: desde que o gateway passou a escrever `cobrancas_da_varredura`
  // sempre (inclusive `"[]"`), "a chave existe" deixou de significar "veio
  // varredura". Ler a presença aqui faria a porta parar de avisar exatamente
  // quando não há apuração nenhuma — o silêncio virando aprovação de novo.
  if (cobrancas.length === 0) oQueFalta.push("a varredura do PM não veio no dossiê");
  if (operacionais.length === 0) oQueFalta.push("o departamento não tem agente operacional para receber a delegação");
  // ⚠️ Gatilho é DECLARAÇÃO de quem chamou, não apuração desta casa — e o
  // texto vem de fora. Ele fica no artefato porque torna a porta mais estrita
  // (o motor escala com ele), mas sai rotulado: nada aqui foi conferido.
  for (const g of contexto.gatilhosDetectados ?? []) {
    oQueFalta.push(`gatilho humano DECLARADO por quem chamou (não conferido por esta casa): ${g}`);
  }

  const historico = contexto.entradas[CHAVE_HISTORICO];

  // ⭐ A-6: "o fio está vazio" e "não consegui ler o fio" param de ter a mesma
  // cara. Quando a leitura falhou, `turnos_anteriores` é `null` — não `0` —,
  // o motivo viaja junto, e a falta entra na lista do que falta.
  const marcaDoFio = contexto.entradas[CHAVE_FIO] ?? "";
  const fioIlegivel = marcaDoFio.startsWith(FIO_ILEGIVEL);
  if (fioIlegivel) oQueFalta.push(`o fio não pôde ser lido — ${marcaDoFio}`);

  return {
    saida: JSON.stringify(
      {
        // As três primeiras chaves do artefato existem só para ele não poder
        // ser confundido com a fala final do gerente — nem por máquina
        // (`rascunho`), nem por tela (`natureza`), nem por gente (`aviso`).
        rascunho: true,
        natureza: "RASCUNHO",
        aviso: AVISO_DE_RASCUNHO,
        origem: ORIGEM_DO_RASCUNHO,
        modo: contexto.modo,
        sintetico: contexto.sintetico === true,
        funcao: spec.funcao,
        departamento: spec.departamento,
        cliente: contexto.entradas[CHAVE_CLIENTE] ?? null,
        pergunta_respondida: contexto.entradas[CHAVE_PERGUNTA] ?? null,
        situacao,
        motivo,
        proxima_acao,
        prazo: iso(prazo),
        tarefas,
        agente_de_cada_uma: tarefas.map((t) => t.agente_de_cada_uma),
        criterio_de_aceite: spec.metrica_sucesso,
        o_que_falta: oQueFalta.length > 0 ? oQueFalta : ["nada declarado"],
        fio: {
          lido: !fioIlegivel,
          turnos_anteriores: fioIlegivel ? null : historico ? historico.split("\n").filter(Boolean).length : 0,
          leitura: fioIlegivel ? marcaDoFio : "ok",
          historico_recebido: historico || null,
        },
        entrega_para: spec.handoff.entrega_para,
      },
      null,
      2,
    ),
    custoUsd: 0,
  };
}

/**
 * O `realizar` do Connect. Uma função com composição própria (hoje só o
 * gerente do piloto) usa a dela; qualquer outra cai no rascunho genérico que a
 * casa já tem — reuso, não uma segunda implementação do mesmo fallback.
 */
export function realizarSinteticoDoConnect(agora: () => Date): DependenciasDoExecutor["realizar"] {
  return async (spec, contexto) => {
    if (spec.funcao === FUNCAO_DO_PILOTO) return respostaDoGerente(spec, contexto, agora());
    return rascunhoRuleBased(spec, contexto, ORIGEM_DO_RASCUNHO);
  };
}
