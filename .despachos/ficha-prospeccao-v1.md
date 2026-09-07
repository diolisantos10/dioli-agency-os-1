# FICHA DE DESPACHO — Prospecção v1 (ordem do CEO, 30/08/2026)

## OBJETIVO (uma frase)
Entregar o **plano de prospecção executável** de Foocci e Dioli Digital, com a
origem e a base legal de cada lead declaradas, escrito em
`/home/user/control_room/docs/comercial/prospeccao-v1.md`.

## POR QUE AGORA
A casa gasta ~US$ 46/mês e a receita medida é **zero** em todos os produtos
(CityJobs tem 1 anunciante pagante; o resto é zero). O CEO: *"A gente só gastou
até agora, a gente não ganhou nada."*

## RÉGUA DO CEO — repetida com todas as letras
> *"Não adianta trazer 'está ok, blá-blá-blá' — traga a solução, o que você vai
> fazer."*
**Plano de ação, não diagnóstico.** Cada seção termina em ação com dono e data.

---

## ENTRADAS (leia antes de escrever qualquer linha)

| O quê | Onde |
|---|---|
| Jurídico da empresa — **leitura obrigatória** | `/home/user/control_room/docs/juridico/mapa-foocci.md` e `base-de-leis.md` |
| Regras do jurídico (as 5 que prendem os agentes) | `/home/user/control_room/docs/juridico/agentes.md` |
| A agência (esteira comercial, tabela, produtos) | `/home/user/diolidigital/` |
| O portão que barra promessa sem produtor | `/home/user/diolidigital/__tests__/comercial/so-vende-o-que-produz.test.ts` |
| Catálogo de vagas do Alto Tietê | `/home/user/cityjobs/` |

---

## AS 5 FRENTES — despache em PARALELO, não em fila

### F1 · A base legal da prospecção — **vem antes de tudo**
A LGPD art. 7º é lista **fechada** ("somente poderá"). **A origem do lead
determina qual amparo vale.** Lista comprada e raspagem NÃO têm o mesmo amparo
que quem preencheu formulário nosso.

- Copie o texto do art. 7º (e do art. 5º, e do que mais precisar) **da fonte
  oficial**, pelo caminho que já funciona e está registrado em `base-de-leis.md`:
  LexML → `legis.senado.leg.br`. **O Planalto devolve 503 — não perca tempo lá.**
- Se a lei entrar nova na base, **acrescente-a a `base-de-leis.md`** com URL e
  data de consulta. Não escreva artigo de memória.
- Produza a **régua de origem**: para cada origem possível (dado público de
  empresa/CNPJ, vaga publicada, formulário nosso, indicação, lista comprada,
  raspagem de rede social), diga **PODE / NÃO PODE / PODE COM AJUSTE**, com o
  artigo citado — ou escreva **"não achei"**, nunca "pode".
- Dê o veredito sobre **legítimo interesse** (art. 7º IX) para B2B frio e sobre
  o dever de informação/oposição. Se a resposta depender de advogado, **diga isso
  e pare** (regra 5 do departamento).

### F2 · O que a casa entrega HOJE — e o que ela NÃO entrega
- Varra `/home/user/diolidigital/` e escreva a **lista honesta**: item, existe
  produtor?, tem portão?, está ligado na esteira?
- ⚠️ **Verifique um achado específico:** consta que a **edição de vídeo está
  construída e ligada** (portal aceita vídeo, corta em 9:16, normaliza áudio) —
  e que a frase *"a casa não edita vídeo"*, que tirou vídeo dos planos em
  25/08, é **falsa hoje**. **Confirme no código ou refute.** Se confirmar, é
  argumento de venda parado — diga onde entra na oferta.
- Rode `so-vende-o-que-produz` e relate o resultado. Nada entra na oferta sem
  passar por ele.

### F3 · A lista de leads, com origem declarada
**Sem origem, o lead não entra na lista.** Toda linha traz: nome, produto-alvo,
origem, base legal (de F1), o gancho.
- **Foocci** (sistema para restaurante): temos 1 restaurante ativo — **Sushi
  Cazza**. O caminho mais curto é a região onde já operamos.
- **Dioli Digital** (a agência): o ativo que ninguém usou é o **CityJobs** —
  ele sabe **quais empresas do Alto Tietê estão contratando**. Empresa que
  contrata está crescendo, e é quem compra marketing.
- **MEÇA, não suponha:** abra o banco/seed/catálogo do CityJobs e diga o
  **número real** de empresas distintas com vaga, quantas têm dado de contato,
  e de que campo ele veio. **Se não virar lista, diga que não virou** e por quê.

### F4 · O argumento por produto
Um bloco por produto (Foocci · Dioli Digital), com: quem é o cliente, a dor em
uma frase, a oferta **dentro da tabela**, e a objeção mais provável com a
resposta. Preço: Foocci = a tabela lida em `mapa-foocci.md`. Dioli Digital =
teto **R$ 790**, preço de entrada por decisão do CEO — **abaixo** do piso de
mercado. **Nada fora disso.**

### F5 · Marketing dos nossos próprios produtos
Ordem do CEO: **a Dioli Digital assume o marketing dos nossos projetos.**
Foocci, CityJobs e FOOCCI Manager viram **clientes internos** da agência.
Proponha o plano — é a vitrine: *agência que não faz o próprio marketing não
vende marketing.* Diga o que a esteira já suporta e o que falta.

---

## ⛔ O QUE NÃO FAZER — limites inegociáveis do CEO
1. **NÃO mande mensagem, e-mail ou WhatsApp para NENHUMA pessoa real.** Você
   monta a lista e a abordagem; **disparar é outro ato**, e só com autorização
   caso a caso.
2. **NÃO prometa prazo, preço ou escopo** fora da tabela.
3. **NÃO invente número de mercado.** Pesquisa com fonte e data, ou declare que
   não achou.
4. **NÃO invente artigo de lei nem jurisprudência.** Citação inventada sai
   perfeita e destrói um caso.
5. **Nenhuma ação de escrita em Meta/Google/TikTok** sem parecer prévio do
   especialista da plataforma.

## DEFINIÇÃO DE PRONTO
O arquivo `/home/user/control_room/docs/comercial/prospeccao-v1.md` existe e
contém, nesta ordem:
1. A régua de origem e base legal (F1)
2. O que a casa entrega e o que NÃO entrega (F2)
3. A lista de leads com origem declarada (F3)
4. O argumento por produto (F4)
5. O plano de marketing próprio (F5)
6. **O primeiro passo concreto de segunda-feira (01/09)** — ação, dono, hora
7. **O que não consegui medir** — seção própria, com todas as letras

## CRITÉRIO DE ACEITE (eu vou conferir isto, linha a linha)
- Toda afirmação jurídica tem artigo citado com URL e data — ou "não achei".
- Todo lead tem origem. Lead sem origem = frente reprovada.
- O achado do vídeo foi **confirmado ou refutado com caminho de arquivo**.
- O número do CityJobs é **medido**, não estimado — ou está declarado como não
  medido, com o motivo.
- Nenhuma promessa fora da tabela.
- Existe ação com dono e data para segunda-feira.
- **Recusa declarada vale mais que verde inventado.**

## OBSERVAÇÃO OPERACIONAL
Escreva o arquivo. Não devolva só análise. O commit e o PR são meus.
