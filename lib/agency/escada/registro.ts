// A escada, no banco — quem lê, quem escreve e quem tem permissão de subir.
//
// Regra de existência deste arquivo: NENHUM estado gravado que ninguém lê. Cada
// coisa escrita aqui tem um leitor nomeado:
//
//   • `DepartmentLadder.degrau`      → lido por `escadaFiltraEntregas`, que é
//     chamada por `esteira/marcos.ts` e `esteira/mes.ts` no exato ponto em que a
//     entrega vira "compartilhado". Sem esse leitor, a escada seria decoração —
//     o defeito das 31 checagens, repetido com outra roupa.
//   • `DepartmentLadderRecord`       → lido por `avaliarSubida`, que é o único
//     caminho para um degrau subir.
//   • `provaJson`                    → lido pela tela/API (`/api/agency/escada`)
//     e pelo relatório: é a prova congelada da última subida.

import { prisma } from "@/lib/db/client";
import {
  degrauDeclarado, departamentoDoAgente, departamentosDaCasa, decidirEntrega,
  avaliarSubida, alturaDo, JANELA_DE_EVIDENCIA_DIAS,
  type Degrau, type EstadoDoDegrau, type ResultadoDaPeca, type AvaliacaoDeSubida,
} from "./degraus";
export { departamentosDaCasa } from "./degraus";
// ── O PORTÃO DE MARCA ENTRA AQUI, E NÃO EM CADA CHAMADOR (15/08/2026) ────────
// `escadaFiltraEntregas` é o ÚNICO ponto por onde uma entrega vira
// "compartilhado": `marcos.ts`, `mes.ts`, `producao-de-pedido.ts` e
// `escada/repescagem.ts` passam todos por aqui. Um portão posto em `marcos.ts`
// seria contornado pela repescagem — que existe justamente para soltar depois o
// que ficou retido antes. Portão fora do choke point não é portão.
import { portaoDeMarca, ehPecaDeMarca } from "@/lib/agency/esteira/contrato-de-marca";

function lerClientes(json: string | null | undefined): string[] {
  try {
    const v = JSON.parse(json ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    // JSON quebrado não é "todos liberados". É lista vazia — fail-closed.
    return [];
  }
}

// ── SEMEADURA ────────────────────────────────────────────────────────────────

/**
 * Cria as linhas que faltam. Idempotente, e roda barato depois da primeira vez.
 *
 * ── O PROBLEMA REAL QUE ESTA FUNÇÃO RESOLVE ────────────────────────────────
 * Se a escada nascesse com todo mundo em SOMBRA, ela pararia a agência no dia 1
 * — exatamente o defeito pelo qual a inversão do default do registry está
 * segurada. Mas conceder WIDE a todos para "não parar nada" seria escrever
 * `wide` sem evidência nenhuma, e aí a escada não existiria.
 *
 * A saída não é opinião, é o que o banco já diz: departamento que JÁ entregava
 * a um cliente nasce em ALLOWLIST **com exatamente aqueles clientes**. Nada muda
 * para quem já era atendido, e nenhum cliente NOVO recebe a saída de um
 * departamento que nunca provou nada. Quem nunca entregou nasce em SOMBRA, que é
 * o degrau de nascimento.
 *
 * WIDE nunca é semeado. Para chegar lá, só pela evidência.
 */
export async function garantirEscada(workspaceId: string): Promise<void> {
  const ids = departamentosDaCasa();
  const existentes: Array<{ departmentId: string }> = await prisma.departmentLadder.findMany({
    where: { workspaceId },
    select: { departmentId: true },
  });
  const jaTem = new Set(existentes.map((e) => e.departmentId));
  const faltando = ids.filter((id) => !jaTem.has(id));
  if (faltando.length === 0) return;

  // O histórico REAL: que departamento já teve peça marcada "compartilhado",
  // e para quais clientes.
  const jaEntregues = await prisma.deliverable.findMany({
    where: { visibility: "compartilhado", project: { workspaceId } },
    select: { ownerAgentId: true, project: { select: { clientId: true } } },
  }).catch(() => [] as Array<{ ownerAgentId: string | null; project: { clientId: string } | null }>);

  const herdado = new Map<string, Set<string>>();
  for (const d of jaEntregues) {
    const dept = departamentoDoAgente(d.ownerAgentId);
    const cliente = d.project?.clientId;
    if (!dept || !cliente) continue;
    if (!herdado.has(dept)) herdado.set(dept, new Set());
    herdado.get(dept)!.add(cliente);
  }

  for (const departmentId of faltando) {
    const clientes = [...(herdado.get(departmentId) ?? [])];
    const temHistorico = clientes.length > 0;
    await prisma.departmentLadder.create({
      data: {
        workspaceId,
        departmentId,
        degrau: temHistorico ? "allowlist" : "sombra",
        clientesLiberados: JSON.stringify(clientes),
        motivo: temHistorico
          ? `herdado da operação: já entregava a ${clientes.length} cliente(s) antes da escada existir. Nenhum cliente novo entra sem evidência.`
          : "degrau de nascimento — nunca entregou nada a cliente nenhum nesta casa.",
        decididoPor: "escada:semeadura",
        provaJson: JSON.stringify({ origem: "historico_de_entregas", clientes: clientes.length }),
      },
    }).catch(() => { /* corrida entre dois processos: o unique resolve, e quem perdeu não precisa fazer nada */ });
  }
}

// ── LEITURA ──────────────────────────────────────────────────────────────────

export interface DegrauNaCasa extends EstadoDoDegrau {
  motivo: string | null;
  decididoPor: string | null;
  prova: unknown;
  atualizadoEm: Date;
  /** O que falta, em número, para subir. `null` no topo. */
  subida: AvaliacaoDeSubida | null;
}

export async function estadoDaEscada(workspaceId: string): Promise<DegrauNaCasa[]> {
  await garantirEscada(workspaceId);
  const linhas = await prisma.departmentLadder.findMany({ where: { workspaceId } });
  const desde = new Date(Date.now() - JANELA_DE_EVIDENCIA_DIAS * 24 * 60 * 60_000);
  const registros = await prisma.departmentLadderRecord.findMany({
    where: { workspaceId, criadoEm: { gte: desde } },
    select: { departmentId: true, resultado: true, clientId: true },
  }).catch(() => [] as Array<{ departmentId: string; resultado: string; clientId: string | null }>);

  const porDept = new Map<string, Array<{ resultado: string; clientId: string | null }>>();
  for (const r of registros) {
    if (!porDept.has(r.departmentId)) porDept.set(r.departmentId, []);
    porDept.get(r.departmentId)!.push({ resultado: r.resultado, clientId: r.clientId });
  }

  return linhas
    .map((l) => {
      const degrau = degrauDeclarado(l.degrau);
      return {
        departmentId: l.departmentId,
        degrau,
        clientesLiberados: lerClientes(l.clientesLiberados),
        motivo: l.motivo,
        decididoPor: l.decididoPor,
        prova: (() => { try { return JSON.parse(l.provaJson); } catch { return {}; } })(),
        atualizadoEm: l.updatedAt,
        subida: avaliarSubida(degrau, porDept.get(l.departmentId) ?? []),
      };
    })
    .sort((a, b) => alturaDo(b.degrau) - alturaDo(a.degrau) || a.departmentId.localeCompare(b.departmentId));
}

// ── O PONTO EM QUE A ESCADA DECIDE ───────────────────────────────────────────

export interface EntregaCandidata {
  id: string;
  ownerAgentId: string | null;
}

export interface FiltroDaEscada {
  /** Ids que PODEM ir ao cliente. */
  liberados: string[];
  /** Ids retidos, com o motivo concreto — vai para o `ActivityEvent`. */
  retidos: Array<{ id: string; departmentId: string | null; motivo: string }>;
}

/**
 * O portão da escada, no exato ponto em que a peça viraria "compartilhado".
 *
 * Não lança NUNCA por erro de banco: falha de leitura retém tudo (fail-closed)
 * em vez de liberar tudo. Reter é um alarme que a equipe resolve; liberar é uma
 * peça publicada em nome de um cliente pagante.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * A PORTA PRINCIPAL PASSOU A LER A MESMA FONTE DA PORTA LATERAL (25/08/2026)
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Medido em produção, com 64 segundos entre os dois fatos:
 *
 *   17:02:12 — ESTA função reteve a peça: "design está em ALLOWLIST e o
 *              cliente não está na lista" → o pedido parou em `precisa_decisao`;
 *   17:03:16 — o despertador aplicou `DECISOES_DO_DONO` e incluiu a MESMA
 *              cliente, sozinho, na lista de `design`.
 *
 * **A casa recusava o que ela mesma liberava um minuto depois.**
 *
 * O conserto anterior (08/2026) ensinou a decisão do dono à porta MANUAL
 * (`liberarCliente`, abaixo) e parou ali. Mas a porta manual não é a que retém
 * a peça — é esta. O conserto fechou a porta lateral e deixou a principal
 * aberta, e por isso o defeito continuou vivo com a régua verde em cima.
 *
 * ── QUAL DAS DUAS É A REGRA ───────────────────────────────────────────────
 *
 * A decisão do dono, pelo mesmo motivo já registrado em `decisoes-do-dono.ts`:
 * é ela que tem PROCEDÊNCIA — datada, assinada, com a fala literal, versionada
 * em código e validada por `recusarDecisao`. A lista gravada em
 * `DepartmentLadder.clientesLiberados` não é uma segunda verdade: é o CACHE
 * que o relógio materializa a partir da decisão. Verdade escrita em dois
 * lugares já está errada em um deles — então este portão passou a ler a fonte,
 * e não só o cache.
 *
 * ── A FONTE É UMA SÓ, POR IDENTIDADE ──────────────────────────────────────
 *
 * As duas portas chamam **a mesma função**, `decisaoQueCobre`. Não são duas
 * cópias que hoje concordam: é uma função só, com um chamador a mais. Se ela
 * for trocada, as duas portas mudam juntas — e o teste desta casa prova isso
 * substituindo a função e exigindo que AS DUAS mudem de resposta. Duas tabelas
 * gêmeas passariam num teste de igualdade de valor; nenhuma passa neste.
 *
 * ── O QUE **NÃO** FOI AFROUXADO ───────────────────────────────────────────
 *
 * Nada. `liberarCliente` continua exigindo a mesma evidência, byte por byte,
 * para todo cliente que nenhuma decisão cobre. A escada continua de pé: quem a
 * decisão não nomeia não passa por aqui — nem por evidência que este portão
 * não sabe medir. O que este portão ganhou foi CONHECER a exceção declarada, e
 * conceder em nome dela exatamente o que o relógio concederia sozinho na
 * rodada seguinte. `wide` continua se conquistando só com número.
 */
export async function escadaFiltraEntregas(p: {
  workspaceId: string;
  clientId: string | null;
  entregas: EntregaCandidata[];
}): Promise<FiltroDaEscada> {
  if (p.entregas.length === 0) return { liberados: [], retidos: [] };

  let linhas: Array<{ departmentId: string; degrau: string; clientesLiberados: string }>;
  try {
    await garantirEscada(p.workspaceId);
    linhas = await prisma.departmentLadder.findMany({
      where: { workspaceId: p.workspaceId },
      select: { departmentId: true, degrau: true, clientesLiberados: true },
    });
  } catch (e) {
    return {
      liberados: [],
      retidos: p.entregas.map((d) => ({
        id: d.id,
        departmentId: departamentoDoAgente(d.ownerAgentId),
        motivo: `não consegui ler a escada (${e instanceof Error ? e.message : "erro"}) — fail-closed: nada é compartilhado`,
      })),
    };
  }

  const porId = new Map<string, EstadoDoDegrau>(
    linhas.map((l) => [l.departmentId, {
      departmentId: l.departmentId,
      degrau: degrauDeclarado(l.degrau),
      clientesLiberados: lerClientes(l.clientesLiberados),
    }]),
  );

  // A decisão do dono, perguntada UMA VEZ por departamento nesta chamada. O
  // cache é do escopo da chamada e morre com ela: guardá-lo entre chamadas
  // criaria a terceira verdade, que é o defeito de novo com outra roupa.
  const jaPerguntei = new Map<string, boolean>();
  async function decisaoLibera(departmentId: string): Promise<boolean> {
    const emCache = jaPerguntei.get(departmentId);
    if (emCache !== undefined) return emCache;
    let cobre = false;
    try {
      // Import dinâmico pelo mesmo motivo de `liberarCliente`: manter este
      // módulo carregável sem arrastar a lista de decisões no caminho quente.
      const { decisaoQueCobre } = await import("./decisoes-do-dono");
      cobre = (await decisaoQueCobre({
        workspaceId: p.workspaceId,
        departmentId,
        clientId: p.clientId!,
      })) !== null;
    } catch {
      // Não consegui ler a decisão = não sei se cobre = não cobre. Fail-closed:
      // a régua da lista continua valendo, e a peça fica retida.
      cobre = false;
    }
    jaPerguntei.set(departmentId, cobre);
    return cobre;
  }

  // ── O PORTÃO DE MARCA, ANTES DO DEGRAU ───────────────────────────────────
  //
  // Consultado UMA vez por chamada, e só quando há peça de marca no lote: o
  // contrato lê ficha, proibições e material, e pagar isso para um lote que só
  // tem relatório seria custo sem pergunta.
  //
  // Ordem do CEO (15/08/2026): "marca sem régua, peça não sai". A recusa é
  // BLOQUEANTE — a entrega vai para `retidos`, exatamente como a retida pelo
  // degrau, e `retidos` é o que NUNCA vira `visibility: "compartilhado"`.
  const temPecaDeMarca = p.entregas.some((e) => ehPecaDeMarca(departamentoDoAgente(e.ownerAgentId)));
  const marca = temPecaDeMarca
    ? await portaoDeMarca(p.clientId).catch(() => ({
        pode: false,
        motivo: "não consegui consultar a régua de marca — fail-closed: a peça não é compartilhada",
      }))
    : { pode: true, motivo: "" };

  const liberados: string[] = [];
  const retidos: FiltroDaEscada["retidos"] = [];
  for (const entrega of p.entregas) {
    const dept = departamentoDoAgente(entrega.ownerAgentId);
    // Antes do degrau, de propósito: um departamento em WIDE não compra o
    // direito de entregar peça de uma marca sobre a qual a casa não sabe nada.
    if (!marca.pode && ehPecaDeMarca(dept)) {
      retidos.push({ id: entrega.id, departmentId: dept, motivo: marca.motivo });
      continue;
    }
    const estado = dept ? porId.get(dept) ?? null : null;
    const veredito = decidirEntrega(estado, p.clientId);
    if (veredito.chega) {
      liberados.push(entrega.id);
      continue;
    }
    // ── A SEGUNDA PERGUNTA, E SÓ PARA QUEM A PRIMEIRA RETEVE ────────────────
    //
    // Só entra aqui o caso que o relógio resolveria sozinho na rodada seguinte:
    // departamento conhecido, cliente identificado, e degrau que
    // `aplicarDecisoesDoDono` mexeria (ou seja: nada acima de allowlist — em
    // `wide` a lista não tem efeito, e a decisão do dono nunca desce ninguém).
    //
    // Estado NULO entra de propósito: `aplicarDecisoesDoDono` CRIA a linha do
    // departamento coberto. Deixá-lo de fora reproduziria o mesmo desencontro
    // de um minuto, com o departamento sem linha em vez de com lista curta.
    const podeSubirPelaDecisao = !estado || alturaDo(estado.degrau) <= alturaDo("allowlist");
    if (dept && p.clientId && podeSubirPelaDecisao && (await decisaoLibera(dept))) {
      liberados.push(entrega.id);
      continue;
    }
    retidos.push({
      id: entrega.id,
      departmentId: dept,
      motivo: dept
        ? veredito.motivo ?? "retida pela escada"
        : `executor "${entrega.ownerAgentId ?? "(vazio)"}" não pertence a departamento conhecido — fail-closed: retida`,
    });
  }
  return { liberados, retidos };
}

// ── ESCRITA DO NUMERADOR/DENOMINADOR ─────────────────────────────────────────

/**
 * Um registro por peça produzida — inclusive as que morreram no portão.
 *
 * Best-effort de propósito: perder um registro atrasa uma promoção, e derrubar a
 * produção por causa dele seria trocar um risco pequeno por um grande. Mas o
 * erro NÃO some: sem registro, a evidência simplesmente não acumula, e o
 * departamento fica onde está — que é o lado certo para errar.
 */
export async function registrarProducao(p: {
  workspaceId: string;
  departmentId: string;
  projectId?: string | null;
  clientId?: string | null;
  deliverableId?: string | null;
  degrauNaEpoca: Degrau;
  resultado: ResultadoDaPeca;
  detalhe?: string | null;
  /** QUAL IA produziu. Nulo = não sei — e "não sei" nunca é somado ao provedor
   *  da casa: um provedor em teste não pode herdar a reputação do titular. */
  provedor?: string | null;
}): Promise<void> {
  // `try/catch` e não `.catch()` no fim da promessa: os dois NÃO são a mesma
  // coisa. `.catch()` só pega a rejeição — se o cliente do banco não tiver a
  // tabela (teste com dublê incompleto, migração não rodada), o acesso à
  // propriedade estoura ANTES de existir promessa, e a exceção síncrona passa
  // por cima do `.catch` e derruba a produção inteira. Um contador de evidência
  // não pode ser capaz de parar a agência.
  try {
    await prisma.departmentLadderRecord.create({
      data: {
        workspaceId: p.workspaceId,
        departmentId: p.departmentId,
        projectId: p.projectId ?? null,
        clientId: p.clientId ?? null,
        deliverableId: p.deliverableId ?? null,
        degrauNaEpoca: p.degrauNaEpoca,
        resultado: p.resultado,
        detalhe: p.detalhe?.slice(0, 500) ?? null,
        provedor: p.provedor ?? null,
      },
    });
  } catch { /* best-effort: sem registro, a evidência não acumula e o
      departamento fica onde está — que é o lado certo para errar. */ }
}

/** Em que degrau este departamento está AGORA (para carimbar no registro). */
export async function degrauAtual(workspaceId: string, departmentId: string): Promise<Degrau> {
  try {
    const l = await prisma.departmentLadder.findUnique({
      where: { workspaceId_departmentId: { workspaceId, departmentId } },
      select: { degrau: true },
    });
    return degrauDeclarado(l?.degrau);
  } catch {
    // Não sei o degrau → sombra. É só um carimbo de registro; errar para o lado
    // de "sombra" subestima a evidência, e subestimar nunca promove ninguém.
    return "sombra";
  }
}

// ── SUBIR E DESCER ───────────────────────────────────────────────────────────

export interface ResultadoDaMudanca {
  ok: boolean;
  degrau: Degrau;
  erro?: string;
  faltam?: string[];
  /**
   * POR QUE ISTO FOI CONCEDIDO SEM EVIDÊNCIA.
   *
   * Só é preenchido quando a mudança saiu por uma DECISÃO DO DONO declarada. É
   * o oposto de uma exceção silenciosa: quem chama a rota recebe, na resposta,
   * a decisão que autorizou — id, data, quem, e a frase.
   */
  porDecisaoDoDono?: { id: string; quem: string; em: string; motivo: string };
}

/**
 * Sobe UM degrau, e só com o número na mão.
 *
 * Não existe parâmetro de força. Foi decisão consciente: um `{ forcar: true }`
 * aqui viraria o caminho normal na primeira sexta-feira apertada, e a escada
 * inteira passaria a ser um campo de texto.
 */
export async function subirDegrau(p: {
  workspaceId: string;
  departmentId: string;
  quem: string;
}): Promise<ResultadoDaMudanca> {
  await garantirEscada(p.workspaceId);
  const linha = await prisma.departmentLadder.findUnique({
    where: { workspaceId_departmentId: { workspaceId: p.workspaceId, departmentId: p.departmentId } },
  });
  const atual = degrauDeclarado(linha?.degrau);
  const desde = new Date(Date.now() - JANELA_DE_EVIDENCIA_DIAS * 24 * 60 * 60_000);
  const registros = await prisma.departmentLadderRecord.findMany({
    where: { workspaceId: p.workspaceId, departmentId: p.departmentId, criadoEm: { gte: desde } },
    select: { resultado: true, clientId: true },
  }).catch(() => [] as Array<{ resultado: string; clientId: string | null }>);

  const avaliacao = avaliarSubida(atual, registros);
  if (!avaliacao) return { ok: false, degrau: atual, erro: "já está no topo da escada (wide)" };
  if (!avaliacao.pode) {
    return { ok: false, degrau: atual, erro: "evidência insuficiente", faltam: avaliacao.faltam };
  }

  await prisma.departmentLadder.update({
    where: { workspaceId_departmentId: { workspaceId: p.workspaceId, departmentId: p.departmentId } },
    data: {
      degrau: avaliacao.alvo,
      motivo: `subiu para ${avaliacao.alvo} com ${avaliacao.contagem.aprovadas} entrega(s) aprovada(s) em ${JANELA_DE_EVIDENCIA_DIAS} dias, ${avaliacao.contagem.clientesDistintos} cliente(s) distinto(s).`,
      decididoPor: p.quem,
      // A prova congelada: a janela move, e sem isto ninguém consegue conferir
      // depois com que número a subida aconteceu.
      provaJson: JSON.stringify({ em: new Date().toISOString(), de: atual, para: avaliacao.alvo, contagem: avaliacao.contagem, criterio: avaliacao.criterio }),
    },
  });
  return { ok: true, degrau: avaliacao.alvo };
}

/**
 * Desce. Sem pergunta, sem evidência, imediato.
 *
 * A assimetria é o ponto: quem viu fumaça precisa conseguir fechar a porta em um
 * comando. Exigir justificativa numérica para DESCER é o mesmo que atrasar a
 * contenção — e contenção atrasada é o incidente inteiro.
 */
export async function descerDegrau(p: {
  workspaceId: string;
  departmentId: string;
  para?: Degrau;
  motivo: string;
  quem: string;
}): Promise<ResultadoDaMudanca> {
  await garantirEscada(p.workspaceId);
  const linha = await prisma.departmentLadder.findUnique({
    where: { workspaceId_departmentId: { workspaceId: p.workspaceId, departmentId: p.departmentId } },
  });
  const atual = degrauDeclarado(linha?.degrau);
  const alvo: Degrau = p.para ?? "sombra";
  if (alturaDo(alvo) >= alturaDo(atual)) {
    return { ok: false, degrau: atual, erro: `descer é para BAIXO — ${alvo} não é abaixo de ${atual}. Para subir, use subirDegrau (que exige evidência).` };
  }
  await prisma.departmentLadder.update({
    where: { workspaceId_departmentId: { workspaceId: p.workspaceId, departmentId: p.departmentId } },
    data: {
      degrau: alvo,
      motivo: `desceu de ${atual} para ${alvo}: ${p.motivo}`,
      decididoPor: p.quem,
      provaJson: JSON.stringify({ em: new Date().toISOString(), de: atual, para: alvo, motivo: p.motivo }),
    },
  });
  return { ok: true, degrau: alvo };
}

/**
 * Põe um cliente na allowlist de um departamento.
 *
 * Exige a MESMA evidência do degrau de allowlist. Sem isto, a lista seria a
 * porta dos fundos: o departamento fica em "allowlist" com um cliente herdado e
 * alguém acrescenta os outros nove à mão — wide sem nunca ter subido.
 *
 * ── A EXCEÇÃO QUE JÁ EXISTIA, E QUE ESTA PORTA NÃO CONHECIA (25/08/2026) ────
 *
 * Medido em produção: às 13:47 a escada RETEVE um Story ("design está em
 * ALLOWLIST e o cliente não está na lista"); às 13:48 o despertador aplicou
 * `DECISOES_DO_DONO` e incluiu o mesmo cliente sozinho. E esta função, chamada
 * pela porta certa (`POST /api/agency/escada`, ação `liberar_cliente`), recusou
 * com 409 "evidência insuficiente".
 *
 * Duas verdades sobre a mesma liberação, e a casa obedecia às duas — que é como
 * uma escada vira enfeite: quem quisesse o resultado esperava cinco minutos
 * pelo relógio em vez de passar pela porta que pergunta.
 *
 * A regra é a decisão do dono, porque é ela que tem PROCEDÊNCIA (datada,
 * assinada, com a fala literal, versionada, validada). Então quem obedece é
 * esta função — **e a régua de evidência não foi afrouxada em um milímetro**:
 * ela continua valendo, inteira, para todo cliente que a decisão não cobre.
 * O que esta porta ganhou foi CONHECER a decisão, e conceder em nome dela
 * exatamente o que o relógio concederia sozinho na rodada seguinte.
 */
export async function liberarCliente(p: {
  workspaceId: string;
  departmentId: string;
  clientId: string;
  quem: string;
}): Promise<ResultadoDaMudanca> {
  await garantirEscada(p.workspaceId);
  const linha = await prisma.departmentLadder.findUnique({
    where: { workspaceId_departmentId: { workspaceId: p.workspaceId, departmentId: p.departmentId } },
  });
  const atual = degrauDeclarado(linha?.degrau);
  if (atual !== "allowlist") {
    return { ok: false, degrau: atual, erro: `só faz sentido em allowlist — o departamento está em ${atual}` };
  }
  // ── A DECISÃO DO DONO, PERGUNTADA ANTES DA EVIDÊNCIA ──────────────────────
  //
  // Antes, e não depois: se a decisão cobre este cliente, a resposta certa é
  // "sim, por esta decisão" — e devolver primeiro um 409 de evidência sobre um
  // caso já autorizado é justamente a contradição medida em 25/08/2026.
  //
  // Import dinâmico porque `decisoes-do-dono.ts` importa deste módulo
  // (`degraus`), e um import estático cruzado aqui fecharia o ciclo.
  const { decisaoQueCobre, provaDaDecisao } = await import("./decisoes-do-dono");
  // `try/catch` e não `.catch()`: os dois NÃO são a mesma coisa. `.catch()` só
  // pega a rejeição — uma exceção SÍNCRONA (a fonte quebrada, o módulo trocado)
  // passa por cima dele e derruba a rota inteira, em vez de cair de volta na
  // régua de evidência, que é o lado seguro. É o mesmo cuidado de
  // `registrarProducao`, e aqui ele foi medido faltando.
  let cobertura: Awaited<ReturnType<typeof decisaoQueCobre>> = null;
  try {
    cobertura = await decisaoQueCobre({
      workspaceId: p.workspaceId,
      departmentId: p.departmentId,
      clientId: p.clientId,
    });
  } catch {
    cobertura = null;
  }

  if (cobertura) {
    const lista = new Set(lerClientes(linha?.clientesLiberados));
    lista.add(p.clientId);
    await prisma.departmentLadder.update({
      where: { workspaceId_departmentId: { workspaceId: p.workspaceId, departmentId: p.departmentId } },
      data: {
        clientesLiberados: JSON.stringify([...lista]),
        // A assinatura diz as DUAS coisas: qual decisão autorizou e quem pediu.
        // "decidido por: usuario:42" sozinho esconderia que a autorização não
        // era dele.
        decididoPor: `decisao-do-dono:${cobertura.decisao.id} (pedido por ${p.quem})`,
        motivo: cobertura.motivo,
        provaJson: provaDaDecisao({
          decisao: cobertura.decisao, de: atual, para: atual, clientes: [...lista], porQuem: p.quem,
        }),
      },
    });
    return {
      ok: true,
      degrau: atual,
      porDecisaoDoDono: {
        id: cobertura.decisao.id, quem: cobertura.decisao.quem,
        em: cobertura.decisao.em, motivo: cobertura.motivo,
      },
    };
  }

  const desde = new Date(Date.now() - JANELA_DE_EVIDENCIA_DIAS * 24 * 60 * 60_000);
  const registros = await prisma.departmentLadderRecord.findMany({
    where: { workspaceId: p.workspaceId, departmentId: p.departmentId, criadoEm: { gte: desde } },
    select: { resultado: true, clientId: true },
  }).catch(() => [] as Array<{ resultado: string; clientId: string | null }>);
  // A régua é a de ENTRAR em allowlist, aplicada a cada novo cliente.
  // INTOCADA: quem a decisão do dono não cobre continua precisando do número.
  const avaliacao = avaliarSubida("sombra", registros);
  if (!avaliacao?.pode) {
    return {
      ok: false, degrau: atual,
      erro:
        "evidência insuficiente para liberar mais um cliente — e nenhuma decisão do dono declarada cobre " +
        "este cliente neste departamento",
      faltam: avaliacao?.faltam ?? [],
    };
  }
  const lista = new Set(lerClientes(linha?.clientesLiberados));
  lista.add(p.clientId);
  await prisma.departmentLadder.update({
    where: { workspaceId_departmentId: { workspaceId: p.workspaceId, departmentId: p.departmentId } },
    data: { clientesLiberados: JSON.stringify([...lista]), decididoPor: p.quem },
  });
  return { ok: true, degrau: atual };
}
