# Varredura de rotas sem conferência de posse — 28/08/2026

> **Ordem do Diretor Geral**, depois de eu declarar no #376 que havia consertado
> **uma** rota e não auditado as outras. *Uma rota fechada não é uma classe de
> defeito fechada.*
> **Custo:** zero. Nada em produção, nenhuma chamada de IA.

## O método

A pergunta: **que rota recebe um id e não confere de quem ele é?**

Varri as **27 rotas de API com `[id]` na URL**. Oito não conferiam posse à
primeira leitura. **Cinco eram falso positivo** — conferem de outra forma
(`ehDoWorkspace`, `mudancaDeBrainDoWorkspace`, `sugestaoDoWorkspace`,
`solicitacaoDoWorkspace`, ou comparando `session.workspaceId === registro.workspaceId`).

**Três eram furo real**, e os três com o mesmo padrão:
`findUnique({ where: { id } })` — sem o workspace de quem chamou.

---

## 🔴 Furo 1 — a peça do vizinho, e o motivo que vira regra

`POST /api/social-posts/{id}/reprovar` → `reprovarPeca`

Conferia **papel** (`requireSession(["master","project_manager","social_staff"])`)
e **não conferia posse**.

**Um `social_staff` da agência A reprovava a peça da agência B.** E é pior que
ler: o motivo escrito por ele virava **proibição de marca no cliente da B** — uma
regra permanente que a produção passa a obedecer nas próximas peças daquele
cliente.

**É o mais grave dos três: escreve, e a escrita não some quando alguém percebe.**

## 🔴 Furo 2 — a ficha de marca de cliente alheio

`POST /api/brain/updates/{id}/apply` → `applyBrainUpdate`

Qualquer papel de agência aplicava a atualização de marca de um cliente de outro
inquilino. **A ficha de marca é o que a produção lê para escrever a peça.**

⚠️ Aqui a posse é **derivada**: `BrainUpdate` não tem `workspaceId` — ele aponta
`clientRequestId`, e é a solicitação que tem dono. O conserto confere o pedido.

## 🔴 Furo 3 — a biblioteca de tendências do vizinho

`POST /api/radar/insights/{id}` → `approveInsight` / `rejectInsight`

Aprovava ou rejeitava insight de outro workspace. E `archiveActiveTopic` usava o
`workspaceId` **lido do insight alheio** — ou seja, mexia na biblioteca do
vizinho usando o dono errado como referência.

---

## O conserto

Os três agora exigem `workspaceId` como **parâmetro obrigatório**, vindo da
sessão. **Não é opcional de propósito:** foi o `tsc` que apontou cada chamador,
um a um, e um parâmetro opcional teria deixado os antigos passarem calados.

O escopo vai no `where` da consulta, **nunca numa comparação depois** — comparar
depois funciona até alguém acrescentar um caminho de saída antes do `if`.

E o silêncio é deliberado: devolve como se não existisse. **Confirmar que existe
e é de outra conta já é vazamento.**

## As mutações

| # | Mutação | Derrubou |
|---|---|---|
| 1 | `reprovarPeca` volta a buscar só por id | o teste do `where` |
| 2 | `applyBrainUpdate` para de conferir o dono | ⚠️ **sobreviveu** → escrevi o teste → **agora derruba 2** |
| 3 | `approveInsight` ignora o workspace | ⚠️ **sobreviveu** → escrevi o teste → **agora derruba 1** |

**Duas sobreviveram na primeira rodada.** Eu havia consertado os três e testado
só um — *o conserto estava lá e nada o mordia*, que é a doença desta casa
acontecendo dentro do meu próprio trabalho. Fechadas.

---

## 🚩 O que eu NÃO consegui provar, e fica declarado

1. **Só varri rotas com `[id]` na URL.** Rotas que recebem `clientId` **no corpo**
   da requisição não foram varridas — é a mesma família e **pode haver mais
   furos lá**. Não deu tempo hoje.
2. **`historicoDaPeca` continua sem conferir posse** (`reprovacao.ts`). É
   **leitura** de histórico de reprovação, não escrita, e mudá-la exigiria tocar
   outros chamadores. **Deixei de propósito e declaro** em vez de consertar com
   pressa.
3. **Não subi o app com duas sessões reais.** A prova é sobre as funções que
   decidem, com o banco dublado — não uma requisição ponta a ponta com dois
   logins.
4. **Os cinco falso-positivos eu li, não testei.** Confirmei que conferem posse
   lendo o código; não escrevi teste para cada um.
