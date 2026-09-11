---
titulo: "Business Profile APIs — implementar OAuth"
url: https://developers.google.com/my-business/content/implement-oauth?hl=pt-br
capturado_em: 2026-09-11
hash: 473567c6fe128dce
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Implemente o OAuth com APIs do Perfil da Empresa
Nesta página
Acessar a API com o OAuth 2.0
Configurar o OAuth e a tela de permissão
Métodos para incorporar o OAuth 2.0
Executar a amostra

Todas as solicitações que seu aplicativo envia para as APIs do Perfil da Empresa precisam incluir um token de autorização, que identifica o usuário ou o aplicativo para o Google, permitindo acesso a essas APIs. O app precisa usar o protocolo OAuth 2.0 para autorizar as solicitações.

Este guia explica os diferentes métodos que podem ser usados para implementar o OAuth 2.0 na sua plataforma. O Google Identity Platform oferece as funcionalidades Login do Google e OAuth usadas neste guia.

Se quiser entender melhor como usar o OAuth 2.0 para aplicativos de servidores da Web, consulte o guia.

A implementação do OAuth 2.0 oferece os seguintes benefícios:

Protege o acesso aos dados do proprietário da empresa.
Confirma a identidade do proprietário da empresa quando ele faz login na Conta do Google.
Permite que uma plataforma ou aplicativo de parceiro acesse e modifique dados de local com o consentimento explícito do proprietário da empresa, que pode revogar esse acesso posteriormente.
Confirma a identidade da plataforma do parceiro.
Permite que as plataformas de parceiros realizem ações on-line ou off-line em nome do proprietário da empresa. Isso inclui respostas a avaliações, criação de postagens e atualizações de itens de menu.
Acessar a API com o OAuth 2.0

Antes de começar, você precisa configurar seu projeto do Google Cloud e ativar as APIs do Perfil da Empresa. Para mais informações, consulte a documentação de Configuração básica.

Configurar o OAuth e a tela de permissão

Siga estas etapas para criar credenciais e a tela de permissão:

Na página "Credenciais" do Console de APIs, clique em Criar credenciais e selecione "ID do cliente OAuth" na lista suspensa.
Selecione o tipo de aplicativo, preencha as informações relevantes e clique em Criar.
Clique em Salvar.
Atualize as configurações da tela de permissão OAuth. Nelas, é possível atualizar o nome e o logotipo do aplicativo, além de incluir um link para os Termos de Serviço e a Política de Privacidade.

A imagem a seguir mostra os campos de nome e logotipo do aplicativo na tela de permissão OAuth:

A figura abaixo exibe os campos adicionais que aparecem na tela de permissão OAuth:

A imagem abaixo é um exemplo do que o usuário pode ver antes de fornecer a permissão:

Métodos para incorporar o OAuth 2.0

Você pode usar os seguintes métodos para implementar o OAuth 2.0:

Bibliotecas de cliente
Login do Google
Acesso off-line
Somente acesso on-line

O conteúdo a seguir fornece informações sobre esses métodos para incorporar o OAuth 2.0 ao aplicativo.

Escopos de autorização

Requer um dos seguintes escopos do OAuth:

https://www.googleapis.com/auth/business.manage
https://www.googleapis.com/auth/plus.business.manage

O escopo plus.business.manage foi descontinuado, mas está disponível para manter a compatibilidade das implementações atuais com versões anteriores.

Bibliotecas de cliente

Os exemplos específicos para cada linguagem nesta página usam bibliotecas de cliente das APIs do Google para implementar a autorização do OAuth 2.0. Para executar os exemplos de código, primeiro instale a biblioteca de cliente para sua linguagem.

As bibliotecas estão disponíveis para as seguintes linguagens:

Go
Java
.NET
Node.js
PHP
Python
Ruby
Login do Google

O Login do Google é a maneira mais rápida de integrar o OAuth à sua plataforma. Ele está disponível para Android, iOS, Web e muito mais.

O Login do Google é um sistema de autenticação seguro que permite aos usuários fazer login com a mesma Conta em outros Serviços do Google. Depois de se conectar, o usuário pode autorizar o aplicativo a chamar as APIs do Perfil da Empresa e trocar o código de autorização usado para receber os tokens de atualização e acesso.

Acesso off-line

É possível chamar as APIs do Perfil da Empresa em nome de um usuário mesmo quando ele está off-line. Recomendamos que as plataformas incorporem essa funcionalidade porque você pode editar, acessar e gerenciar fichas a qualquer momento depois que o usuário faz login e autoriza o acesso.

O Google presume que o usuário já tenha feito login com a Conta do Google, autorizado o aplicativo a chamar as APIs do Perfil da Empresa e trocado um código de autorização para receber um token de atualização e, depois, um de acesso. O usuário pode armazenar o token de atualização com segurança e usá-lo depois para receber um novo token de acesso a qualquer momento. Para mais informações, leia Login do Google para aplicativos do lado do servidor.

O snippet de código a seguir mostra como implementar o acesso off-line no seu aplicativo. Para executar esse código, consulte a seção Executar a amostra.

Aviso: este código é apenas um exemplo. Nunca exponha sua chave de API no lado do cliente.
<!-- The top of file index.html -->
<html itemscope itemtype="http://schema.org/Article">
<head>
  <!-- BEGIN Pre-requisites -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js">
  </script>
  <script src="https://apis.google.com/js/client:platform.js?onload=start" async defer>
  </script>
  <!-- END Pre-requisites -->
<!-- Continuing the <head> section -->
  <script>
    function start() {
      gapi.load('auth2', function() {
        auth2 = gapi.auth2.init({
          client_id: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
          // Scopes to request in addition to 'profile' and 'email'
          scope: 'https://www.googleapis.com/auth/business.manage',
          immediate: true
        });
      });
    }
  </script>
</head>
<body>
  <!-- Add where you want your sign-in button to render -->
<!-- Use an image that follows the branding guidelines in a real app, more info here:
 https://developers.google.com/identity/branding-guidelines
-->
<h1>Business Profile Offline Access Demo</h1>

<p> This demo demonstrates the use of Google Identity Services and OAuth to gain authorization to call the Business Profile APIs on behalf of the user, even when the user is offline.

When a refresh token is acquired, store this token securely on your database. You will then be able to use this token to refresh the OAuth credentials and make offline API calls on behalf of the user. 

The user may revoke access at any time from the <a href='https://myaccount.google.com/permissions'>Account Settings</a> page.
</p>

<button id="signinButton">Sign in with Google</button><br>
<input id="authorizationCode" type="text" placeholder="Authorization Code" style="width: 60%"><button id="accessTokenButton" disabled>Retrieve Access/Refresh Token</button><br>
 <input id="refreshToken" type="text" placeholder="Refresh Token, never expires unless revoked" style="width: 60%"><button id="refreshSubmit">Refresh Access Token</button><br>
 <input id="accessToken" type="text" placeholder="Access Token" style="width: 60%"><button id="gmbAccounts">Get Business Profile Accounts</button><br>
 <p>API Responses:</p>
<script>
    //Will be populated after sign in.
    var authCode;
  $('#signinButton').click(function() {
    // signInCallback
    auth2.grantOfflineAccess().then(signInCallback);
  });

  $('#accessTokenButton').click(function() {
    // signInCallback defined in step 6.
    retrieveAccessTokenAndRefreshToken(authCode);
  });

  $('#refreshSubmit').click(function() {
    // signInCallback defined in step 6.
    retrieveAccessTokenFromRefreshToken($('#refreshToken').val());
  });

   $('#gmbAccounts').click(function() {
    // signInCallback defined in step 6.
    retrieveGoogleMyBusinessAccounts($('#accessToken').val());
  });

function signInCallback(authResult) {
    //the 'code' field from the response, used to retrieve access token and bearer token
  if (authResult['code']) {
    // Hide the sign-in button now that the user is authorized, for example:
    $('#signinButton').attr('style', 'display: none');
    authCode = authResult['code'];

    $("#accessTokenButton").attr( "disabled", false );

    //Pretty print response
    var e = document.createElement("pre")
    e.innerHTML = JSON.stringify(authResult, undefined, 2);
    document.body.appendChild(e);

    //autofill authorization code input
    $('#authorizationCode').val(authResult['code'])

    
  } else {
    // There was an error.
  }
}

//WARNING: THIS FUNCTION IS DISPLAYED FOR DEMONSTRATION PURPOSES ONLY. YOUR CLIENT_SECRET SHOULD NEVER BE EXPOSED ON THE CLIENT SIDE!!!!
function retrieveAccessTokenAndRefreshToken(code) {
      $.post('https://www.googleapis.com/oauth2/v4/token',
      { //the headers passed in the request
        'code' : code,
        'client_id' : 'YOUR_CLIENT_ID.apps.googleusercontent.com',
        'client_secret' : 'YOUR_CLIENT_SECRET',
        'redirect_uri' : 'http://localhost:8000',
        'grant_type' : 'authorization_code'
      },
      function(returnedData) {
        console.log(returnedData);
        //pretty print JSON response
        var e = document.createElement("pre")
        e.innerHTML = JSON.stringify(returnedData, undefined, 2);
        document.body.appendChild(e);
        $('#refreshToken').val(returnedData['refresh_token'])
      });
}

//WARNING: THIS FUNCTION IS DISPLAYED FOR DEMONSTRATION PURPOSES ONLY. YOUR CLIENT_SECRET SHOULD NEVER BE EXPOSED ON THE CLIENT SIDE!!!!
function retrieveAccessTokenFromRefreshToken(refreshToken) {
    $.post('https://www.googleapis.com/oauth2/v4/token', 
        { // the headers passed in the request
        'refresh_token' : refreshToken,
        'client_id' : 'YOUR_CLIENT_ID.apps.googleusercontent.com',
        'client_secret' : 'YOUR_CLIENT_SECRET',
        'redirect_uri' : 'http://localhost:8000',
        'grant_type' : 'refresh_token'
      },
      function(returnedData) {
        var e = document.createElement("pre")
        e.innerHTML = JSON.stringify(returnedData, undefined, 2);
        document.body.appendChild(e);
        $('#accessToken').val(returnedData['access_token'])
      });
}

function retrieveGoogleMyBusinessAccounts(accessToken) {
    $.ajax({
        type: 'GET',
        url: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
        headers: {
            'Authorization' : 'Bearer ' + accessToken
        },
        success: function(returnedData) {
            var e = document.createElement("pre")
            e.innerHTML = JSON.stringify(returnedData, undefined, 2);
            document.body.appendChild(e);
        }
    });
}
</script>
</body>
</html>
Somente acesso on-line

Para facilitar a implementação, as chamadas às APIs do Perfil da Empresa podem ser feitas sem armazenar em cache os tokens de atualização do usuário. No entanto, o usuário precisa fazer login para que a plataforma realize chamadas de API como o usuário.

O snippet de código a seguir demonstra a implementação do fluxo de Login do Google e como fazer uma chamada de API específica do usuário. Depois que o usuário fizer login com a Conta do Google e der o consentimento ao seu aplicativo, um token de acesso será enviado. Ele identifica o usuário e precisa ser passado como cabeçalho na solicitação das APIs do Perfil da Empresa.

Para executar esse código, consulte a seção Executar a amostra.

<!-- The top of file index.html -->
<html lang="en">
  <head>
    <meta name="google-signin-scope" content="profile email https://www.googleapis.com/auth/business.manage">
    <meta name="google-signin-client_id" content="YOUR_CLIENT_ID.apps.googleusercontent.com">
    <script src="https://apis.google.com/js/platform.js" async defer></script>
  </head>
  <body>
    <div class="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></div>
    <script>
      var gmb_api_version = 'https://mybusinessaccountmanagement.googleapis.com/v1';
      function onSignIn(googleUser) {
        // Useful data for your client-side scripts:
        var profile = googleUser.getBasicProfile();
        console.log('Full Name: ' + profile.getName());
        console.log("Email: " + profile.getEmail());
        var access_token = googleUser.getAuthResponse().access_token;

        //Using the sign in data to make a Business Profile APIs call
        var req = gmb_api_version + '/accounts';
        var xhr = new XMLHttpRequest();
        xhr.open('GET', req);
        xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);

        //Displaying the API response
        xhr.onload = function () {
          document.body.appendChild(document.createTextNode(xhr.responseText));
        }
        xhr.send();
      }
    </script>
  </body>
</html>
Observação: para mais informações sobre a integração, consulte Fazer login com o Google.
Executar a amostra

Siga estas etapas para executar o exemplo de código fornecido:

Salve o snippet de código em um arquivo chamado index.html. Verifique se o ID do cliente está definido no arquivo.

Inicie o servidor da Web com o seguinte comando no seu diretório de trabalho:

Python 2.X
Python 3.X
python -m SimpleHTTPServer 8000

Na página Credenciais do Console de APIs, selecione o ID do cliente usado.

No campo Origens JavaScript autorizadas, digite o URL do site. Para executar o exemplo de código neste guia, você também precisa adicionar http://localhost:8000.

Carregue o seguinte URL no seu navegador:

http://localhost:8000/index.html

Isso foi útil?

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-02-18 UTC.