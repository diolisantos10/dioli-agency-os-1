# 🔴 AUDITORIA DE COBRANÇA — quem foi cobrado preço cheio desde 25/08. É dinheiro de cliente.

**Ordem do Diretor Geral, prioridade máxima.** *"Se um parceiro foi cobrado, outros
podem ter sido."*

## O DEFEITO QUE PRODUZIU O DANO (já medido, não refaça)
A tabela de preço fechado (25/08) faz `minPrice === maxPrice` por construção
(`live-calculator.ts:144-145`). A trava do desconto em `negotiate-proposal.ts` era
`newTotal >= est.totalMin && newTotal < est.totalMax` — **condição impossível**.

**Consequência:** desde ~25/08, **todo** cliente que pediu ajuste de preço ouviu
"condição especial" e **recebeu o preço cheio**. Não é um caso: é uma janela.

## O QUE ENTREGAR — a LISTA, e só ela
Para cada pedido afetado: **quem** (id do cliente e nome do negócio), **quanto**
(o valor que ficou na proposta), **quando** (data da negociação), e **se chegou a
pagar** (há pagamento confirmado ligado a ele?).

⛔ **NÃO estorne. NÃO altere. NÃO mande mensagem a ninguém.** Só a lista. O que
fazer com ela é decisão do CEO. **Qualquer caminho de escrita neste trabalho é
violação.**

## COMO — o padrão que esta casa já tem
Este ambiente **não tem credencial de produção**. O contorno já existe e é o mesmo
do retrato dos convites: **um módulo puro + uma seção nova na rota somente-leitura
que já existe**, `app/api/piloto/diagnostico/route.ts`.

- Módulo puro novo (sem Prisma), testável fora do banco.
- **Chamador real:** a rota citada, que já é `GET`, já é protegida por
  `PILOTO_SECRET`, e cujo único verbo Prisma é `findMany`. **Não crie rota nova.**
- **Somente leitura. Nenhum `create`/`update`/`delete`/`upsert` no caminho.**
- Falha de leitura **não vira lista vazia**: siga o padrão da rota (`medido: false`,
  503, *"não são zero, são desconhecidos"*).

## ⚠️ COMO IDENTIFICAR OS AFETADOS — meça, não presuma
O sinal de que houve negociação está no que `negotiateProposal` deixa: um
`ApprovalRequest` de `department: "proposal"` com `reviewNote` escrito por ele
(o texto começa com *"Proposta ajustada — "*), e o status do pedido mudando.
**Leia `lib/agency/execution/negotiate-proposal.ts` e descubra a marca real** — não
invente heurística. Se a marca não for confiável, **diga isso** e proponha a que for.

**A janela:** de ~25/08 (quando a tabela de preço fechado entrou) até agora.
Confirme a data olhando o histórico de `live-calculator.ts` e **declare a data que
você usou**.

## ⚠️ PII — a régua desta rota
Ela já declara: *"contagens e ids… nenhum briefing inteiro, nenhum nome de
prospect, nenhum telefone, nenhuma frase da conversa."* Aqui o CEO pediu **quem**,
então **nome do negócio e id são necessários e autorizados** — mas **nada além
disso**. Sem telefone, sem e-mail, sem trecho de conversa.

## FRONTEIRAS
- ⛔ Não toque em `prisma/schema.prisma`, `ParceriaDoCliente`, `Publication` — há
  frentes vivas neles.
- ⛔ Nada de cancelamento/multa/devolução/reembolso.
- **Não commite. O Diretor commita e roda o portão.**

## CRITÉRIO DE ACEITE
1. **Quem CHAMA** o que você escreveu — arquivo e linha.
2. Teste com cenário plantado: um pedido negociado dentro da janela **aparece**; um
   fora da janela, e um sem negociação, **não aparecem**. As duas metades.
3. **Quebre cada trava de propósito e veja VERMELHO** — em especial: faça o módulo
   devolver lista vazia quando a leitura falha, e prove que o teste cai.
4. `npx tsc --noEmit` limpo · `npx vitest run` verde.
5. ⚠️ **Se não conseguir rodar `npx`, DIGA NO TOPO** e não apresente raciocínio como
   medição.
6. **Declare o que não conseguiu provar** — em especial, que sem a chave de produção
   a lista real **não foi obtida**, só o instrumento que a obtém.
