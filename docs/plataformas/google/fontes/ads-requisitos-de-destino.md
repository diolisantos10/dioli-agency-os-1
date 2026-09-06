---
titulo: "Google Ads — requisitos de destino"
url: https://support.google.com/adspolicy/answer/6368661?hl=pt-BR
capturado_em: 2026-09-06
hash: ca423a00500be007
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Requisitos de destino

O Google oferece versões traduzidas da Central de Ajuda, mas elas não têm a intenção de alterar o conteúdo das nossas políticas. A versão em inglês é o idioma oficial que usamos para aplicar essas políticas. Se quiser ver este artigo em outra língua, confira o menu suspenso de idiomas na parte de baixo da página.

Os usuários do Display & Video 360 precisam obedecer a essa política do Google Ads. Acesse a Central de Ajuda do Display & Video 360 para conferir outras restrições.

 

Ative as legendas do YouTube no seu idioma. Clique no ícone Configurações  no player de vídeo, selecione Legendas/CC e escolha o idioma.

O Google prioriza a experiência do usuário em todos os produtos, e uma parte fundamental disso é promover um ambiente seguro e confiável na rede de publicidade do Google. A política sobre requisitos de destino garante que, quando os usuários clicam em um anúncio e são enviados para uma página de destino, o site seja funcional, útil e fácil de navegar. Isso também cria um ecossistema de publicidade que apoia os anunciantes e as pessoas que interagem com a marca deles por meio desses anúncios.

Violações dessa política não levarão à suspensão imediata da conta. Enviaremos uma notificação pelo menos 7 dias antes da suspensão. Saiba mais sobre as suspensões de contas do Google Ads.
Saiba o que acontece quando nossas políticas são violadas.
Neste artigo
Destino que não funciona
Destino não correspondente
Destino não rastreável
Não é possível acessar a página de destino
Experiência de destino
Conteúdo original insuficiente
Violação da política do app ou da loja on-line
URL inaceitável
App não reconhecido
Número de telefone não confirmado
Número de telefone inaceitável
Instruções para substituir o user agent com o Chrome DevTools
Destino que não funciona

O Google exige que o destino e o conteúdo dos anúncios funcionem com navegadores e dispositivos comuns para que os usuários sejam direcionados a um destino que funcione.

Os anúncios seriam reprovados devido a um destino que não funciona nos seguintes casos:

 Destinos que não funcionam da maneira adequada ou que foram configurados incorretamente

 Destinos que retornam um código de erro de HTTP globalmente para rastreadores da web do Google AdsBot em dispositivos comuns

Saiba mais sobre a política de destino que não funciona.

O Google exige que o destino e o conteúdo dos anúncios funcionem com os navegadores e dispositivos mais comuns para que os usuários sejam direcionados a um destino que funcione.

O destino do anúncio precisa funcionar com os rastreadores da Web do Google AdsBot e não pode retornar erros de destino (como um código de resposta de erro de HTTP) globalmente. O URL expandido que aparece na IU do Google Ads é o destino do seu anúncio. É o URL completo do anúncio, que combina o URL final com os modelos de acompanhamento e parâmetros relevantes.

Os usuários de campanhas inteligentes poderão escolher o Perfil da Empresa (otimizado para seu anúncio) deles como página de destino se o site não estiver funcionando.

Nestes cenários, os anúncios seriam reprovados devido a um destino que não funciona:

 Destinos que não funcionam da maneira adequada ou que foram configurados incorretamente

Exemplos: "Você acessou esta página por engano", "Ops! Não tem nada aqui!", "Site em construção"

 Destinos que retornam um código de erro de HTTP globalmente para rastreadores da Web do Google AdsBot em dispositivos comuns

Exemplos: um site que retorna um código de resposta de erro de servidor ou cliente HTTP "403 Proibido", "404 Não encontrado" ou "500 Erro interno do servidor" em navegadores e dispositivos comuns com base nos rastreadores da Web do Google AdsBot.

Ative as legendas do YouTube no seu idioma. Clique no ícone Configurações  no player de vídeo, selecione Legendas/CC e escolha o idioma.

Resolver problemas com seu destino

Para resolver problemas com seu destino, use os rastreadores da web do Google AdsBot e verifique se há erros de destino, como códigos de resposta de erro de HTTP.

Dica: o URL expandido mostrado na interface do Google Ads pode ser diferente do destino do seu anúncio.
O URL de visualização é o endereço da página da web que aparece com seu anúncio.
O URL final, também conhecido como página de destino, é o endereço da página do seu site que as pessoas acessam depois de clicar no anúncio.
O URL expandido combina o URL final com todos os parâmetros e modelos de acompanhamento relevantes. Se você não usa esses modelos, o URL expandido precisa ser idêntico ao URL final.
Verificar detalhes sobre o motivo da reprovação no Google Ads
Acesse Anúncios no menu Campanhas .
Na coluna "Status" do anúncio recusado, passe o cursor sobre o motivo da rejeição para ver mais detalhes.
Sobre o erro de destino

Consulte os erros de destino mais comuns na tabela abaixo para mais informações, causas comuns e exemplos. Saiba como os códigos de status HTTP e os erros de rede e de DNS afetam a Pesquisa Google.

Motivo da reprovação

	

Explicação

	

Causas comuns (alguns exemplos)

Resposta HTTP 4xx

	

O servidor que hospeda seu site retornou um erro de HTTP que impediu o Google Ads de acessar o conteúdo.

	

Se o URL fornecido estiver incorreto ou tiver um erro de digitação, o destino vai retornar um erro "Página não encontrada (404)" quando o Google AdsBot tentar acessá-lo.

Resposta HTTP 5xx

	

O servidor que hospeda seu site retornou um erro de HTTP que impediu o Google Ads de acessar o conteúdo.

	

O Google AdsBot teve um problema inesperado ao tentar acessar o servidor do seu destino e não conseguiu concluir a solicitação, mas ainda enviou uma resposta de erro de HTTP válida.

Erro de DNS

	

O Google Ads não conseguiu acessar seu destino porque o nome do host do servidor não pôde ser associado a um endereço IP.

	
As configurações do seu domínio não levam ao endereço IP correto do servidor.
Seu domínio da web não está registrado oficialmente ou expirou.
Um firewall no seu servidor ou na rede está impedindo que o Google Ads se conecte ao seu site.

URL de redirecionamento muito longo

	

O URL de redirecionamento fornecido pelo seu servidor é mais longo do que o permitido.

	

Seu sistema de gerenciamento de conteúdo (CMS, na sigla em inglês) pode estar criando URLs de redirecionamento com problemas, como informações redundantes adicionadas ao URL.

URL de redirecionamento vazio

	

O servidor sinalizou que existe um redirecionamento, mas não tem um URL de destino definido.

	

As regras de redirecionamento do seu servidor podem estar configuradas incorretamente.

URL de redirecionamento incorreto

	

O URL de redirecionamento retornado pelo seu servidor não é válido ou tem problemas que o tornam inacessível.

	

Seu URL de redirecionamento pode ter erros de digitação ou formatação incorreta.

IP privado

	

Seu site é protegido por um firewall ou roteador, então o Google Ads não conseguiu acessá-lo.

Resposta HTTP incorreta

	

Os dados que o servidor enviou ao navegador não seguem o formato exigido para o protocolo de transferência de hipertexto. As respostas HTTP têm um formato muito específico que inclui uma linha de status, um cabeçalho, linhas em branco e um corpo.

Se alguma parte dessa estrutura estiver incorreta, incompleta ou corrompida, o cliente (seu navegador) vai exibir a mensagem "Resposta HTTP incorreta".

	

Respostas HTTP incorretas podem ser causadas pelos seguintes problemas com seu servidor:

Um código do aplicativo no servidor falhou ou encontrou um erro não processado, o que fez ele enviar dados incompletos ou corrompidos.
O software do servidor da web gerou uma resposta com estrutura incorreta.
O servidor está com pouca memória ou não tem recursos suficientes para enviar uma resposta completa.

Tempo limite de leitura da página esgotado

	

O servidor demorou muito para enviar o conteúdo do seu site, então o Google Ads parou de esperar e retornou um erro.

O servidor redireciona com muita frequência

	

Seu servidor redirecionou o rastreamento várias vezes, causando um loop de redirecionamento. O Google Ads para de tentar seguir o loop e retorna um erro.

A página requer autenticação

	

O destino é protegido por uma tela de login, senha ou outro método de autenticação, então o Google Ads não conseguiu acessar o conteúdo.

Verificar se há problemas comuns de destino nos seus anúncios

Confira as seguintes informações no seu anúncio para identificar a causa do erro de destino.

URLs: verifique se os URLs da página de destino, de palavras-chave, de rastreamento dinâmico e de link direto estão corretos e não apresentam erros de digitação.
Sites e apps: verifique se o anúncio redireciona a um app ou site que retorna um código de resposta HTTP 200 globalmente. Mesmo que seu site ou app pareça estar funcionando como esperado, use navegadores e dispositivos comuns para testar problemas e verificar códigos de erro HTTP usando os rastreadores da web do Google AdsBot.
Segmentação por local: os apps só podem ser promovidos em locais onde estão disponíveis para download.
Solução de problemas específicos do formato do anúncio
Anúncios de engajamento no app
Verifique se o URL de link direto está configurado corretamente. Saiba mais sobre links diretos.
Rastreadores de terceiros não são compatíveis com anúncios de engajamento no app. Se você estiver usando um rastreador de terceiros, remova-o ou escolha outro tipo de campanha.
Anúncios de promoção de app
Verifique se os rastreadores de terceiros redirecionam o usuário à app store e ao aplicativo certos.
Como corrigir
Verifique o URL que você inseriu

O destino do anúncio precisa estar certo e não pode incluir erros de digitação.

Corrija o destino ou os erros de HTTP

O destino do anúncio não pode retornar erros de destino (como de HTTP) aos rastreadores da Web do Google AdsBot quando o rastreamento é feito. Se você não corrigir o erro de destino, informe ao seu desenvolvedor da Web que o app ou site não deve retornar erros de destino (como de HTTP) ao Google AdsBot quando o rastreamento é feito. Se preferir, use outro destino que não retorne erros de destino. Edite o URL final do anúncio para direcionar a outra parte do seu app ou site que não viole nossas políticas. Em seguida, salve o anúncio para fazermos a revisão dele novamente.

Contestar decisão relacionada à política

Se você corrigiu seu destino ou acredita que cometemos um engano, conteste a decisão relacionada à política na sua conta do Google Ads para pedir uma revisão. Após confirmarmos que o destino está funcionando, poderemos aprovar seus anúncios.

Se você não conseguir ou não quiser resolver essas violações, remova o anúncio para impedir que a conta seja suspensa por ter muitas reprovações.

Destino não correspondente

O Google exige que os anúncios representem corretamente qual app ou site o usuário vai acessar ao clicar nele.

Os anúncios seriam reprovados devido a um destino não correspondente nos seguintes casos:

 O domínio ou a extensão do domínio no URL de visualização não corresponde aos URLs finais ou para dispositivos móveis que os usuários acessam

 Não usar um subdomínio para identificar claramente um site do domínio pai ou de todos os outros sites hospedados no domínio em questão

 URL final que redireciona o usuário para outro domínio

 Modelo de acompanhamento ou URL expandido que não direciona para o mesmo conteúdo do URL final

Saiba mais sobre a política de destino não correspondente.

O Google Ads exige que seus anúncios representem corretamente qual app ou site o usuário vai acessar ao clicar neles.

Os anúncios seriam reprovados devido a um destino não correspondente nos seguintes casos:

 O domínio ou a extensão do domínio no URL de visualização não é igual aos URLs finais ou para dispositivos móveis que os usuários acessam.

Alguns exemplos:

URL de visualização google.com e URL final example.com
URL de visualização do anúncio example.com e URL final da palavra-chave example.org
Usar a inserção de palavra-chave no domínio de nível mais alto ou de segundo nível do seu URL de visualização, como "www.{keyword}.com"

 O subdomínio não distingue claramente um site de outros sites hospedados no mesmo domínio ou no domínio principal. Não é necessário ter um subdomínio se o domínio é usado exclusivamente por uma empresa.

Alguns exemplos:

URL de visualização:: blogspot.com
URL final: minhaempresa.blogspot.com

 URL final que redireciona o usuário para outro domínio

Alguns exemplos: o URL final http://example.com redireciona para http://example2.com

Observação: redirecionamentos do URL final que levam o usuário a um domínio diferente são permitidos em algumas circunstâncias, com aprovação prévia. Por exemplo, fabricantes de bens de consumo não duráveis talvez queiram redirecionar os usuários para uma lista pré-aprovada de destinos de varejistas onde o produto anunciado está disponível para compra.

 O modelo de acompanhamento ou o URL expandido não levam ao mesmo conteúdo que o URL final.

Alguns exemplos:

O URL final direciona a uma página de categoria do produto, e o modelo de acompanhamento ou o URL expandido, à página de um item específico

URL final: example.com/roupas
URL do modelo de acompanhamento: example.com/roupas/camisas

Observação: o URL de visualização precisa representar corretamente o destino, e o URL final não pode redirecionar o usuário a outro domínio. Garanta também que o URL expandido redirecione ao URL final.

Dica: um parâmetro de acompanhamento no URL final pode causar um destino não correspondente, caso "{ignore}" não esteja inserido antes desse parâmetro. Se você usa o acompanhamento no seu URL final, incluindo o ID dinâmico de um sistema de acompanhamento externo, insira {ignore} antes desse parâmetro no URL final.
Exemplo: http://example.com/?{ignore}tracking=123&id=DynamicId

Nestes cenários, os anúncios seriam reprovados devido a um destino não correspondente:

 O domínio ou a extensão do domínio no URL de visualização não corresponde aos URLs finais ou para dispositivos móveis que os usuários acessam.

Exemplos: URL de visualização "google.com" e URL final "example.com"; URL de visualização do anúncio "example.com" e URL final da palavra-chave "example.org"; usar a inserção de palavra-chave no domínio de nível superior ou de segundo nível do seu URL de visualização, como "www.{keyword}.com"

 Não usar um subdomínio para identificar claramente um site do domínio pai ou de todos os outros sites hospedados no domínio em questão

Exemplo: URL de visualização "blogspot.com" e URL final "minhaempresa.blogspot.com"

Observação: não é necessário ter um subdomínio se o domínio é usado exclusivamente por uma empresa.

 URL final que redireciona o usuário para um domínio diferente

Exemplo: o URL final "http://example.com" redireciona para "http://example2.com"

 Modelo de acompanhamento ou URL expandido que não direciona para o mesmo conteúdo do URL final

Exemplos: o URL final direciona a uma página de categoria do produto, e o modelo de acompanhamento ou o URL expandido, à página de um item específico; URL final "example.com/roupas", mas o modelo de acompanhamento redireciona para "example.com/roupas/camisas"
Por que seu anúncio foi reprovado
Como corrigir
Corrija o destino não correspondente

O URL de visualização precisa representar corretamente o destino, e não deve haver redirecionamentos do URL final que levam o usuário a outro domínio. Confira o e-mail de reprovação ou passe o cursor sobre o anúncio para saber qual era o domínio da publicidade durante a revisão. Você também pode usar o Search Console para verificar a página de destino do seu URL e saber se o domínio é o mesmo do seu URL de visualização. Essa política se aplica a URLs de palavras-chave que não correspondem ao URL de visualização. Saiba como editar URLs de palavras-chave. Se você usa modelos de acompanhamento, esse modelo e o URL expandido precisam redirecionar ao mesmo conteúdo do URL final.

As mudanças nos modelos de acompanhamento no anúncio, na palavra-chave ou no sitelink serão automaticamente revisadas. No entanto, se você criou o modelo para um grupo de anúncios inteiro ou uma campanha ou conta inteira, peça uma revisão após corrigir o modelo.

Edite seus URLs para que eles obedeçam à política. Depois de editar e salvar seu anúncio, ele será enviado para revisão. Após confirmarmos que os destinos estão em conformidade, poderemos aprovar seus anúncios.

Contestar decisão relacionada à política

Se você corrigiu seu destino ou acredita que cometemos um engano, conteste a decisão relacionada à política na sua conta do Google Ads para pedir uma revisão. Após confirmarmos que o destino está em compliance, poderemos aprovar seus anúncios.

Se você não conseguir ou não quiser resolver essas violações, remova o anúncio para impedir que a conta seja suspensa por ter muitas reprovações.

Destino não rastreável

O Google exige que o destino e o conteúdo dos anúncios possam ser acompanhados pelos rastreadores da web do Google AdsBot, garantindo que os usuários sejam redirecionados a um destino associado ao anúncio em que clicaram.

Os anúncios seriam reprovados devido a um destino não rastreável nos seguintes casos:

 Destinos que não são rastreáveis pelo Google Ads

Saiba mais sobre a política de destino não rastreável.

O Google exige que o destino e o conteúdo dos anúncios possam ser acompanhados pelos rastreadores da Web do Google AdsBot, garantindo que os usuários sejam redirecionados a um destino associado ao anúncio em que clicaram.

O Google exige que o destino e o conteúdo dos anúncios possam ser acompanhados pelos rastreadores da web do Google AdsBot para verificar se os usuários são direcionados a um destino relevante para o anúncio em que clicaram. Para garantir que o Google possa rastrear seu site de maneira eficaz, use uma estrutura de URL que siga as práticas recomendadas de estrutura de URL para a Pesquisa Google.

Os anúncios seriam reprovados devido a um destino não rastreável nos seguintes casos:

 Destinos que não são rastreáveis pelo Google Ads

Alguns exemplos:

Uso de arquivos de exclusão, como "robots.txt", para restringir o acesso à maior parte ou à totalidade de um site
Uso de configurações do site que permitem menos rastreamento do que o necessário para o número de anúncios que você está veiculando

Observação: se você não está bloqueando o rastreamento do seu conteúdo pelo Google Ads, é possível que esteja limitando os rastreamentos eficazes sem querer. Esse cenário é bastante provável se você enviou um grande volume de anúncios para o Google recentemente. Caso você use um rastreador de cliques nos seus anúncios, verifique se isso está afetando a capacidade de rastreamento. Se o site não tiver uma capacidade de rastreamento adequada, envie os anúncios em lotes menores e com um intervalo de alguns dias entre eles.

Como corrigir
Permita que os rastreadores da Web do Google AdsBot acessem seus destinos de anúncio

Verifique as configurações do app ou site para garantir que você não está limitando a capacidade do Google Ads de rastrear seu conteúdo devido ao uso de arquivos de exclusão (como "robots.txt").

O que é um arquivo robots.txt?

Não use arquivos de exclusão (como "robots.txt") para restringir o acesso ao site inteiro ou à maior parte dele. Também é possível utilizar o Google Search Console para saber como tornar as páginas acessíveis e verificar se há erros de rastreamento ou se você definiu uma taxa de rastreamento baixa. Caso você use um rastreador de cliques nos seus anúncios, verifique se isso está afetando a capacidade de rastreamento. Se não conseguir resolver o problema, peça para seu desenvolvedor da Web tornar o app ou site acessível pelos rastreadores da Web do Google AdsBot.

Se você corrigiu seu destino ou acredita que cometemos um engano, conteste a decisão relacionada à política na sua conta do Google Ads para pedir uma revisão. Após confirmarmos que o destino está em conformidade, poderemos aprovar seus anúncios.

Escolha outro destino

Se preferir, use outro destino que esteja em conformidade. Edite o URL final do anúncio para direcionar a outra parte do seu app ou site que não viole nossas políticas. Em seguida, salve o anúncio para fazermos a revisão dele novamente.

Se você não conseguir ou não quiser resolver essas violações, remova o anúncio para impedir que a conta seja suspensa por ter muitas reprovações.

O Google exige que os anúncios possam ser acessados na região de segmentação, ou seja, a página de destino precisa ser rastreável pelo Google AdsBot.

No caso abaixo, os anúncios seriam reprovados porque não é possível acessar a página de destino:

 A página de destino usada no seu anúncio não pode ser acessada na região de segmentação ou o Google AdsBot não consegue rastrear sua página de destino.

Alguns exemplos:

Sites que mostram uma mensagem de limitação de acesso na região de segmentação, como "Não é possível acessar este site no seu local".
Sites que mostram mensagens relacionadas a limitações de acesso na região de segmentação, como "Você não tem permissão para acessar esta página".
Páginas de destino que retornam erros HTTP, como 404 (não encontrado) ou 403 (proibido), quando o Google AdsBot tenta rastreá-las.
Páginas de destino que não podem ser rastreadas pelo Google AdsBot porque há uma proibição no arquivo robots.txt.
Configurações do lado do servidor que impedem o Google AdsBot de acessar a página de destino.
Experiência de destino

O Google exige que os destinos dos anúncios sejam fáceis de navegar e seguros para quem clica neles na rede de publicidade do Google.

Os anúncios são reprovados devido à experiência de destino nos seguintes casos:

 Destinos ou conteúdo de navegação desnecessariamente difícil ou frustrante

 Links que iniciam um download direto pelo anúncio ou que direcionam a um endereço de e-mail ou arquivo

 Destinos com experiências abusivas

 Destinos com experiências de anúncios inadequadas de acordo com os Better Ads Standards (em inglês). Para mais informações sobre os tipos de experiências não permitidos, acesse o site do Coalition for Better Ads (em inglês).

Saiba mais sobre a política de experiência de destino.

Os destinos ou o conteúdo dos anúncios (incluindo pop-ups) não podem ser difíceis de navegar nem conter experiências abusivas (por exemplo, sites enganosos). Além disso, o destino não pode iniciar diretamente um download ou redirecionar para um endereço de e-mail ou arquivo (consulte a lista abaixo).

Observação: consideramos pop-up qualquer janela aberta além da janela original da página de destino, independente do conteúdo. Confira alguns exemplos:
Pop-ups com tempo determinado
Pop-ups que fecham sozinhos
Pop-ups intermitentes
Pop-ups que o próprio anúncio gera
Pop-ups de download
Pop-unders

Permitimos intersticiais, desde que eles não impeçam que o usuário saia do site. Embora seja semelhante a um pop-up, um intersticial aceitável é um tipo de imagem que aparece na página de destino em vez de abrir uma janela do navegador. Ele não impede que um usuário saia do site ou app.

Nestes cenários, os anúncios seriam reprovados devido à experiência de destino:

 Destinos ou conteúdo de navegação desnecessariamente difícil ou frustrante

Exemplos: Sites com pop-ups ou intersticiais que impedem o usuário de conferir o conteúdo solicitado, sites que desativam ou interferem no botão "Voltar" do navegador ou sites que não são carregados rapidamente nos navegadores e dispositivos mais usados ou que pedem o download de outro app para acessar a página de destino (além dos plug-ins comuns do navegador)

 Links que iniciam um download direto pelo anúncio ou que direcionam a um endereço de e-mail ou arquivo

Exemplos: imagens, vídeos, áudios, documentos

Observação: anunciantes de produtos farmacêuticos podem usar páginas de destino em PDF.

 Destinos com experiências abusivas

Exemplos: sites com redirecionamento automático de páginas sem a permissão do usuário, sites com anúncios que simulam mensagens de erro ou avisos do sistema ou site

 Destinos com experiências de anúncios inadequadas de acordo com os Better Ads Standards. Para mais informações sobre os tipos de experiência não permitidos, acesse o site do Coalition for Better Ads.

Exemplos: anúncios presticiais com contagem regressiva, anúncios fixos grandes e anúncios animados piscando
Como corrigir
Corrija a experiência de destino do anúncio

Seu destino de anúncio deve oferecer aos usuários uma boa experiência, ou seja, precisa ser fácil de navegar, funcional e útil. Conteste a decisão relacionada à política na sua conta do Google Ads depois que atualizar o destino para obedecer às nossas políticas ou se acreditar que cometemos um engano.

Se o seu site contém experiências abusivas, siga as instruções abaixo para corrigir a violação:

Verifique o status do site no Google Search Console.
Remova as experiências abusivas do site.
Siga estas diretrizes para pedir uma reconsideração.
Se a revisão mostrar que não há mais nada abusivo no site, aprovaremos a veiculação dos seus anúncios.

Se a página de destino tiver experiências de anúncios que não obedecem aos Better Ads Standards, siga as instruções abaixo para corrigir a violação:

Confira o status do destino no Relatório de experiências do anúncio.
Corrija todos os problemas relacionados no destino.
Siga estas diretrizes para pedir uma reconsideração.
Se a análise mostrar que todos os problemas foram corrigidos, aprovaremos a veiculação dos anúncios.
Escolha outro destino

Se você não consegue fazer mudanças no destino do anúncio, use outro destino. Edite o URL final do anúncio para direcionar a outra parte do seu app ou site que não obedeça à política. Em seguida, salve o anúncio para fazermos a revisão dele novamente.

Se você não conseguir ou não quiser resolver essas violações, remova o anúncio para impedir que a conta seja suspensa por ter muitas reprovações.

Conteúdo original insuficiente

O Google Ads prioriza uma experiência positiva para o usuário. Por isso, os destinos de anúncios precisam oferecer um valor exclusivo para os usuários.

Os anúncios seriam reprovados devido a conteúdo original insuficiente nos seguintes casos:

 Conteúdo de destino com o objetivo principal de mostrar anúncios

 Conteúdo de destino replicado de outra origem, sem agregar valor como conteúdo original ou sem outra funcionalidade

 Destinos que servem exclusivamente para direcionar usuários a outro lugar

 Destinos que mostram uma mensagem indicando que eles não oferecem nenhum serviço

 Destinos incompreensíveis ou que não fazem sentido

Saiba mais sobre a política de conteúdo original insuficiente.

Nosso objetivo é oferecer uma boa experiência quando os consumidores clicam em um anúncio. Portanto, os destinos de anúncio precisam agregar valor exclusivo aos usuários.

Confira abaixo alguns exemplos do que deve ser evitado nos seus anúncios. Nestes cenários, os anúncios seriam reprovados devido a conteúdo original insuficiente:

 Conteúdo de destino com o objetivo principal de mostrar anúncios

Exemplo: direcionar tráfego (seja por "arbitragem" ou outros métodos) a destinos com mais anúncios do que conteúdo original, com pouco ou nenhum conteúdo original ou com publicidade demais

 Conteúdo de destino replicado de outra origem, sem agregar valor como conteúdo original ou sem outra funcionalidade

Exemplos: espelhamento, uso de frames, cópia de conteúdo de outra origem ou sites modelo ou pré-gerados que mostram conteúdo duplicado

 Destinos que servem exclusivamente para direcionar usuários a outro lugar

Exemplos: página intermediária e de entrada, gateway e outras páginas intermediárias usadas somente para direcionar a outros sites

 Destinos que mostram uma mensagem indicando que eles não oferecem nenhum serviço

Exemplos: um domínio reservado, um site que se destina apenas a reservar um endereço da Web, mostrando "Em construção", "Em breve" ou mensagens semelhantes.

 Destinos incompreensíveis ou que não fazem sentido

Exemplos: páginas em branco ou conteúdo sem sentido na página de destino
Como corrigir
Corrija o conteúdo do destino do anúncio

A prioridade é oferecer ao usuário um conteúdo relevante, exclusivo e original de forma imediata e não sobrecarregar o destino com anúncios, independente da relevância deles para o texto do anúncio. Peça para seu desenvolvedor da Web remover todos os conjuntos de frames HTML que incluem cópias de conteúdo de domínios que não sejam o da página de destino do anúncio. Se o seu site ou aplicativo tem funcionalidade de pesquisa, os resultados da busca não podem ser apenas copiados de outros sites ou apps. Verifique se o registro do site expirou.

Se você corrigiu seu destino ou acredita que cometemos um engano, conteste a decisão relacionada à política na sua conta do Google Ads para pedir uma revisão. Quando confirmarmos que o destino obedece às nossas diretrizes, poderemos aprovar seus anúncios.

Escolha outro destino

Se você não consegue fazer mudanças no destino do anúncio, use outro destino. Edite o URL final do anúncio para direcionar a outra parte do seu app ou site que não obedeça à política. Em seguida, salve o anúncio para fazermos a revisão dele novamente.

Se você não conseguir resolver essas violações, remova o anúncio para impedir que a conta seja suspensa por ter muitas reprovações.

Violação da política do app ou da loja on-line

O Google exige que os destinos associados ao seu app ou da loja on-line obedeçam às políticas do app ou da loja on-line do Google.

Os anúncios seriam reprovados devido a uma violação da política de apps ou lojas on-line nos seguintes casos:

 Destinos que violam as políticas do app ou da loja on-line

Saiba mais sobre a política de violação da política do app ou da loja on-line.

O Google exige que os destinos associados ao seu app ou da loja on-line obedeçam às políticas do app ou da loja on-line do Google.

Neste cenário, os anúncios seriam reprovados devido a uma violação da política de apps ou lojas on-line:

 Destinos que violam as políticas do app ou da loja on-line

Exemplos: recursos que violam as Políticas do programa para desenvolvedores do Chrome (link em inglês) ou apps que violam as políticas do Google Play
Por que seu anúncio foi reprovado

Confira a notificação que o app ou a loja on-line (como a Chrome Web Store ou a Google Play Store) enviou a você para conferir detalhes sobre a violação. A veiculação de anúncios vai ser retomada quando o problema no app ou na loja on-line for resolvido.

URL inaceitável

Os anúncios seriam reprovados devido à política de URL inaceitável nos seguintes casos:

 URLs que não seguem a sintaxe padrão

 Uso de um endereço IP como o URL de visualização

 URLs de visualização que usam caracteres inaceitáveis

Saiba mais sobre a política de URL inaceitável.

Nestes cenários, os anúncios seriam reprovados devido à política de URL inaceitável:

 URLs que não seguem a sintaxe padrão

 Uso de um endereço IP como o URL de visualização

Exemplo: 123.45.678.90

 URLs de visualização que usam caracteres inaceitáveis

Exemplo: caracteres como !, *, #, _, @
Saiba como corrigir um recurso ou anúncio reprovado.
App não reconhecido

Os anúncios seriam reprovados devido a um app não reconhecido nos seguintes casos:

 Apps que não podem ser reconhecidos pelo Google

Saiba mais sobre a política de app não reconhecido.

Neste cenário, os anúncios seriam reprovados devido a um app não reconhecido:

 Apps que não são reconhecidos pelo Google

Exemplos: informações sobre a app store ou ID do app incorretos, aplicativo excluído ou suspenso na app store
Saiba como corrigir um recurso ou anúncio reprovado.
Número de telefone não confirmado

O Google exige que os números de telefone em anúncios só para chamadas e recursos de ligação, de mensagem e de local funcionem na região que você segmenta e estejam associados à empresa divulgada.

Os anúncios só para chamadas e recursos de ligação e de local seriam reprovados devido a um número de telefone não confirmado nos seguintes casos:

 Números de telefone que não foram verificados pelo Google

Saiba mais sobre a política de número de telefone não confirmado.

O Google exige que os números de telefone em anúncios só para chamadas e recursos de ligação e de local funcionem no país que você segmenta e estejam associados à empresa divulgada.

Neste cenário, os anúncios só para chamadas e recursos de ligação e de local seriam reprovados devido a um número de telefone não confirmado:

 Números de telefone que não foram verificados pelo Google
Como corrigir

Etapa 1 de 2: confirme seu número de telefone

Há duas maneiras de fazer isso:

Mostrar o número no seu site.
O telefone que aparece no seu anúncio precisa estar no site indicado na publicidade. Se o número é mostrado em anúncios de sites diferentes, ele precisa aparecer em pelo menos uma página de cada um desses sites.
O URL de verificação precisa ter o mesmo domínio que o URL de visualização do seu anúncio. O número precisa ser um texto. Se for uma imagem, não obedecerá à política.
Observação: será mais fácil verificar seu número de telefone se ele aparecer em uma página de destino muito acessada. Para aumentar as chances de que o rastreador detecte seu número de telefone, verifique se ele está no formato E.164 no código-fonte do seu site. Exemplo de formato E.164: [+] [código do país] [número de telefone incluindo código de área]. Se você usa um script de inserção de número dinâmico para alterar o número de telefone em seu site com base na origem do tráfego, recomendamos usar os métodos de verificação do proprietário do domínio abaixo.
Confirmar a propriedade do domínio.
Há duas maneiras de verificar o número de telefone comprovando que o domínio do URL de visualização do anúncio é seu:
Vincule as contas do Search Console e do Google Ads.
Adicione a tag de acompanhamento de conversões ou de remarketing exclusiva do Google Ads ao seu site.

Etapa 2 de 2: edite seu anúncio ou recurso

Se você usa um recurso de local, o número de telefone associado precisa atender aos requisitos acima. Há duas maneiras de editar o recurso com base no endereço que você quer usar.

Endereço do Perfil da Empresa

Se o local reprovado for um endereço do Perfil da Empresa, faça login na conta desse produto e atualize as informações de local, que serão transferidas automaticamente para o Google Ads. Saiba como editar uma ficha do Perfil da Empresa.

Endereço inserido manualmente

Se você inseriu o endereço de forma manual, passe o cursor sobre ele e clique no ícone de lápis para editar suas informações de local. Confira o nome da empresa e verifique se você não está usando uma marca registrada proibida.

Se você está usando um anúncio só para chamadas ou recurso de ligação, edite o número de telefone para que ele seja aprovado.

Depois que você editar e salvar o anúncio ou o recurso, ele será enviado para nossa revisão. Se constatarmos que você removeu o conteúdo sem compliance do anúncio e da página de destino, poderemos aprovar a veiculação do anúncio.

Número de telefone inaceitável

O Google exige que os números de telefone em anúncios só para chamadas e recursos de ligação e de local funcionem na região que você segmenta e estejam associados à empresa divulgada.

Os anúncios só para chamadas e recursos de ligação e de local seriam reprovados devido a um número de telefone inaceitável nos seguintes casos:

 Números de telefone incorretos, inativos, irrelevantes ou que não direcionam à empresa divulgada

 Números premium, de fax ou telefones alfabéticos

 Números de telefone que não são locais ou que não pertencem ao país que você está segmentando

 Serviços de número de telefone virtual ou números pessoais

 Números de telefone sem um serviço de correio de voz ativo

Saiba mais sobre a política de número de telefone inaceitável.

O Google exige que os números de telefone em anúncios só para chamadas e recursos de ligação e de local funcionem no país que você segmenta e estejam associados à empresa divulgada.

Neste cenário, os anúncios só para chamadas e recursos de ligação e de local seriam reprovados devido a um número de telefone inaceitável:

 Números de telefone incorretos, inativos, irrelevantes ou que não direcionam à empresa divulgada.

Observação: às vezes, o Google faz ligações de teste para confirmar a validade, precisão e relevância do número indicado. Essas chamadas também podem ser gravadas.

 Os seguintes tipos de números de telefone são considerados inaceitáveis e resultam na reprovação de anúncios de chamada, recursos de ligação e recursos de local:

Números de telefone incorretos, inativos, irrelevantes ou que não direcionam à empresa divulgada.
Números premium, de fax ou telefones alfabéticos:
Um número premium é qualquer número que exija taxas ou cobranças adicionais para completar a ligação. Números de telefone com custo dividido podem ser usados, mas eles serão exibidos com um aviso sobre possíveis tarifas adicionais.
Alguns exemplos:
Números 1-900 nos Estados Unidos
Números 871 no Reino Unido
Um telefone alfabético traz letras no lugar de números.
Exemplo: "1-800-GOOG-411" em vez de "1-800-466-4411"
Números de telefone que não são locais ou que não pertencem ao país que você está segmentando.
Exemplo: usar um número de telefone da Alemanha em um anúncio que segmenta o Canadá.
Serviços de número de telefone virtual ou números pessoais: esse serviço está disponível apenas em determinados países, como o Reino Unido e a Espanha.
Restrições específicas de local: Brasil

Os números de telefone em anúncios de chamada, recursos de ligação e recursos de local que segmentam o Brasil precisam incluir o código de uma operadora, a menos que sejam números de ligação gratuita ou com custo dividido.

Alguns exemplos:
Códigos de operadora: usam "0XX11 5555 1234", em que "XX" representa o código da operadora, em vez de "11 5555-1234".
Números gratuitos ou com custo dividido: 4004, 0800
Como corrigir

Se esta política estiver afetando seu anúncio ou recurso, verifique se o número de telefone está em conformidade com ela, é funcional e relevante e corresponde à empresa anunciada.

Solução de problemas específicos do formato do anúncio
Recursos de local

Os números de telefone usados nos recursos de local vêm do Google Maps ou do seu Perfil da Empresa no Google e precisam seguir os requisitos elencados nesta política. Se você usa recursos de local, consulte esta página para saber como atualizar o número de telefone.

Depois de atualizar os recursos de local para obedecer à política, você pode configurar grupos por locais para definir de forma rápida e eficiente os locais segmentados pelos seus anúncios. Saiba mais sobre grupos por locais e filtros.

Substituir com o Chrome DevTools
Como substituir o user agent com o Chrome DevTools

Você pode usar o Chrome DevTools para substituir o user agent do seu navegador da Web. Dessa forma, você consegue imitar o rastreador da Web do Google AdsBot usado para revisar os URLs de destino.

Abra o Chrome DevTools seguindo um destes métodos:
Use os atalhos do teclado: Command+Option+I (Mac) ou Control+Shift+I (Windows, Linux ou ChromeOS).
Em uma página da Web: clique com o botão direito do mouse em qualquer lugar na página e selecione Inspecionar para abrir o Chrome DevTools.
Na UI do Chrome:
No canto superior direito da janela do Chrome, clique no ícone de três pontos .
Clique em Mais ferramentas.
Clique em Ferramentas para desenvolvedores.
Abra a guia Condições de rede:
No canto superior direito do painel do Chrome DevTools, clique no ícone de três pontos .
Clique em Mais ferramentas.
Clique em Condições de rede.
Marque a opção "Desativar cache" na seção "Armazenamento em cache".
Na seção "User agent", desmarque a opção "Usar o padrão do navegador", selecione Personalizado… e insira a string do user agent.
Por exemplo, para acessar um destino da Web como rastreadores da Web do Google AdsBot, adicione a "string completa do user agent" de um desses rastreadores em "Insira um user agent personalizado".
Insira o URL do destino no navegador para acessar o site com o user agent escolhido e verifique se a página carrega normalmente, como faria com o user agent padrão do navegador.
Observação: consulte também a documentação do Chrome DevTools em Condições de rede: substituir a string do user agent.
Rastreadores da Web do Google AdsBot (user agents)

"Rastreador" é um termo genérico que se refere a qualquer programa usado para descobrir e verificar sites automaticamente, seguindo os links de uma página da Web para outra. Às vezes, ele é chamado de "robô" ou "indexador".

O user agent é uma string fornecida pelo navegador ou rastreador que solicita informações de um servidor da Web. O principal tipo de user agent do Google para verificar a qualidade dos anúncios de uma página da Web é o AdsBot. Confira aqui uma descrição dos rastreadores da Web do Google e uma lista completa das strings de user agent.

A string completa do user agent é uma descrição plena do rastreador. Ela aparece na solicitação e nos seus registros da Web. Essa string identifica a finalidade do pedido e os recursos do dispositivo. Um desenvolvedor Web ou um host de servidor da Web pode, por exemplo, utilizar o user agent para configurar as regras do rastreador para o site.

Os anúncios serão reprovados por conta de um destino que não funciona se o destino do anúncio retornar um erro (como o código de erro de HTTP) quando o rastreamento é feito por uma das strings de user agent do Google AdsBot definidas abaixo:

AdsBot Mobile Web: verifica a qualidade dos anúncios em páginas da Web para dispositivos móveis
Token do user agent: AdsBot-Google-Mobile
String completa do user agent: Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/W.X.Y.Z Mobile Safari/537.36 (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)
AdsBot: verifica a qualidade dos anúncios em páginas da Web para computador
Token do user agent: AdsBot-Google
String completa do user agent: AdsBot-Google (+http://www.google.com/adsbot.html)
Precisa de ajuda?

Se tiver dúvidas sobre as políticas, confira as diretrizes delas e os exemplos ou fale com o suporte do Google Ads.

 
Esta página pode ter conteúdo que foi traduzido com tecnologia de IA. As traduções de IA podem conter erros.
Envie feedback sobre este artigo
Isso foi útil?
Como podemos melhorá-lo?
Enviar