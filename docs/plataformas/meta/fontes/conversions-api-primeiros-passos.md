---
titulo: "Conversions API — primeiros passos"
url: https://developers.facebook.com/documentation/ads-commerce/conversions-api/get-started
capturado_em: 2026-09-09
hash: 5d5ba234d171261c
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Começar a usar a API de Conversões
Updated: 28 de jun de 2026
Copiar para LLM
Ver como Markdown
O Acesso padrão ao gerenciamento de anúncios agora é o Nível de acesso da API de Marketing
Não é preciso fazer alterações no código.
Os rótulos de nível foram atualizados: “Standard Access” agora é Limited Access, e “Advanced Access” agora é Full Access. O limite de qualificação revisado para acesso total foi reduzido de 1.500 para 500 chamadas à API de Marketing nos últimos 15 dias. O identificador de permissão subjacente permanece inalterado, e os níveis de acesso existentes são preservados automaticamente. Saiba mais na documentação sobre os níveis de acesso da API de Marketing.
Esta página descreve o processo e os pré-requisitos para a implementação da API de Conversões. Se você é um parceiro de terceiros oferecendo funcionalidades da API de Conversões para anunciantes, há requisitos diferentes para começar.
Caso sua empresa use um firewall para solicitações externas, consulte IPs do rastreador e agentes de usuário para obter os endereços IP do Facebook. É importante lembrar que a lista de endereços é alterada com frequência.
Os eventos de loja física, app e web compartilhados usando a API de Conversões exigem parâmetros específicos. A lista de parâmetros obrigatórios está disponível aqui.
Visão geral do processo
Veja as etapas de alto nível para configurar a integração da API de Conversões:
Escolher o método de integração adequado para você.
Concluir os pré-requisitos necessários para o método de implementação específico.
Implementar seguindo o método escolhido.
Verificar a configuração e aderir às boas práticas que ajudam a melhorar o desempenho de anúncios.
Métodos de integração
Existem diferentes métodos de integração com a API de Conversões, que variam de acordo com o nível de esforço, custos e recursos. Veja este artigo⁠ para uma visão geral das opções de configuração da API de Conversões.
O principal objetivo desta documentação para desenvolvedores é criar integrações diretas.
Requisitos
Identificação do pixel
É necessário obter a identificação do Pixel⁠ para usar a API de Conversões. Se você já tiver configurado um pixel para o site, use a mesma identificação do pixel para o navegador e os eventos do servidor.
Meta Business Suite
Você também precisa ter um Meta Business Suite⁠ para usar a API. O Meta Business Suite ajuda anunciantes a integrar o trabalho de marketing do Facebook a todos os seus negócios e parceiros externos. Se você ainda não tiver o Meta Business Suite, consulte o artigo da Central de Ajuda sobre como criar um Meta Business Suite⁠.
Token de acesso
Para usar a API de Conversões, é necessário ter um token de acesso. Há duas maneiras de obter um token de acesso:
Com o Gerenciador de Eventos (recomendado)
Com seu app
Usar o Gerenciador de Eventos (recomendado)
Para usar a API de Conversões, é necessário gerar um token de acesso. Passe o token de acesso como um parâmetro em cada chamada de API. No Gerenciador de Eventos, siga estas etapas:
Etapa 1 – Escolha o pixel que você quer implementar.
Etapa 2 – Selecione a aba Configurações.

Etapa 3 – Encontre a seção "API de Conversões" e clique no link Gerar token de acesso na opção "Configurar manualmente". Depois, siga as instruções da mensagem pop-up:
Observação: o link Gerar token de acesso só pode ser visto por usuários com privilégios de desenvolvedor na empresa. Ele fica oculto para os outros usuários.

Depois de obter o token, clique no botão Gerenciar integrações na aba Visão geral do Gerenciador de Eventos. Na tela pop-up, clique no botão Gerenciar ao lado de API de Conversões. Ao clicar em Gerenciar, um app e um usuário do sistema da API de Conversões serão criados automaticamente para você. Não é necessário passar pela análise do app nem solicitar permissões.

Com seu app
Se você já tiver um app e um usuário do sistema, será possível gerar o token no Meta Business Suite⁠. Para fazer isso, siga estas etapas:
Etapa 1 – Acesse as Configurações da empresa.
Etapa 2 – Atribua um pixel ao usuário do sistema. Outra opção é criar um novo usuário do sistema nesta etapa.
Etapa 3 – Selecione o usuário do sistema atribuído e clique em Gerar token.
Seu app não precisa passar pelo processo de análise. Não é necessário solicitar nenhuma permissão.
Os tokens gerados na aba de configurações da API de Conversões no Gerenciador de Eventos não estão mais restritos ao uso da versão mais recente da Graph API que estava disponível no momento da geração do token. A partir da versão 12.0, tokens de acesso recém-criados podem ser usados com todas as versões disponíveis da Graph API.
Recursos
Central de Ajuda para Empresas: Sobre o Meta Business Suite⁠
Central de Ajuda para Empresas: Sobre o Pixel da Meta⁠
Meta Blueprint: Começar a usar a API de Conversões⁠
Você achou esta página útil?