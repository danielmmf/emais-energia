# Phase 1: Setup e Base Visual - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-09
**Phase:** 1-setup-e-base-visual
**Areas discussed:** comportamento de dados na inicialização, fluxo de entrada, escopo mínimo do mapa, critério de fase pronta

---

## Comportamento de dados na inicialização

| Option | Description | Selected |
|--------|-------------|----------|
| Fallback com aviso discreto | Fallback automático e UI informa fallback | |
| Fallback silencioso | Fallback automático sem aviso visual | ✓ |
| Bloqueio por erro | Tela bloqueada até recuperação | |

**User's choice:** fallback silencioso em falha de Firebase.
**Notes:** Firebase permanece fonte prioritária quando disponível; simulações falhas entram em fila `localStorage`; reenvio na abertura e após novo cálculo; se falhar no reenvio, descarta.

---

## Fluxo de entrada

| Option | Description | Selected |
|--------|-------------|----------|
| Pós-login manual | Usuário clica link manual para app | |
| Pós-login automático | Redireciona automaticamente para `/viabilidade-verde/` | ✓ |
| Sem redirecionamento | Permanece na landing autenticada | |

**User's choice:** redirecionamento automático.
**Notes:** fallback do redirecionamento: voltar para landing com link manual; sessão até logout manual; logout deve enviar para `/viabilidade-verde/` em modo visitante.

---

## Escopo mínimo do mapa

| Option | Description | Selected |
|--------|-------------|----------|
| Mapa base + marcadores | Entrega mínima do mapa na fase | ✓ |
| Mapa + controle visual de camadas | UI de camada sem lógica completa | |
| Mapa + camadas completas | Lógica de camadas já nesta fase | |

**User's choice:** mapa base + marcadores.
**Notes:** lembrar último ponto visitado; se não houver ponto salvo, abrir no Brasil; seleção atualiza formulário e destaca marcador.

---

## Critério de fase pronta

| Option | Description | Selected |
|--------|-------------|----------|
| Gate completo de entrada | landing protegida + redirecionamento + app sem erro | ✓ |
| Gate só do app | validar apenas carga do Angular | |
| Gate só da landing | validar apenas bloqueio de acesso | |

**User's choice:** gate completo de entrada.
**Notes:** deve validar carga de oportunidades/premissas com fallback funcional; validação mínima obrigatória em produção com Playwright; escopo mínimo de 2-3 testes (acesso, carga, seleção).

---

## the agent's Discretion

Nenhuma decisão delegada explicitamente ao agente.

## Deferred Ideas

Nenhuma — a discussão permaneceu no escopo da Fase 1.
