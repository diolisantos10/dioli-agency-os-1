import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Minimal vitest setup for Dioli Brain unit tests.
// Resolves the "@/..." alias to the repo root so imports match the app.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      // Ver `__tests__/_stubs/server-only.ts`: sem este apelido, todo módulo
      // marcado como server-only fica sem teste — e são justamente os que
      // decidem acesso.
      "server-only": fileURLToPath(new URL("./__tests__/_stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // ⚠️ `.tsx` ENTROU EM 15/08/2026, e não é conveniência.
    //
    // Até aqui todo teste de tela desta casa era leitura do CÓDIGO-FONTE do
    // componente (`expect(COMP).toContain("não informado")`). Isso pega texto
    // que sumiu, mas NÃO pega o que mais dói: a aba que não renderiza, o card
    // que quebra com lista vazia, o botão que aparece habilitado para quem não
    // pode. Fonte casa com a expectativa e a tela não monta — e o teste segue
    // verde.
    //
    // Os testes do workspace do cliente RENDERIZAM de verdade, com
    // `react-dom/server`, que já está no projeto. Nenhuma dependência nova foi
    // instalada (o `node_modules` é compartilhado com outros worktrees).
    include: [
      "__tests__/**/*.test.ts",
      "__tests__/**/*.test.tsx",
      // ⭐ A TRAVA DO CONTRATO COMUM DO DIOLI CONNECT (decisão C3, 30/08/2026).
      //
      // `conector/tests/compatibilidade-do-contrato.test.ts` é COPIADO junto com
      // a pasta comum e não pode ser movido para `__tests__/`: ele calcula a
      // impressão digital dos arquivos vizinhos por caminho relativo
      // (`path.resolve(__dirname, "..")`), e é o MESMO arquivo nos quatro
      // produtos — editá-lo aqui reprovaria a própria trava.
      //
      // ⚠️ Sem esta linha o arquivo existe e NUNCA RODA. Uma trava que não roda
      // é a "peça pronta, testada e sem chamador" que esta casa já pegou hoje:
      // a CI ficaria verde com o contrato comum editado, que é exatamente o que
      // a C3 existe para impedir.
      "lib/agency/connect/conector/tests/*.test.ts",
    ],
    // Ver `vitest.setup.ts`: há estado de PROCESSO que é correto em produção e
    // veneno entre casos de teste. Ele é limpo aqui, para a suíte inteira.
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    // ── POR QUE ESTES TIMEOUTS SÃO MAIORES QUE O PADRÃO ──────────────────────
    // Em 02/08/2026 a suíte ficou vermelha duas vezes SEM nenhuma mudança de
    // comportamento: um arquivo inteiro não chegava a rodar. O sinal estava no
    // relatório — "import 31s" contra ~6s numa rodada normal. Era contenção de
    // CPU (vitest roda os arquivos em paralelo, e alguns puxam o cliente Prisma
    // inteiro), não defeito do código testado.
    //
    // O padrão do vitest (5s de teste, 10s de hook) foi pensado para teste
    // unitário puro. Aqui existem arquivos que sobem processo externo (ffmpeg)
    // e outros que importam módulos grandes. Falso vermelho é pior que teste
    // nenhum: ensina o time a ignorar o sinal.
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
