# Phase 1: Setup e Base Visual - Context

**Gathered:** 2026-05-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Entregar a base navegável do produto para produção com fluxo de entrada controlado, carregamento inicial de dados e mapa funcional mínimo. Esta fase cobre landing protegida, entrada no app AngularJS, estratégia Firebase com fallback local e critérios objetivos de pronto para avançar.

</domain>

<decisions>
## Implementation Decisions

### Dados e inicialização
- **D-01:** Se Firebase falhar na carga inicial, a aplicação entra em fallback local automaticamente e sem aviso visual.
- **D-02:** Quando Firebase estiver disponível, ele é sempre a fonte prioritária de dados.
- **D-03:** Se o salvamento de simulação no Firebase falhar, deve ser gerada fila local para reenvio posterior.
- **D-04:** A fila local de simulações pendentes será persistida em `localStorage`.
- **D-05:** O reenvio de pendências deve ocorrer na abertura da aplicação e também após cada novo cálculo/simulação.
- **D-06:** Se um item da fila falhar no reenvio, ele deve ser descartado.

### Fluxo de entrada
- **D-07:** Após login com senha na landing, redirecionar automaticamente para `/viabilidade-verde/`.
- **D-08:** Se o redirecionamento automático falhar, voltar para landing com link manual para `/viabilidade-verde/`.
- **D-09:** Sessão de acesso da landing dura até logout manual.
- **D-10:** No logout, redirecionar para `/viabilidade-verde/` em modo visitante.

### Escopo mínimo do mapa na Fase 1
- **D-11:** Entrega mínima do mapa nesta fase: base do Brasil + marcadores de oportunidades.
- **D-12:** O mapa deve lembrar o último ponto visitado do usuário.
- **D-13:** Se não houver último ponto salvo, iniciar com visão do Brasil inteiro.
- **D-14:** Seleção de oportunidade deve atualizar formulário e destacar marcador no mapa.

### Critério de pronto da Fase 1
- **D-15:** Gate principal: landing protegida + redirecionamento + app Angular carregando sem erro.
- **D-16:** Critério de dados: oportunidades e premissas devem carregar com fallback funcional.
- **D-17:** Validação mínima obrigatória em produção inclui Playwright.
- **D-18:** Escopo mínimo de E2E em produção: 2-3 testes (acesso, carga de dados, seleção de oportunidade).

### the agent's Discretion
- Sem áreas delegadas ao agente nesta sessão; decisões foram explicitamente definidas pelo usuário.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Escopo e metas da fase
- `.planning/ROADMAP.md` — define objetivo da Fase 1, requisitos mapeados e planos 01-01/01-02/01-03.
- `.planning/REQUIREMENTS.md` — requisitos funcionais `LAND-*`, `MAP-01`, `DATA-01`, `DATA-02` e critérios de cobertura.
- `.planning/PROJECT.md` — visão do produto, constraints de stack e decisões já travadas.

### Implementação atual da entrada e segurança
- `index.php` — landing protegida por senha e ponto de entrada para o protótipo.
- `config/security.php` — hashes de senha/token e política atual de acesso/deploy.
- `deploy/pull.php` — endpoint de deploy para atualização de produção.

### Base AngularJS/AngularFire do protótipo
- `viabilidade-verde/index.html` — composição principal da tela (mapa, lista, simulador, resultados).
- `viabilidade-verde/app.js` — módulo AngularJS e configuração base.
- `viabilidade-verde/firebase.config.js` — chave de ativação Firebase e configuração de ambiente.
- `viabilidade-verde/app/controllers/HomeController.js` — orquestração de carregamento, seleção e cálculo.
- `viabilidade-verde/app/services/FirebaseDataService.js` — leitura/escrita em Firebase e fallback local.
- `viabilidade-verde/app/services/MapDataService.js` — transformação de oportunidades em marcadores.
- `viabilidade-verde/app/services/ViabilityService.js` — motor de cálculo econômico.
- `viabilidade-verde/app/services/RecommendationService.js` — classificação e recomendação textual.
- `viabilidade-verde/app/services/ReportService.js` — estrutura do relatório executivo.

### Dados de fallback
- `viabilidade-verde/data/fallback-opportunities.json` — oportunidades base para demo offline.
- `viabilidade-verde/data/fallback-assumptions.json` — premissas de cálculo por rota.
- `viabilidade-verde/data/regions.geojson` — referência geográfica inicial.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `HomeController` já concentra fluxo inicial e pode receber facilmente regras de redirecionamento e persistência de viewport.
- `FirebaseDataService` já implementa chave de fallback Firebase/local e é o ponto correto para fila de reenvio.
- `MapDataService` já abstrai criação de marcadores e suporta evolução para destaque/seleção visual.
- `ViabilityService`, `RecommendationService` e `ReportService` já separam responsabilidades do cálculo e saída.

### Established Patterns
- Arquitetura AngularJS simples por services/controllers, com responsabilidade bem separada.
- Configuração Firebase via `window.*` em arquivo dedicado (`firebase.config.js`), evitando hardcode nos services.
- Dependência de CDN para libs centrais (AngularJS, Firebase, AngularFire, Leaflet), favorecendo rapidez de setup.

### Integration Points
- `index.php` controla gate de acesso e handoff para `/viabilidade-verde/`.
- `HomeController.activate()` é o ponto para estratégia de carregamento e fallback.
- `HomeController.selectOpportunity()` é o ponto para política de foco/último ponto no mapa.
- `FirebaseDataService.saveSimulation()` é o ponto natural para fila local e reenvio de pendências.

</code_context>

<specifics>
## Specific Ideas

- A fase deve privilegiar comportamento resiliente e sem fricção visual para demo (fallback silencioso).
- A validação de produção deve acontecer com testes E2E Playwright diretamente no ambiente publicado.
- A navegação pós-login deve ser automática para reduzir cliques e acelerar a narrativa da demo.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 1-Setup e Base Visual*
*Context gathered: 2026-05-09*
