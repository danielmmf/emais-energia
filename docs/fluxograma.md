# Fluxograma — Viabilidade Verde

## Visão Geral do Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│                     ENTRADA (Home)                          │
│              https://emais-energia.devinhas.com.br/          │
└─────────────────────────┬───────────────────────────────────┘
                          │ 302 redirect
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   TELA PRINCIPAL                             │
│              /viabilidade-verde/                            │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐     │
│  │   HEADER    │  │    HERO     │  │  HERO STRIP     │     │
│  │ Azul petroleo│  │ Tagline      │  │ 3 cards de valor │     │
│  │ H1 + tagline │  │             │  │                  │     │
│  └─────────────┘  └─────────────┘  └─────────────────┘     │
└────────────┬───────────────┬──────────────────┬────────────┘
             │               │                  │
             ▼               ▼                  ▼
┌──────────────────┐ ┌────────────────┐ ┌────────────────────┐
│  PAINEL MAPA     │ │ PAINEL LAYERS  │ │  PAINEL SIMULADOR  │
│                  │ │  (Desktop)    │ │                    │
│  ┌────────────┐  │ │  7 grupos     │ │  Oportunidades     │
│  │  Leaflet   │  │ │  Toggle on/off │ │  Contexto          │
│  │  Mapa      │  │ │  Detalhes      │ │  Formulario simul.  │
│  │  interativo │  │ │  Zoom          │ │  Fator regulatorio │
│  └────────────┘  │ │  Info          │ │                    │
│                  │ │                │ │  [Calcular]        │
│  ┌────────────┐  │ │  + Mobile:     │ │                    │
│  │ Toolbars   │  │ │  Drawer sheet   │ └────────────────────┘
│  │ Fullscreen │  │ │                │                      │
│  └────────────┘  └────────────────┘                        │
└────────────┬─────────────────────┬───────────────────────┘
             │                     │
             ▼                     ▼
┌──────────────────────────┐  ┌─────────────────────────────────┐
│  SELECAO DE OPORTUNIDADE │  │  SELECAO DE REGIAO (mapa)        │
│  ou REGIAO no mapa       │  │  Click em poligono              │
│  Click em marker          │  │  Preenche contexto lateral       │
└────────────┬──────────────┘  └──────────────┬────────────────┘
             │                                   │
             └──────────────┬───────────────────┘
                            ▼
              ┌────────────────────────────┐
              │  CONTEXTO LATERAL PREENCHIDO │
              │  Regiao / Setor / Fonte     │
              │  Rota sugerida               │
              │  Potencial territorial       │
              │  Infraestrutura             │
              │  Camadas ativas              │
              │                              │
              │  [Calcular Viabilidade]       │
              └──────────────┬───────────────┘
                             ▼
              ┌────────────────────────────┐
              │  SIMULADOR ABERTO          │
              │  Campos preenchidos         │
              │  Fator regulatorio (opcional)│
              │  [Executar simulacao]       │
              └──────────────┬───────────────┘
                             ▼
              ┌────────────────────────────┐
              │  RESULTADO DA SIMULACAO      │
              │  (Scroll automatico)        │
              │                             │
              │  ┌──────┐┌──────┐┌──────┐ │
              │  │Custo │ │Custo │ │Econom│ │
              │  │Atual │ │Verde │ │Anual │ │
              │  └──────┘ └──────┘ └──────┘ │
              │  ┌──────┐┌──────┐┌──────┐ │
              │  │Payback│ │Reducao│ │Viable│ │
              │  │      │ │Emissoes│ │dade │ │
              │  └──────┘ └──────┘ └──────┘ │
              │                             │
              │  Recomendacao textual        │
              │  Confiabilidade e fatores   │
              │  regulatorios                 │
              │  Dados recomendados          │
              │                             │
              │  ┌──────────────────────┐   │
              │  │  RELATORIO EXECUTIVO │   │
              │  │  Download HTML        │   │
              │  └──────────────────────┘   │
              └──────────────┬───────────────┘
                             ▼
              ┌────────────────────────────┐
              │  RELATORIO BAIXADO           │
              │  Pagina HTML exportada      │
              │  Snapshot do mapa            │
              │  Calculos detalhados         │
              │  Confiabilidade              │
              │  Fatores regulatorios        │
              │  Dados faltantes             │
              │  Proximos passos             │
              └─────────────────────────────┘
```

## Fluxo de Camadas do Mapa

```
┌─────────────────────────────────────────────────────────────┐
│                    PAINEL DE CAMADAS                         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ [−] Energia e Transicao                               │  │
│  │     ├─[✓] Biometano          (active)                 │  │
│  │     ├─[✓] Energia renovavel  (active)                 │  │
│  │     ├─[ ] Hidrogenio                                   │  │
│  │     └─[ ] Biomassa                                     │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ [+] Infraestrutura                                     │  │
│  │     ├─[✓] Portos                (active)               │  │
│  │     ├─[✓] Gasodutos            (active)                │  │
│  │     ├─[ ] Linhas transmissao                            │  │
│  │     └─[ ] Ferrovias                                     │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ [+] Regulaçao e Politicas Publicas                    │  │
│  │     ├─[ ] Incentivos fiscais                           │  │
│  │     ├─[ ] Marco regulatorio H2                         │  │
│  │     ├─[ ] Financiamento verde                          │  │
│  │     └─[ ] Politicas estaduais                          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Fluxo Mobile

```
┌──────────────────────────────────┐
│  TELA PRINCIPAL MOBILE            │
│  ┌────────────────────────────┐  │
│  │ HEADER (azul petroleo)      │  │
│  │ H1 + tagline               │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ [Camadas] [Simular] [Res.] │  │
│  │ [Relatorio]                 │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │                             │  │
│  │         MAPA LEAFLET        │  │
│  │      (58vh min-height)      │  │
│  │                             │  │
│  │                       [+][-] │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ CARD SELECAO (se ativo)    │  │
│  │ Regiao / Setor / Rota       │  │
│  │ [Calcular Viabilidade]      │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
        │
        │ [Camadas]
        ▼
┌──────────────────────────────────┐
│  MOBILE LAYER DRAWER (Bottom)     │
│  ┌────────────────────────────┐  │
│  │ X Fechar                     │  │
│  │ Painel de camadas            │  │
│  │                               │  │
│  │ [+] Energia e Transicao      │  │
│  │ [+] Infraestrutura            │  │
│  │ [+] Regulaçao                 │  │
│  │ [+] Bioeconomia               │  │
│  │ ...                           │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
        │
        │ [Simular]
        ▼
┌──────────────────────────────────┐
│  SIDEBAR MOBILE (Simulador)       │
│  ┌────────────────────────────┐  │
│  │ Oportunidades (scroll)       │  │
│  │ Contexto territorial         │  │
│  │ Formulario de simulacao      │  │
│  │ Fator regulatorio            │  │
│  │ [Executar simulacao]         │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

## Fluxo de Dados

```
┌──────────────────────────────────────────────────────────────┐
│                    SOURCES DE DADOS                          │
│                                                              │
│   ┌──────────────────┐  ┌──────────────────┐                │
│   │ Firebase Realtime │  │ Fallback JSON     │                │
│   │ Database          │  │ (local)           │                │
│   └────────┬───────────┘  └────────┬─────────┘                │
│            │                       │                          │
│            ▼                       ▼                          │
│   ┌──────────────────────────────────────────────┐           │
│   │  FirebaseDataService                          │           │
│   │  - getOpportunities()                         │           │
│   │  - getAssumptions()                           │           │
│   │  - getRegions()                               │           │
│   │  - getPidArcgisPorts()                        │           │
│   │  - getPidArcgisBiomethane()                   │           │
│   │  - getPidArcgisHydrogen()                     │           │
│   │  - saveSimulation()                            │           │
│   └─────────────────────┬────────────────────────┘           │
│                          │                                    │
│                          ▼                                    │
│   ┌──────────────────────────────────────────────┐           │
│   │  HomeController                                │           │
│   │  - carrega dados no activate()                │           │
│   │  - constroi layerGroups                       │           │
│   │  - bindMapEvents                             │           │
│   │  - refreshMapData()                          │           │
│   └─────────────────────┬────────────────────────┘           │
│                          │                                    │
│            ┌─────────────┴─────────────┐                     │
│            ▼                           ▼                     │
│   ┌──────────────────┐  ┌──────────────────────────┐        │
│   │  MAPA (Leaflet)   │  │  SIMULADOR               │        │
│   │  - Markers        │  │  - Form inputs            │        │
│   │  - Polygons        │  │  - ViabilityService      │        │
│   │  - Lines           │  │  - RecommendationService │        │
│   │  - LayerControl    │  │  - ReportService          │        │
│   └──────────────────┘  └──────────────────────────┘         │
│                          │                                    │
│                          ▼                                    │
│                 ┌──────────────────┐                          │
│                 │  RESULTADO       │                          │
│                 │  - Custo atual   │                          │
│                 │  - Custo verde   │                          │
│                 │  - Payback       │                          │
│                 │  - Confiabilidade│                          │
│                 │  - Regulacao     │                          │
│                 │  - Relatorio HTML │                         │
│                 └──────────────────┘                          │
└──────────────────────────────────────────────────────────────┘
```

## Tela de Feedback (Modal)

```
┌──────────────────────────────────────────────────────────────┐
│                   FEEDBACK MODAL                             │
│   ┌──────────────────────────────────────────────────────┐   │
│   │ Feedback                                          │   │
│   │ X                                                 │   │
│   │ ─────────────────────────────────────────────────  │   │
│   │                                                     │   │
│   │ "Quem e voce?"                                      │   │
│   │                                                     │   │
│   │ [Mentor]  [Gang]  [Xereta]                         │   │
│   │                                                     │   │
│   │  Se Mentor/Gang → pedido de senha                  │   │
│   │  Se Xereta     → opiniao direta (sucesso)          │   │
│   │                                                     │   │
│   │  Mentor: duvida/sugestao + falar/escrever         │   │
│   │  Gang: tipo + prioridade + mensagem                │   │
│   │  Xereta: opiniao sobre vibecoding                  │   │
│   │                                                     │   │
│   │  → Salva no Firebase ou localStorage (offline)     │   │
│   │  → Envia para Telegram (Gang/Mentor)              │   │
│   └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```
