# Tabela de preços da Dioli Digital — v1, 05/08/2026

> ## 💰 ONDE O PREÇO MORA DE VERDADE
>
> **O código é a fonte executável; este documento é a explicação.**
>
> | O quê | Onde |
> |---|---|
> | Os 4 planos (nome, preço, implantação, peças/mês, escopo) | **`lib/agency/planos.ts`** |
> | Pisos de negociação e moedas de troca (planos DERIVADOS de `planos.ts`) | **`lib/agency/comercial/negociacao.ts`** |
> | O que a proposta automática cota (DERIVADO de `planos.ts`) | **`lib/agency/live-calculator.ts`** |
> | Margem por plano (DERIVADA de `planos.ts`) | **`lib/agency/pricing-margins.ts`** |
> | O balcão (post R$ 79, carrossel R$ 129) | **`lib/agency/self-serve-catalog.ts`** |
>
> **Mudou um preço? Mude em `planos.ts` e neste documento, no mesmo commit — e
> em mais lugar nenhum, porque não há mais lugar nenhum.** Desde 26/08/2026 as
> tabelas concorrentes (`SOCIAL_PACKAGES`, os adicionais da calculadora,
> `SOCIAL_MARGINS`, o `cheio` de `TABELA_DE_PISO`) são **derivadas**, não
> escritas: não existe edição possível que as faça divergir.
>
> Não é disciplina, é portão: `preco-uma-fonte-so.test.ts` lê a tabela "Os
> quatro degraus" daqui e compara com `PLANOS`; `a-tabela-e-uma-so.test.ts`
> prova a derivação por mutação e **quebra** se um preço que a esteira cota não
> existir na vitrine.
>
> ⚠️ **O balcão NÃO contém os 5 planos, e isso é de propósito** — são produtos
> diferentes (ver "Preço por serviço", abaixo). Uma auditoria já leu o balcão
> procurando os planos e concluiu, errado, que o preço não estava no código.

> Decidida pelo CEO em 05/08/2026: **primeiro a tabela**, planos e serviços.
> Vitrine: `https://claude.ai/code/artifact/ac47e688-4584-4555-ac74-fe15bea339bf`
>
> Regra de origem: **só serviço com código rodando em produção** aparece como
> entregável de plano. O que está "quase lá" ou "a construir" tem preço interno e
> não vai para proposta.

## A decisão estrutural: vídeo e marca ficam FORA de todo plano

O CEO decidiu, e a conta confirma: **vídeo não entra em plano nenhum**. O roteiro
sim (é texto, custa centavos); a gravação, a edição e o vídeo gerado por IA são
compra separada, sempre. Diluir o item de maior custo real da casa dentro da
mensalidade é o jeito mais rápido de a tabela inteira ficar no prejuízo — e é
exatamente o erro que o parecer do conselho embutiu ao colocar 4 edições no
plano de R$ 2.590 e 8 no de R$ 4.990.

Também ficam fora, pelo mesmo motivo (custo que não é conteúdo): **posicionamento
e identidade visual** (projeto com começo e fim), **site e landing** e a **verba
de mídia**.

## Os quatro degraus

> **Fechada em 26/08/2026 pelo Diretor Geral**, por delegação expressa do CEO
> (*"estou tirando essa missão das minhas costas e colocando na tua"*), com uma
> régua só: **agência nova, sem fama nenhuma — preço de entrada, abaixo do
> mercado, por decisão e não por acaso.**

| Plano | Preço | Implantação | Peças/mês | Mercado (ago/2026) | O que muda em relação ao degrau de baixo |
|---|---|---|---|---|---|
| **Pulso** | R$ 49/mês | isenta | 0 | não existe | Observa, mede e avisa. Zero peça, zero hora humana. |
| **Ritmo** | R$ 290/mês | isenta | 12 | R$ 800–1.500 (básico) | **+ 12 peças/mês** prontas e aprovadas no portal. **Você publica.** Ainda zero hora humana. |
| **Presença** | R$ 490/mês | R$ 390 | 20 | R$ 800–1.500 | + 20 peças, **nós publicamos**, avaliações e **um humano no atendimento**. |
| **Conteúdo** | R$ 790/mês | R$ 690 | 36 | R$ 2.000–4.000 (esse volume) | + 36 peças — a capacidade INTEIRA da casa —, stories, plano de medição, reunião mensal. |

**Peça avulsa: R$ 55** (mercado: R$ 120–190). Unificada em 30/08/2026
(`.despachos/E1-tabela-no-codigo.md`): existiam DOIS preços para a mesma venda
— "peça além do combinado, com direção de arte, para quem já é cliente" — R$ 90
aqui e R$ 190/290 na tabela financeira (`avulso_post`/`avulso_carrossel`). Os
dois convergem para R$ 55, fonte única em `PRECO_DA_PECA_AVULSA`
(`lib/agency/planos.ts`). O balcão (post R$ 79, carrossel R$ 129, tabela
abaixo) continua separado: é produto diferente, sem direção de arte e sem
relação prévia com a casa.

### Por que abaixo, degrau a degrau

O mercado brasileiro em agosto/2026 cobra **R$ 800 a R$ 1.500/mês** pela gestão
básica de redes sociais de um pequeno negócio local, e **R$ 2.000 a R$ 4.000**
para média empresa. **O teto desta tabela (R$ 790) fica abaixo do piso do
mercado (R$ 800)** — não é um degrau que ficou barato, é a tabela inteira
posicionada abaixo do menor preço praticado. É o que "pegar cliente barato"
quer dizer para quem não tem nome.

### O teto de volume é a capacidade provada

A casa produz **3 levas × 12 = 36 peças/mês**. O degrau mais alto entrega
exatamente 36, e nenhum plano passa disso — *vitrine é promessa, e vender mais
do que se produz é a mesma dívida com outro rosto*.

### A conta fecha

Cada peça custa ~US$ 0,17 de IA de imagem (~R$ 0,95 a R$ 5,60/US$):

| Plano | Peças | Custo de IA/mês | Receita | % da receita |
|---|---|---|---|---|
| Ritmo | 12 | ~R$ 11 | R$ 290 | 3,8% |
| Presença | 20 | ~R$ 19 | R$ 490 | 3,9% |
| Conteúdo | 36 | ~R$ 33 | R$ 790 | 4,2% |

⚠️ **O que NÃO está nesta conta:** a hora humana do Presença para cima. Ela é o
custo real desses dois degraus e **não há medição dela nesta casa** — é dívida
declarada, não número omitido.

**A regra que sustenta a base da tabela: gente entra a partir do Presença.**
Abaixo disso a operação é máquina, e é só por isso que R$ 49 e R$ 290 podem
existir sem dar prejuízo. Se a publicação do Ritmo virar nossa, o degrau quebra.

**Por que o Crescimento (R$ 2.590) saiu:** R$ 2.590 é a faixa de média empresa —
preço de quem já tem nome, e a tabela inteira diz o contrário sobre quem esta
casa é. O que ele vendia (campanha paga desenhada) continua existindo como
projeto orçado à parte, sem preço de tabela.

O escopo numerado de cada plano, com o que NÃO está incluído item a item, está
na vitrine.

## Preço por serviço

**Duas tabelas, e elas não se contradizem — vendem coisas diferentes:**

| | **Balcão** (vitrine) | **Avulso** (cliente de plano) |
|---|---|---|
| Post | R$ 79 | R$ 55 |
| Carrossel | R$ 129 | R$ 55 |
| Quem produz | máquina, sem revisão humana | equipe, com direção de arte |
| Revisões | nenhuma | 2 rodadas |
| Pagamento | antes da produção, no cartão | na fatura do plano |
| Para quem | qualquer pessoa, primeira compra | quem já é cliente |

O balcão é a porta de entrada da casa: barato porque é 100% automático e pago
antes. O avulso é serviço de agência para quem já está dentro. **Preço
diferente para trabalho diferente não é incoerência — é o que impede a linha
barata de canibalizar a cara.**

> ⚠️ Unificado em 30/08/2026: post e carrossel avulsos tinham preços diferentes
> entre si (R$ 190/R$ 290) e um TERCEIRO preço para o mesmo cenário
> (`PECA_EXTRA = R$ 90`, em `planos.ts`). Os três eram a mesma venda — "peça
> além do combinado, com direção, para quem já é cliente" — e convergem para
> R$ 55, `PRECO_DA_PECA_AVULSA`. Note que isso deixou o balcão (self-serve, sem
> direção) mais CARO que o avulso com direção — artefato conhecido e
> registrado, não corrigido neste despacho (fora de escopo: mexer no balcão não
> foi pedido, e os dois preços do balcão vêm de `self-serve-catalog.ts`, uma
> fonte já independente).
>
> ⚠️ **A tabela abaixo ("Serviço | Preço | Observação") não foi auditada nesta
> passada** — vários itens (roteiro de reel, criativo de anúncio, ficha do
> Google) descrevem coisas que `FORA_DE_TODO_PLANO` e `so-vende-o-que-produz`
> hoje tratam como "a casa não produz" ou "orçado à parte, sem preço de
> tabela". Ela é herança de versões anteriores deste documento; não é lida por
> nenhum código e não deve ser tratada como preço vigente sem confirmar contra
> `tabela-de-precos.ts` primeiro.

**Conteúdo avulso só para quem já tem plano**, pedido mínimo R$ 750. Serviço de
projeto pode ser a primeira compra.

| Serviço | Preço | Observação |
|---|---|---|
| Carrossel até 6 telas | R$ 55 | preço único da peça avulsa, dentro ou fora do plano |
| Post único com arte e legenda | R$ 55 | preço único da peça avulsa, dentro ou fora do plano |
| Sequência de stories (3 telas) | R$ 190 | incluída a partir do Conteúdo |
| Criativo de anúncio | R$ 320 | 3/mês no Crescimento |
| Roteiro de reel | R$ 290 | 4/mês a partir do Conteúdo |
| **Edição do vídeo do cliente (60s)** | **R$ 350** | sempre à parte · pacote de 4: R$ 1.200 |
| **Vídeo gerado por IA (15s)** | **R$ 690** | sempre à parte · pacote de 4: R$ 2.400 |
| Leitura do perfil do cliente | R$ 690 | incluída na entrada de todo plano |
| Posicionamento de marca | R$ 3.900 | projeto, 3x |
| Identidade visual | R$ 2.900 | projeto, 3x |
| Pesquisa de concorrência | R$ 1.200 | |
| Plano de medição | R$ 1.400 | |
| Configuração da ficha do Google | R$ 890 | |
| Estrutura de campanha (setup) | R$ 1.900 | |
| Relatório mensal avulso | R$ 690 | |

**Preço interno (não vai para proposta):** manual de marca R$ 3.500 · diagnóstico
de presença R$ 1.500 · consultoria mensal R$ 1.200 · landing R$ 2.400 · site
R$ 6.900 · treinamento R$ 2.900 · impresso R$ 890 · atendimento automático no
WhatsApp do cliente R$ 490/mês · SEO local R$ 690/mês.

## As regras sem as quais o preço não sobrevive

- **Excedente:** peça além do contratado R$ 55 (`PRECO_DA_PECA_AVULSA`); pedido avulso mínimo R$ 750.
- **Ajustes:** 2 rodadas por peça (3 a partir do Conteúdo). Aprovação em até 2
  dias úteis; passado isso a peça segue para a data agendada.
- **Permanência:** 3 meses até o Presença, 6 do Conteúdo em diante. Pausa máxima
  de 30 dias por ciclo. Reajuste anual por IPCA.
- **Desconto tem chão, e o chão é número.** Decidido em 05/08/2026, quando o CEO
  definiu que o objetivo do comercial é FECHAR todo cliente sem prejuízo: cada
  item tem um piso calculado (`lib/agency/comercial/negociacao.ts`), e a
  mensalidade pode descer até ele — Ritmo R$ 229, Presença R$ 690, Conteúdo
  R$ 1.190, Crescimento R$ 2.190.
  **A ordem das moedas de troca continua valendo, e ela é a proteção real:** a
  primeira coisa que se oferece é o que NÃO custa margem — prazo maior,
  pagamento à vista, menos rodadas de ajuste, contrato mais longo, autorização
  de case. Só depois disso o preço se mexe. Chegou no piso, corta-se ESCOPO,
  nunca margem.
- **Tráfego pago:** conta do cliente, verba fora da mensalidade, zero promessa de
  faturamento ou retorno. Ficha do Google, conta de anúncios, pixel e domínio no
  nome dele.
- **Avaliações:** elogio só é respondido sozinho com consentimento registrado;
  **reclamação nunca** — vira rascunho e chama gente.

## A conta

| Plano | Custo de IA/mês | Hora humana | Sobra antes da hora humana |
|---|---|---|---|
| Pulso R$ 49 | ≈ R$ 4 | nenhuma | R$ 45 |
| Ritmo R$ 297 | ≈ R$ 22 | nenhuma | R$ 275 |
| Presença R$ 790 | ≈ R$ 28 | a medir | R$ 762 |
| Conteúdo R$ 1.390 | ≈ R$ 38 | a medir | R$ 1.352 |
| Crescimento R$ 2.590 | ≈ R$ 52 | a medir | R$ 2.538 |

**Fechado:** o custo de IA, contado por peça a partir do próprio sistema.
**Hipótese:** a hora humana do Presença para cima — ninguém mediu.
**Falta:** o custo fixo mensal da casa e quantas contas ela atende sem hora
extra. Sem esses dois, o piso de margem não existe. Plano que não fechar o piso
**perde escopo, nunca preço**.

## O que ainda não foi feito e é condição de impressão

Colher **cinco propostas de concorrentes da mesma praça**, datadas. As faixas de
mercado usadas como âncora vieram do parecer do conselho, e o próprio parecer
declara que nenhuma foi confirmada com fonte auditável.
