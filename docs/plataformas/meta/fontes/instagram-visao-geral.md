---
titulo: "Instagram Platform — visão geral (contas profissionais, APIs disponíveis)"
url: https://developers.facebook.com/documentation/instagram-platform/overview
capturado_em: 2026-09-10
hash: b9b3cedf4dcbf240
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Visão geral da plataforma do Instagram
Updated: 30 de jun de 2026
Copiar para LLM
Ver como Markdown
A plataforma do Instagram é uma coleção de APIs que permite que seu app acesse dados de contas profissionais do Instagram, incluindo empresas e criadores de conteúdo. É possível criar um app que funcione apenas com sua conta profissional do Instagram ou com outras contas profissionais do Instagram que você não possui nem gerencia.
Existem duas configurações da API do Instagram que você pode usar no seu app:
API do Instagram com Login do Facebook para Empresas	API do Instagram com Login do Instagram para Empresas

Seu app atende a contas profissionais do Instagram que estão vinculadas a uma Página do Facebook
Os usuários usam as credenciais do Facebook para entrar no seu app.
	
Seu app atende contas profissionais do Instagram com presença apenas no Instagram
Os usuários usam as credenciais do Instagram para entrar no seu app.
Dependendo da configuração escolhida, os usuários do app poderão conversar com clientes ou pessoas interessadas na conta profissional do Instagram, moderar comentários na mídia, enviar respostas privadas, publicar conteúdo e anúncios, bem como obter insights.
Qual API é a mais adequada para meu app?
Componente
	Configuração da API do Instagram com o Login do Instagram	Configuração da API do Instagram com o Login do Facebook

Tipo de token de acesso
	
Usuário do Instagram
	
Usuário ou Página do Facebook

Tipo de autorização
	
Login de Empresa no Instagram
	
Login do Facebook para Empresas

Moderação de comentários
	
✅
	
✅

Publicação de conteúdo
	
✅
	
✅

Página do Facebook
	
x
	
Obrigatório

Pesquisa de hashtag
	
x
	
✅

Insights
	
✅
	
✅

Menções
	
✅
	
✅

Mensagem
	
✅
	
pela plataforma do Messenger

Etiquetas de produto
	
x
	
✅

Anúncios em parceria
	
x
	
✅
Níveis de acesso
Há dois níveis de acesso disponíveis para seu app: Acesso padrão e Advanced Access.
Acesso padrão
O acesso padrão é o nível de acesso padrão para todos os apps e limita os dados que seu app pode obter. Esse recurso é destinado a apps que serão usados somente por pessoas que têm uma função neles, durante o desenvolvimento ou para testes. Caso o app seja usado apenas na sua conta profissional do Instagram ou em uma conta que você gerencia, o acesso padrão será suficiente.
Advanced Access
O Advanced Access é o nível de acesso necessário se o app atender a contas profissionais do Instagram que você não possui ou gerencia e puder ser usado por usuários que não têm uma função no app ou no portfólio empresarial que o obteve. Esse nível de acesso requer a análise do app e a verificação da empresa.
Observação: devido ao escopo limitado do acesso padrão, talvez alguns recursos não funcionem corretamente até que o app receba acesso avançado. Isso pode limitar a funcionalidade dos apps de teste que você usa.
Saiba mais sobre Advanced e Standard Access.
Análise do App
A análise do app permite que a Meta verifique se o app usa nossos produtos e APIs de uma forma que aprovamos. Seu app precisa passar pela análise da Meta para receber Advanced Access. Saiba mais sobre a Análise do App da Meta.
Apps privados
Caso nossos analistas não consigam fazer testes porque o app usa uma intranet privada, não tem uma interface do usuário ou não implementou o Login do Facebook para Empresas, você só poderá solicitar a aprovação das seguintes permissões:
instagram_basic
instagram_manage_comments
Usuários do app
Para usar as APIs, os usuários do app precisam ter uma conta profissional do Instagram⁠. Uma conta profissional do Instagram pode ser para uma empresa ou um criador de conteúdo. Você pode criar seu app para atender a empresas e criadores de conteúdo com contas profissionais do Instagram que só têm presença no Instagram e usam o Login do Instagram para Empresas ou empresas e criadores de conteúdo com contas profissionais do Instagram que estão vinculadas a uma Página do Facebook e usam o Login do Facebook para Empresas. Para uma conta profissional do Instagram vinculada a uma página do Facebook, o usuário do app também precisa poder executar tarefas na página em questão.
Seu app também interagirá com os usuários do Instagram que interagem com as contas profissionais dos usuários do app no Instagram. Essas interações podem acontecer por meio de reações e comentários nos comentários, posts, reels, stories e anúncios do Instagram, bem como no Instagram Direct.
Autenticação e autorização
A autorização do ponto de extremidade é controlada por meio de permissões e recursos. Antes que seu app possa usar um endpoint para acessar os dados da conta profissional do Instagram de um usuário, você precisa solicitar todas as permissões exigidas pelos endpoints ao usuário do app. Para solicitar permissões dos usuários do app, implemente o Login do Instagram para Empresas ou o Login do Facebook para Empresas. Se você implementar o Login do Instagram para Empresas, os usuários do app farão login com as credenciais do Instagram. Se você implementar o Login do Facebook para Empresas, os usuários do app farão login com as credenciais do Facebook.
Para iniciar o fluxo de login, um usuário do aplicativo clica na URL incorporada. A Meta abre uma janela de autorização onde o usuário concede as permissões solicitadas ao app. Depois, a Meta redirecionará o usuário para o URI de redirecionamento do seu app e enviará um código de autorização. O código é válido por uma hora.
Depois, troque o código de autorização por um token de acesso de curta duração, um ID do usuário do seu app e uma lista de permissões concedidas por ele. O token de acesso é válido por uma hora. Os tokens de acesso seguem o protocolo OAuth 2.0, têm escopo no app (exclusivo para o app e o usuário) e são necessários para a maioria das chamadas de API. Os apps que usam o Login do Instagram para Empresas recebem tokens de acesso do usuário do Instagram, enquanto os que usam o Login do Facebook para Empresas recebem tokens de acesso do usuário do Facebook.
Antes da expiração do token de acesso de curta duração, seu app o trocará por um token de acesso de longa duração. O token de acesso é válido por 60 dias e pode ser atualizado antes de expirar.
Depois que as permissões forem concedidas e o app receber um token de acesso, será possível consultar os pontos de extremidade para acessar os dados do usuário. Uma permissão autoriza o acesso somente a dados criados pelo usuário do app que a concedeu. Alguns pontos de extremidade permitem que os apps acessem dados que não foram criados pelo usuário, mas que são limitados e públicos.
Se o app atender somente às suas contas profissionais do Instagram ou às contas que você gerencia, não será necessário implementar um fluxo de login. No entanto, você precisará definir as configurações de login da empresa no Painel de Apps para obter um ID e uma chave secreta do app do Instagram, bem como tokens de acesso de longa duração para usar nas chamadas de API.
Recursos e permissões
A API usa as seguintes permissões e recursos, que são baseados no tipo de login:
Login do Instagram	Login do Facebook

instagram_business_basic
instagram_business_content_publish
instagram_business_manage_comments
instagram_business_manage_messages
Human Agent
	
instagram_basic
instagram_content_publish
instagram_manage_comments
instagram_manage_insights
instagram_manage_messages
pages_show_list
pages_read_engagement
Human Agent
Acesso ao Conteúdo Público do Instagram

O recurso Human Agent permite que seu app use um agente humano para responder às mensagens de usuários com a tag human_agent até sete dias após o envio da mensagem por um usuário. O uso permitido do recurso é para oferecer o suporte de um agente humano nos casos em que o problema do usuário não pode ser resolvido na janela de mensagens-padrão. Por exemplo, quando a empresa fechar no fim de semana ou a questão exigir mais de 24 horas para ser resolvida.

O recurso Acesso ao Conteúdo Público do Instagram permite que seu app acesse os pontos de extremidade da Pesquisa de Hashtag da Graph API do Instagram.
O uso desse recurso é concedido para descobrir conteúdo associado às suas campanhas de hashtag, entender o sentimento do público com relação à sua marca ou identificar participantes de concursos, competições e sorteios. Ele também pode ser usado para fornecer suporte ao cliente, além de compreender e gerenciar melhor seu público.

Consulte a referência da API para determinar quais permissões e recursos o app precisa solicitar dos usuários.
URLs de base
Para apps que usam o Login do Instagram para Empresas, onde os usuários entram com as próprias credenciais do Instagram, todos os pontos de extremidade são acessados por meio do host graph.instagram.com.
Para apps que usam o Login do Facebook para Empresas, onde a conta profissional do Instagram dos usuários do seu app está vinculada a uma Página do Facebook e os usuários do app entram com as próprias credenciais do Facebook, todos os pontos de extremidade são acessados via host graph.facebook.com.
Verificação da empresa
Conclua a verificação da empresa se o app exigir Advanced Access ou se ele for usado por usuários que não tenham uma função no app ou na empresa que o obteve.
Moderação de comentários
Um usuário do Instagram comenta na mídia da conta profissional do Instagram do usuário do seu app. Seu app pode usar a API para obter, responder, excluir, ocultar/reexibir e desabilitar/habilitar comentários em mídias do Instagram pertencentes à conta profissional dos seus usuários no Instagram. A API também pode identificar mídias em que a conta profissional do Instagram foi @mencionada por outros usuários.
Publicação de conteúdo
Seu app pode usar a API para publicar imagens, vídeos ou reels individuais (publicações de mídia única) ou criar publicações contendo várias imagens e vídeos (publicações em carrossel) em nome das contas profissionais do Instagram do usuário do app.
URLs de rede de fornecimento de conteúdo
A plataforma do Instagram usa URLs de rede de fornecimento de conteúdo (CDN, pelas iniciais em inglês) para que você possa recuperar o conteúdo de mídia interativa compartilhado por usuários do Instagram. Por privacidade, o URL de CDN não retornará mídia quando o conteúdo tiver sido excluído ou tiver expirado.
Colaboradores
Somente Login do Facebook para Empresas.
As tags de colaborador do Instagram⁠ permitem que os usuários do app sejam coautores de conteúdo, como publicar mídia com outras contas (colaboradores).
Salvo algumas exceções, os dados de mídia com coautoria podem ser acessados por meio da API somente pelo usuário que a publicou. Os colaboradores não conseguem acessar os dados usando a API. As únicas exceções são as pesquisas por mídias com melhor desempenho ou recém-publicadas que foram marcadas com uma hashtag específica.
Desenvolva com a Meta
Antes de integrar uma API de Tecnologias da Meta ao seu app, você precisa se inscrever como desenvolvedor da Meta e criar uma representação do seu app no Painel de Apps da Meta.
Ao criar um app, você adicionará os seguintes produtos dependendo do tipo de login:
	Login de Empresa no Instagram	Login do Facebook para Empresas

Produtos obrigatórios
	
Instagram > Configuração da API do Instagram com o Login do Instagram
	
Login do Facebook para Empresas
Messenger, incluindo as configurações do Instagram para enviar e receber mensagens
Instagram > Configuração da API do Instagram com o Login do Facebook
IDs de apps
Esses IDs são necessários durante a autenticação e podem ser encontrados no Painel de Apps da Meta. Os apps que utilizam o Login do Facebook para Empresas usarão o ID do app da Meta exibido na parte superior do Painel de Apps da Meta para seu app. Os apps que utilizam o Login do Instagram para Empresas usarão o ID do app do Instagram exibido na seção Instagram > Configuração da API com login do Instagram do painel.
Páginas do Facebook⁠
Caso o app implemente o Login do Facebook para Empresas, as contas profissionais do Instagram dos usuários precisarão estar conectadas a uma Página do Facebook.
Tarefas
Os usuários precisam ter a capacidade de executar tarefas na Página do Facebook vinculada à conta profissional do Instagram para que possam conceder ao seu app as permissões relacionadas a essas tarefas. A tabela a seguir mapeia o nome da tarefa nas nossas IAs, como Configurações da Página do Facebook ou Meta Business Suite, com os nomes de tarefas retornados em solicitações de endpoint GET /me/accounts e a permissão que o usuário pode conceder se puder realizar essa tarefa.
Nome da tarefa nas IAs	Nome da tarefa na API	Permissões concedíveis

Anúncios
	
PROFILE_PLUS_ADVERTISE
	
instagram_basic

Conteúdo
	
PROFILE_PLUS_CREATE_CONTENT
	
instagram_basicinstagram_content_publish

Controle total
	
PROFILE_PLUS_FULL_CONTROL
	
instagram_basicinstagram_content_publish

Informações
	
PROFILE_PLUS_ANALYZE
	
instagram_basicinstagram_manage_insights

Mensagens
	
PROFILE_PLUS_MESSAGING
	
instagram_basic
instagram_manage_messages

Atividade da comunidade
	
PROFILE_PLUS_MODERATE
	
instagram_basic
instagram_manage_comments
Consulte a referência da API do Instagram para ver quais permissões são exigidas em cada endpoint.
IDs do usuário no escopo
Números de identificação do usuário no escopo do Instagram
Quando um usuário do Instagram comenta em uma publicação, reel ou story, ou envia uma mensagem a uma conta profissional do Instagram, um número de identificação do usuário com escopo do Instagram é criado para representar essa pessoa no app. Ele é específico para a pessoa e a conta do Instagram com a qual ela está interagindo. Isso permite que os usuários, as empresas e os criadores de conteúdo do app mapeiem interações para a mesma pessoa em vários apps.
IDs do usuário no escopo da Página
Quando um usuário do Instagram comenta em uma publicação, reel ou story ou envia uma mensagem para uma conta profissional do Instagram, um ID do usuário no escopo da Página é criado para representar a pessoa no app. Ele é específico para a pessoa e a conta do Instagram com a qual ela está interagindo. Isso permite que os usuários, as empresas e os criadores de conteúdo do app mapeiem interações para a mesma pessoa em vários apps.
o endpoint /me
O endpoint /me é especial e se traduz na identificação do objeto da conta, Página do Facebook ou conta profissional do Instagram, cujo token de acesso está sendo usado para fazer as chamadas à API. Ele também pode representar qualquer ID, comentário, conversa, mídia, publicação, reel e story pertencente à conta profissional do usuário do app no Instagram.
Mensagens
Um usuário do Instagram envia uma mensagem para a conta profissional do Instagram do usuário do seu app enquanto está conectado ao Instagram. A mensagem será entregue na caixa de entrada do Instagram do usuário do app, e uma notificação de webhook será enviada ao seu servidor. Seu app pode usar a API para responder dentro desse período. Caso seja necessário mais tempo para permitir que um agente humano responda, você poderá usar a tag de agente humano para enviar uma resposta em até 7 dias.
Se o app usar o Login do Facebook para Empresas, ele utilizará a API de Mensagens do Instagram da plataforma do Messenger para enviar e receber mensagens.
Caixa de Entrada do Instagram
Uma conta profissional do Instagram tem uma caixa de entrada de mensagens que permite controlar notificações e organizar mensagens. Por padrão, as notificações ficam desativadas. Para ativá-las, acesse as configurações da Caixa de Entrada. A Caixa de Entrada é organizada conforme as seguintes categorias: Principal, Geral e Solicitações. Por padrão, todas as novas conversas com seguidores aparecerão na pasta Principal. As conversas anteriores à implementação das Mensagens do Instagram estarão na pasta em que você as colocou.
As mensagens recebidas de pessoas que não seguem sua conta ficam na pasta Solicitações. É possível aceitar ou recusar essas solicitações. Vale destacar que as mensagens serão marcadas como Visto apenas se você as aceitar. Depois de aceitar a solicitação, você poderá mover a conversa para a pasta Principal ou Geral. Todas as solicitações de mensagens respondidas por meio de apps de terceiros serão movidas para a pasta Geral.
Limitações da Caixa de Entrada
Se você responder a uma mensagem por meio de um app de terceiros, a conversa será movida para a pasta Geral independentemente da configuração.
As pastas da Caixa de Entrada não são compatíveis com a plataforma do Messenger, e mensagens enviadas por meio dela não incluirão as informações de pasta exibidas no app do Instagram from Meta.
As notificações de webhooks ou as mensagens entregues por meio da API não serão consideradas como Lida na Caixa de Entrada do app do Instagram. Uma mensagem só será considerada Lida após o envio de uma resposta.
Experiências automatizadas
É possível fornecer um caminho de escalação para experiências de mensagens automatizadas usando uma destas opções:
Um app único: é possível criar uma Caixa de Entrada personalizada para receber ou responder a mensagens de uma pessoa. A Caixa de Entrada personalizada tem a tecnologia do mesmo app de mensagens que fornece a experiência automatizada
Vários apps: o protocolo de entrega permite que você passe a conversa de um app ou uma caixa de entrada para outro. Por exemplo, um app administraria a conversa com uma experiência automatizada; quando necessário, outro app receberia a conversa para passá-la a um agente humano.
Informar os usuários sobre a experiência de bate-papo automatizado
Nas situações exigidas pela legislação aplicável, as experiências de bate-papo automatizado devem informar que uma pessoa está interagindo com um serviço automatizado:
no começo de qualquer conversa ou tópico de mensagem,
após um lapso de tempo significativo;
quando o bate-papo passar de interação humana para experiência automatizada.
Esse requisito precisa receber atenção especial no caso de experiências que atendem aos seguintes grupos:
Mercado ou usuários da Califórnia
Mercado ou usuários da Alemanha
As divulgações incluem, entre outros: “Sou o bot da página [Nome da Página]”, “Você está interagindo com uma experiência automatizada”, “Você está falando com um bot” ou “Eu sou um bot de bate-papo automatizado.”
Mesmo que não haja uma exigência legal, recomendamos como boa prática informar aos usuários quando eles estiverem interagindo com uma conversa automatizada. Isso ajuda a gerenciar as expectativas das pessoas quanto à experiência de troca de mensagens.
Leia nossas Políticas do Desenvolvedor para saber mais.
Políticas
Para obter e manter o acesso ao gráfico social da Meta, você precisa cumprir os requisitos a seguir:
Bate-papos automatizados no Instagram⁠
Termos da Plataforma da Meta
Políticas do Desenvolvedor
Padrões da Comunidade⁠
Iniciativas da plataforma responsável
Limitação de volume
Todos os pontos de extremidade estão sujeitos à limitação de volume do Instagram para Empresas, exceto os pontos de extremidade Descoberta de empresas e Pesquisa de hashtag, que estão sujeitos à limitação de volume da plataforma.
As chamadas aos pontos de extremidade da plataforma do Instagram, excluindo mensagens, são contabilizadas na contagem de chamadas do app. A contagem de chamadas de um app, única para cada app e par de usuários, é o número de chamadas feitas durante uma janela de 24 horas. O cálculo é feito da seguinte forma:
Calls within 24 hours = 4800 * Number of Impressions
O número de impressões é o número de vezes que um conteúdo da conta profissional do usuário do Instagram apareceu na tela de uma pessoa nas últimas 24 horas.
Observações
A API de Descoberta de Empresas e a API de Pesquisa de Hashtag estão sujeitas aos limites de volume da plataforma.
Limites de volume de mensagens
As chamadas aos pontos de extremidade de mensagens do Instagram são contabilizadas no número de chamadas que o app pode fazer por conta profissional do Instagram e por API usada.
API de Conversas
Seu app pode fazer duas chamadas por segundo por conta profissional do Instagram.
Private Replies API
Seu app pode fazer 100 chamadas por segundo por conta profissional do Instagram para respostas privadas a comentários do Instagram Live.
Seu app pode fazer 750 chamadas por hora por conta profissional do Instagram para respostas privadas a comentários em posts e reels do Instagram.
API de envio
Seu app pode fazer 100 chamadas por segundo por conta profissional do Instagram para mensagens que contenham texto, links, reações e figurinhas.
Seu app pode fazer 10 chamadas por segundo por conta profissional do Instagram para mensagens que tenham conteúdo de áudio ou vídeo.
Webhooks
Recomendamos o uso de webhooks para receber notificações sobre objetos de mídia ou mensagens dos usuários do seu app. O uso de webhooks reduzirá o número de chamadas de API necessárias feitas pelo seu app e, assim, reduzirá o risco de limitação de volume.
Próximas etapas
Agora que você conhece os componentes da API, configure o servidor de webhooks e assine os eventos.
Veja também
Saiba mais sobre a Graph API da Meta e a plataforma do Messenger.
Você achou esta página útil?