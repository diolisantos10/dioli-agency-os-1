# O rascunho compartilhado — o que estava quebrado, o que foi construído, e o que não é da alçada deste PR

> **Origem:** ficha `.fichas/ficha-espaco-de-rascunho.md`. Medição e construção
> em 29/08/2026, nesta máquina (`/home/user/dd-rascunho`).
> **Custo desta rodada:** o mecanismo (`lib/rascunho/espaco-da-frente.ts`,
> `scripts/rascunho.mts`, os testes) já estava escrito, auditado e com portão
> verde antes desta rodada começar. Esta rodada só registra por escrito.

---

## 1. A medição

`git worktree list` → **14 worktrees**, um por frente.

Varredura de pastas de rascunho em todos eles:

```
for d in /home/user/diolidigital /home/user/dd-*; do
  for p in .fichas docs/plataformas/meta/_fichas scripts/_tmp _tmp .rascunho; do
    [ -e "$d/$p" ] && echo "EXISTE: $d/$p ($(ls -1 "$d/$p" | wc -l) itens)"
  done
done
```

Resultado: só **duas** existem — `/home/user/diolidigital/.fichas` (8 itens) e
`/home/user/dd-meta/docs/plataformas/meta/_fichas` (1 item). As duas são
**por-worktree**, portanto **não compartilhadas** entre frentes.

Varredura dos scratchpads de sessão:

```
ls -1d /tmp/claude-*/*/*/scratchpad
```

Resultado: **12 diretórios**, no formato
`/tmp/claude-0/<slug-do-cwd>/<CLAUDE_CODE_SESSION_ID>/scratchpad`.
**Onze estão vazios.** Um só — o de slug `-home-user-diolidigital` — tem
**55 arquivos**.

---

## 2. Achado 1 — o caminho compartilhado, e a prova de que é compartilhado

Naquele único diretório convivem rascunhos de frentes DIFERENTES. Atribuição
feita por **conteúdo**, não por nome de arquivo:

- `pr.json` (04:15) cita `"head": "claude/os-consertos-presos"` → frente do
  worktree `/home/user/dd-presos`.
- `body.md` (02:32) cita `claude/varredura-de-posse` → outra frente.
- `prs.md` (04:27) cita `claude/varredura-de-posse` e a branch base.

Nomes genéricos e quase-colidentes no mesmo diretório: `body.md`, `pr-body.md`,
`prbody.md`, `saida.txt`, `saida-qualidade.txt`, `saida-esteira.txt`, `pr.json`.
E o dedo digital da colisão **contornada à mão**: `cdm.bak` e `cdm2.bak`
(mesmo tamanho, 15400 bytes), `reg.bak` e `reg2.bak` (28734 bytes).

**Conclusão:** o Diretor procurou os nomes genéricos em `.fichas/` e não achou
porque eles **nunca estiveram lá** — estão no scratchpad de sessão, que é o
único espaço de rascunho desta casa que não é isolado por frente.

---

## 3. Achado 2 — e este é o mais grave, e NÃO é da alçada deste PR

`CLAUDE_CODE_SESSION_ID` desta máquina vale `1af959ce-bd67-57ba-88f4-2a3b2fbc94d6`.
Esse é **o mesmo valor** para todas as 12 frentes e **também para os subagentes
recém-lançados** — o UUID no caminho do scratchpad é literalmente essa variável.

Consequência que passa longe do rascunho: a identidade de sessão do sistema de
reivindicação (`derivarIdentidade` / `calcularAncoraDeSessao`, em
`lib/coordenacao/reivindicacoes.ts`) prefere `CLAUDE_CODE_SESSION_ID` como
âncora. Como ele é constante nesta máquina, **duas sessões no MESMO worktree
calculam a MESMA identidade `ses-…`** — exatamente o falso negativo que a rodada
5 daquele sistema dizia ter fechado — e o fazem **em silêncio**, com prefixo
`ses-` (que anuncia "modo não degradado") e sem nenhum aviso. O modo degradado
`wt-` avisa em voz alta; este não avisa, porque acha que está funcionando.

⚠️ **Isto é ESCALAÇÃO, não conserto.** Este PR não toca `lib/coordenacao/*` nem
`scripts/reivindicar.mts` — há PR #389 vivo lá. É o Diretor que decide o que
fazer com este achado.

---

## 4. O que NÃO reproduzi — com todas as letras

**Não reproduzi a sobrescrita histórica.** O que tentei, e por que não deu:

- Procurei os nomes genéricos relatados em todos os `.fichas/` das 14 worktrees
  — não estão lá (comando na seção 1).
- Achei-os no scratchpad compartilhado, e ali o conteúdo perdido **não existe
  mais por definição**: quem sobrescreve não deixa a versão antiga. Não há
  registro de versão, não há `.bak` automático, não há journal.
- O que **está provado** é o MECANISMO da perda, não o evento: o diretório é
  compartilhado entre frentes (achado 1, provado por conteúdo), a escrita de
  arquivo é sobrescrita silenciosa, e os nomes usados são genéricos e repetidos.
- Portanto: **o conserto deste PR é PREVENTIVO, e está declarado como tal.**

---

## 5. O que EU reproduzi — e foi dentro da própria trava

A auditoria independente (`qualidade`, só leitura) apontou que o módulo não
resolvia symlink. Eu **conferi executando**, não lendo — a casa perdeu tempo
sete vezes hoje aceitando "verifiquei" sem execução.

**Cenário:** frente A escreve `body.md` no espaço dela. Frente B cria, **dentro
do próprio espaço**, um symlink apontando para o arquivo de A. B chama
`escreverRascunho("link.md", "B ATROPELOU A", frenteB)`.

Antes do conserto:

```
(b) symlink -> lancou? NAO LANCOU
(b) conteudo de A agora: "B ATROPELOU A"
```

**O incidente relatado pelo Diretor — arquivo de uma frente sobrescrito em
silêncio, sem erro, sem aviso, sem conflito — reproduzido DENTRO do mecanismo
que existe para matá-lo.** `path.resolve` normaliza texto e não segue link
simbólico; `writeFileSync` segue.

Depois do conserto (`realpath` dos dois lados, em `caminhoDeRascunho` e em
`conferirEscritaEm`), o **mesmo** script:

```
(b) symlink -> lancou? Error
(b) conteudo de A agora: "ORIGINAL DE A"
```

A lição, e escreva-a como lição: **a trava tinha a régua certa e a fonte
errada.** A comparação por segmento de caminho estava correta desde a rodada 1
— mas comparava o caminho que o texto DIZ, não o que o filesystem FAZ. Régua
boa sobre fonte mentirosa continua sendo defeito silencioso.

---

## 6. O mecanismo construído

`lib/rascunho/espaco-da-frente.ts` — núcleo puro (sem I/O) + casca fina de I/O,
seguindo o mesmo desenho de `lib/coordenacao/reivindicacoes.ts`.

- **A chave de identidade é `sha256(raiz do worktree)`, prefixo `frente-`,
  truncado em 12 hex.** Nunca sessão, nunca branch. Por quê: o achado 2 mostra
  que `CLAUDE_CODE_SESSION_ID` é constante nesta máquina e não distingue frente
  nenhuma; branch se digita errado e se repete entre worktrees. O raiz do
  worktree é a única chave que, medida hoje, é realmente única por frente.
- **`espacoDaFrente(f)` → `<raiz>/.fichas/<f.id>/`** — dentro de `.fichas`, que
  já era isolada por worktree (a metade do problema que já funcionava, segundo
  o achado 1), mas só passou a ser **gitignorada na rodada 4** (29/08/2026 —
  Achado 2 da auditoria de qualidade, `.fichas/ficha-rodada-4.md`: até ali
  `.fichas/` não tinha entrada nenhuma no `.gitignore`, apesar deste documento
  e do cabeçalho de `lib/rascunho/espaco-da-frente.ts` afirmarem o contrário).
- **`.dono.json`**, gravado na primeira vez que o espaço é aberto: `id`,
  `rotulo`, `raiz`, `criadoEm`. É o registro de quem chegou primeiro.
- **`conferirEscritaEm(alvo, frente)`** — o guarda para um caminho de destino
  ESCOLHIDO POR QUEM CHAMA (o oposto de `caminhoDeRascunho`, que monta o
  próprio caminho e por isso nunca escapa do espaço por construção). Três
  desfechos:
  1. `alvo` já está dentro do espaço desta frente → passa calado.
  2. `alvo` está fora, mas um ancestral tem `.dono.json` legível e é de OUTRA
     frente → lança `RascunhoDeOutraFrenteError`, nomeando quem é a dona.
  3. `alvo` está fora e nenhum ancestral tem dono gravado (o caso mais comum do
     incidente real — o scratchpad compartilhado nunca teve `.dono.json`) →
     lança `RascunhoForaDoEspacoError`, dizendo qual é o espaço certo desta
     frente.
- **`RascunhoDeOutraFrenteError`** e **`RascunhoForaDoEspacoError`** são
  classes distintas de propósito: quem chama precisa diferenciar "tem dono, e
  não é você" de "não tem dono nenhum" sem fazer parsing de texto de mensagem.
- **A CLI**, `scripts/rascunho.mts`, para o agente que só tem shell:
  `npm run rascunho -- caminho <nome>` (imprime o caminho absoluto seguro e
  cria o espaço), `npm run rascunho -- onde` (mostra frente atual e dono
  gravado), `npm run rascunho -- conferir <caminho>` (pergunta, antes de
  escrever, "este caminho é meu?", para um destino montado por fora — um
  editor genérico, um scratchpad de `/tmp`).

### A prova de campo, verbatim

```
$ npm run rascunho -- conferir /tmp/claude-0/-home-user-diolidigital/1af959ce-.../scratchpad/body.md
🚫 "..." está FORA do espaço desta frente, e não achei dono gravado em nenhum
   ancestral dele. O espaço desta frente é
   "/home/user/dd-rascunho/.fichas/frente-e2460edb1687/" — escreva aí (ou numa
   subpasta dele), não em outro lugar do disco.
```

---

## 7. O portão — visto vermelho, não afirmado

Hoje são **5** mutações, cada uma aplicada com `assert` de âncora (`replace`
sem `assert` é esperança, não conserto) e o arquivo restaurado com `sha256`
conferido idêntico (`f5fcfc5bbde4b8e3`):

| Trava removida | Testes que morreram |
|---|---|
| `conferirDono` nunca lança | 2 |
| `estaDentroDoEspaco` vira `startsWith` de texto cru | 2 |
| `conferirEscritaEm` passa sempre | 5 |
| dono ancestral com mesmo id deixa de isentar | 1 |
| `realpathAproximado` vira identidade (a trava de symlink) | 2 |

Números verdes finais: **28 testes** no arquivo novo, `npx tsc --noEmit`
limpo, **7.472** testes na suíte inteira, `npm run build` verde. (Os números
anteriores deste documento — 21 testes e 7.464 na suíte — ficaram
desatualizados e foram substituídos pelos acima.)

---

## 8. O limite deste mecanismo — sem esconder

A chave é o **raiz do worktree**. Duas sessões que compartilhem o MESMO
worktree calculam o MESMO espaço e **continuam podendo se atropelar** — este
mecanismo não as distingue. Isso é aceito de propósito: a resposta da casa ao
incidente irmão de hoje foi *uma worktree por frente*, e a granularidade por
sessão é justamente o que o achado 2 mostra estar quebrado no ambiente.

---

## 🚩 Resumo do que não está provado

1. **Não reproduzi a sobrescrita histórica** — o conteúdo perdido não existe
   mais por definição (seção 4). O que está provado é o mecanismo da perda,
   não o evento.
2. **O achado 2 (`CLAUDE_CODE_SESSION_ID` constante) não foi consertado por
   este PR** — é escalação para o Diretor, e cruza com PR #389 em
   `lib/coordenacao/*`.
3. **Este mecanismo não cobre duas sessões no mesmo worktree** — ver seção 8.
4. **Os quatro achados da auditoria do `qualidade` foram confirmados por
   execução pelo PM** (não aceitos por leitura) e fechados nesta mesma branch
   — e o achado do symlink (seção 5) foi o único caso em que a perda de
   conteúdo foi de fato reproduzida.
