---
titulo: "Google Ads API — token de desenvolvedor"
url: https://developers.google.com/google-ads/api/docs/get-started/dev-token?hl=pt-br
capturado_em: 2026-09-07
hash: 1e0e147edb467310
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Token de desenvolvedor
**Importante** :um token de desenvolvedor é um pré-requisito para fazer chamadas da API Google Ads.

O token de desenvolvedor é uma string alfanumérica de 22 caracteres que permite que seu app se conecte à API Google Ads. Você pode receber um token ao se inscrever na página Central de API da sua conta de administrador do Google Ads. Sempre que você faz uma chamada de API, o token de desenvolvedor é enviado como parte da solicitação, definindo o cabeçalho developer-token http ou gRPC.

Cada token de desenvolvedor recebe um nível de acesso que controla o número de chamadas de API que você pode fazer por dia com o token, bem como o ambiente para o qual você pode fazer chamadas.

Ao se inscrever em um token de desenvolvedor, você pode receber o nível de acesso Explorador por padrão. Isso permite que você faça chamadas para contas de produção, mas com algumas restrições. Em alguns casos em que não é possível analisar sua inscrição de token de desenvolvedor automaticamente, podemos conceder ao token um nível de acesso de conta de teste. Isso permite que você faça chamadas de API apenas para contas de teste. Para remover as restrições dos níveis de acesso de explorador e conta de teste, você precisa solicitar o nível de acesso básico ou padrão para seu token de desenvolvedor. Depois que sua inscrição de token de desenvolvedor for analisada e aprovada, o token de desenvolvedor receberá o nível de acesso adequado.

Você precisa de um novo token de desenvolvedor?

Se você deve se inscrever em um novo token de desenvolvedor ou não, depende de alguns fatores. Veja algumas situações comuns:

Cenário
	
Próximas etapas

Sua empresa nunca usou a API Google Ads e você quer desenvolver seus próprios apps	Inscreva-se em um novo token de desenvolvedor. Saiba mais
Sua empresa usa ou já usou a API Google Ads	O Google geralmente concede um token de desenvolvedor por empresa. Portanto, se sua empresa já usa a API Google Ads, reutilize o token de desenvolvedor atual . Saiba mais
Sua empresa já usa a API Google Ads, mas também está desenvolvendo um novo produto ou ferramenta	Se você tiver certeza de que não pode usar o token de desenvolvedor atual, então você pode se inscrever para um novo explicando seu caso de uso na inscrição. Para o restante deste guia, você pode usar o token de desenvolvedor atual. Saiba mais
Sua empresa usa um app de terceiros	Você só precisa de um token de desenvolvedor se estiver desenvolvendo seu próprio app. Se você usa um app de terceiros ou serviço, o desenvolvedor desse app precisa receber um token de desenvolvedor para o app. Se você não tiver certeza sobre seu caso, entre em contato com a equipe de conformidade da API.
Quem pode se inscrever em um token de desenvolvedor?

Empresas e desenvolvedores individuais podem se inscrever em um token de desenvolvedor. A tabela a seguir resume os detalhes que você precisa fornecer ao se inscrever no token de desenvolvedor.

Se você for	Forneça os seguintes detalhes do desenvolvedor	Outras observações
Um desenvolvedor que representa sua empresa ou uma equipe de produto	O nome da empresa e o URL da sua empresa	O Google geralmente concede um token de desenvolvedor por empresa, mas aprova tokens de desenvolvedor separados para ferramentas separadas caso a caso.
Um desenvolvedor individual que não representa uma empresa	Especifique o nome da empresa como Individual. Você pode fornecer URLs alternativos, como o URL do seu perfil do GitHub ou do LinkedIn, URL em vez de um URL da empresa.	Você precisa de alguma forma de presença on-line e precisa fornecer ao Google um URL que nos ajude a avaliar o que você planeja fazer com a API Google Ads. URLs genéricos como test.com e example.com não são aceitos.
Como se inscrever em um token de desenvolvedor

Há duas etapas ao se inscrever em um token de desenvolvedor.

Etapa 1: selecionar ou criar uma conta de administrador do Google Ads

Se você já tiver uma conta de administrador do Google Ads, selecione-a ao se inscrever no token de desenvolvedor. Se essa conta de administrador ainda não estiver vinculada às suas outras contas, recomendamos colocá-la na raiz da hierarquia de contas para facilitar o processo de análise do token e simplificar o gerenciamento de contas mais tarde.

Se você não tiver uma conta de administrador, siga as instruções da Central de Ajuda para criar uma.

**Observação**: você precisa usar um endereço de e-mail que ainda não tenha sido associado a uma conta do Google Ads para criar sua conta de administrador.
Etapa 2: inscrever-se para acessar a Google Ads API

O processo de análise do token de desenvolvedor pode levar algum tempo para ser concluído. Saiba mais.

Acesse https://ads.google.com/aw/apicenter no navegador da Web. Faça login na sua conta de administrador do Google Ads, se solicitado.

Acessar a Central de API

Preencha o formulário de acesso à API e aceite os Termos e Condições.

Verifique se suas informações estão corretas e se o URL do site da sua empresa está funcionando. Se o site não estiver ativo, o Google poderá não processar sua inscrição e rejeitá-la.

Verifique se o e-mail de contato da API que você fornece leva a uma caixa de entrada monitorada regularmente. A equipe de conformidade da API do Google poderá entrar em contato com esse endereço de e-mail durante o processo de análise para esclarecimentos. Se não for possível entrar em contato com você, o Google poderá não continuar com sua inscrição.

Você pode editar seu e-mail de contato da API na Central de API. Mantenha essas informações atualizadas, mesmo após o processo de inscrição, para que o Google possa enviar anúncios de serviço importantes.

Depois de concluir o processo de inscrição, o token de desenvolvedor aparece na Central de API com um dos seguintes resultados:

Seu token de desenvolvedor tem o nível de acesso de explorador com um status aprovado. Isso significa que o Google conseguiu analisar e aprovar automaticamente sua inscrição de token de desenvolvedor para o nível de acesso de explorador. Você pode começar a fazer chamadas de API para sua conta de produção ou conta de teste.
Seu token de desenvolvedor tem o nível de acesso de conta de teste com um status de aprovação pendente. Isso significa que o Google não conseguiu analisar e aprovar automaticamente sua inscrição de token de desenvolvedor para o nível de acesso de explorador. Você pode começar a fazer chamadas de API para contas de teste. Depois de concluir este guia, recomendamos que você confira como se inscrever no nível de acesso básico
Verificar se você fez login em uma conta de administrador do Google Ads

Você precisa fazer login na sua conta de administrador do Google Ads para acessar o token de desenvolvedor, e não pode ser uma conta de administrador de teste do Google Ads.

Para verificar se você fez login na conta de administrador do Google Ads, siga estas etapas:

Acesse https://ads.google.com/aw/apicenter no navegador da Web.

Se você estiver conectado a uma conta de cliente, a página vai mostrar A Central de API está disponível apenas para contas de administrador.

Se a conta de teste aparecer em vermelho no canto superior direito, sua conta será de administrador de teste ou de anunciante de teste.

Onde encontrar seu token de desenvolvedor

Você pode encontrar o token de desenvolvedor, se ele existir, na página Central de API da sua conta de administrador do Google Ads.

Acessar a Central de API

Avançar
Níveis de acesso e uso permitido
Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-08-03 UTC.