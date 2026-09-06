"use client";

// ─── Cartão de uma oportunidade ──────────────────────────────────────────────
//
// O produto desta tela NÃO é o cadastro: é o botão de copiar. O envio acontece
// pela mão do operador, dentro da plataforma (99Freelas, Workana…), porque
// automatizar envio nessas plataformas é conta banida. Então o cartão tem uma
// obrigação acima de qualquer outra: colocar a PROPOSTA PRONTA a um clique de
// distância, com retorno visível de que foi copiada.
//
// Fechado, o cartão responde "vale a pena?" (nota + serviço + valor + o porquê).
// Aberto, responde "o que eu mando?" (texto original de um lado, proposta do
// outro). São duas perguntas diferentes e por isso são dois níveis.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useId, useRef, useState } from "react";
import PainelDoFunil from "@/components/agency/comercial/PainelDoFunil";
import {
  faixaDaNota,
  nomeDaRegra,
  rotuloDaPlataforma,
  temEnvioBloqueado,
  type Oportunidade,
  type StatusDaOportunidade,
} from "./contratoDeOportunidade";

const ROTULO_DO_STATUS: Record<StatusDaOportunidade, string> = {
  nova: "Para decidir",
  aprovada: "Aprovada",
  recusada: "Recusada",
  enviada: "Enviada",
};

const ESTILO_DO_STATUS: Record<StatusDaOportunidade, string> = {
  nova: "bg-[var(--accent)] text-[var(--text-secondary)]",
  aprovada: "bg-[var(--success-bg)] text-[var(--success)]",
  recusada: "bg-[var(--accent)] text-[var(--text-muted)]",
  enviada: "bg-[var(--info-bg)] text-[var(--info)]",
};

/**
 * Caixa de texto com teto de altura e rolagem própria.
 *
 * O fade no rodapé aparece SÓ quando o conteúdo de fato transborda — e essa
 * condição é medida, não chutada. Fade fixo é pior que nenhum: sobre um texto
 * curto, ele desbota a última linha de uma proposta que estava inteira na tela,
 * e o operador acha que o sistema cortou o texto que ele vai mandar ao cliente.
 */
function CaixaRolavel({
  children,
  classe,
  classeDoFade,
}: {
  children: React.ReactNode;
  classe: string;
  classeDoFade: string;
}) {
  const ref = useRef<HTMLPreElement>(null);
  const [transborda, setTransborda] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => setTransborda(el.scrollHeight - el.clientHeight > 4);
    medir();
    // A largura muda quando a coluna dupla vira coluna única (e quando o
    // aparelho gira): a medida tem que acompanhar, não ficar do tamanho da
    // primeira renderização.
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [children]);

  return (
    <div className="relative">
      <pre
        ref={ref}
        className={`max-h-[280px] overflow-y-auto whitespace-pre-wrap break-words rounded-[8px] border px-3 py-2.5 font-sans text-[13px] leading-relaxed ${classe}`}
      >
        {children}
      </pre>
      {transborda && (
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-x-px bottom-px h-6 rounded-b-[8px] bg-gradient-to-t to-transparent ${classeDoFade}`}
        />
      )}
    </div>
  );
}

interface Props {
  oportunidade: Oportunidade;
  aberta: boolean;
  onAlternar: () => void;
  /** `custoEmConexoes` só é usado em "enviada", e só onde a plataforma cobra
   *  cota. É o número LIDO DA TELA da plataforma no momento do envio. */
  onDecidir: (status: StatusDaOportunidade, custoEmConexoes?: number) => void;
  /** Trava os botões enquanto o PATCH está no ar. */
  decidindo: boolean;
  /** A plataforma desta oportunidade cobra conexão por proposta? */
  cobraConexao: boolean;
}

export default function CartaoDeOportunidade({
  oportunidade: o,
  aberta,
  onAlternar,
  onDecidir,
  decidindo,
  cobraConexao,
}: Props) {
  const painelId = useId();
  // `copiado` guarda QUAL botão copiou, para o "Copiado ✓" aparecer no botão
  // que a pessoa apertou — feedback no lugar errado é feedback que não fecha o
  // ciclo.
  const [copiado, setCopiado] = useState<"painel" | "aprovar" | null>(null);
  const [falhouAoCopiar, setFalhouAoCopiar] = useState(false);
  // A caixinha do custo em conexões. Fica fechada até a pessoa pedir para marcar
  // como enviada: perguntar antes seria perguntar o que ela ainda não viu.
  const [pedindoCusto, setPedindoCusto] = useState(false);
  const [custo, setCusto] = useState("");
  const faixa = faixaDaNota(o.nota);

  // ── OS TRÊS ESTADOS DA PROPOSTA, E POR QUE NÃO PODEM SER DOIS ─────────────
  // "reprovada" NÃO é "não gerada". A primeira pede leitura do motivo; a segunda
  // pede reanálise. Se a tela tratasse as duas igual, o operador pediria
  // reanálise de uma violação — e receberia a mesma violação de volta.
  const barrada = o.conformidade === "reprovada";
  // ── O QUARTO ESTADO — ficha 06/09/2026: pronta, mas o ENVIO está bloqueado.
  // O portão não reprovou (por isso `barrada` não cobre este caso): o texto
  // está certo, só falta um número que ninguém leu ainda (custo em conexões
  // do 99Freelas). `barrada` vence se as duas acontecerem juntas — a proposta
  // reprovada continua sem texto nenhum, sem exceção.
  const bloqueada = !barrada && temEnvioBloqueado(o.achados);
  const temProposta = Boolean(o.proposta) && !barrada && !bloqueada;

  async function copiarProposta(origem: "painel" | "aprovar"): Promise<boolean> {
    // ⚠️ A TRAVA, e ela é aqui e não no `disabled` do botão: `disabled` é
    // aparência, e um atalho de teclado, um teste ou um `click()` de console
    // passam por cima dele. Proposta barrada OU com envio bloqueado não vai
    // para a área de transferência por caminho nenhum.
    if (barrada || bloqueada || !o.proposta) return false;
    try {
      await navigator.clipboard.writeText(o.proposta);
      setFalhouAoCopiar(false);
      setCopiado(origem);
      setTimeout(() => setCopiado((c) => (c === origem ? null : c)), 2200);
      return true;
    } catch {
      // Clipboard bloqueado (contexto inseguro, permissão negada). Silenciar
      // aqui seria pior: a pessoa colaria o conteúdo anterior da área de
      // transferência na proposta do cliente.
      setFalhouAoCopiar(true);
      return false;
    }
  }

  return (
    <li className="bg-white rounded-[12px] border border-[var(--border)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* ── Cabeçalho clicável: a linha inteira abre, não um ícone de 16px ──── */}
      <button
        type="button"
        onClick={onAlternar}
        aria-expanded={aberta}
        aria-controls={painelId}
        className="w-full text-left flex items-start gap-3 p-4 hover:bg-[var(--bg)] transition-colors"
      >
        {/* Trilho da nota — o critério de ordenação da fila fica visível */}
        <span
          className={`shrink-0 w-[46px] sm:w-[54px] rounded-[10px] border py-2 flex flex-col items-center justify-center ${faixa.classe}`}
        >
          <span className="sr-only">
            Nota {o.nota === null ? "não calculada" : `${o.nota} de 100`} — {faixa.rotulo}
          </span>
          <span aria-hidden className="mono-num text-[18px] sm:text-[20px] font-semibold leading-none">
            {o.nota === null ? "—" : o.nota}
          </span>
          <span aria-hidden className="text-[12px] font-medium leading-none mt-1">
            {faixa.rotulo}
          </span>
        </span>

        <span className="min-w-0 flex-1 block">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-flex h-5 px-2 items-center rounded-full bg-[var(--accent)] text-[12px] font-semibold text-[var(--text-secondary)]">
              {rotuloDaPlataforma(o.plataforma)}
            </span>
            {o.status !== "nova" && (
              <span
                className={`inline-flex h-5 px-2 items-center rounded-full text-[12px] font-semibold ${ESTILO_DO_STATUS[o.status]}`}
              >
                {ROTULO_DO_STATUS[o.status]}
              </span>
            )}
            {/* Selo visível SEM abrir o cartão — a fila inteira precisa mostrar
                o bloqueio, não só o painel expandido (ficha 06/09/2026). Cor de
                atenção (âmbar), nunca a de reprovação: o portão não reprovou. */}
            {bloqueada && (
              <span className="inline-flex h-5 px-2 items-center gap-1 rounded-full bg-[var(--warning-bg)] text-[12px] font-semibold text-[var(--warning)]">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M8 1.5 1 14h14L8 1.5Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                  <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  <circle cx="8" cy="11.5" r="0.9" fill="currentColor" />
                </svg>
                Envio bloqueado
              </span>
            )}
            {o.criadaEm && (
              <span className="text-[12px] text-[var(--text-muted)]">
                {new Date(o.criadaEm).toLocaleDateString("pt-BR")}
              </span>
            )}
          </span>

          <span className="block text-[15px] font-semibold text-[var(--text-primary)] mt-1.5 leading-snug">
            {o.titulo}
          </span>

          {/* O raciocínio é o resumo do PORQUÊ da nota, não o relatório — por
              isso é cortado. Uma linha só a partir de `lg`, onde a linha é
              larga o bastante para caber uma frase; no celular, uma linha
              seriam ~30 caracteres, ou seja, meia frase e nenhum sentido. */}
          <span className="text-[13px] text-[var(--text-secondary)] mt-1 leading-relaxed line-clamp-2 lg:line-clamp-1">
            {o.raciocinio ?? "Sem raciocínio registrado para esta nota."}
          </span>

          <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-2">
            <span className="text-[12px] text-[var(--text-muted)]">
              Serviço:{" "}
              <span className="text-[var(--text-primary)] font-medium">
                {o.servicoSugerido ?? "a definir"}
              </span>
            </span>
            <span className="text-[12px] text-[var(--text-muted)]">
              Valor sugerido:{" "}
              <span className="mono-num text-[var(--text-primary)] font-medium">
                {o.valorSugerido ?? "a definir"}
              </span>
            </span>
            {/* O orçamento do anúncio só aparece quando o anunciante declarou —
                e com nome próprio, para nunca ser lido como a nossa sugestão. */}
            {o.orcamentoInformado && (
              <span className="text-[12px] text-[var(--text-muted)]">
                Orçamento do anúncio:{" "}
                <span className="mono-num text-[var(--text-secondary)] font-medium">{o.orcamentoInformado}</span>
              </span>
            )}
          </span>
        </span>

        <span aria-hidden className="shrink-0 pl-1 pt-1 text-[var(--text-muted)]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={`transition-transform duration-[140ms] ${aberta ? "rotate-180" : ""}`}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {aberta && (
        <div id={painelId} className="border-t border-[var(--border)]">
          {/* Duas colunas só a partir de `lg`: com a sidebar de 224px, um tablet
              de 768px tem 544px de conteúdo — menos que o celular tinha de sobra
              (mesma aritmética da §6.3 do DESIGN.md). */}
          {/* `items-start` não é detalhe: sem ele a coluna curta ("o projeto,
              como chegou", 3 linhas) estica até a altura da coluna longa (a
              proposta + procedência do preço, ~25 linhas) e vira meia tela de
              retângulo branco vazio a 1440px. É o mesmo defeito que só apareceu
              renderizando no admin do Google em 08/08 — e pela mesma razão:
              leitura de código não mede altura. */}
          <div className="grid gap-4 lg:grid-cols-2 items-start p-4">
            <section className="min-w-0">
              <div className="flex items-baseline justify-between gap-2 mb-2 min-h-[32px]">
                <h4 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  O projeto, como chegou
                </h4>
                {o.url && (
                  <a
                    href={o.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-medium text-[var(--text-secondary)] underline shrink-0"
                  >
                    abrir na plataforma
                  </a>
                )}
              </div>
              {(o.categoria || o.prazoInformado) && (
                <p className="text-[12px] text-[var(--text-muted)] mb-2">
                  {[o.categoria, o.prazoInformado && `prazo: ${o.prazoInformado}`].filter(Boolean).join(" · ")}
                </p>
              )}
              {/* O texto CRU do anúncio não sai da API de propósito: costuma
                  trazer contato de terceiro (PII que não pedimos). Aqui vem a
                  descrição extraída — e, quando nem ela veio, o cartão diz isso
                  em vez de mostrar uma caixa vazia. */}
              <CaixaRolavel
                classe="bg-[var(--bg)] border-[var(--border)] text-[var(--text-secondary)]"
                classeDoFade="from-[var(--bg)]"
              >
                {o.textoOriginal || "O anúncio não trouxe descrição. Abra o link na plataforma para ler o original."}
              </CaixaRolavel>
            </section>

            <section className="min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2 min-h-[32px]">
                <h4 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Proposta pronta
                </h4>
                <button
                  type="button"
                  onClick={() => void copiarProposta("painel")}
                  disabled={!temProposta}
                  aria-describedby={bloqueada ? `${painelId}-bloqueio` : undefined}
                  className="shrink-0 h-8 px-3 rounded-[7px] border border-[var(--border-strong)] bg-white text-[12px] font-semibold text-[var(--text-primary)] hover:bg-[var(--bg)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {copiado === "painel" ? "Copiado ✓" : "Copiar"}
                </button>
              </div>

              {/* ── A PROPOSTA BARRADA PELO COMPLIANCE VALIDATOR ─────────────
                  Não há texto para mostrar, e isso é o desenho: um texto
                  reprovado na tela é um texto que alguém seleciona e copia com
                  Ctrl+C. O que aparece no lugar é O QUE reprovou, com o trecho
                  exato e a fonte da regra — porque "não conforme" sem o motivo
                  obriga o operador a adivinhar, e ele adivinha para o lado de
                  mandar assim mesmo. */}
              {barrada ? (
                <div
                  role="alert"
                  className="rounded-[8px] border border-[#FCA5A5] bg-[var(--danger-bg)] px-3 py-3"
                >
                  <p className="text-[13px] font-semibold text-[var(--danger)]">
                    Barrada antes de virar texto copiável
                  </p>
                  <p className="text-[12px] text-[var(--danger)]/80 mt-1 leading-relaxed">
                    O texto que a IA escreveu viola a regra da plataforma. Ele não fica disponível
                    para copiar — enviar assim é sanção, e sanção alcança as outras contas do mesmo
                    usuário.
                  </p>
                  <ul className="mt-2.5 space-y-1.5 list-none p-0 m-0">
                    {o.achados.length === 0 ? (
                      <li className="text-[12px] text-[var(--danger)]">
                        Reprovada sem motivo registrado. É defeito nosso — reanalise e, se repetir,
                        registre.
                      </li>
                    ) : (
                      o.achados.map((a, i) => (
                        <li key={`${a.regra}-${i}`} className="text-[12px] text-[var(--danger)]">
                          <span className="font-semibold">{nomeDaRegra(a.regra)}</span>
                          {a.trecho && (
                            <>
                              {" — "}
                              <span className="font-mono break-words">“{a.trecho}”</span>
                            </>
                          )}
                          {a.fonte && (
                            <span className="block text-[var(--danger)]/70">Fonte: {a.fonte}</span>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              ) : bloqueada ? (
                // ── PRONTA, MAS O ENVIO ESTÁ BLOQUEADO ─────────────────────
                // Estado PRÓPRIO, distinto de "pronta" (não some o botão sem
                // dizer por quê) e de "barrada" (não é vermelho — o portão de
                // conformidade não reprovou; dizer que reprovou seria a tela
                // afirmando algo falso). Âmbar/atenção, nunca dano.
                <div
                  id={`${painelId}-bloqueio`}
                  role="status"
                  className="rounded-[8px] border border-[#FDE68A] bg-[var(--warning-bg)] px-3 py-3"
                >
                  <p className="text-[13px] font-semibold text-[var(--warning)]">
                    Escrita e aprovada — mas o envio está bloqueado
                  </p>
                  <p className="text-[12px] text-[var(--warning)]/80 mt-1 leading-relaxed">
                    O 99Freelas não mostra em nenhum lugar público quantas conexões esta interação
                    vai custar, e ninguém leu esse número na tela do projeto ainda. Abra o anúncio
                    na plataforma, confira o custo e só então decida enviar.
                  </p>
                  {o.achados.filter((a) => a.trecho || a.fonte).length > 0 && (
                    <ul className="mt-2.5 space-y-1.5 list-none p-0 m-0">
                      {o.achados
                        .filter((a) => a.trecho || a.fonte)
                        .map((a, i) => (
                          <li key={`${a.regra}-${i}`} className="text-[12px] text-[var(--warning)]">
                            <span className="font-semibold">{nomeDaRegra(a.regra)}</span>
                            {a.trecho && (
                              <>
                                {" — "}
                                <span className="font-mono break-words">“{a.trecho}”</span>
                              </>
                            )}
                            {a.fonte && (
                              <span className="block text-[var(--warning)]/70">Fonte: {a.fonte}</span>
                            )}
                          </li>
                        ))}
                    </ul>
                  )}
                  {/* O texto continua legível — não é o compliance que barrou —
                      mas some do fluxo de cópia: `temProposta` é `false` aqui,
                      então o botão "Copiar" e o "Aprovar e copiar" já chegam
                      desabilitados (ver acima e a barra de ações abaixo). */}
                  {o.proposta && (
                    <CaixaRolavel
                      classe="mt-2.5 bg-white border-[#FDE68A] text-[var(--text-primary)]"
                      classeDoFade="from-white"
                    >
                      {o.proposta}
                    </CaixaRolavel>
                  )}
                </div>
              ) : (
                <CaixaRolavel
                  classe={
                    temProposta
                      ? "bg-[var(--accent-light)] border-[#BFEFEC] text-[var(--text-primary)]"
                      : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)]"
                  }
                  classeDoFade={temProposta ? "from-[var(--accent-light)]" : "from-[var(--bg)]"}
                >
                  {o.proposta ??
                    (o.conformidade === "nao_julgada"
                      ? "A proposta ainda não foi gerada. Analise a oportunidade de novo para produzi-la."
                      : "Não há texto de proposta nesta oportunidade.")}
                </CaixaRolavel>
              )}

              {/* O rascunho precisou ser limpo. Não é erro do operador e não
                  bloqueia nada — é sinal sobre o GERADOR, e some se ninguém o
                  mostrar. Reincidência é o que antecede a conta banida. */}
              {o.higienizada && !barrada && (
                <p className="text-[12px] text-[var(--warning)] mt-2 leading-relaxed">
                  O rascunho da IA trazia link ou contato e o código retirou antes de julgar. O texto
                  acima é o que sai; o rascunho, não.
                </p>
              )}

              {/* ── DE ONDE VEIO O PREÇO ──────────────────────────────────────
                  Número sem procedência é palpite com cara de cálculo. Aqui
                  aparece qual piso venceu e quanto o CLIENTE vê na tela dele —
                  que é diferente do que a agência recebe, porque a taxa é
                  acrescentada por cima. */}
              {o.preco && (
                <div className="mt-3 rounded-[8px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5">
                  <p className="text-[12px] font-semibold text-[var(--text-secondary)]">
                    {o.preco.ok ? "De onde veio o preço" : "Sem preço — e o motivo"}
                  </p>
                  {o.preco.ok && (
                    <p className="text-[12px] text-[var(--text-secondary)] mt-1">
                      Você digita{" "}
                      <span className="mono-num font-semibold text-[var(--text-primary)]">
                        R$ {o.preco.ofertaADigitar}
                      </span>{" "}
                      · o cliente vê{" "}
                      <span className="mono-num font-semibold text-[var(--text-primary)]">
                        R$ {o.preco.ofertaFinalQueOClienteVe.toFixed(2)}
                      </span>{" "}
                      (taxa de {o.preco.taxaPercentual}% por cima, paga por ele)
                    </p>
                  )}
                  <p className="text-[12px] text-[var(--text-muted)] mt-1 leading-relaxed">
                    {o.preco.motivo}
                  </p>
                </div>
              )}
            </section>
          </div>

          {falhouAoCopiar && (
            <p role="alert" className="px-4 pb-2 text-[12px] text-[var(--danger)]">
              O navegador bloqueou a cópia automática. Selecione o texto da proposta e copie com Ctrl+C.
            </p>
          )}

          {/* ── QUANTAS CONEXÕES ISTO CUSTOU ──────────────────────────────────
              A plataforma NÃO publica a tabela ("varia com o quão disputado
              costuma ser aquele tipo de projeto", e marketing e design são os
              disputados). Então o número tem de ser LIDO DA TELA dela, no
              momento do envio — e por isso a pergunta aparece aqui, depois do
              clique, e não antes.

              Não há valor padrão no campo. Um "1" pré-preenchido seria aceito
              sem leitura em nove de cada dez vezes, e aí o contador do mês
              inteiro passa a ser ficção otimista. Conexão gasta não volta. */}
          {pedindoCusto && (
            <div className="mx-4 mb-3 rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg)] px-3 py-3">
              <label
                htmlFor={`${painelId}-custo`}
                className="block text-[13px] font-semibold text-[var(--text-primary)]"
              >
                Quantas conexões o 99Freelas cobrou?
              </label>
              <p className="text-[12px] text-[var(--text-muted)] mt-1 leading-relaxed max-w-[60ch]">
                O número está na tela da plataforma, no momento do envio. Projeto disputado custa
                mais de uma. Sem ele a casa não consegue saber quanto resta do mês — e conexão gasta
                não volta.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <input
                  id={`${painelId}-custo`}
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={custo}
                  onChange={(e) => setCusto(e.target.value)}
                  placeholder="ex.: 2"
                  className="w-[110px] h-9 px-3 text-[16px] md:text-[14px] bg-white border border-[var(--border)] rounded-[7px] outline-none focus:border-[var(--navy)]"
                />
                <button
                  type="button"
                  disabled={decidindo || !Number.isInteger(Number(custo)) || Number(custo) < 1}
                  onClick={() => {
                    onDecidir("enviada", Number(custo));
                    setPedindoCusto(false);
                    setCusto("");
                  }}
                  className="h-9 px-4 rounded-[7px] bg-[var(--navy)] text-white text-[13px] font-semibold hover:bg-[#0E1333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Confirmar envio
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPedindoCusto(false);
                    setCusto("");
                  }}
                  className="h-9 px-3 rounded-[7px] border border-[var(--border)] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--accent)] transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* ── As três decisões ──────────────────────────────────────────────
              "Aprovar e copiar" é uma ação só porque, na vida real, aprovar e
              colar na plataforma são o mesmo gesto. Separar em dois cliques é
              onde a proposta aprovada fica sem ser enviada. */}
          <div className="flex flex-wrap items-center gap-2 px-4 pb-4 pt-1">
            {/* Sem proposta gerada ainda, o botão NÃO trava: ele vira "Aprovar".
                Travar a aprovação por falta de um texto que o motor ainda não
                escreve deixaria a fila inteira sem decisão possível. */}
            <button
              type="button"
              onClick={async () => {
                if (temProposta) await copiarProposta("aprovar");
                onDecidir("aprovada");
              }}
              disabled={decidindo || o.status === "aprovada"}
              className="h-9 px-4 rounded-[7px] bg-[var(--navy)] text-white text-[13px] font-semibold hover:bg-[#0E1333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {/* Sem proposta, o botão NÃO trava — ele vira "Aprovar". Mas com a
                  proposta BARRADA ele nunca diz "e copiar": prometer a cópia de
                  um texto que não vai para a área de transferência é a mesma
                  mentira de tela que o "Copiado ✓" existe para desfazer. */}
              {copiado === "aprovar" ? "Copiado ✓" : temProposta ? "Aprovar e copiar" : "Aprovar"}
            </button>
            <button
              type="button"
              onClick={() => (cobraConexao ? setPedindoCusto(true) : onDecidir("enviada"))}
              disabled={decidindo || o.status === "enviada" || bloqueada}
              aria-describedby={bloqueada ? `${painelId}-motivo-envio` : undefined}
              className="h-9 px-4 rounded-[7px] border border-[var(--border-strong)] bg-white text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Marcar como enviada
            </button>
            {/* Motivo AO LADO do controle desabilitado — não uma frase solta em
                outro canto da tela (DESIGN.md §4.3 / a régua desta casa). */}
            {bloqueada && (
              <span
                id={`${painelId}-motivo-envio`}
                className="text-[12px] text-[var(--warning)] basis-full sm:basis-auto"
              >
                Envio desabilitado até alguém ler o custo em conexões na tela do 99Freelas.
              </span>
            )}
            <button
              type="button"
              onClick={() => onDecidir("recusada")}
              disabled={decidindo || o.status === "recusada"}
              className="h-9 px-4 rounded-[7px] border border-[var(--border)] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Recusar
            </button>
            {decidindo && (
              <span role="status" className="text-[12px] text-[var(--text-muted)]">
                salvando…
              </span>
            )}
          </div>

          {/* O funil e a trilha. Só aqui dentro, no painel JÁ expandido: a
              listagem do Radar mostra dezenas de cartões, e uma chamada de rede
              por cartão fechado transformaria abrir a página em dezenas de
              requisições para dados que ninguém pediu. */}
          <div className="border-t border-[var(--border)]">
            <PainelDoFunil oportunidadeId={o.id} />
          </div>
        </div>
      )}
    </li>
  );
}
