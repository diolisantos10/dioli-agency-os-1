---
titulo: "Business Profile APIs — limites de uso (cotas por projeto)"
url: https://developers.google.com/my-business/content/limits?hl=pt-br
capturado_em: 2026-09-07
hash: 62e4557dee365e19
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Nesta página
Como solicitar um aumento de cota
API My Business Business Information
API My Business Account Management
API Business Profile Performance
API My Business Verifications

Limites de uso
Observação: se o limite da sua cota da API do Perfil da Empresa no Google for "0", você precisará solicitar acesso às APIs do Perfil da Empresa no Google. Isso não se aplica ao aumento de uma cota.
Como solicitar um aumento de cota

As APIs do Perfil da Empresa no Google têm limites de cota padrão, e eles estão documentados abaixo. Quando você alcançar o limite de cota, poderá pedir um aumento dela. Essas solicitações agora devem ser feitas no formulário de contato das APIs do GBP. Selecione "Pedido de aumento de cota" no menu suspenso e informe os dados solicitados.

No formulário, você terá que enviar as seguintes informações:
Nome da empresa e e-mail para contato
Número do seu projeto
Justificativa para solicitação de aumento da cota

Depois que você enviar o formulário, a equipe do Perfil da Empresa no Google vai revisar seu pedido e definir se há qualificação para o aumento da cota. Se a solicitação for aprovada, o aumento será concedido. Caso ela seja negada, a equipe do Perfil da Empresa no Google vai explicar o motivo.

Observação: o domínio do seu site deve ser igual ao do e-mail mesmo usado para enviar o formulário.

As seções a seguir descrevem os limites de cota específicos de várias APIs do GBP.

API My Business Business Information
Solicitações padrão por minuto: 300 QPM.
Além disso, vamos aplicar um limite de 10 edições por minuto a cada Perfil da Empresa no Google. Não é possível aumentar esse limite.
API My Business Account Management
Solicitações padrão por minuto: 300 QPM.
API Business Profile Performance
Solicitações padrão por minuto: 300 QPM.
API My Business Verifications
Solicitações padrão por minuto: 300 QPM.
API My Business Q&A
Solicitações padrão por minuto: 300 QPM.
API My Business Lodging
Solicitações padrão por minuto: 300 QPM.
API My Business Place Actions
Solicitações padrão por minuto: 300 QPM.
API My Business Notifications
Solicitações padrão por minuto: 300 QPM.
Práticas recomendadas

Para evitar problemas de cota, consulte as seguintes práticas recomendadas:

Evite enviar várias solicitações seguidas. Faça os pedidos de forma espaçada.
Use a espera exponencial para ajudar nas tentativas.
Use uma camada de cache para reduzir o número de solicitações.
Use os métodos Batch sempre que for apropriado.
Isso foi útil?

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2025-08-29 UTC.