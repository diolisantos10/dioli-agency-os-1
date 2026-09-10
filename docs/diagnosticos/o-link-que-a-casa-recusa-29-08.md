# O link que a própria casa recusa — 29/08/2026

> **O defeito, em uma frase:** todo aviso automático saía com um link de portal
> que **a própria casa responde 403**, e o registro do nosso lado dizia
> **"enviado"**. Comprovante de entrega de coisa que não foi entregue.
>
> É o irmão do defeito da mesma frente: lá a **promessa é feita e ninguém
> cumpre**; aqui o **aviso é enviado e não chega**. Mesma corrente.

---

## 1. A MEDIÇÃO — conferida contra o código, não copiada de laudo

### 1.1 As duas chaves

| | Coluna | Onde no schema | Como nasce |
|---|---|---|---|
| O que o aviso usava | `Client.portalToken` | `prisma/schema.prisma:62` | `@unique @default(cuid())` |
| O que a porta valida | `PortalAccess.token` | `prisma/schema.prisma:1937` | `@unique @default(cuid())` |

- **O aviso montava:** `lib/agency/esteira/avisos.ts:49-51` fazia
  `${base}/portal/access/${portalToken}` a partir de `Client.portalToken`,
  lido em `avisos.ts:186` e usado em `avisos.ts:189`.
- **A porta valida:** `validatePortalAccess` →
  `prisma.portalAccess.findUnique({ where: { token } })`
  (`lib/agency/persistence/portal-access-service.ts`), que é o que
  `resolvePortalClient` usa em toda porta do portal.

### 1.2 O que sincroniza as duas? **Nada.** A prova do nada

```
grep -rn "portalToken" app lib scripts --include=*.ts | grep -v lib/generated
```

**Nenhuma escrita de `Client.portalToken`.** Ele é sempre o default do banco —
nenhum código o atribui, e nenhuma consulta procura
`client.findUnique({ where: { portalToken } })`.

⚠️ **A única linha que PARECE escrever não escreve.**
`app/api/admin/reset-request/route.ts:173` faz `portalToken: portal?.token ?? null`
— mas é um **campo de resposta JSON** chamado `portalToken` carregando um
`PortalAccess.token`. **O nome colide; o dado não.** A colisão de nome é parte do
defeito: dois valores diferentes chamados da mesma coisa em camadas diferentes.

### 1.3 Existe algum cliente em que os dois coincidem por acaso?

**Não, e não pode existir.** São dois `cuid()` **independentes**, gerados por
tabelas diferentes em momentos diferentes. Não há caminho de código que copie um
no outro (§1.2). Coincidência aqui não é improvável — é impossível por
construção.

### 1.4 A consequência, e por que ela é pior que um link quebrado

`avisos.ts:220-227` gravava `status: "enviado"` e `sentAt` sempre que o WhatsApp
**ou** o e-mail saísse — **independentemente de o link abrir**. Então:

- o cliente recebia a mensagem e clicava num link que responde *"acesso negado"*;
- o painel da agência dizia **enviado**, com hora;
- e desde 27/08 o e-mail entrou como segundo canal **carregando o mesmo link
  morto** — o link morto passou a sair por **dois** canais.

**A ponte existe dos dois lados e o meio não liga** — com o agravante de o lado
de dentro ter comprovante.

---

## 2. O CONSERTO — portado do PR #159, com crédito

O conserto **já existia** e estava preso. O módulo
`lib/agency/esteira/link-do-portal-do-cliente.ts` veio do **PR #159**
(`origin/claude/quadro-ceo-15-08`), **praticamente literal** — nenhuma linha de
lógica dele foi alterada. Escrever um segundo módulo teria sido construir em
dobro, que é o defeito de 16/08.

Ele já fazia o certo:

- lê **`PortalAccess` vivo**, pelos **dois** caminhos de posse — `clientId`
  direto **e** via `clientRequestId`. Ler só um deixaria metade da base com cara
  de *"nunca teve portal"*, porque o cliente que nasceu de uma solicitação tem o
  acesso preso a ela;
- reusa `HOST_PADRAO` e `tokenVivo` de `lib/agency/esteira/links-do-portal.ts`,
  que **já era** a fonte única dessa regra nesta casa;
- **não emite nada.** Cunhar credencial de 180 dias por efeito colateral de
  "montar um aviso" é como credencial vaza;
- nunca lança: falha de leitura **não** vira "não tem portal" — são coisas
  opostas.

### 2.1 Leitor único: a arapuca foi desarmada, não contornada

A função local `linkDoPortal` (`avisos.ts:49`) **foi apagada**, junto com o
`select: { portalToken: true }`. Deixá-la viva seria deixar a armadilha pronta
para o próximo. Agora **uma função só** monta link de portal.

### 2.2 A varredura — nenhum achado ficou sem resposta

`grep -rn "portal/access/" app lib components scripts`:

| Onde | Veredito |
|---|---|
| `lib/agency/esteira/avisos.ts` | **era o único ofensor** — corrigido |
| `app/api/admin/reset-request/route.ts`, `app/api/brain/portal-access/route.ts` | já montam a partir de `PortalAccess.token` real — sem ação |
| `app/api/meta/callback/route.ts` | variável chamada `portalToken`, mas o valor é `PortalAccess.token` vindo de cookie, resolvido por `resolvePortalClient` — **nome confuso, dado certo** |
| `lib/auth/portal-guard.ts` | código morto já documentado e removido em 05/08 |
| `lib/db/adapters.ts` | só tipagem; não monta link |
| `scripts/*` | perícia/fixture; criam `PortalAccess` direto ou recebem token por argumento |

---

## 3. ⚠️ ONDE ESTE CONSERTO DIVERGE DO #159 — de propósito, e por ordem

A **decisão 3** do #159 dizia: *"sem link, o aviso não some — ele vai sem link e
diz por quê"*.

**Ordem do Diretor, 29/08:** *"se não existir `PortalAccess` vivo, não envie o
aviso e não grave 'enviado'. Registre a falta como falta."* **Fail-closed.**

Isso está escrito no cabeçalho do módulo portado e no de `avisarCliente` —
divergência silenciosa entre dois PRs é como uma regra morre.

### E fail-closed aqui **não é silêncio** — a fila manual existe e tem tela

Conferido, elo por elo:

`ClientNotice.status = "pendente"` → `filaDeAvisos` (`avisos.ts:258`) →
`app/api/avisos/route.ts` → `components/agency/FilaDeAvisos.tsx:48` →
**montada na tela** em `app/agency/dashboard/operacao/page.tsx:437`.

A falta cai **onde gente olha**, sem se disfarçar de "enviado". Esta cadeia foi
verificada de ponta a ponta justamente porque a frente inteira desta sessão é
sobre mecanismo sem chamador.

### O comportamento novo, exato

Sem `PortalAccess` vivo:
- **não tenta WhatsApp, não tenta e-mail** — nada sai;
- grava `ClientNotice` com `status: "pendente"`, `channel: "nenhum"`,
  `link: null` e `failReason` em português;
- **`sentAt` nunca é preenchido**;
- devolve `enviadoAutomaticamente: false` com o motivo.

Com token vivo, o caminho de sempre segue **inalterado**: WhatsApp → e-mail →
fila manual.

⛔ **Nenhum `PortalAccess` novo é criado em lugar nenhum** — nem no módulo, nem
nos testes. Cunhar credencial em caminho automático não é decisão de quem
executa.

---

## 4. A PROVA — nos dois sentidos, e com as duas metades

`__tests__/agency/link-do-portal/` — e a "porta" nos testes é a **função de
produção** (`validatePortalAccess`), lendo da mesma tabela falsa que alimenta
`linkVivoDoPortal`. **Não é uma reimplementação paralela da regra** — é o ponto
inteiro do teste.

| Prova | Resultado |
|---|---|
| link montado sobre `PortalAccess` vivo → a porta **aceita** | ✅ |
| link montado sobre um cuid avulso (o formato antigo de `Client.portalToken`) → a porta **recusa** (`not_found`) | ✅ |
| token **revogado** → não vivo, sem link | ✅ |
| token **vencido** → não vivo, sem link | ✅ |
| acesso preso ao `clientRequestId` (e não ao `clientId`) → **acha o link** | ✅ |
| **metade 1 da trava:** sem token vivo → `sendWhatsAppMessage` e `sendEmail` **não são chamados**, `status: "pendente"`, `sentAt` ausente | ✅ |
| **metade 2 da trava:** com token vivo → **continua enviando**, `status: "enviado"`, `sentAt` presente, link no corpo | ✅ |

Dois testes que existiam e travavam o comportamento ERRADO
(`__tests__/esteira/avisos.test.ts` e `__tests__/email/o-gatilho-do-aviso.test.ts`)
foram corrigidos: paravam de pé sobre `Client.portalToken`, o campo morto.

---

## 5. ⛔ O QUE FICOU DECLARADO E NÃO FEITO

1. 🔴 **Os avisos que já saíram com link morto não foram remediados.** Este
   conserto impede os próximos; **não** conserta o histórico. Quantos
   `ClientNotice` com `status: "enviado"` carregam link que não abre é
   **NÃO MEDIDO** — exigiria ler a base de produção, que não está ao alcance
   desta sessão. **Sobe:** vale uma varredura, e vale decidir se esses clientes
   são reavisados.
2. 🔴 **Cliente sem `PortalAccess` vivo agora não recebe aviso nenhum** — por
   ordem, e é o comportamento correto, mas **é uma mudança de comportamento com
   cliente real do outro lado**. Quantos clientes estão nessa situação hoje é
   **NÃO MEDIDO** (mesma razão). Se forem muitos, a fila manual enche de uma vez.
   **Sobe ao CEO:** emitir `PortalAccess` para quem não tem é ato explícito, e
   ninguém o fez aqui.
3. ⛔ **`Client.portalToken` continua no schema**, agora sem nenhum leitor no
   caminho do aviso. Coluna que não serve a nada é a próxima arapuca. Removê-la
   exige **migration**, que é decisão que sobe — não foi criada.
4. ⛔ **Nem todo tipo de aviso precisa de link.** `TipoDeAviso` inclui `atraso`,
   `recompra`, `ciclo`. Hoje **todos** carregam o link, então o fail-closed vale
   para todos. Se a casa decidir que algum tipo deve sair sem link, isso é
   decisão declarada — **não foi assumida aqui**.
5. ⛔ **Achado de terceiros, não consertado:**
   `app/api/clients/[id]/fundir/route.ts:77` afirma em comentário que o link do
   cliente absorvido para de funcionar — mas `moverVinculos` migra o
   `portalAccess` para o sobrevivente. O comentário está desatualizado. Fora da
   reivindicação desta frente.

---

## 6. O portão

- `npx tsc --noEmit` — **limpo**, rodado **depois** dos testes.
- `npx vitest run` — **547 arquivos, 7.533 casos verdes**.
- `npm run build` — **verde**.
- **Custo: US$ 0,00.** Nenhum e-mail a pessoa real, nenhuma notificação real,
  nenhuma chamada de IA real, nenhum `PortalAccess` criado, nada irreversível.
