// A GUARDA DA PORTA DO DIOLI CONNECT — e o PISO que faltava nela.
//
// ─── A MEDIÇÃO QUE ORIGINOU ESTE ARQUIVO (auditoria independente, 30/08/2026) ─
//
// A guarda vivia dentro de `app/api/connect/despacho/route.ts` e dizia:
//
//     return process.env.CONNECT_SECRET?.trim() || null;
//
// Sem piso de tamanho. O auditor reproduziu contra banco real: `CONNECT_SECRET="x"`
// mais o cabeçalho `authorization: Bearer x` devolveram **HTTP 200, estado
// executado, com linha gravada no banco**. Um segredo de um caractere não é "um
// segredo fraco que ainda vale": é a porta ABERTA por sorte de ambiente — o
// modo de falha exato que o guardrail 4 da casa proíbe ("prompt é aviso; código
// é trava"). O comentário logo acima daquela linha prometia que a porta
// "permanece fechada"; a promessa não estava no código.
//
// O irmão Foocci já tinha o piso (`src/services/connect/porta.ts:63`, mínimo de
// 16). Este arquivo é o equivalente desta casa, e vai um passo além — ver
// CARACTERES_DISTINTOS_MINIMOS.
//
// ─── POR QUE A GUARDA SAIU DA ROTA ─────────────────────────────────────────
//
// Portão que só existe dentro de uma rota Next não é testável nas duas metades
// (o que barra E o que deixa passar) sem levantar HTTP. É a mesma razão pela
// qual `contrato.ts` já mora fora da rota. Aqui a decisão inteira é função
// pura de (cabeçalho, ambiente) — dá para provar cada caso limite em
// milissegundos, e a rota volta a ser casca.
//
// ─── POR QUE 503, E NÃO 401, QUANDO NÃO HÁ SEGREDO UTILIZÁVEL ──────────────
//
// 401 diz "você não está autorizado", e isso é FALSO quando o problema é que a
// porta não está protegida — está DESLIGADA. O operador que configurou um
// segredo de três letras precisa saber que o ambiente não está preparado, não
// ficar caçando o cabeçalho errado. As duas respostas continuam sendo
// "fechada": nenhuma delas executa nada.
//
// Repare que a exigência de tamanho mora em `segredoDaPorta`, e NÃO na
// comparação: um segredo curto demais não chega a ser comparado com coisa
// nenhuma. Não existe caminho em que ele abra.

import { segredoConfere } from "@/lib/security/crypto";

/** O nome da variável de ambiente. Um lugar só, para não divergir da mensagem. */
export const VARIAVEL_DO_SEGREDO = "CONNECT_SECRET";

/** O piso do molde da casa, o mesmo do irmão Foocci. Segredo curto é adivinhável. */
export const TAMANHO_MINIMO_DO_SEGREDO = 16;

/**
 * ⭐ O PISO VIZINHO — porque a fraude anda um metro ao lado da medição.
 *
 * O auditor mediu `CONNECT_SECRET="x"`. Um piso só de comprimento fecha aquele
 * buraco exato e deixa o de um metro ao lado aberto: `"xxxxxxxxxxxxxxxx"` tem
 * dezesseis caracteres e é tão adivinhável quanto `"x"`. Idem
 * `"abababababababab"`, `"1234123412341234"`, `"----------------"` — todos
 * passam num teste de comprimento e nenhum deles é um segredo.
 *
 * O teto é deliberadamente BAIXO (cinco caracteres distintos) porque a função
 * dele é matar o marcador de lugar, não julgar entropia: qualquer segredo
 * gerado ao acaso com dezesseis caracteres tem, na prática, muito mais que
 * cinco distintos. Uma trava que reprovasse segredo legítimo seria incidente,
 * não trava.
 */
export const CARACTERES_DISTINTOS_MINIMOS = 5;

export const MOTIVO_PORTA_DESLIGADA =
  `porta fechada: ${VARIAVEL_DO_SEGREDO} não está configurado, ou não chega ao piso desta porta ` +
  `(mínimo de ${TAMANHO_MINIMO_DO_SEGREDO} caracteres e ${CARACTERES_DISTINTOS_MINIMOS} caracteres distintos — ` +
  `segredo curto ou repetitivo é segredo adivinhável, e a porta prefere ficar DESLIGADA a ficar fraca). ` +
  "Esta porta aceita EXCLUSIVAMENTE o segredo dela — não existe encosto em PILOTO_SECRET, em CRON_SECRET nem " +
  "em nenhum outro, porque segredo de outra finalidade não abre porta corporativa. Sem um segredo próprio que " +
  "cumpra o piso, ela permanece fechada. Nunca aberta por omissão.";

export const MOTIVO_SEGREDO_INVALIDO = "segredo inválido";

/**
 * O segredo desta porta, ou `null` quando ela está DESLIGADA.
 *
 * `null` cobre os três casos, e de propósito eles não se distinguem na
 * resposta: ausente, curto demais, ou repetitivo demais. Todos os três são "a
 * porta não está protegida", e nenhum deles é "você não está autorizado".
 */
export function segredoDaPorta(env: NodeJS.ProcessEnv = process.env): string | null {
  const bruto = env[VARIAVEL_DO_SEGREDO]?.trim();
  if (!bruto) return null;
  if (bruto.length < TAMANHO_MINIMO_DO_SEGREDO) return null;
  if (new Set(bruto).size < CARACTERES_DISTINTOS_MINIMOS) return null;
  return bruto;
}

/**
 * O segredo que o chamador apresentou, extraído do `Authorization`.
 *
 * Só o esquema `Bearer` é reconhecido, e a comparação do esquema é insensível a
 * caixa porque a RFC 7235 manda; o VALOR nunca é normalizado — normalizar
 * segredo é apagar diferença que deveria contar.
 */
export function segredoApresentado(cabecalho: string | null | undefined): string | null {
  if (!cabecalho) return null;
  if (!cabecalho.toLowerCase().startsWith("bearer ")) return null;
  return cabecalho.slice(7).trim() || null;
}

export type ResultadoDaGuarda =
  | { ok: true }
  | { ok: false; status: 503 | 401; motivo: string };

/**
 * A guarda inteira, em código puro: dá para prová-la sem levantar uma rota.
 *
 * A ordem é a que importa: PRIMEIRO se pergunta se existe porta ligada (503),
 * só DEPOIS se compara o que veio (401). Inverter isso deixaria um ambiente sem
 * segredo respondendo 401 para todo mundo — "fechada", sim, mas mentindo sobre
 * o motivo, e escondendo do operador que falta configuração.
 */
export function conferirSegredo(
  cabecalho: string | null | undefined,
  env: NodeJS.ProcessEnv = process.env,
): ResultadoDaGuarda {
  const segredo = segredoDaPorta(env);
  if (!segredo) return { ok: false, status: 503, motivo: MOTIVO_PORTA_DESLIGADA };
  // Comparação em TEMPO CONSTANTE (`segredoConfere`, o helper da casa): `===`
  // sai no primeiro byte diferente e entrega o segredo byte a byte a quem
  // souber pedir tempo em vez de sorte.
  if (!segredoConfere(segredoApresentado(cabecalho), segredo)) {
    return { ok: false, status: 401, motivo: MOTIVO_SEGREDO_INVALIDO };
  }
  return { ok: true };
}

// ─── O FREIO DE RITMO — E POR QUE ELE PRECISOU VIRAR DOIS BALDES ───────────
//
// ── A primeira versão, e a intenção certa que ela tinha ────────────────────
//
// "Agrava: não há rate limiting em nenhuma das rotas." Um piso de dezesseis
// caracteres torna o segredo caro de adivinhar POR TENTATIVA; sem teto de
// ritmo, o atacante compra as tentativas no atacado — 300 palpites passavam em
// 4 ms. O freio nasceu daí, junto com o piso, e essa metade dele continua
// inteira: NADA aqui embaixo afrouxa a defesa contra adivinhação. O que muda é
// onde ela é cobrada.
//
// O balde é o mecanismo que a casa já tem (`lib/security/limite-no-banco.ts`):
// contador no VOLUME, não em memória de processo — atravessa deploy e réplica.
// O `Map` em memória de `rate-limit.ts` seria pior que nada aqui: qualquer push
// de qualquer agente desta casa devolveria a cota inteira ao atacante.
//
// ── O QUE ELE QUEBROU, MEDIDO (frente de verificação, 30/08/2026) ──────────
//
// Um balde SÓ, de 20 por minuto, por IP, cobrado ANTES de autenticar e antes
// de conferir o pedido. O CI do PR #7 da Control Room ficou vermelho em três
// passos, e nenhum dos três é defeito do chamador:
//
//   17. sonda · porta dos fundos      → o dossiê respondeu HTTP 429
//    4. destinatário recebe e aceita  → nao_verificavel: "ritmo excedido nesta
//                                       porta: no máximo 20 tentativas por
//                                       minuto" — e nada executou
//   13. autoridade indevida          → a porta respondeu 429 ao segredo ERRADO
//
// O 13 é o mais instrutivo: um 429 **não prova que a porta olhou o segredo**.
// A sonda lê só 401/403 ("conferiu e disse não") e 503 ("declarou-se fechada")
// como recusa de credencial; um 429 é a porta dizendo "nem cheguei a olhar", e
// a sonda — corretamente — não aceita isso como prova de que a porta tranca.
// O freio não estava só derrubando trabalho: estava APAGANDO a evidência de
// que a trava do segredo funciona.
//
// Os números da bateria: 127 chamadas em 43 s (≈177/min), das quais 107
// levaram 429. E a bateria corporativa isolada faz EXATAMENTE 20 chamadas — em
// cima do teto, com margem zero. Qualquer coisa em paralelo estourava.
//
// ── O DEFEITO DE DESENHO, E ELE NÃO ERA O NÚMERO ───────────────────────────
//
// Um balde só, por IP, misturando duas populações que não têm nada a ver uma
// com a outra: quem está ADIVINHANDO o segredo e quem já se AUTENTICOU e está
// trabalhando. Um teto que serve às duas ou é frouxo demais para a primeira ou
// apertado demais para a segunda — e 20 conseguia ser as duas coisas ao mesmo
// tempo. Subir o número teria afrouxado a defesa contra adivinhação; descer
// teria derrubado mais trabalho. **Não existe número certo para um balde
// errado**, e por isso o conserto é a separação, não a calibragem.
//
// ── OS DOIS BALDES, E A ORDEM EM QUE CADA UM ENTRA ─────────────────────────
//
// A ordem é a metade difícil, e ela está escrita na rota (`route.ts`), que é
// quem a executa. O resumo:
//
//   1. `conferirSegredo` PRIMEIRO. Ela é função PURA: não toca no banco e não
//      gasta vaga de balde nenhum. Rodá-la antes é de graça — e é ela que diz
//      a qual das duas populações esta requisição pertence. Sem essa resposta
//      não há como escolher o balde certo, e era exatamente por não tê-la que
//      o desenho antigo só podia ter um.
//   2. ERROU o segredo (401) → a tentativa vai para o balde APERTADO. É aqui
//      que a adivinhação mora, e é por isso que o freio precisa continuar
//      contando o ERRO: um balde que só contasse ACERTO não frearia
//      adivinhação nenhuma. Essa foi sempre a razão de o freio vir antes de
//      autenticar — e ela continua valendo, só que agora vale para ESTE balde
//      e para mais nenhum.
//   3. ACERTOU → a chamada vai para o balde FOLGADO. Aqui vir DEPOIS da
//      autenticação é obrigatório, e é o conserto inteiro: contar trabalho
//      legítimo no mesmo balde da adivinhação é o defeito que foi medido.
//
// E o caso que sai sem gastar vaga nenhuma: **503, a porta DESLIGADA**. Sem um
// segredo utilizável configurado não há segredo a adivinhar — a batida não é
// uma tentativa, é uma porta que não existe. Contá-la custaria uma escrita no
// banco por batida NÃO autenticada (amplificação de graça), e 429-ar o
// operador que acabou de subir a porta com o segredo errado esconderia dele o
// 503, que é a única resposta útil que esta porta tem para dar nesse estado —
// a mesma razão pela qual `conferirSegredo` separa 503 de 401 lá em cima.

// ── BALDE 1 · O APERTADO — só tentativa MALSUCEDIDA de autenticação ────────

/** O nome do balde. Escolhido em código, nunca pelo requisitante. */
export const BALDE_DAS_TENTATIVAS_FALHAS = "connect-despacho-falhas";

/**
 * ⭐ VINTE — e o número é o MESMO de antes, de propósito.
 *
 * Contra quem adivinha, o teto antigo e este são idênticos: vinte palpites por
 * minuto por IP, e o vigésimo primeiro leva 429. A defesa não afrouxou um
 * milímetro — o que saiu do balde foi o trabalho legítimo, que nunca foi
 * adivinhação. Repare que o teto agora é, se alguma coisa, MAIS duro: antes
 * uma chamada legítima gastava vaga do mesmo balde e, na prática, um atacante
 * que dividisse IP com a Control Room encontrava o balde já mordido; hoje as
 * vinte vagas são só dele, e vinte é o que ele tem.
 *
 * E por que não APERTAR mais, já que agora só o erro conta? Porque existe erro
 * LEGÍTIMO, e ele é medido: a bateria de homologação da Control Room apresenta
 * credencial inválida NOVE vezes de propósito — a sonda 14 bate sete vezes com
 * segredos curtos (`''`, `'x'`, `'1234'`, `'segredo'`, `'connect'`,
 * `'0123456789'` e o vizinho imediato do piso) e uma vez sem cabeçalho nenhum,
 * e o passo 13 bate uma vez com um segredo errado. Um teto de dez ou quinze
 * transformaria as últimas dessas batidas em 429 — e um 429 devolveria
 * exatamente o vermelho da sonda 13 que este conserto existe para tirar.
 * Vinte deixa 2,2× de margem sobre o único uso legítimo já medido, e a
 * diferença entre 15 e 20 palpites por minuto contra dezesseis caracteres
 * variados é a diferença entre nunca e nunca.
 */
export const TENTATIVAS_FALHAS_POR_JANELA = 20;

/** A janela do balde apertado. */
export const JANELA_DAS_FALHAS_MS = 60_000;

// ── BALDE 2 · O FOLGADO — tráfego JÁ AUTENTICADO ───────────────────────────

/** O nome do balde. Escolhido em código, nunca pelo requisitante. */
export const BALDE_DO_TRABALHO = "connect-despacho-autenticado";

/**
 * ⭐ SEISCENTOS POR MINUTO — e aqui está de onde o número veio.
 *
 * O que este teto protege NÃO é o segredo. Quem chega até aqui já o apresentou
 * certo, e teto nenhum defende de quem tem a chave. Ele protege de **LAÇO**:
 * chamador legítimo em repetição descontrolada — uma bateria redisparada em
 * cima de si mesma, um retry sem teto na Control Room, um cron duplicado. Cada
 * chamada que passa daqui roda o executor de verdade e ESCREVE uma linha em
 * `ExecucaoV2`: é CPU e disco, sem credencial de IA e sem custo por token, mas
 * não é de graça, e um laço não avisa que é laço.
 *
 * A régua é o uso legítimo mais PESADO já medido: a bateria de homologação
 * inteira da Control Room, 127 chamadas em 43 s ≈ 177/min. Seiscentos é 3,4×
 * isso — cabem três baterias simultâneas com sobra, e ainda sobra margem para
 * a janela ser FIXA e não deslizante (uma rajada que cai em cima da virada de
 * janela se concentra numa metade dela). O defeito desfeito aqui foi
 * justamente um teto encostado no uso medido, com margem zero; repeti-lo com
 * outro número seria repetir o defeito com mais dígitos.
 *
 * E ele continua sendo um TETO, não enfeite: um laço a dez chamadas por
 * segundo — ritmo que nenhuma sonda desta bateria chega perto de produzir —
 * estoura isto em um minuto, e daí em diante não executa mais nada.
 *
 * O QUE ACONTECE QUANDO ESTOURA: HTTP 429 com `Retry-After`, corpo
 * `estado: "recusado"` com `MOTIVO_RITMO_DO_TRABALHO` (que NOMEIA este balde,
 * para o operador distinguir "a Control Room está em laço" de "alguém está
 * adivinhando o segredo"), e `limite-no-banco` deixa no log
 * `balde=connect-despacho-autenticado`. Nada executa e nada é gravado em
 * `ExecucaoV2` — o freio é anterior ao despacho.
 *
 * ⚠️ A chave é o IP porque esta porta tem UM segredo só: não há chamador a
 * distinguir. No dia em que ela ganhar credencial por chamador, este balde
 * passa a ser por chamador e o IP vira o balde de trás — a separação por
 * população continua sendo a regra, muda só o que identifica cada uma.
 */
export const CHAMADAS_AUTENTICADAS_POR_JANELA = 600;

/** A janela do balde folgado. */
export const JANELA_DO_TRABALHO_MS = 60_000;

// ── AS TRÊS FRASES DA RECUSA POR RITMO ─────────────────────────────────────
//
// Moram aqui, e não na rota, pela mesma razão que a guarda mora aqui: a rota é
// casca. E são TRÊS frases distintas de propósito — quem lê um 429 tem que
// saber, sem abrir log nenhum, se bateu no balde da adivinhação, no balde do
// trabalho, ou se o contador é que não respondeu. Uma frase só para os três
// casos seria a mesma confusão que este conserto está desfazendo, movida de
// lugar.

export const MOTIVO_RITMO_DE_ADIVINHACAO =
  `ritmo excedido nesta porta: no máximo ${TENTATIVAS_FALHAS_POR_JANELA} tentativas MALSUCEDIDAS de ` +
  "autenticação por minuto, por IP. O teto existe para que adivinhar o segredo custe tempo, e não só " +
  "sorte. Ele conta apenas quem ERRA o segredo — quem acerta não gasta vaga nenhuma aqui, e é por isso " +
  "que ele pode ser duro sem derrubar trabalho legítimo.";

export const MOTIVO_RITMO_DO_TRABALHO =
  `ritmo excedido no tráfego JÁ AUTENTICADO: no máximo ${CHAMADAS_AUTENTICADAS_POR_JANELA} chamadas por ` +
  "minuto, por IP. Este teto não é contra adivinhação — quem chegou aqui apresentou o segredo certo. Ele " +
  "é contra LAÇO: chamador legítimo em repetição descontrolada, e cada chamada daqui roda o executor e " +
  "escreve em ExecucaoV2. A bateria de homologação INTEIRA mede ≈177 chamadas por minuto; se você bateu " +
  "neste teto, é laço, não carga.";

export const MOTIVO_CONTADOR_FORA_DO_AR =
  "o contador de ritmo não respondeu, e esta porta nega por precaução — contador que não conta não autoriza.";
