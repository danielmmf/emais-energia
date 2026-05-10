# Quick Task: pid-arcgis-investigation

## Objetivo
- Investigar se a PID expõe camadas públicas via ArcGIS REST/FeatureServer/MapServer/GeoJSON.
- Validar se ao menos uma camada pode ser consumida no Viabilidade Verde sem token.
- Documentar resultado em `docs/report.html` sem bloquear o fallback local.

## Execucao
1. Inspecionar a experiência ArcGIS da PID e as chamadas de rede.
2. Identificar serviços ArcGIS e testar acesso público.
3. Se viável, criar PoC isolada no projeto preservando fallback local.
4. Atualizar `docs/report.html` com achados, limitações e esforço estimado.
