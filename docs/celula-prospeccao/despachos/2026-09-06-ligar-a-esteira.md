# FICHA DE DESPACHO — 06/09/2026 — LIGAR A ESTEIRA DO 99FREELAS

## Objetivo em uma frase
Fazer um projeto REAL do 99Freelas atravessar a esteira já construída e parar
como `Oportunidade` no banco, com `propostaTexto` preenchido e `status: "nova"`,
esperando o CEO. **Nada é enviado a ninguém.**

## O diagnóstico já medido (não re-meça, construa em cima)

1. `lib/marketplaces/99freelas/agente.ts` (`processarProjeto`, `rodada`) é a
   esteira inteira e **está testada**. Ela **NÃO TEM NENHUM CHAMADOR** fora de
   `__tests__/`. Medido com grep em 06/09/2026. É por isso que a frente nunca
   rodou.
2. `Candidatura` (a saída da esteira) **não é persistida em lugar nenhum**.
   Grep em todo o repo: só aparece dentro do próprio `agente.ts`.
3. O destino certo já existe e é o model `Oportunidade` (prisma/schema.prisma
   linha ~2062): tem `plataforma`, `urlExterna`, `titulo`, `descricao`,
   `categoria`, `orcamentoInformado`, `textoBruto`, `impressaoDigital`, `nota`,
   `raciocinio`, `status` (nova|aprovada|recusada|enviada), `propostaTexto`,
   `valorSugerido`, `conformidadeOk`, `conformidadeAchados`,
   `propostaHigienizada`, `precoDetalhe`. **Não crie tabela nova.**
4. Hoje `propostaTexto` só é escrito por PATCH manual em
   `app/api/agency/oportunidades/[id]/route.ts` — ou seja, por um humano
   digitando. Nada gera.
5. **A rede alcança o 99Freelas e a leitura é pública, sem login.** Medido com
   `curl` em 06/09: `GET /projects` → HTTP 200; `GET /project/<slug>` → HTTP 200
   com título, descrição inteira, categoria, subcategoria, orçamento, valor
   mínimo, nível, nº de propostas e data de publicação em HTML servidor.
6. **Fixtures reais já estão no repo**, capturados hoje:
   - `__tests__/fixtures/99freelas/busca-2026-09-06.html` (a busca, 8 projetos)
   - `__tests__/fixtures/99freelas/projeto-781493-2026-09-06.html` (detalhe)
   Use-os como base dos testes — teste que depende de rede é teste que alguém
   desliga.

## O que construir — as três juntas que faltam

### A. `lib/marketplaces/99freelas/coleta.ts` — parsers PUROS
- `extrairLinksDaBusca(html: string): string[]` — devolve URLs absolutas de
  `/project/<slug>-<id>`. Deduplica. Ignora `/project/new`.
- `extrairProjeto(html: string, url: string): ProjetoColetado | null` —
  título, descrição inteira, categoria, subcategoria, orçamento (string como
  veio E `orcamentoInformado: number | null` só quando houver número em reais),
  nível, nº de propostas, publicado em, `valorMinimo`.
  **Ausência não vira zero nem string vazia — vira `null`.** ("Aberto" no
  orçamento é ausência de valor, NÃO é R$ 0.)
- `paraProjetoBruto(p: ProjetoColetado): ProjetoBruto` — monta o tipo que
  `agente.ts` consome, com `conteudoDeTerceiro` = o texto visível montado
  (título + descrição + categoria + orçamento), `custoEmConexoesLidoDaTela:
  null` (a tela pública não mostra), `horasDesdeAPublicacao` calculado da data.
- **Sem `fetch` dentro deste arquivo.** A rede entra por injeção.

### B. `lib/marketplaces/99freelas/gravar-candidatura.ts`
- `gravarCandidatura({workspaceId, coletado, candidatura}, db)` →
  cria/atualiza `Oportunidade`. **Idempotente por `impressaoDigital`**
  (reuse a função de hash que a casa já usa — procure em
  `lib/agency/comercial/`; não invente uma segunda).
- `status` fica **`"nova"`** sempre. Nunca `"aprovada"`, nunca `"enviada"`.
  Gravar `aprovada` seria a máquina aprovando a si mesma.
- `propostaTexto` só quando `desfecho === "aguardando_clique_humano"`.
  Desfecho `eliminado`/`parado` grava a oportunidade com `propostaTexto: null`
  e o motivo em `raciocinio` — **o descartado aparece, não some**.
- `conformidadeOk`, `conformidadeAchados` (JSON), `precoDetalhe` (JSON do
  `Preco`), `valorSugerido` = `preco.ofertaADigitar`.

### C. `scripts/coletar-99freelas.mts` — O CHAMADOR
- `--limite N` (padrão 3), `--dry-run` (padrão LIGADO: só imprime, não grava),
  `--gravar` para gravar de verdade.
- Fluxo: busca → links → detalhe de cada um (com pausa de ≥3s entre requisições
  — ritmo de máquina foi o que custou a conta da Meta em 03/08) → `rodada()` →
  `gravarCandidatura`.
- User-Agent de navegador real. Nunca paralelize as requisições.
- O `redigirProposta` entra por injeção. Duas fontes, escolhidas por flag:
  - `--redator=ia` (**o caminho de produção**): usa `lib/ai/generate.ts`.
  - `--redator=cli` (**substituto declarado, para hoje**): chama
    `claude -p` por `spawn`. Existe porque **não há `ANTHROPIC_API_KEY` no
    ambiente** — medido hoje. Deixe isso escrito no cabeçalho do arquivo.
- O texto redigido tem de passar pelo juiz editorial que já existe
  (`lib/agency/celula/mensagens/anti-generico.ts` e `juiz-editorial.ts`).
  **Não escreva um segundo juiz.** Se o texto for genérico, o script mostra a
  reprovação — isso é achado, não falha do script.

## Definição de pronto
- `npx tsc --noEmit` limpo (rode DEPOIS de escrever os testes, não antes).
- Testes novos em `__tests__/marketplaces/coleta-99freelas.test.ts` e
  `__tests__/marketplaces/gravar-candidatura.test.ts`, usando os fixtures REAIS
  acima e banco real (siga o padrão de `__tests__/celula/jornada-ponta-a-ponta.test.ts`).
- Cada trava com as DUAS metades: barra o problema plantado E não inventa
  problema no caso limpo.
- `npx vitest run __tests__/marketplaces/` verde.

## O que NÃO fazer
- ⛔ Não envie nada a ninguém. Nenhum POST no 99Freelas. Nenhum login.
- ⛔ Não crie tabela nova nem migration.
- ⛔ Não mexa na falha de auth herdada (senha na query string) — é frente de
  outro dono.
- ⛔ Não escreva um segundo juiz editorial nem um segundo motor de preço.
- ⛔ Não marque nada como `aprovada`/`enviada`.

## Critério de aceite
Rodar `npx tsx scripts/coletar-99freelas.mts --limite 3 --dry-run --redator=cli`
imprime, para 3 projetos reais coletados na hora, o desfecho de cada um e o
texto da proposta dos que passaram.
