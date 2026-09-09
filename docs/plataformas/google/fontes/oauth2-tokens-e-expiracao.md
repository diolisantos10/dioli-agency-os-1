---
titulo: "Google Identity — OAuth 2.0: refresh token e expiração (app em Testing = 7 dias)"
url: https://developers.google.com/identity/protocols/oauth2
capturado_em: 2026-09-09
hash: 4b00f5d43c1db98d
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Como usar o OAuth 2.0 para acessar as APIs do Google
Nesta página
Etapas básicas
1. Acesse as credenciais do OAuth 2.0 no Console de APIs do Google.
2. Receba um token de acesso do servidor de autorização do Google.
3. Examine os escopos de acesso concedidos pelo usuário.
4. Envie o token de acesso para uma API.
5. Atualize o token de acesso, se necessário.
Scenarios
Aplicativos do servidor da Web
Observação: o uso da implementação do OAuth 2.0 do Google é regido pelas políticas do OAuth 2.0.

As APIs do Google usam o protocolo OAuth 2.0 para autenticação e autorização. O Google permite o uso do OAuth 2.0 para diversas finalidades, como em apps de servidores da Web, lado do cliente, instalados e de dispositivos de entrada limitada aplicações.

Para começar, acesse as credenciais do cliente OAuth 2.0 no Console de APIs do Google. Em seguida, o aplicativo cliente solicita um token de acesso do servidor de autorização do Google, extrai um token da resposta e envia o token para a API do Google que você quer acessar. Para uma demonstração interativa do uso do OAuth 2.0 com o Google (incluindo a opção de usar suas próprias credenciais de clientes), acesse o OAuth 2.0 Playground.

Esta página oferece uma visão geral dos cenários de autorização do OAuth 2.0 que o Google oferece suporte, e links para conteúdo mais detalhado. Para mais detalhes sobre como usar o OAuth 2.0 para autenticação, consulte OpenID Connect.

Observação: considerando as implicações de segurança de uma implementação correta, recomendamos o uso de bibliotecas do OAuth 2.0 ao interagir com os endpoints do OAuth 2.0 do Google. É uma prática recomendada usar um código bem depurado fornecido por outras pessoas, e isso ajudará você a se proteger e seus usuários. Para mais informações, consulte Bibliotecas de cliente.
Etapas básicas

Todos os aplicativos seguem um padrão básico ao acessar uma API do Google usando o OAuth 2.0. Em geral, você segue cinco etapas:

1. Acesse as credenciais do OAuth 2.0 no Console de APIs do Google.

Acesse o Console de APIs do Google para receber credenciais do OAuth 2.0, como um ID do cliente e uma chave secreta do cliente, que são conhecidos pelo Google e pelo seu aplicativo. O conjunto de valores varia de acordo com o tipo de aplicativo que você está criando. Por exemplo, um aplicativo JavaScript não exige uma chave secreta, mas um aplicativo de servidor da Web exige.

Você precisa criar um cliente OAuth adequado para a plataforma em que o app será executado, por exemplo:

Para apps Android, use o Android.
 Para apps iOS e macOS, use o tipo de cliente iOS.
code Para apps da Web de lado do servidor ou JavaScript, use o tipo de cliente Aplicativo da Web. Não use esse tipo de cliente para outros aplicativos, como apps nativos ou para dispositivos móveis.
chrome_extension Para extensões do Chrome, use o tipo de cliente Extensão do Chrome.
tv Para dispositivos de entrada limitada, como TVs ou dispositivos incorporados, use o tipo de cliente TVs e dispositivos de entrada limitada.
host Para interações de servidor para servidor, use contas de serviço. Nenhum ID do cliente OAuth é necessário.
2. Receba um token de acesso do servidor de autorização do Google.

Antes que o aplicativo possa acessar dados particulares usando uma API do Google, ele precisa receber um token de acesso que conceda acesso a essa API. Um único token de acesso pode conceder diferentes graus de acesso a várias APIs. Um parâmetro de variável chamado scope controla o conjunto de recursos e operações que um token de acesso permite. Durante a solicitação de token de acesso, o aplicativo envia um ou mais valores no parâmetro scope.

Há várias maneiras de fazer essa solicitação, e elas variam de acordo com o tipo de aplicativo que você está criando. Por exemplo, um aplicativo JavaScript pode solicitar um token de acesso usando um redirecionamento do navegador para o Google, enquanto um aplicativo instalado em um dispositivo que não tem navegador usa solicitações de serviço da Web. Para mais informações sobre como fazer a solicitação, consulte Scenarios e os guias de implementação detalhados para cada tipo de app.

Algumas solicitações exigem uma etapa de autenticação em que o usuário faz login com a Conta do Google. Depois de fazer login, o usuário recebe uma pergunta sobre se ele quer conceder uma ou mais permissões que o aplicativo está solicitando. Esse processo é chamado de consentimento do usuário.

Se o usuário conceder pelo menos uma permissão, o servidor de autorização do Google enviará ao aplicativo um token de acesso (ou um código de autorização que o aplicativo pode usar para receber um token de acesso) e uma lista de escopos de acesso concedidos por esse token. Se o usuário não conceder a permissão, o servidor retornará um erro.

Geralmente, é uma prática recomendada solicitar escopos de forma incremental, no momento em que o acesso é necessário, em vez de antecipadamente. Por exemplo, um app que quer oferecer suporte para salvar um evento em uma agenda não deve solicitar acesso ao Google Agenda até que o usuário pressione o botão "Adicionar à Agenda". Consulte Autorização incremental.

3. Examine os escopos de acesso concedidos pelo usuário.

Compare os escopos incluídos na resposta do token de acesso com os escopos necessários para acessar recursos e funcionalidades do aplicativo que dependem do acesso a uma API do Google relacionada. Desative todos os recursos do app que não podem funcionar sem acesso à API relacionada.

O escopo incluído na solicitação pode não corresponder ao escopo incluído na resposta, mesmo que o usuário tenha concedido todos os escopos solicitados. Consulte a documentação de cada API do Google para os escopos necessários para acesso. Uma API pode mapear vários valores de string de escopo para um único escopo de acesso, retornando a mesma string de escopo para todos os valores permitidos na solicitação. Exemplo: a API Google People pode retornar um escopo de https://www.googleapis.com/auth/contacts quando um app solicitou que um usuário autorizasse um escopo de https://www.google.com/m8/feeds/; o método people.updateContact da API Google People exige um escopo concedido de https://www.googleapis.com/auth/contacts.

4. Envie o token de acesso para uma API.

Depois que um aplicativo recebe um token de acesso, ele envia o token para uma API do Google em um cabeçalho da solicitação de autorização HTTP. É possível enviar tokens como parâmetros de string de consulta de URI, mas não recomendamos isso, porque os parâmetros de URI podem acabar em arquivos de registro que não são totalmente seguros. Além disso, é uma boa prática REST evitar a criação de nomes de parâmetros de URI desnecessários.

Os tokens de acesso são válidos apenas para o conjunto de operações e recursos descritos no scope da solicitação de token. Por exemplo, se um token de acesso for emitido para a API Google Agenda, ele não concederá acesso à API Contatos do Google. No entanto, é possível enviar esse token de acesso para a API Google Agenda várias vezes para operações semelhantes.

5. Atualize o token de acesso, se necessário.

Os tokens de acesso têm duração limitada. Se o aplicativo precisar de acesso a uma API do Google além da vida útil de um único token de acesso, ele poderá receber um token de atualização. Um token de atualização permite que o aplicativo receba novos tokens de acesso.

Observação: salve os tokens de atualização em um armazenamento seguro de longo prazo e continue usando-os enquanto eles permanecerem válidos. Os limites se aplicam ao número de tokens de atualização emitidos por combinação de cliente-usuário e por usuário em todos os clientes, e esses limites são diferentes. Se o aplicativo solicitar tokens de atualização suficientes para exceder um dos limites, os tokens de atualização mais antigos vão parar de funcionar.
Scenarios

Esses cenários descrevem como usar o OAuth 2.0 para solicitar códigos de autorização e receber tokens de acesso e atualização para diferentes tipos de aplicativos.

Aplicativos do servidor da Web

O endpoint do OAuth 2.0 do Google oferece suporte a aplicativos de servidor da Web que usam linguagens e frameworks como PHP, Java, Go, Python, Ruby e ASP.NET.

A sequência de autorização começa quando o aplicativo redireciona um navegador para um URL do Google . O URL inclui parâmetros de consulta que indicam o tipo de acesso que está sendo solicitado. O Google gerencia a autenticação do usuário, a seleção de sessão e o consentimento do usuário. O resultado é um código de autorização, que o aplicativo pode trocar por um token de acesso e um token de atualização token.

O aplicativo precisa armazenar o token de atualização para uso futuro e usar o token de acesso para acessar uma API do Google. Quando o token de acesso expira, o aplicativo usa o token de atualização para receber um novo.

Para mais detalhes, consulte Usar o OAuth 2.0 para aplicativos de servidor da Web (em inglês).

Aplicativos instalados

O endpoint do OAuth 2.0 do Google oferece suporte a aplicativos instalados em dispositivos como computadores, dispositivos móveis e tablets. Ao criar um ID do cliente no Console de APIs do Google, especifique que esse é um aplicativo instalado e selecione Android, Extensão do Chrome, iOS, ou app para computador como o tipo de aplicativo.

O processo resulta em um ID do cliente e, em alguns casos, uma chave secreta do cliente, que você incorpora ao código-fonte do aplicativo. Nesse contexto, a chave secreta do cliente obviamente não é tratada como secreta.

A sequência de autorização começa quando o aplicativo redireciona um navegador para um URL do Google . O URL inclui parâmetros de consulta que indicam o tipo de acesso que está sendo solicitado. O Google gerencia a autenticação do usuário, a seleção de sessão e o consentimento do usuário. O resultado é um código de autorização, que o aplicativo pode trocar por um token de acesso. O aplicativo precisa validar o token de acesso antes de incluí-lo em uma solicitação de API do Google request. Quando o token expira, o aplicativo repete o processo.

Opcionalmente, um servidor de back-end pode trocar o código de autorização por um token de atualização, armazenando-o em um local seguro. Quando o token de acesso expira, o servidor de back-end usa o token de atualização para receber um novo para o aplicativo.

Para mais detalhes, consulte Autorizar o acesso aos dados do usuário do Google para Android, e OAuth 2.0 para apps iOS e para computador.

Aplicativos do lado do cliente (JavaScript)

O endpoint do OAuth 2.0 do Google oferece suporte a aplicativos JavaScript executados em um navegador.

A sequência de autorização começa quando o aplicativo redireciona um navegador para um URL do Google . O URL inclui parâmetros de consulta que indicam o tipo de acesso que está sendo solicitado. O Google gerencia a autenticação do usuário, a seleção de sessão e o consentimento do usuário.

O resultado é um token de acesso, que o cliente precisa validar antes de incluí-lo em uma solicitação de API do Google. Quando o token expira, o aplicativo repete o processo.

Para mais detalhes, consulte Usar OAuth 2.0 para aplicativos do lado do cliente.

Aplicativos em dispositivos de entrada limitada

O endpoint do OAuth 2.0 do Google oferece suporte a aplicativos executados em dispositivos de entrada limitada, como consoles de jogos, câmeras de vídeo e impressoras.

A sequência de autorização começa com o aplicativo fazendo uma solicitação de serviço da Web para um URL do Google para um código de autorização. A resposta contém vários parâmetros, incluindo um URL e um código que o aplicativo mostra ao usuário.

O usuário recebe o URL e o código do dispositivo e, em seguida, muda para um dispositivo ou computador separado com recursos de entrada mais avançados. O usuário abre um navegador, navega até o URL especificado, faz login e insere o código.

Enquanto isso, o aplicativo pesquisa um URL do Google em um intervalo especificado. Depois que o usuário aprova o acesso, a resposta do servidor do Google contém um token de acesso e um token de atualização. O aplicativo precisa armazenar o token de atualização para uso futuro e usar o token de acesso para acessar uma API do Google. Quando o token de acesso expira, o aplicativo usa o token de atualização para receber um novo.

Para mais detalhes, consulte Usar o OAuth 2.0 para dispositivos.

Contas de serviço

As APIs do Google, como a API Prediction e o Google Cloud Storage, podem agir em nome do seu aplicativo sem acessar informações do usuário. Nessas situações, o aplicativo precisa comprovar a própria identidade para a API, mas nenhum consentimento do usuário é necessário. Da mesma forma, em cenários empresariais, o aplicativo pode solicitar acesso delegado a alguns recursos.

Para esses tipos de interações de servidor para servidor, você precisa de uma conta de serviço, que pertence ao aplicativo e não a um usuário final individual. O aplicativo chama as APIs do Google em nome da conta de serviço, e o consentimento do usuário não é necessário. Em cenários sem conta de serviço, o aplicativo chama as APIs do Google em nome dos usuários finais, e o consentimento do usuário às vezes é necessário.

Observação: esses cenários de conta de serviço exigem que os aplicativos criem e assinem criptograficamente JSON Web Tokens (JWTs). Recomendamos o uso de uma biblioteca para realizar essas tarefas. Se você escrever esse código sem usar uma biblioteca que abstrai a criação e a assinatura de tokens, poderá cometer erros que teriam um impacto grave na segurança do aplicativo. Para uma lista de bibliotecas que oferecem suporte a esse cenário, consulte a documentação da conta de serviço.

As credenciais de uma conta de serviço, que você recebe no Console de APIs do Google, incluem um endereço de e-mail gerado que é exclusivo, um ID do cliente e pelo menos um par de chaves pública/privada. Você usa o ID do cliente e uma chave privada para criar um JWT assinado e construir uma solicitação de token de acesso no formato apropriado. Em seguida, o aplicativo envia a solicitação de token para o servidor de autorização do OAuth 2.0 do Google, que retorna um token de acesso. O aplicativo usa o token para acessar uma API do Google. Quando o token expira, o aplicativo repete o processo.

Para mais detalhes, consulte a documentação da conta de serviço.

Observação: embora seja possível usar contas de serviço em aplicativos executados em um domínio do Google Workspace, as contas de serviço não são membros da sua conta do Google Workspace e não estão sujeitas às políticas de domínio definidas pelos administradores do Google Workspace. Por exemplo, uma política definida no Google Workspace Admin Console para restringir a capacidade dos usuários finais do Google Workspace de compartilhar documentos fora do domínio não se aplicaria a contas de serviço.
Tamanho do token

Os tokens podem variar de tamanho, até os seguintes limites:

code
Códigos de autorização
256 bytes
contextual_token
Tokens de acesso
2048 bytes
restore_page
Tokens de atualização
512 bytes

Os tokens de acesso retornados pela API Security Token Service do Google Cloud são estruturados de maneira semelhante aos tokens de acesso do OAuth 2.0 da API do Google, mas têm limites de tamanho de token diferentes. Para mais detalhes, consulte a documentação da API.

O Google reserva o direito de alterar o tamanho do token dentro desses limites, e o aplicativo precisa oferecer suporte a tamanhos de token variáveis.

Validade do token de atualização

Você precisa escrever seu código para prever a possibilidade de um token de atualização concedido não funcionar mais. Um token de atualização pode parar de funcionar por um destes motivos:

shield_locked
O usuário revogou o acesso do seu app.
O token de atualização não foi usado por seis meses.
O usuário mudou as senhas e o token de atualização contém escopos do Gmail.
A conta de usuário excedeu o número máximo de tokens de atualização concedidos (ativos).
O usuário concedeu acesso por tempo limitado ao seu app, e o acesso expirou.
Se um administrador definir qualquer um dos serviços solicitados nos escopos do seu app como Restrito (o erro é admin_policy_enforced).
cloud_lock
Para APIs do Google Cloud Platform, o tempo de sessão definido pelo administrador pode ter sido excedido.

Um projeto do Google Cloud Platform com uma tela de permissão OAuth configurada para um tipo de usuário externo e um status de publicação de "Teste" recebe um token de atualização que expira em sete dias, a menos que os únicos escopos OAuth solicitados sejam um subconjunto de nome, endereço de e-mail e perfil do usuário (por meio dos escopos userinfo.email, userinfo.profile, openid ou equivalentes do OpenID Connect).

Atualmente, há um limite de 100 tokens de atualização por Conta do Google por ID do cliente OAuth 2.0. Se o limite for atingido, a criação de um novo token de atualização invalidará automaticamente o token de atualização mais antigo sem aviso prévio. Esse limite não se aplica a contas de serviço.

Há também um limite maior no número total de tokens de atualização que uma conta de usuário ou conta de serviço pode ter em todos os clientes. A maioria dos usuários normais não vai exceder esse limite, mas uma conta de desenvolvedor usada para testar uma implementação pode.

Se você precisar autorizar vários programas, máquinas ou dispositivos, uma solução alternativa é limitar o número de clientes que você autoriza por Conta do Google para 15 ou 20. Se você for um administrador do Google Workspace, poderá criar outros usuários com privilégios administrativos e usá-los para autorizar alguns dos clientes.

Como lidar com políticas de controle de sessão para organizações do Google Cloud Platform (GCP)

Os administradores de organizações do GCP podem exigir a reautenticação frequente dos usuários enquanto eles acessam recursos do GCP, usando o recurso de controle de sessão do Google Cloud. Essa política afeta o acesso ao Console do Google Cloud, ao SDK do Google Cloud (também conhecido como CLI gcloud ) e a qualquer aplicativo OAuth de terceiros que exija o escopo do Cloud Platform. Se um usuário tiver uma política de controle de sessão, quando a duração da sessão expirar, as chamadas de API vão gerar um erro semelhante ao que aconteceria se o token de atualização fosse revogado. A chamada vai falhar com um tipo de erro invalid_grant. O campo error_subtype pode ser usado para distinguir entre um token revogado e uma falha devido a uma política de controle de sessão (por exemplo, "error_subtype": "invalid_rapt"). Como as durações da sessão podem ser muito limitadas (entre 1 e 24 horas), esse cenário precisa ser tratado corretamente reiniciando uma sessão de autenticação.

Da mesma forma, não use nem incentive o uso de credenciais de usuário para implantação de servidor para servidor implantação. Se as credenciais do usuário forem implantadas em um servidor para jobs ou operações de longa duração e um cliente aplicar políticas de controle de sessão a esses usuários, o aplicativo do servidor vai falhar, porque não haverá como reautenticar o usuário quando a duração da sessão expirar.

Para mais informações sobre como ajudar seus clientes a implantar esse recurso, consulte este artigo de ajuda focado no administrador.

Bibliotecas de cliente

As bibliotecas de cliente a seguir são integradas a frameworks populares, o que simplifica a implementação do OAuth 2.0. Mais recursos serão adicionados às bibliotecas ao longo do tempo.

Biblioteca de autenticação do Google para Java
Biblioteca de cliente das APIs do Google para Python
Biblioteca de cliente das APIs do Google para Dart
Biblioteca de cliente das APIs do Google para Go
Biblioteca de cliente das APIs do Google para .NET
Biblioteca de cliente das APIs do Google para Ruby
Biblioteca de cliente das APIs do Google para PHP
Biblioteca de cliente das APIs do Google para JavaScript
GTMAppAuth: biblioteca de cliente OAuth para Mac e iOS
Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-05-26 UTC.