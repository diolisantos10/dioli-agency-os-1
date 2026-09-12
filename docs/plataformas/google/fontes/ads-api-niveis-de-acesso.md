---
titulo: "Google Ads API — níveis de acesso e RMF"
url: https://developers.google.com/google-ads/api/docs/productionize/access-levels?hl=pt-br
capturado_em: 2026-09-12
hash: b0e8553d5d99f3bc
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Participe da nossa transmissão ao vivo no Discord no servidor da comunidade de publicidade e medição do Google e no YouTube em 20 de agosto, às 11h (horário de Brasília). Vamos discutir os novos recursos adicionados à versão 25.1 da API Google Ads.
 O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Níveis de acesso e RMF

A API Google Ads tem níveis de acesso associados ao projeto do Google Cloud e usa um processo de análise de aplicativos para conceder vários níveis de acesso. É importante planejar e conseguir os níveis de acesso corretos antes de colocar o aplicativo em produção.

Um cenário comum é que o desenvolvimento do aplicativo comece com o nível de acesso do Explorer, mas depois ultrapasse os limites de cota ao longo do tempo. Nesse momento, você precisa solicitar o nível de acesso básico ou padrão nível de acesso. Como o processo de análise pode levar dias ou até semanas para ser concluído, peça o upgrade para o nível de acesso padrão bem antes de precisar dos limites de cota aumentados.

O Google pode exigir que seu app ofereça determinados recursos ou funcionalidades, conforme listado nos recursos mínimos obrigatórios (RMF). Ao usar a API Google Ads, os RMF só se aplicam a projetos do Google Cloud com nível de acesso padrão. Analise esses requisitos com antecedência para evitar mais atrasos na criação dos recursos necessários no seu app.

Preços

A API Google Ads é sem custo financeiro. Não há cobranças pelo uso da API Google Ads nos níveis de acesso do Explorer, básico ou padrão. No entanto, se você estiver sujeito aos recursos mínimos obrigatórios (RMF), a equipe de análise da API vai auditar sua ferramenta para verificar a conformidade. Se a auditoria resultar em uma descoberta de não conformidade, talvez seja necessário pagar taxas de não conformidade.

Anterior
Proteger credenciais
Avançar
Logging
Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-09-12 UTC.