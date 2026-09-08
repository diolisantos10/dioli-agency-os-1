---
titulo: "Graph API — referência do endpoint debug_token (inspecionar token)"
url: https://developers.facebook.com/docs/graph-api/reference/debug_token
capturado_em: 2026-09-08
hash: f45640f7a1e02b8f
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Entrada da pesquisa
​
Graph API
Visão geral
Introdução
Solicitações em lote
Solicitações de depuração
Solução de erros
Field Expansion
Secure Requests
Registro de alterações
Reference
/video
Ad Set
Ad
Ads Archive
Application
Binary Transparency Artifacts
Binary Transparency Proofs
Branded Content Search
CPASAdvertiser Partnership Recommendation
Canvas
Canvas Button
Canvas Carousel
Canvas Footer
Canvas Header
Canvas Photo
Canvas Product List
Canvas Product Set
Canvas Text
Canvas Video
Collaborative Ads Directory
Comentários de objetos
Comment
Conversa
Conversa
Curtidas em objetos
Token de depuração
Documento de grupo
Event
Extended Credit Allocation Config
Games IAPProduct
Group Message
Host de App Link
Image Copyright
Instagram Business Asset
Instagram Oembed
Link
Live Video Input Stream
Mailing Address
Marco
Media Fingerprint
Mensagem
Message Template Library
Messenger Business Template
Object Private Replies
Objeto "sharedposts"
Oembed Page
Oembed Post
Oembed Video
Offline Conversion Data Set Upload
Pagamento
Page
Page Call To Action
Page Post
Page Upcoming Change
Página/informações
Perfil
Photo
Place
Place Topic
Post
Reações de objetos
IGUser
Solicitação
Tag de local
Threat Exchange Impact Report
URL
User
Usuário de teste
Video Copyright
Video List
Video Poll
Video Poll Option
Whats App Business Account
Whats App Message Template
Álbum
Versão Graph API
v26.0
Token de depuração /debug_token

Esse ponto de extremidade retorna metadados de um token de acesso. Isso inclui dados como o usuário para o qual o token foi emitido, se o token é válido e quando expira, bem como quais permissões o usuário tem no app.

Com isso, é possível depurar problemas de maneira programática com grandes conjuntos de tokens de acesso.

Leitura

HTTPPHP SDKJavaScript SDKAndroid SDKiOS SDKExplorador da Graph API
GET /v26.0/debug_token?input_token={input-token} HTTP/1.1
Host: graph.facebook.com

Permissões
Para acessar o ponto de extremidade, é necessário ter um token de acesso do app ou um token de acesso do usuário do desenvolvedor do app associado ao input_token que está sendo inspecionado.
Parâmetros
Nome	Descrição	Tipo

input_token

	

O token de acesso inspecionado. É preciso especificar esse parâmetro.

	

string

Campos
Nome	Descrição	Tipo

data

	

Wrapper de dados ao redor do resultado.

	

object

app_id

	

O ID do app a que o token de acesso se destina.

	

string

application

	

O nome do app a que o token de acesso se destina.

	

string

expires_at

	

O registro de data e hora de quando o token expira.

	

unixtime

data_access_expires_at

	

O registro de data e hora de quando o acesso do app aos dados do usuário expira.

	

unixtime

is_valid

	

Se o token de acesso ainda é válido.

	

bool

issued_at

	

O registro de data e hora de quando o token foi emitido.

	

unixtime

metadata

	

Os metadados gerais associados ao token de acesso. Pode conter dados como "sso", "auth_type" e "auth_nonce".

	

object

profile_id

	

Para tokens de acesso com imitação de identidade, o ID da página que o token contém.

	

string

scopes

	

A lista de permissões que o usuário concedeu ao app no token de acesso.

	

string[]

granular_scopes

	

A lista de permissões detalhadas que o usuário concedeu ao app no token de acesso. Se a permissão se aplicar a todos, os destinos não serão exibidos.

	

shape('scope' => string,'target_ids' => ?int[],)[]

user_id

	

O número de identificação do usuário a que o token de acesso se destina.

	

string

Publicar e excluir

Não é possível executar essas ações na borda.

Nesta Página
Token de depuração /debug_token
Leitura
Permissões
Parâmetros
Campos
Publicar e excluir