# Quick Task: pid-portos-integration

## Objetivo
- Integrar a camada real de Instalacoes Portuarias da PID no app principal.
- Preservar fallback local e nao bloquear o MVP.
- Publicar, validar em producao e documentar minimamente.

## Execucao
1. Mapear fluxo atual de dados/camadas para portos.
2. Adicionar fonte ArcGIS publica com fallback local.
3. Exibir portos reais no mapa principal sem quebrar os mocks existentes.
4. Validar em producao com Playwright e notificar no Telegram.
