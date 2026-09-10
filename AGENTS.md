<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Onde escrever rascunho de trabalho

Rascunho de sessão mora em `.fichas/<id-da-frente>/`, dentro da própria worktree — nunca em `/tmp`. Pegue o caminho com `npm run rascunho -- caminho "<nome>"`; confira um caminho montado por fora com `npm run rascunho -- conferir "<caminho>"`.

**O scratchpad de `/tmp/claude-.../scratchpad` é compartilhado entre frentes e não serve** — `CLAUDE_CODE_SESSION_ID` é o mesmo valor para todas as sessões nesta máquina, então esse diretório não isola nada.

Fonte: `lib/rascunho/espaco-da-frente.ts` e `docs/diagnosticos/o-rascunho-compartilhado-29-08.md`. Regra não se copia aqui de novo.
