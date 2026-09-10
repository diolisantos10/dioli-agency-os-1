# A promessa que ninguém cumpre — 29/08/2026

> **O defeito, em uma frase:** o SDR dizia ao lead *"nossa equipe entra em contato
> com você"* e **nada nesta casa fazia essa promessa aparecer para alguém.**
> Existia a régua que impede a máquina de prometer mal. Não existia o cumprimento.
>
> Assinatura de defeito: **trava construída sem fechadura** — a décima quarta
> ocorrência. A pergunta que resolve é sempre a mesma: **quem CHAMA isto?**

---

## 1. A MEDIÇÃO — o que acontecia com o lead, antes deste PR

Cada resposta abaixo tem `arquivo:linha`. Onde a resposta é "nada", vai a busca
que provou o nada — *ausência de informação não é informação*.

### 1.1 A conversa do SDR "encerra"? Não — não existe evento de fim

A rota é sem estado, chamada turno a turno. Cada turno grava duas coisas:

| O quê | Onde se escreve | Quem chama |
|---|---|---|
| `PortalMessage` (o texto do turno) | `lib/agency/comercial/registro-da-conversa.ts:197` | `app/api/sdr/chat/route.ts` |
| `ActivityEvent` tipo `conversa_sem_pedido` (o **rastro**) | `lib/agency/comercial/conversa-sem-pedido.ts` | `app/api/sdr/chat/route.ts:929` |

O `PortalMessage` nasce `readByTeam: true` (`registro-da-conversa.ts:262-267`) —
**de propósito não vira fila de "não lida"**. E o rastro é reescrito a cada
turno, sobrescrevendo `timestamp`: *"encerrada" é inferido depois, por o
`timestamp` parar de mudar*, nunca marcado.

**Nenhum dos dois guardava "aqui a casa prometeu alguma coisa".**

### 1.2 Existia fila? **Sim — e ninguém a lia.**

- Os dados: `ActivityEvent` tipo `conversa_sem_pedido`, lidos por
  `conversasSemPedido()` (`lib/agency/comercial/conversa-sem-pedido.ts:389`).
- A porta de leitura: `GET /api/agency/conversas-sem-pedido`
  (`app/api/agency/conversas-sem-pedido/route.ts:35`).
- **A prova do nada:**
  `grep -rn "conversas-sem-pedido" app components --include=*.tsx` → **vazio**.
  Nenhuma tela desta casa chamava a rota.

O achado mais duro é que o cabeçalho da própria rota, escrito no dia em que ela
nasceu, já dizia (`route.ts:6-18`):

> *"Guardar sem porta de leitura seria a sétima trava sem fechadura desta casa…
> **A pergunta obrigatória é 'quem CHAMA isto?'**… Um rastro que nenhuma tela e
> nenhuma rota alcançam é exatamente o defeito que este conserto existe para matar."*

A rota foi construída para não repetir o defeito — **e o defeito se repetiu uma
camada acima**, na tela que nunca veio. Ter escrito a lição no arquivo não
substituiu ter ligado o fio.

### 1.3 O despertador não pega este lead

`lib/agency/despertador.ts:1013-1029` chama `promoverConversasParadas()` a cada
5 min. Mas ela só age quando o dono é **parceiro com parceria viva**
(`lib/agency/comercial/promover-conversas-paradas.ts:187-190`). Para o lead
anônimo comum, `donoDeclaradoDoRastro` devolve `null` e o rastro cai em
`semParceria` — e o próprio comentário do despertador (`:1022-1023`) declara que
esse caso *"é o caminho de sempre (parada com dono humano)"*. **O caminho de
sempre não existia.**

### 1.4 As quatro telas — nenhuma mostrava este lead

| Tela | Arquivo | Fonte | Aparecia? |
|---|---|---|---|
| Solicitações | `app/agency/requests/page.tsx:545` | `ClientRequestDb` via `useDbRequests("new,scope_ready,needs_revision")` | **Não** — sem `ClientRequestDb`, não há linha |
| Quem procurou | `app/agency/leads/page.tsx` | `GET /api/agency/leads` → `listClientRequests({status:"new,lead_incompleto"})` (`app/api/agency/leads/route.ts:23-27`) | **Não** — mesmo motivo |
| Pipeline | `app/agency/pipeline/page.tsx:23` | `useAgencyStore()` — **Zustand no `localStorage` do navegador** | **Não**, e por motivo pior: não lê banco nenhum |
| Caixa de entrada | `app/agency/inbox/page.tsx` → `CaixaDeEntrada.tsx:88` | `GET /api/messages`, escopo `clientId ∈ Clients` OU `clientRequestId ∈ ClientRequestDb` (`app/api/messages/route.ts:73-80`) | **Não** — o fio `sdr:…` não bate em nenhum dos dois |

### 1.5 Campo de "quando prometeu" / "quando vence"

**Não existia.** Prova:
`grep -rn "prometidoEm\|prazoDaPromessa\|promessaAte\|responderAte\|contatoAte\|deadlineDeContato" lib prisma docs`
→ **vazio**.

### 1.6 ⚠️ O PRAZO — e a correção de uma afirmação fácil de fazer e errada

A primeira redação deste diagnóstico ia dizer *"ninguém nesta casa definiu prazo
de resposta"*. **É falso, e o erro é do tipo que esta casa paga caro.** O número
existe, em dois lugares, e **nenhum deles é decisão registrada**:

- `components/agency/briefing/PublicBriefingRoom.tsx:835` — diz **a pessoas
  reais, na tela pública**: *"nossa equipe revisa o escopo, prepara uma proposta
  formal e entra em contato **em até 24h úteis**"*. Texto cravado em JSX.
- `lib/agency/v2-recovery/detector-de-parados.ts:16` —
  `SLA_POR_ESTADO_HORAS.intake = 24`, com o próprio comentário se declarando
  *"régua inicial — ajustável por decisão"*.
- `grep -rn "24h úteis" docs/ --include=*.md` → **vazio**. Zero decisão em
  `docs/decisoes.md`.

**Duas fontes, o mesmo número, nenhuma ratificação.** Um número que a casa DIZ ao
cliente mas nunca decidiu não é prazo — é dívida de decisão. E "24h **úteis**"
ainda exigiria calendário de expediente e feriado que esta casa não tem.

Por isso a fila mostra **fato** ("prometido há N dias"), nunca **atraso**.
🔴 **Sobe para o CEO: ratificar o SLA.** Enquanto não ratificar, `venceEm` é
`null` e a tela diz por quê, com todas as letras, no rodapé da seção.

---

## 2. O QUE FOI LIGADO — e quem chama cada coisa em produção

> Nenhum item abaixo entra sem o endereço do chamador. **Mecanismo sem chamador
> é o defeito, não o conserto.**

### 2.1 O carimbo: quando a casa prometeu

| Mecanismo | Onde mora | **Quem chama em produção** |
|---|---|---|
| `prometeuContatoHumano(texto)` — reconhece a EQUIPE prometendo contato | `lib/agency/esteira/promessa-de-contato.ts` | `app/api/sdr/chat/route.ts:1539` |
| Gravação de `prometidoEm` na carga do rastro (v4) | `lib/agency/comercial/conversa-sem-pedido.ts:287-299` | `app/api/sdr/chat/route.ts:1541` (`guardarRastroDoTurno(..., true)`) |
| Leitura de `prometidoEm` para quem consulta a fila | `lib/agency/comercial/conversa-sem-pedido.ts:429-430` | `app/api/agency/conversas-sem-pedido/route.ts:98` |
| `proximaAcaoDoRastro` muda o tom quando há promessa | `lib/agency/comercial/conversa-sem-pedido.ts:452` | mesma rota, `route.ts` |

**A primeira promessa é a que vale.** `prometidoEmAnterior ?? (…)`
(`conversa-sem-pedido.ts:285-288`): um turno posterior que repita *"a equipe
entra em contato"* **não reinicia o relógio**. É a mesma lei que o arquivo já
aplicava a `atribuicao`, e ela existe porque uma dívida tem data de origem.

**O carimbo roda no único caminho em que a fala chega ao cliente.** Medido:
`grep -n "reply:" app/api/sdr/chat/route.ts` devolve **um único** ponto de saída
com fala (`route.ts:1573`); todos os outros `NextResponse.json` da rota são
recusas (`bad_request`, `teto_de_custo`, `price_leak`, `email_hallucination`),
que não entregam texto ao visitante. O carimbo está em `:1539`, acima de `:1573`.

### 2.2 A fechadura: a fila ganhou tela

| Mecanismo | Onde mora | **Quem chama em produção** |
|---|---|---|
| `carregarConversasParadas()` — o `fetch` da rota | `app/agency/leads/page.tsx:143-145` | `app/agency/leads/page.tsx:177` (dentro do `useCallback`/`useEffect` da página) |
| `SecaoConversasParadas` — a seção que a pessoa lê | `app/agency/leads/page.tsx:259` | `app/agency/leads/page.tsx:247` |
| `ordemDaFila` — dívida mais velha em cima | `app/agency/leads/page.tsx:94` | `app/agency/leads/page.tsx:322` |

**Não nasceu fila nova.** A fila (dados + rota) já existia; o que faltava era o
consumidor. E ele entrou na tela que já tinha essa missão declarada no próprio
cabeçalho — *"a UMA COISA que se vem fazer aqui: decidir se aborda"*
(`app/agency/leads/page.tsx:11`). Construir ao lado do que já existe foi o
defeito de 16/08; aqui não se construiu ao lado.

---

## 3. A PROVA — o que os testes alcançam, e o que não alcançam

`__tests__/agency/promessa/` — 73 casos, todos verdes.

| Arquivo | O que prova |
|---|---|
| `promessa-de-contato.test.ts` | a régua reconhece *"nossa equipe entra em contato"* e *"vou levar isso para a equipe"*; **não** reconhece fala neutra |
| `carimbo-da-promessa-no-rastro.test.ts` | rastro nasce com `prometidoEm` quando prometeu e `null` quando não; **turno posterior não reinicia o relógio**; conversa que virou pedido **some da fila** |
| `rota-conversas-sem-pedido.test.ts` | a rota devolve `prometidoEm`, `venceEm: null` e o motivo com o **endereço da evidência** do SLA |
| `carregamento-das-conversas-paradas.test.ts` | a **URL chamada** é `/api/agency/conversas-sem-pedido`; 503 e `fetch` que lança viram `nao_medido`, **nunca lista vazia** |
| `tela-conversas-paradas.test.tsx` | **o que a pessoa LÊ**: o destaque da promessa aparece; sem promessa não aparece; o número/e-mail é impresso; falha vira "não medido" |
| `ordem-da-fila.test.ts` | promessa mais velha em cima; array de entrada não é mutado |
| `fiacao-leads-chama-conversas-paradas.test.ts` | a página **usa** `carregarConversasParadas` e monta `<SecaoConversasParadas>` |

### ⛔ O que a prova NÃO alcança — dito com todas as letras

- **Esta casa não tem jsdom nem testing-library** (`vitest.config.ts`:
  `environment: "node"`, render por `react-dom/server`). **`useEffect` não roda
  em teste aqui.** Por isso o teste de fiação é **leitura de código-fonte**: ele
  pega alguém apagar a chamada; **não** pega a chamada existir e não montar.
  Isso está escrito no cabeçalho do próprio arquivo de teste.
- Uma trava de render honesta exigiria jsdom. **Fica declarado como dívida** —
  não foi instalada dependência nova nesta frente.

### A trava contra "melhorar" a tela para pior

O teste de tela exige que o HTML renderizado **não contenha** `href="mailto:`,
`wa.me`, `<a ` nem `onclick`. A fila mostra o canal para a pessoa LER; ela não é
porta de disparo. Sem essa trava, a próxima rodada transforma uma tela de
leitura em uma que fala com cliente real.

---

## 4. MEDIDO AO VIVO — a tela, em três tamanhos

Servidor local em **porta fixa 3411**, banco **próprio** desta worktree
(`dev-promessa.db`, semeado com três rastros de teste — confirmado que o
workspace lido é o meu antes de acreditar em qualquer captura).
**Custo: US$ 0,00** — nenhuma chamada de IA, nenhum e-mail, nenhuma notificação.

O que a pessoa lê, em 375px, 768px e 1440px:

```
COMERCIAL / Quem procurou a Dioli

Conversas que pararam na sala   [2 com promessa de contato pendente]
Conversas do SDR que pararam antes de virar briefing — inclusive as que a casa prometeu retomar.

  Nome não informado · 4 turnos · parada há 6 dias
  [Sem como falar com esta pessoa] [⚑ Prometemos contato há 6 dias]
  Studio Vertice (Arquitetura) — tráfego pago
  A casa PROMETEU contato sem ter canal nem nome — a dívida existe e não há a quem cobrar.

  Aurora Lima · 9 turnos · parada há 3 dias
  [WhatsApp] [⚑ Prometemos contato há 3 dias]
  WhatsApp: 5511900000001
  Padaria Aurora (Alimentacao) — redes sociais
  A casa PROMETEU contato e ainda não cumpriu — responder por WhatsApp é dívida, não sugestão.

  Ivo · 2 turnos · parada há 1 dia
  [E-mail]  E-mail: ivo@exemplo.invalid
  Bike Sul — sem serviço declarado ainda
  Retomar por e-mail: a conversa parou com escopo pela metade e o canal está declarado.

A casa ainda não ratificou em quantas horas responde — por isso esta lista mostra
há quanto tempo, não atraso.
```

### O que a captura ao vivo pegou e o teste não pegava

1. **A ordem estava errada para uma fila de dívida.** A rota ordena
   `timestamp: desc` (contrato próprio, documentado nela). Na tela isso punha
   quem espera **há 1 dia** acima de quem espera **há 6** — e contradizia o
   subtítulo da própria página, *"O mais antigo em cima"*. Consertado **na
   tela** (`ordemDaFila`), sem mexer no contrato da rota.
2. **O selo contava a fila de baixo e morava no cabeçalho da de cima:** o topo
   dizia *"2 com promessa de contato pendente"* logo acima de *"Ninguém
   esperando"*. Dois totais de filas diferentes no mesmo cabeçalho. O selo foi
   para junto do `<h2>` da seção que ele conta.
3. **A tela dizia "WhatsApp" e nunca mostrava o número.** Achado do
   `experiencia`, que **segurou o PR** por ele: `contato.whatsapp` e
   `contato.email` só decidiam a palavra do selo; o valor nunca chegava ao JSX.
   É *"convidado a agir sobre o que não pode ver"* — quem quisesse cumprir a
   promessa teria de sair da tela e caçar o número no banco. Corrigido: o valor
   é impresso, **texto puro, sem link e sem clique**.

Autoavaliação da tela: **hierarquia 9 · tipografia 9 · espaçamento 8 ·
consistência 9**. (O vão grande acima da seção é o `EmptyState` da lista de
leads, que já existia e não foi tocado.)

---

## 5. ⛔ O QUE FICOU DECLARADO E NÃO FEITO

1. 🔴 **O SLA não está ratificado.** A casa promete *"24h úteis"* ao cliente
   (`PublicBriefingRoom.tsx:835`) sem nunca ter decidido isso. **Decisão do
   CEO.** Enquanto não vier, `venceEm` é `null` e a fila mostra idade, não atraso.
2. ⛔ **A fila não tem nenhuma ação.** Não há "já abordei", não há atribuir.
   `POST /api/agency/conversas-sem-pedido/atribuir` **existe e continua sem
   chamador de tela** — a trava sem fechadura seguinte, herdada e agora
   nomeada. Um card sem canal nunca sai desta lista: fica crescendo "há N dias"
   para sempre. **A próxima rodada não pode ser só leitura de novo**, ou a fila
   vira decoração.
3. ⛔ **Promessa em conversa de escopo vazio não é registrada.**
   `guardarRastroDaConversa` recusa gravar quando o escopo está vazio
   (`conversa-sem-pedido.ts:252`) — regra anterior e correta (evita uma linha
   por visitante que só disse "oi"). Consequência: se o SDR prometer contato
   antes de a pessoa contar qualquer coisa, **a dívida não aparece**. Não foi
   mexido: afrouxar isso inundaria a fila. Fica medido.
4. ⛔ **Duas listas de padrões para a mesma família de fala.** O branch
   **não mesclado** `origin/claude/p0-o-convite-nao-foi-reconhecido` tem
   `PROMESSA_POR_TERCEIRO`, que reconhece falas parecidas para outro fim.
   **Quando aquele PR mesclar, os dois têm de passar a compartilhar UMA fonte
   de padrão.** Não foi unificado agora porque aquele arquivo está reivindicado
   por outra frente nesta mesma janela. Está escrito no cabeçalho de
   `lib/agency/esteira/promessa-de-contato.ts`.
   **A decisão do PR #356 não foi tocada, revertida nem afrouxada.**
5. ⛔ **Sem jsdom, não há prova de que o `useEffect` roda.** Ver §3.
6. ⛔ **Achado de terceiros, não consertado:**
   `lib/agency/comercial/atribuir-conversa-orfa.ts:181` grava `v: 3 as const`
   mesmo quando a carga já é v4. O campo sobrevive (spread), mas a etiqueta de
   versão passa a mentir. Fora da reivindicação desta frente.
7. ⛔ **Achado de terceiros, não consertado:** o Pipeline (`/agency/pipeline`)
   não lê banco nenhum — é `localStorage` do navegador. E o SLA de 24h que já
   existe em código para `ClientRequestDb` está **inerte**: depende de
   `estadoCanonico`, preenchido por backfill que só roda por
   `POST /api/v2/rollout`, e `grep -rln "api/v2/rollout"` não acha **nenhum
   chamador automático**.

---

## 6. Os dois itens menores, no mesmo PR

### 6.1 Três rotas do portal: 403 → 404

403 confirma que o recurso existe e vira oráculo de enumeração. Trocado onde a
negativa é de **posse** — nunca onde é de sessão.

| Onde | O que era | Virou |
|---|---|---|
| `app/api/portal/materiais/route.ts:235` | 403 em `findFirst({id, status, project:{clientId}})` vazio | **404** |
| `app/api/portal/approvals/route.ts:151` | 403 em `!belongsToToken` (o approval existe, é de outro) | **404**, com a **mesma mensagem** do "não existe" (`:121`) |
| `lib/agency/esteira/porta-da-pergunta.ts:186` | 403 em `findFirst({id, clientId})` vazio — única saída HTTP de `pedidos/responder` | **404** |

Ficaram como estavam, por não serem posse: `approvals:106` (token
inválido/expirado) e `approvals:82` (CSRF por origem).

Testes em `__tests__/agency/promessa/404-do-portal/` — um por rota, **as duas
metades de toda trava**: quem não é dono recebe 404 com corpo indistinguível de
"não existe", **e o dono legítimo continua recebendo 200**.

### 6.2 A linha da tabela da Meta

`docs/plataformas/meta/passo-a-passo-do-ceo.md` apontava *"Clientes → Redes"*
como evidência de `pages_read_engagement`. **Aquela tela é só de Instagram** —
`components/agency/clients/RedesDoCliente.tsx` rotula "Instagram" e consome
`conexaoDoCliente(..., "instagram")` (`lib/integrations/meta/leitura.ts:189`).

A célula virou **lacuna declarada**: **não existe hoje nenhuma tela desta casa
que exiba conteúdo de Página do Facebook.** O único código que toca Página é
`publishFacebook` (`lib/integrations/meta/client.ts:197`), e é **escrita**, não
leitura — não satisfaz o que o App Review pede ver no vídeo. Nenhuma tela foi
inventada para tapar o buraco.

---

## 7. O portão

- `npx tsc --noEmit` — **limpo**, rodado **depois** dos testes.
- `npx vitest run` — **544 arquivos, 7.503 casos verdes**, 1 skip.
- `npm run build` — **verde**.
- Captura ao vivo em 375 / 768 / 1440, servidor em porta fixa, banco próprio
  conferido antes de acreditar na imagem.
- **Custo: US$ 0,00.** Nenhum e-mail a pessoa real, nenhuma notificação real,
  nenhuma chamada de IA real, nada irreversível.
