---
titulo: "Google Analytics — modo de consentimento (sites e apps)"
url: https://support.google.com/analytics/answer/9976101?hl=pt-BR
capturado_em: 2026-09-10
hash: fdf0a314df7d536b
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Modo de consentimento em sites e apps para dispositivos móveis
Este artigo foi escrito para proprietários de sites ou apps que utilizam um banner ou widget de consentimento para o uso de cookies ou outra solução de gestão de consentimento.

Com o modo de consentimento, você informa ao Google o status de consentimento do identificador do app ou do cookie dos seus usuários. As tags ajustam o comportamento e respeitam as escolhas dos usuários.

O modo de consentimento interage com sua plataforma de gestão de consentimento (CMP) ou ferramenta de implementação personalizada para obter a permissão do visitante, como um banner de consentimento de cookies. O modo de consentimento recebe as opções de consentimento dos usuários no banner ou widget de cookie e adapta de forma dinâmica o comportamento das tags do Google Ads, do Analytics e de terceiros que criam ou leem os cookies.

Quando as pessoas negam o consentimento, as tags enviam pings ao Google em vez de armazenar cookies. Se você usa o GA4, o Google preenche as lacunas na coleta de dados com a estimativa de conversão e a modelagem comportamental.

O modo de consentimento não implementa banners ou widgets. Apenas interage com eles. Saiba mais em Gerenciar o consentimento do usuário.

Tags com suporte integrado para o modo de consentimento

As tags do Google para os seguintes produtos contêm e verificações de consentimento integradas e ajustam o comportamento com base no estado de consentimento:

Google Analytics
Google Ads*
Floodlight
Vinculador de conversões

* Inclui o acompanhamento de conversões e o remarketing do Google Ads. O suporte para conversões de chamada está pendente.

Se você criar tags sem verificações de consentimento integradas, é possível adicionar verificações no Gerenciador de tags. Use a configuração de tag Avançado > Configurações de consentimento. Saiba mais
Estado de consentimento e comportamento das tags

Quando você ativa o modo de consentimento, os produtos de medição do Google preservam o estado do modo de consentimento dos visitantes nas páginas acessadas. Se o consentimento for negado, as tags disparadas não vão armazenar cookies. Em vez disso, elas comunicam o mínimo de informações sobre a atividade do usuário. O estado de consentimento e a atividade do usuário são reportados pelo envio dos seguintes pings ou indicadores sem cookies ao servidor do Google:

Pings de estado de consentimento para tags do Google Ads e do Floodlight: comunicam o estado de consentimento padrão que você configurou e o estado atualizado quando o visitante dá ou nega o consentimento para cada tipo de consentimento, como ad_storage e analytics_storage. Esses pings são enviados das páginas visitadas pelo usuário com o modo de consentimento ativado e são acionados para algumas tags quando o estado de consentimento muda de "denied" para "granted". Por exemplo, quando um visitante marca uma caixa de diálogo de consentimento.
Pings de eventos principais: indicam que um evento principal ocorreu.
Pings do Google Analytics: são enviados de cada página de um site onde o Google Analytics é implementado no carregamento e quando os eventos são registrados.

Os pings descritos acima podem incluir:

Informações funcionais (como cabeçalhos adicionados passivamente pelo navegador):
Carimbo de data/hora
User agent (somente Web)
Referenciador
Informações gerais:
Uma indicação de que a página atual ou uma anterior na navegação do usuário pelo site incluiu ou não informações de cliques no anúncio no URL (por exemplo, GCLID / DCLID)
Informações booleanas sobre o estado de consentimento
Número aleatório gerado em cada carregamento de página
Informações sobre a plataforma de consentimento usada pelo proprietário do site (por exemplo, ID do desenvolvedor)
Comportamento do modo de consentimento

Além disso, os pings de eventos principais e de consentimento podem apresentar os comportamentos abaixo, dependendo do estado das configurações e das suas tags.

Os comportamentos padrão consideram todas as opções de consentimento como "granted":

ad_storage='granted' e analytics_storage='granted'

Web

	

Apps para dispositivos móveis

Cookies relacionados à publicidade podem ser lidos e gravados.
Os endereços IP são coletados.
O URL completo da página é coletado, incluindo informações de cliques no anúncio nos parâmetros de URL (por exemplo, GCLID / DCLID).
Cookies da Web de terceiros definidos anteriormente em google.com e doubleclick.net podem ser acessados, além de cookies primários de eventos principais (por exemplo, _gcl_*).
	
Identificadores de publicidade podem ser coletados (por exemplo, ID de publicidade/IDFA).
O ID da instância do app gerado pelo SDK do Google Analytics para Firebase é coletado.

Quando uma ou mais formas de consentimento não são concedidas, há outros comportamentos a serem considerados:

ad_storage='denied'

Web

	

Apps para dispositivos móveis

Não é possível gravar nenhum cookie novo relacionado à publicidade.
Não é possível ler nenhum cookie de publicidade próprio atual.
As solicitações são feitas por outro domínio para evitar que cookies de terceiros definidos anteriormente sejam enviados nos cabeçalhos das solicitações.
O Analytics não lê nem grava cookies do Google Ads, e os recursos dos Indicadores do Google não acumulam dados para esse tráfego.
O URL completo da página é coletado e pode incluir informações de cliques no anúncio nos parâmetros de URL (por exemplo, GCLID / DCLID). As informações de cliques no anúncio são usadas apenas para fazer uma medição aproximada do tráfego.
Os endereços IP são usados para conferir o país do IP, mas nunca são registrados pelos sistemas do Google Ads e do Floodlight. Eles são excluídos imediatamente após a informação ser recebida. Observação: o Google Analytics coleta endereços IP como parte das comunicações normais na Internet. Saiba mais sobre a atribuição de máscaras de IP no Google Analytics.
	
Nenhum ID de publicidade ou IDFA pode ser coletado.
Os recursos dos indicadores do Google não vão acumular dados sobre esse tráfego.
Os endereços IP são usados para conferir o país do IP, mas nunca são registrados pelos sistemas do Google Ads e do Floodlight. Eles são excluídos imediatamente após a informação ser recebida. Observação: o Google Analytics coleta endereços IP como parte das comunicações normais na Internet. Saiba mais sobre a atribuição de máscaras de IP no Google Analytics.

ad_storage='denied' e ads_data_redaction='true'

Web

Não é possível gravar nenhum cookie novo relacionado à publicidade.
Não é possível ler nenhum cookie de publicidade atual.
As solicitações são feitas por outro domínio para evitar que cookies de terceiros definidos anteriormente sejam enviados nos cabeçalhos das solicitações.
O Analytics não lê nem grava cookies do Google Ads, e os recursos dos Indicadores do Google não acumulam dados para esse tráfego.
No Google Analytics, o URL completo da página é coletado e pode incluir informações sobre cliques no anúncio nos parâmetros de URL (por exemplo, GCLID / DCLID). As informações de cliques no anúncio são usadas apenas para fazer uma medição aproximada do tráfego. No Google Ads, os identificadores de cliques no anúncio (por exemplo, GCLID / DCLID) em pings de eventos principais e de consentimento são encobertos.
Os endereços IP são usados para conferir o país do IP, mas nunca são registrados pelos sistemas do Google Ads e do Floodlight. Eles são excluídos imediatamente após a informação ser recebida. Observação: o Google Analytics coleta endereços IP como parte das comunicações normais na Internet. Saiba mais sobre a atribuição de máscaras de IP no Google Analytics.

analytics_storage='denied'

Web

	

Apps para dispositivos móveis

Não há leitura nem gravação de cookies primários do Analytics.
Na implementação do modo de consentimento avançado, os pings sem cookies são enviados ao Google Analytics para medição futura. O Google Analytics 4 usa pings sem cookies para calcular a estimativa.
	
Nenhum IDFA pode ser coletado.
Os eventos sem identificadores de dispositivos ou usuários são enviados ao Google Analytics para medição futura. O Google Analytics 4 usa esses eventos para calcular estimativas.

Aplicativos da Web/para dispositivos móveis

Quando ocorre analytics_storage='denied', os pings sem cookies são enviados ao Google Analytics. Nenhum cookie do Google Analytics é definido, acessado ou lido no dispositivo. Consequentemente, os pings sem cookies são eventos do Google Analytics que contêm dimensões gerais que não podem identificar diretamente um indivíduo.

Os pings sem cookies, como parte da comunicação HTTP/navegador regular, podem incluir as seguintes informações: user agent, resolução da tela, endereço IP. O Google Analytics 4 não armazena nem registra endereços IP.

Se um anunciante definir outros campos, como user_id e dimensões personalizadas, eles serão enviados normalmente. Os dados coletados no ping sem cookies são usados para modelagem comportamental e estimativa de conversão, buscando preencher as lacunas nos dados.

Práticas recomendadas para o modo de consentimento

Independente de como você ativa o modo de consentimento, siga estas práticas recomendadas:

Defina um estado de consentimento inicial com os valores padrão determinados pela organização. O estado de consentimento padrão é aplicado na primeira vez que alguém acessa uma página no seu site.
Implemente para que as tags da página sejam carregadas antes de a caixa de diálogo de consentimento aparecer.
Carregue as tags do Google em todos os casos, não apenas com o consentimento do usuário. Se o consentimento for negado, o Google vai receber pings sem cookies. Nas propriedades do Google Analytics 4, os pings sem cookies permitem que a modelagem comportamental e a estimativa de conversão preencham as lacunas nos seus dados.
As opções de consentimento precisam ser mostradas ao visitante assim que possível. Atualize o estado de consentimento assim que a pessoa fizer a escolha.
As pessoas podem negar ou autorizar cada tipo de armazenamento usado pelas tags em um site. Por exemplo, ela pode autorizar os cookies de análise e negar os de publicidade.
Cada região tem suas próprias leis de privacidade. Por isso, configure um estado padrão para implementar em determinadas regiões, e não para todos os visitantes. Se a sua organização exigir que o estado padrão seja "negado", aplicar "negado" apenas aos visitantes da região apropriada garante que todas as outras regiões continuem com uma medição precisa.
Quando você define um estado padrão para uma região, seu mecanismo para solicitar o consentimento, seja personalizado ou uma CMP, precisa dar aos visitantes dessas regiões a opção de atualizar o estado de consentimento.
Implementação avançada x básica

Se implementar o modo de consentimento bloqueando as tags do Google até que a caixa de diálogo de consentimento apareça e as pessoas autorizem, você vai deixar de usar todos os benefícios do modo. Por exemplo, você não vai receber dados estimados na sua propriedade do GA4 para preencher as lacunas dos dados observados que faltarem quando os usuários recusarem o consentimento. Se você bloquear (implementação básica) ou desbloquear as tags (implementação avançada), as tags do Google vão ajustar o comportamento com base no estado de consentimento dos usuários. Saiba mais sobre os modos de consentimento básico e avançado.

Confira abaixo as diferenças entre as implementações avançada e básica no modo de consentimento:

 	Implementação avançada	Implementação básica
Comportamento da tag	
As tags do Google são carregadas antes de mostrar a caixa de diálogo de consentimento
As tags enviam pings sem cookies quando o consentimento para o uso de cookies é recusado
	
As tags do Google ficam bloqueadas até que o consentimento seja dado

Modelagem comportamental no GA4	

	 
Estimativa de conversão no GA4	

	

*

Estimativa de conversão no Google Ads	

	

*

* Quando as tags são bloqueadas devido às escolhas de consentimento, nenhum dado é coletado, e a estimativa de conversão no Google Ads toma como base um modelo geral. Os modelos usam recursos como tipo de navegador, tipo de ação de evento principal, hora do dia e outras variáveis de alto nível e sem identificação. Saiba mais sobre o modo de consentimento e a estimativa de conversão do Google Ads.

O Transparency & Consent Framework (TCF) do IAB Europe é uma forma alternativa de conseguir e acompanhar o estado de consentimento. Quando alguém nega o consentimento com uma solução que usa o TCF, as propriedades do GA4 não podem modelar dados para preencher as informações que ficam faltando.
Como ativar o modo de consentimento

A ativação do modo de consentimento em sites e apps acontece de maneira diferente. Isso também depende da implementação que você fez para obter o consentimento e da plataforma de inclusão de tags que usa.

Ativar o modo de consentimento para sites

Use o Gerenciador de tags e uma CMP com um modelo de comunidade para ativar o modo de consentimento em sites utilizando o mínimo de programação possível. Os parceiros da CMP fornecem modelos e instruções do Gerenciador de tags para ativar o modo de consentimento com a integração:

Integrações da plataforma de gestão de consentimento

Os desenvolvedores de sites podem ativar o modo de consentimento usando comandos de consentimento da gtag.js ou uma tag criada com base em um modelo do modo de consentimento do Gerenciador de tags:

Gerenciar configurações de consentimento (Web)
Ativar o modo de consentimento para apps

Os desenvolvedores de apps podem ativar o modo de consentimento usando o SDK do Google Analytics para Firebase:

Gerenciar configurações de consentimento (apps)
Integrações da plataforma de gestão de consentimento

As plataformas de gerenciamento de consentimento (CMPs) podem ser integradas ao modo e às configurações de consentimento no Gerenciador de tags do Google. As CMPs em destaque do Gerenciador de tags têm modelos disponíveis na Galeria de modelos da comunidade do Gerenciador de tags, que são integrados às nossas APIs de consentimento. Saiba como configurar a tag do Google.

Para coletar insights valiosos e proteger a privacidade do usuário, peça consentimento aos usuários do seu site. Recomendamos que você use uma plataforma de gestão de consentimento (CMP) ou trabalhe com seu sistema de gerenciamento de conteúdo (CMS) para obter o consentimento e enviar ao Google.

Saiba como Configurar seu banner de consentimento com uma plataforma de gestão de consentimento ou um sistema de gerenciamento de conteúdo.

Você precisa configurar um novo banner e o modo de consentimento:

Para simplificar a implantação de banners e o modo de consentimento, use um parceiro de CMP integrado para a configuração. Assim, você pode implantar um banner e implementar o modo de consentimento na interface do usuário da tag do Google com apenas alguns cliques. Saiba como usar uma CMP integrada parceira para configurar o banner e o modo de consentimento

Você já tem um banner, mas precisa configurar o modo de consentimento:

Uma opção é selecionar um dos seguintes parceiros de CMP para integrar ao modo de consentimento.

Plataformas de gestão de consentimento (CMP)

Axeptio
Acceptrics
Clickio Consent
Commanders Act
Complianz
CookieFirst
Cookie Information
Cookiebot
CookieHub
CookieScript
CookieYes
Concord
consentmanager
Consent Studio
CYTRIO
Didomi
Illow (link em inglês)
iubenda
Ketch
Lawwwing
Mandatly
My Agile Privacy
OneTrust
Osano
Secure Privacy
Sirdata
Sourcepoint (link em inglês)
Termly
TRUENDO
TrustArc
UniConsent
Usercentrics
WebToffee
Modo de consentimento para provedores de CMP

Os provedores de plataformas de gestão de consentimento (CMP) podem fazer a integração com o modo de consentimento e oferecer uma experiência melhor a quem usa os produtos do Google. Para saber mais, consulte Modo de consentimento para provedores de CMP.

Outros recursos

Ele tem outros recursos, como comportamento específico da região, capacidade de encobrir detalhes que já foram armazenados e transmitir informações em URLs quando o consentimento é negado. Para informações sobre como usar o modo de consentimento e esses outros recursos, consulte:

Gerenciar configurações de consentimento (Web)
Gerenciar configurações de consentimento (app)
Depuração do modo de consentimento no Assistente de tags
Configurações de consentimento do Gerenciador de tags do Google
Esta página pode ter conteúdo que foi traduzido com tecnologia de IA. As traduções de IA podem conter erros.
Envie feedback sobre este artigo
Isso foi útil?
Como podemos melhorá-lo?
Enviar
Precisa de mais ajuda?
Siga as próximas etapas:
 
Postar na Comunidade de Ajuda Receba respostas dos membros da comunidade
 
Fale conosco Conte mais sobre o problema para podermos ajudar você
Como escolher o caminho de aprendizado ideal para você

Confira google.com/analytics/learn, um novo recurso para aproveitar ao máximo o Google Analytics 4. O novo site inclui vídeos, artigos e fluxos guiados, além de outros links referentes ao Analytics, como Discord, blog, canal do YouTube e repositório do GitHub.

Comece a aprender hoje