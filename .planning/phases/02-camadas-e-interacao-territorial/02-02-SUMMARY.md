# 02-02 Summary

## Entregas
- Cluster habilitado por camada via `layers.overlays` com `type: markercluster`.
- Marcadores atribuídos ao grupo correto com `marker.layer`.
- Zoom/foco refinado para seleção territorial no `HomeController`.
- Estilo de cluster ajustado em `assets/css/map.css`.

## Verificacao
- `rg -n "markercluster|layerOptions|zoom|center" viabilidade-verde/app/services/MapDataService.js viabilidade-verde/app/controllers/HomeController.js viabilidade-verde/assets/css/map.css viabilidade-verde/index.html`
