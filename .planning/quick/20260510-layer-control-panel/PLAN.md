# Quick Task: layer-control-panel

## Objetivo
- Criar um painel lateral esquerdo de camadas inspirado na PID/ArcGIS.
- Permitir ligar/desligar camadas, ajustar transparencia, abrir detalhes e dar zoom por camada.
- Conectar algumas camadas ativas a sinais de leitura para o simulador de viabilidade.
- Preservar dados mockados e o fluxo principal da demo.

## Execucao
1. Definir grupos, metadados e mapeamento de camadas para markers, regioes e infraestrutura.
2. Implementar o `LayerControlPanel` recolhivel com controles por camada.
3. Conectar o painel ao mapa Leaflet, incluindo opacidade e zoom por bounds.
4. Aplicar sinais das camadas ativas no contexto da simulacao e na recomendacao textual.
5. Atualizar documentacao, publicar em producao, validar com Playwright e notificar no Telegram.
