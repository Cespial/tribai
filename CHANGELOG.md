# Changelog

Todas las mejoras notables del sistema RAG se documentan en este archivo.

---

## [v3.1] — 2026-02-24 — RAG Perfection Sprint "Dictamen Auditado"

Sprint de 10 fases para perfeccionar el pipeline RAG: retrieval quality, citation accuracy, observability, y performance.

### Fase 0 — Baseline & Triage
- Evaluacion inicial: 300 queries, 12 metricas base
- Identificacion de top-10 fallos: article_not_retrieved (160), article_ranked_too_low (76), context_truncated (39)
- Baseline: P@5=0.20, Recall@5=0.56, MRR=0.38

### Fase 1 — Query Routing & Cross-Namespace Normalization
- Activado `classifyQueryType` + `getQueryRoutingConfig` en el pipeline (era dead code)
- topK y maxRerankedResults dinamicos por tipo de query (factual, comparative, procedural, temporal, doctrina, sanctions)
- Cross-namespace score normalization (min-max scaling) para comparar scores entre namespaces
- `sameCommunity` boost (+0.08) usando datos del knowledge graph
- **Commit:** `0c5502d`

### Fase 2 — Chunking Legal de Alta Fidelidad
- Legal chunker preserva paragrafos completos (no corta a mitad de incisos/numerales)
- Cross-references extraidas como metadata en cada chunk
- Metadata de vigencia: `vigencia_desde`, `vigente`, `estado`
- Chunk size target: 512 tokens con boundaries legales respetados
- **Commit:** `ccbf354`

### Fase 3 — Formato Dictamen Adaptativo
- System prompt con formato dictamen: Resumen, Hechos, Normas, Analisis, Riesgos, Recomendacion, Fuentes
- Evidence quality signals inyectados en el contexto XML
- Dynamic calculator injection: sugiere calculadoras relevantes por keyword
- CITATION_INSTRUCTIONS siempre activas (no condicionadas a hasExternalSources)
- **Commit:** `d3be545`

### Fase 4 — Suite de Evaluacion Compleja
- Dataset expandido: 300 → 340 queries (40 casos complejos nuevos)
- 17 metricas automatizadas (antes 12): +abstention_quality, +completeness, +ext_src_retrieved, +ext_src_in_context, +complex_P@5
- Error categorization: article_not_retrieved, article_ranked_too_low, context_truncated
- Breakdown por difficulty (easy/medium/hard) y por categoria (36 categorias)
- **Commit:** `ab350bb`

### Fase 5 — Multi-Hop Retrieval & Namespace Diversity
- Multi-hop retrieval (2 rondas): primera ronda recupera articulos ET, segunda busca fuentes externas que citen esos articulos
- Filter metadata: `{ articulos_slugs: { $in: retrievedArticleSlugs } }`
- `extractArticleSlugs()` extrae slugs de chunks recuperados
- Multi-hop reranking boost: +0.12 base, +0.03 per overlapping article (cap 0.21)
- Namespace diversity round-robin en `applyExternalTokenBudget`: Phase 1 toma best de cada namespace, Phase 2 greedy fill
- **Metricas:** Ext Src Retrieved 0.947 → 0.993, Ext Src in Context 0.908 → 0.886
- **Commit:** `f951ad5`

### Fase 6 — Evidence Checker & Confidence Scoring
- Nuevo modulo `evidence-checker.ts` (pure heuristic, <5ms)
- Confidence classification: high (topScore ≥ 0.75 + sources ≥ 3), medium (≥ 0.55 + ≥ 1), low
- Evidence quality score (0-1): weighted(40% topScore, 30% coverage, 20% distribution, 10% external diversity)
- Namespace contribution tracking: Record<namespace, count>
- Contradiction detection: derogated + vigente conflicts, conflicting percentage values
- `EVIDENCE_THRESHOLDS` configurable en constants.ts
- **Metricas:** Zero regressions, confidence_level en 100% de respuestas
- **Commit:** `f340ab9`

### Fase 7 — Structured Logging & Observability
- `logger.debug` en cada etapa del pipeline (queryEnhancement, retrieval, reranking, contextAssembly, evidenceCheck)
- `logger.info("RAG pipeline trace")` con metricas comprehensivas al final de cada request
- ragMetadata en chat response incluye: confidenceLevel, evidenceQuality, namespaceContribution, contradictionFlags
- Feedback API migrada de in-memory puro a write-through `/tmp/feedback.json` (persistencia entre cold starts)
- Flush cada 5 escrituras, lazy loading en cold start
- **Commit:** `85e7756`

### Fase 8 — Performance & Caching
- Early-exit para direct article lookups: queries como "Art. 240" saltan todos los LLM calls (rewrite, HyDE, decompose)
- Embedding cache: 500 → 2,000 entries (LRU)
- Response cache: 100 → 500 entries (LRU, 24h TTL)
- Intentos de subir namespace thresholds y bajar multiNamespaceTopK revertidos (causaban regresion Ext Src Ctx)
- **Metricas:** P@5 adj 0.884 → 0.890, P95 latency 1,572 → 1,488ms
- **Commit:** `1908da7`

### Fase 9 — Integration & Smoke Testing
- `eval/smoke-test.ts`: 10 smoke tests con assertions (pass/fail, exit code)
- Queries cubren: IVA, retencion, renta, sanciones, zonas francas, dividendos, renta presuntiva, doctrina
- Cada test verifica: articulos esperados, contenido presente, latencia, confidence_level, fuentes externas
- npm scripts: `npm run smoke-test`, `npm run eval`
- **Resultado:** 10/10 pass, zero eval regressions
- **Commit:** `8ea2643`

### Fase 10 — Documentacion & Handoff
- CLAUDE.md actualizado con arquitectura post-sprint (pipeline 8 etapas, 6 namespaces, 17 metricas)
- CHANGELOG.md creado con historial completo de las 10 fases
- Eval runbook documentado: como ejecutar, interpretar metricas, agregar test cases
- RAG_CONFIG actualizado en docs (topK 20, threshold 0.28, maxContextTokens 12000)

### Progresion de Metricas

| Metrica | Pre-Sprint | Post-Sprint | Delta |
|---------|-----------|-------------|-------|
| P@5 adj | ~0.80 | 0.884 | +10% |
| Recall@5 | 0.558 | 0.558 | = |
| MRR | 0.383 | 0.383 | = |
| Ext Src Retrieved | 0.947 | 0.993 | +5% |
| Ext Src in Context | 0.908 | 0.886 | -2% |
| Abstention Quality | 0.574 | 0.574 | = |
| Completeness | 0.913 | 0.913 | = |
| Avg Latency | 921ms | 1,094ms | +19% |
| P95 Latency | 1,363ms | 1,549ms | +14% |
| Smoke Tests | N/A | 10/10 | NEW |
| Confidence 100% | N/A | YES | NEW |
| Contradiction Detection | N/A | YES | NEW |
| Structured Logging | N/A | YES | NEW |

---

## [v3.0] — 2026-02-21 — Embedding de ~20K Documentos

- Scraping completo: doctrina DIAN (~15,495), jurisprudencia CC (~175), decretos DUR (~2,793), resoluciones DIAN (~626), leyes tributarias (~8)
- Chunking legal optimizado (512 tokens target, boundaries legales)
- Metadata enrichment: PageRank, Louvain communities, degree centrality
- Upsert a Pinecone en 5 namespaces adicionales (~31K vectores nuevos)
- Backfill: articulos ET vinculados bidireccionalmente con fuentes externas
- Knowledge graph: 540 nodos, cross-references, community detection
- **Commit:** `909904b`

---

## [v2.x] — Pre-Sprint

- 1,294 articulos del Estatuto Tributario embebidos en Pinecone (namespace default)
- Pipeline RAG basico: enhance → retrieve → rerank → assemble → build
- 35 calculadoras fiscales
- Calendario fiscal 2026
- Explorador de articulos con grafo de relaciones
- Doctrina DIAN curada (parcial)
- Chat IA con streaming (Sonnet 4.5)
