---
titulo: "Desenvolvimento — publicar o app (release): App Review, modo Ativo, requisitos"
url: https://developers.facebook.com/documentation/development/release
capturado_em: 2026-09-09
hash: dff0fd410f766813
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Publicar
Updated: 5 de mai de 2025
Copiar para LLM
Ver como Markdown
Depois de concluídos o desenvolvimento e os testes, o app pode ser publicado. Publicar significa disponibilizar seu app para contas que não têm uma função nele. Este documento lista os processos e as configurações que podem ser necessários para a publicação do seu app.
Se o app só será usado por pessoas que têm uma função nele, não é necessário realizar esses processos, pois o app já está disponível para esses usuários.
Caso já tenha publicado o app e queira adicionar uma nova funcionalidade que requer análise, siga o passo a passo em Análise de aplicativos publicados.
Análise do app
Se o app será usado por qualquer pessoa que não tenha uma função nele, será necessário passar pela análise do app.
A análise do app é um processo em que você pode solicitar a aprovação de permissões e recursos de APIs específicas necessárias para o funcionamento correto. Somente as permissões aprovadas por meio do processo de análise podem ser concedidas por usuários que não têm função no app, e somente os recursos aprovados ficarão ativos para esses usuários.
Essa análise requer a identificação de cada permissão e recurso de que o app precisa e uma justificativa para essa necessidade. Além disso, você precisa mostrar como o app usa os dados retornados ou aceitos pelas APIs.
Saiba mais sobre o processo de análise do app.
Verificação da empresa
A verificação da empresa é um processo que permite confirmar sua identidade como entidade comercial. Os apps que solicitam acesso avançado para permissões e permitem que outras empresas acessem os próprios dados devem estar conectados a uma empresa que tenha passado pela verificação. Antes disso, os usuários do app de outras empresas não poderão conceder as permissões, e todos os recursos ficarão inativos.
Saiba mais sobre a verificação da empresa.
Disponibilizar
Para permitir que pessoas que não têm uma função no seu app o utilizem, é necessário publicá-lo. Caso o seu app exija análise, ela precisa ser concluída para que as pessoas possam usá-lo.
Apps com caso de uso
Para publicar o seu app com caso de uso, navegue até Publicar > Lançar no Painel de Apps e clique no botão Lançar no canto inferior direito.
Tipos de app
Mude para o modo publicado para solicitar a usuários que não têm uma função no app permissões aprovadas na análise e para que os recursos aprovados fiquem ativos para esses usuários. Entretanto, não mude para o modo publicado até que todas as permissões e todos os recursos necessários para o app tenham sido aprovados e você tenha concluído a verificação da empresa, caso seja necessária. Se você mudar para o modo publicado antecipadamente, o app não poderá solicitar permissões não aprovadas dos usuários, e essas permissões ficarão inativas.
Os apps de consumidor têm um comportamento um pouco diferente porque também se baseiam em níveis de acesso. Os apps de consumidor no modo publicado não podem solicitar permissões com acesso padrão de usuários que não têm uma função neles, e os recursos com acesso padrão ficarão inativos para esses usuários.
Os apps de empresa não têm modos e se baseiam exclusivamente em níveis de acesso.
Como lançar novas versões de apps publicados
Se o app já estiver no modo publicado e você quiser adicionar uma nova funcionalidade que requer análise do app, siga o passo a passo em Análise de aplicativos publicados.
Lançamento limitado usando a restrição geográfica
Caso queira lançar o app para um pequeno grupo de usuários antes de disponibilizá-lo para todos, configure restrições que disponibilizam o app somente para usuários de certas faixas etárias e localizações geográficas.
Saiba mais sobre restrições de apps.
Saiba mais
Funções do app
Reivindicar um app para sua empresa
Produtos do Facebook
Empresas no Facebook⁠
Você achou esta página útil?