# FICHA — 06/09/2026 — a esteira precisa saber o que a Dioli faz

## O defeito, medido numa rodada REAL de hoje

`npx tsx scripts/coletar-99freelas.mts --limite 3 --gravar` gravou na fila do
CEO uma proposta para o projeto **"Melhoria visual do meu quarto"** — decoração
de quarto, móveis, estilo boho. Nota 3. O texto que a esteira escreveu diz, em
resumo: *"a Dioli Digital é uma agência de marketing digital... está fora do
nosso escopo de atuação, então não seríamos a equipe certa"*.

Ou seja: **a casa gastou IA para redigir uma recusa**, e essa recusa foi parar
na fila do CEO como se fosse uma proposta. Se alguém clicasse, **queimaria uma
conexão — que não volta — para dizer a um desconhecido que não somos a empresa
certa.**

## A causa
`eliminar()` (em `lib/marketplaces/99freelas/agente.ts`) só conhece:
- o que a **plataforma** proíbe (acadêmico, teste grátis, comissionado, vaga CLT)
- descrição curta demais para orçar

**Ele não sabe o que a Dioli faz.** E a casa JÁ construiu esse conhecimento:
`lib/agency/celula/catalogo-ofertavel.ts` (Decisão 5 do CEO, "catálogo derivado
da capacidade", mutação 6/6 vermelha). Hoje ele tem **um único chamador**:

```
$ grep -rn "catalogo-ofertavel" lib/ scripts/ app/
lib/agency/celula/simulador.ts:39:  import { avaliarServico } ...
```

O simulador. **O caminho real nunca pergunta.** Mesmo padrão que deixou a
frente inteira parada: peça construída, testada, e não parafusada.

## O que construir

### 1. `lib/marketplaces/99freelas/encaixe.ts` (novo)
```ts
export type Encaixe =
  | { encaixa: true; servicosPossiveis: string[] }   // ids de SERVICOS_DA_CELULA
  | { encaixa: false; motivo: string };

export function encaixaNaCasa(p: {
  titulo: string; descricao: string; categoriaDeclarada: string | null;
}): Encaixe;
```

**Determinístico, sem IA.** É trava de cota, e trava que depende do modelo
acertar não é trava — a mesma razão que o comentário de `eliminar()` já dá.

Como decidir: cada serviço de `SERVICOS_DA_CELULA` tem `nome` e `textos`.
Derive os termos de encaixe **desses campos e do mapa de capacidades**, e
considere só os serviços que `avaliarServico(id, { modoAutomatico: false })`
declara ofertáveis. **NÃO escreva uma lista de palavras-chave à mão num
`const`** — é exatamente o que o cabeçalho de `catalogo-ofertavel.ts` proíbe,
com o motivo escrito: lista congela um diagnóstico e ninguém lembra de editar.
Se você precisar de um mapa de termos, ele tem de ser **derivado** do catálogo,
e o teste tem de provar que um serviço novo no catálogo entra no encaixe **sem
ninguém editar o encaixe**.

**Fail-closed:** não deu para concluir que encaixa ⇒ **não encaixa**. Propor no
escuro custa conexão; não propor custa nada.

### 2. `eliminar()` passa a consultar o encaixe
Novo motivo de eliminação, **depois** dos motivos da plataforma e **antes** de
qualquer gasto: fora do escopo da casa ⇒ `{ eliminado: true, motivo: "fora do
que a Dioli entrega hoje: <o motivo do encaixe>" }`.

O projeto continua sendo **gravado** como `Oportunidade` com o motivo em
`raciocinio` (o descartado aparece, não some — já é assim hoje). O que muda é
que **nenhuma IA é gasta e nenhuma proposta é escrita** para ele.

### 3. A régua de aceite
Rodar de novo `--limite 3 --dry-run` sobre projetos reais e "Melhoria visual do
meu quarto" (ou equivalente) sair como **`eliminado`**, não como proposta.

## Definição de pronto
- `__tests__/marketplaces/encaixe-na-casa.test.ts`, cada trava com as DUAS
  metades. Obrigatórios:
  1. o texto REAL do projeto do quarto (use o fixture; se não houver, cole o
     trecho no teste) ⇒ **não encaixa**.
  2. um projeto de social media / design para redes ⇒ **encaixa**, e nomeia o
     serviço.
  3. texto ambíguo ou vazio ⇒ **não encaixa** (fail-closed), e o teste prova
     que é por fail-closed, não por acidente.
  4. serviço cuja capacidade está fechada no mapa **não** aparece em
     `servicosPossiveis` (prova que o encaixe respeita `avaliarServico`).
  5. **a prova anti-lista:** acrescentar um serviço ao catálogo o torna
     alcançável pelo encaixe sem editar `encaixe.ts`.
- `__tests__/marketplaces/custo-desconhecido.test.ts` e `99freelas.test.ts`
  continuam verdes — **se algum quebrar, NÃO adapte em silêncio: relate qual e
  por quê.** Atenção: há testes que hoje passam por `eliminar()` com textos que
  podem não encaixar na casa; se for esse o caso, o certo é o teste declarar um
  texto que encaixa, não o encaixe afrouxar.
- `npx tsc --noEmit` limpo — rode **depois** de escrever os testes.

## O que NÃO fazer
- ⛔ Não escreva lista de palavras-chave à mão. Derive do catálogo.
- ⛔ Não use IA na decisão de encaixe.
- ⛔ Não toque em `catalogo-ofertavel.ts`, `portao.ts`, `conexoes.ts`,
  `contador.ts`, `coleta.ts`, `gravar-candidatura.ts` nem `redator.ts`.
- ⛔ Não mexa no preço — **é outra frente, despachada em paralelo.**
- ⛔ Nada de envio, login, merge, deploy ou migração. Não commite.
- Se não conseguir rodar `npx`/`node`, diga com a mensagem exata de recusa.
