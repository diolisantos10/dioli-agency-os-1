---
titulo: "Instagram Platform — insights (guia)"
url: https://developers.facebook.com/documentation/instagram-platform/insights
capturado_em: 2026-09-12
hash: 2defb932ff2449ee
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Insights da plataforma do Instagram
Updated: 21 de jan de 2025
Copiar para LLM
Ver como Markdown
Este guia mostra como obter insights sobre contas profissionais e mídias do Instagram dos usuários do seu app usando a Plataforma do Instagram.
Neste guia, os termos usuário do Instagram e conta profissional do Instagram são usados como sinônimos. Um objeto de usuário do Instagram representa a conta profissional do usuário do seu app no Instagram.
Os insights do Instagram agora estão disponíveis para a API do Instagram com o Login do Instagram. Saiba mais.
Antes de começar
Você precisará do seguinte:
Requisitos
Este guia considera que você leu a Visão geral da plataforma do Instagram e implementou os componentes necessários para usar a API, como um fluxo de login da Meta e um servidor de webhooks para receber notificações.
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
Caso uma função tenha sido concedida ao usuário do app na Página conectada à respectiva conta profissional do Instagram por meio do Gerenciador de Negócios, seu app também precisará da seguinte permissão:
ads_management
ads_read
Nível de acesso
Advanced Access se o app atender a contas profissionais do Instagram que você não possui nem gerencia
Acesso padrão se o app atender a contas profissionais do Instagram que você possui ou gerencia e que foram adicionadas ao app no Painel de Apps.
Pontos de extremidade
GET /<INSTAGRAM_MEDIA_ID>/insights, para obter métricas sobre um objeto de mídia.
GET /<INSTAGRAM_ACCOUNT_ID>/insights, para obter métricas sobre uma conta comercial ou de criador de conteúdo do Instagram.
Consulte a documentação de cada endpoint para ver requisitos adicionais de métricas, parâmetros e permissões.
UTC
Os registros de data e hora das respostas da API usam o formato UTC com deslocamento zero e são formatados de acordo com a norma ISO-8601. Por exemplo: 2019-04-05T07:56:32+0000
Assinaturas de eventos de webhook
story_insights – Disponível somente na API do Instagram com o Login do Facebook.
Limitações
Insights sobre a mídia
Métricas como comments, likes e views retornam o engajamento apenas da mídia do Instagram e não incluem dados de outras plataformas. Por exemplo, comments retorna o número de comentários em uma foto, mas não comentários em anúncios que contêm essa foto. Use total_comments, total_likes e total_views no ponto de extremidade de insights para obter contagens agregadas que incluem engajamento de mídia de anúncio promovida/turbinada. Essas métricas totais só estão disponíveis para a API do Instagram com o Login do Facebook.
A mídia do Instagram de vídeo ao vivo só pode ser lida durante a transmissão desse conteúdo.
Essa API retorna apenas dados de mídia de propriedade de contas profissionais do Instagram. Não é possível usá-la para obter dados de mídia de propriedade de contas pessoais do Instagram.
Insights sobre contas
Algumas métricas não estão disponíveis para contas do Instagram com menos de 100 seguidores.
Os dados de métricas do usuário são armazenados por até 90 dias.
Só é possível obter informações de um usuário por vez.
Insights sobre Páginas do Facebook não poderão ser acessados.
Se os dados de insights solicitados não existirem ou estiverem indisponíveis, a API retornará um conjunto vazio para as métricas individuais, em vez de 0.
Exemplos
Solicitação de conta do Instagram
O exemplo de API do Instagram com Login do Facebook a seguir obtém o número de impressions, profile_views e reach para a conta profissional do usuário do app no Instagram durante um período de 24 horas.
Para obter métricas sobre uma conta empresarial ou de criador de conteúdo do Instagram, consulte o ponto de extremidade GET /<INSTAGRAM_USER_ID>/insights com o parâmetro metrics definido como uma lista separada por vírgulas das métricas, impressions, profile_views e reach, e o period definido como day.
GET graph.facebook.com/17841405822304914/insights
    ?metric=impressions,reach,profile_views
    &period=day
Exemplo de resposta
Se o processo for bem-sucedido, o app receberá uma matriz para cada métrica que inclui a descrição, o ID, o nome e o título, o período de mensuração e os valores da métrica.
{
  "data": [
    {
      "name": "impressions",
      "period": "day",
      "values": [
        {
          "value": 32,
          "end_time": "2018-01-11T08:00:00+0000"
        },
        {
          "value": 32,
          "end_time": "2018-01-12T08:00:00+0000"
        }
      ],
      "title": "Impressions",
      "description": "Total number of times the Business Account's media objects have been viewed",
      "id": "instagram_business_account_id/insights/impressions/day"
    },
    {
      "name": "reach",
      "period": "day",
      "values": [
        {
          "value": 12,
          "end_time": "2018-01-11T08:00:00+0000"
        },
        {
          "value": 12,
          "end_time": "2018-01-12T08:00:00+0000"
        }
      ],
      "title": "Reach",
      "description": "Total number of times the Business Account's media objects have been uniquely viewed",
      "id": "instagram_business_account_id/insights/reach/day"
    },
    {
      "name": "profile_views",
      "period": "day",
      "values": [
        {
          "value": 15,
          "end_time": "2018-01-11T08:00:00+0000"
        },
        {
          "value": 15,
          "end_time": "2018-01-12T08:00:00+0000"
        }
      ],
      "title": "Profile Views",
      "description": "Total number of users who have viewed the Business Account's profile within the specified period",
      "id": "instagram_business_account_id/insights/profile_views/day"
    }
  ]
}
Solicitação de mídia do Instagram
O exemplo de API do Instagram com Login do Instagram a seguir obtém o número de engagement, impressions e reach para a mídia do Instagram do usuário do seu app ao longo de um período de 24 horas.
Para obter métricas sobre a mídia de uma conta empresarial ou de criador de conteúdo do Instagram, consulte o ponto de extremidade GET /<INSTAGRAM_MEDIA_ID>/insights com o parâmetro metrics definido como uma lista separada por vírgulas das métricas, engagement, impressions e reach, e o period definido como day.
GET graph.instagram.com/17841491440582230/insights
    ?metric=engagement,impressions,reach
Exemplo de resposta
Se o processo for bem-sucedido, o app receberá uma matriz para cada métrica que inclui a descrição, o ID, o nome e o título, o período de mensuração e os valores da métrica.
{
  "data": [
    {
      "name": "engagement",
      "period": "lifetime",
      "values": [
        {
          "value": 8
        }
      ],
      "title": "Engagement",
      "description": "Total number of likes and comments on the media object",
      "id": "media_id/insights/engagement/lifetime"
    },
    {
      "name": "impressions",
      "period": "lifetime",
      "values": [
        {
          "value": 13
        }
      ],
      "title": "Impressions",
      "description": "Total number of times the media object has been seen",
      "id": "media_id/insights/impressions/lifetime"
    },
    {
      "name": "reach",
      "period": "lifetime",
      "values": [
        {
          "value": 13
        }
      ],
      "title": "Reach",
      "description": "Total number of unique accounts that have seen the media object",
      "id": "media_id/insights/reach/lifetime"
    }
  ]
}
Próximas etapas
Consulte a referência da API para ver todas as métricas disponíveis para contas empresariais e de criadores de conteúdo do Instagram e os respectivos objetos de mídia do Instagram.
Você achou esta página útil?