# Viabilidade Verde

## What This Is

Viabilidade Verde é uma aplicação web leve para apoiar decisões de transição energética com foco em viabilidade econômica. A solução combina mapa interativo inspirado na PID com simulador financeiro para responder, de forma prática, se uma rota verde fecha a conta para um perfil empresarial e territorial específico. O produto usa AngularJS + AngularFire + Firebase com fallback local em JSON para preservar demonstrabilidade mesmo sem configuração externa.

## Core Value

Transformar dados territoriais e energéticos em uma resposta objetiva de viabilidade econômica: a transição fecha a conta?

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Entregar fluxo completo de demo em até 3 minutos: landing -> mapa -> seleção -> simulação -> resultado -> relatório
- [ ] Exibir mapa do Brasil com camadas ligáveis/desligáveis, clusters e seleção de oportunidades
- [ ] Calcular custo atual, custo verde, economia anual, payback, redução estimada de emissões e classificação
- [ ] Gerar recomendação textual e relatório executivo em tela
- [ ] Deixar explícitas as premissas simplificadas de protótipo em todos os pontos críticos

### Out of Scope

- Integração completa com ArcGIS/PID oficial no MVP — foco em protótipo demonstrável no hackathon
- Modelagem energética e engenharia de alta precisão — escopo é triagem econômica inicial
- Backend obrigatório, autenticação e banco de dados completo — reduzir complexidade para velocidade de entrega
- Upload/edição avançada de dados geográficos e API pública — não essenciais para validar a proposta central
- Exportação avançada em PDF com layout final — relatório em tela é suficiente para demo

## Context

Hackathon E+ 2026: "Transforme dados em decisões para acelerar a transição energética do Brasil." A PID já oferece base rica de dados territoriais e energéticos, mas o principal gap de adoção prática é converter potencial em decisão econômica acionável. O Viabilidade Verde atua como camada complementar e leve, orientada à pergunta de negócio "vale a pena migrar agora?".

A base de implementação referencia AngularFire como acelerador para prototipação: quando Firebase estiver disponível, oportunidades/premissas/simulações podem ser sincronizadas em tempo real. Quando não estiver, a aplicação mantém operação com arquivos locais mockados (JSON/GeoJSON), reduzindo risco de demo.

Caso central da demo: Goiás + agroindústria/fertilizantes + substituição parcial de gás natural por biometano, com cenário de referência de R$ 200 mil/mês e investimento de R$ 1,8 milhão. A equipe prioriza demonstrabilidade, clareza e aderência ao problema de decisão.

## Constraints

- **Timeline**: Janela curta de hackathon — priorizar fluxo fim-a-fim antes de refinamentos
- **Tech stack**: AngularJS 1.x + AngularFire + Firebase Realtime Database + Leaflet/ui-leaflet/MarkerCluster — manter aderência à proposta técnica definida
- **Data quality**: Dados mockados inspirados na PID/Atlas — transparência obrigatória sobre premissas
- **Performance**: Aplicação leve, browser-first e sem backend mandatório no MVP
- **Scope control**: Evitar dispersão para integrações complexas e features fora do core de viabilidade

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Usar Leaflet como base de visualização territorial | Leveza, acessibilidade e rapidez de prototipação para hackathon | — Pending |
| Posicionar produto como camada complementar à PID | Aumenta utilidade prática sem competir com plataforma oficial | — Pending |
| Priorizar demo Goiás + biometano + fertilizantes | Caso narrativo forte, com coerência territorial e econômica | — Pending |
| Usar fatores de cálculo mockados por rota | Permite validar experiência de decisão sem depender de dados completos | — Pending |
| Entregar MVP sem backend obrigatório | Reduz risco técnico e acelera entrega do fluxo completo | — Pending |
| Adotar Firebase opcional com fallback local | Garante demo resiliente com ou sem integração em tempo real | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-09 after architecture update (AngularFire + Firebase fallback)*
