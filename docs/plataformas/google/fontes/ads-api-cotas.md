---
titulo: "Google Ads API — cotas de operações e recursos"
url: https://developers.google.com/google-ads/api/docs/best-practices/quotas?hl=pt-br
capturado_em: 2026-09-12
hash: 90c3eb9d05915e09
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Participe da nossa transmissão ao vivo no Discord no servidor da comunidade de publicidade e medição do Google e no YouTube em 20 de agosto, às 11h (horário de Brasília). Vamos discutir os novos recursos adicionados à versão 25.1 da API Google Ads.
 O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Limites e cotas de APIs

A API Google Ads impõe limites às operações de API, como o número de operações que podem ser enviadas em uma única solicitação de mutação. A tabela a seguir resume alguns dos limites e cotas importantes que você precisa conhecer.

Tipo de solicitação, limitação e código de erro
Operações com nível de acesso do Explorer	2.880 operações de API por dia em contas de produção
15.000 operações de API por dia em contas de teste	RESOURCE_EXHAUSTED
Operações com nível de acesso básico	15.000 operações de API por dia em contas de teste e de produção	RESOURCE_EXHAUSTED
Solicitações de mutação	10.000 operações de mutação por solicitação
100 operações de ação por solicitação	TOO_MANY_MUTATE_OPERATIONS
TOO_MANY_ACTION_OPERATIONS
Solicitações do serviço de planejamento	1 QPS	RESOURCE_EXHAUSTED
Solicitações do serviço de upload de conversões	2.000 conversões por solicitação	TOO_MANY_CONVERSIONS_IN_REQUEST
Solicitações do serviço de faturamento e orçamento da conta	1 operação por solicitação de mutação	TOO_MANY_MUTATE_OPERATIONS
Limites de operação de API diária

Os limites de uso diário da API são baseados no número de operações de API feitas pelo seu projeto do Google Cloud. As operações de API são a soma total das solicitações "get" e das operações de mutação. Os limites para operações de API diárias dependem do nível de acesso da API do seu projeto do Google Cloud. O guia Níveis de acesso e uso permitido descreve os limites específicos de operação de API para cada nível de acesso.

As solicitações que violam esses limites são rejeitadas com o erro: RESOURCE_EXHAUSTED.

Limitações do gRPC

Todas as bibliotecas de cliente da API Google Ads usam o gRPC para gerar solicitações e respostas. Por padrão, o gRPC tem um tamanho de mensagem de 4 MB, mas nossas bibliotecas de cliente definem o tamanho máximo da mensagem como 64 MB para aumentar a eficiência.

As respostas não podem exceder esse limite. Por exemplo, uma solicitação de pesquisa que inclui muitos campos pode gerar uma resposta que excede 64 MB de tamanho. Para evitar esse limite, você pode reduzir o número de campos selecionados ou usar o streaming. Para mutações, envie menos operações por solicitação.

As solicitações que violam essa limitação não geram um GoogleAdsError, mas geram um 429 Resource Exhausted erro do gRPC. Consulte a lista de códigos e mensagens de erro do gRPC.

Solicitações de mutação

Além de serem contabilizadas na cota de operação diária do usuário, uma solicitação de mutação não pode conter mais de 10.000 operações por solicitação.

As solicitações que violam essa limitação são rejeitadas com o erro: TOO_MANY_MUTATE_OPERATIONS.

Outros limites e considerações para serviços e tipos de solicitação específicos são descritos a seguir.

Solicitações de pesquisa

Uma solicitação Search ou SearchStream é contabilizada como uma operação na cota de operação diária do usuário. Uma solicitação SearchStream é contabilizada como uma operação de API, independentemente do número de lotes.

Solicitações paginadas

As solicitações paginadas (por exemplo, solicitações que contêm um next_page_token válido) não são contabilizadas na cota de operação diária de um usuário. No entanto, as solicitações de paginação que contêm um token de página expirado ou inválido geram uma exceção e são contabilizadas na cota de operação diária.

Para mais detalhes sobre paginação, consulte Paginação de resultados.

Outros tipos de solicitações

Uma solicitação que não seja Get, Mutate, Search, ou SearchStream request é contabilizada como uma operação na cota de operação diária do usuário.

Alguns exemplos dessas solicitações incluem:

BatchJobService.ListMutateJobResults
ConversionUploadService.UploadCallConversions
ConversionUploadService.UploadClickConversions
OfflineUserDataJobService.AddOfflineUserDataJobOperations
OfflineUserDataJobService.CreateOfflineUserDataJob
UserDataService.UploadUserData
Solicitações que retornam exceções de API

As solicitações rejeitadas com um GoogleAdsFailure ainda são contabilizadas na cota de operação diária do usuário.

As solicitações que falham, mas não retornam um GoogleAdsFailure, como um erro no nível da rede, não são contabilizadas na cota de operação diária do usuário, porque as solicitações nunca chegam ao serviço. Um exemplo disso é uma falha de conectividade de rede.

Serviço de planejamento de palavras-chave

Devido ao custo e à complexidade, os métodos do serviço de planejamento de palavras-chave a seguir estão sujeitos a limites separados de outros tipos de solicitações.

Limitado a 1 solicitação por segundo por CID:

KeywordPlanIdeaService.GenerateKeywordIdeas
KeywordPlanIdeaService.GenerateKeywordHistoricalMetrics
KeywordPlanIdeaService.GenerateKeywordForecastMetrics

As solicitações que violam essas limitações são rejeitadas com o erro: RESOURCE_EXHAUSTED.

1 QPS é calculado como 60 solicitações por 60 segundos.

Limitado a 2 solicitações por segundo por CID:

KeywordPlanIdeaService.GenerateAdGroupTheme

Tenha esses limites em mente ao criar um plano de palavras-chave.

Objeto do plano de palavras-chave	Número máximo
KeywordPlan por conta	10.000
KeywordPlanAdGroup por KeywordPlan	200
KeywordPlanAdGroupKeyword por KeywordPlan	10.000
KeywordPlanCampaignKeyword (palavras-chave negativas)	1.000
KeywordPlanCampaign por KeywordPlan	1
Serviço de insights sobre público-alvo

Os métodos a seguir em AudienceInsightsService estão sujeitos a limites de cota específicos.

Limitado a aproximadamente 200 solicitações por dia por CID:
AudienceInsightsService.GenerateAudienceCompositionInsights
AudienceInsightsService.GenerateSuggestedTargetingInsights
Limitado a 2 solicitações por segundo por projeto na nuvem do Google Cloud:
AudienceInsightsService.GenerateTargetingSuggestionMetrics
Serviço de upload de conversões

Limitado a 2.000 conversões de chamada ou clique por solicitação:

ConversionUploadService.UploadCallConversions
ConversionUploadService.UploadClickConversions

As solicitações que violam esses limites são rejeitadas com o erro: TOO_MANY_CONVERSIONS_IN_REQUEST.

Serviço de upload de ajustes de conversão

Limitado a 2.000 ajustes de conversão por solicitação:

ConversionAdjustmentUploadService.UploadConversionAdjustments

As solicitações que violam esses limites são rejeitadas com o erro: TOO_MANY_ADJUSTMENTS_IN_REQUEST.

Regras de valor da conversão

Limitado a 100.000 regras de valor da conversão por conta.

As solicitações que violam esse limite são rejeitadas com o erro ResourceCountLimitExceededError.ACCOUNT_LIMIT.

Observação: as regras de valor da conversão criadas usando a API Google Ads só ficam ativas se fizerem parte de um conjunto de regras de valor da conversão que inclua os ConversionValueRule nomes de recursos no campo conversion_value_rules e que tenha o status ConversionValueRuleSet definido como ENABLED. As regras de valor da conversão que não fazem parte de nenhum conjunto de regras de valor da conversão não ficam visíveis na interface do Google Ads e só podem ser gerenciadas usando a API.

Se já existir um ConversionValueRuleSet com um attachment_type de CUSTOMER para a conta, adicione novas regras de valor da conversão a esse conjunto para que elas sejam ativadas. Se nenhum conjunto de regras de valor da conversão existir, crie um e adicione suas regras de valor da conversão a ele, conforme descrito em Criar conjuntos de regras.

Serviços de faturamento e orçamento da conta

As mutações só podem ser feitas em contas configuradas para faturamento mensal.

As solicitações que violam essa limitação são rejeitadas com o erro: MUTATE_NOT_ALLOWED.

Somente 1 operação é permitida para solicitações de mutação.

As solicitações que violam essa limitação são rejeitadas com o erro: TOO_MANY_MUTATE_OPERATIONS.

Aguarde pelo menos 12 horas entre as alterações de pedidos com limite de orçamento na mesma conta. Fazer alterações antes de 12 horas pode resultar em falhas irrecuperáveis que só podem ser resolvidas pelo representante da sua conta do Google Ads.

Convites para contas de clientes

Novos usuários podem ser convidados para contas de clientes atuais com o CustomerUserAccessService. Como esse recurso envia e-mails de convite para outros usuários, ele pode ser usado de forma inadequada. Por isso, há limitações no comportamento dele:

Os usuários não podem receber mais de um convite pendente para a mesma conta de cliente. Se uma solicitação subsequente for feita para enviar um convite a um usuário que já tem um convite pendente, esse erro será retornado: ACCESS_INVITATION_ERROR_EMAIL_ADDRESS_ALREADY_HAS_PENDING_INVITATION.

As contas de cliente não podem ter mais de 70 convites pendentes ao mesmo tempo. Se uma solicitação for enviada e fizer com que esse valor seja excedido, esse erro será retornado: ACCESS_INVITATION_ERROR_PENDING_INVITATIONS_LIMIT_EXCEEDED.

Dados do usuário

Os dados do usuário são gerenciados com o UserDataService e o OfflineUserDataJobService.

Cada objeto UserData em uma operação create ou remove pertence a um único usuário final. O campo user_identifiers em um único UserData objeto é limitado a um máximo de 20 identificadores. Exceder esse limite em um único UserData objeto resultará em um OfflineUserDataJobError.TOO_MANY_USER_IDENTIFIERS ou UserDataError.TOO_MANY_USER_IDENTIFIERS erro.

Como processar usuários com mais de 20 identificadores

Se um único usuário final tiver mais de 20 identificadores que você precisa fazer upload, distribua esses identificadores em vários objetos UserData. Para garantir que o Google possa associar todos esses identificadores ao mesmo usuário final, cada objeto UserData desse usuário precisa incluir pelo menos um user_identifier comum, como o mesmo hashed_email, hashed_phone_number ou third_party_user_id. O Google usa esses identificadores compartilhados para vincular e mesclar as informações das operações UserData separadas ao perfil correto do usuário final.

Se você depende de informações de identificação pessoal (PII, na sigla em inglês), como e-mails ou números de telefone com hash, verifique se eles estão normalizados e com hash de acordo com os requisitos da API Google Ads (SHA-256, letras minúsculas, sem espaços em branco) para evitar falhas de vinculação.

Por exemplo, se um usuário tiver 30 endereços de e-mail, você poderá enviar dois objetos UserData.

UserData 1: {third_party_user_id: "user123", hashed_email: "email1@...", ... hashed_email: "email19@..."}
UserData 2: {third_party_user_id: "user123", hashed_email: "email20@...", ... hashed_email: "email30@..."}

O limite total para user_identifiers em todas as operações em um único OfflineUserDataJob permanece 100.000.

Outros tipos de limites

Um campo repetido, como uma lista de operações, que tem muitos itens em uma solicitação pode gerar o erro: REQUEST_SIZE_LIMIT_EXCEEDED. Essa mesma mensagem de erro também pode ser causada por outros problemas.

Se você encontrar essa limitação e estiver fazendo solicitações que usam um campo repetido, tente reduzir o número de itens no campo repetido implantando uma lista de operações em uma solicitação de mutação.

Ao fazer uma consulta GAQL, o número máximo de itens em uma cláusula IN é 20.000. Se você exceder esse limite, um FILTER_HAS_TOO_MANY_VALUES erro será retornado.

Anterior
Visão geral
Avançar
Limites do sistema
Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-09-12 UTC.