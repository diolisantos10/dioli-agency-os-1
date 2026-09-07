# Oficina — esteira

> Registro de bancada. O que foi feito, o que foi decidido e o que ficou aberto.
> Escrito pelo especialista; quem promove para a vitrine é o PM.

---

## 2026-08-06 · A régua de recompra (30/60/90)

**O buraco:** cliente compra no balcão, recebe a peça e some. Não havia segundo
contato de espécie nenhuma — nem automático, nem fila, nem lembrete.

**O que entrou**

- `lib/agency/esteira/recompra.ts` — a régua inteira, sem IA.
- `app/api/cron/recompra/route.ts` — o gatilho de tempo (Bearer `CRON_SECRET`,
  mesmo padrão de `cron/radar`).
- `lib/agency/esteira/avisos.ts:24` — `TipoDeAviso` ganhou `"recompra"`.
- `__tests__/esteira/recompra.test.ts` — 23 casos, cada trava com as duas metades.

**As decisões que valem mais que o código**

1. **A régua não fala com a Meta.** Ela produz RASCUNHO na fila humana
   (`GET /api/avisos`) e escreve na conversa do portal. Motivo por escrito em
   `recompra.ts:31-43`: a política do WhatsApp exige opt-in registrado do
   destinatário (`docs/plataformas/meta/fontes/whatsapp-politica-de-mensagens.md`,
   §1) e esta casa **não tem coluna onde registrar isso** — sem prova não há
   autorização. Fora da janela de 24h só sai Modelo aprovado (mesma fonte, §2 +
   `whatsapp-modelos.md`), e um toque de 30 dias está sempre fora da janela por
   definição. Não existe template de marketing aprovado nesta casa.
   **Ligar o disparo automático exige parecer do especialista `meta` + template.**

2. **A idempotência é a CHAVE PRIMÁRIA**, não uma consulta prévia.
   `idDoToque()` monta `recompra-<marco>-<sha256(clientId|entregaId|marco)>` e o
   `ClientNotice` nasce com esse id. A segunda passada do cron estoura P2002 e
   vira no-op — inclusive a mensagem do portal, que fica *depois* do create de
   propósito: um único ponto de trava para os dois efeitos.

3. **A janela de tolerância (15 dias) é o que impede o massacre da estreia.**
   `marcoDevido(dias)` só devolve marco se `M <= dias <= M+15`. Sem ela, ligar a
   régua num banco com histórico dispararia os três toques em dias seguidos para
   clientes de um ano atrás. É função pura do tempo — não precisa de estado, logo
   não pode divergir dele.

4. **Preço só quando DUAS tabelas concordam.** `precoParaOferecer()` exige o
   número em `SELF_SERVE_CATALOG` **e** autorização de `podeFechar()` de
   `comercial/negociacao.ts`. Item sem linha na tabela de piso (reel, banner,
   identidade, packs) sai **sem número**. E a régua não dá desconto em marco
   nenhum: desconto que sai sozinho ensina a carteira que o preço cheio era
   encenação.

5. **A régua termina.** O toque de 90 dias diz, no texto, que é o último. Régua
   que não termina é perseguição — e a política da Meta manda respeitar pedido de
   parar mesmo fora do WhatsApp.

**A corrente, andada inteira**

`balcao/producao.ts` cria `Project{type:"balcao", clientRequestId}` →
`execution/run-execution.ts:870` chama `esteira/marcos.ts:apresentar` →
`marcos.ts:201` carimba `visibility:"compartilhado"` → **é essa a âncora que a
régua lê**. Se a escada de exposição reter a peça (departamento em SOMBRA), a
visibilidade fica `interno` e a régua corretamente não dispara: ele não recebeu.

**O que ficou aberto**

- O cron precisa de agendamento externo (Railway). Não existe arquivo de registro
  de crons no repo — `cron/radar` e `cron/execute` também dependem disso.
- Texto barrado pela trava de promessa de resultado não vira `ClientNotice`: sai
  só como linha de `parados` na resposta do cron. É fail-closed correto, mas a
  visibilidade é fraca — depende de alguém ler a resposta do cron.
- O canal e-mail não existe na casa. Com opt-in de WhatsApp registrável, ou com
  e-mail transacional, a régua ganha braço automático sem mudar de desenho.

---

## 2026-08-13 · Raio-X da esteira, e os dois consertos que saíram dele

**A pergunta do CEO:** *"a gente precisa saber se o Radar ou a Oficina de peças
está funcionando, porque está saindo uns posts bem ruins."*

**A resposta:** nenhum dos dois. O Radar não encosta na peça — o que ele acha
entra `pending` e só vira insumo com clique humano (`radar/library.ts:81`). A
oficina funciona no que cobre; ela só cobre pouco. **Quem deixava passar era o
juiz** — e, quando a peça vinha da tela da agência, nada.

### O que se apurou, elo por elo

1. **Briefing → produtor:** chega, e por dois caminhos. `run-execution.ts:423`
   sincroniza as proibições antes de ler. A perda real é que `extrairProibicoes`
   só reconhece negação explícita: *"sem sensacionalismo"* não vira trava.
2. **Contrato de marca:** completo, não truncado, corta por bloco inteiro e
   declara o corte (`contrato-de-marca.ts:163`). **Mas chega vazio** em todo
   cliente que não preencheu a ficha de nove campos (`ficha-de-marca.ts:231`) —
   sem tom, sem voz, sem referências. Causa estrutural nº 1 de post genérico, e
   não é defeito de código: é campo em branco.
3. **Radar:** governança boa. Desde 11/08 (`radar/sources.ts:43`) existe UM canal
   que ativa diretriz **sem humano** (fonte oficial + lastro literal) e ele
   alimenta o prompt do produtor **e** a régua do juiz ao mesmo tempo. Não achei
   evidência de que tenha disparado — **NÃO VERIFICADO**, precisa de uma consulta
   a `MarketInsight where status='active'` no banco de produção.
4. **Juiz:** uma chamada de IA, cinco perguntas em prosa, `flag só se houver
   problema real`. Carimbou `quality_ok` em 8 peças ruins em 07/08.
5. **Portões registrados:** 33, dos quais **8 com mecanismo** e 25 lacuna
   declarada (`quality-gates.ts`) — e esse registro nem roda no caminho da peça.

### Conserto 1 — o furo da escada, aberto desde 07/08

`agendarPostsDaEntrega` lia todo entregável publicável e criava o post já
`compartilhado`, sem olhar a escada nem a Qualidade. As duas metades da esteira
faziam a coisa certa e esta função desfazia as duas uma linha depois.

- `publicacao.ts` — `motivoParaNaoVirarCalendario`, fail-closed nas duas
  perguntas; `revisionStatus` ausente **não** é aprovação.
- `nao_auditado` continua entrando **de propósito**: a casa já decidiu isso em
  `quality-auditor.ts:19` e aplica em `run-execution.ts:771`. Barrar aqui criaria
  uma segunda política sobre o mesmo estado.
- A retenção vira `ActivityEvent` com nome e motivo — barrar em silêncio trocaria
  um defeito visível por um invisível.
- `escada/repescagem.ts` passou a montar o calendário do que libera. Sem isso, o
  conserto criaria o defeito simétrico: entrega liberada depois da apresentação
  nunca viraria calendário, porque apresentar é o único gatilho e não repete.

### Conserto 2 — régua determinística antes do juiz

`trava-de-texto.ts` guardava só o pixel. A lista se partiu em duas —
`CLASSES_DE_FATO` (preço, telefone, prazo: existe cliente para quem é verdade, e
quem confere é o piso) e `CLASSES_DE_ALEGACAO` (superlativo, jargão, promessa
vaga, prova social, multidão: **não têm versão verdadeira**). A arte continua
sendo a soma; a peça recebe só a segunda. `regua-do-texto.ts` faz o recorte e
roda **dentro de `auditDeliverable`, antes da IA** — um lugar, quatro caminhos.

### As três coisas que eu errei, e que só o teste pegou

1. **Parti a frase pelo ponto, e "3.000" virou "3" + "000".** A lição estava
   escrita em `piso-de-verdade.ts:247` e eu a repeti mesmo assim. A régua falhava
   calada exatamente na forma que ela existe para pegar.
2. **A trava nasceu decorativa e eu quase não vi.** 81 testes verdes na régua; aí
   desliguei a chamada dela dentro do juiz (`if (false && …)`) e rodei a suíte:
   **593 testes, nenhum falhou.** Construída, testada, e nada provava que rodava.
   Sete testes novos em `quality-auditor.test.ts` fecham isso — e a sabotagem
   repetida agora derruba quatro.
3. **Um teste da casa media a coisa errada.** `repescagem-da-escada.test.ts:189`
   chamava-se "não publica" e conferia `not.toMatch(/esteira\/publicacao/)` —
   menção ao arquivo, não o ato. Escrito assim, ele **proibia o conserto certo** e
   teria empurrado a solução para uma cópia da regra em outro arquivo. Passou a
   conferir o ato (`publishPost`, `publicarAgendados`).

### O que ficou aberto

- **As três portas do Planner continuam sem portão** (`api/social-posts/generate`,
  `api/social-posts` POST, `api/ai/run`, esta com auto-aprovação em
  `agency-store.ts:642`). Não toquei: é decisão de dono e subiu ao CEO.
- **A fronteira por tipo de entregável é declarada, não medida.** Documento
  interno (estratégia, relatório) não passa pela régua, porque o especialista de
  concorrência descreve o superlativo do concorrente e seria reprovado pela
  forma. Se o jargão entrar pelo posicionamento, ele desce para todas as peças e
  a régua não o pega na origem. Fechar isso exige medir o corpus de estratégia
  com legendas que eu não escrevi — lei da 8ª auditoria.
- **Resíduo travado em teste:** "De procurando emprego a CONTRATADO", "VAGAS
  QUENTES HOJE", "Empresa em ALTA DEMANDA contratando" continuam passando.
  Promessa contada como história exige julgamento de sentido (Onda 5 do P0).
- **Números fabricados escritos à mão** em `dioli-brain/analytics-engine.ts:180,
  186,269` ("CTR 2–3× maior", "aumenta conversão em 40–80%"), fora do alcance do
  piso por omissão em `quality-engine.ts:121` (`textoAfirmado` não inclui o canvas
  de analytics). Não toquei — outro despacho.

**Verificação:** `npx tsc --noEmit` limpo · `npx vitest run` 3472 verdes
(212 arquivos), +103 testes.

---

## 2026-08-16 · O escopo sobrevive quando a fala não sobrevive

**O buraco:** piloto ao vivo, 12h41 e 12h43. O cliente disse "R$ 500/mês" e
"2 posts por dia"; o teto de tokens (1.280) cortou a resposta do SDR no meio do
JSON, `JSON.parse` recusou o texto inteiro — fala E escopo juntos — e o
briefing saiu com R$ 1.800–3.400 e 3 posts/semana. `repararJsonTruncado` já
existia no arquivo (commit anterior) e nunca era chamada — D-003, a caixa sem
a seta, dentro do próprio conserto que devia consertar isso.

**O que entrou**

- `app/api/sdr/chat/route.ts:257-282` — o JSON de saída passou a pedir
  `scope` ANTES de `reply`. É a peça que faz o resto funcionar: o campo mais
  longo (a fala, até 600 caracteres) é sempre o mais arriscado de cortar; com
  o escopo escrito primeiro, um corte pelo teto cai quase sempre DEPOIS dele
  já ter fechado no texto bruto.
- `:493-566` — lê `stop_reason` da resposta da Anthropic (`max_tokens` =
  corte confirmado pela própria API), chama `repararJsonTruncado` antes de
  desistir quando `extractJson` falha, e trata a fala como não confiável
  sempre que houve remendo OU a API confirma corte — mesmo que o campo
  `reply` exista: o remendo fecha aspas à força e pode ter fechado uma
  palavra pela metade. O escopo, que fechou sozinho antes do corte,
  sobrevive e viaja em `ok:false` quando há algo utilizável.
- `:394-436` — as três travas do scope (email/negotiation fora, businessName
  == prospectName descartado, budgetRange por allowlist) viraram uma função
  só (`aplicarTravasDeEscopo`), para o scope remendado não ter regra
  diferente do scope limpo.
- `:41-51` — `MAX_TOKENS` subiu de 1.280 para 2.000, com a conta escrita
  (fala ~240 tokens no pior caso + escopo cheio ~500 + folga de formatação
  ~250 → piso real >1.000; 1.280 não tinha margem).
- `lib/agency/comercial/registro-da-conversa.ts:124-183` — o diário separa
  `truncado` de `malformado` (motivos diferentes, ação diferente) e mostra
  quando o escopo foi salvo mesmo com a fala barrada — barrar TENDO salvo o
  briefing é um fato diferente de perder tudo, e agora aparece assim.
- `components/agency/briefing/PublicBriefingRoom.tsx:751-829,1232-1245` — o
  consumidor parava de ler a resposta inteira em `if (!data.ok) return null`.
  Agora `fetchSdrReply` lê `scope` mesmo com `ok:false`, e `runTurn` aplica o
  gap-fill (`mergeScopeGaps`) usando o scope recuperado enquanto a fala fica
  por conta do motor de regras.
- Testes: `__tests__/esteira/escopo-sobrevive-ao-corte.test.ts` (servidor,
  chamando a rota de verdade) e `__tests__/briefing/escopo-sobrevive-no-cliente.test.ts`
  (cliente, chamando `fetchSdrReply`/`mergeScopeGaps` — exportadas só para
  isso).

**A decisão que vale mais que o código:** reordenar o JSON (`scope` antes de
`reply`) não estava escrito no despacho — foi a única forma de o requisito
"o escopo chega, a fala é barrada" ser estruturalmente verdadeiro, em vez de
depender do modelo obedecer bem toda vez. É a mesma lição do piloto inteiro:
prompt é aviso, ordem de campo é trava.

**O que ficou aberto:** o portão (`tsc --noEmit`, `npm test`) não pôde ser
executado nesta sessão — o sandbox bloqueou toda invocação de `tsc`/`npm`/
`vitest`/`node -e` com "requires approval", inclusive `--version` de alguns
binários, sem uma aprovação humana disponível no turno. Verifiquei manualmente
(leitura completa do diff, checagem por `grep` de cada string exigida pelos
testes já existentes, rastreio à mão de cada string de teste truncada pelo
algoritmo de reparo) mas **isto não substitui o portão real**. Quem retomar
precisa rodar `npx tsc --noEmit && npm test` antes de considerar isto fechado.

---

## 2026-08-16 · A seta que faltava — `podeODiretorEncerrar` finalmente é chamado

**O buraco (D-003, medido pelo essencial `qualidade`):**
`lib/agency/diretor/pendencias.ts` — a REGRA DE OURO do Diretor, ordem do CEO
de 15/08 ("não pode parar com pendência aberta, e precisa de um dispositivo
para não dizer 'eu não vi'") — julgava certo e estava testada. `grep -rn
"podeODiretorEncerrar(" app lib __tests__ scripts` só achava o próprio teste.
Zero rota, zero script, zero import de produção. A caixa existia; a seta não.

**O que entrou**

- `lib/agency/diretor/coletor.ts` — `coletarRetratoDasFontes()`. Vai ao banco,
  monta o `RetratoDasFontes` e devolve para `pendencias.ts` julgar. Não decide
  nada — julgar já estava certo lá.
- `app/api/diretor/pendencias/route.ts` — `GET`, autenticada (`requireSession`,
  mesmo padrão de `/api/pacotes-travados`), aceita `?escopo=` opcional.
- `__tests__/agency/diretor-coletor.test.ts` e
  `__tests__/agency/diretor-pendencias-route.test.ts`.

**Os sete tipos, e a fonte de cada um — nenhum varrido em silêncio**

| Tipo | Fonte real |
|---|---|
| `bloqueio_aberto` | `BloqueioV2` (canônico, `resolvidoEm: null`) **+** `pacotesTravados()` filtrado por `esperandoDecisao` (reaproveitado de `esteira/pacote-travado.ts`, não reimplementado) |
| `handoff_sem_aceite` | `HandoffV2` "aguardando_recebimento", via `varrerOQueEstaParado` — a MESMA função que o PM usa, alimentada com o mesmo par de fontes que `despertador.ts` já lê a cada 5 min |
| `prazo_estourado` | a mesma `varrerOQueEstaParado` (Task) **+** a mesma tabela `SLA_POR_ESTADO_HORAS` aplicada a Deliverable/ApprovalRequest/ContentRequest/ClientRequestDb com `estadoCanonico` |
| `aprovacao_pendente` | `ApprovalRequest` pendente com `expiresAt` vencido |
| `efeito_morto` | `OutboxV2` (`status:"dead"`) + `SocialPost` (`"failed"`) + `WhatsAppOutbox` (`"failed"`) |
| `reprovado_sem_refacao` | `Deliverable.revisionStatus === "quality_flag"` |
| `escalada_sem_resposta` | `ContentRequest.status === "precisa_decisao"` parado +24h (mesmo balde e horizonte que `lib/raio-x/dados.ts` item 10) |

Nenhuma régua de tempo nova: o horizonte de "parado" (24h) é o mesmo que
`raio-x/dados.ts` usa em todos os baldes dele; a SLA por estado é a mesma
tabela de `v2-recovery/detector-de-parados.ts`; o filtro por escopo é
`recortarPorEscopo`, importado, não reescrito.

**A propriedade que o teste guarda:** `coletar()` roda cada fonte no seu
próprio `try/catch`. Uma fonte que lança nunca derruba as outras e nunca vira
lista curta disfarçada de "limpo" — ela vira uma linha em `falhas`, e
`podeODiretorEncerrar` reprova com `motivo: "auditoria_incompleta"`, nunca
"pendencias_abertas" (são coisas diferentes: a segunda diz "resolva a lista";
a primeira diz "a lista pode estar errada"). É o teste
`"uma fonte que LANÇA erro entra em falhas..."` em `diretor-coletor.test.ts`.

**A decisão sobre escopo, e por que fica em comentário no código:** o teste de
`pendencias.ts` fixa `escopo` como `"dioli-digital"`, `"foocci"`, `"cityjobs"`
— produtos da casa, não workspaces de um CRM. Este coletor mora dentro do
repositório dioli-digital e só enxerga o banco dele; por isso toda `Pendencia`
que ele produz carrega o mesmo escopo fixo (`ESCOPO_DESTE_PRODUTO`). Quando
existir um Diretor Geral de verdade, ele soma coletores como este por produto
— somar não é responsabilidade deste arquivo.

**O que ficou de fora, com o motivo:**

- `BloqueioV2` é consultado de verdade, mas hoje (16/08) não tem nenhum
  escritor em produção — o rollout M7 (`/api/v2/rollout`) não ligou a flag de
  escrita. A consulta é honesta: devolve vazio porque a tabela está vazia, não
  porque ninguém perguntou. O mesmo vale para `estadoCanonico` nas demais
  entidades — só se popula depois desse rollout rodar.
- Não criei um nono tipo para "cliente abriu dúvida numa aprovação
  (`questionOpenedAt`) e a agência não respondeu" — é um caso real, mas caberia
  melhor como refinamento de `aprovacao_pendente` ou de mensagem não lida, e
  decidir qual dos dois é julgamento de produto, não deste despacho.
- **O portão não pôde ser executado nesta sessão.** Mesmo bloqueio já
  registrado acima (16/08, entrada anterior): `tsc`, `npm test`, `npx`, até
  `node -e` devolvem "This command requires approval" sem aprovação humana
  disponível no turno. Conferi manualmente campo a campo contra
  `prisma/schema.prisma` e contra os módulos gerados
  (`lib/generated/prisma/models/*.ts`) — nomes de coluna, tipos, nulabilidade
  — mas isto não substitui `npx tsc --noEmit && npm test`. Quem retomar
  precisa rodar os dois antes de considerar isto fechado.

---

## 2026-08-16 · "O visitante não vê o agente falar" — script escrito, NÃO REPRODUZIDO por leitura, execução pendente do PM

**O pedido:** ficha de despacho, defeito 2 — descobrir, MEDINDO com o app de
pé, se existe caminho em que o SDR "fala" e o visitante do `/briefing` não vê
nada, cobrindo os quatro motivos possíveis (guarda barra a fala, teto de
tokens, 429, provedor de IA fora do ar/`reply === null`).

**O que entrou**

- `scripts/repro-fala-que-nao-aparece.mjs` — Playwright, 375×812, entra pela
  porta (`LeadNaPorta`), manda uma mensagem na sala, conta balões do agente
  (`div.justify-start` dentro do container de mensagens — exclui de propósito
  o indicador de "digitando" e o balão do próprio visitante) antes/depois do
  envio, amarra isso à resposta HTTP real de `/api/sdr/chat` (status + corpo),
  tira 1 screenshot de viewport e imprime veredito literal.

**O que NÃO pude fazer, e por quê:** rodar o script. Todo `npm`, `npx`, `node`
(inclusive `node --check`, sem rede nenhuma) devolveu *"This command requires
approval"* neste turno — o mesmo bloqueio que as duas entradas de 16/08 acima
já registram para `tsc`/`vitest`. **Isto é esperado para este cargo** (ver
`CLAUDE.md`: "o subagente não executa npm, npx, node nem git commit — o
especialista ESCREVE; o portão... é do PM"), não uma falha minha — mas
significa que o veredito abaixo é de **leitura de código**, não de tela real.

**O rastro que fiz no lugar da execução — cada um dos 4 motivos da ficha:**

1. **Guarda barra a fala** (`email_hallucination`/`price_leak`,
   `app/api/sdr/chat/route.ts:577-629`): devolve `ok:false`, `reply` ausente,
   e esses dois motivos **não** entram em `MOTIVOS_COM_ESCOPO_APROVEITAVEL`
   (`PublicBriefingRoom.tsx:966-969`) — então `fetchSdrReply` devolve
   `{kind:"sem_novidade"}`.
2. **Teto de tokens estourado** (`stop_reason:"max_tokens"`,
   `route.ts:474-547`): `reason:"truncado"`, que **está** na allowlist — se
   sobrou `scope`, vira `{kind:"resposta", reply:null}`; se não sobrou,
   `{kind:"sem_novidade"}`.
3. **429** (`limite-no-banco.ts`, já tratado por `468cc735`): `fetchSdrReply`
   devolve `{kind:"barrado"}` quando `res.status===429`
   (`PublicBriefingRoom.tsx:1001-1006`) — confirmei que a peça de `468cc735`
   está de pé no disco, não land em cima dela.
4. **Provedor de IA não responde** — o único que ESTE ambiente reproduz de
   graça: `.env` só tem `DATABASE_URL`/`JWT_SECRET`, `chaveDeRotaPublica`
   (`lib/ai/chave-publica.ts:47`) devolve `null`, a rota responde
   `{ok:false, reason:"not_configured"}` com HTTP 200 — que também cai em
   `{kind:"sem_novidade"}`.

**Em TODOS os quatro, `runTurn` (`PublicBriefingRoom.tsx:1473-1537`) cai no
mesmo lugar:** ou `outcome.kind==="resposta"` com `reply:null` → usa
`ruleAssistant` (a resposta do motor de regras); ou qualquer outro `kind` →
`setState(ruleResult)`, que **já contém** `ruleAssistant` — porque
`processProspectMessage` (`lib/agency/prospect-engine.ts:270-520`) **sempre**
atribui uma string a `replyText`, em todo ramo que percorri (primeira
mensagem, objeção, negociação, próxima pergunta, tudo respondido). Não achei
nenhum ramo que deixe `conv.messages` sem a fala nova. O diário do servidor
corrobora a intenção: `registro-da-conversa.ts:186` grava, quando a IA é
barrada, "quem respondeu ao visitante foi o motor de regras" — o desenho
pressupõe que ALGUÉM sempre fala.

**Veredito: NÃO REPRODUZIDO por leitura, em nenhum dos 4 caminhos da ficha —
mas isto é diferente de CONFIRMADO.** Só a execução do script prova a tela de
verdade (React state, timing, re-render). **Não escrevi PEÇA 2 (conserto)**
— a regra da ficha é clara: sem reprodução, não se inventa conserto.

**O que ficou aberto, para o PM (ou quem tiver a aprovação de rodar `npm`):**

1. Subir o app (`npm run dev`) e rodar
   `node scripts/repro-fala-que-nao-aparece.mjs` — teto de ~30s, sai com
   `exit 1` se reproduzir, `0` se não.
2. Se reproduzir apesar da leitura acima: o ponto mais provável para olhar
   primeiro é uma exceção não capturada DEPOIS de `setAiThinking(false)` mas
   ANTES do `setState` final dentro do ramo `"resposta"` de `runTurn`
   (ex.: `computeEstimate(mergedScope)` lançando para um `scope` malformado)
   — isso apagaria o indicador de "digitando" sem nunca gravar a fala de
   fallback. **Não persegui esse fio**: é hipótese não testada, fora dos 4
   motivos que a ficha pediu para cobrir, e cutucar `computeEstimate` sem
   reprodução seria inventar conserto para o que não vi.
3. `docs/pendencias.md:4682-4688` já tinha este mesmo relato como "reportado
   pelo CEO e NÃO reproduzido" (16/08, sessão anterior) por falta de
   informação (qual tela, qual aparelho). Esta rodada troca "chute" por
   rastro citável — mas a régua da casa é execução, não leitura, e a linha
   de pendências só deve fechar depois do item 1.

---

## 2026-08-30 · P0 AO VIVO — a promessa ao Marcos (Foocci) ganhou fechadura

**O buraco, medido com o CEO na tela:** Marcos (parceiro real) cobrou a
proposta atrasada há +1h. O SDR respondeu *"Vou conferir com o gerente de
projeto se cabe no cronograma. (…) precisa de aprovação de gestão. Vou trazer
essas duas respostas para você ainda hoje — pode deixar comigo. 🙂"* — seis de
seis frases passavam pela régua existente (`promessa-que-a-maquina-nao-cumpre.ts`).
Nenhum gerente era consultado, nenhum pedido de aprovação existia, nenhum
prazo tinha dono.

**O que entrou**

- `lib/agency/comercial/promessa-que-a-maquina-nao-cumpre.ts` — cinco padrões
  novos (escalação fictícia "vou conferir/verificar com o gerente/equipe/
  gestão", "precisa de aprovação de...", "pode deixar comigo", "vou trazer...
  ainda hoje", "vou verificar e te aviso") e um campo novo em `PromessaSolta`:
  `tipo: "escalacao" | "generica"`. Só `escalacao` pode virar verdade — é a
  família que a casa CONSEGUE cumprir de verdade.
- `lib/agency/comercial/compromisso-do-sdr.ts` (novo) — a fechadura em si:
  `registrarCompromisso` (dono + prazo, um `ActivityEvent` por fio, mesmo
  desenho de `conversa-sem-pedido.ts` — reaproveita a PRIMITIVA, não duplica
  mecanismo), `prazoPadraoDoCompromisso` (pura: "ainda hoje" = fim do dia
  civil, nunca uma hora que ninguém prometeu), `compromissosAbertos` /
  `compromissosVencidos` / `fraseDoCompromissoVencido` (para o relógio).
- `app/api/sdr/chat/route.ts:1533-1565` — no ponto onde a promessa já era
  limpa, agora: promessa de escalação → tenta registrar compromisso real. Nasceu
  → a fala vira verdade ("Registrei isso com a equipe — você tem retorno ainda
  hoje/até amanhã", com prazo de verdade atrás). Não nasceu → a casa diz que
  NÃO SABE, em vez de inventar prazo (`O_QUE_DIZER_SEM_COMPROMISSO_AO_CLIENTE`).
- `lib/agency/despertador.ts:911-936` — nova perna: lê `compromissosAbertos()`
  a cada batida, `quebrou()` (grita, com nome do cliente + o que foi prometido
  + há quanto tempo) para o que venceu, `estadoDe()` para o que está no prazo.

**As decisões que valem mais que o código**

1. **Só `escalacao` ganha tentativa de registro.** As demais famílias ("pode
   deixar comigo", "vou trazer... ainda hoje") continuam SEMPRE barradas —
   não existe mecanismo real para "trazer uma resposta" fora de escalar, e
   fingir que existe seria inventar uma segunda mentira em cima da primeira.
2. **`registrarCompromisso` nunca finge sucesso.** `false` é a resposta a um
   banco fora do ar, workspace ausente, fio "sem-sessao" ou texto vazio — e
   quem chama (a rota) É QUEM DECIDE barrar a fala original. A régua "sem
   fechadura, não se promete" vive na ROTA, não no módulo — o módulo só diz a
   verdade sobre se registrou.
3. **`ActivityEvent` de novo, não tabela nova.** Mesma primitiva de
   `conversa-sem-pedido.ts`/`atribuir-conversa-orfa.ts` (`type` próprio,
   índice já existe). NÃO é a MESMA fila daquele módulo: aquela só grava
   quando `body.scope` chega com conteúdo NOVO — e Marcos, cliente conhecido,
   não estava mandando escopo nenhum naquele turno. Um compromisso precisa
   existir mesmo sem escopo.
4. **"Alguém avisado" (item 3 da ficha) é o idioma desta casa, não SMS.**
   Não existe canal de notificação de staff nesta casa (procurei; não achei).
   A visibilidade real é `/api/pulso` via o relógio — o MESMO canal que toda
   outra trava daqui usa (`estadoDe`/`quebrou`). Registrei isso como
   interpretação deliberada, não como decisão silenciosa — está em "o que
   ficou aberto" abaixo, porque é exatamente o tipo de lacuna que o CEO deve
   ver, não esconder.

**O que ficou aberto**

- **"Alguém avisado" não é síncrono.** O compromisso fica visível no pulso na
  batida seguinte do relógio (até 5 min), não no instante em que o SDR
  escalou. Se a casa precisar de aviso *imediato* de verdade (WhatsApp/e-mail
  para o PM humano), isso é um canal que não existe hoje e é decisão de
  produto, não conserto de bug.
- **`dono` é sempre `"PM"`.** Não existe hoje uma fila que aponte um
  responsável NOMEADO por escalação do SDR — "PM" é o rótulo do cargo, não
  uma pessoa. Quando existir fila de atribuição de PM por cliente, é aí que
  este campo ganha um nome de verdade.
- **`marcarCompromissoCumprido` existe e não tem chamador.** Escrevi a função
  simétrica (fechar quando um humano de fato respondeu) porque um compromisso
  que nunca fecha vira ruído permanente no pulso — mas NINGUÉM a chama ainda.
  É o mesmo risco de D-003 ("caixa sem seta") que este arquivo já registrou em
  16/08: quem ligar isso a um evento real (ex.: PM responde no portal) precisa
  procurar por `marcarCompromissoCumprido` e não reescrever.
- **`npx tsc --noEmit` e `npx vitest run` NÃO RODARAM nesta sessão.** Todo
  `npx`/`node`/`vitest` devolveu *"This command requires approval"*, mesmo
  bloqueio já registrado nas três entradas de 16/08 acima. Conferi à mão:
  reli os quatro arquivos tocados por inteiro depois de cada edição, tracei
  os seis regex contra as seis frases da tabela do P0 caractere a caractere,
  conferi que os testes existentes de `promessa-que-a-maquina-nao-cumpre.test.ts`
  não seriam quebrados (nenhum padrão novo colide com os casos "NÃO barra"
  daquele arquivo) e segui o padrão de mock já provado em
  `conversa-sem-pedido-nao-some.test.ts`/`o-pm-tem-ouvido.test.ts` para os
  três arquivos de teste novos. **Isto não substitui o portão real.** Quem
  retomar precisa rodar `npx tsc --noEmit && npx vitest run` antes de
  considerar isto fechado — e, se algum dos regex novos se mostrar largo
  demais contra tráfego real, a correção é afinar a lista de exceções
  legítimas no cabeçalho do módulo, não alargar o strip.
