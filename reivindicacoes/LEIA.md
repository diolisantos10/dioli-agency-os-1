# `reivindicacoes/` — quem está mexendo em quê, antes de mexer

Cada arquivo `.json` aqui dentro é uma frente de trabalho reivindicada por uma
sessão: quem pegou, que pergunta o código responde, que arquivos ela vai
tocar. Existe porque em 16/08/2026 três frentes foram construídas EM DOBRO no
mesmo dia por chats diferentes, cegos uns para os outros — a doutrina já
mandava "escreva a reivindicação antes de começar" desde 02/08/2026, e ela era
prompt, não mecanismo. Isto é o mecanismo. Um arquivo por reivindicação, nunca
um arquivo único com todas: registro de coordenação que vira ele mesmo fonte
de conflito de merge é o defeito que esta pasta existe para consertar, não uma
versão nova dele. Duas sessões pegando a MESMA responsabilidade colidem no
MESMO nome de arquivo — esse é o sinal, de graça, sem precisar de mais régua.

Os três comandos:

```sh
npm run reivindicar -- abrir --quem <id> --frente "<frase>" \
  --responsabilidade <slug> --arquivos <a,b,c>   # antes da primeira linha de código
npm run reivindicar -- conferir                  # o que eu já toquei pisa em frente de outro?
npm run reivindicar -- encerrar --responsabilidade <slug>  # ao terminar
npm run reivindicar -- listar                     # o que está vivo, o que está velho, de quem é
```

**Reivindicação que não está no remoto não coordena ninguém.** `abrir` confere
contra `origin/<branch>` e faz `git push` na hora — se ficar só no seu commit
local, a próxima sessão que fizer `git fetch` não vê nada, e a colisão
acontece do mesmo jeito que aconteceria sem esta pasta.

**Rode de dentro do seu branch de PR — é o lugar certo.** Desde 30/08/2026 o
push da reivindicação leva um commit construído sobre `origin/<branch>` com só o
arquivo do registro dentro: o trabalho do seu branch **não vai junto**, e o seu
branch **não é rebaseado** para isso acontecer. Antes disso a ferramenta media o
seu branch em vez do que o push carregava, e recusava — o que trancava também o
`encerrar`, que é a saída legítima de uma colisão. O registro fica nos dois
lugares de propósito: um commit no **seu** branch (para você enxergar a sua
própria frente, e para ela viajar no PR) e o commit-só-do-registro na **branch de
coordenação**, que é a única fonte que duas sessões isoladas compartilham.

**Colidiu?** A saída é `encerrar` — e quem encerra é o **dono** da frente
(`quem`), não quem colidiu com ela. Se a frente já terminou, o dono encerra e a
pasta volta a ficar limpa; se as duas ainda estão vivas, é conversa entre as duas
sessões, não conserto de arquivo alheio.
