# Quick Task: download-active-layers

## Objetivo
- Incluir as camadas ativas no HTML exportado da simulacao.
- Exibir uma tabela dedicada com grupo, camada, tipo, transparencia, legenda e fonte.
- Atualizar a documentacao e republicar com validacao em producao.

## Execucao
1. Montar payload estruturado das camadas ativas no controller.
2. Renderizar tabela dedicada no `ReportService`.
3. Atualizar `/docs/report.html`.
4. Publicar, validar em producao e notificar no Telegram.
