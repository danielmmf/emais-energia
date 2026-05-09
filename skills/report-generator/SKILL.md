# Skill: Report Generator

Gera relatórios HTML de testes,覆盖率 e alterações no projeto.

## Quando usar

Quando:
- After running tests (TDD/BDD)
- After making changes
- When generating documentation
- Need to share results with team

## Como executar

### Passo 1: Gerar relatório de testes

```bash
# PHPUnit HTML report (requires phpunit/phpunit-html)
./vendor/bin/phpunit --testdox-html=manual/test-results.html

# Ou com coverage
./vendor/bin/phpunit --coverage-html=manual/coverage
```

### Passo 2: Gerar relatório do Playwright

```bash
# E2E test report
npx playwright show-report

# Generate HTML report
npx playwright report --output out
```

### Passo 3: Gerar manual da aplicação

Use Playwright para gerar screenshots:

```bash
# Gerar screenshots automáticos
npx playwright screenshot \
  https://whatsapi.devinhas.com.br \
  manual/screenshots/landing.png

npx playwright screenshot \
  https://whatsapi.devinhas.com.br/login \
  manual/screenshots/login.png
```

### Passo 4: Compilar manual HTML

Use script para compilar:

```bash
# Gerar manual completo
php artisan manual:generate
```

## Estrutura do manual

```
manual/
├── index.html          # Home do manual
├── screenshots/       # Screenshots das páginas
├── test-results.html # Resultados de testes
├── coverage/         # Relatório de cobertura
└── changes/          # Alterações documentadas
```

## Comando de reporting

After every change, generate report:

```bash
make report
```

 Isso vai:
1. Rodar testes TDD/BDD
2. Gerar relatório HTML
3. Criar diff das alterações
4. Atualizar changelog

## Template do relatório

```html
<!-- manual/template.html -->
<!DOCTYPE html>
<html>
<head>
  <title>WhatsAPI - Test Results</title>
  <style>
    body { font-family: system-ui; padding: 20px; }
    .passed { color: #22c55e; }
    .failed { color: #ef4444; }
    .summary { background: #f3f4f6; padding: 16px; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>WhatsAPI - Test Results</h1>
  <div class="summary">
    <strong>Date:</strong> <?= date('Y-m-d H:i') ?><br>
    <strong>Tests:</strong> <?= $passed ?>/<?= $total ?> passed<br>
    <strong>Coverage:</strong> <?= $coverage ?>%
  </div>
</body>
</html>
```

## Checklist

- [ ] Rodar testes primeiro
- [ ] Gerar screenshots com Playwright
- [ ] Compilar HTML
- [ ] Adicionar ao git
- [ ] Commit com mudanças