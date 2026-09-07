# F5 — A agência assume o marketing dos nossos próprios produtos

> Método: código e documento já existentes no repositório, com arquivo:linha.
> Onde a fonte mora fora de `/home/user/diolidigital` (repositório do Foocci, do
> CityJobs ou do FOOCCI Manager), o sandbox deste agente recusa o acesso — fica
> declarado na seção 5, nunca preenchido por inferência.

## 0. O achado que muda a pergunta inteira: **isto não é hipotético — já está rodando**

A ficha pede para verificar "se um cliente interno cabe no modelo". A resposta
é: **Foocci e CityJobs já são `Client` de verdade no banco da Dioli Digital,
com projeto, briefing e peças produzidas.** Não é proposta — é fato registrado:

- **CityJobs** — `docs/modelo-de-negocio.md:75` ("Projeto da própria casa, com
  **preço de transferência**"). Registro de produção real em
  `docs/projetos/cityjobs-registro-07-08.md`: `Client` `cmsi72jjk00070pn2mn1sh9gj`,
  `Project` `cmsi72jkz00090pn2u1d59yac`, briefing (`ClientRequestDb`)
  `cmsi6yqza00000pn2msye27gl`, token de portal `cmsi72jjk00080pn225v06iu5`, e
  **6 peças já produzidas** (draft, `visibility: "interno"`). Preço de
  transferência: **R$ 3.490/mês + R$ 1.290 de implantação**
  (`docs/projetos/cityjobs-orcamento.md`, citado em `docs/modelo-de-negocio.md:519`).
- **Foocci** (a empresa, não o restaurante-cliente dela) — `docs/modelo-de-negocio.md:76`
  ("Parceiro interno, contabilizado como **a faturar**"). **6 carrosséis já
  produzidos e aprovados no portal em 06/08**
  (`docs/projetos/foocci/comparativo-06-08.md:7`). Preço de transferência:
  **R$ 2.050/mês** (`docs/decisoes.md`, 03/08/2026).
- **FOOCCI Manager** — nenhum `Client`, nenhum briefing, nenhuma peça. Só existe
  como referência em `docs/kit/CLAUDE.md` (espelho do `dioli-brain-kit`,
  possivelmente **21 dias desatualizado** — ver aviso no topo do repositório):
  *"POS/ERP de restaurante"*, listado entre os produtos **adormecidos**, sem
  Diretor, sem `CLAUDE.md`, sem pendência aberta. É o único dos três que
  **começa do zero**.

Consequência prática: a pergunta certa não é "cabe?" — é **"o que trava a
continuidade de dois clientes que já existem, e o que falta para abrir o
terceiro do zero"**.

---

## 1. O que a esteira já suporta (com arquivo:linha)

1. **O modelo de dados aceita cliente interno sem gambiarra.** `Client`
   (`prisma/schema.prisma:52-91`) só exige `name` e `workspaceId`; `email`,
   `phone`, `website`, `industry` são opcionais. Nada no schema distingue
   "cliente que paga" de "cliente interno" — a distinção é feita depois, no
   portão de pagamento (item 3).
2. **Briefing → Projeto roda pela porta normal.** `ClientRequestDb`
   (`prisma/schema.prisma:1313-1332`) exige só `businessName`; o resto
   (segmento, serviços, objetivos) é declarável. `createProjectFromRequest`
   (`lib/agency/execution/create-project-from-request.ts:1-231`) transforma o
   briefing aprovado em `Project` + `Task[]` via `orchestratePMReasoning` — o
   **único** dos seis departamentos cognitivos do Brain com uso real fora de
   simulação, confirmado em `.despachos/saida-f2.md` §1B.
3. **O portal do cliente funciona igual para os três**, porque ele lê
   `Client.portalToken` (`prisma/schema.prisma:62`) — não há caminho separado
   para "cliente interno". O CityJobs já usa exatamente esse mecanismo
   (`docs/projetos/cityjobs-registro-07-08.md:14`).
4. **Aprovação já foi pensada para este caso exato — pelo próprio CEO.**
   `lib/agency/esteira/aprovacao-da-peca.ts:1-17` cita a ordem literal de
   14/08/2026: *"Quem é o dono da CityJobs sou eu, então eu vou aprovar. Se
   entrar um cliente novo, quem aprova é ele."* Mecanicamente isso significa:
   só conta como aprovação válida para publicar a que vier com autoria
   `client:<nome>`, **de um token de portal validado**
   (`aprovacao-da-peca.ts:43-51`) — autoria `equipe:<email>` (sessão da
   agência) **não autoriza publicação**. Ou seja: para o CEO aprovar a peça de
   um cliente interno, ele precisa entrar **pelo link do portal daquele
   cliente**, não pelo painel interno.
5. **A marca da própria Dioli já tem precedente de "casa como cliente de si
   mesma"** — mas é estreito. `lib/agency/design/logo-da-casa.ts:43-50`
   resolve isso só para os nomes da lista fechada `NOMES_DA_CASA` ("dioli",
   "dioli digital" etc.) — **não cobre Foocci, CityJobs nem FOOCCI Manager**.
   Para estes três, o logo tem de entrar como material real de marca (Drive),
   igual a qualquer cliente externo — ver item 2.4.

---

## 2. O que falta para os três caberem de verdade

### 2.1 O portão de pagamento já passou do corte — e isso pega os três

`lib/agency/financeiro/portao-de-pagamento.ts:83`:
`CORTE_DO_PORTAO_DE_PAGAMENTO = 2026-08-25T00:00:00Z`. **Hoje é 30/08.**
Qualquer produção nova depende de `conferirPagamento`
(`portao-de-pagamento.ts:171-369`), que só libera por quatro motivos:
`pagamento_confirmado`, `mensalidade_em_dia`, `parceria_isenta` ou
`anterior_ao_portao` (pedido criado **antes** do corte).

- **CityJobs e Foocci estão cobertos pela anistia**, porque os `ClientRequestDb`
  deles nasceram em 07/08 e antes — **antes** do corte. Produção contínua sob
  o **mesmo** `clientRequestId` já existente continua liberada sem exigir
  pagamento novo. Isso é uma leitura do código, não uma opinião: a anistia é
  travada ao `createdAt` do pedido, que nunca muda.
- **Qualquer pedido NOVO** — inclusive um novo briefing/campanha para Foocci
  ou CityJobs, e **obrigatoriamente** o onboarding do FOOCCI Manager — nasce
  **depois** do corte e cai direto em `sem_registro_de_pagamento`
  (`portao-de-pagamento.ts:365-368`). **Sem produção nenhuma.**
- **O mecanismo para isso já existe e é o certo a usar**:
  `ParceriaDoCliente` + `IsencaoDeParceria` (`prisma/schema.prisma:2758-2851`),
  o mesmo que libera parceiros que não pagam em dinheiro. Exige, por
  desenho: `autorizadaPor` (nome do CEO, nunca em branco), `validaAte` (data,
  nunca eterna), `escopo` (texto), `pecasContratadas` (inteiro — **zero é
  zero**, nunca "sem limite") e `tetoDeIaCentavosUsd` (teto de custo de IA).
  Há até um script pronto: `scripts/conceder-isencao-de-parceria.mts`.
  **Ação concreta:** o CEO autoriza uma parceria isenta, com teto e prazo,
  para cada um dos três produtos, **antes** de qualquer novo pedido de peça.

### 2.2 CityJobs está preso na sombra por desenho — e está certo que esteja

`social-media` está em **allowlist** com evidência mínima antes de entregar ao
cliente (`docs/projetos/cityjobs-registro-07-08.md:154-163`): 5 aprovações
recentes, e o CityJobs tem **0 de 5**. Por isso as 6 peças já produzidas
seguem `visibility: "interno"` — o CEO as vê no painel da agência, o portal
do "cliente" (ele mesmo) não. **Isso é a escada funcionando, não um bug** —
departamento novo nasce em sombra e sobe com evidência, e eu não vou
recomendar pular esse degrau nem para um cliente interno.

Duas coisas precisam andar para a evidência se acumular de verdade:
1. **A conexão do Instagram @cityjobs.sp está `expired`**
   (`cityjobs-registro-07-08.md:187-192`) — sem reconectar, a leitura do
   cliente real não roda e a peça não tem contra o que se ancorar. **Só o CEO
   reconecta.**
2. **O molde de marca (título, cor, selo, formato 1080×1350) não roda em
   produção** porque `playwright` está em `devDependencies`
   (`cityjobs-registro-07-08.md:73-96`). Toda peça sai como foto crua da IA,
   fora do padrão que o próprio CEO exigiu em 06/08
   (`docs/projetos/foocci/comparativo-06-08.md:5`: *"da próxima vez, para
   todos os clientes, eu quero algo no mínimo nesse nível"*). **Isto é tarefa
   do departamento `plataforma`, não meu — mas bloqueia qualquer peça de
   CityJobs (e de Foocci, e do FOOCCI Manager) até ser movido.**

### 2.3 Duas peças do CityJobs já mostraram um risco que não pode voltar a acontecer

Três das seis primeiras peças do CityJobs saíram com **salário e vaga
fabricados dentro dos pixels** ("VAGA $3,500", "R$6.000", vaga falsa numa
marca inventada) — `cityjobs-registro-07-08.md:28-58`. O molde audita texto
sobreposto, **não audita o que a IA desenhou dentro da imagem**. Os pilares
"vagas por setor" e "salário aberto" seguem **bloqueados** até existir
conferência de pixel — decisão já tomada e registrada, que eu mantenho.
**Consequência para o plano:** a primeira peça nova do CityJobs tem de vir do
grupo já provado seguro (comunidade, "perto de casa", dica — sem número, sem
vaga citada), nunca dos pilares bloqueados.

### 2.4 Nenhum dos três tem o mesmo tratamento de logo que a Dioli tem para si

`logo-da-casa.ts` (item 1.5) só resolve para a marca "Dioli". CityJobs já tem
**paleta e tipografia oficiais ancoradas** (`cityjobs-registro-07-08.md:191-192`)
— falta o logo em arquivo entrar como material real (Drive,
`lib/agency/esteira/material-do-drive.ts:255`), senão a peça sai com monograma
das iniciais. **Não confirmei** se o logo de Foocci já está no material do
Drive (fora do escopo desta rodada); do FOOCCI Manager, nenhum material existe.

### 2.5 FOOCCI Manager precisa nascer do zero, pela porta normal — sem chute

Sem `Client`, sem `ClientRequestDb`, sem material de marca. **Não vou inventar
um objetivo de marketing para um produto que não tenho briefing nenhum sobre**
— isso seria exatamente a inferência que os guardrails do departamento
proíbem. O caminho é o mesmo de qualquer prospect novo:
`resolverOuCriarCliente` → `ClientRequestDb` (businessName mínimo: "FOOCCI
Manager") → `createProjectFromRequest` → parceria isenta (item 2.1) — só que
**quem fornece o briefing mínimo é o CEO**, porque é o único que sabe o que o
produto vende hoje.

---

## 3. Os três blocos de produto

### 🍽️ Foocci (a empresa — marketing para atrair donos de restaurante)

- **Objetivo em uma frase:** aumentar o número de donos de restaurante que
  conhecem e assinam o Foocci como canal de venda próprio.
- **Onde já tem público:** **não verificado nesta rodada** — o Instagram
  oficial da Foocci (se existir e qual o handle) mora no repositório do
  Foocci, que este agente não acessa (mesmo limite de sandbox registrado em
  `.despachos/saida-f4.md`, seção Foocci). O que existe **confirmado** é o
  piloto **Sushi Cazza** (`scripts/pilot-sushi-cazza.ts:201`,
  `@sushicazzaoficial`) — mas esse é um restaurante **cliente do Foocci**,
  não o canal da Foocci em si. Não confundir os dois na hora de publicar.
- **A primeira peça a produzir:** um carrossel novo que **mostra o produto**
  — captura real de tela do app (painel de pedidos, WhatsApp com cupom).
  Isto não é chute: é o próprio diagnóstico já escrito pela casa em
  `docs/projetos/foocci/comparativo-06-08.md:14-24` — as 6 peças existentes
  têm o Foocci só como palavra, "0 de 6" mostram o produto, e o CEO já
  apontou o padrão de referência que quer igualar. **Bloqueio:** não existe
  biblioteca de mockup nem etapa de coleta de captura de tela na esteira
  (`comparativo-06-08.md:51-59`) — sem a captura real entregue pelo time do
  Foocci, a peça não pode inventar a tela.
- **Quem faz e quando:** Design monta a peça assim que a captura de tela
  chegar; dono da coleta da captura é o CEO/time do Foocci (é o material que
  só eles têm). Posso ter o carrossel pronto no mesmo dia em que o material
  chegar — não há dependência de departamento parada do meu lado.

### 🏙️ CityJobs (mídia local de vagas do Alto Tietê)

- **Objetivo em uma frase:** aumentar o alcance e a lembrança do CityJobs como
  canal de vagas nas seis cidades do Alto Tietê.
- **Onde já tem público:** **Instagram @cityjobs.sp é ativo real** — mas a
  conexão está `expired` (`cityjobs-registro-07-08.md:187-192`). Público
  existe, canal está desconectado.
- **A primeira peça a produzir:** um post do padrão já aprovado e seguro —
  "perto de casa", "dica" ou "comunidade" (sem número, sem vaga citada, sem
  promessa) — nunca dos pilares "vagas por setor" ou "salário aberto",
  que seguem bloqueados por risco de fabricação de dado (item 2.3).
- **Quem faz e quando:** Social produz o texto, Design monta a peça — mas só
  depois de (a) o CEO reconectar @cityjobs.sp e (b) `plataforma` mover
  `playwright` para `dependencies` (sem isso a peça sai fora do padrão
  1080×1350 com marca, que é exatamente o que o CEO reprovou de referência
  em 06/08). Enquanto essas duas não resolverem, a peça pode ser **produzida
  em sombra** (como já está sendo) mas não deve ser tratada como pronta para
  vitrine.

### 🍔 FOOCCI Manager (POS/ERP de restaurante — produto adormecido)

- **Objetivo em uma frase:** **preciso confirmar com o CEO** — não existe
  briefing, Client nem material sobre este produto na esteira da Dioli
  Digital; a única fonte encontrada (`docs/kit/CLAUDE.md`, espelho do
  `dioli-brain-kit`, possivelmente desatualizado 21 dias) só registra que é
  um "POS/ERP de restaurante", "produto à parte", classificado como
  adormecido, sem Diretor nem pendência.
- **Onde já tem público:** **não registrado.** Sem esse dado eu não abro
  campanha nem escolho canal — seria inferência proibida.
- **A primeira peça a produzir:** nenhuma, ainda. O primeiro passo real é o
  briefing mínimo (`ClientRequestDb.businessName` + segmento + objetivos),
  fornecido pelo CEO, porque é ele quem sabe o estado atual do produto.
- **Quem faz e quando:** dono é o CEO (fornecer o briefing); assim que ele
  chegar, o PM abre o pedido pela esteira normal e eu entro na sequência
  Estratégia → Social → Design como qualquer cliente novo.

---

## 4. A vitrine — como isso vira material de venda sem virar promessa

**A regra:** a vitrine mostra **processo**, nunca **resultado**. Nada de
número de alcance, conversão ou faturamento dos produtos internos — os
guardrails do departamento (nunca prometer número, nunca inventar depoimento)
valem para cliente interno exatamente como para externo, e valem em dobro
porque quem decide sobre esses três produtos é o mesmo CEO que decide sobre a
agência: a tentação de "arredondar" o próprio caso é maior, não menor.

O que pode virar vitrine, com proveniência:
- **O ciclo completo rodando de ponta a ponta** num cliente real (briefing →
  projeto → produção → aprovação no portal → publicação) — CityJobs e Foocci
  já provam que o motor roda; isso é prova de capacidade operacional, não
  de resultado de marketing.
- **O achado do comparativo (06-08)** é, ele mesmo, material de vitrine
  interna: mostra que a casa audita o próprio trabalho contra uma referência
  externa e corrige — isso é diferencial de agência, mais defensável que
  qualquer número forjado.

O que **não pode**: usar as peças do CityJobs que já foram reprovadas
(salário fabricado, promessa de resultado, paleta inventada) como exemplo de
qualquer coisa — inclusive como "antes/depois", porque republicar o "antes"
externamente reintroduz o próprio dado fabricado que a escada existe para
barrar. A vitrine só nasce de peça que passou pela escada e pelo quality gate
de verdade.

**Quem promove a vitrine é o PM/Diretor**, não eu — eu só proponho.

---

## 5. O que não consegui verificar

- **`model Region` do CityJobs** (`instagramHandle`, `igUserId`, `fbPageId`,
  citado pela ficha) — mora no repositório do CityJobs, fora do sandbox deste
  agente (restrito a `/home/user/diolidigital`). Tomo como dado da ficha, não
  confirmado por mim.
- **Se a Foocci (a empresa) tem canal próprio de Instagram e qual o handle** —
  mesmo limite de acesso a `control_room`/repositório do Foocci já registrado
  em `.despachos/saida-f4.md`.
- **O estado atual e o modelo de negócio do FOOCCI Manager** — a única fonte
  é o espelho do `dioli-brain-kit` (`docs/kit/CLAUDE.md`), que o próprio
  repositório avisa poder estar **21 dias atrasado**. Repositório do produto
  não está neste sandbox.
- **Se @cityjobs.sp já foi reconectado** desde 07/08 (23 dias) — estado de
  runtime, não código; só uma consulta ao vivo responde.
- **Se a escada do CityJobs já acumulou as 5 evidências** para sair de
  sombra — não tenho consulta ao vivo do banco nesta sessão.
- **Se `playwright` já saiu de `devDependencies`** — tarefa de `plataforma`;
  não confirmei se já foi resolvida desde 07/08.
- **Se o logo de Foocci já está registrado como material do Drive** — fora do
  escopo desta rodada.

---

## Bullets para o PM

- **Não é proposta no vácuo: Foocci e CityJobs já são clientes internos
  rodando na esteira**, com projeto, briefing e peças — `docs/modelo-de-negocio.md:75-76`,
  `docs/projetos/cityjobs-registro-07-08.md`. FOOCCI Manager é o único que
  começa do zero.
- **Maior buraco: o portão de pagamento já passou do corte (25/08, hoje é
  30/08).** Todo pedido NOVO — inclusive o onboarding do FOOCCI Manager —
  trava em `sem_registro_de_pagamento` sem uma `ParceriaDoCliente` isenta,
  com dono, prazo e teto, autorizada pelo CEO ANTES de produzir.
  `lib/agency/financeiro/portao-de-pagamento.ts:83,365-368`.
- **CityJobs está em sombra por desenho (allowlist do `social-media`, 0 de 5
  evidências) — está certo que esteja**, e carrega dois bloqueios técnicos que
  não são meus: Instagram @cityjobs.sp desconectado (só o CEO resolve) e o
  molde de marca não roda em produção (`playwright` em devDependencies —
  tarefa do `plataforma`).
- **Achado de risco que não pode se repetir:** 3 das 6 primeiras peças do
  CityJobs saíram com salário/vaga fabricados dentro da imagem. Os pilares
  "vagas por setor" e "salário aberto" seguem bloqueados; a primeira peça nova
  tem de vir do grupo já aprovado como seguro.
- **Ação concreta de segunda-feira (01/09):**
  1. **CEO** autoriza `ParceriaDoCliente` (isenta, com prazo e teto) para os
     três produtos — sem isso nada novo produz depois de hoje.
     `scripts/conceder-isencao-de-parceria.mts` já existe pronto.
  2. **CEO** reconecta @cityjobs.sp e entrega a captura de tela real do app
     Foocci — sem os dois, Design não avança a peça seguinte de nenhum dos dois.
  3. **CEO** entrega o briefing mínimo do FOOCCI Manager (nome, segmento,
     objetivo) — sem isso não abro pedido nenhum para ele.
  4. **`plataforma`** move `playwright` para `dependencies` — sem isso toda
     peça nova, dos três produtos, sai fora do padrão que o próprio CEO exigiu.
- **Vitrine:** mostrar o ciclo rodando (processo), nunca número de resultado —
  e nunca reciclar as peças do CityJobs já reprovadas por dado fabricado.
