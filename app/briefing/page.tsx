"use client";

import { useState } from "react";
import { canalFoiRetratado } from "@/lib/agency/comercial/retratacao";
import Link from "next/link";
import { useAgencyStore } from "@/store/agency-store";
import { PublicBriefingRoom, conviteDaUrl } from "@/components/agency/briefing/PublicBriefingRoom";
import type { PublicBriefingRoomSubmitData } from "@/components/agency/briefing/PublicBriefingRoom";
import { LeadNaPorta, type ContatoDaPorta } from "@/components/agency/briefing/LeadNaPorta";
import { lerNegocio } from "@/lib/agency/comercial/negocio-do-lead";
import { linkDoBriefing, type ContextoDaConversa } from "@/lib/agency/comercial/link-do-whatsapp";

export default function BriefingPage() {
  const { addClientRequest } = useAgencyStore();
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  // Quem sobe sem contato NÃO pode ver "entramos em contato pelo canal
  // informado". Prometer retorno para quem não deixou endereço é a mentira mais
  // fácil desta tela — e a que faz a pessoa esperar por uma ligação que não existe.
  const [temContato, setTemContato] = useState(true);
  // ── O CONTATO É PEDIDO NA PORTA, NÃO NO MEIO DA CONVERSA ──────────────────
  // Ordem do CEO em 16/08 depois de esperar a noite inteira por um orçamento
  // que não chegava: a casa não sabia como falar com ele. Perguntar no meio da
  // conversa depende de o modelo lembrar e de o cliente responder; perguntar na
  // porta acontece sempre. `entrou` guarda se o visitante já passou por lá —
  // inclusive quando escolheu não deixar contato (aí vale `null`).
  const [entrou, setEntrou] = useState(false);
  const [contatoDaPorta, setContatoDaPorta] = useState<ContatoDaPorta>(null);
  // ── O QUE A PESSOA CONTOU, GUARDADO PARA A MENSAGEM DE WHATSAPP ───────────
  // Achado do `experiencia` em 16/08: a confirmação abria o WhatsApp numa caixa
  // VAZIA, logo depois de a pessoa ter contado o negócio inteiro ao SDR. Ela
  // recomeçava do zero. Este estado existe só para que a mensagem já vá escrita
  // — e guarda apenas o que ela mesma disse, nunca o que a casa deduziu.
  const [contextoDaConversa, setContextoDaConversa] = useState<ContextoDaConversa>({});

  async function handleSubmit(data: PublicBriefingRoomSubmitData) {
    // O contato da PORTA manda: ele é o que o visitante declarou antes de
    // começar. O da conversa só completa o que ficou em branco.
    //
    // ── SALVO O QUE ELE DESDISSE DEPOIS (8ª volta, 26/08/2026) ──────────────
    // A porta é ANTERIOR à conversa. Quando o cliente escreve "esquece o
    // WhatsApp", a declaração mais nova é a da conversa — e era por esta linha
    // que o número da porta voltava inteiro para a solicitação gravada. A porta
    // continua ganhando de palpite; ela não ganha de retratação.
    const whatsappRetratado = canalFoiRetratado(data.v2Scope, "whatsapp");
    const contatoBruto = contatoDaPorta ?? data.contato;
    const contato = contatoBruto && whatsappRetratado
      ? { ...contatoBruto, whatsapp: "" }
      : contatoBruto;
    setTemContato(contato !== null);
    const id = addClientRequest({
      clientId: `prospect-${Date.now()}`,
      source: "public_briefing",
      title: data.title,
      rawText: data.rawText,
      extractedSummary: data.extractedSummary,
      suggestedDepartments: data.extractedSummary.suggestedDepartments,
      missingInfo: data.extractedSummary.missingInfo,
      status: "new",
      attachments: data.attachments,
      conversationTranscript: data.conversationTranscript,
      v2Scope: data.v2Scope,
      v2Estimate: data.v2Estimate,
      prospectName: contatoDaPorta?.nome || data.prospectName,
      prospectEmail: contatoDaPorta?.email || data.prospectEmail,
      prospectPhone: whatsappRetratado ? "" : (contatoDaPorta?.whatsapp || data.prospectPhone),
      sdrHandoff: data.sdrHandoff,
    });

    // Dual-write to DB — non-blocking, failure does not prevent local submission
    try {
      await fetch("/api/brain/client-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // ── O CAMPO DO NEGÓCIO RECEBE O NEGÓCIO, NÃO A PESSOA ──────────────
          //
          // Até 16/08/2026 esta linha era
          // `data.prospectName ?? contatoDaPorta?.nome ?? data.title` — ou seja,
          // mandava o nome de QUEM preencheu no campo do NEGÓCIO. O `businessName`
          // já vinha pronto no submit (`PublicBriefingRoom.tsx:1344`, do escopo
          // acumulado da conversa) e simplesmente não era usado.
          //
          // É o irmão do bug que `74810b75` fechou no `prospect-engine` (o e-mail
          // virando nome do negócio): **duas portas gravavam o mesmo campo, e
          // consertar uma deixava a outra vazando em silêncio** — o padrão que
          // esta casa já pagou em 16/08 com as duas rotas que criavam cadastro.
          //
          // Sem negócio informado, o campo NÃO cai no nome da pessoa: vai vazio,
          // e vazio aqui é a ausência que `lerNegocio` (`negocio-do-lead.ts`) já
          // sabe ler — a tela mostra "Negócio não informado". Ausência de
          // informação não é informação, e sem revisor humano um nome deduzido
          // vira dado inventado no cadastro do cliente.
          // ⛔ O CONVITE VIAJA NO SUBMIT (29/08/2026) — sem esta linha o pedido
          // do parceiro nasce órfão e a proposta dele sai COBRANDO. Medido em
          // produção com o cliente 001. É o token, não o cliente: quem deriva o
          // dono é o servidor.
          convite:        conviteDaUrl(),
          businessName:   lerNegocio(data.businessName) ?? "",
          segment:        data.extractedSummary.segment,
          services:       data.extractedSummary.services,
          objectives:     data.extractedSummary.objectives,
          rawContext:     data.rawText,
          source:         "briefing",
          // O fio da conversa. O servidor usa só para RESOLVER o rastro que os
          // turnos do SDR deixaram (`conversa-sem-pedido.ts`) — nunca como
          // identidade de ninguém: ele vem do navegador e é sujo por definição.
          sessionId:      data.sessionId,
          // O contato vai como CAMPO PRÓPRIO, não enterrado no escopo. Quem
          // decide o que fazer com ele (proposta ou lead incompleto) é o
          // servidor — a tela só entrega o fato.
          contato,
          briefingJson:   { transcript: data.conversationTranscript, scope: data.v2Scope, estimate: data.v2Estimate },
          sdrHandoffJson: data.sdrHandoff ?? null,
          attachmentsJson: data.attachments.map((a) => ({
            id: a.id, fileName: a.fileName, fileType: a.fileType, sizeBytes: a.sizeBytes,
          })),
        }),
      });
    } catch {
      // DB write failure is non-fatal — local store is the fallback
      console.warn("[briefing] DB dual-write failed — request saved locally only");
    }

    // Só o que a PESSOA declarou. `lerNegocio` devolve `null` quando o negócio
    // não foi informado, e `null` some da mensagem — nunca vira "não informado"
    // num texto que ela vai enviar em nome próprio.
    setContextoDaConversa({
      nome: contato?.nome ?? data.prospectName,
      negocio: lerNegocio(data.businessName),
      servicos: data.extractedSummary.services,
      referencia: id,
    });

    setSubmittedId(id);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-[560px] mx-auto py-16 px-4 text-center">
        <div className="w-14 h-14 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto mb-5 text-[var(--success)] text-[22px] font-bold">
          ✓
        </div>
        <h1 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3">
          {temContato ? "Recebemos seu briefing." : "Seu briefing está guardado."}
        </h1>
        <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed max-w-[400px] mx-auto mb-6">
          {temContato
            ? "Nossa equipe vai revisar a proposta inicial e retornar com os próximos passos em breve."
            : "Nada do que você contou se perdeu. Mas, como não temos WhatsApp nem e-mail seu, não temos como te enviar a proposta — quando quiser, é só falar com a gente pelo WhatsApp abaixo."}
        </p>
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[10px] px-5 py-4 mb-8 text-left">
          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-1">O que acontece agora</p>
          <ol className="space-y-1.5">
            {(temContato
              ? [
                  "Nossa equipe analisa o escopo enviado",
                  "Preparamos uma proposta formal detalhada",
                  // ⛔ SEM PRAZO, e isto é ordem, não estilo. Em 16/08/2026 o CEO,
                  // com todas as letras: *"em relação à confirmação de promessa,
                  // de orçamento em um dia, não autorizei nada disso."* A tela
                  // prometia "em até 1 dia útil" para um retorno que ninguém se
                  // comprometeu a dar — e prazo prometido sem dono é dívida que a
                  // casa contrai em nome de quem não foi consultado.
                  "Entramos em contato pelo canal informado",
                ]
              : [
                  "Seu briefing fica guardado com tudo que você contou",
                  "A proposta só é preparada quando tivermos um canal de contato",
                  "Você pode nos chamar no WhatsApp a qualquer momento",
                ]
            ).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-[var(--text-secondary)]">
                <span className="w-4 h-4 rounded-full bg-[var(--text-primary)] text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
        {/* A REFERÊNCIA VEM ANTES DOS BOTÕES, e a ordem é o mecanismo. Um dos
            botões agora TIRA a pessoa desta página; referência impressa depois
            da saída é referência que ninguém lê. */}
        {submittedId && (
          <p className="mb-6 text-[12px] text-[var(--text-subtle)]">Referência: {submittedId}</p>
        )}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {/* ── O BOTÃO QUE DEVOLVIA A PESSOA AO PRÓPRIO BRIEFING ──────────────
              Até 16/08/2026 este era um <button> com `setSubmitted(false)`, sob
              o rótulo "Voltar ao início". O CEO, com todas as letras: *"não faz
              o menor sentido."*

              E o estrago era maior que o rótulo. `entrou` e `contatoDaPorta`
              NÃO eram resetados junto, então a porta de contato era pulada e o
              visitante caía num chat EM BRANCO, sob o mesmo cadastro, logo
              depois de ler "Recebemos seu briefing". Duas leituras possíveis, as
              duas ruins: achar que o envio falhou e refazer tudo — segundo
              briefing, cadastro-irmão e SEGUNDA fatura de IA, no defeito que
              `docs/pendencias.md` (16/08) registra como "dinheiro real, sem
              dono" —, ou sair confuso e a equipe herdar conversa duplicada.

              Navegar para fora fecha esse caminho em vez de mudá-lo de lugar:
              não existe mais formulário vazio para onde voltar, e o briefing já
              está gravado — não há trabalho do visitante a perder aqui.

              ⛔ O destino é `/`, NUNCA `/#hero`. O `id="hero"` de
              `app/page.tsx:194` é do SVG decorativo `OrbitMotif`, dentro do
              mockup: ancorar nele pousaria no MEIO da seção e cortaria o título
              no celular. O Hero é o topo da home — `/` já chega nele.

              O rótulo nomeia o DESTINO, não um "início" que não se sabe de quê:
              o início do formulário ou o do site? Rótulo que promete o que o
              botão não entrega é o mesmo defeito com outra roupa. */}
          <Link
            href="/"
            className="h-9 px-5 rounded-[8px] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg)] text-[13px] font-medium transition-colors inline-flex items-center"
          >
            Voltar para o site da Dioli
          </Link>
          <a
            // ── A CONVERSA COMEÇA JÁ COMEÇADA ───────────────────────────────
            // Até 16/08 este `href` era `wa.me/5511989400692` cru: a pessoa
            // contava tudo ao SDR e caía numa caixa VAZIA, tendo de recomeçar.
            // Na home o mesmo botão já mandava contexto — era inconsistência,
            // não falta de capacidade. O texto (e o número) agora vêm de
            // `comercial/link-do-whatsapp.ts`, fonte única: o número estava
            // repetido em oito arquivos e o texto, em nenhum.
            href={linkDoBriefing(contextoDaConversa)}
            // PAR DE COR QUE VIRA JUNTO. O CEO, em 16/08/2026, não conseguiu ler
            // este botão: *"está preto sobre preto."*
            //
            // A causa não era este botão — era o par escolhido. `--text-primary`
            // é cor de TEXTO usada como FUNDO, e o tema escuro da casa redefine
            // `--background` sem redefinir `--text-primary`. Resultado medido:
            // fundo do botão #1F2937 sobre página #070A1F = **1,33:1**. O botão
            // deixa de existir. Um token que não vira junto com o tema é uma
            // cor fixa com nome de token.
            //
            // `--primary`/`--primary-foreground` são o par que a casa mantém
            // invertido nos dois temas (navy+branco no claro, cyan+navy no
            // escuro) — por isso o par, e não um hex novo aqui.
            className="h-9 px-5 rounded-[8px] bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] text-[13px] font-medium transition-opacity inline-flex items-center"
          >
            Falar com a Dioli no WhatsApp
          </a>
        </div>
      </div>
    );
  }

  if (!entrou) {
    return (
      <LeadNaPorta
        aoEntrar={(c) => { setContatoDaPorta(c); setEntrou(true); }}
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">Vamos entender seu projeto</h1>
        <p className="text-[14px] text-[var(--text-secondary)] mt-1 leading-relaxed max-w-[540px]">
          Converse com a Dioli, conte o que você precisa e receba uma estimativa inicial de escopo, prazo e investimento.
        </p>
      </div>
      {/* O contato da porta desce para a sala. Sem esta prop o dado ficava
          preso aqui, usado só no envio final do briefing — e a conversa abria
          perguntando o nome que a pessoa acabara de digitar (piloto do CEO,
          23/08/2026). Capturar sem entregar é o mesmo que não capturar. */}
      <PublicBriefingRoom onSubmit={handleSubmit} contatoDaPorta={contatoDaPorta} />
    </div>
  );
}
