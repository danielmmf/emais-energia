---
name: conversation-bot-handoff
description: Use when implementing or adjusting WhatsApp conversation automation with per-conversation bot enable/disable, human handoff, Groq replies, and AI context built from lead, products, and campaigns.
---

# Conversation Bot Handoff

Implemente o handoff entre robo e atendimento humano por `conversation`, nao por regra global solta.

## Quando usar

Use esta skill quando o pedido envolver um ou mais pontos:

- botao para ligar ou desligar o robo em uma conversa especifica
- atendimento manual assumido por atendente
- respostas automaticas do Groq no WhatsApp
- contexto do robo com dados do lead, produtos e campanhas
- regras para novas conversas iniciarem com o robo habilitado

## Regra de produto

- Toda nova `conversation` deve nascer com o robo habilitado.
- O atendente pode desabilitar o robo naquela conversa e assumir manualmente.
- Enquanto a conversa estiver com robo desabilitado, o webhook nao deve responder automaticamente.
- O estado do robo deve ficar na `conversation`, nao apenas em `lead.is_bot_enabled`.

## Onde olhar primeiro

- `app/Models/Conversation.php`
- `app/Models/Lead.php`
- `app/Http/Controllers/ConversationController.php`
- `app/Http/Controllers/ConversationEngine.php`
- `app/Http/Controllers/WhatsAppWebhookController.php`
- `app/Services/GroqChatService.php`
- `app/Models/Product.php`
- `app/Models/Campaign.php`
- `resources/views/conversations/show.blade.php`
- `resources/views/leads/show.blade.php`
- `routes/web.php`
- `routes/api.php`

## Diagnostico atual do codigo

- O webhook hoje dispara o robo usando `lead->is_bot_enabled`.
- O `ConversationEngine::shouldUseAI()` tambem depende de `lead->is_bot_enabled`.
- O contexto do Groq hoje inclui basicamente dados simples do lead.
- A tela de conversa ainda nao tem controle explicito de handoff por conversa.

Nao reforce esse desenho. A implementacao correta precisa migrar a decisao para a conversa.

## Implementacao esperada

### 1. Persistencia

Adicione um campo de estado do robo em `conversations`, por exemplo:

- `is_bot_enabled`
- ou `bot_mode`

Preferencia:

- `is_bot_enabled` boolean
- default `true`

Tambem vale considerar um marcador de handoff manual se a regra exigir historico mais claro, mas nao complique sem necessidade.

### 2. Fluxo de entrada

No `WhatsAppWebhookController`:

- encontrar ou criar o lead
- encontrar ou criar a conversa ativa
- salvar a mensagem inbound
- so chamar `ConversationEngine` se o robo estiver habilitado naquela conversa

### 3. Handoff manual

Na tela da conversa:

- adicionar um botao ao lado do cabecalho ou das acoes principais
- rotulo claro, por exemplo `Robo ativado` / `Atendimento manual`
- a troca deve ser imediata e persistida

Quando um atendente enviar mensagem manualmente, preserve a regra definida pelo usuario:

- se a decisao do produto for "enviou manualmente, assume humano", desabilite o robo na conversa
- se a decisao for depender apenas do botao, mantenha isso consistente em todo o fluxo

Nao misture as duas regras sem alinhar o comportamento.

### 4. Motor de resposta

No `ConversationEngine`:

- troque a checagem de IA para usar a conversa
- mantenha fallback seguro quando Groq falhar
- nao envie resposta automatica se a conversa estiver em modo manual

Se houver transferencia para humano por palavra-chave, isso deve desabilitar o robo da conversa ou mudar explicitamente o estado equivalente.

### 5. Contexto do Groq

Enriqueça `buildContext()` com:

- dados do lead: nome, telefone, email, estagio, intencao, cidade, empresa, faixa de orcamento, notas
- produtos ativos do usuario dono do lead
- campanhas relevantes do usuario dono do lead

Priorize contexto curto e util. O prompt deve ajudar a vender e qualificar, nao despejar tabela inteira.

Estrutura sugerida:

```text
CLIENTE
- nome
- telefone
- estagio
- intencao

PRODUTOS ATIVOS
- nome: descricao curta / preco

CAMPANHAS
- nome: mensagem principal / status
```

Se houver muitos produtos ou campanhas:

- limite a quantidade
- prefira itens ativos e recentes
- resuma texto longo

## Cuidado com ownership

Produtos e campanhas sao por usuario. Antes de montar contexto:

- descubra quem e o `user_id` dono do lead
- carregue apenas `products` e `campaigns` desse usuario
- nao vaze dados de outro usuario

Se o lead ainda estiver sem `user_id`, defina uma regra clara antes de implementar o contexto.

## Rotas e UI

Normalmente sera necessario:

- rota POST ou PATCH para alternar o modo do robo na conversa
- botao ou switch em `resources/views/conversations/show.blade.php`
- feedback visual claro do estado atual

O estado deve aparecer sem depender de inspeção manual do banco.

## Validacao minima

Depois da alteracao, valide pelo menos:

1. conversa nova entra com robo habilitado
2. inbound com robo habilitado dispara Groq
3. desligar o robo impede auto resposta
4. reply manual continua funcionando
5. religar o robo volta a permitir resposta automatica
6. contexto enviado ao Groq inclui lead, produtos e campanhas corretos

## Nao fazer

- nao depender apenas de `lead.is_bot_enabled` para handoff por conversa
- nao montar contexto com produtos ou campanhas de outro usuario
- nao criar automacao global que desliga o robo para todos os leads
- nao deixar a UI sem indicar claramente se o robo esta ativo ou nao
