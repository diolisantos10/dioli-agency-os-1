---
titulo: "Instagram — comentários e moderação por API"
url: https://developers.facebook.com/documentation/instagram-platform/comment-moderation
capturado_em: 2026-09-09
hash: d9834684cea5553c
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Moderação de comentários
Updated: 2 de jun de 2025
Copiar para LLM
Ver como Markdown
Este guia mostra como receber, responder, excluir, ocultar/reexibir e desabilitar/habilitar comentários em mídias do Instagram dos usuários do seu app que utilizam a plataforma.
Neste guia, os termos usuário do Instagram e conta profissional do Instagram são usados como sinônimos. Um objeto de usuário do Instagram representa a conta profissional do usuário do seu app no Instagram.
Requisitos
Este guia considera que você leu a Visão geral da plataforma do Instagram e implementou os componentes necessários para usar a API, como um fluxo de login da Meta e um servidor de webhooks para receber notificações.
Você precisará do seguinte:
	API do Instagram com o Login do Instagram	API do Instagram com o Login do Facebook

Tokens de acesso
	
Token de acesso do usuário do Instagram
	
Token de acesso à Página do Facebook

URL de hospedagem
	
graph.instagram.com
	
graph.facebook.com

Tipo de login
	
Login de Empresa no Instagram
	
Login do Facebook para Empresas

Permissões
	
instagram_business_basic
instagram_business_manage_comments
	
instagram_basic
instagram_manage_comments
pages_read_engagement
Caso uma função tenha sido concedida ao usuário do app na Página conectada à respectiva conta profissional do Instagram por meio do Gerenciador de Negócios, seu app também precisará da seguinte permissão:
ads_management
ads_read

Webhooks
	
comments
live_comments
	
comments
live_comments
Nível de acesso
Advanced Access se o app atender a contas profissionais do Instagram que você não possui nem gerencia
Acesso padrão se o app atender a contas profissionais do Instagram que você possui ou gerencia e que foram adicionadas ao app no Painel de Apps.
Pontos de extremidade
GET /<IG_MEDIA_ID>/comments – Receber comentários em uma mídia do Instagram
GET /<IG_COMMENT_ID>/replies – Receber respostas em comentários do Instagram
POST /<IG_COMMENT_ID>/replies – Responder a comentário do Instagram
POST /<IG_COMMENT_ID> – Ocultar/exibir comentários.
POST /<IG_MEDIA_ID> – Desabilitar/habilitar comentários em uma mídia do Instagram
DELETE /<IG_COMMENT_ID> – Excluir um comentário do Instagram
Obter comentários
Há duas maneiras de obter comentários em mídias publicadas no Instagram: uma consulta de API ou uma notificação de webhook. Recomendamos o uso de webhooks para evitar a limitação de volume.
Solicitação de API
Para obter todos os comentários em um objeto de mídia publicado no Instagram, envie uma solicitação GET ao ponto de extremidade /<IG_MEDIA_ID>/comments.
curl -X GET "https://<HOST_URL>/v26.0/<IG_MEDIA_ID>/comments"
Se a solicitação for bem-sucedida, o app receberá uma resposta JSON com uma matriz de objetos contendo o ID, o texto e o horário de publicação do comentário.
{
  "data": [
    {
      "timestamp": "2017-08-31T19:16:02+0000",
      "text": "This is awesome!",
      "id": "17870913679156914"
    },
    {
      "timestamp": "2017-08-31T19:16:02+0000",
      "text": "Amazing!",
      "id": "17870913679156914"
    },
    ... // results truncated for brevity
  ]
}

Webhooks
Quando o evento comments ou live_comments for disparado, seu servidor de webhooks receberá uma notificação que inclui o ID da mídia publicada do usuário do seu app e o ID dos comentários nessa mídia, bem como o ID no escopo do Instagram da pessoa que publicou o comentário.
Observação: ao fazer um story do Instagram Live, verifique se o seu servidor pode gerenciar o aumento da carga de notificações disparadas por eventos de webhooks live_comments e diferenciar entre notificações live_comments e comments.
Login do Facebook para Empresas
A carga a seguir será retornada para apps que implementaram o Login do Facebook para Empresas.
[
  {
    "object": "instagram",
    "entry": [
      {
        "id": "<YOUR_APP_USERS_INSTAGRAM_ACCOUNT_ID>",      // ID of your app user's Instagram professional account
        "time": <TIME_META_SENT_THIS_NOTIFICATION>          // Time Meta sent the notification
        "changes": [
          {
            "field": "comments",
            "value": {
              "from": {
                "id": "<INSTAGRAM_USER_SCOPED_ID>",         // Instagram-scoped ID of the Instagram user who made the comment
                "username": "<INSTAGRAM_USER_USERNAME>"     // Username of the Instagram user who made the comment
              }',
              "comment_id": "<COMMENT_ID>",                 // Comment ID of the comment with the mention
              "parent_id": "<PARENT_COMMENT_ID>",           // Parent comment ID, included if the comment was made on a comment
              "text": "<TEXT_ID>",                          // Comment text, included if comment included text
              "media": {
                "id": "<MEDIA_ID>",                             // Media's ID that was commented on
                "ad_id": "<AD_ID>",                             // Ad's ID, included if the comment was on an ad post
                "ad_title": "<AD_TITLE_ID>",                    // Ad's title, included if the comment was on an ad post
                "original_media_id": "<ORIGINAL_MEDIA_ID>",     // Original media's ID, included if the comment was on an ad post
                "media_product_type": "<MEDIA_PRODUCT_ID>"      // Product ID, included if the comment was on a specific product in an ad
              }
            }
          }
        ]
      }
    ]
  }
]
Login de Empresa no Instagram
A carga a seguir será retornada para apps que implementaram o Login do Instagram para Empresas.
[
  {
    "object": "instagram",
    "entry": [
      {
        "id": "<YOUR_APP_USERS_INSTAGRAM_ACCOUNT_ID>",
        "time": <TIME_META_SENT_THIS_NOTIFICATION>

    // Comment or live comment payload
        "field": "comments",
        "value": {
          "id": "<COMMENT_ID>",
          "from": {
            "id": "<INSTAGRAM_SCOPED_USER_ID>",
            "username": "<USERNAME>"
          },
          "text": "<COMMENT_TEXT>",
          "media": {
            "id": "<MEDIA_ID>",
            "media_product_type": "<MEDIA_PRODUCT_TYPE>"
          }
        }
      }
    ]
  }
]
Seu app pode analisar a notificação da API ou do webhook para encontrar comentários que correspondam aos critérios do usuário e, depois, usar o ID do comentário para responder a ele.
Responder a um comentário
Para responder a um comentário, envie uma solicitação POST ao ponto de extremidade /<IG_COMMENT_ID>/replies, sendo <IG_COMMENT_ID> o ID do comentário que você deseja responder, com o parâmetro message definido como o texto da sua mensagem.
Exemplo de solicitação
curl -X POST "https://<HOST_URL>/v26.0/<IG_COMMENT_ID>/replies"
   -H "Content-Type: application/json"
   -d '{
         "message":"Thanks for sharing!"
       }'
Caso ela seja bem-sucedida, o app receberá uma resposta JSON com o ID do comentário.
{
  "id": "17873440459141029"
}

Se o usuário do app tiver muitos comentários para responder, será possível fazer uma solicitação única em lote para as respostas.
Próximas etapas
Saiba como enviar uma mensagem para a pessoa que comentou na publicação de mídia do usuário do seu app usando as respostas privadas.
Você achou esta página útil?