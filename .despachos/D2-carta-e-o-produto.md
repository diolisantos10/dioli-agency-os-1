# 🔴 REFAÇÃO — o enquadramento anterior estava ERRADO. Corrija o documento.

`docs/precos-por-servico.md` já existe (você o escreveu). **Ele foi escrito sob um
enquadramento errado que o CEO acabou de corrigir.** Não recomece do zero: conserte
o que o erro contaminou, e o erro é conceitual, então contamina mais do que parece.

## AS PALAVRAS DO CEO
> *"Não existe volume acima ou abaixo. O pacote é um produto predefinido. **Se o
> cliente quiser trezentos carrosséis por dia, a gente vai ter que dar um jeito.**
> Entenda que não é que esse é uma exceção. O que ele está comprando é **um pacote
> personalizado**."*

## O ERRO, E É DE ARQUITETURA
❌ **Errado:** existe o plano, e existe um caminho de EXCEÇÃO para quem quer outra coisa.
✅ **Certo:** existe **a carta item a item**. Todo pedido é uma composição dela.
**O plano é só uma composição pré-montada com desconto** — atalho de compra, não é
o produto.

### O que sai do vocabulário — do documento E do código futuro
Estas expressões estão **proibidas**, e eu as usei por engano no despacho anterior:
- ⛔ "orçamento **fora do plano**"
- ⛔ "**acima** dos nossos pacotes" / "volume acima ou abaixo"
- ⛔ "**exceção**", "**customizado**" e "**avulso**" **como ramo separado do normal**

O item a item **é** o caminho normal. Não há dois caminhos.

## AS QUATRO CONSEQUÊNCIAS — reescreva o documento sob elas

1. **Não existe caminho de exceção.** Nada de `orcamentoAvulso` / `foraDoPlano` /
   `customizado` como ramo à parte. O preset preenche **a mesma composição** que
   qualquer pedido preenche.
2. **Não existe teto que RECUSE o cliente.** 300 carrosséis por dia **dá um
   número** — pode ser alto e com prazo longo, mas dá. O sistema **nunca** responde
   *"não temos plano para isso"*.
3. ⚠️ **`CAPACIDADE_MENSAL` (36) é teto de ENTREGA, não teto de VENDA.** Pedido que
   passa dela **não é recusa**: é conversa de **prazo** e de **contratar mais
   gente**, e é **decisão do CEO**. O documento tem de dizer isso com todas as
   letras e trazer **o número** do caso real para ele decidir.
4. **O desconto do combo fica explícito:** comprar o preset sai mais barato que a
   mesma composição item a item, e a **diferença aparece**, em % e em R$.

## ⚠️ O QUE, NO SEU DOCUMENTO, ESTÁ CONTAMINADO — confira cada um
- Qualquer trecho que trate o pedido do parceiro como "não cabe" ou "passa do teto"
  **como se fosse impedimento**. Passa da capacidade **atual** → vira prazo + decisão
  do CEO, e **tem preço**.
- A recomendação de "resolver como segunda frente" (Conteúdo + Ritmo): **isso é
  encaixar o cliente em presets**, que é o avesso da ordem. A resposta certa é
  **a composição que ele pediu, precificada item a item**, e o preset citado só se
  for **mais barato** para ele.
- Qualquer lista de "serviços bloqueados" apresentada como recusa comercial.
  Distinga: *a casa não produz isto hoje* (verdade, e vira prazo/decisão) de
  *não vendemos isto* (proibido).

## A RÉGUA DE ACERTO — o CEO deu a frase
> *Um cliente que pede uma composição que ninguém nunca pediu recebe **PREÇO**, não
> recebe "vou verificar".*

Foi o *"vou verificar"* que quebrou a confiança do parceiro **quatro vezes**. Se o
documento deixa qualquer pedido sem número, ele ainda está errado.

**Teste o documento com este caso, e escreva a conta:** *300 carrosséis por dia.*
Qual é o número? Qual é o prazo? O que o CEO precisa decidir para honrar?
Se a sua carta não produz um número para isso, ela não está pronta.

## O QUE PERMANECE VÁLIDO — não jogue fora
- A carta com procedência linha a linha.
- 🔴 O achado dos **três preços vivos** para a mesma peça — R$ 90 (`planos.ts:64`),
  R$ 190/290 (`financeiro/tabela-de-precos.ts:211-212`), R$ 79/129 (balcão, `:208-209`).
  **Continua sendo a decisão nº 1 do CEO.**
- A existência de `lib/agency/financeiro/tabela-de-precos.ts` como a tabela que já
  se declara única e já é chamada pelo SDR.

## FRONTEIRAS
- ⛔ **Você não inventa preço.** Deriva, mostra a conta, e o CEO decide.
- ⛔ **Não altera preço de plano.** Nem um centavo.
- ⛔ **Não inventa serviço que a casa não presta** — mas "não produzimos hoje" vira
  **prazo e decisão**, nunca "não vendemos".
- ⛔ Nada de cancelamento/multa/devolução/reembolso.
- **ENTREGA É SÓ O DOCUMENTO.** Sem código nesta rodada.
- **Não commite.**

## CRITÉRIO DE ACEITE
1. O documento não contém nenhuma das expressões proibidas, em nenhum lugar.
2. O caso *300 carrosséis por dia* aparece **com número e com prazo**.
3. O caso do parceiro (28–30 posts/mês + 3 carrosséis/semana) aparece **com número**,
   precificado como composição — e o preset só citado se for mais barato para ele.
4. O desconto de cada preset, explícito em % e em R$.
5. A lista curta de decisões do CEO, conclusão primeiro.
6. **Declare o que não conseguiu apurar.**
