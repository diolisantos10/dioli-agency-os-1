---
titulo: "Graph API — versionamento (ciclo de vida de versão, depreciação)"
url: https://developers.facebook.com/docs/graph-api/guides/versioning
capturado_em: 2026-09-12
hash: fb7e81182d0877f0
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Entrada da pesquisa
​
Graph API
Visão geral
SDKs do Facebook
Resultados paginados
Limites de volume
Controle de versões
Introdução
Solicitações em lote
Solicitações de depuração
Solução de erros
Field Expansion
Secure Requests
Registro de alterações
Reference
Controle de versões da plataforma

A plataforma do Facebook é compatível com o controle de versões para que os criadores de aplicativos possam implementar alterações ao longo do tempo. Este documento explica como os SDKs e as APIs são afetados pelas versões e descreve como usar essas versões nas suas solicitações.

Controle de versões

Nem todos os tipos de API e de SDK têm o mesmo sistema de controle de versões. Por exemplo, em comparação com o SDK do Facebook para iOS, a Graph API tem um controle de versões com ritmo e numeração diferentes. Todos os SDKs do Facebook aceitam a interação com diferentes versões das nossas APIs. Podem existir várias versões de APIs ou de SDKs ao mesmo tempo, com funcionalidades diferentes em cada versão.

Qual é a versão mais recente da Graph API?

A versão mais recente da Graph API é v26.0

Por que existem versões?

O objetivo do controle de versões é permitir que os desenvolvedores de aplicativos saibam com antecedência quando haverá alterações em APIs ou em SDKs. As versões ajudam no desenvolvimento de web, mas são essenciais para dispositivos móveis, já que uma pessoa pode demorar bastante tempo para atualizar (ou nunca atualizar) o seu aplicativo no smartphone.

Cada versão é mantida por pelo menos dois anos após o lançamento. Isso permite um cronograma estável que mostra quanto tempo o aplicativo continuará funcionando e até quando você precisará atualizá-lo para obter novas versões.

Cronograma de versões

Cada versão tem garantia de operação de pelo menos dois anos. Não será mais possível usar uma versão dois anos após a data de lançamento da próxima. Por exemplo, se a versão 2.3 da API fosse lançada em 25 de março de 2015 e a versão 2.4 fosse lançada em 7 de agosto de 2015, a versão 2.3 expiraria em 7 de agosto de 2017, dois anos após o lançamento da 2.4.

No caso das APIs, quando não for mais possível usar uma versão, por padrão, todas as chamadas feitas a ela serão encaminhadas para a próxima versão mais antiga disponível para uso. Veja este exemplo de cronograma:

Para os SDKs, uma versão estará sempre disponível, já que se trata de um pacote que pode ser baixado. No entanto, o SDK pode depender de APIs ou de métodos que não funcionam mais. Por isso, é necessário considerar que um SDK em fim de vida útil não será mais funcional.

Encontre informações específicas sobre cronogramas de versões, mudanças e datas de lançamento na nossa página de registro de alterações.

Todos os elementos permanecerão completamente inalterados em uma versão?

O Facebook se reserva o direito de fazer alterações em qualquer API por um período curto para resolver questões de segurança ou privacidade. Essas alterações não acontecem com frequência, mas podem ocorrer.

O que acontece se eu não especificar a versão de uma API?

Isso significa que você fará uma chamada sem versão. Por exemplo, digamos que a versão atual seja a 4.0. A chamada é assim:

curl -i -X "https://graph.facebook.com/v4.0/{my-user-id}&access_token={access-token}"

A mesma chamada sem versão fica da seguinte forma:

curl -i -X "https://graph.facebook.com/{my-user-id}&access_token={access-token}"

Uma chamada sem versão usa a versão definida no cartão Atualizar a versão da API do Painel de Aplicativos em Configurações > Avançado. No exemplo a seguir, a versão definida no Painel de Aplicativos é a 2.10, e a chamada sem versão é equivale a:

curl -i -X "https://graph.facebook.com/v2.10/{my-user-id}&access_token={access-token}"

Recomendamos que você sempre especifique a versão quando possível.

Limitações
Não é possível fazer chamadas de API sem versão para o Facebook SDK for Javascript.
Meu aplicativo pode fazer chamadas para versões antigas?

É possível especificar versões mais antigas nas suas chamadas de API, desde que estejam disponíveis e que o seu aplicativo tenha feito chamadas para essa versão. Por exemplo, caso o aplicativo tenha sido criado após o lançamento da versão 2.0 e use essa versão para fazer chamadas, será possível continuar fazendo isso até que a versão 2.0 expire, mesmo após o lançamento de novas versões. Caso o aplicativo tenha sido criado após a versão 2.0, mas não tenha feito chamadas até a versão 2.2, não poderá usar as versões 2.0 ou 2.1 para fazer chamadas. O aplicativo só poderá fazer chamadas usando a versão 2.2 e as versões mais recentes.

Controle de versões da API de Marketing

A API de Marketing tem o próprio esquema de controle de versões. Tanto os números de versão quanto os cronogramas são diferentes da Graph API.

Saiba mais sobre o controle de versões da API de Marketing
Como fazer solicitações de controle de versões
Graph API

Sejam básicos ou estendidos, quase todos os pontos de extremidade da Graph API estão disponíveis por meio de um caminho com controle de versões. Disponibilizamos um guia completo sobre como usar versões com a Graph API no nosso guia de início rápido da Graph API.

Diálogos

Os caminhos com controle de versão funcionam para pontos de extremidade de API e também para diálogos e Plugins Sociais. Por exemplo, se você quiser criar um diálogo de Login do Facebook para um aplicativo da web, será possível incluir um número de versão antes do ponto de extremidade que gera o diálogo:

https://www.facebook.com/v26.0/dialog/oauth?
  client_id={app-id}
  &redirect_uri={redirect-uri}
Plugins Sociais

Se estiver usando as versões HTML5 ou xfbml dos nossos Plugins Sociais, a versão renderizada será determinada pela versão especificada ao inicializar o SDK do JavaScript.

Caso esteja inserindo uma versão de iframe ou de link simples de um dos nossos plugins, coloque o número da versão antes do caminho de origem do plugin:

<iframe
  src="//www.facebook.com/v26.0/plugins/like.php?href=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2Fplugins%2F&amp;width&amp;layout=standard&amp;action=like&amp;show_faces=true&amp;share=true&amp;height=80&amp;appId=634262946633418" 
  scrolling="no" 
  frameborder="0" 
  style="border:none; overflow:hidden; height:80px;" 
  allowTransparency="true">
</iframe>
Como fazer solicitações de controle de versões usando SDKs

Ao usar o SDK do Facebook para iOS, Android ou JavaScript, as chamadas de controle de versões serão em grande parte automáticas. Isso funciona de modo diferente para cada sistema de controle de versões de SDKs.

JavaScript

O SDK do JavaScript só poderá usar versões diferentes de API se você estiver usando o caminho sdk.js.

Caso você use FB.init() do SDK do JavaScript, será necessário usar o parâmetro da versão desta forma:

FB.init({
  appId      : '{app-id}',
  version    : 'v26.0'
});

Se você definir a sinalização da versão na inicialização, as chamadas para FB.api() terão a versão automaticamente incluída antes do caminho chamado. O mesmo acontece com os diálogos do Login do Facebook que são chamados. O diálogo do Login do Facebook será exibido para aquela versão da API.

Se for necessário, você poderá substituir uma versão. Para isso, basta colocar o número da nova versão antes do caminho do ponto de extremidade na chamada FB.api().

iOS

Toda nova versão do SDK do Facebook para iOS é vinculada à versão que está disponível na data do lançamento. Isso significa que, se estiver atualizando para um novo SDK, você também estará atualizando para a versão mais recente da API (embora seja possível especificar manualmente outra versão anterior e disponível da API com [FBSDKGraphRequest initWithGraphPath]). A versão da API é listada com o lançamento de cada versão do SDK do Facebook para iOS.

Assim como o SDK do JavaScript, a versão é colocada antes de chamadas feitas à Graph API com o SDK do Facebook para iOS. Por exemplo, se v2.7 for a versão mais recente da API, a chamada /me/friends (usada no exemplo de código a seguir) será, na verdade, a chamada /v2.7/me/friends:

[[[FBSDKGraphRequest alloc] initWithGraphPath:@"me/friends"
  parameters:@{@"fields": @"cover,name,start_time"}]
    startWithCompletionHandler:^(FBSDKGraphRequestConnection *connection, id result, NSError *error) {
        (...)
    }];

É possível substituir a versão da chamada por [FBSDKGraphRequestConnection overrideVersionPartWith].

Android

Toda nova versão do SDK do Facebook para Android é vinculada à versão disponível na data do lançamento. Isso significa que, se você estiver atualizando para um novo SDK, também estará atualizando para a versão mais recente da API (embora seja possível especificar manualmente outra versão anterior e disponível da API com GraphRequest.setVersion()). A versão da API é listada com o lançamento de cada versão do SDK do Facebook para Android.

Assim como o SDK do JavaScript, a versão é colocada antes de chamadas feitas à Graph API com o SDK do Facebook para Android. Por exemplo, se v2.7 for a versão mais recente da API, a chamada /me (usada no exemplo de código a seguir) será, na verdade, a chamada /v2.7/me:

GraphRequest request = GraphRequest.newGraphPathRequest (
        accessToken,
        "/me/friends",
        new GraphRequest.GraphJSONObjectCallback() {
            @Override
            public void onCompleted(
                   JSONObject object,
                   GraphResponse response) {
                // Application code
            }
        });
Bundle parameters = new Bundle();
parameters.putString("fields", "id,name,link");
request.setParameters(parameters); 
request.executeAsync();

É possível substituir a versão da chamada por GraphRequest.setVersion().

Nesta Página
Controle de versões da plataforma
Controle de versões
Qual é a versão mais recente da Graph API?
Por que existem versões?
Cronograma de versões
Todos os elementos permanecerão completamente inalterados em uma versão?
O que acontece se eu não especificar a versão de uma API?
Meu aplicativo pode fazer chamadas para versões antigas?
Controle de versões da API de Marketing
Como fazer solicitações de controle de versões
Graph API
Diálogos
Plugins Sociais
Como fazer solicitações de controle de versões usando SDKs
JavaScript
iOS
Android