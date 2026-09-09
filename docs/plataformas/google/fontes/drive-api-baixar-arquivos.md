---
titulo: "Google Drive API — baixar e exportar arquivos"
url: https://developers.google.com/workspace/drive/api/guides/manage-downloads
capturado_em: 2026-09-09
hash: 528a2664db2a14af
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Fazer o download e exportar arquivos
Nesta página
Baixar conteúdo do arquivo blob
Download parcial
Baixar o conteúdo do arquivo blob em uma versão anterior
Fazer o download do conteúdo de um arquivo blob em um navegador
Baixar conteúdo de arquivo blob usando operações de longa duração

A API Google Drive é compatível com vários tipos de ações de download e exportação, conforme listado na tabela a seguir:

Ações de download	
Conteúdo do arquivo blob usando o método files.get com o parâmetro alt=media.
Conteúdo do arquivo blob em uma versão anterior usando o método revisions.get com o parâmetro alt=media.
Conteúdo do arquivo blob em um navegador usando o campo webContentLink.
Conteúdo do arquivo blob usando o método files.download com operações de longa duração. Essa é a única maneira de baixar arquivos do Google Vids.

Ações de exportação	
Conteúdo de documentos do Google Workspace em um formato que seu app possa processar usando o método files.export.
Conteúdo de documentos do Google Workspace em um navegador usando o campo exportLinks.
Conteúdo de documentos do Google Workspace em uma versão anterior em um navegador usando o campo exportLinks.
Conteúdo de documentos do Google Workspace usando o método files.download com operações de longa duração.

Antes de fazer o download ou exportar o conteúdo de um arquivo, verifique se os usuários podem baixar o arquivo usando o campo capabilities.canDownload no recurso files.

Para descrições dos tipos de arquivo mencionados aqui, incluindo blob e arquivos do Google Workspace, consulte Tipos de arquivo.

O restante deste documento fornece instruções detalhadas para realizar esses tipos de ações de download e exportação.

Baixar conteúdo do arquivo blob

Para fazer o download de um arquivo blob armazenado no Drive, use o método files.get com o ID do arquivo a ser baixado e o parâmetro alt do sistema. O parâmetro alt=media informa ao servidor que um download de conteúdo está sendo solicitado como um formato de resposta alternativo.

O parâmetro de sistema alt está disponível em todas as APIs REST do Google. Se você usar uma biblioteca de cliente da API Drive, não será necessário definir explicitamente esse parâmetro, já que o método da biblioteca de cliente adiciona o parâmetro alt=media à solicitação HTTP subjacente.

Os exemplos de código a seguir mostram como usar o método files.get para baixar um arquivo:

Observação: se você estiver usando a API Drive v2 mais antiga, confira exemplos de código no GitHub. Saiba como migrar para a API Drive v3.
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

Os downloads de arquivos iniciados no seu app precisam ser autorizados com um escopo que permita acesso de leitura ao conteúdo do arquivo. Por exemplo, um app que usa o escopo drive.readonly.metadata não tem autorização para fazer o download do conteúdo do arquivo. As amostras de código da biblioteca de cliente usam o escopo de arquivo restrito drive, que permite aos usuários visualizar e gerenciar todos os arquivos do Drive. Para saber mais sobre os escopos do Drive, consulte Escolher escopos da API Google Drive.

Os usuários com permissões owner (para arquivos do Meu Drive) ou organizer (para arquivos de drive compartilhado) podem restringir o download usando o objeto DownloadRestrictionsMetadata. Para mais informações, consulte Impedir que os usuários baixem, imprimam ou copiem seu arquivo.

Os arquivos identificados como abusivos (como software malicioso) só podem ser baixados pelo proprietário. Além disso, o parâmetro de consulta acknowledgeAbuse precisa ser definido como true para indicar que o usuário reconheceu o risco de fazer o download de software indesejado ou outros arquivos abusivos. Seu aplicativo precisa avisar o usuário de forma interativa antes de usar esse parâmetro de consulta.

Download parcial

O download parcial envolve o download apenas de uma parte especificada de um arquivo. É possível especificar a parte do arquivo que você quer baixar usando um intervalo de bytes com o cabeçalho Range. Exemplo:

Range: bytes=500-999

Observação: downloads parciais não são compatíveis ao exportar documentos do Google Workspace.
Baixar o conteúdo do arquivo blob em uma versão anterior

Para fazer o download do conteúdo de arquivos blob em uma versão anterior, use o método revisions.get com o ID do arquivo a ser baixado, o ID da revisão e o alt parâmetro do sistema. O parâmetro alt=media informa ao servidor que um download de conteúdo está sendo solicitado como um formato de resposta alternativo. Assim como files.get, o método revisions.get também aceita o parâmetro de consulta acknowledgeAbuse e o cabeçalho Range.

Só é possível baixar revisões de conteúdo de arquivos blob marcadas como "Manter indefinidamente". Se quiser baixar uma revisão, defina como "Manter indefinidamente" primeiro. Para mais informações, consulte Especificar revisões para salvar da exclusão automática.

Para mais informações sobre como baixar uma revisão, consulte Gerenciar operações de longa duração.

curl
curl -L "https://www.googleapis.com/drive/v3/files/FILE_ID/revisions/REVISION_ID?alt=media" \
  --header "Authorization: Bearer ACCESS_TOKEN" \
  --output "FILE_NAME"

Substitua:

FILE_ID: o ID do arquivo a ser baixado.
REVISION_ID: o ID da revisão a ser baixada.
ACCESS_TOKEN: o token de acesso que concede acesso à API.
FILE_NAME: o nome do arquivo de saída.
Fazer o download do conteúdo de um arquivo blob em um navegador

Para baixar o conteúdo de arquivos blob armazenados no Drive em um navegador, em vez de usar a API, use o campo webContentLink do recurso files. Se o usuário tiver acesso para fazer o download do arquivo, um link para baixar o arquivo e o conteúdo dele será retornado. É possível redirecionar um usuário para esse URL ou oferecê-lo como um link clicável.

curl
curl "https://www.googleapis.com/drive/v3/files/FILE_ID?fields=webContentLink" \
  --header "Authorization: Bearer ACCESS_TOKEN" \
  --header "Accept: application/json"

Substitua:

FILE_ID: o ID do arquivo para receber o link de download.
ACCESS_TOKEN: o token de acesso que concede acesso à API.
Baixar conteúdo de arquivo blob usando operações de longa duração

Para fazer o download do conteúdo de arquivos blob usando operações de longa duração (LROs), use o método files.download com o ID do arquivo a ser baixado. Também é possível definir o ID da revisão.

Essa é a única maneira de baixar arquivos do Google Vids. Se você tentar exportar arquivos do Google Vids, vai receber um erro fileNotExportable. Para mais informações, consulte Gerenciar operações de longa duração.

curl

O comando curl a seguir inicia um LRO e retorna uma resposta JSON. Para baixar o arquivo ou fazer uma pesquisa com essa LRO, faça outra solicitação usando o ID retornado para receber o URL do conteúdo. Em seguida, faça uma solicitação curl final para esse URL e baixe o arquivo. Para mais informações, consulte Gerenciar operações de longa duração.

curl --request POST "https://www.googleapis.com/drive/v3/files/FILE_ID/download?mimeType=video/mp4" \
  --header "Authorization: Bearer ACCESS_TOKEN" \
  --header "Content-Length: 0" \
  --header "Accept: application/json"

Substitua:

FILE_ID: o ID do arquivo a ser baixado.
ACCESS_TOKEN: o token de acesso que concede acesso à API.
Exportar conteúdo de documentos do Google Workspace

Para exportar o conteúdo de bytes de documentos do Google Workspace, use o método files.export com o ID do arquivo a ser exportado e o tipo MIME correto. O conteúdo exportado é limitado a 10 MB.

Os exemplos de código a seguir mostram como usar o método files.export para exportar um documento do Google Workspace em formato PDF:

Observação: se você estiver usando a API Drive v2 mais antiga, confira exemplos de código no GitHub. Saiba como migrar para a API Drive v3.
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

As amostras de código da biblioteca de cliente usam o escopo restrito drive, que permite que os usuários vejam e gerenciem todos os seus arquivos do Drive. Para saber mais sobre os escopos do Drive, consulte Escolher escopos da API Google Drive.

Os exemplos de código também declaram o tipo MIME de exportação como application/pdf. Para uma lista completa de todos os tipos MIME de exportação compatíveis com cada documento do Google Workspace, consulte Tipos MIME de exportação para documentos do Google Workspace.

Exportar conteúdo de documentos do Google Workspace em um navegador

Para exportar o conteúdo de um documento do Google Workspace em um navegador, use o campo exportLinks do recurso files. Dependendo do tipo de documento, um link para baixar o arquivo e o conteúdo dele é retornado para cada tipo MIME disponível. É possível redirecionar um usuário para um URL ou oferecê-lo como um link clicável.

curl
curl "https://www.googleapis.com/drive/v3/files/FILE_ID?fields=id,name,exportLinks" \
  --header "Authorization: Bearer ACCESS_TOKEN" \
  --header "Accept: application/json"

Substitua:

FILE_ID: o ID do arquivo para receber o link de download.
ACCESS_TOKEN: o token de acesso que concede acesso à API.
Exportar conteúdo de documentos do Google Workspace em uma versão anterior em um navegador

Para exportar o conteúdo de um documento do Google Workspace em uma versão anterior em um navegador, use o método revisions.get com o ID do arquivo a ser baixado e o ID da revisão para gerar um link de exportação em que você pode fazer o download. Se o usuário tiver acesso para baixar o arquivo, um link para fazer isso e acessar o conteúdo dele será retornado. É possível redirecionar um usuário para esse URL ou oferecê-lo como um link clicável.

curl
curl "https://www.googleapis.com/drive/v3/files/FILE_ID/revisions/REVISION_ID?fields=id,name,exportLinks" \
  --header "Authorization: Bearer ACCESS_TOKEN" \
  --header "Accept: application/json"

Substitua:

FILE_ID: o ID do arquivo a ser baixado.
REVISION_ID: o ID da revisão a ser baixada.
ACCESS_TOKEN: o token de acesso que concede acesso à API.
Exportar conteúdo de documentos do Google Workspace usando operações de longa duração

Para exportar o conteúdo de documentos do Google Workspace usando operações de longa duração (LROs), use o método files.download com o ID do arquivo a ser baixado e o ID da revisão. Para mais informações, consulte Gerenciar operações de longa duração.

curl

O comando curl a seguir inicia um LRO e retorna uma resposta JSON. Para baixar o arquivo ou fazer uma pesquisa com essa LRO, faça outra solicitação usando o ID retornado para receber o URL do conteúdo. Em seguida, faça uma solicitação curl final para esse URL e baixe o arquivo. Para mais informações, consulte Gerenciar operações de longa duração.

curl --request POST "https://www.googleapis.com/drive/v3/files/FILE_ID/download?mimeType=MIME_TYPE&revisionId=REVISION_ID" \
  --header "Authorization: Bearer ACCESS_TOKEN" \
  --header "Content-Length: 0" \
  --header "Accept: application/json"

Substitua:

FILE_ID: o ID do arquivo a ser baixado.
MIME_TYPE: o tipo MIME para exportar.
REVISION_ID: o ID da revisão a ser baixada.
ACCESS_TOKEN: o token de acesso que concede acesso à API.
Temas relacionados
Proteger o conteúdo do arquivo
Exportar tipos MIME para documentos do Google Workspace
Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-05-13 UTC.