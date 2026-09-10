/**
 * A CLI do espaço de RASCUNHO — para o agente que só tem shell.
 *
 *     npm run rascunho -- caminho <nome>
 *     npm run rascunho -- conferir <caminho>
 *     npm run rascunho -- onde
 *
 * A régua mora em `lib/rascunho/espaco-da-frente.ts` — leia o cabeçalho de
 * lá antes de mexer aqui. Este arquivo é só a casca: descobre a frente atual
 * (via git, no cwd de onde o comando roda) e imprime o que foi pedido.
 * Espelha o estilo de saída de `scripts/reivindicar.mts` — mensagem em
 * pt-BR, erro em voz alta, `process.exit(1)` na falha.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  descobrirFrente,
  caminhoDeRascunho,
  conferirEscritaEm,
  espacoDaFrente,
  type DonoGravado,
} from "../lib/rascunho/espaco-da-frente.ts";

function comandoCaminho(argv: string[]): void {
  const nome = argv[0];
  if (!nome || !nome.trim()) {
    console.error('Uso: npm run rascunho -- caminho "<nome>"');
    process.exit(1);
  }

  let frente;
  try {
    frente = descobrirFrente(process.cwd());
  } catch (e) {
    console.error(`🚫 ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }

  try {
    // Chamar `caminhoDeRascunho` já ABRE o espaço (cria o diretório e grava
    // `.dono.json` se ainda não existir) — é isso que o comentário "e cria o
    // espaço" da ficha de despacho pede. Nenhum conteúdo é escrito aqui:
    // quem quiser gravar algo usa o caminho impresso para escrever por conta
    // própria (ou chama `escreverRascunho` de dentro de TypeScript).
    const caminho = caminhoDeRascunho(nome, frente);
    console.log(caminho);
  } catch (e) {
    console.error(`🚫 ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }
}

/**
 * `npm run rascunho -- conferir <caminho>` — o comando de linha de comando
 * para o guarda `conferirEscritaEm`. Existe para o mesmo incidente do
 * cabeçalho de `lib/rascunho/espaco-da-frente.ts`: um agente com só shell
 * (sem TypeScript à mão) precisa de um jeito de perguntar, ANTES de
 * escrever, "este caminho é meu?" — para um destino que ele mesmo escolheu
 * (ex.: um scratchpad de `/tmp` ou um `.fichas` de outra frente), não um
 * caminho que este módulo montou. Sucesso não escreve nada em disco: só
 * confirma que o caminho é seguro para esta frente escrever.
 */
function comandoConferir(argv: string[]): void {
  const alvo = argv[0];
  if (!alvo || !alvo.trim()) {
    console.error('Uso: npm run rascunho -- conferir "<caminho>"');
    process.exit(1);
  }

  let frente;
  try {
    frente = descobrirFrente(process.cwd());
  } catch (e) {
    console.error(`🚫 ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }

  try {
    conferirEscritaEm(alvo, frente);
    console.log(`✅ "${path.resolve(alvo)}" é desta frente (${frente.rotulo}, ${frente.id}) — pode escrever.`);
  } catch (e) {
    console.error(`🚫 ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }
}

function comandoOnde(): void {
  let frente;
  try {
    frente = descobrirFrente(process.cwd());
  } catch (e) {
    console.error(`🚫 ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }

  const espaco = espacoDaFrente(frente);
  console.log(`Frente atual:  ${frente.rotulo}  (${frente.id})`);
  console.log(`Raiz:          ${frente.raiz}`);
  console.log(`Espaço:        ${espaco}`);

  const caminhoDono = path.join(espaco, ".dono.json");
  if (!existsSync(caminhoDono)) {
    console.log("Dono gravado:  (nenhum ainda — espaço ainda não foi aberto por 'caminho' nem por escrita nenhuma.)");
    return;
  }

  try {
    const dono = JSON.parse(readFileSync(caminhoDono, "utf8")) as DonoGravado;
    const ehDaFrenteAtual = dono.id === frente.id; // "eh" em vez de "é" — mesmo padrão de `ehDataIsoValida` em `lib/coordenacao/reivindicacoes.ts`, para não depender de identificador acentuado.
    console.log(
      `Dono gravado:  ${dono.rotulo} (${dono.id}), desde ${dono.criadoEm}` +
        (ehDaFrenteAtual ? "  — é esta frente." : "  — ⚠️  NÃO é esta frente."),
    );
  } catch (e) {
    console.log(`Dono gravado:  ⚠️  não consegui ler "${caminhoDono}" (${e instanceof Error ? e.message : String(e)}).`);
  }
}

function main(): void {
  const [, , comando, ...resto] = process.argv;
  switch (comando) {
    case "caminho":
      comandoCaminho(resto);
      break;
    case "conferir":
      comandoConferir(resto);
      break;
    case "onde":
      comandoOnde();
      break;
    default:
      console.error("Uso:");
      console.error('  npm run rascunho -- caminho "<nome>"');
      console.error('  npm run rascunho -- conferir "<caminho>"');
      console.error("  npm run rascunho -- onde");
      process.exit(1);
  }
}

main();
