# A fila inteira — o veredito dos 11 PRs que ninguém nunca julgou

> **Pedido:** Diretor, 29/08/2026. Três entregas: instalar a trava do clone raso,
> desfazer a ordem errada que estava no ar, e julgar os PRs abertos que ninguém
> nunca olhou.
> **Custo:** US$ 0,00 — nenhuma chamada de IA paga, nada em produção, nada irreversível.
> **Merges feitos: ZERO.** Nenhum PR fechado, nenhum PR comentado, nada empurrado
> na branch de deploy além da própria reivindicação desta frente.
> **Como foi feito:** o PM mediu merge e compilação (o portão é dele, por
> construção — o especialista não executa `npm`/`npx`/`node`); os vereditos de
> conteúdo foram despachados a **três especialistas em paralelo** (`plataforma`,
> `seguranca`, `esteira`) e **auditados** pelo PM. As correções de auditoria estão
> marcadas com 🔎 e assinadas.

---

## A resposta, antes de tudo

**Dos 11 PRs, três mesclam sem risco de conteúdo, dois são para fechar, e seis
exigem reconciliação humana.** Nenhum é órfão — todos os 11 têm ancestral comum
com a branch de deploy, o que enterra de vez a tese de 28/08.

E dois achados que ninguém tinha medido:

🔴 **#136 não é um protótipo inofensivo: ele MESCLA LIMPO e DERRUBA o `tsc`.**
Um erro de tipo dentro de `docs/prototipos/`, que o `tsconfig` desta casa
compila. Quem olhasse só o `git merge-tree` (exit 0, zero conflito) mesclaria e
deixaria o CI vermelho — e CI vermelho **para o deploy inteiro da casa**.

🔴 **#159 não quebra uma linha: quebra nove, e três delas derrubam a rota do SDR
que está no ar.** A versão de `lib/agency/comercial/negociacao.ts` que ele traz
**apaga três exports** dos quais o deploy de hoje depende
(`formaDoPrecoNaFala`, `tetoDaFaixa`, `faixaEscolhidaNaFala`), usados por
`app/api/sdr/chat/route.ts` e `lib/agency/comercial/verba-declarada.ts`. O
especialista tinha achado **um** erro; medido, são **nove**.

---

# A MEDIÇÃO DURA — merge e compilação, feitos de verdade

Método, para que qualquer um possa repetir: worktree limpo em
`origin/claude/dioli-agency-os-architecture-kk7kp`, `git merge --no-commit
--no-ff refs/prs/<N>`, e — quando o merge sai limpo — `npx tsc --noEmit`.

**Controle, sem o qual nada disto vale:** a branch de deploy sozinha compila
`exit 0`. Todo erro abaixo é causado pelo PR, não herdado.

| PR | Merge contra o deploy | `tsc --noEmit` | Leitura |
|---|---|---|---|
| **#136** | ✅ **limpo**, zero conflito | 🔴 **REPROVA — 1 erro** | `docs/prototipos/central-de-trabalho/app/page.tsx(95,66) TS2339` |
| **#152** | ✅ **limpo**, zero conflito | ✅ **PASSA** | compila contra o deploy de hoje |
| **#153** | 🔴 conflito em **15 arquivos** (11 de código/teste) | ⛔ **não determinado** | não há árvore mesclada para compilar |
| **#155** | ✅ **limpo**, zero conflito | ✅ **PASSA** | compila contra o deploy de hoje |
| **#156** | 🟡 conflito em **1 arquivo, e é `.md`** | ✅ **PASSA** (ver medição extra) | o código dele compila; o conflito é textual |
| **#157** | 🔴 conflito em `lib/agency/despertador.ts`, `lib/agency/pulso.ts` | ⛔ **não determinado** | conflito é de código |
| **#158** | 🔴 conflito em `prisma/schema.prisma`, `lib/generated/prisma/internal/class.ts`, `__tests__/plataforma/indices-do-despertador.test.ts`, `docs/decisoes.md` | ⛔ **não determinado** | conflito inclui schema de banco |
| **#159** | 🔴 conflito em `lib/agency/comercial/negociacao.ts`, `lib/agency/escada/registro.ts`, `lib/agency/esteira/avisos.ts` | 🔴 **REPROVA — 9 erros** (ver medição extra) | medido por sobreposição de arquivo |
| **#160** | 🔴 conflito em `app/api/self-serve/order/route.ts`, `lib/integrations/meta/notifications.ts` | ⛔ **não determinado** | conflito é de código |
| **#161** | 🔴 conflito em `app/api/v2/assistido/route.ts` | ⛔ **não determinado** | conflito é de código |
| **#162** | 🔴 conflito em `app/api/cron/v2/route.ts`, `app/api/v2/assistido/route.ts` | ⛔ **não determinado** | conflito é de código |

> **"Não determinado" é resposta, não desculpa.** Onde há conflito de código não
> existe árvore mesclada, e portanto não existe "compila ou não" — só existiria
> depois de alguém resolver o conflito, e aí estaríamos medindo a resolução, não
> o PR. Quem quiser esse número tem de reconciliar primeiro.

## Medição extra 1 — #156, com o único conflito (um `.md`) resolvido

```
git merge --no-commit --no-ff refs/prs/156   → conflito SÓ em docs/pendencias.md
git checkout --ours -- docs/pendencias.md    → resolvido pelo lado da base
npx tsc --noEmit                             → exit 0, 0 erros
```

**O código do #156 compila contra o deploy de hoje.** O único conflito dele é
posição de texto num diário append-only.

## Medição extra 2 — #159, o arquivo suspeito sobreposto ao deploy de hoje

Sobrepus **apenas** `lib/agency/comercial/negociacao.ts` do #159 sobre a árvore
do deploy e compilei. Não é o merge do PR — é a pergunta exata *"este arquivo
compila contra a casa de hoje?"*:

```
lib/agency/comercial/negociacao.ts(284,31): error TS2345:
  Argument of type '"crescimento"' is not assignable to parameter of type
  '"ritmo" | "presenca" | "conteudo" | "pulso"'.
app/api/sdr/chat/route.ts(47,29): error TS2305: no exported member 'faixaEscolhidaNaFala'
app/api/sdr/chat/route.ts(47,51): error TS2305: no exported member 'formaDoPrecoNaFala'
lib/agency/comercial/verba-declarada.ts(64,27): error TS2305: no exported member 'tetoDaFaixa'
  (+ 5 erros nos testes que importam os mesmos três símbolos)
```

**Nove erros.** O plano `"crescimento"` é só o primeiro. O grave é o resto: o
arquivo do PR **remove três funções que o deploy de hoje importa** — a rota do
SDR (`app/api/sdr/chat/route.ts`) para de compilar.

---

# 🔺 O QUE NINGUÉM TINHA MEDIDO: quatro destes PRs são UMA CADEIA, não quatro PRs

O campo "base" do GitHub não conta a história toda. Medido com
`git merge-base --is-ancestor`:

| Fato medido | Consequência |
|---|---|
| o topo do **#152** está dentro do **#155** | mesclar #155 entrega #152 junto |
| o topo do **#152** está dentro do **#156** | mesclar #156 entrega #152 junto — **mesmo o #156 declarando o deploy como base** |
| o topo do **#152** está dentro do **#157** | idem |
| o topo do **#155** está dentro do **#157** | mesclar #157 entrega #152 **e** #155 |
| o topo do **#161** está dentro do **#162** | mesclar #162 entrega #161 junto |

**Base declarada, lida direto da API do GitHub** — resolve o "não determinado"
que o especialista do lote A não conseguiu medir (o sandbox dele recusou `curl`
e `gh`):

```
#152  claude/rotinas-na-branch-viva      -> claude/dioli-agency-os-architecture-kk7kp
#155  claude/raio-x-vocabulario-v2       -> claude/rotinas-na-branch-viva      ⚠️ é o #152
#156  claude/consertos-do-cofre          -> claude/dioli-agency-os-architecture-kk7kp
#157  claude/freios-de-saida-bloco-e     -> claude/dioli-agency-os-architecture-kk7kp
#160  fix/base-de-link-dominio-oficial   -> claude/dioli-agency-os-architecture-kk7kp
#161  claude/recorte-de-workspace-no-piloto -> claude/dioli-agency-os-architecture-kk7kp
#162  claude/recorte-do-clientrequestid  -> claude/recorte-de-workspace-no-piloto ⚠️ é o #161
```

🔎 **Correção do PM ao lote A:** o especialista suspeitou que o #156 descendesse
do #152 e não conseguiu confirmar. **Confirmado: descende.** Mas a base
*declarada* dele **é** a branch de deploy (ao contrário do #155). Ou seja: o
#156 mescla direto no deploy **e leva o #152 embutido**. Isso não é problema —
os dois estão medidos como limpos —, mas quem mesclar #156 precisa saber que
está mesclando dois PRs, não um.

---

# A TABELA FINAL — os 11 vereditos

| PR | Base declarada | Veredito | Compila contra o deploy? | O que quebra ao mesclar · consequência declarada |
|---|---|---|---|---|
| **#136** | deploy | **MORTO** 🔎 | 🔴 **NÃO — 1 erro** | Merge é limpo, **e é aí que está a armadilha**: derruba o `tsc`, e CI vermelho para o deploy da casa inteira. O desenho dele **já está em produção** em `components/agency/central/CentralDeTrabalho.tsx`, que cita o PR no próprio cabeçalho. **Fechar.** Perde-se um protótipo estático sem nenhum importador. |
| **#152** | deploy | **SEGURO** | ✅ **SIM** | **Zero conflito.** Sem ele, duas rotinas noturnas seguem escrevendo numa branch morta com painel verde — inclusive a que sustenta o parecer da trava de plataforma. |
| **#153** | deploy | **DEPOIS DO CLIENTE** | ⛔ não determinado (15 conflitos) | Conflito real em `app/api/portal/approvals/route.ts` (10 commits concorrentes) e o PR **edita** `docs/pendencias.md` em vez de só anexar. 84 arquivos, a maioria não é segurança. 🔴 O furo que ele fecha continua vivo (ver "Furos vivos", 1). **Recomendação: extrair a parte de segurança em PR novo, sem esperar os 84 arquivos.** |
| **#155** | ⚠️ **branch do #152** | **SEGURO — condicionado** | ✅ **SIM** | Zero conflito, mas **é o #152 + ele**. Mesclar #155 sozinho no deploy funciona e entrega os dois. Sem ele, 28 dos 48 achados do raio-x continuam ruído. |
| **#156** | deploy (e **contém o #152**) | **SEGURO** | ✅ **SIM** (código; único conflito é `.md`) | Único conflito: `docs/pendencias.md`, textual. Traz o censo do cofre. Sem ele, a vitrine da plataforma continua recomendando **hoje** o gesto que causaria o dano (desligar `CREDENTIALS_SECRET`). |
| **#157** | deploy (e **contém #152 e #155**) | **DEPOIS DO CLIENTE** | ⛔ não determinado (2 conflitos de código) | `lib/agency/despertador.ts` (**32 commits concorrentes** da base) e `lib/agency/pulso.ts`: os dois lados mexem no mesmo objeto de retorno — reconciliar é **união de campos**, não escolha de lado, e um merge automático malfeito quebra o `tsc`. |
| **#158** | deploy | **PODRE pela metade** | ⛔ não determinado (4 conflitos, um é `prisma/schema.prisma`) | A metade "cliente único por nome" (`nameKey` + `@@unique` + upsert) **reabre o mecanismo que a base proibiu por escrito** um dia depois, em `4cbba4b7` (16/08: *"NOME NUNCA VIRA CHAVE"*, *"NUNCA upsert"*). A outra metade — **custo de IA vazando para a tela do cliente** — é bug real, vivo hoje e sem substituto. **Salvar essa metade por cópia; fechar o resto.** |
| **#159** | deploy | **PODRE** 🔎 | 🔴 **NÃO — 9 erros medidos** | Não é só o plano `"crescimento"` descontinuado: o `negociacao.ts` do PR **apaga três exports que o deploy importa hoje** e derruba `app/api/sdr/chat/route.ts`. Fechar como está. **Salvar por cópia** 3 correções vivas e sem substituto (link de aviso 403, proposta cotando R$ 0, portão de marca na escada), deixando `negociacao.ts` e `canal-de-email.ts` de fora. |
| **#160** | deploy | **DEPOIS DO CLIENTE** | ⛔ não determinado (2 conflitos de código) | `lib/integrations/meta/notifications.ts` disputa com a ordem do CEO de 16/08 (domínio oficial) — **quem reconciliar tem de preservar a ordem do CEO, não o fallback do Railway que o PR traz**. Sem o PR, webhook de pagamento e link de portal no WhatsApp continuam com fallback de string vazia. |
| **#161** | deploy | **DEPOIS DO CLIENTE** | ⛔ não determinado (1 conflito de código) | `app/api/v2/assistido/route.ts`: a base **endureceu a mesma função** que o PR reescreve (segredo em tempo constante + CSRF) — reconciliação é **união**, não escolha de lado. 🔴 Fecha 3 furos de vazamento entre agências vivos hoje. ⚠️ **Colide com a frente de posse que está rodando** — ver abaixo. |
| **#162** | ⚠️ **branch do #161** | **DEPOIS DO CLIENTE — reapontar antes de tudo** | ⛔ não determinado (2 conflitos de código) | Mesma armadilha do #168 em #383: **mesclá-lo como está não põe nada em produção**. Risco extra e sério: a base moveu a lógica de `app/api/cron/v2/route.ts` para `batida-da-v2.ts`; reconciliar sem saber disso pode **apagar em silêncio** o executor `mensagem_ao_cliente` (o aviso de atraso ao cliente). ⚠️ **Colide com a frente de posse.** |

**Resumo em números:** 3 SEGURO (#152, #155, #156) · 4 DEPOIS DO CLIENTE (#153,
#157, #160, #161, #162 — cinco, contando #162 que precisa ser reapontado antes) ·
1 MORTO (#136) · 2 PODRE (#158 pela metade, #159 inteiro).

---

# 🔎 AS CORREÇÕES DA AUDITORIA DO PM

**1. #136 — o veredito continua MORTO, mas o motivo para NÃO mesclar mudou.**
O especialista concluiu, com razão, que o protótipo já está em produção e que
fechar não perde código. O que ele não tinha como medir (o sandbox recusa `npx`):
**merge limpo, `tsc` vermelho.** Sem esta medição, alguém olharia `git merge-tree`
(exit 0), veria "só docs" e mesclaria — deixando o CI vermelho e o deploy da casa
parado. **Zero conflito não é sinônimo de seguro.**

**2. #159 — PODRE confirmado, e o dano é 9× o relatado.**
O especialista nomeou o defeito certo (`plano("crescimento")`). Medido por
sobreposição, são **nove** erros, e os oito restantes são piores: três exports
apagados que a rota viva do SDR importa. O método dele estava certo; o alcance da
medição estática é que é menor que o do compilador. É por isso que o portão é do PM.

**3. #156 e o encadeamento — o "não determinado" do lote A está resolvido.**
O especialista não conseguiu ler a base declarada (`curl` e `gh` recusados no
sandbox dele) e registrou isso honestamente em vez de chutar — que é o
comportamento certo. O PM leu a API: base declarada **é** o deploy, e a
ancestralidade **confirma** a suspeita dele de que o #156 carrega o #152.

**4. O que os três especialistas acertaram e eu confirmei com comando próprio:**
- `app/api/v2/assistido/route.ts:94` (base, hoje) faz mesmo
  `prisma.agencyWorkspace.findFirst({ orderBy: { createdAt: "asc" } })` ✅
- `app/api/v2/assistido/route.ts:127` faz mesmo
  `prisma.client.findUnique({ where: { id: clienteId } })` **sem `workspaceId`** ✅
- `app/api/v2/retomar/route.ts` aceita mesmo `correlationId` do corpo e busca
  `where: { correlationId, status: {...} }` **sem filtro de posse** ✅
- o `reviewNote` do card `clientVisible: true` carrega mesmo o custo em dólar por
  passo (`$0.0000`) — o cliente vê o que a agência pagou ✅
- o `negociacao.ts` do #159 declara mesmo `id: "crescimento"` e a base declara
  mesmo `id: "pulso" | "ritmo" | "presenca" | "conteudo"` ✅

---

# 🔴 FUROS VIVOS NA BASE HOJE — nomeados, NÃO consertados

Todos com conserto **já escrito e parado dentro de um PR**. Isto é dinheiro e
risco parados, não dívida de organização.

| # | Onde, hoje | O que permite | Conserto pronto em |
|---|---|---|---|
| 1 | `app/api/messages/conversa.ts:58-65` | `montarFiltro` monta `OR: [{clientId}, {clientRequestId: {in: […]}}]`; quando uma solicitação de briefing já trocou de dono e a mensagem antiga não tem `clientId` carimbado, a conversa vaza **lateralmente** entre clientes. Explorável com token de portal do **próprio** cliente. | **#153** |
| 2 | `app/api/v2/assistido/route.ts:94` (`ligar`) | opera sempre sobre a agência **mais antiga do banco**, nunca a de quem está logado | **#161** |
| 3 | `app/api/v2/assistido/route.ts:127` (`ciclo`) | `findUnique({ where: { id: clienteId } })` sem `workspaceId`: sessão de `direcao` de qualquer agência roda a cadeia paga de IA sobre cliente alheio e termina em `createApprovalRequest({ clientVisible: true })` — card no **portal do cliente de outra agência** | **#161** |
| 4 | `app/api/v2/retomar/route.ts` | aceita `correlationId` do corpo **sem checagem de posse**, e a base já liga executor com consequência externa: qualquer PM/Diretor de uma agência reativa o reenvio de aviso a cliente de **outra** | **#161** |
| 5 | `app/api/v2/assistido/route.ts:218-226` → `AprovacoesDoCliente.tsx` | o `reviewNote` do card visível ao cliente carrega o **custo em dólar de cada passo de IA**: o cliente lê o que a agência pagou | **#158** (metade salvável) |
| 6 | link de aviso ao cliente devolve **403** | todo aviso automático (WhatsApp, e o e-mail que a base criou depois) carrega link de portal que não abre | **#159** (metade salvável) |
| 7 | proposta renegociada pode cotar **R$ 0** ao cliente, sem escopo | — | **#159** (metade salvável) |
| 8 | a escada libera peça ao portal **sem checar marca constituída** | — | **#159** (metade salvável) |

---

# ⚠️ COLISÃO COM A FRENTE DE POSSE QUE ESTÁ RODANDO AGORA

**#161 e #162 falam de `clientId` vindo do corpo — o mesmo assunto de uma frente
viva nesta hora.** Por ordem do Diretor, os dois foram **julgados e NÃO tocados**:
nenhum conserto, nenhuma escrita em `lib/agency/`, `app/api/v2/`,
`__tests__/seguranca/` ou `__tests__/v2/`.

- **Colisão de arquivo: nenhuma.** O que a frente de posse reivindicou
  (`lib/agency/esteira/reprovacao.ts`) é outro fluxo.
- **Colisão de responsabilidade: SIM, e é a que importa.** As duas frentes
  convergem, sem coordenação, para a mesma política de posse
  (`lib/auth/posse-de-workspace.ts`). **Foi exatamente assim que a regra da verba
  declarada virou dois módulos em 16/08**: nomes de arquivo diferentes, a mesma
  pergunta respondida duas vezes.
- **Recomendação ao Diretor:** cruzar `docs/diagnosticos/varredura-de-posse-no-corpo-29-08.md`
  com este documento **antes** de despachar qualquer reconciliação de #161/#162.

---

# O QUE EXIGE DECISÃO DO DIRETOR

1. **Ordem de merge da cadeia #152 → #155/#156 → #157.** Não são quatro PRs
   independentes. O caminho de menor risco medido: **#156 sozinho** (leva #152
   embutido, código compila, único conflito é um `.md`).
2. **Fechar #136** — e a razão a registrar não é "é só protótipo", é **"mescla
   limpo e derruba o CI"**.
3. **Fechar #159 e a metade ruim do #158**, autorizando **dois PRs novos** só com
   as partes salváveis (listadas acima). Nenhuma delas passa por `negociacao.ts`.
4. **Reapontar o #162 para a branch de deploy** antes de qualquer reconciliação —
   hoje mesclá-lo não põe nada em produção.
5. **Os 8 furos vivos.** Quatro deles (2, 3, 4, 5) permitem alcançar cliente de
   outra agência ou expor número interno ao cliente, e **todos têm conserto pronto
   e parado**.
6. **#160:** quem reconciliar precisa preservar a ordem do CEO de 16/08 (domínio
   oficial), **não** o fallback do Railway que o PR carrega.

---

# O QUE ESTE DOCUMENTO NÃO DETERMINOU

- **`tsc` de 8 dos 11 PRs.** Onde há conflito de código não existe árvore mesclada
  para compilar. O número só existe depois de alguém reconciliar — e aí mede a
  reconciliação, não o PR. **Não determinado, com o motivo escrito.**
- **9 dos 15 conflitos mecânicos do #153** não foram abertos linha a linha, e
  ~64 dos 84 arquivos dele não tiveram existência-na-base conferida. O que é de
  segurança foi coberto; o resto está declarado.
- **Se `NEXT_PUBLIC_APP_URL` está configurada na produção de hoje** (#160) — não
  medido; exige ler o ambiente de produção, o que esta rodada não fez.
- **#10, #324, #325, #328 e #379–#383 não foram julgados**, por ordem da ficha
  (canal dos diretores, rascunhos, e os PRs recentes do próprio Diretor).
- **Os comandos que o sandbox dos especialistas recusou** — `npx tsc`,
  `git merge-tree`, `gh pr view`, `curl` — estão registrados nos documentos de
  lote com a recusa colada. Onde isso os cegou, **o PM mediu e o resultado está
  na seção "A MEDIÇÃO DURA"**.

---

# Os documentos de lote, na íntegra

Abaixo, o trabalho dos três especialistas como eles entregaram, sem edição. As
correções do PM estão na seção "🔎 AS CORREÇÕES DA AUDITORIA DO PM", acima —
não foram aplicadas por cima do texto deles, para que a divergência fique legível.


---

# LOTE A — #152, #155, #156, #157, #160 · despachado ao especialista `plataforma`

## Lote A — veredito dos PRs #152, #155, #156, #157, #160

> Despacho: PM → `plataforma`. Método: `.fichas/como-julgar.md`. Precedente:
> `.fichas/forense-383.md`. Base de deploy =
> `origin/claude/dioli-agency-os-architecture-kk7kp`.
> **Merges feitos: ZERO. PRs fechados: ZERO. Comentários em PR: ZERO.**
> `git merge-tree`, `gh pr view` e `curl` para a API do GitHub foram recusados
> pelo sandbox (mensagem exata: `This command requires approval`) — colado onde
> ocorreu. Toda a análise de conflito abaixo foi feita por `git diff`/`git
> show`/`git log`/`git rev-list --count` comparando merge-base → PR e
> merge-base → base, que é o método alternativo que a própria ficha ensina.

## Achado estrutural que vale para os cinco antes de julgar cada um

Os cinco PRs deste lote **não são independentes entre si** — formam uma cadeia:

```
a9bd36c9 (deploy, 15/08)
  └─ 51e784cf  #152 "rotinas voltam a pousar na branch viva"
       ├─ 40a16201  #155 "raio-x conhece vocabulário V2"
       │     └─ 8eda8825…  #157 "freios de saída + terceira porta"
       └─ e3f83463  #156 "cofre seguro + censo"
```

Confirmado por `git merge-base` e `git log --oneline` (colado nas seções de
cada PR): o commit de #152 (`51e784cf`) é **ancestral direto** do head de #155,
de #156 e (via #155) de #157. Ou seja: #155, #156 e #157 **não existem sem
#152** — o próprio conteúdo deles já inclui o commit de #152.

Isso confirma a pista da ficha para #155 ("empilhado sobre o #152") e **estende
a mesma pista para #156**, que a ficha não sinalizou. A tabela "head → base
declarada" da ficha diz que a base de #156 e #157 é a branch de deploy
(diferente de #155, cuja base declarada é a própria branch do #152) — **não
consegui confirmar esse campo via API** (`gh pr view` e `curl
api.github.com` foram os dois recusados pelo sandbox; a recusa exata está
colada na seção "O que eu NÃO determinei"). O que meço e confirmo é a
estrutura de commits acima, que é consistente com a tabela da ficha: um PR
pode ter sido aberto contra `deploy` mesmo com o head descendendo de outro PR
— nesse caso, mesclá-lo no GitHub traria os commits do PR de baixo **junto**,
porque eles já estão na ancestralidade do head.

**Consequência prática, para os cinco:** julgar #155, #156 e #157 "contra o
deploy" (como fazem os `fato-*.txt`) mede corretamente **o que aparece na tela
de comparação do GitHub**, mas para entender **o que cada PR adiciona por
cima do anterior** eu medi também `git diff <PR-de-baixo>..<PR-de-cima>` — é
essa segunda medida que decide se há trabalho duplicado ou genuinamente novo.

---

## PR #152 — "As rotinas noturnas voltam a pousar na branch viva"

**O que o PR faz, em uma frase de negócio:** conserta os dois workflows
noturnos (raio-x e captura da biblioteca de plataformas) para que parem de
escrever numa branch morta e fixa — hoje eles rodam "verdes" havia dias sem
que ninguém leia o resultado — e planta um teste que reprova qualquer rotina
futura que volte a apontar para um nome de branch escrito à mão.

**Base declarada:** `claude/rotinas-na-branch-viva` → deploy (direto).
Confirmado: `git merge-base refs/prs/152 origin/...` = `a9bd36c9`, e o PR tem
exatamente **1 commit** acima desse ponto (`51e784cf`) — bate com "direto na
deploy", sem PR intermediário.

**Compila contra o deploy de hoje?** Sim, até onde dá para determinar
estaticamente. O PR só toca: 2 arquivos `.yml` (não passam por `tsc`), um
teste novo autocontido (só usa `node:fs`, `node:path` e `vitest` — sem
importar nada da árvore `lib/`/`app/` da casa, então não tem como quebrar por
mudança de assinatura em outro módulo) e arquivos de documentação/dados
(`docs/raio-x/**`, todos `.md`/`.json`). Não há nenhum símbolo de `lib/` ou
`app/` sendo importado ou chamado por este PR. Colei o arquivo de teste
inteiro e confirmei que ele só lê `.github/workflows/*.yml` do disco — não
tem acoplamento com o resto da árvore.

**O que quebra ao mesclar:** nada. `git merge-tree` do PM (fato-152.txt) deu
`exit=0`. Não determinei um segundo caminho de conflito que a ficha não
tivesse já medido.

**O que o PR traz que a base ainda não tem:**
- `.github/workflows/raio-x-noturno.yml` e `biblioteca-diaria.yml`: a base
  **ainda tem o defeito hoje**. Confirmado lendo os dois arquivos na base —
  ambos ainda fazem `ref: claude/dioli-pm-role-pow56e` no checkout e
  `git push origin HEAD:claude/dioli-pm-role-pow56e` no commit de volta,
  linha por linha idêntico ao que o PR descreve como o bug. Não é dívida
  antiga resolvida por outro caminho: é bug vivo, hoje, nos dois workflows
  agendados desta casa.
- `__tests__/rotinas/rotina-nao-aponta-para-branch-fixa.test.ts`: não existe
  na base (`git cat-file -e` → *does not exist*). É trava, não aviso — reprova
  qualquer `.yml` futuro que volte a escrever `ref:`/`push origin
  HEAD:`/`pull --rebase origin` com nome literal. Testei mentalmente contra o
  terceiro workflow da casa que também faz `git push`
  (`kit-espelho.yml`) e ele **não teria falso positivo**: faz só `git push`
  sem argumento de branch, então o regex do teste não o pega.
- `docs/raio-x/coletas/2026-08-08..15-*.json` e a seção nova de
  `docs/raio-x/README.md`: não existem na base. É a recuperação da leitura de
  produção que a rotina quebrada não gravou onde alguém olha.

**O que já foi resolvido melhor na base:** nada — zero commits da base tocam
qualquer um dos arquivos que este PR modifica desde `a9bd36c9` (medido com
`git log --oneline a9bd36c9..deploy -- <arquivo>` para os 3 arquivos de código
relevantes: vazio nos três).

**Um ponto que não bate com a própria narrativa do PR, sem afetar o
veredito:** o `README.md` do PR diz que os `*-codigo.json` de 08 a 14/08 foram
descartados por descreverem código morto, mas o diff inclui
`docs/raio-x/coletas/2026-08-15-codigo.json` (452 linhas, 22.712 bytes — não é
o arquivo-fantasma de 9.745 bytes que o texto descreve). Não é defeito
funcional (é só um dado histórico a mais), mas registro para quem for ler o
PR: a tabela do README não descreve 100% do que o diff faz.

**Recomendação: SEGURO.** Zero conflito, conteúdo genuinamente novo, bug que
ele conserta está confirmadamente vivo na base hoje, teste autocontido sem
risco de quebrar outro módulo.

**Consequência declarada de fechar:** as duas rotinas noturnas continuam
escrevendo numa branch morta, com o painel do GitHub Actions mostrando verde
todos os dias — inclusive `biblioteca-diaria.yml`, que é a fonte que sustenta
o parecer da trava de plataforma (`meta`/`google`/`tiktok`).

---

## PR #155 — "Raio-x: a varredura passa a conhecer o vocabulário da V2"

**O que o PR faz, em uma frase de negócio:** ensina o raio-x noturno a
reconhecer os padrões de guarda de acesso e de veredito que a casa criou
DEPOIS de o raio-x ter sido escrito — sem isso, o relatório de segurança que o
CEO lê de manhã teria 28 de 48 achados como ruído (rotas já protegidas
acusadas de abertas, vereditos por união discriminada lidos como "promessa
não cumprida"), e "relatório com ruído ensina a não ler o relatório".

**Base declarada:** ⚠️ segundo a ficha, **não é a branch de deploy — é a
branch do #152** (`claude/rotinas-na-branch-viva`). Confirmei
estruturalmente: `git merge-base origin/claude/rotinas-na-branch-viva
origin/claude/raio-x-vocabulario-v2` devolve exatamente `51e784cf`, o commit
de ponta do #152 — ou seja, o head de #155 nasce literalmente em cima do head
do #152, sem nenhum commit da deploy entre os dois. Não consegui confirmar o
campo "base" da API do GitHub diretamente (`gh pr view`/`curl` recusados —
ver "O que eu NÃO determinei"), mas a estrutura de commits é exatamente a que
a pista da ficha descreve.

**O que #155 entrega CONTRA A PRÓPRIA BASE (o #152), não contra o deploy**
(pedido explícito da ficha, para não repetir o erro do #163 em #383):

```
git diff --stat refs/prs/152..refs/prs/155
 __tests__/raio-x/calibracao-vocabulario-v2.test.ts | 419 ++++++++++++
 __tests__/raio-x/varreduras.test.ts                |  28 +-
 docs/raio-x/README.md                              |  84 ++++
 lib/raio-x/varreduras/id-sem-dono.ts               |  45 ++-
 lib/raio-x/varreduras/porta-aberta.ts              |  49 +++
 lib/raio-x/varreduras/promessa-nao-cumprida.ts     | 213 +++++++--
 6 files changed, 798 insertions(+), 40 deletions(-)
```

**Não é vazio, como foi o caso do #163 em #383.** É trabalho real: ensina o
scanner `porta-aberta.ts` a reconhecer `exigirApiInterna`/`exigirCapacidade`/
`exigirAdministracao` como guarda **só quando o `.erro` delas é de fato
devolvido** (li o trecho inteiro — a metade que evita que isso vire
afrouxamento é justamente essa: guarda chamada e ignorada vira um achado NOVO,
"alto", pior do que não ter guarda nenhuma).

**Compila contra o deploy de hoje?** Sim, até onde determinei. `porta-aberta.ts`,
`id-sem-dono.ts` e `promessa-nao-cumprida.ts` **já existem na base** (não são
arquivos novos) e o PR só adiciona regex e branches de lógica nova — não
altera assinatura de função exportada nenhuma que eu tenha achado (as
assinaturas de `varrerPortaAberta`, etc., continuam recebendo `Arquivo[]` e
devolvendo `ResultadoDeVarredura`, e não achei chamador dessas funções fora
do próprio `lib/raio-x/` e dos testes). O import
`lib/agency/organizacao/guarda.ts` que o novo teste do PR referencia em texto
de exemplo (não como `import` real — é regex sobre string) existe na base com
os quatro exports (`exigirApiInterna`, `exigirCapacidade`,
`exigirAdministracao`, `exigirAcessoInterno`) confirmados por `git show`.

**O que quebra ao mesclar:** nada, medido dos dois lados. `git log --oneline
a9bd36c9..deploy` para `porta-aberta.ts`, `id-sem-dono.ts`,
`promessa-nao-cumprida.ts` e `docs/raio-x/README.md` devolve **zero** commits
da base em cada um — a base nunca tocou esses arquivos desde 15/08. Bate com
o `merge-tree exit=0` que a ficha já tinha medido contra o deploy.

**O que já foi resolvido melhor na base:** nada — mesma medição acima.

**Recomendação: SEGURO — mas apenas em sequência com #152, nunca sozinho.**
O conteúdo é limpo, testado (a própria descrição do PR se orgulha das "duas
metades": prova que acha o problema plantado e prova que não acusa o caso
limpo) e sem conflito de nenhum lado. **O que separa isto de "mesclar agora"
é só ordem:** enquanto #152 não estiver na branch de deploy (seja porque foi
mesclado, seja porque #155 for reapontado diretamente para a deploy), clicar
"mesclar" em #155 no GitHub não bota nada na deploy — é exatamente o
mecanismo que fez o #163 parecer resolvido em #383 e não estar.

**Consequência declarada:** se #152 for mesclado primeiro, mesclar #155 na
sequência é de baixo risco e fecha os 28 alarmes falsos do raio-x. Se #152
NÃO for mesclado, #155 fica sem efeito nenhum sobre o que roda em produção,
não importa o veredito que se dê a ele isoladamente.

---

## PR #156 — "O cofre está seguro; o que faltava era instrumento (e a vitrine mentia)"

**O que o PR faz, em uma frase de negócio:** cria o "censo do cofre" — uma
tela/rota que conta quantos tokens de conexão (Meta) nenhuma chave de
criptografia da casa consegue abrir — e conserta um registro que estava
**mentindo havia nove dias** (`docs/agents/plataforma/vitrine.md` dizia para
não ligar a variável `CREDENTIALS_SECRET` em produção "de propósito", quando
ela já estava ligada e segura desde 06/08). Sem isso, uma leitura apressada
daquele registro levaria alguém a **desligar** a variável — o único gesto
capaz de causar o dano que o texto descrevia.

**Base declarada:** segundo a ficha, `claude/consertos-do-cofre` → deploy
(direto) — **mas medi algo que a ficha não sinalizou nesta pista**: o head de
#156 também descende diretamente do commit de #152. `git merge-base
origin/claude/rotinas-na-branch-viva origin/claude/consertos-do-cofre` →
`51e784cf` (o commit de #152), igual ao que medi para #155. Ou seja: **#155 e
#156 são dois ramos irmãos, ambos crescendo direto do #152**, não uma cadeia
#152→#155→#156. Não consegui confirmar via API se o campo "base" real do
GitHub para #156 é a deploy ou a branch do #152 (mesma recusa de `gh`/`curl`).
Se for a deploy — como a ficha diz — mesclar #156 traz o #152 junto (porque o
commit dele já está na ancestralidade do head), o que na prática **resolve
sozinho** a dependência de ordem que #155 tem.

**O que #156 entrega contra a própria base (o #152):**

```
git diff --stat refs/prs/152..refs/prs/156
 __tests__/... (5 arquivos de teste novos/alterados)
 app/api/admin/censo-do-cofre/route.ts              |  65 +++
 docs/agents/plataforma/oficina.md                  |  45 ++
 docs/agents/plataforma/vitrine.md                  |  59 ++-
 docs/pendencias.md                                 | 159 ++
 lib/agency/esteira/prontidao-de-publicacao.ts      |  26 +-
 lib/integrations/meta/connections.ts               |  99 +++-
 lib/raio-x/dados.ts                                | 226 ++
 lib/raio-x/por-cliente.ts                          |  28 +-
 lib/security/censo-do-cofre.ts                     | 294 +++
 lib/security/crypto.ts                             |  29 +-
 16 files changed, 1921 insertions(+), 46 deletions(-)
```

**Compila contra o deploy de hoje?** Até onde determinei, sim, e por um bom
motivo: o PR não substitui `loadConnectionToken` (a função com 25 chamadores
na casa hoje) — ele cria `carregarTokenDaConexao` como implementação nova, e
transforma `loadConnectionToken` numa casca fina que chama a nova e devolve o
mesmo contrato de sempre (`Promise<{token, externalId, platform, clientId,
metaJson} | null>`). Li o diff inteiro: os 25 chamadores existentes não
precisam mudar uma linha. O `crypto.ts` só ganha comentário — a função
`cifradoComChaveLegada` que ele passa a expor via `censo-do-cofre.ts` **já
existia** na base, com zero chamadores; o PR não muda a assinatura dela.

**O que quebra ao mesclar:** só `docs/pendencias.md`, e é conflito **textual**
— o PR insere um bloco de 159 linhas logo após o cabeçalho, e a base fez o
mesmo (42 commits tocaram esse arquivo desde `a9bd36c9`, todos inserindo no
mesmo ponto). É diário de bordo append-only: resolve-se posicionando a entrada
na ordem cronológica certa, sem perder uma linha de nenhum lado — confirmei
lendo o início do bloco que o PR insere. Fato-156.txt já tinha medido isso
(`exit=1`, um conflito só, `CONFLICT (content)` em `docs/pendencias.md`,
`Auto-merging` limpo em todos os outros arquivos do diff, inclusive
`connections.ts` e `lib/raio-x/dados.ts`).

**O que o PR traz que a base ainda não tem:** `lib/security/censo-do-cofre.ts`,
`app/api/admin/censo-do-cofre/route.ts`, `carregarTokenDaConexao` —
confirmado, nenhum dos três existe na base (`git cat-file -e` → *does not
exist* para os dois primeiros; a base só tem `loadConnectionToken`, sem a
distinção entre "token ilegível" e "conexão não existe"). Nenhum commit da
base tocou `connections.ts` ou `crypto.ts` desde `a9bd36c9` — zero.

**O que já foi resolvido melhor na base:** nada nos arquivos de código. O
registro mentiroso da vitrine (`docs/agents/plataforma/vitrine.md`) **também
não foi corrigido por outro caminho** — não achei nenhum commit da base
tocando esse arquivo desde `a9bd36c9` que mudasse a frase sobre
`CREDENTIALS_SECRET`.

**Recomendação: SEGURO.** Um conflito só, textual, em log append-only; todo o
resto do diff mescla limpo (confirmado pela ficha e por mim, arquivo por
arquivo); a nova função é aditiva e não quebra os 25 chamadores existentes;
nada do conteúdo foi superado por trabalho mais recente da base.

**Consequência declarada de fechar:** a casa continua sem instrumento para
contar quantos tokens de conexão o cofre não consegue mais abrir — e o
registro da vitrine continua, hoje, recomendando o gesto errado
("NÃO sete `CREDENTIALS_SECRET`") sobre um estado que já mudou há 9 dias.

---

## PR #157 — "Os freios de saída: religar o relógio deixa de ser tudo-ou-nada" + "3ª porta do WhatsApp"

**O que o PR faz, em uma frase de negócio:** impede que um erro de digitação
numa variável de ambiente (`DESPERTADOR_INTERVALO_MS`) transforme o relógio da
agência num laço quente que gasta IA e dispara WhatsApp sem parar, e dá
visibilidade a filas que ficam "represadas" atrás de limites de segurança
(consentimento, teto de leituras, política de template) — hoje, quando um
desses freios trava, a rodada simplesmente reporta "0 tratado" e parece um dia
sem trabalho nenhum, em vez de dizer que tem fila parada atrás do freio.

**Base declarada:** `claude/freios-de-saida-bloco-e` → deploy (direto),
segundo a ficha. Estruturalmente, o head de #157 descende do head de #155
(que por sua vez descende de #152): `git merge-base
origin/claude/raio-x-vocabulario-v2 origin/claude/freios-de-saida-bloco-e` →
`40a16201`, a ponta exata do #155. Ou seja, #157 carrega #152 + #155 inteiros
dentro de si — e, como a base declarada dele É a deploy (segundo a ficha),
mesclar #157 traria os três de uma vez, se essa base estiver correta. Mesma
ressalva: não consegui confirmar o campo via API.

**O que #157 entrega contra a própria base (a ponta do #155):**

```
git diff --stat refs/prs/155..refs/prs/157
 (11 arquivos de teste novos/alterados)
 lib/agency/despertador.ts                          | 148 +++++-
 lib/agency/esteira/avaliacoes.ts                   | 147 +++++--
 lib/agency/esteira/avisos.ts                       |  38 +++
 lib/agency/esteira/fila-que-se-cobra.ts            |  86 +++-
 lib/agency/esteira/ritmo.ts                        |  45 +++
 lib/agency/esteira/trafego.ts                      | 104 +++-
 lib/agency/freios-de-saida.ts                      | 125 +++ (NOVO)
 lib/agency/pulso.ts                                |  29 +++
 lib/integrations/meta/notifications.ts             | 181 +++-
 21 files changed, 2028 insertions(+), 64 deletions(-)
```

`lib/agency/freios-de-saida.ts` não existe na base — confirmado
(`git cat-file -e` → *does not exist*).

**O que quebra ao mesclar — semântico, não só texto, em 2 de 21 arquivos:**

- 🔴 **`lib/agency/despertador.ts` — conflito real.** A base recebeu **32
  commits independentes** neste arquivo desde `a9bd36c9` (medido:
  `git rev-list --count`), e a função `baterORelogio()` de hoje na base já
  devolve campos que o PR nem imagina (`ligados`, `levasAbertas`,
  `pmCobrancas` — confirmei lendo a base linha 345-372). O PR, por sua vez,
  adiciona ao MESMO objeto de retorno e ao MESMO objeto `moveu` os campos
  `whatsappRetidos`, `avaliacoesRetidas` e `freios`. Os dois lados evoluíram a
  mesma assinatura de função e o mesmo objeto de retorno — reconciliar é
  **união dos dois conjuntos de campos**, não escolha de lado. Um merge
  automático malfeito derruba o `tsc` (o tipo de retorno declarado no `.d.ts`
  implícito perde metade dos campos que outra parte do código já lê).
- 🔴 **`lib/agency/pulso.ts` — conflito real, mesmo padrão.** A base adicionou
  (1 commit, `c1622c74`) a interface `EstadoDaRodada` e os campos
  `estados`/`estados24h`/`estadosAgora` exatamente nos mesmos pontos de
  inserção (logo após `FalhaDaRodada`, dentro de `Batida`, dentro de
  `EstadoDoPulso`, dentro de `lerPulso()`) onde o PR insere `FreioNaRodada` e
  `freios`/`freios24h`/etc. Não são a mesma feature — uma é "estado contínuo
  não-falha" (decisão do dono parada), a outra é "freio de saída fechado" —
  mas ocupam a mesma vizinhança de código. Reconciliável mantendo os dois
  conjuntos, não é textual puro porque exige entender que são coisas
  diferentes antes de uni-las.
- `lib/integrations/meta/notifications.ts`: tocado pela base em 2 commits
  desde `a9bd36c9`, mas o `merge-tree` da ficha (fato-157.txt) o classifica
  como `Auto-merging` limpo, sem `CONFLICT`. Vale registrar: **este é o mesmo
  arquivo que o #160 também conflita** (ver seção do #160). Se algum dia mais
  de um destes PRs for mesclado, eles disputam esse arquivo entre si, não só
  com a base.

**O que já foi resolvido melhor na base:** não achei nenhum. A base evoluiu
`despertador.ts` e `pulso.ts` para um problema **diferente** (estado contínuo
do "dono decide", projetos "idle" que ligam sozinhos, cobrança do PM) — não é
duplicata do que o #157 resolve (freios de saída), é evolução paralela do
mesmo arquivo.

**Recomendação: DEPOIS DO CLIENTE.** O conteúdo é real, testado e sem
substituto — mas dois arquivos centrais do motor de rodada (`despertador.ts`,
`pulso.ts`) tiveram evolução concorrente de verdade na base, e a costura exige
somar dois conjuntos de campos numa mesma função sem perder nenhum dos dois.
Fazer isso apressado é o tipo exato de merge que quebra `tsc` silenciosamente
se alguém escolher um lado em vez de unir.

**Consequência declarada de fechar:** o relógio da agência continua com um
`??` em vez de validação no intervalo (uma variável mal digitada ainda pode
virar laço quente), e filas represadas atrás de freios de segurança continuam
indistinguíveis de "não tinha trabalho".

---

## PR #160 — "Base de link única para o domínio oficial — e o webhook que ela ARMA"

**O que o PR faz, em uma frase de negócio:** centraliza em um único lugar
(`lib/http/endereco-publico.ts`) o endereço que a casa usa para montar link
que sai para o cliente fora de uma requisição (WhatsApp, e-mail, retorno de
pagamento) — hoje há três padrões diferentes espalhados, e dois deles caem em
**string vazia** quando a variável de ambiente não está definida, o que
transforma o link de retorno do Mercado Pago e o `notification_url` (o
webhook que confirma pagamento) em caminhos relativos que não abrem/não
resolvem nada.

**Base declarada:** `fix/base-de-link-dominio-oficial` → deploy. Merge-base
medido: `64d8afe5` (16/08, diferente dos outros quatro PRs deste lote, que
usam `a9bd36c9` de 15/08) — **não faz parte da mesma cadeia**, é 1 commit
isolado (`89953f38`) direto sobre a deploy daquele dia.

**Compila contra o deploy de hoje?** O arquivo gerado
`lib/generated/prisma/models/RecusaV2.ts` (+1176 linhas no diff do PR) chamou
atenção por não existir no merge-base — mas medi que ele **existe na deploy
de hoje, byte a byte idêntico** ao que o PR traz (`git diff
refs/prs/160:<arquivo> deploy:<arquivo>` → saída vazia). Não é conflito: é
"gerado independentemente duas vezes a partir do mesmo schema, e o schema já
tinha o modelo `RecusaV2` no merge-base, só o arquivo gerado não tinha sido
commitado ainda". O `merge-tree` da ficha confirma: este arquivo **não está**
na lista de conflito. `npx prisma generate` não precisa nem rodar aqui — as
duas cópias já são iguais.

**O que quebra ao mesclar — os dois conflitos reais, nomeados:**

- **`app/api/self-serve/order/route.ts` — textual/posicional, não
  concorrente de fato.** A base ganhou 1 commit próprio
  (`a8806426`, "a casa só vende o que produz") que insere uma guarda nova
  (`ofertaVendavel`) na linha do import de `SELF_SERVE_CATALOG` e no meio da
  função `POST`. O #160 insere uma linha de import nova
  (`baseDeLink`) logo ANTES dessa mesma linha de import e reescreve a
  constante `APP_URL` mais abaixo. As duas mudanças **não disputam a mesma
  lógica** — uma é sobre o que pode ser vendido, a outra é sobre para onde o
  link de retorno aponta — mas tocam linhas adjacentes o bastante para o git
  marcar conflito de contexto. Reconciliável mantendo os dois lados sem perda
  de feature de nenhum.
- 🔴 **`lib/integrations/meta/notifications.ts` — conflito semântico de
  verdade, com risco de reverter uma ordem do CEO.** A base **já corrigiu o
  mesmo bug**, um dia depois (commit `ef0523ca`, 16/08), só que de outro
  jeito: trocou o fallback de `BASE_URL` do endereço do Railway
  (`dioli-agency-os-1-production.up.railway.app`) direto para
  `https://www.diolidigital.com.br`, citando ordem literal do CEO ("está tudo
  ainda com o domínio, é pra estar diolidigital.com.br"). O #160 substitui a
  MESMA constante por `baseDeLink()`, cujo fallback
  (`ENDERECO_DE_HOJE`) é o endereço do **Railway** — porque foi escrito em
  15/08, um dia ANTES da ordem do CEO, quando o domínio oficial ainda não
  respondia (`targetPort` vazio, segundo o próprio comentário do PR). **Se
  alguém resolver este conflito pegando a versão do #160 sem ajustar
  `ENDERECO_DE_HOJE`, o link que vai dentro da mensagem de WhatsApp do
  cliente volta a ser o domínio do Railway** — exatamente o que o CEO mandou
  parar de fazer um dia depois de este PR ter sido escrito. Isto não é
  compilar ou não: é decisão de negócio que o merge automático não sabe
  tomar sozinho, e o texto do próprio teste do PR (`__tests__/http/base-de-
  link.test.ts`) ainda afirma "sem variável, cai no endereço que RESPONDE
  hoje — não no oficial", uma frase escrita antes da ordem do CEO existir.

**O que o PR traz que a base ainda não tem, e continua sem substituto:**
- `lib/http/endereco-publico.ts` inteiro (a função `baseDeLink()`,
  `origemPublica()`, `urlPublica()`) — não existe na base.
- O conserto do `app/api/self-serve/order/route.ts`: a base **ainda tem**
  `const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ""` (confirmado, linha
  72 de hoje) — ou seja, o link de sucesso/falha do Mercado Pago **e o
  `notification_url` do webhook** continuam quebrados na deploy de hoje se a
  variável não estiver definida. É o achado mais caro do PR: um webhook mal
  formado pode significar pagamento que não confirma sozinho.
- O conserto de `lib/agency/esteira/avisos.ts` (`linkDoPortal`): a base
  **ainda tem** o mesmo fallback para string vazia (confirmado, linha 50 de
  hoje) — o link do portal dentro do aviso de WhatsApp ainda pode sair como
  caminho relativo.

**O que já foi resolvido melhor/diferente na base:** o fallback de
`notifications.ts` — ver conflito semântico acima. "Melhor" é discutível
(a versão da base é mais simples; a do PR é mais centralizada e cobre 2 bugs
que a base não tocou), mas é **diferente e mais recente**, e carrega uma
decisão explícita do CEO que o PR não conhecia quando foi escrito.

**Recomendação: DEPOIS DO CLIENTE.** Dois dos três arquivos em conflito são
de baixo risco (posicional em `order/route.ts`; arquivo gerado idêntico), mas
o terceiro (`notifications.ts`) é uma reconciliação de verdade: quem mesclar
precisa preservar o `baseDeLink()` centralizado E o valor de fallback que o
CEO ordenou em 16/08, não pegar um lado inteiro. Errar essa costura silenciosamente reintroduz o domínio errado no WhatsApp do cliente.

**Consequência declarada de fechar:** o retorno do Mercado Pago e o webhook de
confirmação de pagamento (`order/route.ts`) e o link do portal em aviso de
WhatsApp (`avisos.ts`) continuam com fallback de string vazia na deploy de
hoje — os dois bugs mais caros deste PR não têm substituto em nenhum outro
lugar da base.

---

## Tabela-resumo do lote

| PR | Base declarada | Veredito | Consequência declarada de fechar |
|---|---|---|---|
| **#152** | `rotinas-na-branch-viva` → deploy (direto) | **SEGURO** | As 2 rotinas noturnas continuam escrevendo numa branch morta com painel verde — inclusive a que sustenta o parecer da trava de plataforma. |
| **#155** | ⚠️ branch do #152 (não deploy), segundo a ficha | **SEGURO — condicionado a #152 entrar antes/junto** | 28 dos 48 achados do raio-x continuam ruído; sem #152 mesclado, mesclar #155 sozinho não muda nada em produção. |
| **#156** | `consertos-do-cofre` → deploy (direto), segundo a ficha; **mas descobri que também descende de #152** | **SEGURO** | Sem instrumento para contar tokens do cofre ilegíveis; a vitrine da plataforma continua recomendando, hoje, o gesto que causaria o dano (desligar `CREDENTIALS_SECRET`). |
| **#157** | `freios-de-saida-bloco-e` → deploy (direto), segundo a ficha; carrega #152+#155 na própria ancestralidade | **DEPOIS DO CLIENTE** | `despertador.ts` (32 commits concorrentes da base) e `pulso.ts` exigem união de campos, não escolha de lado; risco real de quebrar `tsc` se malfeito. Sem o PR: intervalo do relógio sem validação; filas represadas por freio ficam indistinguíveis de "sem trabalho". |
| **#160** | `fix/base-de-link-dominio-oficial` → deploy (merge-base próprio, `64d8afe5`, 16/08) | **DEPOIS DO CLIENTE** | `notifications.ts` precisa reconciliar `baseDeLink()` com a ordem do CEO de 16/08 (domínio oficial), não herdar o fallback do Railway do PR. Sem o PR: webhook de pagamento e link de portal em WhatsApp continuam com fallback de string vazia. |

**Nenhum dos cinco é MORTO nem PODRE.** Todos entregam conteúdo real, sem
duplicata melhor na base. Três (#152, #155, #156) mesclam sem risco de
conteúdo; dois (#157, #160) exigem reconciliação humana de verdadeiro
conflito semântico antes de ir para produção.

---

## O que eu NÃO determinei

- **O campo "base" real de cada PR na API do GitHub**, para #155, #156, #157
  e #160. Tentei duas vezes, dois comandos diferentes, ambos recusados pelo
  sandbox com a mensagem exata:
  - `gh pr view 152 --json number,baseRefName,headRefName,mergeable,mergeStateStatus`
    → `This command requires approval`. (Mesmo resultado para 155, 156, 157,
    160.)
  - `curl -s https://api.github.com/repos/diolisantos10/dd-fila/pulls/152`
    → `This Bash command contains multiple operations. The following part
    requires approval: curl -s https://...`
  Toda a análise de "quem descende de quem" acima é **estrutural** (via
  `git merge-base`/`git log` nos refs locais, que funcionam), não uma
  confirmação do campo de metadado do GitHub. Onde a ficha já dava esse
  campo como medido, usei o valor da ficha e marquei com ⚠️ onde a minha
  medição estrutural ia além do que a ficha tinha sinalizado (o caso do
  #156).
- **`git merge-tree`, rodado por mim.** Recusado (`This command requires
  approval`) nas duas vezes que tentei (uma explícita, uma via `--write-tree
  --name-only`). Usei os resultados já computados nos `fato-*.txt` e
  complementei com `git diff`/`git log --oneline <merge-base>..<ref> --
  <arquivo>` para nomear textual vs. semântico — é o método alternativo que
  a própria `.fichas/como-julgar.md` prevê.
- **Se o `docs/agents/plataforma/vitrine.md` e `oficina.md` do #156 colidem
  com alguma reivindicação ativa de outra sessão hoje.** Não chequei
  `reivindicacoes/` — fora do escopo desta ficha.
- **Se há mais arquivos, além dos já nomeados, em que #157 e #160 disputariam
  entre si** caso os dois fossem trabalhados juntos, além de
  `lib/integrations/meta/notifications.ts` (confirmado que os dois o tocam).
  Não fiz a comparação #157×#160 diretamente — não fazia parte do pedido.
- **Se `NEXT_PUBLIC_APP_URL` está de fato definida em produção hoje.** Se
  estiver, o conflito de fallback do #160 em `notifications.ts` é
  teoricamente inofensivo em produção (o valor declarado vence os dois
  fallbacks); só importa nos ambientes/dias em que a variável não estiver
  setada. Não tenho acesso ao Railway a partir deste despacho.

## Furos vivos na base que nomeei e não consertei

Nenhum achado de segurança novo neste lote (diferente do lote de #383, que
tinha 3). O que nomeei acima são **bugs de produto/operação vivos na base**,
não furos de acesso indevido — registro aqui por transparência, mesmo não
sendo achado de `seguranca`:

1. `.github/workflows/raio-x-noturno.yml` e `biblioteca-diaria.yml` (base,
   hoje) — ainda fazem checkout/push com nome de branch fixo
   (`claude/dioli-pm-role-pow56e`), a mesma branch morta. Conserto pronto no
   #152.
2. `app/api/self-serve/order/route.ts:72` (base, hoje) —
   `const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ""`. Se a variável não
   estiver definida, o retorno do Mercado Pago E o `notification_url` do
   webhook de confirmação de pagamento saem quebrados. Conserto pronto no
   #160 (com a ressalva do fallback a reconciliar em `notifications.ts`).
3. `lib/agency/esteira/avisos.ts:50` (base, hoje) — mesmo padrão de fallback
   vazio no link do portal enviado por WhatsApp. Conserto pronto no #160.
4. `docs/agents/plataforma/vitrine.md` (base, hoje) — continua afirmando "NÃO
   sete `CREDENTIALS_SECRET` agora", quando a variável está setada e segura
   desde 06/08. Conserto pronto no #156.

---

# LOTE B — #153, #161, #162 · despachado ao especialista `seguranca`

## Lote B — os três que se anunciam P0 (#153, #161, #162)

> Despacho: PM → `seguranca`. Método: `.fichas/como-julgar.md`. Base de deploy =
> `origin/claude/dioli-agency-os-architecture-kk7kp`.
> **Merges feitos: ZERO. PRs fechados: ZERO. Comentários em PR: ZERO. Furos
> encontrados na base foram NOMEADOS, não consertados** — restrição da ficha:
> não escrevi uma linha em `lib/agency/`, `app/api/v2/`, `__tests__/seguranca/`
> nem `__tests__/v2/`.
> `gh pr view`/`gh api` foram recusados pelo sandbox ("This command requires
> approval") para os três PRs — toda medição abaixo vem de `git` local contra
> os refs já baixados (`refs/prs/153`, `refs/prs/161`, `refs/prs/162`) e a
> branch de deploy.

---

## PR #153 — "Portal: a conversa passa a ser cercada pelo dono"

**1. O que o PR faz, em uma frase de negócio:** impede que o token (ou a
sessão) de um cliente no portal alcance mensagens de OUTRO cliente — hoje o
filtro de leitura da conversa é permissivo o bastante para vazar histórico
entre clientes em pelo menos um cenário real (solicitação que já trocou de
dono).

**2. Base declarada:** branch de deploy. `merge-base` medido =
`64d8afe5d76ba6c2c0f551c775d3d3c5bce851ef` (confirmado: é ancestral tanto do
PR quanto da branch de deploy hoje). 20 commits, 84 arquivos, +7758/−572
(`.fichas/fato-153.txt`).

**3. Compila contra o deploy de hoje?** Verificação estática, não `tsc` (o
sandbox recusa `npx`). Conferi o ponto de maior risco — o PR renomeia
`Conversa.clientRequestIds` → `clientRequestIdsDaEscrita` em
`app/api/messages/conversa.ts`. Busquei todo consumidor do nome antigo na base
(`git grep clientRequestIds`) e achei só o próprio arquivo e
`__tests__/portal/conversa-do-cliente.test.ts:212` — e conferi que **o PR
também atualiza esse teste** (`git diff <merge-base> refs/prs/153 --
__tests__/portal/conversa-do-cliente.test.ts` mostra a mesma linha virando
`c.clientRequestIdsDaEscrita`). Sem essa segunda checagem eu teria reportado um
"quebra o build" falso — registro o quase-erro porque a lei da casa é não
afirmar de memória. **Nesse ponto, consistente.** Não cobri os 84 arquivos
símbolo a símbolo — ver "o que não determinei".

**4. O que quebra ao mesclar — `git merge-tree` (já rodado, `.fichas/fato-153.txt`), exit=1, 15 arquivos em conflito:**

| arquivo | commits da base desde o merge-base | natureza |
|---|---|---|
| `docs/decisoes.md` | — | **textual** — PR só insere (265 ins/0 del, `git diff --stat`); mesmo padrão de diário append-only já visto em outros PRs |
| `docs/pendencias.md` | — | ⚠️ **risco não só textual** — o PR tem 442 ins **e 183 del** (`git diff --stat`), ou seja, ele EDITA linhas existentes (marca pendências como resolvidas), não só apêndice. Não confirmei se a base editou as MESMAS linhas — ficou como risco nomeado, não veredito fechado |
| `app/api/portal/approvals/route.ts` | **10** commits próprios da base | **semântico**, alto risco — arquivo evoluiu muito desde 15/08; não abri linha a linha |
| `app/api/portal/vista/route.ts` | 2 commits | semântico, risco moderado — não caracterizado em detalhe |
| `app/api/social-posts/route.ts` | 3 commits | semântico, risco moderado — não caracterizado em detalhe |
| `lib/agency/balcao/producao.ts` | 1 commit | semântico, risco baixo-moderado — não caracterizado em detalhe |
| `app/api/admin/reset-request/route.ts`, `app/api/brain/orchestrate/apply/route.ts`, `lib/agency/esteira/marcos.ts`, `lib/agency/esteira/pedidos.ts`, `lib/agency/esteira/trafego.ts`, `lib/agency/execution/create-project-from-request.ts`, `__tests__/media/envio-do-cliente.test.ts`, `__tests__/portal/aprovacao-cliente-direto.test.ts`, `__tests__/portal/telas-do-carrossel.test.ts` | — | **não determinado** — confirmados como conflito mecânico (`merge-tree`), não abertos individualmente |

Nada do que o PR toca foi **apagado** pela base (não achei nenhum
modify/delete nos 15 conflitantes).

**5. O que o PR traz que a base ainda não tem:** amostrei ~20 dos 84 arquivos
(dirigido a segurança, via `git cat-file -e <base>:<caminho>`):

- **Genuinamente novos (6 confirmados):** `lib/agency/portal/dono-da-tela.ts`,
  `lib/agency/portal/filho-do-dono.ts`,
  `lib/agency/portal/solicitacao-que-mudou-de-dono.ts`,
  `lib/agency/portal/backfill-de-carimbo.ts`,
  `app/api/admin/censo-de-historico-ambiguo/route.ts`,
  `app/api/admin/backfill-de-carimbo/route.ts`.
- **Já existem na base e evoluíram por conta própria (14 confirmados):**
  `app/api/portal/vista/route.ts`, `app/api/portal/approvals/route.ts`,
  `app/api/portal/esteira/route.ts`, `app/api/admin/reset-request/route.ts`,
  `app/api/brain/portal-data/route.ts`, `app/api/media/route.ts`,
  `app/api/social-posts/route.ts`, `lib/agency/persistence/portal-access-service.ts`,
  `lib/agency/persistence/client-request-service.ts`, `app/portal/access/route.ts`,
  `lib/generated/prisma/models/RecusaV2.ts`, `lib/integrations/meta/notifications.ts`,
  `app/api/portal/messages/route.ts`, `app/api/messages/conversa.ts`.
- **Os outros ~64 (a maior parte `__tests__/*` novos, `docs/entregas/*.png` e
  `scripts/*`) não foram verificados um a um** — não determinado.

**6. O que já foi resolvido MELHOR na base:** nenhum achado. Ao contrário: a
versão da base para o problema central (a conversa entre clientes) é a
**versão vulnerável que o próprio PR substitui** — ver "Furos vivos", item 1.
O PR está estritamente à frente da base nesse ponto.

**7. Recomendação: DEPOIS DO CLIENTE.** Não é MORTO (o furo central está vivo
e sem substituto — ver abaixo), não é PODRE (nenhum defeito de compilação ou
regressão de decisão encontrado nos pontos que consegui medir), não é SEGURO
(conflito real e não-trivial em `portal/approvals/route.ts` — 10 commits
concorrentes — e edição, não apêndice puro, em `docs/pendencias.md`).
**Consequência declarada de esperar:** o furo de vazamento de conversa entre
clientes (item 1 de "Furos vivos") continua vivo enquanto isso não for
reconciliado. Dado que é o maior PR da fila (84 arquivos) e o mais antigo
(15/08), recomendo que a reconciliação **não espere a fila normal** — o
conteúdo relevante de segurança pode ser extraído primeiro (conversa.ts +
portal/messages/route.ts + os 6 arquivos novos), sem esperar os outros ~78.

---

## PR #161 — "O clienteId do corpo deixa de atravessar a casa no piloto assistido"

**1. O que o PR faz, em uma frase de negócio:** fecha o vazamento entre
agências (workspaces) na rota do piloto assistido (`POST /api/v2/assistido`):
o `workspaceId` passa a vir de QUEM ESTÁ LOGADO, nunca do `clienteId` do
corpo, nas três ações (`ligar`, `ciclo`, `status`) — e retira o fallback
`CRON_SECRET` da autenticação por segredo (credencial sem escopo que crescia
sozinha).

**2. Base declarada:** branch de deploy. `merge-base` =
`2802433e5caabbb68173871e1497ed6dcb6728f0`. 1 commit, 6 arquivos,
+771/−30 (`.fichas/fato-161.txt`).

**3. Compila contra o deploy de hoje?** Verificação estática dos símbolos
usados:
- `guarda.acesso.session.workspaceId` — confirmado: `SessionPayload` (base,
  `lib/auth/session.ts:11`) declara `workspaceId: string`; `exigirAdministracao`
  devolve `{ acesso: { session, perfil }, erro: null }` (base,
  `lib/agency/organizacao/guarda.ts:142`). **Compatível.**
- `ArmazemDeRetomada` ganha o método `correlacaoDoWorkspace`, e
  `retomarProcesso` ganha o parâmetro `workspaceId` — os ÚNICOS dois
  implementadores/consumidores na base inteira (`git grep ArmazemDeRetomada`)
  são `app/api/v2/retomar/route.ts` e `__tests__/v2/recovery.test.ts`, e os
  DOIS são atualizados pelo próprio PR de forma consistente. **Compatível.**
- Nenhum sinal de quebra de tipo nos pontos que consegui alcançar.

**4. O que quebra ao mesclar — `git merge-tree`, exit=1, 1 arquivo:**

- 🔴 `app/api/v2/assistido/route.ts` — **conflito SEMÂNTICO real, não
  cosmético.** A base, independentemente, endureceu a MESMA função
  `autenticar()` que o PR reescreve: adicionou comparação de segredo em tempo
  constante (`segredoConfere`, contra vazamento por medição de tempo) e uma
  checagem de CSRF (`deveBloquearMutacaoCrossSite`) no caminho de sessão.
  Confirmado lendo `git diff 2802433e... origin/...` — a base introduziu
  `import { segredoConfere }` e `import { deveBloquearMutacaoCrossSite }`
  exatamente dentro de `autenticar()`. **Escolher um lado perde a feature do
  outro:** o lado da base perde o recorte por workspace (reabre o furo P0);
  o lado do PR perde a comparação em tempo constante e o CSRF (reabre dois
  furos já fechados). **Reconciliar é costurar os dois dentro da mesma
  função, não escolher.**
- `app/api/v2/retomar/route.ts` e `lib/agency/v2-recovery/retomar.ts`: **zero
  commits da base tocaram esses arquivos desde o merge-base** (`git log
  2802433e..origin/... -- <arquivo>` vazio) — mescla limpa, sem conflito.

**5. O que traz que a base ainda não tem:**
- `__tests__/v2/piloto-nao-atravessa-a-casa.test.ts` — genuinamente novo
  (`git cat-file -e <base>:...` → não existe).
- `__tests__/v2/outbox-sem-dono-nao-ganha-executor.test.ts` — genuinamente
  novo, **mas com uma ressalva séria** — ver o bloco "Furos vivos", item 5:
  a premissa que o teste documenta ("nenhum executor tem consequência
  externa ainda") **já não é verdade na base hoje**.
- O recorte por workspace nas três ações de `assistido/route.ts` e o recorte
  por workspace em `retomar.ts`/`retomar/route.ts` (com defesa contra
  TOCTOU — a correlação entra também no `WHERE` da escrita, não só da
  leitura): nenhum substituto na base.

**6. O que já foi resolvido MELHOR na base:** a comparação em tempo constante
e o CSRF em `autenticar()` (ver item 4) — são reais, são bons, e o PR (escrito
antes deles) não os tem. Isso não torna o PR MORTO — o que ele resolve
(recorte por workspace) a base não resolveu — mas muda o que "mesclar"
significa: não é pegar o lado do PR, é unir os dois.

**7. Recomendação: DEPOIS DO CLIENTE.** Conteúdo correto, sem substituto,
conflito real e não-trivial num arquivo pequeno (compensa a reconciliação
rápida). **Consequência declarada de esperar:** os furos 2, 3 e 5 de "Furos
vivos" (abaixo) continuam vivos.

---

## PR #162 — "O segundo id do corpo também tem dono — a meia trava do piloto fecha"

**1. O que o PR faz, em uma frase de negócio:** fecha a SEGUNDA metade da
mesma trava do #161 — `clientRequestId` do corpo (usado para *retomar* um
ciclo assistido já iniciado) também precisa provar posse antes de ser aceito;
sem isso, era possível carimbar `in_progress` numa solicitação de outra
agência e rodar a cadeia de IA em cima dela sem deixar rastro de entrada na
própria casa. De quebra, move o registro de executores do outbox da V2 para
um módulo único, para que a trava de CI que os vigia leia o mapa efetivo, não
o texto-fonte.

**2. Base declarada — ⚠️ NÃO é a branch de deploy.** `git merge-base
refs/prs/161 refs/prs/162` devolve exatamente a ponta do #161
(`05cc4d37807f946a2d3fd34f2ac9fcb26776ecd9`) — confirmado também por
`git log --oneline refs/prs/161..refs/prs/162` (só 1 commit exclusivo). **O
#162 está empilhado sobre o #161, não sobre o deploy.** É por isso que o
GitHub provavelmente responde "mergeable" para ele: está comparando com a
branch do #161. Contra a própria base (`refs/prs/161..refs/prs/162`): 5
arquivos, +510/−126 — 1 commit, 8 arquivos no total contra o deploy
(`.fichas/fato-162.txt`).

**3. Compila contra o deploy de hoje?** Confirmei o único import novo:
`solicitacaoDoWorkspace` vem de `lib/auth/posse-de-workspace.ts` — **esse
arquivo já existe na base HOJE** (commits `543ac4c1`/`14459e79`, ambos
**anteriores** ao merge-base do #161/#162) **e está byte-a-byte inalterado
desde então** (`git diff 2802433e... origin/... -- lib/auth/posse-de-workspace.ts`
vazio). A assinatura bate exatamente:
`solicitacaoDoWorkspace(clientRequestId: string, workspaceId: string):
Promise<boolean>`. **Zero risco de drift nesse import — é dependência
estável.** Isto também significa que #162 **não inventa uma segunda
política de posse**: consome a mesma que a base já usa em
`app/api/portal/messages/route.ts` e em `app/api/messages/conversa.ts`.

**4. O que quebra ao mesclar:**
- Herda o conflito semântico de `app/api/v2/assistido/route.ts` do #161
  (item 4 acima) — os mesmos dois lados a costurar.
- 🔴 `app/api/cron/v2/route.ts` — **conflito semântico GRAVE, o mais sério
  do lote.** Depois que o #162 foi criado, a base **consolidou** outbox +
  heartbeat + detector de parados + rodada do Gerente Geral num módulo só
  (`lib/agency/v2-recovery/batida-da-v2.ts`, commit `d215a027`), e essa
  consolidação **já tem um segundo executor real**, `mensagem_ao_cliente`,
  com consequência externa de verdade: manda aviso de atraso ao cliente por
  WhatsApp/e-mail (`avisarCliente`, confirmado lendo o arquivo). A rota
  `cron/v2/route.ts` da base **não chama mais `processarOutbox` diretamente**
  — chama `baterORelogioDaV2()`, que por sua vez chama `rodadaDoGerenteGeral()`.
  O #162 reescreve `route.ts` para voltar a chamar `processarOutbox`
  diretamente com um registro (`EXECUTORES_DE_SAIDA`) que só tem
  `registro_de_teste` — **sem `mensagem_ao_cliente`**. **Um merge malfeito
  aqui não é só "escolher um lado" — é apagar em silêncio o aviso de atraso ao
  cliente e a chamada ao Gerente Geral**, porque quem resolve o conflito vendo
  só o `route.ts` não tem como saber que a lógica migrou de arquivo.
  **Reconciliação correta: unir `EXECUTORES` (de `batida-da-v2.ts`, que já
  tem `mensagem_ao_cliente`) com `EXECUTORES_DE_SAIDA` (do #162) num registro
  só, mantendo a chamada a `baterORelogioDaV2`/`rodadaDoGerenteGeral` —
  nunca reverter `route.ts` para a forma antiga do PR.**

**5. O que traz que a base ainda não tem:**
- `lib/agency/v2-recovery/executores-de-saida.ts` — genuinamente novo, mas
  ver ressalva do item 6.
- `__tests__/v2/outbox-sem-dono-nao-ganha-executor.test.ts` — genuinamente
  novo. Ver "Furos vivos", item 5: a documentação da própria trava ("nenhum
  executor tem consequência externa ainda") **já está desatualizada em
  relação à base**.
- O recorte por posse de `clientRequestId` em `assistido/route.ts` (usando
  `solicitacaoDoWorkspace`, já estável na base) — sem substituto.

**6. O que já foi resolvido MELHOR/DIFERENTE na base:** a arquitetura de
`cron/v2/route.ts` inteira mudou de forma (consolidação em
`batida-da-v2.ts`, com um executor real a mais) — não é "melhor" no sentido
de já ter o conserto do #162, é **incompatível na forma**, o que é pior para
efeito de merge do que um conflito comum: o risco de perda silenciosa de
feature é maior do que num conflito de conteúdo dentro do mesmo desenho.

**7. Recomendação: DEPOIS DO CLIENTE, e com um passo OBRIGATÓRIO antes de
qualquer reconciliação de conteúdo: reapontar a base declarada do #162 para a
branch de deploy** (ou mesclar o #161 primeiro e só então tratar o #162) —
review 3 do precedente #383 documentou o mesmo defeito para o #168, e é a
mesma armadilha aqui: **mesclar #162 do jeito que está hoje não põe nada em
produção**, porque a base dele é uma branch de PR, não o deploy.
**Consequência declarada de esperar:** o furo 4 e o furo 5 de "Furos vivos"
continuam vivos; e se alguém tentar reconciliar `cron/v2/route.ts` sem ler
este documento, o risco concreto é **apagar a notificação de atraso ao
cliente sem perceber**.

---

## Tabela-resumo do lote

| PR | Base declarada | Veredito | Consequência declarada |
|---|---|---|---|
| **#153** | branch de deploy | **DEPOIS DO CLIENTE** | Furo de conversa cruzada entre clientes continua vivo (`app/api/messages/conversa.ts:58-65`); conflito real em `portal/approvals/route.ts` (10 commits concorrentes) e em `docs/pendencias.md` (o PR edita, não só anexa). Recomendo extrair o conteúdo de segurança sem esperar o PR inteiro (84 arquivos). |
| **#161** | branch de deploy | **DEPOIS DO CLIENTE** | Furo de vazamento entre agências no piloto assistido (`ligar`/`ciclo`/`status`) continua vivo. Conflito real em `app/api/v2/assistido/route.ts`: a base endureceu a MESMA função (`segredoConfere` + CSRF) que o PR reescreve — reconciliação é UNIÃO, não escolha de lado. |
| **#162** | ⚠️ **branch do #161**, não o deploy | **DEPOIS DO CLIENTE** (e reapontar antes de mais nada) | Furo do `clientRequestId` sem dono continua vivo. Risco adicional e grave: reconciliar `app/api/cron/v2/route.ts` sem saber que a base moveu a lógica para `batida-da-v2.ts` pode apagar em silêncio o executor `mensagem_ao_cliente` (aviso de atraso ao cliente) e a chamada ao Gerente Geral. |

**Nenhum dos três é SEGURO. Nenhum é MORTO. Nenhum é PODRE** (nenhum defeito
de compilação ou regressão de decisão encontrado dentro dos três).

---

## Colisão com a frente de posse que está rodando (ses-b6c221003f)

Conferido em `reivindicacoes/`:

- `reivindicacoes/posse-de-recurso.json` — sessão `ses-b6c221003f`, frente
  "posse de recurso em id vindo do corpo da requisição", arquivos
  reivindicados: `docs/diagnosticos/varredura-de-posse-no-corpo-29-08.md`,
  **`lib/agency/esteira/reprovacao.ts`**, `__tests__/seguranca`.
- `reivindicacoes/varredura-de-posse.json` — mesma sessão, frente anterior
  (28/08), já sobre `docs/diagnosticos/varredura-de-posse-28-08.md`.

**Não há colisão de ARQUIVO.** `lib/agency/esteira/reprovacao.ts` (o que a
outra frente está prestes a tocar) é a reprovação de peça **de dentro da
casa** (fluxo `SocialPost`/aprovação, comentário do CEO "não é isso") — não
tem nada a ver com `app/api/v2/assistido/route.ts`,
`app/api/v2/retomar/route.ts`, `lib/agency/v2-recovery/retomar.ts` nem
`app/api/cron/v2/route.ts`, que são os arquivos que #161 e #162 tocam.
Confirmado lendo `lib/agency/esteira/reprovacao.ts` — usa `postId`, não
`clienteId`/`clientRequestId` do piloto V2.

**Há colisão de RESPONSABILIDADE — a mesma pergunta, respondida em dois
lugares diferentes:** "um id vindo do corpo da requisição pode ser aceito sem
provar que pertence a quem pediu?". A outra frente está respondendo isso para
a reprovação de peça; #161/#162 respondem para o piloto assistido V2. **As
duas já convergem, sem coordenação prévia, para a MESMA política**
(`lib/auth/posse-de-workspace.ts`, que a #162 importa e a base já usa em
`conversa.ts`/`portal/messages/route.ts`) — o que é bom sinal, mas é
coincidência, não coordenação. Recomendação ao PM: quando a frente de posse
publicar `varredura-de-posse-no-corpo-29-08.md`, cruzar com este documento
antes de despachar a reconciliação de #161/#162, para não nascerem DUAS
políticas de posse (o mesmo erro que motivou a criação de
`lib/auth/posse-de-workspace.ts`, documentado no próprio cabeçalho dele: "a
conferência já vivia copiada em três lugares... e as cópias JÁ DIVERGIAM").

**Nenhuma escrita foi feita** em `lib/agency/`, `app/api/v2/`,
`__tests__/seguranca/` nem `__tests__/v2/` por mim, conforme a restrição desta
ficha — só leitura.

---

## Furos vivos na base HOJE — `arquivo:linha`, o que permite, quem precisa de quê, onde o conserto já existe

1. 🔴 **`app/api/messages/conversa.ts:58-65`** (base, hoje) — `montarFiltro`
   monta o filtro de leitura como
   `OR: [{clientId}, {clientRequestId: {in: requestIds}}]`. O próprio
   histórico de commits do #153 documenta que ESTE desenho vazou duas vezes
   (rodada 2 e rodada 3, nomeadas no cabeçalho do PR) quando uma solicitação
   de briefing já trocou de dono e a mensagem antiga não tem `clientId`
   carimbado. **Quem explora:** precisa de um token de portal válido do
   PRÓPRIO cliente (não precisa de credencial alheia) — o vazamento é lateral,
   não vertical. **Conserto pronto:** #153, rodada 5 ("prova de
   pertencimento", `return { clientId }` em vez da união).

2. 🔴 **`app/api/v2/assistido/route.ts:94`** (base, hoje, ação `ligar`) —
   `prisma.agencyWorkspace.findFirst({ orderBy: { createdAt: "asc" } })`: a
   ação sempre opera sobre a agência mais antiga do banco, nunca a de quem
   está logado. **Quem explora:** qualquer sessão de `direcao` (perfil
   interno da própria casa) — numa base com duas agências, o diretor da
   segunda mexe sem querer na esteira da primeira. **Conserto pronto:** #161.

3. 🔴 **`app/api/v2/assistido/route.ts:127`** (base, hoje, ação `ciclo`) —
   `prisma.client.findUnique({ where: { id: clienteId } })`, **sem** filtro de
   `workspaceId`. **Quem explora:** sessão de `direcao` de QUALQUER agência
   que saiba ou adivinhe um `clienteId` de outra — roda a cadeia de IA
   inteira (gasta dinheiro do piloto) e termina em
   `createApprovalRequest({ clientVisible: true })`, um card visível no
   **portal do cliente alheio**. **Conserto pronto:** #161.

4. 🔴 **`app/api/v2/assistido/route.ts:138-139`** (base, hoje, ação `ciclo`,
   retomada) — `corpo.clientRequestId ? { id: corpo.clientRequestId } : ...`,
   aceito sem checagem nenhuma. **Quem explora:** mesmo perfil do item 3 —
   carimba `in_progress` numa solicitação de outra agência e roda a cadeia de
   IA sobre ela, sem deixar registro de entrada na própria casa (buraco de
   auditoria e escrita alheia no mesmo gesto). **Conserto pronto:** #162
   (usa `solicitacaoDoWorkspace`, dependência já estável na base).

5. 🔴 **`app/api/v2/assistido/route.ts:271-283`** (base, hoje, ação
   `status`) — `execucoes`, `recusas`, `handoffs` e `chaves` são devolvidos
   **sem filtro de workspace nenhum**: qualquer sessão de `direcao` lê nome de
   cliente, função, custo e correlação de TODAS as agências. **Conserto
   pronto:** #161.

6. 🔴 **`app/api/v2/retomar/route.ts`** (base, hoje, arquivo inteiro) — **o
   achado mais grave da rodada.** `POST /api/v2/retomar` aceita
   `correlationId` do corpo sem NENHUMA checagem de posse (confirmado lendo o
   arquivo inteiro na base) e devolve à fila (`retomarProcesso` →
   `devolverParaFila`) efeitos `failed`/`dead` de `OutboxV2` — tabela que
   **não tem coluna de dono** (confirmado no `prisma/schema.prisma:2509-2524`
   da base: sem `workspaceId`, sem `clientId`). **O que muda a gravidade:** a
   trava de CI que o próprio #162 escreve
   (`__tests__/v2/outbox-sem-dono-nao-ganha-executor.test.ts`) documenta a
   premissa "nenhum executor tem consequência externa ainda — o defeito está
   inerte". **Essa premissa caiu.** A base já tem, hoje, um executor real
   (`mensagem_ao_cliente` em `lib/agency/v2-recovery/batida-da-v2.ts`,
   ligado pelo despertador desde o commit `d215a027`) que manda aviso de
   atraso ao cliente por WhatsApp/e-mail. **Quem explora:** qualquer
   PM/Diretor (`exigirApiInterna`) de QUALQUER agência, sabendo o formato
   `assistido:<clienteId>:<reqId>`, pode reativar o reenvio de um aviso a um
   cliente de OUTRA agência. **Conserto pronto:** #161
   (`correlacaoDoWorkspace`, as duas metades — inclusive a defesa contra
   TOCTOU, repetindo o predicado na escrita, não só na leitura).

**Resumo de quem precisa de quê:** os itens 2, 3, 5 e 6 exigem já estar
autenticado como `direcao`/PM/Diretor da própria casa (perfil interno) — é
vazamento **entre agências dentro da mesma casa Dioli**, não acesso anônimo.
O item 4 é a mesma classe. O item 1 é lateral entre clientes da mesma agência
e não exige credencial de equipe — só o token de portal do próprio cliente.
**Nenhum dos seis é acesso anônimo à internet** — todos exigem alguma
credencial legítima, só que escopada errado. Isso não reduz a gravidade: é
exatamente o padrão "estar logado não é ser dono" que esta casa já nomeou
como o furo mais caro (`docs/23-constituicao-dos-essenciais.md`, item 2).

---

## O que eu NÃO determinei

- **9 dos 15 arquivos em conflito mecânico do #153** não foram abertos linha
  a linha: `__tests__/media/envio-do-cliente.test.ts`,
  `__tests__/portal/aprovacao-cliente-direto.test.ts`,
  `__tests__/portal/telas-do-carrossel.test.ts`,
  `app/api/admin/reset-request/route.ts`,
  `app/api/brain/orchestrate/apply/route.ts`, `lib/agency/esteira/marcos.ts`,
  `lib/agency/esteira/pedidos.ts`, `lib/agency/esteira/trafego.ts`,
  `lib/agency/execution/create-project-from-request.ts`. Determinado apenas
  que `git merge-tree` os lista como conflito de conteúdo.
- **~64 dos 84 arquivos do #153** não tiveram a existência na base checada
  individualmente (amostrei 20, dirigido a segurança). A maioria é
  `__tests__/*` novo, `docs/entregas/*.png` (prova de trabalho, não código) e
  `scripts/*` — risco de compilação baixo, mas não confirmado.
- **`docs/pendencias.md` no #153:** medi que o PR EDITA linhas (183 del), não
  só anexa — mas não confirmei se a base editou as MESMAS linhas desde então.
  Fica como risco nomeado, não veredito de conflito real fechado.
- **`app/api/portal/vista/route.ts` e `app/api/social-posts/route.ts` no
  #153:** confirmei que a base tocou os dois (2 e 3 commits), mas não abri o
  conteúdo desses commits para nomear o que cada lado ganhou.
- **Não rodei `npx tsc --noEmit`** — recusado pelo sandbox
  ("This command requires approval", igual para `gh pr view`/`gh api`, e
  igual em execuções anteriores registradas em `.fichas/como-julgar.md`).
  Toda a checagem de "compila" acima é análise estática manual, símbolo a
  símbolo, nos pontos que julguei de maior risco — não é uma compilação real.
- **Não reexecutei `git merge-tree`** para os três PRs — usei os números já
  medidos em `.fichas/fato-153.txt`, `fato-161.txt`, `fato-162.txt`
  (`exit=1` e a lista de arquivos) e cruzei com `git diff`/`git log` próprios
  para caracterizar textual vs. semântico.
- **`gh pr view`/`gh api`** foram recusados pelo sandbox para os três PRs —
  não confirmei via API do GitHub o `mergeable_state` "oficial" nem a base
  declarada tal como o GitHub a exibe. Usei o head→base que a própria ficha
  já tinha ("#161 → deploy", "#162 → branch do #161") e confirmei
  independentemente via `git merge-base` entre os refs locais, que bate.
- **Se existem outros consumidores de `EXECUTORES`/`EXECUTORES_DE_SAIDA`**
  além dos que grepei — busquei só por esses dois nomes exatos; um
  consumidor por import indireto (re-export) não apareceria no grep textual.

---

# LOTE C — #136, #158, #159 · despachado ao especialista `esteira`

## Lote C — veredito de #136, #158, #159

> Despacho: PM → `esteira`. Base de deploy =
> `origin/claude/dioli-agency-os-architecture-kk7kp`. Vocabulário e método:
> `.fichas/como-julgar.md`. Precedente citado: `.fichas/forense-383.md`.
> **Nenhum merge, nenhum comentário em PR, nenhuma escrita fora deste arquivo.**
> `git merge-tree`, `npx tsc`, `git commit/merge/checkout` recusados neste
> ambiente ("This command requires approval") — usei `git diff`/`git show`/
> `git log`/`git cat-file`/`git merge-base --is-ancestor`, que são o que a
> própria ficha ensina como método quando `merge-tree` não roda. Os
> `exit`/saída de `merge-tree` que aparecem abaixo vêm de `.fichas/fato-*.txt`,
> já medidos pelo PM antes deste despacho — não os re-executei.

**Base declarada, confirmada nos três (não só no que a ficha `fato-*` deu):**
os três merge-base (`58497272`, `6d0df063`, `a9bd36c9`) aparecem no
`git log --first-parent` da própria branch de deploy como commits de merge
mainline — ou seja, os três PRs nasceram diretamente da branch de deploy, não
empilhados sobre outro PR aberto (o defeito que #163/#168 tinham em
`forense-383.md`). Não consegui confirmar isso pela API do GitHub (`gh pr
view` recusado — "This command requires approval"); a confirmação é só por
ancestralidade de git, o que a ficha aceita como método quando o comando
principal falha, mas registro a divergência de fonte.

---

## PR #136 — "Publica Central de Trabalho aprovada com tipografia legível"

**1. O que o PR faz, em uma frase de negócio:** guarda, dentro de `docs/`, o
protótipo estático (HTML/CSS/React autônomo, com `package.json` próprio) que
foi **aprovado pelo CEO em 14/08/2026** como o desenho de referência do
dashboard interno da agência — não é tela do produto, é a especificação
visual que deveria virar uma.

**2. Base declarada:** branch de deploy, confirmado (`58497272`, merge
mainline de 15/08 — ver acima). Sem conflito mecânico (`merge-tree` exit=0 no
fato do PM).

**3. Compila contra o deploy de hoje?** Risco baixo, não 100% confirmado por
mim: o `tsconfig.json` da base inclui `**/*.tsx`/`**/*.ts` **sem excluir
`docs/`**, então `docs/prototipos/central-de-trabalho/app/{page,layout}.tsx`
entrariam no `tsc --noEmit` da casa. Li os dois arquivos: usam só `next`
(`Metadata`) e hooks do React (`useState`, `useMemo`), sem `@/` nem módulo
específico do app — nenhuma dependência que o root não tenha. **Não rodei
`tsc`** (comando recusado neste despacho); PM confirma antes do veredito virar
ação.

**4. O que quebra ao mesclar:** nada, mecanicamente — 7 arquivos novos, zero
edição em arquivo existente, `git merge-tree` deu `exit=0`.

**5. O que o PR traz que a base ainda não tem:** nada — é exatamente esse o
achado. Os 4 SVGs de marca (`public/brand/dioli-mark-navy.svg`,
`dioli-logo-h-white.svg`) e o desenho do `page.tsx` **já existem** na base sob
outro caminho (ver item 6).

**6. O que já foi resolvido MELHOR na base — a prova, linha por linha:**
- `git ls-tree` confirma: a base já tem `public/brand/dioli-mark-navy.svg` e
  `public/brand/dioli-logo-h-white.svg` — os MESMOS dois SVGs que o PR traz.
- A base tem `components/agency/central/CentralDeTrabalho.tsx` (667 linhas) e
  `app/agency/dashboard/central.css`, criados em `a56800d0`
  ("Central de Trabalho em /agency/dashboard, com dado real e sete estados",
  **15/08/2026 04:13 UTC** — 1h32 **depois** do último commit do PR,
  `2b94049d`, 15/08 02:41 UTC) e refinados no mesmo dia em `caba3018`
  ("a barra de cima da Central sai — pedido do CEO, 15/08/2026").
- **O cabeçalho do arquivo real diz isto com todas as letras:**
  `components/agency/central/CentralDeTrabalho.tsx:3` — *"O desenho é o do PR
  #136, aprovado pelo CEO em 14/08/2026. Ele NÃO se reabre: hierarquia,
  densidade, componentes e tamanho de letra são contrato."* — e lista,
  linha a linha, exatamente o que o `README.md` do PR pedia como "destino de
  implementação": dado real em vez de demonstrativo, `AgencyShell` no lugar da
  casca duplicada, os sete estados que um protótipo não precisa ter. O
  `README.md` do próprio PR (`docs/prototipos/central-de-trabalho/README.md`)
  diz: *"A tela oficial da plataforma vive em `/agency/dashboard`"* — e é lá
  que ela está, feita a partir dele.
- Busquei `"central-de-trabalho"` em toda a árvore da base: as duas únicas
  ocorrências são os arquivos de produção citados acima. Nada referencia a
  pasta `docs/prototipos/central-de-trabalho/` do PR.

**7. Recomendação: MORTO.** Fechar. **Consequência declarada:** perde-se um
protótipo estático de referência (355 linhas, sem importador, sem link de
volta na base) cujo conteúdo **já foi implementado, aprovado e está em
produção** sob outro caminho. Nada de código de produto se perde.

---

## PR #158 — "O card de aprovação não mostra ao cliente o que a agência pagou" + "cliente único por nome"

**1. O que o PR faz, em uma frase de negócio:** duas coisas empacotadas num só
commit — **(a)** para de mostrar ao cliente, no card de aprovação, o custo em
dólar de cada agente e o rastro técnico da esteira assistida; **(b)** impede
que o mesmo cliente (ex.: "City Jobs" vs. "city jobs") vire dois cadastros na
rota do piloto assistido, com uma trava de banco.

**2. Base declarada:** branch de deploy, confirmado (`6d0df063`, merge
mainline de 15/08). Conflito mecânico real: `merge-tree` (fato do PM) deu
`exit=1` em 4 arquivos.

**3. Compila contra o deploy de hoje?** A parte (a) — sim, provavelmente
(aditiva pura: dois arquivos novos + import novo em
`app/api/v2/assistido/route.ts`, sem tocar tipo existente). A parte (b) —
**provavelmente sim, mecanicamente** (o campo `nameKey String?` é aditivo ao
`schema.prisma`, e a migration desempata duplicata antes de criar o índice
único — não vi risco de tipo). **O problema de (b) não é de compilação — é de
decisão**, ver item 6. Não rodei `tsc`; PM confirma.

**4. O que quebra ao mesclar — nomeado, arquivo por arquivo:**
- `docs/decisoes.md`: **textual.** O PR insere 78 linhas logo após o
  cabeçalho; a base também cresceu por inserção no mesmo ponto (o arquivo
  recebeu commits contínuos desde então). Resolve-se pela ordem cronológica,
  sem perda de nenhum lado — mesmo padrão do #163/#165/#166 em
  `forense-383.md`.
- `__tests__/plataforma/indices-do-despertador.test.ts`: **textual, mas preso
  ao mecanismo em disputa.** Os dois lados adicionam, ao MESMO array
  `for (const i of [...])`, o nome do índice novo que cada um criou:
  `"Client_workspaceId_email_idx"` (base, 16/08) e
  `"Client_workspaceId_nameKey_key"` (PR). É união de lista — textual — mas só
  faz sentido reconciliar se o índice `nameKey` do PR for de fato mesclado
  (ver item 6, é aí que mora o problema real).
- `lib/generated/prisma/internal/class.ts`: **mecânico.** Arquivo gerado
  (`/* !!! This is code generated by Prisma. Do not edit directly. !!! */`).
  O conflito é o schema inline duplicado; resolve-se rodando
  `npx prisma generate` depois de decidir o schema, nunca editando à mão —
  mesmo padrão do #166 em `forense-383.md`.
- `prisma/schema.prisma`: **semântico, e é o ponto central.** Não é conflito
  de posição — é DOIS DESENHOS DIFERENTES para o mesmo problema (identidade de
  cliente), ver item 6.

**5. O que o PR traz que a base ainda não tem — confirmado com
`git cat-file -e`:**
- `lib/agency/esteira-assistida/card-do-cliente.ts`,
  `lib/agency/esteira/pericia-do-vazamento.ts`,
  `lib/agency/esteira/vazamento-ao-cliente.ts`,
  `app/api/admin/pericia-do-piloto-assistido/route.ts`: **os quatro não
  existem na base.** É a metade (a) do PR.
- `exigirTextoLimpo` (dentro de `vazamento-ao-cliente.ts`), chamado por
  `lib/agency/persistence/approval-service.ts` em `createApprovalRequest`, é
  uma **trava no caminho de escrita**, não um aviso: todo `reviewNote` com
  `clientVisible: true` passa por ela, não só o da rota assistida.
- 🔴 **A metade (a) corrige um vazamento que está VIVO na base, hoje.**
  Confirmado lendo `app/api/v2/assistido/route.ts:218-226` na base: a
  `reviewNote` do card de aprovação (com `clientVisible: true`) ainda é
  montada como `` `${departamentoId}/${funcaoId}: ${decisao} ($${custoUsd})` ``
  para cada passo do ciclo — custo de IA em dólar, por agente. E
  `components/portal/AprovacoesDoCliente.tsx:112-139` renderiza
  `ap.reviewNote` **direto** na tela do cliente no portal. O caminho inteiro,
  do dado ao pixel, está confirmado.
- `lib/agency/clients/chave-do-nome.ts`, `duplicados.ts`,
  `garantir-cliente.ts`: **não existem na base.** É a metade (b).

**6. O que já foi resolvido MELHOR na base — e uma correção séria à
hipótese que a ficha me deu:**
A ficha pediu para eu conferir se a base já resolveu a dedup de cliente "por
outro caminho" e, se sim, declarar essa metade MORTA. **O que encontrei é mais
sério que isso.**

A base **tem**, sim, uma dedup de cliente — `chave-do-prospect.ts` +
`cliente-do-briefing.ts` (`resolverOuCriarCliente`), do commit `4cbba4b7`
("Mesmo contato, cinco briefings: um cadastro, não cinco", **16/08/2026, um
dia depois** do commit único do PR, `8f6c83b7`, 15/08 21:05 UTC) — mas ela
resolve um problema **diferente** (briefing público, casado por e-mail/telefone
normalizados), não o do PR (rota interna do piloto assistido, casada por
nome). Então essa metade não é redundante por sobreposição de escopo.

**O que É sério: o commit `4cbba4b7` registra, com "DECISÕES DE PROJETO"
explícitas, exatamente o desenho que o PR usa — e o rejeita, por nome:**

> *"NOME NUNCA VIRA CHAVE. Dois homônimos podem ser duas pessoas, e fundir por
> homonímia entrega o portal de um cliente a outro — dano pior e
> irreversível."*
> *"CONTINUA `create`, NUNCA `upsert`. Perder o que o cliente escreveu é pior
> que ter duplicata."*
> *"ÍNDICES NÃO-ÚNICOS. `@@unique` faria o segundo pedido legítimo FALHAR na
> gravação (a prisão que o Diretor vetou)."*

`lib/agency/clients/chave-do-nome.ts` no PR faz exatamente o oposto das três:
`garantirClientePorNome` (`garantir-cliente.ts`) primeiro **procura** um
cliente existente por nome fuzzy (`chaveDeReconhecimento`, que derruba tudo
que não é letra/número — "CityJobs" encontra "City Jobs") e **reusa** o que
achar sem confirmação humana — é um `upsert` por identidade de nome, ponto por
ponto o que o commit de um dia depois proíbe. E `prisma/schema.prisma` do PR
declara `@@unique([workspaceId, nameKey])` — a restrição única por nome que a
base decidiu explicitamente não fazer, pelo mesmo motivo de risco (a rota é
diferente — assistido/interna, não o formulário público — o que reduz a
exposição, mas o texto da decisão não se limita ao briefing, é escrito como
regra geral do projeto).

**Divirjo, então, da minha própria pista inicial:** não é "essa metade é
MORTO porque já foi resolvida". É **"essa metade reabre, num código novo, o
exato mecanismo que a casa decidiu por escrito não fazer, um dia depois de
escrita"** — o mesmo padrão do #167 em `forense-383.md` (reabre
`plano("crescimento")`, que o CEO tinha acabado de descontinuar), só que aqui
o defeito não é de tipo, é de arquitetura registrada.

**7. Recomendação: PODRE**, pela metade (b) —
`lib/agency/clients/chave-do-nome.ts`, `garantir-cliente.ts`,
`prisma/schema.prisma` (campo `nameKey` + `@@unique([workspaceId, nameKey])`)
e a migration `20260815220000_cliente_unico_por_nome`. Mesclar como está bota
em produção o mecanismo (upsert por nome fuzzy) que a "DECISÕES DE PROJETO" de
`4cbba4b7` proíbe, com uma linha registrada dizendo isso.

**Consequência declarada:** fechar o PR inteiro como está perde, junto com o
mecanismo ruim, uma correção real e ainda viva — o vazamento de custo interno
na tela do cliente (item 5, confirmado hoje na base). **Recomendo salvar por
cópia**, como o precedente do #167 fez: abrir PR novo só com
`card-do-cliente.ts`, `pericia-do-vazamento.ts`, `vazamento-ao-cliente.ts`, o
recorte de `approval-service.ts`/`assistido/route.ts` que separa
`reviewNote` (cliente) de `addApprovalComment` (equipe) — **sem** tocar
`chave-do-nome.ts`, `garantir-cliente.ts` nem o schema. O bug do "City Jobs
duplicado" continua real e sem conserto — mas o conserto certo é outro: seguir
o padrão que `4cbba4b7` já validou (achar por identidade forte quando houver,
nunca fundir automático por nome, e registrar para decisão humana quando
houver ambiguidade), não copiar a versão vetada.

---

## PR #159 — "Quadro do CEO 15/08: fonte única de preço, logo e régua de marca, e a fila que se cobra"

**1. O que o PR faz, em uma frase de negócio:** um pacote de 6 correções
comerciais/operacionais de 15/08/2026 — preço lido de uma fonte só (não
redigitado), o "R$ 0" que a proposta renegociada podia cotar ao cliente sem
escopo, o link de aviso ao cliente que abre 403, um segundo canal de aviso por
e-mail, um portão que barra peça de marca não constituída de chegar ao
cliente pela escada, e a extensão de dados para a fila de "aprovação parada"
poder cobrar por cliente.

**2. Base declarada:** branch de deploy, confirmado (`a9bd36c9`, merge
mainline de 15/08 — o mesmo merge-base do #163, #165–168 em
`forense-383.md`). Conflito mecânico real em 3 dos 34 arquivos (`merge-tree`
exit=1 no fato do PM).

**3. Compila contra o deploy de hoje?** **NÃO, com defeito nomeado.** Ver
item 6 — `lib/agency/comercial/negociacao.ts` chama
`mensalidadeDoPlano("crescimento")`, e essa função é
`(id: (typeof PLANOS)[number]["id"]) => number`. Lendo `lib/agency/planos.ts`
na base: `Plano["id"]` é `"pulso" | "ritmo" | "presenca" | "conteudo"` —
`"crescimento"` não é membro do tipo. É erro de tipo por construção
(`TS2345`), e o mesmo objeto `TABELA_DE_PISO` (tipado
`Record<ItemNegociavel, LinhaDaTabela>`) ganha uma chave `crescimento` que
`ItemNegociavel` — também lido na base — não contém mais. Não rodei `tsc`
(recusado), mas a leitura estática dos dois tipos, lado a lado, é o mesmo
método que achou o defeito idêntico do #167 em `forense-383.md`.

**4. O que quebra ao mesclar — nomeado, arquivo por arquivo:**
- `lib/agency/comercial/negociacao.ts`: **semântico + defeito ativo** (ver
  item 3 e 6). A base **também** reescreveu este arquivo desde o merge-base
  (`f31dce62`, "A tabela de preços é uma só — fechada, e agora derivada",
  26/08) para ler `cheio`/`piso` de `PLANOS`/`SELF_SERVE_CATALOG` por uma
  função `planosNegociaveis()` diferente da do PR — os dois lados resolveram o
  MESMO problema ("preço copiado à mão") de formas incompatíveis, e a do PR
  carrega o defeito extra do plano morto.
- `lib/agency/escada/registro.ts`: **semântico real.** A base, em
  `26a674a3`/`c275634c` (16–17/08), acrescentou ao MESMO laço `for (const
  entrega of p.entregas)` uma checagem própria (`decisaoLibera`, decisão do
  dono que cobre a escada). O PR acrescenta, no mesmo laço, o portão de marca
  (`portaoDeMarca`/`ehPecaDeMarca`). Escolher um lado no merge perde a checagem
  do outro — é união de duas evoluções, não escolha.
- `lib/agency/esteira/avisos.ts`: **a base já resolveu a MESMA ideia melhor —
  mas com um furo que sobrevive nas duas versões.** A base, em `a241d14c`
  (27/08, #362), já implementa "WhatsApp primeiro, e-mail como rede debaixo,
  fila manual por último" **dentro do próprio arquivo** (`tentarEmail`), com a
  mesma lógica de canal tri-estado que o PR propõe via `canal-de-email.ts`
  externo. Essa parte do PR é **MORTA por redundância** — a casa já entregou
  e-mail como segundo canal, de forma mais integrada, 12 dias depois do PR.
  🔴 **Mas o `link` que os dois usam — o da base HOJE e o que o PR corrige —
  é o mesmo bug, e só o PR o resolve:** ver item 6.

**5. O que o PR traz que a base ainda não tem — confirmado com
`git cat-file -e`:**
- `lib/agency/esteira/link-do-portal-do-cliente.ts`,
  `lib/agency/esteira/prazo-de-aprovacao.ts`,
  `lib/agency/esteira/cobranca-de-aprovacao.ts`: não existem na base.
- `lib/agency/esteira/aprovacao-parada.ts` **já existe** na base (134 linhas,
  criado por outro caminho) mas — confirmado em `forense-383.md` — **sem
  chamador de produção nenhum**, só o teste dele. O PR **acrescenta** (sem
  conflito, nenhum commit da base tocou o arquivo desde o merge-base) os
  campos `clientId`, `clientRequestId`, `abertoEm`, `titulo` — exatamente o
  que falta para uma fila de cobrança (`cobranca-de-aprovacao.ts`) poder
  endereçar o card a alguém. É a peça que destrava o achado do #168 em
  `forense-383.md` ("o alarme está construído, testado e mudo").
- `lib/agency/execution/negotiate-proposal.ts`: **muda, sem conflito, um bug
  real e sem substituto na base.** Confirmado: `computeEstimate({})` sem
  escopo devolve `{ totalMin: 0, totalMax: 0 }`, e o piso da negociação virava
  `0` — qualquer valor acima de zero que o modelo sugerisse passava pela
  guarda `newTotal >= floor`. O PR troca o piso por `Infinity` quando não há
  orçamento calculável e impede o card de cotar "R$ 0 a R$ 0/mês" com "é só
  aprovar aqui embaixo". Busquei `podeCotar`/`totalMax > 0` em
  `negotiate-proposal.ts` na base: **nenhuma ocorrência** — o bug segue vivo.
- `lib/agency/self-serve-catalog.ts` (`COLISAO_DE_PRECO_COM_PLANO`): sem
  conflito. O teste que este bloco corrige,
  `__tests__/comercial/preco-uma-fonte-so.test.ts:123` na base **hoje**,
  ainda compara `s.label === plano.nome` — comparação por RÓTULO, o mesmo
  furo que deixou um item de balcão de R$ 297 (preço e escopo idênticos ao
  plano Ritmo) passar pelo portão. Não superado.
- `lib/agency/esteira/contrato-de-marca.ts` (`portaoDeMarca`,
  `ehPecaDeMarca`): a base tem `contrato-de-marca.ts`, mas **sem** essas duas
  funções — busquei `portaoDeMarca`/`ehPecaDeMarca` em toda a árvore da base:
  zero ocorrências. O portão de marca da base só existe no caminho de
  publicação no Instagram (`publicacao.ts:765`); a porta da escada
  (`escadaFiltraEntregas`, o que vira visível no portal do cliente) segue sem
  checar marca — o PR fecha essa segunda porta.

**6. O que já foi resolvido MELHOR na base:**
- `lib/agency/comercial/negociacao.ts` — a leitura de preço "de uma fonte só"
  (avulsos do `SELF_SERVE_CATALOG`, planos de `PLANOS`) já foi feita, melhor
  estruturada (`avulsoDoBalcao`, `planosNegociaveis`), em `f31dce62` (26/08).
- `lib/agency/esteira/avisos.ts` — "e-mail como segundo canal" já foi
  entregue, integrado ao arquivo, em `a241d14c` (27/08).
- 🔴 **E o achado que nenhuma das duas versões da base resolveu:** tanto o
  WhatsApp quanto o e-mail, HOJE, montam o link de aviso a partir de
  `Client.portalToken` (`lib/agency/esteira/avisos.ts:49,189` na base —
  `linkDoPortal(cliente.portalToken)`). Confirmado lendo
  `lib/agency/persistence/portal-access-service.ts`: `validatePortalAccess`
  procura o token em `prisma.portalAccess`, **uma tabela e um token
  diferentes**, gerados por `createPortalAccess` com `randomBytes(32)` — nada
  no repositório copia um valor no outro. **Todo aviso automático que esta
  casa manda — WhatsApp e, desde 27/08, e-mail — carrega um link que
  `validatePortalAccess` recusa.** Isto não é do PR: é um furo vivo na base
  hoje, que o PR nomeou em 15/08 e corrigiu (`link-do-portal-do-cliente.ts`)
  antes até de a base criar o segundo canal que herdou o mesmo furo.
- **Reabertura confirmada, com a linha exata:** `crescimento` foi removido de
  `ItemNegociavel` em `lib/agency/comercial/negociacao.ts` por decisão datada
  — o comentário da própria base diz *"`crescimento` saiu em 26/08/2026,
  junto com o degrau — não se negocia o que não se vende"*. O PR, escrito
  15/08, reintroduz a chave `crescimento` em `TABELA_DE_PISO` com
  `cheio: mensalidadeDoPlano("crescimento")` e `piso: 2190`.

**7. Recomendação: PODRE**, pelo motivo que a própria ficha antecipou
("Se o #159 reintroduzir preço morto, plano morto ou desconto morto: PODRE, e
diga qual linha") — `lib/agency/comercial/negociacao.ts`, a entrada
`crescimento` em `TABELA_DE_PISO` (e a função `mensalidadeDoPlano` quando
chamada com esse id), reabre um plano que a base descontinuou por decisão
datada 26/08, e não compila contra `Plano["id"]`/`ItemNegociavel` de hoje.

**Consequência declarada:** fechar o PR como está, sem salvar nada, perde
**três correções reais e vivas, sem substituto na base**:
`link-do-portal-do-cliente.ts` (o link de aviso 403, que a base ainda carrega
até no canal novo de e-mail), o guardrail de `negotiate-proposal.ts`
(proposta que cota R$ 0 ao cliente) e o portão de marca na escada
(`contrato-de-marca.ts` + `escada/registro.ts`, segunda porta sem checagem).
**Recomendo o mesmo salvamento por cópia do #158**: abrir PR novo com
`link-do-portal-do-cliente.ts`, o guardrail de `negotiate-proposal.ts`
(sem conflito, mescla direto), `prazo-de-aprovacao.ts` +
`cobranca-de-aprovacao.ts` + os 4 campos novos de `aprovacao-parada.ts`, a
declaração `COLISAO_DE_PRECO_COM_PLANO`, e o portão de marca — reconciliando
`escada/registro.ts` à mão (união dos dois blocos no mesmo laço) — **sem**
tocar `negociacao.ts` nem trazer de volta `canal-de-email.ts` (redundante com
o que a base já tem em `avisos.ts`; se algo for aproveitado dali, é só o
diagnóstico do link morto, já coberto por `link-do-portal-do-cliente.ts`).

---

## Tabela-resumo do lote

| PR | Base declarada | Veredito | Consequência declarada |
|---|---|---|---|
| **#136** | branch de deploy (confirmado) | **MORTO** | Fechar. Perde-se um protótipo estático de referência sem importador — o desenho dele já foi implementado, aprovado e está em produção em `components/agency/central/CentralDeTrabalho.tsx`, que cita o PR no próprio cabeçalho. |
| **#158** | branch de deploy (confirmado) | **PODRE** (pela metade "cliente único por nome") | `chave-do-nome.ts`/`garantir-cliente.ts`/`schema.prisma` (`nameKey` + `@@unique`) reabrem, num código novo, o exato mecanismo (fusão por nome, upsert) que a "DECISÕES DE PROJETO" de `4cbba4b7` (16/08) proíbe por escrito. A metade "custo vazando ao cliente" é real, viva na base hoje (`assistido/route.ts:218-226` → `AprovacoesDoCliente.tsx`) e **sem substituto** — recomendo salvar por cópia. |
| **#159** | branch de deploy (confirmado) | **PODRE** (pela reintrodução do plano `crescimento`) | `negociacao.ts` não compila contra `Plano["id"]`/`ItemNegociavel` de hoje e desfaz a decisão datada 26/08 que descontinuou o plano. Fechar sem salvar perde 3 correções vivas e sem substituto: link de aviso 403 (ainda quebrado até no canal de e-mail que a base criou depois), guardrail de proposta que cota R$ 0, e o portão de marca na escada — recomendo salvar por cópia, deixando `negociacao.ts` e `canal-de-email.ts` de fora. |

---

## O que já está resolvido MELHOR na base — lista consolidada, arquivo por arquivo

1. **#136 inteiro** — `components/agency/central/CentralDeTrabalho.tsx` +
   `app/agency/dashboard/central.css` implementam, com dado real e sete
   estados, o mesmo desenho que o PR guardava como protótipo estático.
2. **#158, metade dedup** — a identidade de cliente por e-mail/telefone
   (`lib/agency/clients/chave-do-prospect.ts`,
   `lib/agency/clients/cliente-do-briefing.ts`, commit `4cbba4b7`) resolve um
   problema vizinho ao do PR com um desenho que a própria base documentou
   como mais seguro (nunca funde por nome, sempre `create` + revisão humana).
3. **#159, `lib/agency/comercial/negociacao.ts`** — a leitura de preço "de uma
   fonte só" (`avulsoDoBalcao`, `planosNegociaveis`, commit `f31dce62`, 26/08)
   já existe, melhor organizada, sem o plano morto.
4. **#159, `lib/agency/esteira/avisos.ts`** — o segundo canal por e-mail
   (`tentarEmail`, commit `a241d14c`, 27/08) já está em produção, integrado ao
   arquivo, mais maduro que o `canal-de-email.ts` externo do PR.

---

## Furos vivos na base que nomeei e não consertei

1. 🔴 **`lib/agency/esteira/avisos.ts:49,189`** (base, hoje) — o link que vai
   no aviso ao cliente (WhatsApp e, desde 27/08, e-mail) é montado com
   `linkDoPortal(cliente.portalToken)`, e `portalToken` é um campo do
   `Client` que **nenhuma rota de validação de portal lê**.
   `validatePortalAccess` (`lib/agency/persistence/portal-access-service.ts:43`)
   procura o token em `prisma.portalAccess`, uma tabela e um valor diferentes
   (gerado por `randomBytes(32)`, não o `cuid` default do `Client`). Todo
   aviso automático que a casa manda hoje carrega um link que a própria casa
   recusaria. Conserto já existe, pronto, em
   `lib/agency/esteira/link-do-portal-do-cliente.ts` do #159.
2. **`app/api/v2/assistido/route.ts:218-226`** (base, hoje) — o `reviewNote`
   do card de aprovação da esteira assistida, com `clientVisible: true`,
   ainda embute o custo em dólar de cada agente por passo do ciclo, e
   `components/portal/AprovacoesDoCliente.tsx:112-139` renderiza esse texto
   direto na tela do cliente. Conserto já existe, pronto, na metade "custo"
   do #158.
3. **`__tests__/comercial/preco-uma-fonte-so.test.ts:123`** (base, hoje) — o
   portão que deveria impedir um item de balcão de coincidir em preço com a
   mensalidade de um plano compara só o RÓTULO (`s.label === plano.nome`),
   não o preço — um item com o preço exato de um plano passa reto. Conserto
   (comparação por preço + `COLISAO_DE_PRECO_COM_PLANO` declarada) já existe,
   pronto, no #159.
4. **`lib/agency/execution/negotiate-proposal.ts`** (base, hoje) — sem
   `podeCotar`/piso `Infinity`: uma renegociação sem escopo calculável ainda
   pode gerar um card dizendo "Total: R$ 0 a R$ 0 / mês" + "é só aprovar aqui
   embaixo". Conserto já existe, pronto, no #159.
5. **`lib/agency/escada/registro.ts`** (base, hoje) — `escadaFiltraEntregas`
   não pergunta nada sobre marca antes de deixar uma peça de Design/Social
   virar `visibility: "compartilhado"` no portal; o único portão de marca da
   base protege a publicação no Instagram (`publicacao.ts:765`), não esta
   porta. Conserto já existe, pronto (precisa reconciliar com
   `decisaoLibera`), no #159.

Nenhum destes cinco foi consertado por mim nesta rodada — nomeação, não
conserto, conforme a regra da casa.

---

## O que eu NÃO determinei

- **Se `docs/prototipos/central-de-trabalho/{page,layout}.tsx` (#136)
  realmente compilam sob o `tsc --noEmit` da casa.** Li os imports (só `next`
  e React, nada de `@/`) e não achei risco óbvio, mas não rodei o comando —
  recusado neste despacho ("This command requires approval"). PM confirma.
- **Se `lib/agency/clients/chave-do-nome.ts` (#158) compila mecanicamente.**
  Não achei erro de tipo lendo o arquivo, mas não rodei `tsc`. O veredito
  PODRE que dei é por decisão de arquitetura registrada, não por erro de
  compilação — os dois são achados diferentes e não quero confundi-los.
- **Se a API do GitHub confirma a base declarada dos três PRs** (`gh pr
  view` foi recusado: "This command requires approval"). A confirmação que
  dei é só por ancestralidade de git (os três merge-base aparecem no
  `--first-parent` da branch de deploy) — é evidência forte, mas não é a
  mesma fonte que `forense-383.md` usou para pegar #163/#168 apontando para
  outro PR.
- **`app/api/v2/assistido/route.ts` fora da janela `POST/ligar`.** Li só o
  trecho que #158 toca (achar-ou-criar cliente e o card de aprovação); não
  auditei o resto do arquivo (o `POST/ciclo`) atrás de outros vazamentos.
- **O restante dos 34 arquivos do #159 que não tiveram conflito listado**
  (`docs/comercial/preco-lado-a-lado-15-08.md` e os `__tests__/*` novos, por
  exemplo) — confirmei que mesclam sem choque de texto (não estão na lista de
  `merge-tree`), mas não abri cada um linha a linha atrás de conteúdo morto
  próprio. O que abri e citei acima (negociacao.ts, escada/registro.ts,
  avisos.ts, self-serve-catalog.ts, negotiate-proposal.ts,
  link-do-portal-do-cliente.ts, aprovacao-parada.ts, contrato-de-marca.ts)
  está determinado com comando colado; o resto, não.
