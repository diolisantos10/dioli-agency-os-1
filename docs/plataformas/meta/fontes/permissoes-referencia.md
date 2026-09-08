---
titulo: "Permissions Reference — todas as permissões da Graph API e o nível exigido"
url: https://developers.facebook.com/docs/permissions
capturado_em: 2026-09-08
hash: 3208ec8ddddfe041
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Entrada da pesquisa
​
Desenvolvimento de apps com a Meta
Inscrição
Referência de recursos
Permissions Reference
Criar um app
Use Case Customization
Painel de Apps
Criar e testar
Lançamento
Transferir a propriedade
Como manter o acesso a dados
Termos e políticas
Suporte
Trust Center
Permissions Reference for Meta Technologies APIs

As permissões são uma forma de autorização granular da Graph API concedida pelo usuário do app. Para que o seu app possa usar um ponto de extremidade de API e acessar os dados de um usuário, primeiro é preciso que o usuário conceda todas as permissões exigidas pelo ponto de extremidade.

Selecione apenas as permissões necessárias para o funcionamento desejado do app. A seleção de permissões desnecessárias é um motivo comum de rejeição durante a análise do app.

As permissões também podem ser usadas para solicitar insights de análise a fim de melhorar o app. Além disso, elas podem ser usadas para fins de marketing ou de publicidade, por meio do uso de informações agregadas, anônimas ou sem identificação (desde que não seja possível identificar esses dados novamente).

Requisitos
Análise do App da Meta: para apps que precisam de acesso a dados que não são seus ou que você não gerencia
Verificação da empresa: é necessária para todos os apps que solicitam Advanced Access
Caso o app solicite permissão para usar um ponto de extremidade e acessar os dados de um usuário, talvez seja necessário responder às perguntas sobre o tratamento de dados.
Também pode ser necessário fazer um Checkup de Uso de Dados anual.
Maneiras de pedir permissão

Ao entrar no seu app, os usuários recebem uma solicitação para conceder as permissões de que o app precisa. Os usuários do app poderão conceder ou negar as permissões solicitadas ou qualquer subconjunto delas.

Login do Facebook
Login do Facebook para Empresas
API do Instagram com Login do Facebook para Empresas
API do Instagram com Login do Instagram para Empresas
Gerenciador de Negócios da Meta

Se o app não usar uma permissão por 90 dias (o que normalmente ocorre devido à inatividade do usuário), o usuário precisará concedê-la novamente.

Remover uma permissão

Você pode usar o Painel de Apps da Meta para remover uma permissão que o app não usa mais ou que está obsoleta.

A
Permission
	
Description and allowed usage
	
What to include in App Review submission

ads_management

Dependencies
pages_read_engagement
pages_show_list
	Com a permissão ads_management, seu aplicativo pode ler e gerenciar a conta de anúncios que possui ou à qual teve ou que tenha recebido acesso pelo proprietário da conta de anúncios. Essa permissão pode ser usada para criar campanhas de forma programática, gerenciar anúncios ou buscar métricas de anúncio para ajudar nos negócios. Além disso, também pode ser usada para criar ferramentas de gerenciamento que forneçam soluções inovadoras e valores diferenciados para os anunciantes.

Programar a criação de campanhas, o gerenciamento de anúncios e a busca por métricas.
Criar ferramentas de gerenciamento de anúncios que forneçam soluções inovadoras e valor diferenciado para os anunciantes.
	Forneça exemplos específicos do porquê seu app precisa gerenciar anúncios em nome de outras empresas.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como uma empresa pode acessar dados de desempenho de anúncios na plataforma do app depois de conceder a permissão.
Mostre que os dados de desempenho dos anúncios (como impressões, conversões, gastos, cliques e alcance) são exibidos na plataforma do app.

ads_mcp_management

Dependencies
None
	The ads_mcp_management permission allows your app to access the Meta ads Model Context Protocol (MCP) server and enable AI agents to interact with Meta Ads on behalf of advertisers. The allowed usage for this permission is to interact with the Meta ads MCP server to create and manage campaigns, retrieve performance insights and reports, and manage business assets like catalog, ad accounts, and pixels. Essa permissão pode ser usada para criar campanhas de forma programática, gerenciar anúncios ou buscar métricas de anúncio para ajudar nos negócios. Além disso, também pode ser usada para criar ferramentas de gerenciamento que forneçam soluções inovadoras e valores diferenciados para os anunciantes.

Uso permitido
Use ads MCP to create, edit, and manage ad campaigns.
Use ads MCP to retrieve performance insights and reporting data.
Use ads MCP to create and manage product catalogs and other business assets.
	
Descrição do caso de uso
Provide specific examples of why your app requires access to Meta's ads MCP server to manage campaigns and business assets on behalf of other businesses.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstrate connecting the ads MCP server to an MCP client to discover available tools.
Use the MCP client to perform at least one read operation, such as retrieving campaigns or performance insights, from an ad account.
Use the MCP client to perform at least one write operation, such as creating or editing a campaign or product catalog.

ads_read

Dependencies
None
	Com a permissão ads_read, seu aplicativo pode acessar a API de Informações de Anúncios a fim de extrair informações de relatórios de anúncios de contas de anúncios que você possui ou para as quais tenha recebido acesso pelo proprietário ou proprietários de outras contas de anúncios por meio dessa permissão. Essas permissões também concedem ao seu aplicativo acesso à API do lado do servidor para que os anunciantes possam enviar eventos da web dos seus respectivos servidores diretamente para o Facebook.

Fornecer à API acesso aos dados de desempenho de seu anúncio para utilização em análises de dados e painéis personalizados.
Enviar eventos da web do seu servidor diretamente para o Facebook.
	Forneça exemplos específicos do porquê seu app precisa acessar anúncios e estatísticas relacionadas em nome de outras empresas.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como uma empresa pode acessar dados de desempenho de anúncios na plataforma do app depois de conceder a permissão.
Mostre que os dados de desempenho dos anúncios (como impressões, conversões, gastos, cliques e alcance) são exibidos na plataforma do app.

attribution_read

Dependencies
None
	Com a permissão attribution_read, seu aplicativo pode acessar a API de Atribuição para extrair dados do relatório de atribuição das linhas de negócios que você possui ou às quais tenha recebido acesso pelo proprietário ou proprietários de outras linhas de negócios.

Permite que o seu aplicativo acesse dados de desempenho dos anúncios da Atribuição para uso em análises de dados e painéis personalizados.
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

B
Permission
	
Description and allowed usage
	
What to include in App Review submission

business_management

Dependencies
pages_read_engagement
pages_show_list
	Com a permissão business_management, seu aplicativo pode ler e escrever com a API do Gerenciador de Negócios. The allowed usage for this permission is to manage business assets such as an ad account and to claim ad accounts.

Gerenciar ativos comerciais, como uma conta de anúncios.
Reivindicar contas de anúncios.
	
Descrição do caso de uso

Provide specific examples of why your app requires managing business assets on behalf of other businesses. If the permission is requested as a dependency of another main permission, including pages_messaging or pages_show_list, please specify the main permission in the use case description.

Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como uma empresa pode acessar dados de desempenho de anúncios na plataforma do app depois de conceder a permissão.
Mostre que os dados de desempenho dos anúncios (como impressões, conversões, gastos, cliques e alcance) são exibidos na plataforma do app.
C
Permission
	
Description and allowed usage
	
What to include in App Review submission

catalog_management

Dependencies
business_management
	Com a permissão catalog_management, seu aplicativo pode criar, ler, atualizar e excluir catálogos de produtos da empresa dos quais o usuário é administrador. The allowed usage for this permission is to build commerce-related solutions for ecommerce platforms, travel platforms and dynamic ads. It can also be used to build inventory type management solutions like product inventory, hotel inventory or car inventory.
Criar soluções relacionadas ao comércio, como plataformas de comércio eletrônico, plataformas de viagem e anúncios dinâmicos.
Criar soluções de gerenciamento de tipo de inventário, como inventário de produtos, de hotel ou de automóveis.
	Forneça exemplos específicos do porquê seu app precisa gerenciar catálogos de produtos de empresas cujo acesso é concedido a você.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como o usuário do app cria, atualiza e exclui um catálogo de produtos na plataforma do app.

commerce_account_manage_orders

	Com a permissão commerce_account manage_orders, seu aplicativo pode ler e atualizar os pedidos da conta de comércio.
Ler e atualizar os pedidos na sua conta de comércio.
Os provedores de tecnologia gerenciam pedidos em nome dos seus clientes.
Acessar as notificações de webhook.
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

commerce_account_read_orders

	Com a permissão commerce_account_read_orders, seu aplicativo pode ler os pedidos da conta de comércio.
Ler os pedidos na sua conta de comércio.
Usar o endereço de email do comprador para fins de publicidade somente se um comprador tiver consentido com o recebimento de emails de marketing na finalização da compra.
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

commerce_account_read_reports

	Com a permissão commerce_account_read_reports, seu aplicativo pode ler os dados de relatórios financeiros para gerar relatórios personalizados de impostos, de reembolso e de reconciliação para sua conta de comércio.
Ler os dados de relatórios financeiros na sua conta de comércio para gerar relatórios personalizados de reembolso, assim como de reconciliação de impostos e caixa.
Os provedores de tecnologia podem gerar relatórios financeiros em nome dos clientes deles.
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

commerce_account_read_settings

	Com a permissão commerce_account_read_settings, seu aplicativo pode ler as configurações da conta de comércio.
Ler dados básicos da conta de comércio, como canais conectados, opções de envio, localizações de atendimento e empresas conectadas, entre outros.
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

commerce_manage_accounts

	Com a permissão commerce_manage_accounts, seu aplicativo pode criar e gerenciar contas de comércio, como um aplicativo de comércio eletrônico.
Associar seu aplicativo à sua conta de comércio.
Os provedores de tecnologia criam uma conta de comércio em nome dos respectivos clientes.
Os provedores de tecnologia ativam um novo canal de vendas dentro da conta de comércio dos respectivos clientes.
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

E
Permission
	
Description and allowed usage
	
What to include in App Review submission

email

	A permissão email possibilita que o aplicativo leia o endereço de email principal de uma pessoa.
Allowed Usage
Comunicar-se com as pessoas e permitir que elas entrem no seu aplicativo com o endereço de email associado ao perfil do Facebook delas.
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

F
Permission
	
Description and allowed usage
	
What to include in App Review submission

facebook_branded_content_ads_brand

Dependencies
pages_read_engagement
pages_show_list
	The facebook_branded_content_ads_brand allows an app to read Facebook posts where the app user's Facebook profile is tagged as a paid partner, and an app user to read, request, and revoke permissions to run Partnership Ads. The allowed usage of this functionality is to enable a business to read Facebook posts where the account is tagged as a paid partner and manage permissions to run Partnership Ads without needing a pre-existing post.
Uso permitido
Allow a business to read Facebook posts where the account is tagged as a paid partner
Manage permissions to run Partnership Ads without needing a pre-existing post
	
Descrição do caso de uso

Provide specific examples of why your app requires access to manage Facebook branded content ad campaigns and access data related to branded content ads on behalf of other businesses.

Screencast Requirements
Demonstrate the complete Facebook Login for Business process on your app platform, showing how your app user grants your app this permission.
Demonstrate how your app user selects a branded content post and promotes the post as an ad on your app platform.

facebook_creator_marketplace_discovery

Dependencies
pages_show_list
	Com a permissão facebook_creator_marketplace_discovery, um app pode descobrir criadores de conteúdo na plataforma Descoberta de Criadores do Facebook. O uso permitido dessa permissão é para empresas do Facebook acessarem dados de insights de criadores do Facebook qualificados, a fim de descobri-los e avaliá-los para campanhas de marca, além de dar crédito e pagar aos criadores de conteúdo pela presença deles no Facebook.
Uso permitido
Acessar dados de insights de criadores do Facebook qualificados, a fim de descobri-los e avaliá-los para campanhas de marca
Para dar crédito e pagar aos criadores de conteúdo pela presença deles no Facebook
	
Descrição do caso de uso

Forneça exemplos específicos de por que seu app requer o gerenciamento da descoberta de criadores do Facebook em nome de outras empresas.

Screencast Requirements
Demonstre o processo de login completo no Facebook na plataforma do seu app, mostrando como o usuário do seu app concede a ele essa permissão.
Demonstre como procurar Criadores na plataforma Descoberta de Criadores do Facebook e destaque como acessar insights sobre os Criadores como bio do criador, contagem de seguidores e alcance da conta.
Demonstre como você pretende usar os dados dos insights que você obteve de acordo com os propósitos permitidos e mostrando conformidade com todos os usos aplicáveis e as políticas de privacidade.
G
Permission
	
Description and allowed usage
	
What to include in App Review submission

gaming_user_locale

Dependencies
gaming_profile
	A permissão gaming_user_locale permite que seu aplicativo obtenha o idioma preferido de um usuário enquanto o usuário joga no Facebook (por exemplo, Jogos Instantâneos ou Jogos em nuvem). The allowed usage for this permission is to display a game interface in the user's preferred language.

Exiba uma interface de jogo no idioma preferido do usuário.
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

I
Permission
	
Description and allowed usage
	
What to include in App Review submission

instagram_basic

Dependencies
pages_read_user_content
pages_show_list
	Com a permissão instagram_basic, seu aplicativo pode ler conteúdo de mídia e informações do perfil de uma conta do Instagram. The allowed usage for this permission is to get basic metadata of an Instagram Business account profile, for example username and ID.
Obter metadados básicos de um perfil da conta do Instagram para Empresas, por exemplo, nome de usuário e identificação.
	Inclua quais informações de perfil da conta profissional do Instagram são exigidas pelo seu caso de uso. Descreva onde essas informações podem ser encontradas na sua solução.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app e seleciona a conta do Instagram.

instagram_branded_content_ads_brand

Dependencies
instagram_basic
pages_read_engagement
pages_show_list

	A permissão instagram_branded_content_ads_brand possibilita que um app leia as publicações do Instagram em que a conta do Instagram do usuário do app foi marcada como parceiro pago e possibilita que um usuário do app leia, solicite e revogue permissões para veicular anúncios em parceria. The allowed usage of this functionality is to enable a business to read Instagram posts where the account is tagged as a paid partner and manage permissions to run Partnership Ads without needing a pre-existing post.
Ler publicações do Instagram nas quais a conta foi marcada como parceiro pago
Gerenciar permissões para veicular anúncios em parceria sem a necessidade de uma publicação pré-existente
	Forneça exemplos específicos do porquê seu app precisa da permissão `instagram_branded_content_ads_brand` para gerenciar campanhas de anúncios com conteúdo de marca no Instagram e acessar dados relacionados em nome de outras empresas.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como o usuário do app seleciona um post de conteúdo de marca e o promove como um anúncio na plataforma do app.

instagram_branded_content_brand

Dependencies
instagram_basic
pages_read_engagement
pages_show_list

	Com a permissão instagram_branded_content_brand, seu aplicativo pode adicionar, remover e visualizar nomes da lista de criadores de conteúdo aprovados de uma marca específica. The allowed usage for this permission is to manage a specific brand’s Instagram creator content settings.
Gerencie as configurações de criadores de conteúdo da marca na conta de uma empresa no Instagram.
	Forneça exemplos específicos do porquê seu app precisa da permissão `instagram_branded_content_brand` para gerenciar campanhas de anúncios de conteúdo de marca no Instagram e acessar dados relacionados em nome de outras empresas.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como o usuário do seu app adiciona, remove e visualiza criadores de conteúdo da lista de criadores de conteúdo aprovados de uma marca na plataforma do app.

instagram_branded_content_creator

Dependencies
instagram_basic
pages_read_engagement
pages_show_list

	A permissão instagram_branded_content_creator possibilita que seu aplicativo leia e altere o status do turbinamento de determinado conteúdo. The allowed usage for this permission is to manage Instagram creator content settings.
Ler publicações do Instagram nas quais a conta foi marcada como parceiro pago
Gerenciar permissões para veicular anúncios em parceria sem a necessidade de uma publicação pré-existente
	Forneça exemplos específicos do porquê seu app precisa da permissão `instagram_branded_content_ads_brand` para gerenciar campanhas de anúncios com conteúdo de marca no Instagram e acessar dados relacionados em nome de outras empresas.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como o usuário do app seleciona um post de conteúdo de marca e o promove como um anúncio na plataforma do app.

instagram_business_basic

Dependencies
Nenhum
	Com a permissão instagram_business_basic, seu app pode ler conteúdo de mídia e informações do perfil de uma conta do Instagram para Empresas. O uso dessa permissão é concedido para obter metadados básicos do perfil de uma conta do Instagram para Empresas. Por exemplo, nome de usuário e identificação.
Obter metadados básicos do perfil de uma conta do Instagram para Empresas
	Forneça exemplos específicos do porquê seu app precisa da permissão `instagram_business_basic` para acessar metadados básicos dos perfis de contas empresariais do Instagram em nome de outras empresas.
Screencast Requirements
Demonstre o processo completo de login do Instagram na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre o acesso aos metadados básicos (como o nome de usuário e a identificação) de um perfil da conta comercial do Instagram na plataforma do app.

instagram_business_content_publish

Dependencies
instagram_business_basic

	The instagram_business_content_publish permission allows an app to create organic feed photo and video posts on behalf of a business user. The allowed usage of this permission is to allow an app to manage the organic content creation process for Instagram (for example, post photos and videos) on behalf of an Instagram business account.
Uso permitido
Manage the organic content creation process for Instagram (for example, post photos and videos) on behalf of an Instagram business account
	Forneça exemplos específicos do porquê seu app precisa da permissão `instagram_business_content_publish` para criar e publicar posts de vídeo ou foto orgânicos em nome de outras empresas.
Screencast Requirements
Demonstre o processo completo de login do Instagram na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como criar um post orgânico com foto no feed em nome de um usuário comercial.
Mostre como adicionar uma legenda, hashtags e outros metadados e postar no feed do Instagram do usuário comercial.

instagram_business_manage_comments

Dependencies
instagram_business_basic

	The instagram_business_content_publish permission allows an app to create organic feed photo and video posts on behalf of a business user. The allowed usage of this permission is to allow an app to manage the organic content creation process for Instagram (for example, post photos and videos) on behalf of an Instagram business account.
Uso permitido
Manage the organic content creation process for Instagram (for example, post photos and videos) on behalf of an Instagram business account
	Forneça exemplos específicos do porquê seu app precisa da permissão `instagram_business_manage_comments` para gerenciar comentários no Instagram em nome de outras empresas.
Screencast Requirements
Demonstre o processo completo de login do Instagram na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como criar um comentário, atualizar um comentário existente e excluir um comentário.
Mostre como isso aparece tanto no seu app quanto no app nativo do Instagram.

instagram_business_manage_messages

Dependencies
instagram_business_basic

	A permissão instagram_business_manage_messages possibilita que um app acesse as mensagens em uma conta profissional do Instagram. O uso permitido dessa autorização permite visualizar mensagens, gerenciá-las e responder a elas, além de usar ferramentas de CRM (gestão do relacionamento com o cliente) de terceiros para o seu gerenciamento.
Ver mensagens, gerenciá-las e responder a elas
Use ferramentas de CRM (gestão do relacionamento com o cliente) de terceiros para gerenciar suas mensagens.
	Explique a funcionalidade de mensagens que seu app oferece aos clientes empresariais que estão integrados à plataforma e descreva como eles executam essas funções.
Screencast Requirements
Demonstre o processo completo de login do Instagram na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre seu app enviando uma mensagem a um usuário do Instagram e a caixa de entrada do Instagram do cliente (seja na web ou no app para celular) recebendo e exibindo a mensagem enviada.
Demonstre como gerar uma solicitação de cURL que você possa integrar à plataforma do app para enviar uma mensagem. Para isso, você pode usar o Auxiliar de Integração da API no Painel de Apps da Meta > Instagram.

instagram_creator_marketplace_discovery

Dependencies

business_management
instagram_basic
pages_manage_metadata
pages_show_list
	Com a permissão instagram_creator_marketplace_discovery, seu app pode descobrir criadores de conteúdo no marketplace de criadores de conteúdo do Instagram e acessar informações como bio do criador, contagem de seguidores e alcance da conta de empresas no Instagram integradas à plataforma. O uso permitido dessa permissão é para empresas do Instagram integradas ao marketplace de criadores de conteúdo recuperarem dados de insights de criadores do Instagram qualificados, como bio do criador, contagem de seguidores e alcance da conta.
Uso permitido
Retrieve insights data for eligible Instagram creators, like creator bio, follower count, and account reach.
	
Descrição do caso de uso

Forneça exemplos específicos de por que seu app requer o gerenciamento de instagram_creator_marketplace_discovery em nome de outras empresas.

Screencast Requirements
Demonstre o processo completo de login no Facebook na plataforma do seu app, mostrando como o usuário do seu app concede a ele essa permissão.
Demonstre como procurar Criadores no Marketplace de Criadores do Instagram e destaque como acessar insights sobre os Criadores como bio do criador, contagem de seguidores e alcance da conta.

instagram_creator_marketplace_messaging

Dependencies

instagram_basic
pages_read_user_content
pages_show_list
	Com a permissão instagram_creator_marketplace_messaging, o app pode obter as conversas de parceria de uma marca e a identificação de mensagens de um criador de conteúdo usada para mensagens de parceria. O uso permitido dessa permissão é que as marcas no marketplace de criadores de conteúdo do Instagram enviem mensagens de parceria paga aos criadores de conteúdo.
Uso permitido
Permite que marcas no marketplace de criadores de conteúdo do Instagram enviem mensagens de parceria paga aos criadores.
	
Descrição do caso de uso

Forneça exemplos específicos do porquê seu app precisa gerenciar mensagens do marketplace de criadores de conteúdo do Instagram em nome de outras empresas.

Screencast Requirements
Demonstre o processo completo de login do Facebook para Empresas na plataforma do seu app, mostrando como o usuário do seu app concede a ele essa permissão.
Demonstre como recuperar mensagens e conversas de parceria.

instagram_content_publish

Dependencies
instagram_basic
pages_read_engagement
pages_show_list
	Com a permissão instagram_content_publish, seu aplicativo pode criar publicações de foto e vídeo de feed orgânico em nome de um usuário comercial. The allowed usage for this permission is to manage your Instagram organic content creation process, for example post photos or videos to a main feed, on behalf of a business.
Gerenciamento do processo de criação de conteúdo orgânico do Instagram (por exemplo, publicar fotos e vídeos no feed principal) em nome de uma empresa.
	Forneça exemplos específicos do porquê seu app precisa da permissão `instagram_content_publish` para criar e publicar posts de vídeo ou foto orgânicos no Instagram em nome de outras empresas.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como criar um post com foto e publicá-lo no feed do Instagram do usuário comercial.

instagram_manage_comments

Dependencies
instagram_basic
pages_read_engagement
pages_show_list
	Com a permissão instagram_manage_comments, seu aplicativo pode criar, excluir e ocultar comentários em nome da conta do Instagram vinculada a uma página. Seu aplicativo também pode ler e responder a mídias públicas e comentários em que uma empresa tenha sido mencionada ou marcada em uma foto. The allowed usage for this permission is to read, update and delete comments of Instagram Business Accounts.
Ler, atualizar e excluir comentários de contas do Instagram para Empresas.
Ler objetos de mídia, como stories, de contas do Instagram para Empresas.
	Forneça exemplos específicos do porquê seu app precisa da permissão `instagram_content_publish` para criar e publicar posts de vídeo ou foto orgânicos no Instagram em nome de outras empresas.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como criar um post com foto e publicá-lo no feed do Instagram do usuário comercial.

instagram_manage_contents

Dependencies
instagram_basic

	Com a permissão instagram_manage_contents, seu app pode excluir posts em nome de uma conta do Instagram vinculada a uma Página do Facebook. O uso permitido para essa permissão é possibilitar que um usuário do app exclua um post, story ou reel do Instagram.
Uso permitido
Excluir um post, story ou reel do Instagram.
	
Descrição do caso de uso

Forneça exemplos específicos de por que seu app requer a permissão instagram_manage_contents para excluir a mídia do Instagram de um usuário do app.

Screencast Requirements
Demonstre o processo completo de login do Facebook para Empresas na plataforma do seu app, mostrando como uma empresa concede ao seu app a permissão `instagram_manage_contents`.
Demonstre como excluir mídias do feed do Instagram de um usuário empresarial.

instagram_manage_engagement

Dependencies

instagram_basic
pages_read_user_content
pages_show_list
	Com a permissão instagram_manage_engagement, o app pode publicar ou excluir uma "Curtida" em objetos de mídia, feed ou reels do Instagram, bem como em objetos de comentário ou resposta, em nome de uma conta do Instagram vinculada a uma Página do Facebook. Seu uso permitido é possibilitar que um usuário do app publique ou exclua uma "Curtida" em objetos de mídia, feed ou reels do Instagram, bem como em objetos de comentário ou resposta.
Uso permitido
Publique ou exclua uma "Curtida" em objetos de mídia, feed ou reels do Instagram
Publique ou exclua uma "Curtida" em objetos de comentário, comentário ou resposta do Instagram
	
Descrição do caso de uso

Forneça exemplos específicos do motivo pelo qual seu app precisa da permissão instagram_manage_engagement para publicar ou excluir a "Curtida" de um usuário do app em objetos de mídia do Instagram (Feed, Reels) e objetos de comentário do Instagram (Comentário, Resposta).

Screencast Requirements
Demonstre o processo completo de login do Facebook para Empresas na plataforma do seu app, mostrando como uma empresa concede ao seu app a permissão instagram_manage_engagement.
Demonstre como publicar ou excluir uma mídia de "curtida" do Instagram do feed do usuário comercial.
Demonstre como publicar ou excluir uma "Curtida" em objetos de comentário do Instagram.

instagram_manage_events

Dependencies
instagram_basic
pages_read_engagement
pages_show_list
	The instagram_manage_events permission allows an app permission to log events (e.g., purchase, add-to-cart, leads) on behalf of Instagram accounts administered by the app’s users. The allowed usage for this permission is to log events on Instagram accounts and send this activity data to Meta for ads targeting, optimization and reporting; and to provide marketing and advertising analytics insights.
Uso permitido
Log events on Instagram accounts and send this activity data to Meta for ads targeting, optimization and reporting
Provide marketing and advertising analytics insights
	Forneça exemplos específicos do porquê seu app precisa da permissão `instagram_manage_upcoming_events` para gerenciar eventos futuros no Instagram em nome de outras empresas.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como recuperar a lista de eventos futuros e visualizar detalhes dos eventos.
Crie um evento e demonstre como adicionar detalhes (como título, data, hora e localização).

instagram_manage_insights

Dependencies
instagram_basic
pages_read_engagement
pages_show_list
	Com a permissão instagram_manage_insights, seu aplicativo pode obter acesso a informações da conta do Instagram vinculada a uma Página do Facebook. Seu aplicativo também pode descobrir e ler as informações de perfil e a mídia de outros perfis comerciais. The allowed usage for this permission is to get metadata, data insights and story insights of an Instagram Business account.
Obter metadados de uma conta do Instagram para Empresas.
Obter informações de dados de uma conta do Instagram para Empresas.
Obter informações de story de uma conta do Instagram para Empresas.
	Forneça exemplos específicos do porquê seu app precisa da permissão `instagram_manage_insights` para oferecer insights sobre o desempenho no Instagram em nome de outras empresas.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como acessar insights sobre metadados, publicações, fotos e vídeos da conta profissional do usuário do app no Instagram.
Demonstre como acessar insights sobre metadados e mídia do perfil público de uma conta profissional do Instagram em nome da conta profissional do Instagram do usuário do app.

instagram_manage_messages

Dependencies
instagram_basic
pages_read_engagement
pages_show_list
	Com a permissão instagram_manage_messages, os usuários comerciais podem ler e responder mensagens do Instagram Direct. The allowed usage for this permission is for businesses to retrieve threads and messages from its Instagram Direct inbox, manage messages with their customers or to use third-party customer relationship management (CRM) tools to manage its Instagram Direct inbox.
Empresas que desejam recuperar conversas e mensagens de suas caixas de entrada do Direct.
Empresas que desejam gerenciar mensagens com seus clientes.
Empresas que desejam usar ferramentas de CRM (gestão do relacionamento com o cliente) de terceiros para gerenciar suas caixas de entrada do Instagram Direct.
	Explique a funcionalidade de mensagens que seu app oferece aos clientes empresariais que estão integrados à plataforma e descreva como eles executam essas funções.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre seu app enviando uma mensagem a um usuário do Instagram e a caixa de entrada do Instagram do cliente (seja na web ou no app para celular) recebendo e exibindo a mensagem enviada.
Gere uma solicitação de cURL que você possa integrar à plataforma do app para enviar uma mensagem. Para isso, você pode usar o Auxiliar de Integração da API no Painel de Apps da Meta > Instagram.
Certifique-se de compartilhar uma gravação da mensagem sendo enviada do app para o usuário, em vez de capturas de tela das mensagens recebidas na caixa de entrada do Instagram do cliente.

instagram_shopping_tag_products

Dependencies
instagram_basic
pages_read_engagement
pages_show_list
	Com a permissão instagram_shopping_tag_products, um aplicativo pode marcar mídias do Instagram com etiquetas de produto e fazer uma apelação contra rejeições de produtos. The allowed usage for this functionality is to check eligibility for product tagging, get catalogs and products, tag media with product tags, manage existing product tags and appeal product rejections.
Verificar a qualificação para marcação de produtos
Obter catálogos e produtos
Marcar mídia com etiquetas de produto
Gerenciar marcações de produtos existentes
Fazer uma apelação de rejeição de produtos
	Forneça exemplos específicos do porquê seu app precisa da permissão `instagram_shopping_tag_products` para marcar etiquetas de produto em mídias do Instagram e gerenciar o catálogo de produtos em nome de outras empresas.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como recuperar a lista de catálogos e produtos disponíveis e selecionar um deles.
Marque uma etiqueta de produto em um item de mídia

instagram_manage_upcoming_events

Dependencies
instagram_basic
pages_read_engagement
pages_show_list
	The instagram_manage_upcoming_events permission allows an app to read, create, and update upcoming events on behalf of Instagram accounts administered by people using the app. The allowed usage for this permission is to manage upcoming events on Instagram accounts administered by the people using the app.
Uso permitido
Manage upcoming events on Instagram accounts administered by the people using the app
	Forneça exemplos específicos do porquê seu app precisa da permissão `instagram_manage_upcoming_events` para gerenciar eventos futuros no Instagram em nome de outras empresas.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como recuperar a lista de eventos futuros e visualizar detalhes dos eventos.
Crie um evento e demonstre como adicionar detalhes (como título, data, hora e localização).
L
Permission
	
Description and allowed usage
	
What to include in App Review submission

leads_retrieval

Dependencies
Ads Management Standard Access
ads_management
ads_read
business_management
pages_manage_ads
pages_read_engagement
pages_show_list
	Com a permissão leads_retrieval, seu aplicativo pode recuperar e ler todas as informações capturadas por um formulário de anúncio de cadastro associado a um anúncio criado no Gerenciador de Anúncios ou na API de Marketing. The allowed usage for this permission is to contact people who completed your lead ad form requesting more information. This permission can also be used by advertiser authorized CRM platforms to pull the lead data on behalf of the advertisers.
Contatar as pessoas que preencheram seu formulário de anúncio de cadastro solicitando mais informações. Por exemplo, uma concessionária entra em contato com um cliente em potencial (cadastro) que respondeu ao anúncio dela com cotações para um carro.
Para plataformas de CRM autorizadas pelos anunciantes extraírem dados de cadastros em nome dos anunciantes. Esses anunciantes podem usar as informações do cadastro para entrar em contato com o usuário.
	Forneça exemplos específicos do porquê seu app precisa acessar leads das Páginas cujo acesso é concedido a você.
Screencast Requirements

Consulte a documentação App Review para saber mais.

M
Permission
	
Description and allowed usage
	
What to include in App Review submission

manage_app_solutions

	The manage_app_solution permission allows an app to get a list of apps that a user can manage, and make API calls on behalf of those apps. O uso autorizado para essa permissão possibilita que uma empresa crie e gerencie soluções de parceiros entre Provedores de Tecnologia e Parceiros de Solução.
Permitir que uma empresa crie e gerencie soluções de parceiros entre Provedores de Tecnologia e Parceiros de Solução
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

manage_fundraisers

	The manage_fundraisers permission allows an app to create, update, and read a fundraiser and its donations on behalf of a user.
Ajude os criadores de campanha de arrecadação de fundos a aumentar o alcance no Facebook.
Sincronize o valor arrecadado exibido no site da campanha e na campanha vinculada do Facebook.
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

marketing_messages_messenger

Dependencies

ads_management
pages_messaging
	Com a permissão marketing_messages_messenger, um app pode criar, gerenciar e enviar mensagens de marketing pagas no Messenger e ver o desempenho das campanhas dessas mensagens de marketing em nome do usuário do app usando as Contas de anúncios autorizadas dele. O uso permitido para essa permissão é possibilitar que um usuário do app envie mensagens de marketing pagas no Messenger a pessoas que optaram por receber avisos e mensagens promocionais de determinadas Páginas do Facebook gerenciadas pelo usuário do app.
Uso permitido
Enviar mensagens de marketing pagas no Messenger a pessoas que optaram por receber avisos e mensagens promocionais.
	
Descrição do caso de uso

Provide specific examples of why your app requires the marketing_messages_messenger permission to access Marketing Messages endpoints on Messenger

Screencast Requirements
Demonstrate the complete Facebook Login for Business process on your app platform, showing how your app user grants your app this permission.
Demonstrate how your app user selects the Pages and Ad Accounts on your app platform; and
The process of agreeing to the Marketing Messages Beta ToS for those assets.
Demonstrate the ability to create and send marketing messages messenger.
P
Permission
	
Description and allowed usage
	
What to include in App Review submission

pages_events

Dependencies
pages_show_list
	Com a permissão page_events, seu aplicativo registra eventos em nome de Páginas do Facebook administradas por pessoas que usam o seu aplicativo e envia esses eventos ao Facebook para direcionamento de anúncios, otimização e relatórios. The allowed usage for this permission is to send businesses related activities (for example purchase, add-to-cart, lead) on behalf of Pages owned by the people who use your app.
Enviar atividades relacionadas a negócios (por exemplo, compra, adicionar ao carrinho, cadastro) em nome das Páginas dos usuários do seu aplicativo.
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

pages_manage_ads

Dependencies
pages_show_list
	Com a permissão pages_manage_ads, seu aplicativo pode gerenciar anúncios associados à Página. O uso permitido para essa permissão é criar e gerenciar para a Página anúncios ou anúncios de clique para uma superfície de mensagens da empresa (como Messenger, Instagram Direct ou WhatsApp) associada à Página.
Uso permitido
Criar anúncios para sua Página
Gerenciar anúncios para sua Página
Criar e gerenciar anúncios de clique para uma superfície de mensagens da empresa
	
Descrição do caso de uso
Provide specific examples of why your app requires creating and managing ads on behalf of other businesses for their pages.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como o usuário do app cria um anúncio para a Página do Facebook dele na plataforma do app.
Mostre que os anúncios foram criados na Página.

pages_manage_cta

	Com a permissão pages_manage_cta, seu aplicativo pode executar as funções POST e DELETE nos pontos de extremidade usados para gerenciar botões de chamada para ação (CTA) em uma Página do Facebook.
Fornecer acesso à API para gerenciar botões de chamada para ação (CTA) nas Páginas que você gerencia.
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

pages_manage_instant_articles

Dependencies
pages_show_list
	Com a permissão pages_manage_instant_articles, seu aplicativo pode gerenciar Instant Articles em nome de Páginas do Facebook administradas por pessoas que usam o seu aplicativo. The allowed usage for this permission is to create and update Instant Articles for Pages owned by the people who use your app.
Criar e atualizar Instant Articles para as Páginas dos usuários do aplicativo.
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

pages_manage_engagement

Dependencies
pages_read_user_content
pages_show_list
	Com a permissão pages_manage_engagement, seu aplicativo pode criar, editar e excluir comentários publicados na Página. The allowed usage for this permission is to help manage and moderate content on the Page.
Publicar um comentário em uma publicação da Página.
Atualizar seu comentário em uma publicação da Página.
Excluir um comentário de uma publicação da Página.
Curtir uma publicação da Página ou remover a curtida.
	Forneça exemplos específicos do porquê seu app precisa gerenciar comentários em nome de outros usuários em Páginas que são de propriedade deles.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como o usuário do app publica um comentário na Página do Facebook dele na plataforma do app.
Mostre o comentário recém-publicado na página do usuário do app.

pages_manage_metadata

Dependencies
pages_show_list
	Com a permissão pages_manage_metadata, seu aplicativo pode inscrever e receber webhooks sobre atividade na Página, bem como atualizar configurações nela. The allowed usage for this permission is to help a Page Admin administer and manage a Page.
Inscrever-se para receber webhooks da Página.
Atualizar configurações da Página.
	Forneça exemplos específicos do porquê seu app precisa gerenciar contas, configurações ou webhooks de uma Página em nome do respectivo usuário proprietário.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como o usuário do app assina o recebimento de webhooks ou atualiza as configurações da Página do Facebook na plataforma do app.

pages_manage_posts

Dependencies
pages_read_engagement
pages_show_list
	Com a permissão pages_manage_posts, seu aplicativo pode criar, editar e excluir publicações na sua Página. The allowed usage for this permission is to create and delete content on a Page.
Fazer uma publicação, compartilhar uma foto ou um vídeo na sua Página.
Atualizar uma publicação, foto ou vídeo na sua Página.
Excluir uma publicação, foto ou vídeo na sua Página.
	Forneça exemplos específicos do porquê seu app precisa criar ou gerenciar posts em nome de outros usuários em Páginas que são de propriedade deles.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como o usuário do app cria, edita e exclui um post da Página do Facebook dele na plataforma do app.
Mostre o post recém-atualizado na página dele.

pages_messaging

Dependencies
pages_manage_metadata
pages_show_list
	Com a permissão pages_messaging, seu aplicativo pode gerenciar e acessar conversas da Página no Messenger. O uso permitido para essa permissão é criar experiências interativas iniciadas pelo usuário, enviar mensagens de solicitação de suporte ou confirmar reservas ou compras e pedidos.
Criar experiências interativas iniciadas por um usuário.
Confirmar interações do cliente, como compras, pedidos e reservas.
Enviar mensagens de solicitação de suporte.
	
Descrição do caso de uso
Provide specific examples of why your app requires creating and managing ads on behalf of other businesses for their pages.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre uma das seguintes opções:
Demonstre o recebimento de ligações de clientes ou a realização de ligações para clientes.
Demonstre seu app enviando uma mensagem a um usuário do Messenger e a caixa de entrada do Messenger do cliente (seja na web ou no app para celular) recebendo e exibindo a mensagem enviada.
Gere uma solicitação de cURL que você possa integrar à plataforma do app para enviar uma mensagem. Você pode usar o Auxiliar de Integração da API no Painel de Apps da Meta > Messenger para fazer isso.
Certifique-se de compartilhar uma gravação da mensagem sendo enviada do app para o usuário, em vez de capturas de tela das mensagens recebidas no Messenger do cliente.

pages_read_engagement

Dependencies
pages_show_list
	Com a permissão pages_read_engagement, seu aplicativo pode ler conteúdo (publicações, fotos, vídeos e eventos) publicados pela Página, ler dados de seguidores (incluindo nome e PSID) e foto do perfil, bem como ler metadados e outras informações sobre a Página. The allowed usage for this permission is to help a Page Admin administer and manage a Page.
Obter conteúdo publicado por sua Página.
Obter nomes, PSIDs e fotos de perfil dos seguidores da sua Página.
Obter metadados sobre sua Página.
	Forneça exemplos específicos do porquê seu app precisa ler conteúdo postado em nome de outros usuários em Páginas que são de propriedade deles.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como o usuário do app acessa o conteúdo de um post na Página do Facebook dele na plataforma do app.
Mostre que o conteúdo do post é exibido na plataforma do app.

pages_read_user_content

Dependencies
pages_show_list
	Com a permissão pages_read_user_content, seu aplicativo lê o conteúdo gerado pelo usuário na Página, como publicações, comentários e classificações dos usuários ou de outras Páginas, bem como exclui comentários do usuário nas publicações da Página. The allowed usage for this permission is to read user's and other Page’s content posted on the Page if you need it to help manage the Page.
Obter conteúdo gerado por usuários na sua Página.
Obter publicações nas quais sua Página está marcada.
Excluir comentários publicados por usuários na sua Página.
	Forneça exemplos específicos do porquê seu app precisa ler conteúdo gerado pelo usuário em nome de outros usuários em Páginas que são de propriedade deles.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como o usuário do app lê um comentário gerado pelo usuário na Página do Facebook dele na plataforma do app.
Mostre que o comentário gerado pelo usuário é exibido na plataforma do app.

pages_show_list

Dependencies
Nenhum
	Com a permissão pages_show_list, o aplicativo pode acessar a lista de Páginas que uma pessoa gerencia. The allowed usage for this permission is to show a person the list of Pages they manage and verify that a person manages a Page.
Mostra a uma pessoa a lista de Páginas que ela gerencia.
Confirma se uma pessoa gerencia uma Página.
	Forneça exemplos específicos do porquê seu app precisa acessar a lista de páginas que são de propriedade de um usuário. Caso a permissão `pages_show_list` seja solicitada como dependência de uma permissão principal, especifique a permissão principal na descrição do caso de uso.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Mostre que as páginas de propriedade do usuário foram conectadas à plataforma do app.

pages_user_gender

	Com a permissão pages_user_gender, seu aplicativo acessa o gênero de um usuário por meio da Página à qual o aplicativo está conectado.
Personalizar experiências ou recomendações conforme o gênero.
Usar idioma com conceito de gênero, como pronomes e títulos corretos.
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

pages_user_locale

	Com a permissão pages_user_locale, seu app acessa o idioma de um usuário por meio da Página à qual o app está conectado.
Personalizar experiências com base no idioma de uma pessoa mostrando conteúdo específico ao idioma.
Enviar respostas no idioma preferido da pessoa.
Exibir números, horas e datas corretamente no idioma da pessoa.
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

pages_user_timezone

	Com a permissão pages_user_timezone, seu aplicativo pode acessar o fuso horário de um usuário por meio da Página à qual o aplicativo está conectado.
Evitar que mensagens sejam enviadas em um horário inconveniente.
Enviar conteúdo sensível ou notícias recorrentes em um horário específico.
Fornecer conteúdo personalizado com base no horário.
Enviar saudações apropriadas ao horário.
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

pages_utility_messaging

	A permissão pages_utility_messages possibilita que um app acesse os modelos de mensagens utilitárias de uma Página. O uso permitido dessa autorização é voltado para o gerenciamento dos modelos de mensagens utilitárias de uma Página e para o envio dessas mensagens pelo Messenger.
Gerenciar os modelos de mensagens utilitárias de uma Página
Enviar mensagens utilitárias de uma Página pelo Messenger
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

paid_marketing_messages	The paid_marketing_messages permission allows an app to create, manage, and send paid marketing messages on Messenger and to view the performance of these marketing messages campaigns on behalf of the app user. The allowed usage for this permission is to allow an app user, such as a business, to send paid marketing messages on Messenger to people who have chosen to receive announcements and promotional messages from the app user.
Uso permitido
Send paid marketing messages on Messenger to people who have chosen to receive announcements and promotional messages
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

public_profile

Dependencies
Nenhum
	A permissão public_profile possibilita que um app leia os Campos de Perfil Público Padrão no nó do Usuário. Essa permissão é concedida automaticamente a todos os apps. The allowed usage for this permission is to authenticate app users and provide them with a personalized in-app experience.
Autenticar os usuários do aplicativo e fornecer a eles uma experiência personalizada no aplicativo.
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

publish_video

Dependencies
Nenhum
	Com a permissão publish_video, seu aplicativo pode publicar vídeos ao vivo na linha do tempo, no grupo, no evento ou na Página de um usuário dele. The allowed usage for this permission is to live-video stream to an app user's timeline, event or Page.
Concede permissão a um aplicativo para transmitir stream de vídeo na linha do tempo, no grupo, no evento ou na Página de um usuário desse aplicativo.
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

R
Permission
	
Description and allowed usage
	
What to include in App Review submission

read_audience_network_insights

Dependencies
None
	The read_audience_network_insights permission allows an app to access the Audience Network insights data and pull performance report information for properties you own. The allowed usage for this permission is to integrate Audience Network properties performance data into app owner’s data analytics and dashboards.
Uso permitido
Integrate Audience Network properties performance data into app owner’s data analytics and dashboards
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

read_insights

Dependencies
pages_read_engagement
pages_show_list
	Com a permissão read_insights, seu aplicativo poder ler os dados sobre informações de Páginas, aplicativos e domínios da web que pertencem à pessoa.
Allowed Usage
Integrar em suas próprias ferramentas de análise as informações sobre o aplicativo, a página ou o domínio do Facebook.
	
Descrição do caso de uso
Forneça exemplos específicos do porquê seu app precisa acessar insights sobre a Página em nome de usuários do app em Páginas que são de propriedade deles.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre como o usuário do app recupera as métricas de insights da Página do Facebook dele na plataforma do app.
Mostre que as métricas de insights são exibidas na plataforma do app.
T
Permission
	
Description and allowed usage
	
What to include in App Review submission

threads_basic

	The threads_basic permission allows an app to get a user's Threads profile information and the media and text content that they posted to Threads. The allowed usage for this permission is to display a user’s own Threads posts within a business app, and make these visible only to the user who created them.
Uso permitido
Display a user’s own Threads posts within an app, and make these visible only to the user who created them for the purpose of managing the user's presence on Threads.
	Forneça exemplos específicos do porquê seu app precisa da permissão `threads_basic` para acessar as informações do perfil, as mídias e o conteúdo de texto postado de um usuário do Threads.
Screencast Requirements
Demonstre o processo completo de login do OAuth do Threads na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre o fluxo completo de vincular uma conta do Threads no seu app e mostre quais permissões são solicitadas do usuário.
Recupere uma lista das publicações do usuário no Threads e demonstre como ver detalhes do post como texto, imagens e vídeos.

threads_business_basic

	The threads_business_basic permission allows a business app to fetch the Threads account ID that is associated with an Instagram account within the Business Portfolio through matching username. The allowed usage for this permission is to retrieve a Threads account ID to use as the threads_user_id during the creation of ads on Threads. It is not intended for any other purpose. For example, using threads_business_basic permission in a consumer app is strictly prohibited. A permissão também pode ser usada para solicitar insights de análise a fim de melhorar o app. Além disso, ela pode ser usada para fins de marketing ou de publicidade, por meio do uso de informações agregadas, anônimas ou sem identificação (desde que não seja possível identificar esses dados novamente).
Uso permitido
Retrieve a Threads account ID to use as the threads_user_id during the creation of ads on Threads, for the purpose of managing the user's presence on Threads.
	Forneça exemplos específicos do porquê seu app precisa da permissão `threads_business_basic` para recuperar `threads_user_id` durante a criação de anúncios no Threads.
Screencast Requirements
Demonstre o processo completo de login do Facebook na plataforma do app, mostrando como o usuário concede essa permissão ao app e seleciona a conta do Instagram conectada à conta do Threads.
Demonstre como o usuário do app cria um anúncio para ser exibido no Threads na plataforma do app.

threads_content_publish

Dependencies
threads_basic
	The threads_content_publish permission allows a business app to create and publish content on behalf of a Threads profile. The allowed usage for this permission is to enable a business app user to create and publish content to their Threads profile. A permissão também pode ser usada para solicitar insights de análise a fim de melhorar o app. Além disso, ela pode ser usada para fins de marketing ou de publicidade, por meio do uso de informações agregadas, anônimas ou sem identificação (desde que não seja possível identificar esses dados novamente).
Uso permitido
Enables an app user to create and publish content to their Threads profile, for the purpose of managing the user's presence on Threads.
	Forneça exemplos específicos do porquê seu app precisa da permissão `threads_content_publish` para permitir que os usuários criem e publiquem conteúdo no próprio perfil do Threads.
Screencast Requirements
Demonstre o processo completo de login do OAuth do Threads na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre o fluxo completo de vincular uma conta do Threads no seu app e mostre quais permissões são solicitadas do usuário.
Crie um post e demonstre como adicionar texto, imagens ou vídeos.
Publique o post no perfil do Threads e demonstre como ver o conteúdo publicado.
Mostre o resultado da criação do post no seu app e no app nativo do Threads.

threads_delete

Dependencies
threads_basic
	The threads_delete permission allows an app to delete an app user's Threads posts. The allowed usage for this permission is to delete an app user's Thread posts. A permissão também pode ser usada para solicitar insights de análise a fim de melhorar o app. Além disso, ela pode ser usada para fins de marketing ou de publicidade, por meio do uso de informações agregadas, anônimas ou sem identificação (desde que não seja possível identificar esses dados novamente).
Uso permitido
Delete an app user's Thread posts.
	Forneça exemplos específicos do porquê seu app precisa da permissão `threads_delete` para excluir posts de um usuário do app no Threads.
Screencast Requirements
Demonstre o processo completo de login do OAuth do Threads na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre o fluxo completo de vincular uma conta do Threads no seu app e mostre quais permissões são solicitadas do usuário.
Selecione um post e demonstre como excluí-lo.
Confirme que o post foi excluído.
Mostre o resultado da criação do post no seu app e no app nativo do Threads.

threads_keyword_search

Dependencies
threads_basic
	The threads_keyword_search permission allows an app to search and fetch content with a specific keyword on behalf of a Threads user. The permission also allows for publishing responses to this fetched content. The allowed usage for this permission is to help the user manage their social media presence. A permissão também pode ser usada para solicitar insights de análise a fim de melhorar o app. Além disso, ela pode ser usada para fins de marketing ou de publicidade, por meio do uso de informações agregadas, anônimas ou sem identificação (desde que não seja possível identificar esses dados novamente).
Uso permitido
Showing public content and the public content tree that a user searches using a specific keyword.
Giving the user the ability to sort user’s own mentioned threads.
Giving the user the ability to publish responses to public content that the user searches for.
	Forneça exemplos específicos do porquê seu app precisa da permissão `threads_keyword_search` para gerenciar sua presença nas redes sociais ao pesquisar e recuperar conteúdo com palavras-chave específicas no Threads.
Screencast Requirements
Demonstre o processo completo de login do OAuth do Threads na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre o fluxo completo de vincular uma conta do Threads no seu app e mostre quais permissões são solicitadas do usuário.
Insira uma palavra-chave e demonstre como procurar conteúdo publicado relacionado a ela.
Mostre o resultado da criação do post no seu app e no app nativo do Threads.

threads_location_tagging

Dependencies
threads_basic
	The threads_location_tagging permission allows an app to search for and fetch public locations using specific queries/keywords or coordinates on behalf of a Threads user and publish media with a location tagged. The allowed usage for this permission is to help users tag public locations to their posts and request locations when media is retrieved. A permissão também pode ser usada para solicitar insights de análise a fim de melhorar o app. Além disso, ela pode ser usada para fins de marketing ou de publicidade, por meio do uso de informações agregadas, anônimas ou sem identificação (desde que não seja possível identificar esses dados novamente).
Uso permitido
Helps users tag public locations to their posts and request locations when media is retrieved.
	Forneça exemplos específicos do porquê seu app precisa da permissão `threads_location_tagging` para permitir que os usuários leiam informações de localização ou publiquem um post com informações de localização.
Screencast Requirements
Demonstre o processo completo de login do OAuth do Threads na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre o fluxo completo de vincular uma conta do Threads no seu app e mostre quais permissões são solicitadas do usuário.
Demonstre o uso das informações de localização.
Mostre como ler informações de localização ou publicar um post com informações de localização.

threads_manage_insights

Dependencies
threads_basic
	Com a permissão threads_manage_insights, seu app pode obter acesso a insights de um perfil do Threads. Seu app pode obter insights de um perfil do Threads e de threads individuais publicadas por esse perfil. A permissão também pode ser usada para solicitar insights de análise a fim de melhorar o app. Além disso, ela pode ser usada para fins de marketing ou de publicidade, por meio do uso de informações agregadas, anônimas ou sem identificação (desde que não seja possível identificar esses dados novamente).
Obter insights de um perfil do Threads
Obter insights de threads individuais publicadas por esse perfil
	Forneça exemplos específicos do porquê seu app precisa da permissão `threads_manage_insights` para acompanhar sua performance no Threads ao fornecer insights do perfil e métricas individuais do Threads.
Screencast Requirements
Demonstre o processo completo de login do OAuth do Threads na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre o fluxo completo de vincular uma conta do Threads no seu app e mostre quais permissões são solicitadas do usuário.
Recupere dados de insights sobre um perfil no Threads e demonstre como ver métricas no nível do perfil (como seguidores, engajamento e alcance).
Recupere dados de insights sobre uma thread específica e demonstre como ver métricas no nível da thread (como curtidas, comentários e compartilhamentos).

threads_manage_mentions

Dependencies
threads_basic
	The threads_manage_mentions permission allows an app to fetch content where the user is mentioned in on behalf of a Threads user. The allowed usage for this permission is to help the user manage their social media presence, which includes: showing public content and the public content tree that a user is mentioned in, enabling the user to sort user’s own mentioned threads, and enabling the user to publish responses to the public content tree that the user is mentioned in. A permissão também pode ser usada para solicitar insights de análise a fim de melhorar o app. Além disso, ela pode ser usada para fins de marketing ou de publicidade, por meio do uso de informações agregadas, anônimas ou sem identificação (desde que não seja possível identificar esses dados novamente).
Uso permitido
Showing public content and the public content tree that a user is mentioned in.
Giving the user the ability to sort user’s own mentioned threads.
Giving the user the ability to publish responses to public content that a user is mentioned in.
	
Descrição do caso de uso

Provide specific examples of why your app requires the threads_manage_insights permission to track your performance on Threads by providing insights into your profile and individual Threads metrics.

Screencast Requirements
Demonstre o processo completo de login do OAuth do Threads na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre o fluxo completo de vincular uma conta do Threads no seu app e mostre quais permissões são solicitadas do usuário.
Recupere conteúdo público em que o usuário é mencionado e demonstre como ver a árvore de conteúdo.

threads_manage_replies

Dependencies
threads_basic
	Com a permissão threads_manage_replies, o app pode criar uma resposta em nome de um perfil do Threads, ocultar ou exibir respostas a uma thread e controlar quem pode responder a uma thread no perfil do Threads. O app pode criar uma resposta em nome de um perfil do Threads, ocultar ou exibir respostas a uma thread e controlar quem pode responder a uma thread no perfil do Threads. A permissão também pode ser usada para solicitar insights de análise a fim de melhorar o app. Além disso, ela pode ser usada para fins de marketing ou de publicidade, por meio do uso de informações agregadas, anônimas ou sem identificação (desde que não seja possível identificar esses dados novamente).
Criar uma resposta em nome de um perfil do Threads
Ocultar ou exibir respostas a uma thread
Controlar quem pode responder a uma thread no perfil do Threads
	
Descrição do caso de uso

Forneça exemplos específicos do porquê seu app precisa da permissão threads_manage_replies para possibilitar que os usuários gerenciem a própria presença no Threads ao responderem em nome do perfil deles, ocultarem/mostrarem respostas a threads e controlarem quem pode responder threads.

Screencast Requirements
Demonstre o processo completo de login do OAuth do Threads na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre o fluxo completo de vincular uma conta do Threads no seu app e mostre quais permissões são solicitadas do usuário.
Demonstre uma destas opções: a criação de uma resposta em nome de um perfil do Threads.
Crie uma resposta e demonstre como adicionar texto, imagens e outras mídias.
Demonstre como ocultar/mostrar respostas a uma thread.
Oculte uma resposta e mostre como reexibi-la.
Demonstre como controlar quem pode responder a uma thread no perfil do Threads.
Defina o controle de respostas como "Todos" e demonstre como alterá-lo para "Pessoas que você está seguindo".

threads_profile_discovery

Dependencies
threads_basic

	The threads_profile_discovery permission allows an app to access profiles for public Threads accounts and public posts of these accounts. The allowed usage for this permission is to allow the app's users to find profiles of public Threads accounts and public posts of these accounts to conduct competitor analyses.
Uso permitido
Allow the app's users to find profiles of public Threads accounts and public posts of these accounts to conduct competitor analyses.
	
Descrição do caso de uso

Forneça exemplos específicos justificando por que seu app requer que a permissão threads_profile_discovery habilite o acesso dos usuários aos perfis para contas públicas do Threads e os posts públicos dessas contas.

Screencast Requirements
Demonstrate the complete Threads OAuth login process on your app platform, showing how your app user grants your app this permission.
Demonstrate the full flow of linking a Threads account within your application and show what permissions are being requested from the user.
Search for a Public Threads Profile and/or demonstrate how to search for public posts on that profile.

threads_read_replies

Dependencies
threads_basic
	Com a permissão threads_read_replies, o app pode ler as respostas a uma thread do usuário. Com essa permissão, é possível obter respostas a uma thread pertencente ao usuário do app. A permissão também pode ser usada para solicitar insights de análise a fim de melhorar o app. Além disso, ela pode ser usada para fins de marketing ou de publicidade, por meio do uso de informações agregadas, anônimas ou sem identificação (desde que não seja possível identificar esses dados novamente).
Obter respostas a uma thread pertencente ao usuário do app
	
Descrição do caso de uso

Forneça exemplos específicos do porquê seu app precisa da permissão threads_read_replies para permitir que os usuários vejam respostas às próprias threads no Threads.

Screencast Requirements
Demonstre o processo completo de login do OAuth do Threads na plataforma do app, mostrando como o usuário concede essa permissão ao app.
Demonstre o fluxo completo de vincular uma conta do Threads no seu app e mostre quais permissões são solicitadas do usuário.
Recupere respostas a uma thread e demonstre como ver mídias e texto de resposta.

threads_share_to_instagram

Dependencies
None
	The threads_share_to_instagram permission allows your app to post your app user's Threads post to their linked Instagram account on behalf of the user. The allowed usage for this permission is to enable a user to post their Threads content to their linked Instagram account, either as a one-time action or automatically for future posts.
Uso permitido
Post your app user's Threads content to their linked Instagram account
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

U
Permission	Description

user_age_range

	Com a permissão user_age_range, seu aplicativo pode acessar a faixa etária da pessoa conforme publicado no perfil dela no Facebook.
O aplicativo deve ter classificação etária por exigência legal.
O aplicativo inclui conteúdo inadequado para a base geral de usuários do Facebook, como conteúdo de encontros, adulto ou violento.

user_birthday

	Com a permissão user_brithday, seu aplicativo pode ler o aniversário de uma pessoa conforme publicado no perfil dela no Facebook.
Fornecer às pessoas conteúdo compatível com a respectiva idade quando a faixa etária não for suficiente.

user_friends

	Com a permissão user_friends, seu aplicativo pode obter uma lista dos amigos de uma pessoa usando esse aplicativo.
Fornecer conteúdo relacionado ao Facebook para personalizar a experiência de uma pessoa.

user_gender

	Com a permissão user_gender, seu aplicativo pode ler o gênero de uma pessoa conforme publicado no perfil dela no Facebook.
Para dar pronomes.
Personalizar a experiência de uma pessoa conforme o gênero. Por exemplo, aplicativos de encontros, compras e moda.

user_hometown

	Com a permissão user_hometown, seu aplicativo pode ler a cidade natal de uma pessoa conforme publicada no perfil dela no Facebook.
Fornecer uma experiência personalizada com base no local em que uma pessoa viveu ou cresceu.

user_likes

	Com a permissão user_likes, seu aplicativo pode ler uma lista de todas as Páginas do Facebook que um usuário já curtiu.
Forneça uma experiência personalizada ao relacionar conteúdos com as curtidas das pessoas. Isso inclui selecionar conteúdo em escala para personalizar aplicativos com grande quantidade de conteúdo e permitir que as pessoas compartilhem as próprias curtidas com outros usuários, como no caso de aplicativos de encontros e de música.
Permita o uso de aplicativos de monitoramento e controles de acesso dos pais para analisar curtidas dos usuários a fim de detectar problemas relacionados à segurança e ao bem-estar de pessoas menores de 18 anos. Esse recurso se destina ao uso exclusivo de pais, mães ou responsáveis de dependentes menores de 18 anos e está limitado à análise das redes sociais de menores, conforme apresentado na interface do usuário do aplicativo.

user_link

	Com a permissão user_link, seu aplicativo pode acessar a URL de perfil do Facebook da pessoa que está usando o aplicativo.
Fornecer a uma pessoa que usa seu aplicativo uma maneira de visitar o perfil de outra pessoa no Facebook.

user_location

	Com a permissão user_location, seu aplicativo pode ler o nome da cidade, conforme exibido no campo de localização do perfil de uma pessoa no Facebook.
Fornecer uma experiência personalizada com base no nome da cidade, conforme exibido no campo de localização do perfil de uma pessoa no Facebook.

user_messenger_contact

	The user_messenger_contact permission allows a business to contact a person via Messenger upon their approval or initiation of a chat thread with the business's Page.
Uso permitido
For a Page to send a person an initial message, post-purchase updates and account updates.

user_photos

	Com a permissão user_photos, seu aplicativo pode ler as fotos de uma pessoa carregadas no Facebook.
Criar livros ou álbuns físicos ou digitais das fotos de uma pessoa, o que inclui permitir que as pessoas exportem fotos para impressão.
Fornecer às pessoas a capacidade de exibir fotos com outros usuários do aplicativo. Por exemplo, em aplicativos sociais ou de encontros.
Fornecer às pessoas a capacidade de editar ou criar novo conteúdo fotográfico com base em fotos existentes.

user_posts

	Com a permissão user_posts, seu aplicativo pode acessar as publicações que um usuário fez na própria linha do tempo.
Permita que as pessoas criem livros ou álbuns (físicos ou digitais) da linha do tempo e compartilhem lembranças da linha do tempo no Facebook ou em outros aplicativos sociais.
Permita o uso de aplicativos de monitoramento e controles de acesso dos pais para analisar o conteúdo de uma publicação a fim de detectar problemas relacionados à segurança e ao bem-estar de pessoas menores de 18 anos. Esse recurso se destina ao uso exclusivo de pais, mães ou responsáveis de dependentes menores de 18 anos e está limitado à análise das redes sociais de menores, conforme apresentado na interface do usuário do aplicativo.

user_videos

	Com a permissão user_videos, seu aplicativo pode ler uma lista de vídeos carregados por uma pessoa.
Exibir os vídeos de uma pessoa em uma TV por meio de um set-top box ou em um porta-retrato digital.
Fornecer às pessoas a capacidade de editar ou criar novo conteúdo de vídeo usando vídeos existentes.
Fornecer às pessoas a capacidade de exibir vídeo com donos no aplicativo. Por exemplo, em aplicativos sociais ou de encontros.
W
Permission
	
Description and allowed usage
	
What to include in App Review submission

whatsapp_business_manage_events

Dependencies
whatsapp_business_management
	Com a permissão whatsapp_business_manage_events, seu app pode registrar eventos como compra, adição ao carrinho, leads e muito mais, em nome de uma conta do WhatsApp Business administrada por um usuário do app. O uso permitido dessa permissão é registrar eventos em contas do WhatsApp Business e enviar esses dados de atividade à Meta para relatórios, otimização e direcionamento de anúncios.
Registrar eventos em contas do WhatsApp Business
Enviar dados de atividade de eventos à Meta para relatórios, otimização e direcionamento de anúncios
	
Descrição do caso de uso

Visit the App Review documentation for guidance.

Screencast Requirements

Consulte a documentação App Review para saber mais.

whatsapp_business_management

Dependencies
None
	Com a permissão whatsapp_business_management, o app pode ler e/ou gerenciar ativos de negócios do WhatsApp que você possui ou aos quais outras empresas concederam acesso a você por meio dessa permissão. Esses ativos comerciais incluem contas comerciais do WhatsApp, telefones, modelos de mensagem, códigos QR e mensagens relacionadas, bem como assinaturas de webhook. The allowed usage for this permission is to manage WhatsApp business assets and display WhatsApp Business Account analytics in your customer portal.
Gerenciar ativos comerciais do WhatsApp.
Exibir análises de conta do WhatsApp Business no seu portal comercial.
	Explique como você usará a permissão `whatsapp_business_management` para acessar os ativos de negócios dos clientes corporativos que foram integrados à plataforma.
Screencast Requirements

Demonstre um dos seguintes:

Como o usuário do seu app cria um modelo de mensagem nele ou no Gerenciador do WhatsApp.
O usuário do seu app habilitando o ícone do Botão de Ligação para a empresa do WhatsApp por meio de: (1) uma solicitação CURL; ou (2) configurações dentro da interface do usuário do seu app. Depois que ele for habilitado, abra a conversa com sua empresa pelo app de usuário do WhatsApp e mostre que o ícone do Botão de Ligação está visível para o usuário na conversa com sua empresa.

whatsapp_business_messaging

Dependencies
whatsapp_business_management
	A permissão whatsapp_business_messaging possibilita que um app envie mensagens do WhatsApp e faça ligações a um número de telefone específico, carregue e recupere mídia de mensagens, gerencie e obtenha informações de perfis comerciais do WhatsApp e registre esses números de telefone com a Meta. O uso dessa permissão é concedido para criar experiências de mensagens e ligações iniciadas por um cliente ou uma empresa.
Uso permitido
Envie mensagens do WhatsApp para um número de telefone específico
Carregue e recupere mídia de mensagens
Faça ligações do WhatsApp para um número de telefone específico
Gerencie e obtenha informações de perfis comerciais do WhatsApp
Registre um número de telefone com a Meta
	Explique quais funcionalidades de mensagens seu app oferece aos clientes empresariais que você integrou à plataforma e como eles executam essas funções.
Screencast Requirements

Demonstre um dos seguintes:

Seu app enviando uma mensagem para um número do WhatsApp, e demonstre o cliente do WhatsApp (na web ou no app para celular) recebendo e exibindo a mensagem enviada. Você pode usar o painel WhatsApp > Configuração de API no Painel de Aplicativos da Meta para gerar uma solicitação de cURL que você pode integrar ao seu app para enviar a mensagem.
Que seu app pode realizar uma ligação iniciada pela empresa e que um usuário aceita a ligação em um cliente móvel do WhatsApp. Em alternativa, você pode demonstrar que um usuário pode realizar uma ligação para seu número de telefone comercial e que seu app recebe a ligação iniciada pelo usuário.
Learn More
Access Tokens
Maintaining Data Access
Secure Requests
Terms and Policies
Nesta Página
Permissions Reference for Meta Technologies APIs
A
B
C
E
F
G
I
L
M
P
R
T
U
W
Learn More