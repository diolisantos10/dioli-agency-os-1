# FICHA — 06/09/2026 — medir o acerto do encaixe ANTES de mexer no critério

## Por que medir e não consertar
`encaixe.ts` entrou hoje e **já muda o comportamento em dado real**: decide se a
casa gasta IA e se a proposta existe. Ele casa por **palavra solta** derivada do
nome/textos dos serviços, e isso erra — medido:

- "Criação de **roteiros** para **vídeos** de viagens no YouTube" ⇒ sugeriu
  *"edição de vídeo a partir do material do cliente"*. É trabalho de roteiro,
  não de edição. Casou em "vídeo".
- "**Voz** humana para guia sertaneja" ⇒ mesma sugestão errada.

**Trocar o critério sem medição é trocar um erro conhecido por um desconhecido.**
E o erro caro é o **falso-negativo** (projeto bom eliminado), que é **invisível
por construção**: projeto eliminado não deixa proposta para ninguém conferir.

## O que construir

### `scripts/medir-encaixe-99freelas.mts`
Um script de **medição**, não de produção:

- `--paginas N` (padrão 3): percorre a busca do 99Freelas paginada, junta os
  links, lê cada projeto. **Sequencial, pausa ≥3s, só GET, nunca login.**
  Reuse `buscarHtml`/`resolverUrl`/`esperar` que já existem — **não escreva um
  segundo cliente HTTP.**
- **Não chama IA nenhuma.** Só `extrairProjeto` + `encaixaNaCasa` + `eliminar`.
  É medição de trava determinística; gastar IA aqui seria pagar para medir.
- **Grava o resultado em disco** como JSON e como tabela legível em
  `docs/celula-prospeccao/medicoes/encaixe-<AAAA-MM-DD>.json` / `.md`, com, por
  projeto: url, título, categoria declarada, veredito (`encaixa` / `não
  encaixa`), `servicosPossiveis`, e o motivo de eliminação quando houver.
- **Não decide nada e não muda `encaixe.ts`.** A rotulagem do que era certo é
  humana e vem depois.
- `import "dotenv/config"` como primeiro import (o defeito de hoje — não o
  repita).

### O resumo que o script imprime no fim
Contagens: quantos encaixaram, quantos não, quantos foram eliminados por motivo
de plataforma, e a distribuição por categoria declarada do 99Freelas. É esse
resumo que diz se o critério está largo ou estreito.

## Definição de pronto
- `__tests__/marketplaces/medir-encaixe.test.ts` — o script tem de ter a lógica
  pura testável **em `lib/`, nunca em `scripts/`** (o `tsconfig` exclui
  `scripts/` do programa; foi o defeito 4 de hoje, não o repita). No mínimo:
  1. o resumo conta certo uma amostra fabricada (encaixa / não encaixa /
     eliminado por plataforma), e as três contagens somam o total.
  2. a metade oposta: amostra vazia ⇒ resumo com zeros, sem divisão por zero.
- `npx tsc --noEmit` limpo — **depois** de escrever os testes.
- `npx vitest run __tests__/marketplaces/` verde.

## O que NÃO fazer
- ⛔ **Não altere `encaixe.ts`.** Esta ficha mede; não conserta. Se você achar o
  conserto óbvio, **escreva a recomendação no `.md` da medição** e pare.
- ⛔ Não chame IA. Não faça login. Não paralelize requisições.
- ⛔ Não toque em `agente.ts`, `gravar-candidatura.ts`, `escopo-declarado.ts`,
  `preco.ts`, `redator.ts` nem em componentes de tela.
- ⛔ Nada de envio, merge, deploy ou migração. Não commite.
- Se não conseguir rodar `npx`/`node`, diga com a mensagem exata de recusa —
  quem despachou roda o portão e a medição.
