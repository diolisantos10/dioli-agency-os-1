---
titulo: "Meta Pixel — instalação e eventos"
url: https://developers.facebook.com/documentation/meta-pixel/get-started
capturado_em: 2026-09-06
hash: c35ec4e1a615482b
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Começar a usar o Pixel da Meta
Updated: 30 de jun de 2026
Copiar para LLM
Ver como Markdown
O Pixel da Meta é um trecho de código JavaScript que carrega uma pequena biblioteca de funções que você pode usar para rastrear a atividade de visitantes orientada por anúncios do Facebook no seu site. Ela usa cookies do Facebook⁠, que permitem a correspondência entre os visitantes do site e as respectivas contas de usuário do Facebook. Depois da correspondência, podemos contabilizar as ações no Gerenciador de Anúncios do Facebook para que você possa usar os dados para analisar os fluxos de conversão do site e otimizar as campanhas de anúncios.
Por padrão, o pixel rastreará URLs e domínios visitados, bem como os dispositivos dos visitantes. Além disso, é possível usar a biblioteca de funções do Pixel para:
rastrear conversões, para que você possa mensurar a eficácia do anúncio
definir públicos personalizados para que você possa direcionar os visitantes com maior probabilidade de conversão
configurar campanhas de anúncios de catálogo Advantage+
Requisitos
Para implementar o pixel, você precisará do seguinte:
Acesso à base de código do site
o código de base ou a identificação do Pixel;
acesso ao Gerenciador de Anúncios do Facebook⁠.
Além disso, dependendo de onde você faz negócios, pode ser necessário cumprir o Regulamento Geral sobre a Proteção de Dados.
Tudo pronto? Vamos começar.
Código de base
Antes de instalar o Pixel, você precisará do código de base, que pode ser encontrado em Gerenciador de Anúncios > Gerenciador de Eventos⁠. Caso você ainda não tenha um pixel, siga estas instruções⁠ para criar um. Você só precisa do código base do pixel (etapa 1).
O código de base do pixel contém a identificação do pixel em dois locais e tem esta aparência:
<!-- Facebook Pixel Code --><script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '{your-pixel-id-goes-here}');
  fbq('track', 'PageView');
</script><noscript>
  <img height="1" width="1" style="display:none"
       src="https://www.facebook.com/tr?id={your-pixel-id-goes-here}&ev=PageView&noscript=1"/>
</noscript><!-- End Facebook Pixel Code -->
Quando executado, esse código baixará uma biblioteca de funções que você poderá usar para rastreamento de conversão. Ele também rastreia automaticamente uma única conversão PageView chamando a função fbq() sempre que ela é carregada. Recomendamos que você deixe essa chamada de função intacta.
Como instalar o pixel
Para instalar o Pixel, recomendamos que você adicione o código de base entre as tags de abertura e fechamento <head> em cada página em que você rastreará as ações dos visitantes do site. A maioria dos desenvolvedores adiciona o código ao cabeçalho persistente do site para que ele possa ser usado em todas as páginas.
Posicionar o código dentro das tags <head> reduz a probabilidade de navegadores ou código de terceiros bloquearem a execução do Pixel. Ele também executa o código antes, aumentando a probabilidade de que os visitantes sejam rastreados antes de saírem da página.
Depois de adicionar o código ao site, carregue a página que contém o Pixel. Isso deve chamar fbq('track', 'PageView'), que será rastreado como um evento PageView no Gerenciador de Eventos.
Acesse o Gerenciador de Eventos para verificar se o evento foi rastreado. Localize o pixel e clique nos detalhes. Se você vir um novo evento PageView, isso significa que o pixel foi instalado com sucesso. Caso o banner não seja exibido, aguarde alguns minutos e atualize a página. Se o Pixel ainda não estiver funcionando, use o Consultor de Dados de Anúncios da Meta para identificar o problema.
Instalação com um gerenciador de tags
Embora seja recomendado adicionar o pixel diretamente às tags <head> do site, ele funcionará na maioria das soluções de gerenciamento e contêiner de tags. Para orientações específicas sobre como implementar o pixel usando um gerenciador de tags, consulte a documentação do seu gerenciador de tags.
Instalação usando uma tag IMG
Não é recomendado, mas você pode instalar o Pixel usando uma <img>tag.
Sites móveis
Caso o site para dispositivos móveis seja separado do site para desktop, recomendamos que você adicione o pixel a ambos. Isso permitirá que você faça o remarketing para os visitantes de dispositivos móveis, exclua-os ou crie públicos semelhantes com facilidade.
Consultor de Dados de Anúncios da Meta
Recomendamos que você instale a extensão do Chrome Consultor de Dados de Anúncios da Meta. O Data Advisor fornece feedback valioso para ajudar a verificar se o pixel está funcionando conforme o esperado. Isso é especialmente útil quando você começa a rastrear conversões e encontra erros de formatação.
Próximas etapas
Depois de verificar se o pixel está instalado e rastreia o evento PageView corretamente, você poderá usá-lo para o seguinte:
rastrear conversões
criar públicos personalizados
configurar anúncios de catálogo Advantage+
Saiba mais sobre como implementar o pixel com o Blueprint⁠.
Recursos
Meta Blueprint: Saiba mais sobre como implementar o pixel⁠
Você achou esta página útil?