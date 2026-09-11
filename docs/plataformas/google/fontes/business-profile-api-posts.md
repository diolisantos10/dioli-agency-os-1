---
titulo: "Business Profile APIs — posts locais (localPosts)"
url: https://developers.google.com/my-business/content/posts-data?hl=pt-br
capturado_em: 2026-09-11
hash: 9e7d4c90d3875fec
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Criar postagens no Google
Nesta página
Antes de começar
Postagens de eventos
Postagens com call-to-action
Tipos de ação
Postagens de ofertas
Editar postagens
Excluir postagens

Com a API Google My Business, você pode criar postagens em várias categorias na Pesquisa Google, como notícias, eventos e ofertas.

Veja o seguinte neste tutorial:

Como criar postagens de eventos
Como criar postagens com calls-to-action
Como criar postagens de ofertas
Como editar postagens
Excluir postagens
Observação: no momento, não é possível criar postagens de produtos usando a API Google My Business.
Antes de começar

Antes de usar a API Google My Business, você precisa registrar seu aplicativo e receber as credenciais do OAuth 2.0.

Para saber como começar a usar a API Google My Business, consulte Configuração básica.

Observação: pequenas empresas e grandes redes podem criar postagens.
Postagens de eventos

Use as postagens para informar seus clientes sobre o próximo evento na sua empresa. Inclua datas e horários de início e término em destaque.

Para fazer uma postagem em uma conta associada a um usuário, utilize a API accounts.locations.localPosts.

Se quiser criar uma postagem para um usuário autenticado, use:

HTTP
$ POST
https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/localPosts
{
  "languageCode": "en-US",
  "summary": "Come in for our spooky Halloween event!",
  "event": {
    "title": "Halloween Spook-tacular!",
    "schedule": {
        "startDate": {
            "year": 2017,
            "month": 10,
            "day": 31,
          },
          "startTime": {
              "hours": 9,
              "minutes": 0,
              "seconds": 0,
              "nanos": 0,
          },
          "endDate": {
            "year": 2017,
            "month": 10,
            "day": 31,
          },
          "endTime": {
              "hours": 17,
              "minutes": 0,
              "seconds": 0,
              "nanos": 0,
          },
    }
  },
  "media": [
    {
      "mediaFormat": "PHOTO",
      "sourceUrl": "https://www.google.com/real-image.jpg",
    }
  ],
  "topicType": "EVENT"
}
Postagens com call-to-action

Esse tipo de postagem precisa incluir um botão. O texto dele é determinado no campo actionType da postagem. Um link para um URL fornecido pelo usuário é adicionado ao botão.

Para criar uma postagem com um botão de call-to-action, use:

HTTP
$ POST
https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/localPosts
{
  "languageCode": "en-US",
  "summary": "Order your Thanksgiving turkeys now!!",
  "callToAction": {
    "actionType": "ORDER",
    "url": "http://google.com/order_turkeys_here",
  },
  "media": [
    {
      "mediaFormat": "PHOTO",
      "sourceUrl": "https://www.google.com/real-turkey-photo.jpg",
    }
  ],
  "topicType": "OFFER"
}
Tipos de ação

As postagens com call-to-action podem ter diferentes tipos de ação que determinam o tipo de conteúdo.

Estes são os compatíveis:

Tipos de ação
BOOK	Uma postagem que incentiva o usuário a agendar um compromisso, reservar uma mesa ou algo do tipo
ORDER	Uma postagem que incentiva o usuário a fazer algo
SHOP	Uma postagem que incentiva o usuário a ver um catálogo de produtos
LEARN_MORE	Uma postagem que incentiva o usuário a ver detalhes adicionais em um site
SIGN_UP	Uma postagem que incentiva o usuário a se registrar, fazer uma inscrição ou participar de algo
CALL	Uma postagem que incentiva o usuário a ligar para uma empresa
Postagens de ofertas

Para criar uma postagem desse tipo, use:

HTTP
$ POST
https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/localPosts
{
  "languageCode": "en-US",
  "summary": "Buy one Google jetpack, get a second one free!!",
  "offer": {
       "couponCode": "BOGO-JET-CODE",
       "redeemOnlineUrl": "https://www.google.com/redeem",
       "termsConditions": "Offer only valid if you can prove you are a time traveler"
  },
  "media": [
    {
      "mediaFormat": "PHOTO",
      "sourceUrl": "https://www.google.com/real-jetpack-photo.jpg",
    }
  ],
  "topicType": "OFFER"
}
Editar postagens

Depois que uma postagem é criada, você pode editá-la com uma solicitação PATCH.

Para fazer isso, use:

HTTP
$ PATCH
https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/localPosts/{localPostId}?updateMask=summary
{
  "summary": "Order your Christmas turkeys now!!"
}
Excluir postagens

Depois que uma postagem é criada, você pode excluí-la com uma solicitação DELETE.

Para fazer isso, use:

HTTP
$ DELETE
https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/localPosts/{localPostId}
Isso foi útil?

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-02-24 UTC.