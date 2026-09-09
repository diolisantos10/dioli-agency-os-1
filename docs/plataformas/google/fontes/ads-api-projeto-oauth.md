---
titulo: "Google Ads API — projeto do Cloud e credenciais OAuth"
url: https://developers.google.com/google-ads/api/docs/get-started/oauth-cloud-project?hl=pt-br
capturado_em: 2026-09-09
hash: e3da4a9d139a76c8
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Configurar um projeto do Console de APIs do Google

As etapas a serem seguidas para criar e configurar um projeto do Console de APIs do Google dependem do tipo de cenário de autorização OAuth 2.0 que você está criando no aplicativo. Escolha o cenário de autorização que você está criando. Este guia será personalizado com base na sua escolha.

Contas de serviço Autenticação do usuário

Você precisa de um projeto do Console de APIs do Google para criar credenciais OAuth 2.0 e ativar a API Google Ads para seu app.

As credenciais são necessárias para a autenticação e autorização de usuários do Google Ads pelos servidores do Google. Essas credenciais permitem gerar tokens OAuth para serem usados em chamadas para a API.

Embora seja possível usar um único token de desenvolvedor para vários projetos, cada projeto só pode usar um token de desenvolvedor.

Selecionar ou criar um projeto do Console de APIs do Google
Observação: se você já tem um projeto do Console de APIs do Google e quer usá-lo para criar credenciais, pule para Ativar a API Google Ads no seu projeto. No entanto, você não pode ter usado esse projeto para acesso à API Google Ads no passado com outro token de desenvolvedor.

Siga as instruções para criar um projeto. Ativar o faturamento para seu projeto é opcional. Se você tiver o faturamento ativado, selecione uma conta de faturamento para o novo projeto. Não há cobrança pelo uso da API Google Ads, mas há uma cota no número total de projetos do Cloud.

Ativar a API Google Ads no seu projeto

Para ativar a API Google Ads no seu projeto, siga estas etapas:

Abra a biblioteca de APIs no Console de APIs do Google. Se solicitado, selecione seu projeto ou crie um novo. A biblioteca de APIs lista todas as APIs disponíveis agrupadas por família de produtos e popularidade.

Use a pesquisa para encontrar a API Google Ads se ela não estiver visível na lista.

Selecione a API Google Ads e clique no botão Ativar.

Ativar a API Google Ads

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

Última atualização 2026-08-03 UTC.