---
titulo: "Tokens de longa duração — troca, validade e renovação"
url: https://developers.facebook.com/documentation/facebook-login/guides/access-tokens/get-long-lived
capturado_em: 2026-09-12
hash: fd141ad395241912
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Tokens de acesso de longa duração – Login do Facebook
Updated: 30 de jun de 2026
Copiar para LLM
Ver como Markdown
Os tokens padrão de acesso ao usuário e à página têm curta duração e expiram em horas. No entanto, é possível trocar um token de curta duração por um de longa duração.
Quando você usa o SDK do iOS, Android ou JavaScript, o SDK atualiza automaticamente os tokens se a pessoa tiver usado o app nos últimos 90 dias. Os apps para celular nativos que usarem SDKs do Facebook terão tokens de acesso do usuário de longa duração, válidos por cerca de 60 dias. Esses tokens são atualizados uma vez por dia, quando a pessoa usando seu app faz uma solicitação aos servidores do Facebook. Se nenhuma solicitação for feita, o token expirará depois de 60 dias, e a pessoa terá que passar pelo fluxo de login novamente para obter um novo token.
Versão mais recente da Graph API: v26.0
Obter um token de longa duração para acesso de acesso do usuário
Se você precisar de um token de longa duração para acesso do usuário, é possível gerá-lo a partir de um token de curta duração para acesso do usuário. Um token de longa duração é válido, normalmente, por cerca de 60 dias.
Você precisará do seguinte:
Um token de acesso ao usuário válido
Do ID do app
Da chave secreta do app
Consulte o ponto de extremidade GET oauth/access_token.
curl -i -X GET "https://graph.facebook.com/{graph-api-version}/oauth/access_token?
    grant_type=fb_exchange_token&
    client_id={app-id}&
    client_secret={app-secret}&
    fb_exchange_token={your-access-token}"
Exemplo de resposta
{
  "access_token":"{long-lived-user-access-token}",
  "token_type": "bearer",
  "expires_in": 5183944            //The number of seconds until the token expires
}

Este é o fluxo de trabalho para gerar um token de longa duração para acesso do usuário:
Depois de recuperar o token de longa duração, você poderá usá-lo no servidor ou enviá-lo de volta ao cliente para que seja usado por ele.
Atenção
Não é possível usar um token expirado para solicitar um token de longa duração. Se o token expirou, o app deve enviar o usuário pelo fluxo de login novamente para gerar um novo token de acesso de curta duração.
Faça essa chamada do seu servidor, não de um cliente. A chave secreta do app está incluída nessa chamada de API, por isso, nunca faça a solicitação no lado do cliente. Em vez disso, implemente o código no lado do servidor que faz a solicitação e passe a resposta que contém o token de longa duração para o código no lado do cliente. A string será diferente do token original; portanto, se você estiver armazenando os tokens, substitua o anterior.
Não use os mesmos tokens de longa duração em mais de um cliente da web (ou seja, quando a pessoa entra em mais de um computador). Em vez disso, você deve usar os tokens de longa duração no seu servidor para gerar um código e usá-lo para obter um token de longa duração no cliente. Veja abaixo informações sobre como gerar tokens de longa duração usando tokens de longa duração no lado do servidor.
Obter um token de longa duração de acesso à Página
Se você precisar de um token de longa duração de acesso à Página, será possível gerá-lo a partir de um token de longa duração para acesso do usuário. O token de longa duração de acesso à Página não tem uma data de validade e somente expira ou é invalidado sob determinadas condições.
Você precisará do seguinte:
Um token de longa duração para acesso do usuário válido. A pessoa que solicita o token deve ter uma função administrativa.
Consulte o ponto de extremidade GET {app-scoped-user-id}?accounts.
curl -i -X GET "https://graph.facebook.com/{graph-api-version}/{app-scoped-user-id}/accounts?
  access_token={long-lived-user-access-token}"
Exemplo de resposta
{
  "data":[
    {
      "access_token":"{long-lived-page-access-token}",
      "category":"Brand",
      "category_list":[
        {
          "id":"1605186416478696",
          "name":"Brand"
        }
      ],
      "name":"Cute Kitten Page",
      "id":"{page-id}",
      "tasks":[
        "ANALYZE",
        "ADVERTISE",
        "MODERATE",
        "CREATE_CONTENT",
        "MANAGE"
      ]
    }
  ],
  "paging":{
    "cursors":{
      "before":"MTM1MzI2OTg2NDcyODg3OQZDZD",
      "after":"MTM1MzI2OTg2NDcyODg3OQZDZD"
    }
  }
}

Obter tokens Long_lived para clientes
O Facebook oferece uma opção para obter tokens de acesso de longa duração para apps a fim de evitar o acionamento dos sistemas automatizados de spam do Facebook. App que:
Têm seu próprio sistema de autenticação (usam um nome de usuário ou senha, por exemplo)
Armazenam, nos servidores, um token de acesso ao Facebook para pessoas que usam clientes diferentes (navegador ou apps para celular nativos)
Fazer chamadas à API de todos esses clientes diferentes
Em um alto nível, veja como você pode obter um token de longa duração para o cliente:
Usando um token de longa duração de acesso válido, seu servidor envia uma solicitação para obter um código do Facebook.
O Facebook envia um código de volta ao seu servidor e você envia esse código de forma segura ao cliente.
O cliente usa esse código para solicitar um token de longa duração pelo Facebook.
O Facebook envia ao cliente um token de longa duração, usado para publicar histórias ou consultar dados.
Obter um código
Consulte o ponto de extremidade GET oauth/client_code. O URI de redirecionamento deve ser o valor exato definido no Painel de Aplicativos no cartão Login do Facebook > Configurações > Configurações OAuth do cliente.
curl -i -X GET "https://graph.facebook.com/{graph-api-version}/oauth/client_code?
    client_id={app-id}&
    client_secret={app-secret}&
    redirect_uri={app-redirect-uri}&
    access_token={long-lived-user-access-token}"
Exemplo de resposta
{
  "code":"{code-for-your-client}"
}

Resgatar o código de um token de longa duração de acesso
Depois de recuperar o código do servidor do Facebook, você precisa enviá-lo ao cliente por meio de um canal seguro. Depois, será necessário que você faça uma solicitação do cliente para o ponto de extremidade /oauth/access_token:
curl -i -X GET "https://graph.facebook.com/{graph-api-version}/oauth/access_token?
    code={code-for-your-client}&
    client_id={app-id}&
    redirect_uri={app-redirect-uri}&
    machine_id= {your-client-machine-id}"
O machine_id é um parâmetro opcional que identifica e rastreia clientes. Ele é usado para segurança e prevenção a spam. Trata-se de um valor por cliente, e não por usuário. Se você já fez chamadas para obter um código e recebeu um machine_id, inclua-o na sua solicitação de código.
Exemplo de resposta
{
  "access_token":"{long-lived-access-token}",
  "expires_in":5183944,           //The number of seconds until the token expires
  "machine_id":"{your-client-machine-id}"
}
Este é o fluxo de trabalho para gerar um token de longa duração:
Você achou esta página útil?