---
titulo: "Google Analytics — Data API (GA4): visão geral"
url: https://developers.google.com/analytics/devguides/reporting/data/v1?hl=pt-br
capturado_em: 2026-09-06
hash: c5cdd63d40190e8f
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Visão geral da API Google Analytics Data
Nesta página
Consistência de dados e identidade do relatório
Primeiros passos
Métodos disponíveis
Dimensões e métricas aceitas

Você pode usar a API Data para acessar dados de relatórios do Google Analytics (Google Analytics) de maneira programática.

Saiba mais sobre as propriedades do Google Analytics.

Os dados retornados pela API são consistentes com os dados mostrados na interface do Google Analytics e respeitam totalmente as configurações de identidade de relatórios-- como mesclada, observada ou baseada em dispositivos--configuradas para sua propriedade do Google Analytics.

Essa API oferece recursos nos canais Alfa e Beta. Os produtos Alfa e Beta podem ter suporte limitado, e as mudanças realizadas podem não ser compatíveis com outras versões Alfa e Beta.

Alfa: os recursos estão em um estágio inicial de pré-lançamento. Tentamos informar você sobre futuras mudanças, mas podem acontecer alterações interruptivas antes de a API ser lançada publicamente.

Beta: não são esperadas mudanças interruptivas nesse canal.

Para receber comunicados oficiais da API Google Analytics, inscreva-se no grupo de notificações da API Google Analytics.

Confira alguns exemplos de relatórios que você pode gerar usando a API de dados do Google Analytics v1:

Quantos usuários ativos por dia seu app Android teve na última semana.
Quantas visualizações de página as 10 principais páginas do seu site tiveram nos últimos 28 dias.
Quantos usuários ativos por país seu app iOS teve nos últimos 30 minutos.

Você também pode usar a API de dados do Google Analytics v1 para fazer o seguinte:

criar painéis personalizados para exibir os dados do Google Analytics;
automatizar tarefas de relatórios complexas para economizar tempo;
integrar seus dados do Google Analytics a outros aplicativos de negócios.
Consistência de dados e identidade do relatório

A API Google Analytics Data v1 acessa os mesmos dados de relatórios que a interface do Google Analytics. Os dados retornados pela API respeitam totalmente as configurações de identidade do relatório configuradas para sua propriedade do Google Analytics. Assim, as contagens de usuários, a eliminação de duplicação e a modelagem de dados são alinhadas ao espaço de identificação escolhido, como mesclado, observado ou baseado em dispositivos, nas configurações da propriedade.

Para saber mais sobre como diferentes espaços de identificação podem afetar seus relatórios, consulte Identidade do relatório.

Primeiros passos

Para começar, consulte o guia de início rápido da biblioteca de cliente. Há bibliotecas de cliente em Java, Python, Node.js e outras linguagens para simplificar sua implementação.

Métodos disponíveis

Confira uma lista dos métodos da API Data. Para mais detalhes, consulte a documentação de referência.

runReport: retorna um relatório personalizado dos seus dados de eventos do Google Analytics e é o método preferido para consultas de relatórios simples.
batchRunReports : é uma versão em lote do método runReport que permite gerar vários relatórios usando uma única chamada de API.
runPivotReport Este método retorna um relatório dinâmico personalizado com os dados de eventos do Google Analytics. Os relatórios dinâmicos são formatos mais avançados e expressivos do que os relatórios normais. Cada tabela dinâmica descreve as colunas e linhas de dimensões visíveis na resposta do relatório.
batchRunPivotReports : é uma versão em lote do método runPivotReport que permite gerar vários relatórios usando uma única chamada de API.
getMetadata : retorna metadados para dimensões e métricas disponíveis nos métodos de relatórios. Usado para explorar as dimensões e métricas. A resposta desse método também inclui as dimensões e métricas personalizadas disponíveis para a propriedade especificada do Google Analytics.
checkCompatibility : lista as dimensões e métricas que podem ser adicionadas a uma solicitação de relatório e manter a compatibilidade.
runRealtimeReport Este método retorna um relatório personalizado dos dados de eventos em tempo real da sua propriedade. Os eventos aparecem nos relatórios em tempo real segundos depois de serem enviados ao Google Analytics. Os relatórios em tempo real mostram eventos e dados de uso para os períodos que variam do momento atual até 30 minutos atrás (até 60 minutos para propriedades do Google Analytics 360).
properties.audienceExports Um grupo de métodos que permite gerar exportações de público-alvo, que incluem um snapshot dos usuários em um público-alvo.
properties.recurringAudienceLists (pré-lançamento) um grupo de métodos que permite gerenciar exportações de público-alvo recorrentes. Uma exportação de público-alvo recorrente produz novas listas de público-alvo todos os dias.
runFunnelReport (pré-lançamento): retorna um relatório de funil personalizado dos dados de eventos do Google Analytics. A análise detalhada de funil permite que você visualize as etapas que os usuários realizam até concluir uma tarefa e veja rapidamente o desempenho deles em cada etapa.
Dimensões e métricas aceitas

Para uma lista de todas as dimensões e métricas aceitas pela API Data, consulte a documentação do esquema da API.

Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-08-12 UTC.