// ─── GRAVAR CANDIDATURA — o ponto onde a decisão do agente vira registro ────
//
// `lib/marketplaces/99freelas/agente.ts` (`processarProjeto`/`rodada`) decide.
// Este arquivo só GRAVA a decisão como uma linha de `Oportunidade` — o mesmo
// model que a porta humana (`lib/agency/comercial/oportunidade.ts`,
// `registrarOportunidade`) já usa. Nenhuma tabela nova, nenhuma migration.
//
// ── A MÁQUINA NÃO SE AUTO-APROVA ─────────────────────────────────────────────
// `status` grava SEMPRE `"nova"` na criação — mesmo quando
// `candidatura.desfecho === "aguardando_clique_humano"`, que é o desfecho BOM.
// "Pronto para o clique" e "aprovado" são coisas diferentes: o clique continua
// sendo do CEO (§51 do portão, `lib/marketplaces/portao.ts`). Nunca grava
// `"aprovada"` nem `"enviada"` — isso só acontece pela rota humana de decisão.
//
// ── O DESCARTADO APARECE, NÃO SOME ───────────────────────────────────────────
// `desfecho === "eliminado"` ou `"parado"` também vira linha aqui, com
// `propostaTexto: null` e o motivo do agente em `raciocinio`. Uma oportunidade
// que desaparece silenciosamente da fila é uma oportunidade que ninguém pode
// auditar depois — e esta casa roda 100% IA, sem revisão humana antes do
// registro.
//
// ── IDEMPOTÊNCIA: A MESMA IMPRESSÃO DIGITAL DA CASA ──────────────────────────
// `impressaoDeTexto` já existe (`lib/agency/comercial/oportunidade.ts`) e é a
// MESMA usada pela porta humana — dois hashes de "mesmo texto" concorrendo na
// mesma tabela seria dois conceitos de igualdade dentro da mesma casa. A chave
// de dedup é o texto ORIGINAL do anúncio (o que virou `conteudoDeTerceiro` ao
// entrar no agente), não o texto da proposta redigida — a proposta muda a cada
// rodada mesmo quando o projeto é o mesmo, e usá-la como chave duplicaria a
// linha a cada reprocessamento.
//
// Reprocessar o MESMO projeto (mesma impressão digital) não cria uma segunda
// linha: atualiza a existente com o resultado mais recente do agente. Mas
// `status`, `decididoPor` e `decididoEm` NUNCA entram no `update` — uma
// decisão humana já tomada sobre aquela oportunidade não pode ser pisada por
// um reprocessamento automático que rodou depois.
//
// ── DE ONDE VÊM OS DADOS, E POR QUE DOIS PARÂMETROS ──────────────────────────
// `coletado` (de `lib/marketplaces/99freelas/coleta.ts`) é o que foi LIDO da
// tela: título, descrição, categoria, orçamento — estruturado, determinístico,
// sem IA. `candidatura` (de `agente.ts`) é o que a CASA decidiu sobre aquele
// projeto: nota, preço, texto da proposta, conformidade. Os dois precisam
// entrar juntos porque nenhum dos dois sozinho tem os dois lados da história.
//
// `textoBruto` é obtido chamando `paraProjetoBruto(coletado).conteudoDeTerceiro`
// — a mesma conversão que o script chamador usa para alimentar o agente — em
// vez de assumir um campo extra não documentado em `ProjetoColetado`. Isso
// garante que o texto gravado como prova é BYTE A BYTE o mesmo que o agente
// realmente leu, nunca uma segunda reconstrução que pode divergir.
//
// ⚠️ `textoBruto` é DADO NÃO CONFIÁVEL (texto de um desconhecido na internet).
// Aqui ele só é lido e gravado como coluna — nunca interpretado como comando.

import type { Prisma, PrismaClient } from "@/lib/generated/prisma/client";
import { impressaoDeTexto } from "@/lib/agency/comercial/oportunidade";
import type { Candidatura, Desfecho } from "@/lib/marketplaces/99freelas/agente";
import { paraProjetoBruto, type ProjetoColetado } from "@/lib/marketplaces/99freelas/coleta";
import { REGRA_ENVIO_BLOQUEADO_POR_CUSTO_DESCONHECIDO } from "@/lib/marketplaces/99freelas/marcador-de-envio-bloqueado";

/** Transação ou cliente Prisma — mesma convenção de `cliente-vinculos.ts`. */
type Db = PrismaClient | Prisma.TransactionClient;

// ── O MARCADOR DE ENVIO BLOQUEADO — ficha 06/09/2026, item 2 ────────────────
//
// `texto_pronto_envio_bloqueado` (`agente.ts`) grava um texto que NENHUM
// clique deve enviar: o custo em conexões desta interação não foi lido da
// tela, e "não sei se cabe" não é "não cabe" nem "cabe". Prosa em
// `raciocinio` não é mecanismo — um humano lendo uma proposta bonita na tela
// vai enviá-la; a régua desta casa é "trava, não aviso".
//
// DECISÃO (opção (a) da ficha, sem coluna nova nem migration): o marcador
// entra como mais uma entrada em `conformidadeAchados` — campo que já é
// `[{regra,trecho,fonte}]`, já serializado por este arquivo e já lido por
// `lib/agency/comercial/oportunidade.ts::normalizarAchados` independente do
// valor de `conformidadeOk`. Por quê aqui e não em `achados` do próprio
// `Candidatura`: `Candidatura.achados` é tipado `Achado[]`
// (`conformidade.ts`), cujo `regra` é a união FECHADA `RegraDeConteudo` — são
// os motivos do Compliance Validator, uma família de julgamento diferente
// desta. Este marcador nasce AQUI, não no portão, e por isso ganha uma forma
// própria (`regra: string`, mesmo formato de `AchadoDeConformidade` da tela)
// em vez de forçar um valor estranho dentro de um union que não é dono desta
// pergunta.
//
// ⚠️ LACUNA CONHECIDA, não resolvida por este arquivo: o cartão da tela
// (`components/agency/comercial/CartaoDeOportunidade.tsx`) só entra no ramo
// "barrada" (que lista `achados`) quando `conformidade === "reprovada"`, ou
// seja, quando `conformidadeOk === false`. Aqui `conformidadeOk` continua
// `true` de propósito (o portão não bloqueou) — então, HOJE, o operador
// abrindo o cartão vê a proposta como se estivesse pronta para copiar, com o
// botão "Copiar" habilitado, e o marcador gravado aqui não aparece na tela.
// O mecanismo é real e é LEGÍVEL POR CÓDIGO (é isso que os testes provam),
// mas ainda não é uma TRAVA visível para quem decide na tela. Fechar isso de
// verdade pede tocar `contratoDeOportunidade.ts`/`CartaoDeOportunidade.tsx`
// (fora do escopo desta ficha) ou a coluna nova que a ficha pede para só
// recomendar. Ver relato do despacho de 06/09/2026.
//
// ATUALIZAÇÃO — 06/09/2026, ficha "a fila precisa mostrar o bloqueio": a
// LACUNA acima está FECHADA (ver `CartaoDeOportunidade.tsx` e
// `contratoDeOportunidade.ts`). A constante também mudou de endereço: agora
// mora sozinha em `marcador-de-envio-bloqueado.ts` (zero imports) porque a
// leitura acontece num componente `"use client"`, e importar este arquivo
// dali arrastaria `crypto` e o cliente Prisma para o bundle do navegador.
// Reimportada e reexportada acima/abaixo — continua sendo UM SÓ lugar onde a
// string nasce, só o endereço físico mudou.
export { REGRA_ENVIO_BLOQUEADO_POR_CUSTO_DESCONHECIDO };

/** Mesma forma de `AchadoDeConformidade`
 *  (`lib/agency/comercial/oportunidade.ts`) — `regra: string`, não a união
 *  fechada `RegraDeConteudo` do Compliance Validator, porque este marcador
 *  não é um achado do Compliance Validator. */
interface MarcadorDeGravacao {
  regra: string;
  trecho: string;
  fonte: string;
}

export interface ParametrosDeGravacao {
  workspaceId: string;
  coletado: ProjetoColetado;
  candidatura: Candidatura;
}

export interface ResultadoDaGravacao {
  /** O id da linha em `Oportunidade` — nova ou já existente. */
  id: string;
  /** `true` só quando esta chamada CRIOU a linha. Rodar de novo para o MESMO
   *  projeto (mesma impressão digital) devolve `false` — nada foi duplicado,
   *  a linha existente foi atualizada com o resultado mais recente. */
  criada: boolean;
}

export async function gravarCandidatura(
  params: ParametrosDeGravacao,
  db: Db,
): Promise<ResultadoDaGravacao> {
  const { workspaceId, coletado, candidatura } = params;

  const bruto = paraProjetoBruto(coletado);
  const textoBruto = bruto.conteudoDeTerceiro ?? "";
  const impressaoDigital = impressaoDeTexto(textoBruto);

  // Switch EXAUSTIVO sobre `Desfecho`, com `never` no `default`: o próximo
  // desfecho novo (uma quinta variante) QUEBRA A COMPILAÇÃO em vez de cair
  // silenciosamente num `null` — foi exatamente esse buraco (`===
  // "aguardando_clique_humano"` como booleano) que jogou fora o texto de
  // `texto_pronto_envio_bloqueado` até esta ficha.
  //
  // `achadosDeGravacao` parte de `candidatura.achados` (o que o Compliance
  // Validator achou, se achou algo) e, só no caso do envio bloqueado, ganha
  // o marcador estrutural — nos outros três desfechos ele fica ausente, de
  // propósito: carimbar todo mundo de bloqueado seria tão errado quanto não
  // carimbar ninguém.
  let propostaTexto: string | null;
  // `Achado[]` (o tipo real de `candidatura.achados`) é estruturalmente
  // compatível com `MarcadorDeGravacao[]` — `RegraDeConteudo` é uma união de
  // strings, então todo `Achado` já tem a forma `{regra: string; trecho:
  // string; fonte: string}` que este array pede.
  let achadosDeGravacao: MarcadorDeGravacao[];

  const desfecho: Desfecho = candidatura.desfecho;
  switch (desfecho) {
    case "aguardando_clique_humano":
      propostaTexto = candidatura.texto;
      achadosDeGravacao = candidatura.achados ?? [];
      break;
    case "texto_pronto_envio_bloqueado":
      // O caso que esta ficha existe para consertar: o texto foi escrito,
      // precificado e passou pelo portão — não é `eliminado`/`parado`, e
      // descartá-lo aqui seria repetir o mesmo defeito com outro nome.
      propostaTexto = candidatura.texto;
      achadosDeGravacao = [
        ...(candidatura.achados ?? []),
        {
          regra: REGRA_ENVIO_BLOQUEADO_POR_CUSTO_DESCONHECIDO,
          trecho: candidatura.motivo || "custo em conexões desta interação não foi lido da tela.",
          fonte: "lib/marketplaces/99freelas/agente.ts · desfecho texto_pronto_envio_bloqueado",
        },
      ];
      break;
    case "eliminado":
    case "parado":
      propostaTexto = null;
      achadosDeGravacao = candidatura.achados ?? [];
      break;
    default: {
      const _exaustivo: never = desfecho;
      throw new Error(`gravarCandidatura: desfecho não tratado: ${String(_exaustivo)}`);
    }
  }

  // `conformidadeOk` tem DOIS nulos possíveis e a tela precisa distingui-los
  // (comentário do schema, `prisma/schema.prisma` ~L2107): `null` quando o
  // portão nunca chegou a julgar (eliminado antes, parado por saldo/janela/
  // preço), `false` quando julgou e REPROVOU (BLOCK), `true` quando julgou e
  // liberou (HUMAN_GATE — pronto para o clique, ou pronto com envio
  // bloqueado por custo desconhecido: o portão NÃO deu BLOCK nos dois).
  // Continua honesto mesmo no envio bloqueado: o portão não reprovou, então
  // `conformidadeOk` não pode virar `false` só para colorir a tela.
  const conformidadeOk = candidatura.decisao ? candidatura.decisao.veredito !== "BLOCK" : null;

  const camposDeConteudo = {
    titulo: coletado.titulo || candidatura.titulo || "(sem título)",
    descricao: coletado.descricao ?? "",
    categoria: coletado.categoria ?? null,
    orcamentoInformado: coletado.orcamentoInformado ?? null,
    textoBruto,
    nota: candidatura.nota ?? null,
    raciocinio: candidatura.motivo || null,
    propostaTexto,
    // NUNCA `candidatura.preco?.ofertaADigitar` — ficha 06/09/2026 ("o preço
    // não pode chutar"): quando o escopo declarado é volume/recorrência
    // (`agente.ts`, passo 5.5), `preco` continua no retorno para o CEO ler o
    // diagnóstico, mas `ofertaADigitar` da CANDIDATURA fica `null` de
    // propósito — o preço unitário não pode ir para o campo "Sua oferta" como
    // se fosse o preço do pacote inteiro. Ler `preco.ofertaADigitar` direto
    // aqui reintroduziria o número errado por baixo dessa trava.
    valorSugerido: candidatura.ofertaADigitar ?? null,
    conformidadeOk,
    // Sempre serializado, mesmo vazio (`"[]"`) — nunca `undefined`/`null` que
    // obrigaria a tela a tratar dois formatos.
    conformidadeAchados: JSON.stringify(achadosDeGravacao),
    precoDetalhe: candidatura.preco ? JSON.stringify(candidatura.preco) : null,
  };

  const existente = await db.oportunidade.findUnique({
    where: { workspaceId_impressaoDigital: { workspaceId, impressaoDigital } },
    select: { id: true },
  });

  if (existente) {
    // `status`, `decididoPor` e `decididoEm` DE PROPÓSITO fora deste `data`:
    // reprocessar não pode reverter uma decisão humana já tomada.
    await db.oportunidade.update({
      where: { id: existente.id },
      data: camposDeConteudo,
    });
    return { id: existente.id, criada: false };
  }

  const criada = await db.oportunidade.create({
    data: {
      workspaceId,
      plataforma: "99freelas",
      urlExterna: bruto.url ?? candidatura.url ?? null,
      // SEMPRE "nova" na criação — nunca "aprovada", nunca "enviada", mesmo
      // que o desfecho seja o bom. A máquina não se auto-aprova.
      status: "nova",
      impressaoDigital,
      ...camposDeConteudo,
    },
    select: { id: true },
  });
  return { id: criada.id, criada: true };
}
