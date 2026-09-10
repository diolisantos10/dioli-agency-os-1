---
titulo: "Marketing API — mudanças fora de ciclo em 2026 (out-of-cycle changes)"
url: https://developers.facebook.com/documentation/ads-commerce/marketing-api/out-of-cycle-changes/occ-2026
capturado_em: 2026-09-10
hash: b38079bd684420d8
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Alterações fora de ciclo de 2026
Updated: 11 de ago de 2026
Copiar para LLM
Ver como Markdown
Os anúncios no Status do WhatsApp são disponibilizados por meio da API de Marketing. Saiba mais sobre anúncios no Status do WhatsApp.
Alterações fora de ciclo da API de Marketing em 2026.
13 de agosto de 2026
Mensagens de marketing do WhatsApp
Aplicável a todas as versões.
As mensagens de marketing no WhatsApp agora estão disponíveis na API de Marketing.
Consulte Mensagens de marketing para saber mais.
Os seguintes pontos de extremidade serão afetados:
GET /act_{ad-account-id}
POST /act_{ad-account-id}/adsets
POST /act_{ad-account-id}/adcreatives
GET /{ad-object-id}/insights
20 de julho de 2026
Otimização para visitas ao perfil
Aplicável a todas as versões.
Agora é possível criar anúncios que otimizam para visitas ao perfil do Instagram e à Página do Facebook por meio da API de Marketing. Defina o conjunto de anúncios optimization_goal como PROFILE_VISIT ou PROFILE_AND_PAGE_ENGAGEMENT e defina destination_type como INSTAGRAM_PROFILE, FACEBOOK_PAGE ou INSTAGRAM_PROFILE_AND_FACEBOOK_PAGE.
Para um único destino, defina o criativo do anúncio call_to_action_type para corresponder ao conjunto de anúncios destination_type: VIEW_INSTAGRAM_PROFILE para INSTAGRAM_PROFILE ou VISIT_PROFILE para FACEBOOK_PAGE.
Para anúncios que direcionam para um perfil do Instagram e uma página do Facebook (destination_type = INSTAGRAM_PROFILE_AND_FACEBOOK_PAGE), forneça uma asset_feed_spec no criativo do anúncio com optimization_type definido como UNIFIED_PROFILE_VISIT_DESTINATION e duas entradas em call_to_actions: VIEW_INSTAGRAM_PROFILE (Instagram) e VISIT_PROFILE (Facebook).
Consulte Anúncios de visita ao perfil para obter mais informações.
Os seguintes pontos de extremidade serão afetados:
POST /act_{ad-account-id}/adsets
POST /act_{ad-account-id}/adcreatives
POST /act_{ad-account-id}/ads
28 de junho de 2026
Criativo Advantage+: animação de imagem
Aplicável a todas as versões.
A animação de imagens já está disponível como um aprimoramento do criativo Advantage+ por meio da API de Marketing. Quando essa opção está habilitada, uma imagem estática no seu anúncio é automaticamente transformada em um vídeo curto e sutilmente animado para tornar o criativo mais envolvente. Ative ou desative esse recurso por criativo usando o campo image_animation em degrees_of_freedom_spec.creative_features_spec.
Consulte Introdução ao criativo Advantage+ para obter mais informações.
Os seguintes pontos de extremidade serão afetados:
POST /act_{ad-account-id}/adcreatives
POST /act_{ad-account-id}/ads
Criativo Advantage+: filtro de vídeo
Aplicável a todas as versões.
Agora, o filtro de vídeo está disponível como um aprimoramento do criativo Advantage+ por meio da API de Marketing. Quando essa opção é habilitada, um aprimoramento visual é aplicado automaticamente ao criativo do vídeo para torná-lo mais atrativo. Por exemplo, melhorar a cor ou converter um vídeo padrão em alta faixa dinâmica (HDR, pelas iniciais em inglês). Ative ou desative esse recurso por criativo usando o campo video_filtering em degrees_of_freedom_spec.creative_features_spec.
Consulte Introdução ao criativo Advantage+ para obter mais informações.
Os seguintes pontos de extremidade serão afetados:
POST /act_{ad-account-id}/adcreatives
POST /act_{ad-account-id}/ads
Criativo Advantage+: reversão do corte de vídeo
Aplicável a todas as versões.
A reversão do corte de vídeo agora está disponível como um aprimoramento do criativo Advantage+ por meio da API de Marketing. Quando essa opção estiver habilitada, seu vídeo será expandido automaticamente (sem cortes) para se ajustar melhor à taxa de proporção de posicionamentos adicionais. Por exemplo, preenchendo superfícies verticais em tela cheia em vez de cortar ou colocar faixas pretas no vídeo. Ative ou desative esse recurso por criativo usando o campo video_uncrop em degrees_of_freedom_spec.creative_features_spec.
Consulte Introdução ao criativo Advantage+ para obter mais informações.
Os seguintes pontos de extremidade serão afetados:
POST /act_{ad-account-id}/adcreatives
POST /act_{ad-account-id}/ads
22 de junho de 2026
Como mudar de DMAs da Nielsen para Comscore Markets
Aplicável a todas as versões.
A partir de 22 de junho de 2026, as Designated Market Areas (DMAs) da Nielsen serão substituídas pelos Comscore Markets em soluções de direcionamento e relatórios de anúncios. Ao solicitar dados no nível do mercado via API de Insights sobre Anúncios, breakdowns=dma não será mais compatível. Para recuperar dados no nível do mercado, use breakdowns=comscore_market.
Para obter mais informações sobre os Comscore Markets, acesse a Central de Ajuda⁠.
Os seguintes pontos de extremidade serão afetados:
GET /{ad-object-id}/insights
POST /{ad-object-id}/insights
11 de junho de 2026
Marketplace de Criadores de Conteúdo
Aplicável a todas as versões.
A API do Marketplace de Criadores de Conteúdo agora inclui vários novos recursos para descobrir e avaliar criadores de conteúdo:
Filtragem expandida: novos filtros de contagem de seguidores (100 mil – 250 mil, 250 mil – 1 milhão e mais de 1 milhão) e filtragem em nível de estado dos EUA agora estão disponíveis para criadores de conteúdo e públicos.
Recomendações personalizadas de criadores de conteúdo: um novo recommendation_typefiltro retorna conjuntos selecionados de criadores de conteúdo com base em critérios específicos: mais relevante para mim, alto desempenho do anúncio, maior experiência com anúncios, marcas semelhantes e público semelhante.
Selos de criador de conteúdo: um novo campo badges está disponível ao consultar o perfil do criador de conteúdo.
URL de miniatura: um novo campo thumbnail_url está disponível ao consultar a mídia do criador de conteúdo.
Integração com o Gerenciador de Anúncios: agora você pode descobrir criadores de conteúdo cujos seguidores correspondem a um público personalizado ou semelhante salvo no Gerenciador de Anúncios. Para isso, pesquise os públicos salvos pelo nome ou identificação do público. As agências passam a identificação da própria empresa por meio do parâmetro acting_business_id para usar os públicos de um cliente.
Consulte API do Marketplace de Criadores de Conteúdo para mais informações.
1º de junho de 2026
Troca de áudio do Instagram para anúncios no Reels
Aplicável a todas as versões.
Novos parâmetros em POST /act_{id}/advideos para substituir música protegida por direitos autorais no Instagram Reels por áudio isento de royalties da Coleção de Sons da Meta. Passe source_instagram_media_id com selected_audio_spec para criar um ativo de vídeo do anúncio com áudio trocado.
Novos campos replace_audio_status e selected_audio_spec em GET /{ad-video-id} para sondar a conclusão da troca de áudio assíncrona. Verifique replace_audio_status até que ela retorne SUCCESSFUL antes de usar o vídeo trocado na criação do criativo do anúncio.
Os seguintes pontos de extremidade serão afetados:
POST /act_{id}/advideos
GET /{ad-video-id}
8 de maio de 2026
API de Insights sobre Anúncios – Alterações na disponibilidade de detalhamento
Aplicável a todas as versões da API a partir de 6 de agosto de 2026.
A partir de 6 de agosto de 2026, os detalhamentos a seguir da API de Insights sobre Anúncios exigirão habilitação para determinadas contas de anúncios:
breakdowns=impression_device (incluindo qualquer combinação que contenha impression_device)
breakdowns=hourly_stats_aggregated_by_audience_time_zone
breakdowns=frequency_value
O que está mudando
As solicitações de API que usam esses detalhamentos podem não retornar resultados para contas de anúncios que não os habilitaram, seja de forma síncrona ou assíncrona.
Como manter o acesso
Caminho	Detalhes

Habilitar via Gerenciador de Anúncios
	
Os administradores de contas podem solicitar acesso a esses detalhamentos diretamente no Gerenciador de Anúncios. Depois que a opção for habilitada, as chamadas de API síncronas continuarão funcionando como esperado a partir desse dia.

Use trabalhos assíncronos da API
	
Depois da habilitação, os trabalhos assíncronos de relatórios retornam o histórico completo. Os trabalhos assíncronos estão sujeitos à cota de limitação padrão: min(10, number_of_ad_groups) per 24 hours.
Ação recomendada
Caso seu app dependa de um dos detalhamentos listados acima, atualize sua integração para (a) lidar com as situações em que as solicitações não retornam resultados, (b) solicitar que os anunciantes afetados habilitem o detalhamento por meio do Gerenciador de Anúncios e (c) usar trabalhos de relatórios assíncronos para recuperar dados históricos depois de habilitar o recurso.
Caso tenha dúvidas, consulte a documentação sobre os detalhamentos da API de Insights sobre Anúncios ou acesse o suporte ao desenvolvedor.
4 de maio de 2026
Recomendações de desempenho
Aplicável a todas as versões.
O campo lift_estimate no objeto recommendation agora incorpora uma nova fonte de dados para fornecer insights personalizados sobre campanhas qualificadas. Essa mudança se aplica a um subconjunto de campanhas em que a nova fonte de dados está disponível. As campanhas sem cobertura continuarão a retornar os valores existentes. Nenhuma ação é necessária por parte dos desenvolvedores.
Consulte Recomendações de desempenho para obter mais informações.
30 de abril de 2026
Adicionar rótulos de público a públicos personalizados de arquivos de clientes, públicos personalizados de sites e públicos personalizados de apps para celular
Aplicável a todas as versões.
Adicionamos um novo campo audience_labels a Públicos Personalizados do arquivo do cliente, Públicos Personalizados do site e Públicos Personalizados do app para celular. Os rótulos categorizam os públicos (por exemplo, HIGH_VALUE_CUSTOMERS, QUALIFIED_LEADS) para que eles possam ser encontrados e usados de modo mais eficaz nos seus anúncios.
Os seguintes pontos de extremidade serão afetados:
POST /{ad-account-id}/customaudiences
21 de abril de 2026
Anúncios no Threads
As contas do Threads associadas a uma Página agora estão disponíveis para criar anúncios do Threads. Consulte Contas do Threads associadas à Páginas para saber mais.
Posts existentes do Facebook e do Instagram podem ser promovidos para criar anúncios no Threads. Consulte Como promover posts existentes como anúncios do Threads para saber mais.
30 de março de 2026
Anúncios em parceria
Permissões no nível da conta
Aplicável a todas as versões.
O ponto de extremidade /{business-account-id}/branded_content_ad_permissions agora é compatível com a filtragem por creator_username, permitindo que você pesquise e recupere permissões de anúncio para um criador de conteúdo específico. Consulte Permissões no nível da conta para saber mais.
Códigos de anúncio
Aplicável a todas as versões.
Agora, os criadores de conteúdo podem gerar códigos de anúncios em parceria por meio da API, habilitando fluxos de trabalho automatizados para autorização de conteúdo de marca sem exigir etapas manuais no app do Instagram. Consulte Códigos de anúncios para saber mais.
25 de março de 2026
Anúncios no Threads
Agora você pode visualizar, ocultar e responder a respostas nos seus anúncios do Threads. Consulte Moderação de respostas para mais informações.
17 de fevereiro de 2026
Anúncios no Threads
Os anúncios de app já estão disponíveis para o Threads. Consulte Anúncios no app do Threads para saber mais.
Você achou esta página útil?