---
titulo: "App Modes — modo de desenvolvimento vs. modo Ativo (o que cada um permite)"
url: https://developers.facebook.com/documentation/development/build-and-test/app-modes
capturado_em: 2026-09-10
hash: 42d53f927d0d2068
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Esta página foi traduzida do inglês para outro idioma usando IA. O conteúdo traduzido por IA pode conter erros, omissões ou divergências de sentido. Como a tradução automática pode ser imprecisa ou pouco clara, consulte o conteúdo original em inglês desta página para validar as orientações corretas.
Isso foi útil?
Modos de app
Updated: 5 de mai de 2025
Copiar para LLM
Ver como Markdown
O modo determina quem pode usar o app. De modo geral, os usuários de app podem ser divididos em dois grupos: os que têm uma função no app em si (usuários com função) e os que não têm (usuários sem função).
Modo de desenvolvimento
Os apps em modo de desenvolvimento só podem solicitar permissões de usuários com uma função e apenas permissões que tenham níveis de acesso padrão ou avançado. Da mesma forma, os recursos ficarão ativos somente para usuários com uma função, e somente recursos com níveis de acesso padrão ou avançado.
O público geral não pode fazer pesquisas em apps em desenvolvimento usando nossas ferramentas e APIs. Além disso, o app ficará oculto se estiver qualificado para listagem na Central de Apps.
Somente os usuários com uma função podem ver os dados gerados enquanto o app está no modo de desenvolvimento, como posts de teste. Entretanto, esses dados ficarão visíveis para usuários sem uma função quando o app for alterado para o modo publicado.
Todos os apps recém-criados começam no modo de desenvolvimento e só devem passar para o publicado quando o de desenvolvimento for concluído.
Modo publicado
Os apps no modo publicado podem solicitar permissões de qualquer pessoa, mas somente permissões aprovadas por meio da análise do app. Da mesma forma, somente os recursos aprovados por meio da análise do app ficam ativos para os usuários.
Os apps de consumidor têm um comportamento um pouco diferente, já que também se baseiam em níveis de acesso. Os apps de consumidor no modo publicado podem solicitar permissões com acesso avançado de qualquer pessoa, mas as permissões com acesso padrão só podem ser solicitadas de usuários com uma função. Da mesma forma, os recursos de acesso avançado ficam ativos para todos, mas os recursos de acesso padrão ficam ativos somente para usuários com uma função.
Qualquer pessoa pode fazer pesquisas nos apps em modo publicado usando nossas ferramentas e APIs. Além disso, caso estejam qualificados, os apps podem ser listados na Central de Apps.
Altere para o modo publicado somente depois de concluir o desenvolvimento e a análise do app. Observe que os dados gerados no modo de desenvolvimento, como posts de teste, ficarão visíveis para todos os usuários quando essa alteração for feita.
Como mudar de modo
Os administradores podem usar a alternância de modos na barra de ferramentas do Painel de Apps se quiserem alterar o modo.
Veja também
Níveis de acesso
Guia de níveis de acesso da API de Marketing
Você achou esta página útil?