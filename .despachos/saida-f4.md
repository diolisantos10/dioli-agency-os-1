# F4 — O argumento de venda, por produto, DENTRO da tabela

> Método: preço e escopo lidos do código (fonte executável), não de memória.
> Onde não consegui confirmar, está marcado **"preciso confirmar"**, com quem
> perguntar — nunca preenchido por inferência.

---

## ⚠️ ACHADO 0 — duas divergências de tabela, antes de qualquer coisa

### 0.1 `docs/precos.md` se contradiz DENTRO do próprio arquivo (Dioli Digital)

O topo do arquivo (seção "Os quatro degraus", fechada em 26/08/2026) e o corpo
de `lib/agency/planos.ts` (`export const PLANOS`, fonte executável, protegida
por `__tests__/comercial/a-tabela-e-uma-so.test.ts` e
`preco-uma-fonte-so.test.ts`) concordam entre si:

| Plano | Preço | Implantação |
|---|---|---|
| Pulso | R$ 49 | isenta |
| Ritmo | R$ 290 | isenta |
| Presença | R$ 490 | R$ 390 |
| Conteúdo | R$ 790 | R$ 690 |

Mas **mais abaixo, no mesmo arquivo** (`docs/precos.md`, seções "A conta" linha
176-182 e "O que ainda não foi feito..." — números residuais de antes de
26/08/2026), aparecem valores diferentes e um quinto plano que **já foi
removido do código**:

| Plano | Valor residual no doc | Valor real (código) |
|---|---|---|
| Ritmo | R$ 297 | R$ 290 |
| Presença | R$ 790 | R$ 490 |
| Conteúdo | R$ 1.390 | R$ 790 |
| Crescimento | R$ 2.590 | **não existe mais** — saiu em 26/08/2026 (`lib/agency/planos.ts:250-266`) |

O próprio código já documenta essa divergência como problema fechado (comentário
em `lib/agency/comercial/negociacao.ts:84-86`: *"Plano Ritmo (R$ 297/mês): 8
peças" → hoje é R$ 290 e 12 peças [...] "Plano Conteúdo (R$ 1.390/mês)" → hoje é
R$ 790"*). **Não é um preço em disputa — é texto velho que sobrou no arquivo.**
Uso a tabela do código (a que bate com o topo do doc) como verdade abaixo.
**Ação sugerida:** apagar as duas tabelas residuais de `docs/precos.md`
("A conta" e a lista de 5 planos em "O que ainda não foi feito") — quem
promove/edita o doc é o PM, não eu.

### 0.2 "Vídeo gerado por IA (R$ 690)" não tem produtor encontrado — Foocci não, Dioli sim, mas só em parte

Cruzando com `.despachos/saida-f2.md` (inventário já feito nesta casa):

- **Edição de vídeo do cliente** (corte 9:16 + normalização de áudio + capa) —
  **TEM produtor real e ligado** (`lib/agency/media/video.ts` → `montarReel` →
  `produzirArtesPendentes` → `despertador.ts`, a cada 5 min). Único risco: depende
  de `ffmpeg` estar instalado no container de produção (`railpack.json`); F2 não
  conseguiu confirmar se está de pé **agora**. → **Pode vender o item "Edição do
  vídeo do cliente (60s) — R$ 350"**, com a ressalva de confirmar
  `/api/capacidades` antes de prometer prazo a um cliente específico.
- **Vídeo gerado do zero por IA** (o item "Vídeo gerado por IA (15s) — R$ 690"
  da tabela de serviços) — **nenhum produtor encontrado** em `lib/agency/` (sem
  integração com gerador de vídeo por IA; F2 não achou nada, e
  `lib/agency/planos.ts:274` afirma textualmente *"vídeo gerado por IA [...] a
  casa não produz vídeo hoje [...] em nenhuma forma"*). **Recomendo NÃO vender
  este item até o PM confirmar** se existe produtor fora de `lib/agency/` que eu
  não tenha visto, ou retirar da tabela.

---

## 🍽️ FOOCCI

### Quem é o cliente
Dono ou gerente de restaurante pequeno/médio que hoje depende de aplicativo de
entrega terceiro e/ou processo manual (WhatsApp, papel) para cardápio e pedidos.

### A dor, na linguagem dele
"Não tenho um canal de venda que seja meu — dependo do app de terceiro pra tudo,
e não tenho os dados de quem compra de mim."

*(Não incluí número de comissão de app de entrega — nenhuma fonte datada foi
confirmada nesta rodada; regra do bloco proíbe estatística sem fonte.)*

### A oferta — dentro da tabela
Fonte: `/home/user/control_room/docs/juridico/mapa-foocci.md`, espelhando
`src/lib/billing/pricing.ts` no repositório do Foocci.

| Plano | Mensal | Trimestral | Anual |
|---|---|---|---|
| Essencial | R$ 179 | R$ 483 | R$ 1.790 |
| Crescimento | R$ 429 | R$ 1.158 | R$ 4.290 |
| Performance | R$ 899 | R$ 2.427 | R$ 8.990 |

Desconto único existente: **50% do primeiro mês**. Cobrança recorrente,
renovação automática.

> ⚠️ **Limite de acesso, não de vontade:** este agente roda com sandbox restrito
> a `/home/user/diolidigital` e **não conseguiu ler** o detalhamento de escopo
> (o que entra e o que não entra em cada plano) em
> `control_room/docs/juridico/mapa-foocci.md` — o comando foi bloqueado pelo
> próprio ambiente ("Claude Code may only concatenate files from the allowed
> working directories… `/home/user/diolidigital`"). **O que está dentro/fora de
> cada plano Foocci fica como "preciso confirmar" — pergunte a quem tem acesso a
> `control_room` ou rode este bloco a partir de lá.**

### As objeções — as três contratuais primeiro

1. **"Tem fidelidade?"**
   Resposta: **Não há fidelidade declarada** na tabela oficial. Cobrança
   recorrente por mensal, trimestral ou anual — você escolhe o ciclo, sem
   período mínimo de permanência declarado nela.

2. **"Se eu cancelar antes do fim do ciclo, pago multa?"**
   Resposta: **Nenhuma multa de cancelamento está declarada** na tabela de
   preços. **Preciso confirmar** se existe cláusula de multa fora da tabela
   (termo de uso/contrato assinado) — não é a tabela de preços que declarar
   isso seria o lugar certo, e eu não tive acesso ao documento jurídico
   completo nesta rodada (ver limite de acesso acima).

3. **"Qual o prazo — quanto tempo dura o contrato, e como cancelo?"**
   Resposta honesta: a tabela declara os **ciclos de cobrança** (mensal,
   trimestral, anual) e renovação automática. **Regra exata de cancelamento**
   (antecedência, reembolso proporcional) — **preciso confirmar com quem mantém
   o contrato/termos do Foocci.**

4. **"Por que pagar assinatura se o app de entrega já é grátis pra mim?"**
   Resposta: fala da ferramenta, nunca de resultado financeiro — *"você tem um
   canal de venda com a marca do seu restaurante, sem depender só do app de
   terceiro."* Não prometer aumento de vendas nem de faturamento (CDC art. 37
   §1º: promessa de resultado que induz em erro é publicidade enganosa mesmo
   por omissão — e a Foocci já tem trava de código recusando esse tipo de
   frase).

### A primeira mensagem (rascunho — depende de aprovação do CEO para disparo)

> "Oi [Nome], tudo bem? Sou da Foocci. A gente ajuda restaurante a ter cardápio
> digital e canal de venda próprio, sem depender só de aplicativo de entrega.
> Hoje vocês usam algum sistema pra isso ou ainda é tudo manual? Se fizer
> sentido, te mostro os planos — começam em R$ 179/mês, com 50% de desconto no
> primeiro mês."

---

## 📱 DIOLI DIGITAL

### Quem é o cliente
Negócio local pequeno (petshop, salão, loja de bairro, clínica) sem ninguém
dedicado a rede social — hoje posta sozinho, sem constância, ou não posta.

### A dor, na linguagem dele
"Sei que preciso estar ativo nas redes, mas não tenho tempo de produzir nem sei
se o que eu posto está funcionando."

### A oferta — dentro da tabela (fonte: `lib/agency/planos.ts`, teto R$ 790
confirmado contra `a-vitrine-nao-promete-acima-do-teto.test.ts`)

| Plano | Preço | Implantação | Peças/mês | O que inclui (resumo) | O que NÃO inclui |
|---|---|---|---|---|---|
| **Pulso** | R$ 49/mês | isenta | 0 | Painel de métricas ao vivo, relatório mensal só com número medido, leitura inicial do perfil | Nenhuma peça, nenhuma publicação |
| **Ritmo** | R$ 290/mês | isenta | 12 | Pauta do mês + 12 peças prontas + legenda + calendário + aprovação no portal + 2 rodadas de ajuste | **Você publica** (a casa entrega pronto e agendado); zero vídeo; zero Google; zero tráfego pago |
| **Presença** | R$ 490/mês | R$ 390 | 20 | Tudo do Ritmo + **a casa publica** no Instagram/Facebook + gestão de avaliações + atendimento humano por WhatsApp | Vídeo, stories, tráfego pago, site |
| **Conteúdo** (teto) | R$ 790/mês | R$ 690 | 36 (capacidade inteira da casa) | Tudo do Presença + stories + plano de medição + pesquisa de concorrência + reunião mensal + 3 rodadas de ajuste | Vídeo/reel em qualquer forma, tráfego pago, site |

**Peça extra fora do plano:** R$ 90. **Avulso relevante e vendável hoje:**
Carrossel R$ 290 · Post único R$ 190 · Edição de vídeo do cliente (60s) R$ 350
(ver ressalva do ambiente no Achado 0.2).

**Regra que vale para todo degrau:** vídeo, posicionamento/identidade de marca,
site e verba de mídia **nunca** entram na mensalidade — são compra à parte,
sempre (decisão do CEO, `lib/agency/planos.ts`, `FORA_DE_TODO_PLANO`).

### As objeções

1. **"R$ 790 é caro pra quem nunca gastou com marketing."**
   Resposta: comece pelo Ritmo (R$ 290) — você recebe pauta e arte prontas, só
   publica. Sobe de degrau quando fizer sentido pro seu volume.

2. **"Tem fidelidade / multa se eu cancelar?"**
   Resposta honesta, e ela é **diferente da Foocci**: existe **permanência
   mínima declarada** — 3 meses até o Presença, 6 meses do Conteúdo em diante
   (`docs/precos.md`, seção "As regras sem as quais o preço não sobrevive"),
   com pausa de até 30 dias por ciclo. **Multa em caso de cancelamento antes do
   fim da permanência não está declarada em nenhum arquivo que encontrei** —
   nem em `planos.ts`, nem em `negociacao.ts`, nem em `docs/precos.md`.
   **Preciso confirmar com o jurídico** se isso será formalizado em contrato
   antes de um vendedor afirmar "não tem multa" com certeza.

3. **"Vocês fazem vídeo?"**
   Resposta: edição do vídeo que você já tem (corte 9:16, áudio, capa) — sim,
   sempre à parte, R$ 350 (pacote de 4 por R$ 1.200). **Vídeo gerado do zero por
   IA — não ofereça ainda** (ver Achado 0.2: nenhum produtor encontrado).
   Roteiro, gravação e edição continuam fora de qualquer plano mensal.

4. **"Vocês postam no meu perfil do Google também?"**
   Resposta: **Não, hoje não.** A casa só lê a ficha do Google; não posta
   novidade/oferta nem edita horário/endereço (confirmado em
   `.despachos/saida-f2.md`, seção 2). Não prometer isso.

### A primeira mensagem (rascunho — depende de aprovação do CEO para disparo)

> "Oi [Nome]! Vi o perfil de [negócio] e reparei que [observação concreta sobre
> o perfil dele, sem inventar dado]. A gente cuida de rede social pra negócio
> pequeno — desde só medir o que já está postando (R$ 49/mês) até entregar
> conteúdo pronto todo mês (a partir de R$ 290/mês). Faz sentido eu te mostrar
> como funciona?"

---

## Bullets para o PM

- **Preço Foocci confirmado** direto na ficha (não precisou de arquivo):
  Essencial R$179/483/1.790 · Crescimento R$429/1.158/4.290 · Performance
  R$899/2.427/8.990. 50% off no 1º mês. Sem fidelidade e sem multa
  **declaradas** na tabela.
- **Preço Dioli confirmado no código**, `lib/agency/planos.ts`: Pulso 49 ·
  Ritmo 290 · Presença 490 · Conteúdo 790 (teto). Bate com o topo de
  `docs/precos.md`.
- **Divergência achada:** `docs/precos.md` tem duas tabelas antigas mais
  abaixo no mesmo arquivo (Ritmo 297/Presença 790/Conteúdo 1.390/Crescimento
  2.590 — Crescimento nem existe mais no código). Sugiro apagar as tabelas
  residuais; quem edita o doc é o PM.
- **Achado de risco:** "Vídeo gerado por IA (R$ 690)" na tabela de serviços não
  tem produtor no código — recomendo **não vender** até confirmação, ou tirar
  da tabela. "Edição do vídeo do cliente (R$ 350)" tem produtor real e pode ser
  vendida, com ressalva de ambiente (`ffmpeg` em produção).
- **Ficou "preciso confirmar":**
  - Escopo item-a-item de cada plano Foocci (o que entra/sai) — não consegui
    ler `control_room/docs/juridico/mapa-foocci.md`, sandbox deste agente é
    restrito a `/home/user/diolidigital`. Alguém com acesso a `control_room`
    precisa completar essa parte.
  - Se existe multa de cancelamento fora da tabela de preços, para Foocci e
    para Dioli (jurídico).
  - Regra exata de cancelamento (antecedência, reembolso) da Foocci.
- **Nenhuma mensagem foi enviada** a pessoa real — as duas "primeiras mensagens"
  são rascunho para aprovação do CEO, como a ficha exige.
