import { NextRequest, NextResponse } from "next/server";
import { canalFoiRetratado } from "@/lib/agency/comercial/retratacao";
import { resolverConviteDeParceria } from "@/lib/agency/comercial/convite-de-parceria";
import { createClientRequest, listClientRequests, updateClientRequest, getClientRequest, deleteClientRequest } from "@/lib/agency/persistence/client-request-service";
import { requireSession } from "@/lib/auth/api-guard";
import {
  clienteDoWorkspace,
  naoEncontrado,
  solicitacaoDoWorkspace,
} from "@/lib/auth/posse-de-workspace";
import { runAutoScope } from "@/lib/dioli-brain/run-auto-scope";
import { limiteExcedido } from "@/lib/security/limite-no-banco";
import { sendEmail } from "@/lib/email/send";
import { briefingConfirmationEmail } from "@/lib/email/templates";
import { lerContato, montarContato } from "@/lib/agency/comercial/contato-do-lead";
import { provaDoProprioBriefing } from "@/lib/agency/consentimento/quem-pode-receber";
import { resolverRastroDaConversa } from "@/lib/agency/comercial/conversa-sem-pedido";

// ── OS TETOS DA ÚNICA PORTA PÚBLICA DE GRAVAÇÃO (raio-x de 16/08/2026) ────────
//
// Esta rota é a única de ESCRITA que responde sem sessão — é o submit do
// formulário `/briefing`, e isso é por desenho. O que NÃO era por desenho: ela
// gravava qualquer coisa, de qualquer tamanho, quantas vezes coubesse.
//
// O `bodySizeLimit: "20mb"` do `next.config.ts` NÃO cobre isto: aquele número
// vale só para Server Actions. Route handler não tem teto nenhum de fábrica —
// `await request.json()` engole o que vier. Com o SQLite morando num volume de
// tamanho fixo, o caminho mais curto para derrubar a casa inteira era um POST
// com um corpo gigante, repetido: enche o disco, e disco cheio não é "briefing
// perdido", é login quebrado, deploy travado e portal fora do ar.
//
// A CALIBRAGEM É DELIBERADAMENTE FOLGADA. O alvo é abuso, não cliente. Um
// briefing de verdade — conversa inteira do SDR, escopo e estimativa — vive na
// casa das dezenas de KB. 1 MB é uma ordem de grandeza acima do maior briefing
// que já entrou aqui. Errar a mão para baixo bloquearia o próprio CEO, que está
// em piloto e manda briefing hoje; errar para cima só devolve o buraco.
const TETO_DO_CORPO      = 1_000_000; // ~1 MB do POST inteiro
const TETO_DO_RAW_CONTEXT = 200_000;  // ~200 mil caracteres de texto corrido
const TETO_DE_JSON        = 400_000;  // cada um: briefingJson e sdrHandoffJson

// Alinhado ao `MAX_FILES` de `components/agency/briefing/FileUploadZone.tsx`.
// Regra de tela NÃO é trava: um POST direto passa por cima de qualquer
// `disabled` de botão — é a mesma lição que produziu o gate de contato abaixo.
const TETO_DE_ANEXOS = 10;

/** Bytes reais do texto (não `length`, que conta caracteres: um emoji do
 *  briefing ocupa 4 bytes no disco e 2 no `length`). */
function bytesDe(texto: string): number {
  return new TextEncoder().encode(texto).length;
}

/** O 413 desta casa: em português, dizendo o que fazer, sem revelar o teto
 *  exato — número publicado é número que o abusador usa para chegar rente. */
function corpoGrandeDemais(oQue: string): NextResponse {
  return NextResponse.json(
    {
      error: `Envio grande demais (${oQue}). Reduza o conteúdo e tente de novo — se precisar mandar arquivos, use os anexos do briefing.`,
    },
    { status: 413 },
  );
}

// Fire-and-forget prospect confirmation. O endereço sai do leitor único de
// contato (`lerContato`) — não de um `?.scope?.prospectEmail` reinventado aqui.
function sendBriefingConfirmation(body: Record<string, unknown>, briefingJson: unknown): void {
  if (body.source !== "briefing") return;
  const contato = lerContato({ briefingJson, sdrHandoffJson: body.sdrHandoffJson });
  const email = contato.email;
  if (!email) return;

  const scope = (briefingJson as { scope?: Record<string, unknown> } | undefined)?.scope;
  const { subject, html } = briefingConfirmationEmail({
    prospectName: contato.nome ?? undefined,
    businessName: typeof scope?.businessName === "string" ? scope.businessName : undefined,
    services:     Array.isArray(body.services) ? (body.services as string[]) : undefined,
  });

  // A pessoa acabou de digitar o próprio e-mail neste formulário e apertou
  // enviar. É o caso mais claro de "quem bateu na porta pode ser respondido" —
  // e a referência aponta o pedido, para ser conferível depois.
  sendEmail({ to: email, subject, html, consentimento: provaDoProprioBriefing(String(body.id ?? "novo-pedido")) })
    .then((r) => {
      // O motivo é o que `sendEmail` devolveu, nunca um palpite: `skipped`
      // hoje significa OU falta de chave OU a trava de saída do cliente falso
      // (`bloqueado:…`). Ver o comentário longo em `lib/email/send.ts`.
      if (r.skipped) console.warn("[client-requests] confirmation e-mail skipped:", r.error ?? "sem motivo declarado");
      else if (!r.ok) console.error("[client-requests] confirmation e-mail failed:", r.error);
    })
    .catch((e) => console.error("[client-requests] confirmation e-mail threw:", e));
}

// GET (list) and PATCH (mutate) are internal — session required.
// POST stays public: it is the submit target of the public /briefing form.
// It can only create "new" requests (status/source are service-controlled).

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { session, error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  // Single-record fetch by id.
  //
  // ⚠️ O que este registro carrega: `rawContext`, o transcript do SDR e o
  // `sdrHandoffJson` — a conversa crua do prospect, com nome, telefone e
  // valores falados. Sem a posse, um id de outra agência devolvia tudo isso.
  if (id) {
    try {
      if (!(await solicitacaoDoWorkspace(id, session.workspaceId))) return naoEncontrado();
      const record = await getClientRequest(id);
      if (!record) return naoEncontrado();
      return NextResponse.json(record);
    } catch {
      return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
    }
  }

  // O `?workspaceId=` da query MORREU: OMITI-LO listava a base inteira, de
  // todas as agências. O escopo da listagem é o da sessão, sempre — não é
  // parâmetro, é fato. (As órfãs continuam aparecendo para o dono real: quem
  // decide é `apenasDoWorkspace`, dentro do serviço.)
  const status      = searchParams.get("status") ?? undefined;
  const limit       = Math.min(parseInt(searchParams.get("limit") ?? "100", 10), 500);

  try {
    const records = await listClientRequests({
      workspaceId: session.workspaceId,
      status: status as never,
      limit,
    });
    return NextResponse.json(records);
  } catch {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── TETO DE RITMO NO BANCO, não na memória ──────────────────────────────────
  //
  // Aqui rodava `rateLimited`, o contador que mora num `Map` do processo. As
  // duas consequências estão escritas no próprio `lib/security/rate-limit.ts`:
  // todo deploy ZERA os baldes (num abuso em curso, qualquer push desta casa
  // devolve a cota inteira ao abusador), e com duas réplicas o teto real vira
  // 2 × o número. As quatro rotas públicas pagas migraram para o contador do
  // banco em 06/08; ESTA — a única pública que GRAVA — ficou para trás e só foi
  // notada no raio-x de 16/08.
  //
  // 20 em 10 minutos é folga de sobra para gente de verdade: ninguém preenche
  // vinte briefings em dez minutos. E é mais apertado que o anterior no que
  // importa — 8/minuto autorizava 480 registros por hora; isto autoriza 120.
  const barrado = await limiteExcedido(request, "client-requests", 20, 10 * 60_000);
  if (barrado) return barrado as NextResponse;

  // O teto de tamanho vem ANTES do parse, e em duas camadas. O `content-length`
  // é a barata: recusa sem ler um byte do corpo. Mas ele é declarado pelo
  // CHAMADOR — pode faltar (`Transfer-Encoding: chunked`) ou simplesmente
  // mentir. Por isso o texto é medido de novo depois de lido: a primeira camada
  // economiza, a segunda é a que de fato trava.
  const declarado = Number(request.headers.get("content-length"));
  if (Number.isFinite(declarado) && declarado > TETO_DO_CORPO) {
    return corpoGrandeDemais("o envio inteiro");
  }

  let bruto: string;
  try {
    bruto = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (bytesDe(bruto) > TETO_DO_CORPO) return corpoGrandeDemais("o envio inteiro");

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(bruto) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Os dois campos-baú do briefing. Não dá para truncar uma ESTRUTURA pela
  // metade sem gravar um objeto quebrado que ninguém consegue ler depois —
  // então estes se recusam, com o mesmo 413 e a mesma instrução em português.
  for (const [campo, rotulo] of [
    ["briefingJson", "as respostas do briefing"],
    ["sdrHandoffJson", "o resumo da conversa"],
  ] as const) {
    const valor = body[campo];
    if (valor != null && bytesDe(JSON.stringify(valor)) > TETO_DE_JSON) {
      return corpoGrandeDemais(rotulo);
    }
  }

  // ── O NOME DO NEGÓCIO PODE FALTAR; O BRIEFING NÃO PODE SE PERDER ───────────
  //
  // Até 16/08/2026 esta guarda era `if (!businessName …)`, e string vazia caía
  // nela: **o briefing inteiro voltava 400 e sumia**. E ele sumia calado, porque
  // a tela grava no store local e trata a falha do POST como não-fatal
  // (`app/briefing/page.tsx`, o `catch` do dual-write). Ou seja: a conversa
  // inteira do prospect era perdida por causa de um campo DESCRITIVO.
  //
  // Perder o briefing é o dano caro — é a mesma família do Sushi Cazza, que
  // esperou 51 dias porque a fila era invisível. Não saber o nome do negócio é
  // o dano barato: os leitores desta casa já tratam ausência
  // (`lerNegocio` → `null` → "Negócio não informado" na tela).
  //
  // ⚠️ A validação NÃO foi afrouxada: o campo continua **obrigatório na
  // presença e no tipo**. O que passou a ser aceito é a ausência DECLARADA —
  // `""` —, e ela é aceita justamente porque a casa inteira já sabe lê-la.
  // Aceitar `undefined` deixaria passar quem simplesmente esqueceu o campo.
  const { businessName } = body;
  if (typeof businessName !== "string") {
    return NextResponse.json({ error: "businessName required" }, { status: 400 });
  }

  // ── O GATE DE CONTATO (08/08/2026) ─────────────────────────────────────────
  //
  // Três interessados entraram por esta rota e ficaram 51, 29 e 28 dias sem que
  // ninguém pudesse falar com eles: o briefing coletava a conversa inteira e
  // nunca perguntava para onde ligar. A trava é aqui, no SERVIDOR, e não na
  // tela: esta rota é pública e um POST direto passa por cima de qualquer
  // `disabled` de botão.
  //
  // AS DUAS METADES, e nenhuma é opcional:
  //   • COM canal  → `new`, `runAutoScope` roda, a proposta nasce.
  //   • SEM canal  → `lead_incompleto`. Não vira proposta **e não se perde**:
  //     a conversa inteira grava, o motivo grava junto, e o raio-x cobra.
  //
  // O que NÃO acontece no caso sem contato: nenhuma inferência. O `rawContext`
  // não é vasculhado atrás de um telefone. Arroba de Instagram no meio da
  // conversa é PISTA para o CEO ler, nunca contato (`pistasDeContato`).
  //
  // ── E O CANAL QUE O CLIENTE DESDISSE NÃO ENTRA POR AQUI (8ª volta) ────────
  //
  // Esta é a TERCEIRA memória da conversa, e a última. O cliente escreveu
  // "esquece o WhatsApp, prefiro e-mail"; o número reapareceu em
  // `contato.whatsapp` na solicitação gravada — porque a linha abaixo lê o
  // contato da PORTA, que é anterior à retratação, antes do escopo.
  //
  // A trava é aqui, no SERVIDOR, pelo mesmo motivo que o gate de contato: esta
  // rota é pública e um POST direto passa por cima de qualquer decisão de tela.
  // A tela já obedece à marca; se ela deixar de obedecer, o número continua não
  // entrando. Ver `lib/agency/comercial/retratacao.ts`.
  const escopoDoBriefing = (body.briefingJson as { scope?: Record<string, unknown> } | undefined)?.scope;
  const whatsappRetratado = canalFoiRetratado(escopoDoBriefing, "whatsapp");
  if (whatsappRetratado) {
    console.warn("[client-requests] WhatsApp retratado pelo cliente — não entra no contato da solicitação");
  }
  const contatoDeclarado = montarContato({
    nome:     (body.contato as Record<string, unknown> | undefined)?.nome
              ?? escopoDoBriefing?.prospectName,
    email:    (body.contato as Record<string, unknown> | undefined)?.email
              ?? escopoDoBriefing?.prospectEmail,
    whatsapp: whatsappRetratado
              ? undefined
              : (body.contato as Record<string, unknown> | undefined)?.whatsapp
                ?? escopoDoBriefing?.prospectPhone,
  });

  const briefingJson =
    body.briefingJson != null || contatoDeclarado
      ? { ...(body.briefingJson as object | undefined ?? {}), ...(contatoDeclarado ? { contato: contatoDeclarado } : {}) }
      : undefined;

  const contato = lerContato({ briefingJson, sdrHandoffJson: body.sdrHandoffJson });

  // `rawContext` é texto corrido, e texto corrido SE TRUNCA — aqui a escolha é
  // deliberada e segue a mesma regra do gate de contato logo acima: o que a
  // pessoa já contou não se perde. Recusar o briefing inteiro por causa do fim
  // de um texto jogaria fora um lead legítimo; cortar com marca deixa o começo
  // (que é onde o prospect diz o que quer) intacto e visível para o PM.
  const rawContextBruto = typeof body.rawContext === "string" ? body.rawContext : "";
  const rawContext =
    rawContextBruto.length > TETO_DO_RAW_CONTEXT
      ? `${rawContextBruto.slice(0, TETO_DO_RAW_CONTEXT)}\n\n[…texto cortado no limite de tamanho do servidor]`
      : rawContextBruto;

  // Mesma escolha para os anexos: aqui só entra METADADO (nome, tipo, tamanho —
  // o arquivo em si não passa por esta rota), então cortar o excedente custa
  // pouco e nunca derruba um briefing honesto. A tela já para em 10; passar de
  // 10 significa que não foi a tela que mandou.
  const anexosBrutos = Array.isArray(body.attachmentsJson) ? (body.attachmentsJson as object[]) : [];
  const attachmentsJson = anexosBrutos.slice(0, TETO_DE_ANEXOS);
  if (anexosBrutos.length > TETO_DE_ANEXOS) {
    console.warn(
      `[client-requests] ${anexosBrutos.length} anexos recebidos — cortado em ${TETO_DE_ANEXOS} (limite do servidor)`,
    );
  }

  try {
    // ═══ O CONVITE DO PARCEIRO AMARRA O PEDIDO (29/08/2026) ═══════════════
    //
    // ── O DEFEITO, MEDIDO EM PRODUÇÃO COM O CLIENTE 001 NA TELA ───────────
    // O Marcos entrou pelo link de parceiro, conversou, o briefing subiu — e o
    // pedido nasceu SEM `clientId`. A proposta dele então leu "cliente
    // pagante": preço de R$ 290 à vista e botão "Aceitar e começar", para um
    // parceiro isento autorizado pelo CEO.
    //
    // ⚠️ A TRAVA ABAIXO NÃO FOI AFROUXADA, E ISSO É O PONTO. O que entra aqui é
    // o TOKEN do convite — nunca um `clientId`. Quem diz de quem é o pedido é
    // `resolverConviteDeParceria`, no SERVIDOR, a mesma função que `/api/sdr/chat`
    // usa desde 27/08. Token inventado na barra de endereço resolve `null`, e o
    // pedido nasce órfão exatamente como hoje: o comportamento seguro é o de
    // sempre, e continua sendo o padrão.
    //
    // *A fechadura existia, a porta existia — faltava o convite chegar até aqui.*
    const conviteDoParceiro = await resolverConviteDeParceria(
      typeof body.convite === "string" ? body.convite : undefined,
    ).catch(() => null);

    const record = await createClientRequest({
      status: contato.temComoFalar ? "new" : "lead_incompleto",
      // ⛔ DERIVADO do token pelo servidor, nunca lido do corpo. `undefined`
      // quando não há convite válido — e aí nada muda.
      clientId: conviteDoParceiro?.clientId,
      businessName,
      segment:         typeof body.segment        === "string"   ? body.segment          : undefined,
      services:        Array.isArray(body.services)              ? body.services as string[] : [],
      objectives:      Array.isArray(body.objectives)            ? body.objectives as string[] : [],
      rawContext,
      source:          typeof body.source         === "string"   ? body.source            : "briefing",
      // `workspaceId`/`clientId` do CORPO não entram mais: esta rota é pública
      // (é o submit do formulário /briefing) e aceitá-los deixava qualquer
      // pessoa plantar uma solicitação dentro da caixa de entrada de uma
      // agência escolhida a dedo — e disparar o auto-scope, que gasta a chave
      // de IA DELA. Quem resolve o dono é o servidor
      // (`resolverWorkspacePublico`); a adoção explícita é o PATCH, que tem
      // sessão. Ver a regra da casa: no caminho público, o dono é DERIVADO,
      // nunca informado.
      briefingJson,
      sdrHandoffJson:  body.sdrHandoffJson  != null              ? body.sdrHandoffJson as object : undefined,
      attachmentsJson,
    });

    // ── A CONVERSA VIROU PEDIDO: O RASTRO DEIXA DE SER UMA PARADA ──────────
    //
    // Cada turno do SDR guarda um rastro do escopo acumulado
    // (`conversa-sem-pedido.ts`, 27/08/2026), para que uma conversa abandonada
    // no meio não suma em silêncio. Este é o outro lado: quando o briefing
    // sobe de verdade, aquele rastro precisa sair da lista de paradas.
    //
    // Sem isto a lista mentiria PARA CIMA — toda conversa bem-sucedida
    // apareceria para sempre como abandonada, e um alarme que acusa o que está
    // certo é o alarme cego que esta casa já pagou uma vez no `cron-execute`.
    //
    // Depois do `create` e fora do caminho de erro: resolver ANTES de gravar
    // apagaria o rastro de uma conversa cujo pedido ainda pode falhar — e aí a
    // perda seria total e silenciosa, exatamente o que este conserto existe
    // para impedir. Nunca lança.
    await resolverRastroDaConversa(body.sessionId);

    if (contato.temComoFalar) {
      // Automatically generate the full scope as soon as the briefing lands —
      // no PM click needed. Fire-and-forget: the 201 returns immediately while
      // the synchronous engine chain runs in the background.
      runAutoScope(record.id).catch((e) => {
        console.error("[client-requests] background auto-scope failed for", record.id, e);
      });

      // Confirmation e-mail to the prospect — fire-and-forget, never blocks the 201.
      sendBriefingConfirmation(body, briefingJson);
    } else {
      // Sem canal não há proposta: `runAutoScope` custa chamadas de IA e produz
      // um documento para ninguém. O lead está gravado inteiro e o raio-x cobra.
      console.warn("[client-requests] lead sem contato — sem proposta:", record.id, contato.motivo);
    }

    return NextResponse.json(
      { ...record, contato: { temComoFalar: contato.temComoFalar, motivo: contato.motivo } },
      { status: 201 },
    );
  } catch (e) {
    console.error("[brain/client-requests] POST error", e);
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const { session, error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (!(await solicitacaoDoWorkspace(id, session.workspaceId))) return naoEncontrado();

    // `workspaceId` e `clientId` do corpo eram gravados direto
    // (`client-request-service:149`): dava para TRANSFERIR a solicitação de
    // outra agência para a sua com um PATCH — e, no sentido inverso, empurrar
    // a sua para fora. Adotar a órfã continua permitido (é o caminho legítimo
    // do briefing público), mas só para o SEU workspace, e o cliente apontado
    // tem que ser seu.
    if (typeof body.workspaceId === "string" && body.workspaceId !== session.workspaceId) {
      return NextResponse.json(
        { error: "workspaceId não pode ser trocado por outro" },
        { status: 403 },
      );
    }
    if (typeof body.clientId === "string" && !(await clienteDoWorkspace(body.clientId, session.workspaceId))) {
      return naoEncontrado();
    }

    const record = await updateClientRequest(id, body as never);
    return NextResponse.json(record);
  } catch (e) {
    console.error("[brain/client-requests] PATCH error", e);
    return NextResponse.json({ error: "Not found or DB unavailable" }, { status: 404 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const { session, error } = await requireSession(["master", "project_manager"]);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    // O apagão em cascata (BrainArtifact, ApprovalRequest → ApprovalComment)
    // é o motivo de esta conferência não ser negociável: sem ela, um id
    // digitado destruía o histórico de aprovação de outra agência inteira.
    if (!(await solicitacaoDoWorkspace(id, session.workspaceId))) return naoEncontrado();
    await deleteClientRequest(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[brain/client-requests] DELETE error", e);
    return NextResponse.json({ error: "Not found or DB unavailable" }, { status: 404 });
  }
}
