# FICHA — 06/09/2026 — a fila do CEO precisa distinguir "pronta" de "bloqueada"

## O defeito, achado por um especialista durante o próprio trabalho
`lib/marketplaces/99freelas/gravar-candidatura.ts` decide assim:

```ts
const propostaPronta = candidatura.desfecho === "aguardando_clique_humano";
// ...
propostaTexto: propostaPronta ? candidatura.texto : null,
```

Hoje existe um **terceiro** desfecho, criado nesta mesma branch:
`"texto_pronto_envio_bloqueado"` — proposta escrita, precificada, aprovada pelo
portão, com o envio bloqueado porque **o custo em conexões não foi lido da
tela** (ele não é público no 99Freelas; medido em 06/09).

Esse caso cai no `null`. Ou seja: **a proposta que a esteira acabou de escrever
é jogada fora na hora de gravar**, e a linha no banco fica indistinguível de um
projeto descartado. Não dá erro de tipo (não é `switch` exaustivo). Some calada.

## O que construir

### 1. O texto para de ser descartado
`propostaTexto` é gravado tanto para `"aguardando_clique_humano"` quanto para
`"texto_pronto_envio_bloqueado"`. Use um `switch` **exaustivo** sobre `Desfecho`
(com `never` no default) para que o próximo desfecho novo **quebre a
compilação** em vez de sumir com uma proposta.

### 2. E a fila TEM de distinguir os dois — esta é a parte que importa
Prosa em `raciocinio` **não é mecanismo**. Um humano lendo uma proposta bonita
na tela vai enviá-la; a régua desta casa é "trava, não aviso".

**Você decide COMO, e a decisão é a entrega.** As opções que enxergo, em ordem
de preferência minha — refute com argumento se discordar:

- **(a)** Uma entrada estruturada em `conformidadeAchados` (que já é
  `[{regra,trecho,fonte}]` e já é renderizado na tela), com
  `regra: "envio_bloqueado_custo_desconhecido"`. Sem coluna nova.
  ⚠️ Confira **na tela** (`app/agency/oportunidades/`) como esse campo é
  renderizado hoje: se ele só aparece quando `conformidadeOk === false`, esta
  opção não funciona sozinha e você precisa dizer isso.
- **(b)** Coluna nova em `Oportunidade` + migration. **Só proponha, não
  execute** — migration está proibida nesta frente por ordem do CEO. Se sua
  conclusão for que só (b) resolve de verdade, **escreva isso como recomendação
  e implemente (a) como o melhor possível hoje**, dizendo o que fica faltando.

**Não invente uma tabela nova. Não invente um valor novo de `status`** — o
conjunto `nova|aprovada|recusada|enviada` é FECHADO e conferido na rota.

### 3. `conformidadeOk` continua honesto
O portão não deu `BLOCK` nesse caso, então `conformidadeOk` continua `true`.
Não minta dizendo `false` só para colorir a tela de vermelho: isso faria a tela
afirmar que a conformidade reprovou, o que não aconteceu.

## Definição de pronto
- Testes em `__tests__/marketplaces/gravar-candidatura.test.ts` (o arquivo já
  existe — **acrescente, não reescreva**), cada trava com as duas metades:
  1. desfecho `texto_pronto_envio_bloqueado` ⇒ `propostaTexto` **NÃO** é nulo.
  2. o mesmo caso ⇒ o marcador de envio bloqueado está gravado e é
     **legível por código**, não só por leitura humana.
  3. desfecho `aguardando_clique_humano` ⇒ marcador **ausente** (a metade que
     prova que você não carimbou todo mundo de bloqueado).
  4. desfecho `eliminado`/`parado` ⇒ `propostaTexto` nulo, como hoje.
  5. `status` é `"nova"` em **todos** os casos.
- `npx tsc --noEmit` limpo — rode **depois** de escrever os testes.

## O que NÃO fazer
- ⛔ Nenhuma migration, nenhuma tabela nova, nenhum `status` novo.
- ⛔ Não toque em `scripts/coletar-99freelas.mts` — **outra frente está
  escrevendo esse arquivo AGORA**.
- ⛔ Não toque em `agente.ts` nem `portao.ts`.
- ⛔ Nada de envio, login, merge ou deploy. Não commite.
- Se não conseguir rodar `npx`/`node`, diga com a mensagem exata de recusa.
