# FICHA — 06/09/2026 — a fila do CEO mostra proposta bloqueada como se estivesse pronta

## O defeito
Rodada real de hoje gravou 3 `Oportunidade` com
`desfecho: "texto_pronto_envio_bloqueado"` — proposta escrita e aprovada pelo
portão, mas com **o envio bloqueado** porque o custo em conexões não foi lido
da tela (não é público no 99Freelas; medido).

O marcador está gravado e é legível por código: dentro de
`conformidadeAchados` há uma entrada
`{"regra":"envio_bloqueado_custo_desconhecido", "trecho":"...", "fonte":"..."}`
— a constante é `REGRA_ENVIO_BLOQUEADO_POR_CUSTO_DESCONHECIDO`, exportada de
`lib/marketplaces/99freelas/gravar-candidatura.ts`.

**Mas a tela não mostra.** `components/agency/comercial/CartaoDeOportunidade.tsx`
só renderiza `achados` no ramo `barrada` (`conformidade === "reprovada"`, isto
é `conformidadeOk === false`). Aqui `conformidadeOk` é `true` **de propósito e
com razão** — o portão de conformidade NÃO reprovou; o que falta é um número.

**Resultado hoje: o operador abre o cartão, vê uma proposta bonita, o botão de
copiar habilitado, e nada dizendo que o envio está bloqueado.** A régua desta
casa é "trava, não aviso", e isto hoje não é nem aviso.

## O que construir

### 1. A leitura do marcador, uma vez só
Uma função que responda "esta oportunidade tem envio bloqueado?" lendo
`conformidadeAchados`, **importando a constante** de
`gravar-candidatura.ts` — **nunca** repetindo a string `"envio_bloqueado_..."`
à mão na tela. Duas grafias da mesma regra é a próxima divergência silenciosa.
Coloque-a onde a tela e o contrato já leem (`contratoDeOportunidade.ts` é o
candidato natural — confira antes).

### 2. A tela
`CartaoDeOportunidade.tsx`:
- Estado visual **próprio**, distinto de "pronta" e de "barrada". Não reaproveite
  o vermelho de reprovação: **a conformidade não reprovou**, e dizer que
  reprovou seria a tela afirmar algo falso.
- Diz **o que falta e quem resolve**, em português de negócio: o custo em
  conexões não foi lido da tela do projeto, e alguém precisa ler antes de
  decidir enviar.
- **A ação de envio/cópia fica desabilitada** nesse estado, com o motivo ao
  lado do controle desabilitado (controle desabilitado sem motivo é o defeito
  que a casa já registrou em outras telas).
- Siga o `DESIGN.md`: token, nunca hex na mão; nenhum componente recriado.

### 3. Responsivo e auto-revisão — obrigatórios nesta casa
- Capture 375 / tablet / desktop com `node scripts/shot.mjs <rota> <nome>`.
- Auto-nota 0–10 em hierarquia, tipografia, espaçamento e consistência. **Só
  apresente com 8+ nos quatro**; abaixo disso, itere sozinho antes de mostrar.
- Mostre antes e depois.

## Como ver o dado de verdade (já existe no banco local)
Três linhas reais foram gravadas hoje, `status: "nova"`, todas com o marcador:
```
cmtpvf2b80000mz7d8ssk2rph · cmtpvf2bi0001mz7d2npufh8n · cmtpvf2bq0002mz7d9ksxeidq
```
Workspace `cmpyzf1nw0000nq7dz5ij66aa`. **Não invente dado de exemplo — use
esses.**

## Definição de pronto
- Teste de componente/contrato, cada trava com as DUAS metades:
  1. oportunidade COM o marcador ⇒ estado bloqueado, ação desabilitada.
  2. oportunidade SEM o marcador e `conformidadeOk: true` ⇒ **continua pronta,
     ação habilitada** (a metade que prova que você não travou todo mundo).
  3. `conformidadeOk: false` ⇒ continua no estado "barrada" de hoje, sem
     regressão.
  4. `conformidadeAchados` malformado (não é JSON) ⇒ **fail-closed: trata como
     bloqueado**, nunca como pronta. Um parse que falha não pode virar
     "liberado".
- `npx tsc --noEmit` limpo — **depois** de escrever os testes.
- Screenshots dos 3 tamanhos, de verdade (não "lidos").

## O que NÃO fazer
- ⛔ Não altere `conformidadeOk` para `false` só para colorir a tela. Seria a
  tela mentindo sobre o que o portão decidiu.
- ⛔ Não crie coluna nem migration.
- ⛔ Não toque em `agente.ts`, `preco.ts`, `encaixe.ts`, `coleta.ts` nem
  `redator.ts` — **três frentes estão nesses arquivos agora.**
- ⛔ Nada de envio, login, merge ou deploy. Não commite.
- Se não conseguir rodar `npx`/`node`/`shot.mjs`, diga com a mensagem exata de
  recusa e liste o que ficou por rodar.
