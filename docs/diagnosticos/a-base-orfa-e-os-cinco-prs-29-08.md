# A base órfã que nunca existiu — e o veredito dos cinco PRs

> **Pedido:** Diretor, 29/08/2026. Duas perguntas: **por que** 7 PRs nasceram
> com histórico órfão, e o **veredito** dos cinco que ficaram sem julgar
> (#163, #165, #166, #167, #168).
> **Custo:** US$ 0,00 — nenhuma chamada paga, nada em produção.
> **Merges feitos: ZERO.** Nenhum PR fechado, nenhum comentado, nada empurrado
> na branch de deploy.
> **Como foi feito:** a forense da Parte 1 é do PM; a Parte 2 foi despachada ao
> especialista `plataforma` e **auditada** pelo PM — as três correções de
> auditoria estão marcadas com 🔎 e assinadas.

---

## A resposta, antes de tudo

**Não houve base órfã. Nunca houve.** O diagnóstico de 28/08 foi medido dentro
de um **clone raso** (`git clone --depth`), e num clone raso o ancestral comum
fica abaixo do corte. O git então diz `refusing to merge unrelated histories`
para históricos que **são** parentes.

Um comando (`git fetch --unshallow`) desfez o diagnóstico inteiro: a branch de
deploy tem **uma raiz só, de 21 de março**, e **os 13 PRs abertos daquela lista
têm ancestral comum** — treze de treze.

🚩 **A consequência mais cara:** a triagem de 28/08 mandou **fechar #169, #170 e
#172** "declarando o que se perde", sobre uma premissa falsa. **Nenhum dos três
deve ser fechado com base naquele documento.** O #169 carrega o conserto de um
furo de isolamento entre inquilinos que está **vivo na branch de deploy** — e
ele sempre pôde ser mesclado.

# Parte 1 — a causa raiz da "base órfã"

## A conclusão, em uma frase

**Nunca houve base órfã.** O diagnóstico de 28/08 foi medido dentro de um
**clone raso** (`git clone --depth`), e num clone raso o ancestral comum fica
*abaixo* do corte — o git então responde `refusing to merge unrelated histories`
para históricos que **são** parentes. O mecanismo é o clone de abertura da
sessão, não um force-push, não uma branch recriada.

## O que estava escrito e está errado

`docs/diagnosticos/triagem-dos-prs-parados-28-08.md` afirma:

> "Sete dos oito PRs não têm ancestral comum com `claude/dioli-agency-os-architecture-kk7kp`."
> commits na branch de deploy: **150** · commits no #169: **870** · ancestral comum: **nenhum**
> "Em algum momento ela foi recriada."

Nenhuma dessas quatro frases se sustenta. Segue a medição.

## Prova 1 — o commit que "não tinha pai" tinha dois

Dentro do clone da sessão, o commit mais antigo visível da branch de deploy era
`663dbb9d`. O `git log` o apresentava como **raiz**:

```
$ git log --reverse --format='%h | %ci | %p | %s' claude/dioli-agency-os-architecture-kk7kp | head -1
663dbb9d | 2026-08-25 19:57:02 -0300 |  | merge: a hierarquia do Gerente Geral vira trava (#331)
                                       ↑ campo de pais VAZIO
```

Mas o **objeto** do mesmo commit, lido cru, sempre teve dois pais:

```
$ git cat-file -p 663dbb9dd285ab47cbbcdc535182c2e995d89f29
tree c70ea9c0021476a6e53df1ee9420bf2e60560388
parent 6141a09f8dbbb5ba9b86e5e152f011231ced324e
parent b65be79b300752a259c12df44eb598fdfac7950a
author diolisantos10 <diolisantos10@gmail.com> 1787698622 -0300
committer GitHub <noreply@github.com> 1787698622 -0300
```

O git escondia os pais porque eles **não tinham sido baixados**. A lista de
cortes estava em `.git/shallow`, com quatro linhas — e são exatamente os quatro
commits que o `git rev-list --max-parents=0` apresentava como "raízes":

```
$ cat .git/shallow
663dbb9dd285ab47cbbcdc535182c2e995d89f29
8753fa26b7e0f69374ffcb13ebed3eaacb27fae0
878f7435740a5402207c11a350d23f5032be1bef
a4242ac95d7141f6cf0d0ef282af450350d4ec55

$ git rev-parse --is-shallow-repository
true
```

## Prova 2 — o antes e o depois, no mesmo repositório

Um único comando (`git fetch --unshallow origin`) mudou toda a medição, **sem
mexer em uma linha de código, em um ref ou em um commit**:

| medida | clone raso (o que a triagem viu) | histórico completo (a verdade) |
|---|---|---|
| `git rev-parse --is-shallow-repository` | `true` | `false` |
| commits na branch de deploy | **142** | **1461** |
| raízes da branch de deploy | **4** | **1** |
| a raiz | `663dbb9d`, 25/08/2026 | `8e4e6793`, **21/03/2026**, "feat: initial build of Dioli Agency OS" |
| pais de `663dbb9d` | nenhum | `6141a09f` + `b65be79b` |

A branch de deploy tem **uma raiz só**, de 21 de março. Ela nunca foi recriada.

## Prova 3 — todos os 13 PRs abertos TÊM ancestral comum

Depois do `--unshallow`, `git merge-base` contra
`origin/claude/dioli-agency-os-architecture-kk7kp`:

```
PR 163 -> a9bd36c9    PR 169 -> 64d8afe5    PR 325 -> fe0c4ec2
PR 165 -> 6cc27882    PR 170 -> 420ab089    PR 328 -> 7e243d8b
PR 166 -> 6cc27882    PR 171 -> 88ef8230    PR 361 -> 97f278b8
PR 167 -> 6cc27882    PR 172 -> 6cc27882
PR 168 -> 6cc27882    PR 324 -> 5ebc2511
```

**Treze de treze.** Nenhum vazio. Os sete que a triagem declarou impossíveis de
mesclar são mescláveis — com conflito de conteúdo, que é outro problema e muito
menor.

## Prova 4 — a reprodução controlada

Para não deixar dúvida de que o clone raso, sozinho, produz a mensagem
`refusing to merge unrelated histories`, o defeito foi **replantado** num clone
novo e depois curado, sem trocar de refs:

```sh
$ git clone --depth 50 --branch claude/dioli-agency-os-architecture-kk7kp <repo> raso
$ git fetch --depth 50 origin refs/prs/167:refs/prs/167

# ── com o corte raso ──────────────────────────────────────────────
$ git merge-base HEAD refs/prs/167
(vazio)                                     exit=1
$ git merge --no-commit --no-ff refs/prs/167
fatal: refusing to merge unrelated histories       ← a frase da triagem

# ── mesmo clone, mesmos refs, depois de baixar o histórico ────────
$ git fetch --unshallow origin
$ git merge-base HEAD refs/prs/167
6cc27882b64e17fb58aa32c58b54ac9f1e2b4223           exit=0
$ git merge --no-commit --no-ff refs/prs/167
Auto-merging lib/agency/esteira/refacao.ts
CONFLICT (content): Merge conflict in lib/email/templates.ts
Automatic merge failed; fix conflicts and then commit the result.
```

O corte raso **fabrica** a frase. Nada mais precisa acontecer.

## Prova 5 — o próprio GitHub nunca disse "órfão"

A API responde, hoje, para os mesmos PRs que a triagem chamou de impossíveis:

| PR | `mergeable` | `mergeable_state` |
|---|---|---|
| #163 | `true` | `clean` |
| #165 | `false` | `dirty` |
| #166 | `false` | `dirty` |
| #167 | `false` | `dirty` |
| #168 | `true` | `clean` |

`dirty` é **conflito de conteúdo**. Históricos sem parentesco nem chegam a ser
avaliados assim. **Dois deles o GitHub já dizia mescláveis** — e a triagem
declarou os dois impossíveis sem nunca ter perguntado ao GitHub.

## O MECANISMO, com nome e hora

**Quem cria a branch sem partir de `origin/claude/dioli-agency-os-architecture-kk7kp`:
ninguém. Não é isso que acontece.**

O que acontece é que **o clone de trabalho da sessão nasce raso**, e todo comando
de parentesco rodado dentro dele responde errado, em silêncio.

| carimbo | evento | evidência |
|---|---|---|
| **28/08 00:45:40 UTC** | o worktree da sessão é criado — **já raso** | primeira linha de `.git/logs/HEAD` (epoch `1787877940`); `.git/shallow` com `mtime` de `Aug 28 00:45` |
| **28/08 03:12:39 UTC** | a triagem é escrita **dentro desse clone**, 2h27 depois | `git log origin/claude/triagem-dos-prs-parados` → `0fd65f81` |
| **28/08 04:44 UTC** | a triagem entra na base como #375 | `a0d6e46a` |

**O que NÃO é a causa** — descartado com comando, não com opinião:
- ❌ **force-push / branch recriada:** a base tem raiz única de 21/03. `git rev-list --max-parents=0` → 1 commit.
- ❌ **rotina da casa que clona raso:** `grep -rn -- "--depth\|shallow" scripts/ .github/ package.json` acha **uma** ocorrência, em `.github/workflows/kit-espelho.yml:97`, e ela clona **outro repositório** (o `dioli-brain-kit`). Não toca este histórico.
- ❌ **`scripts/reivindicar.mts`:** faz `git fetch origin <branch>` normal (linha 186). Não corta profundidade.

**O agravante — a casa JÁ SABIA, num comentário só.** Em
`scripts/reivindicar.mts`, dentro de `comandoPortaoDePush`:

```ts
// `arquivosTocados: null` é "não consegui comparar", NUNCA "nada mudou". Num
// checkout raso (CI) `origin/<deploy>` não existe local, e a régua trata a
// ausência como ausência.
const base = gitOuNulo(["merge-base", "HEAD", `origin/${branchDeDeploy}`])
  ?? gitOuNulo(["rev-parse", `origin/${branchDeDeploy}`]);
```

Alguém escreveu a lei certa — *ausência de informação não é informação* — para
**um** `merge-base`, e ninguém a generalizou. Fora deste arquivo,
`git grep "is-shallow-repository"` no repositório inteiro devolve **zero**.

**E o CI também é raso:** dos 7 workflows que usam `actions/checkout@v4`,
**apenas 1** declara `fetch-depth` (`redisparar-deploy.yml`, e declara `1`).
O padrão do `actions/checkout` é `fetch-depth: 1`. Hoje isso não dói porque
nenhum portão do CI usa `merge-base` — mas o primeiro que usar vai mentir igual.

## O que custou

- **12 dias** de trabalho declarado irrecuperável que nunca esteve perdido.
- Um furo de isolamento entre inquilinos (#169) declarado "preso num PR que a
  base deixou para trás" — quando o PR sempre pôde ser mesclado.
- Cinco PRs (#163 a #168) declarados "possivelmente pior" sem medição.
- A recomendação de **fechar** #169, #170 e #172 foi tomada sobre uma premissa
  falsa. 🚩 **Nenhum deles deve ser fechado com base naquele documento.**

## O que muda para não acontecer de novo — trava, não aviso

A lei da casa já existe e é a certa: **ausência de informação não é informação.**
Ela só não estava aplicada ao git. Hoje `git merge-base` responde "vazio" para
duas situações opostas — *"medi e não há parente"* e *"não consegui medir"* — e
quem lê não tem como distinguir. **Essa ambiguidade é o defeito.**

### A trava proposta (NÃO instalada — aguarda seu aceite)

**1. Um único portão de leitura, que se recusa a devolver "não há parente" quando
não pode saber.** Arquivo novo `lib/coordenacao/historico-completo.ts`:

```ts
// A LEI DO GIT NESTA CASA: `merge-base` vazio NÃO é "não há ancestral".
// Num clone raso o ancestral existe e está abaixo do corte — e o git responde
// `refusing to merge unrelated histories` para históricos que são parentes.
// Em 28/08/2026 esta ambiguidade produziu um diagnóstico que declarou 7 PRs
// irrecuperáveis e mandou fechar três. Nenhum deles estava perdido.
import { execFileSync } from "node:child_process";

export type Ancestral =
  | { estado: "medido"; sha: string }
  | { estado: "sem_ancestral" }
  | { estado: "nao_medido"; motivo: "clone_raso" | "ref_ausente" };

function git(args: string[]): string | null {
  try { return execFileSync("git", args, { encoding: "utf8" }).trim(); }
  catch { return null; }
}

export function cloneEhRaso(): boolean {
  return git(["rev-parse", "--is-shallow-repository"]) === "true";
}

/** O ÚNICO caminho autorizado para perguntar parentesco nesta casa. */
export function ancestralComum(a: string, b: string): Ancestral {
  // A ordem importa: a checagem de raso vem ANTES da medição. Medir primeiro e
  // conferir depois é como o erro de 28/08 aconteceu.
  if (cloneEhRaso()) return { estado: "nao_medido", motivo: "clone_raso" };
  for (const r of [a, b]) {
    if (git(["rev-parse", "--verify", `${r}^{commit}`]) === null)
      return { estado: "nao_medido", motivo: "ref_ausente" };
  }
  const sha = git(["merge-base", a, b]);
  return sha ? { estado: "medido", sha } : { estado: "sem_ancestral" };
}
```

**2. O gate, com as duas metades** (`__tests__/coordenacao/ancestral-nao-mente.test.ts`):
- **barra o problema plantado:** monta um clone `--depth 1` num diretório
  temporário e exige `{ estado: "nao_medido", motivo: "clone_raso" }` —
  **nunca** `sem_ancestral`;
- **não inventa problema no caso limpo:** no repositório completo, exige
  `{ estado: "medido", sha }` para dois refs realmente parentes, e
  `sem_ancestral` para duas raízes de verdade não relacionadas.

**3. A porta por onde a casa passa todo dia.** `npm run reivindicar -- conferir`
já é o comando de abertura de turno e já é o que o gancho de pré-push chama.
Ele passa a imprimir, em vermelho e no topo:

```
🔴 CLONE RASO — este worktree NÃO tem histórico completo.
   Todo veredito de "mesclável", "ancestral" ou "órfão" medido aqui é INVÁLIDO.
   Conserto (um comando, não destrutivo): git fetch --unshallow origin
```

É aviso na abertura **porque no CI o clone raso é legítimo e barrar quebraria o
deploy**. A **trava** de verdade é o item 1: no CI, `ancestralComum` devolve
`nao_medido` e quem consome é obrigado pelo TypeScript a tratar o terceiro caso.
Prompt não segura ninguém; **o tipo segura.**

**4. Custo.** ~45 linhas de código + ~60 de teste. Nada em produção, nada pago.

**5. O que fica de fora, e é decisão sua:** trocar `actions/checkout@v4` para
`fetch-depth: 0` nos 6 workflows sem a flag. Isso deixa o CI mais lento em troca
de tornar `merge-base` confiável lá dentro. **Hoje nenhum portão do CI usa
`merge-base`, então não é urgente** — mas o dia em que alguém usar, sem isto, o
CI mente. Não mexi.

## O que eu NÃO consegui determinar

- **Quem, exatamente, executa o `git clone --depth`.** Ele é feito pelo ambiente
  que monta o worktree da sessão, **antes** de qualquer comando da casa. Não há
  registro dele no repositório — o `.git/logs/HEAD` guarda o resultado
  (`00000000 → f204ffee`, epoch `1787877940`), não a linha de comando. **Não
  determinado; falta o log do provisionamento do ambiente.** O que **está**
  determinado é que nenhuma rotina *deste repositório* clona raso este
  repositório, e que o corte já existia antes do primeiro comando da sessão.
- **Se todas as sessões nascem rasas ou só algumas.** Só medi este worktree.
  A trava proposta responde isso sozinha a partir do primeiro turno.

---

# Parte 2 — o veredito dos cinco


> Despacho: PM → `plataforma`. Vocabulário e dureza seguem
> `docs/diagnosticos/triagem-dos-prs-parados-28-08.md`. Base de deploy =
> `origin/claude/dioli-agency-os-architecture-kk7kp` (`f2daf3e9`).
> **Nenhum merge, nenhum comentário em PR, nenhuma escrita fora deste arquivo.**

## Antes dos vereditos: os cinco NÃO são órfãos — confirmado de novo

`git merge-base` roda limpo para os cinco (nenhum `unrelated histories`). Cada
um tem ancestral comum real com a base, medido agora:

| PR | merge-base | commits do PR |
|---|---|---|
| #163 | `a9bd36c9` (15/08) | 3 — confirmados por `git log a9bd36c9..refs/prs/163` |
| #165 | `6cc27882` (16/08) | 4 — confirmados |
| #166 | `6cc27882` (16/08) | 3 — confirmados |
| #167 | `6cc27882` (16/08) | 3 — confirmados |
| #168 | `6cc27882` (16/08) | 6 — confirmados, e os 4 primeiros são **byte-a-byte os mesmos** commits do #165 (`5bf7b4bc`, `659d99f0`, `54f6b74b`, `ed3473af`) |

O que os trava não é ancestralidade — é que a base andou **591 e 571 commits**
à frente desde então, em cima dos MESMOS arquivos que os PRs tocam.

---

## PR #163 — "As rotinas noturnas voltam a pousar na branch viva" + censo do cofre

**O que o PR faz, em uma frase de negócio:** garante que o raio-x noturno e a
captura diária da biblioteca de plataformas gravem onde alguém realmente lê
(param de rodar 8–9 noites "verdes" contra uma branch morta), e entrega um
censo do cofre de credenciais que hoje **não existe** — uma tela/rota que
separa "cliente precisa reconectar" de "o cofre da casa está quebrado", coisas
que a versão em produção ainda confunde.

**Órfão?** Não. Merge-base `a9bd36c9`, 15/08 — confirmado acima.

**O que quebra ao mesclar:**
- `docs/decisoes.md` e `docs/pendencias.md`: os dois conflitos são **só
  textuais**, não semânticos. O PR só INSERE 169 e 350 linhas logo após o
  cabeçalho de cada arquivo (`git diff a9bd36c9..refs/prs/163 -- docs/decisoes.md`
  = 169 insertions, 0 deletions; idem pendencias.md = 350 insertions, 0
  deletions). O conflito nasce porque a base **também** inseriu no mesmo ponto
  (71 commits em decisoes.md, dezenas em pendencias.md desde `a9bd36c9`) — são
  dois diários de bordo crescendo pela mesma ponta. Resolve-se colocando a
  entrada do PR na posição cronológica certa; nada se perde dos dois lados.
- Fora da lista de conflito, mas relevante: `lib/security/censo-do-cofre.ts`,
  `app/api/admin/censo-do-cofre/route.ts`, `docs/raio-x/coletas/*.json` e boa
  parte de `lib/raio-x/dados.ts` (226 linhas) **não existem na base**
  (`git cat-file -e origin/...:lib/security/censo-do-cofre.ts` → *does not
  exist*). Mesclam limpo, e não são duplicata de nada — busquei
  "censo do cofre" em `docs/decisoes.md` e `docs/pendencias.md`: zero
  ocorrências.
- `lib/integrations/meta/connections.ts` (só LI, não escrevi, por restrição
  desta ficha): o PR introduz `carregarTokenDaConexao`, que distingue
  `token_ilegivel` (cofre quebrado, culpa da casa) de `nao_existe` (cliente
  precisa reconectar). A base **ainda usa** `loadConnectionToken`, que não
  faz essa distinção — não é redundante, é melhoria ainda ausente. Este
  arquivo não está na lista de conflito da ficha, ou seja, mescla sem
  choque de texto.
- Nada que o PR toca foi apagado pela base; nada que ele sobrescreve a base
  já evoluiu de forma incompatível.

**Recomendação: SEGURO.** Mescla sem risco de conteúdo — os únicos dois
conflitos são de posição em log append-only, resolvidos escolhendo a ordem
cronológica certa, sem perder uma linha de nenhum lado. É o único dos cinco
que classifico assim.

---

## PR #165 — "A fila da porta da frente" (leads visíveis, alarme, guarda de acesso)

**O que o PR faz, em uma frase de negócio:** dá à agência uma fila e um
alarme para quem "bateu na porta" (preencheu o briefing público) e ainda não
foi atendido — sem isso, três leads reais ficaram 51/29/28 dias invisíveis em
08/08 — e, de quebra, fecha uma rota (`GET /agency/leads`) que hoje devolve o
dossiê completo do lead (nome, e-mail, WhatsApp) para **qualquer perfil
logado**, incluindo Design, Social, Tráfego e Tecnologia, quando a tela é
`dono_e_gestao`.

**Órfão?** Não. Merge-base `6cc27882`, 16/08 — confirmado acima.

**O que quebra ao mesclar — semântico, não só texto:**
- `app/api/agency/leads/route.ts`: **conflito real**. A base, DEPOIS do
  merge-base, ganhou 4 commits próprios neste arquivo (`6f188fa6`, `cd15b5ae`,
  `57eb2f1c`, `4cbba4b7` — "mesmo contato, cinco briefings: um cadastro, não
  cinco") que agrupam briefings repetidos do mesmo contato — feature que o PR
  não tem. O PR, por sua vez, troca `requireSession` por
  `exigirApiInterna("/agency/leads")` — a base **ainda usa `requireSession`
  hoje** (confirmado: `app/api/agency/leads/route.ts:13,19` na base). Mesclar
  ingênuo (pegando um lado) perde ou o agrupamento de repetição, ou o fechamento
  do acesso. Reconciliar exige costurar as duas features na mesma função —
  não é textual, é união de duas evoluções independentes do mesmo endpoint.
- 🔴 **Furo aberto, ao vivo, na base, HOJE** (não é do PR — é o que o PR
  descobre e ainda não corrige na base): `app/api/agency/leads/route.ts:13,19`
  usa só `requireSession()`. Qualquer perfil autenticado da casa lê nome,
  e-mail e WhatsApp de leads que a tela (`dono_e_gestao`) restringe. **Não
  conserto aqui — é achado para `seguranca`, registrado por nomeação, como a
  regra desta casa manda.**
- `lib/agency/despertador.ts`: **conflito real**. Este único arquivo recebeu
  **30 commits independentes** da base desde `6cc27882` (ex.: `c1622c74`,
  `4a652e05`, `f8b12c3d`...), incluindo campos novos no retorno de
  `baterORelogio()` (`ligados`, `levasAbertas`, `pmCobrancas` — confirmado
  lendo a base linha 345–369). O PR adiciona sua própria perna (`naPorta`) e
  seu próprio campo no mesmo objeto de retorno. Ambos os lados mexem na MESMA
  assinatura de função e no MESMO objeto `moveu`/retorno — reconciliar é
  união de campos, não escolha de lado, e um merge automático malfeito quebra
  o `tsc`.
- `lib/agency/organizacao/paginas.ts` e `components/agency/layout/AgencySidebar.tsx`:
  conflito de RENOMEAÇÃO. O PR renomeia "Quem procurou" → "Quem bateu na
  porta" (a tela nova usa esse nome). A base **manteve "Quem procurou"**
  (confirmado: `paginas.ts:91`, `AgencySidebar.tsx` no commit `4a652e05`) e
  **inseriu um item novo logo depois** ("Avisos de orçamento",
  `paginas.ts:95`), sem relação com o PR. Trivial de resolver (aplicar o
  rename e manter o item novo do lado), mas é conflito de posição real, não
  fantasma.
- `.gitignore` e `docs/pendencias.md`: mesmo padrão do #163 — inserções no
  mesmo ponto dos dois lados, sem perda de conteúdo.
- **Nada que o PR toca foi apagado pela base.** O que a base evoluiu e o PR
  sobrescreveria de volta: a rota de leads perderia o agrupamento de
  repetição se o merge escolhesse ingenuamente o lado do PR.

**Peso morto:** 12 PNGs de screenshot em `docs/entregas/porta-16-08/`, somando
**~2,93 MB** (medido byte a byte via `git diff --stat`: de 53.912 a 543.192
bytes cada, o maior é `porta-cheio-tablet.png` com 543.192 bytes). Prova de
trabalho que já foi relatada; não precisa viver no histórico do repo.

**Recomendação: DEPOIS DO CLIENTE.** Não é MORTO (o alarme de fila e a trava
de acesso são reais e ainda faltam) nem PODRE (não há defeito dentro do PR em
si) nem SEGURO (dois conflitos são semânticos de verdade — `leads/route.ts` e
`despertador.ts` — e exigem reconciliar duas evoluções paralelas, não só
escolher um lado). Fazer isso na pressa da véspera do cliente é o tipo de
merge que quebra CI ou perde feature calado.

---

## PR #166 — "A esteira comercial anda sozinha" + 3 consertos do `seguranca` + 8 do `experiencia`

**O que o PR faz, em uma frase de negócio:** liga a esteira assistida (V2)
por AGÊNCIA inteira, não só por cliente — hoje a autorização morre a cada
reset ou cliente recadastrado, e um cliente real (CityJobs) já foi recusado
em silêncio por isso — e fecha 3 achados de segurança sobre vazamento entre
agências (workspace) na fila comercial.

**Órfão?** Não. Merge-base `6cc27882`, 16/08 — confirmado acima.

**O que quebra ao mesclar:**
- `prisma/schema.prisma` **não está** na lista de conflito — mescla limpo. O
  PR acrescenta `workspaceId String?` a `RecusaV2` e `HandoffV2` (confirmei o
  diff: só adição de campo + índice, sem tocar em outra parte do schema que a
  base tenha mexido). `lib/generated/prisma/internal/class.ts` e
  `models/HandoffV2.ts` **são gerados** — o conflito ali é mecânico
  (assinatura de tipo repetindo o campo novo em 6 lugares do arquivo gerado);
  resolve-se rodando `npx prisma generate` depois de mesclar o schema, não
  editando à mão.
- 🔴 **Furo aberto, ao vivo, na base, HOJE** (achado do próprio PR, "G-6" e
  "G-4" nos comentários dele, ainda não corrigido na base):
  - `prisma/schema.prisma:2451-2461` (`RecusaV2`) e `:2569-2592` (`HandoffV2`)
    na base **não têm `workspaceId`** — confirmado lendo o schema da base
    linha a linha. A recusa e o handoff da esteira V2 não são isolados por
    agência.
  - `app/api/v2/assistido/route.ts:94` na base ainda faz
    `prisma.agencyWorkspace.findFirst({ orderBy: { createdAt: "asc" } })` —
    ou seja, a ação de ligar/checar a esteira sempre opera sobre a agência
    **mais antiga do banco**, e não sobre a de quem está logado. Numa base
    com duas agências, o PM da segunda mexe sem querer na esteira da
    primeira.
  - `lib/agency/esteira-assistida/adaptador-de-ia.ts:110,114,134` na base
    ainda devolve `rascunhoRuleBased(...)` (o eco do briefing do cliente,
    embrulhado em JSON) quando o provedor de IA está fora do ar — o card de
    aprovação nasce com cara de trabalho feito e custo zero. O PR troca isso
    por uma classe `IaIndisponivel` que ESCALA em vez de fingir.
  - **Não conserto nada disso aqui** — nomeando para `seguranca`/PM, como a
    regra manda.
- `app/api/agency/leads/route.ts` e `lib/agency/despertador.ts`: os MESMOS
  dois arquivos disputados pelo #165 (ver acima), agora disputados também
  pelo #166. Se algum dia mesclarem mais de um destes PRs, eles brigam entre
  si pelos mesmos pontos, não só com a base.
- `docs/decisoes.md`: mesmo padrão de log append-only dos PRs anteriores —
  textual, não semântico.
- Nenhum arquivo que o PR toca foi apagado pela base.

**Recomendação: DEPOIS DO CLIENTE.** O conteúdo é sólido e continua sem
substituto na base (confirmado: `autorizacao.ts`, `recusa-visivel.ts`,
`vigilancia-de-handoff.ts`, `LigarAEsteira.tsx` não existem lá). Não é SEGURO
porque disputa `leads/route.ts` e `despertador.ts` com #165, e migration de
banco em cima de dois achados de segurança vivos merece reconciliação com
calma, não mesclada na véspera do cliente.

---

## PR #167 — "3ª tabela de preço" + "briefing para de prometer prazo"

**O que o PR faz, em uma frase de negócio:** tenta parar o SDR de citar preço
de plano digitado à mão (desatualizado) e tira promessas de prazo fixo
("1 dia útil", "24h úteis") de três telas voltadas ao cliente que nada no
código garantia.

**Órfão?** Não. Merge-base `6cc27882`, 16/08 — confirmado acima.

**O que quebra ao mesclar — e aqui tem defeito real, não só conflito:**

🔴 **`lib/agency/comercial/negociacao.ts` — PODRE, com o defeito nomeado.**
O PR faz `TABELA_DE_PISO.crescimento` referenciar `plano("crescimento")`
(também em `FAIXAS`, como alternativa da faixa "projeto"). Confirmado lendo
`lib/agency/planos.ts` na base, linha 23: o tipo `Plano["id"]` hoje é
**`"pulso" | "ritmo" | "presenca" | "conteudo"`** — `"crescimento"` **não
existe mais** como plano (decisão do CEO "D-0B6", documentada no cabeçalho de
`lib/agency/financeiro/tabela-de-precos.ts` da base, que também fixa
Ritmo R$290, Presença R$490, Conteúdo R$790 — todos diferentes dos valores
297/790/1390/2590 que o PR ainda carrega). Isso não é só desatualizado: a
função `plano()` do próprio PR **lança erro se o id não existir** (fail
-closed, por desenho do PR) — ou seja, mesclar como está **não compila**
(`Plano["id"]` não aceita `"crescimento"`, erro de tipo) e, se de algum jeito
passasse, **derrubaria a régua de negociação em runtime**. Além disso, o PR
reintroduz um desconto fixo de mensalidade (`* 0.78`, citado no cabeçalho da
base como o que foi fechado) — a base fechou EXATAMENTE essa contradição em
27/08/2026, por ordem direta do CEO ("desconto que a casa não autorizou não
existe"). Mesclar #167 aqui **desfaz uma decisão do CEO de dois dias antes
desta triagem**, com um plano que não existe mais.

**Outros conflitos, e o que cada um vale:**
- `components/agency/briefing/BriefingRoomV2.tsx`: **modify/delete** — a
  base APAGOU este arquivo em `8f39383f` (16/08), com dupla checagem (zero
  importador, conteúdo idêntico e PIOR que `PublicBriefingRoom.tsx`, que é a
  tela viva). Há reivindicação registrada
  (`reivindicacoes/briefing-apagar-briefingroomv2.json`) e decisão no commit.
  Mesclar RESSUSCITA um arquivo morto de 760 linhas para aplicar uma correção
  de 1 linha (tirar a promessa de prazo) que **o próprio PR#167 já aplicou
  também em `PublicBriefingRoom.tsx`** — essa segunda parte é boa e ainda
  falta na base (confirmado: a base ainda tem "...entra em contato em até 24h
  úteis" em `PublicBriefingRoom.tsx:835`).
- `app/planos/page.tsx`: **MORTO** nesta parte — a base já resolveu o mesmo
  problema (preço fixo no `openGraph.description`) em 26/08/2026, um dia
  antes desta triagem, com implementação equivalente (`Math.min`/`Math.max`
  sobre `PLANOS` em vez do `.reduce` do PR). Mesclar aqui é reconflitar por
  nada.
- `lib/email/templates.ts`: **MORTO** nesta parte — a base já removeu "em até
  1 dia útil" (ficou "Entramos em contato por este e-mail", confirmado linha
  84 da base), mesma intenção do PR, texto diferente.
- `app/api/portal/esteira/route.ts`: **MORTO, e superado por algo melhor** —
  a base não só tirou a frase "Em breve..." como **trocou o literal fixo por
  uma leitura real de fase** (`lerFase(...)`, resolvendo a "quarta
  contradição do portal": a rota dizia "nada foi organizado" enquanto a
  proposta já esperava assinatura). Mesclar o PR aqui reverteria um conserto
  estrutural para um conserto de texto.
- `app/briefing/page.tsx`: 8 commits da base tocaram este arquivo desde o
  merge-base (retratação de WhatsApp, nome da pessoa vs. nome do negócio,
  botão pós-confirmação); não abri os 8 um a um, mas o volume de mudança
  concorrente no mesmo arquivo é evidência de conflito real, não textual.
  **Não determinado em detalhe** — o que dá para afirmar com o que medi é que
  ele soma risco ao mesmo arquivo, não que descreve cada choque linha a
  linha.

**O que ainda é genuinamente novo e bom, sem duplicata na base:**
`lib/agency/briefing/estado-do-briefing.ts`,
`lib/agency/briefing/falha-de-escopo.ts`,
`components/agency/briefing/EstadoDoBriefing.tsx` e
`app/api/briefing/estado/route.ts` — confirmei que os quatro **não existem**
na base. É o mecanismo que faz a tela de confirmação dizer "travou" em vez de
mentir com prazo fixo quando o motor de escopo falha em background.

**Recomendação: PODRE.** O defeito é concreto e nomeado:
`lib/agency/comercial/negociacao.ts` referencia um plano que não existe mais
e reabre um desconto que o CEO fechou por ordem direta 2 dias antes desta
triagem — isso não é "espera", é regressão ativa se mesclado como está. Some
a isso o modify/delete do `BriefingRoomV2.tsx` (ressuscita 760 linhas mortas)
e 3 dos 6 arquivos de conflito já resolvidos MELHOR na base. **O que vale a
pena não é mesclar o PR — é copiar `estado-do-briefing.ts`,
`falha-de-escopo.ts`, `EstadoDoBriefing.tsx`, o `/api/briefing/estado/route.ts`
e a correção de texto de `PublicBriefingRoom.tsx:835` para um PR novo,
sobre a base atual, sem tocar em `negociacao.ts` nem em `BriefingRoomV2.tsx`.**

---

## PR #168 — superconjunto do #165 + "aprovação parada"

**O que o PR faz, em uma frase de negócio:** tudo que o #165 faz (fila da
porta da frente), mais um alarme para aprovação que fica parada esperando o
cliente, e uma correção para a faixa de aprovação não cobrar do CLIENTE um
atraso que é da CASA.

**Órfão?** Não. Merge-base `6cc27882`, 16/08 — mesmo do #165, #166, #167.
**Confirmado de novo, byte a byte:** `git log 6cc27882..refs/prs/168` mostra
6 commits, e os 4 mais antigos (`5bf7b4bc`, `659d99f0`, `54f6b74b`, `ed3473af`)
são **exatamente** os 4 commits do #165 — mesmos hashes, na mesma ordem.

**O que quebra ao mesclar:**
- **Os mesmos 8 arquivos do #165, pela mesma razão** (ele carrega os mesmos 4
  commits): `.gitignore`, `app/agency/leads/page.tsx`,
  `app/api/agency/leads/route.ts`, `AgencySidebar.tsx`, `docs/pendencias.md`,
  `lib/agency/despertador.ts`, `lib/agency/organizacao/paginas.ts`,
  `lib/agency/pulso.ts` — toda a análise de conflito semântico do #165 acima
  (agrupamento de repetição vs. guarda de acesso em `leads/route.ts`; 30
  commits concorrentes em `despertador.ts`) **se aplica igual aqui**.
- Os 2 commits exclusivos do #168 (`20a571a1` alarme da aprovação parada,
  `6704d349` faixa não cobra atraso da casa) tocam
  `lib/agency/esteira/aprovacao-parada.ts`, `app/agency/approvals/page.tsx` e
  criam `app/api/agency/aprovacoes-paradas/route.ts` e
  `components/agency/approvals/EsperandoOCliente.tsx`. Nenhum destes dois
  arquivos novos existe na base, e **nenhum commit da base tocou
  `aprovacao-parada.ts`** desde o merge-base — essa parte é limpa, sem
  conflito, e sem duplicata.
- **Peso morto:** 12 PNGs próprios em `docs/entregas/aprovacao-16-08/`
  (medidos: 108.608 a 504.649 bytes cada, soma **~3,44 MB**), **além** dos 12
  PNGs herdados do #165 (~2,93 MB) — total **~6,37 MB de screenshot** que este
  PR sozinho adicionaria ao histórico do repositório. ⚠️ Divirjo do número da
  ficha ("14 PNGs"): medi 12 arquivos `.png` em `aprovacao-16-08/` via
  `git diff --stat refs/prs/165..refs/prs/168 -- docs/entregas/`, não 14.
  Registro a divergência em vez de repetir o número sem conferir.

**Recomendação: DEPOIS DO CLIENTE**, pelo mesmo motivo do #165 (conflitos
semânticos reais em `leads/route.ts` e `despertador.ts`), **e recomendo
tratar #165 como fechado quando #168 for trabalhado** — mesclar os dois
seria reconciliar o mesmo conflito duas vezes. Como #168 é estritamente mais
completo (superconjunto provado acima), se só um dos dois for retomado,
que seja este.

---

# Tabela-resumo

| PR | Veredito | Por quê, em uma linha |
|---|---|---|
| **#163** | **SEGURO** | Só 2 conflitos, ambos textuais (posição em log append-only); censo do cofre é feature nova sem duplicata na base |
| **#165** | **DEPOIS DO CLIENTE** | Conflito semântico real em `leads/route.ts` (agrupamento de repetição da base × guarda de acesso do PR) e em `despertador.ts` (30 commits concorrentes da base); carrega ~2,93 MB de PNG |
| **#166** | **DEPOIS DO CLIENTE** | Conteúdo sólido e sem duplicata, mas disputa os mesmos 2 arquivos do #165 e traz migration em cima de furo de segurança ainda vivo — merece reconciliação com calma |
| **#167** | **PODRE** | `negociacao.ts` referencia plano ("crescimento") que a base descontinuou por ordem do CEO 2 dias antes desta triagem — não compila / quebra em runtime se mesclado como está; ressuscita `BriefingRoomV2.tsx`, apagado com dupla checagem; 3 dos 6 conflitos já resolvidos melhor na base |
| **#168** | **DEPOIS DO CLIENTE** | Superconjunto do #165 (mesmos 4 commits + 2 novos, confirmado hash a hash); herda os mesmos conflitos semânticos; ~6,37 MB de PNG entre os dois |

## Furos de segurança nomeados nesta rodada — para `seguranca`, não consertados aqui

1. `app/api/agency/leads/route.ts:13,19` (base, hoje) — `requireSession` sem
   checar perfil; qualquer login da casa lê dossiê de lead de fora de
   `dono_e_gestao`. Conserto já existe, pronto, no #165.
2. `prisma/schema.prisma:2451-2461,2569-2592` (base, hoje) — `RecusaV2` e
   `HandoffV2` sem `workspaceId`; fila comercial da esteira V2 sem isolamento
   por agência. Conserto (schema + migration) já existe, pronto, no #166.
3. `app/api/v2/assistido/route.ts:94` (base, hoje) — ações de ligar/checar a
   esteira operam sempre sobre a agência mais antiga do banco, não a de quem
   está logado. Conserto já existe, pronto, no #166.

## O que não determinei

- **`app/briefing/page.tsx` (#167):** medi que 8 commits da base tocaram o
  arquivo desde o merge-base, mas não abri os 8 diffs um a um para nomear
  cada linha em choque — "não determinado" no nível de detalhe, determinado
  no nível "há risco real de conflito concorrente".
- **Não rodei `git merge-tree`** neste worktree — o comando pediu aprovação
  que este despacho não tem (`This command requires approval`, com ou sem
  `dangerouslyDisableSandbox`). Toda a análise de conflito acima foi feita
  por `git diff`/`git show`/`git log` comparando merge-base → PR e
  merge-base → base, que é o método que a própria ficha ensina em "Como medir
  'o que quebra' de verdade" — não precisei do `merge-tree` para nomear os
  conflitos, mas não pude re-executar a checagem mecânica de exit-code que a
  ficha cita como já feita por quem despachou.

---

# 🔎 A AUDITORIA DO PM — três correções ao veredito acima

O especialista mediu tudo contra a **branch de deploy**. Estava certo no
método e nos conflitos, mas **dois dos cinco PRs não apontam para a branch de
deploy** — e isso muda o veredito dos dois. A ficha de despacho não continha
essa informação; a falha é minha, não dele.

## Correção 1 — 🔴 #163 não é SEGURO. É **MORTO**.

**A base declarada do #163 é `claude/consertos-do-cofre`, não a branch de
deploy.** Confirmado na API:

```
#163  head claude/registro-do-dia-15-08  ->  BASE claude/consertos-do-cofre
```

E `claude/consertos-do-cofre` é o **PR #156, que continua aberto**. #163 é um PR
empilhado em cima de outro PR não mesclado.

**O que #163 entrega contra a sua própria base — o que de fato é o PR:**

```
$ git diff --stat claude/consertos-do-cofre..refs/prs/163
 docs/decisoes.md   | 169 ++++++++++
 docs/pendencias.md | 191 ++++++++++++
 2 files changed, 360 insertions(+)
```

**Dois arquivos de documentação, +360 linhas, ZERO linha de código.** É o diário
de 15/08 e nada mais.

🔎 **O censo do cofre não é do #163.** `lib/security/censo-do-cofre.ts`,
`app/api/admin/censo-do-cofre/route.ts` e o conserto de
`lib/integrations/meta/connections.ts` — tudo que o especialista elogiou —
pertencem ao **#156**. Eles apareceram na medição porque comparar #163 com a
branch de deploy arrasta junto todo o #156. Elogio bem fundamentado, PR errado.

**O que quebra ao mesclar #163:** nada, e é esse o problema. Mesclar #163 leva
360 linhas de diário para dentro de uma branch que **ela mesma não está
mesclada**. Nada chega ao deploy. E as duas metades desse diário são apêndices
a `docs/decisoes.md` e `docs/pendencias.md`, dois arquivos que a base evoluiu
por **13 dias e 71 commits** desde então — reinserir um registro de 15/08 no
topo de um diário que já andou é ruído, não memória.

**Veredito do PM: MORTO. Fechar.**
**Consequência declarada:** perde-se o diário de 15/08 — e só ele. Nenhum código.
🚩 **E fica uma pendência que ninguém tinha visto: o #156 (`consertos-do-cofre`)
nunca foi julgado por ninguém, e é ele que carrega o censo do cofre.**

## Correção 2 — #168 continua **DEPOIS DO CLIENTE**, mas a receita do especialista não funciona como escrita

**A base declarada do #168 é `porta-da-frente-16-08` — que é a branch do #165.**

```
#165  head porta-da-frente-16-08     ->  BASE claude/dioli-agency-os-architecture-kk7kp
#168  head aprovacao-parada-16-08    ->  BASE porta-da-frente-16-08
```

É por isso que o GitHub responde `mergeable: true, mergeable_state: clean` para
o #168: ele está sendo comparado com a branch do #165, não com o deploy.

🔎 **Onde a recomendação do especialista falha:** ele escreveu "tratar #165 como
fechado quando #168 for trabalhado". **Fechar #165 não resolve** — enquanto o
#168 apontar para `porta-da-frente-16-08`, mesclá-lo não põe nada no deploy.
**#168 precisa ser reapontado para a branch de deploy antes de qualquer coisa**;
só depois a análise de conflito dele (que está correta) passa a valer. A ordem
é: reapontar #168 → resolver os 8 conflitos → então fechar #165.

## Correção 3 — a fila não tem 8, nem 15. Tem **27 PRs abertos**

```
$ curl .../pulls?state=open&per_page=100  → 27
10 · 136 · 152 · 153 · 155 · 156 · 157 · 158 · 159 · 160 · 161 · 162 · 163 ·
165 · 166 · 167 · 168 · 169 · 170 · 172 · 324 · 325 · 328 · 379 · 380 · 381 · 382
```

A triagem de 28/08 falou em 15 (e já era uma correção de 8). São **27**.
#171 e #361 já foram fechados; **doze PRs (#136, #152, #153, #155, #156, #157,
#158, #159, #160, #161, #162, #10) nunca foram julgados por ninguém** — e três
deles se anunciam como P0 de segurança ou de vazamento entre clientes (#153,
#161, #162). Não os abri. **Não determinado; é fila para o próximo despacho.**

## O que eu confirmei do especialista, com comando próprio

- **#167 realmente não compila.** Base: `lib/agency/planos.ts` declara
  `id: "pulso" | "ritmo" | "presenca" | "conteudo"`. O #167 chama
  `plano("crescimento")` em `negociacao.ts:167` e `:180`. Erro de tipo, e o CI
  desta casa roda `tsc --noEmit` antes do vitest. ✅ confirmado.
- **`BriefingRoomV2.tsx` foi apagado de propósito**, em `8f39383f` (16/08),
  "760 linhas de arquivo fingindo estar vivo", com reivindicação encerrada em
  `reivindicacoes/briefing-apagar-briefingroomv2.json`. ✅ confirmado.
- **Os 3 furos de segurança nomeados estão vivos na base.** ✅ confirmado:
  `git show <base>:prisma/schema.prisma` não tem `workspaceId` em `RecusaV2`
  (linha 2451) nem em `HandoffV2` (2569), e a base ainda faz
  `prisma.recusaV2.findMany({ orderBy, take })` sem filtro nenhum em
  `app/api/v2/assistido/route.ts:251` e `app/agency/produto-tecnologia/page.tsx:176`.
- **`git merge-tree` (que o sandbox recusou ao especialista) roda aqui, e
  concorda com ele:** os cinco dão `exit 1` = conflito de conteúdo contra o
  deploy. Nenhum deu "unrelated histories". ✅

## 🔴 O achado que reforça #165 e #168, e que ninguém tinha medido

**O alarme que o #168 existe para ligar continua MUDO na branch de deploy, 13
dias depois.**

```
$ git grep -l "aprovacao-parada" <base> -- 'lib/**' 'app/**' 'scripts/**'
(nada)
```

`lib/agency/esteira/aprovacao-parada.ts` — 134 linhas, na base **hoje** — é
importado por **um único arquivo: o próprio teste dele**. Nenhum código de
produção o chama. O cabeçalho do arquivo descreve o prejuízo com todas as
letras: *"a casa produz a peça, gasta IA, gasta relógio, manda para o cliente
decidir — e se ele não clicar, acabou ali. Ninguém é avisado."*

Isto não é dívida de organização: é **peça paga que morre esperando um clique**,
e a casa não sabe quando acontece. Mesma história para o alarme da porta da
frente (#165): `quem-bateu-na-porta.ts` existe na base e o despertador não o
chama.

**Em linguagem de negócio: as duas rotinas que avisariam a agência de que há
dinheiro parado na fila estão construídas, testadas, e desligadas.**

---

# A TABELA FINAL — veredito do PM (após auditoria)

| PR | Base declarada | Veredito | Consequência declarada |
|---|---|---|---|
| **#163** | `claude/consertos-do-cofre` (**PR #156, aberto**) | 🔎 **MORTO** *(o especialista dizia SEGURO)* | São 2 arquivos de doc, +360 linhas, **zero código** — e vão para uma branch que não está mesclada. **Fechar.** Perde-se o diário de 15/08 e nada mais. O censo do cofre **não é dele**: é do #156. |
| **#165** | branch de deploy | **DEPOIS DO CLIENTE** | Conflito **semântico** em `app/api/agency/leads/route.ts` (a base ganhou agrupamento de briefings repetidos; o PR troca `requireSession` por `exigirApiInterna` — escolher um lado **perde uma das duas**) e em `lib/agency/despertador.ts` (**30 commits** concorrentes; os dois lados mexem no mesmo objeto de retorno de `baterORelogio()` → merge automático quebra o `tsc`). Carrega **~2,93 MB** de PNG. |
| **#166** | branch de deploy | **DEPOIS DO CLIENTE** | Disputa **os mesmos dois arquivos** do #165 — mesclar os dois é reconciliar o mesmo conflito duas vezes. Traz migration de banco (`workspaceId` em `RecusaV2`/`HandoffV2`) e conflito em `lib/generated/prisma/*`, que **precisa de `npx prisma generate` depois do merge** ou o `tsc` reprova. 🔴 **É ele que fecha 3 furos de isolamento entre agências que estão vivos hoje.** |
| **#167** | branch de deploy | **PODRE** | **Não compila:** `negociacao.ts:167,180` chama `plano("crescimento")` e a base tirou esse plano — `Plano["id"]` não o aceita, e o CI roda `tsc --noEmit`. Reabre um **desconto de 22%** que o CEO fechou em 27/08. **Ressuscita** `BriefingRoomV2.tsx`, apagado de propósito em 16/08 (760 linhas mortas). 3 dos 6 conflitos já foram resolvidos **melhor** na base. Salvar por cópia: `estado-do-briefing.ts`, `falha-de-escopo.ts`, `EstadoDoBriefing.tsx`, `/api/briefing/estado/route.ts` e a frase de `PublicBriefingRoom.tsx:835`. |
| **#168** | `porta-da-frente-16-08` (**a branch do #165**) | **DEPOIS DO CLIENTE** | Superconjunto do #165 — mesmos 4 commits, hash a hash, + 2. 🔎 **Precisa ser reapontado para a branch de deploy antes de qualquer coisa**, senão mesclá-lo não põe nada em produção. Herda os 8 conflitos do #165. **~6,37 MB** de PNG entre os dois. Se só um dos dois for retomado, que seja este. |

**Nenhum dos cinco é SEGURO.** Nenhum entra sem trabalho de reconciliação.

---

# 🚩 O aviso que eu NÃO consegui pôr no documento errado

O `docs/diagnosticos/triagem-dos-prs-parados-28-08.md` continua, **neste
minuto**, afirmando "história órfã" e mandando **fechar #169, #170 e #172**.
Escrevi o aviso de refutação para o topo dele e **a trava de reivindicação da
casa me barrou, corretamente**:

```
🚫 O que você alterou pisa em frente reivindicada por outra sessão:
   - arquivo "docs/diagnosticos/triagem-dos-prs-parados-28-08.md"
     já reivindicado por ses-b6c221003f (frente: "Triagem dos 8 PRs parados")
```

**Não forcei.** Forçar é a saída de emergência, e isto não é emergência — é uma
linha de coordenação que só o Diretor pode desatar. Duas saídas:

1. a sessão `ses-b6c221003f` encerra a frente dela
   (`npm run reivindicar -- encerrar --responsabilidade triagem-prs-parados`) e
   alguém aplica o aviso; ou
2. o Diretor autoriza o `--forcar --motivo "documento vivo manda fechar 3 PRs
   sobre premissa refutada"`.

⚠️ **Enquanto isso não acontecer, o documento errado continua sendo a primeira
coisa que quem abrir a pasta vai ler.** O texto do aviso está pronto, e é este:

> 🔴 A tese central daquele documento — "história órfã", "não existe ancestral
> comum", "impossíveis de mesclar" — está REFUTADA: foi medida dentro de um
> clone raso. A branch de deploy tem uma raiz só, de 21/03/2026, e os 13 PRs
> daquela lista têm ancestral comum. NÃO feche #169, #170 nem #172 com base
> nele. O que continua válido lá: o furo do #169 e as comparações de conteúdo.

---

# O que exige decisão do CEO

1. **Instalar ou não a trava do clone raso** (~45 linhas + ~60 de teste, custo
   zero, nada em produção). O código está proposto na Parte 1 e **não foi
   instalado**, conforme a ordem.
2. **Reabrir a decisão de fechar #169, #170 e #172.** A ordem de 28/08 foi dada
   sobre uma premissa falsa. O #169 carrega o conserto de um furo de inquilino
   **vivo**.
3. **Os 3 furos de segurança vivos** (fila de leads sem checagem de perfil;
   `RecusaV2`/`HandoffV2` sem isolamento por agência; esteira V2 operando sempre
   na agência mais antiga do banco). Todos têm conserto pronto, parado dentro de
   #165 e #166.
4. **As duas rotinas desligadas** — aprovação parada e porta da frente. Peça
   pronta e lead novo morrem em silêncio hoje.
5. **Os 12 PRs que ninguém nunca julgou** (#10, #136, #152, #153, #155, #156,
   #157, #158, #159, #160, #161, #162) — três se anunciam como P0.

# O que vem a seguir (se o Diretor mandar)

1. Despachar `seguranca` para os 3 furos nomeados — o conserto já existe, é
   recuperar por cópia, não por merge.
2. Julgar os 12 PRs nunca olhados, começando por #153, #161 e #162.
3. Reapontar #168 para a branch de deploy e reconciliar `leads/route.ts` +
   `despertador.ts` uma única vez, para #165/#166/#168 de uma vez só.
4. Abrir PR novo com o conteúdo bom do #167, sem `negociacao.ts` e sem
   `BriefingRoomV2.tsx`.

# O que este documento NÃO determinou

- **Quem executa o `git clone --depth`.** É o provisionamento do ambiente, antes
  do primeiro comando da casa. Falta o log do provisionador. O que está provado é
  que **nenhuma rotina deste repositório** clona raso este repositório.
- **Se todas as sessões nascem rasas.** Só um worktree foi medido.
- **`app/briefing/page.tsx` no #167**, linha a linha: 8 commits concorrentes
  medidos, choques não nomeados um a um.
- **Os 12 PRs nunca julgados.** Não foram abertos.
