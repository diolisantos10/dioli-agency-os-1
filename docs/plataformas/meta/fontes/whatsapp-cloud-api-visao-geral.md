---
titulo: "WhatsApp Cloud API — visão geral da plataforma"
url: https://developers.facebook.com/documentation/business-messaging/whatsapp/about-the-platform
capturado_em: 2026-09-07
hash: c66975587b9d69c2
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Sobre a Plataforma do WhatsApp Business
Updated: 4 de ago de 2026
Copiar para LLM
Ver como Markdown
A Plataforma do WhatsApp Business permite que as empresas se comuniquem com os clientes em grande escala.
Esta documentação é destinada a desenvolvedores que usam as nossas APIs. Para saber mais sobre outras maneiras de usar o WhatsApp para sua empresa, consulte o site do WhatsApp Business⁠.
Principais APIs e recursos
API de Nuvem da Plataforma do WhatsApp Business
A API de Nuvem da Plataforma do WhatsApp Business permite que você envie mensagens e faça ligações de forma programática no WhatsApp. A API de Nuvem pode ser usada para enviar aos usuários diferentes tipos de mensagens, desde SMSs simples a mensagens interativas e de mídia avançada.
A API de Nuvem inclui o seguinte:
Mensagens: envie SMSs, mídias avançadas e mensagens interativas
Ligações: faça e receba ligações de clientes
Grupos: crie, gerencie e envie mensagens em conversas em grupo do WhatsApp.
Com as mensagens do WhatsApp, é possível enviar mensagens criptografadas aos clientes. Use a API de Nuvem para:
Enviar confirmações de pedidos e atualizações sobre o envio.
Informar a disponibilidade de horários e enviar outros lembretes.
Enviar mensagens que recomendam produtos relacionados ou adicionais
Facilitar as transações do início ao fim, da descoberta do produto até o pagamento.
Ativar a autenticação multifatorial ou as senhas descartáveis para fazer a confirmação de contas e usuários.
Fornecer experiências de conversa interativas e personalizadas
Saiba mais sobre os tipos de mensagens na API de Nuvem do WhatsApp.
API de Gerenciamento de Negócios da Plataforma do WhatsApp Business
A API de Gerenciamento do WhatsApp Business permite gerenciar programaticamente uma conta do WhatsApp Business e os ativos associados.
Gerencie ativos de conta com a API de Gerenciamento do WhatsApp Business, como:
Números de telefone comerciais: adicione e remova números de telefone associados à sua empresa.
Modelos: crie e modifique modelos de mensagens para mensagens escaláveis.
A API de Gerenciamento do WhatsApp Business também dá acesso a análises da conta, como:
Análise de mensagens: o número e o tipo de mensagens enviadas e entregues.
Análise de preços: detalhamentos de preços granulares para mensagens entregues.
Análise de modelos: métricas de modelos enviados/lidos/entregues, além de cliques no botão de mensagem do modelo.
Saiba mais sobre modelos de mensagem.
Saiba mais sobre como gerenciar números de telefone comerciais.
Saiba mais sobre análises de conta.
API de Mensagens de Marketing para o WhatsApp
A API de Mensagens de Marketing é uma API para enviar mensagens de marketing otimizadas no WhatsApp.
Ao enviar mensagens de marketing por meio da API de Mensagens de Marketing para o WhatsApp, você pode acessar novos recursos não disponíveis na API de Nuvem e receber otimizações automáticas para que as mensagens de alto engajamento alcancem mais clientes.
A API de Mensagens de Marketing para o WhatsApp inclui:
Entrega baseada em qualidade: até 9% de aumento na entrega de mensagens de marketing via API de Nuvem para conteúdo de alto engajamento.
Otimizações de criativos automatizadas: aprimore automaticamente o criativo de marketing para melhorar o desempenho das mensagens.
Referências de desempenho e recomendações: comparação de taxas de leitura e cliques em relação a modelos semelhantes de empresas na sua região.
Métricas de conversão: mensure as mensagens de marketing que levam os usuários a realizar eventos no app, como "Adicionar ao carrinho", "Finalização da compra iniciada" ou "Comprar".
Saiba mais sobre a API de Mensagens de Marketing para o WhatsApp.
Webhooks
Os webhooks entregam cargas JSON ao servidor para atualizações de status da mensagem, mensagens recebidas, gerenciamento de erros assíncronos e muitos outros serviços de notificação.
A plataforma depende totalmente dos webhooks. Isso porque o conteúdo de qualquer mensagem enviada por um usuário do WhatsApp ao seu número de telefone comercial é transmitido como um webhook, e todas as atualizações de status de entrega de mensagens enviadas são registradas via webhook.
Saiba mais sobre webhooks.
Meta Business Agent
Com o Meta Business Agent, você pode configurar e operar agentes com tecnologia de IA no WhatsApp. Os agentes lidam com as conversas de forma autônoma, usando as fontes de conhecimento fornecidas (perguntas frequentes, informações da empresa, catálogos de produtos, arquivos e sites) e conectores personalizados às suas APIs externas.
O Meta Business Agent inclui:
Configuração do agente: Defina o comportamento, a identidade, o idioma e as instruções de sistema do agente.
Gerenciamento de conhecimento: Conecte perguntas frequentes, informações da empresa, catálogos, arquivos e sites para consulta do agente
Conectores personalizados: Integre suas APIs externas para que o agente possa realizar ações como verificar o status do pedido ou marcar um horário
Controle de conversas: Gerencie a troca entre o agente de IA e os agentes humanos
Avaliação e teste: Teste as respostas do agente e avalie o desempenho
Saiba mais sobre o Meta Business Agent.
Fundamentos técnicos
Protocolo HTTP e solicitações de API
A Plataforma do WhatsApp Business foi desenvolvida com base na Graph API e usa o protocolo HTTP. As solicitações de API incluem parâmetros de caminho, corpo e cabeçalho.
Exemplo: como enviar uma mensagem de texto usando cURL
curl 'https://graph.facebook.com/v17.0/106540352242922/messages' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer EAAJB...' \
  -d '{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "+16505555555",
    "type": "text",
    "text": {
      "preview_url": true,
      "body": "Here's the info you requested! https://www.meta.com/quest/quest-3/"
    }
  }'

Saiba mais sobre a Graph API.
Respostas JSON
As respostas da API são formatadas em JSON.
Exemplo: como pedir os metadados de um número de telefone comercial
{
  "verified_name": "Lucky Shrub",
  "code_verification_status": "VERIFIED",
  "display_phone_number": "15550783881",
  "quality_rating": "GREEN",
  "platform_type": "CLOUD_API",
  "throughput": {
    "level": "STANDARD"
  },
  "webhook_configuration": {
    "application": "https://www.luckyshrub.com/webhooks"
  },
  "id": "106540352242922"
}

Autenticação e autorização
A autenticação usa tokens de acesso OAuth (não 2.0), enquanto as permissões restringem o acesso a recursos específicos.
Saiba mais sobre os tokens de acesso.
Saiba mais sobre permissões.
Principais recursos
Portfólios empresariais
Com o portfólio empresarial, as organizações podem reunir todos os ativos de negócios da Meta para gerenciá-los em um só lugar. Na Plataforma do WhatsApp Business, um portfólio empresarial serve principalmente como um contêiner para contas do WhatsApp Business (WABA). É preciso ter um portfólio empresarial para usar a plataforma.
Os portfólios empresariais podem ser verificados, e o status de verificação contribui para melhorar a funcionalidade, como maior taxa de transferência de dados e o status de conta comercial oficial.
Saiba mais sobre portfólios empresariais⁠.
Contas do WhatsApp Business
Uma conta do WhatsApp Business representa sua empresa e contém números de telefone, nomes de usuário e análises.
Saiba mais sobre as contas do WhatsApp Business.
Números de telefone comerciais
Os números de telefone comerciais, reais ou virtuais, são usados para enviar e receber mensagens do WhatsApp. Eles podem ter nomes de exibição e receber o status de conta comercial oficial.
Saiba mais sobre números de telefone comercial.
Modelos de mensagem
Os modelos são mensagens personalizáveis que você pode criar antes do envio. Em geral, os modelos de mensagem precisam ser aprovados antes do envio.
Os modelos são úteis para enviar mensagens em escala. Além disso, eles são o único tipo de mensagem que pode ser enviado a usuários do WhatsApp fora da janela de atendimento ao cliente.
Os modelos têm pontuações de qualidade e estão sujeitos a vários limites de mensagens.
Saiba mais sobre modelos de mensagem.
Recursos de teste
Depois que você começar a usar a API de Nuvem, uma conta do WhatsApp Business e um número de telefone comercial de teste serão criados automaticamente para você. As contas do WhatsApp Business e os números de telefone de teste são úteis para fazer experimentos, já que eles flexibilizaram os limites de mensagens e não exigem uma forma de pagamento registada para enviar mensagens de modelo.
Será possível excluir seu portfólio empresarial e os respectivos recursos de teste se:
você for um administrador do portfólio empresarial associada ao app;
nenhum outro app estiver associado ao portfólio empresarial;
O portfólio empresarial não estiver associado a nenhuma outra conta do WhatsApp Business.
a conta do WhatsApp Business não estiver associada a nenhum outro número de telefone comercial.
Para excluir seu portfólio empresarial e os respectivos recursos de teste:
Acesse Painel de Apps > WhatsApp > Configuração.
Encontre a seção Conta de teste.
Clique no botão Excluir.
Use o API Playground ao testar os pontos de extremidade. A área de teste está disponível na seção "Referência da API" na barra lateral esquerda desta página. Em cada referência, clique no botão "Experimentar" para abrir o playground.
Além disso, a coleção Postman⁠ é útil para testes.
Ferramentas e integrações
Gerenciador do WhatsApp
O Gerenciador do WhatsApp é um app para web que permite o gerenciamento de contas do WhatsApp Business, contas de mensagens, números de telefone, modelos e análises.
Acessar o Gerenciador do WhatsApp⁠
SDKs de terceiros
Alguns SDKs, como PyWa⁠ (wrapper Python), estão disponíveis, mas não são mantidos ou endossados pela Meta.
Coleção Postman
A coleção Postman oficial permite executar consultas comuns de API.
Acesse a coleção Postman da Plataforma do WhatsApp Business.⁠
Segurança e desempenho
Taxa de transferência
Os números de telefone comercial podem enviar até 80 mensagens por segundo por padrão, com atualizações de capacidade disponíveis.
Saiba mais sobre taxa de transferência.
Criptografia
Com a API de Nuvem, todas as mensagens do WhatsApp continuam protegidas pela criptografia do protocolo Signal, que assegura a segurança das mensagens antes de saírem do dispositivo. A criptografia do protocolo Signal garante que as mensagens com uma conta do WhatsApp Business sejam entregues com segurança ao destino escolhido por cada empresa.
A API de Nuvem aplica técnicas padrão de criptografia da indústria para proteger os dados em trânsito e em repouso. Ela usa a Graph API para enviar mensagens e Webhooks para receber eventos. Ambos operam com HTTPS padrão da indústria protegido por TLS.
Para saber mais, consulte o relatório técnico Visão Geral da Criptografia do WhatsApp⁠.
Dimensionamento
A API de Nuvem dimensiona automaticamente o uso dentro dos limites de volume.
Limites de volume
As solicitações feitas pelo seu app na sua conta do WhatsApp Business (WABA) são contabilizadas na contagem de solicitações do app. A contagem de solicitações de um app é o número de solicitações que ele pode fazer durante uma hora.
Para os seguintes pontos de extremidade, por padrão, seu app pode fazer 200 solicitações por hora, por app e por WABA. Para WABAs ativas com pelo menos um número de telefone registrado, esse limite é de 5 mil solicitações por hora.
Tipo de solicitação	Ponto de extremidade

GET
	
/<WHATSAPP_BUSINESS_ACCOUNT_ID>

GET, POST e DELETE
	
/<WHATSAPP_BUSINESS_ACCOUNT_ID>/assigned_users

GET
	
/<WHATSAPP_BUSINESS_ACCOUNT_ID>/phone_numbers

GET, POST e DELETE
	
/<WHATSAPP_BUSINESS_ACCOUNT_ID>/message_templates

GET, POST e DELETE
	
/<WHATSAPP_BUSINESS_ACCOUNT_ID>/subscribed_apps

GET
	
/<WHATSAPP_BUSINESS_ACCOUNT_TO_NUMBER_CURRENT_STATUS_ID>
Para as solicitações da API de Linha de Crédito a seguir, o seu app pode fazer 5 mil solicitações por hora.
Tipo de solicitação	Ponto de extremidade

GET
	
/<BUSINESS_ID>/extendedcredits

POST
	
/<EXTENDED_CREDIT_ID>/whatsapp_credit_sharing_and_attach

GET e DELETE
	
/<ALLOCATION_CONFIG_ID>

GET
	
/<EXTENDED_CREDIT_ID>/owning_credit_allocation_configs
Para ver informações adicionais sobre como obter a utilização do limite de volume atual, consulte Cabeçalhos.
Além disso, a plataforma aplica vários limites de volume de mensagens:
Limites de mensagens: O número máximo de usuários únicos do WhatsApp para os quais você pode entregar mensagens, fora de uma janela de atendimento ao cliente, em um período móvel de 24 horas. Definido no nível do portfólio empresarial. Consulte Limites de mensagens.
Taxa de transferência de dados: Os números de telefone comercial podem enviar até 80 mensagens por segundo por padrão, com atualizações de capacidade disponíveis. Definido por número de telefone comercial. Consulte Taxa de transferência de dados.
Classificação de qualidade: Atribuída por número de telefone comercial e por modelo, essa classificação é usada para determinar atualizações automáticas de nível de taxa de transferência de dados. Consulte Template quality rating.
Limites de volume de pareamento
Os números de telefone comercial podem enviar uma mensagem a cada 6 segundos para o mesmo usuário do WhatsApp (0,17 mensagem por segundo), o que é equivalente a cerca de 10 mensagens por minuto ou 600 por hora. Exceder esse limite gera o código de erro 131056 até que você fique dentro da taxa permitida novamente.
É possível enviar até 45 mensagens em um período de seis segundos, mas essa ação tomará "emprestado" parte da sua cota futura. Após um pico no uso, é preciso esperar o tempo equivalente ao que levaria para enviar essas mensagens dentro da taxa normal (por exemplo, uma pico de 20 mensagens requer uma espera de aproximadamente dois minutos para enviar mais mensagens para o usuário).
Para gerenciar a limitação após o pico, se um pedido de envio falhar, tente novamente após 4^X segundos (começando com X=0 e aumentando X em uma unidade após cada falha) até ter sucesso.
Termos e políticas
Adesão do usuário
É preciso obter a aceitação do usuário antes de enviar modelos de mensagem A aceitação deve esclarecer o nome e a intenção da empresa.
Saiba mais sobre a Política de Mensagens do WhatsApp Business.⁠
Termos e políticas
O uso da Plataforma do WhatsApp Business deve estar em conformidade com nossos termos e políticas. É proibido usar ferramentas não autorizadas de terceiros.
Saiba mais sobre termos e políticas.⁠
Próximas etapas
Introdução à Plataforma do WhatsApp Business.
Saiba mais
Nomes de exibição
Números de telefone
Preços
Webhooks
Você achou esta página útil?