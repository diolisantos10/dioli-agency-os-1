import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";


// A JORNADA CONTRA UM BANCO DE VERDADE.
//
// Os outros testes provam cada peça em isolamento, com o banco simulado. Este
// prova a coisa que realmente importa e que nenhum teste de unidade alcança:
// que um cliente entra de um lado da esteira e sai do outro, com escrita real
// em SQLite, tabelas reais, chaves estrangeiras reais.
//
// É o teste que responde "a linha anda?" — a pergunta que originou este
// trabalho inteiro. Se ele passa, o projeto sai do briefing e chega ao ciclo
// mensal sem intervenção manual em nenhum ponto.
//
// A ÚNICA coisa simulada aqui é a chamada de IA. Não porque seja conveniente,
// mas porque a esteira não pode depender de rede para ser verificada — e
// porque o que está sendo testado é o TRANSPORTE, não o texto que a IA escreve.

// O caminho do banco precisa estar no ambiente ANTES de qualquer import ser
// avaliado — o cliente Prisma lê DATABASE_URL na criação. Em ESM os imports
// rodam antes do corpo do módulo, então uma atribuição comum aqui chegaria
// tarde demais e o teste falaria com o banco de desenvolvimento.
const DB_PATH = vi.hoisted(() => {
  const caminho = `${process.cwd()}/prisma/esteira-e2e.db`;
  process.env.DATABASE_URL = `file:${caminho}`;
  return caminho;
});

// A IA responde sempre a mesma peça — o conteúdo não é o objeto do teste.
//
// O que ELE precisa ser, desde 05/08/2026: uma entrega que CUMPRE o contrato de
// saída (`especialistas.ts: conferirContrato`). O fixture antigo devolvia 2
// peças para um especialista que o cliente contratou com 6 a 8, todas sem a
// mistura de formatos — ou seja, encenava exatamente a quebra de contrato que
// a casa passou a barrar. A esteira de ponta a ponta tem de rodar sobre uma
// entrega que a agência realmente publicaria.
vi.mock("@/lib/ai/generate", () => ({
  generate: vi.fn(async () => ({
    ok: true,
    data: {
      title: "Pacote de conteúdo — Padaria do João",
      summary: "Seis peças sobre o pão de fermentação natural.",
      items: [
        { headline: "3 sinais de um pão de verdade", pillar: "dica para o cliente", format: "carrossel", caption: "Nem todo pão escuro é integral. Olhe estes três sinais antes de comprar.", visual: "close na casca", cenas: "1) [gancho] a casca estala sob o dedo · 2) [prova] o miolo aberto mostra alvéolos irregulares · 3) [acao] o cheiro ácido no balcão da padaria, na hora da compra" },
        { headline: "O pão que leva 18 horas", pillar: "bastidor da padaria", format: "story", caption: "A massa descansa desde ontem à noite. É por isso que ela tem esse sabor.", visual: "close na massa" },
        { headline: "Bastidor das 3h", pillar: "bastidor da padaria", format: "story", caption: "A padaria acende as luzes quando a rua ainda está escura.", visual: "forno acendendo" },
        { headline: "Quem faz o seu pão", pillar: "quem faz", format: "feed", caption: "O João acorda às 3h. Todo dia, há 22 anos.", visual: "retrato do padeiro" },
        { headline: "A farinha que a gente escolhe", pillar: "quem faz", format: "feed", caption: "Farinha boa não é a mais branca. É a que fermenta sem pressa.", visual: "farinha na bancada" },
        { headline: "Domingo é dia de mesa cheia", pillar: "comunidade", format: "feed", caption: "O pão que sobra na sexta não chega no domingo. Encomende o seu.", visual: "mesa posta" },
      ],
    },
  })),
  anyProviderConfigured: vi.fn(async () => true),
}));

// A Qualidade aprova de primeira — o loop de correção tem teste próprio.
// Só o juiz é dublê: o mapa veredito → `revisionStatus` é REGRA da casa e vem
// do módulo real (dublar a tradução deixaria o teste concordar com um bug).
vi.mock("@/lib/agency/execution/quality-auditor", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/agency/execution/quality-auditor")>()),
  auditDeliverable: vi.fn(async () => ({ verdict: "aprovado", issues: [], note: "ok" })),
}));

// O Radar não injeta tendência aqui — é insumo, não parte da esteira.
vi.mock("@/lib/agency/radar/library", () => ({
  getActiveInsights: vi.fn(async () => []),
  buildInsightBlock: vi.fn(() => ""),
}));

import { prisma } from "@/lib/db/client";
import { runProjectExecution } from "@/lib/agency/execution/run-execution";
import { pedirDirecao, aprovarDirecao, aprovarPacote } from "@/lib/agency/esteira/marcos";
import { statusDoProjeto } from "@/lib/agency/esteira/retrato";
import { departamentoDoAgente } from "@/lib/agency/escada/degraus";

let workspaceId = "";
let clientId = "";
let clientRequestId = "";
let projectId = "";

beforeAll(async () => {
  if (existsSync(DB_PATH)) rmSync(DB_PATH);
  execSync("npx prisma db push --accept-data-loss", {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: `file:${DB_PATH}` },
    stdio: "pipe",
  });

  const ws = await prisma.agencyWorkspace.create({ data: { name: "Dioli Agência", slug: `e2e-${Date.now()}` } });
  workspaceId = ws.id;

  const cliente = await prisma.client.create({
    data: { workspaceId, name: "Padaria do João", industry: "Alimentação" },
  });
  clientId = cliente.id;

  // ── A MARCA PRECISA ESTAR CONSTITUÍDA (15/08/2026) ─────────────────────────
  // `escadaFiltraEntregas` passou a consultar `portaoDeMarca` antes de soltar
  // peça de "design" ou "social-media" (ordem do CEO: "marca sem régua, peça
  // não sai" — `contrato-de-marca.ts`). Esta jornada produz peça de
  // social-media (agente `a3`) e o passo 7 exige que ela SAIA pela decisão do
  // dono. Sem a ficha preenchida, o portão de marca reteria a peça por um
  // motivo que este teste não existe para medir — o portão tem prova própria,
  // com as duas metades, em `__tests__/consertos-presos/portao-de-marca-na-entrega.test.ts`.
  // Aqui a marca entra CONSTITUÍDA de propósito, com os cinco campos exigidos,
  // três proibições e as duas referências (`ficha-de-marca.ts:395-401`).
  await prisma.brandBrain.create({
    data: {
      clientId,
      purposeAndPromise: "Pão de fermentação natural, feito todo dia, para quem mora perto.",
      audienceRelation: "Fala com o vizinho do bairro, de igual para igual.",
      voicePairsJson: JSON.stringify([
        { dizemos: "O pão saiu do forno agora.", naoDizemos: "Adquira já o produto premium." },
      ]),
      lexiconJson: JSON.stringify({ sempre: ["pão de fermentação natural"], nunca: ["gourmet"] }),
      ownerAndHierarchyJson: JSON.stringify({ dono: "João", aprova: "João" }),
      referencesJson: JSON.stringify({
        aprovadas: ["post do pão saindo do forno às 6h"],
        reprovadas: ["post com jargão de padaria industrial"],
      }),
    },
  });
  await prisma.brainArtifact.create({
    data: {
      clientId,
      department: "proibicoes-do-cliente",
      canvasId: "proibicoes",
      canvasJson: JSON.stringify({
        itens: [
          { frase: "nunca citar concorrente pelo nome", termos: ["concorrente"], origem: "briefing" },
          { frase: "nunca usar a palavra 'gourmet'", termos: ["gourmet"], origem: "briefing" },
          { frase: "nunca prometer entrega no mesmo dia", termos: ["entrega", "mesmo dia"], origem: "briefing" },
        ],
      }),
      version: 1,
      status: "approved",
      approvedBy: "registro automático (briefing)",
    },
  });

  const req = await prisma.clientRequestDb.create({
    data: {
      workspaceId, clientId,
      businessName: "Padaria do João",
      segment: "Alimentação",
      services: JSON.stringify(["social media"]),
      objectives: JSON.stringify(["vender mais no fim de semana"]),
      briefingJson: JSON.stringify({ scope: { targetAudience: "moradores do bairro" } }),
      status: "accepted",
    },
  });
  clientRequestId = req.id;

  // ── O CLIENTE PAGOU ────────────────────────────────────────────────────────
  // A jornada real começa DEPOIS do pagamento: nenhuma produção anda sem ele
  // (lib/agency/financeiro/portao-de-pagamento.ts). Sem esta linha o motor
  // recusa tudo com "aguardando pagamento" — que é o comportamento certo, e é
  // exatamente o que __tests__/financeiro/portao-de-pagamento.test.ts prova.
  await prisma.pagamentoConfirmado.create({
    data: {
      clientRequestId,
      origem: "mercadopago",
      provedorId: "pay-e2e-1",
      valorCentavos: 259000,
      confirmadoEm: new Date(),
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect().catch(() => {});
  if (existsSync(DB_PATH)) rmSync(DB_PATH);
});

describe("a esteira, de ponta a ponta, com banco real", () => {
  it("1. o projeto nasce vinculado à solicitação — sem isso o motor recusa produzir", async () => {
    const projeto = await prisma.project.create({
      data: {
        workspaceId, clientId, clientRequestId,
        name: "Social — Padaria do João",
        goal: "vender mais no fim de semana",
        stage: "planning",
        agents: JSON.stringify(["a3"]),
      },
    });
    projectId = projeto.id;

    await prisma.task.create({
      data: { projectId, title: "Pacote de conteúdo do mês", agentId: "a3", status: "pending" },
    });

    expect(projeto.clientRequestId).toBe(clientRequestId);
  });

  it("2. o cliente recebe a direção assim que o projeto nasce", async () => {
    const r = await pedirDirecao(projectId);
    expect(r.ok).toBe(true);

    const msgs = await prisma.portalMessage.findMany({ where: { clientRequestId } });
    expect(msgs).toHaveLength(1);
    expect(msgs[0]!.body).toContain("Pacote de conteúdo do mês");

    const status = await statusDoProjeto(projectId);
    expect(status?.leitura.fase).toBe("direcao");
    expect(status?.leitura.responsavel).toBe("cliente");
  });

  it("3. sem o aval, a produção NÃO acontece", async () => {
    const r = await runProjectExecution(projectId);
    expect(r.error).toMatch(/direção/i);

    const entregas = await prisma.deliverable.count({ where: { projectId } });
    expect(entregas).toBe(0);

    const tarefa = await prisma.task.findFirst({ where: { projectId } });
    expect(tarefa?.status).toBe("pending");
  });

  it("4. o aval dispara a produção, e a tarefa anda junto", async () => {
    const r = await aprovarDirecao(projectId);
    expect(r.ok).toBe(true);
    expect(r.execucao?.produced).toContain("Social Media \u00b7 Pauta do m\u00eas");

    // O PM decide QUANTOS departamentos entram — aqui ele pode ter puxado mais
    // de um. O que importa é que TODA entrega produzida carregue conteúdo.
    const entregas = await prisma.deliverable.findMany({ where: { projectId } });
    expect(entregas.length).toBeGreaterThan(0);
    for (const e of entregas) {
      expect(e.content, `entrega "${e.name}" veio sem conteúdo`).toBeTruthy();
      expect(e.content!.length).toBeGreaterThan(40);
    }

    // O CONTEÚDO fica gravado — era isto que se perdia antes.
    const social = entregas.find((e) => e.ownerAgentId === "a3");
    expect(social?.content).toContain("O pão que leva 18 horas");

    // A tarefa do social fechou, ligada ao entregável que a cumpriu.
    const tarefa = await prisma.task.findFirst({ where: { projectId, agentId: "a3" } });
    expect(tarefa?.status).toBe("done");
    expect(tarefa?.deliverableId).toBe(social!.id);
  });

  it("5. nenhuma entrega pingou peça por peça — o cliente recebeu UMA apresentação", async () => {
    // A regra da UMA VOZ continua valendo. O que mudou é QUEM aperta o botão:
    // antes era uma pessoa, agora é o próprio PM assim que o pacote fecha.
    const msgs = await prisma.portalMessage.findMany({ where: { clientRequestId }, orderBy: { createdAt: "asc" } });
    const apresentacoes = msgs.filter((m) => m.body.includes("Terminamos"));
    expect(apresentacoes, "o cliente deve receber UMA apresentação, não uma por entrega").toHaveLength(1);
  });

  it("6. o PM apresentou SOZINHO — ninguém clicou em nada", async () => {
    // Este é o elo que faltava para a agência rodar 24h: a produção terminava
    // e o pacote ficava parado dentro de casa esperando alguém lembrar.
    const projeto = await prisma.project.findUnique({ where: { id: projectId } });
    expect(projeto?.presentedAt, "o pacote ficou pronto e não foi apresentado").toBeTruthy();

    const aprovacoes = await prisma.approvalRequest.findMany({ where: { clientRequestId } });
    expect(aprovacoes.length).toBeGreaterThan(0);

    // ⚠️ 07/08/2026 — ESTA ASSERÇÃO MUDOU DE LADO, e o motivo precisa ficar escrito.
    //
    // Ela dizia `aprovacoes.every((a) => a.clientVisible === true)`: TODA
    // aprovação vira visível, sem condição. Isso não era o contrato — era o
    // DEFEITO, escrito como se fosse contrato. Foi ele que pôs na frente do CEO,
    // em produção, dois cards "Estratégia"/"Estratégia" e "Analytics"/"Analytics"
    // com três botões de decisão e nenhum corpo: a escada de exposição retinha a
    // entrega (certo) e a aprovação subia assim mesmo (errado).
    //
    // O contrato de verdade é a ligação entre as duas metades: um card só fica
    // visível quando existe entrega COMPARTILHADA do departamento dele. Nunca há
    // card visível sem corpo atrás — que é a única coisa que o cliente precisa
    // poder confiar nesta tela.
    const entregasVisiveis = await prisma.deliverable.findMany({
      where: { projectId, visibility: "compartilhado" },
      select: { ownerAgentId: true },
    });
    const deptsComCorpo = new Set(
      entregasVisiveis.map((d) => departamentoDoAgente(d.ownerAgentId)).filter(Boolean),
    );

    // ⚠️ O QUE ESTA JORNADA REVELA, e que ninguém tinha medido: neste caminho
    // ponta-a-ponta `deptsComCorpo` é VAZIO. Departamento nasce em `sombra`
    // (`escada/registro.ts`: "degrau de nascimento — nunca entregou nada a
    // cliente nenhum nesta casa"), então nenhuma entrega vira "compartilhado" e
    // NENHUM card tem corpo. Com a asserção antiga (`every(clientVisible)`) isso
    // passava verde: a casa publicava, para todo departamento, um card vazio.
    //
    // Não se afirma aqui que algo FOI compartilhado — seria inventar um estado
    // que a escada não concedeu. Afirma-se o invariante, que vale nos dois
    // mundos: nunca existe card visível sem corpo atrás dele.
    for (const a of aprovacoes) {
      if (a.clientVisible) {
        expect(
          deptsComCorpo.has(a.department),
          `card visível do departamento "${a.department}" SEM entrega compartilhada — é o card vazio do CEO`,
        ).toBe(true);
      }
    }
    // E a metade que não pode atrapalhar: quem TEM corpo liberado aparece mesmo.
    for (const dept of deptsComCorpo) {
      const doDept = aprovacoes.filter((a) => a.department === dept);
      if (doDept.length > 0) {
        expect(doDept.some((a) => a.clientVisible), `entrega de "${dept}" foi compartilhada e nenhum card dela apareceu`).toBe(true);
      }
    }

    const msgs = await prisma.portalMessage.findMany({ where: { clientRequestId }, orderBy: { createdAt: "asc" } });
    const apresentacao = msgs.at(-1)!;
    expect(apresentacao.authorName).toBe("Gerente de projeto");
  });

  // ⚠️ 08/08/2026 — ESTA ASSERÇÃO MUDOU DE LADO, e é a segunda vez neste teste.
  //
  // Ela dizia, direto: `fase === "aprovacao_cliente"`. Mas o passo 6 acima já
  // tinha PROVADO, com banco real, que neste caminho `deptsComCorpo` é VAZIO —
  // departamento nasce em `sombra`, nenhuma entrega vira "compartilhado" e
  // NENHUM card tem corpo. Ou seja: a jornada afirmava "a bola passou para o
  // cliente" sobre um pacote em que ele não tinha uma linha para ler.
  //
  // Era o mesmo defeito escrito como contrato, um nível acima — e foi
  // exatamente o que o CEO viu no portal do CityJobs em 08/08: "O pacote
  // inteiro está pronto para você" + "Aprovar tudo", sobre três entregas
  // dizendo "material ainda não subiu".
  //
  // Agora a jornada prova os DOIS mundos, na ordem em que a casa os vive.
  // ⚠️ 25/08/2026 — ESTA ASSERÇÃO MUDOU DE LADO PELA TERCEIRA VEZ, e o motivo
  // é o conserto de "a escada tem uma regra só".
  //
  // Ela dizia `pedeAprovacao === false` sobre um pacote em que NADA tinha sido
  // compartilhado, porque `escadaFiltraEntregas` lia apenas a lista gravada no
  // banco e retinha tudo. Só que o mundo real não era esse: 64 segundos depois,
  // o despertador aplicava `DECISOES_DO_DONO` e a repescagem soltava as mesmas
  // peças. A jornada afirmava um estado que existia por um minuto.
  //
  // Agora `escadaFiltraEntregas` lê a MESMA fonte que a porta manual — a
  // decisão do dono, que tem procedência. `design` e `social-media` estão no
  // escopo dela, então saem no ato de apresentar em vez de na rodada seguinte.
  // O estado final é o MESMO de antes; o que morreu foi o minuto de
  // desencontro em que a casa recusava o que ela mesma liberava.
  //
  // O que NÃO mudou, e continua provado abaixo: quem a decisão não cobre
  // (`analytics`, `strategy`, `financeiro`) segue em sombra, e nenhum card
  // desses sobe com corpo. A escada não virou enfeite.
  it("7. a escada solta o que a decisão do dono cobre — e SÓ isso", async () => {
    const status = await statusDoProjeto(projectId);
    expect(status?.pacote.medido).toBe(true);

    const { DECISOES_DO_DONO } = await import("@/lib/agency/escada/decisoes-do-dono");
    const cobertos = new Set(DECISOES_DO_DONO.flatMap((d) => d.departamentos));

    const visiveis = await prisma.deliverable.findMany({
      where: { projectId, visibility: "compartilhado" },
      select: { ownerAgentId: true },
    });
    const soltos = new Set(visiveis.map((d) => departamentoDoAgente(d.ownerAgentId)).filter(Boolean));

    // A metade que prova que o portão DEIXA PASSAR o legítimo: se a jornada
    // produziu peça de um departamento coberto, ela chegou.
    expect(soltos.size).toBeGreaterThan(0);
    // E a metade que prova que ele CONTINUA FECHADO: nada fora do escopo
    // declarado saiu. Um `soltos` com departamento não coberto seria a escada
    // virando enfeite — que é o que este conserto não podia fazer.
    for (const d of soltos) {
      expect(cobertos.has(d as string), `"${d}" saiu sem estar em nenhuma decisão do dono`).toBe(true);
    }

    // O invariante de sempre: nunca um card visível sem corpo atrás dele.
    const aprovacoes = await prisma.approvalRequest.findMany({ where: { clientRequestId } });
    for (const a of aprovacoes) {
      if (a.clientVisible) {
        expect(soltos.has(a.department), `card "${a.department}" visível sem entrega compartilhada`).toBe(true);
      }
    }
  });

  it("7b. departamento que SUBIU de degrau: aí sim a bola passa para o cliente", async () => {
    // A outra metade da trava. Sem ela, a regra nova poderia estar barrando
    // tudo — inclusive o pacote legítimo — e o teste ficaria verde do mesmo
    // jeito. É o estado que a escada produz em `wide`: a entrega é
    // compartilhada e o card dela sobe com corpo.
    await prisma.deliverable.updateMany({ where: { projectId }, data: { visibility: "compartilhado" } });
    await prisma.approvalRequest.updateMany({ where: { clientRequestId }, data: { clientVisible: true } });

    const status = await statusDoProjeto(projectId);
    expect(status?.pacote.pedeAprovacao).toBe(true);
    expect(status?.pacote.prontas.length).toBeGreaterThan(0);
    // O card LISTA o que está dentro — com nome de cliente, nunca id de agente.
    for (const item of status!.pacote.prontas) {
      expect(item.titulo).not.toMatch(/^(a\d|social-media|paid-traffic)$/);
    }
    expect(status?.leitura.fase).toBe("aprovacao_cliente");
    expect(status?.leitura.paraCliente.oQueEsperamosDeVoce.length).toBeGreaterThan(10);
  });

  it("8. o aval do cliente abre o ciclo mensal — a rotina começa sozinha", async () => {
    const r = await aprovarPacote(projectId, { tipo: "cliente", nome: "Padaria do João" });
    expect(r.ok).toBe(true);

    const ciclos = await prisma.cycle.findMany({ where: { projectId } });
    expect(ciclos).toHaveLength(1);
    expect(ciclos[0]!.status).toBe("aberto");
    // O plano do mês ficou congelado na abertura.
    expect(JSON.parse(ciclos[0]!.planJson)).toHaveLength(1);

    const status = await statusDoProjeto(projectId);
    expect(status?.leitura.fase).toBe("ciclo");
  });

  it("9. a leitura final é compreensível pelas duas plateias", async () => {
    const status = await statusDoProjeto(projectId);
    expect(status?.leitura.paraEquipe.agora.length).toBeGreaterThan(15);
    expect(status?.leitura.paraCliente.agora.length).toBeGreaterThan(15);
    expect(status?.leitura.paraCliente.agora).not.toMatch(/entregável|canvas|executionStatus|agentId/i);
    expect(status?.leitura.progresso).toBe(100);
  });

  it("10. rodar o motor de novo não duplica nada DENTRO DA LEVA — e a leva nova traz só peça", async () => {
    // ── O QUE MUDOU EM 25/08/2026 ──────────────────────────────────────────
    //
    // A idempotência ganhou uma dimensão: (ciclo, LEVA, especialista). Rodar o
    // motor de novo continua não duplicando nada — mas se uma leva do mês
    // venceu, ele produz o lote DELA, que é justamente a capacidade que faz o
    // plano Completo (32 peças/mês) caber.
    //
    // O que este teste guarda é o limite disso: a leva nova traz APENAS quem
    // produz peça. Pauta do mês, estratégia e relatório são UM por ciclo —
    // repeti-los a cada leva triplicaria a conta de IA para entregar três vezes
    // o mesmo documento.
    const antes = await prisma.deliverable.findMany({
      where: { projectId }, select: { ownerAgentId: true, leva: true },
    });

    await runProjectExecution(projectId);
    const meio = await prisma.deliverable.findMany({
      where: { projectId }, select: { ownerAgentId: true, leva: true },
    });
    const novos = meio.filter((d) =>
      !antes.some((a) => a.ownerAgentId === d.ownerAgentId && (a.leva ?? 1) === (d.leva ?? 1)));
    // Se veio alguém novo, é porque uma leva venceu — e só quem produz PEÇA.
    for (const d of novos) {
      expect(d.ownerAgentId, `"${d.ownerAgentId}" foi refeito numa leva nova e não produz peça`).toBe("social-copy");
    }

    // E agora a prova da idempotência: rodar OUTRA vez, na MESMA leva, não
    // escreve mais nada. É esta segunda chamada que pega o motor duplicando.
    await runProjectExecution(projectId);
    const depois = await prisma.deliverable.count({ where: { projectId } });
    expect(depois).toBe(meio.length);
  });
});
