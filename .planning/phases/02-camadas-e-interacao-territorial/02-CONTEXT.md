# Phase 2: Camadas e Interacao Territorial - Context

**Gathered:** 2026-05-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Entregar leitura territorial acionavel: camadas ligaveis/desligaveis, clusters, poligonos/linhas e painel lateral com contexto completo para iniciar a simulacao.

Esta fase NAO implementa novos calculos economicos; ela prepara a ponte mapa -> contexto -> acao "Calcular Viabilidade".

</domain>

<decisions>
## Implementation Decisions

### Fluxo e foco de entrega
- **D-21:** Priorizar o fluxo principal da demo em ordem: camadas basicas -> selecao -> painel lateral -> botao de acao.
- **D-22:** Manter numero de camadas visiveis na demo principal enxuto para reduzir poluicao visual e risco de navegacao.
- **D-23:** Selecao de oportunidade deve refletir em dois pontos ao mesmo tempo: destaque no mapa/lista e painel lateral preenchido.

### Camadas e comportamento territorial
- **D-24:** Camadas de marcadores da fase: industrias, biometano, hidrogenio, portos, fertilizantes e SAF.
- **D-25:** "Infraestrutura" sera representada por linhas (ex.: gasodutos/transmissao) usando GeoJSON simplificado.
- **D-26:** "Regioes prioritarias" sera representada por poligonos GeoJSON com foco em estados-alvo do MVP.
- **D-27:** Clustering deve estar ativo para reduzir ruido em zoom aberto e facilitar leitura macro.

### Painel lateral e gatilho para fase 3
- **D-28:** Painel lateral deve exibir: regiao, setor, fonte atual sugerida, rota verde sugerida, potencial, infraestrutura e risco inicial.
- **D-29:** Acao "Calcular Viabilidade" deve ser explicita no painel lateral (sem auto-calculo nesta fase).
- **D-30:** O painel deve receber dados tanto de marcador individual quanto de regiao/oportunidade selecionada.

### Robustez e anti-patterns operacionais herdados
- **D-31:** Nenhum script auxiliar de notificacao deve consumir `getUpdates`; polling Telegram fica exclusivo no worker continuo.
- **D-32:** Comandos de commit devem ser sempre explicitos via git; nao usar `gsd-sdk query commit` para inspecao/ajuda.

### Discretion
- O executor pode ajustar ordem fina de implementacao entre arquivos de componente/servico, desde que preserve o fluxo principal e os requisitos MAP/SELC desta fase.

</decisions>

<canonical_refs>
## Canonical References

### Escopo da fase
- `.planning/ROADMAP.md` — definicao da Phase 2 e planos 02-01..02-04.
- `.planning/REQUIREMENTS.md` — requisitos MAP-02..MAP-05 e SELC-01..SELC-03.
- `.planning/PROJECT.md` — direcao do produto e restricoes do MVP.

### Base implementada na fase anterior
- `.planning/phases/01-setup-e-base-visual/01-CONTEXT.md` — decisoes tecnicas de base e resiliencia de dados.
- `.planning/phases/01-setup-e-base-visual/.continue-here.md` — anti-patterns bloqueantes herdados para continuidade segura.
- `viabilidade-verde/index.html` — estrutura de layout atual (mapa/lista/simulador).
- `viabilidade-verde/app/controllers/HomeController.js` — selecao de oportunidades e estado do mapa.
- `viabilidade-verde/app/services/MapDataService.js` — construcao de marcadores e contrato de dados no mapa.
- `viabilidade-verde/data/regions.geojson` — base de regioes para poligonos.
- `viabilidade-verde/data/fallback-opportunities.json` — oportunidades para interacao inicial.

### Operacao continua (nao funcional da fase, mas obrigatoria)
- `scripts/bot/telegram_groq_worker.js` — polling oficial Telegram.
- `scripts/ops/telegram_notify.sh` — notificacao usando cache de chats (sem getUpdates).
- `monitor.php` — painel realtime de operacao.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `HomeController` ja concentra `selectOpportunity` e e o ponto natural para acionar preenchimento do painel lateral.
- `MapDataService` ja transforma oportunidades em markers e pode ser extendido para metadados de camada/estilo.
- Estrutura visual atual em `index.html` + CSS permite inserir controle de camadas e painel sem reescrever a tela.

### Established Patterns
- AngularJS com separacao por services/controllers e fallback local de dados.
- Firebase opcional com operacao resiliente em JSON local.
- Demo orientada a clareza operacional, nao completude de dados.

### Integration Points
- `viabilidade-verde/index.html` — entrada para controle de camadas e rendering de blocos do painel.
- `viabilidade-verde/app/controllers/HomeController.js` — orquestracao de estado de selecao e bind da acao "Calcular Viabilidade".
- `viabilidade-verde/app/services/MapDataService.js` — contrato de marker/cluster e expansao para tipos de camada.

</code_context>

<specifics>
## Specific Ideas

- Na fase 2, o sucesso e o usuario conseguir clicar no territorio e entender contexto suficiente para decidir "vou simular".
- O mapa deve favorecer legibilidade em pitch: menos ruido, mais sinal.
- A camada de operacao (bot/monitor) deve permanecer estavel durante iteracoes de frontend.

</specifics>

<deferred>
## Deferred Ideas

- Controle avancado de filtros multicriterio por camada.
- Heatmap real de potencial energetico com normalizacao por fonte.
- Edicao de camadas pelo usuario final.

</deferred>

---

*Phase: 2-Camadas e Interacao Territorial*
*Context gathered: 2026-05-09*
