// despertador.ts — O RELÓGIO DA AGÊNCIA. É o que a faz trabalhar às 3 da manhã.
//
// O problema que ele resolve: a esteira inteira estava construída e correta, mas
// só andava quando alguém cutucava. Cliente aprovava a direção no domingo à
// noite e a produção esperava segunda; uma falha momentânea da IA derrubava uma
// entrega e nada nunca re-tentava; o aviso de WhatsApp ficava na fila para
// sempre. Uma agência que só trabalha quando tem gente olhando não é automática.
//
// POR QUE DENTRO DO APP, e não um cron externo:
// Um agendador externo (Railway cron, GitHub Action, cron-job.org) é mais uma
// peça para configurar à mão, mais um segredo para vazar e mais um lugar onde
// "está no ar?" tem resposta diferente da do app. Aqui o relógio SOBE JUNTO com
// o deploy: se a agência está no ar, o relógio está rodando. Não há estado
// intermediário onde o sistema parece vivo e não é.
//
// O QUE O TORNA SEGURO RODAR SOZINHO:
//   • O motor de produção é idempotente — quem já entregou é pulado.
//   • Há trava anti-concorrência de 10 min no próprio projeto.
//   • Cada passada é limitada (MAX_POR_RODADA) — nunca vira enxurrada.
//   • Erro numa tarefa não derruba as outras nem o servidor.
//
// Desligar: DESPERTADOR=off nas variáveis de ambiente.

import { prisma } from "@/lib/db/client";
import { runProjectExecution } from "@/lib/agency/execution/run-execution";
import { dispatchWhatsAppNotifications } from "@/lib/integrations/meta/notifications";
import { destravarPacote, pacotesTravados, reauditarSemArbitro } from "@/lib/agency/esteira/pacote-travado";
import { apresentarPacotesProntos } from "@/lib/agency/esteira/pacote-travado";
import { publicarAgendados } from "@/lib/agency/esteira/publicacao";
import { virarOsMesesVencidos } from "@/lib/agency/esteira/mes";
import { produzirArtesPendentes } from "@/lib/agency/execution/artes";
import { retratoDoPortao } from "@/lib/agency/financeiro/vigia-do-portao";
import { guardarAVerba } from "@/lib/agency/esteira/trafego";
import { cuidarDasAvaliacoes } from "@/lib/agency/esteira/avaliacoes";
import { responderMensagensDeClientes } from "@/lib/agency/esteira/pm-responde";
import { entregarOrcamentosPendentes } from "@/lib/agency/esteira/orcamento-do-briefing";
import { cobrarAFila } from "@/lib/agency/esteira/fila-que-se-cobra";
import { resumoDoPortao } from "@/lib/agency/comercial/o-que-espera-no-portao";
import { cobrarPedidosEsquecidos } from "@/lib/agency/esteira/pedidos";
import { fazerBackup, estadoDoBackup } from "@/lib/agency/backup";
import { registrarBatida, type FalhaDaRodada, type EstadoDaRodada } from "@/lib/agency/pulso";
import { vigiarAMadrugada } from "@/lib/agency/vigia-da-madrugada";
import { propostasParadas, apenasNaoEntregues, fraseDaParada, MINUTOS_DE_PACIENCIA } from "@/lib/agency/esteira/proposta-parada";

/** De quanto em quanto tempo a agência olha se tem trabalho parado. */
const INTERVALO_MS = Number(process.env.DESPERTADOR_INTERVALO_MS ?? 5 * 60_000);
/** Espera antes da primeira batida — deixa o servidor terminar de subir. */
const ATRASO_INICIAL_MS = 30_000;
/** Teto por rodada: recuperar 5 projetos de cada vez é recuperação; recuperar
 *  200 é uma enxurrada de chamadas de IA que ninguém pediu. */
const MAX_POR_RODADA = 5;
/** Depois de tantas tentativas, o projeto para de ser re-tentado sozinho — algo
 *  ali precisa de gente, e insistir para sempre só queima dinheiro de IA. */
const MAX_TENTATIVAS = 5;
/** "running" por mais que isto = o processo morreu no meio. */
const TRAVADO_MS = 10 * 60_000;

let ligado = false;

/**
 * O QUE JÁ FOI DITO — a memória que impede o log de repetir estado (24/08/2026).
 *
 * Vive no processo de propósito: se o container reinicia, o estado é anunciado
 * de novo, e isso é CERTO — o log novo começa do zero e quem o ler precisa
 * saber o que está valendo. O que não pode é a mesma frase a cada 5 minutos.
 */
let estadosJaAnunciados: string[] = [];

/**
 * Compara o estado de agora com o de antes. Função PURA para poder ser provada
 * sem relógio, sem banco e sem servidor.
 *
 * Só o que MUDA vira linha de log: o que começou e o que terminou. O que
 * continua igual não vira nada — já foi dito, e continua respondendo em
 * `/api/pulso`.
 */
export function transicaoDeEstado(
  anteriores: readonly string[],
  atuais: readonly string[],
): { comecaram: string[]; terminaram: string[] } {
  const antes = new Set(anteriores);
  const agora = new Set(atuais);
  return {
    comecaram: [...agora].filter((x) => !antes.has(x)),
    terminaram: [...antes].filter((x) => !agora.has(x)),
  };
}

function log(msg: string): void {
  console.log(`[despertador] ${msg}`);
}

/** Nome da variável que abre as rotas de apagar a produção inteira. Vive aqui
 *  como constante nomeada, e não espalhada em string solta, porque é a MESMA
 *  variável que as rotas de reset conferem — se o nome divergir de um lado, o
 *  alarme para de proteger e não avisa que parou de proteger. */
export const VARIAVEL_DO_RESET = "ALLOW_PRODUCTION_RESET";

/**
 * A DENÚNCIA DA PORTA DE RESET (16/08/2026).
 *
 * O Diretor perguntou: "alguém consegue apagar a produção inteira?" O
 * especialista `seguranca` mediu e respondeu: não é P0 confirmado por
 * exploração — é P0 de PROCESSO. A única coisa que separa "a rota de apagar
 * tudo existe" de "não existe" é esta variável de ambiente, e NINGUÉM
 * CONSEGUE LER O VALOR DELA DE FORA: `/api/admin/reset`, `/api/capacidades` e
 * `/api/piloto/diagnostico` respondem 401 para quem não tem sessão — certo
 * para a rota, péssimo para a auditoria, porque também esconde o estado de
 * quem deveria conferir. O único registro de que ela já esteve ligada é uma
 * frase em `docs/pendencias.md`, de 01/08/2026 — "foi ligada para a operação
 * e desligada em seguida" — e por ser TEXTO, não medição, envelheceu sem
 * ninguém perceber: quinze dias depois, ninguém sabe se ela está ligada
 * agora. Ela liga e desliga à mão, sem prazo, sem alerta — depende só de
 * alguém lembrar de desligar. E três rotas dependem dela (admin/reset,
 * admin/limpar-producao, e a família de reset-request).
 *
 * Função PURA de propósito — só olha o valor da env var, nada de banco, rede
 * ou relógio — para o teste poder provar as duas metades sem depender de
 * infraestrutura nenhuma.
 *
 * Retorna a mensagem de alarme (em português, para gente, com o que fazer) se
 * a porta estiver aberta; `null` se estiver fechada — e "fechada" inclui
 * ausente, vazia, "false", "1" ou qualquer coisa que não seja exatamente
 * "true". Alarme que dispara onde não há risco é alarme que quem lê desliga,
 * e aí ele para de proteger o caso real.
 */
// A assinatura pede só o que a função de fato usa — um mapa de nome para valor —
// e não `NodeJS.ProcessEnv` inteiro. Exigir o tipo cheio forçava todo chamador de
// teste a um `as NodeJS.ProcessEnv` sobre um objeto de uma chave só, e `as` que
// mente para o compilador é a porta por onde entra o erro que ninguém vê.
export function portaDeResetAberta(
  env: Record<string, string | undefined> = process.env,
): string | null {
  if ((env[VARIAVEL_DO_RESET] ?? "").trim() !== "true") return null;
  return (
    `A PORTA DE APAGAR A PRODUÇÃO INTEIRA ESTÁ ABERTA. A variável de ambiente ` +
    `${VARIAVEL_DO_RESET} está "true" e libera as rotas de reset ` +
    `(admin/reset, admin/limpar-producao, e a família reset-request). ` +
    `Se não há uma operação de reset em andamento AGORA, desligue ` +
    `${VARIAVEL_DO_RESET} nas variáveis de ambiente do Railway.`
  );
}

/**
 * Retoma a produção que parou sozinha:
 *   • travada em "running" há mais de 10 min (o processo caiu no meio);
 *   • "failed" com tentativas sobrando (falha momentânea de IA);
 *   • "pending" — a direção foi aprovada e o disparo não chegou a acontecer.
 */
async function retomarProducao(): Promise<number> {
  const travadoAntesDe = new Date(Date.now() - TRAVADO_MS);
  const candidatos = await prisma.project.findMany({
    where: {
      clientRequestId: { not: null },
      directionApprovedAt: { not: null },
      executionAttempts: { lt: MAX_TENTATIVAS },
      OR: [
        { executionStatus: "running", executionStartedAt: { lt: travadoAntesDe } },
        { executionStatus: "failed" },
        { executionStatus: "pending" },
      ],
    },
    orderBy: { executionRequestedAt: "asc" },
    take: MAX_POR_RODADA,
    select: { id: true },
  });

  let retomados = 0;
  for (const p of candidatos) {
    try {
      const r = await runProjectExecution(p.id);
      if (r.produced.length > 0 || r.status === "done") retomados++;
    } catch (err) {
      // Um projeto problemático não pode derrubar a rodada dos outros.
      log(`projeto ${p.id} falhou na retomada: ${err instanceof Error ? err.message : "erro"}`);
    }
  }
  return retomados;
}

/**
 * Destrava os pacotes que a própria Qualidade barrou.
 *
 * Sem isto o freio vira armadilha: a Qualidade reprova, o pacote não vai ao
 * cliente — correto — e ninguém nunca refaz a peça, porque o motor é
 * idempotente e pula quem já produziu. Foi o que aconteceu no primeiro projeto
 * real: 2 de 6 entregas reprovadas e o projeto parado, invisível.
 */
async function destravarPacotesBarrados(): Promise<number> {
  const travados = await pacotesTravados();
  let corrigidas = 0;
  // Poucos por rodada, e os mais antigos primeiro: refazer entrega é chamada de
  // IA cara, e um pacote travado não é urgência de segundos.
  for (const t of travados.filter((p) => !p.esperandoDecisao).slice(0, MAX_POR_RODADA)) {
    try {
      // ── PRIMEIRO O JUIZ QUE FALTOU, DEPOIS A REESCRITA (26/08/2026) ───────
      //
      // Peça `quality_nao_auditado` NÃO tem defeito conhecido: falta parecer.
      // `apresentar()` a segura dizendo "não reescreva, destrave a auditoria",
      // e até aqui ninguém destravava — o pacote não aparecia nem nesta perna
      // nem em `/api/pacotes-travados`. Medido no cliente oculto de 26/08, com
      // o provedor devolvendo HTTP 429.
      //
      // A ordem importa: reauditar é barato e pode liberar o pacote inteiro
      // sem uma linha reescrita. Só o que o juiz REPROVAR desce para a
      // reescrita, na mesma rodada.
      // `?? []` porque esta perna NÃO pode morrer por um campo ausente: o
      // `catch` lá embaixo engoliria o projeto inteiro e a reescrita — que já
      // funcionava — deixaria de rodar por causa da novidade.
      let liberadasPeloJuiz = 0;
      if ((t.naoAuditadas ?? []).length > 0) {
        const rr = await reauditarSemArbitro(t.projectId);
        liberadasPeloJuiz = rr.aprovadas.length;
        corrigidas += liberadasPeloJuiz;
        if (rr.aindaSemArbitro.length > 0) {
          log(`pacote ${t.projectId}: ${rr.aindaSemArbitro.length} peça(s) continuam sem árbitro — a auditoria é que está fora, não a peça`);
        }
      }

      const r = await destravarPacote(t.projectId);
      corrigidas += r.corrigidas.length;
      // Voltou a ter peça boa? A produção é re-enfileirada para que o fluxo
      // normal (auditoria + apresentação automática) siga daqui.
      //
      // ── `liberadasPeloJuiz` ENTROU NESTA CONDIÇÃO DEPOIS, E É DÍVIDA MINHA ──
      //
      // Medido em produção 20 minutos depois do deploy do próprio conserto: a
      // reauditoria funcionou (`moveu: {destravadas: 8}`, a peça passou a
      // `quality_ok` julgada pelo Gemini) e **o pacote continuou sem ser
      // apresentado**. Só `r.corrigidas` — o resultado da REESCRITA — mandava
      // nesta condição, e a reescrita não tinha feito nada porque não havia
      // nada a reescrever.
      //
      // Ou seja: eu destravei a auditoria e não devolvi o pacote ao fluxo.
      // Meio conserto é pior que nenhum, porque o instrumento passa a dizer
      // "destravei 8" enquanto o cliente continua sem ver a entrega.
      if ((r.corrigidas.length > 0 || liberadasPeloJuiz > 0) && !r.escalado) {
        await prisma.project.update({
          where: { id: t.projectId },
          data: { executionStatus: "pending", executionRequestedAt: new Date(), executionAttempts: 0 },
        }).catch(() => { /* best-effort */ });
      }
    } catch (err) {
      log(`pacote ${t.projectId} falhou ao destravar: ${err instanceof Error ? err.message : "erro"}`);
    }
  }
  return corrigidas;
}

/**
 * A REDE DE SEGURANÇA DA PASSAGEM DO PEDIDO.
 *
 * A triagem e a produção rodam no ato do envio (`/api/portal/pedidos`), que é
 * onde o cliente sente a velocidade. Isto aqui existe para o que escapa: o
 * processo que morreu no meio, a IA que estava fora do ar naquele minuto, o
 * pedido criado por outro caminho. Sem esta varredura, um único erro de rede
 * recria exatamente o balde de onde a esteira acabou de sair.
 *
 * Três filas, todas com estado no BANCO e nenhuma dependendo de memória:
 *   • "novo"        — a triagem não chegou a acontecer;
 *   • "em_triagem"  — travado há mais de 10 min = processo morto;
 *   • "triado"      — classificado e não produzido (inclui o que ficou
 *                     esperando o aceite: quem não pode produzir devolve
 *                     "esperando", sem gastar IA).
 */
async function cuidarDosPedidos(): Promise<number> {
  const { triarPedido, TRAVA_MS } = await import("@/lib/agency/esteira/triagem");
  const { produzirPedido } = await import("@/lib/agency/esteira/producao-de-pedido");
  const travadoAntesDe = new Date(Date.now() - TRAVA_MS);
  let andaram = 0;

  const paraTriar = await prisma.contentRequest.findMany({
    where: { OR: [{ status: "novo" }, { status: "em_triagem", triagedAt: { lt: travadoAntesDe } }] },
    orderBy: { createdAt: "asc" },
    take: MAX_POR_RODADA,
    select: { id: true },
  });
  for (const p of paraTriar) {
    try {
      const r = await triarPedido(p.id);
      if (r.ok) {
        andaram++;
        // `r.triado` ausente = o pedido era uma OPERAÇÃO sobre trabalho já
        // existente (mudar data de calendário). Ela já se executou por inteiro
        // dentro da triagem: não há peça a produzir, e chamar o produtor aqui
        // criaria trabalho que ninguém pediu.
        if (r.triado?.podeProduzirAgora) await produzirPedido(p.id);
      } else if (r.parou) {
        // Parou com motivo é ANDAR: saiu do balde e virou decisão visível.
        andaram++;
        log(`pedido ${p.id} precisa de decisão: ${r.motivo}`);
      }
    } catch (err) {
      log(`pedido ${p.id} falhou na triagem: ${err instanceof Error ? err.message : "erro"}`);
    }
  }

  const { MAX_TENTATIVAS_DE_PRODUCAO } = await import("@/lib/agency/esteira/producao-de-pedido");
  const paraProduzir = await prisma.contentRequest.findMany({
    where: {
      // Depois do teto, o pedido já virou `precisa_decisao` — insistir aqui só
      // queimaria IA para chegar sempre ao mesmo lugar.
      productionAttempts: { lt: MAX_TENTATIVAS_DE_PRODUCAO },
      // ── O QUE O RELÓGIO ENXERGA (25/08/2026) ─────────────────────────────
      //
      // Era `deliverableId: null` seco, e para a entrega de TEXTO isso está
      // certo: lá o entregável só existe quando o trabalho terminou.
      //
      // A corrente VISUAL grava o entregável ANTES da arte, de propósito — é a
      // chave de idempotência que faz a retomada reencontrar o mesmo trabalho
      // em vez de criar outras quatro peças pagas. Consequência não intencional:
      // uma corrente que morresse no meio (provedor de imagem caído, Chromium
      // sumido) ficava com entregável gravado e status "em_producao", e este
      // `where` NUNCA mais a via. O pedido do cliente ficava preso para sempre,
      // e o único jeito de destravá-lo era alguém escrever no banco.
      //
      // Agora o relógio reconhece as duas formas. Produto canônico com
      // entregável e sem cartão é corrente parada no meio — e retomá-la não
      // duplica nada: `entregarStoryInstagramV1` reaproveita as peças que já
      // existem para aquele entregável.
      OR: [
        { deliverableId: null, status: "triado" },
        { deliverableId: null, status: "em_producao", updatedAt: { lt: travadoAntesDe } },
        { produtoId: { not: null }, deliverableId: { not: null }, status: "triado" },
        { produtoId: { not: null }, deliverableId: { not: null }, status: "em_producao", updatedAt: { lt: travadoAntesDe } },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: MAX_POR_RODADA,
    select: { id: true },
  });
  for (const p of paraProduzir) {
    try {
      const r = await produzirPedido(p.id);
      if (r.ok) andaram++;
    } catch (err) {
      log(`pedido ${p.id} falhou na produção: ${err instanceof Error ? err.message : "erro"}`);
    }
  }

  return andaram;
}

/** Uma batida do relógio. Nunca lança — o relógio não pode morrer. */
export async function baterORelogio(): Promise<{
  retomados: number;
  /** Projetos que estavam parados em `idle` e entraram na fila nesta rodada. */
  ligados: number;
  /** Levas do mês (2ª e 3ª passadas) que venceram e entraram na fila. */
  levasAbertas: number;
  avisos: number;
  destravadas: number;
  publicados: number;
  mesesVirados: number;
  artes: number;
  campanhasFreadas: number;
  avaliacoes: number;
  /** Pedidos do cliente que saíram do lugar nesta rodada. */
  pedidos: number;
  /** Pedidos de MATERIAL que estavam presos e finalmente foram ao cliente. */
  cobrancasEsquecidas: number;
  /** Arquivos do Drive que estavam presos e chegaram ao disco nesta rodada. */
  materiaisRecuperados: number;
  /** Oportunidades NOVAS que entraram pela caixa de e-mail da agência. */
  oportunidadesDaCaixa: number;
  /** Pontos parados que o PM cobrou nesta rodada (handoff sem aceite, SLA, sem dono). */
  pmCobrancas: number;
  backup: boolean;
}> {
  let retomados = 0;
  /** Projetos que saíram de `idle` sozinhos nesta rodada. */
  let ligados = 0;
  /** Levas do mês que venceram e entraram na fila nesta rodada. */
  let levasAbertas = 0;
  let pedidos = 0;
  let avisos = 0;
  let respondidas = 0;
  let orcamentos = 0;
  /** Conversas paradas de parceiro que viraram pedido sozinhas nesta rodada. */
  let conversasPromovidas = 0;
  let destravadas = 0;
  let publicados = 0;
  let mesesVirados = 0;
  let artes = 0;
  let campanhasFreadas = 0;
  let avaliacoes = 0;
  let cobrancasEsquecidas = 0;
  let oportunidadesDaCaixa = 0;
  /** Arquivos do Drive que estavam presos e finalmente chegaram ao disco. */
  let materiaisRecuperados = 0;
  let backup = false;
  /** Pontos parados que o PM cobrou nesta rodada. */
  let pmCobrancas = 0;

  // ── A TESTEMUNHA DA RODADA (06/08/2026) ───────────────────────────────────
  // Cada perna abaixo engole o próprio erro para não derrubar as outras — isso
  // é certo, e era também o motivo de a madrugada quebrar sem ninguém saber:
  // `console.log` no container é rotativo, some no deploy seguinte e ninguém o
  // lê às 7 da manhã. Agora todo erro engolido também é ANOTADO, e a anotação
  // sai em `/api/health` → `relogio.falhas`.
  const comeco = Date.now();
  const falhas: FalhaDaRodada[] = [];
  /** Fatos que são ESTADO, não quebra. Ver `EstadoDaRodada` em `pulso.ts`. */
  const estados: EstadoDaRodada[] = [];
  const estadoDe = (perna: string, texto: string): void => { estados.push({ perna, texto }); };
  const quebrou = (perna: string, err: unknown): void => {
    const erro = err instanceof Error ? err.message : String(err ?? "erro");
    falhas.push({ perna, erro });
    log(`${perna} falhou: ${erro}`);
  };

  // ── A PORTA DE APAGAR A PRODUÇÃO, ANTES DE QUALQUER OUTRA COISA ───────────
  // Denuncia a cada batida enquanto estiver ligada — de propósito, não é
  // ausência de espaçamento: a variável ligada não é um EVENTO, é um ESTADO
  // ANORMAL CONTÍNUO, e um alarme que dispara uma vez e depois cala é
  // exatamente o silêncio que este bloco existe para acabar (ver o porquê em
  // `portaDeResetAberta`, acima). Vem primeiro porque é o único alarme desta
  // rodada capaz de custar a produção inteira — as outras pernas esperam.
  const alarmeDeReset = portaDeResetAberta();
  if (alarmeDeReset) quebrou("reset-de-producao", alarmeDeReset);

  // ── A DECISÃO DO DONO, ANTES DE TUDO ──────────────────────────────────────
  // Vem primeiro na rodada porque ela decide se a peça produzida logo abaixo
  // CHEGA ao cliente. Aplicá-la depois deixaria uma rodada inteira de entregas
  // retidas por um degrau que a decisão já tinha mandado abrir.
  //
  // Está aqui, e não numa rota, porque foi exatamente a rota que falhou: soltar
  // a escada exigia sessão de admin em produção, e nenhuma rodada de agente tem
  // uma. Aqui o deploy aplica. É idempotente: da segunda rodada em diante não
  // escreve nada.
  try {
    const { aplicarDecisoesDoDonoNaCasa } = await import("@/lib/agency/escada/decisoes-do-dono");
    const r = await aplicarDecisoesDoDonoNaCasa();
    for (const m of r.mudancas) {
      log(`escada: ${m.departmentId} ${m.de} → ${m.para} por decisão do dono (${m.decisao}), +${m.clientesAdicionados} cliente(s)`);
    }
    // Decisão malformada é FALHA da rodada, nunca silêncio: uma decisão do dono
    // que não aplica e não avisa é a peça presa de novo, com outra roupa.
    for (const x of r.recusadas) quebrou("decisao-do-dono", `${x.id}: ${x.motivo}`);
    for (const a of r.avisos) quebrou("decisao-do-dono", a);
    // "Não há a quem liberar" é ESTADO, não falha — e a diferença foi paga
    // caro: de 08/08 a 24/08/2026 esta linha subiu como `falhou` a cada 5
    // minutos sobre uma casa que apenas ainda não tinha cliente. Continua
    // sendo dita (no começo e no fim do estado, e em `/api/pulso` o tempo
    // todo); deixa de gritar.
    for (const x of r.semAQuemLiberar) estadoDe("decisao-do-dono", x.motivo);
  } catch (err) {
    quebrou("decisao-do-dono", err);
  }

  // ── PROVEDOR DE IA CAÍDO: APARECE, EM VEZ DE FICAR NO DIÁRIO ──────────────
  // Medido em 24/08/2026: o Claude caiu em produção às 07:29 por falta de saldo
  // e a casa se comportou bem — reservou, atendeu o cliente, registrou. Só que
  // registrou numa linha de diário que alguém precisaria ir ler. Ninguém foi
  // avisado, e a ronda achou por acaso.
  //
  // O dado já existia em `AIRunLog`. Não faltava escrita, faltava LEITURA.
  //
  // Sem saldo e sem chave ACORDAM gente: ninguém conserta em código, e enquanto
  // durar a casa serve pela reserva — que é pior e mais cara, calada. Teto de
  // ritmo passa sozinho e não vira alarme.
  try {
    const { provedoresCaidos, precisamDeGente, ROTULO_DA_FALHA, haQuantoTempo } =
      await import("@/lib/ai/falha-de-provedor");
    const caidos = await provedoresCaidos(60);
    for (const c of precisamDeGente(caidos)) {
      // ── QUEBRADO HÁ HORAS ≠ SOLUÇO DE AGORA (27/08/2026) ─────────────────
      // Medido: 27 alarmes idênticos de 5 em 5 min, das 13:38 às 15:48, todos
      // "credit balance is too low", todos com o MESMO peso de um erro
      // isolado. Alarme que grita sobre o normal ensina a ignorar alarme — e
      // este gritava sobre o quebrado, o que é pior: acostuma a casa a ver
      // vermelho e não olhar. Continua gritando (a conta segue zerada), mas
      // agora a frase diz HÁ QUANTO TEMPO, e é o tempo que separa "pega o
      // cartão de crédito" de "olha isso daqui a pouco".
      const quanto = c.persistente
        ? `PARADO ${haQuantoTempo(c)} — ${c.quantas} chamada(s) na última hora, sempre igual`
        : `${c.quantas} chamada(s) na última hora`;
      quebrou(
        "provedor-de-ia",
        `${c.provider}: ${ROTULO_DA_FALHA[c.motivo!]} — ${quanto}. Exemplo: ${c.exemplo}`,
      );
    }
    // Os passageiros ficam como ESTADO: visíveis sem gritar. Um provedor
    // instável que ninguém vê é como este achado começou.
    for (const c of caidos.filter((x) => x.motivo !== "sem_saldo" && x.motivo !== "sem_chave")) {
      estadoDe("provedor-de-ia", `${c.provider}: ${c.motivo ? ROTULO_DA_FALHA[c.motivo] : c.exemplo} (${c.quantas}x na última hora)`);
    }
  } catch (err) {
    quebrou("provedor-de-ia", err);
  }

  // ── O CAMINHO AUTOMÁTICO: O BRIEFING ACEITO VIRA PROJETO ──────────────────
  // Mesmo molde da decisão do dono, logo acima, e pelo mesmo motivo: a única
  // porta que fazia um briefing virar projeto exigia sessão de staff em
  // produção, e nenhuma rodada de agente tem uma. O cliente aceitava e nada
  // acontecia — a explicação dos zero clientes.
  //
  // Aqui o relógio aplica. A rota do portal já tenta criar no ato do aceite;
  // esta perna é a rede: se aquela chamada morreu no meio, a rodada seguinte
  // retoma. Idempotente por `clientRequestId` — briefing que já virou projeto
  // não vira um segundo.
  try {
    const { aplicarCaminhoAutomatico } = await import("@/lib/agency/esteira/caminho-automatico");
    const r = await aplicarCaminhoAutomatico();
    if (r.criados > 0) log(`caminho automático: ${r.criados} briefing(s) aceito(s) viraram projeto`);
    // Parada é ESTADO, não falha: é a regra funcionando. O que não pode é ser
    // silêncio — briefing parado sem ninguém saber é o defeito de origem.
    if (r.pararam > 0) {
      estadoDe("caminho-automatico",
        `${r.pararam} briefing(s) aceito(s) pararam por não serem caso normal e esperam uma pessoa — o motivo de cada um está em ActivityEvent (caminho_automatico_parou)`);
    }
  } catch (err) {
    quebrou("caminho-automatico", err);
  }

  // ── A REPESCAGEM ──────────────────────────────────────────────────────────
  // Vem colada na decisão porque é a outra metade dela. `escadaFiltraEntregas`
  // roda uma vez só, no ato de apresentar — e apresentar não se repete. Sem
  // esta perna, abrir o degrau muda um valor no banco e NÃO faz uma única peça
  // chegar ao cliente: a entrega retida ontem fica `interno` para sempre.
  // Portão que abre e não deixa passar o legítimo é tão inútil quanto o que não
  // fecha.
  try {
    const { repescarEntregasRetidas } = await import("@/lib/agency/escada/repescagem");
    const r = await repescarEntregasRetidas();
    if (r.liberadas > 0) {
      log(`escada: ${r.liberadas} entrega(s) repescada(s) em ${r.projetos} projeto(s) — o degrau abriu depois da apresentação`);
    }
    for (const a of r.avisos) quebrou("repescagem-da-escada", a);
  } catch (err) {
    quebrou("repescagem-da-escada", err);
  }

  // ── E O PEDIDO RETIDO, QUE NEM CHEGOU A VIRAR ENTREGA ────────────────────
  //
  // A perna acima repesca a ENTREGA que ficou `interno`. Ela nunca alcançou o
  // caso medido em 25/08/2026: às 17:02 a escada reteve a peça do balcão e o
  // PEDIDO parou em `precisa_decisao` — antes de existir `Deliverable` para
  // repescar; às 17:03, 64 segundos depois, o relógio abriu o degrau para a
  // mesma cliente. Nada voltou a olhar o pedido, e foi preciso retriá-lo à
  // mão. Era um dos dois empurrões manuais que sobravam, e a meta é zero.
  //
  // Está AQUI, e não num relógio novo, de propósito: esta casa perdeu dez dias
  // com um cron próprio que morreu em silêncio com o painel verde. E está
  // nesta ORDEM de propósito: a decisão do dono já foi aplicada mais acima
  // nesta mesma rodada, então o degrau que abriu e o pedido que volta
  // acontecem na mesma batida — não na seguinte.
  try {
    const { repescarPedidosRetidosPelaEscada } = await import("@/lib/agency/escada/repescagem");
    const r = await repescarPedidosRetidosPelaEscada();
    if (r.rearmados > 0) {
      log(`escada: ${r.rearmados} pedido(s) retido(s) voltaram sozinhos para a fila — o degrau abriu`);
    }
    // Degrau ainda fechado é a escada FUNCIONANDO: estado, nunca falha. Um
    // alarme que grita a cada 5 minutos sobre o comportamento correto é o
    // alarme que quem lê aprende a pular — o achado de 24/08/2026.
    if (r.aindaRetidos.length > 0) {
      estadoDe("repescagem-de-pedido",
        `${r.aindaRetidos.length} pedido(s) seguem retidos pela escada: ${r.aindaRetidos[0].motivo}`);
    }
    // Teto esgotado é PARADA DECLARADA, e essa acorda gente: o pedido não volta
    // mais sozinho, e quem não for avisado nunca vai saber.
    for (const x of r.desistidos) quebrou("repescagem-de-pedido", x.motivo);
    for (const a of r.avisos) quebrou("repescagem-de-pedido", a);
  } catch (err) {
    quebrou("repescagem-de-pedido", err);
  }

  // A virada vem ANTES da retomada de propósito: ela é quem abre o mês novo e
  // marca o projeto como "pending". Assim o mês nasce e já é produzido na mesma
  // rodada, em vez de esperar mais cinco minutos.
  try {
    const viradas = await virarOsMesesVencidos();
    mesesVirados = viradas.length;
    for (const v of viradas) {
      log(`${v.projectId}: ciclo ${v.referenciaFechada} fechado${v.relatorioEntregue ? " com relatório" : " SEM relatório"}${v.proximaReferencia ? ` → ${v.proximaReferencia}` : ""}`);
    }
  } catch (err) {
    quebrou("virada-do-mes", err);
  }

  // O PEDIDO DO CLIENTE VEM CEDO NA RODADA. É o balde mais perto do dinheiro —
  // e foi o único que ninguém media até 06/08/2026.
  try {
    pedidos = await cuidarDosPedidos();
  } catch (err) {
    quebrou("pedidos-do-cliente", err);
  }

  // ── O PROJETO QUE NASCEU E NINGUÉM LIGA (24/08/2026) ──────────────────────
  // Vem ANTES da retomada de propósito: é ela que tira o projeto de `idle` e o
  // põe em `pending`, que é o estado que `retomarProducao` sabe ler. Assim o
  // projeto liga e produz na MESMA rodada, em vez de esperar mais cinco minutos.
  //
  // A trava de pagamento continua inteira e é conferida duas vezes — aqui e
  // dentro de `runProjectExecution`. Ver `esteira/ligar-projeto.ts`.
  try {
    const { ligarProjetosParados } = await import("@/lib/agency/esteira/ligar-projeto");
    const r = await ligarProjetosParados();
    ligados = r.ligados;
    if (r.ligados > 0) log(`${r.ligados} projeto(s) saíram de "idle" sozinhos e entraram na fila de produção`);
    // Esperar pagamento e esperar o aval do cliente são ESTADO, não falha: é a
    // régua funcionando. O que não pode é ser silêncio — projeto parado que
    // ninguém enxerga é o defeito de origem.
    if (r.aguardandoPagamento > 0) {
      estadoDe("ligar-projeto",
        `${r.aguardandoPagamento} projeto(s) parados por falta de pagamento confirmado — o cliente foi avisado no portal, com o que fazer para liberar`);
    }
    if (r.aguardandoDirecao > 0) {
      estadoDe("ligar-projeto",
        `${r.aguardandoDirecao} projeto(s) pagos esperando o cliente aprovar a direção — o pedido de aval está no portal dele`);
    }
    for (const d of r.desfechos) {
      if (d.desfecho === "sem_acao") quebrou("ligar-projeto", `${d.projectId}: ${d.motivo}`);
    }
  } catch (err) {
    quebrou("ligar-projeto", err);
  }

  // ── AS LEVAS DO MÊS (25/08/2026) ─────────────────────────────────────────
  //
  // Vem ANTES da retomada pelo mesmo motivo da virada e do "ligar projeto": ela
  // põe o projeto em `pending`, que é o estado que `retomarProducao` sabe ler.
  // Assim a leva vencida entra na fila e produz na MESMA rodada.
  //
  // NÃO é um relógio novo: é uma perna do relógio que já existe. Esta casa
  // perdeu dez dias com um cron que morreu em silêncio com o painel verde.
  //
  // A trava de pagamento continua inteira: `pending` não gasta nada, e
  // `runProjectExecution` confere o portão antes de qualquer token.
  try {
    const { abrirLevasVencidas, resumoDasLevas } = await import("@/lib/agency/esteira/levas");
    const r = await abrirLevasVencidas();
    levasAbertas = r.abertas.length;
    if (r.abertas.length > 0) log(`levas: ${resumoDasLevas(r)}`);
    // Leva que não abriu e não avisou é o cliente recebendo menos do que pagou,
    // invisível — que é exatamente como o teto de 12 peças viveu meses.
    for (const a of r.avisos) quebrou("levas-do-mes", a);
  } catch (err) {
    quebrou("levas-do-mes", err);
  }

  try {
    retomados = await retomarProducao();
  } catch (err) {
    quebrou("retomada-de-producao", err);
  }

  try {
    destravadas = await destravarPacotesBarrados();
  } catch (err) {
    quebrou("destravamento-de-pacote", err);
  }

  // Depois do destravamento, de propósito: a rodada que acabou de liberar uma
  // peça é a mesma que pode entregar o pacote. Antes, o projeto liberado
  // esperaria mais 5 minutos parado — e foi assim que ele esperou horas.
  try {
    const apresentados = await apresentarPacotesProntos(MAX_POR_RODADA);
    if (apresentados > 0) estadoDe("pacote-pronto", `${apresentados} pacote(s) prontos e parados foram apresentados ao cliente`);
  } catch (err) {
    quebrou("apresentacao-de-pacote-pronto", err);
  }

  // ── A MESMA PERGUNTA, UMA ETAPA ANTES NO FUNIL (8ª volta, 26/08/2026) ─────
  //
  // A perna acima cuida do PACOTE pronto e parado. Uma etapa antes, a PROPOSTA
  // escrita e parada não tinha olho nenhum: a solicitação do cliente oculto
  // ficou 27 minutos em `proposal_pending` com a proposta pronta, zero cards,
  // zero eventos, e o portal dele dizendo "Conhecendo o seu negócio · 0%".
  // Foi o único empurrão por defeito da volta inteira.
  //
  // Ela não aparecia em varredura nenhuma porque não estava FALHANDO: estava
  // num estado válido, quieta, com o número certo dentro. Estado terminal
  // silencioso é a forma mais cara de defeito que esta casa conhece.
  //
  // ⚠️ DOIS BALDES, e a separação é o ponto:
  //   • proposta que nunca CHEGOU ao cliente → `quebrou`. É defeito da casa, tem
  //     dono (Atendimento) e próxima ação, e acorda quem lê alarme;
  //   • proposta entregue e sem resposta → `estadoDe`. Não é defeito, é a espera
  //     legítima do funil — mas é NOMEADA, porque proposta que envelhece calada
  //     é venda que morre sem ninguém saber.
  //
  // Esta perna OLHA e não age: ela não escreve proposta, não cria card e não
  // muda status. Agir sozinha aqui seria mandar ao cliente uma proposta que
  // ninguém sabe por que parou — e o conserto de um funil parado não pode ser
  // um segundo caminho de entrega divergindo do primeiro.
  try {
    const paradas = await propostasParadas();
    const naoEntregues = apenasNaoEntregues(paradas);
    for (const p of naoEntregues) quebrou("proposta-parada", fraseDaParada(p));
    const semResposta = paradas.filter((p) => p.dono === "cliente");
    if (semResposta.length > 0) {
      estadoDe("proposta-parada", `${semResposta.length} proposta(s) entregue(s) e sem resposta do cliente há mais de ${MINUTOS_DE_PACIENCIA} min`);
    }
  } catch (err) {
    quebrou("proposta-parada", err);
  }

  // ── O MATERIAL PRESO — 15/08/2026 ────────────────────────────────────────
  //
  // Vem ANTES da arte de propósito: é material que a peça precisa. O arquivo que
  // o cliente já declarou e cuja importação falhou ficava preso PARA SEMPRE,
  // porque a única retentativa do repositório era o `PATCH` do portal — ou seja,
  // dependia de o cliente clicar em alguma coisa de novo. O CityJobs tinha dois
  // logos nesse estado, com um recado de erro de uma versão do sistema que não
  // existe mais desde 09/08.
  //
  // Falhar aqui NÃO pode derrubar a rodada: é recuperação, não caminho principal.
  try {
    const { reimportarFalhados } = await import("@/lib/agency/esteira/material-do-drive");
    const comMaterialPreso = await prisma.driveMaterial.findMany({
      where: { mediaAssetId: null, papelConfirmadoEm: { not: null } },
      select: { clientId: true },
      distinct: ["clientId"],
      take: 50,
    });
    for (const { clientId } of comMaterialPreso) {
      const r = await reimportarFalhados(clientId);
      materiaisRecuperados += r.recuperados;
      // Evidência junto do fato: o alerta carrega o caso concreto, nunca só
      // "algo falhou". Sem o nome do arquivo ninguém investiga.
      for (const f of r.aindaFalhando) quebrou("material-do-drive", `${f.nome} — ${f.erro}`);
    }
  } catch (err) {
    quebrou("material-do-drive", err);
  }

  // ── A COLHEITA, ANTES DA ARTE — 24/08/2026 ───────────────────────────────
  //
  // Vem aqui porque a perna de arte logo abaixo lê `SocialPost`, e nada nesta
  // rodada enchia essa tabela: `agendarPostsDaEntrega` só era chamada por três
  // eventos que já passaram (apresentar, virar mês, repescagem da escada).
  // Entrega que ficava elegível DEPOIS deles nunca mais era colhida — e a
  // rodada de arte trabalhava sobre nada, a cada 5 minutos. Medido no case
  // Farol 27: 14 entregas de texto, 0 peça esperando arte, 2 peças prontas
  // para nascer e paradas.
  //
  // Não gasta, não publica e não afrouxa portão nenhum: a peça nasce `draft` e
  // os portões (escada, Qualidade, pilar) continuam por dentro da MESMA função
  // que a porta manual usa. Ver `colherPecasDasEntregas`.
  //
  // Falhar aqui NÃO pode derrubar a rodada.
  try {
    const { colherPecasDasEntregas } = await import("@/lib/agency/execution/produzir-agora");
    const r = await colherPecasDasEntregas();
    if (r.criadas > 0) log(`colheita: ${r.criadas} entrega(s) viraram peça de calendário em ${r.projetos} projeto(s)`);
    // Trabalho pago que não virou peça é NOTÍCIA, nunca silêncio — mesma regra
    // de `naoInterpretadas` e `retidas` em `publicacao.ts`.
    for (const x of r.retidas) log(`colheita reteve "${x.nome}": ${x.motivo}`);
    for (const f of r.falhas) quebrou("colheita-de-pecas", f);
  } catch (err) {
    quebrou("colheita-de-pecas", err);
  }

  // A arte vem ANTES da publicação, e por um motivo prático: o Instagram exige
  // mídia em todo formato. Post sem imagem não vai ao ar — produzir depois
  // significaria perder a data agendada e só publicar na rodada seguinte.
  try {
    const r = await produzirArtesPendentes();
    artes = r.produzidas;
    for (const f of r.falhas) quebrou("arte", f.erro);
    // A rodada que nem começou é NOTÍCIA, nunca silêncio. Sem esta linha, a
    // casa sem Chromium produziria zero peça por dia e o pulso registraria
    // "0 falhas" — que é exatamente como o molde ficou desligado em produção
    // por dias sem ninguém saber, com a única testemunha dentro do `lastError`
    // de cada post. Fila parada conta como entrega não feita.
    if (r.semRenderizador) quebrou("arte", r.semRenderizador);
  } catch (err) {
    quebrou("arte", err);
  }

  // O que o cliente aprovou e chegou a hora vai ao ar. É a última perna da
  // esteira: sem ela a agência produz, apresenta e nunca publica.
  try {
    const r = await publicarAgendados();
    publicados = r.publicados;
    for (const f of r.falhas) quebrou("publicacao", f.erro);
    // ADIADO NÃO É FALHA — e também não pode ser silêncio. O freio de rajada
    // (`INTERVALO_MINIMO_POR_PERFIL_MS`) segura peça que já venceu para ela não
    // sair junto com as irmãs no mesmo minuto. Sem esta linha, a fila que não
    // anda seria invisível: o pulso diria "0 publicados, 0 falhas" e ninguém
    // saberia se o freio está trabalhando ou se a esteira está morta.
    for (const a of r.adiados) log(`publicação adiada (post ${a.postId}): ${a.motivo}`);
  } catch (err) {
    quebrou("publicacao", err);
  }

  // O GUARDIÃO DE VERBA. Freia sozinho a campanha que gasta sem entregar —
  // antes de a fatura contar a história. É o que separa gestão de tráfego de
  // "criei e esqueci".
  try {
    const r = await guardarAVerba();
    campanhasFreadas = r.pausadas.length;
    for (const p of r.pausadas) log(`campanha ${p.campanhaId} freada: ${p.motivo}`);
  } catch (err) {
    quebrou("guardiao-de-verba", err);
  }

  // As avaliações do Google. Responder em 24h vale muito mais que responder
  // bonito em duas semanas — e é o serviço de maior retorno para negócio local.
  try {
    const r = await cuidarDasAvaliacoes();
    avaliacoes = r.respondidas + r.escaladas;
    if (r.escaladas > 0) log(`${r.escaladas} avaliação(ões) negativa(s) esperando decisão`);
    for (const f of r.falhas) quebrou("avaliacoes", f);
  } catch (err) {
    quebrou("avaliacoes", err);
  }

  // ── A FILA DE EXCEÇÃO SE COBRANDO (09/08/2026) ───────────────────────────
  // O aviso que não conseguiu sair ficava parado até alguém abrir o painel. Um
  // cliente esperou 7 DIAS para aprovar uma direção, com o texto pronto o tempo
  // todo. Fila de exceção que não se cobra é caixa de entrada que ninguém abre.
  //
  // Reenvia só o que falhou por motivo TEMPORÁRIO; o que só cadastro resolve é
  // gritado em vez de re-tentado, porque nenhuma tentativa número 40 inventa um
  // telefone que ninguém cadastrou.
  try {
    // O workspace vem de um aviso pendente qualquer: se não há nenhum, não há
    // fila a cobrar, e a passada termina sem tocar no banco de novo.
    const algum = await prisma.clientNotice.findFirst({
      where: { status: "pendente" }, select: { workspaceId: true },
    });
    if (algum) {
      const r = await cobrarAFila(algum.workspaceId, new Date());
      if (r.reenviados.length > 0) log(`${r.reenviados.length} aviso(s) reenviado(s) sozinho(s)`);
      for (const p of r.precisamDeCadastro) {
        log(`aviso parado por CADASTRO — ${p.cliente}: ${p.oQueFalta}`);
      }
      if (r.desistidos.length > 0) log(`${r.desistidos.length} aviso(s) esgotaram o reenvio e precisam de gente`);
    }
  } catch (err) {
    quebrou("fila-que-se-cobra", err);
  }

  // ── O QUE ESPERA NO PORTÃO COMERCIAL (10/08/2026) ────────────────────────
  // Três propostas ficaram paradas desde junho e o raio-X chamou isso de
  // defeito. Não era: a política da plataforma classifica o envio como
  // HUMAN_GATE, e o sistema se RECUSA a mandar sozinho — trava funcionando.
  //
  // O que faltava não era automação: era alguém ser avisado. Trava que segura
  // trabalho pronto e não conta a ninguém tem o mesmo efeito prático de fila
  // morta, com a diferença de que esta está certa.
  try {
    const algum = await prisma.oportunidade.findFirst({ select: { workspaceId: true } });
    if (algum) {
      const r = await resumoDoPortao(algum.workspaceId, new Date());
      if (r.esperando > 0) {
        log(`${r.esperando} proposta(s) esperando mão humana no portão` +
            (r.esquecidas > 0 ? ` — ${r.esquecidas} parada(s) há ${r.maisAntigaEmDias} dia(s)` : ""));
      }
    }
  } catch (err) {
    quebrou("portao-comercial", err);
  }

  // ── QUEM O PORTÃO DE PAGAMENTO ESTÁ SEGURANDO ─────────────────────────────
  // A trava do pagamento (lib/agency/financeiro/portao-de-pagamento.ts) barra
  // produção sem prova de que o cliente pagou. Uma trava dessas TEM de contar
  // quem ela está barrando: sem esta linha, "quantos clientes estão parados?"
  // só teria resposta abrindo o banco à mão — e pergunta cuja resposta custa
  // trabalho é pergunta que ninguém faz. Aí a trava passa a segurar cliente
  // pagante em silêncio, que é o único jeito de este conserto virar defeito.
  //
  // Só LÊ. E o silêncio aqui é informação: sem ninguém parado, nada é dito.
  try {
    const r = await retratoDoPortao();
    if (r.paradosPeloPortao > 0) {
      log(`PORTÃO DE PAGAMENTO: ${r.paradosPeloPortao} projeto(s) parado(s) aguardando pagamento` +
          (r.exemplos.length ? ` — ${r.exemplos.join("; ")}` : "") +
          ". Recebeu por Pix? POST /api/admin/pagamentos libera na próxima rodada.");
    }
    // O retrato da casa, sempre — é ele que diz se a régua tem sobre quem valer.
    log(`portão de pagamento: ${r.clientesComProjeto} cliente(s) com projeto, ` +
        `${r.projetosVivos} projeto(s) vivo(s), ${r.semProvaDePagamento} sem prova de pagamento, ` +
        `${r.paradosPeloPortao} parado(s)`);
    // QUEM, não só quantos. "1 cliente com projeto" não permite decidir nada
    // sobre a régua; saber que projeto é, em que estado, e se ele tem pedido a
    // que ligar um pagamento, permite.
    for (const c of r.quemTemProjeto) {
      const detalhe = c.projetos
        .map((pr) => `${pr.nome} [${pr.estado}${pr.temPedido ? "" : ", SEM PEDIDO"}${pr.pago ? ", pago" : ""}]`)
        .join("; ");
      log(`portão de pagamento — ${c.cliente}: ${detalhe}`);
    }
  } catch (err) {
    quebrou("vigia-do-portao-de-pagamento", err);
  }

  // ── A PERGUNTA QUE NUNCA CHEGOU AO CLIENTE ────────────────────────────────
  // Medido na produção em 08/08/2026: um pedido de material aberto há mais de
  // um dia com `askedClientAt` vazio. O agente travou esperando algo que o
  // cliente NUNCA foi perguntado — e não existia caminho no repositório capaz
  // de perguntar depois (o único chamador de `cobrarCliente` só dispara na
  // mesma passada que abre o pedido). Do lado de fora, a agência parecia ter
  // parado. Fila morta conta como entrega não feita.
  try {
    const r = await cobrarPedidosEsquecidos();
    cobrancasEsquecidas = r.pedidosCobrados;
    if (r.pedidosCobrados > 0) {
      log(`${r.pedidosCobrados} pedido(s) de material presos há +24h foram finalmente ao cliente`);
    }
    // Pedido vencido que continua sem destino é notícia: ele seguirá preso e o
    // raio-x seguirá acusando. Silenciar aqui recriaria o buraco original.
    for (const s of r.semDestino) quebrou("cobranca-esquecida", `${s.projectId}: ${s.motivo}`);
  } catch (err) {
    quebrou("cobranca-esquecida", err);
  }

  // ── O COMPROMISSO DO SDR VENCIDO GRITA (P0 AO VIVO, 30/08/2026) ──────────
  //
  // Marcos (Foocci, PARCEIRO REAL) cobrou uma proposta atrasada há mais de 1h.
  // O SDR respondeu "vou conferir com o gerente… precisa de aprovação de
  // gestão… pode deixar comigo" — e nada existia atrás da frase: nem
  // registro, nem alarme, nem dono. `app/api/sdr/chat/route.ts` agora
  // registra um compromisso de verdade (dono + prazo) sempre que o SDR
  // anuncia uma escalação; esta perna é o lado que COBRA esse compromisso.
  //
  // Compromisso que ninguém cobra é pior que promessa não feita: o cliente
  // está esperando. `quebrou` para o que já venceu — acorda quem lê o pulso,
  // com nome do cliente, o que foi prometido e há quanto tempo. `estadoDe`
  // para o que ainda está no prazo — visível, sem gritar sobre o normal.
  try {
    const { compromissosAbertos, compromissosVencidos, fraseDoCompromissoVencido } =
      await import("@/lib/agency/comercial/compromisso-do-sdr");
    const abertos = await compromissosAbertos();
    const vencidos = compromissosVencidos(abertos);
    for (const c of vencidos) quebrou("compromisso-do-sdr", fraseDoCompromissoVencido(c));
    const dentroDoPrazo = abertos.length - vencidos.length;
    if (dentroDoPrazo > 0) {
      estadoDe("compromisso-do-sdr", `${dentroDoPrazo} compromisso(s) de escalação do SDR aberto(s) e dentro do prazo`);
    }
  } catch (err) {
    quebrou("compromisso-do-sdr", err);
  }

  // ── A CAIXA DE ENTRADA DA AGÊNCIA ─────────────────────────────────────────
  // A terceira porta do Radar: em vez de esperar alguém colar o projeto ou
  // configurar um encaminhador, a casa LÊ a caixa da agência e ingere sozinha.
  // Só leitura — não apaga, não move, não responde. Passa pela MESMA função de
  // qualificação da porta de colar, então a oportunidade nasce com nota.
  //
  // Sem credencial ela não roda e NÃO é falha: é porta fechada, e o motivo
  // aparece na tela de configuração. O que vira falha da rodada é a caixa
  // configurada que não abriu — essa é notícia, e silenciá-la deixaria a porta
  // parecendo ligada por semanas sem ter lido um e-mail.
  try {
    const { varrerTodasAsCaixas } = await import("@/lib/agency/comercial/caixa-de-entrada/varredura");
    const { resultados, impedidos } = await varrerTodasAsCaixas();
    for (const r of resultados) {
      if (r.rodou) {
        oportunidadesDaCaixa += r.novas;
        if (r.novas > 0) log(`caixa de ${r.workspaceId}: ${r.novas} oportunidade(s) nova(s) — ${r.motivo}`);
        if (r.falhas > 0) quebrou("caixa-de-entrada", `${r.workspaceId}: ${r.falhas} mensagem(ns) falharam`);
      } else {
        quebrou("caixa-de-entrada", `${r.workspaceId}: ${r.motivo}`);
      }
    }
    // Credencial de ambiente sem alvo resolvido: configurada e lendo NADA.
    for (const i of impedidos) quebrou("caixa-de-entrada", i);
  } catch (err) {
    quebrou("caixa-de-entrada", err);
  }

  // ── O BACKUP ──────────────────────────────────────────────────────────────
  // Uma vez por dia. Não é o relógio que decide a frequência: ele bate a cada
  // 5 min, e é o estado no disco que diz se já passou 24h. Assim um restart do
  // servidor não dispara backup a mais, e um servidor parado por horas faz o
  // backup atrasado assim que volta.
  try {
    const e = await estadoDoBackup();
    if (e.horasDesdeOUltimo === null || e.horasDesdeOUltimo >= 24) {
      const r = await fazerBackup();
      backup = r.ok;
      if (r.ok) log(`backup ok — ${Math.round((r.bytes ?? 0) / 1024)} KB, ${JSON.stringify(r.conferencia)}`);
      // Backup que falha em silêncio é pior que backup nenhum: dá a sensação
      // de estar protegido.
      else quebrou("backup", r.erro ?? "motivo não informado");
    }
  } catch (err) {
    quebrou("backup", err);
  }

  // ── DUAS TABELAS DE PREÇO VIVAS: A CASA GRITA ATÉ O CEO DECIDIR ──────────
  //
  // Achado do cliente oculto (26/08/2026): a proposta cotou "Plano Essencial
  // R$ 590" e a página pública `/planos`, no mesmo minuto, mostrava outros
  // cinco degraus — nenhum deles com esse nome nem com esse preço. E
  // "Crescimento" existe nas duas com R$ 990 e R$ 2.590, 2,6× de diferença.
  //
  // Qual das duas é a verdadeira é decisão de PREÇO, e preço é do CEO — este
  // bloco NÃO escolhe e não muda número nenhum. Ele grita.
  //
  // ⚠️ E este é o oposto do alarme que esta mesma rodada CALOU ("briefing sem
  // orçamento", que gritava sobre comportamento correto). Aqui não há
  // comportamento correto acontecendo: enquanto as duas tabelas divergirem,
  // alguém está sendo cobrado errado em toda proposta que a esteira emite. É
  // notícia todo dia porque é defeito todo dia — e some no minuto em que houver
  // uma tabela só.
  try {
    const { SOCIAL_PACKAGES } = await import("@/lib/agency/live-calculator");
    const { PLANOS } = await import("@/lib/agency/planos");
    const daVitrine = new Set(PLANOS.map((p) => p.preco));
    const fora = SOCIAL_PACKAGES
      .filter((p) => !daVitrine.has(p.minPrice) || !daVitrine.has(p.maxPrice))
      .map((p) => `${p.label} R$ ${p.minPrice}`);
    if (fora.length > 0) {
      quebrou("precos",
        `${fora.length} preço(s) que a esteira COTA não existem na página pública /planos (${fora.join(" · ")}). ` +
        "Duas tabelas vivas cobram errado de alguém. Dono: o CEO. " +
        "Próxima ação: decidir qual tabela vale — a da vitrine ou a da proposta.");
    }
  } catch (err) {
    quebrou("precos", err);
  }

  try {
    const r = await dispatchWhatsAppNotifications();
    avisos = typeof r?.sent === "number" ? r.sent : 0;
  } catch (err) {
    quebrou("avisos", err);
  }

  // ── A CONVERSA PARADA DO PARCEIRO VIRA PEDIDO ────────────────────────────
  //
  // 27/08/2026: o primeiro cliente real (FOOCCI) conversou com o SDR às 01:34 e
  // às 13:43, entregou o briefing inteiro, e nenhum pedido nasceu — a conversa
  // travou na pergunta de verba, que para um PARCEIRO a casa não deveria nem
  // fazer. 24 horas de atraso no orçamento de quem já tinha contado tudo.
  //
  // O rastro dessas conversas já era gravado desde o mesmo dia, e NINGUÉM AGIA
  // SOBRE ELE: a casa passou a GRAVAR o cliente perdido e continuou PERDENDO
  // ele. Décima ocorrência de "trava construída sem fechadura".
  //
  // ⚠️ FICA IMEDIATAMENTE ANTES DO ORÇAMENTO, e a ordem é a entrega: o pedido
  // que nasce aqui entra em `new` e a perna seguinte, NESTA MESMA batida, lê a
  // fila e entrega o orçamento dele. Mover este bloco para depois custaria mais
  // cinco minutos ao cliente e faria o teste de ponta a ponta virar teatro.
  try {
    const { promoverConversasParadas } = await import("@/lib/agency/comercial/promover-conversas-paradas");
    const r = await promoverConversasParadas();
    conversasPromovidas = r.promovidos.length;
    for (const p of r.promovidos) {
      log(`conversa parada ${p.fio} virou o pedido ${p.clientRequestId} (parceiro ${p.clientId})`);
    }
    // Pendência é conversa de PARCEIRO que não dá para orçar ainda. Vira
    // notícia com o que falta — nomeado —, porque é cliente esperando e é gente
    // que resolve. Conversa sem parceria NÃO entra aqui: ela é o caminho de
    // sempre (parada com dono humano), e gritar sobre o normal ensina a ignorar
    // alarme — a lição que este mesmo arquivo pagou com 76 disparos em 24h.
    for (const p of r.pendencias) quebrou("conversa-recuperada", p);
    for (const f of r.falhas) quebrou("conversa-recuperada", f);
  } catch (err) {
    quebrou("conversa-recuperada", err);
  }

  // ── O ORÇAMENTO SAI DA GAVETA ─────────────────────────────────────────────
  // 16/08/2026, com o CEO na tela: ele entregou briefing, a tela prometeu
  // orçamento "em breve" e ele esperou horas. O orçamento JÁ ESTAVA CALCULADO
  // — a sala de briefing deriva o número ao vivo e grava junto no pedido.
  // Ninguém entregava. Não faltava calcular; faltava a seta.
  //
  // Mora aqui porque tem de acontecer sem ninguém abrir tela: quem entrega
  // briefing de madrugada não espera alguém lembrar dele de manhã.
  try {
    const r = await entregarOrcamentosPendentes();
    orcamentos = r.entregues;
    if (r.entregues > 0) log(`${r.entregues} orçamento(s) entregue(s) ao cliente`);
    // 16/08/2026, pergunta do CEO: *"nada ainda via e-mail. O que aconteceu?"*
    // Entregar no portal e ficar mudo é o que produziu a pergunta. Estes dois
    // números existem para que "entregou" e "avisou" nunca mais sejam lidos
    // como a mesma coisa no relato da rodada.
    if (r.avisados > 0) log(`${r.avisados} cliente(s) avisado(s) por e-mail`);
    if (r.semCanal > 0) log(`${r.semCanal} entregue(s) só pelo portal — sem canal de contato declarado`);
    // Aviso que não saiu é cliente com orçamento pronto e sem saber. Vira
    // notícia, e não linha de log: ele NÃO é retentado (retentar é como se
    // manda o mesmo orçamento duas vezes), então quem resolve é gente.
    for (const a of r.avisosQueFalharam) quebrou("orcamento", a);
    // Briefing sem número derivado NÃO ganha número inventado — vai para gente,
    // e isso é notícia: é cliente esperando com a casa sem resposta.
    // O AVISO AO CLIENTE, contado à parte (25/08/2026). Até aqui a linha
    // abaixo saía a cada 5 minutos e era TUDO que acontecia: o cliente do
    // outro lado não recebia uma palavra. O pedido sumia em silêncio, e o
    // silêncio virava rotina de log. Agora ele é avisado, uma vez, com o que
    // falta, o motivo, o dono e a próxima ação — e o número diz quantos foram.
    if (r.faltaAvisada > 0) log(`${r.faltaAvisada} cliente(s) avisado(s) de que o pedido está parado por falta de informação`);
    // ═══════════════════════════════════════════════════════════════════════
    // ALARME QUE GRITA SOBRE O NORMAL ENSINA A IGNORAR ALARME (6ª rodada)
    // ═══════════════════════════════════════════════════════════════════════
    //
    // Medido no cliente oculto: *"2 briefing(s) sem orçamento calculado"*
    // disparou **76 vezes em 24h** — para um comportamento CORRETO. Dois
    // briefings chegaram sem o dado que fecha a conta, a casa se recusou a
    // inventar número (certo), avisou o cliente do que falta (certo), e ficou
    // esperando gente (certo). Nada estava quebrado. O alarme gritava mesmo
    // assim, a cada batida do relógio, porque ele perguntava a coisa errada.
    //
    // `semOrcamento` é um ESTADO DE PÉ, não um evento. Estado de pé multiplicado
    // por 288 batidas de relógio por dia vira ruído — e ruído ninguém lê. O
    // custo não é a linha: é que a notícia REAL do dia seguinte chega na mesma
    // caixa e recebe o mesmo desprezo já treinado. Esta casa já escreveu essa
    // lição duas vezes (`pedidos.ts`, e o aviso do próprio orçamento em 25/08)
    // e depois gritou por cima dela.
    //
    // A regra: **alarme é sobre a TRANSIÇÃO; log é sobre o estado.**
    //
    //   • `faltaAvisada` é a transição — ela só é maior que zero no ciclo em
    //     que um briefing NOVO entrou no buraco, porque `avisarQueFaltaInformacao`
    //     carimba `faltaAvisadaEm` no `briefingJson` e nunca avisa duas vezes.
    //     Um briefing, um alarme, para sempre. Reusa a marca que já existe: uma
    //     segunda contagem de "já gritei" divergiria da primeira no primeiro
    //     conserto de uma delas;
    //   • `semOrcamento` continua sendo dito TODA rodada — por `estadoDe`, que
    //     é o canal que esta casa já tinha para "fatos que são ESTADO, não
    //     quebra" (`EstadoDaRodada`, em `pulso.ts`). Ele não some de lugar
    //     nenhum: quem quiser saber quantos estão parados agora lê o pulso.
    //
    // ⚠️ ISTO NÃO CONTRADIZ A PORTA DE RESET, no topo desta função, que denuncia
    // a cada batida de propósito. A diferença não é a duração, é a NATUREZA: lá
    // o estado de pé é ANORMAL (alguém deixou ligada a variável que apaga a
    // produção) e enquanto durar é notícia; aqui o estado de pé é a casa
    // fazendo a coisa certa — recusando-se a inventar um número que não tem.
    // Alarme sobre o anormal contínuo é vigilância; alarme sobre o normal
    // contínuo é o treino que faz a vigilância ser ignorada.
    if (r.faltaAvisada > 0) {
      quebrou("orcamento", `${r.faltaAvisada} briefing(s) NOVO(s) sem orçamento calculado — aguardando gente (o cliente JÁ foi avisado do que falta)`);
    }
    if (r.semOrcamento > 0) {
      estadoDe("orcamento", `${r.semOrcamento} briefing(s) parados sem orçamento calculado — aguardando gente (o cliente JÁ foi avisado do que falta)`);
    }
    // A PROPOSTA QUE NÃO NASCEU SEM PORTA (26/08/2026). O texto com dono e
    // próxima ação já vai em `falhas` — este número é o placar, para quem
    // compara rodadas ver se a trava disparou uma vez (falha transitória, que
    // a batida seguinte cura) ou toda batida (alguém precisa olhar).
    if (r.semPortaDeAceite > 0) {
      log(`${r.semPortaDeAceite} proposta(s) NÃO escrita(s) por falta de porta de aceite — o pedido continua na fila`);
    }
    for (const f of r.falhas) quebrou("orcamento", f);
  } catch (err) {
    quebrou("orcamento", err);
  }

  // ── O PM RESPONDE ─────────────────────────────────────────────────────────
  // O portal PERGUNTA ao cliente ("Preciso confirmar uma coisa com você") e,
  // até 15/08/2026, não havia canal de volta: o cliente escrevia no chat e
  // nenhuma linha de código lia. A casa falava e não ouvia — e o cargo que
  // estava mudo era justamente "a ponte com todos os departamentos".
  //
  // Mora aqui porque a resposta tem de acontecer SEM ninguém abrir tela. Uma
  // caixa de entrada que depende de alguém olhar é a mesma promessa que já
  // falhou: o cliente escreve à noite e a resposta não pode esperar alguém
  // lembrar.
  try {
    const r = await responderMensagensDeClientes();
    respondidas = r.respondidas;
    if (r.respondidas > 0) log(`PM respondeu ${r.respondidas} mensagem(ns) de cliente`);
    // Sem IA a mensagem FICA na fila para um humano — mas isso é notícia, não
    // rotina: cliente esperando em silêncio é o defeito que este bloco existe
    // para acabar.
    // ⭐ O Dioli Connect atendendo é ROTINA, não notícia: o assunto estava fora
    // da alçada do agente e seguiu o caminho certo. Só se registra no log.
    if (r.peloConector > 0) log(`Dioli Connect atendeu ${r.peloConector} assunto(s) fora da alçada`);
    // A MESMA regra do alarme do orçamento, e pelo mesmo motivo medido: `semIA`
    // é ESTADO DE PÉ (a mensagem fica na fila até gente abrir a tela) e
    // disparava 57 vezes em 24h sobre comportamento correto. Alarme na
    // TRANSIÇÃO (`novasSemIA`), estado no pulso. Ver `JANELA_DE_NOVIDADE_MS`
    // em `pm-responde.ts` — inclusive o limite exato do que ela garante.
    if (r.novasSemIA > 0) {
      quebrou("pm-responde", `${r.novasSemIA} mensagem(ns) NOVA(s) sem resposta automática — aguardando gente`);
    }
    if (r.semIA > 0) {
      estadoDe("pm-responde", `${r.semIA} mensagem(ns) na fila sem resposta automática — aguardando gente`);
    }
    for (const f of r.falhas) quebrou("pm-responde", f);
  } catch (err) {
    quebrou("pm-responde", err);
  }

  // ── O VIGIA DA MADRUGADA ──────────────────────────────────────────────────
  // Vem por ÚLTIMO de propósito: ele conta a noite, e a noite inclui esta
  // rodada. Roda uma vez por dia, às 03h de São Paulo, e é ele que transforma
  // "quebrou de madrugada" em linha no painel que o CEO abre de manhã. Mora
  // aqui, e não no GitHub Actions, porque o Actions estava em pane declarada na
  // noite em que isto foi escrito — alarme que depende do provedor caído é
  // alarme que falta justamente no dia em que faria falta.
  try {
    await vigiarAMadrugada(falhas);
  } catch (err) {
    quebrou("vigia-da-madrugada", err);
  }

  // ── A VARREDURA DO PM (15/08/2026) ────────────────────────────────────────
  //
  // Entra porque o CEO mediu o sintoma e nomeou: "ele era o que deveria estar
  // mais correndo entre os departamentos, está parado". Estava — e não por
  // culpa do agente: a ficha dele só tinha entrada REATIVA, e este relógio,
  // que bate de 5 em 5 minutos fazendo uma dúzia de coisas, nunca o chamava.
  //
  // Esta perna é o chamado que faltava. Ela não despacha nem decide: OLHA e
  // registra o que está parado com nome, tempo e o que fazer. Handoff entregue
  // e nunca aceito é o caso clássico que morria em silêncio — para quem
  // entregou "já foi", para quem recebe "não chegou", e a esteira parada no
  // meio sem ninguém sentir falta.
  try {
    const { varrerOQueEstaParado, frazeDaVarredura } = await import("@/lib/agency/pm/varredura");
    const agora = new Date();
    const [handoffsAbertos, tarefas] = await Promise.all([
      prisma.handoffV2.findMany({
        where: { status: "aguardando_recebimento" },
        orderBy: { criadoEm: "asc" },
        take: 200,
      }),
      prisma.task.findMany({
        where: { estadoCanonico: { not: null }, status: { in: ["pending", "in_progress", "in_review"] } },
        orderBy: { updatedAt: "asc" },
        take: 300,
        select: { id: true, estadoCanonico: true, updatedAt: true, agentId: true },
      }),
    ]);
    const { departamentoDoAgente } = await import("@/lib/agency/escada/degraus");
    const { deSlugLegado } = await import("@/lib/agency/catalogo-v2/adaptadores");
    const varredura = varrerOQueEstaParado(
      {
        handoffs: handoffsAbertos.map((h) => ({
          id: h.id,
          deDepartamento: h.deDepartamento,
          paraDepartamento: h.paraDepartamento,
          responsavelEntrega: h.responsavelEntrega,
          criadoEm: h.criadoEm,
          cobradoEm: h.cobradoEm,
        })),
        trabalhos: tarefas.map((t) => {
          const legado = t.agentId ? departamentoDoAgente(t.agentId) : null;
          return {
            id: t.id,
            entidadeTipo: "Task",
            estadoCanonico: t.estadoCanonico,
            atualizadoEm: t.updatedAt,
            donoDepartamento: legado ? (deSlugLegado(legado) ?? legado) : null,
          };
        }),
      },
      agora,
    );
    pmCobrancas = varredura.totalParado;
    if (varredura.totalParado > 0) {
      log(`PM: ${frazeDaVarredura(varredura)}`);
      for (const c of varredura.cobrancas) log(`PM cobra → ${c.pedido}`);
      // Cobrar é ato, e ato deixa marca: sem carimbar, a próxima rodada
      // cobraria tudo de novo daqui a 5 minutos e o alerta viraria ruído.
      const idsDeHandoff = varredura.cobrancas
        .filter((c) => c.motivo === "handoff_sem_aceite")
        .map((c) => c.referencia);
      if (idsDeHandoff.length > 0) {
        await prisma.handoffV2.updateMany({ where: { id: { in: idsDeHandoff } }, data: { cobradoEm: agora } });
      }
    }
    // Estado sem prazo é lugar onde trabalho dorme para sempre: sobe declarado.
    for (const e of varredura.estadosSemRegua) quebrou("pm-varredura", `estado sem régua de SLA: ${e}`);
  } catch (err) {
    quebrou("pm-varredura", err);
  }

  // ── O LAÇO DO GERENTE GERAL (25/08/2026) ──────────────────────────────────
  //
  // Ordem do CEO: o GG "é o agente que não para: está sempre checando quem
  // está atrasado e quem não está" e "valida se cada projeto está saindo
  // dentro do cronograma".
  //
  // A perna acima (a varredura do PM) olha HANDOFF e TAREFA e termina em
  // `log(...)`. Esta olha o PROJETO — a unidade que o cliente conhece — e
  // termina em `BloqueioV2`, com dono, ação e escalada. Linha de log some no
  // reinício do contêiner; linha com dono ocupa espaço até alguém resolver.
  //
  // ⚠️ Ela mora AQUI, e não em `POST /api/cron/v2`, por um achado de
  // 25/08/2026: **nenhum agendador chama `/api/cron/v2`** — nem workflow do
  // GitHub, nem perna do despertador, nem `scripts/`. O relógio da V2 está
  // construído e MUDO desde o M6. A chamada foi mantida lá também (é o lugar
  // certo quando alguém ligar o agendador), mas quem faz o laço rodar de
  // verdade hoje é esta perna. Motor construído e mudo é o defeito que esta
  // casa já viu duas vezes.
  try {
    const { rodadaDoGerenteGeral } = await import("@/lib/agency/gerencia/rodada");
    const r = await rodadaDoGerenteGeral();
    if (r.atrasados > 0 || r.bloqueiosAbertos > 0 || r.avisosEnfileirados > 0) {
      log(`Gerente Geral: ${r.frase}`);
    }
    for (const e of r.estadosSemRegua) quebrou("gerente-geral", `estado sem régua de SLA: ${e}`);
  } catch (err) {
    quebrou("gerente-geral", err);
  }

  // ── A PORTA DA FRENTE TEM ALARME (25/08/2026) ─────────────────────────────
  //
  // O cliente oculto bateu em `/api/sdr/chat` e levou `teto_de_custo` NOVE
  // vezes. A casa estava com a porta da frente fechada para a internet inteira
  // — e **nenhum instrumento dela sabia disso**. Medido: zero ocorrências de
  // `teto_de_custo` no despertador e no coletor do Diretor, e nenhuma linha
  // sobre a porta em `/api/pulso`.
  //
  // O visitante não vê erro: `PublicBriefingRoom` lê `ok:false` como
  // "sem novidade da IA" e cai no motor de REGRAS, calado e de propósito. É o
  // desenho certo para o visitante — e é exatamente o que faz a degradação ser
  // invisível para a casa. Porta que se fecha sem barulho é pior que porta que
  // trava: a que trava, alguém conserta.
  //
  // Aqui ela passa a fazer barulho, no mesmo lugar em que o CEO já olha.
  // Note que este alarme distingue os DOIS motivos: "a internet gastou a cota"
  // e "a casa se sangrou sozinha" pedem providências opostas.
  try {
    const { podeGastarNaPortaPublica } = await import("@/lib/ai/teto-de-custo");
    const { workspaceDaRotaPublica } = await import("@/lib/ai/chave-publica");
    const veredicto = await podeGastarNaPortaPublica(await workspaceDaRotaPublica());
    if (!veredicto.pode) {
      const quanto =
        veredicto.gastoUsd !== null && veredicto.tetoUsd !== null
          ? ` (gasto US$${veredicto.gastoUsd.toFixed(2)} de US$${veredicto.tetoUsd.toFixed(2)})`
          : "";
      quebrou(
        "porta-publica",
        `A PORTA DA FRENTE está fechada — o SDR de IA não atende visitante nenhum: ${veredicto.motivo}${quanto}. ` +
          "Quem chega cai no motor de regras, sem aviso na tela dele.",
      );
    }
  } catch (err) {
    quebrou("porta-publica", err);
  }

  // ── A BATIDA DA V2, PENDURADA AQUI (25/08/2026) ───────────────────────────
  //
  // A perna acima faz a varredura do Gerente Geral e ENFILEIRA o aviso de
  // atraso ao cliente no outbox. Quem tira o aviso da fila e o entrega é o
  // processador do outbox, que vivia só dentro de `POST /api/cron/v2` — e essa
  // rota **nunca teve um chamador**. Resultado medido: a casa gravava a
  // intenção de avisar e nunca avisava. Coluna gravada não é cliente informado.
  //
  // Nenhum relógio novo nasceu: é a mesma batida de 5 em 5 minutos, com mais
  // uma perna. `rodarGerenteGeral: false` porque a rodada já aconteceu logo
  // acima — dois placares da mesma rodada mentiriam sobre quantas houve.
  try {
    const { baterORelogioDaV2 } = await import("@/lib/agency/v2-recovery/batida-da-v2");
    const v2 = await baterORelogioDaV2(new Date(), { rodarGerenteGeral: false });
    if (v2.outbox.enviados > 0 || v2.outbox.mortos > 0 || v2.ausencias.length > 0) {
      log(`V2: outbox ${v2.outbox.enviados} enviado(s), ${v2.outbox.mortos} morto(s); ${v2.ausencias.length} relógio(s) ausente(s)`);
    }
    for (const r of v2.ausencias) quebrou("v2-batida", `relógio ausente: ${r.relogio}`);
  } catch (err) {
    quebrou("v2-batida", err);
  }

  if (ligados > 0 || retomados > 0 || avisos > 0 || destravadas > 0 || publicados > 0 || mesesVirados > 0 || artes > 0 || campanhasFreadas > 0 || avaliacoes > 0 || pedidos > 0 || cobrancasEsquecidas > 0 || oportunidadesDaCaixa > 0) {
    log(`rodada: ${ligados} projeto(s) ligado(s), ${pedidos} pedido(s) do cliente movido(s), ${mesesVirados} mês(es) virado(s), ${retomados} produção(ões) retomada(s), ${destravadas} entrega(s) refeita(s), ${artes} arte(s) produzida(s), ${publicados} post(s) publicado(s), ${campanhasFreadas} campanha(s) freada(s), ${avaliacoes} avaliação(ões) tratada(s), ${cobrancasEsquecidas} cobrança(s) esquecida(s) enviada(s), ${oportunidadesDaCaixa} oportunidade(s) lida(s) da caixa, ${avisos} aviso(s) enviado(s)`);
  }

  // A BATIDA É GRAVADA SEMPRE — inclusive (e principalmente) a rodada em que
  // nada aconteceu. É a rodada silenciosa que prova que o relógio está vivo, e
  // era exatamente ela que não deixava rastro nenhum.
  // ── SÓ A MUDANÇA VIRA LINHA ───────────────────────────────────────────────
  const chaves = estados.map((e) => `${e.perna}::${e.texto}`);
  const { comecaram, terminaram } = transicaoDeEstado(estadosJaAnunciados, chaves);
  for (const c of comecaram) log(`estado: ${c.replace("::", " — ")}`);
  for (const t of terminaram) log(`estado ENCERRADO: ${t.replace("::", " — ")}`);
  estadosJaAnunciados = chaves;

  await registrarBatida({
    em: new Date().toISOString(),
    ms: Date.now() - comeco,
    moveu: { pedidos, mesesVirados, retomados, levasAbertas, destravadas, artes, publicados, campanhasFreadas, avaliacoes, cobrancasEsquecidas, oportunidadesDaCaixa, materiaisRecuperados, avisos, pmCobrancas },
    falhas,
    estados,
  });

  return { retomados, ligados, levasAbertas, avisos, destravadas, publicados, mesesVirados, artes, campanhasFreadas, avaliacoes, pedidos, cobrancasEsquecidas, oportunidadesDaCaixa, materiaisRecuperados, pmCobrancas, backup };
}

/**
 * Liga o relógio. Chamado uma vez por instância do servidor, pelo
 * `instrumentation.ts`. Chamar duas vezes é inofensivo — o segundo é ignorado.
 */
export function ligarDespertador(): void {
  if (ligado) return;
  if ((process.env.DESPERTADOR ?? "").trim().toLowerCase() === "off") {
    log("desligado por DESPERTADOR=off");
    return;
  }
  ligado = true;

  const minutos = Math.round(INTERVALO_MS / 60_000);
  log(`ligado — a agência vai olhar se há trabalho parado a cada ${minutos} min`);

  const tick = () => { void baterORelogio(); };
  setTimeout(() => {
    tick();
    const t = setInterval(tick, INTERVALO_MS);
    // Não segura o processo vivo só por causa do relógio: se o servidor está
    // encerrando, ele encerra.
    if (typeof t.unref === "function") t.unref();
  }, ATRASO_INICIAL_MS).unref?.();
}
