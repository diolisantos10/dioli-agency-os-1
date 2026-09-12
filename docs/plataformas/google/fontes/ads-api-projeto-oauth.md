---
titulo: "Google Ads API — projeto do Cloud e credenciais OAuth"
url: https://developers.google.com/google-ads/api/docs/get-started/oauth-cloud-project?hl=pt-br
capturado_em: 2026-09-12
hash: d4c86b601ada68df
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Participe da nossa transmissão ao vivo no Discord no servidor da comunidade de publicidade e medição do Google e no YouTube em 20 de agosto, às 11h (horário de Brasília). Vamos discutir os novos recursos adicionados à versão 25.1 da API Google Ads.
 O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Configurar um projeto do Console de APIs do Google

As etapas a serem seguidas para criar e configurar um projeto do Console de APIs do Google dependem do tipo de cenário de autorização OAuth 2.0 que você está criando no aplicativo. Escolha o cenário de autorização que você está criando. Este guia será personalizado com base na sua escolha.

Contas de serviço Autenticação do usuário

Você precisa de um projeto do Console de APIs do Google para criar credenciais OAuth 2.0 e ativar a API Google Ads para seu app.

As credenciais são necessárias para a autenticação e autorização de usuários do Google Ads pelos servidores do Google. Essas credenciais permitem gerar tokens OAuth para serem usados em chamadas para a API.

Selecionar ou criar um projeto do Console de APIs do Google
Observação: se você já tem um projeto do Console de APIs do Google e quer usá-lo para criar credenciais, pule para Ativar a API Google Ads no seu projeto. No entanto, verifique se o projeto do Console de APIs do Google também tem acesso à API.

Siga as instruções para criar um projeto. Ativar o faturamento para seu projeto é opcional. Se você tiver o faturamento ativado, selecione uma conta de faturamento para o novo projeto. Não há cobrança pelo uso da API Google Ads, mas há uma cota para o número total de projetos do Cloud.

Ativar a API Google Ads no seu projeto

Para ativar a API Google Ads no seu projeto, siga estas etapas:

Abra a biblioteca de APIs no Console de APIs do Google. Se solicitado, selecione seu projeto ou crie um novo. A biblioteca de APIs lista todas as APIs disponíveis agrupadas por família de produtos e popularidade.

Use a pesquisa para encontrar a API Google Ads se ela não estiver visível na lista.

Selecione a API Google Ads e clique no botão Ativar.

Ativar a API Google Ads

Solicitar acesso à API

Em seguida, acesse a página Visão geral da API Google Ads. A página mostra seu nível de acesso atual à API. Se o nível de acesso atual à API for Nível de acesso da conta de teste, expanda a seção Solicitar o próximo nível de acesso. Siga as instruções para solicitar o Nível de acesso do Explorer.

Depois de concluir a inscrição, o Google vai analisar e fazer upgrade para o acesso do Explorer na maioria dos casos.

Crie uma conta de serviço e uma chave
Observação: se você já estiver usando outra API do Google e tiver criado uma conta de serviço e uma chave OAuth 2.0, pule esta etapa e reutilize as credenciais atuais.

Comece criando uma conta de serviço e credenciais. Em seguida, crie credenciais para a conta de serviço. Faça o download da chave da conta de serviço no formato JSON e anote o ID e o e-mail da conta de serviço.

Anterior
Internos do OAuth 2.0
Avançar
Gerenciamento de credenciais
Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-09-12 UTC.