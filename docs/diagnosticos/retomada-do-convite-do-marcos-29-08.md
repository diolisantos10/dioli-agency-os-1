# Retomada — a causa-raiz do convite do Marcos (Foocci)

> **Estado escrito no repositório em 29/08/2026, 22:4x UTC**, porque a sessão
> perdeu o agendamento (`send_later`) e as ferramentas do GitHub no meio do turno.
> **Quem pegar esta frente não precisa perguntar nada a ninguém: está tudo aqui.**

## A pergunta que ainda NÃO tem resposta

**Qual dos seis motivos recusou o convite de parceria do Marcos?**
E: **para qual dos dois cadastros da FOOCCI o link dele aponta?**

⚠️ **Não invente o conserto antes do motivo.** O conserto é diferente para cada
motivo. Esta é ordem do Diretor Geral, e continua valendo.

## Por que ela não foi respondida — o elo exato que falta

A régua que responde está **pronta, testada e provada** — mas mora no **PR #400**,
que **ainda não foi mergeado**. Enquanto ele não estiver em produção, não há como
perguntar ao banco.

Não há atalho, e vale registrar por quê: o banco é **SQLite num volume do
Railway**. Não tem porta de rede. A única leitura possível é por uma rota que
roda **dentro do container** — que é exatamente o que o PR entrega.

Medido e confirmado nesta sessão, direto no Railway:
- o conserto do PR #399 está no ar desde 29/08 14:49 (deploy `8925b9d5`, SUCCESS);
- filtro `CONVITE` no log desse deploy: **zero linhas**, com o `[despertador]`
  enchendo o log ao lado. É zero de verdade: **o Marcos não voltou ao site.**
- Esperar por ele não é plano. A resposta tem de sair do banco.

## Os três passos, na ordem

### 1. Mergear o PR #400
`claude/convite-foocci-causa-raiz` → `claude/dioli-agency-os-architecture-kk7kp`.
Conferido em 22:41: **sem conflito**, CI verde na rodada anterior (`305335d`).
**O merge é do CEO ou do Diretor Geral** — a sala não mergeia o próprio PR.

### 2. Ter a chave de leitura
`PILOTO_SECRET` **existe** em produção. O que a sala não consegue é **ler o valor**
(o Railway mostra o nome, nunca o segredo).

Duas saídas, qualquer uma serve:
- **o CEO roda o `curl`** com a chave que ele já tem; ou
- **trocar `PILOTO_SECRET` por um valor novo** no painel do Railway — projeto
  `b776c152-698e-4fa0-923f-ead2de6a24d0`, serviço `diolidigital`
  `e0c288cb-c10f-4100-8863-48de0bb43d65`. É rota **somente-leitura**, reversível,
  não encosta em cadastro nem em dinheiro. ⛔ **O valor nunca entra em chat, log
  ou commit** — lê-se no painel.

> ⚠️ **Provisionar `PILOTO_SECRET` como variável própria é pendência de segurança
> por si só.** Sem ela o código cai no `CRON_SECRET` — segredo que autoriza
> **ESCRITA** — trafegando em `?chave=`, que aparece em log de proxy/CDN. Está
> registrado desde 16/08; a seção nova só encareceu.

### 3. Medir e responder

    curl -sS "https://diolidigital.com.br/api/piloto/diagnostico?chave=$PILOTO_SECRET" | jq .parcerias

**Como ler a resposta:**
- `convites[]` traz, para **cada** convite do banco: `motivo` (um dos seis),
  `clientId`, `prefixo` (8 caracteres — **nunca o token inteiro**), `usos`,
  `ultimoUsoEm`, `expiraEm`, `revogadoEm`.
- `clientes_de_nome_colidente[]` traz os cadastros duplicados por nome, dizendo
  qual deles tem `temParceriaViva: true`.

**A hipótese principal, e como confirmá-la ou derrubá-la:**
um convite com `motivo: "parceria_nao_esta_viva"` cujo `clientId` esteja num grupo
colidente onde o **outro** cadastro tem `temParceriaViva: true` → **causa achada**,
e o conserto é **fundir os dois cadastros** (o caminho da fusão foi consertado
neste PR: antes ele abortava com 500 mudo).

Se o motivo for outro, o retrato já o nomeia — e aí o conserto é outro.

## O que se sabe do duplicado (de 28/08, não medido hoje)

O cadastro da FOOCCI nasceu **duas vezes**, com 7 segundos de diferença
(double-submit), em 27/08 21:22. Um carrega a parceria e um convite emitido; o
outro é lixo. Detalhe em `docs/diagnosticos/fusao-de-cliente-duplicado.md`.

⚠️ **A pista forte:** o link do Marcos foi cunhado **depois** de o duplicado ser
descoberto — então ele pode ter usado o **link anterior**, apontando para o outro
cadastro.

## Um buraco que apareceu procurando, e que ninguém tinha visto

**A casa não registra qual link foi entregue a quem.** `ConviteDeParceria` guarda
quem cunhou e uma observação livre, mas nada amarra um convite ao Marcos. Por isso
não dá para caçar "o token dele" — só listar todos e ver o estado de cada um.
Varrido o repositório: **nenhum token de produção** está versionado (bom), e
nenhum registro de entrega existe (ruim).

## O que NÃO fazer

- ⛔ Não mandar mensagem para pessoa real. Não gerar cobrança de verdade.
- ⛔ Não mexer no cadastro de produção da FOOCCI **sem necessidade** — e se mexer,
  dizer exatamente o quê.
- ⛔ Não escrever o conserto antes de ter o motivo medido.

---

## Pendência de higiene: duas reivindicações vivas de frente JÁ ENTREGUE

*Reivindicação eterna vira ruído que todo mundo aprende a ignorar.* Estas duas
precisam ser encerradas — não foram, porque `encerrar` exige branch alinhada com
a base e esta branch está à frente (é o PR #400). **Encerre depois do merge:**

| Responsabilidade | Estado real |
|---|---|
| `esteira-beco-da-proposta-ajustada` | **entregue** no commit `e08ae2e` |
| `convite-foocci-causa-raiz` | **parcial** — a régua está entregue; a medição em produção NÃO foi feita. Só encerre depois de responder qual dos seis motivos foi. |

Comando: `npm run reivindicar -- encerrar` a partir de uma branch alinhada.

⚠️ **Cuidado ao rodar `reivindicar` nesta casa** — ver a contradição registrada no
commit `3ec0386`: um commit empurrou uma reivindicação para a branch de deploy no
mesmo segundo em que o terminal imprimiu *"nada foi escrito, commitado ou
empurrado"*, e o arquivo não ficou no worktree. A ordem do código foi conferida e
**está correta**; a contradição **não foi resolvida**. O teste que prova a ordem
por processo existe agora
(`__tests__/coordenacao/reivindicar-guarda-antes-de-escrever.test.ts`) e a
mutação foi vista vermelha. **Confira o remoto depois de rodar o comando** — não
confie só na mensagem impressa.

---

## ✅ MEDIÇÃO DE 29/08 23:07 — o que JÁ está confirmado em produção

| Fato | Como foi medido, sem credencial nenhuma |
|---|---|
| **O PR #400 está NO AR** | `/portal/invalid` — página que este PR criou e que antes não existia — passou de **404 → 200** às 23:07:07 UTC. Detector de deploy que não precisa de segredo: usa o próprio trabalho como sonda. |
| **`PILOTO_SECRET` está provisionada** | `GET /api/piloto/diagnostico` sem chave e com chave errada → **401 `{"error":"chave inválida"}`**, **não 503**. O 503 é o ramo de "segredo não configurado". |
| **A rota falha fechada** | Chave ausente e chave errada dão a **mesma** resposta opaca, sem revelar qual das duas foi. |

> ⚠️ **CORREÇÃO DE UM ALERTA MEU:** eu havia levantado "provisionar `PILOTO_SECRET`
> como variável própria" como pendência de segurança. **Ela já está provisionada**
> — consta na lista de variáveis do serviço e a rota devolve 401, não 503.
> O agravante do fallback para `CRON_SECRET` **não está ativo**. Alerta retirado.
> *Ressalva honesta:* não é possível distinguir "variável com valor" de "variável
> vazia caindo no fallback" por fora, porque as duas dão 401. O que se sabe é que
> **algum** segredo está configurado e a rota está fechada.

## ⛔ O QUE AINDA BLOQUEIA — e é uma coisa só

**Falta o VALOR de `PILOTO_SECRET` para rodar a medição.**

Este ambiente **perdeu o acesso ao Railway no meio do turno**: sem MCP, sem CLI
(`command -v railway` → vazio) e sem `RAILWAY_TOKEN`/`PILOTO_SECRET` no ambiente.
Não dá para ler nem para trocar a chave daqui.

**`PILOTO_SECRET` também NÃO está nos segredos do repositório** — os workflows só
referenciam `CRON_SECRET` e `RAILWAY_TOKEN` (`grep -rhoE "secrets\.[A-Z_]+"
.github/workflows/`). E o fallback não ajuda: o código é
`PILOTO_SECRET || CRON_SECRET`, então com a primeira configurada o `CRON_SECRET`
**não** abre a rota.

### Por que NÃO construí um contorno
Seria possível criar um workflow que lê a chave de dentro do runner e imprime só
o agregado — é o padrão de `cliente-oculto-do-titulo.yml` e `prova-da-mira.yml`.
**Não foi feito de propósito:** o log deste repositório é **público**, o contorno
usaria `RAILWAY_TOKEN` (que autoriza escrita), e ele mesmo precisaria de PR + CI +
merge — ou seja, custaria a **mesma** espera que ele tenta evitar, com risco novo.
*Mecanismo novo com token forte, sem revisão, para economizar uma linha de comando
é como se compra o próximo incidente.*

### O caminho de dois passos
1. Rodar o comando da seção "3. Medir e responder" acima com a chave do painel.
2. Colar o JSON de volta. A leitura já está mapeada — não precisa de mais nada.
