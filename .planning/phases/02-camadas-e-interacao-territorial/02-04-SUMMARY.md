# 02-04 Summary

## Entregas
- Clique em marcador/poligono conectado ao painel lateral via eventos `leafletDirectiveMarker.click` e `leafletDirectivePath.click`.
- Painel territorial implementado com campos obrigatorios e CTA explicito `Calcular Viabilidade`.
- Simulador passa a abrir somente apos o CTA (`simulationReady`), sem calculo automatico.

## Verificacao
- `rg -n "leafletDirectiveMarker.click|leafletDirectivePath.click|simulationReady|Calcular Viabilidade|Potencial territorial|Infraestrutura|Risco inicial" viabilidade-verde/app/controllers/HomeController.js viabilidade-verde/index.html`
