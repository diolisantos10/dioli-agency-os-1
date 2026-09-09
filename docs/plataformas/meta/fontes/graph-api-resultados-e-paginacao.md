---
titulo: "Graph API — leitura de resultados, paginação e filtros"
url: https://developers.facebook.com/docs/graph-api/results
capturado_em: 2026-09-09
hash: fbad54df6466e3dc
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
Resultados paginados

Abordamos as noções básicas de terminologia e estrutura da Graph API na visão geral da Graph API. Este documento fornece mais informações sobre as solicitações de API.

Como percorrer os resultados paginados

Ao fazer uma solicitação à API para um nó ou uma borda, normalmente você não recebe todos os resultados dessa solicitação em uma única resposta. Isso ocorre por que algumas respostas podem conter milhares de objetos. Portanto, a maioria das respostas é paginada por padrão.

Paginação com base no cursor

A paginação com base no cursor é a forma mais eficiente de paginação e deve ser usada sempre que possível. Um cursor se refere a uma string aleatória que marca um item específico em uma lista de dados. O cursor sempre apontará para o item, mas será invalidado caso ele seja removido ou excluído. Portanto, seu aplicativo não deve armazenar cursores nem supor que eles ainda serão válidos no futuro.

Ao ler uma borda compatível com a paginação por cursor, você verá a seguinte resposta JSON:

{
  "data": [
     ... Endpoint data is here
  ],
  "paging": {
    "cursors": {
      "after": "MTAxNTExOTQ1MjAwNzI5NDE=",
      "before": "NDMyNzQyODI3OTQw"
    },
    "previous": "https://graph.facebook.com/{your-user-id}/albums?limit=25&before=NDMyNzQyODI3OTQw"
    "next": "https://graph.facebook.com/{your-user-id}/albums?limit=25&after=MTAxNTExOTQ1MjAwNzI5NDE="
  }
}

Uma borda paginada por cursor aceita os seguintes parâmetros:

before: o cursor que aponta para o início da página de dados retornados.
after: o cursor que aponta para o fim da página de dados retornados.
limit: o número máximo de objetos que podem ser retornados. Uma consulta pode retornar menos que o valor do limit devido à filtragem. Não conte com um número de resultados menor que o valor de limit para determinar que a sua consulta chegou ao fim da lista de dados. Em vez disso, use como base a ausência de next, conforme descrito abaixo. Por exemplo, se você definir o limit como 10, e 9 resultados forem retornados, poderá haver mais dados disponíveis, mas um item foi removido devido à filtragem de privacidade. Além disso, algumas bordas podem ter um valor máximo de limit por motivos de desempenho. Em todos os casos, a API retornará os links de paginação corretos.
next: o ponto de extremidade da Graph API que retornará a próxima página de dados. Se não for incluído, esta será a última página de dados. Devido à forma como a paginação funciona em termos de visibilidade e privacidade, é possível que uma página esteja vazia, mas contenha um link de paginação next. Interrompa a paginação quando o link next não aparecer mais.
previous: o ponto de extremidade da Graph API que retornará a página de dados anterior. Se não for incluído, esta será a primeira página de dados.

Não armazene cursores. Os cursores podem se tornar inválidos rapidamente se itens forem adicionados ou excluídos.

Paginação com base no tempo

A paginação por tempo é usada para navegar pelos dados dos resultados usando registros de data e hora do Unix, que apontam para horários específicos em uma lista de dados.

Ao usar um ponto de extremidade que usa a paginação com base no tempo, você verá a seguinte resposta JSON:

{
  "data": [
     ... Endpoint data is here
  ],
  "paging": {
    "previous": "https://graph.facebook.com/{your-user-id}/feed?limit=25&since=1364849754",
    "next": "https://graph.facebook.com/{your-user-id}/feed?limit=25&until=1364587774"
  }
}

Uma borda com paginação por tempo aceita os seguintes parâmetros:

until: um registro de data e hora do Unix ou um valor de dados strtotime que aponta para o final do intervalo de dados baseados no tempo.
since: um registro de data e hora do Unix ou um valor de dados strtotime que aponta para o início do intervalo de dados baseados no tempo.
limit: o número máximo de objetos que podem ser retornados. Uma consulta pode retornar menos que o valor do limit devido à filtragem. Não conte com um número de resultados menor que o valor de limit para determinar que a sua consulta chegou ao fim da lista de dados. Em vez disso, use como base a ausência de next, conforme descrito abaixo. Por exemplo, se você definir o limit como 10, e 9 resultados forem retornados, poderá haver mais dados disponíveis, mas um item foi removido devido à filtragem de privacidade. Além disso, algumas bordas podem ter um valor máximo de limit por motivos de desempenho. Em todos os casos, a API retornará os links de paginação corretos.
next: o ponto de extremidade da Graph API que retornará a próxima página de dados.
previous: o ponto de extremidade da Graph API que retornará a página de dados anterior.

Para obter resultados consistentes, especifique os parâmetros since e until. Além disso, é recomendável que o intervalo de tempo seja de no máximo 6 meses.

Paginação com base no deslocamento

A paginação por deslocamento pode ser usada quando a cronologia não for importante e você quiser retornar apenas um número específico de objetos. Use essa opção somente se a borda não for compatível com a paginação com base no cursor ou no tempo.

Uma borda com paginação por deslocamento aceita os seguintes parâmetros:

offset: esse parâmetro desloca o início de cada página de acordo com o número especificado.
limit: o número máximo de objetos que podem ser retornados. Uma consulta pode retornar menos que o valor do limit devido à filtragem. Não conte com um número de resultados menor que o valor de limit para determinar que a sua consulta chegou ao fim da lista de dados. Em vez disso, use como base a ausência de next, conforme descrito abaixo. Por exemplo, se você definir o limit como 10, e 9 resultados forem retornados, poderá haver mais dados disponíveis, mas um item foi removido devido à filtragem de privacidade. Além disso, algumas bordas podem ter um valor máximo de limit por motivos de desempenho. Em todos os casos, a API retornará os links de paginação corretos.
next: o ponto de extremidade da Graph API que retornará a próxima página de dados. Se não for incluído, esta será a última página de dados. Devido à forma como a paginação funciona em termos de visibilidade e privacidade, é possível que uma página esteja vazia, mas contenha um link de paginação next. Interrompa a paginação quando o link next não aparecer mais.
previous: o ponto de extremidade da Graph API que retornará a página de dados anterior. Se não for incluído, esta será a primeira página de dados.

Observe que, se novos objetos forem adicionados à lista de itens paginados, isso mudará o conteúdo de cada página baseada em deslocamento.

A paginação com base no deslocamento não é compatível com todas as chamadas à API. Para obter resultados consistentes, recomendamos fazer a paginação usando os links Voltar/Avançar retornados na resposta.

Você poderá encontrar limites ao fazer a paginação de objetos com diversos itens retornados, como comentários, que podem somar dezenas de milhares. A API retornará um erro quando seu aplicativo atingir o limite do cursor:

{
  "error": {
    "message": "(#100) The After Cursor specified exceeds the max limit supported by this endpoint",
    "type": "OAuthException",
    "code": 100
  }
}
Próximas etapas

Agora que você já conhece a Graph API, visite o Guia da ferramenta Explorador da Graph API para explorá-la sem gravar código, confira os Usos comuns para ver quais são as tarefas mais executadas e consulte os SDKs disponíveis.

Nesta Página
Resultados paginados
Como percorrer os resultados paginados
Paginação com base no cursor
Paginação com base no tempo
Paginação com base no deslocamento
Próximas etapas