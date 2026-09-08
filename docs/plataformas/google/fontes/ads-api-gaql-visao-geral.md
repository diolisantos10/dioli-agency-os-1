---
titulo: "Google Ads API — GAQL: visão geral das consultas"
url: https://developers.google.com/google-ads/api/docs/query/overview?hl=pt-br
capturado_em: 2026-09-08
hash: 22276d07545697f5
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Linguagem de consulta do Google Ads

**Dica**: Use o criador de consultas interativo para criar e validar suas consultas GAQL.
Terminologia importante
Recurso
Uma entidade no Google Ads, como campaign ou ad_group.
Segmento
Uma dimensão usada para agrupar dados, como segments.date ou segments.device. Quando os segmentos são incluídos na cláusula SELECT com métricas, as métricas são divididas por segmento.
Métrica
Uma medida de desempenho, como metrics.impressions ou metrics.clicks.
Recurso atribuído
Um recurso que é unido implicitamente ao recurso principal na cláusula FROM, permitindo que você selecione os atributos dele junto com os atributos do recurso principal.
Consultar informações de recursos ou metadados

A linguagem de consulta do Google Ads pode consultar a API Google Ads para os seguintes tipos de informações:

Recursos e os atributos, segmentos e métricas relacionados usando GoogleAdsService Search ou SearchStream: O resultado de uma consulta do GoogleAdsService é uma lista de GoogleAdsRow instâncias, com cada GoogleAdsRow representando um recurso.

Se algum atributo ou métrica for solicitado, a linha também vai incluir esses campos. Se algum segmento for solicitado, a resposta também vai mostrar uma linha adicional para cada tupla de segmento-recurso.

Metadados sobre campos e recursos disponíveis em GoogleAdsFieldService: Esse serviço fornece um catálogo de campos consultáveis com detalhes sobre a compatibilidade e o tipo deles.

O resultado de uma consulta GoogleAdsFieldService é uma lista de instâncias GoogleAdsField, com cada GoogleAdsField contendo detalhes sobre o campo solicitado.

Para mais detalhes sobre a estrutura da consulta, consulte Estrutura da consulta e Gramática da linguagem de consulta do Google Ads.

Consultar atributos de recursos

Confira um exemplo de uma consulta básica para atributos do recurso da campanha que ilustra como retornar o ID da campanha, o nome e o status:

SELECT
  campaign.id,
  campaign.name,
  campaign.status
FROM campaign
ORDER BY campaign.id

Essa consulta é ordenada por ID da campanha. Cada GoogleAdsRow resultante representa um objeto campaign preenchido com os campos selecionados, incluindo o resource_name da campanha.

Para saber quais outros campos estão disponíveis para consultas de campanha, consulte a Campaign documentação de referência.

Consultar métricas

Além dos atributos selecionados para um determinado recurso, também é possível consultar métricas relacionadas:

SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  metrics.impressions
FROM campaign
WHERE campaign.status = 'PAUSED'
  AND metrics.impressions > 1000
ORDER BY campaign.id

Essa consulta filtra apenas as campanhas que têm um status de PAUSED e tiveram mais de 1.000 impressões, enquanto são ordenadas por ID da campanha. Cada GoogleAdsRow resultante teria um campo metrics preenchido com as métricas selecionadas.

Para uma lista de métricas consultáveis, consulte a Metrics documentação.

Consultar segmentos

Além dos atributos selecionados para um determinado recurso, também é possível consultar segmentos relacionados:

SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  metrics.impressions,
  segments.date,
FROM campaign
WHERE campaign.status = 'PAUSED'
  AND metrics.impressions > 1000
  AND segments.date during LAST_30_DAYS
ORDER BY campaign.id

Semelhante à consulta de métricas, essa consulta filtra apenas as campanhas que têm um status de PAUSED e tiveram mais de 1.000 impressões. No entanto, essa consulta segmenta os dados por data. Isso faz com que cada GoogleAdsRow resultante represente uma tupla de uma campanha e a data Segment. A segmentação divide as métricas selecionadas, agrupando por cada segmento na cláusula SELECT.

Para uma lista de segmentos consultáveis, consulte a Segments documentação.

Consultar atributos de um recurso relacionado

Em uma consulta para um determinado recurso, é possível unir outros recursos relacionados, se disponíveis. Esses recursos relacionados são conhecidos como "recursos atribuídos". É possível unir recursos atribuídos implicitamente selecionando um atributo na consulta.

SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  bidding_strategy.name
FROM campaign
ORDER BY campaign.id

Essa consulta não apenas seleciona atributos de campanha, mas também extrai atributos relacionados de cada campanha selecionada. Cada GoogleAdsRow resultante representa um objeto campaign preenchido com os atributos de campanha selecionados, bem como o atributo de estratégia de lances selecionado bidding_strategy.name.

Para saber quais recursos atribuídos estão disponíveis para consultas de campanha, consulte a documentação de referência Campaign.

Práticas recomendadas
Selecione apenas os campos necessários para evitar tempos de resposta longos e timeouts.
Use LIMIT durante o desenvolvimento e os testes para evitar o processamento de grandes conjuntos de resultados.
Aplique filtros na cláusula WHERE para minimizar a transferência de dados e o tamanho da resposta.
Use GoogleAdsFieldService para verificar a compatibilidade de campos e os tipos de dados antes de criar consultas complexas.
Alguns campos, especialmente aqueles que envolvem grandes quantidades de dados ou cálculos complexos, podem aumentar o custo da consulta.
Fazer mutações com base nos resultados da consulta

Ao consultar um determinado recurso, é possível usar imediatamente os resultados retornados como objetos, modificá-los e enviá-los de volta ao método de mutação no serviço desse recurso. Confira um exemplo de fluxo de trabalho: 1. Execute uma consulta para todas as campanhas que estão PAUSED e têm mais de 1.000 impressões. 1. Receba o objeto Campaign do campo campaign de cada GoogleAdsRow na resposta. 1. Altere o status de cada campanha de PAUSED para ENABLED. 1. Chame CampaignService.MutateCampaigns com as campanhas modificadas para atualizá-las.

Metadados do campo

As consultas enviadas ao GoogleAdsFieldService são destinadas à recuperação de metadados de campo. Essas informações podem ser usadas para entender como os campos podem ser usados juntos em uma consulta. Como os dados estão disponíveis na API e ela fornece os metadados necessários para validar ou criar uma consulta, os desenvolvedores podem fazer isso de forma programática. Confira uma consulta típica de metadados:

SELECT
  name,
  category,
  selectable,
  filterable,
  sortable,
  selectable_with,
  data_type,
  is_repeated
WHERE name = "<INSERT_RESOURCE_OR_FIELD>"

É possível substituir <INSERT_RESOURCE_OR_FIELD> nessa consulta por um recurso (como customer ou campaign) ou um campo (como campaign.id, metrics.impressions ou ad_group.id).

**Ponto-chave**: não há uma cláusula FROM nessa consulta.

Para uma lista de campos consultáveis, consulte a GoogleAdsField documentação.

Exemplos de código

As bibliotecas de cliente têm exemplos de uso da linguagem de consulta do Google Ads em GoogleAdsService. A pasta operações básicas tem exemplos como GetCampaigns, GetKeywords e SearchForGoogleAdsFields.

Avançar
Gramática das consultas
Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-08-03 UTC.