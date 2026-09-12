---
titulo: "Google Ads API — limites de taxa (rate limits)"
url: https://developers.google.com/google-ads/api/docs/best-practices/rate-limits?hl=pt-br
capturado_em: 2026-09-12
hash: 722faf40a9b012ae
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Participe da nossa transmissão ao vivo no Discord no servidor da comunidade de publicidade e medição do Google e no YouTube em 20 de agosto, às 11h (horário de Brasília). Vamos discutir os novos recursos adicionados à versão 25.1 da API Google Ads.
 O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Limites de taxas

A API Google Ads aplica a limitação de taxa por consultas por segundo (QPS) em IDs de clientes e projetos do Google Cloud de forma independente. A API Google Ads usa um token bucket algoritmo para medir as solicitações e determinar um limite de QPS adequado. Portanto, o limite exato varia de acordo com a carga geral do servidor em um determinado momento.

O objetivo de impor limites de taxa é evitar que um usuário interrompa o serviço para outros usuários, sobrecarregando (intencionalmente ou não) os servidores da API Google Ads com um grande volume de solicitações.

As solicitações que violam os limites de taxa serão rejeitadas com o erro: RESOURCE_TEMPORARILY_EXHAUSTED.

Você pode controlar seu app e reduzir os limites de taxa, diminuindo ativamente o número de solicitações e limitando o QPS do lado do cliente.

Há várias maneiras de reduzir as chances de exceder o limite de taxa. Conhecer os conceitos de padrões de integração empresarial (EIP) como mensagens, nova entrega e limitação, pode ajudar a criar um app cliente mais robusto.

As práticas recomendadas a seguir estão ordenadas por complexidade, com estratégias mais simples na parte de cima e arquiteturas mais robustas, mas sofisticadas, depois:

Limitar tarefas simultâneas
Solicitações em lote
Limitadores de taxa e limitação
Enfileiramento
Limitar tarefas simultâneas

Uma das principais causas de exceder os limites de taxa é que o app cliente está gerando um número excessivo de tarefas paralelas. Embora não limitemos o número de solicitações paralelas que um app cliente pode ter, isso pode exceder o limite de solicitações por segundo no nível do projeto do Google Cloud.

Recomendamos definir um limite superior razoável para o número total de tarefas simultâneas que farão solicitações (em todos os processos e máquinas) e ajustar para cima para otimizar a capacidade de processamento sem exceder o limite de taxa.

Além disso, você pode limitar o QPS do lado do cliente (confira Limitadores de taxa e limitação).

Solicitações em lote

Considere agrupar várias operações em uma única solicitação. Isso é mais aplicável a chamadas Mutate para vários serviços. Por exemplo, se você estiver atualizando o status de várias instâncias de AdGroupAd, poderá chamar MutateAdGroupAds uma vez e transmitir várias operations em vez de chamar MutateAdGroupAds uma vez para cada AdGroupAd. Consulte nossas orientações sobre operações em lote para conferir outros exemplos.

Embora as solicitações em lote reduzam o número total de solicitações e atenuem os limites de taxa de solicitações por minuto, elas podem acionar o limite de taxa de operações por minuto se você realizar um grande número de operações em uma única conta.

Limitadores de taxa e limitação

Além de limitar o número total de linhas de execução no aplicativo, você também pode implementar limitadores de taxa no lado do cliente. Isso pode garantir que todas as linhas de execução nos processos e / ou clusters sejam regidas por um limite de QPS específico do lado do cliente.

Você pode conferir o limitador de taxa do Guava ou implementar seu próprio algoritmo baseado em token bucket para um ambiente clusterizado. Por exemplo, é possível gerar tokens e armazená-los em um armazenamento transacional compartilhado, como um banco de dados, e cada cliente precisaria adquirir e consumir um token antes de processar a solicitação. Se os tokens fossem usados, o cliente teria que esperar até que o próximo lote de tokens fosse gerado.

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

Última atualização 2026-09-12 UTC.