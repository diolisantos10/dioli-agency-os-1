---
titulo: "Google Ads API — OAuth: refresh token e detalhes internos"
url: https://developers.google.com/google-ads/api/docs/oauth/internals?hl=pt-br
capturado_em: 2026-09-08
hash: 2fafc03c9b06a0db
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Internos do OAuth 2.0 para a API Google Ads
Observação: Nossas bibliotecas de cliente cuidam automaticamente dos detalhes abordados neste guia. Portanto, continue lendo apenas se você tiver interesse no que está acontecendo nos bastidores ou se não estiver usando uma das nossas bibliotecas de cliente.

Esta seção é destinada a usuários avançados que já estão familiarizados com a especificação do OAuth 2.0 e sabem como usar o OAuth 2.0 com as APIs do Google.

Observação: a API Google Ads não oferece suporte ao login simultâneo com solicitação de acesso aos dados (híbrido) ou delegação de autoridade em todo o domínio (2LO).
Escopo

Um único token de acesso pode conceder diferentes graus de acesso a várias APIs. Um parâmetro variável chamado scope controla o conjunto de recursos e operações que um token de acesso permite. Durante a solicitação de token de acesso, seu app envia um ou mais valores no parâmetro scope.

O escopo da API Google Ads é:

https://www.googleapis.com/auth/adwords

Acesso off-line

É comum que um app cliente da API Google Ads solicite acesso off-line. Por exemplo, seu app pode querer executar jobs em lote quando o usuário não estiver on-line navegando no seu site.

Para solicitar acesso off-line para um tipo de app da Web, defina o parâmetro access_type como offline. Você pode encontrar mais informações no guia do OAuth2 do Google.

Para o tipo de app para computador, o acesso off-line é ativado por padrão. Não é necessário solicitá-lo explicitamente.

Cabeçalhos de solicitação
Cabeçalhos gRPC

Ao usar a API gRPC, inclua o token de acesso em cada solicitação. Você pode vincular uma Credential a um Channel para uso em todas as solicitações nesse canal. Também é possível enviar uma credencial personalizada para cada chamada. O guia de autorização gRPC contém mais detalhes sobre como processar a autorização.

Cabeçalhos REST

Ao usar a API REST, transmita o token de acesso pelo cabeçalho HTTP Authorization. Um exemplo de solicitação HTTP é mostrado abaixo:

# Returns the resource names of customers directly accessible by the user
# authenticating the call.
#
# Variables:
#   API_VERSION,
#   DEVELOPER_TOKEN,
#   OAUTH2_ACCESS_TOKEN:
#     See https://developers.google.com/google-ads/api/rest/auth#request_headers
#     for details.
#
curl -f --request GET \
"https://googleads.googleapis.com/v${API_VERSION}/customers:listAccessibleCustomers" \
--header "Content-Type: application/json" \
--header "developer-token: ${DEVELOPER_TOKEN}" \
--header "Authorization: Bearer ${OAUTH2_ACCESS_TOKEN}" \
Anterior
Requisitos de segurança
Avançar
Configurar um projeto do Console de APIs do Google para autorização
Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-08-03 UTC.