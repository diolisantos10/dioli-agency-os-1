---
titulo: "WhatsApp Cloud API — webhooks (eventos de mensagem e status)"
url: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview
capturado_em: 2026-09-08
hash: b4e14b683157f74f
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
webhooks do WhatsApp
Updated: 26 de jun de 2026
Copiar para LLM
Ver como Markdown
Este documento descreve os webhooks e como eles são usados pela Plataforma do WhatsApp Business.
Os webhooks são pedidos HTTP com cargas JSON que os servidores da Meta enviam para um servidor indicado por você. A Plataforma do WhatsApp Business usa webhooks para informar você sobre mensagens recebidas, o status de mensagens enviadas, eventos de ligação e outras informações importantes, como alterações no status da conta, atualizações de recursos de mensagens e mudanças nas pontuações de qualidade de modelos.
Por exemplo, este é um webhook que descreve uma mensagem enviada por um usuário do WhatsApp para uma empresa:
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "102290129340398",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15550783881",
              "phone_number_id": "106540352242922"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Sheena Nelson"
                },
                "wa_id": "16505551234"
              }
            ],
            "messages": [
              {
                "from": "16505551234",
                "id": "wamid.HBgLMTY1MDM4Nzk0MzkVAgASGBQzQTRBNjU5OUFFRTAzODEwMTQ0RgA=",
                "timestamp": "1749416383",
                "type": "text",
                "text": {
                  "body": "Does it come in another color?"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}

Como criar um ponto de extremidade de webhook
Para receber webhooks, é preciso criar e configurar um ponto de extremidade de webhook. Para criar seu próprio ponto de extremidade, consulte o documento Como criar um ponto de extremidade de webhook.
Caso você ainda não queira criar seu próprio ponto de extremidade, é possível criar um ponto de extremidade de webhook de teste que registra as cargas do webhook no console. No entanto, antes de usar o app em ambiente de produção, você precisa criar seu próprio ponto de extremidade.
Permissões
Você precisa das seguintes permissões para receber webhooks:
whatsapp_business_messaging — para webhooks de mensagens e ligações
whatsapp_business_management: para todos os outros webhooks
Caso você seja um desenvolvedor direto, utilize o usuário do sistema para conceder essas permissões ao app ao gerar o token do sistema.
Caso seja um parceiro e precise dessas permissões para fornecer serviços adequados aos clientes, você deverá receber aprovação para acesso avançado às permissões por meio da Análise do App. Depois disso, os clientes comerciais poderão conceder essas permissões ao seu app durante a integração.
Campos
Depois de criar e configurar seu ponto de extremidade de webhook (ou de configurar um ponto de extremidade de webhook de teste), use o painel Painel de Apps > WhatsApp > Configuração para assinar campos específicos de webhook.
Se você criou o app usando o caso de uso Conectar-se com clientes pelo WhatsApp, navegue até Painel de Apps > Casos de uso > Personalizar > Configuração.
Nome do campo	Descrição

account_alerts
	
O webhook account_alerts notifica você sobre alterações no limite de mensagens, perfil empresarial e status da conta comercial oficial de um número de telefone comercial.

account_review_update
	
O webhook account_review_update envia uma notificação quando uma conta do WhatsApp Business é analisada em relação às nossas diretrizes de política.

account_update
	
O webhook account_update notifica sobre alterações no envio da verificação da empresa conduzida pelo parceiro de uma conta do WhatsApp Business, na qualificação para a taxa internacional de autenticação ou no ponto comercial principal, quando é compartilhado com um Parceiro de soluções, em caso de violações de políticas ou termos, integração, reconexão ou quando é excluída.

automatic_events
	
O webhook automatic_events envia uma notificação quando detectamos um evento de compra ou lead em uma conversa entre você e um usuário do WhatsApp que entrou em contato por meio do seu anúncio de clique para o WhatsApp, se você tiver aceitado a geração de relatórios de Eventos automáticos.

business_capability_update
	
O webhook business_capability_update notifica você sobre alterações de capacidade da conta do WhatsApp Business ou do portfólio empresarial (limites de mensagens, limites de número de telefone etc.).

calls
	
O webhook calls envia uma notificação sobre os eventos de ligações iniciadas pelo usuário e iniciadas pela empresa, como quando uma ligação é conectada ou encerrada.

history
	
O webhook history é usado para sincronizar o histórico de conversas do app WhatsApp Business de um cliente comercial integrado por um provedor de soluções.

message_template_components_update
	
O webhook message_template_components_update notifica você sobre as alterações nos componentes de um modelo.

message_template_quality_update
	
O webhook message_template_quality_update notifica você sobre alterações na pontuação de qualidade de um modelo.

message_template_status_update
	
O webhook message_template_status_update notifica você sobre as alterações no status de um modelo existente.

messages
	
O webhook messages descreve as mensagens enviadas de um usuário do WhatsApp para uma empresa, bem como o status das mensagens enviadas por uma empresa para um usuário do WhatsApp.

partner_solutions
	
O webhook partner_solutions descreve as alterações no status de uma solução multiparceiro.

payment_configuration_update
	
O webhook payment_configuration_update envia uma notificação sobre as alterações nas configurações de pagamento da API de Pagamentos Índia e da API de Pagamentos Brasil.

phone_number_name_update
	
O webhook phone_number_name_update notifica você sobre os resultados da verificação do nome de exibição do número de telefone comercial.

phone_number_quality_update
	
O webhook phone_number_quality_update fornece notificações sobre as alterações de nível de taxa de transferência de dados de um número de telefone comercial.

security
	
O webhook security notifica você sobre alterações nas configurações de segurança de um número de telefone comercial.

smb_app_state_sync
	
O webhook smb_app_state_sync é usado para sincronizar contatos de usuários do app WhatsApp Business que foram integrados por meio de um provedor de soluções.

smb_message_echoes
	
O webhook smb_message_echoes avisa você sobre as mensagens enviadas por meio do app WhatsApp Business ou um dispositivo adicional ("conectado") por um cliente comercial que fez a integração com a API de Nuvem por meio de um provedor de soluções.

template_category_update
	
O webhook template_category_update envia uma notificação sobre as alterações na categoria do modelo.

user_preferences
	
O webhook user_preferences notifica você sobre as alterações nas preferências de mensagens de marketing de um usuário do WhatsApp.
Como substituir webhooks
Você pode usar um ponto de extremidade de webhook alternativo para alguns campos de webhooks na sua conta do WhatsApp Business (WABA) ou número de telefone comercial. Um endpoint alternativo pode ser útil para fins de teste ou se você for um parceiro e quiser usar pontos de extremidade de webhook únicos para cada um dos seus clientes integrados.
Consulte o documento Substituições de webhook para saber como substituir webhooks.
Tamanho da carga
As cargas de webhook podem ter até 3 MB.
Falha na entrega do webhook
Se uma solicitação de webhook para seu endpoint receber um código de status HTTP diferente de 200 ou se o webhook não puder ser entregue por outro motivo, a Meta fará novas tentativas de entrega com frequência decrescente até que a solicitação seja concluída com sucesso por até 7 dias.
Essas tentativas serão enviadas a todos os apps que assinaram os webhooks (e os campos relacionados) na conta do WhatsApp Business. Essas novas tentativas podem fazer com que as notificações de webhook sejam duplicadas.
TLS mútuo
Os webhooks são compatíveis com o protocolo TLS mútuo (mTLS) para aumentar a segurança. Para saber como habilitar e usar o mTLS, consulte o documento mTLS para webhooks da Graph API.
Endereços IP
É possível receber endereços IP dos servidores de webhook da Meta executando este comando no seu terminal:
whois -h whois.radb.net — '-i origin AS32934' | grep '^route' | awk '{print $2}' | sort
Também é possível usar o feed geográfico para baixar um arquivo CSV⁠ com a lista de endereços IP da Meta.
No entanto, a Meta muda os endereços IP com frequência. Por isso, para não precisar gerar novamente sua lista de endereços IP permitidos, considere usar o mTLS.
Solução de problemas
Se você não estiver recebendo webhooks:
Verifique se o seu ponto de extremidade está aceitando pedidos.
Envie uma carga de teste ao ponto de extremidade pelo painel Painel de Apps > WhatsApp > Configurações.
Verifique se o app está no modo Live. Alguns webhooks não serão enviados se o app estiver no modo Dev.
Use nosso ponto de extremidade do webhook de teste. Se o ponto de extremidade de teste estiver processando cargas de webhook e exibindo-as no console, o problema provavelmente está no código do seu ponto de extremidade.
Saiba mais
Consulte o post de blog do WhatsApp Business Como usar o Node.js para implementar webhooks⁠.
Você achou esta página útil?