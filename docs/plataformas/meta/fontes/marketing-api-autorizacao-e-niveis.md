---
titulo: "Marketing API — autorização, escopos e níveis de acesso (Limited/Full)"
url: https://developers.facebook.com/documentation/ads-commerce/marketing-api/get-started/authorization
capturado_em: 2026-09-09
hash: a98dfd9a55cfc4c2
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Autorização
Updated: 5 de mai de 2026
Copiar para LLM
Ver como Markdown
Os anúncios no Status do WhatsApp são disponibilizados por meio da API de Marketing. Saiba mais sobre anúncios no Status do WhatsApp.
O Acesso padrão ao gerenciamento de anúncios agora é o Nível de acesso da API de Marketing
Não é preciso promover alterações de código.
Os rótulos de nível foram atualizados: “Standard Access” agora é Limited Access, e “Advanced Access” agora é Full Access. O limite de qualificação revisado para acesso total foi reduzido de 1.500 para 500 chamadas à API de Marketing nos últimos 15 dias. O identificador de permissão subjacente permanece inalterado, e os níveis de acesso existentes são preservados automaticamente. Saiba mais na documentação sobre os níveis de acesso da API de Marketing.
O processo de autorização verifica os usuários e apps que terão acesso à API de Marketing e concede permissões a eles.
Funções do app
No painel do app, você pode definir as seguintes funções para você ou para os membros da equipe, conforme necessário: Administrador, Desenvolvedor e Testador.
Observação: dependendo do caso de uso pretendido, talvez seja necessário enviar o app para análise a fim de receber permissões específicas relacionadas ao gerenciamento de anúncios.
Níveis de acesso, permissões e recursos
Os apps de empresa estão sujeitos a uma camada adicional de autorização da Graph API chamada níveis de acesso. Durante o processo de análise, seu app também deverá solicitar permissões e recursos específicos.
Todos os desenvolvedores devem seguir os Termos da Plataforma e as Políticas do Desenvolvedor da Meta. As chamadas em QUALQUER nível de acesso são feitas em relação aos dados de produção.
Níveis de acesso à API de Marketing
As permissões e os recursos para apps contam com dois níveis de acesso diferentes: acesso padrão e acesso avançado. (Observação: o uso do termo "acesso padrão" aqui se refere aos níveis de acesso em toda a plataforma e não está relacionado ao Nível de acesso da API de Marketing, que tem os próprios níveis: "Acesso limitado" e "Acesso total".) Para atualizar o nível de acesso à API de Marketing, seu app precisa atender aos requisitos exibidos no Painel de Apps.
Visão geral dos níveis de acesso da API de Marketing
O nível de acesso à API de Marketing controla os limites de volume, o acesso ao Gerenciador de Negócios e a capacidade do usuário do sistema. O nível é determinado pelo fato de o app ter sido aprovado por meio da análise ou não.
	Acesso limitado (padrão)	Acesso total (após a análise do app)

How to get
	
Concedida automaticamente quando você adiciona o produto API de Marketing ao app.
	
Clique em +Atualizar para o recurso Nível de acesso à API de Marketing no painel do app. Seu app precisa atender aos requisitos abaixo.

Limites de volume
	
Volumes extremamente limitados por conta de anúncio. Somente para desenvolvimento. Não para apps em produção veiculando para anunciantes publicados.
	
Volumes ligeiramente limitados por conta de anúncios.

Limites de conta
	
Gerencie um número ilimitado de contas de anúncios. Administradores ou desenvolvedores de apps podem fazer chamadas à API em nome de administradores de contas de anúncios ou anunciantes.
	
Gerencie um número ilimitado de contas de anúncios se tiver as permissões ads_read ou ads_management da conta de anúncios.

Gerenciador de Negócios
	
Acesso limitado às APIs do Gerenciador de Negócios e de Catálogo. Sem acesso ao Gerenciador de Negócios para administrar contas de anúncios, permissões de usuários e Páginas.
	
Acesso a todas as APIs do Gerenciador de Negócios e de Catálogo.

Usuários do sistema
	
É possível criar um usuário do sistema e um usuário do sistema administrador.
	
É possível criar 10 usuários do sistema e um usuário do sistema administrador.

Criação da Página
	
Não é possível criar Páginas por meio da API.
	
Não é possível criar Páginas por meio da API.
Para verificar seu nível de acesso atual, navegue até Painel de Apps > Análise do app > Permissões e recursos.
Permissões e recursos
Permissões
As permissões que precisam ser solicitadas mudam de acordo com a API que você quer acessar.
Caso o app gerencie somente sua conta de anúncios, o acesso padrão e as permissões ads_read e ads_management serão suficientes. Se o app gerenciar contas de anúncios de outras pessoas, será necessário ter acesso avançado e as permissões ads_read e/ou ads_management. Veja todas as permissões disponíveis para apps de empresa.
Recursos
Os recursos que devem ser solicitados mudam conforme a maneira como você pretende usar nossas APIs. Se você gerencia anúncios, um recurso comum a ser solicitado é o Nível de Acesso à API de Marketing. Veja todos os recursos disponíveis para apps de empresa.
Níveis de acesso ao recurso
Nível de acesso do recurso	Descrição

Acesso padrão
	
O acesso padrão será aprovado automaticamente para todas as permissões e todos os recursos disponíveis para os apps de negócios.
Use essa opção se estiver começando. Você pode criar fluxos de trabalho de ponta a ponta antes de solicitar permissões totais e pode acessar um número ilimitado de contas de anúncios.
Algumas chamadas de API não estão disponíveis com o acesso padrão, porque podem pertencer a várias contas ou porque não é possível identificar a conta afetada de modo programático.

Advanced Access
	
O acesso avançado deve ser aprovado para cada permissão ou recurso por meio do processo de análise do app.
Para solicitar o acesso avançado, acesse o Painel de Apps e clique em Análise do app > Permissões e recursos.
Encontre a permissão ou o recurso que você quer acessar e clique em Solicitar acesso avançado em Ação. É possível selecionar um ou mais recursos. Depois de selecionar suas opções, clique em Continuar a solicitação. Uma tela que fornece orientações para o processo de envio será exibida.
Após o envio das informações, a Meta responderá com uma mensagem de aprovação ou recusa, com informações adicionais se o app não estiver qualificado para o acesso padrão.
Se você tiver aprovação para o Advanced Access, será preciso realizar as seguintes ações para manter esse status:
Ter feito ao menos 500 chamadas da API de Marketing com sucesso nos últimos 15 dias.
Ter feito chamadas da API de Marketing com uma taxa de erro menor do que 15% nas últimas 500 chamadas.
Observação: esses requisitos também se aplicam ao upgrade do nível de acesso à API de Marketing de acesso limitado para acesso total. Consulte Obter acesso total para saber mais detalhes.
Obter acesso total
Para obter acesso total ao nível de acesso da API de Marketing, seu app precisa atender a estes requisitos:
Ter feito ao menos 500 chamadas da API de Marketing com sucesso nos últimos 15 dias.
Ter feito chamadas da API de Marketing com uma taxa de erro menor do que 15% nas últimas 500 chamadas.
Se estiver gerenciando os anúncios de outra pessoa, use o parâmetro scope para solicitar que ela forneça as permissões ads_management ou ads_read. Seu app obterá acesso quando ela clicar em Permitir.
https://www.facebook.com/v26.0/dialog/oauth?
  client_id=<YOUR_APP_ID>
  &redirect_uri=<YOUR_URL>
  &scope=ads_management
Observação: ao preencher o campo YOUR_URL, coloque uma / à direita (por exemplo, http://www.facebook.com/).
Exemplos de caso de uso
Caso de uso	O que solicitar

Você quer ler e gerenciar anúncios das próprias contas ou de contas de anúncios para as quais tenha recebido acesso.
	
Permissão:ads_management
Recurso: Nível de acesso à API de Marketing

Você quer ler relatórios de anúncios das próprias contas ou de contas de anúncios para as quais tenha recebido acesso do proprietário.
	
Permissão:ads_read
Recurso: Nível de acesso à API de Marketing

Você quer obter relatórios de anúncios de um conjunto de clientes, bem como ler e gerenciar anúncios de outro conjunto de clientes.
	
Permissões:ads_management e ads_read
Recurso: Nível de acesso à API de Marketing
Verificação da empresa
A verificação da empresa é um processo que nos permite confirmar sua identidade como entidade corporativa, o que será necessário caso o app acesse dados sensíveis. Saiba mais sobre o processo de verificação da empresa.
Saiba mais
Permissions Reference for Meta Technologies APIs
Você achou esta página útil?