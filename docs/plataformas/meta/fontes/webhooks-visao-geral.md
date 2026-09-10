---
titulo: "Webhooks — visão geral (configuração, verificação, entrega)"
url: https://developers.facebook.com/docs/graph-api/webhooks/
capturado_em: 2026-09-10
hash: bad9088ca7b79f41
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Entrada da pesquisa
​
Webhooks da Meta
Primeiros passos
Exemplos de aplicativos
Borda de assinaturas
Reference
Webhooks da Meta

Os webhooks permitem que você receba notificações HTTP em tempo real sobre mudanças em objetos específicos no gráfico social da Meta. Por exemplo, podemos enviar uma notificação quando um usuário do seu app alterar o endereço de email ou sempre que ele comentar na sua Página do Facebook. Esse recurso evita que você precise consultar a Graph API para saber se ocorreu alguma alteração e ajuda a impedir que seu limite de volume seja atingido.

Os Webhooks para pagamentos e os Webhooks para o Messenger têm etapas de configuração um pouco diferentes. Se estiver configurando o Webhook para um desses produtos, consulte os respectivos documentos para obter as instruções de configuração.

Objetos, campos e valores

Existem muitos tipos de objetos no gráfico social da Meta, como objetos de usuário e Página. Por isso, sempre que você configurar um Webhook, escolha um tipo de objeto primeiro. Como os campos variam dependendo do objeto, é preciso assinar campos específicos para cada tipo de objeto. Enviaremos uma notificação sempre que houver alterações no valor de campos de objeto assinados por você.

As notificações são enviadas como solicitações POST HTTP e contêm uma carga JSON que descreve a alteração. Por exemplo, digamos que você tenha configurado um Webhook User e assinado o campo Photos. Se um dos usuários do seu app carregar uma foto, enviaremos a você uma notificação semelhante a esta:

Exemplo de notificação
{
  "entry": [
    {
      "time": 1520383571,
      "changes": [
        {
          "field": "photos",
          "value": {
            "verb": "update",
            "object_id": "10211885744794461"
          }
        }
      ],
      "id": "10210299214172187",
      "uid": "10210299214172187"
    }
  ],
  "object": "user"
}
Servidor HTTPS

Os webhooks são enviados usando HTTPS. Por isso, seu servidor precisa ser capaz de receber e processar solicitações HTTPS, além de ter um certificado TLS/SSL válido instalado. Os certificados autoatribuídos não são compatíveis.

Análise do app

Para usar Webhooks, não é preciso passar pelo processo de análise do app. No entanto, quando estiver no modo Publicado, o app precisará ter as permissões de acesso relevantes para receber notificações de Webhooks sobre alterações em objetos. Consulte Permissões abaixo.

Permissões

Normalmente, antes de se tornar público, o app precisa passar pelo processo de análise. Durante a análise, é possível solicitar a aprovação de permissões específicas, que controlam os tipos de dados que os apps podem acessar ao usar a Graph API.

Embora não seja preciso concluir a análise do app para usar o produto Webhooks, as permissões devem ser respeitadas. Isso significa que, mesmo que você configure um Webhook e assine campos específicos em um tipo de objeto, não enviaremos notificações de alterações, a menos que:

o app tenha sido aprovado para as permissões que correspondem a esse tipo de dado;
o objeto que possui os dados tenha concedido ao app permissão para acessá-los (por exemplo, um usuário permite que o app acesse o Feed dele).
Modo de desenvolvimento

Os apps em desenvolvimento podem receber somente notificações iniciadas pelo painel do app ou por pessoas com uma função nele.

Lembre-se de que o comportamento do modo de desenvolvimento é diferente para eventos de webhooks do Messenger. Consulte o documento Webhooks para o Messenger para saber mais.

Configuração

Para usar Webhooks, você precisará configurar um ponto de extremidade em um servidor seguro (HTTPS). Depois, adicione e configure o produto Webhooks no painel do seu app. O restante da documentação explica como concluir essas duas etapas.

Tudo pronto? Vamos começar!

Saiba mais
Saiba como receber notificações quando uma conversa é passada de um app para outro usando o Protocolo de entrega do Messenger.
Nesta Página
Webhooks da Meta
Objetos, campos e valores
Servidor HTTPS
Análise do app
Permissões
Modo de desenvolvimento
Configuração
Saiba mais