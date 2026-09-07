# 🔴 A auditoria vaza nome de cliente numa rota cuja chave viaja na URL. Tire o nome.

## O QUE QUEBROU
`__tests__/plataforma/diagnostico-mede-e-nao-escreve.test.ts` → **vermelho**:

```
× não devolve PII do prospect nem o briefing inteiro
AssertionError: a resposta passou a carregar businessName
```

A seção nova da auditoria (`preco_cheio_apos_negociacao`) devolve `businessName`,
e a guarda de PII da rota proíbe.

## POR QUE A GUARDA VENCE — e a autorização anterior estava errada
A ficha da auditoria (escrita pelo Diretor) dizia que "nome do negócio e id são
necessários e autorizados". **Estava errada, e a guarda da casa é mais velha e mais
certa.** A própria rota declara no cabeçalho: *"contagens e ids… nenhum briefing
inteiro, nenhum nome de prospect."*

E o agravante é concreto: **o segredo desta rota trafega em `?chave=`**, que aparece
em log de proxy/CDN. Quem capturar a chave num log passa a ler **nome de cliente** —
não só contagem. *Uma trava não se afrouxa porque quem pediu tem pressa.*

**`clientId` responde "quem" com precisão.** O nome é conveniência, e conveniência
não paga PII em canal exposto: quem tem a lista de ids abre o painel e vê os nomes,
com sessão, como deve ser.

## O CONSERTO
Tire `businessName` (e qualquer outro campo de nome) da saída da seção
`preco_cheio_apos_negociacao`. Ficam: **`clientId`**, **valor**, **data**, e **se
pagou**.

- Se o módulo puro precisa do nome internamente, tudo bem — **o que não pode é ele
  sair na resposta HTTP.**
- Ajuste o teste da auditoria para afirmar que o `clientId` sai e que **o nome NÃO
  sai** — a asserção negativa é a que protege.
- ⛔ **Não afrouxe `diagnostico-mede-e-nao-escreve.test.ts`.** Ele é a guarda; ele
  vence.

## CRITÉRIO DE ACEITE
1. `npx vitest run __tests__/plataforma/diagnostico-mede-e-nao-escreve.test.ts` →
   **verde**, sem ter sido editado.
2. `npx vitest run __tests__/comercial/preco-cheio-apos-negociacao.test.ts` → verde.
3. `npx tsc --noEmit` limpo.
4. **Quebre de propósito e veja VERMELHO:** reponha o nome na resposta e prove que a
   guarda de PII cai.
5. **Confirme por varredura que a resposta não carrega nenhum outro campo de PII** —
   telefone, e-mail, trecho de conversa — e diga o que varreu.
6. ⚠️ **Se não conseguir rodar `npx`, DIGA NO TOPO.**

⛔ Não commite. ⛔ Nenhum verbo de escrita no caminho. ⛔ Não toque em
`prisma/schema.prisma`, `ParceriaDoCliente`, `Publication`.
