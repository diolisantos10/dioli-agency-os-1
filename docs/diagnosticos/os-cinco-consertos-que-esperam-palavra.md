# Diagnóstico — os cinco consertos de posse que esperam a palavra do CEO

> **Pedido:** PM (`seguranca/posse-pagamento-parceria`), 29/08/2026.
> **Executado por:** `seguranca`.
> **Este conserto só vai ao ar com autorização explícita do CEO, por tocar
> pagamento e parceria.** Nada deste PR foi mesclado — ele nasce em RASCUNHO,
> escrito e provado, para que o intervalo entre a palavra do CEO e a proteção
> no ar seja de minutos, não de uma rodada de trabalho.

## O achado (varredura de 29/08/2026)

Cinco rotas aceitavam um id de cliente ou de pedido vindo do corpo ou da
query, e nunca conferiam se aquele id era do workspace de quem estava logado.
`isAgencyRole` responde "você é da agência"; nada nela responde "isto é seu".
O padrão é o mesmo que já foi consertado em 30+ rotas desta casa
(`lib/auth/posse-de-workspace.ts`) — aqui ele só não tinha chegado ainda, e
nas cinco rotas mais sensíveis que existem: as que mexem em dinheiro e em
parceria.

## As cinco rotas

| Arquivo | O que dava para fazer hoje sem ser convidado | O conserto em uma frase | Risco de aplicar (o que pode quebrar em dinheiro real) |
|---|---|---|---|
| `app/api/agency/parcerias/route.ts` (`POST`) | Um master de QUALQUER agência autorizava parceria — e portanto isentava de pagamento — o `clientId` de OUTRA agência, só copiando o id da tela dele. | `clienteDoWorkspace(clientId, session.workspaceId)` antes de chamar `autorizarParceriaDoCliente`; falhou, 404. | Baixo. Nenhum fluxo legítimo desta casa autoriza parceria fora do próprio workspace — `Client.workspaceId` é obrigatório no schema, não há órfão aqui. O único jeito de quebrar algo é se existir hoje um operador que administra clientes de mais de um workspace pela mesma sessão — não há evidência disso no código. |
| `app/api/agency/parcerias/route.ts` (`DELETE`) | O mesmo master revogava a parceria de um cliente alheio — negando serviço a um parceiro que não é seu. | `clienteDoWorkspace(clientId, session.workspaceId)` antes de chamar `revogarParceriaDoCliente`; falhou, 404. | Baixo — mesma análise da linha acima. |
| `app/api/agency/convites-de-parceria/route.ts` (`POST`) | O mesmo master cunhava, para o `clientId` de outra agência, um TOKEN que dispensa a pergunta de verba no briefing dele — uma credencial entregue sobre um cliente que não é seu. | `clienteDoWorkspace(clientId, session.workspaceId)` antes de chamar `cunharConviteDeParceria`; falhou, 404. | Baixo — mesma análise. O convite em si não move dinheiro, mas ele é a chave que abre a isenção do pedido seguinte; a superfície de risco é a mesma da parceria. |
| `app/api/admin/isencoes-de-parceria/route.ts` (`POST`) | O mesmo master concedia isenção de pagamento a um PEDIDO (`clientRequestId`) de outra agência — produção de graça no crédito de IA de um cliente que não é seu. | `solicitacaoDoWorkspace(clientRequestId, session.workspaceId)` antes de chamar `concederIsencaoDeParceria`; falhou, 404. | **Médio.** `ClientRequestDb.workspaceId` pode ser nulo (briefing público antigo, órfão legítimo desta casa). A política de órfã já existente (`posse-de-workspace.ts`) cobre isso via `clientId` ou via "workspace único" — mas se algum operador hoje concede isenção para um pedido órfão SEM cliente vinculado, numa base com mais de um workspace, essa concessão passa a ser recusada (fail-closed) até o pedido ser vinculado a um cliente do workspace certo. É a mesma régua que o resto da casa já segue, mas é uma régua nova PARA ESTA ROTA. |
| `app/api/admin/pagamentos/route.ts` (`POST`) | O mesmo master registrava, num PEDIDO de outra agência, uma testemunha de pagamento manual (`origem: "manual"`) — uma afirmação de que dinheiro entrou que libera a esteira de produção de um projeto que não é seu. | `solicitacaoDoWorkspace(clientRequestId, session.workspaceId)` antes de chamar `registrarPagamento`; falhou, 404. | **O mais alto dos cinco.** Esta rota é a instrução gêmea da recusa "mande o comprovante que a gente confirma e libera na hora" — é o caminho real de um Pix sendo confirmado. Se hoje existir qualquer operador que registra pagamento de um pedido antes dele estar vinculado ao workspace certo (por exemplo, um pedido que chegou órfão e ainda não foi triado), a confirmação passa a ser recusada com 404 até o vínculo existir — atrasando a liberação da produção de um cliente que JÁ PAGOU. É o caso em que "consertar a posse" pode, por um instante, parecer "quebrar o pagamento" para quem opera. |

## ✅ Prova de mutação — medida pelo PM, não afirmada

O PM removeu **cada conserto, um de cada vez** (`git checkout --` no arquivo da
rota), rodou o teste novo e anotou o que ficou vermelho. Nenhuma linha abaixo é
afirmação: é a saída do `vitest`.

| Conserto removido | Testes que ficaram VERMELHOS |
|---|---|
| `app/api/agency/parcerias/route.ts` | `clientId do VIZINHO: 404 e autorizarParceriaDoCliente NUNCA é chamada` **e** `clientId do VIZINHO: 404 e revogarParceriaDoCliente NUNCA é chamada` (2 de 10) |
| `app/api/agency/convites-de-parceria/route.ts` | `clientId do VIZINHO: 404 e cunharConviteDeParceria NUNCA é chamada` (1 de 10) |
| `app/api/admin/isencoes-de-parceria/route.ts` | `clientRequestId do VIZINHO: 404 e concederIsencaoDeParceria NUNCA é chamada` (1 de 10) |
| `app/api/admin/pagamentos/route.ts` | `clientRequestId do VIZINHO: 404 e registrarPagamento NUNCA é chamada` (1 de 10) |

Com os cinco consertos no lugar: **10 de 10 verdes**. Sem cada um: cai o teste
da rota correspondente, e **só ele** — a outra metade (o id próprio passando com
os mesmos argumentos de hoje) continua verde nas duas condições, que é a prova
de que a trava não inventa problema no caso limpo.

**O portão inteiro, medido:** `npx tsc --noEmit` limpo (saída vazia, código 0);
`npm run build` verde; suíte completa **536 de 536 arquivos verdes, 7.454
testes passados, zero falhas**.

Antes do rebase sobre o deploy, um arquivo ficava vermelho —
`__tests__/coordenacao/registro-de-reivindicacao.test.ts`, por uma colisão de
reivindicação entre duas OUTRAS frentes (`higiene-de-fila` ×
`triagem-prs-parados`, sobre `docs/diagnosticos/triagem-dos-prs-parados-28-08.md`).
Não era deste PR: a colisão foi encerrada no remoto depois que esta worktree
nasceu, e o `git pull --rebase` a resolveu sozinho. Fica registrado porque
vermelho que some sem ninguém explicar por quê é vermelho que volta.

## ⚠️ Achado colateral — três testes existentes iam para VERMELHO (JÁ CONSERTADO)

O `seguranca` previu isto por leitura de código, e o portão do PM **confirmou**:
com os cinco consertos e mais nada, a suíte fechava em **4 arquivos vermelhos /
31 testes falhados**. Os três abaixo foram consertados numa segunda rodada —
**no dublê, nunca na rota** (ver "o que mais precisou mudar"). O texto original
do achado fica preservado abaixo, porque é o diagnóstico que levou ao conserto.

- `__tests__/produtos/story-instagram-v1-ponta-a-ponta.test.ts` e
  `__tests__/produtos/o-feed-nao-cobra-por-texto.test.ts` — os dois encenam
  `getSession` com `workspaceId: null` para o operador que chama
  `POST /api/admin/pagamentos` (comentário no próprio arquivo: "só `getSession`
  é encenado"). Com o conserto, `solicitacaoDoWorkspace(clientRequestId, null)`
  não bate com o pedido real (que nasce com `workspaceId` do workspace criado
  no próprio teste) e a rota devolve 404 em vez do 200 que os testes esperam
  (`expect(r.status, ...).toBe(200)`).
- `__tests__/financeiro/porta-da-isencao.test.ts` — não mocka
  `@/lib/db/client`; com o conserto, `POST /api/admin/isencoes-de-parceria`
  passa a fazer uma leitura de banco real ANTES da checagem de negócio, e o
  `clientRequestId` fictício (`"req_foocci"`) não existe em lugar nenhum — a
  rota passa a devolver 404 em vez dos 200/400/409 que a suíte espera.

**Por que isto não é uma "sexta rota furada" e não foi consertado aqui:** não
é um furo de posse — é o session mock desses três arquivos não carregar
`workspaceId` real, coisa que a sessão de produção SEMPRE carrega
(`app/api/auth/signin/route.ts:97` — `workspaceId: user.workspaceId`, campo
obrigatório no schema). `workspaceId: null` nunca acontece num login de
verdade; é debt do arranjo de teste, exposto pelo conserto certo. Consertar
os três arquivos de teste está FORA do escopo desta ficha (ela autoriza
mexer nas cinco rotas e escrever teste NOVO em `__tests__/seguranca/`, não
editar suíte alheia) — e cada um pode colidir com a reivindicação de quem
escreveu aquele teste. Registrado aqui para o PM decidir: ou inclui o ajuste
de mock nesses três arquivos no mesmo PR (uma linha cada:
`workspaceId: ws.id` / mockar `@/lib/db/client`), ou os marca cientes de que
vão para vermelho até alguém ajustar.

> **Decisão do PM, 29/08/2026:** incluir o ajuste no mesmo PR. PR que se mescla
> "em minutos" com a suíte vermelha não se mescla em minutos — e vermelho aqui
> travaria o deploy da casa inteira (o Railway recusa branch vermelho, e com
> razão). O ajuste foi despachado de volta ao `seguranca`, e o resultado está na
> seção "o que mais precisou mudar". **Nenhum dos três arquivos tinha
> reivindicação viva** — conferido em `reivindicacoes/` antes do despacho.

## O que NÃO mudou (garantido, não só declarado)

- **Nenhuma regra de negócio de pagamento, isenção, teto, prazo ou
  idempotência foi tocada.** As cinco funções de biblioteca
  (`autorizarParceriaDoCliente`, `revogarParceriaDoCliente`,
  `cunharConviteDeParceria`, `concederIsencaoDeParceria`,
  `registrarPagamento`) não foram editadas — só passaram a ser chamadas
  DEPOIS de uma checagem que hoje não existe.
- **Nenhuma mensagem de sucesso ou de recusa mudou.** Quando o id vem vazio,
  a resposta continua sendo a recusa de negócio de sempre (`sem_cliente`,
  `sem_pedido`, 400) — a checagem de posse só entra quando o id **existe e é
  de outro workspace**, e aí a resposta é 404, nunca 403 (403 confirmaria que
  o id existe — oráculo de enumeração).
- **Nenhum 403 pré-existente foi tocado.** Os três 403 de `portal/materiais`,
  `portal/approvals` e `portal/pedidos/responder`, anotados na varredura de
  29/08, continuam como estavam — não são desta rodada.

## O que mais precisou mudar, e por quê (segunda rodada, 29/08/2026)

Os três arquivos apontados na seção anterior foram ajustados — no **dublê**,
nunca na rota nem na regra de negócio. Nenhuma trava foi afrouxada; as três
mudanças só ensinam o dublê a parar de encenar um estado que a autenticação
real não produz.

- **`__tests__/produtos/story-instagram-v1-ponta-a-ponta.test.ts`** — o
  `getSession` encenado devolvia `workspaceId: null`. Isso nunca acontece num
  login de verdade (`Session.workspaceId` é `string`, obrigatório no schema) —
  então o teste protegia um caminho que a produção não tem, e mascarava
  `solicitacaoDoWorkspace` recusando o próprio pagamento do cliente do teste,
  fazendo `pagar()` cair em 404 antes de qualquer coisa. Passou a devolver o
  `workspaceId` **real** do workspace que o próprio `beforeAll` cria — lido de
  forma preguiçosa, dentro da função assíncrona do dublê (que só executa
  quando `getSession()` é chamada, já dentro do teste), porque `vi.mock` é
  içado e roda antes de `let workspaceId = ""` ser inicializado.
- **`__tests__/produtos/o-feed-nao-cobra-por-texto.test.ts`** — mesmo defeito,
  mesmo conserto: `workspaceId` real, lido de forma preguiçosa.
- **`__tests__/financeiro/porta-da-isencao.test.ts`** — o assunto deste
  arquivo são as GUARDAS da rota (dono da sessão, fail-closed, idempotência,
  respostas), nunca a posse. Sem dublê de posse, `solicitacaoDoWorkspace`
  caía no Prisma de verdade, não achava o `clientRequestId` fictício
  (`"req_foocci"`) em banco nenhum, e a rota devolvia 404 em todo caso que
  passasse das guardas — mascarando exatamente o que este arquivo existe para
  provar. Ganhou um dublê de `@/lib/auth/posse-de-workspace` que sempre
  responde "é seu" (`solicitacaoDoWorkspace: async () => true`), com
  `naoEncontrado` preservado real via `importOriginal`. **A posse não ficou
  sem prova**: ela já é exercitada, de verdade, contra um banco fiel ao
  `where` — incluindo o caso do `clientRequestId` do vizinho devolvendo 404 —
  em `__tests__/seguranca/posse-nas-cinco-rotas-de-pagamento-e-parceria.test.ts`,
  bloco `POST /api/admin/isencoes-de-parceria`. Dublar o Prisma neste arquivo
  também, honrando o `where`, duplicaria aquela prova sem acrescentar trava
  nova.

**Garantia:** nenhuma linha das cinco rotas foi tocada nesta rodada, nenhuma
linha das cinco funções de biblioteca foi tocada, nenhuma regra de valor,
isenção, teto ou prazo foi tocada, e
`__tests__/seguranca/posse-nas-cinco-rotas-de-pagamento-e-parceria.test.ts`
segue intacto. O que mudou foi só a fidelidade do dublê ao que a autenticação
real produz — e, num arquivo, a fronteira do que aquele arquivo se propõe a
provar.

## O que ficou impedido, e por quê

- **O merge.** O PR nasce em RASCUNHO e não se mescla — SEGURANÇA §3/§8 desta
  casa exige autorização humana explícita para qualquer correção que toque
  pagamento ou parceria, sem exceção.
- **Qualquer chamada real.** Nenhum teste tocou banco de produção, gateway de
  pagamento ou provedor de IA — os cinco testes usam Prisma mockado e as
  funções de biblioteca mockadas; a prova é de que a TRAVA funciona, não uma
  execução contra dado real.
