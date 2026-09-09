---
titulo: "Google Ads API — limites de taxa (rate limits)"
url: https://developers.google.com/google-ads/api/docs/best-practices/rate-limits?hl=pt-br
capturado_em: 2026-09-09
hash: f1d773646c27c6c4
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Limites de taxas

A API Google Ads agrupa as solicitações para limitação de taxas por consultas por segundo (QPS) por ID de cliente (CID) e token de desenvolvedor, o que significa que a medição é aplicada de forma independente nos CIDs e nos tokens de desenvolvedor. A API Google Ads usa um algoritmo de bucket de tokens para medir as solicitações e determinar um limite de QPS adequado. Portanto, o limite exato varia de acordo com a carga geral do servidor em um determinado momento.

O objetivo de impor limites de taxas é impedir que um usuário interrompa o serviço para outros usuários, sobrecarregando (intencionalmente ou não) os servidores da API Google Ads com um grande volume de solicitações.

As solicitações que violam os limites de taxas serão rejeitadas com o erro: RESOURCE_TEMPORARILY_EXHAUSTED.

Você pode controlar seu app e reduzir os limites de taxas, diminuindo ativamente o número de solicitações e limitando o QPS do lado do cliente.

Há várias maneiras de reduzir as chances de exceder o limite de taxas. Conhecer os conceitos de padrões de integração empresarial (EIP, na sigla em inglês) como mensagens, nova entrega e limitação, pode ajudar você a criar um app cliente mais robusto.

As práticas recomendadas a seguir estão ordenadas por complexidade, com estratégias mais simples na parte de cima e arquiteturas mais robustas, mas sofisticadas, depois:

Limitar tarefas simultâneas
Solicitações em lote
Limitadores de taxa e limitação
Enfileiramento
Limitar tarefas simultâneas

Uma das causas principais de exceder os limites de taxas é que o app cliente está gerando um número excessivo de tarefas paralelas. Embora não limitemos o número de solicitações paralelas que um app cliente pode ter, isso pode exceder o limite de solicitações por segundo no nível do token de desenvolvedor.

Recomendamos definir um limite superior razoável para o número total de tarefas simultâneas que farão solicitações (em todos os processos e máquinas) e ajustar para cima para otimizar a capacidade de processamento sem exceder o limite de taxas.

Além disso, você pode limitar o QPS do lado do cliente (confira Limitadores de taxa e limitação).

Solicitações em lote

Considere agrupar várias operações em uma única solicitação. Isso é mais aplicável em chamadas MutateFoo. Por exemplo, se você estiver atualizando o status de várias instâncias de AdGroupAd - em vez de chamar MutateAdGroupAds uma vez para cada AdGroupAd, você pode chamar MutateAdGroupAds uma vez e transmitir várias operations. Consulte nossas orientações sobre operações em lote para conferir outros exemplos.

Embora as solicitações em lote reduzam o número total de solicitações e diminuam o limite de taxa de solicitações por minuto, elas podem acionar o limite de taxa de operações por minuto se você realizar um grande número de operações em uma única conta.

Limitadores de taxa e limitação

Além de limitar o número total de conversas do aplicativo cliente, você também pode implementar limitadores de taxa no lado do cliente. Isso pode garantir que todas as conversas nos processos e / ou clusters sejam regidas por um limite de QPS específico do lado do cliente.

Você pode conferir o Guava Rate Limiter ou implementar seu próprio Token Bucket baseado em bucket de tokens para um ambiente clusterizado. Por exemplo, é possível gerar tokens e armazená-los em um armazenamento transacional compartilhado, como um banco de dados, e cada cliente precisaria adquirir e consumir um token antes de processar a solicitação. Se os tokens fossem usados, o cliente teria que esperar até que o próximo lote de tokens fosse gerado.

Enfileiramento

Uma fila de mensagens é a solução para distribuição de carga de operação, além de controlar as taxas de solicitação e de consumidor. Há várias opções de fila de mensagens disponíveis, algumas de código aberto, outras proprietárias, e muitas delas podem funcionar com diferentes linguagens.

Ao usar filas de mensagens, você pode ter vários produtores enviando mensagens para a fila e vários consumidores processando essas mensagens. Para implementar os otimizadores no lado dos consumidores, limite o número de consumidores simultâneos ou implemente limitadores de taxa ou otimizadores para os produtores ou consumidores.

Por exemplo, se um consumidor de mensagens encontrar um erro de limite de taxas, ele poderá retornar a solicitação à fila para ser repetida. Ao mesmo tempo, esse consumidor também pode notificar todos os outros consumidores para pausar o processamento por alguns segundos para se recuperar do erro.

Anterior
Gerenciar dados com eficiência
Avançar
Alias compartilhados
Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-08-03 UTC.