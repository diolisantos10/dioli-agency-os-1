/**
 * ⭐⭐ O NÚCLEO DE MENTIRA — e por que ele agora RECUSA.
 *
 * ─── O DEFEITO DE CLASSE, MEDIDO EM 30/08/2026 ──────────────────────────────
 *
 * O Foocci foi medido contra o núcleo REAL e reprovou em dois campos. A suíte
 * dele estava verde. A suíte da Dioli Digital também estava — e a Dioli Digital
 * mandava `desconto`, `preco`, `prazo`, `escopo`, `cancelamento` e `contrato`,
 * **zero interseção** com o vocabulário fechado do núcleo.
 *
 * ⚠️ Nenhuma das duas suítes pegou nada, e o motivo é este arquivo: o núcleo de
 * mentira aceitava QUALQUER `assunto` e QUALQUER remetente. Ele respondia 200
 * para o certo e para o errado.
 *
 * **Interlocutor complacente não mede nada.** O verde que ele produzia era
 * sobre a educação dele, não sobre o nosso contrato — e um duplo mais fácil que
 * o real transforma a suíte inteira numa cerimônia.
 *
 * ─── O QUE ESTE DUPLO PASSA A FAZER ────────────────────────────────────────
 *
 *   1. **Vocabulário fechado.** `assuntos[].assunto` fora da lista do núcleo →
 *      recusa com `{"codigo":"assunto_fora_do_vocabulario"}`.
 *   2. **Remetente resolvido.** `produto`/`agente` que não existem no diretório
 *      → recusa com `{"codigo":"remetente_desconhecido"}`.
 *
 * ⚠️ HONESTIDADE SOBRE O QUE FOI MEDIDO E O QUE NÃO FOI. Os dois `codigo` são
 * literais do núcleo real, ditados pelo operador que o mediu. O **status HTTP**
 * de cada recusa NÃO foi medido daqui (o núcleo exige credencial de produção,
 * que esta sessão não possui): 400 é a escolha deste duplo, não um fato
 * observado. Isso é suficiente para o que importa — o conector trata qualquer
 * não-2xx como "não abriu" —, mas quem um dia medir o status deve corrigir
 * AQUI, e não afrouxar o teste que depender dele.
 */

import { vi } from "vitest";
import { CABECALHO_DO_SEGREDO } from "@/lib/agency/connect/porta";
import { ASSUNTOS_DO_NUCLEO } from "@/lib/agency/connect/vocabulario-do-nucleo";

export interface ChamadaAoNucleo {
  url: string;
  corpo: Record<string, unknown>;
  segredo: string | null;
}

/**
 * O diretório corporativo, recortado por produto — como o núcleo o resolve.
 *
 * ⛔ ATENÇÃO, E ISTO NÃO É DETALHE: a linha do Foocci (`diretor`) é FATO —
 * medida contra o núcleo real pelo operador, que registrou que `diretor-foocci`
 * era recusado e `diretor` passava. A linha da **Dioli Digital NÃO é fato**: é
 * o que o produto manda hoje (`AGENTE` de `conector/dioli-digital/
 * ligacaoLocal.ts`), e ninguém verificou se o núcleo a conhece — esta sessão
 * não tem a credencial de produção para perguntar.
 *
 * ✅ A linha da Dioli Digital TAMBÉM É FATO desde 30/08/2026: o par
 * `de: "conversational-sdr"` / `para: "manager-atendimento"` voltou **201**,
 * resolvendo para `dioli.dioli-digital.client-service-sdr.conversational-sdr` e
 * `…client-service-sdr.manager-atendimento`.
 *
 * ⚠️ E A CORREÇÃO QUE A MEDIÇÃO TROUXE, que vale ficar escrita: até aqui este
 * duplo conferia o campo `agente` contra o diretório. Estava medindo o CAMPO
 * ERRADO. `agente` é o nome do processo do produto (`pm-responde`, o laço do
 * relógio); as chaves do diretório viajam em `de` e `para`. Um duplo que confere
 * o campo errado dá verde sobre a pergunta errada — é primo do duplo
 * complacente, e custa o mesmo tempo até alguém descobrir.
 */
export const DIRETORIO_DO_NUCLEO: Readonly<Record<string, readonly string[]>> = {
  // ✅ Medido em 30/08/2026 — a sala `client-service-sdr` inteira.
  "dioli-digital": [
    "conversational-sdr",
    "manager-atendimento",
    "prospecting",
    "qualification",
    "initial-diagnosis",
    "opportunity-crm",
  ],
  // ✅ Verificado pelo operador (`diretor-foocci` era recusado, `diretor` passa).
  foocci: ["diretor"],
};

function resposta(corpo: unknown, ok: boolean, status: number): Response {
  return { ok, status, json: async () => corpo } as unknown as Response;
}

export interface OpcoesDoNucleo {
  /** O que a consulta de política devolve, quando ela passa nas travas. */
  politica: unknown;
  fio?: string | null;
  /** Deixe `false` para voltar ao duplo complacente — só para PROVAR que ele
   *  não pega nada. Nenhum teste de comportamento deve usar isto. */
  estrito?: boolean;
}

/**
 * O núcleo de mentira. Guarda as chamadas em `chamadas` e aplica as travas.
 */
export function nucleoDeMentira(chamadas: ChamadaAoNucleo[], opcoes: OpcoesDoNucleo) {
  const { politica, fio = "fio-1", estrito = true } = opcoes;

  return vi.fn(async (url: string, init: RequestInit) => {
    const corpo = JSON.parse(String(init.body)) as Record<string, unknown>;
    chamadas.push({
      url,
      corpo,
      segredo: (init.headers as Record<string, string>)[CABECALHO_DO_SEGREDO] ?? null,
    });

    const ehDespacho = url.endsWith("/api/connect/despacho");

    if (estrito) {
      // ── Trava 2: `de` e `para` existem no diretório, recortados pelo produto?
      //
      // ⭐ São ESTES os campos que o núcleo resolve — não `agente`. No despacho
      // as duas pontas são exigidas: quem pergunta e quem tem alçada.
      const produto = String(corpo.produto ?? "");
      const conhecidos = DIRETORIO_DO_NUCLEO[produto];
      if (ehDespacho) {
        const de = String(corpo.de ?? "");
        const para = String(corpo.para ?? "");
        if (!conhecidos || !conhecidos.includes(de) || !conhecidos.includes(para)) {
          return resposta({ codigo: "remetente_desconhecido" }, false, 400);
        }
      } else if (!conhecidos) {
        // Na consulta de política o núcleo ainda recorta pelo PRODUTO do portão.
        return resposta({ codigo: "remetente_desconhecido" }, false, 400);
      }

      // ── Trava 3: o DESPACHO declara `foraDaAlcada`? ───────────────────────
      //
      // ⭐ Medido contra o núcleo real em 30/08/2026: no despacho o campo é
      // `foraDaAlcada`, e mandar `assuntos` faz o núcleo recusar com
      // `sem_assuntos_fora_da_alcada`. Na CONSULTA DE POLÍTICA o campo segue
      // sendo `assuntos` — e isso TAMBÉM foi medido em 30/08/2026: aquele
      // endpoint respondeu `{"contrato":"1.0.0","encontrada":false,...}` com
      // `assuntos`. São dois contratos diferentes DE PROPÓSITO, e é por isso que
      // `conector/politicas.ts` (comum) está certo e não se toca.
      if (ehDespacho && !Array.isArray(corpo.foraDaAlcada)) {
        return resposta(
          {
            estado: "recusado",
            codigo: "sem_assuntos_fora_da_alcada",
            motivo: "o despacho nao declarou 'foraDaAlcada' (lista de {assunto, motivo})",
          },
          false,
          400,
        );
      }

      // ── Trava 1: todo assunto está no vocabulário fechado? ────────────────
      const lista = ehDespacho ? corpo.foraDaAlcada : corpo.assuntos;
      const assuntos = Array.isArray(lista) ? lista : [];
      for (const a of assuntos as Array<{ assunto?: unknown }>) {
        const nome = String(a?.assunto ?? "");
        if (!(ASSUNTOS_DO_NUCLEO as readonly string[]).includes(nome)) {
          return resposta({ codigo: "assunto_fora_do_vocabulario" }, false, 400);
        }
      }
    }

    if (url.endsWith("/api/connect/politicas/consulta")) return resposta(politica, true, 200);
    if (ehDespacho) {
      // ⭐ `fioId` — o nome que o núcleo real devolve. O duplo devolvia `fio`,
      // que é exatamente o nome que o produto lia por engano: duplo e produto
      // erravam juntos, e o teste passava. Agora o duplo fala como o real.
      return resposta({ aberta: true, fioId: fio }, true, 200);
    }
    throw new Error(`o produto chamou uma porta que não existe: ${url}`);
  });
}
