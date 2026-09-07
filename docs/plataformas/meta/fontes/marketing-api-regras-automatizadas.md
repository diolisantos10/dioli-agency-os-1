---
titulo: "Marketing API — Ad Rules (regras automatizadas)"
url: https://developers.facebook.com/documentation/ads-commerce/marketing-api/ad-rules
capturado_em: 2026-09-07
hash: 8c2dc11ee32282fe
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Mecanismo de regras de anúncios
Updated: 26 de jun de 2026
Copiar para LLM
Ver como Markdown
Os anúncios no Status do WhatsApp são disponibilizados por meio da API de Marketing. Saiba mais sobre anúncios no Status do WhatsApp.
O mecanismo de regras de anúncios é um serviço central de gerenciamento de regras que ajuda você a gerenciar anúncios automaticamente com base nas regras definidas. Sem ele, você precisaria consultar a API de Marketing para monitorar o desempenho de um anúncio e tomar medidas manualmente em determinadas condições.
Como a maioria das condições pode ser representada por expressões lógicas, você consegue automatizar o gerenciamento de duas formas: por meio de regras baseadas em cronograma ou regras baseadas em gatilho.
Objetos de regras de anúncios
Você cria regras de anúncios como objetos independentes e as armazena em uma biblioteca. Cada regra de anúncio contém no mínimo uma name, uma evaluation_spec e uma execution_spec.
Estrutura básica
Para criar uma regra de anúncio, envie uma solicitação POST à borda adrules_library da conta de anúncios, conforme o exemplo abaixo:
curl -X POST \
  -F 'name=Rule 1' \
  -F 'evaluation_spec={
    ...
  }' \
  -F 'execution_spec={
    ...
  }' \
  -F "access_token=<ACCESS_TOKEN>" \
https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/adrules_library
Opções
Regras baseadas em gatilho
Monitore o estado dos anúncios em tempo real. O mecanismo de regras de anúncios avalia uma regra baseada em gatilho assim que os metadados dos objetos de anúncio relevantes ou os dados de Insights sobre Anúncios são alterados.
Regras baseadas em cronograma
Monitore o status dos seus anúncios verificando-os em intervalos de tempo definidos para ver se atendem aos critérios da evaluation_spec.
Componentes
Especificação de avaliação
O objetivo principal da evaluation_spec de uma regra é determinar os objetos sobre os quais a regra deve executar a ação.
Especificação de execução
A execution_spec de uma regra determina a ação que se aplica a todos os objetos que passam pela avaliação.
Status
O status de uma regra determina se a regra deve estar em execução.
Para desativar temporariamente uma regra, defina seu status como DISABLED. Para reativar, defina o status da regra como ENABLED. Se quiser remover uma regra de modo permanente, será preciso excluí-la.
Você achou esta página útil?