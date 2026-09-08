---
titulo: "Business Profile APIs — enviar fotos e mídia"
url: https://developers.google.com/my-business/content/upload-photos?hl=pt-br
capturado_em: 2026-09-08
hash: 5774f1834ea1e3b7
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Fazer upload de mídia
Nesta página
Upload usando um URL
Upload usando bytes

Você pode usar a API Google My Business para fazer o upload de mídia com os dois métodos a seguir:

Upload usando um URL
Upload usando bytes
Upload usando um URL

Se quiser fazer o upload de fotos usando um URL, realize a seguinte chamada para Media.Create. Utilize a category relevante conforme necessário.

POST https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/media
{
  "mediaFormat": "PHOTO",
  "locationAssociation": {
    "category": "COVER"
  },
  "sourceUrl": “http://example.com/biz/image.jpg",
}

Se quiser fazer o upload de vídeos usando um URL com a API Google My Business, realize a seguinte chamada para Media.Create:

POST https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/media
{
  "mediaFormat": "VIDEO",
  "locationAssociation": {
    "category": "ADDITIONAL"
  },
  "sourceUrl": “http://example.com/biz/video.mp4",
}
Upload usando bytes

Para fazer o upload de mídia usando bytes com a API Google My Business, siga estas etapas:

Observação: só é possível fazer o upload de mídia usando bytes para locais. Se quiser incluir mídia em uma postagem local, faça o upload usando um URL.

Para iniciar o upload, faça a seguinte chamada:

  POST https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/media:startUpload
  

A resposta da API retorna um corpo que contém MediaItemDataRef:

  {
  "resourceName": "GoogleProvidedValue",
  }

Para fazer o upload dos bytes, use o resourceName retornado pela chamada realizada na etapa anterior. Veja a seguir um exemplo em que a mídia enviada é uma foto:

curl -X POST -T ~/Downloads/pictureToUpload.jpg  "https://mybusiness.googleapis.com/upload/v1/media/{GoogleProvidedValue}?upload_type=media"

Veja a seguir um exemplo em que a mídia é um vídeo:

curl -X POST -T ~/Downloads/videoToUpload.mp4  "https://mybusiness.googleapis.com/upload/v1/media/{GoogleProvidedValue}?upload_type=media"

Use o resourceName retornado na etapa 1 para chamar Media.Create. Use o mediaFormat e a category relevantes.

  POST https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/media
  {
    "mediaFormat": "PHOTO",
    "locationAssociation": {
      "category": "COVER"
    },
    "dataRef": {
      "resourceName": "GoogleProvidedValue"
    },
  }
  POST https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/media
  {
    "mediaFormat": "VIDEO",
    "locationAssociation": {
      "category": "ADDITIONAL"
    },
    "dataRef": {
      "resourceName": "GoogleProvidedValue"
    },
  }
Isso foi útil?

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-04-08 UTC.