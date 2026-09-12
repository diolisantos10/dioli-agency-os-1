---
titulo: "Pages API — visão geral (Páginas do Facebook por API)"
url: https://developers.facebook.com/documentation/pages-api
capturado_em: 2026-09-12
hash: 29c09afeafe955ea
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
API de Páginas do Facebook
Updated: 7 de mai de 2026
Copiar para LLM
Ver como Markdown
Com a API de Páginas do Facebook, os apps podem gerenciar Páginas e acessar recursos relacionados com as permissões necessárias. Essa API permite a execução de várias tarefas de gerenciamento da Página do Facebook, como postar conteúdo, ler insights, moderar comentários e receber atualizações em tempo real.
Principais componentes:
Tokens de acesso: gere tokens autenticados com as permissões necessárias.
Pontos de extremidade: execute operações (postar, receber, atualizar, excluir).
Webhooks: receba atualizações em tempo real.
Tokens de acesso e autenticação
Para interagir com a API de Páginas, é necessário ter um token de acesso à Página. Esse token é gerado por meio da autenticação do usuário e concede permissões para executar ações de API como a Página.
Como gerar um token de acesso à Página
O app solicita ao usuário as permissões necessárias.
O usuário autoriza o app.
O app troca o código de autorização por um token de acesso do usuário.
O app usa o token para solicitar um token de acesso à Página.
Permissões e recursos
Os pontos de extremidade exigem diferentes permissões:
pages_show_list: veja Páginas gerenciadas pelo usuário.
pages_read_engagement: leia o conteúdo postado na Página.
pages_manage_posts: publique e agende conteúdo.
pages_manage_engagement: modere comentários e exclua posts.
pages_read_user_content: leia conteúdo gerado pelo usuário na Página.
pages_manage_metadata: gerencie as configurações da Página.
pages_manage_ads: crie e gerencie anúncios na Página.
pages_manage_cta: veja e atualize botões de chamada para ação.
pages_messaging: gerencie e envie mensagens em nome da Página.
business_management: gerencie ativos de negócios relacionados à Página.
Pontos de extremidade da API
Informações da Página
Recupere informações básicas sobre uma Página.
Solicitação:
GET /<PAGE_ID>?fields=id,name,about,fan_count
Permissões:pages_show_list, pages_read_engagement
Como postar conteúdo
Crie novos posts em uma Página.
Solicitação:
POST /{page-id}/feed
Parâmetros:
message
link
picture
published
Permissões:pages_manage_posts
POST /{page-id}/feed
Body:
{
  message: "Hello from the Pages API!"
}
Gerenciamento de comentários
Leia, crie e modere comentários em posts da Página.
Ler comentários:
GET /{object-id}/comments
Postar um comentário:
POST /{object-id}/comments
Excluir um comentário:
DELETE /<COMMENT_ID>
Permissões:pages_manage_engagement
Informações
Gere análises e métricas para a Página.
Solicitação:
GET /{page-id}/insights?metric=page_impressions,page_fans
Permissões:pages_read_engagement
Menções
Recupere posts ou comentários que mencionam a Página.
Solicitação:
GET /{page-id}/tagged
Permissões:pages_read_user_content
Configurações da Página
Atualize ou recupere configurações da Página, como foto da capa, descrição ou preferências para troca de mensagens.
Ver configurações:
GET /{page-id}?fields=cover,about,description
Atualizar configurações:
POST /{page-id}/settings
Permissões:pages_manage_metadata
Webhooks
Os webhooks fornecem atualizações em tempo real sobre mudanças ou eventos na Página, como novos comentários, curtidas ou mensagens.
Configuração
Configure um URL de retorno de chamada no painel do desenvolvedor.
Assine os campos escolhidos (como feed, mentions, messages).
Seu serviço receberá notificações HTTP POST para eventos relevantes.
Análise do app e publicação
Caso seu app precise de permissões estendidas (a maioria dos recursos de gerenciamento da Página), será preciso passar pela análise do app do Facebook.
Etapas da análise
Solicite as permissões necessárias no painel do desenvolvedor.
Forneça casos de uso detalhados e screencasts.
Envie o app para análise e responda ao feedback.
Exemplos de solicitação
Como postar uma mensagem
Como ver insights sobre o post
Como moderar comentários
Excluir um comentário:
Solução de erros
Use mensagens e códigos de erro do Facebook para identificar problemas.
Erros comuns: token inválido, permissões ausentes, limite de volume.
Referência: /docs/graph-api/using-graph-api/error-handling/
Melhores práticas
Use as permissões mínimas necessárias.
Armazene as respostas em cache sempre que possível.
Gerencie a paginação para grandes volumes de resultados.
Respeite a privacidade do usuário e as políticas do Facebook.
Referências
Documentação da API de Páginas do Facebook
Referência da API
Webhooks
API de Páginas do Facebook
A API de Páginas do Facebook da Meta permite que apps acessem e atualizem as configurações e o conteúdo de uma Página do Facebook, criem e encontrem posts, recebam comentários em conteúdo próprio na Página, obtenham insights sobre a Página, atualizem as ações que usuários podem realizar e muito mais.
Neste documento, você encontra guias para saber mais sobre a API de Páginas do Facebook e como implementá-la.
Conteúdo da documentação
Recomendamos ler cada guia na ordem descrita neste documento.
Visão geral: aprenda sobre os componentes da API de Páginas e como ela funciona.
Crie um app: crie um app da Meta com o caso de uso da API de Páginas.
Primeiros passos: um tutorial de introdução que mostra como fazer um post na sua Página do Facebook.
Gerenciar uma Página: veja uma lista das suas Páginas com as tarefas que você pode realizar, verifique os tokens de acesso e atualize as configurações de cada Página.
Posts e comentários: crie, publique, atualize e exclua os posts e os comentários da Página.
Insights sobre a Página: obtenha insights sobre os posts da Página.
Pesquisa de Páginas: pesquise Páginas.
Abas da Página: veja uma lista das abas da sua Página.
Webhooks da Meta: receba no seu servidor notificações em tempo real de eventos que ocorreram na sua Página.
Alterações futuras: receba notificações sobre as alterações futuras que a Meta implementará na sua Página.
Códigos de erro – Veja os códigos de erro e a descrição de erros que podem ocorrer ao implementar a API de Páginas.
Registro de alterações: veja o registro de alterações da API de Páginas.
Você achou esta página útil?