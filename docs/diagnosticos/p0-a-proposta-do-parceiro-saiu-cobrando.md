
---

# ADENDO — a prova nova (a conversa do Marcos) e o que ela muda

## O convite não foi reconhecido em NENHUM momento

O Marcos teve de **explicar com as próprias palavras** que é parceria. Se o
convite tivesse sido reconhecido, a casa já saberia.

**Isso não invalida o conserto do #381** — o pedido nascia órfão de verdade, e
isso é defeito real. Mas **o #381 não é a causa desta conversa**: se o convite
não foi reconhecido no SDR, a falha é mais cedo do que o submit.

## O que eu MEDI no código (e está tudo de pé)

| Elo | Estado no deploy |
|---|---|
| `conviteDaUrl()` lê da barra de endereço | ✅ presente |
| enviado em **todo turno** ao SDR | ✅ presente |
| a rota devolve `parceria` à sala (#372) | ✅ presente |
| a sala escreve `parceriaDeclarada` (`comParceria`) | ✅ presente |
| middleware que pudesse perder a query | ✅ **não existe** |
| algo que reescreva a URL do briefing | ✅ **nada** |

**A cadeia técnica está inteira no ar.** O que falta é o dado de produção.

## ⛔ O que eu NÃO consigo medir — e por quê

Os passos 1 e 2 da sua ordem (*"o `?convite=` chegou?"* e *"o servidor
resolveu?"*) só se respondem lendo **o banco de produção**, e **nenhuma sala
nossa tem credencial**. Não vou adivinhar.

## ✅ Mas a prova EXISTE e o CEO consegue lê-la — em duas consultas

Achei duas trilhas que respondem tudo, e **nenhuma exige código**:

**1. O convite registra uso.** `resolverConviteDeParceria` incrementa `usos` e
grava `ultimoUsoEm` — **só quando resolve com sucesso**
(`convite-de-parceria.ts:196`, depois da decisão).

> **Se o convite entregue hoje ao Marcos estiver com `usos = 0`, ele nunca
> resolveu.** E aí a sua pista está certa: ele usou outro link, ou o token não
> resolveu.

**2. O rastro da conversa guarda o cliente do convite.** Todo turno grava
`clienteDoConvite` (`sdr/chat/route.ts:209`), **mesmo quando o convite não
resolve** — aí vai `null`.

> **Se o rastro da conversa do Marcos tiver `clienteDoConvite: null`, o servidor
> não resolveu o token.** Isso separa "não chegou" de "chegou e foi recusado"
> quando cruzado com a trilha 1.

### O pedido, pronto para o agente de navegador

> No painel, procure **os convites de parceria do cliente FOOCCI**. Para cada um,
> anote: **o token (primeiros 8 caracteres), `usos`, `ultimoUsoEm`, `expiraEm`,
> `revogadoEm` e para qual `clientId` ele aponta.** Depois, na lista de
> **conversas sem pedido**, ache a do Marcos e anote o **`clienteDoConvite`**.
> **Não aperte nada, só leia.**

Com esses dois números eu fecho o diagnóstico em minutos.

---

# O SEGUNDO DEFEITO — e aqui o achado é sobre a régua, não sobre a frase

A conversa terminou com *"deixei registrado para a equipe analisar e entrar em
contato"* — sem prazo, sem canal, sem dizer se ele espera ali.

## 🔴 A régua do #356 existia, tinha chamador, e não pegou

`promessa-que-a-maquina-nao-cumpre.ts` nasceu exatamente para isso e é chamada
por `app/api/sdr/chat/route.ts`. Mas os padrões dela cobriam a **primeira
pessoa** — *"eu preparo e te envio"*. A frase do Marcos **terceiriza**: quem
analisa e quem entra em contato é *"a equipe"*.

**Mesma dívida com o cliente, sujeito diferente — e a régua media só um sujeito.**
Você estava certo: quando ela não pega, **ela mede a coisa errada**, e isso é
achado próprio.

## O conserto

Dois padrões novos (a promessa por terceiro e o "vou levar para a equipe"), e a
instrução gêmea ganhou as três coisas que faltaram ao cliente 001: **por onde
vem a resposta, em quanto tempo, e se ele pode fechar a janela** — com a
proibição de inventar prazo que a casa não cumpre.

## 🚩 UMA TENSÃO DE DOUTRINA, e ela é sua para decidir — não minha

O teste do #356 diz, com todas as letras:

> *"deixa passar a EQUIPE prometendo — quem promete é gente, e gente cumpre"*
> — e aprova `"Nossa equipe entra em contato com você por este e-mail."`

Essa frase **declara o canal** e **não declara prazo**. A do cliente 001 não
tinha **nenhum dos dois**.

Minha primeira versão exigia **prazo** e teria barrado a frase que o #356
aprovou. **Recuei de propósito:** a régua atual dispensa quando há **canal OU
prazo**, e não reverte a decisão anterior da casa.

**A pergunta aberta, e é de doutrina:** o CEO reclamou exatamente da falta de
**prazo**. Canal sem prazo ainda deixa o cliente sem saber **se espera ali**.
**Exigir os dois barraria a frase do #356.** Não reverti decisão anterior da casa
no meio de um P0 — **quem decide isso é você.**

## ⛔ E a metade que eu NÃO fiz

Você disse: *"se a frase promete que alguém olha, alguém tem de ser avisado"*.
**Eu só consertei a metade do DIZER.** A metade do **FAZER** — a fila, o aviso a
uma pessoa de verdade — **não está feita**, e sem ela a frase certa continua sem
mecanismo atrás. **Declaro em vez de alegar.**
