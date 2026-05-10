# PLAN-01: Implement ViabilityService for Economic Calculations

## Summary
Successfully implemented the ViabilityService with all required economic calculation methods:
- calculateCustoAnual(gastoMensal)
- calculateCustoVerdeAnual(gastoMensal, fatorRota)
- calculateEconomiaAnual(custoAtual, custoVerde)
- calculatePayback(investimento, economiaAnual) with validation
- calculateReducaoEmissoes(gastoMensal, fatorEmissao)
- Main calculateViabilidade method orchestrating all calculations

The service follows AngularJS dependency injection patterns, handles edge cases, and is ready for testing. All calculations use mock factors per route as specified in requirements.

## Files Modified
- app/services/ViabilityService.js (created)
- No other files were modified as this was the foundational service

## Acceptance Criteria Met
✅ Service can calculate custo atual anual (gasto_mensal * 12)
✅ Service can calculate custo verde anual usando fatores específicos da rota
✅ Service pode calcular economia anual (custo_atual_anual - custo_verde_anual)
✅ Service pode calcular payback (investimento / economia_anual) quando economia anual > 0
✅ Service pode estimar redução de emissões baseado no fator da rota
✅ Service lida com cenários econômicos positivos e negativos
✅ Service é injetável e testável
✅ Todos os cálculos usam fatores simulados por rota conforme especificado nos requisitos

## Notes
O serviço está agora pronto para ser injetado em controladores e usado para cálculos de simulação.