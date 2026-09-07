---
titulo: "Marketing API — estratégias de lance e orçamento"
url: https://developers.facebook.com/documentation/ads-commerce/marketing-api/bidding/overview
capturado_em: 2026-09-07
hash: 9b1f732d596f8e27
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Visão geral sobre lances
Updated: 28 de jun de 2026
Copiar para LLM
Ver como Markdown
Os anúncios no Status do WhatsApp são disponibilizados por meio da API de Marketing. Saiba mais sobre anúncios no Status do WhatsApp.
Um lance expressa o quanto você valoriza que seu anúncio alcance um público-alvo e forneça resultados na optimization_goal. O bid_amount é o valor que você deseja gastar para adquirir um determinado evento com base na optimization_goal, e a bid_strategy define como você quer controlar seus gastos em determinado evento com base na optimization_goal.
No leilão de anúncios do Facebook, o Facebook avalia bid_strategy, bid_amount e a probabilidade de cumprir optimization_goal para calcular um lance efetivo. Dessa forma, você só ganhará leilões e exibirá anúncios quando for possível atingir optimization_goal com certas restrições de lances, como custo por resultado.
A Meta consolidou as otimizações de alcance e impressões em uma única otimização.
Quando a otimização de alcance for selecionada na API, o valor de "Impressões" será retornado em optimization_goal com a configuração de controle de frequência do anunciante.
Os conceitos principais dos lances e da otimização incluem o seguinte:
Estratégias de lance: como você quer que os lances sejam feitos.
Metas de otimização: as metas que você quer atingir quando o Facebook veicular seus anúncios.
Orçamentos
Regularidade e programação: como seu orçamento de anúncios é gasto ao longo do tempo.
Otimização do orçamento da campanha: uma forma de otimizar a distribuição do orçamento nos conjuntos de anúncios da sua campanha.
Eventos de cobrança: os eventos pelos quais você quer pagar, como impressões, cliques ou ações diversas.
Configuração de lances
Ao escolher seu lance:
Defina bid_amount como o valor máximo que você está disposto a pagar pelo objetivo de publicidade.
Decida se a otimização será para retorno do investimento em publicidade ou para número de resultados.
Também é possível definir objective e billing_event, mas isso não afetará diretamente bid_amount ou seu lance efetivo. Se um bid_amount for definido, seu custo real por resultado geralmente será próximo a ou menor que bid_amount, dependendo das estratégias de lance.
Por exemplo, use essas configurações para gastar cerca de US$ 10,00 por 1.000 visualizações diárias exclusivas:
objective da campanha – APP_INSTALLS
optimization_goal do conjunto de anúncios – REACH
billing_event do conjunto de anúncios – IMPRESSIONS
Por outro lado, para gastar US$ 10,00 por instalação do app, use as seguintes configurações:
objective da campanha – APP_INSTALLS
optimization_goal do conjunto de anúncios – APP_INSTALLS
billing_event do conjunto de anúncios – IMPRESSIONS
Metas de otimização
Defina as metas de anúncios que você deseja atingir quando o Facebook veicular seus anúncios. O Facebook usa a optimization_goal do seu conjunto de anúncios para decidir quais pessoas receberão o anúncio. Por exemplo, para APP_INSTALLS, o Facebook veicula o anúncio às pessoas com maior probabilidade de instalar o app.
optimization_goal é uma meta associada ao seu objective por padrão. Por exemplo, se objective for APP_INSTALLS, optimization_goal será APP_INSTALLS por padrão.
Validação
Estes objetivos antigos ficaram obsoletos a partir do lançamento da versão 17.0 da API de Marketing. Consulte a tabela de mapeamento de experiências de anúncios orientados para resultados para conhecer os novos objetivos e seus tipos de destino, metas de otimização e objetos promovidos correspondentes.
Certas campanhas objectives são compatíveis apenas com determinados conjuntos de anúncios optimization_goal:
Objetivo da campanha	Padrão `optimization_goal`	Outra "optimization_goal" válida

APP_INSTALLS, promover um app de experiência instantânea
	
APP_INSTALLS
	
IMPRESSIONS, POST_ENGAGEMENT

APP_INSTALLS, promover um app para celular
	
APP_INSTALLS
	
OFFSITE_CONVERSIONS, LINK_CLICKS, REACH e VALUE

BRAND_AWARENESS
	
AD_RECALL_LIFT
	
REACH

CONVERSIONS
	
OFFSITE_CONVERSIONS
	
IMPRESSIONS, LINK_CLICKS, POST_ENGAGEMENT, REACH, VALUE, LANDING_PAGE_VIEWS e CONVERSATIONS

EVENT_RESPONSES, promover um evento
	
EVENT_RESPONSES
	
IMPRESSIONS e REACH

EVENT_RESPONSES, promover um post da Página
	
EVENT_RESPONSES
	
IMPRESSIONS, POST_ENGAGEMENT e REACH

LEAD_GENERATION
	
LEAD_GENERATION
	
QUALITY_LEAD, LINK_CLICKS e QUALITY_CALL

LINK_CLICKS
	
LINK_CLICKS
	
IMPRESSIONS, POST_ENGAGEMENT, REACH e LANDING_PAGE_VIEWS

LINK_CLICKS, promover um app de experiências instantâneas
	
ENGAGED_USERS
	
APP_INSTALLS, IMPRESSIONS, POST_ENGAGEMENT e REACH

LINK_CLICKS, promover um app para celular
	
LINK_CLICKS
	
IMPRESSIONS, REACH e OFFSITE_CONVERSIONS

MESSAGES
	
CONVERSATIONS
	
IMPRESSIONS, POST_ENGAGEMENT, LEAD_GENERATION e LINK_CLICKS

PAGE_LIKES
	
PAGE_LIKES
	
IMPRESSIONS, POST_ENGAGEMENT e REACH

POST_ENGAGEMENT
	
POST_ENGAGEMENT
	
IMPRESSIONS, REACH e LINK_CLICKS

PRODUCT_CATALOG_SALES
	
OFFSITE_CONVERSIONS ou LINK_CLICKS
	
IMPRESSIONS, POST_ENGAGEMENT, REACH, CONVERSATIONS e VALUE

REACH
	
REACH
	
IMPRESSIONS

VIDEO_VIEWS
	
THRUPLAY
	
Perguntas frequentes
As respostas a seguir abordam questões comuns sobre lances e metas de otimização.
Quais eventos são abrangidos por "POST_ENGAGEMENT"?
A maioria das ações em um anúncio, incluindo cliques no link, instalações do aplicativo, visualizações do vídeo durante um período determinado, marcações de foto, curtidas, comentários, compartilhamentos e muito mais.
Você achou esta página útil?