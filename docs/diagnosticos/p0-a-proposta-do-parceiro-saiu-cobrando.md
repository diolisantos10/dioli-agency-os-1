# P0 — a proposta do parceiro saiu cobrando · 29/08/2026

> **Causa medida, com arquivo e linha. Diagnóstico primeiro, conserto depois.**

## A cadeia, em cinco passos

| # | Onde | O que acontece |
|---|---|---|
| 1 | `app/briefing/page.tsx:72` | a sala submete o briefing para `POST /api/brain/client-requests` — **e o corpo NÃO leva o `convite`** |
| 2 | `app/api/brain/client-requests/route.ts:292` | `createClientRequest({...})` é chamado **sem `clientId`** |
| 3 | — | **o pedido nasce ÓRFÃO**, sem cliente |
| 4 | `app/api/portal/briefing/proposta/route.ts:100` | `parceriaVivaDoCliente(pedido.clientId)` recebe `null` → devolve `null` |
| 5 | `app/proposta/[token]/page.tsx` | `isento` é `null` → a tela desenha **cliente pagante**: preço à vista e botão "Aceitar e começar" |

**Isto explica os defeitos 1 e 2 de uma vez.** Não são dois problemas: é um.

## ⚠️ A trava de segurança do passo 2 está CERTA

O comentário na própria rota diz por quê:

> *"`workspaceId`/`clientId` do CORPO não entram mais: esta rota é pública (é o
> submit do formulário /briefing) e aceitá-los deixava qualquer pessoa plantar
> uma solicitação dentro da caixa de entrada de uma agência escolhida a dedo."*

**Não se conserta afrouxando isso.** Aceitar `clientId` do corpo reabriria um furo
conhecido. O que falta é o **token do convite** viajar até aqui e o **servidor**
derivar o cliente dele — exatamente como `/api/sdr/chat` já faz desde 27/08.

## 🔴 Por que o teste do #373 estava verde enquanto isto acontecia

**Ele monta o pedido JÁ COM `clientId`** no banco de teste, e então prova que a
rota mostra a isenção.

Ele prova: *"dado um pedido de parceiro, a proposta mostra a isenção"*. ✅
Ele nunca provou: *"o pedido do parceiro nasce com o clientId do parceiro"*. ❌

**É a mesma doença de sempre, e desta vez dentro do meu próprio teste**: duas
metades provadas, e o fio entre elas não. O teste não estava errado — estava
**incompleto**, e a fronteira que ele não cruzava é exatamente onde o defeito
mora. *Régua verde sobre o componente errado é pior que régua nenhuma.*

## Onde a família se repete

É a **12ª ocorrência**, com uma diferença que importa: aqui **a fechadura
existe** (`resolverConviteDeParceria`), **a porta existe** (`clientId` no
pedido), e o que falta é o **convite ser levado no momento do submit**. Não é
mecanismo ausente — é mecanismo desligado num ponto da corrente.

## Os outros dois defeitos

**3. "Plano Ritmo — 1 posts/semana"** — dois problemas na mesma linha:
- **concordância:** "1 posts". Bug de texto, independente.
- **volume:** 1 post/semana. ⚠️ **O volume vem do BRIEFING, não da parceria.** As
  12 peças autorizadas são o TETO do que a parceria cobre, não o que o cliente
  pediu. Se o Marcos disse 1 post/semana, a proposta está certa e o problema é o
  briefing (defeito 4). **Não medi ainda qual dos dois é.**

**4. O briefing veio errado** — **não consigo medir**: a conversa dele está no
banco de produção e **nenhuma sala nossa tem credencial**. Preciso do texto do
rastro para dizer se a causa é o SDR ou a montagem da proposta. **Declarado, não
adivinhado.**

## O conserto proposto

1. `app/briefing/page.tsx` passa a enviar `convite: conviteDaUrl()` no submit.
2. `app/api/brain/client-requests` passa a aceitar `convite` (**o token, nunca o
   `clientId`**), resolve pelo servidor com `resolverConviteDeParceria` e amarra
   o cliente derivado.
3. **A trava continua de pé:** `clientId` do corpo segue proibido. O que entra é
   um token que o servidor valida — token inventado resolve `null` e o pedido
   nasce órfão, como hoje.


---

## ✅ CONSERTADO — e as mutações que ele sobreviveu

Duas linhas, nos dois lados da fronteira:

1. `app/briefing/page.tsx` envia `convite: conviteDaUrl()` no submit;
2. `/api/brain/client-requests` resolve o **token** com
   `resolverConviteDeParceria` e amarra o `clientId` **derivado**.

**A trava da rota pública não foi afrouxada** — `clientId` do corpo continua
recusado. Token inventado resolve `null` e o pedido nasce órfão, como sempre.

| # | Mutação | Derrubou |
|---|---|---|
| 1 | a rota ignora o convite (o defeito original) | o teste do pedido amarrado |
| 2 | a rota aceita `clientId` do corpo | o teste da trava |
| 3 | a sala para de mandar o convite | ⚠️ **sobreviveu** → guarda → **agora derruba 1** |

⚠️ A mutação 3 sobreviveu pelo mesmo motivo de sempre: o submit mora num
componente React que este repositório não renderiza com estado. O guarda é de
texto, e está declarado como tal no próprio teste.

**Validação:** `tsc` limpo · 2.430 testes verdes · `npm run build` compila.

## 🚩 O que continua sem medição

- **O defeito 3 (volume "1 posts/semana")** — a concordância é bug de texto; o
  volume vem do briefing, e **não sei se o Marcos pediu 1 post/semana ou se a
  casa entendeu errado**. Sem a conversa dele, é palpite.
- **O defeito 4 (o briefing veio errado)** — **preciso do rastro da conversa**,
  que está no banco de produção. Nenhuma sala nossa tem credencial.
- **Não toquei no visual da proposta**, conforme a ordem. O único arquivo de tela
  que abri foi `app/briefing/page.tsx`, e só para acrescentar o campo `convite`
  no submit — **regra, não aparência**.
