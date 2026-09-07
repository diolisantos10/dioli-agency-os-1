/**
 * ⭐⭐ POST /api/connect/retorno — por onde a resposta do gerente volta (passo 8).
 *
 * ─── QUEM INICIA, E POR QUE NÃO SOMOS NÓS ───────────────────────────────────
 *
 * **O núcleo empurra.** Este produto não fica perguntando "já decidiram?" — não
 * teria como: o turno do cliente acabou, o processo que atendeu a mensagem
 * morreu, e um agente em laço de polling é conta de nuvem crescendo por
 * pergunta que ninguém respondeu ainda.
 *
 * ─── A CASCA É FINA DE PROPÓSITO ────────────────────────────────────────────
 *
 * Confere o segredo, chama `receberRetorno` (comum) e devolve o estado. O passo
 * 8 inteiro — forma, casamento com a conversa, barreira, fala, registro — é
 * código puro em `conector/retorno.ts`, e por isso é provável sem levantar
 * servidor. Toda lógica que aparecer aqui é lógica que os outros três produtos
 * não têm.
 *
 * ─── ⚠️ A ARMADILHA DO NEXT, CONFERIDA E NÃO SUPOSTA ────────────────────────
 *
 * O contrato avisa: produto Next com middleware que derruba rota fora de
 * `PUBLIC_PATHS` precisa da linha com o caminho exato, senão o handler **nunca
 * roda** e o 401 genérico do middleware se disfarça de recusa da porta.
 *
 * Nesta casa o middleware é `proxy.ts` (Next 16 renomeou `middleware.ts`), e a
 * lista dele já traz `"/api/"` — que cobre `/api/connect/retorno` por prefixo.
 * **Nenhuma linha nova foi necessária**, e isso não é suposição: há teste
 * (`__tests__/connect/a-porta-do-retorno.test.ts`) que chama `proxy` com esta
 * URL e exige que ela passe. Se alguém restringir `PUBLIC_PATHS` um dia, o
 * teste fica vermelho antes de o cliente ficar sem resposta.
 *
 * ─── ⚠️ O CABEÇALHO, E POR QUE NÃO É O `Bearer` DA CASA ─────────────────────
 *
 * As rotas de robô desta casa usam `Authorization: Bearer <CRON_SECRET>`. Esta
 * NÃO usa, e a diferença é deliberada: o chamador aqui não é o relógio da casa,
 * é **o núcleo do Dioli Connect**, que fala com os quatro produtos com uma
 * implementação só. Exigir um cabeçalho próprio daqui obrigaria o núcleo a
 * tratar a Dioli Digital como caso especial — que é exatamente como um contrato
 * vira quatro. O segredo continua sendo próprio desta porta
 * (`DIOLI_CONNECT_SECRET`, nunca `ADMIN_SECRET`, nunca `CRON_SECRET`).
 */

import { NextRequest, NextResponse } from "next/server";
import { CABECALHO_DO_SEGREDO, conferirSegredo } from "@/lib/agency/connect/porta";
import { receberRetorno } from "@/lib/agency/connect/conector/retorno";
import { ligacaoDaDioliDigital } from "@/lib/agency/connect/conector/dioli-digital/ligacaoLocal";

export const runtime = "nodejs";
/** Nada aqui pode ser servido de cache: é escrita na conversa de um cliente. */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── A guarda. Fail-closed: sem segredo configurado, a porta está DESLIGADA. ─
  const guarda = conferirSegredo(request.headers.get(CABECALHO_DO_SEGREDO));
  if (!guarda.ok) {
    // ⛔ O motivo nunca cita o segredo — nem o recebido, nem o esperado.
    return NextResponse.json({ estado: "recusado", protocolo: null, motivo: guarda.motivo }, {
      status: guarda.status,
    });
  }

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json(
      { estado: "recusado", protocolo: null, motivo: "o corpo do retorno não é JSON" },
      { status: 400 },
    );
  }

  const resposta = await receberRetorno(corpo, ligacaoDaDioliDigital());

  // ⚠️ `duplicado` é 200, e não erro: o núcleo reentrega o que ele não teve
  // certeza de ter entregue (decisão D2), e responder 4xx a uma reentrega
  // faria o núcleo tentar de novo para sempre por causa de um sucesso.
  const status = resposta.estado === "recusado" ? 422 : 200;
  return NextResponse.json(resposta, { status });
}
