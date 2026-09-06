# FICHA — 06/09/2026 — dois defeitos MEDIDOS em `scripts/coletar-99freelas.mts`

O script foi RODADO de verdade hoje contra o 99Freelas ao vivo. Coletou 3
projetos reais e atravessou a esteira. Estes dois defeitos apareceram na
execução — não são revisão de código, são saída de terminal.

## DEFEITO 1 — o script não carrega o `.env`, e fala com um banco vazio em silêncio

### A prova
```
$ npx tsx -e 'import { conexoesGastasNoMes } from "@/lib/marketplaces/99freelas/contador"; ...'
{"gastas":240,"confiavel":false,"motivo":"NÃO CONSEGUI LER O CONTADOR
 (SQLITE_ERROR: no such table: main.ConexaoGasta). Fail closed..."}

$ npx tsx -e 'import "dotenv/config"; import { conexoesGastasNoMes } ...'
{"gastas":0,"confiavel":true,"motivo":"0 conexão(ões) gasta(s) em 2026-09."}
```

### A causa
`lib/db/client.ts` faz `process.env.DATABASE_URL ?? "file:./prisma/dev.db"`.
No Next o framework carrega o `.env`; **num script `tsx` avulso, ninguém
carrega.** Então `DATABASE_URL` fica indefinido, o cliente abre um SQLite vazio
em `prisma/dev.db`, a tabela `ConexaoGasta` não existe ali, e
`conexoesGastasNoMes` cai no `catch` fail-closed: **"o mês conta como
esgotado", 240 de 240 gastas.**

### Por que é grave e não cosmético
Hoje isso ficou escondido porque o custo em conexões é desconhecido e esse
caminho dispara antes. **No dia em que o custo for lido da tela, o script vai
recusar todo projeto por "cota estourada" contra um contador que leu o banco
errado** — e a mensagem vai dizer "cota estourada", não "li o banco errado".
Pior: com `--gravar`, `gravarCandidatura` escreveria `Oportunidade` nesse banco
fantasma, e a fila do CEO ficaria vazia sem ninguém entender por quê.

### O conserto
- `import "dotenv/config";` como **primeira** linha de import do script.
- **E uma trava, não só o import:** logo depois de ler as flags, o script
  confere `conexoesGastasNoMes(...).confiavel`. Se vier `false`, ele
  **para com mensagem clara** ("o contador de conexões não é confiável — o
  banco não respondeu; verifique `DATABASE_URL`") em vez de seguir e produzir
  números errados. Contador não confiável nunca deve virar decisão silenciosa.
- Teste em `__tests__/marketplaces/chamador-carrega-env.test.ts`, com as duas
  metades: (1) contador não confiável ⇒ o script recusa seguir; (2) contador
  confiável ⇒ segue normalmente. Extraia a decisão para uma função pura
  exportada (ex.: `recusarSeContadorNaoConfiavel(leitura)`) para o teste não
  precisar dar `spawn` no script inteiro.

## DEFEITO 2 — `--redator=cli` promete rodar sem chave de IA, e não roda

### A prova (saída da rodada de hoje, os 3 projetos, idêntica)
```
• [parado] Edição de vídeos curtos para TikTok Shop
  Nada foi escrito: Juiz editorial indisponível: o provedor do juiz lançou uma
  exceção (ou a chamada expirou): Nenhuma IA conectada. Conecte uma chave em Integrações.
```

### A causa
`--redator=cli` troca **só o redator** para `claude -p`. Mas
`construirPortaDoJuiz()` monta a porta **sempre** sobre `lib/ai/generate.ts`,
que exige chave. Como o juiz roda DENTRO de `redigirProposta`, a reprovação do
juiz vira `{ ok: false }` e a esteira para no passo 4. **Resultado: com
`--redator=cli` nada é escrito, nunca — que é exatamente o que a flag existe
para evitar.** Meia-ponte é ponte que não atravessa.

### O conserto
- `construirPortaDoJuiz(fonte: "ia" | "cli")`. Com `"cli"`, a porta chama
  `claude -p` pelo **mesmo mecanismo `spawn` já escrito no arquivo** (timeout,
  captura de stderr, código de saída) — **não escreva um segundo spawn**;
  extraia o que já existe para uma função reaproveitada pelas duas.
- O prompt do juiz continua **exatamente** o de `promptDoJuiz()`, lido de
  `docs/plataformas/99freelas/regras-editoriais.json`. **Não escreva um segundo
  prompt e não relaxe nenhuma das 8 categorias.**
- A saída do CLI precisa virar o mesmo objeto que `julgarTexto` espera
  (`aprovado`, `categorias`, `explicacao`). Peça JSON puro e faça o parse com
  `try/catch`: **parse que falha é juiz INDISPONÍVEL, nunca juiz que aprovou.**
  Essa é a trava mais importante desta ficha.
- O texto a julgar continua entre `MARCADOR_ABERTURA_DO_JUIZ` /
  `MARCADOR_FECHAMENTO_DO_JUIZ`, e o prompt continua dizendo que o que está
  entre marcadores é DADO, nunca ordem.
- Testes em `__tests__/marketplaces/juiz-pela-cli.test.ts`, cada um com as duas
  metades. Obrigatórios:
  1. CLI devolve JSON de reprovação ⇒ veredito reprova.
  2. CLI devolve JSON de aprovação ⇒ veredito aprova.
  3. **CLI devolve lixo que não é JSON ⇒ INDISPONÍVEL, nunca aprovado.**
  4. **CLI estoura o timeout ⇒ INDISPONÍVEL, nunca aprovado.**
  Injete o executor do CLI (não dê `spawn` de verdade no teste).

## O que NÃO fazer
- ⛔ Não mexa em `lib/marketplaces/99freelas/agente.ts`, `portao.ts`,
  `conexoes.ts` nem `contador.ts` — o fail-closed do contador está CERTO; o
  defeito é quem o chama sem `.env`.
- ⛔ Não relaxe nem duplique o juiz editorial nem a trava anti-genérico.
- ⛔ Nada de envio, login, POST no 99Freelas, merge, deploy ou migração.
- ⛔ Não commite.

## Definição de pronto
- `npx tsc --noEmit` limpo — rode **depois** de escrever os testes.
- Os dois arquivos de teste novos, verdes.
- Relate o que ficou em disco e o que NÃO conseguiu provar. Se não conseguir
  executar `npx`/`node`, **diga isso com a mensagem exata de recusa** — quem
  despachou roda o portão.
