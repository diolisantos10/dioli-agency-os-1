---
titulo: "Business Profile APIs — conceito de local (location)"
url: https://developers.google.com/my-business/content/locations?hl=pt-br
capturado_em: 2026-09-07
hash: 072a320965788e4f
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Locais
Nesta página
Grupo de unidades da empresa (ou grupos por locais)
Agências e terceiros
Testes e verificação de local
Gerenciar locais
Horário de funcionamento especial
Latitude e longitude
Atributos

Os locais podem ser gerenciados diretamente pelos proprietários de empresas ou por agências terceirizadas. Saiba mais sobre as agências.

Grupo de unidades da empresa (ou grupos por locais)

Para compartilhar o acesso com um grupo de pessoas a um conjunto de locais grande, crie grupos por locais (ou grupo de unidades da empresa). Os proprietários de empresas que gerenciam apenas alguns locais não precisam criar grupos. No entanto, se você gerencia muitos locais ou compartilha o nome de usuário e a senha com outros usuários, faça a transição para usar grupos por locais, já que é mais seguro trabalhar em conjunto. Saiba mais sobre os grupos por locais.

Agências e terceiros

Se seu cliente já tem uma conta do Perfil da empresa, ele consegue adicionar sua conta de agência como administrador aos locais individuais ou ao grupo por locais. Caso contrário, ele pode criar uma conta e um grupo por locais, se necessário, e adicionar sua agência como administradora.

Se o cliente de um terceiro precisar de acesso às APIs do Perfil da empresa, ele não poderá fazer a solicitação em nome do cliente. É o cliente que precisa fazer isso. Um único código de projeto será usado para todo o aplicativo do cliente. Depois que um cliente convidar você para um grupo existente, você poderá acessar a conta dele com o token do OAuth2.0 gerado.

Testes e verificação de local

Se você tem mais de 10 locais da mesma empresa, eles precisam ser verificados individualmente ou em massa.

Somente um projeto por empresa pode receber acesso às APIs do Perfil da empresa. É necessário realizar testes de locais não verificados no projeto principal.

Gerenciar locais

Com as APIs do Perfil da Empresa, você pode ver o status do local e todas as atualizações feitas pelo Google nela.

Os campos obrigatórios da unidade são os mesmos encontrados na interface do usuário do Perfil da Empresa. Saiba mais no artigo Diretrizes para representar sua empresa no Google.

Talvez as edições feitas com as APIs do Perfil da empresa não sejam aplicadas imediatamente. Se você fizer mudanças em locais não verificados, as edições só vão aparecer na interface do Perfil da empresa. Você pode usar locais verificados ou não para gerenciar as extensões de local do Google Ads.

As edições feitas em locais verificados são qualificadas para aparecer em outros produtos do Google. O local pode estar sujeito a revisão para garantir a conformidade com as diretrizes de qualidade do Perfil da Empresa e a política de conduta e conteúdo do usuário do Google.

Horário de funcionamento especial

O Google mantém uma lista de Feriados no Google para possíveis feriados. O Maps e a Pesquisa Google avisam aos usuários que o horário de funcionamento de uma empresa pode ser diferente nessas datas. Você pode definir um horário de funcionamento especial para informar seu horário de funcionamento nesses dias aos clientes.

Latitude e longitude

Para configurar seu local, talvez seja necessário fornecer ao Google a latitude e a longitude dos novos locais. Isso nos ajuda a posicioná-los no mapa. Ao criar um local, não inclua a latitude e a longitude por padrão. Só usamos a latitude e a longitude quando não é possível encontrar o endereço. Se forem incluídas nas chamadas de atualização subsequentes para locais existentes, não serão consideradas.

Atributos

É possível usar as APIs Business Profile para informar outros atributos, além dos detalhes principais do Perfil da Empresa. Saiba mais no artigo Diretrizes para representar sua empresa no Google.

Os atributos são baseados na categoria de negócios. Por exemplo, um atributo de um restaurante pode ser "serve café da manhã". O método attributes.list pode ser usado para abrir uma lista de atributos de uma determinada categoria ou de um país.

É possível que os atributos não apareçam nas plataformas do Google, como no Maps ou na Pesquisa depois de serem atualizados. No entanto, se você fornecer essas informações, ajudará o Google a desenvolver experiências de pesquisa local no futuro, fazer a correspondência do seu local com pesquisas relevantes e entender melhor sua empresa.

Se você gerencia atributos de hotéis no Google, consulte as APIs de hotéis do Google para saber como gerenciar os atributos.

Isso foi útil?

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2025-08-29 UTC.