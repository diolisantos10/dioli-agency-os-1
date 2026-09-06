---
titulo: "Graph API — tratamento de erros e códigos"
url: https://developers.facebook.com/docs/graph-api/guides/error-handling
capturado_em: 2026-09-06
hash: 291c6b66bc7d73c6
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Entrada da pesquisa
​
Graph API
Visão geral
Introdução
Solicitações em lote
Solicitações de depuração
Solução de erros
Field Expansion
Secure Requests
Registro de alterações
Reference
Como solucionar erros

As solicitações feitas à nossas APIs podem resultar em diferentes respostas de erro. O documento a seguir descreve táticas de recuperação e exibe uma lista de valores de erro com um mapa para o método de resolução mais comum.

Respostas de erro

Veja a seguir uma resposta de erro comum resultante de uma solicitação de API malsucedida:

{
  "error": {
    "message": "Message describing the error", 
    "type": "OAuthException", 
    "code": 190,
    "error_subcode": 460,
    "error_user_title": "A title",
    "error_user_msg": "A message",
    "fbtrace_id": "EJplcsCHuLu"
  }
}
message: é uma descrição do erro legível por humanos.
code: é o código do erro. Os valores comuns estão listados abaixo, juntamente com táticas comuns de recuperação.
error_subcode: são informações adicionais sobre o erro. Os valores comuns estão listados abaixo.
error_user_msg: é a mensagem que será exibida ao usuário. O idioma da mensagem é baseado no local da solicitação da API.
error_user_title: é o título do diálogo, se exibido. O idioma da mensagem é baseado no local da solicitação da API.
fbtrace_id: é o identificador de suporte interno. Ao relatar um bug relacionado a uma chamada da Graph API, inclua o fbtrace_id para nos ajudar a encontrar os dados de registro para depuração. No entanto, esse ID expirará em breve. Para ajudar a equipe de suporte a replicar o problema, anexe uma sessão salva do Explorador da Graph API.
Códigos de erro
Código ou tipo	Nome	O que fazer

OAuthException

		

Se não houver um subcódigo, isso indica que o status de login ou o token de acesso expirou, foi revogado ou é inválido. Obtenha um novo token de acesso.

Se houver um subcódigo, consulte-o.

102

	

Sessão da API

	

Se não houver um subcódigo, isso indica que o status de login ou o token de acesso expirou, foi revogado ou é inválido. Obtenha um novo token de acesso.

Se houver um subcódigo, consulte-o.

1

	

API desconhecida

	

Possivelmente, um problema temporário devido à inatividade. Aguarde um pouco e refaça a operação. Caso isso ocorra outra vez, verifique se você está solicitando uma API existente.

2

	

Serviço de API

	

Um problema temporário devido à inatividade. Aguarde um pouco e refaça a operação.

3

	

Método de API

	

Indica um problema que envolve recursos ou permissões. Confira se o app tem as permissões ou os recursos necessários para fazer a chamada.

4

	

Muitas chamadas de API

	

Um problema temporário devido à limitação. Aguarde um pouco e refaça a operação ou verifique o volume de solicitações de API.

17

	

Muitas chamadas de usuário de API

	

Um problema temporário devido à limitação. Aguarde um pouco e refaça a operação ou verifique o volume de solicitações de API.

10

	

Permissão de API negada

	

A permissão não foi concedida ou foi removida. Veja como corrigir permissões ausentes.

190

	

O token de acesso expirou

	

Obtenha um novo token de acesso.

200-299

	

Permissão da API (Múltiplos valores dependendo da permissão)

	

A permissão não foi concedida ou foi removida. Veja como corrigir permissões ausentes.

341

	

Limite do aplicativo atingido

	

Um problema temporário devido ao tempo de inatividade ou à limitação. Aguarde um pouco e refaça a operação ou verifique o volume de solicitações de API.

368

	

Bloqueado temporariamente por violações de políticas

	

Aguarde um pouco e refaça a operação.

506

	

Post duplicado

	

Posts duplicados não podem ser feitos consecutivamente. Altere o conteúdo do post e tente novamente.

1609005

	

Erro ao postar o link

	

Houve um problema ao detalhar os dados do link fornecido. Verifique a URL e tente novamente.

Subcódigos de erro de autenticação
Código	Nome	O que fazer

458

	

App não instalado

	

O usuário não fez login no seu app. Autentique o usuário novamente.

459

	

Usuário em checkpoint

	

O usuário precisa entrar em https://www.facebook.com ou https://m.facebook.com para corrigir um problema.

460

	

Senha alterada

	

No iOS 6 e nas versões mais recentes, caso a pessoa use o fluxo integrado do sistema operacional para fazer login, direcione-a aos ajustes de sistema operacional do Facebook no dispositivo para que ela atualize a senha. Caso contrário, ela precisará fazer login no app novamente.

463

	

Expirado

	

O status do login ou o token de acesso expirou, foi revogado ou está inválido de outra forma. Veja como corrigir tokens de acesso expirados.

464

	

Usuário não confirmado

	

O usuário precisa entrar em https://www.facebook.com ou https://m.facebook.com para corrigir um problema.

467

	

Token de acesso inválido

	

O token de acesso expirou, foi revogado ou está inválido de outra forma. Veja como corrigir tokens de acesso expirados.

492

	

Sessão inválida

	

O usuário associado ao token de acesso à Página não possui uma função apropriada na Página.

Códigos de erro de limitação de volume

Acesse o guia sobre limites de volume da Graph API para saber mais sobre os códigos de erro de limitação de volume.

Nesta Página
Como solucionar erros
Respostas de erro
Códigos de erro
Subcódigos de erro de autenticação
Códigos de erro de limitação de volume