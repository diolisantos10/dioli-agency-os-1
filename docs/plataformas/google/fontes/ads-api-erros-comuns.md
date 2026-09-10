---
titulo: "Google Ads API — erros comuns e como tratá-los"
url: https://developers.google.com/google-ads/api/docs/best-practices/common-errors?hl=pt-br
capturado_em: 2026-09-10
hash: 88275efea8a24617
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Erros comuns

Nesta página, listamos os erros mais comuns e damos dicas sobre como evitá-los e resolvê-los. Para uma lista completa de erros, consulte as referências de erro. Se precisar de mais ajuda, entre em contato com o suporte.

google.rpc.ErrorInfo

ACCESS_TOKEN_SCOPE_INSUFFICIENT	
Resumo	O token de acesso do OAuth 2.0 não tem os escopos necessários.
Causas comuns	A solicitação é negada porque o token de acesso fornecido não inclui o escopo OAuth 2.0 da API Google Ads.
Como proceder	Verifique se o token de acesso tem os escopos necessários. Um motivo comum para esse erro é que você está reutilizando um token de acesso gerado com um conjunto diferente de escopos do OAuth. Consulte os parâmetros de autorização do OAuth para ver um exemplo de como gerar um novo token de acesso com os escopos necessários.
Dicas de prevenção	Verifique se o token de acesso tem os escopos necessários. Reautentique o usuário com os escopos necessários para receber um acesso com os escopos necessários. Se o aplicativo usa vários escopos do OAuth, talvez seja necessário implementar permissões granulares do OAuth.
google.auth.exceptions.RefreshError

invalid_grant	
Resumo	O token expirou ou foi revogado.
Causas comuns	Um projeto do Google Cloud Platform com uma tela de permissão OAuth configurada para um tipo de usuário externo e um status de publicação Testing recebe um token de atualização com validade de sete dias.
Como proceder	O status de publicação do seu projeto do Google é Testing. Por isso, o token de atualização expira a cada sete dias e recebe um erro invalid_grant. Acesse o console de APIs do Google e navegue até a tela de permissão OAuth. Em seguida, mude o status de publicação para In production para evitar que o token de atualização expire em sete dias.
Dicas de prevenção	Consulte Apps não verificados.
AdError

CANNOT_USE_AD_SUBCLASS_FOR_OPERATOR	
Resumo	Esse operador não pode ser usado com uma subclasse de anúncio.
Causas comuns	Tentativa de modificar atributos diferentes do status do anúncio.
Como proceder	N/A
Dicas de prevenção	Não é possível modificar um anúncio depois de criá-lo. Se você quiser modificar o anúncio, é preciso criar um novo e remover o antigo. No entanto, o status do anúncio pode ser modificado usando MutateAdGroupAds.

INVALID_INPUT	
Resumo	Um dos campos em um anúncio contém caracteres inválidos.
Causas comuns	Usar caracteres especiais em URLs.
Como proceder	N/A
Dicas de prevenção	Valide os URLs no seu app antes de fazer a solicitação de API.

LINE_TOO_WIDE	
Resumo	Um dos campos em um anúncio era maior do que o comprimento máximo permitido. Consulte Sobre os anúncios de texto.
Causas comuns	Ter uma linha de texto muito longa.
Como proceder	N/A
Dicas de prevenção	Valide o comprimento da linha antes de fazer a solicitação de API.
AdGroupAdError

AD_GROUP_AD_LABEL_ALREADY_EXISTS	
Resumo	Esse rótulo já está associado a alguns dos anúncios.
Causas comuns	Tentativa de associar o rótulo a anúncios que já foram associados.
Como proceder	N/A
Dicas de prevenção	Primeiro, verifique se o rótulo a ser adicionado já está associado aos anúncios.

CANNOT_OPERATE_ON_REMOVED_ADGROUPAD	
Resumo	Uma operação tentou atualizar um anúncio removido.
Causas comuns	Depois que um anúncio é removido, não é possível atualizá-lo, incluindo mudanças no status.
Como proceder	N/A
Dicas de prevenção	Verifique se seu código não tenta atualizar anúncios removidos.
AdGroupCriterionError

INVALID_KEYWORD_TEXT	
Resumo	O texto da palavra-chave contém caracteres inválidos. Consulte Adicionar palavras-chave.
Causas comuns	O texto da palavra-chave contém caracteres inválidos.
Como proceder	N/A
Dicas de prevenção	Valide o texto da palavra-chave no seu app antes de fazer uma solicitação à API.
AdGroupError

DUPLICATE_ADGROUP_NAME	
Resumo	Um grupo de anúncio está sendo adicionado ou renomeado, mas o nome já é usado por outro grupo.
Causas comuns	Criar um grupo de anúncios com o nome de um grupo de anúncios ativo ou pausado.
Como proceder	Registre o erro e apresente uma mensagem de erro ao usuário, sugerindo opcionalmente um nome exclusivo para o grupo de anúncios ou mostrando a lista de nomes em uso.
Dicas de prevenção	N/A
AssetError

DUPLICATE_ASSET	
Resumo	Duas operações em uma única solicitação contêm uma operação de criação para um recurso com os mesmos dados binários.
Causas comuns	Uma solicitação de mutação com operações de criação duplicadas que contêm os mesmos dados binários.
Como proceder	Crie o recurso em uma solicitação separada e vincule a ele na solicitação subsequente ou use um ID temporário na mesma solicitação.
Dicas de prevenção	N/A
AuthenticationError

CLIENT_CUSTOMER_ID_INVALID	
Resumo	O ID de cliente não é um número.
Causas comuns	Usar um ID de cliente inadequado.
Como proceder	N/A
Dicas de prevenção	123-456-7890 deve ser 1234567890. Consulte Começar para mais detalhes.

CLIENT_CUSTOMER_ID_IS_REQUIRED	
Resumo	O ID de cliente não foi especificado no cabeçalho HTTP.
Causas comuns	Não especificar um ID de cliente no cabeçalho HTTP.
Como proceder	N/A
Dicas de prevenção	O ID de cliente do cliente é obrigatório para todas as chamadas. Portanto, especifique um no cabeçalho HTTP. Considere usar nossas bibliotecas de cliente, já que elas fazem isso por você.

CUSTOMER_NOT_FOUND	
Resumo	Nenhuma conta foi encontrada para o ID de cliente adicionado ao cabeçalho.
Causas comuns	Tentativa de acessar uma conta recém-criada antes que ela seja estabelecida no back-end.
Como proceder	Aguarde cinco minutos inicialmente e depois repita o processo a cada 30 segundos.
Dicas de prevenção	Aguarde alguns minutos após a criação da conta para emitir solicitações nela.

GOOGLE_ACCOUNT_COOKIE_INVALID	
Resumo	O token de acesso no cabeçalho da solicitação é inválido ou expirou.
Causas comuns	O token de acesso foi invalidado.
Como proceder	Solicite um novo token. Se você estiver usando uma das nossas bibliotecas de cliente, consulte a documentação dela para saber como atualizar o token.
Dicas de prevenção	Armazene e reutilize os tokens de acesso até que eles expirem.

NOT_ADS_USER	
Resumo	A Conta do Google usada para gerar o token de acesso não está associada a nenhuma conta do Google Ads.
Causas comuns	As informações de login enviadas correspondem a uma Conta do Google que não tem o Google Ads ativado.
Como proceder	Faça login com uma conta do Google Ads válida (normalmente sua conta de administrador) para o fluxo OAuth. Você também pode convidar a Conta do Google para acessar uma conta do Google Ads fazendo login na sua conta de administrador, selecionando a conta de cliente ou de administrador em questão, navegando até Tools and Settings > Access and security e adicionando o endereço de e-mail da Conta do Google.
Dicas de prevenção	N/A

OAUTH_TOKEN_INVALID	
Resumo	O token de acesso do Oauth no cabeçalho é inválido.
Causas comuns	O token de acesso transmitido no cabeçalho HTTP estava incorreto.
Como proceder	N/A
Dicas de prevenção	Verifique se você enviou o token de acesso correto associado à sua conta. Às vezes, eles podem ser confundidos com tokens de atualização e códigos de autorização. Se você quiser uma credencial que possa acessar todas as contas de cliente em uma conta de administrador, verifique se você tem o token de atualização da conta de administrador. Consulte o guia de autenticação do usuário.

ORGANIZATION_NOT_ASSOCIATED_WITH_DEVELOPER_TOKEN	
Resumo	O token de desenvolvedor já está associado a uma organização do Google Cloud e não pode ser associado a outra.
Causas comuns	O token de desenvolvedor não está associado a um projeto na nuvem do Google Cloud na mesma organização do Google Cloud que o projeto na nuvem usado originalmente para fazer solicitações.
Como proceder	Verifique se o ID do cliente OAuth está associado a projetos do Google Cloud na mesma organização do Google Cloud se você já fez solicitações de API com o token de desenvolvedor.
Dicas de prevenção	Verifique se todos os seus projetos do Google Cloud estão associados à mesma organização do Google Cloud. Um projeto do Google Cloud só pode ser associado a um token de desenvolvedor, mas um token de desenvolvedor pode ser associado a vários projetos na organização.

DEVELOPER_TOKEN_INVALID	
Resumo	O token de desenvolvedor é inválido.
Causas comuns	As causas comuns desse erro incluem erros de digitação no token de desenvolvedor ou a configuração incorreta do token em um cabeçalho da solicitação diferente.
Como proceder	Copie o token de desenvolvedor da central de APIs para evitar erros de digitação. Você pode encontrar a Central de API na sua conta de administrador do Google Ads. Além disso, verifique se você está definindo o token de desenvolvedor no cabeçalho correto. Às vezes, os tokens de desenvolvedor são confundidos com tokens de atualização e códigos de autorização do OAuth. Leia mais sobre os diferentes cabeçalhos de solicitação aqui.
Dicas de prevenção	N/A
AuthorizationError

CUSTOMER_NOT_ENABLED	
Resumo	Não é possível acessar a conta do cliente porque ela não está ativada.
Causas comuns	Isso acontece quando a conta do cliente não concluiu a inscrição ou foi desativada.
Como proceder	Faça login na interface do Google Ads e verifique se você concluiu o processo de inscrição para essa conta. Para contas desativadas, consulte Reativar uma conta do Google Ads cancelada.
Dicas de prevenção	Para verificar se uma conta de cliente está desativada, procure o status CANCELLED.

DEVELOPER_TOKEN_NOT_APPROVED	
Resumo	O token de desenvolvedor foi aprovado apenas para uso com contas de teste e tentou acessar uma conta que não é de teste.
Causas comuns	Um token de desenvolvedor de teste foi usado para acessar uma conta que não é de teste.
Como proceder	Confirme se você quer acessar uma conta que não é de teste. Se for o caso, solicite o upgrade do seu token de desenvolvedor para o acesso padrão ou básico.
Dicas de prevenção	N/A

DEVELOPER_TOKEN_PROHIBITED	
Resumo	O token de desenvolvedor não é permitido com o projeto enviado na solicitação.
Causas comuns	Cada projeto do Console de APIs do Google pode ser associado ao token de desenvolvedor de apenas uma conta de administrador. Depois que você faz uma solicitação da API Google Ads, o token de desenvolvedor é pareado permanentemente ao projeto do Console de APIs do Google. Se você não usar um novo projeto do Console de APIs do Google, vai receber um erro DEVELOPER_TOKEN_PROHIBITED ao fazer uma solicitação.
Como proceder	N/A
Dicas de prevenção	Se você mudar para um token de desenvolvedor em uma nova conta de administrador, será necessário criar um projeto no Console de APIs do Google para solicitações da API Google Ads que usam o token do novo administrador.

USER_PERMISSION_DENIED	
Resumo	O cliente autorizado não tem acesso ao cliente operacional.
Causas comuns	Autenticar como um usuário com acesso a uma conta de administrador, mas não especificar login-customer-id na solicitação.
Como proceder	N/A
Dicas de prevenção	Especifique o login-customer-id como o ID da conta de administrador sem hifens (-). As bibliotecas de cliente têm suporte integrado para isso.
BiddingError

BID_TOO_MANY_FRACTIONAL_DIGITS	
Resumo	O valor do lance não é um múltiplo exato da unidade mínima da moeda da conta. Por exemplo, US$ 0,015 (15000 em micros) não é um lance válido.
Causas comuns	N/A
Como proceder	N/A
Dicas de prevenção	Verifique se os lances são múltiplos da unidade mínima da moeda da conta.

BID_TOO_BIG	
Resumo	O erro é retornado, mesmo que o lance esteja dentro do orçamento da campanha.
Causas comuns	N/A
Como proceder	N/A
Dicas de prevenção	Verifique se a conta está participando do Google Ad Grants. Se for o caso, restrinja os lances de CPC ao máximo prescrito pelo programa.
CampaignBudgetError

MONEY_AMOUNT_LESS_THAN_CURRENCY_MINIMUM_CPC	
Resumo	O valor do orçamento é muito baixo.
Causas comuns	N/A
Como proceder	N/A
Dicas de prevenção	Verifique se o valor do orçamento é maior ou igual à unidade mínima da moeda da conta.

NON_MULTIPLE_OF_MINIMUM_CURRENCY_UNIT	
Resumo	O valor do orçamento terá muitas casas decimais significativas quando for convertido de um microvalor para um valor na moeda da conta.
Causas comuns	N/A
Como proceder	N/A
Dicas de prevenção	Verifique se o valor do orçamento é divisível pela unidade mínima da moeda da conta.
CampaignError

DUPLICATE_CAMPAIGN_NAME	
Resumo	Uma campanha está sendo adicionada ou renomeada, mas o nome já é usado por outra campanha.
Causas comuns	Criar uma nova campanha com um nome já existente em uma campanha ativa ou pausada.
Como proceder	Registre o erro e apresente uma mensagem ao usuário, sugerindo um nome de campanha exclusivo ou mostrando a lista de nomes em uso.
Dicas de prevenção	N/A

CANNOT_SET_CAMPAIGN_KEYWORD_MATCH_TYPE	
Resumo	Tentativa de mudar a configuração de tipo de correspondência de palavra-chave no nível da campanha em uma campanha com a IA Max ativada.
Causas comuns	Com a IA Max ativada, as configurações de correspondência ampla no nível da campanha são descontinuadas porque todas as palavras-chave são tratadas como correspondência ampla por padrão. A tentativa de definir ou modificar esse campo vai acionar o erro.
Como proceder	Recomende que o usuário use o parâmetro `disable_search_term_matching` no nível do grupo de anúncios em vez de definir a correspondência ampla no nível da campanha.
Dicas de prevenção	Evite definir "keyword_match_type" como "BROAD" (ou qualquer outro valor) na campanha se "ai_max_setting.enable_ai_max" estiver definido como "true". Ative ou desative a correspondência de termos de pesquisa no nível do grupo de anúncios usando "disable_search_term_matching".
CriterionError

KEYWORD_HAS_INVALID_CHARS	
Resumo	Adicionar ou editar palavras-chave que contêm caracteres inválidos.
Causas comuns	Use caracteres especiais, como ! @ % *, nas palavras-chave.
Como proceder	N/A
Dicas de prevenção	Evite usar caracteres não permitidos nas palavras-chave. Consulte Adicionar palavras-chave.
DistinctError

DUPLICATE_ELEMENT	
Resumo	A solicitação contém dois parâmetros idênticos e redundantes.
Causas comuns	N/A
Como proceder	N/A
Dicas de prevenção	Remova duplicatas (operações, parâmetros, elementos da lista) antes de fazer a solicitação. Procure campos com a restrição DistinctElements.
InternalError

DEADLINE_EXCEEDED	
Resumo	A solicitação expirou e não foi concluída rápido o suficiente para retornar uma resposta.
Causas comuns	Uma solicitação de pesquisa gerou uma resposta muito grande, ou uma solicitação de mutação era muito grande para ser processada.
Como proceder	Aguarde cerca de 30 segundos e reenvie a solicitação. Se o erro persistir, tente dividir a solicitação em várias outras menores que possam ser concluídas mais rapidamente.
Dicas de prevenção	Leia Segmentação para entender como ela pode afetar o tamanho de uma resposta. Conheça as limitações da camada de transporte do gRPC.

INTERNAL_ERROR	
Resumo	Ocorreu um evento inesperado durante o processamento da solicitação.
Causas comuns	A API não está funcionando corretamente devido a um bug.
Como proceder	Repita as solicitações que falharam com esse erro usando uma programação de espera exponencial para as novas tentativas.
Dicas de prevenção	N/A

TRANSIENT_ERROR	
Resumo	Ocorreu um erro interno temporário. Tente de novo.
Causas comuns	Esse erro ocorre quando a API encontra um problema temporário internamente.
Como proceder	Repita as solicitações que falharam com esse erro usando uma programação de espera exponencial para as novas tentativas.
Dicas de prevenção	N/A
InvalidGrantError

invalid_grant (malformed auth code)	
Resumo	O código de autorização trocado por tokens OAuth estava malformado.
Causas comuns	Isso acontece ao tentar gerar um token de atualização para um usuário que já recebeu acesso ao aplicativo solicitante. Por exemplo, isso pode acontecer ao executar o Exemplo de geração de credenciais de usuário mais de uma vez para as mesmas credenciais de cliente OAuth e usuário autorizador.
Como proceder	Para regenerar um token de atualização para uma determinada combinação de usuário autorizador e credenciais de cliente OAuth, revogue um token de atualização atual. Observação: a revogação de um token o torna inutilizável para acesso à API Google Ads e invalida todos os tokens de acesso que foram gerados com o token de atualização.
Dicas de prevenção	Armazene o token de atualização em um local seguro para evitar a necessidade de regeneração.
MutateError

RESOURCE_NOT_FOUND	
Resumo	A solicitação se referia a um recurso que não foi encontrado.
Causas comuns	A solicitação tentou mudar ou referenciar um recurso que não existe ou foi removido. Ou o nome do recurso fornecido está incorreto.
Como proceder	Use uma solicitação de pesquisa para recuperar o nome de um recurso antes de enviar uma solicitação de mutação. Consulte nossos guias de biblioteca de cliente, que incluem documentação sobre como criar nomes de recursos válidos em todas as linguagens compatíveis.
Dicas de prevenção	Não crie nomes de recursos manualmente. Use um dos métodos auxiliares oferecidos pelas nossas bibliotecas de cliente.
NotEmptyError

EMPTY_LIST	
Resumo	Uma lista obrigatória está vazia.
Causas comuns	Transmitir uma lista vazia de operações para um método mutate.
Como proceder	N/A
Dicas de prevenção	N/A
QuotaError

RESOURCE_EXHAUSTED	
Resumo	Um limite de frequência do sistema foi excedido.
Causas comuns	N/A
Como proceder	N/A
Dicas de prevenção	Configure pequenos atrasos entre as solicitações ou combine mais operações em menos solicitações.
RangeError

TOO_LOW	
Resumo	Um valor é mais baixo do que o mínimo permitido.
Causas comuns	Esquecer de especificar um ID, o que resulta na transmissão de um valor 0.
Como proceder	N/A
Dicas de prevenção	Verifique se há limitações de período documentadas na referência da API.
RequestError

INVALID_INPUT	
Resumo	A solicitação está formatada incorretamente.
Causas comuns	O URL ou o conteúdo da solicitação está incorreto.
Como proceder	N/A
Dicas de prevenção	N/A

REQUIRED_FIELD_MISSING	
Resumo	A solicitação não tem informações obrigatórias.
Causas comuns	Faltam campos obrigatórios ao tentar adicionar uma entidade.
Como proceder	Registre o erro e apresente uma mensagem de erro ao usuário. O atributo fieldPath do erro indica qual campo está faltando.
Dicas de prevenção	Consulte a referência da API para saber quais campos são obrigatórios.
ResourceCountLimitExceededError

RESOURCE_LIMIT	
Resumo	A solicitação está tentando criar um recurso que faria com que o número total desses recursos excedesse um limite especificado.
Causas comuns	Há vários limites para o número de recursos que podem existir em determinados contextos.
Como proceder	Identifique o limite que está sendo encontrado revisando os Limites do sistema. Reutilize um recurso atual ou remova recursos para criar espaço para novos.
Dicas de prevenção	Use consultas de pesquisa para monitorar o número de recursos com limitações.
StringLengthError

TOO_LONG	
Resumo	A string atribuída ao campo especificado é maior que o limite.
Causas comuns	Os títulos ou as descrições dos anúncios têm muito texto.
Como proceder	Identifique o limite que está sendo encontrado, modifique a string de acordo e reenvie a solicitação.
Dicas de prevenção	Esteja ciente dos limites de comprimento da string.

Anterior
Outros métodos
Avançar
Exemplos
Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-08-03 UTC.