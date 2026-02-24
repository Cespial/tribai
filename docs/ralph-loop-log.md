# Ralph Loop Log — SuperApp Tributaria Colombia

Registro de iteraciones del Ralph Loop (RLP) para mejora continua del pipeline RAG.

---

## RLP-001 — Degrade Mode Formal

**Fecha:** 2026-02-24
**Hipotesis:** Formalizar degradacion (cuando Haiku falla) mejora estabilidad sin afectar metricas, y vuelve tests menos fragiles.

**Cambios:**
- `EnhancedQuery` y `RAGDebugInfo` ahora incluyen `degradedMode` y `degradedReason`
- Query enhancer reemplaza `console.error` (stack traces ruidosos) con `console.warn` (1 linea)
- Pipeline surface `degradedMode` en ragMetadata del chat response
- Smoke test muestra cuantos tests corrieron en modo degradado sin relajar assertions

**Metricas pre:**
- Smoke: 10/10
- (pendiente eval post-implementacion)

**Metricas post:**
- Smoke: 10/10 (9/10 degraded, 1/10 early-exit)
- Typecheck: clean
- Zero stack traces en stdout (solo `console.warn` de 1 linea en stderr)
- `ragMetadata.degradedMode` y `degradedReason` presentes en respuesta del chat

**Decision:** MANTENER. Mejora observabilidad sin afectar correctness. Degraded mode es visible en smoke test output y en ragMetadata del cliente.

---

## RLP-002 — Circuit Breaker Pinecone

**Fecha:** 2026-02-24
**Hipotesis:** Un circuit breaker en el cliente Pinecone evita cascadas de retries cuando Pinecone esta caido, mejora P95 latency y hace el pipeline mas resiliente.

**Cambios:**
- `client.ts`: Circuit breaker con threshold=5 failures, cooldown=30s
- `client.ts`: `getPineconeHealth()` export para observabilidad (healthy, consecutiveFailures, breakerOpen)
- `client.ts`: `recordSuccess()`/`recordFailure()` integrados en `withRetry`
- `client.ts`: `withRetry` fail-fast cuando breaker esta abierto (no intenta llamadas)
- `retriever.ts`: `console.error` → `console.warn` (1 linea truncada) en namespace failures
- `pipeline.ts`: Import `getPineconeHealth`, incluye `pineconeHealth` en pipeline trace log
- `pipeline.ts`: Retrieval catch distingue circuit breaker errors con mensaje usuario-friendly

**Metricas pre:**
- Smoke: 10/10
- Typecheck: clean

**Metricas post:**
- Smoke: 10/10 (9/10 degraded, 1/10 early-exit)
- Typecheck: clean
- Zero `console.error` en retriever (solo `console.warn`)
- `pineconeHealth` presente en pipeline trace log
- Circuit breaker fail-fast evita retries cuando Pinecone down

**Decision:** MANTENER. Mejora resiliencia sin afectar correctness. Breaker es conservador (5 failures antes de trip) y auto-recovery (30s cooldown). Pipeline trace log muestra health status.

---

## Backlog

| ID | Titulo | Estado |
|----|--------|--------|
| RLP-001 | Degrade Mode Formal | COMPLETADO |
| RLP-002 | Circuit Breaker Pinecone | COMPLETADO |
| RLP-003 | LLM Rerank real | PENDIENTE |
| RLP-004 | Answer Quality (LLM Judge) | PENDIENTE |
| RLP-005 | Observabilidad de produccion | PENDIENTE |
