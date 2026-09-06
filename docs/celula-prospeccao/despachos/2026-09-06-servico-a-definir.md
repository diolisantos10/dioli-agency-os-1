# FICHA — 06/09/2026 — a fila do CEO diz "Serviço: a definir" nas três, e a casa já sabe a resposta

## O defeito — visto na TELA, não em teste
Subi o app e olhei `/agency/oportunidades` como o CEO. As três propostas reais
da rodada de hoje mostram, cada uma:

```
Serviço: a definir      Valor sugerido: R$ 30
```

```
$ grep -rn "servicoSugerido" lib/marketplaces/99freelas/gravar-candidatura.ts
(nada)
```

A coluna `servicoSugerido` existe no model `Oportunidade`, o cartão
(`components/agency/comercial/CartaoDeOportunidade.tsx`) a exibe, e o gravador
**nunca a escreve**.

**E a informação existe.** `encaixaNaCasa()`
(`lib/marketplaces/99freelas/encaixe.ts`, construído hoje) devolve
`servicosPossiveis: string[]` — os ids de `SERVICOS_DA_CELULA` que o projeto
alcança. **A esteira calcula e joga fora.**

Nenhum teste pegaria: cada peça está certa sozinha. Só olhando a tela é que
"a definir" três vezes salta.

## O que construir

### 1. A candidatura carrega o serviço
Em `lib/marketplaces/99freelas/agente.ts`, `Candidatura` ganha
`servicosPossiveis: string[]` (vazio quando não houver). Preencha a partir do
resultado do encaixe que `eliminar()` **já calcula** — **não chame
`encaixaNaCasa` uma segunda vez**: calcular a mesma coisa duas vezes é como as
duas respostas passam a divergir.

### 2. `gravarCandidatura` grava
`servicoSugerido` recebe o **nome legível** do serviço (o campo `nome` de
`SERVICOS_DA_CELULA`, ex. "pacote de peças para redes sociais"), não o id
técnico — quem lê o cartão é o CEO, não um programador.

- **Zero serviços** ⇒ `null` (a tela volta a dizer "a definir", que aí é
  verdade).
- **Mais de um** ⇒ liste-os de forma legível, sem escolher por conta própria.
  **Não invente um "principal"** — a casa não tem regra de desempate, e criar
  uma escondida dentro do gravador seria decidir negócio num módulo de
  persistência.

## Definição de pronto
- Acrescente a `__tests__/marketplaces/gravar-candidatura.test.ts` (**não
  reescreva o arquivo**), cada trava com as DUAS metades:
  1. candidatura com um serviço ⇒ `servicoSugerido` é o **nome legível**, não o id.
  2. candidatura com zero serviços ⇒ `servicoSugerido` é `null` (a metade que
     prova que você não carimbou um serviço em todo mundo).
  3. candidatura com dois ⇒ os dois aparecem, nenhum é escolhido como principal.
  4. o valor gravado **existe de fato** em `SERVICOS_DA_CELULA` — prova contra
     digitar um nome à mão que o catálogo não tem.
- `npx tsc --noEmit` limpo — rode **depois** de escrever os testes.
- `npx vitest run __tests__/marketplaces/` inteiro verde. **Se um teste antigo
  quebrar, relate qual e por quê; não adapte em silêncio.**

## O que NÃO fazer
- ⛔ Não chame `encaixaNaCasa` duas vezes. Uma fonte, um resultado.
- ⛔ Não invente critério de desempate entre serviços.
- ⛔ Não toque em `encaixe.ts`, `catalogo-ofertavel.ts`, `escopo-declarado.ts`,
  `preco.ts`, `portao.ts`, `redator.ts`, `coleta.ts` nem nos componentes de tela.
- ⛔ Nada de envio, login, merge, deploy ou migração. Não commite.
- Se não conseguir rodar `npx`/`node`, diga com a mensagem exata de recusa.
