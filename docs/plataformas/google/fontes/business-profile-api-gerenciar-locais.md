---
titulo: "Business Profile APIs — criar e gerenciar locais"
url: https://developers.google.com/my-business/content/manage-locations?hl=pt-br
capturado_em: 2026-09-12
hash: b613d6a3c4b36bbd
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Gerencie vários locais ao mesmo tempo
Nesta página
Tipos de conta
Conta pessoal
Conta da organização
Conta do grupo por locais
Conta do grupo de usuários
Usar a API para chamar uma lista com todas as contas
Solicitação
Resposta

À medida que sua organização cresce, gerenciar seus locais e permissões pode dar trabalho. Neste guia, detalhamos as práticas recomendadas para gerenciar vários locais ao mesmo tempo e descrevemos estes tipos de conta:

Conta pessoal
Conta da organização
Conta do grupo por locais
Conta do grupo de usuários
Tipos de conta

Cada tipo tem um papel no gerenciamento de locais. Uma conta pessoal pode administrar uma conta da organização e receber as permissões para os grupos de locais e de usuários da empresa. A conta pessoal gerencia os locais e as fichas da empresa usando os grupos de locais associados.

Conta pessoal

Uma conta pessoal é disponibilizada automaticamente quando você cria uma Conta do Google. As contas pessoais podem ser proprietárias e administradoras de fichas.

Conta da organização

A conta da organização é sobreposta e representa sua agência. Seus grupos por locais e de usuários são salvos nela, e todos os membros da organização têm acesso a eles. Os locais podem fazer parte de várias organizações.

Com a API My Business Account Management, você pode usar o método accounts.admins.create e convidar contas pessoais para gerenciar ou ser proprietárias da conta da organização.

Conta do grupo por locais

Um grupo por locais é usado para gerenciar vários lugares ao mesmo tempo. Você pode usar um grupo para realizar tarefas em massa em vários locais. Quando você adiciona contas pessoais e grupos de usuários a um grupo de locais, eles herdam as permissões desse último.

Você também pode criar grupos de locais para categorizar locais, por exemplo, por rede, região ou categoria. Os locais podem estar em vários grupos de uma só vez.

Observação: uma conta pessoal que pertence a uma organização ou a um grupo de usuários não está qualificada para ter um local ou um grupo de locais.

Com a API My Business Account Management, você pode usar o método accounts.create para criar grupos de locais e transferir locais para eles. Com ela, também é possível convidar contas pessoais para gerenciar grupos de locais. Os grupos de usuários podem ser adicionados diretamente a grupos de locais na interface da Web.

Conta do grupo de usuários

Use um grupo de usuários para gerenciar as permissões em massa. Você pode adicionar contas pessoais a um grupo de usuários. Depois, conceda ao grupo de usuários acesso ao gerenciamento de vários grupos de locais. Assim, todas as contas pessoais do grupo poderão administrar os locais dentro dele.

Observação: não é recomendável adicionar contas pessoais a um grupo de locais. Em vez disso, conceda o acesso aos grupos de usuários diretamente. Essa é uma maneira mais fácil de fazer o gerenciamento em massa.

Por exemplo, quando um novo membro entra em uma equipe operacional, ele pode ser adicionado a um grupo de usuários, tendo acesso imediato aos mesmos locais que os colegas. O acesso a cada local leva mais tempo e é mais difícil de gerenciar.

Com a API My Business Account Management, você pode usar o método accounts.create para criar grupos de usuários. Também é possível usar a API e convidar contas pessoais para gerenciar os administradores das contas e dos locais.

Usar a API para chamar uma lista com todas as contas

Para listar todas as contas a que você tem acesso e os tipos associados a elas, chame o método accounts.list com suas credenciais do OAuth. A resposta contém uma lista com todas as contas, os IDs delas presentes no campo name e os tipos de conta.

Solicitação

Veja a seguir um exemplo de solicitação accounts.list:

HTTP
GET
https://mybusinessaccountmanagement.googleapis.com/v1/accounts
Authorization: Bearer <access_token>

Resposta

Veja a seguir um exemplo de resposta accounts.list:

{
    "accounts": [
        {
            "name": "accounts/{accountId}",
            "accountName": "John Doe",
            "type": "PERSONAL",
            "state": {
                "status": "UNVERIFIED"
            },
            "profilePhotoUrl": "//lh5.googleusercontent.com/REDACTED"
        },
        {
            "name": "accounts/{accountId}",
            "accountName": "John Doe’s Location Group",
            "type": "LOCATION_GROUP",
            "role": "OWNER",
            "state": {
                "status": "UNVERIFIED"
            },
            "accountNumber": "{accountNumber}",
            "permissionLevel": "OWNER_LEVEL"
        }
    ]
}

Todos os tipos de conta detalhados neste guia podem ser incluídos na resposta à solicitação accounts.list. Revise a lista de contas e identifique aquela específica que tem acesso aos locais que você quer gerenciar. Depois, chame accounts.locations.list com o campo name da conta específica para recuperar uma lista de locais a que ela tem acesso.

Por exemplo, se você quer recuperar todos os locais que pertencem ao "Grupo de locais de João da Silva", faça a seguinte solicitação:

HTTP
GET
https://mybusinessbusinessinformation.googleapis.com/v1/{accountId}/locations
Authorization: Bearer <access_token>

A resposta vai retornar uma lista de locais a que o usuário tem acesso, da seguinte maneira:

{
    "locations": [
        {
            "name": "locations/{locationId}",
            "locationName": "Test Business",
            ...
        },
        {
            "name": "locations/{locationId}",
            "locationName": "2nd Test Business",
            ...
         }
     ]
}
Diagrama de gerenciamento de locais

O diagrama a seguir mostra o seguinte:

As organizações podem ter vários grupos de usuários.
Os grupos de usuários conseguem gerenciar vários grupos de locais.
Os grupos de locais podem conter vários locais.
Os locais podem abranger vários grupos de locais em várias organizações.
Figura 1. Hierarquia do gerenciamento de locais
Isso foi útil?

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-02-18 UTC.