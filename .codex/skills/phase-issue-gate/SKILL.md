---
name: phase-issue-gate
description: Gate operacional para iniciar tarefas GSD verificando issues abertas da fase atual.
---

## Objetivo
Garantir que toda execucao de fase comece com visibilidade das issues abertas ligadas a fase.

## Passos obrigatorios
1. Rodar `npm run gate:phase-issues` antes de iniciar tarefas tecnicas.
2. Ler `.planning/reports/phase-<N>-issues.md` e listar o que entra no escopo.
3. Se houver issue da fase, incluir no plano da execucao atual.
4. Antes de deploy, repetir o gate para confirmar pendencias.

## Resultado esperado
- Nao iniciar execucao no escuro.
- Toda publicacao acompanha status de backlog da fase.
