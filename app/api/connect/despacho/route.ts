// POST /api/connect/despacho — a porta corporativa do Dioli Connect.
//
// É por aqui que a Control Room aciona o Gerente de Atendimento e SDR da Dioli
// Digital. Fase 2 do Dioli Connect, aprovada pelo CEO em 30/08/2026, com a
// determinação literal:
//
//   "Mantenha o piloto no SDR da Dioli Digital, exclusivamente em homologação,
//    com cliente e dados sintéticos. A D-006 impede operação real, não este
//    teste de recuperação."
//
// ─── POR QUE ESTA ROTA E NÃO `POST /api/sdr/chat` ──────────────────────────
//
// `app/api/sdr/chat/route.ts` é hoje a única porta HTTP que fala com o SDR, e
// ela gasta CHAVE DE IA PAGA em todo turno (é a "porta da rua" com teto de
// gasto próprio). Está proibida neste trabalho. O caminho legítimo é o executor
// por ficha (`lib/agency/execucao-v2/executor.ts`), que roda sem credencial —
// e que até agora não tinha porta HTTP nenhuma. Esta rota é essa porta.
//
// ─── AS CINCO TRAVAS, NA ORDEM EM QUE ELAS FECHAM ──────────────────────────
//
// 0. TETO DE RITMO, em DOIS baldes — porque são duas populações. Vinte
//    tentativas MALSUCEDIDAS de autenticação por minuto por IP (adivinhar o
//    segredo custa tempo) e seiscentas chamadas JÁ AUTENTICADAS por minuto por
//    IP (o laço de um chamador legítimo tem teto). Contador no volume. A ordem
//    em que cada um entra está no bloco grande logo acima de
//    `freioDeAdivinhacao`; os números, e a medição que os escolheu, em
//    `lib/agency/connect/porta-do-despacho.ts`.
//
// 1. SEGREDO PRÓPRIO, ÚNICO E COM PISO. `Bearer` conferido em TEMPO CONSTANTE
//    contra `CONNECT_SECRET` **e mais nada**, e só depois de o segredo cumprir
//    o piso de 16 caracteres (e 5 distintos). Ausente OU abaixo do piso, a
//    porta responde **503 e permanece fechada** — não cai para `PILOTO_SECRET`
//    (o encosto que o CEO mandou tirar em 30/08/2026) nem para nenhum outro
//    segredo da casa. Com segredo válido configurado e cabeçalho errado, 401.
//    A decisão inteira é função pura em `lib/agency/connect/porta-do-despacho.ts`.
//    NÃO existe caminho por sessão/cookie aqui de propósito: quem chama é
//    máquina (a Control Room), não navegador — e sem cookie não há CSRF a
//    barrar nem sessão a sequestrar.
//
// 6. ⭐ O FIO TAMBÉM NÃO VEM DE QUEM CHAMA. `correlationId` só é aceito no
//    formato que o próprio gateway emite; qualquer outro é recusa. Um fio de
//    fora deixaria a homologação LER e ESCREVER dentro da conversa de outro
//    cliente. Ver `contrato.ts` e a conferência de posse em `despacho.ts`.
//
// 2. MODO e 3. SINTÉTICO. `modo: "homologacao"` e `sintetico: true`,
//    literais, sem padrão. Ver `lib/agency/connect/contrato.ts`.
//
// 4. A FUNÇÃO É UMA LISTA DE UMA. Só `manager-atendimento` atravessa; qualquer
//    outra ficha é recusada **com o nome pedido no motivo**.
//
// 5. ⭐ O CLIENTE NÃO VEM DE QUEM CHAMA. `cliente` e `clienteId` deixaram de ser
//    entrada: mandá-los é recusa. O gateway resolve sozinho, no banco, o
//    cliente sintético de homologação, conferindo na linha lida o carimbo
//    `[TESTE]` e o domínio `.invalid`. Sem cliente sintético plantado, a porta
//    recusa em vez de inventar um. Ver
//    `lib/agency/connect/cliente-de-homologacao.ts`.
//
// ─── E A TRAVA CENTRAL, QUE NÃO É DE ENTRADA E SIM DE SAÍDA ────────────────
//
// "O despachante disse ok é proibido como prova. Quem executou é que carimba."
// Esta rota nunca responde sucesso por ter conseguido chamar alguém: ela
// devolve `executado` só quando a linha de `ExecucaoV2` volta LIDA do banco,
// com início, fim e artefato. Tudo o que não é isso e não é um "não" nomeado
// sai como `nao_verificavel`. Ver `lib/agency/connect/despacho.ts`.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { consumirVaga, type ResultadoDoLimite } from "@/lib/security/limite-no-banco";
import { clientIp } from "@/lib/security/rate-limit";
import { PERFIL_DO_PAPEL } from "@/lib/agency/roles";
import { armazemDoConnectNoBanco } from "@/lib/agency/connect/armazem-prisma";
import { conferirPedido, type PedidoDeDespacho } from "@/lib/agency/connect/contrato";
import { despachar } from "@/lib/agency/connect/despacho";
import {
  BALDE_DAS_TENTATIVAS_FALHAS,
  BALDE_DO_TRABALHO,
  CHAMADAS_AUTENTICADAS_POR_JANELA,
  JANELA_DAS_FALHAS_MS,
  JANELA_DO_TRABALHO_MS,
  MOTIVO_CONTADOR_FORA_DO_AR,
  MOTIVO_RITMO_DE_ADIVINHACAO,
  MOTIVO_RITMO_DO_TRABALHO,
  TENTATIVAS_FALHAS_POR_JANELA,
  conferirSegredo,
} from "@/lib/agency/connect/porta-do-despacho";

// O executor tem timeout por ficha (20 min na ficha do gerente). A janela da
// rota acompanha a de `v2/assistido` — 300s é o teto da plataforma.
export const maxDuration = 300;

/**
 * O SEGREDO DESTA PORTA É UM SÓ: `CONNECT_SECRET` — E ELE TEM PISO.
 *
 * Até 30/08/2026 esta função também aceitava `PILOTO_SECRET` como encosto — e o
 * CEO mandou tirar, com a razão dita em uma frase: **segredo de outra finalidade
 * não abre porta corporativa.** O encosto parecia conveniência e era o
 * contrário: quem tivesse o segredo do piloto interno por qualquer motivo
 * ganhava, de graça e sem ninguém decidir, a porta pela qual a Control Room
 * aciona agente deste produto. O raio de alcance de um segredo tem que ser
 * escolhido, não herdado.
 *
 * ⭐ E o que faltava, medido por auditoria independente no mesmo dia: a porta
 * abria com `CONNECT_SECRET="x"`. O comentário que ficava aqui prometia que ela
 * "permanece fechada"; a promessa não estava no código. A decisão inteira mudou
 * de casa — vive agora em `lib/agency/connect/porta-do-despacho.ts`, em função PURA, com o
 * piso de tamanho do molde da casa (o mesmo do irmão Foocci) e com o piso
 * vizinho de repetição. Esta rota voltou a ser casca: ela não lê variável de
 * ambiente nenhuma, e é por isso que este arquivo não tem mais um `process.env`.
 */
// (A guarda em si é `conferirSegredo`, em `porta.ts`. Ela é chamada direto no
//  `POST` — ver o bloco abaixo: qual balde cobra esta requisição depende da
//  resposta dela, então ela precisa vir antes dos dois.)

/**
 * ⭐ O TETO DE RITMO — DOIS BALDES, E A ORDEM É A METADE DIFÍCIL.
 *
 * ── O que já estava certo, e continua ──────────────────────────────────────
 *
 * O piso de dezesseis caracteres torna o segredo caro POR TENTATIVA; sem teto
 * de ritmo, o atacante compra as tentativas no atacado e o piso vira uma conta
 * de tempo em vez de uma trava. Essa metade não se mexe. O mecanismo também
 * não: contador no VOLUME (`limite-no-banco.ts`), que atravessa deploy e
 * réplica — o `Map` em memória seria pior que nada, porque qualquer push de
 * qualquer agente desta casa devolveria a cota inteira ao atacante.
 *
 * ── O que estava errado, medido em 30/08/2026 ──────────────────────────────
 *
 * Um balde só, de vinte por minuto por IP, cobrado ANTES de autenticar,
 * misturando duas populações que não têm nada a ver uma com a outra: quem
 * ADIVINHA o segredo e quem já AUTENTICOU e está trabalhando. O CI do PR #7 da
 * Control Room ficou vermelho em três passos por isso — inclusive na sonda que
 * empurra a porta com o segredo ERRADO, que recebeu 429 no lugar do 401 e, com
 * ele, perdeu a prova de que a porta chega a olhar o segredo. A bateria mede
 * 127 chamadas em 43 s (≈177/min) e 107 delas levaram 429. A lista inteira dos
 * três vermelhos e o porquê de cada número estão em `porta.ts`.
 *
 * ── A ordem, que é onde mora o conserto ────────────────────────────────────
 *
 *   1. `conferirSegredo` PRIMEIRO. Função pura: não toca banco, não gasta vaga
 *      nenhuma. Rodá-la antes é de graça — e é ela que diz a qual população
 *      esta requisição pertence. Sem essa resposta não dá para escolher balde,
 *      e era por não tê-la que o desenho antigo só podia ter um.
 *   2. ERROU (401) → `freioDeAdivinhacao`, o balde APERTADO. É por isso que
 *      esta metade continua contando o ERRO: um freio que só contasse ACERTO
 *      não frearia adivinhação nenhuma. A razão original de o freio vir antes
 *      de autenticar continua inteira — ela vale para ESTE balde.
 *   3. ACERTOU → `freioDoTrabalho`, o balde FOLGADO. Aqui vir DEPOIS da
 *      autenticação é obrigatório: contar trabalho legítimo no balde da
 *      adivinhação é exatamente o defeito que foi medido.
 *
 * ── E o caso que não gasta vaga nenhuma: 503, a porta DESLIGADA ────────────
 *
 * Sem segredo utilizável configurado não há segredo a adivinhar: a batida não
 * é uma tentativa, é uma porta que não existe. Cobrá-la custaria uma escrita
 * no banco por batida NÃO autenticada, e devolver 429 ao operador que acabou
 * de subir a porta com o segredo errado esconderia dele o 503 — a única
 * resposta útil que esta porta tem nesse estado, e a razão de `conferirSegredo`
 * separar 503 de 401 lá na origem.
 *
 * ── Fail-closed, nos dois ──────────────────────────────────────────────────
 *
 * Herdado do mecanismo: contador que não responde NEGA, com 503. Esta rota
 * precisa do banco para tudo o que faz, então "banco fora" não é um mundo em
 * que ela funcionaria — e vale igual para quem errou o segredo e para quem
 * acertou.
 */
async function freioDeAdivinhacao(request: NextRequest): Promise<NextResponse | null> {
  const r = await consumirVaga(
    `${BALDE_DAS_TENTATIVAS_FALHAS}:${clientIp(request)}`,
    TENTATIVAS_FALHAS_POR_JANELA,
    JANELA_DAS_FALHAS_MS,
  );
  return r.liberado ? null : recusaDeRitmo(r, MOTIVO_RITMO_DE_ADIVINHACAO);
}

/** O balde folgado. Ver o bloco acima para a ordem, e `porta.ts` para o número. */
async function freioDoTrabalho(request: NextRequest): Promise<NextResponse | null> {
  const r = await consumirVaga(
    `${BALDE_DO_TRABALHO}:${clientIp(request)}`,
    CHAMADAS_AUTENTICADAS_POR_JANELA,
    JANELA_DO_TRABALHO_MS,
  );
  return r.liberado ? null : recusaDeRitmo(r, MOTIVO_RITMO_DO_TRABALHO);
}

/**
 * A recusa por ritmo, num formato só — para os dois baldes não divergirem na
 * forma. O que MUDA entre eles é a frase, e ela é o parâmetro: quem lê um 429
 * precisa saber em qual dos dois bateu sem abrir log nenhum.
 */
function recusaDeRitmo(r: ResultadoDoLimite, motivoDoEstouro: string): NextResponse {
  const foraDoAr = r.motivo === "indisponivel";
  return NextResponse.json(
    { estado: "recusado", motivo: foraDoAr ? MOTIVO_CONTADOR_FORA_DO_AR : motivoDoEstouro },
    { status: foraDoAr ? 503 : 429, headers: { "Retry-After": String(r.esperarSegundos) } },
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. A guarda pura decide primeiro, e de graça. ────────────────────────
  const guarda = conferirSegredo(request.headers.get("authorization"));

  // ── 2. Errou o segredo? Isto é ADIVINHAÇÃO, e vai para o balde apertado. ──
  if (!guarda.ok) {
    // 503 = porta DESLIGADA (segredo ausente ou abaixo do piso): sai por fora
    // do balde, porque não há segredo a adivinhar. 401 = a porta está ligada e
    // o cabeçalho está errado — essa É uma tentativa, e é contada.
    if (guarda.status === 401) {
      const freado = await freioDeAdivinhacao(request);
      if (freado) return freado;
    }
    return NextResponse.json({ estado: "recusado", motivo: guarda.motivo }, { status: guarda.status });
  }

  // ── 3. Acertou. Daqui para baixo é TRABALHO, e o balde é o folgado. ──────
  const rapidoDemais = await freioDoTrabalho(request);
  if (rapidoDemais) return rapidoDemais;

  let corpo: PedidoDeDespacho;
  try {
    corpo = (await request.json()) as PedidoDeDespacho;
  } catch {
    return NextResponse.json({ estado: "recusado", motivo: "JSON inválido" }, { status: 400 });
  }

  const conferencia = conferirPedido(corpo ?? {});
  if (!conferencia.ok) {
    return NextResponse.json({ estado: "recusado", motivo: conferencia.motivo }, { status: 400 });
  }

  const resultado = await despachar(conferencia.pedido, {
    armazem: armazemDoConnectNoBanco(prisma),
    // Autoridade total: quem atravessou o segredo desta porta É a direção da
    // casa. O recorte fino por departamento tem teste próprio (capacidades).
    perfil: PERFIL_DO_PAPEL.diretor,
    agora: () => new Date(),
  });

  // O código HTTP acompanha o estado, e `nao_verificavel` JAMAIS é 2xx:
  //   executado       → 200
  //   recusado        → 422 (o pedido chegou inteiro; a regra é que disse não)
  //   nao_verificavel → 502 (o acionamento não se completou — não é sucesso)
  const status = resultado.estado === "executado" ? 200 : resultado.estado === "recusado" ? 422 : 502;
  return NextResponse.json(resultado, { status });
}
