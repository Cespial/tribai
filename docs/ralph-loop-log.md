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

## Backlog

| ID | Titulo | Estado |
|----|--------|--------|
| RLP-001 | Degrade Mode Formal | COMPLETADO |
| RLP-002 | Circuit Breaker Pinecone | PENDIENTE |
| RLP-003 | LLM Rerank real | PENDIENTE |
| RLP-004 | Answer Quality (LLM Judge) | PENDIENTE |
| RLP-005 | Observabilidad de produccion | PENDIENTE |
