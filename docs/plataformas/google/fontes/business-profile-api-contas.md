---
titulo: "Business Profile APIs — contas e grupos de localização"
url: https://developers.google.com/my-business/content/accounts?hl=pt-br
capturado_em: 2026-09-12
hash: 76541c775c1e3bf5
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Contas
Nesta página
Tipos de conta do Perfil da empresa
Conta pessoal
Conta da organização
Conta do grupo de locais
Conta do grupo de usuários

Cada pessoa que usa as APIs do Perfil da Empresa já precisa ter criado uma Conta do Google.

O Google Identity Platform e o OpenID Connect ajudam no login em várias contas de uma só vez em diferentes plataformas. As preferências de telefone e e-mail da sua Conta do Google ajudam a determinar quais métodos de contato estão disponíveis para a verificação por PIN. Por exemplo, sua conta precisa ter um número de telefone configurado para que o Google faça a verificação do PIN quando você usar voz ou SMS.

Os comerciantes podem ter várias Contas do Google e diversos locais. Para evitar duplicações e atrasos na verificação de propriedade, recomendamos que os comerciantes façam login em todas as contas.

As mudanças feitas nas APIs Business Profile aparecem imediatamente na sua conta do Perfil da Empresa.

Tipos de conta do Perfil da empresa

Há quatro tipos de conta que as APIs do Perfil da empresa usam para gerenciar usuários e locais.

Conta pessoal

Uma conta pessoal é disponibilizada automaticamente quando você cria uma Conta do Google. Elas são vinculadas à Conta do Google do proprietário da empresa ou, opcionalmente, à Conta do Google de um membro da equipe operacional. As contas pessoais podem ser proprietárias e administradoras de fichas.

Conta da organização
Observação: todos os parceiros terceirizados que solicitarem acesso às APIs Business Profile precisarão ter uma conta da organização.

Caso um parceiro ou equipe de operações do parceiro desenvolva um aplicativo para ajudar o proprietário da empresa na gestão (por exemplo, respostas a avaliações, horários de funcionamento, preços e atualizações de menu), é recomendável criar uma conta da organização.

Esse tipo de conta funciona como um contêiner para várias fichas e grupos diferentes. A conta da organização representa sua agência. Seu grupo de locais e os grupos de usuários são salvos nela, e todos os membros da organização têm acesso. Os locais podem fazer parte de várias organizações.

Conta do grupo de locais

Um grupo de locais é usado para gerenciar vários locais individuais. Você pode usar um grupo de locais para realizar tarefas em massa em vários locais. Quando você adiciona contas pessoais e grupos de usuários a um grupo de locais, eles herdam as mesmas permissões.

Com esse tipo de conta, é possível classificar, acessar e gerenciar fichas de empresa por categorias, atributos ou papéis definidos pelo parceiro.

Conta do grupo de usuários

As contas do grupo de usuários gerenciam as permissões comuns a várias contas pessoais.

Você pode adicionar contas pessoais a um grupo de usuários. Depois, conceda ao grupo de usuários acesso para gerenciamento de vários grupos de locais. Assim, todas as contas pessoais adicionadas poderão administrar os locais dentro dos grupos.

Isso foi útil?

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2025-08-29 UTC.