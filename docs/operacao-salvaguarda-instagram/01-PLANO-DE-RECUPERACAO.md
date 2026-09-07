# Plano de Recuperação — Operação Salvaguarda Instagram

## 1. Veredito

A Dioli não precisa de mais departamentos nem de três novos auditores. Precisa conectar os módulos que já possui em uma única corrente executável.

O bloqueio principal é estrutural: o pedido avulso do cliente termina em um entregável textual e não atravessa a criação de `SocialPost`, geração da imagem, aprovação visual e entrega do arquivo.

## 2. Evidências confirmadas no código

### 2.1 O produto solicitado se perde na triagem

Em `lib/agency/esteira/triagem.ts`, Story, post e carrossel usam o atendimento `post-ou-carrossel`, apontam para `design-criativo-social` e recebem o preço de `balcao-post-feed`.

Consequência: `story` não permanece como um tipo operacional próprio.

### 2.2 O produto correto existe, mas não é usado

Em `lib/agency/self-serve-catalog.ts`, existe `balcao-4-stories`, com saída 1080×1920. A triagem do pedido avulso não o seleciona.

### 2.3 O agente entrega descrição, não arquivo

Em `lib/agency/execution/especialistas.ts`, `design-criativo-social` recebe a ordem de descrever de três a quatro peças e tem `deliverableType: "design"`.

Em `lib/agency/execution/tipos-de-entrega.ts`, `design` não é publicável.

### 2.4 O motor do pedido termina antes da produção visual

Em `lib/agency/esteira/producao-de-pedido.ts`, o caminho cria `Deliverable`, cria `ApprovalRequest` e marca o pedido como `entregue`. Ele não cria `SocialPost`, não chama `produzirArtesPendentes` e não exige `mediaUrl`.

O teste `__tests__/esteira/o-pedido-que-produzia-cego.test.ts` registra explicitamente que este caminho continua não publicando nada.

### 2.5 A capacidade visual já existe em outro trilho

- `lib/agency/design/molde.ts` conhece `story` e 1080×1920;
- `lib/agency/execution/artes.ts` produz a imagem, aplica marca e protege as margens do Story;
- `lib/agency/esteira/publicacao.ts` sabe transformar entregas publicáveis em `SocialPost`;
- o portal já possui decisões de aprovação, ajuste e recusa.

O trabalho é conectar, não reescrever esses motores.

### 2.6 O piloto atual não prova o arquivo final

O cliente falso prova briefing, aceite, projeto, execução, apresentação e carimbo de aprovação. As verificações contam entregas e decisões, mas não exigem `SocialPost.format = "story"`, `mediaUrl`, 1080×1920 nem arquivo baixável.

Por isso um pacote textual pode ficar verde sem que exista um Story final.

## 3. Decisão operacional

### Preservar

- departamentos e agentes existentes;
- Project Manager como elo central;
- portão financeiro;
- piso de verdade;
- régua de marca;
- Qualidade;
- escada de exposição;
- auditoria e observabilidade;
- caminhos mensais atualmente existentes.

### Congelar durante a recuperação

- novos departamentos;
- novas redes sociais;
- Reel, vídeo, carrossel e tráfego pago;
- alterações cosméticas sem relação com a corrente;
- novas abstrações de orquestração;
- publicação real até a entrega visual estar provada.

### Construir

Um único produto canônico: `instagram_story_estatico_v1`.

## 4. Contrato do produto inicial

### Entrada mínima

1. o que comunicar;
2. objetivo;
3. chamada para ação;
4. oferta, preço ou data, quando houver;
5. imagem/material/referência, quando indispensável;
6. cliente e projeto responsáveis.

A produção herda automaticamente do Brand Hub:

- logo;
- cores;
- tipografia;
- tom de voz;
- proibições;
- referências visuais;
- fatos operacionais atestados.

### Saída mínima

- uma imagem final;
- 1080×1920;
- formato JPEG para compatibilidade com a Meta;
- preview no portal;
- `SocialPost.format = "story"`;
- `mediaUrl` válida;
- vínculo com pedido, cliente, projeto, agente e aprovação;
- download funcional;
- histórico de versão;
- estados aprovar, ajustar e recusar.

## 5. Arquitetura-alvo

```text
Pedido do cliente
  → classificar como instagram_story_estatico_v1
  → conferir briefing mínimo e pagamento
  → carregar Brand Hub e materiais
  → gerar copy e direção visual
  → criar SocialPost(format=story)
  → gerar imagem 1080×1920
  → aplicar molde, logo, fontes e margens seguras
  → validar verdade, marca, dimensão e arquivo
  → criar aprovação ligada à peça visual
  → cliente aprova | pede ajuste | recusa
  → guardar versão final e liberar download
  → opcional: publicar, somente com portões Meta comprovados
```

Uma função orquestradora deve ser a única porta desta corrente. Pedido avulso, balcão, portal e futuro pacote mensal devem chamá-la, em vez de manter caminhos independentes.

## 6. Responsabilidade operacional

### Diretor Geral

- dono da missão e do recorte;
- impede expansão de escopo;
- exige evidência, não relato;
- recebe apenas decisões de negócio ou risco irreversível;
- não executa código nem aprova peça no lugar do cliente de teste.

### Project Manager

- dono de uma única fila da operação;
- acompanha estado, prazo, dependência e handoff;
- não reclassifica tecnicamente a peça;
- não declara conclusão sem o checklist de aceite.

### Arquiteto de Recuperação

- dono técnico da corrente inteira;
- reaproveita módulos existentes;
- elimina a divergência entre pedido avulso e pacote;
- entrega código, testes, migrações necessárias e evidências.

### Auditor de Jornada Ponta a Ponta

- não desenvolve a solução que audita;
- executa o caso normal, ajuste, recusa e falha;
- reprova qualquer conclusão baseada apenas em `done`, texto ou deploy verde.

### Agentes existentes

- Branding fornece a régua;
- Social Media produz copy;
- Design produz o arquivo;
- Qualidade julga o artefato final;
- Project Manager coordena os handoffs.

Não criar novos agentes antes de provar que uma responsabilidade necessária não possui dono.

## 7. Fases de execução

### Fase 0 — leitura e prova do diagnóstico

O Arquiteto deve responder, antes de editar:

1. qual é a corrente atual do pedido de Story;
2. em qual linha o tipo `story` se perde;
3. por que nasce `Deliverable` sem `SocialPost`;
4. quais módulos existentes serão reutilizados;
5. quais arquivos pretende alterar;
6. como provará que não afetou os demais produtos.

Sem essa devolutiva, não inicia construção.

### Fase 1 — identidade canônica do produto

- criar `instagram_story_estatico_v1` no registro único de produtos/tipos;
- separar Story de post e carrossel na triagem;
- impedir mapeamento para `balcao-post-feed`;
- preservar quantidade, formato e preço até o final da corrente.

### Fase 2 — corrente visual

- fazer o pedido criar a peça publicável correta;
- ligar a peça ao gerador já existente;
- produzir JPEG 1080×1920;
- gravar `mediaUrl` somente depois da validação;
- falhar de modo visível se renderizador, logo obrigatório ou imagem não estiverem disponíveis.

### Fase 3 — portal e decisão

- apresentar a imagem real, não apenas descrição;
- permitir aprovar, ajustar e recusar;
- associar feedback à peça e à versão correta;
- refazer somente a peça apontada;
- liberar download após aprovação.

### Fase 4 — prova ponta a ponta

Rodar quatro casos:

1. normal: briefing completo → arquivo aprovado;
2. ajuste: cliente pede mudança → versão nova → aprovação;
3. recusa: cliente recusa → peça não é entregue/publicada;
4. falha: sem renderizador/provedor/material → estado acionável, sem falso `done`.

Executar três rodadas consecutivas do caso normal, sempre com banco limpo ou cliente isolado.

### Fase 5 — publicação controlada

Somente depois da Fase 4:

- confirmar conexão do Instagram do parceiro;
- confirmar permissões e App Review aplicáveis;
- confirmar JPEG público acessível;
- publicar em conta parceira explicitamente destinada ao piloto;
- guardar ID retornado pela Meta e URL/estado da publicação.

## 8. Portões de entrada do piloto

Antes de gastar IA ou imagem, o piloto precisa registrar:

- cliente e projeto válidos;
- pedido existente;
- pagamento confirmado ou pedido interno de teste formalmente identificado;
- Brand Hub mínimo ou degradação declarada;
- Chromium disponível;
- provedor de texto disponível;
- provedor de imagem disponível;
- espaço de armazenamento disponível;
- escada de Social e Design liberada para o cliente de teste.

Nenhum portão pode ser removido para obter um verde. Deve existir uma preparação válida do caso de teste.

## 9. Riscos que não podem ser escondidos

1. **Falso sucesso:** `done` sem mídia.
2. **Produto errado:** Story cobrado como feed.
3. **Aprovação às cegas:** cliente aprova texto sem ver imagem.
4. **Refação sem mira:** feedback altera várias peças.
5. **Marca incompleta:** molde neutro tratado como identidade do cliente.
6. **Arquivo incompatível:** PNG chega à Meta quando ela exige JPEG no caminho atual.
7. **Deploy sem prova:** Railway verde tratado como jornada verde.
8. **Dependência externa:** saldo/chave, Chromium, armazenamento ou conexão Meta indisponíveis.

## 10. Regra de encerramento

A Operação Salvaguarda termina quando:

- todos os critérios de `03-CRITERIOS-DE-ACEITE.md` passam;
- existem três provas consecutivas do caso normal;
- ajuste, recusa e falha também foram exercitados;
- o Auditor assinou o relatório com links para evidências;
- nenhuma regressão crítica foi introduzida;
- o Diretor recebeu relatório em `FEITO / EM ANDAMENTO / NÃO INICIADO / DECISÕES`.

Depois disso, a mesma corrente pode ser expandida, nesta ordem: carrossel, feed, Reel, TikTok e tráfego pago.
