# emais-energia

## Viabilidade Verde - acesso temporário

Arquivos principais:
- `index.php`: página inicial bloqueada por senha e com log de acesso por nome informado.
- `config/security.php`: hash de senha e token do deploy.
- `deploy/pull.php`: endpoint de deploy que roda `git pull origin main` via POST.
- `logs/mentor-access.log`: registro de acessos autorizados (nome, data/hora, IP e user-agent).

Fluxo de entrada:
- Login na landing redireciona automaticamente para `/viabilidade-verde/`.
- Se o redirecionamento automático falhar, a landing exibe link manual para `/viabilidade-verde/`.
- Logout encerra a sessão de mentor e envia para `/viabilidade-verde/?visitor=1`.

## Base técnica do MVP

Aplicação em `viabilidade-verde/` com:
- AngularJS 1.x
- AngularFire + Firebase Realtime Database (opcional)
- Leaflet + ui-leaflet
- Fallback local em `data/*.json` quando Firebase estiver desativado

### Entrada da aplicação

- `https://emais-energia.devinhas.com.br/viabilidade-verde/`

## Skills locais solicitadas

- `.codex/skills/seo-write/SKILL.md`
- `.codex/skills/epic-brand/SKILL.md`
- `.codex/skills/frontend-design/SKILL.md`
- `.codex/skills/agent-browser/SKILL.md`
- `.codex/skills/web-design/SKILL.md`
- `.codex/skills/phase-issue-gate/SKILL.md`
- `.codex/skills/telegram-ops/SKILL.md`

## Gate operacional (obrigatorio)

Antes de iniciar tarefas da fase:

1. Rodar `npm run gate:phase-issues`
2. Ler `.planning/reports/phase-<N>-issues.md`
3. Incluir as issues da fase no escopo ativo antes da execucao

Para publicar cada alteracao:

1. `npm run deploy:prod`
2. O script faz: `git push` -> endpoint de pull -> Playwright em producao
3. Envia notificacao de inicio/fim no Telegram

Para transformar respostas do Telegram em issues:

- `npm run ops:telegram-to-issues`
- Mensagens no formato `/issue titulo da tarefa` viram issues no GitHub.
- `TELEGRAM_CHAT_ID` e opcional: sem ele, o bot usa todos os chats ativos detectados.
- Se for o primeiro uso, envie uma mensagem ao bot para registrar seu chat no cache local de envios.

### Firebase opcional

Edite `viabilidade-verde/firebase.config.js`:
- `window.VV_FIREBASE_ENABLED = true` para ativar Firebase.
- Se `false`, a aplicação usa fallback local automaticamente.

## Configurar acesso de mentores

1. Gere novo hash de senha:
   - `php -r "echo password_hash('SUA_SENHA_FORTE', PASSWORD_DEFAULT), PHP_EOL;"`
2. Substitua `mentor_password_hash` pelo hash gerado.

## Configurar endpoint de deploy

1. Gere token forte e hash:
   - `php -r "echo password_hash('SEU_TOKEN_FORTE', PASSWORD_DEFAULT), PHP_EOL;"`
2. Atualize `deploy_token_hash` em `config/security.php`.
3. Opcional: preencha `deploy_allowed_ips` para restringir origem.

## Chamada do endpoint (produção)

```bash
curl -X POST https://emais-energia.devinhas.com.br/deploy/pull.php \
  -d "token=SEU_TOKEN_FORTE"
```

Resposta esperada: JSON com `ok`, `exit_code` e `output` do `git pull`.
