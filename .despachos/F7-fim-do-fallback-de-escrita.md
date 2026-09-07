# 🔴 A rota de leitura cai num segredo de ESCRITA. Corte o fallback.

## O DEFEITO, no próprio arquivo, com o aviso já escrito lá
`app/api/piloto/diagnostico/route.ts` autoriza com:

```ts
const esperado = process.env.PILOTO_SECRET || process.env.CRON_SECRET;
```

O `CRON_SECRET` é o segredo que **autoriza ESCRITA** em `cron/v2`. E o segredo desta
rota trafega em **`?chave=`**, que aparece em log de proxy/CDN.

**Então, se `PILOTO_SECRET` estiver ausente ou vazia em produção, um segredo de
escrita passa a circular em URL de uma rota de leitura.** O próprio arquivo já
registra esse achado desde 16/08 — e ele continua lá.

## O QUE EU MEDI EM PRODUÇÃO (use, não repita)
- `GET /api/piloto/diagnostico` sem chave e com chave errada → **401**, não 503.
  Logo **alguma** chave está configurada.
- `PILOTO_SECRET` **consta** na lista de variáveis do serviço no Railway.
- ⚠️ **Não dá para distinguir por fora** "variável com valor" de "variável vazia
  caindo no fallback" — as duas dão 401. **Essa indistinguibilidade é justamente o
  problema:** ninguém consegue provar hoje qual segredo está protegendo a rota.

## O CONSERTO
**A rota passa a exigir `PILOTO_SECRET` e só ela.** O fallback para `CRON_SECRET`
some.

- Ausente ou vazia → **503**, com a mensagem que já existe (*"PILOTO_SECRET não
  configurado — o diagnóstico fica fechado"*). **Fail-closed, e visível.**
- ⚠️ Trate **string vazia como ausente**. `process.env.X || ...` já trata, mas o
  novo caminho tem de tratar explicitamente — variável definida como `""` é o caso
  que mais engana.

**Por que 503 é melhor que o fallback:** 503 diz *exatamente* o que está errado e
some no minuto em que alguém configura a variável. O fallback **funciona**, e é por
isso que é perigoso: ninguém descobre que está usando o segredo errado, porque nada
quebra. *O silêncio é o custo do fallback.*

## ⛔ O QUE NÃO MUDAR
- ⛔ **`segredoConfere` fica** — é comparação de tempo constante, é a certa.
- ⛔ **A rota continua aceitando `?chave=` E o header `Authorization: Bearer`.**
  Tirar o `?chave=` quebraria o uso por `curl`, que é a razão de a rota existir. O
  risco real aqui é o fallback, não o mecanismo.
- ⛔ Nenhum verbo de escrita. Somente leitura, e continua.
- ⛔ Não toque em `prisma/schema.prisma`, `ParceriaDoCliente`, `Publication`.
- **Não commite. O Diretor commita e roda o portão.**

## ⚠️ CONSEQUÊNCIA OPERACIONAL — escreva-a no relato
Se em produção `PILOTO_SECRET` estiver vazia e a rota vinha funcionando pelo
`CRON_SECRET`, **este conserto vai fechar a rota (503)** até alguém configurar a
variável. **Isso é o comportamento certo** — mas o CEO precisa saber antes de subir.
Deixe isso explícito, em uma linha, no topo do seu relato.

## CRITÉRIO DE ACEITE
1. Teste: `PILOTO_SECRET` presente → autoriza; **ausente → 503**; **vazia (`""`) →
   503**; `CRON_SECRET` presente e `PILOTO_SECRET` ausente → **503, nunca autoriza**.
   Este último é o teste que fecha o defeito.
2. **Quebre de propósito e veja VERMELHO:** reponha o `|| process.env.CRON_SECRET` e
   prove que o teste acusa.
3. Header `Bearer` e `?chave=` continuam funcionando com a chave certa — prove os
   dois.
4. `npx tsc --noEmit` limpo · suíte verde nos arquivos tocados.
5. ⚠️ **Se não conseguir rodar `npx`, DIGA NO TOPO.**
6. **Declare o que não conseguiu provar.**
