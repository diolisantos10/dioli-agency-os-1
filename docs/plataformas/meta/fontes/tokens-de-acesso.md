---
titulo: "Tipos de token de acesso — usuário, app, página, cliente"
url: https://developers.facebook.com/documentation/facebook-login/guides/access-tokens
capturado_em: 2026-09-11
hash: 1a855d378e1d6291
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Tokens de acesso para tecnologias da Meta
Updated: 25 de nov de 2025
Copiar para LLM
Ver como Markdown
Um token de acesso é uma string opaca que identifica um usuário, app ou Página do Facebook e pode ser usado pelo app para fazer chamadas da Graph API. O token inclui informações sobre quando expira e por qual app foi gerado. A maioria das chamadas de API em apps da Meta exigem um token de acesso para verificações de privacidade. Diferentes tipos de tokens de acesso são compatíveis com diferentes casos de uso.
Tipo de token de acesso	Descrição

Token de acesso do app
	
Os tokens de acesso do app permitem que você leia e modifique as configurações do app. Gere um usando a chave secreta do app da Meta por meio de uma chamada entre servidores.

Token de cliente
	
Os tokens de cliente identificam seu app ao fazer chamadas de API no nível do app de apps nativos ou para desktop. Como os tokens de cliente são incorporados aos apps, eles não são secretos. Encontre o token de cliente no Painel de Apps da Meta.

Token de acesso à Página
	
Os tokens de acesso à Página permitem ler, escrever e modificar os dados que pertencem a uma Página do Facebook. Para isso, primeiro obtenha um token de acesso do usuário e depois troque-o por um token de acesso à Página usando a Graph API.

Token de acesso de usuário do sistema
	
Os tokens de acesso do usuário do sistema permitem que seu app execute ações programáticas e automatizadas em objetos de anúncio ou Páginas sem exigir a entrada do usuário do app ou uma nova autenticação.

Token de acesso do usuário
	
Com os tokens de acesso do usuário, o app pode realizar ações em tempo real com base na entrada do usuário. Você precisa de um token de acesso do usuário sempre que o app lê, modifica ou escreve os dados do Facebook de uma pessoa em seu nome. Obtenha uma por meio de um diálogo Entrar que exige que a pessoa conceda permissão ao app.
Tokens de acesso do usuário
Com os tokens de acesso do usuário, o app pode realizar ações em tempo real com base na entrada do usuário. Você precisa de um token de acesso do usuário sempre que o app lê, modifica ou escreve os dados do Facebook de uma pessoa em seu nome. Obtenha uma por meio de um diálogo Entrar que exige que a pessoa conceda permissão ao seu app.
Plataformas diferentes têm diferentes métodos para iniciar esse processo e incluem funcionalidades para gerenciar tokens de acesso em nome do desenvolvedor e permissões concedidas pelas pessoas:
Android
Os SDKs do Facebook para Android gerenciam automaticamente tokens de acesso de usuário por meio da classe com.facebook.AccessToken. Você pode aprender mais sobre como obter um token de acesso de usuário implementando o Login do Facebook para Android. Você pode recuperar o token de acesso do usuário inspecionando Session.getCurrentAccessToken.
Exemplo de código
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    accessToken = AccessToken.getCurrentAccessToken();
}
iOS
Os SDKs do Facebook para iOS gerenciam automaticamente tokens de acesso de usuário por meio da classe FBSDKAccessToken. Você pode aprender mais sobre como obter um token de acesso de usuário implementando o Login do Facebook para iOS. Você pode recuperar o token de acesso inspecionando FBSDKAccessToken.currentAccessToken.
Exemplo de código
- (void)viewDidLoad
{
  [super viewDidLoad];
  NSString *accessToken = [FBSDKAccessToken currentAccessToken];
}
JavaScript
O SDK do Facebook para JavaScript obtém e mantém tokens de acesso de usuário automaticamente em cookies de navegador. Você pode recuperar o token de acesso do usuário fazendo uma chamada para FB.getAuthResponse, que incluirá uma propriedade accessToken na resposta.
Exemplo de código
FB.getLoginStatus(function(response) {
  if (response.status === 'connected') {
    var accessToken = response.authResponse.accessToken;
  }
} );
Acesse a documentação de SDKs da web do Facebook para ver um exemplo de código completo.
Web (sem JavaScript)
Quando você criar um app da web sem o SDK do Facebook para JavaScript, será preciso gerar um token de acesso durante as etapas descritas neste documento.
Tokens de acesso do app
Os tokens de acesso do app permitem que você leia e modifique as configurações do app. Gere um usando a chave secreta do app da Meta por meio de uma chamada entre servidores.
Limitações
Os tokens de acesso do app não expõem todos os dados de usuário que um token de acesso do usuário exporia. Para ler os dados do usuário no seu app, use um token de acesso do usuário.
Tokens de acesso do app são inseguros se o seu app está definido para Native/Desktop nas configurações avançadas do seu Painel de Apps. Normalmente, apps nativos ou para desktop incorporam a chave secreta do app no código, o que insegura o token de acesso do app gerado.
Como gerar um token de acesso do app
Para gerar um token de acesso do app, você precisará:
A identificação do app
Sua chave secreta do app
Exemplo de código
curl -X GET "https://graph.facebook.com/oauth/access_token
  ?client_id={your-app-id}
  &client_secret={your-app-secret}
  &grant_type=client_credentials"

Essa chamada retorna um token de acesso do app que você pode usar no lugar de um token de acesso de usuário para fazer chamadas de API. Nunca codifique tokens de acesso do app no código do cliente ou em binários do app. Isso expõe a chave secreta do app e dá a qualquer pessoa que carregar sua página da web ou descompilar o app acesso total para modificá-lo. Use tokens de acesso do app somente em chamadas de servidor para servidor.
Importante: esta solicitação usa a chave secreta do seu app. Por isso, ela só deve ser feita usando o código do lado do servidor. Nunca compartilhe a chave secreta do app com ninguém.
Há um outro método para fazer chamadas para a Graph API que não exige o uso de um token de acesso do app gerado. Basta passar o ID e a chave secreta do seu app como o parâmetro access_token ao fazer uma chamada:
curl -i -X GET "https://graph.facebook.com/{api-endpoint}&access_token={your-app_id}|{your-app_secret}"

Para escolher entre usar um token de acesso gerado ou esse método, você precisa considerar o local onde ocultou a chave secreta do app.
Tokens de acesso à Página
Os tokens de acesso à Página permitem ler, escrever e modificar os dados que pertencem a uma Página do Facebook. Para isso, primeiro obtenha um token de acesso do usuário e depois troque-o por um token de acesso à Página usando a Graph API.
Exemplo de código
curl -i -X GET "https://graph.facebook.com/{your-user-id}/accounts?access_token={user-access-token}"
Essa ação retorna uma lista de Páginas nas quais você tem uma função, incluindo a categoria, as permissões e o token de acesso de cada uma delas.
{
  "data": [
    {
      "access_token": "EAACEdE...",
      "category": "Brand",
      "category_list": [
        {
          "id": "1605186416478696",
          "name": "Brand"
        }
      ],
      "name": "Ash Cat Page",
      "id": "1353269864728879",
      "tasks": [
        "ANALYZE",
        "ADVERTISE",
        "MODERATE",
        "CREATE_CONTENT",
        "MANAGE"
      ]
    },
    {
      "access_token": "EAACEdE...",
      "category": "Pet Groomer",
      "category_list": [
        {
          "id": "163003840417682",
          "name": "Pet Groomer"
        },
        {
          "id": "2632",
          "name": "Pet"
        }
      ],
      "name": "Unofficial: Tigger the Cat",
      "id": "1755847768034402",
      "tasks": [
        "ANALYZE",
        "ADVERTISE",
        "MODERATE",
        "CREATE_CONTENT"
      ]
    }
  ]
}
Com um token de acesso à Página, você pode fazer chamadas de API em nome de uma Página, como publicar uma atualização de status ou ler dados de insights sobre a Página.
Tokens de acesso à Página são únicos para cada combinação de Página, administrador e app.
Tokens de acesso de usuário do sistema
Os tokens de acesso do usuário do sistema permitem que seu app execute ações programáticas e automatizadas em objetos de anúncio ou nas Páginas sem exigir uma nova autenticação ou a entrada do usuário do app.
Os tokens do sistema dependem dos usuários do sistema. Quando você usa um token do sistema, os pontos de extremidade verificam se o usuário identificado tem acesso ao recurso solicitado. Se o usuário não tiver acesso, a solicitação será rejeitada.
Os usuários do sistema podem ser administradores ou funcionários:
Os usuários do sistema com função administrativa têm acesso total a todos os ativos pertencentes ou compartilhados com seu portfólio empresarial por padrão. Esses usuários serão úteis se o app precisar de acesso a todos os ativos do portfólio empresarial, sem precisar conceder manualmente o acesso a cada ativo de negócios que for criado ou compartilhado com seu portfólio.
Os usuários do sistema para funcionários devem ter acesso a ativos individuais pertencentes ou compartilhados com seu portfólio empresarial. Se o app precisar acessar apenas alguns ativos que pertencem a você, um usuário do sistema para funcionários deverá ser suficiente.
Gerar um token de acesso do usuário do sistema
Para gerar um token do sistema:
Acesse o painel Configurações da empresa⁠ e clique em Usuários do sistema.
Clique no botão +Adicionar. Na janela Criar usuário do sistema, insira um nome de usuário do sistema e atribua a ele a função Administrador ou Funcionário.
Clique no nome do usuário do sistema para exibir a sobreposição de atribuição de ativos.
Clique no botão Atribuir ativos, selecione o app e conceda ao usuário do sistema a permissão Gerenciar app.
Recarregue a página para confirmar que foi concedido Controle total do app ao seu usuário do sistema.
Clique no botão Gerar token. Na janela que for exibida, selecione seu app, escolha uma preferência para expiração do token e atribua as permissões necessárias para seu caso de uso.
Clique em Gerar token e copie o token que for exibido.
Tokens de acesso do cliente
Os tokens de cliente identificam seu app ao fazer chamadas de API no nível do app de apps nativos ou para desktop. Como os tokens de cliente são incorporados aos apps, eles não são secretos. Encontre o token de cliente no Painel de Apps da Meta.
Ao contrário de outros tokens, os tokens de acesso do cliente não podem ser usados em solicitações sozinhos. É necessário combiná-los com o ID do app, anexando o token ao final desse ID, separado por um símbolo de barra (|):
{app-id}|{client-token}
Por exemplo:
access_token=1234|5678
Para obter o token de acesso do cliente do app:
Entre na sua conta de desenvolvedor.
Na página Apps, selecione o app para abrir o painel correspondente.
No painel, navegue até Configurações > Avançado > Segurança > Token de cliente.
Tokens de curta e longa duração
Os tokens de acesso existem em duas formas: de curta duração e de longa duração. Normalmente, os tokens de curta duração expiram em até 2 horas, e os de longa duração expiram em até 60 dias. Não dependa desses períodos de vida útil permanecerem iguais, pois eles podem ser alterados sem aviso ou expirar antes. Consulte Como lidar com erros para obter mais informações.
Os tokens de acesso gerados por meio de login da web são de curta duração, mas você pode convertê-los em tokens de longa duração fazendo uma chamada de API do lado do servidor com a chave secreta do app.
Por padrão, os apps para celular que usam os SDKs do Facebook para iOS e Android recebem tokens de longa duração.
Os apps com acesso padrão à API de Marketing recebem tokens de longa duração que não expiram com base no tempo, embora ainda estejam sujeitos à invalidação por outras razões. Isso também se aplica aos tokens de acesso para usuários do sistema no Gerenciador de Negócios.
Portabilidade de token
A maioria dos tokens de acesso é portátil, ou seja, é possível usá-los em um cliente móvel, um navegador da web ou seu servidor. Caso você obtenha um token em um cliente, será possível enviá-lo para seu servidor para chamadas de servidor para servidor. Caso você obtenha um token por meio de uma chamada de servidor, será possível enviá-lo a um cliente para chamadas do lado do cliente. No entanto, a Apple não permite mover tokens para servidores.
Sempre transfira tokens entre seu cliente e o servidor de forma segura via HTTPS para proteger contas de usuários. Saiba mais sobre as implicações da portabilidade de token.
Classes de token de acesso
Ao testar uma chamada de API, você pode incluir o parâmetro access_token definido como seu valor de token de acesso. No entanto, ao fazer chamadas seguras do seu app, use a classe de token de acesso fornecida pelo SDK da plataforma em vez de passar strings de token brutas. Isso garante que os tokens sejam gerenciados com segurança e atualizados automaticamente.
Duração do token de acesso
O tamanho dos tokens de acesso muda ao longo do tempo, à medida que a Meta atualiza o que eles armazenam e como são codificados. Use um tipo de dado de comprimento variável sem um tamanho máximo específico para armazenar tokens de acesso.
Saiba mais
Use a ferramenta token de acesso para ver uma lista dos seus tokens e as informações de depuração de cada um.
Expiração e extensão
Depuração e tratamento de erros
Uso de tokens com diferentes tipos de apps
Você achou esta página útil?