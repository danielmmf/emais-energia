# emais-energia

## Viabilidade Verde - acesso temporário

Arquivos principais:
- `index.php`: página inicial bloqueada por senha e com log de acesso por nome informado.
- `config/security.php`: hash de senha e token do deploy.
- `deploy/pull.php`: endpoint de deploy que roda `git pull origin main` via POST.
- `logs/mentor-access.log`: registro de acessos autorizados (nome, data/hora, IP e user-agent).

## Base técnica do MVP

Aplicação em `viabilidade-verde/` com:
- AngularJS 1.x
- AngularFire + Firebase Realtime Database (opcional)
- Leaflet + ui-leaflet
- Fallback local em `data/*.json` quando Firebase estiver desativado

### Entrada da aplicação

- `https://emais-energia.devinhas.com.br/viabilidade-verde/`

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
