---
titulo: "Instagram — IG Media Insights (métricas por post/reel/story)"
url: https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media/insights
capturado_em: 2026-09-09
hash: 0f1a653e07eec5ea
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Insights de mídia do Instagram
Updated: 18 de jun de 2026
Copiar para LLM
Ver como Markdown
Representa as métricas de interação social no objeto de mídia do usuário do seu app no Instagram.
Criação
Esta operação não é compatível.
Leitura
GET /<INSTAGRAM_MEDIA_ID>/insights
Obtenha dados de insights sobre um objeto de mídia do Instagram.
Limitações
Caso os dados de análise solicitados não existam ou estejam indisponíveis, a API retornará um conjunto vazio, em vez de 0 para as métricas individuais.
Pode haver um atraso de até 48 horas nos dados usados para calcular as métricas.
Os dados de métricas são armazenados por até dois anos.
As métricas comments, likes, views e total_interactions registram apenas métricas de interação orgânica. As interações em anúncios que contêm um objeto de mídia não são contabilizadas. As métricas total_likes, total_comments e total_views retornam contagens agregadas que incluem engajamento de mídia de anúncio promovida/turbinada. Essas métricas totais estão disponíveis apenas para a API do Instagram com o Login do Facebook. A contagem de posts cruzados do Facebook pode ser incluída se esses posts forem acessados pelo usuário da sessão.
Métricas de álbum
Não serão disponibilizados dados de insights sobre mídias que pertencem a um álbum de mídia do Instagram.
Métricas de mídia de stories
As métricas de mídia de story só ficam disponíveis por 24 horas.
Configure webhooks do Instagram e assine o campo story_insights para receber insights sobre stories antes da expiração. Você poderá receber dados depois da expiração caso o story seja adicionado a um destaque. Os resultados podem ser diferentes em chamadas de API, notificações de API e interfaces do usuário.
As métricas de mídia de stories com valores menores que 5 retornam o código de erro 10 com a mensagem (#10) Not enough viewers for the media to show insights.
Para stories criados por usuários na Europa e no Japão, a métrica replies agora retorna o valor 0.
Respostas publicadas por usuários na Europa e no Japão não são incluídas nos cálculos de replies para métricas de mídia de stories.
Webhooks
Não há compatibilidade com o webhook de insights para a API do Instagram com Login do Instagram.
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
Sintaxe da solicitação
GET "https://<HOST_URL>/<API_VERSION>/<INSTAGRAM_MEDIA_ID>/insights
  ?metric=<LIST_OF_METRICS>
  &period=<LIST_OF_TIME_PERIODS>
  &breakdown=<LIST_OF_BREAKDOWNS>
  &access_token=<ACCESS_TOKEN>"
Parâmetros de caminho

Espaço reservado	Valor

<API_VERSION>
A versão mais recente é: v26.0
	
A versão da API que seu app está usando. Caso não esteja especificado nas chamadas de API, esta será a versão mais recente no momento da criação do seu app da Meta; se essa opção não for mais válida, será a versão mais antiga disponível. Saiba mais sobre o controle de versões.

<HOST_URL>
	
O URL de hospedagem que seu app está usando para consultar o ponto de extremidade.

<INSTAGRAM_MEDIA_ID>
	
Obrigatório. A identificação da mídia do Instagram .
Parâmetros da string de consulta

Chave	Espaço reservado	Valor

access_token
	
<ACCESS_TOKEN>
	
Obrigatório. O token de acesso do usuário do app no Facebook ou Instagram.

breakdown
	
<LIST_OF_BREAKDOWNS>
	
Determina como detalhar os resultados em subconjuntos.

metric
	
<LIST_OF_METRICS>
	
Obrigatório. Uma lista separada por vírgula das métricas que devem ser retornadas.

period
	
<LIST_OF_TIME_PERIODS>
	
Uma lista separada por vírgula dos períodos que devem ser retornados. Os valores podem ser os seguintes:
day
week
days_28
month
lifetime
total_over_range
Métricas
A tabela a seguir mostra as métricas e os tipos de objeto de mídia nos quais elas estão disponíveis.
Métrica	Tipo de produto de mídia

comments
Número de comentários no objeto de mídia.
	
FEED (publicações) REELS

crossposted_views
O total de vezes que a mídia de vídeo do Instagram foi reproduzida, agregado no Facebook e no Instagram. É lançado se a mídia não for compartilhada no Facebook.
	
REELS

facebook_views
O número total de vezes que a mídia do Instagram foi reproduzida no Facebook. É lançado se a mídia não for compartilhada no Facebook. Para o Reels, isso pode ser reproduções de post cruzado ou recomendações cruzadas do Instagram para o Facebook.
	
FEED (publicações) REELSSTORY

follows
O número de usuários do Instagram que seguem a conta profissional do Instagram do usuário do seu app.
	
FEED (publicações) STORY

ig_reels_avg_watch_time
O tempo médio de reprodução do reel.
	
REELS

ig_reels_video_view_total_time

O tempo total de reprodução do reel, incluindo o tempo de reproduções repetidas do vídeo. Métrica em desenvolvimento⁠.
	
REELS

impressions
Para mídias criadas após 2 de julho de 2024, essa métrica está obsoleta. Para mídias criadas antes de 2 de julho de 2024, essa métrica ainda estará disponível.
O total de impressões do objeto de mídia do Instagram do usuário do seu app.
	
FEED (publicações) STORY

likes
Número de curtidas no objeto de mídia.
	
FEED (publicações) REELS

link_clicks
O número de toques em links no seu story.
	
STORY

navigation
Este é o número total de ações realizadas no seu story. Ele é composto por métricas como Saídas, Encaminhamentos, Voltar e Próximo story.
Detalhamento disponível: story_navigation_action_type
	
STORY

profile_activity
O número de ações que as pessoas executam quando visitam seu perfil após o engajamento com a publicação.
Detalhamento disponível: action_type (Disponível para mídia criada após 26 de outubro de 2017.)
	
FEED (publicações) STORY

profile_visits
O número de vezes que seu perfil foi visitado.
	
FEED (publicações) STORY

reach

O número de usuários únicos do Instagram que viram o reel pelo menos uma vez. O alcance é diferente das impressões, que podem incluir várias visualizações do reel pela mesma conta. A métrica é estimada⁠.
	
FEED (publicações) REELSSTORY

reels_skip_rate
A porcentagem de visualizações de pessoas que pularam o reel nos primeiros 3 segundos. Esse número é calculado como o total de visualizações que pularam o reel nos primeiros 3 segundos dividido pelo número de visualizações iniciais. Uma visualização inicial é quando o reel começa a ser reproduzido pela primeira vez em uma sessão do reel.
Métrica estimada e em desenvolvimento.⁠
	
REELS

replies
O total de respostas (comentários do Instagram ) no objeto de mídia de story do Instagram . O valor desconsiderará as respostas dos usuários de algumas regiões. Isso inclui a Europa, desde 1º de dezembro de 2020, e o Japão, desde 14 de abril de 2021. Se o story tiver sido criado em uma dessas regiões, o valor retornado será 0.
	
STORY

reposts
O número de reposts na mídia do Instagram menos o número de reposts excluídos.
	
FEED (publicações) REELSSTORY

saved
O número de vezes que a mídia do Instagram do usuário do seu app foi salva por um usuário do Instagram.
	
FEED (publicações) REELS

shares
O número de compartilhamentos do reel.
	
FEED (publicações) REELSSTORY

total_interactions

O número de curtidas, salvamentos, comentários e compartilhamentos do reel menos o número de descurtidas, remoções dos Salvos e comentários excluídos. Métrica em desenvolvimento⁠.
	
FEED (publicações) REELSSTORY

views
O total de reproduções da mídia do Instagram.
Métrica em desenvolvimento⁠.
	
FEED (publicações) REELSSTORY

total_comments
O total de comentários na mídia, em todas as plataformas, incluindo comentários em mídias de anúncios promovidas/turbinadas associadas. Disponível apenas para a API do Instagram com o Login do Facebook.
	
FEED (publicações) REELS

total_likes
O total de curtidas na mídia, em todas as plataformas, incluindo curtidas em mídias de anúncios promovidas/turbinadas associadas. Disponível apenas para a API do Instagram com o Login do Facebook.
	
FEED (publicações) REELS

total_views
O total de vezes que a mídia foi vista, em todas as plataformas, incluindo visualizações de mídias promovidas/turbinadas/de anúncio e do Facebook. Disponível apenas para a API do Instagram com o Login do Facebook.
	
FEED (publicações) REELSSTORY
Detalhamentos
Você também pode incluir o parâmetro breakdown em métricas específicas para dividir dados em conjuntos menores com base no valor de detalhamento especificado. Os valores podem ser os seguintes:
Valor do breakdown	Valores de resposta

action_type
Compatível apenas com a métrica profile_activity.
Detalha os resultados pelo componente de perfil no app nativo em que os visualizadores tocaram ou clicaram depois de ver o perfil do usuário do app.
	
BIO_LINK_CLICKED
CALL
DIRECTION
EMAIL
OTHER
TEXT

story_navigation_action_type
Compatível apenas com a métrica navigation.
Detalha os resultados por ação de navegação executada pelo visualizador após ver a mídia dentro do app nativo. Ao adicionar todos esses tipos de ação, você obterá insights completos sobre a navegação.
	
SWIPE_FORWARD significa "Próximo story"
TAP_BACK significa "Voltar"
TAP_EXIT significa "Sair"
TAP_FORWARD significa "Avançar"
OBSERVAÇÃO: se você solicitar uma métrica que não seja compatível com um detalhamento, a API retornará um erro (“An unknown error has occurred.”). Por isso, tenha cuidado ao solicitar várias métricas em uma única consulta.
Sintaxe da resposta
Em caso de sucesso, o app receberá um objeto JSON contendo os resultados da sua consulta. Os resultados podem incluir os seguintes dados, com base nas especificações da consulta:
{
  "data": [
    {
      "name": "<NAME>",
      "period": "<PERIOD>",
      "values": [
        {
          "value": <VALUE>
        }
      ],
      "title": "<TITLE>",
      "description": "<DESCRIPTION>",
      "total_value": {
        "value":<VALUE>,
        "breakdowns": [
          {
            "dimension_keys": [
              "<DIMENSION_KEY_1>",
              "<DIMENSION_KEY_2>"
              ...
            ],
            "results": [
              {
                "dimension_values": [
                  "<DIMENSION_VALUE_1>",
                  "<DIMENSION_VALUE_2>"
                  ...
                ],
                "value": <VALUE>
              },
              ...
            ]
          }
        ]
      },
      "id": "<ID>"
    }
  ]
}
Conteúdo da resposta
Propriedade	Tipo de valor	Descrição

data
	
Matriz
	
Uma matriz contendo um objeto que descreve os resultados das suas solicitações.

name
	
String
	
Nome da métrica.

period
	
String
	
Período solicitado. O período é automaticamente definido como lifetime na solicitação, e não é possível alterá-lo. Assim, esse valor será sempre lifetime.

values
	
Matriz
	
Uma matriz contendo um objeto que descreve os valores solicitados da métrica.

value
	
Número inteiro
	
Para data.values.value, a soma dos valores solicitados da métrica.
Para data.total_value.value, a soma dos valores solicitados de detalhamento.
Para data.total_value.breakdowns.results.value, a soma dos valores de conjunto de detalhamento.

title
	
String
	
Título da métrica.

description
	
String
	
Descrição da métrica.

id
	
String
	
Uma string que descreve os parâmetros do caminho da consulta.

total_value
	
Objeto
	
Objeto que descreve os valores solicitados de detalhamento (caso tenham sido solicitados detalhamentos).

breakdowns
	
Matriz
	
Uma matriz de objetos que descreve os detalhamentos solicitados e os respectivos resultados.

dimension_keys
	
Matriz
	
Matriz de strings que descreve os detalhamentos solicitados.

results
	
Matriz
	
Uma matriz de objetos que descreve cada conjunto de detalhamentos.

dimension_values
	
String
	
Uma matriz de strings que descreve valores do conjunto de detalhamentos. É possível mapear os valores para dimension_keys.

paging
	
Objeto
	
Um objeto que contém URLs usados para solicitar o próximo conjunto de resultados. Consulte Resultados paginados para mais informações.

previous
	
String
	
URL para recuperar a página de resultados anterior. Consulte Resultados paginados para mais informações.

next
	
String
	
URL para recuperar a próxima página de resultados. Consulte Resultados paginados para mais informações.
Exemplos
Exemplo de solicitação para métrica de publicação
Veja a seguir a solicitação de um app que usa o Login do Facebook.
curl -i -X GET \
 "https://graph.facebook.com/v26.0/17932174733377207/insights?metric=profile_activity&breakdown=action_type&access_token=EAAOc..."
Exemplo de resposta para métrica de publicação
{
  "data": [
    {
      "name": "profile_activity",
      "period": "lifetime",
      "values": [
        {
          "value": 4
        }
      ],
      "title": "Profile activity",
      "description": "[IG Insights] This header is the name of a metric that appears on an educational info sheet for a particular post, story, video or promotion. This metric is the sum of all profile actions people take when they engage with this content.",
      "total_value": {
        "value": 4,
        "breakdowns": [
          {
            "dimension_keys": [
              "action_type"
            ],
            "results": [
              {
                "dimension_values": [
                  "email"
                ],
                "value": 1
              },
              {
                "dimension_values": [
                  "text"
                ],
                "value": 1
              },
              {
                "dimension_values": [
                  "direction"
                ],
                "value": 1
              },
              {
                "dimension_values": [
                  "bio_link_clicked"
                ],
                "value": 1
              }
            ]
          }
        ]
      },
      "id": "17932174733377207/insights/profile_activity/lifetime"
    }
  ]
}

Exemplo de solicitação para métrica de story
Veja a seguir a solicitação de um app que usa o Login do Instagram.
curl -i -X GET \
 "https://graph.instagram.com/v26.0/17969782069736348/insights?metric=navigation&breakdown=story_navigation_action_type&access_token=EAAOc..."
Exemplo de resposta para métrica de story
{
  "data": [
    {
      "name": "navigation",
      "period": "lifetime",
      "values": [
        {
          "value": 25
        }
      ],
      "title": "Navigation",
      "description": "This is the total number of actions taken from your story. These are made up of metrics like exited, forward, back and next story.",
      "total_value": {
        "value": 25,
        "breakdowns": [
          {
            "dimension_keys": [
              "story_navigation_action_type"
            ],
            "results": [
              {
                "dimension_values": [
                  "tap_forward"
                ],
                "value": 19
              },
              {
                "dimension_values": [
                  "tap_back"
                ],
                "value": 4
              },
              {
                "dimension_values": [
                  "tap_exit"
                ],
                "value": 1
              },
              {
                "dimension_values": [
                  "swipe_forward"
                ],
                "value": 1
              }
            ]
          }
        ]
      },
      "id": "17969782069736348/insights/navigation/lifetime"
    }
  ]
}

Atualização
Esta operação não é compatível.
Exclusão
Esta operação não é compatível.
Você achou esta página útil?