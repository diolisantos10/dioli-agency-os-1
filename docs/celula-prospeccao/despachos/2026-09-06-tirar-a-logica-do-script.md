# FICHA — 06/09/2026 — a lógica sai de `scripts/`, vai para `lib/`

## O defeito, medido no portão que EU rodei (o subagente não consegue rodar)

```
$ npx tsc --noEmit
__tests__/marketplaces/chamador-carrega-env.test.ts(23,47): error TS5097:
  An import path can only end with a '.mts' extension when
  'allowImportingTsExtensions' is enabled.
__tests__/marketplaces/juiz-pela-cli.test.ts(20,38): error TS5097: (idem)
```

Tirar a extensão **não resolve** — troquei e virou:

```
error TS2307: Cannot find module '@/scripts/coletar-99freelas' or its
  corresponding type declarations.
```

## A causa-raiz, e por que ela é uma regra da casa e não um acidente
`tsconfig.json` tem `"exclude": ["node_modules", "scripts", "vitest.config.ts"]`.
**A pasta `scripts/` está FORA do programa do TypeScript.** Nenhum teste
consegue importar de lá, e é por isso que os testes existentes que precisam de
um script **leem o fonte como TEXTO** (`readFileSync`), como em
`__tests__/plataforma/links-do-portal-de-producao.test.ts:197`.

Ou seja: a casa já decidiu que **`scripts/` não hospeda lógica testável.**
Script é o chamador fino; a lógica mora em `lib/`. Os dois testes novos
tropeçaram nessa regra porque ninguém conseguiu rodar `tsc` para ela aparecer.

**Não ligue `allowImportingTsExtensions` e não tire `scripts` do `exclude`** —
seria mudar a configuração global da casa para acomodar dois testes.

## O que construir

### 1. `lib/marketplaces/99freelas/redator.ts` (novo)
Mova para cá, **sem reescrever a lógica**, o que hoje está em
`scripts/coletar-99freelas.mts`:
- `chamarClaudeCli` + o tipo `ExecutorDaCli`
- `primeiroObjetoJsonDaSaida`
- `promptDoJuiz`, `promptDoJuizParaCli`, `construirPortaDoJuiz`
- `promptDeSistemaDoRedator`, `envelopeDoProjeto`, `catalogoParaOPrompt`,
  `notaEmFaixa`, `lerRespostaDaCli`, `redigirViaIA`, `redigirViaCli`,
  `construirRedator`
- `recusarSeContadorNaoConfiavel`

Exporte o que os testes precisam. **Nada de mudança de comportamento nesta
ficha** — é mudança de endereço, não de regra. Em especial, continua valendo:
**parse que falha ou executor que falha = juiz INDISPONÍVEL, nunca aprovado.**

### 2. `scripts/coletar-99freelas.mts` fica fino
Mantém: `lerFlags`, `esperar`, `buscarHtml`, `resolverUrl`, `main`, a guarda
`executadoDireto`, e **`import "dotenv/config"` continua sendo o PRIMEIRO
import** (é o conserto de hoje — não o perca na mudança). Tudo o mais vem por
`import` de `lib/marketplaces/99freelas/redator.ts`.

### 3. Os dois testes passam a importar de `lib/`
- `__tests__/marketplaces/juiz-pela-cli.test.ts` → importa
  `construirPortaDoJuiz` de `@/lib/marketplaces/99freelas/redator`.
  **Os 4 casos obrigatórios continuam iguais** (reprova / aprova / lixo
  não-JSON ⇒ indisponível / timeout ⇒ indisponível).
- `__tests__/marketplaces/chamador-carrega-env.test.ts` → importa
  `recusarSeContadorNaoConfiavel` de `@/lib/marketplaces/99freelas/redator`.
  **As duas checagens estruturais sobre o fonte do script continuam** (que
  `dotenv/config` é o primeiro import e vem antes de `@/lib/db/client`) — elas
  já usam `readFileSync`, que é o padrão certo da casa para olhar `scripts/`.
  Acrescente uma terceira: que o script **não** voltou a declarar a lógica que
  saiu (ex.: o fonte não contém `function construirPortaDoJuiz`), para a
  duplicação não renascer em silêncio.

## Definição de pronto
- `npx tsc --noEmit` **limpo**. Este é o item que falhou da última vez: escreva
  os testes e **depois** rode o `tsc`, nunca antes.
- `npx vitest run __tests__/marketplaces/` inteiro verde.
- Se não conseguir executar `npx`/`node`, **diga com a mensagem exata de
  recusa** e liste o que precisa ser rodado. Quem despachou roda o portão.

## O que NÃO fazer
- ⛔ Não altere `tsconfig.json`.
- ⛔ Não mude comportamento: nem do juiz, nem do redator, nem da trava do
  contador. É mudança de endereço.
- ⛔ Não toque em `agente.ts`, `portao.ts`, `conexoes.ts`, `contador.ts`,
  `coleta.ts` nem `gravar-candidatura.ts`.
- ⛔ Nada de envio, login, merge, deploy ou migração. Não commite.
