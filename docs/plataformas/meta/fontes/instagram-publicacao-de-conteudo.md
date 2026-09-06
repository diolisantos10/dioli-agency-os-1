---
titulo: "Instagram Platform — publicação de conteúdo por API"
url: https://developers.facebook.com/documentation/instagram-platform/content-publishing
capturado_em: 2026-09-06
hash: 8c73a3a03031754a
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Publicação de conteúdo
Updated: 30 de jun de 2026
Copiar para LLM
Ver como Markdown
Este guia mostra como publicar imagens, vídeos ou reels individuais (posts de mídia única) ou criar posts contendo várias imagens e vídeos (posts em carrossel) nas contas profissionais do Instagram usando a plataforma do Instagram.
No dia 24 de março de 2025, lançamos o novo campo alt_text para posts de imagem no ponto de extremidade /<INSTAGRAM_PROFESSIONAL_ACCOUNT_ID>/media. Reels e Stories não são compatíveis.
Requisitos
Este guia considera que você leu a Visão geral da plataforma do Instagram e implementou os componentes necessários para usar a API (como um fluxo de login da Meta e um servidor de webhooks para receber notificações).
Mídia em servidor público
Criamos um cURL para mídias usadas em tentativas de publicação. Por isso, as mídias precisam estar hospedadas em um servidor publicamente acessível no momento da tentativa.
Autorização para publicação na Página
Em contas profissionais do Instagram vinculadas a uma Página que requer PPA⁠ (Autorização de Publicação na Página), não será possível fazer publicações enquanto a PPA não for obtida.
É possível que um usuário do app consiga executar Tarefas em uma Página que inicialmente não tinha PPA, mas que começa a exigir essa autorização em um momento posterior. Nessa situação, o usuário do app só poderá publicar conteúdo na conta profissional do Instagram depois de concluir o processo de PPA. Já que não é possível determinar se a Página de um usuário requer ou não PPA, recomendamos que você oriente os usuários do app a concluir o processo de autorização para prevenir problemas futuros.
Você precisará do seguinte:
	API do Instagram com o Login do Instagram	API do Instagram com o Login do Facebook

Níveis de acesso
	
Acesso avançado
Acesso padrão
	
Acesso avançado
Acesso padrão

Tokens de acesso
	
Token de acesso do usuário do Instagram
	
Token de acesso à Página do Facebook

URL de hospedagem
	
graph.instagram.com
	
graph.facebook.comrupload.facebook.com (para carregamentos de vídeo retomáveis)

Tipo de login
	
Login de Empresa no Instagram
	
Login do Facebook para Empresas

Permissões
	
instagram_business_basic
instagram_business_content_publish
	
instagram_basic
instagram_content_publish
pages_read_engagement
Caso uma função tenha sido concedida ao usuário do app por meio do Gerenciador de Negócios na Página conectada à respectiva conta profissional do Instagram, seu app também precisará da seguinte permissão:
ads_management
ads_read

Webhooks
	
	
Pontos de extremidade
/<IG_ID>/media – Criar um contêiner e carregar a mídia
upload_type=resumable – Crie uma sessão de carregamento retomável para carregar vídeos grandes a partir de uma área com interrupções frequentes de rede ou outros tipos de falhas de transmissão. Apenas para apps que implementaram o Login do Facebook para Empresas.
/<IG_ID>/media_publish – publique mídias carregadas usando contêineres de mídia.
/<IG_CONTAINER_ID>?fields=status_code: para verificar a qualificação e o status da publicação do contêiner de mídia.
/<IG_ID>/content_publishing_limit: para verificar o uso atual do limite de volume de publicações do usuário do app.
POST https://rupload.facebook.com/ig-api-upload/<IG_MEDIA_CONTAINER_ID> – Carregue o vídeo nos servidores da Meta
GET /<IG_MEDIA_CONTAINER_ID>?fields=status_code – Verificar a qualificação e o status da publicação do vídeo
Solução de problemas de codificação de URL HTML
Alguns parâmetros são suportados no formato lista/dict.
Alguns caracteres precisam ser codificados em um formato que possa ser transmitido pela internet. Por exemplo: user_tags=[{username:'ig_user_name'}] é codificado como user_tags=%5B%7Busername:ig_user_name%7D%5D, onde [ é codificado como %5B e { é codificado como %7B. Para ver mais conversões, consulte o padrão de codificação de URL HTML.
Limitações
O único formato de imagem compatível é o JPEG. Não há compatibilidade com formatos derivados de JPEG, como MPO e JPS.
Não há compatibilidade com tags de compras.
Não há compatibilidade com filtros.
Para ver outras limitações, consulte a referência de cada ponto de extremidade.
Limite de volume
Em um período de 24 horas, a API pode fazer no máximo 100 publicações por conta do Instagram. Os carrosséis contam como um único post. Esse limite é aplicado no ponto de extremidade POST /<IG_ID>/media_publish quando você tenta publicar um contêiner de mídia. Também recomendamos que seu app imponha o limite, principalmente se ele permitir que os usuários agendem publicações futuras.
Para verificar o uso atual do limite de volume de uma conta profissional do Instagram, consulte o ponto de extremidade GET /<IG_ID>/content_publishing_limit.
Criar um contêiner
Para publicar um objeto de mídia, é necessário que ele tenha um contêiner. Para criar o contêiner e carregar um arquivo de mídia, envie uma solicitação POST ao ponto de extremidade /<IG_ID>/media com estes parâmetros:
access_token – Definido como o token de acesso do usuário do app
image_url ou video_url – Definido como o caminho da imagem ou do vídeo. Criaremos um cURL para a imagem a partir do URL fornecido, que deve estar em um servidor público.
media_type – Se o contêiner for de vídeo, defina como VIDEO, REELS ou STORIES.
is_carousel_item – Se a mídia fizer parte de um carrossel, defina como true.
upload_type – Defina como resumable se estiver criando uma sessão de carregamento retomável para um arquivo de vídeo grande
Consulte a Referência do ponto de extremidade de mídia do usuário do Instagram para ver outros parâmetros opcionais.
Exemplo de solicitação
Texto formatado para facilitar a leitura.
curl -X POST "https://<HOST_URL>/<LATEST_API_VERSION>/<IG_ID>/media"
     -H "Content-Type: application/json"
     -H "Authorization: Bearer <ACCESS_TOKEN>"
     -d '{
           "image_url":"https://www.example.com/images/bronz-fonz.jpg"
         }'
Caso ela seja bem-sucedida, o app receberá uma resposta JSON com a identificação do contêiner do Instagram.
{
  "id": "<IG_CONTAINER_ID>"
}
Criar um contêiner de carrossel
Para publicar até 10 imagens, vídeos ou uma combinação dos dois em uma única publicação, é preciso criar um contêiner de carrossel. Esse contêiner de carrossel terá uma lista de todos os contêineres de mídia.
Para criar o contêiner de carrossel, envie uma solicitação POST para o ponto de extremidade /<IG_ID>/media com os seguintes parâmetros:
media_type: definido como CAROUSEL. Indica que o contêiner é destinado a um carrossel.
children – Uma lista separada por vírgulas com até 10 identificações de contêiner de cada imagem e vídeo que deve aparecer no carrossel publicado.
Limitações
Os carrosséis podem ter no máximo 10 itens, entre imagens, vídeos ou uma combinação das duas mídias.
Todas as imagens do carrossel são cortadas com base na primeira escolhida. A taxa de proporção padrão é de 1:1.
Em um período de 24 horas, as contas podem fazer no máximo 50 publicações. Publicar um carrossel conta como um único post.
Exemplo de solicitação
Texto formatado para facilitar a leitura.
curl -X POST "https://graph.instagram.com/v26.0/90010177253934/media"
     -H "Content-Type: application/json"
     -d '{
           "caption":"Fruit%20candies"
           "media_type":"CAROUSEL"
           "children":"<IG_CONTAINER_ID_1>,<IG_CONTAINER_ID_2>,<IG_CONTAINER_ID_3>"
         }'
Caso ela seja bem-sucedida, o app receberá uma resposta JSON com a identificação do contêiner de carrossel do Instagram.
{
  "id": "<IG_CAROUSEL_CONTAINER_ID>"
}
Sessão de carregamento retomável
Se você tiver criado um contêiner para um carregamento de vídeo retomável na Etapa 1, será necessário carregar o vídeo antes de publicá-lo.
A maioria das chamadas de API usam o host graph.facebook.com. No entanto, as chamadas para carregar vídeos para o Reels usam rupload.facebook.com.
As seguintes fontes de arquivos são suportadas para arquivos de vídeo carregados:
Um arquivo localizado no seu computador
Um arquivo hospedado em um servidor voltado para o público, como um CDN
Para iniciar a sessão de carregamento, envie uma solicitação POST ao ponto de extremidade /<IG_MEDIA_CONTAINER_ID no host rupload.facebook.com com os seguintes parâmetros:
access_token *
Exemplo de solicitação para carregar um arquivo de vídeo local
Com o ig-container-id retornado a partir de uma chamada de sessão de carregamento retomável, carregue o vídeo.
O host precisa ser rupload.facebook.com.
Todos os media_type compartilham o mesmo fluxo para carregar o vídeo.
ig-container-id é a identificação retornada das chamadas de sessão de carregamento.
access-token é o mesmo usado nas etapas anteriores.
offset é definido como o primeiro byte a ser carregado, geralmente 0.
file_size é definido como o tamanho do seu arquivo em bytes.
Your_file_local_path é definido como o caminho do arquivo local; por exemplo, se você estiver carregando um arquivo a partir da pasta Downloads no macOS, o caminho será @Downloads/example.mov.
curl -X POST "https://rupload.facebook.com/ig-api-upload/<API_VERSION>/<IG_MEDIA_CONTAINER_ID>`" \
     -H "Authorization: OAuth <ACCESS_TOKEN>" \
     -H "offset: 0" \
     -H "file_size: Your_file_size_in_bytes" \
     --data-binary "@my_video_file.mp4"
Exemplo de solicitação para carregar um vídeo público hospedado
curl -X POST "https://rupload.facebook.com/ig-api-upload/<API_VERSION>/<IG_MEDIA_CONTAINER_ID>`" \
     -H "Authorization: OAuth <ACCESS_TOKEN>" \
     -H "file_url: https://example_hosted_video.com"
Exemplo de resposta
// Success Response Message
{
  "success":true,
  "message":"Upload successful."
}

// Failure Response Message
{
  "debug_info":{
    "retriable":false,
    "type":"ProcessingFailedError",
    "message":"{\"success\":false,\"error\":{\"message\":\"unauthorized user request\"}}"
  }
}

Publicar o contêiner
Para publicar a mídia,
Envie uma solicitação POST para o ponto de extremidade /<IG_ID>/media_publish com estes parâmetros:
creation_id definido como a identificação do contêiner, seja para um contêiner de mídia única ou um contêiner de carrossel
Exemplo de solicitação
Texto formatado para facilitar a leitura.
curl -X POST "https://<HOST_URL>/<LATEST_API_VERSION>/<IG_ID>/media_publish"
     -H "Content-Type: application/json"
     -H "Authorization: Bearer <ACCESS_TOKEN>"
     -d '{
           "creation_id":"<IG_CONTAINER_ID>"
         }'
Caso ela seja bem-sucedida, o app receberá uma resposta JSON com a identificação de mídia do Instagram.
{
  "id": "<IG_MEDIA_ID>"
}
Posts no Reels
Os reels são vídeos curtos que aparecem na aba Reels do app do Instagram. Para publicar um reel, crie um contêiner para o vídeo e inclua o parâmetro media_type=REELS com o caminho do vídeo usando o parâmetro video_url.
Se você solicitar o campo media_type depois de publicar um reel, o valor será retornado como VIDEO. Para verificar se um vídeo publicado foi designado como reel, é preciso solicitar o campo media_product_type.
Você pode usar a amostra de código no GitHub (insta_reels_publishing_api_sample)⁠ para saber como publicar reels no Instagram.
Posts de reels de teste
Os reels de teste são compartilhados apenas com não seguidores. Para publicar um reel de teste, crie um contêiner para o vídeo e inclua um parâmetro trial_params válido junto com os parâmetros necessários para criar reels. O trial_params consiste nos seguintes campos:
Nome do campo	Descrição

graduation_strategy
	
A estratégia de graduação especifica as condições para graduar um reel (converter o reel de teste em um reel, compartilhando-o com os seguidores). Valores possíveis:
MANUAL – O reel de teste pode ser graduado manualmente no app nativo.
SS_PERFORMANCE – O reel de teste será automaticamente graduado se tiver um bom desempenho.
Exemplo de solicitação
Texto formatado para facilitar a leitura.
curl -X POST "https://graph.instagram.com/v26.0/90010177253934/media"
     -H "Content-Type: application/json"
     -d '{
           "media_type":"REELS"
           "video_url":"https://www.example.com/videos/bronz-fonz.mp4"
           "trial_params":{
             "graduation_strategy": "MANUAL"
           }
         }'
Posts de story
Para publicar um reel, crie um contêiner para o objeto de mídia e inclua o parâmetro media_type definido como STORIES.
Se você solicitar o campo media_type após publicar um story, o valor será retornado como IMAGE/VIDEO. Para verificar se uma mídia de imagem/vídeo publicada é um story, será preciso solicitar o campo media_product_type.
Conteúdo de IA
Para fornecer uma autodivulgação do uso de IA na mídia, defina o parâmetro is_ai_generated como true ao criar um contêiner de mídia. Nos carrosséis, somente o contêiner do carrossel precisa ter o parâmetro is_ai_generated definido como true. Se você definir esse parâmetro em filhos de carrossel, ocorrerá um erro. Esse parâmetro está disponível para a API do Instagram com Login do Facebook e para a API do Instagram com Login do Instagram.
Exemplo de solicitação
curl -X POST "https://graph.facebook.com/<LATEST_API_VERSION>/<IG_USER_ID>/media" \
     -H "Authorization: Bearer <ACCESS_TOKEN>" \
     -d "image_url=<IMAGE_URL>" \
     -d "caption=<CAPTION>" \
     -d "is_ai_generated=true"
Rótulo de anúncios em parceria
Adicione uma etiqueta de anúncios em parceria aos posts incluindo os parâmetros branded_content_sponsor_ids e/ou is_paid_partnership ao criar um contêiner de mídia. Disponível somente para a API do Instagram com o Login do Facebook.
Limitações
O token de acesso do usuário do seu app deve incluir a permissão instagram_branded_content_creator ou instagram_basic.
As contas de patrocinador devem ser contas profissionais.
Máximo de 2 tags de patrocinador por publicação.
Não há suporte para posts somente de amigos próximos nem mídia remixada.
Esse recurso está disponível apenas para a API do Instagram com o Login do Facebook.
Parâmetros
Nome	Descrição

branded_content_sponsor_ids
matriz de números inteiros
	
Opcional.
Uma matriz de identificações de usuários do Instagram de marcas a serem marcadas como parceiros. Máximo de 2. Use a API de Descoberta de Empresas para procurar a identificação de uma marca por nome de usuário.

is_paid_partnership
Booliano
	
Opcional.
Habilita o rótulo "Parceria paga". Definido automaticamente como true quando branded_content_sponsor_ids é fornecido. Use sem branded_content_sponsor_ids para um post somente de rótulo.
Se a marca pré-aprovou o criador de conteúdo por meio do ponto de extremidade branded_content_tag_approval, o rótulo exibirá o nome da marca imediatamente. Se não for aprovado, o rótulo exibirá "Parceria paga" enquanto estiver pendente, e a marca receberá uma notificação de aprovação.
Depois de publicarem o conteúdo, os criadores poderão usar o ponto de extremidade branded_content_partner_promote existente para conceder permissão à marca para promover o post como um anúncio em parceria.
Exemplo de solicitação
curl -X POST "https://graph.facebook.com/<LATEST_API_VERSION>/<IG_USER_ID>/media" \
     -H "Authorization: Bearer <ACCESS_TOKEN>" \
     -d "image_url=<IMAGE_URL>" \
     -d "caption=<CAPTION>" \
     -d "branded_content_sponsor_ids=[<BRAND_IG_USER_ID1>, <BRAND_IG_USER_ID2>]" \
     -d "is_paid_partnership=true"
Solução de problemas
Status de publicação do contêiner.
Se você criar um contêiner para o vídeo, mas o ponto de extremidade POST /<IG_ID>/media_publish não retornar a identificação da mídia publicada, consulte o ponto de extremidade GET /<IG_CONTAINER_ID>?fields=status_code para obter o status de publicação do contêiner. O ponto de extremidade retornará um dos status a seguir:
EXPIRED: o contêiner não foi publicado dentro de 24 horas e expirou.
ERROR: o processo de publicação do contêiner não foi concluído.
FINISHED: o contêiner e o objeto de mídia estão prontos para publicação.
IN_PROGRESS: o processo de publicação do contêiner está em andamento.
PUBLISHED: o objeto de mídia do contêiner foi publicado.
Recomendamos consultar o status de um contêiner uma vez por minuto, por no máximo cinco minutos.
Erros no rótulo de anúncios em parceria
Título do código de erro	Mensagem

INSTAGRAM_PLATFORM_API__PERMISSION
	
O criador de conteúdo não é qualificado para conteúdo de marca. Certifique-se de que as ferramentas para conteúdo de marca estejam habilitadas na conta do criador.

INSTAGRAM_PLATFORM_API__INVALID_PARAM
	
O patrocinador especificado não pode ser marcado. O patrocinador deve ser uma conta profissional e não pode estar bloqueado.

INSTAGRAM_PLATFORM_API__INVALID_PARAM
	
Número máximo de patrocinadores excedido. O limite é de 2 por publicação.

INSTAGRAM_PLATFORM_API__INVALID_PARAM
	
Não é possível se marcar como patrocinador.
Consulte a referência Error Codes para conferir erros adicionais.
Próximas etapas
Agora que você fez uma publicação em uma conta profissional do Instagram, saiba como moderar comentários na sua mídia.
Você achou esta página útil?