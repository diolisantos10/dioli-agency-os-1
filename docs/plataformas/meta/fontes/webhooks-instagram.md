---
titulo: "Webhooks — configuração para Instagram"
url: https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-instagram
capturado_em: 2026-09-08
hash: e82952677b82b201
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Entrada da pesquisa
​
Webhooks da Meta
Primeiros passos
Contas de anúncios
Instagram
Leads
Catalogs
Messenger
Páginas
Pagamentos
WhatsApp Business Accounts
Exemplos de aplicativos
Borda de assinaturas
Reference
Como configurar webhooks para o Instagram

Com os Webhooks para o Instagram, você recebe notificações em tempo real sempre que alguém @menciona os usuários do seu app, comenta nos objetos de mídia deles ou quando eles têm stories expirados.

Como receber notificações de webhook ao vivo

Para receber notificações de webhook ao vivo, é preciso atender às seguintes condições:

O app precisa ter webhooks do Instagram configurados e os campos adequados assinados no Painel de Apps.
Os apps de consumo devem estar no modo publicado.
Os apps de negócios devem ter permissões com um nível de acesso avançado. É possível solicitar acesso avançado para permissões conforme a imagem abaixo:

Caso o nível de permissão do app não seja acesso avançado, ele não receberá notificações de webhook.

O usuário precisa ter concedido as permissões adequadas ao app (instagram_manage_insights para Stories, instagram_manage_comments para comentários e @menções).
A Página conectada à conta do usuário do app precisa ter as assinaturas de Página habilitadas.
A empresa conectada à Página do usuário do app precisa ser verificada.
O dono do objeto de mídia em que o comentário ou a @menção aparece não poder ter definido a própria conta como privada.
Limitações
As notificações de webhook para comentários em álbuns não incluem o ID do álbum. Para obter essa informação, consulte o ID do comentário no webhook e solicite o campo media.
Caso o comentário ou a @menção apareça na mídia criada por uma conta privada, os apps não receberão notificações de webhook.
As métricas de insights sobre o story com total menor que 5 são retornadas como -1.
Os apps só recebem notificações de webhook para comentários em mídias do Instagram ao vivo durante a transmissão do conteúdo.
O Reels não é compatível.
É necessário que o app tenha passado pela análise (acesso avançado) a fim de receber notificações de webhooks para os campos comments e live_comments.
Se a mídia for usada para anúncios dinâmicos, a identificação do anúncio não será retornada.
Etapa 1: criar um ponto de extremidade

Crie um ponto de extremidade que aceite e processe webhooks. Durante a configuração, selecione o objeto Graph API do Instagram, clique em Configurar e assine um ou mais campos do Instagram.

Campos do Instagram
Campo	Descrição	Permissões necessárias

comments

	

Os comentários em uma mídia do Instagram pertencentes ao usuário do seu app.

Quando alguém comentar uma publicação turbinada ou de anúncio no Instagram, o ad_id, o ad_title e o original_media_id serão retornados no objeto de mídia.

	
instagram_manage_comments
pages_manage_metadata
pages_read_engagementou
pages_show_list

live_comments

	

Os comentários em uma mídia do Instagram ao vivo pertencente ao usuário do seu app.

	
instagram_manage_comments

pages_manage_metadata

pages_read_engagementou
pages_show_list

mentions

	

@menções ao usuário do seu app em um comentário.

	
instagram_manage_comments

pages_manage_metadata

pages_read_engagementou
pages_show_list

story_insights

	

As métricas que descrevem interações em um story. Enviadas uma hora depois de ele expirar.

	
instagram_manage_insights

pages_manage_metadata

pages_read_engagementou
pages_show_list

Etapa 2: habilitar assinaturas de Página

Seu app precisa habilitar assinaturas de Página na Página conectada à conta do usuário. Para isso, envie uma solicitação POST à borda Apps assinados na Página e assine qualquer campo da Página.

Requisitos do ponto de extremidade
O token de acesso à Página do usuário do app
pages_manage_metadata
Sintaxe da solicitação
POST /{page-id}/subscribed_apps
  ?access_token={access-token}
  &subscribed_fields={fields}
Parâmetros da solicitação
Espaço reservado do valor	Descrição do valor

{page_id}

	

Identificação da Página conectada à conta do usuário do app.

{access_token}

	

O token de acesso à Página do usuário do app.

{fields}

	

Um campo de Página (por exemplo, feed).

O app não recebe notificações de alterações no campo a menos que você configure as assinaturas de Página no Painel de Apps e assine o campo.

Exemplo de solicitação
curl -i -X POST \
  "https://graph.facebook.com/v26.0/1755847768034402/subscribed_apps?subscribed_fields=feed&access_token=EAAFB..."
Exemplo de resposta
{
  "success": true
}
Usos comuns
Capturar Insights sobre um story

Se você assinar o campo story_insights, enviamos ao seu ponto de extremidade uma notificação de webhook contendo métricas de interação com o usuário sobre um story depois que ele expirar.

Exemplo de carga de Insights sobre um story
[
  {
    "entry": [
      {
        "changes": [
          {
            "field": "story_insights",
            "value": {
              "media_id": "18023345989012587",
              "exits": 1,
              "replies": 0,
              "reach": 17,
              "taps_forward": 12,
              "taps_back": 0,
              "impressions": 28
            }
          }
        ],
        "id": "17841405309211844",  // Instagram Business or Creator Account ID
        "time": 1547687043
      }
    ],
    "object": "instagram"
  }
]
Responder a @menções em comentários

Se você assinar o campo mentions, enviamos ao seu ponto de extremidade uma notificação de webhook sempre que um usuário do Instagram @mencionar uma conta comercial ou de criador de conteúdo em um comentário ou uma legenda.

Veja um exemplo de carga de notificação de webhook de comentário enviada a uma conta comercial do Instagram (17841405726653026):

Exemplo de carga de @menção em comentários
[
  {
    "entry": [
      {
        "changes": [
          {
            "field": "mentions",
            "value": {
              "comment_id": "17894227972186120",  // ID of the comment in which your app user's Instagram professional account was mentioned
              "media_id": "17918195224117851"     // ID of the media the Instagram user commented on
            }
          }
        ],
        "id": "17841405726653026",   // ID of your app user's Instagram professional account
        "time": 1520622968           // Time the notification was sent
      }
    ],
    "object": "instagram"
  }
]
Obter o conteúdo do comentário

Para obter o conteúdo do comentário, use a propriedade comment_id para consultar a borda GET /{ig-user-id}/mentioned_comment:

Exemplo de consulta
GET https://graph.facebook.com/17841405726653026 ?fields=mentioned_comment.comment_id(17894227972186120) 
Exemplo de resposta
{
  "mentioned_comment": {
    "timestamp": "2018-03-20T00:05:29+0000",
    "text": "@bluebottle challenge?",
    "id": "17894227972186120"
  },
  "id": "17841405726653026"
}
Analisar a carga e responder

Quando você receber a resposta, analise a carga para a propriedade text e decida se quer responder ao comentário. Ao responder, use o caption_id da carga da notificação de webhook e os valores da propriedade media_id para consultar o ponto de extremidade POST /{ig-user-id}/mentions:

Exemplo de consulta
curl -i -X POST \
  -d "comment_id=17894227972186120" \
  -d "media_id=17918195224117851" \
  -d "message=Challenge%20accepted!" \
  -d "access_token={access-token}" \
  "https://graph.facebook.com/17841405726653026/mentions"
Exemplo de resposta
{
  "id": "17911496353086895"
}
Responder a @menções em legendas

Se você assinar o campo mentions, enviamos uma notificação de webhook ao seu ponto de extremidade sempre que um usuário @mencionar uma conta comercial ou de criador de conteúdo do Instagram em um comentário ou uma legenda de um objeto de mídia que não pertence à empresa nem ao criador de conteúdo.

Veja um exemplo de carga de notificação de webhook de @menção em uma legenda enviada a uma conta comercial do Instagram (17841405726653026):

Exemplo notificação de webhook de @menção em legenda
[
  {
    "entry": [
      {
        "changes": [
          {
            "field": "mentions",
            "value": {
              "media_id": "17918195224117851"   // ID of the media where your app user's Instagram professional account was mentioned
            }
          }
        ],
        "id": "17841405726653026",   // ID of your app user's Instagram professional account
        "time": 1520622968           // The time Meta sent the notification
      }
    ],
    "object": "instagram"
  }
]
Obter o conteúdo da legenda

Para obter o conteúdo da legenda, use a propriedade media_id para consultar a borda GET /{ig-user-id}/mentioned_media:

Exemplo de consulta
GET https://graph.facebook.com/17841405726653026 ?fields=mentioned_media.media_id(17918195224117851){caption,media_type} 
Exemplo de resposta
{
  "mentioned_media": {
    "caption": "@bluebottle There can be only one!",
    "media_type": "IMAGE",
    "id": "17918195224117851"
  },
  "id": "17841405726653026"
}
Analisar a carga e responder

Quando você receber a resposta, analise a carga para a propriedade caption e decida se quer responder ao comentário. Ao responder, use a propriedade media_id da carga de notificação de webhook para consultar a borda POST /{ig-user-id}/mentions:

Exemplo de consulta
curl -i -X POST \
  -d "media_id=17918195224117851" \
  -d "message=MacLeod%20agrees!" \
  -d "access_token={access-token}" \
  "https://graph.facebook.com/17841405726653026/mentions"
Exemplo de resposta
{
  "id": "17911496353086895"
}
Nesta Página
Como configurar webhooks para o Instagram
Como receber notificações de webhook ao vivo
Limitações
Etapa 1: criar um ponto de extremidade
Campos do Instagram
Etapa 2: habilitar assinaturas de Página
Requisitos do ponto de extremidade
Usos comuns
Capturar Insights sobre um story
Responder a @menções em comentários
Obter o conteúdo do comentário
Analisar a carga e responder
Responder a @menções em legendas
Obter o conteúdo da legenda