---
titulo: "WhatsApp Cloud API — envio de mensagens (janela de 24h, tipos)"
url: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages
capturado_em: 2026-09-07
hash: 6847330a042dd82f
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Mensagens de serviço
Updated: 21 de mai de 2026
Copiar para LLM
Ver como Markdown
As mensagens de serviço são mensagens em formato livre que você pode enviar aos usuários do WhatsApp durante uma janela de atendimento ao cliente. Você pode enviá-las usando a API de Mensagens (parte da API de Nuvem). Diferentemente das mensagens de modelo, as mensagens de serviço não exigem aprovação prévia. Você pode compor e enviá-las conforme necessário em resposta a uma mensagem ou ligação de um usuário do WhatsApp.
As mensagens de serviço só podem ser enviadas por meio da API de Mensagens. Para enviar mensagens a usuários do WhatsApp fora da janela de atendimento ao cliente, use mensagens de modelo. Consulte Mensagens de marketing, Mensagens de utilidade ou Mensagens de autenticação para saber mais sobre mensagens baseadas em modelos.
Janelas de atendimento ao cliente
Quando você recebe uma mensagem ou uma ligação de um usuário do WhatsApp, uma janela de atendimento de 24 horas é aberta. Se o usuário entrar em contato com você novamente antes que esse tempo acabar, o temporizador será redefinido para 24 horas.
Enquanto ela estiver aberta, você poderá enviar ao usuário qualquer um dos tipos de mensagens de serviço. Quando a janela for encerrada, você só poderá enviar mensagens de modelo pré-aprovadas.
Só é possível fazer envios a usuários que aceitaram receber suas mensagens.
Problema conhecido: em casos raros, talvez você receba uma mensagem de um usuário do WhatsApp, mas não consiga respondê-la dentro do prazo da janela de atendimento ao cliente.
Preços
As mensagens de serviço são cobradas de acordo com a categoria de preços SERVICE. Consulte Preços para saber mais.
Tipos de mensagens
É possível enviar os tipos de mensagens de serviço a seguir durante uma janela aberta de atendimento ao cliente.
As mensagens de endereço permitem que você solicite um endereço de entrega aos usuários do WhatsApp.

As mensagens de áudio mostram um ícone e um link para um arquivo de áudio. Quando o usuário do WhatsApp toca no ícone, o cliente do WhatsApp carrega e reproduz o arquivo.

As mensagens de contato permitem que você envie informações avançadas de contato diretamente aos usuários do WhatsApp, como nomes, números de telefone, endereços físicos e endereços de email.

As mensagens de documento exibem um ícone para o usuário do WhatsApp tocar e baixar um documento.

As mensagens de imagem exibem uma única imagem e uma legenda opcional.

As mensagens interativas com botão de URL de CTA permitem que você associe qualquer URL a um botão para não precisar incluir URLs inteiros que são longos e obscuros no corpo da mensagem.

As mensagens interativas de ligação de voz permitem que você acione ligações do WhatsApp a partir dos usuários.

As mensagens de fluxo interativas permitem enviar mensagens estruturadas mais naturais ou agradáveis para os clientes. Por exemplo, é possível usar o WhatsApp Flows para marcar um horário, navegar por produtos, coletar feedback dos clientes, captar novos leads de vendas ou qualquer outra ação.
Para saber mais, consulte a documentação do WhatsApp Flows.

As mensagens de lista interativas permitem apresentar uma lista de opções para escolha dos usuários do WhatsApp.

As mensagens interativas com pedido de localização exibem um corpo de texto e o botão de enviar localização. Quando o usuário do WhatsApp toca no botão, uma tela para compartilhar a localização é exibida, permitindo que ele faça o compartilhamento.

As mensagens interativas com botões de resposta permitem que você envie até três respostas predefinidas para o usuário escolher.

As mensagens de localização permitem que você envie as coordenadas de latitude e longitude de uma localização para um usuário do WhatsApp.

As mensagens de figurinhas exibem imagens animadas ou estáticas de figurinhas em uma mensagem do WhatsApp.

As mensagens de texto contêm apenas um corpo de texto e uma prévia de link opcional.

As mensagens de vídeo exibem uma prévia em miniatura de uma imagem de vídeo com uma legenda opcional. Quando o usuário do WhatsApp toca na prévia, o vídeo é carregado e exibido.

As mensagens de reação são reações com emoji que você pode aplicar a uma mensagem anterior recebida de um usuário do WhatsApp.
Qualidade da mensagem
O WhatsApp determina a qualidade das mensagens com base na forma como os usuários do WhatsApp receberam suas mensagens nos últimos 7 dias, ponderada pela mais recente. Baseia essa pontuação em sinais de feedback, que incluem bloqueios, denúncias, silenciamentos e arquivamentos, além dos motivos fornecidos pelos usuários quando bloqueiam sua empresa.
Diretrizes para o envio de mensagens de alta qualidade:
As mensagens devem seguir a Política de Mensagens do WhatsApp Business⁠.
Envie mensagens apenas a usuários do WhatsApp que aceitaram receber mensagens da sua empresa.
Crie mensagens altamente personalizadas e úteis para os usuários.
Evite enviar mensagens introdutórias ou de boas-vindas que sejam vagas demais.
Evite enviar muitas mensagens por dia.
Otimize suas mensagens em termos de conteúdo e tamanho.
O painel Gerenciador do WhatsApp⁠ > Ferramentas da conta > Números de telefone exibe o status, a classificação de qualidade⁠ e os limites de mensagens do número de telefone da sua empresa.
Números com alto tráfego geralmente passam por alterações na qualidade em intervalos curtos (até mesmo em minutos).
Solicitações
Todas as solicitações de envio de mensagem usam a API de Mensagens:
POST /<WHATSAPP_BUSINESS_PHONE_NUMBER_ID>/messages
O corpo do post varia conforme o tipo de mensagem que você deseja enviar, mas a carga usa a seguinte sintaxe comum:
{
  "messaging_product": "whatsapp",
  "recipient_type": "<RECIPIENT_TYPE>",
  "to": "<WHATSAPP_USER_PHONE_NUMBER>",
  "type": "<MESSAGE_TYPE>",
  "<MESSAGE_TYPE>": {<MESSAGE_CONTENTS>}
}
O valor da propriedade type na carga do corpo indica o tipo de mensagem a ser enviado. É necessário incluir uma propriedade correspondente a esse tipo que descreva o conteúdo da mensagem.
A propriedade recipient_type pode ser indivudal para mensagens individuais ou group para mensagens em grupo.
Para saber mais, consulte a documentação da API de Grupos.
Abaixo, há um pedido para enviar uma mensagem de texto a um usuário do WhatsApp. Observe que type é definido como text, e o objeto text descreve o conteúdo da mensagem:
curl 'https://graph.facebook.com/v26.0/106540352242922/messages' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer EAAJB...' \
-d '
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "+16505551234",
  "type": "text",
  "text": {
    "preview_url": true,
    "body": "As requested, here is the link to our latest product: https://www.meta.com/quest/quest-3/"
  }
}'
Se for entregue, a mensagem aparecerá assim no cliente do WhatsApp:
Respostas
A API de Mensagens retorna a resposta JSON a seguir ao aceitar o pedido de envio de mensagem. Essa resposta indica somente que a API aceitou a solicitação, ou seja, não indica a entrega da mensagem. Você receberá o status de entrega por meio de webhooks de mensagens.
Sintaxe da resposta
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "<WHATSAPP_USER_PHONE_NUMBER>",
      "wa_id": "<WHATSAPP_USER_ID>"
    }
  ],
  "messages": [
    {
      "id": "<WHATSAPP_MESSAGE_ID>",
      "group_id": "<GROUP_ID>", <!-- Only included if messaging a group -->
      "message_status": "<PACING_STATUS>" <!-- Only included if sending a template -->
    }
  ]
}
Conteúdo da resposta
Espaço reservado	Descrição	Exemplo de valor

<GROUP_ID>
String
	
O identificador de string de um grupo feito usando a API de Grupos.
Esse campo mostra quando as mensagens são enviadas, recebidas ou lidas em um grupo.
Saiba mais sobre a API de Grupos
	
Y2FwaV9ncm91cDoxNzA1NTU1MDEzOToxMjAzNjM0MDQ2OTQyMzM4MjAZD

<PACING_STATUS>
String
	
Indica o status de regularidade do modelo. A propriedade message_status é incluída nas respostas apenas quando você envia mensagens de um modelo que está sendo modificado por regularidade.
	
wamid.HBgLMTY0NjcwNDM1OTUVAgARGBI4MjZGRDA0OUE2OTQ3RkEyMzcA

<WHATSAPP_USER_PHONE_NUMBER>
String
	
O número de telefone do WhatsApp do usuário. Pode não corresponder ao valor wa_id.
	
+16505551234

<WHATSAPP_USER_ID>
String
	
Identificação do usuário do WhatsApp. Pode não corresponder ao valor input.
	
16505551234

<WHATSAPP_MESSAGE_ID>
String
	
A identificação da mensagem do WhatsApp. Essa identificação aparece em webhooks de mensagens associados, como webhooks de mensagens enviadas, lidas e entregues.
	
wamid.HBgLMTY0NjcwNDM1OTUVAgARGBI4MjZGRDA0OUE2OTQ3RkEyMzcA
Mensagens comerciais
As mensagens comerciais são mensagens interativas usadas em conjunto com um catálogo de produtos. Consulte o artigo Compartilhar produtos com clientes para saber como usar esses tipos de mensagem.
Confirmações de leitura
Para confirmar a leitura, você pode marcar uma mensagem como lida, exibindo dois tiques azuis (chamados de "confirmações de leitura") abaixo da mensagem do usuário do WhatsApp:
Indicadores de digitação
Caso você leve alguns segundos ou mais para responder a um usuário, será possível informar que a resposta está sendo elaborada usando o indicador de digitação e as confirmações de leitura no cliente do WhatsApp:
Respostas contextuais
Você pode enviar uma mensagem para um usuário do WhatsApp como uma resposta contextual, que cita uma mensagem anterior em um balão de contexto:
Dessa forma, fica mais fácil para o usuário saber a qual mensagem específica você está respondendo.
Webhooks
As mensagens enviadas a usuários do WhatsApp disparam webhooks de mensagens. Assine esse tópico para receber notificações relacionadas ao status de mensagens.
Formatos de número de telefone do usuário do WhatsApp
Os sinais de adição (+), hifens (-), parênteses ((,)) e espaços são compatíveis com os pedidos de envio de mensagem.
Recomendamos que você inclua o sinal de adição e o código de ligação do país ao enviar mensagens para os clientes. Se o sinal de adição for omitido, o código de ligação do país do seu número de telefone comercial será adicionado antes do número de telefone do cliente. Isso pode resultar em mensagens não entregues ou entregues incorretamente.
Por exemplo, sua empresa está sediada na Índia (código de ligação do país 91) e você envia uma mensagem para o seguinte número de telefone do cliente em vários formatos:
Número na solicitação de envio de mensagem	Número de mensagens entregues	Resultado

+16315551234
	
+16315551234
	
Número correto

+1 (631) 555-1234
	
+16315551234
	
Número correto

(631) 555-1234
	
+916315551234
	
Número possivelmente errado

1 (631) 555-1234
	
+9116315551234
	
Número possivelmente errado
Observação: no Brasil e no México, o prefixo extra adicionado ao número de telefone poderá ser modificado pela API de Nuvem. Esse é um comportamento padrão do sistema e não é considerado um bug.
Cache de mídia
Caso esteja usando um link (link) para um ativo de mídia no servidor (em vez do ID (id) de um ativo carregado nos servidores da Meta), a API de Nuvem do WhatsApp armazena em cache interno o ativo por dez minutos. O ativo em cache será reutilizado em pedidos de envio de mensagem subsequentes se o link nas cargas posteriores for o mesmo que o da carga inicial.
Se não quiser que o ativo em cache seja reutilizado em uma mensagem subsequente no período de dez minutos, adicione uma string de consulta aleatória ao link do ativo na nova carga de pedido de envio de mensagem. A API de Nuvem o trata como um novo ativo, obtido do seu servidor, e o armazena em cache por 10 minutos.
Por exemplo:
Link do ativo no 1º pedido de envio de mensagem: https://link.to.media/sample.jpg — ativo recuperado, em cache por dez minutos
Link do ativo no 2º pedido de envio de mensagem: https://link.to.media/sample.jpg — ativo em cache reutilizado
Link do ativo no 3º pedido de envio de mensagem: https://link.to.media/sample.jpg?abc123 — ativo recuperado, em cache por dez minutos
Sequência de entrega de várias mensagens
Se você enviar várias mensagens, talvez elas não sejam entregues na mesma ordem dos pedidos da API. Caso haja uma ordem a ser seguida, verifique se cada mensagem foi entregue no status delivered do webhook de mensagens de status antes de enviar a próxima.
Tempo de vida (TTL) da mensagem
Se a API de Nuvem não conseguir entregar uma mensagem a um usuário do WhatsApp, ela fará novas tentativas de entrega por um período conhecido como tempo de vida (TTL, nas iniciais em inglês) ou período de validade da mensagem.
TTL padrão
Todas as mensagens, exceto modelos de autenticação: 30 dias.
Modelos de autenticação: 10 minutos
Como personalizar o TTL para modelos
Você pode personalizar o TTL padrão para modelos de autenticação e utilidade, assim como para modelos de marketing enviados usando a API de Mensagens de Marketing para o WhatsApp. Consulte Tempo de vida para saber mais.
Quando o TTL é excedido: mensagens descartadas
A plataforma descarta as mensagens que não puderem ser entregues dentro do TTL padrão ou personalizado.
Se você não receber um webhook de mensagens de status com status definido como delivered antes da expiração do TTL, presuma que a mensagem foi descartada.
Se você enviar uma mensagem que falha (status definido como failed), pode haver um atraso no recebimento do webhook. Aguarde um tempo antes de presumir que a mensagem foi descartada.
Solução de problemas
Se você está tendo problemas com a entrega de mensagens, consulte Mensagem não entregue.
Você achou esta página útil?