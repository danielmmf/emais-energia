# Quick Task: mobile-fixes

## Objetivo
- Corrigir a rota verde vazia no mobile.
- Remover quebra de layout no topo e toolbar em telas estreitas.
- Garantir visibilidade do botao flutuante de feedback no mobile.

## Execucao
1. Expor premissas padrao no `ViabilityService` e estabilizar a lista de rotas no `HomeController`.
2. Ajustar responsividade de header, toolbar de camadas, mapa e FAB.
3. Validar em producao com Playwright desktop e mobile antes do deploy final.
