# Discussion Log: Phase 2 - Camadas e Interacao Territorial

**Date:** 2026-05-09
**Mode:** direct/auto (sem perguntas redundantes)

## Why this mode
- Usuario definiu explicitamente execucao direta no framework (discuss -> plan -> execute -> verify) com interrupcao apenas para checkpoints criticos.
- Decisoes de produto e operacao ja estavam consolidadas no historico recente.

## Gray areas resolved automaticamente

1. **Escopo de camadas para demo**
- Decisao: manter subconjunto objetivo (industrias, biometano, hidrogenio, portos, fertilizantes, SAF, infraestrutura, regioes prioritarias).
- Motivo: reduzir ruido visual e risco de demo.

2. **Comportamento de selecao territorial**
- Decisao: selecao deve sincronizar mapa/lista + painel lateral.
- Motivo: reforco de contexto e acionamento natural para simulacao.

3. **Contrato do painel lateral**
- Decisao: painel com contexto completo e CTA explicita "Calcular Viabilidade".
- Motivo: fechar ponte para fase 3 sem antecipar calculos.

4. **Higiene operacional herdada**
- Decisao: polling Telegram exclusivo no worker; scripts auxiliares sem `getUpdates`.
- Motivo: evitar recorrencia de erro 409.

## Captured anti-pattern understanding (blocking constraints)

### Anti-pattern 1
- O que e: concorrencia de polling Telegram fora do worker principal.
- Como ocorreu: notificadores e worker consumiram `getUpdates` em paralelo, gerando conflito 409.
- Prevencao estrutural: bloquear `getUpdates` fora do worker; scripts auxiliares so leem cache/estado.

### Anti-pattern 2
- O que e: uso indevido de comando de commit para exploracao.
- Como ocorreu: `gsd-sdk query commit --help` gerou commit real acidental.
- Prevencao estrutural: ajuda/documentacao sem comandos mutantes; commits apenas via git explicito.

## Outcome
- CONTEXT.md da fase 2 gerado com decisoes acionaveis para plan-phase.

