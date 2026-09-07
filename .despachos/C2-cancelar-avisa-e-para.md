# FICHA — cancelar avisa os dois lados e PARA a produção

**Ordem do CEO, aprovada em 29/08/2026.**

## O DEFEITO, JÁ MEDIDO PELO DIRETOR — não refaça o diagnóstico

Em `app/api/portal/approvals/route.ts` os três atos do cliente têm consequência —
**menos um**:

| Ato do cliente | O que dispara | Onde |
|---|---|---|
| recusar (`rejected`) | `recusarPorPedidoDoCliente` | `route.ts:510` → `lib/agency/esteira/refacao.ts` |
| pedir ajuste (`revision_requested`) | `refazerPorPedidoDoCliente` | `route.ts:523` → `refacao.ts` |
| **cancelar (`cancelled`)** | **NADA. Não existe ramo.** | — |

O status é gravado (`route.ts:400`) e uma linha de transição é escrita — e
**nenhuma tela lê essa linha**. Resultado medido no percurso de cliente oculto:
**zero aviso ao cliente, zero evento para a agência, e o projeto segue em
`production`.** A casa paga IA por peça que ninguém vai usar.

## O QUE O CEO APROVOU
> "Cancelar avisa cliente e agência, e interrompe a produção na hora."

E o que ele vai cobrar, com todas as letras:
> "Ache **todo** caminho que produz peça e prove que o cancelamento alcança os que
> já estão **em voo** — não só os que ainda não começaram."

## AS DUAS METADES

### Metade A — avisa os DOIS lados
- **O cliente** recebe confirmação de que o cancelamento foi registrado, em
  português, com o que acontece agora. *Tela e aviso sem próximo passo é meio
  defeito consertado.*
- **A agência** recebe um evento que aparece **numa tela que alguém abre**.
  ⚠️ Escrever numa tabela que ninguém lê é exatamente o defeito atual — não o
  repita com outro nome. **Diga qual tela mostra, com arquivo e linha.**
- Use os mecanismos que **já existem** para recusar/ajustar. Não invente um canal
  novo se a casa já tem um. Varra e reaproveite.

### Metade B — PARA a produção, inclusive o que já está em voo
Esta é a metade cara, e é onde o CEO vai olhar.

1. **Varra TODO caminho que produz peça** — os motores de departamento, a fila, o
   relógio/despertador, os agendados, as rotinas de `.github/workflows/` que
   produzem, e o que mais achar. **Liste-os no relato.**
2. Para cada um, responda: **cancelou, ele para?** E prove, não afirme.
3. Distinga os dois casos e trate os dois:
   - o que **ainda não começou** → não pode começar;
   - o que **já está em voo** → tem de ser interrompido ou descartado ao terminar,
     e **nunca** ser entregue como se valesse.
4. Se algum caminho **não puder** ser interrompido (processo externo já disparado),
   **declare** — e faça com que o resultado dele não vire entrega. *Recusa
   declarada vale mais que verde inventado.*

## ⛔ VEDADO NESTE BLOCO — ordem direta do CEO
**NÃO escreva NENHUMA regra de desistência, multa, devolução ou reembolso.**
O CEO mandou consultar o jurídico e a casa não tem jurídico. **Fica parado até ele
falar com um advogado.** Se cruzar com esse assunto no código: **ANOTE E SIGA.**

Isto NÃO impede o item: parar a produção e avisar é operação, não é regra de
dinheiro. **Se você se pegar escrevendo quanto alguém recebe de volta, parou no
lugar errado.**

## OUTRAS RESTRIÇÕES
- Não toque em `lib/agency/execution/negotiate-proposal.ts`,
  `lib/agency/esteira/orcamento-do-briefing.ts` nem em
  `app/api/portal/briefing/proposta/route.ts` — **outra frente está neles**.
- Não toque em `lib/agency/comercial/`, `app/api/piloto/`, `scripts/`.
- ⛔ Nenhuma mensagem a pessoa real. Nenhuma cobrança. Nada em Meta/Google/TikTok.
- **Não commite. O Diretor commita.**

## O TESTE
Alcançando o **código real** (a rota que o cliente chama, não uma cópia):
1. cliente cancela → **o cliente é avisado**;
2. cliente cancela → **a agência é avisada, e o aviso aparece na tela que você
   nomeou**;
3. cliente cancela → **a produção para**: um caminho que produziria peça deixa de
   produzir. Prove pelo menos um caminho **em voo**, não só um que nem começou;
4. cancelar **não** ressuscita nem reabre nada que a casa já trata como sem volta
   (`lib/agency/esteira/reabrir-aprovacao.ts:123` — `rejected` e `cancelled` não
   voltam). Não afrouxe isso.

## CRITÉRIO DE ACEITE
1. **Quem CHAMA o que você escreveu** — arquivo e linha, inclusive a tela do aviso.
2. **A lista dos caminhos que produzem peça** que você varreu, e o veredito de cada
   um: para / não para / não pôde ser interrompido.
3. **Quebre cada trava nova de propósito e veja VERMELHO**, uma a uma, e relate.
4. `npx tsc --noEmit` limpo, **depois** de escrever o teste. Mock com
   `vi.hoisted(() => vi.fn())` sem assinatura já barrou o CI desta casa cinco vezes.
5. `npx vitest run` verde nos arquivos tocados.
6. **Declare o que NÃO conseguiu provar.**
7. Se algum comando for recusado, **cole a mensagem exata**.
