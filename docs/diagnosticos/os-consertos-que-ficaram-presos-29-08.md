# Os consertos que ficaram presos — 29/08/2026

> **A frase que resume o dia:** os furos vivos desta casa não estão esperando
> conserto. Estão esperando **merge**. O conserto já existe, escrito e testado,
> parado dentro de um PR que ninguém mesclou há treze dias.

Este documento é o registro de uma operação de resgate: **soltar os consertos e
deixar as funcionalidades para trás.** Nenhuma linha aqui é invenção nova — tudo
foi portado de um PR aberto, com crédito de origem, e cada porte foi medido
contra a **branch de deploy de hoje**, não contra o ancestral comum.

---

## O que este PR faz, em uma frase de negócio

Fecha **7 dos 8 furos vivos** nomeados em `docs/diagnosticos/a-fila-inteira-29-08.md`,
portando o conserto que já existia dentro dos PRs #153, #158, #159 e #161 — sem
trazer junto nenhuma das funcionalidades que fazem esses PRs esperarem.

---

## A tabela — os 8 furos, de onde veio cada conserto, e o que ficou para trás

| # | O furo, na base de hoje | Conserto veio de | Commit | Estado |
|---|---|---|---|---|
| 1 | `app/api/messages/conversa.ts` — `montarFiltro` une `clientId` **OR** `clientRequestId`; mensagem legada sem `clientId` carimbado vaza **lateralmente** entre clientes | **#153** | `bf747956` | ✅ **SOLTO** (Parte A) |
| 2 | `app/api/v2/assistido/route.ts` (`ligar`) — opera sempre na agência **mais antiga do banco** | **#161** | `05cc4d37` | ✅ **SOLTO** |
| 3 | `app/api/v2/assistido/route.ts` (`ciclo`) — `findUnique` sem `workspaceId`: roda cadeia paga de IA sobre cliente alheio e cria card no **portal do cliente de outra agência** | **#161** | `05cc4d37` | ✅ **SOLTO** |
| 4 | `app/api/v2/retomar/route.ts` — `correlationId` do corpo **sem checagem de posse**: reativa aviso a cliente de outra agência | **#161** | `05cc4d37` | ✅ **SOLTO** |
| 5 | `app/api/v2/assistido/route.ts:219` — o `reviewNote` `clientVisible:true` carrega o **custo em dólar** de cada passo de IA; o cliente lê o que a agência pagou | **#158** | `8f6c83b7` | ✅ **SOLTO** |
| 6 | `lib/agency/esteira/avisos.ts:49,189` — todo aviso automático carrega link de portal que devolve **403** | **#159** | — | ⛔ **PRESO** — ver abaixo |
| 7 | `lib/agency/execution/negotiate-proposal.ts` — proposta renegociada pode cotar **R$ 0** ao cliente, sem escopo | **#159** | `6e240e86` | ✅ **SOLTO** |
| 8 | `lib/agency/escada/registro.ts` — a escada libera peça ao portal **sem checar marca constituída** | **#159** | `6e240e86` | ✅ **SOLTO** |

**Brinde não pedido, que veio junto do #161 e é conserto real:**
`app/api/v2/assistido/route.ts` (`status`) devolvia `execucoes`, `recusas`,
`handoffs` e `chaves` **sem filtro de workspace nenhum** — dump de nome de
cliente, função, custo e correlação de todas as agências. Fechado.
E o fallback `PILOTO_SECRET || CRON_SECRET` virou só `PILOTO_SECRET`: o segredo
do relógio deixa de abrir a porta de gastar dinheiro de IA.

---

## ⛔ O que ficou preso, e por quê

### Furo 6 — o link de portal que devolve 403
**Trava, não dificuldade.** O conserto do #159 é o arquivo novo
`lib/agency/esteira/link-do-portal-do-cliente.ts` **mais a ligação dentro de
`lib/agency/esteira/avisos.ts`**. Esse segundo arquivo é a frente de outra
conversa viva nesta hora (a promessa de contato do SDR) e está fora dos limites
por ordem do Diretor. Portar só o arquivo novo, sem ligá-lo, seria entregar
código morto e chamar de conserto.

**O furo é real e foi reconferido na base de hoje**, não copiado do documento:
- `avisos.ts:189` monta o link com `linkDoPortal(cliente.portalToken)` —
  `portalToken` é campo do `Client`, um `cuid` default;
- `portal-access-service.ts:45` valida com `prisma.portalAccess.findUnique({ where: { token } })`
  — outra tabela, e um valor gerado por `randomBytes(32)`.

São duas chaves diferentes em duas tabelas diferentes. **Todo aviso automático
que a casa manda hoje carrega um link que a própria casa recusaria.**

**Fica para o merge do #159, ou para um despacho quando a frente do `avisos.ts`
encerrar.** É item de uma linha de ligação — não é trabalho grande, é trabalho
bloqueado.

---

## 🔴 O que exige MIGRATION — declarado, não feito

Migration em produção é decisão que sobe. Nenhuma foi criada aqui.

### 1. `OutboxV2` não tem coluna de dono — e a premissa que o protegia CAIU
O #161 trazia uma trava de CI (`__tests__/v2/outbox-sem-dono-nao-ganha-executor.test.ts`)
construída sobre a premissa *"nenhum executor tem consequência externa ainda — o
defeito está inerte"*.

**Essa premissa não vale mais.** A base ganhou um executor real,
`mensagem_ao_cliente` em `lib/agency/v2-recovery/batida-da-v2.ts`, que manda
aviso de atraso ao cliente por WhatsApp/e-mail.

Portei a trava, **rodei, e ela reprova a base de hoje** — de propósito, é o que
ela existe para fazer:

```
Tipo(s) novo(s) em EXECUTORES (lib/agency/v2-recovery/batida-da-v2.ts): mensagem_ao_cliente
`OutboxV2` não tem coluna de dono (clienteId/workspaceId).
```

**Retirei a trava deste PR** — ela não prova nenhum dos 8 furos; ela cobra uma
migration. Mantê-la aqui deixaria a suíte vermelha por um item que não é meu
para decidir. Ela continua viva no PR #161, e este parágrafo é o registro de que
foi **medida, não esquecida**.

**Mitigação que ENTROU:** o furo 4 está fechado assim mesmo. `correlacaoDoWorkspace`
deriva a posse do rastro que já existe (`ExecucaoV2.clienteId` → `Client.workspaceId`),
**sem coluna nova**, e repete o predicado na escrita para fechar a janela de
TOCTOU. É trava real, não paliativo — mas é derivada, e a coluna própria continua
sendo o certo.

**Decisão que sobe:** pôr `clienteId`/`workspaceId` em `model OutboxV2`, com migration.

### 2. `RecusaV2` e `HandoffV2` não têm `workspaceId`
Reconferido no schema da base de hoje, não copiado de documento:

```
model RecusaV2  { id, funcaoId, motivo, correlationId, clienteId?, em }   ← sem workspaceId
model HandoffV2 { … correlationId, status, criadoEm, aceitoEm, cobradoEm } ← sem workspaceId
```

O conserto (schema + migration) está pronto no **PR #166** — o furo foi achado
pela segurança em **16/08** e está parado há treze dias.

**Mitigação que ENTROU:** o porte do `status` (furo bônus, do #161) recorta essas
mesmas tabelas por `clienteId` e por correlação `assistido:<clienteId>:`, **sem
migration**. Isso fecha a porta de leitura que existia hoje; não substitui a coluna.

---

## 🔴 Achado NOVO, que ninguém tinha medido: o caminho de contraproposta está morto

Não estava na lista dos 8. Apareceu porque o teste do furo 7 foi **executado**, e
não só portado.

- `lib/agency/live-calculator.ts:144-145` monta todo plano com
  `minPrice: plano.preco, maxPrice: plano.preco` — **preço fechado** desde 26/08/2026.
  Logo `est.totalMin === est.totalMax` para qualquer escopo.
- `lib/agency/execution/negotiate-proposal.ts` só aceita a contraproposta do modelo
  se `newTotal >= totalMin && newTotal < totalMax`.

Os dois juntos exigem `n >= X` **e** `n < X` ao mesmo tempo: **insatisfazível**.

**Em linguagem de negócio: quando o cliente diz "achei caro", a casa nunca oferece
condição nenhuma.** Nenhum valor, de nenhum modelo, para nenhum cliente. O
caminho existe no código, roda, e descarta silenciosamente toda contraproposta.

Isto é **anterior** ao furo 7 e não foi introduzido por este PR (a linha vem do
commit `7f57df65`). Mexer nela é mexer em **fronteira de preço** — decisão do CEO,
não de quem porta conserto. **Não mexi.**

O que fiz: o teste passa a **travar a verdade de hoje**, com o porquê escrito
dentro dele. Se alguém consertar a fronteira, o teste **quebra** — e a casa fica
sabendo que o caminho voltou a existir, em vez de descobrir por um cliente.

**Decisão que sobe ao CEO:** ou (a) `<=` no teto, aceitando o próprio preço
fechado como "condição especial" — o que é discutivelmente enganoso, porque
anuncia condição sem desconto; ou (b) assumir que plano de preço fechado não
negocia por este caminho, e dizer isso ao cliente com outra frase.

---

## Como cada furo foi provado — vermelho com o conserto FORA

Regra da casa: trava precisa das duas metades. Cada teste foi **executado** com o
conserto removido e restaurado em seguida. Nada aqui é afirmação.

| Furo | Teste | Com o conserto fora |
|---|---|---|
| 1 | `__tests__/consertos-presos/conversa-nao-vaza-entre-clientes.test.ts` | **3 falhas** |
| 2,3,4 | `__tests__/consertos-presos/piloto-nao-atravessa-a-casa.test.ts` + `__tests__/v2/recovery.test.ts` | **16 falhas** |
| 5 | `__tests__/consertos-presos/o-custo-na-tela-do-cliente.test.ts` | **3 falhas** |
| 7 | `__tests__/consertos-presos/proposta-renegociada-nao-cota-zero.test.ts` | **5 falhas** |
| 8 | `__tests__/consertos-presos/portao-de-marca-na-entrega.test.ts` | **11 falhas** |

Os testes moram em `__tests__/consertos-presos/` e não em `__tests__/v2/`,
`__tests__/seguranca/` ou `__tests__/esteira/` **de propósito**: essas três pastas
estão reivindicadas por frentes vivas de outras conversas, e colisão de pasta foi
o defeito de 16/08.

---

## O que NÃO entrou junto — a metade que ficou para trás, de propósito

O ponto inteiro desta operação: soltar o conserto **sem** a funcionalidade.

| Do PR | O que ficou para trás | Por quê |
|---|---|---|
| **#153** | A Parte B inteira (`escopoDoToken`/`donoDoToken`, reescrita de `donoDoPortal`/`resolvePortalClient`, cookie `dioli_portal`, rotas `vista`/`access/me`) | 84 arquivos; o resolvedor único de token é frente própria. Confirmado por busca: `escopoDoToken` **não existe** na base |
| **#158** | Toda a metade de **deduplicação por nome** (`chave-do-nome.ts`, `duplicados.ts`, `garantir-cliente.ts`, o hunk do `ligar`, `prisma/schema.prisma`, a migration, `lib/generated/prisma/*`) | Julgada **PODRE**: a base já resolve identidade de cliente melhor, por e-mail/telefone (`chave-do-prospect.ts`, commit `4cbba4b7`), num desenho que nunca funde por nome |
| **#159** | `negociacao.ts`, `canal-de-email.ts`, `cobranca-de-aprovacao.ts`, `prazo-de-aprovacao.ts`, `recompra.ts`, `self-serve-catalog.ts`, `pacote-travado.ts`, `aprovacao-parada.ts`, `FilaDeAvisos.tsx`, `app/api/avisos/route.ts` | Nada disso é furo 6, 7 ou 8. A base já resolveu preço de fonte única melhor (`avulsoDoBalcao`/`planosNegociaveis`, commit `f31dce62`) |
| **#161** | Nada — o PR é **um commit só e 100% conserto** | Foi o único dos quatro que não precisou de separação |

---

## A armadilha que quase custou uma regressão de segurança

Medir contra o **ancestral comum** não mostra o que o deploy ganhou depois. Medi
contra o deploy, e por isso achei:

`app/api/v2/assistido/route.ts` **andou** depois do #161, no commit `21899530`.
O deploy de hoje tem nesse arquivo duas coisas que o #161 **não conhece**:
- a guarda CSRF `deveBloquearMutacaoCrossSite` (Origin/Referer, faixa 1);
- `segredoConfere` (hash + `timingSafeEqual`) no lugar do `===` que comparava o
  segredo byte a byte e vazava pelo tempo de resposta.

**Copiar o arquivo do #161 por cima teria apagado as duas.** O conserto foi
aplicado *em cima* do arquivo de hoje. Conferido: o diff só acrescenta o recorte
de workspace; nenhuma linha de CSRF ou de segredo foi removida.

> Mesma lição, dita de outro jeito: **conflito zero não é sinônimo de seguro.**
> O que decide é o compilador e a suíte, não o `git merge`.

---

## O que este documento NÃO determinou

- **Se algum dos PRs de origem deve ser mesclado ou fechado.** Não é decisão
  minha e não toquei em nenhum deles: nenhum merge, nenhum comentário, nenhuma
  alteração, nenhum rebase em branch alheia.
- **Se `NEXT_PUBLIC_APP_URL` está configurada na produção de hoje** (relevante ao
  furo 6) — exige ler o ambiente de produção, o que esta rodada não fez.
- **O tamanho real da Parte B do #153** além da contagem de arquivos do PR.
- **Se os 4 furos restantes da lista do `seguranca`** (os que não estão entre os
  8 da tabela principal) continuam abertos — não foram escopo desta rodada.
- **As cinco rotas de pagamento e parceria** (`agency/parcerias`,
  `agency/convites-de-parceria`, `admin/isencoes-de-parceria`, `admin/pagamentos`):
  **não foram tocadas**, estão lacradas no PR #387 esperando palavra do CEO.

---

## Crédito de origem

Nenhum conserto deste PR é meu. Todos foram escritos por quem abriu os PRs
#153, #158, #159 e #161, entre 15 e 16/08/2026, e ficaram parados desde então.
O trabalho desta rodada foi **separar, portar contra a base de hoje, e provar** —
não inventar. Onde um teste precisou de ajuste para compilar ou rodar contra a
base atual, o ajuste está escrito dentro do próprio arquivo de teste.
