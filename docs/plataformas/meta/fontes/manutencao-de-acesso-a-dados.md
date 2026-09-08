---
titulo: "Manutenção de acesso a dados (Data Access Renewal / uso continuado)"
url: https://developers.facebook.com/documentation/development/maintaining-data-access
capturado_em: 2026-09-08
hash: 1ecd102fba4b91fb
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Como manter o acesso a dados
Updated: 25 de mar de 2024
Copiar para LLM
Ver como Markdown
Este documento lista políticas e procedimentos que podem afetar a capacidade do seu app de acessar os dados do Facebook. Caso o app esteja sob risco de perder (ou já tenha perdido) o acesso a dados do Facebook, você receberá uma notificação urgente do desenvolvedor na caixa de entrada de alertas. Você também pode receber uma notificação urgente por email, dependendo das suas configurações do desenvolvedor.

Consulte mais recursos de vídeo no Data Protocol⁠.
Apps inativos
Um app será considerado inativo se atender às condições a seguir:
Nenhum usuário entrou no app nos últimos 90 dias.
O app não fez chamadas para a Graph API ou a API de Marketing nos últimos 90 dias.
O app não recebeu notificações de webhook nos últimos 90 dias.
Depois que um app for considerado inativo, todos os tokens de acesso associados serão invalidados. Além disso, ele não poderá acessar a Graph API e a API de Marketing até que o acesso seja restaurado.
Como restaurar o acesso
Os administradores de um app inativo que o carregarem no Painel de Apps terão a opção de restaurá-lo. A restauração de um app inclui:
a atualização automática para as versões mais recentes da Graph API e da API de Marketing;
a reativação e atualização das notificações de webhooks para a versão mais recente.
Os tokens de acesso antigos continuarão inválidos. Portanto, será necessário gerar novos tokens. Além disso, as permissões que tiverem sido removidas do app inativo por falta de uso precisarão ser aprovadas novamente no processo de análise.
Avaliação da Proteção dos Dados
A Avaliação da Proteção dos Dados é um requisito para apps que acessam permissões avançadas. Ela foi desenvolvida para avaliar como os desenvolvedores usam, compartilham e protegem os Dados da Plataforma, conforme descrito nos Termos da Plataforma do Facebook. Quando registrado, um administrador do app precisará preencher um questionário com base no acesso do app aos dados da plataforma.
Saiba mais sobre a Avaliação da Proteção dos Dados.
Checkup de Uso de Dados
O processo de Checkup de Uso de Dados é um requisito anual usado para que você ou outro administrador possa confirmar que o app ainda acessa nossas APIs e usa nossos produtos e dados em conformidade com os Termos da Plataforma e as Políticas do Desenvolvedor.
Saiba mais sobre o Checkup de Uso de Dados.
Verificação de Uso de Produtos
Caso você tenha adicionado produtos que precisam ser certificados para uso, será necessário renovar a certificação anualmente como parte do processo de Checkup de Uso de Dados.
Violações de termos e políticas
Se você violar nossos termos, nossas políticas ou usos permitidos de permissões e recursos específicos, medidas de monitoramento serão aplicadas ao seu app. As medidas de monitoramento podem incluir desde a limitação da capacidade do app de acessar nossas APIs até a revogação de permissões e recursos específicos. Veja uma lista de termos e políticas na documentação Termos e políticas e saiba mais sobre as medidas de monitoramento e o processo de apelação.
Você achou esta página útil?