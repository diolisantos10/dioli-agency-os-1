---
titulo: "Google Analytics — Data API (GA4): fundamentos de relatório"
url: https://developers.google.com/analytics/devguides/reporting/data/v1/basics?hl=pt-br
capturado_em: 2026-09-10
hash: 77250c18a129044d
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Crie um relatório
Nesta página
Visão geral de relatórios
Especificar uma fonte de dados
Gerar um relatório
Consultar métricas
Leia a resposta

Este guia explica como criar um relatório básico para seus dados do Google Analytics usando a API de dados do Google Analytics v1. Os relatórios da API Data v1 são semelhantes aos que você pode gerar na seção Relatórios da interface do Google Analytics.

Este guia aborda os relatórios principais, o recurso geral de relatórios da API Data. A API Data v1 também tem relatórios em tempo real e relatórios de funil especializados.

runReport é o método recomendado para consultas e é usado em todos os exemplos deste guia. Consulte Recursos avançados para uma visão geral de outros métodos principais de geração de relatórios. Teste suas consultas com o Query Explorer.

Visão geral de relatórios

Os relatórios são tabelas de dados de eventos de uma propriedade do Google Analytics. Cada tabela de relatório tem as dimensões e métricas solicitadas na consulta, com dados em linhas individuais.

Use filtros para retornar apenas as linhas que correspondem a uma determinada condição e paginação para navegar pelos resultados.

Observação: se os dados do relatório nos relatórios não corresponderem à interface do Google Analytics, consulte Expectativas de dados de relatórios para mais informações.

Confira um exemplo de tabela de relatório que mostra uma dimensão (Country) e uma métrica (activeUsers):

País	Usuários ativos
Japão	2541
França	12
Especificar uma fonte de dados

Toda solicitação runReport exige que você especifique um ID da propriedade do Google Analytics. A propriedade do Google Analytics especificada é usada como o conjunto de dados para essa consulta. Veja um exemplo:

POST https://analyticsdata.googleapis.com/v1beta/properties/GA_PROPERTY_ID:runReport

A resposta dessa solicitação inclui apenas dados da propriedade do Analytics especificada como GA_PROPERTY_ID.

Se você usar as bibliotecas de cliente da API Data, especifique a fonte de dados no parâmetro property, no formato properties/GA_PROPERTY_ID. Consulte o guia de início rápido para exemplos de como usar as bibliotecas de cliente.

Consulte Enviar eventos do Measurement Protocol para o Google Analytics se quiser incluir esses eventos nos seus relatórios.

Gerar um relatório

Para gerar um relatório, crie um objeto RunReportRequest. Recomendamos começar com os seguintes parâmetros:

Uma entrada válida no campo dateRanges.
Pelo menos uma entrada válida no campo dimensions.
Pelo menos uma entrada válida no campo metrics.

Confira um exemplo de solicitação com os campos recomendados:

HTTP
Java
PHP
Python
Node.js
POST https://analyticsdata.googleapis.com/v1beta/properties/GA_PROPERTY_ID:runReport
  {
    "dateRanges": [{ "startDate": "2023-09-01"", "endDate": "2023-09-15" }],
    "dimensions": [{ "name": "country" }],
    "metrics": [{ "name": "activeUsers" }]
  }

Consultar métricas

Metrics são as medidas quantitativas dos seus dados de eventos. É necessário especificar pelo menos uma métrica nas solicitações runReport.

Consulte Métricas da API para ver uma lista completa das métricas que podem ser consultadas.

Confira um exemplo de solicitação que mostra três métricas agrupadas pela dimensão date:

HTTP
Java
PHP
Python
Node.js
POST https://analyticsdata.googleapis.com/v1beta/properties/GA_PROPERTY_ID:runReport
  {
    "dateRanges": [{ "startDate": "7daysAgo", "endDate": "yesterday" }],
    "dimensions": [{ "name": "date" }],
    "metrics": [
      {
        "name": "activeUsers"
      },
      {
        "name": "newUsers"
      },
      {
        "name": "totalRevenue"
      }
    ],
  }

Confira um exemplo de resposta que mostra 1.135 usuários ativos, 512 novos usuários e uma receita total de 73.0841 na moeda da propriedade do Google Analytics na data 20231025 (25 de outubro de 2023).

"rows": [
...
{
  "dimensionValues": [
    {
      "value": "20231025"
    }
  ],
  "metricValues": [
    {
      "value": "1135"
    },
    {
      "value": "512"
    },
    {
      "value": "73.0841"
    }
  ]
},
...
],

Leia a resposta

A resposta do relatório contém um cabeçalho e linhas de dados. O cabeçalho consiste em DimensionHeaders e MetricHeaders, que listam as colunas no relatório. Cada linha consiste em DimensionValues e MetricValues. A ordem das colunas é consistente na solicitação, no cabeçalho e nas linhas.

Confira um exemplo de resposta para a solicitação de exemplo anterior:

{
  "dimensionHeaders": [
    {
      "name": "country"
    }
  ],
  "metricHeaders": [
    {
      "name": "activeUsers",
      "type": "TYPE_INTEGER"
    }
  ],
  "rows": [
    {
      "dimensionValues": [
        {
          "value": "Japan"
        }
      ],
      "metricValues": [
        {
          "value": "2541"
        }
      ]
    },
    {
      "dimensionValues": [
        {
          "value": "France"
        }
      ],
      "metricValues": [
        {
          "value": "12"
        }
      ]
    }
  ],
  "metadata": {},
  "rowCount": 2
}

Agrupar e filtrar dados

As dimensões são atributos qualitativos que podem ser usados para agrupar e filtrar seus dados. Por exemplo, a dimensão city indica a cidade, como Paris ou New York, em que cada evento foi originado. As dimensões são opcionais para solicitações runReport, e é possível usar até nove dimensões por solicitação.

Consulte as dimensões da API para ver uma lista completa das dimensões que você pode usar para agrupar e filtrar seus dados.

Grupo

Confira um exemplo de solicitação que agrupa usuários ativos em três dimensões:

HTTP
Java
PHP
Python
Node.js
POST https://analyticsdata.googleapis.com/v1beta/properties/GA_PROPERTY_ID:runReport
  {
    "dateRanges": [{ "startDate": "7daysAgo", "endDate": "yesterday" }],
    "dimensions": [
      {
        "name": "country"
      },
      {
        "name": "region"
      },
      {
        "name": "city"
      }
    ],
    "metrics": [{ "name": "activeUsers" }]
  }
  ```

Confira um exemplo de linha de relatório para a solicitação anterior. Essa linha mostra que houve 47 usuários ativos durante o período especificado com eventos da Cidade do Cabo, na África do Sul.

"rows": [
...
{
  "dimensionValues": [
    {
      "value": "South Africa"
    },
    {
      "value": "Western Cape"
    },
    {
      "value": "Cape Town"
    }
  ],
  "metricValues": [
    {
      "value": "47"
    }
  ]
},
...
],

Filtro

Você gera relatórios com dados apenas para valores específicos de dimensões. Para filtrar dimensões, especifique um FilterExpression no campo dimensionFilter.

Confira um exemplo que retorna um relatório de série temporal de eventCount quando eventName é first_open para cada date :

HTTP
Java
PHP
Python
Node.js
POST https://analyticsdata.googleapis.com/v1beta/properties/GA_PROPERTY_ID:runReport
  {
    "dateRanges": [{ "startDate": "7daysAgo", "endDate": "yesterday" }],
    "dimensions": [{ "name": "date" }],
    "metrics": [{ "name": "eventCount" }],
    "dimensionFilter": {
      "filter": {
        "fieldName": "eventName",
        "stringFilter": {
          "value": "first_open"
        }
      }
    },
  }

Confira outro exemplo de FilterExpression, em que andGroup inclui apenas dados que atendem a todos os critérios na lista de expressões. Este dimensionFilter seleciona quando browser é Chrome e countryId é US:

HTTP
Java
PHP
Python
Node.js
...
"dimensionFilter": {
  "andGroup": {
    "expressions": [
      {
        "filter": {
          "fieldName": "browser",
          "stringFilter": {
            "value": "Chrome"
          }
        }
      },
      {
        "filter": {
          "fieldName": "countryId",
          "stringFilter": {
            "value": "US"
          }
        }
      }
    ]
  }
},
...

Um orGroup inclui dados que atendem a qualquer um dos critérios na lista de expressões.

Um notExpression exclui dados que correspondem à expressão interna. Confira um dimensionFilter que retorna dados apenas quando o pageTitle não é My Homepage. O relatório mostra dados de eventos para todos os pageTitle, exceto My Homepage:

HTTP
Java
PHP
Python
Node.js
...
"dimensionFilter": {
  "notExpression": {
    "filter": {
      "fieldName": "pageTitle",
      "stringFilter": {
        "value": "My Homepage"
      }
    }
  }
},
...

Um inListFilter corresponde a dados de qualquer um dos valores na lista. Confira uma dimensionFilter que retorna dados de eventos em que eventName é qualquer um dos seguintes: purchase, in_app_purchase e app_store_subscription_renew:

HTTP
Java
PHP
Python
Node.js
...
"dimensionFilter": {
    "filter": {
      "fieldName": "eventName",
      "inListFilter": {
        "values": ["purchase",
        "in_app_purchase",
        "app_store_subscription_renew"]
      }
    }
  },
...

Navegar por relatórios longos

Por padrão, o relatório contém apenas as primeiras 10 mil linhas de dados de eventos. Para ver até 250.000 linhas no relatório, inclua "limit": 250000 no RunReportRequest.

Para relatórios com mais de 250.000 linhas, é preciso enviar uma série de solicitações e navegar pelos resultados. Por exemplo, esta é uma solicitação para as primeiras 250.000 linhas:

HTTP
Java
PHP
Python
Node.js
POST https://analyticsdata.googleapis.com/v1beta/properties/GA_PROPERTY_ID:runReport
  {
    ...
    "limit": 250000,
    "offset": 0
  }

O parâmetro rowCount na resposta indica o número total de linhas, independente dos valores limit e offset na solicitação. Por exemplo, se a resposta mostrar "rowCount": 572345, você precisará de três solicitações:

offset	limite	Intervalo de índices de linha retornados
0	250000	[ 0, 249999]
250000	250000	[250000, 499999]
500000	250000	[500000, 572345]

Confira um exemplo de solicitação para as próximas 250.000 linhas. Todos os outros parâmetros, como dateRange, dimensions e metrics, precisam ser iguais à primeira solicitação.

HTTP
Java
PHP
Python
Node.js
POST https://analyticsdata.googleapis.com/v1beta/properties/GA_PROPERTY_ID:runReport
  {
    ...
    "limit": 250000,
    "offset": 250000
  }

Observação: a lógica de paginação da API Data é diferente do padrão de design de paginação comum de outras APIs do Google devido ao formato tabular das respostas da API Data.
Usar vários períodos

Uma solicitação de relatório pode recuperar dados de vários dateRanges. Por exemplo, este relatório compara as duas primeiras semanas de agosto em 2022 e 2023:

HTTP
Java
PHP
Python
Node.js
POST https://analyticsdata.googleapis.com/v1beta/properties/GA_PROPERTY_ID:runReport
  {
    "dateRanges": [
      {
        "startDate": "2022-08-01",
        "endDate": "2022-08-14"
      },
      {
        "startDate": "2023-08-01",
        "endDate": "2023-08-14"
      }
    ],
    "dimensions": [{ "name": "platform" }],
    "metrics": [{ "name": "activeUsers" }]
  }

Quando você inclui vários dateRanges em uma solicitação, uma coluna dateRange é adicionada automaticamente à resposta. Quando a coluna dateRange é date_range_0, os dados dessa linha são referentes ao primeiro período. Quando a coluna dateRange é date_range_1, os dados dessa linha são para o segundo período.

Confira um exemplo de resposta para dois períodos:

{
  "dimensionHeaders": [
    {
      "name": "platform"
    },
    {
      "name": "dateRange"
    }
  ],
  "metricHeaders": [
    {
      "name": "activeUsers",
      "type": "TYPE_INTEGER"
    }
  ],
  "rows": [
    {
      "dimensionValues": [
        {
          "value": "iOS"
        },
        {
          "value": "date_range_0"
        }
      ],
      "metricValues": [
        {
          "value": "774"
        }
      ]
    },
    {
      "dimensionValues": [
        {
          "value": "Android"
        },
        {
          "value": "date_range_1"
        }
      ],
      "metricValues": [
        {
          "value": "335"
        }
      ]
    },
    ...
  ],
}

Próximas etapas

Consulte recursos avançados e relatórios em tempo real para uma visão geral dos recursos de relatórios mais avançados da API Data v1.

Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-09-07 UTC.