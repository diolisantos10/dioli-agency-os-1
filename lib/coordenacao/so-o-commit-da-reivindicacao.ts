// ⛔ A REIVINDICAÇÃO EMPURRA O COMMIT DELA — NUNCA O BRANCH INTEIRO.
//
// ═══ O INCIDENTE, MEDIDO EM 28/08/2026 ═════════════════════════════════════
//
// `npm run reivindicar -- encerrar` levou **quatro commits de um PR aberto**
// direto para a branch de deploy — sem PR, sem CI, sem revisão. O trabalho era
// bom (testes e documentos) e nada quebrou. **Isso foi sorte, não desenho.**
//
// A causa é uma linha:
//
//   git push --no-verify origin HEAD:<branch>
//
// `HEAD:<branch>` não empurra o commit da reivindicação. Empurra **tudo o que o
// HEAD tem e o remoto não** — e o `--no-verify` desliga o gancho que seria a
// última defesa. *A ferramenta oficial da casa violava a regra número um da
// casa, em silêncio, e ninguém tinha medido.*
//
// ═══ A PREMISSA ORIGINAL CONTINUA LEGÍTIMA ═════════════════════════════════
//
// O desenho assumia worktree de agente, em branch privada, cujo HEAD só carrega
// o commit da reivindicação. **Nessa situação `HEAD:` e "só o commit" são a
// mesma coisa**, e o comando estava certo.
//
// O defeito não é a premissa — é ela **nunca ser conferida antes de agir**.
// Premissa não conferida é suposição, e suposição que empurra para o deploy é
// exatamente o que este módulo existe para impedir.
//
// ═══ FAIL-CLOSED, E É A METADE QUE IMPORTA ═════════════════════════════════
//
// Na dúvida sobre o que seria empurrado — `git` falhou, o remoto não foi lido,
// a contagem não deu — **NÃO EMPURRA**. "Não sei o que iria junto" nunca pode
// virar "então vai". *Recusa barata, dano caro.*
//
// ═══ 30/08/2026 — A REGRA ESTAVA CERTA; A PERGUNTA É QUE ESTAVA ERRADA ══════
//
// A régua abaixo NÃO MUDOU uma linha. O que mudou foi o que a casca mede antes
// de consultá-la — e por isso `oQuePushCarrega`, abaixo, nasceu.
//
// Até aqui a casca media `git log origin/<branch>..HEAD`: "quanto o MEU BRANCH
// tem a mais que o deploy". Isso respondia a pergunta certa só enquanto o push
// era `HEAD:<branch>` — quando o que sobe é o HEAD, "o que o branch tem a mais"
// e "o que o push carrega" são a mesma coisa.
//
// Desde que o push passou a levar um commit CONSTRUÍDO sobre `origin/<branch>`,
// com só o arquivo da reivindicação dentro, as duas frases se separaram — e
// medir o branch passou a barrar gente que não estava fazendo nada de errado:
// **uma frente que nasce em branch de PR não conseguia se registrar nem se
// encerrar**, e como `encerrar` é a saída legítima de uma colisão, a colisão
// ficava insolúvel de dentro do fluxo correto. Guarda que barra a saída de
// emergência não protege: ela ensina a contornar.
//
// A separação, em uma frase: **a guarda deixou de perguntar "onde está o seu
// branch?" e passou a perguntar "o que este push carrega?"**. O caso que ela
// existe para pegar — trabalho de branch subindo sem PR e sem CI — continua
// caindo nela exatamente igual, porque continua sendo carona no push. O caso
// que ela nunca deveria ter pegado — registrar/encerrar uma frente a partir de
// um branch de PR — deixou de cair, porque nesse caso o push não carrega
// carona nenhuma.

/** O que a régua precisa saber. Nenhum acesso a git aqui: quem chama mede. */
export type EstadoDoPush = {
  /** Commits que o HEAD tem e o remoto não — SEM contar o da reivindicação. */
  commitsAlemDaReivindicacao: number;
  /** Uma linha por commit extra, para a recusa dizer o que teria ido junto. */
  titulos?: string[];
  /** `false` quando a contagem não pôde ser feita (git falhou, remoto ilegível). */
  mediu: boolean;
};

export type VereditoDoPush =
  | { pode: true }
  | { pode: false; motivo: string };

/**
 * ESTE PUSH LEVA SÓ A REIVINDICAÇÃO?
 *
 * `pode: true` apenas quando a medição foi feita E não há nada além. Todo o
 * resto é recusa — inclusive "não consegui medir".
 */
export function soLevaAReivindicacao(estado: EstadoDoPush): VereditoDoPush {
  if (!estado.mediu) {
    return {
      pode: false,
      motivo:
        "não consegui medir o que este push levaria para o deploy, então não empurro. " +
        "Rode a reivindicação de um branch alinhado com a base " +
        "(git checkout -B <novo> origin/<base>) e tente de novo.",
    };
  }

  if (estado.commitsAlemDaReivindicacao > 0) {
    const n = estado.commitsAlemDaReivindicacao;
    const lista = (estado.titulos ?? []).slice(0, 5).map((t) => `     • ${t}`).join("\n");
    return {
      pode: false,
      motivo:
        `este branch tem ${n} commit${n > 1 ? "s" : ""} que o deploy não tem, além da reivindicação — ` +
        `e empurrá-la daqui levaria ${n > 1 ? "todos eles" : "ele"} junto, sem PR e sem CI.\n` +
        (lista ? `   O que teria ido junto:\n${lista}\n` : "") +
        "   Rode a reivindicação de um branch alinhado com a base:\n" +
        "     git checkout -B <nome-novo> origin/<base>\n" +
        "   e depois volte ao seu branch. O seu trabalho fica onde está — nada foi tocado.",
    };
  }

  return { pode: true };
}

/**
 * O QUE ESTE PUSH CARREGA — lido da saída de
 * `git log --oneline origin/<branch>..<ref-que-vai-ser-empurrada>`.
 *
 * `null` = o `git log` falhou (ref inexistente, remoto não lido). Vira
 * `mediu: false`, e a régua acima recusa: *"não sei o que iria junto" nunca
 * vira "então vai"*.
 *
 * ⚠️ A LINHA DE CIMA É O COMMIT DA PRÓPRIA REIVINDICAÇÃO — `git log` vai do
 * mais novo para o mais velho, e o commit da reivindicação é sempre o último a
 * ser criado. Ele é justamente o único que ESTÁ autorizado a subir; tudo o que
 * vem depois dele na lista é **carona**, e é a carona que a régua conta.
 *
 * Lista vazia (o push não leva nada — a ref já está contida no remoto) também
 * é zero carona: push que não move nada não faz dano nenhum.
 *
 * Puro de propósito: nenhum acesso a git aqui. Quem chama mede, esta função
 * interpreta — o mesmo desenho de `vereditoDoPortao`, e pela mesma razão
 * registrada em `__tests__/coordenacao/as-catracas-do-push.test.ts`: régua que
 * só roda dentro da casca vira régua que o CI mede pelo repositório em volta.
 */
export function oQuePushCarrega(saidaDoGitLog: string | null): EstadoDoPush {
  if (saidaDoGitLog === null) return { commitsAlemDaReivindicacao: 0, titulos: [], mediu: false };

  const titulos = saidaDoGitLog
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const carona = titulos.slice(1);
  return { commitsAlemDaReivindicacao: carona.length, titulos: carona, mediu: true };
}
