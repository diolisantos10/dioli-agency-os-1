# Triagem dos PRs parados — 28/08/2026

> # 🔴 REFUTADO EM 29/08/2026 — NÃO EXECUTE A ORDEM DESTE DOCUMENTO
>
> **A tese central deste documento está errada, e a medição que a produziu está
> explicada em `docs/diagnosticos/a-base-orfa-e-os-cinco-prs-29-08.md` (PR #383).**
>
> **O que este documento afirmou:** "história órfã", "sete dos oito PRs não têm
> ancestral comum com a branch de deploy", "impossíveis de mesclar", "em algum
> momento ela foi recriada" — e, a partir disso, a ordem de **fechar #169, #170 e
> #172 declarando o que se perde**.
>
> **Por que estava errado:** a medição foi feita **dentro de um clone raso**
> (`git clone --depth`). Num clone raso o ancestral comum fica *abaixo* do corte,
> e o git responde `refusing to merge unrelated histories` para históricos que
> **são** parentes. O worktree da sessão de 28/08 nasceu raso às 00:45 UTC e a
> triagem foi escrita dentro dele 2h27 depois.
>
> **O que a medição correta diz:** a branch de deploy tem **uma raiz só, de
> 21/03/2026**, e `git merge-base` responde com ancestral real para **todos** os
> PRs daquela lista. Nenhum PR está órfão. O que existe é **conflito de
> conteúdo** — outro problema, e muito menor.
>
> ### 🚩 A ORDEM QUE FICA REVOGADA
> **NÃO feche #169, #170 nem #172 com base neste documento.** O **#169** carrega o
> conserto de um furo de isolamento entre inquilinos que continua **vivo na branch
> de deploy** — o mesmo furo que este documento descreve, com razão, logo abaixo.
>
> ### O que continua VÁLIDO aqui embaixo
> O furo de inquilino do #169 (a seção seguinte, e ela é o achado mais caro deste
> documento) e todas as comparações de **conteúdo** entre PR e base. O que caiu foi
> só a conclusão sobre **ancestralidade** e a recomendação de fechamento que veio
> dela.
>
> ### Por que este documento não foi apagado
> Documento apagado leva a lição junto. O erro de método — concluir sobre
> parentesco de commits dentro de um clone raso, sem nunca perguntar
> `git rev-parse --is-shallow-repository` — é a parte que a casa precisa lembrar.
> A trava que impede a repetição está em `lib/coordenacao/historico-completo.ts`.
>
> *— Refutação escrita em 29/08/2026 pelo PM, por ordem do Diretor. A análise
> original de 28/08 segue abaixo, intacta.*

---


> **Pedido:** Diretor Geral, 28/08. Triagem dos 8 PRs abertos, com veredito de
> quatro: MORTO · SEGURO · DEPOIS DO CLIENTE · PODRE.
> **Regra que mandou em tudo:** um cliente real entra em poucas horas; nada pode
> desestabilizar o branch de deploy antes disso.
> **Custo:** zero. Nenhuma chamada de IA, nada em produção, nenhum merge feito.

---

# 🔴 O ACHADO QUE NÃO É UM PR — um furo de isolamento entre inquilinos, VIVO

**Antes de qualquer veredito, o que importa: o #169 denunciou um furo em 16/08 e
o furo continua aberto na branch de deploy, 12 dias depois.**

## O defeito, nomeado

`app/api/agency/clients/[id]/marca/route.ts` — **`GET` e `PUT`**:

```ts
const sessao = await getSession();
if (!sessao) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const { id } = await ctx.params;
const ficha = await lerFichaDeMarca(id);      // ← o id vem CRU da URL
```

A rota confere que **existe sessão**. Não confere **de quem é o cliente**.

E a camada de baixo também não filtra:

- `lib/agency/esteira/ficha-de-marca.ts:309` → `prisma.brandBrain.findUnique({ where: { clientId } })` — **sem `workspaceId`**;
- `gravarRespostaDeMarca({ clientId, … })` (`escrita-da-ficha.ts:213`) — usa o `clientId` recebido, direto.

## O que isso permite, em uma frase

**Qualquer pessoa com sessão válida de QUALQUER workspace lê e escreve a ficha de
marca de QUALQUER cliente de QUALQUER outro workspace** — basta trocar o id na URL.

Vale para `design_staff`, o perfil mais baixo. É leitura **e** escrita: dá para
ler a marca de um cliente de outra agência e dá para adulterá-la.

O próprio #169 já tinha provado isso em 16/08, com sessão de `design_staff` do
workspace A lendo e escrevendo a ficha de um cliente do workspace B — **200 nas
duas**.

## Por que ele sobreviveu 12 dias

O conserto existe e está escrito: `lib/agency/esteira/posse-do-cliente.ts`, no
#169. **Ele nunca entrou na base** — e o PR que o carrega hoje **não consegue
mais ser mergeado** (ver abaixo). O conserto foi feito, provado, e ficou preso
num PR que a base deixou para trás.

## Por que eu NÃO consertei agora

Três razões, e a terceira é a que manda:

1. A ordem desta rodada foi **triagem**, e só mergear o que fosse SEGURO;
2. **nada pode desestabilizar o branch de deploy antes do cliente** — e isto é
   rota de API com conserto que precisa de teste de posse próprio;
3. o furo **exige credencial interna da agência**. Não é exposto a anônimo, e
   **não está no caminho do cliente que entra amanhã** (ele entra pelo portal,
   por token de parceiro, que é outra porta).

**É P0 e está aberto há 12 dias — mas não é P0 desta manhã.** Consertar de
madrugada, sem teste de posse, seria trocar um risco conhecido por um
desconhecido na véspera. **Digo a hora que você quiser que eu faça.**

## O conserto, quando for a hora

Recuperar `posse-do-cliente.ts` do #169 (o arquivo existe, é bom, e o raciocínio
dele está escrito no topo: `404` e nunca `403`, escopo no `where` e nunca em
comparação depois, e a sessão do portal só alcançando o próprio cliente), e
chamá-lo nas duas pontas do `marca/route.ts`. **Não é rebase do PR — é copiar o
arquivo para um PR novo**, pelo motivo estrutural abaixo.

---

# ⛔ O PROBLEMA ESTRUTURAL: sete dos oito NÃO CONSEGUEM ser mergeados

Não é conflito de texto. É pior, e é medido:

```
$ git merge pr-328
fatal: refusing to merge unrelated histories
```

**Sete dos oito PRs não têm ancestral comum com `claude/dioli-agency-os-architecture-kk7kp`.**

| | |
|---|---|
| commits na branch de deploy | **150** |
| commits no #169 | **870** |
| ancestral comum | **nenhum** |

A branch de deploy é uma **história órfã** em relação a eles. Em algum momento
ela foi recriada, e os PRs de 16 a 24/08 ficaram apontando para uma base que já
não é ancestral deles. O GitHub ainda os mostra como "abertos contra
`claude/dioli-agency-os-architecture-kk7kp`", e eles são **tecnicamente
impossíveis de mergear** sem `--allow-unrelated-histories` — o que arrastaria
870 commits de outra linha do tempo para dentro do deploy.

⛔ **Fazer isso na véspera do cliente seria o pior erro possível desta noite.**

**Consequência para a triagem:** o veredito "SEGURO" não se aplica a nenhum
deles. **Não porque sejam ruins — porque não entram.** O que entra é o
*conteúdo*, copiado para um PR novo sobre a base atual.

---

# Os oito vereditos

| PR | Veredito | Por quê |
|---|---|---|
| **#361** | **MORTO** | 31 arquivos: 24 já **idênticos** na base, 7 diferentes, **0 ausentes**. As 4 travas que ele denunciava estão **todas fechadas** hoje (conferido uma a uma). Nada se perde. **Fechar.** |
| **#169** | **PODRE — mas carrega o furo vivo acima** | Não mergeia (história órfã). 4 arquivos ausentes, entre eles `posse-do-cliente.ts` e 3 testes de segurança. **O PR morre; o defeito não.** |
| **#170** | **PODRE** | Não mergeia. Perde `captura-conversacional.ts`, a coluna de contato e a **migration** `20260816120000_contato_com_coluna`. Migration de 12 dias atrás sobre um schema que andou muito — refazer sai mais barato que ressuscitar. |
| **#171** | **MORTO** | **0 arquivos ausentes** da base; 33 da amostra já idênticos. O conteúdo (preço com fonte única, agentes) chegou por outro caminho. **Fechar.** |
| **#172** | **PODRE** | Não mergeia, e é o mais divergente: **36 de 60** arquivos da amostra ausentes. É de 16/08 e mexe em briefing/SDR — o código embaixo é outro. Refazer o que ainda doer. |
| **#324** | **DEPOIS DO CLIENTE** (na prática, refazer) | Portal do cliente, modos básico/avançado. Não mergeia. **Toca o portal**, que é o caminho do parceiro. Nem que mergeasse, entraria hoje. |
| **#325** | **DEPOIS DO CLIENTE** (na prática, refazer) | Tráfego Pago V1 (Meta/WhatsApp/TikTok). Não mergeia. É **documentação de plano**, recuperável por cópia — e nada disso é urgente antes do cliente. |
| **#328** | **DEPOIS DO CLIENTE** (na prática, refazer) | Operação Salvaguarda Instagram. Não mergeia. Também documentação; o conteúdo se recupera por cópia quando for a hora. |

## Merges feitos hoje: **ZERO**

Nenhum PR foi classificado SEGURO, e a razão não é preguiça: **nenhum dos sete
antigos sequer mergeia**, e o oitavo (#361) está morto. Não havia o que subir com
segurança, e subir qualquer um deles hoje seria o oposto da ordem que você deu.

---

# 🚩 O que eu descobri e você não tinha: são 15 PRs abertos, não 8

A listagem que você recebeu veio truncada em uma página. A lista real de abertos:

**374, 373, 361, 328, 325, 324, 172, 171, 170, 169, 168, 167, 166, 165, 163**

Os sete que você não citou — **#163, #165, #166, #167, #168** — **eu não olhei**.
Dois deles apontam para bases diferentes (`#168` → `porta-da-frente-16-08`,
`#163` → `claude/consertos-do-cofre`), o que sugere a mesma doença de base órfã,
possivelmente pior.

**Declaro como não julgados.** Prefiro cinco julgados com firmeza a oito palpites
— e prefiro dizer que existem sete a mais do que deixar você achar que a fila era
de oito.

---

# 🚩 O que eu NÃO consegui provar

1. **Não rodei o CI de nenhum dos oito.** Não faria sentido: sete não mergeiam, e
   o CI roda sobre o merge. O que medi foi mais fundo que CI — se o merge é
   possível.
2. **Não li o conteúdo de #324, #325 e #328 além da estrutura.** Sei que não
   mergeiam e que são majoritariamente documentação; **não sei se o plano que
   eles descrevem ainda é o plano da casa.** Isso é julgamento seu, não meu.
3. **Não sei POR QUE a branch de deploy virou história órfã.** Medi o efeito, não
   a causa. Vale investigar: se aconteceu uma vez, acontece de novo, e o custo é
   exatamente o que estamos vendo — 12 dias de trabalho preso.
4. **Não testei o furo do #169 com uma requisição real.** Ele está provado por
   **leitura do código** (rota sem conferência de posse + camada de dados sem
   filtro de workspace) e pela medição que o próprio #169 registrou em 16/08.
   Uma prova executada exigiria subir o app com duas sessões de workspaces
   diferentes — vale fazer junto do conserto, como teste de regressão.

---

# O que eu recomendo, em ordem

1. **Depois que a manhã do cliente estiver ganha:** recuperar `posse-do-cliente.ts`
   num PR novo sobre a base atual, com teste de posse. É o furo vivo.
2. **Fechar #361 e #171** — mortos, nada se perde, e PR morto aberto é ruído que
   esconde o que importa (foi exatamente o que aconteceu aqui).
3. **Fechar #169, #170, #172** declarando o que se perde, e abrir uma pendência
   por item que ainda doer. O PR não volta; o problema pode voltar.
4. **Decidir sobre #324, #325, #328** — são planos; a pergunta é se ainda valem,
   e ela é sua.
5. **Investigar a base órfã.** É a causa-raiz de tudo isto.
