# Skill: Manual Screenshot Capture

Captura screenshots das telas do TCFácil para documentação/manual do usuário.

## Estrutura Visual - Cada Tópico

```
┌────────────────────────────────────────────────────┐
│ [ICON] Título                      [ROLE-BADGE] ▼│
│         Descrição                                  │
├────────────────────────────────────────────────────┤
├─ [HEADER] Botões do Header               ▼         │
│   └─ Criar X, Importar, Exportar                    │
├─ [LINHA] Ações da Tabela                 ▼         │
│   └─ Receber/Pagar, Editar, Alterar status          │
├─ [LISTAR] Ver itens                     ▼         │
│   └─ IMAGEM (lista + filtros)                      │
├─ [CRIAR] + Novo                          ▼         │
│   └─ IMAGENS (lista + form) + campos                │
├─ [BAIXAR] Receber/Pagar                 ▼         │
│   └─ Modal campos + instruções                     │
├─ [IMPORTAR] Importar arquivo            ▼         │
│   └─ Modal campos + instruções                     │
├─ [STEP-BY-STEP] Como usar               ▼         │
│   └─ Passos numerados com instruções               │
└────────────────────────────────────────────────────┘
```

## Regra Principal

**Sempre documentar os botões do HEADER primeiro!**

O Filament mostra botões no header da página:
- "Criar [recurso]"
- "Importar arquivo"
- "Importar vale alimentação"
- "Exportar"
- "Filtros"

## Badges de Role

- **Todos** - Todos os usuários
- **Admin** - Administradores
- **Super-Admin** - Super administrador
- **Contador** - Contadores

## Estrutura HTML Completa

```html
<section id="topic" class="bg-white rounded-lg shadow overflow-hidden">
    <div class="topic-header ... bg-green-50" onclick="toggleTopic('topic')">
        <div class="topic-icon bg-green-500 text-white">ICON</div>
        <div class="flex-1">
            <h2 class="font-bold text-lg lg:text-xl">Título</h2>
            <p class="text-sm text-gray-500">Descrição</p>
        </div>
        <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Role</span>
        <i class="fas fa-chevron-down text-gray-400 text-xl transition-transform"></i>
    </div>
    <div class="topic-content">

        <!-- HEADER - SEMPRE PRIMEIRO -->
        <div class="func-group border-b p-3 lg:p-4" onclick="toggleFuncGroup(this)">
            <div class="flex items-center gap-2 mb-2">
                <span class="bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium">HEADER</span>
                <span class="font-medium">Botões do Header</span>
                <i class="fas fa-chevron-down ml-auto text-xs"></i>
            </div>
            <div class="func-items mt-2">
                <div class="flex flex-wrap gap-2">
                    <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Criar [recurso]</span>
                    <span class="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">Importar</span>
                </div>
            </div>
        </div>

        <!-- IMPORTAR -->
        <div class="func-group border-b p-3 lg:p-4" onclick="toggleFuncGroup(this)">
            <div class="flex items-center gap-2">
                <span class="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">IMPORTAR</span>
                <span class="font-medium">Importar arquivo</span>
                <i class="fas fa-chevron-down ml-auto text-xs"></i>
            </div>
            <div class="func-items mt-3">
                <img src="fluxo/topic/03-importar-modal.png" class="thumb mx-auto rounded-lg shadow-sm">
                <div class="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                    <h4 class="font-medium text-orange-800 text-sm mb-2">Campos do modal:</h4>
                    <div class="grid grid-cols-2 gap-1 text-xs text-orange-700">
                        <span><i class="fas fa-check mr-1"></i>Campo1*</span>
                        <span><i class="fas fa-check mr-1"></i>Campo2</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- LINHA - Ações da Tabela -->
        <div class="func-group border-b p-3 lg:p-4" onclick="toggleFuncGroup(this)">
            <div class="flex items-center gap-2 mb-2">
                <span class="bg-gray-600 text-white px-2 py-1 rounded text-xs font-medium">LINHA</span>
                <span class="font-medium">Ações da Tabela</span>
                <i class="fas fa-chevron-down ml-auto text-xs"></i>
            </div>
            <div class="func-items mt-2">
                <div class="flex flex-wrap gap-2">
                    <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Receber</span>
                    <span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">Editar</span>
                    <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">Alterar status</span>
                </div>
                <p class="text-xs text-gray-500 mt-2">Clique em "Ações" na linha para abrir menu</p>
            </div>
        </div>

        <!-- LISTAR -->
        <div class="func-group border-b p-3 lg:p-4" onclick="toggleFuncGroup(this)">
            <div class="flex items-center gap-2">
                <span class="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">LISTAR</span>
                <span class="font-medium">Ver todas as receitas</span>
                <i class="fas fa-chevron-down ml-auto text-xs"></i>
            </div>
            <div class="func-items mt-3">
                <img src="fluxo/topic/01-lista.png" class="thumb mx-auto rounded-lg shadow-sm">
                <p class="text-xs text-gray-500 mt-2 text-center">Lista com filtros (status, período, cliente)</p>
            </div>
        </div>

        <!-- CRIAR -->
        <div class="func-group border-b p-3 lg:p-4" onclick="toggleFuncGroup(this)">
            <div class="flex items-center gap-2">
                <span class="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">CRIAR</span>
                <span class="font-medium">+ Nova Receita</span>
                <span class="text-xs bg-purple-100 text-purple-700 px-1 rounded ml-1">Admin</span>
                <i class="fas fa-chevron-down ml-auto text-xs"></i>
            </div>
            <div class="func-items mt-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <img src="fluxo/topic/01-lista.png" class="thumb mx-auto rounded-lg shadow-sm">
                        <p class="text-xs text-gray-600 mt-2"><span class="font-medium text-green-600">1.</span> Botão header: "Criar X"</p>
                    </div>
                    <div>
                        <img src="fluxo/topic/02-formulario.png" class="thumb mx-auto rounded-lg shadow-sm">
                        <p class="text-xs text-gray-600 mt-2"><span class="font-medium text-green-600">2.</span> Formulário</p>
                    </div>
                </div>
                <div class="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 class="font-medium text-green-800 text-sm mb-2">Campos:</h4>
                    <div class="grid grid-cols-2 gap-1 text-xs text-green-700">
                        <span><i class="fas fa-check mr-1"></i>Campo1*</span>
                        <span><i class="fas fa-check mr-1"></i>Campo2</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- BAIXAR -->
        <div class="func-group p-3 lg:p-4" onclick="toggleFuncGroup(this)">
            <div class="flex items-center gap-2">
                <span class="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">BAIXAR</span>
                <span class="font-medium">Receber/Quitar</span>
                <span class="text-xs bg-purple-100 text-purple-700 px-1 rounded ml-1">Admin</span>
                <i class="fas fa-chevron-down ml-auto text-xs"></i>
            </div>
            <div class="func-items mt-3">
                <p class="text-sm text-gray-600 mb-2">Clique em "Receber" (menu Ações da linha)</p>
                <div class="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-3">
                    <h4 class="font-medium text-purple-800 text-sm mb-2">Modal:</h4>
                    <div class="grid grid-cols-2 gap-1 text-xs text-purple-700">
                        <span><i class="fas fa-check mr-1"></i>Campo1</span>
                        <span><i class="fas fa-check mr-1"></i>Campo2</span>
                    </div>
                </div>
                <p class="text-xs text-gray-400 mt-2">Transação automática após salvar</p>
            </div>
        </div>

        <!-- STEP-BY-STEP - Como usar -->
        <div class="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 class="font-medium text-green-800 text-sm mb-3">
                <i class="fas fa-list-ol mr-1"></i> Como criar:
            </h4>
            <div class="space-y-3 text-sm text-green-700">
                <div class="flex gap-3">
                    <span class="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <p>Clique em <strong>"Criar X"</strong> no HEADER.</p>
                </div>
                <div class="flex gap-3">
                    <span class="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <p>Preencha o <strong>campo1</strong>.</p>
                </div>
                <div class="flex gap-3">
                    <span class="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <p>Preencha o <strong>campo2</strong>.</p>
                </div>
                <div class="flex gap-3">
                    <span class="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <p>Clique em <strong>"Salvar"</strong>.</p>
                </div>
            </div>
        </div>

    </div>
</section>
```

## Captura de Botões Header

```javascript
// Antes de capturar, observe os botões do header
const botoes = await page.$$eval(
  'header button, header a, .page-header button, .page-actions button',
  els => els.map(e => ({ texto: e.textContent?.trim(), href: e.href }))
);
console.log('Botões header:', botoes);
```

## Nomenclatura de Arquivos

```
fluxo/
├── telas/
│   ├── dashboard.png
│   ├── plano-contas.png      # telas gerais
│   └── empresas.png
├── contas-receber/
│   ├── 01-lista.png          # Lista com filtros
│   ├── 02-formulario.png     # Formulário de criação
│   └── 03-importar-modal.png # Modal de importação
├── contas-pagar/
│   ├── 01-lista.png
│   ├── 02-formulario.png
│   └── 03-importar-modal.png
├── clientes/
│   ├── 01-lista.png
│   └── 02-formulario.png
├── usuarios/
│   ├── 01-lista.png
│   └── 02-formulario.png
└── [outros-modulos]/
    ├── 01-lista.png
    └── 02-formulario.png
```

## CSS Necessário

```css
.thumb { width: 100%; max-width: 300px; cursor: pointer; transition: transform 0.2s; }
.thumb:hover { transform: scale(1.02); }
.func-group { cursor: pointer; }
.func-items { max-height: 0; overflow: hidden; transition: max-height 0.3s; }
.func-items.open { max-height: 1200px; }
.func-group > i { transition: transform 0.3s; }
.func-group.open > i { transform: rotate(180deg); }
```

## Checklist

- [ ] HEADER documentado primeiro (botões do header)
- [ ] LINHA com ações da tabela (menu Ações)
- [ ] LISTAR com IMAGEM da lista + filtros
- [ ] CRIAR com 2 IMAGENS (lista + form) + campos Grid
- [ ] IMPERSONATE com instruções de uso
- [ ] RESET com instruções de reset de senha
- [ ] EDITAR com formulário
- [ ] STEP-BY-STEP com passos numerados (4-7 passos)
- [ ] Badge de role no header do tópico
- [ ] Funcionalidades colapsáveis (auto-expandido)
- [ ] Lightbox ao clicar imagens

## Funcionalidades Especiais

### Impersonate (Usuários)
Permite acessar o sistema como outro usuário. Útil para suporte e testes.
- Clique em "Ações" → "Impersonate"
- Barra amarela indica impersonação ativa
- Clique em "Leave" para voltar

### Reset de Senha
Envia email com link para redefinição de senha.
- Clique em "Ações" → "Resetar Senha"
- Link expira em 60 minutos
- Usuário recebe email com instruções

## Cores por Seção

| Seção | Cor | Badge |
|-------|-----|-------|
| Dashboard | blue | Todos |
| Contas a Receber | green | Todos |
| Contas a Pagar | red | Todos |
| Clientes | indigo | Todos |
| Fornecedores | orange | Todos |
| Transações | gray | Todos |
| Categorias | pink | Admin |
| Contas Bancárias | cyan | Admin |
| Centros de Custo | rose | Admin |
| Plano de Contas | violet | Contador |
| Empresas | teal | Super-Admin |
| Usuários | purple | Admin |
| Dicas | amber | - |
| Regras | rose | - |