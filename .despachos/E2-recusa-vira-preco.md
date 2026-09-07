# 🔴 A casa RECUSA em vez de dar preço. O CEO proibiu isso. Conserte.

## O QUE ESTÁ ESCRITO HOJE, e é o avesso da ordem

`lib/agency/financeiro/tabela-de-precos.ts:413` — `podePrometerVolume`:
```ts
if (pecasPorMes > TETO_DE_PECAS_POR_MES) {
  return { pode: false, motivo: `${pecasPorMes} peças/mês passa da capacidade da casa (36). ` +
    "Vender acima do que se produz é dívida com outro rosto." };
}
```
E `:461` — `volumeQueACasaVende`, que além de repassar a recusa, **empurra o pedido
para o degrau de plano mais próximo**: *"a casa vende em degraus"*, e devolve
`vende: false` com *"não cabe em nenhum plano da casa"*.

## AS PALAVRAS DO CEO
> *"Não existe volume acima ou abaixo. **Se o cliente quiser trezentos carrosséis
> por dia, a gente vai ter que dar um jeito.** Não é exceção — o que ele está
> comprando é um pacote personalizado."*

E a régua:
> *Cliente que pede uma composição que ninguém nunca pediu recebe **PREÇO**, não
> recebe "vou verificar".*

**Foram quatro "vou verificar" com um parceiro real.** É este código que produz
essa frase.

## ⚠️ MEDIDO PELO DIRETOR — o alcance, para você não exagerar nem subestimar
`volumeQueACasaVende` é chamada **só** por `lib/agency/comercial/escopo-na-voz-da-casa.ts:58`,
que hoje é usada **apenas** por `app/agency/requests/page.tsx` — **tela interna da
agência**. **Não está no caminho do SDR hoje.** Não é incêndio em produção; é a
forma errada, e é justamente a peça que vai ser ligada ao SDR. Conserte antes de
ligar.

## O QUE CONSTRUIR

### 1. Acima da capacidade → PREÇO + PRAZO, nunca recusa
`podePrometerVolume` deixa de devolver "não pode". Passa a devolver **preço e
prazo**: o volume pedido tem número, e o que muda é **quanto tempo leva** e a
**decisão do CEO de escalar**.
- ⛔ **`TETO_DE_PECAS_POR_MES` NÃO some.** Ele continua sendo verdade — é o que a
  casa entrega **por mês, hoje**. O que muda é o que se faz com ele: **teto de
  ENTREGA vira PRAZO, nunca teto de VENDA.**
- Exemplo do raciocínio: 72 peças com capacidade 36 = o mesmo preço, entregue em
  **2 meses** — ou 1 mês **se o CEO autorizar escalar**. Os dois caminhos com número.
- A resposta tem de dizer, sempre: **o preço**, **o prazo na capacidade atual**, e
  **que existe a opção de encurtar, que é decisão do CEO**.

### 2. Nada de empurrar para degrau
`volumeQueACasaVende` para de dizer *"a casa vende em degraus"* e de encaixar o
pedido no plano mais próximo. **A composição pedida é precificada como pedida.**
O preset só entra **se for mais barato para o cliente** — e aí é oferta, não encaixe:
*"o plano X sai mais barato e te dá mais peças; quer?"*

### 3. ⛔ Nunca "a definir" / "sob consulta"
O próprio arquivo já diz isso em `aCasaProduz` (`:482`): *"promessas com a assinatura
em branco"*. **Vale igual aqui.** Se a casa não produz um serviço, a resposta é
**"não fazemos isso"** — clara —, nunca indefinição. E "não fazemos hoje" pode virar
**prazo + decisão do CEO**, mas isso é dito com todas as letras, nunca insinuado.

## VOCABULÁRIO PROIBIDO no código e nas frases
⛔ "fora do plano" · "acima/abaixo do plano" · "não cabe em nenhum plano" ·
"exceção" · "customizado" como ramo separado · "a definir" · "sob consulta"

## O TESTE — o que o cliente LÊ
1. **300 carrosséis por dia → sai um NÚMERO e um PRAZO.** Nenhuma recusa. Este é
   o caso que o CEO deu; use-o literalmente.
2. **72 peças/mês (2× a capacidade) → preço + prazo**, e a menção de que encurtar é
   decisão do CEO.
3. **28–30 peças (o pedido do parceiro) → preço**, sem ser empurrado para degrau.
4. **Nenhuma saída contém as expressões proibidas** — teste com regex sobre o texto
   devolvido. Foi assim que a casa travou o veto do jurídico; use o mesmo molde.
5. O preset continua sendo **oferecido quando é mais barato** — não perca isso.

## FRONTEIRAS
- ⛔ Não altere preço de plano nem `PRECO_DA_PECA_AVULSA` (R$ 55, decidido).
- ⛔ Nada de cancelamento/multa/devolução/reembolso.
- ⛔ Não toque em `prisma/schema.prisma`.
- ⛔ Não mande mensagem a ninguém.
- **Não commite. O Diretor commita e roda o portão.**

## CRITÉRIO DE ACEITE
1. **Quem CHAMA** cada peça — arquivo e linha.
2. **Quebre cada trava de propósito e veja VERMELHO** — em especial: reponha a
   recusa acima do teto e prove que algo fica vermelho.
3. `npx tsc --noEmit` limpo · `npx vitest run` verde nos arquivos tocados.
4. ⚠️ **Se não conseguir rodar `npx`** (`This command requires approval`), **DIGA NO
   TOPO** e não apresente raciocínio como medição. O Diretor roda.
5. **Declare o que não conseguiu provar.**
