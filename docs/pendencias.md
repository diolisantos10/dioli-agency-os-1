# Pendências — o que está aberto

> # ⛔ O MAPA DA CASA É `docs/ESTADO-REAL-08-08.md`.
> Aposentado como fonte de verdade por ordem do CEO em 08/08/2026. Este arquivo
> tem **3.896 linhas** e **29 seções já concluídas** — o que está aberto de
> verdade não é mais legível daqui, e foi lendo isto que a casa passou a
> consertar o que já estava consertado.
>
> **Como usar a partir de agora:**
> - **O que fazer a seguir** → `docs/ESTADO-REAL-08-08.md` §3 (as 8 frentes).
> - **Por que uma decisão foi tomada** → aqui embaixo. Este arquivo continua
>   sendo o **diário de bordo** da casa, e é perícia valiosa: cada seção tem a
>   medição de produção que produziu a regra.
> - **Regra nova:** seção concluída ganha `🟢` no título e **não** volta a ser
>   lida como pendência. Em conflito com o mapa, **o mapa vence**.


## 🔴 29/08/2026 — O DIA DE ONZE PRs E NENHUM MERGE: O ESTADO ESCRITO

- O dia produziu **onze PRs novos** (#380 é de 28/08 e entra na lista porque o
  #385 depende dele) e **nenhum foi mesclado, fechado ou revisado formalmente**.
- Duas rotas ficam LACRADAS até palavra do CEO: o #387 (cinco rotas de
  pagamento/parceria) e a decisão de preço — nenhum agente desta casa pode
  autorizar as duas.
- A negociação de desconto foi **remedida por execução**, não por leitura: a
  frase do Diretor sobre "intervalo vazio" caiu; o achado real é outro, e pior
  em um ponto específico — ver seção própria abaixo.
- A casa flagrou em si mesma, no mesmo dia, o padrão "verifiquei" sem ter
  executado — cinco vezes fora e uma vez dentro do próprio #388.
- Nada do que está aberto foi resolvido por este bloco: este bloco só registra
  o estado para o próximo turno não perguntar nada a ninguém.

### ⏱️ SEGUNDO ADENDO (29/08, fim do turno) — duas decisões novas e a camada de despacho caindo

Mesma regra do adendo anterior: **nada acima foi apagado; isto só acrescenta.**

**Duas decisões novas subiram ao CEO, fechando em DEZ a fila dele:**

- **9 · Publicar os quatro consertos que saíram depois** — o número errado do
  pacote consertado na raiz (o texto parou de redigitar e passa a ler da fonte),
  o rótulo falso do item avulso, o mesmo volume escrito duas vezes em
  `planos.ts` (campo + frase de `inclui[]`, que vai para a `/planos` pública), e
  a trava do rascunho isolado por frente. PRs #395, #396, #397, #398.
- **10 · Duas conversas com a mesma identidade** — 🔴 **defeito confirmado pelo
  Diretor, escalado e NÃO consertado.** A identidade de quem reivindica ancora
  em `CLAUDE_CODE_SESSION_ID` (`scripts/reivindicar.mts:534` e `:606`;
  `lib/coordenacao/reivindicacoes.ts:36`, `:153`, `:199` — é a **primeira**
  preferência), e nesta máquina a variável vale **o mesmo para todas as frentes
  e subagentes**. Como `conferirColisao` faz `if (existente.quem === nova.quem)
  continue`, **duas frentes distintas se reconhecem como a mesma pessoa e nunca
  colidem** — em silêncio, e com o prefixo `ses-` que anuncia identidade *não
  degradada*. Explica retroativamente as três colisões de hoje que a
  reivindicação não avisou. O conserto empilha em #389 (não mesclado).

**🔴 A camada de despacho caiu no fim do turno.** A ferramenta de acionar
especialistas foi desativada nesta sessão — saída literal, colada como a régua
de `SEM_AGENTE` exige:

```
Error: No such tool available: Agent. Agent is disabled for this session, in subagents as well as here.
```

Também caíram a publicação de artefato e a leitura de avisos agendados. **Se
havia instrução num aviso agendado, ela não alcançou este turno** — lacuna
declarada, não suposição resolvida.

🔴 **A leitura do aviso agendado foi tentada DUAS vezes e recusou as duas** —
`Error: No such tool available: ReadNotifications`. Duas tentativas fazem disso
fato operacional, não falha passageira: **existe ordem agendada na fila que esta
sessão não consegue ler**, e quem a despachou não tem como saber. É a mesma
assinatura do aviso com link morto gravado como "enviado" — o remetente acredita
que entregou. **Quem agendou precisa reenviar por outro caminho.** As
ferramentas do GitHub caíram na sequência; o último ato possível foi este
registro, empurrado por `git`.

**Decisão do Diretor ao perder a camada:** não abrir frente nova na mão. Com
dezesseis pacotes prontos e nenhum publicado, mais código sem publicar aumenta a
dívida em vez de reduzi-la. O que falta agora é **decisão, não trabalho**.

**Três erros de medição do próprio Diretor, registrados contra a régua dele:**

1. Mediu #159 contra o **ancestral comum** em vez do **deploy** — e concluiu que
   nenhuma função sumia. Contra o deploy somem três, que
   `app/api/sdr/chat/route.ts` importa.
2. Leu **um arquivo** (`negotiate-proposal.ts`) e afirmou sobre **a casa** que
   ela "nunca oferece condição a quem acha caro". `degrausAbaixo` oferece.
3. Afirmou que `.fichas/` já era ignorado, medindo em **branch não mesclada**.
   No deploy a linha 86 é `scratchpad/`; a regra do `.fichas/` não está lá.

**Todos os três foram pegos por outra pessoa, nenhum por ele.** É a mesma
assinatura — régua certa, moldura errada — e é a razão de a conferência não se
delegar, mas também de ela não bastar sozinha.

---

### ⏱️ ADENDO DA MESMA NOITE (29/08, ~05:30) — o que mudou depois que o bloco acima foi escrito

O bloco acima foi escrito por volta das 04:45. Uma hora depois o estado já era
outro — o próprio bloco é a prova de que registro sem carimbo de hora engana.
**Nada acima foi apagado; isto só acrescenta.**

- **#394 abriu** — é este registro. Aponta para o commit `ed44e28a`, 312
  inserções, zero remoções, três arquivos.
- **#392 abriu e o "EM ANDAMENTO" acima está VENCIDO:** o diagnóstico do quadro
  do CEO (#159) treze dias depois foi entregue. O bloco acima diz "ainda sem
  desfecho escrito" — **isso deixou de valer**; o desfecho está no #392.
- **#395 abriu e resolve o achado novo de negociação registrado acima:** a
  natureza da cobrança (`recorrente_mensal` / `uma_vez`) virou **dado
  obrigatório e sem valor padrão**, com um formatador só, e item de natureza
  indeterminada passa a **não entrar** na lista de degraus (fail-closed). Ou
  seja: o item 4 de "o que o próximo turno faz primeiro" **já foi feito** —
  não o refaça.
- **#393 abriu, em RASCUNHO** — a fila da promessa de contato do SDR.

#### 🔴 Furo vivo NOVO, achado pelo #395 e conferido aqui — NÃO consertado por ninguém

`lib/agency/esteira/recompra.ts:262` promete ao cliente **"8 peças por mês"**.
Conferido nos arquivos deste worktree: o Ritmo custa R$ 290 (`lib/agency/planos.ts:159`)
e entrega **12** peças (`lib/agency/planos.ts:183`). A casa promete **menos do
que entrega** no toque de recompra, e isso chega ao cliente sem revisão humana.

**A parte pior:** `__tests__/esteira/recompra.test.ts:132` **exige** a string
`"8 peças por mês"`. A suíte não deixou o erro passar — ela **protege** o erro.
Quem consertar o número derruba o teste, e vai achar que quebrou algo. É a
assinatura de "régua verde sobre o componente errado", desta vez dentro do
próprio portão. Frente própria, ainda **sem dono**.

#### 🔴 Achado de coordenação: o diretório de rascunho é COMPARTILHADO entre sessões

A pasta de trabalho temporária desta casa **não é isolada por sessão** — ela é
por repositório. Durante esta frente, outra sessão viva **sobrescreveu
silenciosamente** um arquivo de trabalho meu (o corpo do PR), sem erro, sem
aviso e sem conflito: o conteúdo simplesmente virou o dela.

- É a **mesma classe** da colisão de worktree de 29/08, num lugar onde ninguém
  estava olhando.
- **A reivindicação NÃO cobre isto.** Ela coordena arquivo versionado; arquivo
  de rascunho não entra no registro e não gera colisão.
- Mitigação até existir mecanismo: **nome de arquivo de rascunho leva o id da
  sessão**, ou o rascunho mora dentro da worktree da frente. Nome genérico
  (`prbody.md`, `saida.txt`, `body.md`) é colisão esperando acontecer — e a
  listagem da pasta mostra vários nomes genéricos de várias frentes.

### Os PRs abertos em 29/08 — estado conferido pela API, nenhum mesclado

- **#380** (28/08, não é rascunho) — P0: varredura de posse por path param —
  três rotas alcançavam recurso de outro inquilino. É a BASE do #385; precisa
  mesclar primeiro.
- **#381** (não é rascunho) — P0: o pedido do parceiro nascia ÓRFÃO (sem
  `clientId`) porque a sala de briefing submetia sem o convite, e a proposta
  saía cobrando um parceiro isento. Conserto passa o TOKEN do convite,
  resolvido no servidor; a trava que proíbe `clientId` do corpo não foi
  afrouxada. Trava: nenhuma citada além de review.
- **#382** (não é rascunho) — P0: a régua do #356 (detecta promessa de contato
  humano) não pegava "a equipe entra em contato", só primeira pessoa. Cadeia do
  convite medida inteira no código; os dois passos que faltam só se medem com
  dado de produção.
- **#383** (não é rascunho) — veredito de que a base órfã NUNCA existiu (era
  clone raso), sobre #163, #165, #166, #167, #168, com prova de cinco jeitos e
  reprodução controlada.
- **#384** (não é rascunho) — gravação do App Review da Meta: parede
  declarada, nenhuma das 9 permissões é gravável sem conta real; parecer do
  `meta` (PODE COM AJUSTE) já obtido; os 8 vídeos são vistoria de roteiro, não
  material de submissão.
- **#385** (não é rascunho) — varredura de posse quando o id chega no CORPO: 4
  furos de inquilino fechados, 5 escalados. **BASE = #380 (`claude/varredura-de-posse`).
  Trava: só mescla depois do #380.**
- **#386** (não é rascunho) — integrações: erro de hidratação consertado na
  raiz, App ID de "exemplo" que era o real, e medição das duas telas que faltam
  ao App Review.
- **#387** — **RASCUNHO LACRADO.** Cinco rotas de pagamento/parceria. Trava:
  não mescla sem palavra do CEO.
- **#388** (não é rascunho) — trava do clone raso instalada e provada, mais
  refutação da triagem de 28/08 e veredito sobre 11 PRs que ninguém nunca
  julgou.
- **#389** — **RASCUNHO.** A saída de emergência `--forcar --motivo` não abria:
  `forcadaPor` era gravado e nunca consultado por `conferirColisao` nem por
  `conferirRegistro` — quem forçava ficava preso dos dois lados. Trava: é
  rascunho, não mescla ainda.
- **#390** (não é rascunho) — a rotina que cobra a fila parada. Traz o comando
  `npm run varrer-fila`.
- **#391** (não é rascunho) — solta 7 dos 8 furos vivos presos dentro de PRs
  parados (#153, #158, #159, #161). O furo 6 ficou preso (ver linha vermelha
  abaixo).

### ⛔ O que continua ABERTO no ar — cada um é um bullet próprio

- 🔴 **As cinco rotas de dinheiro seguem abertas no ar.** Enquanto o #387 não
  for autorizado, qualquer sessão `master` ou `project_manager` de QUALQUER
  agência consegue, sobre cliente ou pedido de OUTRA agência, só copiando o id
  da tela: conceder parceria com isenção de pagamento e teto de gasto em dólar
  à escolha; revogar parceria legítima de terceiro; cunhar convite que dispensa
  a pergunta de verba; isentar de pagamento um pedido alheio; registrar que um
  Pix entrou num pedido alheio. O trabalho está escrito, testado e lacrado no
  #387 — falta a palavra humana do CEO. O Diretor não pode dar essa palavra.
- 🔴 **A fila de PRs nunca foi julgada.** Conferido contra a API: zero review
  formal em todos os PRs abertos. Vinte deles estão abertos há 13 dias ou mais
  (medido pela idade desde a abertura — PRs de 15 e 16/08, mais o #10 de
  03/08). ⚠️ Medido pela data do último commit o número é OUTRO: as duas réguas
  não dão o mesmo retrato, então toda contagem daqui em diante precisa dizer
  qual régua usou. O que produz o número sozinho é `npm run varrer-fila`, que
  chega com o #390 e **ainda não está no deploy**.
- 🔴 **O quadro do CEO de 15/08 (#159) está aberto e parado desde 15/08** — já
  não compila contra o deploy. A medição de resgate está EM ANDAMENTO em frente
  separada (`claude/o-quadro-treze-dias-depois`) — desfecho não escrito aqui
  porque ainda não existe.
- 🔴 **Duas migrations declaradas e não feitas.** Conferido no
  `prisma/schema.prisma` do deploy: `OutboxV2`, `RecusaV2`, `HandoffV2` e
  `ExecucaoV2` não têm coluna `workspaceId`. Consequência medida: a premissa
  que protegia o `OutboxV2` caiu — já existe executor mandando WhatsApp/e-mail
  de verdade — e qualquer direção de qualquer workspace lê o histórico de
  auto-conserto da plataforma inteira e pode reusar, por `correlationId`,
  resultado já pago por outro workspace. O conserto de `RecusaV2`/`HandoffV2`
  está pronto no #166, parado desde 16/08.
- 🔴 **Furo 6 — link de aviso ao cliente devolve 403 — ficou BLOQUEADO**, não
  grande: o arquivo que ele precisa tocar pertence a outra frente viva.
  Trabalho bloqueado por coordenação; volta assim que a outra frente encerrar.
- 🔴 **`raio-x-noturno.yml` pousa em branch lateral.** Conferido: a rotina faz
  checkout e `git pull --rebase` de `claude/dioli-pm-role-pow56e` — **essa
  branch EXISTE no remoto** (conferido com `git ls-remote`), ela é LATERAL, não
  morta e não apagada. Por isso o raio-x noturno não enxerga o que a casa
  realmente roda. Conserto no #152, aberto e parado desde 15/08.
- 🔴 **Meta — duas permissões pedidas sem tela que as demonstre:**
  `pages_read_engagement` (a Meta exige ver o CONTEÚDO de um post de Página
  dentro do app; nenhum componente de tela renderiza post de Página) e
  `instagram_manage_insights` (a metade `business_discovery` da exigência tem
  ZERO ocorrência no repositório). Pergunta aberta ao CEO: algum cliente já tem
  Página do Facebook conectada, com posts reais? Sem isso a tela nasce vazia no
  dia da gravação — e vídeo de tela vazia REPROVA, por texto oficial da Meta.
- 🔴 **`--forcar` continua quebrado no deploy** enquanto o #389 não for
  mesclado. Nenhuma frente deve usá-lo. (O #389 é rascunho.)
- 🔴 **Desconto autorizado é ZERO nos sete serviços da casa.** Medido por
  execução (não leitura): o piso é igual ao preço cheio em todos, porque
  `descontoAutorizadoPct` é `null` em todos — cinco das seis parcelas de custo
  da casa não são medidas (só a IA é medida; gateway, infra, e-mail, hora
  humana e impostos não são), e não se prova que uma margem desconhecida não é
  negativa. A fronteira de preço é decisão do CEO; nenhum agente pode tomá-la.
- 🔴 **Achado novo do adendo: o degrau oferecido a quem acha caro pode não ser
  comparável ao que a pessoa comprava.** `degrausAbaixo` mistura a escada de
  PLANOS com o catálogo de itens AVULSOS e de BALCÃO. Medido: quem acha o
  Ritmo caro (R$ 290/mês, 12 peças/mês) recebe como alternativa o Post avulso
  com a fala literal *"o Post avulso sai por R$ 190,00/mês com 1 peças/mês — é
  menos volume, pelo preço que cabe"* — doze peças viram uma, por 34% menos, e
  isso não é "menos volume", é outro produto. Item avulso (compra única) é
  apresentado com "/mês" na mesma fala. Os degraus entre planos (Conteúdo →
  Presença → Ritmo), esses, são coerentes — o defeito é a mistura de catálogo.
  Qualquer sessão comercial de hoje pode repetir essa fala para um cliente real
  até o conserto entrar.

### O que está EM ANDAMENTO

- A medição de resgate do quadro do CEO (#159) roda em
  `claude/o-quadro-treze-dias-depois` — ainda sem desfecho escrito.
- O casamento entre proposta e serviço da tabela por igualdade exata de
  centavos foi medido (R$ 790,00 casa com o plano Conteúdo; R$ 790,01 não casa
  com nada, e o SDR escala ao gerente em vez de citar valor) — degrada com
  segurança, mas nenhuma frente para consertá-lo foi aberta ainda; preciso
  confirmar se alguém já está nisso.

### O que a casa aprendeu em 29/08

- **Padrão observado, não acusação a ninguém:** cinco vezes em 29/08 um
  especialista afirmou "verifiquei" sem ter executado, e nas cinco a afirmação
  caiu ao ser medida de verdade.
- **O mesmo padrão apareceu dentro da própria correção**, no #388: o teste da
  trava do clone raso nasceu com `git clone --depth 1 <caminho-local>`, e o git
  IGNORA `--depth` em clone local — o teste não estava provando o que dizia. O
  próprio autor achou o furo.
- **Leitura de código não é a mesma coisa que execução.** O adendo sobre
  negociação só existe porque alguém rodou `vitest` sobre a régua real, em vez
  de inferir da leitura — e a leitura anterior (do Diretor) errou um ponto e
  não viu o achado mais grave (a mistura de catálogo).
- A triagem de 28/08 foi corrigida, não apagada: documento errado leva bloco
  de refutação no topo e a análise antiga intacta abaixo — apagar levaria a
  lição junto.
- Merge zero em 29/08 foi decisão deliberada: dois julgamentos de "seguro"
  caíram no mesmo dia ao serem medidos; merge é irreversível na prática,
  auditoria é barata.

### O que o próximo turno faz primeiro

1. Mesclar #380, depois #385 (a base depende da ordem).
2. Rodar `npm run varrer-fila` para obter o número corrente de PRs sem review
   e de PRs parados, em vez de repetir o número de ontem.
3. Levar ao CEO, numa só rodada: a autorização do #387 (rotas de
   pagamento/parceria) e a fronteira de preço/desconto autorizado.
4. Abrir frente para separar o catálogo de PLANOS do catálogo de AVULSOS/BALCÃO
   dentro de `degrausAbaixo`, antes que a fala de negociação chegue a um
   cliente real.
5. Cobrar desfecho de `claude/o-quadro-treze-dias-depois` (#159) e do furo 6
   bloqueado, assim que a frente que segura o arquivo encerrar.
6. Revisar #381, #382, #384, #386, #388, #391 — nenhum tem review formal ainda.


## 🟡 28/08/2026 — DUAS FRENTES ADIADAS POR ORDEM (depois da manhã do cliente)

O Diretor Geral carimbou as duas para depois da entrada do primeiro cliente real.
Ficam aqui para não sumirem.

### 1. Varredura de rotas sem conferência de posse — do `seguranca`

O conserto do vazamento da ficha de marca (#376) fechou **uma** rota. O PR #169
mencionava outros pontos com o mesmo padrão — `liberarCliente` da escada, a fila
comercial — e **eu não os auditei**. `lib/agency/esteira/posse-do-cliente.ts` já
exporta `clienteEDesteWorkspace` para eles.

**A pergunta da varredura:** que outras rotas recebem um id pela URL ou pelo
corpo e não conferem de quem é o recurso? É frente do especialista de segurança,
não um apêndice de outra tarefa.

### 2. Por que a branch de deploy virou história órfã — a causa-raiz

`claude/dioli-agency-os-architecture-kk7kp` não tem ancestral comum com sete PRs
abertos (150 commits contra 870). Eles são **impossíveis de mergear** e ficaram
12 dias presos, com **US$ 1.198 já pagos** dentro deles — incluindo um conserto
de segurança que só foi recuperado em 28/08.

**Medi o efeito, não a causa.** Se aconteceu uma vez, acontece de novo, e o custo
está calculado. Ver `triagem-dos-prs-parados-28-08.md` e
`o-custo-de-construir-28-08.md`.


## 🟢 28/08/2026 — A FICHA DE MARCA VAZAVA ENTRE INQUILINOS (CONSERTADO)

> **Fechado pelo PR #376**, conferido na branch de deploy: `posse-do-cliente.ts`
> está lá e a rota da marca chama `clienteOuNulo` nas duas pontas (404, nunca
> 403). Ficou aberto 12 dias porque o conserto existia desde 16/08 preso num PR
> que não mergeia mais.
>
> ⚠️ **O que NÃO foi feito e continua aberto:** a varredura de OUTRAS rotas com
> o mesmo padrão — ver a seção das frentes adiadas, no topo. Uma rota fechada
> não é uma classe de defeito fechada.
>
> O texto abaixo fica como está: é a história que produziu a regra.

**Denunciado pelo PR #169 em 16/08, provado lá, e o conserto nunca entrou.**
Medido de novo hoje contra a base de deploy — continua aberto.

`app/api/agency/clients/[id]/marca/route.ts`, `GET` e `PUT`: conferem que existe
sessão (`if (!sessao)`) e **não conferem de quem é o cliente**. O `id` vem cru da
URL. A camada de baixo também não filtra:
`ficha-de-marca.ts:309` faz `brandBrain.findUnique({ where: { clientId } })` sem
`workspaceId`, e `escrita-da-ficha.ts:213` usa o `clientId` recebido direto.

**Qualquer sessão válida de qualquer workspace LÊ e ESCREVE a ficha de marca de
qualquer cliente de qualquer outro workspace** — basta trocar o id na URL. Vale
para `design_staff`, o perfil mais baixo. O #169 provou com sessão do workspace A
sobre cliente do workspace B: 200 nas duas.

### O conserto existe e está preso

`lib/agency/esteira/posse-do-cliente.ts` foi escrito no #169, está ausente da
base, e **o #169 não consegue mais ser mergeado** (história órfã — ver
`docs/diagnosticos/triagem-dos-prs-parados-28-08.md`). O caminho é COPIAR o
arquivo para um PR novo sobre a base atual, com teste de posse próprio.

### Por que não foi consertado em 28/08

Ordem em vigor era triagem, e nada podia desestabilizar o deploy antes do
cliente. O furo **exige credencial interna da agência** e **não está no caminho
do cliente que entra pelo portal**. É P0 e está aberto há 12 dias — mas não era
P0 daquela manhã. Conserto de rota sem teste de posse, de madrugada, trocaria um
risco conhecido por um desconhecido.
## 🟢 28/08/2026 — `npm run reivindicar` EMPURRAVA O SEU BRANCH INTEIRO (CONSERTADO)

> **Fechado no mesmo dia, pelo PR #378.** O portão recusa antes de escrever, o
> push nomeia o SHA em vez de `HEAD:`, e o commit usa `--only` — o índice era
> uma segunda porta, descoberta exercitando o comando. O relato do incidente
> está no #374. O texto abaixo fica como está: é a história que produziu a regra.

**Aconteceu comigo hoje, e o resultado foi quatro commits de um PR aberto
pousando direto na branch de deploy, sem revisão e sem CI prévio.**

### O que a ferramenta faz

`scripts/reivindicar.mts:305`:

```
git push --no-verify origin HEAD:<branch de deploy>
```

`HEAD:` não empurra "o commit da reivindicação" — empurra **tudo que o seu HEAD
tem e o remoto não**. E `--no-verify` pula o gancho pré-push, que seria a única
defesa.

O desenho está explicado no topo do arquivo (linhas 30-38) e é coerente com a
premissa dele: worktree de agente, branch privada, cujo único commit pendente é
o da própria reivindicação. **A premissa não vale para uma sessão que trabalha
num branch de feature** — e nada avisa quando ela não vale.

### A medição

Rodei `npm run reivindicar -- encerrar` com o branch `claude/fechar-a-divida-da-proposta`
em cima (4 commits, PR #373 aberto, esperando revisão). O push foi recusado
porque a base tinha andado; o script **rebaseou e reempurrou** — levando os
quatro commits junto. `git log` da branch de deploy os mostra fora de qualquer PR.

### Por que não foi pior desta vez, e por que isso é sorte

O conteúdo eram **dois testes e um documento — zero linha de produção** — e
estava validado antes (`tsc` limpo, 2.478 testes verdes, build compilando). A
branch de deploy foi reconferida depois e está sã: `tsc` limpo, 688 testes de
comercial verdes, `npm run build` compilando.

**Com código de produção no branch, o mesmo comando teria publicado alteração de
comportamento sem revisão e sem CI.** A regra da casa é "nunca empurre direto no
branch de deploy" — e a ferramenta oficial da casa faz exatamente isso, em
silêncio.

### O que fazer (nenhuma iniciada — é conserto de ferramenta, precisa de decisão)

1. Empurrar **só o commit da reivindicação**, não o `HEAD` inteiro — por exemplo
   criando o commit sobre `origin/<branch>` e empurrando esse objeto, nunca `HEAD:`.
2. **Recusar** quando o HEAD tiver commits não empurrados além do da
   reivindicação, dizendo o que faria — recusa barata, dano caro.
3. Reavaliar o `--no-verify`: ele desliga a única trava que existia.

### A lição operacional, até isso ser consertado

⚠️ **Não rode `npm run reivindicar` com trabalho não empurrado no branch atual.**
Empurre o seu PR primeiro, ou rode o comando a partir de um branch limpo.
## 🔴 28/08/2026 — ORDEM DO CEO: departamento financeiro por produto (não feita)

**Ordem repassada pelo Diretor do Foocci em 28/08.** Palavras do CEO: *"Todo
produto precisa ter o seu departamento financeiro… Railway, assinatura e tudo
mais… Esses departamentos precisam reportar pra um novo departamento, que é o
departamento financeiro da empresa, que fica lá dentro da Control Room."*

**O padrão já existe: `diolisantos10/FOOCCI` → `docs/financeiro-padrao-da-casa.md`.**
É para copiar, não reinventar — se cada produto criar as próprias colunas, a
Control Room não soma, só traduz. *Regra não se copia, se aponta.*

**Não construído em 28/08** por estar em vigor a regra de não desestabilizar a
casa antes da entrada do primeiro cliente real. É trabalho de poucas horas.

### O que a medição já apurou (`docs/diagnosticos/o-custo-de-construir-28-08.md`)

- Total visível de sessões de Claude Code: **US$ 6.913 (R$ 35.671)** — piso, não fechamento.
- **Control Room / Diretor Geral: US$ 4.272 — 61,8% de tudo, em 4 sessões.**
  Uma única sessão custou US$ 2.995. **É o maior bolso da casa e ninguém media.**
- Dioli Digital: US$ 1.588 em 17 sessões.
- O Railway da casa inteira custa US$ 40,99/mês: o total de sessões equivale a
  **14 anos** de servidor de todos os nove projetos.

⚠️ **Isto não é desperdício provado** — coordenação cara que destrava seis
produtos pode ser o melhor dinheiro da casa. O ponto é que **ninguém sabia**.

### 🔴 E US$ 1.198 foram pagos por trabalho que nunca chegou

Onze sessões da Dioli Digital de 15-16/08, paradas desde então — **75% de tudo
que o produto gastou**. Os assuntos delas são os mesmos dos PRs #169-#172, que
**não conseguem mais ser mergeados** (base órfã, ver
`triagem-dos-prs-parados-28-08.md`). A casa pagou para diagnosticar, o
diagnóstico virou PR, a base foi recriada por baixo, e 12 dias depois um dos
defeitos ainda estava **vivo em produção** (o vazamento da ficha de marca, #376).

*A casa não perdeu tempo: perdeu dinheiro já gasto, e não sabia.*


## 🟢 28/08/2026 — O PARCEIRO ERA PERGUNTADO SOBRE VERBA (CONSERTADO, no ar)

> **Fechado pelo PR #372**, conferido na branch de deploy: a rota do SDR devolve
> a parceria derivada do token e a sala a escreve no estado que decide a fila de
> perguntas (`comParceria`). Era a décima primeira "trava sem fechadura" da casa
> — o campo existia, era lido, e nenhuma linha de produção escrevia nele.
>
> A travessia que provou isso é `__tests__/comercial/a-jornada-do-parceiro.test.ts`.
>
> O texto abaixo fica como está: é a história que produziu a regra.

**Medido por travessia executável, não por leitura:**
`__tests__/comercial/a-jornada-do-parceiro.test.ts` — 14 testes, banco real, IA
dublada, 10 mutações rodadas. Diagnóstico inteiro em
`docs/diagnosticos/a-jornada-do-parceiro-de-ponta-a-ponta.md`.

`dispensadoDeVerba` (`question-engine.ts:1030`) lê `state.parceriaDeclarada`. O
campo existe no tipo (`briefing-conversation.ts:292`), é lido, tem comentário
dizendo que "o SERVIDOR preenche" — e **nenhuma linha de produção escreve nele**.
Fora o teste, ele aparece em 5 lugares e em nenhum como escrita.

A causa é mecânica: quem decide a fila de perguntas é o `question-engine`, que
roda **no navegador**. O servidor resolve o convite mas devolve só
`{ok, reply, needsClarification, scope}` — a parceria nunca volta para quem
decide a pergunta. No servidor o convite alimenta o **prompt** e o **rastro**,
nada mais.

### O que o parceiro vive amanhã

- é perguntado a faixa de orçamento mensal — a MESMA pergunta que travou a
  conversa do primeiro cliente real às 13:43 de 27/08;
- o botão de fechar o pedido fica travado (`canSubmitProposal` exige fila vazia);
- **o pedido nasce assim mesmo**, pela via de recuperação, em até 5 minutos — a
  régua da promoção não exige verba. Feio, não fatal.

### O que JÁ funciona (medido, não suposto)

Convite chega em todo turno e sobrevive a recarregamento · isenção derivada da
parceria · portão devolve `parceria_isenta` · zero pagamento falso de R$ 0 ·
e-mail do briefing chega ao pedido · trava `.invalid` não barra endereço real ·
proposta diz "100% isento" antes do número e o botão não convida a pagar.

### Dívida declarada

A mutação "a rota da proposta esquece a parceria" **sobreviveu**: o teste prova a
régua e a fonte, mas não atravessa a rota. Nada foi renderizado — a ordem visual
foi lida no JSX, não vista.
## 🔴 28/08/2026 — A FUSÃO DE CLIENTE ABORTA SE OS DOIS LADOS TIVEREM PARCERIA

**Achado durante o diagnóstico do cadastro duplicado da FOOCCI (PR #370,
`docs/diagnosticos/fusao-de-cliente-duplicado.md`). Nada consertado ainda —
o Diretor Geral pediu diagnóstico primeiro.**

`ParceriaDoCliente.clientId` é `@unique` no schema, e a lista de vínculos
**não** o marca como `unicoPorCliente` (`lib/agency/persistence/cliente-vinculos.ts:74`).
O mesmo vale para `BrandBrain` (`:101`, na lista de cascata).

### A consequência

Se os dois cadastros de uma fusão tiverem parceria — ou os dois tiverem cérebro
de marca — o `updateMany` viola a restrição, o Prisma joga `P2002` e **a
transação inteira aborta**. A rota não tem `try/catch` em volta do
`$transaction` (`app/api/clients/[id]/fundir/route.ts:60-70`): sai **500 cru**, e
a tela mostra só "não foi possível concluir".

O banco fica protegido — a transação garante isso. **O operador é que fica
travado sem saber por quê**, na única ferramenta que a casa tem para desfazer
cadastro duplicado.

### Por que o teste-guarda não pegou

`__tests__/agency/fundir-cliente.test.ts:138` confere **presença** na lista, não
**unicidade**. Um `@unique` novo no schema entra sem flag e nada acusa. O teste
foi escrito para o furo anterior (modelo esquecido da lista) e não cobre este.

### A perda silenciosa, de quebra

`completarCampos` nunca sobrescreve campo preenchido — correto. Mas quando os
dois lados têm **e-mail diferente**, o do absorvido é descartado **sem entrar em
`movidos` nem em `descartados`**: a fusão perde um dado e não conta a ninguém.

### O que falta fazer (nenhuma iniciada)

1. Marcar `parceriaDoCliente` e `brandBrain` como `unicoPorCliente`.
2. `try/catch` na rota de fusão — mensagem legível em vez de 500 cru.
3. Estender o teste-guarda para conferir **unicidade**, não só presença.
4. Trava de idempotência em `POST /api/clients` — foi o double-submit (7s de
   diferença) que criou a FOOCCI duas vezes, e nada impede a repetição.
5. Registrar em `descartados` o campo divergente que hoje some calado.


## 🔴 24/08/2026 — SEM SALDO NA CONTA DA ANTHROPIC (precisa de gente)

**A conta do provedor de IA está sem saldo. Ninguém resolve isto em código.**

Ronda de produção, 07:29: `Claude HTTP 400` no departamento do SDR. Perguntando
à API o que ela recusou, veio a resposta literal:

> *"Your credit balance is too low to access the Anthropic API. Please go to
> Plans & Billing to upgrade or purchase credits."*

### O que isto quer dizer, em consequência

- **A casa continua atendendo** — a camada multi-IA reservou e o cliente foi
  servido. Foi assim às 07:29 e é assim agora.
- **Mas atende pela reserva**, que não é o provedor preferido de cada agente e
  não tem as mesmas travas de formato. Mais caro e menos previsível.
- **Nenhuma rodada ao vivo da bateria mede coisa alguma** enquanto durar: a
  rodada de 07:56 fechou com IA 0/16 e 16 turnos barrados.

### A armadilha que custou a investigação

A Anthropic devolve **400 `invalid_request_error`** para falta de saldo — o
mesmo status e a mesma família de erro de um **corpo malformado**. A hipótese
inicial (ferramenta forçada + bloco de cache, do bloco do SDR na camada
multi-IA) estava **errada**, e o status sozinho a sustentava. Os 7 candidatos de
forma de conversa da sonda receberam o mesmo erro — inclusive o que a bateria
usa todo dia, o que prova que a forma nunca foi o problema.

**Regra que fica: status não é motivo. O motivo está na mensagem, e a mensagem
tem de ser lida e guardada.** A camada descartava o corpo do erro; agora não.

### O que já está consertado

- a camada guarda o corpo do erro junto do status;
- `falha-de-provedor.ts` classifica saldo / chave / teto de ritmo /
  indisponibilidade a partir da mensagem;
- o despertador levanta alarme de rodada para saldo e chave (o resto vira
  estado visível), lendo o `AIRunLog` que já existia — faltava leitura, não
  escrita;
- a rota do SDR grava `sem_saldo_no_provedor` em vez de `provider_error`, e o
  placar escreve em português que precisa de gente.

### O que NÃO dá para fazer daqui

Comprar crédito. **É decisão e cartão do CEO.**

---

## 🟢 24/08/2026 — O PILOTO FECHOU: TRÊS RODADAS SEGUIDAS DE PONTA A PONTA

**Um cliente falso entra pela porta pública, conversa com o SDR de IA, recebe
orçamento, aceita, o projeto NASCE SOZINHO, ele avaliza a direção, a produção
roda e o pacote fecha em `done`. Três vezes seguidas, sem uma quebra.**

Medição (execuções 32689213474 do Actions, três rodadas consecutivas ao vivo):

| | rodada 1 | rodada 2 | rodada 3 |
|---|---|---|---|
| turnos do SDR atendidos | 16/16 | 16/16 | 16/16 |
| turnos barrados pelo guarda | 0 | 0 | 0 |
| projeto nasceu sem painel | sim | sim | sim |
| entregas / tarefas | 7/7 | 7/8 | 7/8 |
| estado final do projeto | `done` | `done` | `done` |
| verificações quebradas | nenhuma | nenhuma | nenhuma |

17 de 18 verificações passam. A 18ª é a **parada declarada** da publicação, que
segue não coberta de propósito — publicar sai no perfil do cliente, é público, e
desfazer não desfaz o print.

### O que NÃO está medido, e não pode ser vendido como pronto

- **Publicação (Instagram/Google).** As travas de saída existem desde hoje e
  **nunca foram exercitadas ao vivo**. Declarado, não presumido.
- **Apresentação do pacote e aprovação da peça pelo cliente.** O motor apresenta
  sozinho quando o pacote fecha (há teste), mas a bateria não exercita o cliente
  aprovando. Não medido é não medido.
- **Quatro dos cinco provedores de IA.** Só o Claude rodou ao vivo.
- **Cliente externo.** Nenhum. Por decisão do Diretor Geral, a esteira roda com
  projeto da própria casa até entregar limpa, e os leads reais parados desde
  julho seguem sem resposta automática.

### De 0 a 100%: onde a esteira está

Oito etapas da porta de entrada até o post no ar. **Seis medidas e fechando;
duas não.** Chamar isso de ~75% é honesto; chamar de "pronta" não é.

---

## ⛔ 24/08/2026 — UMA CHAVE DE IA SÓ TRAVA O PILOTO (decisão do CEO)

**Com um único provedor de IA conectado, a esteira NÃO fecha — e os dois
motivos que sobraram no piloto são o mesmo.**

Estado medido na última rodada ao vivo: 7 entregas, projeto `done`, e o pacote
retido. Nenhum defeito de código sobrou.

### Motivo 1 — cinco de sete entregas ficam sem árbitro

`escolherArbitro` nunca devolve o autor: aprovação de si mesmo não é aprovação.
Com só a chave da Anthropic conectada, todo especialista que escreve em `claude`
(11 dos 14) se auto-aprovaria — e o resultado é `nao_auditado`, que desde hoje
**retém a apresentação** por ordem do Diretor Geral (peça que ninguém olhou não
chega ao cliente).

Motivo gravado em cada uma das cinco, literal:

> *"NÃO AUDITADA: o único modelo disponível para julgar é o MESMO que escreveu a
> peça — não existe aprovação independente aqui."*

**Resolve com QUALQUER segunda chave** — `openai`, `gemini` ou `deepseek`. A
fila de árbitros é `["claude", "openai", "gemini", "deepseek"]`.

### Motivo 2 — a pesquisa de concorrência não tem com que pesquisar

O especialista `Pesquisa de concorrência` declara `provedor: "perplexity"`, e é
o único da casa que usa IA com fonte — porque é o único trabalho que exige
**olhar para fora**. Sem essa chave, ele cai no provedor padrão e entrega um
diagnóstico de lacunas em vez de uma análise. A Qualidade barra, corretamente:

> *"3 dos 3 concorrentes listados estão marcados como 'PRECISO CONFIRMAR' sem
> dados verificados (...) o núcleo da análise de concorrência — sua própria
> razão de ser — permanece suspenso."*

O cliente **deu** as referências ("Bráz", "Carlos Pizza"). O que falta é a
capacidade de pesquisar, não o dado do briefing.

**Resolve com a chave da Perplexity** — e só com ela: `perplexity` não entra na
fila de árbitros de propósito ("é pesquisadora com fonte, não juíza de texto").

### O que isto significa, sem rodeio

- **As três rodadas limpas não fecham** enquanto houver uma chave só. Não é
  defeito pendente: é capacidade que a casa não tem contratada.
- **Não é conserto em código, e não deve virar um.** Afrouxar a imparcialidade
  do árbitro para destravar o piloto seria trocar a trava mais cara da casa por
  um verde de laboratório.
- **É dinheiro e é decisão do CEO.** Duas chaves: uma segunda qualquer (árbitro)
  e a da Perplexity (pesquisa).

### O que a casa faz enquanto isso, e está correto

Retém, com o motivo explícito em cada peça, e o placar conta quantas ficaram sem
árbitro. A esteira não mente dizendo que entregou.

---

## 🔴 24/08/2026 — A PAUTA DO MÊS ESTAVA NA FILA PARA VIRAR POST NO PERFIL DO CLIENTE

**Um documento de planejamento interno — o calendário editorial do mês — era
agendado para publicação no Instagram do cliente. Nunca aconteceu porque o
pacote nunca chegou lá; não porque alguma trava tenha impedido.**

### O antes e o depois, com arquivo e linha

| | arquivo:linha | valor |
|---|---|---|
| **antes** | `lib/agency/execution/especialistas.ts:686` (commit `6e1d2940^`) | `deliverableType: "social"` |
| **depois** | `lib/agency/execution/especialistas.ts:776` (commit `6e1d2940`) | `deliverableType: "plano-de-conteudo"` |

O especialista é `id: "a3"`, `label: "Pauta do mês"` — o calendário editorial de
4 semanas.

### Por que é grave

`deliverableType` decide **duas coisas independentes** nesta casa, e a etiqueta
errada errava as duas:

1. **Publicação.** `lib/agency/esteira/publicacao.ts:132` —
   `const TIPOS_PUBLICAVEIS = ["social", "video"]`. Com a pauta marcada como
   `social`, `agendarPostsDaEntrega` a colocava na fila de `SocialPost`. Um
   documento interno de planejamento, com tema e formato de cada semana, entrava
   na fila para **ir ao ar no perfil do cliente**.
2. **Julgamento.** A Qualidade a avaliava como peça publicável e a reprovava —
   corretamente, para o que lhe disseram que ela era: *"Esta é uma estratégia e
   roadmap de 4 semanas, não é uma peça de comunicação pronta. Pode-se publicar
   COMO ESTÁ? Não — é um blueprint."* Régua certa, etiqueta errada.

### Por que ninguém tinha visto

Porque **a pauta nunca chegou ao fim da esteira**. O pacote era retido antes —
por material faltando, por contrato de saída, pela própria Qualidade. O defeito
estava a uma apresentação de distância de acontecer, e só apareceu quando o
piloto empurrou a esteira até o fim pela primeira vez.

**É a lição do piloto inteiro:** defeito em etapa que nunca roda não é defeito
ausente — é defeito não observado. Toda etapa que só existe no papel guarda uma
destas.

### O que foi feito

- A pauta virou `plano-de-conteudo`: fora de `TIPOS_PUBLICAVEIS`, e julgada como
  plano.
- **Sem isentar nada:** `TIPOS_DE_PLANEJAMENTO` (o que o juiz avalia como plano)
  é lista SEPARADA de `TIPOS_DE_DOCUMENTO_INTERNO` (o que a régua determinística
  de texto dispensa). Juntá-las tiraria a pauta da régua de texto sem ninguém
  ter pedido — e o cliente **lê** o calendário dele. Há teste travando as duas
  metades.

### O que fica aberto

Nenhum outro `deliverableType` foi auditado com esta pergunta. Vale uma passada
perguntando de cada um: *isto é para publicar?* e *isto é uma peça ou um plano?*
— são perguntas diferentes, e a etiqueta responde às duas ao mesmo tempo.

---

## 🟡 24/08/2026 — DOUTRINA: INFORMAR UMA RÉGUA NÃO É AFROUXAR UMA RÉGUA

**Quando uma régua reprova o que deveria aprovar, pergunte primeiro se ela está
errada ou apenas MAL INFORMADA. São consertos opostos.**

Medido no piloto: a Qualidade reprovou o "Posicionamento" — um entregável do
tipo `strategy` — dizendo *"a auditoria exige a entrega REAL (peças prontas),
não documentação de planejamento"*. Reprovou um plano por ser um plano, e
segurou o pacote inteiro.

A tentação era afrouxar o juiz. O certo era **contar a ele o que estava
julgando**: o prompt mandava título, departamento e corpo, e cinco critérios
todos de peça. Nenhuma linha dizia se aquilo era um post ou um plano — e o juiz
preencheu a lacuna inventando a régua que faltava.

**A casa já sabia fazer a distinção.** `TIPOS_DE_DOCUMENTO_INTERNO` isenta
`strategy` e `analytics` da régua determinística de texto desde antes. A
distinção simplesmente não chegava ao juiz de IA. É o mesmo formato de "a régua
evolui e o pedido fica para trás", agora do lado de **quem julga** em vez de
quem produz — e vale a pena procurá-lo nos dois lados.

### Como distinguir os dois casos

| | régua ERRADA | régua MAL INFORMADA |
|---|---|---|
| sintoma | reprova o que a casa quer aprovar, e a justificativa faz sentido | reprova por um motivo que não se aplica àquele artefato |
| conserto | mudar o critério (⛔ só com autorização) | **dar o fato que falta** |
| critérios | saem ou mudam | **nenhum sai** |

**O teste que separa os dois:** se o conserto REMOVE um critério, é afrouxamento
— pare e pergunte. Se o conserto ACRESCENTA um fato e todos os critérios
continuam valendo, é informação. Hoje isso virou teste: o prompt dos dois tipos
é percorrido e exige-se que invenção e promessa falsa continuem cobradas em
ambos. Quem "simplificar" o prompt do documento interno fica vermelho.

### E a trava que veio junto

Régua mal informada não pode ser um estado alcançável em silêncio. `tipoDaEntrega`
virou **obrigatório na assinatura** (o compilador pega quem esquecer) e
**conferido em execução** (o compilador não pega `null` vindo do banco). Sem ele,
a peça sai `nao_auditado` — que nunca é aprovação e segura a apresentação.

É o padrão `enforceFrequency` de novo: **obrigar quem chama a responder a
pergunta, em vez de deixar o silêncio virar um palpite.**

---

## 🟡 24/08/2026 — DOUTRINA: TODA PROIBIÇÃO PRECISA DA INSTRUÇÃO GÊMEA

**Regra que só diz "não faça" empurra o modelo para o comportamento adjacente —
e o adjacente costuma ser pior, porque parece obediência.**

Medido no piloto, em menos de 24 horas, com a mesma regra:

| versão da regra | o que o modelo fez | veredito |
|---|---|---|
| (nenhuma) | inventou área de atendimento que o cliente nunca informou | barrado no **piso de verdade** |
| "só afirme o que está atestado; para o resto escreva PRECISO CONFIRMAR" | escreveu a peça que PRECISAVA do dado e carimbou a lacuna dentro dela — *"chame no WhatsApp [PRECISO CONFIRMAR]"* | barrado na **Qualidade** |
| + "escreva a peça que FUNCIONA com o que está atestado" | *"chama a gente no direct"* | passa |

A proibição matou a invenção e criou o oposto: **trocou peça inventada por peça
furada.** E o segundo estado é mais traiçoeiro que o primeiro, porque o modelo
está literalmente obedecendo — ele escreveu "PRECISO CONFIRMAR" como mandado. A
regra estava certa e incompleta, e incompleta ela produziu um defeito novo com
cara de conformidade.

### Por que o adjacente é pior

Porque "não faça X" deixa o modelo escolher o que fazer no lugar de X, e ele
escolhe o mais próximo de X que a letra da regra permite. Quem escreveu a regra
imaginou o comportamento CERTO no lugar de X e não o escreveu — então o que
sobra é o comportamento que a regra não proibiu e ninguém quis.

### A regra

**Toda proibição carrega a instrução gêmea, no mesmo bloco:** o que NÃO fazer, e
o que fazer com o que sobra. Se ao escrever "nunca faça X" não for possível
completar "faça Y no lugar", a regra ainda não está pronta — e vale mais
descobrir isso na hora de escrevê-la do que num pacote retido.

Exemplos que já vivem no código:
- *não afirme o que não está atestado* → **e escreva a peça que funciona sem o
  dado; "chama no direct" não precisa de número.*
- *não invente número* → **e fale do que a marca faz, de quem ela serve e do que
  o cliente escreveu — nada disso precisa de hora, preço ou endereço.*

---

## 🟡 24/08/2026 — DOUTRINA: ORDEM DE PERGUNTA É ARMADILHA (regra de classe)

**Pergunta nova no briefing entra ANTES da última obrigatória, nunca depois.
Depois do portão abrir, ninguém responde.**

O portão de envio abre no instante em que a última pergunta OBRIGATÓRIA é
respondida. Tudo que estiver depois dela na fila é perguntado com o botão de
enviar já na mão do cliente — e vira fala de despedida.

A casa caiu nisto **duas vezes, com um dia de intervalo**:

- **23/08/2026 — `budget_range`.** Era opcional e vinha por último. Resultado
  medido: escopo sem verba, e R$ 4.500–7.700/mês cotados, calados, a um cliente
  que tinha R$ 500/mês. Consertado tornando-a obrigatória.
- **24/08/2026 — `operacao_basica`.** Nasceu no mesmo lugar. Medido ao vivo: a
  casa perguntou, a conversa acabou, e o campo chegou **nulo** à produção.
  Consertado por POSIÇÃO — ela não podia ser obrigatória sem travar o briefing.

### Por que a segunda vez aconteceu, com a lição já escrita

Porque a lição estava num **comentário ao lado de `OPTIONAL_QIDS`**. Comentário
só ensina quem já está lendo aquele trecho — e quem acrescenta pergunta não está
lendo ali: está mexendo na lista de perguntas, três telas acima.

**Lição sobre a lição:** conhecimento que depende de alguém estar lendo o lugar
certo não é proteção, é sorte. Quando um erro se repete com a explicação já
escrita, o problema não é quem repetiu — é **onde a explicação mora**.

Por isso esta virou **teste**, e o teste vive no caminho de quem vai tropeçar:
ele percorre a fila, encontra qualquer pergunta opcional depois da última
obrigatória, e reprova dizendo como consertar. Verificado que ele reprova de
verdade — instalei uma pergunta no fim da fila e ele acusou.

Os dois caminhos válidos, quando a resposta importa:
1. **mover para antes** da última obrigatória (quando não pode travar o envio);
2. **tornar obrigatória** (quando a resposta é indispensável — caso da verba).

---

## 🟡 24/08/2026 — DOUTRINA: A RÉGUA EVOLUI E O PEDIDO FICA PARA TRÁS

**Quando uma régua passa a derivar de dado, todo lugar que PEDE aquilo tem de
derivar da mesma fonte — no mesmo commit.**

O piloto de ponta a ponta encontrou quatro defeitos, e os quatro eram a mesma
doença: a casa tem um lado que CONFERE e um lado que PEDE, e só o que confere
foi atualizado.

| O que conferia | O que pedia | Resultado medido |
|---|---|---|
| contrato de saída derivado do cliente (15/08) | prompt com "6 a 8 peças" à mão | cliente comprou 12; o especialista era reprovado **por obedecer** |
| piso de verdade confere fato atestado | `ctxBlock` não mandava fato operacional nenhum | peça barrada em `area_nao_informada`; o produtor escrevia às cegas |
| contrato conta `data.items` | forma pedida em prosa no prompt | pauta devolveu objeto sem `items` = "entregou 0", **intermitente** |
| mistura conferida por faixa | prompt mandava a faixa + "o resto em reel" | modelo escolheu o meio: 11 de 12, impossível de acertar por dedução |

### Por que sempre acontece assim, e não ao contrário

Porque a régua é onde o defeito DÓI, então é onde alguém mexe. O pedido é onde o
defeito NASCE, e ele não dói — ele só produz uma reprovação que parece culpa do
modelo. Quem lê o laudo vê "entregou 0 peças" e conclui "a IA está ruim hoje". A
conclusão certa era "o pedido e a régua discordam, e o pedido está errado".

O sintoma é sempre o mesmo e é reconhecível: **o produtor é reprovado por fazer
exatamente o que foi mandado fazer.** Quando aparecer isso, o defeito não está em
quem produziu.

### As três regras que ficam

1. **Uma fonte por número.** Se a régua conta 12, o prompt não escreve 12 — ele
   lê do mesmo lugar. Hoje `exigenciaDeConteudo` serve aos dois, e
   `MISTURA_DE_FORMATOS` idem.
2. **Não deixe aritmética para o modelo.** Faixa é da RÉGUA, que precisa aceitar
   várias composições válidas. O PEDIDO precisa de um número. "1 a 2 carrossel,
   2 a 3 story, e o resto em reel" obriga o modelo a descobrir que tinha de
   estourar todos os tetos ao mesmo tempo — e ele descobre errado. Resolva a
   conta em código e mande a receita pronta.
3. **Enumerar o proibido nunca fecha; defina o permitido.** A lista "o cliente
   não contou X" é resumo de painel e trabalha por CLASSE; o piso confere por
   FATO. O cliente atestou os DIAS e não a HORA: a classe "horário" contava como
   coberta e a peça foi barrada assim mesmo. Enquanto o aviso enumerar classes e
   a régua conferir fatos, sempre haverá um fato no vão. A regra que fechou foi
   inverter: *só afirme o que aparece literalmente na lista de atestados.*

E o corolário de forma: **o que é conferido em código tem de ser exigido em
código.** Forma pedida em prosa é instrução que o modelo pode desobedecer — e
desobedece de vez em quando, que é o pior modo de falha. `ESQUEMA_DO_PACOTE`
mora ao lado de `formato()` porque os dois descrevem a mesma forma; separá-los
recriaria exatamente a doença desta seção.

---

## 🟡 24/08/2026 — DOUTRINA: RÉGUA NASCE OTIMISTA

**Verde só vale com prova no dado. Nunca com "não estourou".**

Esta é a terceira vez **no mesmo dia** em que o instrumento cometeu, por dentro,
exatamente o defeito que ele existe para pegar. Não são três descuidos: é um
padrão, e o padrão tem nome.

### As três vezes

1. **`--ao-vivo` deu 10/10 com zero chamadas de IA.** A régua mediu "a rodada
   terminou", não "o modelo falou".
2. **`execucao-anda` deu VERDE com nada executado.** `runProjectExecution` não
   estourou — e o projeto ficou em `executionStatus: idle`, com 0 tentativas, as
   4 tarefas em `pending` e ZERO entregas. A régua mediu "não explodiu".
3. **`nenhuma-saida-real` contava 2 bloqueios e nenhum era da porta de
   WhatsApp.** `tentarWhatsApp` desistia antes, em *"nenhuma conexão de WhatsApp
   no workspace"* — a trava nunca era alcançada. Proteção presumida, não medida.
   E pior: a trava morava em `sendWhatsAppDirect`, **depois** de
   `loadConnectionToken` — valia por sorte de ambiente, e produção tem
   credencial.

### Por que acontece sempre

Porque a régua é escrita por quem acabou de fazer a coisa funcionar, e quem
acabou de fazer funcionar **quer ver verde**. O caminho mais curto para o verde é
sempre medir o efeito colateral mais fácil de observar — a função retornou, o
laço terminou, o contador subiu — em vez do fato que interessa. Os dois se
parecem enquanto tudo dá certo. Eles só divergem no dia em que algo quebra, que é
exatamente o dia em que a régua precisava funcionar.

### A regra, então

**Toda verificação tem de nomear o FATO que prova o verde, e ler esse fato de
onde o produto o guarda** — banco, arquivo, resposta HTTP —, nunca da ausência de
exceção.

Na prática, três perguntas antes de escrever qualquer régua nova:

1. **Qual linha do banco muda se isto funcionar de verdade?** Se a resposta for
   "nenhuma", a régua está medindo fluxo de controle, não resultado.
2. **Esta régua ficaria verde numa casa que não faz nada?** Se ficaria, ela não é
   uma régua. Foi assim que `execucao-anda` passou com zero entregas.
3. **O caso INFELIZ está medido?** Porta que deixa o staff entrar está metade
   medida: porta escancarada também deixa o staff entrar. Foi por isso que
   `porta-autenticada` passou a tentar quatro credenciais de intruso **antes** da
   credencial boa, e a reprovar se qualquer uma entrar — por mais verde que
   esteja o resto da rodada.

### O corolário do contador: número que existe não prova caminho exercitado

O terceiro caso merece regra própria, porque o sintoma é o mais traiçoeiro dos
três. **O placar dizia "2 mensagens barradas".** O número existia, era verdadeiro,
e media outra coisa: as duas barradas eram da porta de e-mail. A porta de
WhatsApp nunca tinha sido alcançada — `tentarWhatsApp` desistia antes, em
"nenhuma conexão de WhatsApp no workspace".

Quem lesse o placar concluiria "as travas estão funcionando". A conclusão certa
era "uma trava está funcionando e a outra nunca foi testada". Um contador não
distingue as duas coisas, **e é por isso que ele tranquiliza mais do que deveria**:
um número diferente de zero parece prova.

Foi quase-acidente, não detalhe de implementação. A trava de WhatsApp existia,
aparecia no código, e morava **depois** de `loadConnectionToken` — ou seja, só
segurava em máquina sem credencial. **Produção tem credencial.** A trava aparente
não protegia nada no único ambiente em que protegê-la importa.

**A regra:** contador de eventos bloqueados tem de dizer **de qual porta** cada
bloqueio veio, e a régua tem de exigir a porta que ela afirma cobrir — nunca um
total. Se o caminho não foi exercitado, o placar diz "não exercitado", e não um
número que o leitor vai interpretar como cobertura. Hoje `saidasBloqueadas`
carrega `canal` em cada linha, e `CADEADOS_POR_CANAL` declara quantos cadeados
independentes cada porta tem de verdade — inclusive a de avaliação, que tem
**um só**, escrito em vez de maquiado.

E o corolário que já era regra da casa, agora com três medições atrás dele:
**quando não deu para medir, "não coberto" com o motivo — jamais "passou".**
Instrumento que esconde o que não mediu mente, e mente na direção mais cara: a
que faz a casa parar de olhar.

---

## 🔴 24/08/2026 — A ESTEIRA DE BAIXO DEPENDE DE UM CLIQUE QUE NINGUÉM NUNCA DEU

> **Texto pronto para o CEO.** Não é dívida de teste; é contradição de arquitetura.

A metade de baixo da esteira — cliente, projeto, tarefas, departamentos, artes,
entrega — **não é "não testada". Ela é inalcançável sem gente.**

`createProjectFromRequest`, a função que transforma um pedido aprovado em
**Cliente + Projeto**, só é chamada de **um lugar**: a rota
`POST /api/brain/auto-scope/[id]/review`, que exige `requireSession` com papel de
agência e usa `session.name` para registrar quem aprovou. **O relógio nunca
chama essa função** — conferido: ela não está entre os 16 imports do
`despertador.ts`.

**Consequência:** por mais briefings que entrem, nenhum vira cliente até que uma
pessoa entre no painel e aprove. É a explicação dos **zero clientes** medidos
pelo outro Diretor — não é bug de execução, é uma esteira que espera um clique.

**A contradição:** o dono desta casa disse hoje, com todas as letras, *"não testo
mais nada"* e *"NÃO FAÇO NADA MANUAL"*. A esteira, como está, **exige exatamente
o que ele disse que não vai fazer.** Automatizar o teste não resolve isso:
o teste pode percorrer o caminho, mas em produção o funil continua parado
esperando um humano que não vem.

**O que decidir (é decisão de dono, não de engenharia):** ou a aprovação de
escopo passa a ter um caminho automático — com regra explícita de quando a casa
aprova sozinha e quando escala —, ou a casa assume que alguém aprova no painel
todo dia. **Hoje ela não tem nenhum dos dois**, e é por isso que o funil não
anda.

---

## 🟡 24/08/2026 — DOUTRINA: "MEDIDO" NO COMENTÁRIO É O QUE FAZ NINGUÉM REMEDIR

**Afirmação medida tem prazo de validade, e a palavra "medido" no comentário é o
que faz a próxima pessoa não remedir.**

O caso que produziu a regra, e ele custou três portas abertas: o cabeçalho de
`lib/email/send.ts` afirmava, **com a palavra "medido"**, que o e-mail era *"a
Única porta de saída de mensagem da casa — não há outro remetente; o WhatsApp é
link `wa.me`, não envio programático"*.

**Era verdade quando foi escrito.** Depois nasceram `sendWhatsAppDirect` (POST
no Graph da Meta, com token de produção), `publishPost` (Instagram) e
`publicarNoGoogle` / `responderAvaliacao`. Em 24/08/2026 as quatro portas
existiam e **três não tinham cadeado nenhum** — enquanto a casa inteira achava
que estava coberta, porque estava escrito "medido".

Isso é pior que um comentário errado: **é um comentário que desativa a
desconfiança da próxima pessoa.** Quem abriu aquele arquivo leu "medido" e não
remediu — inclusive eu teria não remedido, se não tivesse ido mapear a esteira
por outro motivo.

**A regra, a partir daqui:** toda afirmação de cobertura carrega **quando foi
medida**. "Medido em 06/08/2026" convida a remedir; "medido" sozinho encerra o
assunto para sempre. Afirmação sem data é afirmação que envelhece em silêncio.

**E o corolário, que já está em `CADEADOS_POR_CANAL`:** declare quantos cadeados
cada caminho tem DE VERDADE. A resposta a avaliação do Google tem **um só** — e
está escrito que tem um só, em vez de arredondado para dois. Contar cadeado a
mais no papel é o jeito mais fácil de dormir tranquilo com uma porta aberta.

---

## 🔴 24/08/2026 — CI VERDE E A PRODUÇÃO 5 COMMITS ATRÁS: O DEPLOY FOI DESCARTADO EM SILÊNCIO

**Achado pela segunda leitura**, e é exatamente por isso que ela existe: perguntar
"qual commit está rodando" em vez de aceitar `ok: true`.

Depois de a bateria fechar verde e a CI passar, a produção continuava servindo
`a50eb547` — o commit ANTERIOR a todo o trabalho da camada multi-IA. Medido com
o instrumento da própria casa (`npm run distancia`): **produção 5 commits atrás
da branch**, com o SDR multi-IA inteiro dentro do buraco.

O que o Railway fez com cada um:

| commit | o que era | status |
|---|---|---|
| `a50eb547` | trabalho do outro Diretor | **SUCCESS — é o que está no ar** |
| `f0cfab50` | reivindicação | SKIPPED |
| `af7db632` | a camada multi-IA | SKIPPED |
| `1469237b` | o conserto do eco (bateria verde) | REMOVED |
| `c10c9b43` | pendências | SKIPPED |
| `388b0c97` | HEAD, **com CI VERDE** | **SKIPPED, 1 min depois da CI fechar** |

### O que foi descartado como causa, e o que sobrou

- **Não foi CI vermelha.** `github-actions` fechou `success` em `388b0c97`.
- **Não foram as duas check suites paradas.** `claude` e `railway-app` ficam
  `queued` com zero runs em TODOS os commits — inclusive em `a50eb547`, que
  subiu normalmente. Se fossem a causa, nada teria subido nunca.
- **~~Dois pushes a 2 segundos um do outro~~ — HIPÓTESE TESTADA E DERRUBADA.**
  Era a explicação que sobrava (`c10c9b43` às 00:59:00 e `388b0c97` às 00:59:02
  criando dois deploys simultâneos em espera). O teste foi um push ÚNICO, limpo e
  isolado — `dc7ff6d3`, sem nenhum outro perto dele. CI verde. O Railway criou o
  deploy `26ba5ebe` às 01:08:08 e o marcou **SKIPPED** às 01:13:14. **Não é
  colisão de pushes.**

### O que se sabe de fato, depois do teste

**Todo deploy posterior a `a50eb547` é descartado, invariavelmente, ~5–6 minutos
depois de criado — logo após a CI fechar verde.**

| commit | criado | descartado | espera |
|---|---|---|---|
| `c10c9b43` | 00:59:00 | 01:04:13 | 5min13 |
| `388b0c97` | 00:59:02 | 01:05:21 | 6min19 |
| `dc7ff6d3` (push isolado) | 01:08:08 | 01:13:14 | 5min06 |

E `a50eb547`, que SUBIU, esperou **7min38** (00:19:04 → 00:26:42 SUCCESS) — mais
do que qualquer um dos descartados. Então não é teto de tempo fixo.

### A pista que sobra, para quem tem o painel

O serviço está com `checkSuites: true` ("Wait for CI"), e o commit tem **TRÊS**
check suites: `github-actions` (fecha `success`) e mais duas — `claude` e
`railway-app` — que ficam **`queued` com ZERO runs, para sempre**. Se o portão
espera TODAS as suites, essas duas nunca resolvem e o deploy morre por espera.

⚠️ Isso **não explica** por que `a50eb547` subiu com as mesmas duas suites
paradas. Fica como PISTA, não como causa — e é a primeira coisa a olhar no
painel.

### ⛔ Não dá para resolver daqui

`RAILWAY_TOKEN` não está neste ambiente e `npm run deploy:emergencia` depende
dele. As ferramentas de Railway disponíveis não expressam "suba este commit":
uma cria um SERVIÇO NOVO duplicado, a outra reaproveita a build de um deploy
existente (a errada). Cutucar produção com ferramenta ambígua num portão que
está se comportando de forma inesperada seria trocar um problema conhecido por
um desconhecido. **É bloqueio de dono: precisa do painel do Railway.**

### O que se aprende, independentemente da causa

**Deploy descartado é silencioso.** Não há e-mail vermelho, não há job falhando:
a CI fica verde, o painel fica verde, e a produção simplesmente não anda. O
sentinela (`sentinela-do-deploy.yml`) existe para pegar isto, mas ele roda de
hora em hora — nesta janela, quem pegou foi a segunda leitura à mão.

**A regra prática que eu tinha escrito aqui** ("não empurrar dois commits em
poucos segundos") **caiu junto com a hipótese** — o push isolado foi descartado
igual. Fica sem regra prática até alguém abrir o painel.

---

## 🟢 24/08/2026 — A DÉCIMA VERIFICAÇÃO FECHOU, E O DEFEITO ERA MAIOR QUE O SDR

**3 rodadas ao vivo seguidas, 10 de 10 verificações em cada uma, 48 turnos
atendidos pelo SDR de IA de verdade, ZERO barrados pelo guarda.** A décima — a
que nunca tinha sido medida — está verde com o guarda exercitado, não por falta
de medição.

### O caminho, porque o número final esconde o trabalho

| rodada | turnos do modelo | barrados | causa |
|---|---|---|---|
| antes | 5–6 de 16 | 10–11 | `malformado` ×9/×10 + `price_leak` ×1 |
| depois da trava de formato | 15 de 16 | 1 | `price_leak` ×1 |
| depois do conserto do eco | **16 de 16** | **0** | — |

### O achado que reenquadrou tudo: não era defeito do SDR

O laudo de forma foi unânime em duas rodadas independentes — *"o modelo não
abriu JSON nenhum (respondeu em prosa)"*. Ao abrir `lib/ai/generate.ts` para
consertar, o defeito apareceu inteiro: **quatro provedores declaravam como
garantem formato e o Claude não garantia nem declarava** — a pior das três
posições, porque parecia coberto. As 29 chamadas de IA desta casa corriam o
mesmo risco; o SDR só foi onde alguém olhou, por ser o único com histórico longo
em prosa empurrando o modelo para fora do formato a cada turno.

**Regra nova, com trava:** todo provedor declara como garante formato
(`lib/ai/formato-garantido.ts`). *"Não garanto, e por isto"* é resposta legítima
— é a da Perplexity. **Silêncio é a única resposta proibida**, e o teste cobra o
MOTIVO escrito, não só a chave presente.

### O SDR entrou na camada multi-IA

Ordem do CEO: *"nossos produtos podem ser utilizados por qualquer IA"*. A rota
falava direto com a Anthropic, com `claude-sonnet-4-6` escrito na mão desde
24/06 e nunca revisto. Agora provedor e modelo saem de onde já saem para todo o
resto: chave e modelo em Integrações, fixação por cliente (que vence e nasce
estrita), preferência da casa. **Não precisou de tela nova.**

⚠️ **A porta que NÃO reabriu.** `resolveProviderKey` sem workspace cai num
`findFirst` global, e a rota do SDR é pública: ligá-la na camada pelo caminho
óbvio faria qualquer visitante gastar a chave de um inquilino escolhido por
ordem de inserção. A rota anda na ordem da casa resolvendo cada provedor por
`chaveDeRotaPublica` e entrega a chave PRONTA. Teste reproduz o furo antigo.

### O `price_leak` virou fato, e não se alargou nada

Era hipótese ("o modelo abreviou a régua"). O laudo de forma mediu: **1 degrau
citado, 0 valores fora dela** — não era cotação nem régua abreviada, era o
modelo **confirmando ao cliente o número que o próprio cliente tinha acabado de
dar**. O guarda está certo: por regex, "R$ 500" ecoado é indistinguível de "R$
500" cotado. A exceção NÃO foi alargada; o conserto foi o modelo parar de
produzir a fala — confirma com palavras, nunca com o número.

### 🔴 O que continua aberto

- **Medir dois provedores lado a lado** com o cliente falso (o CEO perguntou se
  não seria melhor migrar para GPT). Agora é barato: fixação por cliente +
  `estrito` já existem e a bateria já roda ao vivo. **Não foi feito.**
- **Só o Claude foi exercitado ao vivo.** Os outros quatro provedores têm
  posição declarada e caminho de código, mas **nenhuma rodada real** passou por
  eles. Declarado não é medido.
- **A Perplexity segue sem trava de formato**, por limitação dela. Está escrito.

---

## 🔴 23/08/2026 — A DÉCIMA VERIFICAÇÃO NÃO FECHOU, E O INSTRUMENTO ESTAVA MENTINDO SOBRE ELA

**A ordem do CEO:** *"pode rodar com IA, quero o teste até o final"* — custo de
IA liberado para fechar a única verificação do cliente falso que nunca foi
medida: o guarda do SDR ("nenhuma resposta pode ser barrada pelo guarda — plano
B atendendo em silêncio é falha").

### O defeito que apareceu no caminho, e era o pior tipo

A bateria chamava a rota real do SDR e **jogava a resposta dela fora**. A
verificação do guarda decidia lendo o diário: sem linha de barra, veredito
"passou". Só que o diário TAMBÉM fica vazio quando a rota recusa **antes** de
chamar o modelo — sem chave (`not_configured`) ela volta sem escrever nada, e no
429 do próprio freio de ritmo, idem.

Resultado medido nesta máquina: `npm run cliente-falso -- --ao-vivo` **sem chave
nenhuma** fechava **10 de 10 em verde**, com a décima verificação afirmando sobre
um SDR que nunca falou. É o defeito nº 4 do CEO — *o plano B atende, ninguém
percebe, a tela fica verde* — cometido por dentro do instrumento que existe para
pegá-lo.

**Consertado.** A bateria mede o desfecho de cada chamada ao SDR; a verificação
passou a exigir prova de que o modelo respondeu. Recusa antes do modelo é "não
coberto" **com o motivo escrito**; queda do modelo com o cliente na frente
(`provider_error`, `timeout`, `truncado`, `malformado`) é **quebra**. O placar
mostra, por rodada, quantos turnos o modelo respondeu e cada queda com o motivo.
A régua não foi afrouxada em ponto nenhum — ela deixou de aprovar o que não
mediu. Prova: a mesma rodada sem chave agora devolve *"16 de 16 turnos nem
chegaram ao modelo (not_configured) — o guarda não foi exercitado, e não medir
não é aprovar"*.

### 🔴 ⛔ BLOQUEADO NO CEO — não há chave de IA alcançável para a rodada ao vivo

Levantado, não deduzido:

- **O que a rodada ao vivo exige é SÓ a variável `ANTHROPIC_API_KEY`.** O banco
  descartável da bateria nasce sem workspace nenhum, então `chaveDeRotaPublica`
  não tem cofre a consultar e cai direto em `chaveDoAmbiente`. Não é preciso
  banco, nem workspace, nem linha de integração.
- **Ela não está nos segredos deste repositório** — conferido no runner, por
  presença e nunca por valor, sob cinco nomes plausíveis (`ANTHROPIC_API_KEY`,
  `CLAUDE_API_KEY`, `ANTHROPIC_KEY`, `ANTHROPIC_API_TOKEN`, `AI_API_KEY`):
  todos ausentes.
- **Ela não está no Railway.** O serviço `diolidigital` não tem essa variável, e
  nenhum outro projeto da conta tem (Foocci e CityJobs têm `OPENAI_API_KEY`, que
  não serve: a rota do SDR é Claude).
- **Onde ela está de verdade:** a produção conversa com o modelo, então a chave
  existe — colada na tela de Integrações e guardada **cifrada no banco de
  produção**, decifrável só com `CREDENTIALS_SECRET` dentro do contêiner. Fora
  do alcance de qualquer sessão.

**A ação, e só o CEO pode fazê-la:** GitHub → Settings → Secrets and variables →
Actions → New repository secret → nome `ANTHROPIC_API_KEY`. Feito isso, um
disparo do workflow **"Cliente falso — rodada ao vivo (SDR de IA)"** roda a
bateria três vezes seguidas e fecha (ou reprova) a décima verificação. O segredo
nunca aparece em log: o workflow o lê de dentro do runner e o passo de
conferência afirma presença, nunca valor — mesma forma do `meta-raiox.yml` da
casa irmã. **O log deste repositório é público.**

### ⚪ O `malformado` continua ABERTO — e agora deixa rastro

O diário do piloto mostrou, hoje às 15:39 e 15:40, **dois turnos seguidos**
barrados por `malformado`: o modelo terminou de escrever e o que escreveu não era
JSON válido. Não é `truncado` — o teto de 3.000 tokens e o remendo de JSON
cortado não cobrem este caso. **A causa não foi encontrada e nenhum conserto foi
inventado**: sem rodada ao vivo não há como reproduzir, e mexer no guarda para
aceitar formato inválido seria afrouxar a régua, não consertar.

O que subiu foi o **instrumento que faltava**: até hoje "malformado" era uma
palavra e nada mais — o texto que falhou não é gravado (e não deve ser), então
ninguém tinha como perguntar por quê. O diário passa a registrar a **forma** do
pacote — houve `{`? sobrou texto antes/depois? em que posição o parser desistiu?
que tamanho tinha? —, montada por `lib/agency/comercial/diagnostico-de-formato.
ts`, que **não deixa passar uma letra do que o modelo escreveu** (teste alimenta
o laudo com pacotes que contêm preço, pedido de e-mail e chave de API e exige
que nenhuma palavra deles reapareça). Nem a mensagem do `JSON.parse` passa: ela
cita o trecho ofensor, e só o número da posição sai.

Três causas diferentes, três consertos diferentes — e a próxima vez dirá qual
foi. Enquanto não disser, **`malformado` é defeito aberto e não se vende como
resolvido**.

---

## 🟢 23/08/2026 — O CLIENTE FALSO ENTROU EM OPERAÇÃO, E A PRIMEIRA RODADA ACHOU 4 DEFEITOS

**A ordem do CEO, literal:** *"Não vou testar mais, porque não tenho mais tempo
nem paciência. Você vai criar um agente de teste, um ambiente de teste — pra
validar o projeto do início ao fim, um projeto fictício. Errou, voltou,
corrigiu. Teste assistido, automático, de cliente. Cria esse ambiente e já
começa a testar imediatamente."*

Ele tinha acabado de gastar cinco minutos testando à mão e achado três defeitos.
Testar à mão não escala.

**O que subiu:** `npm run cliente-falso`. Um cliente fictício reativo — ele LÊ a
pergunta da casa e responde aquilo, como uma pessoa — percorrendo a esteira REAL
de ponta a ponta: porta de contato → sala de briefing → conversa → anexo →
portão de envio → `POST /api/brain/client-requests` → `entregarOrcamentosPendentes`
→ o texto que chega ao cliente. Roda contra um SQLite descartável em
`.cliente-falso/`, nunca contra produção, com trava de saída dentro de
`sendEmail`. Custo de IA: **R$ 0,00** no modo padrão.

**O que a primeira rodada achou, com a esteira de hoje (sem SDR de IA):**

1. **A oferta de documento virou dado do cliente.** À pergunta "quem é o seu
   público-alvo?", o cliente respondeu *"Posso te mandar nosso briefing em PDF,
   ajuda?"* — e a frase foi gravada no campo `targetAudience` do pedido. É o
   defeito nº 2 da lista do CEO, e pior do que ele descreveu: não é só ser
   atropelado, é ter a colaboração transformada em dado falso.
2. **A casa repetiu a mesma fala.** Depois do anexo, ela repetiu palavra por
   palavra a pergunta de contrato mensal/campanha pontual. O anexo não consumir
   pergunta está certo (conserto de 16/08); repetir sem sequer acusar o
   recebimento do arquivo, não.
3. **A casa NUNCA perguntou a verba da gestão.** Ela perguntou a plataforma dos
   anúncios e a verba de ANÚNCIOS — duas vezes, depois de o cliente ter dito
   *"anúncios não, agora não"* — e fechou a entrevista com *"acho que já tenho o
   essencial"*. `budgetRange` chegou vazio ao pedido. A pergunta `budget_range`
   existe em `question-engine.ts` e não disparou.
4. **Orçamento de R$ 4.500–7.700/mês entregue a um cliente de R$ 500/mês, em
   silêncio.** Consequência direta do item 3: sem verba no escopo, o
   `confrontoDeVerba` não nasce, e o texto entregue não diz uma palavra sobre a
   diferença. É o caso CityJobs de 16/08 acontecendo de novo por outra porta — e
   desta vez quem o encontrou foi uma máquina, em três segundos.

**O que PASSOU, e vale registrar:** o nome da porta não é mais perguntado duas
vezes; a conversão "2 posts por dia" → 14/semana chegou certa ao escopo; o
briefing virou pedido e o orçamento foi entregue.

**O que ficou de fora desta rodada:** o SDR de IA. Sem chave configurada nesta
máquina, a rodada padrão exercita só o motor de regras — que é justamente quem
atende o cliente quando o guarda barra a resposta da IA. A verificação do guarda
(`parse_error`) devolve **"não coberto"**, nunca "passou": silêncio não é
aprovação.

### 🟢 FECHADO na mesma tarde — commit `f29bf9d3`

A ordem do CEO era o laço: *"Você tem que mandar consertar tudooooo até rodar."*
Os quatro defeitos foram consertados **na origem**, e a rodada seguinte fechou
9 de 9 verificações medíveis — repetida **3 vezes seguidas** para provar que não
foi sorte.

O que causava cada um, uma frase cada:

1. **Oferta de documento virando dado** — a frase entrava no motor como resposta
   comum. Entrou na mesma trava do recado de anexo (`anexo-nao-e-resposta.ts`),
   nos DOIS motores, para o defeito não escolher a porta.
2. **Fala repetida depois do anexo** — proteger o escopo resolvia metade: o campo
   parava de ser envenenado e a conversa passava a ignorar o arquivo. Agora a
   casa acusa o recebimento pelo nome do arquivo antes de retomar a pergunta.
3. **A verba nunca perguntada** — `buildBudgetQuestion` devolvia um FECHAMENTO no
   lugar da pergunta ("Acho que já tenho o essencial!"), e `budget_range` estava
   em `OPTIONAL_QIDS`, então o portão abria antes dela e a pergunta virava
   despedida. A pergunta voltou a perguntar, e agora trava o portão.
4. **R$ 4.500–7.700 para quem tem R$ 500** — além do item 3, `confrontoDeVerba`
   só lia o vocabulário interno da casa ("pacote", "entre R$ 150 e R$ 500") e
   devolvia `null` para *"Nosso orçamento é de R$ 500 por mês"*. Agora lê o
   número que a PESSOA escreveu. Texto sem número ("tanto faz") continua `null`.

De brinde, o mesmo percurso expôs um quinto: **"Anúncios não, agora não." era
lido como SIM**, porque continha a palavra "anúncios" — e a casa perguntava a
plataforma e a verba dos anúncios logo depois de um não claro. A negação passou
a ganhar da palavra-chave.

**Duas verificações existentes foram corrigidas, não afrouxadas.** Uma delas
(`verba-declarada-o-que-cabe`) exigia que "R$ 500" fosse DESCARTADO, no mesmo
balde de "tanto faz" — estava mandando calar exatamente a frase que o CEO
digitou. A outra tinha um percurso "completo" que nunca respondia a verba.

**⚠️ CONTINUA NÃO COBERTO:** o guarda do SDR de IA. Sem chave nesta máquina, as
3 rodadas verdes exercitaram só o motor de regras. Nove verdes de dez, e a
décima não foi medida — não foi aprovada.

## 🟢 23/08/2026 — PILOTO AO VIVO: A PORTA CAPTURAVA O CONTATO E NÃO ENTREGAVA

**O relato do CEO, ao reiniciar o teste em `/briefing`:** *"Primeiro erro, já
pediu o meu nome novamente, se eu dei meu nome na página de entrada."* Ele
preencheu nome, e-mail e WhatsApp no formulário de entrada (`LeadNaPorta`) e a
primeira fala da consultora foi *"Para começar, qual é o seu nome e o nome do
seu negócio?"*. O painel da direita marcava **"Nome: aguardando…"** — a prova de
que o dado da porta não chegava ao escopo da conversa.

**A causa, medida e não deduzida:** `contatoDaPorta` existia em
`app/briefing/page.tsx` desde 16/08 e era lido **só no envio final** do
briefing. Nunca entrava no escopo que abre a conversa. É a **seta faltando**
(D-003): o dado existe, o consumidor existe, e não há ligação entre os dois.

**Por que o prompt não segurou:** a regra *"cliente que já se identificou e é
perguntado outra vez conclui que ninguém prestou atenção"* já estava escrita no
prompt do SDR. Ela não falhou por redação — **nunca foi alimentada**. Prompt é
aviso; o escopo é a trava.

**Eram DOIS vazamentos no mesmo caminho**, e o segundo só apareceu porque o
conserto foi conferido na TELA, não no papel:

1. `initProspectConvState()` nascia sempre de `emptyScope()` e não recebia nada
   da porta — saudação e painel pediam o que já tinha sido dado.
2. `processProspectMessage()` reconstruía o escopo **do zero** na primeira
   resposta (`mergeScopeDelta(emptyScope(), …)`), matando o nome semeado: o
   painel voltava a "aguardando…" e a pergunta do nome reaparecia **um turno
   depois**. Meio conserto é conserto que a pessoa ainda sente.

**O que ficou de pé:** o escopo nasce com o que a porta entregou
(`prospectName`, `prospectPhone`); a saudação é condicional (cumprimenta pelo
nome e pede só o que falta); e o palpite do parser não sobrescreve o que a
pessoa declarou explicitamente. O **e-mail NÃO desce** para o escopo de
propósito — o escopo inteiro vai serializado para dentro do prompt do modelo
(`app/api/sdr/chat/route.ts`), e a doutrina da casa é que e-mail não trafega
pelo caminho do chat; o envio final continua usando o contato da porta.

**Quem pulou a porta continua igual**, e isso é caminho de propósito, não
sobra: sem nome, a pergunta do nome vale, e a heurística "3+ palavras = nome de
pessoa" segue valendo lá (foi **condicionada** ao que a saudação de fato
perguntou, não trocada). `__tests__/briefing/nome-da-porta-nao-e-perguntado-de-novo.test.ts`
trava as duas metades.

**Conferido na tela** (navegador de verdade, dev local), não só no teste: com
contato na porta, "Olá, Dioli! … qual é o nome do seu negócio?" e painel com
"Nome: Dioli Santos"; depois de responder o negócio, o nome PERMANECE e a
conversa segue. Sem contato, tudo como antes.

**O que NÃO foi conferido:** o comportamento do SDR com o modelo de verdade —
no ambiente local a chamada a `/api/sdr/chat` não completa, e a conversa cai no
motor de regras. O escopo semeado chega ao modelo pelo mesmo caminho que
qualquer outro dado do escopo (`route.ts`, "dados já captados"), mas isso não
foi exercitado com o modelo ao vivo.

### 🟢 O mesmo defeito esperava na LINHA DE CHEGADA

Achado ao ler o caminho inteiro, não só o trecho relatado: o passo final da sala
pedia *"Falta só uma coisa: para onde mandamos sua proposta"* para **todo
mundo** — inclusive para quem tinha digitado nome, e-mail e WhatsApp na porta
minutos antes. É o mesmo "ninguém prestou atenção" da primeira fala, no pior
lugar possível: na hora de fechar, depois de a pessoa ter contado o negócio
inteiro.

Com contato declarado na porta (nome **e** pelo menos um canal), o botão "Sim,
quero meu orçamento" agora **envia** em vez de abrir um formulário para recolher
o que já se tem. Quem pulou a porta — ou deixou nome sem canal — segue pelo
passo de contato como sempre: ali a pergunta é a única chance de a proposta ter
para onde ir, e pular seria trocar uma grosseria por um prejuízo. A regra virou
função pura testada (`contatoUsavelDaPorta`).

### 🟢 O achado de tabela: o CI estava vermelho para TODO commit, e travava o deploy

Descoberto ao conferir se o conserto acima tinha chegado ao ar: **não tinha**, e
não por causa dele. `__tests__/security/guarda-de-origem-no-navegador.test.ts`
reprovava toda rodada, e o "Wait for CI" do Railway — funcionando como
projetado — não promovia nada. **A casa inteira estava com a entrega travada.**

A causa não era a guarda de origem: era o caminho do Chromium fixado **com a
versão dentro** (`/opt/pw-browsers/chromium-1194/...`). O `ci.yml` roda
`npx playwright install chromium`, que instala a versão que o Playwright atual
pede (1228 hoje); o caminho 1194 deixa de existir e o sentinela conclui, pela
regra que ele tem, que não há navegador. Máquina de dev antiga seguia verde por
ainda ter a pasta velha — **verde por herança, vermelho em máquina limpa**.

`lib/agency/design/renderizar.ts:185` já tinha a lição escrita: *"caminho fixo
com versão dentro é dívida com data marcada"*. Aqui ela venceu. O arquivo passou
a **perguntar ao Playwright** onde ele instalou, com os caminhos conhecidos como
recurso. **O sentinela não foi afrouxado** — provado por execução nas duas
direções: com navegador, as 9 provas rodam; escondendo o navegador
(`PLAYWRIGHT_BROWSERS_PATH` vazio + lista de caminhos removida), a rodada
reprova com a mesma mensagem.

## 🔴 16/08/2026 (noite) — A COLHEITA DA NOITE: MÉTRICA MANIPULÁVEL, RESET TRAVADO PELO DIRETOR, E A JUNTA ENTRE DUAS REGRAS CERTAS

**Por que este registro existe:** decisão tomada em conversa vira registro na
mesma sessão — a colheita da noite é grande e precisa ficar de pé antes do
próximo turno.

### 1. 🔴 A fila de orçamento entope, e a lição é sobre a JUNTA entre duas decisões certas

Ver seção logo abaixo (já registrada), com a medição completa em
`docs/medicoes/elo-9-orcamento.md`. **Conserto em curso por outro `pm`** — não é
pendência sem dono.

- **A lição estrutural, e ela é a mais importante da noite:** duas decisões
  CERTAS produziram o defeito na JUNTA entre elas — manter lead sem contato na
  fila (decidido em 08/08: "faltar contato não é faltar pedido") e não inventar
  número sem dado ("sem número derivado não se inventa número"). Nenhuma das
  duas está errada sozinha; juntas, um pedido que nunca gera orçamento ocupa a
  vaga para sempre e barra quem já tem orçamento pronto atrás dele.

### 2. 🔴 O número mais importante do diário era manipulável por qualquer visitante

- A contagem de `resgate_do_escopo` **não filtrava quem escreveu**, e a fala do
  visitante mora na **mesma tabela**, gravada por **rota pública sem
  autenticação**. Bastava digitar a frase no chat para inflar o resultado.
- **Fechado, e provado por plantio e reversão** (não suposto).
- A consequência, com todas as letras: **o CEO teria lido, como métrica da
  casa, um número escrito por um estranho.**

### 3. 🔴 Decisão do Diretor — `ALLOW_PRODUCTION_RESET` definida como `"false"` em produção

**Decisão do Diretor**, não medição de agente — registrada com nome porque foi
ele quem decidiu.

- Conferido: a variável é avaliada por comparação **estrita** (`!== "true"`) em
  duas rotas.
- **O Diretor definiu o valor como `"false"` em produção**, pelo cofre do
  Railway.
- **Motivo:** o estado da variável estava **desconhecido havia 15 dias**, e
  nesta casa "não medido conta como reprovação". Mudar a variável é
  **reversível em trinta segundos** e anda na direção segura.
- ⚠️ **NÃO alcança `reset-request`**, que usa outro segredo e **continua
  aberto** — não foi coberto por esta decisão.
- **O CEO pode reverter em uma linha**, no cofre do Railway.

### 4. O teste que era verde às 20h e vermelho às 4h

- Dependia do relógio.
- **O achado contraintuitivo:** defeito que some perto da meia-noite é PIOR,
  não melhor — deixa de ser reproduzível justamente quando alguém investiga.

### 5. A varredura de segurança fechada (42/42, 14/14, ~47)

- **O achado que importa, ainda aberto:** segredo comparado com `===` **vaza
  pelo tempo de resposta**. Sem dono.

### 6. A trava do cliente Prisma gerado

- `schema.prisma` e `lib/generated/prisma` eram **duas fontes da mesma
  verdade** e já tinham divergido em silêncio.
- **A inspeção humana achou 1 campo; o mecanismo achou 4.**
- A frase que fica: a diferença entre inspeção humana e mecanismo não é
  diligência — é que o mecanismo não se cansa nem se convence de que já viu o
  suficiente.

### 7. As três verdades sobre onde mora o banco

- `.env` relativo (Next resolve pelo **cwd**) · Prisma CLI resolve pelo
  **diretório do schema** · `prisma.config.ts` tem **fallback próprio**, e
  scripts via `tsx` não carregam `.env`.
- **O SQLite CRIA UM BANCO VAZIO EM SILÊNCIO** em vez de dizer "não achei" —
  por isso o erro aparece como "no such table", e por isso um percurso ponta a
  ponta chegou a acusar a esteira inteira de quebrada quando o problema era só
  qual `.env` estava sendo lido.

### 8. A trava de reivindicação, e o que ela provou sobre si mesma

- Foi **usada por várias sessões** no mesmo dia, e **barrou o próprio autor**
  mais de uma vez — a melhor prova de que pegou.
- Chegou a **APROVAR o que devia barrar** (falso negativo provado por caso
  montado), já registrado e já corrigido nesta mesma página (identidade
  derivada, nunca declarada).
- **A identidade evoluiu de "por worktree" para "por SESSÃO"**, por revisão de
  **outra sessão** — que reivindicou a frente corretamente antes de trabalhar.
  A limitação (duas sessões sequenciais no mesmo worktree compartilhavam
  identidade) tinha sido **declarada pelo autor** e foi fechada por terceiro.
- **As duas réguas de trava que a casa passou a usar esta noite:** se o
  **atalho fica mais barato que o caminho honesto**, a trava está errada, não a
  pessoa · **barrar por engano é o modo benigno; aprovar por engano é o que
  mata o mecanismo.**

### O que segue aberto desta rodada — dono ou sem dono, explícito

- 🔴 `RESEND_FROM` ausente em produção — e-mail falha para todos, calado. **Sem
  dono.**
- 🔴 **DNS do domínio sem `www` no REGISTRADOR** — medido: a raiz não conecta;
  os dois domínios estão registrados no Railway. É ação de gente, no
  registrador. **Sem dono — depende do CEO.**
- 🔴 `PILOTO_SECRET` — falta para a medição de produção pela rota de
  diagnóstico. **Sem dono.**
- 🔴 `KIT_REPO_TOKEN` — sem ele o robô de espelho não espelha, e `docs/kit/`
  segue parado. **Sem dono — depende do CEO provisionar.** (já registrado
  acima, nesta mesma página)
- 🔴 **Cópia de segurança NUNCA RESTAURADA**, e **apagamento não exige cópia
  recente**. Cópia que ninguém restaurou não é cópia, é esperança. **Sem
  dono.**
- 🔴 `reset-request` **sem sessão e sem escopo** — não foi alcançado pela
  decisão do item 3 acima. **Sem dono.**
- 🔴 Migration do `DATETIME`. **Sem dono.**
- 🔴 Fichas duplicadas em produção, esperando decisão do CEO **desde 08/08**.
  **Sem dono — decisão é do CEO.**
- 🔴 Backfill da `chaveDoProspect` — armado, não disparado, esperando o CEO.
  **Sem dono — decisão é do CEO.** (já registrado acima, nesta mesma página)
- A tela da fila ainda não mostra o "irmão fora da janela" que a API já
  devolve — **tem dono**, outro `pm` em voo.
- A limitação da identidade por worktree — **frente de outra sessão**, já em
  curso.

---

## 🔴 16/08/2026 — PEDIDO SEM ORÇAMENTO NUNCA SAI DA FRENTE DA FILA, E ISSO ENTOPE OS QUE JÁ TÊM ORÇAMENTO PRONTO

**Sem dono.** Medição completa: `docs/medicoes/elo-9-orcamento.md`.

- **A pergunta:** por que o pedido não vira orçamento?
- **A resposta:** a rodada processa no máximo 5 por vez, dos mais antigos para
  os mais novos, e quem nunca gera orçamento **também nunca muda de estado** —
  então ocupa uma das 5 vagas para sempre e barra até quem já tem estimativa
  pronta atrás dele na fila.
- **Onde:** `lib/agency/esteira/orcamento-do-briefing.ts:162` (`MAX_POR_RODADA
  = 5`), `:491-496` (janela por `createdAt ASC` + `take` fixo) e `:504-508`
  (`continue` sem trocar status quando a estimativa vem nula).
- **Provado, não suposto:** mesmo pedido, mesma estimativa válida — com 6
  pedidos velhos sem estimativa na frente, `entregues=0`; sem eles na frente,
  `entregues=1`. Nada apagado; estado original devolvido depois do teste.
- **Acontece em produção:** não depende de IA nem de rede, é aritmética de
  fila. Há candidatos reais já registrados aqui: os leads parados há 51, 29 e
  28 dias sem contato — eles entram na janela e, sem estimativa, nunca saem.
- **Falha silenciosa:** a rodada devolve `entregues=0, semOrcamento=5` todo
  ciclo, e esse número parece estável — nada distingue "não há o que
  entregar" de "há, mas nunca chego nele".
- **O que precisa decisão** (arquivo tem dono em voo, decisão não é minha):
  dar estado terminal a quem nunca gera orçamento; **ou** paginar por cursor
  em vez de `take` fixo; **ou** separar a fila de quem tem estimativa da de
  quem não tem.

## 🟢 16/08/2026 — A TRAVA APROVOU O QUE DEVIA BARRAR (provado, não suposto); A FILA GANHOU CONTAGEM DE VERDADE; O ESPELHO DO KIT NASCEU

**A conclusão primeiro:** a trava de reivindicação tinha um falso negativo — em
teste montado de propósito, ela deixou passar um toque num arquivo que estava
sob reivindicação viva de outra sessão, com código de saída `0`. Conserto:
identidade deixa de ser **declarada** (a flag `--quem`) e passa a ser
**derivada** do caminho do worktree — ninguém mais digita, então ninguém mais
herda por engano. Na mesma rodada: a fila de leads passou a contar repetição
pelo banco, não só pelas 200 últimas solicitações em memória; e o robô de
espelho do `dioli-brain-kit` foi ligado, com carimbo que registra até quando
falha.

### A — A TRAVA CHEGOU A APROVAR O QUE DEVIA BARRAR

- Caso montado para provar, não supor: existia reivindicação viva de outra
  sessão sobre `app/api/agency/leads/route.ts`; a identidade daquela sessão foi
  gravada como se fosse própria (caminho batendo, portanto tida como
  confiável); o arquivo foi tocado; `conferir` respondeu **"✅ Sem colisão"**
  com saída `0`. Falso positivo é barulhento e barato — **falso negativo é
  silencioso e mata o mecanismo**: quem não confere por conta própria empurra
  acreditando que a trava conferiu.
- Causa: a própria mensagem do comando induzia o erro. Ao achar identidade
  herdada, ela sugeria `--quem pm-XXXX` como confirmação — quem copiasse sem
  pensar gravava id alheio como confiável. Três sessões já tinham se
  sobrescrito na mesma chave global desta casa antes de hoje — histórico, não
  hipótese.
- **Causa raiz conceitual:** o id era uma declaração não verificada, e
  declaração não verificada não é identidade.

### B — O CONSERTO: IDENTIDADE DERIVADA, NUNCA DECLARADA

- A identidade passa a nascer do caminho absoluto do worktree (prefixo mais
  hash) — determinística, única por worktree, impossível de herdar (dois
  worktrees têm caminhos diferentes) e impossível de digitar errado (ninguém
  digita).
- `--quem` deixa de definir posse e vira só rótulo legível para gente; a
  máquina não lê mais essa flag para decidir nada.
- `git config dioli.quem` nunca mais é lido para decidir nada; sobra um aviso
  de vestígio com a linha para apagar — não apaga sozinho, pode ser de outra
  sessão viva.
- Sumiu a fiação de identidade "desconhecida/suspeita/herdada": sem
  declaração, não há mais estado duvidoso para tratar.
- Reivindicações antigas no remoto não quebram: nunca serão reconhecidas como
  "minhas" por ninguém — que é o lado seguro, barra em vez de aprovar. Provado
  com os quatro caminhos de worktree reais desta máquina: quatro identidades
  distintas, o worktree principal nunca colide com um isolado.

### C — A FILA DE LEADS NÃO ENXERGAVA O IRMÃO FORA DA JANELA

- A rota lia no máximo 200 solicitações e agrupava repetição **em memória**
  sobre essa lista: irmão fora das 200 não aparecia, e a tela dizia "1ª vez"
  para quem já tinha escrito várias vezes.
- **O teto não foi aumentado** — a casa já registrou a lição: quando o teto
  aperta, o caminho é promover uma coluna, não empurrar o número (aumentar só
  adia o mesmo problema para a próxima marca).
- A contagem passou a vir do **banco**, usando a `chaveDoProspect` (saiu do
  limbo nesta mesma rodada) e o índice que já existia — reaproveitando a
  mesma política de visibilidade "meu OU órfão" já em uso no resto da casa.
- A resposta **confessa a janela**: total no banco, irmãos visíveis e irmãos
  fora da janela ganharam nomes diferentes, porque são fatos diferentes.
  Mostrar 2 quando são 3 é mentir por omissão.
- Falha de contagem nunca vira zero silencioso: cai para a janela e marca
  contagem parcial. "Não consegui contar" e "escreveu uma vez só" são fatos
  opostos e não podem parecer o mesmo resultado.
- **Aberto:** a tela da fila ainda não mostra o dado novo — outro `pm` está em
  voo nessa frente, já tem dono.

### D — O ROBÔ DE ESPELHO DO KIT NASCEU

- Medido: o carimbo estava parado havia uma semana e os workflows desta casa
  não incluíam nenhum de espelho — quem abrisse `docs/kit/` lia manual
  incompleto acreditando ter lido o manual inteiro.
- O robô agora existe, roda diário e sob demanda, e o carimbo grava
  `ultimaTentativaEm`, `ultimoErro` e `estado` — **mesmo quando falha**. O
  aviso mora no topo de `docs/kit/` (gerado) e também na abertura de sessão,
  pelo gancho.
- **Achado medido, não contornado:** o kit é repositório privado separado, e
  `git ls-remote` falha aqui com "could not read Username" — o `GITHUB_TOKEN`
  do Actions só alcança o próprio repositório.
- 🔴 **Aberto:** `KIT_REPO_TOKEN` não existe. Enquanto o CEO não provisionar,
  o robô não espelha e `docs/kit/` continua parado.

### O que fica aberto desta rodada

- 🔴 `KIT_REPO_TOKEN` não provisionado — bloqueia o espelho do kit.
- 🔴 Backfill de `chaveDoProspect` segue armado e não disparado, esperando o
  CEO — escrita em dado real de cliente não é de agente.
- A tela da fila ainda não consome o dado novo de "irmão fora da janela" —
  API pronta, tela tem outro dono em voo.
- Linha legada de `chaveDoProspect` nula não é alcançada pela contagem barata
  — não é regressão, é o limite já declarado; quem fecha é o backfill.
- Fichas duplicadas em produção seguem esperando decisão do CEO desde 08/08.
## 🔴 16/08/2026 (depois das 18:21) — A COLHEITA DEPOIS DO ÚLTIMO REGISTRO FOI MAIOR QUE A DE ANTES

**Por que este registro existe:** o último registro (`6007fda2`) fechou às
18:21. Entre ele e agora (por volta das 19:09) o repositório recebeu **34
commits** — mais do que o dia inteiro tinha produzido até ali. A regra da casa é
clara: decisão tomada em conversa vira registro na mesma sessão, e sem isto
alguém reabre amanhã o que já foi decidido hoje. Ver a versão condensada, para o
Diretor Geral do Cérebro, em `docs/decisoes.md` ("A COLHEITA DEPOIS DAS
18:21..."); aqui vai o diário, com a medição.

### A — CINCO VEZES "PARECE CERTO, NÃO ESTÁ, NADA DENUNCIA" NO MESMO DIA

Já no corredor (`docs/decisoes.md`), com os cinco casos e as citações
`arquivo:linha`. O que fica só aqui, de diário: a mesma doença apareceu tanto em
código de fala (SDR) quanto em código de conversão de número (`question-engine`)
quanto em código de coordenação entre sessões (`reivindicar.mts`, item D
abaixo) — não é peculiaridade de um módulo, é o formato do erro desta casa hoje.

### B — A IDENTIDADE HERDADA DE OUTRA SESSÃO, RODADA 3 (`692773d6`, 18:46)

Continuação da decisão já registrada ("IDENTIDADE DE REIVINDICAÇÃO MORA POR
WORKTREE", em `docs/decisoes.md`) — aquela cobria só a rodada 2. Havia uma
terceira volta, medida por um terceiro pm, **no worktree PRINCIPAL**, que **é**
o `git-common-dir`, não um worktree isolado de agente:

- `git config dioli.quem` devolvia `"pm-a27b5772"` — identidade de OUTRA sessão,
  gravada pelo código antigo (rodada 1), de antes da migração para
  `.dioli-quem`. O worktree principal nunca tinha o arquivo novo, porque
  nenhuma sessão pós-rodada-2 tinha rodado `abrir` nele ainda.
- `npm run reivindicar -- conferir` (sem `--quem`, resolvendo sozinho) caía no
  fallback do `git config`, **achava que sabia quem era, e barrava a própria
  sessão pelas PRÓPRIAS reivindicações** — o "quem" usado na conferência era o
  de outra sessão. Aprovar ou barrar por identidade errada é sempre o modo caro;
  aqui bloqueou (benigno), mas o desenho antigo permitia o oposto.
- **Conserto (`scripts/reivindicar.mts:260-440`):** `.dioli-quem` passa a gravar
  também o caminho absoluto do worktree que escreveu. Na leitura, caminho batendo
  é confiável; caminho divergente, formato antigo de uma linha só, ou valor vindo
  só do `git config` são **suspeitos de herança — mostrados, nunca obedecidos**.
  `abrir` também passou a gravar a identidade **antes** do push, não depois — o
  raciocínio antigo ("reivindicação que não chegou ao remoto não deve ensinar a
  se reconhecer como dona de nada") **era o próprio bug**: identidade é fato da
  sessão, não da reivindicação, e cai justamente quando o push falha, que é
  quando `conferir`/`encerrar` mais precisam funcionar.
- Regra geral que fica, escrita no próprio arquivo: **diante de identidade
  duvidosa, barrar por engano é o erro benigno (a pessoa perde um minuto);
  aprovar por engano é o erro caro e silencioso. A trava sempre escolhe o lado
  que faz barulho.**

⚠️ **Registro também o lado que funcionou, para não parecer que a trava só
falha:** hoje ela impediu esta própria sessão de tocar
`components/agency/briefing/PublicBriefingRoom.tsx`, porque outro pm
(`pm-defeitos-do-ceo`) tinha reivindicação viva ali
(`reivindicacoes/briefing-tela-do-sdr.json`, aberta 18:52, ainda aberta). Não
forcei. É por isso que este registro cita aquele arquivo sem editá-lo.

### C — O FREIO POR `sessionId` NO SDR (`7394496a`, `a9637aed`, `d45cf695`) — E A RESSALVA QUE NÃO PODE SER DILUÍDA

Parecer do `seguranca`, 16/08: o único freio da rota pública do SDR contava
requisição por IP (1.800/hora); não distinguia "cliente pagante numa conversa
longa" de "abuso". Ganhou um segundo freio, por `sessionId`, **somado** ao de
IP — `app/api/sdr/chat/route.ts:335-434`.

- **O que ele pega:** o script que reusa (ou esquece de trocar) o mesmo
  `sessionId`, incluindo um pool de IPs atrás da mesma sessão — o caso que hoje
  escapava do freio de IP.
- 🔴 **O que ele NÃO pega, e ninguém deve dizer o contrário:** `sessionId` vem
  do corpo, escrito pelo cliente. Quem quer abusar de verdade gera um
  `sessionId` novo a cada chamada — cada um cai num balde vazio, e este freio
  nunca estoura para ele. **Ele fecha o laço que troca de IP mantendo a sessão;
  não limita o gasto total.** Ninguém deve reportar "o custo do SDR está sob
  controle" com base só nisto.
- **Achado do próprio conserto, na auditoria (`a9637aed`):** o `sessionId` era
  `"prospect-" + Date.now()` — previsível pelo relógio, sem componente
  aleatório. Quem adivinhasse o valor (força bruta numa janela de segundos)
  podia queimar a cota de UM visitante específico e derrubar a conversa dele
  por 30 minutos — negação de serviço direcionada, introduzida pelo próprio
  conserto de hoje. Fechado com `crypto.randomUUID()`; **observação de rede
  continua sendo caminho, e está escrito como MITIGADO, nunca como resolvido**
  (`app/api/sdr/chat/route.ts:406-416`).
- Cookie httpOnly assinado fecharia a parte que sobra, e foi **deliberadamente
  adiado** — ver item aberto correspondente em `docs/decisoes.md`.

### D — "EXERCITAR ACHA O QUE TESTE VERDE NÃO ACHA" — QUATRO VEZES HOJE, DEPOIS DAS 18:21

- **A fila do briefing:** três tentativas de medir produção pelo terminal
  (`npx @railway/cli whoami`) pararam em `"Unauthorized"` — `railway login` é
  interativo, sem uso possível neste ambiente. A resposta foi construir
  `/api/piloto/diagnostico` (`app/api/piloto/diagnostico/route.ts`) e RODAR
  contra o banco de verdade, não só ler o código das regras de sujeira.
- **O 429 real:** a prova visual (`8958662e`) não simulou o limite — mandou 34
  POSTs de verdade contra `/api/sdr/chat` até o limitador responder
  `429`/`Retry-After: 46`, e só então fotografou.
- **A foto do escopo:** `e00b5319` fotografou o escopo sobrevivendo a um corte
  real (56 posts/mês salvos, contra "número nenhum" do comportamento antigo).
- **O despacho pela CLI:** já registrado no corredor ("A COORDENAÇÃO ENTRE
  SESSÕES..."), três pms mediram de forma independente que subagente sem
  `--permission-mode acceptEdits` não escreve nada — só apareceu rodando o
  comando, nunca leria isso em documentação.

### E — AS TRÊS FERRAMENTAS ARMADAS, ESPERANDO O CEO

Conferido em `scripts/` — as três simulam por padrão, exigem confirmação
explícita para escrever, e nenhuma foi disparada:

1. `scripts/chave-do-prospect-backfill.mts` — preenche `chaveDoProspect` nas
   linhas legadas. Decisão registrada em `docs/decisoes.md`
   ("MESMO CONTATO, VÁRIOS BRIEFINGS").
2. `scripts/volume-subestimado.mts` — corrige `postsPerWeek` gravado abaixo do
   que o cliente pediu, lendo a conversa original como prova. Novo hoje
   (`599e28a9`).
3. `scripts/nome-do-negocio.mts` — corrige nome de negócio que nasceu como nome
   de pessoa. Novo hoje (referenciado em `app/api/piloto/diagnostico/route.ts:5-6`).

Todas as três têm o mesmo motivo para não terem rodado: escrita em dado real de
cliente (nome, preço, escopo contratado) é decisão do CEO, não do PM nem do
Diretor.

### F — A LIÇÃO DO DIRETOR: DOIS PORTÕES COBRADOS O DIA INTEIRO, NENHUM SOBRE PRODUÇÃO

Já no corredor. Aqui, o fato cru: o Diretor rodou `npx tsc --noEmit` e
`npm test` repetidamente ao longo do dia como critério de aceite de cada
despacho, e nenhuma dessas rodadas mede se o commit aprovado chegou à produção.
`app/api/piloto/diagnostico/route.ts` só existe porque três tentativas de medir
produção pelo terminal falharam por falta de credencial — e é o CEO quem decide
se corrige o que a rota mediu, não o Diretor.

### 🔴 O que segue aberto, com dono conferido no `reivindicacoes/`

- [ ] 🔴 `RESEND_FROM` ausente em produção — sem dono.
- [ ] 🔴 DNS sem `www` (apex 404) — sem dono, pendência do CEO.
- [ ] 🔴 CSRF nas rotas de escrita interna — em andamento, `pm-9ab49074`
      (`seguranca-csrf-rotas-de-escrita`, aberta 19:00).
- [ ] 🔴 Cookie httpOnly assinado nas 3 rotas do SDR — adiado com motivo
      escrito, sem dono agora.
- [ ] 🔴 `DATETIME` como TEXT no SQLite (`processador-outbox.ts`) — em
      andamento, `pm-distancia-deploy` (`outbox-datetime-como-texto`, aberta
      18:44).
- [ ] 🔴 Fichas duplicadas desde 08/08 (Camila Pereira) — sem dono, decisão do
      CEO.
- [ ] 🔴 Script de captura lê alerta vazio a 375px (falso alarme declarado) —
      em andamento, `pm-9ab49074` (`briefing-instrumento-que-mente`, aberta
      19:08, a mais nova).
- [ ] 🔴 `ESFRIAMENTO_MS = 6000` sem medida — sem dono, risco baixo.
- [ ] 🔴 Fila de leads lê no máximo 200 — em andamento, `pm-a27b5772`
      (`fila-irmao-fora-do-teto`, aberta 18:50).
- [ ] 🔴 Volume declarado chegando a zero / verba ignorada na estimativa — em
      andamento, `pm-verba-e-volume` (`esteira-escopo-e-preco`, aberta 18:51).
- [ ] 🔴 Robô de espelho do kit pronto, esperando `KIT_REPO_TOKEN` do CEO — ver
      `CLAUDE.md`.
- [ ] 🔴 Tela dos avisos de orçamento presos e o alinhamento API-vs-página — em
      andamento, `pm-9ab49074` (`agencia/api-alinha-com-a-pagina`, aberta
      19:00).
- [x] ✅ Barra branca no topo (relato do CEO, 15/08) — **RESOLVIDO em
      28/08**. Era a `AgencyTopBar`, a barra fixa do celular: pintada com
      `--bg` (#F7F8FA, o fundo da PÁGINA) quando ela é o topo da sidebar no
      celular. Passou a sair de #0B0F2A, a parada de 0% do gradiente da
      sidebar. Medido a 375px em /agency/dashboard, /agency/brain e
      /agency/tasks, tema claro e escuro: rgb(247,248,250) → rgb(11,15,42).

---

## 🟢 16/08/2026 — TRÊS DEFEITOS SÓ APARECERAM PORQUE A FERRAMENTA FOI EXERCITADA, NÃO PORQUE UM TESTE FICOU VERMELHO

**A conclusão primeiro:** o ambiente de sessão nascia quebrado toda vez, a trava
de reivindicação prendia quem a obedecia (deadlock no primeiro dia de uso), e
`chaveDoProspect` saiu do limbo — fica na tabela e passa a ser lida. Nos três
casos, um teste verde não teria pego nada: só apareceu porque alguém rodou o
mecanismo de verdade, no modo em que ele vive.

### A — O AMBIENTE NASCIA QUEBRADO EM TODA SESSÃO NOVA

- Um container subiu sem `node_modules`; `npx tsc --noEmit` devolvia milhares de
  erros, `zustand` ausente. Um `npm install` zerou o typecheck na hora. **Três
  `pm` diferentes chegaram a concluir que o repositório estava quebrado** — não
  estava; faltava provisionar.
- Não havia `.claude/settings.json` nem `.claude/hooks/` neste repositório. Nada
  provisionava nada.
- **Conserto:** gancho `SessionStart` síncrono — instala dependências se
  faltarem, gera cliente do Prisma se faltar, só então cria `.env` de
  desenvolvimento e provisiona o banco. Nunca sobrescreve `.env` existente.
  Nenhum segredo de produção. Sempre sai `0`.
- Provado três vezes: do zero (~36s); segunda rodada com ambiente pronto (não
  reinstala nada); e com `PATH` sem `npm`/`npx`, saiu `0` nomeando as três falhas
  sob o título "O AMBIENTE FICOU INCOMPLETO. Isto não é o código quebrado".
- **Dois defeitos só achados por exercitar:** `.gitignore` ignorava `.claude/*`
  e o gancho **não seria versionado** (gancho que não chega às outras sessões
  não existe); e o bit de execução só foi confirmado conferindo o índice do git
  (`100755` — em `100644` não rodaria na máquina de mais ninguém).

### B — A TRAVA DE REIVINDICAÇÃO PRENDEU QUEM A OBEDECEU: DEADLOCK NO PRIMEIRO DIA

- Um `pm` fez tudo certo e o gancho pré-push o barrou pela **própria**
  reivindicação dele. `encerrar` também não passava, porque a reivindicação só
  sai por push e o push estava barrado por ela. Deadlock fechado — ele não usou
  `--no-verify` nem `--forcar`; gravou a identidade à mão.
- **Causa raiz medida:** `git config --local` num worktree grava no
  `GIT-COMMON-DIR` (`.git/config`) — compartilhado por **todos** os worktrees.
  Dois defeitos daí: (1) a gravação estava **fora** do worktree isolado e era
  recusada, com um `catch` vazio **silencioso**; (2) por ser compartilhado, dois
  `pm`s se sobrescrevem e um pode herdar a identidade do outro — a trava
  passaria a **aprovar** o que deveria **barrar**. Identidade errada é pior que
  identidade ausente.
- **Conserto:** identidade passa a morar em `.dioli-quem` na raiz do worktree
  (ignorado pelo git, um por worktree, nunca colide); falha de gravação nunca
  mais é silenciosa; `abrir` e `encerrar` empurram com `--no-verify` porque o
  script já conferiu a colisão linhas antes; nenhum caminho termina em beco sem
  saída — toda vez que `conferir` barra, lista as opções concretas e coláveis.
- **O defeito que mais importava, achado por exercitar:** `conferir --quem`
  passava limpo mas **não gravava** a identidade — a pessoa teria que repetir a
  flag para sempre, enquanto `--no-verify` resolve de uma vez. **Quando o
  atalho é mais barato que o caminho honesto, todo mundo pega o atalho e a
  trava morre** — e aí o errado é a trava, não a pessoa. Agora `conferir --quem`
  grava, e o caminho honesto custa uma vez só.

### C — `chaveDoProspect` SAIU DO LIMBO

- Era gravada e nunca lida em produção. Decisão: a coluna **fica** e passa a
  ser **lida**.
- Não removida porque `DROP COLUMN` em SQLite exige reconstrução de tabela
  sobre o volume do Railway (custo que a casa já pagou para evitar no
  `DriveMaterial`), e porque a coluna é a única porta para tirar o agrupamento
  da memória — pendência aberta, já que a fila lê no máximo 200 e um irmão fora
  das 200 não aparece como repetição.
- **A rede:** linha de chave nula continua pelo recálculo. Trocar o recálculo
  pela coluna pura seria **regressão silenciosa**, porque as linhas legadas são
  nulas e hoje só são agrupadas por causa do recálculo. Cada grupo carrega a
  **procedência** da chave (coluna ou recalculada), senão o backfill vira ato
  de fé.
- **Backfill entregue armado, não disparado:** mede por padrão, exige flag e
  confirmação para escrever, nunca sobrescreve chave existente, idempotente,
  recusa banco remoto sem flag explícita. **Não foi rodado.** Escrita em dado
  real de cliente é do CEO.

### D — O QUE CONTINUA ABERTO E SEM DONO

- [ ] `RESEND_FROM` ausente em produção: o e-mail falha para todos, calado.
- [ ] O custo de IA por briefing repetido, agravado pelo teto de tokens que
      subiu de 1.280 para 3.000 numa rota pública.
- [ ] As fichas duplicadas em produção esperando decisão do CEO desde 08/08.
- [ ] O backfill da `chaveDoProspect` esperando o CEO decidir rodar.
- [ ] O agrupamento da fila ainda lê no máximo 200 solicitações; irmão fora das
      200 não aparece como repetição.

> A lição atravessa os três casos, e está registrada em `docs/decisoes.md`: teste
> verde com ferramenta quebrada é a peça verde de junta rompida. Ver a decisão
> "MECANISMO NÃO EXERCITADO NÃO É MECANISMO PRONTO".

## 🟢 16/08/2026 — O PR #178 RECONCILIADO: A FICHA VIRA FONTE DO PROMPT, E A ORDEM DO PACOTE GANHA TRAVA

**A consequência, primeiro:** o system prompt do SDR passa a ser montado em
runtime a partir da **ficha do cargo** — editou a ficha, subiu o deploy, o agente
já vestiu. E a garantia de que o corte por teto de tokens cai **na fala, nunca no
dado do cliente**, deixou de depender de ninguém lembrar: agora ela está na ficha
e há teste que reprova se sair de lá.

**Portões rodados pelo `pm`:** `npx tsc --noEmit` → **exit 0** · **4983 testes em
326 arquivos, todos verdes** · `npm run build` → **exit 0**. (O piso do despacho
era 4886 em 316. O teste antes pulado —
`__tests__/plataforma/o-navegador-chega-em-producao.test.ts:64`, um
`it.skipIf(!construido)` — deixou de ser pulado **porque o build rodou**, e passou.)

### 🔴 O RISCO ERA INVISÍVEL, E NÃO ERA O CONFLITO DE MERGE

O #178 foi aberto sobre a base velha `88ef823`. O conflito real tinha **duas
linhas**. O perigo estava noutro lugar: o bloco vindo da ficha é colado **depois**
do prompt base e se declara autoridade — *"em conflito com qualquer instrução
acima, ESTAS REGRAS VALEM"*. O conserto do SDR de hoje depende da **ordem dos
campos** (`scope` primeiro, `reply` por último). **A ficha não carregava essa
ordem.** Bastava alguém reordenar aquele parágrafo para a trava do código
continuar igual e **parar de proteger**, com os testes verdes — porque eles
testam `repararJsonTruncado`, não a ficha nem o prompt montado.

### O que ficou PROTEGIDO daqui para a frente

- **A ordem mora nos DOIS lugares, de propósito:** no prompt base
  (`lib/agency/comercial/prompt-do-sdr.ts`) e dentro dos marcadores
  `REGRAS-DO-CARGO` da ficha
  (`agentes/linha/client-service-sdr/conversational-sdr.md`). O teste é quem
  impede as duas cópias de divergirem.
- **O teste mede o TEXTO MONTADO** (`sistemaDoSdr()`), que é o que o modelo
  recebe — não o prompt base sozinho nem a ficha sozinha
  (`__tests__/agency/ordem-do-pacote-do-sdr.test.ts`).
- **As duas metades provadas por MUTAÇÃO NO ARQUIVO REAL**, não em string
  sintética: apagando o parágrafo da ficha de verdade, **5 asserções reprovam**;
  com ele, verde. E há caso plantado provando que **reescrita legítima** do
  parágrafo (outras palavras, sem crases, mesmo sentido) **passa** — trava que
  reprova redação honesta é trava que alguém desliga.
- **Uma ambiguidade do prompt que ninguém tinha visto:** a linha do PACOTE dizia
  `` com `reply` e `scope` dentro `` três frases antes de exigir o contrário. O
  teste pegou. Corrigido, e o teste reprova quem inverter.
- **`SYSTEM_PROMPT` saiu de `route.ts`** para `lib/agency/comercial/prompt-do-sdr.ts`
  — importar módulo de rota no vitest arrasta prisma, auth e `next/server`.
- **Nada foi afrouxado:** nenhuma regexp, o guarda `falaConfiavel`, o `MAX_TOKENS`
  (3.000 do head, não o 1.280 do #178) e o comentário "RECONCILIAÇÃO DE 16/08"
  estão intocados. Nenhum teste foi apagado.
- **`regras-da-ficha.ts` passou a dizer a condição da própria promessa:** o cache
  é por processo — produção zera no deploy, dev exige reiniciar.

**Auditado pelo `qualidade`** (despachado pela CLI): **aprovado com ressalva**, e
as duas ressalvas dele foram consertadas na mesma rodada. Ele recusou confirmar o
que não pôde executar, que é o comportamento certo do Essencial.

### 🔴 UMA AFIRMAÇÃO MINHA ESTAVA ERRADA, E FICA REGISTRADA

Ao despachar, afirmei que export extra num `route.ts` quebraria o `npm run build`
(pela validação `checkFields` do `next-types-plugin`). **Medido: não quebra.** O
Next 16.2.1 deste repositório gera em `.next/types` só `routes.d.ts` e
`validator.ts` — **não há arquivo de guarda por rota** —, e o build sai **0** com
`repararJsonTruncado` exportado da rota desde antes. A extração continua certa
pelo outro motivo; a razão que declarei, não.

### 🔴 O QUE CONTINUA ABERTO — com todas as letras

- [ ] **O dispositivo vale para 1 ficha de ~81.** Só `conversational-sdr.md`
      delimita `REGRAS-DO-CARGO`. Para as outras, `blocoDeRegrasParaPrompt`
      devolve string vazia e o agente roda com o entorno de sempre — **degrada,
      não derruba**, e loga o motivo. Quem ler *"a ficha chega no agente sozinha"*
      sem contar as fichas conclui o oposto. **Sem dono.**
- [ ] **A garantia é textual, não estrutural.** Nada no parser exige a ordem dos
      campos. Quem impede fala cortada de chegar ao prospect é o guarda
      `falaConfiavel` **em código**; a ordem do prompt decide **o que sobra**
      quando corta. As duas são uma decisão só.
- [ ] **O piloto ao vivo continua sem reexercício.** A prova é de teste, não de
      conversa real.
- [ ] **`__tests__/agency/a-ficha-chega-no-agente.test.ts` está fora do lugar
      natural dele** (`__tests__/v2/`), por respeito a reivindicação viva de outra
      sessão. **Devolver quando a frente `qualidade/portao-instavel-v2`
      encerrar.** O porquê está escrito dentro do arquivo.

### 🔴 A QUARTA E A QUINTA COLISÃO DO DIA — e desta vez houve MECANISMO

O `push` foi recusado **duas vezes** nesta rodada. Da primeira, o remoto estava
**19 commits à frente** — e nenhum deles tocava arquivo de código deste trabalho;
só `docs/decisoes.md` cruzou, resolvido mantendo as duas seções com ponteiro de
uma para a outra.

**Da segunda, quem recusou foi o gancho pré-push**, e é a primeira vez que a casa
para uma colisão **antes** do dano: `pm-9ab49074` tinha reivindicação viva sobre o
diretório `__tests__/v2` inteiro, caçando um portão instável *"passa isolado,
falha na suíte cheia"* — e o #178 depositava um teste novo lá dentro. **A
composição da suíte É a variável que aquela sessão está medindo.**

**`--forcar` existe e NÃO foi usado.** As responsabilidades eram diferentes e a
sobreposição era de pasta, não de pergunta: o arquivo mudou de lugar. **A trava de
reivindicação funcionou na estreia** — e vale registrar que ela nasceu no remoto
**no meio deste trabalho**, então esta frente inteira foi construída **sem
reivindicação**, porque o mecanismo ainda não existia localmente quando ela
começou.

- [ ] 🔴 **CEO/Diretor — há pelo menos QUATRO sessões vivas nesta branch agora**
      (`pm-9ab49074`, `pm-a27b5772`, `pm-a6e16be`, e esta), e **duas delas mexem no
      SDR ao mesmo tempo**: `esteira/fim-da-entrevista` (aberta 17:47, em
      `prospect-engine.ts` / `sdr-agent.ts` / `question-engine.ts`) e esta. Os
      arquivos não se cruzam **hoje**. A trava nova barra por arquivo e por
      responsabilidade; **ninguém está barrando por PRODUTO**. Sem dono.

---


## 🟢 16/08/2026 — A REIVINDICAÇÃO VIROU TRAVA: TRÊS FRENTES CONSTRUÍDAS EM DOBRO NO MESMO DIA (`f9e3663e`, `503f41af`)

**A conclusão em uma frase:** conversas diferentes na mesma branch construíram o
mesmo defeito três vezes no mesmo dia — a única coisa que todas compartilham é o
repositório, e o `git pull --rebase` avisava tarde demais; a partir de hoje,
reivindicar antes de começar deixou de ser prosa (`docs/kit/13-quem-esta-vivo.md`
§3, escrita desde 02/08) e virou mecanismo que recusa colisão na hora.

### As três construções em dobro

- **O `parse_error` do SDR.** Commits `171014e4` e `a18df6ee`, ~3h cada — e o
  estrago era maior do que parecia: o commit de reconciliação `5d806a60`
  ("Reconcilia TRÊS consertos paralelos do mesmo defeito do SDR") mostra que
  foram **três**, não dois.
- **A regra de "verba declarada vs. estimativa".** Dois módulos com a mesma
  responsabilidade, o mesmo caso real e a mesma fonte de preço, e **nomes de
  arquivo diferentes** — `lib/agency/comercial/verba-declarada.ts` (`031831c6`) e
  `lib/agency/comercial/verba-vs-estimativa.ts` (`2323cacb`), com consumidores
  diferentes. Colisão por caminho não pegaria este caso. Fusão paga hoje em
  `6ab3fe59` ("uma fonte só para a regra da verba — o módulo em dobro foi
  apagado"): custo medido no diff, **157 linhas de módulo e 151 de teste
  descartadas**, além do retrabalho de fundir e reapontar consumidores.
- **O e-mail de "orçamento pronto".** Colisão em 4 arquivos com `a2d06fb1`. Uma
  implementação inteira foi para o lixo.

### O que ficou PROTEGIDO daqui para a frente (commit `f9e3663e`)

- **`reivindicacoes/`** — registro versionado, **um arquivo JSON por frente**.
  Arquivo único com todas faria o próprio registro de coordenação virar fonte de
  conflito de merge.
- **`npm run reivindicar -- abrir`** busca o **remoto** antes de qualquer coisa —
  é a única coisa que duas conversas isoladas compartilham. Colidiu: recusa e
  nomeia quem pegou, desde quando e por quê. Não colidiu: grava, commita e
  empurra na hora.
- **`conferir`** (abertura de turno e gancho pre-push) · **`encerrar`** ·
  **`listar`**.
- **Colisão por RESPONSABILIDADE, não só por caminho** — o único ângulo que pega
  o caso da verba.
- **O sentinela dentro do `npm test`:** duas reivindicações vivas com a mesma
  responsabilidade, ou o mesmo arquivo, deixam a suíte vermelha.
- **O gancho pre-push se instala sozinho no `npm install`** (script `prepare`) e
  nunca derruba a instalação: falhou, sai 0 calado.
- **O que foi deliberadamente afrouxado, com todas as letras:**
  - Reivindicação com **mais de 24h não bloqueia** — vira aviso. Sessão que morre
    sem encerrar travaria a frente para sempre.
  - **`--forcar` existe**, exige motivo escrito e fica gravado no JSON.
  - **`conferir` falha ABERTO sem rede** (senão ensina todo mundo a usar
    `--no-verify`); **`abrir` falha FECHADO** (reivindicar às cegas é pior que não
    reivindicar).
  - **O aviso de vizinhança é aviso, não bloqueio.** Nenhum mecanismo automático
    prova que dois arquivos de nomes diferentes respondem à mesma pergunta — só
    quem declara sabe.

### A regra do despacho, com a medição (commit `503f41af`)

Três project managers mediram, de forma independente, o mesmo defeito de
mecanismo, e cada um perdeu uma frente inteira:

- Subagente lançado por `claude --agent <nome> -p` **não escreve em disco** sem
  `--permission-mode acceptEdits`. Volta com diagnóstico perfeito e zero linha
  aplicada.
- **Mesmo com a permissão, o subagente não executa.** Medido hoje com o
  Essencial `qualidade`: `npx tsc --noEmit` e `npm test` devolveram a mensagem
  exata **"This command requires approval"**, com e sem
  `dangerouslyDisableSandbox`; `node --version` e `git status` rodaram.
  **Consequência: o especialista escreve; o portão e o commit são do PM.**
- **O subagente é isolado no worktree e não lê `/tmp`** — a primeira tentativa de
  despacho de hoje voltou dizendo, corretamente, que não achava a ficha. Ficha de
  despacho mora dentro do worktree.
- **O custo já pago:** rodadas anteriores declararam a exceção `SEM_AGENTE` e
  produziram na mão acreditando que a camada de delegação não existia — o que
  faltava não era agente, era a flag.

### O achado técnico do dia — vale mais que o conserto original

**O reparo de JSON truncado fechava string e chave, mas não protegia valor cru
cortado.** `postsPerWeek: 14` cortado no dígito vira `postsPerWeek: 1` — e
**número truncado não tem marca**, ao contrário de string: `"Ana Doces e Bolos
Personaliza"` salta aos olhos de quem lê. O número não. Isso reproduzia o
incidente original em silêncio, sem o "0 posts/mês" berrante para denunciar, e já
estava no remoto quando foi achado. **A trava:** valor cru no fim absoluto do
texto sai inteiro; valor seguido de delimitador que o próprio modelo escreveu
sobrevive.

### 🔴 O QUE CONTINUA ABERTO — com todas as letras

- [ ] 🔴 **`RESEND_FROM` ausente em produção.** O e-mail falha para todos,
      **calado** — cliente não recebe confirmação nem aviso, e ninguém na casa é
      avisado de que falhou.
- [ ] 🔴 **O custo de IA por briefing repetido**, agravado pelo **teto de tokens
      que subiu de 1280 para 3000 numa rota pública.** Cada briefing é uma
      fatura, e a rota não exige login — qualquer um pode repetir o gasto à
      vontade.
- [ ] 🔴 **As fichas duplicadas em produção esperando decisão do CEO desde
      08/08.** A Camila Pereira segue com duas fichas. Qual delas fica com o
      histórico é decisão de dono de negócio, não de código.
- [ ] 🔴 **`EstimateSection` e `ProposalCard` estão mortos em
      `components/agency/briefing/PublicBriefingRoom.tsx`** — sem chamador. A
      consequência de negócio: **o prospect não vê valor em R$ na tela
      pública**, o que enfraquece a conversão antes mesmo de chegar à proposta.
- [ ] 🔴 **O botão de WhatsApp da confirmação abre sem texto pré-preenchido.** O
      cliente chega à conversa sem contexto, e a agência perde a chance de
      abrir o atendimento já no assunto certo.

**A consequência, primeiro:** quando o SDR tem a fala barrada, **o briefing do
cliente não vai mais junto para o lixo**. E o dispositivo que o CEO mandou
construir em 15/08 para o Diretor não ter desculpa de *"eu não vi"* **passou a
ter quem o chame**.

**O caso real, piloto ao vivo:** dois `parse_error` em três minutos (12:41:23 e
12:43:01). O cliente tinha dito **"R$ 500/mês"** e **"2 posts por dia"**; o
briefing saiu com **R$ 1.800–3.400 e 3 posts/semana**. O escopo morreu junto com
a fala.

**Portão rodado pelo `pm`:** `npx tsc --noEmit` → **0 erros** ·
**4872 testes em 314 arquivos, 1 pulado, todos verdes** (piso antes da rodada:
4818 em 309).

### 🔴 **TRÊS** SESSÕES CONSERTARAM O MESMO DEFEITO, NO MESMO DIA, EM MENOS DE 20 MINUTOS

O `push` foi recusado **duas vezes**. No remoto já estavam:

| commit | sessão | o que mexeu |
|---|---|---|
| `171014e` 16:23 | `…KTHqzi8c` | `route.ts` + 1 teste — **só o servidor** |
| `70e6c7d` · `2323cac` | idem | o botão do briefing · verba vs. estimativa |
| `a18df6e` 16:39 | `…6NZQcLpa` | enxerto sobre `171014e`: número cortado, teto do reparo |

Este trabalho fechou às 16:29. **Mesmo incidente do piloto, mesmo arquivo, mesma
função ressuscitada, três vezes.** Duas das três também consertaram o botão
"Voltar ao início" do BLOCO 2 — e nenhuma sabia das outras.

**As versões não eram equivalentes, e é aí que está a lição:** a primeira mexeu
em **dois arquivos** e **não tocou no cliente**. Sem `PublicBriefingRoom.tsx`, o
escopo continuava morrendo em `if (!data.ok …) return null` — **o conserto do
servidor não chegaria à tela**. É o defeito D-003 de novo, um andar acima, dentro
do conserto do D-003.

**E a terceira achou algo MELHOR que as outras duas, que foi preservado inteiro:**
`{"scope":{"social":{"postsPerWeek":1` — corte depois do primeiro dígito de `14`
— virava `postsPerWeek: 1`, e o `JSON.parse` **aceitava**. É pior que o defeito
original porque é **silencioso**: string truncada tem marca ("Ana Doces e Bolos
Personaliza" salta aos olhos), número truncado não tem nenhuma. Regra que ficou:
valor bare que é o último caractere do texto sai da mesa inteiro; valor seguido de
delimitador escrito pelo próprio modelo sobrevive intacto — **trava que apagasse
todo número seria pior que o furo**. Junto veio `TETO_DO_REPARO = 20.000` (do
`seguranca`): as duas `.replace()` do fim de `repararJsonTruncado` não são
ancoradas e custam O(n²) numa rota **pública sem sessão**.

**A reconciliação, e as três decisões (registradas em `docs/decisoes.md`):**

| ponto | as duas versões | o que ficou | por quê |
|---|---|---|---|
| teto de tokens | 2.000 · 3.000 | **3.000** | `max_tokens` é TETO, não gasto: teto folgado não custa nada nos turnos normais |
| rótulo do diário | `truncado`/`malformado` · `parse_error_*` | **`truncado`/`malformado`** | `EXPLICACAO_DA_RECUSA` já indexa por eles, e `parse_error_` é jargão numa linha que o CEO lê |
| confiar na fala remendada | estrito · `"scope" in parsed` | **estrito** | ver abaixo — a heurística deles **deixou de ser verdadeira** |

🔑 **A heurística da outra sessão não foi rejeitada por gosto: ela virou falsa.**
Ela dizia *"o formato manda `reply` ANTES de `scope`, logo escopo presente prova
que a fala fechou antes do corte"*. Esta versão **inverteu a ordem do JSON no
prompt de propósito** — `scope` primeiro — para o corte cair na fala. Sob a ordem
nova, escopo presente prova o **contrário**. Mantê-la entregaria meia frase ao
prospect exatamente nos turnos em que isso é mais provável. O motivo está escrito
dentro de `route.ts` ("RECONCILIAÇÃO DE 16/08"), não só aqui.

**Nenhum teste da outra sessão foi apagado** — 4 asserções foram reescritas com o
porquê no comentário, e todas as asserções sobre o `scope` continuam palavra por
palavra. Teste que trava a regra velha faz a regra nova parecer o bug; esta casa
já pagou isso três vezes.

- [ ] 🔴 **CEO/Diretor — não há NADA que impeça três sessões de trabalharem o
      mesmo defeito ao mesmo tempo.** Custou, hoje, **três rodadas de especialista
      e três reconciliações de merge à mão**, e só não custou mais porque o
      `git push` bateu duas vezes. Com seis projetos ao mesmo tempo isso não é
      acidente, é rotina. O que salvou o resultado foi as três terem escrito **o
      porquê** dentro do código — foi lendo o comentário da outra que deu para
      saber qual regra ainda era verdadeira. **Sem dono, e sem mecanismo.**
- [ ] 🔴 **A reconciliação é onde o dano mora, e ela é invisível.** A heurística
      da sessão `…KTHqzi8c` (*"escopo presente prova que a fala fechou antes do
      corte"*) **era verdadeira quando ela a escreveu** e deixou de ser quando
      esta sessão inverteu a ordem do JSON no prompt. Duas mudanças corretas,
      isoladamente, produzem uma terceira errada. **Nenhum teste pegaria isso** —
      cada lado passava no próprio. Pegou porque alguém leu os dois comentários.

### O que ficou PROTEGIDO daqui para a frente

- **O commit anterior (#177) tinha escrito `repararJsonTruncado` e NUNCA a
  chamado** — código morto dentro do próprio conserto. A seta foi ligada.
- **`ok: false` deixou de significar "nada aproveitável".** As quatro portas de
  recusa (`truncado`, `malformado`, `email_hallucination`, `price_leak`) devolvem
  o `scope` que sobreviveu, e `PublicBriefingRoom.tsx` o aplica por gap-fill
  mesmo com a fala barrada — **consertar só o servidor deixaria o mesmo defeito
  um andar acima.**
- **O guarda não foi afrouxado.** Nenhuma regexp mudou; fala vinda de JSON
  remendado é tratada como não confiável **mesmo com `reply` presente**.
- **Dado recuperado passa pelas MESMAS travas**, agora numa função só
  (`aplicarTravasDeEscopo`), chamada nos dois caminhos.
- **O prompt exige `scope` ANTES de `reply`** — o corte cai no campo mais longo,
  que é sempre a fala. É a metade que funciona antes de precisar de remendo.
- **`stop_reason` passou a ser lido:** `truncado` (a API confirma corte) e
  `malformado` (terminou de escrever e não é JSON) são linhas diferentes no
  diário, com frase em português, e o diário diz **quando o escopo foi salvo**.
- **Teto de tokens 1.280 → 2.000**, com a conta comentada no código.
- **`GET /api/diretor/pendencias`** existe e é autenticada: coletor
  (`lib/agency/diretor/coletor.ts`) → `podeODiretorEncerrar` → veredito com a
  frase, as pendências ordenadas e as falhas de auditoria. Os sete tipos são
  varridos de verdade; **fonte que falha vira `auditoria_incompleta`, nunca
  "limpo"**, e há teste que guarda exatamente isso.
- **"Voltar ao início" virou "Voltar ao site"** em `app/briefing/page.tsx` e leva
  à raiz. Antes ele só desfazia `submitted` e devolvia ao **mesmo formulário que
  a pessoa acabou de enviar**. Palavra do CEO: *"não faz o menor sentido."*

### 🔴 O QUE CONTINUA ABERTO — com todas as letras

- [ ] `cerebro` — **`saveArtifactToDb`** (`lib/agency/persistence/save-artifact.ts:24`)
      **não tem chamador nenhum, nem em teste**, e o `POST /api/brain/artifacts`
      que o chamaria também não tem chamador de produção. O próprio arquivo
      promete *"no silent data loss"*. Se alguém ligar a tela que aprova canvas
      sem notar isso, **a aprovação parece dar certo na tela e não grava nada**.
- [ ] `cerebro` — **os acessores por departamento de `quality-gates.ts`**
      (`getQualityGateForDepartment:510`, `getBlockingChecks:514`) só são chamados
      pelo teste-medidor. **Agrava o P0 conhecido:** escrever `mecanismo` nos
      checks da Onda 4 **não basta** se nada passar a ler o registro de dentro dos
      motores reais. É fácil consertar o dado e esquecer de ligar o fio.
- [ ] **`BloqueioV2` e `estadoCanonico` são consultados pelo coletor novo e hoje
      voltam VAZIOS em produção** — nada os escreve ainda (rollout M7 não ligou).
      Está documentado no código, não escondido. Enquanto isso, o veredito do
      Diretor enxerga menos do que promete o nome do tipo `bloqueio_aberto`.
- [ ] **CEO/Diretor** — decidir se *"cliente abriu dúvida numa aprovação e a
      agência não respondeu"* (`ApprovalRequest.questionOpenedAt`) vira **8º tipo**
      de pendência ou refinamento de `aprovacao_pendente`. Ficou de fora por ser
      julgamento de produto.
- [ ] **NADA foi conferido com screenshot nesta rodada.** O `interface` não
      conseguiu subir o servidor nem rodar `scripts/shot.mjs`, e a tela de
      confirmação do briefing **só existe depois de um envio real**. A mudança
      reaproveita as classes do botão irmão (baixo risco), mas **isso é
      inferência, não medição** — e a régua da casa é 375/768/1440 medido.
- [ ] **O piloto ao vivo NÃO foi reexercitado.** A prova de que o R$ 500 / 2 posts
      por dia agora sobrevive é de teste, não de conversa real. **A volta completa
      só fecha com um briefing de verdade depois do deploy.**

### 🔴 O ACHADO DE AMBIENTE — e ele custou a rodada inteira de dois especialistas

**`node_modules` NÃO EXISTIA neste repositório no início da sessão.** Medido:
`ls node_modules` → *No such file or directory*; `npx tsc --noEmit` devolvia
**25.541 erros** — nenhum deles real, todos de tipo que não resolve. `npm ci`
(769 pacotes, 27s) zerou os 25.541.

**A consequência para a camada de despacho:** os **três** especialistas
despachados (`esteira` ×3, `interface`, `qualidade`) relataram que
`npx tsc --noEmit`, `npm test` e até `node -e` eram recusados nas sessões deles.
**Nenhum dos quatro consertos veio com portão rodado** — quem rodou os portões
foi o `pm`, depois de instalar as dependências. Isso é o oposto do que a casa
quer: especialista que não consegue medir entrega por leitura, e leitura não
reprova nada.

- [ ] `plataforma` — 🔴 **especialista despachado não consegue executar comando
      neste ambiente.** Enquanto isso for verdade, **todo portão é responsabilidade
      de quem despacha**, e isso precisa estar escrito onde o despachante vê. É o
      mesmo padrão do P0 do Playwright: *adivinhação sobre o ambiente custa um
      turno por hipótese; medida custa um comando.*
- [ ] `plataforma` — 🔴 **`--permission-mode bypassPermissions` NÃO FUNCIONA como
      root** (`"cannot be used with root/sudo privileges"`) e mata o despacho com
      **exit 0**, o que faz o despacho parecer bem-sucedido. O modo que funciona,
      medido hoje: **`claude --agent <nome> --permission-mode acceptEdits -p "…" < /dev/null`**
      (o `< /dev/null` evita o aviso de stdin). Duas rodadas anteriores declararam
      `SEM_AGENTE` por não terem medido isto.

---

## 🟢 16/08/2026 — MESMO CONTATO, CINCO BRIEFINGS: UM CADASTRO, NÃO CINCO (`4cbba4b`, `57eb2f1`)

**A pergunta do CEO:** *"se entrar um cliente com o mesmo e-mail e fizer cinco
briefings um atrás do outro, o que acontece com o sistema?"*

**A resposta medida: não dava pane — dava bagunça cara.** Cinco linhas anônimas
na fila e, na aprovação, **cinco `Client` homônimos, cinco portais, cinco
históricos**. A Camila Pereira já estava duplicada em produção por esse caminho
desde 08/08. As decisões de corredor estão em `docs/decisoes.md` (16/08) —
**marca, não funde** · **dedup de cadastro, nunca de pedido** · **nome nunca vira
chave** · **lead sem canal não tem chave** · **índice não-único, deliberado** ·
**continua `create`, nunca `upsert`**.

### O que ficou PROTEGIDO daqui para a frente

- **As DUAS portas que criavam cadastro** passam pelo mesmo resolvedor
  (`lib/agency/execution/cliente-do-briefing.ts`):
  `create-project-from-request.ts` e `/api/brain/orchestrate/apply`. Consertar só
  uma deixaria a outra vazando em silêncio.
- **A chave é persistida em quem nasce.** `Client` de briefing passa a gravar
  `email` e `phone` normalizados. Sem isso, a busca por contato jamais casaria —
  ver a lição proposta ao kit em `docs/decisoes.md`.
- **Reaproveitamento é visível, não mágico:** `registrarReaproveitamento` grava
  `cliente_reaproveitado` na linha do tempo.
- **A fila carimba a repetição** e mostra os irmãos por data · negócio · o que
  foi pedido — dado gravado, zero IA.

**Portões declarados nos commits:** `4cbba4b` — `npx tsc --noEmit` limpo, 4579
testes em 292 arquivos; `57eb2f1` — 4668 testes em 298 arquivos, 1 pulado.
Conferida a 375/768/1440 com dado plantado. **Conferido de novo ao escrever este
registro (16/08):** `tsc` exit 0 · **4695 testes em 301 arquivos, 1 pulado** — o
número subiu porque outras frentes entraram depois; nada quebrou.

### 🔴 O QUE CONTINUA ABERTO — com todas as letras

- [ ] **Aprovar N briefings do mesmo contato ainda cria N PROJETOS** (agora sob um
      cadastro só). **É deliberado** — a idempotência é por solicitação, e travar
      por cliente faria o segundo pedido legítimo falhar em silêncio com o cliente
      já tendo pago. **A defesa é o carimbo na tela**, ou seja: uma pessoa olhando.
      Não há mecanismo.
- [ ] 🔴 **DINHEIRO REAL, SEM DONO:** N briefings ainda disparam **N rodadas de
      `runAutoScope`** = **N faturas de IA**
      (`app/api/brain/client-requests/route.ts:272`). Não há nenhuma consulta ao
      prospect antes de gastar. O único freio é o teto de ritmo posto pelo
      `seguranca` em 16/08 (`79b72df`): **20 por 10 min, por IP** — que barra
      rajada de abuso e **não barra nada** no caso do CEO, que são cinco briefings
      legítimos e cinco faturas. **Fora do escopo do bloco de hoje. Sem dono.**
- [ ] 🔴 **AS DUPLICATAS QUE JÁ EXISTEM EM PRODUÇÃO NÃO FORAM FUNDIDAS.** O
      mecanismo impede duplicata **nova**; não limpa a velha. A Camila Pereira
      segue com duas fichas, esperando o merge manual
      (`app/api/clients/[id]/fundir/route.ts`). **Qual ficha fica com o histórico é
      decisão do CEO** — a mesma que está aberta desde 08/08.
- [ ] **`chaveDoProspect` é GRAVADA e AINDA NÃO É LIDA por ninguém.** Medido: os
      únicos leitores são testes e `scripts/plantar-leads-repetidos.mjs`. Quem
      agrupa a fila é `agruparPorProspect`, **em memória**
      (`app/api/agency/leads/route.ts:52`) — o que, por acaso, é o que faz as
      linhas legadas também serem agrupadas. **As linhas legadas ficam com a chave
      NULA e não há backfill.** Coluna gravada que ninguém lê é dívida que envelhece
      calada. Sem dono.
- [ ] **Teto de 1000 na varredura de fichas legadas**
      (`TETO_DA_VARREDURA`, `cliente-do-briefing.ts:89`). Acima disso a segunda
      passada simplesmente **não vê** a ficha e o cadastro duplica **em silêncio**.
      Hoje a carteira é de dezenas; o caminho declarado quando crescer é promover
      uma coluna de e-mail normalizado, **não aumentar o teto**.
- [ ] **A fila lê no máximo 200 solicitações abertas** (`limit: 200` em
      `app/api/agency/leads/route.ts:26`). Como o agrupamento é em memória sobre
      essa lista, irmão que caia fora das 200 **não aparece** como repetição. Não
      morde hoje; não é para sempre.

### 🔴 O ACHADO ESTRUTURAL DE HOJE — A CAMADA DO PM **EXISTE E FUNCIONA**, e duas execuções afirmaram o contrário

Duas execuções seguidas do `pm` registraram, neste próprio arquivo, que *"não há
ferramenta de despacho nesta execução"* e declararam exceção `SEM_AGENTE` para
fazer o trabalho à mão (ver 08/08, seções do CityJobs e do IMAP). O `CLAUDE.md`
já mandava conferir isso **"uma vez, hoje"**.

**Conferido em 16/08, e a afirmação anterior está ERRADA:**

```
$ which claude                → /opt/node22/bin/claude
$ claude --agent qualidade -p "…"   → resposta do especialista, exit 0
```

**O despacho funciona pela CLI.** O que não existe é a ferramenta de despacho
*dentro da sessão*; o caminho `claude --agent <nome>` está de pé — e é
exatamente o que `docs/decisoes.md` registra ter sido usado em 08/08 para
derrubar o Caminho C do Drive com o especialista `google`. **Duas rodadas
produziram na mão declarando impossibilidade que não foi medida** — é o padrão
que o P0 do Playwright já tinha ensinado: *adivinhação sobre o ambiente custa um
turno por hipótese; medida custa um comando.*

**A segunda prova é este próprio registro.** O `qualidade` foi despachado pela
CLI para auditar os dois textos contra o código, e **voltou com as 7 afirmações
verificadas, cada uma com caminho:linha** — inclusive a de que `chaveDoProspect`
não tem leitor de produção. Ele também recusou confirmar o que não podia medir
(*"não verificável conta como reprovação, não como confirmação"*), que é o
comportamento certo do Essencial. **A camada não era cara: era não exercitada.**

- [ ] `plataforma` — **`SEM_AGENTE` deixa de ser exceção aceitável sem a medida
      junto.** Quem declarar precisa colar a saída do comando que falhou. Exceção
      é dado, não perdão, e exceção baseada em suposição contamina a régua da casa.
- [ ] `plataforma` — **o elenco em disco tem 14 fichas** (`.claude/agents/`,
      `~/.claude/agents/` vazio) e o `CLAUDE.md` fala em **26 agentes
      disponíveis**. Os dois números não batem. **A confirmar** a qual elenco o 26
      se refere — o catálogo de funções do produto passou a 81 em `2c75e9e`, que é
      outra coisa. Número de agentes em documento de bordo que ninguém contou é o
      tipo de dado que vira meta e nunca vira verdade.

---

## 🟢 08/08/2026 — A ESCOLHA DO CLIENTE NO DRIVE PARAVA DE EXISTIR EM SILÊNCIO (`808aee3`, no ar)

**Medido em produção, antes:** Drive da Foocci — **1 arquivo ao alcance do app no
Google, 0 linhas em `DriveMaterial`**. O CEO escolheu o material no seletor, o
Google concedeu o acesso, e a tela respondeu *"Sem material — a Dioli não alcança
NENHUM arquivo seu"*. Sem erro, sem aviso, sem registro.

**A causa, capturada AO VIVO em produção antes do deploy do conserto** (POST na
rota do portal com um arquivo fora do alcance):

```
HTTP 200  {"gravados":[],"recusados":[{...}],
           "proximoPasso":"Você escolheu apenas pastas. ..."}
```

Zero gravados, **HTTP 200**, e no campo que a tela pinta de **verde** — para um
PNG. Somado a isso, no navegador o callback do seletor fazia `await fetch` e
`await res.json()` **sem try/catch**: 502 do proxy (HTML), rede oscilando ou
servidor reiniciando num deploy matavam a escolha sem uma palavra na tela.

**Depois, as duas metades provadas contra produção:**

| | antes | depois |
|---|---|---|
| gravação impedida | `HTTP 200` + frase verde | `HTTP 502` + "Sua escolha NÃO foi registrada — a falha foi nossa" |
| escolha real | (perdida) | `HTTP 200`, 1 gravado, "agora diga o que é" |
| Foocci no diagnóstico | 1 no Google / 0 na casa · `escolhaPerdida: true` | 1 / 1 · `escolhaPerdida: false` |

**O que ficou aberto, e é ação de gente:** o arquivo da Foocci está dentro da
casa **pendente de triagem** — `papel` NULO, `declarados: 0`, `importados: 0`.
Ele **não entra em peça nenhuma** até alguém dizer o que ele é. O nome é
`ChatGPT Image 7_08_2026, 11_02_42.png`: não dá para saber se é logo, foto ou
rascunho, e **carimbar "logo" por conveniência poria a imagem errada numa peça
entregue**. Quem declara é o cliente, no portal — o cartão já mostra o arquivo
com o seletor de papel.

**A rede de segurança nova:** `POST /api/admin/reconciliar-drive` (CRON_SECRET).
O diagnóstico já sabia DETECTAR (`escolhaPerdida`); agora a casa CONSERTA — todo
arquivo que o Google concede e a casa não tem entra pendente de triagem.

---

## 🟢 08/08/2026 — O BRIEFING PÚBLICO PASSA A PEDIR CONTATO, E A FILA DA PORTA DA FRENTE ENTRA NO RAIO-X

**A consequência, primeiro:** três interessados entraram e a agência não tinha
como responder a nenhum. Medido em produção, em `ClientRequestDb`:

| Negócio | Parado desde | Serviços | Contato |
|---|---|---|---|
| **Sushi Cazza** | 18/06 — **51 dias** | planejamento de conteúdo, direção visual, estratégia | **nenhum** |
| **Camila Pereira** (Beauty Clinic) | 10/07 — **29 dias** | social media, quer muito vídeo | **nenhum** |
| **Beatriz Gimenes** (lash designer) | 11/07 — **28 dias** | social + tráfego + identidade | **nenhum** |

Dois defeitos empilhados. **O segundo é o grave: mesmo que alguém varresse a
fila, não havia para onde ligar.**

### 🔴 A CAUSA RAIZ ESTAVA ESCRITA COMO CONTRATO, NUM TESTE

`__tests__/briefing/identity-capture.test.ts` dizia, no cabeçalho:
*"E-mail and WhatsApp are NO LONGER collected in the conversation — they are
captured via Google sign-in after the prospect confirms their request."*

A premissa é falsa na prática: **quem não chega ao login não deixa nada, e a
maioria não chega.** O teste travava "o SDR nunca pede e-mail" — e o resultado
está medido acima. É o mesmo padrão do teste dos pedidos de API (07/08) e do
`jornada-real` (08/08): **o defeito virando invariante.** O cabeçalho foi
reescrito declarando o que mudou e o que continua valendo (a conversa do SDR
segue sem pedir contato — o pedido mora no passo de confirmação; pedir no meio
da descoberta foi o que produziu o incidente original do "só isso").

### 1. O CONTATO PASSA A SER CONDIÇÃO PARA FECHAR — e a trava é no SERVIDOR

**Onde pedir foi decisão declarada.** No FIM, com a proposta na tela: pedir na
primeira mensagem cobra antes de entregar e espanta quem só está olhando; pedir
depois de a pessoa ter contado o negócio inteiro é a hora em que o pedido é
natural — ela investiu, quer o resultado, e o contato é o que faz o resultado
chegar até ela.

- **Nome + PELO MENOS UM canal (WhatsApp _ou_ e-mail).** O WhatsApp entra na
  frente, e não é estética: é por onde o cliente brasileiro responde. O
  formulário antigo aceitava **só e-mail**, e o e-mail do login do Google é a
  caixa que a pessoa não abre.
- **A trava mora em `POST /api/brain/client-requests`, não no botão.** A rota é
  **pública** — é o submit do `/briefing` — e um POST direto passa por cima de
  qualquer `disabled`. `status` vindo do corpo é **ignorado**; quem escolhe entre
  `new` e `lead_incompleto` é o servidor.

**AS DUAS METADES, provadas em `__tests__/comercial/gate-de-contato-do-briefing.test.ts`:**

| | fecha? | vira proposta? | o que foi dito |
|---|---|---|---|
| **com canal** | sim, `status: "new"` | **sim** — `runAutoScope` roda | grava |
| **sem canal** | não | **não** — `runAutoScope` NÃO roda | **grava inteiro** |

**Sem contato NÃO é descarte.** Há saída explícita na tela ("Prefiro não deixar
contato agora"): a conversa sobe, grava como `lead_incompleto` **com o motivo**,
e aparece na fila. Sem ela, quem não quer dar contato fecha a aba e a melhor
matéria-prima que esta agência recebe desaparece sem deixar registro.

E a tela de confirmação **para de prometer o que não pode cumprir**: quem sobe
sem contato não lê mais *"entramos em contato em até 1 dia útil"*.

### 🔴 CONTATO NÃO SE DEDUZ — e a arroba do Sushi Cazza tem nome próprio

`lib/agency/comercial/contato-do-lead.ts` é o **leitor único**: lê o formato
canônico novo e o legado (`briefingJson.scope.prospect*`), e **não lê o
`rawContext`**. O `@sushicazzaoficial` que está escrito no briefing aparece como
**PISTA** (`pistasDeContato`), em campo separado, rotulado *"não é contato
confirmado"* na tela — e **nunca** faz `temComoFalar` virar `true`. Quem aborda
é o CEO.

- **Nome sozinho não é contato** — era exatamente assim que o desperdício se
  chamava.
- Piso de 10 dígitos no telefone: aceitar 8 faria `R$ 1.500` e `12 posts` — que
  aparecem em TODO briefing — virarem telefone. **Telefone inventado é pior que
  nenhum: desliga o alarme sem dar para onde ligar.**

### 2. A FILA ENTRA NO RAIO-X (`lib/raio-x/dados.ts`, item 11)

**Por que nada tocava:** o raio-x mede `pedidosDoClienteAbertos` sobre
`ContentRequest` — o pedido de quem **já é cliente**. Estas moram em
`ClientRequestDb`, a porta do **prospect**, e nenhuma varredura a olhava.

**O horizonte é 24h, e a defesa é a própria tela:** o `/briefing` promete
*"entramos em contato em até 1 dia útil"*. Alarme de 48h ou 72h toca **depois de
a promessa já estar quebrada** — registra o dano em vez de preveni-lo. E 24h é o
mesmo relógio de todos os outros baldes do arquivo; um segundo relógio na mesma
varredura é uma segunda regra para alguém esquecer.

**DOIS baldes, porque a AÇÃO é diferente** (`briefing-parado-com-contato` e
`briefing-parado-sem-contato`, ambos `alto`). O segundo é também o **termômetro
do gate**: se ele crescer depois de hoje, o briefing está vazando.

As duas metades em `__tests__/raio-x/fila-da-porta-da-frente.test.ts`: acha as
três com a mais antiga nomeada e os 51 dias na evidência · **não** dispara em
fila vazia, em lead de hoje nem em ficha que já virou projeto.

### 3. AS TRÊS DE VOLTA — `/agency/leads` ("Quem procurou", na barra lateral)

Cada cartão responde, nesta ordem: **dá para falar com ele?** (e o "não" vem
primeiro, em vermelho) · o que ele pediu, **nas palavras dele** · escopo e faixa
**pela tabela da casa** (`live-calculator` + `service-catalog`) · **preciso
confirmar**.

- **Determinístico. Zero IA.** Um modelo escrevendo "leitura do negócio"
  produziria prosa convincente sobre um cliente que ninguém conferiu — o modo de
  falhar desta casa sem revisor humano.
- **Faixa ausente NÃO é R$ 0.** Serviço que a tabela não cobre devolve faixa
  nula com o motivo escrito. Faixa sem cadência declarada é a banda inteira do
  catálogo **e diz que é**.
- **Falha de leitura tem tela própria** (`medido: false`): lista vazia por erro
  de banco é exatamente como esta fila ficou invisível por sete semanas.
- Somente leitura. **Não aborda ninguém, não envia nada, não escreve nada.**

> ⚠️ **"Solicitações", a aba que já existia, lê o STORE DO NAVEGADOR** — quem
> abrisse noutro computador via zero. É parte de por que ninguém enxergou as
> três. A tela nova lê o **banco**. Unificar as duas fica aberto, com dono.

### 🔴 4. A FICHA DUPLICADA DA CAMILA — LEVANTADA, NÃO FUNDIDA

**Não fundi**: afirmar que duas fichas são o mesmo negócio é decisão de negócio,
e a ficha certa decide para onde vai o histórico.

**O mecanismo, com linha:** **duas** rotas criam `Client` a partir da mesma
solicitação e **nenhuma confere se já existe alguém com aquele nome** —
`lib/agency/execution/create-project-from-request.ts:49` e
`app/api/brain/orchestrate/apply/route.ts:103`. As duas só olham
`req.clientId == null`. **Não há `@@unique(workspaceId, name)` no `Client`.**

> **E aqui os dois defeitos se encontram:** `lib/agency/balcao/producao.ts:98`
> **deduplica** — por **e-mail**. O caminho do briefing não tinha e-mail nenhum,
> então não tinha chave. **Sem contato não existe chave de identidade**, e é por
> isso que o gate do item 1 também fecha este buraco daqui para frente.

**Decisão do CEO:** qual das duas (`cmqyb0bpo…` / `cmrt7aecz…`) é a boa.

### Portão

`npx tsc --noEmit` limpo · **3088 testes em 191 arquivos, todos verdes** ·
`npm run build` sai 0. ⚠️ Os 9 avisos do build são **todos** de
`instrumentation.ts` → `lib/agency/design/fontes-embutidas.ts` /
`lib/agency/media/armazenamento.ts` → `app/api/media/route.ts` — **frentes de
outros agentes, nenhum arquivo meu aparece em trace nenhum.**

Conferido em **375 / 768 / 1440**, autenticado, com os estados vazio, bloqueado e
válido. Notas (0–10) a 375px: hierarquia **9** · tipografia **9** · espaçamento
**8,5** · consistência **9**. Dois defeitos achados **renderizando, não lendo**:
o rótulo do botão do Google quebrava em duas linhas a 375px (e prometia "para ver
a proposta", que deixou de ser verdade), e as linhas de escopo botavam preço e
nome do plano na mesma largura — agora empilham no celular.

### 🔴 O QUE NÃO FOI FEITO, E POR QUÊ

- [ ] **AS TRÊS CONTINUAM EM `"new"` NO BANCO DE PRODUÇÃO. Não as movi.** Daqui
      só há HTTP e a rota exige sessão de admin (medido: `401`). O dossiê das
      três é **gerado ao abrir a tela** — ele existe no minuto do deploy, sem
      migration e sem backfill. **Quem decide se aborda é o CEO.**
- [ ] **NADA foi enviado a ninguém.** Nenhuma mensagem, nenhum e-mail, nenhuma
      abordagem pelo `@sushicazzaoficial`.
- [ ] **Contato ainda NÃO TEM COLUNA** — mora dentro de `briefingJson`. Foi
      escolha declarada: `prisma/` está com outro agente nesta rodada e mexer no
      schema quebraria a frente dele. O leitor único (`lerContato`) esconde o
      formato de todo mundo, então promover a coluna depois é migration + um
      arquivo. **Enquanto não for coluna, não dá para filtrar nem indexar por
      contato no banco.** Sem dono.
- [ ] **Abandono NO MEIO da conversa continua sem registro.** O `lead_incompleto`
      pega quem chega ao passo de contato e recusa; quem fecha a aba na terceira
      mensagem não deixa nada. Capturar isso exige gravação parcial com token de
      rascunho — frente própria, sem dono.
- [ ] `esteira` — **"Solicitações" lê o store do navegador e `/agency/leads` lê o
      banco.** Duas verdades adjacentes sobre a mesma fila é o defeito nº 2 do
      incidente do Drive. Unificar.
- [x] ~~`plataforma` — **`Client` sem `@@unique(workspaceId, name)` e com duas
      rotas criando ficha sem dedup.** É o que produziu a Camila duplicada.~~
      **FECHADO em 16/08/2026 (`4cbba4b`) — mas não como estava escrito aqui.** As
      duas rotas passaram a chamar o mesmo resolvedor, e isso está resolvido. O
      `@@unique(workspaceId, name)` **NÃO foi criado, e não deve ser**: nome nunca
      vira chave de identidade — dois homônimos podem ser duas pessoas, e fundir
      por homonímia entregaria o portal de um cliente a outro. Ver a seção de
      16/08 no topo e o registro em `docs/decisoes.md`. **A ficha duplicada da
      Camila continua sem fusão** (item 4 acima segue aberto).
- [ ] **`ProposalCard` e `EmailFallbackForm` em `PublicBriefingRoom.tsx` não têm
      chamador** — código morto, achado de passagem. Não removi: apagar 150
      linhas de uma tela pública no mesmo commit da trava misturaria os riscos.

## 🟢 08/08/2026 — AS 2 PEÇAS DO CITYJOBS REFEITAS: O CLIPART VIROU REPROVAÇÃO EM CÓDIGO

**A consequência, primeiro:** o CEO reprovou as duas peças de `4c4ea1a` (prédio
retângulo, sol círculo, tipografia de sistema). Elas foram refeitas com
**fotografia real do Alto Tietê**, tipografia **embarcada de verdade** e o logo
oficial rasterizado com a letra certa — e o motivo da reprovação virou **portão
que roda**, não recomendação em documento.

**Portão:** `npx tsc --noEmit` limpo · **3088 testes em 191 arquivos, todos
verdes** (60 novos) · `npm run build` compila.

### 🔴 TRÊS DEFEITOS QUE NINGUÉM TINHA MEDIDO, E OS TRÊS ERAM SILENCIOSOS

1. **NENHUMA fonte do molde existe no contêiner que rasteriza.** `Inter`,
   `Helvetica Neue`, `Arial`, `Playfair Display`, `Poppins`, `Oswald` — o
   contêiner tem Liberation e DejaVu, e mais nada. **Toda peça desta casa saía
   na última linha da pilha**, desde sempre, e pilha de fonte não avisa quando
   cai. Conserto: `lib/agency/design/fontes-embutidas.ts` — Archivo Black e
   Archivo (OFL) viajam em base64 dentro do documento, como os bytes do logo
   real já viajavam. A regra "nenhuma fonte de rede" continua de pé.
2. **O "logo oficial" do CityJobs tem o MESMO defeito, e é pior:** ele é
   `<text font-family="Arial Black">` dentro de um SVG. Arial Black é fonte
   licenciada da Microsoft e não existe aqui — **o wordmark do cliente vinha
   saindo em Liberation Sans**, e ninguém mediu porque "o logo é oficial".
3. **`montarHtmlDaPeca` pinta o logo E o nome do cliente em texto**, lado a lado
   no rodapé. Para o CityJobs isso **viola a primeira regra do manual dele**
   ("nunca o logo junto da palavra CityJobs escrita na mesma peça"). Contornado
   na peça (`assinatura: null`); **a regra ainda não é trava no molde.**

### O MECANISMO — as duas metades, contra arquivo de verdade

**`lib/agency/design/trava-de-fundo.ts`** (puro) + **`medir-fundo.ts`** (mede
pixel). Duas perguntas independentes, porque exigir `fundo !== null` não pegaria
nada: **a peça reprovada TINHA fundo** — era um `data:image/svg+xml`.

| amostra | cores | dominante | textura |
|---|---|---|---|
| peça REPROVADA 1 | 232 | 0,528 | 0,031 |
| peça REPROVADA 2 | 224 | 0,561 | 0,025 |
| foto real 1 | 1.958 | 0,018 | 0,056 |
| foto real 2 | 1.675 | 0,018 | 0,072 |

- ⛔ **Reprova** as duas peças que o CEO reprovou — os PNGs estão guardados byte
  a byte em `docs/entregas/cityjobs-08-08/reprovadas/` e são o fixture. Afrouxar
  o piso derruba o teste.
- ✅ **Não reprova** as duas fotografias que entraram nas peças refeitas.
- 🔑 A separação é por **ordem de grandeza** (teste próprio exige 3×), não por
  calibragem fina: trava rente ao caso conhecido reprova a próxima foto de
  neblina ou parede branca, e trava que dispara onde não há risco é desligada.

⚠️ **Honestidade sobre qual critério pegou:** foram as **cores** e a **cor
dominante**. A **textura NÃO pegou** (0,031 contra piso de 0,012) — o clipart
tinha janelinhas suficientes. Contra ESTE clipart há duas defesas, não três.

### O VAZAMENTO DE MARCA — o que o CEO pegou antes do Diretor

*"Essa arte é da Dioli Digital, você está misturando os projetos. CITY JOBS."*

A régua de qualidade foi buscada na peça `Radar Dioli Tech`, que é da marca da
**própria Dioli** (serifa de display, creme, mockup de tablet sobre mármore) —
e ia ser aplicada inteira a uma plataforma de vagas do Alto Tietê. **O CityJobs
não tinha cérebro criativo registrado**, e foi nesse vácuo que o erro quase se
instalou. Esse era o achado.

- **`cerebroDoCityJobs()`** registrado com procedência do próprio cliente (o
  briefing aprovado + o manual dos logos), com `foraDaMarca` nomeando o que é da
  Dioli: serifa de display, creme, tablet/mármore/coworking.
- **A ordem de `REGISTRADOS` virou trava:** `/city\s*jobs/i` vem **antes** de
  `/dioli/i`, que é régua larga, e há teste que reprova a inversão.
- **A tipografia não vaza pela porta do molde:** `familiaDeclarada` passou a
  devolver o display da **mesma chave** do corpo. Marca declarada sans **nunca**
  recebe display serifado; marca serifada continua serifada (a trava não achata
  todo mundo).

### 🔴 O QUE NÃO FOI FEITO, E POR QUÊ

- 🔴 **A FOTO NÃO É DE IA.** O despacho mandou gastar imagem de IA e **este
  ambiente não tem chave de provedor nenhum** — medido: `OPENAI_API_KEY` e
  `GEMINI_API_KEY` ausentes, `api.openai.com` responde **401**. O caminho foi
  fotografia real do Alto Tietê, **CC0** (Wikimedia Commons), com procedência e
  licença declaradas no script. Para este cliente não é plano B disfarçado — é
  ancoragem —, mas **enquadramento sob medida a IA daria e isto não dá**.
- 🔴 **AS PEÇAS NÃO SUBIRAM PARA PRODUÇÃO.** Medido: produção viva
  (`/api/health` → commit `4335b61`), e `GET /api/agency/material-de-marca`
  responde **401**. **Não há `CRON_SECRET` neste ambiente** e não há sessão de
  admin. É o **quinto caso do mesmo padrão** já registrado abaixo: produzir é
  livre, o último metro exige credencial de gente.
- 🔴 **O TRABALHO ESTÁ EM `subida-07-08`, QUE NÃO DEPLOYA.** A branch de deploy é
  `claude/dioli-agency-os-architecture-kk7kp` (medida em `/api/health`). Commit
  em branch que não deploya é trabalho que não existe.
- ⚠️ **AS LEGENDAS FORAM REESCRITAS, e isso está declarado.** O commit reprovado
  deixou no repositório **os PNGs e nada mais** — sem legenda, sem script, sem a
  fonte do texto. "Refazer com as mesmas legendas" era, por isso, impossível de
  verificar. Os **títulos** são idênticos aos aprovados; as legendas novas moram
  em `scripts/cityjobs-pecas-de-feed.mts` e são o lastro da trava de texto.
- ⚠️ **DIREITO DE IMAGEM não é licença de foto.** CC0 resolve o **copyright**;
  não resolve a imagem de pessoa identificável em peça comercial. Os recortes
  foram escolhidos sem rosto identificável em primeiro plano, mas **isso é
  mitigação, não parecer jurídico** — e não tem dono.
- ⚠️ **`assinatura: null` é contorno, não trava.** A regra "logo OU palavra,
  nunca os dois" continua sem mecanismo dentro de `molde.ts`.
- ⚠️ **Archivo Black é SUBSTITUTA declarada de Arial Black**, que é licenciada e
  não pode ser embarcada. Trocar pela fonte do manual é decisão do CEO.
- **Nenhum especialista foi despachado como agente** (`interface`,
  `experiencia`, `qualidade`, `seguranca`): **não há ferramenta de despacho
  nesta execução.** O trabalho foi feito e auditado pelo `pm`. Não substitui a
  passada deles.

- [ ] `interface` — **a regra "logo XOR wordmark" precisa virar trava no molde**,
      não um `null` passado à mão por quem produz.
- [ ] `qualidade` — **plugar `travaDeFundoDeclarado` + `travaDeRiquezaDoFundo` em
      `produzirArtesPendentes`**. Hoje o portão roda no script destas duas peças;
      enquanto não estiver no caminho de produção, ele protege uma entrega, não
      a casa.
- [ ] **CEO** — decidir se a agência passa a **pagar imagem de IA** para fundo de
      peça (e prover a chave a quem produz) ou se fotografia CC0 com procedência
      vira o padrão declarado.
- [ ] **CEO/Diretor** — **subir estas peças ao card do CityJobs em produção.**
      Depende de sessão de admin, que nenhum agente tem.


## 🟢 08/08/2026 — A ESCADA SOLTA SOZINHA: A DECISÃO DO DONO VIROU MECANISMO

**A consequência, primeiro:** `social-media` e `design` sobem para `allowlist`
com **todos os clientes com projeto** no momento em que o deploy subir — sem
ninguém logar em produção. Era esse degrau que segurava as peças do CityJobs em
`interno`.

**Mecanismo:** `lib/agency/escada/decisoes-do-dono.ts`, aplicado pelo relógio
(`despertador.ts`, primeira perna da rodada) e disponível na rota
(`POST /api/agency/escada`, `acao: "aplicar_decisoes_do_dono"`) só para não
esperar os 5 minutos. Registro completo em `docs/decisoes.md`.

### 🔴 O ELO QUE QUASE FALTOU: SOLTAR A ESCADA NÃO SOLTA O QUE JÁ FOI RETIDO

`escadaFiltraEntregas` roda em **um instante só** — o ato de apresentar. E
`apresentar`/`apresentarCiclo` recusam repetição (`if (presentedAt) return`),
o que está certo: apresentar duas vezes avisa o cliente duas vezes.

**A consequência não estava:** a entrega retida por um degrau fechado fica
`interno` **para sempre**. Abrir o degrau depois não a alcança. Sem conserto,
esta frente inteira teria trocado um valor no banco e **não feito uma única peça
chegar ao cliente** — decoração com cara de entrega.

**Conserto:** `lib/agency/escada/repescagem.ts`, segunda perna do relógio. Ela
**não** reapresenta, **não** avisa o cliente, **não** publica, **não** contorna
a Qualidade (`quality_flag` fica fora da própria consulta), **não** antecipa
ciclo não apresentado e **não** reimplementa a regra — quem decide continua
sendo `escadaFiltraEntregas`.

**Portão:** `npx tsc --noEmit` limpo · **3042 testes em 187 arquivos, todos
verdes** (45 novos) · `npm run build` sai **0** (os 3 avisos de
`instrumentation.ts` → `armazenamento.ts` são anteriores a este trabalho).

### 🔴 O PADRÃO DAS QUATRO RODADAS QUE NÃO ENTREGARAM PEÇA — em uma frase

**Nenhuma rodada de agente consegue atravessar o último metro sozinha: produzir
é livre, mas fazer a peça CHEGAR ao cliente sempre exigiu uma credencial que só
um humano tem** (sessão de admin, `CRON_SECRET`, ou um clique). Os quatro
"motivos diferentes" — sem acesso à produção, sem sessão de admin, navegador
ausente, escada prendendo — **são o mesmo motivo com quatro roupas.**

**O conserto começou aqui e é generalizável:** o que a agência precisa fazer
sozinha não pode morar atrás de uma rota autenticada; tem que morar no
**relógio**, declarado em código e aplicado no deploy. A escada foi a primeira a
mudar de lado.

- [ ] `plataforma` — 🔴 **o mesmo tratamento para PRODUZIR peça.** Hoje produzir
      exige sessão de admin; o `despertador` já produz arte pendente, mas não há
      caminho para "produza as peças de hoje deste cliente" sem gente logada.
- [ ] `plataforma` — 🔴 **a branch de deploy é
      `claude/dioli-agency-os-architecture-kk7kp`** (medido em `/api/health`), e
      trabalho vem sendo commitado em `subida-07-08`. **Commit em branch que não
      deploya é trabalho que não existe** — é a causa das "três frentes
      commitadas e sem deploy".

### 🔴 O QUE NÃO FOI SOLTO — e é decisão do CEO/Diretor

| Departamento | Por que ficou de fora |
|---|---|
| `paid-traffic` | **ESCREVE em Meta/Google.** Depende do parecer do especialista da plataforma (trava de 03/08) |
| `prospeccao` | sai em nome da agência para **terceiros** — não é peça de cliente |
| `analytics` · `strategy` · `financeiro` | relatório, plano e proposta **não são "peça"**; a fala do CEO não os cobre com todas as letras |

⚠️ **Publicação automática continua BLOQUEADA, e isso é deliberado.** "Soltar a
agência para produzir" não é "publicar sem parecer". A peça vai até o **card de
aprovação**; o clique é do CEO.

⚠️ **`cliente ativo` não existe no banco** (sem coluna `status` em `Client`). O
escopo se chama `clientes_com_projeto` porque é o que o banco sabe dizer.

### 🔴 AS 2 PEÇAS DO CITYJOBS: ONDE ELAS ESTÃO DE VERDADE

**Produzidas** (`4c4ea1a`, por outro agente): PNG 1080×1350 com o logo oficial
de `public/brand/cityjobs/`, molde de verdade, três portões rodados — em
`docs/entregas/cityjobs-08-08/`.

**NÃO estão no card de aprovação do cliente.** Arquivo no repositório não é
entrega: o portal lê o banco de **produção**, e as peças que moram lá são as do
calendário (recompostas em `98cd038`), que sobem de `interno` para visível
**quando este deploy entrar**. Enquanto o deploy não sobe, o CEO não vê nada.

## 🟢 08/08/2026 — O MATERIAL ENVIADO PELO PORTAL CHEGA NA PEÇA (a ponte ganhou o meio)

**A consequência, primeiro:** o cliente (ou o CEO) arrasta o logo no portal e ele
**entra na peça** — sem Google, sem Drive, sem conta em lugar nenhum.

**O defeito, medido nos dois lados:** o portal tinha a tela de arrastar e soltar
desde **02/08** (`components/portal/EnvioDeMaterial.tsx` → `POST /api/media`), e
ela funcionava: guardava o `MediaAsset`, fechava o `MaterialRequest`, destravava
a esteira e avisava a equipe. E **o arquivo nunca chegava na peça**:
`materiaisDeMarca()` — a ÚNICA porta de material para dentro de uma arte
(consumidores: `execution/artes.ts` e `execution/logo.ts`) — lia só material de
origem Drive, e a linha nascia num único lugar do repositório inteiro:
`app/api/portal/drive/route.ts`, o caminho do Picker do Google.

> **Os bytes atravessavam; a declaração de PAPEL, não.** A peça saía com o nome
> do cliente escrito em fonte comum, com o arquivo real já gravado no volume.
> **Terceiro caso do mesmo padrão no dia:** a ponte existe dos dois lados e falta
> o meio.
>
> 🔴 **E o corolário que reordena a fila:** o dia inteiro foi gasto tratando o
> Drive como o caminho do material — escopo, conta de serviço, verificação do
> Google. **Havia uma porta pronta e desligada o tempo todo.**

### O conserto: uma ORIGEM no material (migration `20260808150000_origem_do_material`)

- **`drive`** — exige conexão viva com o Google, exatamente como antes;
- **`envio_direto`** — portal ou admin; **não depende do Google para nada**,
  porque a casa já tem os bytes pelo ato do próprio dono.

**É COLUNA, não prefixo dentro de `connectionId`.** `connectionId` passou a ser
**nulo** nessa origem — é o ponto inteiro da mudança, e uma coluna `NOT NULL`
forçaria a inventar uma conexão que não existe. Ganhou
`@@unique([clientId, mediaAssetId])`, porque a chave antiga
(`connectionId`, `fileId`) **não protege** essa origem: `connectionId` é NULO
nela, e NULL não colide com NULL em índice único — sem ela, reenviar o mesmo logo
duplicaria o material da peça.

⚠️ **O nome do modelo continua `DriveMaterial` e isso é dívida declarada** (no
schema): ele guarda hoje o que não vem do Drive. Renomear é reconstrução de
tabela em SQLite sobre volume; ficou de fora de propósito.

### O papel é pedido NA HORA DO ENVIO — nas duas portas

- **Portal:** escolher arquivo **não envia**. Cada arquivo entra numa fila com um
  seletor de papel; o palpite pelo nome (`sugerirPapel`) vem preenchido e **nunca
  autoriza sozinho**. `IMG_2831.jpg` vem VAZIO de propósito.
- **Admin:** `MaterialDeMarca` na ficha do cliente — o operador vê **o que a peça
  enxerga de verdade** (a mesma função que `artes.ts` chama, não uma segunda
  leitura que diverge), o alarme **"Sem logo"**, e sobe material pelo cliente.
- **Uma implementação, não duas:** as duas telas passam pelo MESMO
  `POST /api/media` com `papel`. Duas cópias da regra divergem — é o defeito nº 2
  do incidente do Drive.
- **Sem papel, o arquivo é guardado e o pedido fecha, mas não entra em peça
  nenhuma.** A esteira escala pedindo; não engole em silêncio.

### As três metades, provadas

- ✅ **Com papel declarado, o logo entra na peça** — provado com **bytes**, contra
  a build de produção: upload real por HTTP → `logoDoCliente()` devolve o
  arquivo → os bytes lidos do volume são **idênticos** aos enviados.
- ⛔ **Sem papel: NADA é gravado** e nenhum material fantasma aparece. O
  `MediaAsset` **não se perde**.
- 🔑 **A que quase ninguém testa:** material `envio_direto` vale com o Google
  **desconectado, revogado e expirado**. E no MESMO banco, na MESMA hora,
  material de origem `drive` **continua recusado** pela conexão revogada — a
  trava do Google não foi afrouxada de carona.

**Um defeito achado pela ordem, não pela leitura:** a guarda "só material do
Google se baixa do Google" posta ANTES da trava respondia `sem_conexao` para
arquivo sem papel e para pasta, **apagando os motivos próprios que a tela do
cliente mostra**. Ela desceu para depois da trava, com o motivo escrito no
código.

**Portão:** `npx tsc --noEmit` limpo · **2967 testes em 182 arquivos, todos
verdes** · `npm run build` compila. Conferido em 375/768/1440 com o estado que
importa (a fila pedindo o papel). Avisos do build: os **pré-existentes** de
`instrumentation.ts` → `armazenamento.ts` → `next.config.ts`.

### 🔴 OS ÓRFÃOS — o número de PRODUÇÃO **não foi medido**, e não vou fingir que foi

Os arquivos que o portal recebeu desde 02/08 e que a peça nunca viu continuam
lá. **Quantos são em produção: NÃO SEI.** Não há `CRON_SECRET` neste ambiente
(medido: `POST /api/cron/raio-x` em produção respondeu **401**) e o banco mora
num volume que ninguém alcança de fora. **Estimar seria inventar.**

**O mecanismo para medir existe e está no ar** —
`GET /api/agency/material-de-marca?censo=1`, que devolve o total, o recorte por
cliente, os **sem dono** e a **lista arquivo por arquivo** com o palpite de papel
marcado como palpite. Duas portas: sessão da agência, ou
`Authorization: Bearer <CRON_SECRET>` (**segredo ausente → não abre**). É
**somente leitura** — não migra, não carimba, não apaga, e há teste que reprova
quem lhe der um verbo de escrita.

- [ ] **CEO/Diretor** — rodar o censo em produção e decidir. **Nada foi migrado.**

**A proposta de recuperação, e ela NÃO é automática:**

1. **Papel não se adivinha.** O palpite pelo nome acerta `logo-*.png` e erra em
   silêncio num `IMG_2831.jpg` — e peça com a foto errada é pior que peça sem
   foto, porque parece que alguém olhou e escolheu aquilo.
2. **O caminho barato:** a tela da ficha do cliente já **lista os órfãos** com o
   palpite ao lado. O operador confirma um a um pelo mesmo `POST /api/media`.
3. **Arquivo sem `clientId` não é recuperável** sem alguém dizer de quem é.
4. **Migração em massa por palpite: NÃO recomendo**, nem para os que têm palpite.

### 🔴 O QUE FICOU DE FORA

- **Nenhum especialista foi despachado como agente** (`esteira`, `plataforma`,
  `interface`, `experiencia`, `qualidade`, `seguranca`): **não há ferramenta de
  despacho nesta execução.** O trabalho foi feito e auditado pelo `pm` contra as
  cartas. **Não substitui a passada deles** — em especial `experiencia` (a fila
  de papéis é hipótese não observada com cliente real) e `seguranca`.
- **O Drive continua sendo o único caminho para material que o cliente NÃO quer
  subir à mão** e continua com os furos de 08/08 (escolha perdida na Foocci).
  Esta frente **não conserta** aquilo — ela tira o Drive do caminho crítico.
- **Nenhuma peça foi produzida com o logo novo, e isso ainda não foi provado
  ponta a ponta.** A prova aqui vai até `logoDoCliente()` devolver os bytes
  certos — o elo seguinte (`artes.ts` desenhar o arquivo na peça) já tinha
  chamador e teste desde 07/08, mas **não foi exercitado com material de origem
  `envio_direto` numa peça real**. O molde voltou a funcionar nesta mesma data
  (P0 do Chromium fechado por outra frente), então **agora dá para fechar essa
  volta**: subir um logo pelo portal de um cliente e mandar produzir.
- **A ficha do cliente 404 de forma intermitente** (o store hidrata depois do
  primeiro render e o `notFound()` dispara antes). **É anterior a este
  trabalho** e atrapalhou a captura em 768/1440 — a seção foi conferida em
  375px. Sem dono.
- **`GET /api/agency/material-de-marca?clientId=…` lista até 500 arquivos sem
  paginação.** Suficiente hoje; não é para sempre.

## 🟢 08/08/2026 — 99FREELAS: A CASA PASSOU A LER O GMAIL DA AGÊNCIA SOZINHA (IMAP)

**O CEO recusou o caminho do Make** — *"muita função ir pelo Make, por que você
não acessa o Gmail da agência?"*. Intermediário pago para reencaminhar o próprio
e-mail é volta desnecessária. Agora a casa lê a caixa direto.

**A terceira porta do Radar**, e ela é ADIÇÃO, não troca: `POST
/api/agency/oportunidades/email` (o encaminhamento, com `RADAR_EMAIL_SECRET`
confirmado em produção) **continua valendo**. Colar, encaminhar e ler a caixa —
as três caem na MESMA função.

### O que ficou de pé

- `lib/agency/comercial/caixa-de-entrada/` — cofre, leitor IMAP, parser de MIME
  e a varredura. Entra no relógio existente (`despertador.ts`, a cada 5 min) e
  tem porta própria em `POST /api/cron/caixa-de-entrada` (`CRON_SECRET`).
- **Tela em `/agency/oportunidades`**: colar a senha, testar a conexão, ver o
  que a rotina já leu, e apagar a credencial.
- **`npx tsc --noEmit` limpo · 2907 testes em 177 arquivos, todos verdes ·
  `npm run build` limpo.** Os 7 avisos do build são **anteriores** a este
  trabalho (`instrumentation.ts` → `armazenamento.ts` → `next.config.ts`);
  nenhum vem daqui nem do `imapflow`.

### A regra que mandou no desenho: NÃO EXISTE UM SEGUNDO CAMINHO DE QUALIFICAÇÃO

A mensagem lida por IMAP passa por `registrarOportunidade` e `qualificarEGravar`
— **as mesmas duas funções da porta de colar**. Nota, serviço, piso de preço e
Compliance Validator. Copiar o bloco resolveria hoje e criaria a divergência de
amanhã; é o defeito que deixou a porta do e-mail meses ingerindo sem qualificar,
com as oportunidades nascendo no rodapé da fila. Há teste que reprova a varredura
que importar `@/lib/ai/generate` ou chamar `prisma.oportunidade.create`.

### Idempotência em DUAS camadas, e a ORDEM é o mecanismo

1. `EmailDoRadar.@@unique([workspaceId, mensagemId])` — o `Message-ID`;
2. `Oportunidade.@@unique([workspaceId, impressaoDigital])` + dedup por link.

**Grava-se a oportunidade PRIMEIRO e o registro da mensagem DEPOIS.** Um processo
que morra entre as duas relê a mensagem e é barrado pela camada 2 — nunca
duplica. A ordem inversa perderia a oportunidade em silêncio, que é o erro mais
caro dos dois. Travado por teste que compara a ordem de invocação.

> ⚠️ **A especificação pedia `UNIQUE(platform, external_project_id)` e esta casa
> não tem essa coluna.** O equivalente que já existia e continua valendo é
> `impressaoDigital` + `urlExterna`. Não inventei coluna nova para casar com o
> nome; declarei a diferença.

### 🔴 O ACHADO DE SEGURANÇA QUE MAIS IMPORTA — e ele não era óbvio

**O `SEARCH FROM` do IMAP compara por substring o cabeçalho `From:` INTEIRO,
nome de exibição incluso.** Um e-mail assinado `"Alertas @99freelas.com.br"
<atacante@dominio-qualquer.com>` **passa pela busca do servidor**. Sem
conferência do lado de cá, a porta de entrada de oportunidade da agência
aceitaria texto de qualquer remetente do mundo — e esse texto vira `textoBruto`,
vira prompt de qualificação e vira proposta.

`remetenteConfere()` compara contra o **endereço parseado do envelope**, e só.
Teste com as duas metades: barra o forjado, e não barra domínio, subdomínio nem
endereço exato legítimos.

### As outras travas, todas com as duas metades

- **Sem credencial = porta FECHADA.** Não conecta, não grava, e **diz por quê**
  na tela. Teste prova que nem o socket é aberto.
- **`logger: false` no `imapflow`** — o logger padrão imprime o diálogo IMAP, e
  o comando `LOGIN` carrega a senha em texto puro no console do Railway. Teste
  reprova o arquivo sem ele.
- **O host é CONSTANTE** (`imap.gmail.com:993`, fixo no cofre). Host vindo de
  formulário viraria um jeito de mandar a senha da agência para a máquina de
  quem pedir.
- **A senha da CONTA é recusada** — não tem a forma de senha de app (16 letras).
  E os espaços do `abcd efgh ijkl mnop` caem, porque é assim que o Google a
  exibe e recusar a senha certa por causa de espaço seria a pior falha da tela.
- **A dica NÃO é `keyHint`.** `keyHint` mostraria 7 de 16 caracteres de um
  alfabeto de 26 — 44% do segredo numa tela que vaza por screenshot. Virou
  máscara.
- **Teto no botão "Testar conexão"** (6 por 5 min). Não é contra atacante (a
  rota exige `master`): é contra o **Google**, porque cada clique é uma tentativa
  de login e uma sequência de falhas bloqueia a caixa da agência.
- **Falha de leitura nunca vira zero.** A contagem de volume devolve `null` com
  motivo — "não consegui contar" e "não há alerta nenhum" são fatos opostos, e o
  segundo mataria o canal por engano.

### A caixa NÃO é tocada

Lê. Só. **Não apaga, não move, não arquiva, não responde e não envia.** Teste
reprova `messageDelete`, `messageMove`, `messageCopy`, `\Deleted` e `append(`
nos arquivos da frente. A única marca possível é `\Seen`, **desligada por
padrão** — o alerta original é a prova de que a oportunidade existiu.

### A precedência: AMBIENTE → COFRE (a senha) · PAINEL → AMBIENTE (os ajustes)

`RADAR_GMAIL_USER` e `RADAR_GMAIL_APP_PASSWORD` **já estão no Railway** e vencem
o cofre — mesma ordem de `resolverWebhookVerifyToken`. Os AJUSTES (remetentes,
marcar como lida) seguem a ordem inversa: o painel manda, porque o remetente
exato ainda não foi confirmado e quem descobrir tem que corrigir sem redeploy.

⚠️ **Apagar a credencial na tela NÃO fecha a porta enquanto a variável existir no
Railway**, e a resposta do DELETE diz isso na cara de quem clicou.

### 🔴 O QUE NÃO FOI PROVADO, E POR QUÊ

1. **NINGUÉM CONECTOU NO GMAIL AINDA.** A porta 993 **não sai deste ambiente**
   (medido: o socket TLS fica pendurado até o timeout; a saída só passa por
   HTTPS via proxy). O protocolo é exercitado contra caixa mockada. **A prova de
   conexão é o botão "Testar conexão" em produção**, e é o primeiro gesto depois
   do deploy.
2. **O REMETENTE DO 99FREELAS NÃO ESTÁ CONFIRMADO.** O padrão é o domínio
   `@99freelas.com.br` — o que dá para afirmar. Endereço inventado teria cara de
   fato e faria a rotina ler zero para sempre, em silêncio. Configurável na tela.
3. **QUANTOS ALERTAS JÁ EXISTEM NA CAIXA: ainda não medido.** É a primeira
   medida real de volume desta plataforma e decide se o canal vale.
   `POST /api/agency/oportunidades/caixa/testar?contar=1` devolve o número —
   **em produção, depois do deploy.**
4. **A senha de app não tem prazo de validade nem data de rotação.** Senha de
   app do Google não expira sozinha. Sem dono para a rotação.
5. **A qualificação roda EM LINHA na varredura**, como na porta do
   encaminhamento. Fila assíncrona continua sendo frente própria, sem dono.
6. **Uma dependência nova: `imapflow`** (21 pacotes transitivos, `pino` incluso).
   Escolha declarada: o protocolo IMAP não pode ser exercitado neste ambiente, e
   um cliente escrito à mão só poderia ser testado contra o meu próprio mock —
   a "peça verde, junta rompida" que esta casa já pagou duas vezes. O parsing de
   **MIME**, que é função pura e testável, ficou nosso (`mime.ts`).
7. **`seguranca` NÃO foi despachado como agente** — não havia ferramenta de
   despacho nesta execução. A revisão foi feita pelo `pm` contra a carta do
   Essencial, e **produziu dois consertos** (a dica de senha e o teto do botão).
   **Não substitui a passada dele**: fica aberto, com dono.

**Defeito achado pelo teste, não pela leitura:** `boundary="LIMITE"` lido de um
`Content-Type` já minusculado vira `--limite`, não casa com linha nenhuma, e a
mensagem inteira volta **vazia, em silêncio**. O nome do tipo é insensível a
caixa; o valor do `boundary` **não é**.


## 🟢 08/08/2026 — O P0 DO MOLDE ESTÁ FECHADO. O NAVEGADOR ESTAVA LÁ O TEMPO TODO; QUEM CHEGAVA QUEBRADO ERA O PLAYWRIGHT

**A consequência, primeiro: a agência voltou a produzir peça, e as 6 peças que
tinham nascido como foto crua ganharam a marca do cliente — sem pagar a foto de
novo.**

```
GET /api/capacidades  →  faltando: 0
                         montar-molde · pronta: true
                         onde_achei_o_navegador: /usr/bin/chromium
```

### 🔴 A HIPÓTESE REGISTRADA ABAIXO ESTAVA ERRADA — e é por isso que ela ficou

O registro de mais cedo dizia *"não há Chromium no container"* e apostava no
pacote `chromium` do Ubuntu ser stub de snap. **Medido de dentro da produção
pela rota nova `/api/admin/diagnostico-do-navegador`, o contêiner respondeu o
contrário:**

| O que se mediu | O que se achou |
|---|---|
| `/usr/bin/chromium` | **EXISTE** (5.066 bytes, o wrapper do Debian) |
| `/usr/lib/chromium/` | **20 arquivos** — binário, `.pak`, ICU, tudo |
| `import("playwright")` | **`Cannot find module …/playwright-core/browsers.json`** |

O `apt` de `railpack.json` **sempre funcionou** — igual ao `ffmpeg`, e era isso
que a pista do `ffmpeg` já dizia. O que não chegava era a **biblioteca**: o
rastreador de arquivos do `output: "standalone"` só copia o que consegue seguir
por `import`/`require`, e `browsers.json` é aberto do disco em tempo de
execução. Nenhum grafo de import leva até ele, então o pacote viajou para o
contêiner sem o arquivo que abre na primeira linha.

E como `renderizadorDisponivel()` e `renderizarHtml()` **importam o playwright
ANTES de procurar o executável**, os dois desistiam sem nunca olhar o Chromium
que estava a um caminho de distância. Trocar o pacote do apt, mexer em
`PLAYWRIGHT_BROWSERS_PATH` ou baixar um segundo Chromium no build — os três
caminhos sugeridos aqui — **não teriam consertado uma linha disto.**

> **A lição não é sobre o playwright.** Três agentes, em dias diferentes,
> refinaram uma hipótese sobre um contêiner que ninguém tinha aberto. O que
> fechou o P0 em uma tarde não foi um palpite melhor: foi **uma rota de leitura
> de 5 minutos que mede o disco**. Adivinhação sobre build custa um deploy por
> hipótese; medida custa um.

### O conserto, e a prova (não "deve funcionar")

**`next.config.ts → outputFileTracingIncludes`.** Nenhum pacote apt trocado,
nenhum navegador baixado no build, nenhuma variável de ambiente nova.

- **Provado LOCALMENTE antes do push** — um build quebrado pararia três agentes:
  `.next/standalone/node_modules/playwright-core/browsers.json` passou a existir,
  e `import("playwright")` de dentro de `.next/standalone` resolve.
- **Provado NO AR, e não pelo caminho fácil.** `pronta: true` só mede que o
  CAMINHO existe — e `/usr/bin/chromium` é um script que faz `exec` no binário
  de verdade. Isso importa em DINHEIRO: `produzirArtesPendentes` consulta
  `renderizadorDisponivel()` e, se ela disser que sim, manda gerar a foto de IA
  de cada peça (que custa, por peça) para só então tentar aplicar o molde. **Um
  `pronta: true` que mente vira fatura sem entregável.** Por isso o diagnóstico
  ganhou `?lancar=1`, que sobe o Chromium pelo MESMO `renderizarHtml` da esteira:

  ```
  provaDeVida: { ok: true, bytes: 5719, conferidos: 1, ms: 570 }
  ```
- **O alarme parou sozinho.** No `/api/pulso`, a última falha da perna `arte`
  por "não há Chromium" é de **15:29**; o conserto entrou às **15:41**. Nenhuma
  desde então.

### As 6 peças do CityJobs: de foto crua a entregável, custo ZERO

As 6 estavam **invisíveis para o conserto automático**: nasceram com `mediaUrl`
preenchido (a foto crua), e `produzirArtesPendentes` só olha `mediaUrl: null`.
**Elas nunca voltariam à fila do despertador** — ficariam no banco para sempre
com aparência de entregue e conteúdo de rascunho.

`recomporPecasSemMolde` lê a foto **já paga** (`fundo-<postId>.png`, guardada
desde o dia em que foi comprada, exatamente para isto) e aplica o molde.
Rasterização local. **Regerar custaria a fatura inteira de novo E trocaria a
foto que o calendário já tinha — não é conserto, é outra peça.**

```
POST /api/admin/recompor-pecas
→ recompostas: 6 · semFundo: 0 · bloqueadas: 0 · falhas: 0
```

**Conferido com os olhos, não pelo `ok:true`:** as duas peças de HOJE
(12:00 "Leve documento com foto no dia da entrevista" e 21:00 "Trabalhar perto
de casa é ganhar tempo de volta") saem 1080×1350 com título, o verde da marca,
o degradê e a assinatura **CJ · CityJobs**.

- **Nenhuma trava afrouxada:** pilar bloqueado continua bloqueado, o título
  continua tendo de ser trecho literal da legenda já auditada, sem navegador a
  passada para antes de tocar em qualquer peça, e **nada foi publicado**.
- **A metade que faltava:** bytes idênticos **não** contam como recomposta.
  `comporComMolde` devolve `ok: true` com a foto crua quando o texto não coube —
  contar isso como conserto deixaria a peça sem marca **e** sem o aviso de que
  continua sem marca.
- **Passada à mão, nunca no despertador.** Rotina que reescreve arte já entregue
  ao cliente a cada 5 minutos é uma máquina apontada para o trabalho pronto. Há
  teste que reprova quem a plugar lá.

### 🟠 O SELO NÃO SAI EM NENHUMA PEÇA DO CITYJOBS — achado ao recompor

As 6 saíram com `[molde] texto barrado pela trava — selo: rótulo com N palavras
(máximo 3)`. Os pilares do CityJobs foram escritos como **frases**
(*"Alto Tietê · Dica para candidato"*, *"Alto Tietê · Bastidor da região"*), e a
trava do selo exige rótulo de até 3 palavras / 28 caracteres.

**A peça sai completa e correta; o que falta é a etiqueta do pilar.** Não é
falha do molde: é o formato do dado. **Sem dono** — encurtar nome de pilar é
decisão de conteúdo, e escolher por inferência é o que a lei da casa proíbe.

### O que continua fora, e por quê

- **Dioli Digital Studio, Camila Pereira (×2): ZERO peças hoje, e é correto.**
  Não há calendário para produzir. O que criaria trabalho novo são os **3
  pedidos em `precisa_decisao`**, que esperam uma frase do CEO — e a Camila tem
  **duas fichas de cliente**, cuja fusão é afirmação de negócio.
- **Foocci: 1 peça hoje (10:00), já pronta e com marca.** Ela não vai ao ar pela
  **trava de publicação orgânica**, que só o CEO levanta. **Não reagendei nada.**

---

<details>
<summary>O registro ANTERIOR desta frente, mantido inteiro porque a hipótese
dele estava errada e apagá-la esconderia como se erra assim (clique)</summary>

## ✅ 08/08/2026 — O P0 DO MOLDE: MEDIÇÃO CERTA, HIPÓTESE ERRADA, PROBLEMA RESOLVIDO

> **CORRIGIDO ÀS 15h.** Este bloco descrevia um P0 aberto. **Ele fechou na
> mesma sessão, por outro agente** (`729da03`, `fa5729b`, `98cd038`), e o texto
> abaixo foi reescrito porque **registro falso é pior do que registro nenhum** —
> quem lesse a versão anterior concluiria que a agência não consegue produzir,
> e isso deixou de ser verdade.

**O que eu medi, e continua verdadeiro:** às 14h47, `GET /api/capacidades` em
produção respondeu `montar-molde → pronta:false · onde_achei_o_navegador: null`.
A casa **de fato** não conseguia aplicar o molde, e as 6 peças do CityJobs no
banco eram foto crua de IA.

**O que eu deduzi, e estava ERRADO:** escrevi que "não há Chromium no
container", com a hipótese de o pacote apt do Ubuntu ser stub de snap. **O
navegador estava lá o tempo todo** — `/usr/bin/chromium`. Quem chegava quebrado
era o **playwright**.

> **A lição, e ela é a da casa inteira:** a medição (`pronta:false`) era um fato
> sobre a CAPACIDADE; eu a converti numa afirmação sobre a CAUSA sem ter olhado
> o container. É o defeito nº 1 do incidente do Drive numa terceira roupa —
> "não consegui usar" virando "não existe". `renderizadorDisponivel()` também
> confundia os dois: `existsSync` responde *"o arquivo existe"*, não *"o
> navegador funciona"*. A prova de vida de `fa5729b` é o conserto disso.

**Estado agora, remedido:** `montar-molde → pronta:true · /usr/bin/chromium`. As
6 peças do CityJobs foram **re-renderizadas sem pagar imagem de novo**
(`98cd038`) e hoje têm a camada de marca. O que sobra nelas é degradação
**declarada e de conteúdo**, não de infra:

- `[molde] texto barrado pela trava — selo: rótulo com 32 caracteres (máximo 28)`
  — a trava do selo recusou frase onde cabe rótulo. **Está certa**: frase vira
  pixel só com lastro auditado.
- `[sem logo] assinada com o monograma das iniciais` — **o CityJobs nunca mandou
  o arquivo do logo.** Não é falha da máquina; é material que falta.

### O que NÃO fechou junto, e continua aberto

- [ ] `departamentos` — **o selo das peças do CityJobs precisa caber em 3
      palavras / 28 caracteres.** Hoje o gerador escreve o nome inteiro do pilar
      ("Alto Tietê · Dica para candidato") no campo de rótulo, e a trava recusa
      — peça após peça, em silêncio, dentro do `lastError`.
- [ ] **CEO** — **pedir o arquivo do logo do CityJobs.** Enquanto não vier, toda
      peça sai assinada com monograma derivado, não com a marca do cliente.
- [ ] `esteira` — as 2 peças de hoje do CityJobs existem, com molde, e estão
      `interno`: `social-media` está em **`allowlist`** e o CityJobs não está na
      lista. **Subir degrau é decisão de negócio com evidência**, não minha.

## 🟢 08/08/2026 — O CARD DO PACOTE PARA DE PEDIR ASSINATURA EM BRANCO (`1184b90`, no ar)

**O CEO abriu o portal do CityJobs e mandou print:** o card do topo dizia *"O
pacote inteiro está pronto para você — terminamos e organizamos tudo"*, com o
botão **"Aprovar tudo"**. Três dedos abaixo, as **3 entregas** (Analytics, Social
Media, Estratégia) diziam *"material ainda não subiu"*, em "Em produção na
Dioli". As duas não podem ser verdade — e clicar aprovaria **nada**.

É o **mesmo defeito consertado em 07/08 no card individual, um nível acima**.
Passou porque a trava de 07/08 nasceu na leitura do card (`semConteudo`) e o card
do **pacote** não a consultava: ele saía de `presentedAt` sozinho — um carimbo
que só diz *"o PM apresentou"*, nunca *"há o que ver"*.

**A regra, em três portas, e nenhuma é redundante:**

- **`lerFase`** — apresentado com ZERO entregas decidíveis não anuncia pacote
  pronto, a bola volta para a agência e **o botão some junto** (as duas telas
  derivam o botão da etapa).
- **`aprovarPacote`** — **TRAVA, não aviso.** `POST /api/portal/esteira` é
  pública por token: esconder o botão não impede um link antigo. A recusa vem
  **antes da primeira escrita** — daqui para baixo a função abre o ciclo e chama
  `aprovarCalendario`, o **único consentimento de publicação desta casa**. E no
  pacote **misto**, o `updateMany` passou a casar por id da lista de prontas:
  `status: "pending"` sozinho carimbava a entrega que o cliente nunca viu.
- **A tela** — **lista o que está dentro**, item por item, e nomeia o que fica
  de fora.

**O texto honesto de baixo não foi tocado** — era o topo que mentia.

**Verificado EM PRODUÇÃO, no projeto do print:**

```
etapa   = "Ainda estamos produzindo"
pacote  = { pedeAprovacao: false, prontas: [],
            emProducao: ["Analytics", "Social Media", "Estratégia"] }
POST aprovar_pacote → { ok: false, "não há nenhuma entrega com material
                        para aprovar — o pacote está em produção." }
```

E **não dispara onde não há risco**: Foocci e Dioli Digital Studio ficaram
inalterados (`emProducao: []`).

**UMA implementação da regra "este card tem corpo", não duas.** A consulta, o
agrupamento dos genéricos, as peças estruturadas e o casamento
entrega→departamento saíram de `portal-data` para `lib/agency/esteira/pacote.ts`
e ganharam um **segundo chamador**. Nada foi reescrito. Duas fontes de verdade
adjacentes é o defeito nº 2 do incidente do Drive — e esse mesmo casamento já
quebrou este portal em 07/08, divergindo em 11 dos 14 casos.

**ZERO e "NÃO SEI" não dividem o mesmo pixel** (`RetratoDoPacote.medido`): a
LEITURA trata não-medido como não-medido e mantém a etapa antiga; a ESCRITA
trata não-medido como **recusa**.

> 🟠 **DUAS ASSERÇÕES MUDARAM DE LADO, declaradas no próprio arquivo.**
> `jornada-real` afirmava `fase === "aprovacao_cliente"` no passo 7 — quando o
> passo 6, logo acima, já **provava com banco real** que `deptsComCorpo` é
> VAZIO. A jornada dizia *"a bola passou para o cliente"* sobre um pacote sem
> uma linha para ler: **o defeito escrito como contrato, pela segunda vez no
> mesmo teste.** Agora prova os dois mundos — escada em sombra (não cobra, e o
> servidor recusa o aval) e departamento que subiu de degrau (aí sim a bola
> passa). `marcos.test` ganhou as três metades que faltavam.

**Portão:** `npx tsc --noEmit` limpo · **2868 testes em 176 arquivos, todos
verdes** · `npm run build` limpo.

## 🟢 08/08/2026 — A PERGUNTA QUE NUNCA CHEGOU AO CLIENTE CHEGOU (medido antes/depois)

O despertador de `27be1af` entrou em produção nesta rodada e **cobrou sozinho** o
pedido de material preso desde 01/08. Medido no `/api/cron/raio-x`, antes e
depois do deploy: `materiaisNaoPerguntados: 1 → 0`. **Nenhuma intervenção manual
— foi o mecanismo.**

## 🔴 08/08/2026 — A FILA DE ENTRADA NUNCA FOI VARRIDA. É O DEFEITO QUE CRIOU O CARGO DE PM

`GET /api/brain/client-requests` em produção mostra **3 solicitações em `"new"`**,
e nenhuma delas é de hoje:

| Solicitação | Desde | Parada há |
|---|---|---|
| **Sushi Cazza** | 18/06/2026 | **51 dias** |
| **Camila Pereira** | 10/07/2026 | **29 dias** |
| **Beatriz** | 11/07/2026 | **28 dias** |

O cargo de PM nasceu em 06/08 porque **um** pedido ficou **dois dias** em
`"novo"`. Estes três estão parados há **semanas** e não aparecem em alarme
nenhum: o raio-x mede `pedidosDoClienteAbertos` (`ContentRequest`), que é outra
tabela — **`ClientRequestDb` em `"new"` não é varrido por ninguém.**

⚠️ **Não os movi.** Duas delas não têm `clientId` e a terceira aponta para uma
das **duas fichas duplicadas de "Camila Pereira"** — decidir qual é a boa é
decisão de negócio, e escolher por inferência é o que a lei da casa proíbe.

- [ ] `qualidade` — **varredura de `ClientRequestDb` em `"new"` há +24h**, com
      achado próprio no raio-x. Hoje o alarme não existe.
- [ ] **CEO/Diretor** — as três solicitações precisam de destino: atender,
      recusar ou arquivar.
- [ ] `esteira` — **"Camila Pereira" tem DUAS fichas de cliente**
      (`cmqyb0bpo…` e `cmrt7aecz…`), ambas com zero de tudo. Fundir é afirmar
      que são o mesmo negócio; não fundi.

## 🟠 08/08/2026 — O QUE ESTÁ PARADO ESPERANDO GENTE (e está CERTO estar)

**3 pedidos em `precisa_decisao`** — e nos três o fail-closed funcionou: a
máquina se recusou a adivinhar preço ou escopo e escalou. **Nenhum é bug; todos
esperam uma frase de gente.**

1. **CityJobs** (`cmsj7mev9…`, +24h) — *"Você pediu 2 peças e a minha tabela tem
   preço fechado de uma."* ⚠️ **É o pedido do próprio CEO** (*"preciso de dois
   posts por dia… preciso que isso comece hoje"*) — a origem de toda esta frente.
2. **Foocci** (`cmsj7e50a…`) — roteiro **e** peças são trabalhos com preços
   diferentes; a máquina não escolheu por ele.
3. **Foocci** (`cmshiesdq…`) — adiantar publicação agendada é gestão de
   calendário, não peça nova.

**2 posts agendados no passado** (Foocci, 07/08 10:00 e 08/08 10:00). **Não são
fila morta: estão barrados pela trava de publicação orgânica**, que só o CEO
levanta (`PUBLICACAO_ORGANICA=liberada`). **Não os reagendei** — mudar a data
esconderia que o bloqueio é uma decisão pendente do CEO, e a trava desta casa é
"nada é publicado".

> **O `ritmoContratado` continua NULO para os 5 clientes**, como o PM anterior
> registrou: não existe coluna que o guarde. Para o CityJobs o número está no
> `rawContext` do briefing (**2 posts/dia, 60/mês**) — texto livre, não campo.
> **Não o promovi a dado**: inferir contrato de prosa é exatamente o que a lei
> da casa proíbe. **Quem fecha isto é o CEO.**

## 🔴 08/08/2026 — VERIFICAÇÃO EM PRODUÇÃO: O CITYJOBS NÃO CAIU. QUEM MENTIU FOI A TELA (E O DIRETOR)

**Pedido do CEO:** ele abriu o portal do CityJobs e leu **"Conectada · desde
03/08/2026"** no Instagram e na Página, no mesmo dia em que o Diretor lhe
afirmou, mais de uma vez, que o acesso do CityJobs tinha vencido.

**O veredito, exercitando o acesso contra a Meta de dentro da produção:**

| Ativo | Resultado do exame |
|---|---|
| `@cityjobs.sp` (IG `17841480451638505`) | **VIVO.** Perfil lido, último post `01/08/2026` |
| Página `City Jobs SP` (`980144238512557`) | **RECUSADO — código 10** |
| `act_1355986106660251` | **VIVA e autorizada** — mas não é conexão nenhuma (ver abaixo) |
| Token de usuário do CityJobs | **VIVO** |

> **A afirmação de que "o acesso do CityJobs venceu" estava ERRADA.** Nada
> venceu. O que existe é uma permissão que falta no app **da agência**.

### 🔴 O código 10 quase virou a SEGUNDA mentira do mesmo cartão

A Página recusa com:

```
(#10) This endpoint requires the 'pages_read_engagement' permission or the
'Page Public Content Access' feature.
```

A primeira versão deste conserto mapeava 10 para `revoked` — o que faria a tela
dizer ao dono do CityJobs *"seu acesso foi revogado, reconecte"*. **Ele
reconectaria, o erro voltaria idêntico, e concluiria que o produto não
funciona.** A biblioteca capturada é explícita
(`fontes/graph-api-tratamento-de-erros.md`): código 10 é *"Permissão de API
negada"* — **App Review**, não token. É literalmente o aviso de que os códigos
da Graph mentem sobre a causa.

Agora `lerCodigoDaGraph` separa **TOKEN** (190/102/463/467 → o cliente
reconecta) de **PERMISSÃO** (3/10/200/299 → é nossa, reconectar não adianta) de
**LIMITE** (4/17/32/613/8000x → passa sozinho).

### O que a tela passou a distinguir — e as duas metades estão provadas

Três estados, decididos no **servidor** (`lib/integrations/meta/verificacao.ts`),
a mesma função que o diagnóstico usa — duas cópias divergem:

- **`viva`** — o acesso foi exercitado e respondeu, **com a data do exame**;
- **`nao_verificada`** — existe registro, ninguém testou. **É o padrão**, e era
  o estado real de todas as conexões da casa até hoje;
- **`caiu`** — recusado, com **o código e a frase crus da Meta**.

**Nenhuma data vai à tela sem dizer de que data se trata.** "Desde 03/08" era a
data de criação da linha lida como prova de vida. Agora: *"funcionou pela última
vez em…"*, *"registrada em… · ainda não testamos"*, *"o acesso foi recusado
em…"*.

**Provado em produção, depois do carimbo:** `@cityjobs.sp` aparece **viva**;
`City Jobs SP` aparece **caída, com o motivo**, e **nunca** como "Conectada".

### 🔴 DOIS DEFEITOS ACHADOS RENDERIZANDO, NÃO LENDO

1. **O cartão se contradizia**: a legenda dizia *"— reconecte"* e o corpo, três
   linhas abaixo, *"reconectar não resolve"* (DESIGN.md §7.6).
2. **A Página caía em "O QUE DEPENDE DE VOCÊ"** como *"1 conexão precisa ser
   refeita"*, com botão de reconectar — **para um problema nosso**. Trabalho da
   agência na fila do cliente não destrava nada e ensina a ignorar a lista.
   Agora quem decide de quem é a bola é o servidor (`quemResolve`), e o que é
   nosso aparece com todas as letras, **fora** da fila dele.

### 🔴 O DRIVE: 3 CLIENTES CONECTADOS, **ZERO** ARQUIVOS NA AGÊNCIA INTEIRA

Medido, não deduzido. Os três acessos estão **vivos** (o Google trocou o refresh
token):

| Cliente | Acesso | Escolhidos | Declarados | A agência alcança |
|---|---|---|---|---|
| CityJobs | **vivo** | 0 | 0 | **0** |
| Foocci | **vivo** | 0 | 0 | **0** |
| Dioli Digital Studio | **vivo** | 0 | 0 | **0** |

> **O CEO acredita ter mandado o logo da Foocci pelo Drive. Ele não mandou —
> ou mandou e a escolha não ficou.** O exame da Foocci devolveu **arquivo ao
> alcance do app** enquanto `DriveMaterial` tem **zero linhas** para ela. Isso é
> escolha feita no seletor do Google que **não gravou aqui**. O diagnóstico
> passou a contar os dois lados e marcar `escolhaPerdida` quando divergem.
>
> **✅ CONFIRMADO com número, medido em produção:**
>
> | Cliente | O Google diz que o app alcança | O banco desta casa tem | Escolha perdida |
> |---|---|---|---|
> | **Foocci** | **1 arquivo** | **0** | **SIM** |
> | CityJobs | 0 | 0 | não |
> | Dioli Digital Studio | 0 | 0 | não |
>
> **O CEO mandou, sim, 1 arquivo pelo seletor do Drive da Foocci — e esta casa
> perdeu a escolha.** Ele está certo e nós estávamos errados. É o item mais
> quente da lista abaixo: enquanto isso não for consertado, todo cliente que
> escolher material pode ter a escolha descartada em silêncio.

A frase da tela mudou: *"Conectado, mas nenhum arquivo escolhido ainda"* dizia o
estado e **escondia a consequência**. Agora diz que a Dioli **não alcança
NENHUM arquivo** e que **conectar não envia nada**. E o selo verde **"Ativo"**,
que aparecia com zero material (a régua era `faltaDizerOQueE > 0`, que é zero
quando nada foi escolhido), virou **"Sem material"**.

### 🟠 A CONTA DE ANÚNCIOS NÃO É UMA CONEXÃO — e por isso não aparece em lugar nenhum

`act_1355986106660251` ("Principal · BRL") está **autorizada** pelo CityJobs e
**viva**, mas mora só em `MetaAtivoAutorizado`: ela **não vira `MetaConnection`**
e **nenhum cartão do portal fala dela**. Salvar não é conectar. O diagnóstico
passou a exercitá-la; **a tela ainda não a mostra** — sem dono.

### 🟠 16 CONEXÕES ÓRFÃS DE TERCEIROS, TODAS COM TOKEN MORTO (código 190)

Sushi Cazza, Dilee, Kero Shop, Acesso Beleza, santioh_, dilix.br, queise,
Santioh Europe, Spa da Mente e as pessoais do CEO — as que entraram em 03/08 por
`/api/meta/token` com dono nulo (incidente já registrado em 06/08). **Todas
recusam**, e agora estão carimbadas como tal. Elas não pertencem a cliente
nenhum e **continuam no banco** — limpeza não foi rodada por conta própria.

### A rota nova: `GET /api/admin/diagnostico-de-conexoes`

Nasce fechada: `Authorization: Bearer <CRON_SECRET>`; **segredo ausente do
ambiente → 503**, nunca aberta. Não exporta POST/PUT/PATCH/DELETE. Carimbar o
resultado no banco **desta casa** exige `?carimbar=1` explícito — o mesmo padrão
do `?emitir=1` de `/api/admin/links-do-portal`.

**Nenhuma escrita na Meta e nenhuma no Google.** Só GET, e os da Meta passam por
`graph.ts` (balde de ritmo + cota por pontuação). Ela é chamada à mão: tela que
consulta a plataforma a cada F5 é rajada de GET, a assinatura do que restringiu
a conta da agência em 03/08.

**Duas travas foram reescritas com o motivo declarado** — o `toEqual` do payload
do portal (congelava "a resposta tem exatamente estes 5 campos") e a frase do
Drive. O invariante sobreviveu nas duas; a letra mudou.

**Portão:** `tsc` limpo · **2868 testes verdes em 176 arquivos** · build limpo.
Conferido em 375/768/1440 com a tela renderizada e os três estados vivos.

### 🔴 O QUE DEPENDE DO CEO

1. **App Review da Meta: `pages_read_engagement` + `Page Public Content
   Access`.** É o que destrava a leitura das Páginas de **CityJobs, Foocci e
   Dioli Digital Studio**. **Prazo externo** — enquanto ninguém pede, o relógio
   não começa. Sem isso, Página não publica nem traz número; o Instagram
   continua funcionando.
2. **Escolher os arquivos no Drive.** Conectar não envia nada. Hoje a agência
   alcança **0 arquivos de 0 clientes** — e é por isso que a peça sai com foto
   genérica e o logo é o nome escrito em fonte.

### O que vem a seguir (a fazer, com dono)

- [ ] `plataforma` — 🔴 **POR QUE A ESCOLHA DO SELETOR NÃO GRAVOU NA FOOCCI.**
      Confirmado: **1 arquivo ao alcance do app, 0 linhas no banco.** É o item
      mais quente da casa — enquanto não for consertado, todo cliente que
      escolher material pode ter a escolha descartada **em silêncio**, e a tela
      dirá a ele que ainda não escolheu nada. O `POST /api/portal/drive` recusa
      a escolha quando `metadadosDoArquivo` falha e devolve `recusados` — que a
      tela mostra, mas ninguém guarda. **Suspeita, não confirmada:** a escolha
      caiu em `recusados` e o CEO não viu a mensagem.
- [ ] `interface` — **a conta de anúncios autorizada precisa de cartão.** Hoje o
      CEO salva e nada aparece.
- [ ] `seguranca` — **as 16 conexões órfãs de terceiros continuam no banco**,
      com token morto. Recomendação mantida: ocultar/remover por decisão
      declarada, nunca por varredura silenciosa.
- [ ] `plataforma` — **o carimbo só existe quando alguém roda a rota.** Ele
      deveria ser deixado pelos caminhos vivos (publicação, leitura de
      resultados) para o portal se manter honesto sozinho. Sem isso, tudo volta
      a "não verificada" com o tempo — o que é honesto, mas é pouco.
- [ ] `plataforma` — ⚠️ **RISCO DE DEPLOY, visto hoje:** três deploys seguidos
      ficaram `SKIPPED` e um `FAILED` porque um commit da branch importava
      `lib/agency/execution/pilares-bloqueados` **sem o arquivo estar no
      commit**. Produção ficou ~40 min presa num commit antigo, e **ninguém
      seria avisado** se eu não estivesse olhando. Falta alarme de "produção não
      está no commit da branch".

## 🟢 08/08/2026 — O BLOQUEIO DO PILAR DE SALÁRIO VIROU MECANISMO, E A PERGUNTA QUE NUNCA CHEGOU AO CLIENTE GANHOU QUEM A FAÇA

**A consequência, primeiro:** dois P0 desta casa existiam **só como frase em
documento**. Pela lei da casa — *sem gate = reprovado* — os dois já estavam
reprovados: voltariam a passar no dia em que alguém esquecesse do `.md`.

### 1. O pilar de salário do CityJobs (`lib/agency/execution/pilares-bloqueados.ts`)

Em 07/08 **3 de 6 peças foram para o lixo** porque o gerador desenhou anúncio de
emprego FALSO nos pixels (`"VAGA $3,500"`, `"R$6.000"`, `"Assistents
Administrativo · R$ 2000 per wes"` sob a marca inventada *"AlcTiete"*). O
registro fechou com *"os pilares ficam BLOQUEADOS"* — e **nenhuma linha de código
barrava nada**.

- **A trava roda em TRÊS portas**, e nenhuma é redundante:
  `agendarPostsDaEntrega` (a peça não nasce no calendário) ·
  `produzirArtesPendentes` (**antes do teto de gasto** — depois dele o dinheiro
  já saiu) · `publicarAgendados` (**antes de falar com a Meta**: os 12 posts que
  já estão no banco de produção nasceram antes da trava, e uma guarda só na
  entrada protege o futuro deixando o passado sair).
- **O bloqueio se levanta por MECANISMO, não por memória.** Enquanto
  `conferenciaDePixelDisponivel()` devolver `false`, ele vale. Sem
  `process.env`, sem `{ forcar: true }`, sem exceção por cliente — **e há teste
  que reprova o arquivo que ganhar qualquer um dos três.**
- **A régua casa com o NOME DO PILAR, nunca com a legenda.** Filtro largo
  apagaria o calendário inteiro de um cliente de plataforma de vagas, e trava que
  dispara onde não há risco é desligada por quem não sabe o que ela protege. As
  legendas estavam certas; o preditor do estrago era o TEMA.

> 🟠 **UMA DECISÃO MINHA, DECLARADA:** a decisão escrita bloqueava **dois**
> pilares (*salário aberto*, *vagas por setor*). O terceiro — **candidatura
> rápida** — também foi REPROVADO em produção e **não constava do documento**.
> Entrou como `origem: "evidencia-de-producao"`. Quem discordar, o caminho é
> reabrir aqui: o CityJobs perde 3 dos 6 pilares até haver conferência de pixel.

### 2. A pergunta que nunca chegou ao cliente (`cobrarPedidosEsquecidos`)

O raio-x de produção acusou *"1 pedido pendente há +24h com `askedClientAt`
vazio"*. **Não era um caso raro: era estrutural.** `cobrarCliente` tinha **um
único chamador** (`run-execution.ts:869`) e ele só dispara na **mesma passada**
que abriu o pedido — e só se a passada chegar até lá, o que não acontece quando
o projeto termina em `blocked`, estado que o cron de recuperação **não pega de
propósito**.

> Ou seja: o pedido nascia, o projeto morria, e **não existia caminho nenhum no
> repositório capaz de perguntar aquilo ao cliente depois**. O alarme tocaria
> para sempre e ninguém poderia calá-lo. Do lado de fora, a agência parecia ter
> parado — que é exatamente o que o CEO viu.

Agora o **despertador** varre por TEMPO (carência de 24h, uma voz só por
projeto, idempotente). O que não puder ser cobrado vira **falha de rodada com
motivo**, nunca silêncio.

**Um defeito que o teste pegou e o código não teria contado:** `cobrarCliente`
devolve `0` tanto para *"nada a cobrar"* quanto para *"a escrita falhou"*. É o
defeito nº 1 do incidente do Drive outra vez — um `if` que confunde "não sei"
com "quebrou". Separado.

### 3. O censo por cliente (`lib/raio-x/por-cliente.ts`) — somente leitura

A agência só sabia responder no agregado (**12 posts, 5 clientes**). Agregado
responde outra pergunta: **esconde o cliente que recebeu ZERO hoje** dentro da
média de quem recebeu quatro. O `POST /api/cron/raio-x` passa a devolver
`porCliente`: peças de hoje, agendadas, publicadas, atrasadas, aprovações e
materiais — **por cliente, no fuso de São Paulo** (contar em UTC diria "nada saiu
hoje" nas três primeiras horas do dia do cliente).

- **Zero e "não sei" nunca dividem o mesmo pixel.** Falha de leitura vira
  `nao_medido` COM motivo. Banco fora do ar **não** devolve "a agência não tem
  cliente".
- **`ritmoContratado` fica NULO, sempre.** Não existe coluna que o guarde, e
  deduzi-lo do volume produzido faria o resultado virar a meta — a peça que
  faltou provaria que não era devida. **Quem sabe o ritmo é o CEO.**

**Portão:** `npx tsc --noEmit` limpo · **2842 testes em 174 arquivos, todos
verdes** · `npm run build` sai 0. ⚠️ Os 3 avisos de `instrumentation.ts` →
`armazenamento.ts` são **anteriores** a este trabalho (nenhum dos dois foi
tocado aqui).

### 🔴 O QUE NÃO FOI FEITO, E POR QUÊ

- **Nenhuma peça nova foi produzida em produção nesta rodada.** O único acesso a
  produção daqui é HTTP com `CRON_SECRET`, e as rotas `cron/*` **não produzem
  conteúdo**: `execute` é rede de segurança e devolveu `recovered: 0` (não há
  projeto em `running`/`failed` recuperável). **Produzir peça exige sessão
  autenticada de admin, que não existe nesta execução.**
- **Os 2 posts atrasados NÃO foram mexidos.** Não há caminho seguro daqui, e
  reagendá-los às cegas é o oposto da trava "nada é publicado".
- **O pedido em `precisa_decisao` há +24h continua parado** — por desenho ele
  espera decisão de gente.
- **A conferência de PIXEL na foto gerada por IA continua não existindo.** É a
  causa raiz dos 3 descartes e é o que destrava os 3 pilares. Sem dono.


## 🟢 08/08/2026 — 99FREELAS: A MÁQUINA DE CONFORMIDADE ENTROU NO CAMINHO QUE A TELA USA

**A consequência, primeiro:** até hoje a proposta que o CEO copiava em
`/agency/oportunidades` **não passava pelo Compliance Validator, não aplicava o
piso do Pricing Engine e não contava conexão**. Existiam DUAS implementações do
99Freelas: a viva (a tela) e a morta (`lib/marketplaces/`) — **113 testes verdes
sobre código que o app nunca executava**. A única guarda no caminho vivo era um
`semLink()` de quatro linhas.

> **Cada peça verde, a junta rompida.** É o mesmo padrão do incidente do Drive de
> 07/08, e é por isso que a trava nova **lê o código-fonte do caminho vivo**:
> testar as peças de novo não protegeria nada, elas já estavam verdes.

**Nada foi reescrito.** O caminho vivo passou a IMPORTAR E CHAMAR o que existia —
uma terceira versão seria o defeito, não a correção.

### O que a tela passa a barrar, e antes deixava passar

- **Referência à comissão da plataforma** (*"esse valor já considera a taxa"*) —
  é violação declarada e era a frase mais natural do mundo para quem precifica.
- **Permuta, teste grátis, pagamento comissionado, pagamento por fora, dado de
  contato.**
- **Proposta parecida demais com outra já enviada** — spam é a sanção mais
  provável para um robô, e a especificação do CEO não pedia essa trava.
- **Reprovou ⇒ NÃO HÁ TEXTO.** `propostaTexto` volta nulo e a tela mostra a regra,
  o trecho exato e a fonte. A recusa mora **dentro** de `copiarProposta`, não no
  `disabled` do botão: `disabled` é aparência, e atalho de teclado passa por cima.
- **Link no rascunho é retirado — e o fato aparece na tela.** Apagar o erro sem
  contar esconde a reincidência do gerador, que é o sinal que antecede o banimento.

### O preço deixou de sair da cabeça do modelo

`max(piso da casa, piso da categoria da plataforma)`, com a procedência na tela:
quanto se digita, quanto o cliente vê e **qual piso venceu**. A taxa é
acrescentada por cima (o que se digita é o líquido da agência) — e o texto da
proposta **não pode mencioná-la**, o que o validador barra.

> **Um achado ao ligar:** *"categoria que a tabela não reconhece"* e *"plataforma
> que não tem tabela nenhuma"* pareciam a mesma coisa e não são. O 99Freelas TEM
> a tabela (categoria fora dela = piso desconhecido, e desconhecido não vale
> zero). Upwork, Workana e Freelancer.com **não declaram tabela** — ali não há
> piso de plataforma a descobrir. Colapsar as duas fazia toda oportunidade dessas
> plataformas sair **sem preço**: um fail closed que não protege regra nenhuma, e
> fail closed que dispara onde não há risco ensina a equipe a ignorá-lo.

### O CEO passa a ver o saldo de conexões

**237 de 240 restantes** no topo da tela (Premium declarado, competência mensal,
fuso de São Paulo). Três estados, e o do meio é o que importa: `medido` ·
**`não medido`** (a leitura falhou e o número é o pior caso, em vermelho) ·
`plano não declarado` (cai para 10, Free, **fail closed intacto**).

- **Marcar como enviada agora GASTA conexão** — e exige o número **lido da tela
  do 99Freelas**, porque a plataforma não publica a tabela ("varia com o quão
  disputado é", e marketing e design são os disputados). Sem o número: **400, e
  nada muda de estado.** Aceitar "enviada" sem o custo deixaria o contador
  otimista em silêncio, e contador otimista é o mesmo que não ter contador.
- O gasto é registrado **antes** da mudança de status: o contrário deixaria uma
  proposta contada como enviada e uma conexão fora do livro.

### A política virou DADO, e um mapa escrito à mão saiu do código

`LINK_PERMITIDO: Record<string, boolean>` dentro do qualificador era a política
da plataforma repetida em código, ao lado do `policy.json`. **Saiu.** Quem
responde é o Policy Engine.

⚠️ **Efeito declarado:** o GetNinjas tinha `true` naquele mapa e **não tem
`policy.json`** — nenhum parecer, nenhuma fonte capturada. Agora ele entra como
fechado. A capacidade não foi perdida: volta com **uma linha de dado com fonte**,
sem código novo. O teste que congelava o comportamento antigo foi reescrito com o
motivo declarado.

### A porta do e-mail deixou de ser muda

Ela **ingeria e não qualificava** — só o "colar" chamava a IA. A fila ordena por
nota e nota ausente conta como a menor: a oportunidade que chegava pela porta
**mais barata da casa** nascia no rodapé da lista e ninguém a pegava. As duas
portas passam agora pela **mesma função** (`lib/agency/comercial/pipeline.ts`) —
duas cópias da regra é o defeito que quebrou o portal em 07/08.

**Passo a passo do encaminhamento para o CEO:**
`docs/plataformas/99freelas/porta-do-email-passo-a-passo.md`.

### 🔴 O REGISTRO QUE CONTRADIZIA O FATO — corrigido

`policy.json → autorizacao_do_suporte` dizia **`nao_perguntado`**. O CEO
**ENVIOU** a pergunta ao suporte em **07/08/2026**, do Gmail dele, e confirmou por
escrito. O `.md` já dizia "ENVIADA"; o JSON — que é o que o Policy Engine lê —
tinha ficado para trás. Agora: `perguntado`, `perguntado_em: 2026-08-07`, canal e
remetente declarados.

**Isso NÃO destrava nada:** o gate exige as três metades juntas
(`autorizado` + `respondido_em` + `evidencia`), e duas continuam nulas.

> **Dois testes que CONGELAVAM `nao_perguntado` foram reescritos.** Eles ficaram
> vermelhos **por o mundo ter andado para frente** — a mesma armadilha que o
> teste dos pedidos de API já tinha caído em 07/08. O invariante nunca foi
> "ninguém perguntou": é "sem as três metades, não destrava". É isso que travam
> agora.

### 🟠 UMA DIVERGÊNCIA QUE NÃO RESOLVI — de propósito

Upwork e Freelancer.com: o `.md` diz **"ENVIADO em 07/08"**, o `policy.json` diz
**`nao_perguntado`**, e este arquivo lista o envio como pendência **aberta**.
**Três fontes, duas histórias.** O CEO confirmou por escrito **apenas** o caso do
99Freelas.

**Não escolhi um lado.** Os status ficaram como estavam (o lado que não destrava)
e o conflito está **escrito** nos quatro arquivos, com teste que reprova quem o
apagar. **O que fecha isto é uma frase do CEO: enviou ou não enviou.**

### 🔴 O QUE FICOU DE FORA, E O MOTIVO

- **`RADAR_EMAIL_SECRET`: CONFIRMADO em produção.** Medido, não deduzido: a rota
  respondeu **401** a uma chamada sem a chave (se não existisse, seria 503).
  ⚠️ **Só `www.diolidigital.com.br` responde** — o domínio raiz não devolveu nada
  na mesma medição. Encaminhador apontado para o domínio sem `www` vira uma porta
  que nunca recebe nada **e não avisa ninguém**. Consertar o DNS do raiz é outra
  frente, sem dono.
- **`BrowserComputer` continua sem chamador — de propósito.** Nenhum login,
  nenhuma leitura autenticada, nenhuma escrita no 99Freelas. Há teste que reprova
  quem o chamar a partir do caminho vivo, e que reprova `fetch(` nas rotas do
  Radar (rajada de GET é a assinatura do que restringiu a conta na Meta em 03/08).
- **Busca automática de projetos: não ligada.** Toca a plataforma e depende de
  autorização que o CEO não deu.
- **A qualificação por e-mail roda em linha**, então o encaminhador espera alguns
  segundos a mais. Fila assíncrona é frente própria — sem dono ainda.
- **A entrada do follow-up continua sem existir** (o chat fica atrás do login, e
  login é BLOCK). Risco aberto, inalterado.

**Defeito achado renderizando, não lendo:** sem `items-start`, a coluna curta
("o projeto, como chegou") esticava até a altura da coluna longa e virava meia
tela de retângulo branco a 1440px — o mesmo defeito do admin do Google, pela
mesma razão: leitura de código não mede altura.

**Portão:** `npx tsc --noEmit` limpo · **2747 testes em 169 arquivos, todos
verdes** · `npm run build` limpo. Conferido em 375/768/1440 autenticado, com os
estados limpo e barrado.


## 🟢 08/08/2026 — O PORTAL DO CLIENTE TEM UMA TAREFA SÓ, E AGORA A TELA SERVE A ELA

Ordem do CEO: *"está uma coisa totalmente perdida e sem sentido"*. Auditado pelo
`experiencia` (somente leitura), executado pelo `interface`, auditado pelo `pm`.

**A UMA COISA que o cliente vem fazer no portal — a pergunta que ninguém tinha
feito:**

> **"Destravar o trabalho que está parado esperando uma decisão minha."**

A casa **já sabia** a resposta (o cabeçalho conta pendências, o bloco 1 se chama
"O QUE DEPENDE DE VOCÊ", Aprovações se declara "o único lugar onde você decide")
— e **só 1 das 7 abas servia a ela**. As outras 6 serviam a *acompanhar*, que é o
que a agência quer mostrar, não o que o cliente veio fazer. É essa distância que
produzia o "perdido".

⚠️ **É HIPÓTESE, marcada como hipótese.** Ninguém observou cliente real usando.
**O teste que confirma:** registrar por sessão quais abas recebem clique e
quantas sessões terminam sem nenhuma decisão. Se a maioria tocar só Início +
Aprovações, está confirmado.

### 🔴 O pior defeito não era feio — era o primeiro dia de TODO cliente pagante

O servidor **já distinguia**: `404 {"error":"Ainda não há projeto para
acompanhar"}`. `EsteiraDoCliente.tsx:104` colapsava **todo** `!ok` numa
mensagem só: *"Não consegui carregar agora. Tente atualizar a página."*

- **Atualizar nunca resolvia** — não havia projeto. O cliente recarregava,
  desistia e ligava para o PM por um não-problema.
- **Aparecia DUAS vezes** no mesmo percurso: Início (bloco 2) e Projetos.
- É a **gêmea invertida do incidente do Drive** (07/08). Lá, falha de leitura
  virou fato sobre o cliente. Aqui, **ausência benigna virou falha inventada**.
  A origem é a mesma nos dois: **um `if` que trata "não sei" e "quebrou" como a
  mesma coisa.**

Agora há estado vazio próprio — *"Seu projeto está sendo montado"* — que nomeia o
próximo passo, não culpa o cliente e **não promete data**. Travado por teste.

### As 7 abas viraram 5 — nada foi apagado, tudo é reversível

Medido a 375px: **4 das 7 abas nasciam fora da tela** (Resultados em x=293,
Conta em x=589, tela=375). Aba que não aparece não separa nada — só esconde.
Agora **5 abas, todas visíveis, sem rolagem** (x=12 a 363).

| Antes | Agora | Por quê |
|---|---|---|
| `Resultados` | **bloco do Início, só quando existe número** | sem Meta conectada só sabia dizer "nenhuma rede conectada" — um beco, e a 1ª aba fora da tela |
| `Arquivos` | **"Enviar arquivos"** (`Enviar` no celular) | não é acervo, é caixa de envio |
| `Conta` + `Integrações` | **"Sua conta"**, duas seções rotuladas | ambas são sobre o cliente, não sobre o trabalho |

- **Nenhum componente foi removido.** Os 10 de `components/portal/` continuam lá.
- **Endereço antigo não vira beco:** `?secao=integracoes` e `?secao=resultados`
  ainda chegam ao lugar certo. Travado por teste.
- **O `pm` BARROU a eliminação da aba `Conta`** que o `experiencia` propôs: há
  trava registrada em 07/08, e o conteúdo estar todo em *"Não informado"* é
  **problema de DADO, não de tela** — apagar a aba esconderia o furo. Fusão, não
  exclusão.

### 🔴 UMA TRAVA DE TESTE FOI REESCRITA — declarado, não escondido

`__tests__/portal/um-lugar-para-decidir.test.ts` exigia *"a navegação tem uma aba
Integrações"* (decisão de 07/08). A fusão quebra a **letra** dela.

**A regra sobreviveu; o mecanismo mudou.** O teste passou a travar o que sempre
importou — dois assuntos com nome próprio, nenhum bloco misturado, **nenhum
conteúdo perdido** — e ganhou anti-regressão que não existia (componentes não
apagados, endereços antigos ainda resolvem). **O `pm` autorizou a fusão no
despacho e responde por ela.** Quem discordar, o caminho é reabrir aqui.

### As outras correções

- **Cabeçalho:** 186px → 144px. A marca da Dioli ocupava ~23% da primeira tela do
  cliente; o **nome de quem paga** virou o primeiro elemento.
- **A porta de vender saiu do rodapé.** ⚠️ **A premissa que circulava estava
  errada:** `SolicitarAlgo` na linha 1311 é folha sobreposta montada na raiz —
  mover aquela linha não muda nada na tela. O enterrado era o **gatilho**
  (`page.tsx:889` e `:961`, a ~806px, abaixo da dobra) **e ele estava coberto**
  pelo botão flutuante "Fale com seu PM". Agora fica no topo quando nada trava, e
  **logo abaixo da pendência** quando algo trava — nunca na frente dela.
- **53 correções de escala tipográfica.** `11.5px` e `10px` estavam **abaixo do
  piso** do manual. Hex solto na página: 15 → 5 (sobram só gradientes de marca).

**Notas do `interface` (0–10):** hierarquia **9** · tipografia **9** ·
espaçamento **8** · consistência **9**. Evidência antes/depois nos 3 tamanhos +
os três estados obrigatórios em `scratchpad/shots/` (**não commitado**).

**Portão:** `npx tsc --noEmit` limpo · **2709 testes em 168 arquivos, todos
verdes** · `npm run build` limpo. As duas falhas herdadas
(`as-cinco-plataformas`, `passagem-do-pedido`) **passaram** nesta rodada.

### 🔴 O QUE NÃO FOI FEITO — com dono, e o motivo

- [ ] `esteira` — **duas verdades na mesma tela.** No Foocci o bloco 1 diz
      *"aguarda sua aprovação"* e o bloco 2, colado abaixo, diz *"quando algo
      precisar de você, aparece nas pendências"*. A API confirma:
      `aBolaEstaComVoce: false` com 1 aprovação pendente. **É o defeito nº 2 do
      Drive repetido** — duas fontes de verdade adjacentes. Regra de servidor,
      fora do escopo do `interface`.
- [ ] `esteira` — **o card não diz O QUE se aprova** quando as peças estão em
      "arte em produção". O cliente aprova o texto sem ver a arte que vai ao ar.
- [ ] `esteira` — **"Enviar arquivos" promete listar o que a equipe precisa e
      nunca lista.**
- [ ] `esteira` — **Projetos anuncia a mesma pendência duas vezes** (aviso do
      topo + banner do calendário). Sinal repetido, não decisão repetida.
- [ ] `plataforma` — **logo do cliente no cabeçalho.** ⚠️ **Correção:** a fonte
      **não** é `lib/agency/execution/logo.ts` (aquilo é gerador de kit de
      marca) — é `lib/agency/esteira/material-do-drive.ts::logoDoCliente()`, que
      **exige Drive conectado + logo declarado**, e **nenhum cliente tem**. **O
      fallback em nome de texto é o caso NORMAL, não a exceção.** Nada inventado.
- [ ] `experiencia` — **o chat flutuante recorta texto a 375px.** Colisão com o
      card de pedido está em **0, medido**, mas o `DESIGN.md` só permite
      flutuante "sobre a margem" e **a 375px não existe margem**. Resolver de vez
      é tirar o chat do flutuante — isso é *"qual destino existe"*, pergunta do
      `experiencia`. Registrado em `DESIGN.md`.
- [ ] **Cardápio de tipos** — o CEO pediu; a folha já tem *"Para quê?"* com 5
      opções, mas é **motivo**, não **tipo de entregável**. **Precisa do CEO
      dizer qual dos dois ele quis.**
- [ ] **Cartões vazios que JÁ estão no banco de produção** continuam lá.
      Recomendação mantida: **ocultar por leitura, nunca apagar linha**. Nada
      foi rodado em produção.

### 🟠 Lacunas de ambiente achadas nesta rodada

- **A constituição dos Essenciais não existe nesta cópia do kit.**
  `/workspace/dioli-brain-kit` existe mas vai só até `16-raio-x-noturno.md` —
  **não há `21-elenco-obrigatorio.md` nem `23-constituicao-dos-essenciais.md`**,
  que são o que `.claude/agents/experiencia.md` e `interface.md` mandam ler
  primeiro. Os dois trabalharam pelo próprio perfil. **É lacuna de versão do
  kit** — vale um `git pull` antes do próximo despacho.
- **Não exercitado:** fluxo de orçamento com as 3 saídas (nenhum cliente local
  tinha orçamento pendente), Resultados com número real, logo de cliente
  renderizado. Nenhum dos dois tokens tem Meta ou Drive conectados.

## 🟢 08/08/2026 — O GOOGLE ENTROU NO ADMIN: `/agency/google`, item próprio no menu

**Pedido urgente do CEO:** *"preciso da integração das ferramentas do Google nas
páginas do admin urgentemente."*

**A consequência, primeiro:** até hoje o único lugar do admin que falava do
Google era `/agency/integrations`, rodando em `MOCK_INTEGRATIONS`, dizendo
**"Google Drive — planejado · OAuth Google não implementado"** sobre uma feature
que está **em produção e foi provada com a Foocci nesta semana**. E dizendo
**nada** sobre o Perfil de Empresa, que já roda no despertador a cada 5 minutos.
Painel que descreve errado o que a casa faz é pior do que painel vazio: ele
responde a pergunta do CEO com um número inventado.

### O levantamento, com evidência (não deduzido)

| O que existe | Estado real |
|---|---|
| `lib/integrations/google/drive.ts` + `escolha-de-material.ts` | **Completo e em produção.** Só leitura, escopo `drive.file` |
| `lib/integrations/google/client.ts` (Perfil de Empresa) | **Completo**: listar locais, listar avaliações, **responder avaliação**, **publicar post** |
| `/api/portal/drive/*` (3 rotas) | No ar, fechadas pelo token do portal |
| `/api/google/conectar` (Perfil de Empresa) | **Viva, funciona, e NÃO TEM BOTÃO EM LUGAR NENHUM** |
| `/api/auth/google/*` | Login do briefing por popup. Escopo `openid email profile`, sem sessão |
| `/api/avaliacoes` | Rota de leitura da fila de escalação — **sem tela** |
| `lib/agency/esteira/avaliacoes.ts` | **Roda no despertador a cada 5 min** e responde avaliação 4–5 ★ sozinho |
| Telas de `/agency/` que mostravam algo do Google | **Nenhuma.** Zero |

### 🟡 O achado que mais importa, e ele é bom

**A resposta automática a avaliação já é FAIL CLOSED, e por mecanismo.**
`GoogleConnection.autoReplyConsentAt` nulo ⇒ nada sai sozinho, tudo vira
rascunho escalado — e há teste que reprova o contrário
(`__tests__/esteira/avaliacoes.test.ts:283`). Está **nulo em todos os locais**.
A política da própria API do Perfil de Empresa exige consentimento prévio e
específico (`fontes/business-profile-api-politicas.md`).

> **Mas:** o único caminho que LIGA esse consentimento não existe em tela
> nenhuma, e não foi construído aqui **de propósito** — ligar resposta
> automática é escrita no Google, e a regra de 03/08 exige parecer prévio do
> especialista `google`. A pasta `pareceres/` só tem o do Drive.

### O que ficou no ar

- **`/agency/google`** — item próprio no menu, acima de "Ferramentas &
  Integrações". Fechada a `master` e `project_manager` **no servidor**
  (`requireSession(["master","project_manager"])`), não só no menu.
- **Por cliente:** quem conectou o Drive, com que conta, desde quando, quantos
  arquivos **a agência de fato usa**, quantos faltam o cliente declarar, quais
  papéis já existem, e a falha de importação com a frase que o Google devolveu.
- **Perfil de Empresa por cliente**, mais a conta da própria Dioli (conexão sem
  `clientId`) — sem essa seção ela responderia avaliação no relógio sem
  aparecer em tela nenhuma.
- **As 4 credenciais**, por presença. **Nenhum valor é devolvido pelo servidor**
  — tela de admin que imprime `GOOGLE_CLIENT_SECRET` é vazamento por screenshot,
  e há teste que reprova.

**As regras que a fazem valer alguma coisa** (`__tests__/google/retrato-do-admin.test.ts`,
18 testes, cada trava com as duas metades):

- **`Contagem` tem DOIS estados** — `medido` e `nao_medido`. Falha de leitura
  **não vira zero**: zero é uma afirmação sobre o cliente, "não consegui olhar"
  é uma afirmação sobre nós. É a lição dos três `.catch(() => null)` de 07/08.
- **Escolher ≠ declarar.** Arquivo sem `papelConfirmadoEm` conta em "escolhidos"
  e **não** em "a agência usa". Se os dois números pudessem ser iguais, a tela
  diria "12 disponíveis" para uma esteira que só consegue usar 5.
- **A rota não exporta POST, PUT, PATCH nem DELETE**, e o teste reprova quem
  acrescentar. Toda escrita que essa tela poderia querer é escrita no Google.
- **Nem a rota nem a camada de leitura falam com o Google** — o teste reprova
  `googleapis.com` e `fetch(` nos dois arquivos. Tela de admin que consulta a
  plataforma a cada F5 é rajada de GET, a assinatura do que restringiu a conta
  da agência na Meta em 03/08.

**Conferido em 375/768/1440 com a tela renderizada e autenticada**, e um defeito
foi achado assim, não por leitura: sem `items-start`, o cartão curto ("nunca
conectou", 3 linhas) esticava até a altura do cartão longo (~30 linhas) e virava
um retângulo branco vazio de meia tela a 1440px.

### 🔴 O QUE DEPENDE DO CEO — passo a passo em `docs/plataformas/google/o-que-depende-do-ceo.md`

1. **Google Ads: PEDIDO FORMAL, prazo EXTERNO de dias a semanas.** Texto pronto
   em `docs/plataformas/google/pedido-de-token-de-desenvolvedor-ads.md`.
   Sem token de desenvolvedor **nenhuma** chamada à API funciona, nem de
   leitura. O token **nasce restrito** e tirar as restrições é um **segundo**
   pedido. Exige conta de administrador (MCC), site no ar e e-mail monitorado —
   os três são motivo declarado de recusa. **Enquanto ninguém pede, o relógio
   não começa.** O Planejador de Palavras-chave vive dentro dessa mesma API.
2. **Analytics (GA4): 15 minutos, sem prazo externo.** Ativar
   `analyticsdata.googleapis.com` **e** `analyticsadmin.googleapis.com`, e
   declarar **`https://www.googleapis.com/auth/analytics.readonly`** na tela de
   consentimento (confirmado no documento de descoberta oficial em 08/08).
   ⚠️ É escopo **sensível**: acrescentá-lo **reabre a verificação do app**.
3. **Search Console: mesma forma.** API `searchconsole:v1` (confirmada), escopo
   **`https://www.googleapis.com/auth/webmasters.readonly`**. Grátis.
4. **Google Trends: entrar na LISTA DE ESPERA.** Existe API oficial e ela está
   em **alpha fechado** desde 24/07/2025 (`fontes/trends-api-alpha.md`,
   capturada hoje). ⚠️ **Biblioteca não oficial de Trends é proibida nesta casa
   sem parecer** — é o gesto que custou a conta da Meta.
5. **Gargalo comum a 2, 3 e 4:** escopo concedido **não alcança dado nenhum**
   sem cada cliente autorizar a propriedade dele. Alcance nunca é autorização.

### O que vem a seguir nesta frente (a fazer, com dono)

- [ ] `google` — **parecer sobre ESCRITA no Perfil de Empresa** (responder
      avaliação, publicar post, ligar `autoReplyConsentAt`). Enquanto não sair,
      `/agency/google` fica só leitura. **É o item que destrava mais valor.**
- [ ] `pm` — botão de conectar Perfil de Empresa. A rota existe e não tem porta;
      entra **depois** do parecer, porque conectar sem ter o que fazer com a
      conexão é meio caminho.
- [ ] `pm` — tela para a fila de `/api/avaliacoes` (rascunho + decisão de gente).
      Hoje a rota existe e ninguém vê a fila — "escalada invisível é o mesmo que
      escalada nenhuma", como diz o cabeçalho dela.
- [ ] `interface` — `/agency/integrations` continua descrevendo o Google errado
      (`MOCK_INTEGRATIONS`). Duas versões do mesmo fato em telas diferentes é a
      §7.6 do DESIGN.md. **Não mexi**: a tela é de outra frente.
- [ ] `qualidade` — `PAPEIS[papel]` cai no id cru quando o papel não está na
      lista fechada. É o comportamento honesto (não inventa rótulo) e **também**
      o sintoma de dado velho no banco. Sem dono.

### 🗺️ E o MAPA do arsenal de informação: `docs/plataformas/mapa-do-arsenal-de-informacao.md`

Ampliação do pedido do CEO (*"todas as ferramentas que uma agência de marketing
precisa estar conectada"*). **Nada construído** — levantamento com fonte, uma
linha por ferramenta, para o Diretor decidir a ordem.

> **🔴 O achado que muda a prioridade: o Radar está LIGADO E CEGO.**
> `RADAR_SOURCES` vem **vazia por padrão** (`lib/agency/radar/sources.ts`), e o
> cabeçalho do `radar-agent.ts` diz com todas as letras: *"sem fontes
> automáticas (Fase 3), a 'atualidade' vem do que a IA conhece"*. A tela que o
> CEO abre para ver o mercado mostra **o que um modelo lembra**, com data de
> corte. A governança está pronta (fonte oficial → ativo, resto → pendente,
> lastro léxico por cobertura total). **Falta fonte, não código.**
>
> **O atalho de melhor custo/benefício da lista inteira: ligar `RADAR_SOURCES`
> com feeds RSS oficiais.** Custo zero, sem token, sem aprovação, sem prazo
> externo, trava já existente. **Não liguei**: escolher quais feeds entram como
> `official: true` decide o que atravessa sem revisão humana — é decisão de
> negócio, não minha.

**Portão:** `npx tsc --noEmit` limpo · **2709 testes verdes em 168 arquivos**
(inclusive os 2 de `as-cinco-plataformas` que estavam vermelhos em 07/08) ·
`npm run build` limpo.

**Nenhuma escrita no Google nesta frente. Nenhuma chamada à API do Google
partiu desta sessão.**

## 🟢 08/08/2026 — NASCE O DEPARTAMENTO FINANCEIRO, e a conta de IA parou de medir um terço

**A consequência, primeiro:** até 07/08 a casa gravava o custo de cada chamada
de IA, mas **22 dos 32 pontos de chamada não diziam de quem era a conta**.
"Quanto cada agente gasta" e "quanto este cliente custa" tinham resposta, e a
resposta era uma amostra de tamanho desconhecido — o pior tipo de número, porque
tem cara de completo. (O item 4 de `docs/perguntas-ao-diretor-geral.md` já
apontava isso e está fechado.)

### O que fechou

- **`agentId` virou OBRIGATÓRIO em `generate()`** (`lib/ai/generate.ts`).
  Chamada nova sem dono **não compila**; o portão (`npx tsc --noEmit`) reprova.
  Os 22 pontos foram fechados, e onde havia cliente/projeto à mão eles entraram
  junto (`clientId`, `projectId`) — inclusive na Qualidade, que auditava de
  graça na conta de ninguém.
- **O dono sai de um registro fechado** (`lib/ai/donos.ts`), e o **departamento
  que paga é derivado dele**. Achado ao construir: as 6 telas de `/api/agents/*`
  gravavam `"social"`, `"design"`, `"ads"`… — grafias que não casam com os ids
  dos especialistas. Ficaram **como estão**, registradas com o departamento
  certo: renomeá-las partiria o histórico em duas linhas para o mesmo trabalho,
  que é o defeito que o registro existe para impedir.
- **A trava tem as duas metades provadas**
  (`__tests__/ai/todo-gasto-tem-dono.test.ts`, 10 testes): reprova chamada sem
  `agentId` **e** dono fora do registro; não reprova o repositório limpo nem
  `generate({` citado em comentário. O teste também exige achar mais de 20
  chamadas — varredura que quebra e encontra zero ficaria verde para sempre.

### O departamento

- **`financeiro` em `lib/dioli-brain/departments.ts`**, com o **mesmo id** já
  usado em `especialistas.ts`. Departamento é a casa: ela tem o plano de
  investimento que o CLIENTE recebe (especialista `financeiro-plano`, que já
  existia) e os livros DA AGÊNCIA (novos). Id novo criaria dois "financeiros" no
  painel e na escada. **Não é um sexto Essencial** — é departamento de domínio.
- **Nasce em SOMBRA por mecanismo, não por promessa:** `degrauDeclarado()`
  devolve `sombra` para linha ausente, e `departamentosDaCasa()` já o enxerga.
- **`firstVersionStatus: "partial"`, declarado:** o DRE e a medição de IA
  existem; **conciliação bancária, contas a pagar/receber e regime de caixa
  NÃO existem.**

### A tela — `/agency/financeiro`, seção própria no menu

Responde as duas perguntas ao mesmo tempo: **"como está a agência?"** (DRE:
receita, custo direto, despesa, resultado) e **"este projeto se paga?"** (uma
linha por centro de custo, **ordenada do pior resultado para o melhor** — quem
dá prejuízo aparece primeiro, nunca no rodapé). Mais custo de IA **por agente** e
**por cliente**, e o livro de lançamentos do mês. Rota fechada a `master` e
`project_manager` no servidor, não só no menu.

**As regras que a fazem valer alguma coisa, e cada uma tem teste**
(`__tests__/financeiro/dre-nao-escreve-zero.test.ts`, 18 testes):

- **`Dinheiro` tem TRÊS estados** — `medido`, `nao_medido`, `nao_lancado` — e a
  soma **se recusa a somar**: parcela não medida contamina o total em vez de
  virar zero. "Não medido" e "custou zero" nunca compartilham pixel.
- **Toda linha carrega procedência** (registro de IA · manual · contrato ·
  extrato) e ela aparece na tela, não no log.
- **Estimado em linha separada**, fora do resultado.
- **Falha de LEITURA vira erro nomeado**, nunca uma tela de zeros — a lição dos
  três `.catch(() => null)` de 07/08 aplicada a dinheiro.

**Conferido nos 3 tamanhos (375/768/1440) com a tela renderizada de verdade, e
dois defeitos foram achados assim, não por leitura:** (1) o mesmo projeto abria
**duas linhas** quando um lançamento usava `centroDeCusto: "CityJobs"` e outro o
`clientId` do cliente CityJobs — resolvido no servidor, e **só quando o nome é
único** (dois clientes homônimos continuam separados, porque fundi-los seria
inventar que são o mesmo negócio); (2) a grade de custo de IA em `md:grid-cols-2`
truncava o nome do agente a 768px — a barra lateral volta a ocupar 224px ali,
sobram 544px, e a régua é `lg`, não `md` (DESIGN.md §6.3).

### 🔴 O QUE DEPENDE DO CEO

1. **Faturamento e custo em reais entram À MÃO.** Não há conciliação bancária
   nem integração com banco. Hoje a casa mede sozinha **apenas o custo de IA**.
   Se ele quiser o DRE completo sem digitar, isso é uma frente própria.
2. **Câmbio USD→BRL.** O custo de IA é cobrado em dólar e **não entra no
   resultado em reais** — não há taxa declarada nesta casa e inventar uma
   mudaria o número mais consequente da tela. Ele decide a fonte da taxa.
3. **O histórico anterior a 07/08/2026 NÃO volta** e não foi extrapolado.
   Aparece marcado na tela, com a data.

### O que vem a seguir nesta frente (a fazer, com dono)

- [ ] `plataforma` — lançar o custo de IA como custo em reais por rotina, assim
      que houver câmbio declarado. Enquanto não houver, ele fica fora do
      resultado, declarado.
- [ ] `esteira` — quando um pedido é aprovado com preço, gerar o lançamento de
      receita automaticamente (origem `contrato`). Hoje o preço existe na
      proposta e não chega ao DRE.
- [ ] `plataforma` — `social/generate` e `design/generate` continuam aceitando
      `clientId` opcional; quando não vem, o custo entra **sem cliente**. Está
      anotado, não preenchido por inferência (furo já declarado em 07/08).
- [ ] `qualidade` — subir `financeiro` de sombra exige evidência, como qualquer
      outro. Nada foi subido.


## 🟢 07/08/2026 — OS CINCO ESSENCIAIS E A SALA DOS AGENTES ESTÃO NO AR

**O elenco não foi instalado por cima do que existia.** Cruzamento feito agente
por agente (registro completo em `docs/decisoes.md`):

- **`qualidade` e `cerebro` já eram os Essenciais** — papel conferido contra a
  constituição, não só o nome. `qualidade` já era só leitura; continua.
- **`interface` virou DOIS**: `interface` (forma) e **`experiencia`** (percurso,
  **sem `Write` nem `Edit`**). A prova é desta casa: a nota de aparência não
  pegou o card de aprovação vazio, nem o Drive dizendo "conectado" e "não
  conectado" no mesmo cartão, nem o orçamento com duas saídas quando o cliente
  precisava de três. **Nenhum desses é feio.**
- **`seguranca` saiu de dentro de `plataforma`**, com escrita e com o direito de
  barrar merge. Motivo: segurança dividia fila com deploy e migration **e perdia
  todo dia** — em 07/08 houve três urgências de produção e zero varredura de
  superfície exposta.
- **`pm`, `departamentos`, `esteira`, `plataforma`, `meta`, `google`, `tiktok`
  ficaram como domínio.** Nenhum agente apagado, nenhuma memória movida.

**A trava, não o aviso:** `__tests__/agentes/elenco-obrigatorio.test.ts`
(38 asserções) reprova apagar um dos cinco, perfil de Essencial que não aponte
para a constituição, e `Write`/`Edit` no `qualidade` ou no `experiencia`.
**A constituição não foi copiada para cá** — é apontada.

### A Sala dos Agentes: `/agency/agents`, item PRÓPRIO no menu

- **A tela que estava lá rodava em `MOCK_AGENTS`** — mostrava um time inventado
  como se fosse o elenco real, mentindo exatamente sobre a pergunta do CEO.
- **26 no elenco**: 12 que constroem o produto + 14 que falam com o cliente,
  **em seções rotuladas separadas** — as duas populações não se medem igual.
- **O cartão nunca escreve zero quando a resposta é "não sei".** Três estados
  visualmente distintos: número · `—` (medido zero) · *não medido* (com motivo).
- Conferido em **375 / 768 / 1440**, autenticado, com a tela renderizada.

### 🔴 O QUE ESTÁ "NÃO MEDIDO" NESSA TELA — e é verdade, não defeito

1. **Nenhum despacho de especialista é registrado nesta casa.** A sala não sabe
   quantas vezes cada agente foi acionado — só quantos blocos ele assinou na
   própria oficina. `cerebro` e `pm` aparecem "não medido" porque **não têm
   `docs/agents/<slug>/`**; `meta`, `google` e `tiktok` também não têm.
2. **Em produção, os blocos serão "não medido" para todos** — o servidor roda a
   partir de `.next/standalone`, sem a pasta `docs/`. É honesto e é o motivo de
   o elenco ser declarado em código, não varrido do disco.
3. **Custo de IA existe e é medido**, mas **~28 dos 38 pontos que chamam
   `generate()` não passam `agentId`** — esse gasto entra sem dono. A sala
   **não o reparte** (repartir seria inventar quem gastou) e **não o esconde**:
   ele aparece como lacuna declarada.

### 🔴 O QUE EXIGE DECISÃO DE CIMA — em `docs/perguntas-ao-diretor-geral.md`

1. **O `CLAUDE.md` ainda lista o elenco antigo.** Não o alterei: é configuração
   de sessão, acima da camada do PM. **Enquanto não for atualizado, o Diretor
   não vê `experiencia` nem `seguranca` na lista e nunca os despacha.**
2. **Duas hierarquias competindo:** o kit desenha `Diretor do Projeto →
   especialistas`; esta casa tem `Diretor → PM → especialistas`.
3. **Fechar a cobertura de `agentId`** nos ~28 pontos restantes: precisa de dono
   e prazo.
4. **A primeira varredura do `seguranca`** — a fila dele já nasce com 4 itens
   registrados e sem dono, e o primeiro (`publishPost` sem
   `MetaAtivoAutorizado`) exige parecer do `meta` antes.

**Portão:** `npx tsc --noEmit` limpo · `npm run build` limpo · **2653 testes
verdes**. ⚠️ **2 testes falham em `__tests__/marketplaces/as-cinco-plataformas.test.ts`
— a falha é ANTERIOR a este trabalho** (confirmado com `git stash`) e continua
sem dono.

## 🔴 07/08/2026 — O PORTAL PEDIA APROVAÇÃO DE CARDS VAZIOS. Consertado (`02c7629`)

**A consequência, primeiro:** o CEO abriu duas aprovações em produção e as duas
estavam **literalmente vazias** — título "Estratégia", subtítulo "Estratégia",
os três botões de decisão, e nenhuma linha de conteúdo. A segunda, idêntica,
dizia "Analytics"/"Analytics". Ele estava sendo convidado a **aprovar o que não
podia ver**. Num piloto 100% IA, aprovação às cegas é a assinatura do cliente
num trabalho que ninguém conferiu — é "sem gate = aprovado" com a culpa
transferida para quem clicou.

**O diagnóstico, PROVADO (não era "o entregável não existe"):** é **(a)** — o
entregável **existia no banco** e o portal não conseguia lê-lo. Duas causas
empilhadas, cada uma suficiente sozinha:

1. **`apresentar()` publicava as aprovações ANTES de a escada de exposição
   decidir**, com um `updateMany` sem condição: toda aprovação pendente virava
   `clientVisible`. Departamento em SOMBRA tinha a entrega retida (certo — é o
   que "sombra" quer dizer) e **o card de decisão dele subia assim mesmo**.
   > **A escada protegia o CONTEÚDO e deixava passar o PEDIDO DE DECISÃO sobre
   > ele.** Uma trava pela metade que parecia inteira.
   O mesmo defeito existia em `mes.apresentarCiclo` — consertar só `marcos.ts`
   deixaria o ciclo mensal reabrindo o buraco todo mês.
2. **O portal casava entrega→departamento por um mapa de 3 linhas**
   (`{a3, a2, a4}`) contra os ~14 especialistas da casa. `strategy-*`, `a5`,
   `analytics-*`, `social-copy` e os demais resolviam `undefined` e a entrega era
   **descartada em silêncio**. Agora usa `departamentoDoAgente`
   (`lib/agency/escada/degraus.ts`), a forma canônica que a própria escada usa.
   Era uma segunda cópia da mesma relação, e **já divergia em 11 dos 14 casos**.

> ### ⚠️ O QUE A JORNADA PONTA-A-PONTA REVELOU — e ninguém tinha medido
>
> **Departamento nasce em `sombra`** ("degrau de nascimento — nunca entregou
> nada a cliente nenhum nesta casa", `escada/registro.ts`). Logo, no caminho
> ponta-a-ponta **nenhuma** entrega vira `compartilhado` e **nenhum** card tem
> corpo. Os dois cards do CEO não são exceção: são **o estado padrão da casa**.
>
> E isso passava **verde**: `__tests__/esteira/jornada-real.test.ts` afirmava
> `aprovacoes.every((a) => a.clientVisible === true)` — **o defeito escrito como
> se fosse o contrato**, a mesma armadilha do teste que mandava publicar peça
> sem molde. A asserção mudou de lado: o invariante agora é *nunca existe card
> visível sem corpo atrás dele*.

**Na tela:** `semConteudo` vem do **servidor** (uma fonte de verdade só — deduzir
"vazio" no cliente faria falha de LEITURA virar FATO sobre o cliente, a lição do
Drive de 07/08). Card sem corpo **perde os botões**, sai de "Aguardando você"
para a seção **"Em produção na Dioli"**, some da contagem do Início e ganha uma
explicação que **não culpa o cliente**. Card COM corpo segue idêntico.

### ✅ A terceira saída do ORÇAMENTO ("Devolver com apontamentos")

Correção de escopo: o cartão de **entregável já tinha** as três saídas. Quem só
tinha duas era o de **orçamento** — e foi por isso que, em 06/08, a devolutiva
do CEO ("mandei uma devolutiva do que tem que ser feito, e estou esperando até
agora") ficou **dois dias** sem destino.

- `POST /api/portal/pedidos/orcamento` aceita `ajustar` com `apontamento`
  **obrigatório**: vazio → **400 e NADA é criado** (nem tarefa, nem recado, nem
  mudança de estado).
- Com texto, vira **rodada nova** por `criarTarefas` — o portão do PM recusa sem
  dono e sem prazo. **Dono** sai do `agentId` da tarefa da triagem; **prazo**, de
  dias úteis declarados. Nenhum dos dois inventado.
- **Sem dono derivável a casa PARA e escala** (`precisa_decisao` +
  `ActivityEvent`) em vez de sortear responsável.
- **Não reescreve o orçamento anterior:** `quoteStatus: "ajuste_solicitado"`, e a
  próxima proposta é uma rodada nova que o cliente decide de novo.

### ✅ O título do cartão deixou de ser a transcrição crua do áudio

Ele lia *"para de óleo digital eu preciso de dois carrosseis por semana uma
seg…"* — ditado, com o reconhecedor errando "para a Dioli Digital", sem
pontuação, cortado ao meio. Agora é derivado **na LEITURA** (os títulos ruins já
estão gravados no banco; corrigir só na escrita deixaria os antigos tortos para
sempre): frase curta e pontuada vira título; texto corrido de ditado vira rótulo
honesto **"Orçamento · 06/08"**. **Nada de resumir com IA** — resumo afirma sobre
o pedido do cliente algo que ele não escreveu. O texto original continua íntegro
em "O QUE VOCÊ PEDIU".

**Portão:** `tsc` limpo, **2504 testes** em 162 arquivos, `npm run build` limpo.
Conferido nos 3 tamanhos (375/768/1440) com o portal renderizado de verdade.

### 🔴 O QUE ESTE CONSERTO NÃO FEZ — e precisa de dono

1. **A fila continua vazia do outro lado.** Com a escada em `sombra` por padrão,
   o conserto faz a casa **parar de pedir decisão** — não faz a entrega chegar ao
   cliente. **Alguém precisa decidir quais departamentos sobem de degrau**, com
   evidência. É decisão de negócio (a escada existe para isso), não de código.
2. **Os cards vazios que JÁ estão no banco de produção** continuam lá. O código
   novo impede os próximos e a tela os trata com honestidade, mas ninguém rodou
   uma limpeza — e não rodei por conta própria.
3. **Pedido do CEO NÃO atendido nesta sessão:** "Nova solicitação" no topo com
   cardápio de tipos, e a **logo do cliente** no cabeçalho do portal. Ficaram
   fora por tempo, não por decisão técnica. Sem dono ainda.


## 🟢 07/08/2026 (noite) — 99FREELAS: **ENVIO SUPERVISIONADO CONSTRUÍDO E VERDE**

**A regra oficial é do CEO** e está em `docs/decisoes.md` com as palavras dele:
o agente faz tudo — localiza, lê, elimina, pontua, precifica, escreve a proposta
individualizada e preenche a candidatura — **e para antes do clique**.

### 🔴 DUAS IMPRECISÕES NOSSAS, CORRIGIDAS. As duas eram de dinheiro.

**1. "10 propostas por mês" era generalização.** 10 é a cota do plano **Free**.
Pro tem 120, Premium tem **240**. E o nome é **conexão**, não proposta — porque
conexão é gasta **também por pergunta** e **projeto disputado custa mais de
uma**. O CEO declarou o plano: **Premium, 240**, com a procedência gravada
(declarado em conversa, **não lido da tela** — nenhum login foi feito).
**O fail closed continua intacto:** apagar `plano_declarado_da_conta` devolve o
sistema a 10 sozinho.

**2. "Embuta a taxa de 10–20%, senão a margem é corroída" estava ERRADO.**
Duas fontes independentes da plataforma dizem que a taxa é **acrescentada por
cima** e que **a oferta digitada é o que a agência recebe**. Embutir não protege
margem — só encarece a oferta final em 11% a 25% e derruba a chance de ganhar,
sem aparecer em relatório nenhum. **O que protege a margem é o piso.** A taxa
por plano, confirmada na fonte: Básico 20%, Pro 15%, **Premium 10%**.

### O que ficou construído, testado e verde

`lib/marketplaces/` — Policy Engine, Compliance Gate (`ALLOW`/`HUMAN_GATE`/
`BLOCK`), Compliance Validator, cota de conexões, contador no volume
(`ConexaoGasta` **com migration**), Pricing Engine, `BrowserComputer` e o
primeiro loop do agente. **113 testes novos**, cada trava com as duas metades.

- **`enviarProposta` é `HUMAN_GATE`**, e isso **não é falha** — é a arquitetura.
- **`login` e `contornarAntiBot` são `BLOCK`.** Nenhum login foi feito, nenhuma
  escrita no 99Freelas aconteceu.
- **Nasce em SOMBRA:** `prospeccao` entrou na escada da casa
  (`lib/agency/escada/degraus.ts`).
- **A trava de spam por repetição existe** e reprova proposta gêmea — a
  especificação do CEO não pedia.
- **A referência à comissão é barrada** — a proibição que a `00` não previa.

### A UMA LINHA DE DADO que destrava o envio

`policy.json → autorizacao_do_suporte`: `status: "autorizado"` **+**
`respondido_em` **+** `evidencia`. **As três juntas, ou não vale.** Não há flag
de ambiente, `{ forcar: true }` nem `case` no gate — **e há teste que reprova o
arquivo que voltar a ter qualquer um dos três**.

### 🔴 O QUE DEPENDE DO CEO

1. **Mandar a pergunta ao suporte do 99Freelas** — texto congelado em
   `docs/plataformas/99freelas/pergunta-ao-suporte.md`.
   **Do Gmail dele, não da agência.** Medido por DNS público em 07/08:
   `diolidigital.com.br` **não tem TXT, MX nem `resend._domainkey`** (não está
   verificado no Resend) e `dioli.studio` é **NXDOMAIN**. O `sendEmail` cairia
   em `onboarding@resend.dev`, que **só entrega para o dono da conta Resend** —
   o e-mail nunca chegaria. *(Não confirmei se `RESEND_API_KEY`/`RESEND_FROM`
   existem em produção: não há token do Railway aqui. Não muda a conclusão.)*
2. **Mandar os dois pedidos de API** — `docs/plataformas/upwork/pedido-de-api.md`
   e `docs/plataformas/freelancer/pedido-de-api.md`. **O prazo é externo:**
   análise leva dias ou semanas e, enquanto ninguém pede, o relógio não começa.
3. **Conferir o perfil da conta** — link ou contato no perfil é violação, e o
   robô chama atenção para esse perfil.
4. **O primeiro clique.** A candidatura sai pronta; ninguém a envia por ele.

### 🟠 RISCOS ABERTOS, DECLARADOS

- **A entrada do follow-up não existe.** O mecanismo está pronto e freia o envio
  quando há cliente esperando — mas o chat fica atrás do login, e login é
  `BLOCK`. Hoje a fila só enche à mão. **A sanção está mitigada em código e
  exposta na operação.**
- **Nenhuma página real do 99Freelas foi lida ainda.** O `BrowserComputer` está
  testado em unidade; a primeira leitura de verdade é a prova que falta.
- **O custo em conexões nunca foi lido de uma tela real.** Enquanto não for,
  todo envio é `BLOCK` por `Infinity` — correto, e ainda não exercitado.

## 🟢 07/08/2026 (noite) — AS CINCO PLATAFORMAS VIRARAM DADO

Da pesquisa do CEO (`docs/projetos/99freelas/02-PESQUISA-DO-CEO-plataformas.md`).
Cinco `policy.json`, lidas pelo mesmo Policy Engine. **Nenhum adaptador novo foi
construído — policy e pedidos, só.**

**Ordem de ataque:** Upwork 1 · Freelancer.com 2 · **99Freelas 3** · Workana 4 ·
Fiverr 5. O 99Freelas cai para terceiro no roadmap e continua sendo o primeiro a
ficar pronto.

**🎓 O caso-escola que o Policy Engine agora carrega:** a Freelancer.com **tem**
API oficial grande, com sandbox e SDK — **e** os Termos Gerais exigem autorização
escrita para acesso automatizado, **dizendo explicitamente que isso inclui a
própria API**. `api_available` e `api_authorization_required` são campos
**independentes**, e o segundo vale `true` quando ausente. **Ter API não é ter
permissão** — um motor que colapsasse os dois autorizaria o que os termos
proíbem, e o erro pareceria certo para quem lesse o código.

- **Workana e Fiverr proíbem crawling com todas as letras** — mais explícitas que
  o 99Freelas. Nelas `descobrir` e `lerProjeto` são **`BLOCK`**, não
  `HUMAN_GATE`: varrer já é o comportamento proibido. A entrada é texto colado ou
  e-mail encaminhado.
- **⚠️ Fiverr: a janela do Brief é de 72 h** e está gravada como dado.
  **Brief vencido é oportunidade perdida em silêncio** — a plataforma não avisa.
- **A procedência das quatro linhas novas está declarada:**
  `procedencia_das_fontes: "PESQUISA_DO_CEO"`. **Não são captura conferida por
  hash**, ao contrário da biblioteca do 99Freelas.

**A frase do CEO que vira princípio da casa:** o Opportunity Engine é **100%
automático por dentro**; o `HUMAN_GATE` entra só onde a plataforma exige.
*"Sete propostas prontas — revisar e enviar"* continua sendo automação.

**Portão:** `tsc` limpo, **2617 testes** em 164 arquivos, `npm run build` limpo.

## 🟠 07/08/2026 — FRENTE 99FREELAS: **PODE COM AJUSTE.** Dono: PM do 99Freelas

Pedido do CEO: um agente autônomo que opera o 99Freelas por navegador e envia
**10 propostas por dia**. Especificação íntegra dele em
`docs/projetos/99freelas/00-ESPECIFICACAO-DO-CEO.md` (1.458 linhas).
Não existia especialista-trava nem biblioteca desta plataforma — o mesmo buraco
que custou a conta de anúncios da Meta em 03/08. **Parecer completo, com 15
fontes capturadas:
`docs/plataformas/99freelas/pareceres/2026-08-07-agente-autonomo-de-prospeccao.md`.**

**Veredito: 🟠 PODE COM AJUSTE.** Os Termos de Uso **não proíbem automação** —
a palavra não existe no texto, nem nos Termos nem na Central de Ajuda. O que a
plataforma proíbe é conduta: spam, link externo, dado de contato, pagamento por
fora, referência à comissão. Um agente que respeita a conduta não viola cláusula
nenhuma que exista hoje.

### 🔴 O ajuste que muda o pedido do CEO: "10 por dia" não cabe em nenhum plano

O 99Freelas cobra cada proposta **e cada pergunta** em **conexões**, com cota
**MENSAL**:

| Plano | Conexões/mês | Por dia |
|---|---|---|
| Gratuito | **10** | 0,33 |
| Pro | 120 | 4 |
| Premium | 240 | 8 |

**10 por dia = 300 por mês.** Acima do teto do plano mais caro. Medalhas somam
(até +120/mês) mas se conquistam com histórico — conta nova não tem. Pior:
projeto disputado (marketing e design são os disputados) custa **mais de uma**
conexão, e **conexão gasta não volta**.

**E no plano gratuito o freelancer só pode propor depois de 24 h** da publicação
— as primeiras 24 h são exclusivas de assinantes. O scanner de 15 em 15 minutos
encontraria projetos que ainda não pode responder.

### O que mais o parecer achou, e a especificação não previa

- **Proibido fazer referência à comissão da 99Freelas** no texto. "Esse valor já
  considera a taxa da plataforma" é violação. Entra no Compliance Validator.
- **A taxa é NOSSA: 10% a 20% da oferta digitada** (mínimo R$ 5). Precificar sem
  embutir corrói a margem em toda proposta, silenciosamente.
- **Piso de preço por categoria imposto pela plataforma** (R$ 30 a R$ 100). O
  Pricing Engine aplica `max(piso da casa, piso da categoria)`.
- **Sanção de Violação por NÃO RESPONDER o cliente a tempo** — 30 dias com as
  propostas rebaixadas para o fim da fila. Um robô que envia 10 por dia e deixa
  o `AUTO_REPLY=false` do §23 constrói exatamente esse cenário. **Follow-up não
  é fase 11: é condição de não tomar punição.**
- **Banimento alcança outras contas do mesmo usuário.** Abrir segunda conta é o
  gesto que transforma suspensão em banimento definitivo.
- **Não existe API oficial** — nenhum host de desenvolvedor resolve no DNS.
  Navegador é o único caminho que existe.
- **CAPTCHA confirmado:** reCAPTCHA **e** Cloudflare Turnstile na tela de login.

### Lacunas declaradas — não deduzidas

- **Não fizemos login.** Rate limit e fingerprint do lado autenticado: **não
  confirmei**. Não há documento público do 99Freelas sobre isso.
- **Não sei qual plano a conta do CEO tem.** Todo o cálculo de ritmo depende
  disso.
- **Não sei quanto cada categoria custa em conexões.** A plataforma diz que
  varia e não publica a tabela.
- **Não sei se o perfil da conta tem link ou contato**, que é proibido pelas
  Regras para Freelancers. Precisa de conferência humana antes de operar.
- 6 das 15 fontes são artigos curtos que a régua do `capturar.mjs` reprova por
  tamanho (ela existe para barrar menu e bloqueio de robô). Em vez de afrouxar a
  régua global, vieram pela **API oficial do Help Center**, com a procedência
  declarada no cabeçalho de cada arquivo.
- **`/termos/`, `/privacidade/`, `/faq/` e `/freelancer-premium/` são
  `Disallow` no robots.txt.** A captura foi feita uma vez, à mão. **Esta
  biblioteca fica FORA da recaptura diária automática.**

### 🔴 A `01` DO CEO REBAIXA O VEREDITO NA PRÁTICA — pela regra dele mesmo

A segunda especificação (`01-ESPECIFICACAO-DO-CEO-marketplaces.md`) chegou depois
e decide o ponto que o contrato do 99Freelas deixou em silêncio:

- **§6:** não usar Playwright/Computer Use "em plataformas que não autorizem
  **expressamente** esse tipo de acesso".
- **§60:** "quando houver dúvida sobre autorização: **DO NOT EXECUTE**. Nunca:
  *'provavelmente pode'*."
- **§61:** "se a plataforma não autorizar automação: **use HUMAN_GATE**."

**O 99Freelas não autoriza expressamente.** Silêncio não é autorização. Então,
pela régua do próprio CEO:

| Operação | Decisão |
|---|---|
| Descobrir e ler projetos (área **pública**) | navegador nosso, ritmo humano — `/projects` **não** é `Disallow` no robots.txt e está no sitemap com prioridade 0.80: é o único sinal positivo da plataforma |
| Qualificar, pontuar, precificar, escrever, priorizar, CRM | **ALLOW**, 100% automático — não toca a plataforma |
| **Enviar proposta** | **HUMAN_GATE** — o clique é do CEO |
| Responder no chat | **HUMAN_GATE** |
| CAPTCHA, proxy, fingerprint, delay que imita gente | **BLOCK** |

**Isso não mata o projeto — reposiciona o clique.** É o §51 da própria `01`:
"Human Gate é parte da arquitetura", e o sistema segue automatizando tudo o mais.
E há um efeito a favor: **com 10 conexões/mês, o gargalo nunca foi o clique — era
a cota.** Um humano clicando 10 vezes por mês não atrasa nada. O HUMAN_GATE
custa quase zero hoje e compra a segurança inteira. Vira automático trocando
**uma linha de dado**, no dia em que houver autorização escrita.

**A política já está em formato de máquina:** `docs/plataformas/99freelas/policy.json`
— a primeira linha do `platform_policies` (§46/§47). O Compliance Gate lê dali,
nunca de um prompt (§48).

### 🔴 O QUE DEPENDE DO CEO — antes de o envio ser destravado

1. **Qual é o plano da conta, e o ritmo aceito.** "10 por dia" só existe com
   Premium + medalha máxima. Ou ele assina, ou o número muda. **É decisão dele,
   e por isso não escolhi um número.**
2. **Perguntar por escrito ao `suporte@99freelas.com.br` se automação é aceita.**
   É a única coisa que transforma este 🟠 em 🟢. A resposta vira fonte na
   biblioteca.
3. **Conferir o perfil da conta** — link ou dado de contato no perfil/portfólio
   é violação, e o robô vai chamar atenção para esse perfil.
4. **Ordem de provedor de IA:** a casa é Claude primeiro, OpenAI segundo
   (`lib/ai/generate.ts`); a especificação exige OpenAI (Agents SDK,
   ComputerTool). **Não troquei a ordem global** — isso afeta todos os produtos.
   Levantamento e proposta vêm no plano faseado.

### O que vem a seguir nesta frente (a fazer, com dono)

- [ ] `pm` 99freelas — `BrowserComputer` + primeiro loop real do agente
      (Playwright determinístico por padrão, Computer Use como exceção
      declarada, conforme a emenda §37 do CEO). **Não toca o 99Freelas.**
- [ ] `pm` 99freelas — Compliance Validator com a regra do link **travada**,
      somadas as 4 regras novas achadas no parecer.
- [ ] `pm` 99freelas — Pricing Engine puxando o piso da tabela da casa, serviço
      por serviço, com `max(piso da casa, piso da categoria)` e a taxa embutida.
- [ ] `pm` 99freelas — departamento em SOMBRA na escada (`lib/agency/escada/`),
      reaproveitando `lib/agency/comercial/oportunidade.ts` e `qualificar.ts`.
- [ ] `qualidade` — gate executável de **similaridade entre propostas**. Texto
      repetido é spam, spam é sanção, e a especificação não pede essa trava.
- [ ] `pm` 99freelas — teto de ritmo **lido da plataforma**, nunca do `.env`.

**Nenhuma escrita no 99Freelas nesta rodada. Nenhum login feito. Nenhuma linha
de código de produção escrita.**

## 🔴 07/08/2026 — RESOLVIDO: o Drive do cliente NUNCA funcionou em produção

**A consequência, primeiro:** desde que a feature subiu (07/08, `d0985b6`) até
`70d0275`, **nenhum cliente conseguiu conectar o Google Drive.** Não é "quase
funcionava": as tabelas não existiam no banco de produção.

**A causa:** `GoogleDriveConnection` e `DriveMaterial` entraram em
`prisma/schema.prisma` **sem migration**. Produção aplica esquema só por
`prisma migrate deploy` (`scripts/start.sh` recusa `db push` de propósito).
Medido: das 55 tabelas do schema, **exatamente estas 2** não eram criadas por
migration nenhuma. Não tinha nada a ver com o host do Railway — falhava nos dois.

> ### ⚠️ O QUE FEZ O DEFEITO DURAR: TRÊS `.catch` EM FILA
>
> O CEO viu, no mesmo cartão e ao mesmo tempo, a faixa verde "Google Drive
> conectado." e o texto "Drive não conectado." com o botão de conectar. Cada elo
> do caminho engolia a verdade e passava adiante:
>
> 1. o callback fazia `upsert(...).catch(() => null)` e devolvia a página de
>    sucesso **incondicionalmente** — o popup declarava conexão que não houve;
> 2. `GET /api/portal/drive` fazia `findUnique(...).catch(() => null)`, e a
>    falha de LEITURA saía como o FATO "você não conectou";
> 3. a faixa verde do componente vinha do postMessage (a INTENÇÃO do popup),
>    não do banco — duas fontes de verdade no mesmo cartão.
>
> **A lição:** `.catch(() => null)` posto para "não derrubar a página" converte
> falha de infraestrutura em afirmação falsa sobre o cliente. Os três eram
> defensáveis isoladamente; em fila, produziram uma feature morta que se
> anunciava viva por um mês.

**Consertado nos quatro lugares** (`70d0275`): a migration (só CREATE TABLE —
ver abaixo), porta fechada no callback, leitura honesta (503 nomeado) no portal,
e a faixa passa a usar a palavra do SERVIDOR.

**A trava para a classe inteira:** `__tests__/plataforma/schema-sem-migration.test.ts`
reprova qualquer modelo do schema que nenhuma migration crie. "Lembre de gerar a
migration" é sugestão — e foi essa sugestão que falhou: em dev o `db push` deixa
tudo verde enquanto a produção fica sem a tabela.

### 🟠 Dívida declarada, NÃO consertada: `ClientAiProvider` está fora do lugar

`prisma migrate diff` também propõe **RECONSTRUIR** `ClientAiProvider` (PRAGMA
foreign_keys=OFF → CREATE new → INSERT SELECT → DROP → RENAME), por uma
divergência de chave estrangeira **anterior a esta frente**. Ficou **de fora**
do conserto de urgência: reconstruir tabela num SQLite em volume, com o CEO
parado, é exatamente o risco que o passo 3.5 do `start.sh` existe para cobrir.

- [ ] `plataforma` — migration própria para a divergência de `ClientAiProvider`,
      em janela calma, com a cópia pré-migration conferida.

## ✅ 07/08/2026 — Os links de portal saem de PRODUÇÃO

`GET /api/admin/links-do-portal`, autenticada pelo **mesmo `CRON_SECRET`** das
rotas de cron (`Authorization: Bearer`). O script exigia o banco de produção, que
ninguém alcança — o SQLite mora num volume dentro do contêiner.

- **A regra é uma só:** saiu do script e virou `lib/agency/esteira/links-do-portal.ts`,
  usada pelos dois. Teste reprova o script que voltar a emitir token por conta própria.
- **Não emite por padrão** (`?emitir=1` é explícito) e **nunca revoga** token vivo.
- **Conferido em produção** (`70d0275`): sem segredo → **401** `{"error":"Unauthorized"}`;
  rota inexistente → 404, o que prova que o 401 é "viva e fechada".
  O 401 (e não 503) também prova que **`CRON_SECRET` existe em produção**.

## ✅ 07/08/2026 — O material do Drive CHEGA na peça (foto e logo)

Até `43bf31e`, o cliente conectava a pasta e **a peça saía igual**:
`fotosReaisDoCliente` não tinha um chamador no app, `montarArteComFotoDoCliente`
só era chamada por teste, e o molde **não tinha campo para imagem de logo**.

**A regra de escolha é derivada do CONTEÚDO, não um interruptor global**
(`lib/agency/design/escolha-de-foto.ts`). Duas razões, ambas obrigatórias:

1. **Papel** — cada `FUNCOES[papel]` declara `materiaisReais`, derivado do
   `imagemPrecisa` que ele já declarava. `prova` admite captura de tela;
   `mecanismo`, a tela do produto; `acao`, o local. **`gancho`, `tensao`,
   `capa`, `materia` e `fechamento` declaram lista VAZIA** — ninguém sobe ao
   Drive a foto do próprio problema.
2. **Assunto** — desempate por lastro léxico entre o nome do arquivo (a palavra
   do cliente) e o texto daquela tela.

**Empate ou lastro zero NÃO escolhe:** gera por IA e declara o que havia. É a
lição de 04/08 — "sobra não é evidência de correspondência".

**O logo real assina** (`Molde.logo`, data URL): ocupa o lugar do monograma, que
sempre foi o substituto declarado dele. **Sem logo, a falta é declarada e nada é
desenhado.**

### O que esta frente NÃO faz (declarado, não escondido)

- **Post avulso quase nunca usa foto real, por decisão.** Ele não declara papel
  de imagem, então falta uma das duas razões e a régua fica mais estrita. Um
  `SocialPost` com papel declarado resolveria — não existe hoje.
- **`BrandBrain` continua sem ser alimentado pelo Drive.** O manual de marca
  entra como arquivo, não como cor/fonte extraída. A peça usa foto e logo; cor e
  tipografia ainda saem só do cadastro.
- **Nenhuma peça foi produzida em produção com este código ainda.** A prova é em
  teste (bytes e DOM). A primeira peça real é a prova que falta.


## 🔴 07/08/2026 — FRENTE DE VÍDEO: **CapCut NÃO PODE ser conectado.** Dono: PM de vídeo

Pedido do CEO: *"vídeo, vamos conectar o CapCut"*. O especialista-trava do
TikTok/ByteDance entrou antes de qualquer código, como manda a regra de 03/08.
**Parecer completo, com fontes: `docs/plataformas/tiktok/pareceres/2026-08-07-capcut.md`.**

**Veredito: NÃO PODE**, por dois motivos independentes, cada um suficiente:

1. **Não existe API pública do CapCut.** Medido em 07/08: `developer.capcut.com`,
   `open.capcut.com` e `api.capcut.com` **não têm registro de DNS**; o rodapé do
   capcut.com não tem link de desenvolvedor; o catálogo da TikTok for Developers
   não tem produto de edição. `capcut.com/business` **redireciona para
   `pippit.ai`** — "CapCut for Business" virou Pippit, que também não publica API.
2. **Os Termos do CapCut proíbem automação, com todas as letras.** §5, *"You may
   not: use automated scripts or other technologies to collect information from
   or **otherwise interact with** the Services"*
   (`fontes/capcut-termos-de-servico.md`, atualizado em 15/04/2026). Não é
   proibição de scraping — é proibição de *interagir* por automação.

**O que os Termos NÃO proíbem:** um **humano** da agência operar o CapCut em nome
de um cliente que a autorizou. Isso é expressamente previsto no §1. A linha que
separa pode de não pode é **automação**, não "em nome de terceiro".

**O único caminho oficial de edição programável da casa ByteDance** é o
**BytePlus Video Editor SDK** (`fontes/byteplus-video-editor-sdk.md`) — e ele
**não serve**: é SDK **iOS/Android**, 100% no dispositivo, para embutir um editor
na tela de um humano dentro de **um app que a Dioli teria que construir**. Não é
API de servidor. Licença anual sob consulta comercial, sem preço público.

> **Lacunas declaradas, não deduzidas:**
> - **A versão BRASILEIRA dos Termos não foi lida.** O CapCut serve o documento
>   por geo-IP; este ambiente sai por IP dos EUA e as 5 tentativas de forçar
>   região devolveram o mesmo texto ("All United States Users", contraparte
>   TikTok USDS Joint Venture LLC). Não afirmo que o texto brasileiro é idêntico.
> - **A página `pippit.ai/developer` (HTTP 200) não pôde ser lida** — é SPA em
>   JavaScript e este ambiente não tem navegador. É a **única** coisa que
>   poderia mudar o parecer, e fecha em 30 segundos com o CEO logado.

### O estado REAL do vídeo nesta casa, conferido (não repetido)

- **11 roteiros prontos e ENTREGUES**, em `docs/projetos/foocci/roteiros-video.md`
  (641 linhas): 6 reels + 1 vídeo longo + 4 vídeos de SDR. Já estão no card de
  aprovação da Foocci desde 06/08.
- **O editor de vídeo EXISTE e RODA.** `lib/agency/media/video.ts`, ligado ao
  pipeline em `lib/agency/execution/artes.ts:160` (`format === "reel" |
  "video"` → `montarReel`). `ffmpeg` está na imagem de produção
  (`railpack.json → deploy.aptPackages`). **`__tests__/media/video.test.ts`:
  13/13 verde, rodando ffmpeg de verdade nesta sessão.**
- **O que ele faz:** corte, enquadramento 9:16 sem distorcer, normalização de
  áudio (−16 LUFS), capa, `+faststart`.
- **O que ele NÃO faz:** legenda queimada, trilha, transição, cartela. Nenhuma
  dessas existe hoje — todas são construíveis com o ffmpeg que já está lá.
- **O gargalo NÃO é a ferramenta, é o MATERIAL.** `montarReel` só produz se o
  cliente já tiver enviado vídeo bruto (`MediaAsset kind: "inbound"`,
  `mimeType: video/*`). Sem vídeo, ele devolve *"o cliente ainda não enviou
  nenhum vídeo para editarmos"* e **não gasta tentativa** — corretamente. Em
  produção a única porta de entrada de vídeo bruto é `/api/media`; a do Google
  Drive existe em código mas está **travada** (ver seção do Drive abaixo).
- **Não confirmei que um único reel tenha sido produzido em produção.** Não há
  acesso ao banco de produção desta sessão. O que se sabe é coerente com zero:
  em 07/08 a fila foi medida vazia (0 pedidos abertos, 0 chamadas de IA em 24 h).

### 🔴 O QUE DEPENDE DO CEO

1. **Aceitar que CapCut vira fluxo HUMANO, não integração.** A agência monta o
   template à mão e o cliente aplica. É trabalho de gente, não escala com o
   relógio de 5 minutos. Se ele quiser volume, o caminho é o ffmpeg, não o CapCut.
2. **Legenda queimada: decisão de risco, não de engenharia.** Texto dentro do
   pixel **escapa do piso de verdade desta casa**, que lê texto e não enxerga
   imagem (está escrito no cabeçalho de `lib/agency/media/video.ts`). Num piloto
   100% IA sem revisão humana, ligar isso sem conferir o texto contra fonte
   declarada é regressão de segurança. **Não construir antes de decidir.**
3. **Transcrição custa dinheiro** (Whisper/OpenAI, por minuto de áudio) e é
   pré-requisito de legenda automática. Ferramenta paga = decisão dele.
4. **Material do cliente.** Sem vídeo bruto no portal, o editor não tem o que
   editar. É o furo que trava a frente inteira, e é pedido, não código.

### O que vem a seguir nesta frente (a fazer, com dono)

- [ ] `pm` de vídeo — fechar a lacuna do `pippit.ai/developer` com o CEO logado.
- [ ] `pm` de vídeo — reconferir a §5 dos Termos por IP brasileiro quando houver
      como. Enquanto não houver, a citação vale para o contrato dos EUA.
- [ ] `departamentos` — biblioteca de templates de CapCut montados à mão,
      por campanha, entregues como link ao cliente.
- [ ] `departamentos` + `qualidade` — cartela de abertura/fim via ffmpeg
      `concat` reaproveitando `lib/agency/design/renderizar.ts` (HTML→imagem já
      existe e já confere o texto no DOM — é o caminho que **não** cega o gate).
- [ ] `qualidade` — **antes** de qualquer legenda queimada: a trava que confere
      o texto do pixel contra fonte declarada. Sem ela, não construir.

**Nenhuma escrita em plataforma nenhuma nesta frente. Nada foi integrado.**

## ✅ 07/08/2026 — FECHADO: o molde da marca nunca rodou em produção

**A consequência, primeiro:** de quando o motor de molde entrou até 07/08/2026,
**toda peça de todo cliente saiu como foto crua de IA** — sem tipografia, sem
selo, sem assinatura. E o sistema relatou isso como entrega bem-sucedida, peça
por peça.

**A causa:** `playwright` estava em `devDependencies`. Produção instala com
`--omit=dev`, então `await import("playwright")` falhava sempre;
`renderizarHtml` devolvia `sem_navegador`; e `comporComMolde` tratava isso como
"degradação declarada", gravando a foto crua com a explicação em `lastError` —
campo que ninguém lê antes de publicar.

> ### ⚠️ O MEIO-CONSERTO QUE A CASA PRECISA SABER QUE ACONTECEU
>
> **Mover `playwright` para `dependencies` NÃO era o conserto.** Foi o primeiro
> commit desta frente e, sozinho, teria dado sensação de resolvido sem resolver:
> o npm passa a instalar a BIBLIOTECA, mas **não baixa o binário do Chromium**.
> Sem binário, `chromium.launch()` continua falhando e a peça continua saindo
> crua — exatamente a consequência que se queria matar.
>
> Um conserto de dependência que não provisiona o executável é meio conserto.
> Foram precisas **três** partes:
>
> 1. **A biblioteca** — `playwright` em `dependencies` (conferido: ela chega em
>    `.next/standalone/node_modules/playwright`).
> 2. **O BINÁRIO** — `railpack.json → deploy.aptPackages` passa a instalar
>    `chromium`, ao lado do `ffmpeg` que já estava lá. Escolhido em vez de
>    `npx playwright install chromium` no build porque o pacote apt faz parte da
>    IMAGEM: sobrevive a redeploy sem depender de cache e não acrescenta ~500MB
>    de download por build. `renderizar.ts` acha `/usr/bin/chromium` **sem exigir
>    variável de ambiente** — pedir configuração para a peça sair certa é a
>    armadilha do ffmpeg, que some em silêncio.
> 3. **A PORTA FECHADA** — sem as duas acima, o código voltaria a entregar foto
>    crua chamando aquilo de sucesso. Agora falha de INFRA (`sem_navegador`,
>    `erro_do_navegador`, `timeout`) devolve `ok: false`: a peça não é gravada
>    nem publicada, e a causa sobe nomeada. Falha de CONTEÚDO (texto que não
>    cabe, sem frase utilizável) segue degradando declarado.
>
> **A lição, que vale além desta frente:** havia um teste VERDE afirmando que a
> peça sem molde deve ser publicada (`__tests__/execution/artes.test.ts`). O
> fail-open não estava só no código — estava protegido por prova. Quando a
> checagem descreve o defeito como se fosse o contrato, consertar o código não
> basta: o teste tem de mudar de lado, e o commit tem de dizer por quê.

**Dívida declarada que sobrou:** `/usr/bin/chromium` (apt) é um Chromium de
sistema, não o build que o Playwright baixa. A combinação é suportada via
`executablePath`, mas **não foi exercitada em produção ainda** — a primeira peça
produzida depois do deploy é a prova que falta. Se falhar, o erro agora aparece
como falha nomeada em vez de peça crua silenciosa, que é o ponto.

## ✅ 07/08/2026 — FECHADO: porta de emergência do deploy, e as 6 rotas fora da conta

- **A porta de emergência não abria.** Falhou nas DUAS emergências reais (06 e
  07/08) com "Bad Access": o token de PROJETO do Railway recusa
  `environmentTriggersDeploy` e `deploymentTriggerUpdate`. Na segunda, com o
  GitHub Actions em pane e o portal do cliente quebrado, o conserto subiu à mão.
  `dispararDeploy()` passa a usar `serviceInstanceDeployV2(serviceId,
  environmentId, commitSha)` — que o mesmo token aceita. Ganho extra: ela **não
  passa pelo "Wait for CI"**, então o script não precisa mais desligar o portão
  para disparar e religar depois. Aquela janela deixava a produção sem CI e
  ficava aberta **para sempre** se o processo morresse no meio.
- **As 6 rotas de `app/api/agents/*` contornavam o motor de IA.** Montavam o
  `fetch` para a Anthropic na mão. Perdiam a CONTA (nenhum `AIRunLog` — o gasto
  existia na fatura e não no relatório), a ESCOLHA DE PROVEDOR POR CLIENTE
  (`ClientAiProvider` ignorado: cliente fixado no Gemini era atendido pelo
  Claude) e a RESERVA. Todas passam por `generate()` agora, com trava em
  `__tests__/plataforma/rotas-passam-pelo-motor.test.ts` para a 7ª rota.

**Furo declarado, NÃO resolvido:** `social/generate` e `design/generate` aceitam
`clientId`/`projectId` como opcionais porque as telas ainda podem não mandá-los.
Quando não vêm, o custo entra na conta **sem cliente**. Ausência de informação
não é informação: está anotado, não preenchido por inferência. Quem for mexer
nessas duas telas fecha isto junto.

## 🟡 07/08/2026 — GOOGLE DRIVE DO CLIENTE: **EM PRODUÇÃO**, feature TRAVADA no CEO

O material de marca do cliente (logo em arquivo, fotos reais, manual, captura de
tela) já tem caminho: portal → escolha do cliente → esteira.

**Subiu em 07/08/2026, commit `d0985b6`** — merge de `claude/dioli-pm-role-pow56e`
na branch de produção, pelo caminho normal (push → CI verde → Railway). O portão
"Wait for CI" estava LIGADO e funcionou: a implantação esperou o workflow
`quality` concluir antes de subir. **A porta de emergência não foi usada.**

Prova em produção, não "deploy verde": `/api/health` responde `commit: d0985b6`,
e as rotas que só existem neste commit respondem —
`/api/portal/drive` **401** (viva e fechada, exige sessão do portal),
`/api/portal/drive/conectar` e `/api/google/drive/callback` **200**. Rota
inexistente devolveria 404; é isso que separa "subiu" de "foi disparado".

**O card "Google Drive" saiu de "EM BREVE"** — `DriveDoCliente` está montado em
`ConexoesDoCliente.tsx:369` e não há mais nenhum "EM BREVE" em
`components/portal/`.

**O que trava, e é do CEO:**

1. **Publicar o app OAuth** no Google Cloud Console (Tela de permissão OAuth →
   "PUBLICAR APP"). Com o app em "Teste", o refresh token do cliente **morre em
   7 dias** e a conexão quebra sozinha parecendo defeito nosso
   (fonte: `docs/plataformas/google/fontes/oauth2-tokens-e-expiracao.md`).
   Como o escopo é `drive.file` (não sensível), **não há verificação
   obrigatória** — é um clique.
2. **Registrar o redirect URI** `https://www.diolidigital.com.br/api/google/drive/callback`.
3. **Ativar Drive API + Picker API** e criar uma chave de API de navegador
   (`GOOGLE_PICKER_API_KEY`) + anotar o número do projeto (`GOOGLE_PROJECT_NUMBER`).

Sem (3), o portal já diz a verdade: botão de escolher arquivos indisponível com
"avise a agência — não é problema da sua conta". Nada finge funcionar.

> ⚠️ **Não conferi as variáveis do Railway nesta sessão** — não havia token do
> Railway neste ambiente. Então **não sei dizer se `GOOGLE_CLIENT_ID`,
> `GOOGLE_PICKER_API_KEY` e `GOOGLE_PROJECT_NUMBER` já existem em produção.**
> O código está no ar e é fail-closed: sem elas o cliente vê a mensagem honesta,
> não um botão quebrado. Ausência de informação não é informação — quem tiver o
> token confere antes de dizer ao CEO que o Drive "está funcionando".

Parecer completo, com fontes: `docs/plataformas/google/pareceres/2026-08-07-drive-do-cliente.md`.

**Dívidas declaradas do mesmo bloco:**
- O par foto→peça continua sendo escolha explícita (`montarArteComFotoDoCliente`),
  como manda a lição de 04/08 ("sobra não é evidência de correspondência"). A
  oferta existe (`fotosReaisDoCliente`); quem casa arquivo com peça, não.
- `BrandBrain` e `ClientKnowledgeSnapshot` ainda não são alimentados pelo
  material do Drive — o manual de marca entra como arquivo, não como cor/fonte
  extraída.
- `__tests__/esteira/passagem-do-pedido.test.ts` falha por data fixa no teste
  (falha JÁ em `c48d635`, antes deste trabalho).

## 🔵 07/08/2026 (madrugada) — O RELÓGIO ESTAVA CERTO; QUEM ESTAVA ERRADO ERA O DIAGNÓSTICO

Ordem do CEO: *"amanhã quando eu voltar eu quero essa agência produzindo, sem
parar."* O diagnóstico que entrou na sessão dizia que a produção roda pelo cron
do GitHub e que ele dispara de 64 a 203 minutos em vez de 10. **Os dois fatos
são verdadeiros e a conclusão não era.**

**O relógio de produção desta casa NÃO é o GitHub.** É o `despertador`
(`lib/agency/despertador.ts`), que roda DENTRO do servidor, a cada 5 minutos,
ligado no boot pelo `instrumentation.ts`. Conferido em produção: `DESPERTADOR`
não está setada (logo, ligado) e o log do container traz
`[despertador] ligado — … a cada 5 min`. O workflow `cron-execute.yml` é o
REFORÇO de fora, e é ele — só ele — que roda 12× menos do que está escrito.
Trocar o GitHub por um cron do Railway não melhoraria nada e pioraria uma coisa:
`cronSchedule` no Railway transforma o serviço num job que **roda e sai** — ligá-lo
no serviço web tiraria o site do ar.

### O buraco que existia mesmo: o relógio batia SEM TESTEMUNHA

Uma rodada em que nada acontecia não escrevia uma linha — e é exatamente isso
que "o relógio morreu" também produz. Os dois estados eram indistinguíveis de
fora. Pior: cada perna da rodada engole o próprio erro num `console.log` (certo,
para não derrubar as outras), e o log do container é rotativo, some no deploy
seguinte e ninguém o lê às 7 da manhã.

- **`lib/agency/pulso.ts`** — uma linha por batida no volume: o que a rodada
  moveu e o que quebrou. Nunca lança: o registro do relógio não pode ser o que
  para o relógio.
- **`GET /api/pulso`** — bateu? moveu? quebrou? Protegida (sessão ou
  `CRON_SECRET`). `/api/health` responde se o PROCESSO vive, que é outra pergunta.
- **Faixa `PulsoDaAgencia` no topo de `/agency/dashboard`** — e ela **não some
  quando está verde**, ao contrário da fila de avisos. Aqui o silêncio é o que
  precisa ser desmentido.
- **`lib/agency/vigia-da-madrugada.ts`** — às 03h de São Paulo fecha a noite em
  `ActivityEvent`: um vermelho por falha e por achado grave, e um fechamento que
  **sai também na noite limpa**. Mora dentro do relógio da casa, e não no
  `raio-x-noturno.yml`, porque o Actions estava em **pane declarada** — alarme
  hospedado no provedor que cai não toca no dia em que faria falta.
- **Falha de publicação virou notícia.** `lastError` era um campo dentro de um
  post: para vê-lo era preciso já suspeitar. Agora o primeiro erro (e só a
  MUDANÇA de motivo, senão seriam 288 linhas iguais por dia) vira
  `ActivityEvent`.

### 🔴 A NOTÍCIA QUE O CEO PRECISA OUVIR: a fila está VAZIA

Medido em produção (`POST /api/cron/raio-x`, só leitura, 07/08 00:10 UTC):
`pedidosDoClienteAbertos: 0`, `postsRascunho: 0`, `chamadasDeIA24h: **0**`.
**A casa não fez uma única chamada de IA em 24 h.** O gargalo não é o relógio:
é que **não há trabalho na esteira**. Agência acionada sem fila produz zero, e
zero com o relógio perfeito continua sendo zero.

### 🔴 Os 6 carrosséis da Foocci vão FALHAR hoje às 07h — e é o certo

Os 6 posts estão `scheduled` (o primeiro em `2026-08-07T10:00Z` = 07h BRT) e
**`mediaUrls` está vazio nos 6** — as 36 telas nunca foram ligadas aos posts
(o backfill continua dependendo do CEO). `publicarAgendados` vai parar em
"o carrossel ainda não tem as artes das telas", **antes de qualquer chamada à
Meta**, e re-tentar a cada 5 min sem nunca ir ao ar. Até agora isso seria
silencioso; a partir deste commit vira linha no painel.

> ⚠️ **Achado que vale por si:** `publishPost` (`lib/integrations/meta/client.ts`)
> **não consulta `MetaAtivoAutorizado`**. A trava de ativos cobre leitura de ads,
> gravação de conexão e escrita de anúncio — **não cobre publicação orgânica**.
> Hoje o que segura os 6 posts é a falta das telas, não uma trava. Com o backfill
> aplicado, a casa publicaria sozinha no @foocci_ — contra a ordem "nada publica
> na Meta sozinho". **Não foi consertado nesta sessão** (mexer na publicação
> exige parecer do especialista `meta`); fica como a próxima trava a construir.

**Portão rodado À MÃO** (Actions em pane): `npx tsc --noEmit` limpo,
`npx vitest run` **2308/2308** em 146 arquivos, `npm run build` limpo.
Conferido nos 3 tamanhos (375/768/1440) com o painel renderizado de verdade.

## 🟢 06/08/2026 — Decisões do CEO, fechadas em conversa

- **As 19 conexões de terceiros: MANTIDAS.** São produtos do próprio CEO em
  stand-by (Sushi Cazza, Dilee, Kero Shop, Acesso Beleza, santioh_, dilix.br,
  queise, Santioh Europe, Spa da Mente, City Jobs SP). Elas entraram em 03/08
  pelo fluxo de token colado, que gravava tudo o que o token alcançava.
  **A porta já foi fechada** (`lib/integrations/meta/escolha-de-ativos.ts`): hoje
  nada é gravado sem marcação explícita. As 19 seguem no banco **sem
  autorização** — o sistema não lê nenhuma delas. Apagar destruiria o token e
  exigiria colar de novo caso virem clientes; manter é reversível, apagar não.
- **A campanha parada da Foocci foi DELETADA pelo CEO.** Era "Nova campanha de
  Leads — Cópia", ativa com R$ 25/dia e zero entrega em 30 dias (`start_time`
  voltava como epoch zero — nunca começou). Risco de R$ 750/mês encerrado.
- **Configuração de Login para Empresas criada** — id `1985152182184882`, já em
  `META_LOGIN_CONFIG_ID` na produção. É o que tira o diálogo do fluxo clássico
  de `scope`, causa do "Invalid Scopes" que o CEO levou na cara em 06/08.
- **Deploy só com CI verde: AUTORIZADO**, com porta de emergência registrada.
  Falta o CEO ligar "Wait for CI" no painel do Railway — conferido por API que
  o campo **não é exposto** em `ServiceInstanceUpdateInput`; é clique de painel,
  não falta de acesso.


> Última atualização: 05/08/2026 (raio-x noturno virou mecanismo — os achados
> abaixo saíram da primeira coleta e cada um tem dono).

---

## 🔴 06/08/2026 (noite) — O PORTÃO DO DEPLOY ESTÁ CONSTRUÍDO E **NÃO ESTÁ LIGADO**

Ordem do CEO: *deploy só com CI verde, com porta de emergência declarada.*
O mecanismo está pronto, testado e documentado (`docs/deploys/portao.md`).
**Falta um clique — e ele não é meu.**

**O caminho escolhido, conferido na documentação do Railway** (não de memória):
o recurso **"Wait for CI"** do próprio Railway (`checkSuites` no
`DeploymentTrigger`, `docs.railway.com/deployments/github-autodeploys`). Com ele,
o push cria a implantação em **WAITING**, ela vira **SKIPPED** se algum workflow
falhar, e só sobe com tudo verde. Preferido ao caminho "desligar o autodeploy e
deployar de dentro de um workflow" porque este último **não funciona no dia da
pane** — workflow que deploya só deploya se o Actions estiver de pé, e foi
justamente o Actions que caiu.

### 🔴 O QUE DEPENDE DO CEO — e sem isso nada disto protege

1. **Ligar o portão.** Railway → projeto Dioli Digital → serviço `diolidigital`
   → Settings → Source → **Wait for CI**. Ou, com um token de conta:
   `RAILWAY_TOKEN=<token> npm run portao -- --ligar`.
2. **Um token de CONTA do Railway.** O token de projeto que eu tinha **só lê**.
   Ele recusou com `Bad Access` as três mutações que importam:
   `deploymentTriggerUpdate` (ligar o portão),
   `serviceInstanceAutoDeployUpdate` e `environmentTriggersDeploy` (disparar o
   deploy — a porta de emergência). **Sem esse token a porta de emergência não
   abre**, e é ela que garante subir num dia de pane.

**Enquanto o item 1 não acontecer, o Railway continua subindo todo push sem
olhar a CI — exatamente como hoje de manhã.** `npm run portao` responde isso em
uma linha, e sai vermelho.

### O que foi construído

- **Uma régua só de "o que conta como verde"** (`julgarProva`, em
  `lib/plataforma/sentinela-do-deploy.ts`). O sentinela e a porta de emergência
  usam a mesma — duas cópias é como "sem prova" volta a contar como verde de um
  lado só. `success` aprova; cancelada, estourada, pulada, em andamento e
  **inexistente** caem em `SEM_PROVA`, e a mensagem diz qual dos casos é.
- **A porta de emergência** (`npm run deploy:emergencia`, com `--ensaio`).
  Não abre sem `--quem`, sem `--motivo` de 20+ caracteres e sem `--confirmo`;
  **recusa** quando o commit já tem CI verde (porta usada com o portão aberto é
  como ela vira o caminho normal); e **grava o registro ANTES de disparar** — se
  não deu para registrar, não sobe. O rastro fica em
  `docs/deploys/emergencias.md`.
- **O sentinela saiu da frente do deploy.** Ele rodava no push; com o portão
  ligado, workflow vermelho descarta a implantação — e o sentinela fica vermelho
  justamente quando a produção está ruim. Isso trancaria o conserto do lado de
  fora. Agora ele roda de hora em hora e denuncia por issue. **Custo declarado:**
  a conferência pós-deploy deixa de ser imediata.
- **`ci.yml` passou a nomear a branch de produção** no `on: push`. O Railway só
  reconhece como portão um workflow cujo `branches:` ele consegue casar; portão
  ligado sem workflow para esperar aprova tudo com cara de trava. `npm run portao`
  sai vermelho nesse estado.

### O que ficou provado, e o que não

- ✅ **A régua, contra o GitHub real:** commit `0ce8ea2` (o que está em produção)
  tem CI verde e sai `APROVADO` — com SHA curto **e** completo. Com o Actions em
  **major outage neste momento**, CI verde continua verde: a pane não apaga prova
  que existe.
- ✅ **As duas metades da porta**, com o script rodando de verdade: sem motivo →
  recusa e sai 1; motivo curto → recusa; commit já aprovado → recusa e ensina o
  caminho normal; com quem+motivo+confirmação num dia de pane → **libera**.
  36 testes verdes em `__tests__/plataforma/porta-de-emergencia.test.ts`.
- 🔴 **NÃO ficou provado que o portão segura de verdade** — não consegui ligá-lo
  (token só lê). O comportamento do "Wait for CI" está afirmado pela
  documentação do Railway, não medido nesta casa.
- 🔴 **NÃO ficou provado o disparo do deploy.** `environmentTriggersDeploy`
  recusou. A produção **não foi tocada** nesta sessão.
- 🟠 **Defeito achado testando de verdade, e corrigido:** o registro era gravado
  antes do disparo (certo) e nunca voltava para dizer que o disparo **falhou** —
  ficava no arquivo uma linha com cara de subida que não aconteceu. Agora toda
  entrada termina com o resultado. A entrada do teste em
  `docs/deploys/emergencias.md` está anotada com todas as letras.

---

## 🔴 06/08/2026 — App Review da Meta: dossiê pronto, 1 bloqueio no colo do CEO

Dossiê completo em **`docs/plataformas/meta/app-review.md`**: estado do app
medido por API, auditoria permissão-a-permissão contra o código, textos de
justificativa em inglês prontos para colar, roteiros dos 6 vídeos e o caminho
que o revisor percorre.

**O bloqueio nº 1, e ele reprova o envio INTEIRO:** `META_LOGIN_CONFIG_ID` não
existe no Railway. App tipo Business usa Login para Empresas, que exige
`config_id` e recusa `scope` — o revisor não consegue completar o login, e
"app não testável = envio rejeitado" (fonte: `fontes/app-review-processo.md`).

**Consertado nesta sessão:**
- O callback de exclusão de dados devolvia à Meta `https://diolidigital.com.br/…`
  — o **apex, que não tem DNS**. Conferido ao vivo em produção antes do
  conserto. É o link que o revisor clica. Agora sai do host da requisição.
- O mesmo arquivo gravava "conexões Meta associadas removidas" **sem remover
  nada**. Virou registro honesto de pendência humana (o banco não guarda o
  `user_id` da Meta; cabe em `metaJson`, sem migration).
- **Tela nova `/agency/desempenho-pago`**: a leitura de tráfego pago existia só
  como rota de API. Sem tela, a Meta não consegue exercitar `ads_read` /
  `ads_management` e reprova as duas.

**3 permissões recomendadas para TIRAR** (zero uso em código):
`instagram_manage_comments`, `pages_manage_metadata`, `business_management`.

**Buraco inverso:** `client.ts:201,207` publica em Página do Facebook e exige
`pages_manage_posts`, que **não é pedida** — publicação orgânica em Página é
código morto hoje.

**Portão rodado À MÃO** (GitHub Actions em pane): `vitest` 139/139 arquivos,
2206/2206 testes; `tsc --noEmit` limpo; eslint sem erro novo.

## ✅ 06/08/2026 (noite) — As duas rotinas órfãs ganharam agendamento

Código sem agendamento é promessa, não mecanismo. Duas rotinas existiam e
**ninguém as chamava**:

- **Raio-X noturno — `03:00 BRT` (06:00 UTC)**, `.github/workflows/raio-x-noturno.yml`.
  Foi afirmado ao CEO que ele rodava toda noite; **não rodava** — a única coleta
  em `docs/raio-x/coletas/` era a de 05/08, feita à mão. Agora roda as duas
  metades (código no repositório + dados da produção) e **commita a coleta**.
- **Régua de recompra 30/60/90 — `07:00 BRT` (10:00 UTC)**,
  `.github/workflows/cron-recompra.yml` → `POST /api/cron/recompra`. Idempotente:
  segundo disparo no mesmo dia devolve `registrados: 0`. Não manda WhatsApp —
  produz rascunho em `/api/avisos`.

**Dois defeitos consertados nos workflows que já existiam** (`cron-radar`,
`cron-execute`):

1. `CRON_SECRET` ausente saía com **exit 0** ("pulei") — workflow que nunca
   chamou nada se declarando saudável. Agora é vermelho.
2. **503 passava verde.** As quatro rotas de cron só devolvem 503 quando
   `CRON_SECRET` não existe **no servidor** — morte silenciosa do cron, não
   instabilidade. Agora 503 com a frase de configuração é vermelho; 503 do edge
   (deploy em curso) fica em aviso.

**Lacuna declarada:** o `workflow_dispatch` manual não pôde ser executado desta
sessão — o token desta integração não tem `actions: write`
(403 "Resource not accessible by integration"). O que foi provado: as rotas de
produção respondem (401 com segredo errado = viva e fechada), os dois caminhos
de falha do workflow saem 1, e o guarda do raio-x acende com a metade de dados
cega. **A primeira execução real é a agendada.**

## 🟠 06/08/2026 (noite) — A AGÊNCIA ESTAVA ORÇANDO TRABALHO QUE JÁ TINHA ENTREGUE

Dois defeitos pegos pelo CEO no portal do celular. O segundo é de dinheiro.

**1. O cartão escondia o que o cliente escreveu.** Aparecia só o título
truncado; o texto dele não aparecia em lugar nenhum. Agora o cartão mostra
**"O QUE VOCÊ PEDIU"** com o texto inteiro (recolhido a 3 linhas, com "ver
mais") **acima** da resposta da agência — é assim que ele confere se foi
entendido, e é o que torna o preço auditável por quem paga. Mesma correção na
caixa de entrada da agência: a lista mostra as palavras do cliente, não o
título derivado.

**2. A triagem lia o ASSUNTO e não lia o VERBO.** O pedido
`cmsg7anke00030ps260acx43s` dizia "**preciso do roteiro com as falas** para
produzir os videos" e voltou como **"1 Reel — R$ 350"**. Três erros de uma vez:
insumo classificado como peça final, quantidade no plural virando 1, e o
roteiro **já entregue** (`docs/projetos/foocci/roteiros-video.md`) sendo
cobrado. O que mudou, em mecanismo:

- **A carta de atendimentos declara o que sai.** Cada linha tem `entrega`
  (`insumo` | `peca`) e `cobre` (`1` | `pacote`). "Roteiro de vídeo" e "Reel
  produzido" viraram atendimentos **separados** — antes eram o mesmo id, com o
  preço do reel.
- **Leitura léxica do texto do cliente, sem IA**
  (`lib/agency/esteira/leitura-do-pedido.ts`). Pediu INSUMO e o modelo escolheu
  PEÇA FINAL → `precisa_decisao`. Texto ambíguo (pede os dois) →
  `precisa_decisao`. A trava não depende de o modelo acertar: foi ele que errou.
- **Quantidade não contada NÃO vira 1.** Plural sem número, ou duas contagens
  diferentes, ou número maior que o item de tabela → para e pergunta, com as
  palavras dele na mensagem.
- **Roteiro avulso não tem preço de tabela — e preço que não existe não se
  inventa.** O atendimento tem `itemDeCatalogo: null`, o que **para** e manda a
  equipe orçar.
- **Rota nova para consertar triagem que já saiu errada** (`PATCH
  /api/messages/pedidos`): `cancelar_orcamento` (tira o número da frente do
  cliente, com motivo obrigatório) e `entregar` (peça feita fora da máquina vira
  entrega visível no portal). Antes não havia caminho: `triado` não volta para
  `novo` e "recusar" apagaria o pedido legítimo junto com o erro.

As duas metades testadas: "preciso do roteiro" **não** vira reel; "quero um reel
pronto" continua virando reel, sem atrito, com o preço da tabela. Conferido nos
3 tamanhos (375/768/1440) com o portal renderizado de verdade.

**Corrigido em PRODUÇÃO, e conferido pelo próprio portal do cliente:** o pedido
`cmsg7anke00030ps260acx43s` está `entregue`, com `preco: null` e sem botão de
aprovar orçamento; os roteiros (26 KB, os mesmos de
`docs/projetos/foocci/roteiros-video.md`) estão no card de aprovação da Foocci,
esperando a leitura dele. Nenhuma escrita em plataforma nenhuma.

### 🔴 O QUE DEPENDE DO CEO

1. **Preço de tabela do ROTEIRO avulso.** Enquanto não existir, todo pedido de
   roteiro para em `precisa_decisao` e alguém orça à mão. É decisão comercial,
   não de código — por isso não inventei o número.
2. **Os outros 10 pedidos de vídeo do texto dele** (6 reels + longo + 4 do SDR):
   a triagem agora pergunta em vez de orçar 1. Alguém precisa fechar o escopo.

---

## ✅ 06/08/2026 (noite) — A PORTA DA AGÊNCIA FECHOU. O vetor das 19 está morto.

A perícia da tarde disse que o fluxo do CLIENTE estava fechado e o da AGÊNCIA
não — e que foi o da agência (token colado, 03/08 às 14:05) que pôs no banco as
19 conexões de terceiros. **Essa porta está fechada agora.**

- **`saveConnection` não tem mais exceção para a agência.** `clientId` nulo era
  passe-livre; hoje a agência é um dono como qualquer outro, e ativo sem
  marcação **não vira conexão** — lança, não grava, não cifra o token.
- **Tela de escolha do master construída** (`/api/meta/ativos` +
  seção "3. O que a agência administra" em `MetaConnectManager.tsx`). Colou o
  token → lista o que o token alcança → o operador marca → só o marcado é
  gravado. Desmarcar apaga a lista **e** a conexão.
- **Um mecanismo, não dois.** O alcance/escolha/gravação saíram das rotas e
  viraram `lib/integrations/meta/escolha-de-ativos.ts`, usado pelo portal do
  cliente, pela tela da agência, pelo callback do OAuth e pelo token colado.
  Copiar teria criado o segundo mecanismo que diverge e reabre o incidente.
- **O ramo `fluxo_master` do callback foi apagado.** Ele auto-autorizava tudo
  que o token alcançava — "alcance = autorização" escrito em outro lugar do
  código.
- **A tela parou de mentir.** Colar um token devolve `precisaEscolher` e a
  mensagem é âmbar ("falta escolher"), não verde ("conectado ✓").
- **A metade que não pode atrapalhar:** o token de USUÁRIO continua passando
  (é a credencial, não um ativo) e o número de WhatsApp digitado à mão continua
  funcionando — a rota o registra como escolha explícita antes de gravar.
- Verde: `npx tsc --noEmit` limpo, **2017 testes**, 129 arquivos.
  Provas novas em `__tests__/integrations/meta-escolha-da-agencia.test.ts`
  (lista vazia ⇒ 0 gravadas e 6 "falta escolher"; marcar uma não abre as outras;
  banco fora do ar ⇒ nada gravado).
- Conferido nos 3 tamanhos (375 / 768 / 1440) com o painel renderizado de
  verdade, nos dois estados. **Dívida declarada:** a Meta foi stubada na camada
  de rede para a captura — a tela é real, os dados são fixture.

### 🔴 O QUE CONTINUA DEPENDENDO DO CEO

1. **Apagar ou não as 19 linhas de terceiros.** Continua sem decisão, e
   continua sendo dele: parte desses negócios (Santioh, Dilix, Queise, Dilee) é
   do próprio CEO, e apagar destrói o token cifrado. **A diferença é que agora a
   limpeza não é desfeita pelo próximo token colado.**
2. **Marcar o que a agência administra.** A lista nasce vazia: até o operador
   abrir Integrações e marcar, nenhum ativo novo é gravado. As conexões que já
   existem no banco continuam de pé (nada foi apagado) — mas não são renovadas
   por uma colagem nova enquanto não forem marcadas.
3. **Reautorização da Foocci** — inalterado, ver a seção da tarde.

---

## ✅ 06/08/2026 (tarde) — Onda 0 do P0, o portão do PM, o microfone e a coleta de produto

Quatro frentes fechadas. O que mudou de verdade, sem prosa:

- **O portão do PM ganhou leitor.** `pm_task_owner` e `pm_deadline` estavam
  `autoCheckable: true` sem um único chamador. Agora `criarTarefas`
  (`lib/agency/tarefas/criar-tarefas.ts`) é o **ponto único** de gravação de
  Task: sem dono ou sem prazo, a tarefa **não é gravada**, e o bloqueio vira
  `ActivityEvent`. Um teste de guarda reprova `prisma.task.create` novo fora
  dali. O prazo sai do `estimatedDays` do próprio PM — sem estimativa, barra.
- **Onda 0: os dois registros viraram um.** Ids unificados pela lista que
  ROdava (a de `quality-canvas.ts`), `projections_anchored` incorporado, e o
  tipo agora obriga cada checagem a declarar `mecanismo` (caminho de arquivo,
  conferido por teste) ou `lacuna` (motivo, dono, prazo).
  **O default NÃO foi invertido** — isso para 8 de 8 departamentos e só entra
  junto com a escada (Onda 1).
- **O número do P0 parou de ser escrito em prosa.** A contagem antiga ("31, 3
  executáveis") mentia nas duas direções: faltava `projections_anchored` e
  `quality_audit_impartial` estava construído e declarado como não executável.
  **A partir daqui o número corrente sai de `retratoDosPortoes()`**
  (`lib/dioli-brain/quality-gates.ts`), com trava em
  `__tests__/brain/o-numero-do-p0.test.ts` — número em prosa envelhece errado e
  vira afirmação falsa sem ninguém mexer numa linha. Seguem descobertas as 4
  bloqueantes globais que importam: marca, briefing, valor ao cliente e riscos.
- **O microfone do portal.** A causa raiz **NÃO está fechada** — falta a linha
  de log da produção. O que foi fechado é a cegueira: 401/402/403 →
  `chave_recusada`, 429 → `ritmo`, 4xx → `audio_recusado`, 5xx →
  `provedor_indisponivel`. O log leva `status` + `error.code` + `error.type`
  (enum fechado); `error.message` e o corpo continuam fora, porque podem ecoar
  a fala do cliente. `chave_recusada` vira `ActivityEvent`.
- **A esteira passou a pedir o produto do cliente**
  (`lib/agency/esteira/material-de-produto.ts`), no nascimento do projeto.
  SaaS recebe pedido de captura de tela; padaria não recebe. Sem sinal nenhum,
  a casa **pergunta** — silêncio não vira "não tem".
- **Biblioteca de mockup + assinatura como token** (`lib/agency/design/mockup.ts`).
  Os quatro blocos, e a trava junto: **captura real ou selo de ilustração na
  peça**, e número sem origem declarada não vira pixel. Todo texto do mockup
  entra na lista que o renderizador confere no DOM.

**Não deu, e o motivo exato:**

- **Contadores de Instagram/WhatsApp para o banco** — não encostei.
  `prisma/schema.prisma` está sendo editado por outro agente nesta mesma
  árvore; migration nova aqui colidiria com a dele.
- **Régua de recompra 30/60/90** — depende da triagem
  (`lib/agency/esteira/triagem.ts`) pousar. Ainda não pousou.

---

## 🔴 06/08/2026 (tarde) — PERÍCIA EM PRODUÇÃO: o script ia apagar a casa inteira

Rodada contra PRODUÇÃO com protocolo (dry-run → conferir → aplicar). **A etapa
`--apply` NÃO foi executada, e isso foi a decisão certa.** O que a perícia achou:

### 1. O dry-run marcou 25 de 25 conexões de ativo para exclusão

Incluindo **as 2 legítimas da Foocci** (`@foocci_`, Página `Foocci`) e as 4 da
própria Dioli. É exatamente o caso em que o protocolo manda **PARAR**. Causa
dupla, as duas consertadas em `82dc075`:

- **"Sem cliente" tinha duas grafias.** O callback grava `clientId` `null`;
  `/api/meta/token` gravava `""`. As **24 conexões de nível agência que estão em
  produção nasceram com `""`**, em 03/08. Toda guarda desta casa pergunta
  `clientId === null` — com `""`, o fluxo da AGÊNCIA caía no ramo do CLIENTE.
  Agora existe `donoDe()` (`lib/integrations/meta/ativos-autorizados.ts`), a
  forma canônica, aplicada em toda fronteira.
  > **Isto também teria quebrado o deploy em silêncio:** sem o conserto,
  > `saveConnection` passaria a LANÇAR em todo `/api/meta/token`, e o laço de
  > Páginas engole a exceção — o fluxo de token colado gravaria **zero** Páginas
  > sem uma linha de erro.
- **"Sem autorização" não é "gravado indevidamente".** `MetaAtivoAutorizado`
  nasce vazia de propósito, então **toda** conexão de cliente parece não
  autorizada — inclusive a que o cliente concedeu de verdade. Deduzir exclusão
  de uma lista vazia é tratar ausência de informação como informação.
  **`--apply` agora EXIGE `--ids=<...>`**, a lista que uma pessoa conferiu.
  Sem ids, recusa e sai 1. As duas metades testadas.

### 2. O dano real em produção é MAIOR e MAIS ANTIGO do que o registrado

O incidente foi atribuído ao clique de 06/08 no portal da Foocci. **Os
carimbos do banco dizem outra coisa:**

- O clique de 06/08 (12:55) tocou **3 linhas**: o token de usuário da Foocci,
  `@foocci_` e a Página `Foocci`. **Nenhum ativo de terceiro foi gravado nesse
  dia** — a tela de consentimento por Página da Meta limitou o alcance.
- **19 conexões de terceiros estão gravadas desde 03/08 às 14:05**, pelo fluxo
  de **token colado** (`/api/meta/token`, o "Plano B" do OAuth) — 10 negócios
  que **não são clientes da agência**: Sushi Cazza, Dilee, Kero Shop, Acesso
  Beleza, santioh_, dilix.br, queise, Santioh Europe, Spa da Mente, City Jobs SP.
- Elas estão com `clientId = ""`, e por isso o script as classificava como
  **"conta da própria agência"** e as **preservava**. Ficaram três dias
  invisíveis sob esse rótulo. A perícia agora **imprime** as de nível agência.

**O que essas 19 dão acesso, medido pelo escopo gravado** (`pages_show_list`,
`pages_read_engagement`, `instagram_basic`, `business_management`,
`ads_management`, `ads_read`): **leitura** do engajamento das Páginas e do
Instagram desses negócios. **Não têm `pages_manage_posts` nem
`instagram_content_publish` — não publicam.** As que publicam são as 2 da
**Foocci** (13 escopos, com `instagram_content_publish`), que são legítimas.

### 3. A trava está no ar — mas só fecha metade do caminho

Promovido `82dc075` para produção (CI verde, fast-forward, 27 conexões antes e
27 depois — nada perdido, nada criado).

- ✅ **Fluxo do CLIENTE (callback do OAuth) fechado.** É o que dispararia no
  próximo clique de "Conectar" em qualquer portal.
- 🔴 **Fluxo da AGÊNCIA continua aberto — e foi ele que produziu as 19.**
  `clientId` nulo é exceção declarada em `saveConnection`: quem colar um token
  novo em `/api/meta/token` **regrava as 19 Páginas de terceiros**. A "lacuna
  do fluxo master" já estava declarada; o que a perícia acrescenta é que ela
  **não é teórica — é o vetor do dano que está no banco.**

### 🔴 O QUE DEPENDE DO CEO

1. **Apagar ou não as 19 linhas de terceiros.** Não apaguei por conta própria:
   parte desses negócios (Santioh, Dilix, Queise, Dilee) é do próprio CEO, e
   apagar destrói o token cifrado — reconectar exige colar token de novo.
   Os ids estão prontos; o comando é um só, com `--ids=`.
2. **Fechar o fluxo master** (tela de escolha para a agência). Sem isso, apagar
   as 19 é limpeza que o próximo token colado desfaz.
3. **Reautorização da Foocci:** as 2 conexões legítimas continuam no banco, mas
   a lista nasce vazia — a Foocci precisa marcar na tela dela o que a Dioli pode
   ler. Até lá o portal dela diz "falta autorizar", que é a trava funcionando.

**Nenhuma escrita na Meta. Nenhum token revogado. Nada apagado em produção.**

---

## 🔴 06/08/2026 — FALHA DE PRIVACIDADE NA META: alcance tratado como autorização

**O CEO pegou; devia ter sido o sistema.** Ele clicou "Conectar
Facebook/Instagram" no portal do cliente **Foocci**. A Meta devolveu um token do
**usuário** dele, e a casa tratou "o que o token alcança" como "o que a agência
pode usar":

- `me/adaccounts` devolveu **14 contas de anúncio** — Santioh, Dilix, Queise,
  DileeBags e pessoais — e as 14 subiram para a tela;
- **pior, e não estava no pedido:** o callback do OAuth varreu `me/accounts` e
  **gravou como conexões da Foocci todas as Páginas e Instagram** que o token
  alcançava, **com o token de Página junto** — token que PUBLICA. A leitura foi
  de passagem; isso ficou no banco.

### O que foi construído (fail-closed, com as duas metades testadas)

| Peça | Onde |
|---|---|
| Lista explícita de ativos autorizados, por cliente | `MetaAtivoAutorizado` + `lib/integrations/meta/ativos-autorizados.ts` |
| Trava na leitura (contas, campanhas, insights) | `lib/integrations/meta/ads-leitura.ts` |
| Trava na gravação de conexão | `lib/integrations/meta/connections.ts` (`saveConnection` LANÇA) |
| Trava na escrita de anúncios | `lib/integrations/meta/ads.ts` |
| Callback não grava mais o que não foi marcado | `app/api/meta/callback/route.ts` |
| A escolha, na tela do cliente | `app/api/portal/meta-ativos/route.ts` + `components/portal/ConexoesDoCliente.tsx` |
| Perícia + limpeza do que ficou gravado | `scripts/meta-pericia-alcance.mts` |

**A regra em uma frase:** a lista é consultada pelo dono **derivado** do token
(portal ou linha de conexão), e conta fora dela não é lida nem perguntada à Meta
— sem lista, nada.

### 🔴 O QUE DEPENDE DO CEO

1. **Rodar a perícia contra PRODUÇÃO** (deste ambiente não há acesso ao banco de
   produção — o script rodou só contra o `dev.db`):
   `DATABASE_URL=<prod> npx tsx scripts/meta-pericia-alcance.mts` → conferir →
   `--apply`. Ele lista e apaga as conexões de Páginas/Instagram de terceiros
   gravadas como da Foocci e as linhas de cota (`MetaAdCota`) das contas não
   autorizadas.
2. **Efeito do deploy, declarado:** a tabela nasce **vazia**. No primeiro boot
   **nenhuma** conexão de cliente está autorizada — inclusive as legítimas da
   Foocci. É fail-closed funcionando. Preencher por inferência a partir das
   conexões existentes seria inventar o consentimento que o incidente provou não
   existir. **Cada cliente marca na tela dele** (portal → Conexões).
3. **Lacuna declarada:** o fluxo **master** (a agência conectando a conta dela
   própria, `clientId` nulo) ainda **não tem tela de escolha** — ele
   auto-autoriza e registra na lista. Fecha o buraco do cliente, não o da
   agência sobre si mesma.

---

## 🔴 06/08/2026 — A recaptura diária da biblioteca NÃO está rodando

Fato verificado, não suspeita: `docs/plataformas/CHANGELOG.md` ficou **três
dias sem uma linha** (03/08 → 06/08), e não existe agendamento algum no
repositório — nenhum workflow em `.github/workflows/` (só `cron-radar` e
`cron-execute`, ambos de produto), nenhum cron de sistema, nenhum arquivo de
Routine. O texto de 03/08 abaixo diz "recaptura diária agendada (rotina às
06:00 BRT)"; **esse agendamento não tem artefato em lugar nenhum**.

- **Consequência:** a biblioteca que serve de fonte aos pareceres-trava
  envelheceu em silêncio. Na recaptura de hoje, **7 fontes de política já
  tinham mudado** desde 03/08 sem ninguém saber.
- **Decisão do CEO necessária** (não faço por conta própria, exige criar
  agendamento): a rotina diária vive como **Routine do Claude** (sessão nova
  que roda a captura, lê o diff, escreve o CHANGELOG e commita) ou como
  **workflow do GitHub Actions** no molde de `cron-radar.yml`? A segunda é
  auditável no repositório e não depende de nenhuma sessão estar de pé — mas
  não sabe resumir a mudança em linguagem de negócio.
- Enquanto não houver rotina, **a data de `capturado_em` do arquivo é o único
  atestado de frescor** — o especialista precisa olhá-la antes de citar.

---

## 🟡 06/08/2026 — O token de SANDBOX da Meta não existe (bloqueia a prova final)

`scripts/meta-sandbox.ts` já monta a estrutura inteira (campanha → conjunto →
criativo → anúncio, tudo PAUSADO), com catálogo fechado e cota por pontuação.
**Falta o token.** As variáveis do Railway (projeto Dioli Digital) têm
`META_APP_ID`, `META_APP_SECRET` e o token do WhatsApp — **nenhum token de
usuário com `ads_management` para `act_1072627681961050`**.

- Testado hoje, com uma ÚNICA leitura (é assim que se testa acesso, nunca com
  create/delete): o app access token é recusado com
  `(#200) Ad account owner has NOT grant ads_management or ads_read permission`.
- **O que o CEO precisa fazer:** gerar no Explorer um token de usuário com
  `ads_management` + `ads_read` que enxergue a conta de sandbox e entregá-lo
  como variável de ambiente da execução (não commitado, não em arquivo).
- Sem isso, a estrutura completa **não está provada na Meta** — só no código e
  nos testes.

## 🟢 06/08/2026 — Cota da Marketing API: número corrigido e contador no banco

O código limitava por "300 + 40 × anúncios ativos por HORA", por processo. A
Marketing API usa **pontuação**: leitura 1, escrita 3, teto 60 por conta a cada
300s no nosso nível — **20 escritas travam a conta por 5 minutos**
(fonte capturada: `docs/plataformas/meta/fontes/marketing-api-limites-de-taxa.md`).
Contador agora em `MetaAdCota`/`MetaAdFreio` (banco), por conta de anúncios,
com incremento atômico e freio persistente. **O que continua aberto:** os
baldes de Instagram/WhatsApp de `ritmo.ts` e os caches de `leitura.ts`/`ads.ts`
ainda são memória de processo (lacuna 8 da cartilha).

---

## 🔵 05/08/2026 — Achados do raio-x, com dono

Saíram da coleta de 05/08 (`docs/raio-x/relatorios/2026-08-05.md`). O raio-x
diagnostica; o conserto é frente com dono e verificação.

- **`plataforma` — 4 rotas aceitam id sem provar posse.**
  `admin/backfill-carrossel`, `admin/training/sdr/suggestions/[id]`,
  `brain/changes/[id]`, `self-serve/order`. A fronteira única já existe
  (`lib/auth/posse-de-workspace.ts`); falta passar por ela.
- **`plataforma` — `/api/self-serve/order` grava no banco sem guarda nenhuma.**
  Pública, sem sessão, sem assinatura e sem limite por IP.
- **`plataforma` — 4 rotas públicas pagas defendidas só por contador em memória.**
  `sdr/chat`, `sdr/transcribe`, `sdr/upload`, `brain/briefing-extract`. O
  contador some no deploy e não atravessa réplica — mesma família da rota de
  imagem que estava aberta.
- **`esteira` — 6 estados gravados que ninguém lê.** `archived`, `dispensado`,
  `enviado`, `respondida`, `skipped_running`, `superseded`. Cada um é um botão
  que não faz nada ou uma tela que não filtra.
- **`qualidade` — o P0 da casa, agora com número que anda:** a maioria das
  checagens de `lib/dioli-brain/quality-gates.ts` segue sem mecanismo. Número
  corrente em `retratoDosPortoes()` / `__tests__/brain/o-numero-do-p0.test.ts` —
  não em prosa, que envelhece errado.
- **Diretor — cobrir a metade de DADOS.** Ela ficou CEGA na primeira noite (a
  rota `/api/cron/raio-x` ainda não estava em produção). Enquanto isso, o raio-x
  não enxerga o que está preso AGORA no banco.

---

## 🔴 AÇÃO DO CEO — autorizar o backfill das 36 telas da Foocci

**Sem isso, o carrossel no portal continua mostrando só a capa.** As 36 telas
estão nos Arquivos do cliente; o que falta é ligá-las aos 6 posts.

O protocolo é obrigatório e nesta ordem (`scripts/backfill-carrossel-foocci.mjs`):

1. **dry-run** (sem flag nenhuma) — imprime o plano;
2. **conferir o log**: quantas casaram, quantas foram excluídas e quantas sobraram;
3. só então **`--apply`**.

**Sem `--force`** (sobrescreve carrossel já montado) e **sem `--por-ordem`** (o
passe posicional, que monta carrossel com logo e material bruto). Se o dry-run
deixar sobra, a sobra é para o CEO olhar — não para o script resolver.

---

## 🟠 04/08/2026 (manhã e tarde) — Três pedidos do CEO entregues em 4 ondas

O CEO pediu três coisas. As três estão no ar, depois de **4 auditorias
adversariais — 3 delas reprovando o próprio trabalho**.

**1. O card de aprovação virou visual.** O cliente vê imagem e legenda peça por
peça, no estilo do planner da Meta, em vez de um bloco de texto. O calendário
ficou clicável, e o carrossel abre num modal navegável.

**2. A agência passou a mostrar resultado real.** Métricas vindas da Meta —
alcance e engajamento da conta com série no tempo, e desempenho por post —
aparecem na seção Resultados do portal e na ficha do cliente
(`lib/integrations/meta/leitura.ts`).

**3. Ninguém produz antes de ler o cliente.** Antes de qualquer especialista
escrever uma linha, o sistema lê o Instagram real do cliente e sintetiza o que
achou (`lib/agency/execution/leitura-do-cliente.ts`). Essa leitura entra no
contexto de **todos** os especialistas e também do auditor.

### O que a auditoria reprovou 3 vezes — e por quê importa

O piso que impede a agência de afirmar ao cliente algo que ela não observou foi
**reprovado três vezes pelo mesmo defeito**: ele media um pedaço do texto e
publicava o texto inteiro. Na prática, bastava o cliente ter escrito uma palavra
verdadeira para uma frase inventada em volta dela sair rotulada como *"observado
no feed"*. Hoje a exigência é **total**: se um único pedaço do termo não estiver
no texto real do cliente, o termo inteiro cai
(`lib/agency/execution/leitura-do-cliente.ts:311`).

**Isso construiu o item 1 dos 4 do P0 da casa** (o piso determinístico). Os
outros três continuam abertos — ver a seção do P0 abaixo.

### 🔴 A dívida que fica, com todas as letras

| O que | Por que importa | Custo de fechar |
|---|---|---|
| **A trava confere PALAVRA, não FRASE** | Recombinar palavras verdadeiras do próprio cliente pode afirmar algo falso: *"bancada de mármore"* + *"bolo rosa"* → *"bancada de mármore rosa"*, entregue como observado. | Depende do LLM-judge que não existe. **Contenção barata já nomeada:** parar de rotular composição como "observado" — o mesmo tratamento que o `tom` já recebe (`leitura-do-cliente.ts:739`). |
| **Excesso de rigor tem preço** | O tamanho mínimo de palavra é 5 (`leitura-do-cliente.ts:291`): "bolo", "pão", "café", "doce" no singular não casam com o plural, e sob exigência total um pedaço derruba o termo todo. **O piloto vai dizer "não consegui observar o estilo" com frequência alta.** | Baixar para 4 — **não para 3**, senão "coros" ancoraria "cor". Baixo risco, com os testes de colisão verdes. |
| **O teto de chamadas à Meta é por PROCESSO, não por conta** | Com mais de uma instância o teto real multiplica; depois de um deploy, zera. Foi a Meta restringindo a conta em 03/08 que criou essa regra. (`lib/integrations/meta/leitura.ts:84` — a limitação está escrita no próprio código.) | Contador no banco. |
| **O `tom` da síntese não tem piso** | Tom é interpretação, e hoje é declarado como hipótese **no prompt** — isso é sugestão, não trava. | Fica como resíduo da onda; `run-execution` já foi consertado. |
| **Fail-open no TEXTO do card de aprovação** | A mídia foi fechada; o texto vindo de entrega interna ainda passa (`app/api/brain/portal-data/route.ts:218`). | O conserto seco apagaria o corpo de cards **já em voo** — precisa de um passe de dados antes. |
| **A leitura do feed não é visual** | O "estilo" é lido das legendas, não dos pixels. Se o cliente não descreve o que fotografa, a agência não vê. | Exige provedor com visão. |

---

## 🟠 04/08/2026 (madrugada) — Carrosséis V3 no portal, aguardando decisão do CEO

CEO confirmou que o material está completo (briefing, brand book, IG de
referência) e cobrou a entrega. Produzida a **V3 das 36 telas**, fiel ao
padrão real do feed @foocci_ (V1/V2 reprovadas):

- Sobre a V2: logo recortada com alpha (sem caixa cinza), TODAS as telas com
  fotografia cinematográfica (6 fotos novas geradas pelo design engine de
  produção), exposição corrigida, ícones SVG de linha no lugar de emoji,
  **mockup de conversa WhatsApp** (assinatura do feed) em C2T3 e C4T5,
  capitalização de frase como o feed usa.
- Auto-revisão por amostragem (12/36 telas): ≥8 em hierarquia, tipografia,
  espaçamento e consistência com o feed real.
- Produção: capas dos 6 posts trocadas (mediaUrl novos, 200 confirmado no
  portal) e as 36 telas subidas aos Arquivos do cliente Foocci.
- **Aguardando: decisão do CEO no card "Carrosséis de lançamento — 6 peças"**
  (Aprovar · Solicitar ajustes · Tenho uma dúvida) no portal.
- Publicação continua MANUAL (trava de plataforma). Token de publicação
  orgânica segue pendente com o CEO; nada sobe à Meta por API.
- Corrigido de passagem no portal: o texto do card de aprovação renderiza
  negrito de verdade (antes aparecia `**asterisco**` cru).

---

## ✅ 03/08/2026 (tarde) — Os três especialistas-trava entregues e auditados

Ordem do CEO cumprida: `meta`, `google` e `tiktok` integrados com biblioteca
REAL capturada das plataformas — **51 documentos oficiais** (Meta 17, Google
19, TikTok 15), cada um com URL, data e hash; cartilha por plataforma com
citação afirmação-por-afirmação; recaptura diária agendada (rotina às 06:00
BRT: recaptura → diff → CHANGELOG → commit). Auditoria adversarial da
qualidade: **APROVADO** — 51/51 hashes íntegros, nenhuma afirmação inventada,
o agente meta barraria o incidente de hoje com 4 âncoras citáveis.

**As 3 correções obrigatórias da auditoria — feitas na mesma tarde:**
1. **Trava mecânica de consentimento em `avaliacoes.ts`**: a política da API
   do Business Profile proíbe resposta automática a avaliação sem
   "consentimento prévio e específico do usuário". Nova coluna
   `autoReplyConsentAt` na conexão; nula → nem elogio sai sozinho, tudo vira
   rascunho escalado. Testes provam os dois lados. **Pendência do CEO: o
   consentimento precisa entrar no contrato/onboarding do cliente** e ser
   registrado na conexão antes de ligar resposta automática.
2. Lacunas de meta/google registradas nos manifestos (recaptura tenta fechá-las).
3. Piso do capturador mede conteúdo útil, não tamanho bruto.

**Fragilidade declarada (não escondida):** a trava dos especialistas é
procedural — regra no manual de bordo, não mecanismo no código. Nada impede
`ads.ts`/`publishPost` de rodarem sem parecer. Mecanizar o parecer (registro
obrigatório antes de escrita externa) é o próximo degrau, a decidir com o CEO.

---

## 🔴 03/08/2026 (noite) — Recurso NEGADO; restrição mantida e se espalhando

- "Análise concluída — **Não removemos as restrições**" no mesmo dia: decisão
  automatizada, mantida. Pela fonte da biblioteca
  (`docs/plataformas/meta/fontes/recorrer-de-restricao.md`), o número de
  recursos é limitado e a decisão pode ser definitiva.
- **Efeito em cadeia confirmado:** o painel lista "The Face Store" (conta que
  nem aparecia na nossa listagem por API) como **Restrito** no mesmo
  portfólio — exatamente o risco que motivou a regra de não repetir automação.
- **Caminho limpo de hoje:** tráfego da Foocci MANUAL, por gente, na conta
  própria da Foocci (decisão que o CEO já tinha tomado). **NUNCA criar conta
  nova para contornar** — "contornar sistemas" é violação literal e derruba o
  portfólio inteiro.
- Recuperação de longo prazo da conta da agência: verificação de negócio +
  App Review + operação humana-primeiro; reavaliar com o especialista `meta`.

---

## 🔴 03/08/2026 (meio-dia) — Meta RESTRINGIU a conta de anúncios "Dioli Agencia"

E-mail da Meta às 11:32: conta `act_3416644181895443` desativada
(`account_status 2`, motivo: integridade — "criada ou usada com uma automação
que não segue nossas regras"). **Gatilho mais provável: a minha própria
operação por API** — campanha de teste criada e apagada + 36 uploads + campanha
em sequência rápida, num app em modo de desenvolvimento. Responsabilidade do
Diretor, registrada com todas as letras.

**Estado no momento da restrição:** campanha Foocci PAUSADA já criada
(`120251488825740613`), conjunto único BR criado, 36 imagens carregadas.
Anúncios ainda não criados (bloqueio anterior: app em modo dev).

**Caminho de recuperação (ação do CEO):** botão "Corrigir problema" do e-mail
ou Qualidade da Conta (business.facebook.com/accountquality) → Solicitar
análise. Falso positivo costuma voltar em horas/dias.

**Decisão de prudência:** NÃO repetir automação em outra conta de anúncios
enquanto a análise corre — flag em cadeia derrubaria as contas dos clientes.
Posts orgânicos não são afetados.

**Lição para o kit (proposta ao Diretor Geral):** operação de Marketing API em
conta nova exige aquecimento — sem create/delete de sondagem, ritmo lento,
app em modo Ativo antes do primeiro objeto real.

---

## 🟢 03/08/2026 — TRÁFEGO PAGO DESTRAVADO (fim da novela do OAuth)

O popup de OAuth da Meta recusou o admin do app o dia inteiro ("domínio não
incluído") mesmo com tudo gravado. Saída: **Plano B — token do Graph API
Explorer colado pelo CEO** no `POST /api/meta/token` (rota criada para isso,
com as três fechaduras: `debug_token` prova que é do nosso app, `is_valid`,
só o master cola; o token nunca volta na resposta).

**Provado em produção, na sequência, tudo por API:**
1. Token validado — todos os 6 escopos concedidos (`ads_management`,
   `business_management` etc.) — e trocado por um de **60 dias (até 02/10)**.
2. **25 conexões descobertas e salvas** (páginas FB + Instagram), incluindo
   FB Foocci e @foocci_.
3. **13 contas de anúncio visíveis**; "Dioli Agencia" (`act_3416644181895443`)
   ativa, BRL, cartão vinculado.
4. **Escrita provada**: campanha de teste criada PAUSADA na conta da agência e
   apagada em seguida (`120251488279600613`). Modo dev + admin dispensa App
   Review para operar.

**Nota honesta:** o edge `/{app-id}/authorized_adaccounts` recusou o POST
("Unsupported post request") — e **não fez falta**: a escrita direta funciona.
A rota `/api/meta/contas-de-anuncio` precisa dessa correção quando sobrar tempo.

**Falta para a campanha da Foocci rodar (insumos do CEO):** verba/mês,
cidade+raio, destino (site ou wa.me). Campanha nasce PAUSADA; ele liga.

**Renovação:** token expira 02/10 — colar um novo antes disso (2 min) ou
destravar o OAuth de vez (config_id do Login para Empresas).

---

## ✅ Itens 8 a 11 do backlog — entregues em 02/08/2026

| # | O que era | O que ficou |
|---|---|---|
| 8 | Carrossel não existia | Formato completo: fluxo próprio na Meta, **uma arte por tela** |
| 9 | Story não existia | Nasce **vertical**, com prompt que protege as bordas da interface |
| 10 | Só existia Meta | **Google Meu Negócio**: locais, posts e avaliações |
| 11 | Calendário enterrado na aba de Social | **Aba própria**, com miniatura, agrupado por mês |

**A regra que mais importa no item 10:** elogio a agência responde sozinha;
**reclamação, nunca.** Resposta automática a cliente irritado é lida como
deboche por quem está com raiva, é pública, permanente, e notifica a pessoa na
hora. 4–5 estrelas sai sozinho; 1–3 vira rascunho pronto e escalado.

**Dois defeitos achados conferindo a tela nos 3 tamanhos** (regra da casa):
- `capitalize` do CSS escrevia "Julho **De** 2026" — errado em português.
- O topo do portal mostrava **`in_production` cru** ao cliente. Faltavam três
  rótulos e o fallback vazava o nome do banco.

**Ainda depende do Google:** a API do Meu Negócio exige aprovação, como o App
Review da Meta. O código está pronto e o erro já vem traduzido.

---

## 🎯 Rodada 90+ — os quatro serviços passaram de 90

Ordem do CEO: **nada abaixo de 90**. Entregue na mesma noite.
Detalhe em `docs/plano-90.md`.

| Serviço | Era | Ficou |
|---|---|---|
| Operação contínua | 80 | **92** |
| Social Media | 75 | **92** |
| Tráfego Pago | 55 | **92** |
| Identidade Visual | 50 | **92** |

**O que sustenta cada nota**, em uma linha:

- **Tráfego:** campanha sem conjunto e sem anúncio é um envelope com verba —
  liga e não entrega nada. Agora tem os dois, mais um guardião que freia sozinho
  quem gasta sem entregar.
- **Identidade:** o logo sai em arquivo. Símbolo pela IA, **nome da marca
  composto por nós em SVG** — modelo de imagem erra letra, e letra errada no
  logo é o erro mais visível que existe.
- **Social:** o vídeo do celular vira reel de verdade. Áudio de −47 dB
  (inaudível) para −15 dB, provado com ffmpeg nos testes.
- **Operação:** "agosto foi melhor que julho". A conta é feita em **código**, e
  a IA é proibida de recalcular.

**Novo:** `/api/capacidades` diz se esta instância consegue trabalhar — ffmpeg,
chave de imagem, domínio público. `/api/health` só diz se está viva.

### ✅ As três pendências do CEO — medidas em produção (02/08, manhã)

**1. Chave de imagem — NÃO ERA PENDÊNCIA. Erro meu.**
A chave da OpenAI já existia (no cofre cifrado do banco, não no env — por isso
não apareceu na listagem de variáveis do Railway). Testada em produção via
`POST /api/generate-image`: **gerou a arte em 20s**, 1024×1024, sem texto na
imagem. O Design está funcionando hoje.

**2. Meta — a causa do "ineligible for submission" foi encontrada.**
Perguntando ao próprio app pela Graph (`GET /{app-id}`), com app access token:

| Campo | Estado |
|---|---|
| ícone, logo | ✅ preenchidos |
| `privacy_policy_url` | ❌ vazio |
| `terms_of_service_url` | ❌ aponta para facebook.com |
| `website_url`, `app_domains`, `user_support_email` | ❌ vazios |

As páginas legais **já existem e respondem 200** (`/privacidade`, `/termos`,
`/exclusao-de-dados`). Só não foram coladas no painel.
Tentei preencher por API e a Meta recusou:
`(#10) Changing app settings through API calls has been disabled for this app`.
→ **Um toggle em Configurações → Avançado libera, e aí eu preencho tudo.**

**3. Domínio sem `www` — diagnóstico exato.**
O Railway espera um CNAME na **raiz** apontando para `wu7600kq.up.railway.app`,
e o valor atual está **vazio** — o registro não existe. O `www` está correto e
propagado. É criar um registro no DNS; CNAME na raiz exige ALIAS/ANAME (ou
redirecionar apex → www no registrador).

**Novo:** agente dedicado à Meta recriado em `.claude/agents/meta.md`, a pedido
do CEO, com o estado real do app documentado.

---

### ⚠️ Dois achados que só apareceram CONFERINDO o deploy

**1. O Railway constrói com RAILPACK, não com Nixpacks.**
Escrevi um `nixpacks.toml` para instalar o ffmpeg. Ele foi **ignorado sem um
único aviso no log**: o build passou, o app subiu, os testes ficaram verdes — e
o editor de vídeo teria devolvido "ffmpeg não disponível" para todo cliente, em
silêncio. Corrigido com `railpack.json` (`deploy.aptPackages`), e confirmado no
boot: `▶ ffmpeg presente (5.1.9)`.
*Lição registrada no código:* arquivo de configuração que diz fazer algo e não
faz é pior do que arquivo nenhum. Por isso `start.sh` agora imprime a presença
do ffmpeg em todo boot.

**2. `diolidigital.com.br` (sem www) devolve 404 — PENDÊNCIA DO CEO.**
- `www.diolidigital.com.br` → **200, funcionando**
- `diolidigital.com.br` → **404 "Application not found"** do edge do Railway
- É configuração de DNS/domínio no painel, não código. Quem digitar o endereço
  sem `www` não acha a agência.

---

## 🏗️ Obra concluída — 02/08/2026: os 7 blocos do plano

Os sete blocos de `docs/plano-de-obra.md` estão construídos, testados e no ar.
439 testes verdes, typecheck e build limpos, migrações conferidas contra o
schema.

**O que a agência passou a conseguir fazer, e não conseguia antes:**

| Antes | Agora |
|---|---|
| O cliente não tinha como mandar arquivo (a aba prometia "em breve") | Upload real no portal, com cota e link assinado |
| A entrega virava texto e morria ali | Vira calendário com data, o cliente aprova, o relógio publica |
| **Não existia mês 2** — a idempotência era vitalícia | O mês vira sozinho: mede, relata, fecha e produz o próximo |
| Reprovação do cliente gravava um status e mais nada | Refaz na hora, com as palavras dele |
| O Design entregava a *descrição* da peça | Entrega a imagem, guardada no mesmo storage |
| Tráfego pago parava no plano de mídia | Campanha criada **pausada**, com teto do cliente |

**Os três achados que só apareceram construindo:**

1. `fecharCiclo` existia e **não tinha um único chamador automático** no
   repositório inteiro. O ciclo de agosto ficava aberto em dezembro.
2. A esteira dizia a todo cliente com ciclo aberto *"Seu conteúdo está no ar"* —
   inclusive a quem nunca conectou uma rede. Falso por construção, e o cliente
   não tinha como saber.
3. O portal tinha os três botões de aprovação e **só o de proposta fazia
   efeito**. O cliente pedia revisão e ninguém ficava sabendo.

**O que sobrou depende do CEO** — está listado no fim de
`docs/plano-de-obra.md`. Nada ali é código.

---

## 🧹 Limpeza executada em produção — 01/08/2026

A casa foi zerada a pedido do CEO, no modo **Opção A** (`keep-clients`).

**Apagado:** 1 projeto, 2 entregas, 4 tarefas, 26 artefatos, 11 aprovações,
14 evidências, 10 acessos de portal, 4 conversas do portal, 4 aprendizados
pendentes do Brain, 2 eventos de atividade.

**Preservado:** os 2 cadastros de cliente, as **7 solicitações** (todas de volta
ao status `new`), os 182 insights do Radar, as 3 integrações e o login.

**Observação de quem executou — e virou conserto no mesmo dia:** não havia
**nenhum** `BrandBrain` em produção. O que a Opção A prometia preservar de mais
valioso (cores, tom de voz, público) simplesmente não existia: **o sistema nunca
gravou marca de cliente nenhum.**

A causa: o `BrandBrain` só era escrito por formulário manual da agência ou por
aprendizado que alguém precisava aprovar — e numa agência sem gente olhando,
isso significa nunca. O motor lia a marca, encontrava vazio, **não avisava nada**
e produzia peça genérica.

✅ **Resolvido em `42d284d`:** o briefing do cliente vira `BrandBrain` no momento
em que o projeto nasce. Nunca sobrescreve ajuste manual, e nunca inventa — campo
que o cliente não contou fica vazio, e vazio é o que faz o especialista pedir o
material em vez de chutar.

**Duas das 7 solicitações preservadas são lixo de teste** —
`UI Bridge Test 1781835336580` e `Dioli Digital Studio` (a própria agência).
Ficaram de pé porque a ordem foi preservar as solicitações; apagá-las é decisão
do CEO, e o modo `everything` ou uma exclusão pontual resolve.

`ALLOW_PRODUCTION_RESET` foi ligada para a operação e **desligada em seguida**.

---

## ✅ AÇÃO DE SEGURANÇA — RESOLVIDA em 01/08/2026

**As três credenciais expostas foram revogadas pelo CEO** — confirmado no
`HANDOFF.md` rev.2 (commit `465cf05`). Fica o registro do que aconteceu e do que
foi rotacionado:

| Credencial | Onde regenerar | Urgência |
|---|---|---|
| **App Secret da Meta** | painel Meta for Developers → Configurações básicas | **alta** — assina os webhooks |
| **Token de projeto do Railway** | Railway → Account Settings → Tokens | **alta** — dá acesso ao deploy e às envs |
| **Token do WhatsApp** (número de teste) | painel Meta → WhatsApp → API Setup | média — expira sozinho em ~24h |

Depois de regenerar, atualizar as variáveis `META_*` no Railway.

> Por que isso é grave e não burocracia: o App Secret é o que valida a assinatura
> dos webhooks. Quem o tiver pode forjar evento entrando no sistema como se fosse
> a Meta. O token do Railway dá acesso ao deploy e a todas as variáveis de
> ambiente — inclusive às outras credenciais.
>
> Origem: `HANDOFF.md` §f da branch `claude/meta-integration-axrlf3`
> (commit `7116cbb`).

---

## 🔴 P0 — o piloto roda sem rede embaixo

**Decisão do CEO (31/07/2026): o piloto roda 100% IA, sem revisão humana.** Nada
disto abaixo é teórico — é o que está entre um erro do modelo e um cliente pagante.

### 1. A maioria dos quality gates ainda não protege nada
O registro é `lib/dioli-brain/quality-gates.ts`. **A maior parte das checagens
declara `lacuna`, não `mecanismo`** — texto descrevendo o que um humano deveria
conferir.

> **O número não fica escrito aqui, de propósito.** Este parágrafo dizia "31
> checagens, 28 sem mecanismo, só 3 rodam" muito depois de os três números terem
> mudado: prosa que descreve um número não muda junto com o número, e ninguém
> lembra de atualizar. A fonte é `retratoDosPortoes()`, e
> `__tests__/brain/o-numero-do-p0.test.ts` quebra quando o número anda — é ele
> que obriga a prosa a acompanhar.

Com revisão humana era um checklist. Sem revisão humana é **decoração** — e as
bloqueantes globais ainda descobertas são exatamente as falhas que chegam no
cliente: *respeita a marca*, *corresponde ao briefing*, *valor ao cliente claro*,
*riscos verificados*. (*Sem alucinação* saiu dessa lista — ganhou mecanismo. O
buraco encolheu; não fechou.)

**O que precisa existir:**
1. ✅ **Construído em 04/08/2026** — piso determinístico: afirmação conferida
   contra o texto real do cliente antes de virar "observado"
   (`lib/agency/execution/leitura-do-cliente.ts`). **Confere palavra, não frase**
   — ver a dívida no topo deste documento.
2. 🔴 LLM-judge para os subjetivos, com reprovação **bloqueante** e indisponibilidade
   **não-bloqueante**
3. 🔴 Default do registry invertido — departamento sem gate executável = **REPROVADO**
4. 🔴 Escada por departamento — sombra até haver evidência

> **As checagens desligadas continuam desligadas.** Um dos quatro itens ficou
> de pé; três não. Quem ler só o item 1 e concluir "o P0 andou" está lendo errado:
> o piso protege *uma* afirmação de *uma* fonte, não o entregável.

> **Nota de procedência:** esta pendência esteve arquivada por engano no
> repositório do Foocci até 01/08/2026. Conferido: o Foocci não tem nenhuma
> ocorrência de `autoCheckable`. Uma pendência na casa errada não é etiqueta
> trocada — é uma pendência que ninguém pega.

### 2. A verdade do cliente é montada no cliente
`reason.ts` ainda depende de contexto entregue de fora — o próprio cabeçalho diz
*"Phase 2 will add ClientKnowledgeSnapshot"*. Enquanto o servidor não ler a verdade
do banco por conta própria, o raciocínio confia no que lhe entregam.

### 3. Escada por departamento não existe
Departamento novo deveria nascer em SOMBRA e subir com evidência. Rodar 100% IA
**não** significa pular a escada — significa que a escada é a única proteção que
sobrou.

---

## 🟠 A agência NÃO roda 100% no automático — auditoria de 01/08/2026

Pergunta do CEO, respondida contra o código (não contra este documento). O
diagnóstico antigo do `BACKLOG.md` — *"a tarefa não aciona o agente"* — **está
desatualizado**: o motor existe, produz com IA de verdade e dispara sozinho.
O problema mudou de lugar.

**O trecho que roda sozinho, hoje, de verdade:**
cliente aprova a proposta no portal → `app/api/portal/approvals/route.ts:125`
dispara `runProjectExecution` → o PM ordena os departamentos → Social, Design,
Tráfego e Analytics produzem com IA (`lib/agency/execution/run-execution.ts:268`)
→ um auditor LLM lê cada peça e manda refazer uma vez se reprovar → a entrega é
gravada e a tarefa fecha ligada a ela. Faltando material, o agente abre o pedido e
o PM cobra o cliente numa mensagem só.

**Três dos cinco furos foram FECHADOS em 01/08/2026** (ver commits `0c78044`,
`d1cbbe2`, `4b0e953`). O que sobrou e o que caiu:

| # | Furo | Estado |
|---|---|---|
| 1 | **A peça pronta não chegava ao cliente sozinha.** O pacote ficava pronto dentro da agência esperando alguém clicar. | ✅ **FECHADO** — `runProjectExecution` chama `apresentar` quando o pacote fecha. Só apresenta o pacote inteiro; metade não vai. |
| 2 | **"Material chegou → produz sozinho" não existia.** | ✅ **FECHADO** — `lib/agency/esteira/materiais.ts`. "Recebido" re-enfileira a produção, zera o contador de tentativas, e o cliente nunca é cobrado duas vezes pelo mesmo material. |
| 3 | **A rede de segurança estava desligada.** Nada re-tentava o que falhava. | ✅ **FECHADO** — o despertador (`lib/agency/despertador.ts`), ligado pelo `instrumentation.ts`, roda dentro do app a cada 5 min. Sobe junto com o deploy. |
| 4 | **A produção não começa sem alguém aprovar a direção** (`run-execution.ts`). | 🟡 **ABERTO POR ESCOLHA** — é proteção deliberada. Aprovar direção é barato; refazer um mês, não. Só vira furo se o CEO decidir que o cliente não precisa avalizar o rumo. |
| 5 | **Nada impedia uma peça errada de sair.** | 🟠 **METADE FECHADA** — a apresentação automática agora é **barrada** quando a Qualidade deixa ressalva, e o bloqueio vira `ActivityEvent`. Mas os 31 portões formais seguem com 28 desligados (P0 acima), e o auditor continua sendo um LLM sem piso determinístico. |

**Veredito novo (01/08, fim do dia):** a agência roda sozinha de *"cliente
aprovou a direção"* até *"pacote apresentado no portal do cliente"*, 24h, se
recuperando de falhas e destravando quando o material chega. O que ainda exige
gente é **antes** (avalizar a direção — de propósito) e o **piso de qualidade**,
que continua sendo o P0 da casa.

---

## 🔌 Integrações: escopo separado ✅ · tela do cliente ainda aberta

Levantado pelo CEO em 01/08/2026, e conferido no catálogo: **das 17 integrações,
5 estão na tela errada.**

A pergunta dele resume o problema: *"o que eu vou conectar aqui o Google
Analytics? De quem?"*

**Existem dois grupos, e eles não têm o mesmo dono:**

| Grupo | Quem é o dono da conta | Onde deve ser conectado |
|---|---|---|
| **Ferramentas DA AGÊNCIA** — provedores de IA (6), Canva/Gamma/CapCut (3), Drive (1), Zapier/Make (2) | a Dioli, uma assinatura só, serve todos os clientes | ✅ onde está hoje: `/agency/integrations` |
| **Ferramentas DO CLIENTE** — Meta Ads, Google Ads, Instagram/Facebook, GA4, Search Console | **cada cliente**, com a conta dele | ❌ hoje estão na tela da agência; deveriam estar **no painel daquele cliente** |

**Por que isto não é organização de tela — é impedimento operacional:**

- Conectar "Google Analytics" numa tela global **não tem significado**: analytics
  de qual negócio? A tela pede uma credencial que não existe em nível de agência.
- Com 5 clientes entrando, cada um tem o próprio Instagram, o próprio Google Ads
  e o próprio GA4. Uma conexão global só consegue atender **um** deles.
- O cliente precisa poder **autorizar e revogar** o acesso da agência às contas
  dele. Isso é exigência da Meta e do Google, e é o mínimo de respeito com quem
  paga: a autorização é dele, não nossa.

**A boa notícia — o banco já está certo, só a tela não está.** `MetaConnection`
já tem `clientId` (nulo = conta da própria agência, preenchido = conta do
cliente). O desenho de dados já previa a separação; a interface é que juntou
tudo numa lista só.

**Feito** (commit `e7b2c37`):

1. ✅ `IntegrationScope` separa `agencia` de `cliente`, derivado da categoria.
2. ✅ A tela da agência mostra só as 12 dela; as 5 do cliente aparecem em seção
   própria, marcadas "no painel do cliente", **com a explicação do porquê** —
   sumir sem dizer nada faria a próxima pessoa procurar função perdida.
3. ✅ Teste de regressão: nada com "google ads", "analytics", "search console"
   ou "meta ads" no nome pode cair na lista da agência.

**Ainda aberto:**

4. As 5 do cliente **têm o lugar certo marcado, mas ainda não têm a tela** no
   painel dele — nem a autorização pelo próprio portal, que é o desenho certo.
5. Na tela da agência, mostrar por cliente **o que falta conectar** — hoje não
   há como saber que o cliente X está sem GA4 até alguém procurar.

> Google Ads, GA4 e Search Console **ainda não têm código de conexão nenhum** —
> estão no catálogo como intenção. Meta é a única do grupo do cliente que está
> realmente construída.

---

## ✅ A solicitação órfã de workspace — RESOLVIDA em 01/08/2026

Descoberto em 01/08/2026 ao tentar apagar as solicitações de teste: **6 das 7
solicitações em produção estavam com `workspaceId` NULO.**

**Por que acontece, e é legítimo:** quem preenche o briefing público não está
logado e não tem como saber a que workspace pertence. A solicitação entra sem
dono.

**O que isso quebrava, e era bem maior que a limpeza:** as rotas de admin
filtravam por workspace e respondiam *"Solicitação não encontrada"* para
briefings que **existiam e apareciam na tela** — atingindo `status`, `fire`,
`send-proposal`, `diag-ai` e `delete`. Um briefing real ficava invisível para
quem tentasse agir sobre ele pelo caminho administrativo.

**Remendo aplicado** (commit `e1fa120`): a rota aceita `workspaceId` nulo junto
com o da sessão. Não afrouxa o escopo — solicitação órfã não pertence a *outro*
workspace, ela não pertence a nenhum.

**Conserto de raiz feito** (commit `99e93c6`):

1. ✅ O serviço de criação resolve o workspace quando o formulário não informa —
   com uma agência só, existe um e é aquele. **Quando houver mais de uma, a
   escolha volta a ser obrigatória e explícita** (link, subdomínio ou token do
   formulário): adivinhar entre duas seria pior que o nulo, porque mandaria o
   briefing de um cliente para a caixa de entrada de outra agência.
2. ✅ As 3 órfãs que restavam foram adotadas em produção. As 4 solicitações vivas
   têm dono.
3. Fica o alerta para quem vier: **rota nova que filtre por workspace deve
   lembrar que o sintoma engana** — parece dado inexistente, e é dado escondido.

---

## ✅ Solicitações de teste apagadas — 01/08/2026

Ordem do CEO. Sobraram **4**, todas em `new`: Beatriz, Camila Pereira,
Dioli Digital Studio e Sushi Cazza.

Apagadas: `Diego` (Restaurante, 28/07), `Diego` (Agência, 23/06) e
`UI Bridge Test 1781835336580`. Nenhuma tinha projeto, entrega ou tarefa.

> **Decisão junto:** a própria agência entra como **cliente normal**, sem caso
> especial. Caso especial vira segundo caminho no código, e o menos testado
> quebra primeiro. De quebra, a Dioli passa pela própria esteira — se o pacote
> que ela produz para si é ruim, isso aparece antes de um cliente pagante ver.

---

## 🧪 O PRIMEIRO PROJETO RODOU DE PONTA A PONTA — 01/08/2026

Rodado em **produção**, com a própria Dioli como cliente. Não é simulação: é o
caminho inteiro, com IA de verdade, no banco de verdade.

**O que funcionou sozinho, sem ninguém clicar:**

| # | Etapa | Resultado |
|---|---|---|
| 1 | Agência envia a proposta | ✅ proposta gerada com IA, portal criado, aviso na fila |
| 2 | Cliente aprova no portal | ✅ **projeto criado e produção disparada automaticamente** |
| 3 | Portão de direção | ✅ segurou a produção até o cliente avalizar — como desenhado |
| 4 | Cliente aprova a direção | ✅ produção rodou |
| 5 | Produção | ✅ **6 entregas** por 6 especialistas de 3 departamentos |
| 6 | Qualidade audita | ✅ 4 aprovadas, **2 reprovadas com crítica específica e justa** |
| 7 | Apresentar ao cliente | ⛔ **BARRADO pela Qualidade** — e registrado |

**O freio funcionou.** As duas ressalvas não são implicância: *"operacionalização
fraca, nomenclatura imprecisa"* e *"carece de profundidade técnica, fontes
documentadas"*. Um humano assinaria embaixo.

### ✅ O buraco que isto revelou — FECHADO no mesmo dia

**Era: o pacote travado e ninguém sabia.**

- A Qualidade barrou, o bloqueio virou `ActivityEvent`… e **nenhuma tela mostra
  isso**. Conferido: nenhum componente lê `apresentacao_bloqueada` nem
  `quality_flag`.
- **Nada tenta resolver.** O motor é idempotente: re-rodar pula quem já produziu,
  então a entrega reprovada nunca é refeita. O despertador também não mexe nela.
- Resultado: o projeto fica **vivo no papel e parado na prática**, exatamente o
  mesmo padrão do buraco do material que fechamos hoje de manhã — só que um
  passo adiante na esteira.

**Decidido pelo CEO em 01/08/2026: refaz sozinha até 2 tentativas, depois chama.**
As outras duas saídas foram recusadas com motivo — chamar direto põe o CEO no
caminho de todo projeto (com 5 clientes, é ele olhando pacote todo dia), e
apresentar com ressalva anula o único freio da casa.

Construído em `lib/agency/esteira/pacote-travado.ts` + `GET /api/pacotes-travados`,
rodando pelo despertador.

**E o destravamento revelou mais um furo, também fechado:** com as peças
refeitas, a passada seguinte **não produzia nada** (tudo já existia, o motor é
idempotente) — e a apresentação exigia "algo produzido nesta passada". O pacote
ficava pronto e mudo. A pergunta certa não é *"produzi agora?"*, é *"o pacote
está inteiro?"*.

### 🏁 O ciclo fechou — verificado em produção

Estado final do projeto piloto, conferido no banco:

- 6 entregas, **todas aprovadas pela Qualidade** (as 2 reprovadas foram refeitas
  sozinhas e passaram na versão 3)
- **`presentedAt` preenchido**, execução `done`
- O cliente vê **7 itens no portal** e recebeu a mensagem do gerente:
  *"Terminamos! 🎉 Preparei as suas 6 entregas e revisei tudo antes de te mostrar"*
- **Zero pacotes travados**

**Do briefing ao pacote no portal do cliente, sem um clique humano no meio** —
exceto os dois avais que o cliente dá de propósito (proposta e direção).

---

## 📡 A camada Meta: orgânico pronto, ANÚNCIOS não existem

Auditado em 02/08/2026 a pedido do CEO, que perguntou se a integração está
completa dos dois lados. **Está pela metade — e a metade que falta é tráfego
pago, que é justamente onde o dinheiro do cliente passa.**

### ✅ O que está construído e funciona

| Frente | Estado |
|---|---|
| **Login pelo Facebook (OAuth)** | ✅ com troca por token de longa duração |
| **Conexão POR CLIENTE** | ✅ `?clientId=` → o token é salvo **cifrado** e amarrado àquele cliente. O desenho já é multi-cliente. |
| **Descobrir páginas do usuário** | ✅ |
| **Publicar no Instagram e Facebook** | ✅ (`publishPost`) |
| **Métricas ORGÂNICAS** | ✅ (`getInsights`) |
| **WhatsApp** | ✅ enviar, receber, caixa de entrada, webhooks, criar template |

### ❌ O que NÃO existe — e não é detalhe

**Anúncios (Meta Ads) são impossíveis hoje. Dois motivos somados:**

1. **As permissões nunca foram pedidas.** A lista em `DEFAULT_SCOPES`
   (`lib/integrations/meta/config.ts`) tem páginas, Instagram, business_management
   e WhatsApp — **não tem `ads_management` nem `ads_read`**. Sem elas a Meta
   recusa qualquer chamada de anúncio, com token válido e tudo.
2. **Não há uma linha de código da Marketing API.** Zero ocorrências de conta de
   anúncio, campanha, conjunto ou verba em `lib/integrations/meta/`. O
   `getInsights` que existe lê desempenho **orgânico**, não de campanha.

**A consequência prática, e ela é séria:** o departamento de Tráfego Pago produz
o *plano* de campanha — estrutura, públicos, ângulos, copy — e **a agência não
consegue criar, pausar, ler nem otimizar campanha nenhuma**. Alguém sobe tudo à
mão no Gerenciador de Anúncios. Vender tráfego pago prometendo automação, hoje,
seria vender o que a casa não tem.

### ⚠️ Outros dois pontos honestos

- **Quem conecta é a agência, não o cliente.** A rota exige sessão `master`
  (`app/api/meta/connect/route.ts`). O cliente não autoriza pelo portal dele — é
  o dono da agência que conecta em nome dele. Funciona (é o padrão do Business
  Manager), mas contradiz o desenho de "a autorização é do cliente" registrado na
  seção de integrações acima.
- **Nunca testado ponta a ponta em produção.** Publicação em IG/FB segue não
  verificada com conta real — só o WhatsApp foi exercitado.

### O que precisa ser feito, na ordem

1. Somar `ads_management` e `ads_read` aos escopos. **Muda o App Review** — é
   permissão avançada, exige justificativa e vídeo de demonstração.
2. Construir a camada de Marketing API: conta de anúncio, campanha, conjunto,
   anúncio, verba e métricas de campanha.
3. Testar publicação orgânica ponta a ponta com uma conta real.
4. Decidir se o cliente autoriza pelo portal dele ou se a agência segue
   conectando por ele.

---

## 🟡 Fila normal

| O que | Por que importa |
|---|---|
| Gemini é stub | `lib/ai/gemini-provider.ts` não está implementado — o registry oferece um provedor que não existe |
| Canvas nunca vira documento entregável | O motor produz, o cliente não recebe |
| Sem `middleware.ts` | Sessão validada em cada layout e handler — fácil esquecer um |

---

## 🧍 Fora do código — depende de gente

- **Compilar e arquivar os chats antigos.** Ver `docs/arquivo/README.md` para o
  protocolo. **Nenhum chat é fechado antes de exportado e minerado.**
- **Definir se o piloto sobe antes ou depois do P0 acima.** É decisão do CEO, e
  hoje a resposta honesta é: sem os gates, sobe sem proteção.
- **A senha do master mora no Railway — e é o único lugar onde ela existe.**
  Conferido no painel em 01/08/2026: `SEED_MASTER_PASSWORD` e `SEED_STAFF_PASSWORD`
  **estão definidas** em produção, e o login com elas funciona.

  **26/08/2026 — a senha antiga saiu do repositório inteiro.** Ela já era
  rejeitada em produção (o `seed-db.mjs` roda `UPDATE` a cada boot com a env),
  mas continuava escrita em `prisma/seed.ts` e em dez scripts, ensinando a
  credencial errada a quem lesse o código. Agora não existe mais senha em texto
  puro no repositório, e `__tests__/seguranca/nenhum-segredo-em-texto-puro.test.ts`
  quebra a rodada se alguma voltar.

  O seed também deixou de inventar senha **aleatória por boot** quando a env
  falta: isso escondia o defeito num aviso de log e criava um master que
  ninguém consegue usar. Agora ele **para com motivo** (fail-closed). O boot de
  produção não fica refém — `start.sh` chama o seed com `|| echo`.

  **Continua em aberto e é frágil:** se alguém apagar essas duas variáveis, a
  única via de recuperação é redefini-las e reiniciar — **não existe fluxo de
  "esqueci minha senha"** (`app/api/auth/` só tem `signin`, `signout` e o Google
  do briefing, que nem cria sessão). A mensagem errada do seed, que mandava usar
  um fluxo inexistente, foi corrigida.

---

## ⏳ Aguardando terceiro — nada a configurar

### HTTPS do domínio raiz `diolidigital.com.br`
O `www` está no ar e responde HTTP/2 200. O **apex** (sem www) depende do Railway
emitir o certificado Let's Encrypt, automático depois de o DNS estabilizar.

Já feito no painel de DNS: `A` do apex → `69.46.46.22`, `MX` legado **removido**,
`TXT` de verificação adicionado, `CNAME` `www` → `g68qzvs8.up.railway.app`.

**Como confirmar** — de uma máquina normal, **não de dentro de um ambiente de
agente**: abrir `https://diolidigital.com.br` e ver o cadeado, ou
`curl -I https://diolidigital.com.br` devolver `HTTP/2 200`.

Se passar de ~2h, conferir no painel do Railway se o apex e o `www` estão listados
como **duas entradas separadas** de custom domain.

> Origem: `HANDOFF.md` §7.1 e §8.1 (commit `3f888f1`), minerado em 01/08/2026.

---

## 📡 Integração com a Meta — nada dispara sozinho hoje

Minerado do `HANDOFF.md` da branch `claude/meta-integration-axrlf3`
(commit `7116cbb`), em 01/08/2026. A camada está construída; o que falta é
ligação e aprovação de terceiro.

| Aberto | O que quebra se ninguém mexer |
|---|---|
| **Template `proposta_pronta` PENDENTE na Meta** | Aviso de proposta **não é enviado** — o WhatsApp bloqueia mensagem proativa sem template aprovado |
| **Não há agendador chamando `/api/meta/dispatch`** (o `CRON_SECRET` **está** setado — conferido no Railway em 01/08; o que falta é quem chame) | Mesmo com template aprovado, o poll **nunca roda sozinho** e nada sai |
| **Token do WhatsApp é do número de teste, expira em ~24h** | O envio para de funcionar quando vencer. Para valer: token permanente de System User |
| **OAuth de IG/FB construído e NÃO testado ponta a ponta** | Publicação em IG/FB segue não verificada em produção |
| **App da Meta sem App Review nem verificação de negócio** | Só funciona com contas do próprio admin e com limite baixo. Falta ícone 1024×1024, URL de política de privacidade e categoria |
| **Número real da agência ainda não migrado para a API** | A caixa de entrada está pronta e vazia. **Decisão do dono** — migrar o número o remove do app do celular |

> **Armadilha que engana:** hoje tudo aponta para o **número de teste** da Meta,
> que só envia para destinatários pré-cadastrados no painel. O disparo "funciona"
> e não chega em ninguém de fora da lista.

---

## 🔧 A esteira comercial — o que está construído e o que trava

Minerado do `HANDOFF.md` rev.2 (commit `465cf05`), da sessão "chat da agência",
em 01/08/2026.

**O fluxo completo já existe ponta a ponta:**
`SDR briefing → auto-scope → agência envia proposta → cliente aprova no portal →
createProjectFromRequest → PORTÃO DE RECURSOS → runProjectExecution → entregas no
portal → cronograma`

| Aberto | O que quebra se ninguém mexer |
|---|---|
| **"Material chegou → produz sozinho" não existe** | O portão segura a produção quando falta material, mas **nada retoma** quando o cliente envia. Projeto com material faltante fica **travado para sempre** |
| **O SDR está sendo refeito pelo Brain-mestre** | Se for reescrito sem cuidado, somem 3 regras já implantadas: espelhar a linguagem do cliente, perguntar recursos por serviço, e capturar canal + telefone. O front já grava `preferredChannel`/`prospectPhone` |
| **Aba "Entregas" lê do Zustand, não do banco** | Em `app/agency/projects/[id]/page.tsx`. Para projeto real de banco a aba aparece **vazia** — o trabalho existe e só é visto em `/agency/execution/[projectId]`. `/api/deliverables?projectId=` já devolve o conteúdo certo |
| **Entregas sem data — o Planner não é alimentado** | `/agency/planner` e o modelo `SocialPost` existem, mas o conteúdo produzido não entra com data. O cliente recebe conteúdo sem saber **quando vai ao ar** |
| **`ADMIN_TASK_SECRET` foi removido do Railway** | Está certo assim. **Se alguém re-adicionar, vira backdoor** que apaga e dispara dados de produção sem sessão |

**✅ Resolvido no caminho:** o envio real do WhatsApp. O gatilho
`ActivityEvent type="whatsapp_notify"` desenhado por esta sessão **agora é
consumido** pela camada Meta (`lib/integrations/meta/notifications.ts` + cron
`POST /api/meta/dispatch`, com outbox anti-duplicata). Falta só confirmar que o
cron está agendado de fato e que o telefone chega do briefing.

---

## 🔴 15/08/2026 — O PISO DE 600 CORES MEDE EXPOSIÇÃO, NÃO FOTOGRAFIA — E ISSO É DECISÃO DO CEO

**Não mexi na régua, de propósito.** Ela está pegando clipart de verdade agora, e
trocar limiar de portão é mudança que os outros agentes assumem como verdade sem
reconferir. Fica registrada com a aritmética, para quem decidir decidir com o
número na mão.

### O que foi consertado hoje (e não é isto)

O prompt parou de pedir ilustração — `lib/agency/execution/artes.ts` (`montarPrompt`),
`lib/agency/design/repertorio.ts` (`direcaoDeAmplitude`) e o pré-portão de custo
zero em `lib/agency/design/direcao-fotografavel.ts`. **Nenhum limiar foi tocado.**

### A aritmética do piso

`lib/agency/design/trava-de-fundo.ts:166-168`:

```
PISO_DE_CORES_DISTINTAS = 600
TETO_DA_COR_DOMINANTE   = 0,45
PISO_DE_TEXTURA         = 0,012
```

A medida de `coresDistintas` conta cores distintas depois da quantização de
`medir-fundo.ts`. Isso é uma medida de **espalhamento do sinal**, e espalhamento
de sinal é função da EXPOSIÇÃO antes de ser função da natureza da imagem:

| amostra | cores | veredito |
|---|---|---|
| clipart reprovado 1 (08/08, real) | 232 | reprova, e **está certo** |
| clipart reprovado 2 (08/08, real) | 224 | reprova, e **está certo** |
| foto real da estação de Mogi | 1.958 | passa |
| foto real da rua do centro | 1.675 | passa |
| **o mesmo sinal fotográfico com o croma preso a 4 cores** | **462** | **reprova, e está ERRADO** |

Os dois últimos números são a demonstração: **2.844 → 462 cores** é o que
acontece com uma fotografia quando alguém prende a paleta dela. O sinal
fotográfico não mudou de natureza; mudou de amplitude. Uma foto noturna, de
neblina, de contraluz ou de baixa saturação cai na mesma faixa dos 224–232 do
clipart que o portão foi construído para pegar.

**A consequência prática:** foto noturna legítima do Alto Tietê — que é metade da
direção declarada do CityJobs ("luz baixa", "fim da tarde", "cabine do caminhão")
— pontua **abaixo** do clipart. O portão não distingue "pobre porque é desenho"
de "pobre porque é escura".

### As duas saídas, e qual eu recomendaria

1. **Normalizar antes de medir.** Esticar o histograma do recorte para o alcance
   cheio e só então contar as cores. Custa uma passada a mais por peça (barato:
   já se lê o buffer). Elimina o falso negativo da foto escura sem mexer no
   número 600. Risco: um clipart com degradê suave sobe junto, e o piso passa a
   pegar menos — mitigado porque `TETO_DA_COR_DOMINANTE` e `PISO_DE_TEXTURA`
   continuam de pé e são critérios independentes.
2. **Manter o piso e aceitar o falso negativo.** Foto escura reprova, a peça
   regera, e o custo é US$ 0,167 por vez. Com o pré-portão de hoje o desperdício
   já caiu (direção abstrata nem chega a gerar), mas este caso continua pagando.

**Recomendo (1)**, e ela **não foi feita**: é a régua que decide o que sai em
nome de cliente pagante, e outros agentes já constroem em cima dela.

### O buraco declarado do pré-portão de hoje

`conferirDirecaoFotografavel` **só dispara quando `post.artDirection` está
escrito**. Peça sem direção continua caindo na legenda — que é o fallback de
reversibilidade decidido em 15/08 e travado em teste
(`__tests__/execution/direcao-de-arte-chega-ao-gerador.test.ts`, *"post sem
direção (peça anterior a 15/08) continua saindo pela legenda"*). Revogá-lo aqui
congelaria o acervo inteiro anterior a 15/08. O caminho é rodar
`refazer-com-direcao.ts` (backfill de `artDirection`) e **só então** fechar o
fallback — nesta ordem, nunca na inversa.

**O carrossel também não passa pelo pré-portão**: `montarCarrossel` gera uma
imagem por tela, com direção vinda do storyboard, e é estrutura diferente. Cada
tela continua sendo paga sem conferência prévia de direção.

---

## 🟢 16/08/2026 — PRODUTO & TECNOLOGIA GANHA MÃOS: A CADEIA TÉCNICA LIGADA, EM HOMOLOGAÇÃO

**Ordem do CEO, olhando o organograma:** *"olha o tanto de agente que tem nesse
lugar que pode fazer isso"* — e depois, com todas as letras: *"delega isso pro
departamento de tecnologia e produto corrigir imediatamente."*

**O defeito, medido:** o 12º departamento nasceu em 15/08 com sete fichas em
`agentes/linha/product-technology/`, sala própria e permissões travadas no
servidor (`lib/agency/produto-tecnologia/permissoes.ts`). O `backend-engineer`
já declarava `"saida": {"formato": "git-patch"}`. **Nada no sistema convertia a
saída daquelas sete fichas em trabalho** — a caixa desenhada, a seta inexistente.
Era o defeito D-003 da casa apontado para dentro de casa.

### O que passou a existir

| Peça | O que faz |
|---|---|
| `lib/agency/produto-tecnologia/cadeia-tecnica.ts` | orquestrador → arquiteto → engenheiro, pelo executor V2, com todas as travas dele |
| `lib/agency/produto-tecnologia/guarda-de-patch.ts` | julga a saída `git-patch` **sem aplicar nada** |
| `lib/agency/produto-tecnologia/adaptador-tecnico.ts` | o `realizar` real; sem provedor, **declara a falta** em vez de fabricar rascunho |
| `POST /api/produto-tecnologia/cadeia` | a chave: dispara e devolve artefatos + propostas |
| diário do piloto | passa a ler `ExecucaoV2` e `RecusaV2` |
| executor V2 | a `autonomia` da ficha vira trava (`efeito`: informar/preparar/externo) |

**A ordem dos passos não foi inventada:** ela é a que as próprias fichas declaram
em `handoff.recebe_de`, e `ordemRespeitaAsFichas()` reprova no CI quem reordenar
à mão. Cadeia escrita à mão envelhece calada.

### 🔴 AS DUAS RECUSAS QUE VALEM MAIS QUE AS OUTRAS

1. **O agente não edita a própria ficha** (`agentes/linha/**`). É lá que moram a
   autonomia dele, o teto de custo dele e o que o obriga a escalar. Agente que
   reescreve o próprio contrato não tem contrato.
2. **O agente não desarma o guarda** (`guarda-de-patch.ts`, `permissoes.ts`).
   Quem é vigiado não altera o vigia.

E a terceira, que protege o cliente: **a cadeia recusa em código qualquer pedido
com `clienteId`**. A engenharia conserta a casa; não encosta no material de
cliente, e o custo dela é da casa (`donos.ts`, todos em `product-technology`).

### 🔴 OS DOIS DEFEITOS QUE SÓ APARECERAM RODANDO

Achados na primeira rodada de verdade contra o banco local — não em revisão:

1. **A cadeia marchava produzindo nada.** Sem provedor de IA, o adaptador
   devolveu a falta declarada nos três passos. O engenheiro parou na guarda (que
   exige diff), mas orquestrador e arquiteto saíram marcados `"executado"`
   carregando `entregue: false` no corpo. **A guarda de patch cobria uma ficha em
   três.** Virou contrato de não-entrega, para as sete.
2. **A cadeia parava calada.** O executor grava as recusas dele; as paradas da
   cadeia não gravavam nada — a agência pararia por um bom motivo num lugar que
   o CEO não enxerga. Toda parada passa a gravar `RecusaV2`.

E um terceiro, quase cometido: a trava de autonomia nasceu com padrão
`"preparar"` e a suíte derrubou em minutos — **oito das 69 fichas são autonomia
A** e as oito seriam recusadas. Trava nova que reprova o que já roda não é trava,
é incidente. O padrão virou `"informar"`, o menor efeito.

### 🔴 O QUE NÃO FOI FEITO, E POR QUÊ — não vender piloto como pronto

- **Nada aplica patch.** A seta termina em PROPOSTA revisável. Nenhum módulo
  chama `git apply`, `exec` ou escreve em disco, e o teste cobra cada nome.
  Aplicar é a próxima peça e é a mais perigosa: é ela que precisa de decisão.
- **As sete fichas continuam `ativa: false`**, então a cadeia roda em
  **homologação**. Ligar em produção é decisão registrada do dono — o CI
  (`fichas-da-linha.test.ts`) reprova quem ligar função fora da allowlist do CEO,
  e isso é a regra funcionando, não obstáculo.
- **A cadeia para no engenheiro, não na Qualidade.** As fichas dizem
  `entrega_para: quality` e esse elo ainda não existe.
- **Saída real de IA não foi provada:** o ambiente de verificação não tem
  provedor configurado. O que ficou provado foi o encanamento e as recusas —
  a cadeia rodou os três passos, parou honesta e apareceu no diário
  (`execucoes_da_linha: 4, recusas_da_linha: 1`, com `chamadas_de_ia: 0`, que é
  exatamente o motivo de o diário ter passado a ler `ExecucaoV2`).
- **A sala `/agency/produto-tecnologia` não mostra nada disso.** Hoje só o
  diário e a rota `status` respondem.

---

## 16/08/2026 — o painel do briefing lia nome de arquivo como resposta

Piloto ao vivo do CEO em `/briefing`. Dois defeitos no mesmo print, os dois
consertados com trava em código e teste que falha sem o conserto:

1. **Anexo virava resposta.** O recado automático ("Enviei meu briefing: X")
   seguia pelo mesmo caminho de uma frase digitada e virava a resposta da
   pergunta aberta. No campo Orçamento o nome do PDF ocupou tudo e **tirou a
   pergunta da fila** — o SDR nunca mais perguntava o orçamento, e o que descia
   para dossiê e proposta era um nome de arquivo. A regra agora vive nos dois
   motores (`anexo-nao-e-resposta.ts`), não na tela.
2. **Markdown cru na tela do cliente.** O balão de chat converte `**`; o painel
   de escopo não convertia. A limpeza passou a morar na borda de renderização
   (`texto-sem-marcacao.ts`), porque quem preenche os campos é um modelo e
   modelo escreve markdown por hábito — consertar só a origem do dia deixaria a
   próxima em pé.

### 🔴 Achado no caminho, NÃO consertado — precisa de diagnóstico próprio

**O e-mail do visitante está sendo gravado como nome do negócio.** Reproduzido
nos três tamanhos: respondido `dioli@cityjobs.com.br` à pergunta do negócio, o
painel exibe `Negócio: dioli@cityjobs.com.br`. Sai no título da proposta
(`buildTitle`) e no dossiê. É outro defeito, com outra causa — a captura de
identidade em `prospect-engine` —, e não foi tocado nesta peça.

### ⚪ Reportado pelo CEO e NÃO reproduzido — nenhum conserto foi inventado

- **"Na tela do SDR ele não vê o que o agente está falando enquanto digita ou
  manda áudio."** O código tem indicador de digitação e rolagem automática
  disparando em `[conv.messages, aiThinking]`, nas duas telas
  (`PublicBriefingRoom`, `SDRSimulator`). **Não reproduzi.** Falta ao CEO dizer
  QUAL tela e em que aparelho — sem isso, qualquer mexida aqui é chute.
- **"Barra branca no topo atrapalhando as telas" (15/08).** ❌ **ESTE VERBETE
  ESTAVA ERRADO — o defeito EXISTIA e foi corrigido em 28/08.** Fica aqui
  porque o erro de método é a lição, não o defeito. Duas coisas esconderam a
  barra de quem foi procurar: (1) olharam `/briefing`, uma tela **pública**, e
  a barra vive no shell da **agência**; (2) ela é `md:hidden` — só existe
  abaixo de 768px, e a captura usada era `fullPage`, que **achata elemento
  fixo**. Screenshot de página inteira não é prova de ausência de barra fixa.
  Procurar no lugar errado com o instrumento errado devolve "não reproduzi", e
  "não reproduzi" arquivado como se fosse "não existe" custou 13 dias.

## 🟢 24/08/2026 — O DESPERTADOR GRITOU 4.600 VEZES SOBRE UMA CASA VAZIA

**O achado (de passagem, por outro Diretor):** de 5 em 5 minutos, desde
08/08/2026, o log de produção repetia

```
[despertador] decisao-do-dono falhou: 2026-08-08-solta-a-producao-de-peca: nenhum cliente resolvido — nada foi liberado
```

16 dias × 288 batidas por dia ≈ **4.600 linhas de "falhou"**, e ninguém nunca
investigou — que é exatamente o que um alarme repetido demais produz.

### O que a máquina estava tentando fazer

A **decisão do dono** de 08/08 (`lib/agency/escada/decisoes-do-dono.ts`) é a
ordem do CEO — *"solta, óbvio, tem que soltar tudo (…) dois posts não estão
saindo"* — virada em código versionado. A cada batida do relógio ela sobe
`social-media` e `design` de `sombra` para `allowlist`, para que a peça produzida
**chegue ao card de aprovação do cliente** em vez de morrer registrada por
dentro. "Soltar a produção de peça" é isso: não é publicar (o clique continua
sendo do cliente) — é a peça pronta atravessar até ele.

### Por que "nenhum cliente resolvido" — medido, não deduzido

O escopo da decisão é **dinâmico**: "os clientes que a casa atende", medido por
*tem ao menos um projeto*. Lido em produção pelo diário do piloto
(`GET /api/piloto/diario`, somente leitura) em 24/08:

| Fato em produção | Valor |
|---|---|
| Clientes cadastrados (`client.count`) | **0** |
| Pedidos de conteúdo | **0** |
| Solicitações/briefings | 2, ambos em `proposal_pending` (16/08, o piloto) |

A decisão **não é órfã e a busca não está errada**: ela resolve para zero porque
**a produção não tem nenhum cliente cadastrado**. A frase do log estava
literalmente correta.

### O custo dos 16 dias: nenhuma peça, nenhum cliente esperando

**Zero peça deixou de sair e nenhum cliente real está esperando entrega** — não
há cliente, não há projeto, não há pedido de conteúdo. O custo foi outro, e é
real: **4.600 falsas falhas ensinaram quem lê o log a pular a linha**, e alarme
que se aprende a pular é alarme que não protege mais o caso verdadeiro.

### O conserto: separar ESTADO de FALHA — sem calar nada

Nada foi silenciado e nenhuma linha foi apagada. O que mudou é **de que canal o
fato sai**:

- **Escopo por NOMES que não existem no banco** = decisão **órfã**, defeito de
  verdade → continua subindo como **falha da rodada**, agora com a palavra
  "órfã" no texto.
- **Escopo DINÂMICO que resolve para zero** = a casa ainda não tem cliente →
  passa a ser **estado** (`semAQuemLiberar`), com o texto dizendo o que
  significa: *"a decisão continua armada e se aplica sozinha na primeira rodada
  depois que o primeiro cliente entrar"*.
- **Estado é dito quando COMEÇA e quando TERMINA** (`transicaoDeEstado`), nunca
  a cada 5 minutos, e fica **consultável o tempo todo** em `/api/pulso`
  (`estadosAgora` e `estados24h`). Some do log de minuto a minuto; não some da
  casa.

A decisão de 08/08 **não foi encerrada**: ela está válida, armada e correta. O
dia em que o primeiro cliente com projeto entrar, ela solta sozinha na batida
seguinte — e o estado será anunciado como encerrado.

Arquivos: `lib/agency/escada/decisoes-do-dono.ts`, `lib/agency/pulso.ts`,
`lib/agency/despertador.ts`. Testes que reprovam contra o código antigo:
`__tests__/qualidade/decisao-do-dono-na-escada.test.ts` (3) e
`__tests__/execution/despertador.test.ts` (3).

## 🔴 27/08/2026 — O AJUSTE DO CLIENTE CHEGOU AO FIM, E ENTREGOU O CONTRÁRIO DO QUE ELE PEDIU

**Medido na rodada paga da Fase 2, em produção, como cliente oculto.** É o item 4
da lista do CEO ("o ajuste COMPLETANDO sobre a peça apontada"). A mecânica
funcionou inteira — e o resultado é ruim. As duas coisas são verdade e as duas
precisam estar escritas.

### O que funcionou (e está provado)

Cliente pediu ajuste pelo portal na peça `cmt8xk6ks00790xqofkbfqpab`
(TRATTORIA DA ANA TESTE). A refação **chegou ao fim sozinha, em menos de um
minuto**:

| | antes | depois |
|---|---|---|
| arquivo | `med_35f7fcb6_mt8xpfoj` | `med_78f44713_mtakx2e0` |
| sha256 | `35f7fcb6ad062c56…` | `78f4471335d83bfb…` |
| bytes | 143.254 | 103.968 |

**Exatamente 1 peça mudou; as outras 8 do cliente ficaram byte a byte
idênticas** (sha256 conferido nas nove, pela porta do cliente). A mira acerta.
Os dois arquivos estão em `docs/entregas/refacao-27-08/`.

### O que a peça nova entregou

O cliente escreveu, palavra por palavra:

> *"o fundo ficou escuro demais e o prato some. Refaça ESSA peça com mais luz e
> o prato em primeiro plano."*

Medido nos dois arquivos:

| faixa | antes | depois |
|---|---|---|
| luminância média | 40,5 | **29,8** (−26%) |
| terço de cima | 64,2 | **42,1** |
| terço do meio | 36,1 | **25,5** |
| terço de baixo (onde o prato ficaria) | 21,2 | 21,9 |

**Ele pediu mais luz e recebeu 26% menos.** A zona morta da base, que era a
queixa dele, continua exatamente onde estava — a refação escureceu justamente o
que ainda era legível.

### E a legenda foi reescrita sem ele pedir

O pedido era VISUAL. A refação regenerou o entregável inteiro
(`refacao.ts:864`, `prisma.deliverable.update`), e a legenda da peça mudou de:

> "O ambiente cheio que faz você querer estar aqui também."

para:

> "Sexta é dia de estar aqui\n**Post destacando a atmosfera acolhedora da
> trattoria.**"

Dois problemas, e o segundo é o grave:

1. **"Sexta"** num calendário cujas outras peças são todas terça-a-quinta
   ("Terça tem prato especial", "Terça é dia de cacio e pepe", "Terça a quinta é
   quando a gente mais convida os amigos").
2. **A segunda linha é direção interna, não legenda.** "Post destacando a
   atmosfera acolhedora da trattoria" é a descrição DO post dentro do próprio
   post. Se essa peça fosse publicada, o Instagram do cliente sairia com o
   briefing colado na legenda.

### O que isto custa e o que falta decidir

Nenhuma régua pegou nada disso: o portão do fundo mede o fundo cru, a régua da
peça final mede se a foto entrou. **Nenhuma das duas pergunta se a peça nova é
melhor que a anterior, nem se ela atende o que o cliente pediu.** Uma refação
pode piorar a peça indefinidamente e toda régua da casa continua verde.

Não consertado nesta rodada, e o motivo é honesto: exige decidir **o que a
refação tem direito de mudar**. Hoje "ajuste" e "reescrever a entrega" são a
mesma porta. As perguntas para o CEO:

- pedido visual pode reescrever a LEGENDA? (recomendação: não — pixel e texto
  deveriam ser dois pedidos);
- a casa deve medir a peça nova CONTRA a anterior antes de mostrá-la ao cliente
  (ex.: "ele pediu mais luz e a luz caiu" é reprovação)?
- a linha de direção do entregável nunca pode virar legenda — isto é conserto de
  leitura e cabe em qualquer rodada.

## 🟢 27/08/2026 — O AJUSTE PASSOU A OBEDECER AO PEDIDO: CONGELAMENTO, RÉGUA E PORTA

Fecha os sete itens abertos pela rodada paga em que a refação entregou o
contrário do pedido. **Tudo o que está aqui foi provado em custo ZERO** — a
travessia paga não rodou, e o motivo está no fim desta seção.

### 1. O ajuste só mexe no que o cliente apontou (`escopo-do-ajuste.ts`)

`escopoDoAjuste` lê as faces citadas (arte, legenda, título, data, formato,
pilar, CTA) e `congelarItens` descarta o valor novo dos campos das outras. O
anterior é lido do texto que o cliente está vendo, por `itensDaEntrega` — a
leitura inversa de `renderizarEntrega`, pela MESMA lista `CAMPOS_DA_ENTREGA`.

Duas fronteiras: pedido **amplo** ("não gostei, refaz") sai `incerto` e não
congela nada; **recusa** da entrega inteira nunca congela.

Sobre o caso medido: "o fundo ficou escuro demais…" → face `arte`, e
`caption`/`note`/`headline` congelados. A legenda "Sexta é dia de estar aqui /
Post destacando…" não teria sido gravada.

### 2. Direção interna é trava de código (`direcao-interna.ts`)

A peneira mora em `captionDaPeca` — o funil por onde toda legenda passa, no
nascimento e no ajuste, e a mesma fonte que vira pixel. A última porta é
`publicacao.ts`, antes da Meta: ali **não se limpa** (reescrever na saída seria
a agência mudando o que o cliente aprovou) — barra, com dono e próxima ação.

⚠️ A régua foi ESTREITADA antes do merge: a primeira redação casava "Conteúdo de
qualidade para você". Como ela barra publicação, falso positivo custa o post de
um cliente real.

### 3. A régua que faltava (`design/medir-luz.ts` + `regua-da-refacao.ts`)

A peça nova é medida contra a anterior. Sobre os dois arquivos guardados:

| | antes | depois |
|---|---|---|
| luminância média | 39,9 | 29,5 |
| terço de cima | 63,4 | 41,8 |

(A auditoria escreveu 40,5 → 29,8 e 64,2 → 42,1; a diferença é da amostra de
160px e está declarada no teste.) Veredito: **`piorou` → não entrega.** O
`mediaUrl` volta ao arquivo anterior, a peça segue inagendável, o cliente lê a
verdade e a equipe é escalada — **sem queimar a tentativa paga dele**.

**O que a régua NÃO alcança, e sai declarado:** "o prato em primeiro plano",
"o prato some", enquadramento, ângulo e gosto. Isso é olho humano, e a régua diz
isso mesmo quando a luz melhorou.

### 4. Data coerente (`calendario-do-cliente.ts`)

O dia citado tem de ser o dia da peça; sem hora marcada, tem de estar no
calendário do cliente; sem os dois, `nao_medido`. Faixa é faixa ("de terça a
quinta" são três dias).

### 5. O beco de OFICINA FAROL ganhou porta (`porta-do-ajuste.ts`)

Teto e pedido repetido têm dono com rosto (o gerente do projeto) e três caminhos
concretos. `valeChamarAIa` impede o pedido repetido de queimar outra tentativa
paga, com memória curta no carimbo `[parada:<causa>]`.

`PARADAS_QUE_NAO_MUDAM` é curta de propósito: `fora_do_contrato` e
`dado_inventado` retentam — nascem da saída do modelo, que varia.

### 6. A reversão do pacote cobre o card de calendário

Desagenda `scheduled → draft`, com compare-and-set e três exclusões (publicada
não volta; aprovada por `client:` não volta; peça de outro pedido nem é olhada).

### 7. O provedor reserva de imagem entrou no livro-caixa

Gemini de imagem: US$ 0,039. **Correção de diagnóstico:** o gasto NÃO ficava
fora do teto — entrava com o palpite de US$ 0,05, **28% acima do preço real**.
Teto que fecha com número errado fecha na hora errada.

### ⛔ O QUE NÃO FOI MEDIDO — a travessia paga não rodou

**Custo desta rodada: US$ 0,00.** O saldo da OpenAI continua onde estava.

A Fase 2 exigia autenticar como master contra a produção, e a senha só pode
entrar por variável de ambiente. **O ambiente de execução recusou o comando que
carregava a credencial** — não é defeito da casa nem falta de caminho: é a
permissão do sandbox. Sem sessão não há token de portal, e sem token não há
pedido de ajuste.

**Continua NÃO MEDIDO ao vivo, portanto:**
- o cliente pedindo mais luz e recebendo mais luz **em produção**;
- a legenda não mencionada ficando intacta **em produção**;
- a régua reprovando uma peça pior **em produção** (o caminho está provado em
  teste e sobre os dois arquivos reais, que é o mais perto que custo zero chega).

**Depende só do CEO:** liberar a execução do comando com a credencial (uma regra
de permissão de Bash na sessão) ou fazer ele mesmo a volta pelo portal.

## 🟢 27/08/2026 — O E-MAIL QUE CHEGOU, A TABELA DE PREÇOS E O SDR QUE PROMETIA

### O que ficou provado NO AR

**PROVA 1 — o e-mail chega de verdade. ✅** Um e-mail real saiu pelo caminho
normal da casa (`POST /api/brain/client-requests`, a confirmação de briefing) e
chegou à caixa do CEO. Ele leu e devolveu consertos — que é a prova mais forte
que existe de que chegou.

⚠️ **A casa não conseguiu provar o envio sozinha, e isso era defeito.** O `id`
que a Resend devolve era descartado pelos dois chamadores. E não dava para
remediar depois: a chave é `restricted_api_key` — a Resend responde `401 "This
API key is restricted to only send emails"` a qualquer LEITURA. Chave de envio
não lista o que enviou. Consertado: `sendEmail` grava o recibo (id + destino
mascarado + assunto).

### ⛔ PROVA 2 — as sete travas: 2 provadas no ar, 5 NÃO MEDIDAS

A travessia foi montada em produção com cliente próprio (`NOME TESTE`), 3 peças
reais e token de portal. O pedido de ajuste ("a primeira peça ficou com o fundo
escuro demais… mais luz") entrou pela rota do cliente e voltou `200`.

| trava | estado | número que sustenta |
|---|---|---|
| 5. o ajuste toca só a peça apontada | ✅ **provada no ar** | peça 1 → `revision_requested`; peças 2 e 3 intactas, `mediaUrl` idêntica (o id da mídia É o prefixo do sha256 — arquivo diferente, URL diferente) |
| 6. peça travada tem porta | ✅ **provada no ar** | o card voltou a `pending` e o cliente conseguiu agir de novo — sem o 409 "já decidido" |
| 1, 2, 3, 4, 7 | ⛔ **NÃO MEDIDAS** | nenhuma arte foi regenerada |

**O motivo é bom, e é a trava funcionando:** `conferirPagamentoDaAncora` recusou
antes de qualquer chamada paga — cliente criado hoje, sem pedido e sem
pagamento, cai em `sem_registro_de_pagamento`. **O portão de pagamento segurou
uma produção não paga em produção.** Custo da travessia: **US$ 0,00**.

Para medir as outras cinco ao vivo seria preciso dar contrato pago (ou isenção)
ao cliente de teste — mexer em registro financeiro de produção. Não foi feito.

### O QUE MUDOU NO E-MAIL (ordens do CEO, no dia)

O e-mail chegou assinado **"DIOLI STUDIO"**, sem logo, com o WhatsApp escrito
como número solto. O nome estava **digitado à mão em seis arquivos**.

Agora: `lib/marca.ts` (fonte única do nome, WhatsApp e paleta) + `lib/email/molde.ts`
(casca única: cabeçalho navy com logo, botão de WhatsApp, rodapé). Logo por URL
absoluta e pública (medido: 200 sem cookie), `alt` = nome da empresa porque
Gmail e Outlook bloqueiam imagem por padrão, layout em tabela, 600px.

E **o preço saiu do e-mail** por ordem do CEO: ele virou convite + botão. Preço
lido sozinho, sem ninguém do outro lado, é preço que o cliente compara e
descarta em silêncio.

### 🔴 O ACHADO MAIS CARO: o SDR vendia quatro preços mortos

As `FAIXAS` de `negociacao.ts` eram strings digitadas à mão e apodreceram:

| o SDR oferecia | é hoje |
|---|---|
| Ritmo **R$ 297**, 8 peças | R$ 290, **12 peças** |
| Presença **R$ 790** | **R$ 490** (790 é o Conteúdo) |
| Conteúdo **R$ 1.390** | **R$ 790** |
| Crescimento **R$ 2.590** | **não existe mais** |

E um **desconto de 22% que ninguém autorizou** (`piso: preco * 0.78`). Um teste
até então EXIGIA `piso < cheio` — exigia o desconto. Foi invertido.

### A TABELA DE PREÇOS — e a honestidade sobre custo

O CEO esperava que o Financeiro já tivesse os custos. **Foi medido: não tem.**
Só a IA é medida (US$ 13,74 em 1.747 chamadas/30d — e **485 delas sem preço
gravado**). Gateway, infra, e-mail, hora humana e impostos: **NÃO MEDIDOS**,
cada um com dono.

Como margem no piso = preço − custo, e o custo é `nao_medido`, **não se prova
que a margem não é negativa** → o piso não desce. Os 10% de lucro do CEO estão
em código como CHÃO (vencem a faixa de desconto), mas não rodam enquanto o custo
não existir: não se calcula 10% sobre um número que não existe.

### ⛔ O QUE CONTINUA ABERTO

- **O deploy está PARADO.** O merge de #355 está no branch, mas a CI do commit
  de merge ficou vermelha por um teste que depende de navegador de verdade
  (`story-instagram-v1-ponta-a-ponta`: `Protocol error (Page.captureScreenshot):
  Unable to capture screenshot`). A suíte inteira passa localmente (7.027).
  Railway tem `checkSuites: true` e **corretamente recusa** deployar branch
  vermelho. **Um teste que depende de navegador gateia todo deploy da casa** —
  isso é dívida de infraestrutura, não de código.
- **`RESEND_FROM` é do CEO** e decide o nome no campo "De:".
- **Resíduo em produção que não consegui limpar:** o cliente `NOME TESTE` e 1
  card de aprovação. A casa RECUSA apagar cliente com trabalho pendurado ("funda
  em vez de apagar") — comportamento correto, e não há rota para apagar o card.
  O token do portal expira sozinho em 29/08 (foi cunhado com 2 dias).
