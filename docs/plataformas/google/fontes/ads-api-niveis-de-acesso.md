---
titulo: "Google Ads API — níveis de acesso e RMF"
url: https://developers.google.com/google-ads/api/docs/productionize/access-levels?hl=pt-br
capturado_em: 2026-09-06
hash: 53e74038523c3f1a
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Níveis de acesso e RMF

A API Google Ads tem níveis de acesso associados ao token de desenvolvedor e usa um processo de análise de aplicativos para conceder vários níveis de acesso. É importante planejar e conseguir os níveis de acesso corretos antes de colocar o aplicativo em produção.

Um cenário comum é que o desenvolvimento do aplicativo comece com o nível de acesso de explorador, mas depois ultrapasse os limites de cota ao longo do tempo. Nesse momento, você precisa solicitar o nível de acesso básico ou nível de acesso padrão. Como o processo de análise pode levar dias ou semanas para ser concluído, solicite o upgrade para o nível de acesso padrão bem antes de precisar dos limites de cota aumentados.

O Google pode exigir que seu app ofereça determinados recursos ou funcionalidades, conforme listado nos recursos mínimos obrigatórios (RMF). Ao usar a API Google Ads, os RMFs só se aplicam a tokens de desenvolvedor com nível de acesso padrão. Analise esses requisitos com antecedência para evitar mais atrasos na criação dos recursos necessários no seu app.

Preços

A API Google Ads é sem custo financeiro. Não há cobranças pelo uso dela nos níveis de acesso de explorador, básico ou padrão. No entanto, se você estiver sujeito aos recursos mínimos obrigatórios (RMF), a equipe de análise da API vai auditar sua ferramenta para verificar a conformidade. Se a auditoria resultar em uma descoberta de não conformidade, talvez seja necessário pagar taxas de não conformidade.

Anterior
Proteger credenciais
Avançar
Logging
Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-08-03 UTC.