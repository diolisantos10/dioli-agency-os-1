# 🔴 P0 — "Vou trazer … ainda hoje" AINDA PASSA. É a frase que o parceiro está esperando.

## MEDIDO POR MIM, RODANDO (não raciocinado)

Isolei cada frase contra `promessasSoltas` real:

| # | frase | detectada? |
|---|---|---|
| A | `pode deixar comigo` | ✅ pega |
| B | `Vou trazer essas duas respostas para você ainda hoje.` | ❌ **PASSA** |
| C | `Vou trazer essas duas respostas para você ainda hoje` | ❌ **PASSA** |
| D | `Vou trazer as respostas ainda hoje.` | ❌ **PASSA** |

E o teste que você mesmo escreveu reprova por isso:

    FAIL __tests__/comercial/promessa-que-a-maquina-nao-cumpre.test.ts
      > 'pode deixar comigo' e 'vou trazer... ainda hoje' nascem tipo 'generica'
      AssertionError: expected 0 to be greater than 0   (linha 124)

**"Vou trazer … ainda hoje" é LITERALMENTE a promessa que o Marcos está
esperando agora.** Ela é a razão do P0. E é a única das seis que continua saindo.

⚠️ **Por que isso quase passou batido, e a lição é sua:** uma sonda com a frase
INTEIRA (*"Vou trazer … ainda hoje — pode deixar comigo."*) dá **verde**, porque o
`pode deixar comigo` no fim casa. **A frase composta esconde o buraco da frase
simples.** Teste cada oração isolada, nunca só a mensagem inteira.

## O QUE FAZER
1. Faça `vou trazer …` (e a família: *trago*, *te trago*, *vou te trazer*) ser
   detectada **sozinha**, com ou sem "ainda hoje", com ou sem ponto final, com e
   sem acento em "você".
2. **Rode as quatro linhas da tabela acima e cole o resultado.** A, B, C e D têm
   de ficar todas ✅.
3. Rode o arquivo de teste inteiro: `__tests__/comercial/promessa-que-a-maquina-nao-cumpre.test.ts`
   → **17 verdes** (hoje é 16 + 1 vermelho).

## ⚠️ A OUTRA METADE — não alargue demais
`__tests__/comercial/` inteiro tem de continuar verde (**739 verdes hoje, 1
vermelho**). O módulo protege de propósito frases legítimas — a EQUIPE prometendo
por si quando há fila de gente de verdade, e a instrução sobre o que a casa
realmente faz. **Se você quebrar qualquer teste existente, você alargou demais.**
*Meia trava é pior que trava nenhuma: parece inteira.*

Cuidado especial com `trazer`: **"vou trazer" dito pela MÁQUINA é promessa; a casa
"trazer resultado" numa frase descritiva não é.** Se a distinção for difícil,
prefira errar barrando — o caminho de barrado já existe e é honesto
(`limparPromessaSolta` + `O_QUE_DIZER_NO_LUGAR`).

## CRITÉRIO DE ACEITE
1. As quatro linhas A–D, com a saída colada.
2. `__tests__/comercial/` inteiro verde, com a saída colada.
3. `npx tsc --noEmit` limpo.
4. **Quebre a régua nova de propósito e veja VERMELHO**; desfaça; relate.
5. ⚠️ **Se não conseguir rodar `npx`** (`This command requires approval`), **DIGA
   NO TOPO** e não apresente raciocínio como medição — foi exatamente traçar regex
   à mão que deixou esta frase passar.

## RESTRIÇÕES
- Toque só em `lib/agency/comercial/promessa-que-a-maquina-nao-cumpre.ts` e no
  teste dele.
- ⛔ Nada de cancelamento/multa/devolução/reembolso. ⛔ Não fale com o cliente.
- Não toque em `app/api/portal/approvals/route.ts`, `lib/agency/esteira/refacao.ts`,
  `lib/agency/esteira/publicacao.ts`, `prisma/schema.prisma`.
- **Não commite.**
