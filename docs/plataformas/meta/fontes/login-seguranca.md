---
titulo: "Facebook Login — segurança (proteção de token, boas práticas)"
url: https://developers.facebook.com/documentation/facebook-login/security
capturado_em: 2026-09-10
hash: fb4538886b8694c7
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Segurança no login
Updated: 30 de jun de 2026
Copiar para LLM
Ver como Markdown
Os recursos do Login do Facebook, como tokens de acesso e permissões, tornam o uso seguro e protegido para pessoas e apps. No entanto, há algumas etapas de segurança que os apps precisam implementar.
Lista de verificação de segurança
Chave secreta do app
Proteger chamadas do lado do servidor com appsecret_proof
Proteger chamadas do lado do cliente com tokens de curto prazo e fluxo de código
Roubo de token
Verificar regularmente a validade do token de acesso
Parâmetro de estado
Habilitar o modo restrito
Usar HTTPS
Habilitar o Login do Facebook com o SDK para JavaScript
Como funciona a verificação do URI de redirecionamento
Bloquear as configurações do app do Facebook
Lista de verificação de segurança
A lista abaixo descreve os requisitos mínimos que todos os apps que usam o Login do Facebook devem implementar. Outros recursos serão exclusivos do seu app, e você precisará trabalhar de forma contínua para torná-lo o mais seguro possível. Os apps que não são seguros perdem a confiança do público. Consequentemente, as pessoas deixam de usá-los.
✅ Nunca inclua a chave secreta do app em código do lado do cliente ou em código descompilável.
✅ Assine todas as chamadas da Graph API de servidor para servidor com a chave secreta do app.
✅ Use tokens exclusivos de curto prazo em clientes.
✅ Não confie que os tokens de acesso que estão sendo usados pelo seu app foram realmente gerados por ele.
✅ Use o parâmetro de estado ao utilizar o diálogo Entrar.
✅ Use nossos SDKs oficiais sempre que possível.
✅ Reduza a área de superfície de ataque do seu app bloqueando as configurações do app do Facebook.
✅ Use HTTPS.
Chave secreta do app
A chave secreta do app é usada em alguns dos fluxos de login para gerar tokens de acesso. A própria chave secreta tem como objetivo garantir o uso do seu app apenas para aqueles que são confiáveis. Ela pode ser usada para criar facilmente um token de acesso do aplicativo que pode fazer solicitações de API em nome de qualquer usuário. Sendo assim, é extremamente importante que a chave secreta do aplicativo não seja comprometida.
Por isso, nunca inclua a chave secreta ou o token de acesso do app em um código.
Recomendamos que os tokens de acesso do app só sejam usados diretamente nos servidores do seu app para oferecer a melhor segurança. Para apps nativos, sugerimos que o app se comunique com o seu próprio servidor, e o servidor, depois, faça as solicitações de API para o Facebook usando o token de acesso do app. Por isso, se o "Tipo de app" nas Configurações avançadas do Painel de Apps estiver definido como Native/Desktop, é considerado que o app nativo contém a chave secreta do app ou um token de acesso no binário, e não serão permitidas chamadas assinadas com um token de acesso do app para prosseguir. A API se comportará como se não houvesse nenhum token de acesso.
Proteger chamadas do lado do servidor com appsecret_proof
Para reduzir sua exposição a malware e spammers, exija que as chamadas de servidor para servidor para a API do Facebook sejam assinadas com o parâmetro appsecret_proof. A comprovação de chave secreta do app é um hash sha256 do seu token de acesso, usando a sua chave secreta do app como a chave. É possível consultar a chave secreta do app no Painel de Apps, em Configurações > Básico.
Gerar a comprovação
O exemplo de código a seguir mostra a chamada em PHP:
$appsecret_proof= hash_hmac('sha256', $access_token.'|'.time(), $app_secret);
Alguns sistemas operacionais e linguagens de programação retornarão um registro de data e hora do tipo float. Faça a conversão para um número inteiro antes de calcular a prova da chave secreta do app. Além disso, algumas linguagens de programação criam o hash como um objeto digest. Nesse caso, expresse o hash na forma de um objeto hexadecimal.
Adicionar a comprovação
Adicione o resultado como um parâmetro appsecret_proof com o appsecret_time definido de acordo com o registro de data e hora usado no hash da chave secreta do app para cada chamada realizada:
curl \
  -F 'access_token=ACCESS-TOKEN' \
  -F 'appsecret_proof=APP-SECRET-PROOF' \
  -F 'appsecret_time=APP-SECRET-TIME' \
  -F 'batch=[{"method":"GET", "relative_url":"me"},{"method":"GET", "relative_url":"me/accounts"}]' \
  https://graph.facebook.com
As provas de chave secreta do app com registro de data e hora expirarão em 5 minutos. Por isso, recomendamos gerar uma nova prova in-line a cada chamada da Graph API.
Exigir a comprovação
Para habilitar a configuração Exigir chave secreta do app em todas as chamadas da API, acesse o Painel de Apps da Meta e clique em Configurações do app > Avançado no menu do lado esquerdo. Role até a seção Segurança e clique no botão Exigir chave secreta do app.
Se essa configuração estiver habilitada, todas as chamadas iniciadas pelo cliente devem ser transmitidas por proxy por meio do back-end, sendo que o parâmetro appsecret_proof pode ser adicionado à solicitação antes de enviá-la à Graph API para evitar falhas.
Proteger chamadas do lado do cliente com tokens de curto prazo e fluxo de código
Em algumas configurações, os apps reutilizarão um token de longo prazo entre vários clientes. Não faça isso. Em vez disso, use tokens de curto prazo gerados com o fluxo de código, conforme descrito em nossa documentação sobre o token de acesso.
Roubo de token
Para entender como isso acontece, imagine um app iOS nativo que quer fazer chamadas de API, mas, em vez de fazer isso diretamente, ele se comunica com um servidor de propriedade do mesmo app e passa para esse servidor um token gerado usando o SDK para iOS. Depois, o servidor utiliza o token para fazer chamadas de API.
O ponto de extremidade que o servidor utiliza para receber o token pode estar comprometido, e outros poderiam passar para ele tokens de acesso de apps completamente diferentes. Isso seria, obviamente, inseguro, mas há uma maneira de se proteger contra isso. Os tokens de acesso nunca devem ser considerados como sendo do app que está fazendo uso deles. Em vez disso, os tokens devem ser verificados com pontos de extremidade de depuração.
Verificar regularmente a validade do token de acesso
Caso você não use os SDKs do Facebook, verifique regularmente se o token de acesso está válido. Embora os tokens de acesso tenham expiração programada, isso pode acontecer antes, por motivos de segurança. Caso você não use os SDKs do Facebook no app, é essencial implementar manualmente verificações frequentes da validade do token, ao menos uma vez por dia. Isso é necessário para garantir que o app não dependa de um token que expirou mais cedo que o previsto por motivos de segurança.
Parâmetro de estado
Se você está usando o diálogo Entrar do Facebook no seu site, o parâmetro state é uma string única que protege o app de ataques de falsificação de solicitação entre sites⁠.
Habilitar o modo restrito
O modo restrito mantém os apps seguros evitando que agentes maliciosos roubem seu redirecionamento. O modo restrito é obrigatório para todos os apps.
Antes de ativar o modo restrito no Painel de Apps, certifique-se de que seu tráfego de redirecionamento atual ainda funciona executando as seguintes ações nas configurações de Login do Facebook:
Para apps com URIs de redirecionamento dinâmico, use o parâmetro de estado para transmitir de volta a informação dinâmica para um número limitado de URIs de redirecionamento. Adicione cada um dos URIs de redirecionamento limitado à lista de URIs de redirecionamento OAuth válidos.
Para apps com um número limitado de URIs de redirecionamento, adicione cada um deles à lista URIs de redirecionamento OAuth válidos.
Para apps que usam apenas o SDK do Facebook para JavaScript, o tráfego de redirecionamento já é protegido. Nenhuma ação é necessária.
Após realizar essas ações, habilite o modo restrito.
Como o modo restrito funciona
O modo restrito evita o sequestro dos seus URIs de redirecionamento exigindo uma correspondência exata da sua lista de URIs de redirecionamento OAuth válidos. Por exemplo, se a sua lista contiver www.example.com, o modo restrito não permitirá www.example.com/token como um redirecionamento válido. Ele também não permitirá parâmetros de consulta extras não presentes na sua lista de URIs de redirecionamento de OAuth válidos.
Usar HTTPS
Use HTTPS, em vez de HTTP, como um protocolo de internet, por ser criptografado. O HTTPS mantém os dados transmitidos privados e protege contra ataques de espionagem. Também evita que os dados sejam falsificados durante a transmissão, por exemplo, introduzindo anúncios ou código mal-intencionado.
A partir de 6 de outubro de 2018, todos os aplicativos serão obrigados a usar HTTPS.
Habilite o SDK para JavaScript para o Login do Facebook
Quando você indica que está usando o SDK para JavaScript para login ao ativar o Login com SDK para JavaScript, o domínio da página que hospeda o SDK precisa corresponder a uma das entradas na lista de Domínios permitidos para o SDK do JavaScript. Isso garante que os tokens de acesso façam o retorno de chamada apenas em domínios autorizados. Somente páginas HTTPS têm suporte para ações de autenticação com o SDK do Facebook para JavaScript.
Para as integrações de SDK for JavaScript criadas até 10 de agosto de 2021, a lista é preenchida com valores baseados no uso atual. Nenhuma ação é necessária.
Para integrações criadas a partir de 10 de agosto de 2021, adicione valores à lista.
Caso o campo de domínio do SDK para JavaScript do seu app contenha URLs que comecem com *., altere-o para que seja substituído por URLs de domínio absoluto a fim de garantir maior segurança.
Como funciona a verificação do URI de redirecionamento
Ataques de redirecionamento abertos ocorrem quando um agente malicioso fornece um parâmetro redirect_uri não autorizado na solicitação de login. Isso tem o potencial de vazar informações sensíveis, como um token de acesso, por meio de um fragmento ou da string de consulta no URI de redirecionamento.
Para integrações da web personalizadas, é necessário fornecer URIs de redirecionamento autorizados nas configurações do app para evitar ataques como esse. Ao preencher uma solicitação de login, o parâmetro redirect_uri será comparado com as entradas na lista. O URI completo deve ser uma correspondência exata, incluindo todos os parâmetros, com exceção do parâmetro opcional state, cujo valor é ignorado.
Navegadores no app e o SDK para JavaScript
Normalmente, o SDK para JavaScript depende de pop-ups e retornos de chamada para concluir um login. Para alguns navegadores no app que não aceitam pop-ups, isso pode não funcionar. Nesse caso, o SDK tentará fazer o redirecionamento automaticamente, com um token de acesso, para a página que o invocou. Ele só pode fazer esse redirecionamento com segurança se o URI completo da página estiver listado nos URIs de redirecionamento de OAuth válidos.
Se os cenários do navegador no app forem importantes para seu app da web, adicione o domínio da sua página de login aos domínios permitidos, bem como o URI completo dela (incluindo o caminho e os parâmetros de consulta) aos URIs de redirecionamento válidos. Se houver muitas variações nos URIs em que o login é feito no seu app, é possível especificar manualmente um fallback_redirect_uri como opção na chamada FB.login(). Dessa forma, será necessário adicionar somente essa entrada à sua lista de URIs de redirecionamento permitidos.
Bloquear as configurações do aplicativo do Facebook
Habilitar e/ou desabilitar qualquer fluxo de autenticação que não seja usado pelo app para minimizar a área de superfície de ataque.
Use tokens de acesso de curto prazo gerados pelo código em clientes, em vez de tokens gerados pelo cliente ou tokens de longo prazo fornecidos pelo servidor. O fluxo de tokens de acesso de curto prazo gerados por código exigem que o servidor do aplicativo troque o código de um token. Isso é mais seguro que a obtenção de um token no navegador. Os apps devem preferir usar esse fluxo sempre que possível para ser mais seguro. Se um app só permite esse fluxo, um malware em execução no computador do usuário não conseguirá obter um token de acesso para violar. Saiba mais na nossa documentação sobre tokens de acesso.
Desabilite o Login no OAuth do cliente caso seu app não o use. O Login do OAuth do Cliente é o botão liga/desliga global para usar os fluxos de token de cliente do OAuth. Se o app não usa qualquer fluxo OAuth do cliente, que inclui SDKs de Login no Facebook, você deve desabilitar esse fluxo. No entanto, não será possível solicitar permissões para um token de acesso se o login do cliente do OAuth estiver desabilitado. Essa definição pode ser encontrada na seção Produtos > Login do Facebook > Configurações do Painel de Apps.
Desabilite o fluxo do OAuth da web ou especifique uma lista de permissões de redirecionamento. Configurações do Login do OAuth na web permitem que qualquer fluxo de token de cliente do OAuth que use a caixa de diálogo Login do Facebook na web retorne tokens para seu próprio site. Essa definição pode ser encontrada na seção Produtos > Login do Facebook > Configurações do Painel de Apps. Desabilite essa configuração se você não estiver criando um fluxo de login personalizado na web ou usando o SDK de Login do Facebook na web.
Aplicar HTTPS. Essa configuração exige HTTPS para redirecionamentos de OAuth. As chamadas de SDK do JavaScript do Facebook que retornam ou exigem o token de acesso vêm apenas de páginas HTTPS. Todos os apps criados a partir de março de 2018 têm essa configuração ativada por padrão. Migre todos os apps existentes para usar somente URLs HTTPS até 6 de outubro de 2018. A maioria dos grandes hosts de aplicativos em nuvem fornecem a configuração automática e gratuita de certificados TLS para os seus aplicativos. Se você hospedar o próprio app ou se o serviço de hospedagem não oferecer HTTPs por padrão, será possível obter um certificado gratuito para seus domínios via Let’s Encrypt⁠.
Desabilite o fluxo do OAuth de navegador incorporado caso o app não o use. Alguns apps nativos para celular e para desktop autenticam os usuários, fazendo o fluxo de clientes do OAuth dentro de um modo webView incorporado. Caso seu app não faça isso, desabilite a configuração em Produtos > Login do Facebook > Configurações do Painel de Apps.
Desabilite os fluxos de login único para celular caso seu app não os use. Caso o app não use o Login do iOS ou do Android, desabilite as configurações de "Login único" nas seções correspondentes em Configurações > Básico.
O Painel de Apps contém diversas configurações adicionais que permitem aos desenvolvedores desativar áreas de ataque que poderiam gerar problemas de segurança:
Básico > Chave secreta do aplicativo se a chave secreta do app estiver comprometida, será possível redefini-la aqui.
Básico > Domínios do aplicativo: use para bloquear os domínios e subdomínios que podem ser utilizados para fazer o Login do Facebook em nome do seu app.
Avançado > Tipo de aplicativo ao criar um app nativo para celular ou desktop e incluir nele a chave secreta, defina-o como Native/Desktop para protegê-lo contra descompilações e roubo da chave.
Avançado > Lista de permissão de IP do servidor especifica uma lista de endereços IP que podem ser usados para fazer chamadas da Graph API usando a chave secreta do app. Chamadas da Graph API feitas com a chave secreta do app de fora deste intervalo falharão. As chamadas feitas com tokens de acesso de usuário não são afetadas por essa configuração.
Avançado > Atualizar a lista de liberação de IP das configurações bloqueia os endereços IP que podem ser usados para modificar essas configurações do app para um intervalo específico. Tenha cuidado ao definir uma lista de permissões de IP em banda larga residencial. Se o endereço IP for alterado, você não poderá mais editar as configurações do app.
Avançado > Atualizar email de notificação notifica um endereço de email sempre que qualquer configuração do app é alterada no Painel de Apps.
Avançado > Segurança do URL da publicação de stream: impede o app de publicar URLs que não apontam para um domínio que ele possui. Essa configuração nem sempre será útil, especialmente se você souber que o app publicará links para outros sites.
Você achou esta página útil?