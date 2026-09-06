// ─── O marcador de envio bloqueado — ficha 06/09/2026 ───────────────────────
//
// A CONSTANTE em si, e nada mais. `gravar-candidatura.ts` GRAVA o marcador (a
// escrita) e `contratoDeOportunidade.ts` LÊ o marcador (a leitura, consumida
// por `CartaoDeOportunidade.tsx`, que é `"use client"`). As duas metades
// precisavam da MESMA string — e "importar de `gravar-candidatura.ts`" foi a
// primeira tentativa, mas esse arquivo importa (em cadeia, via
// `lib/agency/comercial/oportunidade.ts`) `crypto` e o cliente Prisma
// (`lib/db/client`), os dois só-servidor. Puxar isso para dentro do bundle do
// cliente não é "peso extra": é o build tentando resolver `crypto` no
// navegador e instanciar Prisma fora do Node. Por isso a constante mora
// SOZINHA, num arquivo sem nenhum outro import, e `gravar-candidatura.ts`
// REEXPORTA daqui — continua existindo UM SÓ lugar onde a string é escrita à
// mão; só o lugar físico mudou.
export const REGRA_ENVIO_BLOQUEADO_POR_CUSTO_DESCONHECIDO = "envio_bloqueado_custo_desconhecido";
