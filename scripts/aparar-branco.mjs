// Apara o branco morto da CABEÇA de cada gravação, e mais nada.
//
// Por que existe: a câmera do Playwright começa a gravar quando o CONTEXTO é
// criado, e o primeiro `goto` ainda leva alguns segundos até a primeira pintura.
// A medição da primeira rodada: até 14 segundos de tela branca na frente das
// cenas — vídeo que abre com espera filmada é vídeo que o revisor fecha.
//
// O QUE ESTE SCRIPT NÃO FAZ, e é o ponto: ele NÃO corta nada do conteúdo, NÃO
// acelera, NÃO junta cenas e NÃO mexe no meio. Corta só o trecho inicial em que
// não há NADA na tela, detectado quadro a quadro pelo tamanho do PNG (quadro
// branco liso comprime para ~4 KB; qualquer tela real passa de 40 KB).
// Acelerar ou cortar o meio seria mudar o que foi filmado — e o roteiro do CEO
// proíbe isso com todas as letras ("Não acelerar nem cortar").

import { readdirSync, statSync, rmSync, renameSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";

const FFMPEG = "/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux";
const DIR = resolve(process.argv[2] || "docs/plataformas/meta/gravacoes");
/** Um PNG 1280x720 totalmente branco dá ~4,3 KB. 12 KB é folga larga. */
const LIMIAR_BRANCO = 12_000;

const videos = readdirSync(DIR).filter((f) => f.endsWith(".webm"));
const relatorio = [];

for (const arquivo of videos) {
  const caminho = join(DIR, arquivo);
  const sonda = mkdtempSync(join(tmpdir(), "apara-"));
  let corte = 0;

  // Amostra de 1 em 1 segundo nos primeiros 30s: onde a tela deixa de ser branca.
  for (let t = 0; t < 30; t++) {
    const png = join(sonda, `q.png`);
    rmSync(png, { force: true });
    try {
      execFileSync(FFMPEG, ["-v", "error", "-ss", String(t), "-i", caminho, "-frames:v", "1", png, "-y"]);
    } catch { break; }
    let bytes = 0;
    try { bytes = statSync(png).size; } catch { break; }
    if (bytes > LIMIAR_BRANCO) { corte = Math.max(0, t - 1); break; }
  }
  rmSync(sonda, { recursive: true, force: true });

  if (corte <= 0) {
    relatorio.push({ arquivo, cortadoSegundos: 0, nota: "nada a aparar" });
    continue;
  }

  const saida = join(DIR, `.aparado-${arquivo}`);
  // Recodifica (não copia) porque cortar em VP8 sem keyframe no ponto exato
  // deixaria o começo corrompido. `-an`: não há áudio, e nunca houve.
  execFileSync(FFMPEG, [
    "-v", "error", "-ss", String(corte), "-i", caminho,
    "-c:v", "libvpx", "-b:v", "1M", "-crf", "30", "-an", saida, "-y",
  ]);
  const antes = statSync(caminho).size;
  const depois = statSync(saida).size;
  rmSync(caminho);
  renameSync(saida, caminho);
  relatorio.push({ arquivo, cortadoSegundos: corte, bytesAntes: antes, bytesDepois: depois });
}

for (const r of relatorio) {
  console.log(`${r.arquivo.padEnd(40)} cortou ${String(r.cortadoSegundos).padStart(2)}s de branco${r.nota ? `  (${r.nota})` : ""}`);
}
