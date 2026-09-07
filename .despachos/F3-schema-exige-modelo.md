# 🔴 Feche a porta: reivindicação no schema SEM modelo some da trava

## O QUE ACABOU DE ENTRAR, e o buraco que ele deixou
`prisma/schema.prisma` passou a colidir por **modelo** (`schema.prisma#Modelo`), e
está certo — as duas metades foram provadas por mutação (10 vermelhos forçando
"sempre colide", 9 forçando "nunca colide").

**Mas a compatibilidade com o formato antigo é fail-OPEN:** uma reivindicação que
cita `"prisma/schema.prisma"` **sem modelo** não colide com **nada** — nem com outra
sem modelo. Está documentado em `lib/coordenacao/reivindicacoes.ts:356-376` e foi
decisão deliberada, porque é o que destrava as duas frentes vivas de hoje.

⚠️ **O problema: quem omitir o modelo some da trava.** Uma trava que se desliga por
omissão não é trava — e esta casa já tem prova em disco de que gente contorna
(`forcadaPor` gravado nos próprios arquivos de reivindicação).

## O CONSERTO — prospectivo, nunca retroativo
**Ao ABRIR uma reivindicação que cite `prisma/schema.prisma`, o comando passa a
EXIGIR o modelo.** `npm run reivindicar -- abrir --arquivos prisma/schema.prisma`
recusa, com mensagem que ensina o formato:
`prisma/schema.prisma#ParceriaDoCliente`.

⛔ **NÃO mexa na régua de colisão.** As reivindicações **que já existem** sem modelo
continuam como estão — não colidindo. **Não as quebre e não as converta.** O
fechamento é na PORTA DE ENTRADA, não no passado: mudar a régua reintroduz o
bloqueio que acabamos de tirar da casa.

*Recusar na entrada é barato e honesto; recusar depois de o trabalho existir é caro
e injusto.* É a mesma lição do seed desta madrugada: **conferir pré-requisito antes
da primeira escrita.**

## DETALHES QUE IMPORTAM
- A recusa vem **antes** de escrever, commitar ou empurrar qualquer coisa — o
  `comandoAbrir` já tem esse formato (`exigirBranchAlinhado` roda antes do
  `writeFileSync`). **Siga o padrão que já está lá.**
- A mensagem tem de **ensinar**, não só negar: dizer o formato aceito e dar um
  exemplo real do repositório.
- **`encerrar` e `conferir` NÃO mudam.** Só `abrir`.
- Se houver uma saída de emergência (`--forcar`), ela continua valendo — mas o
  motivo escrito continua obrigatório.

## FRONTEIRAS
- ⛔ **Não toque em `ParceriaDoCliente` nem `Publication`** — frentes vivas.
- ⛔ Não altere o teto de 24h nem a regra de "velha não bloqueia".
- ⛔ Não encerre reivindicação de ninguém. ⛔ Nada de cancelamento/multa/reembolso.
- **Não commite. O Diretor commita e roda o portão.**

## CRITÉRIO DE ACEITE
1. **Quem CHAMA** o que você mudou — arquivo e linha.
2. Teste rodando o script **como processo** contra um repositório git descartável
   (o molde existe: `__tests__/coordenacao/reivindicar-guarda-antes-de-escrever.test.ts`):
   - `--arquivos prisma/schema.prisma` (sem modelo) → **recusa, e NADA é escrito,
     commitado ou empurrado**;
   - `--arquivos prisma/schema.prisma#ModeloDeTeste` → **abre normalmente**;
   - `--arquivos lib/qualquer.ts` → **abre normalmente** (a exigência é só do schema).
3. **Quebre a trava de propósito e veja VERMELHO**; desfaça; relate.
4. **As reivindicações antigas sem modelo continuam sem colidir** — prove que você
   não mexeu na régua.
5. `npx tsc --noEmit` limpo · `npx vitest run __tests__/coordenacao` verde.
6. ⚠️ **Se não conseguir rodar `npx`, DIGA NO TOPO** e não apresente raciocínio como
   medição.
7. **Declare o que não conseguiu provar.**
