// RAIO-X DA PARCERIA DA FOOCCI — LEITURA PURA, NENHUMA ESCRITA.
//
// POR QUE ISTO EXISTE. O parceiro (Marcos, Foocci) continua vendo cobrança. A
// concessão da parceria é por CLIENTE e o cadastro da FOOCCI nasceu DUAS vezes
// em 27/08 com 7 segundos de diferença (#400). Conceder no cadastro errado não
// conserta a tela dele e ainda cria uma segunda verdade sobre o mesmo parceiro.
//
// ⚠️ Por isso este passo é SÓ LEITURA. Medir antes de escrever, principalmente
// quando o alvo é ambíguo. A concessão vem depois, num segundo script, apontando
// para o id que este aqui provar ser o certo.
//
// Não imprime segredo nenhum: só id, nome, data e contagem.

import { PrismaClient } from "@/lib/generated/prisma/client";

const prisma = new PrismaClient();

const clientes = await prisma.client.findMany({
  where: { name: { contains: "oocci", mode: "insensitive" } },
  select: { id: true, name: true, email: true, createdAt: true },
  orderBy: { createdAt: "asc" },
});

console.log(`[RAIO-X] clientes com "oocci" no nome: ${clientes.length}`);
for (const c of clientes) {
  const parceria = await prisma.parceriaDoCliente.findUnique({
    where: { clientId: c.id },
    select: { id: true, validaAte: true, escopo: true, pecasContratadas: true, autorizadaPor: true },
  });
  const convites = await prisma.conviteDeParceria.count({ where: { clientId: c.id } });
  const projetos = await prisma.project.count({ where: { clientId: c.id } });

  console.log(
    `[RAIO-X] cliente=${c.id} nome=${JSON.stringify(c.name)} email=${JSON.stringify(c.email)} ` +
      `criado=${c.createdAt.toISOString()} parceria=${parceria ? `VIVA_ATE:${parceria.validaAte.toISOString()}` : "NENHUMA"} ` +
      `convites=${convites} projetos=${projetos}`,
  );
}

// ── SEGUNDA PERGUNTA, no mesmo deploy: o App Review tem por onde entrar? ────
//
// Todos os 6 vídeos de demonstração da Meta começam com o revisor fazendo login.
// Se o usuário de teste não existir, os seis morrem no primeiro passo — e isso
// reprova o ENVIO INTEIRO, não uma permissão.
//
// O seed da casa cria `pm@dioli.studio` com papel `project_manager`, que é
// exatamente o que o dossiê da Meta pede. Perguntar aqui custa uma linha e
// evita descobrir isso no domingo à noite.
//
// ⛔ NÃO imprime senha, hash nem token. Só se existe e com que papel.
const usuariosDeTeste = await prisma.user.findMany({
  where: { email: { in: ["pm@dioli.studio", "master@dioli.studio"] } },
  select: { email: true, role: true, createdAt: true },
});

console.log(`[APP-REVIEW] usuários do seed encontrados: ${usuariosDeTeste.length}`);
for (const u of usuariosDeTeste) {
  console.log(`[APP-REVIEW] email=${u.email} papel=${u.role} criado=${u.createdAt.toISOString()}`);
}
if (!usuariosDeTeste.some((u) => u.email === "pm@dioli.studio")) {
  console.log(
    "[APP-REVIEW] ⚠️ pm@dioli.studio NAO EXISTE — o revisor da Meta nao tem como entrar, " +
      "e os 6 videos param no primeiro passo. Rodar o seed em producao e decisao do CEO.",
  );
}

console.log("[RAIO-X] FIM — nenhuma escrita foi feita.");
await prisma.$disconnect();
