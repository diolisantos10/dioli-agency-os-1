# O avulso que virou mensalidade — e a pergunta que fica com o CEO

> **Origem:** despacho do PM à esteira, 29/08/2026 — "a casa está dizendo ao
> cliente que um item de compra única custa R$ X/**mês**".
> **Custo desta correção:** só a palavra. Nenhum preço, piso ou item ofertado
> mudou — ver §3.

---

## 1. O que existia — três saídas literais, coladas

Executando o caminho real (SDR na página do orçamento negociando com ofertado
= Ritmo), a casa produzia:

**(a) A frase que o CLIENTE lê** (`correcaoDoPiso`,
`lib/agency/comercial/negociacao-da-proposta.ts:281`):

> "…o **Post avulso** sai por **R$ 190,00/mês** com **1 peças/mês** — é menos
> volume, pelo preço que cabe."

Dois defeitos na mesma frase: `/mês` num item de **compra única**, e
concordância errada (`1 peças`, deveria ser `1 peça`). Também dizia "O que dá
para fazer é **trocar de plano**" — falso: avulso não é plano.

**(b) O bloco que vai ao MODELO** (`contextoDaNegociacao`, mesmo arquivo,
~linha 162), ofertado = Ritmo — três linhas falsas de uma vez:

> • Post avulso — R$ 190,00/mês, 1 peças/mês.
> • Carrossel (balcão) — R$ 129,00/mês, 1 peças/mês.
> • Post (balcão) — R$ 79,00/mês, 1 peças/mês.

**(c) `comoSeguirSemBaixarOPreco`** (`lib/agency/financeiro/tabela-de-precos.ts:390`,
instrução interna): não era falsa hoje (omitia o volume quando
`pecasPorMes === 1`), mas montava o rótulo por conta própria, com filtro
duplicado do de `degrausAbaixo` — uma terceira cópia da mesma regra, viva.

## 2. A medição do campo ausente

`ServicoDaCasa` (`lib/agency/financeiro/tabela-de-precos.ts`, antes desta
correção) tinha exatamente estes campos: `chave`, `nome`,
`precoFinalCentavos`, `pecasPorMes`, `produtor`, `custo`,
`descontoAutorizadoPct`. **Não existia campo de recorrência.**

Busca colada (regex `recorrente|recorrencia|compraUnica|umaVez|periodicidade|billingCycle|isRecurring`
em `tabela-de-precos.ts` e `planos.ts`): **vazia.**

A distinção recorrente/avulso só existia no **prefixo da `chave`**
(`plano_` · `balcao_` · `avulso_`) e na cabeça de quem escreveu o texto que
descreve cada serviço. Nenhum código verificava isso — o texto era montado à
mão, em três lugares, sempre com "/mês".

Os 7 itens da tabela, e a natureza real de cada um:

| chave | nome | preço | pecasPorMes | natureza REAL |
|---|---|---|---|---|
| `plano_ritmo` | Ritmo | R$ 290 | 12 | mensalidade |
| `plano_presenca` | Presença | R$ 490 | 20 | mensalidade |
| `plano_conteudo` | Conteúdo | R$ 790 | 36 | mensalidade |
| `balcao_post` | Post (balcão) | R$ 79 | 1 | compra única |
| `balcao_carrossel` | Carrossel (balcão) | R$ 129 | 1 | compra única |
| `avulso_post` | Post avulso | R$ 190 | 1 | compra única |
| `avulso_carrossel` | Carrossel avulso | R$ 290 | 1 | compra única |

## 3. O que foi consertado — só o rótulo

1. **A distinção virou dado explícito.** `ServicoDaCasa` ganhou o campo
   obrigatório `cobranca: "recorrente_mensal" | "uma_vez"` — sem valor
   padrão, o `tsc` exige que todo item novo declare a natureza.
2. **Um formatador, e só um:** `comoSeApresenta(s)` é o único lugar da casa
   que monta "preço + volume". `formaDeCobranca(s)` compara contra a lista de
   literais conhecidos, **nunca** contra texto de `chave` ou `nome`, e
   devolve `null` quando o valor é desconhecido.
3. **Fail-closed:** `degrausAbaixo` e `comoSeguirSemBaixarOPreco` excluem todo
   item cuja `formaDeCobranca()` seja `null` — ausência de informação não é
   informação; a casa cala em vez de mentir.
4. **Nada mais mudou.** Nenhum preço, piso, desconto ou
   `descontoAutorizadoPct` foi tocado. O item ofertado como degrau de baixo
   para cada plano é **exatamente o mesmo de antes** (ofertado Ritmo →
   `avulso_post` primeiro, na mesma ordem) — provado em teste
   (`__tests__/comercial/avulso-nao-vira-mensalidade.test.ts`, bloco
   "fronteira").

A frase agora sai:

> "…o que dá para fazer é **trocar para o Post avulso**: sai por
> **R$ 190,00, 1 peça (cobrança única)** — é menos volume, pelo preço que
> cabe."

E, para um plano mensal (ofertado Presença, degrau Ritmo), continua exatamente
como sempre:

> "…o que dá para fazer é **trocar de plano**: o Ritmo sai por
> **R$ 290,00/mês, 12 peças/mês**…"

---

## ⛔ PERGUNTA ABERTA — DECISÃO DO CEO, NÃO TOMADA

**Quais itens podem ser oferecidos como degrau abaixo de um plano mensal?**

Hoje, quando um cliente do plano **Ritmo** (R$ 290, **12 peças/mês**, uma
mensalidade) acha caro, a casa oferece como degrau de baixo o **Post avulso**
(R$ 190, **1 peça**, **compra única**) — **34% menos preço por 1/12 do
volume**, e trocando uma mensalidade por uma compra única. É uma "descida"
de degrau que também é uma mudança de natureza de contrato, e nada na
esteira hoje avisa o cliente disso além da frase corrigida acima.

A tabela completa, para decidir com os sete itens à vista:

| chave | nome | preço | peças | natureza |
|---|---|---|---|---|
| `plano_ritmo` | Ritmo | R$ 290 | 12/mês | mensalidade |
| `plano_presenca` | Presença | R$ 490 | 20/mês | mensalidade |
| `plano_conteudo` | Conteúdo | R$ 790 | 36/mês | mensalidade |
| `balcao_post` | Post (balcão) | R$ 79 | 1 | compra única |
| `balcao_carrossel` | Carrossel (balcão) | R$ 129 | 1 | compra única |
| `avulso_post` | Post avulso | R$ 190 | 1 | compra única |
| `avulso_carrossel` | Carrossel avulso | R$ 290 | 1 | compra única |

Esta seção **não recomenda** e **não sugere** — apenas apresenta o fato e as
opções para quem decide.
