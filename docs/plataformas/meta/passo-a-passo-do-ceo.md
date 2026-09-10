# Meta — o passo a passo do CEO

> **Para quem:** Dioli, sozinho, no navegador ou no celular. Não é preciso
> entender nada de código, de token ou de API para executar este documento.
> **Montado em:** 14/08/2026, pelo especialista-trava da Meta.
> **App:** `Dioli Digital Studio` · `1824373765214116`.
>
> **A regra deste documento:** toda afirmação tem fonte citada com arquivo e
> linha, da biblioteca oficial em `docs/plataformas/meta/fontes/`. Onde a fonte
> não responde, está escrito **"não sei"** e o que fazer para descobrir. **Nada
> aqui é estimativa de prazo inventada.**
>
> **Nenhuma credencial aparece neste documento.** Onde uma chave é necessária,
> está dito **onde ela mora**, nunca qual é.

---

## Leia isto antes de tudo — 3 coisas que mudaram e que confundem

**1. O app já existe e já está publicado.** Não é preciso criar nada, e não há
ação obrigatória pendente no painel. O que falta são dois processos externos:
verificação do negócio e análise do aplicativo.

**2. Não procure "modo de desenvolvimento". Ele não existe neste app.** O app é
do tipo **Business** (usa Login do Facebook **para Empresas**). A Meta escreve:
*"Os apps de empresa não têm modos e se baseiam exclusivamente em níveis de
acesso."* (`fontes/app-review-publicacao.md:35`). Quem procura esse botão perde
a tarde — já aconteceu nesta casa. O que governa aqui é **nível de acesso por
permissão**: padrão × avançado.

**3. Os dois portões valem para CLIENTE DE FORA, não para o que é seu.** A Meta
diz, com todas as letras: *"Caso o app seja utilizado somente por usuários que
tiverem uma função nele, não será necessário fazer a verificação. Esses usuários
poderão conceder qualquer permissão ao app quando quiserem, e todos os recursos
ficarão sempre ativos."* (`fontes/verificacao-de-negocio.md:21`) — e, para a
análise: *"Se o app for usado apenas por usuários que têm uma função no próprio
app, o processo de análise não será necessário."*
(`fontes/app-review-processo.md:18`).

> **Tradução prática:** para as contas do próprio CEO (ele é o administrador do
> app), a espera não se aplica. **Este documento é o que destrava o CLIENTE
> EXTERNO.** O caminho da conta própria está registrado à parte, na oficina do
> `meta`.

---

## 0. A lista de compras — o que ter em mãos antes de sentar

| # | O que | Por quê | Fonte |
|---|---|---|---|
| 1 | **Ser administrador do portfólio empresarial** (não só do app) | *"qualquer pessoa com uma função de administrador no app pode conectá-lo a uma empresa. Contudo, somente as pessoas com função de administrador na empresa poderão realizar o processo de verificação"* | `fontes/verificacao-de-negocio.md:23` |
| 2 | **Um portfólio empresarial** (Business Manager) criado. Se não houver, a Meta oferece criar no meio do fluxo | *"Se você não tiver uma empresa, terá a opção de criar uma."* | `fontes/verificacao-de-negocio.md:22` |
| 3 | **Ícone do app 1024×1024** (arquivo pronto no celular ou no computador) | hoje o app usa o ícone genérico da Meta — medido em 06/08 | `app-review.md` §4 |
| 4 | **E-mail e senha de um usuário de teste do nosso sistema** | a Meta entra no produto para testar; se não conseguir entrar, **o envio inteiro é rejeitado** | `fontes/app-review-processo.md:20` |
| 5 | **Um celular ou tela para gravar vídeo**, com som | os screencasts são obrigatórios permissão por permissão | `fontes/permissoes-referencia.md` |
| 6 | **Uma conta de anúncios SEM restrição** para gravar o vídeo de anúncios | a conta da agência foi restringida em 03/08; gravar com ela é entregar ao revisor a prova de que a casa já foi punida | registro da casa, 03/08 |

### 🟥 Os documentos da empresa — eu NÃO SEI quais são, e não vou inventar

A fonte oficial que a Meta indica para a **lista de documentos** é a Central de
Ajuda do Gerenciador de Negócios (`fontes/verificacao-de-negocio.md:33`), e essa
página **não está na nossa biblioteca**. Tentei baixá-la hoje (14/08/2026):
`facebook.com/business/help/1095661473946872` e
`facebook.com/business/help/2058515294227817` respondem, mas o conteúdo é
montado pelo navegador e o capturador só traz o título. **Portanto, escrever
aqui "leve CNPJ, contrato social e comprovante de endereço" seria memória, não
fonte — e memória é exatamente o que já deu informação errada nesta casa.**

**O que fazer para descobrir, e custa 5 minutos (CEO):** abra o passo 1 abaixo e
**pare na primeira tela do fluxo de verificação**. A Meta exibe ali a lista do
que ela quer, para o seu caso e o seu país. Abrir o fluxo **não** envia nada.
Tire um print dessa tela e me mande — eu registro na biblioteca e este documento
deixa de ter esta lacuna.

---

## 1. A ordem real, com as esperas declaradas

```
PASSO 1  CEO   Conferir no painel o que as fontes não sabem   (10 min)
                        │
PASSO 2  CEO   Abrir a VERIFICAÇÃO DO NEGÓCIO                 (30 min + espera)
                        │
                ╔═══════╧════════════════════════════════════╗
                ║  ESPERA — prazo DESCONHECIDO (ver §4)      ║
                ║  Nada abaixo depende dela para COMEÇAR.    ║
                ╚═══════╤════════════════════════════════════╝
                        │
PASSO 3  casa  Consertar o que reprovaria o envio             (a casa faz)
PASSO 4  CEO   Ícone + usuário de teste                       (10 min)
PASSO 5  CEO   GRAVAR OS VÍDEOS                               (2 a 3 h)
                        │
PASSO 6  CEO   ENVIAR a análise do aplicativo                 (40 min)
                        │
                ╔═══════╧════════════════════════════════════╗
                ║  ESPERA — prazo DESCONHECIDO (ver §4)      ║
                ╚═══════╤════════════════════════════════════╝
                        │
PASSO 7  CEO   Conferir o resultado e o nível de acesso       (5 min)
```

**Por que a verificação vem primeiro:** ela é requisito do acesso avançado —
*"Verificação da empresa: é necessária para todos os apps que solicitam Advanced
Access"* (`fontes/permissoes-referencia.md:37`) — e é o relógio externo mais
longo. **Não está escrito em lugar nenhum que ela bloqueia o ENVIO da análise**;
por isso os passos 3 a 6 correm em paralelo com a espera, em vez de ficarem
parados atrás dela.

---

## 2. Os passos, um por um

### PASSO 1 — Conferir no painel o que a fonte não sabe · `CEO` · 10 min

**Por que existe:** cinco coisas **não são legíveis por fora** — só quem abre o
painel enxerga (medido em 06/08: a Meta responde "campo inexistente" para todas
elas). E duas anotações da casa sobre esses pontos **já divergem entre si** (ver
§6). Confirmar antes é mais barato que descobrir no meio da gravação.

**Onde clicar:**
```
developers.facebook.com/apps
  → Dioli Digital Studio (1824373765214116)
  → Análise do app → Permissões e recursos
```
(caminho literal da fonte: `fontes/marketing-api-autorizacao-e-niveis.md:69` —
*"Para verificar seu nível de acesso atual, navegue até Painel de Apps > Análise
do app > Permissões e recursos"*)

**O que me responder** (uma linha cada, pode ser print):

1. A **verificação do negócio** aparece como concluída, pendente ou nem começou?
2. Qual o **nível da API de Marketing** — *Acesso limitado* ou *Acesso total*?
   (os rótulos mudaram em 04/05/2026: "Standard" virou **Limited**, "Advanced"
   virou **Full** — `fontes/marketing-api-nivel-de-acesso-maio-2026.md:29-35`)
3. **Alguma permissão já está aprovada?** Quais?
4. Em *Login do Facebook para Empresas → Configurações*: **existe uma
   configuração criada?** Quantas permissões estão marcadas nela?

**Como saber que deu certo:** você tem as quatro respostas. Só isso.

> ⚠️ **A pergunta 4 é a mais importante do documento inteiro.** Todos os vídeos
> começam pela tela de login do Facebook. Se essa configuração não existir ou
> estiver incompleta, **o revisor não consegue entrar e o envio inteiro é
> rejeitado** — não uma permissão, o envio (`fontes/app-review-processo.md:20`).

---

### PASSO 2 — Abrir a verificação do negócio · `CEO` · 30 min + espera

**Onde clicar** (caminho literal da fonte, `fontes/verificacao-de-negocio.md:25`
e `:32`):
```
Painel de Apps → Configurações → Básico → Verificação
  → botão "Iniciar verificação"
      (ou o link "+ Verificação da empresa", se a verificação
       individual já tiver sido feita)
  → se o app estiver ligado a uma empresa NÃO verificada:
      botão "Iniciar verificação da empresa"
      → abre o Gerenciador de Negócios, e é lá que se conclui
```

> ⚠️ **Esta fonte é de 07/07/2023** (é a data que a própria página exibe). Os
> rótulos do painel podem ter mudado — a Meta hoje fala em "portfólio
> empresarial" e "Central de Contas" em outros lugares. **Se o menu não bater
> com o texto acima, não force e não adivinhe: me mande o print da tela que você
> está vendo.** Repetir documento velho como se fosse o painel de hoje é
> exatamente o erro que esta casa cometeu esta semana.

**O que vai ser pedido:** os dados e documentos da empresa. **A lista sai na
tela** — veja o aviso da §0. O processo é de **identidade comercial**: a Meta
está confirmando que a empresa existe e é sua
(`fontes/verificacao-de-negocio.md:19`).

**Como saber que deu certo:** de volta em *Configurações → Básico*, a seção
**Verificação** passa a mostrar que **o app está conectado a uma empresa
verificada** (`fontes/verificacao-de-negocio.md:34`).

**Enquanto não termina:** siga para os passos 3 a 5. Não fique esperando.

---

### PASSO 3 — O que a casa conserta antes de você gravar · `casa`

**Este passo não é seu.** Está aqui só para você saber que existe e que ele
precisa estar fechado **antes do passo 5**. A lista para mim está na §7.

---

### PASSO 4 — Ícone e usuário de teste · `CEO` · 10 min

**4a. O ícone.**
```
Painel de Apps → Configurações → Básico → Ícone do app
  → subir arquivo 1024×1024
```
**Como saber que deu certo:** o ícone genérico da Meta some e aparece o nosso.

**4b. O usuário de teste para a Meta.**
```
Painel da Dioli (nosso sistema) → Configurações → usuários
  → criar um usuário com papel "project_manager", com senha própria
```
**Por que não a sua conta:** a conta `master` alcança configurações, integrações
e reset de dados de produção. O papel `project_manager` alcança tudo o que os
vídeos precisam (Integrações, Clientes, Planner, Desempenho pago, WhatsApp) e
nada das chaves da casa.

**Como saber que deu certo:** você consegue entrar no sistema numa janela
anônima com esse e-mail e senha, e vê o menu lateral completo.

**Me mande esse e-mail e essa senha** — eles vão nos campos de credencial de
teste do formulário. (Senha de usuário de teste do produto não é segredo de
plataforma; nenhuma chave da Meta sai daqui.)

---

### PASSO 5 — Gravar os vídeos · `CEO` · 2 a 3 h

**Este é o passo que mais reprova.** A Meta testa o app de verdade:

> *"Se não conseguirmos acessar seu app para a execução de testes, todo o seu
> envio será rejeitado. Se pudermos testar o app, mas não conseguirmos testar a
> funcionalidade que requer uma permissão ou um recurso específico solicitado
> por você, não aprovaremos o acesso a essa permissão ou esse recurso."*
> — `fontes/app-review-processo.md:20`

**Regras que valem para TODOS os vídeos:**

- Comece **sempre** mostrando o **login do Facebook inteiro**, incluindo a tela
  em que o usuário concede a permissão. Isso é exigência literal, repetida em
  todas as permissões (`fontes/permissoes-referencia.md`).
- Tela cheia, **barra de endereço visível** (o revisor precisa ver o domínio).
- **Sem cortes no meio de um fluxo.** Corte parece coisa escondida.
- Grave a abertura (login + conexão) **uma vez** e reaproveite nos demais.

#### As 9 permissões que pedimos, e o que precisa aparecer em cada vídeo

| Vídeo | Permissões | O que a Meta exige ver | Onde no nosso produto |
|---|---|---|---|
| **A** | `pages_show_list` | login completo + *"Mostre que as páginas de propriedade do usuário foram conectadas à plataforma do app"* | Ferramentas & Integrações → cartão Meta → lista de Páginas |
| **A** | `pages_read_engagement` | login completo + *"como o usuário do app acessa o conteúdo de um post na Página do Facebook dele"* + *"que o conteúdo do post é exibido na plataforma"* | ⚠️ **lacuna declarada — nenhuma tela do produto exercita isto.** `Clientes → (cliente) → Redes` (`RedesDoCliente.tsx`) é só Instagram: chama `conexaoDoCliente(..., "instagram")` (`lib/integrations/meta/leitura.ts:189`) e o próprio rótulo da tela diz "Instagram". O único código que toca Página do Facebook é escrita (`publishFacebook` em `lib/integrations/meta/client.ts:197`, cria post), não leitura/exibição de post existente. `pages_read_engagement` hoje só existe no produto como dependência técnica para os endpoints do Instagram funcionarem (ver `permissoes-do-token.ts:190-196`, erro código 10 sem ela) — precisa gravar o vídeo mostrando essa dependência via a tela de Instagram e aceitar o risco de a Meta negar por não haver conteúdo de Página exibido, ou construir uma leitura de Página antes de gravar |
| **B** | `instagram_basic` | login completo + a tela em que ele **seleciona a conta do Instagram** | Clientes → (cliente) → Redes: usuário, foto, grade de posts |
| **B** | `instagram_manage_insights` | login + *"insights sobre metadados, publicações, fotos e vídeos da conta profissional"* + **insights do perfil PÚBLICO de outra conta profissional** ⚠️ | Clientes → Redes (métricas da conta e por post) |
| **C** | `instagram_content_publish` | login + *"como criar um post com foto e publicá-lo no feed do Instagram do usuário comercial"* | Planner → aprovar → Publicar → **mostrar o post no Instagram, sem cortar** |
| **D** | `ads_read` e `ads_management` | login + *"como uma empresa pode acessar dados de desempenho de anúncios"* + *"que impressões, conversões, gastos, cliques e alcance são exibidos na plataforma"* | Desempenho pago (números do topo + tabela por campanha) |
| **E** | `whatsapp_business_messaging` | *"seu app enviando uma mensagem para um número do WhatsApp"* + o celular **recebendo e exibindo** a mensagem | WhatsApp → responder de dentro do app |
| **F** | `whatsapp_business_management` | *"como o usuário do seu app cria um modelo de mensagem nele **ou no Gerenciador do WhatsApp**"* | vale criar o modelo no Gerenciador do WhatsApp — a Meta aceita |

Fontes, linha a linha, em `fontes/permissoes-referencia.md`: `ads_management`
§Screencast (l. 63-72); `ads_read` (l. 97+); `pages_read_engagement` (l. 837+);
`pages_show_list` (l. 865+); `instagram_basic` (l. 335+);
`instagram_content_publish` (l. 483+); `instagram_manage_insights` (l. 564+);
`whatsapp_business_management` (l. 1304+); `whatsapp_business_messaging`
(l. 1319+).

> ⚠️ **O risco do vídeo B, dito com todas as letras.** A Meta pede, para
> `instagram_manage_insights`, um terceiro item: *"insights sobre metadados e
> mídia do perfil público de uma conta profissional do Instagram em nome da
> conta profissional do usuário do app"* — isto é, **espiar o perfil de um
> concorrente**. **O nosso produto não faz isso** (não existe nenhuma chamada de
> `business_discovery` no código, conferido hoje). Duas saídas: (a) gravar o que
> temos e aceitar o risco de a Meta negar **só essa permissão**; (b) a casa
> construir a leitura de perfil público antes de gravar. **Recomendo (a)** — as
> outras oito não são afetadas por essa negativa, e esperar por ela atrasa tudo.

> ⚠️ **O vídeo D depende de conta de anúncios sem restrição.** Se a conta da
> agência ainda estiver restrita, grave com outra. Para pedir a análise da
> restrição: **Página Inicial do Suporte para Empresas → Visão geral do status
> da conta → (a conta) → "O que você pode fazer" → "Pedir análise"**. Prazo da
> Meta: *"em geral, essa análise é concluída em 48 horas, embora possa demorar
> mais em alguns casos"* (`fontes/recorrer-de-restricao.md`).

---

### PASSO 6 — Enviar · `CEO` · 40 min

**Onde clicar** (caminho literal, `fontes/marketing-api-autorizacao-e-niveis.md:88-89`):
```
Painel de Apps → Análise do app → Permissões e recursos
  → achar a permissão → coluna "Ação" → "Solicitar acesso avançado"
  → (pode marcar várias) → "Continuar a solicitação"
```

**O que vai ser pedido, e o que já está pronto:**

| O formulário pede | Onde está |
|---|---|
| Justificativa de cada permissão, em inglês | **pronta, para colar**: `docs/plataformas/meta/app-review.md` §3 |
| Vídeo de cada permissão | passo 5 |
| Credencial de teste | passo 4b |
| Política de privacidade, termos, exclusão de dados | já no ar e conferidos (200) |

**Como saber que deu certo:** o painel passa a mostrar as permissões como *em
análise*. A Meta responde depois com aprovação ou recusa
(`fontes/marketing-api-autorizacao-e-niveis.md:90`).

---

### PASSO 7 — Conferir o resultado · `CEO` · 5 min

Mesmo caminho do passo 1. O que olhar: quais permissões ficaram **aprovadas** e
se o **nível da API de Marketing** subiu.

> **Detalhe que pega gente:** o nível da API de Marketing tem requisito próprio,
> **de uso**, e não só de análise: *"ter feito ao menos 500 chamadas da API de
> Marketing com sucesso nos últimos 15 dias"* e *"taxa de erro menor do que 15%
> nas últimas 500 chamadas"* (`fontes/marketing-api-autorizacao-e-niveis.md:96-98`).
> Ou seja: **mesmo aprovado no App Review, o nível só sobe depois de a casa ter
> USO real.** Isso é trabalho da casa, não seu.

---

## 3. O que NÃO fazer — cada linha com o motivo

| Não faça | Por quê |
|---|---|
| **Não procure "modo de desenvolvimento"** | app de empresa não tem modos (`fontes/app-review-publicacao.md:35`) — você não vai achar, ou vai achar outra coisa e mexer no que estava certo |
| **Não peça permissão que a gente não usa** | *"a seleção de permissões desnecessárias é um motivo comum de rejeição"* (`fontes/permissoes-referencia.md:31`) — e uma reprovação atrasa as nove, não só a extra |
| **Não envie antes do passo 1 e do passo 5** | app que o revisor não consegue usar = **envio inteiro rejeitado** (`fontes/app-review-processo.md:20`) |
| **Não grave o vídeo de anúncios com a conta restrita** | é entregar ao revisor a prova de que a casa já foi punida por automação |
| **Não rode automação na Meta enquanto a análise corre** | foi ritmo de máquina que restringiu a conta de anúncios em 03/08/2026. Flag em cadeia derruba as contas dos clientes junto |
| **Não reconecte contas nem troque chaves no meio da análise** | o revisor pode cair numa conexão quebrada no exato momento do teste, e o resultado é reprovação por algo que estava funcionando |
| **Não cole senha, chave ou PIN em chat, documento ou e-mail** | credencial em texto vira credencial de todo mundo. Se precisar me passar algo, me diga **onde** está, não **qual** é |
| **Não repita um envio reprovado sem mudar nada** | reprovação entra no histórico do app, e o número de envios não é infinito |

---

## 4. Quanto tempo leva — o que a fonte diz e o que ela não diz

| Portão | Prazo | Fonte |
|---|---|---|
| **Verificação do negócio** | **NÃO SEI.** Nenhuma das fontes capturadas informa prazo | `fontes/verificacao-de-negocio.md` inteiro — não há prazo no texto |
| **Análise do aplicativo** | **NÃO SEI.** Nenhuma das fontes capturadas informa prazo | `fontes/app-review-processo.md`, `fontes/app-review-publicacao.md` |
| **Análise de conta de anúncios restrita** | **48 horas em geral**, podendo demorar mais | `fontes/recorrer-de-restricao.md` |
| **Nível da API de Marketing (subir)** | depende de **uso**: 500 chamadas em 15 dias, erro < 15% | `fontes/marketing-api-autorizacao-e-niveis.md:96-98` |

**Não estimei os dois primeiros de propósito.** Prazo inventado vira promessa, e
promessa de plataforma que não se cumpre custa mais que a espera. **Como
descobrir:** o próprio painel costuma exibir o prazo estimado na tela de envio —
quando você chegar lá, me diga o que ele mostra, e este documento passa a ter o
número com fonte.

---

## 5. O que eu não consegui apurar

1. **A lista de documentos da verificação** — a página oficial não renderiza
   para o nosso capturador (§0). Resolve-se com um print seu.
2. **Prazo dos dois portões** (§4).
3. **O estado real do painel hoje** — verificação, nível, permissões aprovadas e
   a configuração do Login para Empresas **não são legíveis por fora**; a Meta
   responde "campo inexistente" para todos (medido em 06/08/2026, registrado em
   `docs/plataformas/meta/app-review.md` §1). É por isso que o passo 1 existe.
4. **Se `instagram_basic` depende de `pages_read_engagement` ou de
   `pages_read_user_content`** — a nossa cópia da referência lista o segundo
   (`fontes/permissoes-referencia.md:335-339`), e o dossiê da casa assumiu o
   primeiro. **O painel mostra as dependências na hora de pedir**; é lá que se
   confere, e não muda nada do que você grava.

---

## 6. ⚠️ Onde as anotações da casa divergem entre si — conferir, não repetir

**Isto está escrito aqui porque repetir parecer velho sem reconferir já deu duas
informações erradas ao CEO nesta semana.**

| Ponto | O que diz o dossiê de 06/08 | O que diz a vitrine de 11/08 | Veredito |
|---|---|---|---|
| A chave de configuração do Login para Empresas (`META_LOGIN_CONFIG_ID`, que mora no Railway) | **"não está definida"** — e sem ela o revisor não consegue logar | **"está definida"** (`docs/agents/meta/vitrine.md`, entrada de 11/08) | **Não sei qual vale hoje.** É a pergunta 4 do passo 1, e é a mais cara de errar |
| Modo do app | "continua sendo o que a casa registrou em 03/08 (modo de desenvolvimento)" | app **Business não tem modos** | **A vitrine vence** — é a fonte oficial (`fontes/app-review-publicacao.md:35`) |
| App publicado | dossiê não sabia dizer | — | **O CEO confirmou em 14/08:** publicado, sem ações pendentes |

---

## 7. 🔧 O que é da casa — NÃO entra na lista do CEO

Para o Diretor. Nada disto é clique dele.

1. **Conferir a chave de configuração do Login para Empresas** (a divergência da
   §6) assim que o CEO responder a pergunta 4 do passo 1. Se estiver faltando ou
   incompleta, é **bloqueio de envio**, não detalhe: todos os vídeos começam pelo
   login.
2. **Decidir as permissões que ficam de fora.** Já decidido em 11/08:
   `instagram_manage_comments`, `pages_manage_metadata` e `business_management`
   **não vão** neste envio (zero código que as exerça) —
   `docs/plataformas/meta/app-review.md` §2. `pages_manage_posts` também não.
3. **A versão da Graph API.** O código roda em `v21.0` (padrão, porque a
   variável não está definida) enquanto os webhooks já estão assinados em
   `v25.0`. Não bloqueia, mas um revisor atento cita — `app-review.md` §1.
4. **O DNS do apex `diolidigital.com.br`** — não resolve; o `www` funciona. Ou
   criar o registro, ou tirar o apex de `app_domains`. Já causou um bug real no
   callback de exclusão de dados, corrigido em 06/08.
5. **A leitura de perfil público** (`business_discovery`), se o CEO escolher a
   saída (b) do vídeo B.
6. **Confirmar, depois da aprovação, que o nível da API de Marketing subiu** — e
   que o uso real (500 chamadas / 15 dias, erro < 15%) está acontecendo sem
   rajada.

---

## 8. Fontes usadas

Todas da biblioteca capturada em 07/08/2026, salvo indicação:

- `fontes/verificacao-de-negocio.md` — quando a verificação é exigida, quem pode
  fazer, o caminho literal do menu, e o que aparece quando termina.
- `fontes/app-review-processo.md` — o gatilho da análise e a regra de que app
  não testável = **envio inteiro rejeitado**.
- `fontes/app-review-publicacao.md` — app de empresa não tem modos; o que
  publicar exige.
- `fontes/permissoes-referencia.md` — o que cada vídeo precisa mostrar,
  permissão por permissão, e a advertência sobre pedir permissão demais.
- `fontes/marketing-api-autorizacao-e-niveis.md` — onde se lê o nível, como se
  pede acesso avançado, e o requisito de uso para subir de nível.
- `fontes/marketing-api-nivel-de-acesso-maio-2026.md` — os rótulos novos
  (Limited / Full), em vigor desde 04/05/2026.
- `fontes/recorrer-de-restricao.md` — como pedir análise de conta restrita e o
  prazo de 48 h.
- `fontes/app-criacao-e-tipos.md` — portfólio empresarial e o que é empresa
  verificada.
- `docs/plataformas/meta/app-review.md` — o dossiê de submissão da casa (06/08),
  com os textos de justificativa prontos e as medições ao vivo.
- `docs/agents/meta/vitrine.md` — as lições já promovidas, incluindo a
  divergência da §6.

**Tentativa de captura feita hoje (14/08/2026) e frustrada:** as duas páginas da
Central de Ajuda sobre verificação da empresa respondem, mas o conteúdo é
montado pelo navegador — só o título veio. Por isso a §0 declara a lacuna em vez
de preencher de memória.
