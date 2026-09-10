# Ficha de despacho — especialista `meta` — 29/08/2026

## Objetivo em uma frase
Emitir o PARECER que diz, permissão por permissão, **o que a Meta exige VER no
screencast do App Review**, e quais cenas dependem obrigatoriamente de conta
real da Meta / publicação real — para que o PM saiba o que dá para gravar neste
ambiente e o que só o CEO pode gravar.

## Contexto medido (NÃO remeça — parta daqui)
- Permissões pedidas (`lib/integrations/meta/config.ts`, `DEFAULT_SCOPES`):
  `public_profile`, `pages_show_list`, `pages_read_engagement`,
  `pages_manage_metadata`, `business_management`, `instagram_basic`,
  `instagram_content_publish`, `instagram_manage_insights`,
  `instagram_manage_comments`, `whatsapp_business_management`,
  `whatsapp_business_messaging`, `ads_management`, `ads_read`.
- `docs/plataformas/meta/app-review.md` (§2) já DECIDIU em 11/08 que
  `instagram_manage_comments`, `pages_manage_metadata` e `business_management`
  SAEM do envio. Considere isso na sua tabela — mas diga se muda algo.
- `META_APP_ID`, `META_APP_SECRET`, `META_REDIRECT_URI` estão TODOS ausentes
  neste ambiente (`.env` tem zero linha com META). `resolveMetaAppCredentials()`
  devolve `null`, `isMetaConfigured()` é falso — o botão Conectar não monta URL.
- O OAuth aterrissa em `facebook.com/{v}/dialog/oauth` — exige login real.
- NÃO existe modo mock/simulação em `lib/integrations/meta/`.
- Já existe `docs/plataformas/meta/roteiro-do-video.md` (15/08) — escrito PARA O
  CEO GRAVAR. NÃO o reescreva; ele continua valendo.

## Definição de pronto — devolva NA SUA RESPOSTA (texto), não em arquivo novo
Uma tabela, uma linha por permissão do envio, com estas colunas:

| permissão | o que a Meta exige VER no screencast (com a fonte citada de `docs/plataformas/meta/` ou LACUNA declarada) | tela do produto que exercita | exige conta real da Meta? | exige publicação real? | balde |

Baldes, exatamente estes três:
- **(a) gravável aqui INTEIRO** — a cena existe e roda sem credencial da Meta;
- **(b) gravável só a PARTE INTERNA do produto** — dá para filmar a tela do
  produto, mas o dado da Meta / o diálogo de OAuth não aparece;
- **(c) IMPOSSÍVEL sem conta real** — não há o que filmar aqui.

Depois da tabela, responda em bullets:
1. **A cena de OAuth é obrigatória em TODAS as permissões ou só em algumas?**
   Cite a fonte. (O roteiro de 15/08 afirma que a Meta escreve no formulário
   "incorpore o fluxo de autorização do OAuth no screencast" — confirme contra
   a biblioteca e diga se vale por permissão ou por envio.)
2. **Um screencast de tela vazia / estado desconectado ajuda ou atrapalha o
   envio?** Se a Meta reprova vídeo que não mostra a funcionalidade, DIGA COM
   TODAS AS LETRAS — é melhor eu entregar 2 vídeos úteis do que 9 inúteis.
3. **Que material ALÉM de vídeo é aceito/exigido** (chamada de teste de API,
   usuário de teste, texto de justificativa) e qual desses o ambiente aqui
   consegue produzir sem conta real.
4. **Riscos**: alguma coisa nesta gravação pode repetir a restrição de 03/08?

## Restrições — travas, não preferências
- ⛔ NENHUMA chamada de escrita à Meta. NENHUMA chamada de rede à Graph API
  (não há credencial aqui, e tentar é ruído). Seu trabalho é PARECER sobre a
  biblioteca capturada, não medição ao vivo.
- ⛔ NÃO mexa em `developers.facebook.com`, não submeta nada.
- ⛔ NÃO altere `lib/integrations/meta/config.ts`.
- ⛔ NÃO reescreva `roteiro-do-video.md`.
- ⛔ Não invente regra da Meta de memória. Toda afirmação: fonte citada de
  `docs/plataformas/meta/` (arquivo + trecho) ou a palavra **LACUNA**.

## Critério de aceite
O PM vai conferir: cada linha da tabela tem fonte citada OU LACUNA declarada; o
balde de cada permissão é justificado; a resposta ao bullet 2 é direta (sim/não,
sem rodeio). Parecer que só repete o roteiro de 15/08 volta.
