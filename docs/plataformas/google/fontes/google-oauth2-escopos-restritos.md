---
titulo: "Google Identity — verificação de escopos restritos"
url: https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification?hl=pt-br
capturado_em: 2026-09-11
hash: 23b240d16a0ac53c
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Verificação de escopo restrito
Nesta página
Entender os escopos restritos
Entender o uso do escopo
Tipos de aplicativos permitidos
Security assessment
Etapas para se preparar para a verificação
Requisitos da página inicial do aplicativo
Requisitos de link da Política de Privacidade do aplicativo
Como enviar o app para verificação de marca

Algumas APIs do Google (as que aceitam escopos sensíveis ou restritos ) têm requisitos para apps que pedem permissão para acessar dados do consumidor. Esses requisitos adicionais para escopos restritos exigem que um app demonstre ser um tipo de aplicativo permitido e que seja enviado para outras análises, incluindo uma possível avaliação de segurança.

A aplicabilidade de escopos restritos em uma API depende principalmente do grau de acesso necessário para fornecer um recurso relevante no app: somente leitura, somente gravação, leitura e gravação etc.

Quando você usa o OAuth 2.0 para receber permissão de uma Conta do Google para acessar esses dados, usa strings chamadas escopos para especificar o tipo de dados que você quer acessar e quanto acesso precisa. Se o app solicitar escopos sensíveis ou restritos , será necessário concluir o processo de verificação, a menos que o uso do app se qualifique para uma exceção.

Os escopos restritos são menos numerosos em comparação com os sensíveis. As Perguntas frequentes sobre a verificação de APIs OAuth contêm a lista atual de escopos sensíveis e restritos. Esses escopos fornecem acesso amplo aos dados do usuário do Google e exigem que você passe por um processo de verificação de escopo antes de solicitar os escopos de qualquer Conta do Google. Para mais informações sobre esse requisito, consulte a Política de dados do usuário dos serviços da API do Google e os Requisitos adicionais para escopos específicos da API ou a página do desenvolvedor do Google específica do produto. Se você armazena ou transmite dados de escopo restrito em servidores, é necessário concluir uma avaliação de segurança.

Entender os escopos restritos

Se o app solicitar escopos restritos e não se qualificar para uma exceção, será necessário atender aos Requisitos adicionais para escopos específicos da API da Política de dados do usuário dos serviços da API do Google ou aos requisitos específicos do produto na página do desenvolvedor do Google, que exige um processo de análise mais extenso.

Entender o uso do escopo
Analise os escopos que o app usa ou que você quer usar. Para encontrar o uso de escopo atual, examine o código-fonte do app para ver se há escopos enviados com solicitações de autorização.
Determine se cada escopo solicitado é necessário para as ações pretendidas do recurso do app e usa o privilégio mínimo necessário para fornecer o recurso. Uma API do Google geralmente tem documentação de referência na página do desenvolvedor do Google para os endpoints que incluem o escopo necessário para chamar o endpoint ou propriedades específicas. Para mais informações sobre os escopos de acesso necessários para os endpoints da API que o app chama, leia a documentação de referência desses endpoints. Por exemplo, para um app que usa apenas APIs do Gmail para enviar e-mails ocasionalmente em nome de um usuário, não solicite o escopo que fornece acesso total aos dados de e-mail do usuário.
Os dados recebidos de uma API do Google só podem ser usados em conformidade com as políticas da API e da maneira que você representa aos usuários nas ações do app e na Política de Privacidade.
Consulte a documentação da API para saber mais sobre cada escopo, incluindo o status sensível ou restrito em potencial.
Declare todos os escopos usados pelo app na página "Acesso a dados" do Cloud Console. Os escopos especificados são agrupados em categorias sensíveis ou restritas para destacar qualquer verificação adicional necessária.
Encontre o melhor escopo que corresponda aos dados usados pela integração, entenda o uso dele, confirme novamente que tudo ainda funciona em um ambiente de teste e se prepare para enviar para verificação.

Não se esqueça de considerar o tempo necessário para concluir a verificação no plano de lançamento do app ou de novos recursos que exigem um novo escopo. Um desses requisitos adicionais ocorre se o app acessar ou tiver a capacidade de acessar dados do usuário do Google de ou por um servidor. Nesses casos, o sistema precisa passar por uma avaliação de segurança anual de um avaliador terceirizado independente aprovado pelo Google. Por esse motivo, o processo de verificação de escopos restritos pode levar várias semanas para ser concluído. Todos os apps precisam concluir a etapa de verificação de marca primeiro, o que normalmente leva de 2 a 3 dias úteis, se as informações de marca tiverem mudado desde a última verificação aprovada da tela de permissão OAuth.

Tipos de aplicativos permitidos

Alguns tipos de aplicativos podem acessar escopos restritos para cada produto. Você pode encontrar os tipos de aplicativos na página do desenvolvedor do Google específica do produto (por exemplo, a Política da API Gmail).

É sua responsabilidade entender e determinar o tipo de aplicativo. No entanto, se você não tiver certeza do tipo de aplicativo, não selecione nenhuma opção para a pergunta Quais recursos você vai usar? ao enviar o app para verificação. A equipe de verificação da API do Google vai determinar o tipo de aplicativo.

Security assessment

Todos os apps que solicitam acesso a dados restritos dos usuários do Google e têm a capacidade de acessar dados de ou por um servidor de terceiros precisam passar por uma avaliação de segurança de avaliadores de segurança do Google. Essa avaliação ajuda a manter os dados dos usuários do Google seguros, verificando se todos os apps que acessam dados do usuário do Google demonstram a capacidade de processar dados com segurança e excluir dados do usuário mediante solicitação.

Para padronizar nossa avaliação de segurança, usamos a App Defense Alliance e a estrutura de avaliação de segurança de aplicativos na nuvem (CASA, na sigla em inglês).

Como mencionado anteriormente, para manter o acesso a escopos restritos verificados, os apps precisam ser verificados novamente para conformidade e concluir uma avaliação de segurança pelo menos a cada 12 meses após a data de aprovação da carta de avaliação (LOA, na sigla em inglês) do avaliador. Se o app adicionar um novo escopo restrito, ele poderá precisar ser reavaliado para cobrir o escopo adicional se ele não tiver sido incluído em uma avaliação de segurança anterior.

A equipe de análise do Google envia um e-mail quando é hora de recertificar o app. Para garantir que os membros corretos da equipe sejam notificados dessa aplicação anual, associe outras Contas do Google ao projeto do Cloud Console como proprietário ou editor. Também é útil manter atualizados os e-mails de suporte ao usuário e de contato do desenvolvedor especificados na página de marca do OAuth do console do Google Cloud.

Etapas para se preparar para a verificação

Todos os apps que usam APIs do Google para solicitar acesso a dados precisam seguir estas etapas para concluir a verificação de marca:

Confirme se o app não se enquadra em nenhum dos casos de uso na seção Exceções aos requisitos de verificação.
Verifique se o app está em conformidade com os requisitos de marca das APIs ou do produto associado. Por exemplo, consulte as diretrizes de marca para escopos do Login do Google.
Verifique a propriedade dos domínios autorizados do projeto no Google Search Console. Use uma Conta do Google associada ao projeto do Console de API como proprietário ou editor.
Verifique se todas as informações de marca na tela de permissão OAuth, como nome do app, e-mail de suporte, URI da página inicial, URI da Política de Privacidade etc., representam com precisão a identidade do app.
Requisitos da página inicial do aplicativo

Verifique se a página inicial atende aos seguintes requisitos:

A página inicial precisa ser acessível publicamente, e não apenas para usuários conectados ao site.
A relevância da página inicial para o app em análise precisa ser clara.
Links para a página Detalhes do app na Google Play Store ou na página do Facebook não são considerados páginas iniciais de aplicativos válidas.
Requisitos de link da Política de Privacidade do aplicativo

Verifique se a Política de Privacidade do app atende aos seguintes requisitos:

A Política de Privacidade precisa estar visível para os usuários, hospedada no mesmo domínio da página inicial do aplicativo e vinculada à tela de permissão OAuth do Console de API do Google. A página inicial precisa incluir uma descrição da funcionalidade do app, bem como links para a Política de Privacidade e os Termos de Serviço opcionais.
A Política de Privacidade precisa divulgar a maneira como o aplicativo acessa, usa, armazena ou compartilha dados do usuário do Google. The privacy policy must comply with the Google API Services User Data Policy and the Limited Use requirements for restricted scopes. Você precisa limitar o uso de dados do usuário do Google às práticas divulgadas na Política de Privacidade publicada.
* Review example cases of privacy policies that don't meet the Limited Use requirements.
Como enviar o app para verificação de marca

Um projeto do Console do Google Cloud organiza todos os recursos do Cloud Console. Um projeto consiste em um conjunto de Contas do Google associadas que têm permissão para realizar operações de projeto, um conjunto de APIs ativadas e configurações de faturamento, autenticação e monitoramento dessas APIs. Por exemplo, um projeto pode conter um ou mais clientes OAuth, configurar APIs para uso por esses clientes e configurar uma tela de permissão OAuth que é mostrada aos usuários antes que eles autorizem o acesso ao app.

Se algum dos clientes OAuth não estiver pronto para produção, sugerimos que você os exclua do projeto que está solicitando a verificação. É possível fazer isso na página "Clientes".

Para enviar para verificação, siga estas etapas:

Verifique se o app obedece aos Termos de Serviço das APIs do Google e à Política de dados do usuário dos serviços de API do Google.
Mantenha as funções de proprietário e editor das contas associadas do projeto atualizadas, bem como o e-mail de suporte ao usuário e as informações de contato do desenvolvedor da tela de permissão OAuth no Cloud Console. Isso garante que os membros corretos da equipe sejam notificados sobre novos requisitos.
Acesse a página de marca do OAuth do Cloud Console Branding page.
Clique no botão Seletor de projetos.
Na caixa de diálogo Selecionar a partir de que aparece, selecione seu projeto. Se você não encontrar o projeto, mas souber o ID do projeto, poderá criar um URL no navegador neste formato:
https://console.developers.google.com/auth/branding?project=[PROJECT_ID]
Substitua [PROJECT_ID] pelo ID do projeto que você quer usar.
Na página Marca , forneça as informações de marca do app, incluindo nome, logotipo, informações de contato do desenvolvedor e links relevantes. Todas as mudanças feitas são salvas como Marca de rascunho.
Clique no botão Verificar marca para iniciar o processo de avaliação. A análise automatizada geralmente é concluída em alguns minutos.
Observação:as modificações de marca não são permitidas enquanto a verificação está em andamento. Para fazer mudanças de marca, primeiro cancele qualquer verificação em andamento clicando no botão Cancelar.
Depois que a avaliação for concluída, revise o status. Se for bem-sucedido, o status mudará para Pronto para publicação. Se a verificação automatizada falhar, você poderá conferir os problemas detectados e corrigi-los ou solicitar uma análise manual.
Clique no botão Publicar marca para ativar a nova marca.
Observação:os resultados de verificação em conformidade são válidos por 7 dias. Se você não publicar dentro desse período, o status vai mudar para Necessário verificar novamente e você terá que executar a verificação de marca novamente.
Se o app também exigir verificação para escopos sensíveis ou restritos, acesse a Central de verificação do OAuth para acompanhar o status de acesso aos dados e fornecer outras informações solicitadas, como um vídeo de demonstração. É necessário ter um status de marca publicado antes de solicitar a verificação para acesso a dados.
Use o botão Adicionar ou remover escopos para declarar todos os escopos solicitados pelo app. Um conjunto inicial de escopos necessários para o Login do Google é preenchido previamente na seção Escopos não sensíveis. Os escopos adicionados são classificados como não sensíveis, sensitive, or restricted .
Forneça até três links para qualquer documentação relevante de recursos relacionados no app.
Forneça outras informações solicitadas sobre o app nas etapas seguintes. 1. Ensure your app complies with the Additional requirements for specific API scopes, which includes undergoing an annual security assessment if your app accesses restricted scope Google users' data from or through a third-party server. 2. Ensure your app is one of the allowed types specified in the Limited Use section of the Additional requirements for specific API scopes page. 3. If your app is a task automation platform, your demonstration video must showcase how multiple API workflows are created and automated, and in which directions user data flows. 4. Prepare a video that fully demonstrates how a user initiates and grants access to the requested scopes and shows, in detail, the usage of the granted sensitive and restricted scopes in the app. Upload the video to YouTube Studio and set Visibility as Unlisted. You need to provide a link to the demonstration video in the YouTube link field. 1. Show the OAuth grant process that users will experience, in English. This includes the consent flow and, if you use Google Sign-In, the sign-in flow. 2. Show that the OAuth consent screen correctly displays the App Name. 3. Show that the browser address bar of the OAuth consent screen correctly includes your app's OAuth client ID. 4. To show how the data will be used, demonstrate the functionality that's enabled by each sensitive and restricted scope that you request. 5. If you use multiple clients, and therefore have multiple OAuth client IDs, show how the data is accessed on each OAuth client. 5. Select your permitted application type from the "What features will you use?" list. 6. Describe how you will use the restricted scopes in your app and why more limited scopes aren't sufficient.

Depois de publicar a marca ou enviar uma solicitação de acesso a dados, a equipe de confiabilidade e segurança do Google poderá entrar em contato por e-mail com outras informações necessárias ou etapas que você precisa concluir. Verifique seus endereços de e-mail na seção Informações de contato do desenvolvedor e o e-mail de suporte da tela de permissão OAuth para solicitações de outras informações. Você também pode conferir as páginas de marca ou da Central de verificação do projeto para confirmar o status atual da análise, incluindo se o processo de análise está pausado enquanto aguardamos sua resposta.

Exceções aos requisitos de verificação

Se o app for usado em um dos cenários descritos nas seções a seguir, não será necessário enviá-lo para análise.

Uso pessoal

Um caso de uso é se você for o único usuário do app ou se ele for usado por apenas alguns usuários, todos conhecidos pessoalmente. Você e seu número limitado de usuários podem avançar pela tela de aplicativo não verificado e conceder às suas contas pessoais acesso ao app.

**Observação** :um limite de usuários restringe o número de Contas do Google que podem conceder acesso ao app não verificado.
Projetos usados em níveis de desenvolvimento, teste ou preparação

Para obedecer às políticas do OAuth 2.0 do Google, recomendamos que você tenha projetos diferentes para ambientes de teste e produção. Recomendamos que você só envie o app para verificação se quiser disponibilizá-lo para qualquer usuário com uma Conta do Google. Portanto, se o app estiver nas fases de desenvolvimento, teste ou preparação, a verificação não será necessária.

Se o app estiver nas fases de desenvolvimento ou teste, você poderá deixar o status de publicação na configuração padrão de Teste. Essa configuração significa que o app ainda está em desenvolvimento e só está disponível para os usuários que você adicionar à lista de usuários de teste. É necessário gerenciar a lista de Contas do Google envolvidas no desenvolvimento ou teste do app.

Observação: o app ainda está sujeito a uma tela de aviso do testador, conforme mostrado na figura 1, um limite de usuários está em vigor e o tempo de vida do token de atualização é limitado.
Figura 1. Tela de aviso do testador
Somente dados de serviço

Se o app usar uma conta de serviço para acessar apenas os próprios dados e não acessar dados do usuário (vinculados a uma Conta do Google), não será necessário enviar para verificação.

Para entender o que são contas de serviço, consulte Contas de serviço na documentação do Google Cloud. Para instruções sobre como usar uma conta de serviço, consulte Como usar o OAuth 2.0 para aplicativos de servidor para servidor.

Somente para uso interno

Isso significa que o app é usado apenas por pessoas na sua organização do Google Workspace ou do Cloud Identity organization. O projeto precisa ser de propriedade da organização, e a tela de permissão OAuth precisa ser configurada para um tipo de usuário Interno. Nesse caso, o app pode precisar da aprovação de um administrador da organização. Para mais informações, consulte Considerações adicionais para o Google Workspace.

Saiba mais sobre aplicativos públicos e internos.
Saiba como marcar seu aplicativo como interno nas Perguntas frequentes Como posso marcar meu aplicativo como somente para uso interno?
Instalação em todo o domínio

Se você planeja que o app seja destinado apenas a usuários de uma organização do Google Workspace ou do Cloud Identity e sempre use a instalação em todo o domínio, o app não vai exigir a verificação de marca. No entanto, se o app usar escopos restritos ou sensíveis, a verificação de apps será necessária. Isso ocorre porque uma instalação em todo o domínio permite que um administrador de domínio conceda a aplicativos internos e de terceiros acesso aos dados dos usuários. Os administradores da organização são as únicas contas que podem adicionar o app a uma lista de permissões para uso nos domínios.

Saiba como fazer do seu app uma instalação em todo o domínio nas Perguntas frequentes Meu aplicativo tem usuários com contas corporativas de outro domínio do Google Workspace.

Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-09-11 UTC.