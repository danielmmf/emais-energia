# 02-01 Summary

## Entregas
- Adicionado `layerType` nas oportunidades mockadas com cobertura de `industrias`, `biometano`, `hidrogenio`, `portos`, `fertilizantes`, `saf` e `energia_renovavel`.
- `MapDataService.buildMarkers` atualizado para respeitar visibilidade por camada.
- `HomeController` + `index.html` receberam estado de toggles de camada e toolbar de ligar/desligar.

## Verificacao
- `jq . viabilidade-verde/data/fallback-opportunities.json`
- `rg -n "layerType|buildMarkers|layerToggles|toggleLayer" viabilidade-verde/data/fallback-opportunities.json viabilidade-verde/app/services/MapDataService.js viabilidade-verde/app/controllers/HomeController.js`
