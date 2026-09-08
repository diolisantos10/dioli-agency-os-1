---
titulo: "WhatsApp — modelos de mensagem (templates): criação e aprovação"
url: https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/overview
capturado_em: 2026-09-08
hash: e063cb09836f50bb
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Noções básicas sobre modelos
Updated: 21 de mai de 2026
Copiar para LLM
Ver como Markdown
Este documento abrange a mecânica de modelos que se aplica a todas as categorias de modelos. Para ver guias de modelos específicos de categorias, consulte Mensagens de marketing, Mensagens de utilidade e Mensagens de autenticação.
Os modelos são ativos da conta do WhatsApp Business que podem ser enviados em mensagens de modelo por meio da API de Nuvem ou da API de Mensagens de Marketing para o WhatsApp. As mensagens de modelo são o único tipo de mensagem que pode ser enviado a usuários do WhatsApp fora da janela de atendimento ao cliente. Os modelos são normalmente usados para enviar mensagens em massa aos usuários ou quando não há uma janela de atendimento ao cliente aberta.
Criação
Use a API de Modelos de Mensagem ou o painel de modelos de mensagem⁠ no Gerenciador do WhatsApp para criar um modelo.
A criação de modelos via API usa uma sintaxe comum. A maior parte da variação ocorre na string category, que atribui uma categoria ao modelo, e na matriz components, que define os componentes do modelo.
Você pode criar no máximo 100 modelos em uma conta do WhatsApp Business por hora.
Sintaxe comum
curl 'https://graph.facebook.com/v23.0/102290129340398/message_templates' \
-H 'Authorization: Bearer EAAJB...' \
-H 'Content-Type: application/json' \
-d '
{
"name": "<NAME>",
"category": "<CATEGORY>",
"language": "<LANGUAGE>",
"parameter_format": "<PARAMETER_FORMAT>",
"components": [<COMPONENTS>]
}'
Nomes
Cada modelo deve ter um nome, mas os nomes não são exclusivos. Essa flexibilidade permite criar vários modelos com o mesmo nome, mas em idiomas diferentes.
Os nomes dos modelos estão limitados a um máximo de 512 caracteres com caracteres alfanuméricos minúsculos e sublinhados.
Categorias
Cada modelo deve ser categorizado como autenticação, marketing ou utilidade. O guia categorização de modelos descreve como atribuir a categoria adequada a um modelo e o que pode acontecer se um modelo for categorizado incorretamente.
As categorias dos modelos também são consideradas nos preços.
Componentes
Os modelos são compostos de vários componentes de texto, mídia e interface do usuário, que você define na criação de modelos. O guia Componentes de modelos descreve todos os componentes possíveis e como defini-los.
Como há muitos componentes para escolher, consulte as seções Mensagens de autenticação, Mensagens de marketing e Mensagens de utilidade para ver guias de modelos específicos de categorias com exemplos de código mostrando como criar vários modelos com componentes comumente usados.
Idiomas
É necessário atribuir um código de idioma para o modelo no momento da criação. Strings e variáveis de modelos não são traduzidas pela Meta, portanto, você é responsável por fornecer strings e parâmetros de exemplo no idioma adequado.
Se você criar vários modelos com o mesmo nome, mas com idiomas diferentes, cada modelo contará para seu limite de modelos.
Formatos de parâmetros
Alguns componentes do modelo permitem definir strings que contêm um ou mais parâmetros (descritos como "variáveis" no Gerenciador do WhatsApp). Estes são substituídos por valores incluídos por você na sua carga de envio de mensagens quando o modelo é enviado.
Após a criação do modelo, se uma string incluir um ou mais parâmetros, você pode especificar o formato deles, seja named ou positional, e deve incluir um valor de exemplo para cada parâmetro. Se você não especificar um formato, o modelo usará o formato positional por padrão.
Parâmetros nomeados
Os parâmetros que usam o formato nomeado devem ser strings únicas, compostas por caracteres minúsculos e sublinhados, envoltos em chaves duplas, por exemplo, {{first_name}}. Valores de exemplo em cargas de criação de modelos e valores reais em cargas de envio de modelos podem aparecer em qualquer ordem.
Exemplo de carga de criação de modelo com parâmetros nomeados:
{
"name": "order_confirmation",
"language": "en_US",
"category": "utility",
"parameter_format": "named",
"components": [
  {
    "type": "body",
    "text": "Thank you, {{first_name}}! Your order number is {{order_number}}.",
    "example": {
      "body_text_named_params": [
        {
          "param_name": "first_name",
          "example": "Pablo"
        },
        {
          "param_name": "order_number",
          "example": "860198-230332"
        }
      ]
    }
  }
]
}

Exemplo de carga de envio de modelos que usa parâmetros nomeados:
{
"messaging_product": "whatsapp",
"recipient_type": "individual",
"to": "+16505551234",
"type": "template",
"template": {
  "name": "order_confirmation",
  "language": {
    "code": "en_US"
  },
  "components": [
    {
      "type": "body",
      "parameters": [
        {
          "type": "text",
          "parameter_name": "first_name",
          "text": "Jessica"
        },
        {
          "type": "text",
          "parameter_name": "order_number",
          "text": "SKBUP2-4CPIG9"
        }
      ]
    }
  ]
}
}

Parâmetros posicionais
Os parâmetros posicionais devem ser números de índice de matriz ordenados, começando em 1, envoltos em chaves dupla: ({{1}}...{{2}}...e assim por diante). Valores de exemplo nas cargas de criação de modelos e valores reais nas cargas de envio de modelos devem aparecer na ordem em que seus espaços reservados correspondentes aparecem na string de texto do componente.
Exemplo de carga de criação de modelos com parâmetros posicionais:
{
"name": "order_confirmation",
"language": "en_US",
"category": "utility",
"parameter_format": "positional",
"components": [
  {
    "type": "body",
    "text": "Hi {{1}}! Your order number is {{2}}. Thank you.",
    "example": {
      "body_text": [
        [
          "Pablo",
          "860198-230332"
        ]
      ]
    }
  }
]
}

Exemplo de carga de envio de modelos que usa parâmetros posicionais:
{
"messaging_product": "whatsapp",
"recipient_type": "individual",
"to": "+16505551234",
"type": "template",
"template": {
  "name": "order_confirmation",
  "language": {
    "code": "en_US"
  },
  "components": [
    {
      "type": "body",
      "parameters": [
        {
          "type": "text",
          "text": "Jessica"
        },
        {
          "type": "text",
          "text": "SKBUP2-4CPIG9"
        }
      ]
    }
  ]
}
}

Mídia
Os componentes do cabeçalho do modelo podem mostrar ativos de mídia. Se estiver criando um modelo com um cabeçalho de mídia, você deverá usar a API de Carregamento Retomável para obter um nome de usuário do ativo e incluir esse nome no seu pedido de criação de modelo. O ativo de exemplo será analisado como parte da análise do modelo.
Análise do modelo
Os modelos são analisados automaticamente após a criação ou após a edição. Se o seu modelo for aprovado, o status será definido como APPROVED e você poderá começar a enviá-lo em mensagens de modelo. Se for rejeitado ou se o status mudar para qualquer outro valor, não poderá ser enviado em mensagens de modelo.
Consulte o documento sobre análise do modelo para saber mais sobre o processo de análise, motivos comuns de rejeição e o que pode fazer se o seu modelo for rejeitado.
Status do modelo
Os modelos precisam ter o status APPROVED antes de serem enviados em mensagens. O status de um modelo é inicialmente definido pelo processo de análise de modelos, mas pode ser alterado para outro valor baseado no uso e no feedback de qualidade.
As alterações de status do modelo são comunicadas via webhooks de message_template_status_update, mas você pode usar a API de Modelos e pedir o campo status para obter o status de um modelo a qualquer momento.
Exemplo de solicitação
curl 'https://graph.facebook.com/<API_VERSION>/<TEMPLATE_ID>?fields=status' \
-H 'Authorization: Bearer <ACCESS_TOKEN>'
Exemplo de resposta
{
"status": "APPROVED",
"id": "1259544702043867"
}

Consulte a referência da API de Modelo para conferir uma lista de valores de status possíveis ​​e os respectivos significados.
Gerenciador do WhatsApp
O painel Gerenciar modelos⁠ no Gerenciador do WhatsApp também exibe os status dos modelos e adiciona classificações de qualidade para modelos aprovados (active):
Em análise: indica que o modelo ainda está em análise. Esse processo pode levar até 24 horas.
Rejeitado: o modelo foi rejeitado durante o processo de análise ou viola nossas políticas.
Ativo – Qualidade pendente: o modelo de mensagem ainda precisa receber feedback sobre a qualidade ou informações a respeito do índice de leitura dos clientes. Os modelos de mensagem com esse status podem ser enviados aos clientes.
Ativo – Alta qualidade: o modelo recebeu pouco ou nenhum feedback negativo dos clientes. Os modelos de mensagem com esse status podem ser enviados aos clientes.
Ativo – Qualidade média: o modelo recebeu feedback negativo de diversos clientes ou apresenta um baixo índice de leitura e pode ser pausado ou desabilitado em breve. Os modelos de mensagem com esse status podem ser enviados aos clientes.
Ativo – Qualidade baixa: o modelo recebeu feedback negativo de diversos clientes ou apresenta um baixo índice de leitura. Os modelos com esse status podem ser enviados aos clientes, mas talvez sejam suspensos ou desabilitados em breve. Por isso, recomendamos que você resolva os problemas relatados.
Pausado: o modelo foi pausado devido ao feedback negativo recorrente dos clientes ou ao baixo índice de leitura. Os modelos de mensagem com esse status não podem ser enviados aos clientes. Confira Pausa de modelos.
Desabilitado: o modelo foi desabilitado devido a feedback negativo recorrente dos clientes. Os modelos de mensagem com esse status não podem ser enviados aos clientes.
Apelação solicitada: indica que foi feita uma apelação.
Limites de modelos
O número de modelos que uma conta do WhatsApp Business pode ter é determinado pelo portfólio empresarial principal.
Caso o portfólio empresarial principal não tenha sido verificado, cada uma das contas do WhatsApp Business pode ter 250 modelos de mensagens. Entretanto, se o portfólio tiver sido verificado⁠e pelo menos uma das contas tiver um número de telefone comercial com um nome de exibição aprovado, cada conta do WhatsApp Business poderá ter até seis mil modelos.
Adicionalmente, existem limites no número de modelos que você pode enviar, bem como processos que podem afetar a apresentação de modelos:
Limites de mensagens: um limite para o número de modelos que você pode enviar fora das janelas de atendimento ao cliente.
Regularidade do modelo: um processo que permite aos usuários do WhatsApp dar feedback sobre os modelos de mensagens.
Pausa do modelo: um processo que pausa temporariamente os modelos de mensagens que receberam feedback negativo.
Arquivamento de modelos: um processo que arquiva e exclui automaticamente os modelos que ficaram inativos por 12 meses ou mais. Os modelos arquivados serão excluídos após 28 dias, a menos que sejam desarquivados.
Limites de mensagens de modelos de marketing por usuário: um processo que limita o número de modelos de mensagens de marketing que um determinado usuário do WhatsApp pode receber de qualquer empresa.
Tempo de vida
Se uma mensagem enviada a um usuário do WhatsApp não puder ser entregue, o sistema continuará tentando entregar por um período conhecido como TTL (tempo de vida). É possível personalizar o TTL para modelos após a criação do modelo.
Consulte Tempo de validade para saber mais.
Classificação de qualidade
A classificação de qualidade do modelo é um sistema usado para avaliar a qualidade dos modelos de mensagem com base no uso, no feedback dos clientes e no engajamento. Essa classificação ajuda a manter um ecossistema de mensagens de alta qualidade e ajuda a garantir o envio de mensagens que sejam relevantes e bem recebidas.
Confira o documento classificação de qualidade dos modelos para saber mais sobre classificações de qualidade, como elas podem afetar o status de um modelo e como receber notificações sobre mudanças nas pontuações de qualidade dos modelos.
Sequência de entrega de várias mensagens
Se você enviar várias mensagens, talvez elas não sejam entregues na mesma ordem dos pedidos da API. Caso haja uma ordem a ser seguida, verifique se cada mensagem foi entregue no status delivered do webhook de mensagens antes de enviar a próxima.
Gerenciamento de modelos
Confira o documento Gerenciamento de modelos para ver uma lista de pontos de extremidade frequentemente usados para obter, atualizar e excluir modelos.
Você achou esta página útil?