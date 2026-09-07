# A carta — preço por serviço (REFEITO 30/08/2026 — correção de enquadramento do CEO)

> Despacho original: `.despachos/D1-tabela-unitaria.md`. Este documento foi
> **refeito** por ordem do CEO em `.despachos/D2-carta-e-o-produto.md`, porque a
> primeira versão descrevia a casa com uma arquitetura errada: presets de um
> lado, e um caminho separado — tratado como situação especial — para quem
> pede outra coisa. **Não é essa a casa.**
>
> As palavras do CEO: *"Não existe volume acima ou abaixo. O pacote é um
> produto predefinido. Se o cliente quiser trezentos carrosséis por dia, a
> gente vai ter que dar um jeito. Entenda que não é que esse é uma exceção. O
> que ele está comprando é um pacote personalizado."*
>
> **Este documento não decide preço nenhum — decide o CEO.** Todo número abaixo
> tem procedência: arquivo e linha, ou a conta que o produziu.

## ⚠️ Como este documento foi feito — leia antes dos números

Nem a primeira sessão nem esta conseguiram executar `node`, `npx tsx` ou
`npm test` — o ambiente recusa com *"This command requires approval"*. Todo
número abaixo saiu de **ler o código linha a linha**
(`lib/agency/planos.ts`, `lib/agency/financeiro/tabela-de-precos.ts`,
`lib/agency/contrato-de-quantidade.ts`, `lib/agency/self-serve-catalog.ts`,
`lib/agency/capacidade-de-producao.ts`) e conferir à mão contra o que os
testes afirmam. **Antes de imprimir a carta, rode:**

```
npx vitest __tests__/comercial/so-vende-o-que-produz.test.ts __tests__/financeiro/tabela-de-precos.test.ts __tests__/comercial/a-tabela-e-uma-so.test.ts
```

---

## O MODELO — o que estava errado, e o que é certo agora

❌ **Errado (a versão anterior deste documento):** existe o plano, e existe um
caminho separado para quem quer volume diferente do plano.

✅ **Certo:** existe **a carta item a item** — o preço de cada peça, em cada
motor de produção que a casa tem. **Todo pedido, sempre, é uma composição
dessa carta.** Um "plano" (Pulso, Ritmo, Presença, Conteúdo) não é um produto à
parte: é **uma composição pré-montada, vendida com desconto sobre a mesma
carta**. É um atalho de compra — não é o produto.

Duas consequências, e elas mudam a leitura de tudo daqui para baixo:

1. **Nenhum pedido fica sem preço.** Um pedido que não bate com nenhuma
   composição pré-montada recebe **a conta item a item**, na hora — nunca "vou
   verificar".
2. **A capacidade de produção comprovada da casa hoje — 36 peças/mês por
   contrato de cliente (`CAPACIDADE_MENSAL`, `planos.ts:57`; a mesma conta em
   `contrato-de-quantidade.ts:89`, 3 levas × 12) — é um teto de ENTREGA, não um
   teto de VENDA.** Pedido que passa dele tem número igual a qualquer outro; o
   que muda é o prazo, e a decisão de escalar produção (contratar gente, abrir
   mais um motor de produção em paralelo) — e essa decisão é do CEO, não desta
   carta. Ela nunca vira "não temos isso para você".

## 🔴 Achado 0 (novo nesta rodada) — o código ainda fala a língua antiga

Isto é um achado de leitura, **não conserto** — a entrega desta rodada é só o
documento. Mas precisa constar, porque é exatamente o defeito que o CEO acabou
de corrigir, e ele já está em produção:

- `financeiro/tabela-de-precos.ts:413-423` (`podePrometerVolume`) devolve
  `pode: false` com a frase *"passa da capacidade da casa [...] Vender acima
  do que se produz é dívida com outro rosto"* para qualquer volume acima de 36
  peças/mês. Não devolve preço nem prazo — devolve recusa.
- `financeiro/tabela-de-precos.ts:461-479` (`volumeQueACasaVende`) devolve
  `vende: false, frase: "X peças/mês não cabe em nenhum plano da casa"` para o
  mesmo caso.

**As duas funções são código, hoje, do enquadramento que o CEO acabou de
proibir.** Recomendo ao PM abrir uma frente de código para as duas: em vez de
recusar, devolver a composição item a item com o preço e o prazo — nunca
`pode: false` por causa de volume. Não fiz essa mudança porque este despacho é
só documento.

## Achado 1 — o Departamento Financeiro já existe, e não é o da Control Room

O despacho original pedia para declarar o Financeiro inexistente. **Existe,
já mesclado, testado, com ordem própria do CEO:**
`lib/agency/financeiro/tabela-de-precos.ts` (27/08/2026). Ele:

- Lê os 4 presets de `planos.ts` — **não os redigita** (`tabela-de-precos.ts:191-203`).
- Mede o único custo que a casa mede (IA, ~US$ 0,17/peça) e declara os outros
  cinco como `nao_medido`, cada um com motivo e dono (`:115-150`).
- Trava o piso de desconto em **0%** enquanto o custo tiver buraco — *"margem
  calculada sobre custo incompleto é pior que margem nenhuma"* (`:225-260`).
- Fixa o chão de lucro em **10% do preço** (`:268-297`).
- Já é lido por `comercial/negociacao-da-proposta.ts` e `comercial/negociacao.ts`.

## Achado 2 — duas leituras vivas do mesmo item, e não são a mesma coisa

Existem **três preços diferentes para uma peça fora da composição de um
preset**, e cada um vale para uma situação distinta — o problema não é que
existam três, é que ninguém declarou qual vale quando:

| Motor de produção | Quando se aplica | Preço (post / carrossel) | Fonte |
|---|---|---:|---|
| **Peça extra dentro do preset** | Cliente já tem um preset ativo e quer peça além da cota contratada. Mesma esteira, sem diferenciar post/carrossel. | **R$ 90** (indiferenciado) | `planos.ts:64`, exibida em `app/planos/page.tsx:203-205` |
| **Balcão, 100% máquina** | Pedido novo, sem preset, sem revisão humana, pago antes de produzir. | **R$ 79 / R$ 129** | `self-serve-catalog.ts:71-102` |
| **Com direção de arte humana** | Pedido novo, sem preset, com direção de arte e 2 rodadas de ajuste. Nomeado `avulso_post`/`avulso_carrossel` no código. | **R$ 190 / R$ 290** | `tabela-de-precos.ts:211-212` |

O risco é **latente, não ativo**: hoje só o R$ 90 aparece numa tela que o
cliente vê. Mas o comentário de quem escreveu o R$ 190/290
(`tabela-de-precos.ts:174-178`) mostra que ele descreve **o mesmo tipo de
peça** que o R$ 90 descreve, só que com um processo de produção diferente
(direção humana). No dia em que uma tela mostrar as duas linhas juntas, o
cliente vê preços de **2,1× a 3,2×** para "a mesma coisa" — sem ninguém ter
decidido isso.

**Recomendação:** os três motores podem conviver, porque descrevem processos
de produção diferentes — mas isso precisa estar **escrito e nomeado** (ex.:
`pecaExtraDentroDoPreset`, `pecaBalcao`, `pecaComDirecaoDeArte`), não um nome
no código (`avulso_post`/`avulso_carrossel`) que hoje aponta para duas
leituras diferentes ao mesmo tempo. Ver "o que decide
o CEO", item 1.

## Achado 3 (sem risco ativo) — um piso órfão

`self-serve-catalog.ts:194-197` guarda `precoMinimo` = **R$ 226** para o
"Pacote mês" do balcão — resíduo de um desconto de 22% que o CEO **revogou**
em 27/08/2026. A negociação real do preset Ritmo já usa o piso certo (R$ 290,
zero desconto — `negociacao.ts:318-323`); esse campo não é lido por nada em
produção hoje. Não é bloqueante; PM decide se limpa.

---

## 1. A carta — as unidades atômicas, com procedência

### 1.1 — Peça (post, carrossel, story), nos três motores de produção

| Item | Motor | Preço | Prazo | Quando usar |
|---|---|---:|---|---|
| Post — peça extra do preset | peça extra | R$ 90 | conforme o ciclo do preset | cliente já com preset ativo |
| Carrossel — peça extra do preset | peça extra | R$ 90 | conforme o ciclo do preset | idem |
| Post (balcão) | máquina, sem revisão | R$ 79 | 2d úteis | pedido novo, sem preset |
| Carrossel até 5 telas (balcão) | máquina, sem revisão | R$ 129 | 2d úteis | pedido novo, sem preset |
| 1 story (balcão) | máquina, sem revisão | R$ 35 | 1d útil | pedido novo, sem preset |
| 4 stories (balcão) | máquina, sem revisão | R$ 99 | 2d úteis | pedido novo, sem preset |
| Legenda / copy unitária | só texto | R$ 39 | 1d útil | pedido novo, sem preset |
| Post, com direção de arte (`avulso_post` no código) | máquina + direção humana, 2 rodadas | R$ 190 | a combinar | pedido novo, recorrente, sem preset |
| Carrossel, com direção de arte (`avulso_carrossel` no código) | máquina + direção humana, 2 rodadas | R$ 290 | a combinar | idem |

Fontes: `planos.ts:64`; `self-serve-catalog.ts:71-155`;
`tabela-de-precos.ts:208-212`. Nenhum desconto está autorizado hoje em nenhuma
dessas linhas (`descontoAutorizadoPct: null` em todas — `tabela-de-precos.ts:208-212`):
sem faixa aprovada pelo CEO, o piso de negociação **é** o preço de tabela.

### 1.2 — Outros itens do balcão, com produtor de verdade

| Item | Preço | Entrega | Fonte |
|---|---:|---|---|
| Pacote mês (= preset Ritmo, vendido no balcão) | R$ 290 | mensal | `self-serve-catalog.ts:184-202` |
| Setup Meta Ads | R$ 380 | 3d úteis | `self-serve-catalog.ts:297-306`, `lib/integrations/meta/ads.ts` |

### 1.3 — Itens que a casa não produz hoje — isto é prazo, não recusa de venda

Estes itens estão no catálogo mas o código já os bloqueia na vitrine porque
**falta o produtor** — nenhuma linha de produção real os entrega hoje. Isso
**não é "não vendemos"**: é "não produzimos ainda", e a diferença importa —
vira uma conversa de prazo e de construir o que falta, decisão do CEO abrir
ou não essa frente.

| Item | Preço de referência no catálogo | Falta o quê | Fonte |
|---|---:|---|---|
| Auditoria de perfil | R$ 149 | produtor de relatório de diagnóstico — a esteira produz PEÇA, não relatório | `capacidade-de-producao.ts:166-174` |
| Banner Digital | R$ 120 | gerador de PDF — não existe no repositório | `capacidade-de-producao.ts:157-165` |
| Identidade Básica | R$ 480 | logotipo real — a casa só deriva monograma das iniciais | `capacidade-de-producao.ts:145-156` |
| 1 Reel | R$ 350 | legenda animada em vídeo — a edição corta e tira capa, não anima texto | `capacidade-de-producao.ts:136-144` |
| Pack 2 Reels | R$ 620 | mesma falta acima | idem |

**Se um cliente pedir um destes:** a resposta certa é "hoje não produzimos
isto — para vender com responsabilidade, primeiro precisa existir quem
produza; é uma decisão do CEO se vale abrir essa frente, e quanto tempo leva."
Nunca "não vendemos isto" como se fosse definitivo, e nunca um preço sem
produtor por trás.

**Sobreposição já registrada no código, decisão pendente do CEO** (não deste
documento): `pack-4-stories` (R$ 150), `pack-8-stories` (R$ 270),
`pack-4-posts` (R$ 220), `pack-8-posts` (R$ 400) — categoria "social", legado
— passam na régua de capacidade e entregam quase a mesma coisa que
`balcao-4-stories` (R$ 99) por preço diferente (`self-serve-catalog.ts:204-208`).
Não decido qual fica; só confirmo que a pendência segue aberta.

### 1.4 — O que hoje é projeto à parte, não mensalidade

Vídeo (gravação, edição, geração), posicionamento/identidade de marca, site e
página de captura, verba de mídia (`planos.ts:270-290`,
`FORA_DE_TODO_PLANO`). **Isto não é "fora da carta" — é um formato de venda
diferente:** projeto com prazo próprio, não assinatura mensal.

- Tráfego pago e identidade visual/rebranding têm **faixa** hoje
  (R$ 500–1.200 e R$ 1.200–2.500 a R$ 2.000–4.000, `service-catalog.ts:47-85`),
  mas nenhuma proposta fecha um número: `live-calculator.ts:396-440` sempre
  escreve *"orçado à parte"*, sem valor fixo.
- Vídeo e identidade visual completa não têm nenhum caminho de produção real
  hoje (mesma lacuna da seção 1.3) — para vender com número fechado, primeiro
  precisa existir quem produza. É decisão do CEO abrir essa frente; até lá,
  um pedido nessa linha vira "hoje não produzimos, aqui está o prazo estimado
  para montar" — não um preço inventado.

---

## 2. Os presets — composições pré-montadas, com o desconto explícito

Um preset é uma composição de peças **já fechada e vendida com desconto**
sobre o preço que a mesma quantidade custaria comprada item a item. O desconto
muda dependendo de qual das três linhas da seção 1.1 se usa como referência —
e por isso ele é mostrado nas duas leituras, até o Achado 2 fechar.

| Preset | Preço/mês | Peças/mês | Preço por peça | Fonte |
|---|---:|---:|---:|---|
| Pulso | R$ 49 | 0 (não entrega peça) | — | `planos.ts:138,152` |
| Ritmo | R$ 290 | 12 | R$ 24,17 | `planos.ts:159,183` |
| Presença | R$ 490 | 20 | R$ 24,50 | `planos.ts:189,216` |
| Conteúdo | R$ 790 | 36 | R$ 21,94 | `planos.ts:224,248,57` |

### O desconto do combo, contra as duas réguas do Achado 2

**Leitura A — usando R$ 90 (peça extra dentro do motor do preset)**, a mesma
régua que a própria casa usa para essa comparação:

| Preset | Mesma quantidade item a item | Preço do preset | Desconto em R$ | Desconto em % |
|---|---:|---:|---:|---:|
| Ritmo (12 peças) | 12 × 90 = R$ 1.080 | R$ 290 | R$ 790 | **73,1%** |
| Presença (20 peças) | 20 × 90 = R$ 1.800 | R$ 490 | R$ 1.310 | **72,8%** |
| Conteúdo (36 peças) | 36 × 90 = R$ 3.240 | R$ 790 | R$ 2.450 | **75,6%** |

⚠️ **Incompleto por construção:** Presença e Conteúdo incluem itens sem preço
unitário na carta hoje — publicação no Instagram/Facebook, gestão de
avaliações, atendimento humano por WhatsApp, sequências de stories, pesquisa
de concorrência, plano de medição, reunião mensal (`planos.ts:193-199,228-235`).
O desconto real é **maior** que a tabela mostra, porque falta o preço desses
itens no numerador.

**Leitura B — usando R$ 190/290 (motor com direção de arte)**, se o Achado 2
for resolvido nesse sentido: o desconto do Conteúdo passa de 75,6% para
**~89%** (36 peças a uma média ponderada de R$ 190/290 ≈ R$ 8.500 contra
R$ 790). É a mesma pergunta do Achado 2 reaparecendo como 14 pontos
percentuais de diferença de desconto — outra razão para fechá-lo antes de
imprimir esta carta como oficial.

---

## 3. Teste 1 — "e se o cliente quiser trezentos carrosséis por dia?"

Este é o caso que o próprio CEO deu como régua. A carta **produz um número**:

**Assunção declarada** (não há convenção na casa para dia→mês; uso 30 dias
corridos, porque "por dia" foi dito sem restringir a dias úteis — se a
intenção era só dias úteis, o número cai para 22/mês, ver a linha entre
parênteses):

| Motor de produção | Preço/dia | Preço/mês (30 dias) | Preço/mês (22 dias úteis) |
|---|---:|---:|---:|
| Balcão, 100% máquina (R$ 129/carrossel) | R$ 38.700 | **R$ 1.161.000** | R$ 851.400 |
| Com direção de arte (R$ 290/carrossel) | R$ 87.000 | **R$ 2.610.000** | R$ 1.914.000 |

**O número existe: entre R$ 851 mil e R$ 2,61 milhões por mês**, a depender do
motor de produção que o CEO escolher para este volume (nenhum desconto de
mega-volume está autorizado hoje — `descontoAutorizadoPct: null` em toda a
tabela — então este É o preço de tabela, sem invenção de desconto).

**O prazo é a parte que exige decisão do CEO, não recusa:**

- A capacidade de entrega comprovada hoje é **36 peças/mês por contrato de
  cliente** (`CAPACIDADE_MENSAL`, `planos.ts:57`).
- 300 carrosséis/dia × 30 = **9.000/mês**. Isso é **9.000 ÷ 36 = 250×** a
  capacidade de um único contrato — não uma diferença que se resolve com
  "mais uma leva", é uma diferença de ordem de grandeza.
- **O dinheiro não é o gargalo.** O custo de IA por peça é ~US$ 0,17
  (`tabela-de-precos.ts:112`); 9.000 peças/mês custam **~US$ 1.530 de IA** —
  irrisório contra um contrato de sete dígitos. O gargalo é **produção e
  orquestração**: a esteira de hoje é desenhada para entregar em levas por
  cliente, não para operar como fábrica de um cliente só nesta escala.
- **"Dar um jeito" (a frase do CEO) é literalmente isto:** decidir se a casa
  monta uma linha de produção dedicada para este volume (o que envolve gente
  e/ou reescrever a orquestração), e em que prazo isso fica pronto. A carta
  não recusa o pedido — ela entrega o preço e devolve ao CEO a pergunta de
  capacidade, que é dele.

---

## 4. Teste 2 — o caso do parceiro (28–30 posts/mês + 3 carrosséis/semana)

Convertendo semana→mês pela mesma convenção que a casa já usa
(`live-calculator.ts:128`, 4 semanas/mês): 3 × 4 = **12 carrosséis/mês**.
**Pedido total: 28–30 posts + 12 carrosséis = 40–42 peças/mês.**

### A composição, item a item — a resposta ao que ele pediu

| Base | Posts (28–30 × preço) | Carrosséis (12 × preço) | Total/mês |
|---|---:|---:|---:|
| Balcão, 100% máquina | R$ 2.212 – R$ 2.370 | R$ 1.548 | **R$ 3.760 – R$ 3.918** |
| Com direção de arte | R$ 5.320 – R$ 5.700 | R$ 3.480 | **R$ 8.800 – R$ 9.180** |

Isto é o número que se entrega ao parceiro se ele comprar exatamente o que
pediu, peça por peça, sem preset nenhum: **entre R$ 3.760 e R$ 9.180/mês**,
dependendo de qual motor de produção (Achado 2).

### O preset só entra porque é mais barato — não porque "encaixa"

40–42 peças/mês passa do teto de um único contrato (36). Isso não significa
recusa: significa que, **se comprado como presets prontos**, o pedido cabe em
**dois motores de produção rodando juntos** — Conteúdo (36 peças, R$ 790) +
Ritmo (12 peças, R$ 290) = **R$ 1.080/mês**, entregando 48 peças (mais do que
os 40–42 pedidos, nunca menos).

**R$ 1.080 é de 3,5× a 8,5× mais barato** que qualquer uma das duas leituras
item a item acima. É só por essa conta — nunca por "é assim que a casa
organiza" — que vale oferecer o combo de presets ao parceiro: ele recebe as
duas opções (a composição pura, e o combo mais barato que entrega um pouco
mais do que pediu) e escolhe.

---

## 5. O que decide o CEO

1. **Achado 2 — três motores, um preço cada, mas um dos nomes no código
   (`avulso_post`/`avulso_carrossel`) hoje aponta para leituras diferentes.**
   Recomendação: nomear os três
   explicitamente no código (`pecaExtraDentroDoPreset` R$ 90,
   `pecaBalcao` R$ 79/129, `pecaComDirecaoDeArte` R$ 190/290) — sem apagar
   nenhum, porque descrevem processos de produção diferentes.

2. **300 carrosséis/dia tem preço: entre R$ 851 mil e R$ 2,61 milhões/mês**
   (seção 3), a depender do motor escolhido. O que falta decidir é **se e como
   a casa escala a produção 250× para este volume**, e em que prazo — isto é
   "dar um jeito", não é preço.

3. **O caso do parceiro tem dois números: R$ 3.760–9.180/mês (item a item) ou
   R$ 1.080/mês (combo de dois presets, entregando 48 peças em vez de 40–42).**
   Recomendação: oferecer as duas opções ao parceiro; o combo é
   objetivamente mais barato, mas quem escolhe é ele.

4. **Achado 0 — o código ainda recusa por volume** (`podePrometerVolume`,
   `volumeQueACasaVende`). Isto está em produção e contradiz a ordem desta
   semana. Recomendo abrir uma frente de código, separada deste documento,
   para trocar a recusa por preço + prazo.

5. **Os itens sem produtor** (seção 1.3: Auditoria, Banner, Identidade
   Básica, Reel) e os de projeto à parte sem produtor (seção 1.4: vídeo,
   identidade completa) — decidir se vale abrir a frente de construir quem
   produz. Enquanto não existe produtor, não há preço fechado para eles.

6. **A sobreposição pack-4/8 vs balcão-4/8** (seção 1.3) — pendência já
   aberta no código desde 26/08/2026, segue sem veredito.

7. **Achado 3 (piso órfão de R$ 226)** — sem risco ativo; PM agenda limpeza.

---

## 6. O que eu não consegui apurar

- **Nenhum comando foi executado nesta sessão** (ver aviso no topo) — os
  números vieram de leitura do código, não de rodar `CATALOGO_VENDAVEL` nem os
  testes. Recomendo rodar os três testes citados antes de imprimir a carta
  oficial.
- **A capacidade TOTAL da casa (todos os clientes somados).** O único número
  que o código declara é o teto **por contrato de cliente** (36 peças/mês).
  Não há, em lugar nenhum lido nesta sessão, um teto agregado de quantos
  contratos a casa roda em paralelo hoje — sem isso, não dá para dizer com
  precisão quanto da "escalada 250×" do Teste 1 é gargalo de orquestração
  versus gargalo de gente.
- **Custo real de cada serviço, fora IA.** `tabela-de-precos.ts` declara
  cinco parcelas como `nao_medido` (gateway, infraestrutura, domínio/e-mail,
  hora humana, impostos) — sem elas, nenhum desconto abaixo do preço de
  tabela pode ser autorizado, por construção.
- **Se "nós publicamos" (Presença/Conteúdo) é cumprível hoje.** Fora do
  escopo de preço: a publicação em nome do cliente depende do App Review da
  Meta, ainda pendente conforme `docs/pendencias.md`. Não muda o preço do
  preset; muda se a promessa é cumprível agora. Assunto do especialista
  `meta`, não desta carta.
- **Cinco propostas de concorrentes da mesma praça, datadas** — já pendente
  desde `docs/precos.md`, segue pendente, fora do escopo deste despacho.
