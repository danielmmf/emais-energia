# Phase 3: Simulador de Viabilidade - CONTEXT.md

## Domain
Entregar cálculo econômico completo e classificação de viabilidade para rotas verdes.

## Canonical refs:
- .planning/ROADMAP.md (Phase 3 definition)
- .planning/REQUIREMENTS.md (SIM-01 through SIM-07, DATA-03)
- .planning/PROJECT.md (Core Value and Constraints)
- .planning/phases/02-camadas-e-interacao-territorial/02-CONTEXT.md (Prior phase context)

## Code context:
- AngularJS app scaffolded with firebase and ui-leaflet dependencies
- Map base functional with layer controls and opportunity selection (Phase 2)
- Simulation controller stub exists: app/controllers/SimulationController.js
- Firebase configuration exists: firebase.config.js
- Services structure established: MapDataService.js, FirebaseDataService.js
- Fallback mechanism configured in app.js constants

## Prior decisions carried forward:
- AngularJS 1.x + AngularFire + Firebase Realtime Database stack
- Leaflet/ui-leaflet/MarkerCluster for map visualization
- Firebase opcional com fallback local em JSON/GeoJSON
- Transparência obrigatória sobre premissas simplificadas de protótipo
- Aplicação leve, browser-first e sem backend mandatório no MVP

## Gray areas discussed:

### Calculation engine design
**Decided**: Create a centralized ViabilityService to handle all calculations
- Service will receive inputs from form and return calculated results
- Will implement SIM-02 through SIM-06 calculations
- Will handle both positive and negative ekonomia scenarios
- Payback calculation only when economia anual > 0 (SIM-05)
- Will use mock factors por rota as specified in requirements
- Service will be injectable and testable

### Form implementation for user inputs
**Decided**: Implement form in SimulationController with these fields:
- Setor (dropdown with predefined options)
- Fonte atual (dropdown based on setor selection)
- Gasto mensal atual (numeric input, R$/mês)
- Rota verde (dropdown based on setor/fonte atual)
- Investimento estimado (numeric input, R$)
- Form will validate required fields before enabling calculation
- Will reset to initial state when inputs change significantly

### Viability classification logic
**Decided**: Implement classification based on payback and strategic value:
- Alta: payback ≤ 2 anos
- Média: 2 < payback ≤ 4 anos  
- Baixa: 4 < payback ≤ 6 anos
- Estratégica: payback > 6 anos mas com benefícios não financeiros altos
- Não recomendada: payback não aplicável (economia anual <= 0)
- Classification will consider both financial payback and strategic factors
- Will expose classification text and color coding for UI

### Firebase/local storage integration for simulations
**Decided**: Implement resilient storage pattern:
- Primary: Attempt to save to Firebase Realtime Database when available
- Fallback: Save to localStorage when Firebase unavailable
- Queue mechanism for pending simulations when offline
- Sync mechanism to push queued simulations when connection restored
- Will not block user flow if storage unavailable
- Each simulation record will include timestamp, inputs, results, and classification
- Will implement DATA-03 requirements for Firebase logging

### Result persistence strategy
**Decided**: Store simulation results in service for immediate access:
- ViabilityService will maintain current simulation result
- Result will persist until new calculation is performed
- Will clear result when navigating away from simulation view
- Will not persist results across sessions unless explicitly saved to Firebase/localStorage
- Report controller will access current result from ViabilityService

## Deferred ideas:
- Sensibilidade por múltiplos cenários de preço/fornecimento (ANL-01) -> Future phase
- Incluir risco regulatório/contratual com parametrização avançada (ANL-02) -> Future phase
- Incluir modelagem energética com maior precisão técnica (ANL-03) -> Future phase
- Exportação avançada de relatório (PDF com layout executivo) -> INT-04 in future phase
- API para consumo externo de cenários e resultados -> INT-02 in future phase

## Next Up — Viabilidade Verde
**Phase 3: Simulador de Viabilidade** — Entregar cálculo econômico completo e classificação de viabilidade para rotas verdes

`/clear` then:

`/gsd-plan-phase 3 .planning`

---

**Also available:** `--chain` for auto plan+execute after; `/gsd-plan-phase 3 --skip-research .planning` to plan without research; `/gsd-ui-phase 3 .planning` for UI design contracts; review/edit CONTEXT.md before continuing.