---
autor: especialista `meta` (trava obrigatória)
data: 29/08/2026
custo desta medição: US$ 0,00 — nenhuma chamada de IA paga, nenhuma chamada real à Graph API
escopo: MEDIR, não construir — nenhum componente/rota/endpoint foi criado nesta ficha
---

## Conclusão primeiro

- **`pages_read_engagement` → CONSTRUIR a tela.** É barato (1 arquivo novo de
  leitura reaproveitando um padrão já existente + 1 rota + 1 componente
  pequeno), o app já pede a permissão por padrão, e o token no cofre já a tem
  concedida. Recusar por não valer a pena seria jogar fora a permissão mais
  fácil das duas de resolver.
- **`instagram_manage_insights` → GRAVAR SÓ A PARTE QUE JÁ EXISTE, e tirar do
  vídeo (não do envio) o pedaço de `business_discovery`.** O que a Meta pede
  a mais — "insights sobre metadados e mídia do perfil público de **outra**
  conta profissional" — não tem uma linha de código nesta casa, a biblioteca
  capturada não documenta o endpoint (é lacuna, não memória), e o custo real
  não é só código: exige uma segunda conta pública de terceiro para testar
  contra, ao vivo, no dia da gravação. Isto já está decidido no
  `docs/plataformas/meta/passo-a-passo-do-ceo.md` (opção "a", 11/08/2026) —
  este documento confirma a medição de código que sustentava aquela decisão e
  não encontra motivo para revertê-la.

---

## 1. `pages_read_engagement`

### 1.1 — O que a Meta precisa VER na tela

Citação literal, `docs/plataformas/meta/fontes/permissoes-referencia.md:837-849`:

> **pages_read_engagement**
> Com a permissão pages_read_engagement, seu aplicativo pode ler conteúdo
> (publicações, fotos, vídeos e eventos) publicados pela Página, ler dados de
> seguidores (incluindo nome e PSID) e foto do perfil, bem como ler metadados
> e outras informações sobre a Página.
> **Screencast Requirements**
> Demonstre o processo completo de login do Facebook na plataforma do app,
> mostrando como o usuário concede essa permissão ao app.
> **Demonstre como o usuário do app acessa o conteúdo de um post na Página do
> Facebook dele na plataforma do app.**
> **Mostre que o conteúdo do post é exibido na plataforma do app.**

Cruzando com `docs/plataformas/meta/fontes/app-review-processo.md:20` — a regra
que decide se meio caminho basta:

> "Se pudermos testar o app, mas não conseguirmos testar a funcionalidade que
> requer uma permissão ou um recurso específico solicitado por você, não
> aprovaremos o acesso a essa permissão ou esse recurso."

E com `docs/plataformas/meta/fontes/pages-api-publicacoes.md:96-111` — a forma
exata da resposta que a tela precisa exibir:

> Para obter uma lista de posts da Página, envie uma solicitação GET ao ponto
> de extremidade `/page_id/feed`. [...] o app receberá a seguinte resposta
> JSON com uma matriz de objetos, incluindo a identificação, o horário de
> criação **e o conteúdo** de cada post da sua Página:
> `{"data":[{"created_time":"2019-01-02T18:31:28+0000","message":"This is my
> test post on my Page.","id":"page_post_id"}]}`

Sem LACUNA neste ponto: os três documentos cobrem exigência, regra de reprovação
e forma do dado.

### 1.2 — O que JÁ existe no código

Duas buscas, coladas:

```
$ grep -rn "pageId}/feed\|page}/feed\|/feed\"" --include=*.ts --include=*.tsx . | grep -v node_modules
__tests__/radar/fetcher.test.ts:17:    const items = await fetchFeedItems("https://feed");
__tests__/radar/fetcher.test.ts:25:    expect(await fetchFeedItems("https://feed")).toEqual([]);
__tests__/radar/fetcher.test.ts:30:    expect(await fetchFeedItems("https://feed")).toEqual([]);
lib/integrations/meta/client.ts:210:  const res = await graphPost<{ id: string }>(`${pageId}/feed`, token, {
```

(`__tests__/radar/fetcher.test.ts` é RSS de outra frente, sem relação com a
Meta — falso positivo do grep.)

```
$ grep -n "id,created_time\|pageId}/feed\|externalId}/feed" lib/integrations/meta/verificacao.ts
293:      const feed = await graphGet<{ data?: Array<{ id?: string; created_time?: string }> }>(
294:        `${alvo.externalId}/feed`,
296:        { fields: "id,created_time", limit: 1 },
```

Confirmado, arquivo por arquivo:

- `lib/integrations/meta/client.ts:210` (`publishFacebook`) chama
  `graphPost(pageId/feed, ...)` — é **escrita** (publicar), não leitura. Não
  serve ao screencast, que pede LEITURA de post existente.
- `lib/integrations/meta/verificacao.ts:293-296` (`exercitarAcesso`, ramo
  `"facebook"`) chama `graphGet({pageId}/feed, {fields: "id,created_time",
  limit: 1})` — **lê**, mas só pede `id` e `created_time`. **Nunca pede
  `message`** (o campo do conteúdo do post). E a saída não é tela: vira a
  string `prova` ("li a Página \"X\" e a última publicação (data)")
  consumida só por `/api/admin/diagnostico-de-conexoes`, uma rota
  administrativa manual — não um lugar onde "o usuário do app acessa o
  conteúdo" na acepção do requisito.
- **Nenhum componente React renderiza post de Página do Facebook.** Busca:

```
$ grep -rn "facebook" --include=*.tsx components/ app/ | grep -v node_modules
components/agency/MetaConnectManager.tsx
components/agency/clients/workspace/IntegrationsTab.tsx
components/agency/intake/IntakeEngine.tsx
components/portal/ConexoesDoCliente.tsx
app/page.tsx
app/termos/page.tsx
app/exclusao-de-dados/page.tsx
app/agency/orchestrator/page.tsx
```

Nenhum desses renderiza conteúdo de post — são telas de conexão/status
(mostram que a Página está conectada, nunca o que ela publicou). Confirmei
lendo `components/agency/clients/RedesDoCliente.tsx` (a tela que
`docs/plataformas/meta/passo-a-passo-do-ceo.md` linha 244 aponta como
evidência desta permissão): ela existe, mostra posts com legenda/mídia/link —
mas só de **Instagram**. A prova está na cadeia de chamadas:
`RedesDoCliente.tsx` → `/api/meta/feed` → `lerFeedDoCliente` (`leitura.ts:322`)
→ `contaDoCliente` (`leitura.ts:186-189`) → `conexaoDoCliente(workspaceId,
clientId, "instagram")` — o terceiro argumento é literal, nunca "facebook".
**A tabela do passo-a-passo do CEO aponta a rota certa, mas a tela que existe
hoje ali não cumpre o requisito desta permissão especificamente** — mostra
Instagram, não a Página do Facebook.

### 1.3 — O que faltaria construir

1. **`lib/integrations/meta/leitura.ts`** (arquivo ALTERADO, não novo) —
   adicionar:
   - `paginaDoCliente(workspaceId, clientId)`: mesmo papel de `contaDoCliente`
     (linhas 183-210), mas resolvendo `conexaoDoCliente(workspaceId, clientId,
     "facebook")` em vez de `"instagram"`. Pode ser a MESMA função
     generalizada com um parâmetro de plataforma, ou uma irmã — decisão de
     quem escrever, não muda o custo.
   - `lerFeedDaPaginaDoCliente(workspaceId, clientId, opts)`: mesmo padrão de
     `lerFeedPorConta` (linhas 275-316), chamando
     `graphGet({pageId}/feed, token, { fields: "id,message,created_time",
     limit })`. Campo extra a decidir: a API não devolve `permalink_url` por
     padrão (não está no exemplo capturado) — se quiser link clicável, pedir
     esse campo explicitamente e testar se a versão vigente (`v21.0`, ver
     `config.ts:21`) o aceita; sem ele, o link dá para montar como
     `https://www.facebook.com/{post_id}` (citado em
     `fontes/pages-api-publicacoes.md:117`).
   - Reaproveita cache (`doCache`/`guardarNoCache`) e teto de ritmo
     (`reservarChamadas`) já existentes no arquivo — não é infraestrutura
     nova, é mais uma chave de cache e mais uma reserva de chamadas.
   - ~50-70 linhas somadas ao arquivo.

2. **`app/api/meta/feed-pagina/route.ts`** (arquivo NOVO) — cópia do padrão de
   `app/api/meta/feed/route.ts` (55 linhas), trocando `lerFeedDoCliente` por
   `lerFeedDaPaginaDoCliente`. `requireSession(["master","
   project_manager"])` igual ao existente.

3. **`components/agency/clients/RedesFacebookDoCliente.tsx`** (arquivo NOVO) —
   versão reduzida de `RedesDoCliente.tsx` (que tem 270 linhas, boa parte é a
   grade de métricas de Instagram que a Página não precisa aqui): busca
   `/api/meta/feed-pagina?clientId=`, lista posts com `message` + data +
   link. ~120-150 linhas seguindo o mesmo padrão de estados
   (`carregando/sem-conexao/reconectar/erro/ok`) que `RedesDoCliente.tsx` já
   usa — não é design novo, é o mesmo esqueleto com menos colunas.

4. **`components/agency/clients/workspace/SocialMediaTab.tsx`** (arquivo
   ALTERADO, ~2-3 linhas) — montar `<RedesFacebookDoCliente clientId={...}
   />` ao lado de `<RedesDoCliente>`, dentro do mesmo `<div
   className="ccNativo">{children}</div>` já usado (linha 214). Confirmado
   que este é exatamente o caminho que
   `docs/plataformas/meta/passo-a-passo-do-ceo.md:244` chama de "Clientes →
   (cliente) → Redes" — a rota certa já está identificada, só falta o bloco
   de Facebook dentro dela.

Nenhuma migration: `MetaConnection` já tem `platform: "facebook"` como valor
de primeira classe (`lib/integrations/meta/types.ts:7,12`, usado hoje por
`publishFacebook`), e `conexaoDoCliente` já aceita esse valor sem alteração
(`connections.ts:225-229`).

### 1.4 — Estimativa honesta de esforço

- **1 arquivo alterado de leitura** (`leitura.ts`, +~60 linhas), **1 rota
  nova** (~55 linhas), **1 componente novo** (~130 linhas), **1 alteração de
  2-3 linhas** para montar o componente. Total: **4 arquivos tocados, 1 deles
  novo em UI, nenhuma migration.**
- **Permissão:** o app já pede `pages_read_engagement` por padrão
  (`config.ts:59`) e o token guardado no cofre já a tem concedida (registrado
  no cabeçalho deste especialista). Não bloqueia.
- **Dado real para a tela não nascer vazia:** aqui está o item que EU NÃO SEI
  medir por código — depende de um **cliente com uma Página do Facebook de
  verdade conectada, com pelo menos um post publicado**, para a gravação não
  cair num estado vazio. Não consultei o banco de produção (fora do escopo
  desta ficha, e seria leitura contra dado de cliente sem necessidade). Quem
  sabe se isso já existe é quem tem acesso ao painel administrativo/BD de
  produção.
- Nenhum teste automatizado novo é necessário para a gravação em si, mas a
  régua desta casa (CLAUDE.md) pede screenshot em 3 tamanhos e autoavaliação
  ≥8 antes de qualquer tela nova ir ao ar — isso soma tempo, não risco.

### 1.5 — Recomendação

**Construir a tela.** É a permissão mais barata das duas: reaproveita 100% da
infraestrutura de leitura já existente (cache, ritmo, tradução de erro),
segue exatamente o padrão que `RedesDoCliente.tsx` já implementou para
Instagram, e o app já tem a permissão concedida no token — não falta nada do
lado da Meta, só do lado do produto.

- O requisito da Meta é textual e específico ("mostre o conteúdo do post"); um
  vídeo sem essa tela tem risco real de reprovação just desta permissão.
- O custo é pequeno e o padrão já está resolvido (é literalmente copiar
  `RedesDoCliente.tsx` trocando Instagram por Facebook).
- Tirar esta permissão do envio custaria mais do que construir: ela é
  dependência declarada de `ads_management`, `business_management` e de
  quase toda a família Instagram (`permissoes-referencia.md:66,137,351,366,...`)
  — tirá-la quebraria o pedido de anúncios, que é o motivo original do App
  Review.

---

## 2. `instagram_manage_insights`

### 2.1 — O que a Meta precisa VER na tela

Citação literal, `docs/plataformas/meta/fontes/permissoes-referencia.md:564-578`:

> **instagram_manage_insights**
> Com a permissão instagram_manage_insights, seu aplicativo pode obter acesso
> a informações da conta do Instagram vinculada a uma Página do Facebook.
> **Seu aplicativo também pode descobrir e ler as informações de perfil e a
> mídia de outros perfis comerciais.** The allowed usage for this permission
> is to get metadata, data insights and story insights of an Instagram
> Business account.
> **Screencast Requirements**
> Demonstre o processo completo de login do Facebook na plataforma do app,
> mostrando como o usuário concede essa permissão ao app.
> Demonstre como acessar insights sobre metadados, publicações, fotos e vídeos
> da conta profissional do usuário do app no Instagram.
> **Demonstre como acessar insights sobre metadados e mídia do perfil público
> de uma conta profissional do Instagram em nome da conta profissional do
> Instagram do usuário do app.**

São **dois** requisitos de vídeo, e só o primeiro tem código:

1. Insights da CONTA PRÓPRIA do usuário do app → **existe**, ver 2.2.
2. Insights de metadados/mídia do perfil **PÚBLICO DE OUTRA** conta
   profissional (a Meta não nomeia o endpoint aqui, mas é a Business
   Discovery API — confirmado por
   `fontes/graph-api-limites-de-taxa.md:343`: *"Business Discovery and
   Hashtag Search API are subject to Platform Rate Limits"*) → **não existe**,
   ver 2.2 e 2.6 (lacuna).

### 2.2 — O que JÁ existe no código

Busca principal, com variantes:

```
$ grep -rn "business_discovery" --include=*.ts --include=*.tsx . | grep -v node_modules
(sem resultado)

$ grep -rn "businessDiscovery" --include=*.ts --include=*.tsx . | grep -v node_modules
(sem resultado)

$ grep -rn "business-discovery" --include=*.ts --include=*.tsx . | grep -v node_modules
(sem resultado)
```

**Confirmado: zero ocorrências em código.** (A frente anterior já tinha
medido isso; refiz a busca com as três variantes e o resultado é o mesmo.)

O que existe é só o requisito 1 — insights da própria conta:

- `lib/integrations/meta/leitura.ts:474-589` (`lerMetricasDaConta`) — chama
  `graphGet({igUserId}/insights, ..., metric: "reach", metric_type:
  "time_series")` e depois `metric: "reach,views,accounts_engaged,
  total_interactions", metric_type: "total_value"` — **é a própria conta do
  cliente**, nunca outra.
- `lib/integrations/meta/leitura.ts:625-669` (`lerMetricasDosPosts`) — mesma
  coisa por mídia/post, também só da própria conta.
- Saem por `app/api/meta/insights/route.ts` e são exibidos em
  `components/agency/clients/RedesDoCliente.tsx` (grade de números + tabela
  "Posts recentes", linhas 196-265) e em `components/portal/` (mesmos
  números, lado do cliente). **Isso cobre o item 1 do screencast, de verdade
  — é dado real, é tela real, funciona hoje.**

Confirmação adicional de que a busca por `business_discovery` também é vazia
na documentação capturada localmente (não é só o código):

```
$ grep -rln "discovery" docs/plataformas/meta/fontes/
docs/plataformas/meta/fontes/graph-api-limites-de-taxa.md
docs/plataformas/meta/fontes/app-criacao-e-tipos.md
docs/plataformas/meta/fontes/permissoes-referencia.md
```

Nenhum dos três é uma página dedicada ao endpoint `business_discovery` — são,
respectivamente: a nota de rate limit já citada; menções a
`instagram_creator_marketplace_discovery`/`facebook_creator_marketplace_discovery`
(permissões diferentes, sobre marketplace de criadores, não sobre ler perfil
público); e a frase do quadro de `instagram_manage_insights` já citada acima.

### 2.3 — O que faltaria construir

1. **`lib/integrations/meta/leitura.ts`** (alterado) — nova função, por
   exemplo `lerPerfilPublicoDoInstagram(workspaceId, clientId, usernameAlvo)`:
   `graphGet({igUserId}, token, { fields:
   "business_discovery.username(${usernameAlvo}){username,followers_count,
   media_count,biography,profile_picture_url,media.limit(6){caption,
   media_type,like_count,comments_count,timestamp,permalink}}" })`. Precisa
   de reserva própria no teto de ritmo (item já citado como sujeito a
   Platform Rate Limits) e tratamento de erro dedicado — perfil inexistente,
   privado, ou não-profissional devolve erro específico que hoje não tem
   frase mapeada em `frasearErroDeLeitura` (linhas 146-173).
2. **`app/api/meta/perfil-publico/route.ts`** (novo) — recebe `clientId` +
   `username` (do concorrente/referência a olhar), chama a função acima.
3. **Um componente novo** — um campo de busca ("digite o @ do perfil") dentro
   da aba Redes, com resultado (foto, seguidores, grade de mídia pública).
   Design novo de verdade (não é cópia de um padrão existente como no caso
   1): é a única tela desta casa que mostraria dado de uma conta que **não é
   de um cliente da agência** — precisa de rótulo claro ("perfil público de
   terceiro, não é dado do seu cliente") para não confundir com métrica
   própria.
4. **Preocupação de política, não só de código:** ler perfil de terceiro é
   sensível — `docs/plataformas/meta/fontes/praticas-comerciais-inaceitaveis.md`
   e `fontes/atributos-pessoais.md` (não citados aqui em detalhe porque o
   uso proposto é justamente o exemplo permitido pela própria Meta: "insights
   sobre metadados e mídia do perfil PÚBLICO", isto é, dado que a conta já
   torna público) — mas vale registrar como algo a decidir com o CEO antes de
   construir: para QUE a agência quer ver perfil de terceiro (benchmarking de
   concorrente do cliente?), porque isso muda o texto do "Descrição do caso
   de uso" que o formulário do App Review pede.

### 2.4 — Estimativa honesta de esforço

- **1 arquivo alterado** (`leitura.ts`, função nova + tratamento de erro
  dedicado, mais código que o caso 1 porque não há um padrão local para
  copiar), **1 rota nova**, **1 componente novo com desenho próprio** (não é
  cópia de padrão existente). Maior que o caso 1 em pelo menos um eixo:
  design de tela nova, não reuso.
- **O que falta saber, e que EU NÃO CONSIGO estimar por código:**
  - Se `business_discovery` funciona sem Advanced Access para o app desta
    casa, ou se ele já entra "cego" (a fonte capturada não documenta
    limites/pré-requisitos do endpoint em si — só a nota de rate limit).
    **LACUNA.**
  - Precisa de uma SEGUNDA conta profissional pública (de um terceiro real,
    não fake) para testar contra — não é dado que a casa já tem para um
    cliente, é dado de fora. Sem isso, nem o código dá para validar de
    verdade, e o vídeo do requisito 2 não sai.
  - Não há teste automatizado possível para "perfil de terceiro existe e é
    público" sem uma chamada real à Graph — ou seja, parte da validação só
    acontece no dia da gravação, contra a conta real, o que é exatamente o
    tipo de teste ao vivo que este especialista existe para desencorajar
    fazer sem plano.
- Sem esses três pontos resolvidos primeiro, **não dá para dar um número de
  arquivos/linhas com a mesma confiança do caso 1** — o código é estimável,
  o pré-requisito de dado real não é.

### 2.5 — Recomendação

**Gravar só o requisito 1 (conta própria) e tirar do vídeo — não do
envio — o requisito 2 (perfil de terceiro).** Ou seja: manter a decisão já
registrada em `passo-a-passo-do-ceo.md` (opção "a", 11/08/2026): enviar a
permissão, aceitar o risco de a Meta negar só esse pedaço.

- O requisito 1 já existe, funciona e tem tela — o vídeo fica honesto e
  completo nessa parte, sem gravar nada que o produto não faz de verdade.
- O requisito 2 depende de uma peça que a casa não tem hoje (endpoint sem
  código, sem doc local detalhada, sem uma segunda conta de teste) — construir
  às pressas para gravar um vídeo é o oposto do que este especialista está
  aqui para impedir: funcionalidade sem plano, testada ao vivo, contra a Meta.
- Precedente já usado nesta casa: em 11/08/2026 três permissões
  (`instagram_manage_comments`, `pages_manage_metadata`, `business_management`)
  saíram do envio por não terem código que as exercesse — o envio sobreviveu.
  Uma permissão negada por um requisito específico do vídeo (em vez de a
  permissão inteira sair do envio) é um risco menor e mais barato de aceitar.

---

## O que eu não consegui medir

1. **Se `business_discovery` exige Advanced Access separado, ou nível próprio
   de revisão, além da permissão `instagram_manage_insights`.** A fonte
   capturada (`permissoes-referencia.md`) descreve a permissão, não o
   endpoint; `graph-api-limites-de-taxa.md` só cita que ele está sujeito a
   rate limit de plataforma. **LACUNA** — destrava lendo
   `developers.facebook.com/docs/instagram-platform/instagram-graph-api/business-discovery-api`
   (ou nome equivalente vigente) e capturando essa página na biblioteca antes
   de qualquer chamada real.
2. **Se algum cliente da casa já tem uma Página do Facebook conectada
   (`MetaConnection.platform = "facebook"`) com posts reais publicados**, o
   que decidiria se a tela do item 1 nasce com dado real no dia da gravação
   sem esforço extra, ou se alguém precisa publicar um post de teste numa
   Página real primeiro. Não consultei o banco de produção — fora do escopo
   desta ficha (MEDIR o custo de código, não auditar dado de cliente) e eu não
   tenho, e não deveria ter, motivo para abrir dado de cliente sem pedido
   específico para isso. **Destrava:** quem tem acesso ao painel
   administrativo confirma em um clique (`/agency/clients`, filtrar por
   integrações Meta com Página conectada).
3. **Se `permalink_url` é um campo válido de `{page-id}/feed` na versão
   vigente (`v21.0`)** — o exemplo capturado em `pages-api-publicacoes.md`
   não pede esse campo, só mostra `id`, `message`, `created_time`. Não é
   bloqueante (dá para montar o link manualmente com o `id`), mas muda 1-2
   linhas do que descrevi em 1.3. **Destrava:** conferir a referência de
   campos do nó Page Feed na documentação oficial antes de escrever o código
   (não antes de medir o custo, que é o que esta ficha faz).
4. **Se existe uma segunda conta pública de terceiro apropriada para testar
   `business_discovery` no dia da gravação**, e — mais importante — **para
   quê a agência quer essa leitura** (benchmarking de concorrente do cliente?
   pesquisa de referência de criativo?). Isso não é uma lacuna de biblioteca,
   é uma decisão de produto que só o CEO toma, e que muda o texto do "caso de
   uso" no formulário do App Review antes mesmo de existir código.
