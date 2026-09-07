# O corredor — decisões que atravessam domínios

> Decisão que afeta mais de um especialista não mora na sala de nenhum deles.
> Mora aqui. **Só o PM escreve neste arquivo.**
>
> Decisão que serve a **mais de um projeto** não mora aqui: vai como proposta ao
> **Diretor Geral do Cérebro**, no `dioli-brain-kit`.


---

## O PARCEIRO ESPERANDO NA TELA REVELOU QUATRO DEFEITOS DE DINHEIRO — E O PIOR ESTAVA CALADO HÁ CINCO DIAS

**Decidido em** 2026-08-30 (madrugada) · **por** o CEO e o Diretor Geral, executado
pela sala do piloto · **origem:** o parceiro Foocci esperando na página da proposta,
cobrado indevidamente, depois de **quatro** promessas de retorno não cumpridas.

**A conclusão primeiro:** nenhum dos quatro defeitos era "faltava construir". Nos
quatro, a peça **existia**, e o que faltava era o **elo** — a maçaneta na porta que
já tinha fechadura. É a assinatura desta casa, e ela custou um parceiro real
esperando na tela.

### As decisões que atravessam domínios

- **A NEGOCIAÇÃO DE PREÇO ESTAVA MORTA HAVIA CINCO DIAS, EM SILÊNCIO.** A tabela de
  preço fechado (25/08) fez `minPrice === maxPrice` por construção, e a trava do
  desconto era `newTotal >= totalMin && newTotal < totalMax` — **condição impossível
  de satisfazer**. O SDR prometia "condição especial" e **nunca conseguiu conceder um
  centavo a ninguém**. *Uma decisão certa (preço fechado) matou outra decisão certa
  (desconto com piso) na junta entre as duas, e nenhum teste falhou — porque nenhum
  teste perguntava se a faixa ainda existia.* **Regra nova: mudança que colapsa uma
  faixa tem de quebrar quem depende da faixa, e não emudecer.**

- **UMA PEÇA, UM PREÇO.** A casa tinha **três** preços vivos para a mesma peça —
  R$ 90 (`planos.ts`), R$ 190/290 (avulso) e R$ 79/129 (balcão) — enquanto o
  embutido no plano era ~R$ 20. Decisão do Diretor Geral: **R$ 55, fonte única**, e
  `PECA_EXTRA` morre. *Verdade escrita em três lugares já está errada em dois.*

- **TETO DE ENTREGA NÃO É TETO DE VENDA — E A TELA DO CLIENTE NÃO SE SOBRESCREVE.**
  O código respondia *"não vendemos esse volume"* e *"36/mês (você pediu 28)"* — na
  sala de briefing **pública**, na tela do próprio cliente. Ordem do CEO: *"se o
  cliente quiser trezentos carrosséis por dia, a gente vai ter que dar um jeito"*.
  Passa a sair **preço + prazo**, sempre. **O preset vira oferta ("te dá mais peças
  por menos, quer?"), nunca encaixe.** O teto de produção continua verdadeiro — ele
  vira **prazo e decisão do CEO**, jamais recusa automática.

- **REVERSÃO DE DOUTRINA ASSUMIDA, NÃO APAGADA.** Em 27/08 a casa proibiu estampar
  o número pedido pelo cliente, porque **parecia contrato**. Em 30/08 o CEO mandou
  dar preço ao que o cliente pediu. **Mesma tela, mesmo cliente, três dias.** As duas
  posições tinham razão, e a saída foi reconciliar: mostra o pedido **com preço**, e
  o que a guarda antiga defende (não parecer contrato, nunca "a definir") continua
  defendido. **Cada asserção alterada explica no próprio teste por que mudou.**
  *Guarda que se apaga para ficar verde é a dívida mais cara desta casa.*

- **PROMESSA SÓ SAI COM FECHADURA.** O SDR dizia *"vou conferir com o gerente"* e
  *"trago ainda hoje"* sem que existisse gerente, pedido de aprovação, tarefa, prazo
  ou dono. A trava **já existia e já estava ligada** — e **as seis frases reais
  passavam**. Agora a promessa registra compromisso com dono e prazo no mesmo ato; não
  registrou, **a frase não sai**.

- **CANCELAR DEIXA DE SER MUDO.** Aprovar, ajustar e recusar avisavam alguém.
  Cancelar gravava um status que **nenhuma tela lia**, e a produção seguia — a casa
  pagando IA por peça que ninguém ia usar. Junto, fechou uma **corrida** que ninguém
  tinha visto: a peça cancelada no meio da rodada era publicada assim mesmo.

### As lições de método, que valem além destes defeitos

- **A frase composta esconde o buraco da frase simples.** A sonda da promessa deu
  verde na mensagem inteira e vermelho em cada oração isolada. *Régua que testa o
  todo pode esconder o furo da parte.*
- **Régua verde que não pega a regressão é pior que régua nenhuma.** A trava do preço
  congelado nasceu **falsa**: o teste batia num banco real, mas nunca chamava a
  função duas vezes, e `COALESCE(NULL, ?)` é igual a `?`.
- **Preço forçado para bater com a expectativa é a mentira mais cara que um sistema
  conta.** Pediram R$ 700; nenhuma régua da casa produz R$ 700 (dá R$ 790). O
  especialista **parou e trouxe a conta** em vez de inventar uma curva.
- **Antes de pedir ação humana, confira se o mecanismo já tem saída.** O Diretor
  escalou ao CEO uma colisão de reivindicação que **expira sozinha em 24h**, por regra
  própria da casa. *Pedir ajuda desnecessária gasta a atenção que a urgência real vai
  precisar.*
- **Reivindicação forçada tem custo coletivo.** A forçada do Diretor deixou o
  sentinela vermelho para **todos os PRs da casa**. Foi encerrada assim que medida:
  o custo dos outros era maior que o benefício próprio.
- **Especialista que não pode rodar o portão precisa DIZER isso no topo.** Nesta
  sessão, três relatos apresentaram raciocínio declarado como raciocínio — e foi por
  isso que os furos apareceram no portão do Diretor, e não no cliente.

---

## A JUNTA ENTRE DUAS DECISÕES CERTAS ENTOPE A FILA DE ORÇAMENTO; UM NÚMERO PÚBLICO ERA MANIPULÁVEL; O DIRETOR TRAVOU O RESET DE PRODUÇÃO

**Decidido em** 2026-08-16 (noite) · **por** `esteira`, a pedido do Diretor ·
**origem:** medição de produção da fila de orçamento
(`docs/medicoes/elo-9-orcamento.md`), auditoria da contagem de
`resgate_do_escopo`, e decisão direta do Diretor sobre `ALLOW_PRODUCTION_RESET`.

**A conclusão primeiro:** o achado mais grave da noite não é um bug isolado — é
que **duas regras corretas, tomadas em datas diferentes por motivos bons**,
produzem um defeito de produção só na junta entre elas. Junto disso, uma
métrica que o CEO lê como termômetro da casa estava aberta a qualquer
visitante do site, e o Diretor tomou uma decisão reversível para fechar um
risco medido como "desconhecido há 15 dias".

### As decisões que atravessam domínios

- **A LIÇÃO ESTRUTURAL: DECISÕES CERTAS PODEM PRODUZIR DEFEITO NA JUNTA ENTRE
  ELAS.** A fila de orçamento processa 5 pedidos por rodada, dos mais antigos
  para os mais novos, e quem nunca gera orçamento também nunca muda de estado
  — então ocupa uma vaga para sempre e barra quem já tem orçamento pronto atrás
  dele. Isso nasce do encontro de duas regras certas tomadas isoladamente: manter
  lead sem contato na fila ("faltar contato não é faltar pedido", 08/08) e não
  inventar número sem dado ("sem número derivado não se inventa número").
  Nenhuma das duas está errada sozinha. Medição completa e provada (não
  suposta) em `docs/medicoes/elo-9-orcamento.md`; conserto em curso por outro
  `pm`, com decisão pendente sobre dar estado terminal a quem nunca gera
  orçamento, paginar por cursor, ou separar as duas filas.
- **A CONTAGEM DE `resgate_do_escopo` ERA MANIPULÁVEL POR QUALQUER
  VISITANTE.** Não filtrava quem escreveu a frase, e a fala do visitante mora
  na mesma tabela, gravada por rota pública sem autenticação — bastava digitar
  a frase no chat para inflar o número que o CEO lê como métrica da casa.
  **Fechado, e provado por plantio e reversão.**
- **O DIRETOR TRAVOU `ALLOW_PRODUCTION_RESET` EM `"false"` EM PRODUÇÃO —
  DECISÃO DELE, NÃO MEDIÇÃO DE AGENTE.** A variável é lida por comparação
  estrita (`!== "true"`) em duas rotas, e seu estado estava desconhecido havia
  15 dias — "não medido conta como reprovação" nesta casa. Mudar a variável é
  reversível em trinta segundos e anda na direção segura; **o CEO reverte em
  uma linha, no cofre do Railway.** ⚠️ A decisão **não alcança**
  `reset-request`, que usa outro segredo e segue aberto.
- **OUTROS ACHADOS DA MESMA RODADA, JÁ NO DIÁRIO
  (`docs/pendencias.md`):** um teste que era verde às 20h e vermelho às 4h
  (dependia do relógio — defeito que some perto da meia-noite é pior, não
  melhor, porque deixa de ser reproduzível justo quando alguém investiga);
  varredura de segurança fechada, com um achado ainda aberto (segredo
  comparado com `===` vaza pelo tempo de resposta); `schema.prisma` e
  `lib/generated/prisma` já haviam divergido em silêncio, e o mecanismo achou
  4 campos onde a inspeção humana achou 1; três verdades sobre onde mora o
  banco local (`.env` relativo por `cwd`, Prisma CLI por diretório do schema,
  `prisma.config.ts` com fallback próprio) e o SQLite cria banco vazio em
  silêncio em vez de dizer "não achei"; e a trava de reivindicação foi usada
  por várias sessões no mesmo dia, chegou a aprovar o que devia barrar (falso
  negativo provado por caso montado, já fechado nesta mesma seção do corredor
  — ver "IDENTIDADE DE TRAVA VIRA DERIVADA" abaixo) e barrou o próprio autor
  mais de uma vez, a melhor prova de que pegou.

### O que continua aberto, sem dono, fora do fluxo de hoje

- 🔴 Fila de orçamento entupida — conserto em voo por outro `pm`, não é
  pendência sem dono.
- 🔴 `RESEND_FROM` ausente em produção — e-mail falha para todos, calado. Sem
  dono.
- 🔴 DNS do domínio sem `www` no registrador — ação de gente, no registrador.
  Sem dono, depende do CEO.
- 🔴 `PILOTO_SECRET` ausente — sem dono.
- 🔴 `KIT_REPO_TOKEN` não provisionado — bloqueia o espelho do kit. Sem dono,
  depende do CEO.
- 🔴 Cópia de segurança nunca restaurada, e apagamento não exige cópia
  recente. Sem dono.
- 🔴 `reset-request` sem sessão e sem escopo — não alcançado pela decisão do
  Diretor acima. Sem dono.
- 🔴 Migration do `DATETIME`. Sem dono.
- 🔴 Fichas duplicadas em produção, esperando decisão do CEO desde 08/08. Sem
  dono, decisão é do CEO.
- 🔴 Backfill da `chaveDoProspect` — armado, não disparado, esperando o CEO.
  Sem dono, decisão é do CEO.
- Tela da fila ainda não mostra o "irmão fora da janela" que a API já devolve
  — tem dono, outro `pm` em voo.
- Limitação da identidade por worktree — frente de outra sessão, já em curso.

---

## BARRAR POR ENGANO É BENIGNO; APROVAR POR ENGANO MATA O MECANISMO — IDENTIDADE DE TRAVA VIRA DERIVADA, NUNCA DECLARADA

**Decidido em** 2026-08-16 · **por** `esteira`, sob despacho do Diretor ·
**origem:** teste montado de propósito contra a trava de reivindicação, mais o
achado irmão na fila de leads e no robô de espelho do kit.

**A lição que atravessa:** quatro vezes hoje um defeito só apareceu porque a
ferramenta foi **exercitada**, não porque um teste ficou vermelho — e o falso
negativo da trava só foi encontrado porque alguém exigiu **provar** o medo
antes de consertar. Hipótese que ninguém tenta reproduzir vira ou pânico ou
descaso, nunca conserto.

### As decisões que atravessam domínios

- **CRITÉRIO NOVO PARA TODA TRAVA DESTA CASA: BARRAR POR ENGANO É O MODO
  BENIGNO; APROVAR POR ENGANO É O QUE MATA O MECANISMO.** Provado, não
  suposto: com identidade herdada gravada como própria, a trava de
  reivindicação respondeu "✅ Sem colisão" e saída `0` sobre um arquivo sob
  reivindicação viva de outra sessão. Falso positivo é barulhento e barato;
  falso negativo é silencioso e ensina a casa a confiar num mecanismo que não
  protege mais nada. Diante de dúvida, toda trava desta casa escolhe o lado
  que faz barulho.
- **IDENTIDADE DE REIVINDICAÇÃO PASSA A SER DERIVADA, NUNCA DECLARADA.** A
  causa raiz do falso negativo era conceitual: o id era uma flag digitada por
  alguém (`--quem`), e declaração não verificada não é identidade. Conserto:
  a identidade nasce do caminho absoluto do worktree — determinística, única
  por worktree, impossível de herdar e impossível de digitar errado, porque
  ninguém mais digita. `--quem` vira só rótulo legível; `git config
  dioli.quem` nunca mais decide nada. Reivindicações antigas no remoto não
  quebram — nunca serão reconhecidas como "minhas" por ninguém, que é o lado
  seguro.
- **CONTAGEM DE REPETIÇÃO SAI DA MEMÓRIA E VAI PARA O BANCO — E A RESPOSTA
  CONFESSA A JANELA.** A fila de leads agrupava repetição só sobre as últimas
  solicitações carregadas: irmão fora dessa janela não aparecia, e a tela
  chamava de "1ª vez" quem já tinha escrito várias. O teto **não** foi
  aumentado — lição já registrada desta casa (empurrar o teto só adia o mesmo
  problema). A contagem passou a vir do banco via `chaveDoProspect`, e a
  resposta nomeia separadamente total no banco, irmãos visíveis e irmãos fora
  da janela — mostrar menos do que existe sem avisar é mentir por omissão.
  Falha de contagem cai para parcial, nunca vira zero silencioso.
- **O ESPELHO DO `DIOLI-BRAIN-KIT` PASSOU A EXISTIR, COM CARIMBO QUE NÃO
  MENTE QUANDO FALHA.** O carimbo estava parado havia uma semana e nenhum
  workflow desta casa espelhava nada — doutrina ausente lendo como doutrina
  completa. Agora há robô diário e sob demanda, e o carimbo grava tentativa,
  erro e estado mesmo quando falha. Achado medido, não contornado: o kit é
  repositório privado separado e o token do Actions não alcança fora deste
  repositório — falta `KIT_REPO_TOKEN`, decisão do CEO.

### O que continua aberto, sem dono, fora do fluxo de hoje

- 🔴 `KIT_REPO_TOKEN` não provisionado — bloqueia o espelho do kit.
- 🔴 Backfill de `chaveDoProspect` segue armado, esperando o CEO decidir
  rodar — escrita em dado real de cliente não é de agente.
- A tela da fila de leads ainda não consome o dado novo de "irmão fora da
  janela" — API pronta, tela com outro dono em voo.
- Fichas duplicadas em produção esperando decisão do CEO desde 08/08.
## A COLHEITA DEPOIS DAS 18:21 FOI MAIOR QUE A DE ANTES: CINCO VEZES "PARECE CERTO, NÃO ESTÁ", E O DEPLOY QUE NINGUÉM CONFERIU

**Decidido em** 2026-08-16 · **registrado pelo** Essencial `cerebro`, a pedido do
Diretor, consolidando o trabalho entre o último registro (`6007fda2`, 18:21) e
agora · **origem:** `reivindicacoes/`, `app/api/sdr/chat/route.ts`,
`components/agency/briefing/PublicBriefingRoom.tsx`,
`lib/agency/question-engine.ts`, `scripts/reivindicar.mts`,
`app/api/piloto/diagnostico/route.ts`

**A conclusão primeiro:** a colheita depois do último registro é maior que a de
antes dele. Cinco vezes hoje um defeito passou por certo porque nada nele
denunciava que estava errado; o mesmo formato de erro ("duas portas para o mesmo
dado") se repetiu três vezes; e os dois portões que o Diretor cobrou o dia
inteiro (`tsc`, testes) não dizem nada sobre produção — enquanto ele cobrava,
funil quebrado e cotação errada seguiam valendo para quem visitasse o site.

### 🔴 PADRÃO 1 — "parece certo, não está, e nada denuncia" (5 casos medidos hoje)

1. **Número truncado não tem marca.** `postsPerWeek: 14` cortado no dígito virava
   `postsPerWeek: 1`, e `JSON.parse` aceitava — já registrado em
   `docs/pendencias.md` (seção "A REIVINDICAÇÃO VIROU TRAVA"). Cito, não repito:
   string truncada salta aos olhos ("Ana Doces e Bolos Personaliza"), número
   truncado não.
2. **A allowlist do cliente apontou para nomes de motivo MORTOS depois de um
   merge.** `components/agency/briefing/PublicBriefingRoom.tsx:950-966`: o merge
   de reconciliação (`5d806a60`) renomeou `parse_error_truncado`/
   `parse_error_formato` para `truncado`/`malformado` no servidor
   (`app/api/sdr/chat/route.ts:580,607`), e a allowlist do cliente
   (`MOTIVOS_COM_ESCOPO_APROVEITAVEL`) continuou apontando para os nomes antigos
   por algumas horas (commit `8f75e0cd`, 17:20). **Fail-closed segurou — nada
   vazou —, mas o resgate do escopo (R$ 500/mês, 2 posts/dia) teria ficado
   DESLIGADO em produção, em silêncio.** Nenhum teste acusava porque os dois
   lados eram mockados separadamente, cada um provando a própria ficção — "peça
   verde, junta rompida", de novo. Trava nova:
   `__tests__/esteira/allowlist-bate-com-o-servidor.test.ts`, que chama a rota
   de verdade em vez de mockar os dois lados.
3. **"Somos de estética" fechou a pergunta de serviço sem colher serviço.**
   `lib/agency/question-engine.ts:242-260` (`detect_service`, commit `d6d5110f`).
   O código antigo dizia, com todas as letras, *"Non-identity questions keep the
   original 'asked = answered' behavior"* — uma resposta que não nomeia serviço
   nenhum era tratada como respondida. No turno seguinte a pessoa disse "quero
   social media", mas a pergunta da vez já tinha mudado, e a frase virou
   objetivo — o serviço nunca foi gravado, e o portão de envio nunca abria.
4. **"2 posts por dia" virava 2 por semana — cotação 7× abaixo.**
   `lib/agency/question-engine.ts:108` (`frequenciaSemanal`), usada em `:312`
   (commit `78df6c60`). Antes: `postsPerWeek = 2` → estimativa R$600–900. Depois:
   `postsPerWeek = 14` → R$4.000–6.500. "2" é plausível para a pergunta feita;
   nada denunciava o erro.
5. **A falha do SDR aparecia como resposta normal do bot.**
   `components/agency/briefing/PublicBriefingRoom.tsx:799-827` (`SdrOutcome`,
   commit `468cc735`). `fetchSdrReply` fazia `if (!res.ok) return null`, e o
   motor de regras — calculado ANTES da chamada — preenchia a próxima pergunta
   no lugar, cronologicamente coerente, nada pisca. *"É pior que tela em branco:
   tela em branco a pessoa questiona; esta ela acredita."*

**A mesma causa nos cinco:** um tipo ou contrato pobre demais para expressar o
fato que precisava expressar — `null` sem motivo, ausência sem marca, "respondido"
sem verificar o quê. Não é sorte de quem achou cada um: é o formato do erro desta
casa hoje.

### 🔴 PADRÃO 2 — a mesma pergunta entra por DUAS PORTAS, e consertar uma deixa a outra vazando

- **Nome do negócio.** `prospect-engine` (e-mail do prospect virando nome do
  negócio, fechado em `74810b75`) e a página pública
  (`components/agency/briefing/PublicBriefingRoom.tsx:1344`, fechado em
  `24fd4015`) gravavam o mesmo campo por caminhos diferentes; consertar a
  primeira porta deixou a segunda gravando o nome da PESSOA no campo do NEGÓCIO
  por mais um ciclo.
- **Cadastro de cliente.** Já registrado nesta página, seção "MESMO CONTATO,
  VÁRIOS BRIEFINGS": a aprovação criava um `Client` novo a cada solicitação
  porque a chave nunca era persistida na origem.
- **Volume de posts.** A pergunta (`lib/agency/question-engine.ts`, corrigida) e
  a NEGOCIAÇÃO em turno de conversa ("quero mais posts, 2 por dia") gravam o
  mesmo campo por caminhos diferentes — a segunda porta regravava pela unidade
  errada, refazendo o erro que a primeira porta já tinha corrigido (commit
  `96440ea5`). Trava: `volumeNaUnidade(texto, "semana"|"mes")` parametrizada —
  nenhuma porta pode voltar a ler número cru.

**A lição que fica, e serve além do SDR:** dedup, conversão de unidade ou
qualquer regra que "protege um campo" só protege esse campo se TODAS as portas
que o escrevem passarem pela mesma função. Achar e consertar uma porta prova que
existe mais de uma — nunca prova que só havia uma.

### 🔴 PADRÃO 3 — o tipo pobre é a causa, não o `if`

Duas vezes na MESMA função (`fetchSdrReply`,
`components/agency/briefing/PublicBriefingRoom.tsx`):

- `reply: string` não conseguia expressar "sem fala, com escopo" — motivou
  `reply: string | null` dentro de `SdrOutcome` (linha 816).
- `null` sozinho achatava três fatos opostos — recusado por limite (429),
  sistema fora do ar (503), sem novidade da IA (200 vazio) — motivando o tipo
  `SdrOutcome` inteiro (linhas 811-827), um `kind` por motivo.

Remendar o `if` (como o commit anterior, #177, já tinha feito uma vez) deixaria
a armadilha de pé para a próxima pessoa. A trava aqui é de DESENHO — o tipo —
não de teste.

### 🔴 A LIÇÃO DO DIRETOR — dele, com todas as letras

O Diretor cobrou `npx tsc --noEmit` e `npm test` o dia inteiro, de cada
especialista, e **nunca conferiu se a produção estava no ar**.
`app/api/piloto/diagnostico/route.ts:1-18` registra por quê isso não é
acadêmico: três vezes a medição de produção parou em `railway login`
(interativo, sem credencial no ambiente), e a resposta da casa foi construir
instrumento de leitura em vez de escalar a pergunta. Enquanto isso, o funil
quebrado ("Somos de estética", padrão 1 item 3) e a cotação 7× abaixo (padrão 1
item 4) — os dois corrigidos NO CÓDIGO ao longo do dia — **continuaram valendo
para quem visitava o site**, porque nenhum dos dois portões que o Diretor
cobrava mede se o deploy aconteceu. **"Está no ar?" é portão, não suposição.**

⚠️ **Já há pm construindo o mecanismo** — `pm-distancia-deploy`, reivindicação
`distancia-do-deploy` (`reivindicacoes/distancia-do-deploy.json`, aberta 18:44,
ainda não fechada), medindo quantos commits o deploy está atrás. Não construí,
não dupliquei — só registro que existe e cito.

---

### A proposta ao Diretor Geral do Cérebro — recorte e justificativa, item por item

**Proposta. Nada foi escrito no `dioli-brain-kit`.**

1. **PADRÃO 1 ("parece certo, não está") — PROPONHO SUBIR.** Serve a qualquer
   produto: valor truncado sem marca, allowlist apontando para nome morto após
   rename, "respondido" sem verificar o quê, unidade errada mas plausível, erro
   mascarado de resposta normal — nenhum destes é específico de agência de
   marketing. A doutrina do Foocci (claim-vs-snapshot) já cobre parte disto para
   TEXTO gerado por IA; este padrão é a mesma doença um andar abaixo, em TIPO e
   CONTRATO de dado.
2. **PADRÃO 2 ("duas portas") — PROPONHO SUBIR.** Não é específico de SDR: é a
   forma que "dedup", "normalização" e "trava" tomam sempre que o mesmo campo
   nasce por mais de um caminho de escrita. Apareceu 3× hoje neste produto
   sozinho.
3. **PADRÃO 3 ("tipo pobre é a causa") — PROPONHO SUBIR, como corolário de
   "ausência de informação não é informação".** A doutrina já manda não
   inventar dado; este padrão acrescenta a parte construtiva: o TIPO precisa ter
   um lugar para "eu não sei o motivo" — `null` sozinho não é esse lugar.
4. **"Está no ar" é portão — PROPONHO SUBIR A LIÇÃO, NÃO O MECANISMO.** O
   mecanismo (`distancia-do-deploy`, commits-atrás via git) é implementação
   específica deste repositório e do Railway. A doutrina cabe numa frase: nenhum
   portão que só olha código (typecheck, teste) prova que o código chegou a
   produção; produto com deploy contínuo precisa de um portão que meça a
   distância entre HEAD e o que está servindo.

Se algum destes já estiver coberto por doutrina existente do kit, prefiro que o
Diretor Geral aponte a doutrina em vez de eu duplicar — não confirmei isso
porque `docs/kit/` está parado há 7 dias (ver `CLAUDE.md`) e pode existir algo
que eu não alcanço daqui.

---

### 🔴 O que segue aberto agora — com dono ou "sem dono", conferido no `reivindicacoes/`

- **`RESEND_FROM` ausente em produção.** Sem dono.
- **DNS sem `www` (apex devolve 404).** Sem dono — pendência do CEO
  (`docs/pendencias.md:3989`).
- **CSRF nas rotas de escrita interna — parecer em andamento**, dono
  `pm-9ab49074` (`reivindicacoes/seguranca-csrf-rotas-de-escrita.json`, aberta
  19:00, ainda sem parecer fechado). A casa depende só de `SameSite=lax` até lá.
- **Cookie httpOnly assinado nas 3 rotas do SDR (`chat`/`upload`/`transcribe`) —
  adiado, com o motivo escrito** em `app/api/sdr/chat/route.ts:418-430`: o
  `seguranca` recomendou adiar porque o ganho é modesto (não fecha para quem
  trata cookie-jar) e exigiria as três rotas juntas. Sem dono agora.
- **`DATETIME` comparado como TEXT no SQLite**, em
  `lib/agency/v2-recovery/processador-outbox.ts` — em andamento, dono
  `pm-distancia-deploy` (`reivindicacoes/outbox-datetime-como-texto.json`,
  aberta 18:44, ainda não fechada).
- **Fichas duplicadas desde 08/08 (Camila Pereira).** Sem dono — fusão é decisão
  do CEO, como já registrado.
- **Script de captura (`scripts/foto-barrado-e-quebrado.mjs`) lê alerta vazio a
  375px — falso alarme, o próprio script declarou o defeito** (ver o commit
  `8958662e`). Em andamento — dono `pm-9ab49074`
  (`reivindicacoes/briefing-instrumento-que-mente.json`, aberta 19:08, a mais
  nova de todas: sem conserto ainda).
- **`ESFRIAMENTO_MS = 6000` em
  `components/agency/briefing/PublicBriefingRoom.tsx:1361` — escolhido sem
  medida**, só com o raciocínio de tempo para compor a próxima frase. Sem dono;
  risco baixo, dívida declarada.
- **Agrupamento da fila de leads ainda lê no máximo 200 solicitações** (irmão
  fora das 200 não aparece como repetição) — em andamento, dono `pm-a27b5772`
  (`reivindicacoes/fila-irmao-fora-do-teto.json`, aberta 18:50).
- **Volume declarado chegando a zero / verba declarada ignorada na estimativa —
  outra frente, ainda aberta** (não confundir com o item 4 do Padrão 1, esse já
  fechado). Dono `pm-verba-e-volume`
  (`reivindicacoes/esteira-escopo-e-preco.json`, aberta 18:51, sem conserto).

> 🔗 Detalhe operacional do dia — a identidade herdada entre worktrees (rodada 3
> do mecanismo de reivindicação), o freio por `sessionId` e a ressalva sobre o
> que ele não cobre, e as três ferramentas armadas esperando o CEO — está no
> diário, `docs/pendencias.md`, não repetido aqui porque não atravessa domínio:
> é operação de uma frente só.
---

## ALARME QUE MENTE SOBRE A CAUSA É PIOR QUE ALARME AUSENTE

**Decidido em** 2026-08-16 · **por** `pm` (frente do portão de deploy) ·
**origem:** o sentinela do deploy gritou falso positivo no meio da própria
janela de trabalho, medido às 19:00Z de 16/08.

**O fato:** em 16/08/2026 o sentinela do deploy acusou "A produção está
servindo c52aff2 e NÃO existe CI verde para esse commit (nenhum run foi
criado)". O alarme era falso. O commit
`c52aff29347a614c1bc09cb9cf7efa016472848e` **tem** run do workflow CI, evento
push, `completed`/`success`, criado 18:32:11Z:
https://github.com/diolisantos10/diolidigital/actions/runs/31964881543
E o próprio sentinela, rodando no GitHub Actions com credencial válida,
fechou `success` às 18:46:32Z:
https://github.com/diolisantos10/diolidigital/actions/runs/31965590314

**A causa, em arquivo:linha:**
- `lib/plataforma/consulta-de-ci.ts:60` — `if (!rc.ok) return vazio;`
- `lib/plataforma/consulta-de-ci.ts:72` — `if (!rr.ok) return { ...vazio, shaCompleto };`
- `lib/plataforma/consulta-de-ci.ts:62` e `:89-91` — os dois `catch { return vazio }`
- o texto que sai disso: `lib/plataforma/sentinela-do-deploy.ts:152` e
  `:234-235` — "nenhum run foi criado"
- Reprodução: neste ambiente o fetch do Node recebe 403 sem token e 401 com o
  `GITHUB_TOKEN` local; pelo `curl`, que passa pelo proxy, a mesma API
  responde 200 com o run verde.

**O coração da decisão:** `houveRun: false` significa "NÃO CONSEGUI
PERGUNTAR" e está sendo impresso como "O MUNDO NÃO TEM RUN". São dois estados
diferentes, com ações diferentes. Falar pelo lado seguro (o comentário em
`consulta-de-ci.ts:46-47` já assume isso de propósito) resolve a
**gravidade** — ausência nunca vira aprovação, e isso está certo e continua
valendo — mas **não** resolve a **ação impressa**: mandar "Disparar a CI
neste commit" quando a CI já passou treina a casa a ignorar alarme. Numa casa
que roda 100% IA sem revisão humana, alarme que mente é pior que alarme
ausente: o ausente deixa a dúvida viva, o mentiroso a mata.

**O buraco de teste** (laudo do `qualidade`, somente leitura): cobertura
**zero** do caminho HTTP não-ok. Não existe teste que toque
`olharCI`/`olharPlataforma`; `sentinela-do-deploy.test.ts` e
`porta-de-emergencia.test.ts` montam `ci: { houveRun, conclusao }` à mão e
nunca passam pelo fetch. Não é teste fraco: é ausência total.

**O conserto proposto**, e que não afrouxa portão nenhum: um código de
veredito novo (`SEM_RESPOSTA_DO_GITHUB`) carregando o status HTTP no texto,
mantendo gravidade não-ok e saída `!= 0`, com ação "conferir
credencial/rede — até lá a produção está NÃO VERIFICADA" em vez de "disparar
a CI". O `switch` de `julgarDeploy` não tem `default` e o `tsconfig` é
`strict`: o compilador **obriga** quem adicionar o código novo a tratar o
caso — e por isso ninguém deve adicionar um `default` "conveniente". Segunda
metade da trava: o conserto só nasce pronto com teste cobrindo 401, 403, 404,
429, 5xx e timeout.

**Quem executa:** a execução está com a reivindicação `distancia-do-deploy`
(`pm-distancia-deploy`, aberta 16/08 18:44:10Z), que já detém
`lib/plataforma/consulta-de-ci.ts`. É por **reivindicação**, não por mérito.
Ninguém deve reabrir isto como frente nova.

**O achado irmão, medido, item próprio** — o `concurrency:
cancel-in-progress: true` do workflow CI está deixando a produção para trás.
Números medidos às 19:00Z de 16/08: HEAD da branch `844abde4`; último commit
com CI verde `c52aff29` (18:32Z); 21 commits desde o último verde, **todos**
`cancelled` ou sem run; produção servindo `c52aff2`, ou seja 21 commits atrás
do head, mas **com** prova verde. A cadência de push (~1,3 min entre commits)
é menor que o portão (~8 min), então todo run é cancelado antes de terminar e
nenhum commit novo consegue ficar verde. O que desarma metade do susto: dos
35 commits sem run nenhum na janela de 120, 21 são commits que não eram a
ponta do push (o GitHub só cria run para a ponta) — isso **não** é buraco de
cobertura, porque o conteúdo deles está na árvore da ponta. A saída **não** é
remover o `cancel-in-progress` sem prova, porque ele existe para apagar o
ruído vermelho que esta casa já pagou para apagar (o comentário em
`.github/workflows/ci.yml:23-38` conta o caso).

---

## MECANISMO NÃO EXERCITADO NÃO É MECANISMO PRONTO — E TRÊS REGRAS QUE SAÍRAM DISSO

**Decidido em** 2026-08-16 · **por** três `pm`s em frentes separadas, consolidado
pelo `esteira` · **origem:** provisionamento de sessão, trava de reivindicação
(deadlock do primeiro dia de uso) e o destino de `chaveDoProspect`.

**A lição que atravessa os três casos:** um defeito só apareceu, nas três
frentes, porque alguém **exercitou** o mecanismo no modo em que ele vive de
verdade — não porque um teste ficou vermelho. Teste verde com ferramenta
quebrada é a peça verde de junta rompida. Mecanismo novo tem que ser usado de
verdade antes de ser dado como pronto.

### As decisões que atravessam domínios

- **O AMBIENTE DE SESSÃO VIROU MECANISMO, NÃO CONVENÇÃO.** Sessão nova podia
  nascer sem `node_modules` e sem `.env`, e três `pm`s diferentes concluíram
  "repositório quebrado" quando faltava provisionar. Agora há gancho
  `SessionStart` síncrono que instala dependências, gera o cliente do Prisma e
  só então provisiona `.env`/banco de desenvolvimento — nunca sobrescreve
  `.env` existente, nenhum segredo de produção, sempre sai `0`. Só foi
  considerado pronto depois de provado em três condições distintas (do zero,
  ambiente já pronto, `PATH` sem `npm`/`npx`) — e só depois disso apareceram os
  dois defeitos que faltavam: `.gitignore` ignorava `.claude/*` (gancho não
  versionado não existe para ninguém) e o bit de execução precisou ser
  conferido no índice do git (`100755`, não `100644`).
- **IDENTIDADE DE REIVINDICAÇÃO MORA POR WORKTREE, NUNCA NO COMMON-DIR.** A
  trava de reivindicação (decisão anterior, "A COORDENAÇÃO ENTRE SESSÕES...")
  prendeu quem a obedeceu no primeiro dia de uso real: `git config --local`
  grava em `GIT-COMMON-DIR`, compartilhado por todos os worktrees — a gravação
  era recusada fora do worktree isolado, silenciosamente, e o mesmo arquivo
  compartilhado podia fazer um `pm` herdar a identidade de outro, o que faria a
  trava **aprovar** o que deveria **barrar**. Identidade errada é pior que
  identidade ausente. Conserto: identidade em `.dioli-quem`, na raiz de cada
  worktree, ignorado pelo git, um por worktree.
- **CRITÉRIO DE ACEITE DE TODA TRAVA DESTA CASA: O CAMINHO HONESTO PRECISA SER
  MAIS BARATO QUE O ATALHO.** Achado no mesmo incidente: `conferir --quem`
  passava limpo mas não gravava identidade — quem obedecesse teria que repetir
  a flag para sempre, enquanto `--no-verify` resolvia de uma vez. Quando o
  atalho é mais barato, todo mundo pega o atalho e a trava morre — e aí o
  errado é a trava, não quem desviou dela. Vale para qualquer trava futura
  desta casa, não só esta.
- **`chaveDoProspect` FICA NA TABELA E PASSA A SER LIDA — não removida, não
  ignorada.** Era gravada e nunca lida em produção. Não é removida porque
  `DROP COLUMN` em SQLite reconstrói a tabela sobre o volume do Railway (o
  mesmo custo já evitado no `DriveMaterial`), e porque é a única porta para
  tirar o agrupamento de duplicados da memória. A rede declarada: linhas
  legadas têm chave nula e hoje só se agrupam pelo recálculo; substituir o
  recálculo pela coluna pura seria regressão silenciosa. Cada grupo passa a
  carregar a **procedência** da chave (coluna ou recalculada). Um backfill foi
  entregue **armado, não disparado** — mede por padrão, exige flag e
  confirmação para escrever, nunca sobrescreve chave existente, idempotente,
  recusa banco remoto sem flag explícita. Rodar é decisão do CEO: é escrita em
  dado real de cliente.
- **A proposta de doutrina ao Diretor Geral do Cérebro sobre a trava de
  reivindicação continua sendo proposta.** Nada foi escrito no
  `dioli-brain-kit` a partir de hoje — o que muda aqui é local, neste
  repositório, até o Diretor decidir se sobe.

### O que continua aberto, sem dono, fora do fluxo de hoje

- `RESEND_FROM` ausente em produção.
- Fichas duplicadas em produção esperando decisão do CEO desde 08/08.
- Backfill de `chaveDoProspect` esperando o CEO decidir rodar.
- Agrupamento da fila ainda lê no máximo 200 solicitações.

---

## QUANDO O PROMPT VIRA DADO, A GARANTIA QUE DEPENDIA DO PROMPT PRECISA DE TESTE PRÓPRIO

**Decidido em** 2026-08-16 · **por** `pm`, sob despacho do Diretor ·
**executado pelo** `esteira` (4 rodadas) · **auditado pelo** `qualidade` ·
**portões rodados pelo** `pm` · **origem:** reconciliação do PR **#178**
(`agent/diretor-instrumento`) com o head da branch de deploy.

**O que o #178 faz:** o system prompt dos agentes deixa de ser texto fixo no
código e passa a receber, **em runtime**, o trecho da ficha do cargo delimitado
por `<!-- REGRAS-DO-CARGO:INICIO/FIM -->`
(`lib/agency/catalogo-v2/regras-da-ficha.ts`). Editou a ficha, subiu o deploy: o
agente já vestiu. É o fim da cópia à mão entre ficha e prompt.

**O perigo que isso cria, e que não é conflito de merge:** o conserto do SDR de
16/08 depende da **ordem dos campos** do JSON — `scope` primeiro, `reply` por
último — para que o corte por `max_tokens` caia na fala e não no dado do
cliente. O bloco vindo da ficha é colado **depois** do prompt base e se declara
autoridade textual: *"em conflito com qualquer instrução acima, ESTAS REGRAS
VALEM"*. No dia em que alguém editar a ficha e reordenar aquele parágrafo, a
garantia morre — **e nada acusa**: o guarda de código continua igual, o
`max_tokens` continua igual, e os testes existentes continuam verdes porque
testam `repararJsonTruncado`, não a ficha nem o prompt montado.

### As decisões que atravessam domínios

- **REGRA QUE MIGRA PARA DADO LEVA A TRAVA JUNTO.** No momento em que uma
  garantia deixa de morar em código fixo e passa a morar num arquivo editável
  por quem não compila nada, ela precisa de **teste próprio que leia o arquivo
  real**. Prompt é aviso; ficha é aviso; só o teste é trava. A trava é
  `__tests__/agency/ordem-do-pacote-do-sdr.test.ts`.
- **A GARANTIA PASSA A MORAR NOS DOIS LUGARES, DE PROPÓSITO.** A ordem está no
  prompt base (`lib/agency/comercial/prompt-do-sdr.ts`) **e** dentro dos
  marcadores da ficha (`agentes/linha/client-service-sdr/conversational-sdr.md`).
  Duplicação aqui não é dívida: é o preço de o bloco da ficha ter autoridade
  declarada sobre o resto. O teste é quem impede as duas cópias de divergirem.
- **O TESTE MEDE O TEXTO MONTADO, NÃO O PEDAÇO.** `sistemaDoSdr()` é o que o
  modelo de fato recebe. Testar só o prompt base ou só a ficha deixaria passar
  exatamente a composição errada — que é o modo de falhar deste dispositivo.
- **PROMPT NÃO PODE MORAR EM `route.ts` SE PRECISA SER MEDIDO.** O
  `SYSTEM_PROMPT` saiu da rota para `lib/agency/comercial/prompt-do-sdr.ts`.
  Importar o módulo de uma rota dentro do vitest arrasta prisma, auth e
  `next/server` e executa o topo do módulo — teste de prompt não pode depender
  disso. ⚠️ **A justificativa que eu dei ao despachar estava ERRADA e fica
  registrada:** afirmei que export extra num `route.ts` quebraria o
  `npm run build` (pela validação `checkFields` do `next-types-plugin`).
  **Medido: não quebra.** O Next 16.2.1 deste repositório gera em `.next/types`
  só `routes.d.ts` e `validator.ts` — não há arquivo de guarda por rota —, e
  `npm run build` sai **0** com `repararJsonTruncado` exportado da rota desde
  antes. A extração continua certa pelo outro motivo; a razão declarada, não.
- **A ORDEM EM QUE OS CAMPOS SÃO *NOMEADOS* TAMBÉM CONTA.** O teste achou, na
  linha do PACOTE do prompt, `` com `reply` e `scope` dentro `` — a mesma linha
  que exige o contrário três frases depois. Prompt que lista os campos numa
  ordem e manda escrever noutra é ambiguidade que o modelo resolve pelo que leu
  primeiro. Corrigido, e o teste reprova quem inverter.
- **AS DUAS METADES, PROVADAS POR MUTAÇÃO NO ARQUIVO REAL — não em string
  sintética.** Apagando o parágrafo da ficha de verdade: **5 asserções
  reprovam**, inclusive a do prompt montado. Com o parágrafo: suíte verde. E há
  caso plantado que prova que uma **reescrita legítima** do parágrafo (outras
  palavras, sem crases, mesmo sentido) **passa** — trava que reprova redação
  honesta é trava que alguém desliga.

### 🔴 O que isto NÃO protege — e alguém vai achar que protege

- **O dispositivo vale hoje para 1 ficha de ~81.** Só
  `conversational-sdr.md` delimita `REGRAS-DO-CARGO`. Para as outras,
  `blocoDeRegrasParaPrompt` devolve string vazia e o agente roda com o entorno
  de sempre — **degrada, não derruba**, e grava o motivo no log do servidor. Quem
  ler "a ficha chega no agente sozinha" sem contar as fichas conclui o oposto.
- **A garantia é textual, não estrutural.** Nada no parser exige a ordem dos
  campos. Quem de fato impede fala cortada de chegar ao prospect é o guarda
  `falaConfiavel` em código; a ordem do prompt decide **o que sobra** quando
  corta. As duas coisas são uma decisão só — o comentário "RECONCILIAÇÃO DE
  16/08" em `app/api/sdr/chat/route.ts` diz por que não se mexe numa sem a outra.
- **O cache das regras é por processo.** Em produção o deploy zera; em
  `npm run dev` a edição da ficha **não** reflete sem reiniciar. Está escrito no
  cabeçalho de `regras-da-ficha.ts` — promessa que só vale sob condição precisa
  dizer a condição.

> 🔗 **Leia junto com a decisão seguinte, "A COORDENAÇÃO ENTRE SESSÕES DEIXA DE
> SER PROMPT E VIRA MECANISMO".** As duas nasceram no mesmo dia, em sessões
> cegas uma à outra, e dizem a mesma coisa em dois planos: regra que vira dado
> precisa de trava própria; e quem mexe em quê precisa estar no remoto, não na
> memória de quem despachou. Esta reconciliação foi empurrada **antes** de a
> trava de reivindicação existir localmente — a colisão apareceu, de novo, no
> `push` recusado.

---

## A COORDENAÇÃO ENTRE SESSÕES DEIXA DE SER PROMPT E VIRA MECANISMO

**Decidido em** 2026-08-16 · **por** Diretor, a partir de três frentes construídas
em dobro no mesmo dia · **registrado pelo** `esteira` · **commits** `f9e3663e` (a
trava), `503f41af` (as regras de despacho no `CLAUDE.md`), e os do incidente que a
motivou: `171014e4`, `a18df6ee`, `5d806a60`, `031831c6`, `2323cacb`, `6ab3fe59`,
`a2d06fb1` · **origem:** `reivindicacoes/`, `CLAUDE.md`

**O caso, medido hoje:** três frentes foram construídas em dobro na mesma branch
`claude/dioli-agency-os-architecture-kk7kp`, por conversas diferentes, cegas umas
às outras. Em todos os casos a colisão só apareceu no `git pull --rebase`, **depois**
de o trabalho estar pronto:

- O `parse_error` do SDR — `171014e4` e `a18df6ee`, ~3h cada, e um terceiro
  conserto paralelo reconciliado em `5d806a60` ("Reconcilia TRÊS consertos
  paralelos do mesmo defeito do SDR" — foram três, não dois).
- A regra de "verba declarada vs. estimativa" — dois módulos com a mesma
  responsabilidade, o mesmo caso real e a mesma fonte de preço, com **nomes de
  arquivo diferentes**: `verba-declarada.ts` (`031831c6`) e
  `verba-vs-estimativa.ts` (`2323cacb`). Fundidos em `6ab3fe59`; custo medido no
  diff: 157 linhas de módulo e 151 de teste descartadas, além do retrabalho de
  fundir e reapontar consumidores.
- O e-mail de "orçamento pronto" — colisão em 4 arquivos com `a2d06fb1`; uma
  implementação inteira foi para o lixo.

A doutrina já mandava reivindicar antes de começar (`docs/kit/13-quem-esta-vivo.md`
§3, desde 02/08/2026), e as três colisões aconteceram **com a regra escrita**.
Prompt é sugestão; por isso virou mecanismo.

### As decisões de desenho que atravessam domínios

- **UM ARQUIVO JSON POR FRENTE, NUNCA UM SÓ.** Um registro único com todas as
  reivindicações faria o próprio mecanismo de coordenação virar fonte de
  conflito de merge — o defeito que ele existe para curar.
- **COLISÃO POR RESPONSABILIDADE, NÃO SÓ POR CAMINHO.** É o único ângulo que
  pegaria o caso da verba: nomes de arquivo diferentes, a mesma pergunta
  respondida duas vezes. Colisão só por caminho não veria nada de errado.
- **REIVINDICAÇÃO COM MAIS DE 24H NÃO BLOQUEIA — VIRA AVISO.** Afrouxado de
  propósito: sessão que morre sem encerrar travaria a frente para sempre, e
  proteção mais destrutiva que o problema é proteção que se arranca por fora.
- **`--forcar` EXISTE, E FICA REGISTRADO.** Exige motivo escrito, gravado no
  próprio JSON. Trava sem saída de emergência é trava que alguém desliga por
  fora; saída registrada é dado que a casa pode auditar depois.
- **`conferir` FALHA ABERTO SEM REDE; `abrir` FALHA FECHADO.** Portão que barra
  push por falta de rede ensina todo mundo a usar `--no-verify`. Reivindicar às
  cegas é pior que não reivindicar — por isso as duas metades falham em direções
  opostas, cada uma para o lado menos destrutivo.
- **A VIZINHANÇA É AVISO, NUNCA TRAVA.** Nenhum mecanismo automático prova que
  dois arquivos de nomes diferentes respondem à mesma pergunta — só quem declara
  sabe. O que o sistema garante é a pergunta na cara de quem toca a pasta alheia;
  a resposta continua sendo humana.

### A regra do despacho

**Três project managers mediram, de forma independente, o mesmo defeito de
mecanismo, e cada um perdeu uma frente inteira.** Subagente lançado por
`claude --agent <nome> -p` não escreve em disco sem `--permission-mode
acceptEdits` — volta com diagnóstico perfeito e zero linha aplicada. Mesmo com a
permissão, o subagente não executa comando: medido hoje com o Essencial
`qualidade`, `npx tsc --noEmit` e `npm test` devolveram a mensagem exata *"This
command requires approval"*, com e sem `dangerouslyDisableSandbox`. **A decisão
que fica:** o especialista escreve; o portão (`tsc`, testes) e o commit são do
PM. O subagente também é isolado no worktree e não lê `/tmp` — a ficha de
despacho precisa estar dentro do worktree, ou ele não a encontra.

O custo já pago: rodadas anteriores declararam a exceção `SEM_AGENTE` por não
terem medido a flag — o que faltava não era agente, era `--permission-mode
acceptEdits`.

> **Proposta ao Diretor Geral do Cérebro** — nada foi escrito no
> `dioli-brain-kit`. A doutrina 13 do kit (`13-quem-esta-vivo.md` §3) já
> descrevia a reivindicação em prosa e não tinha mecanismo — e falhou três vezes
> num dia só, neste projeto, com a regra escrita e lida. Isto serve a mais de um
> produto Dioli: quem promove o mecanismo (`reivindicacoes/` + gancho + sentinela
> no `npm test`) a regra de companhia é o Diretor Geral, com aval do CEO.
>
> **Soma-se a esta proposta, medida na noite de 16/08:** a lição de que
> **decisões certas produzem defeito na JUNTA entre elas**, não cada uma
> isolada. O caso é o da fila de orçamento (`docs/medicoes/elo-9-orcamento.md`)
> — manter lead sem contato na fila (08/08) e não inventar número sem dado são
> regras corretas tomadas em datas diferentes, por motivos bons, e juntas param
> a esteira. ⚠️ **É proposta, não escrita** — nada foi alterado em
> `docs/kit/` ou no `dioli-brain-kit`; promover é ato do Diretor Geral, com
> aval do CEO.

---

## AS DUAS CARGAS DO PACOTE DO SDR VIAJAM JUNTAS E **MORREM SEPARADAS**

**Decidido em** 2026-08-16 · **por** `pm`, sob despacho do Diretor ·
**executado pelo** `esteira` · **auditado pelo** `pm` · **origem:**
`app/api/sdr/chat/route.ts`, `components/agency/briefing/PublicBriefingRoom.tsx`,
`lib/agency/comercial/registro-da-conversa.ts`

**O caso, medido no piloto ao vivo:** dois `parse_error` em três minutos
(12:41:23 e 12:43:01). O cliente tinha dito **"R$ 500/mês"** e **"2 posts por
dia"**. O briefing saiu com **R$ 1.800–3.400 e 3 posts/semana**. O teto de tokens
cortou a resposta no meio, o JSON não fechou, e o pacote inteiro foi descartado —
inclusive os campos que já tinham chegado completos.

### As decisões que atravessam domínios

- **FALA E ESCOPO SÃO PERDAS DE TAMANHOS DIFERENTES, E A CASA PASSA A TRATÁ-LAS
  ASSIM.** A fala o motor de regras refaz. O número que o cliente falou uma vez
  ninguém recupera. `ok: false` deixou de significar "nada aproveitável": a
  resposta pode carregar o `scope` que sobreviveu, e o cliente aplica esse escopo
  por gap-fill mesmo com a fala barrada.
- **VALE PARA AS QUATRO PORTAS DE RECUSA, NÃO SÓ PARA O CORTE.** `truncado`,
  `malformado`, `email_hallucination` e `price_leak` devolvem o escopo. Nas duas
  últimas o JSON abriu limpo: quem errou foi o agente, não o cliente — descartar
  o dado dele ali era a mesma perda com outra roupa. `provider_error`, `timeout`
  e `network_error` **não** mudam: ali não houve resposta do modelo, logo não há
  escopo a salvar.
- **O GUARDA NÃO FOI AFROUXADO, E ISSO É TRAVA.** Barrar continua melhor que
  empurrar lixo ao cliente. Nenhuma regexp de `email_hallucination` ou
  `price_leak` mudou. Mais: fala vinda de JSON remendado é tratada como **não
  confiável mesmo quando o campo `reply` existe** — o remendo garante JSON
  válido, nunca frase completa.
- **O REPARO NUNCA INVENTA CONTEÚDO.** `repararJsonTruncado` só fecha aspas,
  colchetes e chaves que o modelo abriu; se o remendo não virar JSON válido,
  devolve nulo. Nesta casa dado vem do que foi dito; máquina não preenche lacuna.
- **DADO RECUPERADO NÃO GANHA PASSE LIVRE.** As três travas do escopo (descarte
  de `prospectEmail`/`negotiation`, `businessName ≠ prospectName`, allowlist de
  `budgetRange`) viraram **uma função só**, `aplicarTravasDeEscopo`, chamada nos
  dois caminhos. Duas cópias da mesma regra é como esta casa historicamente
  deixa uma delas envelhecer enquanto a outra muda.
- **A ORDEM DO JSON VIROU MECANISMO, NÃO CONSELHO.** O prompt passa a exigir
  `scope` **antes** de `reply`. O corte sempre cai no campo mais longo, e o mais
  longo é sempre a fala — escrevendo o escopo primeiro, ele já está fechado no
  texto quando o corte acontece. É a única metade deste conserto que funciona
  *antes* de precisar de remendo.
- **CORTE E FORMATO QUEBRADO SÃO DIAGNÓSTICOS DIFERENTES.** A rota passa a ler
  `stop_reason` da API. `max_tokens` é `truncado`; qualquer outro valor com JSON
  que não abre é `malformado`. Viravam o mesmo `parse_error` e ninguém conseguia
  dizer qual das duas era o dia a dia do piloto. O diário mostra os dois com
  frase em português e diz **quando o escopo foi salvo mesmo com a fala barrada**
  — barrar tendo salvo o briefing é fato diferente de perder tudo.
- **O TETO SUBIU DE 1.280 PARA 3.000 TOKENS**, com a conta comentada no código
  (fala ~240 + escopo cheio ~500 + folga de formatação ~250 — o piso real já
  passava de 1.000). `max_tokens` é **teto, não gasto**: só se paga o que o
  modelo escreve. Teto folgado não custa nada no turno normal e evita o único
  modo de falha que importa aqui.

### A reconciliação de duas sessões paralelas — e por que a heurística da outra caiu

Duas sessões consertaram este mesmo defeito com **6 minutos de diferença**
(`171014e` e este commit). A outra mexeu só no servidor e **não tocou no
cliente** — sem isso o escopo continuava morrendo em `PublicBriefingRoom.tsx`.

A regra dela para confiar na fala remendada era
`falaConfiavel = doParseNormal !== null || "scope" in parsed`, com o raciocínio
*"o formato manda `reply` antes de `scope`, logo escopo presente prova que a fala
fechou antes do corte"*. **Isso era verdade no formato antigo e deixou de ser:**
este conserto inverteu a ordem do JSON no prompt — `scope` primeiro — justamente
para o corte cair na fala. Sob a ordem nova, escopo presente prova o contrário.

**A decisão de corredor que fica:** ordem do JSON no prompt e regra de confiança
na fala são **uma decisão só**, não duas. Quem mexer numa reabre a outra — está
escrito dentro de `app/api/sdr/chat/route.ts`, no bloco "RECONCILIAÇÃO DE 16/08",
porque regra que só mora em documento não é lida por quem edita o arquivo.

---

## O DEFEITO D-003 ("a caixa existe e a seta não") É PADRÃO DA CASA, NÃO ACIDENTE

**Decidido em** 2026-08-16 · **por** `pm` · **laudo do** Essencial `qualidade` ·
**conserto pelo** `esteira` · **origem:** `lib/agency/diretor/pendencias.ts`,
`lib/agency/diretor/coletor.ts`, `app/api/diretor/pendencias/route.ts`

O conserto do SDR do dia **13** escreveu `repararJsonTruncado` com 30 linhas de
comentário explicando o incidente que ela consertava — e **nunca a chamou**.
Código morto dentro do próprio conserto. Isso motivou uma varredura do
`qualidade` atrás de outras ocorrências, com o crivo "foi escrito para proteger
ou para gravar algo, e não está ligado". Achados:

- **`podeODiretorEncerrar`** (`lib/agency/diretor/pendencias.ts:78`) — o
  dispositivo que o CEO mandou construir em 15/08 para o Diretor não ter desculpa
  de *"eu não vi"* **estava escrito, testado e desligado**. Único chamador: o
  próprio teste. **Ligado nesta rodada.**
- **`saveArtifactToDb`** (`lib/agency/persistence/save-artifact.ts:24`) — sem
  chamador nenhum, nem em teste. O `POST /api/brain/artifacts` que o chamaria
  também não tem chamador de produção. Aberto.
- **Os acessores por departamento de `quality-gates.ts`**
  (`getQualityGateForDepartment`, `getBlockingChecks`) — só o teste-medidor os
  chama. Aberto, e agrava o P0 conhecido: consertar o dado da Onda 4 **não basta**
  se nada passar a ler o registro.

**A regra que fica:** trava sem chamador de produção é decoração. Quem escrever
um mecanismo nesta casa prova o chamador — `grep` do nome fora de `__tests__/` e
`scripts/` — antes de declarar o conserto feito. Teste não é chamador: ele prova
que a peça funciona, nunca que ela está ligada.

---

## MESMO CONTATO, VÁRIOS BRIEFINGS: DEDUP DE **CADASTRO**, NUNCA DE **PEDIDO**

**Decidido em** 2026-08-16 · **por** Diretor, a partir de pergunta do CEO ·
**registrado pelo** `pm` · **commits** `4cbba4b` (o conserto) e `57eb2f1` (a tela
conferida) · **origem:** `lib/agency/comercial/chave-do-prospect.ts`,
`lib/agency/execution/cliente-do-briefing.ts`,
`prisma/migrations/20260816120000_chave_do_prospect/migration.sql`

**A pergunta que gerou tudo**, do CEO, em 16/08:

> *"se entrar um cliente com o mesmo e-mail e fizer cinco briefings um atrás do
> outro, o que acontece com o sistema?"*

**A resposta medida: não dava pane — dava bagunça cara.** Na entrada,
`createClientRequest` era `create` puro e os cinco briefings viravam **cinco
linhas anônimas** na fila, sem nada dizendo que eram a mesma pessoa. O estrago
grande vinha na **aprovação**: `create-project-from-request.ts` era idempotente
**por solicitação**, e a linha seguinte fazia `prisma.client.create` sempre que
`req.clientId` estava nulo. Aprovar as cinco criava **cinco `Client` homônimos,
cinco portais, cinco históricos** do mesmo negócio. Não é hipótese: a **Camila
Pereira está duplicada em produção desde 08/08/2026** por esse caminho exato, e a
fusão dela ainda espera decisão do CEO.

### As decisões que atravessam domínios — e por isso moram aqui

- **MARCA, NÃO FUNDE.** Cinco briefings do mesmo e-mail podem ser reenvio **ou**
  um segundo projeto legítimo, e **nenhum código distingue os dois**. Fundir
  trataria o segundo caso como erro e apagaria um pedido de serviço que o cliente
  fez de verdade. Cada briefing continua sendo sua própria linha, inteira, e ganha
  o carimbo *"3ª vez que este contato escreve — veja as outras 2"*. A máquina
  mostra o fato e escala a decisão para gente.
- **DEDUP DE CADASTRO, NUNCA DE PEDIDO.** A idempotência da aprovação continua
  sendo por **solicitação** (`IDEMPOTENCIA_E_POR_SOLICITACAO`). Trocá-la por "já
  existe projeto para este cliente?" faria o segundo pedido legítimo devolver
  silenciosamente o projeto antigo — o cliente teria **pago** por um trabalho que
  o sistema se recusou a criar, sem um erro na tela. Duplicar cadastro é o
  defeito; duplicar pedido é o negócio funcionando.
- **NOME NUNCA VIRA CHAVE.** Dois "Camila Pereira" podem ser duas pessoas, e
  fundir por homonímia **entregaria o portal de um cliente a outro** — dano pior e
  irreversível, contra uma duplicata que é chata e reversível. Só contato
  declarado vira identidade; arroba de Instagram e telefone soltos no `rawContext`
  seguem sendo **pista**, para uma pessoa ler.
- **LEAD SEM CANAL NÃO TEM CHAVE, e nulo não junta com nulo.** É a lei de
  *ausência de informação não é informação* aplicada à identidade: adivinhar que
  dois leads anônimos são a mesma pessoa é exatamente a inferência que esta casa
  proíbe. A linha existe, aparece inteira na fila, e não se junta a ninguém.
- **ÍNDICE NÃO-ÚNICO, e é deliberado.** `@@unique` faria o segundo pedido legítimo
  **falhar na gravação** e, pior, um `CREATE UNIQUE INDEX` sobre os duplicados
  vivos no volume do Railway **derrubaria o deploy inteiro** — migração não pode
  ser mecanismo de limpeza. A dedup mora na **aplicação** porque a pergunta que
  ela responde ("reenviou ou contratou outra coisa?") é de negócio, não de
  restrição de coluna.
- **CONTINUA `create`, NUNCA `upsert`.** Um `upsert` por contato sobrescreveria o
  briefing anterior, e **perder o que o cliente escreveu é pior que ter
  duplicata.**

### A lição que talvez sirva a outros produtos — **proposta, não escrita no kit**

> **Dedup cujo lado de escrita não persiste a chave é decoração: passa nos testes
> e não funciona na vida real.**

O `Client` nascido de briefing **nunca teve `email` nem `phone` gravados**. A
correção óbvia — "procure um `Client` com este e-mail" — teria "funcionado" sem
funcionar: a busca jamais casaria, porque não havia e-mail em ficha nenhuma. Toda
dedup tem **duas metades** (procurar pela chave **e** persistir a chave em quem
nasce), e a segunda é a que se esquece, porque a primeira é a que aparece no
diff. É a mesma família de *toda trava precisa das duas metades*, aplicada a
identidade.

**Vai como proposta ao Diretor Geral do Cérebro** — nada foi escrito no
`dioli-brain-kit`, conforme a regra da casa.

### O que esta decisão explicitamente **não** resolve

As duplicatas que **já existem** em produção não foram fundidas — o mecanismo
impede duplicata **nova**, não limpa a velha. O merge manual
(`app/api/clients/[id]/fundir/route.ts`) continua sendo o caminho, e qual ficha
fica com o histórico continua sendo **decisão do CEO**.

---

## O ANÚNCIO SÓ NASCE COM ATIVO QUE SE PROVA DO DONO — PÁGINA E ARTE

**Decidido em** 2026-08-15 · **por** `seguranca`, a pedido do Diretor ·
**commits** `209b504` (torniquete) e este · **origem:** auditoria de
`lib/agency/esteira/trafego.ts`

**O que estava aberto, em produção viva.** `montarCriativo` escolhia a Página
com `findFirst({ workspaceId, platform: "facebook" })` — **sem `clientId`** — e
a arte com `findFirst({ mediaUrl: { not: null } })` — **sem dono nenhum**. O
`pageId` seguia cru para `object_story_spec.page_id` sem passar pela lista de
ativos autorizados, que desde 06/08 já barrava a conta de anúncios. Num
workspace com mais de um cliente isso significa: **o anúncio do cliente A nasce
assinado pela Página do cliente B, com a arte de B**. O gatilho é o cliente
aprovar o pacote (`lib/agency/esteira/marcos.ts`).

**A decisão, em uma frase: id recebido não é id provado.** Vale para os três
ativos do criativo, e nenhum deles chega por parâmetro de quem chama:

1. **Página pelo `clientId` do projeto**, derivado do banco dentro de
   `montarCriativo` — não recebido do chamador.
2. **Arte pelas peças DESTE projeto** (entregas do projeto ou o pedido que o
   originou), com `workspaceId` e `clientId` junto. Nunca "o post mais recente
   do banco". Sem vínculo possível, não se consulta: a resposta certa é "nada".
3. **A Página passa por `ativoAutorizado(..., "page", ...)` DENTRO de
   `criarAnuncioPausado`** — onde o id é usado, não no chamador. Conferir no
   chamador é o que deixou `publishPost` de fora da trava em 06/08. A mesma
   trava entra na segunda porta do arquivo (`promoted_object.page_id`, objetivo
   "conversas"), **antes** de existir chamador que a use.

**Consequência aceita, e ela é uma escolha:** cliente cuja Página não estiver
marcada em `MetaAtivoAutorizado` **não ganha anúncio** — ganha uma pendência que
diz qual ativo falta e onde marcar. Fail-closed: não conseguir provar a posse
nunca vira permissão. Preferimos uma campanha sem anúncio a um anúncio assinado
pela marca de outro cliente, que é dano que nenhum código desfaz.

**E a frase parou de mentir.** Toda ausência de anúncio virava *"a Meta recusou
o criativo"*. A Meta não recusava nada — era defeito nosso. Recusa real da Meta
agora chega com o texto dela; recusa nossa se identifica como nossa e ensina o
gesto.

**Como se mede o passado sem chamar a Meta:**
`scripts/pericia-posse-do-criativo.mts` — somente leitura, só banco. Reconstrói
a escolha determinística do código antigo e classifica cada anúncio já criado em
limpo / nasceu com ativo de outro / ambíguo. **Ambíguo não é limpo — é "não
medido"**, e vai para conferência à mão no Gerenciador.

---

## QUEM APROVA A PEÇA É O CLIENTE DELA — PEÇA POR PEÇA, NUNCA EM BLOCO

**Decidido em** 2026-08-14 · **por** Dioli (CEO) · **registrado pelo** Diretor ·
**commit** `b8809bd`

A frase dele, repetida várias vezes até virar ordem:

> *"Quem libera, quem aprova, são os clientes. Quem é o dono da CityJobs sou eu,
> então eu vou aprovar. Se entrar um cliente novo, quem aprova é ele."*

**O modelo de aprovação da casa passa a ser:** a peça só vai ao ar depois que **o
cliente daquela peça a aprovou**. Não é aprovação global, não é interruptor de
dono da agência, e não é o Diretor decidindo por ele.

**O que estava errado.** `trava-de-publicacao.ts` fazia duas perguntas: o perfil
está na lista de ativos autorizados, e `PUBLICACAO_ORGANICA` está liberada. A
segunda é um **interruptor geral cego** — ligado, TODA peça agendada sai sozinha
pelo despertador de 5 minutos, aprovada ou não. Foi esse formato que quase
publicou os 6 carrosséis da Foocci em 07/08. Um interruptor geral não pode ser a
resposta a uma ordem que é peça por peça: ele responde *"a casa pode publicar
hoje?"*, e a ordem pergunta *"ESTE cliente liberou ESTA peça?"*.

**O que mudou:**

1. **Terceira pergunta, fail-closed, antes de qualquer chamada de rede** —
   `lib/agency/esteira/aprovacao-da-peca.ts`. Sem aprovação registrada do cliente
   dono, não publica. Ausência de aprovação nunca vira permissão (guardrail 1).
2. **Reaproveita o registro que já existia**, não cria um segundo:
   `ApprovalRequest` + `sourcePostIdsJson` (quais peças o card decide) +
   `reviewedBy` + `reviewedAt`. É o mesmo registro que alimenta o "Aprovações" do
   painel. Um segundo mecanismo começaria idêntico e divergiria no primeiro
   ajuste.
3. **Só conta a decisão tomada no portal do cliente** — `reviewedBy` começando em
   `client:`, que é o que `/api/portal/approvals` grava depois de conferir a
   posse do token. O carimbo seco `"cliente"` de `marcos.aprovarPacote` **não
   vale**: ele não tem autor e é alcançável por rota de sessão da agência
   (`/api/projects/[id]/esteira`). **Aprovação sem autor não é aprovação**, e
   carimbo da agência em nome do cliente não é consentimento do cliente.
4. **`PUBLICACAO_ORGANICA` continua existindo, com outro papel:** deixa de ser o
   portão que decide e vira o **freio de emergência da casa** — a alavanca que
   para tudo de uma vez, sem reabrir card por card. **Solto não é autorização:**
   ele apenas devolve a decisão a quem ela pertence. Puxado, nem peça aprovada
   sai. Ele segue puxado enquanto o App Review e a verificação do negócio não
   saírem — essas razões são da plataforma, e nenhum cliente pode aprová-las.
5. **O diagnóstico acompanhou.** O portão 11 de `prontidao-de-publicacao.ts`
   dizia "Decisão do CEO (PUBLICACAO_ORGANICA)" e passou a dizer **"Aprovação do
   cliente (peça por peça)"**, nomeando quem precisa aprovar aquela peça. O freio
   virou o 12 e as permissões da Meta, o 13. Relatório que descreve o modelo
   antigo é pior que relatório nenhum: ele é acreditado.

**A consequência que vale dita:** publicação avulsa no perfil de um cliente
(`/api/meta/publish` com legenda e mídia arbitrárias) **não tem quem a tenha
aprovado, por construção** — e por isso a rota descarta `postId` de propósito.
Aceitar a dupla deixaria alguém apontar uma peça aprovada e publicar outra coisa
por baixo dela, transformando o consentimento do cliente numa senha.

---

## O QUE TRAVA PUBLICAÇÃO, MEDIÇÃO E TRÁFEGO É **UM** PORTÃO SÓ: ACESSO AVANÇADO

**Decidido em** 2026-08-11 · **apurado pelo** especialista `meta` (parecer
assinado) · **registrado pelo** Diretor · **commit** `cbf3d60`

Três departamentos estavam parados e a casa tratava isso como três problemas.
**É um.** A pergunta que decidia o cronograma — *"se o ativo do cliente estiver
atribuído ao nosso Business Manager, o acesso padrão basta?"* — tem resposta
publicada, e é **não**:

| Capacidade | Permissões | Basta acesso padrão? |
|---|---|---|
| Publicar no Instagram do cliente | `instagram_basic` · `instagram_content_publish` · `pages_read_engagement` · `pages_show_list` | **Não** — App Review |
| Ler desempenho do Instagram | `instagram_basic` · `instagram_manage_insights` · `pages_read_engagement` | **Não** — App Review |
| Campanha na conta do cliente | `ads_management` · `ads_read` (+ Marketing API Access Tier) | **Não** — App Review, e a Meta é explícita |

O teste da Meta não é "está no nosso Business Manager": é **"adicionada ao app no
Painel de Apps"** mais quem concede ter **função no app**
(`fontes/instagram-insights.md:57`, `fontes/instagram-visao-geral.md:99-101`).

**E há um segundo portão que quase ninguém vê:** sem **verificação do negócio**
concluída, *"os usuários de outras empresas não poderão conceder permissões a
esses apps, e todos os recursos ficarão inativos"*
(`fontes/verificacao-de-negocio.md:20`). Ele morde no cenário em que todo mundo
confia — *"mas o cliente autorizou"* — e é o **prazo externo mais longo** do
cronograma.

**O que muda no trabalho da casa, e é o ponto:**

1. **Nenhuma das três é destravável por código.** Continuar construindo em cima
   delas esperando "ligar" um dia é construir sobre uma porta trancada.
2. **A casa constrói a máquina fail-closed enquanto a análise corre** — que é o
   que já existe em `trava-de-publicacao.ts` e `formato-de-midia.ts`, e ganhou
   `permissoes-do-token.ts` para **medir** a concessão em vez de descobri-la
   tentando.
3. **É ato do CEO, não do Diretor:** verificação do negócio, envio da análise,
   gravação dos vídeos e a configuração do login exigem a conta pessoal dele.
   Eu preparo; não finjo que executei.

**A regra que fica, e ela é a lição do 03/08:** *"a API deixou"* nunca foi
sinônimo de *"pode"*. O escopo estar no token prova que a chamada passaria — não
que ela é permitida.

---

## A ESCADA GANHOU UMA SEGUNDA PORTA: A DECISÃO DO DONO, DECLARADA EM CÓDIGO

**Decidido em** 2026-08-08 · **por** Dioli (CEO), executado pelo `pm` ·
**mecanismo:** `lib/agency/escada/decisoes-do-dono.ts`

**A fala, literal, que é a procedência:**

> *"Solta, óbvio, tem que soltar tudo, tem que dar autonomia pra essa agência
> funcionar, gente. O fluxo eu já te dei completo de como deve funcionar. Eu te
> dei os agentes, te dei interface, te dei autonomia só pra comandar. Você tem
> vinte e seis agentes pra fazer um monte de coisa e dois posts não estão
> saindo."*

Até hoje a escada subia por **um** caminho só: evidência (`subirDegrau`). O caso
"quem manda na casa mandou" não tinha onde ser escrito a não ser num campo de
texto preenchido à mão por alguém **logado em produção** — e nenhuma rodada de
agente tem sessão de produção. **A decisão existia; o caminho, não.** Foi assim
que duas peças do CityJobs ficaram um dia inteiro em `interno`.

**A decisão do dono agora é código versionado, aplicado pelo relógio da agência
a cada rodada.** Consequência prática, que é o ponto inteiro: **deploy = a
escada solta.** Sem humano no meio, sem segredo para carregar, sem sessão para
conseguir.

**O que ela recusa, e cada recusa tem motivo:**

- **Nunca leva a `wide`** — o alvo é sempre `allowlist` com clientes nomeados,
  auditáveis e revogáveis um a um. `wide` continua se conquistando com número.
- **Nunca desce ninguém** e **nunca publica nada.** Soltar a escada leva a peça
  ao **card de aprovação** do cliente; o clique de publicar continua sendo dele.
- **Sem procedência (data + quem + a FALA literal, mín. 20 caracteres) a decisão
  é RECUSADA por inteiro** e a recusa vira falha de rodada. "O CEO mandou" sem a
  frase é memória de alguém, e memória não é registro.
- **Sem `process.env`, sem `{ forcar: true }`, sem parâmetro de degrau.** Há
  teste que reprova o arquivo que ganhar qualquer um dos três, e teste que
  reprova a decisão que soltar `paid-traffic` ou `prospeccao`.

**O que foi solto por esta decisão:** `social-media` e `design` — os dois
departamentos que uma peça de feed atravessa — para os **clientes com projeto**.

⚠️ **FURO DE DADO DECLARADO:** *"cliente ativo"* **não existe nesta casa.** Não
há coluna `status` em `Client`. O escopo se chama `clientes_com_projeto` porque
é isso que o banco sabe dizer — batizar o proxy com o nome do fato é como se
inventa dado.

**O que NÃO foi solto, e é decisão que sobe ao Diretor/CEO:** `paid-traffic`
(escreve em Meta/Google — depende do parecer do especialista da plataforma, a
trava de 03/08), `prospeccao` (sai em nome da agência para terceiros, não é peça
de cliente) e `analytics` · `strategy` · `financeiro` (relatório, plano e
proposta não são "peça" — a fala do CEO não os cobre com todas as letras).

---

## O CAMINHO C DO DRIVE (CONTA DE SERVIÇO) FOI DERRUBADO PELO ESPECIALISTA — NADA FOI CONSTRUÍDO

**Decidido em** 2026-08-08 · **por** `google` (parecer), aceito pelo `pm` ·
**origem:** `docs/plataformas/google/pareceres/2026-08-08-drive-conta-de-servico.md`

O CEO autorizou o **Caminho C** — uma conta de serviço da agência recebe a
pasta-raiz `Dioli Digital - Material Agencia` por compartilhamento, uma vez, e
passa a ler tudo que entrar depois, sem seletor. A autorização veio **sob a
premissa de que C era barato** ("uma pergunta ao Google, dias"), premissa escrita
no parecer anterior (`2026-08-08-drive-da-agencia.md`), que **foi produzido pelo
`pm`, não pelo especialista** — a trava de plataforma de 03/08 rodou sem quem ela
manda ouvir, e o próprio parecer declarou o furo.

**Este despacho corrigiu o furo: o `google` foi acionado de verdade** (via
`claude --agent google`) e **derrubou o C**. Nenhuma conta de serviço foi criada,
nenhum escopo foi acrescentado ao app, nenhuma chamada de escrita saiu.

### Por que C caiu

- **Tecnicamente C funciona** (pergunta 1): conta de serviço com a pasta
  compartilhada lê a árvore inteira, inclusive o que entrar depois. Isso **não** é
  o caso do Picker + `drive.file` de 07/08 — lá o obstáculo era o escopo, não a
  credencial.
- **Mas o escopo necessário é `drive.readonly`, e ele é RESTRITO.** Não existe
  escopo não-sensível que leia conteúdo por ACL.
- **A isenção de verificação NÃO cobre este caso** — e isto é **citação, não
  inferência**: a isenção "somente dados de propriedade do serviço" exige
  *"acessar apenas os próprios dados"* **e** *"não acessar dados do usuário
  (vinculados a uma Conta do Google)"*. A pasta é de `agenciadioli@gmail.com`,
  que é uma Conta do Google. As duas condições falham.
- **Logo C custa o mesmo que a Saída A** (`drive.readonly` direto): verificação de
  escopo restrito, avaliação de segurança (a casa guarda os bytes) e
  reverificação anual. **A única coisa que muda entre C e A é quem segura a
  credencial — não o preço.**

### A correção que o `pm` arrancou na auditoria, e que ficou registrada

O parecer afirmava que declarar `drive.readonly` no projeto **aciona** a
verificação também para conta de serviço. Cobrado com o contra-argumento de que a
verificação se prende à **tela de consentimento OAuth** — que conta de serviço
nunca vê —, o especialista **rebaixou a própria afirmação a inferência não
confirmada**, com fonte: no compartilhamento direto de pasta o escopo entra em
código (`createScoped`), fora da página "Acesso a dados".

> **O veredito NÃO mudou, e é importante entender por quê.** Ele nunca dependeu
> daquele mecanismo: dependia da isenção, que é citação direta. **Mesmo que o
> Google não barre tecnicamente o token, usar escopo restrito não verificado põe
> o app em descumprimento da Política de dados do usuário** — risco de revogação
> por auditoria, não 403 imediato. *A casa não aposta em comportamento não
> documentado.*

### O que atravessa domínios, e por isso mora aqui

1. **A trava de plataforma vale para o `pm`, principalmente para o `pm`.** Foi um
   parecer sem especialista que produziu a premissa errada que subiu ao CEO. Não
   houve dano — o custo foi um despacho —, mas o mecanismo que o evitaria é
   **acionar o especialista, não escrever no lugar dele**.
2. **Autorização do CEO é sobre o DESTINO, não sobre o preço.** Ele autorizou C
   por ser barato. Barato caiu ⇒ a autorização não se transfere para A, que é o
   caminho caro. **Quem decide pagar semanas de verificação é ele.**
3. **A cota da Drive API deixou de ser lacuna** — `fontes/drive-api-cotas.md`
   capturada. E a conclusão é que **cota não é o limite**: o limite é o padrão de
   rajada (15 min mínimo, backoff, nada de chamada a partir de renderização),
   a mesma assinatura que restringiu a conta da Meta em 03/08.
4. **A Saída B segue sendo a única sem custo de verificação** (a casa cria os
   arquivos via `drive.file`, upload por tela da Dioli) — e ela **é escrita no
   Drive**, então exige parecer próprio do `google`, que **ainda não existe**.

---

## O FINANCEIRO É O DONO ÚNICO DE TODO DINHEIRO DA CASA

**Decidido em** 2026-08-07 · **por** CEO · **origem:** `lib/agency/financeiro/dre.ts`,
`app/agency/financeiro/page.tsx`, `lib/ai/donos.ts`

As palavras do CEO:

> *"Em tese todos os projetos são de autoria da Dioli Digital. Então todos os
> custos de todos os projetos, e também o faturamento, tudo, eu vou colocar
> dentro do financeiro da agência. […] quem mede tudo em relação a dinheiro vai
> ser o departamento de finanças — inclusive isso que você está me
> questionando, de quem vai medir quanto cada IA gasta. É o financeiro."*

Isso fecha uma pergunta que estava aberta (item 4 de
`docs/perguntas-ao-diretor-geral.md`): **o dono da medição de custo de IA por
agente é o financeiro**, não a Plataforma e não a Qualidade.

O que atravessa domínios, e por isso mora aqui:

1. **Consolidação por autoria, não por contrato.** Foocci, CityJobs, Dioli
   Digital — todos os projetos são de autoria da Dioli, logo custo e
   faturamento de todos sobem para o mesmo DRE. Nenhum projeto tem caixa
   próprio.
2. **A tela responde DUAS perguntas ao mesmo tempo:** *"como está a agência?"*
   (o consolidado) e *"este projeto se paga?"* (a linha por centro de custo,
   **ordenada do pior para o melhor**). Consolidado sozinho é média, e média
   esconde o projeto que consome mais IA do que fatura.
3. **Zero e "não sei" são valores DIFERENTES, e o tipo obriga a distinção.**
   `Dinheiro` tem três estados (`medido`, `nao_medido`, `nao_lancado`) e a soma
   se recusa a somar: uma parcela não medida contamina o total em vez de virar
   zero. É a Lei da casa (*ausência de informação não é informação*) escrita em
   tipo, não em disciplina.
4. **Todo número em tela de dinheiro carrega procedência** — registro de chamada
   de IA, lançamento manual, contrato, extrato. Número sem origem num DRE é o
   que faz um dono decidir errado com cara de dado.
5. **Estimado nunca se soma a realizado**, e **moeda não se converte sem câmbio
   declarado**. O custo de IA sai em dólar, fora do resultado, com a ressalva —
   escolher uma taxa por conta própria mudaria o número mais consequente da tela
   por um chute.
6. **O histórico não volta.** A medição de custo de IA só é completa a partir de
   07/08/2026 (`MEDICAO_DE_IA_COMPLETA_DESDE`). Período anterior sai marcado
   como amostra de tamanho desconhecido. **Não se extrapola o passado.**

> **Proposto ao Diretor Geral do Cérebro como regra de companhia:** os itens 3 e
> 4. "Zero não é 'não sei'" já vale para métrica de cliente nesta casa; em
> dinheiro ela precisa de tipo, não de lembrança. E "número em painel carrega
> procedência" é a mesma família da verdade ancorada, aplicada a relatório em
> vez de a texto.

---

## TODA CHAMADA DE IA DECLARA O DONO — e o compilador é quem cobra

**Decidido em** 2026-08-07 · **por** PM · **origem:** `lib/ai/donos.ts`,
`__tests__/ai/todo-gasto-tem-dono.test.ts`

`AIRunLog.agentId` existia desde 06/08. **Medido em 07/08: das 32 chamadas a
`generate({…})` do repositório, 10 declaravam o dono e 22 não.** O departamento
financeiro nasceria medindo cerca de um terço do gasto — e sem saber qual terço.

O que fica como regra:

1. **`agentId` é OBRIGATÓRIO na assinatura.** Chamada nova sem dono **não
   compila**. Optional dependia de lembrança, e lembrança foi exatamente o que
   falhou nas 22.
2. **O id vem de um registro fechado** (`DONOS_DE_CHAMADA`). String livre
   reabre o buraco por outra porta: `"social"` num arquivo e `"social-media"`
   noutro partem o custo do mesmo especialista em duas linhas do relatório sem
   ninguém errar visivelmente.
3. **O departamento que paga é DERIVADO do dono**, não repetido em cada
   chamada. Quem lembrava do `agentId` esquecia do `departmentId` e o gasto caía
   em `"desconhecido"` com dono declarado.
4. **Duas travas, porque o tipo sozinho não basta.** O teste estático varre o
   repositório e reprova (a) chamada sem `agentId` e (b) dono fora do registro —
   é o que pega `as never`, string montada em runtime e
   `// @ts-expect-error` posto para destravar o build.
5. **Nada disso pode derrubar a entrega.** Dono desconhecido em produção é
   gravado como veio e denunciado no log; contabilidade não para a agência.

---

## OS CINCO ESSENCIAIS ENTRARAM NESTA CASA — 07/08/2026

**Ordem do CEO**, doutrina 21 do `dioli-brain-kit`: todo projeto passa a ter,
obrigatoriamente e sem poder apagar, cinco Essenciais — `qualidade`, `cerebro`,
`interface`, `experiencia`, `seguranca`.

**O elenco não foi instalado por cima do que existia.** Dois agentes respondendo
a mesma pergunta = nenhum dono de verdade, que é o defeito que a doutrina existe
para matar. O cruzamento, agente por agente:

| Agente que existia | Pergunta que ele responde | Saída |
|---|---|---|
| `qualidade` | "isto está conforme o prometido?" | **É o Essencial.** Já era só leitura (`Read, Grep, Glob, Bash`) — mantido |
| `cerebro` | "podemos afirmar isto, e com base em quê?" | **É o Essencial.** Papel confere com a constituição |
| `interface` | forma **e** percurso | **DIVIDIDO EM DOIS** — ver abaixo |
| `plataforma` | fundação **e** segurança | **Segurança SEPARADA** — ver abaixo |
| `pm` | "quem faz o quê, e quando?" | **Mantido de domínio.** É a camada de direção, não um Essencial |
| `departamentos`, `esteira` | o que o produto faz | **Mantidos de domínio** |
| `meta`, `google`, `tiktok` | o que a plataforma externa permite | **Mantidos de domínio** — as travas de 03/08 continuam de pé |

**Nenhum agente foi apagado. Nenhuma memória foi movida ou destruída.**
`docs/agents/interface/` e `docs/agents/plataforma/` seguem intactos.

### Por que `interface` virou DOIS

Ele fazia forma e percurso. **Quem responde pelos dois nunca faz a pergunta cara
— "esta tela deveria existir?" — porque ela invalida o trabalho que ele acabou
de fazer.** A prova é desta casa, não do manual: a nota de 0 a 10 de aparência
não pegou o **card de aprovação vazio**, o Drive dizendo "conectado" e "não
conectado" no mesmo cartão, nem o orçamento com **duas saídas** quando o cliente
precisava de três (a devolutiva do CEO ficou dois dias sem destino). **Nenhum
desses é feio.**

- **`interface`** — mover, alinhar, renomear, estilizar, completar estado.
- **`experiencia`** — eliminar passo, trocar ordem, criar ou apagar tela.
  **Sem `Write` e sem `Edit`**, como manda a constituição.

> *Botão com a cor errada é do `interface`. Botão que promete o que não faz é do
> `experiencia`.*

### Por que `seguranca` saiu de dentro de `plataforma`

Segurança dividia fila com deploy, migration e banco — **e perdia todo dia**.
Deploy caindo é urgente e visível; rota aberta é urgente e invisível. Em 07/08
esta casa teve três frentes de urgência no mesmo dia (Drive, portal, deploy) e
**nenhuma varredura de superfície exposta aconteceu**. Não por negligência: por
fila.

`plataforma` continua dono da fundação. `seguranca` é dono da porta, **tem
escrita**, e correção que toca pagamento ou parceiro passa por humano.

### As travas, não os avisos

`__tests__/agentes/elenco-obrigatorio.test.ts` (38 asserções, verde) reprova:
apagar qualquer um dos cinco · perfil de Essencial que não aponte para a
constituição · `Write`/`Edit` aparecendo no perfil do `qualidade` ou do
`experiencia`. **A constituição NÃO foi copiada para cá** — é apontada. Cópia
espalhada diverge em três meses.

---

## A SALA DOS AGENTES ESTÁ NO AR — 07/08/2026

Item **próprio** no menu do admin (`/agency/agents`), não dentro de
Configurações — ordem explícita do CEO. Duas abas: **Agentes** e
**Configurações** (as IAs contratadas).

**A tela que estava lá rodava em `MOCK_AGENTS`: mostrava um time inventado como
se fosse o elenco real.** Ela mentia exatamente sobre a pergunta que o CEO faz.

**A regra que governa cada número dela:** o cartão nunca escreve zero quando a
resposta é "não sei". O tipo `Medida`
(`lib/agency/sala-dos-agentes/tipos.ts`) tem **três** casos — `medido`,
`zeroMedido`, `naoMedido` (com motivo obrigatório) — e a tela desenha os três
diferentes. Não existe `number` cru: `number | null` viraria `?? 0` no primeiro
`.tsx` distraído, e aí "não medido" e "trabalhou zero" voltariam a parecer a
mesma coisa.

**O elenco é declarado em TypeScript versionado, não varrido do disco.** Em
produção o servidor roda a partir de `.next/standalone`, sem `.claude/` nem
`docs/` — uma varredura devolveria lista vazia, que a tela leria como "este
projeto não tem agentes".

---

## 99FREELAS — A REGRA OFICIAL DO CEO: **ENVIO SUPERVISIONADO**

**Decidida em** 2026-08-07 · **por** DIOLI (CEO), com as palavras dele ·
**executada por** PM da frente 99Freelas · **registro de máquina:**
`docs/plataformas/99freelas/policy.json`

> 🟠 **MODO ATUAL: envio supervisionado.**
>
> O agente pode localizar projetos, ler briefings, eliminar oportunidades ruins,
> calcular score, precificar, criar uma proposta individualizada e preencher a
> candidatura.
>
> **Antes do clique final em "Enviar proposta", deve parar para aprovação
> humana.**
>
> Os termos públicos atuais do 99Freelas não trazem proibição explícita de
> bots/automação, mas também não fornecem autorização expressa para automação de
> candidaturas. Como spam e violações podem resultar inclusive em banimento de
> outras contas do mesmo usuário, não liberar submissão automática até obter
> autorização formal do 99Freelas.
>
> **Importante:** não assumir limite de 10 propostas mensais. O plano Free possui
> 10 conexões/mês; os planos pagos possuem limites maiores. O sistema deve
> consultar/configurar o plano real da conta antes de definir o limite
> operacional.

### 🔴 A IMPRECISÃO QUE O CEO CORRIGIU — e que estava nos nossos documentos

O Diretor resumiu a cota ao CEO como **"10 propostas por mês"**. Está errado por
**generalizar**: 10 é a cota do plano **Free**. A régua oficial, que o CEO
conferiu na fonte do próprio 99Freelas (blog oficial, março/2025, e a Central de
Ajuda):

| Plano | Conexões/mês |
|---|---|
| Free | 10 |
| Pro | até 120 |
| Premium | 240 |

**E o nome certo é `conexões`, não "propostas".** É o termo da plataforma, e a
diferença é operacional: conexão é consumida **também por pergunta ao cliente**,
e **projeto disputado consome mais de uma**. Chamar de "proposta" faz a casa
planejar 240 propostas com 240 conexões e descobrir na 80ª que a cota acabou.
**"Conexões" no código, na tela e nos documentos.** Nome errado vira regra
errada seis meses depois.

**O plano da conta é PREMIUM**, declarado pelo CEO em 07/08/2026 — logo a cota
operacional é **240**. A procedência está gravada no `policy.json`: foi
declarado em conversa, **não foi lido da tela** (nenhum login foi feito).

**O fail closed segue intacto:** o padrão, na ausência de declaração, continua
sendo Free (10). Apagar `plano_declarado_da_conta` devolve o sistema a 10
sozinho, sem tocar em código. Piso, nunca teto otimista.

### 🔴 A SEGUNDA CORREÇÃO — esta é NOSSA, e é de dinheiro

A casa vinha dizendo: **"embuta a taxa de 10–20%, senão a margem é corroída em
toda proposta."** A leitura da fonte diz o contrário, e em dois lugares
independentes:

- **Termos de Uso:** *"Nós **adicionamos** uma taxa de 10% a 20% (R$ 5,00 no
  mínimo) **na sua oferta** enviada ao Cliente"*.
- **Central de Ajuda, "Como enviar propostas?":** *"Sua oferta … é o valor que
  **será recebido pelo freelancer**"* / *"Oferta final: a oferta final **inclui**
  uma taxa de intermediação"*.

Ou seja: **o que se digita é o líquido da agência.** A taxa é acrescentada por
cima e quem paga é o cliente. **Embutir não protege margem — ela já está
protegida — e só encarece a oferta final em 11% a 25%, derrubando a chance de
ganhar sem aparecer em relatório nenhum.**

**O que protege a margem é o PISO:** `max(piso da casa, piso da categoria da
plataforma)`. É isso que o Pricing Engine trava.

**A taxa por plano, confirmada na fonte** (`fontes/ajuda-planos-de-freelancers.md`):
Básico **20%**, Pro **15%**, Premium **10%**. Sem plano declarado, o motor usa a
**mais cara (20%)** — fail closed também no preço, porque errar para menos faz a
oferta final surpreender o cliente para cima.

**Se a primeira proposta real mostrar o contrário**, muda-se
`precificacao.taxa_incide_sobre` no `policy.json` e o motor passa a fazer o
gross-up. É dado, não código.

### O que ficou construído

| Peça | Onde | O que trava |
|---|---|---|
| Platform Policy Engine | `lib/marketplaces/politica.ts` | política é dado versionado; plataforma sem `policy.json` = BLOCK |
| Compliance Gate | `lib/marketplaces/portao.ts` | `ALLOW` / `HUMAN_GATE` / `BLOCK` por ação |
| Compliance Validator | `lib/marketplaces/99freelas/conformidade.ts` | link, contato, pagamento fora, **referência à comissão**, comissionado, permuta, spam por repetição |
| Cota de conexões | `lib/marketplaces/99freelas/conexoes.ts` | plano configurável, fail closed em Free, custo desconhecido = `Infinity` |
| Contador no volume | `lib/marketplaces/99freelas/contador.ts` + `ConexaoGasta` | conexão gasta não volta; leitura que falha = mês esgotado |
| Pricing Engine | `lib/marketplaces/99freelas/preco.ts` | `max(piso da casa, piso da categoria)`; taxa relatada, não embutida |
| BrowserComputer | `lib/marketplaces/navegador.ts` | só https, só o domínio, só área pública, ritmo humano, CAPTCHA = parar |
| Loop do agente | `lib/marketplaces/99freelas/agente.ts` | elimina antes de gastar; para no clique |
| Follow-up | `lib/marketplaces/99freelas/follow-up.ts` | cliente esperando além do prazo **freia** o envio de novas propostas |

### A UMA LINHA DE DADO que destrava o envio

`policy.json → autorizacao_do_suporte`. Quando o suporte responder por escrito:
`status: "autorizado"` **+** `respondido_em` **+** `evidencia` (o arquivo com a
resposta arquivada). **As três metades juntas, ou não vale** — status sozinho é
a parte fácil de escrever com otimismo.

**Não existe flag escondida:** nenhum `process.env`, nenhum `{ forcar: true }`,
nenhum `case` no gate. Há teste que reprova o arquivo que voltar a ter qualquer
um dos três.

### 🟠 O E-MAIL AO SUPORTE — o remetente da casa NÃO SERVE

Texto congelado em `docs/plataformas/99freelas/pergunta-ao-suporte.md`.
**Medido em 07/08/2026, por DNS público:**

- `diolidigital.com.br` — **nenhum TXT, nenhum MX, nenhum `resend._domainkey`**.
  Não está verificado no Resend.
- `dioli.studio` (o domínio do exemplo em `lib/email/send.ts`) — **NXDOMAIN**.
  O domínio não existe.

Consequência: mesmo com `RESEND_API_KEY` presente, o `RESEND_FROM` não pode
estar num domínio verificado da agência. `sendEmail` cairia em
`Dioli Studio <onboarding@resend.dev>` — o remetente compartilhado do Resend,
que **só entrega para o dono da conta Resend**. **O e-mail não chegaria ao
99Freelas**, e sairia de um endereço que não é da agência.

**Não confirmei se `RESEND_API_KEY` e `RESEND_FROM` existem em produção** — não
há token do Railway neste ambiente e nenhuma rota expõe variáveis. Ausência de
informação não é informação: está declarado, não deduzido. **Mas isso não muda a
conclusão**, porque a verificação de domínio falha por DNS, que é público.

**Recomendação: o CEO manda do Gmail dele.** A resposta cai na caixa dele e o
suporte reconhece o titular da conta.

### 🟠 Risco aberto declarado: a ENTRADA do follow-up não existe

O mecanismo está construído e testado. **A alimentação dele, não:** o chat do
99Freelas fica atrás do login, e login é `BLOCK` nesta rodada. Hoje a fila de
follow-up só enche à mão ou por e-mail de notificação encaminhado. Enquanto for
assim, a sanção de "não responder a tempo" **está mitigada em código e exposta
na operação**.

---

## 99FREELAS: PODE COM AJUSTE — e o ajuste é COTA, não texto de contrato

**Decidido em** 2026-08-07 · **por** PM da frente 99Freelas, sob a trava de
plataforma de 03/08 · **origem:**
`docs/plataformas/99freelas/pareceres/2026-08-07-agente-autonomo-de-prospeccao.md`
(15 fontes capturadas em `docs/plataformas/99freelas/fontes/`)

O CEO pediu um agente autônomo que opera o 99Freelas por navegador e envia **10
propostas por dia**. O parecer-trava saiu **antes de qualquer código**, como ele
mesmo escolheu.

**O que os Termos NÃO dizem:** não existe a palavra automação, robô, bot,
script ou crawler — nem nos Termos, nem na Central de Ajuda (0 resultado para
cada termo). Diferente do CapCut, que proíbe automação com todas as letras.
**Ausência de proibição não é permissão:** também não existe autorização. É o
silêncio do contrato, e no silêncio quem julga é a moderação, olhando conduta.

**O que os Termos dizem, e nos alcança:** *"propagação de spams … e quaisquer
outras práticas que descumpram os termos"* → Violação (30 dias de propostas
rebaixadas) → Penalização (bloqueio de enviar proposta) → **Banimento
permanente, que alcança outras contas do mesmo usuário**. É o mesmo formato do
ban da Meta em 03/08: a regra violada é de CONDUTA, não de tecnologia.

**O ajuste que redefine o projeto — e é aritmética, não opinião:** o 99Freelas
cobra cada proposta **e cada pergunta** em "conexões", com cota **MENSAL**:
gratuito 10/mês, Pro 120/mês, Premium 240/mês. **10 por dia = 300 por mês**,
acima do teto do plano mais caro. Projeto disputado custa **mais de uma**
conexão, e conexão gasta **não volta**.

As três regras que ficam para qualquer plataforma de marketplace desta casa:

1. **Teto de ritmo é lido da plataforma, nunca fixado no `.env`.** Número
   escrito à mão descola do saldo real e queima cota que não se recupera.
2. **Ausência de proibição explícita rebaixa o veredito, não o promove.**
   Silêncio contratual = 🟠 PODE COM AJUSTE, com as condições viradas requisito.
   Só vira 🟢 com resposta escrita da plataforma.
3. **Onde há CAPTCHA, o robô para e escala.** reCAPTCHA e Cloudflare Turnstile
   estão confirmados no login do 99Freelas. Contornar é fraude na lista de
   sanções — e nesta casa é proibição, não custo/benefício.

**A quarta, que é de dinheiro:** a plataforma tira **10% a 20%** da oferta
digitada, e impõe piso por categoria (R$ 30 a R$ 100). O Pricing Engine aplica
`max(piso da casa, piso da categoria)` **e** embute a taxa — senão a margem some
sem aparecer em relatório nenhum.

---

## DEPLOY SÓ COM CI VERDE — e "sem CI" nunca conta como verde

**Decidido em** 2026-08-06 · **por** CEO · **origem:** `docs/deploys/portao.md`,
`lib/plataforma/sentinela-do-deploy.ts`, `lib/plataforma/porta-de-emergencia.ts`

Às 12h22 o GitHub Actions entrou em pane, nenhum workflow rodou, e a produção
recebeu um commit **sem nenhum resultado de CI** — não vermelho: inexistente.
Deu certo porque o portão foi rodado à mão. **A proteção era alguém lembrar.**

A regra que fica, e ela vale para qualquer esteira desta casa:

1. **Prova vem ANTES da entrega, não ao lado dela.** Checagem que roda em
   paralelo com o deploy não é portão — é comentário.
2. **Ausência de prova não é aprovação.** Cancelada, estourada, pulada, ainda
   rodando ou inexistente são todas a mesma coisa: ninguém provou nada. É a Lei
   da casa (*ausência de informação não é informação*) aplicada à esteira.
3. **A régua é UMA.** Quem confere depois e quem decide antes usam a mesma
   função (`julgarProva`). Duas cópias é como um dos lados volta a ler ausência
   como verde.
4. **Toda trava de entrega precisa de porta de emergência declarada** — senão,
   no dia da pane, a trava impede o conserto e alguém a desliga para sempre.
5. **Porta de emergência sem rastro é o caminho normal com outro nome.** O
   registro (quem, quando, por quê, sobre qual commit, e o estado da prova
   naquele instante) é gravado **antes** da subida: não deu para registrar, não
   sobe.
6. **Alarme não pode ser tranca.** O sentinela saiu do gatilho de push porque,
   com o portão ligado, um alarme vermelho descartaria justamente o deploy que
   conserta o motivo do alarme.

**Escolha de mecanismo, para o registro:** a trava mora **na plataforma de
deploy** (o "Wait for CI" do Railway), não num workflow do GitHub. Trava que
depende do sistema que caiu não é trava.

---

## ALCANCE ≠ AUTORIZAÇÃO — lista explícita por cliente, fail-closed

**Decidido em** 2026-08-06 · **por** CEO (incidente que ele mesmo pegou) ·
**origem:** `lib/integrations/meta/ativos-autorizados.ts`

O CEO clicou "Conectar Facebook/Instagram" no portal do cliente **Foocci**. A
Meta devolveu um token do **usuário** dele. Com esse token, a casa leu **14
contas de anúncio** (Santioh, Dilix, Queise, DileeBags e pessoais) e **gravou
como conexões da Foocci todas as Páginas/Instagram que o token alcançava** —
com o token de Página junto, que publica. Palavras dele: *"eu só autorizei as
contas do Foocci no projeto."*

**A regra, para qualquer plataforma (Meta, Google, TikTok, e as que vierem):**
o que uma credencial **ALCANÇA** e o que a agência **PODE USAR** são dois
conjuntos. Tratá-los como um só é a falha. O segundo conjunto:

1. **é explícito** — uma lista por cliente, gravada, com quem marcou e quando;
2. **é do cliente** — ele marca na tela dele; a agência não marca por ele;
3. **é fail-closed** — lista vazia libera **nada**, e banco indisponível
   também libera nada. Ausência de lista nunca vira permissão;
4. **é derivado** — o dono vem do token do portal ou da própria linha de
   conexão cujo token está em uso, **nunca de um `clientId` vindo do pedido**;
5. **mora onde o dado nasce** — em `saveConnection` e na camada de leitura, não
   na rota. Trava que mora na rota é trava que a rota seguinte não tem;
6. **revogar APAGA** — desmarcar remove a linha **e** a conexão. Deixar o token
   guardado depois de revogado é manter o dano.

**Corolário que veio junto:** conectar não é autorizar. O popup do OAuth passou
a distinguir três desfechos — conectado, **falta escolher** e erro. Dizer
"Conta conectada ✓" quando nada foi liberado é mentir para o dono do negócio
sobre o que a agência passou a enxergar.

---

## Regra que mede um TRECHO tem de emitir só o TRECHO que mediu

**Decidido em** 2026-08-04 · **por** Diretor, após 3 reprovações da auditoria
adversarial · **origem:** `lib/agency/execution/leitura-do-cliente.ts:311`
(`COBERTURA_MINIMA_DE_LASTRO = 1`)

O piso que separa "observei no feed do cliente" de "inventei" foi reprovado três
vezes **pelo mesmo defeito de forma, não de regra**: ele conferia um pedaço do
texto e publicava o texto inteiro em volta.

**A consequência que faz disso regra de companhia:** limiar fracionário é fração
de texto inventado entregue sob o rótulo de observado — e **o adversário calibra
o enchimento na primeira tentativa**. Com meio de lastro exigido, escreve-se meia
frase falsa de propósito. Hoje a exigência é total, pedaço por pedaço.

**O que muda para todos:** qualquer trava que valide uma parte e libere o todo
está errada por construção, em qualquer domínio — preço, prazo, nome de cliente,
métrica. Ou a régua cobre o que sai, ou o que sai encolhe até caber na régua.

**Corolários que vieram junto, no mesmo dia:**

- **Todo teste de trava precisa de um caso em que o ADVERSÁRIO escolhe a
  formatação da entrada.** O teste passava porque **o próprio teste escrevia as
  vírgulas** que o modelo não escreve. Duas vezes o teste foi ajustado para baixo
  do bug — o que é o mesmo que apagar o bug do relatório.
- **Telemetria de trava é parte da trava.** O log do piso descrevia a regra
  antiga; um operador lendo aquele log auditaria um mecanismo que não existia
  mais (`leitura-do-cliente.ts:515`).
- **Assimetria deliberada entre afirmar e negar.** Derrubar uma afirmação
  negativa pode usar régua mais frouxa do que autorizar uma positiva. Não é
  inconsistência — é o custo do erro sendo diferente nos dois sentidos.

---

## Frase de guarda no fim de um texto que será truncado é frase que some

**Decidido em** 2026-08-04 · **por** Diretor · **origem:** `leitura-do-cliente.ts:665`
(`blocoComGuarda`, de manhã) e `lib/agency/esteira/mes.ts:284`
(`trechoComRessalva`, à tarde)

A ressalva mora no fim do texto porque é ali que ela se lê. O corte para caber
num limite começa pelo fim — **então o corte come exatamente a ressalva**. O
documento interno avisava; a mensagem que chegava ao cliente, não.

**O que muda para todos:** onde houver ressalva e limite de tamanho na mesma
superfície, quem trunca reserva o espaço da guarda antes de cortar o corpo. Vale
para portal, WhatsApp, card de aprovação e relatório.

> **Proposto ao Diretor Geral do Cérebro como regra de companhia.** O motivo de
> subir: a lição foi aprendida de manhã num arquivo e **repetida à tarde em
> outro**, por outro caminho. Lição que não atravessa o corredor sozinha é lição
> que precisa morar no kit — não escrita lá por conta própria.

---

## Métrica que muda de significado precisa mudar de nome ou de versão

**Decidido em** 2026-08-04 · **por** Diretor · **origem:** `lib/agency/esteira/mes.ts:45`
e `mes.ts:187` (`versaoDaMedicao`)

O alcance passou de "um dia" para "o mês inteiro" **mantendo o campo, o rótulo e
a linha de comparação**. O relatório teria anunciado **+2694%** ao primeiro
cliente pagante — número tecnicamente calculado, comercialmente uma mentira.

**O que muda para todos:** medição carrega versão. Comparar números de versões
diferentes é proibido, e quando a base muda o cliente é avisado com todas as
letras em vez de receber uma variação percentual bonita.

---

## Estar logado não é ser dono

**Decidido em** 2026-08-04 · **por** Diretor · **origem:** auditoria da onda de
métricas (`app/api/meta/insights/route.ts:40`)

Rota que aceita um id por query string precisa checar **posse por workspace**,
mesmo estando atrás de sessão. Sessão prova quem é; não prova de quem é a coisa
pedida.

**O que muda para todos:** vale para toda rota nova. O sintoma da falta engana —
tudo funciona perfeitamente enquanto existir uma agência só.

---

## Sobra não é evidência de correspondência

**Decidido em** 2026-08-04 · **por** Diretor · **origem:**
`scripts/backfill-carrossel-foocci.mjs`

Quando N arquivos sobram e N peças estão vazias, a tentação é casar por ordem.
**Casamento posicional é decisão humana, atrás de flag explícita, nunca o
default** — no caso real, o passe por ordem montaria carrossel com o logo e com
material bruto dentro.

**Corolário do mesmo achado:** o índice de "já tem dono" tem de ler **onde o dono
realmente mora**. O logo não era referenciado por post nenhum e por isso entrava
na fila de candidatos como se estivesse livre.

**O que muda para todos:** todo script de backfill nasce com dry-run, imprime
casados / excluídos / sobras, e só grava com `--apply` depois de alguém ler o log.

---

## Todo orçamento é precificado — inclusive o de parceiro interno

**Decidido em** 2026-08-03 · **por** CEO

Nenhum projeto roda "de graça invisível". Projeto de parceiro interno (Foocci
é o primeiro) recebe preço pela tabela da casa e entra **contabilizado como
A FATURAR** — "fica como se estivesse devendo" — para prestação de contas ao
financeiro. Onde mora: `Project.proposalPricing` (itens, fonte da tabela,
total) + `proposalStatus: aprovada_interna_a_faturar`.

**O que muda para todos:** projeto sem preço registrado não é aprovado.
Primeiro aplicado: Foocci a R$ 2.050/mês (social ritmo profissional R$ 1.200 +
gestão de tráfego R$ 850, pontos médios da tabela), sujeito a ajuste do CEO.

---

## O modelo de contas na Meta: agência recebe parceiros, verba roda no cliente

**Decidido em** 2026-08-03 · **por** CEO (reiterado — a instrução era esta desde
o primeiro momento; a execução do Diretor no lançamento a violou)

- O **Business (portfólio) da agência** é a casa que **recebe os parceiros**:
  cada cliente conecta o negócio dele como parceiro da agência.
- **Campanha de cliente roda na conta de anúncios DO CLIENTE** — verba, cartão
  e histórico no nome dele. A Foocci é a primeira.
- A **conta de anúncios da própria agência** serve para UMA coisa: publicidade
  da própria Dioli. Nunca para veicular campanha de cliente.

**Por que ficou registrado com esta ênfase:** em 03/08, o Diretor montou a
campanha da Foocci na conta de anúncios da agência — contrariando a instrução —
e a conta da agência foi restringida no mesmo dia. O modelo do CEO também é o
que isola o dano: restrição num lado não derruba o outro.

---

## Especialistas-trava de plataforma: Meta, Google e TikTok

**Decidido em** 2026-08-03 · **por** CEO · **origem:** restrição da conta de
anúncios da agência pela Meta, no dia do lançamento da Foocci

Três especialistas fixos — `meta`, `google`, `tiktok` — "como se fossem
funcionários dessas empresas dentro da agência". O papel deles não é
consultoria: é **trava**. Nenhuma escrita em nenhuma das três plataformas sem
parecer prévio (PODE / NÃO PODE / PODE COM AJUSTE).

**O que muda para todos:**
- O parecer cita a **biblioteca capturada** em `docs/plataformas/` — documentos
  oficiais das plataformas, com data, URL e hash — ou declara a lacuna. Parecer
  de memória não vale.
- A biblioteca é **recapturada diariamente** por rotina agendada; mudança vira
  linha no `docs/plataformas/CHANGELOG.md` e ajuste na cartilha.
- A trava vale para o Diretor. O ban de 03/08 foi ação do próprio Diretor sem
  ninguém no papel de dizer "isso derruba conta".

---

## O piloto roda 100% IA, sem revisão humana

**Decidido em** 2026-07-31 · **por** CEO

Não existe pessoa conferindo antes de o entregável chegar ao cliente.

**O que muda para todos:** esta casa passa a ter um perfil de risco **mais
exposto que o do Foocci**. Lá o erro de um agente é uma frase numa conversa; aqui
é uma peça, um plano de mídia ou um post publicado em nome de um cliente pagante.

Consequência direta e não negociável: **rodar 100% IA não significa pular a
escada.** Significa que a escada é a única proteção que sobrou. Departamento novo
nasce em sombra e sobe com evidência — sem exceção "só pra esse cliente".

---

## A fonte das regras de IA é o kit, não este repositório

**Decidido em** 2026-07-31 · **por** CEO · **origem:** commit `af3c96f`

As regras de agentes moram no `dioli-brain-kit`. Este repositório **aponta**, não
copia.

**O que muda para todos:** aprendeu algo que serve a mais de um produto? **Não
escreva no kit por conta própria** — proponha ao Diretor Geral. Cópia espalhada
diverge: atualiza-se um repositório, esquecem-se os outros, e em três meses
ninguém sabe qual versão vale.

---

## A IA dá pensamento, não poder

**Decidido em** 2026-06/07 · **por** CEO · **origem:** `ARCHITECTURE.md` §3

Quatro consequências cravadas no código:

1. **IA é plugável** — `BRAIN_AI_PROVIDER`. Nunca chame um SDK direto.
2. **IA nunca inventa** — campo nulo vira `undefined` e entra em `missingFields`.
   Nunca é preenchido por inferência.
3. **IA nunca aplica sozinha** — aprovar e aplicar são transições **separadas**.
4. **Rule-based é o fallback universal** — IA off, falhando ou inválida → o motor
   determinístico assume sem derrubar nada.

**O que muda para todos:** se você escrever um caminho onde a falha da IA quebra a
aplicação, você quebrou esta lei.

---

## Um PM por projeto; o chat deixa de ser a memória

**Decidido em** 2026-08-01 · **por** CEO · **origem:** a reestruturação
CEO → PM → especialistas

Esta casa passa a ter **uma porta**: o PM. Assuntos deixam de virar abas
separadas — viram despacho para especialista, e o resultado vira registro no
repositório **na mesma sessão**.

**O que muda para todos:** nenhum aprendizado durável pode existir só na conversa.
E **nenhum chat antigo é fechado antes de exportado e minerado** — ver
`docs/arquivo/README.md`. Conversa apagada não volta.

---

## Dado real ou estado honesto — nunca número inventado

**Decidido em** 2026-08-01 · **por** PM da sessão de design · **origem:**
`HANDOFF.md` §5.1 (commit `3f888f1`)

A Inteligência de Marketing devolve `null` ou vazio e a tela mostra *"não
informado"* / *"conecte"* em vez de preencher com estimativa. Motivo: é um painel
de **decisão de marketing** — número inventado é pior que ausência, porque ausência
o dono vê e corrige, e número inventado ele usa.

**O que muda para todos:** vale em toda superfície que mostra dado de cliente, não
só nessa aba. Campo ausente vira estado honesto na UI, nunca preenchimento.

> **Proposto ao Diretor Geral como regra de companhia.** É a contraparte de
> interface do guardrail "ausência de informação não é informação" — o mesmo
> princípio, aplicado à tela em vez da conversa.

---

## Verdade se lê no servidor, não se monta no cliente

**Decidido em** 2026-08-01 · **por** PM da sessão de design · **origem:**
`HANDOFF.md` §5.2

O endpoint de marketing faz o fan-out no backend (`Promise.all` sobre request,
artifacts, brandBrain, connections, posts) e entrega um shape já normalizado. O
componente fica burro e testável, e o parsing de JSON fica num lugar só.

**O que muda para todos:** esta decisão é a **mesma** do P0 aberto em
`docs/pendencias.md` — *"a verdade do cliente é montada no cliente"* em
`reason.ts`. O padrão certo já existe e já está em produção num endpoint. Quem for
fechar aquele P0 deve copiar este desenho, não inventar outro.

Registrar isso aqui é o ponto do corredor: sem ele, o especialista `cerebro`
resolveria de um jeito e o `esteira` de outro, e em um mês haveria dois padrões
brigando.

---

## O reset da casa preserva a porta de entrada

**Decidido em** 2026-08-01 · **por** CEO, na sessão do PM · **origem:** pedido
direto de "começar do zero"

Zerar a operação apaga cliente, projeto, entregas, aprovações, portal e o cérebro
de marca — mas **não** apaga as solicitações de novos clientes. Elas voltam ao
estado `new`, desligadas do cliente que foi apagado, e são o ponto de partida da
operação seguinte.

Motivo: a solicitação é a única coisa no banco que **veio de fora**. Cliente,
projeto e entrega o sistema refaz sozinho a partir dela; a solicitação, não —
quem a escreveu foi um prospect, e ela não se reconstrói.

**O que muda para todos:** `DELETE /api/admin/reset` passa a ter dois modos, e o
**padrão é preservar** (`keep-requests`). Apagar a porta de entrada exige pedir
`mode: "everything"` de propósito. Junto veio um `GET /api/admin/reset` — auditoria
somente-leitura que mostra o que seria apagado e o que seria preservado, **sem
apagar nada**. Regra: nunca se roda o reset sem rodar a auditoria antes.

O que nenhum modo toca: workspace, usuários e login, chaves de IA e integrações,
contas conectadas da Meta, o Radar de mercado, a governança do Brain e o histórico
de treino do SDR. Isso é a agência, não é dado de cliente.

---

## O raio-x noturno vira mecanismo desta casa

**Decidido em** 2026-08-05 · **por** CEO, como protocolo da companhia ·
**origem:** `dioli-brain-kit`, `docs/16-raio-x-noturno.md`

Todo projeto passa um raio-x no próprio sistema toda madrugada. **Cada Diretor
faz no seu** — ninguém faz pelo outro, porque o valor está na tradução dos
padrões para o código de cada produto, não no ritual.

**O que muda aqui:** existe `npm run raio-x`. A coleta é código puro
(`lib/raio-x/`), zero IA, persistida em `docs/raio-x/coletas/` e comparada com a
noite anterior. A IA entra só depois, para ler a coleta e escrever o relatório do
CEO.

**As três regras que vieram junto, e que não são negociáveis:**

1. **Pedido por padrão nomeado.** Nunca "veja o que dá para melhorar" — isso
   volta com opinião de estilo. São cinco padrões, e cada um está traduzido para
   este código em `docs/raio-x/README.md`.
2. **A coleta não pode usar IA.** IA erra diferente toda noite, e aí "piorou
   desde ontem" deixa de significar alguma coisa — e a comparação com ontem é
   metade do valor.
3. **Varredura que não rodou devolve "não sei", nunca "está tudo bem".**
   Achado que sumiu porque a varredura quebrou entra em `desconhecidos`, nunca em
   `resolvidos`.

O raio-x é somente leitura, e isso é trava com teste
(`__tests__/raio-x/raio-x-nao-escreve.test.ts`), não promessa em comentário.

**O que NÃO muda:** o raio-x diagnostica; o conserto continua sendo uma frente
com dono e verificação. Diagnóstico sem dono vira lista, e lista ninguém lê.

---

## O especialista estuda todo dia, não só quando precisa executar

**Decidido pelo CEO em** 2026-08-05 · **registrado pelo** Diretor

> *"Quanto mais coisas eles souberem e absorverem, mais avançados eles vão ficar.
> Você precisa fazer eles criarem uma rotina de aprendizado, autoaprendizado."*

A biblioteca de plataformas nasceu em 03/08 como resposta a incêndio: a conta de
anúncios foi restrita, e capturou-se **política**. Foi o que apagou o fogo, e
ficou assim por três dias. O defeito disso tem nome: **o especialista que só sabe
o que NÃO pode fazer não sabe fazer.**

**A regra, em uma frase: conhecimento não se captura sob demanda.** Aprender no
momento em que a tarefa chega significa aprender com pressa, aprender o mínimo, e
descobrir a regra que faltava depois de já ter agido.

**O que muda para todo especialista da casa:**

1. **Cobertura é meta, não sobra.** O manifesto de cada especialista busca o
   máximo do conhecimento público do seu domínio — referência de API inteira, não
   só a página do endpoint que ele vai chamar hoje.
2. **A rotina é diária e é código.** Recaptura todo dia, hash por fonte, `[MUDOU]`
   quando muda. Aprendizado que depende de alguém lembrar não é rotina.
3. **Lacuna é declarada, com data.** Fonte que não capturou vira lacuna escrita no
   manifesto e linha no CHANGELOG. **Biblioteca que finge cobertura é pior que
   biblioteca pequena** — o parecer sai confiante e errado.
4. **Parecer cita fonte capturada ou declara a lacuna.** Especialista que responde
   de memória está inventando, mesmo quando acerta.
5. **O manifesto cresce, não encolhe.** Tirar uma fonte exige motivo no CHANGELOG.

**Por que isso é decisão de corredor e não de plataforma:** vale para Meta,
Google e TikTok hoje, e para todo especialista que a casa criar amanhã. O ativo
da agência não é o código que cada agente executa — é o que cada agente sabe
antes de executar.

---

## Escolha do cliente é dado crítico: nunca se perde em silêncio

**Descoberto em produção em** 2026-08-08 · **registrado pelo** Project Manager

O CEO escolheu material no seletor do Google, no portal da Foocci, e a tela
respondeu **"Sem material — a Dioli não alcança NENHUM arquivo seu"**. Medido
pelo diagnóstico de conexões, em produção: **1 arquivo ao alcance do app no
Google, 0 linhas em `DriveMaterial`.** O Google concedeu; a casa perdeu a escolha
sem um erro, sem um aviso, sem um registro.

**A regra, em uma frase: escrita de dado do cliente que falha tem que aparecer na
tela do cliente.** Não basta não perder — tem que ser impossível perder calado.

**O que produzia o silêncio, e eram dois lugares no mesmo caminho:**

1. **Navegador.** O callback do seletor fazia `await fetch(...)` e
   `await res.json()` sem `try/catch`. Rede oscilando, servidor reiniciando num
   deploy, ou 502 do proxy devolvendo HTML rejeitavam a promessa e o callback
   morria ali — nada no banco, nada na tela.
2. **Servidor.** O `upsert` era `.catch(() => null)` (o erro real nunca chegava
   nem ao log), e a rota devolvia **HTTP 200** com zero gravados, no campo que a
   tela pinta de **verde**, dizendo "Você escolheu apenas pastas" — para um PNG.

**O que fica, como mecanismo:**

- `vereditoDaEscolha` é o único lugar que decide status e frase da gravação.
  **Zero gravado nunca é 200 e nunca é frase verde**; gravação parcial nomeia o
  arquivo que ficou de fora, em vermelho. Função pura, portão nas duas metades.
- O `catch` do servidor loga o motivo real com `clientId` e `fileId`, e a frase
  de erro vai para a tela do cliente sem culpá-lo.
- `POST /api/admin/reconciliar-drive` é o par do diagnóstico: ele já sabia
  DETECTAR (`escolhaPerdida`), agora a casa CONSERTA — todo arquivo que o Google
  concede e a casa não tem entra **pendente de triagem**, com papel NULO.
  **Reconciliar não é declarar:** quem diz o que um arquivo é continua sendo o
  cliente, senão a imagem errada entra numa peça entregue.

**Por que é decisão de corredor:** o Drive é onde doeu, mas a classe é toda
escrita nascida de um ato do cliente — envio de material, aprovação, resposta de
briefing, pedido. Falha calada é o defeito, mesmo quando a causa é outra.

## A letra da ficha só vale se o motor a lê

**16/08/2026.** As 69 fichas da linha declaram `autonomia: A | B | C` desde que
nasceram, com a semântica escrita na tabela de cada uma: **A** só informa,
**B** recomenda/prepara e o passo externo exige aprovação, **C** executa com log.
Até esta data o CI conferia **uma** coisa sobre essa coluna: que a letra
estivesse entre as três. O motor de execução nunca a lia.

Ou seja: as sete fichas do 12º departamento nasceram `B` e nada no código
impedia uma delas de fazer o que só `C` poderia. **A letra era decoração** — e
decoração é exatamente o que o guardrail 4 da casa proíbe ("prompt é aviso,
código é trava"). O teto de custo, na mesma ficha, sempre foi trava de verdade;
a autonomia era um adjetivo ao lado dele.

**O mecanismo:** o contexto de execução passa a declarar o `efeito` pretendido
(`informar` · `preparar` · `externo`) e o executor compara com a letra da ficha.
`B` diante de efeito externo **escala em vez de recusar** — a ficha diz "exige
aprovação", não "nunca", e o pacote de escalada É o pedido de aprovação.

**O padrão é `informar`, e a razão é um incidente evitado por pouco.** O primeiro
desenho usava `preparar` como padrão, por parecer o que toda chamada já fazia. A
suíte derrubou em minutos: **oito das 69 fichas são autonomia A**, e as oito
passariam a ser recusadas por uma trava que ninguém pediu para elas. **Trava nova
que reprova o que já roda não é trava, é incidente.** O motor não adivinha a
intenção do chamador — assume a menor, e quem prepara declara que prepara.

**Por que é decisão de corredor:** vale para as 69 funções da linha e para toda
cadeia futura, não só para Produto & Tecnologia. Toda coluna que uma ficha
declara e que o motor não lê é uma promessa que a casa faz e não cumpre; a
pergunta "quem lê isto em runtime?" passa a valer para cada campo novo de ficha.

---

## Zero não é resposta — e verba declarada se responde na cara

**16/08/2026.** No piloto ao vivo, o CityJobs pediu **2 posts estáticos por dia**
e disse a verba com todas as letras: *"estamos pensando algo em torno de R$ 500
por mês"*. Quarenta e oito segundos depois a casa devolveu **R$ 1.800 a
R$ 3.400** — 3,6× o declarado — cotando um "Plano Essencial" de **3 posts por
semana** para quem tinha pedido catorze. Sem uma palavra sobre a diferença.

**A causa, lida e não deduzida:** o painel mostrava "0 posts/mês" durante a
conversa; o CEO avisou na hora e a conversa seguiu. Esse zero atravessou o
sistema inteiro porque **todo guardião testava `postsPerWeek === undefined`, e
`0` é definido**. `0 * 4 = 0` entrou em `detectPackage(0)`, que devolve
"essencial" porque `0 <= 14`. A estimativa saiu com `missingForEstimate: []` e
`confidence: "high"` — confiança máxima sobre um campo vazio.

**As três regras que viraram mecanismo:**

1. **Falso-por-omissão passa em teste de `undefined`.** Volume `0`, negativo,
   `NaN` ou fora de tipo são o mesmo estado: o dado não chegou. Vale para todo
   campo numérico que ESCOLHE alguma coisa, não só para posts.
2. **Estimativa quebrada não vira número.** A trava (`travadaPor`) é perigosa
   justamente porque a estimativa travada TEM número — R$ 1.800 é maior que zero
   e passava por toda conferência de "tem estimativa?". Ela agora vale como
   ausência de orçamento: o pedido fica parado e **contado** em `semOrcamento`.
3. **Verba declarada é confrontada por código, não por prompt.** A faixa já
   estava capturada e guardada; o que faltava era alguém COMPARAR. O confronto é
   calculado junto do número, viaja gravado com ele, e o texto nomeia a
   diferença e oferece o que cabe — Pulso (R$ 49) e Ritmo (R$ 297), filtrados da
   tabela do conselho. **Nenhum preço nasce nesse caminho:** se o Pulso mudar de
   preço, a oferta muda sozinha, porque ela nunca soube o número.

**Por que é decisão de corredor:** a #1 é uma regra de leitura de dado que vale
para a esteira inteira, e a #3 estabelece que **limite declarado pelo cliente é
dado de trava, não enfeite de painel**. Confiança calculada só sobre o que
alguém lembrou de contar como faltante mente exatamente quando mais custa.
---

## Entregar não é avisar — e a seta seguinte é sempre a que dói amanhã

**16/08/2026.** Pergunta do CEO, com o piloto no ar: *"nada ainda via e-mail. O
que aconteceu?"*

O orçamento tinha sido calculado, o texto escrito e a conversa do portal
recebido tudo — e ninguém avisou o destinatário.
`lib/agency/esteira/orcamento-do-briefing.ts` criava um `portalMessage` e mais
nada: não havia uma linha de e-mail no arquivo inteiro. A casa já mandava e-mail
na **confirmação** do briefing e ficava muda justamente na hora da coisa que o
cliente estava esperando.

**É o D-003 outra vez, um degrau adiante: caixa certa, seta faltando.** Na
véspera o CEO esperou a noite inteira por uma seta (`lead_incompleto` fora da
vista de tudo); hoje esperou de novo pela seta seguinte. Consertar uma seta por
vez, no dia em que ela dói, é como se chega ao terceiro dia de espera.

**As quatro regras que passam a valer para todo aviso da casa:**

- **O e-mail AVISA; ele não substitui o portal.** A conversa continua sendo a
  fonte da verdade. O e-mail leva o essencial e o link para ver — mandar a
  mensagem inteira criaria uma segunda verdade, que diverge no primeiro ajuste
  de escopo.
- **Sem canal de contato, nada trava.** Faltar contato impede **avisar**, nunca
  **atender**. Briefing que entrou sem e-mail segue sendo atendido pelo portal.
  Mesma lei que fez `lead_incompleto` entrar na busca de entrega.
- **O aviso vem DEPOIS da transação, e não volta para dentro dela.** É aí que
  mora a garantia de não duplicar: o que impede o cliente de receber o mesmo
  orçamento a cada cinco minutos é o pedido já ter saído da fila quando o envio
  acontece. Se o e-mail saísse antes e a transação falhasse, o relógio mandaria
  de novo. E de novo. **Falha de e-mail não se retenta aqui — retentar é
  exatamente como se manda duas vezes.** Aviso que não saiu vira notícia no
  despertador, para gente resolver.
- **Um caminho de e-mail só.** Reaproveita `lib/email/send.ts` e um template
  irmão do de confirmação. Um segundo mecanismo significaria dois lugares para
  configurar remetente e dois para descobrir que a chave sumiu.

**A regra de valor mudou de forma, não de rigor.** O cabeçalho de
`lib/email/templates.ts` dizia que template de prospect *nunca* leva preço,
porque a agência revisava o escopo antes. Essa premissa morreu no dia em que a
casa passou a entregar a estimativa sozinha. Agora: **antes de existir número,
nenhum valor** (inventar seria alucinar preço); **depois, exatamente a faixa
derivada que já está no portal**, formatada por um formatador só — dois
formatadores arredondam diferente e o cliente lê dois valores para o mesmo
orçamento.

**E nenhum dos dois promete prazo.** Ordem do CEO no mesmo dia: *"em relação à
confirmação de promessa, de orçamento em um dia, não autorizei nada disso."*
Consertar só o texto que aparece no print deixa a promessa viva na caixa de
entrada do cliente.

**Por que é decisão de corredor:** vale para todo toque no ombro que a casa dá —
material, entrega, ciclo, recompra —, não só para o orçamento. A pergunta
"quem avisa o destinatário?" passa a ser parte de toda caixa nova, junto com
"quem escreve na caixa?".
