# Gravação do screencast do App Review — o que deu, o que não deu, e por quê

> **Data:** 29/08/2026 · **Quem:** PM da Dioli Digital
> **Ambiente:** máquina local, banco `dev.db`, app em `localhost:3000`.
> **Custo desta rodada: US$ 0,00.** Nenhuma chamada de IA, nenhum e-mail, nenhuma
> chamada à Graph API, nenhuma conta real da Meta tocada.

## 🔴 A conclusão primeiro, porque ela muda o pedido

**Nenhuma das 9 permissões do envio é gravável neste ambiente, e nenhum vídeo
deste documento pode ser anexado ao App Review.** Isso não é insuficiência de
esforço: é o parecer do especialista-trava `meta`, emitido hoje, contra a
biblioteca capturada em `docs/plataformas/meta/fontes/`.

Os 8 vídeos entregues aqui são **vistoria do roteiro do CEO**, não material de
submissão. Eles servem para uma coisa só, e é uma coisa útil: o CEO saber
exatamente o que vai encontrar em cada tela **antes** de apertar REC, em vez de
descobrir na frente da câmera.

> ⚠️ **Se algum destes arquivos for anexado ao formulário da Meta, o envio
> piora.** A regra citada pelo especialista é literal: *"Se pudermos testar o
> app, mas não conseguirmos testar a funcionalidade que requer uma permissão
> (…), não aprovaremos o acesso a essa permissão"*
> (`fontes/app-review-processo.md`). Toda tela aqui está **vazia e
> desconectada** — ela não demonstra nenhuma funcionalidade.

---

## 1. O parecer do especialista `meta` — a base desta entrega

Despachado hoje com a ficha `docs/plataformas/meta/_fichas/ficha-parecer-screencast-29-08.md`.
**Veredito: PODE COM AJUSTE.** O que ele estabeleceu, e que este documento obedece:

- **As 9 permissões caem todas no balde (c) — impossível sem conta real.**
  Nenhuma cai em (a) ou (b).
- **Vídeo de tela vazia/desconectada ATRAPALHA — reprova.** Confirmado em duas
  fontes (`fontes/app-review-processo.md` e o "Screencast Requirements" de cada
  permissão em `fontes/permissoes-referencia.md`).
- **OAuth é exigência confirmada em 7 das 9.** As duas de WhatsApp
  (`whatsapp_business_management`, `whatsapp_business_messaging`) não mencionam
  login no texto capturado — pedem a demonstração funcional direto.
- **LACUNA declarada:** o texto ao vivo do **formulário** de submissão não está
  na biblioteca. A frase citada no `roteiro-do-video.md` ("incorpore o fluxo de
  autorização do OAuth no screencast") **não pôde ser confirmada nem negada**.

---

## 2. Tabela — permissão × o que a Meta exige ver × gravável aqui

Fonte de todas as linhas de "o que a Meta exige ver": `fontes/permissoes-referencia.md`,
seção "Screencast Requirements" de cada permissão, via o parecer de hoje.

| # | Permissão | O que a Meta exige VER | Gravável aqui? | Por quê |
|---|---|---|---|---|
| 1 | `pages_show_list` | O login do Facebook completo **e** as Páginas do usuário conectadas à plataforma | **NÃO** — balde (c) | Sem `META_APP_ID`/`META_APP_SECRET`, `isMetaConfigured()` é falso e o botão "Conectar conta Meta" fica **desabilitado**. Não há diálogo de OAuth para filmar, nem lista de Páginas para exibir |
| 2 | `pages_read_engagement` | O usuário acessando o **conteúdo de um post de Página**, exibido dentro do app | **NÃO** — balde (c) | Idem acima. **E há um problema maior, ver §5.1** |
| 3 | `instagram_basic` | Login completo + o usuário **selecionando a conta do Instagram** | **NÃO** — balde (c) | Idem. Além disso o banco local tem **0 clientes**, então a tela "Redes" não tem nem onde renderizar |
| 4 | `instagram_content_publish` | Criar um post com foto e **publicá-lo no feed** do Instagram do usuário comercial | **NÃO** — balde (c) | Exige publicação real, com o post no ar. Não é simulável nem com credencial |
| 5 | `instagram_manage_insights` | Insights da conta e das mídias **+ insights do perfil público de OUTRA conta comercial** | **NÃO** — balde (c) | Idem. **E a segunda metade da exigência não existe no produto, ver §5.2** |
| 6 | `ads_read` | Gasto, impressões, alcance e cliques exibidos na plataforma | **NÃO** — balde (c) | Exige conta de anúncios real autorizada **e com dados**. A tela mostra "Nenhuma conta da Meta conectada" |
| 7 | `ads_management` | Texto oficial idêntico ao de `ads_read`; o especialista recomenda mostrar a escrita mesmo assim | **NÃO** — balde (c) | Idem — **e é a cena de maior risco do envio, ver §5.3** |
| 8 | `whatsapp_business_management` | Criar um modelo de mensagem (no app **ou** no Gerenciador do WhatsApp) | **NÃO** — balde (c) | Exige WABA real. Única com saída fora do produto: pode ser filmada no próprio Gerenciador da Meta |
| 9 | `whatsapp_business_messaging` | O app **enviando** mensagem e o cliente WhatsApp recebendo | **NÃO** — balde (c) | Exige número real e destinatário real, com opt-in |

**Baldes (a) e (b): vazios.** Não é peculiaridade de uma permissão — é o
ambiente inteiro. Sem credencial e sem modo mock em `lib/integrations/meta/`,
nada relacionado à Meta roda aqui: nem OAuth, nem dado, nem estado "conectado".

---

## 3. O que FOI gravado — 8 vídeos de vistoria

Pasta: `docs/plataformas/meta/gravacoes/`. Formato `.webm`, 1280×720, sem áudio,
sem narração, sem corte de conteúdo.

| Arquivo | Permissão que a tela exercita | Duração | O que se vê de fato |
|---|---|---|---|
| `cena-01-entrar-no-produto.webm` | — (contexto) | 26s | Login em `/auth/signin` e o painel abrindo |
| `cena-02-integracoes-estado-real.webm` | `pages_show_list`, `pages_read_engagement`, `instagram_basic` | 1m08s | `/agency/integrations` inteira. O cartão da Meta **no estado real: não configurado**, com o botão "Conectar conta Meta" **desabilitado** e o aviso *"⚠ Salve o App ID e o App Secret acima para poder conectar contas"* |
| `cena-03-clientes-e-redes.webm` | `instagram_basic`, `instagram_manage_insights` | 45s | `/agency/clients` — **"0 clientes cadastrados"**. A aba "Redes" não é alcançável: não há cliente |
| `cena-04-planner-publicacao.webm` | `instagram_content_publish` | 44s | `/agency/planner` — calendário de Agosto/2026 **vazio**, "Nenhum post no calendário" |
| `cena-05-aprovacao-do-cliente.webm` | `instagram_content_publish` (consentimento) | 45s | `/agency/approvals` — fila vazia |
| `cena-06-desempenho-pago.webm` | `ads_read` | 1m02s | `/agency/desempenho-pago` — **"Nenhuma conta da Meta conectada. A Marketing API exige um acesso de usuário"** |
| `cena-07-ads-agent.webm` | `ads_management` | 45s | `/agency/ads-agent` |
| `cena-08-whatsapp.webm` | `whatsapp_business_messaging`, `whatsapp_business_management` | 45s | `/agency/whatsapp` — "Nenhuma conversa ainda", com a regra das 24h impressa na própria tela |

**Stills:** `<cena>-quadro-final.png` (o último quadro de cada cena) e
`cartao-meta-estado-real.png` — o cartão da Meta enquadrado, que é o still mais
útil do conjunto.

**Quadros de conferência:** `gravacoes/_conferencia/`, 77 PNGs, um a cada 5
segundos de cada vídeo, nomeados pelo instante (`-t045s.png`). É a trilha de
auditoria da inspeção da §6.

> **Peso, dito por extenso porque é permanente:** os vídeos somam **9,9 MB**; a
> pasta inteira, com os quadros de conferência, soma **25 MB**. Se o Diretor
> preferir não carregar os 15 MB de quadros no repositório, apagar
> `gravacoes/_conferencia/` não perde nenhum vídeo — perde só a trilha de
> auditoria.

### O que foi feito com os vídeos, e o que NÃO foi

- ✅ **Aparado o branco morto da cabeça.** A primeira rodada saiu com até **14
  segundos de tela branca** na frente de 5 cenas — o Next em modo `dev` compila
  a rota no primeiro acesso e a câmera já estava rodando. Duas correções:
  aquecer as rotas antes de gravar (`scripts/gravar-app-review.mjs`) e aparar a
  cabeça (`scripts/aparar-branco.mjs`). **Sobra 1 segundo**, medido de segundo em
  segundo.
- ❌ **Nada foi acelerado, cortado no meio, ou juntado.** O roteiro do CEO proíbe
  com todas as letras, e a proibição vale para a vistoria também.
- ❌ **Nenhuma conexão foi fingida.** Nenhuma linha de `lib/integrations/meta/`
  foi tocada; nenhuma credencial foi inventada; nenhum registro de conexão foi
  plantado no banco para "ter o que filmar".

---

## 4. O QUE NÃO CONSEGUI GRAVAR — nome, cena, e o que destravaria

### 4.1 · Bloqueio comum a TODAS as 9 permissões

| | |
|---|---|
| **O que falta** | `META_APP_ID`, `META_APP_SECRET` e `META_REDIRECT_URI` — os três ausentes. `.env` tem **zero** linha com `META` |
| **Efeito medido** | `resolveMetaAppCredentials()` devolve `null` → `isMetaConfigured()` é falso → o botão "Conectar conta Meta" renderiza **desabilitado**. Visível em `cartao-meta-estado-real.png` |
| **O que destravaria** | Definir as três variáveis. **Mas isso NÃO basta** — ver 4.2 |

### 4.2 · Por que credencial sozinha não resolve

Mesmo com as três variáveis, o passo seguinte é
`https://www.facebook.com/{GRAPH_VERSION}/dialog/oauth`
(`lib/integrations/meta/config.ts:25`): **uma tela do Facebook, que exige um
humano logado numa conta Meta real escolhendo o negócio e confirmando as
permissões.** Não há como automatizar isso, e não se deve tentar — automatizar
login em conta Meta é a assinatura comportamental que
`fontes/integridade-da-conta.md` descreve como auditada.

**Isto é ato de gente, e a gente é o CEO.** O roteiro dele
(`docs/plataformas/meta/roteiro-do-video.md`, cena 2) já cobre exatamente esse
passo e **continua valendo integralmente** — não foi reescrito.

### 4.3 · Bloqueio por permissão — o que falta em cada uma, além do OAuth

| Permissão | Cena que não existe | O que destravaria (ato concreto) |
|---|---|---|
| `pages_show_list` | A lista de Páginas administradas, com o dono marcando uma | Login real do CEO no Facebook com uma conta que administre ao menos 1 Página |
| `pages_read_engagement` | O conteúdo de um post de Página exibido no produto | **Não destrava com credencial: a tela não existe.** Ver §5.1 |
| `instagram_basic` | Usuário, foto e grade de posts do Instagram | Conta IG profissional conectada **+ 1 cliente cadastrado** no banco |
| `instagram_content_publish` | "Publicar agora" e o post aparecendo no feed | Peça aprovada e agendada + freio `PUBLICACAO_ORGANICA` solto (decisão do CEO) + publicar **no Instagram da própria Dioli**, nunca no de cliente |
| `instagram_manage_insights` | Alcance e interações da conta e por peça | Posts reais já publicados (métrica não existe sem post). **A segunda metade da exigência não destrava — ver §5.2** |
| `ads_read` | Gasto, impressões, alcance, cliques por campanha | Conta de anúncios real autorizada **e com veiculação**. ⚠️ A conta da agência estava **restringida** em 03/08 |
| `ads_management` | Campanha sendo criada dentro do produto | Idem `ads_read` + **nova consulta ao especialista `meta` antes de gravar** — ver §5.3 |
| `whatsapp_business_management` | Um modelo de mensagem sendo criado | WABA real. Pode ser filmado no Gerenciador do WhatsApp da Meta, fora do produto |
| `whatsapp_business_messaging` | Mensagem saindo do app e chegando no WhatsApp | Número real + destinatário **com opt-in** (`fontes/whatsapp-politica-de-mensagens.md`). Número de teste da própria casa serve; número aleatório **não** |

### 4.4 · Bloqueio adicional que não é da Meta: o banco está vazio

O seed local (`node scripts/seed-db.mjs`) cria **só o usuário master** —
"sistema limpo, sem dados demo". Medido nas telas: **0 clientes, 0 posts no
calendário, 0 aprovações**.

**Não criei cliente nem peça fictícia**, e a razão é a mesma do resto deste
documento: povoar o banco para a câmera produziria um vídeo mais bonito e
igualmente inservível — o parecer diz que a Meta reprova tela que não demonstra
a funcionalidade, e funcionalidade com dado inventado não é funcionalidade.

---

## 5. 🔴 Três achados que valem mais que os vídeos

### 5.1 · `pages_read_engagement`: a Meta pede uma tela que o produto não tem

O texto oficial pede ver *"o conteúdo de um post na Página (…) exibido na
plataforma do app"*. **Não existe essa tela.** Conferido no repositório:

- `lib/integrations/meta/client.ts:210` toca `{page-id}/feed`, mas é **`graphPost`** — é publicação, não leitura.
- `lib/integrations/meta/verificacao.ts:294` **lê** `{page}/feed`, mas com
  `fields: "id,created_time"` — **nunca lê o conteúdo do post**, e a saída é uma
  frase de diagnóstico (*"li a Página X e a última publicação"*), não uma tela.
- Essa função só sai por API (`/api/admin/diagnostico-de-conexoes`,
  `/api/portal/conexoes`). **Nenhum componente de tela renderiza post de Página.**

**Risco: reprovação desta permissão específica**, se o revisor cobrar o texto à
risca. Reforça o achado — não é dedução de memória, é busca no código.

### 5.2 · `instagram_manage_insights`: metade da exigência não tem código

O texto oficial pede, além dos insights da própria conta, *"insights de
metadados/mídia do perfil público de OUTRA conta comercial"* — isto é
`business_discovery`. **Busca no repositório inteiro: ZERO ocorrências de
`business_discovery`.** Não há código, não há tela, não há o que filmar.

### 5.3 · `ads_management` é a cena de maior risco do envio

O especialista foi explícito: criar campanha real é **escrita**, e a conta de
anúncios da agência estava **restringida em 03/08** por "automação que não segue
as regras". **Antes de gravar essa cena, o especialista `meta` precisa ser
consultado de novo com o estado atual da conta.** Se a conta seguir restringida,
a cena não existe. E a campanha, quando nascer, **nasce pausada** — regra
permanente da casa.

### 5.4 · Dois achados de segurança para a gravação do CEO

- 🔴 **O cartão da Meta fica a 1.860 px de rolagem numa página de 5.098 px** —
  medido, não estimado. Ele está **abaixo de todos os campos de chave de API de
  IA** (Claude, OpenAI, DeepSeek, Perplexity). Em produção, onde essas chaves
  **estão configuradas**, chegar ao botão "Conectar" com a câmera ligada
  significa **rolar por cima de todas elas**. A própria tela avisa que mostra
  uma dica da chave (`sk-ant-…a1b2`). **O roteiro já diz "não mostrar chaves" —
  o que faltava era dizer que a chave está no caminho.** Sugestão para o CEO:
  ir direto ao cartão com `Ctrl+F` / âncora, ou começar a gravação já rolado.
- 🟡 **Erro de hidratação em `/agency/integrations`**, capturado no console
  durante a cena 02: um `TestBadge` renderiza `· 28/08/2026` no servidor e
  `· 29/08/2026` no cliente. Em `dev` isso acende o balão vermelho "1 Issue" no
  canto — visível nos quadros de conferência. É defeito de fuso/data, não da
  Meta, e some em produção; **mas não é da minha frente e não foi consertado.**

---

## 6. Conferi antes de entregar — o que foi procurado e o que se achou

**Não entreguei vídeo que não assisti.** Método: extraí 77 quadros, um a cada 5
segundos de cada um dos 8 vídeos, por busca de tempo (`ffmpeg -ss`), e inspecionei
os quadros. Mais uma varredura no texto renderizado da página de Integrações.

| O que procurei | Como | Resultado |
|---|---|---|
| Chave de IA (`sk-…`) | regex no texto renderizado + olho nos quadros | **nenhuma** — os campos estão vazios, com `placeholder`, e marcados "Não conectado" |
| Token da Meta (`EAA…`) | regex + olho | **nenhum** |
| JWT / token de sessão | regex `eyJ….…` | **nenhum** |
| Senha | olho, quadro a quadro do login | **não aparece.** O campo é `type="password"`; a tela mostra **pontos**. Conferido no quadro do instante da digitação |
| E-mail real de pessoa | regex + olho | **nenhum.** Aparece `master@dioli.studio`, a conta **semeada localmente** pelo `seed-db.mjs` — não é o e-mail de ninguém |
| Barra de endereço / console do navegador | — | **estruturalmente impossível:** o `recordVideo` do Playwright grava **só a área da página**. Não há cromo de navegador, nem barra de endereço, nem devtools em nenhum quadro |
| Dado de cliente real | olho | **nenhum** — o banco tem 0 clientes |

### ⚠️ O que a varredura automática NÃO pegou, e o olho pegou

O campo do App ID traz o **placeholder `App ID (ex.: 1824373765214116)`** — que é
o App ID **real** do app "Dioli Digital". A varredura por regex devolveu
"NENHUM" porque `placeholder` é **atributo**, não entra em `innerText`.

**Não é vazamento:** o App ID é público por construção — o próprio código diz
`accountId → App ID (public, not a secret)` (`lib/integrations/meta/config.ts`).
Fica declarado aqui porque a lição vale mais que o achado: **varredura de texto
não vê atributo, e por isso a conferência com o olho não é cerimônia.**

---

## 7. O que vem a seguir

1. **Nada daqui vai para a Meta.** Quem grava o material de submissão é o CEO,
   pelo `roteiro-do-video.md`, em produção, com conta real.
2. **Antes de gravar `ads_management`:** consultar o `meta` com o estado atual da
   conta de anúncios.
3. **Decidir sobre §5.1 e §5.2** — as duas permissões cuja exigência o produto
   não atende. Ou se constrói a tela, ou a permissão sai deste envio (foi assim
   que `instagram_manage_comments`, `pages_manage_metadata` e
   `business_management` saíram em 11/08).
4. **§5.4 vira linha no roteiro do CEO** — mas o roteiro é dele, e não foi
   alterado por esta frente.

## Como reproduzir

```sh
echo 'DATABASE_URL="file:$(pwd)/dev.db"' > .env
echo 'JWT_SECRET=dev-secret-local-only'  >> .env
npx prisma db push --schema=prisma/schema.prisma
SEED_MASTER_PASSWORD='<sua senha>' SEED_STAFF_PASSWORD='<sua senha>' node scripts/seed-db.mjs
npm run dev

REC_SENHA='<a mesma senha>' PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  node scripts/gravar-app-review.mjs      # grava as 8 cenas
node scripts/aparar-branco.mjs            # apara o branco morto da cabeça
```

Nenhum dos dois scripts inventa senha: sem `REC_SENHA` eles param e dizem o que
falta. **Não rode `playwright install`** — o Chromium já está em
`/opt/pw-browsers`.
