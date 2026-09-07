# 🔴 CONFLITO DE DOUTRINA na MESMA tela e no MESMO cliente. Reconcilie — não apague.

## O QUE ACONTECEU
O conserto "recusa vira preço e prazo" deixou **5 testes vermelhos** em
`__tests__/comercial/a-tela-do-cliente-001.test.tsx`:

```
× NÃO estampa 28/mês como se fosse o contratado
× mostra o degrau que a casa vende — 36 — e o que ele pediu
× explica o encaixe na própria tela, não só no código
× nenhum volume entre 1 e 36 sai da tela fora de um degrau vendido
× volume acima da capacidade da casa não vira número nenhum
```

**Cliente 001 é a FOOCCI.** É a mesma tela, o mesmo cliente, e a casa mudou de
posição em três dias.

## AS DUAS POSIÇÕES — as duas têm razão, e é por isso que é reconciliação
**27/08 (a guarda existente):** a sala mostrava *"Posts: 28/mês"* e *"Vídeo: A
definir"*. O risco: estampar o número que o cliente pediu **parece contrato** —
ele lê 28/mês e acha que a casa se comprometeu com 28.

**30/08 (ordem do CEO):** *"Não existe volume acima ou abaixo. Se o cliente quiser
trezentos carrosséis por dia, a gente vai ter que dar um jeito. Cliente que pede uma
composição que ninguém nunca pediu recebe **PREÇO**, não recebe 'vou verificar'."*

## ⛔ O QUE VOCÊ NÃO PODE FAZER
- ⛔ **Não apague nem afrouxe** `a-tela-do-cliente-001.test.tsx` para ficar verde.
  Ele nasceu de um defeito medido em produção, com este cliente, e o cabeçalho dele
  explica por quê. **Apagar guarda para passar é o pior movimento desta casa.**
- ⛔ **Não volte a empurrar o cliente para o degrau** — o CEO revogou isso.

## A RECONCILIAÇÃO — as duas verdades cabem juntas
O que o CEO proibiu foi **recusar** e **substituir o pedido pelo degrau**.
O que a guarda de 27/08 protege é **não parecer contrato** e **nunca dizer "a
definir"**.

**As duas se resolvem assim:** a tela mostra **o que ele pediu, com preço**, e deixa
explícito que aquilo é **orçamento, não contrato**. Nada é substituído; nada é
recusado; nada fica indefinido.

O que precisa continuar verdadeiro, e você tem de provar:
1. **O número do cliente aparece** — com preço. Nunca "não vendemos esse volume".
2. **Não parece contrato fechado.** O texto deixa claro que é proposta/orçamento.
3. **Nada de "A definir" / "sob consulta"** — a guarda de 27/08 pegava isso e tem de
   continuar pegando.
4. **O preset continua aparecendo quando é mais barato** — como oferta, não encaixe:
   *"o plano X te dá mais peças por menos; quer?"*
5. **Acima da capacidade sai preço + prazo** — jamais "não vira número nenhum".

## COMO TRATAR O ARQUIVO DE TESTE
Reescreva **as asserções que codificam a doutrina revogada** (empurrar para degrau,
recusar acima da capacidade) — e **preserve, com o mesmo rigor**, as que protegem o
que continua valendo (não parecer contrato, nada de "a definir", a tela renderizada
de verdade e não a função isolada).

**Em cada asserção que você mudar, escreva no corpo do teste POR QUÊ mudou, citando
a ordem do CEO de 30/08.** Quem ler isso em três meses precisa entender que foi
decisão de dono, não conveniência de quem queria ficar verde.

⚠️ **Mantenha o `renderToStaticMarkup(ScopeSection)`.** O cabeçalho do arquivo
explica: em 27/08 o conserto foi provado na função e **nenhuma tela chamava**, a
suíte ficou verde e o cliente continuou lendo o texto errado. **A régua só vale
porque renderiza.**

## CRITÉRIO DE ACEITE
1. `npx vitest run __tests__/comercial __tests__/financeiro __tests__/briefing` →
   **zero vermelhos**.
2. `npx tsc --noEmit` limpo.
3. **Quebre de propósito e veja VERMELHO:** (a) faça a tela voltar a substituir o
   pedido pelo degrau; (b) faça-a devolver "a definir". As duas têm de cair.
4. **Diga, no relato, exatamente quais asserções você mudou e quais preservou** —
   uma lista, não um resumo.
5. ⚠️ **Se não conseguir rodar `npx`, DIGA NO TOPO** e não apresente raciocínio como
   medição.
6. **Declare o que não conseguiu provar.**

⛔ Não commite. ⛔ Nada de cancelamento/multa/reembolso. ⛔ Não fale com ninguém.
