// GET /api/piloto/diagnostico — o tamanho da sujeira em produção, sem terminal.
//
// ─── POR QUE ESTA ROTA EXISTE ────────────────────────────────────────────────
//
// Em 16/08/2026 duas ferramentas de saneamento foram entregues medidas e
// armadas (`scripts/nome-do-negocio.mts` e `scripts/volume-subestimado.mts`), e
// as duas subiram ao CEO com o mesmo bloqueio escrito: **não há credencial de
// produção neste ambiente**. Três vezes no mesmo dia a medição parou em
// `npx @railway/cli whoami → "Unauthorized"`, e `railway login` é interativo.
//
// Pedir a credencial pela quarta vez seria aceitar o gargalo. O contorno já
// existia nesta casa e é o padrão de `/api/piloto/diario`: uma rota protegida
// por segredo, que **roda DENTRO do container** — onde o `DATABASE_URL` de
// produção é local — e que o CEO ou o Diretor consultam com um `curl`.
//
// Com isso a decisão que sobe ao CEO deixa de ser "você me dá credencial?" (que
// não deveria ser problema dele) e passa a ser "o tamanho é este, corrijo?" —
// que é a decisão dele.
//
// ─── SOMENTE LEITURA. NENHUM CAMINHO DE ESCRITA. NENHUM. ────────────────────
//
// Só `GET`, e o único verbo Prisma que este arquivo conhece é `findMany`. Não é
// zelo: **uma rota que corrige é uma rota que alguém dispara sem querer** — e o
// que estas ferramentas corrigem é nome de cliente e volume contratado, ou seja,
// preço. A correção continua sendo script com duas confirmações independentes, e
// o gatilho continua sendo do CEO.
//
// ─── E NÃO DEVOLVE MAIS DO QUE A PERGUNTA EXIGE ─────────────────────────────
//
// Contagens e ids. **Nenhum briefing inteiro, nenhum nome de prospect, nenhum
// telefone, nenhuma frase da conversa.** A frase original é a prova que a
// ferramenta usa para decidir, e por isso ela existe no relatório do SCRIPT —
// que roda no terminal de quem já tem acesso ao banco. Numa resposta HTTP de
// diagnóstico ela seria PII trafegando sem necessidade: o id basta para o CEO
// dimensionar e decidir.
//
// ─── SEÇÃO `parcerias` (29/08/2026) — O RETRATO DOS CONVITES ────────────────
//
// Responde, sem terminal e sem o parceiro voltar para reclamar: em que estado
// está CADA `ConviteDeParceria`, e existe algum CLIENTE DUPLICADO (mesmo nome,
// dois cadastros) onde a parceria vive só em um deles? É a pergunta por trás
// do caso investigado em `docs/diagnosticos/fusao-de-cliente-duplicado.md` — a
// FOOCCI nasceu duas vezes em 27/08, e se o link do parceiro aponta para o
// cadastro sem a parceria viva, ele é tratado como pagante.
//
// A decisão de cada linha vem de `decidirConvite`
// (`lib/agency/comercial/regra-do-convite.ts`) — a MESMA função que
// `examinarConviteDeParceria` usa para resolver o link em produção
// (`app/api/sdr/chat/route.ts:766` → `resolverConviteDeParceria` →
// `examinarConviteDeParceria`). Uma segunda versão desta decisão divergiria
// cedo ou tarde, e o diagnóstico passaria a mentir sobre o que a casa faz.
//
// Como sempre nesta rota: só leitura (`findMany`), respeita `LIMITE`, e
// **nunca** o token inteiro — só os 8 primeiros caracteres (`retrato-dos-convites.ts`).
//
// ─── SEÇÃO `preco_cheio_apos_negociacao` (30/08/2026) — DINHEIRO DE CLIENTE ─
//
// Ordem do Diretor Geral (`.despachos/F1-auditoria-preco-cheio.md`): quem foi
// cobrado o preço cheio depois de pedir ajuste? `minPrice === maxPrice`, em
// vigor desde 25/08 (`live-calculator.ts:51`), tornou a trava de
// `negotiateProposal` (`lib/agency/execution/negotiate-proposal.ts:39`) uma
// condição impossível de satisfazer — `newTotal` é sempre `null`, e a
// proposta reaberta sai sempre no valor de tabela.
//
// A regra de "o que é uma negociação" e o cruzamento com pagamento moram em
// `lib/agency/comercial/preco-cheio-apos-negociacao.ts` (módulo puro). Esta
// rota só lê `ApprovalRequest` (department "proposal") e `PagamentoConfirmado`
// e chama o módulo — nenhuma decisão de negócio aqui.
//
// ⚠️ CORRIGIDO em 07/09/2026 (`seguranca`, `.despachos/F4-auditoria-sem-nome.md`):
// a ficha original desta seção dizia que "nome do negócio e id são
// devolvidos aqui de propósito... o próprio despacho autoriza os dois". Essa
// autorização estava errada e foi revertida — a guarda de PII desta rota é
// mais velha e vence: o segredo trafega em `?chave=`, que aparece em log de
// proxy/CDN, e uma trava não se afrouxa porque quem pediu tinha pressa.
// Só sai `client_request_id`. Quem tem a lista de ids abre o painel, com
// sessão, e vê o nome — como deve ser. Nada de nome, telefone, e-mail ou
// frase de conversa.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { segredoConfere } from "@/lib/security/crypto";
import { retratoDoLote as retratoDoVolume, type PedidoGravado } from "@/lib/agency/comercial/volume-subestimado";
import { retratoDoLote as retratoDoNegocio, type LinhaDeNegocio } from "@/lib/agency/comercial/diagnostico-do-negocio";
import {
  montarRetratoDosConvites,
  type LinhaDeConviteBruta,
  type LinhaDeParceriaBruta,
  type LinhaDeClienteBruta,
} from "@/lib/agency/comercial/retrato-dos-convites";
import {
  retratoDoLote as retratoDoPrecoCheio,
  type LinhaDeAprovacaoBruta,
  type LinhaDePagamentoBruta,
} from "@/lib/agency/comercial/preco-cheio-apos-negociacao";

export const dynamic = "force-dynamic";

/** Teto de linhas lidas. Diagnóstico é para dimensionar, não para exportar. */
const LIMITE = 500;

// ⚠️ ACHADO DO `seguranca` NA REVISÃO DESTA ROTA (16/08/2026) — configuração,
// não código:
//
// O fallback `PILOTO_SECRET || CRON_SECRET` é o padrão herdado do diário. Se
// `PILOTO_SECRET` NÃO estiver configurado em produção — cenário plausível, é
// variável nova —, o segredo que trafega em `?chave=` (e que aparece em log de
// proxy/CDN) passa a ser o **mesmo `CRON_SECRET` que autoriza ESCRITA** em
// `cron/v2`. Antes só o diário carregava esse risco; com esta rota, são duas
// espalhando um segredo de escrita em log de leitura.
//
// **Configurar `PILOTO_SECRET` como variável própria fecha o agravante sem
// mudar uma linha.** O `seguranca` não recomendou trocar `?chave=` por
// só-header: quebraria o uso por `curl`/link, que é a razão desta rota existir,
// e o risco real está no fallback, não no mecanismo.
function autorizado(request: NextRequest): boolean {
  const esperado = process.env.PILOTO_SECRET || process.env.CRON_SECRET;
  // Segredo ausente NUNCA vira rota aberta. O `if (secret)` que só protege
  // quando a variável existe é a família de defeito que o `seguranca` já mediu
  // nesta casa: em produção sem a variável, a porta fica escancarada e ninguém
  // percebe, porque tudo continua funcionando.
  if (!esperado) return false;
  const header = request.headers.get("authorization") ?? "";
  const doHeader = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null;
  const daQuery = request.nextUrl.searchParams.get("chave");
  // `segredoConfere` é comparação de tempo constante — a mesma do diário. Não se
  // inventa proteção nova quando a casa já tem uma provada.
  return segredoConfere(doHeader ?? daQuery, esperado);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const esperado = process.env.PILOTO_SECRET || process.env.CRON_SECRET;
  if (!esperado) {
    return NextResponse.json(
      { error: "PILOTO_SECRET não configurado — o diagnóstico fica fechado" },
      { status: 503 },
    );
  }
  if (!autorizado(request)) {
    return NextResponse.json({ error: "chave inválida" }, { status: 401 });
  }

  try {
    const linhas = await prisma.clientRequestDb.findMany({
      select: { id: true, businessName: true, briefingJson: true },
      orderBy: { createdAt: "asc" },
      take: LIMITE,
    });

    // As duas regras já existem, já são puras e já são testadas fora do banco.
    // A rota só chama: uma terceira versão de "o que é sujeira" seria o defeito
    // que esta casa passou o dia inteiro fechando.
    const volume = retratoDoVolume(linhas as unknown as PedidoGravado[]);
    const negocio = retratoDoNegocio(linhas as unknown as LinhaDeNegocio[]);

    // ── SOMENTE LEITURA. `findMany`, e nada mais — igual ao resto da rota. ──
    const agora = new Date();
    const [convitesBrutos, parceriasBrutas, clientesBrutos] = await Promise.all([
      prisma.conviteDeParceria.findMany({
        select: { token: true, clientId: true, expiraEm: true, revogadoEm: true, usos: true, ultimoUsoEm: true },
        orderBy: { createdAt: "asc" },
        take: LIMITE,
      }),
      prisma.parceriaDoCliente.findMany({
        select: { clientId: true, revogadaEm: true, validaAte: true },
        orderBy: { createdAt: "asc" },
        take: LIMITE,
      }),
      prisma.client.findMany({
        select: { id: true, name: true },
        orderBy: { createdAt: "asc" },
        take: LIMITE,
      }),
    ]);

    const parcerias = montarRetratoDosConvites(
      convitesBrutos as LinhaDeConviteBruta[],
      parceriasBrutas as LinhaDeParceriaBruta[],
      clientesBrutos as LinhaDeClienteBruta[],
      agora,
    );

    // ── SEÇÃO `preco_cheio_apos_negociacao` (30/08/2026) — AUDITORIA DE
    // DINHEIRO DE CLIENTE, ordem do Diretor Geral. `minPrice === maxPrice`
    // (25/08) tornou a trava de `negotiateProposal` uma condição impossível:
    // todo pedido de ajuste, desde então, reabre a proposta no preço cheio.
    // Só leitura — `findMany`, igual ao resto da rota. A regra do que É uma
    // negociação (não um retrato inventado aqui) mora em
    // `lib/agency/comercial/preco-cheio-apos-negociacao.ts`.
    const [aprovacoesDeProposta, pagamentosConfirmados] = await Promise.all([
      prisma.approvalRequest.findMany({
        where: { department: "proposal" },
        select: { clientRequestId: true, department: true, reviewNote: true, createdAt: true },
        orderBy: { createdAt: "asc" },
        take: LIMITE,
      }),
      prisma.pagamentoConfirmado.findMany({
        select: { clientRequestId: true, confirmadoEm: true, valorCentavos: true },
        orderBy: { confirmadoEm: "asc" },
        take: LIMITE,
      }),
    ]);

    const precoCheioAposNegociacao = retratoDoPrecoCheio(
      aprovacoesDeProposta as LinhaDeAprovacaoBruta[],
      pagamentosConfirmados as LinhaDePagamentoBruta[],
    );

    return NextResponse.json({
      medido: true,
      lidos: linhas.length,
      volume: {
        confere: volume.conferem,
        subestimado: volume.subestimados,
        // ⚠️ "não recuperável" NÃO é "está certo": é a ausência da conversa
        // gravada. Somar isto com `confere` esconderia o buraco.
        nao_recuperavel: volume.naoRecuperaveis,
        ids_subestimados: volume.mudancas.map((m) => m.id),
      },
      nome_do_negocio: {
        intactos: negocio.naoTocar,
        recuperavel_do_briefing: negocio.recuperar,
        vira_ausencia_declarada: negocio.declarar,
        ids_a_corrigir: negocio.mudancas.map((m) => m.id),
      },
      // O retrato de CADA convite (motivo AGORA, cliente para onde aponta,
      // prefixo do token — nunca o token inteiro) e a denúncia de cliente
      // duplicado: grupos de nome colidente, com quem do grupo tem parceria
      // viva. É a pergunta "o link do parceiro aponta para o cadastro certo?"
      // respondida sem terminal.
      parcerias: {
        total_convites: parcerias.convites.length,
        por_motivo: parcerias.porMotivo,
        convites: parcerias.convites,
        clientes_de_nome_colidente: parcerias.gruposDeNomeColidente,
      },
      // AUDITORIA DE 30/08/2026 (F1-auditoria-preco-cheio.md, ordem do
      // Diretor Geral): quem pediu ajuste de preço, desde que a tabela de
      // preço fechado (25/08) tornou a condição de `negotiateProposal`
      // impossível de satisfazer, e recebeu o preço cheio de volta.
      //
      // ⚠️ CORRIGIDO em 07/09/2026 (`seguranca`): só `client_request_id` sai
      // — nunca nome do negócio, telefone, e-mail ou frase de conversa. Ver o
      // comentário de correção no topo do arquivo.
      //
      // ⚠️ Isto é o INSTRUMENTO que lê a lista, rodando neste ambiente sem
      // credencial de produção. A LISTA REAL só existe quando esta rota
      // responde a partir do banco de produção — ver o cabeçalho do arquivo.
      preco_cheio_apos_negociacao: {
        total: precoCheioAposNegociacao.total,
        pagos: precoCheioAposNegociacao.pagos,
        nao_pagos: precoCheioAposNegociacao.naoPagos,
        casos: precoCheioAposNegociacao.linhas.map((l) => ({
          client_request_id: l.clientRequestId,
          valor_na_proposta_centavos: l.valorNaPropostaCentavos,
          negociado_em: l.negociadoEm,
          pago: l.pago,
          pago_em: l.pagoEm,
          valor_pago_centavos: l.valorPagoCentavos,
        })),
      },
      // O que fazer com o número — para quem lê o JSON não ter de perguntar.
      correcao: "npx tsx scripts/volume-subestimado.mts | scripts/nome-do-negocio.mts (simulam por padrão; escrever exige duas confirmações e é decisão do CEO)",
    });
  } catch (e) {
    console.error("[piloto/diagnostico] erro", e);
    // Falha de leitura NÃO vira zero. "Não há sujeira" e "não consegui olhar"
    // são fatos opostos, e o segundo com cara do primeiro é como esta casa
    // deixou uma fila invisível por sete semanas.
    return NextResponse.json(
      { medido: false, motivo: "o banco não respondeu — estes números NÃO são zero, são desconhecidos" },
      { status: 503 },
    );
  }
}
