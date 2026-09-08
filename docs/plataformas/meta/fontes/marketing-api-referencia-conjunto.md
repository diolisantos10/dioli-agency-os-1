---
titulo: "Marketing API — referência de Ad Set (ad-campaign)"
url: https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ad-campaign
capturado_em: 2026-09-08
hash: 67cfe1c9a294e192
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Version
v22.0
v23.0
v24.0
v25.0
Isso foi útil?
Conjunto de anúncios
Updated: 29 de jul de 2026
Copiar para LLM
Ver como Markdown
Os anúncios no Status do WhatsApp são disponibilizados por meio da API de Marketing. Saiba mais sobre anúncios no Status do WhatsApp.
A partir de 2 de setembro de 2025, implementaremos restrições adicionais e proativas a públicos e conversões personalizadas que possam sugerir informações não permitidas nos nossos termos⁠. Por exemplo, qualquer público personalizado ou conversões personalizadas que sugerem condições de saúde específicas (como "artrite", "diabetes") ou situação financeira (como "pontuação de crédito", "alta renda") será sinalizado e impedido de ser usado para veicular campanhas publicitárias.
Como essas restrições afetam suas campanhas:
Você não poderá usar públicos personalizados ou conversões personalizadas sinalizados ao criar novas campanhas.
Se você tiver uma campanha ativa com públicos personalizados ou conversões personalizadas sinalizados, deverá analisar e resolver os problemas imediatamente seguindo as etapas de resolução para evitar problemas de veiculação e desempenho.
Para desenvolvedores da API:
A partir de 2 de setembro de 2025, se um conjunto de anúncios contiver um ou mais públicos personalizados e conversões personalizadas sinalizados, a lista issues_info será preenchida com um problema por item sinalizado.
A criação e a edição de conjuntos de anúncios que contêm públicos personalizados e conversões personalizadas sinalizados não serão bloqueadas. No entanto, a veiculação e o desempenho da campanha poderão ser afetados, a menos que as sinalizações sejam resolvidas.
Para ver mais informações sobre a atualização e saber como resolver públicos personalizados sinalizados, clique aqui⁠. Para resolver conversões personalizadas sinalizadas, veja as informações disponíveis aqui⁠.
Um conjunto de anúncios é um grupo de anúncios com o mesmo orçamento diário ou total, programação, tipo de lance, informações do lance e dados de direcionamento. Com os conjuntos de anúncios, é possível agrupar anúncios de acordo com seus critérios. Você também pode recuperar as estatísticas relacionadas aos anúncios de um conjunto. Consulte CPM otimizado e Objeto promovido.
Por exemplo, crie um conjunto de anúncios com um orçamento diário:
curl -X POST \
  -F 'name="My Reach Ad Set"' \
  -F 'optimization_goal="REACH"' \
  -F 'billing_event="IMPRESSIONS"' \
  -F 'bid_amount=2' \
  -F 'daily_budget=1000' \
  -F 'campaign_id="<AD_CAMPAIGN_ID>"' \
  -F 'targeting={
       "geo_locations": {
         "countries": [
           "US"
         ]
       },
       "facebook_positions": [
         "feed"
       ]
     }' \
  -F 'status="PAUSED"' \
  -F 'promoted_object={
       "page_id": "<PAGE_ID>"
     }' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/adsets
Criar um conjunto de anúncios com orçamento total
curl -X POST \
  -F 'name="My First Adset"' \
  -F 'lifetime_budget=20000' \
  -F 'start_time="2025-12-04T20:32:30-0800"' \
  -F 'end_time="2025-12-14T20:32:30-0800"' \
  -F 'campaign_id="<AD_CAMPAIGN_ID>"' \
  -F 'bid_amount=100' \
  -F 'billing_event="LINK_CLICKS"' \
  -F 'optimization_goal="LINK_CLICKS"' \
  -F 'targeting={
       "facebook_positions": [
         "feed"
       ],
       "geo_locations": {
         "countries": [
           "US"
         ]
       },
       "publisher_platforms": [
         "facebook",
         "audience_network"
       ]
     }' \
  -F 'status="PAUSED"' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/adsets
Limites
Veja a seguir os limites em conjuntos de anúncios.
Limite	Valor

Número máximo de conjuntos de anúncios por conta de anúncios comum
	
5.000 conjuntos de anúncios não excluídos

Número máximo de conjuntos de anúncios por conta de anúncios em massa
	
10.000 conjuntos de anúncios não excluídos

Número máximo de anúncios por conjunto
	
50 anúncios não arquivados
Anúncios de moradia, emprego e crédito
O Facebook tem o compromisso de proteger as pessoas contra discriminação, e temos melhorado continuamente a nossa capacidade de detectar e deter potenciais abusos. A discriminação ao direcionar injustamente ou excluir grupos específicos de pessoas é uma violação das nossas políticas⁠. Como parte de um acordo de reparação histórica⁠, estamos fazendo alterações na forma como gerenciamos anúncios de moradia, emprego e crédito.
Os anunciantes precisam especificar uma special_ad_category para campanhas publicitárias que comercializam imóveis, empregos e créditos. Ao fazer isso, o conjunto de opções de direcionamento disponíveis para anúncios nessas campanhas será restringido. Consulte Categoria de anúncio especial para saber mais.
Conversões personalizadas, públicos personalizados e/ou públicos semelhantes sinalizados
Se um conjunto de anúncios contiver um ou mais públicos semelhantes personalizados sinalizados com operation_status de 471, a lista issues_info será preenchida com um problema por público sinalizado como aviso.
Exemplo
{
  "effective_status": "ACTIVE",
  "issues_info": [
    {
      "level": "AD_SET",
      "error_code": 2460003,
      "error_summary": "Custom Audience is blocked",
      "error_message": "Custom Audience is blocked: Some of this ad set’s custom audiences and/or lookalikes are blocked because they suggest the use of information (e.g., health, financial) not allowed under Meta’s terms. Go to Audience Manager for more details, and you can either review each custom audience or lookalike and remove prohibited information, or choose a different one for your ad set or create a new one and make sure it does not include potentially prohibited information. You can also request a review in Audience Manager if you think any don’t use restricted information.",
      "error_type": "SOFT_ERROR",
      "additional_info": "Custom Audience ID: 120231141155310247"
    },
    {
      "level": "AD_SET",
      "error_code": 2460003,
      "error_summary": "Custom Audience is blocked",
      "error_message": "Custom Audience is blocked: Some of this ad set’s custom audiences and/or lookalikes are blocked because they suggest the use of information (e.g., health, financial) not allowed under Meta’s terms. Go to Audience Manager for more details, and you can either review each custom audience or lookalike and remove prohibited information, or choose a different one for your ad set or create a new one and make sure it does not include potentially prohibited information. You can also request a review in Audience Manager if you think any don’t use restricted information.",
      "error_type": "SOFT_ERROR",
      "additional_info": "Custom Audience ID: 120232742978230247"
    },
    {
      "level": "AD_SET",
      "error_code": 2460004,
      "error_summary": "Custom Conversion is blocked",
      "error_message": "Custom Conversion is blocked: This ad set’s custom conversion is blocked because it suggests the use of information (e.g., health, financial) not allowed under Meta’s terms. You can’t edit this custom conversion, but you can choose a different one for this ad set or create a new one that doesn’t use prohibited information. You can also request a review if you think your custom conversion doesn’t use prohibited information.",
      "error_type": "SOFT_ERROR",
      "additional_info": "Custom Conversion ID: 730362226205831"
    }
  ],
  "id": "120228591637010247"
}

Além disso, a tentativa de criar ou modificar conjuntos de anúncios contendo qualquer público personalizado, público semelhante ou conversão personalizada sinalizado resultará em um erro. O erro mostrará a lista de identificações dos ativos restritos.
Para públicos personalizados sinalizados
{
  "error": {
    "error_subcode": 246003,
    "error_data": {
      "Restricted Custom Audience IDs": [
        "<CUSTOM_AUDIENCE_ID1>",
        "<CUSTOM_AUDIENCE_ID2>"
      ]
    }
    "error_user_title": "Your custom audience is currently blocked",
    "error_user_msg": "  This custom audience is blocked because it may contain information (e.g., health, financial) not allowed under Meta’s terms. Visit the audience manager to appeal this decision, edit your audience and remove prohibited information, or choose a different audience."
  },
}
Para conversões personalizadas sinalizadas
{
  "error": {
    "error_subcode": 246004,
    "error_data": {
      "Restricted Custom Conversion ID": "<CUSTOM_CONVERSION_ID>"
    }
    "error_user_title": "Your custom conversion is currently blocked",
    "error_user_msg": "This custom conversion is blocked because it may contain information (e.g., health, financial) not allowed under Meta’s terms. Visit the events manager to appeal this decision, edit your custom conversion and remove prohibited information, or choose a different custom conversion."
  },
}
Para resolver públicos sinalizados
Se os seus públicos personalizados ou semelhantes forem sinalizados, considere estas opções.
Para resolver públicos personalizados sinalizados:
Analise públicos sinalizados: use o Gerenciador de Público para analisar seu público personalizado juntamente com outras informações incluídas em um público e remova informações que não são permitidas ao editar o público para cumprir com os termos da Meta⁠.
Criar novo ou escolher públicos diferentes: como alternativa, você pode criar um público personalizado novo ou escolher um público personalizado existente e garantir que ele não inclua informações não permitidas pelos nossos termos e usá-lo para veicular campanhas.
Para resolver públicos semelhantes sinalizados:
Resolva problemas com o público personalizado subjacente: se o público personalizado subjacente (também conhecido como público de origem) do seu público semelhante for sinalizado, você precisará resolver o problema com o público personalizado subjacente no qual o público semelhante foi criado. Consulte a seção anterior sobre como resolver públicos personalizados sinalizados.
Crie novos públicos: desenvolva novos públicos semelhantes e se certifique de que eles não incluam informações que não são permitidas pelos nossos termos.
Pedir uma análise
Se acredita que o público personalizado ou semelhante foi sinalizado por engano e não inclui informações não permitidas, você pode solicitar uma análise pelo Gerenciador de Anúncios na tabela de campanhas ou pelo Gerenciador de Público clicando nos públicos individuais e na aba de resumo do público afetado.
Para resolver conversões personalizadas que foram sinalizadas
Se alguma das suas conversões personalizadas for sinalizada por sugerir informações não permitidas pelos nossos termos, você tem as opções a seguir.
Para resolver uma conversão personalizada sinalizada durante a criação de uma nova campanha:
Crie uma nova conversão personalizada: use uma nova conversão personalizada e verifique se ela não inclui informações vedadas pelos nossos termos.
Escolha uma conversão personalizada diferente: selecione outra conversão personalizada existente e verifique se ela não contém informações vedadas pelos nossos termos.
Para resolver uma conversão personalizada sinalizada em uma campanha existente:
Duplique sua campanha e selecione uma conversão personalizada existente: se você tiver uma campanha em veiculação que foi sinalizada devido a um problema na conversão personalizada, considere duplicar a campanha e selecionar uma conversão personalizada diferente que não esteja sinalizada antes de publicar a nova campanha duplicada. Importante: depois que a campanha for publicada, não será mais possível remover a conversão personalizada nem selecionar uma opção diferente.
Pedir uma análise
Caso você acredite que sua conversão personalizada tenha sido sinalizada por engano e não inclua informações não permitidas, peça uma análise via Gerenciador de Anúncios usando a tabela de campanhas ou pelo Gerenciador de Eventos acessando a página de conversões personalizadas.
Direcionamento de anúncios na União Europeia
A partir de terça-feira, 16 de maio de 2023, os anunciantes que incluírem a União Europeia (UE), os territórios associados ou selecionarem "Global" no direcionamento de anúncios no Facebook e no Instagram deverão fornecer informações sobre quem se beneficia do anúncio (beneficiário) e quem está pagando pelo anúncio (pagador) em cada conjunto de anúncios. Os anunciantes deverão fornecer essas informações em todas as plataformas de compra de anúncios, incluindo o Gerenciador de Anúncios e a API de Marketing. A partir de quarta-feira, 16 de agosto de 2023, se as informações sobre o beneficiário e o pagador não forem fornecidas, o anúncio não será publicado.
Estamos lançando esse requisito de resposta ao Regulamento dos Serviços Digitais da UE (RSD) que entrará em vigor para o Facebook e o Instagram ainda este ano.
Os conjuntos de anúncios direcionados à UE e/ou territórios associados (consulte aqui⁠ para ver uma lista completa) precisam fornecer informações sobre o beneficiário (quem se beneficia com a veiculação do anúncio) e sobre o pagador (quem paga pelo anúncio). Isso se aplica a anúncios novos, duplicados ou significativamente editados a partir de 16 de maio. Sem as informações necessárias, a API responderá com um erro de parâmetro incorreto. Para conveniência, o anunciante pode definir um beneficiário e um pagador salvos na sua conta de anúncios, que serão preenchidos automaticamente durante a criação do conjunto de anúncios, copiando e atualizando os alvos para incluir locais e anúncios da UE no conjunto de anúncios existente sem configurar o pagador e o beneficiário. Para obter mais informações sobre os parâmetros no nível da conta de anúncios, default_dsa_payor e default_dsa_beneficiary, consulte o documento de referência da conta de anúncios.
Para facilitar a criação de conjuntos de anúncios direcionados à UE, estamos oferecendo uma nova API que permite aos desenvolvedores obter uma lista de strings de prováveis ​​beneficiários/pagadores, com base na atividade da conta de anúncios. Consulte Recomendações de DSA da conta de anúncios para saber mais.
Aviso:
Quando os valores padrão forem definidos na conta de anúncios, durante a criação do conjunto de anúncios, atualização e criação de anúncio em um conjunto de anúncios existente, se um deles não for fornecido, a API preencherá automaticamente o valor padrão listado na conta de anúncios. Não transmita apenas um deles e espere que a API defina o outro como o mesmo valor. Por exemplo, nas configurações da conta de anúncios, default_dsa_payor é payor_default, e default_dsa_beneficiary é beneficiary_default. Durante a criação do conjunto de anúncios, se apenas dsa_payor for passado com o pagador, a dsa_beneficiary será automaticamente preenchida com o valor de beneficiary_default em vez de dsa_payor.
Se nenhum valor padrão salvo for definido ou se os valores não forem definidos, sem passar explicitamente o pagador ou beneficiário durante a criação do conjunto de anúncios ou ao fazer atualizações, isso acionará um erro e a solicitação falhará.
Os campos payer e beneficiary são apenas para conjuntos de anúncios direcionados à UE e/ou territórios associados.
Para conjuntos de anúncios direcionados a regiões que não sejam a UE e/ou os territórios associados, essas informações não serão salvas, mesmo que sejam fornecidas.
Para facilitar a criação de conjuntos de anúncios direcionados à UE, estamos oferecendo uma nova API que permite aos desenvolvedores obter uma lista de strings de prováveis beneficiários/pagadores, com base na atividade da conta de anúncios. Consulte Recomendações de DSA da conta de anúncios para saber mais.
Leitura
Um conjunto de anúncios é um grupo de anúncios com o mesmo orçamento diário ou total, programação, tipo de lance, informações do lance e dados de direcionamento. Com os conjuntos de anúncios, é possível agrupar anúncios de acordo com seus critérios. Você também pode recuperar as estatísticas relacionadas aos anúncios de um conjunto.
O parâmetro date_preset = lifetime foi desativado na Graph API v10.0 e substituído por date_preset = maximum, que retorna um máximo de 37 meses de dados. Para a v9.0 e versões anteriores, date_preset = maximum será ativado em 25 de maio de 2021, e todas as chamadas de lifetime serão definidas como maximum por padrão e retornarão somente 37 meses de dados.
Exemplos
curl -X GET \
  -d 'fields="name,status"' \
  -d 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/<AD_SET_ID>/
Para recuperar campos relacionados a data e hora em um formato de registro de data e hora UNIX, use o parâmetro date_format:
curl -X GET \
  -d 'fields="id,name,start_time,end_time"' \
  -d 'date_format="U"' \
  -d 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/<AD_SET_ID>/
Exemplo
Selecionar idioma
HTTP
PHP SDK
JavaScript SDK
Android SDK
iOS SDK
cURL
GET /v25.0/<AD_SET_ID>/?fields=adset_schedule HTTP/1.1
Host: graph.facebook.com

Teste no Explorador da Graph API
Para saber como usar a Graph API, leia nosso guia Como usar a Graph API
Parâmetros
Parâmetro	Descrição

date_preset
enum{today, yesterday, this_month, last_month, this_quarter, maximum, data_maximum, last_3d, last_7d, last_14d, last_28d, last_30d, last_90d, last_week_mon_sun, last_week_sun_sat, last_quarter, last_year, this_week_mon_today, this_week_sun_today, this_year}
	
Predefinição de data

time_range
{‘since’:YYYY-MM-DD,’until’:YYYY-MM-DD}
	
Intervalo de tempo. Se o intervalo de tempo for inválido, ele será ignorado.
Show child parameters
Campos
Campo	Descrição

id
string numérica
	
Identificação do conjunto de anúncios.

padrão

account_id
string numérica
	
Identificação da conta de anúncios associada ao conjunto de anúncios.

adlabels
lista<AdLabel>
	
Rótulos de anúncios associados ao conjunto de anúncios.

ad_set_goal
AdCampaignGoal
	
A estratégia de ciclo de vida do cliente do conjunto de anúncios. É exibida apenas quando o conjunto de anúncios tem uma meta. Caso contrário, fica ausente. type é retornada como um número inteiro: 0 BROAD, 2 EXCLUDE_EXISTING_CUSTOMERS, 1 EXCLUDE_EXISTING_AND_ENGAGED_CUSTOMERS. Somente type e os campos de exclusão aplicáveis (existing_customers_exclusions, engaged_audiences_exclusions) são retornados.

adset_schedule
lista<DayPart>
	
Programação do conjunto de anúncios, representando uma programação de veiculação para um único dia.

asset_feed_id
string numérica
	
O ID do feed de ativos que contém um conteúdo para criar anúncios.

attribution_spec
lista<AttributionSpec>
	
Especificação da atribuição de conversão usada ao atribuir conversões para otimização. As durações de janela compatíveis diferem conforme a meta de otimização e o objetivo da campanha. Consulte Objective, Optimization Goal and attribution_spec.

bid_adjustments
AdBidAdjustments
	
Mapa dos tipos de ajuste de lance para valores

bid_amount
unsigned int32
	
Limite de lance ou custo-alvo do conjunto de anúncios. O limite de lance usado na estratégia de lance de menor custo é definido como o lance máximo que você quer pagar por um resultado com base em optimization_goal. O custo-alvo usado em uma estratégia de lance de custo-alvo permite que o Facebook dê lances em seu nome que atendam ao seu objetivo, em média, e mantenha os custos estáveis à medida que você aumenta o orçamento.
A unidade do valor do lance é centavos para moedas como USD, EUR e a unidade básica para moedas como JPY, KRW. O valor do lance para anúncios com IMPRESSION ou REACH como billing_event é por 1.000 ocorrências desse evento, e o valor do lance para anúncios com outras billing_event é por cada ocorrência.

bid_constraints
AdCampaignBidConstraint
	
Escolha restrições de lance para o conjunto de anúncios que sejam adequadas às suas metas de negócios específicas. Normalmente funciona com o campo bid_strategy.

bid_info
map<string, unsigned int32>
	
Mapa do objetivo do lance para o valor do lance.

bid_strategy 

enum {LOWEST_COST_WITHOUT_CAP, LOWEST_COST_WITH_BID_CAP, COST_CAP, LOWEST_COST_WITH_MIN_ROAS}
	
Estratégia de lance desse conjunto de anúncios quando você usa AUCTION como tipo de compra:
LOWEST_COST_WITHOUT_CAP: projetado para obter o máximo de resultados para seu orçamento com base no seu conjunto de anúncios optimization_goal sem limitar o valor do lance. Essa é a melhor estratégia se você se importar mais com a relação custo-benefício. No entanto, com essa estratégia, pode ser mais difícil obter custos médios estáveis à medida que você gasta. Essa estratégia também é conhecida como lance automático. Saiba mais em Central de Ajuda de Anúncios, Sobre as estratégias de lance: menor custo⁠.
LOWEST_COST_WITH_BID_CAP: projetado para obter o máximo de resultados para seu orçamento com base no conjunto de anúncios optimization_goal ao mesmo tempo que limita o lance real para o valor especificado. Com um limite de lance, você tem mais controle sobre o custo por evento de otimização real. Porém, se você definir um limite muito baixo, poderá obter menos veiculações de anúncios. Obtenha seu limite de lance com o campo bid_amount. Esta estratégia também é conhecida como lance manual de custo máximo. Saiba mais em Central de Ajuda de Anúncios, Sobre as estratégias de lance: menor custo⁠.
Observações:
Se você habilitar a otimização do orçamento da campanha, deverá obter bid_strategy no nível da campanha principal.
A estratégia de lances TARGET_COST ficou obsoleta a partir da versão 9.0 da API de Marketing.

billing_event
enum {APP_INSTALLS, CLICKS, IMPRESSIONS, LINK_CLICKS, NONE, OFFER_CLAIMS, PAGE_LIKES, POST_ENGAGEMENT, THRUPLAY, PURCHASE, LISTING_INTERACTION}
	
O evento de cobrança para este conjunto de anúncios:
APP_INSTALLS: pague quando as pessoas instalarem seu aplicativo.
CLICKS: pague quando as pessoas clicarem em qualquer lugar no anúncio.
IMPRESSIONS: pague quando os anúncios forem exibidos às pessoas.
LINK_CLICKS: pague quando as pessoas clicarem no link do anúncio.
OFFER_CLAIMS: pague quando as pessoas obtiverem a oferta.
PAGE_LIKES: pague quando as pessoas curtirem sua página.
POST_ENGAGEMENT: pague quando as pessoas se engajarem com sua publicação.
VIDEO_VIEWS: pague quando as pessoas assistirem aos seus anúncios em vídeo por pelo menos 10 segundos.
THRUPLAY: pague por anúncios que são reproduzidos até o fim ou por pelo menos 15 segundos.

brand_safety_config
BrandSafetyCampaignConfig
	
Opções de configuração de campanha de adequação e segurança para marcas.

budget_remaining
string numérica
	
Orçamento restante deste conjunto de anúncios.

campaign
Campanha
	
A campanha que contém este conjunto de anúncios.

campaign_active_time
string numérica
	
Duração da veiculação da campanha.

campaign_attribution
enum
	
campaign_attribution, um novo campo para campanha de anúncios de app, usado para indicar o tipo de atribuição de uma campanha, por exemplo, SKAN ou AEM.

campaign_id
string numérica
	
A identificação da campanha que contém o conjunto de anúncios.

configured_status
enum {ACTIVE, PAUSED, DELETED, ARCHIVED}
	
O status definido no nível do conjunto de anúncios. Pode ser diferente do status efetivo devido à campanha principal. É preferível usar "status" em vez disso.

contextual_bundling_spec
ContextualBundlingSpec
	
especificações da configuração do conjunto de anúncios em pacote contextual, incluindo sinal de ativação/desativação do recurso

created_time
datetime
	
É a hora em que o conjunto de anúncios foi criado.

creative_sequence
list<numeric string>
	
Ordem da sequência de grupos de anúncios a ser exibida aos usuários.

daily_budget
string numérica
	
O orçamento diário do conjunto definido na moeda da conta.

daily_min_spend_target
string numérica
	
Objetivo de gasto mínimo diário do conjunto de anúncios definido na moeda da sua conta. Para usar este campo, é preciso especificar um orçamento diário na campanha. Essa meta não é uma garantia, mas sim o nosso melhor esforço.

daily_spend_cap
string numérica
	
Limite de gastos diário do conjunto de anúncios definido na moeda da sua conta. Para usar este campo, é preciso especificar um orçamento diário na campanha.

destination_type
string
	
Destino dos anúncios neste conjunto de anúncios.
Opções possíveis: WEBSITE, APP, MESSENGER, INSTAGRAM_DIRECT.
No momento, os tipos de destino ON_AD, ON_POST, ON_VIDEO, ON_PAGE e ON_EVENT estão em teste beta limitado. Tentar duplicar campanhas com tipos de destino existentes usando esses novos tipos de destino pode causar um erro. Consulte a seção Experiências de anúncios orientadas por resultados abaixo para ver mais informações.

dsa_beneficiary
string
	
O beneficiário de todos os anúncios neste conjunto de anúncios.

dsa_payor
string
	
O pagador de todos os anúncios neste conjunto de anúncios.

effective_status
enum {ACTIVE, PAUSED, DELETED, CAMPAIGN_PAUSED, ARCHIVED, IN_PROCESS, WITH_ISSUES}
	
O status efetivo do conjunto de anúncios. O status pode ser efetivo devido ao próprio status ou ao status da campanha principal. WITH_ISSUES está disponível a partir da versão 3.2. IN_PROCESS está disponível a partir da versão 4.0.

end_time
datetime
	
É a hora de término no registro de data e hora UNIX (UTC).

frequency_control_specs
lista<AdCampaignFrequencyControlSpecs>
	
Uma matriz de especificações de controle de frequência para este conjunto de anúncios. As gravações nesse campo só estão disponíveis em conjuntos de anúncios em que REACH e THRUPLAY são a meta de desempenho.

instagram_user_id 

string numérica
	
Representa a identificação da sua conta do Instagram, usada para anúncios, incluindo anúncios de criativo dinâmico no Instagram.

is_dynamic_creative 

booliano
	
Indica se o conjunto de anúncios é de criativo dinâmico. Os anúncios desse tipo só podem ser criados em conjuntos de anúncios com esse campo definido como verdadeiro.

is_incremental_attribution_enabled
booliano
	
Indica se a campanha deve usar a otimização de atribuição incremental.

issues_info 

lista<AdCampaignIssuesInfo>
	
Problemas neste conjunto de anúncios que impediram a veiculação.

learning_stage_info
AdCampaignLearningStageInfo
	
Informações sobre se o sistema de classificação ou veiculação ainda está aprendendo para este conjunto de anúncios. Enquanto o conjunto de anúncios ainda estiver em aprendizado, poderemos desestabilizar os desempenhos de veiculação.

lifetime_budget
string numérica
	
O orçamento total do conjunto definido na moeda da conta.

lifetime_imps
int32
	
Impressões vitalícias. Disponível somente para campanhas com buying_type=FIXED_CPM.

lifetime_min_spend_target
string numérica
	
Objetivo de gasto mínimo total do conjunto de anúncios definido na moeda da sua conta. Para usar este campo, é necessário especificar o orçamento total na campanha. Essa meta não é uma garantia, mas sim o nosso melhor esforço.

lifetime_spend_cap
string numérica
	
Limite de gastos total do conjunto de anúncios definido na moeda da sua conta. Para usar este campo, é necessário especificar o orçamento total na campanha.

min_budget_spend_percentage
string numérica
	
min_budget_spend_percentage

multi_optimization_goal_weight
string
	
multi_optimization_goal_weight

name
string
	
Nome do conjunto de anúncios.

optimization_goal
enum {NONE, APP_INSTALLS, AD_RECALL_LIFT, ENGAGED_USERS, EVENT_RESPONSES, IMPRESSIONS, LEAD_GENERATION, QUALITY_LEAD, LINK_CLICKS, OFFSITE_CONVERSIONS, PAGE_LIKES, POST_ENGAGEMENT, QUALITY_CALL, REACH, LANDING_PAGE_VIEWS, VISIT_INSTAGRAM_PROFILE, ENGAGED_PAGE_VIEWS, VALUE, THRUPLAY, DERIVED_EVENTS, APP_INSTALLS_AND_OFFSITE_CONVERSIONS, CONVERSATIONS, IN_APP_VALUE, MESSAGING_PURCHASE_CONVERSION, MESSAGING_DEEP_CONVERSATION_AND_FOLLOW, SUBSCRIBERS, REMINDERS_SET, MEANINGFUL_CALL_ATTEMPT, PROFILE_VISIT, PROFILE_AND_PAGE_ENGAGEMENT, ADVERTISER_SILOED_VALUE, AUTOMATIC_OBJECTIVE, MESSAGING_APPOINTMENT_CONVERSION}
	
A meta de otimização usada pelo conjunto de anúncios.
NONE: disponível apenas no modo de leitura para campanhas criadas antes da versão 2.4.
APP_INSTALLS: otimização para pessoas com maior probabilidade de instalar o app.
AD_RECALL_LIFT: otimize para as pessoas com maior probabilidade de se lembrarem dos seus anúncios.
CLICKS: obsoleto. Disponível apenas no modo de leitura.
ENGAGED_USERS: otimize para as pessoas com maior probabilidade de realizar uma ação específica no seu app.
EVENT_RESPONSES: otimize para pessoas com maior probabilidade de participarem do seu evento.
IMPRESSIONS: exibe os anúncios quantas vezes for possível.
LEAD_GENERATION: otimize para pessoas com maior probabilidade de preencher um formulário de geração de cadastros.
QUALITY_LEAD: otimize para pessoas que provavelmente terão uma conversa mais detalhada com os anunciantes após o envio do lead.
LINK_CLICKS: otimize para alcançar pessoas que têm mais probabilidade de clicar no link do anúncio.
OFFSITE_CONVERSIONS: otimização para pessoas com maior probabilidade de fazer uma conversão no site.
PAGE_LIKES: otimize para as pessoas com maior probabilidade de curtir sua página.
POST_ENGAGEMENT: otimize para as pessoas com maior probabilidade de interagir com sua publicação.
QUALITY_CALL: otimize para pessoas com probabilidade de ligar para o anunciante.
REACH: otimize para alcançar o maior número de usuários únicos por dia ou o intervalo especificado em frequency_control_specs.
LANDING_PAGE_VIEWS: otimize para pessoas com maior probabilidade de clicar e carregar a página de destino escolhida.
VISIT_INSTAGRAM_PROFILE: otimize para visitas ao perfil do Instagram do anunciante.
VALUE: otimização para o valor de compra máximo total dentro da janela de atribuição especificada.
THRUPLAY: otimize a veiculação dos seus anúncios para alcançar as pessoas com maior probabilidade de reproduzi-los na íntegra ou por pelo menos 15 segundos.
DERIVED_EVENTS: otimize para retenção, alcançando pessoas com maior probabilidade de retornar e abrir o app novamente dentro de um período específico após a instalação. É possível escolher dois dias, o que significa que o app provavelmente será reaberto entre 24 e 48 horas após a instalação; ou sete dias, o que significa que o app provavelmente será reaberto entre 144 e 168 horas após a instalação.
APP_INSTALLS_AND_OFFSITE_CONVERSIONS: otimização para pessoas mais propensas a instalar o app e fazer uma conversão no seu site.
CONVERSATIONS: direciona anúncios para pessoas com maior probabilidade de conversar com a empresa.

optimization_sub_event
string
	
Subevento de otimização para uma meta de otimização específica. Por exemplo: o evento Sound-On para a meta de otimização Video-View-2s.

pacing_type
lista<string>
	
Define o tipo de regularidade, padrão ou usando a programação de anúncios.

promoted_object
AdPromotedObject
	
O objeto que o conjunto de anúncios promove em todos os anúncios.

recommendations
lista<AdRecommendation>
	
Se houver recomendações para o conjunto de anúncios, este campo as incluirá. Caso contrário, não será incluído na resposta. O campo não é incluído no modo de redownload.

recurring_budget_semantics
booliano
	
Se esse campo for true, seu gasto diário poderá ser maior do que o orçamento diário, mas o gasto semanal não excederá 7 vezes o orçamento diário. Para saber mais, consulte o documento Orçamento do conjunto de anúncios. Se a tag for false, o valor gasto diariamente não excederá o orçamento diário. Este campo não se aplica a orçamentos totais.

regional_regulated_categories
lista<enum>
	
Esse parâmetro é usado para especificar regional_regulated_categories. Atualmente, ele é compatível com null e os seguintes valores:
TAIWAN_FINSERV: use esse valor para declarar um conjunto de anúncios de serviços financeiros se o anúncio for direcionado para um público em Taiwan.
AUSTRALIA_FINSERV: use esse valor para declarar um conjunto de anúncios de serviços financeiros se o conjunto de anúncios for direcionado para um público na Austrália.
INDIA_FINSERV: use esse valor para declarar um conjunto de anúncios de títulos e investimentos se o público-alvo for da Índia.
TAIWAN_UNIVERSAL: use esse valor para declarar um conjunto de anúncios se ele for direcionado ao público de Taiwan.
SINGAPORE_UNIVERSAL: use esse valor para declarar um conjunto de anúncios se ele for direcionado para o público de Singapura.
THAILAND_UNIVERSAL: use esse valor para declarar um conjunto de anúncios se ele for direcionado para um público na Tailândia e você estiver vendo os erros "Beneficiário/pagador ausente" (3858634, 3858636).
BRAZIL_REGULATION: use esse valor para declarar um conjunto de anúncios se ele for direcionado para um público da Tailândia e você estiver vendo os erros "Beneficiário/pagador ausente" (3858634, 3858636).
Se um conjunto de anúncios for sobre serviços financeiros e for direcionado para Taiwan, será necessário declarar TAIWAN_FINSERV e TAIWAN_UNIVERSAL.
Exemplo: null ou [AUSTRALIA_FINSERV] ou [TAIWAN_FINSERV, TAIWAN_UNIVERSAL]

regional_regulation_identities
RegionalRegulationIdentities
	
Esse parâmetro é usado para especificar as identidades de regional_regulation_identities usadas para representar o conjunto de anúncios. Atualmente, ele é compatível com os seguintes campos:
taiwan_finserv_beneficiary: usada para a categoria TAIWAN_FINSERV
taiwan_finserv_payer: usada para a categoria TAIWAN_FINSERV
australia_finserv_beneficiary: usada para a categoria AUSTRALIA_FINSERV
australia_finserv_payer: usada para a categoria AUSTRALIA_FINSERV
india_finserv_beneficiary: usada para a categoria INDIA_FINSERV
india_finserv_payer: usada para a categoria INDIA_FINSERV
taiwan_universal_beneficiary: usada para a categoria TAIWAN_UNIVERSAL
taiwan_universal_payer: usada para a categoria TAIWAN_UNIVERSAL
singapore_universal_beneficiary: usada para a categoria SINGAPORE_UNIVERSAL
singapore_universal_payer: usada para a categoria SINGAPORE_UNIVERSAL
universal_beneficiary: usada para a categoria THAILAND_UNIVERSAL
universal_payer: usada para a categoria THAILAND_UNIVERSAL
universal_beneficiary: usada para a categoria BRAZIL_REGULATION
universal_payer: usado para a categoria BRAZIL_REGULATION
Exemplo:
regional_regulation_identities: { "taiwan_finserv_beneficiary": <verified_identity_id>, "taiwan_finserv_payer": <verified_identity_id>, "taiwan_universal_beneficiary": <verified_identity_id>, "taiwan_universal_payer": <verified_identity_id>, }
Durante a criação e atualização, os campos de identidade transmitidos precisam corresponder às categorias declaradas. As identidades do beneficiário e do pagador devem ser incluídas e podem usar a mesma identificação.
Para atualizar as identidades de um conjunto de anúncios existente, você precisa passar novos valores para as categorias e identidades para substituir a identificação ou null para remover a identificação existente.
Por exemplo:
Após a criação, regional_regulated_categories será [TAIWAN_FINSERV, TAIWAN_UNIVERSAL], e regional_regulation_identities será
regional_regulation_identities: { "taiwan_finserv_beneficiary": <id_123>, "taiwan_finserv_payer": <id_123>, "taiwan_universal_beneficiary": <id_456>, "taiwan_universal_payer": <id_456>, }
Para atualização, transmitindo [TAIWAN_UNIVERSAL] e regional_regulation_identities: { "taiwan_finserv_beneficiary": null "taiwan_finserv_payer": null, "taiwan_universal_beneficiary": <id_789>, "taiwan_universal_payer": <id_789>, }
removerá a declaração TAIWAN_FINSERV e atualizará o ID de identidades de TAIWAN_UNIVERSAL

review_feedback
string
	
Análises de anúncios de criativo dinâmico

rf_prediction_id
id
	
Identificação da previsão de alcance e frequência.

source_adset
Conjunto de anúncios
	
O conjunto de anúncios de origem do qual este conjunto de anúncios foi copiado.

source_adset_id
string numérica
	
A identificação do conjunto de anúncios de origem do qual este conjunto de anúncios foi copiado.

start_time
datetime
	
É a hora de início, no registro de data e hora UNIX (UTC).

status
enum {ACTIVE, PAUSED, DELETED, ARCHIVED}
	
O status definido no nível do conjunto de anúncios. Pode ser diferente do status efetivo devido à campanha principal. O campo retorna o mesmo valor que configured_status e é a sugestão de uso.

targeting
Direcionamento
	
Direcionamento

targeting_optimization_types 

list<KeyValue:string,int32>
	
Opções de direcionamento que são flexíveis e usadas como um sinal para otimização

time_based_ad_rotation_id_blocks
list<list<integer>>
	
Especifique o criativo do anúncio que será exibido em intervalos de datas personalizados de uma campanha como uma matriz. Uma lista de números de identificação de grupos de anúncios. A lista de anúncios que serão exibidos em cada período de uma programação específica. Por exemplo, exiba o primeiro anúncio no grupo de anúncios para o primeiro intervalo de datas, o segundo anúncio para o segundo intervalo de datas e assim por diante. É possível exibir mais de um anúncio por intervalo de datas fornecendo mais de uma identificação do anúncio por matriz. Por exemplo, defina time_based_ad_rotation_id_blocks como [[1], [2, 3], [1, 4]]. No primeiro intervalo de datas, mostre o anúncio 1; no segundo, exiba o anúncio 2 e o anúncio 3; e no último, mostre o anúncio 1 e o anúncio 4. Use com time_based_ad_rotation_intervals para especificar intervalos de datas.

time_based_ad_rotation_intervals
list<unsigned int32>
	
O intervalo de datas em que um criativo do anúncio específico é exibido durante a campanha. Forneça intervalos de datas em uma matriz de registros de data e hora UNIX, sendo que cada registro representa a hora de início de cada intervalo. Por exemplo, uma campanha de 3 dias, que vai de 9 de maio às 00h00 até 11 de maio às 23h59 (PST), pode ter três intervalos de datas. O primeiro intervalo de datas começa em 9 de maio às 00h00 e termina em 9 de maio às 23h59, o segundo começa em 10 de maio às 00h00 e termina em 10 de maio às 23h59, e o último começa em 11 de maio às 00h00 e termina em 11 de maio às 23h59. O primeiro registro de data e hora deve corresponder à hora de início da campanha. O último registro de data e hora deve ser pelo menos 1 hora antes do término da campanha. É necessário fornecer pelo menos dois intervalos de datas. Todos os intervalos de datas devem cobrir a duração inteira da campanha. Assim, nenhum intervalo de datas pode exceder a duração da campanha. Use com time_based_ad_rotation_id_blocks para especificar o criativo do anúncio em cada intervalo de datas.

updated_time
datetime
	
É a hora em que o conjunto de anúncios foi atualizado.

use_new_app_click
booliano
	
Se for definido, permitirá que anúncios de engajamento com o app para celular otimizem para LINK_CLICKS.

value_rule_set_id
string numérica
	
value_rule_set_id
Bordas
Borda	Descrição

activities
Borda<AdActivity>
	
As atividades do conjunto de anúncios.

ad_studies
Borda<AdStudy>
	
Os estudos de anúncio que contêm este conjunto de anúncios.

adcreatives
Borda<AdCreative>
	
Os criativos do conjunto de anúncios.

adrules_governed
Borda<AdRule>
	
Regras de anúncios que regem o conjunto de anúncios. Por padrão, retorna apenas regras que mencionam diretamente o conjunto de anúncios por ID ou indiretamente por meio do conjunto entity_type.

ads
Borda<Adgroup>
	
Os anúncios sob este conjunto de anúncios.

asyncadrequests
Borda<AdAsyncRequest>
	
Solicitações de anúncio assíncronas para o conjunto de anúncios.

copies
Borda<AdCampaign>
	
As cópias do conjunto de anúncios.

delivery_estimate
Borda<AdCampaignDeliveryEstimate>
	
A estimativa de veiculação do conjunto de anúncios.

message_delivery_estimate
Borda<MessageDeliveryEstimate>
	
Estimativa de veiculação da campanha de mensagens de marketing

targetingsentencelines
Borda<TargetingSentenceLine>
	
A frase descritiva de direcionamento para o conjunto de anúncios.
Códigos de erro
Código de erro	Descrição

2635
	
Você está chamando uma versão obsoleta da API de Anúncios. Atualize para a versão mais recente.

100
	
Parâmetro inválido

80004
	
Houve muitas chamadas para esta conta de anúncios. Espere um pouco e tente de novo. Para obter mais informações, consulte /docs/graph-api/overview/rate-limiting#ads-management.

190
	
Token de acesso OAuth 2.0 inválido

200
	
Erro de permissões

2.500
	
Erro ao analisar a consulta da Graph API.
Criação
Na versão 20.0 e posteriores, o objetivo de otimização de impressões está obsoleto para o antigo objetivo de engajamento com o post e o tipo de destino ON_POST.
Exemplos
Faça a validação de um conjunto de anúncios com um orçamento diário em que o objetivo da campanha esteja definido como APP_INSTALLS.
curl -X POST \
  -F 'name="Mobile App Installs Ad Set"' \
  -F 'daily_budget=1000' \
  -F 'bid_amount=2' \
  -F 'billing_event="IMPRESSIONS"' \
  -F 'optimization_goal="APP_INSTALLS"' \
  -F 'campaign_id="<AD_CAMPAIGN_ID>"' \
  -F 'promoted_object={
       "application_id": "<APP_ID>",
       "object_store_url": "<APP_STORE_URL>"
     }' \
  -F 'targeting={
       "device_platforms": [
         "mobile"
       ],
       "facebook_positions": [
         "feed"
       ],
       "geo_locations": {
         "countries": [
           "US"
         ]
       },
       "publisher_platforms": [
         "facebook",
         "audience_network"
       ],
       "user_os": [
         "IOS"
       ]
     }' \
  -F 'status="PAUSED"' \
  -F 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/adsets
Considerações
Validações de lance/orçamento
Observações:
Todos os valores desta seção estão em dólar americano.
Moedas diferentes têm limites mínimos de orçamento diário diferentes.
Os valores mínimos são definidos em termos do orçamento diário, mas também se aplicam a orçamentos totais.
O orçamento mínimo leva em conta o orçamento total gasto.
Ao criar um conjunto de anúncios, haverá um orçamento mínimo para diferentes eventos de cobrança (cliques, impressões, ações). Se o orçamento diário mínimo for de US$ 5, uma campanha com duração de 5 dias precisará de pelo menos US$ 25 no orçamento.
Os valores de orçamento exibidos são apenas para fins ilustrativos e podem mudar com base na situação.
Se bid_strategy for definida como LOWEST_COST_WITHOUT_CAP no conjunto de anúncios:
Evento de cobrança	Orçamento diário mínimo

Impressões
	
US$ 0,50

Cliques/curtidas/visualizações do vídeo
	
$2.50

Ações de baixa frequência (inclui instalações do app para celular, obtenção da oferta ou instalação do app no canvas)
	
US$ 40 Importante: este orçamento diário mínimo é o mesmo para todos os países.
Se bid_strategy for definida como LOWEST_COST_WITH_BID_CAP no conjunto de anúncios:
Evento de cobrança	Orçamento diário mínimo

Impressões
	
Pelo menos a bid_amount. Por exemplo, se o valor do lance for US$ 10, esse será o orçamento mínimo necessário.

Cliques/ações
	
5x bid_amount para um clique ou ação. Por exemplo, se o valor do lance for US$ 5,00 por clique/ação, o orçamento mínimo exigido será de US$ 25,00.
Os orçamentos em moedas diferentes de USD serão convertidos e validados no momento da criação do conjunto de anúncios.
Para anúncios pertencentes a contas de anúncios de países na lista abaixo, os valores mínimos são 2x os valores das tabelas. Por exemplo, se o evento de cobrança for uma impressão, o orçamento diário mínimo será de US$ 0,50, mas nos países a seguir, esse valor mínimo seria de US$ 1,00:
Austrália, Áustria, Bélgica, Canadá, Dinamarca, Finlândia, França, Alemanha, Grécia, Hong Kong, Israel, Itália, Japão, Países Baixos, Nova Zelândia, Noruega, Singapura, Coreia do Sul, Espanha, Suécia, Suíça, Taiwan, Reino Unido, Estados Unidos da América.
A única exceção a essa regra são as ações de baixa frequência quando bid_strategy é LOWEST_COST_WITHOUT_CAP.
Publicação da Página direcionada por localidade
Se você promover uma publicação da Página que tenha sido direcionada por localidade, o direcionamento do conjunto de anúncios deverá incluir a mesma localidade ou um subconjunto dela.
Por exemplo, se a publicação da Página for direcionada às localidades 6 (inglês dos EUA) e 24 (inglês do Reino Unido), o conjunto de anúncios deverá ser direcionado a uma ou mais das mesmas localidades.
Anúncios para aplicativos móveis
Os conjuntos de anúncios de app para celular precisam
ser usado em conjunto com os campos de especificação de direcionamentouser_device e user_os
ter um objetivo MOBILE_APP_* na campanha
Anúncios do app para computador
Os conjuntos de anúncios de app para computador precisam
incluir uma especificação de direcionamento de
'page_types':['desktopfeed'] ou
'page_types':['rightcolumn'] ou
'page_types':['desktop'] junto com as outras opções de direcionamento que você selecionou.
incluir um objetivo CANVAS_APP_*;
Expansão de semelhantes
A partir da versão 13.0, para conjuntos de anúncios recém-criados com otimização de valor, de conversões ou de eventos do app, a expansão de semelhantes ficará ativa por padrão e não poderá ser desativada. Ao obter um conjunto de anúncios com otimização de valor, de conversões ou de eventos do aplicativo, retornaremos uma nova propriedade de semelhantes no mapa targeting_optimization_types, indicando que a expansão de semelhantes está ativada e complementa a propriedade detailed_targeting existente para a expansão do direcionamento detalhado.
Como direcionar localizações regulamentadas pelo RSD (UE)
Para conjuntos de anúncios direcionados à UE e/ou territórios associados, os campos dsa_payor e dsa_beneficiary são obrigatórios. As informações fornecidas nesses 2 campos serão mostradas aos usuários finais para indicar o pagador e o beneficiário do anúncio.
Solicitação
Inclua os seguintes campos em uma chamada de API para o ponto de extremidade /{adset_id}.
{
  "dsa_payor": "<PAYOR_NAME>",
  "dsa_beneficiary": "<BENEFICIARY_NAME>"
  ...
}
Campos
Nome	Descrição

dsa_payor
string (máx. 512 caracteres)
	
O pagador de todos os anúncios neste conjunto de anúncios.

dsa_beneficiary
string (máx. 512 caracteres)
	
O beneficiário de todos os anúncios neste conjunto de anúncios.
Se esses campos não forem fornecidos, a API poderá retornar os seguintes erros:
Erro de pagamento não identificado
{
  "error": {
    "message": "Invalid parameter",
    "type": "FacebookApiException",
    "code": 100,
    "error_data": "{\"blame_field_specs\":[[\"dsa_payor\"]]}",
    "error_subcode": 3858079,
    "is_transient": false,
    "error_user_title": "No payor provided in DSA regulated region",
    "error_user_msg": "The DSA requires ads to provide payor information in regulated regions. Updating/creating ad needs to provide payor of the ad.",
    "fbtrace_id": "fbtrace_id"
  },
  "__fb_trace_id__": "fbtrace_id",
  "__www_request_id__": "request_id"
}
Erro de beneficiário ausente
{
  "error": {
    "message": "Invalid parameter",
    "type": "FacebookApiException",
    "code": 100,
    "error_data": "{\"blame_field_specs\":[[\"dsa_beneficiary\"]]}",
    "error_subcode": 3858081,
    "is_transient": false,
    "error_user_title": "No payor/beneficiary provided in DSA regulated location",
    "error_user_msg": "The DSA requires ads to provide beneficiary information in regulated regions. Updating/creating ad needs to provide beneficiary of the ad.",
    "fbtrace_id": "fbtrace_id"
  },
  "__fb_trace_id__": "fbtrace_id",
  "__www_request_id__": "request_id"
}
/{ad_set_id}/copies
É possível fazer uma solicitação POST à borda copies a partir dos seguintes caminhos:
/{ad_set_id}/copies
Ao publicar nessa borda, um AdSet será criado.
Parâmetros
Parâmetro	Descrição

campaign_id
string numérica ou número inteiro
	
Identificação única de uma campanha para torná-la principal da cópia. A cópia herda todas as configurações da campanha, como o orçamento da campanha principal. Ignore se quiser manter a cópia sob a campanha principal.

deep_copy
booleano
	

Valor padrão: false
Indica se todos os anúncios secundários serão copiados. Limites: o número total de anúncios filhos a serem copiados não deve exceder 3 para uma chamada síncrona e 51 para uma assíncrona.

end_time
datetime
	
O horário de término do conjunto, por exemplo, 2015-03-12 23:59:59-07:00 ou 2015-03-12 23:59:59 PDT. Registro de data e hora UNIX (UTC). Ao criar um conjunto com orçamento diário, especifique end_time=0 para definir que ele é contínuo e não tem data de término. Se não for definido, o conjunto de anúncios copiado herdará o tempo de término do conjunto original.

rename_options
JSON ou matrizes semelhantes a objetos
	
Opções de renomeação
Show child parameters

start_time
datetime
	
A hora de início do conjunto, por exemplo, 2015-03-12 23:59:59-07:00 ou 2015-03-12 23:59:59 PDT. Registro de data e hora UNIX (UTC). Se não for definido, o conjunto de anúncios copiado herdará a hora de início do conjunto original.

status_option
enum {ACTIVE, PAUSED, INHERITED_FROM_SOURCE}
	

Valor padrão: PAUSED
ACTIVE: o conjunto de anúncios copiado terá o status ativo. PAUSED: o conjunto de anúncios copiado terá o status pausado. INHERITED_FROM_SOURCE: o conjunto de anúncios copiado terá o status do conjunto original.
Tipo de retorno
Este ponto de extremidade é compatível com read-after-write e lê o nó representado por copied_adset_id no tipo de retorno.

Struct  {
copied_adset_id: numeric string,
ad_object_ids:  List  [ Struct  {
ad_object_type: enum {
unique_adcreative,
ad,
ad_set,
campaign,
opportunities,
privacy_info_center,
topline,
ad_account,
product},
source_id: numeric string,
copied_id: numeric string,
}],
}
Códigos de erro
Código de erro	Descrição

100
	
Parâmetro inválido

200
	
Erro de permissões

190
	
Token de acesso OAuth 2.0 inválido

2695
	
A criação do conjunto de anúncios atingiu o limite do grupo de campanhas (ios14).

2635
	
Você está chamando uma versão obsoleta da API de Anúncios. Atualize para a versão mais recente.
/act_{ad_account_id}/adsets
É possível fazer uma solicitação POST à borda adsets a partir dos seguintes caminhos:
/act_{ad_account_id}/adsets
Ao publicar nessa borda, um AdSet será criado.
Exemplo
Selecionar idioma
HTTP
PHP SDK
JavaScript SDK
Android SDK
iOS SDK
cURL
POST /v25.0/act_<AD_ACCOUNT_ID>/adsets HTTP/1.1
Host: graph.facebook.com

name=My+First+Adset&lifetime_budget=20000&start_time=2026-05-12T10%3A45%3A09-0700&end_time=2026-05-22T10%3A45%3A09-0700&campaign_id=%3CAD_CAMPAIGN_ID%3E&bid_amount=100&billing_event=LINK_CLICKS&optimization_goal=LINK_CLICKS&targeting=%7B%22facebook_positions%22%3A%5B%22feed%22%5D%2C%22geo_locations%22%3A%7B%22countries%22%3A%5B%22US%22%5D%7D%2C%22publisher_platforms%22%3A%5B%22facebook%22%2C%22audience_network%22%5D%7D&status=PAUSED

Teste no Explorador da Graph API
Para saber como usar a Graph API, leia nosso guia Como usar a Graph API
Parâmetros
Parâmetro	Descrição

adlabels
lista<Object>
	
Especifica uma lista de rótulos que serão associados ao objeto. Este campo é opcional.

ad_set_goal
Object
	
A estratégia de ciclo de vida do cliente para o conjunto de anúncios. Disponível apenas para conjuntos de anúncios de Vendas (OUTCOME_SALES). Caso contrário, a gravação será rejeitada com o erro 1870252. Escreve a mesclagem com a meta existente: um subcampo omitido mantém seu valor atual, e a type efetiva é a type enviada ou, se omitida, a existente. Não é permitido usar uma meta que não seja BROAD em um conjunto de anúncios cuja campanha esteja em uma categoria de anúncio especial restrita (moradia, emprego, crédito, produtos e serviços financeiros, educação ou jogos de azar e jogos online). Essas escritas são rejeitadas com o erro 1870261.
Show child parameters

adset_schedule
lista<Object>
	
Programação do conjunto de anúncios, representando uma programação de veiculação para um único dia.
Show child parameters

attribution_spec
list<JSON object>
	
Especificação da atribuição de conversão usada ao atribuir conversões para otimização. As durações de janela compatíveis diferem conforme a meta de otimização e o objetivo da campanha.
Show child parameters

automatic_manual_state
enum{UNSET, AUTOMATIC, MANUAL}
	
automatic_manual_state

bid_amount
integer
	
Limite de lance ou custo-alvo do conjunto de anúncios. O limite de lance usado na estratégia de lance de menor custo é definido como o lance máximo que você quer pagar por um resultado com base em optimization_goal. O custo-alvo usado em uma estratégia de lance de custo-alvo permite que o Facebook dê lances que atendam ao seu objetivo, em média, e mantenha os custos estáveis à medida que você gasta. Se um nível de anúncio bid_amount for especificado, a atualização desse valor substituirá o lance no nível de anúncio anterior. Exceto quando você usa alcance e frequência, bid_amount será necessário se bid_strategy estiver definido como LOWEST_COST_WITH_BID_CAP ou COST_CAP.
A unidade do valor do lance é centavos para moedas como USD, EUR e a unidade básica para moedas como JPY, KRW. O valor do lance para anúncios com IMPRESSION ou REACH como billing_event é por 1.000 ocorrências e deve ser de pelo menos 2 centavos de dólar americano ou mais. Para anúncios com outras billing_events, o valor do lance é para cada ocorrência e tem um valor mínimo de um centavo dos Estados Unidos. Os valores mínimos de lance de outras moedas são semelhantes aos valores em dólar americano fornecidos.

bid_strategy 

enum{LOWEST_COST_WITHOUT_CAP, LOWEST_COST_WITH_BID_CAP, COST_CAP, LOWEST_COST_WITH_MIN_ROAS}
	
Escolha a estratégia de lance para este conjunto de anúncios que seja adequada às suas metas de negócios específicas. Cada estratégia apresenta vantagens e desvantagens e pode estar disponível para determinadas optimization_goals:
LOWEST_COST_WITHOUT_CAP: projetado para obter o máximo de resultados para seu orçamento com base no seu conjunto de anúncios optimization_goal sem limitar o valor do lance. Essa é a melhor estratégia se você se importar mais com a relação custo-benefício. No entanto, com essa estratégia, pode ser mais difícil obter custos médios estáveis à medida que você gasta. Essa estratégia também é conhecida como lance automático. Saiba mais em Central de Ajuda de Anúncios, Sobre as estratégias de lance: menor custo⁠.
LOWEST_COST_WITH_BID_CAP: projetado para obter o máximo de resultados para seu orçamento com base no conjunto de anúncios optimization_goal ao mesmo tempo que limita o lance real para o valor especificado. Com um limite de lance, você tem mais controle sobre o custo por evento de otimização real. Porém, se você definir um limite muito baixo, poderá obter menos veiculações de anúncios. Se você selecionar essa opção, será necessário fornecer um limite de lance com o campo bid_amount. Observação: durante a criação, essa estratégia de lance será definida se você fornecer somente bid_amount. Esta estratégia também é conhecida como lance manual de custo máximo. Saiba mais em Central de Ajuda de Anúncios, Sobre estratégias de lance: menor custo⁠.

Observações:
Se você habilitar a otimização do orçamento da campanha, defina bid_strategy no nível da campanha principal.
A estratégia de lances TARGET_COST ficou obsoleta a partir da versão 9.0 da API de Marketing.

billing_event
enum{APP_INSTALLS, CLICKS, IMPRESSIONS, LINK_CLICKS, NONE, OFFER_CLAIMS, PAGE_LIKES, POST_ENGAGEMENT, THRUPLAY, PURCHASE, LISTING_INTERACTION}
	
O evento de cobrança em uso pelo conjunto de anúncios:
APP_INSTALLS: pague quando as pessoas instalarem seu app.
CLICKS: obsoleto.
IMPRESSIONS: pague quando os anúncios forem exibidos às pessoas.
LINK_CLICKS: pague quando as pessoas clicarem no link do anúncio.
OFFER_CLAIMS: pague quando as pessoas obtiverem a oferta.
PAGE_LIKES: pague quando as pessoas curtirem sua página.
POST_ENGAGEMENT: pague quando as pessoas interagirem com sua publicação.
VIDEO_VIEWS: pague quando as pessoas assistirem a seus anúncios em vídeo por pelo menos 10 segundos.
THRUPLAY: pague por anúncios que são reproduzidos até o fim ou por pelo menos 15 segundos.

brand_safety_config
Objeto JSON
	
Opções de configuração de campanha de adequação e segurança para marcas.
Show child parameters

budget_schedule_specs
list<JSON or object-like arrays>
	
Os períodos iniciais de alta demanda a serem criados com o conjunto de anúncios.
Forneça a lista de time_start, time_end,budget_value e budget_value_type.
Por exemplo,
-F 'budget_schedule_specs=[{
"time_start":1699081200,
"time_end":1699167600,
"budget_value":100,
"budget_value_type":"ABSOLUTE"
}]'
Consulte Período de alta demanda para obter mais detalhes sobre cada campo.
Show child parameters

budget_source
enum{NONE, RMN}
	
budget_source

budget_split_set_id
string numérica ou número inteiro
	
budget_split_set_id

campaign_attribution
enum{}
	
campaign_attribution

campaign_id
string numérica ou número inteiro
	
A campanha de anúncios à qual você quer adicionar o conjunto de anúncios.

campaign_spec
Especificação da campanha
	
Forneça name, objective e buying_type para a campanha que você quer criar. Caso contrário, você precisa fornecer campaign_id para uma campanha de anúncios existente. Por exemplo:
-F 'campaign_spec={
"name": "Inline created campaign",
"objective": "CONVERSIONS",
"buying_type": "AUCTION"
}'

Consulte a tabela de mapeamento de experiências de anúncios orientados para resultados para encontrar novos objetivos e os tipos de destino, metas de otimização e objetos promovidos correspondentes.

contextual_bundling_spec
Object
	
configurações do pacote contextual para dar suporte à veiculação de anúncios em superfícies contextuais do Facebook
Show child parameters

creative_sequence
list<numeric string or integer>
	
Ordem da sequência de grupos de anúncios a ser exibida aos usuários.

daily_budget
int64
	
Orçamento diário definido na moeda da sua conta, permitido apenas para conjuntos de anúncios com duração (diferença entre end_time e start_time) maior que 24 horas.
daily_budget ou lifetime_budget precisa ser maior que "0".

daily_imps
int64
	
Impressões diárias. Disponível somente para campanhas com buying_type=FIXED_CPM.

daily_min_spend_target
int64
	
Objetivo de gasto mínimo diário do conjunto de anúncios definido na moeda da sua conta. Para usar este campo, é preciso especificar um orçamento diário na campanha. Essa meta não é uma garantia, mas sim o nosso melhor esforço.

daily_spend_cap
int64
	
Limite de gastos diário do conjunto de anúncios definido na moeda da sua conta. Para usar este campo, é preciso especificar um orçamento diário na campanha. Defina o valor como 922337203685478 para remover o limite de gastos.

destination_type
enum{WEBSITE, APP, MESSENGER, APPLINKS_AUTOMATIC, WHATSAPP, INSTAGRAM_DIRECT, FACEBOOK, MESSAGING_MESSENGER_WHATSAPP, MESSAGING_INSTAGRAM_DIRECT_MESSENGER, MESSAGING_INSTAGRAM_DIRECT_MESSENGER_WHATSAPP, MESSAGING_INSTAGRAM_DIRECT_WHATSAPP, SHOP_AUTOMATIC, ON_AD, ON_POST, ON_EVENT, ON_VIDEO, ON_PAGE, INSTAGRAM_PROFILE, FACEBOOK_PAGE, INSTAGRAM_PROFILE_AND_FACEBOOK_PAGE, INSTAGRAM_LIVE, FACEBOOK_LIVE, IMAGINE}
	
Destino dos anúncios neste conjunto de anúncios. Opções aceitas: Website, App, Messenger, INSTAGRAM_DIRECT, INSTAGRAM_PROFILE.

dsa_beneficiary
string
	
dsa_beneficiary

dsa_payor
string
	
dsa_payor

end_time
datetime
	
Hora de término, obrigatória quando lifetime_budget for especificada. Por exemplo, 2015-03-12 23:59:59-07:00 ou 2015-03-12 23:59:59 PDT. Ao criar um conjunto com orçamento diário, especifique end_time=0 para definir o conjunto como "em andamento", sem data de término. Registro de data e hora UNIX (UTC).

execution_options
list<enum{validate_only, include_recommendations}>
	

Valor padrão: Set
Uma configuração de execução
validate_only: quando esta opção for especificada, a chamada de API não realizará a mutação, mas executará as regras de validação em relação aos valores de cada campo.
include_recommendations: esta opção não pode ser usada sozinha. Quando ela for utilizada, serão incluídas recomendações para configuração do objeto de anúncio. Uma seção específica para recomendação será incluída na resposta, mas somente se existirem recomendações para tal especificação.
Se a chamada passar no processo de validação ou análise, a resposta será {"success": true}. Caso a chamada não seja aprovada, um erro será retornado com mais detalhes. Essas opções podem ser usadas para melhorar qualquer interface do usuário para exibir erros com muito mais antecedência, por exemplo, assim que um novo valor é digitado em qualquer campo correspondente a este objeto de anúncio, em vez de na etapa de carregamento/salvamento ou após a revisão.

existing_customer_budget_percentage
int64
	
existing_customer_budget_percentage

frequency_control_specs
lista<Object>
	
Uma matriz de especificações de controle de frequência para este conjunto de anúncios. As gravações nesse campo só estão disponíveis em conjuntos de anúncios em que REACH e THRUPLAY são a meta de desempenho.
Show child parameters

is_dc_follow_optimized
booleano
	
is_dc_follow_optimized

is_dynamic_creative 

booleano
	
Indica que o conjunto de anúncios só pode ser usado para criativos dinâmicos. É possível criar anúncios de criativo dinâmico neste conjunto de anúncios. O padrão é false

is_sac_cfca_terms_certified
booleano
	
is_sac_cfca_terms_certified

lifetime_budget
int64
	
Orçamento total, definido na moeda da conta. Se for especificado, será preciso definir também um end_time.
daily_budget ou lifetime_budget precisa ser maior que "0".

lifetime_imps
int64
	
Impressões vitalícias. Disponível somente para campanhas com buying_type=FIXED_CPM.

lifetime_min_spend_target
int64
	
Objetivo de gasto mínimo total do conjunto de anúncios definido na moeda da sua conta. Para usar este campo, é necessário especificar o orçamento total na campanha. Essa meta não é uma garantia, mas sim o nosso melhor esforço.

lifetime_spend_cap
int64
	
Limite de gastos total do conjunto de anúncios definido na moeda da sua conta. Para usar este campo, é necessário especificar o orçamento total na campanha. Defina o valor como 922337203685478 para remover o limite de gastos.

max_budget_spend_percentage
int64
	
max_budget_spend_percentage

min_budget_spend_percentage
int64
	
min_budget_spend_percentage

multi_event_conversion_attribution_window_seconds
int64
	
multi_event_conversion_attribution_window_seconds

multi_optimization_goal_weight
enum{UNDEFINED, BALANCED, PREFER_INSTALL, PREFER_EVENT}
	
multi_optimization_goal_weight

name
string
	
Nome do conjunto de anúncios, comprimento máximo de 400 caracteres.
obrigatório
aceita emojis

optimization_goal
enum{NONE, APP_INSTALLS, AD_RECALL_LIFT, ENGAGED_USERS, EVENT_RESPONSES, IMPRESSIONS, LEAD_GENERATION, QUALITY_LEAD, LINK_CLICKS, OFFSITE_CONVERSIONS, PAGE_LIKES, POST_ENGAGEMENT, QUALITY_CALL, REACH, LANDING_PAGE_VIEWS, VISIT_INSTAGRAM_PROFILE, ENGAGED_PAGE_VIEWS, VALUE, THRUPLAY, DERIVED_EVENTS, APP_INSTALLS_AND_OFFSITE_CONVERSIONS, CONVERSATIONS, IN_APP_VALUE, MESSAGING_PURCHASE_CONVERSION, MESSAGING_DEEP_CONVERSATION_AND_FOLLOW, SUBSCRIBERS, REMINDERS_SET, MEANINGFUL_CALL_ATTEMPT, PROFILE_VISIT, PROFILE_AND_PAGE_ENGAGEMENT, ADVERTISER_SILOED_VALUE, AUTOMATIC_OBJECTIVE, MESSAGING_APPOINTMENT_CONVERSION}
	
Para o que o conjunto de anúncios está otimizando.
APP_INSTALLS: otimização para pessoas com maior probabilidade de instalar o app.
ENGAGED_USERS: otimizará para as pessoas com maior probabilidade de realizar uma ação específica no seu aplicativo.
EVENT_RESPONSES: otimizará para as pessoas com maior probabilidade de participarem do seu evento.
IMPRESSIONS – exibe o anúncio o maior número de vezes possível.
LEAD_GENERATION: otimizará para pessoas com maior probabilidade de preencher um formulário de geração de cadastros.
LINK_CLICKS: otimizará para pessoas com maior probabilidade de clicar no link do anúncio.
OFFER_CLAIMS: otimizará para as pessoas com maior probabilidade de reivindicar a oferta.
OFFSITE_CONVERSIONS: otimização para pessoas com maior probabilidade de fazer uma conversão no site.
PAGE_ENGAGEMENT: otimizará para pessoas com maior probabilidade de interagir com a página.
PAGE_LIKES: otimizará para pessoas com maior probabilidade de curtir a página.
POST_ENGAGEMENT: otimizará para pessoas com maior probabilidade de interagir com sua publicação.
REACH: otimize para alcançar os usuários únicos de cada dia ou o intervalo especificado em frequency_control_specs.
SOCIAL_IMPRESSIONS: aumente o número de impressões com contexto social. Por exemplo, com os nomes de um ou mais amigos do usuário anexados ao anúncio que já curtiram a página ou instalaram o aplicativo.
VALUE: otimização para o valor de compra máximo total dentro da janela de atribuição especificada.
THRUPLAY: otimizará a veiculação dos anúncios para as pessoas com maior probabilidade de reproduzir seu anúncio até o fim ou por pelo menos 15 segundos.
AD_RECALL_LIFT: otimize para as pessoas com maior probabilidade de se lembrarem dos seus anúncios.
VISIT_INSTAGRAM_PROFILE: otimize para visitas ao perfil do Instagram do anunciante.

optimization_sub_event
enum{NONE, VIDEO_SOUND_ON, TRIP_CONSIDERATION, TRAVEL_INTENT, TRAVEL_INTENT_NO_DESTINATION_INTENT, TRAVEL_INTENT_BUCKET_01, TRAVEL_INTENT_BUCKET_02, TRAVEL_INTENT_BUCKET_03, TRAVEL_INTENT_BUCKET_04, TRAVEL_INTENT_BUCKET_05, POST_INTERACTION}
	
Subevento de otimização para uma meta de otimização específica (por exemplo, o evento Sound-On para a meta de otimização Video-View-2s).

pacing_type
lista<string>
	
Define o tipo de regularidade, padrão por predefinição ou usando a programação de anúncios.

promoted_object
Objeto
	
O objeto que o conjunto de anúncios promove em todos os anúncios. Obrigatório para determinados objetivos da campanha.
CONVERSÕES
pixel_id (Identificação do pixel de conversão)
pixel_id (identificação do pixel do Facebook) e custom_event_type
pixel_id (ID do pixel do Facebook), pixel_rule e custom_event_type
event_id (ID de evento do Facebook) e custom_event_type
application_id, object_store_url e custom_event_type para eventos do app para celular
offline_conversion_data_set_id (ID do conjunto de dados offline) e custom_event_type para conversões offline
PAGE_LIKES
page_id
OFFER_CLAIMS
page_id
LINK_CLICKS
application_id e object_store_url para cliques no link de engajamento com o app para celular ou app Canvas.
APP_INSTALLS
application_id e object_store_url
se optimization_goal for OFFSITE_CONVERSIONS
application_id, object_store_url e custom_event_type (eventos padrão)
application_id, object_store_url, custom_event_type = OTHER e custom_event_str (eventos personalizados)
PRODUCT_CATALOG_SALES
product_set_id
product_set_id e custom_event_type
Quando optimization_goal for LEAD_GENERATION, page_id precisará ser transmitido como promoted_object.

Consulte a tabela de mapeamento de experiências de anúncios orientados para resultados para encontrar novos objetivos e os tipos de destino, metas de otimização e objetos promovidos correspondentes.
Show child parameters

relative_value
float
	
relative_value

rf_prediction_id
string numérica ou número inteiro
	
Identificação da previsão de alcance e frequência.

source_adset_id
string numérica ou número inteiro
	
A identificação do conjunto de anúncios de origem do qual o anúncio foi copiado (se aplicável).

start_time
datetime
	
A hora de início do conjunto, por exemplo, 2015-03-12 23:59:59-07:00 ou 2015-03-12 23:59:59 PDT. Registro de data e hora UNIX (UTC).

status
enum{ACTIVE, PAUSED, DELETED, ARCHIVED}
	
Apenas ACTIVE e PAUSED são válidos para criação. Os outros status podem ser usados para atualização. Se for definido como PAUSED, todos os respectivos anúncios ativos serão pausados e terão um status efetivo de ADSET_PAUSED.

targeting
Objeto de direcionamento
	
A estrutura de direcionamento de um conjunto de anúncios. “countries” é obrigatório. Consulte direcionamento.

time_based_ad_rotation_id_blocks
list<list<int64>>
	
Especifique o criativo do anúncio que será exibido em intervalos de datas personalizados de uma campanha como uma matriz. Uma lista de números de identificação de grupos de anúncios. A lista de anúncios que serão exibidos em cada período de uma programação específica. Por exemplo, exiba o primeiro anúncio no grupo de anúncios para o primeiro intervalo de datas, o segundo anúncio para o segundo intervalo de datas e assim por diante. É possível exibir mais de um anúncio por intervalo de datas fornecendo mais de uma identificação do anúncio por matriz. Por exemplo, defina time_based_ad_rotation_id_blocks como [[1], [2, 3], [1, 4]]. No primeiro intervalo de datas, mostre o anúncio 1; no segundo, exiba o anúncio 2 e o anúncio 3; e no último, mostre o anúncio 1 e o anúncio 4. Use com time_based_ad_rotation_intervals para especificar intervalos de datas.

time_based_ad_rotation_intervals
lista<int64>
	
O intervalo de datas em que um criativo do anúncio específico é exibido durante a campanha. Forneça intervalos de datas em uma matriz de registros de data e hora UNIX, sendo que cada registro representa a hora de início de cada intervalo. Por exemplo, uma campanha de 3 dias, que vai de 9 de maio às 00h00 até 11 de maio às 23h59 (PST), pode ter três intervalos de datas. O primeiro intervalo de datas começa em 9 de maio às 00h00 e termina em 9 de maio às 23h59, o segundo começa em 10 de maio às 00h00 e termina em 10 de maio às 23h59, e o último começa em 11 de maio às 00h00 e termina em 11 de maio às 23h59. O primeiro registro de data e hora deve corresponder à hora de início da campanha. O último registro de data e hora deve ser pelo menos 1 hora antes do término da campanha. É necessário fornecer pelo menos dois intervalos de datas. Todos os intervalos de datas devem cobrir a duração inteira da campanha. Assim, nenhum intervalo de datas pode exceder a duração da campanha. Use com time_based_ad_rotation_id_blocks para especificar o criativo do anúncio em cada intervalo de datas.

time_start
datetime
	
Hora de início

time_stop
datetime
	
Hora de encerramento.

tune_for_category
enum{NONE, EMPLOYMENT, HOUSING, CREDIT, ISSUES_ELECTIONS_POLITICS, ONLINE_GAMBLING_AND_GAMING, FINANCIAL_PRODUCTS_SERVICES}
	
tune_for_category

value_rule_set_id
string numérica ou número inteiro
	
Identificação do conjunto de regras de valor

value_rules_applied
booleano
	
value_rules_applied
Tipo de retorno
Este ponto de extremidade é compatível com read-after-write e lê o nó representado pela identificação no tipo de retorno.

Struct  {
id: numeric string,
success: bool,
}
Códigos de erro
Código de erro	Descrição

100
	
Parâmetro inválido

200
	
Erro de permissões

2635
	
Você está chamando uma versão obsoleta da API de Anúncios. Atualize para a versão mais recente.

368
	
A ação tentada foi considerada abusiva ou não é permitida.

2695
	
A criação do conjunto de anúncios atingiu o limite do grupo de campanhas (ios14).

80004
	
Houve muitas chamadas para esta conta de anúncios. Espere um pouco e tente de novo. Para obter mais informações, consulte /docs/graph-api/overview/rate-limiting#ads-management.

2641
	
Seu anúncio inclui ou exclui locais atualmente restritos.

190
	
Token de acesso OAuth 2.0 inválido

900
	
Esse app não existe.
Atualização
Exemplos
curl -X POST \
  -F 'billing_event="IMPRESSIONS"' \
  -F 'optimization_goal="LINK_CLICKS"' \
  -F 'bid_amount=200' \
  -F 'targeting={
       "geo_locations": {
         "countries": [
           "US"
         ]
       },
       "facebook_positions": [
         "feed"
       ]
     }' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/<AD_SET_ID>/
Para atualizar a end_time de um conjunto de anúncios usando o formato de data e hora ISO-8601
Selecionar idioma
PHP Business SDK
Python Business SDK
cURL
use FacebookAds\Object\AdSet;

$adset = new AdSet('<AD_SET_ID>');
$adset->end_time = '2013-10-02T00:00:00-0700';
$adset->update();

Para atualizar o status de um conjunto de anúncios para pausado
Selecionar idioma
PHP Business SDK
Python Business SDK
cURL
use FacebookAds\Object\AdSet;

$adset = new AdSet('<AD_SET_ID>');
$adset->campaign_status = AdSet::STATUS_PAUSED;
$adset->update();

Para definir ou alterar a estratégia de ciclo de vida do cliente do conjunto de anúncios em um conjunto de anúncios de vendas existente, envie o mesmo objeto ad_set_goal documentado em Como criar em um POST para /<AD_SET_ID>. Escreve a mesclagem com a meta existente, portanto, você precisa enviar apenas os subcampos que deseja alterar.
Considerações
Um conjunto de anúncios arquivado só pode atualizar dois campos: name e campaign_status. O campo campaign_status só pode ser alterado para DELETED.
Um conjunto de anúncios excluído só poderá alterar name.
Há duas considerações a serem levadas em conta ao ajustar o valor do orçamento ou o tipo de orçamento de um conjunto de anúncios:
Ao atualizar o orçamento diário ou total de um conjunto para um valor mais baixo, o novo valor deve ser pelo menos 10% maior do que a quantia gasta atualmente. Por exemplo: se um conjunto de anúncios tiver um orçamento total de US$ 1.000,00 e tiver gasto US$ 300,00 até o momento, o novo orçamento total mais baixo seria de US$ 330,00.
Desde v2.4, os conjuntos de anúncios têm um orçamento mínimo exigido. Qualquer atualização deve levar isso em consideração. Veja mais detalhes na seção Criar considerações desta página.
Observação: ao usar o tipo de compra de reserva, alguns campos podem não estar disponíveis para atualização via API.
Não é possível executar essa operação no ponto de extremidade.
Exclusão
Exemplos
curl -X DELETE \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/<AD_SET_ID>/
/{ad_set_id}
É possível excluir um AdSet fazendo uma solicitação DELETE para /{ad_set_id}.
Exemplo
Selecionar idioma
HTTP
PHP SDK
JavaScript SDK
Android SDK
iOS SDK
cURL
DELETE /v25.0/<AD_SET_ID>/ HTTP/1.1
Host: graph.facebook.com

Teste no Explorador da Graph API
Para saber como usar a Graph API, leia nosso guia Como usar a Graph API
Parâmetros
Este ponto de extremidade não tem parâmetros.
Tipo de retorno

Struct  {
success: bool,
}
Códigos de erro
Código de erro	Descrição

200
	
Erro de permissões

100
	
Parâmetro inválido

80004
	
Houve muitas chamadas para esta conta de anúncios. Espere um pouco e tente de novo. Para obter mais informações, consulte /docs/graph-api/overview/rate-limiting#ads-management.
Objetivo do conjunto de anúncios (ad_set_goal)
ad_set_goal permite que um conjunto de anúncios de vendas (OUTCOME_SALES) expresse uma estratégia de ciclo de vida do cliente, por exemplo, excluindo clientes existentes ou clientes existentes e engajados. Defina-a na criação (POST /act_<ACCOUNT_ID>/adsets) ou em um conjunto de anúncios existente (POST /<AD_SET_ID>) e leia-a de novo com GET /<AD_SET_ID>?fields=ad_set_goal.
Disponibilidade.ad_set_goal está disponível apenas para conjuntos de anúncios de promoção. Uma escrita em uma campanha retorna o erro 1870252.
Grava a mesclagem. Uma gravação atualiza somente os campos enviados. Os campos omitidos mantêm o valor atual. O envio de {"type":2} em um conjunto de anúncios que já tem uma meta do tipo 2 mantém as exclusões existentes. Um conjunto de anúncios novo sem meta existente deve fornecer os campos de público obrigatórios para o tipo.
Copiar. Ao copiar um conjunto de anúncios (POST /<AD_SET_ID>/copies), a cópia terá sua própria meta com o mesmo tipo e exclusões.
Categorias de anúncio especial. Não é permitido usar uma meta que não seja BROAD em um conjunto de anúncios cuja campanha esteja em uma categoria de anúncio especial restrita (moradia, emprego, crédito, produtos e serviços financeiros, educação ou jogos e apostas online). Essas escritas são rejeitadas com o erro 1870261 (BROAD é sempre permitido). Se a campanha mudar para uma dessas categorias depois de uma meta ser definida, a meta do conjunto de anúncios será automaticamente redefinida como BROAD. Não há restrições de metas para campanhas sobre temas sociais, eleições e política.
Combinações permitidas de tipos de meta
type	Campos de público obrigatórios	Todos os outros campos de público

0 (BROAD)
	
none
	
deve estar ausente ou vazio

2 (EXCLUDE_EXISTING_CUSTOMERS)
	
existing_customers_exclusions
	
deve estar ausente ou vazio

1 (EXCLUDE_EXISTING_AND_ENGAGED_CUSTOMERS)
	
existing_customers_exclusions e engaged_audiences_exclusions
	
deve estar ausente ou vazio
Códigos de erro
Código	Significado

1870252
	
ad_set_goal não está disponível para esta conta de anúncios (sem acesso à meta).

1870253
	
A meta type não é compatível com a API (tipos 3, 4, 5 e 6).

1870258
	
ad_set_goal presente sem um type.

1870261
	
Objetivo não amplo não permitido em uma campanha de categoria de anúncio especial.
Experiências de anúncios orientadas por resultados
Exemplo
Experiências de anúncios orientadas por resultados (resultado de engajamento + ON_PAGE destination_type)
curl -i -X POST \
  -d "name=New ODAX Adset" \
  -d "autobid=true" \
  -d "optimization_goal=PAGE_LIKES" \
  -d "destination_type=ON_PAGE" \
  -d "billing_event=IMPRESSIONS" \
  -d "daily_budget=500" \
  -d "targeting={\"geo_locations\": {\"countries\": [\"US\"]}}" \
  -d "promoted_object={\"page_id\": PAGE_ID}" \
  -d "campaign_id=CAMPAIGN_ID" \
  -d "status=PAUSED" \
  -d "access_token=ACCESS_TOKEN" \
  https://graph.facebook.com/v11.0/
  act_AD_ACCOUNT_ID/adsets
Legado
curl -i -X POST \
  -d "name=New ODAX Adset" \
  -d "autobid=true" \
  -d "optimization_goal=PAGE_LIKES" \
  -d "billing_event=IMPRESSIONS" \
  -d "daily_budget=500" \
  -d "targeting={\"geo_locations\": {\"countries\": [\"US\"]}}" \
  -d "promoted_object={\"page_id\": PAGE_ID}" \
  -d "campaign_id=CAMPAIGN_ID" \
  -d "status=PAUSED" \
  -d "access_token=ACCESS_TOKEN" \
  https://graph.facebook.com/v11.0/
  act_AD_ACCOUNT_ID/adsets
Restrições
Haverá novas restrições nas campanhas de Experiências com anúncios orientados por resultados (ODAX, pelas iniciais em inglês) conforme descrito na tabela abaixo. Consulte a tabela de mapeamento de experiências de anúncios orientados para resultados para conhecer os novos objetivos e seus tipos de destino, metas de otimização e objetos promovidos correspondentes.
Objetivos ODAX	Localização da conversão (L2)	Eventos de conversão (L2)	Metas de otimização (L2)	Objetivos antigos

ReconhecimentoAlcance o maior número de pessoas com probabilidade de se lembrarem do seu anúncio.
	
N/A
	
N/A
	
Incrementalidade na lembrança do anúncio, alcance, impressões
Enumeração da API {AD_RECALL_LIFT, REACH, IMPRESSIONS}
	
Alcance, reconhecimento da marca

TráfegoDirecione as pessoas a um destino, como seu site, app ou Loja.
	
Lojas do Facebook (beta fechado)
	
N/A
	
Cliques no link
Enumeração da API {LINK_CLICKS}
	
Tráfego

	
Site
	
N/A
	
Visualizações da página de destino, Cliques no link, Impressões, Alcance diário único
Enumeração da API {LANDING_PAGE_VIEWS, LINK_CLICKS, IMPRESSIONS, REACH}
	
Tráfego

	
App
	
N/A
	
Cliques no link, alcance diário único
Enumeração da API {LINK_CLICKS, REACH}
	
Tráfego

	
Messenger
	
N/A
	
Cliques no link, impressões, alcance diário único
Enumeração da API {LINK_CLICKS, IMPRESSIONS, REACH}
	
Tráfego

	
WhatsApp
	
N/A
	
Cliques no link, impressões, alcance diário único
Enumeração da API {LINK_CLICKS, IMPRESSIONS, REACH}
	
Tráfego

EngajamentoEncontre pessoas com probabilidade de interagir com sua empresa online e realizar ações, como iniciar uma conversa ou comentar em posts.
	
Em vídeos
	
N/A
	
ThruPlay, visualização contínua de 2 segundos
Enumeração da API {THRUPLAY, TWO_SECOND_CONTINUOUS_VIDEO_VIEWS}
	
Visualizações do vídeo

	
No post
	
N/A
	
Engajamento com a publicação, impressões e alcance diário único
Enumeração da API {POST_ENGAGEMENT, IMPRESSIONS, REACH}
	
Engajamento com o post

	
Em um evento
	
N/A
	
Participação no evento, impressões, engajamento com a publicação, alcance diário único
Enumeração da API {EVENT_RESPONSES, IMPRESSIONS, POST_ENGAGEMENT, REACH}
	
Participações no evento

	
Messenger
	
N/A
	
Conversas, cliques no link
Enumeração da API {CONVERSATIONS, LINK_CLICKS}
	
Mensagens

	
WhatsApp
	
N/A
	
Conversas, cliques no link
Enumeração da API {CONVERSATIONS, LINK_CLICKS}
	
Mensagens

	
Instagram
	
N/A
	
Conversas, cliques no link
Enumeração da API {CONVERSATIONS, LINK_CLICKS}
	
Mensagens

	
Site
	
AddToWishlist, Contact, CustomizeProduct, Donate, FindLocation, Schedule, Search, StartTrial, SubmitApplication, Subscribe, ViewContent
	
Conversões, visualizações da página de destino, cliques no link, impressões, alcance diário único
Enumeração da API {OFFSITE_CONVERSIONS, ONSITE_CONVERSIONS, LANDING_PAGE_VIEWS, LINK_CLICKS, IMPRESSIONS, REACH}
	
Conversões

	
App
	
Alcançar nível, Ativar app, Adicionar à lista de desejos, Concluir tutorial, Contato, Personalizar produto, Doar, Encontrar localização, Clique no anúncio no app, Impressão do anúncio no app, Classificação, Programação, Pesquisa, Créditos gastos, Iniciar teste, Enviar candidatura, Assinar, Desbloquear conquista, Ver conteúdo
	
Eventos do app, cliques no link, alcance diário único
Enumeração da API {APP_INSTALLS_AND_OFFSITE_CONVERSIONS, LINK_CLICKS, REACH}
	
Conversões

	
Na Página
	
N/A
	
Curtidas na Página
Enumeração da API {PAGE_LIKES}
	
Engajamento

LeadsEncontre pessoas interessadas na sua empresa e com probabilidade de compartilhar informações de contato.
	
Site
	
Lead, CompleteRegistration, Contact, FindLocation, Schedule, StartTrial, SubmitApplication, Subscribe
	
Conversões, visualizações da página de destino, cliques no link, impressões, alcance diário único
Enumeração da API {OFFSITE_CONVERSIONS, ONSITE_CONVERSIONS, LANDING_PAGE_VIEWS, LINK_CLICKS, IMPRESSIONS, REACH}
	
Conversões

	
Formulários instantâneos
	
N/A
	
Cadastros
Enumeração da API {LEAD_GENERATION, QUALITY_LEAD}
	
Geração de cadastros

	
Messenger
	
N/A
	
Cadastros
Enumeração da API {LEAD_GENERATION, QUALITY_LEAD}
	
Mensagens

	
Ligações
	
N/A
	
Ligações
Enumeração da API {QUALITY_CALL}
	
Geração de cadastros

	
App
	
Concluir inscrição, concluir tutorial, entrar em contato, encontrar localização, programar, iniciar período de avaliação, enviar inscrição, assinar
	
Eventos do app, cliques no link, alcance diário único
Enumeração da API {APP_INSTALLS_AND_OFFSITE_CONVERSIONS, LINK_CLICKS, REACH}
	
Conversões

Promoção do appEncontre pessoas com probabilidade de instalar seu app.
	
N/A
	
Todos os eventos do app, incluindo todos os eventos personalizados
	
Não AAA: cliques no link, instalações do app, eventos do app, valor
Enumeração da API {LINK_CLICKS, APP_INSTALLS, APP_INSTALLS_AND_OFFSITE_CONVERSIONS, VALUE}
AAA: instalações do app, instalações do app com eventos do app, eventos do app e valor
Enumeração da API {APP_INSTALLS, APP_INSTALLS_AND_OFFSITE_CONVERSIONS, VALUE}
	
Instalações do app

VendasEncontre pessoas com probabilidade de comprar ou realizar outras ações importantes online ou na loja.
	
Site e Lojas do Facebook (beta fechado)
	
Purchase, InitiateCheckout, AddPaymentInfo, AddToCart, CompleteRegistration, Donate, StartTrial, Subscribe, ViewContent
	
(fonte da verdade: o mesmo que o objetivo de conversões atual + web e loja)
Enumeração da API {OFFSITE_CONVERSIONS, VALUE, LINK_CLICKS, LANDING_PAGE_VIEWS, LINK_CLICKS, IMPRESSIONS, REACH}
	
Conversões

	
Site
	
Purchase, InitiateCheckout, AddPaymentInfo, AddToCart, CompleteRegistration, Donate, StartTrial, Subscribe, ViewContent
	
Conversões, valor, visualizações da página de destino, cliques no link, impressões, alcance diário único
Enumeração da API {OFFSITE_CONVERSIONS, VALUE, LANDING_PAGE_VIEWS, LINK_CLICKS, IMPRESSIONS, REACH}
	
Conversões

	
App
	
Compra, Iniciar finalização da compra, Adicionar informações de pagamento, Adicionar ao carrinho, Concluir inscrição, Doar, Clique do anúncio no app, Impressão do anúncio no app, Créditos gastos, Iniciar período de avaliação, Assinar, Ver conteúdo
	
Eventos do app, cliques no link, alcance diário único
Enumeração da API {OFFSITE_CONVERSIONS, LINK_CLICKS, REACH}
	
Conversões

	
Site e app
	
Purchase, InitiateCheckout, AddPaymentInfo, AddToCart, CompleteRegistration, Donate, StartTrial, Subscribe, ViewContent
	
Conversões
Enumeração da API {OFFSITE_CONVERSIONS}
	
Conversões

	
Messenger
	
Purchase, InitiateCheckout, AddPaymentInfo, AddToCart, CompleteRegistration, Donate, StartTrial, Subscribe, ViewContent
	
Conversas, conversões, cliques no link, impressões e alcance
Enumeração da API {CONVERSATIONS, OFFSITE_CONVERSIONS, LINK_CLICKS, IMPRESSIONS, REACH}
	
Conversões

	
WhatsApp
	
Purchase, InitiateCheckout, AddPaymentInfo, AddToCart, CompleteRegistration, Donate, StartTrial, Subscribe, ViewContent
	
Conversões, cliques no link, impressões e alcance
Enumeração da API {OFFSITE_CONVERSIONS, LINK_CLICKS, IMPRESSIONS, REACH}
	
Conversões
Você achou esta página útil?