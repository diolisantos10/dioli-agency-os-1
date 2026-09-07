// GET /api/portal/materiais — o material de marca que o cliente JÁ mandou.
//
// A metade que faltava do envio: `EnvioDeMaterial` mostrava o que subiu no
// estado do React, e recarregar a página apagava a lista. Para quem está do
// outro lado, isso é indistinguível de ter perdido o arquivo.
//
// ── O DONO VEM DO TOKEN. SEMPRE. ────────────────────────────────────────────
//
// Não existe `clientId` de query nem de corpo neste arquivo — nem para ler.
// `resolvePortalClient` deriva cliente E workspace do token do portal, e o
// `where` da consulta é montado com o que ELE devolveu.
//
// Derivar em vez de comparar não é preciosismo: `findMany({ where: { clientId }})`
// com o id derivado não tem como devolver o arquivo de outro cliente, aconteça o
// que acontecer no resto do arquivo. Buscar largo e filtrar depois num `if`
// funciona até alguém acrescentar um `return` antes do `if` — e aí o material de
// um cliente aparece no portal de outro, que é o dano que não se desfaz.
//
// E quando o token não resolve: **401 sem dizer o que existe.** Nenhuma resposta
// desta rota distingue "este cliente não existe" de "não é seu" — a distinção já
// é o vazamento.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { resolvePortalClient } from "@/lib/agency/persistence/portal-access-service";
import { tokenDoPortal } from "@/lib/agency/persistence/portal-cookie";
import { destravarPorMaterial } from "@/lib/agency/esteira/materiais";
import {
  montarMateriaisDaMarca,
  DEPARTAMENTO_DO_BRAND_BOOK,
  type AnaliseGuardada,
} from "@/lib/agency/brand/materiais-da-marca";

export const dynamic = "force-dynamic";

/** Teto de leitura. O portal é uma tela, não um exportador de acervo. */
const TETO = 200;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = tokenDoPortal(req, req.nextUrl.searchParams.get("token")) ?? "";
  if (!token) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const dono = await resolvePortalClient(token);
  if (!dono) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  // ── "NÃO ACHEI" É DIFERENTE DE "NÃO CONSEGUI OLHAR" ───────────────────────
  // Um `.catch(() => [])` aqui faria uma falha de leitura sair na tela como o
  // fato "você não mandou nada" — e o cliente reenviaria tudo. A falha é
  // nomeada e sobe como indisponibilidade, que é o que ela é.
  let leituraFalhou = false;

  const linhas = await prisma.driveMaterial.findMany({
    // Pasta não é material (ver a trava em escolha-de-material.ts): mostrá-la
    // aqui faria o cliente contar como enviado o que a casa não consegue abrir.
    where: { clientId: dono.clientId, ehPasta: false },
    orderBy: { escolhidoEm: "desc" },
    take: TETO,
  }).catch((e) => {
    console.error("[portal/materiais] não consegui ler os materiais:", e instanceof Error ? e.message : e);
    leituraFalhou = true;
    return [];
  });

  // O estado da análise do brand book mora onde a casa já guarda o que concluiu
  // sobre um cliente. Tabela nova para isto seria a sexta porta que
  // docs/branding-na-ficha-do-cliente.md mandou fechar.
  const analises = await prisma.brainArtifact.findMany({
    where: { clientId: dono.clientId, department: DEPARTAMENTO_DO_BRAND_BOOK },
    orderBy: { createdAt: "desc" },
    take: TETO,
  }).catch((e) => {
    console.error("[portal/materiais] não consegui ler as análises:", e instanceof Error ? e.message : e);
    leituraFalhou = true;
    return [];
  });

  if (leituraFalhou) {
    return NextResponse.json({
      error: "Não consegui listar seus materiais agora. Eles não se perderam — avise a equipe se isto continuar.",
      indisponivel: true,
    }, { status: 503 });
  }

  // Uma análise por material: a mais recente ganha. Ordenado por `createdAt`
  // desc acima, o primeiro que o mapa vê já é o vigente.
  const porMaterial = new Map<string, AnaliseGuardada>();
  for (const a of analises) {
    if (porMaterial.has(a.canvasId)) continue;
    let erro: string | null = null;
    let naoLido: string[] = [];
    try {
      const c = JSON.parse(a.canvasJson || "{}") as { erro?: unknown; naoLido?: unknown };
      if (typeof c.erro === "string") erro = c.erro;
      if (Array.isArray(c.naoLido)) naoLido = c.naoLido.map(String);
    } catch { /* canvas ilegível não pode derrubar a lista do cliente */ }
    porMaterial.set(a.canvasId, {
      materialId: a.canvasId,
      status: a.status,
      erro,
      // O que a casa não conseguiu abrir de dentro do arquivo vai para a tela.
      naoLido,
      atualizadoEm: a.createdAt,
    });
  }

  // ── A PORTA DOS PEDIDOS DE MATERIAL (25/08/2026) ──────────────────────────
  //
  // ── O buraco, medido em produção ────────────────────────────────────────
  // A esteira dizia à cliente, na cara dela: *"Responder os 5 pedidos que te
  // mandamos na conversa"* — e esta rota, a única do portal com a palavra
  // "materiais" no nome, devolvia **lista vazia**. `MaterialRequest` só era
  // lida por `app/agency/*` e `/api/material-requests`, as duas telas da
  // EQUIPE. O cliente era cobrado por uma resposta que ele não tinha onde dar.
  //
  // A mensagem consolidada (`esteira/pedidos.ts`) continua sendo a voz; isto é
  // a LISTA, no lugar onde ele já vem mandar arquivo. Uma coisa não substitui a
  // outra: a mensagem avisa, a lista é onde se responde item a item.
  //
  // ── E POR QUE ELA É UMA ENTREGA, NÃO SÓ UMA LEITURA ─────────────────────
  // Aparecer nesta tela É o pedido chegar ao cliente. Por isso o que ainda
  // estava com `askedClientAt` vazio é carimbado AQUI: o carimbo é o que faz
  // `fases.ts` poder dizer "a bola é sua" sem mentir. Deixar a lista visível e
  // o carimbo vazio recriaria, ao contrário, a mesma mentira de antes — agora
  // dizendo "nunca pedimos" sobre o que está na tela dele.
  const pedidosDeMaterial = await prisma.materialRequest.findMany({
    where: { status: "pending", project: { clientId: dono.clientId } },
    orderBy: { requestedAt: "asc" },
    select: { id: true, type: true, description: true, requestedAt: true, askedClientAt: true },
    take: TETO,
  }).catch((e) => {
    // MESMA regra do resto do arquivo: "não achei" ≠ "não consegui olhar".
    console.error("[portal/materiais] não consegui ler os pedidos de material:", e instanceof Error ? e.message : e);
    return null;
  });

  if (pedidosDeMaterial === null) {
    return NextResponse.json({
      error: "Não consegui listar o que a produção está esperando de você agora. Avise a equipe se isto continuar.",
      indisponivel: true,
    }, { status: 503 });
  }

  const aCarimbar = pedidosDeMaterial.filter((p) => p.askedClientAt === null).map((p) => p.id);
  if (aCarimbar.length > 0) {
    await prisma.materialRequest.updateMany({
      where: { id: { in: aCarimbar } },
      data: { askedClientAt: new Date() },
    }).catch((e) => {
      // Best-effort: o carimbo é contabilidade, e contabilidade não pode
      // esconder do cliente a lista do que a produção espera dele.
      console.warn("[portal/materiais] não consegui carimbar os pedidos como mostrados:", e instanceof Error ? e.message : e);
    });
  }

  const materiais = montarMateriaisDaMarca(
    linhas.map((l) => ({
      id: l.id,
      nome: l.nome,
      mimeType: l.mimeType,
      tamanhoBytes: l.tamanhoBytes,
      papel: l.papel,
      papelConfirmadoEm: l.papelConfirmadoEm,
      mediaAssetId: l.mediaAssetId,
      erro: l.erro,
      escolhidoEm: l.escolhidoEm,
    })),
    [...porMaterial.values()],
  );

  return NextResponse.json({
    ok: true,
    materiais,
    pedidos: pedidosDeMaterial.map((p) => ({
      id: p.id,
      tipo: p.type,
      descricao: p.description,
      pedidoEm: p.requestedAt.toISOString(),
    })),
  });
}

// ── POST: o cliente RESPONDE um pedido de material ──────────────────────────
//
// A metade que faltava. Sem ela, a lista acima seria mais uma tela que cobra e
// não escuta — a mesma doença, com pixels novos.
//
// Ela NÃO recebe arquivo: o envio de arquivo já tem porta (`/api/media`, e o
// `EnvioDeMaterial` logo ao lado). O que ela recebe é a RESPOSTA — "mandei",
// "não tenho", "usa o que já está no Drive" — porque metade dos pedidos de
// material se resolve com uma frase, e sem esta porta a única saída era um
// humano marcar `resolved` na tela da agência, que o cliente não alcança.
export async function POST(req: NextRequest): Promise<NextResponse> {
  let corpo: Record<string, unknown>;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = tokenDoPortal(req, typeof corpo.token === "string" ? corpo.token : null) ?? "";
  if (!token) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const dono = await resolvePortalClient(token);
  if (!dono) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const pedidoId = typeof corpo.pedidoId === "string" ? corpo.pedidoId.trim() : "";
  const resposta = typeof corpo.resposta === "string" ? corpo.resposta.trim() : "";
  if (!pedidoId) return NextResponse.json({ error: "pedidoId é obrigatório" }, { status: 400 });
  // Vazio é vazio: a rota devolve a pergunta em vez de fechar um pedido mudo.
  if (resposta.length < 3) {
    return NextResponse.json(
      { error: "faltou_resposta", pergunta: "Me conta em uma frase: você mandou, não tem, ou já está no Drive?" },
      { status: 422 },
    );
  }

  // O DONO VEM DO TOKEN: o pedido só é alcançável pelo projeto do cliente
  // derivado dele. Fechar o pedido de material de outro cliente destrava a
  // produção dele com uma resposta que não é dele.
  const pedido = await prisma.materialRequest.findFirst({
    where: { id: pedidoId, status: "pending", project: { clientId: dono.clientId } },
    // `projectId` e `requestedByAgentId` entram aqui porque o destrave precisa
    // deles — sem o agente, a tarefa dele fica marcada como bloqueada para
    // sempre mesmo depois de o cliente responder.
    select: {
      id: true, description: true, projectId: true, requestedByAgentId: true,
      project: { select: { clientRequestId: true } },
    },
  }).catch(() => null);
  // 404, nunca 403: o `where` acima já combina id + status + posse
  // (`project.clientId: dono.clientId`) — "não existe" e "existe mas é de
  // outro cliente" chegam aqui pelo MESMO caminho e saem com o MESMO corpo.
  // 403 confirmaria ao chamador que o pedidoId existe, virando oráculo de
  // enumeração (convenção da casa: ver `app/api/agency/clients/[id]/marca/route.ts`).
  if (!pedido) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

  try {
    await prisma.$transaction([
      // A RESPOSTA VIRA MENSAGEM DELE NA CONVERSA. É o que faz a equipe ver que
      // ele respondeu, e o que faz o histórico do portal contar a verdade —
      // `resolvedAt` numa coluna não é ninguém informado.
      prisma.portalMessage.create({
        data: {
          clientId: dono.clientId,
          clientRequestId: pedido.project?.clientRequestId ?? null,
          authorRole: "client",
          authorName: "Cliente",
          body: `Sobre “${pedido.description}”: ${resposta}`.slice(0, 2000),
          readByTeam: false,
          readByClient: true,
        },
      }),
      prisma.materialRequest.update({
        where: { id: pedido.id },
        data: { status: "resolved", resolvedAt: new Date() },
      }),
    ]);
  } catch (e) {
    console.error("[portal/materiais] não consegui registrar a resposta:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Não consegui registrar sua resposta agora. Tente de novo." }, { status: 503 });
  }

  // ── A PROMESSA QUE ESTA ROTA FAZ, E QUE ELA NÃO CUMPRIA (26/08/2026) ──────
  //
  // O `recado` abaixo diz ao cliente, com todas as letras: *"A produção volta a
  // andar com isso"*. Até esta linha existir, ela não voltava. Esta rota era a
  // ÚNICA porta que o cliente tem para fechar um pedido de material — dizer
  // "mandei", "não tenho", "já está no Drive" — e fechava o pedido sem mover a
  // tarefa do agente travado e sem devolver o projeto para a fila. A porta da
  // EQUIPE (`PATCH /api/material-requests/[id]`) sempre destravou; a do CLIENTE
  // não. Duas portas, um destrave.
  //
  // Medido em produção em 26/08/2026: 30 pedidos no workspace, 30 `pending`,
  // ZERO fechados desde sempre. Promessa escrita ao cliente que o código não
  // cumpre é a pior classe de defeito: não quebra, não acusa, e o cliente
  // espera.
  //
  // Best-effort de propósito: a resposta do cliente JÁ FOI GRAVADA na transação
  // acima. Se o destrave falhar, o que não pode acontecer é perder a resposta
  // dele e mandá-lo digitar de novo — o despertador reencontra o projeto pela
  // fila, mas ninguém reencontra uma frase que o cliente já deu.
  const retomada = await destravarPorMaterial({
    projectId: pedido.projectId,
    requestedByAgentId: pedido.requestedByAgentId,
  }).catch((e) => {
    console.error("[portal/materiais] resposta gravada, destrave falhou:", e instanceof Error ? e.message : e);
    return null;
  });

  return NextResponse.json({
    ok: true,
    recado: "Anotado. A produção volta a andar com isso — se faltar mais alguma coisa, a gente te avisa por aqui.",
    // O que a casa REALMENTE fez, para a tela não ter que adivinhar: quantos
    // pedidos ainda faltam e se a produção foi mesmo re-enfileirada agora.
    aindaFaltam: retomada?.aindaFaltam ?? null,
    producaoRetomada: retomada?.producaoRetomada ?? false,
  });
}
