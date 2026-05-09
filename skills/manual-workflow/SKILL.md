# Skill: Manual Workflow Capture

Captura automaticamente o fluxo completo de qualquer página do TCFácil: rotas, cliques, valorese URLs.

## Quando usar

Quando precisa gerar documentação de um fluxo no manual.

## Como executar

### 1. Definir o Fluxo

Primeiro, defina a sequencia de ações:

```yaml
fluxo: "Criar novo cliente"
rota_inicial: "/admin/customers"
passos:
  - acao: "tela_inicial"
    descricao: "Lista de clientes"
  - acao: "clique"
    seletor: "button:has-text('+ Novo')"
    descricao: "Clique em + Novo Cliente"
  - acao: "aguarda_modal"
    descricao: "Aguarda modal abrir"
  - acao: "preenche"
    seletor: "input[name='name']"
    valor: "João Silva"
    descricao: "Digita o nome"
  - acao: "preenche"
    seletor: "input[name='email']"
    valor: "joao@email.com"
    descricao: "Digita o email"
  - acao: "clique"
    seletor: "button:has-text('Salvar')"
    descricao: "Salvar"
  - acao: "aguarda_sucesso"
    descricao: "Confirmação de sucesso"
```

### 2. Executar a Captura

Chame esta skill com o fluxo definidos:

```
/manual-workflow --fluxo "Criar novo cliente"
```

### 3. Captura Automática

A skill vai:

1. **Navegar para a rota inicial** - URL atual
2. **Capturar screenshot** - Estado antes
3. **Detectar clique** - Onde clicou
4. **Capturar elemento** - +100px ao redor
5. **Detectar input** - Valor alterado
6. **Capturar campo** - Com valor visível
7. **URL mudar?** - Novo screenshot
8. **Repetir** - Para cada passo

###Script de Captura

```javascript
// manual-workflow.js
const { chromium } = require('playwright');

async function capturarFluxo(fluxo) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Login primeiro
    await page.goto('https://tomacontafacil.com.br/admin/login');
    await page.fill('input[type="email"]', 'super@gmail.com');
    await page.fill('input[type="password"]', 'super36');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin**');
    
    const pasta = `public/manual/fluxo/${fluxo.nome}`;
    let step = 1;
    
    for (const passo of fluxo.passos) {
        console.log(`Passo ${step}: ${passo.descricao}`);
        
        switch (passo.acao) {
            case 'tela_inicial':
                await page.goto(`https://tomacontafacil.com.bradmin${passo.rota}`);
                await page.waitForLoadState();
                break;
                
            case 'clique':
                await page.click(passo.seletor);
                // Captura área do clique
                const box = await page.locator(passo.seletor).boundingBox();
                await page.screenshot({ 
                    path: `${pasta}/${step.toString().padStart(2,'0')}-${passo.descricao.replace(/\s/g,'-')}.png`,
                    clip: expandirArea(box, 100)
                });
                break;
                
            case 'preenche':
                await page.fill(passo.seletor, passo.valor);
                // Captura campo com valor (+100px)
                const campoBox = await page.locator(passo.seletor).boundingBox();
                await page.screenshot({
                    path: `${pasta}/${step.toString().padStart(2,'0')}-${passo.descricao.replace(/\s/g,'-')}.png`,
                    clip: expandirArea(campoBox, 100)
                });
                break;
                
            case 'aguarda_modal':
                await page.waitForSelector('[role="dialog"], .modal, [class*="modal"]');
                break;
                
            case 'aguarda_sucesso':
                await page.waitForSelector('.toast, [class*="success"], [class*="sucesso"]');
                break;
        }
        
        // URL mudou? captura nova URL
        const novaUrl = page.url();
        if (novaUrl !== fluxo.urlAnterior) {
            await page.screenshot({
                path: `${pasta}/${step.toString().padStart(2,'0')}-url-${novaUrl.split('/').pop()}.png`
            });
            fluxo.urlAnterior = novaUrl;
        }
        
        // Screenshot geral do estado
        await page.screenshot({
            path: `${pasta}/${step.toString().padStart(2,'0')}-estado.png`
        });
        
        step++;
        await page.waitForTimeout(500);
    }
    
    await browser.close();
    console.log(`Fluxo capturado: ${pasta}`);
}

function expandirArea(box, margem = 100) {
    return {
        x: Math.max(0, box.x - margem),
        y: Math.max(0, box.y - margem),
        width: box.width + (margem * 2),
        height: box.height + (margem * 2)
    };
}

// Exportar para usar via CLI
module.exports = { capturarFluxo };
```

### 4. Estrutura de Arquivos Gerados

```
public/manual/fluxo/clientes/
├── 01-lista-inicial.png      # Estado inicial
├── 02-botao-mais.png       # Clique no +
├── 03-modal-aberto.png     # Modal abriu
├── 04-nome-joao.png       # Campo nome com valor (+100px)
├── 05-email-joao.png       # Campo email com valor
├── 06-salvar.png          # Clique em salvar
└── 07-sucesso.png         # Confirmação
```

### 5. Usar no Manual

```html
<!-- Slideshow automático -->
<div class="screenshot-wrapper" 
     onclick="openLightbox(this, [
         {src: '01-lista-inicial.png', step: '1. Lista de clientes'},
         {src: '02-botao-mais.png', step: '2. Clique em + Novo'},
         {src: '03-modal-aberto.png', step: '3. Modal aberto'},
         {src: '04-nome-joao.png', step: '4. Digita nome'},
         {src: '05-email-joao.png', step: '5. Digita email'},
         {src: '06-salvar.png', step: '6. Salvar'},
         {src: '07-sucesso.png', step: '7. Sucesso!'}
     ])">
    <div class="flex gap-1 overflow-x-auto">
        <img src="01-lista-inicial.png" class="slideshow-thumb">
        <img src="02-botao-mais.png" class="slideshow-thumb">
        <img src="03-modal-aberto.png" class="slideshow-thumb">
        <img src="04-nome-joao.png" class="slideshow-thumb">
        <img src="05-email-joao.png" class="slideshow-thumb">
        <img src="06-salvar.png" class="slideshow-thumb">
        <img src="07-sucesso.png" class="slideshow-thumb">
    </div>
    <p class="text-xs text-center text-gray-400">Clique para ver slideshow</p>
</div>
```

## Fluxos Pré-definidos

| Fluxo | Arquivo |
|------|--------|
| Login | fluxo/login.js |
| Criar Cliente | fluxo/clientes-novo.js |
| Criar Fornecedor | fluxo/fornecedores-novo.js |
| Nova Categoria | fluxo/categorias-novo.js |
| Nova Conta Bancária | fluxo/bank-accounts-novo.js |
| Criar Receita | fluxo/receitas-novo.js |
| Criar Despesa | fluxo/despesas-novo.js |
| Emitir NFS | fluxo/notas-fiscais-emitir.js |
| Novo Projeto | fluxo/projetos-novo.js |
| Novo Lead | fluxo/leads-novo.js |
| Lançamento Contábil | fluxo/contabil-lancamento.js |

## Exemplo: Fluxo Criar Cliente

```javascript
// fluxo/clientes-novo.js
module.exports = {
    nome: 'clientes-novo',
    rota: '/admin/customers',
    passos: [
        { acao: 'tela_inicial', rota: '/admin/customers', descricao: 'Lista de clientes' },
        { acao: 'clique', seletor: 'button:has-text("+ Novo")', descricao: 'Clique + Novo Cliente' },
        { acao: 'aguarda_modal', descricao: 'Aguarda modal' },
        { acao: 'preenche', seletor: 'input[name="name"]', valor: 'João Silva', descricao: 'Digita nome' },
        { acao: 'preenche', seletor: 'input[name="document"]', valor: '12345678900', descricao: 'Digita CPF' },
        { acao: 'preenche', seletor: 'input[name="email"]', valor: 'joao@email.com', descricao: 'Digita email' },
        { acao: 'preenche', seletor: 'input[name="phone"]', valor: '11999999999', descricao: 'Digita telefone' },
        { acao: 'clique', seletor: 'button:has-text("Salvar")', descricao: 'Salvar' },
        { acao: 'aguarda_sucesso', descricao: 'Sucesso' }
    ]
};
```

## CLI

```bash
# Capturar fluxo específico
npx playwright run fluxo/clientes-novo.js

# Capturar todos os fluxos
npx playwright run fluxo/*.js
```

## Checklist

- [ ] Fluxo definido em arquivo JS
- [ ] Login automático
- [ ] Captura de clique (+100px)
- [ ] Captura de valor alterado
- [ ] Detecção de mudança de URL
- [ ] Slideshow gerado no manual
- [ ] Lightbox funcionando
- [ ] Setas e teclado funcionando