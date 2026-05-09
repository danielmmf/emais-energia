# 02-03 Summary

## Entregas
- `regions.geojson` evoluido para poligonos com atributos territoriais.
- Novo `infrastructure.geojson` com linhas mockadas.
- `FirebaseDataService` passou a carregar `regions` e `infrastructure` com fallback local.
- `MapDataService` ganhou builders para paths de regioes e infraestrutura.

## Verificacao
- `jq . viabilidade-verde/data/regions.geojson`
- `jq . viabilidade-verde/data/infrastructure.geojson`
- `rg -n "getRegions|getInfrastructure|buildRegionPaths|buildInfrastructurePaths" viabilidade-verde/app/services/FirebaseDataService.js viabilidade-verde/app/services/MapDataService.js`
