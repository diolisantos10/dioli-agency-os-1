---
titulo: "Conversions API — visão geral"
url: https://developers.facebook.com/documentation/ads-commerce/conversions-api
capturado_em: 2026-09-11
hash: 6db2e8155cec10db
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
API de Conversões
Updated: 28 de jun de 2026
Copiar para LLM
Ver como Markdown
A API de Conversões conecta os dados de marketing do anunciante (como eventos do site, evento do app, eventos de mensagens empresariais e conversões offline) de um servidor, site, plataforma, app ou CRM aos sistemas da Meta que otimizam o direcionamento de anúncios, reduzem os custos e mensuram resultados.
Em vez de manter pontos de conexão separados para cada fonte de dados, os anunciantes podem usar a API de Conversões para enviar vários tipos de eventos e reduzir o número de integrações separadas. No caso de integrações diretas, isso envolve estabelecer uma conexão entre o servidor de um anunciante e o ponto de extremidade da API de Conversões da Meta.
Os eventos do servidor estão vinculados ao ID de um conjunto de dados e são processados como eventos enviados por meio do Pixel da Meta, SDK do Facebook para iOS ou Android, SDK do Parceiro de Métricas para Aplicativos, conjunto de eventos offline ou carregamento de CSV. Isso significa que os eventos do servidor podem ser usados para mensuração, relatórios e otimização de maneira semelhante a outros canais de conexão. Os eventos offline podem ser usados para mensuração de eventos offline atribuídos, além da criação ou mensuração de públicos personalizados offline.
Para otimizar o desempenho e a mensuração dos anúncios, siga as boas práticas da API de Conversões.
Etapas recomendadas
Primeiros passos: escolha o método de integração mais adequado para você, veja os pré-requisitos para usar a API e entenda como começar.
Implemente a API e comece a enviar pedidos: comece a fazer pedidos POST e saiba mais sobre eventos descartados, pedidos em lote e o tempo de transação dos eventos.
Verifique sua configuração: confirme se a Meta recebeu seus eventos e se eles foram desduplicados e correspondidos corretamente.
Documentação
Parâmetros da API
Conheça os parâmetros obrigatórios e opcionais que podem ser usados para melhorar a atribuição de anúncios e otimizar a veiculação.
Auxiliar de carga
Veja como sua carga deve ser estruturada quando é enviada do seu servidor à Meta.
Solução de problemas
Saiba como gerenciar códigos de erro retornados pela API de Conversões.
Recursos
Eventos do Pixel da Meta
Saiba mais sobre os eventos padrão e os eventos personalizados do Pixel da Meta.
Central de Ajuda para Empresas
Na nossa Central de Ajuda, leia Sobre a API de Conversões⁠ e Testar os eventos do servidor usando a ferramenta Eventos de Teste⁠.
Manual
Consulte o Manual de integração direta para desenvolvedores (PDF)⁠.
Opções de processamento de dados
Saiba mais sobre o recurso Uso Limitado de Dados e a implementação para a API de Conversões.
Você achou esta página útil?