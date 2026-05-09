# emais-energia

## Viabilidade Verde - acesso temporário

Arquivos principais:
- `index.php`: página inicial bloqueada por nome de mentor + senha.
- `config/security.php`: configuração de mentores, hash de senha e token do deploy.
- `deploy/pull.php`: endpoint de deploy que roda `git pull origin main` via POST.

## Configurar acesso de mentores

1. Edite `config/security.php` e preencha `mentor_names`.
2. Gere novo hash de senha:
   - `php -r "echo password_hash('SUA_SENHA_FORTE', PASSWORD_DEFAULT), PHP_EOL;"`
3. Substitua `mentor_password_hash` pelo hash gerado.

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
