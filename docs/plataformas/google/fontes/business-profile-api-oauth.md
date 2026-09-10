---
titulo: "Business Profile APIs — OAuth 2.0 e escopos"
url: https://developers.google.com/my-business/content/oauth-overview?hl=pt-br
capturado_em: 2026-09-10
hash: bfe7bfb76b03285f
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Visão geral do OAuth

Todas as solicitações que seu aplicativo envia para as APIs do Perfil da Empresa precisam incluir um token de autorização, que identifica o usuário ou o aplicativo para o Google, permitindo acesso a essas APIs. O app precisa usar o protocolo OAuth 2.0 para autorizar as solicitações.

O guia de configuração do OAuth explica os diferentes métodos que podem ser usados para implementar o OAuth 2.0 na sua plataforma. O Google Identity Platform oferece a funcionalidade de Login do Google e OAuth usada neste guia.

A implementação do OAuth 2.0 oferece os seguintes benefícios:

Protege o acesso aos dados do proprietário da empresa.
Mostra a identidade do proprietário da empresa quando ele faz login na Conta do Google.
Permite que uma plataforma ou aplicativo de parceiro acesse e modifique dados de local com o consentimento explícito do proprietário da empresa, que pode revogar esse acesso posteriormente.
Exibe a identidade da plataforma do parceiro.
Permite que as plataformas de parceiros realizem ações on-line ou off-line em nome do proprietário da empresa. Isso inclui respostas a avaliações, criação de postagens e atualizações de itens de menu.
Aumenta a transparência dos fluxos de trabalho de várias etapas com vários participantes, como convites de gerenciamento.
Isso foi útil?

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2025-08-29 UTC.