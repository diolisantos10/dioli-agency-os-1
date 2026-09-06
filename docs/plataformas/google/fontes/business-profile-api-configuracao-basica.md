---
titulo: "Business Profile APIs — configuração básica (as 8 APIs a habilitar)"
url: https://developers.google.com/my-business/content/basic-setup?hl=pt-br
capturado_em: 2026-09-06
hash: 5148195cb158d5a5
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Configuração básica
Nesta página
Ativar as APIs
Ativar uma API
Solicitar um ID do cliente do OAuth 2.0
Conhecer os fundamentos do REST
REST nas APIs do Perfil da empresa
Conhecer os fundamentos do JSON
Use o OAuth Playground para fazer uma solicitação HTTP simples
Bibliotecas de cliente

Para continuar, verifique se você seguiu as instruções em Pré-requisitos e se o projeto foi aprovado para acessar as APIs do Perfil da Empresa.

Ativar as APIs
Observação: a API Google My Business só fica visível no Console de APIs do Google para usuários que enviam e recebem aprovação para a própria Conta do Google pelo formulário de pedido de acesso. Para mais detalhes, consulte Solicitar acesso às APIs.

Existem oito APIs associadas ao Perfil da Empresa que precisam ser ativadas no Console de APIs do Google:

API Google My Business
API My Business Account Management
API My Business Lodging
API My Business Place Actions
API My Business Notifications
API My Business Verifications
API My Business Business Information
API My Business Q&A
Ativar uma API

Se você concluiu todos os pré-requisitos e recebeu acesso à API, mas não conseguiu usar o atalho fornecido, é possível ativar a API manualmente com as etapas a seguir.

Para ativar uma API no seu projeto, faça o seguinte:

Abra a biblioteca de APIs no Console de APIs do Google. Se solicitado, selecione um projeto ou crie um novo. A biblioteca de APIs lista todas as APIs disponíveis agrupadas por família de produtos e popularidade.
Se a API que você quer ativar não estiver visível na lista, use a pesquisa para encontrá-la.
Selecione aquela que você quer habilitar e clique no botão Ativar.
Se solicitado, ative o faturamento.
Aceite os Termos de Serviço da API, se for o caso.

Se você é usuário do Google Workspace, confirme se o Perfil da Empresa no Google está ativado na conta da sua organização no Workspace. Você vai receber a mensagem "Erro 403: PERMISSÃO NEGADA" ao usar as APIs do GBP se o Perfil da Empresa estiver desativado nessa conta.

Solicitar um ID do cliente do OAuth 2.0

Como seu app acessa dados protegidos e não públicos, é necessário ter um ID do cliente do OAuth 2.0. Isso permite que seu app peça autorização para acessar os dados de local da sua organização em nome dos usuários do aplicativo.

Seu app precisa enviar um token do OAuth 2.0 com todas as solicitações de APIs do Perfil da Empresa que acessem dados privados do usuário.

Se você ainda não tiver feito isso, acesse a seção "Credenciais" do Console de APIs do Google e clique em Criar credenciais > ID do cliente OAuth para gerá-las no OAuth 2.0. Depois, você verá seu ID de cliente na página Credenciais. Clique nele para ver detalhes, como a chave secreta do cliente, URIs de redirecionamento, endereço de origem JavaScript e endereço de e-mail.

Conhecer os fundamentos do REST

Há duas maneiras invocar as APIs:

Enviar uma solicitação HTTP e analisar as respostas
Usar as bibliotecas de cliente

Se você decidir não usar bibliotecas de cliente, precisará entender os princípios básicos da REST

REST é um estilo de arquitetura de software que fornece uma abordagem simples e consistente para solicitar e modificar dados.

O termo REST significa "Representational State Transfer" (Transferência Representacional de Estado). No contexto das APIs do Google, ele se refere ao uso de verbos HTTP para recuperar e modificar representações de dados armazenados pelo Google.

Em um sistema RESTful, os recursos ficam em um armazenamento de dados. Um cliente envia uma solicitação para o servidor realizar uma ação específica, como criar, recuperar, atualizar ou excluir um recurso, e o servidor executa a ação e envia uma resposta. Essa resposta geralmente está na forma de uma representação do recurso especificado.

Nas APIs RESTful do Google, o cliente especifica uma ação com um verbo HTTP, como GET, POST, PUT ou DELETE. O cliente especifica um recurso por um identificador uniforme de recurso (URI, na sigla em inglês) globalmente exclusivo no seguinte formato:

https://apiName.googleapis.com/apiVersion/resourcePath?parameters

Como todos os recursos da API têm URIs exclusivos acessíveis por HTTP, a REST permite o armazenamento em cache dos dados e é otimizada para funcionar na infraestrutura distribuída da Web.

As definições de método, encontradas na documentação de padrões do HTTP 1.1, podem ser úteis. Elas incluem especificações para GET, POST, PUT e DELETE.

REST nas APIs do Perfil da empresa

As operações das APIs do Perfil da Empresa são mapeadas diretamente para os verbos HTTP REST.

O formato específico das APIs do Perfil da empresa é mostrado no seguinte URI:

https://apiName.googleapis.com/apiVersion/resourcePath?parameters

O conjunto completo de URIs usados em cada operação compatível nas APIs aparece na documentação de referência das APIs do Perfil da Empresa.

Os caminhos dos recursos variam de acordo com o endpoint.

Por exemplo, o caminho do recurso para uma conta aparece como neste exemplo:

accounts/accountId

O caminho para um local aparece no seguinte formato:

locations/locationId

Conhecer os fundamentos do JSON

As APIs do Perfil da empresa retornam dados no formato JSON.

O JavaScript Object Notation (JSON) é um formato de dados comum e independente de linguagem que oferece uma representação de texto simples de estruturas de dados arbitrárias. Para mais informações, acesse json.org (em inglês).

Use o OAuth Playground para fazer uma solicitação HTTP simples

Use o OAuth 2.0 Playground para testar as APIs Business Profile. Como elas não são públicas, você precisa seguir algumas etapas adicionais para usá-las no Playground. É necessário ter um ID do cliente para um aplicativo da Web.

Acesse o Console de APIs do Google e abra seu projeto. Se você não tiver um ID do cliente OAuth para aplicativos da Web, crie um agora:
Na lista suspensa Criar credenciais, selecione ID do cliente OAuth.
Em Tipo de aplicativo, clique em Aplicativo da Web.

Adicione o seguinte como um URI de redirecionamento válido:

 https://developers.google.com/oauthplayground
 
Clique em Criar.
Copie o ID do cliente para a área de transferência.
Acesse o OAuth 2.0 Playground.
Clique no ícone de engrenagem para abrir as opções de configuração e faça o seguinte:
Defina o OAuth Flow como Client-side.
Selecione Use your own OAuth credentials.
Cole seu ID do cliente OAuth.
Feche as opções de configuração.

Em "Step 1 - Select & authorize APIs" (Etapa 1: selecionar e autorizar APIs), cole o seguinte escopo para as APIs do Perfil da Empresa no campo Input your own scopes (Inserir seus próprios escopos).

https://www.googleapis.com/auth/business.manage

Clique em Authorize APIs.
Clique em Accept quando solicitado.

Em "Step 2 - Configure request to API", cole o seguinte URI no campo Request URI:

https://mybusinessaccountmanagement.googleapis.com/v1/accounts

Clique em Send the request. A resposta vai mostrar o status 200 OK.

Para mais informações sobre como fazer vários tipos de solicitação, consulte a Referência das APIs do Perfil da empresa.

Observação: não há ambiente de sandbox para as APIs do Perfil da Empresa. Em algumas chamadas, é possível usar um parâmetro de consulta validateOnly que, quando definido como true, valida uma solicitação sem mudanças.
Observação: o OAuth 2.0 Playground adiciona automaticamente cabeçalhos de depuração. Se você usar um cliente diferente e quiser ver mensagens de erro detalhadas na resposta, adicione o seguinte cabeçalho à solicitação: X-GOOG-API-FORMAT-VERSION: 2
Bibliotecas de cliente

As bibliotecas de cliente das APIs do Perfil da Empresa são compatíveis com a funcionalidade dessas APIs. Elas oferecem recursos comuns para todas as APIs do Google, como transporte HTTP, tratamento de erros, autenticação e análise em JSON.

Para fazer o download de bibliotecas de cliente, consulte Bibliotecas.

Isso foi útil?

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2025-08-29 UTC.