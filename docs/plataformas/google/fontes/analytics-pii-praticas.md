---
titulo: "Google Analytics — práticas para evitar envio de PII"
url: https://support.google.com/analytics/answer/6366371?hl=pt-BR
capturado_em: 2026-09-10
hash: f061b273f16ebf25
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Práticas recomendadas para evitar o envio de informações de identificação pessoal (PII)
Evite enviar PIIs para o Google ao coletar dados do Google Analytics.

Para proteger a privacidade do usuário, nossas políticas proíbem a transmissão ao Google de qualquer dado que possa ser usado ou reconhecido como informação de identificação pessoal (PII). As PIIs incluem, sem limitação, informações como endereços de e-mail, números de celulares pessoais e números de CPF ou CNPJ. Como a legislação varia nos países e territórios e como o Google Analytics é usado de muitas maneiras, consulte um advogado caso você precise confirmar se determinada informação constitui uma PII.

Saiba mais sobre o que o Google considera PIIs.

Ao implementar o Google Analytics em uma propriedade, siga as práticas recomendadas deste artigo para reduzir o risco de enviar PIIs ao Google.

Nesta página
IDs do usuário
URLs e títulos de página
PIIs inseridas pelos usuários
Importação de dados
Recursos do Google Analytics e risco de privacidade
Geolocalização
AdSense
IDs do usuário

Antes de usar os User-IDs, leia o artigo Práticas recomendadas para User-ID.

URLs e títulos de página

A tag de página básica do Google Analytics coleta o URL e o título de cada página que é visualizada. Geralmente, as PIIs são enviadas de forma não intencional nesses URLs e títulos. Os parâmetros e o caminho do URL não podem conter PIIs. Remova essas informações de todos os seus URLs, parâmetros de URL e títulos.

Você pode configurar o descarte de dados sensíveis no Google Analytics para remover endereços de e-mail na medida do possível e remover os parâmetros de consulta dos URL que especificar. O descarte de dados sensíveis é configurado na seção "Administrador" do Google Analytics e não exige nenhum código. Ele só está disponível para fluxos de dados da Web. Saiba mais sobre o descarte de dados sensíveis.

Você também pode adicionar o código analytics.js para modificar o URL antes do envio ao Google Analytics. Por exemplo, se quiser alterar o URL para "example.com/example?a=b":
ga('set', 'location', 'http://example.com/example' ?a=b');
Consulte a referência do desenvolvedor.

Da mesma forma, você pode mudar o título da página antes de enviar ao Google Analytics. Por exemplo, se quiser mudar o título para "New Title":
ga('set', 'title', 'New Title');
Consulte a referência do desenvolvedor.

Existem outras estratégias para evitar o envio de PII por URLs. Para saber mais, leia Práticas recomendadas para evitar o envio de PII na Central de Ajuda do AdSense.

PIIs inseridas pelos usuários

Os visitantes e usuários do site às vezes inserem PIIs em caixas de pesquisa e campos de formulários. Remova as PIIs dos dados inseridos pelo usuário antes de enviar ao Google Analytics.

Importação de dados

Leia a política de uso de dados enviados antes de utilizar a importação de dados ou fazer o upload de dados para o Google Analytics.

Recursos do Google Analytics e risco de privacidade

É preciso prestar atenção especial para garantir que PIIs (como nomes, CPFs ou CNPJs, endereços de e-mail ou outras informações semelhantes) ou dados que identifiquem permanentemente um dispositivo específico (como o identificador único de um smartphone, se não for possível redefinir esse identificador) não sejam enviados para o Google Analytics durante o uso destes recursos:

Substituição do User ID
Todas as dimensões personalizadas
Dimensões da campanha: origem, mídia, palavra-chave, campanha, conteúdo
Não inclua PII nos parâmetros de campanha personalizados utm_source, utm_medium, utm_term, utm_campaign e utm_content.
Dimensões de pesquisa no site: termo de pesquisa no site e categoria de pesquisa no site
Dimensões de evento: categoria de evento, ação de evento, rótulo de evento
Geolocalização

Se você coleta informações de geolocalização, é importante garantir que os dados de localização não sejam recebidos de GPS nem refinados, porque isso pode levar à dedução de dados do indivíduo. Para o Google Analytics, informações de "localização refinada" compõem qualquer área com menos de um quilômetro quadrado, incluindo todos os dados de latitude/longitude. Em alguns casos, como no Reino Unido, o CEP pode ser mapeado para uma única residência e, portanto, não deve ser transmitido para o Google Analytics.

AdSense

Se você usar o Google AdSense, leia e siga as práticas recomendadas para evitar o envio de PIIs na Central de Ajuda do Google AdSense.

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