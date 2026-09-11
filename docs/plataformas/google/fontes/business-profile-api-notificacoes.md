---
titulo: "Business Profile APIs — notificações via Pub/Sub"
url: https://developers.google.com/my-business/content/notification-setup?hl=pt-br
capturado_em: 2026-09-11
hash: 3a594bf90d0b5e09
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Gerenciar as notificações em tempo real
Nesta página
Antes de começar
Configuração do Cloud Pub/Sub
Recuperar as configurações de notificação
Atualizar as configurações de notificação
Excluir as configurações de notificação

Na API My Business Notifications, as notificações são publicadas no serviço Cloud Pub/Sub. Depois de configurar o Cloud Pub/Sub e criar um tópico, é possível realizar as seguintes operações nas notificações:

Recuperar as configurações de notificação
Atualizar as configurações de notificação
Excluir as configurações de notificação

São compatíveis: avaliações novas ou atualizadas, perguntas e respostas, uploads de mídia, atualizações do Google para revisão, alterações do status do local e muito mais. O objeto NotificationType lista e descreve os tipos de notificação disponíveis.

Antes de começar

Para usar a API My Business Notifications, registre seu aplicativo e receba as credenciais do OAuth 2.0. Veja detalhes para começar a usar a API em Configuração básica.

Configuração do Cloud Pub/Sub

Para configurar notificações de API com o Cloud Pub/Sub, siga estas etapas:

Veja o guia do Cloud Pub/Sub para configurar seu aplicativo.
Crie um tópico no projeto do Cloud Pub/Sub e anote o nome atribuído a ele.
Conceda pelo menos as permissões pubsub.topics.publish a mybusiness-api-pubsub@system.gserviceaccount.com.
Siga o guia Visão geral do assinante para configurar as notificações push ou pull.
Para receber notificações, chame o endpoint accounts.updateNotificationSetting na API My Business Notifications. Na chamada, use o nome do tópico que você criou no Cloud Pub/Sub para vincular sua conta do Perfil da Empresa a ele.
(Opcional) Repita a etapa 5 para cada conta do Perfil da empresa sobre a qual você quer receber notificações.
Recuperar as configurações de notificação

O endpoint accounts.getNotificationSetting retorna as configurações de notificação atuais do Cloud Pub/Sub de uma conta. Veja como chamá-lo na tabela a seguir:

HTTP
GET
https://mybusinessnotifications.googleapis.com/v1/accounts/{accountId}/notificationSetting

Atualizar as configurações de notificação

O endpoint accounts.updateNotificationSetting atualiza as configurações de notificação do Cloud Pub/Sub associadas a uma conta. Veja como chamá-lo na tabela a seguir:

HTTP
PATCH
https://mybusinessnotifications.googleapis.com/v1/accounts/{accountId}/notificationSetting?updateMask={commaSeparatedFieldsToUpdate}

{
  pubsubTopic: your/pubsub/topicName
}

Excluir as configurações de notificação

Chamar o accounts.updateNotificationSetting com um pubsubTopic vazio exclui as configurações de notificação do Cloud Pub/Sub de uma conta. Veja como chamá-lo na tabela a seguir:

HTTP
PATCH
https://mybusinessnotifications.googleapis.com/v1/accounts/{accountId}/notificationSetting?updateMask=pubsubTopic

Isso foi útil?

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2025-08-29 UTC.