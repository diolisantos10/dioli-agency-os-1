---
titulo: "Google Identity — verificação de escopos restritos"
url: https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification?hl=pt-br
capturado_em: 2026-09-10
hash: 1f4a7eac1b8f5279
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
Requisitos do link da Política de Privacidade do aplicativo
Como enviar seu app para verificação de marca

Algumas APIs do Google (as que aceitam escopos sensíveis ou restritos) têm requisitos para apps que buscam permissão para acessar dados do consumidor. Esses requisitos adicionais para escopos restritos exigem que um app demonstre ser um tipo de aplicativo permitido e se submeta a outras análises, incluindo uma possível avaliação de segurança.

A aplicabilidade dos escopos restritos em uma API depende principalmente do grau de acesso necessário para fornecer um recurso relevante no seu app: somente leitura, somente gravação, leitura e gravação etc.

Quando você usa o OAuth 2.0 para receber permissão de uma Conta do Google para acessar esses dados, usa strings chamadas escopos para especificar o tipo de dados que quer acessar e o nível de acesso necessário. Se o app solicitar escopos sensíveis ou restritos, é necessário concluir o processo de verificação, a menos que o uso do app se qualifique para uma exceção.

Os escopos restritos são menos numerosos em comparação com os sensíveis. As perguntas frequentes sobre a verificação da API OAuth contêm a lista atual de escopos sensíveis e restritos. Esses escopos fornecem amplo acesso aos dados do usuário do Google e exigem que você passe por um processo de verificação de escopo antes de solicitar os escopos de qualquer Conta do Google. Para mais informações sobre esse requisito, consulte a Política de dados do usuário dos serviços da API do Google e os Requisitos adicionais para escopos de API específicos ou a página do Google Developers específica do produto. Se você armazenar ou transmitir dados de escopo restrito em servidores, será necessário concluir uma avaliação de segurança.

Entender os escopos restritos

Se o app solicitar escopos restritos e não se qualificar para uma exceção, você precisará atender aos requisitos adicionais para escopos de API específicos da Política de dados do usuário dos Serviços de API do Google ou aos requisitos específicos do produto na página do Google Developers do produto, que exige um processo de revisão mais extenso.

Entender o uso do escopo
Revise os escopos que seu app usa ou que você quer usar. Para encontrar seu uso de escopo atual, examine o código-fonte do app para ver se há escopos enviados com solicitações de autorização.
Determine que cada escopo solicitado é necessário para as ações pretendidas do recurso do app e usa o menor privilégio necessário para fornecer o recurso. Normalmente, uma API do Google tem documentação de referência na página do Google Developers do produto para os endpoints, incluindo o escopo necessário para chamar o endpoint ou propriedades específicas nele. Para mais informações sobre os escopos de acesso necessários para os endpoints de API chamados pelo app, leia a documentação de referência desses endpoints. For example, for an app that only uses Gmail APIs to occasionally send emails on a user's behalf, don't request the scope that provides full access to the user's email data.
Os dados recebidos de uma API do Google só podem ser usados em conformidade com as políticas da API e da maneira que você representa aos usuários nas ações do app e na sua Política de Privacidade.
Consulte a documentação da API para saber mais sobre cada escopo, incluindo o possível status .
Declare todos os escopos usados pelo app na página de acesso a dados do console do Cloud. Os escopos especificados são agrupados em categorias sensíveis ou restritas para destacar qualquer verificação adicional necessária.
Encontre o melhor escopo que corresponda aos dados usados pela sua integração, entenda o uso deles, reconfirme que tudo ainda funciona em um ambiente de teste e se prepare para enviar para verificação.

Considere o tempo necessário para concluir a verificação no seu plano de lançamento do app ou de novos recursos que exigem um novo escopo. Um desses requisitos adicionais ocorre se o app acessa ou tem a capacidade de acessar dados do usuário do Google de ou por um servidor. Nesses casos, o sistema precisa passar por uma avaliação de segurança anual feita por um avaliador independente terceirizado aprovado pelo Google. Por isso, o processo de verificação de escopos restritos pode levar várias semanas para ser concluído. Todos os apps precisam concluir primeiro a etapa de verificação da marca, que geralmente leva de dois a três dias úteis, se as informações de marca mudaram desde a última verificação aprovada da tela de consentimento OAuth.

Tipos de aplicativos permitidos

Alguns tipos de aplicativos podem acessar escopos restritos para cada produto. Você pode encontrar os tipos de aplicativos na página do Google Developers específica do produto (por exemplo, a política da API do Gmail).

É sua responsabilidade entender e determinar o tipo de aplicativo. No entanto, se você não tiver certeza sobre o tipo de aplicativo, não selecione nenhuma opção na pergunta Quais recursos você vai usar? ao enviar o app para verificação. A equipe de verificação da API do Google vai determinar o tipo de aplicativo.

Security assessment

Todos os apps que solicitam acesso aos dados restritos dos usuários do Google e podem acessar dados de ou por um servidor de terceiros precisam passar por uma avaliação de segurança realizada por painéis de avaliadores do Google. Essa avaliação ajuda a manter os dados dos usuários do Google seguros, verificando se todos os apps que acessam dados de usuários do Google demonstram capacidade de processar dados com segurança e excluir dados do usuário mediante solicitação.

Para padronizar nossa avaliação de segurança, usamos a App Defense Alliance e o framework de avaliação de segurança de aplicativos na nuvem (CASA).

Como mencionado anteriormente, para manter o acesso a qualquer escopo restrito verificado, os apps precisam ser verificados novamente para conformidade e passar por uma avaliação de segurança pelo menos a cada 12 meses após a data de aprovação da Carta de Avaliação (LOA) do seu avaliador. Se o app adicionar um novo escopo restrito, talvez seja necessário reavaliá-lo para incluir o escopo adicional, caso ele não tenha sido incluído em uma avaliação de segurança anterior.

A equipe de revisão do Google envia um e-mail quando é hora de recertificar seu app. Para garantir que os membros certos da sua equipe sejam notificados sobre essa aplicação anual, associe outras Contas do Google ao projeto do Cloud Console como proprietário ou editor. Também é importante manter atualizados os e-mails de suporte ao usuário e de contato do desenvolvedor especificados na página de branding do OAuth do Console do Google Cloud.

Etapas para se preparar para a verificação

Todos os apps que usam APIs do Google para solicitar acesso a dados precisam seguir estas etapas para concluir a verificação de marca:

Confirme se o app não se enquadra em nenhum dos casos de uso na seção Exceções aos requisitos de verificação.
Verifique se o app está em conformidade com os requisitos de marca das APIs ou do produto associado. Por exemplo, consulte as diretrizes de marca para escopos do Login do Google.
Verifique a propriedade dos domínios autorizados do seu projeto no Google Search Console. Use uma Conta do Google associada ao seu projeto do Console de APIs como proprietário ou editor.
Verifique se todas as informações de marca na tela de permissão do OAuth, como nome do app, e-mail de suporte, URI da página inicial, URI da Política de Privacidade etc., representam com precisão a identidade do app.
Requisitos da página inicial do aplicativo

Verifique se a página inicial atende aos seguintes requisitos:

Sua página inicial precisa estar acessível publicamente, e não apenas para usuários conectados do site.
A relevância da página inicial para o app em revisão precisa ser clara.
Links para a página de detalhes do app na Google Play Store ou na página do Facebook não são considerados páginas iniciais de aplicativos válidas.
Requisitos do link da Política de Privacidade do aplicativo

Verifique se a Política de Privacidade do app atende aos seguintes requisitos:

A política de privacidade precisa estar visível para os usuários, hospedada no mesmo domínio da página inicial do aplicativo e vinculada à tela de permissão OAuth do Console de APIs do Google. A página inicial precisa incluir uma descrição da funcionalidade do app, além de links para a Política de Privacidade e os Termos de Serviço opcionais.
A Política de Privacidade precisa divulgar como o aplicativo acessa, usa, armazena ou compartilha dados do usuário do Google. The privacy policy must comply with the Google API Services User Data Policy and the Limited Use requirements for restricted scopes. Você precisa limitar o uso dos dados do usuário do Google às práticas divulgadas na sua Política de Privacidade publicada.
Review example cases of privacy policies that don't meet the Limited Use requirements.

Como enviar seu app para verificação de marca

Um projeto do Console do Google Cloud organiza todos os seus recursos do Console do Cloud. Um projeto consiste em um conjunto de Contas do Google associadas que têm permissão para realizar operações de projeto, um conjunto de APIs ativadas e configurações de faturamento, autenticação e monitoramento dessas APIs. Por exemplo, um projeto pode conter um ou mais clientes OAuth, configurar APIs para uso por esses clientes e configurar uma tela de permissão OAuth que é mostrada aos usuários antes que eles autorizem o acesso ao seu app.

Se algum dos seus clientes OAuth não estiver pronto para produção, exclua-o do projeto que está solicitando a verificação. Isso pode ser feito na página "Clientes".

Para enviar para verificação, siga estas etapas:

Verifique se o app obedece aos Termos de Serviço das APIs do Google e à Política de dados do usuário dos serviços de API do Google.
Mantenha atualizadas as funções de proprietário e editor das contas associadas ao projeto, bem como o e-mail de suporte ao usuário e as informações de contato do desenvolvedor da tela de consentimento do OAuth no console do Cloud. Assim, os membros certos da sua equipe serão notificados sobre novos requisitos.
Acesse a página de branding do OAuth no console do Cloud.
Clique no botão Seletor de projetos.

Na caixa de diálogo Selecionar de, escolha seu projeto. Se você não encontrar seu projeto, mas souber o ID do projeto, crie um URL no navegador no seguinte formato:

https://console.developers.google.com/auth/branding?project=[PROJECT_ID]

Substitua [PROJECT_ID] pelo ID do projeto que você quer usar.

Na página Branding, forneça as informações de branding do app, incluindo nome, logotipo, dados de contato do desenvolvedor e links relevantes. Todas as mudanças feitas são salvas como Marca em rascunho.
Clique no botão Verificar branding para iniciar o processo de avaliação. A análise automática geralmente é concluída em alguns minutos.
Observação:não é permitido fazer modificações na marca enquanto a verificação está em andamento. Para fazer mudanças na marca, primeiro cancele qualquer verificação em andamento clicando no botão Cancelar.
Quando a avaliação for concluída, revise o status. Se for bem-sucedido, o status mudará para Pronto para publicação. Se a verificação automática falhar, você poderá ver os problemas detectados e corrigi-los ou pedir uma revisão manual.
Clique no botão Publicar branding para ativar o novo branding.
Observação:os resultados da verificação de conformidade são válidos por sete dias. Se você não publicar nesse período, o status vai mudar para Precisa verificar novamente, e você terá que fazer a verificação de marca outra vez.

Se o app também precisar de verificação para escopos sensíveis ou restritos, acesse a Central de verificação do OAuth para acompanhar o Status de acesso aos dados e fornecer outras informações solicitadas, como um vídeo de demonstração. Você precisa ter um status de marca publicado antes de solicitar a verificação para acesso a dados.

Use o botão Adicionar ou remover escopos para declarar todos os escopos solicitados pelo app. Um conjunto inicial de escopos necessários para o Login do Google é preenchido previamente na seção Escopos não sensíveis. Os escopos adicionados são classificados como não sensíveis, <a href="/identity/protocols/oauth2/production-readiness/sensitive-scope-verification"

sensitive, or restricted.

Forneça até três links para documentação relevante de recursos relacionados no seu app.

Forneça as informações adicionais solicitadas sobre seu app nas etapas seguintes.

Ensure your app complies with the Additional requirements for specific API scopes, which includes undergoing an annual security assessment if your app accesses restricted scope Google users' data from or through a third-party server.
Ensure your app is one of the allowed types specified in the Limited Use section of the Additional requirements for specific API scopes page.
If your app is a task automation platform, your demonstration video must showcase how multiple API workflows are created and automated, and in which directions user data flows.

Prepare a video that fully demonstrates how a user initiates and grants access to the requested scopes and shows, in detail, the usage of the granted sensitive and restricted scopes in the app. Upload the video to YouTube Studio and set Visibility as Unlisted. You need to provide a link to the demonstration video in the YouTube link field.

Show the OAuth grant process that users will experience, in English. This includes the consent flow and, if you use Google Sign-In, the sign-in flow.
Show that the OAuth consent screen correctly displays the App Name.
Show that the browser address bar of the OAuth consent screen correctly includes your app's OAuth client ID.
To show how the data will be used, demonstrate the functionality that's enabled by each sensitive and restricted scope that you request.
If you use multiple clients, and therefore have multiple OAuth client IDs, show how the data is accessed on each OAuth client.
Select your permitted application type from the "What features will you use?" list.
Describe how you will use the restricted scopes in your app and why more limited scopes aren't sufficient.

Depois que você publicar sua marca ou enviar uma solicitação de acesso a dados, a equipe de confiabilidade e segurança do Google poderá entrar em contato por e-mail com outras informações necessárias ou etapas que você precisa concluir. Verifique seus endereços de e-mail na seção Informações de contato do desenvolvedor e o e-mail de suporte da tela de permissão do OAuth para solicitações de mais informações. Você também pode acessar as páginas "Branding" ou "Central de verificação" do projeto para confirmar o status atual da análise, incluindo se o processo de revisão está pausado enquanto aguardamos sua resposta.

Exceções aos requisitos de verificação

Se o app for usado em algum dos cenários descritos nas seções a seguir, não será necessário enviá-lo para revisão.

Uso pessoal

Um caso de uso é se você for o único usuário do app ou se ele for usado por apenas alguns usuários, todos conhecidos pessoalmente por você. Você e seu número limitado de usuários podem se sentir à vontade para avançar na tela de app não verificado e conceder às suas contas pessoais acesso ao app.

Observação:um limite de usuários restringe o número de Contas do Google que podem conceder acesso ao seu app não verificado.
Projetos usados nas camadas de desenvolvimento, teste ou staging

Para cumprir as políticas do Google OAuth 2.0, recomendamos que você tenha projetos diferentes para ambientes de teste e produção. Recomendamos que você envie o app para verificação apenas se quiser disponibilizá-lo para qualquer usuário com uma Conta do Google. Portanto, se o app estiver nas fases de desenvolvimento, teste ou preparação, a verificação não será necessária.

Se o app estiver nas fases de desenvolvimento ou teste, deixe o Status de publicação na configuração padrão de Teste. Essa configuração significa que o app ainda está em desenvolvimento e só está disponível para os usuários que você adicionou à lista de usuários de teste. Você precisa gerenciar a lista de Contas do Google envolvidas no desenvolvimento ou teste do seu app.

Observação:seu app ainda está sujeito a uma tela de aviso para testadores, como mostrado na figura 1, um limite de usuários está em vigor, e o tempo de vida do token de atualização é limitado.
Figura 1. Tela de aviso para testadores
Somente dados de propriedade do serviço

Se o app usa uma conta de serviço para acessar apenas os próprios dados e não acessa dados do usuário (vinculados a uma Conta do Google), não é necessário enviar para verificação.

Para entender o que são contas de serviço, consulte Contas de serviço na documentação do Google Cloud. Para instruções sobre como usar uma conta de serviço, consulte Como usar o OAuth 2.0 para aplicativos de servidor para servidor.

Somente para uso interno

Isso significa que o app é usado apenas por pessoas na sua organização do Google Workspace ou do Cloud Identity. O projeto precisa ser da organização, e a tela de permissão do OAuth precisa ser configurada para um tipo de usuário interno. Nesse caso, talvez seja necessário ter a aprovação de um administrador da organização. Para mais informações, consulte Considerações adicionais para o Google Workspace.

Saiba mais sobre aplicativos públicos e internos.
Saiba como marcar seu app como interno nas Perguntas frequentes Como posso marcar meu app como somente para uso interno?
Instalação em todo o domínio

Se você planeja que seu app tenha como público-alvo apenas usuários de uma organização do Google Workspace ou do Cloud Identity e sempre use a instalação em todo o domínio, ele não vai precisar de verificação de marca. No entanto, se o app usar escopos restritos ou sensíveis, será necessário fazer a verificação de apps. Isso acontece porque uma instalação em todo o domínio permite que um administrador do domínio conceda a apps internos e de terceiros acesso aos dados dos usuários. Somente administradores da organização podem adicionar o app a uma lista de permissões para uso nos domínios deles.

Saiba como fazer do seu app uma instalação em todo o domínio nas perguntas frequentes Meu aplicativo tem usuários com contas corporativas de outro domínio do Google Workspace.

Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-07-18 UTC.