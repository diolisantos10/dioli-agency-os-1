---
titulo: "Business Profile APIs — gerenciar verificação de local"
url: https://developers.google.com/my-business/content/manage-verification?hl=pt-br
capturado_em: 2026-09-09
hash: aab51eb26629e021
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Gerenciar a verificação
Nesta página
Ver o estado atual
Buscar opções de verificação
Iniciar o processo de verificação
Recuperar as verificações atuais
Concluir uma verificação pendente
Práticas recomendadas para a verificação com o GBP usando a API
Criação de unidade
Verificação de unidade

Os provedores que oferecem gerenciamento de fichas de empresa diretamente na plataforma deles podem verificar a empresa de um comerciante no próprio site. Assim, não é preciso redirecionar o comerciante para a interface do Perfil da Empresa.

Ver o estado atual

Os usuários podem chamar locations.getVoiceOfMerchantState em uma unidade para conferir o status atual. Se o booleano hasVoiceOfMerchant for true, a unidade já estará em situação regular e nenhuma outra ação será necessária. Se a ação gain_voice_of_merchant na resposta contiver verify, será necessário concluir a verificação. Para mais informações, siga as instruções abaixo.

Buscar opções de verificação

Os provedores podem usar o método locations.fetchVerificationOptions para solicitar que os comerciantes escolham uma forma de contato preferida em uma lista de métodos de verificação disponíveis.

Observação: os métodos de verificação variam de acordo com as diferenças regionais e o idioma.

Para buscar as opções de verificação, use o seguinte:

HTTP
POST
https://mybusinessverifications.googleapis.com/v1/{locationId}:fetchVerificationOptions

{
  "languageCode": "en"
}

Iniciar o processo de verificação

Depois de escolher um método de verificação, inicie o processo com locations.verify. Como resultado dessa chamada, a unidade passa para um estado verificado, ou um status de erro é retornado.

A tentativa de verificar uma nova unidade quando ela já existe retorna um erro e pode iniciar o processo de resolução de propriedade.
HTTP
POST
https://mybusinessverifications.googleapis.com/v1/locations/{locationId}
:verify

// Use only one of the below verification methods

// For postcard verification:
{
  "method": "ADDRESS",
  "languageCode": "en",
  "addressInput": {
    "mailerContactName": "Ann Droyd"
  }
}

// For phone verification:
{
  "method": "PHONE_CALL",
  "languageCode": "en",
  "phoneInput": {
    "phoneNumber": "800-555-0136"
  }
}

// For SMS verification:
{
  "method": "SMS",
  "languageCode": "en",
  "phoneInput": {
    "phoneNumber": "800-555-0136"
  }
}

// For email verification:
{
  "method": "EMAIL",
  "languageCode": "en",
  "emailInput": {
    "emailAddress": "ex@google.com"
  }
}

Recuperar as verificações atuais

A chamada locations.verifications.list recupera o histórico de solicitações de verificação, além do status delas para a unidade especificada na chamada.

Para recuperar todas as solicitações de verificação, use o seguinte:

HTTP
GET
https://mybusinessverifications.googleapis.com/v1/locations/{locationId}
/verifications

Concluir uma verificação pendente

Um código PIN e o método locations.verifications.complete são necessários para concluir a verificação de uma empresa.

Para concluir uma verificação pendente, use o seguinte:

HTTP
POST
https://mybusinessverifications.googleapis.com/v1/locations/{locationId}
/verifications/{verificationId}:complete

{
  "pin": "123456"
}

Práticas recomendadas para a verificação com o GBP usando a API
Criação de unidade

Com a API GBP Business Information, você pode incorporar sua plataforma para que seja possível criar unidades nela. Quando você pedir a um comerciante para adicionar uma nova unidade, siga estas etapas:

Colete as informações da unidade, como nome, endereço e categoria da empresa do comerciante.

Chame o endpoint googleLocations.search.
Forneça os dados da unidade, como nome, categoria, endereço, número de telefone e site da empresa, na solicitação de API.

Você também pode pesquisar uma possível unidade correspondente seguindo estas etapas:

Consulte possíveis correspondências de unidade.
Peça ao comerciante para escolher a unidade correta.
Se requestAdminRightsUrl estiver presente na resposta, ajude o comerciante a solicitar o acesso e a propriedade da unidade no Perfil da Empresa no Google.
Se requestAdminRightsUrl não existir, crie uma nova unidade com o ID de lugar na resposta.
Verifique a nova unidade.

Observação: se você não receber possíveis correspondências na consulta inicial, use um ID de lugar em branco para criar uma nova unidade. Em seguida, faça a verificação dessa unidade.

Verificação de unidade

Para iniciar o processo de verificação usando a API GBP, siga estas etapas:

Chame o método accounts.locations.list para definir todas as unidades de uma Conta do Google.
Selecione a unidade a ser verificada.
Chame o método GetVoiceOfMerchant da API para confirmar se a unidade requer verificação.
Se a resposta for positiva, chame fetchVerificationOptions para acessar uma lista de métodos disponíveis para verificar essa unidade.
Confira se os dados de verificationOption incluem o endereço, o número de telefone e o e-mail corretos.
Depois que o comerciante selecionar a melhor opção de verificação disponível, chame o método locations.verify para iniciar a verificação apropriada. Para confirmar que o processo está em andamento, chame o método locations.verifications.list.
Chame o método locations.verification.complete com o alfinete do comerciante.
Chame o método de API GetVoiceOfMerchant. Se HasVoiceOfMerchant = true, a unidade foi verificada.

Observação: se a verificação AUTO estiver disponível para a unidade, o comerciante não vai precisar fazer nada durante esse processo.

Para mais informações sobre a verificação no GBP, consulte nosso artigo de suporte da Central de Ajuda.

Guia de métodos de verificação para parceiros aprovados
Observação: se você não conseguir abrir o conteúdo no parágrafo a seguir e precisar saber mais, solicite as informações por este formulário.
Isso foi útil?

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2025-08-29 UTC.