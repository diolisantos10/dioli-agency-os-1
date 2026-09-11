---
titulo: "WhatsApp — modelo de cobrança por conversa/mensagem"
url: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing
capturado_em: 2026-09-11
hash: 7081c131dcc6ee94
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Preços na Plataforma do WhatsApp Business
Updated: 10 de set de 2026
Copiar para LLM
Ver como Markdown
Este documento explica como funcionam os preços na Plataforma do WhatsApp Business.
As atualizações de preços para mensagens de agente, serviço e utilidade do Meta Business serão lançadas em 1º de agosto de 2026 e 1º de outubro de 2026. Saiba mais.
API de Nuvem e API de Mensagens de Marketing para o WhatsApp
A partir de 1º de julho de 2025, a Meta passará a cobrar por mensagem pelas mensagens que as empresas enviarem a usuários do WhatsApp:
Você recebe cobranças apenas quando uma mensagem de modelo é entregue ("type":"template").
As taxas variam conforme a categoria do modelo e o código de ligação do país do número de telefone do WhatsApp do destinatário.
A Meta gera valor para as empresas das seguintes maneiras:
A partir de 1º de novembro de 2024, a Meta não cobrará por mensagens que não são de modelo ("type":"text", "type":"image" e assim por diante). É possível enviar mensagens que não são de modelo somente dentro de uma janela aberta de atendimento ao cliente. Consulte Como enviar mensagens para ver uma lista com os tipos de mensagens.
A partir de 1º de julho de 2025, a Meta não cobrará por modelos de utilidade em resposta a dos usuários (entregues dentro de uma janela aberta de atendimento ao cliente).
A partir de 1º de julho de 2025: é possível acessar taxas mais baixas para mensagens de modelo de autenticação e utilidade, com base no volume de mensagens.
Período de ponto de entrada gratuito: todas as mensagens, incluindo mensagens de modelo, serão gratuitas por 72 horas, quando forem enviadas dentro de uma janela aberta de ponto de entrada gratuito.
Informações sobre preços
As atualizações de preços para mensagens de agente, serviço e utilidade do Meta Business serão lançadas em 1º de agosto de 2026 e 1º de outubro de 2026. Saiba mais.
O PDF explicativo sobre preços descreve como a Meta cobra as empresas e reflete as atualizações que serão lançadas em 1º de outubro de 2026:
Detalhamento de preços (PDF)
Categorias de modelo de mensagem
As mensagens com modelo são o único tipo que pode ser enviado fora da janela de atendimento ao cliente para alcançar os usuários. Veja como os modelos podem ser categorizados:
Marketing
Utilidade
Autenticação
Consulte Categorização de modelos para entender como os modelos são categorizados.
Comparação entre mensagens com e sem modelo
CSW = janela de atendimento ao cliente
FEP = Janela com ponto de entrada gratuito
As empresas são responsáveis por verificar a categoria atribuída aos modelos aprovados. Sempre que um modelo for usado, a empresa aceitará os custos associados à categoria aplicada no momento do uso.
Exemplo de cobrança
No exemplo abaixo, uma empresa envia 4 mensagens para um usuário do WhatsApp, mas é cobrada por apenas 2 (1 cobrança de marketing e 1 cobrança de utilidade).
Hora	Ação	Taxa	Motivo

0
	
Você envia uma mensagem de modelo de marketing para um usuário do WhatsApp, promovendo seu novo produto.
	
Marketing
	
Todas as mensagens de modelo de marketing são cobradas.

2
	
O usuário envia uma mensagem para você sobre o produto.
Essa ação abre uma janela de atendimento ao cliente (“CSW”) que dura 24 horas.
	
-
	
As mensagens enviadas por um usuário do WhatsApp a uma empresa não são cobradas.

3
	
Você envia uma mensagem de texto ao usuário ("type":"text"), descrevendo os detalhes do produto.
	
Nenhum
	
Todas as mensagens sem modelos são gratuitas dentro de uma janela aberta de atendimento ao cliente.

4
	
O usuário compra o produto, e você envia a ele um modelo de utilidade confirmando o pedido.
	
Nenhum
	
A janela ainda está aberta, e os modelos de utilidade enviados dentro desse período são gratuitos.

26
	
A janela de atendimento ao cliente é fechada, o que significa que você não pode mais enviar mensagens que não sejam de modelo.
	
-
	
Já se passaram 24 horas desde a última mensagem do usuário.

30
	
Você envia uma mensagem de modelo de utilidade ao usuário, com atualizações sobre o pedido.
	
Utilidade
	
As mensagens de modelo de utilidade enviadas fora do período de atendimento são cobradas, e não há nenhuma janela aberta entre você e o usuário.
Calendário de preços
Para permitir que nossos clientes se planejem e se preparem melhor para atualizações de preços, o calendário a seguir será aplicado a experiências de mensagens e voz na plataforma do WhatsApp Business:
A Meta atualizará os preços apenas no 1º dia de cada trimestre, ou seja, até quatro vezes por ano: 1º de janeiro, 1º de abril, 1º de julho e/ou 1º de outubro.
A Meta fornecerá um aviso prévio mais adequado ao esforço necessário para implementar diferentes tipos de atualizações de preços, conforme descrito abaixo:
Tipo de atualização de preço	Exemplos	Aviso prévio mínimo

Atualização da tabela de taxas
	
Atualização da taxa para determinado mercado ou produto
Atualização dos níveis de volume para determinado mercado ou produto (apenas utilidade e autenticação)
Transferência de um mercado de uma região de preços (por exemplo, "Outro") para outra ou para torná-lo independente na tabela de tarifas
	
1 mês

Complemento do modelo de precificação
	
1º de julho de 2025: lançamento dos novos limites de volume para mensagens de utilidade e autenticação
	
3 meses

Alteração no modelo de precificação
	
1º de julho de 2025: atualização do nosso modelo de precificação, de cobrança por conversa para cobrança por mensagem
	
6 meses
Taxas
As taxas variam de acordo com as informações de categoria do modelo, nível de volume e país/região.
Tabelas de taxas e níveis de volume
Essas tabelas de taxas refletem as taxas e os níveis de volume atuais, em vigor a partir de 1º de julho de 2026, com base no fuso horário da conta do WhatsApp Business. Essas informações também estão disponíveis no site do WhatsApp Business⁠.
Moeda	Tarifas (CSV)	Níveis de volume (CSV)	Tabelas de tarifas e níveis de volume (PDF)

USD
	
Taxas em USD
	
Níveis de volume em USD
	
Taxas e níveis de volume em USD

AED
	
Taxas em AED
	
Níveis de volume em AED
	
Taxas e níveis de volume em AED

ARS
	
Taxas em ARS
	
Níveis de volume em ARS
	
Taxas e níveis de volume em ARS

AUD
	
Taxas em AUD
	
Níveis de volume em AUD
	
Taxas e níveis de volume em AUD

BRL
	
Taxas em BRL
	
Níveis de volume em BRL
	
Taxas e níveis de volume em BRL

CLP
	
Taxas em CLP
	
Níveis de volume em CLP
	
Taxas e níveis de volume em CLP

COP
	
Taxas em COP
	
Níveis de volume em COP
	
Taxas e níveis de volume em COP

EUR
	
Taxas em EUR
	
Níveis de volume em EUR
	
Taxas e níveis de volume em EUR

GBP
	
Taxas em GBP
	
Níveis de volume em GBP
	
Taxas e níveis de volume em GBP

IDR
	
Taxas em IDR
	
Níveis de volume em IDR
	
Taxas e níveis de volume em IDR

INR
	
Taxas em INR
	
Níveis de volume em INR
	
Taxas e níveis de volume em INR

MXN
	
Taxas em MXN
	
Níveis de volume em MXN
	
Taxas e níveis de volume em MXN

MYR
	
Taxas em MYR
	
Níveis de volume em MYR
	
Taxas e níveis de volume em MYR

PEN
	
Taxas em PEN
	
Níveis de volume em PEN
	
Taxas e níveis de volume em PEN

SAR
	
Taxas em SAR
	
Níveis de volume em SAR
	
Taxas e níveis de volume em SAR

SGD
	
Taxas em SGD
	
Níveis de volume em SGD
	
Taxas e níveis de volume em SGD
Atualizações nas tabelas de tarifas
Confira abaixo as futuras atualizações das nossas taxas. Veja as taxas atualizadas nas nossas tabelas de taxas acima.
As tabelas de tarifas em vigor a partir de 1º de outubro de 2026 – incluindo as taxas de serviço – estão publicadas abaixo e serão movidas para a seção "Tabelas de tarifas e níveis de volume" a partir de 1º de outubro de 2026.
As atualizações de taxas abaixo são aplicadas a partir da meia-noite pelo fuso horário da conta do WhatsApp Business (WABA) e abrangem:
Atualizações trimestrais de taxas para mensagens de marketing, utilidade e autenticação.
Além disso, conforme anunciamos em 27 de maio de 2026, para fornecer aviso de quatro meses, e não de um mês: retirada de nove mercados da respectiva região de preços "Outros" (marcados com * abaixo), com uma nova taxa internacional de autenticação em cada um dos nove mercados recém-independentes.
Cobraremos pelas mensagens de serviço com as mesmas taxas de utilidade e autenticação, por mercado.
[Novidade] Além disso, a Meta lançará um nível mensal gratuito de mil mensagens de serviço por número de telefone comercial.
Cobraremos pelas mensagens de utilidade em resposta a usuários (dentro da janela de atendimento ao cliente de 24 horas), que não foram cobradas desde 1º de julho de 2025.
1. Atualizações das tarifas a partir de 1º de outubro de 2026
1a. Atualizações de tabela de taxas em vigor a partir de 1º de outubro de 2026
Taxas de marketing: aumentos no Kuwait*, México, Marrocos*, Arábia Saudita, Emirados Árabes Unidos, Outros países do Oriente Médio, Outros países da Ásia Pacífico
Taxas de autenticação e utilidade:
Aumentos no Cazaquistão*, Kuwait*, Marrocos*, Omã*, Paquistão, Peru, África do Sul, Ucrânia*.
Diminuições em Bangladesh*, Iraque*, Nepal*, Sri Lanka*.
Tarifas de autenticação internacional – Novas tarifas em Bangladesh*, Iraque*, Cazaquistão*, Kuwait*, Marrocos*, Nepal*, Omã*, Sri Lanka*, Ucrânia*, conforme anunciado em 27 de maio de 2026 para fornecer aviso de quatro meses, e não de um mês.
* O mercado será retirado da respectiva região de preços "Outros" e passará a ter uma tarifa independente. As 9 tarifas com atualizações para utilidade, autenticação e autenticação internacional foram anunciadas em 27 de maio de 2026.
1b. Mercados independentes a partir de 1º de outubro de 2026
A Meta anunciou em 27 de maio de 2026 que seis mercados seriam retirados das respectivas regiões de preços "Outros" em 1º de julho de 2026 e que pelo menos outros nove mercados seriam retirados em 1º de outubro de 2026. Para os que se tornarão independentes a partir de 1º de outubro de 2026, isso significa o seguinte:
Cobrança	Até 18 de setembro de 2024, as 30, 2026	A partir de 1º de outubro de 2026

Taxa cobrada
	
Taxa da respectiva região de preços "Outros".
	
Taxa de mercado independente

Acréscimo para níveis de volume
	
Níveis de volume da região de preços "Restante".
	
Níveis de volume específicos de mercados independentes
1c. Mercados com uma nova taxa internacional de autenticação, em vigor a partir de 1º de outubro de 2026
1º de setembro de 2026 – Conforme abaixo, e conforme anunciado em 27 de maio de 2026, a Meta determinará a elegibilidade para taxas internacionais de autenticação com base em mensagens de autenticação em 18 mercados, e não 9, com taxas desse tipo, incluindo os 9 mercados adicionais que terão uma taxa internacional de autenticação a partir de 1º de outubro de 2026.
Em vigor a partir de 1º de outubro de 2026 – A empresa poderá ser cobrada pelas taxas internacionais de autenticação em até mais de 9 mercados ou começar a ser cobrada pelas taxas internacionais de autenticação, conforme a tabela abaixo.
A partir de 30 de agosto de 2026	A partir de 19 de setembro de 2024, as 1, 2026	A partir de 1º de outubro de 2026

Qualifica-se para taxas de autenticação internacional. Assim, taxas de autenticação internacional cobradas em até 9 mercados 1
	
Sem alteração; a qualificação atual se aplica a novos mercados com taxas de autenticação internacional
	
Cobrança de taxas internacionais de autenticação em até 9 mercados adicionais, totalizando até 18 mercados

Ainda não qualificado para as taxas de autenticação internacional. Assim, não são cobradas taxas de autenticação internacional em nenhum mercado
	
Pode se qualificar para taxas internacionais de autenticação, por mensagens em 18 mercados, e não 92
	
Cobrança de taxas internacionais de autenticação em até 18 mercados
Conforme o ponto comercial principal, as empresas poderão continuar a ser cobradas pela taxa de autenticação em um desses 18 mercados.
A Meta continuará fornecendo um aviso de qualificação de 30 dias antes do início da cobrança das taxas internacionais de autenticação.
2. Taxas de serviço, em vigor a partir de 1º de outubro de 2026
As novas tarifas de serviço são publicadas abaixo.
A partir de 1º de outubro de 2026 – A Meta cobrará por mensagem as mensagens de serviço. Conforme anunciado em 1º de julho de 2026, as taxas para mensagens de serviço serão as mesmas que as de utilidade e autenticação, por mercado. As atualizações nas taxas de utilidade e autenticação (conforme mencionado acima) são refletidas nas taxas de serviço.
Não há alteração no momento em que a mensagem de serviço pode ser enviada. Ela ainda pode ser enviada apenas em uma janela de atendimento ao cliente de 24 horas que é aberta e redefinida a cada mensagem do usuário.
(NOVO)A partir de 1º de outubro de 2026 – A Meta lançará um nível mensal gratuito de mensagens de serviço.
Cada número de telefone comercial receberá 1.000 mensagens de serviço gratuitas por mês. A Meta só cobrará a partir da 1.001ª mensagem de serviço entregue em cada mês.
Para cada número de telefone comercial: as mensagens de serviço no nível gratuito não serão acumuladas caso não sejam usadas em um mês específico. As mensagens de serviço do nível gratuito são redefinidas mensalmente (por exemplo, 1.000 para outubro sem acumulação; 1.000 para novembro sem acumulação).
Caso você não tenha uma forma de pagamento para a conta do WhatsApp Business: a Meta entregará suas primeiras 1.000 mensagens de serviço a cada mês, mas não as mensagens a partir do número 1.001. Para garantir a continuidade das suas mensagens de serviço, verifique se você tem uma forma de pagamento na Central de Cobrança⁠.
O campo type no objeto pricing de webhooks de mensagens de status será alterado conforme a seguir para mensagens com category de service:
Quais mensagens	Até 30 de setembro 30, 2026	A partir de 1º de outubro de 2026
type	Carregado	type	Carregado

Mensagens de serviço no nível mensal gratuito por número de telefone comercial
	
free_customer_service
	
Não
	
free_customer_service
	
Não

A partir da 1.001ª mensagem de serviço por mês, por número de telefone comercial
	
free_customer_service
	
Não
	
regular
	
Sim
Mensagem de serviço no nível gratuito
Para uma mensagem de serviço individual entre as primeiras 1.000 mensagens de serviço entregues no número de telefone comercial nesse mês:
"pricing": {
  "billable": false,
  "pricing_model": "PMP",
  "type": "free_customer_service",
  "category": "service"
}

Para uma mensagem de serviço de grupo dentro do nível mensal gratuito:
"pricing": {
  "billable": false,
  "pricing_model": "PMP",
  "type": "free_group_customer_service",
  "category": "group_service"
}

Mensagem de serviço paga
Para uma mensagem de serviço individual entregue após as primeiras 1.000 mensagens de serviço entregues pelo número de telefone comercial naquele mês:
"pricing": {
  "billable": true,
  "pricing_model": "PMP",
  "type": "regular",
  "category": "service"
}

Para uma mensagem de serviço de grupo entregue após o uso do nível mensal gratuito:
"pricing": {
  "billable": true,
  "pricing_model": "PMP",
  "type": "regular",
  "category": "group_service"
}

Depois de receber essas informações, poderemos analisar isso para você. Taxas de utilidade, vigentes a partir de 1º de outubro de 2026
Em vigor a partir de 1º de outubro de 2026 – A Meta passará a cobrar pelas mensagens de utilidade enviadas durante uma janela aberta de atendimento ao cliente de 24 horas, conforme anunciado em 1º de julho de 2026.
Não há alteração quanto a quando uma mensagem de utilidade pode ser enviada. As empresas podem usar uma mensagem de modelo de utilidade para entrar em contato ou responder aos usuários, mesmo quando não há uma janela de atendimento ao cliente aberta.
O campo type no objeto pricing de webhooks de mensagens de status será alterado conforme a seguir para mensagens com category de utility enviadas em resposta a usuários, dentro de uma janela aberta de atendimento ao cliente:
Quais mensagens	Até 30 de setembro 30, 2026	A partir de 1º de outubro de 2026
type	Carregado	type	Carregado

Mensagens de utilidade enviadas em resposta aos usuários, portanto, dentro da janela de atendimento ao cliente de 24 horas
	
free_customer_service
	
Não
	
regular
	
Sim
Mensagem de utilidade enviada em resposta a um usuário
Até 30 de setembro de 2026, o objeto pricing para uma mensagem de utilidade individual enviada dentro de uma janela aberta de atendimento ao cliente será:
"pricing": {
  "billable": false,
  "pricing_model": "PMP",
  "type": "free_customer_service",
  "category": "utility"
}

Para uma mensagem de utilidade em grupo enviada dentro de uma janela aberta de atendimento ao cliente do grupo até 30 de setembro de 2026:
"pricing": {
  "billable": false,
  "pricing_model": "PMP",
  "type": "free_group_customer_service",
  "category": "group_utility"
}

A partir de 1º de outubro de 2026, o objeto pricing para uma mensagem de utilidade individual enviada dentro de uma janela aberta de atendimento ao cliente será:
"pricing": {
  "billable": true,
  "pricing_model": "PMP",
  "type": "regular",
  "category": "utility"
}

Para uma mensagem de utilidade em grupo enviada dentro de uma janela aberta de atendimento ao cliente do grupo a partir de 1º de outubro de 2026:
"pricing": {
  "billable": true,
  "pricing_model": "PMP",
  "type": "regular",
  "category": "group_utility"
}

Tabelas de tarifas vigentes a partir de 1º de outubro de 2026
Confira abaixo as futuras atualizações das nossas taxas. Veja as taxas atualizadas nas nossas tabelas de taxas acima.
Moeda	Taxas (csv)	Níveis de volume (csv)	Taxas e níveis de volume (PDF)

USD
	
Taxas em USD
	
Níveis de volume em USD
	
Taxas e níveis de volume em USD

AED
	
Taxas em AED
	
Níveis de volume em AED
	
Taxas e níveis de volume em AED

ARS
	
Taxas em ARS
	
Níveis de volume em ARS
	
Taxas e níveis de volume em ARS

AUD
	
Taxas em AUD
	
Níveis de volume em AUD
	
Taxas e níveis de volume em AUD

BRL
	
Taxas em BRL
	
Níveis de volume em BRL
	
Taxas e níveis de volume em BRL

CLP
	
Taxas em CLP
	
Níveis de volume em CLP
	
Taxas e níveis de volume em CLP

COP
	
Taxas em COP
	
Níveis de volume em COP
	
Taxas e níveis de volume em COP

EUR
	
Taxas em EUR
	
Níveis de volume em EUR
	
Taxas e níveis de volume em EUR

GBP
	
Taxas em GBP
	
Níveis de volume em GBP
	
Taxas e níveis de volume em GBP

IDR
	
Taxas em IDR
	
Níveis de volume em IDR
	
Taxas e níveis de volume em IDR

INR
	
Taxas em INR
	
Níveis de volume em INR
	
Taxas e níveis de volume em INR

MXN
	
Taxas em MXN
	
Níveis de volume em MXN
	
Taxas e níveis de volume em MXN

MYR
	
Taxas em MYR
	
Níveis de volume em MYR
	
Taxas e níveis de volume em MYR

PEN
	
Taxas em PEN
	
Níveis de volume em PEN
	
Taxas e níveis de volume em PEN

SAR
	
Taxas em SAR
	
Níveis de volume em SAR
	
Taxas e níveis de volume em SAR

SGD
	
Taxas em SGD
	
Níveis de volume em SGD
	
Taxas e níveis de volume em SGD
Conforme anunciado em 27 de maio de 2026
Para fornecer um aviso com mais de um mês de antecedência, dando mais tempo para planejamento e preparação, a Meta compartilhou atualizações de preços que entrarão em vigor em 1º de outubro de 2026 a 1º de junho de 2026. A partir de 1º de julho de 2026, a Meta removerá mercados adicionais das respectivas regiões de preços "Outros" para que tenham cartões de taxas independentes. Veja abaixo os mercados que serão retirados pela Meta e as atualizações correspondentes das taxas. A Meta anunciará as taxas até 1º de setembro de 2026, conforme o calendário de preços.
Bangladesh*, Iraque*, Nepal*, Sri Lanka* – Redução nas taxas de autenticação e utilidade, além de uma nova taxa internacional de autenticação mais alta em relação à taxa regional de autenticação atual
Cazaquistão*, Kuwait*, Marrocos*, Omã*, Ucrânia* – Taxas de autenticação e utilidade mais altas, além de uma nova taxa internacional de autenticação mais alta em relação à taxa de autenticação regional atual
As atualizações de preços entrarão em vigor em 1º de agosto de 2026 e 1º de outubro de 2026.
As atualizações de preços para mensagens de agente, serviço e utilidade do Meta Business serão lançadas em 1º de agosto de 2026 e 1º de outubro de 2026. Consulte aqui para saber mais.
Localização de cobrança para Brasil e Índia
Brasil
Para o Brasil, a implementação gradual começou conforme o planejado em 1º de julho de 2026. A partir de 16 de julho de 2026, todos os provedores de soluções qualificados e empresas diretamente integradas poderão criar novas WABAs em BRL.
A partir de 1º de julho de 2026, às 9h PT – Somente provedores de soluções e empresas integradas diretamente com país de venda no Brasil na Central de Cobrança⁠ (clientes qualificados) poderão criar novas contas do WhatsApp Business (WABAs) em BRL (reais brasileiros). Saiba mais sobre a localização de cobranças para o Brasil aqui⁠.
As taxas por mensagem em BRL agora estão publicadas abaixo. As cobranças de qualquer WABA em BRL serão faturadas em BRL pela entidade local da Meta no Brasil, o Facebook Brasil.
Lembramos que os clientes qualificados precisam migrar todas as WABAs do portfólio empresarial para o BRL até 30 de junho de 2027 para evitar interrupções, já que a partir de 1º de julho de 2027 a Meta não entregará mais mensagens de WABAs que não sejam do BRL de clientes qualificados. Para tornar esse processo de migração mais fácil e rápido, use as APIs de Migração de Moeda da WABA, que estarão disponíveis a partir de 1º de junho de 2026.
Índia
A localização de cobrança foi lançada em 1º de janeiro de 2026 para provedores de soluções e empresas diretamente integradas com país de venda na Índia na Central de Cobrança⁠ (clientes qualificados). Saiba mais aqui⁠.
Os clientes qualificados devem garantir que todas as WABAs no portfólio empresarial sejam migradas para a INR até 31 de dezembro de 2026 para evitar interrupções, já que a partir de 1º de janeiro de 2027 a Meta não entregará mais mensagens de WABAs que não estejam em INR. Para tornar esse processo de migração mais fácil e rápido, use as APIs de Migração de Moeda da WABA, que estarão disponíveis a partir de 1º de junho de 2026.
Atualizações anteriores da tabela de tarifas
Em 1º de julho de 2026, à meia-noite, conforme o fuso horário da conta do WhatsApp Business, serão aplicadas as atualizações de taxas abaixo:
Hong Kong*: tarifas de utilidade e autenticação mais altas.
Hungria*: tarifas de utilidade e autenticação mais altas.
Itália: taxa de mensagens de marketing mais alta.
Polônia*: tarifas de marketing, utilidade e autenticação mais baixas.
Catar*: tarifas de utilidade e autenticação mais altas.
Romênia*: tarifas de utilidade e autenticação mais altas.
Singapura*: tarifas de utilidade e autenticação mais altas.
Espanha: taxa de mensagens de marketing mais alta.
Reino Unido: taxa de mensagens de marketing mais alta.
* Até 30 de junho de 2026, as mensagens para usuários nesses mercados eram cobradas pelas respectivas taxas regionais (por exemplo, Outros países da Europa Central e Oriental para a Polônia). Esses mercados foram removidos da precificação da taxa regional para serem independentes nas tabelas de tarifas, com taxas específicas do mercado.
Para mensagens de utilidade e autenticação – Os níveis de volume para esses mercados agora são específicos do mercado. Por exemplo, as mensagens que as empresas enviam a usuários na Polônia a/ não contam mais para os níveis de volume do restante da Europa Central e Oriental e, em vez disso, b/ contam para os níveis de volume da Polônia.
Em 1º de abril de 2026, à meia-noite, conforme o fuso horário da conta do WhatsApp Business, as atualizações de taxas abaixo serão aplicadas:
Arábia Saudita: taxa de mensagens de marketing mais alta.
Índia: tarifa internacional de autenticação mais alta.
Paquistão: tarifas de utilidade e autenticação mais altas. A tarifa internacional de autenticação não será alterada.
Turquia: tarifas de utilidade e autenticação mais baixas.
Introdução de 8 novas moedas de cobrança: ARS (Argentina), CLP (Chile), COP (Colômbia), MYR (Malásia), PEN (Peru), SAR (Arábia Saudita), SGD (Singapura), AED (Emirados Árabes Unidos).
Em 1º de janeiro de 2026, à meia-noite, conforme o fuso horário da conta do WhatsApp Business, as atualizações de taxas abaixo serão aplicadas:
Índia: taxa de marketing mais alta.
França, Egito: taxas de marketing mais baixas.
América do Norte: tarifas de utilidade e autenticação mais baixas.
A partir de 1º de outubro de 2025, à meia-noite, conforme o fuso horário da conta do WhatsApp Business, foram aplicadas as atualizações de taxas abaixo:
Colômbia: tarifas de utilidade e autenticação mais altas.
México: taxas de marketing mais baixas.
Emirados Árabes Unidos: taxa de mensagens de marketing mais alta.
Argentina, Egito e Arábia Saudita: taxas de autenticação e utilidade mais baixas.
O Zimbábue está incluído na região "Outros países da África" em vez de "Outro". As mensagens entregues a usuários do WhatsApp com o código de país +263 (Zimbábue) serão cobradas com base nas taxas da região "Outros países da África".
A partir de 1º de julho de 2025: as taxas de mensagens de utilidade e autenticação em diversos mercados serão reduzidas para garantir que nossos preços estejam alinhados com os de canais alternativos para esses casos de uso. As taxas de conversas de marketing se tornaram taxas de mensagens de marketing.
A partir de 1º de abril de 2025: redução das taxas de conversas internacionais de autenticação no Egito, na Nigéria, no Paquistão e na África do Sul.
A partir de 1º de fevereiro de 2025: reduzimos as taxas de conversas de autenticação para Egito, Malásia, Nigéria, Paquistão, Arábia Saudita, África do Sul e Emirados Árabes Unidos.
A partir de 1º de novembro de 2024: as conversas de serviço agora são gratuitas para todas as empresas.
A partir de 1º de outubro de 2024: atualizamos as taxas de conversas de marketing para Índia, Arábia Saudita, Emirados Árabes Unidos e Reino Unido.
A partir de 1º de agosto de 2024: reduzimos astaxas de conversas de utilidade.
Tarifas de autenticação internacionais
Países específicos estão sujeitos a uma taxa internacional de autenticação. Nossas tabelas de tarifas refletem esses valores. Consulte Taxas internacionais de autenticação para saber mais sobre essas taxas e entender se elas se aplicam a você.
Código telefônico do país
As cobranças por mensagens se baseiam no código telefônico do país referente ao número de telefone do destinatário no WhatsApp. A tabela abaixo mostra como a Meta associa códigos de ligação de países e códigos de país ISO 3166 Alpha-2 a países ou regiões. Se um país não estiver listado abaixo, ele será associado a Outros.
Mercados	Código de ligação
(e o prefixo de rede, se aplicável)	Código de país ISO

Países

Argentina

Brasil

Chile

Colômbia

Egito

França

Alemanha

Hong Kong

Hungria

Índia

Indonésia

Israel

Itália

Malásia

México

Países Baixos

Nigéria

Paquistão

Peru

Polônia

Catar

Romênia

Rússia

Arábia Saudita

Singapura

África do Sul

Espanha

Turquia

Emirados Árabes Unidos

Reino Unido
	

54

55

56

57

20

33

49

852

36

91

62

972

39

60

52

31

234

92

51

48

974

40

7

966

65

27

34

90

971

44
	

AR

BR

CL

CO

EG

França

Alemanha

HK

HU

IN

Identificação

IL

Itália

MY

MX

NL

NG

PK

PE

PL

QA

RO

RU

SA

SG

ZA

ES

TR

AE

Reino Unido

América do Norte

Canadá

Estados Unidos
	

1

1
	

CA

This is repeated to segment number 37556516873963024, do not translate or update.

Outros países da África

Argélia

Angola

Benin

Botsuana

Burkina Faso

Burundi

Camarões

Chade

República do Congo (Brazzaville)

Eritreia

Etiópia

Gabão

Gâmbia

Gana

Guiné-Bissau

Costa do Marfim

Quênia

Lesoto

Libéria

Líbia

Madagascar

Malaui

Mali

Mauritânia

Marrocos

Moçambique

Namíbia

Níger

Ruanda

Senegal

Serra Leoa

Somália

Sudão do Sul

Sudão

Suazilândia

Tanzânia

Togo

Tunísia

Uganda

Zâmbia

Zimbábue
	

213

244

229

267

226

257

237

235

242

291

251

241

220

233

245

225

254

266

231

218

261

265

223

222

212

258

264

227

250

221

232

252

211

249

268

255

228

216

256

260

263
	

DZ

AO

BJ

BW

BF

BI

CM

TD

CG

ER

ET

GA

GM

GH

GW

CI

KE

LS

LR

LY

MG

MW

ML

MR

MA

MZ

América do Norte

NE

RW

SN

SL

SO

SS

SD

SZ

TZ

TG

TN

UG

ZM

ZW

Outros países da Ásia-Pacífico

Afeganistão

Austrália

Bangladesh

Camboja

China

Japão

Laos

Mongólia

Nepal

Nova Zelândia

Papua-Nova Guiné

Filipinas

Sri Lanka

Taiwan

Tadjiquistão

Tailândia

Turcomenistão

Uzbequistão

Vietnã
	

93

61

880

855

86

81

856

976

977

64

675

63

94

886

992

66

993

998

84
	

AF

AU

BD

KH

CN

JP

LA

MN

NP

NZ

PG

PH

LK

TW

TJ

TH

TM

UZ

VN

Outros países da Europa Central e Oriental

Albânia

Armênia

Azeri

Belarus

Bulgária

Croácia

República Tcheca

Geórgia

Grécia

Letônia

Lituânia

Moldávia

Macedônia do Norte

Sérvia

Eslováquia

Eslovênia

Ucrânia
	

355

374

994

375

359

385

420

995

30

371

370

373

389

381

421

386

380
	

AL

AM

AZ

BY

BG

Recursos Humanos

CZ

GE

GR

LV

LT

MD

MK

RS

SK

SI

UA

Outros países da Europa Ocidental

Áustria

Bélgica

Dinamarca

Finlândia

Irlanda

Noruega

Portugal

Suécia

Suíça
	

43

32

45

358

353

47

351

46

41
	

Áustria

BE

Dinamarca

FI

Irlanda

NO

PT

Suécia

Suíça

Outros países da América Latina

Bolívia

Costa Rica

República Dominicana

Equador

El Salvador

Guatemala

Haiti

Honduras

Jamaica

Nicarágua

Panamá

Paraguai

Porto Rico

Uruguai

Venezuela
	

591

506

1 (809, 829, 849)

593

503

502

509

504

1 (658, 876)

505

507

595

1 (787, 939)

598

58
	

BO

CR

VOCÊ PODE

EC

SV

GT

HT

HN

JM

NI

PA

PY

PR

UY

VE

Outros países do Oriente Médio

Barein

Iraque

Jordânia

Kuwait

Líbano

Omã

Iêmen
	

973

964

962

965

961

968

967
	

BH

IQ

JO

KW

LB

OM

YE

Outros

Todos os outros países
	

Varia por país
	
Níveis de volume
Você pode aproveitar taxas mais baixas de utilidade e autenticação com base no número de mensagens enviadas por mês.
Acúmulo de níveis
As mensagens são agregadas no nível do portfólio empresarial, abrangendo todas as contas do WhatsApp Business (WABAs, pelas iniciais em inglês) pertencentes ao portfólio: para definir quais níveis podem ser aplicados em determinado mês para cada combinação de mercado e categoria, a Meta agrega mensagens são somadas entre todas as WABAs do portfólio empresarial, conforme o par mercado-categoria (por exemplo, Brasil-autenticação, Brasil-utilidade, Índia-autenticação e assim por diante).
Apenas as mensagens cobradas contam para a definição dos níveis: portanto, as mensagens a seguir não são contabilizadas:
Modelos de utilidade entregues aos usuários do WhatsApp dentro de uma janela aberta de atendimento ao cliente
Modelos de utilidade entregues dentro de uma janela de ponto de entrada gratuito
Os níveis de volume serão determinados exclusivamente pela Meta: todos os dados de insights são aproximados devido a pequenas variações no processamento das informações. Não se deve depositar confiança excessiva nos dados de insights.
Dinâmica-chave
Os níveis são específicos por mercado e categoria: os níveis de volume seguem nossas tabelas de tarifas e variam conforme o mercado (por exemplo, Brasil ou Outros países da América Latina) e a categoria (utilidade, autenticação).
As taxas são específicas por nível: quando uma empresa envia mensagens suficientes em uma determinada combinação de mercado e categoria para atingir o próximo nível, ela acessa a taxa correspondente à nova faixa, aplicável às mensagens do nível em questão. Essa taxa se aplica a todas suas WABAs.
Os níveis são redefinidos todo mês: no início de cada novo mês (meia-noite no fuso horário da WABA), a contagem de mensagens é zerada, e as empresas começam a acumular mensagens para aquele mês.
Exemplos de níveis de volume
A tabela abaixo é apenas ilustrativa e destaca a dinâmica dos níveis de volume. Consulte nossas tabelas de tarifas para conferir os valores cobrados.
Veja abaixo vários exemplos para destacar como os níveis funcionam e o que será cobrado em determinado mês para uma combinação específica de mercado e categoria. Os exemplos referem-se à tabela ilustrativa exibida acima:
Exemplo 1 – uma empresa que envia um total de mensagens de autenticação B em um mês para a Índia será cobrada da seguinte forma:
Taxa da lista para as primeiras mensagens A
Taxa do nível 1 para as mensagens de A+1 até B
Cálculo total para o mês = taxa por nível 𝗑 mensagens em cada nível
Exemplo 2 – uma empresa que começa a ser cobrada pelas nossas taxas internacionais de autenticação no 15º dia do mês:
Dias 1 a 14 do mês: os níveis de volume são aplicados à taxa de autenticação.
Do dia 15 em diante do mês: os níveis de volume passam a ser aplicados à taxa internacional de autenticação, com as mensagens continuando a acumular no mesmo mês. Por exemplo, se uma empresa já tiver alcançado o nível 2, ela será cobrada pela tarifa internacional de autenticação correspondente a esse nível.
Exemplo 3: uma empresa com 3 WABAs que enviam mensagens de autenticação para a Índia. Para a WABA A, ainda é 31 de julho, de acordo com o fuso horário local. Para as WABAs B e C, já é 1º de agosto, conforme o fuso horário local. No mês de julho, a empresa já está sendo cobrada pela taxa do nível 1.
O portfólio empresarial estará acumulando mensagens para os níveis tanto de julho (por meio da WABA A) quanto de agosto (por meio das WABAs B e C) durante um determinado período.
A empresa pode alcançar o próximo nível para julho por meio da WABA A. Se isso ocorrer, as mensagens restantes de julho enviadas pela WABA A serão cobradas com base na taxa do nível 2.
Exemplo 4: uma empresa possui 3 WABAs integradas em 2 parceiros. O provedor 1 envia as primeiras mensagens B em um determinado mês, e o provedor 2 começa a enviar mensagens quando a empresa já está no 3º nível. A empresa não envia mensagens suficientes naquele mês para atingir o próximo nível. O que a Meta cobra de cada fornecedor:
Provedor 1: taxa da lista para as primeiras mensagens A, depois, taxa do nível 1 para as mensagens de A+1 até B e taxa do nível 2 para as mensagens de B+1 até C
Provedor 2: taxa do nível 2 aplicada a todas as mensagens enviadas por ele
Webhooks sobre níveis
A partir de 1º de outubro de 2025, um webhook account_update com event definido como VOLUME_BASED_PRICING_TIER_UPDATE será disparado quando sua conta do WhatsApp Business atingir um novo nível de volume, em qualquer mercado, em um determinado mês. Isso complementa nosso ponto de extremidade pricing_analytics, que continuará fornecendo o progresso do nivelamento ao longo do mês e informações sobre o nível para mensagens entregues.
Exemplo de webhook:
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "102290129340398",
      "time": 1743451903,
      "changes": [
        {
          "value": {
            "volume_tier_info": {
                "tier_update_time": 1743451903,
                "pricing_category": "UTILITY",
                "tier": "25000001:50000000",
                "effective_month": "2025-11",
                "region": "India"
            },
            "event": "VOLUME_BASED_PRICING_TIER_UPDATE"
          },
          "field": "account_update"
        }
      ]
    }
  ]
}

tier_update_time indica quando sua conta do WhatsApp Business atingiu um nível de volume superior (registro de data e hora Unix).
pricing_category indica a categoria de modelo (UTILITY ou AUTHENTICATION) à qual a taxa do seu novo nível de volume se aplica.
tier informa os limites mínimo e máximo do novo nível de volume.
effective_month indica o mês em que a tarifa do seu novo nível de volume entra em vigor.
region indica o país ou a região dos usuários do WhatsApp onde se aplica a tarifa do seu novo nível de volume.
É possível que vários webhooks account_update sejam acionados para descrever o mesmo evento de mudança de nível. Nesses casos, use o webhook com o menor registro de data e hora tier_update_time Unix como o webhook oficial.
Análises de nível
Confira informações sobre os níveis de volume por meio da análise de modelos.
Quando as mensagens não são cobradas
A Meta não cobra por mensagens em alguns casos, conforme descrito abaixo.
Mensagens que não são de modelo
As atualizações de preços para mensagens de agente, serviço e utilidade do Meta Business serão lançadas em 1º de agosto de 2026 e 1º de outubro de 2026. Saiba mais.
As mensagens sem modelo, que só podem ser enviadas dentro de uma janela de atendimento ao cliente aberta, não serão cobradas a partir do dia 1º de novembro de 2024. Essas mensagens têm type definido como free_customer_service no objeto pricing dos webhooks de mensagens de status :
"pricing": {
  "billable": false,
  "pricing_model": "PMP",
  "type": "free_customer_service",
  "category": "service"
}

Mensagens de modelo de utilidade em resposta a usuários
As atualizações de preços para mensagens de agente, serviço e utilidade do Meta Business serão lançadas em 1º de agosto de 2026 e 1º de outubro de 2026. Saiba mais.
A partir de 1º de julho de 2025, as mensagens de modelo de utilidade enviadas dentro de uma janela de atendimento ao cliente aberta não serão cobradas. Nessas mensagens, type será definido como free_customer_service e category será definido como utility no objeto pricing de webhooks messages de status:
"pricing": {
  "billable": false,
  "pricing_model": "PMP",
  "type": "free_customer_service",
  "category": "utility"
}

Caso extremo
Se você enviar uma mensagem para um usuário do WhatsApp antes de 1º de julho de 2025 (data em que a Meta mudou de preços por conversa para preços por mensagem), uma conversa de utilidade será aberta entre você e o usuário que atravessa a mudança no modelo de precificação (ou seja, a conversa foi iniciada antes da transição, mas só será encerrada após a implementação do novo método de cobrança). Nesse caso, os modelos de utilidade enviados ao usuário após a mudança e enquanto a conversa estiver aberta serão gratuitos, mas atribuídos à conversa já iniciada. Nos webhooks messages de status, essas mensagens terão um pricing_model de CBP e a identificação de conversa de utilidade será atribuída a conversation.id. Quando a conversa for encerrada, as mensagens de utilidade enviadas posteriormente passarão a seguir o modelo de cobrança por mensagem, o que será refletido nos novos webhooks.
Janelas de ponto de entrada gratuito (FEP)
Se um usuário do WhatsApp enviar uma mensagem para você por meio de um anúncio de clique para o WhatsApp ou do botão de chamada para ação em uma Página do Facebook, usando um dispositivo com nosso app Android ou iOS (apps para desktop e web não são compatíveis):
Uma janela de atendimento ao cliente de 24 horas será aberta (como de costume).
Se você responder dentro de 24 horas usando qualquer tipo de mensagem, a resposta será gratuita e uma janela de ponto de entrada gratuito (FEP, pelas iniciais em inglês) será aberta, com início a partir do momento da sua resposta.
As janelas de FEP permanecem abertas por 72 horas. Enquanto estiver aberta, você poderá enviar qualquer tipo de mensagem ao usuário sem nenhum custo. No entanto, a janela de atendimento ao cliente é independente da FEP. Por isso, depois que a janela de atendimento ao cliente fechar, você só poderá enviar mensagens de modelo.
Outros tópicos sobre preços
Novo recurso de preço máximo na API de Mensagens de Marketing para o WhatsApp
A partir de 2026, as empresas integradas à API de Mensagens de Marketing para o WhatsApp poderão definir um preço máximo por entrega de mensagem de marketing. Quando um preço máximo for definido, a Meta cobrará esse valor ou um valor menor pela entrega.
Nova política de preços para Provedores de IA que usam a Plataforma do WhatsApp Business
Clique neste link para saber mais sobre nossa nova política de preços para "Provedores de IA" que usam a Plataforma do WhatsApp Business, em vigor a partir de 16 de fevereiro de 2026 e atualizada em 12 de maio de 2026.
Preços da API de Ligações Comerciais do WhatsApp
A API de Ligações Comerciais do WhatsApp tem preços diferentes. Veja nosso documento de preços da API de Ligações para saber mais.
Preços baseados em conversa
Os preços baseados em conversa estão obsoletos. Ele foi substituído pelo modelo de preços por mensagem em 1º de julho de 2025.
Análise
Use o campo pricing_analytics para gerar detalhamentos de preços por mensagem e informações sobre níveis para mensagens entregues.
Webhooks
As mensagens faturáveis ​​têm type definido como regular no objeto pricing dos webhooks de mensagens de status:
"pricing": {
  "billable": true,
  "pricing_model": "PMP",
  "type": "regular",
  "category": "<PRICING_CATEGORY>"
}
A <PRICING_CATEGORY> indica qual taxa foi aplicada (por exemplo, marketing). Consulte a referência do webhook de mensagens de status para ver uma lista de valores possíveis.
No momento, não incluímos informações sobre níveis em nenhum webhook. Use o campo pricing_analytics para gerar informações sobre os níveis de mensagens entregues.
Cobrança
As cobranças e ações relacionadas são gerenciadas pelo Meta Business Suite. Consulte Sobre a cobrança da sua conta do WhatsApp Business⁠ para saber mais.
Você achou esta página útil?