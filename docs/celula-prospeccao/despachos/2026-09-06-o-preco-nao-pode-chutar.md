# FICHA — 06/09/2026 — o número que iria no campo "Sua oferta" está errado nos três

## O defeito, medido numa rodada REAL de hoje
Três propostas gravadas na fila do CEO, com estes `valorSugerido`:

| Projeto anunciado | `valorSugerido` | O que o cliente pediu |
|---|---|---|
| Roteiros para YouTube | **R$ 30** | roteiro de vídeo longo, trabalho recorrente |
| Edição para TikTok Shop | **R$ 350** | pacote mensal de **~400 vídeos** |
| Melhoria visual do quarto | **R$ 480** | (já resolvido por outra frente: agora é eliminado) |

`precificar()` cobra o **item do catálogo da casa** (uma peça, um vídeo), não o
**escopo do projeto anunciado**. No 99Freelas esse número vai para o campo
**"Sua oferta"** — e R$ 350 num projeto que pede 400 vídeos/mês lê como
**R$ 350 pelo pacote inteiro**.

Hoje isso está contido por acidente: o desfecho é
`texto_pronto_envio_bloqueado`, então a fila não oferece o clique. **No dia em
que o custo em conexões for lido da tela, o acidente acaba e o número sai.**

## O princípio que decide esta ficha
**Número errado com cara de cálculo é pior que número ausente.** O `precoDetalhe`
já é gravado justamente para a tela mostrar DE ONDE o número veio — "número sem
procedência é palpite com cara de cálculo", diz o schema. Um preço unitário
apresentado como preço de pacote é palpite com procedência falsa: o pior dos
dois mundos.

## O que construir

### 1. Detectar que o anúncio declara escopo maior que uma unidade
Em `lib/marketplaces/99freelas/` (arquivo novo, ex.: `escopo-declarado.ts`),
**determinístico, sem IA**:

```ts
export type EscopoDeclarado =
  | { tipo: "unitario" }
  | { tipo: "volume"; quantidade: number | null; porQue: string }
  | { tipo: "recorrente"; porQue: string };

export function lerEscopoDeclarado(texto: string): EscopoDeclarado;
```

Sinais a reconhecer no texto do anúncio: quantidade explícita ("400 vídeos",
"20 a 30 por dia", "100 por semana"), periodicidade ("mensal", "por mês",
"recorrente", "todo mês", "semanal"), pacote ("pacote", "lote").
**Ausência de sinal ⇒ `unitario`** — não invente volume que o cliente não
declarou.

### 2. `processarProjeto` recusa precificar quando o escopo excede o item
Em `agente.ts`, **depois** de precificar e **antes** de montar a candidatura:
se `lerEscopoDeclarado` disser `volume` ou `recorrente` e o preço tiver saído
de um item **unitário** do catálogo, o desfecho é **`"parado"`**, com motivo
que nomeia o conflito: o anúncio pede volume/recorrência e a casa só sabe
precificar a unidade, então **não há oferta a digitar**.

- `texto` volta a `null` nesse caso? **NÃO** — guarde o texto e o `preco` no
  retorno para o CEO poder ler o diagnóstico, mas **`ofertaADigitar` tem de ser
  `null`**. Nunca ofereça um número que a casa não sabe defender.
- **Não invente uma multiplicação** (`350 × 400`). A casa não tem tabela de
  desconto por volume; multiplicar seria inventar política comercial dentro de
  um módulo de preço. Se o CEO quiser preço de volume, é decisão dele.

### 3. `gravarCandidatura` acompanha
`valorSugerido` fica `null` quando `ofertaADigitar` é `null`. **Confira que o
`switch` exaustivo sobre `Desfecho` continua correto** — ele foi construído
hoje justamente para não deixar caso novo passar batido.

## Definição de pronto
- `__tests__/marketplaces/escopo-declarado.test.ts`, cada trava com as DUAS
  metades. Obrigatórios:
  1. o texto REAL do projeto do TikTok Shop (está em
     `__tests__/fixtures/99freelas/projeto-781493-2026-09-06.html` — extraia com
     `extrairProjeto`, não recopie à mão) ⇒ `volume`, e o desfecho vira
     `parado` com `ofertaADigitar: null`.
  2. um projeto unitário claro ⇒ `unitario`, e continua
     `aguardando_clique_humano` / `texto_pronto_envio_bloqueado` **com número**
     (a metade que prova que você não travou todo mundo).
  3. texto sem nenhum sinal de volume ⇒ `unitario` (não inventa volume).
  4. `gravarCandidatura` para o caso 1 ⇒ `valorSugerido` é `null`.
- `npx tsc --noEmit` limpo — **depois** de escrever os testes.
- `npx vitest run __tests__/marketplaces/` inteiro verde. **Se um teste antigo
  quebrar, NÃO adapte em silêncio: relate qual e por quê.**

## O que NÃO fazer
- ⛔ Não use IA na leitura do escopo. É trava de dinheiro.
- ⛔ Não invente multiplicação, desconto por volume ou tabela nova de preço.
- ⛔ Não toque em `preco.ts` (a tabela de piso está certa; o defeito é usá-la
  para responder uma pergunta que ela não responde), nem em `encaixe.ts`,
  `coleta.ts`, `redator.ts`, `portao.ts`, `conexoes.ts` ou nos componentes de
  tela — **outras frentes passaram por eles hoje.**
- ⛔ Nada de envio, login, merge, deploy ou migração. Não commite.
- Se não conseguir rodar `npx`/`node`, diga com a mensagem exata de recusa.
