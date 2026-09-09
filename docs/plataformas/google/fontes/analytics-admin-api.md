---
titulo: "Google Analytics — Admin API (GA4): visão geral"
url: https://developers.google.com/analytics/devguides/config/admin/v1?hl=pt-br
capturado_em: 2026-09-09
hash: 6df32476df458562
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Visão geral da API Admin do Google Analytics
Nesta página
Introdução
Métodos disponíveis
Provisionamento de conta
Gerenciamento de contas
Gerenciamento das configurações de compartilhamento de dados pessoais
Exibir resumos da conta
Pesquisar eventos do histórico de mudanças
Gerenciamento de propriedades

Resumo: este documento apresenta uma visão geral da versão 1.0 da API Google Analytics Admin.

Essa API oferece recursos nos canais Alfa e Beta. Os produtos Alfa e Beta podem ter suporte limitado, e as mudanças feitas neles podem não ser compatíveis com outras versões Alfa e Beta.

Alfa: os recursos estão em um estágio inicial de prévia. Tentamos informar você sobre as mudanças futuras, mas podem acontecer alterações interruptivas antes de a API é lançada publicamente.

Beta: não são esperadas mudanças interruptivas nesse canal.

Para receber anúncios oficiais da API Google Analytics, inscreva-se no grupo de notificações da API Google Analytics.

Introdução

A API Admin do Google Analytics permite acesso programático aos dados de configuração do Google Analytics e é compatível apenas com propriedades do Google Analytics. Saiba mais sobre as propriedades do Google Analytics.

Você pode usar a API Admin do Google Analytics para:

Provisionar novas contas.
Gerenciar contas.
Gerenciar as configurações de compartilhamento de dados pessoais.
Exibir resumos da conta.
Pesquisar eventos do histórico de mudanças.
Gerenciar propriedades.
Gerenciar subpropriedades.
Confirmar a coleta de dados do usuário.
Gerenciar a configuração de retenção de dados de uma propriedade.
Gerenciar a configuração de indicadores do Google para uma propriedade (Alfa).
Gerenciar streams.
Gerenciar chaves secretas do Measurement Protocol.
Gerenciar o esquema de valor da conversão da SKAdNetwork (Alfa).
Gerar um snippet de tag do Google para fluxos de dados da Web (Alfa).
Gerenciar eventos principais.
Gerenciar eventos de conversão (descontinuado).
Gerenciar regras de criação de eventos (Alfa)
Gerenciar regras de edição de eventos (Alfa)
Gerenciar dimensões personalizadas.
Gerenciar métricas personalizadas.
Gerenciar vinculações entre propriedades do Google Analytics e projetos do Firebase.
Gerenciar vinculações entre propriedades do Google Analytics e contas do Google Ads.
Gerenciar propostas de vinculação entre uma propriedade do Google Analytics e um anunciante do Display &Video 360 (Alfa).
Gerenciar vinculações entre uma propriedade do Google Analytics e um anunciante do Display &Video 360 (Alfa).
Gerenciar vinculações entre uma propriedade do Google Analytics e o Search Ads 360 (Alfa).
Gerenciar vinculações entre uma propriedade do Google Analytics e um projeto do BigQuery (Alfa).
Gerenciar permissões de usuário para uma hierarquia de contas e propriedades do Google Analytics (Alfa).
Gerar relatórios de acesso aos dados.
Gerenciar públicos-alvo (Alfa).
Gerenciar conjuntos de dados expandidos (Alfa).
Gerenciar as configurações de desativação do processo de configuração automatizada do Google Analytics (Alfa).
Métodos disponíveis

Confira os métodos disponíveis.

Provisionamento de conta
accounts.provisionAccountTicket

Esse método retorna o campo accountTicketId que precisa ser incluído no URL dos Termos de Serviço (TOS, na sigla em inglês):

https://analytics.google.com/analytics/web/?provisioningSignup=false#/termsofservice/ACCOUNT_TICKET_ID

Quando um usuário acessa o URL dos TOS e aceita os Termos de Serviço, a criação de uma conta do Google Analytics é concluída. Consulte o exemplo de provisionamento de conta.

Gerenciamento de contas
accounts.delete
accounts.get
accounts.list
accounts.patch
Gerenciamento das configurações de compartilhamento de dados pessoais
accounts.getDataSharingSettings
Exibir resumos da conta
accountSummaries.list
Pesquisar eventos do histórico de mudanças
accounts.searchChangeHistoryEvents
Gerenciamento de propriedades
properties.get
properties.patch
properties.delete
properties.list
properties.create
Gerenciamento de subpropriedades (Alfa)
properties.provisionSubproperty
Confirmação de coleta de dados do usuário
properties.acknowledgeUserDataCollection
Gerenciamento da configuração de retenção de dados
properties.getDataRetentionSettings
properties.updateDataRetentionSettings
Gerenciamento da configuração de indicadores do Google (Alfa)
properties.getGoogleSignalsSettings
properties.updateGoogleSignalsSettings
Gerenciamento de fluxos de dados
properties.dataStreams.create
properties.dataStreams.get
properties.dataStreams.list
properties.dataStreams.patch
properties.dataStreams.delete
Gerenciamento de chaves secretas do Measurement Protocol
properties.dataStreams.measurementProtocolSecrets.create
properties.dataStreams.measurementProtocolSecrets.get
properties.dataStreams.measurementProtocolSecrets.patch
properties.dataStreams.measurementProtocolSecrets.list
properties.dataStreams.measurementProtocolSecrets.delete
Gerenciamento do esquema de valor da conversão da SKAdNetwork (Alfa)
properties.dataStreams.sKAdNetworkConversionValueSchema.get
properties.dataStreams.sKAdNetworkConversionValueSchema.create
properties.dataStreams.sKAdNetworkConversionValueSchema.delete
properties.dataStreams.sKAdNetworkConversionValueSchema.update
properties.dataStreams.sKAdNetworkConversionValueSchema.list
Gerenciamento de eventos principais
properties.keyEvents.create
properties.keyEvents.get
properties.keyEvents.list
properties.keyEvents.delete
properties.keyEvents.patch
Gerenciamento de eventos de conversão
Descontinuado: use o recurso e os métodos KeyEvent em vez disso.
properties.conversionEvents.create
properties.conversionEvents.get
properties.conversionEvents.list
properties.conversionEvents.delete
properties.conversionEvents.patch
Gerenciamento de regras de criação de eventos (Alfa)
properties.dataStreams.eventCreateRules.create
properties.dataStreams.eventCreateRules.get
properties.dataStreams.eventCreateRules.list
properties.dataStreams.eventCreateRules.delete
properties.dataStreams.eventCreateRules.patch
Gerenciamento de regras de edição de eventos (Alfa)
properties.dataStreams.eventEditRules.create
properties.dataStreams.eventEditRules.get
properties.dataStreams.eventEditRules.list
properties.dataStreams.eventEditRules.delete
properties.dataStreams.eventEditRules.patch
properties.dataStreams.eventEditRules.reorder
Gerenciamento de dimensões personalizadas
properties.customDimensions.create
properties.customDimensions.get
properties.customDimensions.list
properties.customDimensions.patch
properties.customDimensions.archive
Gerenciamento de métricas personalizadas
properties.customMetrics.create
properties.customMetrics.get
properties.customMetrics.list
properties.customMetrics.patch
properties.customMetrics.archive
Vinculação de projetos do Firebase
properties.firebaseLinks.create
properties.firebaseLinks.list
properties.firebaseLinks.delete
Vinculação de contas do Google Ads
properties.googleAdsLinks.create
properties.googleAdsLinks.list
properties.googleAdsLinks.patch
properties.googleAdsLinks.delete
Geração de tags do Google (Alfa)
properties.webDataStreams.getGlobalSiteTag
Propostas de vinculação entre uma propriedade do Google Analytics e um anunciante do Display &Video 360 (Alfa)
properties.displayVideo360AdvertiserLinkProposals.create
properties.displayVideo360AdvertiserLinkProposals.approve
properties.displayVideo360AdvertiserLinkProposals.cancel
properties.displayVideo360AdvertiserLinkProposals.list
properties.displayVideo360AdvertiserLinkProposals.get
properties.displayVideo360AdvertiserLinkProposals.delete
Vinculação de contas de anunciantes do Display &Video 360 (Alfa)
properties.displayVideo360AdvertiserLinks.create
properties.displayVideo360AdvertiserLinks.get
properties.displayVideo360AdvertiserLinks.list
properties.displayVideo360AdvertiserLinks.delete
properties.displayVideo360AdvertiserLinks.patch
Vinculação de contas do Search Ads 360 (Alfa)
properties.searchAds360Links.create
properties.searchAds360Links.delete
properties.searchAds360Links.patch
properties.searchAds360Links.list
properties.searchAds360Links.get

Saiba como configurar a integração do Search Ads 360 com o Analytics para uma propriedade do Google Analytics.

Vinculação de contas do BigQuery (Alfa)
properties.bigQueryLinks.create
properties.bigQueryLinks.delete
properties.bigQueryLinks.get
properties.bigQueryLinks.list
properties.bigQueryLinks.patch

Saiba como configurar a exportação do BigQuery para uma propriedade do Google Analytics.

Gerenciamento de permissões de usuário (Alfa)
accounts.accessBindings.create
accounts.accessBindings.delete
accounts.accessBindings.patch
accounts.accessBindings.list
accounts.accessBindings.get
accounts.accessBindings.batchCreate
accounts.accessBindings.batchDelete
accounts.accessBindings.batchUpdate
accounts.accessBindings.batchGet
properties.accessBindings.create
properties.accessBindings.delete
properties.accessBindings.patch
properties.accessBindings.list
properties.accessBindings.get
properties.accessBindings.batchCreate
properties.accessBindings.batchDelete
properties.accessBindings.batchUpdate
properties.accessBindings.batchGet
Relatórios de acesso aos dados
properties.runAccessReport

Consulte o guia de relatórios de acesso aos dados para mais informações sobre esse recurso.

Gerenciamento de públicos-alvo (Alfa)
properties.audiences.create
properties.audiences.archive
properties.audiences.patch
properties.audiences.list
properties.audiences.get

Saiba mais sobre públicos-alvo no Google Analytics.

Gerenciamento de conjuntos de dados expandidos (Alfa)
properties.expandedDataSets.create
properties.expandedDataSets.delete
properties.expandedDataSets.patch
properties.expandedDataSets.list
properties.expandedDataSets.get

Saiba mais sobre conjuntos de dados expandidos no Google Analytics 360.

Desativação do processo de configuração automatizada do Google Analytics (Alfa)
properties.setAutomatedGa4ConfigurationOptOut
properties.fetchAutomatedGa4ConfigurationOptOut

Saiba como gerenciar o status de desativação do processo de configuração automatizada do Google Analytics para uma propriedade da UA.

Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-08-12 UTC.