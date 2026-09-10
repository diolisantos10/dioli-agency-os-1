# O quadro do CEO de 15/08, treze dias depois — o que ainda vale no PR #159

> **Medição, não conserto.** Nada foi mesclado, nada foi construído, o PR #159 e a
> branch dele (`claude/quadro-ceo-15-08`) **não foram tocados**. Este documento
> existe para o CEO decidir o que fazer com trabalho dele que está parado.
>
> Medido em **29/08/2026** contra o deploy `claude/dioli-agency-os-architecture-kk7kp`
> (`3794c245`), nunca contra o ancestral comum (`a9bd36c9`, de 15/08). A distinção
> é o ponto: `git diff <merge-base> <ref>` **não mostra** função que o deploy ganhou
> depois e que o PR antigo derrubaria.

| | |
|---|---|
| PR | **#159** — "Quadro do CEO 15/08: fonte única de preço, logo e régua de marca, e a fila que se cobra" |
| Autor | o próprio CEO (`diolisantos10`), branch `claude/quadro-ceo-15-08`, topo `6e240e86` |
| Idade | aberto **15/08/2026 21:12 UTC** — **13 dias** parado |
| Tamanho | 34 arquivos, +3.773 / −59 |
| Ancestral comum | `a9bd36c9` |
| O deploy andou quanto desde então | **1.049 arquivos** mexidos |
| Arquivos que os DOIS lados tocaram | **9** |
| Conflitos reais de merge | **3 arquivos · 7 hunks · 259 linhas** |

---

## 1. Item por item — os quatro do quadro

### Item 1 — Preço de fonte única

**O que #159 fez** (quatro coisas distintas, e elas envelheceram de forma
diferente):

1. `negociacao.ts` guardava uma **cópia** dos preços de plano e de balcão; passou
   a ler de `PLANOS` e `SELF_SERVE_CATALOG`, fail-closed (id ausente estoura na
   carga do módulo).
2. `negotiate-proposal.ts`: proposta renegociada podia cotar **"Total: R$ 0 a
   R$ 0 / mês"** ao cliente, e com `floor = 0` a guarda `newTotal >= floor` ficava
   vazia. Virou piso `Infinity` + nenhuma linha de preço quando não há escopo.
3. `recompra.ts`: o toque de 60 dias prometia **"R$ 297,00 por mês"** — a casa não
   tem cobrança recorrente. Virou compra única **e trava** (`prometeCobrancaRecorrente`).
4. `self-serve-catalog.ts` + `preco-uma-fonte-so.test.ts`: o portão de preço
   comparava **rótulo com rótulo**, e por isso não via "Pacote mês". Passaria a
   comparar **preço com preço**.

#### 1a. A cópia de preços — ✅ **o deploy já resolveu, e melhor**

```
$ grep -n "avulsoDoBalcao\|planosNegociaveis" lib/agency/comercial/negociacao.ts
228:  ...(avulsoDoBalcao("post", "balcao-post-feed", "Post único com arte e legenda",
230:  ...(avulsoDoBalcao("carrossel", "balcao-carrossel-5", "Carrossel",
232:  ...(avulsoDoBalcao("stories", "balcao-4-stories", "Sequência de stories",
236:  ...(avulsoDoBalcao("copy", "balcao-legenda", "Copy / legenda",
238:  ...(avulsoDoBalcao("auditoria", "balcao-auditoria-perfil", "Auditoria de perfil",
253:  ...(planosNegociaveis() as Record<"ritmo" | "presenca" | "conteudo", LinhaDaTabela>),
265:function avulsoDoBalcao(
292:function planosNegociaveis(): Record<string, LinhaDaTabela> {
```

O deploy chegou **na mesma conclusão, sozinho, em 26/08** — e foi além: criou
`lib/agency/financeiro/tabela-de-precos.ts` e o portão
`__tests__/comercial/a-tabela-e-uma-so.test.ts`, que prova a **derivação** e não a
coincidência ("nenhum CAMPO DE PREÇO é preenchido com número literal fora de
`planos.ts`"). O trabalho de #159 aqui foi refeito por outro caminho.

> **Veredito: descartar (já resolvido).** Vale para `negociacao.ts` (+70/−10) e
> para `__tests__/comercial/preco-do-sdr-vem-da-fonte.test.ts` (+239).

#### 1b. A cotação de R$ 0 — 🔴 **VIVA no deploy de hoje**

```
$ git diff --stat a9bd36c9 origin/claude/dioli-agency-os-architecture-kk7kp \
      -- lib/agency/execution/negotiate-proposal.ts
(vazio — INTOCADO em 13 dias)

$ grep -n "podeCotar\|Infinity" lib/agency/execution/negotiate-proposal.ts
(vazio)

$ sed -n '20,21p;51,54p' lib/agency/execution/negotiate-proposal.ts
  const est = computeEstimate(scope as Parameters<typeof computeEstimate>[0]);
  const floor = est.totalMin; // budget agent's floor — the SDR never goes below.
    : "• Escopo combinado no briefing";
  const priceLine = newTotal
    ? `Total (condição especial): ${money(newTotal)} / mês`
    : `Total: ${money(est.totalMin)} a ${money(est.totalMax)} / mês`;
```

O arquivo é **byte a byte o mesmo de 15/08**. O pedido de balcão continua gravando
`briefingJson` sem `scope`, `computeEstimate({})` continua devolvendo zero, e o
card continua podendo dizer *"Total: R$ 0 a R$ 0 / mês"* seguido de *"é só aprovar
aqui embaixo"*. E a linha `"• Escopo combinado no briefing"` continua **afirmando
algo que não aconteceu** — ausência de informação virando informação, que é a
regra número 1 desta casa.

> **Veredito: trazer.** Sem ajuste de lógica; só o número da faixa nos testes
> (ver §2c).

#### 1c. A promessa de mensalidade — 🔴 **VIVA, e sai sozinha por cron diário**

```
$ git diff --stat a9bd36c9 origin/claude/dioli-agency-os-architecture-kk7kp \
      -- lib/agency/esteira/recompra.ts
(vazio — INTOCADO em 13 dias)

$ grep -n "por mês" lib/agency/esteira/recompra.ts
257:      const valorPlano = plano.valor !== null ? ` (${plano.texto} por mês)` : "";
262:          `Existe o pacote do mês${valorPlano}: 8 peças por mês, você aprova pelo portal e publica quando quiser. `

$ head -1 app/api/cron/recompra/route.ts
// POST /api/cron/recompra — a régua de recompra roda sozinha (diária).
```

Nenhuma trava contra promessa de recorrência existe no deploy:

```
$ grep -n "mensal\|assinat\|recorren" lib/agency/comercial/promessa-que-a-maquina-nao-cumpre.ts
(vazio — a trava de promessa existente não cobre cobrança recorrente)
```

Agravante achado agora: o texto também continua dizendo **"8 peças por mês"**
quando o Ritmo passou a ter **12 peças** (correção de 27/08). A frase que sai ao
cliente por cron, sem revisão humana, está errada em **duas** dimensões — cadência
e volume.

> **Veredito: trazer.** É a trava mais barata e mais cara de não ter: texto falso
> saindo sozinho, em produção, ao cliente pagante.

#### 1d. O portão preço-vs-preço — 🟡 **ainda cego, e a colisão virou garantida**

```
$ grep -rn "COLISAO_DE_PRECO_COM_PLANO" --include=*.ts .
(vazio — não existe no deploy)

$ grep -n "s.label === plano.nome" __tests__/comercial/preco-uma-fonte-so.test.ts
123:        expect(SELF_SERVE_CATALOG.some((s) => s.label === plano.nome)).toBe(false);

$ sed -n '184,197p' lib/agency/self-serve-catalog.ts
    id: "balcao-pacote-mes",
    label: `Pacote mês — ${RITMO.pecasPorMes} peças`,
    ...
    price: RITMO.preco,
    precoMinimo: Math.round(RITMO.preco * 0.78),
```

O portão do deploy **continua comparando rótulo com rótulo** — exatamente o defeito
que #159 apontou. Mudou o mundo ao redor: o "Pacote mês" agora é **derivado de
`RITMO`**, então a colisão de preço com a mensalidade do plano deixou de ser
acidente e passou a ser **garantida por construção**. O portão cego não vê nem uma
nem outra.

Nota honesta: o especialista `esteira` argumentou que "o valor caiu, porque hoje a
colisão é por desenho". Discordo e registro a discordância — o valor do portão
nunca foi pegar *esta* colisão, e sim a **próxima**, a não declarada. Um portão
que compara rótulo continua sendo uma checagem que não protege nada, que é a
definição de decoração no manual desta casa.

> **Veredito: trazer com ajuste.** Trazer o portão preço-vs-preço
> (`preco-uma-fonte-so.test.ts`, +117 → aproveitável ~40 linhas do bloco novo).
> A **declaração de exceção** (`COLISAO_DE_PRECO_COM_PLANO`, +33 em
> `self-serve-catalog.ts`) precisa de reescrita: o motivo escrito por #159 fala em
> R$ 297 e em "8 peças", números que mudaram.

---

### Item 2 — O logo do cliente chega a quem produz

**O que #159 fez:** nada de código. Medido: o trecho de `contrato-de-marca.ts` que
lê `materiaisDeMarca` / `logo` é **idêntico** entre o PR e o deploy até a linha
199 — o arquivo entrou no PR porque o item 3 escreveu **abaixo** dele.

```
$ diff <(sed -n '1,199p' lib/agency/esteira/contrato-de-marca.ts) \
       <(sed -n '1,199p' .pr159/lib/agency/esteira/contrato-de-marca.ts)
40d39
< import { instrucaoGemea } from "@/lib/agency/execution/piso-de-verdade";
109,120c108,109
< (o deploy ganhou, em 24/08, a INSTRUÇÃO GÊMEA: cada "NUNCA" vem com o que fazer
<  no lugar. #159 não conhece isso.)
```

O ganho real de #159 aqui é **um teste**: `o-logo-chega-a-quem-produz.test.ts`
(+194), que prova ponta a ponta, sem mock, que o arquivo enviado chega a `artes.ts`.
As dependências dele (`lerMarca`, `logoDoCliente`, `LACUNA_DO_LOGO`,
`guardarArquivo`) existem no deploy com a mesma assinatura.

> **Veredito: descartar (já resolvido)** o código; **trazer** o teste sozinho.
> Risco zero — não toca produção — e ele fecha exatamente a junta "verde nas
> pontas, corrente rompida no meio" que esta casa já pagou caro.

> ⚠️ **E este item ensina o método:** copiar o arquivo de #159 por cima do deploy
> **apagaria a instrução gêmea de 24/08**. Portar por arquivo é regressão
> silenciosa; tem de ser por trecho. Isso pesa na escolha entre A e B (§3).

---

### Item 3 — A régua de marca chega a quem confere

**O que #159 fez:** `portaoDeMarca()` + `ehPecaDeMarca()` em
`contrato-de-marca.ts` (+103), chamados dentro de `escadaFiltraEntregas`
(`lib/agency/escada/registro.ts`, +30) — o único ponto por onde toda entrega vira
`visibility: "compartilhado"`. Peça de marca sem ficha constituída fica em
`retidos`. Ordem literal do CEO em 15/08: *"marca sem régua, peça não sai."*
Mais: `pacote-travado.ts` (+32/−4) passa a entregar a régua **ao árbitro**, não só
ao produtor.

**O deploy de hoje tem?** Não, nas duas metades.

```
$ grep -rn "portaoDeMarca\|ehPecaDeMarca\|MOTIVO_MARCA_NAO_CONSTITUIDA" \
      --include=*.ts --include=*.tsx .
(vazio)

$ grep -n "contratoDeMarca\|reguaDaMarca" lib/agency/esteira/pacote-travado.ts
(vazio)

$ sed -n '135,140p' lib/agency/esteira/pacote-travado.ts   # o que o ÁRBITRO recebe
  const contextoDaMarca = [
    `Negócio: ${negocio}`,
    req?.segment ? `Segmento: ${req.segment}` : "",
    listar(req?.services) ? `Serviços contratados: ${listar(req?.services)}` : "",
    listar(req?.objectives) ? `Objetivos: ${listar(req?.objectives)}` : "",
  ].filter(Boolean).join("\n");
                                    # ↑ zero proibição, zero voz, zero referência
$ grep -n "brandContext: contextoDaMarca" lib/agency/esteira/pacote-travado.ts
250:      brandContext: contextoDaMarca,
```

O buraco é o pior possível, e continua aberto: este é o caminho da peça que a
Qualidade **já reprovou uma vez**. O especialista refaz **com** as proibições na
mão (`lerProibicoes`, linha 129) e o árbitro julga a peça refeita **sem elas** —
podendo reaprovar exatamente o que o cliente proibiu, na segunda passada, com
aparência de peça auditada duas vezes.

> **Veredito: trazer com ajuste.** O portão vale integralmente. O ajuste é de
> integração, não de mérito: o deploy reescreveu `escadaFiltraEntregas` em 25/08
> para consultar `decisaoQueCobre` (decisão do dono libera cliente). As duas
> lógicas precisam **conviver** — o portão de marca depois da decisão do dono, sem
> que um vire porta dos fundos do outro. É o único conflito da categoria cara
> deste PR (§2b).

---

### Item 4 — A fila que se cobra

**O que #159 fez:** `cobranca-de-aprovacao.ts` (+247, transforma card parado em
aviso endereçado ao cliente), `prazo-de-aprovacao.ts` (+147, o prazo é o do
contrato, não um quinto horizonte), `link-do-portal-do-cliente.ts` (+126, o leitor
único do link), `canal-de-email.ts` (+146, segundo canal, nascendo desligado),
`aprovacao-parada.ts` (+18, ganha `clientId`/`titulo` — sem dono não há a quem
cobrar), `app/api/avisos/route.ts` (+22) e `FilaDeAvisos.tsx` (+114, os dois lados
do interruptor).

**O deploy tem?**

```
$ for f in cobranca-de-aprovacao prazo-de-aprovacao canal-de-email link-do-portal-do-cliente; do
    ls lib/agency/esteira/$f.ts; done
ls: cannot access 'lib/agency/esteira/cobranca-de-aprovacao.ts': No such file or directory
ls: cannot access 'lib/agency/esteira/prazo-de-aprovacao.ts': No such file or directory
ls: cannot access 'lib/agency/esteira/canal-de-email.ts': No such file or directory
ls: cannot access 'lib/agency/esteira/link-do-portal-do-cliente.ts': No such file or directory
```

E o motivo de existirem continua de pé, palavra por palavra:

```
$ grep -rn "aprovacoesParadas\|resumoDasAprovacoes" --include=*.ts --include=*.tsx .
./__tests__/esteira/aprovacao-parada.test.ts:  (14 ocorrências)
./lib/agency/esteira/aprovacao-parada.ts:      (3 — as próprias definições)
                       # ZERO chamadores em produção — igual a 12/08, igual a 15/08
$ grep -n "resumoDasAprovacoes\|esperando o cliente" app/api/avisos/route.ts components/agency/FilaDeAvisos.tsx
(vazio)
```

**Atenção para não confundir com `fila-que-se-cobra.ts`, que JÁ existe no deploy:**
ele é de **09/08**, é anterior ao PR, e faz outra coisa — reenviar *aviso que
falhou* e gritar o que só cadastro resolve. Ele não sabe nada sobre *cliente que
não aprovou*. Os dois são complementares, não substitutos.

**Uma parte de #159 envelheceu mal, e é preciso dizer:** o deploy construiu, em
27/08, um canal de e-mail **melhor** que o de #159 — `tentarEmail()` dentro de
`avisos.ts`, com moldes (`pecaProntaEmail`, `avisoDeAtrasoEmail`,
`linkDoPortalEmail`) e **prova de consentimento** (`provaParaEmail`), coisa que
`canal-de-email.ts` não tem.

```
$ grep -n "tentarEmail\|provaParaEmail\|consentimento" lib/agency/esteira/avisos.ts
122:async function tentarEmail(
160:    const { provaParaEmail } = await import("@/lib/agency/consentimento/quem-pode-receber");
166:    const consentimento = await provaParaEmail(workspaceId, email);
168:    const r = await sendEmail({ to: email, subject: montado.subject, html: montado.html, consentimento });
```

> **Veredito, quebrado por peça:**
> - `link-do-portal-do-cliente.ts` → **trazer**, sem ajuste. Conserta bug ativo
>   (§4, furo B) e não colide com nada novo.
> - `canal-de-email.ts` (+146) e seu teste (+156) → **descartar (já resolvido, e
>   melhor)**. Trazê-lo seria **regressão** — perderia a prova de consentimento.
> - `cobranca-de-aprovacao.ts` + `prazo-de-aprovacao.ts` + os campos de
>   `aprovacao-parada.ts` → **trazer com ajuste**: apontar para o leitor único do
>   link, e sair pelo `tentarEmail` do deploy, não por um segundo caminho de envio.
> - `app/api/avisos/route.ts` + `FilaDeAvisos.tsx` → **trazer**. É a primeira
>   porta que lê `resumoDasAprovacoes`, e ele continua sem nenhuma.
> - **Continua deliberadamente DESLIGADO do relógio** no próprio desenho de #159
>   (`despertador.ts` intocado). Ligar é ato do CEO — este veredito não muda isso.

---

## 2. O que exatamente apodreceu

Merge medido de verdade, numa worktree descartável (`/home/user/dd-quadro-descartavel`,
já removida), mesclando o **deploy dentro** do PR:

```
$ git merge --no-commit --no-ff origin/claude/dioli-agency-os-architecture-kk7kp
Auto-merging __tests__/comercial/preco-uma-fonte-so.test.ts
Auto-merging __tests__/esteira/passagem-do-pedido.test.ts
Auto-merging __tests__/qualidade/escada-de-exposicao.test.ts
Auto-merging lib/agency/comercial/negociacao.ts
CONFLICT (content): Merge conflict in lib/agency/comercial/negociacao.ts
Auto-merging lib/agency/escada/registro.ts
CONFLICT (content): Merge conflict in lib/agency/escada/registro.ts
Auto-merging lib/agency/esteira/avisos.ts
CONFLICT (content): Merge conflict in lib/agency/esteira/avisos.ts
Auto-merging lib/agency/esteira/contrato-de-marca.ts
Auto-merging lib/agency/esteira/pacote-travado.ts
Auto-merging lib/agency/self-serve-catalog.ts
Automatic merge failed
```

**9 arquivos tocados pelos dois lados · 3 com conflito · 7 hunks · 259 linhas.**

### (a) Conflito bobo — escolher um lado não perde nada

| arquivo | hunks | linhas | o que é |
|---|---:|---:|---|
| `lib/agency/esteira/avisos.ts` | 3 dos 4 | 32 | renomeação: #159 chama `saiu`/`motivo`, o deploy chama `enviou`/`porQueNao`. Mesmo comportamento, nome diferente. Fica o do deploy. |
| `lib/agency/comercial/negociacao.ts` | 2 | 139 | os dois lados eliminaram a cópia de preço, por caminhos diferentes. O do deploy é mais novo e mais completo (tem `tabela-de-precos.ts` atrás). **Fica o do deploy, inteiro.** |

### (b) Conflito caro — escolher um lado PERDE comportamento

**b.1 · `lib/agency/escada/registro.ts` — 1 hunk, 44 linhas.** Os dois lados
inseriram lógica **no mesmo ponto** de `escadaFiltraEntregas`.

- Ficar com o lado de **#159** perde: o cache de `decisaoQueCobre` do deploy —
  decisão do dono registrada deixa de liberar o cliente, e a régua da lista
  volta a valer para quem já foi dispensado dela. Perde também o fail-closed
  correspondente.
- Ficar com o lado do **deploy** perde: **o portão de marca inteiro** — o item 3
  do quadro do CEO evapora, e volta a valer "peça de marca sai sem régua".
- **Resolução correta: os dois.** Não é escolha, é união — decisão do dono
  primeiro, portão de marca depois, e um teste que prove que WIDE + decisão do
  dono **não** compram o direito de entregar sem régua (#159 já escreveu esse
  teste: `portao-de-marca-na-entrega.test.ts`, "o portão vence o degrau").

**b.2 · `lib/agency/esteira/avisos.ts`, 4º hunk — 44 linhas.** O `select` da
consulta de cliente.

- Lado de **#159**: `select: { phone: true, email: true }` + `canal-de-email.ts`
  como segundo canal, **desligado por flag**.
- Lado do **deploy**: `select: { phone: true, portalToken: true, name: true }` +
  `tentarEmail()` **ligado**, com prova de consentimento.
- Ficar com **#159** perde: o consentimento e os moldes de e-mail (regressão de
  LGPD, não de estilo).
- Ficar com o **deploy** perde: o conserto do link (o `portalToken` quebrado
  continua sendo lido — ver §4).
- **Resolução correta: base do deploy + o leitor único de #159.** O `select` passa
  a não pedir `portalToken`; o link vem de `link-do-portal-do-cliente.ts`.

### (c) O que a Diretoria mediu e o que a medição corrigiu

A premissa que chegou até mim era: *"mesclar como está derruba o `tsc` em nove
linhas"*. **A premissa está certa, mas só numa das resoluções — e é a errada.**

```
# resolvendo os 3 conflitos pelo lado do PR #159:
$ npx tsc --noEmit | grep -c "error TS"
10
  → 7 erros: 'formaDoPrecoNaFala', 'tetoDaFaixa', 'faixaEscolhidaNaFala' não
    existem em #159, e app/api/sdr/chat/route.ts (o robô de vendas NO AR),
    lib/agency/comercial/verba-declarada.ts e 5 testes as importam
  → 2 erros: 'crescimento' (plano que o deploy tirou da prateleira)
  → 1 erro: canal-de-email.ts sem 'consentimento'

# resolvendo os 3 conflitos pelo lado do DEPLOY:
$ npx tsc --noEmit | grep -c "error TS"
3
```

E a correção que importa: **as três funções sobrevivem ao merge automático.**

```
# no arquivo mesclado, com os marcadores de conflito ainda dentro:
formaDoPrecoNaFala   linha 823 → dentro de conflito? False
tetoDaFaixa          linha 864 → dentro de conflito? False
faixaEscolhidaNaFala linha 931 → dentro de conflito? False
```

Elas estão **fora** dos dois hunks conflitados. O `tsc` só cai se alguém resolver
com "pega tudo do #159" — que é o que ninguém deve fazer neste arquivo, porque
1a já está resolvido melhor no deploy. **O PR não está podre por causa disso.**

Os **3 erros restantes** (resolução pelo lado do deploy) são todos triviais:

| erro | conserto |
|---|---|
| `preco-do-sdr-vem-da-fonte.test.ts:63` e `:221` — `'crescimento'` não é `ItemNegociavel` | o arquivo inteiro é **descarte** (§1a) |
| `canal-de-email.ts:130` — falta `consentimento` em `SendEmailInput` | o arquivo inteiro é **descarte** (§1d/item 4) |

### (d) A prova que vale mais que o `tsc`: os testes de #159 contra o deploy

```
$ npx vitest run  (os 9 arquivos de teste novos de #159, sobre o merge resolvido
                   pelo lado do deploy nos 3 conflitos)
 Test Files  5 failed | 4 passed (9)
      Tests  11 failed | 110 passed (121)
```

**110 dos 121 testes de #159 passam contra o código de hoje.** As 11 falhas foram
todas rastreadas, e **nenhuma é apodrecimento de lógica**:

- **5** (`portao-de-marca-na-entrega`) falham porque a resolução escolhida
  **jogou fora o portão de marca**. É a categoria (b.1) se manifestando: prova de
  que o teste funciona, não de que o código está velho.
- **2** (`link-do-portal-do-cliente`) falham porque o conserto do link não entrou.
  Idem — categoria (b.2).
- **1** (`canal-de-email`) falha pelo arquivo que estamos descartando.
- **2** (`recompra`) falham por **preço**: o teste exige `R$ 297`, o código hoje
  diz `R$ 290`. O texto gerado provou que **a trava de #159 funciona**:
  > *"Existe o pacote do mês (R$ 290): pauta, 8 peças e calendário… É compra
  > única, para um mês de conteúdo — nada fica sendo cobrado depois."*
- **1** (`proposta-renegociada-nao-cota-zero`) falha porque o teste usa
  `newTotal: 900` contra o Plano Conteúdo, que era R$ 1.390 e hoje é R$ 790 —
  900 deixou de ser "dentro da faixa".

> **Conclusão da §2:** o que apodreceu em #159 são **números de preço dentro de
> testes** e **um arquivo de e-mail que o deploy refez melhor**. A lógica de
> negócio dos itens 2, 3 e 4 **não apodreceu** — o mundo em volta dela nem se
> moveu.

---

## 3. O caminho de resgate, com custo

### Opção A — trazer a base para dentro do PR (merge do deploy em `claude/quadro-ceo-15-08`)

**Medido, não estimado.** ⚠️ **Não foi executado** — a branch é do CEO.

| o que | número |
|---|---|
| arquivos com conflito | **3** |
| hunks a resolver | **7** |
| linhas dentro de marcador de conflito | **259** |
| dos quais, resolução mecânica (categoria a) | **5 hunks / 171 linhas** |
| dos quais, resolução que exige juízo (categoria b) | **2 hunks / 88 linhas** |
| erros de `tsc` depois da resolução barata | **3** — os 3 em arquivos que vão ser descartados de qualquer jeito |
| testes de #159 que já passam | **110 de 121** |
| testes a ajustar | **11**, sendo **3** por número de preço e **8** por conflito da categoria (b) |

### Opção B — portar só o que vale para uma branch nova a partir do deploy

| o que | número |
|---|---|
| arquivos a portar | **29** (13 de código, 16 de teste) |
| linhas a portar | **+2.745** (código +1.057 · teste +1.688) |
| arquivos a descartar | **4** — +611 linhas jogadas fora |
| documento do CEO a preservar | `docs/comercial/preco-lado-a-lado-15-08.md`, +417 |
| conflitos | zero **por construção** — e é exatamente isso que a torna perigosa |

> ⚠️ **"Zero conflito" aqui é uma armadilha medida, não um argumento.** No item 2
> eu mostrei o caso: `contrato-de-marca.ts` é idêntico nos dois lados até a linha
> 199, **exceto** pela instrução gêmea que o deploy ganhou em 24/08. Copiar o
> arquivo de #159 apagaria essa melhoria **sem um único marcador de conflito** —
> o git ficaria calado e o `tsc` também. A opção B precisa ser feita **por
> trecho, não por arquivo**, em 13 arquivos de código, à mão. Cada um deles é uma
> chance de a mesma armadilha fechar em silêncio.

### 👉 Recomendação: **A** — mas executada numa branch NOVA, não na do CEO

**O número na frente: 259 linhas com marcador de conflito (A) contra 2.745 linhas
portadas à mão (B) — 10,6 vezes menos trabalho.** E, das 259, só **88** exigem
juízo; o resto é mecânico.

Mais decisivo que o volume: em A o **git aponta** onde os dois lados discordam, e
tudo o que ele não apontou já veio integrado. Em B o silêncio do git não prova
nada, e as duas regressões que eu já achei medindo (a instrução gêmea de 24/08 e
a prova de consentimento de 27/08) são precisamente do tipo que B repete.

**A ressalva que torna a recomendação executável sem tocar em #159:** a opção A,
como descrita, escreve na branch do CEO. Não precisa. O mesmo custo se obtém
cortando uma branch **a partir de** `claude/quadro-ceo-15-08`, mesclando o deploy
**nela**, e abrindo um **PR novo**. #159 fica intacto, aberto, como registro do
que ele pediu; o PR novo é o que se mescla. Se o CEO preferir, #159 se fecha
depois **por decisão dele**, apontando para o sucessor.

> **Custo alto ou baixo não é motivo para descartar trabalho do CEO.** Os números
> acima estão aqui para ele decidir, não para eu decidir por ele. Registro que
> **nada** neste PR foi recomendado para descarte por ser trabalhoso — os quatro
> descartes (§1a, §1d-e-mail, e os dois testes correspondentes) são todos "o
> deploy já resolveu, e melhor", cada um com a busca colada.

---

## 4. Os furos que #159 declarou e ninguém fechou

Laudo do especialista `qualidade`, conferido pelo PM linha por linha contra o
deploy de hoje.

### 🔴 FURO A — entrega criada sem escada e sem portão. **VIVO.**

`app/api/messages/pedidos/route.ts`, linha **470** (o `create`) e linha **490**
(o `clientVisible: true`, na mesma chamada):

```ts
const entregavel = await prisma.deliverable.create({
  data: {
    projectId: projeto.id, name: titulo.slice(0, 200), type: "content",
    status: "in_review", content: conteudo.slice(0, 200_000),
    ownerAgentId: tarefa?.agentId ?? null,
    // O cliente PEDIU esta peça — segurar em "interno" seria recriar o
    // problema que estamos consertando: trabalho pronto que ele não vê.
    visibility: "compartilhado",
  },
  select: { id: true },
});
const card = await createApprovalRequest({ ..., clientVisible: true, ... });
```

```
$ grep -c "escada\|registrarDegrau\|quality-gate\|portao" app/api/messages/pedidos/route.ts
0
```

**Zero.** A peça nasce `visibility: "compartilhado"` e vira `ApprovalRequest` com
`clientVisible: true` **na mesma chamada** — direto na fila do cliente, sem passar
por `escadaFiltraEntregas` e sem portão de qualidade. É a **única** porta da casa
que produz peça visível ao cliente sem atravessar a escada.

Ressalva honesta, que não anula o furo: a rota é autenticada do lado da agência
(`session.name`), então o texto é colado por gente, não gerado pela máquina. O que
ela fura é a **escada de exposição** — o mecanismo que decide o que vira
`"compartilhado"` — e é justamente esse mecanismo que o portão de marca do item 3
usaria. **Furo aberto há 13 dias, declarado por escrito no dia 15, sem dono.**

### 🔴 FURO B — o link do portal é montado com a chave errada. **VIVO, e agora chega por e-mail também.**

```
$ sed -n '48,51p;186,189p' lib/agency/esteira/avisos.ts
/** O endereço do portal deste cliente — o link que resolve o aviso. */
function linkDoPortal(portalToken: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "").replace(/\/+$/, "");
  return `${base}/portal/access/${portalToken}`;
      select: { phone: true, portalToken: true, name: true },
    const link = cliente ? linkDoPortal(cliente.portalToken) : null;

$ sed -n '45,47p' lib/agency/persistence/portal-access-service.ts
export async function validatePortalAccess(token: string) {
  const record = await prisma.portalAccess.findUnique({ where: { token } });
  if (!record) return { valid: false, reason: "not_found" as const };

$ grep -n "portalToken" prisma/schema.prisma          # dentro de model Client
62:  portalToken String @unique @default(cuid())

$ grep -rn "portalToken" --include=*.ts app lib | grep -i "portalAccess"
(vazio — NADA copia Client.portalToken para PortalAccess.token. Nunca)
```

São **duas colunas de duas tabelas diferentes**, cada uma com o próprio
`@default(cuid())`, e **nada as sincroniza**. O link que sai é um cuid que
`validatePortalAccess` nunca encontra → `not_found` → acesso negado.

E o registro do nosso lado:

```
$ grep -n "status: enviou" lib/agency/esteira/avisos.ts
224:        status: enviou ? "enviado" : "pendente",
```

**O cliente vê "acesso negado"; a casa grava "enviado".** É o pior par possível:
o painel diz que ele foi avisado, e ele não foi.

**Piorou nos 13 dias.** Em 15/08 o furo só atingia o WhatsApp. Em 27/08 o deploy
ligou o e-mail como segundo canal — **sem flag** — e ele carrega o mesmo `link`:

```
$ sed -n '203,206p' lib/agency/esteira/avisos.ts
    const porEmail = tentativa.ok
      ? { ok: false as const, motivo: undefined }
      : await tentarEmail(pedido.workspaceId, pedido.clientId, pedido.tipo, textoCompleto, link, cliente?.name ?? null);
$ sed -n '155p' lib/agency/esteira/avisos.ts
      montado = linkDoPortalEmail(alvo);
```

Ou seja: **cliente sem WhatsApp agora recebe o link morto por e-mail**, num molde
bonito, com prova de consentimento — tudo certo, menos o link. E `avisarCliente`
não é código morto: é chamado por `esteira/marcos.ts:70`,
`esteira/fila-que-se-cobra.ts:124`, `v2-recovery/batida-da-v2.ts:85` e
`app/api/avisos/route.ts`.

### 🟡 Achado extra do `qualidade`, conferido e confirmado

Existem **duas funções `avisarCliente`** na casa, com o mesmo nome e comportamentos
diferentes: a de `esteira/avisos.ts` (monta link — quebrado) e a de
`esteira/triagem.ts:1424` (só escreve `portalMessage`, sem link). Quem for
consertar o furo B tem de saber das duas, ou vai fechar metade dos caminhos e
achar que fechou todos.

---

## O que precisa de decisão do CEO

1. **O resgate de #159**: autorizar a branch sucessora (opção A a partir da branch
   dele, PR novo, #159 intacto). Sem isso, os itens 3 e 4 continuam parados.
2. **Ligar ou não a fila que se cobra** no `despertador.ts`. #159 a construiu
   deliberadamente desligada. Ligar é ato dele.
3. **Preço** — este documento **não** reabre nada: nem qual lista vale, nem se o
   "Pacote mês" continua à venda, nem quanto custa identidade visual. As perguntas
   de 15/08 seguem em `docs/comercial/preco-lado-a-lado-15-08.md`, dentro do PR,
   e continuam sem resposta há 13 dias.
4. **Os dois furos vivos** (§4) não dependem de #159 para serem consertados. O
   furo B é o mais urgente da casa hoje: cliente pagante recebendo link que não
   abre, com "enviado" gravado do nosso lado, por dois canais.

---

## Como isto foi medido — para quem quiser refazer

```sh
git worktree add /home/user/dd-quadro -b claude/o-quadro-treze-dias-depois \
    origin/claude/dioli-agency-os-architecture-kk7kp
git worktree add --detach /home/user/dd-quadro-descartavel origin/claude/quadro-ceo-15-08
cd /home/user/dd-quadro-descartavel
git merge --no-commit --no-ff origin/claude/dioli-agency-os-architecture-kk7kp
git checkout --theirs lib/agency/comercial/negociacao.ts \
    lib/agency/escada/registro.ts lib/agency/esteira/avisos.ts
npx tsc --noEmit
npx vitest run __tests__/esteira/{cobranca-de-aprovacao,prazo-de-aprovacao,canal-de-email,\
link-do-portal-do-cliente,o-logo-chega-a-quem-produz,regua-de-marca-chega-a-quem-confere,\
portao-de-marca-na-entrega,recompra}.test.ts __tests__/comercial/proposta-renegociada-nao-cota-zero.test.ts
```

A worktree descartável foi **removida**; o merge **não foi empurrado** para lugar
nenhum. Especialistas despachados: `esteira` (o veredito dos 4 itens) e
`qualidade` (os 2 furos). As duas saídas foram conferidas pelo PM contra o
repositório — a divergência do PM com o `esteira` está registrada em §1d.
