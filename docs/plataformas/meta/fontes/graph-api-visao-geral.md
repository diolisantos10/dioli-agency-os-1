---
titulo: "Graph API — visão geral (nós, arestas, campos)"
url: https://developers.facebook.com/docs/graph-api/overview
capturado_em: 2026-09-06
hash: d75ff9afa090eb11
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Entrada da pesquisa
​
Graph API
Visão geral
SDKs do Facebook
Resultados paginados
Limites de volume
Controle de versões
Introdução
Solicitações em lote
Solicitações de depuração
Solução de erros
Field Expansion
Secure Requests
Registro de alterações
Reference
Visão geral da Graph API

A Graph API é a principal forma de inserir e retirar dados da plataforma do Facebook. Trata-se de uma API baseada em HTTP que os apps podem usar para consultar dados programaticamente, publicar novas histórias, gerenciar anúncios, carregar fotos e realizar uma ampla variedade de tarefas.

A Graph API tem esse nome com base na ideia de um "gráfico social" — uma representação das informações no Facebook. O gráfico social é composto por nós, bordas e campos. Em geral, os nós são usados para a obtenção de dados sobre um objeto específico, as bordas são usadas para obter coleções de objetos sobre um objeto único e os campos para obter dados sobre um objeto único ou sobre cada objeto de uma coleção. Em nossa documentação, "ponto de extremidade" pode se referir a um nó ou a uma borda. Por exemplo: "Envie uma solicitação GET ao ponto de extremidade do usuário".

HTTP

Todas as transferências de dados estão em conformidade com o HTTP/1.1, e todos os pontos de extremidade exigem HTTPS. Como a Graph API se baseia em HTTP, ela funciona com qualquer linguagem que tenha uma biblioteca desse tipo, como cURL e urllib. Isso quer dizer que você pode usar a Graph API diretamente no seu navegador. Por exemplo, solicitar esta URL no seu navegador...

https://graph.facebook.com/facebook/picture?redirect=false

... é o mesmo que realizar esta solicitação cURL:

curl -i -X GET "https://graph.facebook.com/facebook/picture?redirect=false"

Também habilitamos a diretiva HSTS includeSubdomains no facebook.com, mas isso não deve afetar negativamente as suas chamadas da Graph API.

URL de hospedagem

Todas as solicitações são enviadas à URL de hospedagem graph.facebook.com.

Tokens de acesso

Os tokens de acesso permitem que o seu app acesse a Graph API. Todos os pontos de extremidade da Graph API exigem algum tipo de token de acesso. Por isso, sempre que você acessar um ponto de extremidade, a solicitação deverá conter essa informação. Normalmente, eles desempenham duas funções:

Permitem que o seu app acesse as informações de um usuário sem exigir a senha dele. Por exemplo, o seu app precisa do email do usuário para executar uma função. Se permitir que o seu app recupere o endereço de email do Facebook, o usuário não precisará inserir a própria senha para que o app obtenha o email.
Permitem que identifiquemos o seu app, o usuário e os dados que podem ser acessados.

Visite a documentação do token de acesso para saber mais.

Nós

Um nó é um objeto individual com um ID único. Por exemplo, existem vários objetos de nós de usuário, cada um com um ID único representando uma pessoa no Facebook. Páginas, Publicações, Fotos e Comentários são apenas alguns dos nós do gráfico social do Facebook.

O exemplo cURL a seguir representa uma chamada ao nó do usuário.

curl -i -X GET \
  "https://graph.facebook.com/USER-ID?access_token=ACCESS-TOKEN"

Por padrão, essa solicitação retorna os seguintes dados formatados usando JSON:

{
  "name": "Your Name",
  "id": "YOUR-USER-ID"
}
Metadados de nó

O parâmetro metadata está obsoleto na Graph API v25.0 e não retorna mais metadados sobre o nó em questão. Como alternativa, use o Explorador da Graph API ou as referências de API. O parâmetro será descontinuado para todas as versões em 19 de maio de 2026.

É possível obter uma lista de todos os campos de um objeto de nó (como usuário, página ou foto), incluindo o nome, a descrição e o tipo de dado do campo. Envie uma solicitação GET para um ID de objeto e inclua o parâmetro metadata=1:

curl -i -X GET \
  "https://graph.facebook.com/USER-ID?
    metadata=1&access_token=ACCESS-TOKEN"

A resposta JSON incluirá a propriedade metadata, que lista todos os campos compatíveis para o nó específico:

{
  "name": "Jane Smith",
  "metadata": {
    "fields": [
      {
        "name": "id",
        "description": "The app user's App-Scoped User ID. This ID is unique to the app and cannot be used by other apps.",
        "type": "numeric string"
      },
      {
        "name": "age_range",
        "description": "The age segment for this person expressed as a minimum and maximum age. For example, more than 18, less than 21.",
        "type": "agerange"
      },
      {
        "name": "birthday",
        "description": "The person's birthday.  This is a fixed format string, like `MM/DD/YYYY`.  However, people can control who can see the year they were born separately from the month and day so this string can be only the year (YYYY) or the month + day (MM/DD)",
        "type": "string"
      },
...
/me

O nó /me é um ponto de extremidade especial que se traduz no ID do objeto da pessoa ou Página cujo token de acesso está sendo usado para fazer as chamadas à API. Se você tiver um token de acesso do usuário, poderá recuperar o nome e a ID desse usuário ao usar o seguinte:

curl -i -X GET \
  "https://graph.facebook.com/me?access_token=ACCESS-TOKEN"
Bordas

Uma borda é uma conexão entre dois nós. Por exemplo, um nó de usuário pode estar conectado a fotos, e um nó de foto pode estar conectado a comentários. O exemplo cURL a seguir retornará uma lista das fotos publicadas por uma pessoa no Facebook.

curl -i -X GET \
  "https://graph.facebook.com/USER-ID/photos?access_token=ACCESS-TOKEN"

Cada ID retornada representa um nó de foto e quando ela foi carregada no Facebook.

    {
  "data": [
    {
      "created_time": "2017-06-06T18:04:10+0000",
      "id": "1353272134728652"
    },
    {
      "created_time": "2017-06-06T18:01:13+0000",
      "id": "1353269908062208"
    }
  ],
}
Campos

Os campos são propriedades dos nós. Ao consultar um nó ou uma borda, um conjunto de campos será retornado por padrão, conforme os exemplos acima. No entanto, é possível especificar que campos você deseja retornar usando o parâmetro fields e listando cada campo. Isso substitui os padrões e retorna somente os campos especificados, além do ID do objeto, que sempre é retornado.

A solicitação cURL a seguir inclui o parâmetro fields e o nome, o email e a foto de perfil do usuário.

curl -i -X GET \
  "https://graph.facebook.com/USER-ID?fields=id,name,email,picture&access_token=ACCESS-TOKEN"
Dados retornados
{
  "id": "USER-ID",
  "name": "EXAMPLE NAME",
  "email": "EXAMPLE@EMAIL.COM",
  "picture": {
    "data": {
      "height": 50,
      "is_silhouette": false,
      "url": "URL-FOR-USER-PROFILE-PICTURE",
      "width": 50
    }
  }
}
Parâmetros complexos

A maioria dos tipos de parâmetro é primitivo direto, como bool, string e int, mas também há os tipos list e object, que podem ser especificados na solicitação.

O tipo list é especificado em sintaxe JSON, por exemplo: ["firstitem", "seconditem", "thirditem"]

O tipo object também é especificado em sintaxe JSON, por exemplo: {"firstkey": "firstvalue", "secondKey": 123}

Como publicar, atualizar e excluir

Acesse o guia de compartilhamento do Facebook para saber como publicar no Facebook de um usuário ou consulte a documentação da API de Páginas para publicar no feed do Facebook de uma página.

Alguns nós permitem que você atualize campos com operações POST. Por exemplo, você pode atualizar o campo email da seguinte maneira:

curl -i -X POST \
  "https://graph.facebook.com/USER-ID?email=YOURNEW@EMAILADDRESS.COM&access_token=ACCESS-TOKEN"
Read-After-Write

Para criar e atualizar pontos de extremidade, a Graph API pode ler imediatamente um objeto publicado ou atualizado com sucesso e retornar campos compatíveis pelo ponto de extremidade de leitura correspondente.

Por padrão, uma ID do objeto criado ou atualizado será retornada. Para incluir mais informações na resposta, inclua o parâmetro fields na sua solicitação e liste os campos que deseja retornar. Por exemplo, para publicar a mensagem “Olá” no feed de uma página, você pode fazer a seguinte solicitação:

curl -i - X POST "https://graph.facebook.com/PAGE-ID/feed?message=Hello&
  fields=created_time,from,id,message&access_token=ACCESS-TOKEN"
O exemplo de código acima foi formatado para facilitar a leitura.

Isso retornaria os campos especificados como uma resposta formatada em JSON, por exemplo:

{
  "created_time": "2017-04-06T22:04:21+0000",
  "from": {
    "name": "My Facebook Page",
    "id": "PAGE-ID"
  },
  "id": "POST_ID",
  "message": "Hello",
}

Consulte a documentação de referência de cada ponto de extremidade para ver se ele é compatível com read-after-write e quais campos estão disponíveis.

Erros

Se houver falha na leitura por qualquer motivo (por exemplo, caso um campo inexistente seja solicitado), a Graph API enviará uma resposta-padrão de erro. Consulte o nosso guia Como lidar com erros para saber mais.

Normalmente, é possível excluir um nó (por exemplo, de publicação ou de foto) executando uma operação DELETE na identificação do objeto:

curl -i -X DELETE \
  "https://graph.facebook.com/PHOTO-ID?access_token=ACCESSS-TOKEN"

Normalmente, só é possível excluir nós criados por você, mas verifique o guia de referência de cada nó para ver os requisitos das operações de exclusão.

Webhooks

Ao assinar webhooks, você recebe notificações sobre alterações ou interações com os nós. Consulte Webhooks da Meta.

Versões

A Graph API tem diversas versões com lançamentos trimestrais. Você pode especificar a versão nas chamadas. Para isso, inclua "v" e o número da versão no início do caminho da solicitação. Por exemplo, confira uma chamada à versão 4.0:

curl -i -X GET \
  "https://graph.facebook.com/v4.0/USER-ID/photos
    ?access_token=ACCESS-TOKEN"

Se você não informar um número de versão, usaremos como padrão a versão mais antiga disponível, portanto, é recomendável incluir o número da versão nas suas solicitações.

Leia mais sobre as versões no guia de controle de versão e saiba mais sobre todas as versões disponíveis no registro de alterações da Graph API.

APIs, SDKs e plataformas do Facebook

Conecte interfaces e desenvolva em várias plataformas com as APIs, os SDKs e as plataformas do Facebook.

Próximas etapas

Primeiros passos com a Graph API — vamos entender o gráfico social do Facebook usando a ferramenta "Explorador da Graph API" e executar algumas solicitações de dados.

Nesta Página
Visão geral da Graph API
HTTP
URL de hospedagem
Tokens de acesso
Nós
Metadados de nó
/me
Bordas
Campos
Parâmetros complexos
Como publicar, atualizar e excluir
Read-After-Write
Webhooks
Versões
APIs, SDKs e plataformas do Facebook
Próximas etapas