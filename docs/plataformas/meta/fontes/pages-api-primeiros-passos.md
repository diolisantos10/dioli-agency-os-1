---
titulo: "Pages API — primeiros passos e tokens de Página"
url: https://developers.facebook.com/documentation/pages-api/getting-started
capturado_em: 2026-09-06
hash: d216fe23319f03b9
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Introdução à API de Páginas
Updated: 30 de jun de 2026
Copiar para LLM
Ver como Markdown
Este documento explica como chamar corretamente a API de Páginas para fazer uma publicação na sua Página.
Antes de começar
Você precisará do seguinte:
Uma Página do Facebook, que pode ser uma Página publicada ou não publicada na qual você é capaz de executar a tarefa CREATE_CONTENT.
Um token de acesso à Página
Estas permissões:
pages_manage_metadata
pages_manage_posts
pages_manage_read_engagement
pages_show_list
Melhores práticas
Ao testar uma chamada de API, você pode incluir o parâmetro access_token definido como seu token de acesso. No entanto, ao fazer chamadas seguras do seu app, use a classe de token de acesso.
Etapa 1. obter a identificação da Página
Para obter uma lista de IDs e tokens de acesso da Página do Facebook na qual você pode executar uma tarefa, envie uma solicitação GET para o ponto de extremidade /user_id/accounts, em que user_id é o ID de usuário.
Exemplo de solicitação
Texto formatado para facilitar a leitura. Substitua os valores em negrito e itálico (como page_id) pelos seus valores.
curl -i -X GET "https://graph.facebook.com/v26.0/user_id/accounts?access_token=user_access_token"
Caso a solicitação seja bem-sucedida, o app receberá a seguinte resposta JSON que inclui uma matriz de objetos. Cada objeto contém informações sobre uma Página específica, incluindo o nome, a identificação, um token de acesso de curta duração, tarefas que você pode realizar e muito mais:
{
  "data": [
    {
      "access_token": "page_access_token",
      "category": "Internet Company",
      "category_list": [
        {
          "id": "2256",
          "name": "Internet Company"
        }
      ],
      "name": "Name of this Page",
      "id": "page_id",
      "tasks": [
        "ANALYZE",
        "ADVERTISE",
        "MODERATE",
        "CREATE_CONTENT"
      ]
    },
...
Etapa 2. fazer uma publicação
Para fazer uma publicação, envie uma solicitação POST para o ponto de extremidade /page_id/feed, em que page_id é a identificação da Página para publicação, com o parâmetro message definido como o conteúdo da mensagem e o parâmetro access_token definido como o token de acesso à Página:
Exemplo de solicitação
Texto formatado para facilitar a leitura. Substitua os valores em negrito e itálico (como page_id) pelos seus valores.
curl -X POST "https://graph.facebook.com/v26.0/page_id/feed" \
     -H "Content-Type: application/json" \
     -d '{
           "message":"your_message_text",
           "access_token":"page_access_token",
         }'
A publicação ficará disponível imediatamente.
Caso a solicitação seja bem-sucedida, o app receberá a resposta JSON a seguir com a identificação da publicação:
{
  "id": "page_post_id"
}
Visite a Página do Facebook⁠ para ver o post.
Etapa 3. verificar a publicação
Para verificar se a publicação foi exibida na sua Página, envie uma solicitação GET para o ponto de extremidade /page_id/feed:
Exemplo de solicitação
Texto formatado para facilitar a leitura. Substitua os valores em negrito e itálico (como page_id) pelos seus valores.
curl -i -X GET "https://graph.facebook.com/v26.0/page_id/feed?access_token=page_access_token"
Em caso de sucesso, o app receberá a seguinte resposta JSON com uma matriz de objetos. Cada objeto inclui a identificação da publicação, o conteúdo da mensagem e o horário em que a publicação foi criada:
{
  "data": [
    {
      "created_time": "2020-03-25T17:33:34+0000",
      "message": "Hello World!",
      "id": "422575694827569_917077345377399"
    },
...
  ]
}
Usar o Graph Explorer
A ferramenta Graph Explorer é uma interface do usuário que permite testar as APIs do Facebook sem adicionar códigos ao app ou site. É possível selecionar permissões, obter tokens de acesso, testar os métodos GET, POST e DELETE, além de obter trechos de código das consultas para Android, iOS, PGP e cURL.
Para usar o Graph Explorer, é necessário um ID do app do Facebook.
Etapa 1. obter a identificação da Página
Selecione as permissões pages_manage_metadata, pages_manage_posts, pages_manage_read_engagement e pages_show_list disponíveis no menu suspenso Permissão. Depois, defina a solicitação GET para o ponto de extremidade /me/accounts na caixa de consulta e clique em Enviar.
Clique no ID da Página que aparece logo abaixo do nome dela de modo a mover o ID para a caixa de consulta.
Etapa 2. publicar como uma Página
Selecione o token de acesso à Página no menu suspenso Usuário ou Página. A seguir, configure o método como POST com uma solicitação ao ponto de extremidade /{page-id}/feed. Depois disso, defina a key dos parâmetros como message e o value do texto da publicação. Clique em Enviar.
Se o processo for bem-sucedido, o Graph Explorer exibirá a identificação da publicação da Página.
Visite a Página do Facebook⁠ para ver o post.
Etapa 3. verificar a publicação
Envie uma solicitação GET ao ponto de extremidade /page-id/feed.
Se ela for bem-sucedida, o Graph Explorer exibirá o horário de criação, o texto e a identificação da publicação.
Próximas etapas
Descubra como obter e atualizar informações sobre a Página do Facebook, como detalhes da Página, tokens de acesso, usuários bloqueados e recomendações de usuários, usando o guia Gerenciar uma Página do Facebook.
Saiba como publicar links, fotos e vídeos na sua Página.
Veja também
Guias da Graph API
Tokens de acesso
Guia do usuário da Graph API
Guia do usuário do Graph Explorer
Visão geral da API de Páginas – Tarefas
Referências
Referência sobre Páginas
Referência sobre feed de Páginas
Referência para post da Página
Referência de permissões
Referência sobre contas do usuário
Você achou esta página útil?