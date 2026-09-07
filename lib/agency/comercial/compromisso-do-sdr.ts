// compromisso-do-sdr.ts — A FECHADURA: nenhuma escalação sai da boca do SDR
// sem um registro com DONO e PRAZO criado no MESMO ato.
//
// ═══════════════════════════════════════════════════════════════════════════
// O DEFEITO (P0 ao vivo, 30/08/2026 — Marcos, Foocci, PARCEIRO REAL)
// ═══════════════════════════════════════════════════════════════════════════
//
// Marcos cobrou a proposta atrasada há mais de 1h. O SDR respondeu:
// *"Vou conferir com o gerente de projeto se cabe no cronograma. (…) precisa
// de aprovação de gestão. Vou trazer essas duas respostas para você ainda
// hoje — pode deixar comigo."*
//
// Não existe gerente sendo consultado. Não existe pedido de aprovação. Não
// existe tarefa, alarme, prazo nem dono. A frase é plausível e não tem
// mecanismo nenhum atrás dela — a mesma família de defeito que
// `promessa-que-a-maquina-nao-cumpre.ts` já mata para "eu envio o orçamento",
// só que aqui a promessa é de ESCALAR, e escalar é uma coisa que esta casa
// consegue fazer de verdade.
//
// ═══════════════════════════════════════════════════════════════════════════
// A REGRA
// ═══════════════════════════════════════════════════════════════════════════
//
// *Sem fechadura, não se promete.* Quando o SDR anuncia que vai consultar
// alguém (`PromessaSolta.tipo === "escalacao"`, em
// `promessa-que-a-maquina-nao-cumpre.ts`), quem chama esta função
// (`app/api/sdr/chat/route.ts`) tenta registrar um COMPROMISSO real — dono e
// prazo — no MESMO ato em que a fala sai. Se o registro nascer, a fala pode
// dizer a verdade (a equipe VAI olhar, com prazo de verdade). Se não nascer,
// a régua de `limparPromessaSolta` barra como sempre.
//
// ═══════════════════════════════════════════════════════════════════════════
// POR QUE `ActivityEvent`, E NÃO TABELA NOVA
// ═══════════════════════════════════════════════════════════════════════════
//
// A mesma escolha de `conversa-sem-pedido.ts`, e pelo mesmo motivo: zero
// migração num volume SQLite vivo, o índice `@@index([type, timestamp])` já
// existe, e este arquivo NÃO É um segundo mecanismo — é a MESMA primitiva
// (ActivityEvent com `type` próprio) que a casa já usa para "conversa parada",
// "conversa atribuída" e "pacote travado". Um `type` novo (`compromisso_do_
// sdr`) é a forma desta casa de guardar "mais um fato com dono", não uma fila
// paralela.
//
// Não é a MESMA fila de `conversa-sem-pedido.ts` de propósito: aquela só
// grava quando `body.scope` tem conteúdo NOVO no turno — e Marcos já é
// cliente conhecido, sem escopo a coletar, então aquele rastro nunca nasceria
// para esta conversa. Um compromisso tem de existir mesmo quando não há
// escopo nenhum sendo acumulado.
//
// ═══════════════════════════════════════════════════════════════════════════
// UM POR FIO, NÃO UM POR TURNO
// ═══════════════════════════════════════════════════════════════════════════
//
// A mesma régua de `conversa-sem-pedido.ts`: se o SDR escala duas vezes na
// mesma conversa, o SEGUNDO registro ATUALIZA o primeiro — não empilha um
// compromisso por trás do outro para o mesmo fio.

import { prisma } from "@/lib/db/client";
import { fioDaConversa } from "@/lib/agency/comercial/registro-da-conversa";

export const TIPO_COMPROMISSO_DO_SDR = "compromisso_do_sdr";

/** Teto do JSON guardado — o mesmo raciocínio de `conversa-sem-pedido.ts`:
 *  um compromisso é uma frase e uma data, não um documento. */
const TETO_DA_CARGA = 4_000;

export type CargaDoCompromisso = {
  v: 1;
  /** O trecho da promessa detectada — é ISSO que foi anunciado ao cliente. */
  texto: string;
  /** Quem deveria cumprir. Hoje sempre "PM": não existe ainda uma fila que
   *  aponte um responsável nomeado por escalação do SDR — ver a lacuna
   *  declarada no relato desta frente. */
  dono: string;
  prazoISO: string;
  criadoEm: string;
  /** O cliente real, quando o servidor sabe (convite de parceria resolvido).
   *  `null` é o caso comum (visitante anônimo) — nunca deduzido. */
  clientId: string | null;
  cumprido: boolean;
};

/** Lê a carga gravada no `message`. Ilegível vira `null` — quem chama decide
 *  o que fazer, e nenhum caminho trata `null` como "cumprido" nem "vencido". */
export function lerCargaDoCompromisso(message: string): CargaDoCompromisso | null {
  try {
    const bruto = JSON.parse(message) as unknown;
    if (!bruto || typeof bruto !== "object") return null;
    if ((bruto as CargaDoCompromisso).v !== 1) return null;
    return bruto as CargaDoCompromisso;
  } catch {
    return null;
  }
}

/**
 * O padrão desta casa quando o SDR promete escalar: se ele disse "ainda
 * hoje", o prazo é o FIM DO DIA CIVIL (hora do servidor) — nunca uma hora
 * específica que ninguém prometeu de verdade.
 *
 * Deliberadamente conservador: se o SDR prometeu menos tempo que isso (ex.:
 * "em 10 minutos"), o cliente recebe MAIS prazo do que a fala sugeria, nunca
 * menos — o inverso do defeito que esta fechadura existe para matar. E se já
 * passou do fim do dia (a conversa acontece de madrugada), o prazo vira o fim
 * do PRÓXIMO dia civil, para nunca nascer um compromisso já vencido.
 *
 * Função PURA — sem banco, sem sessão — para poder ser provada por si só.
 */
export function prazoPadraoDoCompromisso(agora: Date): Date {
  const fimDoDia = new Date(agora);
  fimDoDia.setHours(23, 59, 0, 0);
  if (fimDoDia.getTime() <= agora.getTime()) {
    fimDoDia.setDate(fimDoDia.getDate() + 1);
  }
  return fimDoDia;
}

/**
 * REGISTRA O COMPROMISSO — a fechadura em si.
 *
 * Chamado no MESMO ato em que o SDR anuncia uma escalação. `false` significa
 * "não registrei": quem chama (`app/api/sdr/chat/route.ts`) É QUEM DECIDE não
 * deixar a frase original sair — a régua desta casa é *sem fechadura, não se
 * promete*, e esta função nunca finge sucesso para simplificar quem chama.
 *
 * ⚠️ NUNCA LANÇA. Registro é nosso; a conversa é do cliente. Um erro de banco
 * aqui vira "não registrei" (e a fala é barrada como sempre), nunca uma tela
 * de erro para o prospect.
 */
export async function registrarCompromisso(input: {
  sessionId: unknown;
  /** `null` = sem dono resolvido. Sem workspace, não registra — mesma trava
   *  de `guardarRastroDaConversa`. */
  workspaceId: string | null;
  texto: string;
  dono: string;
  prazo: Date;
  /** O cliente DERIVADO do convite de parceria pelo servidor — nunca do
   *  corpo. Ver o cabeçalho de `conversa-sem-pedido.ts`, a mesma trava. */
  clientId?: string | null;
}): Promise<boolean> {
  if (!input.workspaceId) return false;
  const texto = (input.texto ?? "").trim();
  if (!texto) return false;

  const fio = fioDaConversa(input.sessionId);
  // `fioDaConversa` devolve `sdr:sem-sessao` para entrada vazia — um balde
  // coletivo, não a conversa de ninguém em particular. Registrar aqui
  // colidiria compromissos de pessoas diferentes num único fio.
  if (fio.endsWith("sem-sessao")) return false;

  const carga: CargaDoCompromisso = {
    v: 1,
    texto: texto.slice(0, 500),
    dono: (input.dono || "PM").slice(0, 100),
    prazoISO: input.prazo.toISOString(),
    criadoEm: new Date().toISOString(),
    clientId: input.clientId ?? null,
    cumprido: false,
  };
  const message = JSON.stringify(carga).slice(0, TETO_DA_CARGA);

  try {
    const existente = await prisma.activityEvent.findFirst({
      where: { type: TIPO_COMPROMISSO_DO_SDR, clientId: fio },
      select: { id: true },
    });
    if (existente) {
      // Escalou duas vezes na mesma conversa: ATUALIZA, não empilha — e o
      // prazo RECOMEÇA a contar do novo anúncio, que é o que de fato foi dito
      // ao cliente desta vez.
      await prisma.activityEvent.update({
        where: { id: existente.id },
        data: { message, timestamp: new Date() },
      });
    } else {
      await prisma.activityEvent.create({
        data: { workspaceId: input.workspaceId, type: TIPO_COMPROMISSO_DO_SDR, clientId: fio, message },
      });
    }
    return true;
  } catch (e) {
    console.error(`[compromisso-do-sdr] não registrado: ${e instanceof Error ? e.message : String(e)}`);
    return false;
  }
}

/**
 * FECHA O COMPROMISSO — chamado quando o que foi prometido de fato aconteceu
 * (ex.: um humano respondeu Marcos). Best-effort: se falhar, o compromisso
 * segue aberto e será visto como vencido mais tarde — o que é seguro, porque
 * um falso atraso é bem menos grave que um falso cumprimento.
 */
export async function marcarCompromissoCumprido(sessionId: unknown): Promise<boolean> {
  const fio = fioDaConversa(sessionId);
  if (fio.endsWith("sem-sessao")) return false;
  try {
    const linha = await prisma.activityEvent.findFirst({
      where: { type: TIPO_COMPROMISSO_DO_SDR, clientId: fio },
      select: { id: true, message: true },
    });
    if (!linha) return false;
    const carga = lerCargaDoCompromisso(linha.message);
    if (!carga) return false;
    const nova: CargaDoCompromisso = { ...carga, cumprido: true };
    await prisma.activityEvent.update({
      where: { id: linha.id },
      data: { message: JSON.stringify(nova).slice(0, TETO_DA_CARGA) },
    });
    return true;
  } catch (e) {
    console.error(`[compromisso-do-sdr] não fechado: ${e instanceof Error ? e.message : String(e)}`);
    return false;
  }
}

export type CompromissoAberto = {
  fio: string;
  workspaceId: string;
  /** O nome do cliente, quando `clientId` está gravado — resolvido aqui, não
   *  em quem chama, para a tela e o alarme nunca divergirem sobre quem é
   *  quem. */
  clienteNome: string | null;
  texto: string;
  dono: string;
  prazo: Date;
  registradoEm: Date;
};

/**
 * TODOS os compromissos ainda não cumpridos, de TODOS os workspaces — uso
 * exclusivo do relógio (`despertador.ts`), que não tem sessão e precisa
 * varrer a casa inteira. Toda porta com gente do outro lado filtraria por
 * `workspaceId` da sessão; aqui não há sessão nenhuma.
 *
 * Nunca lança: uma leitura que falha vira lista vazia, e o relógio marca a
 * PERNA como falha (ver `despertador.ts`) — não o compromisso como cumprido.
 */
export async function compromissosAbertos(): Promise<CompromissoAberto[]> {
  const linhas = await prisma.activityEvent.findMany({
    where: { type: TIPO_COMPROMISSO_DO_SDR },
    select: { clientId: true, workspaceId: true, message: true },
  });

  const cargas: Array<{ fio: string; workspaceId: string; carga: CargaDoCompromisso }> = [];
  const clientIds = new Set<string>();
  for (const l of linhas) {
    // Carga ilegível não derruba a lista inteira — mesma régua de
    // `conversasSemPedido`.
    const carga = lerCargaDoCompromisso(l.message);
    if (!carga || carga.cumprido) continue;
    cargas.push({ fio: l.clientId ?? "", workspaceId: l.workspaceId, carga });
    if (carga.clientId) clientIds.add(carga.clientId);
  }
  if (cargas.length === 0) return [];

  const nomes = clientIds.size > 0
    ? await prisma.client.findMany({
        where: { id: { in: [...clientIds] } },
        select: { id: true, name: true },
      }).catch(() => [] as Array<{ id: string; name: string }>)
    : [];
  const nomePorId = new Map(nomes.map((c) => [c.id, c.name] as const));

  return cargas.map(({ fio, workspaceId, carga }) => ({
    fio,
    workspaceId,
    clienteNome: carga.clientId ? nomePorId.get(carga.clientId) ?? null : null,
    texto: carga.texto,
    dono: carga.dono,
    prazo: new Date(carga.prazoISO),
    registradoEm: new Date(carga.criadoEm),
  }));
}

/** Os que já VENCERAM — a metade que GRITA. Função pura: recebe a lista já
 *  lida, para poder ser provada sem banco e sem relógio de verdade. */
export function compromissosVencidos(
  abertos: readonly CompromissoAberto[],
  agora: Date = new Date(),
): CompromissoAberto[] {
  return abertos.filter((c) => c.prazo.getTime() < agora.getTime());
}

/** A frase do alarme — nome do cliente, o que foi prometido, há quanto
 *  tempo. Pura, para o mesmo motivo das duas acima. */
export function fraseDoCompromissoVencido(c: CompromissoAberto, agora: Date = new Date()): string {
  const atrasoMin = Math.max(0, Math.round((agora.getTime() - c.prazo.getTime()) / 60_000));
  const atraso =
    atrasoMin < 60
      ? `${atrasoMin} min`
      : atrasoMin < 24 * 60
        ? `${Math.round(atrasoMin / 60)}h`
        : `${Math.round(atrasoMin / (24 * 60))}d`;
  const quem = c.clienteNome ?? `conversa ${c.fio}`;
  return `${quem}: o SDR prometeu "${c.texto}" (dono: ${c.dono}) — vencido há ${atraso} e ninguém cumpriu.`;
}
