---
titulo: "Google Ads API — campanhas (estrutura e tipos)"
url: https://developers.google.com/google-ads/api/docs/campaigns/overview?hl=pt-br
capturado_em: 2026-09-09
hash: facfdccfeb15ea98
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Campanhas

Uma campanha do Google Ads é um conjunto de um ou mais grupos de anúncios (anúncios, palavras-chave e lances) que compartilham um orçamento, uma segmentação por local e outras configurações. As campanhas são geralmente usadas para organizar categorias de produtos ou serviços que você oferece. Elas são a ferramenta de organização de nível superior na sua conta do Google Ads.

Os itens que podem ser definidos no nível da campanha incluem lances, orçamento, idioma, local, distribuição para a Rede do Google e muito mais. Grandes anunciantes geralmente criam campanhas de anúncios separadas para exibir anúncios em locais diferentes ou com orçamentos diferentes.

Recomendamos o uso das nossas bibliotecas de cliente, mas você também pode modificar campanhas com o endpoint REST.

Tipos de campanha

No Google Ads, pense nesses conceitos em uma hierarquia:

Tipo de campanha: sua escolha principal. O projeto de toda a campanha.
Redes de publicidade: os lugares em que seus anúncios podem ser veiculados, determinados em grande parte pelo tipo de campanha.
Controles de rede/canal: as configurações específicas que você pode usar para ajustar onde seus anúncios aparecem nessas redes. É aqui que as coisas ficam mais complexas, já que a ferramenta usada depende do tipo de campanha.
Comece com o tipo de campanha (o "o quê" e "como")

O tipo de campanha é a base dos seus esforços de publicidade. É a primeira decisão que você toma e dita todo o resto, incluindo:

Que tipo de anúncios você pode criar (por exemplo, anúncios de texto, banners de imagem, anúncios em vídeo).
Quais recursos e estratégias de lances estão disponíveis.

Exemplos de tipos de campanha incluem Pesquisa, Display, Performance Max e Geração de demanda.

Cada campanha segmenta um tipo, conhecido na API como o AdvertisingChannelType campo. Esse campo está no Campaign objeto.

A API é compatível com os seguintes tipos de campanha:

Apenas na Rede de Display
Apenas na rede de pesquisa
Inclusão da Rede de Display nas campanhas de pesquisa
Campanhas para apps
Somente chamadas
Geração de demanda
Performance Max
Campanhas do Shopping
Serviços locais
Entenda as redes (o "onde")

As redes de publicidade são coleções de sites, apps e propriedades em que seus anúncios podem ser mostrados. As principais são:

Rede de pesquisa do Google:pesquisa Google, Google Maps e sites de parceiros de pesquisa.
Rede de Display do Google:milhões de sites de terceiros, sites de notícias, blogs e Serviços do Google, como o Gmail e o YouTube, que mostram anúncios gráficos.
Rede do YouTube:o próprio YouTube, incluindo o feed da página inicial, os resultados da pesquisa, os vídeos e os Shorts.

Cada tipo de campanha foi projetado para veicular anúncios em redes específicas. Por exemplo, uma campanha de pesquisa é criada principalmente para a rede de pesquisa.

Controlar os canais (a parte complexa)

A maneira como você controla quais redes sua campanha usa varia significativamente de acordo com o tipo de campanha escolhido. Confira o detalhamento:

Exemplo de tipo de campanha	Como você controla onde os anúncios são mostrados	Explicação
Pesquisa	Usa NetworkSettings	Esse é o modelo "clássico". Você pode usar o campo NetworkSettings para incluir ou excluir explicitamente os parceiros de pesquisa do Google e a Rede de Display do Google da sua campanha de pesquisa.
Performance Max (PMax)	Sem controle manual	A PMax foi projetada para alcance e automação máximos. Ela veicula automaticamente seus anúncios em todas as redes do Google (por exemplo, pesquisa, display e YouTube) para encontrar conversões. Não é possível desativar redes específicas.
Geração de demanda	Usa "Controles de canais"	Esse tipo de campanha mais recente usa o próprio sistema. Em vez de configurações de "rede" amplas, você recebe controles de "canal" mais específicos que permitem ativar ou desativar partes específicas das redes.
Em resumo: uma analogia

Pense nisso como escolher um veículo:

Tipo de campanha = o veículo que você compra. (por exemplo, um carro urbano, um caminhão off-road ou um ônibus autônomo de alta tecnologia).
Redes = o terreno para o qual o veículo foi projetado. (por exemplo, estradas urbanas pavimentadas, trilhas de montanha acidentadas ou tudo isso).
Controles de rede/canal = os recursos específicos que você pode ajustar.
Uma campanha de pesquisa (carro urbano) permite usar NetworkSettings para escolher se você também quer dirigir em "estradas suburbanas" (parceiros de pesquisa).
Uma campanha Performance Max (ônibus autônomo) processa toda a navegação automaticamente para chegar ao destino. Você não toca no volante.
Uma campanha Geração de demanda (caminhão off-road) tem controles especiais, como "tração nas quatro rodas" ou "controle de descida" (ChannelControls) para lidar com tipos específicos de terreno no ambiente off-road.
Diferenças em relação à interface do Google Ads

A API Google Ads tem limitações para gerenciar campanhas legadas e de vídeo.

Para campanhas de vídeo, você pode usar a API Google Ads para ler dados. É possível extrair relatórios de performance (cliques, visualizações, custo) de todas as campanhas de vídeo usando a API Google Ads.

Para alguns tipos específicos de campanha de vídeo, não é possível gravar mudanças com a API Google Ads. Não é possível usar a API para fazer mudanças como pausar, ativar, mudar a segmentação ou adicionar novos anúncios. Essas campanhas precisam ser editadas na interface da Web do Google Ads.

Prática recomendada: para criar e gerenciar anúncios em vídeo no YouTube usando a API, use campanhas Performance Max ou Geração de demanda. Elas têm suporte total para relatórios e gerenciamento.

O objetivo da interface do Google Ads ("Vendas", "Leads") é um assistente de configuração. Ele pede sua meta e, em seguida, sugere e preenche automaticamente as melhores configurações para você, como o tipo de campanha, a estratégia de lances e muito mais.

A API Google Ads oferece os blocos de construção brutos para campanhas. Não há um único campo "objetivo" porque a API pressupõe que você quer controle total. Você atinge seu objetivo montando os blocos de construção certos.

Por exemplo, para criar uma campanha de "Vendas" com a API, não há um campo para definir um objective = 'SALES'. Em vez disso, você a cria combinando as configurações certas:

Escolha um tipo de campanha: defina advertising_channel_type = "SEARCH" ou "PERFORMANCE_MAX".

Escolha uma estratégia de lances: defina campaign_bidding_strategy = "MAXIMIZE_CONVERSION_VALUE" com um campo target_roas definido.

Defina metas de conversão: diga à campanha para otimizar especificamente as ações de conversão de "Compra" .

Outra dúvida comum é como representar tipos de campanha na API. Os tipos de campanha são representados na API pelo AdvertisingChannelType campo. Defina o AdvertisingChannelType para cada campanha. Em seguida, confira os guias de integração da campanha específica que você está criando (como "PMax para viagens" ou "Geração de demanda") para saber se ela também exige que você defina o AdvertisingChannelSubType.

Uma tabela útil:

Se você quiser criar esta campanha...	Defina AdvertisingChannelType como...	E defina AdvertisingChannelSubType como...
Uma campanha padrão de pesquisa	PESQUISAR	(Não defina / Deixe em branco)
Uma campanha padrão de display	DISPLAY	(Não defina / Deixe em branco)
Uma campanha padrão Performance Max	PERFORMANCE_MAX	(Não defina / Deixe em branco)
Uma campanha Performance Max para metas de turismo	PERFORMANCE_MAX	TRAVEL_GOALS
Uma campanha Geração de demanda	DEMAND_GEN	(Não defina / Deixe em branco)
Subtipos de campanha

Subtipos de campanha na interface do Google Ads, como Padrão e Todos os recursos, ajudam os usuários da interface a encontrar opções de campanha relevantes, mas não há um atributo correspondente no objeto Campaign da API.

Essa coluna da interface é semelhante aos AdvertisingChannelType e AdvertisingChannelSubType campos na API, mas não há um mapeamento individual entre esses campos e o subtipo de campanha na interface.

Por exemplo, uma campanha somente de pesquisa criada usando a API sempre será uma campanha Todos os recursos da perspectiva da interface.

Orçamento da campanha, estratégias de lances e segmentação

Na API Google Ads, gerenciar uma campanha significa responder a três perguntas fundamentais que controlam como e onde seus anúncios aparecem:

Quanto posso gastar? (Orçamento da campanha)

Esse é o limite financeiro da sua campanha. Na API, você cria um objeto CampaignBudget separado com um limite de gastos diários (em micros) e anexa o nome do recurso à sua campanha. Um único orçamento pode ser compartilhado entre várias campanhas.

Como o Google deve gastar meu dinheiro? (Estratégia de lances)

Esse é o "cérebro" estratégico da sua campanha. Ele informa ao Google qual é sua meta principal. Você escolhe uma estratégia de lances com base no que quer alcançar:
Para tráfego: use MaximizeClicks.
Para leads/inscrições: use MaximizeConversions com um TargetCpa.
Para vendas de comércio eletrônico: use MaximizeConversionValue com um TargetRoas.

Quem deve ver meus anúncios? (Público-alvo)

É aqui que você define seu mercado. Adicione CampaignCriterion ou AdGroupCriterion objetos para restringir seu alcance às pessoas certas. A segmentação pode ser baseada em:
Palavras-chave: o que os usuários estão pesquisando.
Locais: onde os usuários estão.
Informações demográficas: idade, gênero etc.
Públicos-alvo: comportamento anterior (por exemplo, visitantes do site) ou interesses.
Como pensar em campanhas

Ao gerenciar ou criar campanhas com a API Google Ads, é útil entender a estrutura e os modelos subjacentes que regem como as campanhas, os anúncios e os recursos são organizados e veiculados. Há três modelos principais a serem considerados: o modelo de grupo de anúncios e anúncios, o modelo de grupo de recursos e recursos e um modelo híbrido de grupos de anúncios e anúncios com recursos. Esses modelos dependem do tipo de AdvertisingChannelType escolhido.

Estruturas de campanha da API Google Ads
Estrutura	Exemplo de uso (AdvertisingChannelType)	Como funciona	Conceito principal
Estrutura do grupo de anúncios	SEARCH, DISPLAY padrão	A campanha é organizada em grupos de anúncios. Cada grupo de anúncios contém um conjunto de anúncios finalizados e um conjunto de critérios de segmentação (por exemplo, palavras-chave, públicos-alvo).	O link entre anúncios criados manualmente e a segmentação deles é controlado de perto no grupo de anúncios.
Estrutura dos grupos de recursos	PERFORMANCE_MAX	Em vez de grupos de anúncios, você cria grupos de recursos. Cada grupo de recursos contém um conjunto de recursos criativos brutos (títulos, imagens etc.) e indicadores de público-alvo.	Você fornece os componentes criativos, e a IA do Google monta os anúncios finais em tempo real para otimizá-los em diferentes canais.
Estrutura híbrida	DEMAND_GEN, DISPLAY	Isso envolve uma estrutura de grupo de anúncios padrão com recursos modernos (antigas extensões, como sitelinks ou frases de destaque) vinculados no nível da campanha ou do grupo de anúncios.	O anúncio principal é criado manualmente, mas você fornece recursos extras e intercambiáveis para o Google mostrar junto a ele para melhorar a performance.
Avançar
Criar campanhas
Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-08-03 UTC.