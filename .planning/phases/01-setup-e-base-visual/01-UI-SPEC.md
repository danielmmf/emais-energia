---
phase: 1
slug: setup-e-base-visual
status: approved
shadcn_initialized: false
preset: none
created: 2026-05-09
---

# Phase 1 — UI Design Contract

> Visual and interaction contract for frontend phases. Generated inline due to missing gsd-ui-researcher/gsd-ui-checker agents in this environment.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none (AngularJS + HTML/CSS custom) |
| Icon library | none (MVP sem icon set dedicado) |
| Font | "Segoe UI", Tahoma, Geneva, Verdana, sans-serif |

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Espaços curtos em labels e micro gaps |
| sm | 8px | Separação compacta em inputs e itens de lista |
| md | 16px | Espaçamento padrão entre blocos |
| lg | 24px | Padding de seções principais |
| xl | 32px | Distância entre áreas macro |
| 2xl | 48px | Separação de seções de página |
| 3xl | 64px | Reservado para expansão futura |

Exceptions: none

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px | 400 | 1.5 |
| Label | 14px | 500 | 1.4 |
| Heading | 26px (H1) / 17px (H2) | 600 | 1.25 |
| Display | 32px (uso futuro) | 700 | 1.2 |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#eef4ef` | Fundo geral e base visual clara |
| Secondary (30%) | `#ffffff` e `#eaf6ee` | Cartões, painéis, estados selecionados |
| Accent (10%) | `#2f8a4b` | CTA principal, destaque de ação e estado ativo |
| Destructive | `#a32626` | Mensagens de erro e estados críticos |

Accent reserved for: botão primário, destaque de item selecionado, status ativo do fluxo.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | Calcular Viabilidade |
| Empty state heading | Oportunidades indisponiveis no momento |
| Empty state body | Nao foi possivel carregar oportunidades. Recarregue a pagina para tentar novamente. |
| Error state | Falha ao carregar dados: tente novamente em instantes. |
| Destructive confirmation | Sair: confirmar saida e limpar sessao de mentor |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | none | not required |

---

## UX/Flow Locks for Phase 1

- Pos-login na landing: redirecionamento automatico para `/viabilidade-verde/`.
- Se redirecionamento automatico falhar: exibir fallback com link manual para `/viabilidade-verde/`.
- Mapa inicia com Brasil inteiro quando nao houver ultimo ponto salvo.
- Selecao de oportunidade atualiza formulario e destaca marcador no mapa.
- Fallback de dados deve ser silencioso (sem aviso visual) quando Firebase falhar na carga inicial.

---

## Skill Usage Contract (Planning Input)

As skills solicitadas para esta fase devem ser consideradas no planejamento e execucao:
- `seo-write`
- `epic-brand`
- `frontend-design`
- `agent-browser`
- `web-design`

Nota: estas skills nao foram encontradas no workspace atual durante esta etapa; o plano deve incluir tarefa explicita para criar/instalar e validar cada skill antes de depender delas em execucao.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-05-09 (inline fallback without ui agents)
