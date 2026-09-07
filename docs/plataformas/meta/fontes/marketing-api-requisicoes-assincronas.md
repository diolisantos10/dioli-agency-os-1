---
titulo: "Marketing API — requisições assíncronas e em lote"
url: https://developers.facebook.com/documentation/ads-commerce/marketing-api/asyncrequests
capturado_em: 2026-09-07
hash: 50e821654283d660
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Solicitações em lote e assíncronas
Updated: 16 de jun de 2026
Copiar para LLM
Ver como Markdown
Os anúncios no Status do WhatsApp são disponibilizados por meio da API de Marketing. Saiba mais sobre anúncios no Status do WhatsApp.
Use solicitações assíncronas para criar anúncios e enviar diversas solicitações de anúncio sem necessidade de bloqueio. Especifique uma URL para chamada após a conclusão das solicitações ou verifique o status da solicitação. Consulte Referência de anúncio.
Para gerenciar anúncios, use solicitações em lote. Use essas informações para executar algumas das solicitações mais comuns.
Solicitações assíncronas
Por exemplo, obtenha o status do conjunto de solicitações assíncronas:
curl -G \
  -d 'fields=name,success_count,error_count,is_completed' \
  -d 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/<REQUEST_SET_ID>
A chamada retorna o status geral do conjunto de solicitações assíncronas como um objeto JSON. Nem todos os campos aparecem por padrão. Para incluir campos que não são padrão na sua consulta, especifique-os em fields, como fields=id,owner_id,name,total_count,success_count,error_count,is_completed.
Nome	Descrição

id
tipo: int
	
Exibido por padrão.
O id do conjunto atual de solicitações assíncronas.

owner_id
tipo: int
	
Exibido por padrão.
A qual objeto pertence esse conjunto de solicitações assíncronas. Para pedidos assíncronos de anúncios, owner_id é a account_id.

name
tipo: string
	
Exibido por padrão.
O nome desse conjunto de solicitações assíncronas.

is_completed
tipo: booliano
	
Exibido por padrão.
Indica se todas as solicitações assíncronas foram concluídas no conjunto.

total_count
tipo: int
	
Não exibido por padrão.
O total de solicitações desse conjunto de solicitações.

initial_count
tipo: int
	
Não exibido por padrão.
O número de solicitações ainda não exibidas.

in_progress_count
tipo: int
	
Não exibido por padrão.
O número de solicitações em andamento.

success_count
tipo: int
	
Não exibido por padrão.
O número de solicitações concluídas com sucesso.

error_count
tipo: int
	
Não exibido por padrão.
O número de solicitações concluídas com falha.

canceled_count
tipo: int
	
Não exibido por padrão.
O número de solicitações canceladas pelo usuário.

notification_uri
tipo: string
	
Não exibido por padrão.
O URI de notificação desse conjunto de solicitações assíncronas.

notification_mode
tipo: cadeia de caracteres
	
Não exibido por padrão.
O modo de recebimento de notificações. Os valores válidos incluem o seguinte:
OFF – sem notificações
ON_COMPLETE – enviar notificação quando todo o conjunto for concluído
Depois de obter o status geral do conjunto de solicitações assíncronas, verifique os detalhes de cada solicitação:
curl -G \
  -d 'fields=id,status' \
  -d 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/<REQUEST_SET_ID>/requests
Isso retorna o status e os detalhes de cada solicitação do conjunto de solicitações assíncronas. Para a criação de anúncio assíncrona, faça uma solicitação para cada anúncio. O parâmetro status é usado para filtrar solicitações por status e pode ser uma combinação dos valores a seguir:
initial – não processado ainda.
in_progress – solicitação em processamento.
success – solicitação concluída com sucesso.
error – solicitação concluída com falha
canceled – solicitação cancelada pelo usuário.
A resposta é uma matriz JSON com campos-padrão. Para incluir campos não padrão, especifique o campo em fields, como fields=id,scope_object_id,status,result,input,async_request_set.
Nome	Descrição

id
tipo: int
	
Exibido por padrão.
O ID da solicitação assíncrona.

scope_object_id
tipo: int
	
Exibido por padrão.
O ID principal do objeto criado pela solicitação. Se você criar um anúncio, esta será a identificação do conjunto desse novo anúncio.

status
tipo: string
	
Exibido por padrão.
O status dessa solicitação assíncrona. Opções:
Initial – não processado ainda.
In_progress – solicitação em processamento.
Success – solicitação concluída com sucesso.
Error – solicitação concluída com falha
Canceled – solicitação cancelada pelo usuário

result
tipo: matriz
	
Não exibido por padrão.
Se a solicitação for finalizada, o resultado dela será exibido.
Se ela for bem-sucedida, o resultado será o mesmo de uma solicitação não assíncrona. Por exemplo, se você criar um anúncio, o resultado para cada solicitação é a identificação do novo anúncio. Em caso de erro, será matriz do seguinte:
error_code – código de erro retornado
error_message – mensagem de erro

input
tipo: objeto
	
Não exibido por padrão.
A entrada original dessa solicitação assíncrona. Se você criar um anúncio, a entrada será adgroup_spec.

async_request_set
tipo: objeto
	
Não exibido por padrão.
O conjunto de solicitações assíncronas que contém essa solicitação em particular.
Obter detalhes da solicitação
Para obter os detalhes de uma solicitação assíncrona, faça a seguinte chamada:
curl -G \
  -d 'fields=id,status' \
  -d 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/<REQUEST_SET_ID>/requests
Isso retorna um objeto JSON com os campos listados acima.
Listar os conjuntos de solicitações de uma conta
É possível criar diversos conjuntos de solicitações assíncronas de anúncio. Para consultar todos os conjuntos desse tipo de uma conta de anúncios:
curl -G \
  -d 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/asyncadrequestsets
Isso retorna uma matriz JSON de objetos do conjunto de solicitações assíncronas. Cada objeto é igual ao especificado na seção de conjunto de solicitações assíncronas. Você pode filtrar os resultados com is_completed. Se is_completed=true, somente os conjuntos de solicitações assíncronas concluídos serão exibidos.
Listar as solicitações de um conjunto de anúncios
Você pode fazer uma chamada assíncrona para criar anúncios em conjuntos diferentes. Para ver o status de cada conjunto de anúncios, obtenha todas as solicitações de criação de anúncio de um conjunto:
curl -G \
  -d 'fields=id,status' \
  -d 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/<AD_SET_ID>/asyncadrequests
Isso retorna uma matriz JSON de objetos de solicitação assíncrona. Os campos de status, filtros e solicitações assíncronas são iguais à API https://graph.facebook.com/<API_VERSION>/<REQUEST_SET_ID>/requests.
Atualizar conjuntos de solicitações
É possível alterar name, notification_uri e notification_mode de um conjunto de solicitações assíncronas.
curl \
  -F 'name=New Name' \
  -F 'notification_mode=OFF' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/<REQUEST_SET_ID>
O retorno será true se a atualização for bem-sucedida. A alteração de notification_uri e notification_mode só pode ser feita antes do envio da notificação.
Cancelar solicitação
É possível cancelar uma solicitação assíncrona, mas isso só pode ser feito se a solicitação ainda não tiver sido processada.
curl -X DELETE \
  -d 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/<REQUEST_ID>
O retorno será true se o cancelamento for bem-sucedido. Também é possível cancelar solicitações ainda não processadas no conjunto de solicitações assíncronas:
curl -X DELETE \
  -d 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/<REQUEST_SET_ID>
O retorno será true se o cancelamento for bem-sucedido.
Exemplos assíncronos
Obter o status de uma solicitação assíncrona específica:
//pretty=true for command line readable output
curl -G \
-d "id=6012384857989" \
-d "pretty=true" \
-d "access_token=_____" \
"https://graph.facebook.com/v26.0/"
Valores de retorno:
{
   "id": "6012384857989",
   "owner_id": 12345,
   "name": "testasyncset",
   "is_completed": true
}
Obter os resultados de solicitações:
curl -G \
-d "id=6012384857989" \
-d "pretty=true" \
-d "fields=result" \
-d "access_token=_____" \
"https://graph.facebook.com/v26.0/requests"
Retorna:
{
   "data": [
      {
         "result": {
            "id": "6012384860989"
         },
         "id": "6012384858389"
      },
      {
         "result": {
            "id": "6012384858789"
         },
         "id": "6012384858189"
      }
   ],
   "paging": {
      "cursors": {
         "after": "___",
         "before": "___"
      }
   }
}
Obter a lista dos conjuntos de solicitações de uma conta de anúncios:
curl -G \
-d "is_completed=1" \
-d "pretty=true" \
-d "access_token=___" \
"https://graph.facebook.com/v26.0/act_71597454/asyncadrequestsets"
Retorna:
{
   "data": [
      {
         "id": "6012384253789",
         "owner_id": 71597454,
         "name": "testasyncset",
         "is_completed": true
      },
   ],
   "paging": {
      "cursors": {
         "after": "___",
         "before": "___"
      }
   }
}
Obter uma lista das solicitações de uma campanha:
curl -G \
-d "status=SUCCESS,ERROR" \
-d "pretty=true" \
-d "access_token=___" \
"https://graph.facebook.com/v26.0/6008248529789/asyncadrequests"
Valores de retorno:
{
   "data": [
      {
         "id": "6012384951789",
         "scope_object_id": 6008248529789,
         "status": "SUCCESS"
      },
   ],
   "paging": {
      "cursors": {
         "after": "___",
         "before": "___"
      }
   }
}
Solicitações em lote
Com solicitações em lote, combine um número de chamadas da Graph API a uma solicitação HTTP. A API de Marketing divide essa solicitação em partes menores. As solicitações em lote reduzem o número de solicitações HTTP que você envia à API de Marketing. Também é possível realizar solicitações em lote paralelas usando threads de processamento separados.
Cada solicitação em lote pode conter um máximo de 50 solicitações. Para a criação de anúncio, inclua 10 ou menos anúncios por lote.
Solicitações em lote para anúncios, criativos de anúncio e conjuntos de anúncio são semelhantes. Por isso, este guia não aborda cada um separadamente. Para mais informações, consulte Solicitações em lote da Graph API e ETags.
Criar anúncios
É possível fornecer o criativo e outros objetos de anúncio em uma solicitação em lote. Por exemplo: você pode criar três anúncios usando um criativo de anúncio e três especificações de direcionamento diferentes. Primeiro, defina o criativo do anúncio. Depois, consulte-o ao criar cada anúncio:
curl -F 'access_token=______'
  -F 'test1=@./test1.jpg'
  -F 'batch=[
             {
              "method": "POST",
              "name": "create_adimage",
              "relative_url": "<API_VERSION>/act_187687683/adimages",
              "attached_files": "test1"
             },
             {
              "method": "POST",
              "name": "create_creative",
              "relative_url": "<API_VERSION>/act_187687683/adcreatives",
              "attached_files": "test1",
              "body": "name=sample creative&object_story_spec={\"link_data\": {\"image_hash\": \"{result=create_adimage:$.images.*.hash}\", \"link\": \"https://www.test12345.com\", \"message\": \"this is a sample message\"}, \"page_id\":\"12345678\"}&degrees_of_freedom_spec={\"creative_features_spec\": {\"standard_enhancements\": {\"enroll_status\": \"OPT_OUT\"}}}"
             },
             {
              "method": "POST",
              "relative_url": "<API_VERSION>/act_187687683/ads",
              "body": "adset_id=6004163746239&redownload=1&status=PAUSED&optimization_goal=REACH&billing_event=IMPRESSIONS&&creative={\"creative_id\":\"{result=create_creative:$.id}\"}&targeting={\"countries\":[\"US\"]}&name=test1"
             },
             {
              "method": "POST",
              "relative_url": "<API_VERSION>/act_187687683/ads",
              "body": "adset_id=6004163746239&redownload=1&status=PAUSED&optimization_goal=REACH&billing_event=IMPRESSIONS&&creative={\"creative_id\":\"{result=create_creative:$.id}\"}&targeting={\"countries\":[\"US\"]}&name=test2"
             },
             {
              "method": "POST",
              "relative_url": "<API_VERSION>/act_187687683/ads",
              "body": "adset_id=6004163746239&redownload=1&status=PAUSED&optimization_goal=REACH&billing_event=IMPRESSIONS&&creative={\"creative_id\":\"{result=create_creative:$.id}\"}&targeting={\"countries\":[\"US\"]}&name=test3"
             }
            ]' https://graph.facebook.com/
A resposta inclui códigos individuais de resposta para cada solicitação e a resposta-padrão da Graph API. Para mais detalhes, veja Como fazer várias solicitações de API.
O processo de solicitação em lote usa o formato de expressão JSONPath⁠ para citar as solicitações anteriores.
Atualizar anúncios
É possível atualizar anúncios por meio de solicitações em lote. Para atualizar lances em três anúncios:
curl -F 'access_token=____'
  -F 'batch=[
             {
              "method": "POST",
              "relative_url": "<API_VERSION>/6004251715639",
              "body": "redownload=1&name=new name"
             },
             {
              "method": "POST",
              "relative_url": <API_VERSION>/v6004251716039",
              "body": "redownload=1&name=new name"
             },
             {
              "method": "POST",
              "relative_url": "<API_VERSION>/6004251715839",
              "body": "redownload=1&name=new name"
             }
            ]' https://graph.facebook.com
Se incluir redownload=1 na URL relativa, você obterá os detalhes completos do anúncio, incluindo a identificação. Isso ajuda a identificar os anúncios que você atualizou.
Para atualizar o criativo do anúncio, especifique todo o criativo ou forneça uma nova identificação correspondente. Isso ocorre porque os criativos do anúncio não podem ser editados depois de serem criados, exceto o nome e o status de veiculação.
Ler anúncios
Se você tiver uma grande quantidade de anúncios, divida o pedido em vários dentro de um pedido em lote:
curl -F 'access_token=____'
  -F 'batch=[
             {
              "method": "GET",
              "relative_url": "<API_VERSION>/?ids=6003356308839,6004164369439&fields=<comma separated list of fields>"
             },
             {
              "method": "GET",
              "relative_url": "<API_VERSION>/6003356307839/ads&fields=<comma separated list of fields>"
             },
             {
              "method": "GET",
              "relative_url": "<API_VERSION>/act_187687683/ads?adset_ids=[6003356307839, 6004164259439]&fields=<comma separated list of fields>"
             }
            ]' https://graph.facebook.com
6003356308839 e 6004164369439 são identificações do anúncio, ao passo que 6003356307839 e 6004164259439 são identificações do conjunto de anúncios.
Insights sobre anúncios
Se você tiver uma grande quantidade de Insights sobre Anúncios, divida a solicitação em várias dentro de uma solicitação em lote:
curl -F 'access_token=____'
  -F 'batch=[
             {
              "method": "GET",
              "relative_url": "<API_VERSION>/act_19643108/insights?filtering=[{field:'ad.id',operator:'IN',value:[6003356308839,6004164369439]}]"
             },
             {
              "method": "GET",
              "relative_url": "<API_VERSION>/6003356308839/insights"
             },
             {
              "method": "GET",
              "relative_url": "<API_VERSION>/act_187687683/insights?filtering=[{field:'adset.id',operator:'IN',value:[6003356307839, 6004164259439]}]"
             }
            ]' https://graph.facebook.com
Neste exemplo, 6003356308839 e 6004164369439 são identificações do anúncio, ao passo que 6003356307839 e 6004164259439 são identificações do conjunto de anúncios.
Em contas de anúncio com um grande número de anúncios, não use act_<account_ID>/adgroupstats, pois isso pode causar o encerramento da solicitação.
Solicitações em lote para estimativa de alcance
É possível solicitar até 50 estimativas de alcance em uma única solicitação em lote. O exemplo a seguir mostra a estimativa de alcance sendo solicitada para duas especificações de direcionamento diferentes:
curl -F 'access_token=____'
  -F 'batch=[
             {
              "method": "GET",
              "relative_url": "<API_VERSION>/act_600335/reachestimate?targeting_spec={'geo_locations': {'countries':['US']}}"
             },
             {
              "method": "GET",
              "relative_url": "<API_VERSION>/act_600335/reachestimate?targeting_spec={'geo_locations': {'countries':['FR']}}"
             }
            ]' https://graph.facebook.com
API em Lote
Com a API em lote, é possível agrupar solicitações em lotes e enviá-las de forma assíncrona. Agrupe várias chamadas da Graph API em uma única solicitação HTTP e as execute de forma assíncrona sem a necessidade de bloquear. Você pode também especificar dependências entre operações relacionadas.
O Facebook processa cada operação independente de maneira paralela e as operações dependentes de forma sequencial. Cada chamada de API pode ter até 1.000 solicitações.
Fazer uma chamada da API em lote
Para fazer uma chamada da API em Lote:
curl \
-F "access_token=___" \
-F "name=asyncbatchreqs" \
-F "adbatch=<an array of requests>"\
"https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/async_batch_requests"
Forneça uma matriz de solicitações HTTP POST como matrizes JSON. Cada solicitação tem o seguinte:
name
relative_url - porção da URL após graph.facebook.com
body
A API retorna um ID que você usa para consultar o progresso das solicitações.
Por exemplo, crie uma campanha com um conjunto de anúncios no formato JSONPath para incluir as solicitações anteriores:
curl \
-F "access_token=___" \
-F "name=batchapiexample" \
-F "adbatch=[
  {
    'name': 'create-campaign',
    'relative_url': 'act_123456/campaigns',
    'body': 'name%3DTest+Campaign%26objective%3DLINK_CLICKS%26status%3DPAUSED%26buying_type%3DAUCTION',
  },
  {
    'name': 'create-adset',
    'relative_url': 'act_123456/adsets',
    'body': 'targeting%3D%7B%22geo_locations%22%3A%7B%22countries%22%3A%5B%22US%22%5D%7D%7D%26daily_budget%3D5000%26campaign_id%3D%7Bresult%3Dcreate-campaign%3A%24.id%7D%26bid_amount%3D2%26name%3DFirst%2BAd%2BSet%20Test%26billing_event%3DLINK_CLICKS',
  },
]" \
https://graph.facebook.com/<API_VERSION>/act_123456/async_batch_requests
Para obter o status de um conjunto de solicitações:
curl –G \
-d "access_token=___" \
-d "fields=<comma separated list of fields>" \
"https://graph.facebook.com/v26.0/<REQUEST_SET_ID>"
Isso retorna o status geral do conjunto de solicitações assíncronas como objetos JSON. Nem todos os campos são retornados por padrão. Para incluí-los, especifique fields, por exemplo, fields=id,owner_id,name,total_count,success_count,error_count,is_completed.
Nome	Descrição

id
tipo: int
	
Exibido por padrão.
O id do conjunto atual de solicitações assíncronas.

owner_id
tipo: int
	
Exibido por padrão.
O objeto ao qual pertence o conjunto de solicitações assíncronas. Se você criar anúncios, owner_id será a identificação da conta de anúncios.

name
tipo: string
	
Exibido por padrão.
O nome desse conjunto de solicitações assíncronas.

is_completed
tipo: booliano
	
Exibido por padrão.
Todas as solicitações assíncronas no conjunto foram concluídas.

total_count
tipo: int
	
Não exibido por padrão.
O total de solicitações nesse conjunto de solicitações.

initial_count
tipo: int
	
Não exibido por padrão.
O número de solicitações ainda não exibidas.

in_progress_count
tipo: int
	
Não exibido por padrão.
O número de solicitações em andamento.

success_count
tipo: int
	
Não exibido por padrão.
O número de solicitações concluídas com sucesso.

error_count
tipo: int
	
Não exibido por padrão.
O número de solicitações concluídas com falha.

canceled_count
tipo: int
	
Não exibido por padrão.
O número de solicitações canceladas pelo usuário.

notification_uri
tipo: string
	
Não exibido por padrão.
O URI de notificação desse conjunto de solicitações assíncronas.

notification_mode
tipo: cadeia de caracteres
	
Não exibido por padrão.
Os modos de recebimento de notificações. Valores válidos:
OFF – sem notificações
ON_COMPLETE – envia uma notificação quando todo o conjunto é concluído.

notification_result
tipo: string
	
Não exibido por padrão.
O resultado do envio da notificação.

notification_status
tipo: string
	
Não exibido por padrão.
Status da notificação: not_sent, sending ou sent.
Depois de obter o status geral, verifique os detalhes de cada solicitação:
curl –G \
-d "access_token=___" \
-d "fields=<comma separated list of fields>" \
"https://graph.facebook.com/v26.0/<REQUEST_SET_ID>/requests"
Isso retorna detalhes como uma matriz JSON. Para incluir campos não padrão, especifique o campo em fields, como fields=id,scope_object_id,status,result,input,async_request_set.
Nome	Descrição

id
tipo: int
	
Exibido por padrão.
O ID da solicitação assíncrona.

scope_object_id
tipo: int
	
Exibido por padrão.
O ID principal do objeto criado pela solicitação. Se você criar anúncios, esta será a identificação do conjunto desse novo anúncio.

status
tipo: string
	
Exibido por padrão.
Status dessa solicitação assíncrona:
Initial – não processado ainda.
In_progress – solicitação em processamento.
Success – solicitação concluída com sucesso
Error – solicitação concluída com falha
Canceled – solicitação cancelada pelo usuário

result
tipo: matriz
	
Não exibido por padrão.
Se a solicitação for concluída, o resultado é exibido. Para obter sucesso, o resultado é igual à API não assíncrona. Por exemplo, se você criar um anúncio, o resultado será uma nova identificação do anúncio. Em caso de erro:
error_code – código de erro retornado
error_message – mensagem de erro

input
tipo: objeto
	
Não exibido por padrão.
A entrada original dessa solicitação. Se você criar um anúncio, a entrada será adgroup_spec.

async_request_set
tipo: objeto
	
Não exibido por padrão.
O conjunto de solicitações assíncronas que contém essa solicitação.
Listar solicitações da API em lote de uma conta de anúncios
É possível criar diversos conjuntos de solicitações da API em lote. Para consultar todos os conjuntos de solicitações de uma conta de anúncios:
curl –G \
-d "access_token=___" \
"https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/async_requests"
ETags
A API de Marketing é compatível com Etags⁠. Isso ajuda você a saber se houve alteração nos dados consultados desde a última verificação. Como funciona:
Quando você faz uma chamada, o cabeçalho da resposta inclui uma ETag cujo valor é o hash dos dados retornados na chamada de API. Salve o valor dessa ETag para uso na próxima etapa.
Na próxima vez que você fizer essa chamada de API, inclua o cabeçalho da solicitação If-None-Match com o valor salvo da ETag.
Se não houver alteração nos dados, o código de status da resposta será 304 – Not Modified e nenhum dado será retornado.
Se os dados foram alterados desde a última consulta, eles serão retornados normalmente com uma nova ETag. Salve o novo valor da ETag para uso em chamadas futuras.
As ETags ajudam a reduzir o tráfego de dados, mas o If-None-Match GET ainda deduz o limite de volume para seu app.
A ETag é calculada usando toda a resposta da chamada de API, incluindo a formatação. O formato da resposta pode ser afetado pela cadeia de caracteres do agente do usuário. Por isso, mantenha o agente do usuário consistente entre chamadas feitas a partir do mesmo cliente.
Exemplos de ETags
Para verificar se houve alteração nas contas de anúncios do usuário.
Etapa 1: determinar a ETag dos dados atuais
curl -i "https://graph.beta.facebook.com/me/adaccounts?access_token=___"
A resposta será a seguinte:
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Cache-Control: private, no-cache, no-store, must-revalidate
Content-Type: text/javascript; charset=UTF-8
ETag: "7776cdb01f44354af8bfa4db0c56eebcb1378975"
Expires: Sat, 01 Jan 2000 00:00:00 GMT
Pragma: no-cache
X-FB-Rev: 495685
X-FB-Server: 10.30.149.204
X-FB-Debug: CWbHcogdwUE8saMv6ML+8FacXFrE8ufhjjwxU2dQWaA=
X-Cnection: close
Date: Mon, 16 Jan 2012 12:07:44 GMT
Content-Length: 3273

{"data":[{"id":"act.......
No exemplo, a ETag é "7776cdb01f44354af8bfa4db0c56eebcb1378975". Vale lembrar que esse valor inclui aspas (").
Etapa 2: determinar se houve alterações nos dados
curl -i -H "If-None-Match: \"7776cdb01f44354af8bfa4db0c56eebcb1378975\"" "https://graph.beta.facebook.com/me/adaccounts?access_token=___"
Se não houver alteração, a resposta será a seguinte:
HTTP/1.1 304 Not Modified
Access-Control-Allow-Origin: *
Cache-Control: private, no-cache, no-store, must-revalidate
Content-Type: text/javascript; charset=UTF-8
Expires: Sat, 01 Jan 2000 00:00:00 GMT
Pragma: no-cache
X-FB-Rev: 495685
X-FB-Server: 10.30.177.190
X-FB-Debug: ImBhat3k07Nez5FvuS2lPWU0U2xxmxD4B3k9ua4Sk7Q=
X-Cnection: close
Date: Mon, 16 Jan 2012 12:09:17 GMT
Content-Length: 0
Observe a resposta 304 Not Modified. Se houvesse alteração nos dados, uma resposta normal de API teria sido retornada.
Este é um exemplo de lote para verificar se houve alteração nos anúncios do usuário.
Etapa 1: determinar a ETag dos dados atuais
curl -i "curl -F 'access_token=___' -F 'batch=[
  {"method":"GET", "relative_url": "?ids=6003356308839,6004164369439" },
  {"method":"GET", "relative_url": "act_12345678/ads?campaign_ids=[6003356307839, 6004164259439]"}]'
 https://graph.facebook.com"
A resposta terá valores de ETag como no exemplo a seguir:
...{"name":"ETag","value":"\"21d371640127490b2ed0387e8af3f0f8c9eff012\""}...
...{"name":"ETag","value":"\"410e53bb257f116e8716e4ebcc76df1c567b87f4\""}...
Neste exemplo, as ETags são "21d371640127490b2ed0387e8af3f0f8c9eff012" e "410e53bb257f116e8716e4ebcc76df1c567b87f4". Vale lembrar que esse valor inclui aspas (").
Etapa 2: determinar se houve alterações nos dados
curl -F 'access_token=___' -F 'batch=[
  {"method":"GET", "headers":["If-None-Match: \"21d371640127490b2ed0387e8af3f0f8c9eff012\""], "relative_url": "?ids=6003356308839,6004164369439" },
  {"method":"GET",  "headers":["If-None-Match: \"410e53bb257f116e8716e4ebcc76df1c567b87f4\""], "relative_url": "act_12345678/ads?campaign_ids=[6003356307839, 6004164259439]"}]'
https://graph.facebook.com
Se não houver alteração, a resposta será a seguinte:
[{
    "code": 304,
    .
    .
    .
    "body": null
},
{
    "code": 304,
    .
    .
    .
    "body": null
}]
Observe a resposta 304 Not Modified. Se houver alteração nos dados, a API de Marketing retornará uma resposta normal de API.
Você achou esta página útil?