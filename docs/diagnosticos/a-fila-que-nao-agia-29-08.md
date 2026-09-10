# A fila que não agia — 29/08/2026

> **A frase que mandou nesta rodada foi minha, do relatório anterior:** *"a fila
> não tem nenhuma ação; `POST .../atribuir` continua sem chamador de tela — a
> próxima trava sem fechadura, agora nomeada."*
>
> **Fila que só se lê não é fila, é lista de arrependimentos.**

---

## 1. A MEDIÇÃO — feita ANTES de escrever qualquer linha

A ordem era explícita: *"se a ação certa não for 'atribuir', meça antes."* Foi
medido, e a ação certa **não era** atribuir.

### 1.1 `POST .../atribuir` existe, funciona — e não serve a este lead

`lib/agency/comercial/atribuir-conversa-orfa.ts:116-121` **exige um `Client` que
já exista**, e recusa com `cliente_inexistente` quando não acha.

**O lead a quem a casa prometeu contato é um visitante anônimo: ele não tem
`Client`.** Atribuir é o ato certo para outro caso — a conversa de um cliente já
conhecido, derivado por token de convite. Para o caso que originou esta frente,
atribuir é **impossível**, não apenas inadequado.

### 1.2 Nada nesta casa marcava "um humano contatou esta pessoa"

Prova do nada:

```
grep -rn "contatadoEm\|contatadoPor\|marcarComoContatado\|contatado" \
  lib app --include=*.ts --include=*.tsx
```
→ **vazio.**

### 1.3 A única saída da fila era APAGAR o rastro

`resolverRastroPeloFio` / `resolverRastroDaConversa`, e só em dois caminhos:

| Caminho | Onde |
|---|---|
| o briefing virou pedido | `app/api/brain/client-requests/route.ts:328` |
| a promoção automática de parceiro | `lib/agency/comercial/promover-conversas-paradas.ts:261,270` |

**Não havia saída para "já falei com a pessoa"** — e apagar seria a saída errada:
perde a história de que a dívida existiu e foi paga.

---

## 2. O QUE FOI CONSTRUÍDO — e a rota nova é declarada, não improvisada

⚠️ A ordem dizia *"não invente rota nova sem me dizer"*. **Estou dizendo:** a
rota nova existe porque a medição do §1.2 provou que o ato não existia em lugar
nenhum. O grep que provou o nada está no cabeçalho da própria rota.

### 2.1 O carimbo do ato — carga `v: 5`

`lib/agency/comercial/conversa-sem-pedido.ts` ganha `contatadoEm` e
`contatadoPor`. As versões 1–4 continuam legíveis.

**A trava que mais importa está em `conversa-sem-pedido.ts:323-335`:**
`guardarRastroDaConversa` **preserva** `contatadoEm`/`contatadoPor`, como já
preservava `atribuicao` e `prometidoEm`. Sem isso, **um visitante que reabre a
aba depois de já ter sido contatado apagaria o ato do humano em silêncio**, e a
fila voltaria a cobrar um contato que já aconteceu. Os campos **nunca chegam por
`input`**: a rota pública do SDR não os conhece.

### 2.2 As duas portas, e quem as chama na TELA

| Porta | Estado antes | **Quem chama agora** |
|---|---|---|
| `POST /api/agency/conversas-sem-pedido/contatado` | **não existia** | `app/agency/leads/page.tsx` → `marcarContatado()` |
| `POST /api/agency/conversas-sem-pedido/atribuir` | **existia e nunca teve chamador de tela** | `app/agency/leads/page.tsx` → `confirmarCliente()` |

A rota nova usa **as mesmas guardas da irmã**, copiadas por disciplina e não por
invenção: sessão de **agência** (sessão de portal com `clientId` → 403), CSRF, e
**o autor sai da sessão, nunca do corpo**.

### 2.3 ⛔ O botão que NÃO foi construído

**Não há seletor de cliente.** "Confirmar que é deste cliente" só aparece quando
`clienteDoConvite` não é `null` — isto é, quando **o servidor já derivou o
cliente por token de convite**. É confirmação de um dado do servidor, com um
clique.

Deixar um humano escolher o cliente numa lista é como se atribui a conversa ao
cliente errado — e dono errado é irreversível na prática. Sem `clienteDoConvite`,
o botão **não existe**: não aparece desabilitado, não aparece com tooltip.

### 2.4 O ato não manda nada a ninguém

"Marcar como contatado" **registra** um ato que o humano já fez por fora. Não
envia WhatsApp, não envia e-mail, não chama IA. E **não apaga o rastro**:
contatado é **estado**, não sumiço.

---

## 3. A TELA MUDA NA HORA — e a prova é o clique, não o teste

> *"Ação que não move a tela é botão decorativo."*

Depois de um `POST` bem-sucedido, a tela **recarrega a fila do servidor**. ⛔ Não
há estado otimista: estado otimista **mente** quando a escrita falhou pela
metade, e mentir sobre "já contatei" é pior que não ter botão.

### 3.1 Medido ao vivo, clicando no navegador de verdade

Servidor local em porta fixa **3411**, banco próprio conferido antes de acreditar
em qualquer número. **Custo: US$ 0,00.**

**Ato 1 — "Marcar como contatado" (rota nova):**

```
BANCO ANTES  — contatadoEm: null | v: 5
SELO ANTES:  3 com promessa pendente
[api] POST 200 /api/agency/conversas-sem-pedido/contatado
SELO DEPOIS: 2 com promessa pendente
CARTÃO DEPOIS: 9 turnos · parada há 3 dias | WhatsApp | Contatada hoje
BANCO DEPOIS — contatadoEm: 2026-08-29T05:36:27Z | contatadoPor: cmpyzf27d0001nq7dt0331v31
```

O selo caiu de **3 para 2**, o cartão **perdeu** o `⚑ Prometemos contato`, ganhou
o selo neutro e **desceu** para o fim da fila. O autor gravado é o `userId` da
sessão.

**Ato 2 — "Confirmar que é deste cliente" (a rota que já existia):**

```
BANCO ANTES — atribuicao: null
botões "Confirmar que é deste cliente" na tela: 1   (só o rastro com clienteDoConvite)
[api] POST 200 /api/agency/conversas-sem-pedido/atribuir
botões DEPOIS: 0                                    (atribuído, o botão some)
BANCO DEPOIS — atribuicao: {"clientId":"cli_demo_convite",
  "atribuidoPor":"cmpyzf27d0001nq7dt0331v31","atribuidoEm":"2026-08-29T05:39:20Z", ...}
```

---

## 4. ⛔ O TESTE FICA VERMELHO QUANDO O FIO SAI — medido, não afirmado

A exigência era literal. **Não bastava dizer que fica: cortei o fio em três
lugares e medi.**

| Mutação | Resultado |
|---|---|
| o botão deixa de chamar `marcarContatado` (fio cortado) | 🔴 **2 testes vermelhos** |
| age, mas a tela **não recarrega** (o botão decorativo) | 🔴 **1 teste vermelho** |
| o ato bate na **porta errada** (`/atribuir` no lugar de `/contatado`) | 🔴 **1 teste vermelho** |
| código restaurado | 🟢 **verde** |

### O que os testes alcançam, e o que não alcançam

⚠️ Esta casa **não tem jsdom nem testing-library** (`vitest.config.ts`:
`environment: "node"`). **Não se clica em teste aqui.** Por isso a prova é em
três camadas, e a terceira é a que fecha:

1. **comportamento** — os atos são funções exportadas; o duplo de `fetch` prova
   a URL, o método, o corpo, e que `409`/`400`/`503` viram **erro com a mensagem
   do servidor**, nunca sucesso silencioso;
2. **render** — `renderToStaticMarkup` prova o que a pessoa lê em cada estado;
3. **fiação** — leitura de código-fonte, que pega alguém cortar o fio e **não**
   pega o clique não montar. Está escrito no cabeçalho do arquivo.

**O clique de verdade (§3.1) é o que a camada 3 não alcança** — e por isso ele
foi feito, e não apenas prometido.

---

## 5. O que a CAPTURA pegou e o teste não pegava

Nenhum teste sabe o que soa errado em português, e nenhum sabe ordem de leitura.

1. **"Contatada há 0 dias".** Aritmeticamente certo; frase que ninguém fala. E o
   pior caso estava com a pior redação: o segundo seguinte ao clique é justamente
   quando esse texto mais é lido. Virou `idadeEmDias` — `hoje` / `há 1 dia` /
   `há N dias` — com teste próprio, que só existe porque a captura o exigiu.
2. **O botão vinha ANTES do número.** Para agir, a pessoa precisa do WhatsApp e
   da próxima ação — e os dois ficavam **abaixo** do botão. Botão antes do insumo
   convida a clicar antes de agir, e *"marquei como contatado sem ter
   contatado"* é exatamente a mentira que este selo não pode carregar. As ações
   foram para o fim do cartão, separadas por borda. Há teste de **ordem** que
   compara posições no HTML: inverter de novo deixa vermelho.

---

## 6. ⛔ O QUE FICOU DECLARADO E NÃO FEITO

1. **Contatado não "reabre" sozinho.** Se a pessoa voltar a falar com o SDR
   depois de contatada, o ato **permanece** e ela não volta à faixa de dívida.
   Isso é escolha conservadora: o contrário exigiria decidir o que conta como
   "conversa nova", e **não inventei essa régua**. Fica medido.
2. **`contatadoPor` é um `userId` cru** e **não vai para a tela** — é para
   perícia. Mostrar "contatado por Fulano" exigiria ler o nome do usuário, que é
   outra consulta e outra frente.
3. **Não há como desfazer** "marcar como contatado" pela tela. O ato é
   idempotente e preserva a data original, mas errar o cartão exige banco. Se
   isso incomodar na prática, é rodada própria.
4. 🔴 **O prazo continua não ratificado.** `venceEm` segue `null` e a fila mostra
   **idade, nunca atraso** — como ordenado. *Prazo não decidido é ausência.*
5. **Um sentinela da casa pegou meu próprio commit anterior:**
   `__tests__/seguranca/nenhum-segredo-em-texto-puro.test.ts` acusou os tokens
   literais do teste de link de portal (eles só passaram a ser vistos quando o
   arquivo virou versionado). Usei a saída que o próprio guarda oferece —
   `segredo-permitido`, **na linha colada**, porque a isenção é de linha — com o
   motivo escrito: são tokens **falsos**, de tabela falsa, e precisam ser
   literais porque o teste prova a identidade entre os dois lados.

---

## 7. O portão

- `npx tsc --noEmit` — **limpo**, rodado **depois** dos testes.
- `npx vitest run` — **551 arquivos, 7.588 casos verdes**.
- `npm run build` — **verde**.
- Captura ao vivo em **375 / 768 / 1440**, porta fixa, banco próprio conferido.
- **Custo: US$ 0,00.** Nenhum e-mail, nenhuma notificação a pessoa real, nenhuma
  chamada de IA real, **nenhum `PortalAccess` emitido**, nada irreversível.
