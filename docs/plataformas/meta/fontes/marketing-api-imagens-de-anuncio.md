---
titulo: "Marketing API — upload de imagens de anúncio (adimages)"
url: https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ad-account/adimages
capturado_em: 2026-09-11
hash: be4e49b8267579c5
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
Imagens de anúncio da conta de anúncios
Updated: 24 de mar de 2026
Copiar para LLM
Ver como Markdown
Os anúncios no Status do WhatsApp são disponibilizados por meio da API de Marketing. Saiba mais sobre anúncios no Status do WhatsApp.
Leitura
Imagens de anúncio que pertencem à conta de anúncios.
Exemplo
Selecionar idioma
HTTP
PHP SDK
JavaScript SDK
Android SDK
iOS SDK
GET /v25.0/{ad-account-id}/adimages HTTP/1.1
Host: graph.facebook.com

Teste no Explorador da Graph API
Para saber como usar a Graph API, leia nosso guia Como usar a Graph API
Parâmetros
Parâmetro	Descrição

biz_tag_id
int64
	
Identificação da tag da empresa para filtrar imagens.

business_id
string numérica ou número inteiro
	
Opcional. Auxilia com filtros, como os usados recentemente.

hashes
lista<string>
	
Hash da imagem.

minheight
int64
	
Altura mínima da imagem.

minwidth
int64
	
Largura mínima da imagem.

name
string
	
Nome da imagem usado no filtro de nomes de imagens.
Campos
A leitura a partir dessa borda retornará um resultado no formato JSON:

{
"data": [],
"paging": {},
"summary": {}
}
data
Uma lista de nós AdImage.
paging
Para obter mais detalhes sobre paginação, consulte o guia da Graph API.
summary
Informações agregadas sobre a borda, como contagens. Especifique os campos que deseja buscar no parâmetro de resumo (como summary=__type__).
Campo	Descrição

total_count
int32
	
O número total de imagens na conta de anúncios.

padrão
Códigos de erro
Código de erro	Descrição

200
	
Erro de permissões

80004
	
Houve muitas chamadas para esta conta de anúncios. Espere um pouco e tente de novo. Para obter mais informações, consulte /docs/graph-api/overview/rate-limiting#ads-management.

368
	
A ação tentada foi considerada abusiva ou não é permitida.

100
	
Parâmetro inválido

190
	
Token de acesso OAuth 2.0 inválido
Criação
/act_{ad_account_id}/adimages
Você pode fazer uma solicitação POST para a borda adimages a partir dos seguintes caminhos:
/act_{ad_account_id}/adimages
Ao publicar nessa borda, uma AdImage será criada.
Parâmetros
Parâmetro	Descrição

bytes
Cadeia de caracteres Base64 UTF-8
	
Arquivo de imagem. Exemplo: bytes = <image content in bytes format>

copy_from
JSON ou matrizes semelhantes a objetos
	
Com isso, a imagem do anúncio será copiada da conta de origem para a de destino.
{"source_account_id":"<SOURCE_ACCOUNT_ID>", "hash":"02bee5277ec507b6fd0f9b9ff2f22d9c"}
Show child parameters
Tipo de retorno
Este ponto de extremidade é compatível com read-after-write e lê o nó representado por images no tipo de retorno.

Map  {
string:  Map  {
string:  Struct  {
hash: string,
url: string,
url_128: string,
url_256: string,
url_256_height: string,
url_256_width: string,
height: int32,
width: int32,
name: string,
}}}
Códigos de erro
Código de erro	Descrição

100
	
Parâmetro inválido

200
	
Erro de permissões

80004
	
Houve muitas chamadas para esta conta de anúncios. Espere um pouco e tente de novo. Para obter mais informações, consulte /docs/graph-api/overview/rate-limiting#ads-management.

190
	
Token de acesso OAuth 2.0 inválido

368
	
A ação tentada foi considerada abusiva ou não é permitida.

613
	
As chamadas para esta API ultrapassaram o limite de volume.
Atualização
Não é possível executar essa operação no ponto de extremidade.
Exclusão
/act_{ad_account_id}/adimages
É possível desassociar uma AdImage de uma AdAccount fazendo uma solicitação DELETE para /act_{ad_account_id}/adimages.
Parâmetros
Parâmetro	Descrição

hash
string
	
Hash da imagem que você quer excluir.
obrigatório

image_id
string
	
ID da imagem que você quer excluir.
Tipo de retorno

Struct  {
success: bool,
}
Códigos de erro
Código de erro	Descrição

100
	
Parâmetro inválido

80004
	
Houve muitas chamadas para esta conta de anúncios. Espere um pouco e tente de novo. Para obter mais informações, consulte /docs/graph-api/overview/rate-limiting#ads-management.
Você achou esta página útil?