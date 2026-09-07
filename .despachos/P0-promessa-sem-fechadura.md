# 🔴 P0 AO VIVO — o SDR promete ao PARCEIRO e nada é registrado

**O CEO acabou de ver a tela.** Marcos (Foocci, **parceiro real**) está esperando
agora. Já aconteceu **quatro vezes**. Palavras do CEO: *"já teríamos perdido o
cliente."*

## O QUE ELE VIU
Marcos cobrou:
> *"Já se passou mais de 1h desde a promessa de retorno 'ainda hoje' e ainda não
> recebi a proposta formal."*

O SDR respondeu:
> *"Vou conferir com o gerente de projeto se cabe no cronograma. (…) precisa de
> aprovação de gestão. **Vou trazer essas duas respostas para você ainda hoje —
> pode deixar comigo.** 🙂"*

**Não existe gerente de projeto sendo consultado. Não existe pedido de aprovação.
Não existe tarefa, alarme, prazo nem dono.** A frase é plausível e não tem
mecanismo nenhum atrás dela.

## ⚠️ NÃO RECONSTRUA NADA — O DIRETOR JÁ MEDIU

**A máquina EXISTE e ESTÁ LIGADA:**
- `lib/agency/comercial/promessa-que-a-maquina-nao-cumpre.ts`
- chamada em `app/api/sdr/chat/route.ts:1504-1507` (`promessasSoltas` →
  `limparPromessaSolta`)
- **e a fila de promessa também já existe**, entregue hoje de manhã:
  `lib/agency/esteira/promessa-de-contato.ts`,
  `app/api/agency/conversas-sem-pedido/route.ts`, tela em `app/agency/leads/page.tsx`,
  atribuição de dono em `lib/agency/comercial/atribuir-conversa-orfa.ts`.

**O QUE ESTÁ QUEBRADO É O ELO.** Rodei as frases reais contra a função real:

| frase mandada ao parceiro | detectada? |
|---|---|
| "Vou conferir com o gerente de projeto se cabe no cronograma." | ❌ **PASSA** |
| "Isso precisa de aprovação de gestão." | ❌ **PASSA** |
| "Vou trazer essas duas respostas para você ainda hoje — pode deixar comigo." | ❌ **PASSA** |
| "pode deixar comigo" | ❌ **PASSA** |
| "Vou verificar com a equipe e te retorno ainda hoje." | ❌ **PASSA** |
| "Vou conferir e te aviso." | ❌ **PASSA** |

**Seis de seis passam.** A trava não pega nada do que o SDR de fato disse.

## O QUE CONSTRUIR — as quatro do CEO

### 1. A frase não sai sem compromisso registrado
Promessa detectada → **um registro com DONO e PRAZO é criado no mesmo ato**.
**Reaproveite `promessa-de-contato.ts` e a fila que já existe** — não crie um
segundo mecanismo. Se o registro **não** puder ser criado, **a frase não sai**:
cai no caminho que já existe (`limparPromessaSolta` + `O_QUE_DIZER_NO_LUGAR`).
*Sem fechadura, não se promete.*

### 2. Compromisso vencido GRITA
Passou o prazo sem entrega → alarme com **nome do cliente, o que foi prometido e
há quanto tempo**. Veja se a rotina/despertador da casa já tem onde isto entrar —
**procure antes de criar**. *Promessa que ninguém cobra é pior que promessa não
feita: o cliente está esperando.*

### 3. Escalar é ATO, não frase
*"precisa de aprovação de gestão"* / *"vou conferir com o gerente"* só podem sair
se **o pedido de aprovação existir** e alguém for avisado. Senão, barra.

### 4. A saída honesta
Se nada disso puder ser criado no momento, o SDR **diz o que sabe e diz que não
tem prazo** — em vez de inventar um. Melhor um "não sei" verdadeiro que um "ainda
hoje" falso.

## ⚠️ AS DUAS METADES DA TRAVA — obrigatórias
1. **Pega o caso plantado**: as seis frases da tabela acima viram VERMELHO.
2. **NÃO inventa problema no caso limpo.** O módulo já protege, de propósito, o
   que NÃO é promessa solta — *"confirme para eu preparar seu orçamento"* (instrução
   sobre o que a casa realmente faz) e a equipe prometendo por si quando há fila.
   **Leia o cabeçalho do módulo inteiro antes de mexer na régua** — ele explica
   quais frases são legítimas e por quê. **Se você quebrar os testes existentes
   desse módulo, você alargou demais.** Meia trava é pior que trava nenhuma:
   parece inteira.

## RESTRIÇÕES
- ⛔ **NÃO mande mensagem para o Marcos nem para ninguém.** Quem fala com ele é o
  CEO ou o Diretor.
- ⛔ **NÃO escreva regra de cancelamento, multa, devolução ou reembolso** — vedado
  pelo CEO até ele falar com advogado.
- Não toque em `app/api/portal/approvals/route.ts` nem em
  `lib/agency/esteira/refacao.ts` — **outra frente está neles agora**.
- Não toque em `prisma/schema.prisma` — reivindicado por outra sessão viva.
- **Não commite. O Diretor commita.**

## CRITÉRIO DE ACEITE
1. **Quem CHAMA o que você escreveu** — arquivo e linha.
2. **Um teste que reproduz ESTA conversa**: a resposta real do SDR ao Marcos, com
   promessa e sem compromisso registrado, tem de ficar **VERMELHO**.
3. **Os testes existentes de `promessa-que-a-maquina-nao-cumpre` continuam verdes.**
4. **Quebre cada trava nova de propósito e veja VERMELHO**, uma a uma, e relate.
5. ⚠️ **Se você não conseguir rodar `npx`/`node`/`vitest`** (`This command requires
   approval`), **DIGA NO TOPO** e não apresente raciocínio como medição. Eu rodo.
6. **Declare o que não conseguiu provar.**
