# Quick Task: pid-biometano-h2-cache

## Objetivo
- Integrar camadas reais de Biometano e H2 no mapa principal.
- Adicionar cache local para fontes ArcGIS publicas.
- Preservar fallback local e a lista curada da demo.

## Execucao
1. Revisar integracao atual de portos reais e abstrair carregamento de fontes PID.
2. Adicionar Biometano e H2 como fontes opcionais do mapa com normalizacao propria.
3. Implementar cache local com TTL para reduzir dependencia de rede.
4. Atualizar UI, docs, testes e publicar em producao.
