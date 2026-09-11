---
titulo: "Instagram — IG User Insights (métricas de conta)"
url: https://developers.facebook.com/documentation/instagram-platform/api-reference/instagram-user/insights
capturado_em: 2026-09-11
hash: e9f2aad836474942
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Insights sobre a conta no Instagram
Updated: 16 de jun de 2026
Copiar para LLM
Ver como Markdown
Representa as métricas de interação social na conta comercial ou de criador de conteúdo do usuário do seu app no Instagram.
Neste guia, os termos usuário do Instagram e conta do Instagram são usados como sinônimos.
Disponível para a API do Instagram com Login do Facebook e para a API do Instagram com Login do Instagram.
As seguintes métricas foram descontinuadas na versão 22.0 e ficarão obsoletas em todas as versões a partir do dia 21 de abril de 2025:
impressions
Apresentamos a nova métrica views com o tipo de métrica total_value e com detalhamentos para follower_type e media_product_type.
Acesse o Registro de alterações da plataforma do Instagram para obter mais informações.
Criação
Esta operação não é compatível.
Leitura
GET /<YOUR_APP_USERS_INSTAGRAM_ACCOUNT_ID>/insights
Retorna insights sobre a conta comercial ou de criador de conteúdo do usuário do app no Instagram.
Requisitos
	API do Instagram com o Login do Instagram	API do Instagram com o Login do Facebook

Tokens de acesso
	
Token de acesso do usuário do Instagram
	
Token de acesso do usuário do Facebook

URL de hospedagem
	
graph.instagram.com
	
graph.facebook.com

Tipo de login
	
Login de Empresa no Instagram
	
Login do Facebook para Empresas

Permissões
	
instagram_business_basic
instagram_business_manage_insights
	
instagram_basic
instagram_manage_insights
pages_read_engagement
Caso uma função tenha sido concedida ao usuário do app por meio do Gerenciador de Negócios na Página Page conectada à conta profissional do Instagram do usuário, seu app também precisará de uma destas permissões:
ads_management
ads_read
Limitações
As métricas follower_count e online_followers não estão disponíveis em contas empresariais ou de criadores de conteúdo do Instagram com menos de 100 seguidores.
Os dados de insights da métrica online_followers estão disponíveis apenas para os últimos 30 dias.
Se os dados de insights solicitados não existirem ou estiverem indisponíveis, a API retornará um conjunto vazio para as métricas individuais, em vez de 0.
As métricas demográficas retornam apenas os 45 melhores desempenhos.
Somente os visualizadores sobre quem tivermos dados demográficos serão usados nos cálculos de métricas desse tipo.
A soma dos valores de métricas demográficas poderá resultar em um valor menor que a contagem de seguidores (confira o item anterior).
Pode haver até 48 horas de atraso nos dados usados para calcular métricas.
Sintaxe da solicitação
GET https://<HOST_URL>/<API_VERSION>/<APP_USERS_INSTAGRAM_ACCOUNT_ID>/insights
  ?metric=<COMMA_SEPARATED_LIST_OF_METRICS>
  &period=<PERIOD>
  &timeframe=<TIMEFRAME>
  &metric_type=<METRIC_TYPE>
  &breakdown=<BREAKDOWN_METRIC>
  &since=<START_TIME>
  &until=<STOP_TIME>
  &access_token=<INSTAGRAM_USER_ACCESS_TOKEN>
Parâmetros do caminho do host
GET https://<HOST_URL>/<API_VERSION>/<APP_USERS_INSTAGRAM_ACCOUNT_ID>/insights
Espaço reservado	Valor

<API_VERSION>
Versão mais recente: v26.0
	
A versão da API que seu app está utilizando ao fazer chamadas para os servidores da Meta. Saiba mais sobre o controle de versões da API.

<APP_USERS_INSTAGRAM_ACCOUNT_ID>
	
Obrigatório. A identificação da conta profissional do usuário do seu app no Instagram.

<HOST_URL>
	
Obrigatório. A identificação da conta profissional do usuário do seu app no Instagram.
Parâmetros
Chave	Valor

access_token
	
Obrigatório. O token de acesso do usuário do app no Facebook ou no Instagram.

breakdown
	
Descreve como desmembrar o conjunto de resultados em subconjuntos.
contact_button_type – Divide os resultados por componente de perfil no app nativo.
follow_type – Detalha os resultados por seguidores ou não seguidores.
media_product_type – Detalha os resultados por superfície em que os usuários do Instagram veem ou interagem com a mídia do usuário do seu app.

metric
	
Obrigatório. Uma lista separada por vírgula das métricas que devem ser retornadas.
<COMMA_SEPARATED_LIST_OF_METRICS>

metric_type
	
Designa se você quer as respostas agregadas por período ou como total simples. Consulte Tipo de métrica. <METRIC_TYPE>

period
	
Obrigatório. Agregação de Período. <PERIOD>

since
	
Registro de data e hora UNIX indicando o início do intervalo. Consulte Intervalo. <START_TIME>

timeframe
	
Obrigatório para métricas relacionadas a dados demográficos. Designa o ponto mais antigo onde verificar os dados. Consulte Intervalo de tempo. <TIMEFRAME>

until
	
Registro de data e hora UNIX indicando o fim do intervalo. Consulte Intervalo. <STOP_TIME>
Detalhamento
Se você solicitar metric_type=total_value, também será possível especificar um ou mais detalhamentos, e os resultados serão divididos em conjuntos menores com base no detalhamento especificado. Os valores podem ser os seguintes:
contact_button_type – Detalha os resultados por componente de interface do usuário do perfil em que os visualizadores tocaram ou clicaram. Estes são os possíveis valores de resposta:
BOOK_NOW
CALL
DIRECTION
EMAIL
INSTANT_EXPERIENCE
TEXT
UNDEFINED
follow_type – Detalha os resultados por seguidores ou não seguidores. Estes são os possíveis valores de resposta:
FOLLOWER
NON_FOLLOWER
UNKNOWN
media_product_type – Detalha os resultados pela superfície em que os visualizadores viram ou interagiram com a mídia do usuário do app. Estes são os possíveis valores de resposta:
AD
STORY
REEL (igual a REELS)
CAROUSEL_CONTAINER e POST como subtipos de FEED
Consulte a tabela Métricas para determinar as métricas que são compatíveis com um detalhamento. Se você solicitar uma métrica que não seja compatível com um detalhamento, a API retornará um erro ("An unknown error has occurred."). Por isso, tenha cuidado ao solicitar várias métricas em uma única consulta.
Se você solicitar metric_type=time_series, os detalhamentos não serão incluídos na resposta.
Tipo de métrica
Você pode escolher como deseja que os resultados sejam agregados, por período ou total simples (com detalhamentos, caso solicitado). Os valores podem ser os seguintes:
time_series – Instrui a API a agregar os resultados por período. Consulte Período.
total_value – Instrui a API a retornar os resultados como um total simples. Se houver detalhamentos incluídos na solicitação, o conjunto de resultados será dividido por detalhamentos específicos. Consulte Detalhamento.
Período
Informa à API o intervalo de tempo que deve ser usado ao agregar resultados. Compatível somente com métricas relacionadas à interação.
Intervalo de tempo
Informa à API o ponto mais antigo onde verificar dados ao solicitar métricas relacionadas a dados demográficos. Esse valor substitui os parâmetros since e until.
Intervalo
Atribui registros de data e hora do UNIX aos parâmetros since e until para definir um intervalo. A API incluirá apenas dados criados nesse intervalo (inclusive). Se você não incluir esses parâmetros, a API fará a verificação das últimas 24 horas.
Para métricas relacionadas a dados demográficos, o parâmetro timeframe substitui esses valores. Consulte Intervalo de tempo.
Métricas
Métricas de interação

Métrica	Período	Intervalo de tempo	Detalhamento	Tipo de métrica	Descrição

accounts_engaged
	
day
	
N/A
	
N/A
	
total_value
	
O número de contas que interagiram com seu conteúdo, incluindo em anúncios. O conteúdo inclui posts, stories, reels, vídeos e vídeos ao vivo. As interações podem incluir ações como curtidas, salvamentos, comentários, compartilhamentos ou respostas.
Essa métrica é estimada.

comments
	
day
	
N/A
	
media_product_type
	
total_value
	
O número de comentários nos seus posts, reels, vídeos e vídeos ao vivo.
Essa métrica está em desenvolvimento⁠.

engaged_audience_demographics
	
lifetime
	
Um dos itens a seguir:
last_14_days, last_30_days, last_90_days, prev_month, this_month, this_week
	
age,
city,
country,
gender
	
total_value
	
As características demográficas do público engajado, incluindo distribuição por país, cidade e gênero. this_month retorna dados dos últimos 30 dias, e this_week retorna dados dos últimos 7 dias.
Não é compatível com since nem until. Para obter mais informações, consulte Intervalo.
Não retornado se o usuário do Instagram tiver menos de 100 engajamentos durante o período.

Observação: a partir da versão 20.0, os períodos last_14_days, last_30_days, last_90_days e prev_month não serão mais aceitos. Consulte o registro de alterações para saber mais.

follows_and_unfollows
	
day
	
N/A
	
follow_type
	
total_value
	
O número de contas que seguiram você e o número de contas que deixaram de seguir você ou saíram do Instagram no período selecionado.
Esse valor não é retornado se o usuário do Instagram tiver menos de 100 seguidores.

follower_demographics
	
lifetime
	
Um dos itens a seguir:
last_14_days, last_30_days, last_90_days, prev_month, this_month, this_week
	
age,
city,
country,
gender
	
total_value
	
As características demográficas dos seguidores, incluindo distribuição por país, cidade e gênero.
Não é compatível com since nem until. Para obter mais informações, consulte Intervalo.
Esse valor não é retornado se o usuário do Instagram tiver menos de 100 seguidores.

impressionsDescontinuado para v22.0+ e todas as versões a partir de 21 de abril de 2025.
	
day
	
N/A
	
N/A
	
total_value, time_series
	
O número de vezes que posts, stories, reels, vídeos e vídeos ao vivo apareceram na tela, incluindo em anúncios.

likes
	
day
	
N/A
	
media_product_type
	
total_value
	
O número de curtidas nos seus posts, reels e vídeos.

profile_links_taps
	
day
	
N/A
	
contact_button_type
	
total_value
	
O número de toques no seu endereço comercial ou no botão de chamada, email e texto.

reach
	
day
	
N/A
	
media_product_type, follow_type
	
total_value, time_series
	
O número de contas únicas que viram o conteúdo pelo menos uma vez, inclusive em anúncios. O conteúdo inclui posts, stories, reels, vídeos e vídeos ao vivo. O alcance é diferente das impressões, que podem incluir várias visualizações do conteúdo pelas mesmas contas.
Essa métrica é estimada.

replies
	
day
	
N/A
	
N/A
	
total_value
	
O número de respostas recebidas no seu story, incluindo respostas em texto e reações rápidas.

reposts
	
day
	
N/A
	
N/A
	
total_value
	
O número de reposts dos seus posts, stories, reels e vídeos.

saves
	
day
	
N/A
	
media_product_type
	
total_value
	
O número de salvamentos dos seus posts, reels e vídeos.

shares
	
day
	
N/A
	
media_product_type
	
total_value
	
O número de compartilhamentos dos seus posts, stories, reels, vídeos e vídeos ao vivo.

total_interactions
	
day
	
N/A
	
media_product_type
	
total_value
	
O número total de interações com seus posts, stories, reels, vídeos e vídeos ao vivo, incluindo interações em conteúdo turbinado.

views
	
day
	
N/A
	
follower_type, media_product_type
	
total_value
	
O número de vezes que seu conteúdo foi reproduzido ou mostrado. O conteúdo inclui reels, posts e stories.
Essa métrica está em desenvolvimento⁠.
Resposta
Um objeto JSON que contém os resultados da sua consulta. Os resultados podem incluir os seguintes dados, com base nas especificações da consulta:
{
  "data": [
    {
      "name": "{data}",
      "period": "<PERIOD>",
      "title": "{title}",
      "description": "{description}",
      "total_value": {
        "value": {value},
        "breakdowns": [
          {
            "dimension_keys": [
              "{key-1}",
              "{key-2",
              ...
            ],
            "results": [
              {
                "dimension_values": [
                  "{value-1}",
                  "{value-2}",
                  ...
                ],
                "value": {value},
                "end_time": "{end-time}"
              },
              ...
            ]
          }
        ]
      },
      "id": "{id}"
    }
  ],
  "paging": {
    "previous": "{previous}",
    "next": "{next}"
  }
}
Conteúdo da resposta
Propriedade	Tipo de valor	Descrição

breakdowns
	
Matriz
	
Uma matriz de objetos que descreve os detalhamentos solicitados e os respectivos resultados.
Esse valor só será retornado se metric_type=total_values for solicitado.

data
	
Matriz
	
Uma matriz de objetos que descreve seus resultados.

description
	
String
	
Descrição da métrica.

dimension_keys
	
Matriz
	
Uma matriz de strings que descreve os detalhamentos solicitados na consulta. É possível usá-la como chaves correspondentes aos valores nos conjuntos de detalhamentos individuais.
Esse valor só será retornado se metric_type=total_values for solicitado.

dimension_values
	
Matriz
	
Uma matriz de strings que descreve valores do conjunto de detalhamentos. É possível mapear os valores para dimension_keys.
Esse valor só será retornado se metric_type=total_values for solicitado.

end_time
	
String
	
Registro de data e hora ISO 8601 com horário e diferença de horas. Por exemplo: 2022-08-01T07:00:00+0000

id
	
String
	
Uma string que descreve os parâmetros de caminho da consulta.

name
	
String
	
Métrica solicitada.

next
	
String
	
URL para recuperar a próxima página de resultados. Para obter mais informações, consulte Resultados paginados.

paging
	
Objeto
	
Um objeto que contém URLs usados para solicitar o próximo conjunto de resultados. Para obter mais informações, consulte Resultados paginados.

period
	
String
	
Período solicitado.

previous
	
String
	
URL para recuperar a página de resultados anterior. Para obter mais informações, consulte Resultados paginados.

results
	
Matriz
	
Uma matriz de objetos que descreve cada conjunto de detalhamentos.
Esse valor só será retornado se metric_type=total_values for solicitado.

title
	
String
	
Título da métrica.

total_value
	
Objeto
	
Objeto que descreve os valores solicitados de detalhamento (caso tenham sido solicitados detalhamentos).

value
	
Número inteiro
	
Para data.total_value.value, a soma dos valores solicitados da métrica.
Para data.total_value.breakdowns.results.value, a soma dos valores de conjunto de detalhamento. Esse valor só será retornado se metric_type=total_values for solicitado.
Exemplos
Métricas de interação
curl -i -X GET \
  "https://graph.facebook.com/v26.0/17841405822304914/insights?metric=reach&period=day&breakdown=media_product_type&metric_type=total_value&since=1658991600&access_token=EAAOc..."
Resposta
{
  "data": [
    {
      "name": "reach",
      "period": "day",
      "title": "Accounts reached",
      "description": "The number of unique accounts that have seen your content, at least once, including in ads. Content includes posts, stories, reels, videos and live videos. Reach is different from impressions, which may include multiple views of your content by the same accounts. This metric is estimated and in development.",
      "total_value": {
        "value": 224,
        "breakdowns": [
          {
            "dimension_keys": [
              "media_product_type"
            ],
            "results": [
              {
                "dimension_values": [
                  "CAROUSEL_CONTAINER"
                ],
                "value": 100
              },
              {
                "dimension_values": [
                  "POST"
                ],
                "value": 124
              }
            ]
          }
        ]
      },
      "id": "17841405309211844/insights/reach/day"
    }
  ],
  "paging": {
    "previous": "https://graph.face...",
    "next": "https://graph.face..."
  }

Métricas de dados demográficos
curl -i -X GET \
  "https://graph.facebook.com/v26.0/17841405822304914/insights?metric=engaged_audience_demographics&period=lifetime&timeframe=last_90_days&breakdowns=country&metric_type=total_value&access_token=EAAOc..."
Resposta
{
  "data": [
    {
      "name": "engaged_audience_demographics",
      "period": "lifetime",
      "title": "Engaged audience demographics",
      "description": "The demographic characteristics of the engaged audience, including countries, cities and gender distribution.",
      "total_value": {
        "breakdowns": [
          {
            "dimension_keys": [
              "timeframe",
              "country"
            ],
            "results": [
              {
                "dimension_values": [
                  "LAST_90_DAYS",
                  "AR"
                ],
                "value": 1
              },
              {
                "dimension_values": [
                  "LAST_90_DAYS",
                  "RU"
                ],
                "value": 1
              },
              {
                "dimension_values": [
                  "LAST_90_DAYS",
                  "MA"
                ],
                "value": 1
              },
              {
                "dimension_values": [
                  "LAST_90_DAYS",
                  "LA"
                ],
                "value": 1
              },
              {
                "dimension_values": [
                  "LAST_90_DAYS",
                  "IQ"
                ],
                "value": 2
              },
              {
                "dimension_values": [
                  "LAST_90_DAYS",
                  "MX"
                ],
                "value": 1
              },
              {
                "dimension_values": [
                  "LAST_90_DAYS",
                  "FR"
                ],
                "value": 1
              },
              {
                "dimension_values": [
                  "LAST_90_DAYS",
                  "ES"
                ],
                "value": 3
              },
              {
                "dimension_values": [
                  "LAST_90_DAYS",
                  "NL"
                ],
                "value": 1
              },
              {
                "dimension_values": [
                  "LAST_90_DAYS",
                  "TR"
                ],
                "value": 1
              },
              {
                "dimension_values": [
                  "LAST_90_DAYS",
                  "US"
                ],
                "value": 7
              }
            ]
          }
        ]
      },
      "id": "17841401130346306/insights/engaged_audience_demographics/lifetime"
    }
  ]
}

Atualização
Esta operação não é compatível.
Exclusão
Esta operação não é compatível.
Você achou esta página útil?