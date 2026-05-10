# Phase 3 Discussion Log

## Discussion Areas

### Calculation engine design
- **Question**: How should we structure the calculation logic?
- **Options considered**: 
  - Distributed across controllers/services
  - Centralized ViabilityService
- **Selected**: Centralized ViabilityService
- **Notes**: Service will receive inputs from form and return calculated results, implementing SIM-02 through SIM-06 calculations

### Form implementation for user inputs
- **Question**: What fields should the simulation form include and how should they be validated?
- **Options considered**:
  - Minimal form with only essential fields
  - Comprehensive form with all possible inputs
- **Selected**: Form with Setor, Fonte atual, Gasto mensal atual, Rota verde, Investimento estimado
- **Notes**: Form will validate required fields before enabling calculation and reset to initial state when inputs change significantly

### Viability classification logic
- **Question**: How should we classify viability results?
- **Options considered**:
  - Simple binary (viável/não viável)
  - Multiple tiers based on payback only
  - Multiple tiers considering strategic factors
- **Selected**: Five-tier classification (Alta, Média, Baixa, Estratégica, Não recomendada)
- **Notes**: Classification based on payback periods and strategic value considerations

### Firebase/local storage integration for simulations
- **Question**: How should we handle simulation persistence?
- **Options considered**:
  - Firebase only with blocking fallback
  - Local storage only
  - Resilient Firebase-first with local fallback
- **Selected**: Resilient storage pattern with Firebase primary, localStorage fallback
- **Notes**: Queue mechanism for pending simulations when offline, sync when connection restored, will not block user flow

### Result persistence strategy
- **Question**: How should simulation results be persisted for UI access?
- **Options considered**:
  - Store in root scope
  - Store in service for immediate access
  - Persist to localStorage immediately
- **Selected**: Store in ViabilityService for immediate access until new calculation
- **Notes**: Result persists until new calculation, cleared when navigating away, not persisted across sessions unless explicitly saved

## Decisions Summary
- Created centralized ViabilityService for calculations
- Form includes Setor, Fonte atual, Gasto mensal atual, Rota verde, Investimento estimado
- Five-tier viability classification based on payback and strategic factors
- Resilient Firebase/local storage integration with queuing mechanism
- Results stored in service for immediate UI access

## Deferred Ideas
- Sensibilidade por múltiplos cenários (ANL-01) -> Future phase
- Risco regulatório/contratual avançado (ANL-02) -> Future phase
- Modelagem energética de alta precisão (ANL-03) -> Future phase
- Exportação PDF avançada (INT-04) -> Future phase
- API externa para cenários (INT-02) -> Future phase

## Timestamp
2026-05-09