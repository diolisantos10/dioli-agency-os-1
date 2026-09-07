# Critérios de aceite — Instagram Story V1

## Regra principal

O teste precisa observar o artefato final. Estado interno sem arquivo não vale.

## A. Identidade do pedido

- [ ] O pedido contém cliente, projeto, objetivo e texto original.
- [ ] A triagem devolve `instagram_story_estatico_v1`.
- [ ] O formato permanece `story` em todas as transições.
- [ ] Story não usa preço nem contrato de post para feed.
- [ ] Reentrada e clique duplicado não criam segunda peça.

## B. Briefing e marca

- [ ] O briefing mínimo é cobrado antes da produção.
- [ ] Fato ausente não vira invenção.
- [ ] Logo, cores, fontes, tom e proibições chegam ao produtor.
- [ ] Material já enviado não é pedido novamente.
- [ ] Ausência de marca é declarada; molde neutro não é chamado de identidade do cliente.

## C. Produção visual

- [ ] Existe `SocialPost` ligado ao pedido.
- [ ] `format` é `story`.
- [ ] O arquivo final existe.
- [ ] A dimensão é exatamente 1080×1920.
- [ ] O MIME final é `image/jpeg` no caminho publicável.
- [ ] As margens seguras de topo, base e laterais foram respeitadas.
- [ ] O texto rasterizado é o texto aprovado, sem alteração silenciosa.
- [ ] A logo utilizada é o arquivo oficial do cliente quando fornecido.
- [ ] `mediaUrl` retorna HTTP 200 e os bytes do arquivo correto.

## D. Qualidade

- [ ] O piso de verdade analisa título, CTA, preço, data e contato.
- [ ] A régua da marca analisa a peça final.
- [ ] Dimensão, MIME, contraste e margem são validados deterministicamente.
- [ ] Qualidade recusada não chega ao cliente como aprovada.
- [ ] Falta de árbitro aparece como estado próprio e não como aprovação.

## E. Portal do cliente

- [ ] O cartão mostra a imagem real em tamanho legível.
- [ ] O cliente pode abrir a peça completa.
- [ ] Aprovar registra autoria do cliente.
- [ ] Ajustar exige comentário e cria nova versão da mesma peça.
- [ ] Recusar exige motivo e impede entrega/publicação.
- [ ] O cliente pode baixar o arquivo aprovado.
- [ ] Nenhuma decisão em massa inclui peça invisível.

## F. Estados e recuperação

- [ ] Falha de provedor volta para fila com limite de tentativas.
- [ ] Falta de Chromium para antes de gastar imagem.
- [ ] Falta de pagamento não consome produção.
- [ ] Falta de material produz uma solicitação acionável.
- [ ] Nenhuma falha termina em `done`.
- [ ] Toda parada mostra motivo, dono e próxima ação.
- [ ] O relógio recupera estados transitórios sem criar duplicatas.

## G. Provas obrigatórias

### Caso normal — repetir três vezes

- [ ] pedido enviado pelo portal;
- [ ] triagem automática;
- [ ] peça visual gerada;
- [ ] Qualidade aprovada;
- [ ] cliente aprovou pelo portal;
- [ ] arquivo baixado e conferido;
- [ ] nenhuma intervenção no banco;
- [ ] nenhuma intervenção manual entre etapas.

### Caso de ajuste

- [ ] cliente aponta mudança específica;
- [ ] somente a peça apontada volta;
- [ ] versão anterior é preservada;
- [ ] nova imagem é apresentada;
- [ ] cliente aprova a nova versão.

### Caso de recusa

- [ ] cliente recusa com motivo;
- [ ] estado fica recusado;
- [ ] peça não entra na fila de entrega/publicação;
- [ ] PM recebe próxima ação.

### Caso de falha

- [ ] uma dependência é simulada como indisponível;
- [ ] nenhum arquivo inválido é apresentado;
- [ ] pedido não recebe falso `entregue` ou `done`;
- [ ] o painel mostra a causa real.

## H. Publicação Meta — fase posterior

- [ ] Instagram do parceiro conectado.
- [ ] token válido.
- [ ] permissão aplicável comprovada.
- [ ] mídia JPEG pública acessível pela Meta.
- [ ] publicação feita somente depois da aprovação do cliente.
- [ ] ID retornado pela Meta foi persistido.
- [ ] falha da Meta não apaga o arquivo aprovado.

## Condição de reprovação imediata

Qualquer uma destas ocorrências reprova a entrega:

- `Deliverable` textual apresentado como Story;
- imagem ausente;
- preview quebrado;
- formato quadrado;
- card sem corpo visual;
- aprovação sem autoria do cliente;
- `done` com `mediaUrl` vazia;
- teste que chama função interna e ignora a porta real do portal;
- evidência produzida manualmente fora da corrente construída.
