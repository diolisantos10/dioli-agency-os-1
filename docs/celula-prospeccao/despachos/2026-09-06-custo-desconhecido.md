# FICHA DE DESPACHO — 06/09/2026 — separar "não sei se cabe" de "não cabe"

## Objetivo em uma frase
Em `lib/marketplaces/99freelas/agente.ts`, parar de tratar **custo em conexões
DESCONHECIDO** como se fosse **cota estourada** — sem afrouxar nenhuma trava de
envio.

## O defeito, medido hoje (06/09/2026)
`processarProjeto` roda: eliminar → janela 24h → **COTA** → escrever → precificar
→ higienizar → portão.

O passo da cota chama `avaliarSaldo`, que devolve `pode: false` em **dois** casos
diferentes:

| Caso | `saldo.custo` |
|---|---|
| A — não cabe | número finito, `> restantes` |
| B — **não sei se cabe** | `Infinity` (custo não foi lido da tela) |

Hoje os dois retornam `desfecho: "parado"` **antes de escrever**. O comentário
que justifica essa ordem diz: *"Escrever uma proposta que não cabe na cota é
gastar IA para produzir algo que ninguém vai poder enviar."* Essa razão sustenta
o caso A. **Não sustenta o caso B** — "não sei" não é "não cabe".

Consequência medida: o custo em conexões **NÃO é público** no 99Freelas (zero
ocorrências de "conexão/conexões" nos dois fixtures reais em
`__tests__/fixtures/99freelas/`). Logo, todo projeto coletado publicamente cai
no caso B e **nenhuma proposta é escrita, jamais**.

## O que construir

### 1. Um desfecho novo em `agente.ts`
```ts
export type Desfecho =
  | "eliminado"
  | "parado"
  | "texto_pronto_envio_bloqueado"   // NOVO
  | "aguardando_clique_humano";
```

### 2. O caso B passa a seguir para a escrita
No passo da cota:
- `!saldo.pode` **e** `Number.isFinite(saldo.custo)` → continua **parando** antes
  de escrever, exatamente como hoje. **Sem mudança.**
- `!saldo.pode` **e** `!Number.isFinite(saldo.custo)` → **segue** para escrever,
  precificar, higienizar e passar pelo portão, exatamente como um projeto normal.

### 3. O desfecho final do caso B
Quando o fluxo do caso B chega ao fim **e o portão NÃO deu `BLOCK`**, o desfecho
é `"texto_pronto_envio_bloqueado"` — **nunca** `"aguardando_clique_humano"`.
- `texto` preenchido, `preco` preenchido, `nota` preenchida.
- `ofertaADigitar`: preenchido (o número existe; o que falta é o custo).
- `motivo` **precisa nomear o impedimento**: que o custo em conexões não foi lido
  da tela e que por isso o envio está bloqueado.
- Se o portão der `BLOCK`, continua `"parado"` como hoje — o portão manda.

### 4. A reserva de cota em `rodada()`
`rodada()` hoje faz `if (c.desfecho === "aguardando_clique_humano" && c.saldo)
gastasProjetadas += c.saldo.custo;`. **Não some `Infinity` na projeção.** O novo
desfecho **não reserva cota** — não há número para reservar. Garanta isso.

## As travas que NÃO podem afrouxar (é o ponto todo)
- ⛔ `"texto_pronto_envio_bloqueado"` **nunca** pode ser tratado como pronto para
  enviar por nenhum consumidor. Ele é um desfecho separado justamente para não
  se confundir com `"aguardando_clique_humano"`.
- ⛔ O caso A (cota realmente estourada) continua parando **antes** de gastar IA.
- ⛔ O portão de conformidade continua soberano.
- ⛔ Nada de envio, login, POST no 99Freelas, merge ou deploy.

## Definição de pronto
- Testes novos em `__tests__/marketplaces/custo-desconhecido.test.ts`, cada trava
  com as DUAS metades (barra o problema plantado E não inventa problema no caso
  limpo). No mínimo:
  1. custo `null` + cota folgada → desfecho `texto_pronto_envio_bloqueado`, com
     `texto` NÃO nulo e o motivo nomeando o custo não lido.
  2. custo `null` + portão dando `BLOCK` → desfecho `parado`, `texto` nulo.
  3. custo finito `> restantes` → continua `parado` **e `redigirProposta` NÃO foi
     chamado** (prove com um espião/contador, não por leitura).
  4. custo finito que cabe → continua `aguardando_clique_humano`, sem regressão.
  5. `rodada()` com um item de custo desconhecido → a projeção de cota **não**
     vira `Infinity` nem `NaN`.
- `npx tsc --noEmit` limpo — rode **depois** de escrever os testes.
- `npx vitest run __tests__/marketplaces/` verde (a suíte antiga de
  `99freelas.test.ts` inclusive — se algum teste antigo quebrar, **não o
  adapte sem dizer**: relate qual e por quê).

## O que NÃO fazer
- Não mexa em `conexoes.ts` / `avaliarSaldo` — a política `custo_desconhecido_vale:
  Infinity` está CERTA e é fail-closed. O conserto é em quem lê o resultado dela.
- Não mexa em `lib/marketplaces/99freelas/coleta.ts`,
  `gravar-candidatura.ts` nem em `scripts/coletar-99freelas.mts` — outra frente
  está escrevendo esses arquivos AGORA.
- Não commite. Deixe em disco e relate.
