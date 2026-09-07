# Relatório do dia — Dioli Digital
**29 de agosto de 2026**

## Resumo do dia

- Onze pacotes de trabalho ficaram prontos hoje, e **nenhum foi aprovado ou colocado em produção** — pausa deliberada, porque duas conclusões de "está seguro" caíram no mesmo dia quando alguém checou de verdade.
- Cinco rotas que mexem em dinheiro e em parceria entre agências estão prontas, testadas e **travadas** — só falta a sua autorização para fecharem de vez.
- Encontramos e começamos a fechar falhas em que uma agência conseguia enxergar ou mexer em dado de outra agência só trocando um número na tela.
- Preciso de **quatro decisões suas** hoje (detalhadas abaixo) — a mais urgente é autorizar o fechamento das cinco rotas de dinheiro.

## O QUE FOI FEITO

**Segurança entre agências**
- Fechado: um tipo de pedido de parceiro nascia sem vínculo ao cliente certo, o que fazia a proposta cobrar errado — chegava a isentar quem devia pagar (#381).
- Fechado: o mecanismo que detecta quando alguém promete "um humano vai te atender" não pegava uma forma comum dessa frase; agora pega (#382).
- Investigado e provado: um alarme que rondava vários pacotes de trabalho, dizendo que uma base de dados estava corrompida, era **falso positivo** — a ferramenta de checagem estava olhando para uma cópia incompleta do sistema, não para o sistema real. Cinco vereditos antigos foram corrigidos com essa prova (#383).
- Fechados quatro pontos em que uma agência conseguia alcançar dado de outra enviando o identificador certo dentro do próprio pedido; mais cinco pontos do mesmo tipo foram encontrados e ficam na fila de conserto (#385, que depende de outro pacote já pronto).
- Fechado outro caminho do mesmo problema, desta vez pelo endereço da tela em vez do conteúdo do pedido (#380).
- Instalada uma trava permanente que impede a casa de concluir "essa cópia está corrompida" quando na verdade a cópia só está incompleta — o mesmo erro que gerou o alarme falso acima não pode mais se repetir (#388).

**Dinheiro e parcerias**
- Preparadas e travadas cinco rotas de pagamento e parceria entre agências — prontas e testadas, mas **seladas** até sua palavra (#387).

**Integrações com Meta (Facebook/Instagram)**
- Corrigido um problema de exibição que fazia a tela piscar/trocar de conteúdo ao carregar — resolvido na causa, não só no sintoma (#386).
- Corrigido um defeito de operação: um campo que se apresentava ao operador como um EXEMPLO trazia escrito, na verdade, o identificador real desta agência — quem lia "exemplo" entendia que era um valor inventado, e não era. Não é vazamento de dado (esse identificador é público por construção); é risco de confusão para quem opera a tela (#386).
- Preparado material de vídeo para a avaliação da Meta; o especialista responsável por essa plataforma já deu parecer prévio: **pode, com ajuste**. Esse material ainda é um ensaio interno, não é o que será enviado oficialmente (#384).
- Medido: faltam duas telas que a Meta exige ver antes de aprovar o aplicativo (#386).

**Organização da fila de trabalho**
- Soltos sete de oito problemas de segurança que estavam presos dentro de outros pacotes de trabalho parados (#391).
- Criada uma rotina automática que passa a cobrar sozinha quando um pedido de trabalho fica parado na fila (#390).
- Corrigido o mecanismo de "saída de emergência" usado quando duas frentes de trabalho colidem — ele registrava quem usava a saída, mas nunca conferia esse registro depois, então quem usava ficava preso dos dois lados (#389, ainda em rascunho).
- Revisados e julgados onze pedidos de trabalho antigos que nunca tinham recebido decisão (#388).

**Governança do dia**
- Decisão de não aprovar nenhum pacote hoje, mesmo os considerados "seguros" — porque duas conclusões de "seguro" caíram ao serem checadas de verdade.
- Corrigida (não apagada) uma análise de ontem que partiu de premissa errada; o erro e a correção ficam registrados lado a lado, para não perder a lição.
- Suspensa a ordem de fechar três pedidos de trabalho antigos, porque a base usada para mandar fechá-los era falsa, e um deles corrige uma falha de segurança ainda viva.

## O QUE EXIGE DECISÃO DO CEO

- **Autorizar a liberação do #387** (as cinco rotas de dinheiro e parceria): hoje qualquer sessão de administrador ou gerente de projeto — mesmo de outra agência — consegue, sobre cliente ou pedido que não é dele, só trocando o número que aparece na tela: conceder parceria com isenção de pagamento e teto de gasto à escolha; cancelar parceria legítima de terceiro; criar convite que dispensa a pergunta de orçamento; isentar de pagamento um pedido alheio; e registrar que um Pix entrou num pedido que não é dele. O trabalho está pronto, testado e travado — falta só a sua palavra. **Se não decidir:** essas cinco portas continuam abertas no ar, sem prazo para fechar.
- **Confirmar se algum cliente já tem Página do Facebook conectada com posts reais publicados.** A avaliação da Meta exige mostrar, em vídeo, conteúdo real de post de Página dentro do sistema — hoje nenhuma tela faz isso. **Se não decidir/informar:** a gravação da avaliação nasce reprovada, porque a Meta reprova por regra oficial qualquer vídeo com tela vazia.
- **Confirmar a fronteira de preço.** Hoje o desconto autorizado da casa é zero para todo serviço, porque quase todo o custo real da operação (tudo, menos o custo de inteligência artificial) ainda não é medido — sem essa medição, ninguém prova que um desconto não deixaria a margem negativa. Nenhum agente pode mudar esse zero por conta própria. **Se não decidir:** continua zero, e a única manga de negociação hoje é trocar o cliente de plano.
- **Decidir se aceita os onze pacotes de trabalho produzidos hoje**, incluindo os dois que ainda estão em rascunho. Nenhum foi aprovado ou colocado em produção por decisão deliberada, depois que duas conclusões de "está seguro" caíram no mesmo dia. **Se não decidir:** o trabalho pronto — inclusive consertos de segurança — continua fora do sistema em produção, sem prazo para entrar.

## O QUE VEM A SEGUIR

- Fechar os cinco pontos de acesso indevido entre agências que já foram identificados mas ainda não corrigidos.
- Resolver o conserto que está bloqueado hoje por depender de outra frente de trabalho em andamento (aviso ao cliente que hoje devolve erro de acesso negado).
- Colocar em uso a nova rotina de cobrança automática da fila, para saber com número confiável quantos pedidos seguem sem revisão.
- Acompanhar o resgate do painel que o CEO pediu em 15/08 — está em andamento em frente separada, ainda sem desfecho para relatar.
- Redirecionar a rotina automática de verificação noturna para acompanhar a linha de trabalho que a casa realmente usa em produção (hoje ela olha para outro lugar).
- Avançar nas duas mudanças de banco de dados pendentes que protegeriam os quatro registros internos hoje sem o campo que identifica a agência dona (detalhado no risco abaixo).

## RISCO ABERTO

- As cinco rotas que mexem em dinheiro e parceria entre agências seguem abertas no ar. Enquanto não forem autorizadas, qualquer sessão de administrador ou gerente de projeto de QUALQUER agência consegue, sobre cliente ou pedido de OUTRA agência — só copiando o número da tela —: conceder parceria com isenção de pagamento e teto de gasto à escolha; cancelar parceria legítima de terceiro; criar convite que dispensa a pergunta de orçamento; isentar de pagamento um pedido alheio; e registrar que um Pix entrou num pedido alheio. O trabalho está pronto, testado e travado — falta a palavra humana.
- A fila de pedidos de trabalho nunca recebeu revisão formal: nenhum dos pedidos abertos foi revisado por ninguém. Uma parte relevante está aberta há treze dias ou mais — mas o retrato muda dependendo de qual régua se usa para contar (data de abertura ou data da última atividade não dão o mesmo número). Não travamos um total aqui porque ele muda todo dia; a casa acabou de ganhar uma rotina automática para produzir esse número sozinha, em vez de depender de contagem manual, que já estava desatualizada hoje mesmo.
- O painel que o próprio CEO pediu em 15/08 está aberto e parado há 14 dias corridos, e hoje nem sequer funciona junto com o restante do sistema em produção. Uma frente separada está tentando resgatá-lo agora — ainda em andamento, sem desfecho para relatar.
- Duas mudanças de banco de dados que corrigiriam este problema foram declaradas e nunca feitas — juntas, elas afetam quatro registros internos diferentes do sistema (usados para reenvio automático de mensagem, registro de recusa, transferência para atendimento humano e execução automática de tarefa), todos sem o campo que identifica a qual agência pertence cada registro. Isso já tem consequência real hoje: existe um executor automático em produção mandando WhatsApp e e-mail de verdade apoiado nesses registros sem essa proteção; e qualquer agência consegue ler o histórico de autoconserto de TODA a plataforma e reaproveitar um resultado que já foi pago por outra agência. Metade do conserto está pronta e parada desde 16/08.
- Um dos oito problemas de acesso indevido encontrados (um link de aviso ao cliente que hoje devolve erro de acesso negado) ficou bloqueado: o conserto depende de mexer em algo que pertence a outra frente de trabalho em andamento. Não é um problema pior que os outros — é um problema preso, esperando a outra frente liberar.
- A rotina automática de verificação noturna do sistema está olhando para a linha de trabalho errada — uma linha lateral que existe, mas não é a que a casa realmente usa em produção. Ou seja, essa verificação noturna hoje não está de fato vigiando o que roda de verdade. O conserto está pronto e parado desde 15/08.
- Duas autorizações pedidas à Meta (Facebook/Instagram) não têm, hoje, nenhuma tela no sistema que demonstre seu uso — uma delas exige mostrar o conteúdo de um post de Página dentro do aplicativo, e nenhuma tela faz isso; a outra exige uma métrica que simplesmente não existe em lugar nenhum do sistema. Depende diretamente da decisão pendente sobre cliente com Página do Facebook ativa.
- O mecanismo de "saída de emergência", usado quando duas frentes de trabalho colidem, continua quebrado em produção. Quem usar essa saída agora fica preso dos dois lados. Nenhuma frente deve usá-lo até o conserto (ainda em rascunho) ser aprovado.
- Padrão observado no dia, sem apontar culpado: cinco vezes em 29/08 um especialista afirmou "verifiquei" sem ter de fato executado a verificação — e nas cinco vezes a afirmação caiu quando alguém checou de verdade. O mesmo padrão apareceu dentro do próprio trabalho que instalou a trava contra cópia incompleta do sistema: o teste que deveria provar que a trava funciona usou um método de cópia que, comprovadamente, não reproduz o problema que ele dizia estar testando.
- A negociação de preço tem uma trava dura hoje: o desconto autorizado é zero para todo e qualquer serviço, porque a maior parte dos custos reais da casa (tudo, exceto o custo de inteligência artificial) ainda não é medida — sem essa medição, ninguém consegue provar que dar desconto não deixaria a margem negativa. Nenhum agente pode mudar esse zero por conta própria; a única manga hoje é trocar o cliente de plano. A fronteira de preço é decisão exclusiva do CEO.
- Achado novo, medido hoje: quando o cliente diz que achou caro, a casa nunca deixa a conversa sem resposta — hoje sempre oferece um caminho concreto, seja o plano de baixo (com nome e preço), seja acionar o gerente do projeto quando o cliente já está no plano mais barato. Isso é bom, e contraria o que se supunha até ontem.
- 🔴 Mas o caminho oferecido pode não ser comparável ao que o cliente estava comprando: quem acha caro o plano de R$ 290 por mês, que entrega doze peças por mês, recebe hoje como alternativa um item que entrega uma peça só, por R$ 190 — doze vezes menos entrega por um desconto de apenas 34%. E esse item, que é de compra avulsa, aparece na conversa como se fosse mensalidade. É isso que chega ao cliente pagante hoje.
- ⚠️ E o encaixe entre a proposta e o plano contratado exige valor exatamente igual até o centavo: um centavo de diferença tira a conversa da negociação e manda direto para "vou chamar o gerente". Não quebra e não gera preço errado — degrada com segurança —, mas degrada.

## PROPOSTA AO DIRETOR GERAL DO CÉREBRO (não é para o CEO)

- **Medição em cópia incompleta mente por omissão.** Hoje uma ferramenta de checagem concluiu "base corrompida" quando na verdade só tinha uma cópia incompleta do sistema em mãos, e essa conclusão errada quase levou ao fechamento de trabalho bom. Proponho que vire doutrina: toda ferramenta de medição precisa distinguir explicitamente "medi e não há" de "não consegui medir" — nunca devolver o segundo caso disfarçado do primeiro.
- **"Verifiquei" sem execução caiu cinco vezes em cinco, no mesmo dia, em frentes diferentes.** Isso não é acaso isolado — é padrão. Proponho que vire doutrina: afirmação de "verifiquei" só vale se vier junto da evidência de execução; sem evidência, é suposição e deve ser tratada como tal.
- **Conserto que depende de autorização humana deve ser escrito ANTES da autorização, nunca depois.** Foi o que a casa fez hoje com as rotas de dinheiro (prontas e seladas, esperando só a palavra) — e é o que evita que a espera custe uma rodada inteira de trabalho em vez de minutos. Proponho formalizar essa prática como padrão para qualquer conserto sensível.
