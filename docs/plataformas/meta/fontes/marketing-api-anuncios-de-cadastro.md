---
titulo: "Marketing API — anúncios de cadastro (lead ads)"
url: https://developers.facebook.com/documentation/ads-commerce/marketing-api/guides/lead-ads
capturado_em: 2026-09-08
hash: 065343793b98525e
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Anúncios de cadastro
Updated: 21 de mai de 2026
Copiar para LLM
Ver como Markdown
Os anúncios no Status do WhatsApp são disponibilizados por meio da API de Marketing. Saiba mais sobre anúncios no Status do WhatsApp.
Obtenha leads em anúncios do Facebook. Os anúncios de lead proporcionam às pessoas uma maneira rápida e confidencial de se cadastrarem para receber informações sobre sua empresa.
Como funciona
Com os anúncios de lead, os formulários se tornam mais simples para as pessoas e mais valiosos para as empresas. Quando você configura um anúncio de lead, os clientes em potencial se cadastram para receber suas ofertas e você recebe informações de contato precisas para fazer o acompanhamento.
O formulário é compatível com dispositivos móveis e usa informações já compartilhadas pelas pessoas com o Facebook. Com isso, as pessoas alcançam empresas com mais facilidade e rapidez, e os anunciantes obtêm informações precisas e úteis. Saiba mais sobre os anúncios de lead⁠.
Antes de começar
Para usar anúncios de lead, você precisará do seguinte:
Página do Facebook
Confere à sua empresa uma presença no Facebook e ajuda você a se conectar com os clientes. Consulte os artigos O que é uma Página do Facebook?⁠ ou API de Páginas do Facebook: Introdução. Todos os leads gerados por um anúncio desse tipo pertencem à Página do Facebook.
Conta do Instagram (opcional)
Você precisará de uma conta do Instagram se quiser veicular um anúncio de lead nessa plataforma. Mesmo assim, os leads gerados por um anúncio desse tipo pertencem à Página do Facebook.
App do Facebook
Inclui qualquer app de terceiros, como site, app para celular ou script. O app habilita a API de Marketing para fazer a integração com o Facebook. Cada app tem um ID que será necessário sempre que você usar um dos nossos SDKs ou tags do Open Graph para compartilhamento. Para encontrar o ID do seu app, acesse o Painel de Apps. Saiba mais sobre como criar um app e um ID correspondente.
Aplicativo de teste (opcional)
Crie rapidamente IDs de apps do Facebook para uso durante as fases de desenvolvimento, teste, preparação ou controle de qualidade. Os apps de teste têm o próprio ID e configurações independentes, além de serem úteis na pré-produção. Consulte Aplicativos de teste.
Análise do App
Para recuperar dados de lead, seu app precisa passar pelo processo de análise. É necessário incluir as permissões leads_retrieval e pages_manage_ads no envio. Saiba mais no guia Como enviar para análise. Após a aprovação, você precisará concluir a verificação da empresa.
Token de acesso
Todos os apps que acessam o Facebook precisam de um token de acesso. Também é possível obter um token ao criar um novo app. Há diversas formas de obter tokens de acesso. Consulte a documentação sobre tokens de acesso para obter mais detalhes sobre os diferentes tipos e métodos de obtenção.
Os tokens de acesso podem ser de curta ou longa duração. Não é recomendável depender da estabilidade desses prazos, já que eles podem ser alterados sem aviso prévio ou vencer antes do previsto.
Os tokens de acesso têm limite de volume com base nos usuários ativos no app. Para integrações de anúncios de lead, esse limite costuma ser um. Use tokens de acesso à Página. Elas têm um limite de volume baseado no número de usuários ativos na Página.
Limitações
Não será possível recuperar leads se o app estiver no modo de desenvolvimento. Para fins de teste, os usuários do app no modo de desenvolvimento poderão acessar leads enviados por uma pessoa que tenha uma função nesse mesmo app. Consulte Funções do app para saber mais.
Observação: os apps que estiverem no modo publicado manterão o acesso a todos os leads.
Criar um novo anúncio de lead
Crie um formulário para uso no anúncio de lead.
Crie o anúncio no Gerenciador de Anúncios⁠ ou na API de Marketing e associe o ID do formulário. Consulte Como criar na documentação sobre anúncios de cadastro.
Como integrar CRMs
Com os anúncios de lead, é possível configurar a atualização instantânea dos leads que você recebe do Facebook no seu sistema de CRM. As opções incluem o seguinte:
Parceiros de CRM⁠ compatíveis com anúncios de lead.
Integração personalizada usando Webhooks e a Graph API. Consulte a documentação sobre webhooks de anúncios de lead para saber mais.
A Graph API é a principal forma de obter dados dentro e fora do Facebook e é uma API de baixo nível baseada em HTTP que pode ser usada para recuperar novos anúncios de lead em tempo real.
Integração com a API de Conversões
Para melhorar o desempenho dos seus anúncios e otimizar a qualidade dos leads, compartilhe os dados de lead do CRM com a Meta. Dessa forma, a Meta pode usar os dados dos leads diretamente do seu CRM e, assim, melhorar a otimização de qualidade.
Veja mais informações sobre como conectar seu CRM à API de Conversões no guia Integração de CRM de leads de conversão.
Recuperar leads
Para ler os dados de lead, você precisará ter acesso de administrador da Página ou permissões flexíveis. Com a última opção, é possível recuperar leads sem o acesso de administrador da Página.
Formas de recuperar leads
Leitura em massa com a Graph API: recupere os leads como objetos JSON para facilitar a integração e o mapeamento de dados. Faça isso se quiser buscar novos leads algumas vezes por dia. Para atualizações mais frequentes, use Webhooks. Consulte Como recuperar cadastros: leitura em massa para saber mais.
Webhooks: indicados para a integração do CRM com o Facebook, permitindo o recebimento de cadastros em tempo real. Recupere todos os novos leads em tempo real. Sempre que um novo lead é enviado, seu ponto de extremidade recebe uma atualização correspondente. Você pode buscar as informações do lead ao acessar a API de Marketing. Consulte Webhooks da Meta sobre anúncios de lead para a gestão do relacionamento com o cliente para ver mais informações.
Central de Leads: consulte Gerenciar e baixar leads no Meta Business Suite⁠ para saber mais.
Saiba mais
Graph API: Visão geral
Graph API: Limites de volume
Formulários de lead para anúncios
Como recuperar leads
Como recuperar leads: Webhooks
Testes e solução de problemas
Central de Ajuda para Empresas: Sobre os anúncios de lead⁠
Central de Ajuda para Empresas: Como verificar sua empresa⁠
Você achou esta página útil?