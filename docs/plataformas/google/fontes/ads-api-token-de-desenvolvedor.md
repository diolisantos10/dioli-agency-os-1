---
titulo: "Google Ads API — token de desenvolvedor"
url: https://developers.google.com/google-ads/api/docs/get-started/dev-token?hl=pt-br
capturado_em: 2026-09-12
hash: 8564abbd36c9f218
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Participe da nossa transmissão ao vivo no Discord no servidor da comunidade de publicidade e medição do Google e no YouTube em 20 de agosto, às 11h (horário de Brasília). Vamos discutir os novos recursos adicionados à versão 25.1 da API Google Ads.
 O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Token de desenvolvedor

O token de desenvolvedor é uma string alfanumérica de 22 caracteres usada para conectar seu app à API Google Ads. Os tokens de desenvolvedor foram desativados em 9 de setembro de 2026. Este guia resume as mudanças e lista as perguntas frequentes sobre essa migração para ajudar os desenvolvedores atuais.

O que muda?

Introduzimos várias mudanças na experiência de integração da API Google Ads e no gerenciamento de acesso à API como parte da desativação do token de desenvolvedor. Esta seção destaca as principais mudanças.

Os níveis de acesso à API estão associados a projetos do Google Cloud

Desativamos os tokens de desenvolvedor em 9 de setembro de 2026. Seu nível de acesso ao token de desenvolvedor atual e ativo foi transferido automaticamente para seus projetos do Google Cloud com base na atividade recente da API. Você pode continuar enviando tokens de desenvolvedor nos cabeçalhos de chamadas de API, mas isso é opcional e ignorado pelos servidores de API. Seu código atual vai continuar funcionando sem mudanças. Seus níveis de acesso à API agora são determinados pelo projeto na nuvem do Google Cloud usado para gerar suas credenciais OAuth.

Se o app usa o fluxo de trabalho de autenticação do usuário, esse é o projeto que possui o ID e a chave secreta do cliente OAuth.
Se você usa o fluxo de trabalho da conta de serviço, esse é o projeto que possui sua conta de serviço.
Uma nova experiência de inscrição na API Google Ads
**Observação** :se você é um desenvolvedor que precisa de acesso à API App Conversion Tracking, continue se inscrevendo para receber um token de desenvolvedor na página da Central de API.

Agora você pode se inscrever para acessar a API Google Ads diretamente no console do Google Cloud sem precisar de uma conta de administrador do Google Ads. Não se inscreva para receber um token de desenvolvedor na página da Central de API nem tente solicitar acesso à API na página da Central de API na sua conta de administrador do Google Ads , porque esses processos foram transferidos para o console do Google Cloud e não serão processados se forem iniciados na página da Central de API.

Uma nova experiência de gerenciamento de acesso à API

Desativamos todas as novas funcionalidades de inscrição e gerenciamento de acesso à API, como solicitar acesso à API e gerenciar níveis de acesso à API na Central de API página nas contas de administrador do Google Ads. Essas funcionalidades agora estão disponíveis na página de visão geral da API Google Ads no console do Google Cloud.

Você ainda pode acessar a página da Central de API para consultar os detalhes históricos do desenvolvedor. Essa página será totalmente desativada no futuro.

Novos códigos de erro

A versão v25 da API Google Ads vai gerar um CLOUD_PROJECT_NOT_APPROVED_FOR_PRODUCTION erro se você tentar usar um projeto na nuvem do Google com o nível de acesso da conta de teste para fazer chamadas para uma conta de produção. As versões mais antigas da API vão gerar um ACTION_NOT_PERMITTED. Se você encontrar esse erro, acesse a página de visão geral da API Google Ads do seu projeto na nuvem do Google Cloud e solicite o acesso do Explorer.

A verificação de marca é necessária para o acesso básico e padrão

Para novas inscrições de acesso Basic e acesso padrão, é necessário concluir a verificação de marca do seu projeto na nuvem do Google Cloud. Os titulares de acesso atuais não precisam concluir a verificação de marca, embora seja recomendável.

As inscrições de acesso básico agora são automatizadas e serão analisadas em minutos após a verificação e o envio da marca.

Devido a essas atualizações de processo, todas as inscrições de acesso básico à API pendentes serão fechadas como parte dessa transição. Os candidatos afetados vão receber um e-mail com detalhes e precisarão se inscrever novamente para acesso à API na página de visão geral da API Google Ads.

Novos e-mails de contato da API

À medida que nos preparamos para desativar a página da Central de API, vamos passar a usar a lista de usuários proprietários e editores no seu projeto do Google Cloud como o único canal para comunicações administrativas e de conformidade obrigatória. Para garantir uma transição tranquila, vamos continuar enviando anúncios de serviço obrigatórios (MSAs, na sigla em inglês) para o endereço de e-mail listado na Central de API temporariamente. Vamos manter você atualizado à medida que finalizamos a transição dos nossos canais de comunicação.

O que fazer se você já é um desenvolvedor

Analise os níveis de acesso à API do seu projeto do Google Cloud: se você já é um desenvolvedor, recomendamos que analise a página de visão geral da API Google Ads dos seus projetos do Google Cloud para garantir que eles tenham o mesmo nível de acesso à API que o token de desenvolvedor atual. Siga as instruções neste guia para resolver as discrepâncias encontradas.

Analise seu endereço de e-mail para contato da API:acesse a página do IAM (Identity and Access Management) do seu projeto na nuvem do Google Cloud. Verifique se os desenvolvedores e gerentes de contas ativos do Google Ads têm os papéis de proprietário ou editor adequados atribuídos no seu projeto do Google Cloud. Vamos começar a enviar anúncios de serviço obrigatórios (MSAs) para esses endereços de e-mail para notificar você sobre mudanças futuras na API Google Ads. Vamos continuar enviando MSAs para o endereço de e-mail de contato listado na Central de API por um período temporário e vamos informar você sempre que esse processo for atualizado.

Corrija o código do app:recomendamos que você atualize o app para parar de enviar o token de desenvolvedor como parte das chamadas de API. Publicamos versões atualizadas de as bibliotecas de cliente, o servidor MCP do Google Ads e o Google Ads API Developer Assistant, que permitem fazer chamadas de API sem definir um token de desenvolvedor. Vamos começar a rejeitar tokens de desenvolvedor em chamadas de API em uma versão principal futura da API Google Ads. Se o app usa essas bibliotecas, atualize as dependências do app para usar a versão mais recente.

Entre em contato com o suporte da API Google Ads se precisar de mais ajuda ou tiver mais dúvidas.

Perguntas frequentes
O que acontece com os níveis de acesso à API?

Os níveis de acesso à API ainda são aplicados na API Google Ads. No entanto, eles agora são concedidos ao seu projeto do console do Google Cloud em vez do token de desenvolvedor. Ao fazer chamadas de API, seus níveis de acesso à API agora são determinados pelo projeto do Google Cloud usado para gerar suas credenciais OAuth.

Se o app usa o fluxo de trabalho de autenticação do usuário, esse é o projeto que possui o ID e a chave secreta do cliente OAuth.
Se você usa o fluxo de trabalho da conta de serviço, esse é o projeto que possui sua conta de serviço.
Como os projetos foram identificados para transferir níveis de acesso à API?

Se você já tinha um token de desenvolvedor aprovado antes de 9 de setembro de 2026, os níveis de acesso dele foram transferidos para seus projetos do Google Cloud da seguinte maneira:

Examinamos os registros de chamadas de API dos últimos 90 dias para identificar quais projetos do Cloud foram usados para fazer chamadas de API com seu token de desenvolvedor aprovado.
Atribuímos os níveis de acesso à API do token de desenvolvedor a todos os projetos do Cloud identificados.
Posso ter vários projetos do Cloud com níveis de acesso diferentes após essa mudança?

Sim, você pode ter vários projetos do Google Cloud com níveis de acesso à API diferentes. Por exemplo, você pode ter um projeto na nuvem do Google Cloud com acesso básico e outro projeto na nuvem do Google Cloud com acesso padrão.

Exemplo

Por exemplo, suponha que você tenha quatro tokens de desenvolvedor e seis projetos do Cloud com os seguintes detalhes:

Token de desenvolvedor 1: abcdefghijkl1234567890 tem acesso padrão. Ele foi usado com os IDs de projeto: 1234567890, 5678912345, 45678912345.
Token de desenvolvedor 2: xyzabcdefghi6789012345 tem acesso básico. Ele foi usado com os IDs de projeto: 1231235678.
Token de desenvolvedor 3: asdfgflkjhjz7654321012 tem acesso básico, mas nunca foi usado para fazer uma chamada de API. Ele foi aprovado recentemente.
Token de desenvolvedor 4: qwertypoiuyu6543298790 tinha acesso padrão, mas não foi usado nos últimos 90 dias. O ID do projeto 9876564900 foi usado com esse token de desenvolvedor no passado.
Projeto na nuvem: o ID do projeto na nuvem 7171234567 nunca foi usado com nenhum dos tokens de desenvolvedor para fazer uma chamada de API.

Os níveis de acesso à API serão transferidos dos tokens de desenvolvedor para os projetos do Google Cloud da seguinte maneira:

Token de desenvolvedor	ID do projeto	Nível de acesso	Explicação
abcdefghijkl1234567890	1234567890	Acesso padrão	O token de desenvolvedor e o ID do projeto estão associados um ao outro.
abcdefghijkl1234567890	5678912345	Acesso padrão	O token de desenvolvedor e o ID do projeto estão associados um ao outro.
abcdefghijkl1234567890	45678912345	Acesso padrão	O token de desenvolvedor e o ID do projeto estão associados um ao outro.
xyzabcdefghi6789012345	1231235678	Acesso básico	O token de desenvolvedor e o ID do projeto estão associados um ao outro.
asdfgflkjhjz7654321012	--	--	O acesso à API do token de desenvolvedor não foi transferido para nenhum projeto já que nunca foi usado para fazer uma chamada de API.
qwertypoiuyu6543298790	9876564900	Acesso à conta de teste	O acesso à API do token de desenvolvedor foi revogado devido à inatividade por 90 dias. O nível de acesso à API do projeto é definido como acesso à conta de teste.
--	7171234567	Acesso à conta de teste	Esse é um novo projeto que nunca foi usado com nenhum token de desenvolvedor. O nível de acesso à API do projeto é definido como acesso à conta de teste.
Tenho mais de um token de desenvolvedor aprovado. Para qual projeto vocês vão transferir os níveis de acesso à API?

Os níveis de acesso de cada token de desenvolvedor aprovado serão transferidos para os projetos do Google Cloud associados a esse token de desenvolvedor. Confira um exemplo.

Uso vários projetos do Google Cloud. Para qual projeto vocês vão transferir os níveis de acesso à API?

Se você usou vários projetos do Google Cloud com seu token de desenvolvedor aprovado em nos últimos 90 dias, todos esses projetos vão receber os mesmos níveis de acesso à APIque o token de desenvolvedor. Confira um exemplo.

Os níveis de acesso à API foram atribuídos a um projeto que não uso mais. Como faço para corrigir esse problema?

Se o acesso à API Google Ads for atribuído a um projeto do Google Cloud que você não usa mais, nenhuma outra ação será necessária. O Google vai revogar o acesso à API acesso do projeto não utilizado após 90 dias de inatividade.

Os níveis de acesso à API não foram atribuídos ao meu projeto na nuvem do Google Cloud. Como faço para corrigir esse problema?

Seu projeto na nuvem do Google Cloud não herdou o nível de acesso do token de desenvolvedor, provavelmente porque você nunca usou o token de desenvolvedor e o projeto na nuvem para fazer uma chamada de API, ou o acesso à API do token de desenvolvedor expirou recentemente devido à inatividade. Para corrigir o problema, solicite o nível de acesso à API adequado para esse projeto na página de visão geral da API Google Ads. Confira um exemplo.

Onde posso ver os níveis de acesso à API do meu projeto?

Você pode conferir o nível de acesso à API do seu projeto do Google Cloud em a página de visão geral da API Google Ads.

Como faço para solicitar níveis de acesso à API mais altos?

Você pode solicitar níveis de acesso à API mais altos para seu projeto do Google Cloud na página de visão geral da API Google Ads.

O que acontece com minha inscrição de acesso à API pendente?

Todas as inscrições de acesso básico pendentes que você iniciou na Central de API da sua conta de administrador do Google Ads antes de 9 de setembro de 2026 serão fechadas. Você precisa se inscrever novamente para acesso básico na página de visão geral da API Google Ads do seu projeto do Google Cloud. Se você for afetado por essa mudança, vai receber um e-mail com as instruções necessárias.

Todas as inscrições de acesso padrão pendentes que você iniciou na Central de API da sua conta de administrador do Google Ads em 9 de setembro de 2026 serão analisadas normalmente. Se aprovado, o projeto na nuvem do Google Cloud associado ao seu token de desenvolvedor vai receber acesso padrão.

Posso reassociar meu token de desenvolvedor aprovado a um novo projeto do Google Cloud?

No passado, a equipe da API Google Ads oferecia suporte à reassociação de um token de desenvolvedor a um novo projeto na nuvem do Google caso a caso. Esse recurso não é mais oferecido desde 9 de setembro de 2026, já que desativamos os tokens de desenvolvedor. Se você precisar usar um novo projeto na nuvem do Google Cloud, solicite o acesso à API adequado na página de visão geral da API Google Ads do seu projeto na nuvem do Google Cloud.

Tenho um token de desenvolvedor aprovado, mas nunca o usei. Posso usar esse token de desenvolvedor?

Não, não é possível usar esse token de desenvolvedor. Há duas possibilidades:

O acesso ao token de desenvolvedor pode ser revogado por inatividade: de acordo com as políticas do Google, o Google pode revogar seu token de API se ele não for usado consecutivamente por 90 dias. Se você não usa o token de desenvolvedor há algum tempo, é provável que os níveis de acesso dele tenham sido revogados devido à inatividade. Nesse caso, inscreva-se novamente para acesso à API do seu projeto na nuvem do Google Cloud na página de visão geral da API Google Ads. Confira um exemplo.

Seu token de desenvolvedor foi aprovado recentemente, mas você nunca o usou antes de 9 de setembro de 2026:como você nunca usou o token de desenvolvedor aprovado com um projeto do Google Cloud antes de 9 de setembro de 2026, os níveis de acesso dele não foram transferidos para o projeto do Cloud. Como resultado, não é mais possível usar o token de desenvolvedor. Vamos gerar um CLOUD_PROJECT_NOT_APPROVED_FOR_PRODUCTION erro se você tentar fazer uma chamada de API para uma conta de produção com esse token de desenvolvedor. Para corrigir o erro, solicite o acesso à API adequado na página de visão geral da API Google Ads do seu projeto do Google Cloud. Confira um exemplo.

Em ambos os casos, você pode solicitar o acesso do Explorer e inscrições de nível de acesso básico e recebê-los automaticamente. Não é mais necessário trabalhar com a equipe de conformidade do Google para concluir o processo de análise. Se você precisar de acesso padrão, será necessária uma análise manual. No entanto, você pode compartilhar os detalhes do token de desenvolvedor aprovado ao solicitar o acesso padrão para que a equipe de conformidade possa analisar sua nova inscrição de acesso padrão de acordo.

Posso parar de enviar tokens de desenvolvedor como parte das minhas solicitações de API?

Sim, você pode parar de enviar tokens de desenvolvedor como parte das suas solicitações de API. Se você usa uma biblioteca de cliente, talvez seja necessário fazer upgrade para a versão mais recente. Confira os registros de mudanças da biblioteca para confirmar se ela oferece suporte a chamadas de API sem especificar um token de desenvolvedor.

Participei do programa piloto de nível de acesso gerenciado do Cloud. Como isso me afeta?

O programa piloto de nível de acesso gerenciado do Cloud foi introduzido como uma maneira de os desenvolvedores do Google Cloud fazerem chamadas de API sem enviar um token de desenvolvedor como parte da solicitação de API. Agora que desativamos os tokens de desenvolvedor, esse programa será descontinuado.

Os níveis de acesso do seu token de desenvolvedor ativo foram transferidos para seu projeto do Google Cloud. Portanto, seu código atual vai continuar funcionando sem mudanças. Se você precisar usar um novo projeto do Google Cloud, solicite o acesso à API na página de visão geral da API Google Ads do seu projeto do Google Cloud .

Meu token de desenvolvedor fazia parte de uma lista de permissões. Como isso me afeta?

O Google pode executar programas piloto que dão a alguns desenvolvedores acesso a recursos experimentais. O acesso a esses recursos às vezes é fornecido adicionando seu token de desenvolvedor a uma lista de permissões. Se você fez parte de um programa piloto, nenhuma ação será necessária.

Atualizamos todos os programas piloto para usar projetos do Google Cloud em vez de tokens de desenvolvedor como mecanismo de lista de permissões e transferimos o status da lista de permissões do token de desenvolvedor para os projetos do Google Cloud associados. Seu código atual vai continuar funcionando sem mudanças. Se você continuar enfrentando problemas, entre em contato com o gerente de contas do Google que fez a inscrição no programa piloto.

Tenho um token de desenvolvedor aprovado e quero usá-lo com um novo projeto do Google Cloud. Isso é permitido?

Não, não é possível usar um novo projeto na nuvem do Google com seu token de desenvolvedor aprovado. Como você nunca usou o token de desenvolvedor aprovado com o novo projeto do Google Cloud antes de 9 de setembro de 2026, os níveis de acesso dele não foram transferidos para o projeto do Cloud. Vamos gerar um CLOUD_PROJECT_NOT_APPROVED_FOR_PRODUCTION erro se você tentar fazer uma chamada de API com esse token de desenvolvedor, já que os tokens de desenvolvedor não são mais usados para determinar seus níveis de acesso à API. Para corrigir o erro, solicite o acesso à API adequado na página Visão geral da API Google Ads do seu projeto do Google Cloud. Confira um exemplo.

Meu token de desenvolvedor foi vazado externamente. Preciso redefinir meu token de desenvolvedor?

Não, não é necessário redefinir o token de desenvolvedor nesse caso. Como transferimos os níveis de acesso à API do seu token de desenvolvedor para seu projeto do Google Cloud, um usuário não autorizado não pode mais usar seu token de desenvolvedor com o próprio projeto do Google Cloud. No entanto, você pode redefinir o token de desenvolvedor na Central de API, se preferir.

O que acontece com a Central de API?

A página da Central de API na conta de administrador do Google Ads foi descontinuada e será removida em breve. Se você já tem um token de desenvolvedor, ainda pode fazer login na sua conta de administrador do Google Ads e conferir os detalhes. No entanto, eles são fornecidos apenas para sua referência. Não realize tarefas relacionadas aos níveis de acesso do token de desenvolvedor, como solicitar níveis de acesso à API mais altos nessa página.

Se você precisar solicitar níveis de acesso à API mais altos, faça isso na página de visão geral da API Google Ads do seu projeto do Google Cloud.

Ainda preciso de uma conta de administrador do Google Ads para usar a API Google Ads?

Não é mais necessário ter uma conta de administrador do Google Ads para usar a API Google Ads. Você só precisa de uma conta de administrador se precisar vincular e gerenciar várias contas usando a API.

Sou um novo desenvolvedor. Como faço para me inscrever na API Google Ads?

Siga as instruções no guia de introdução para se inscrever na API Google Ads. Não se inscreva para receber um token de desenvolvedor na Central de API da sua conta de administrador do Google Ads. Essas inscrições não serão processadas. A Central de API será desativada em breve.

Avançar
Níveis de acesso e uso permitido
Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-09-12 UTC.