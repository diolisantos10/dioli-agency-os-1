// A FIAÇÃO — o guarda contra a regressão que importa de verdade.
//
// POR QUE LEITURA DE FONTE: esta casa não tem jsdom nem testing-library
// (`vitest.config.ts` usa `environment: "node"`, render por
// `react-dom/server`), e `useEffect` não roda em `renderToStaticMarkup`. Não
// há como montar `LeadsPage` de verdade e observar, em teste, se o
// `useEffect` disparou o `fetch`. Ler o código-fonte do arquivo é o único
// mecanismo que esta casa tem, sem instalar dependência nova, para provar
// que a chamada existe — mesmo padrão já usado em
// `__tests__/esteira/ficha-na-tela.test.ts`.
//
// O QUE ESTE TESTE PEGA: alguém apagar a chamada a `carregarConversasParadas`
// de dentro de `LeadsPage`, ou apagar a montagem de `<SecaoConversasParadas`
// — isto é, o `fetch` real deixar de acontecer quando a página abre, ou a
// seção deixar de aparecer na árvore. É exatamente o defeito que motivou esta
// rodada: a rota existia, provada por grep, e nenhuma tela chamava.
//
// O QUE ESTE TESTE **NÃO** PEGA: que a chamada exista não prova que ela
// MONTA de fato — `useEffect` pode estar condicionado, comentado por engano
// dentro de um `if (false)`, ou a variável de estado pode nunca ser passada
// adiante. Também não pega ordem de execução, nem se o resultado do fetch
// chega ao usuário CORRETAMENTE (isso é `carregamento-das-conversas-
// paradas.test.ts`, comportamento, e `tela-conversas-paradas.test.tsx`,
// aparência). Este teste prova só UMA coisa: a fiação entre os três nomes
// existe no texto do arquivo. É um guarda barato contra "alguém apagou uma
// linha", não uma prova de comportamento — e é mais fraco do que um teste
// de comportamento por isso. Vendê-lo como mais forte do que é vale menos
// que não tê-lo.

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const PAGINA = fs.readFileSync(path.join(process.cwd(), "app/agency/leads/page.tsx"), "utf8");

describe("LeadsPage usa carregarConversasParadas e monta SecaoConversasParadas", () => {
  it("importa/declara carregarConversasParadas neste mesmo arquivo", () => {
    expect(PAGINA).toContain("export async function carregarConversasParadas");
  });

  it("o useEffect de LeadsPage chama carregarConversas, que por sua vez chama carregarConversasParadas", () => {
    // A cadeia é: useEffect -> carregarConversas (useCallback) ->
    // carregarConversasParadas (a função pura). Provar a cadeia inteira, não
    // só a existência do nome solto em algum lugar do arquivo.
    expect(PAGINA).toContain("const carregarConversas = useCallback(async () => {");
    const trechoDoCallback = PAGINA.slice(PAGINA.indexOf("const carregarConversas = useCallback"));
    const corpoDoCallback = trechoDoCallback.slice(0, trechoDoCallback.indexOf("}, []);"));
    expect(corpoDoCallback).toContain("await carregarConversasParadas()");

    expect(PAGINA).toContain("useEffect(() => { void carregarConversas(); }, [carregarConversas]);");
  });

  it("LeadsPage monta <SecaoConversasParadas com o estado carregado", () => {
    expect(PAGINA).toContain("<SecaoConversasParadas resposta={conversas} onTentarDeNovo={() => void carregarConversas()} />");
  });

  it("a montagem de SecaoConversasParadas está DENTRO do corpo de LeadsPage, não solta no módulo", () => {
    const inicioLeadsPage = PAGINA.indexOf("export default function LeadsPage()");
    const fimLeadsPage = PAGINA.indexOf("\nexport function SecaoConversasParadas");
    expect(inicioLeadsPage).toBeGreaterThan(-1);
    expect(fimLeadsPage).toBeGreaterThan(inicioLeadsPage);

    const corpoDeLeadsPage = PAGINA.slice(inicioLeadsPage, fimLeadsPage);
    expect(corpoDeLeadsPage).toContain("<SecaoConversasParadas");
    expect(corpoDeLeadsPage).toContain("carregarConversasParadas");
  });

  it("carregarConversasParadas faz fetch da rota certa (a mesma que a rodada 1 mediu isolada)", () => {
    const inicioDaFuncao = PAGINA.indexOf("export async function carregarConversasParadas");
    const trecho = PAGINA.slice(inicioDaFuncao, inicioDaFuncao + 800);
    expect(trecho).toContain('fetch("/api/agency/conversas-sem-pedido")');
  });
});
