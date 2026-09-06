---
titulo: "Instagram — limite de publicação em 24h (content_publishing_limit)"
url: https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/content_publishing_limit
capturado_em: 2026-09-06
hash: db77b712a67442bc
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Limite da publicação de conteúdo para usuários do Instagram
Updated: 23 de jul de 2024
Copiar para LLM
Ver como Markdown
Representa o uso atual da publicação de conteúdo de um usuário do Instagram.
Requisitos
	API do Instagram com o Login do Instagram	API do Instagram com o Login do Facebook

Tokens de acesso
	
Token de acesso do usuário do Instagram
	
Token de acesso do usuário do Facebook

URL de hospedagem
	
graph.instagram.com
	
graph.facebook.com

Tipo de login
	
Login de Empresa no Instagram
	
Login do Facebook para Empresas

Permissões
	
instagram_business_basic
instagram_business_content_publish
	
instagram_basic
instagram_content_publish
pages_read_engagement
Caso uma função tenha sido concedida ao usuário do app por meio do Gerenciador de Negócios na Página conectada ao usuário do Instagram em questão, você precisará obter uma das seguintes permissões:
ads_management
ads_read
Criação
Esta operação não é compatível.
Leitura
GET /<IG_USER_ID>/content_publishing_limit
Determine o número de vezes que um usuário do Instagram publicou um contêiner durante um período específico. Consulte o guia Publicação de conteúdo para ver todas as etapas do processo.
Sintaxe da solicitação
GET https://graph.facebook.com/<API_VERSION>/<IG_USER_ID>/content_publishing_limit
  ?fields=<LIST_OF_FIELDS>
  &since=<UNIX_TIMESTAMP>
  &access_token=<ACCESS_TOKEN>
Parâmetros da string de consulta
Espaço reservado	Descrição do valor

<ACCESS_TOKEN>
Obrigatório.
String
	
O token de acesso do usuário do app.

<LIST_OF_FIELDS>
Lista separada por vírgulas
	
Uma lista separada por vírgulas de campos que devem ser retornados. Se for omitido, o campo quota_usage será retornado por padrão.

<UNIX_TIMESTAMP>
Registro de data e hora UNIX
	
Um registro de data e hora Unix com até 24 horas.
Campos
Campo	Descrição do valor

config
Objeto
	
Retorna estes valores:
quota_total – O número máximo de contêineres do Instagram que o usuário do app pode publicar durante o período de quota_duration (no momento, 50).
quota_duration – O tempo em segundos usado para calcular a quota_total (no momento, 86400 segundos ou 24 horas).

quota_usage
Lista separada por vírgulas
	
O número de vezes que o usuário do app publicou um contêiner do Instagram desde o período especificado no parâmetro da string de consulta since. Se o parâmetro since for omitido, o valor será o número de vezes que o usuário do app publicou um contêiner nas últimas 24 horas. Esse campo será retornado por padrão se o parâmetro da string de consulta fields for omitido na consulta.
Exemplo de solicitação
curl -X GET \
  'https://graph.facebook.com/v26.0/17841405822304914/content_publishing_limit?fields=quota_usage,rate_limit_settings&since=1609969714&access_token=IGQVJ...'
Exemplo de resposta
{
  "data": [
    {
      "quota_usage": 2,
      "config": {
        "quota_total": 50,
        "quota_duration": 86400
      }
    }
  ]
}

Atualização
Esta operação não é compatível.
Exclusão
Esta operação não é compatível.
Você achou esta página útil?