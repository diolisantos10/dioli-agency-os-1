---
titulo: "Marketing API — Insights API (visão geral)"
url: https://developers.facebook.com/documentation/ads-commerce/marketing-api/insights
capturado_em: 2026-09-09
hash: d7f6efad7b997b2e
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
API de Insights sobre Anúncios
Updated: 27 de abr de 2026
Copiar para LLM
Ver como Markdown
Os anúncios no Status do WhatsApp são disponibilizados por meio da API de Marketing. Saiba mais sobre anúncios no Status do WhatsApp.
A API de Insights sobre Anúncios fornece dados de desempenho e estatísticas dos anúncios da Meta. Com as opções flexíveis de relatórios, é possível personalizar solicitações e obter quase todas as métricas disponíveis no Gerenciador de Anúncios da Meta.
Antes de começar
Para acessar a API de Insights sobre Anúncios, você precisará do seguinte:
Um app. (Consulte Desenvolvimento de apps da Meta para saber mais.)
A permissão ads_read. Para saber mais, consulte Permissões e Autorização.
Você também deve configurar seus anúncios para rastrear as ações do seu interesse. Para isso, use ferramentas como a API de Conversões ou o Pixel da Meta.
Como fazer chamadas à API de Insights sobre Anúncios
A API de Insights sobre Anúncios está disponível como uma borda de todos os objetos de anúncios. (Veja mais informações sobre a hierarquia de anúncios da Meta aqui.)
Recurso	Fornece

/{ad-account-id}/insights
	
Insights de uma conta de anúncios

/{campaign-id}/insights
	
Insights de uma campanha de anúncios

/{ad-set-id}/insights
	
Insights de um conjunto de anúncios

/{ad-id}/insights
	
Insights de um anúncio
Por padrão, solicitações GET retornarão métricas básicas para o objeto de anúncio, normalmente dos últimos 30 dias.
Exemplo de solicitação
curl -G \
  -d "access_token=<ACCESS_TOKEN>" \
"https://graph.facebook.com/v26.0/<CAMPAIGN_ID>/insights"
Exemplo de resposta:
{
  "data": [
    {
      "account_id": "<AD_ACCOUNT_ID>",
      "campaign_id": "<CAMPAIGN_ID>",
      "date_start": "2025-03-14",
      "date_stop": "2025-04-12",
      "impressions": "361324",
      "spend": "5339.5"
    }
  ],
  "paging": {
    "cursors": {
    "before": "MAZDZD",
    "after": "MAZDZD"
    }
  }
}
Como personalizar suas solicitações
Você pode conseguir dados mais específicos ao usar três componentes principais na sua solicitação: parâmetros (para especificar coisas como intervalos de tempo, janelas de atribuição, entre outros), campos (ou seja, métricas) e detalhamentos. Por exemplo, para saber o número de cliques (todos) por gênero que aconteceram nos últimos 7 dias da sua campanha, inclua:
Parâmetros: date_preset=last_7d
Campos: clicks
Detalhamentos: gender
Exemplo de solicitação
curl -G \
  -d "date_preset=last_7d" \
  -d "fields=clicks" \
  -d "breakdowns=gender" \
  -d "access_token=<ACCESS_TOKEN>" \
"https://graph.facebook.com/v26.0/<CAMPAIGN_ID>/insights"
Exemplo de resposta
{
  "data": [
    {
      "clicks": "7346",
      "date_start": "2025-04-06",
      "date_stop": "2025-04-12",
      "gender": "female"
    },
    {
      "clicks": "3788",
      "date_start": "2025-04-06",
      "date_stop": "2025-04-12",
      "gender": "male"
    },
    {
      "clicks": "79",
      "date_start": "2025-04-06",
      "date_stop": "2025-04-12",
      "gender": "unknown"
    },
  ],
  "paging": {
    "cursors": {
    "before": "MAZDZD",
    "after": "MAZDZD"
    }
  }
}

Saiba mais
A API de Insights sobre Anúncios pode ser muito poderosa. Por isso, continue lendo e aprenda a dominar os recursos:
Parâmetros e campos
Métricas
Detalhamentos
Solicitações assíncronas
Limites e boas práticas
Guias específicos para relatórios de conversões, relatórios no nível do produto e marketing mix modeling
Você também pode encontrar documentação de referência gerada automaticamente para a borda de insights de cada objeto de anúncio:
Insights sobre a conta de anúncios
Insights sobre a campanha de anúncios
Insights sobre o conjunto de anúncios
Insights sobre o anúncio
Se você planeja incluir dados da API de Insights sobre Anúncios na sua solução, analise também os Termos da Plataforma da Meta e as Políticas do Desenvolvedor para a API de Marketing.
Você achou esta página útil?