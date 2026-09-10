---
titulo: "Business Profile APIs — trabalhar com dados de ficha/local"
url: https://developers.google.com/my-business/content/location-data?hl=pt-br
capturado_em: 2026-09-10
hash: cea430d57b4798e4
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Trabalhar com dados de local
Nesta página
Antes de começar
Criar uma unidade
Excluir uma unidade
Encontrar uma unidade pelo nome
Retornar a versão do Google Maps
Listar unidades
Filtrar resultados ao exibir unidades
Classificar por campo de consulta

Neste tutorial, mostramos como criar e editar dados de unidades. Com a API My Business Business Information, você pode fazer o seguinte:

Criar uma unidade
Excluir uma unidade
Encontrar uma unidade por nome de recurso
Exibir todas as unidades de uma conta
Atualizar um ou mais campos de uma unidade

As unidades podem ser usadas no Google Ads, mas precisam ser verificadas para exibição na Pesquisa e no Maps. Os dados de unidade são representados pela coleção accounts.locations.

Antes de começar

Antes de usar a API My Business Business Information, é necessário registrar seu app e receber as credenciais do OAuth 2.0. Para saber como começar a usar essa API, consulte Configuração básica.

Criar uma unidade

Você pode usar a API My Business Business Information para criar uma nova unidade de uma empresa com accounts.locations.create.

Observação: a API My Business Business Information usa a mesma lista de campos obrigatórios que a IU do Perfil da empresa.

Para criar uma unidade, use o código abaixo:

HTTP
POST
https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?requestId=requestId&validateOnly=True|False

{
    "storeCode": "GOOG-SYD",
    "languageCode": "en-AU",
    "title": "Google Sydney",
    "phoneNumbers": {
      "primaryPhone": "02 9374 4000"
     }
    "storefrontAddress": {
      "addressLines": [
        "Level 5",
        "48 Pirrama Road"
      ],
      "locality": "Pyrmont",
      "postalCode": "2009",
      "administrativeArea": "NSW",
      "regionCode": "AU"
    },
    "websiteUri": "https://www.google.com.au/",
    "regularHours": {
      "periods": [
        {
          "openDay": "MONDAY",
          "closeDay": "MONDAY",
          "openTime": "09:00",
          "closeTime": "17:00"
        },
        {
          "openDay": "TUESDAY",
          "closeDay": "TUESDAY",
          "openTime": "09:00",
          "closeTime": "17:00"
        },
        {
          "openDay": "WEDNESDAY",
          "closeDay": "WEDNESDAY",
          "openTime": "09:00",
          "closeTime": "17:00"
        },
        {
          "openDay": "THURSDAY",
          "closeDay": "THURSDAY",
          "openTime": "09:00",
          "closeTime": "17:00"
        },
        {
          "openDay": "FRIDAY",
          "closeDay": "FRIDAY",
          "openTime": "09:00",
          "closeTime": "17:00"
        }
      ]
    },
    "categories": {
      "primaryCategory": {
        "name": "gcid:software_company"
      }
     }
}

Excluir uma unidade

Você pode usar a API My Business Business Information para excluir uma unidade com locations.delete.

Para excluir uma unidade, use o código abaixo:

HTTP
DELETE
https://mybusinessbusinessinformation.googleapis.com/v1/locations/{locationId}

Encontrar uma unidade pelo nome

Se você tiver muitas empresas associadas à sua conta, recomendamos criar uma única unidade. É possível filtrar pelo nome da empresa para encontrar uma unidade específica com locations.get.

Para encontrar uma unidade pelo nome, use o código abaixo: É necessário especificar um readMask para recuperar campos específicos. :

HTTP
GET
https://mybusinessbusinessinformation.googleapis.com/v1/locations/{locationId}?readMask={commaSeparatedFieldsToRetrieve}

Retornar a versão do Google Maps
HTTP

Para retornar a versão do Google Maps de uma unidade, insira googleUpdated no fim do URL da solicitação, como no exemplo abaixo:

GET
https://mybusinessbusinessinformation.googleapis.com/v1/locations/{locationId}:googleUpdated?readMask={commaSeparatedFieldsToRetrieve}

Se nenhuma correspondência for encontrada, um código de status HTTP 404 NOT FOUND será retornado. Veja mais detalhes sobre como gerenciar as atualizações do Google aqui.

Listar unidades

Ao gerenciar uma ou mais unidades, é recomendável listar todas aquelas que estão associados à sua conta. Use a API accounts.locations.list para listar todas as unidades vinculadas a um usuário.

Para criar uma lista de todas as unidades de propriedade ou gerenciadas por um usuário autenticado, use o seguinte:

HTTP
GET
https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}

Use um caractere curinga '-' para a conta no URL da solicitação de modo a incluir listas de propriedade indireta (de propriedade ou gerenciada por meio de um grupo):

HTTP
GET
https://mybusinessbusinessinformation.googleapis.com/v1/accounts/-/locations?readMask={commaSeparatedFieldsToRetrieve}

Filtrar resultados ao exibir unidades
HTTP

É possível usar filtros para limitar os resultados retornados quando você chama accounts.locations.list. Para filtrar uma solicitação, adicione uma expressão de filtro ao URL de base, conforme mostrado neste exemplo:

GET
https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}&filter={FIELD_NAME}=%22{YOUR_QUERY}%22

Sintaxe de consulta básica

Uma restrição tem a seguinte sintaxe: <field><operator><value>, em que o operador é EQUALS (=) ou HAS (:). Os operadores EQUALS (=) e HAS (:) são equivalentes a todos os campos, exceto locationName (veja a tabela abaixo).

As aspas são codificadas como "%22", e os espaços, como sinais de adição (+).

Exceto quando indicado, todas as comparações têm um formato de token indiferente a maiúsculas. Por exemplo, "4 drive" corresponde a "4, Privet Drive".

Combinar vários campos em uma consulta de filtro

A API permite que AND conecte todas as restrições de campos. No entanto, se você usar a palavra-chave OR, todas as restrições precisarão ser aplicadas ao mesmo campo. Por exemplo: locationName=A OR labels=B não é permitido.

Exemplo

O exemplo a seguir mostra uma expressão de filtro que retorna todas as unidades com o nome "Pepé Le Pew" para as categorias "restaurante_francês" ou "restaurante_europeu" e com marcador "recém-inaugurado".

locationName=%22Pepé+Le+Pew%22+AND+
(categories=%22french_restaurant%22+OR+
categories=%22european_restaurant%22)+AND+
labels=%22newly+open%22
Pesquisar por distância ou conta

O exemplo a seguir mostra como pesquisar unidades em uma determinada distância de um ponto geográfico:

HTTP
GET
https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}&filter=distance(latlng, geopoint({latitude}, {longitude}))<{distance}

Para filtrar unidades em até 1.600 km de Binter, Colorado, EUA, use o código abaixo:

GET
https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}&filter=distance(latlng, geopoint(40.01, -105.27))<1000.0

Lista de todos os campos de filtro compatíveis

Veja a seguir uma lista completa de todos os campos que podem ser usados para filtragem:

Campos	Descrição e exemplo
Campos de correspondência de string
title	

Nome real da empresa.

https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}&filter=title:"Bajis" (corresponde a qualquer nome de unidade com "Bajis" como substring)

https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}&filter=title="Bajis" (corresponde a qualquer nome de unidade com "Bajis" como token/palavra)

categories	

Combinação da categoria principal e das categorias adicionais. "gcid:" precisa ser omitido. Se houver várias categorias, esse filtro corresponderá a pelo menos uma que atenda a esse padrão.

https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}&filter=categories="french_restaurant"

phone_numbers.primary_phone	

Número de telefone principal no formato E.164 (por exemplo: "+441234567890").

https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}&filter=phone_numbers.primary_phone="+441234567890"

storefront_address.region_code	

Código regional CLDR do país/região do endereço.

https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}&filter=storefront_address.region_code="US"

storefront_address.administrative_area	

A subdivisão administrativa mais abrangente usada para endereços postais de um país ou uma região.

https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}&filter=storefront_address.administrative_area="CA"

storefront_address.locality	

Cidade do endereço.

https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}&filter=storefront_address.locality="New York"

storefront_address.postal_code	

CEP do endereço.

https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}&filter=storefront_address.postal_code="12345"

metadata.place_id	

Se a unidade tiver sido verificada e estiver conectada ao Google Maps ou exibida nele, esse campo será preenchido com o ID da unidade.

https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}&filter=metadata.place_id="12345"

openInfo.status	

Indica se a unidade está aberto (OPEN, CLOSED_PERMANENTLY).

https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}&filter=openInfo.status="OPEN"

https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}&filter=openInfo.status="CLOSED_PERMANENTLY"

labels	

Uma coleção de strings de formato livre para que você adicione tags à sua empresa. Diferentemente dos outros campos, esse valor precisa corresponder exatamente a um marcador completo, incluindo letras maiúsculas e minúsculas, e não apenas um token. Por exemplo, "XX" e "xx yy" não serão correspondentes a um marcador "XX YY".

https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}&filter=labels="newly open"

storeCode	

Identificador externo dessa unidade, que precisa ser exclusivo em uma determinada conta.

https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}&filter=storeCode="12345"

Funções
distance	

Permite filtrar com base na distância da unidade a partir de um ponto geográfico.

https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}&filter=distance(latlng, geopoint(1.0, -25.0))<1000.0

Classificar por campo de consulta

É possível classificar os resultados por nome da empresa ou código da loja, em ordem crescente ou decrescente. Vários critérios de ordenação são separados por vírgulas na string orderBy, como no exemplo abaixo:

HTTP
GET
https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask={commaSeparatedFieldsToRetrieve}&orderBy=locationName,storeCode

Aplicar patch a uma unidade

Use a API My Business Business Information para atualizar um ou mais campos de uma unidade com locations.patch.

Importante: é obrigatório usar um parâmetro updateMask em uma solicitação de patch. Inclua apenas os campos que precisam de atualização.

Para alterar um ou mais campos de uma unidade, use o código abaixo:

HTTP

Adicione os campos e os valores atualizados ao campo de unidade e use uma lista separada por vírgulas de campos atualizados como valor para fieldMask.

PATCH
https://mybusinessbusinessinformation.googleapis.com/v1/locations/{locationId}?languageCode=language&validateOnly=True|False&updateMask=title
{
    "title": "Google Shoes"
}

Isso foi útil?

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-02-18 UTC.