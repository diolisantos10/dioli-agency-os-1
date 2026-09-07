// O RETRATO DOS CONVITES — o estado de cada `ConviteDeParceria`, sem terminal
// e sem o parceiro ter que voltar para provar que algo quebrou.
//
// ═══ O BURACO QUE ISTO FECHA (29/08/2026) ═══════════════════════════════════
//
// `resolverConviteDeParceria` (`./convite-de-parceria.ts`) só GRITA
// (`[CONVITE-RECUSADO]`) quando alguém volta ao site com o link na mão. Se um
// convite nasceu apontando para o cadastro errado — o caso investigado em
// `docs/diagnosticos/fusao-de-cliente-duplicado.md`, onde a FOOCCI nasceu
// DUAS VEZES com sete segundos de diferença —, ninguém descobre até o
// parceiro reclamar. Este módulo é a régua que mede isso ANTES da reclamação.
//
// ═══ MÓDULO PURO — sem Prisma, sem banco ════════════════════════════════════
//
// Recebe linhas JÁ LIDAS (a rota que lê é `app/api/piloto/diagnostico/route.ts`)
// e devolve o retrato. A decisão sobre CADA convite vem de `decidirConvite`
// (`./regra-do-convite.ts`) — a MESMA função que `examinarConviteDeParceria`
// usa em produção. Reimplementar a decisão aqui seria abrir a porta para as
// duas divergirem, e aí o diagnóstico mentiria sobre o que a casa realmente
// faz.
//
// ═══ A DENÚNCIA DE CLIENTE DUPLICADO ════════════════════════════════════════
//
// Clientes cujo NOME normalizado colide (minúsculo, sem acento, espaço
// duplo colapsado) formam um grupo. Para cada cliente do grupo, dizemos se
// ele tem parceria viva — é essa comparação que responde à pergunta do
// Marcos: se o convite dele aponta para o cadastro SEM parceria viva, e o
// outro cadastro (do mesmo nome) TEM, a causa está achada.
//
// ═══ O QUE NUNCA SAI DAQUI ═══════════════════════════════════════════════════
//
// ⛔ O token inteiro — nem aqui, nem em log. Só os 8 primeiros caracteres.
// ⛔ Qualquer PII (e-mail, telefone, frase de conversa, nome de cliente — cru
//    OU normalizado). Um convite carrega só o `clientId`. O grupo de nome
//    colidente USA o nome para agrupar (`normalizarNome`) e não o emite: sai
//    só `id`, `temParceriaViva` e `tamanho` do grupo. Corrigido em 07/09/2026
//    (`.despachos/F5-duplicado-sem-nome.md`) — a versão anterior devolvia o
//    nome na mesma rota cuja chave trafega em `?chave=`.
import { decidirConvite, parceriaEstaViva, type LinhaDeConvite, type LinhaDeParceria, type MotivoDaRecusaDoConvite } from "./regra-do-convite";

/** Um convite, como a rota o lê do banco. */
export type LinhaDeConviteBruta = {
  token: string;
  clientId: string;
  expiraEm: Date;
  revogadoEm: Date | null;
  usos: number;
  ultimoUsoEm: Date | null;
};

/** Uma parceria, como a rota a lê do banco. */
export type LinhaDeParceriaBruta = {
  clientId: string;
  revogadaEm: Date | null;
  validaAte: Date;
};

/** Um cliente, como a rota o lê do banco — só o suficiente para o nome. */
export type LinhaDeClienteBruta = {
  id: string;
  name: string;
};

/** Motivo por que ESTE convite falha AGORA, ou `"vale"` — nunca `null`, para
 *  o JSON de diagnóstico não confundir "não sei" com "está bem". */
export type MotivoOuVale = MotivoDaRecusaDoConvite | "vale";

export type ConviteNoRetrato = {
  clientId: string;
  /** Os 8 primeiros caracteres do token, e NADA MAIS. Ele é credencial. */
  prefixo: string;
  motivo: MotivoOuVale;
  usos: number;
  ultimoUsoEm: Date | null;
  expiraEm: Date;
  revogadoEm: Date | null;
};

// ⚠️ CORRIGIDO em 07/09/2026 (`seguranca`, `.despachos/F5-duplicado-sem-nome.md`):
// `ClienteNoGrupo` carregava `nome`, e `GrupoDeNomeColidente` carregava
// `nomeNormalizado` — os dois são o nome do cliente (um cru, outro só
// minúsculo/sem acento), na mesma rota cujo segredo trafega em `?chave=` e
// aparece em log de proxy/CDN. A pergunta que este grupo responde — "há dois
// cadastros para o mesmo negócio, e só um tem parceria viva?" — não exige o
// nome na SAÍDA: exige o nome só para AGRUPAR, o que continua acontecendo
// dentro de `montarRetratoDosConvites`, com `normalizarNome`. Quem recebe a
// lista de ids abre o painel, com sessão, e vê o nome lá — como deve ser.
export type ClienteNoGrupo = {
  id: string;
  temParceriaViva: boolean;
};

export type GrupoDeNomeColidente = {
  /** Quantos cadastros colidem neste grupo — sempre === clientes.length,
   *  explícito para quem lê o JSON não precisar contar. */
  tamanho: number;
  clientes: ClienteNoGrupo[];
};

export type RetratoDosConvites = {
  convites: ConviteNoRetrato[];
  /** Contador por motivo, para dimensionar num relance. Sempre com as quatro
   *  chaves possíveis para uma linha existente — zero é resultado, não ausência. */
  porMotivo: Record<"vale" | "revogado" | "vencido" | "parceria_nao_esta_viva", number>;
  gruposDeNomeColidente: GrupoDeNomeColidente[];
};

/** minúsculo, sem acento, espaço duplo colapsado, sem borda. */
function normalizarNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function montarRetratoDosConvites(
  convitesBrutos: LinhaDeConviteBruta[],
  parceriasBrutas: LinhaDeParceriaBruta[],
  clientesBrutos: LinhaDeClienteBruta[],
  agora: Date,
): RetratoDosConvites {
  const parceriaPorCliente = new Map<string, LinhaDeParceriaBruta>();
  for (const p of parceriasBrutas) parceriaPorCliente.set(p.clientId, p);

  const linhaDeParceriaDoCliente = (clientId: string): LinhaDeParceria => {
    const p = parceriaPorCliente.get(clientId);
    return p ? { revogadaEm: p.revogadaEm, validaAte: p.validaAte } : null;
  };

  const porMotivo: RetratoDosConvites["porMotivo"] = {
    vale: 0, revogado: 0, vencido: 0, parceria_nao_esta_viva: 0,
  };

  const convites: ConviteNoRetrato[] = convitesBrutos.map((c) => {
    const linhaConvite: LinhaDeConvite = { clientId: c.clientId, expiraEm: c.expiraEm, revogadoEm: c.revogadoEm };
    // A MESMA régua de produção. `convite` aqui nunca é `null` — a linha veio
    // do banco, então "token_desconhecido" nunca é o resultado desta função.
    const decidido = decidirConvite(linhaConvite, linhaDeParceriaDoCliente(c.clientId), agora);
    const motivo: MotivoOuVale = decidido ?? "vale";
    if (motivo === "vale" || motivo === "revogado" || motivo === "vencido" || motivo === "parceria_nao_esta_viva") {
      porMotivo[motivo] += 1;
    }
    return {
      clientId: c.clientId,
      prefixo: c.token.slice(0, 8),
      motivo,
      usos: c.usos,
      ultimoUsoEm: c.ultimoUsoEm,
      expiraEm: c.expiraEm,
      revogadoEm: c.revogadoEm,
    };
  });

  const porNome = new Map<string, LinhaDeClienteBruta[]>();
  for (const cli of clientesBrutos) {
    const chave = normalizarNome(cli.name);
    if (!chave) continue;
    const lista = porNome.get(chave) ?? [];
    lista.push(cli);
    porNome.set(chave, lista);
  }

  // O nome é usado AQUI para agrupar (`normalizarNome`, acima) e nunca sai —
  // nem cru, nem normalizado. O que sai é o suficiente para responder "há
  // duplicado, e qual dos dois tem parceria viva": ids do grupo, quem tem
  // parceria viva, e o tamanho do grupo.
  const gruposDeNomeColidente: GrupoDeNomeColidente[] = [...porNome.entries()]
    .filter(([, lista]) => lista.length > 1)
    .map(([, lista]) => ({
      tamanho: lista.length,
      clientes: lista.map((cli) => ({
        id: cli.id,
        temParceriaViva: parceriaEstaViva(linhaDeParceriaDoCliente(cli.id), agora),
      })),
    }));

  return { convites, porMotivo, gruposDeNomeColidente };
}
