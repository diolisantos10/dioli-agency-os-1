---
titulo: "Google Drive API — escopos de OAuth (drive.file, sensíveis, restritos)"
url: https://developers.google.com/workspace/drive/api/guides/api-specific-auth
capturado_em: 2026-09-06
hash: d30c1c0920f7ac45
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Escolher escopos da API Google Drive
Nesta página
Configurar o OAuth 2.0 para autorização
Escopos da API Drive
Escopos não confidenciais
Escopos confidenciais
Escopos restritos
Qualificações para escopos restritos
Migrar um app atual de escopos restritos
Benefícios do escopo de arquivo do Drive

Este documento contém informações de autorização e autenticação específicas da API Google Drive. Antes de ler este documento, leia as informações gerais de autenticação e autorização do Google Workspace em Saiba mais sobre autenticação e autorização.

Configurar o OAuth 2.0 para autorização

Para autorizar seu app, a API Google Drive exige que você defina escopos do OAuth em dois lugares: o console do Google Cloud e seu app.

No console do Google Cloud, declare os escopos de que seu app precisa na configuração da tela de permissão do OAuth. Essas são as permissões de nível mais alto que seu app pode solicitar. Isso serve como uma solicitação formal ao Google, e os escopos declarados são o que o Google mostra aos usuários na tela de permissão. Isso permite que o usuário entenda exatamente a quais dados e ações seu app está solicitando acesso.

Configure a tela de consentimento OAuth e escolha escopos para definir quais informações são mostradas aos usuários e revisores de apps, e registre seu app para poder publicá-lo mais tarde.

No seu app, ao iniciar a API, solicite explicitamente os escopos específicos necessários para essa sessão. Embora o console do Google Cloud defina o nível mais alto de permissões que seu app pode solicitar, o código determina as permissões reais para um determinado usuário. Isso ajuda a garantir que o app só peça as permissões necessárias para uma tarefa específica.

Você pode declarar um ou mais escopos do OAuth de cada vez no código do app como uma matriz.

O exemplo de código a seguir mostra como declarar vários escopos do OAuth:

Java
Python
Node.js
List<String> SCOPES = Arrays.asList(
  DriveScopes.DRIVE_FILE,
  DriveScopes.DRIVE_METADATA_READONLY
);

Para saber como os escopos são declarados e usados em um exemplo de código completo, consulte Inícios rápidos.

Escopos da API Drive

Para definir o nível de acesso concedido ao seu app, identifique e declare escopos de autorização. Um escopo de autorização é uma string de URI do OAuth 2.0 que contém o nome do app do Google Workspace, o tipo de dados que ele acessa e o nível de acesso. Os escopos são solicitações do seu app para trabalhar com dados do Google Workspace, incluindo dados da Conta do Google dos usuários.

Quando o app é instalado, o usuário precisa validar os escopos usados por ele. Em geral, escolha o escopo mais restrito possível e evite solicitar escopos que seu app não exige. Os usuários concedem acesso com mais facilidade a escopos limitados e claramente descritos.

Sempre que possível, use escopos não confidenciais, porque eles concedem acesso por arquivo e restringem o acesso a recursos específicos necessários para um app.

Se o aplicativo público usar escopos que permitam o acesso a determinados dados do usuário, ele precisará concluir um processo de verificação. Se você vir a mensagem app não verificado na tela ao testar o aplicativo, envie uma solicitação de verificação para remover a mensagem. Saiba mais sobre apps não verificados e encontre respostas para perguntas frequentes sobre a verificação de apps na Central de Ajuda.
Escopos não confidenciais

Os seguintes escopos da API Drive são recomendados para a maioria dos casos de uso:

Código do escopo	Descrição
https://www.googleapis.com/auth/drive.appdata
https://www.googleapis.com/auth/drive.appfolder	Ver e gerenciar os próprios dados de configuração do app no Google Drive.
https://www.googleapis.com/auth/drive.install	Permitir que os apps apareçam como uma opção no menu "Abrir com" ou "Novo".
https://www.googleapis.com/auth/drive.file	Criar novos arquivos do Drive ou modificar arquivos que você abre com um app ou que o usuário compartilha com um app ao usar a API Google Picker ou o seletor de arquivos do app.
Escopos confidenciais
Código do escopo	Descrição
https://www.googleapis.com/auth/drive.apps.readonly	Ver os apps autorizados a acessar seu Drive.
Escopos restritos
Código do escopo	Descrição
https://www.googleapis.com/auth/drive	Ver e gerenciar todos os arquivos do Drive.
https://www.googleapis.com/auth/drive.readonly	Ver e baixar todos os arquivos do Drive.
https://www.googleapis.com/auth/drive.activity	Ver e adicionar itens ao registro de atividades dos arquivos no Drive.
https://www.googleapis.com/auth/drive.activity.readonly	Ver o registro de atividades dos arquivos no Drive.
https://www.googleapis.com/auth/drive.meet.readonly	Acessar os arquivos do Drive criados ou editados pelo Google Meet.
https://www.googleapis.com/auth/drive.metadata	Ver e gerenciar metadados dos arquivos no Drive.
https://www.googleapis.com/auth/drive.metadata.readonly	Ver metadados de arquivos no Drive.
https://www.googleapis.com/auth/drive.scripts	Modificar o comportamento dos scripts do Google Apps Script.

Os escopos nas tabelas anteriores indicam a sensibilidade deles, de acordo com as seguintes definições:

Não sensíveis: esses escopos fornecem o menor escopo de autorização e exigem apenas a verificação básica do app OAuth Para mais informações, consulte Requisitos de verificação.

Sensíveis: esses escopos fornecem acesso a dados específicos do usuário do Google que os usuários autorizam para seu app. Eles exigem a verificação adicional do app OAuth. Para mais informações, consulte Requisitos de escopo sensível e restrito.

Restritos: esses escopos fornecem acesso amplo aos dados do usuário do Google e exigem a verificação do app OAuth de escopo restrito. Para mais informações, consulte Política de dados do usuário dos serviços da API do Google e Requisitos adicionais dos escopos específicos da API. Consulte também os Termos de Serviço do Google Drive.

Se você armazenar dados de escopo restrito em servidores (ou transmitir), será necessário passar por uma avaliação de segurança.

Se o app precisar de acesso a outras APIs do Google, adicione esses escopos também. Para mais informações sobre os escopos da API do Google, consulte Como usar o OAuth 2.0 para acessar as APIs do Google.

Para mais informações sobre escopos específicos do OAuth 2.0, consulte Escopos do OAuth 2.0 para APIs do Google.

Qualificações para escopos restritos

Somente tipos específicos de aplicativos podem usar escopos restritos para o Google Drive. Para se qualificar, seu app precisa se enquadrar em uma das seguintes categorias:

Backup e sincronização: apps específicos da plataforma e da Web que fornecem sincronização local ou backup automático dos arquivos do Drive dos usuários.

Produtividade e educação: apps com uma interface principal do usuário que pode envolver interação com arquivos, metadados ou permissões do Drive. Esses apps incluem gerenciamento de tarefas, anotações, comunicações de grupos de trabalho e colaboração em sala de aula.

Relatórios e segurança: apps que fornecem insights do usuário ou do cliente sobre como os arquivos são compartilhados ou acessados.

Para continuar usando escopos restritos, você deve preparar seu app para a verificação de escopo restrito.

Migrar um app atual de escopos restritos

Se o app do Drive usa escopos restritos, recomendamos migrar para um escopo não sensível da API Drive. O uso de escopos não sensíveis, como drive.file, concede acesso por arquivo e restrito a recursos específicos necessários para um app.

Muitos apps podem fazer a transição para o acesso por arquivo sem nenhuma mudança.

Se você estiver usando seu próprio seletor de arquivos, recomendamos mudar para a API Google Picker, que oferece suporte total a diferentes escopos.

Benefícios do escopo de arquivo do Drive

O uso do escopo do OAuth drive.file em combinação com a API Google Picker otimiza a experiência e a segurança do usuário para seu app.

O escopo do OAuth drive.file permite que os usuários escolham quais arquivos querem compartilhar com seu app. Isso oferece mais controle e confiança de que o acesso do app aos arquivos deles é limitado e mais seguro. Por outro lado, exigir acesso amplo a todos os arquivos do Drive pode desencorajar os usuários a interagir com seu app.

Confira alguns motivos para usar o escopo drive.file:

Usabilidade: o escopo drive.file funciona com todos os recursos REST da API Drive , o que significa que você pode usá-lo da mesma forma que usa escopos mais amplos do OAuth.

Recursos: a API Google Picker oferece uma interface semelhante à interface do Drive. Isso inclui várias visualizações mostrando prévias e miniaturas de arquivos do Drive, além de uma janela modal inline para que os usuários nunca saiam do app principal.

Conveniência: os apps podem aplicar filtros para determinados tipos de arquivo do Drive (como Google Docs, Planilhas e fotos) ao usar um filtro em arquivos do Google Picker.

Verificação simples: como drive.file não é sensível, ele permite um processo de verificação mais simplificado.

Armazenar tokens de atualização com segurança

Para acessar dados particulares usando a API Drive, seu app precisa receber um token de acesso que conceda acesso a essa API. Um único token de acesso pode conceder diferentes graus de acesso a várias APIs, regidos pelos escopos solicitados.

Como os tokens de acesso são de curta duração, use tokens de atualização para acesso de longo prazo à API Drive. Um token de atualização permite que seu app solicite novos tokens de acesso.

Salve tokens de atualização em armazenamento seguro e de longo prazo e continue usando-os enquanto eles permanecerem válidos.

Para mais informações, consulte Como usar o OAuth 2.0 para acessar as APIs do Google.

Temas relacionados
Para uma visão geral da autenticação e autorização no Google Workspace, consulte Saiba mais sobre autenticação e autorização.
Para uma visão geral da autenticação e autorização no Google Cloud, consulte Visão geral da autenticação.
Para saber mais sobre contas de serviço, consulte Contas de serviço.
Para receber ajuda com a solução de problemas, consulte Resolver erros.
Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-07-14 UTC.