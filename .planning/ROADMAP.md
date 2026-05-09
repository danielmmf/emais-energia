# Roadmap: Viabilidade Verde

## Overview

Entregar um MVP demonstrável que converte exploração territorial em decisão econômica de transição energética. A jornada prioriza primeiro o fluxo completo de valor (landing -> mapa -> seleção -> simulação -> resultado -> relatório), depois robustez visual e de apresentação para o pitch.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Setup e Base Visual** - Estruturar app AngularJS/AngularFire, landing inicial, mapa base e fallback de dados
- [ ] **Phase 2: Camadas e Interação Territorial** - Implementar camadas, clusters, regiões e painel lateral acionável
- [ ] **Phase 3: Simulador de Viabilidade** - Implementar formulário, motor de cálculo e classificação
- [ ] **Phase 4: Resultado e Relatório Executivo** - Exibir cards, recomendação textual e relatório em tela
- [ ] **Phase 5: Polimento e Demo** - Ajustar UX, responsividade, transparência e roteiro final de demonstração

## Phase Details

### Phase 1: Setup e Base Visual
**Goal**: Entregar base navegável do produto com proposta de valor clara e mapa inicial funcional
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: [LAND-01, LAND-02, MAP-01, DATA-01, DATA-02]
**Success Criteria** (what must be TRUE):
  1. Usuário abre a aplicação e entende proposta em menos de 1 minuto
  2. CTA "Explorar mapa" leva para o mapa sem erros de navegação
  3. Mapa do Brasil carrega com desempenho adequado em navegador comum
**Plans**: 3 plans

Plans:
- [ ] 01-01: Criar estrutura AngularJS 1.x + AngularFire e layout base (landing + shell da aplicação)
- [ ] 01-02: Integrar Leaflet/ui-leaflet e configurar mapa inicial do Brasil
- [ ] 01-03: Implementar carregamento de dados com Firebase opcional e fallback local JSON/GeoJSON

### Phase 2: Camadas e Interação Territorial
**Goal**: Permitir leitura territorial prática com camadas úteis e contexto lateral para iniciar simulação
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: [MAP-02, MAP-03, MAP-04, MAP-05, SELC-01, SELC-02, SELC-03]
**Success Criteria** (what must be TRUE):
  1. Usuário liga e desliga camadas com feedback visual imediato
  2. Marcadores são agrupados por cluster em zoom amplo
  3. Clique em região/oportunidade abre painel com contexto territorial completo e ação "Calcular Viabilidade"
**Plans**: 4 plans

Plans:
- [ ] 02-01: Implementar camadas de marcadores (indústrias, biometano, hidrogênio, portos, fertilizantes, SAF)
- [ ] 02-02: Implementar clusters e comportamento de zoom/interação
- [ ] 02-03: Implementar polígonos de regiões prioritárias e linhas de infraestrutura
- [ ] 02-04: Implementar painel lateral com dados contextuais e gatilho da simulação

### Phase 3: Simulador de Viabilidade
**Goal**: Entregar cálculo econômico completo e classificação de viabilidade para rotas verdes
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: [SIM-01, SIM-02, SIM-03, SIM-04, SIM-05, SIM-06, SIM-07, DATA-03]
**Success Criteria** (what must be TRUE):
  1. Usuário preenche/ajusta cenário atual e rota verde no simulador
  2. Sistema calcula corretamente custo atual, custo verde, economia anual e payback
  3. Sistema estima redução de emissões e classifica viabilidade conforme regras definidas
**Plans**: 3 plans

Plans:
- [ ] 03-01: Implementar formulário de simulação com pré-preenchimento por oportunidade
- [ ] 03-02: Implementar serviço de cálculo com fatores mockados por rota
- [ ] 03-03: Implementar regras de classificação, persistência de simulação no Firebase (quando ativo) e fallback resiliente

### Phase 4: Resultado e Relatório Executivo
**Goal**: Transformar cálculo em decisão clara com cards, recomendação acionável e relatório para reunião
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: [RES-01, RES-02, RPT-01, TRN-01]
**Success Criteria** (what must be TRUE):
  1. Usuário visualiza todos os indicadores-chave em cards claros
  2. Sistema exibe recomendação textual coerente com os resultados
  3. Usuário gera relatório executivo completo em tela, incluindo premissas e próximos passos
**Plans**: 3 plans

Plans:
- [ ] 04-01: Implementar componentes de cards de resultado
- [ ] 04-02: Implementar motor de recomendação textual com próximos passos
- [ ] 04-03: Implementar relatório executivo em tela com estrutura de apresentação

### Phase 5: Polimento e Demo
**Goal**: Garantir clareza visual, responsividade e narrativa de demo para apresentação final
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: [TRN-02, TRN-03]
**Success Criteria** (what must be TRUE):
  1. Interface final permanece legível, consistente e funcional em desktop e tablet/mobile quando possível
  2. Premissas simplificadas ficam visíveis e inequívocas em cálculo e relatório
  3. Fluxo completo da demo roda de ponta a ponta em até 3 minutos
**Plans**: 3 plans

Plans:
- [ ] 05-01: Ajustar design, contraste, tipografia e hierarquia visual para entendimento rápido
- [ ] 05-02: Ajustar responsividade e estabilidade do fluxo principal em diferentes resoluções
- [ ] 05-03: Fechar roteiro de demo/pitch e checklist de execução final

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Setup e Base Visual | 0/3 | Not started | - |
| 2. Camadas e Interação Territorial | 0/4 | Not started | - |
| 3. Simulador de Viabilidade | 0/3 | Not started | - |
| 4. Resultado e Relatório Executivo | 0/3 | Not started | - |
| 5. Polimento e Demo | 0/3 | Not started | - |
