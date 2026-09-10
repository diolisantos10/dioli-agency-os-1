---
titulo: "Marketing API — referência de AdCreative"
url: https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ad-creative
capturado_em: 2026-09-10
hash: 288c2b62f9f7f77f
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Version
v22.0
v23.0
v24.0
v25.0
Isso foi útil?
Criativo do anúncio
Updated: 6 de ago de 2026
Copiar para LLM
Ver como Markdown
Os anúncios no Status do WhatsApp são disponibilizados por meio da API de Marketing. Saiba mais sobre anúncios no Status do WhatsApp.
O formato que fornece layout e inclui o conteúdo do anúncio. Para ver os criativos de anúncio disponíveis, acesse o Guia de Anúncios⁠. Além disso, o guia contém informações sobre os requisitos de tamanho para cada unidade de anúncio. Veja também Facebook para Empresas⁠ e Publicação de blog sobre criação de publicação da página inline.
Anúncios sobre temas sociais, eleições e política
Os anunciantes que veiculam anúncios sobre temas sociais, eleições e política devem especificar special_ad_categories ao criar uma campanha. Além disso, as empresas também precisam definir authorization_category para sinalizar no nível do criativo do anúncio. Saiba mais sobre os requisitos.
Exemplos
Por exemplo, obtenha informações sobre um criativo do anúncio, como o ID do post sem exibição na Página recém-criado:
curl -G \
  -d 'fields=name,object_story_id' \
  -d 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/<CREATIVE_ID>
Crie um anúncio com link:
curl \
  -F 'name=Sample Creative' \
  -F 'object_story_spec={
    "link_data": {
      "image_hash": "<IMAGE_HASH>",
      "link": "<URL>",
      "message": "try it out"
    },
    "page_id": "<PAGE_ID>"
  }' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/adcreatives
É possível substituir picture por image_hash para especificar uma imagem da biblioteca da conta de anúncios. Você também pode especificar o corte de imagem com image_crops em link_data. Consulte Image Crop, Reference.
Para criar um criativo do anúncio político, use o campo authorization_category com o valor POLITICAL. Por exemplo:
curl \
  -F 'authorization_category=POLITICAL' \
  -F 'object_story_spec={
    ...
  }' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/adcreatives
A partir de 9 de janeiro de 2024, para criar um anúncio sobre temas sociais, eleições ou política que usa mídia criada ou alterada digitalmente, use o campo authorization_category com o valor POLITICAL_WITH_DIGITALLY_CREATED_MEDIA. Por exemplo:
curl \
  -F 'authorization_category=POLITICAL_WITH_DIGITALLY_CREATED_MEDIA' \
  -F 'object_story_spec={
    ...
  }' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/adcreatives
Para obter as diretrizes sobre anúncios do Facebook, consulte Diretrizes de Anúncios⁠.
Artigos relacionados
Anúncios de app
Anúncios em carrossel e vídeo
Anúncios de catálogo Advantage+
Anúncios do Instagram
Anúncios de clique para o WhatsApp
Anúncios de lead
Limites
Retorna apenas 50.000 criativos do anúncio. A paginação além desse número não está disponível.
Limites em nível de campo
Limite	Valor

Comprimento máximo do título do anúncio
	
25 caracteres (recomendado)

Comprimento mínimo do título do anúncio
	
1 caractere

Comprimento máximo do corpo do anúncio
	
90 caracteres (recomendado)

Comprimento mínimo do corpo do anúncio
	
1 caractere

Comprimento máximo de uma URL
	
1.000 caracteres

Tamanho máximo de uma palavra individual no título ou no corpo
	
30 caracteres (recomendado)
Limites de título e corpo
Deve estar entre os tamanhos mínimo e máximo do título e do corpo.
Não pode iniciar com um sinal de pontuação \ / ! . ? - * ( ) , ; :
Não pode ter pontuação consecutiva, exceto três pontos finais ...
Palavras com até 30 caracteres
Apenas três palavras de um caractere são permitidas.
Os caracteres a seguir não são permitidos:
Símbolos IPA. Exceto: ə, ɚ, ɛ, ɜ, ɝ, ɞ, ɟ
Sinais diacríticos A versão pré-composta de um caractere e o sinal diacrítico são permitidos. Não são permitidos sinais diacríticos independentes.
Caracteres de sobrescritivo e subscrito, exceto ™ e ℠
Esses caracteres ^~_={}[]|<>
Exceções
Anúncios com link não podem usar caracteres especiais
Anúncios de publicações da Página permitem caracteres especiais, como ★
Posicionamento
Veja Placement para restrições de posicionamento do seu anúncio com base no criativo.
Leitura
Um objeto de criativo do anúncio é uma instância de um criativo específico que está sendo usado para definir o campo creative de um ou mais anúncios.
Ler miniatura
Solicitar o URL e as dimensões da miniatura:
curl -G \
  -d 'thumbnail_width=150' \
  -d 'thumbnail_height=120' \
  -d 'fields=thumbnail_url' \
  -d 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/<CREATIVE_ID>
Exemplo
Selecionar idioma
HTTP
PHP SDK
JavaScript SDK
Android SDK
iOS SDK
cURL
GET /v25.0/<CREATIVE_ID>/?fields=asset_feed_spec HTTP/1.1
Host: graph.facebook.com

Teste no Explorador da Graph API
Para saber como usar a Graph API, leia nosso guia Como usar a Graph API
Parâmetros
Parâmetro	Descrição

thumbnail_height
int64
	

Valor padrão: 64
Altura renderizada das miniaturas fornecidas em thumbnail_url, em pixels.

thumbnail_width
int64
	

Valor padrão: 64
Largura renderizada de miniaturas acessíveis em thumbnail_url, em pixels.
Campos
Campo	Descrição

id
string numérica
	
Identificação única do criativo do anúncio, string numérica.

account_id
string numérica
	
Identificação da conta de anúncios à qual o criativo pertence.

actor_id
string numérica
	
O ID do ator (ID da Página) deste criativo.

ad_disclaimer_spec
AdCreativeAdDisclaimer
	
Dados de rótulo de anúncio no criativo para informações adicionais.

adlabels
lista<AdLabel>
	
Rótulos de anúncios associados a este criativo. Usado para agrupar com objetos de anúncio relacionados.

applink_treatment
enum
	
Usado para anúncios dinâmicos. Especifique o que deve acontecer se alguém clicar em um link no anúncio, mas o app da empresa não estiver instalado no dispositivo. Por exemplo, abra uma página da web que mostre o produto ou abra o app em uma loja de apps no dispositivo móvel da pessoa.

asset_feed_spec
AdAssetFeedSpec
	
Usado para criativo dinâmico a fim de experimentar e veicular automaticamente diferentes variações do criativo de um anúncio. Especifica um feed de ativos com várias imagens, texto e outros ativos usados para gerar variações de um anúncio. Formatado como uma string JSON.

authorization_category
enum
	
Especifica se o anúncio foi configurado para ser rotulado como conteúdo político ou não. Consulte Políticas de Publicidade do Facebook⁠. Este campo não pode ser usado para anúncios dinâmicos.

body
string
	
O corpo do anúncio. Não há suporte para criativos de post de vídeo.

branded_content
AdCreativeBrandedContentAds
	
branded_content

branded_content_sponsor_page_id
string numérica
	
Identificação da página que representa a empresa que veicula anúncios de conteúdo de marca. Consulte Como criar anúncios de conteúdo de marca.

bundle_folder_id
string numérica
	
O ID da pasta do pacote do anúncio dinâmico.

call_to_action
AdCreativeLinkDataCallToAction
	
Chamada para ação de um anúncio criado a partir de um post existente do Instagram

call_to_action_type
enum {OPEN_LINK, LIKE_PAGE, SHOP_NOW, PLAY_GAME, INSTALL_APP, USE_APP, CALL, CALL_ME, VIDEO_CALL, INSTALL_MOBILE_APP, USE_MOBILE_APP, MOBILE_DOWNLOAD, BOOK_TRAVEL, LISTEN_MUSIC, WATCH_VIDEO, LEARN_MORE, SIGN_UP, DOWNLOAD, WATCH_MORE, NO_BUTTON, VISIT_PAGES_FEED, CALL_NOW, APPLY_NOW, CONTACT, BUY_NOW, GET_OFFER, GET_OFFER_VIEW, BUY_TICKETS, UPDATE_APP, GET_DIRECTIONS, BUY, SEND_UPDATES, MESSAGE_PAGE, DONATE, SUBSCRIBE, SAY_THANKS, SELL_NOW, SHARE, DONATE_NOW, GET_QUOTE, CONTACT_US, ORDER_NOW, START_ORDER, ADD_TO_CART, VIEW_CART, VIEW_IN_CART, VIDEO_ANNOTATION, RECORD_NOW, INQUIRE_NOW, CONFIRM, REFER_FRIENDS, REQUEST_TIME, GET_SHOWTIMES, LISTEN_NOW, TRY_DEMO, WOODHENGE_SUPPORT, SOTTO_SUBSCRIBE, FOLLOW_USER, RAISE_MONEY, SEE_SHOP, GET_DETAILS, FIND_OUT_MORE, VISIT_WEBSITE, BROWSE_SHOP, EVENT_RSVP, WHATSAPP_MESSAGE, FOLLOW_NEWS_STORYLINE, SEE_MORE, BOOK_NOW, FIND_A_GROUP, FIND_YOUR_GROUPS, PAY_TO_ACCESS, PURCHASE_GIFT_CARDS, FOLLOW_PAGE, SEND_A_GIFT, SWIPE_UP_SHOP, SWIPE_UP_PRODUCT, SEND_GIFT_MONEY, PLAY_GAME_ON_FACEBOOK, GET_STARTED, OPEN_INSTANT_APP, AUDIO_CALL, GET_PROMOTIONS, JOIN_CHANNEL, MAKE_AN_APPOINTMENT, ASK_ABOUT_SERVICES, BOOK_A_CONSULTATION, GET_A_QUOTE, BUY_VIA_MESSAGE, ASK_FOR_MORE_INFO, CHAT_WITH_US, VIEW_PRODUCT, VIEW_CHANNEL, GET_IN_TOUCH, ASK_A_QUESTION, START_A_CHAT, CHAT_NOW, ASK_US, WATCH_LIVE_VIDEO, JOIN_LIVE_VIDEO, SHOP_WITH_AI, TRY_ON_WITH_AI}
	
O tipo de botão de chamada para ação no anúncio. Isso determina o texto do botão e o texto do cabeçalho do anúncio. Consulte o Guia de anúncios⁠ para ver os objetivos da campanha e os tipos permitidos de chamada para ação.

categorization_criteria
enum
	
O campo de categorização do anúncio de categoria dinâmica, por exemplo, marca.

category_media_source
enum
	
O modo de renderização do anúncio dinâmico para anúncios de categoria

collaborative_ads_lsb_image_bank_id
string numérica
	
Usado para o banco de imagens de entrega local do CPAS

contextual_multi_ads
AdCreativeContextualMultiAds
	
contextual_multi_ads

creative_sourcing_spec
AdCreativeSourcingSpec
	
creative_sourcing_spec

degrees_of_freedom_spec
AdCreativeDegreesOfFreedomSpec
	
Especifica os tipos de transformações habilitadas para o criativo.

destination_set_id
string numérica
	
O ID do conjunto de produtos para um catálogo de destinos que será usado para vinculação com catálogos de viagens.

dynamic_ad_voice
string
	
Usado para o objetivo de tráfego para o estabelecimento dentro de anúncios dinâmicos. Permite que você controle a voz do seu anúncio. Se for definido como DYNAMIC, o nome da página e a foto de perfil na publicação do seu anúncio virão da localização de página mais próxima. Se for definido como STORY_OWNER, o nome da página e a foto de perfil na publicação de anúncio virão da localização da Página principal.

effective_authorization_category
enum
	
Especifica se o anúncio é de teor político ou não. Consulte Políticas de Publicidade do Facebook⁠. Este campo não pode ser usado para anúncios dinâmicos.
Esse valor pode ser diferente do valor de "authorization_category" caso nossos sistemas tenham identificado o anúncio como político, mesmo que ele não tenha sido configurado para ser rotulado como tal.

effective_instagram_media_id
string numérica
	
A identificação de uma publicação do Instagram a ser usada no anúncio.

effective_object_story_id
token com estrutura: identificação do post
	
A identificação de uma publicação da Página a ser usada no anúncio, independentemente de ser uma publicação orgânica ou não exibida na Página.

enable_direct_install
booliano
	
Indica se a instalação direta deve ser habilitada em dispositivos compatíveis.

enable_launch_instant_app
booliano
	
Indica se o app instantâneo deve ser habilitado em dispositivos compatíveis.

existing_post_title
string
	
existing_post_title

facebook_branded_content
AdCreativeFacebookBrandedContent
	
Campos de armazenamento para conteúdo de marca do Facebook

format_transformation_spec
lista<AdCreativeFormatTransformationSpec>
	
format_transformation_spec

generative_asset_spec
AdCreativeGenerativeAssetSpec
	
generative_asset_spec

image_crops
AdsImageCrops
	
Um objeto JSON usado para definir dimensões de corte para a imagem especificada. Consulte a referência de corte de imagem para obter mais detalhes.

image_hash
string
	
Hash de imagem para o criativo do anúncio. Se for fornecida, não adicione image_url. Consulte a biblioteca de imagens para obter mais detalhes.

image_url
string
	
Um URL da imagem para o criativo. Salvaremos a imagem nesse URL na biblioteca de imagens da conta de anúncios. Caso for fornecida, não inclua image_hash.

instagram_permalink_url
string
	
A URL de uma publicação do Instagram que você quer veicular como anúncio. Também conhecido como mídia do Instagram.

instagram_user_id
string numérica
	
Identificação do ator do Instagram

interactive_components_spec
AdCreativeInteractiveComponentsSpec
	
Especificações de todos os componentes interativos que serão exibidos no anúncio.

link_destination_display_url
string
	
Substitui o URL de exibição dos anúncios com link quando object_url é definido como uma tag de clique.

link_og_id
string numérica
	
O ID do Open Graph (OG) para o link no criativo, caso a página de destino tenha tags do OG.

link_url
string
	
Identifique uma aba de destino específica na sua Página do Facebook pela URL da aba da Página. Consulte connection objects para saber como recuperar URLs de abas de Páginas. É possível adicionar parâmetros app_data à URL para transmitir dados à aba de uma Página.

marketing_message_structured_spec
AdCreativeMarketingMessageStructuredSpec
	
Personalizações opcionais para a mensagem de marketing do WhatsApp veiculada com esse anúncio, retornadas quando o conjunto de anúncios inclui a posição marketing_messages do WhatsApp. Os criativos que não personalizam a mensagem de marketing não têm nada definido aqui. A mensagem de marketing é criada a partir de object_story_spec.

media_sourcing_spec
AdCreativeMediaSourcingSpec
	
media_sourcing_spec

messenger_sponsored_message
string
	
Usado para mensagens patrocinadas do Messenger. A string JSON com mensagem para o criativo do anúncio. Consulte Plataforma do Messenger, Referência da API de Envio.

name
string
	
O nome do criativo do anúncio, conforme exibido na biblioteca da conta de anúncios. Este campo tem um limite de 100 caracteres.

object_id
string numérica
	
O ID do objeto do Facebook que está sendo promovido ou é relevante para o anúncio ou tipo de anúncio. Por exemplo, uma identificação de página se estiver executando anúncios para gerar curtidas na Página. Consulte promoted_object.

object_store_url
string
	
iTunes ou Google Play do destino de um anúncio de app

object_story_id
token com estrutura: identificação do post
	
Identificação de uma publicação da Página do Facebook a ser usada no anúncio. É possível obter essa identificação consultando os posts da página. Se a publicação incluir uma imagem, ela não deverá exceder 8 MB. O Facebook carregará a imagem da publicação na biblioteca de imagens da sua conta de anúncios. Se você criar uma publicação sem exibição na Página via object_story_spec ao mesmo tempo que criar o anúncio, esse ID será nulo. Porém, effective_object_story_id será a identificação da publicação de página, independentemente de ser uma publicação orgânica ou não exibida na página.

object_story_spec
AdCreativeObjectStorySpec
	
Use esta opção se quiser criar um novo post sem exibição na Página e transformá-lo em um anúncio. A identificação da Página e o conteúdo para criar um novo post sem exibição na Página. Especifique link_data, photo_data, video_data, text_data ou template_data com o conteúdo.

object_story_spec{whats_app_business_phone_number}
string
	
O número de telefone comercial do WhatsApp do qual as mensagens de marketing são enviadas, em formato legível por humanos, por exemplo +1-650-555-1234. Solicite explicitamente com fields=object_story_spec{whats_app_business_phone_number}. Não é retornado por padrão. Retorna null quando o criativo não tem um número de telefone atribuído.

object_type
enum {APPLICATION, DOMAIN, EVENT, OFFER, PAGE, PHOTO, SHARE, STATUS, STORE_ITEM, VIDEO, INVALID, PRIVACY_CHECK_FAIL, POST_DELETED}
	
O tipo de objeto do Facebook que você quer anunciar. Valores permitidos:
PAGE
DOMAIN
EVENT
STORE_ITEM: refere-se a um destino da iTunes Store ou da Google Play Store.
SHARE: de uma página
PHOTO
STATUS: de uma página
VIDEO
APPLICATION: app no Facebook
INVALID: quando um object_id inválido foi especificado, como um objeto excluído, ou se você não tiver permissão para ver o objeto. Em alguns casos, esse campo poderá ficar vazio se o Facebook não conseguir identificar o tipo de objeto anunciado.
PRIVACY_CHECK_FAIL: você não tem permissão para carregar esse tipo de objeto
POST_DELETED: este object_type foi excluído

object_url
string
	
URL que abre quando alguém clica no seu link em um anúncio com link. Este URL não está conectado a uma página do Facebook.

page_welcome_message
string
	
Mensagem de boas-vindas da Página para anúncios de CTM

photo_album_source_object_story_id
string
	
photo_album_source_object_story_id

place_page_set_id
string numérica
	
A identificação da página definida para o criativo. Consulte o guia Divulgação nas imediações.

platform_customizations
AdCreativePlatformCustomization
	
Use este campo para especificar a mídia exata a ser usada em diferentes posicionamentos do Facebook. Atualmente, você pode usar essa configuração para imagens e vídeos. O Facebook substitui a mídia originalmente definida no criativo do anúncio por essa mídia quando o anúncio é exibido em posicionamentos específicos. Por exemplo, se você definir uma mídia aqui para instagram, o Facebook usará essa mídia, em vez da mídia definida no criativo do anúncio, quando o anúncio aparecer no Instagram.

playable_asset_id
string numérica
	
O ID do ativo reproduzível neste criativo.

portrait_customizations
AdCreativePortraitCustomizations
	
Este campo descreve as personalizações de renderização selecionadas para anúncios no modo retrato, como IG Stories, FB Stories, IGTV e assim por diante.

product_data
lista<AdCreativeProductData>
	
product_data

product_set_id
string numérica
	
Usado para anúncio dinâmico. O ID de um conjunto de produtos, que agrupa produtos relacionados ou outros itens anunciados.

product_suggestion_settings
AdCreativeProductSuggestionSettings
	
product_suggestion_settings

recommender_settings
AdCreativeRecommenderSettings
	
Usado para anúncios dinâmicos. Configurações para exibir anúncios dinâmicos com base nas recomendações de produtos.

referral_id
string numérica
	
O ID da configuração do anúncio de referência no criativo.

source_facebook_post_id
string numérica
	
source_facebook_post_id

source_instagram_media_id
string numérica
	
A identificação de uma publicação do Instagram para a criação de anúncios

status
enum {ACTIVE, IN_PROCESS, WITH_ISSUES, DELETED}
	
O status do criativo. WITH_ISSUES e IN_PROCESS estão disponíveis para 4.0 ou superior

template_url
string
	
Usado para anúncios dinâmicos quando você quer usar rastreamento de cliques de terceiros. Consulte Anúncios dinâmicos, rastreamento de cliques e modelos.

template_url_spec
AdCreativeTemplateURLSpec
	
Usado para anúncios dinâmicos quando você quer usar rastreamento de cliques de terceiros. Consulte Anúncios dinâmicos, rastreamento de cliques e modelos.

threads_media_id
string numérica
	
threads_media_id

threads_user_id
string numérica
	
threads_user_id

thumbnail_id
string numérica
	
thumbnail_id

thumbnail_url
string
	
URL de uma imagem em miniatura para o criativo do anúncio. Forneça as dimensões para isto com thumbnail_width e thumbnail_height. Veja o exemplo.

title
string
	
O título do anúncio com link, que não pertence a uma página.

url_tags
string
	
Um conjunto de parâmetros da string de consulta que substituirá ou será anexado a URLs clicados a partir de anúncios de post da Página, mensagem do post e criativos de instalação do app canvas.

use_page_actor_override
booliano
	
Usado para Anúncios no App. Se for true, exibiremos a página do Facebook associada aos anúncios de app.

video_id
string numérica
	
O número de identificação de objeto do Facebook para o vídeo no criativo do anúncio.

wamo_whatsapp_identity_spec
AdCreativeWAMOWhatsAppIdentitySpec
	
wamo_whatsapp_identity_spec
Bordas
Borda	Descrição

previews
Borda<AdPreview>
	
Os trechos de HTML para visualizar o criativo.
Códigos de erro
Código de erro	Descrição

2635
	
Você está chamando uma versão obsoleta da API de Anúncios. Atualize para a versão mais recente.

80004
	
Houve muitas chamadas para esta conta de anúncios. Espere um pouco e tente de novo. Para obter mais informações, consulte /docs/graph-api/overview/rate-limiting#ads-management.

100
	
Parâmetro inválido

613
	
As chamadas para esta API ultrapassaram o limite de volume.

2.500
	
Erro ao analisar a consulta da Graph API.

270
	
Esta solicitação da API de Anúncios não é permitida para apps com nível de acesso de desenvolvimento (o acesso de desenvolvimento é o padrão para todos os apps; solicite atualização). Verifique se o token de acesso pertence a um usuário que é administrador do app e da conta de anúncios.

190
	
Token de acesso OAuth 2.0 inválido

200
	
Erro de permissões
Criação
Defina o criativo como independente ou como parte de um conjunto de anúncios. Em ambos os casos, ele será armazenado na biblioteca de criativos da sua conta para uso em anúncios. Se você tentar adicionar um criativo que não seja único, ele não será gerado e retornaremos a identificação do criativo existente. Por exemplo, crie um anúncio com link com uma chamada para ação:
curl \
  -F 'name=Sample Creative' \
  -F 'object_story_spec={
    "link_data": {
      "call_to_action": {"type":"SIGN_UP","value":{"link":"<URL>"}},
      "link": "<URL>",
      "message": "try it out"
    },
    "page_id": "<PAGE_ID>"
  }' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/adcreatives
Use link_caption para passar o objeto de chamada para ação. Ao fazer isso, você poderá personalizar a legenda da chamada para ação. Para personalizar a descrição da chamada para ação, inclua link_description no objeto de chamada para ação.
Criar um anúncio em carrossel
curl \
  -F 'name=Sample Creative' \
  -F 'object_story_spec={
    "link_data": {
      "child_attachments": [
        {
          "description": "$8.99",
          "image_hash": "<IMAGE_HASH>",
          "link": "https:\/\/www.link.com\/product1",
          "name": "Product 1",
          "video_id": "<VIDEO_ID>"
        },
        {
          "description": "$9.99",
          "image_hash": "<IMAGE_HASH>",
          "link": "https:\/\/www.link.com\/product2",
          "name": "Product 2",
          "video_id": "<VIDEO_ID>"
        },
        {
          "description": "$10.99",
          "image_hash": "<IMAGE_HASH>",
          "link": "https:\/\/www.link.com\/product3",
          "name": "Product 3"
        }
      ],
      "link": "<URL>"
    },
    "page_id": "<PAGE_ID>"
  }' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/adcreatives
Posts de anúncios em parceria
Como patrocinador de anúncios em parceria, você pode criar anúncios com posts em que sua marca é marcada. Crie uma campanha, um conjunto de anúncios e anúncios como faria normalmente. A única diferença está no criativo do anúncio.
Defina o campo sponsor_page_id para facebook_branded_content e/ou o campo sponsor_id para instagram_branded_content no criativo do anúncio. Por exemplo:
curl \
 -F 'access_token=<TOKEN>' \
 -F 'facebook_branded_content':{'sponsor_page_id=<PAGE_ID>'}\
 // OR
 -F 'instagram_branded_content':{'sponsor_id=<Instagram_user_ID>'}\
 -F 'object_story_id=<OBJECT_STORY_ID>' \
https://graph.facebook.com/<VERSION>/<ACCOUNT_ID>/adcreatives
Onde object_story_id é a identificação da publicação no formato: postOwnerID_postID.
Criação de publicação da Página inline
A maioria dos criativos do anúncio usa publicações da Página para incluir conteúdo criativo. Embora seja possível criar publicações de Página separadamente e referenciá-las por ID, é mais fácil criá-las na mesma chamada usada para fornecer o criativo do anúncio. Especifique o conteúdo do post da Página com object_story_spec, que criará um post sem exibição na Página. Consulte Publicação da Página inline, Blog.
Você pode obter o novo ID recuperando object_story_id do criativo do anúncio. Para obter identificações de publicações criadas com object_story_spec até /promotable_posts, transmita include_inline=true na sua HTTP GET. Se o valor de include_inline for false, não retornaremos nenhum ID.
Obter objetos relacionados
Muitos criativos de anúncio exigem object_id para um objeto relevante do Facebook, ID do app ou URL da aba da página. Consulte Connection Objects para mais informações.
Exemplos
Crie um anúncio de curtidas na Página de vídeo:
curl \
  -F 'name=Sample Creative' \
  -F 'object_story_spec={
    "page_id": "<PAGE_ID>",
    "video_data": {
      "call_to_action": {"type":"LIKE_PAGE","value":{"page":"<PAGE_ID>"}},
      "image_url": "<THUMBNAIL_URL>",
      "video_id": "<VIDEO_ID>"
    }
  }' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/adcreatives
Criar um anúncio a partir do post de uma Página existente
curl \
  -F 'name=Sample Promoted Post' \
  -F 'object_story_id=<POST_ID>' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/adcreatives
Crie um anúncio de foto com conteúdo de marca⁠ de outra página. Esse recurso está disponível para anúncios de foto, vídeo e link.
curl \
  -F 'name=Sample Creative' \
  -F 'object_story_spec={
    "page_id": "<PAGE_ID>",
    "photo_data": {
      "branded_content_sponsor_page_id": "<SPONSOR_PAGE_ID>",
      "image_hash": "<IMAGE_HASH>"
    }
  }' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/adcreatives
Como adicionar url_tags a um anúncio
curl \
  -F 'object_story_id=<POST_ID>' \
  -F 'url_tags=key1=val1&key2=val2' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/adcreatives
Não é possível executar essa operação no ponto de extremidade.
Atualização
Exemplos
curl \
  -F 'name=New creative name 1517287550' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/<CREATIVE_ID>
/{ad_creative_id}
É possível atualizar um AdCreative fazendo uma solicitação POST a /{ad_creative_id}.
Parâmetros
Parâmetro	Descrição

account_id
string numérica
	
Identificação da conta de anúncios à qual o criativo pertence.

adlabels
lista<Object>
	
Rótulos de anúncios associados a este criativo. Usado para agrupar com objetos de anúncio relacionados.

name
string
	
O nome do criativo na biblioteca de criativos. O campo recebe uma string com até 100 caracteres.

status
enum {ACTIVE, IN_PROCESS, WITH_ISSUES, DELETED}
	
O status do criativo do anúncio. Consulte Armazenamento e recuperação de objetos de anúncio.
Tipo de retorno
Esse ponto de extremidade é compatível com read-after-write e lê o nó em que você fez um POST.

Struct  {
success: bool,
}
Códigos de erro
Código de erro	Descrição

200
	
Erro de permissões

100
	
Parâmetro inválido
Exclusão
Exemplos
curl -X DELETE \
  -d 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/<CREATIVE_ID>/
/{ad_creative_id}
É possível excluir um AdCreative fazendo uma solicitação DELETE para /{ad_creative_id}.
Parâmetros
Parâmetro	Descrição

account_id
string numérica
	
Identificação da conta de anúncios à qual o criativo pertence.

adlabels
lista<Object>
	
Rótulos de anúncios associados a este criativo. Usado para agrupar com objetos de anúncio relacionados.

name
string
	
O nome do criativo do anúncio, conforme exibido na biblioteca da conta de anúncios.

status
enum {ACTIVE, IN_PROCESS, WITH_ISSUES, DELETED}
	
O status do criativo do anúncio. Consulte Armazenamento e recuperação de objetos de anúncio.
Tipo de retorno

Struct  {
success: bool,
}
Códigos de erro
Código de erro	Descrição

200
	
Erro de permissões

80004
	
Houve muitas chamadas para esta conta de anúncios. Espere um pouco e tente de novo. Para obter mais informações, consulte /docs/graph-api/overview/rate-limiting#ads-management.

100
	
Parâmetro inválido
Você achou esta página útil?