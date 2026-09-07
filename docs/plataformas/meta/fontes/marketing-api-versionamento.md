---
titulo: "Marketing API — versionamento e ciclo de vida das versões"
url: https://developers.facebook.com/documentation/ads-commerce/marketing-api/overview/versioning
capturado_em: 2026-09-07
hash: 2afadc6bb59e848d
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Controle de versões da API de Marketing
Updated: 24 de jun de 2026
Copiar para LLM
Ver como Markdown
Os anúncios no Status do WhatsApp são disponibilizados por meio da API de Marketing. Saiba mais sobre anúncios no Status do WhatsApp.
A versão atual da API de Marketing é v26.0.
A plataforma do Facebook tem um modelo de controle de versões principal e um ampliado. Com o controle de versões da API de Marketing, a Meta lança todas as alterações importantes em uma nova versão. As diversas versões das APIs de Marketing ou dos SDKs podem coexistir com funcionalidades diferentes em cada versão.
Os desenvolvedores devem saber com antecedência quando uma API de Marketing ou um SDK sofrerá alterações. Embora haja um período de carência de 90 dias para adotar as alterações, a escolha de como e quando passar para a nova versão é sua.
Cronogramas de versão
Quando uma nova versão da API de Marketing é lançada, a Meta mantém a compatibilidade com a versão anterior por pelo menos 90 dias. Isso significa que você terá esse período de carência para atualizar a versão. Durante esses 90 dias, você poderá fazer chamadas para a versão atual e a versão obsoleta. Depois desse prazo, será necessário atualizar para a nova versão. Ao término do período de carência, a versão obsoleta deixará de funcionar. Depois que uma versão ficar indisponível, as chamadas feitas para ela poderão falhar ou ser atualizadas para a próxima versão disponível. Para obter detalhes sobre quando as chamadas são atualizadas em vez de falharem, consulte Atualização automática da versão.
Por exemplo, a API de Marketing v17.0 foi lançada em 23 de maio de 2023, e a v16.0 expirou em 6 de fevereiro de 2024, o que fornece ao menos 90 dias para fazer a atualização.
Veja um exemplo de cronograma. É possível que a Meta não lance uma nova versão no final do período de carência de 90 dias da versão anterior. No exemplo, a v16.0 fica obsoleta um pouco antes do lançamento da v18.0:
No caso dos SDKs, uma versão está sempre disponível porque o SDK é um pacote para download. Depois do fim de vida útil, o SDK continuará se baseando nas APIs de Marketing ou em métodos que não funcionam mais; por isso, presuma que ele não funcionará mais no fim de vida útil.
Como fazer solicitações com controle de versão
Todos os pontos de extremidade da API de Marketing estão disponíveis por meio de um caminho com controle de versões. Adicione o identificador de versão no início do caminho da solicitação. Por exemplo:
curl -G \
-d "access_token=<ACCESS_TOKEN>" \
"https://graph.facebook.com/v26.0/me/adaccounts"
O caminho com controle de versão funciona para todas as versões, neste formato geral:
https://graph.facebook.com/v{n}/{request-path}
Nele, n é a versão necessária. Veja uma lista completa das versões disponíveis no nosso registro de alterações. Todas as referências da API de Marketing fornecem informações por versão.
Migrações
As migrações são somente para casos especiais, nos quais as alterações que precisam ser feitas não podem entrar no controle de versões. Normalmente, uma migração é necessária quando o modelo de dados subjacente é alterado. Migrações aplicam-se a todas as versões.
As migrações que ainda estão em andamento aparecem listadas na nossa página de migrações. As migrações têm uma janela de pelo menos 90 dias, durante a qual você deverá migrar o app. Uma vez iniciada a janela, o comportamento pós-migração se tornará o padrão para os novos apps. Depois, quando a janela de migração tiver sido concluída, o comportamento pré-migração não estará mais disponível.
Gerenciar migrações por meio da Graph API
As migrações podem ser gerenciadas por meio do campo de migrações do nó /app:
É possível fazer uma chamada de atualização na borda para ativar e desativar migrações.
Gerenciar migrações por meio do Painel de Apps
Você pode ativar e desativar as migrações disponíveis no Painel de Apps, em Configurações > Migrações. A lista de migrações pode não ser a mesma da imagem abaixo, já que as migrações disponíveis são específicas para cada app, em momentos diferentes. Caso você veja uma migração Use Graph API v2.0 by default, ela será para Graph API somente, não para a API de Marketing.
Ativação temporária de migrações no lado do cliente
Em vez de ativar a migração no Painel de Apps ou via API de Marketing, é possível adicionar uma sinalização especial às suas chamadas da API de Marketing que define a migração. A sinalização é chamada de migrations_override e exige que você defina um blob JSON que descreva as migrações a serem ativadas ou desativadas. Por exemplo, se fosse fazer uma chamada bruta, você poderia passar:
https://graph.facebook.com/path?
  migrations_override={"migration1":true, "migration2":false}
Ao usar a sinalização migrations_override, você poderá chamar a nova API de Marketing por meio de atualizações do cliente, em vez de fazer com que todos atualizem para chamar a nova API de Marketing ao mesmo tempo. A sinalização também é útil para depuração.
Os nomes dessas migrações são encontrados no campo migrations do nó /app, que representa a configuração do seu app.
Atualização automática da versão
As versões da API de Marketing são lançadas a cada quatro meses. A partir de maio de 2024, a Meta habilitará o recurso de atualização automática da versão para os pontos de extremidade da API de Marketing que não são afetados entre as versões. A atualização automática da versão significa que, entre uma versão prestes a ficar obsoleta e a próxima disponível, se nenhum ponto de extremidade for afetado, a plataforma atualizará a chamada para a versão a ser lançada, em vez de apresentar falha na solicitação diretamente. Esse recurso reduz o número de solicitações que resultam em falha quando uma versão é descontinuada.
Por exemplo, no dia 14 de maio de 2024, a versão 17.0 ficou obsoleta. De acordo com o registro de alterações da v18.0, a v18.0 altera os seguintes pontos de extremidade:
POST /act_{ad-account-id}/reachfrequencypredictions
GET /act_{ad-account-id}/reachestimate
GET /act_{ad-account-id}/delivery_estimate
POST /act_{ad-account-id}/adsets
POST /{adset-id}
POST /act_{ad-account-id}/saved_audiences
POST /{saved-audience-id}
POST /act_{ad-account-id}/credit_cards
Caso seu app faça uma chamada POST /{adset-id} com a v17.0 depois que ela ficar obsoleta no dia 14 de maio de 2024, essa solicitação da API falhará, já que a atualização automática não se aplica aos pontos de extremidade afetados pela próxima versão disponível (v18.0).
Se o app fizer uma chamada GET /{ad-account-id}/insights com a v17.0 depois que ela ficar obsoleta, a plataforma atualizará sua solicitação para a próxima versão disponível (v18.0).
Observação: caso seu app já esteja fazendo chamadas com versões posteriores à v17.0, nada mudará na data em que a versão ficar obsoleta.
Para verificar os pontos de extremidade afetados em cada versão, consulte o registro de alterações da API de Marketing.
Perguntas frequentes
Cronogramas de versão
O que acontece se eu não especificar a versão da API de Marketing?
Chamamos isso de chamada sem versão. As chamadas sem versão são inválidas e falharão se forem feitas a pontos de extremidade da API de Marketing.
Posso fazer chamadas para versões mais antigas do que a versão atual?
Você pode fazer chamadas à versão da API de Marketing que era a mais recente quando o app foi criado, desde que não tenha se tornado obsoleta. Também é possível fazer chamadas a versões mais recentes e não obsoletas lançadas após a criação do app.
A partir de 14 de maio de 2024, se uma versão obsoleta for fornecida, a plataforma poderá atualizar os pontos de extremidade selecionados para a próxima versão disponível em vez de apresentar falha na solicitação. Para saber mais sobre esse comportamento, consulte Atualização automática de versão da API de Marketing.
Por exemplo:
Se tiver sido criado antes do lançamento da v17.0, enquanto a v16.0 estava disponível, o app poderá fazer chamadas à v16.0 até a respectiva data de validade. Depois que a v16.0 ficar obsoleta, as chamadas a essa versão falharão.
Se tiver sido criado após o lançamento da v17.0, o app poderá fazer chamadas à v17.0 e a versões subsequentes (v18.0 e assim por diante) até as respectivas datas de validade. Depois que a v17.0 ficar obsoleta, as chamadas a essa versão falharão.
Seu app não poderá fazer chamadas à v16.0, já que ela 1) existia antes da criação do app e 2) ficou obsoleta. Chamadas à v16.0 podem falhar ou ser atualizadas para a próxima versão disponível.
Se ainda não tiver sido usado para fazer chamadas ou solicitações e uma versão mais recente da API de Marketing for lançada, o app não poderá usar as versões anteriores da API. Veja outro exemplo que explica a situação:
Caso tenha sido criado enquanto a v16.0 era a mais recente disponível, mas não tenha a usado até depois do lançamento da v17.0, o app só poderá usar a v17.0, e não a v16.0.
Se tiver sido criado enquanto a v16.0 era a mais recente disponível e tenha a usado antes do lançamento da v17.0, o app poderá usar a v16.0, mesmo depois do lançamento da v17.0.
Qual a diferença entre esse processo e o controle de versões da API de Plataforma?
Há algumas diferenças entre a API de Marketing e a Graph API. Para ver mais informações sobre o controle de versões da API da Plataforma, consulte Controle de versões da plataforma.
A API de Marketing tem o controle de versões baseado em um cronograma de descontinuação de 90 dias. Já a API da Plataforma tem APIs básicas e estendidas, com uma garantia de 2 anos para as APIs básicas.
A API de Marketing não é compatível com chamadas sem versão. Se você não especificar uma versão, sua chamada falhará.
Como fazer solicitações com controle de versão
Qual a diferença entre atualizações e migrações?
As migrações podem ser ativadas ou desativadas no Painel de Apps, conforme descrito na seção Migrações. Com o controle de versões, estamos tornando a API de Marketing mais transparente, passando a configuração para o ponto de extremidade:
https://graph.facebook.com/v{n}/{request-path}
É possível saber qual comportamento esperar sem ter que acessar o painel de migração do app.
Atualização automática da versão
A atualização se aplica apenas à versão que ficará obsoleta e à próxima versão disponível?
A atualização será aplicada em qualquer versão obsoleta para a próxima versão disponível. Isso significa que, hipoteticamente, se o app fizer chamadas à versão 15.0 depois que a versão 16.0 ficar obsoleta, a chamada também será atualizada para a versão 17.0 se o ponto de extremidade não estiver listado como ponto de extremidade afetado nas versões 16.0 e 17.0.
Isso significa que os desenvolvedores não precisam fazer nada durante a descontinuação da versão?
Não. Recomendamos que os desenvolvedores façam upgrades de versão antes que uma versão fique obsoleta, pelos seguintes motivos:
Talvez você ainda precise atualizar manualmente os pontos de extremidade que serão impactados na próxima versão.
Recomendamos atualizar para versões mais recentes, aproveitando os novos recursos, em vez de usar a versão mais antiga disponível.
Como posso descobrir quais pontos de extremidade não serão atualizados automaticamente?
Você pode pesquisar os pontos de extremidade afetados no Registro de alterações da API de Marketing.
Como faço para desativar esse comportamento?
É possível desabilitar a atualização automática da versão por meio da configuração Versão da API de Marketing em Página de produto do app da API de Marketing > Configurações.
Posso verificar se alguma chamada de API específica foi atualizada automaticamente?
Se uma chamada de API for direcionada a uma versão que ficou obsoleta e foi atualizada automaticamente, um cabeçalho de resposta da API será incluído em todas as chamadas atualizadas de maneira automática.
Exemplo de cabeçalho de notificação
X-Ad-Api-Version-Warning: 'X-Ad-Api-Version-Warning: 'The call has been auto-upgraded to vXXX as vXXX has been deprecated''
Você achou esta página útil?