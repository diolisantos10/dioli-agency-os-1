---
titulo: "Marketing API — referência de Campaign (ad-campaign-group)"
url: https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ad-campaign-group
capturado_em: 2026-09-12
hash: 4d6122084832f301
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
Grupo de campanhas de anúncios
Updated: 11 de mai de 2026
Copiar para LLM
Ver como Markdown
Os anúncios no Status do WhatsApp são disponibilizados por meio da API de Marketing. Learn more about ads in WhatsApp Status.
A campanha é o nível mais alto da estrutura organizacional da conta de anúncios e deve representar um objetivo único para o anunciante, por exemplo, para estimular o engajamento de publicações da página. Ao definir o objetivo da campanha, você aplica a validação de quaisquer anúncios adicionados a essa campanha para garantir que eles também tenham o objetivo correto.
O parâmetro date_preset = lifetime foi desativado na Graph API v10.0 e substituído por date_preset = maximum, que retorna um máximo de 37 meses de dados. Para a v9.0 e versões anteriores, date_preset = maximum será ativado em 25 de maio de 2021, e todas as chamadas de lifetime serão definidas como maximum por padrão e retornarão somente 37 meses de dados.
Limites
Só é possível criar 200 conjuntos de anúncios por campanha. Saiba mais sobre a estrutura da campanha de anúncios.
Se a sua campanha tiver mais de 70 conjuntos de anúncios e utilizar a otimização do orçamento da campanha, você não poderá editar a estratégia de lance atual nem desativar a CBO. Saiba mais na Central de Ajuda para Empresas⁠.
Novo campo obrigatório para todas as campanhas
Todas as empresas que usam a API de Marketing precisam identificar se as campanhas novas e editadas pertencem ou não a uma categoria de anúncio especial. As categorias atualmente disponíveis são: moradia, emprego, crédito ou temas sociais, eleições e política. As empresas cujos anúncios não pertencem a uma categoria de anúncio especial devem indicar "NONE" ou enviar uma matriz vazia para o campo special_ad_categories.
As empresas que veiculam anúncios de moradia, emprego ou crédito devem cumprir as restrições de público e direcionamento. O direcionamento de anúncios sobre temas sociais, eleições ou política não é afetado pelo rótulo special_ad_categories.
A partir da API de Marketing 7.0, o parâmetro special_ad_category no ponto de extremidade POST /act_<ad_account_id>/campaigns ficou obsoleto e foi substituído por um novo parâmetro special_ad_categories. O novo parâmetro special_ad_categories é obrigatório e aceita uma matriz.
Caso você use o parâmetro special_ad_category, ele ainda retornará uma string, mas é preciso usar GET /{campaign-id}?fields=special_ad_categories para receber uma matriz. Consulte Categoria de anúncio especial para obter mais informações.
Leitura
Uma campanha é um agrupamento de conjuntos de anúncios organizados pelo mesmo objetivo comercial. Cada campanha tem um objetivo que deve ser válido para todos os conjuntos de anúncios que ela contém.
Depois que seus anúncios começarem a ser veiculados, você poderá consultar estatísticas de campanhas de anúncios. As estatísticas retornadas serão únicas, com a duplicação removida entre os conjuntos de anúncios. Também é possível obter relatórios e estatísticas de todos os conjuntos de anúncios e anúncios de uma campanha ao mesmo tempo.
Exemplo
Selecionar idioma
HTTP
PHP SDK
JavaScript SDK
Android SDK
iOS SDK
GET v25.0/...?fields={fieldname_of_type_Campaign} HTTP/1.1
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
	
ID da campanha.

padrão

account_id
string numérica
	
Identificação da conta de anúncios proprietária da campanha.

adlabels
lista<AdLabel>
	
Rótulos de anúncios associados à campanha.

bid_strategy 

enum {LOWEST_COST_WITHOUT_CAP, LOWEST_COST_WITH_BID_CAP, COST_CAP, LOWEST_COST_WITH_MIN_ROAS}
	
Estratégia de lance da campanha quando você habilita a otimização do orçamento e usa AUCTION como tipo de compra:
LOWEST_COST_WITHOUT_CAP: projetado para obter o máximo de resultados para seu orçamento com base no seu conjunto de anúncios optimization_goal sem limitar o valor do lance. Essa é a melhor estratégia a ser selecionada se você se importar mais com a eficiência de custos. No entanto, pode ser mais difícil conseguir custos médios estáveis ​​à medida que você gasta. Observação: essa estratégia também é conhecida como lance automático. Saiba mais em Central de Ajuda de Anúncios, Sobre as estratégias de lance: menor custo⁠.
LOWEST_COST_WITH_BID_CAP: projetado para obter o máximo de resultados para seu orçamento com base no seu conjunto de anúncios optimization_goal ao mesmo tempo que limita o lance real para um valor especificado. Obtenha o limite de lance especificado no campo bid_amount de cada conjunto de anúncios nesta campanha. Essa estratégia é conhecida como lance manual de custo máximo. Saiba mais em Central de Ajuda de Anúncios, Sobre estratégias de lance: menor custo⁠.
COST_CAP: projetado para obter o máximo de resultados para seu orçamento com base no seu conjunto de anúncios optimization_goal ao mesmo tempo que limita o custo médio real por evento de otimização para um valor especificado. Obtenha o limite de custo especificado no campo bid_amount de cada conjunto de anúncios na campanha. Saiba mais em Central de Ajuda de Anúncios, Sobre estratégias de lance: limite de custo⁠.
Observações:
Se você não habilitar a otimização do orçamento da campanha, deverá obter bid_strategy no nível do conjunto de anúncios.
A estratégia de lances TARGET_COST ficou obsoleta a partir da versão 9.0 da API de Marketing.

boosted_object_id
string numérica
	
O objeto turbinado associado à campanha, se houver.

brand_lift_studies
lista<AdStudy>
	
Estudos automatizados de Brand Lift V2 para este conjunto de anúncios.

budget_rebalance_flag
booliano
	
Se os orçamentos de todos os conjuntos de anúncios da campanha serão reequilibrados automaticamente todos os dias. Este recurso ficou obsoleto na API de Marketing V7.0.

budget_remaining
string numérica
	
Orçamento restante

buying_type
string
	
Tipo de compra. Os valores possíveis são:
AUCTION: padrão
RESERVED: para anúncios de alcance e frequência
O alcance e a frequência estão desabilitados para anúncios de moradia, emprego e crédito.

campaign_group_active_time
string numérica
	
campaign_group_active_time: somente para uso interno. Terá a duração ativa de veiculação de grupos de campanhas.

can_create_brand_lift_study
booliano
	
Se for possível criar um novo estudo de brand lift automatizado para o conjunto de anúncios.

can_use_spend_cap
booliano
	
Indica se a campanha pode definir o limite de gastos.

configured_status
enum {ACTIVE, PAUSED, DELETED, ARCHIVED}
	
Se o status for PAUSED, todos os respectivos conjuntos de anúncios e anúncios ativos serão pausados e terão status efetivo de CAMPAIGN_PAUSED. É preferível usar "status" em vez disso.

created_time
datetime
	
Hora de criação

daily_budget
string numérica
	
É o orçamento diário da campanha.

effective_status
enum {ACTIVE, PAUSED, DELETED, ARCHIVED, IN_PROCESS, WITH_ISSUES}
	
IN_PROCESS está disponível para a versão 4.0 ou posterior.

has_secondary_skadnetwork_reporting
booliano
	
has_secondary_skadnetwork_reporting

is_adset_budget_sharing_enabled
booliano
	
Indica se os conjuntos de anúncios secundários são gerenciados de acordo com o compartilhamento do orçamento do conjunto de anúncios.

is_budget_schedule_enabled
booliano
	
Indica se a programação do orçamento está habilitada para o grupo de campanhas.

is_reels_trending_ads_enabled
booliano
	
is_reels_trending_ads_enabled

is_skadnetwork_attribution
booliano
	
Quando definido como true, indica que a campanha incluirá a SKAdNetwork, iOS 14+.

issues_info 

lista<AdCampaignIssuesInfo>
	
Problemas na campanha que impediram a veiculação.

last_budget_toggling_time
datetime
	
Última vez que o orçamento foi alternado.

lifetime_budget
string numérica
	
É o orçamento total da campanha.

name
string
	
Nome da campanha.

objective
string
	
Objetivo da campanha.
Para obter mais informações, consulte a seção Validação do objetivo da experiência orientada por anúncios de resultado abaixo.

pacing_type
lista<string>
	
Define o tipo de regularidade da campanha. O valor é uma matriz de opções: "standard".

primary_attribution
enum
	
primary_attribution

promoted_object
AdPromotedObject
	
O objeto que a campanha promove em todos os anúncios.

smart_promotion_type
enum
	
Tipo de promoção inteligente. guided_creation ou smart_app_promotion (a opção sob o objetivo APP_INSTALLS).

source_campaign
Campanha
	
A campanha de origem da qual esta campanha foi copiada.

source_campaign_id
string numérica
	
A identificação da campanha de origem da qual esta campanha foi copiada.

special_ad_categories 

lista<enum>
	
categorias de anúncio especial

special_ad_category
enum
	
A categoria de anúncio especial da campanha. Uma das opções: HOUSING, EMPLOYMENT, CREDIT ou NONE.

special_ad_category_country 

lista<enum>
	
Campo de país para categoria de anúncio especial.

spend_cap
string numérica
	
Um limite de gastos para a campanha, que não pode ser excedido. Expressa como um valor inteiro da subunidade na sua moeda.

start_time
datetime
	
Mesclagem de start_times para os conjuntos de anúncios pertencentes a esta campanha. No nível da campanha, start_time é um campo somente leitura. Você pode configurar start_time no nível do conjunto de anúncios.

status
enum {ACTIVE, PAUSED, DELETED, ARCHIVED}
	
Se o status for PAUSED, todos os respectivos conjuntos de anúncios e anúncios ativos serão pausados e terão status efetivo de CAMPAIGN_PAUSED. O campo retorna o mesmo valor que "configured_status" e é a opção sugerida para uso.

stop_time
datetime
	
Mesclagem de stop_time para os conjuntos de anúncios pertencentes a esta campanha, se disponível. No nível da campanha, stop_time é um campo somente leitura. Você pode configurar stop_time no nível do conjunto de anúncios.

topline_id
string numérica
	
Identificação da linha do pedido.

updated_time
datetime
	
Horário atualizado. Se você atualizar o spend_cap ou o orçamento diário ou total, isso não atualizará automaticamente este campo.
Bordas
Borda	Descrição

ad_studies
Borda<AdStudy>
	
Os estudos de anúncio que contêm esta campanha.

adrules_governed
Borda<AdRule>
	
Regras de anúncios que regem esta campanha. Por padrão, retorna apenas regras que mencionam diretamente a campanha por ID ou indiretamente por meio do entity_type definido.

ads
Borda<Adgroup>
	
Anúncios da campanha

adsets
Borda<AdCampaign>
	
Os conjuntos de anúncios desta campanha.

copies
Borda<AdCampaignGroup>
	
As cópias da campanha.
Códigos de erro
Código de erro	Descrição

100
	
Parâmetro inválido

80004
	
Houve muitas chamadas para esta conta de anúncios. Espere um pouco e tente de novo. Para obter mais informações, consulte /docs/graph-api/overview/rate-limiting#ads-management.

613
	
As chamadas para esta API ultrapassaram o limite de volume.

190
	
Token de acesso OAuth 2.0 inválido

104
	
Assinatura incorreta

2.500
	
Erro ao analisar a consulta da Graph API.

3018
	
A data de início do período não pode ultrapassar 37 meses a partir da data atual.

200
	
Erro de permissões

2635
	
Você está chamando uma versão obsoleta da API de Anúncios. Atualize para a versão mais recente.
Criação
/act_{ad_account_id}/async_batch_requests
É possível fazer uma solicitação POST à borda async_batch_requests a partir dos seguintes caminhos:
/act_{ad_account_id}/async_batch_requests
Ao publicar nessa borda, uma campanha será criada.
Parâmetros
Parâmetro	Descrição

adbatch
lista<Object>
	
Solicitação em lote codificada em JSON
obrigatório
Show child parameters

name
Cadeia de caracteres codificada em UTF-8
	
O nome da solicitação em lote para fins de rastreamento.
obrigatório
Tipo de retorno
Este ponto de extremidade é compatível com read-after-write e lê o nó representado pelo id no tipo de retorno.

Struct  {
id: numeric string,
}
Códigos de erro
Código de erro	Descrição

194
	
Pelo menos um parâmetro obrigatório está ausente.

100
	
Parâmetro inválido

2.500
	
Erro ao analisar a consulta da Graph API.
/{campaign_id}/copies
É possível fazer uma solicitação POST à borda copies a partir dos seguintes caminhos:
/{campaign_id}/copies
Ao publicar nessa borda, uma campanha será criada.
Parâmetros
Parâmetro	Descrição

deep_copy
booleano
	

Valor padrão: false
Indica se todos os anúncios secundários serão copiados. Limites: o número total de anúncios filhos a serem copiados não deve exceder 3 para uma chamada síncrona e 51 para uma assíncrona.

end_time
datetime
	
Para cópia em profundidade, é a hora de término dos conjuntos da campanha copiada, por exemplo, 2015-03-12 23:59:59-07:00 ou 2015-03-12 23:59:59 PDT. Registro de data e hora UNIX (UTC). Ao criar um conjunto com orçamento diário, especifique end_time=0 para definir que ele é contínuo e não tem data de término. Se não for definido, os conjuntos copiados herdarão o horário de término do conjunto original.

parameter_overrides
Especificação da campanha
	
parameter_overrides

rename_options
JSON ou matrizes semelhantes a objetos
	
Opções de renomeação
Show child parameters

start_time
datetime
	
Para cópia em profundidade, a hora de início dos conjuntos sob a campanha copiada, por exemplo, 2015-03-12 23:59:59-07:00 ou 2015-03-12 23:59:59 PDT. Registro de data e hora UNIX (UTC). Se não for definido, os conjuntos copiados herdarão a hora de início do conjunto original.

status_option
enum {ACTIVE, PAUSED, INHERITED_FROM_SOURCE}
	

Valor padrão: PAUSED
ACTIVE: a campanha copiada terá o status ativo. PAUSED: a campanha copiada terá o status pausado. INHERITED_FROM_SOURCE: a campanha copiada terá o status principal.
Tipo de retorno
Este ponto de extremidade é compatível com read-after-write e lê o nó representado por copied_campaign_id no tipo de retorno.

Struct  {
copied_campaign_id: numeric string,
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

190
	
Token de acesso OAuth 2.0 inválido

200
	
Erro de permissões
/act_{ad_account_id}/campaigns
É possível fazer uma solicitação POST à borda campaigns a partir dos seguintes caminhos:
/act_{ad_account_id}/campaigns
Ao publicar nessa borda, uma campanha será criada.
Exemplo
Selecionar idioma
HTTP
PHP SDK
JavaScript SDK
Android SDK
iOS SDK
cURL
POST /v25.0/act_<AD_ACCOUNT_ID>/campaigns HTTP/1.1
Host: graph.facebook.com

name=My+campaign&objective=OUTCOME_TRAFFIC&status=PAUSED&special_ad_categories=%5B%5D&is_adset_budget_sharing_enabled=0

Teste no Explorador da Graph API
Para saber como usar a Graph API, leia nosso guia Como usar a Graph API
Parâmetros
Parâmetro	Descrição

adlabels
lista<Object>
	
Rótulos de anúncio associados à campanha

bid_strategy 

enum{LOWEST_COST_WITHOUT_CAP, LOWEST_COST_WITH_BID_CAP, COST_CAP, LOWEST_COST_WITH_MIN_ROAS}
	
Escolha a estratégia de lance para esta campanha que seja adequada às suas metas de negócios específicas. Cada estratégia apresenta vantagens e desvantagens e pode estar disponível para determinadas optimization_goals:
LOWEST_COST_WITHOUT_CAP: projetado para obter o máximo de resultados para seu orçamento com base no seu conjunto de anúncios optimization_goal sem limitar o valor do lance. Essa é a melhor estratégia se você se importar mais com a relação custo-benefício. No entanto, com essa estratégia, pode ser mais difícil obter custos médios estáveis à medida que você gasta. Essa estratégia também é conhecida como lance automático. Saiba mais em Central de Ajuda de Anúncios, Sobre estratégias de lance: menor custo⁠.
LOWEST_COST_WITH_BID_CAP: projetado para obter o máximo de resultados para seu orçamento com base no conjunto de anúncios optimization_goal ao mesmo tempo que limita o lance real para o valor especificado. Com um limite de lance, você tem mais controle sobre o custo por evento de otimização real. Porém, se você definir um limite muito baixo, poderá obter menos veiculações de anúncios. Se você selecionar essa opção, será necessário fornecer um limite de lance no campo bid_amount para cada conjunto de anúncios nesta campanha. Observação: durante a criação, essa será a estratégia de lance padrão se você não especificar uma. Esta estratégia também é conhecida como lance manual de custo máximo. Saiba mais em Central de Ajuda de Anúncios, Sobre as estratégias de lance: menor custo⁠.

Observações:
Se você não habilitar a otimização do orçamento da campanha, será necessário definir bid_strategy no nível do conjunto de anúncios.
A estratégia de lances TARGET_COST ficou obsoleta a partir da versão 9.0 da API de Marketing.

budget_schedule_specs
list<JSON or object-like arrays>
	
Os períodos iniciais de alta demanda a serem criados com a campanha.
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

buying_type
string
	

Valor padrão: AUCTION
Esse campo ajudará o Facebook a fazer otimizações de veiculação, preços e limites. Todos os conjuntos de anúncios na campanha devem corresponder ao tipo de compra. Estes são os valores possíveis:
AUCTION (padrão)
RESERVED (para anúncios de alcance e frequência).

campaign_optimization_type
enum{NONE, ICO_ONLY}
	
campaign_optimization_type

daily_budget
int64
	
Orçamento diário da campanha. Todos os conjuntos de anúncios da campanha compartilharão o orçamento. Você pode definir o orçamento no nível da campanha ou do conjunto de anúncios, mas não em ambos.

execution_options
list<enum{validate_only, include_recommendations}>
	

Valor padrão: Set
Uma configuração de execução
validate_only: quando esta opção for especificada, a chamada de API não realizará a mutação, mas executará as regras de validação em relação aos valores de cada campo.
include_recommendations: esta opção não pode ser usada sozinha. Quando ela for utilizada, serão incluídas recomendações para configuração do objeto de anúncio. Uma seção específica para recomendação será incluída na resposta, mas somente se existirem recomendações para tal especificação.
Se a chamada passar no processo de validação ou análise, a resposta será {"success": true}. Caso a chamada não seja aprovada, um erro será retornado com mais detalhes. Essas opções podem ser usadas para melhorar qualquer interface do usuário para exibir erros com muito mais antecedência, por exemplo, assim que um novo valor é digitado em qualquer campo correspondente a este objeto de anúncio, em vez de na etapa de carregamento/salvamento ou após a análise.

is_skadnetwork_attribution
booleano
	
Para criar uma campanha do iOS 14, habilite a atribuição da SKAdNetwork.

is_using_l3_schedule
booleano
	
is_using_l3_schedule

iterative_split_test_configs
lista<Object>
	
É a matriz de configurações de teste A/B iterativo criadas na campanha.

lifetime_budget
int64
	
Orçamento total da campanha. Todos os conjuntos de anúncios da campanha compartilharão o orçamento. Você pode definir o orçamento no nível da campanha ou do conjunto de anúncios, mas não em ambos.

name
string
	
Nome da campanha.
aceita emojis

objective
enum{APP_INSTALLS, BRAND_AWARENESS, CONVERSIONS, EVENT_RESPONSES, LEAD_GENERATION, LINK_CLICKS, LOCAL_AWARENESS, MESSAGES, OFFER_CLAIMS, OUTCOME_APP_PROMOTION, OUTCOME_AWARENESS, OUTCOME_ENGAGEMENT, OUTCOME_LEADS, OUTCOME_SALES, OUTCOME_TRAFFIC, PAGE_LIKES, POST_ENGAGEMENT, PRODUCT_CATALOG_SALES, REACH, STORE_VISITS, VIDEO_VIEWS}
	
Objetivo da campanha. Se for especificado, a API validará que todos os anúncios criados na campanha correspondam ao objetivo.
Atualmente, com o objetivo BRAND_AWARENESS, todos os criativos devem ser ou somente imagens ou somente vídeos, não mistos.
Consulte Validação do objetivo da experiência orientada por anúncios de resultado para ver mais informações.

promoted_object
Objeto
	
O objeto que a campanha promove em todos os anúncios. Ele é obrigatório para a criação de campanhas de promoção do app (SKAdNetwork ou Mensuração de Eventos Agregados) para iOS 14 ou versões posteriores. Somente product_catalog_id é usado no nível do conjunto de anúncios.
Show child parameters

source_campaign_id
string numérica ou número inteiro
	
Usado se uma campanha tiver sido copiada. O ID da campanha original que foi copiada.

special_ad_categories 

matriz<enum {NONE, EMPLOYMENT, HOUSING, CREDIT, ISSUES_ELECTIONS_POLITICS, ONLINE_GAMBLING_AND_GAMING, FINANCIAL_PRODUCTS_SERVICES}>
	
special_ad_categories
obrigatório

special_ad_category_country 

matriz<enum {AC, AD, AE, AF, AG, AI, AL, AM, AN, AO, AQ, AR, AS, AT, AU, AW, AX, AZ, BA, BB, BD, BE, BF, BG, BH, BI, BJ, BL, BM, BN, BO, BQ, BR, BS, BT, BV, BW, BY, BZ, CA, CC, CD, CF, CG, CH, CI, CK, CL, CM, CN, CO, CR, CU, CV, CW, CX, CY, CZ, DE, DJ, DK, DM, DO, DZ, EC, EE, EG, EH, ER, ES, ET, FI, FJ, FK, FM, FO, FR, GA, GB, GD, GE, GF, GG, GH, GI, GL, GM, GN, GP, GQ, GR, GS, GT, GU, GW, GY, HK, HM, HN, HR, HT, HU, ID, IE, IL, IM, IN, IO, IQ, IR, IS, IT, JE, JM, JO, JP, KE, KG, KH, KI, KM, KN, KP, KR, KW, KY, KZ, LA, LB, LC, LI, LK, LR, LS, LT, LU, LV, LY, MA, MC, MD, ME, MF, MG, MH, MK, ML, MM, MN, MO, MP, MQ, MR, MS, MT, MU, MV, MW, MX, MY, MZ, NA, NC, NE, NF, NG, NI, NL, NO, NP, NR, NU, NZ, OM, PA, PE, PF, PG, PH, PK, PL, PM, PN, PR, PS, PT, PW, PY, QA, RE, RO, RS, RU, RW, SA, SB, SC, SD, SE, SG, SH, SI, SJ, SK, SL, SM, SN, SO, SR, SS, ST, SV, SX, SY, SZ, TC, TD, TF, TG, TH, TJ, TK, TL, TM, TN, TO, TR, TT, TV, TW, TZ, UA, UG, UM, US, UY, UZ, VA, VC, VE, VG, VI, VN, VU, WF, WS, XK, YE, YT, ZA, ZM, ZW}>
	
special_ad_category_country

spend_cap
int64
	
Um limite de gastos para a campanha, que não pode ser excedido. Definido como um valor inteiro de subunidade na sua moeda com um valor mínimo de US$ 100 (ou equivalente local aproximado). Defina o valor como 922337203685478 para remover o limite de gastos. Não está disponível para campanhas de alcance e frequência ou premium de autoatendimento.

start_time
datetime
	
start_time

status
enum{ACTIVE, PAUSED, DELETED, ARCHIVED}
	
Apenas ACTIVE e PAUSED são válidos durante a criação. Outros status podem ser usados para atualização. Se for definido como PAUSED, os respectivos objetos derivados que estiverem ativos serão pausados e terão um status efetivo de CAMPAIGN_PAUSED.

stop_time
datetime
	
stop_time

topline_id
string numérica ou número inteiro
	
Identificação da linha do pedido.
Tipo de retorno
Este ponto de extremidade é compatível com read-after-write e lê o nó representado pelo id no tipo de retorno.

Struct  {
id: numeric string,
success: bool,
}
Códigos de erro
Código de erro	Descrição

100
	
Parâmetro inválido

613
	
As chamadas para esta API ultrapassaram o limite de volume.

200
	
Erro de permissões

2635
	
Você está chamando uma versão obsoleta da API de Anúncios. Atualize para a versão mais recente.

190
	
Token de acesso OAuth 2.0 inválido

80004
	
Houve muitas chamadas para esta conta de anúncios. Espere um pouco e tente de novo. Para obter mais informações, consulte /docs/graph-api/overview/rate-limiting#ads-management.

300
	
Falha na edição
Atualização
/{campaign_id}
É possível atualizar uma campanha fazendo uma solicitação POST a /{campaign_id}.
Parâmetros
Parâmetro	Descrição

adlabels
lista<Object>
	
Rótulos de anúncio associados à campanha

adset_bid_amounts
Objeto JSON {numeric string : int64}
	
Um mapa de identificações de conjuntos de anúncios secundários com seus respectivos valores de lance necessários no processo de alternar a campanha de lance automático para lance manual.

adset_budgets
matriz<JSON object>
	
Uma matriz de mapas contendo todas as identificações de conjunto de anúncios secundários não excluídas e daily_budget ou lifetime_budget, necessários no processo de alternância entre o orçamento da campanha e o orçamento do conjunto de anúncios.
Show child parameters

bid_strategy 

enum{LOWEST_COST_WITHOUT_CAP, LOWEST_COST_WITH_BID_CAP, COST_CAP, LOWEST_COST_WITH_MIN_ROAS}
	
Escolha a estratégia de lance para esta campanha que seja adequada às suas metas de negócios específicas. Cada estratégia apresenta vantagens e desvantagens e pode estar disponível para determinadas optimization_goals:
LOWEST_COST_WITHOUT_CAP: projetado para obter o máximo de resultados para seu orçamento com base no seu conjunto de anúncios optimization_goal sem limitar o valor do lance. Essa é a melhor estratégia se você se importar mais com a relação custo-benefício. No entanto, com essa estratégia, pode ser mais difícil obter custos médios estáveis à medida que você gasta. Essa estratégia também é conhecida como lance automático. Saiba mais em Central de Ajuda de Anúncios, Sobre as estratégias de lance: menor custo⁠.
LOWEST_COST_WITH_BID_CAP: projetado para obter o máximo de resultados para seu orçamento com base no conjunto de anúncios optimization_goal ao mesmo tempo que limita o lance real para o valor especificado. Com um limite de lance, você tem mais controle sobre o custo por evento de otimização real. Porém, se você definir um limite muito baixo, poderá obter menos veiculações de anúncios. Se você selecionar essa opção, será necessário fornecer um limite de lance no campo bid_amount para cada conjunto de anúncios nesta campanha. Observação: durante a criação, essa será a estratégia de lance padrão se você não especificar uma. Esta estratégia também é conhecida como lance manual de custo máximo. Saiba mais em Central de Ajuda de Anúncios, Sobre estratégias de lance: menor custo⁠.
COST_CAP: projetado para obter o máximo de resultados para seu orçamento com base no seu conjunto de anúncios optimization_goal ao mesmo tempo que limita o custo médio real por evento de otimização para um valor especificado. Obtenha o limite de custo especificado no campo bid_amount de cada conjunto de anúncios na campanha. Saiba mais em Central de Ajuda de Anúncios, Sobre estratégias de lance: limite de custo⁠.

Observações:
Se você não habilitar a otimização do orçamento da campanha, será necessário definir bid_strategy no nível do conjunto de anúncios.
A estratégia de lances TARGET_COST ficou obsoleta a partir da versão 9.0 da API de Marketing.

budget_rebalance_flag
booleano
	
Se os orçamentos de todos os conjuntos de anúncios da campanha serão reequilibrados automaticamente todos os dias.

campaign_optimization_type
enum{NONE, ICO_ONLY}
	
campaign_optimization_type

daily_budget
int64
	
Orçamento diário da campanha. Todos os conjuntos de anúncios da campanha compartilharão o orçamento. Você pode definir o orçamento no nível da campanha ou do conjunto de anúncios, mas não em ambos.

execution_options
list<enum{validate_only, include_recommendations}>
	

Valor padrão: Set
Uma configuração de execução
validate_only: quando esta opção for especificada, a chamada de API não realizará a mutação, mas executará as regras de validação em relação aos valores de cada campo.
include_recommendations: esta opção não pode ser usada sozinha. Quando ela for utilizada, serão incluídas recomendações para configuração do objeto de anúncio. Uma seção específica para recomendação será incluída na resposta, mas somente se existirem recomendações para tal especificação.
Se a chamada passar no processo de validação ou análise, a resposta será {"success": true}. Caso a chamada não seja aprovada, um erro será retornado com mais detalhes. Essas opções podem ser usadas para melhorar qualquer interface do usuário para exibir erros com muito mais antecedência, por exemplo, assim que um novo valor é digitado em qualquer campo correspondente a este objeto de anúncio, em vez de na etapa de carregamento/salvamento ou após a análise.

is_adset_budget_sharing_enabled
booleano
	
Se os conjuntos de anúncios secundários são gerenciados de acordo com o compartilhamento do orçamento do conjunto de anúncios. Com o compartilhamento do orçamento do conjunto de anúncios, os anunciantes agora podem compartilhar até 20% do orçamento deles com outros conjuntos de anúncios na mesma campanha.

is_reels_trending_ads_enabled
booleano
	
indicador da campanha de "anúncios com reels em alta"

is_skadnetwork_attribution
booleano
	
Sinalização para indicar que a campanha usará a SKAdNetwork, o que também significa que ela será direcionada apenas para iOS 14.x e versões posteriores.

is_using_l3_schedule
booleano
	
is_using_l3_schedule

iterative_split_test_configs
lista<Object>
	
É a matriz de configurações de teste A/B iterativo criadas na campanha.

lifetime_budget
int64
	
Orçamento total da campanha. Todos os conjuntos de anúncios da campanha compartilharão o orçamento. Você pode definir o orçamento no nível da campanha ou do conjunto de anúncios, mas não em ambos.

name
string
	
Nome da campanha.
aceita emojis

objective
enum{APP_INSTALLS, BRAND_AWARENESS, CONVERSIONS, EVENT_RESPONSES, LEAD_GENERATION, LINK_CLICKS, LOCAL_AWARENESS, MESSAGES, OFFER_CLAIMS, OUTCOME_APP_PROMOTION, OUTCOME_AWARENESS, OUTCOME_ENGAGEMENT, OUTCOME_LEADS, OUTCOME_SALES, OUTCOME_TRAFFIC, PAGE_LIKES, POST_ENGAGEMENT, PRODUCT_CATALOG_SALES, REACH, STORE_VISITS, VIDEO_VIEWS}
	
Objetivo da campanha. Se for especificado, a API validará que todos os anúncios criados na campanha correspondam ao objetivo.
Atualmente, com o objetivo BRAND_AWARENESS, todos os criativos devem ser ou somente imagens ou somente vídeos, não mistos.
Para obter mais informações, consulte a seção Validação do objetivo da experiência orientada por anúncios de resultado abaixo.

promoted_object
Objeto
	
O objeto que a campanha promove em todos os anúncios. Somente product_catalog_id é usado no nível do conjunto de anúncios.
Show child parameters

smart_promotion_type
enum{GUIDED_CREATION, SMART_APP_PROMOTION}
	
smart_promotion_type

special_ad_category
enum{NONE, EMPLOYMENT, HOUSING, CREDIT, ISSUES_ELECTIONS_POLITICS, ONLINE_GAMBLING_AND_GAMING, FINANCIAL_PRODUCTS_SERVICES}
	
special_ad_category

special_ad_category_country 

matriz<enum {AC, AD, AE, AF, AG, AI, AL, AM, AN, AO, AQ, AR, AS, AT, AU, AW, AX, AZ, BA, BB, BD, BE, BF, BG, BH, BI, BJ, BL, BM, BN, BO, BQ, BR, BS, BT, BV, BW, BY, BZ, CA, CC, CD, CF, CG, CH, CI, CK, CL, CM, CN, CO, CR, CU, CV, CW, CX, CY, CZ, DE, DJ, DK, DM, DO, DZ, EC, EE, EG, EH, ER, ES, ET, FI, FJ, FK, FM, FO, FR, GA, GB, GD, GE, GF, GG, GH, GI, GL, GM, GN, GP, GQ, GR, GS, GT, GU, GW, GY, HK, HM, HN, HR, HT, HU, ID, IE, IL, IM, IN, IO, IQ, IR, IS, IT, JE, JM, JO, JP, KE, KG, KH, KI, KM, KN, KP, KR, KW, KY, KZ, LA, LB, LC, LI, LK, LR, LS, LT, LU, LV, LY, MA, MC, MD, ME, MF, MG, MH, MK, ML, MM, MN, MO, MP, MQ, MR, MS, MT, MU, MV, MW, MX, MY, MZ, NA, NC, NE, NF, NG, NI, NL, NO, NP, NR, NU, NZ, OM, PA, PE, PF, PG, PH, PK, PL, PM, PN, PR, PS, PT, PW, PY, QA, RE, RO, RS, RU, RW, SA, SB, SC, SD, SE, SG, SH, SI, SJ, SK, SL, SM, SN, SO, SR, SS, ST, SV, SX, SY, SZ, TC, TD, TF, TG, TH, TJ, TK, TL, TM, TN, TO, TR, TT, TV, TW, TZ, UA, UG, UM, US, UY, UZ, VA, VC, VE, VG, VI, VN, VU, WF, WS, XK, YE, YT, ZA, ZM, ZW}>
	
special_ad_category_country

spend_cap
int64
	
Um limite de gastos para a campanha, que não pode ser excedido. Definido como um valor inteiro de subunidade na sua moeda com um valor mínimo de US$ 100 (ou equivalente local aproximado). Defina o valor como 922337203685478 para remover o limite de gastos. Não está disponível para campanhas de alcance e frequência ou premium de autoatendimento.

start_time
datetime
	
start_time

status
enum{ACTIVE, PAUSED, DELETED, ARCHIVED}
	
Apenas ACTIVE e PAUSED são válidos durante a criação. Outros status podem ser usados para atualização. Se for definido como PAUSED, os respectivos objetos derivados que estiverem ativos serão pausados e terão um status efetivo de CAMPAIGN_PAUSED.

stop_time
datetime
	
stop_time
Tipo de retorno
Esse ponto de extremidade é compatível com read-after-write e lê o nó em que você fez um POST.

Struct  {
success: bool,
}
Códigos de erro
Código de erro	Descrição

100
	
Parâmetro inválido

200
	
Erro de permissões

613
	
As chamadas para esta API ultrapassaram o limite de volume.

80004
	
Houve muitas chamadas para esta conta de anúncios. Espere um pouco e tente de novo. Para obter mais informações, consulte /docs/graph-api/overview/rate-limiting#ads-management.

2635
	
Você está chamando uma versão obsoleta da API de Anúncios. Atualize para a versão mais recente.

190
	
Token de acesso OAuth 2.0 inválido

801
	
Operação inválida
Exclusão
/{campaign_id}
É possível excluir uma campanha fazendo uma solicitação DELETE para /{campaign_id}.
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

80004
	
Houve muitas chamadas para esta conta de anúncios. Espere um pouco e tente de novo. Para obter mais informações, consulte /docs/graph-api/overview/rate-limiting#ads-management.

100
	
Parâmetro inválido

190
	
Token de acesso OAuth 2.0 inválido
/act_{ad_account_id}/campaigns
É possível desassociar uma campanha de uma conta de anúncios fazendo uma solicitação DELETE para /act_{ad_account_id}/campaigns.
Parâmetros
Parâmetro	Descrição

before_date
datetime
	
Defina uma data anterior para excluir campanhas anteriores a essa data.

delete_strategy
enum{DELETE_ANY, DELETE_OLDEST, DELETE_ARCHIVED_BEFORE}
	
Excluir estratégia
obrigatório

object_count
integer
	
Contagem de objetos
Tipo de retorno

Struct  {
objects_left_to_delete_count: unsigned int32,
deleted_object_ids:  List  [numeric string],
}
Códigos de erro
Código de erro	Descrição

100
	
Parâmetro inválido
Validação do objetivo
Estes objetivos antigos ficaram obsoletos a partir do lançamento da versão 17.0 da API de Marketing. Consulte a tabela de mapeamento de experiências de anúncios orientados para resultados abaixo para conhecer os novos objetivos e seus tipos de destino, metas de otimização e objetos promovidos correspondentes.
O objetivo da campanha selecionado pode limitar as configurações disponíveis para você.
Metas de otimização
Alguns objetivos da campanha aceitam apenas determinadas optimization_goals do conjunto de anúncios. Consulte Visão geral dos lances, validação.
Tipos de anúncios compatíveis
Objetivo	Tipos de anúncios compatíveis

APP_INSTALLS
	
Anúncios de imagem
Anúncios em vídeo
Anúncios em carrossel
Anúncios de experiência instantânea
Anúncios de app
Anúncios do Instagram (consulte limitações de posicionamento)
Anúncios de personalização de ativo de segmento
Anúncios com personalização de ativos de posicionamento
Anúncios em vários idiomas
Anúncios dinâmicos
Criativo dinâmico

BRAND_AWARENESS
	
Anúncios de imagem
Anúncios em vídeo
Anúncios em carrossel
Anúncios de experiência instantânea
Anúncios do Instagram (consulte limitações de posicionamento)
Anúncios de personalização de ativo de segmento
Anúncios com personalização de ativos de posicionamento
Anúncios em vários idiomas
Criativo dinâmico

CONVERSIONS
	
Anúncios de imagem
Anúncios em vídeo
Anúncios em carrossel
Anúncios de experiência instantânea
Anúncios de coleção
Anúncios de app
Anúncios do Instagram (consulte limitações de posicionamento)
Anúncios de clique para o Messenger
Anúncios de oferta
Anúncios de personalização de ativo de segmento
Anúncios com personalização de ativos de posicionamento
Anúncios em vários idiomas
Anúncios dinâmicos
Criativo dinâmico

EVENT_RESPONSES
	
Anúncios de imagem
Anúncios em vídeo
Anúncios em carrossel
Anúncios locais e de evento

LEAD_GENERATION
	
Anúncios de imagem
Anúncios em vídeo
Anúncios em carrossel
Anúncios de lead
Anúncios do Instagram (consulte limitações de posicionamento)
Anúncios com personalização de ativos de posicionamento
Criativo dinâmico

LINK_CLICKS
	
Anúncios de imagem
Anúncios em vídeo
Anúncios em carrossel
Anúncios de experiência instantânea
Anúncios de coleção
Anúncios de app
Anúncios do Instagram (consulte limitações de posicionamento)
Anúncios de oferta
Anúncios de personalização de ativo de segmento
Anúncios com personalização de ativos de posicionamento
Anúncios em vários idiomas
Anúncios dinâmicos
Criativo dinâmico

MESSAGES
	
Anúncios de imagem
Anúncios em vídeo
Anúncios em carrossel
Anúncios do Instagram (consulte limitações de posicionamento)
Anúncios do Messenger

POST_ENGAGEMENT
	
Anúncios de imagem
Anúncios em carrossel
Anúncios de experiência instantânea
Anúncios do Instagram (consulte limitações de posicionamento)

PRODUCT_CATALOG_SALES
	
Anúncios de imagem
Anúncios em carrossel
Anúncios de coleção
Anúncios do Instagram (consulte limitações de posicionamento)
Anúncios dinâmicos
Anúncios Colaborativos

REACH
	
Anúncios de imagem
Anúncios em vídeo
Anúncios em carrossel
Anúncios de experiência instantânea
Anúncios do Instagram (consulte limitações de posicionamento)
Anúncios de personalização de ativo de segmento
Anúncios com personalização de ativo de posicionamento
Anúncios em vários idiomas
Criativo dinâmico

STORE_VISITS
	
Anúncios de imagem
Anúncios em carrossel
Anúncios de experiência instantânea
Collection Ads
Anúncios do Instagram (consulte limitações de posicionamento)
Anúncios de oferta

VIDEO_VIEWS
	
Anúncios em vídeo
Anúncios em carrossel
Anúncios de experiência instantânea
Anúncios do Instagram (consulte limitações de posicionamento)
Anúncios de personalização de ativo de segmento
Anúncios com personalização de ativos de posicionamento
Anúncios em vários idiomas
Criativo dinâmico
Campos de objetivos e criativos
Consulte nosso guia de anúncios⁠ para ver uma lista de criativos compatíveis por objetivo. Na API, o objetivo determina quais criativos de anúncio são válidos.
Objetivo	Campos do criativo

APP_INSTALLS
	
object_story_id ou object_story_spec

CONVERSIONS
	
object_story_id ou object_story_spec
Observações:
Ao criar anúncios com link que não estão conectados a uma página, use estes campos de criativo: title, body, object_url e image_file ou image_hash.
O criativo não pode incluir anúncios com link que apontam para uma loja de apps.

EVENT_RESPONSES
	
object_story_id ou object_story_spec

LEAD_GENERATION
	
object_story_id ou object_story_spec

LINK_CLICKS
	
object_story_id ou object_story_spec
Observações:
O criativo não pode incluir anúncios com link que apontam para uma loja de apps.
Se você selecionar LINK_CLICKS como meta de otimização e evento de cobrança, será preciso incluir call_to_action.

MESSAGES
	
object_story_spec

PAGE_LIKES
	
object_story_id, object_story_spec, object_id e body

POST_ENGAGEMENT
	
object_story_id ou object_story_spec
Observação: o criativo não pode incluir anúncios com link que apontam para uma loja de apps.

VIDEO_VIEWS
	
object_story_id ou object_story_spec
Objetivos e especificações de rastreamento
As especificações de rastreamento são aplicadas por padrão com base no objetivo definido. Veja a lista completa de padrões por objetivo aqui.
É preciso levar em conta dois cenários importantes:
Os pixels de rastreamento não são aplicados por padrão. Eles devem ser especificados quando o objetivo for CONVERSIONS.
Os anúncios de aplicativo para celular deixarão de rastrear instalações ou eventos do aplicativo por padrão. Você precisa especificar explicitamente o rastreamento de instalações ou eventos do app para anúncios de app para celular. Caso contrário, não será possível rastrear seu anúncio.
Para especificar o rastreamento de uma instalação ou de um evento do app, defina o seguinte no seu anúncio:
tracking_specs=[{'action.type':['mobile_app_install'],'application':[{your_app_id}]},{'action.type':['app_custom_event'],'application':[{your_app_id}]}]
Objetivo e objetos promovidos
Certos objetivos exigem que promoted_object seja definida em conjuntos de anúncios. Consulte Objeto promovido para obter mais informações.
Objetivo	Campos promoted_object obrigatórios

APP_INSTALLS
	
application_id e object_store_url
Se optimization_goal for OFFSITE_CONVERSIONS: application_id, object_store_url e custom_event_type

CONVERSIONS
	
pixel_id (Identificação do pixel de conversão)
pixel_id (identificação do pixel do Facebook) e custom_event_type
pixel_id (ID do pixel do Facebook), pixel_rule e custom_event_type
event_id (ID de evento do Facebook) e custom_event_type
Para eventos de app para celular: application_id, object_store_url e custom_event_type
Para conversões offline: offline_conversion_data_set_id (ID do conjunto de dados offline) e custom_event_type

LINK_CLICKS
	
Para cliques no link de engajamento com o app em apps para celular ou de experiências instantâneas: application_id e object_store_url.

PRODUCT_CATALOG_SALES
	
product_set_id ou
product_set_id e custom_event_type

PAGE_LIKES
	
page_id

OFFER_CLAIMS
	
page_id
Objetivo e posicionamentos
Certos tipos de posicionamentos de anúncios são válidos apenas para objetivos ou criativos específicos. Consulte a Central de Ajuda para Empresas, Posicionamentos de anúncio disponíveis para objetivos de marketing⁠.
A tabela abaixo mostra alguns posicionamentos e os respectivos objetivos ou criativos compatíveis. É possível escolher uma combinação desses posicionamentos compatíveis. Observações:
Com LEAD_GENERATION, device_platforms: desktop não pode ser selecionada com publisher_platforms: instagram.
Se o objetivo for tráfego do site, story para facebook_positions não será compatível com destination_type: messenger.
Se o objetivo for tráfego do site, story para messenger_positions não será compatível com destination_type: messenger.
Se seu objetivo for tráfego no site, ig_search e explore_home para instagram_positions não serão compatíveis com destination_type: whatsapp & messenger.
Objetivo	Criativo	Posicionamento

APP_INSTALLS, promover um app de experiência instantânea
	
Anúncios de app para computador
	
device_platforms: desktop

APP_INSTALLS, promover um app para celular
	
Anúncios de app para celular com foto ou vídeo
	
device_platforms: mobile
publisher_platforms: facebook, feed, instagram, audience_network
facebook_positions: feed, video_feeds, instant articles e story
audience_network_positions: classic e rewarded_video
messenger_positions: story

BRAND_AWARENESS
	
todos
	
publisher_platforms: facebook, instagram, audience_network.
facebook_positions: feed, video_feeds, instream_video e story, que estão atualmente com disponibilidade limitada
instagram_positions: stream
audience_network_positions: classic, instream_video

CONVERSIONS
	
Anúncios de link de foto ou vídeo de uma página
	
Nós oferecemos compatibilidade com BRAND_AWARENESS, APP_INSTALL, POST_ENGAGEMENT, VIDEO_VIEWS, REACH, WEBSITE_CONVERSIONS e TRAFFIC. Também é compatível: right_hand_column e story para facebook_positions e messenger_positions: messenger_home e story.
facebook_positions: story só é compatível com o objetivo WEBSITE_CONVERSIONS
messenger_positions: story só é compatível com o objetivo WEBSITE_CONVERSIONS
Exceção: instream_video não é compatível com este objetivo.

CONVERSIONS
	
Anúncios com link não conectados a uma página.
	
facebook_positions: right_hand_column

CONVERSIONS (promovendo um app para celular)
	
Anúncios de app para celular com foto ou vídeo
	
device_platforms: mobile.
facebook_positions: right_hand_column e story. story como facebook_positions para este objetivo não é compatível com destination_type: messenger.
messenger_positions: messenger_home
story como um messenger_positions para este objetivo não é compatível com destination_type: messenger.

EVENT_RESPONSES
	
Anúncios de evento
	
A partir da versão 3.0, não é mais possível usar right_hand_column para facebook_positions.

EVENT_RESPONSES
	
Anúncios de post da Página
	
publisher_platforms: facebook.
A partir da versão 3.0, não é mais possível usar right_hand_column para facebook_positions.

LEAD_GENERATION
	
Anúncios de post da Página
	
device_platforms: mobile e desktop
publisher_platforms: facebook, instagram
facebook_positions: feed e story, que está com disponibilidade limitada
instagram_positions: stream
A partir da versão 3.0, não é mais possível usar right_hand_column para facebook_positions.

LINK_CLICKS
	
Anúncios de link de foto ou vídeo de uma página
	
Todos, incluindo right_hand_column e messenger_positions: messenger_home e story.

LINK_CLICKS
	
Anúncios com link não conectados a uma página.
	
facebook_positions: right_hand_column

LINK_CLICKS, promover um app de experiências instantâneas
	
Anúncios de app para computador
	
device_platforms: desktop
facebook_positions: right_hand_column

LINK_CLICKS, promover um app para celular
	
Anúncios de app para celular com foto ou vídeo
	
device_platforms: mobile, facebook_positions: right_hand_column

PAGE_LIKES
	
Criativos do vídeo
	
publisher_platforms: facebook
A partir da versão 3.0, não é mais possível usar right_hand_column para facebook_positions.

POST_ENGAGEMENT
	
Anúncios de publicação da Página com vídeo ou foto
	
publisher_platforms: facebook, instagram
device_platforms: mobile e desktop
A partir da versão 3.0, não é mais possível usar right_hand_column para facebook_positions.

POST_ENGAGEMENT
	
Anúncios de publicação da Página somente com texto
	
publisher_platforms: facebook, instagram
device_platforms: mobile e desktop
A partir da versão 3.0, não é mais possível usar right_hand_column para facebook_positions.

POST_ENGAGEMENT
	
Campanha nova
	
publisher_platforms: facebook, instagram
A partir da versão 3.0, não é mais possível usar right_hand_column para facebook_positions.

PRODUCT_CATALOG_SALES
	
anúncios dinâmicos
	
Todos, incluindo right_hand_column para facebook_positions.

REACH
	
Anúncios de alcance
	
Todos exceto right_hand_column para facebook_positions a partir da versão 3.0.
Inclui messenger_positions: story e story para facebook_positions.

STORE_VISITS
	
anúncios de visita ao estabelecimento
	
publisher_platforms: facebook
A partir da versão 3.0, não é mais possível usar right_hand_column para facebook_positions.

VIDEO_VIEWS
	
Anúncios de vídeo
	
publisher_platforms: facebook, instagram, audience_network.
Inclui story para facebook_positions, mas não com optimation_goal definido como TWO_SECOND_CONTINUOUS_VIDEO_VIEWS.
A partir da versão 3.0, não é mais possível usar right_hand_column para facebook_positions.
Objetivo, meta de otimização e attribution_spec
Use as janelas de atribuição de cliques e visualização no conjunto de anúncios para rastrear conversões. Depois, use-as na otimização da veiculação de anúncios. Isso é diferente da janela de atribuição usada para os relatórios de anúncios. Com attribution_spec, selecione uma combinação de janelas de cliques ou visualização de 1 ou 7 dias. As combinações que você pode usar dependem da optimization_goal do conjunto de anúncios e da objective da campanha.
Padrão recomendado attribution_spec
Talvez você não tenha fornecido attribution_spec ao criar conjuntos de anúncios otimizados para otimização de valor. Essa otimização está disponível para os objetivos de conversões, instalações do app e vendas do catálogo de produtos. No passado, usávamos uma janela de atribuição de cliques de 1 dia por padrão.
Objetivo	Meta de otimização	Combinação permitida

CONVERSIONS, PRODUCT_CATALOG_SALES
	
OFFSITE_CONVERSIONS
	
Clique de 1 dia
Clique em 7 dias
Clique de 1 dia e visualização de 1 dia
Clique de 7 dias e visualização de 1 dia

APP_INSTALLS, LINK_CLICKS
	
OFFSITE_CONVERSIONS
	
Clique de 1 dia
Clique em 7 dias

APP_INSTALLS
	
APP_INSTALLS
	
Clique de 1 dia
Clique de 1 dia e visualização com engajamento de 1 dia
Clique de 1 dia e visualização de 1 dia
Clique em 1 dia, visualização com engajamento em 1 dia e visualização em 1 dia

CONVERSIONS
	
INCREMENTAL_OFFSITE_ CONVERSIONS
	
Clique nulo, visualização nula
Para todas as outras combinações de optimization_goal e objective, só é possível usar clique de 1 dia para attribution_spec.
Validação de objetivo para experiências com anúncios orientados para resultados
A partir da versão 20.0, a meta de otimização de impressões está obsoleta para o objetivo de engajamento com o post e o tipo de destino ON_POST.
Valores de objetivo
Veja a seguir os novos objetivos:
OUTCOME_APP_PROMOTION
OUTCOME_AWARENESS
OUTCOME_ENGAGEMENT
OUTCOME_LEADS
OUTCOME_SALES
OUTCOME_TRAFFIC
Esses novos objetivos substituirão os originais APP_INSTALLS, BRAND_AWARENESS, CONVERSIONS, EVENT_RESPONSES, LEAD_GENERATION, LINK_CLICKS, LOCAL_AWARENESS, MESSAGES, OFFER_CLAIMS, PAGE_LIKES, POST_ENGAGEMENT, PRODUCT_CATALOG_SALES, REACH, STORE_VISITS, VIDEO_VIEWS. Continuaremos oferecendo suporte a esses objetivos originais durante 2022.
Limitações
A duplicação de campanhas com objetivos existentes para usar os novos valores de objetivo (OUTCOME_APP_PROMOTION, OUTCOME_AWARENESS, OUTCOME_ENGAGEMENT, OUTCOME_LEADS, OUTCOME_SALES, OUTCOME_TRAFFIC) poderá resultar em erro.
Exemplo
Experiências de anúncios orientadas por resultados
curl -X POST \
  -F 'name="New ODAX Campaign"' \
  -F 'objective="OUTCOME_ENGAGEMENT"' \
  -F 'status="PAUSED"' \
  -F 'special_ad_categories=[]' \
  -F 'access_token=ACCESS_TOKEN \
  https://graph.facebook.com/v11.0/
  act_AD_ACCOUNT_ID/campaigns
Legado
curl -X POST \
  -F 'name="New Campaign"' \
  -F 'objective="APP_INSTALLS"' \
  -F 'status="PAUSED"' \
  -F 'special_ad_categories=[]' \
  -F 'access_token=ACCESS_TOKEN \
  https://graph.facebook.com/v11.0/
  act_AD_ACCOUNT_ID/campaigns
Mapeamento de objetivos
Objetivo antigo
	
Novo objetivo
	
Tipo de destino
	
Meta de otimização
	
Objeto promovido

BRAND_AWARENESS
	
OUTCOME_AWARENESS
	
—
	
AD_RECALL_LIFT
	
page_id

REACH
	
OUTCOME_AWARENESS
	
—
	
REACH
	
page_id

IMPRESSIONS
	
page_id

LINK_CLICKS
	
OUTCOME_TRAFFIC
	
—
	
LINK_CLICKS
	
application_id, object_store_url

LANDING_PAGE_VIEWS
	
—

REACH
	
application_id, object_store_url

IMPRESSIONS
	
—

MESSENGER
	
LINK_CLICKS
	
—

REACH
	
—

IMPRESSIONS
	
—

WHATSAPP
	
LINK_CLICKS
	
page_id

REACH
	
page_id

IMPRESSIONS
	
page_id

PHONE_CALL
	
QUALITY_CALL
	
—

LINK_CLICKS
	
—

POST_ENGAGEMENT
	
OUTCOME_ENGAGEMENT
	
ON_POST
	
POST_ENGAGEMENT
	
—

REACH
	
—

IMPRESSIONS
	
—

PAGE_LIKES
	
OUTCOME_ENGAGEMENT
	
ON_PAGE
	
PAGE_LIKES
	
page_id

EVENT_RESPONSES
	
OUTCOME_ENGAGEMENT
	
ON_EVENT
	
EVENT_RESPONSES
	
—

POST_ENGAGEMENT
	
—

REACH
	
—

IMPRESSIONS
	
—

APP_INSTALL
	
OUTCOME_APP_PROMOTION
	
—
	
LINK_CLICKS
	
application_id, object_store_url

OFFSITE_CONVERSIONS
	
application_id, object_store_url

APP_INSTALLS
	
application_id, object_store_url

VIDEO_VIEWS
	
OUTCOME_AWARENESS
	
—
	
THRUPLAY
	
page_id

TWO_SECOND_CONTINUOUS_VIDEO_VIEWS
	
page_id

OUTCOME_ENGAGEMENT
	
ON_VIDEO
	
THRUPLAY
	
—

TWO_SECOND_CONTINUOUS_VIDEO_VIEWS
	
—

LEAD_GENERATION
	
OUTCOME_LEADS
	
ON_AD
	
LEAD_GENERATION
	
page_id

QUALITY_LEAD
	
page_id

LEAD_FROM_MESSENGER
	
LEAD_GENERATION
	
page_id

LEAD_FROM_IG_DIRECT
	
LEAD_GENERATION
	
page_id

PHONE_CALL
	
QUALITY_CALL
	
page_id

MESSAGES
	
OUTCOME_ENGAGEMENT
	
MESSENGER
	
CONVERSATIONS
	
page_id

LINK_CLICKS
	
page_id

MESSENGER
	
LEAD_GENERATION
	
page_id

CONVERSIONS
(Consulte Locais e eventos de conversão disponíveis por objetivo no Gerenciador de Anúncios da Meta⁠ para saber mais sobre os eventos de conversão disponíveis por objetivo.)
	
OUTCOME_ENGAGEMENT
	
—
	
OFFSITE_CONVERSIONS
	
pixel_id, custom_event_type

application_id, object_store_url

LINK_CLICKS
	
pixel_id, custom_event_type

application_id, object_store_url

REACH
	
pixel_id, custom_event_type

application_id, object_store_url

LANDING_PAGE_VIEWS
	
pixel_id, custom_event_type

IMPRESSIONS
	
pixel_id, custom_event_type

OUTCOME_LEADS
	
—
	
OFFSITE_CONVERSIONS
	
pixel_id, custom_event_type

application_id, object_store_url

LINK_CLICKS
	
pixel_id, custom_event_type

application_id, object_store_url

REACH
	
pixel_id, custom_event_type

application_id, object_store_url

LANDING_PAGE_VIEWS
	
pixel_id, custom_event_type

IMPRESSIONS
	
pixel_id, custom_event_type

OUTCOME_SALES
	
—
	
OFFSITE_CONVERSIONS
	
pixel_id, custom_event_type

application_id, object_store_url

MESSENGER
	
CONVERSATIONS
	
page_id, pixel_id, custom_event_type

PHONE_CALL
	
QUALITY_CALL
	
page_id

PRODUCT_CATALOG_SALES
	
OUTCOME_SALES
	
WEBSITE
	
LINK_CLICKS
	
Campanha: product_catalog_id
Conjunto de anúncios: product_set_id, custom_event_type

STORE_VISITS
	
OUTCOME_AWARENESS
	
—
	
REACH
	
place_page_set_id
Você achou esta página útil?