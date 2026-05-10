# Requirements: Viabilidade Verde

**Defined:** 2026-05-09
**Core Value:** Transformar dados territoriais e energéticos em uma resposta objetiva de viabilidade econômica: a transição fecha a conta?

## v1 Requirements

### Landing e Navegação

- [x] **LAND-01**: Usuário pode acessar uma tela inicial com nome do produto, proposta de valor e CTA "Explorar mapa"
- [x] **LAND-02**: Usuário pode navegar da landing para o mapa sem autenticação

### Mapa e Camadas

- [x] **MAP-01**: Usuário visualiza mapa interativo do Brasil em navegador comum
- [x] **MAP-02**: Usuário liga/desliga camadas de dados (indústrias, biometano, hidrogênio, portos, fertilizantes, SAF, infraestrutura, energia renovável)
- [x] **MAP-03**: Usuário visualiza marcadores agrupados por cluster em níveis de zoom amplos
- [x] **MAP-04**: Usuário visualiza regiões prioritárias destacadas por polígonos GeoJSON
- [x] **MAP-05**: Usuário visualiza infraestrutura territorial por linhas (ex.: gasodutos/transmissão)

### Seleção e Contexto Territorial

- [x] **SELC-01**: Usuário pode clicar em região, marcador ou oportunidade para abrir contexto territorial
- [x] **SELC-02**: Painel lateral exibe região, setor, fonte atual sugerida, rota verde sugerida, potencial, infraestrutura e risco inicial
- [x] **SELC-03**: Painel lateral permite iniciar simulação por ação explícita "Calcular Viabilidade"

### Simulação e Cálculos

- [x] **SIM-01**: Usuário informa/ajusta setor, fonte atual, gasto mensal atual, rota verde e investimento estimado
- [x] **SIM-02**: Sistema calcula custo atual anual (`gasto_mensal * 12`)
- [x] **SIM-03**: Sistema calcula custo verde anual por fator da rota selecionada
- [x] **SIM-04**: Sistema calcula economia anual (`custo_atual_anual - custo_verde_anual`)
- [x] **SIM-05**: Sistema calcula payback (`investimento / economia_anual`) quando economia anual for positiva
- [x] **SIM-06**: Sistema estima redução de emissões com base no fator da rota
- [x] **SIM-07**: Sistema classifica resultado em Alta, Média, Baixa, Estratégica ou Não recomendada no cenário atual

### Dados e Firebase

- [x] **DATA-01**: Sistema lê oportunidades e premissas do Firebase Realtime Database quando configuração AngularFire estiver ativa
- [x] **DATA-02**: Sistema usa fallback local em JSON/GeoJSON quando Firebase não estiver disponível ou não configurado
- [x] **DATA-03**: Sistema registra simulações no Firebase quando ativo, sem bloquear fluxo quando estiver em fallback local

### Resultado e Relatório

- [x] **RES-01**: Usuário visualiza cards com custo atual anual, custo verde anual, investimento, economia anual, payback, redução e viabilidade
- [x] **RES-02**: Sistema gera recomendação textual simples com próximos passos
- [x] **RPT-01**: Usuário gera relatório executivo em tela com resumo, indicadores, premissas e próximos passos

### Transparência e Qualidade de Uso

- [x] **TRN-01**: Interface exibe aviso de premissas simplificadas de protótipo em pontos de cálculo e relatório
- [ ] **TRN-02**: Interface mantém legibilidade e contraste adequados para entendimento rápido por não técnicos
- [ ] **TRN-03**: Fluxo principal completo da demo pode ser apresentado em até 3 minutos

## v2 Requirements

### Integrações e Escala

- **INT-01**: Integrar dados oficiais da PID/ArcGIS com atualização periódica
- **INT-02**: Expor API para consumo externo de cenários e resultados
- **INT-03**: Permitir autenticação, histórico de simulações e colaboração entre usuários
- **INT-04**: Suportar exportação avançada de relatório (PDF com layout executivo)

### Sofisticação Analítica

- **ANL-01**: Permitir sensibilidade por múltiplos cenários de preço/fornecimento
- **ANL-02**: Incluir risco regulatório/contratual com parametrização avançada
- **ANL-03**: Incluir modelagem energética com maior precisão técnica

## Out of Scope

| Feature | Reason |
|---------|--------|
| Integração completa ArcGIS/PID no MVP | Alto custo de integração para janela curta de hackathon |
| Motor de engenharia energética de alta precisão | MVP é triagem econômica inicial, não laudo técnico final |
| Login, gestão de usuários e banco de dados completo | Não essencial para validar valor central da demo |
| Upload/edição de dados geográficos pelo usuário | Aumenta complexidade sem impacto direto no objetivo do MVP |
| API pública e integrações corporativas | Escopo de produto pós-hackathon |
| Exportação PDF avançada com design final | Relatório em tela atende demonstração e validação inicial |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAND-01 | Phase 1 | Complete |
| LAND-02 | Phase 1 | Complete |
| MAP-01 | Phase 1 | Complete |
| MAP-02 | Phase 2 | Complete |
| MAP-03 | Phase 2 | Complete |
| MAP-04 | Phase 2 | Complete |
| MAP-05 | Phase 2 | Complete |
| SELC-01 | Phase 2 | Complete |
| SELC-02 | Phase 2 | Complete |
| SELC-03 | Phase 2 | Complete |
| SIM-01 | Phase 3 | Complete |
| SIM-02 | Phase 3 | Complete |
| SIM-03 | Phase 3 | Complete |
| SIM-04 | Phase 3 | Complete |
| SIM-05 | Phase 3 | Complete |
| SIM-06 | Phase 3 | Complete |
| SIM-07 | Phase 3 | Complete |
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Complete |
| DATA-03 | Phase 3 | Complete |
| RES-01 | Phase 4 | Complete |
| RES-02 | Phase 4 | Complete |
| RPT-01 | Phase 4 | Complete |
| TRN-01 | Phase 4 | Complete |
| TRN-02 | Phase 5 | Pending |
| TRN-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-09*
*Last updated: 2026-05-09 after architecture update (AngularFire + Firebase fallback)*
