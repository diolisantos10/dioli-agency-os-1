# 🔴 O retrato dos convites devolve NOME de cliente na mesma rota de chave-na-URL

## O ACHADO — escalado pelo `seguranca`, e é código do próprio Diretor
`lib/agency/comercial/retrato-dos-convites.ts:158` faz
`parcerias.clientes_de_nome_colidente` devolver **`nome` do cliente**, na rota
`/api/piloto/diagnostico`, **cujo segredo trafega em `?chave=`** e aparece em log de
proxy/CDN.

**É a mesma classe de exposição que acabou de ser fechada na auditoria de cobrança.**
Foi autorizada pelo Diretor em 29/08 para um fim legítimo — achar cadastro
duplicado da Foocci — e ficou.

⚠️ O especialista que achou **não consertou de propósito**, dizendo que mexer sem
parecer específico seria ampliar a própria autorização. **Está certo.** Este é o
parecer específico.

## POR QUE O NOME PARECIA NECESSÁRIO — e por que não é
A pergunta é *"há dois cadastros com o mesmo nome?"*. Parece exigir o nome. **Não
exige.**

O agrupamento por nome normalizado acontece **dentro** do módulo. O que sai pode ser
só: **os ids do grupo** e **qual deles tem parceria viva**. Quem recebe a lista abre
o painel **com sessão** e vê os nomes lá — que é onde nome de cliente deve ser lido.

**Calcule com o nome; não emita o nome.** É exatamente o padrão que a auditoria de
cobrança acabou de adotar, e ele fecha inclusive o desvio de "renomear o campo na
saída", porque a estrutura de dados deixa de carregar nome.

## O CONSERTO
1. Tire o campo de nome da saída de `clientes_de_nome_colidente` — **do tipo e do
   módulo puro**, não só da resposta HTTP.
2. O agrupamento por nome normalizado **continua igual** — é ele que responde a
   pergunta.
3. A saída fica: **ids do grupo**, **qual tem parceria viva**, e o **tamanho do
   grupo**.
4. ⚠️ **A capacidade de responder a pergunta NÃO pode se perder.** Se depois do
   conserto ninguém mais consegue saber que existem dois cadastros para o mesmo
   negócio, você quebrou o instrumento em vez de protegê-lo. **Prove que a pergunta
   continua respondida.**

## ⛔ FRONTEIRAS
- ⛔ **Não afrouxe `__tests__/plataforma/diagnostico-mede-e-nao-escreve.test.ts`** —
  é a guarda, e ela vence.
- ⛔ Nenhum verbo de escrita no caminho. A rota é somente leitura.
- ⛔ O **prefixo de 8 caracteres do token** continua como está — ele já é a decisão
  certa e não é PII.
- ⛔ Não toque em `prisma/schema.prisma`, `ParceriaDoCliente`, `Publication`.
- **Não commite. O Diretor commita e roda o portão.**

## CRITÉRIO DE ACEITE
1. `npx vitest run __tests__/plataforma/diagnostico-mede-e-nao-escreve.test.ts` →
   **verde, sem ter sido editado**.
2. Os testes do retrato dos convites continuam verdes — **e a asserção de que a
   pergunta do duplicado continua respondida** existe e é explícita.
3. **Asserção negativa obrigatória:** o objeto de saída **não tem** campo de nome —
   checado por `Object.keys`, não por campo isolado.
4. **Quebre de propósito e veja VERMELHO:** reponha o nome na saída e prove que a
   guarda de PII acusa.
5. `npx tsc --noEmit` limpo.
6. ⚠️ **Se não conseguir rodar `npx`, DIGA NO TOPO** e não apresente raciocínio como
   medição.
7. **Declare o que não conseguiu provar.**
