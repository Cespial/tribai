# RAG v3 Operational Plan — SuperApp Tributaria Colombia

**Fecha:** 2026-02-22
**Baseline evaluado:** 300 preguntas, 9 categorías
**Supervisor:** Claude Code (multi-agent)
**Ejecutores:** 6 Agentes CODEX (ChatGPT)

---

## PARTE 0: DIAGNÓSTICO DE CAUSAS RAÍZ

### 0.1 Las 3 causas del 0% Source Type Accuracy

| # | Causa | Evidencia | Ubicación |
|---|-------|-----------|-----------|
| **C1** | `eval/run_eval.ts` NO pasa `multiSourceChunks` a `assembleContext()` | Línea 116-119: `assembleContext(reranked, { useSiblingRetrieval, maxTokens })` — falta `multiSourceChunks` | `eval/run_eval.ts:116` |
| **C2** | `eval/run_eval.ts` NO reranquea multiSourceChunks | Línea 113 solo hace `heuristicRerank(chunks, ...)` para ET. No llama `heuristicRerankMultiSource()` | `eval/run_eval.ts:113` |
| **C3** | Métrica compara `context.externalSources[].namespace` (siempre vacío) vs `expected_external_sources` | Como C1 causa `externalSources = []`, `foundInContext / expected = 0/N = 0%` | `eval/run_eval.ts:163-169` |

**Nota:** La producción (`pipeline.ts:94-106`) SÍ pasa `multiSourceChunks` correctamente. El bug es SOLO en el eval runner.

### 0.2 Las 3 causas del 12.7% External Source Presence

| # | Causa | Evidencia | Ubicación |
|---|-------|-----------|-----------|
| **E1** | `dynamicThreshold` del namespace "" se aplica a externos | Threshold sube a 0.38 cuando top-5 ET > 0.70, filtrando doctrina con scores 0.30-0.37 | `retriever.ts:80,124` |
| **E2** | `multiNamespaceTopK = 8` por namespace es insuficiente | Con 56K docs en doctrina, topK=8 pierde docs relevantes de baja similaridad | `constants.ts:14` |
| **E3** | `classifyQueryType()` y `getQueryRoutingConfig()` son dead code | Nunca se importan; solo `prioritizeNamespaces()` se usa, sin adaptar topK/threshold por tipo | `namespace-router.ts:9,48` |

### 0.3 Las 3 causas del P@5 = 0.151

| # | Causa | Evidencia | Ubicación |
|---|-------|-----------|-----------|
| **P1** | `fact_not_in_context` (4,598 errores) está MIS-CONTADO | `analyzeErrors()` recibe `contextString` como "answer" y busca "Art. NNN" con regex. El contexto cita artículos cruzados que NO están en `expectedArticles` → cada mención cuenta como error | `error-categorizer.ts:86-98` |
| **P2** | P@5 mide si top-5 chunks contienen artículos esperados, pero HyDE + sub-queries traen chunks de artículos tangencialmente relacionados | Sub-queries expanden semántica → falsos positivos en top-5 | `retriever.ts:89-107` |
| **P3** | Reranker boosts son débiles (max +0.20) vs rango de scores Pinecone (0.28-0.80) | Un chunk irrelevante con score 0.65 gana a uno relevante con score 0.50 + boost 0.20 = 0.70 | `reranker.ts:18-30` |

### 0.4 Las 3 causas del Comparative Recall@5 = 0.338

| # | Causa | Evidencia |
|---|-------|-----------|
| **M1** | Merging max-score favorece 1 artículo | Si Art. 240 tiene score 0.75 y Art. 241 tiene 0.65, Art. 240 llena top-5 con sus 5 chunks |
| **M2** | Reranking es chunk-centric, no article-diversified | No hay penalización por repetir artículo en top-N |
| **M3** | No hay multi-hop: Art. 240 referencia Art. 241 en `cross_references` pero nunca se sigue | Sin retrieval iterativo |

---

## PARTE A: PLAN v3 EN 10 FASES

### FASE 1: Fix Eval Pipeline (HOTFIX — 2h)

**Objetivo:** Arreglar las métricas de evaluación para que reflejen la realidad. Sin esto, no podemos medir mejoras.

**Archivos:**
- `eval/run_eval.ts` (líneas 100-170)
- `eval/analysis/error-categorizer.ts` (líneas 86-98)

**Cambios:**
1. Importar `heuristicRerankMultiSource` en eval runner
2. Reranquear multiSourceChunks después de línea 113
3. Pasar `multiSourceChunks: rerankedMultiSource` a `assembleContext()` en línea 116
4. En error-categorizer: NO contar article mentions del `contextString` como hallucination — solo contar artículos en `expected_articles` que faltan en contexto

**Pruebas:** Re-correr `npx tsx eval/run_eval.ts --experiment baseline` → Source Type Acc debe subir de 0% a >0%

**Riesgos:** Bajo — solo afecta eval, no producción

**DoD:** Source Type Accuracy > 0%, Error Rate baja significativamente

**Métrica target:** Error Rate: 0.99 → ≤ 0.50, Source Type Accuracy: 0% → refleja realidad (probablemente 5-20%)

---

### FASE 2: Namespace Threshold Independence (4h)

**Objetivo:** Cada namespace tiene su propio threshold, no hereda el del default.

**Archivos:**
- `src/lib/rag/retriever.ts` (líneas 114-170)
- `src/config/constants.ts` (agregar `namespaceThresholds`)

**Cambios:**
1. Agregar a `RAG_CONFIG`:
   ```typescript
   namespaceThresholds: {
     "": 0.28,
     doctrina: 0.22,
     jurisprudencia: 0.22,
     decretos: 0.25,
     resoluciones: 0.25,
     leyes: 0.25,
   }
   ```
2. En `retrieveMultiNamespace()`: usar threshold por namespace, no `dynamicThreshold` global
3. Subir `multiNamespaceTopK` de 8 a 15

**Pruebas:** Eval con experiment `namespace-threshold-independent`

**Riesgos:** Medio — puede traer más ruido si thresholds son muy bajos

**DoD:** External Source % > 30% en preguntas con `expected_external_sources`

**Métrica target:** External Source %: 0.127 → ≥ 0.400

---

### FASE 3: Activar Query Type Routing (3h)

**Objetivo:** Conectar `classifyQueryType()` + `getQueryRoutingConfig()` al pipeline.

**Archivos:**
- `src/lib/rag/namespace-router.ts` (ya existe, activar)
- `src/lib/rag/retriever.ts` (usar routing config)
- `src/lib/rag/pipeline.ts` (pasar query type)

**Cambios:**
1. En `retrieve()`: llamar `classifyQueryType(query.original)` → obtener `getQueryRoutingConfig(type)`
2. Usar `config.topK` del routing en vez de fijo 20
3. Usar `config.priorityNamespaces` para filtrar namespaces
4. Pasar `queryType` al reranker para ajustar boosts

**Pruebas:** Eval con experiment `query-type-routing`

**Riesgos:** Medio — clasificación regex puede mis-clasificar

**DoD:** Queries doctrinales recuperan doctrina >50% del tiempo

**Métrica target:** Doctrina R@5: 0.450 → ≥ 0.650

---

### FASE 4: Recalibrar Reranker (4h)

**Objetivo:** Subir P@5 mediante boosts más agresivos y señales léxicas.

**Archivos:**
- `src/lib/rag/reranker.ts` (líneas 18-30, 91-180)
- `src/config/constants.ts` (MULTI_SOURCE_BOOST)

**Cambios:**
1. Duplicar boost de `directArticleMention`: 0.20 → 0.35
2. Agregar `exactArticleNumber` boost: si query dice "Art. 240" y chunk es de Art. 240 → +0.40
3. Activar `sameCommunity` boost (definido pero nunca aplicado)
4. Agregar `diversityPenalty`: -0.15 por cada chunk del mismo artículo ya en top-N
5. Aumentar `titleMatchMax`: 0.12 → 0.20
6. Agregar BM25-like lexical score: overlap de tokens (no solo título)

**Pruebas:** Eval con experiment `reranker-v2`

**Riesgos:** Alto — boosts mal calibrados pueden empeorar recall

**DoD:** P@5 mejora ≥ 50% relativo sin degradar R@5

**Métrica target:** P@5: 0.151 → ≥ 0.250

---

### FASE 5: Comparative Multi-hop Retrieval (6h)

**Objetivo:** Subir Comparative Recall@5 de 0.338 a ≥ 0.600.

**Archivos:**
- `src/lib/rag/retriever.ts` (nuevo: multi-hop logic)
- `src/lib/rag/query-enhancer.ts` (forzar decomposition para comparativas)
- `src/lib/rag/reranker.ts` (diversity reranking)

**Cambios:**
1. Forzar `decomposeQuery()` para TODAS las queries comparativas (no depender de >80 chars)
2. Implementar "round-robin article selection" post-merge:
   ```typescript
   // Agrupar chunks por artículo, luego intercalar
   const byArticle = groupBy(chunks, c => c.metadata.id_articulo);
   const interleaved = roundRobin(byArticle);
   ```
3. Implementar secondary retrieval usando `cross_references`:
   ```typescript
   const topArticles = getTopArticleIds(reranked, 3);
   const crossRefs = topArticles.flatMap(a => getCrossReferences(a));
   const secondaryChunks = await retrieveByArticleIds(crossRefs);
   ```
4. Aumentar topK a 30 para queries comparativas

**Pruebas:** Eval filtrado por categoría `comparative`

**Riesgos:** Alto — multi-hop agrega latencia (100-200ms extra por retrieval secundario)

**DoD:** Comparative R@5 ≥ 0.550

**Métrica target:** Comparative R@5: 0.338 → ≥ 0.600

---

### FASE 6: Fix Error Categorization (3h)

**Objetivo:** Reducir Error Rate de 0.99 a ≤ 0.30 mediante conteo correcto.

**Archivos:**
- `eval/analysis/error-categorizer.ts` (líneas 86-98)
- `eval/run_eval.ts` (líneas 136-143)

**Cambios:**
1. Renombrar `HALLUCINATION` a `CROSS_REFERENCE_IN_CONTEXT` — no es hallucination, es una referencia cruzada legítima en el texto
2. Separar errores en:
   - `EXPECTED_ARTICLE_MISSING`: artículo esperado no recuperado (grave)
   - `EXPECTED_ARTICLE_LOW_RANK`: artículo esperado fuera de top-5 (medio)
   - `CROSS_REFERENCE_NOT_RETRIEVED`: artículo mencionado en contexto pero no recuperado (info, no error)
   - `CONTEXT_TRUNCATED`: contenido vacío (grave)
3. Solo contar como "error" las categorías graves
4. Agregar nuevas métricas:
   - `expectedArticleCoverage`: % de expected_articles en contexto
   - `contextDiversity`: # artículos distintos en contexto / topK

**Pruebas:** Re-correr eval → Error Rate debe reflejar errores reales

**Riesgos:** Bajo — solo eval

**DoD:** Error Rate ≤ 0.30, errores restantes son REALES

**Métrica target:** Error Rate: 0.990 → ≤ 0.300

---

### FASE 7: Source Typing Consistente (4h)

**Objetivo:** Source Type Accuracy de 0% a ≥ 80%.

**Archivos:**
- `src/lib/rag/context-assembler.ts` (groupExternalSources)
- `src/lib/rag/prompt-builder.ts` (secciones XML)
- `eval/run_eval.ts` (métrica sourceTypeAccuracy)
- `src/types/pinecone.ts` (verificar tipos)

**Cambios:**
1. Verificar que `ScoredMultiSourceChunk.namespace` se propaga hasta `context.externalSources[].namespace`
2. En prompt-builder: etiquetar cada fuente con tipo explícito:
   ```xml
   <doctrina namespace="doctrina">Concepto DIAN No. XXX...</doctrina>
   <jurisprudencia namespace="jurisprudencia">Sentencia C-XXX...</jurisprudencia>
   ```
3. En eval: una vez F1 está arreglada, verificar que sourceTypeAccuracy refleja correctamente
4. Agregar `doc_type` redundante como fallback si `namespace` no está

**Pruebas:** Queries con `expected_external_sources` → Source Type Acc > 80%

**Riesgos:** Bajo

**DoD:** Source Type Accuracy ≥ 0.80 para preguntas con external sources

**Métrica target:** Source Type Accuracy: 0.000 → ≥ 0.800

---

### FASE 8: Citation Accuracy (3h)

**Objetivo:** Subir Citation Accuracy de 0.60 a ≥ 0.85.

**Archivos:**
- `src/lib/rag/prompt-builder.ts` (CITATION_INSTRUCTIONS)
- `src/lib/chat/system-prompt.ts` (reglas de citación)

**Cambios:**
1. Bug fix: `CITATION_INSTRUCTIONS` solo se inyecta cuando `hasExternalSources === true` → inyectar SIEMPRE
2. Mejorar instrucciones de citación en system prompt:
   ```
   REGLA ABSOLUTA: SOLO cita artículos que estén en <context>.
   Si el usuario pregunta por un artículo que NO está en el contexto,
   di "No tengo ese artículo en mi contexto actual" en vez de inventar.
   ```
3. Agregar "citation fence": lista explícita de artículos disponibles al inicio del contexto

**Pruebas:** Test manual + eval automated

**Riesgos:** Bajo — solo prompt engineering

**DoD:** Citation Accuracy ≥ 0.85

**Métrica target:** Citation Accuracy: 0.600 → ≥ 0.850

---

### FASE 9: Latency Optimization (4h)

**Objetivo:** Reducir latencia sin sacrificar calidad.

**Archivos:**
- `src/lib/rag/pipeline.ts` (LLM rerank toggle)
- `src/lib/rag/retriever.ts` (parallelización)
- `src/lib/rag/query-enhancer.ts` (reducir llamadas Haiku)

**Cambios:**
1. Hacer LLM rerank condicional: solo si topScore < 0.60 (baja confianza)
2. Cachear embeddings de queries frecuentes (top 100)
3. Reducir Haiku calls: si query es simple (<30 chars, 1 artículo detectado), skip decomposition + HyDE
4. Paralelizar sibling retrieval con multi-namespace retrieval

**Pruebas:** Medir latencia antes/después

**Riesgos:** Medio — skip HyDE puede reducir recall

**DoD:** Avg Latency ≤ 3.8s sin degradar métricas de calidad

**Métrica target:** Avg Latency: 4,404ms → ≤ 3,800ms

---

### FASE 10: Eval Hardening + Regression Suite (3h)

**Objetivo:** Suite de regresión permanente con gates automáticos.

**Archivos:**
- `eval/run_eval.ts` (agregar gates)
- `eval/experiments/config-grid.ts` (organizar experiments)
- `eval/analysis/significance.ts` (nuevo)

**Cambios:**
1. Implementar "quality gates" en eval:
   ```typescript
   const GATES = {
     minPrecisionAt5: 0.25,
     minRecallAt5: 0.65,
     maxErrorRate: 0.35,
     minSourceTypeAcc: 0.70,
     maxAvgLatency: 4500,
   };
   ```
2. Agregar bootstrap confidence intervals (95% CI) para cada métrica
3. Comparador A/B: `npx tsx eval/compare.ts baseline experiment-name`
4. Output machine-readable para CI/CD

**Pruebas:** Correr baseline vs v3 → diffs con CI

**Riesgos:** Bajo

**DoD:** CI puede detectar regresiones automáticamente

**Métrica target:** Todas las métricas P0 cumplen gates

---

## PARTE B: ÁRBOL DE DECISIONES — QUÉ TOCAR PRIMERO

```
START
  │
  ├─ ¿Source Type Accuracy = 0%?
  │   SÍ → FASE 1 (fix eval pipeline) — 2h, riesgo bajo, desbloquea medición
  │         │
  │         └─ Re-correr eval baseline "verdadero"
  │              │
  │              ├─ ¿External Source % < 30%?
  │              │   SÍ → FASE 2 (namespace thresholds) — 4h
  │              │         + FASE 3 (query type routing) — 3h
  │              │
  │              ├─ ¿Error Rate > 0.50?
  │              │   SÍ → FASE 6 (fix error categorization) — 3h
  │              │
  │              ├─ ¿P@5 < 0.25?
  │              │   SÍ → FASE 4 (recalibrar reranker) — 4h
  │              │
  │              ├─ ¿Comparative R@5 < 0.50?
  │              │   SÍ → FASE 5 (multi-hop) — 6h
  │              │
  │              ├─ ¿Citation Accuracy < 0.80?
  │              │   SÍ → FASE 8 (citation) — 3h
  │              │
  │              └─ ¿Latency > 4.0s?
  │                  SÍ → FASE 9 (latency) — 4h
  │
  └─ FASE 10 (regression suite) — siempre al final
```

**Orden de ejecución recomendado:**
```
Sprint 1 (paralelo): F1 + F6       → fix medición (5h total)
Sprint 2 (paralelo): F2 + F3       → fix routing (7h total)
Sprint 3 (paralelo): F4 + F7       → fix ranking + source typing (8h total)
Sprint 4 (secuencial): F5          → multi-hop (6h)
Sprint 5 (paralelo): F8 + F9       → citation + latency (7h total)
Sprint 6: F10                      → regression (3h)
```

---

## PARTE C: EXPERIMENTS A/B (8 mínimo)

### Experiment 1: `eval-fix-multisource`
- **Variable:** Pasar `multiSourceChunks` a `assembleContext()` en eval
- **Métrica esperada:** Source Type Accuracy sube de 0% a 10-30%
- **Cómo medir:** `npx tsx eval/run_eval.ts --experiment eval-fix-multisource`
- **Criterio éxito:** Source Type Accuracy > 5%
- **Criterio fracaso:** No cambia → bug diferente al identificado
- **Rollback:** Revertir cambio en eval/run_eval.ts

### Experiment 2: `namespace-threshold-split`
- **Variable:** Threshold independiente por namespace (0.22 para doctrina/jurisprudencia vs 0.28 para ET)
- **Métrica esperada:** External Source % sube de 12.7% a 35-50%
- **Cómo medir:** `npx tsx eval/run_eval.ts --experiment namespace-threshold-split`
- **Criterio éxito:** External Source % > 30% sin degradar P@5
- **Criterio fracaso:** P@5 cae > 10% relativo
- **Rollback:** Restaurar threshold único

### Experiment 3: `reranker-boost-v2`
- **Variable:** `directArticleMention: 0.35`, `exactArticleNumber: 0.40`, `diversityPenalty: -0.15`
- **Métrica esperada:** P@5 sube de 0.15 a 0.25+
- **Cómo medir:** `npx tsx eval/run_eval.ts --experiment reranker-boost-v2`
- **Criterio éxito:** P@5 > 0.22 sin degradar R@5
- **Criterio fracaso:** R@5 cae > 5% absoluto
- **Rollback:** Restaurar boosts originales

### Experiment 4: `comparative-multihop`
- **Variable:** Round-robin article selection + cross-reference secondary retrieval
- **Métrica esperada:** Comparative R@5 sube de 0.338 a 0.55+
- **Cómo medir:** `npx tsx eval/run_eval.ts --experiment comparative-multihop --category comparative`
- **Criterio éxito:** Comparative R@5 > 0.50
- **Criterio fracaso:** Overall R@5 cae > 5%
- **Rollback:** Desactivar multi-hop flag

### Experiment 5: `error-recount`
- **Variable:** Separar cross-references de errores reales, contar solo expected_article_missing como error
- **Métrica esperada:** Error Rate baja de 0.99 a 0.15-0.30
- **Cómo medir:** `npx tsx eval/run_eval.ts --experiment error-recount`
- **Criterio éxito:** Error Rate < 0.35
- **Criterio fracaso:** No cambia significativamente → errores son reales
- **Rollback:** N/A (solo eval)

### Experiment 6: `query-routing-active`
- **Variable:** Conectar `classifyQueryType()` + `getQueryRoutingConfig()` al pipeline
- **Métrica esperada:** Doctrina R@5 sube de 0.45 a 0.65+
- **Cómo medir:** `npx tsx eval/run_eval.ts --experiment query-routing-active --category doctrina`
- **Criterio éxito:** Doctrina R@5 > 0.55
- **Criterio fracaso:** Otras categorías se degradan > 10%
- **Rollback:** Desactivar routing, volver a `prioritizeNamespaces()` solo

### Experiment 7: `citation-always-on`
- **Variable:** Inyectar CITATION_INSTRUCTIONS siempre, no solo cuando `hasExternalSources`
- **Métrica esperada:** Citation Accuracy sube de 0.60 a 0.75+
- **Cómo medir:** `npx tsx eval/run_eval.ts --experiment citation-always-on`
- **Criterio éxito:** Citation Accuracy > 0.70
- **Criterio fracaso:** No cambia → no es problema de prompt
- **Rollback:** Revertir condición

### Experiment 8: `llm-rerank-conditional`
- **Variable:** LLM rerank solo si topScore < 0.60
- **Métrica esperada:** Latencia baja ~500ms sin perder calidad
- **Cómo medir:** `npx tsx eval/run_eval.ts --experiment llm-rerank-conditional`
- **Criterio éxito:** Avg Latency < 4000ms con P@5 estable (±5%)
- **Criterio fracaso:** P@5 cae > 10%
- **Rollback:** Restaurar LLM rerank siempre

### Experiment 9: `topk-external-15`
- **Variable:** `multiNamespaceTopK: 15` (de 8)
- **Métrica esperada:** External Source % sube sin afectar latencia significativamente
- **Cómo medir:** `npx tsx eval/run_eval.ts --experiment topk-external-15`
- **Criterio éxito:** External Source % > 25%
- **Criterio fracaso:** Latencia sube > 500ms
- **Rollback:** Restaurar topK=8

### Experiment 10: `hyde-selective`
- **Variable:** Desactivar HyDE para queries < 40 chars O que contienen "Art." explícito
- **Métrica esperada:** P@5 sube (menos drift semántico) sin perder R@5
- **Cómo medir:** `npx tsx eval/run_eval.ts --experiment hyde-selective`
- **Criterio éxito:** P@5 sube > 5% relativo
- **Criterio fracaso:** R@5 cae > 5%
- **Rollback:** Reactivar HyDE global

---

## PARTE D: BACKLOG P0/P1/P2

### P0 — Crítico (bloquea medición o calidad)

| ID | Tarea | Archivo | Línea | Impacto |
|----|-------|---------|-------|---------|
| P0-1 | Pasar `multiSourceChunks` a `assembleContext()` en eval | `eval/run_eval.ts` | 116-119 | Source Type Acc = 0% → medible |
| P0-2 | Importar y llamar `heuristicRerankMultiSource()` en eval | `eval/run_eval.ts` | 113 | Multi-source chunks se reranquean |
| P0-3 | Fix `analyzeErrors()`: no contar cross-refs como HALLUCINATION | `eval/analysis/error-categorizer.ts` | 86-98 | Error Rate 0.99 → real |
| P0-4 | Separar threshold por namespace | `src/lib/rag/retriever.ts` | 124 | External Source % sube |
| P0-5 | Activar `classifyQueryType()` en pipeline | `src/lib/rag/retriever.ts` | nuevo | Query routing funcional |
| P0-6 | Activar `sameCommunity` boost | `src/lib/rag/reranker.ts` | BOOST obj | Boost definido pero no aplicado |
| P0-7 | Subir `directArticleMention` boost a 0.35 | `src/lib/rag/reranker.ts` | 22 | P@5 sube |
| P0-8 | Agregar `diversityPenalty` al reranker | `src/lib/rag/reranker.ts` | nuevo | Multi-article coverage |
| P0-9 | Forzar decomposition para queries comparativas | `src/lib/rag/query-enhancer.ts` | isComplexQuery | Comparative R@5 sube |
| P0-10 | CITATION_INSTRUCTIONS siempre inyectado | `src/lib/rag/prompt-builder.ts` | condicional | Citation Acc sube |

### P1 — Importante (mejora significativa)

| ID | Tarea | Archivo | Impacto |
|----|-------|---------|---------|
| P1-1 | Round-robin article selection post-merge | `src/lib/rag/retriever.ts` | Diversity en top-5 |
| P1-2 | Cross-reference secondary retrieval | `src/lib/rag/retriever.ts` | Multi-hop |
| P1-3 | Subir `multiNamespaceTopK` de 8 a 15 | `src/config/constants.ts` | Más docs externos |
| P1-4 | LLM rerank condicional (solo si topScore < 0.60) | `src/lib/rag/pipeline.ts` | -500ms latencia |
| P1-5 | Citation fence en context header | `src/lib/rag/prompt-builder.ts` | Prevenir citas falsas |
| P1-6 | `getQueryRoutingConfig()` conectado al pipeline | `src/lib/rag/retriever.ts` | TopK/threshold por tipo |
| P1-7 | BM25-like lexical scoring en reranker | `src/lib/rag/reranker.ts` | Señal léxica para precisión |
| P1-8 | Skip HyDE para queries con artículo explícito | `src/lib/rag/query-enhancer.ts` | Menos drift |

### P2 — Mejora (nice-to-have)

| ID | Tarea | Archivo | Impacto |
|----|-------|---------|---------|
| P2-1 | Bootstrap CI para métricas | `eval/analysis/significance.ts` | Significancia estadística |
| P2-2 | Comparador A/B en eval | `eval/compare.ts` | Automatizar comparaciones |
| P2-3 | Cache de embeddings para queries top-100 | `src/lib/rag/retriever.ts` | -200ms para queries frecuentes |
| P2-4 | `filterRelevantCalculators()` activar | `src/lib/rag/prompt-builder.ts` | Calculadoras en contexto |
| P2-5 | Paralelizar sibling + multi-namespace retrieval | `src/lib/rag/context-assembler.ts` | -100ms |
| P2-6 | `externalSourceBudgetRatio` dinámico por query type | `src/lib/rag/context-assembler.ts` | Más espacio para doctrina |

---

## PARTE E: RETRIEVAL MULTI-ETAPA PARA QUERIES COMPARATIVAS

### Diseño del Pipeline Comparativo

```
[1] DETECT
    classifyQueryType(query) → "comparative"
    │
[2] DECOMPOSE (forzado para comparativas)
    decomposeQuery(query) → ["sub_A", "sub_B", "sub_C?"]
    │
[3] RETRIEVE (stage 1 — parallel)
    ├── embed(original)     → topK=15 namespace=""
    ├── embed(sub_A)        → topK=15 namespace=""
    ├── embed(sub_B)        → topK=15 namespace=""
    └── embed(sub_C?)       → topK=10 namespace=""
    │
[4] MERGE + ARTICLE-LEVEL GROUPING
    ├── Group chunks by id_articulo
    ├── Per article: keep best chunk, compute article_score = max(chunk_scores)
    └── Sort articles by article_score
    │
[5] DIVERSITY RERANK
    ├── Round-robin: alternate articles in final list
    │   [Art_A, Art_B, Art_A, Art_B, Art_C, ...]
    ├── Ensure min 2 different articles in top-5
    └── Apply diversity penalty: -0.15 per repeat
    │
[6] SECONDARY RETRIEVAL (multi-hop)
    ├── Get top-3 article IDs
    ├── Load cross_references for each
    ├── Filter: keep refs that appear in ≥2 top articles
    ├── Retrieve chunks for cross-refs (topK=5 per ref)
    └── Merge with stage-1 results
    │
[7] FINAL RERANK
    ├── Heuristic rerank (boosted)
    ├── Coverage check: ≥2 articles represented?
    │   NO → boost highest-scored underrepresented article +0.30
    └── Cap at maxRerankedResults (12 for comparative)
    │
[8] ASSEMBLE CONTEXT
    ├── Token budget: 12,000 (articles) + 3,600 (external)
    ├── Bin-pack by article groups
    └── Include siblings for top-2 articles only
```

### Implementación en código

```typescript
// retriever.ts — nuevo bloque para comparativas
async function retrieveComparative(
  query: EnhancedQuery,
  embeddings: number[][],
  config: QueryRoutingConfig
): Promise<{ chunks: ScoredChunk[]; coveredArticles: string[] }> {
  // Stage 1: parallel retrieval con sub-queries
  const subQueries = query.subQueries || [query.original];
  const results = await Promise.all(
    subQueries.map((sq, i) =>
      queryPinecone(embeddings[i] || embeddings[0], config.topK)
    )
  );

  // Stage 2: article-level grouping
  const articleMap = new Map<string, { chunks: ScoredChunk[]; maxScore: number }>();
  for (const result of results.flat()) {
    const artId = result.metadata.id_articulo;
    const existing = articleMap.get(artId);
    if (!existing) {
      articleMap.set(artId, { chunks: [result], maxScore: result.score });
    } else {
      existing.chunks.push(result);
      existing.maxScore = Math.max(existing.maxScore, result.score);
    }
  }

  // Stage 3: round-robin selection
  const sortedArticles = [...articleMap.entries()]
    .sort((a, b) => b[1].maxScore - a[1].maxScore);

  const selected: ScoredChunk[] = [];
  const articleCount = Math.min(sortedArticles.length, 5);
  for (let round = 0; selected.length < config.topK; round++) {
    for (let i = 0; i < articleCount && selected.length < config.topK; i++) {
      const [, data] = sortedArticles[i];
      if (data.chunks[round]) {
        selected.push(data.chunks[round]);
      }
    }
    if (round > 3) break; // safety
  }

  // Stage 4: secondary retrieval via cross-references
  const topArticleIds = sortedArticles.slice(0, 3).map(([id]) => id);
  // ... fetch cross_references, retrieve additional chunks

  return { chunks: selected, coveredArticles: topArticleIds };
}
```

---

## PARTE F: REDISEÑO DE SOURCE TYPING

### F.1 Cómo se guarda metadata en Pinecone

**Namespace "" (Artículos ET):**
```json
{
  "id": "art-240-chunk-0",
  "metadata": {
    "id_articulo": "Art. 240",
    "titulo": "Tarifa general para personas jurídicas",
    "chunk_type": "contenido",
    "doc_type": "articulo",      // ← CAMPO CLAVE (ya existe en tipo pero verificar en Pinecone)
    "estado": "vigente",
    "text": "..."
  }
}
```

**Namespace "doctrina":**
```json
{
  "id": "doctrina-12345-chunk-0",
  "metadata": {
    "doc_id": "doctrina-12345",
    "doc_type": "doctrina",       // ← Poblado por metadata-enricher.ts
    "numero": "012345",
    "fecha": "2024-03-15",
    "tema": "Deducibilidad de gastos RSE",
    "vigente": true,
    "articulos_et": ["Art. 107"],
    "text": "..."
  }
}
```

### F.2 Cómo se transforma a sources en /api/chat

**Pipeline flow:**
```
Pinecone → ScoredMultiSourceChunk { ..., namespace: "doctrina" }
    ↓
heuristicRerankMultiSource() → RerankedMultiSourceChunk
    ↓
assembleContext() → context.externalSources: ExternalSourceGroup[]
    ↓  cada grupo tiene:
    ↓  { namespace: "doctrina", docId: "...", chunks: [...] }
    ↓
buildMessages() → XML context:
    <fuentes_externas>
      <doctrina doc_id="..." numero="012345">...</doctrina>
    </fuentes_externas>
```

### F.3 Cómo eval lo compara

```typescript
// eval/run_eval.ts — verificación consistente
const retrievedNamespaces = new Set(
  (multiSourceChunks || []).map(c => c.namespace)
);
// Compara con:
// question.expected_external_sources = ["doctrina", "jurisprudencia"]

// Para sourceTypeAccuracy:
const contextExternalTypes = new Set(
  (context.externalSources || []).map(s => s.namespace)
);
const found = expected.filter(ns => contextExternalTypes.has(ns));
sourceTypeAccuracy = found.length / expected.length;
```

### F.4 Mapeo completo (100% consistente)

| Capa | Campo | Valores | Fuente |
|------|-------|---------|--------|
| Pinecone metadata | `doc_type` | `"articulo"`, `"doctrina"`, `"sentencia"`, `"decreto"`, `"resolucion"`, `"ley"` | `metadata-enricher.ts` |
| Pinecone namespace | namespace name | `""`, `"doctrina"`, `"jurisprudencia"`, `"decretos"`, `"resoluciones"`, `"leyes"` | `upsert-pinecone.ts` |
| Retriever output | `ScoredMultiSourceChunk.namespace` | `"doctrina"`, `"jurisprudencia"`, `"decretos"`, `"resoluciones"`, `"leyes"` | `retriever.ts:161` |
| Context assembly | `ExternalSourceGroup.namespace` | Same as above | `context-assembler.ts` |
| Eval dataset | `expected_external_sources[]` | `["doctrina"]`, `["jurisprudencia"]`, `["doctrina","jurisprudencia"]` | `eval/dataset.json` |

**Inconsistencia detectada:** `doc_type: "sentencia"` vs `namespace: "jurisprudencia"` — nombres diferentes. El eval compara por `namespace`, así que funciona, pero para mapping inverso (namespace → doc_type) se necesita tabla:

```typescript
const NAMESPACE_TO_DOC_TYPE: Record<string, string> = {
  "": "articulo",
  doctrina: "doctrina",
  jurisprudencia: "sentencia",  // ← mismatch en nombre
  decretos: "decreto",
  resoluciones: "resolucion",
  leyes: "ley",
};
```

---

## PARTE G: PROMPTS PARA 6 AGENTES CODEX

---

### AGENTE 1: Router/Retrieval Engineer

**OBJETIVO MEDIBLE:**
Subir External Source % de 12.7% a ≥50% y Doctrina R@5 de 0.45 a ≥0.65 sin degradar ET retrieval.

**ARCHIVOS QUE PUEDE TOCAR:**
- `src/lib/rag/retriever.ts`
- `src/lib/rag/namespace-router.ts`
- `src/config/constants.ts`
- `eval/experiments/config-grid.ts` (agregar experiments)

**ARCHIVOS PROHIBIDOS:**
- `src/app/api/chat/route.ts`
- `src/lib/rag/pipeline.ts` (tocar mínimamente para pasar queryType)
- `eval/run_eval.ts` (asignado a Agente 5)
- `src/lib/rag/reranker.ts` (asignado a Agente 2)

**CAMBIOS ESPERADOS:**
1. En `retriever.ts` línea 124: reemplazar `dynamicThreshold` por threshold específico del namespace:
   ```typescript
   const nsThreshold = RAG_CONFIG.namespaceThresholds?.[ns] ?? dynamicThreshold;
   ```
2. En `constants.ts`: agregar `namespaceThresholds` al `RAG_CONFIG`:
   ```typescript
   namespaceThresholds: {
     "": 0.28,  // default, will be adjusted dynamically
     doctrina: 0.22,
     jurisprudencia: 0.22,
     decretos: 0.25,
     resoluciones: 0.25,
     leyes: 0.25,
   }
   ```
3. En `constants.ts`: cambiar `multiNamespaceTopK: 8` → `multiNamespaceTopK: 15`
4. En `retriever.ts`: importar `classifyQueryType` y `getQueryRoutingConfig`, usarlos en `retrieve()`:
   ```typescript
   const queryType = classifyQueryType(query.original);
   const routingConfig = getQueryRoutingConfig(queryType);
   // Use routingConfig.topK instead of RAG_CONFIG.topK
   // Use routingConfig.priorityNamespaces for namespace ordering
   ```
5. En `namespace-router.ts`: verificar que `getQueryRoutingConfig` devuelve configs correctos para cada tipo. Ajustar si es necesario.
6. Agregar 3 experiment configs a `config-grid.ts`:
   - `namespace-threshold-split`: thresholds independientes
   - `query-routing-active`: routing por tipo
   - `topk-external-15`: multiNamespaceTopK=15

**TESTS/EVAL:**
```bash
npx tsc --noEmit
npx tsx eval/run_eval.ts --experiment namespace-threshold-split
npx tsx eval/run_eval.ts --experiment query-routing-active
npx tsx eval/run_eval.ts --experiment topk-external-15
```

**COMANDOS PARA REPRODUCIR:**
```bash
# Baseline comparison
npx tsx eval/run_eval.ts --experiment baseline
# After changes
npx tsx eval/run_eval.ts --experiment namespace-threshold-split
# Category-specific
npx tsx eval/run_eval.ts --experiment query-routing-active --category doctrina
```

**CRITERIO DE ÉXITO:**
- External Source % ≥ 40% (queries con expected_external_sources)
- Doctrina R@5 ≥ 0.55
- Overall R@5 no cae > 3% absoluto
- `npx tsc --noEmit` sin errores

**SALIDA:**
- Diff de archivos modificados
- Resultados de eval de los 3 experiments vs baseline
- Tabla comparativa: métrica | baseline | experiment | delta

---

### AGENTE 2: Rerank & Precision Engineer

**OBJETIVO MEDIBLE:**
Subir P@5 de 0.151 a ≥0.300 sin degradar R@5 más de 3%.

**ARCHIVOS QUE PUEDE TOCAR:**
- `src/lib/rag/reranker.ts`
- `src/config/constants.ts` (MULTI_SOURCE_BOOST, BOOST constants)
- `eval/experiments/config-grid.ts` (agregar experiments)

**ARCHIVOS PROHIBIDOS:**
- `src/lib/rag/retriever.ts` (asignado a Agente 1)
- `eval/run_eval.ts` (asignado a Agente 5)
- `src/lib/rag/query-enhancer.ts` (asignado a Agente 4)
- `src/app/api/chat/route.ts`

**CAMBIOS ESPERADOS:**
1. En `reranker.ts` BOOST constants (líneas 18-30):
   ```typescript
   const BOOST = {
     chunkContenido: 0.15,              // era 0.12
     chunkModificaciones: 0.08,         // sin cambio
     chunkTextoAnterior: 0.03,          // sin cambio
     directArticleMention: 0.35,        // era 0.20 — subir significativamente
     exactArticleNumber: 0.40,          // NUEVO: query tiene "Art. 240" y chunk es Art. 240
     titleMatchPerWord: 0.05,           // era 0.04
     titleMatchMax: 0.20,               // era 0.12
     derogatedPenalty: -0.10,           // sin cambio
     derogatedHistoryBoost: 0.15,       // sin cambio
     vigenteBoost: 0.06,               // sin cambio
     leyMatchBoost: 0.15,              // era 0.12
     complexityBoost: 0.03,            // sin cambio
     diversityPenalty: -0.15,           // NUEVO: per-article repeat penalty
   };
   ```
2. Implementar `exactArticleNumber` boost: extraer "Art. NNN" de query, comparar con chunk's `id_articulo`
3. Implementar `diversityPenalty`: trackear artículos ya seleccionados en top-N, penalizar repetidos
4. Activar `sameCommunity` boost (definido en MULTI_SOURCE_BOOST pero nunca aplicado):
   - En `heuristicRerank()`: si chunk tiene `community_id` y algún artículo detectado en query tiene el mismo `community_id`, aplicar +0.08
5. Agregar BM25-like lexical score:
   ```typescript
   function lexicalOverlap(query: string, chunkText: string): number {
     const queryTerms = tokenize(query);
     const chunkTerms = new Set(tokenize(chunkText));
     const overlap = queryTerms.filter(t => chunkTerms.has(t)).length;
     return Math.min(overlap / queryTerms.length, 0.15); // cap at 0.15
   }
   ```
6. Agregar experiment configs a config-grid.ts:
   - `reranker-boost-v2`: nuevos boosts
   - `reranker-diversity`: con diversityPenalty

**TESTS/EVAL:**
```bash
npx tsc --noEmit
npx tsx eval/run_eval.ts --experiment reranker-boost-v2
npx tsx eval/run_eval.ts --experiment reranker-diversity
```

**COMANDOS PARA REPRODUCIR:**
```bash
npx tsx eval/run_eval.ts --experiment baseline
npx tsx eval/run_eval.ts --experiment reranker-boost-v2
# Compare
diff <(jq '.avgPrecisionAt5,.avgRecallAt5' eval/baseline-results.json) \
     <(jq '.avgPrecisionAt5,.avgRecallAt5' eval/results/reranker-boost-v2_*.json)
```

**CRITERIO DE ÉXITO:**
- P@5 ≥ 0.25 (mínimo 65% mejora relativa)
- R@5 se mantiene ≥ 0.555 (max -3% absoluto)
- MRR sube (mejor ranking del primer hit relevante)
- `npx tsc --noEmit` sin errores

**SALIDA:**
- Diff de `reranker.ts` y `constants.ts`
- Tabla: P@5 | R@5 | MRR antes y después
- 3 ejemplos de queries donde el reranking mejoró visiblemente

---

### AGENTE 3: Chunking/Metadata Engineer

**OBJETIVO MEDIBLE:**
Reducir `fact_not_in_context` reales ≥30% y mejorar Contains Expected de 0.826 a ≥0.900.

**ARCHIVOS QUE PUEDE TOCAR:**
- `scripts/chunking/legal-chunker.ts`
- `scripts/chunking/metadata-enricher.ts`
- `src/types/pinecone.ts` (agregar campos)
- `src/lib/rag/context-assembler.ts` (mejorar sibling retrieval y token budget)

**ARCHIVOS PROHIBIDOS:**
- `src/lib/rag/retriever.ts` (Agente 1)
- `src/lib/rag/reranker.ts` (Agente 2)
- `eval/run_eval.ts` (Agente 5)
- `src/app/api/chat/route.ts`
- Scripts de scraping (`scripts/scraping/`)

**CAMBIOS ESPERADOS:**
1. En `legal-chunker.ts`: aumentar overlap de 75 tokens a 150 tokens (263 chars → 525 chars)
2. En `legal-chunker.ts`: cada chunk debe incluir un "contextual prefix" embebido en el text:
   ```
   [Art. 240 ET — Tarifa general para personas jurídicas — Libro I Renta — Vigente]
   <texto del chunk>
   ```
   Esto mejora embedding quality porque el modelo sabe de qué se trata.
3. En `metadata-enricher.ts`: agregar campos:
   - `concordancias`: string (ya existe en artículo JSON pero no en chunk metadata)
   - `key_terms`: string[] (top 5 keywords del chunk, para lexical matching)
4. En `pinecone.ts` ChunkMetadata: agregar `concordancias?: string` y `key_terms?: string[]`
5. En `context-assembler.ts`:
   - Aumentar `MAX_SIBLINGS_PER_ARTICLE` de 4 a 6
   - Mejorar sibling score: `artScore * 0.95` en vez de `artScore * 0.9`
   - Agregar `externalSourceBudgetRatio` dinámico:
     ```typescript
     // Si queryType es "doctrinal", dar 40% a externos
     // Si queryType es "comparative", dar 20%
     // Default: 30%
     ```

**TESTS/EVAL:**
```bash
npx tsc --noEmit
# Regenerar chunks para 5 artículos de prueba:
npx tsx scripts/chunking/test-chunker.ts --articles "Art. 240,Art. 241,Art. 468,Art. 383,Art. 392"
# Verificar prefix en chunks generados
# Re-embeber artículos de prueba (optional, costoso)
```

**COMANDOS PARA REPRODUCIR:**
```bash
npx tsc --noEmit
npx tsx eval/run_eval.ts --experiment baseline
# Comparar containsExpected antes/después
```

**CRITERIO DE ÉXITO:**
- Contains Expected ≥ 0.880
- Chunks generados incluyen contextual prefix
- `concordancias` y `key_terms` presentes en metadata
- `npx tsc --noEmit` sin errores

**SALIDA:**
- Diff de archivos modificados
- 3 ejemplos de chunks antes vs después (mostrando prefix)
- Impacto estimado en métricas (basado en análisis, no eval completo)

**NOTA IMPORTANTE:** Los cambios en chunking NO afectan los datos ya embebidos en Pinecone. Para que surtan efecto en producción, se necesitaría re-embeber (ejecutar `upsert-pinecone.ts` de nuevo). Este agente debe diseñar los cambios, implementarlos en código, y documentar el plan de re-embedding. Los tests deben verificar que el código genera chunks correctos localmente.

---

### AGENTE 4: Comparative Multi-hop Engineer

**OBJETIVO MEDIBLE:**
Subir Comparative R@5 de 0.338 a ≥0.600.

**ARCHIVOS QUE PUEDE TOCAR:**
- `src/lib/rag/retriever.ts` (SOLO sección multi-hop, coordinado con Agente 1)
- `src/lib/rag/query-enhancer.ts` (forzar decomposition comparativa)
- `src/lib/rag/graph-retriever.ts` (cross-reference expansion)
- `eval/experiments/config-grid.ts`

**ARCHIVOS PROHIBIDOS:**
- `src/lib/rag/reranker.ts` (Agente 2)
- `eval/run_eval.ts` (Agente 5)
- `src/app/api/chat/route.ts`
- `src/lib/rag/pipeline.ts` (coordinado con supervisor)

**CAMBIOS ESPERADOS:**
1. En `query-enhancer.ts` función `isComplexQuery()`: agregar detección forzada para comparativas:
   ```typescript
   // Forzar decomposition si es comparativa, sin importar longitud
   const isComparative = /diferencia|compar|versus|vs\b|distinción|mientras que|en cambio/i.test(query);
   if (isComparative) return true;
   ```
2. En `retriever.ts`: implementar `retrieveComparative()`:
   - Detección: `if (classifyQueryType(query.original) === "comparative")`
   - TopK: 30 (no 20)
   - Article-level grouping post-merge
   - Round-robin article selection (ver diseño PARTE E)
3. En `retriever.ts`: implementar secondary retrieval:
   ```typescript
   async function secondaryRetrievalByCrossRefs(
     topArticleIds: string[],
     embedding: number[],
     threshold: number
   ): Promise<ScoredChunk[]> {
     // Load cross_references from article JSONs
     // Retrieve chunks for cross-referenced articles
     // Return merged results
   }
   ```
4. En `graph-retriever.ts`: agregar función `getRelatedArticlesForComparison(articleIds: string[])`:
   - Buscar artículos que están en el mismo "libro" del ET
   - Buscar artículos con topics similares (e.g., ambos sobre "tarifas")
5. Agregar experiment configs: `comparative-multihop`, `comparative-topk30`

**TESTS/EVAL:**
```bash
npx tsc --noEmit
npx tsx eval/run_eval.ts --experiment comparative-multihop --category comparative
npx tsx eval/run_eval.ts --experiment comparative-topk30 --category comparative
```

**COMANDOS PARA REPRODUCIR:**
```bash
# Baseline para comparativas
npx tsx eval/run_eval.ts --experiment baseline --category comparative
# Después de cambios
npx tsx eval/run_eval.ts --experiment comparative-multihop --category comparative
```

**CRITERIO DE ÉXITO:**
- Comparative R@5 ≥ 0.55
- Overall R@5 no cae > 3%
- Latencia adicional ≤ 300ms (por secondary retrieval)
- `npx tsc --noEmit` sin errores

**SALIDA:**
- Diff de archivos modificados
- Tabla: Comparative R@5 | P@5 | MRR antes y después
- 5 ejemplos de queries comparativas con resultados mejorados
- Análisis de latencia del multi-hop

---

### AGENTE 5: Eval/Scoring Engineer

**OBJETIVO MEDIBLE:**
Error Rate de 0.990 a ≤0.300, Source Type Accuracy de 0.000 a ≥0.800 (cuando aplica).

**ARCHIVOS QUE PUEDE TOCAR:**
- `eval/run_eval.ts`
- `eval/analysis/error-categorizer.ts`
- `eval/metrics/retrieval.ts`
- `eval/metrics/answer-quality.ts`
- `eval/experiments/config-grid.ts`
- `eval/analysis/significance.ts` (NUEVO)

**ARCHIVOS PROHIBIDOS:**
- `src/lib/rag/*.ts` (todos — solo eval)
- `src/app/` (todo)
- `scripts/` (todo)

**CAMBIOS ESPERADOS:**
1. En `run_eval.ts` líneas 112-119: HOTFIX CRÍTICO
   ```typescript
   // 4. Rerank
   const reranked = heuristicRerank(chunks, enhanced, mergedConfig.maxRerankedResults);

   // 4b. Rerank multi-source chunks (NUEVO)
   const rerankedMultiSource = multiSourceChunks
     ? heuristicRerankMultiSource(multiSourceChunks, enhanced)
     : [];

   // 5. Assemble context (FIX: pasar multiSourceChunks)
   const context = await assembleContext(reranked, {
     useSiblingRetrieval: mergedConfig.useSiblingRetrieval,
     maxTokens: mergedConfig.maxContextTokens,
     multiSourceChunks: rerankedMultiSource,  // ← AGREGAR
   });
   ```
2. En `error-categorizer.ts` líneas 86-98: redefinir categorías de error:
   ```typescript
   // ANTES: cualquier "Art. NNN" en contextString que no esté en retrievedArticles = HALLUCINATION
   // DESPUÉS: solo contar expected_articles que NO están en context como error

   // NUEVO: Reemplazar bloque regex
   for (const expected of expectedArticles) {
     if (!contextArticles.has(expected)) {
       errors.push({
         category: ErrorCategory.MISSING_ARTICLE,  // no HALLUCINATION
         detail: `Expected ${expected} not in assembled context`,
         severity: "high",
       });
     }
   }
   // ELIMINAR: el regex scan que cuenta cross-references como hallucination
   ```
3. Agregar `import { heuristicRerankMultiSource } from "../src/lib/rag/reranker"` al runner
4. Agregar nuevas métricas:
   ```typescript
   expectedArticleCoverage: number;  // % expected_articles in context.sources
   contextDiversity: number;         // unique articles / total chunks in top-5
   ```
5. Crear `eval/analysis/significance.ts`:
   ```typescript
   export function bootstrapCI(values: number[], alpha: number = 0.05, n: number = 1000): [number, number]
   ```
6. Agregar experiment: `eval-fix-multisource`, `error-recount`

**TESTS/EVAL:**
```bash
npx tsc --noEmit
# Correr con fix
npx tsx eval/run_eval.ts --experiment eval-fix-multisource
# Verificar que Error Rate bajó
npx tsx eval/run_eval.ts --experiment error-recount
```

**COMANDOS PARA REPRODUCIR:**
```bash
# Antes del fix
npx tsx eval/run_eval.ts --experiment baseline
# Después del fix
npx tsx eval/run_eval.ts --experiment eval-fix-multisource
# Comparar
jq '.errorAnalysis' eval/baseline-results.json
jq '.errorAnalysis' eval/results/eval-fix-multisource_*.json
```

**CRITERIO DE ÉXITO:**
- Error Rate ≤ 0.30
- Source Type Accuracy > 0% (refleja realidad)
- fact_not_in_context se reduce ≥ 90% (la mayoría eran cross-refs mal contados)
- Nuevas métricas `expectedArticleCoverage` y `contextDiversity` aparecen en output
- `npx tsc --noEmit` sin errores

**SALIDA:**
- Diff de `eval/run_eval.ts`, `error-categorizer.ts`
- Tabla: Error Rate | Source Type Acc | fact_not_in_context antes vs después
- Nuevo baseline "verdadero" con métricas corregidas
- Archivo `eval/analysis/significance.ts` con bootstrap CI

---

### AGENTE 6: Performance/Cost Engineer

**OBJETIVO MEDIBLE:**
Avg Latency de 4,404ms a ≤3,800ms. P95 de 5,608ms a ≤5,000ms. Sin degradar calidad.

**ARCHIVOS QUE PUEDE TOCAR:**
- `src/lib/rag/pipeline.ts` (condicionar LLM rerank)
- `src/lib/rag/query-enhancer.ts` (skip HyDE para queries simples)
- `src/lib/rag/context-assembler.ts` (paralelizar sibling + external)
- `src/lib/rag/retriever.ts` (embedding cache — SOLO cache, no routing)
- `eval/experiments/config-grid.ts`

**ARCHIVOS PROHIBIDOS:**
- `src/lib/rag/reranker.ts` (Agente 2 — excepto toggle condicional en pipeline.ts)
- `eval/run_eval.ts` (Agente 5)
- `eval/analysis/` (Agente 5)
- `src/app/api/chat/route.ts`

**CAMBIOS ESPERADOS:**
1. En `pipeline.ts` línea 89: LLM rerank condicional:
   ```typescript
   const topScore = retrievalResult.chunks[0]?.score ?? 0;
   if ((options.useLLMRerank ?? RAG_CONFIG.useLLMRerank) && topScore < 0.60) {
     reranked = await llmRerank(reranked, query);
   }
   ```
2. En `query-enhancer.ts`: skip HyDE para queries cortas con artículo explícito:
   ```typescript
   // Si query < 40 chars Y contiene "Art." → no generar HyDE
   const hasExplicitArticle = /Art(?:ículo|\.)\s*\d+/i.test(query);
   if (query.length < 40 && hasExplicitArticle) return null;
   ```
3. En `context-assembler.ts`: paralelizar sibling retrieval con external source grouping:
   ```typescript
   const [siblings, externalGroups] = await Promise.all([
     fetchSiblingChunks(chunks),
     groupExternalSources(multiSourceChunks),
   ]);
   ```
4. En `retriever.ts`: cache de embeddings (in-memory LRU, 100 entries):
   ```typescript
   const embeddingCache = new Map<string, { embedding: number[]; ts: number }>();
   const CACHE_MAX = 100;
   const CACHE_TTL = 300_000; // 5 min
   ```
5. Agregar experiments: `llm-rerank-conditional`, `hyde-selective`

**TESTS/EVAL:**
```bash
npx tsc --noEmit
npx tsx eval/run_eval.ts --experiment llm-rerank-conditional
npx tsx eval/run_eval.ts --experiment hyde-selective
# Compare latency
jq '.avgLatencyMs,.p95LatencyMs' eval/baseline-results.json
jq '.avgLatencyMs,.p95LatencyMs' eval/results/llm-rerank-conditional_*.json
```

**COMANDOS PARA REPRODUCIR:**
```bash
npx tsx eval/run_eval.ts --experiment baseline
npx tsx eval/run_eval.ts --experiment llm-rerank-conditional
npx tsx eval/run_eval.ts --experiment hyde-selective
```

**CRITERIO DE ÉXITO:**
- Avg Latency ≤ 3,800ms
- P95 Latency ≤ 5,000ms
- P@5 no cae > 5% relativo
- R@5 no cae > 3% absoluto
- `npx tsc --noEmit` sin errores

**SALIDA:**
- Diff de archivos modificados
- Tabla: Latency | P95 | P@5 | R@5 antes vs después
- Análisis de qué optimización contribuye más a la mejora
- Estimación de ahorro en API calls (Haiku) por mes

---

## MERGE ORDER Y COORDINACIÓN

```
Sprint 1: Ag5 (eval fix) → merge primero, re-correr baseline "verdadero"
Sprint 2: Ag1 (routing) + Ag2 (reranker) → merge en paralelo, eval conjunto
Sprint 3: Ag4 (multi-hop) → merge, eval comparativas
Sprint 4: Ag3 (chunking) → merge, evaluar (requiere re-embedding para efecto completo)
Sprint 5: Ag6 (latency) → merge, eval latencia
Sprint 6: Re-correr eval completo con TODOS los cambios → verificar North Stars
```

**Gate entre sprints:**
- Antes de Sprint 2: Error Rate ≤ 0.50, Source Type Acc > 0%
- Antes de Sprint 3: P@5 ≥ 0.22, External Source % ≥ 30%
- Antes de Sprint 4: Comparative R@5 ≥ 0.50
- Antes de Sprint 5: P@5 ≥ 0.28, R@5 ≥ 0.65
- FINAL: Todas las métricas P0 cumplidas

---

## NORTH STAR TRACKING TABLE

| Métrica | Baseline | F1 Fix | Sprint 2 | Sprint 3 | Sprint 4 | Sprint 5 | Target |
|---------|----------|--------|----------|----------|----------|----------|--------|
| P@5 | 0.151 | ~0.151 | ≥0.25 | ≥0.28 | ~0.28 | ≥0.30 | ≥0.300 |
| R@5 | 0.575 | ~0.575 | ≥0.60 | ≥0.65 | ≥0.68 | ≥0.70 | ≥0.700 |
| Citation Acc | 0.600 | ~0.60 | ~0.65 | ~0.70 | ~0.80 | ≥0.85 | ≥0.850 |
| Ext Source % | 0.127 | ≥0.15 | ≥0.40 | ≥0.45 | ≥0.45 | ≥0.50 | ≥0.500 |
| Src Type Acc | 0.000 | ≥0.10 | ≥0.60 | ≥0.70 | ≥0.75 | ≥0.80 | ≥0.800 |
| Error Rate | 0.990 | ≤0.30 | ≤0.30 | ≤0.25 | ≤0.20 | ≤0.20 | ≤0.300 |
| Comp R@5 | 0.338 | ~0.34 | ~0.40 | ≥0.55 | ≥0.60 | ≥0.60 | ≥0.600 |
| Avg Latency | 4404 | ~4400 | ~4200 | ~4000 | ~3900 | ≤3800 | ≤3800 |

---

## DEFINICIÓN DE DONE (v3 COMPLETO)

- [ ] Todas las métricas P0 cumplidas (tabla arriba)
- [ ] `npx tsc --noEmit` sin errores
- [ ] `npm run build` exitoso
- [ ] Producción (`/api/chat`) funciona correctamente con test manual
- [ ] Eval results guardados en `eval/results/v3-final_*.json`
- [ ] No hay regresiones > 5% en ninguna categoría individual
- [ ] Bootstrap CI confirma significancia estadística vs baseline
- [ ] Documentación actualizada en CLAUDE.md

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Re-embedding requerido (chunking changes) | Alta | Alto | F3 diseña cambios; re-embedding se ejecuta después de validar |
| Multi-hop agrega latencia > target | Media | Medio | Cap secondary retrieval a 200ms, cache cross-refs |
| Boosts agresivos empeorar recall | Media | Alto | A/B test con gates; rollback inmediato si R@5 cae > 5% |
| Threshold bajo trae ruido excesivo | Media | Medio | Combinado con reranker mejorado; monitorear P@5 |
| Query classification errónea | Baja | Medio | Fallback a routing default si clasificación tiene baja confianza |
| Conflictos de merge entre agentes | Media | Bajo | Merge order definido; archivos prohibidos por agente |
