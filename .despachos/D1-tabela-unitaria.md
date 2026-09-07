# 🔴 ORDEM DO CEO — a carta do cardápio. Ele quer em MINUTOS.

> *"Os planos é pra quem quer plano. Tudo da nossa agência é customizável. Quanto
> custa cada post? É como pizzaria: existe o combo da pizza com refrigerante, e
> esse é o nosso plano. Mas se ele quiser, ele compra só o refrigerante. Cadê a
> tabela de preços dos serviços que a gente presta? Tem que ser feito em cinco
> minutos. E o que o cliente pedir tem que ter preço. Quem manda é o cliente."*

## ENTREGA 1 — E É SÓ ESTA AGORA: O DOCUMENTO
`docs/precos-por-servico.md`. **Não escreva código nesta rodada.** O CEO quer a
tabela e a conta para aprovar ou corrigir. Código vem depois, noutro despacho.

## O QUE EU JÁ MEDI — use, não repita

**Planos publicados** (`lib/agency/planos.ts`, fonte única, preço fixado pelo CEO):

| plano | preço/mês | peças/mês | unitário embutido |
|---|---|---|---|
| Pulso | R$ 49 | 0 | — (não entrega peça) |
| Ritmo | R$ 290 | 12 | **R$ 24,17** |
| Presença | R$ 490 | 20 | **R$ 24,50** |
| Conteúdo | R$ 790 | 36 (`CAPACIDADE_MENSAL`) | **R$ 21,94** |

**E o número que muda tudo:** `PECA_EXTRA = 90` (`planos.ts:64`) — o preço da peça
**além** do contratado.

🔴 **A peça avulsa custa R$ 90 e a peça dentro do plano sai a ~R$ 22–24. Quase
4×.** Um cliente pedindo 28 posts custa **R$ 677** pela régua do plano ou
**R$ 2.520** pela régua do avulso. **Esta é a pergunta central do documento** — e
ela é do CEO, não sua. Apresente as duas réguas, mostre a conta, e **peça a
decisão**. Não escolha por ele.

**Outras fontes de preço que JÁ existem — varra e catalogue, não ignore:**
- `lib/agency/self-serve-catalog.ts` — serviços de preço fixo, com `price` e
  `precoMinimo` (ex.: 79/49, 129/79, 35/25, 99/59, 39/…)
- `lib/agency/service-catalog.ts` — catálogo por departamento
- `lib/agency/catalogo-v2/` — `catalogo.ts`, `capacidades.ts`, `specs.ts`
- `docs/precos.md` — a decisão do CEO de 05/08/2026
- `lib/agency/pricing-margins.ts` — `floorPrice` (~70% do preço de tabela),
  `targetPrice`, `costBasis`. **Se houver regra de margem, ELA MANDA.**

## ⛔ AS FRONTEIRAS — não as cruze
- **VOCÊ NÃO INVENTA PREÇO.** Deriva do que o CEO já publicou, **mostra a conta**,
  e traz para ele aprovar ou corrigir. Quem fixa preço é o CEO.
- ⛔ **Não altere preço nenhum de plano existente.** Nem um centavo, nem em código,
  nem "só para ficar redondo".
- ⛔ **Não invente serviço que a casa não presta.** `planos.ts` avisa: só entra o
  que tem código rodando em produção, e `so-vende-o-que-produz.test.ts` trava isso
  contra `capacidade-de-producao.ts`. **Leia o catálogo real** e diga o que a casa
  de fato entrega. Serviço no cardápio que a cozinha não faz é promessa sem
  fechadura — a doença que esta casa está tratando hoje.
- ⛔ Vídeo está **fora da mensalidade por decisão do CEO** (`planos.ts:16-18`).
  Respeite.
- ⛔ Nada de cancelamento, multa, devolução ou reembolso — vedado até o jurídico.

## LACUNA DECLARADA, E O DOCUMENTO TEM DE DIZER ISSO
O CEO citou um **Departamento Financeiro** nas branches `financeiro/celulas-e-sala-v1`
e `arquitetura/departamento-financeiro-control-room-v1` (`docs/departamento-financeiro-v1/`).
**Elas NÃO existem neste repositório** — conferi com `git ls-remote --heads origin`:
zero resultados. São da Control Room, fora do alcance desta sessão.
**Escreva isso no documento**, em destaque: se houver regra de margem lá, ela manda
e esta tabela é provisória até alguém confrontar as duas.

## O QUE O DOCUMENTO TEM DE TER
1. **A carta**: cada serviço que a casa realmente entrega, com preço unitário
   proposto, e **de onde saiu o número**, linha por linha.
2. **A conta dos combos**: cada plano como **soma dos itens menos desconto
   declarado** — o desconto de cada plano explícito, em % e em R$. *O plano deixa
   de ser caixa-preta e vira soma que qualquer um confere.*
3. **A pergunta do R$ 90 vs R$ 24**, com as duas réguas e o efeito no caso real:
   28–30 posts/mês + 3 carrosséis/semana (o pedido do parceiro que está esperando).
4. **O que decide o CEO** — lista curta, cada item com as opções e a recomendação
   fundamentada. Ele lê bullets: conclusão primeiro.
5. **O que você NÃO conseguiu apurar**, com todas as letras.

## CRITÉRIO DE ACEITE
- Todo número tem **procedência**: arquivo e linha, ou a conta que o produziu.
- Nenhum serviço listado sem confirmar que a casa o entrega hoje.
- Nenhum preço de plano alterado.
- Se não conseguir rodar comando algum, **diga no topo** e não apresente
  raciocínio como medição.
- **Não commite. O Diretor commita.**
