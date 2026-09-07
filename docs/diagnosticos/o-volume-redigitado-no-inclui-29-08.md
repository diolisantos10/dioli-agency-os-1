# O volume redigitado no `inclui[]` — o irmão do "8 peças por mês" do PR #396

> **Origem:** varredura do `qualidade`, conferida pelo PM. Nenhum dado errou o
> cliente ainda — o defeito era coincidente, não urgente. O risco era o mesmo
> mecanismo do PR #396 acontecer aqui, sem ninguém notar até depois.

---

## 1. O defeito, medido

Em `lib/agency/planos.ts`, dentro do **mesmo objeto** de cada plano, dois
campos declaravam o volume mensal de peças **por escrito, duas vezes**:

| Plano | String em `inclui[]` (linha original) | `pecasPorMes` do mesmo objeto |
|---|---|---|
| Ritmo | `"12 peças por mês — carrossel de até 6 telas ou post único, com a arte pronta"` | `12` |
| Presença | `"Tudo do Ritmo, com 20 peças por mês"` | `20` |
| Conteúdo | `"Tudo do Presença, com 36 peças por mês — a capacidade INTEIRA da casa"` | `CAPACIDADE_MENSAL` (36) |

As duas fontes **coincidiam** no dia da medição. Mas eram duas declarações
independentes, a três linhas de distância uma da outra — e é exatamente
assim que a divergência do PR #396 começou: alguém edita `pecasPorMes` (troca
de preço, ajuste de capacidade) e esquece de tocar na frase de `inclui[]`,
porque nada no código obriga os dois a andarem juntos.

`app/planos/page.tsx:172` renderiza `p.inclui.map(...)` direto na página
pública `/planos` — sem login, sem revisão humana. O que estiver errado ali
chega ao cliente exatamente como foi escrito.

## 2. Por que era "ainda coincidente", não urgência

Nenhum dos três números estava errado no momento da medição — os dois lados
batiam. O defeito não era "a vitrine mente hoje"; era "nada impede que ela
minta amanhã, na próxima edição de `planos.ts`". Diferente do PR #396 (onde
o erro já tinha saído por cron diário), aqui a proteção que faltava era
estrutural, não um resultado incorreto já em produção.

## 3. O que o teste antigo deixava passar (com o trecho)

`__tests__/comercial/a-vitrine-nao-promete-acima-do-teto.test.ts:129-136`,
antes desta correção:

```ts
it("os planos públicos também cabem no teto do mês", () => {
  for (const p of PLANOS) {
    const m = /(\d+)\s*peças por mês/.exec(p.inclui.join(" · "));
    if (!m) continue;
    expect(Number(m[1]), `...`).toBeLessThanOrEqual(TETO_MENSAL);
  }
});
```

Dois furos:

1. Só conferia `<= TETO_MENSAL` — nunca `Number(m[1]) === p.pecasPorMes`.
   Mudar `pecasPorMes` do Ritmo para 10 sem tocar na frase deixava o teste
   **verde** com a vitrine mentindo (10 no campo estruturado, 12 na frase que
   o cliente lê).
2. `if (!m) continue` fazia o teste **pular em silêncio** qualquer plano cuja
   frase perdesse o número — sem falha, sem aviso. Um teste que existe para
   proteger e para de proteger sem ninguém notar é pior que a ausência dele:
   dá falsa confiança.

## 4. O que mudou

**`lib/agency/planos.ts`:**
- Nova constante `PECAS_POR_MES` (`pulso: 0, ritmo: 12, presenca: 20, conteudo:
  CAPACIDADE_MENSAL`), declarada junto de `CAPACIDADE_MENSAL`.
- `pecasPorMes` de cada plano passou a ler dessa constante
  (`PECAS_POR_MES.ritmo`, `.presenca`, `.conteudo`).
- As três frases de `inclui[]` passaram a interpolar a mesma constante em vez
  de ter o número escrito à mão. **Nenhum valor mudou** — Ritmo continua 12,
  Presença 20, Conteúdo 36. A frase resultante é byte a byte igual à de antes.

**`__tests__/comercial/a-vitrine-nao-promete-acima-do-teto.test.ts`:**
- O teste que só conferia `<= TETO_MENSAL` agora também exige **igualdade**
  entre o número na frase e `p.pecasPorMes`, e **falha** (não pula) se um
  plano com `pecasPorMes > 0` não trouxer número na frase. O Pulso
  (`pecasPorMes: 0`) fica de fora de propósito — ele declara em `naoInclui`
  que não inclui peça, e o teste confere isso.
- Teste novo: monta a frase esperada a partir de `PECAS_POR_MES` (importada
  de `planos.ts`, não redigitada no teste) e confere que ela aparece em
  `inclui[]` — a segunda metade que faltava, provando que a frase segue a
  constante e não um número solto que por acaso bate.

## 5. Ligação com o incidente irmão (PR #396)

Mesmo formato de defeito: **um número escrito em texto livre, ao lado de um
campo estruturado que diz a mesma coisa, sem mecanismo que os prenda juntos.**
No PR #396 (toque de recompra) a divergência já tinha saído errado ao cliente,
por cron diário. Aqui a divergência ainda não tinha acontecido — mas o
mecanismo que a produziria (editar um campo sem editar o outro) era idêntico,
e o teste existente dava falsa sensação de proteção. A régua da casa: número
que aparece em prosa para o cliente e em campo estruturado para o código não
pode ter duas fontes — tem que ter uma, interpolada nas duas pontas.

## 6. A prova — executada pelo PM, não afirmada

**Primeira metade: o gate pega o que precisa pegar.** Plantei a divergência
exata que o defeito produziria (`pecasPorMes: 10` no Ritmo, frase de `inclui[]`
redigitada à mão dizendo "12 peças por mês") e rodei os DOIS testes contra ela:

| Teste | Resultado com a divergência plantada |
|---|---|
| o antigo (`git show HEAD:...`) | **VERDE** — `Tests 1 passed`. Deixou a mentira passar. |
| o novo | **VERMELHO** — `o plano público "ritmo" promete 12 peças/mês na frase, mas pecasPorMes é 10 — os dois têm de bater.` |

*Sem gate = reprovado.* O gate antigo rodava e não protegia nada; agora protege.

**Segunda metade: o conserto não mexeu em nenhum valor.** Copiei o `planos.ts`
de antes do commit para dentro do projeto e comparei os dois objetos `PLANOS`
plano a plano, campo a campo, com as frases de `inclui[]` e `naoInclui` juntadas
byte a byte. **Idêntico.** As três frases que o cliente lê em `/planos` saem
hoje exatamente como saíam:

```
DEPOIS ritmo (pecasPorMes=12): "12 peças por mês — carrossel de até 6 telas ou post único, com a arte pronta"
DEPOIS presenca (pecasPorMes=20): "Tudo do Ritmo, com 20 peças por mês"
DEPOIS conteudo (pecasPorMes=36): "Tudo do Presença, com 36 peças por mês — a capacidade INTEIRA da casa"
```

Os dois arquivos de prova eram andaimes e foram apagados — o que fica é o gate
novo, que roda em toda passada da suíte.

**O portão inteiro:** `npx tsc --noEmit` limpo (rodado DEPOIS dos testes),
`npm run build` verde, suíte **535 arquivos / 7.444 testes** verde.

## 7. O que NÃO foi feito, e é declarado

- **`PECAS_POR_MES` não é a fonte de `CAPACIDADE_MENSAL`** — é o contrário:
  `conteudo` aponta para `CAPACIDADE_MENSAL`, que continua sendo o teto provado
  da casa (3 levas de 12). Isso é de propósito: o teto é uma verdade de
  produção, não uma escolha de escopo comercial.
- **Os comentários podres de `planos.ts` continuam lá** (linha 9: *"R$ 49 e
  R$ 297 fecham"*, quando o Ritmo é R$ 290 desde 26/08). São de outra frente e
  não foram tocados nesta — mexer no cabeçalho deste arquivo com uma frente de
  preço viva ao lado é como se cria conflito de merge por nada. **Continua
  aberto.**
- **Nenhum preço, prazo, permanência ou escopo mudou.** Fronteira de preço é do
  CEO.
