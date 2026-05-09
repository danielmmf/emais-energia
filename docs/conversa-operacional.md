# Conversa Operacional — Viabilidade Verde

Arquivo de consulta contínua para mentores e equipe.

## Atualização (2026-05-09 18:33 BRT)

### O que foi feito
- Deploy automatizado em produção com gate: `push -> pull endpoint -> Playwright -> notificação Telegram`.
- Smoke test Playwright em produção estabilizado e passando.
- Notificador Telegram configurado para broadcast em chats ativos do bot.
- Worker contínuo do robô criado: `scripts/bot/telegram_groq_worker.js`.
- Integrações do worker:
  - leitura contínua do Telegram (long polling);
  - resposta com Groq (`GROQ_API_KEY` no `.env`);
  - criação de issues via `/issue ...`;
  - gravação em Firebase Realtime (`botMessages`, `botReplies`, `botRuntime`, `botIssues`);
  - atualização de consenso em `docs/consenso-mentores.md`.
- Tela de monitoramento em tempo real criada: `/monitor.php`.
- Registro de acessos de mentores também no Firebase (`mentorAccesses`) adicionado na landing.

### O que foi pensado / decisões
- Tokens não são exibidos em mensagens nem versionados.
- Feedback de mentores deve entrar em consenso rastreável (arquivo + issue quando aplicável).
- Monitor único para decisões operacionais: conversas + acessos + heartbeat do bot.

### Estado atual
- Worker ativo em background.
- Comandos de controle:
  - `npm run bot:start`
  - `npm run bot:status`
  - `npm run bot:stop`
- Último status observado:
  - `worker_running`
  - `processedMessages: 5`
  - `lastError: null`

### Próximos passos imediatos
1. Receber perguntas dos mentores no Telegram e validar respostas via Groq.
2. Validar criação automática de issue a partir de `/issue ...`.
3. Publicar novamente com `npm run deploy:prod` após os commits desta rodada.

