---
titulo: "Google Picker API — visão geral (o seletor de arquivos do Google)"
url: https://developers.google.com/workspace/drive/picker/guides/overview
capturado_em: 2026-09-11
hash: e8b8166af5ef67ff
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

O Google usa tecnologia de IA na tradução de conteúdos para seu idioma de preferência. As traduções com IA podem ter erros.
Envie comentários
Visão geral do Google Picker
Nesta página
Principais casos de uso
Comparação de apps da Web com apps para computador e dispositivos móveis
Temas relacionados

Este documento apresenta o Google Picker e a API Google Picker. Ele também ajuda você a decidir qual abordagem é melhor para seu app.

O Google Picker oferece uma caixa de diálogo "Arquivo aberto" refinada para informações armazenadas no Google Drive. É uma maneira de permitir que os usuários selecionem ou façam upload de fotos, vídeos e documentos da conta do Drive sem sair do aplicativo.

A API Google Picker é a interface técnica usada para implementar o Google Picker no seu app. Ao usar a API Google Picker, você cria uma interface familiar que lida com a complexidade da autenticação e da navegação de arquivos, retornando metadados específicos de arquivos (como IDs e URLs) para seu app quando um usuário faz uma seleção.

Principais casos de uso

O Google Picker é versátil e pode ser adaptado a vários fluxos de trabalho de aplicativos:

Alternativa de upload de arquivos: os usuários podem fazer upload de um arquivo para o Drive diretamente pelo Google Picker.
Ferramentas de colaboração: permita que os usuários vinculem documentos ou planilhas específicos do Google a uma tarefa de gerenciamento de projetos ou a um evento de calendário compartilhado.
Anexos de recursos: use o Google Picker como uma maneira de os usuários anexarem documentação de suporte do Drive a um relatório de despesas ou a um tíquete de suporte.
Comparação de apps da Web com apps para computador e dispositivos móveis

Embora a funcionalidade principal permaneça consistente, a implementação da API Google Picker varia dependendo de onde o app está sendo executado. A tabela de comparação a seguir lista as diferenças técnicas e funcionais ao implementar apps da Web em comparação com apps para computador e dispositivos móveis.

Recurso	Apps da Web	Apps para computador e dispositivos móveis
Tecnologia principal	Biblioteca JavaScript do lado do cliente.	Parâmetros de URL do OAuth 2.0 e redirecionamentos HTTP.
Renderização	Integra-se ao layout da interface do app.	Abre em uma nova guia do navegador padrão do sistema do usuário. Não pode mais ser exibido em uma WebView incorporada.
Fluxo de autenticação	Requer um token de acesso específico transmitido por setOAuthToken.	Acionado pela adição de trigger_onepick=true à solicitação do OAuth.
Método de resposta	Callbacks diretos do JavaScript.	URIs de redirecionamento ou esquemas de URL personalizados.
Escopos	Flexível; pode usar drive.file, drive.readonly etc.	Restrito; somente drive.file é permitido e não pode ser combinado com outros escopos.
Configuração	Usa a interface fluente PickerBuilder em JavaScript.	Usa parâmetros de string de consulta no URL de autorização.

Para usar o escopo drive.file, o usuário precisa fazer login ao acessar o Google Picker.

As principais diferenças estratégicas são:

Os apps da Web são projetados para alta interatividade e personalização avançada (como visualizações específicas por tipo de arquivo e restrição da visualização a pastas específicas do Drive).
Os apps para computador e dispositivos móveis são projetados para segurança e simplicidade, usando o navegador do sistema para processar a autenticação e a seleção de arquivos em um fluxo único e unificado.
Temas relacionados
Integrar o Google Picker a apps da Web
Integrar o Google Picker a apps para computador e dispositivos móveis
Usar o Google Picker no Google Apps Script
Escolher escopos da API Google Drive
Isso foi útil?
Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons, e as amostras de código são licenciadas de acordo com a Licença Apache 2.0. Para mais detalhes, consulte as políticas do site do Google Developers. Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2026-09-11 UTC.