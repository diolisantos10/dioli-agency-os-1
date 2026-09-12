---
titulo: "Conversions API — parâmetros do evento (customer data, event data)"
url: https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters
capturado_em: 2026-09-12
hash: 85fd8ba90794aca6
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Parâmetros
Updated: 30 de jun de 2026
Copiar para LLM
Ver como Markdown
Esta página agrupa os parâmetros da API de Conversões por família, abrangendo os parâmetros de dados de eventos necessários e os parâmetros adicionais que são compatíveis com a atribuição de anúncios e a otimização da veiculação de anúncios.
Agora a API de Conversões é compatível com eventos de mensagens empresariais, da web, do app e offline.
Os eventos de sites compartilhados por meio da API de Conversões exigirão os parâmetros client_user_agent, action_source e event_source_url. Já os eventos que não são da web precisarão apenas de action_source. Esses parâmetros ajudam a melhorar a qualidade dos eventos usados na veiculação de anúncios e podem aprimorar o desempenho da campanha.
Ao usar a API de Conversões, você concorda que o parâmetro action_source seja preciso conforme seu conhecimento.
Parâmetros de corpo principal
data
test_event_code
Parâmetros de informações do cliente
em: Email — Hashing obrigatório
ph: número de telefone — Hashing obrigatório
fn: nome — Hashing obrigatório
ln: sobrenome — Hashing obrigatório
ge: gênero — Hashing obrigatório
db: data de nascimento — Hashing obrigatório
ct: cidade — Hashing obrigatório
st: estado — Hashing obrigatório
zp: código postal — Hashing obrigatório
country: país — Hashing obrigatório
external_id: ID externo — Hashing recomendado
client_ip_address: endereço IP do cliente — Não converter em hashes
client_user_agent: agente do usuário do cliente — Não converter em hashes
fbc: identificação do clique — Não converter em hashes
fbp: ID do navegador — Não converter em hashes
subscription_id: ID da assinatura — Não converter em hashes
fb_login_id: ID de Login do Facebook — Não converter em hashes
lead_id: identificação do lead — Não converter em hashes
anon_id: ID de instalação — Não converter em hashes (Observação: parâmetro válido somente para eventos do app)
madid: identificação do anunciante da plataforma móvel — Não converter em hashes (Observação: parâmetro válido somente para eventos do app)
page_id: identificação da página — Não converter em hashes
page_scoped_user_id: número de identificação do usuário no escopo da Página — Não converter em hashes
ctwa_clid: ID do clique para o WhatsApp — Não converter em hashes
ig_account_id: identificação da conta do Instagram — Não converter em hashes
ig_sid: identificação do clique para o Instagram — Não converter em hashes
Parâmetros de eventos do servidor
event_name
event_time
user_data
custom_data
event_source_url
opt_out
event_id
action_source
data_processing_options
data_processing_options_country
data_processing_options_state
referrer_url
customer_segmentation
Parâmetros de dados do app
advertiser_tracking_enabled
application_tracking_enabled
extinfo
campaign_ids
install_referrer
installer_package
url_schemes
windows_attribution_id
anon_id
madid
vendor_id
Observação: consulte a documentação API de Conversões para eventos do app para saber como integrar eventos do app.
Parâmetros padrão
Consulte uma lista com todos os parâmetros padrão que os usuários podem enviar à Meta.
Parâmetros de dados originais para eventos
event_name
event_time
order_id
event_id

API de Conversões para otimização de leads
Consulte o guia de integração do CRM para saber quais são os campos necessários para integrar o sistema de CRM com a API de Conversões em eventos de lead.
Veja também
Visão geral: parâmetros fbp e fbc
Saiba mais
API de Conversões: documentação
Como usar a API de Conversões
Meta Privacy and Data Use Guide⁠
Você achou esta página útil?