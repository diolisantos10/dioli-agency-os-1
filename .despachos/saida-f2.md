# F2 — O que a casa entrega HOJE, e o que ela NÃO entrega

> Levantamento feito lendo código, não de memória. Toda linha da tabela tem
> arquivo:linha. Onde não consegui confirmar, está na seção 4, não misturado
> na tabela.

## 0. O achado estrutural que muda a leitura de tudo

Existem **DOIS sistemas de produção na casa**, e confundi-los é o erro mais
fácil de cometer nesta ficha:

1. **A esteira real** (`lib/agency/*`) — é o que roda sozinho, a cada 5
   minutos, via `lib/agency/despertador.ts`, e é o que o cliente de verdade
   recebe: peça (JPEG), texto, vídeo editado, publicação no Instagram/Facebook,
   campanha de tráfego (pausada) e relatório mensal.
2. **O "Brain" / os 8 departamentos cognitivos** (`lib/dioli-brain/*-engine.ts`,
   citados nesta ficha) — é um **framework de raciocínio interno**, acionado
   por `POST /api/brain/reason` (`app/api/brain/reason/route.ts:1-14`) e usado
   por ferramentas de staff (`/agency/strategy-agent`, `/agency/requests`,
   `/agency/control-room`). Ele produz **canvases** (documentos de
   planejamento — `StrategyCanvas`, `SocialCanvas`, `DesignCanvas`,
   `TrafficCanvas`, `AnalyticsCanvas`, `QualityCanvas`), não peças. Nenhum
   `generate*Canvas` é chamado de dentro de `lib/agency/` — confirmado por
   grep, os únicos chamadores são o próprio `app/api/brain/reason/route.ts`
   (linhas 164–194).
   - O próprio `ARCHITECTURE.md:200` (raio-X do sistema, mantido pela casa)
     confirma isso com todas as letras: **"Piloto: só o SDR
     (`client-service-sdr`). Estratégia/social/design/tráfego = 'planejados'."**
     — no contexto de treinamento, mas a frase descreve o estado real de uso.
   - Existe também uma camada de protótipo legada em `store/agency-store.ts`
     (Zustand) que simula esses departamentos com dados mock — o próprio
     `ARCHITECTURE.md:235` já a declara **"superada pelo `ClientRequestDb`"**.
     Não é produção; é ferramenta de demonstração/treino interno.

Consequência prática: **quando o vendedor fala "Estratégia", "Design" ou
"Tráfego" como departamento do Brain, ele está descrevendo uma ferramenta
interna de planejamento, não uma entrega ao cliente.** A entrega ao cliente
sai de um código diferente, listado na tabela abaixo, seção "Esteira real".

---

## 1. Tabela de itens entregáveis

### 1A. Esteira real — o que o cliente de fato recebe

| Item entregável | Existe produtor? (arquivo:linha) | Tem portão? (teste) | Ligado na esteira? (rota/uso) | Veredito |
|---|---|---|---|---|
| Arte estática (JPEG) de feed/story/carrossel, com molde da marca | `lib/agency/design/molde.ts` (`montarHtmlDaPeca`) + `lib/agency/design/renderizar.ts` | `__tests__/design/molde.test.ts`, `molde-render.test.ts`, `molde-porta-fechada.test.ts` | `lib/agency/execution/artes.ts:201` (`produzirArtesPendentes`) ⟵ `lib/agency/despertador.ts:760` (cron a cada 5 min) | **VENDÁVEL** — mas depende de Chromium disponível em runtime (ver seção 3, achado do vídeo cobre o mesmo tipo de dependência); sem ele a peça sai como "foto crua da IA" (degradação declarada em `app/api/capacidades/route.ts:64-80`) |
| Texto de marca (legenda, título, copy) | `lib/agency/design/molde.ts:508` (`textosDaPeca`) | coberto pelos testes de molde acima; consumido em `lib/agency/design/peca.ts:208` | mesmo laço de `produzirArtesPendentes` | **VENDÁVEL** |
| Edição de vídeo do cliente → reel (corte 9:16 + normalização de áudio + capa) | `lib/agency/media/video.ts:138` (`editarParaReel`) | `__tests__/media/video.test.ts` | `lib/agency/execution/artes.ts:2246-2247` (`montarReel`) ⟵ chamado dentro de `produzirArtesPendentes` quando `post.format === "reel" \| "video"` (`artes.ts:366-368`) ⟵ `despertador.ts:760` | **VENDÁVEL, com dependência de ambiente declarada** — ver seção 3 |
| Publicação no Instagram/Facebook | `lib/integrations/meta/client.ts` (`publishPost`) | testes de integração (`__tests__/integrations/publicacao-e-descoberta.test.ts`, `trava-de-publicacao.test.ts`) | `lib/agency/esteira/publicacao.ts:910` (`publicarAgendados`) ⟵ `despertador.ts:29` + rota manual `app/api/social-posts/publicar-agora/route.ts:28` | **VENDÁVEL** |
| Campanha de tráfego pago Meta (criada PAUSADA) | `lib/integrations/meta/ads.ts` (`criarCampanhaPausada`) | `__tests__/esteira/trafego.test.ts`, `trafego-barra-e-ensina.test.ts` | `lib/agency/esteira/trafego.ts:217` (dentro de `prepararCampanha`) ⟵ `lib/agency/esteira/marcos.ts:487` | **VENDÁVEL, com trava humana por desenho** — a campanha nasce pausada; ativar (`ligarCampanha`, `trafego.ts:324`) exige `autorizadoPor` humano registrado. Isso é regra da casa (REGRA DA TRAVA DE PLATAFORMA), não um buraco. |
| Relatório mensal de performance (números reais, comparação com mês anterior, auditado antes de sair) | `lib/agency/esteira/mes.ts:97` (`medirOMes`), `mes.ts:314` (`escreverRelatorio`), `mes.ts:448` (`virarOMes`) | `__tests__/esteira/mes.test.ts`, `__tests__/brain/numeros-do-trafego-com-origem.test.ts` | `despertador.ts` e `lib/agency/execution/run-execution.ts` chamam `mes.ts`; o texto passa por `auditDeliverable` (`lib/agency/execution/quality-auditor.ts:552`) antes de ir ao cliente | **VENDÁVEL** — este é o "Analytics" que o cliente realmente recebe, e é diferente do `analytics-engine.ts` do Brain (ver 1B) |
| Atendimento/SDR — conversa de briefing pública, qualificação, orçamento ao vivo | `lib/agency/prospect-engine.ts` (`processProspectMessage`), `sdr-agent.ts`, `live-calculator.ts`, `question-engine.ts` | ampla cobertura em `__tests__/comercial/`, `__tests__/briefing/`, `__tests__/agency/prospect-engine.*` | `app/briefing/page.tsx` (porta pública) + `app/api/sdr/chat/route.ts` | **VENDÁVEL** |

### 1B. Os "8 departamentos" do Brain (`lib/dioli-brain/*-engine.ts`) — cognitivo, interno

| Departamento (id) | Produtor | Portão | Ligação real | Veredito |
|---|---|---|---|---|
| `client-service-sdr` | Não tem `*-engine.ts` próprio no Brain — só `sdr-scorecard.ts`. A produção real do SDR é a esteira 1A (`prospect-engine.ts` etc.), fora do Brain | testes da esteira 1A | `/briefing`, `/api/sdr/chat` | **VENDÁVEL** (mas é a esteira 1A que entrega, não o Brain) |
| `strategy` | `lib/dioli-brain/strategy-engine.ts:305` (`generateStrategyCanvas`) | `__tests__/brain/reason.test.ts` | `POST /api/brain/reason` ⟵ `app/agency/strategy-agent/page.tsx:77` (único chamador de UI encontrado) | **EXISTE MAS NÃO ESTÁ LIGADO À ESTEIRA DO CLIENTE** — produz documento de planejamento interno, não peça. `ARCHITECTURE.md:200` confirma "planejado" |
| `social-media` | `lib/dioli-brain/social-engine.ts:430` (`generateSocialCanvas`) | `__tests__/brain/reason.test.ts` cobre a rota, mas **nenhuma página de UI encontrada chama `deptId: "social"`** (busquei em todo `app/`) | apenas acessível via chamada HTTP direta à API, exigindo `strategyCanvas` no corpo | **EXISTE MAS NÃO ESTÁ LIGADO** — nem a um botão de staff |
| `design` (Brain) | `lib/dioli-brain/design-engine.ts:409` (`generateDesignCanvas`) | idem acima | idem — `app/agency/design-agent/page.tsx` **não** chama `/api/brain/reason` (grep vazio); a peça real de Design é produzida por 1A | **EXISTE MAS NÃO ESTÁ LIGADO.** Atenção: "Design" como departamento que o cliente recebe é a esteira 1A (arte JPEG), não este canvas |
| `paid-traffic` | `lib/dioli-brain/traffic-engine.ts:430` (`generateTrafficCanvas`) | idem | `app/agency/ads-agent/page.tsx` **não** chama `/api/brain/reason` (grep vazio); a campanha real é a esteira 1A | **EXISTE MAS NÃO ESTÁ LIGADO** |
| `analytics` (Brain) | `lib/dioli-brain/analytics-engine.ts:502` (`generateAnalyticsCanvas`) | idem | só via API direta | **EXISTE MAS NÃO ESTÁ LIGADO.** O relatório que o cliente recebe é `mes.ts` (1A), não este |
| `project-management` | `lib/dioli-brain/pm-orchestrator.ts:56,163` (`proposeProjectRuleBased`, `orchestratePMReasoning`) | `__tests__/brain/orchestrator.test.ts`, `__tests__/execution/pm-conductor.test.ts` | **ESTE é diferente dos outros 5**: importado de verdade em `lib/agency/execution/create-project-from-request.ts:10` e `lib/agency/execution/pm-conductor.ts:11`, que fazem parte da criação real de projeto a partir de um Client Request | **VENDÁVEL** — o único dos 6 canvases do Brain com uso real fora de UI/simulação |
| `quality` (Brain) | `lib/dioli-brain/quality-engine.ts:307` (`generateQualityCanvas`) | `__tests__/brain/gate-de-qualidade-para-de-mentir.test.ts`, `o-numero-do-p0.test.ts` | só via API direta (`/api/brain/reason`, deptId "quality") | **EXISTE MAS NÃO ESTÁ LIGADO.** O gate de qualidade que realmente barra entrega é outro arquivo: `lib/agency/execution/quality-auditor.ts:552` (`auditDeliverable`), que sim está ligado (`marcos.apresentar`, `mes.apresentarCiclo`) — **não confundir os dois "Quality"** |

### 1C. Capacidades explicitamente declaradas como AUSENTES pela própria casa

A casa já tem um registro-fonte para isto — `lib/agency/capacidade-de-producao.ts` — mantido
justamente para impedir que a vitrine/planos vendam o que não existe. Reproduzo o veredito dele,
que é o mesmo desta ficha:

| Item | `ponto` | Linha |
|---|---|---|
| Publicação no perfil do Google | `null` (função órfã existe, sem chamador) | `capacidade-de-producao.ts:113` |
| Escrita na ficha do Google (horários, local) | `null` — só existe leitura | `capacidade-de-producao.ts:122` |
| Legenda animada queimada no vídeo | `null` | `capacidade-de-producao.ts:130` |
| Logotipo de cliente em arquivo | `null` — só existe monograma derivado das iniciais | `capacidade-de-producao.ts:139` |
| Arquivo PDF entregue ao cliente | `null` — a casa lê PDF, não gera | `capacidade-de-producao.ts:150` |
| Relatório de auditoria de perfil (diagnóstico avulso) | `null` — a esteira produz peça, não relatório de diagnóstico | `capacidade-de-producao.ts:158` |

Este arquivo já é reforçado por teste (`__tests__/comercial/so-vende-o-que-produz.test.ts`), que
confere ida e volta: se alguém ligar um destes produtores e esquecer de promover a capacidade
aqui, o teste quebra.

---

## 2. O que a casa NÃO entrega (para o vendedor ler)

- **Não posta no Google** (Perfil da Empresa / Google Business) — nem novidade, nem oferta, nem
  evento. Só lê.
- **Não edita a ficha do Google** (horário, endereço, telefone).
- **Não faz legenda animada queimada no vídeo** — a edição corta, enquadra em 9:16 e normaliza
  áudio; não escreve nem anima texto sobre o vídeo.
- **Não cria logotipo de cliente.** Só deriva um monograma das iniciais quando falta logo.
- **Não gera arquivo PDF.**
- **Não produz relatório de auditoria de perfil como item avulso de venda** (diagnóstico
  detalhado tipo "auditoria de Instagram"). O que existe é o relatório MENSAL, dentro do ciclo
  contratado, não um produto isolado.
- **Não liga campanha de tráfego sozinha.** A campanha é criada e fica PAUSADA; ativar exige
  autorização humana registrada (`ligarCampanha`, `autorizadoPor` obrigatório) — não vender isso
  como "tráfego rodando no automático".
- **Os "6 departamentos cognitivos" do Brain (Estratégia, Social, Design, Tráfego, Analytics,
  Qualidade) não são, hoje, o que o cliente recebe.** São ferramentas internas de planejamento
  para o staff, acionadas manualmente, sem automação end-to-end entre uma e outra. Quem vende
  "nosso departamento de Estratégia analisa seu negócio com IA" precisa saber que isso é um botão
  interno, não um pipeline automático — e o texto de venda não pode prometer mais do que isso.

---

## 3. O achado do vídeo: CONFIRMADO

Respondendo item a item, com arquivo:linha:

**(a) Existe upload de vídeo por onde o cliente/portal manda?**
Confirmado indiretamente: `montarReel` (`lib/agency/execution/artes.ts:2223-2246`) busca o vídeo
bruto do cliente em `prisma.mediaAsset` filtrando `kind: "inbound"` e
`mimeType: { startsWith: "video/" }` (linhas 2229-2233) — ou seja, o mecanismo de leitura do
material do cliente já enviado existe e é consumido. Não abri a rota de upload do portal em si
nesta rodada (não estava no escopo de arquivos citados pela ficha) — ver seção 4.

**(b) Existe corte para 9:16 executando de verdade?**
Confirmado. `lib/agency/media/video.ts:107-129` (`argumentosDeEdicao`) monta o comando ffmpeg com
`scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30` (linha 119) —
cobre-e-corta, não estica (o próprio arquivo documenta por que isso é regra e não detalhe, linhas
18-23). `editarParaReel` (linha 138) executa isso de fato via `spawn("ffmpeg", ...)` (linha 156).

**(c) Existe normalização de áudio?**
Confirmado. `video.ts:123`: `"-af", "loudnorm=I=-16:TP=-1.5:LRA=11"`.

**(d) De que depende para rodar?**
- **Binário `ffmpeg`** precisa estar no runtime. Vem de `railpack.json:1-5`
  (`deploy.aptPackages: ["ffmpeg", "chromium"]`) — é configuração de infraestrutura de deploy, não
  código; o próprio `video.ts:25-31` documenta que a primeira tentativa (02/08/2026) falhou
  silenciosamente por usar `nixpacks.toml` em vez de `railpack.json`.
- `editarParaReel` confere isso em runtime antes de tentar editar: `ffmpegDisponivel()`
  (`video.ts:87-89`) roda `ffmpeg -version`; se falhar, devolve erro legível em vez de quebrar
  (`video.ts:139-141`).
- **Não depende de serviço externo nem credencial** — é só binário local.
- **`/api/capacidades`** (`app/api/capacidades/route.ts:20,31,42-48`) expõe isso ao painel em
  tempo real: `pronta: temFfmpeg`, com a frase exata *"reel não é produzido — o material do
  cliente fica parado no armazenamento"* se `ffmpeg` não estiver lá.

**Conclusão do achado:** a frase *"a casa não edita vídeo"* está **FALSA hoje**, como o achado
suspeitava. O produtor existe, o corte e a normalização executam de verdade, e o laço está ligado
à esteira automática (`despertador.ts` → `produzirArtesPendentes` → `montarReel`). A única
condição é de **ambiente** (ffmpeg instalado no container de produção via `railpack.json`), não de
código — e a própria casa já construiu o painel (`/api/capacidades`) para provar, a cada consulta,
se essa condição está de pé no ambiente que estiver rodando. Não vi motivo para tratar isso como
"existe e não roda": é "existe, roda, e a casa audita a própria pré-condição".

---

## 4. O que eu não consegui verificar

- **A rota de upload de vídeo pelo cliente (portal) em si** — confirmei que `montarReel` **lê** o
  vídeo já salvo como `mediaAsset` `kind: "inbound"`, mas não abri o endpoint que grava esse
  registro quando o cliente sobe o arquivo pelo portal. Não estava nos arquivos indicados pela
  ficha e o orçamento desta rodada não cobriu essa busca adicional — recomendo item de
  acompanhamento se o vendedor for prometer "suba o vídeo pelo portal" com essa frase exata.
- **Se `ffmpeg`/`chromium` estão de fato instalados no ambiente de produção AGORA** — isso é
  estado de runtime, não código; só o painel `/api/capacidades` (rodando em produção) responde
  isso ao vivo. Não tenho acesso para consultá-lo desta sessão.
- **Cobertura completa de "o que o portal do cliente exibe"** — abri o suficiente para confirmar
  que o card de aprovação é visual (já registrado na vitrine do departamento) e que o relatório
  mensal chega auditado, mas não fiz varredura completa de toda tela do portal — fora do escopo de
  tempo desta ficha.
