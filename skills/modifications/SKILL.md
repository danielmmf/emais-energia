# Skill: Modifications Gate

Cria registro de modificações feitas no sistema e regras em vigor. Usado como "gate" para trabalho finalizado.

## ⚠️ RESTRIÇÃO IMPORTANTE - NÃO MOVER ARQUIVOS NO SERVIDOR

**NUNCA faça operações que movam ou renomeiem arquivos no servidor de produção:**
- NÃO renomeie arquivos .htaccess
- NÃO mova index.html ou outros arquivos
- NÃO crie .htaccess na raiz public_html
- NÃO delete arquivos do servidor a menos que seja necessário para a correção

**Se precisar ajustar algo no servidor, peça para o usuário fazer manualmente pelo painel hpanel.**

## 📋 Configuração do Banco de Dados (Hostinger Compartilhado)

**NUNCA adicione credenciais de banco ao git! Use apenas variáveis de ambiente locais.**

- DB_HOST: localhost
- DB_DATABASE: u474630687_whatsapi
- DB_USERNAME: u474630687_whatsapi
- DB_PASSWORD: Devinhas36.*
- SENHA ANOTADA EM 29/04/2026 - NÃO ESQUECER

## ⚠️ REGRA IMPORTANTE - VALIDAR SEMPRE

**ANTES de fazer commit/push, valide que o site continua funcionando:**

**SEMPRE use Playwright para validar ANTES de commitAR:**
```bash
npx playwright screenshot --full-page --wait-for-timeout=3000 https://whatsapi.devinhas.com.br/ /tmp/test.png
```

**DEPOIS do commit, fazer deploy via script (NÃO usar SSH):**
```bash
# Para production:
curl "https://whatsapi.devinhas.com.br/public/server.php?secret=whatsapi2026&cmd=all"
```

**APÓS deploy, SEMPRE testar com Playwright e gravar screencast:**
```bash
# Testar todas as páginas principais
npx playwright test --reporter=list

# Gravar screencast
npx playwright test tests/E2E/record-video.spec.ts --reporter=list
```

1. Commit e push no GitHub
2. Acessar URL do server.php com cmd=all
3. Testar com Playwright
4. Verificar se não há erros 500
5. Gravar screencast de evidência
6. Criar/atualizar PR no GitHub

**Se quebrou, reverte imediatamente!**

## 🚀 Uso do Laravel Boost (OBRIGATÓRIO)

**Para toda alteração de Backend, você DEVE usar o Laravel Boost:**
- **Sempre consulte `AGENTS.md`** para garantir que as regras do framework e do projeto estão sendo seguidas.
- Use o comando `search-docs` (ou ferramentas equivalentes do Boost) para validar a sintaxe e padrões do Laravel 12 e Filament 5.
- Siga rigorosamente as "laravel-boost-guidelines" presentes no arquivo `AGENTS.md`.

## 🔴 FLUXO OBRIGATÓRIO - A cada alteração:

1. **Consultar Boost & AGENTS.md**: Validar as regras de backend e padrões do projeto.
2. **Fazer a alteração no código**
3. **Testar localmente** (se possível)
4. **Fazer commit e push**
5. **Deploy para produção** (via server.php)
6. **Validar com Playwright** (testar páginas quebradas)
7. **Gravar screencast** como evidência
8. **Criar/atualizar PR** no GitHub

**NUNCA marque trabalho como concluído sem seguir todos os passos acima!**

## 🖥️ Gerenciamento do Servidor

**Script disponível em:** `server.php` (na raiz public_html)

**URLs para gerenciar:**
```
https://whatsapi.devinhas.com.br/public/server.php?secret=whatsapi2026&cmd=all      # pull + migrate + cache clear
https://whatsapi.devinhas.com.br/public/server.php?secret=whatsapi2026&cmd=pull     # só git pull
https://whatsapi.devinhas.com.br/public/server.php?secret=whatsapi2026&cmd=migrate  # só migrate
```

**Comandos disponíveis:** `pull`, `migrate`, `seed`, `all`, `queue`

**SECRETO:** `whatsapi2026` - NÃO compartilhar!

## Layout real do app

- O `index.php` do app fica na raiz do projeto.
- Não assumir `public/index.php` como entrypoint principal do deploy.
- Não sobrescrever nem recriar `.env` no servidor durante commit/deploy.

## Diagnóstico rápido de banco em produção

Se o deploy ou `/login` quebrar com erro de banco:

1. Verifique o `.env` remoto.
2. Confirme se `DB_DATABASE` e `DB_USERNAME` estão apontando para `u474630687_whatsapi`.
3. Se o app estiver tentando usar `root` / `whatsapi`, corrija o `.env` antes de rodar `migrate`, `cache:clear` ou `config:clear`.

**Sempre testar ANTES de fazer commit com:**
```bash
npx playwright screenshot --full-page --wait-for-timeout=3000 https://whatsapi.devinhas.com.br/ /tmp/test.png
```

## Quando usar

**ANTES de fazer commit/push, valide que o site continua funcionando:**

**SEMPRE use Playwright para validar:**
```bash
npx playwright screenshot --full-page --wait-for-timeout=3000 https://whatsapi.devinhas.com.br/ /tmp/test.png
```

1. Após qualquer mudança no código, faça pull no servidor
2. Teste o site com `curl` ou Playwright
3. Verifique se não há erro 500 ou SQL errors
4. Tire screenshot e verifique o conteúdo esperado
5. Só então faça commit

**Se quebrou, reverte imediatamente!**

## Quando usar

Quando:
- Finalizar uma feature ou bugfix
- Criar nova funcionalidade
- Alterar regras de negócio
- Fazer ajustes importantes

## Como executar

### 1. Criar Modification Entry

Você pode criar entradas de modificação de duas formas:

#### Forma 1: Via linha de comando

```
/modification --titulo "Transações automáticas" --tipo "feature" --desc "Ao pagar conta, cria transação automaticamente"
```

#### Forma 2: Editar arquivo direto

Edite `public/modifications.html` para adicionar nova entrada.

### 2. Estrutura da Modification

Cada modificação deve ter:

```html
<div class="modification" data-tipo="feature|bugfix|rule|ajust">
    <div class="mod-header">
        <span class="mod-tipo">FEATURE</span>
        <span class="mod-data">25/04/2026</span>
    </div>
    <h3 class="mod-titulo">Título da modificação</h3>
    <p class="mod-desc">Descrição do que foi feito</p>
    <div class="mod-regras">
        <h4>Regras em vigor:</h4>
        <ul>
            <li>Regra 1</li>
            <li>Regra 2</li>
        </ul>
    </div>
    <div class="mod-status">ATIVO|FUTURO|DEPRECATED</div>
</div>
```

### 3. Lista de Modificações Ativas

Ver `public/modifications.html` para ver todas as modificações registradas.

## Types de Modificação

| Type | Sigla | Descrição |
|------|------|----------|
| feature | FEAT | Nova funcionalidade |
| bugfix | BUG | Correção de bug |
| rule | RULE | Nova regra de negócio |
| ajust | ADJUST | Ajuste/melhoria |

## Status

| Status | Significado |
|--------|-----------|
| ATIVO | Em vigor atualmente |
| FUTURO | Planejado para ativar |
| DEPRECATED | Antigo, não usar mais |

## Manual de Uso

### Ao Finalizar Trabalho

1. **Documente a modificação** em `public/modifications.html`
2. **Compile o manual** se necessário: `node gerar manual`
3. **Verifique** se todas as regras estão atualizadas
4. **Marque como ATIVO** a modificação

### Verificar Regras Ativas

Abra `public/modifications.html` e busque por `class="mod-status">ATIVO`.

## Arquivos

- Entrada: `public/modifications.html`
- Script: `gerar-modifications.js`
- Template: `skills/modifications/TEMPLATE.md`

## Checklist

- [ ] Título claro
- [ ] Tipo definido (FEAT, BUG, RULE, ADJUST)
- [ ] Descrição do que foi feito
- [ ] Regras especificadas
- [ ] Status correto (ATIVO/FUTURO)
- [ ] Data de criação
