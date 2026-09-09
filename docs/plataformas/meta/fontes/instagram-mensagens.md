---
titulo: "Instagram — Messaging API (mensagens diretas)"
url: https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/messaging-api
capturado_em: 2026-09-09
hash: 062127edcc30d7a2
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Enviar mensagens
Updated: 6 de mai de 2026
Copiar para LLM
Ver como Markdown
Este guia mostra como enviar uma mensagem a um usuário do Instagram a partir da sua conta profissional usando a API do Instagram com o Login do Instagram.
Como funciona
A API do Instagram com o Login do Instagram permite que os usuários do seu app enviem e recebam mensagens entre a conta profissional do Instagram e os respectivos clientes, clientes em potencial e seguidores.
Um usuário do Instagram envia uma mensagem.
As conversas começam somente quando um usuário do Instagram envia uma mensagem por meio do Feed, das publicações, das menções em stories e de outros canais do usuário do seu app.
Caixa de Entrada do Instagram
Uma conta profissional do Instagram tem uma caixa de entrada de mensagens que permite ao usuário organizar mensagens e controlar notificações. Porém, o comportamento será um pouco diferente ao usar a API.
Geral – A conversa será movida para a pasta Geral somente depois que o usuário do app responder a uma mensagem no seu app, independentemente das configurações da caixa de entrada.
Principal – Todas as novas conversas com seguidores aparecerão inicialmente na pasta Principal.
Solicitações – Todas as novas conversas de usuários do Instagram que não seguem o usuário do app aparecerão na pasta de solicitações.
Saiba mais sobre a Caixa de Entrada do Instagram.⁠
Limitações da Caixa de Entrada
As pastas da Caixa de Entrada não são compatíveis com a plataforma do Messenger, e mensagens enviadas por meio dela não incluirão as informações de pasta exibidas no app do Instagram from Meta.
As notificações de webhooks ou as mensagens entregues por meio da API não serão consideradas como Lida na Caixa de Entrada do app do Instagram. Uma mensagem só será considerada Lida após o envio de uma resposta.
É enviada uma notificação de webhook.
Quando um usuário do Instagram envia uma mensagem para o usuário do seu app, um evento é disparado e uma notificação de webhook é enviada para o servidor de webhook. A notificação contém o ID no escopo do Instagram do usuário e a mensagem. O usuário do app pode usar essa informação para responder.
Enviar uma mensagem
Somente depois que um usuário do Instagram enviar uma mensagem à conta profissional do Instagram do usuário do seu app, será possível enviar uma mensagem ao usuário do Instagram. O app tem 24 horas para responder a qualquer mensagem enviada por um usuário do Instagram para um usuário do app.
As mensagens podem incluir o seguinte:
Arquivos de áudio
Imagens
Publicações do Instagram (propriedade do usuário do app)
Links
Reações
Figurinhas
Modelos
Texto
Vídeos
Arquivos PDF
Experiências automatizadas
É possível fornecer um caminho de escalação para experiências de mensagens automatizadas usando uma destas opções:
Um app único: é possível criar uma Caixa de Entrada personalizada para receber ou responder a mensagens de uma pessoa. A Caixa de Entrada personalizada tem a tecnologia do mesmo app de mensagens que fornece a experiência automatizada
Vários apps: o protocolo de entrega permite que você passe a conversa de um app ou uma caixa de entrada para outro. Por exemplo, um app administraria a conversa com uma experiência automatizada; quando necessário, outro app receberia a conversa para passá-la a um agente humano.
Informar os usuários sobre a experiência de bate-papo automatizado
Nas situações exigidas pela legislação aplicável, as experiências de bate-papo automatizado devem informar que uma pessoa está interagindo com um serviço automatizado:
no começo de qualquer conversa ou tópico de mensagem,
após um lapso de tempo significativo;
quando o bate-papo passar de interação humana para experiência automatizada.
Esse requisito precisa receber atenção especial no caso de experiências que atendem aos seguintes grupos:
Mercado ou usuários da Califórnia
Mercado ou usuários da Alemanha
As divulgações incluem, entre outros: “Sou o bot da página [Nome da Página]”, “Você está interagindo com uma experiência automatizada”, “Você está falando com um bot” ou “Eu sou um bot de bate-papo automatizado.”
Mesmo que não haja uma exigência legal, recomendamos como boa prática informar aos usuários quando eles estiverem interagindo com uma conversa automatizada. Isso ajuda a gerenciar as expectativas das pessoas quanto à experiência de troca de mensagens.
Leia nossas Políticas do Desenvolvedor para saber mais.
Experiências com agentes humanos
Caso o usuário do app precise de mais tempo porque está usando um agente humano para responder às mensagens, o app poderá marcar a resposta para permitir o envio da mensagem fora da janela de mensagens de 24 horas.
Com uma Caixa de Entrada personalizada, é possível fornecer um caminho de escalação para experiências de mensagens somente com agente humano. Seu app de mensagens precisa:
receber mensagens enviadas por pessoas e renderizá-las corretamente na Caixa de Entrada personalizada;
responder a mensagens por meio da Caixa de Entrada personalizada e garantir que as pessoas as recebam.
Limitações
O usuário do app deve ser proprietário de todas as mídias ou posts usados na mensagem.
As mensagens em grupo não são compatíveis. Uma conta profissional do Instagram só pode conversar com um cliente por conversa.
As mensagens na pasta de solicitações que estiverem inativas por 30 dias não serão retornadas nas chamadas de API.
Apenas o URL da publicação ou mídia compartilhada é incluído na notificação de webhook quando um cliente envia uma mensagem com compartilhamento.
Os testadores precisam ter uma função no app, conceder ao app acesso a todas as permissões necessárias e ter uma função na conta profissional do Instagram à qual o app pertence.
Requisitos
Este guia considera que você leu a Visão geral da plataforma do Instagram e implementou os componentes necessários para usar a API, como um fluxo de login da Meta e um servidor de webhooks para receber notificações.
Você precisará do seguinte:
Nível de acesso
Advanced Access se o app atender a contas profissionais do Instagram que você não possui nem gerencia
Acesso padrão: se o app atender a contas profissionais do Instagram que você possui ou gerencia ou que foram adicionadas ao app no Painel de Apps. Talvez algumas ferramentas não funcionem corretamente antes de o app receber acesso avançado.
Tokens de acesso
Um token de acesso do usuário do Instagram solicitado por uma pessoa que pode enviar uma mensagem a partir da conta profissional do Instagram
URL de base
Todos os pontos de extremidade podem ser acessados via host graph.instagram.com.
Pontos de extremidade
/<IG_ID>/messages ou /me/messages
Parâmetros necessários
Estes são os parâmetros necessários para cada solicitação de API:
recipient:{id:<IGSID>}
message:{<MESSAGE_ELEMENTS>}
IDs
A identificação da conta profissional do Instagram do usuário do app (<IG_ID>) que recebeu a mensagem
O ID no escopo do Instagram (<IGSID>) do usuário do Instagram que enviou a mensagem ao usuário do seu app, recebido de uma notificação de webhook de mensagens do Instagram
Permissões
instagram_business_basic
instagram_business_manage_messages
Assinaturas de eventos de webhook
messages
messaging_optins
messaging_postbacks
messaging_reactions
messaging_referrals
messaging_seen
Tipos e especificações de mídia

Tipo de mídia	Formato compatível	Tamanho máximo compatível

Áudio
	
aac, m4a, wav, mp4
	
25 MB

Imagem
	
png, jpeg
	
8 MB

Vídeo
	
mp4, ogg, avi, mov, webm
	
25 MB

Arquivo
	
pdf
	
25 MB
Enviar um SMS
Para enviar uma mensagem com um texto ou link, faça uma solicitação POST para o ponto de extremidade /<IG_ID>/messages que contenha: 1. o parâmetro recipient com o ID no escopo do Instagram (<IGSID>) e 2. o parâmetro message com um texto ou link.
O texto da mensagem deve estar em UTF-8 e ter até 1.000 bytes. Os links devem ser URLs formatadas corretamente.
Exemplo de solicitação
Texto formatado para facilitar a leitura.
curl -X POST "https://graph.instagram.com/v26.0/<IG_ID>/messages"
     -H "Authorization: Bearer <INSTAGRAM_USER_ACCESS_TOKEN>"
     -H "Content-Type: application/json"
     -d '{
           "recipient":{
               "id":"<IGSID>"
           },
           "message":{
              "text":"<TEXT_OR_LINK>"
           }
        }'
Enviar imagens
Para enviar imagens, envie uma solicitação POST ao ponto de extremidade /<IG_ID>/messages com o parâmetro recipient incluindo o ID no escopo do Instagram (<IGSID>) e o parâmetro message contendo até dez objetos attachment com type definido como image e payload contendo url definido como o URL da imagem ou do GIF.
Exemplo de solicitação: como enviar uma imagem única
Texto formatado para facilitar a leitura.
curl -X POST "https://graph.instagram.com/v26.0/<IG_ID>/messages"
     -H "Authorization: Bearer <INSTAGRAM_USER_ACCESS_TOKEN>"
     -H "Content-Type: application/json"
     -d '{
           "recipient":{
               "id":"<IGSID>"
           },
           "message":{
             "attachments": {
               "type":"image",
               "payload":{
                 "url":"<IMAGE_URL>"
               }
             }
           }
         }'
Exemplo de solicitação: enviar uma coleção de imagens com URLs
curl -X POST "https://graph.instagram.com/v26.0/<IG_ID>/messages"
     -H "Authorization: Bearer <INSTAGRAM_USER_ACCESS_TOKEN>"
     -H "Content-Type: application/json"
     -d '{
           "recipient":{
               "id":"<IGSID>"
           },
           "message":{
              "attachments":[
                 {
                   "type":"image",
                   "payload":{
                     "url":"<IMAGE_URL>",
                   },
                 },
                 {
                   "type":"image",
                   "payload":{
                     "url":"<IMAGE_URL>",
                   },
                 },
                 {
                    ...
                 }
              ]
           }
         }'
Exemplo de solicitação: enviar uma coleção de imagens com IDs de anexo
As mesmas imagens podem ser carregadas usando a API de Carregamento de Anexos e enviadas a diferentes usuários para evitar atrasos e o tempo limite de carregamento de várias imagens em alta resolução. Também é possível combinar os parâmetros url e attachment_id em payload.
curl -X POST "https://graph.instagram.com/v26.0/<IG_ID>/messages"
     -H "Content-Type: application/json"
     -d '{
           "recipient":{
               "id":"<IGSID>"
           },
           "message":{
              "attachments":[
                 {
                   "type":"image",
                   "payload":{
                     "attachment_id":"<attachment_ID>"
                   }
                 },
                 {
                   "type":"image",
                   "payload":{
                     "attachment_id":"<attachment_ID>"
                   }
                 },
                 {
                    ...
                 }
              ]
           }
         }'
Exemplo de resposta da API para mensagem enviada com sucesso
Se o processo for bem-sucedido, o app receberá a seguinte resposta JSON:
{
  "recipient_id": "IGSID",
  "message_id": "MESSAGE-ID"
}

Enviar áudio, vídeo ou arquivo
Para enviar mensagens de áudio, vídeo ou arquivo, envie uma solicitação POST ao ponto de extremidade /<IG_ID>/messages com o parâmetro recipient contendo o ID no escopo do Instagram (<IGSID>) e o parâmetro message contendo o objeto attachment com type definido como audio, video ou file, além de payload contendo url definido como o URL do áudio, vídeo ou arquivo.
Exemplo de solicitação
Texto formatado para facilitar a leitura.
curl -X POST "https://graph.instagram.com/v26.0/<IG_ID>/messages"
     -H "Authorization: Bearer <INSTAGRAM_USER_ACCESS_TOKEN>"
     -H "Content-Type: application/json"
     -d '{
           "recipient":{
               "id":"<IGSID>"
           },
           "message":{
              "attachment":{
               "type":"audio",  // Or set to video or file
               "payload":{
                 "url":"<AUDIO_VIDEO_OR_FILE_URL>",
               }
             }
          }
        }'
Enviar uma figurinha
Para enviar uma figurinha de coração, faça uma solicitação POST para o ponto de extremidade /<IG_ID>/messages que contenha: 1. o parâmetro recipient com o ID no escopo do Instagram (<IGSID>) e 2. o parâmetro message com um objeto attachment cujo type esteja definido como like_heart.
Exemplo de solicitação
Texto formatado para facilitar a leitura.
curl -X POST "https://graph.instagram.com/v26.0/<IG_ID>/messages"
     -H "Authorization: Bearer <INSTAGRAM_USER_ACCESS_TOKEN>"
     -H "Content-Type: application/json"
     -d '{
           "recipient":{
               "id":"<IGSID>"
           },
           "message":{
              "attachment":{
                "type":"like_heart",
              }
            }
         }'
Reagir ou remover a reação de uma mensagem
Para enviar uma reação, faça uma solicitação POST para /<IG_ID>/messages com recipient contendo o ID no escopo do Instagram (<IGSID>); sender_action definido como react; payload contendo o message_id definido como o ID da mensagem reagida; e reaction definido como uma reação com emoji (<😊/🎉/etc>) ou uma representação UTF-8 válida de um emoji.
Para editar uma reação enviada, repita essa solicitação com a reação definida como o novo emoji.
Para remover uma reação, repita essa solicitação com sender_action definida como "não reagiu" com a carga contendo somente message_id.
Exemplo de solicitação
Texto formatado para facilitar a leitura.
curl -X POST "https://graph.instagram.com/v26.0/<IG_ID>/messages"
     -H "Authorization: Bearer <INSTAGRAM_USER_ACCESS_TOKEN>"
     -H "Content-Type: application/json"
     -d '{
           "recipient":{
               "id":"<IGSID>"
           },
           "sender_action":"react",  // Or set to unreact to remove the reaction
           "payload":{
             "message_id":"<MESSAGE_ID>",
  "reaction":"love /😊/ 🎉/ \ud83d\udc4b",      // Omit if removing a reaction
           }
         }'
Enviar um post publicado
Para enviar uma mensagem com o post do Instagram de um usuário do app, envie uma solicitação POST para o ponto de extremidade /<IG_ID>/messages que contenha: 1. o parâmetro recipient com o ID no escopo do Instagram (<IGSID>) e 2. o parâmetro message contendo um objeto attachment cujo type esteja definido como MEDIA_SHARE, além do payload com o ID da Meta do post.
O usuário do app deve ser proprietário da publicação a ser usada na mensagem. Saiba como obter as publicações do Instagram do usuário do seu app.
Saiba como buscar a mídia de propriedade da empresa.
Exemplo de solicitação
Texto formatado para facilitar a leitura.
curl -X POST "https://graph.instagram.com/v26.0/<IG_ID>/messages"
     -H "Authorization: Bearer <INSTAGRAM_USER_ACCESS_TOKEN>"
     -H "Content-Type: application/json"
     -d '{
           "recipient":{
               "id":"<IGSID>"
           },
           "message":{
              "attachment":{
                "type":"MEDIA_SHARE",
                "payload":{
                  "id":"<POST_ID>",
                }
              }
           }
        }'
Próximas etapas
Saiba como enviar uma resposta privada, resposta rápida ou um modelo.
Você achou esta página útil?