# 🔴 A trava de coordenação é GROSSA DEMAIS no schema. Libere por MODELO.

**Ordem do Diretor Geral, 30/08.** *"Duas salas mexendo em modelos diferentes do
mesmo arquivo não é colisão — é a régua sendo grossa demais. A colisão real é duas
salas no mesmo modelo, e só essa deve travar."*

## O QUE FOI MEDIDO
**Hoje, três sessões diferentes reivindicaram `prisma/schema.prisma`:** colunas de
preço, conta de serviço do Diretor Geral, e a mesa de comando do SDR. **Modelos
diferentes, seções diferentes, sem se tocarem.**

O sentinela (`__tests__/coordenacao/registro-de-reivindicacao.test.ts`) trata o
arquivo como recurso exclusivo, então **qualquer par de frentes vivas no schema
deixa a CI da casa inteira vermelha** — e ficou vermelha por horas, por colisões
que não existiam de verdade.

⚠️ **É o defeito do dia, na própria trava:** *régua no lugar errado bloqueia
trabalho bom e não pega o ruim.* E contradiz a regra escrita no `CLAUDE.md`:
**"colisão é por responsabilidade, não só por arquivo."**

## O QUE CONSTRUIR
`prisma/schema.prisma` deixa de colidir por **arquivo** e passa a colidir por
**modelo**.

- Uma reivindicação que cita o schema passa a poder declarar **quais modelos** toca.
- Duas frentes em **modelos diferentes** → **não colidem**.
- Duas frentes no **mesmo modelo** → **colidem, e travam como hoje**. Esta metade é
  obrigatória: sem ela você trocou uma régua grossa por régua nenhuma.

**Como declarar o modelo é decisão sua de projeto** — proponha e justifique. Uma
forma óbvia é o próprio caminho já aceitar `prisma/schema.prisma#ParceriaDoCliente`,
reaproveitando `normalizarCaminho`. **Meça antes de escolher**: leia
`lib/coordenacao/reivindicacoes.ts` inteiro (`conferirColisao`, `conferirRegistro`,
`normalizarCaminho`, `estaViva`) e diga o que menos mexe no que já funciona.

⚠️ **Compatibilidade obrigatória:** as reivindicações que **já existem** citam
`prisma/schema.prisma` sem modelo. Elas não podem quebrar nem virar coringa que
colide com tudo. **Decida e escreva o que acontece com elas** — e prove com teste.

⛔ **Não afrouxe nada além do schema.** Os outros arquivos continuam colidindo por
arquivo. Esta liberação é nominal e justificada: o schema é um arquivo que quase
toda frente precisa acrescentar algo, e por isso vira ponto de colisão crônico.

## AS DUAS METADES — obrigatórias, e é o teste que prova
1. **Não inventa problema no caso limpo:** duas frentes vivas em modelos
   **diferentes** do schema → sentinela **VERDE**.
2. **Pega o caso plantado:** duas frentes vivas no **mesmo** modelo → sentinela
   **VERMELHO**, nomeando o modelo.

*Meia trava é pior que trava nenhuma: parece inteira.*

## FRONTEIRAS
- ⛔ **NÃO toque em `ParceriaDoCliente` nem em `Publication`** — o Diretor Geral
  avisou que as duas têm frente viva. Se precisar delas como **exemplo de teste**,
  use nomes fictícios.
- ⛔ Não altere o teto de 24h nem a regra de "velha não bloqueia".
- ⛔ Não encerre reivindicação de ninguém.
- **Não commite. O Diretor commita e roda o portão.**

## CRITÉRIO DE ACEITE
1. **Quem CHAMA** o que você mudou — arquivo e linha, incluindo o sentinela e o
   gancho pré-push.
2. **Quebre cada trava de propósito e veja VERMELHO**, uma a uma: (a) faça modelos
   diferentes colidirem de novo; (b) faça o mesmo modelo **deixar** de colidir. As
   duas têm de cair.
3. `npx tsc --noEmit` limpo · `npx vitest run __tests__/coordenacao` verde.
4. ⚠️ **Se não conseguir rodar `npx`, DIGA NO TOPO** e não apresente raciocínio como
   medição.
5. **Declare o que não conseguiu provar.**
