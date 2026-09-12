---
titulo: "Google Drive API — baixar e exportar arquivos"
url: https://developers.google.com/workspace/drive/api/guides/manage-downloads
capturado_em: 2026-09-12
hash: 645fbfbade2cd8b5
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Baixar e exportar arquivos
Nesta página
Fazer o download do conteúdo de arquivos blob
Acessar dados de arquivos na memória
Download parcial
Fazer o download do conteúdo de arquivos blob em uma versão anterior
Fazer o download do conteúdo de arquivos blob em um navegador

A API Google Drive oferece suporte a vários tipos de ações de download e exportação, conforme listado na tabela a seguir:

Ações de download	
Conteúdo de arquivo blob usando o método files.get com o parâmetro alt=media.
Conteúdo de arquivo blob em uma versão anterior usando o método revisions.get com o parâmetro alt=media.
Conteúdo de arquivo blob em um navegador usando o campo webContentLink.
Conteúdo de arquivo blob usando o método files.download com operações de longa duração. Essa é a única maneira de baixar arquivos do Google Vids.

Ações de exportação	
Conteúdo de documentos do Google Workspace em um formato que seu app pode processar, usando o método files.export.
Conteúdo de documentos do Google Workspace em um navegador usando o campo exportLinks.
Conteúdo de documentos do Google Workspace em uma versão anterior em um navegador usando o campo exportLinks.
Conteúdo de documentos do Google Workspace usando o método files.download com operações de longa duração.

Na API Drive, um arquivo blob se refere a qualquer arquivo binário bruto armazenado no Google Drive (como imagens, vídeos e PDFs), em vez de um documento do Google Workspace. Ele não se refere ao objeto Blob do JavaScript. Para descrições detalhadas dos tipos de arquivo mencionados aqui, incluindo arquivos blob e do Google Workspace, consulte Tipos de arquivo.

Antes de fazer o download ou exportar o conteúdo do arquivo, verifique se os usuários podem baixar o arquivo usando o capabilities.canDownload campo no recurso files.

O restante deste documento fornece instruções detalhadas para realizar esses tipos de ações de download e exportação.

Fazer o download do conteúdo de arquivos blob

Para baixar um arquivo blob armazenado no Drive, use o files.get método com o ID do arquivo a ser baixado e o alt parâmetro do sistema. O parâmetro alt=media informa ao servidor que um download de conteúdo está sendo solicitado como um formato de resposta alternativo.

O parâmetro do sistema alt está disponível em todas as APIs REST do Google. Se você usar uma biblioteca de cliente da API Drive, não precisará definir esse parâmetro explicitamente, já que o método da biblioteca de cliente adiciona o parâmetro alt=media à solicitação HTTP subjacente.

Os exemplos de código a seguir mostram como usar o método files.get para baixar um arquivo:

Observação: se você estiver usando a versão mais antiga da API Drive v2, poderá encontrar exemplos de código no GitHub. Saiba como migrar para a API Drive v3.
Apps Script
Java
Python
Node.js
PHP
.NET
curl
/**
 * Downloads a file from Drive.
 * @param {string} fileId The ID of the file to download.
 * @return {Blob} The file content as a Blob.
 */
function downloadFile(fileId) {
  var url = 'https://www.googleapis.com/drive/v3/files/' + fileId + '?alt=media';
  var response = UrlFetchApp.fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
    }
  });
  return response.getBlob();
}

Os downloads de arquivos iniciados no seu app precisam ser autorizados com um escopo que permita acesso de leitura ao conteúdo do arquivo. Por exemplo, um app que usa o escopo drive.readonly.metadata não está autorizado a baixar o conteúdo do arquivo. Os exemplos de código da biblioteca de cliente usam o escopo de arquivo drive restrito que permite aos usuários visualizar e gerenciar todos os arquivos do Drive. Para saber mais sobre os escopos do Drive, consulte Escolher escopos da API Google Drive.

Os usuários com permissões owner (para arquivos do Meu Drive) ou organizer (para arquivos de drives compartilhados) podem restringir o download pelo DownloadRestrictionsMetadata objeto. Para mais informações, consulte Impedir que os usuários façam o download, imprimam ou copiem seu arquivo.

Os arquivos identificados como abusivos (como softwares nocivos) só podem ser baixados pelo proprietário do arquivo. Além disso, o parâmetro de consulta acknowledgeAbuse precisa ser definido como true para indicar que o usuário reconheceu o risco de baixar software indesejado ou outros arquivos abusivos. Seu aplicativo precisa avisar o usuário de forma interativa antes de usar esse parâmetro de consulta.

Acessar dados de arquivos na memória

Se o aplicativo precisar acessar os dados do arquivo diretamente na memória (por exemplo, como um buffer de bytes) em vez de salvá-los em um disco local, ajuste a solicitação da biblioteca de cliente ou processe o stream retornado:

Node.js: por padrão, a biblioteca de cliente do Node.js retorna o conteúdo do arquivo como um Readable stream. Para salvar o arquivo no disco local:

const fs = require('fs');

const dest = fs.createWriteStream('/path/to/dest/file.ext');
const response = await service.files.get(
  { fileId, alt: 'media' },
  { responseType: 'stream' }
);
response.data
  .on('end', () => {
    console.log('Download complete.');
  })
  .on('error', (err) => {
    console.error('Error downloading file.', err);
  })
  .pipe(dest);

Como alternativa, para retornar os dados diretamente na memória como um ArrayBuffer em vez de um stream, defina o parâmetro responseType nas opções de solicitação:

const file = await service.files.get({
  fileId,
  alt: 'media',
}, { responseType: 'arraybuffer' });

// Convert the ArrayBuffer to a Node.js Buffer object.
const buffer = Buffer.from(file.data);

Python: o exemplo de código Python para baixar um arquivo blob já grava os blocos de download em um objeto na memória io.BytesIO(). Para acessar os bytes brutos, chame file.getvalue().

Java: o exemplo de código Java para baixar um arquivo blob usa um java.io.ByteArrayOutputStream para capturar os bytes baixados na memória. Use outputStream.toByteArray() para acessar a matriz de bytes brutos.

.NET: o exemplo de código C# para baixar um arquivo blob usa um System.IO.MemoryStream. Use stream.ToArray() para acessar a matriz de bytes subjacente.

Apps Script: o exemplo de código do Apps Script para baixar um blob arquivo usa um response.getBlob() método para retornar um Blob objeto. Converta isso em uma matriz de bytes usando o método getBytes().

Download parcial

O download parcial envolve o download apenas de uma parte especificada de um arquivo. É possível especificar a parte do arquivo que você quer baixar usando um intervalo de bytes com o Range cabeçalho. Exemplo:

Range: bytes=500-999

Observação: os downloads parciais não são aceitos ao exportar documentos do Google Workspace.
Fazer o download do conteúdo de arquivos blob em uma versão anterior

Para baixar o conteúdo de arquivos blob em uma versão anterior, use o revisions.get método com o ID do arquivo a ser baixado, o ID da revisão e o alt parâmetro do sistema. O parâmetro alt=media informa ao servidor que um download de conteúdo está sendo solicitado como um formato de resposta alternativo. Semelhante a files.get, o método revisions.get também aceita o parâmetro de consulta acknowledgeAbuse e o cabeçalho Range.

Só é possível baixar revisões de conteúdo de arquivos blob marcadas como "Manter indefinidamente". Se você quiser baixar uma revisão, defina-a como "Manter indefinidamente" primeiro. Para mais informações, consulte Especificar revisões para salvar da exclusão automática.

Para mais informações sobre como baixar uma revisão, consulte Gerenciar operações de longa duração.

curl
curl -L "https://www.googleapis.com/drive/v3/files/FILE_ID/revisions/REVISION_ID?alt=media" \
  --header "Authorization: Bearer ACCESS_TOKEN" \
  --output "FILE_NAME"

Substitua:

FILE_ID: o ID do arquivo a ser baixado.
REVISION_ID: o ID da revisão a ser baixada.
ACCESS_TOKEN: o token de acesso que concede acesso a API.
FILE_NAME: o nome do arquivo de saída.
Fazer o download do conteúdo de arquivos blob em um navegador

Para baixar o conteúdo de arquivos blob armazenados no Drive em um navegador, em vez de usar a API, use o webContentLink campo do recurso files. Se o usuário tiver acesso de download ao arquivo, um link para baixar o arquivo e o conteúdo dele será retornado. É possível redirecionar um usuário para esse URL ou oferecê-lo como um link clicável.

curl
curl "https://www.googleapis.com/drive/v3/files/FILE_ID?fields=webContentLink" \
  --header "Authorization: Bearer ACCESS_TOKEN" \
  --header "Accept: application/json"

Substitua:

FILE_ID: o ID do arquivo para receber o link de download para.
ACCESS_TOKEN: o token de acesso que concede acesso a API.
Fazer o download do conteúdo de arquivos blob usando operações de longa duração

Para baixar o conteúdo de arquivos blob usando operações de longa duração (LROs), use o files.download método com o ID do arquivo a ser baixado. Opcionalmente, defina o ID da revisão.

Essa é a única maneira de baixar arquivos do Google Vids. Se você tentar exportar arquivos do Google Vids, vai receber um fileNotExportable erro. Para mais informações, consulte Gerenciar operações de longa duração.

curl

O comando curl a seguir inicia uma LRO e retorna uma resposta JSON. Para baixar o arquivo ou consultar essa LRO, faça outra solicitação usando o ID retornado para receber o URL do conteúdo. Em seguida, você pode fazer uma solicitação curl final para esse URL para baixar o arquivo. Para mais informações, consulte Gerenciar operações de longa duração.

curl --request POST "https://www.googleapis.com/drive/v3/files/FILE_ID/download?mimeType=video/mp4" \
  --header "Authorization: Bearer ACCESS_TOKEN" \
  --header "Content-Length: 0" \
  --header "Accept: application/json"

Substitua:

FILE_ID: o ID do arquivo a ser baixado.
ACCESS_TOKEN: o token de acesso que concede acesso a API.
Exportar conteúdo de documentos do Google Workspace

Para exportar o conteúdo de bytes de documentos do Google Workspace, use o files.export método com o ID do arquivo a ser exportado e o tipo MIME correto. O conteúdo exportado é limitado a 10 MB.

Os exemplos de código a seguir mostram como usar o método files.export para exportar um documento do Google Workspace no formato PDF:

Observação: se você estiver usando a versão mais antiga da API Drive v2, poderá encontrar exemplos de código no GitHub. Saiba como migrar para a API Drive v3.
Apps Script
Java
Python
Node.js
PHP
.NET
curl
/**
 * Exports a Google Workspace document.
 * @param {string} fileId The ID of the file to export.
 * @param {string} mimeType The MIME type to export to.
 * @return {Blob} The exported content as a Blob.
 */
function exportPdf(fileId, mimeType) {
  var url = 'https://www.googleapis.com/drive/v3/files/' + fileId + '/export?mimeType=' + encodeURIComponent(mimeType);
  var response = UrlFetchApp.fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
    }
  });
  return response.getBlob();
}

Os exemplos de código da biblioteca de cliente usam o escopo drive restrito que permite aos usuários visualizar e gerenciar todos os arquivos do Drive. Para saber mais sobre os escopos do Drive, consulte Escolher escopos da API Google Drive.

Os exemplos de código também declaram o tipo MIME de exportação como application/pdf. Para uma lista completa de todos os tipos MIME de exportação aceitos para cada documento do Google Workspace, consulte Tipos MIME de exportação para documentos do Google Workspace.

Exportar conteúdo de documentos do Google Workspace em um navegador

Para exportar o conteúdo de documentos do Google Workspace em um navegador, use o exportLinks campo do files recurso. Dependendo do tipo de documento, um link para baixar o arquivo e o conteúdo dele é retornado para cada tipo MIME disponível. É possível redirecionar um usuário para um URL ou oferecê-lo como um link clicável.

curl
curl "https://www.googleapis.com/drive/v3/files/FILE_ID?fields=id,name,exportLinks" \
  --header "Authorization: Bearer ACCESS_TOKEN" \
  --header "Accept: application/json"

Substitua:

FILE_ID: o ID do arquivo para receber o link de download para.
ACCESS_TOKEN: o token de acesso que concede acesso a API.
Exportar conteúdo de documentos do Google Workspace em uma versão anterior em um navegador

Para exportar o conteúdo de documentos do Google Workspace em uma versão anterior em um navegador, use o revisions.get método com o ID do arquivo a ser baixado e o ID da revisão para gerar um link de exportação em que você possa fazer o download. Se o usuário tiver acesso de download ao arquivo, um link para baixar o arquivo e o conteúdo dele será retornado. É possível redirecionar um usuário para esse URL ou oferecê-lo como um link clicável.

curl
curl "https://www.googleapis.com/drive/v3/files/FILE_ID/revisions/REVISION_ID?fields=id,name,exportLinks" \
  --header "Authorization: Bearer ACCESS_TOKEN" \
  --header "Accept: application/json"

Substitua:

FILE_ID: o ID do arquivo a ser baixado.
REVISION_ID: o ID da revisão a ser baixada.
ACCESS_TOKEN: o token de acesso que concede acesso a API.
Exportar conteúdo de documentos do Google Workspace usando operações de longa duração

Para exportar o conteúdo de documentos do Google Workspace usando operações de longa duração (LROs), use o files.download método com o ID do arquivo a ser baixado e o ID da revisão. Para mais informações, consulte Gerenciar operações de longa duração.

curl

O comando curl a seguir inicia uma LRO e retorna uma resposta JSON. Para baixar o arquivo ou consultar essa LRO, faça outra solicitação usando o ID retornado para receber o URL do conteúdo. Em seguida, você pode fazer uma solicitação curl final para esse URL para baixar o arquivo. Para mais informações, consulte Gerenciar operações de longa duração.

curl --request POST "https://www.googleapis.com/drive/v3/files/FILE_ID/download?mimeType=MIME_TYPE&revisionId=REVISION_ID" \
  --header "Authorization: Bearer ACCESS_TOKEN" \
  --header "Content-Length: 0" \
  --header "Accept: application/json"

Substitua:

FILE_ID: o ID do arquivo a ser baixado.
MIME_TYPE: o tipo MIME para exportar.
REVISION_ID: o ID da revisão a ser baixada.
ACCESS_TOKEN: o token de acesso que concede acesso a API.
Temas relacionados
Proteger o conteúdo do arquivo
Tipos MIME de exportação para documentos do Google Workspace
Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-09-11 UTC.