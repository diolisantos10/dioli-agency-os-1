---
titulo: "Instagram — webhooks (campos e assinatura)"
url: https://developers.facebook.com/documentation/instagram-platform/webhooks
capturado_em: 2026-09-09
hash: 7ac5ea84a580c7ab
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Configurar assinaturas de Webhooks
Updated: 3 de mar de 2026
Copiar para LLM
Ver como Markdown
Este documento mostra como criar um ponto de extremidade no seu servidor para receber notificações de webhook da Meta e assinar os campos de webhook de uma conta profissional do Instagram usando seu app. Isso permite que você receba notificações em tempo real quando alguém comentar nos objetos de mídia da conta profissional do Instagram que usa seu app, @mencionar os usuários do app, quando os stories dos usuários do app expirarem ou quando um usuário do Instagram enviar uma mensagem para a conta profissional do Instagram em questão.
Etapas
Estas são as etapas necessárias para receber notificações de webhook:
Etapa 1.Crie um ponto de extremidade no seu servidor para receber webhooks da Meta
Verificar as solicitações da Meta (no Painel de Apps da Meta).
Aceitar e validar cargas JSON da Meta – ocorre no seu servidor.
Etapa 2. Inscrever o app nos campos de webhook – ocorre no Painel de Apps da Meta
Etapa 3: Permitir que a conta profissional do Instagram do usuário do seu app receba notificações por meio de uma chamada de API à Meta
Etapa 4: Envie uma mensagem à sua conta profissional do Instagram para testar a configuração.
Exemplo de app no GitHub
Fornecemos um exemplo de app no GitHub⁠ que é implementado no Heroku⁠. Você pode configurá-lo e reutilizá-lo ou usá-lo para testar rapidamente a configuração do seu Webhooks.
Confira os requisitos:
Uma conta gratuita do Heroku
A chave secreta do app, que pode ser encontrada no Painel de Apps da Meta em Configurações do app > Básico
Um token de verificação, que é uma string. Nas configurações do app no Heroku, insira duas variáveis de configuração: APP_SECRET e TOKEN. Defina APP_SECRET como a chave secreta do app e TOKEN como sua senha. Nós incluiremos essa string em todas as solicitações de verificação quando você configurar o produto Webhooks no Painel de Aplicativos (o aplicativo validará a solicitação automaticamente).
Veja o seu aplicativo Heroku em um navegador da web. Você verá uma matriz vazia ([]). A página mostrará dados de notificação de atualização recém-recebidos. Por isso, recarregue a página durante todo o teste.
O URL de retorno de chamada do app será o URL do app no Heroku com /facebook no final. Essa URL de retorno de chamada será necessária durante a configuração do produto.
Copie o valor TOKEN escolhido acima, pois você também precisará dele durante a configuração do produto.
O que inclui o exemplo de app do Heroku?
O aplicativo usa o Node.js e os seguintes pacotes:
body-parser (para análise de JSON)
express (para rotas)
express-x-hub (para suporte a SHA1)
Como verificar o exemplo do aplicativo
É fácil verificar se o exemplo de aplicativo pode receber eventos de webhook.
No Painel de Aplicativos, no produto Webhooks, clique no botão Teste em qualquer um dos campos de webhook.
Um diálogo pop-up aparecerá mostrando um exemplo do que será enviado. Clique em Enviar para o meu servidor.
Você verá as informações de Webhook na URL do app no Heroku ou usando curl https://<your-subdomain>.herokuapp.com em uma janela de terminal.
Requisitos
Você precisará do seguinte:
Seu app precisa estar definido como Publicado no Painel de Apps para que a Meta envie notificações de webhook.
Componente	Login de Empresa no Instagram	Login do Facebook para Empresas	Mensagens do Instagram na plataforma do Messenger

Nível de acesso
	
Acesso avançado
	
Advanced Access para comments e live_comments
	
Acesso avançado

Tokens de acesso
	
Token de acesso do usuário do Instagram
	
Token de acesso à Página ou do usuário do Facebook
	
Token de acesso do usuário ou da Página do Facebook

Verificação da empresa
	
Obrigatório.
	
Obrigatório.
	
Obrigatório.

URL base
	
graph.instagram.com
	
graph.facebook.com
	
graph.facebook.com

Pontos de extremidade
	
/<INSTAGRAM_ACCOUNT_ID> ou /me: representa a conta profissional do usuário do app no Instagram.
	
/<PAGE_ID> ou /me: representa a Página do Facebook vinculada à conta profissional do usuário do Instagram.
	
/<PAGE_ID> ou /me: representa a Página do Facebook vinculada à conta profissional do usuário do Instagram.

IDs
	
A identificação da conta profissional do Instagram do usuário do seu app
	
O ID da Página do Facebook vinculada à conta profissional do Instagram do usuário do seu app
	
O ID da Página do Facebook vinculada à conta profissional do Instagram do usuário do seu app

Permissão básica
	
instagram_business_basic
	
instagram_basic
	
instagram_basic

Permissões específicas do campo
	
Consulte a tabela de campos do Instagram.
	
Consulte a tabela de campos do Instagram.
	
Consulte a tabela de campos do Instagram.
Limitações
Os apps precisam estar definidos como publicados no Painel de Aplicativos para receber notificações de webhooks.
É necessário ter Advanced Access para receber notificações de webhook comments e live_comments.
A conta profissional do Instagram que possui os objetos de mídia deve ser pública para receber notificações de comentários ou @menções.⁠
As notificações de comentários em mídia ao vivo são enviadas somente durante a transmissão.
Não há compatibilidade com a personalização de webhooks no nível da conta. Se o usuário tiver assinado qualquer campo de webhook do Instagram, o app receberá notificações sobre todos os campos assinados.
As identificações de álbuns não são incluídas nas notificações de webhook. Use o ID do comentário recebido na notificação para obter o ID do álbum.
A identificação do anúncio não será retornada para mídias usadas em anúncios dinâmicos.
As notificações de eventos story_insights mostrarão apenas as métricas das primeiras 24 horas, antes da expiração do story, mesmo se ele for um destaque.
Criar um ponto de extremidade
É preciso concluir essa etapa para assinar campos de webhook no Painel de Apps.
Seu ponto de extremidade deve processar dois tipos de solicitação HTTPS: solicitações de verificação e notificações de evento. Como as duas solicitações usam HTTPS, o servidor deve ter um certificado TLS ou SSL válido configurado e instalado corretamente. Os certificados autoatribuídos não são suportados.
As seções abaixo explicam qual o conteúdo de cada tipo de solicitação e como responder a elas. Como alternativa, use o nosso exemplo de app que já está configurado para processar essas solicitações.
Solicitações de verificação
Enviaremos uma solicitação GET para o URL do ponto de extremidade sempre que você configurar o produto Webhooks no Painel de Apps. As solicitações de verificação incluirão os seguintes parâmetros da string de consulta, anexados ao final do URL do ponto de extremidade. Elas serão assim:
Exemplo de solicitação de verificação
GET https://www.your-clever-domain-name.com/webhooks?
  hub.mode=subscribe&
  hub.challenge=1158201444&
  hub.verify_token=meatyhamhock

Parâmetro	Exemplo de valor	Descrição

hub.mode
	
subscribe
	
Esse valor será sempre definido como subscribe.

hub.challenge
	
1158201444
	
Um int que você deve retornar para nós.

hub.verify_token
	
meatyhamhock
	
Uma string recuperada no campo Verificar token no Painel de Apps. Você definirá essa string quando concluir as etapas de configuração do Webhooks.
Observação:o PHP converte pontos (.) em sublinhados (_) nos nomes dos parâmetros⁠.
Como validar as solicitações de verificação
Sempre que seu ponto de extremidade receber uma solicitação de verificação, você deverá:
Verificar se o valor hub.verify_token corresponde à string definida no campo Verificar token quando você configura o produto Webhooks no Painel de Apps (você ainda não configurou essa string do token).
responder com o valor hub.challenge.
Se você estiver no Painel de Apps e configurar o produto Webhooks (e isso acionará uma solicitação de verificação), o painel indicará se o ponto de extremidade validou a solicitação corretamente. Se você usar o ponto de extremidade /app/subscriptions da Graph API para configurar o produto Webhooks, a API indicará sucesso ou falha com uma resposta.
Notificações de eventos
Na configuração do produto Webhooks, você se inscreverá em fields específicos em um tipo object (por exemplo, o campo photos no objeto user). Sempre que houver uma mudança em um desses campos, enviaremos uma solicitação POST para seu ponto de extremidade com uma carga JSON descrevendo a alteração.
Por exemplo, se você assinar o campo photos do objeto user e um dos usuários do app tiver publicado uma foto, enviaremos a você uma solicitação POST semelhante a:
POST / HTTPS/1.1
Host: your-clever-domain-name.com/webhooks
Content-Type: application/json
X-Hub-Signature-256: sha256={super-long-SHA256-signature}
Content-Length: 311

{
  "entry": [
    {
      "time": 1520383571,
      "changes": [
        {
          "field": "photos",
          "value":
            {
              "verb": "update",
              "object_id": "10211885744794461"
            }
        }
      ],
      "id": "10210299214172187",
      "uid": "10210299214172187"
    }
  ],
  "object": "user"
}

Conteúdo da carga
As cargas conterão um objeto descrevendo a mudança. Ao configurar o produto Webhooks, você pode indicar se as cargas devem conter somente os nomes dos campos alterados ou se elas devem incluir também os novos valores.
Como formatamos todas as cargas com JSON, é possível analisar a carga usando métodos ou pacotes comuns de análise de JSON.
Não será possível consultar dados de notificações referentes a eventos históricos de webhook. Por isso, capture e armazene o conteúdo de todas as cargas de webhook que você deseja manter.
A maioria das cargas conterá as propriedades comuns descritas a seguir, mas o conteúdo e a estrutura de cada carga variam dependendo dos campos do objeto em que você está inscrito. Consulte o documento de referência de cada objeto para ver quais campos serão incluídos.
Propriedade	Descrição	Tipo

object
	
O tipo do objeto (por exemplo, user, page e assim por diante).
	
string

entry
	
Uma matriz contendo um objeto que descreve as alterações. Várias alterações de objetos diferentes, mas que são do mesmo tipo, podem ser agrupadas em lote.
	
array

id
	
O ID do objeto.
	
string

changed_fields
	
Uma matriz de strings indicando os nomes dos campos que foram alterados. Ela será incluída somente se você desabilitar a configuração Incluir valores ao configurar o produto Webhooks no Painel de Apps.
	
array

changes
	
Uma matriz contendo um objeto que descreve os campos alterados e os seus novos valores. Ela será incluída somente se você habilitar a configuração Incluir valores ao configurar o produto Webhooks no Painel de Apps.
	
array

time
	
Um registro de data e hora do UNIX indicando quando a notificação do evento foi enviada (não quando ocorreu a alteração que acionou a notificação).
	
int
Como validar cargas
Nós assinamos todas as cargas de notificação de eventos com uma assinatura SHA256 e a incluímos no cabeçalho X-Hub-Signature-256 da solicitação, precedida por sha256=. A validação de carga não é obrigatória. No entanto, é recomendada.
Para validar a carga:
gere uma assinatura SHA256 usando a carga e a chave secreta do app;
compare sua assinatura com a do cabeçalho X-Hub-Signature-256 (tudo que aparece após sha256=). Se as assinaturas coincidirem, a carga será verdadeira.
Como responder a notificações de eventos
Seu ponto de extremidade deve responder a todas as notificações de eventos com 200 OK HTTPS.
Frequência
Notificações de eventos são agregadas e enviadas em um lote com no máximo 1.000 atualizações. No entanto, a criação de lotes não pode ser garantida. Por isso, ajuste os seus servidores para lidar com cada Webhook individualmente.
Se uma atualização enviada para o servidor falhar, tentaremos outra vez imediatamente e depois mais algumas vezes, diminuindo a frequência nas 36 horas seguintes. Seu servidor deverá lidar com a desduplicação nesses casos. As respostas não reconhecidas serão retiradas após 36 horas.
Observação: a frequência de envio das notificações de eventos do Messenger é diferente. Consulte a documentação sobre Webhooks na plataforma do Messenger para obter mais informações.
Habilitar assinaturas
Para habilitar assinaturas, o app precisa enviar uma solicitação POST ao ponto de extremidade /me/subscribed_apps com o parâmetro subscribed_fields definido como uma lista separada por vírgulas de campos de webhooks.
Sintaxe da solicitação
Texto formatado para facilitar a leitura.
POST /me/subscribed_apps
  ?subscribed_fields=<LIST_OF_WEBHOOK_FIELDS>
  &<ACCESS_TOKEN>
Parâmetros da solicitação
Espaço reservado do valor	Descrição do valor

/me
	
Representa a identificação da conta profissional do Instagram do usuário do seu app ou a identificação da Página do Facebook vinculada à conta profissional do Instagram do usuário do app.

<ACCESS_TOKEN>
	
O token de acesso do usuário do Instagram ou o token de acesso à Página do Facebook do usuário do app.

<LIST_OF_WEBHOOK_FIELDS>
	
Uma lista separada por vírgulas de campos de webhook que foram assinados pelo seu app.
Exemplo de solicitação
Texto formatado para facilitar a leitura.
curl -i -X POST \
  "https://graph.instagram.com/v26.0/1755847768034402/subscribed_apps
  ?subscribed_fields=comments,messages
  &access_token=EAAFB..."
Em caso de sucesso, o app receberá uma resposta JSON com success definido como true.
{
  "success": true
}

Assinar campos de webhook
Assine os campos a seguir para receber notificações sobre eventos que ocorrem no Instagram.
Campo de webhook do Instagram
	Configuração da API do Instagram com permissões de Login do Instagram	Configuração da API do Instagram com permissões de Login do Facebook	Permissões da API de Mensagens do Instagram (plataforma do Messenger)

comments
	
instagram_business_basic
instagram_business_manage_comments
	
instagram_basic
instagram_manage_comments
pages_manage_metadata
pages_read_engagement
pages_show_list
	
x

live_comments
	
instagram_business_basic
instagram_business_manage_comments
	
instagram_basic
instagram_manage_comments
pages_manage_metadata
pages_read_engagement
pages_show_list
	
x

mentions
	
Incluído na notificação de webhook comments
	
instagram_basic
instagram_manage_comments
pages_manage_metadata
pages_read_engagement
pages_show_list
	
x

message_echoes
	
instagram_business_basic
instagram_business_manage_comments
	
x
	
Incluído na notificação de webhook messages

message_reactions
	
instagram_business_basic
instagram_business_manage_messages
	
x
	
instagram_basic
instagram_manage_messages
pages_manage_metadata
pages_read_engagement
pages_show_list

messages
	
instagram_business_basic
instagram_business_manage_messages
	
x
	
instagram_basic
instagram_manage_messages
pages_manage_metadata
pages_read_engagement
pages_show_list

messaging_handover
	
instagram_business_basic
instagram_business_manage_messages
	
x
	
instagram_basic
instagram_manage_messages
pages_manage_metadata
pages_read_engagement
pages_show_list

messaging_optins
	
instagram_business_basic
instagram_business_manage_messages
	
x
	
x

messaging_policy_enforcement
	
x
	
x
	
instagram_basic
instagram_manage_messages
pages_manage_metadata
pages_read_engagement
pages_show_list

messaging_postbacks
	
instagram_business_basic
instagram_business_manage_messages
	
x
	
instagram_basic
instagram_manage_messages
pages_manage_metadata
pages_read_engagement
pages_show_list

messaging_referral
	
instagram_business_basic
instagram_business_manage_messages
	
x
	
instagram_basic
instagram_manage_messages
pages_manage_metadata
pages_read_engagement
pages_show_list

messaging_seen
	
instagram_business_basic
instagram_business_manage_messages
	
x
	
instagram_basic
instagram_manage_messages
pages_manage_metadata
pages_read_engagement
pages_show_list

response_feedback
	
x
	
x
	
instagram_basic
instagram_manage_messages
pages_manage_metadata
pages_read_engagement
pages_show_list

standby
	
instagram_business_basic
instagram_business_manage_messages
	
x
	
instagram_basic
instagram_manage_messages
pages_manage_metadata
pages_read_engagement
pages_show_list

story_insights
	
x
	
instagram_basic
instagram_manage_insights
pages_manage_metadata
pages_read_engagement
pages_show_list
	
x
mTLS para Webhooks
Mutual TLS (mTLS) é um método para autenticação mútua.
O mTLS verifica se as partes em cada extremidade de uma conexão de rede têm a chave privada correta para confirmar que elas são quem dizem ser. As informações nos respectivos certificados TLS fornecem uma verificação adicional.
Como configurar o mTLS
Depois que você habilitar o mTLS na sua assinatura da conta do WhatsApp Business, a Meta apresentará um certificado de cliente com o certificado de intermediário assinante. Ambos os certificados são usados para criar um handshake do TLS de solicitações de webhook para seu servidor. Seu servidor poderá então verificar a identidade do remetente dessas solicitações por meio da cadeia de confiança e do nome comum (CN, na sigla em inglês).
O certificado do cliente é assinado por uma autoridade de certificação (CA) da Meta. Configure o servidor ou o balanceador de carga para confiar no certificado da CA da API de saída da Meta (meta-outbound-api-ca-2025-12.pem). Esse documento substitui o certificado anterior assinado pela DigiCert, que expirou em 15 de abril de 2026.
Verificação de certificado de cliente
Depois de configurar o HTTPS para receber solicitações de Webhook, conclua as seguintes etapas a fim de verificar o certificado do cliente e seu nome comum client.webhooks.fbclientcerts.com :
Instalar o certificado da CA da API de saída da Meta
Verificar o certificado do cliente em relação ao certificado da CA
Verificar o nome comum (client.webhooks.fbclientcerts.com) do certificado do cliente
Observação: os servidores que recebem Webhooks devem estar usando HTTPS. Verificamos a segurança do nosso servidor de HTTPS constantemente.
Exemplo
Dependendo da configuração do seu servidor, os detalhes das etapas acima podem variar. Ilustramos com dois exemplos, um para Nginx e um para Application Load Balancer (ALB) da AWS.
Nginx
Baixe o certificado da CA da API de saída da Meta (meta-outbound-api-ca-2025-12.pem) no seu servidor, por exemplo, /etc/ssl/certs/meta-outbound-api-ca-2025-12.pem.
Ative o mTLS por diretivas do Nginx.
ssl_verify_client          on;
ssl_client_certificate     /etc/ssl/certs/meta-outbound-api-ca-2025-12.pem;
ssl_verify_depth           3;
Verifique se o CN da variável incorporada ao Nginx $ssl_client_s_dn é igual a "client.webhooks.fbclientcerts.com" (
if ($ssl_client_s_dn ~ "CN=client.webhooks.fbclientcerts.com") {
     return 200 "$ssl_client_s_dn";
}
Application Load Balancer (ALB) da AWS
Baixe o certificado da CA da API de saída da Meta (meta-outbound-api-ca-2025-12.pem) para um bucket do S3.
Configure o ouvinte HTTPS na ALB para habilitar o mTLS com o armazenamento de confiança contendo o certificado da CA da Meta no bucket do S3.
No código do app, extraia o CN do cabeçalho HTTP “X-Amzn-Mtls-Clientcert-Subject”⁠ e verifique se ele é igual a "client.webhooks.fbclientcerts.com".
Certificado da CA para download
meta-outbound-api-ca-2025-12.pem
Configuração do teste
Envie uma mensagem de teste à sua conta profissional do Instagram (a conta pública adicionada no Painel de Apps da Meta para testes). Isso deve disparar um evento de webhook messages. A notificação deve conter a recipient.id, definida como a identificação no escopo do Instagram da sua conta profissional do Instagram, além das propriedades is_echo e is_self, ambas definidas como true, na matriz messaging.
Envie uma resposta ao ID no escopo do Instagram usando a API.
Próximas etapas
Saiba como enviar e receber mensagens de contas profissionais do Instagram
Veja também
Webhooks da Meta | Documentação para desenvolvedores
Você achou esta página útil?