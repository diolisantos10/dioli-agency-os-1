# 🔴 PASSO 1 — ligar a parceria da Foocci. **Precisa de quem tem login.**

> Ordem do Diretor Geral, 30/08/2026: *"Ligar a parceria da Foocci de verdade.
> O Marcos foi cobrado R$ 290 hoje de manhã e continua vendo cobrança. Isto vem
> primeiro — enquanto não estiver certo, qualquer resposta é papo."*

## Por que a sala não fez isso sozinha — em uma frase
`POST /api/agency/parcerias` exige **sessão autenticada da agência**
(`getSession` + `isAgencyRole`, `route.ts:39`), e esta sessão **não tem credencial
de produção, acesso ao Railway nem ao banco**. É ato de quem tem login.

## ⚠️ ANTES DE LIGAR: existem DOIS cadastros da FOOCCI
Nasceram com 7 segundos de diferença em 27/08 21:22 (double-submit):

| cadastro | criado |
|---|---|
| `cmtc145qf007a0xo4txmjss11` | 21:22:45 |
| `cmtc13zy700760xo40pmav2xc` | 21:22:38 |

**Autorizar no cadastro errado não resolve nada** — o Marcos continua sendo
cobrado, porque a conversa dele resolve para o outro. Ver
`docs/diagnosticos/fusao-de-cliente-duplicado.md`.

**Duas ordens possíveis, e a segunda é a segura:**
1. **Fundir primeiro** (`/agency/clients` → botão "Fundir", perfil `master` ou
   `project_manager`), **sobrevivente = o cadastro que já tem a parceria e o
   convite** — porque o `portalToken` do absorvido morre com ele, e um link já
   entregue viraria link morto. A fusão **deixou de abortar com 500 mudo** no
   PR #400.
2. **Depois** autorizar/conferir a parceria no sobrevivente.

## O ato, com os valores já decididos pelo Diretor Geral
Parceria Foocci: **R$ 0 em dinheiro**, valor de referência **R$ 700/mês**.
Pedido do Marcos: 28–30 peças/mês, ~12 carrosséis — **cabe** (capacidade 36).

```
POST /api/agency/parcerias        (logado como master/PM na produção)
{
  "clientId":            "<o cadastro SOBREVIVENTE da FOOCCI>",
  "autorizadaPor":       "<nome de quem autoriza — NOMINAL, obrigatório>",
  "validaAte":           "<data ISO — OBRIGATÓRIA: parceria eterna vira esquecimento>",
  "escopo":              "Social media — 28 a 30 pecas/mes, ate 12 carrosseis",
  "pecasContratadas":    30,
  "tetoDeIaCentavosUsd": <teto de custo de IA em centavos de USD — OBRIGATÓRIO>,
  "observacao":          "Parceria Foocci. Referencia R$ 700/mes, R$ 0 em dinheiro."
}
```

⚠️ **`tetoDeIaCentavosUsd` é obrigatório e não é burocracia:** sem teto, o parceiro
consome o crédito de IA do cliente pagante, que é finito e sem recarga automática.

⛔ **NÃO é pagamento.** Receita R$ 0 marcada como parceria, custo contado
normalmente, margem negativa visível no financeiro. **Nunca** um pagamento falso de
R$ 0.

## Depois de autorizar — o passo que quase todo mundo esquece
A resposta da própria rota avisa: **cunhe o convite e entregue o LINK**.

```
POST /api/agency/convites-de-parceria   → devolve o token
link: https://www.diolidigital.com.br/briefing?convite=<token>
```

**O convite não é a autorização** — ele aponta para ela, e ela é conferida **viva a
cada uso**. Se a parceria vencer ou for revogada, o convite morre no mesmo instante.

## Como CONFERIR que ficou certo, sem esperar o Marcos voltar
```
curl -sS "https://www.diolidigital.com.br/api/piloto/diagnostico?chave=$PILOTO_SECRET" | jq .parcerias
```
Devolve, para **cada** convite do banco: qual dos seis motivos ele recebe agora, o
`clientId` para onde aponta e o prefixo de 8 caracteres do token (**nunca o token
inteiro**) — mais os cadastros de nome colidente, dizendo qual tem parceria viva.

**O que você quer ver:** o convite do Marcos com `motivo: null` (vale), apontando
para o cadastro sobrevivente, e nenhum grupo colidente restante.

## O que ainda estará errado na tela dele DEPOIS disto
- **O escopo** (a página mostra 1 post/semana) e o **preço negociado** só chegam à
  página quando o conserto do preço subir — ele está **pronto e travado no push**
  por colisão de reivindicação em `prisma/schema.prisma` com outra sessão viva.
