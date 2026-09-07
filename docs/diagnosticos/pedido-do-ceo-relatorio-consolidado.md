# ORDEM DO CEO ao Diretor Geral — compilar e explicar

> **Recebida em 28/08/2026, de manhã, depois do resumo da madrugada.**
> Palavras dele:
>
> *"Quero que passe tudo isso pro diretor compilar e peça a ele pra me trazer um
> relatório, me explica o que significa isso e a solução."*
>
> Repassado pelo Diretor da Dioli Digital, que é quem recebeu a ordem.

---

## O que ele está pedindo, e o que ele NÃO está pedindo

**Ele quer entender e decidir. Não quer inventário.**

O resumo que ele leu tinha seis achados. A pergunta dele não foi *"o que vocês
fizeram?"* — foi **"o que isso significa, e qual é a solução"**. São duas
perguntas por achado, e a segunda é a que ele vai usar.

⚠️ **Ele não é desenvolvedor e não lê código.** Nome de arquivo, número de PR e
termo técnico não ajudam: atrapalham. O relatório tem de funcionar para alguém
que nunca abriu o repositório.

---

## O material — tudo já está escrito e mergeado

| Documento | O que tem dentro |
|---|---|
| `docs/diagnosticos/a-jornada-do-parceiro-de-ponta-a-ponta.md` | a travessia do cliente parceiro, medida, com o adendo do que foi consertado |
| `docs/diagnosticos/triagem-dos-prs-parados-28-08.md` | os 8 trabalhos parados, os vereditos, e a base órfã |
| `docs/diagnosticos/o-custo-de-construir-28-08.md` | os números de custo e o trabalho pago que não chegou |
| `docs/diagnosticos/fusao-de-cliente-duplicado.md` | o cadastro duplicado do primeiro cliente |
| `docs/pendencias.md` (topo) | o que está aberto e o que já foi fechado |

---

## Os seis achados, e a pergunta que cada um levanta

Cada linha abaixo é **um item do relatório**. O que falta em cada uma é o que
só o Diretor Geral consegue dar: **o significado para o negócio e a decisão**.

### 1. A pergunta de verba ao parceiro — CONSERTADO, no ar

O sistema perguntava ao parceiro quanto ele pretendia gastar. Ele não paga nada.
Foi o que travou a conversa do primeiro cliente real e fez o orçamento não sair.

> **Para o relatório:** era a **décima primeira** vez que a casa construiu um
> mecanismo e não ligou ninguém nele. **O padrão é o achado, não o caso.**
> Qual é a solução para o padrão?

### 2. Vazamento entre clientes — CONSERTADO, no ar

Qualquer pessoa com acesso ao painel lia e alterava a ficha de marca de clientes
de **outras agências**. Aberto por 12 dias.

> **Para o relatório:** o conserto existia desde 16/08 e ficou preso. **O
> problema não foi ninguém saber consertar — foi o conserto não chegar.**
> ⚠️ E uma rota foi fechada, **não a classe inteira** — a varredura do resto
> continua aberta.

### 3. A ferramenta interna que furava a própria regra — CONSERTADA

A ferramenta oficial de coordenação empurrava trabalho para o sistema no ar sem
revisão, em silêncio.

> **Para o relatório:** a casa tem a regra "nada entra sem revisão" e a
> ferramenta que todos usam a violava. **Quantas outras ferramentas internas
> nunca foram medidas contra as próprias regras da casa?**

### 4. Doze dias de trabalho parado — JULGADO, não recuperado

Oito trabalhos prontos, esquecidos. Sete deles **tecnicamente impossíveis de
aproveitar**: a base foi refeita por baixo e eles ficaram órfãos.

> **Para o relatório:** isto é processo, não código. **A causa-raiz não foi
> investigada** — e é ela que decide se acontece de novo.

### 5. 💰 O custo — o maior bolso é coordenação

Servidor de tudo: **US$ 41/mês**. Já gasto em construção: **~US$ 6.900**. E
**61,8% disso é a camada que coordena**, não os produtos. Uma única sala de
coordenação custou mais que um produto inteiro.

> **Para o relatório, e é o item mais difícil:** isto **não é desperdício
> provado**. Coordenação que destrava seis produtos pode ser o melhor dinheiro
> da casa. **A pergunta que o CEO precisa conseguir responder é: está valendo?**
> Hoje ninguém consegue responder, porque ninguém media.
>
> ⚠️ Número é **piso medido**, não fechamento contábil. Não apresentar como total.

### 6. US$ 1.198 pagos por trabalho que não chegou

Onze sessões de 15-16/08, paradas — **75% de tudo que a Dioli Digital gastou**.
São os mesmos assuntos dos trabalhos órfãos do item 4.

> **Para o relatório:** o dinheiro **já saiu**. A pergunta não é como recuperar
> — é **o que impede a próxima vez**.

---

## O que o CEO precisa decidir (e é curto)

1. **A leitura dos dois cadastros do FOOCCI** — nenhuma sala tem credencial do
   sistema no ar, e essa parede é deliberada. Só o agente de navegador dele lê.
2. **Se e quando** atacar as quatro frentes adiadas: a varredura de vazamentos,
   a causa-raiz da base órfã, os cinco trabalhos que ninguém julgou, e o
   departamento financeiro por produto (ordem dele, ainda não feita).

---

## Uma recomendação de forma, e o Diretor Geral decide

**Um relatório de uma página, seis itens, cada um com três linhas:** o que
aconteceu · o que significa para o negócio · o que se faz a respeito. Sem anexo,
sem apêndice técnico.

*O resumo é o entregável, não o apêndice.* Se ele só ler os títulos, tem de
saber o que aconteceu, o que quebrou e o que se pede dele.

⚠️ **Um pedido meu, e é o que mais importa neste documento:** o item 5 é sobre o
gasto da própria sala do Diretor Geral. **Ele não deve ser suavizado por isso.**
Foi ele quem me disse para continuar discordando — e o mesmo vale na direção
contrária.
