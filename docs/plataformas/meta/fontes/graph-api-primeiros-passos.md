---
titulo: "Graph API — primeiros passos (chamadas, Explorer, host)"
url: https://developers.facebook.com/docs/graph-api/get-started
capturado_em: 2026-09-08
hash: b29e9710d3753e28
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Entrada da pesquisa
​
Graph API
Visão geral
Introdução
Guia do Graph Explorer.
Solicitações em lote
Solicitações de depuração
Solução de erros
Field Expansion
Secure Requests
Registro de alterações
Reference
Introdução

Este guia explica como começar a receber dados do gráfico social do Facebook.

Antes de começar

Você precisará do seguinte:

Fazer o registro como desenvolvedor da Meta.
Ter um app da Meta para testes. Não é necessário usar o código do seu app para criá-lo.
Ter a ferramenta Explorador da Graph API aberta em uma janela do navegador separada.
Entender a estrutura do gráfico social da Meta com base no nosso guia Visão geral da Graph API.
Primeira solicitação
Etapa 1: abra a ferramenta Explorador da Graph API

Abra a ferramenta Explorador da Graph API em uma nova janela do navegador. Dessa forma, você poderá executar os exemplos enquanto lê o tutorial.

O explorador carrega uma consulta-padrão com o método GET, a versão mais recente da Graph API, o nó /me e os campos id e name no campo da string de consulta, além do seu app do Facebook.

Etapa 2: gere um token de acesso

Clique no botão Gerar token de acesso. A janela Entrar com o Facebook será exibida. O pop-up representa o pedido de permissão do app para usar seu nome e sua foto do perfil do Facebook.

Esse fluxo faz parte do produto Login do Facebook, que permite que uma pessoa entre em um app usando as credenciais do Facebook. Com o Login do Facebook, o app pode solicitar acesso aos dados da pessoa no Facebook. Esse acesso pode ser aceito ou recusado. Para que seja possível encontrar as pessoas no Facebook, os nomes e as fotos de perfil dos usuários ficam disponíveis publicamente. Por isso, nenhum outro requisito é necessário para executar essa solicitação.

Clique em Continuar como...

Essa ação cria o token de acesso do usuário. O token contém informações como o app solicitante, o usuário que recebe a solicitação, se o token de acesso ainda é válido (ele expira em cerca de uma hora), o horário de expiração e o escopo dos dados que o app pode solicitar. Nesta solicitação, o escopo é public_profile, que inclui o nome e a foto do perfil.

	
	

Clique no ícone de informações em formato de círculo ao lado do token de acesso para saber mais sobre o token.

Etapa 3: envie a solicitação

Clique no botão Enviar no canto superior direito.

O que você verá

Na janela de resposta, você verá uma resposta JSON com seu número de identificação do usuário do Facebook e seu nome.

Ao remover ?fields=id,name do campo da string de consulta e clicar em Enviar, você verá o mesmo resultado, já que name e id são os campos de nó do usuário retornados por padrão.

Segunda solicitação
Etapa 1: adicione um campo

Vamos deixar a primeira solicitação um pouco mais complexa ao adicionar outro campo, o email. Há duas maneiras de adicionar campos:

Clique no menu suspenso de pesquisa no visualizador de campos de nó à esquerda da janela de resposta.
Comece a digitar no campo da string de consulta.

Adicione o campo email e clique em Enviar.

O que você verá

Embora a chamada não tenha falhado, apenas os campos name e id serão retornados com uma mensagem de depuração. Clique no link (Mostrar) para depurar a solicitação.

A maioria dos nós e campos precisam de permissões específicas de acesso. A mensagem de depuração informa que é necessário conceder permissão ao app para acessar o endereço de email associado à sua conta do Facebook.

Etapa 2: adicione uma permissão

No lado direito do painel, abaixo de Permissões, clique no menu suspenso Adicionar permissão. Clique em Permissões de dados do usuário e selecione email.

Gere um novo token de acesso do usuário

Devido à alteração no escopo, é necessário criar um novo token de acesso. Clique em Gerar token de acesso. Assim como ocorreu na primeira solicitação, você precisa autorizar o acesso do app ao seu email no diálogo do Login do Facebook.

Depois de criar o novo token, clique em Enviar. Agora, todos os campos solicitados serão retornados.

	

Tente acessar suas publicações do Facebook.

Veja as etapas.

Links na resposta

Observe que os valores id retornados na janela de resposta são links. Esses links representam nós, como usuário, página ou publicação. Se você clicar em um link, o ID substituirá o conteúdo do campo de string da consulta. Depois disso, você poderá executar solicitações nesse nó. Como ele está conectado ao nó principal, que é a publicação de um usuário, talvez não seja necessário adicionar permissões. Clique na identificação da publicação, que será usada no próximo exemplo.

Observação: alguns IDs são uma combinação entre uma identificação principal e uma nova string de ID. Por exemplo, a publicação do usuário pode ter um ID semelhante a este: 1028223264288_102224043055529, em que 1028223264288 é o ID do usuário.

Informações sobre bordas

O nó do usuário não tem muitas bordas que retornam dados. O acesso aos objetos só pode ser concedido pelo usuário a quem eles pertencem. Na maioria das vezes, o usuário é o proprietário de um objeto criado por ele.

Quando você faz uma publicação, é possível ver informações sobre ela. Por exemplo, quando foi criada, texto, fotos, links compartilhados e o número de reações recebidas. Ao comentar na sua própria publicação, você terá acesso a esse comentário. No entanto, se outra pessoa comentar na publicação, não será possível ver o comentário nem quem o publicou.

Tente acessar o número de reações a uma publicação. Consulte a 

referência sobre reações de objetos.

Veja as etapas.

Obtenha o código da solicitação

Com o explorador, é possível testar as solicitações. Quando você tiver uma resposta bem-sucedida, obtenha o código para inseri-lo no seu app. Na parte inferior da janela de resposta, clique em Obter código. O explorador oferece códigos em Android, iOS, JavaScript, PHP e cURL. O código é pré-selecionado. Por isso, basta usar os comandos de copiar e colar.

Recomendamos a implementação do SDK do Facebook para seu app. Esse SDK incluirá o Login do Facebook, que permite que o app peça permissão e obtenha tokens de acesso.

Saiba mais

Use o Explorador da Graph API para testar solicitações para usuários, páginas, grupos e muito mais. Acesse as referências de cada nó ou borda para definir o tipo de token de acesso e permissão exigido.

Tokens de acesso
Login do Facebook
Documentação sobre SDKs do Facebook
	
Graph API Reference
Guia do Explorador da Graph API
Segurança no login
Referência de permissões
Nesta Página
Introdução
Antes de começar
Primeira solicitação
Etapa 1: abra a ferramenta Explorador da Graph API
Etapa 2: gere um token de acesso
Etapa 3: envie a solicitação
Segunda solicitação
Etapa 1: adicione um campo
Etapa 2: adicione uma permissão
Informações sobre bordas
Obtenha o código da solicitação
Saiba mais