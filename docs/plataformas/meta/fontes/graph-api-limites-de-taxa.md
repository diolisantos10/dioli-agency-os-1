---
titulo: "Graph API — limites de taxa (rate limiting)"
url: https://developers.facebook.com/docs/graph-api/overview/rate-limiting
capturado_em: 2026-09-11
hash: 083c8e599b3e9467
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Entrada da pesquisa
​
Graph API
Visão geral
SDKs do Facebook
Resultados paginados
Limites de volume
Controle de versões
Introdução
Solicitações em lote
Solicitações de depuração
Solução de erros
Field Expansion
Secure Requests
Registro de alterações
Reference
Limites de volume

Um limite de volume é o número de chamadas de API que um app ou usuário pode fazer dentro de um determinado intervalo de tempo. Se esse limite ou os limites de CPU e de tempo total forem excedidos, o app ou o usuário poderá ser limitado. As solicitações da API feitas por esse app ou usuário apresentarão falha.

Todas as solicitações da API estão sujeitas à limitação de volume. As solicitações da Graph API estão sujeitas aos limites de volume da plataforma. Já as solicitações da API de Marketing e da plataforma do Instagram estão sujeitas aos limites de volume de casos de uso de empresas (BUC, pelas iniciais em inglês).

As solicitações da API de Páginas estão sujeitas aos limites de volume da plataforma ou de BUC, dependendo do token usado na solicitação. As solicitações feitas com tokens de acesso do app ou tokens de acesso do usuário estão sujeitas aos limites de volume da plataforma. Já as solicitações feitas com tokens de acesso do usuário do sistema ou tokens de acesso à Página estão sujeitas aos limites de volume do caso de uso da empresa.

As estatísticas de uso do limite de volume em tempo real são descritas em cabeçalhos incluídos na maioria das respostas de API depois que chamadas suficientes tenham sido feitas a um ponto de extremidade. As estatísticas de uso do limite de volume da plataforma também são exibidas no Painel de Apps. Depois de o limite de volume ser atingido, qualquer solicitação subsequente feita pelo app falhará. A API retornará um código de erro até passar tempo suficiente para que a contagem de chamadas fique abaixo do limite.

Quando for possível aplicar os limites de volume de casos de uso de empresas e os da plataforma, os da empresa serão implementados.

Limites de volume da plataforma

Os limites de volume da plataforma são monitorados no nível do usuário ou do app individual, dependendo do tipo de token utilizado na solicitação.

Apps

As solicitações da Graph API feitas com um token de acesso de app são computadas conforme o limite de volume do app. A contagem de chamadas de um app é o número de chamadas que ele pode fazer durante o período de 1 hora. O cálculo é feito da seguinte forma:

Calls within one hour = 200 * Number of Users

Number of Users se baseia na quantidade de usuários ativos diários exclusivos do app. Em casos com períodos lentos de uso diário (por exemplo, se o app tem alta atividade nos finais de semana, mas atividade baixa nos dias de semana), os usuários ativos semanais ou mensais serão usados para calcular o número de usuários do app. Os apps com alto engajamento diário terão limites de volume maiores do que aqueles com baixo engajamento diário, independentemente do número real de instalações do app.

Lembre-se de que esse limite não é por usuário, mas por chamadas feitas pelo app. Qualquer usuário individual pode fazer mais de 200 chamadas por hora, desde que o total de chamadas do app não exceda o limite. Por exemplo, se tiver 100 usuários, o app poderá fazer 20 mil chamadas por hora. Porém, os 10 usuários mais engajados podem fazer 19 mil dessas chamadas.

Usuários

As solicitações da Graph API feitas com um token de acesso de usuário são computadas conforme a contagem de chamadas do usuário. A contagem de chamadas de um usuário é o número de chamadas que ele pode fazer durante o período de 1 hora. Devido a preocupações com privacidade, não revelamos os valores reais da contagem de chamadas para os usuários.

Lembre-se de que a contagem de chamadas de um usuário pode ser distribuída entre diversos apps. Por exemplo, o usuário pode fazer X chamadas no App 1 e Y chamadas no App 2. Se X+Y exceder a contagem de chamadas do usuário, ele terá o volume limitado. Isso não significa que o app está fazendo algo errado. Talvez o usuário esteja usando vários apps ou usando a API de forma incorreta.

Cabeçalhos

Os pontos de extremidade que receberem solicitações suficientes do app incluirão um cabeçalho HTTP X-App-Usage ou X-Ad-Account-Usage (para chamadas da API de Anúncios versão 3.3 e anteriores) nas respostas. O cabeçalho terá uma string formatada em JSON que descreve o uso do limite de volume atual do app.

Conteúdo do cabeçalho

Chave	Descrição do valor

call_count

	

Um número inteiro que expressa o percentual de chamadas feitas pelo app durante uma janela de 1 hora.

total_cputime

	

Um número inteiro que expressa o percentual de tempo de CPU alocado para o processamento de consultas.

total_time

	

Um número inteiro que expressa o percentual de tempo total alocado para o processamento de consultas.

Conteúdo do cabeçalho X-Ad-Account-Usage
Chave	Descrição do valor

acc_id_util_pct

	

A porcentagem de chamadas feitas para esta conta de anúncios antes que o limite de volume seja atingido.

reset_time_duration

	

Tempo (em segundos) necessário para redefinir o limite de volume atual para 0.

ads_api_access_tier

	

Os níveis permitem que o app acesse a API de Marketing. Por padrão, os apps têm o nível development_access, e Standard_access habilita uma limitação de volume menor. Para aumentar o limite de volume e chegar ao nível padrão, você pode solicitar "acesso avançado" ao recurso Acesso Padrão ao Gerenciamento de Anúncios.

Tempo total de CPU

A quantidade de tempo de CPU para a solicitação ser processada. Quando total_cputime chega a 100, as chamadas podem ser limitadas.

Tempo total

A quantidade de tempo para a solicitação ser processada. Quando total_time chega a 100, as chamadas podem ser limitadas.

Exemplo do valor do cabeçalho X-App-Usage
x-app-usage: {
    "call_count": 28,         //Percentage of calls made 
    "total_time": 25,         //Percentage of total time
    "total_cputime": 25       //Percentage of total CPU time
}
Exemplo do valor do cabeçalho X-Ad-Account-Usage
x-ad-account-usage: {
    "acc_id_util_pct": 9.67,   //Percentage of calls made for this ad account.
    "reset_time_duration": 100,   //Time duration (in seconds) it takes to reset the current rate limit score.
    "ads_api_access_tier": 'standard_access'   //Tiers allows your app to access the Marketing API. standard_access enables lower rate limiting.
}
Painel

O Painel de Apps exibe o número de usuários do app com o volume limitado, o percentual de uso atual dos limites de volume do app, além de mostrar a atividade média nos últimos 7 dias. No cartão Limite de volume do aplicativo, clique em Ver detalhes e passe o ponteiro do mouse sobre um ponto no gráfico para ver mais detalhes sobre o uso naquele momento específico. Como o uso depende do volume de chamadas, talvez o gráfico não mostre um período completo de 7 dias. Os apps com volume maior de chamadas mostrarão mais dias.

Códigos de erro

Quando um app ou usuário atingir o limite de volume, as solicitações feitas por ele serão preenchidas, e a API responderá com um código de erro.

Códigos de erro de limitações

Código de erro	Descrição

4

	

Indica que o app cujo token está sendo usado na solicitação atingiu o limite de volume.

17

	

Indica que o usuário cujo token está sendo usado na solicitação atingiu o limite de volume.

17 with subcode 2446079

	

Indica que o token usado na solicitação da API de Anúncios versão 3.3 ou anteriores atingiu o limite de volume.

32

	

Indica que o usuário ou o app cujo token está sendo usado na solicitação da API de Páginas atingiu o limite de volume.

613

	

Indica que um limite de volume personalizado foi atingido. Para resolver esse problema, consulte os documentos específicos da API para a qual você está fazendo chamadas e verifique os limites de volume personalizados aplicáveis.

613 with subcode 1996

	

Indica que observamos um comportamento inconsistente no volume de solicitações para a API feitas pelo app. Se você tiver feito alterações que afetam o número de solicitações à API, poderá encontrar esse erro.

Exemplo de resposta
{
  "error": {
    "message": "(#32) Page request limit reached",
    "type": "OAuthException",
    "code": 32,
    "fbtrace_id": "Fz54k3GZrio"
  }
}
Códigos de limitação da estabilidade do Facebook

Código de erro	Descrição

throttled

	

Se a consulta é limitada ou não. Valores: True ou False.

backend_qps

	

Primeiro fator de limitação backend_qps. Valores compatíveis:

actual_score: backend_qps real do app. Valor: 8.
limit: limite de backend_qps do app. Valor: 5.
more_info: as consultas precisam de um grande número de solicitações de back-end para controlar. Sugerimos que você envie consultas simplificadas ou menos consultas, com intervalos mais curtos, menos identificações de objeto, entre outros.

complexity_score

	

Segundo fator de limitação complexity_score. Valores compatíveis:

actual_score: complexity_score real do app. Valor: 0.1.
limit: limite de complexity_score do app. Valor: 0.01.
more_info: as consultas com complexity_score alto são muito complexas e exigem grandes quantidades de dados. Sugerimos que você simplifique as consultas, com intervalos mais curtos, menos identificações de objeto, métricas, detalhamentos, entre outros. Divida consultas grandes e complexas em consultas menores e espaçadas.
Boas práticas
Quando o limite tiver sido atingido, pare de fazer chamadas à API. Se você seguir fazendo chamadas, a contagem delas continuará aumentando. Com isso, levará ainda mais tempo para que as chamadas voltem a ser bem-sucedidas.
Espalhe as consultas de maneira uniforme para evitar picos de tráfego.
Use filtros para limitar o tamanho da resposta de dados e evite chamadas que solicitem dados sobrepostos.
Verifique o cabeçalho HTTP X-App-Usage para ver se a conta de anúncios está próxima do limite e quando você poderá voltar a fazer chamadas, caso o limite tenha sido atingido.
Se os usuários estiverem limitados, verifique se o seu app não é a causa. Reduza as chamadas do usuário ou espace-as de maneira uniforme ao longo do tempo.
Limites de volume de casos de uso de empresas

Todas as solicitações da API de Marketing e da API de Páginas feitas com um token de acesso de sistema ou um token de acesso à Página estão sujeitas aos limites de volume de casos de uso de empresas (BUC, pelas iniciais em inglês) e dependem dos pontos de extremidade sendo consultados.

Para a API de Marketing, o limite de volume é aplicado à conta de anúncios no mesmo caso de uso da empresa. Por exemplo, todos os pontos de extremidade com caso de uso do Gerenciamento de Anúncios compartilharão a cota total na mesma conta de anúncios. Se um ponto de extremidade fizer um número excessivo de solicitações de API, outros pontos de extremidade configurados com o mesmo caso de uso da empresa também receberão erros referentes à limitação de volume. A cota depende do nível de acesso da API de Marketing do app. O nível de acesso padrão da API de Marketing terá mais cotas do que o nível de acesso de desenvolvimento. Por padrão, um novo app deve estar no nível de desenvolvimento. Se você precisar obter mais cota de limitação de volume, atualize o Acesso Padrão ao Gerenciamento de Anúncios para o acesso avançado na análise do app.

Insights sobre Anúncios
Gerenciamento de anúncios
Catálogo
Público personalizado
Plataforma do Instagram
Geração de leads
	
Messenger
Páginas
Gerenciador de efeito de comércio do Spark AR
API de Gerenciamento do WhatsApp Business
Insights sobre Anúncios

As solicitações feitas pelo seu app à API de Insights sobre Anúncios são contabilizadas para as métricas de limite de volume, como número de chamadas, tempo total de CPU e tempo total. A contagem de chamadas de um app é o número de chamadas que ele pode fazer durante o período de 1 hora. O cálculo é feito da seguinte forma:

Para apps com acesso padrão ao recurso Acesso Padrão ao Gerenciamento de Anúncios:

Calls within one hour = 600 + 400 * Number of Active ads - 0.001 * User Errors

Para apps com acesso avançado ao recurso Acesso Padrão ao Gerenciamento de Anúncios:

Calls within one hour = 190000 + 400 * Number of Active ads - 0.001 * User Errors

Number of Active ads é o número de anúncios veiculados no momento por conta de anúncios. User Erros é a quantidade de erros recebidos ao fazer uma chamada de API. Para obter um limite de volume mais alto, inscreva-se no recurso Acesso Padrão ao Gerenciamento de Anúncios.

Essa limitação também pode estar sujeita ao tempo total de CPU e ao tempo total de processamento durante o período de 1 hora. Para mais detalhes, verifique o cabeçalho HTTP X-Business-Use-Casetotal_cputime e total_time.

Se estiver recebendo erros de limitação de volume, você também pode consultar estimated_time_to_regain_access no cabeçalho X-Business-Use-Case para ver o tempo de bloqueio estimado.

Gerenciamento de anúncios

As solicitações feitas pelo seu app à API de Gerenciamento de Anúncios são contabilizadas para as métricas de limite de volume, como número de chamadas, tempo total de CPU e tempo total. A contagem de chamadas de um app é o número de chamadas que ele pode fazer durante o período de 1 hora. O cálculo é feito da seguinte forma:

Para apps com acesso padrão ao recurso Acesso Padrão ao Gerenciamento de Anúncios:

Calls within one hour = 300 + 40 * Number of Active ads

Para apps com acesso avançado ao recurso Acesso Padrão ao Gerenciamento de Anúncios:

Calls within one hour = 100000 + 40 * Number of Active ads

Number of Active Ads é o número de anúncios para cada conta de anúncios.

Essa limitação também pode estar sujeita ao tempo total de CPU e ao tempo total de processamento durante o período de 1 hora. Para mais detalhes, verifique o cabeçalho HTTP X-Business-Use-Casetotal_cputime e total_time.

Se estiver recebendo erros de limitação de volume, você também pode consultar estimated_time_to_regain_access no cabeçalho X-Business-Use-Case para ver o tempo de bloqueio estimado.

Catálogo
Lote de catálogos

As solicitações feitas pelo seu app são contabilizadas nas métricas de limite de volume, como número de chamadas, tempo total de CPU e tempo total durante o período de 1 minuto para cada ID de catálogo. Esse cálculo é feito da seguinte forma:

Calls within one minute = 8 + 8 * log2(DA impressions + PDP visits)

"DA impressions" e "PDP visits" representam o número de impressões de anúncios dinâmicos e visitas com intenção à página de detalhes do produto do catálogo individual nos últimos 28 dias. Quanto mais usuários visualizam os produtos do catálogo, maior é a cota de chamadas alocada.

Tipo de chamada	Ponto de extremidade

POST

	

/{catalog_id}/items_batch

POST

	

/{catalog_id}/localized_items_batch

POST

	

/{catalog_id}/batch

Gerenciamento de catálogos

As solicitações feitas pelo seu app são contabilizadas em cada ID de catálogo com o número de chamadas que ele pode fazer durante o período de 1 hora. Esse cálculo é feito da seguinte forma:

Calls within one hour = 20,000 + 20,000 * log2(DA impressions + PDP visits)

"DA impressions" e "PDP visits" representam o número de impressões de anúncios dinâmicos e visitas com intenção à página de detalhes do produto da empresa (em todos os catálogos) nos últimos 28 dias. Quanto mais usuários visualizam os produtos do catálogo, maior é a cota de chamadas alocada.

Essa fórmula se aplica a vários pontos de extremidade de catálogos.

Para ver informações adicionais sobre como obter a utilização do limite de volume atual, consulte Cabeçalhos.

Essa limitação também pode estar sujeita ao tempo total de CPU e ao tempo total de processamento durante o período de 1 hora. Para mais detalhes, verifique o cabeçalho HTTP X-Business-Use-Casetotal_cputime e total_time.

Se estiver recebendo erros de limitação de volume, você também pode consultar estimated_time_to_regain_access no cabeçalho X-Business-Use-Case para ver o tempo de bloqueio estimado.

Público Personalizado

As solicitações feitas pelo seu app à API de Público Personalizado são contabilizadas para as métricas de limite de volume, como número de chamadas, tempo total de CPU e tempo total. A contagem de chamadas de um app é o número de chamadas que ele pode fazer durante o período de 1 hora. Esse cálculo nunca excederá 700.000 e é feito da seguinte forma:

Para apps com acesso padrão ao recurso Acesso Padrão ao Gerenciamento de Anúncios:

Calls within one hour = 5000 + 40 * Number of Active Custom Audiences

Para apps com acesso avançado ao recurso Acesso Padrão ao Gerenciamento de Anúncios:

Calls within one hour = 190000 + 40 * Number of Active Custom Audiences

Number of Active Custom Audiences é o número de públicos personalizados ativos para cada conta de anúncios.

Essa limitação também pode estar sujeita ao tempo total de CPU e ao tempo total de processamento durante o período de 1 hora. Para mais detalhes, verifique o cabeçalho HTTP X-Business-Use-Casetotal_cputime e total_time.

Se estiver recebendo erros de limitação de volume, você também pode consultar estimated_time_to_regain_access no cabeçalho X-Business-Use-Case para ver o tempo de bloqueio estimado.

Plataforma do Instagram

Calls to the Instagram Platform endpoints, excluding messaging, are counted against the calling app's call count. An app's call count is unique for each app and app user pair, and is the number of calls the app has made in a rolling 24 hour window. It is calculated as follows:

Calls within 24 hours = 4800 * Number of Impressions

The Number of Impressions is the number of times any content from the app user's Instagram professional account has entered a person's screen within the last 24 hours.

Notes
Business Discovery and Hashtag Search API are subject to Platform Rate Limits.
Messaging Rate Limits

Calls to the Instagram messaging endpoints are counted against the number of calls your app can make per Instagram professional account and the API used.

Conversations API
Your app can make 2 calls per second per Instagram professional account.
Private Replies API
Your app can make 100 calls per second per Instagram professional account for private replies to Instagram Live comments
Your app can make 750 calls per hour per Instagram professional account for private replies to comments on Instagram posts and reels
Send API
Your app can make 100 calls per second per Instagram professional account for messages that contain text, links, reactions, and stickers
Your app can make 10 calls per second per Instagram professional account for messages that contain audio or video content
Geração de Leads

As solicitações feitas pelo app para a API de Geração de Leads são computadas conforme a contagem de chamadas do app. A contagem de chamadas de um app é o número de chamadas que ele pode fazer durante uma janela de 24 horas. Esse cálculo é feito da seguinte forma:

Calls within 24 hours = 4800 * Leads Generated

Number of Leads Generated é o número de leads gerados por Página para a conta de anúncios nos últimos 90 dias.

Plataforma do Messenger

Os limites de volume da Plataforma do Messenger dependem da API usada e, em alguns casos, do conteúdo da mensagem.

API do Messenger

As solicitações feitas pelo seu app são contadas com o número de chamadas que o app pode fazer durante um período de 24 horas Esse cálculo é feito da seguinte forma:

Calls within 24 hours = 200 * Number of Engaged Users

O "Number of Engaged Users" é o número de pessoas para as quais a empresa pode enviar mensagens pelo Messenger.

API do Messenger para Instagram

As solicitações feitas pelo seu app são contadas com o número de chamadas que o app pode fazer por conta profissional do Instagram e qual API usada.

API de Conversões

Seu app pode fazer duas chamadas por segundo por conta profissional do Instagram

API de Envio

Seu app pode fazer 100 chamadas por segundo por conta profissional do Instagram para mensagens que contenham texto, links, reações e figurinhas
Seu app pode fazer 10 chamadas por segundo por conta profissional do Instagram para mensagens que tenham conteúdo de áudio ou vídeo

API de Respostas Privadas

Seu app pode fazer 100 chamadas por segundo por conta profissional do Instagram para respostas privadas a comentários publicados do Instagram
Seu app pode fazer 750 chamadas por hora por conta profissional do Instagram para respostas privadas a comentários em publicações e reels do Instagram
Páginas

Os limites de volume da página podem usar a lógica do limite de volume da plataforma ou de BUC, dependendo do tipo de token. As chamadas à API de Páginas feitas com um token de acesso à Página ou um token de acesso do usuário do sistema usam o cálculo de limite de volume a seguir. As chamadas feitas com tokens de acesso do app ou tokens de acesso do usuário estão sujeitas aos limites de volume do usuário ou do app.

As solicitações feitas pelo app para a API de Páginas com um token de acesso à Página ou um token de acesso do usuário do sistema são computadas conforme a contagem de chamadas do app. A contagem de chamadas de um app é o número de chamadas que ele pode fazer durante uma janela de 24 horas. Esse cálculo é feito da seguinte forma:

Calls within 24 hours = 4800 * Number of Engaged Users

Number of Engaged Users é o total de usuários que interagiram com a Página em 24 horas.

As solicitações feitas pelo app para a API de Páginas com um token de acesso do usuário ou um token de acesso do app seguem a lógica do limite de volume da plataforma.

Para evitar problemas de limitação de volume ao usar o recurso acesso ao conteúdo público da Página, recomendamos o uso de um token de acesso do usuário do sistema.

Gerenciador de efeito de comércio do Spark AR

As solicitações feitas pelo app para os pontos de extremidade do comércio são computadas conforme a contagem de chamadas do app. A contagem de chamadas de um app é o número de chamadas que ele pode fazer durante o período de 1 hora. O cálculo é feito da seguinte forma:

Calls within one hour = 200 + 40 * Number of Catalogs

O número de catálogos é o total de catálogos em todas as contas comerciais gerenciadas pelo app.

Threads
As chamadas para a API do Threads são contabilizadas em relação à contagem de chamadas de um determinado app. A contagem de chamadas de um app, única para cada par de app e usuário do app, é o número de chamadas feitas durante uma janela de 24 horas. O cálculo é feito da seguinte forma:
Calls within 24 hours = 4800 * Number of Impressions
Number of Impressions é o número de vezes que um conteúdo da conta do Threads do usuário entrou na tela de uma pessoa nas últimas 24 horas. A limitação de volume também pode estar sujeita ao tempo total de CPU por dia:
720000 * number_of_impressions for total_cputime
2880000 * Number of Impressions for total_time
Observação: o valor mínimo é 10 impressões (por isso, se houver menos de 10 impressões, nós predefiniremos para 10).
API de Gerenciamento do WhatsApp Business
As solicitações feitas pelo app para a API de Gerenciamento do WhatsApp Business são computadas conforme a contagem do app. A contagem de chamadas de um app é o número de chamadas que ele pode fazer durante uma hora. Para a API de Gerenciamento do WhatsApp Business a seguir, o seu app pode fazer 200 chamadas por hora em cada conta do WhatsApp Business (WABA). Para WABAs ativas com pelo menos um número de telefone registrado, esse limite é de 5 mil chamadas por hora.
Tipo de chamada	Ponto de extremidade

GET

	

/{whatsapp-business-account-id}

GET, POST e DELETE

	

/{whatsapp-business-account-id}/assigned_users

GET

	

/{whatsapp-business-account-id}/phone_numbers

GET, POST e DELETE

	

/{whatsapp-business-account-id}/message_templates

GET, POST e DELETE

	

/{whatsapp-business-account-id}/subscribed_apps

GET

	

/{whatsapp-business-account-to-number-current-status-id}

Para as APIs de linhas de crédito a seguir, é possível fazer 5 mil chamadas por hora para cada app.
Tipo de chamada	Ponto de extremidade

GET

	

/{business-id}/extendedcredits

POST

	

/{extended-credit-id}/whatsapp_credit_sharing_and_attach

GET e DELETE

	

/{allocation-config-id}

GET

	

/{extended-credit-id}/owning_credit_allocation_configs

Para evitar atingir os limites de volume, recomendamos o uso de webhooks para acompanhar atualizações ao status de modelos de mensagem, números de telefone e WABAs.

Se quiser verificar a sua taxa de uso, consulte Cabeçalhos.
Cabeçalhos

Todas as respostas de API feitas pelo app que têm limitação de volume de BUC incluem um cabeçalho HTTP X-Business-Use-Case-Usage (para chamadas da API de Anúncios versão 3.3 e anteriores) com uma string formatada em JSON que descreve o uso atual do limite de volume de app. Esse cabeçalho pode retornar até 32 objetos em uma chamada.

Conteúdo do cabeçalho X-Business-Use-Case-Usage
Código de erro	Descrição do valor

business-id

	

A identificação da empresa associada ao token usado para fazer as chamadas de API.

call_count

	

Um número inteiro que expressa o percentual de chamadas permitidas feitas pelo app durante uma janela de 1 hora.

estimated_time_to_regain_access

	

Tempo em minutos até o fim da limitação das chamadas.

total_cputime

	

Um número inteiro que expressa o percentual de tempo de CPU alocado para o processamento de consultas.

total_time

	

Um número inteiro que expressa o percentual de tempo total alocado para o processamento de consultas.

type

	

Tipo do limite de volume aplicado. O valor pode ser ads_insights, ads_management, custom_audience, instagram, leadgen, messenger ou pages.

ads_api_access_tier

	

Apenas para os tipos ads_insights e ads_management. Os níveis permitem que o app acesse a API de Marketing. Por padrão, os apps têm o nível development_access, e Standard_access habilita uma limitação de volume menor. Para aumentar o limite de volume e chegar ao nível padrão, você pode solicitar "acesso avançado" ao recurso Acesso Padrão ao Gerenciamento de Anúncios.

Tempo total de CPU

A quantidade de tempo de CPU para a solicitação ser processada. Quando total_cputime chega a 100, as chamadas podem ser limitadas.

Tempo total

A quantidade de tempo para a solicitação ser processada. Quando total_time chega a 100, as chamadas podem ser limitadas.

Nível de acesso à API de Anúncios

Apenas para os tipos ads_insights e ads_management. Os níveis permitem que o app acesse a API de Marketing. Por padrão, os apps têm o nível development_access, e Standard_access habilita uma limitação de volume menor. Para aumentar o limite de volume e chegar ao nível padrão, você pode solicitar "acesso avançado" ao recurso Acesso Padrão ao Gerenciamento de Anúncios.

Exemplo do valor do cabeçalho X-Business-Use-Case-Usage
x-business-use-case-usage: {
    "{business-object-id}": [
        {
            "type": "{rate-limit-type}",           //Type of BUC rate limit logic being applied.
            "call_count": 100,                     //Percentage of calls made. 
            "total_cputime": 25,                   //Percentage of the total CPU time that has been used.
            "total_time": 25,                      //Percentage of the total time that has been used.   
            "estimated_time_to_regain_access": 19,  //Time in minutes to regain access.
            "ads_api_access_tier": "standard_access"  //Tiers allows your app to access the Marketing API. standard_access enables lower rate limiting.
        }
    ],      
    "66782684": [
        {
            "type": "ads_management",
            "call_count": 95,
            "total_cputime": 20,
            "total_time": 20,
            "estimated_time_to_regain_access": 0,
            "ads_api_access_tier": "development_access" 
        }
    ],
    "10153848260347724": [
        {
            "type": "ads_insights",
            "call_count": 97,
            "total_cputime": 23,
            "total_time": 23,
            "estimated_time_to_regain_access": 0,
            "ads_api_access_tier": "development_access"
        }
    ],
    "10153848260347724": [
        {
            "type": "pages",
            "call_count": 97,
            "total_cputime": 23,
            "total_time": 23,
            "estimated_time_to_regain_access": 0
        }
    ],
...
}
Códigos de erro

Quando o app chegar ao limite de volume do caso de uso da empresa, as solicitações subsequentes feitas por ele falharão e a API responderá com um código de erro.

Código de erro	Tipo de limite de volume de BUC

error code 80000, error subcode 2446079

	

Insights sobre anúncios

error code 80004, error subcode 2446079

	

Gerenciamento de anúncios

error code 80003, error subcode 2446079

	

Público Personalizado

error code 80002

	

Instagram

error code 80005

	

Geração de Leads

error code 80006

	

Messenger

error code 32	

Chamadas à Página feitas com um token de acesso do usuário

error code 80001	

Chamadas à Página feitas com um token de acesso à Página ou um token de acesso do usuário do sistema

error code 17, error subcode 2446079

	

API de Anúncios versão 3.3 e anteriores, exceto Insights sobre Anúncios

error code 80008

	

API de Gerenciamento do WhatsApp Business

error code 80014

	

Lote de catálogos

error code 80009

	

Gerenciamento de catálogos

Mensagem do código SampleError
{   
"error": {      
    "message": "(#80001) There have been too many calls to this Page account. Wait a bit and try again. For more info, please refer to https://developers.facebook.com/docs/graph-api/overview/rate-limiting.",      
    "type": "OAuthException",      
    "code": 80001,      
    "fbtrace_id": "AmFGcW_3hwDB7qFbl_QdebZ"   
    }
}
Boas práticas
Quando o limite tiver sido atingido, pare de fazer chamadas à API. Se você seguir fazendo chamadas, a contagem delas continuará aumentando. Com isso, levará ainda mais tempo para que as chamadas voltem a ser bem-sucedidas.
Verifique o cabeçalho HTTP X-Business-Use-Case-Usage para verificar se a conta de anúncios está próxima do limite e quando você poderá voltar a fazer chamadas.
Verifique o código de erro e o ponto de extremidade da API para confirmar o tipo de limitação.
Mude para outras contas de anúncios e volte a esta conta mais tarde.
É melhor criar um novo anúncio em vez de alterar os atuais.
Divida as consultas de maneira uniforme entre dois intervalos de tempo para evitar o envio de tráfego em picos.
Use filtros para limitar o tamanho da resposta de dados e evite chamadas que solicitem dados sobrepostos.
Perguntas frequentes
O que consideramos uma chamada de API?

Todas as chamadas contam para o limite de volume, não apenas solicitações individuais à API. Por exemplo, você pode fazer uma única solicitação à API e especificar vários números de identificação. Entretanto, cada um deles contará como uma chamada de API.

A tabela a seguir exemplifica isso.

Solicitações de exemplo	Número de chamadas de API

GET https://graph.facebook.com/photos?ids=4

GET https://graph.facebook.com/photos?ids=5

GET https://graph.facebook.com/photos?ids=6

	

3

GET https://graph.facebook.com/photos?ids=4,5,6

	

3

Recomendamos que você especifique vários números de identificação em uma solicitação de API sempre que possível, pois isso melhora o desempenho das respostas.

Estou criando um extrator. Devo me preocupar com mais alguma coisa?

Se você estiver criando um serviço que extrai dados, leia nossos termos de extração.

Nesta Página
Limites de volume
Limites de volume da plataforma
Apps
Usuários
Cabeçalhos
Painel
Códigos de erro
Códigos de limitação da estabilidade do Facebook
Boas práticas
Limites de volume de casos de uso de empresas
Insights sobre Anúncios
Gerenciamento de anúncios
Catálogo
Público Personalizado
Plataforma do Instagram
Messaging Rate Limits
Geração de Leads
Plataforma do Messenger
Páginas
Gerenciador de efeito de comércio do Spark AR
Threads
API de Gerenciamento do WhatsApp Business
Cabeçalhos
Códigos de erro
Boas práticas
Perguntas frequentes