# Skill: GitHub Issue Creator

Cria issues no GitHub automaticamente quando houver erros no sistema.

## Quando usar

Quando:
- Php errors appear in logs
- Console errors appear
- User reports bugs
- Need to document issues

## Como executar

### Passo 1:Verificar erros recentes

```bash
# Ver logs do Laravel
tail -100 storage/logs/laravel.log

# Ou verificar logs do Nginx
tail -50 /var/log/nginx/error.log
```

### Passo 2:Criar issue no GitHub

Use gh cli para criar issue:

```bash
gh issue create \
  --title "[Bug] Descrição curta do erro" \
  --body "## Descrição
Descrição detalhada do problema

## Passos para reproduzir
1. Passo 1
2. Passo 2

## Erro encontrado
\`\`\`
código do erro
\`\`\`

## Ambiente
- Produção: tomacontafacil.com.br
- PHP: $(php -v | head -1)
- Data: $(date)" \
  --label "bug"
```

### Passo 3:Alternativas

Se não tiver gh configurado:

1. Acesse https://github.com/danielmmf/tcfacil/issues/new
2. Preencha o formulário manualmente
3. Use labels: bug, enhancement, documentation

## Repositório

https://github.com/danielmmf/tcfacil

## Labels sugeridos

- `bug` - erros e problemas
- `enhancement` - melhorias
- `documentation` - docs
- `question` - dúvidas

## Checklist

- [ ] Título claro e curto
- [ ] Descrição detalhada
- [ ] Passos para reproduzir
- [ ] Prints/logs do erro
- [ ] Label apropriado