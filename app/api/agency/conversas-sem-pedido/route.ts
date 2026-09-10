// GET /api/agency/conversas-sem-pedido — AS CONVERSAS QUE PARARAM ANTES DE
// VIRAR PEDIDO, com dono e próxima ação.
//
// ─── POR QUE ESTA ROTA EXISTE NO MESMO COMMIT DO CONSERTO ───────────────────
//
// `lib/agency/comercial/conversa-sem-pedido.ts` passa a GUARDAR o escopo de
// toda conversa do SDR. Guardar sem porta de leitura seria a **sétima** trava
// sem fechadura desta casa — e a lição já custou caro: em 27/08/2026 mediu-se
// que a porta da isenção de parceria estava escrita, testada, provada por
// mutação e **404 na internet**, porque 14 commits nunca saíram de um disco.
// Antes disso, três outras: a isenção sem criador, o canal de e-mail que o tipo
// prometia e ninguém implementava, e os consertos de escopo que nenhuma tela
// chamava.
//
// **A pergunta obrigatória é "quem CHAMA isto?", e ela se responde ANTES de dar
// o conserto por fechado.** Um rastro que nenhuma tela e nenhuma rota alcançam
// é exatamente o defeito que este conserto existe para matar: dado gravado onde
// ninguém olha. É por isso que o módulo e a porta nascem juntos.
//
// ─── O QUE ELA NÃO FAZ ──────────────────────────────────────────────────────
//
//   • **Não cria pedido.** Ela LÊ. Transformar uma conversa parada em briefing
//     é fabricar o que o cliente não enviou — e o cliente 001 é a prova de que
//     essa tentação existe. Quem retoma é gente, pelo canal declarado.
//   • **Não devolve a conversa inteira.** O texto dos turnos já vive em
//     `PortalMessage`, no fio, e tem leitor próprio. Aqui vai o ESCOPO — o que
//     a pessoa contou sobre o negócio dela — porque é isso que se perdia.
//   • **Não promete retomada.** `proximaAcaoDoRastro` deriva a ação do que o
//     rastro TEM: sem canal declarado, ela diz que não há como retomar. Frase
//     constante mentiria para metade da lista.

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/api-guard";
import { conversasSemPedido, proximaAcaoDoRastro } from "@/lib/agency/comercial/conversa-sem-pedido";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { session, error } = await requireSession();
  if (error) return error;

  const bruto = Number(new URL(request.url).searchParams.get("limite"));
  const limite = Number.isFinite(bruto) && bruto > 0 ? Math.min(Math.floor(bruto), 200) : 50;

  try {
    const rastros = await conversasSemPedido(session.workspaceId, limite);
    return NextResponse.json({
      total: rastros.length,
      conversas: rastros.map((r) => ({
        fio: r.fio,
        turnos: r.turnos,
        paradaEm: r.paradaEm.toISOString(),
        contato: r.contato,
        escopo: r.escopo,
        // De quem a conversa é, quando a casa sabe. `clienteDoConvite` é o
        // cliente DERIVADO do token; `atribuicao` é o ato DECLARADO por um
        // operador (`POST .../atribuir`). Ambos aparecem aqui porque quem vai
        // atribuir precisa ver o que já está atribuído — atribuir às cegas é
        // como nasce a reatribuição por engano.
        clienteDoConvite: r.clienteDoConvite,
        atribuicao: r.atribuicao,
        // O dono é sempre o mesmo e é dito em voz alta: conversa parada na sala
        // é trabalho de quem atende, não da esteira. A esteira não retoma
        // conversa — ela não tem como, e fingir que tem é a promessa falsa que
        // esta casa mais pagou.
        dono: "Atendimento",
        proximaAcao: proximaAcaoDoRastro(r),
        // ═══ O CARIMBO DA PROMESSA (29/08/2026) ═══════════════════════════
        //
        // `prometidoEm`: quando uma fala do SDR prometeu contato humano pela
        // primeira vez ("nossa equipe entra em contato" e variantes — ver
        // `lib/agency/esteira/promessa-de-contato.ts`). `null` = nunca
        // prometeu. É FATO OBSERVÁVEL — a tela pode dizer "prometido há N
        // dias" com segurança.
        //
        // ⛔ `venceEm` é sempre `null` — e é PROPOSITAL, não uma lacuna de
        // implementação a esconder.
        //
        // ⚠️ CORRIJA-SE UMA AFIRMAÇÃO FÁCIL DE FAZER E ERRADA: não é verdade
        // que "ninguém nesta casa falou de prazo". O número existe, em dois
        // lugares, e NENHUM DELES É UMA DECISÃO REGISTRADA:
        //
        //   • `components/agency/briefing/PublicBriefingRoom.tsx:835` diz, a
        //     pessoas reais, na tela pública: *"nossa equipe revisa o escopo,
        //     prepara uma proposta formal e entra em contato **em até 24h
        //     úteis**"*. É texto cravado em JSX, nunca ratificado.
        //   • `lib/agency/v2-recovery/detector-de-parados.ts:16`
        //     (`SLA_POR_ESTADO_HORAS.intake = 24`), cujo próprio comentário se
        //     declara "régua inicial — ajustável por decisão".
        //
        // Duas fontes, o mesmo número, zero decisão em `docs/decisoes.md`. Um
        // número que a casa DIZ ao cliente mas nunca ratificou não é prazo:
        // é dívida de decisão. Carimbar `venceEm` a partir dele seria o
        // código escolhendo por quem tem de escolher — e "24h ÚTEIS" ainda
        // exige calendário de expediente e feriado que esta casa não tem.
        //
        // Por isso a fila mostra FATO ("prometido há N"), nunca ATRASO. Quem
        // ratifica o SLA é o CEO; `motivoDoPrazo` é a lacuna subindo com o
        // endereço da evidência, para a decisão não voltar a se perder.
        prometidoEm: r.prometidoEm ? r.prometidoEm.toISOString() : null,
        venceEm: null as string | null,
        motivoDoPrazo: "sla_nao_ratificado:PublicBriefingRoom.tsx:835 promete 24h uteis ao cliente e nao ha decisao registrada",
        // ═══ O CARIMBO DO ATO (29/08/2026) ═════════════════════════════════
        //
        // `contatadoEm`: quando um humano da casa marcou esta conversa como
        // contatada (`POST .../contatado`, `marcarConversaComoContatada`).
        // `null` = ninguém marcou ainda. É o que tira o lead da dívida que
        // `prometidoEm` declara — sem apagar o rastro, e sem prometer nada
        // sobre o que a pessoa vai responder.
        contatadoEm: r.contatadoEm ? r.contatadoEm.toISOString() : null,
        contatadoPor: r.contatadoPor,
      })),
    });
  } catch (e) {
    console.error("[conversas-sem-pedido] leitura falhou", e);
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
}
