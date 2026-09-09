---
titulo: "Meta Pixel — visão geral"
url: https://developers.facebook.com/documentation/meta-pixel
capturado_em: 2026-09-09
hash: d92ee11738fc1df6
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Pixel da Meta
Updated: 15 de nov de 2023
Copiar para LLM
Ver como Markdown
O Pixel da Meta é um trecho de código JavaScript que permite a você rastrear a atividade dos visitantes do seu site. Ele funciona por meio do carregamento de uma pequena biblioteca de funções que poderá ser usada sempre que o visitante de um site fizer uma ação (chamada de evento) que você quer rastrear (chamada de conversão). As conversões rastreadas aparecem no Gerenciador de Anúncios⁠, onde podem ser usadas para mensurar a eficiência dos anúncios, definir públicos personalizados para direcionamento de anúncios e para campanhas de anúncios de catálogo Advantage+, bem como analisar a eficiência dos funis de conversão do seu site.
O Pixel da Meta coleta os seguintes dados:
Cabeçalhos HTTP: tudo o que geralmente é apresentado em cabeçalhos HTTP, um protocolo-padrão da web enviado entre uma solicitação de navegador e um servidor na internet. Essas informações podem incluir endereços IP, dados do navegador da web, a localização da página, o documento, o referenciador e a pessoa que está acessando o site.
Dados específicos do Pixel: inclui a identificação do pixel e o cookie do Facebook.
Dados de clique de botão – inclui todos os botões nos quais os visitantes do site clicam, os rótulos desses botões e todas as páginas visitadas como resultado desses cliques.
Valores opcionais – desenvolvedores e profissionais de marketing podem optar por enviar informações adicionais sobre a visita por meio de eventos de Dados Personalizados. Os eventos de dados personalizados incluem valor de conversão, tipo de página, entre outros.
Nomes de campos do formulário: inclui nomes de campos do site (como email, address, quantity, entre outros) quando você compra um produto ou serviço. Não capturamos valores de campos a menos que você os inclua como parte da correspondência avançada ou de valores opcionais.
Conteúdo da documentação
Introdução
Veja um breve tutorial sobre como adicionar o código de base do Pixel às suas páginas da web.
Guias
Caso de uso baseado em guias para ajudar você a realizar ações específicas.
Referência
Confira referências do ponto de extremidade e das especificações de produtos.
Suporte
Confira dicas, resolução de problemas comuns e ferramentas.
Saiba mais
Rastrear a atividade do usuário em um app para celular por meio de Eventos do App do Facebook
Requisitos do iOS 14 da Apple para o Pixel da Meta⁠
Você achou esta página útil?