# O número que o teste protegia — 29/08/2026

## A frase que saía ao cliente pagante

Por cron diário, sem revisão humana, quem já tinha comprado 4 peças avulsas
recebia:

> Oi, José. Já são 4 peças que você pediu avulsas aqui — a última foi seu
> carrossel até 5 telas. Existe o pacote do mês (R$ 290 por mês): **8 peças
> por mês**, você aprova pelo portal e publica quando quiser. Se quiser que
> eu te explique o que entra, é só responder.

A partir desta correção, a mesma situação (fonte inalterada) gera:

> Oi, José. Já são 4 peças que você pediu avulsas aqui — a última foi seu
> carrossel até 5 telas. Existe o pacote do mês (R$ 290 por mês): **12
> peças por mês**, você aprova pelo portal e publica quando quiser. Se
> quiser que eu te explique o que entra, é só responder.

O preço (R$ 290) já saía certo — ele já era lido da fonte. Só o volume estava
redigitado.

## De onde vem cada número, agora

| Número | Fonte | Como é lido |
|---|---|---|
| `R$ 290` | `lib/agency/planos.ts` — `PLANOS.find(p => p.id === "ritmo").preco` | `precoParaOferecer("balcao-pacote-mes")`, dentro de `planoDoDegrau()` (`lib/agency/esteira/recompra.ts`) — já era assim antes desta correção |
| `12 peças por mês` | `lib/agency/planos.ts` — `PLANOS.find(p => p.id === "ritmo").pecasPorMes` | `planoDoDegrau()` (`lib/agency/esteira/recompra.ts`), lida **dentro da função**, nunca no topo do módulo |
| `4 peças que você pediu avulsas` | contagem real de projetos de balcão do cliente | `prisma.project.count(...)` em `rodarReguaDeRecompra` (`recompra.ts`), passado como `a.compras` |
| `Faz 30 dias` / `Faz dois meses` / `Faz três meses` | o próprio `marco` recebido (30/60/90) | tabela `FRASE_DO_MARCO: Record<Marco, string>` (`recompra.ts`), indexada pelo tipo `Marco` — se `MARCOS` mudar, o compilador exige atualizar a tabela junto |

## Por que a afirmação antiga do teste estava errada

`__tests__/esteira/recompra.test.ts:132` (antes desta correção) continha:

```ts
expect(varias).toContain("8 peças por mês");
```

Isso não protegia o comportamento certo — **exigia** o comportamento errado.
O teste passava (verde) precisamente enquanto o código mentia para o
cliente. Um teste verde sobre um número errado é **pior que teste nenhum**:
sem teste, ninguém tem falsa confiança; com esse teste, qualquer tentativa de
consertar o "8" para "12" quebraria a suíte, e a suíte vermelha teria (do
jeito errado) desencorajado o conserto certo.

## De onde veio o "8"

Antes de 26/08/2026, o item de balcão `balcao-pacote-mes` tinha preço PRÓPRIO
(R$ 297, piso R$ 229) e volume PRÓPRIO (8 peças) — uma segunda tabela para a
mesma mensalidade que a vitrine vendia por outro preço e outro volume
(`lib/agency/self-serve-catalog.ts:175`, comentário no código). Em 26/08 o
item virou literalmente o Ritmo: preço e piso passaram a ser derivados de
`PLANOS` (`self-serve-catalog.ts:184-197`, `label`/`description`/
`deliverables` já citam `RITMO.pecasPorMes` = 12). O texto do toque de
recompra, em `recompra.ts`, não foi atualizado junto — ficou com o "8" de
antes da fusão, um resíduo textual da tabela que deixou de existir.

## O que a trava nova barra, e o que ela deixa passar

Trava 5, `numerosDePecasNaoAncorados` (`recompra.ts`): varre o corpo
final do toque por qualquer ocorrência de `<número> peça(s)` e reprova
(`ok: false`, sem `clientNotice.create`, sem `avisarCliente`) se algum número
encontrado não estiver na lista de números que o código **realmente**
derivou da fonte para aquele toque (`a.compras` e, quando citado,
`plano.pecasPorMes`).

- **Barra:** qualquer literal de volume redigitado à mão que discorde da
  fonte — o caso concreto que gerou esta ficha ("8" quando a fonte diz "12").
  Barra também se a fonte for alterada para um valor inválido
  (`pecasPorMes: 0`, negativo, fracionário ou ausente): nesse caso
  `planoDoDegrau()` já devolve `pecasPorMes: null` e o texto nem chega a
  citar o pacote do mês — a trava de volume nem precisa disparar, porque o
  fail-closed de `redigirToque` age antes.
- **Deixa passar:** o corpo legítimo, onde o único número de peça citado é
  `a.compras` (contagem real) ou `plano.pecasPorMes` (lido da fonte no
  momento da chamada). Provado nos dois lados em
  `__tests__/esteira/recompra.test.ts` (descreve "a trava de volume").

O que ela **não cobre**: números que não sigam o padrão `"<dígitos> peça(s)"`
(ex.: "peças" por extenso, "doze peças") — decisão deliberada, para não gerar
falso positivo em texto natural; os moldes desta régua são fixos e escritos
por extenso, nunca gerados por IA, então esse padrão cobre o vetor real de
erro (dígito redigitado).

## O que ficou DECLARADO e não consertado

A varredura de irmãos foi feita pelo especialista `qualidade` (leitura, sem
escrita) sobre `lib/`, `app/`, `components/` e `scripts/`, ignorando
`lib/generated/`. **Um só número errado chegava ao cliente, e é o que este PR
conserta.** O resto está abaixo, com o comando que o achou — varredura que não
mostra por onde passou não é varredura.

### 🟡 MESMO DEFEITO, ainda coincidente — vai virar frente própria

`lib/agency/planos.ts`, dentro do próprio array `PLANOS`, escreve o volume à
mão no texto de `inclui[]`, a poucas linhas do campo estruturado `pecasPorMes`
do MESMO objeto:

| Linha | String literal | `pecasPorMes` do mesmo plano | Bate? |
|---|---|---|---|
| `planos.ts:169` | `"12 peças por mês — carrossel de até 6 telas ou post único, com a arte pronta"` | `ritmo` = 12 | sim |
| `planos.ts:194` | `"Tudo do Ritmo, com 20 peças por mês"` | `presenca` = 20 | sim |
| `planos.ts:229` | `"Tudo do Presença, com 36 peças por mês — a capacidade INTEIRA da casa"` | `conteudo` = `CAPACIDADE_MENSAL` = 36 | sim |

Comando que achou:

```
grep -rn 'peças por mês\|peças/mês\|peças por mes' lib app components scripts \
  --include=*.ts --include=*.tsx
```

**Chega ao cliente:** sim — `p.inclui` é renderizado em `app/planos/page.tsx`,
página pública `/planos`.

**O agravante, e é o mesmo desta ficha:** existe um teste que LÊ esses números
(`__tests__/comercial/a-vitrine-nao-promete-acima-do-teto.test.ts:129-136`,
regex `/(\d+)\s*peças por mês/`) e só confere se são `<= TETO_MENSAL`. Ele
**não** confere `número da frase === p.pecasPorMes`. Mude `pecasPorMes` para 10
e deixe a frase dizendo 12: o teste continua verde e o cliente continua lendo
12 na vitrine. É o mesmo formato do defeito que abriu este documento, com uma
rodada de atraso.

**Por que NÃO foi consertado aqui, e não é preguiça:** hoje os três batem —
nenhum número errado chega a ninguém. E `planos.ts` é a fonte de preço da casa,
vizinha de uma frente viva (`comercial-rotulo-de-recorrencia`, que segura
`financeiro/tabela-de-precos.ts` e `comercial/negociacao-da-proposta.ts`, ambos
importando `PLANOS`). A própria máquina de reivindicação recusou abrir esta
frente a partir deste branch — *"este branch tem 1 commit que o deploy não tem"*
—, que é a casa dizendo, por mecanismo, que isto é outra frente e outro PR.
Misturar os dois faria um PR sobre número redigitado ficar impossível de
mesclar por causa do arquivo mais disputado do repositório.

**Fica agendado como frente própria:** `esteira/volume-redigitado-no-inclui` —
uma constante por plano, usada nas duas pontas (`inclui[]` e `pecasPorMes`), e
a asserção que falta no teste da vitrine. Nenhum valor muda.

### ⚪ PODRIDÃO DE COMENTÁRIO — não chega a ninguém, não foi tocada

- `lib/agency/comercial/verba-declarada.ts:241` — comentário diz *"o Ritmo é
  R$ 297/mês MAIS R$ 390 na entrada"*. A fonte diz `preco: 290` e
  `implantacao: null`. **Duas vezes errado, e é comentário:** o texto executado
  logo abaixo usa `precoEmReais(p.preco)` e `p.implantacao` de verdade.
- `lib/agency/planos.ts:9` — comentário de cabeçalho diz *"é só por isso que
  R$ 49 e R$ 297 fecham"*. Pulso = 49 bate; Ritmo = 290, não bate.

Ambos são cicatriz do dia em que o Ritmo era R$ 297. Não chegam ao cliente e
não têm teste que os proteja. Ficam declarados porque comentário que mente ao
lado do código certo é o que produz o próximo "8 peças por mês" — só que na
cabeça de quem lê, não no arquivo.

### ⚪ A BORDA QUE A TRAVA NOVA NÃO COBRE

`numerosDePecasNoRotulo` confia nos números que estão dentro de
`Ancora.itemLabel`, porque o rótulo vem de `SELF_SERVE_CATALOG`, que deriva de
`PLANOS`. Se um dia alguém cadastrar um `label` de catálogo digitado à mão com
número que não veio da fonte, esta trava o aceita. Quem cobre essa borda é a
régua do catálogo, não esta. Declarado, não escondido.

### ⚪ O QUE NÃO FOI MEDIDO, de propósito

O cron (`POST /api/cron/recompra`) **não foi disparado** e nenhuma mensagem foi
enviada a pessoa real — ordem explícita da ficha. A leitura da frase literal
que sai ao cliente foi feita executando `redigirToque` e `registrarToque` com o
banco mockado. O que isso NÃO prova: que a rota do cron, com banco real,
seleciona os mesmos clientes. Isso continua sem medição ao vivo.

### ⚪ AMBIENTE, não repositório

`node_modules/tsx/dist/cli.mjs` está corrompido nesta máquina (48 bytes de lixo
de shell, `/bin/bash: line 1: unalias: unsetenv: not found`), então
`npm run reivindicar` quebra com erro obscuro. Contorno usado:
`node node_modules/tsx/dist/cli.cjs scripts/reivindicar.mts ...`, que está
íntegro. **`node_modules` não é versionado — isto não é defeito deste
repositório e NADA foi "consertado" no código nem no `package.json`.**

## Rodada 2 (29/08/2026) — a trava nasceu com só a metade que barra

A primeira versão de `numerosDePecasNaoAncorados` + a montagem de `ancorados`
em `registrarToque` provava que a trava barra o "8" plantado. **Não provava
que ela deixa passar o caso limpo real**, porque o teste que deveria provar
isso chamava a função pura direto, montando `ancorados` à mão no próprio
teste — nunca passava pela montagem de `ancorados` dentro de
`registrarToque`, que é onde o defeito morava.

O PM rodou `registrarToque` de verdade com um cliente que comprou o
`balcao-pacote-mes` (compra real e possível: está no catálogo, tem piso,
`precoParaOferecer` autoriza). Saída literal, marco 30, `compras: 1`:

```
CORPO 30: Oi, José. Faz 30 dias que entreguei seu pacote mês — 12 peças. Se quiser
outra peça do mesmo tipo, eu produzo por R$ 290 — é só me responder por aqui. (...)

RESULTADO: {"ok":false,"motivo":"texto barrado pela trava de números de peça não
ancorados na fonte (12) — marco 30, cliente cli-1"}
clientNotice.create chamado? 0
```

**O cliente legítimo perdia o toque.** Causa: `self-serve-catalog.ts:186` monta
`label: \`Pacote mês — ${RITMO.pecasPorMes} peças\`` — o rótulo **já vem da
fonte**, com "12 peças" dentro. No marco 30 `plano` é `null` (só é consultado
no marco 60, e só para `compras >= 2`), então `ancorados` continha apenas
`a.compras`, e o "12" do rótulo aparecia como número não ancorado — a trava
chamando a própria fonte de mentira, porque não olhava para dentro de
`a.itemLabel`.

### O conserto

`numerosDePecasNoRotulo` (`recompra.ts`, ao lado de `numerosDePecasNaoAncorados`)
extrai, com o mesmo `NUMERO_DE_PECAS`, os números que já estão dentro do rótulo.
`ancorados`, em `registrarToque`, passou a incluir esses números — além de
`a.compras` e `plano.pecasPorMes`, que já estavam lá. O rótulo é texto
DERIVADO do catálogo (que deriva de `PLANOS`), não é redigitado; por isso
confiar nos números que aparecem nele não reabre a porta que a trava original
veio fechar.

**A borda declarada:** se um dia alguém cadastrar um `label` de catálogo
digitado à mão, com número que não veio de `PLANOS`, esta trava confia nele —
quem cobre essa borda é a régua do próprio catálogo, não `numerosDePecasNoRotulo`.

### A prova, e por que o segundo caso do pedido não foi fabricado

`__tests__/esteira/recompra.test.ts`, descreve "a trava de volume", ganhou um
teste que chama `registrarToque` de verdade com `itemDeCatalogo:
"balcao-pacote-mes"` e `itemLabel` lido do próprio `SELF_SERVE_CATALOG` — ele
fica VERMELHO com o código de antes desta rodada e VERDE depois, o que prova
que o conserto vale (e não só o diff).

O pedido original também previa um segundo teste de integração, plantando um
número inventado via `itemLabel` (ex.: `"Pacote 99 peças"`) para provar que
`registrarToque` continua barrando o caso ruim. Ele não foi escrito: depois do
conserto, `numerosDePecasNoRotulo` ancora qualquer número que esteja dentro de
`a.itemLabel`, então esse vetor específico deixou de ser invenção — plantar
assim provaria o oposto do que o teste precisa provar. Levantamento dos
caminhos reais pelos quais um número de peça chega ao corpo do toque
(`a.itemLabel`, `a.compras`, `plano.pecasPorMes` — os três, e só os três, que
`redigirToque` usa para escrever "<número> peças") mostra que, depois deste
conserto, o único vetor de invenção que sobra é o CÓDIGO redigitado à mão
dentro do molde — o mesmo "8 peças por mês" que abriu esta trava — e esse
vetor não passa por nenhuma `Ancora`. É exatamente o que o teste unitário de
`numerosDePecasNaoAncorados` (o "8" plantado, já existente) prova direto na
função pura. Por isso ele segue sendo a metade "barra o plantado" desta
trava, e nenhum caso falso foi criado só para ter simetria de forma.

**Trava que nasceu com uma metade só é parte da história desta correção, não
vergonha a esconder** — por isso esta seção, e não uma reescrita silenciosa da
seção original acima.
