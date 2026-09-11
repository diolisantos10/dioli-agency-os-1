---
titulo: "Google Ads API — políticas"
url: https://support.google.com/adspolicy/answer/6169371?hl=pt-BR
capturado_em: 2026-09-11
hash: 93b91f5ec712a864
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Políticas da API Google Ads

O Google oferece versões traduzidas da Central de Ajuda, mas elas não têm a intenção de alterar o conteúdo das nossas políticas. A versão em inglês é o idioma oficial que usamos para aplicar essas políticas. Se quiser ver este artigo em outra língua, confira o menu suspenso de idiomas na parte de baixo da página.

Com a API Google Ads, os desenvolvedores criam ferramentas que ajudam anunciantes a gerenciar contas e campanhas do Google Ads com mais eficiência e criatividade. Nossas políticas garantem que a API seja usada para aprimorar o Google Ads e proporcionar uma experiência transparente e consistente.

Podemos solicitar a análise de como você usa a API a qualquer momento e por qualquer motivo para manter compliance com os Termos e Condições da API Google Ads e com estas políticas:

Políticas gerais da API
Recursos mínimos obrigatórios (RMF)
Divulgações obrigatórias e outras responsabilidades
Práticas proibidas
Aviso de violações e taxas de não compliance
Políticas gerais da API
Uso da API Google Ads

Você pode usar a API Google Ads apenas para criar, gerenciar ou elaborar relatórios de campanhas do Google Ads.

Você pode usar os recursos da API somente da maneira descrita na solicitação do token. Se você quiser mudar o uso da API (por exemplo, com a adição de recursos de criação ou gerenciamento a uma ferramenta de geração de relatórios), preencha este formulário de alteração de ferramenta.

Tokens não utilizados

O Google poderá desativar seu token da API se ele não for utilizado de forma consecutiva por 90 dias. Se o seu token for desativado por falta de uso, faça uma nova solicitação.

Recursos mínimos obrigatórios

Os recursos mínimos obrigatórios (RMF) são recursos e outras funcionalidades que alguns desenvolvedores de ferramentas precisam oferecer para usar a API Google Ads. As regras de RMF são agrupadas em três categorias: recursos de criação, gerenciamento e relatórios. Consulte as regras de RMF.

O compliance com essas regras depende de como você usa a API Google Ads:

 	Recurso de criação
Requisitos	Recurso de gerenciamento
Requisitos	Recurso de relatórios
Requisitos
Ferramenta de gerenciamento completo
Anunciantes, agências e outros terceiros usam a ferramenta para gerenciar as próprias contas do Google Ads.	RMF aplicáveis	RMF aplicáveis	RMF aplicáveis
Somente relatórios
(somente um painel de relatórios é disponibilizado para agências ou anunciantes finais)	RMF não aplicáveis	RMF não aplicáveis	RMF aplicáveis
Somente para uso interno
(usado somente por anunciantes individuais ou agências, sem acesso de terceiros à ferramenta)	RMF não aplicáveis	RMF não aplicáveis	RMF não aplicáveis

Os RMF são aplicáveis somente a tokens com acesso padrão. Consulte a planilha de tarifas para mais informações.

Se a sua ferramenta oferece funcionalidades muito limitadas e especializadas e não pode ser usada para criar e gerenciar campanhas, grupos de anúncios e anúncios, ela não está qualificada como uma ferramenta completa. Nesse caso, os RMF de criação e de gerenciamento não são aplicáveis. Se você não tiver certeza se a política de RMF é relevante para sua ferramenta, entre em contato com a equipe de compliance da API Google Ads. Essa equipe é que vai analisar se a sua ferramenta é completa ou não. Sua ferramenta poderá ser reavaliada se a funcionalidade mudar de forma significativa.

A política de RMF garante que os anunciantes tenham acesso aos recursos e dados de performance detalhados que podem ser encontrados no Google Ads, independente da combinação de ferramentas que eles optarem por usar. A lista de RMF contém políticas e documentações para desenvolvedores sobre cada recurso. Se você tiver outras dúvidas sobre os requisitos específicos de determinado recurso, contate a equipe de compliance da API.

Se você violar nossa política de RMF, poderá ter que pagar taxas de não compliance, e seu token poderá sofrer downgrade, conforme descrito na planilha de tarifas da API.

Divulgações obrigatórias e outras responsabilidades

Esta seção sobre divulgações obrigatórias e outras responsabilidades se aplica a estes grupos:

Agências e outros terceiros que gerenciam campanhas em nome de anunciantes finais e fornecem ferramentas de software a esses anunciantes
Desenvolvedores de software que fornecem ferramentas a agências e terceiros

As políticas desta seção não se aplicam a anunciantes finais ou que usam a API Google Ads somente para fins internos.

Divulgações obrigatórias

A responsabilidade é um princípio fundamental do Google Ads. Queremos que anunciantes entendam a performance do Google Ads, independente da ferramenta que usam. Confira abaixo o que é preciso para oferecer transparência a quem anuncia no Google quando o assunto são relatórios e o gerenciamento de dados no Google Ads.

Divulgar inconsistências: quando você oferece uma ferramenta completa a clientes que são anunciantes finais para gerenciar sistemas de anúncios que não são o Google Ads, eles precisam entender as diferenças de cada plataforma antes de fazer mudanças na conta.

Se a ferramenta de API realiza ações em massa como edição, cópia, importação ou exportação de dados de campanhas do Google Ads de/para outra plataforma de publicidade, você precisa divulgar aos clientes as incompatibilidades entre as plataformas para evitar inconsistências ou erros nas transferências de dados. Também é preciso que os clientes consigam fazer ajustes e/ou cancelar essas transferências para resolver ou evitar incompatibilidades.

Exemplo: imagine que sua ferramenta que utiliza a API permita que os clientes importem para o Google Ads dados produzidos em outra plataforma, mas que tais dados não estejam disponíveis no mesmo nível de detalhamento que os dados do Google Ads (por exemplo, o Google Ads permite a segmentação no nível do CEP, mas a outra plataforma permite a segmentação apenas no nível da cidade). É necessário divulgar essa inconsistência antes do fim da importação dos dados e oferecer ao cliente a possibilidade de cancelar o processo ou modificar os dados da campanha antes de prosseguir.

Exemplo: sua ferramenta de API permite que os clientes exportem dados do Google Ads para outra plataforma de anúncios, que, por sua vez, define uma variável de dados diferente do GA (ou não disponibiliza a variável). Você precisa divulgar essa incompatibilidade antes do fim da exportação dos dados e oferecer ao cliente a possibilidade de cancelar o processo ou modificar os dados da campanha antes de prosseguir.

Dados atrasados: se você transmite os dados de performance do Google Ads aos anunciantes finais ou outros clientes com mais de 24 horas de atraso, é preciso deixar isso claro para eles.

Política de terceiros do Google: agências ou outros terceiros que compram ou gerenciam a publicidade do Google em nome de clientes que são anunciantes finais precisam obedecer à política de terceiros do Google.

Compartilhar e divulgar dados do Google Ads e de outras plataformas de publicidade: como uma agência ou outra entidade que compra ou gerencia publicidade do Google em nome de clientes que são anunciantes finais, você precisa do consentimento por escrito dos seus clientes antes de vender, redistribuir, sublicenciar ou, de qualquer outra maneira, divulgar ou transferir dados específicos para as contas do Google Ads (incluindo palavras-chave, lances, configurações das campanhas ou dados de performance).

Anunciantes que usam sua ferramenta também precisam receber informações precisas sobre o Google Ads, incluindo a possibilidade de distinguir entre dados do Google Ads e de outras plataformas de publicidade. Se a sua ferramenta fornece dados dos relatórios de outras plataformas de publicidade, informe os dados do Google Ads e desses outros sistemas separadamente. Se os dados do Google Ads são disponibilizados em mais detalhes que os dados agregados ou de outras plataformas de publicidade (por exemplo, se o Google Ads fornece relatórios geográficos no nível do CEP, mas outras origens trabalham somente no nível da cidade ou do estado), inclua os dados do Google Ads no nível mais detalhado nos relatórios. Você pode mostrar dados de performance agregados (combinando dados do Google Ads e de outras plataformas) nos relatórios, desde que as informações específicas do Google Ads também possam ser acessadas facilmente.

Exemplo: se a sua ferramenta fornece dados de performance geográfica de publicidade agregados de várias plataformas (por exemplo, AdCenter, Yahoo, Yandex etc.), é necessário também apresentar separado o Relatório de desempenho geográfico do Google Ads e os campos obrigatórios.

Outras responsabilidades

Recursos para várias plataformas:

Essa política sobre recursos em várias plataformas vale para quem cumpre estas condições:

Desenvolvedores que criam ferramentas de software usadas por anunciantes finais, agências ou outros terceiros que gerenciam campanhas em nome dos clientes que são anunciantes finais
Desenvolvedores com software que permite que os usuários copiem, importem, exportem ou otimizem as configurações de campanhas em outras plataformas e redes de publicidade

A política não é válida para anunciantes finais ou que usam a API Google Ads somente para fins internos.

Se você permitir que os usuários do seu software copiem, importem, exportem ou otimizem as configurações de campanhas entre o Google Ads e outra plataforma de publicidade, também vai ter de deixar que essas ações ocorram de uma plataforma para outra, como copiar do Google Ads para o Yahoo ou vice-versa.

Exemplo: se a sua ferramenta permite copiar configurações de campanhas e outros dados do Google Ads e exportar ou otimizar as definições para o Yahoo, os anúncios do Bing e o Yandex, também é preciso deixar que os usuários copiem as configurações de campanhas e outros dados dessas plataformas e exportem ou otimizem novamente no Google Ads.

Desativação por parte do cliente:

É necessário oferecer aos clientes que são anunciantes finais uma maneira rápida e fácil de interromper o uso da ferramenta para gerenciar as campanhas do Google Ads deles. Você tem três dias úteis (depois de receber o aviso) para oferecer a eles a possibilidade de desassociar as campanhas do Google Ads dos seus serviços e token de desenvolvedor e de retomar o controle exclusivo das contas do GA.

Segurança dos dados:

Faça o possível para manter os dados da API Google Ads dos anunciantes em um ambiente sempre seguro, de acordo com os padrões de segurança aceitos para dados corporativos. Além disso, todos os dados transferidos usando a API Google Ads precisam ter a segurança garantida com, no mínimo, uma criptografia SSL de 128 bits. Para transmissões diretamente com o Google, os dados precisam ser protegidos com um protocolo no mínimo tão seguro quanto o que é aceito pelos servidores da API Google Ads.

Práticas proibidas
Raspagem de dados de TargetingIdeaService ou TrafficEstimatorService

TargetingIdeaService (TIS) e TrafficEstimatorService (TES) ajudam anunciantes e agências a gerar palavras-chave de modo programático e a otimizar as próprias estratégias de lances e palavras-chave do Google Ads. Só é permitido coletar dados do TIS ou TES para criar ou gerenciar campanhas do Google Ads. Agências de publicidade ou desenvolvedores independentes do Google Ads que queiram conceder aos clientes acesso aos dados do TIS ou TES usando uma ferramenta externa da API precisam atender a todos os requisitos de Recursos mínimos obrigatórios (criação, gerenciamento e relatórios de campanhas).

Raspagem de dados na Pesquisa Google ou compra de dados obtidos por raspagem

Não é permitido copiar páginas de resultados de pesquisa do Google ou qualquer outra propriedade do Google. Também não é permitido obter dados do Google copiados indiretamente de terceiros. Se você pretende publicar um relatório com dados de pesquisa obtidos de origens legítimas que não sejam o Google, é necessário que o relatório divulgue a origem dos dados e suas metodologias específicas de coleta de dados.

Tokens complementares

Se você fornece ferramentas a anunciantes finais ou outros terceiros, não pode exigir que solicitem um token próprio da API Google Ads para usar sua ferramenta. As solicitações dos anunciantes finais para receber tais tokens vão ser negadas.

Costumamos atribuir apenas um token da API Google Ads por entidade corporativa. Se você precisar de mais de um, entre em contato.

Permitir o uso automatizado do token da API

Você não pode permitir que agências, anunciantes finais ou outros terceiros usem seu token da API Google Ads (ou sua própria API) para evitar pedir um token próprio da API Google Ads ou para burlar a política de RMF do Google. Qualquer uso automático ou programático do Google Ads por parte de agências ou anunciantes finais requer que eles usem tokens próprios da API Google Ads. Não é permitido conceder acesso indireto ao seu token da API usando as APIs que você fornece. Os usuários finais precisarão fazer login de forma manual para usar sua ferramenta (ou seja, não vão ter acesso automático) se quiserem alterar as contas deles de forma manual ou programática.

Exemplo: o desenvolvedor X solicita e recebe acesso à API Google Ads, cria o próprio app "A" com base na API Google Ads e depois lança a própria API secundária "B", que interage com A e é usada pelo usuário final "Y". Esse usuário consegue enviar solicitações para a API Google Ads. O desenvolvedor X corre o risco de o app A estar sujeito a ações de fiscalização se o usuário final Y abusar da API.

Essa política não restringe como você usa a API Google Ads de maneira programática ou automatizada. Ela apenas impede que você permita o acesso de terceiros à API Google Ads de maneira programática ou automatizada usando seu token da API (em vez de esses terceiros solicitarem um token próprio da API).

Violação das políticas do Google Ads

Como usuário da API Google Ads, você e todas as pessoas que usarem sua ferramenta (por exemplo, os anunciantes finais) precisam obedecer às políticas do Google Ads e aos Termos e Condições do Google Ads.

Exemplo: se a conta de administrador associada ao seu token de desenvolvedor da API Google Ads estiver suspensa devido a violações da política, vai ser preciso corrigir o problema imediatamente para manter o uso da API Google Ads.

Uso não autorizado de branding e marcas registradas do Google

Como um usuário da API Google Ads, você precisa obedecer às diretrizes de uso da marca do Google.

Exemplo: sua ferramenta que utiliza a API Google Ads não pode replicar a aparência da interface do usuário do Google Ads ou confundir as pessoas para que acreditem que sua ferramenta é um produto do Google.

Interferência nas atividades do Google

O Google pode monitorar e auditar qualquer atividade da API Google Ads para garantir a compliance com os Termos e Condições e com estas políticas. Você não tem permissão para interferir nesse monitoramento ou auditoria nem para ocultar do Google sua atividade na API Google Ads. Qualquer interferência é considerada uma violação dessas políticas.

Seu cliente da API Google Ads (conforme definido nos Termos e Condições) não pode interferir nem tentar interferir de forma alguma no funcionamento correto da API Google Ads. Cada cliente da API Google Ads precisa transmitir ao Google o token de desenvolvedor atribuído, conforme descrito na especificação da API Google Ads.

Aplicação da política
Dados de contato

Você precisa manter dados de contato sempre atualizados na Central de API da sua conta da MCC (Minha central de clientes). Recomendamos que você insira um alias (com todos os contatos relevantes da API) como o endereço de e-mail de contato. O endereço de e-mail informado na Central de API é o principal meio de contato para tratar de compliance. Não responder às solicitações ou aos avisos da Equipe de API constitui uma violação dessas políticas e pode resultar no downgrade do seu status de acesso de padrão para básico ou no cancelamento do seu token da API. Mediante solicitação, você também terá que fornecer dados de contato adicionais, conforme necessário.

Abuso por usuários indiretos do seu token

Ao conceder acesso indireto ao seu token por meio de APIs fornecidas por você, seus tokens podem ser revogados se detectarmos que seus usuários finais violaram nossas políticas. Recomendamos que, em vez de ter acesso automático, os usuários finais da sua ferramenta façam login para usá-la com a finalidade de fazer alterações manuais ou programáticas nas contas deles.

Conta de demonstração

Mediante solicitação do Google, você precisa fornecer uma conta de demonstração para sua ferramenta da API até sete dias após o pedido. A demonstração precisa ser uma versão ativa da ferramenta ou uma com os mesmos recursos. Assim, poderemos analisar a ferramenta e verificar se ela obedece às nossas políticas. O não fornecimento da demonstração ou qualquer tentativa de apresentar uma demonstração falsa da ferramenta ativa constitui uma violação dessas políticas.

Aviso de violações e taxas de não compliance

Se você violar essas políticas, o Google enviará um aviso para o e-mail registrado na sua conta da API Google Ads. Você vai ter um período para corrigir essas violações sem sofrer penalizações. Antes de cobrar taxas de não compliance, o Google envia um aviso de acordo com as tarifas detalhadas na planilha de tarifas da API Google Ads.

A violação dessas políticas também pode resultar em outras consequências, incluindo o downgrade do seu status de "Acesso padrão" para "Acesso básico", a imposição de outros limites de cota à utilização da API Google Ads ou o cancelamento do seu token da API Google Ads.

Entre em contato
Em caso de dúvidas sobre qualquer uma dessas políticas ou os Termos e Condições, contate a equipe de compliance da API Google Ads.
Para saber como solicitar um token da API, consulte o site para desenvolvedores de API.
Para dúvidas técnicas sobre a API, consulte a documentação para desenvolvedores ou poste uma pergunta no fórum da API Google Ads (em inglês).
Esta página pode ter conteúdo que foi traduzido com tecnologia de IA. As traduções de IA podem conter erros.
Envie feedback sobre este artigo
Isso foi útil?
Como podemos melhorá-lo?
Enviar