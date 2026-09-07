// O CLIENTE TEM ONDE RESPONDER — os três defeitos com a mesma forma.
//
// ═══════════════════════════════════════════════════════════════════════════
// O QUE FOI MEDIDO EM PRODUÇÃO EM 25/08/2026, COM CLIENTE OCULTO
// ═══════════════════════════════════════════════════════════════════════════
//
// A casa **pergunta ao cliente e não escuta a resposta**. Três vezes, e sempre
// a mesma forma: a pergunta existe, a porta de responder não.
//
//   1. 🔴 A conversa do portal é um beco. A cliente pediu 1 story, a TRAVA 2-B
//      parou para perguntar (certo) e ela respondeu "pode ser o pacote de 4" no
//      chat. Ninguém leu: `precisa_decisao` não tem saída pelo lado do cliente,
//      e o único leitor do chat (`pm-responde`) é PROIBIDO de decidir escopo.
//   2. 🟠 A esteira mandava responder "os 5 pedidos que te mandamos" e
//      `/api/portal/materiais` devolvia lista vazia — `MaterialRequest` só era
//      lida pelas telas da equipe.
//   3. 🟠 Briefing sem volume travava em `scope_ready`, o relógio escrevia
//      "aguardando gente" a cada 5 min e o cliente nunca era avisado de nada.
//
// ── A RÉGUA DESTE ARQUIVO ─────────────────────────────────────────────────
//
// *O teste alcança o que o cliente de verdade vê e usa, ou a coluna do banco?*
// Nesta operação, três vezes um aviso ficou gravado numa coluna e NUNCA VIROU
// PIXEL. Por isso aqui há teste de RENDER (o botão existe no HTML que o cliente
// recebe), e não só de coluna. **Coluna gravada não é cliente informado.**
//
// Provado por mutação: cada `it` abaixo quebra se a linha que ele defende for
// removida. As mutações conferidas estão nomeadas nos comentários de cada bloco.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const db = vi.hoisted(() => ({
  contentRequest: { findFirst: vi.fn(), update: vi.fn() },
  portalMessage: { create: vi.fn() },
  clientRequestDb: { update: vi.fn(), findMany: vi.fn() },
  $transaction: vi.fn(async (ops: unknown[]) => ops),
}));
vi.mock("@/lib/db/client", () => ({ prisma: db }));

const conversa = vi.hoisted(() => ({ conversaDoCliente: vi.fn() }));
vi.mock("@/app/api/messages/conversa", () => conversa);

const esteira = vi.hoisted(() => ({ atenderPedido: vi.fn() }));
vi.mock("@/lib/agency/esteira/producao-de-pedido", () => esteira);

import { lerPedido } from "@/lib/agency/esteira/leitura-do-pedido";
import { responderPergunta, lerPergunta, serializarPergunta } from "@/lib/agency/esteira/porta-da-pergunta";
import { textoDaFalta } from "@/lib/agency/esteira/orcamento-do-briefing";
import { RespostaAoPedido, MeusPedidos, type PedidoDoCliente } from "@/components/portal/SolicitarAlgo";

const raiz = join(__dirname, "..", "..");
const fonte = (p: string) => readFileSync(join(raiz, p), "utf8");

// A pergunta que a TRAVA 2-B abre: "você pediu 1, a tabela tem o pacote de 4".
const PERGUNTA_DO_PACOTE = serializarPergunta({
  pergunta: "Você pediu 1, e a minha tabela tem o pacote de 4. Como você prefere?",
  opcoes: [
    { id: "pacote", rotulo: "Pode ser o pacote de 4 — R$ 700", quantidade: 4 },
    {
      id: "avulso",
      rotulo: "Quero orçamento avulso de 1",
      escalar: true,
      dono: "a equipe comercial",
      proximaAcao: "te manda o valor de 1 peça por aqui",
    },
  ],
});

beforeEach(() => {
  vi.clearAllMocks();
  db.$transaction.mockImplementation(async (ops: unknown[]) => ops);
  db.contentRequest.update.mockResolvedValue({});
  db.portalMessage.create.mockResolvedValue({ id: "pm1" });
  conversa.conversaDoCliente.mockResolvedValue({ ancora: { clientId: "c1", clientRequestId: "cr1" } });
  esteira.atenderPedido.mockResolvedValue({ status: "triado", recado: "Fechado: pacote de 4 stories, R$ 700, entrega até 28/08." });
});

// ═══════════════════════════════════════════════════════════════════════════
// 1 · O BECO DO "PODE SER O PACOTE DE 4"
// ═══════════════════════════════════════════════════════════════════════════

describe("a resposta do cliente é escutada, e a casa anda", () => {
  function pedidoParado() {
    db.contentRequest.findFirst.mockResolvedValue({
      id: "p1", status: "precisa_decisao", pendingQuestionJson: PERGUNTA_DO_PACOTE,
      clientRequestId: "cr1", title: "1 story",
    });
  }

  // MUTAÇÃO CONFERIDA: apagar o bloco `escreverRespostaNaConversa` deixa este
  // teste vermelho — e é o bloco que faz a resposta VIRAR conversa, em vez de
  // morrer numa coluna.
  it("a resposta entra na conversa como mensagem DO CLIENTE", async () => {
    pedidoParado();
    await responderPergunta({ clientId: "c1", pedidoId: "p1", opcaoId: "pacote" });

    const msg = db.portalMessage.create.mock.calls[0]![0].data;
    expect(msg.authorRole).toBe("client");
    expect(msg.body).toContain("Pode ser o pacote de 4");
    // A pergunta viaja junto: "pode ser" solto não se entende seis mensagens
    // depois, nem por gente nem pelo `pm-responde` que lê o histórico.
    expect(msg.body).toContain("Como você prefere?");
  });

  // MUTAÇÃO CONFERIDA: remover `confirmedQuantity` da escrita faz a triagem
  // reler o texto original ("1 story") e parar de novo — o mesmo beco, agora
  // com um botão bonito na frente.
  it("grava a quantidade confirmada e devolve o pedido à triagem", async () => {
    pedidoParado();
    const r = await responderPergunta({ clientId: "c1", pedidoId: "p1", opcaoId: "pacote" });

    const escrito = db.contentRequest.update.mock.calls[0]![0].data;
    expect(escrito.confirmedQuantity).toBe(4);
    expect(escrito.status).toBe("novo");
    // Pergunta respondida é pergunta APAGADA: sobreviver à resposta é a mesma
    // pergunta duas vezes.
    expect(escrito.pendingQuestionJson).toBeNull();
    expect(esteira.atenderPedido).toHaveBeenCalledWith("p1");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.recado).toContain("pacote de 4");
  });

  // A ponta que fecha o ciclo: o número confirmado MANDA sobre a leitura léxica.
  it("a triagem passa a ler o número que o cliente confirmou, não o texto antigo", () => {
    // O texto original continua dizendo 1 — é o que a leitura léxica vê.
    expect(lerPedido("Quero 1 story").quantidade).toBe(1);
    // E é exatamente por isso que `confirmedQuantity` existe: a linha que a usa
    // está em `triagem.ts`, e sem ela a releitura reproduz a mesma parada.
    const t = fonte("lib/agency/esteira/triagem.ts");
    expect(t).toContain("pedido.confirmedQuantity");
    expect(t).toContain("quantidade: pedido.confirmedQuantity");
  });

  // "Vai para gente" NÃO pode voltar a ser silêncio. Dono e próxima ação são
  // obrigatórios, e viram texto que o cliente lê.
  it("a opção que escala nomeia o dono e a próxima ação — nunca some", async () => {
    pedidoParado();
    const r = await responderPergunta({ clientId: "c1", pedidoId: "p1", opcaoId: "avulso" });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.recado).toContain("a equipe comercial");
      expect(r.recado).toContain("te manda o valor");
    }
    // Não roda a triagem de novo: não há nada que a máquina possa decidir aqui.
    expect(esteira.atenderPedido).not.toHaveBeenCalled();
    expect(db.contentRequest.update.mock.calls[0]![0].data.declineReason).toContain("a equipe comercial");
  });

  it("opção que não existe é 422 COM a pergunta de volta — nunca um palpite", async () => {
    pedidoParado();
    const r = await responderPergunta({ clientId: "c1", pedidoId: "p1", opcaoId: "talvez" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.codigo).toBe(422);
      // Erro sem a pergunta junto seria a pergunta sem porta OUTRA VEZ, dentro
      // do conserto da pergunta sem porta.
      expect(r.pergunta?.opcoes.map((o) => o.id)).toEqual(["pacote", "avulso"]);
    }
    expect(db.contentRequest.update).not.toHaveBeenCalled();
  });

  it("pedido de outro cliente é 404, e não diz se existe (nunca 403 — oráculo de enumeração)", async () => {
    db.contentRequest.findFirst.mockResolvedValue(null);
    const r = await responderPergunta({ clientId: "intruso", pedidoId: "p1", opcaoId: "pacote" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.codigo).toBe(404);
    expect(db.contentRequest.update).not.toHaveBeenCalled();
  });

  it("responder duas vezes não roda a triagem duas vezes", async () => {
    // Segundo clique: a pergunta já foi apagada pelo primeiro.
    db.contentRequest.findFirst.mockResolvedValue({
      id: "p1", status: "novo", pendingQuestionJson: null, clientRequestId: "cr1", title: "1 story",
    });
    const r = await responderPergunta({ clientId: "c1", pedidoId: "p1", opcaoId: "pacote" });
    expect(r.ok).toBe(false);
    expect(esteira.atenderPedido).not.toHaveBeenCalled();
  });

  it("número só é aceito onde a pergunta pede número, e só se for número", async () => {
    db.contentRequest.findFirst.mockResolvedValue({
      id: "p2", status: "precisa_decisao", clientRequestId: "cr1", title: "x",
      pendingQuestionJson: serializarPergunta({
        pergunta: "Quantas peças são?", aceitaNumero: true,
        opcoes: [{ id: "uma", rotulo: "É uma peça só", quantidade: 1 }],
      }),
    });
    const bom = await responderPergunta({ clientId: "c1", pedidoId: "p2", numero: 3 });
    expect(bom.ok).toBe(true);
    expect(db.contentRequest.update.mock.calls[0]![0].data.confirmedQuantity).toBe(3);

    vi.clearAllMocks();
    db.contentRequest.findFirst.mockResolvedValue({
      id: "p1", status: "precisa_decisao", pendingQuestionJson: PERGUNTA_DO_PACOTE, clientRequestId: "cr1", title: "x",
    });
    const ruim = await responderPergunta({ clientId: "c1", pedidoId: "p1", numero: 3 });
    expect(ruim.ok).toBe(false);
    if (!ruim.ok) expect(ruim.codigo).toBe(422);
  });

  it("pergunta ilegível não vira botão que não faz nada", () => {
    expect(lerPergunta("{lixo")).toBeNull();
    expect(lerPergunta(JSON.stringify({ pergunta: "e agora?", opcoes: [] }))).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 1-B · O PIXEL. Coluna gravada não é cliente informado.
// ═══════════════════════════════════════════════════════════════════════════

describe("a porta existe no HTML que o cliente recebe", () => {
  const PEDIDO: PedidoDoCliente = {
    id: "p1",
    titulo: "1 story para sábado",
    descricao: "Quero 1 story",
    objetivo: "divulgar o sábado",
    para: null,
    status: "precisa_decisao",
    statusLegivel: "Preciso confirmar uma coisa com você",
    motivo: "Você pediu 1 peça, e o que eu tenho na tabela é o pacote de 4.",
    criadoEm: "2026-08-25T10:00:00.000Z",
    pergunta: {
      texto: "Você pediu 1, e a minha tabela tem o pacote de 4. Como você prefere?",
      aceitaNumero: false,
      opcoes: [
        { id: "pacote", rotulo: "Pode ser o pacote de 4 — R$ 700" },
        { id: "avulso", rotulo: "Quero orçamento avulso de 1" },
      ],
    },
  };

  const naoResponde = async () => ({ ok: true });

  it("o botão “Pode ser o pacote de 4” está na tela, e não só no banco", () => {
    const html = renderToStaticMarkup(<RespostaAoPedido pedido={PEDIDO} aoResponder={naoResponde} />);
    expect(html).toContain("Pode ser o pacote de 4");
    expect(html).toContain("Quero orçamento avulso");
    expect(html).toContain("<button");
  });

  it("o cartão do pedido monta a porta junto do motivo", () => {
    const html = renderToStaticMarkup(
      <MeusPedidos pedidos={[PEDIDO]} aoResponderPergunta={naoResponde} />,
    );
    // O POR QUÊ e o COMO, na mesma tela. Era só o porquê.
    expect(html).toContain("o pacote de 4");
    expect(html).toContain("Pode ser o pacote de 4");
  });

  // A TRAVA CONTRA A REGRESSÃO: sem `aoResponderPergunta` o cartão volta a ser
  // só leitura. A página do portal TEM de passar a função — foi assim que a
  // pergunta ficou sem porta da primeira vez.
  it("a página do portal liga a porta de verdade", () => {
    const pagina = fonte("app/portal/access/[token]/page.tsx");
    expect(pagina).toContain("aoResponderPergunta={responderPergunta}");
    expect(pagina).toContain("/api/portal/pedidos/responder");
  });

  it("sem pergunta aberta não aparece botão nenhum", () => {
    const html = renderToStaticMarkup(
      <RespostaAoPedido pedido={{ ...PEDIDO, pergunta: null }} aoResponder={naoResponde} />,
    );
    expect(html).toBe("");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2 · OS PEDIDOS DE MATERIAL TÊM PORTA
// ═══════════════════════════════════════════════════════════════════════════

describe("o cliente vê e responde os pedidos de material", () => {
  const rota = fonte("app/api/portal/materiais/route.ts");
  const tela = fonte("components/portal/cliente/MateriaisDaMarca.tsx");

  it("a rota do portal LÊ MaterialRequest — antes só a equipe lia", () => {
    expect(rota).toContain("prisma.materialRequest.findMany");
    expect(rota).toContain('status: "pending"');
    // O dono vem do token, derivado, nunca comparado depois.
    expect(rota).toContain("project: { clientId: dono.clientId }");
    expect(rota).toContain("pedidos: pedidosDeMaterial.map");
  });

  it("mostrar na tela É pedir: o que aparece ganha `askedClientAt`", () => {
    // Sem o carimbo, `fases.ts` continuaria dizendo "material que NUNCA foi
    // pedido ao cliente" sobre itens que estão na tela dele.
    expect(rota).toContain("askedClientAt === null");
    expect(rota).toContain("askedClientAt: new Date()");
  });

  it("existe POST para o cliente responder, e ele fecha o pedido", () => {
    expect(rota).toContain("export async function POST");
    expect(rota).toContain('status: "resolved"');
    // A resposta vira MENSAGEM DELE — resolvedAt numa coluna não é ninguém
    // informado, e a equipe precisa ver que ele respondeu.
    expect(rota).toContain('authorRole: "client"');
    // Vazio é vazio: pedido não se fecha com resposta muda.
    expect(rota).toContain("faltou_resposta");
  });

  it("a tela mostra a lista e o botão de responder", () => {
    expect(tela).toContain("A PRODUÇÃO ESTÁ ESPERANDO");
    expect(tela).toContain("Responder este");
    expect(tela).toContain('method: "POST"');
    // A porta vem ANTES da lista de arquivos antigos: quem foi cobrado precisa
    // achar onde responder sem rolar a tela.
    expect(tela.indexOf("<PedidosDeMaterial")).toBeLessThan(tela.indexOf('sobretitulo="MATERIAL DA MARCA"'));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3 · NADA SOME EM SILÊNCIO
// ═══════════════════════════════════════════════════════════════════════════

describe("briefing sem volume avisa o cliente, uma vez", () => {
  const SEM_VOLUME = JSON.stringify({
    estimate: {
      travadaPor: "O volume de posts não chegou no pedido, e é ele que define o plano.",
      missingForEstimate: ["Frequência de posts por semana"],
    },
  });

  it("o texto diz O QUE falta, POR QUÊ, QUEM tem a bola e a PRÓXIMA ação", () => {
    const t = textoDaFalta(SEM_VOLUME);
    expect(t).toContain("O volume de posts não chegou");        // por quê
    expect(t).toContain("Frequência de posts por semana");       // o que falta
    expect(t).toContain("equipe comercial");                     // dono
    expect(t).toContain("responder por aqui");                   // próxima ação
  });

  it("sem motivo gravado o texto NÃO chuta o que falta", () => {
    const t = textoDaFalta("{}");
    expect(t).toContain("não vou te mandar um número que eu não consigo sustentar");
    expect(t).not.toContain("Frequência de posts");
  });

  // MUTAÇÃO CONFERIDA: trocar o `continue` seco de volta no lugar da chamada a
  // `avisarQueFaltaInformacao` deixa estes dois vermelhos.
  it("a varredura avisa o cliente em vez de só logar", () => {
    const f = fonte("lib/agency/esteira/orcamento-do-briefing.ts");
    expect(f).toContain("avisarQueFaltaInformacao(pedido)");
    expect(f).toContain("resultado.faltaAvisada += 1");
    // Uma vez só: 288 mensagens por dia é como se ensina alguém a não ler o portal.
    expect(f).toContain("jaAvisouDaFalta");
    expect(f).toContain("faltaAvisadaEm");
  });

  it("a marca do aviso e a mensagem vão na MESMA transação", () => {
    const f = fonte("lib/agency/esteira/orcamento-do-briefing.ts");
    const bloco = f.slice(f.indexOf("async function avisarQueFaltaInformacao"));
    // Marcar antes: cliente sem aviso e casa achando que avisou.
    // Marcar depois, em escrita própria: a mesma mensagem duas vezes.
    expect(bloco.slice(0, 1600)).toContain("prisma.$transaction");
  });

  it("JSON quebrado NÃO conclui “já avisei”", () => {
    const f = fonte("lib/agency/esteira/orcamento-do-briefing.ts");
    const bloco = f.slice(f.indexOf("function jaAvisouDaFalta"), f.indexOf("function comMarcaDaFalta"));
    expect(bloco).toContain("return false");
  });

  it("o despertador para de chamar isso de rotina", () => {
    const d = fonte("lib/agency/despertador.ts");
    expect(d).toContain("r.faltaAvisada");
    expect(d).toContain("o cliente JÁ foi avisado do que falta");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// BÔNUS · O LEITOR DE QUANTIDADE ENTENDE COMO GENTE ESCREVE
// ═══════════════════════════════════════════════════════════════════════════

describe("o leitor de quantidade lê o marcador de total", () => {
  // O caso medido: recusado por "mais de uma quantidade citada".
  it("“um post de feed, uma arte só” é UMA peça", () => {
    const l = lerPedido("Quero um post de feed, uma arte só");
    expect(l.quantidade).toBe(1);
    expect(l.motivoDaContagem).toBe("contada");
  });

  it("quem escreve como formulário continua passando", () => {
    expect(lerPedido("Quero 1 post").quantidade).toBe(1);
  });

  it("“10 posts no total” e “4 stories ao todo” são o total declarado", () => {
    expect(lerPedido("Quero 10 posts no total").quantidade).toBe(10);
    expect(lerPedido("preciso de 4 stories ao todo").quantidade).toBe(4);
  });

  // ── O QUE ESTE CONSERTO SE RECUSOU A ADIVINHAR ──────────────────────────
  // Sem o marcador, dois números diferentes continuam sendo pergunta. Somar
  // seria inventar o total; pegar o maior seria subtrair trabalho. E "um post e
  // um story" são DOIS itens somados por "e" — tratar como 1 seria entregar
  // menos do que ele pediu, que é o erro que ninguém reclama até a entrega.
  it("ambiguidade real continua sendo PERGUNTA, não palpite", () => {
    expect(lerPedido("Quero 6 reels e 4 videos").quantidade).toBeNull();
    expect(lerPedido("Quero um post e um story").quantidade).toBeNull();
    expect(lerPedido("Quero 2 posts so e 3 reels so").quantidade).toBeNull();
    // E o plural sem número nunca vira 1.
    expect(lerPedido("Preciso de videos para o lançamento").quantidade).toBeNull();
  });

  // A pergunta que sobra CAI NA REGRA 2: precisa de porta. É a TRAVA 2 que a
  // abre, e ela agora passa opções.
  it("a pergunta que sobra nasce com porta", () => {
    const t = fonte("lib/agency/esteira/triagem.ts");
    expect(t).toContain("aceitaNumero: true");
    expect(t).toContain('rotulo: `Pode ser o pacote de ${n} — R$ ${preco}`');
  });
});
