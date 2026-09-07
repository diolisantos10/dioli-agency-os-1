# 🔴 DECIDIDO PELO DIRETOR GERAL — a tabela vai para o código. O parceiro está no chat AGORA.

## OS NÚMEROS DECIDIDOS — não são para discutir, são para implementar
| | |
|---|---|
| **Peça avulsa** | **R$ 55** |
| **`PECA_EXTRA = 90`** | **MORRE** |
| **Parceria Foocci** | **R$ 0 em dinheiro**, valor de referência **R$ 700/mês** |
| **Pedido do Marcos** | 28–30 peças/mês, ~12 carrosséis — **CABE** (capacidade 36) |

**Por que R$ 55:** hoje a mesma peça custa **R$ 90 avulsa** e **~R$ 20 no plano**
(Ritmo 290÷12 = 20,08). Quatro vezes de diferença na mesma casa. R$ 55 fica acima
do embutido, muito abaixo do mercado (R$ 120–190), e **para de punir quem compra
pouco**.

## O ENQUADRAMENTO — releia, porque o anterior estava errado
**Existe a carta item a item. Todo pedido é uma composição dela. O plano é uma
composição PRÉ-MONTADA com desconto** — atalho de compra, não o produto.

⛔ **Proibido**, no código e no vocabulário: `orcamentoAvulso`, `foraDoPlano`,
`customizado`, "acima/abaixo do plano", "exceção". **Não há dois caminhos.**
⛔ **`CAPACIDADE_MENSAL` é teto de ENTREGA, nunca de VENDA.** Passa dela → **prazo e
decisão do CEO**, jamais recusa automática do sistema.

## O QUE ENTREGAR

### 1. A tabela unitária como FONTE ÚNICA
`lib/agency/financeiro/tabela-de-precos.ts` já se declara *"a tabela de preços da
casa — uma fonte, e é esta"* e já é chamada pelo SDR. **Faça isso virar verdade.**
- peça avulsa = **R$ 55**;
- **`PECA_EXTRA` em `lib/agency/planos.ts:64` morre** — quem lia passa a ler a tabela.
  Varra **todos** os leitores e liste-os no relato.
- ⚠️ Hoje existem **três** preços vivos para a mesma peça: R$ 90 (`planos.ts`),
  R$ 190/290 (`tabela-de-precos.ts:211-212`), R$ 79/129 (`:208-209`). **Ao final tem
  de sobrar UM caminho de verdade.** Se algum daqueles números tiver razão de existir
  (produto diferente, não a mesma peça), **diga qual e por quê** — não apague às cegas.

### 2. O plano vira composição, com desconto explícito
Cada preset (Pulso/Ritmo/Presença/Conteúdo) passa a ser **soma dos itens − desconto
declarado**. ⛔ **Não altere o preço final de nenhum plano** — R$ 49 / 290 / 490 / 790
estão fechados pelo CEO. O que muda é que o preço **deixa de ser caixa-preta**: vira
soma que qualquer um confere, com o desconto aparecendo em % e em R$.

### 3. 🔴 O SDR RESPONDE SOZINHO — este é o entregável que importa
Ele tem de responder **sem humano**:
> *"quanto custa 28–30 posts por mês com 3 carrosséis por semana?"* → **R$ 700/mês**
> — e, para o Marcos, **isento por parceria**.

⚠️ **ATENÇÃO, E ISTO É O PONTO DELICADO — MEÇA E RELATE, NÃO MAQUIE:**
R$ 55 × 28 = **R$ 1.540**, e a resposta decidida é **R$ 700**. **Os dois números não
fecham com uma régua linear.** Isso significa que existe uma **curva de volume** —
comprar muito sai mais barato por peça, que é exatamente a lógica do preset
(Conteúdo: R$ 790 por 36 peças = R$ 21,94).

**Mostre a conta que produz R$ 700 para 28–30 peças** e diga qual curva você usou.
**Se a sua curva não produzir R$ 700, PARE e relate o número que ela produz** — não
force o resultado, não invente desconto para caber. *Preço forçado para bater com a
expectativa é a mentira mais cara que um sistema pode contar.* Quem decide a curva
é o CEO; você mostra a conta.

### A régua de acerto, palavras do Diretor Geral
> *Cliente que pede uma composição que ninguém nunca pediu recebe **PREÇO**, não
> recebe "vou verificar".*

Foram **quatro** "vou verificar" com este parceiro. **Teste com 300 carrosséis por
dia**: tem de sair um número, por mais alto que seja.

## FRONTEIRAS
- ⛔ **Não mande mensagem ao Marcos nem a ninguém.**
- ⛔ Não altere preço de plano. ⛔ Nada de cancelamento/multa/devolução/reembolso.
- ⛔ Não toque em `prisma/schema.prisma` (sessão viva alheia).
- **Não commite. O Diretor commita e roda o portão.**

## CRITÉRIO DE ACEITE
1. **Quem CHAMA** cada peça — arquivo e linha. **A pergunta do SDR responde sozinha:
   prove com um teste que passa pelo caminho real do SDR**, não por uma função solta.
2. **O teste alcança o que o cliente LÊ.**
3. **Quebre cada trava de propósito e veja VERMELHO** — em especial: reponha
   `PECA_EXTRA = 90` e prove que algo fica vermelho.
4. `npx tsc --noEmit` limpo · `npx vitest run` verde nos arquivos tocados.
5. ⚠️ **Se não conseguir rodar `npx`** (`This command requires approval`), **DIGA NO
   TOPO** e não apresente raciocínio como medição. O Diretor roda.
6. **Declare o que não conseguiu provar.**
