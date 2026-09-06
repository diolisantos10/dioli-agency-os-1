---
titulo: "Business Profile APIs — avaliações e respostas (review data)"
url: https://developers.google.com/my-business/content/review-data?hl=pt-br
capturado_em: 2026-09-06
hash: 58ba6834238f9f90
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Trabalhar com dados de avaliações
Nesta página
Antes de começar
Exibir todas as avaliações
Ver uma avaliação específica
Ver avaliações de vários locais
Responder a uma avaliação
Excluir uma resposta de uma avaliação

Neste tutorial, explicamos como mostrar, retornar, responder e excluir uma avaliação. Com a API Google My Business, você pode usar os dados de avaliação para as seguintes operações:

Exibir todas as avaliações
Ver uma avaliação específica
Ver avaliações de vários locais
Responder a uma avaliação
Excluir uma resposta de uma avaliação
Antes de começar

Antes de usar a API Google My Business, você precisa registrar seu aplicativo e receber as credenciais do OAuth 2.0. Para saber como começar a usar a API GMB, consulte Configuração básica.

Exibir todas as avaliações

Exiba todas as avaliações de um local para gerenciá-las em massa. Use a API accounts.locations.reviews.list para retornar todas as avaliações associadas a um local.

Para isso, utilize o código abaixo:

HTTP
Java
GET
https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews

Ver uma avaliação específica

Retorne uma avaliação específica por nome. Use a API accounts.locations.reviews.get para ver uma avaliação específica associada a um local.

Para isso, utilize o código abaixo:

HTTP
Java
GET
https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews/{reviewId}

Ver avaliações de vários locais

Veja as avaliações de vários locais com uma única solicitação usando a API accounts.locations.batchGetReview.

Para isso, utilize o código abaixo:

HTTP

POST
https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations:batchGetReviews

{
  "locationNames": [
    string
  ],
  "pageSize": number,
  "pageToken": string,
  "orderBy": string,
  "ignoreRatingOnlyReviews": boolean
}

Responder a uma avaliação
Importante: para usar essa funcionalidade, você precisa verificar se o administrador da organização do G Suite ativou a Pesquisa Google, o Perfil da empresa e/ou o Google Maps como serviços para sua conta. Se ocorrer algum problema, fale com o administrador. Para saber mais, consulte Quem é meu administrador?, Controlar quem pode acessar os Serviços do Google e do G Suite e aplicar políticas a usuários diferentes.

Responda a uma avaliação específica associada a um local ou crie uma nova resposta usando a API accounts.locations.reviews.updateReply.

Para isso, utilize o código abaixo:

HTTP
Java
PUT
https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews/{reviewId}/reply

{
  comment: "Thank you for visiting our business!"
}

Excluir uma resposta de uma avaliação

Exclua uma resposta de uma avaliação específica associada a um local usando a API accounts.locations.reviews.deleteReply.

Para isso, utilize o código abaixo:

HTTP
Java
DELETE
https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews/{reviewId}/reply

Isso foi útil?

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2025-08-29 UTC.