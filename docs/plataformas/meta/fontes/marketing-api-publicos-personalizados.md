---
titulo: "Marketing API — públicos personalizados (custom audiences)"
url: https://developers.facebook.com/documentation/ads-commerce/marketing-api/audiences/guides/custom-audiences
capturado_em: 2026-09-10
hash: 226f3b476069f270
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Públicos personalizados de arquivos de clientes
Updated: 14 de jul de 2026
Copiar para LLM
Ver como Markdown
Os anúncios no Status do WhatsApp são disponibilizados por meio da API de Marketing. Saiba mais sobre anúncios no Status do WhatsApp.
A partir de 2 de setembro de 2025, começaremos a implementar restrições mais proativas sobre públicos personalizados que possam sugerir informações não permitidas de acordo com nossos termos. Por exemplo, qualquer público personalizado ou semelhante que sugira condições de saúde específicas (como "artrite", "diabetes") ou situação financeira (como "pontuação de crédito", "alta renda") será sinalizado e impedido de ser usado para veicular campanhas publicitárias.
Como essas restrições afetam suas campanhas:
Você não poderá usar públicos personalizados sinalizados ao criar novas campanhas.
Se você tiver uma campanha ativa usando públicos personalizados sinalizados, edite-a ou pause-a e escolha um público diferente para evitar problemas de desempenho e veiculação.
Para desenvolvedores da API:
A partir de 2 de setembro de 2025, operation_status retornará 471 para indicar que um público personalizado foi sinalizado.
Saiba mais⁠ sobre essa atualização e veja como resolver públicos personalizados que foram sinalizados.
A API de Marketing permite criar públicos personalizados com base em informações do cliente. Isso inclui endereços de email, telefones, nomes, datas de nascimento, gênero, localizações, números de identificação do usuário do app, números de identificação do usuário no escopo da Página, Identificador de Anunciante da Apple (IDFA, pelas iniciais em inglês) ou ID de publicidade do Android⁠.
Como proprietário dos dados da sua empresa, você é responsável pela criação e pelo gerenciamento desses dados. Isso inclui as informações dos sistemas de gestão do relacionamento com o cliente (CRM). Para criar públicos, é necessário compartilhar seus dados em um formato com hash, de modo a manter a privacidade. Consulte Como fazer hashing e normalizar dados. A Meta os compara aos nossos dados com hash para verificar se você deve adicionar alguém que está no Facebook ao público do seu anúncio.
Você pode adicionar um número ilimitado de registros a um público, com o máximo de 10 mil por vez. As alterações nos públicos personalizados não são aplicadas de maneira automática. Geralmente, isso demora até 24 horas. O número de registros que você solicita remover ou o número de públicos personalizados na sua conta aumentará o tempo necessário para processar a solicitação.
Para melhorar a forma como os anunciantes criam e gerenciam públicos, os públicos personalizados de arquivo de cliente que não são usados em nenhum conjunto de anúncios ativo por mais de dois anos são sinalizados para exclusão periodicamente. Forneça instruções para que possamos realizar as ações necessárias. Assim que um público for sinalizado e movido para o estágio "Público prestes a expirar", você poderá usá-lo em um conjunto de anúncios ativos, e isso será entendido como uma instrução para que ele seja retido. Caso você decida não usar o público, isso será considerado uma instrução para que ele seja excluído. Para saber mais, consulte a documentação Visão geral dos públicos personalizados.
Caso você compartilhe eventos de conversão por meio da API de Conversões, será possível criar um público personalizado do site sem precisar carregar dados adicionais. No entanto, ainda será possível carregar informações compatíveis para criar um público personalizado de arquivos de clientes.
Crie um Público Personalizado
Etapa 1: criar um Público Personalizado vazio
Especifique subtype=CUSTOM e customer_file_source na sua chamada de API.
curl -X POST \
  -F 'name="My new Custom Audience"' \
  -F 'subtype="CUSTOM"' \
  -F 'description="People who purchased on my website"' \
  -F 'customer_file_source="USER_PROVIDED_ONLY"' \
  -F 'audience_labels=["HIGH_VALUE_CUSTOMERS"]' \
  -F 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>/customaudiences
Parâmetros
Nome	Descrição

customer_file_source
string de enumeração
	
Descreve como as informações dos clientes no seu público personalizado foram originalmente coletadas.
Valores:
USER_PROVIDED_ONLY
Os anunciantes coletaram informações diretamente de clientes.
PARTNER_PROVIDED_ONLY
Os anunciantes extraíram informações diretamente de parceiros (como agências ou provedores de dados).
BOTH_USER_AND_PARTNER_PROVIDED
Os anunciantes coletaram informações diretamente de clientes, além de extraí-las de parceiros (por exemplo, agências).

name
string
	
Nome do público personalizado

description
string
	
Descrição do público personalizado

subtype
string
	
Tipo de público personalizado

audience_labels
string
	
Escolha um rótulo que descreva o público. Os rótulos podem ser usados para encontrar públicos para seus anúncios de forma mais eficaz. Sobre os rótulos de público.⁠
Públicos engajados:
QUALIFIED_LEADS: leads que atendem aos seus critérios de qualificação.
DISQUALIFIED_LEADS – leads que não atendem aos seus critérios de qualificação.
APP_USERS – pessoas que usam seu app.
TRIAL_USERS: pessoas que iniciaram um teste do seu produto.
ENGAGED_USERS – pessoas que demonstraram interesse, mas não são clientes.
Clientes:
HIGH_VALUE_CUSTOMERS: clientes que você considera valiosos para sua empresa.
LOW_VALUE_CUSTOMERS: clientes que têm valor baixo ou negativo para sua empresa.
AT_RISK: clientes que estão demonstrando sinais de desengajamento ou abandono.
DISENGAGED: clientes que não fizeram uma compra recentemente ou que deixaram de assinar.
GENERAL_CUSTOMERS – seus clientes existentes.
Etapa 2: especificar uma lista de usuários
Use uma chamada de API POST ao ponto de extremidade /{audience_id}/users para especificar a lista de usuários que você quer adicionar ao Público Personalizado.
Parâmetros
Nome	Descrição

session
objeto JSON
	
Obrigatório.
Use o parâmetro session para rastrear o carregamento de um lote específico de usuários.
Se você tiver um carregamento com mais de 10 mil usuários, será preciso dividi-lo em lotes separados, já que esse é o número máximo por solicitação.
Exemplo
{
  "session_id":9778993,
  "batch_seq":10,
  "last_batch_flag":true,
  "estimated_num_total":99996
}

payload
objeto JSON
	
Obrigatório.
Inclui schema e data.
Exemplo
{
  "schema":"EMAIL_SHA256",
  "data":
    [
      ["<HASHED_DATA>"],
      ["<HASHED_DATA>"],
      ["<HASHED_DATA>"]
    ]
}
Opções de processamento de dados para usuários dos EUA
Se você quiser habilitar o Uso Limitado de Dados para pessoas na Califórnia por meio de públicos personalizados de lista de clientes a partir de 1º de junho de 2023, carregue novos públicos ou atualize os existentes com a sinalização de Uso Limitado de Dados. Atualize e mantenha os status de Uso Limitado de Dados dos seus públicos e das pessoas, conforme necessário.
Uma sinalização de Uso Limitado de Dados aplicada a um usuário em um público não será transferida automaticamente para públicos diferentes. Da mesma forma que os anunciantes devem gerenciar cada um dos públicos personalizados de lista de clientes separadamente pelos critérios selecionados, a sinalização de Uso Limitado de Dados precisa ser aplicada de modo específico a cada público usado para publicidade.
Para NÃO habilitar o LDU de forma explícita para o registro, você pode enviar uma matriz de data_processing_options vazia ou remover o campo na carga. Exemplo de uma matriz vazia:
{
   "payload": {
       "schema": [
           "EMAIL",
                    "DATA_PROCESSING_OPTIONS"
       ],
       "data": [
           [
               "<HASHED_DATA>
",
                           []
           ]
       ]
   }
}
Para habilitar o LDU de forma explícita e fazer com que a Meta realize a geolocalização (ao não incluir o estado nem o país do registro), especifique uma matriz contendo LDU para cada registro:
{
   "payload": {
       "schema": [
           "EMAIL",
                    "DATA_PROCESSING_OPTIONS"
       ],
       "data": [
           [
               "<HASHED_DATA>
",
                           ["LDU"]
           ]
       ]
   }
}
Para habilitar o Uso Limitado de Dados e especificar manualmente a localização:
{
    "customer_consent": true,
    "payload": {
        "schema": [
            "EMAIL",
            "DATA_PROCESSING_OPTIONS",
            "DATA_PROCESSING_OPTIONS_COUNTRY",
            "DATA_PROCESSING_OPTIONS_STATE"
        ],
        "data": [
            [
                "<HASHED_DATA>",
                ["LDU"],
                1,
                1000
            ]
        ]
    }
}
Campos session
Nome	Descrição

session_id
número inteiro positivo de 64 bits
	
Obrigatório.
Identificador usado para rastrear a sessão. Esse número precisa ser gerado pelo anunciante e exclusivo para determinada conta de anúncios.

batch_seq
número inteiro positivo
	
Obrigatório.
O número para identificar a solicitação listada na sessão atual. Ele precisa ser sequencial e começar com 1.

last_batch_flag
boolean
	
Obrigatório.
Indica aos nossos sistemas que foram fornecidos todos os lotes para a sessão de substituição em andamento. Quando for definido como true, isso significa que a solicitação atual é a última, e não serão aceitos mais lotes na sessão. Caso a sinalização não seja enviada, encerraremos a sessão automaticamente 90 minutos após o recebimento do primeiro lote. Os lotes recebidos depois disso serão descartados. É necessário marcar a última solicitação para que a Meta saiba que o lote em questão é o último.

estimated_num_total
número inteiro
	
Opcional
O total estimado de usuários que serão carregados na sessão. Este campo é usado para melhorar o processamento da sessão.
Resposta
Se for bem-sucedida, a resposta incluirá um objeto JSON com os seguintes campos:
Nome	Descrição

audience_id
string numérica
	
Identificador do público

session_id
número inteiro
	
O ID da sessão informado por você

num_received
número inteiro
	
Número total de usuários recebidos nesta sessão até o momento

num_invalid_entries
número inteiro
	
O número de entradas enviadas com hash incorreto. As entradas enviadas com hashing incorreto não retornaram uma correspondência nem foram adicionadas ao público personalizado. Não é um número exato, mas representa a faixa de número dos usuários que não tiveram correspondência.

invalid_entry_samples
Matriz JSON de string ou mapa {string: string}
	
Até 100 exemplos de entradas inválidas na solicitação atual.
Saiba mais sobre como compartilhar seu público personalizado com objetos para empresas.
Códigos de erro
Veja a seguir os erros que podem ser recebidos quando você criar públicos personalizados.
Código de erro	Subcódigo de erro	Descrição	Resolução

1
	
	
Reduza a quantidade de dados que você está pedindo e tente novamente.
	
Isso está relacionado ao limite de dados que são retornados em uma resposta da API. Apesar de não haver um limite máximo específico, uma boa prática é usar o limite de 20 com paginação.

100
	
1713098
	
Formato JSON de regra inválido
	
Verifique se há problemas no formato e nos parâmetros JSON e tente fazer a chamada novamente.

200
	
1870050
	
Erro de permissões
	
Verifique se a conta de anúncios está vinculada à conta do Meta Business Suite.

200
	
1870090
	
Termos do público personalizado não aceitos
	
Siga as diretrizes dos Termos de Serviço para públicos personalizados, especificamente para empresas cuja conta atua em nome de uma conta de anúncios compartilhada. Para assinar os contratos da empresa original, o usuário deve mudar para uma conta de anúncios que não atue "em nome de" ou que seja de propriedade da empresa que precisa aceitar.
Remover membros de um público personalizado
Use uma chamada de API DELETE ao ponto de extremidade /{audience_id}/users para especificar a lista de usuários que você quer remover do público personalizado.
curl -X DELETE \
  --data-urlencode 'payload={
    "schema": "EMAIL_SHA256",
    "data": [
      "<HASHED_DATA>",
      "<HASHED_DATA>",
      "<HASHED_DATA>"
    ]
  }' \
  -d 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/<VERSION>/<CUSTOM_AUDIENCE_ID>/users
Outra possibilidade é adicionar o parâmetro method e defini-lo como DELETE na solicitação POST usada para adicionar membros do público.
Você pode remover pessoas de uma lista com EXTERN_ID, se disponível.
curl -X DELETE \
  --data-urlencode 'payload={
    "schema": "EXTERN_ID",
    "data": [
      "<ID>",
      "<ID>",
      "<ID>"
    ]
  }' \
  -d 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/<VERSION>/<CUSTOM_AUDIENCE_ID>/users
Você pode remover uma lista de pessoas de todos os públicos personalizados na conta de anúncios por meio desse ponto de extremidade.
Pode haver motivos para as informações não serem processadas. Por exemplo, se a conta de anúncios não pertencer a um portfólio empresarial, se você não tiver aceitado os Termos de Público personalizado⁠ ou se as informações não corresponderem a um usuário.
Para remover uma conta da Central de Contas, inclua os mesmos campos necessários na atualização de usuário e faça uma chamada HTTP DELETE a:
https://graph.facebook.com/<API_VERSION>/act_<AD_ACCOUNT_ID>/usersofanyaudience
Correspondência com várias chaves
Para aumentar a taxa de correspondência dos seus registros, forneça diversas chaves em uma matriz de chaves individuais, por exemplo, [EXTERN_ID, LN, FN, EMAIL]. Embora não seja necessário aplicar hash a EXTERN_ID, esse processo deverá ser feito com todas as informações de identificação pessoal, como emails e nomes. Consulte Hashing e normalização para várias chaves para ver mais informações.
Você pode fornecer algumas chaves ou todas elas para um registro.
Adicionar usuários com correspondências de várias chaves
curl \
  -F 'payload={
    "schema": [
      "FN",
      "LN",
      "EMAIL"
    ],
    "data": [
      [
        "<HASH>",
        "<HASH>",
        "<HASH>"
      ],
      [
        "<HASH>",
        "<HASH>",
        "<HASH>"
      ]
    ]
  }' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/<VERSION>/<CUSTOM_AUDIENCE_ID>/users
Uso de PAGEUID
Se você usar a chave PAGEUID, será necessário incluir uma lista de identificações de Página. Você pode nos enviar somente um PAGEUID, que deve ser uma matriz com um elemento.
curl -X POST \
  -F 'payload={
       "schema": [
         "PAGEUID"
       ],
       "is_raw": "true",
       "page_ids": [
            "<PAGE_IDs>"
            ],
       "data": [
         [
           "<HASH>",
           "<ID>",
           "<ID>",
           "<VALUE>"
         ],
         [
           "<HASH>",
           "<ID>",
           "<ID>",
           "<VALUE>"
         ],
         [
           "<HASH>",
           "<ID>",
           "<ID>",
           "<VALUE>"
         ]
       ]
     }' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/<VERSION>/<CUSTOM_AUDIENCE_ID>/users
Hashing e normalização para várias chaves
É necessário aplicar hash aos dados como SHA256. Não aceitamos outros mecanismos de hashing. Isso é obrigatório para todos os dados, exceto Identificadores Externos, IDs dos usuários do app, IDs dos usuários no escopo da Página e identificações dos anunciantes da plataforma móvel.
Antes de aplicar hash, normalize seus dados para que possamos lidar com eles. Apenas Nome (FN) e Sobrenome (LN) aceitam caracteres especiais e alfabetos não romanos. Para melhores resultados de correspondência, forneça a transliteração no alfabeto romano sem caracteres especiais.
Baixe este arquivo CSV para obter exemplos de dados com hash adequadamente normalizados e convertidos para os parâmetros abaixo.

Baixar (Clique com o botão direito do mouse > Salvar link como)
Chave	Diretrizes

EMAIL
critérios: endereços de email
	
Hashing obrigatório.
Remova os espaços em branco à esquerda e à direita da string e converta todos os caracteres para letras minúsculas.

PHONE
critérios: números de telefone
	
Hashing obrigatório.
Remova símbolos, letras e zeros à esquerda. Adicione o código do país como prefixo caso o campo COUNTRY não esteja especificado.

GEN
Critérios: gênero
	
Hashing obrigatório.
Use os seguintes valores: m para masculino, f para feminino.

DOBY
critérios: ano de nascimento
	
Hashing obrigatório.
Use o formato AAAA, que vai de 1900 até o ano atual.

DOBM
critérios: mês de nascimento
	
Hashing obrigatório.
Use o formato MM: 01 para 12.

DOBD
critérios: aniversário
	
Hashing obrigatório.
Use o formato DD: 01 para 31.

LN e FN
critérios: nome e sobrenome
	
Hashing obrigatório.
Use apenas a-z. Apenas minúsculas, sem pontuação. Caracteres especiais no formato UTF-8.

FI
critérios: inicial do nome
	
Hashing obrigatório.
Use apenas a-z. Apenas minúsculas. Caracteres especiais no formato UTF-8.

ST
critérios: estados dos EUA
	
Hashing obrigatório.
Use o código de abreviação ANSI de dois caracteres 2, em minúsculas⁠. Padronize os estados fora dos EUA em minúsculas sem pontuação, caracteres especiais nem espaços em branco.

CT
critérios: cidade
	
Hashing obrigatório.
Use apenas a-z. Apenas minúsculas sem pontuação, caracteres especiais nem espaços em branco.

ZIP
critérios: código postal
	
Hashing obrigatório.
Use letras minúsculas e não inclua espaços em branco. Para os EUA, use apenas os 5 primeiros dígitos. Para o Reino Unido, use o formato área/distrito/setor.

COUNTRY
critérios: código do país
	
Hashing obrigatório.
Em minúsculas, use os códigos de país de duas letras no padrão ISO 3166-1 alfa-2⁠.

MADID
critérios: identificação do anunciante da plataforma móvel
	
Não converter em hash
Use apenas letras minúsculas e mantenha os hifens.
Uso de hash
Forneça valores SHA256 para as chaves normalizadas e representações HEX desse valor em letras minúsculas de A a F. A função hash em PHP converte emails e telefones normalizados.
Exemplo	Resultado

hash("sha256", "mary@example.com")
	
f1904cf1a9d73a55fa5de0ac823c4403ded71afd4c3248d00bdcd0866552bb79

hash("sha256", "15559876543")
	
1ef970831d7963307784fa8688e8fce101a15685d62aa765fed23f3a2c576a4e
Identificadores externos
Você pode fazer a correspondência de pessoas para um público com os próprios identificadores, conhecidos como Identificadores Externos (EXTERN_ID). Pode ser qualquer identificação única do anunciante, como IDs de membro de programa de fidelidade, IDs dos usuários e IDs de cookies externos.
Embora não seja necessário aplicar hash à identificação, esse processo deverá ser feito com todas as informações de identificação pessoal (PII) enviadas com os EXTERN_IDs.
Para melhorar a correspondência, use exatamente o mesmo formato ao enviar os IDs. Por exemplo, se escolher aplicar hash usando SHA256, use o mesmo valor com hash.
Você pode usar esses IDs como chaves pessoais para criar públicos personalizados ou excluir pessoas deles. Dessa forma, não será necessário carregar novamente outras chaves correspondentes. Se você marcar alguém com informações pessoais convertidas em hash e EXTERN_ID, o EXTERN_ID terá prioridade menor na correspondência com pessoas no Facebook.
O período de retenção de dados de EXTERN_ID é de 90 dias.
É possível reutilizar o mapeamento de EXTERN_ID para gerar públicos personalizados a partir de arquivos de clientes em uma mesma conta de anúncios.
Se você tiver um público com campos EXTERN_ID na sua conta de anúncios, crie um novo público somente com esses identificadores.
curl \
  -F 'payload={"schema":"EXTERN_ID","data":["<ID>","<ID>"]}' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/<VERSION>/<CUSTOM_AUDIENCE_ID>/users
Você também pode adicionar pessoas com marcações de EXTERN_ID e correspondência com várias chaves.
curl \
  -F 'payload={
    "schema": [
      "EXTERN_ID",
      "FN",
      "EMAIL",
      "LN"
    ],
    "data": [
      [
        "<ID>",
        "<HASH>",
        "<HASH>",
        "<HASH>"
      ],
      [
        "<ID>",
        "<HASH>",
        "<HASH>",
        "<HASH>"
      ],
      [
        "<ID>",
        "<HASH>",
        "<HASH>",
        "<HASH>"
      ]
    ]
  }' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/<VERSION>/<CUSTOM_AUDIENCE_ID>/users
Aceitamos parâmetros EXTERN_ID para contas de anúncios individuais. Não é possível usar valores de uma conta de anúncios em outras, mesmo que elas pertençam à mesma entidade.
API de substituição de usuários
O ponto de extremidade /<CUSTOM_AUDIENCE_ID>/usersreplace permite que você realize duas ações com uma chamada de API:
Remover completamente os usuários existentes de um público específico.
Substituí-los por um novo conjunto de usuários.
Com o ponto de extremidade /<CUSTOM_AUDIENCE_ID>/usersreplace, você pode excluir automaticamente todos os usuários existentes, em vez de carregar uma lista dos usuários que deseja remover. Esse ponto de extremidade não redefinirá a fase de aprendizado⁠ do seu conjunto de anúncios quando um público estiver em conjuntos ativos, ao contrário das chamadas de API POST ou DELETE ao ponto de extremidade /<CUSTOM_AUDIENCE_ID>/users.
A API de Substituição de Usuários funciona apenas com públicos que atendem aos requisitos a seguir:
O número de usuários no local antes da execução do processo de substituição deve ser menor que 100 milhões. Se o público for maior que esse valor, sugerimos usar o ponto de extremidade /<CUSTOM_AUDIENCE_ID>/users para adicionar e remover usuários.
O subtipo deve ser definido como CUSTOM.
Não é possível substituir um público personalizado de arquivo de cliente baseado em valor por outro que não tenha como base um valor e vice-versa.
Começar
Antes de iniciar o processo de substituição, faça o seguinte:
Verifique se o operation_status do público é Normal.
Não é possível executar mais de uma operação de substituição ao mesmo tempo.
Não adicione nem remova usuários usando /<CUSTOM_AUDIENCE_ID>/users durante uma operação de substituição por meio de /<CUSTOM_AUDIENCE_ID>/usersreplace. Caso tente fazer uma segunda operação de substituição antes que a primeira seja concluída, você receberá uma mensagem indicando que já existe uma operação em andamento.
A janela de duração máxima de uma sessão de substituição é de 90 minutos. A API rejeitará os lotes da sessão recebidos após esse período. Se for necessário enviar lotes durante mais de 90 minutos, recomendamos esperar até que a operação de substituição da sessão tenha sido finalizada e, depois, usar a operação de adição do ponto de extremidade /<CUSTOM_AUDIENCE>/users para os carregamentos restantes.
Ao usar carregamentos em lote com IDs de sessão, o esquema definido no primeiro lote deve ser mantido de forma consistente em todos os lotes subsequentes da sessão. Alterar o esquema no meio da sessão resultará em erros.
Assim que seu público estiver pronto, especifique a lista de usuários que você quer substituir pelo público personalizado por meio de uma chamada POST a /<CUSTOM_AUDIENCE_ID>/usersreplace.
Após iniciar o processo de substituição, o operation_status do seu público mudará para replace_in_progress.
Caso a operação de substituição não tenha sido concluída, o operation_status do público mudará para replace_error.
O retorno de um operation_status no valor 471 indica que o público personalizado foi sinalizado por motivos de integridade.
Exemplo de solicitação
curl POST \
  --data '{
    "session": {
      "session_id":9778993,
      "batch_seq":10,
      "last_batch_flag":true,
      "estimated_num_total":99996
    },
    "payload": {
      "schema": ["EMAIL","DATA_PROCESSING_OPTIONS"],
      "data": [
        ["<HASHED_DATA>"], ["<HASHED_DATA>"]
      ]
    },
  }'
https://graph.facebook.com/v26.0/<CUSTOM_AUDIENCE_ID>/usersreplace?access_token=<ACCESS_TOKEN>
Parâmetros de chamada
Os seguintes parâmetros podem ser incluídos na sua chamada POST a /<CUSTOM_AUDIENCE_ID>/usersreplace:
Nome	Descrição

session
Objeto JSON
	
Obrigatório.
Usado para rastrear o carregamento de um lote específico de usuários. É necessário incluir um ID de sessão e informações do lote. Consulte Campos de sessão.
Você pode adicionar até 10 mil pessoas a um público por vez. Caso queira adicionar mais que isso, divida a sessão em vários lotes com um ID de sessão.
Exemplo:
{
  'session_id':9778993,
  'batch_seq':10,
  'last_batch_flag':true,
  'estimated_num_total':99996
}

payload
Objeto JSON
	
Obrigatório.
Usado para fornecer as informações que você quer carregar no público. Precisa incluir schema e data. Consulte Campos de carga para saber mais.
Exemplo:
{
  "schema":"EMAIL",
  "data":[
    ["<HASHED_EMAIL>"],
    ["<HASHED_EMAIL>"],
    ["<HASHED_EMAIL>"]
  ]
}
Campos de objeto de session
Nome	Descrição

session_id
número inteiro de 64 bits
	
Obrigatório.
Usado para rastrear a sessão. Você precisa gerar esse identificador, e o número deve ser único dentro da mesma conta de anúncios.

batch_seq
número inteiro
	
Obrigatório. Precisa começar em 1.
Uma nova sessão de substituição começa quando recebemos uma batch_seq de 1. Evite enviar lotes duplicados com uma sequência de 1 para determinado session_id.
É importante identificar o primeiro lote, pois os lotes restantes da sessão podem ser duplicatas ou outro número (com exceção de 1), usado para marcar o início da sessão). Todos os lotes não iniciais de uma sessão devem ser enviados após o primeiro. Considere o primeiro lote como gatilho/etapa prévia para a operação de substituição.

last_batch_flag
Booliano
	
Opcional.
Indica que foram fornecidos todos os lotes para a sessão de substituição em andamento. Quando for definido como true, não serão aceitos mais lotes na sessão. Caso a sinalização não seja definida, a sessão será encerrada automaticamente 90 minutos após o recebimento do primeiro lote. Os lotes recebidos depois disso serão descartados.

estimated_num_total
número inteiro
	
Opcional.
O total estimado de usuários que serão carregados na sessão. Usado pelo sistema para aprimorar o processamento de uma sessão.
Campos de objeto de payload
Nome	Descrição

schema
string ou matriz de string JSON
	
Obrigatório.
Especifique o tipo de informação que você fornecerá. Pode ser uma chave única ou várias chaves desta lista:
EMAIL
PHONE
GEN
DOBY
DOBM
DOBD
LN
FN
FI
CT
ST
ZIP
COUNTRY
MADID
["hash1", "hash2", ...]
Exemplo:
["PHONE", "LN", "FN", "ZIP", "DOBYM"]

data
matriz JSON
	
Obrigatório.
Lista de dados que correspondem ao esquema.
Exemplos:
Se o esquema for "EMAIL", os dados deverão ser uma lista de hashes sha256 de email.
Se o esquema for uma lista de hashes (como no último exemplo), os dados deverão ser como "phone_hash_value" e "LN_FN_ZIP_DOBYM".
Ao fazer a solicitação POST, você receberá uma resposta com os seguintes campos:
Nome	Descrição

account_id
número inteiro
	
O identificador da conta.

session_id
número inteiro
	
O ID da sessão fornecido anteriormente.

num_received
número inteiro
	
O total de usuários recebidos na sessão até o momento.

num_invalid_entries
número inteiro
	
O total de usuários com formato inválido ou que não puderam ser decodificados. Verifique novamente seus dados se esse número não for zero.

invalid_entry_samples
matriz de strings JSON
	
Até 100 exemplos de entradas inválidas na solicitação atual. Verifique seus dados novamente.
Erros comuns da API de substituição de usuários
Todos os erros retornados do ponto de extremidade /{custom-sudience-id}/usersreplace têm o código de erro 2650. Veja alguns dos subcódigos de erros mais comuns, além de orientações sobre como corrigir cada problema.
Subcódigo de erro	Descrição	O que fazer

1870145
	
Atualização de público em andamento
	
Não é possível substituir um público personalizado de lista de clientes que esteja em processo de atualização. Aguarde até que a disponibilidade do público seja "Normal" e tente novamente.

1870158
	
A sessão de substituição atingiu o tempo-limite
	
O limite de 90 minutos foi atingido para a sessão de substituição em lote. O público personalizado da lista de clientes será substituído pelo que foi carregado até o momento. Para fazer mais inclusões aos públicos personalizados, aguarde até que o processo de substituição seja finalizado e, depois, use a operação ADD.

1870147
	
Carregamento de lote inválido para substituição
	
O primeiro batch_seq não foi detectado. Você precisa iniciar o batch_seq com o número inteiro 1.

1870159
	
Sessão de substituição concluída
	
A operação de substituição foi concluída porque você carregou um lote com last_batch_flag==true. Para incluir lotes adicionais aos públicos personalizados, aguarde até que o processo de substituição seja finalizado e, depois, use a operação ADD.

1870148
	
Ocorreu um erro
	
A lista de clientes não foi completamente atualizada. Se o público tiver tamanho significativamente diferente do esperado, tente novamente.

1870144
	
Tamanho do público personalizado do arquivo de dados não compatível com substituição
	
Não é possível substituir o público de um cliente por uma lista com 100 milhões de clientes ou mais.
Atualizar rótulos para públicos compartilhados
Caso um público personalizado tenha sido compartilhado com sua conta de anúncios, você poderá definir e ler suas próprias etiquetas de público, independentemente das etiquetas do proprietário. Passe acting_account_id na solicitação para que as etiquetas sejam anexadas à sua conta, e não à do proprietário.
Adicionar ou editar uma etiqueta
Ponto de extremidade da API: POST /{custom-audience-id}
Exemplo: Se um público for compartilhado da conta A para a conta B e esta quiser definir uma etiqueta para esse público, passe a conta B como acting_account_id.
curl -X POST \
  -F 'audience_labels=["HIGH_VALUE_CUSTOMERS"]' \
  -F 'acting_account_id=<AD_ACCOUNT_ID>' \
  -F 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/<CUSTOM_AUDIENCE_ID>
Exemplo de resposta:
{
  "success": true
}
Parâmetros
Nome	Descrição

acting_account_id
int
	
Opcional. A conta de anúncios que atua no público personalizado. Forneça essa informação quando uma conta que não seja a proprietária (por exemplo, uma conta com a qual o público foi compartilhado) estiver atualizando a própria audience_labels no público. Se omitido, os rótulos serão gravados na conta proprietária, caso o usuário tenha todas as permissões de gravação.

audience_labels
matriz<string>
	
Veja o parâmetro audience_labels em Criar um público personalizado para conferir a lista completa de rótulos compatíveis.
Observação: É necessário garantir que o usuário tenha permissões de edição na conta de anúncios em uso. Caso contrário, a solicitação resultará em um erro de permissão.
Ler rótulos de público
Ponto de extremidade da API: GET /{custom-audience-id}
curl -G \
  -d 'fields=audience_labels' \
  -d 'acting_account_id=<AD_ACCOUNT_ID>' \
  -d 'access_token=<ACCESS_TOKEN>' \
https://graph.facebook.com/v26.0/<CUSTOM_AUDIENCE_ID>
Parâmetros
Nome	Descrição

acting_account_id
int
	
Opcional. A conta de anúncios agindo no público personalizado. Forneça essa informação quando uma conta que não seja a proprietária (por exemplo, uma conta com a qual o público foi compartilhado) estiver lendo a própria audience_labels no público. Se omitidas, as etiquetas serão lidas na conta proprietária, caso o usuário tenha todas as permissões de gravação.
Perguntas frequentes
Qual é o valor máximo recomendado de "limit" que deve ser usado no ponto de extremidade /customaudiences?
O campo limit representa o número máximo de objetos que podem ser retornados em uma chamada de API. Não há um valor máximo específico para o parâmetro limit ao consultar os pontos de extremidade do público personalizado.
No entanto, a boa prática é usar um limite de 20 com paginação. Consulte a documentação Resultados paginados para saber mais.
Quais são os limites quanto ao número de públicos personalizados que podemos ter em uma conta?
Estes são os limites para o número de públicos personalizados em uma conta:
Públicos personalizados de arquivo de dados padrão: 500
Públicos personalizados do seu site: 10.000
Públicos personalizados do app para celular: 200
Públicos semelhantes: 500
É necessário aplicar hash às identificações de anunciante da plataforma móvel (MADID)?
Não.
Existem restrições para um público com base na fonte do arquivo de clientes (ou seja, USER_PROVIDED_ONLY, PARTNER_PROVIDED_ONLY, BOTH_USER_AND_PARTNER_PROVIDED)?
Atualmente, não há restrições no campo customer_file_source ao criar um público personalizado usando a API de Marketing.
Como você resolve o erro “Termos do público personalizado não aceitos”?
O erro "Termos de público personalizado não aceitos" normalmente ocorre ao tentar criar ou usar um público personalizado na plataforma de publicidade da Meta sem aceitar os termos e condições necessários ou ao aceitar os termos e condições de uma conta de anúncios em nome de ou compartilhados com empresas diferentes.
Consulte o documento Termos de Serviço para públicos personalizados para obter mais informações sobre como aceitar os termos de serviço ao verificar os casos especiais de uso de contas de anúncios compartilhadas ou em nome de contas de anúncios.
Recursos
Você pode criar e direcionar ou compartilhar outros tipos de público:
Públicos personalizados do site – crie um público com base nas pessoas que visitaram uma página específica ou realizaram ações no site. Crie um público com base em dados do Pixel da Meta no seu site.
Públicos personalizados do app para celular – crie um público com base nas pessoas que usam seu app para celular. Gere um público com base em dados de eventos do app.
Públicos semelhantes – identifique pessoas que você já conhece e anuncie para usuários semelhantes no app do Facebook.
Públicos personalizados offline – crie um público com base nas pessoas que visitaram sua loja, ligaram para o atendimento ao cliente ou realizaram outras ações offline.
Públicos de engajamento com o Canvas — Crie um público com todas as pessoas que tiveram engajamento com seu Canvas.
Veja também
Público personalizado
Usuários de público personalizado
Sessões de público personalizado
Termos de Serviço para Públicos Personalizados
Você achou esta página útil?