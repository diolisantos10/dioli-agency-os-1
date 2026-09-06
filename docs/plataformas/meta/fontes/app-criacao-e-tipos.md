---
titulo: "Desenvolvimento — criar um app, tipos de app e painel"
url: https://developers.facebook.com/documentation/development/create-an-app
capturado_em: 2026-09-06
hash: 56d5c1bb501bb7a6
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Criar um app com a Meta
Updated: 16 de set de 2025
Copiar para LLM
Ver como Markdown
Criar um app com a Meta é um primeiro passo para qualquer desenvolvedor que queira integrar os produtos, os SDKs ou as APIs da nossa plataforma. Esse processo garante que seu app seja devidamente identificado, configurado e autorizado a interagir com a plataforma e os serviços da Meta.
Antes de começar
Para criar um app com a Meta, registre-se como desenvolvedor e entre na sua conta de desenvolvedor⁠.
Visão geral
É preciso criar um app para concluir estas etapas:
Faça a integração: tenha acesso aos nossos SDKs e APIs, permitindo que seu app interaja com o Facebook, Instagram e outros produtos da Meta.
Gerencie permissões e acesso a dados: revise e cumpra os requisitos para acessar dados do usuário, garantindo que seu app atenda aos padrões de privacidade e segurança da Meta.
Receba credenciais: receba uma identificação e uma chave secreta exclusivas do app, que são usadas nos processos de autenticação e geração de tokens de acesso para teste e produção.
O que são os casos de uso?
Os casos de uso representam as principais maneiras pelas quais seu app interagirá com a plataforma da Meta, como autenticar usuários, acessar recursos sociais ou gerenciar ativos de negócios.
Quando você escolhe um caso de uso, permissões, recursos e produtos são adicionados automaticamente ao app, fornecendo a ele uma funcionalidade específica. Por exemplo, se você selecionar o caso de uso Gerenciar tudo na sua Página, business_management, pages_show_list e public_profile serão adicionados. Essas permissões são obrigatórias para que o caso de uso funcione corretamente e não podem ser removidas. Além disso, a permissão pages_manage_engagement é adicionada por padrão, mas pode ser removida caso o app não precise dela para funcionar como o esperado. Você também pode adicionar permissões opcionais, como pages_read_engagement, e o recurso Acesso ao Perfil do Usuário de Ativo de Negócios, caso sejam necessários para o app.
É possível adicionar vários casos de uso a um único app, desde que sejam compatíveis entre si. Por exemplo, você pode adicionar o caso de uso Acessar a API do Threads a um app com o caso de uso Gerenciar tudo na sua Página, mas não pode adicionar o caso de uso Autenticar e solicitar dados de usuários com o Login do Facebook, já que ele é incompatível. Durante a criação inicial do app, após selecionar um caso de uso, as opções incompatíveis aparecerão esmaecidas.
Observação:Login do Facebook para Empresas e Webhooks podem ser adicionados automaticamente ao seu app.
Além disso, você pode criar um app sem um caso de uso para gerar uma identificação. No entanto, esse app não terá permissões, recursos ou produtos associados a ele.
Após a criação do app, será possível personalizar cada caso de uso e adicionar outras opções compatíveis. Se quiser incluir casos de uso adicionais mais tarde, apenas as opções compatíveis serão exibidas.
Depois de criar o app, não é possível remover casos de uso. Você pode adicionar casos de uso compatíveis a um app. Entretanto, depois disso, não será mais possível removê-los.
Casos de uso disponíveis
Use Case
Description
Criar e gerenciar anúncios de apps com o Gerenciador de Anúncios da Meta
Promova seu app para celular e aumente as instalações. Crie e gerencie campanhas que incentivem os usuários a baixar e instalar seu app. Não inclui acesso à API de Marketing.
Anuncie no seu app com o Meta Audience Network
Participe do Meta Audience Network para monetizar seu app e aumentar sua receita com anúncios de anunciantes da Meta. Receba insights usando a API de Relatórios.
Gerenciar produtos com a API de Catálogo
Gerencie catálogos e os produtos que você deseja promover nas tecnologias da Meta.
Permitir que as pessoas transfiram seus respectivos dados para outros apps
Dê aos usuários a capacidade de transferir suas respectivas informações dos apps da Meta para outros serviços.
Interagir com os clientes no Messenger from Meta
Responda às mensagens enviadas para a Página do Facebook da sua empresa. Você pode configurar respostas automáticas ou usar um agente humano para responder.
Autenticar e solicitar dados de usuários com o Login do Facebook
Nosso caso de uso mais comum. Uma maneira rápida e segura para os usuários entrarem no seu app ou jogo e para o app solicitar a eles permissões de acesso aos dados e personalizar a experiência.
Compartilhe ou crie campanhas de arrecadação de fundos no Facebook e no Instagram
Arrecade fundos e alcance mais pessoas com a API de Campanha de Arrecadação de Fundos da Meta. Crie ou compartilhe campanhas de arrecadação de fundos existentes no Facebook e no Instagram.
Gerenciar mensagens e conteúdo no Instagram
Publique posts, compartilhe stories, responda a comentários, mensagens diretas e muito mais com a API do Instagram.
Lance um jogo instantâneo no Facebook e no Messenger
Lance um jogo Instantâneo que as pessoas possam encontrar e jogar diretamente no Feed ou em mensagens/conversas, tanto em desktops quanto em dispositivos móveis.
Acessar a API de Vídeo ao Vivo
Use a API de Vídeo ao Vivo para transmitir vídeos ao vivo no Facebook.
Mensurar dados de desempenho do anúncio com a API de Marketing
Maximize o ROI com dados de desempenho do anúncio para otimizar os orçamentos para anúncios e os criativos, além de criar públicos personalizados, conectar clientes a catálogos de produtos e melhorar o alcance.
Criar e gerenciar anúncios com a API de Marketing
Crie, gerencie e otimize campanhas de anúncios nas tecnologias da Meta. De forma programática, estenda, interrompa ou atualize as campanhas de anúncios e muito mais.
Capturar e gerenciar leads de anúncios com a API de Marketing
Ofereça aos clientes em potencial um meio rápido e seguro de se cadastrar para receber informações sobre sua empresa ou seus produtos.
Incorporar conteúdo do Facebook, Instagram e Threads em outros sites
Use a API do oEmbed para incorporar conteúdo do Facebook, Instagram e Threads, como fotos e vídeos, em outros sites.
Gerenciar tudo na sua Página
Publique conteúdos e vídeos, modere posts e comentários dos seus seguidores na sua Página e receba insights sobre o engajamento.
Acessar a API do Threads
Use a API do Threads e escolha se quer autenticar usuários, recuperar informações dos usuários, postar threads, responder a threads, gerenciar configurações de resposta e/ou coletar insights do seu perfil do Threads ou de perfis que você gerencia em nome de outras pessoas.
Participar do ThreatExchange
Participe do ThreatExchange para compartilhar sinais com outros membros sobre ameaças online, incluindo terrorismo, malware, material de abuso sexual infantil e outros conteúdos prejudiciais, ajudando a manter as pessoas seguras na internet.
Conectar-se com clientes pelo WhatsApp
Comece uma conversa no WhatsApp, envie notificações, crie anúncios de clique para o WhatsApp e forneça suporte. É necessário um portfólio empresarial.
O que são permissões e recursos?
Permissões são a forma como o app solicita a uma pessoa o acesso aos seus dados armazenados nos servidores da Meta. Saiba mais.
Recursos são mecanismos de autorização que permitem ao app acessar determinados pontos de extremidade sem precisar do consentimento explícito do usuário para utilizar seus dados com uma finalidade específica. Saiba mais.
Ao personalizar um caso de uso, você verá uma lista de permissões e recursos disponíveis. Um caso de uso possui permissões que são necessárias para que ele funcione corretamente. Essas permissões são obrigatórias e não podem ser removidas. Um caso de uso também pode incluir permissões opcionais que oferecem funcionalidades extras. É possível adicionar ou remover permissões opcionais a qualquer momento durante o processo de desenvolvimento. Adicione apenas as permissões opcionais exigidas pelo app para funcionar conforme o esperado.
Mapeamento de permissões por caso de uso
A tabela a seguir mostra as permissões e os recursos necessários e opcionais em cada caso de uso.
Use Case
Required Permissions/Features
Optional Permissions/Features
Acessar a API de Vídeo ao Vivo
publish_video
pages_read_engagement
Live Video API
public_profile
business_management
pages_manage_posts
email
live_shopping_manage_video
catalog_management
Acessar a API do Threads
threads_basic
threads_read_replies
threads_manage_replies
threads_content_publish
threads_manage_insights
threads_keyword_search
threads_profile_discovery
threads_manage_mentions
threads_delete
threads_location_tagging
threads_share_to_instagram
Threads Trending Topics
Anuncie no seu app com o Meta Audience Network
public_profile
Autenticar e solicitar dados de usuários com o Login do Facebook
public_profile
email
user_hometown
user_birthday
user_age_range
user_gender
user_link
user_friends
user_location
user_likes
user_photos
user_videos
user_posts
Capturar e gerenciar leads de anúncios com a API de Marketing
public_profile
ads_management
ads_read
Marketing API Access Tier
business_management
leads_retrieval
pages_manage_ads
pages_read_engagement
pages_show_list
email
pages_manage_metadata
Business Asset User Profile Access
Compartilhe ou crie campanhas de arrecadação de fundos no Facebook e no Instagram
public_profile
manage_fundraisers
email
Conectar-se com clientes pelo WhatsApp
whatsapp_business_messaging
whatsapp_business_management
public_profile
business_management
whatsapp_business_manage_events
email
manage_app_solution
Criar e gerenciar anúncios com a API de Marketing
public_profile
ads_management
ads_read
Marketing API Access Tier
business_management
pages_read_engagement
pages_show_list
catalog_management
pages_manage_ads
email
threads_business_basic
Business Asset User Profile Access
Gerenciar mensagens e conteúdo no Instagram
public_profile
email
ads_management
ads_read
business_management
catalog_management
Human Agent
instagram_basic
instagram_business_basic
instagram_branded_content_ads_brand
instagram_branded_content_brand
instagram_branded_content_creator
instagram_creator_marketplace_discovery
instagram_creator_marketplace_messaging
instagram_business_content_publish
instagram_business_manage_comments
instagram_business_manage_insights
instagram_business_manage_messages
instagram_content_publish
instagram_manage_comments
instagram_manage_contents
instagram_manage_engagement
instagram_manage_insights
instagram_manage_messages
instagram_manage_upcoming_events
Instagram Public Content Access
instagram_shopping_tag_products
pages_read_engagement
pages_show_list
Business Asset User Profile Access
Gerenciar produtos com a API de Catálogo
public_profile
catalog_management
email
Gerenciar tudo na sua Página
business_management
pages_show_list
public_profile
email
Page Mentions
pages_read_engagement
pages_read_user_content
pages_manage_engagement
pages_manage_posts
pages_manage_metadata
read_insights
Business Asset User Profile Access
facebook_branded_content_ads_brand
facebook_creator_marketplace_discovery
Live Video API
Incorporar conteúdo do Facebook, Instagram e Threads em outros sites
Meta oEmbed Read
Threads oEmbed Read
Interagir com os clientes no Messenger from Meta
public_profile
business_management
pages_manage_metadata
pages_messaging
pages_show_list
email
ads_management
instagram_basic
instagram_manage_messages
pages_user_gender
pages_user_locale
pages_user_timezone
pages_utility_messaging
pages_read_engagement
paid_marketing_messages
Business Asset User Profile Access
marketing_messages_messenger
Human Agent
Lance um jogo instantâneo no Facebook e no Messenger
gaming_profile
gaming_user_picture
gaming_user_locale
email
Instant Games Zero Permission Access
Mensurar dados de desempenho do anúncio com a API de Marketing
public_profile
ads_read
ads_management
Marketing API Access Tier
business_management
pages_read_engagement
pages_show_list
email
Business Asset User Profile Access
Participar do ThreatExchange
ThreatExchange
O que é um portfólio empresarial?
Com um portfólio empresarial, as organizações podem reunir Páginas do Facebook, contas do Instagram, contas de anúncios, catálogos, entre outros, para que você possa gerenciar esses ativos de negócios e as pessoas que os acessam em um só lugar usando ferramentas para empresas como o Meta Business Suite e o Gerenciador de Negócios.Saiba mais sobre os portfólios empresariais⁠.
Caso seu app acesse dados que você não possui nem gerencia, conecte-o a um portfólio empresarial. É possível conectar um portfólio empresarial a qualquer momento durante o processo de desenvolvimento.
O que é uma empresa verificada?
Para acessar determinados produtos e recursos, a Meta pode solicitar que você verifique sua empresa. Esse processo nos ajuda a confirmar que o portfólio empresarial pertence a uma empresa ou organização legítima. Nem todas as empresas precisam ou têm a opção de concluir a verificação. Saiba mais sobre a verificação da empresa⁠.
O que é a análise do app?
A análise do app é o processo que permite à Meta garantir que os apps utilizem as APIs, os SDKs e os produtos da plataforma de forma adequada. Esse processo será necessário se o app for usado por pessoas sem uma função nele ou na empresa conectada a ele. Saiba mais sobre a análise do app.
Vídeo de criação do app
Etapas para criação do app
Começar
Acesse https://developers.facebook.com/apps/creation/ para começar o processo de criação do app.
Detalhes do app
Insira o nome do app e um endereço de email para contato.
Clique em Avançar.
Casos de uso
Selecione um ou mais casos de uso para o app. Você pode incluir casos de uso adicionais e compatíveis agora ou a qualquer momento durante a etapa de desenvolvimento.
Os casos de uso incompatíveis aparecerão esmaecidos.
Se quiser incluir casos de uso adicionais mais tarde, apenas as opções compatíveis serão exibidas.
Alguns produtos, como o Login do Facebook para Empresas ou o Webhooks, podem ser incluídos automaticamente no seu caso de uso.
Se você precisar de um caso de uso que não esteja listado, selecione Outro e siga as instruções descritas no guia Fluxo de criação com tipo de app.
Clique em Avançar.
Empresas
Selecione uma opção:
Um portfólio empresarial verificado
Um portfólio empresarial não verificado
Ainda não quero me conectar a um portfólio empresarial.
Criar um portfólio empresarial
Adicione suas informações na janela pop-up.
Você pode enviar o portfólio empresarial para verificação agora (o Gerenciador de Negócios da Meta será aberto em uma nova janela) ou mais tarde.
Quando concluir, volte ao painel e selecione o novo portfólio empresarial.
Clique em Avançar.
Requisitos
Talvez seja preciso cumprir certos requisitos, como passar pelo processo de análise, para receber e manter o acesso a dados para os casos de uso do app.
Clique em Avançar.
Visão geral
Analise os detalhes do app, os casos de uso, a empresa conectada e os requisitos.
Se precisar fazer alguma alteração, clique em Detalhes do app, Casos de uso, Empresa ou Requisitos no topo da página ou no botão Anterior, exibido no canto inferior direito.
Você também pode ler os Termos da Plataforma da Meta e as Políticas do Desenvolvedor seguindo os links no final da página.
Clique em Ir para o painel para finalizar o processo de criação do app.
Redirecionaremos você para o painel, e então será possível personalizar cada caso de uso selecionado.
Solução de problemas
Caso não seja possível concluir a criação, talvez o número máximo de apps tenha sido atingido. Você tem permissão para ter uma função de desenvolvedor ou administrador em até 15 apps que não estejam conectados a uma conta empresarial do Meta Verified⁠. Caso você tenha atingido esse limite e não consiga criar um app nem aceitar uma nova função pendente, siga estas etapas mostradas no painel:
Conecte um portfólio empresarial verificado a apps que ainda não estejam conectados a um.
Remova apps antigos ou não utilizados. Os apps arquivados são contabilizados no limite; se não precisar mais deles, recomendamos que você faça a remoção.
Remova sua função de administrador ou desenvolvedor de um app.
Próximas etapas
Personalize seus casos de uso: agora que você criou o app, personalize seus casos de uso.
Você achou esta página útil?