# 🔴 VARREDURA — pare de consertar caso a caso. Ache TODO PII da rota de diagnóstico.

## POR QUE ISTO É VARREDURA E NÃO MAIS UM CONSERTO
Em poucas horas, **dois achados idênticos**, na mesma rota, **os dois autorizados
pelo Diretor**:
1. a auditoria de cobrança devolvia `businessName`;
2. o retrato dos convites devolvia `nome` do cliente.

Os dois foram fechados. **Consertar o terceiro quando ele aparecer é como esta casa
acumula o mesmo furo com nomes diferentes.** *Dois é padrão, não coincidência.*

## O RISCO CONCRETO, PARA CALIBRAR O JULGAMENTO
A rota `/api/piloto/diagnostico` é protegida por um segredo que trafega em
**`?chave=`** — e **query string aparece em log de proxy/CDN**. Quem capturar a chave
num log lê **tudo o que a rota devolve**. Então a pergunta não é *"está protegido?"*,
é **"o que vaza no dia em que a chave vazar?"**.

E há um agravante já registrado no próprio arquivo: se `PILOTO_SECRET` não estiver
configurada, o código cai em `CRON_SECRET` — **o segredo que autoriza ESCRITA**.
(Medido em produção: hoje a rota devolve 401 e não 503, então **alguma** chave está
configurada. Não dá para distinguir qual por fora.)

## O QUE FAZER
1. **Varra a resposta INTEIRA** de `app/api/piloto/diagnostico/route.ts` — todas as
   seções, não só as duas já consertadas. Para **cada campo** que sai, responda:
   *isto é PII, ou é contagem/id?*
2. **Varra os módulos que a alimentam** (`lib/agency/comercial/retrato-dos-convites.ts`,
   `preco-cheio-apos-negociacao.ts`, `volume-subestimado.ts`,
   `diagnostico-do-negocio.ts`, e o que mais achar). O campo tem de sair **do tipo**,
   não só da resposta.
3. **Procure a família inteira**, não só nome: telefone, e-mail, endereço, trecho de
   conversa, texto de briefing, nome de pessoa, `@` de rede social, valor que
   identifique um cliente específico.
4. **Traga a tabela**: seção · campo · é PII? · veredito (**fica** / **sai**) · por quê.

## ⚠️ A OUTRA METADE — não quebre o instrumento
A rota existe para o CEO **dimensionar e decidir sem terminal**. Se a varredura
esvaziar a resposta, você trocou um risco por uma cegueira.

**Para cada campo que sair, prove que a pergunta que ele respondia continua
respondida** — como no conserto do duplicado, onde o agrupamento por nome ficou
**dentro** do módulo e só os ids saíram. *Calcule com o dado; não emita o dado.*

**Se algum campo de PII for genuinamente insubstituível, NÃO o remova sozinho:**
traga o caso, com o que se perde, e o Diretor decide.

## ⛔ FRONTEIRAS
- ⛔ **Não afrouxe `__tests__/plataforma/diagnostico-mede-e-nao-escreve.test.ts`** —
  é a guarda, e ela vence. **Amplie-a**, se a varredura pedir.
- ⛔ Nenhum verbo de escrita. A rota é somente leitura, e continua.
- ⛔ O **prefixo de 8 caracteres do token** fica — já é a decisão certa e não é PII.
- ⛔ Não toque em `prisma/schema.prisma`, `ParceriaDoCliente`, `Publication`.
- ⛔ Não mexa na autenticação da rota nesta ficha — o fallback `CRON_SECRET` é
  **configuração**, e vira pendência escrita, não código.
- **Não commite. O Diretor commita e roda o portão.**

## CRITÉRIO DE ACEITE
1. **A tabela completa** — toda seção, todo campo. Campo não examinado é campo que
   vaza depois.
2. **Asserção negativa por `Object.keys`** para cada campo removido — não por campo
   isolado, para que um campo novo com outro nome também caia.
3. **Quebre de propósito e veja VERMELHO:** reponha um dos campos removidos e prove
   que a guarda acusa.
4. Para cada remoção, **a prova de que a pergunta continua respondida**.
5. `npx tsc --noEmit` limpo · suíte verde nos arquivos tocados.
6. ⚠️ **Se não conseguir rodar `npx`, DIGA NO TOPO** e não apresente raciocínio como
   medição.
7. **Declare o que não conseguiu provar.**
