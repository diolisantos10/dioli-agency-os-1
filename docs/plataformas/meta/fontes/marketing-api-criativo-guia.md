---
titulo: "Marketing API — guia de criativos (formatos, especificações)"
url: https://developers.facebook.com/documentation/ads-commerce/marketing-api/creative
capturado_em: 2026-09-06
hash: eb8ed39ac92e6fcb
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Criativo do anúncio
Updated: 28 de jun de 2026
Copiar para LLM
Ver como Markdown
Os anúncios no Status do WhatsApp são disponibilizados por meio da API de Marketing. Saiba mais sobre anúncios no Status do WhatsApp.
Use os anúncios do Facebook para alcançar seus clientes existentes e encontrar novos. Cada guia descreve produtos de anúncios do Facebook para ajudar a atingir suas metas de publicidade. Existem vários tipos de unidades de anúncios com diversas opções de aparência, posicionamento e criativo. Confira as diretrizes sobre unidades de anúncio como conteúdo do criativo no Guia de anúncios do Facebook⁠.
Criativo
Um criativo do anúncio é um objeto que contém todos os dados necessários para renderizar visualmente o anúncio. Na API, há diferentes tipos de anúncios que você pode criar no Facebook. Consulte a lista de tipos de criativo do anúncio.
Caso você tenha uma campanha com o objetivo de engajamento com o post da Página, será possível criar um anúncio que promove um post feito pela Página. Esse anúncio é considerado um anúncio de post da Página. Os anúncios de post da Página exigem um campo object_story_id, que é a propriedade id de um post desse tipo. Saiba mais na referência Criativo do anúncio.
Um criativo do anúncio tem três partes:
O criativo do anúncio, definido pelos atributos visuais do objeto criativo
O posicionamento no qual o anúncio é veiculado
Prévia da unidade por posicionamento
Para criar o objeto do criativo do anúncio, faça a seguinte chamada:
curl -X POST \
  -F 'name="Sample Promoted Post"' \
  -F 'object_story_id="<PAGE_ID>_<POST_ID>"' \
  -F 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/adcreatives
A resposta à chamada de API é o id do objeto do criativo. Armazene o ID do criativo, você precisará dele para o objeto do anúncio:
curl -X POST \
  -F 'name="My Ad"' \
  -F 'adset_id="<AD_SET_ID>"' \
  -F 'creative={
       "creative_id": "<CREATIVE_ID>"
     }' \
  -F 'status="PAUSED"' \
  -F 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/ads
Limites
Existem limites de texto, tamanho da imagem, taxa de proporção da imagem e outros aspectos do criativo. Consulte o Guia de anúncios⁠.
Ler
Na API de Anúncios, é necessário solicitar de forma explícita todos os campos que você quer recuperar, exceto id. A referência de cada objeto tem uma seção sobre a leitura e informa quais campos são legíveis. Para o criativo, os campos legíveis são os mesmos que foram especificados quando você criou o objeto, além de id.
curl -G \
  -d 'fields=name,object_story_id' \
  -d 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/<CREATIVE_ID>
Posicionamentos
Um posicionamento é o local onde o Facebook exibe o anúncio, como o Feed no desktop, Feed em dispositivos móveis ou a coluna da direita. Consulte o Guia de anúncios do Facebook⁠.
Veicule anúncios em toda a gama de posicionamentos disponíveis. O leilão de anúncios do Facebook veicula impressões de anúncios no posicionamento que tem mais chances de gerar resultados de campanhas com o menor custo possível.
Para usar essa otimização, deixe este campo em branco. Você também pode selecionar posicionamentos específicos em uma target_spec do conjunto de anúncios.
Este exemplo tem um anúncio de post da Página. Os posicionamentos disponíveis são Feed do celular, Feed do desktop e coluna da direita do Facebook. Na API, consulte as opções de posicionamento. Se você escolher desktopfeed e rightcolumn como page_type, o anúncio será veiculado nos posicionamentos da coluna da direita e do Feed do desktop. Qualquer anúncio criado abaixo deste conjunto de anúncios tem apenas o posicionamento em desktop.
curl -X POST \
  -F 'name=Desktop Ad Set' \
  -F 'campaign_id=<CAMPAIGN_ID>' \
  -F 'daily_budget=10000' \
  -F 'targeting={
    "geo_locations": {"countries":["US"]},
    "publisher_platforms": ["facebook","audience_network"]
  }' \
  -F 'optimization_goal=LINK_CLICKS' \
  -F 'billing_event=IMPRESSIONS' \
  -F 'bid_amount=1000' \
  -F 'status=PAUSED' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/adsets
Ver prévia de um anúncio
Você pode fazer a prévia de um anúncio de duas formas: com a API de Prévia do Anúncio ou com o plugin de prévia do anúncio.
Há três formas de gerar uma prévia com a API:
Pela identificação do anúncio
Pela identificação do criativo do anúncio
Informando as especificações do criativo
De acordo com os documentos de referência da API de Prévia, a chamada mínima obrigatória será a seguinte:
curl -G \
  --data-urlencode 'creative="<CREATIVE_SPEC>"' \
  -d 'ad_format="<AD_FORMAT>"' \
  -d 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/generatepreviews
A especificação do criativo é uma matriz de cada campo e valor necessário para elaborar o criativo do anúncio.
A chamada do criativo do anúncio é semelhante a esta:
curl -X POST \
  -F 'name="Sample Promoted Post"' \
  -F 'object_story_id="<PAGE_ID>_<POST_ID>"' \
  -F 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/adcreatives
Use object_story_id na chamada da API de Prévia:
curl -G \
  -d 'creative={"object_story_id":"<PAGE_ID>_<POST_ID>"}' \
  -d 'ad_format=<AD_FORMAT>' \
  -d 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/generatepreviews
Os valores disponíveis para ad_format diferem um pouco de page_types. Nesse cenário, você seleciona o Feed do desktop e a coluna da direita do Facebook. Isso exige que você realize duas chamadas da API para gerar as prévias para cada posicionamento:
curl -G \
  -d 'creative={"object_story_id":"<PAGE_ID>_<POST_ID>"}' \
  -d 'ad_format=DESKTOP_FEED_STANDARD' \
  -d 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/generatepreviews
curl -G \
  -d 'creative={"object_story_id":"<PAGE_ID>_<POST_ID>"}' \
  -d 'ad_format=RIGHT_COLUMN_STANDARD' \
  -d 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/generatepreviews
A resposta será um iframe válido por 24 horas.
Ver mais
Criativo do anúncio
Anúncios de app no Facebook
Guia de anúncios⁠
Você achou esta página útil?