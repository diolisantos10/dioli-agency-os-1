---
titulo: "WhatsApp Cloud API — primeiros passos"
url: https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started
capturado_em: 2026-09-08
hash: 20734fc4313f9aa6
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Introdução à API de Nuvem do WhatsApp
Updated: 16 de jun de 2026
Copiar para LLM
Ver como Markdown
Esta documentação é destinada a desenvolvedores que criam na plataforma do WhatsApp Business. Se você é usuário do WhatsApp e está enfrentando problemas com sua conta pessoal, acesse a Central de Ajuda do WhatsApp⁠ para obter suporte.
Este guia ajuda os desenvolvedores a começarem a usar rapidamente a API de Nuvem do WhatsApp. Ele abrange as etapas básicas de configuração, incluindo inscrição como desenvolvedor, criação de um app da Meta, envio da primeira mensagem e configuração de um ponto de extremidade de webhook de teste. Você também aprenderá a gerar tokens de acesso seguros e enviar mensagens com e sem modelo. Apresentamos recursos avançados e outros recursos para você saber mais.
Baixe o app de exemplo
O app de exemplo do Jasper's Market contém todas as mensagens e códigos usados na demonstração do Jasper's Market. Você pode usar esse app de exemplo para saber como criar um app que envie e processe dados da API de Nuvem do WhatsApp.
Baixar o app de exemplo do Jasper's Market
Pré-requisitos
Conta do Facebook ou Conta Meta gerenciada
Inscrição do desenvolvedor
Caso ainda não tenha feito isso, acesse a página de registro de desenvolvedores e siga as instruções.
Dispositivo habilitado para WhatsApp para enviar e receber mensagens de teste
Etapa 1. Criar um novo app da Meta com o WhatsApp
Abra o Painel de Apps da Meta para criar um novo app da Meta com o caso de uso do WhatsApp.
Clique em Criar app.
Adicione o nome do app e seu email.
Selecione o caso de uso Conectar-se com clientes pelo WhatsApp e clique em Avançar.
Selecione um portfólio empresarial existente ou crie um novo.
Você verá uma lista de requisitos de publicação. Pode ser que você ainda não tenha nenhum. Clique em Avançar.
Confirme seus detalhes, caso de uso e portfólio empresarial. Clique em Anterior para fazer alterações ou em Criar app para concluir o processo de criação.
Após criar o app com o caso de uso do WhatsApp, encaminharemos você para a página Personalizar caso de uso > Conectar no WhatsApp > Início rápido no painel.
Etapa 2. Começar a usar a API
Clique no botão Começar a usar a API para configurar a API adicionando um número de telefone e enviando sua primeira mensagem. Redirecionaremos você para a página Configuração da API.
Na seção Configuração da API, conecte o app a uma conta do WhatsApp Business. Com essa conexão, o app pode acessar a API da Nuvem do WhatsApp e enviar mensagens em nome da empresa. Selecione uma conta do WhatsApp Business existente ou crie uma nova:
Para usar uma conta existente: selecione a conta do WhatsApp Business no menu suspenso.
Para criar uma conta: Clique em Criar uma conta do WhatsApp Business e siga as instruções para configurar seu perfil comercial.
Depois de se conectar, você verá a identificação da conta do WhatsApp Business no painel de configuração da API.
Salve essa identificação para usar em chamadas de API.
Observação: se você tiver criado um novo portfólio empresarial da Meta durante a criação do app, uma conta do WhatsApp Business poderá ter sido criada automaticamente para você. Verifique a conexão na seção "Configuração da API" antes de continuar.
Etapa 3. Enviar e receber mensagens
Clique em Gerar token de acesso para gerar um token de acesso temporário e enviar uma mensagem de teste.
Selecione um número de telefone De ou adicione um novo no menu suspenso.
Adicione um número de telefone Para que receberá a mensagem de teste.
Clique no botão Enviar mensagem para enviar sua primeira mensagem.
Guarde o ID do número de telefone de teste e a identificação da conta do WhatsApp Business para usar mais tarde.
Depois de receber a mensagem que você enviou, responda para manter a conversa ativa.
O menu do lado esquerdo apresenta maneiras de personalizar as configurações e permissões de casos de uso para que seu app funcione do jeito que você quer. Você pode atualizar essas configurações a qualquer momento.
Permissões e recursos – Confira as permissões necessárias e opcionais para o caso de uso e adicione-as ao envio da Análise do App, se aplicável.
Início rápido – Comece a usar a API e aprenda como expandir seus negócios, melhorar o ROI e gerenciar a conta do WhatsApp Business.
Configuração da API – gere tokens de acesso, envie e receba mensagens, além de configurar webhooks e o SDK do WhatsApp.
Configuração – Configure webhooks e o SDK do WhatsApp.
Recursos – Veja a documentação para desenvolvedores do WhatsApp, os cursos do Meta Blueprint e os recursos de suporte.
Integração do Provedor de Tecnologia – Comece a dimensionar a Plataforma do WhatsApp Business para sua empresa.
Soluções de parceiros – Crie uma solução de parceiro.
Configurador de cadastro incorporado – integre o fluxo de Cadastro Incorporado ao seu site ou ao portal do cliente.
Etapa 4: Configurar o app de webhook de teste
Você precisará configurar um ponto de extremidade de webhook para receber notificações sobre o status das mensagens, como "lida" e "entregue".
Use o servidor de webhook de exemplo para fins de teste seguindo o guia Como usar um app de webhook de teste.
Após a criação do app de webhook de teste, responda na conversa do WhatsApp que você criou com você. A carga do webhook será exibida no app de teste da seguinte maneira:
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "215589313241560883",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15551797781",
              "phone_number_id": "7794189252778687"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Jessica Laverdetman"
                },
                "wa_id": "13557825698"
              }
            ],
            "messages": [
              {
                "from": "17863559966",
                "id": "wamid.HBgLMTc4NjM1NTk5NjYVAGHAYWYET688aASGNTI1QzZFQjhEMDk2QQA=",
                "timestamp": "1758254144",
                "text": {
                  "body": "Hi!"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}

Etapa 5. Criar um usuário do sistema e gerar um token de acesso permanente
O token de acesso temporário que você criou para enviar o modelo hello_world expira rapidamente e não é adequado para fins de desenvolvimento. Por isso, você deve criar um token permanente para usar na plataforma do WhatsApp Business.
Acesse Configurações do negócio⁠ e clique em Usuários do sistema na barra lateral.
Clique no botão Adicionar+ no canto superior direito e siga as instruções para criar um novo usuário do sistema.
Selecione o novo usuário do sistema que você criou e clique em Atribuir ativos.
Selecione o app e ative Gerenciar app em Controle total.
Selecione sua conta do WhatsApp e ative a opção Gerenciar contas do WhatsApp Business em Controle total.
Clique no botão Atribuir ativos.
Clique em Gerar token.
Siga as instruções para gerar o token.
Adicione as seguintes permissões ao token:
business_management
whatsapp_business_messaging
whatsapp_business_management
Copie o token e guarde-o em um local seguro para usá-lo nas etapas seguintes.
Etapa 6. Enviar uma mensagem que não seja de modelo
Quando você respondeu à mensagem de teste anterior, uma janela de atendimento ao cliente foi aberta. Essa janela de 24 horas permite que você envie mensagens que não sejam de modelo aos usuários do WhatsApp. Com a janela de atendimento ao cliente aberta, você pode enviar uma mensagem que não seja de modelo para você. Para isso, insira a identificação do número de telefone de teste, o token de acesso do usuário do sistema e o número de telefone no exemplo de código abaixo. Depois, cole o código no seu terminal e execute-o.
curl 'https://graph.facebook.com/v23.0/<TEST_BUSINESS_PHONE_NUMBER_ID>/messages' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <SYSTEM_USER_ACCESS_TOKEN>' \
-d '
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "<WHATSAPP_USER_PHONE_NUMBER>",
  "type": "text",
  "text": {
    "body": "Hello!"
  }
}'
Depois de enviar a mensagem, verifique o app de webhook de teste para ver o evento de webhook que confirma o recebimento da mensagem.
Etapa 7: Concluir
A API de Nuvem do WhatsApp permite que você envie mensagens e receba webhooks, que são os blocos fundamentais para a integração de mensagens. Além do básico, a API oferece outros recursos, como criação e gerenciamento de grupos, bem como suporte para chamadas. Para explorar esses recursos avançados, confira a seção "Saiba mais" abaixo.
Saiba mais
Conheça os diferentes tipos de mensagens que não são de modelo
Saiba como criar e enviar mensagens de modelo
Saiba como criar e gerenciar grupos do WhatsApp via API
Saiba como enviar e receber ligações no WhatsApp via API
Saiba como adicionar um número de telefone comercial
Aprenda a configurar seu próprio servidor de webhook
Integre usuários do app WhatsApp Business: permita que as empresas que já usam o app WhatsApp Business conectem a conta e o número de telefone existentes à API de Nuvem por meio do Cadastro incorporado
Torne-se um parceiro
Veja a especificação OpenAPI da API do WhatsApp⁠
Você achou esta página útil?