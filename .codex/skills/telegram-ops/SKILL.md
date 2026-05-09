---
name: telegram-ops
description: Operacao de notificacao via Telegram e triagem de mensagens em issues GitHub.
---

## Objetivo
Enviar status de inicio/fim de deploy e transformar mensagens do Telegram em issues acionaveis.

## Passos obrigatorios
1. Configurar `TELEGRAM_BOT_TOKEN` no `.env`.
2. `TELEGRAM_CHAT_ID` e opcional; vazio envia para todos os chats ativos do bot.
3. Antes de publicar, enviar aviso de inicio via `scripts/ops/telegram_notify.sh`.
4. Apos deploy + Playwright, enviar aviso de conclusao.
5. Rodar `npm run ops:telegram-to-issues` para converter mensagens `/issue ...` em issue no GitHub.

## Resultado esperado
- Historico de operacao no Telegram.
- Backlog atualizado automaticamente via mensagens do chat.
