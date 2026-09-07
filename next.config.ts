import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // ── O NAVEGADOR DO MOLDE, E POR QUE ISTO PRECISA ESTAR AQUI ──────────────
  //
  // 08/08/2026. A agência ficou dias sem produzir UMA peça porque
  // `import("playwright")` FALHAVA em produção. A hipótese que circulava era
  // "não há Chromium no contêiner". Medido de dentro
  // (`/api/admin/diagnostico-do-navegador`), o contêiner respondeu o contrário:
  //
  //   /usr/bin/chromium ......... EXISTE (o apt de railpack.json funciona)
  //   /usr/lib/chromium/ ........ 20 arquivos, binário e tudo
  //   import("playwright") ...... "Cannot find module
  //                               node_modules/playwright-core/browsers.json"
  //
  // O rastreador de arquivos do `output: "standalone"` copia o que consegue
  // SEGUIR por `import`/`require`. `browsers.json` é lido do disco em tempo de
  // execução, então nenhum grafo de import leva até ele — e o pacote chega ao
  // contêiner sem o arquivo que ele abre na primeira linha. `renderizarHtml` e
  // `renderizadorDisponivel` fazem o import ANTES de procurar o executável;
  // com o import morto, os dois desistem sem nunca olhar `/usr/bin/chromium`.
  //
  // Ou seja: o navegador estava lá o tempo todo. Quem não chegava era a
  // biblioteca. Trocar o pacote do apt, mexer em PLAYWRIGHT_BROWSERS_PATH ou
  // baixar um segundo Chromium no build não consertaria uma linha disto.
  //
  // A prova de que continua consertado é local e barata: depois de
  // `npm run build`, `.next/standalone/node_modules/playwright-core/browsers.json`
  // tem de existir. `__tests__/plataforma/o-navegador-chega-em-producao.test.ts`
  // reprova quem tirar esta configuração daqui.
  // ── AS FICHAS DOS AGENTES, E POR QUE ELAS PRECISAM ESTAR NOMEADAS AQUI ───
  //
  // 30/08/2026. `lib/agency/catalogo-v2/specs.ts` lê a ficha de cada função do
  // DISCO em tempo de execução — `path.join(process.cwd(), "agentes", "linha")`
  // — e recusa NOMEADAMENTE quando não acha o arquivo ("sem ficha não se
  // executa"); `regras-da-ficha.ts` faz o mesmo caminho. Em produção o processo
  // é `.next/standalone/server.js`, que começa com `process.chdir(__dirname)`:
  // `process.cwd()` lá **não é a raiz do repositório**, é `.next/standalone`.
  // Se `agentes/` não viajar para lá, o motor recusa TODAS as funções — e
  // recusa em silêncio para quem só olha o log de deploy, porque o app sobe
  // normalmente.
  //
  // Medido em 30/08/2026: as fichas CHEGAVAM ao contêiner, mas por ACIDENTE. O
  // próprio `next build` imprime, quatro vezes:
  //
  //   "Encountered unexpected file in NFT list — A file was traced that
  //    indicates that the whole project was traced unintentionally."
  //
  // Era esse rastreio acidentalmente TOTAL que carregava `agentes/` junto.
  // Nenhum grafo de `import`/`require` leva a essas fichas — são `.md` abertos
  // por caminho montado em runtime —, então o rastreador não tem como
  // segui-las sozinho. **No dia em que alguém consertar aquele aviso — que é um
  // conserto legítimo, de tamanho de imagem — o motor de fichas pararia de
  // achar as fichas em produção, e nenhum teste da casa acusaria.** Nomear a
  // pasta aqui é o que transforma o acidente em decisão: destas linhas em
  // diante as fichas viajam porque ALGUÉM MANDOU, não porque o rastreador
  // errou para o lado bom.
  //
  // `__tests__/connect/a-ficha-chega-em-producao.test.ts` reprova quem tirar
  // esta entrada daqui, e reprova também se o artefato construído chegar sem as
  // fichas — as duas metades: a declaração e o resultado.
  outputFileTracingIncludes: {
    "/**": [
      "node_modules/playwright-core/browsers.json",
      "node_modules/playwright-core/bin/**/*",
      "agentes/linha/**/*.md",
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "20mb" },
  },
};

export default nextConfig;
