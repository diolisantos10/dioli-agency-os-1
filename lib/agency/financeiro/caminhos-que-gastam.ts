// O REGISTRO DOS CAMINHOS QUE GASTAM — a lista fechada de quem pode chamar a
// IA paga, e sob qual regra cada um pode.
//
// Este arquivo não executa nada. Ele existe para que
// `__tests__/financeiro/portao-de-pagamento.test.ts` possa perguntar uma coisa
// que nenhum tipo do TypeScript pergunta: *"apareceu um caminho novo que gasta
// dinheiro e ninguém declarou o que ele é?"*.
//
// A regra do CEO é "nenhuma produção começa antes do pagamento confirmado" —
// mas nem toda chamada de IA é produção. A vitrine (o SDR que atende, entende,
// orça e propõe) gasta ANTES de qualquer pagamento, de propósito: fechar a
// vitrine é fechar a loja. E as ferramentas internas da agência gastam a chave
// da casa em trabalho da casa, sem projeto de cliente do outro lado.
//
// Então cada arquivo que chama `generate({` ou `generateDesign(` declara aqui
// QUAL DOS TRÊS ele é. Arquivo novo sem declaração quebra o build — que é o
// ponto: a omissão tem de doer no autor, não no cliente.

export type ClasseDeGasto =
  /**
   * PRODUÇÃO PARA CLIENTE. É o que a regra do pagamento guarda: peça, arte,
   * texto, tarefa de especialista — tudo que o cliente comprou. Só roda com
   * pagamento confirmado, e o teste exige que nenhum ponto de entrada alcance
   * este arquivo sem cruzar um portão.
   */
  | "producao"
  /**
   * CONVERSA COMERCIAL. Fica FORA da trava por decisão explícita do CEO: o SDR
   * atende, entende, orça e propõe antes de qualquer pagamento. É a vitrine.
   * Quem entra aqui é protegido por OUTRAS travas (teto de custo da rota
   * pública, teto por IP), nunca pela do pagamento.
   */
  | "comercial"
  /**
   * FERRAMENTA INTERNA DA AGÊNCIA. Gasta a chave da casa em trabalho da casa,
   * com sessão de agência e sem projeto de cliente do outro lado. Não há pedido
   * a que ligar um pagamento — e inventar um seria pior que não ter portão.
   */
  | "interno";

export interface CaminhoQueGasta {
  /**
   * POR QUE esta classe — a explicação, não o rótulo.
   *
   * ── A REGRA (ordem do CEO, 24/08/2026) ──────────────────────────────────
   *
   *   "Classificação sem motivo o próximo troca sem saber o que está trocando
   *    — e essa é a mesma razão pela qual esta casa exige motivo ao lado de
   *    todo número."
   *
   * A régua de `__tests__/financeiro/portao-de-pagamento.test.ts` garante que a
   * escolha seja EXPLÍCITA. Só isso não basta: explícita e inexplicada, ela é
   * um carimbo, e carimbo o próximo troca sem saber o que está trocando.
   *
   * Então este campo responde à pergunta que o próximo vai fazer: **o que
   * torna este caminho seguro fora da trava?** Para `comercial`, por que ele
   * acontece antes de existir dinheiro. Para `interno`, por que não há projeto
   * de cliente do outro lado — e o que o protege no lugar do pagamento, porque
   * "não é produção" não é o mesmo que "não custa".
   *
   * Um teste confere o TAMANHO deste texto: motivo de três palavras é rótulo
   * disfarçado, e disfarce é pior que a ausência.
   */
  porque: string;
  /**
   * Só para `producao`: qual portão guarda este arquivo. O teste confere que o
   * guardião REALMENTE chama `conferirPagamento(` — declarar não basta.
   */
  guardadoPor?: string;
}

const PORTAO_DA_ESTEIRA = "lib/agency/execution/run-execution.ts";
const PORTAO_DAS_ARTES = "lib/agency/execution/artes.ts";
const PORTAO_DA_REFACAO = "lib/agency/esteira/refacao.ts";
const PORTAO_DOS_MATERIAIS = "lib/agency/execution/assess-resources.ts";

/**
 * OS PORTÕES. Cada um TEM de chamar `conferirPagamento(`, e o teste prova isso
 * lendo o arquivo — declarar aqui não basta.
 *
 * São quatro e não um porque são quatro caminhos INDEPENDENTES até a fatura.
 * `run-execution` é o funil dos nove chamadores da esteira, mas os outros três
 * não passam por ele: a rodada de arte é chamada direto pelo despertador, e a
 * refação e a conferência de materiais são chamadas direto por
 * `app/api/portal/approvals/route.ts`. Um portão só no funil deixaria os
 * outros três abertos — e a régua verde sobre o componente errado é pior que
 * régua nenhuma.
 */
export const PORTOES = [
  PORTAO_DA_ESTEIRA,
  PORTAO_DAS_ARTES,
  PORTAO_DA_REFACAO,
  PORTAO_DOS_MATERIAIS,
] as const;

export const CAMINHOS_QUE_GASTAM: Record<string, CaminhoQueGasta> = {
  // ── PRODUÇÃO: o que o cliente comprou ──────────────────────────────────────
  [PORTAO_DA_ESTEIRA]: {
    porque:
      "o núcleo da esteira dos especialistas — o funil por onde passam os nove chamadores de produção " +
      "da casa. É ELE o portão: confere o pagamento antes de tomar a trava e antes de gastar a primeir" +
      "a tentativa.",
    guardadoPor: PORTAO_DA_ESTEIRA,
  },
  [PORTAO_DAS_ARTES]: {
    porque:
      "o gerador de imagem, ~US$0,17–0,25 por peça, disparado pelo despertador a cada 5 minutos SEM pa" +
      "ssar pela esteira. É a torneira mais cara da casa, e por isso é ELE o portão — um portão só no " +
      "funil a deixaria aberta.",
    guardadoPor: PORTAO_DAS_ARTES,
  },
  "lib/agency/execution/logo.ts": {
    porque:
      "desenha o kit de marca (logotipo e derivados) do cliente. É o entregável mais caro da casa em i" +
      "magem paga. Guardado pela esteira: só é chamado de dentro de `runProjectExecution`, que confere" +
      " o pagamento.",
    guardadoPor: PORTAO_DA_ESTEIRA,
  },
  "lib/agency/execution/leitura-do-cliente.ts": {
    porque:
      "lê o feed real do cliente e escreve legenda segura para a peça dele. Insumo direto do que vai s" +
      "er entregue. Guardado pelos dois portões: só é chamado da esteira e da rodada de arte.",
    guardadoPor: PORTAO_DA_ESTEIRA,
  },
  [PORTAO_DOS_MATERIAIS]: {
    porque:
      "pergunta à IA paga o que ainda falta do cliente para começar. É chamada DIRETO por `portal/appr" +
      "ovals`, fora da esteira — por isso é ELA o portão. A regra do CEO não abre exceção para gasto p" +
      "equeno: sem pagamento não se gasta token nenhum.",
    guardadoPor: PORTAO_DOS_MATERIAIS,
  },
  [PORTAO_DA_REFACAO]: {
    porque:
      "refazer é produzir: gera peça nova e gasta token e imagem. É chamada DIRETO por `portal/approva" +
      "ls` e por `approval-service`, que não passam pela esteira — por isso é ELA o portão.",
    guardadoPor: PORTAO_DA_REFACAO,
  },
  "lib/agency/esteira/mes.ts": {
    porque:
      "escreve o relatório do mês que o cliente recebe no portal. É entrega contratada, não leitura in" +
      "terna. Guardado pela esteira: nasce dentro da execução do ciclo, que já conferiu o pagamento.",
    guardadoPor: PORTAO_DA_ESTEIRA,
  },
  "lib/agency/esteira/avaliacoes.ts": {
    porque:
      "redige a resposta pública a uma avaliação do Google EM NOME do cliente — é entregável, sai com " +
      "a marca dele e o mundo lê. Guardado pela esteira: só roda dentro de uma execução, que já confer" +
      "iu o pagamento.",
    guardadoPor: PORTAO_DA_ESTEIRA,
  },

  // ── COMERCIAL: a vitrine, fora da trava por decisão do CEO ─────────────────
  "app/api/sdr/chat/route.ts": {
    porque: "o SDR responde ao visitante da vitrine, que por definição ainda não é cliente e não tem o que pagar. Travar aqui seria fechar a loja para cobrar entrada. O que o protege no lugar do pagamento é o teto de custo da própria rota pública e o teto por IP — dinheiro da casa gasto para VENDER, com limite, é custo de aquisição; sem limite seria torneira aberta.",
  },
  "lib/agency/comercial/qualificar.ts": {
    porque: "lê o anúncio/lead e decide se vale responder, e com que proposta. Roda ANTES de existir pedido: não há clientRequestId a que ligar um pagamento, e inventar um seria fabricar a prova que o portão existe para exigir. O gasto é limitado pelo volume de leads que a casa aceita processar, não por cliente.",
  },
  "lib/agency/execution/negotiate-proposal.ts": {
    porque: "escreve a contraproposta durante a negociação. É literalmente a conversa que ANTECEDE o pagamento — exigir pagamento aqui seria pedir que o cliente pague antes de saber o preço.",
  },
  "lib/agency/esteira/triagem.ts": {
    porque: "lê o briefing recém-chegado para saber o que o prospect quer. O pedido acabou de nascer com status `new` e ninguém cobrou nada ainda; é este passo que produz a informação com a qual se COBRA.",
  },
  "lib/agency/esteira/producao-de-pedido.ts": {
    porque: "apesar do nome, não produz entregável: monta o ORÇAMENTO do pedido novo. É pré-venda — o texto que sai daqui é a proposta que o cliente vai ler para decidir se paga.",
  },
  "lib/agency/execution/create-project-from-request.ts": {
    porque: "cria a linha do projeto a partir do briefing aceito. Roda no instante do aceite, ANTES de a esteira começar; o projeto nasce e fica parado esperando o portão de pagamento liberar a produção. Criar a ficha não gasta nada do cliente — produzir gasta, e produzir é do outro lado da trava.",
  },
  "lib/dioli-brain/pm-orchestrator.ts": {
    porque:
      "o PM PROPÕE o projeto (escopo, departamentos, plano) a partir do briefing — é a peça " +
      "de planejamento que sustenta a proposta comercial, e roda em `create-project-from-request` " +
      "e no `/api/brain/orchestrate`, ambos ANTES de existir pedido pago. Travá-lo seria travar " +
      "a vitrine: o cliente não pode pagar por um projeto que a casa ainda não sabe orçar. " +
      "O que ele NÃO faz é entregável — nenhuma peça sai daqui.",
  },

  // ── INTERNO: a casa gastando na casa ──────────────────────────────────────
  "app/api/generate-image/route.ts": {
    porque: 
      "a prancheta de design da agência (/agency/design-agent). Não recebe projeto nem pedido: o opera" +
      "dor digita um prompt e olha o resultado, e nada disso vira entregável sozinho. Não há clientReq" +
      "uestId a que ligar um pagamento. No lugar da trava de dinheiro, o que a protege é sessão de AGÊ" +
      "NCIA obrigatória (sessão de portal é recusada), guarda de CSRF e teto de 10 imagens por minuto " +
      "por USUÁRIO — chave do balde é só o userId, porque com IP na chave trocar de IP dava balde novo" +
      ".",
  },
  "app/api/admin/reset-request/route.ts": {
    porque: 
      "diagnóstico de admin: reexecuta um pedido para REVELAR o erro real que a esteira engole como 'I" +
      "A indisponível'. Existe para consertar cliente parado, e travá-lo por pagamento tornaria imposs" +
      "ível diagnosticar justamente o pedido que está preso. Protegida por segredo de admin, e a produ" +
      "ção que ela dispara passa por `runProjectExecution`, que TEM o portão — o que ela contorna é o " +
      "diagnóstico, nunca a trava.",
  },
  "app/api/ai/run/route.ts": {
    porque: 
      "console de IA do time: alguém da agência faz uma pergunta e lê a resposta. Nenhuma peça é grava" +
      "da, nenhum cliente recebe nada. Sem projeto do outro lado, não há pagamento a exigir; o que a p" +
      "rotege é sessão de agência.",
  },
  "app/api/brain/reason/route.ts": {
    porque:
      "o Brain raciocinando para o TIME sobre a própria operação. A saída é leitura interna, não entre" +
      "gável — nada daqui chega ao cliente sem alguém transformar em peça, e essa transformação passa " +
      "pela esteira guardada. No lugar da trava de dinheiro, o que a protege é sessão de AGÊNCIA obrig" +
      "atória (sessão de portal com clientId é recusada) e guarda de CSRF.",
  },
  "app/api/agents/ads/generate/route.ts": { porque: 
      "gerador manual do time: alguém da agência clica e vê um rascunho de anúncio na tela. O rascunho" +
      " não vira entrega sozinho — quem entrega é a esteira, que tem o portão. Protegido por sessão de" +
      " agência." },
  "app/api/agents/brand/analyze/route.ts": { porque: 
      "análise de marca pedida à mão pelo time, para leitura interna. Não grava entregável e não chega" +
      " ao cliente por si. Protegida por sessão de agência." },
  "app/api/agents/design/generate/route.ts": { porque: 
      "gerador manual do time: rascunho de direção de design na tela do operador. Não vira entrega soz" +
      "inho — a peça que o cliente recebe sai da esteira, guardada. Protegido por sessão de agência." },
  "app/api/agents/operations/generate/route.ts": { porque: 
      "gerador manual do time para texto de operação interna. Nada daqui é entregue ao cliente. Proteg" +
      "ido por sessão de agência." },
  "app/api/agents/pm/generate/route.ts": { porque: 
      "gerador manual do time: o PM pedindo um plano na tela. É insumo de decisão do operador, não ent" +
      "regável. Protegido por sessão de agência." },
  "app/api/agents/social/generate/route.ts": { porque: 
      "gerador manual do time: rascunho de post na tela do operador, para ele ver e decidir. A peça qu" +
      "e o cliente recebe nasce na esteira, guardada. Protegido por sessão de agência." },
  "app/api/social-posts/generate/route.ts": { porque: 
      "geração de post disparada à mão pelo time no painel. Mesma razão dos demais geradores manuais: " +
      "é o operador olhando, e a entrega ao cliente passa pela esteira. Protegido por sessão de agênci" +
      "a." },
  "app/api/portal/messages/suggest/route.ts": { porque: 
      "SUGERE ao time uma resposta para a mensagem do cliente — a sugestão aparece para o operador, e " +
      "nada é enviado sem alguém apertar enviar. Não é produção: é ajuda de redação para quem atende. " +
      "Protegido por sessão de agência." },
  "lib/marketplaces/99freelas/redator.ts": {
    porque:
      "prospecção da PRÓPRIA agência em marketplace de freelancer: redige a proposta candidata a " +
      "partir de um projeto PÚBLICO lido no 99Freelas, e julga o texto pelo juiz editorial. Roda " +
      "ANTES de existir pedido — não há clientRequestId a que ligar pagamento, e inventar um seria " +
      "fabricar a prova que o portão existe para exigir. Mesma família de `radar-agent.ts`: o " +
      "cliente aqui é a casa, e a casa não cobra de si mesma. O gasto é limitado pelo `--limite` " +
      "da rodada e pela cota de conexões da plataforma, nunca por cliente. Nada é enviado: o " +
      "resultado para como `Oportunidade` com `status: \"nova\"`, esperando o clique do CEO.",
  },
  "lib/agency/radar/radar-agent.ts": { porque: 
      "prospecção da PRÓPRIA agência: lê oportunidades de mercado para a Dioli vender. O cliente aqui " +
      "é a casa, e a casa não cobra de si mesma. Sem pedido, não há pagamento a exigir; o gasto é limi" +
      "tado pelo volume de oportunidades que o Radar aceita processar." },
  "lib/agency/produto-tecnologia/adaptador-tecnico.ts": { porque: 
      "produto interno da casa (a linha de tecnologia), não trabalho vendido a cliente de agência. Não" +
      " existe clientRequestId nesse caminho." },
  "lib/agency/esteira-assistida/adaptador-de-ia.ts": { porque: 
      "o piloto ASSISTIDO: cada passo é disparado e conferido por gente do time, e é essa presença hum" +
      "ana que faz o papel do portão — ninguém roda um lote sem olhar. É modo de ensaio da esteira, nã" +
      "o a esteira em produção." },
  "lib/agency/esteira/pm-responde.ts": { porque: 
      "redige a resposta do PM PARA O TIME sobre um pedido. Texto de coordenação interna; o que vai ao" +
      " cliente é outra coisa e passa por outro caminho." },
  "lib/agency/esteira/pacote-travado.ts": { porque: 
      "explica ao time, em português, por que um pacote travou. É diagnóstico da própria casa sobre a " +
      "própria esteira. Travá-lo por pagamento seria impedir a casa de descobrir por que o trabalho pa" +
      "rou — o oposto do que se quer." },
  "lib/agency/execution/quality-auditor.ts": {
    porque:
      
      "a Qualidade AUDITA texto que já existe e não produz entregável nenhum. Quem gastou para criar a" +
      "quele texto já passou (ou não) pelo portão; a auditoria herda a classe de quem a chamou — é cha" +
      "mada da esteira (produção, guardada), do orçamento do pedido (comercial) e da explicação de pac" +
      "ote travado (interno). E travá-la seria pior que inútil: faria a Qualidade PARAR DE JULGAR peça" +
      " de projeto sem pagamento registrado, quando o que se quer é que ela possa reprovar SEMPRE. Pôr" +
      " um portão aqui também exigiria inventar um clientRequestId onde nem sempre existe um — e portã" +
      "o que adivinha dono é portão que erra. (Classificação mantida por decisão do CEO em 24/08/2026." +
      ")",
  },
};
