---
titulo: "Marketing API — referência de Ad (adgroup)"
url: https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/adgroup
capturado_em: 2026-09-10
hash: aeb5431cf6ce07c7
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
Anúncio
Updated: 6 de mai de 2026
Copiar para LLM
Ver como Markdown
Os anúncios no Status do WhatsApp são disponibilizados por meio da API de Marketing. Saiba mais sobre anúncios no Status do WhatsApp.
Contém informações para exibir um anúncio e associá-lo a um conjunto de anúncios. Cada anúncio é associado a um conjunto, e todos os anúncios de um conjunto têm o mesmo orçamento diário ou total, bem como programação e direcionamento. A criação de vários anúncios em um conjunto de anúncios permite otimizar a veiculação com base nas variações de imagens, links, vídeo, texto ou posicionamentos.
Os resultados retornados por synchronous_ad_review não representam a decisão final tomada durante a análise completa do seu anúncio.
Anúncios com conteúdo político
Para aumentar a transparência dos anúncios no Facebook, exigimos que os anunciantes que veiculam anúncios com conteúdo político concluam uma autorização. Essa medida será implementada nas próximas semanas. Também é necessário indicar que o anúncio inclui conteúdo político e fornecer o nome da forma de pagamento correspondente:
Sua conta de anúncios deve ser autorizada por um administrador da Página a fim de veicular anúncios políticos para esta Página. Isso é feito por um administrador da Página na aba Issue, Electoral or Political Ads em Page Settings.
Os usuários de contas de anúncios precisam passar por um processo de verificação.
Anúncios com menções da Página
Com as ferramentas para anúncios do Facebook, como o Gerenciador de Anúncios⁠ ou interfaces leves, é possível criar um anúncio com uma menção da Página. Isso exibe um link no anúncio que abre a página do Facebook de um anunciante. Não oferecemos essa funcionalidade na API de Marketing. Se você tentar criar um anúncio com a API com uma menção de página, ele será criado com sucesso. No entanto, veicularemos o anúncio sem a menção. Em vez disso, use uma das ferramentas para anúncios do Facebook.
Como direcionar localizações regulamentadas pelo RSD (União Europeia)
Para criar ou copiar um anúncio que esteja em um conjunto de anúncios direcionados nas localizações regulamentadas pela Lei de Serviços Digitais (DSA) da União Europeia, primeiro defina as informações de pagador/beneficiário. Para sua conveniência, se default_dsa_payor e default_dsa_beneficiary estiverem definidos em uma conta de anúncios, durante o processo de copiação, mesmo que o conjunto de anúncios original não defina um pagador ou beneficiário, ele será preenchido com valores padrão salvos. Para obter mais informações sobre como copiar anúncios direcionados a localizações regulamentadas pela Lei de Serviços Digitais na UE, consulte a documentação de referência Cópias de anúncios.
Direcionamento de anúncios para jovens na União Europeia (UE), no Espaço Econômico Europeu (EEE) e na Suíça
A Meta deixará de exibir anúncios para jovens na UE, no EEE e na Suíça a partir da semana de 6 de novembro de 2023. Ao criar novos conjuntos de anúncios ou atualizar os existentes que sejam direcionados a jovens na UE, no EEE e na Suíça, eles serão impedidos. Os conjuntos de anúncios existentes direcionados a jovens na UE, no EEE e na Suíça terão a veiculação pausada a partir da semana de 6 de novembro de 2023. Os conjuntos de anúncios existentes direcionados a jovens na UE, no EEE e na Suíça e em outras regiões verão um aviso de que os anúncios nos conjuntos de anúncios não serão mais veiculados a jovens na UE, no EEE e na Suíça.
Exemplos
Criar um anúncio:
curl -X POST \
  -F 'name="My Ad"' \
  -F 'adset_id="<AD_SET_ID>"' \
  -F 'creative={
       "creative_id": "<CREATIVE_ID>"
     }' \
  -F 'status="PAUSED"' \
  -F 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/ads
Para criar um anúncio político, forneça authorization_category com o valor POLITICAL. Por exemplo:
curl -X POST \
  -F 'name="My AdGroup"' \
  -F 'adset_id="<AD_SET_ID>"' \
  -F 'creative={
       "creative_id": "<CREATIVE_ID>"
     }' \
  -F 'status="PAUSED"' \
  -F 'authorization_category="POLITICAL"' \
  -F 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/ads
Consulte:
Campanha de anúncios, Conjunto de anúncios e Criativo do anúncio
Armazenamento de objetos de anúncio
Leitura
Um objeto de anúncio contém os dados necessários para exibir visualmente um anúncio e associá-lo ao conjunto de anúncios correspondente.
Pela identificação do anúncio
curl -X GET \
  -d 'fields="id,name"' \
  -d 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/<AD_ID>/
Por conta de anúncios
Para ler todos os anúncios de uma conta de anúncios:
Selecionar idioma
PHP Business SDK
Python Business SDK
cURL
use FacebookAds\Object\AdAccount;
use FacebookAds\Object\Fields\AdFields;

$account = new AdAccount($account_id);
$ads = $account->getAds(array(
  AdFields::NAME,
));

// Outputs names of Ads.
foreach ($ads as $ad) {
  echo $ad->name;
}

Por campanha de anúncios
Leia todos os anúncios de uma campanha:
curl -X GET \
  -d 'fields="name"' \
  -d 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/<AD_CAMPAIGN_ID>/ads
Por conjunto de anúncios
Para ler todos os anúncios de um conjunto:
Selecionar idioma
PHP Business SDK
Python Business SDK
cURL
use FacebookAds\Object\AdSet;
use FacebookAds\Object\Fields\AdSetFields;

$adset = new AdSet($adset_id);
$ads = $adset->getAds(array(
  AdFields::NAME,
));

// Outputs names of Ads .
foreach ($ads as $ad) {
  echo $ad->name;
}

Exemplo
Selecionar idioma
HTTP
PHP SDK
JavaScript SDK
Android SDK
iOS SDK
cURL
GET /v25.0/<ADGROUP_ID>/?fields=id%2Cname HTTP/1.1
Host: graph.facebook.com

Teste no Explorador da Graph API
Para saber como usar a Graph API, leia nosso guia Como usar a Graph API
Parâmetros
Parâmetro	Descrição

date_preset
enum{today, yesterday, this_month, last_month, this_quarter, maximum, data_maximum, last_3d, last_7d, last_14d, last_28d, last_30d, last_90d, last_week_mon_sun, last_week_sun_sat, last_quarter, last_year, this_week_mon_today, this_week_sun_today, this_year}
	
Predefinição de data

review_feedback_breakdown
booleano
	

Valor padrão: false
review_feedback_breakdown

time_range
{‘since’:YYYY-MM-DD,’until’:YYYY-MM-DD}
	
Intervalo de tempo. Se o intervalo de tempo for inválido, ele será ignorado.
Show child parameters
Campos
Campo	Descrição

id
string numérica
	
id

padrão

account_id
string numérica
	
account_id

ad_active_time
string numérica
	
ad_active_time

ad_review_feedback
AdgroupReviewFeedback
	
ad_review_feedback

ad_schedule_end_time
datetime
	
ad_schedule_end_time

ad_schedule_start_time
datetime
	
ad_schedule_start_time

adlabels
lista<AdLabel>
	
adlabels

adset
Conjunto de anúncios
	
adset

adset_id
string numérica
	
adset_id

bid_amount
int32
	
bid_amount

bid_info
map<string, unsigned int32>
	
bid_info

bid_type
enum {CPC, CPM, MULTI_PREMIUM, ABSOLUTE_OCPM, CPA}
	
bid_type

campaign
Campanha
	
campaign

campaign_id
string numérica
	
campaign_id

configured_status
enum {ACTIVE, PAUSED, DELETED, ARCHIVED}
	
configured_status

conversion_domain
string
	
conversion_domain

conversion_specs
lista<ConversionActionQuery>
	
conversion_specs

created_time
datetime
	
created_time

creative
AdCreative
	
creative

creative_asset_groups_spec
AdCreativeAssetGroupsSpec
	
creative_asset_groups_spec

demolink_hash
string
	
demolink_hash

display_sequence
int32
	
display_sequence

effective_status
enum {ACTIVE, PAUSED, DELETED, PENDING_REVIEW, DISAPPROVED, PREAPPROVED, PENDING_BILLING_INFO, CAMPAIGN_PAUSED, ARCHIVED, ADSET_PAUSED, IN_PROCESS, WITH_ISSUES}
	
effective_status

engagement_audience
booliano
	
engagement_audience

failed_delivery_checks
lista<DeliveryCheck>
	
failed_delivery_checks

is_autobid
booliano
	
is_autobid

issues_info
lista<AdgroupIssuesInfo>
	
issues_info

last_updated_by_app_id
id
	
last_updated_by_app_id

name
string
	
name

preview_shareable_link
string
	
preview_shareable_link

priority
unsigned int32
	
priority

recommendations
lista<AdRecommendation>
	
recomendações

source_ad
Anúncio
	
source_ad

source_ad_id
string numérica
	
source_ad_id

special_ad_categories
lista<enum>
	
special_ad_categories

status
enum {ACTIVE, PAUSED, DELETED, ARCHIVED}
	
status

targeting
Direcionamento
	
direcionamento

tracking_and_conversion_with_defaults
TrackingAndConversionWithDefaults
	
tracking_and_conversion_with_defaults

tracking_specs
lista<ConversionActionQuery>
	
tracking_specs

updated_time
datetime
	
updated_time
Bordas
Borda	Descrição

adcreatives
Borda<AdCreative>
	
adcreatives

adrules_governed
Borda<AdRule>
	
adrules_governed

copies
Borda<Adgroup>
	
copies

insights
Borda<AdsInsights>
	
insights

leads
Borda<UserLeadGenInfo>
	
leads

previews
Borda<AdPreview>
	
prévias

targetingsentencelines
Borda<TargetingSentenceLine>
	
targetingsentencelines
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

2635
	
Você está chamando uma versão obsoleta da API de Anúncios. Atualize para a versão mais recente.

2.500
	
Erro ao analisar a consulta da Graph API.

3018
	
A data de início do período não pode ultrapassar 37 meses a partir da data atual.

200
	
Erro de permissões

270
	
Esta solicitação da API de Anúncios não é permitida para apps com nível de acesso de desenvolvimento (o acesso de desenvolvimento é o padrão para todos os apps; solicite atualização). Verifique se o token de acesso pertence a um usuário que é administrador do app e da conta de anúncios.
Criação
Antes de criar um anúncio, você precisa de um conjunto de anúncios e um criativo do anúncio. É possível criar anúncios de forma síncrona e assíncrona.
Os novos anúncios estão em estado pendente e só serão veiculados após serem aprovados ou rejeitados pelo Facebook. Após aprovado, o anúncio será veiculado. Se não quiser que um anúncio seja veiculado automaticamente após a aprovação, crie-o e defina o conjunto de anúncios como paused. Consulte Conjunto de anúncios. Veicule o conjunto de anúncios quando estiver pronto.
Devido às alterações no iOS 14.5, o deep link diferido não está mais disponível para campanhas da SKAdNetwork.
Criação síncrona
Cria um anúncio de cada vez:
curl -X POST \
  -F 'name="My Ad"' \
  -F 'adset_id="<AD_SET_ID>"' \
  -F 'creative={
       "creative_id": "<CREATIVE_ID>"
     }' \
  -F 'status="PAUSED"' \
  -F 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/ads
Criação assíncrona
Crie vários anúncios por vez de forma assíncrona. Receber uma notificação quando todos os anúncios da solicitação existirem. Faça uma HTTP POST para: https://graph.facebook.com/{API_VERSION}/act_{AD_ACCOUNT_ID}/asyncadrequestsets
Use estes campos:
Campo	Descrição

name
tipo: string
	
Obrigatório.
Nome do conjunto de anúncios para anúncios recém-criados.

ad_specs
Tipo: matriz de especificações de anúncio
	
Obrigatório.
É possível criar anúncios para diferentes conjuntos de anúncios dentro da conta de anúncios atual. Para usar imagens no criativo do anúncio, forneça image_hash na especificação do anúncio depois de carregar a imagem em https://graph.facebook.com/{API_VERSION}/act_{AD_ACCOUNT_ID}/adimages.
image_file dentro de ad_specs.

notification_uri
tipo: string
	
Opcional.
Trabalho assíncrono concluído. Esse URI notifica o solicitante com uma POST e uma identificação do conjunto de anúncios.

notification_mode
tipo: string
	
Opcional.
Modo de notificação:
OFF – Sem notificação
ON_COMPLETE – Envio de notificação quando todos os anúncios do conjunto são criados.

Para obter informações sobre conjuntos de solicitações assíncronas, veja Solicitações assíncronas.
Limites
Estes são o número máximo de anúncios por objeto:
Limite	Valor

Anúncios em contas de anúncios regulares
	
5.000 anúncios não excluídos

Anúncios na conta de anúncios em massa
	
50.000 anúncios não excluídos

Anúncios em um conjunto de anúncios
	
50 anúncios não excluídos

Anúncios arquivados em uma conta de anúncios
	
100 mil anúncios arquivados
Exemplos
Baixar detalhes de um anúncio:
curl -X POST \
  -F 'name="My AdGroup with Redownload"' \
  -F 'adset_id="<AD_SET_ID>"' \
  -F 'creative={
       "creative_id": "<CREATIVE_ID>"
     }' \
  -F 'redownload=1' \
  -F 'status="PAUSED"' \
  -F 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/ads

/{ad_id}/copies
É possível fazer uma solicitação POST à borda copies a partir dos seguintes caminhos:
/{ad_id}/copies
Ao publicar nessa borda, um Ad será criado.
Parâmetros
Parâmetro	Descrição

adset_id
string numérica ou número inteiro
	
Identificação única de um objeto de conjunto de anúncios para torná-lo o principal da cópia. Ignore se quiser manter a cópia no conjunto de anúncios principal original.

creative_parameters
AdCreative
	
Entradas de criativo que serão usadas para construir o criativo no novo anúncio. As substituições acontecem no nível mais alto. Se nenhuma entrada for fornecida, o novo anúncio será criado com um criativo idêntico. Se alguma entrada for fornecida, esses parâmetros serão atribuídos ao criativo do anúncio criado pela chamada de API.
Aceita todos os parâmetros de criativo do anúncio, conforme especificado em /documentation/ads-commerce/marketing-api/reference/ad-account/adcreatives
aceita emojis

rename_options
JSON ou matrizes semelhantes a objetos
	
Opções de renomeação
Show child parameters

status_option
enum {ACTIVE, PAUSED, INHERITED_FROM_SOURCE}
	

Valor padrão: PAUSED
ACTIVE: o anúncio copiado terá o status ativo. PAUSED: o anúncio copiado terá o status pausado. INHERITED_FROM_SOURCE: o anúncio copiado terá o status principal.
Tipo de retorno
Este ponto de extremidade é compatível com read-after-write e lê o nó representado por copied_ad_id no tipo de retorno.

Struct  {
copied_ad_id: numeric string,
}
Códigos de erro
Código de erro	Descrição

100
	
Parâmetro inválido

200
	
Erro de permissões
/act_{ad_account_id}/ads
É possível fazer uma solicitação POST à borda ads a partir dos seguintes caminhos:
/act_{ad_account_id}/ads
Ao publicar nessa borda, um Ad será criado.
Exemplo
Selecionar idioma
HTTP
PHP SDK
JavaScript SDK
Android SDK
iOS SDK
cURL
POST /v25.0/act_<AD_ACCOUNT_ID>/ads HTTP/1.1
Host: graph.facebook.com

name=My+Ad&adset_id=%3CAD_SET_ID%3E&creative=%7B%22creative_id%22%3A%22%3CCREATIVE_ID%3E%22%7D&status=PAUSED

Teste no Explorador da Graph API
Para saber como usar a Graph API, leia nosso guia Como usar a Graph API
Parâmetros
Parâmetro	Descrição

ad_schedule_end_time
datetime
	
Um parâmetro opcional que define a hora de término de um anúncio individual. Se nenhum horário de término for definido, o anúncio será veiculado na programação da campanha.
Esse parâmetro só está disponível para campanhas de vendas e promoção do app.

ad_schedule_start_time
datetime
	
Parâmetro opcional que define a hora de início de um anúncio individual. Se não for definida uma hora de início, o anúncio será veiculado na programação da campanha.
Esse parâmetro só está disponível para campanhas de vendas e promoção do app.

adlabels
lista<Object>
	
Rótulos de anúncios associados ao anúncio.

adset_id
int64
	
Identificação do conjunto de anúncios, necessária na criação.

adset_spec
Especificação do conjunto de anúncios
	
A especificação do conjunto de anúncios para este anúncio. Quando a especificação é fornecida, o campo adset_id não é necessário.

audience_id
string
	
A identificação do público.

bid_amount
integer
	
Obsoleta. Não é mais permitido definir o valor bid_amount em um anúncio. Defina bid_amount para o conjunto de anúncios.

conversion_domain
string
	
O domínio onde as conversões acontecem. Obrigatório para criar ou atualizar um anúncio em uma campanha que compartilha dados com um pixel. Este campo será preenchido automaticamente para anúncios existentes por meio de inferência a partir de URLs de destino. Esse campo deve conter apenas os domínios de primeiro e segundo nível, e não o URL completo. Por exemplo, facebook.com.

creative
AdCreative
	
Este campo é obrigatório para criar. O ID ou a especificação do criativo que será usado no anúncio. Leia mais sobre criativos aqui. É possível fornecer a identificação em um objeto da seguinte forma:

{"creative_id": <CREATIVE_ID>}
ou uma especificação do criativo como a seguir:

{"creative": {\"name\": \"<NAME>\", \"object_story_spec\": <SPEC>}}
obrigatório
aceita emojis

creative_asset_groups_spec
string (CreativeAssetGroupsSpec)
	
creative_asset_groups_spec
aceita emojis

date_format
string
	
O formato da data.

display_sequence
int64
	
A sequência do anúncio dentro da mesma campanha.

engagement_audience
booleano
	
Sinalize para criar um público com base nos usuários que interagirem com este anúncio.

execution_options
list<enum{validate_only, synchronous_ad_review, include_recommendations}>
	

Valor padrão: Set
Uma configuração de execução
validate_only: quando esta opção for especificada, a chamada de API não realizará a mutação, mas executará as regras de validação em relação aos valores de cada campo.
include_recommendations: esta opção não pode ser usada sozinha. Quando ela for utilizada, serão incluídas recomendações para configuração do objeto de anúncio. Uma seção específica para recomendação será incluída na resposta, mas somente se existirem recomendações para tal especificação.
synchronous_ad_review: esta opção não deve ser usada sozinha. Deve ser sempre especificada com validate_only. Quando essas opções forem especificadas, a chamada de API realizará validações de integridade de anúncios, que incluem verificação do idioma da mensagem, regra de texto de 20% de imagem e assim por diante, bem como as lógicas de validação.
Se a chamada passar no processo de validação ou análise, a resposta será {"success": true}. Caso a chamada não seja aprovada, um erro será retornado com mais detalhes. Essas opções podem ser usadas para melhorar qualquer interface do usuário para exibir erros com muito mais antecedência, por exemplo, assim que um novo valor é digitado em qualquer campo correspondente a este objeto de anúncio, em vez de na etapa de carregamento/salvamento ou após a revisão.

include_demolink_hashes
booleano
	
Inclua os hashes de demolink.

name
string
	
Nome do anúncio.
obrigatório
aceita emojis

priority
int64
	
Prioridade

source_ad_id
string numérica ou número inteiro
	
ID do anúncio de origem, se aplicável.

status
enum{ACTIVE, PAUSED, DELETED, ARCHIVED}
	
Apenas ACTIVE e PAUSED são válidos durante a criação. Outros status podem ser usados para atualização. Quando um anúncio é criado, ele primeiro passará pela análise e terá o status de anúncio PENDING_REVIEW antes de concluir a análise e voltar para o status selecionado de ACTIVE ou PAUSED. Durante os testes, é recomendável definir um status PAUSED para os anúncios a fim de evitar gastos acidentais.

tracking_specs
Object
	
Com as especificações de rastreamento, é possível registrar as ações de pessoas no seu anúncio. Consulte Especificações de conversão e rastreamento.
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

200
	
Erro de permissões

613
	
As chamadas para esta API ultrapassaram o limite de volume.

368
	
A ação tentada foi considerada abusiva ou não é permitida.

80004
	
Houve muitas chamadas para esta conta de anúncios. Espere um pouco e tente de novo. Para obter mais informações, consulte /docs/graph-api/overview/rate-limiting#ads-management.

194
	
Pelo menos um parâmetro obrigatório está ausente.

500
	
A mensagem contém conteúdo banido

2635
	
Você está chamando uma versão obsoleta da API de Anúncios. Atualize para a versão mais recente.

190
	
Token de acesso OAuth 2.0 inválido

105
	
O número de parâmetros excedeu o máximo permitido para essa operação.
Atualização
Atualizar alguns campos:
curl -X POST \
  -F 'name="My New Ad"' \
  -F 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/<AD_ID>/
Limitações
Apenas os campos usados durante a criação do anúncio podem ser atualizados.
Não é possível atualizar adset_id e social_prefs.
Anúncios com status = ARCHIVED têm somente dois campos mutáveis: name e status. Só é possível alterar o último para DELETED.
Anúncios com status = DELETED só podem ter name alteradas.
Os anúncios em um conjunto com creative_sequence definida não podem ser alterados para PAUSED, ARCHIVED ou DELETED.
A duplicação de campanhas com objetivos existentes para usar os novos valores de objetivo (OUTCOME_APP_PROMOTION, OUTCOME_AWARENESS, OUTCOME_ENGAGEMENT, OUTCOME_LEADS, OUTCOME_SALES, OUTCOME_TRAFFIC) poderá resultar em erro.
Exemplos
Atualize o nome:
curl -X POST \
  -F 'name="My New Ad"' \
  -F 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/<AD_ID>/
Atualize o nome e baixe as informações do anúncio:
curl -X POST \
  -F 'adgroup_status="PAUSED"' \
  -F 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/<AD_ID>/
Atualizar o status:
curl -X POST \
  -F 'adgroup_status="PAUSED"' \
  -F 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/<AD_ID>/

Não é possível executar essa operação no ponto de extremidade.
Exclusão
Como excluir um anúncio
É possível remover valores de qualquer campo opcional atualizando o valor para ficar em branco. Não é possível excluir anúncios no conjunto de anúncios com configurações de creative_sequence.
curl -X DELETE \
  -F 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/<AD_ID>/

/{ad_id}
É possível excluir um anúncio fazendo uma solicitação DELETE para /{ad_id}.
Exemplo
Selecionar idioma
HTTP
PHP SDK
JavaScript SDK
Android SDK
iOS SDK
cURL
DELETE /v25.0/<ADGROUP_ID>/ HTTP/1.1
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

100
	
Parâmetro inválido

200
	
Erro de permissões

80004
	
Houve muitas chamadas para esta conta de anúncios. Espere um pouco e tente de novo. Para obter mais informações, consulte /docs/graph-api/overview/rate-limiting#ads-management.

368
	
A ação tentada foi considerada abusiva ou não é permitida.
Você achou esta página útil?