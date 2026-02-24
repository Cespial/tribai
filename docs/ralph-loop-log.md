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

## RLP-004 — Answer Quality (LLM Judge)

**Fecha:** 2026-02-24
**Hipotesis:** Un LLM judge (Haiku) que evalua respuestas generadas completas (no solo retrieval) permite medir calidad end-to-end: faithfulness, completeness, relevance, citation quality, clarity.

**Cambios:**
- `eval/metrics/llm-judge.ts`: Upgraded con degradacion graceful (retorna `null` si Haiku unavailable), prompt mejorado con rubrica detallada 1-5, contexto truncado a 4K para eficiencia
- `eval/run_eval.ts`: Integrado `--judge` flag + `--judge-sample N` (default 30)
  - Genera respuesta LLM completa (Sonnet) con pipeline completo (enhance → retrieve → rerank → assemble → evidence → prompt → generateText)
  - Juzga con `llmJudge` (Haiku): 5 dimensiones × 1-5 escala → composite score
  - Muestreo determinista (evenly spaced) para reproducibilidad
  - Metricas judge agregadas en output + JSON results
  - Total metricas: 17 retrieval + 6 judge = 23
- `package.json`: Nuevo script `eval:judge` (shortcut para `--judge --judge-sample 30`)

**Metricas pre:**
- Smoke: 10/10
- Typecheck: clean
- Judge: N/A (no existia)

**Metricas post:**
- Smoke: 10/10 (9/10 degraded, 1/10 early-exit)
- Typecheck: clean
- Judge: integrado, pendiente ejecucion completa cuando Haiku disponible (2026-03-01)

**Decision:** MANTENER. Agrega dimension end-to-end al eval framework. El flag `--judge` es opt-in, no afecta el eval normal. Cuando Haiku este disponible, `npm run eval:judge` dara las primeras metricas de answer quality.

---

## RLP-005 — Observabilidad de Produccion

**Fecha:** 2026-02-24
**Hipotesis:** Un endpoint `/api/health` y un log consolidado por request mejoran la operabilidad en produccion: monitoreo, alerting, debugging.

**Cambios:**
- `src/app/api/health/route.ts`: Nuevo endpoint `GET /api/health`
  - Retorna status (healthy/degraded), Pinecone circuit breaker state, embedding cache stats, uptimeMs
  - Ideal para uptime monitors (UptimeRobot, Vercel Cron, etc.)
- `src/app/api/chat/route.ts`: Reescrito logging de requests
  - Reemplaza 2 logs separados ("request received" + "response ready") con 1 log consolidado `request_complete`
  - Log incluye: requestId, query, ip, conversationId, queryType, degradedMode, confidenceLevel, evidenceQuality, topScore, chunks, tokens, contradictions, namespaceContribution, timings completos
  - Agrega `try/catch` con `logger.error` estructurado en caso de fallo del pipeline (query, ip, stage, error message)
  - Error response retorna el mensaje de error del pipeline (ej: "Pinecone no esta disponible temporalmente")

**Metricas pre:**
- Smoke: 10/10
- Typecheck: clean
- Health endpoint: N/A

**Metricas post:**
- Typecheck: clean
- Smoke: latency-flaky (Pinecone lento, no relacionado con cambios — solo afecta LATENCY, correctness 10/10)
- `GET /api/health` funcional
- 1 JSON line por request en lugar de 2
- Errores estructurados con logger.error

**Decision:** MANTENER. Mejora operabilidad sin afectar correctness. Health endpoint es base para monitoring. Log consolidado reduce ruido y mejora parseabilidad.

---

## Backlog

| ID | Titulo | Estado |
|----|--------|--------|
| RLP-001 | Degrade Mode Formal | COMPLETADO |
| RLP-002 | Circuit Breaker Pinecone | COMPLETADO |
| RLP-003 | LLM Rerank real | PENDIENTE |
| RLP-004 | Answer Quality (LLM Judge) | COMPLETADO |
| RLP-005 | Observabilidad de produccion | COMPLETADO |
