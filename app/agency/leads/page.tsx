"use client";

// /agency/leads — QUEM ME PROCUROU E AINDA NÃO TEVE RESPOSTA.
//
// A tela nasce de um achado de 08/08/2026: três interessados entraram pelo
// briefing público — Sushi Cazza (51 dias), Camila Pereira (29) e Beatriz
// Gimenes (28) — com a conversa inteira gravada e NENHUM canal de contato. Não
// havia alarme e não havia tela: a caixa de entrada de `/agency/requests` lia o
// store do navegador, então quem abrisse noutro computador via zero.
//
// A UMA COISA que se vem fazer aqui: **decidir se aborda.** Por isso cada cartão
// responde, nesta ordem, as três perguntas que precedem a decisão:
//   1. dá para falar com ele?  (e, quando não dá, isso vem PRIMEIRO e em vermelho)
//   2. o que ele quer, nas palavras dele?
//   3. quanto vale, pela tabela da casa — e o que ainda não dá para saber.
//
// A tela NÃO aborda ninguém, não envia mensagem e não escreve nada. O dossiê é
// determinístico (`lib/agency/comercial/dossie-do-lead.ts`): nenhuma linha aqui
// é escrita por IA sobre um cliente que ninguém conferiu.
//
// ─── A SEGUNDA FONTE (29/08/2026) ───────────────────────────────────────────
//
// `GET /api/agency/conversas-sem-pedido` guarda as conversas do SDR que
// pararam ANTES de virar briefing — inclusive as que a casa PROMETEU
// responder ("nossa equipe entra em contato") e não cumpriu. A rota existia,
// provada por grep, e nenhuma tela chamava: trava sem fechadura. A seção
// "Conversas que pararam na sala", abaixo da lista de leads, é a fechadura.
//
// As duas fontes são independentes: uma pode carregar enquanto a outra falha,
// e cada uma trata os três estados (carregando / vazio / não medido) sozinha
// — misturar os dois estados numa tela só é o mesmo erro, em dobro.
//
// ─── DE LEITURA PARA AÇÃO (29/08/2026, rodada seguinte) ─────────────────────
//
// A fila deixa de ser só leitura. Dois atos, dois casos diferentes:
//   • "Marcar como contatado" — todo lead SEM `Client` (a maioria: visitante
//     anônimo). Registra que a casa já falou com a pessoa. Não envia nada a
//     ninguém, não apaga o rastro.
//   • "Confirmar que é deste cliente" — só quando o servidor JÁ DERIVOU o
//     cliente por token de convite (`clienteDoConvite`) e ninguém confirmou
//     ainda (`atribuicao === null`). Um clique confirma um dado do servidor;
//     NUNCA um seletor — escolher o cliente errado é irreversível na prática.
//
// As duas ações recarregam a fila do servidor depois de um sucesso
// (`carregarConversasParadas()`); nenhum estado otimista, porque mentir sobre
// "já contatei" quando a escrita falhou pela metade é pior que não ter botão.

import { useCallback, useEffect, useState } from "react";
import AgencyHeader from "@/components/agency/layout/AgencyHeader";
import EmptyState from "@/components/agency/ui/EmptyState";
import type { DossieDoLead } from "@/lib/agency/comercial/dossie-do-lead";
import { NEGOCIO_NAO_INFORMADO } from "@/lib/agency/comercial/negocio-do-lead";
import { textoDaVerbaEstourada } from "@/lib/agency/comercial/verba-declarada";

type Resposta =
  | { estado: "carregando" }
  | { estado: "ok"; leads: DossieDoLead[]; semContato: number }
  /** "não consegui olhar" tem tela própria. Lista vazia por falha de leitura é
   *  exatamente como esta fila ficou invisível por sete semanas. */
  | { estado: "nao_medido"; motivo: string };

/** Uma linha de `GET /api/agency/conversas-sem-pedido` — ver o cabeçalho da
 *  rota para o porquê de cada campo. Só os campos que esta tela usa entram
 *  aqui; `dono` e `venceEm`/`motivoDoPrazo` existem na rota e não entram
 *  aqui porque esta tela não os lê. */
export type ConversaParada = {
  fio: string;
  turnos: number;
  /** ISO. */
  paradaEm: string;
  contato: { nome?: string; email?: string; whatsapp?: string } | null;
  /** O que o SDR acumulou — forma livre, nunca despejada crua na tela. */
  escopo: Record<string, unknown>;
  /** Já vem pronta da rota (`proximaAcaoDoRastro`). Não se reescreve aqui. */
  proximaAcao: string;
  /** Quando a casa prometeu contato humano pela primeira vez. `null` = nunca
   *  prometeu. `venceEm` NÃO existe neste tipo de propósito — a rota devolve
   *  sempre `null` porque não há SLA ratificado, e esta tela não inventa um. */
  prometidoEm: string | null;
  /** Quando um humano da casa marcou esta conversa como contatada
   *  (`POST .../contatado`). `null` = ninguém marcou ainda. É o que tira o
   *  cartão da faixa de dívida pendente — sem apagar o rastro. */
  contatadoEm: string | null;
  /** Id de quem marcou — PERÍCIA, nunca tela. Um id de usuário não é
   *  informação que a agência reconhece; não renderize isto. */
  contatadoPor: string | null;
  /** Cliente que o SERVIDOR já derivou pelo token de convite (`clientId`).
   *  `null` = visitante anônimo, sem cliente para atribuir. */
  clienteDoConvite: string | null;
  /** Atribuição já DECLARADA por um operador (`POST .../atribuir`). Presente
   *  → já foi confirmado, o botão de confirmar não aparece mais. */
  atribuicao: { clientId: string; atribuidoPor: string; atribuidoEm: string; fio: string } | null;
};

export type RespostaConversasParadas =
  | { estado: "carregando" }
  | { estado: "ok"; total: number; conversas: ConversaParada[] }
  /** Mesma lei da fila de leads: falha de leitura NUNCA vira lista vazia. */
  | { estado: "nao_medido"; motivo: string };

/**
 * A ORDEM DA FILA DE DÍVIDA — dívida mais velha primeiro, sempre.
 *
 * `GET /api/agency/conversas-sem-pedido` devolve `timestamp: desc` (mais
 * recente primeiro) porque essa é a ordem certa para o contrato PRÓPRIO da
 * rota, documentado nela, e que serve mais de um leitor — não se mexe lá por
 * causa de uma tela. Esta função ordena de novo, no cliente, só para a leitura
 * que esta seção faz: uma fila de dívida, onde o cabeçalho da página já
 * promete "o mais antigo em cima".
 *
 * A regra: quem tem promessa (`prometidoEm`) vem primeiro — é dívida que a
 * casa criou por conta própria, ao dizer "entramos em contato" — da promessa
 * MAIS ANTIGA para a mais nova; depois vêm as sem promessa, da parada mais
 * antiga para a mais nova. Sem promessa no topo inverteria a régua: quem
 * ainda não recebeu nada da casa não pode furar a fila de quem já recebeu uma
 * palavra e está esperando ela ser cumprida.
 *
 * ⚠️ ANTES de tudo isso: quem já foi CONTATADO (`contatadoEm` não nulo) desce
 * para o fim, mesmo que tivesse promessa pendente — a dívida foi paga, e o
 * topo da fila é para quem ainda não recebeu nada da casa. É o que faz o selo
 * do cabeçalho ("N com promessa de contato pendente") continuar batendo com
 * o que aparece no topo da lista.
 *
 * Nunca muta o array recebido — quem chama pode reusar `resposta.conversas`
 * depois, e mutar aqui seria um efeito colateral escondido numa função que
 * parece só de leitura.
 */
export function ordemDaFila(conversas: ConversaParada[]): ConversaParada[] {
  return [...conversas].sort((a, b) => {
    const aContatada = a.contatadoEm !== null;
    const bContatada = b.contatadoEm !== null;
    if (aContatada !== bContatada) return aContatada ? 1 : -1;

    if (a.prometidoEm && b.prometidoEm) {
      return new Date(a.prometidoEm).getTime() - new Date(b.prometidoEm).getTime();
    }
    if (a.prometidoEm && !b.prometidoEm) return -1;
    if (!a.prometidoEm && b.prometidoEm) return 1;
    return new Date(a.paradaEm).getTime() - new Date(b.paradaEm).getTime();
  });
}

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/**
 * A FONTE DE `/api/agency/leads`, extraída para fora do componente.
 *
 * Mesma razão da irmã abaixo (`carregarConversasParadas`): esta casa não tem
 * jsdom (`vitest.config.ts` usa `environment: "node"`), então `useEffect`
 * nunca roda em teste. Extraindo o `fetch` para uma função pura e exportada,
 * o teste de comportamento chama ela direto — sem precisar montar o React.
 */
export async function carregarLeads(): Promise<Resposta> {
  try {
    const resp = await fetch("/api/agency/leads");
    const body = await resp.json();
    if (!resp.ok || body?.medido !== true) {
      return { estado: "nao_medido", motivo: body?.motivo ?? "a lista de interessados não pôde ser lida agora" };
    }
    return { estado: "ok", leads: body.leads ?? [], semContato: body.semContato ?? 0 };
  } catch {
    return { estado: "nao_medido", motivo: "não consegui falar com o servidor — esta lista não é zero, é desconhecida" };
  }
}

/**
 * A FONTE DE `/api/agency/conversas-sem-pedido`, extraída para fora do
 * componente.
 *
 * ⚠️ POR QUE ISTO EXISTE (29/08/2026, rodada 2 do despacho `interface`): o
 * teste anterior provava que `SecaoConversasParadas` RENDERIZA quando recebe
 * `resposta` por prop — nunca que `LeadsPage` chama esta rota. Se alguém
 * apagasse o `fetch`, a suíte continuava verde e a fila voltava a ser
 * invisível: a mesma "trava sem fechadura" que esta seção existe para
 * fechar, um nível abaixo. Extraindo o `fetch` para uma função pura e
 * exportada, o teste de comportamento (`__tests__/agency/promessa/`) chama
 * ela direto, com um duplo de `fetch`, e prova a URL, os três estados e o
 * corpo mal formado — sem depender de jsdom, que esta casa não tem.
 */
export async function carregarConversasParadas(): Promise<RespostaConversasParadas> {
  try {
    const resp = await fetch("/api/agency/conversas-sem-pedido");
    const body = await resp.json();
    if (!resp.ok || !Array.isArray(body?.conversas)) {
      return {
        estado: "nao_medido",
        motivo: body?.error ?? "as conversas que pararam na sala não puderam ser lidas agora",
      };
    }
    return { estado: "ok", total: body.total ?? body.conversas.length, conversas: body.conversas };
  } catch {
    return {
      estado: "nao_medido",
      motivo: "não consegui falar com o servidor — esta lista não é zero, é desconhecida",
    };
  }
}

/** Resultado de um ato de escrita nesta tela — sucesso, ou uma mensagem já
 *  pronta para a pessoa ler (nunca o objeto de erro cru do servidor). */
export type ResultadoDaAcao = { ok: true } | { ok: false; error: string };

/**
 * MARCAR COMO CONTATADO — `POST /api/agency/conversas-sem-pedido/contatado`.
 *
 * Extraída para fora do componente pela MESMA razão de `carregarLeads` e
 * `carregarConversasParadas`: esta casa não tem jsdom nem testing-library, e
 * o teste de comportamento chama esta função direto, com um duplo de
 * `fetch` — sem montar React.
 *
 * ⛔ Não manda nada a ninguém. É o registro de um ato que um humano já fez
 * por fora desta tela (ligou, escreveu por fora) — ver o cabeçalho da rota.
 */
export async function marcarContatado(fio: string): Promise<ResultadoDaAcao> {
  try {
    const resp = await fetch("/api/agency/conversas-sem-pedido/contatado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fio }),
    });
    const body = await resp.json().catch(() => ({}));
    if (!resp.ok || body?.ok !== true) {
      return { ok: false, error: body?.error ?? "o servidor não confirmou o registro" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "não consegui falar com o servidor — tente de novo" };
  }
}

/**
 * CONFIRMAR CLIENTE — `POST /api/agency/conversas-sem-pedido/atribuir`.
 *
 * ⛔ `clientId` nunca vem de uma lista escolhida na tela: o único valor que
 * esta função manda é o `clienteDoConvite` que o SERVIDOR já derivou do
 * token de convite. Deixar um humano escolher o cliente numa lista é como se
 * atribui a conversa ao cliente errado — e o dono errado é irreversível na
 * prática. Ver a ficha de despacho, §1.
 */
export async function confirmarCliente(fio: string, clientId: string): Promise<ResultadoDaAcao> {
  try {
    const resp = await fetch("/api/agency/conversas-sem-pedido/atribuir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fio, clientId }),
    });
    const body = await resp.json().catch(() => ({}));
    if (!resp.ok || body?.ok !== true) {
      return { ok: false, error: body?.error ?? "o servidor não confirmou a atribuição" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "não consegui falar com o servidor — tente de novo" };
  }
}

export default function LeadsPage() {
  const [r, setR] = useState<Resposta>({ estado: "carregando" });
  const [aberto, setAberto] = useState<string | null>(null);
  const [conversas, setConversas] = useState<RespostaConversasParadas>({ estado: "carregando" });

  const carregar = useCallback(async () => {
    setR({ estado: "carregando" });
    setR(await carregarLeads());
  }, []);

  // Fonte independente da acima: se `/api/agency/leads` falhar, esta lista
  // continua carregando normalmente, e vice-versa — nenhuma das duas espera
  // pela outra nem herda o estado dela.
  const carregarConversas = useCallback(async () => {
    setConversas({ estado: "carregando" });
    setConversas(await carregarConversasParadas());
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);
  useEffect(() => { void carregarConversas(); }, [carregarConversas]);

  const semContatoBadge = r.estado === "ok" && r.semContato > 0 ? `${r.semContato} sem forma de contato` : null;

  return (
    <div className="max-w-[900px]">
      <AgencyHeader
        eyebrow="Comercial"
        title="Quem procurou a Dioli"
        subtitle="Briefings que chegaram pela porta pública e ainda não viraram cliente. O mais antigo em cima."
        meta={
          semContatoBadge ? (
            <div className="flex flex-wrap gap-2">
              {/* Mesmo `Selo` dos cartões: duas cópias da mesma pílula no
                  mesmo arquivo divergem na primeira vez que alguém ajustar
                  uma delas. "N com promessa de contato pendente" NÃO mora
                  aqui — ver `SecaoConversasParadas`: esse total é da lista de
                  BAIXO, e ficar aqui em cima (achado do `experiencia` em
                  29/08/2026) lia como um segundo total da lista de CIMA. */}
              <Selo tom="danger">{semContatoBadge}</Selo>
            </div>
          ) : undefined
        }
      />

      {r.estado === "carregando" && (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-[112px] rounded-[12px] border border-[var(--border)] bg-[var(--bg)] animate-pulse" />
          ))}
        </div>
      )}

      {r.estado === "nao_medido" && (
        <div className="rounded-[12px] border border-[var(--danger)] bg-[var(--danger-bg)] px-5 py-4">
          <p className="text-[13px] font-semibold text-[var(--danger)]">Não consegui ler a fila</p>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 leading-relaxed">{r.motivo}</p>
          <button
            onClick={() => void carregar()}
            className="mt-3 h-9 px-4 rounded-[8px] border border-[var(--border)] bg-white text-[13px] font-medium text-[var(--text-primary)]"
          >
            Tentar de novo
          </button>
        </div>
      )}

      {r.estado === "ok" && r.leads.length === 0 && (
        <EmptyState
          title="Ninguém esperando"
          description="Todo briefing que chegou já virou proposta ou cliente. Quando alguém preencher o briefing público, ele aparece aqui."
        />
      )}

      {r.estado === "ok" && r.leads.length > 0 && (
        <div className="space-y-3">
          {r.leads.map((l) => (
            <Cartao
              key={l.id}
              lead={l}
              aberto={aberto === l.id}
              onToggle={() => setAberto(aberto === l.id ? null : l.id)}
            />
          ))}
        </div>
      )}

      <SecaoConversasParadas resposta={conversas} onTentarDeNovo={() => void carregarConversas()} />
    </div>
  );
}

/**
 * "CONVERSAS QUE PARARAM NA SALA" — a segunda fonte desta tela.
 *
 * Exportada para o teste renderizar direto, com `resposta` passada à mão nos
 * três estados — mesmo modelo de `AvisosDeOrcamentoView`
 * (`app/agency/avisos-de-orcamento/page.tsx`): a aparência não chama `fetch`.
 */
export function SecaoConversasParadas({
  resposta,
  onTentarDeNovo,
}: {
  resposta: RespostaConversasParadas;
  onTentarDeNovo: () => void;
}) {
  // O selo mora AQUI, não no `AgencyHeader` da página: o total é desta
  // lista (de BAIXO), e até 29/08/2026 ele vivia no cabeçalho — que fala da
  // lista de CIMA. Dois totais de filas diferentes no mesmo cabeçalho.
  // Achado do `experiencia`; conserto do `interface`.
  //
  // ⚠️ NÃO conta quem já foi contatado — este número é a DÍVIDA em aberto,
  // não o histórico. Marcar como contatado tem de fazer este número CAIR na
  // hora; contar as duas juntas deixaria o selo parado depois de um clique
  // que claramente resolveu alguma coisa.
  const prometidasPendentes =
    resposta.estado === "ok"
      ? resposta.conversas.filter((c) => c.prometidoEm !== null && c.contatadoEm === null).length
      : 0;

  return (
    <div className="mt-10">
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[16px] font-semibold text-[var(--text-primary)] tracking-[-0.01em]">
            Conversas que pararam na sala
          </h2>
          {prometidasPendentes > 0 && (
            <Selo tom="warning">{prometidasPendentes} com promessa de contato pendente</Selo>
          )}
        </div>
        <p className="text-[13px] text-[var(--text-muted)] mt-1 leading-relaxed">
          Conversas do SDR que pararam antes de virar briefing — inclusive as que a casa prometeu retomar.
        </p>
      </div>

      {resposta.estado === "carregando" && (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-[112px] rounded-[12px] border border-[var(--border)] bg-[var(--bg)] animate-pulse" />
          ))}
        </div>
      )}

      {resposta.estado === "nao_medido" && (
        <div role="alert" className="rounded-[12px] border border-[var(--danger)] bg-[var(--danger-bg)] px-5 py-4">
          <p className="text-[13px] font-semibold text-[var(--danger)]">Não consegui ler esta fila</p>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 leading-relaxed">{resposta.motivo}</p>
          <button
            onClick={() => onTentarDeNovo()}
            style={{ touchAction: "manipulation" }}
            className="mt-3 h-9 px-4 rounded-[8px] border border-[var(--border)] bg-white text-[13px] font-medium text-[var(--text-primary)]"
          >
            Tentar de novo
          </button>
        </div>
      )}

      {resposta.estado === "ok" && resposta.conversas.length === 0 && (
        <EmptyState
          title="Nenhuma conversa parada"
          description="Toda conversa que o SDR teve virou briefing ou ainda está em andamento. Quando uma parar sem virar pedido, ela aparece aqui."
        />
      )}

      {resposta.estado === "ok" && resposta.conversas.length > 0 && (
        <div className="space-y-3">
          {/* `ordemDaFila`: dívida mais velha em cima, como o cabeçalho da
              página promete. A rota devolve `timestamp: desc`; a ordenação
              de fila mora aqui, não nela — ver o comentário da função. */}
          {ordemDaFila(resposta.conversas).map((c) => (
            // `aoRecarregar` é o MESMO `onTentarDeNovo` que a falha de leitura
            // usa: os dois pedem a mesma coisa ao servidor — "leia esta fila
            // de novo". Depois de marcar/confirmar com sucesso, a tela nunca
            // inventa o próprio estado; ela pergunta ao servidor de novo.
            <CartaoConversaParada key={c.fio} conversa={c} aoRecarregar={onTentarDeNovo} />
          ))}
        </div>
      )}

      {resposta.estado === "ok" && resposta.conversas.length > 0 && (
        <p className="text-[12px] text-[var(--text-subtle)] mt-3 leading-relaxed">
          A casa ainda não ratificou em quantas horas responde — por isso esta lista mostra há quanto
          tempo, não atraso.
        </p>
      )}
    </div>
  );
}

/** Estado do ato de escrita DESTE cartão — local, por `fio`. Nunca
 *  compartilhado entre cartões: marcar um não pode deixar outro "enviando". */
type EstadoDaAcaoDoCartao =
  | { fase: "idle" }
  | { fase: "enviando"; acao: "contatado" | "cliente" }
  | { fase: "erro"; acao: "contatado" | "cliente"; motivo: string };

function CartaoConversaParada({
  conversa,
  aoRecarregar,
}: {
  conversa: ConversaParada;
  /** Pede ao pai para reler a fila do servidor. Chamado SÓ depois de um
   *  `ok: true` — nunca antes, e nunca substituído por mexer no estado local
   *  à mão (estado otimista mente quando a escrita falha pela metade). */
  aoRecarregar: () => void;
}) {
  const [acaoEstado, setAcaoEstado] = useState<EstadoDaAcaoDoCartao>({ fase: "idle" });

  const semContato = !conversa.contato || (!conversa.contato.email && !conversa.contato.whatsapp);
  const contatada = conversa.contatadoEm !== null;
  const diasParada = diasDesde(conversa.paradaEm);
  // A promessa some do destaque assim que a casa contatou — a dívida foi
  // paga, e o selo de dívida junto de um selo dizendo "já contatada" seria a
  // tela se contradizendo na mesma linha.
  const diasPrometido = !contatada && conversa.prometidoEm ? diasDesde(conversa.prometidoEm) : null;
  const diasContatado = conversa.contatadoEm ? diasDesde(conversa.contatadoEm) : null;
  // O botão de confirmar só existe quando o SERVIDOR já derivou um cliente
  // pelo token de convite E ninguém confirmou ainda. Sem `clienteDoConvite`
  // não há botão nenhum — nunca um seletor.
  const podeConfirmarCliente = conversa.clienteDoConvite !== null && conversa.atribuicao === null;
  const enviando = acaoEstado.fase === "enviando";

  const marcar = async () => {
    setAcaoEstado({ fase: "enviando", acao: "contatado" });
    const r = await marcarContatado(conversa.fio);
    if (r.ok) {
      aoRecarregar();
    } else {
      setAcaoEstado({ fase: "erro", acao: "contatado", motivo: r.error });
    }
  };

  const confirmar = async () => {
    if (!conversa.clienteDoConvite) return;
    setAcaoEstado({ fase: "enviando", acao: "cliente" });
    const r = await confirmarCliente(conversa.fio, conversa.clienteDoConvite);
    if (r.ok) {
      aoRecarregar();
    } else {
      setAcaoEstado({ fase: "erro", acao: "cliente", motivo: r.error });
    }
  };

  return (
    <div
      className={`rounded-[12px] border bg-white px-4 sm:px-5 py-4 ${semContato ? "border-[var(--danger)]" : "border-[var(--border)]"}`}
    >
      <div className="min-w-0">
        {conversa.contato?.nome ? (
          <p className="text-[15px] font-semibold text-[var(--text-primary)] truncate">{conversa.contato.nome}</p>
        ) : (
          <p className="text-[13px] text-[var(--text-subtle)] italic truncate">Nome não informado</p>
        )}
        <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
          {conversa.turnos} turno{conversa.turnos === 1 ? "" : "s"} · parada {idadeEmDias(diasParada)}
        </p>
      </div>

      {/* Contato SEMPRE primeiro — a mesma régua do cartão de lead acima:
          "dá para falar com ele?" é a pergunta que decide tudo, e some ela
          entre outros selos é o defeito que aquele cartão já corrigiu uma
          vez. */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {semContato ? (
          <Selo tom="danger">Sem como falar com esta pessoa</Selo>
        ) : (
          <Selo tom="success">
            {[conversa.contato?.whatsapp ? "WhatsApp" : null, conversa.contato?.email ? "E-mail" : null]
              .filter(Boolean)
              .join(" · ")}
          </Selo>
        )}
        {/* O DESTAQUE DA DÍVIDA: só enquanto ela está aberta. `venceEm` não
            existe (ver o tipo `ConversaParada`), então o selo nunca fala de
            prazo, só do fato observável. */}
        {diasPrometido !== null && (
          <Selo tom="warning">
            ⚑ Prometemos contato {idadeEmDias(diasPrometido ?? 0)}
          </Selo>
        )}
        {/* A dívida quitada: tom neutro, de propósito — não é alarme, é
            histórico. Ver a ficha de despacho, §2. */}
        {contatada && (
          <Selo tom="neutro">
            Contatada {idadeEmDias(diasContatado ?? 0)}
          </Selo>
        )}
      </div>

      {/* ⛔ SÓ TEXTO — NUNCA `<a href>`/`onClick`/`mailto:`/`wa.me`. O selo
          acima só dizia a PALAVRA ("WhatsApp"/"E-mail"); quem quisesse
          cumprir a promessa tinha de sair da tela e caçar o número no banco
          (achado do `experiencia`, 29/08/2026). `break-all` porque o valor é
          imprimido como veio — sem máscara, sem truncar — e um número/e-mail
          longo não pode estourar o cartão a 375px. */}
      {!semContato && (
        <div className="mt-2 space-y-0.5">
          {conversa.contato?.whatsapp && (
            <p className="text-[13px] text-[var(--text-secondary)] break-all">
              WhatsApp: {conversa.contato.whatsapp}
            </p>
          )}
          {conversa.contato?.email && (
            <p className="text-[13px] text-[var(--text-secondary)] break-all">
              E-mail: {conversa.contato.email}
            </p>
          )}
        </div>
      )}

      <p className="text-[13px] text-[var(--text-secondary)] mt-3 leading-relaxed">
        {resumoDoEscopo(conversa.escopo)}
      </p>

      {/* `proximaAcao` já vem pronta da rota (`proximaAcaoDoRastro`) — nunca
          reescrita aqui, para que quem atende leia exatamente o que o
          servidor concluiu do estado do rastro. */}
      <p className="text-[13px] text-[var(--text-primary)] mt-2 leading-relaxed">{conversa.proximaAcao}</p>

      {/* OS DOIS ATOS — SEMPRE POR ÚLTIMO. A pessoa só marca "contatado"
          depois de ler quem é, o valor de contato e a próxima ação — nunca
          antes. Achado da CAPTURA AO VIVO (29/08/2026): botão antes do
          insumo convida a clicar antes de agir. Borda superior sutil separa
          o bloco de ação do texto de leitura acima, sem novo componente. */}
      {(!contatada || podeConfirmarCliente) && (
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap gap-2">
          {!contatada && (
            <button
              onClick={() => void marcar()}
              disabled={enviando}
              style={{ touchAction: "manipulation" }}
              className="h-9 px-4 rounded-[8px] bg-[var(--sidebar)] text-white text-[13px] font-medium disabled:opacity-50"
            >
              {acaoEstado.fase === "enviando" && acaoEstado.acao === "contatado" ? "Marcando…" : "Marcar como contatado"}
            </button>
          )}
          {/* ⛔ NUNCA um seletor de cliente. O `clientId` só pode vir de
              `conversa.clienteDoConvite` — o servidor já decidiu; o clique só
              confirma. Ver §1 da ficha. */}
          {podeConfirmarCliente && (
            <button
              onClick={() => void confirmar()}
              disabled={enviando}
              style={{ touchAction: "manipulation" }}
              className="h-9 px-4 rounded-[8px] border border-[var(--border-strong)] bg-white text-[13px] font-medium text-[var(--text-primary)] disabled:opacity-50"
            >
              {acaoEstado.fase === "enviando" && acaoEstado.acao === "cliente" ? "Confirmando…" : "Confirmar que é deste cliente"}
            </button>
          )}
        </div>
      )}

      {/* Falha aparece — nunca silenciosa, e logo abaixo dos botões, onde
          o clique acabou de acontecer. Um clique que não fez nada e não
          disse nada é o defeito que a ficha de despacho proíbe. */}
      {acaoEstado.fase === "erro" && (
        <p role="alert" className="mt-2 text-[13px] text-[var(--danger)] leading-relaxed">
          {acaoEstado.motivo}
        </p>
      )}
    </div>
  );
}

/** Dias corridos desde um ISO, nunca negativo — relógio do cliente pode
 *  divergir por segundos do servidor. */
/**
 * "há N dias" em português que uma pessoa lê sem tropeçar.
 *
 * ⚠️ Achado da CAPTURA AO VIVO, não do teste: logo depois de clicar em "Marcar
 * como contatado", o selo dizia **"Contatada há 0 dias"** — que é verdade
 * aritmética e frase que ninguém fala. O momento em que esse texto mais é lido
 * é justamente o segundo seguinte ao clique, então era o pior caso que estava
 * pior escrito. `0` vira "hoje"; `1` vira "há 1 dia"; o resto, "há N dias".
 */
export function idadeEmDias(dias: number): string {
  if (dias <= 0) return "hoje";
  if (dias === 1) return "há 1 dia";
  return `há ${dias} dias`;
}

function diasDesde(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/**
 * RESUMO CURTO DO ESCOPO — nunca despeja o JSON cru na tela.
 *
 * `escopo` é o que o SDR acumulou (`BriefingScope`, ver `lib/agency/sdr-agent.ts`),
 * mas chega aqui como forma livre — a rota não valida a forma, só repassa o que
 * foi gravado. Lê defensivamente: nenhum campo é obrigatório, e um objeto vazio
 * ou de formato inesperado vira a frase de ausência, nunca um erro de render.
 */
function resumoDoEscopo(escopo: Record<string, unknown>): string {
  const texto = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);

  const negocio = texto(escopo.businessName) ?? texto(escopo.prospectName);
  const segmento = texto(escopo.segment);

  const servicos: string[] = [];
  if (escopo.wantsSocialMedia) servicos.push("redes sociais");
  if (escopo.wantsPaidTraffic) servicos.push("tráfego pago");
  const branding = escopo.branding;
  if (branding && typeof branding === "object" && (branding as Record<string, unknown>).requested) {
    servicos.push("identidade visual");
  }
  if (servicos.length === 0 && Array.isArray(escopo.objectives)) {
    for (const o of escopo.objectives) {
      if (typeof o === "string" && o.trim()) servicos.push(o.trim());
    }
  }

  if (!negocio && !segmento && servicos.length === 0) {
    return "Nenhum detalhe contado antes de a conversa parar.";
  }

  const cabecalho = negocio ?? "negócio não identificado";
  const rotulo = segmento ? `${cabecalho} (${segmento})` : cabecalho;
  const parte2 = servicos.length > 0 ? servicos.join(", ") : "sem serviço declarado ainda";
  return `${rotulo} — ${parte2}`;
}

function Cartao({ lead, aberto, onToggle }: { lead: DossieDoLead; aberto: boolean; onToggle: () => void }) {
  const semContato = !lead.contato.temComoFalar;

  return (
    <div className={`rounded-[12px] border bg-white overflow-hidden ${semContato ? "border-[var(--danger)]" : "border-[var(--border)]"}`}>
      <button
        onClick={onToggle}
        style={{ touchAction: "manipulation" }}
        className="w-full text-left px-4 sm:px-5 py-4 hover:bg-[var(--bg)] transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {/* Ausência declarada, nunca buraco branco: `lead.negocio` é `null`
                quando o briefing não trouxe nome do negócio — ver
                `negocio-do-lead.ts`. A forma é a MESMA que esta casa já usa em
                `MarketingIntelligence.tsx:70,152,188` para "não informado":
                `text-[13px]`, `--text-subtle`, itálico e **sem `font-semibold`**.
                O peso importa: mantendo 15px/semibold — o peso do nome real — a
                frase lê como se o negócio SE CHAMASSE "Negócio não informado",
                ou seja, ausência disfarçada de conteúdo, que é exatamente o
                defeito que este conserto existe para fechar. Achado pelo
                especialista `interface` em 16/08/2026. */}
            {lead.negocio ? (
              <p className="text-[15px] font-semibold text-[var(--text-primary)] truncate">{lead.negocio}</p>
            ) : (
              <p className="text-[13px] text-[var(--text-subtle)] italic truncate">{NEGOCIO_NAO_INFORMADO}</p>
            )}
            <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
              {lead.segmento ?? "segmento não informado"} · parado há {lead.diasParado} dia{lead.diasParado === 1 ? "" : "s"}
            </p>
          </div>
          <span className="text-[12px] text-[var(--text-muted)] shrink-0 pt-1">{aberto ? "fechar" : "abrir"}</span>
        </div>

        {/* 🔴 A ORDEM DESTA FILEIRA É A REGRA DA TELA, NÃO ARRUMAÇÃO.
            O cabeçalho deste arquivo declara: "a pergunta que decide tudo vem
            primeiro". Quando o carimbo de repetição entrou (16/08), ele entrou
            ACIMA do selo de contato e quebrou justamente isso — numa coluna de
            seis cartões, a resposta de "dá para falar com ele?" deixava de
            estar sempre no mesmo lugar, porque só alguns cartões têm carimbo.
            Contato SEMPRE primeiro; a repetição vem depois, na mesma fileira.

            ESTE CONTATO JÁ ESCREVEU ANTES (16/08/2026). Pergunta do CEO: "cinco
            briefings do mesmo e-mail, o que acontece?". Acontecia que apareciam
            cinco cartões idênticos e nada dizia que eram a mesma pessoa. O
            carimbo NÃO afirma que é pedido repetido — pode ser um segundo
            projeto legítimo. Ele diz o fato e deixa a leitura para quem abre. */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {semContato ? (
            <Selo tom="danger">Sem como falar com esta pessoa</Selo>
          ) : (
            <Selo tom="success">
              {lead.contato.canais.map((c) => (c.tipo === "whatsapp" ? "WhatsApp" : "E-mail")).join(" · ")}
            </Selo>
          )}

          {/* 🔴 TOM DE INFORMAÇÃO, NÃO DE ALERTA — e a troca é deliberada.
              Este selo nasceu em `--warning`/`--warning-bg` (âmbar). Âmbar nesta
              casa quer dizer "algo saiu do trilho", e escrever cinco vezes não
              é erro do cliente: pode ser exatamente o que a agência quer, um
              cliente insistindo em contratar. Numa coluna de cinco cartões,
              cinco pílulas âmbar liam como cinco problemas e disputavam o olho
              com o vermelho de "sem como falar", que é o único alarme legítimo
              desta tela. `--info` diz o fato sem acusar ninguém. */}
          {lead.repeticao && (
            <Selo tom="info">
              {lead.repeticao.ordem}º briefing deste mesmo contato (de {lead.repeticao.vezes})
            </Selo>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-[16px] font-semibold text-[var(--text-primary)]">
            {lead.faixa ? `${brl(lead.faixa.minimo)} – ${brl(lead.faixa.maximo)}` : "faixa a definir"}
          </span>
          <span className="text-[12px] text-[var(--text-muted)]">
            {lead.fonteDaFaixa === "escopo_declarado"
              ? "pela tabela da casa, sobre o escopo declarado"
              : lead.fonteDaFaixa === "catalogo_sem_cadencia"
              ? "banda do catálogo — volume não declarado"
              : "a tabela da casa não cobre o que foi pedido"}
          </span>
        </div>
      </button>

      {aberto && (
        <div className="border-t border-[var(--border)] px-4 sm:px-5 py-4 space-y-5">
          <Bloco titulo="Como falar">
            {semContato ? (
              <>
                <p className="text-[13px] text-[var(--danger)] font-medium leading-relaxed">
                  Não há contato gravado: {lead.contato.motivo}
                </p>
                <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  Nada foi deduzido do texto da conversa. O que aparece abaixo são pistas que a pessoa
                  mencionou — <strong>não são contato confirmado</strong>, e quem decide se aborda por
                  ali é você.
                </p>
                {lead.pistas.length > 0 ? (
                  <ul className="mt-2.5 space-y-1">
                    {lead.pistas.map((p, i) => (
                      <li key={i} className="text-[13px] text-[var(--text-primary)]">
                        <span className="text-[var(--text-muted)]">{p.tipo} (pista):</span> {p.valor}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[13px] text-[var(--text-muted)] mt-2.5">Nenhuma pista no texto do briefing.</p>
                )}
              </>
            ) : (
              <ul className="space-y-1">
                {lead.contato.nome && (
                  <li className="text-[13px] text-[var(--text-primary)]">
                    <span className="text-[var(--text-muted)]">nome:</span> {lead.contato.nome}
                  </li>
                )}
                {lead.contato.canais.map((c) => (
                  <li key={c.tipo} className="text-[13px] text-[var(--text-primary)]">
                    <span className="text-[var(--text-muted)]">{c.tipo === "whatsapp" ? "WhatsApp" : "e-mail"}:</span> {c.valor}
                  </li>
                ))}
              </ul>
            )}
          </Bloco>

          {lead.repeticao && (
            <Bloco titulo="Este contato já escreveu antes">
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                São <strong>{lead.repeticao.vezes} briefings</strong> do mesmo contato, e este é o{" "}
                <strong>{lead.repeticao.ordem}º</strong>. O primeiro chegou em{" "}
                {new Date(lead.repeticao.primeiroEm).toLocaleDateString("pt-BR")}.
              </p>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                <strong>Nenhum deles foi juntado nem descartado</strong> — cada briefing está inteiro,
                com o texto que a pessoa escreveu. Pode ser o mesmo pedido reenviado, ou um{" "}
                <strong>segundo projeto</strong> que ela quer contratar: quem lê os dois decide, não o
                sistema.
              </p>
              {/* 🔴 ID DE BANCO NÃO É INFORMAÇÃO. Até 16/08 esta lista saía como
                  `outro briefing: 0083d663-4ee0-4e8f-b9b5-acd13858f0cf` — quatro
                  linhas de monospace que eram o elemento mais pesado do bloco e
                  não respondiam a pergunta pela qual o bloco existe. Data, nome
                  do negócio e o que foi pedido respondem: é assim que se vê que
                  dois briefings viraram "unidade Pinheiros" e falam de outro
                  projeto. Tudo dado gravado — nada aqui é resumo de IA. */}
              <ul className="mt-2.5 space-y-2">
                {lead.repeticao.irmaos.map((irmao) => (
                  <li key={irmao.id} className="text-[13px] border-l-2 border-[var(--border)] pl-3">
                    <p className="text-[var(--text-primary)]">
                      <span className="tabular-nums">
                        {new Date(irmao.em).toLocaleDateString("pt-BR")}
                      </span>
                      {irmao.negocio ? <> · {irmao.negocio}</> : null}
                    </p>
                    <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
                      {/* Ausência de informação não é informação: briefing sem
                          serviço e sem texto diz que não tem descrição, e nunca
                          some da lista por isso. */}
                      {irmao.pedido ?? "sem descrição gravada neste briefing"}
                    </p>
                  </li>
                ))}
              </ul>
            </Bloco>
          )}

          {lead.servicosPedidos.length > 0 && (
            <Bloco titulo="O que ele pediu">
              <div className="flex flex-wrap gap-1.5">
                {lead.servicosPedidos.map((s, i) => (
                  <span key={i} className="h-6 px-2.5 inline-flex items-center rounded-[6px] bg-[var(--accent)] text-[var(--text-secondary)] text-[12px]">
                    {s}
                  </span>
                ))}
              </div>
            </Bloco>
          )}

          {lead.oQueEleContou.length > 0 && (
            <Bloco titulo="Nas palavras dele">
              <ul className="space-y-1.5">
                {lead.oQueEleContou.map((f, i) => (
                  <li key={i} className="text-[13px] text-[var(--text-secondary)] leading-relaxed border-l-2 border-[var(--border)] pl-3">
                    {f}
                  </li>
                ))}
              </ul>
            </Bloco>
          )}

          <Bloco titulo="Escopo e faixa, pela tabela da casa">
            {lead.escopo.length > 0 ? (
              <div className="space-y-2">
                {/* A 375px, título e preço lado a lado brigam pela mesma
                    largura: o nome do plano quebra em três linhas e o preço
                    fica espremido no canto, longe do item que ele precifica.
                    No celular a linha EMPILHA — preço embaixo do que ele
                    precifica —, e só a partir de `sm` vira duas colunas. */}
                {lead.escopo.map((l, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 sm:gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-[var(--text-primary)]">{l.item}</p>
                      <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">{l.detalhe}</p>
                    </div>
                    <p className="text-[13px] font-medium text-[var(--text-primary)] shrink-0 tabular-nums">
                      {brl(l.minimo)}–{brl(l.maximo)}
                      <span className="text-[12px] font-normal text-[var(--text-muted)]">/{l.unidade}</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
            <p className="text-[12px] text-[var(--text-muted)] mt-3 leading-relaxed">{lead.notaDaFaixa}</p>
          </Bloco>

          {/* ── A DIFERENÇA ENTRE O QUE ELE DISSE QUE TEM E O QUE PEDIU ────────
              Em 16/08/2026, no piloto ao vivo, o CEO declarou R$ 500/mês e a
              casa devolveu R$ 1.800–3.400 **sem uma palavra sobre a
              diferença**. Os dois números já estavam neste mesmo cartão, um
              embaixo do outro — a "Faixa de investimento" que ele declarou e a
              faixa da tabela da casa — e ninguém os comparava.

              O bloco só existe quando há desencontro real (ver
              `comercial/verba-declarada.ts`): aviso que aparece em todo cartão deixa
              de ser lido, e aí o dia em que ele importa passa junto com os
              outros.

              ⚠️ Âmbar (`--warning`), não vermelho: isto **não é defeito do
              lead** nem urgência — é uma conversa que precisa acontecer. O
              vermelho desta tela já tem dono, e é "não há como falar com esta
              pessoa". Dois vermelhos com pesos diferentes achatam os dois. */}
          {lead.acimaDaVerba && (
            <Bloco titulo="O pedido passa da verba que ele declarou">
              {/* Sem esta legenda, o "você" da primeira frase parece dirigido a
                  quem está lendo o painel. É a fala do CLIENTE, e dizer isso
                  evita que alguém reescreva a mensagem por conta própria — a
                  divergência que a fonte única veio fechar. */}
              <p className="text-[12px] text-[var(--text-muted)] mb-2 leading-relaxed">
                O texto abaixo é o que ele recebe no orçamento — palavra por palavra.
              </p>
              <div className="rounded-[10px] border border-[var(--warning)] bg-[var(--warning-bg)] px-4 py-3">
                {/* ESTA TELA MOSTRA A MESMA FRASE QUE O CLIENTE RECEBE, gerada
                    pela MESMA função (`textoDaVerbaEstourada`) que o orçamento
                    do briefing usa. Não é economia de código: é a garantia de
                    que quem for falar com este lead diz exatamente o que a casa
                    já disse a ele. Um segundo texto aqui seria a divergência que
                    esta consolidação veio fechar. */}
                {textoDaVerbaEstourada(lead.acimaDaVerba).map((linha, i) =>
                  linha === "" ? (
                    <div key={i} className="h-2" />
                  ) : (
                    <p
                      key={i}
                      className={
                        linha.startsWith("  ")
                          ? "text-[12px] text-[var(--text-muted)] leading-relaxed pl-3"
                          : "text-[13px] text-[var(--text-secondary)] leading-relaxed"
                      }
                    >
                      {linha.trim()}
                    </p>
                  ),
                )}
              </div>
            </Bloco>
          )}

          {lead.precisoConfirmar.length > 0 && (
            <Bloco titulo="Preciso confirmar">
              <ul className="space-y-1">
                {lead.precisoConfirmar.map((p, i) => (
                  <li key={i} className="text-[13px] text-[var(--text-secondary)] leading-relaxed">• {p}</li>
                ))}
              </ul>
            </Bloco>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * A pílula de estado do cartão — uma geometria só para os cinco tons.
 *
 * 🔴 **POR QUE A ALTURA DEIXOU DE SER FIXA.** As três nasceram com `h-6`, altura
 * travada em 24px. Medido a 375px, o carimbo mais longo de hoje ocupa 240px dos
 * 309px disponíveis e **não estoura** — mas altura fixa é uma aposta em que ele
 * nunca vá crescer, e o modo de falhar dela é o pior que existe: o texto sai
 * POR FORA do fundo colorido, em cima do que estiver embaixo, sem quebrar nada
 * que um teste perceba. Basta um `12º briefing (de 15)`, uma tradução mais
 * longa ou o zoom de fonte do sistema. `min-h` + `py` deixa o fundo crescer com
 * o texto; `max-w-full` impede que a pílula ultrapasse o cartão.
 *
 * `neutro` (29/08/2026): para fato histórico, não estado que pede atenção —
 * "Contatada há N dias" não é alarme nem sucesso, é registro. Mesmo par
 * `--accent`/`--text-secondary` que os chips de "O que ele pediu" já usam
 * neste arquivo, para não introduzir um quinto par de tokens.
 */
function Selo({
  tom,
  children,
}: {
  tom: "danger" | "success" | "info" | "warning" | "neutro";
  children: React.ReactNode;
}) {
  const cor = {
    danger:  "bg-[var(--danger-bg)] text-[var(--danger)]",
    success: "bg-[var(--success-bg)] text-[var(--success)]",
    info:    "bg-[var(--info-bg)] text-[var(--info)]",
    warning: "bg-[var(--warning-bg)] text-[var(--warning)]",
    neutro:  "bg-[var(--accent)] text-[var(--text-secondary)]",
  }[tom];
  return (
    <span
      className={`inline-flex items-center gap-1.5 min-h-6 max-w-full px-2.5 py-1 rounded-[6px] text-[12px] font-semibold leading-tight ${cor}`}
    >
      {children}
    </span>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-2">{titulo}</p>
      {children}
    </div>
  );
}
