---
titulo: "Marketing API — estrutura campanha / conjunto / anúncio / criativo"
url: https://developers.facebook.com/documentation/ads-commerce/marketing-api/overview
capturado_em: 2026-09-08
hash: 9afeb2c7ec8957df
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Visão geral da API de Marketing
Updated: 24 de jun de 2026
Copiar para LLM
Ver como Markdown
Os anúncios no Status do WhatsApp são disponibilizados por meio da API de Marketing. Saiba mais sobre anúncios no Status do WhatsApp.
Use a API de Marketing para automatizar a publicidade nas tecnologias da Meta. A API fornece funções para criação de anúncios, gerenciamento e análise de desempenho.
Você pode usar uma programação para gerar campanhas de anúncios, conjuntos de anúncios e anúncios individuais, implantando e ajustando-os com base em dados de desempenho em tempo real. A criação de anúncios automatizados também permite que as empresas alcancem públicos mais amplos usando menos recursos.
Além da criação de anúncios, você pode fazer o seguinte:
Atualizar, pausar ou excluir anúncios
Garantir que as campanhas permaneçam alinhadas com os objetivos comerciais
Acessar insights e análises detalhados para acompanhar o desempenho dos anúncios e tomar decisões baseadas em dados para melhorar os resultados
Como funciona
Campanhas de anúncios
A campanha é o nível mais alto da estrutura organizacional da conta de anúncios e deve representar um objetivo único, por exemplo, para estimular o engajamento com a publicação da Página. Definir o objetivo da campanha aplica a validação de quaisquer anúncios adicionados a essa campanha para garantir que eles também tenham o objetivo correto.
Conjuntos de anúncios
Os conjuntos de anúncios são grupos de anúncios que configuram o orçamento e o período para o qual os anúncios devem ser veiculados. O orçamento, a cobrança e a duração são definidos no nível do conjunto de anúncios e se aplicam a todos os anúncios do conjunto. Todos os anúncios contidos em um conjunto também devem ter o mesmo direcionamento e meta de otimização.
Crie um conjunto de anúncios para cada público-alvo com seu lance; os anúncios no conjunto são direcionados para o mesmo público com o mesmo lance. A criação de um conjunto de anúncios por público ajuda a controlar os gastos e a determinar quando o público verá seus anúncios. Ele também fornece métricas para cada público.
Criativos do anúncio
Os criativos do anúncio contêm apenas os elementos visuais do anúncio. Depois de serem criados, eles não poderão ser alterados. Cada conta de anúncios tem uma biblioteca para armazenar criativos para reutilização em anúncios.
Anúncios
Um objeto de anúncio contém todas as informações necessárias para exibir um anúncio no Facebook, Instagram, Messenger e WhatsApp, incluindo o criativo. Crie vários anúncios em cada conjunto para otimizar a veiculação de anúncios com base em diferentes imagens, links, vídeo, texto ou posicionamentos.
Adicionar componentes
A tabela a seguir mostra como os componentes de anúncios da API de Marketing se relacionam com campanhas, conjuntos de anúncios e anúncios.
Componente	Campanha de anúncios	Conjunto de anúncios	Anúncio

Objetivo
	
✓
	
	

Cronograma
	
	
✓
	

Orçamento
	
	
✓
	

Lances
	
	
✓
	

Público
	
	
✓
	

Criativo do anúncio
	
	
	
✓
Você achou esta página útil?