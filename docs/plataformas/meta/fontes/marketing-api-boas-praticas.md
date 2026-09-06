---
titulo: "Marketing API — boas práticas"
url: https://developers.facebook.com/docs/marketing-api/best-practices/
capturado_em: 2026-09-06
hash: 651c09429463aad9
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Boas práticas da API de Marketing
Updated: 23 de mar de 2024
Copiar para LLM
Ver como Markdown
Os anúncios no Status do WhatsApp são disponibilizados por meio da API de Marketing. Saiba mais sobre anúncios no Status do WhatsApp.
Alterações de anúncio acionando análises de anúncio
Caso faça alguma alteração nos seguintes cenários, o anúncio será acionado para análise:
Quaisquer alterações no criativo (imagem, texto, link, vídeo, entre outros)
Quaisquer alterações de direcionamento
Quaisquer alterações de metas de otimização e eventos de cobrança também podem acionar a análise
Observação: as alterações realizadas em valor do lance, orçamento e conjunto de anúncios não afetarão o status da análise.
Além disso, se um anúncio entrar na análise com o status de execução “Pausado”, ele permanecerá nesse status ao sair do processo. Caso contrário, o anúncio será considerado ativo e pronto para veiculação.
Paginação
Para obter dados de resposta da paginação, consulte a Paginação da Graph API.
Informações do usuário
Armazene IDs dos usuários, chaves de sessão e identificação da conta de anúncios para facilitar o acesso programático a esses dados e mantê-los juntos. Isso é importante porque as chamadas feitas com o número de identificação da conta de um usuário e a chave de sessão de outro usuário falharão se houver erro de permissão. O armazenamento de dados do usuário precisa ser realizado em conformidade com os Termos da Plataforma do Facebook e com as Políticas do Desenvolvedor.
Lances sugeridos
Execute relatórios frequentes das campanhas, uma vez que os lances sugeridos mudam de forma dinâmica em resposta aos concorrentes que usam direcionamentos semelhantes. As sugestões de lance serão atualizadas em algumas horas, dependendo dos lances dos concorrentes.
Solicitações em lote
Para fazer solicitações múltiplas à API com uma única chamada, consulte:
Solicitações múltiplas
Solicitações em lote
Também é possível consultar diversos objetos pelo ID da seguinte forma:
https://graph.facebook.com/<API_VERSION>?ids=[id1,id2]
Para fazer uma consulta por campo específico:
https://graph.facebook.com/<API_VERSION>?ids=[id1,id2]&fields=field1,field2
Verificar alterações de dados com ETags
Para verificar rapidamente se a resposta a uma solicitação foi alterada desde a última vez, consulte:
Blog de ETags
Referência de ETags
Status de arquivamento e exclusão do objeto
Os objetos de anúncio têm dois tipos de estado de exclusão: arquivado e excluído. É possível consultar objetos arquivados e excluídos com a identificação do objeto. No entanto, os objetos excluídos não serão retornados se você os solicitar a partir da borda de outro objeto.
É possível arquivar até 5 mil objetos a cada vez. Deve-se passar os objetos de anúncio do estado arquivado para o excluído se não precisar mais carregá-los por meio de bordas. Para saber como os estados funcionam e ver exemplos de chamadas, consulte Armazenamento de objetos de anúncio.
Visualização de erros
De forma incorreta, as pessoas tentam criar anúncios que não são aceitos. O documento Códigos de erro apresenta causas de falhas em chamadas de API. É recomendável exibir o erro aos usuários de alguma maneira para que possam corrigir os anúncios.
grupo da comunidade de desenvolvedores de marketing do Facebook
Participe do grupo da Comunidade de Desenvolvedores de Marketing do Facebook⁠ para receber notícias e atualizações sobre a API de Marketing. Os posts do blog da API de Marketing são compartilhados no grupo.
Testes
O modo sandbox é um ambiente de testes para leitura e gravação de chamadas da API de Marketing sem veiculação dos anúncios. Consulte Modo sandbox para desenvolvedores
Experimente fazer chamadas de API com o Explorador da Graph API. Experimente fazer qualquer chamada à API de Marketing. Veja a post de blog. Selecione seu app em App e conceda a ele a permissão ads_management ou ads_read em extended permissions quando criar um token de acesso. Use ads_read se você precisar de acesso à API de Insights sobre Anúncios apenas para gerar relatórios. Use ads_management para ler e atualizar anúncios em uma conta.
Para desenvolvedores e acesso básico, configure uma lista de contas de anúncios para as quais o app pode fazer chamadas de API. Consulte a lista de contas.
Você pode usar o modo sandbox para demonstrar seu app na análise. No entanto, não é possível criar anúncios nem criativos do anúncio no modo sandbox. Por isso, será preciso usar identificações de anúncios e de criativos do anúncio embutidos em código para demonstrar seu uso da API para análise de apps.
Critérios básicos
Demonstrar valor além das soluções principais do Facebook, como o Gerenciador de anúncios do Facebook⁠.
Voltado para os objetivos do negócio, como aumentar as vendas. Os objetivos comerciais do Facebook podem ser encontrados aqui.
Políticas
Entenda as políticas de API. O Facebook tem o direito de auditar sua atividade a qualquer momento:
Termos da Plataforma
Políticas do Desenvolvedor
Políticas de Promoção⁠
Política de Uso de Dados⁠
Declaração de Direitos e Responsabilidades⁠
Diretrizes de Publicidade⁠
Prepare-se para responder rapidamente às mudanças. A maioria das alterações tem controle de versões, e as janelas de alteração são de 90 dias contínuos.
Na Declaração de Direitos e Responsabilidades⁠, você se responsabiliza financeiramente e operacionalmente pelo app, o conteúdo dele e seu uso da plataforma da Meta e da API de Anúncios. Você deve gerenciar a estabilidade e os possíveis bugs do app.
Você achou esta página útil?