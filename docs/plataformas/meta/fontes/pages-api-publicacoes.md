---
titulo: "Pages API — publicações (criar, ler, apagar posts)"
url: https://developers.facebook.com/documentation/pages-api/posts
capturado_em: 2026-09-10
hash: 126814cebd4d6729
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Publicações
Updated: 17 de abr de 2026
Copiar para LLM
Ver como Markdown
Este guia explica como criar, postar e atualizar um post, bem como responder a um post na sua Página do Facebook e excluir um post usando a API de Páginas da Meta.
Antes de começar
Para usar este guia, pressupomos que você já tenha lido a Visão geral
Para uma pessoa que pode realizar tarefas na Página, você terá de implementar o Login do Facebook para solicitar as seguintes permissões e receber um token de acesso à Página:
pages_manage_engagement
pages_manage_posts
pages_read_engagement
pages_read_user_engagement
A permissão publish_video (se estiver publicando um vídeo na Página)
O usuário do app deve poder realizar as tarefas CREATE_CONTENT, MANAGE e MODERATE na Página nas solicitações de API.
Se os usuários não forem proprietários nem gerentes da Página nas solicitações de API, seu app precisará de um token de acesso do usuário e destes recursos:
Acesso ao Conteúdo Público da Página
Boas práticas
Ao testar uma chamada de API, você pode incluir o parâmetro access_token definido como seu token de acesso. No entanto, ao fazer chamadas seguras do seu app, use a classe de token de acesso.
Fazer posts
Para fazer um post em uma Página, envie uma solicitação POST ao ponto de extremidade /page_id/feed, em que page_id é a identificação da sua Página, com os seguintes parâmetros:
message definido como o texto do post.
link definido como o URL caso você queira postar um link.
published definido como true para fazer o post imediatamente (padrão) ou false para postar mais tarde.
Se for definido como false, inclua scheduled_publish_time com a data em um dos seguintes formatos:
Um registro de data e hora Unix em segundos no formato de número inteiro (por exemplo, 1530432000).
Uma string de registro de data e hora no formato ISO 8061⁠ (por exemplo, 2018-09-01T10:15:30+01:00)
Qualquer string analisável por strtotime()⁠ do PHP (por exemplo, +2 weeks, tomorrow)
Observações sobre os posts programados
A data de publicação precisa ser entre 10 minutos e 30 dias do momento da solicitação de API.
Se você estiver usando como base as strings de data relativa de strtotime(), será possível fazer a leitura após gravação de scheduled_publish_time do post criado para garantir que a data corresponda ao esperado.
Exemplo de solicitação
Texto formatado para facilitar a leitura. Substitua os valores em negrito e itálico (como page_id) pelos seus valores.
curl -X POST "https://graph.facebook.com/v26.0/page_id/feed" \
     -H "Content-Type: application/json" \
     -d '{
           "message":"your_message_text",
           "link":"your_url",
           "published":"false",
           "scheduled_publish_time":"unix_time_stamp_of_a_future_date",
         }'
Caso a solicitação seja bem-sucedida, o app receberá a resposta JSON a seguir com a identificação do post:
{
  "id": "page_post_id"
}
Adicionar direcionamento de público
Para limitar quem pode ver um post da Página, você pode adicionar o objeto . geo_locations ou o parâmetro feed_targeting. geo_locations à sua solicitação POST.
-d '{
      ...
      "targeting": {
        "geo_locations": {
          "countries": [
            "CA"
          ],
          "cities": [
            {
              "key": "296875",
              "name": "Toronto"
            }
          ]
        }
      },
      ...
    }'

Solução de problemas
Em alguns casos, usar um país e uma região dele causará o erro: "Há sobreposição de algumas das suas localizações. Experimente remover uma localização." Quando isso acontecer, faça o direcionamento para a região ou o país, dependendo da cobertura desejada por você.
Fazer posts com mídia
Você pode publicar fotos e vídeos na Página.
Publicar uma foto
Para postar uma foto na Página, envie uma solicitação POST ao ponto de extremidade /page_id/photos, em que page_id é a identificação da sua Página, com o parâmetro url definido como a foto do post.
Exemplo de solicitação
Texto formatado para facilitar a leitura. Substitua os valores em negrito e itálico (como page_id) pelos seus valores.
curl -X POST "https://graph.facebook.com/v26.0/page_id/photos" \
     -H "Content-Type: application/json" \
     -d '{
           "url":"path_to_photo",
Caso a solicitação seja bem-sucedida, o app receberá a resposta JSON a seguir com a identificação da foto e do post.
{
  "id":"photo_id",
  "post_id":"page_post_id"
}
Publicar um vídeo
Acesse a documentação da API de Vídeo para saber como postar um vídeo na sua Página.
Obter posts
Para obter uma lista de posts da Página, envie uma solicitação GET ao ponto de extremidade /page_id/feed.
Exemplo de solicitação
Texto formatado para facilitar a leitura. Substitua os valores em negrito e itálico (como page_id) pelos seus valores.
curl -i -X GET "https://graph.facebook.com/v26.0/page_id/feed"
Caso a solicitação seja bem-sucedida, o app receberá a seguinte resposta JSON com uma matriz de objetos, incluindo a identificação, o horário de criação e o conteúdo de cada post da sua Página:
{
  "data": [
    {
      "created_time": "2019-01-02T18:31:28+0000",
      "message": "This is my test post on my Page.",
      "id": "page_post_id"
    }
  ],
...
}

Limitações
Vídeos ao vivo: caso um post da Página contenha um vídeo que expirou (como uma transmissão ao vivo), será possível obter alguns campos de post, mas não aqueles relacionados ao vídeo. O vídeo tem as próprias regras de privacidade. Para visualizar as informações de um vídeo expirado, você precisa ser o administrador da Página.
CTA da mensagem: os tokens de acesso podem ser usados para solicitar posts da Página de compartilhamento público, desde que seu app tenha sido aprovado para o recurso Acesso ao conteúdo público da Página. Entretanto, os posts com mensagem de CTA não podem ser acessados por meio do token de acesso de outra Página, já que as Páginas não podem enviar mensagens umas às outras.
URLs de posts da Página
O URL, ou link permanente, para um post da Página é https://www.facebook.com/page_post_id.
Atualizar um post
Para atualizar um post da Página, envie uma solicitação POST ao ponto de extremidade /page_post_id, com os parâmetros que você quer atualizar definidos como o novo conteúdo.
Exemplo de solicitação
Texto formatado para facilitar a leitura. Substitua os valores em negrito e itálico (como page_post_id) pelos seus valores.
curl -X POST "https://graph.facebook.com/v26.0/page_post_id" \
     -H "Content-Type: application/json" \
     -d '{
           "message":"I am updating my Page post",
         }'
Se o processo for bem-sucedido, o app receberá a resposta JSON a seguir, com success definido como verdadeiro:
{
  "success": true
}

Limitações
Um app só poderá atualizar o post de uma Página se ele tiver sido feito por meio dele.
Excluir um post
Para excluir um post da Página, envie uma solicitação DELETE ao ponto de extremidade /page_post_id, em que page_post_id é a identificação do post que você quer excluir.
Exemplo de solicitação
Texto formatado para facilitar a leitura. Substitua os valores em negrito e itálico (como page_post_id) pelos seus valores.
curl -i -X DELETE "https://graph.facebook.com/v26.0/page_post_id"
Se o processo for bem-sucedido, o app receberá a resposta JSON a seguir, com success definido como true:
{
  "success": true
}

Próximas etapas
Saiba como comentar em posts da Página e @mencionar uma pessoa ou Página específica que postou ou comentou na sua Página.
Veja também
Guias da API de Vídeo
Guia sobre carregamento de vídeos
Guia sobre a API de Vídeo
Referências
Referência da Página
Referência sobre feed de Páginas
Referência sobre post da Página
Referência de permissões
Referência de fotos
Tarefas da Página
Referência de vídeos
Você achou esta página útil?