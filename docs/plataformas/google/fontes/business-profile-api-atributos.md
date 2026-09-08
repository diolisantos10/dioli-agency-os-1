---
titulo: "Business Profile APIs — atributos de local"
url: https://developers.google.com/my-business/content/attributes?hl=pt-br
capturado_em: 2026-09-08
hash: a271196222c752e6
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Adicionar atributos
Nesta página
Mostrar atributos
Solicitação
Resposta
Definir atributos para uma ficha

Observação: os atributos disponíveis para as fichas da empresa mudam dependendo da categoria e do país. Eles são dinâmicos e podem ser alterados a qualquer momento.

Os atributos permitem que as empresas incluam informações adicionais, como opções de acessibilidade e comodidades.

Observação: para adicionar ou modificar links de posicionamento de ação, use a API Place Actions e, para atributos específicos de hospedagem, a API Lodging.
Mostrar atributos

Para ver uma lista de atributos de uma categoria principal e de um país, chame attributes.list. Os atributos são dinâmicos e precisam ser verificados com frequência. Veja o exemplo mostrado na seção a seguir.

Solicitação

Para listar os atributos de uma ficha com base na categoria e nos códigos de região e idioma dela, confira o exemplo abaixo:

HTTP
GET https://mybusinessbusinessinformation.googleapis.com/v1/attributes?regionCode=US&languageCode=EN&categoryName=gcid:restaurant

Para listar os atributos de uma ficha usando o ID do local, confira o exemplo abaixo:

HTTP
GET https://mybusinessbusinessinformation.googleapis.com/v1/attributes?parent=locations/{locationId}
Resposta

A resposta parcial a seguir retorna atributos com vários valores AttributeValueType.

{
    {
      "attributeId": "has_live_music",
      "valueType": "BOOL",
      "displayName": "Live music",
      "groupDisplayName": "Highlights",
      "valueMetadata": [
        {
          "value": true,
          "displayName": "Live music"
        }
      ],
      "displayStrings": {
        "uiText": "Live music",
        "standaloneText": "Has live music",
        "negativeText": "No live music"
      }
    },
    {
      "attributeId": "has_wheelchair_accessible_entrance",
      "valueType": "BOOL",
      "displayName": "Wheelchair accessible entrance",
      "groupDisplayName": "Accessibility",
      "valueMetadata": [
        {
          "value": true,
          "displayName": "Wheelchair accessible entrance"
        },
        {
          "value": false,
          "displayName": "No wheelchair accessible entrance"
        }
      ],
      "displayStrings": {
        "uiText": "Wheelchair accessible entrance",
        "standaloneText": "Has wheelchair accessible entrance",
        "negativeText": "No wheelchair accessible entrance"
      }
    },
    {
      "attributeId": "has_braille_menu",
      "valueType": "BOOL",
      "displayName": "Braille menu",
      "groupDisplayName": "Offerings",
      "valueMetadata": [
        {
          "value": true,
          "displayName": "Braille menu"
        }
      ],
      "displayStrings": {
        "uiText": "Braille menu",
        "standaloneText": "Has braille menu",
        "negativeText": "No braille menu"
      }
    },
    {
      "attributeId": "has_no_contact_delivery",
      "valueType": "BOOL",
      "displayName": "No-contact delivery",
      "groupDisplayName": "Offerings",
      "valueMetadata": [
        {
          "value": true,
          "displayName": "No-contact delivery"
        }
      ],
      "displayStrings": {
        "uiText": "No-contact delivery",
        "standaloneText": "Has no-contact delivery",
        "negativeText": "No no-contact delivery"
      }
    },
    {
      "attributeId": "welcomes_lgbtq",
      "valueType": "BOOL",
      "displayName": "LGBTQ friendly",
      "groupDisplayName": "Planning",
      "valueMetadata": [
        {
          "value": true,
          "displayName": "LGBTQ friendly"
        }
      ],
      "displayStrings": {
        "uiText": "LGBTQ friendly",
        "standaloneText": "LGBTQ friendly",
        "negativeText": "Not showing LGBT friendly"
      }
    },
    {
      "attributeId": "wi_fi",
      "valueType": "ENUM",
      "displayName": "Wi-Fi",
      "groupDisplayName": "Amenities",
      "valueMetadata": [
        {
          "value": "free_wi_fi",
          "displayName": "Free"
        },
        {
          "value": "paid_wi_fi",
          "displayName": "Paid"
        }
      ],
      "displayStrings": {
        "uiText": "Wi-Fi",
        "standaloneText": "Has Wi-Fi",
        "negativeText": "No Wi-Fi"
      }
    },
    {
      "attributeId": "pay_credit_card_types_accepted",
      "valueType": "REPEATED_ENUM",
      "displayName": "Credit cards",
      "groupDisplayName": "Payments",
      "isRepeatable": true,
      "valueMetadata": [
        {
          "value": "american_express",
          "displayName": "American Express"
        },
        {
          "value": "china_union_pay",
          "displayName": "China Union Pay"
        },
        {
          "value": "diners_club",
          "displayName": "Diners Club"
        },
        {
          "value": "discover",
          "displayName": "Discover"
        },
        {
          "value": "jcb",
          "displayName": "JCB"
        },
        {
          "value": "mastercard",
          "displayName": "MasterCard"
        },
        {
          "value": "visa",
          "displayName": "VISA"
        }
      ],
      "displayStrings": {
        "uiText": "Credit cards",
        "standaloneText": "Credit cards accepted",
        "negativeText": "Credit cards not accepted"
      }
    }
  ]
}
Definir atributos para uma ficha
Observação: para adicionar um link do cardápio à ficha, primeiro confirme se este atributo é aceito: attributes/url_menu using attributes.list. Em seguida, defina o atributo da ficha de acordo com o método abaixo.

Para definir atributos usando locations.updateAttributes, configure o parâmetro attributeMask com os atributos que você quer atualizar.

No exemplo a seguir, definimos atributos de tipos de cartão de crédito aceitos e de opção de entrega para uma ficha de empresa.

Importante: use apenas atributos com suporte em attributes.list.
HTTP
PATCH
https://mybusinessbusinessinformation.googleapis.com/v1/locations/{locationId}?attributeMask=pay_credit_card_types_accepted,has_no_contact_delivery
{
  "name": "locations/{locationId}/attributes
  "attributes": [
    {
      "name": "has_no_contact_delivery",
      "values": [ true ]
    },
    {
      "name": "pay_credit_card_types_accepted",
      "repeatedEnumValue": {
        "setValues": [
          "american_express",
          "visa"
        ]
      }
    }
  ]
}
Isso foi útil?

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-02-18 UTC.