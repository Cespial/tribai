# Plan Operativo: Perfeccionamiento RAG v3 — "Dictamen Auditado"

**Versión:** 1.0
**Fecha:** 2026-02-22
**Supervisor:** Claude Code (Opus 4.6)
**Agentes de ejecución:** 6 agentes CODEX de ChatGPT

---

## I. North Star KPIs

| KPI | Baseline estimado | Target | Cómo se mide |
|-----|-------------------|--------|---------------|
| **Citation Exactness** | ~60% | ≥90% | % de respuestas donde todas las citas normativas son trazables a chunks recuperados |
| **Contradiction Rate** | ~8-12% | ≤3% | % de respuestas con afirmaciones contradictorias entre sí o con las fuentes |
| **Abstention Quality** | ~70% | ≥95% | % de casos con info insuficiente donde el sistema pide datos o abstiene correctamente |
| **Faithfulness Score** | ~75% | ≥92% | supported_claims / (supported + unsupported) via LLM judge |
| **Latencia p95** | ~8s | ≤10s | Medida end-to-end (enhance → retrieve → rerank → assemble → prompt) |
| **External Source Presence** | ~40% | ≥75% | % de queries que necesitan doctrina/jurisprudencia donde se recupera al menos 1 fuente externa |

---

## II. Plan de 10 Fases con Milestones

### FASE 0 — Baseline & Triage (Día 1)
**Objetivo:** Medir el estado actual con precisión.
**Acciones:**
1. Correr `eval/run_eval.ts` con las 300 preguntas actuales
2. Probar manualmente 10 queries complejas y documentar fallos
3. Capturar métricas: P@5, R@5, MRR, citationAcc, sourcePresence, containsExpected, latencyMs, tokensUsed
4. Identificar top-10 fallos reales (triage)

**DoD:** Reporte baseline guardado en `eval/results/baseline-v3.json`
**Riesgo:** Rate limits de Pinecone Inference durante eval → mitigar con delays

### FASE 1 — Query Understanding Avanzado (Días 2-3)
**Agente:** 1 (Retrieval/Router)
**Objetivo:** Activar `classifyQueryType` + `getQueryRoutingConfig` (actualmente dead code), implementar query segmentation multi-intención.
**Archivos:** `namespace-router.ts`, `retriever.ts`, `pipeline.ts`
**Métricas:** +10% externalSourcePresence, +5% sourcePresence
**DoD:** `classifyQueryType` conectado al pipeline, topK/maxReranked dinámicos por tipo

### FASE 2 — Chunking Legal de Alta Fidelidad (Días 2-4)
**Agente:** 2 (Chunking & Temporalidad)
**Objetivo:** Preservar estructura legal (incisos, parágrafos, numerales), metadata de vigencia, cross-references como metadata.
**Archivos:** `legal-chunker.ts`, metadata enricher
**Métricas:** Reducir "chunk irrelevante" en reranking, mejorar recall de parágrafos
**DoD:** Chunks preservan parágrafos completos, metadata incluye `vigencia_desde`, `cross_references[]`

### FASE 3 — Formato Dictamen Auditado (Días 3-5)
**Agente:** 3 (Answer Composer)
**Objetivo:** System prompt que produce respuestas tipo dictamen con secciones fijas + citation gating.
**Archivos:** `prompt-builder.ts`, `system-prompt.ts`
**Métricas:** +15% citationExactness, -5% contradictionRate
**DoD:** Respuestas con estructura: Resumen → Hechos → Normas → Análisis → Riesgos → Recomendación → Fuentes

### FASE 4 — Suite de Evaluación Compleja (Días 3-5)
**Agente:** 4 (Eval)
**Objetivo:** 40 casos complejos + métricas de contradiction, completeness, abstention.
**Archivos:** `eval/dataset.json`, `eval/run_eval.ts`, nuevas métricas
**Métricas:** Runner produce reporte reproducible con 12+ métricas
**DoD:** Dataset con 340 preguntas (300 + 40 complejas), runner con contradiction_rate y abstention_quality

### FASE 5 — Retrieval Multi-Etapa (Días 5-7)
**Agente:** 1 (Retrieval/Router)
**Objetivo:** Multi-hop retrieval: primera ronda recupera artículos, segunda ronda busca doctrina/jurisprudencia que cite esos artículos.
**Archivos:** `retriever.ts`, `context-assembler.ts`
**Métricas:** +15% externalSourcePresence para queries multi-norma
**DoD:** Pipeline con 2 rondas de retrieval, cross-namespace score normalization

### FASE 6 — Verificación y Consolidación (Días 6-8)
**Agente:** 3 (Answer Composer) + 5 (Guardrails)
**Objetivo:** Detección de contradicciones entre fuentes, gating de baja evidencia, verificación de vigencias.
**Archivos:** `prompt-builder.ts`, `context-assembler.ts`, nuevo `evidence-checker.ts`
**Métricas:** -50% contradictionRate, +20% abstentionQuality
**DoD:** Sistema detecta cuando top_score < 0.5 y activa fallback; detecta conflictos doctrina vs ET

### FASE 7 — Guardrails y Observabilidad (Días 7-9)
**Agente:** 5 (Observability)
**Objetivo:** Logs auditables por request, metadata de confianza, alertas por baja evidencia.
**Archivos:** `chat/route.ts`, `structured-logger.ts`, `feedback/route.ts`
**Métricas:** 100% de respuestas auditables en ragMetadata
**DoD:** Cada respuesta incluye confidence_level, evidence_quality, namespace_contribution

### FASE 8 — Performance y Costo (Días 8-10)
**Agente:** 6 (Performance)
**Objetivo:** Caching inteligente, early-exit para queries simples, adaptive topK.
**Archivos:** `response-cache.ts`, `pipeline.ts`, `reranker.ts`
**Métricas:** -30% p95 latency para queries simples, -20% tokens promedio
**DoD:** Queries factuales simples resueltas en <3s, queries complejas en <12s

### FASE 9 — Integración y Smoke Testing (Días 10-12)
**Objetivo:** Merge de todos los PRs, pruebas de regresión, smoke suite de 10 queries complejas.
**Métricas:** Todas las métricas ≥ target o justificación documentada
**DoD:** Build pasa, deploy en Vercel, smoke suite 10/10

### FASE 10 — Documentación y Handoff (Días 12-14)
**Objetivo:** CHANGELOG, documentación de arquitectura actualizada, runbook de eval.
**DoD:** CLAUDE.md actualizado, CHANGELOG.md con todas las mejoras

---

## III. Backlog P0 / P1 / P2

### P0 — Crítico (Semana 1)

| # | Tarea | Agente | Archivos | Criterio de éxito |
|---|-------|--------|----------|-------------------|
| P0-1 | Activar classifyQueryType en pipeline | Ag1 | namespace-router.ts, pipeline.ts, retriever.ts | topK y namespaces dinámicos por tipo de query |
| P0-2 | Multi-hop retrieval (2 rondas) | Ag1 | retriever.ts, context-assembler.ts | Queries "qué dice la doctrina sobre Art. X" recuperan doctrina |
| P0-3 | Cross-namespace score normalization | Ag1 | retriever.ts | Scores de doctrina y ET comparables |
| P0-4 | Chunking preserva parágrafos completos | Ag2 | legal-chunker.ts | Parágrafos no se cortan a mitad |
| P0-5 | Metadata de cross-references en chunks | Ag2 | legal-chunker.ts, metadata-enricher.ts | Chunks incluyen `cross_references[]` |
| P0-6 | System prompt formato dictamen | Ag3 | system-prompt.ts, prompt-builder.ts | Respuestas con 7 secciones definidas |
| P0-7 | Citation gating: no afirmar sin fuente | Ag3 | system-prompt.ts | citationExactness +15% |
| P0-8 | CITATION_INSTRUCTIONS siempre activas | Ag3 | prompt-builder.ts | No condicionar a hasExternalSources |
| P0-9 | 40 casos complejos en eval dataset | Ag4 | eval/dataset.json | Cubren PN/PJ, vigencias, excepciones, conflictos |
| P0-10 | Métricas contradiction_rate y abstention | Ag4 | eval/run_eval.ts, nueva métrica | Runner produce estas métricas automáticamente |

### P1 — Importante (Semana 2)

| # | Tarea | Agente | Archivos | Criterio de éxito |
|---|-------|--------|----------|-------------------|
| P1-1 | Evidence confidence scoring | Ag5 | context-assembler.ts, chat/route.ts | ragMetadata incluye confidence_level |
| P1-2 | Low-evidence fallback automático | Ag5 | pipeline.ts, prompt-builder.ts | top_score < 0.45 → respuesta con advertencia |
| P1-3 | Contradiction detection en contexto | Ag5 | nuevo evidence-checker.ts | Detecta si doctrina contradice ET |
| P1-4 | Caching por tipo de query | Ag6 | response-cache.ts, pipeline.ts | Queries factuales cacheadas 24h |
| P1-5 | Early-exit para lookups directos | Ag6 | pipeline.ts, query-enhancer.ts | "Qué dice Art. 240" no llama HyDE ni decompose |
| P1-6 | Adaptive topK por complejidad | Ag6 | retriever.ts | Queries simples topK=10, complejas topK=25 |
| P1-7 | filterRelevantCalculators conectada | Ag3 | system-prompt.ts, prompt-builder.ts | Calculadoras filtradas por query, no top-25 estáticas |
| P1-8 | sameCommunity boost implementado | Ag1 | reranker.ts | Constante huérfana ahora activa |

### P2 — Mejora (Backlog futuro)

| # | Tarea | Agente |
|---|-------|--------|
| P2-1 | Contextual Retrieval (Anthropic-style) | Ag2 |
| P2-2 | Hybrid Search (dense + sparse/BM25) | Ag1 |
| P2-3 | Feedback loop: queries negativas → eval dataset | Ag5 |
| P2-4 | A/B testing framework en producción | Ag5 |
| P2-5 | Graph-powered query expansion | Ag1 |
| P2-6 | Streaming confidence indicators en UI | Ag5 |

---

## IV. 40 Casos Complejos Iniciales

```json
[
  {
    "id": "complex-1",
    "category": "multi_norma",
    "difficulty": "hard",
    "question": "Una SAS con ingresos brutos de 80.000 UVT en 2025, ¿puede optar por el régimen SIMPLE en 2026? ¿Qué artículos del ET aplican y qué dice la doctrina DIAN sobre los topes?",
    "expected_articles": ["Art. 905", "Art. 903", "Art. 904"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["100.000 UVT", "SIMPLE", "SAS"],
    "expected_external_sources": ["doctrina"],
    "complexity_tags": ["regimen", "topes_uvt", "persona_juridica"]
  },
  {
    "id": "complex-2",
    "category": "conflicto_interpretativo",
    "difficulty": "hard",
    "question": "¿Las propinas recibidas por empleados de restaurantes constituyen ingreso gravado con impuesto de renta? ¿Hay diferencia entre lo que dice el ET, la doctrina DIAN y la jurisprudencia de la Corte?",
    "expected_articles": ["Art. 26", "Art. 103"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["ingreso", "laboral"],
    "expected_external_sources": ["doctrina", "jurisprudencia"],
    "complexity_tags": ["conflicto_fuentes", "persona_natural", "renta"]
  },
  {
    "id": "complex-3",
    "category": "temporal",
    "difficulty": "hard",
    "question": "¿Cómo cambió la tarifa de renta para personas jurídicas entre la Ley 1819 de 2016, la Ley 1943 de 2018 y la Ley 2277 de 2022? Muestra la evolución del Art. 240 ET.",
    "expected_articles": ["Art. 240"],
    "expected_chunk_types": ["contenido", "modificaciones"],
    "expected_answer_contains": ["33%", "34%", "35%"],
    "expected_external_sources": ["leyes"],
    "complexity_tags": ["temporal", "persona_juridica", "tarifa"]
  },
  {
    "id": "complex-4",
    "category": "excepcion",
    "difficulty": "hard",
    "question": "¿Cuáles son las excepciones a la tarifa general de retención en la fuente por pagos al exterior? ¿Qué pasa cuando hay convenio de doble imposición (CDI)?",
    "expected_articles": ["Art. 406", "Art. 408", "Art. 254"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["retención", "exterior", "convenio"],
    "expected_external_sources": ["decretos"],
    "complexity_tags": ["excepciones", "internacional", "retencion"]
  },
  {
    "id": "complex-5",
    "category": "calculo_complejo",
    "difficulty": "hard",
    "question": "Un empleado con salario mensual de $15.000.000 en 2026, ¿cuánto le retienen por renta según el Art. 383? Detalla el procedimiento paso a paso incluyendo la depuración de la base gravable.",
    "expected_articles": ["Art. 383", "Art. 387", "Art. 388"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["UVT", "depuración", "tabla"],
    "expected_external_sources": ["resoluciones"],
    "complexity_tags": ["calculo", "retencion", "persona_natural", "procedimiento"]
  },
  {
    "id": "complex-6",
    "category": "jerarquia_normativa",
    "difficulty": "hard",
    "question": "Si un decreto reglamentario del DUR 1625 establece un plazo diferente al señalado en una resolución DIAN para presentar una declaración, ¿cuál prevalece? ¿Qué dice la doctrina al respecto?",
    "expected_articles": ["Art. 555", "Art. 579"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["decreto", "resolución", "jerarquía"],
    "expected_external_sources": ["decretos", "resoluciones", "doctrina"],
    "complexity_tags": ["jerarquia_normativa", "conflicto_fuentes", "procedimiento"]
  },
  {
    "id": "complex-7",
    "category": "multi_sujeto",
    "difficulty": "hard",
    "question": "¿Cuáles son las diferencias en el tratamiento del impuesto de renta entre una persona natural residente, una no residente, y un establecimiento permanente en Colombia?",
    "expected_articles": ["Art. 9", "Art. 10", "Art. 20-1", "Art. 20-2", "Art. 241"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["residente", "no residente", "establecimiento permanente"],
    "expected_external_sources": [],
    "complexity_tags": ["comparativo", "multi_sujeto", "residencia"]
  },
  {
    "id": "complex-8",
    "category": "excepcion",
    "difficulty": "hard",
    "question": "¿Qué ingresos de las entidades sin ánimo de lucro (ESAL) del régimen tributario especial están exentos y cuáles son gravados? ¿Qué pasa si no cumplen con el Art. 356-1?",
    "expected_articles": ["Art. 356", "Art. 356-1", "Art. 357", "Art. 358"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["régimen tributario especial", "ESAL", "excedente"],
    "expected_external_sources": ["doctrina"],
    "complexity_tags": ["regimen_especial", "excepciones", "ESAL"]
  },
  {
    "id": "complex-9",
    "category": "procedimiento_complejo",
    "difficulty": "hard",
    "question": "¿Cuál es el procedimiento completo para solicitar la devolución de saldos a favor en IVA? Incluya plazos, requisitos, garantías y la resolución DIAN que regula el proceso.",
    "expected_articles": ["Art. 815", "Art. 816", "Art. 850", "Art. 854"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["devolución", "saldo a favor", "garantía"],
    "expected_external_sources": ["resoluciones", "decretos"],
    "complexity_tags": ["procedimiento", "IVA", "devolucion"]
  },
  {
    "id": "complex-10",
    "category": "abstention",
    "difficulty": "hard",
    "question": "¿Cuál es el tratamiento tributario de los contratos de colaboración empresarial (joint ventures) en Colombia para efectos de IVA y renta?",
    "expected_articles": ["Art. 18"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["colaboración empresarial"],
    "expected_external_sources": ["doctrina"],
    "complexity_tags": ["abstention_parcial", "tema_especializado"]
  },
  {
    "id": "complex-11",
    "category": "vigencia",
    "difficulty": "hard",
    "question": "El Art. 616-1 sobre facturación electrónica fue modificado por la Ley 2155 de 2021. ¿Qué cambió exactamente y cuál es el régimen de transición que estableció la DIAN por resolución?",
    "expected_articles": ["Art. 616-1"],
    "expected_chunk_types": ["contenido", "modificaciones"],
    "expected_answer_contains": ["factura electrónica", "Ley 2155"],
    "expected_external_sources": ["resoluciones", "leyes"],
    "complexity_tags": ["vigencia", "facturacion", "transicion"]
  },
  {
    "id": "complex-12",
    "category": "sancion_compleja",
    "difficulty": "hard",
    "question": "Una empresa no presentó la declaración de renta del año gravable 2024. ¿Cuál es la sanción? ¿Puede acogerse a beneficio de auditoría si la presenta extemporáneamente? ¿Qué dice el Art. 641 y el Art. 689-3?",
    "expected_articles": ["Art. 641", "Art. 642", "Art. 689-3"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["sanción", "extemporaneidad", "beneficio de auditoría"],
    "expected_external_sources": ["doctrina"],
    "complexity_tags": ["sanciones", "beneficio_auditoria", "plazos"]
  },
  {
    "id": "complex-13",
    "category": "multi_impuesto",
    "difficulty": "hard",
    "question": "Un profesional independiente (PN) con honorarios anuales de $200.000.000 en 2026: ¿debe facturar con IVA? ¿Qué retención en la fuente le aplica? ¿Puede deducir gastos sin soporte?",
    "expected_articles": ["Art. 437", "Art. 392", "Art. 336-1", "Art. 107"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["responsable de IVA", "retención", "honorarios"],
    "expected_external_sources": ["resoluciones", "doctrina"],
    "complexity_tags": ["multi_impuesto", "persona_natural", "IVA", "retencion"]
  },
  {
    "id": "complex-14",
    "category": "zona_franca",
    "difficulty": "hard",
    "question": "¿Cuál es la tarifa de renta para usuarios industriales de zona franca después de la Ley 2277 de 2022? ¿Qué condiciones deben cumplir? ¿La doctrina DIAN ha aclarado el concepto de 'exportación' para estos efectos?",
    "expected_articles": ["Art. 240-1"],
    "expected_chunk_types": ["contenido", "modificaciones"],
    "expected_answer_contains": ["zona franca", "20%", "exportación"],
    "expected_external_sources": ["doctrina", "leyes"],
    "complexity_tags": ["zona_franca", "tarifa_diferencial", "condiciones"]
  },
  {
    "id": "complex-15",
    "category": "precios_transferencia",
    "difficulty": "hard",
    "question": "¿Cuáles son las obligaciones formales en materia de precios de transferencia para una empresa con operaciones con vinculados del exterior superiores a 45.000 UVT?",
    "expected_articles": ["Art. 260-1", "Art. 260-2", "Art. 260-5"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["precios de transferencia", "documentación comprobatoria", "declaración informativa"],
    "expected_external_sources": ["decretos"],
    "complexity_tags": ["precios_transferencia", "internacional", "obligaciones_formales"]
  },
  {
    "id": "complex-16",
    "category": "conflicto_interpretativo",
    "difficulty": "hard",
    "question": "¿Los rendimientos financieros de CDTs a menos de un año están gravados con retención en la fuente? ¿Hay diferencia entre lo que dice el ET y los conceptos DIAN sobre la base de retención?",
    "expected_articles": ["Art. 395", "Art. 396"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["rendimientos financieros", "CDT", "retención"],
    "expected_external_sources": ["doctrina"],
    "complexity_tags": ["conflicto_interpretativo", "retencion", "financiero"]
  },
  {
    "id": "complex-17",
    "category": "patrimonio",
    "difficulty": "hard",
    "question": "¿Cómo se calcula el impuesto al patrimonio (Ley 2277/2022) para una persona natural residente con activos netos de 90.000 UVT? ¿Qué activos se excluyen de la base gravable?",
    "expected_articles": ["Art. 292-3", "Art. 294-3", "Art. 295-3", "Art. 296-3"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["patrimonio", "base gravable", "tarifa", "exclusiones"],
    "expected_external_sources": ["leyes"],
    "complexity_tags": ["patrimonio", "calculo", "exclusiones", "persona_natural"]
  },
  {
    "id": "complex-18",
    "category": "procedimiento_complejo",
    "difficulty": "hard",
    "question": "¿Cuál es el procedimiento de fiscalización tributaria de la DIAN? Desde el requerimiento ordinario hasta la liquidación oficial de revisión. Incluya plazos, recursos y prescripción.",
    "expected_articles": ["Art. 684", "Art. 703", "Art. 710", "Art. 714", "Art. 720"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["requerimiento", "liquidación oficial", "recurso de reconsideración", "prescripción"],
    "expected_external_sources": ["decretos"],
    "complexity_tags": ["procedimiento", "fiscalizacion", "plazos", "recursos"]
  },
  {
    "id": "complex-19",
    "category": "renta_PN",
    "difficulty": "hard",
    "question": "¿Cómo se depura la renta líquida gravable de una persona natural residente (cédula general) en 2026? Incluya todas las deducciones, rentas exentas, y los límites del Art. 336.",
    "expected_articles": ["Art. 330", "Art. 336", "Art. 241", "Art. 387"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["cédula general", "depuración", "40%", "5.040 UVT"],
    "expected_external_sources": [],
    "complexity_tags": ["renta_PN", "depuracion", "limites", "calculo"]
  },
  {
    "id": "complex-20",
    "category": "IVA_complejo",
    "difficulty": "hard",
    "question": "¿Cuáles bienes y servicios están excluidos del IVA según el Art. 424? ¿Cuál es la diferencia entre excluido, exento y gravado al 5%? ¿Qué dice la doctrina DIAN sobre la venta de inmuebles nuevos?",
    "expected_articles": ["Art. 424", "Art. 468-1", "Art. 477"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["excluido", "exento", "5%", "inmueble"],
    "expected_external_sources": ["doctrina"],
    "complexity_tags": ["IVA", "clasificacion", "inmuebles", "doctrina"]
  },
  {
    "id": "complex-21",
    "category": "dividendos",
    "difficulty": "hard",
    "question": "¿Cómo se gravan los dividendos distribuidos por una sociedad nacional a: (a) persona natural residente, (b) persona natural no residente, (c) sociedad nacional, (d) sociedad extranjera? Incluya las tarifas del Art. 242 y 245.",
    "expected_articles": ["Art. 242", "Art. 245", "Art. 49"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["dividendos", "residente", "no residente", "tarifa"],
    "expected_external_sources": ["leyes"],
    "complexity_tags": ["dividendos", "multi_sujeto", "tarifas_multiples"]
  },
  {
    "id": "complex-22",
    "category": "abstention",
    "difficulty": "hard",
    "question": "¿Cuál es el tratamiento tributario de las criptomonedas en Colombia para efectos de IVA, renta y GMF?",
    "expected_articles": [],
    "expected_chunk_types": [],
    "expected_answer_contains": ["criptomoneda"],
    "expected_external_sources": ["doctrina"],
    "complexity_tags": ["abstention", "tema_nuevo", "multi_impuesto"]
  },
  {
    "id": "complex-23",
    "category": "nomina_electronica",
    "difficulty": "hard",
    "question": "¿Qué obligados deben transmitir nómina electrónica según la resolución DIAN? ¿Cuáles son las sanciones por no hacerlo? ¿Es deducible el gasto de nómina sin soporte electrónico?",
    "expected_articles": ["Art. 771-6"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["nómina electrónica", "deducible", "sanción"],
    "expected_external_sources": ["resoluciones", "doctrina"],
    "complexity_tags": ["nomina", "obligaciones_formales", "sanciones"]
  },
  {
    "id": "complex-24",
    "category": "regimen_especial",
    "difficulty": "hard",
    "question": "¿Cuáles son los requisitos para que una cooperativa pertenezca al régimen tributario especial? ¿Qué pasa con el excedente que no se reinvierte? Compare con lo que dice la doctrina DIAN.",
    "expected_articles": ["Art. 19", "Art. 356", "Art. 358-1"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["cooperativa", "régimen tributario especial", "excedente"],
    "expected_external_sources": ["doctrina"],
    "complexity_tags": ["regimen_especial", "cooperativas", "doctrina_vs_ley"]
  },
  {
    "id": "complex-25",
    "category": "retencion_servicios",
    "difficulty": "hard",
    "question": "Un consultor extranjero sin residencia presta servicios de consultoría desde el exterior a una empresa colombiana. ¿Qué retención aplica? ¿Cambia si hay CDI con el país de origen? ¿Cuál es la base?",
    "expected_articles": ["Art. 406", "Art. 408", "Art. 24"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["retención", "no residente", "20%", "CDI"],
    "expected_external_sources": ["doctrina", "decretos"],
    "complexity_tags": ["internacional", "retencion", "CDI", "servicios"]
  },
  {
    "id": "complex-26",
    "category": "impuesto_consumo",
    "difficulty": "hard",
    "question": "¿Cuál es la diferencia entre el impuesto nacional al consumo y el IVA para restaurantes? ¿Una franquicia con ventas superiores a 3.500 UVT puede elegir entre los dos regímenes?",
    "expected_articles": ["Art. 512-1", "Art. 512-13"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["consumo", "8%", "restaurante"],
    "expected_external_sources": ["doctrina"],
    "complexity_tags": ["consumo_vs_IVA", "restaurantes", "regimen"]
  },
  {
    "id": "complex-27",
    "category": "ganancias_ocasionales",
    "difficulty": "hard",
    "question": "¿Cómo se determina la ganancia ocasional en la venta de un inmueble que fue adquirido hace más de 2 años? ¿Se puede restar el costo fiscal ajustado? ¿Cuál es la tarifa y qué dice la doctrina sobre la autoretención?",
    "expected_articles": ["Art. 299", "Art. 300", "Art. 313", "Art. 314"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["ganancia ocasional", "costo fiscal", "15%"],
    "expected_external_sources": ["doctrina"],
    "complexity_tags": ["ganancias_ocasionales", "inmuebles", "costo_fiscal"]
  },
  {
    "id": "complex-28",
    "category": "multi_norma",
    "difficulty": "hard",
    "question": "¿Cuáles son todos los requisitos para que un gasto sea deducible en renta según los Arts. 107, 771-2, 771-5 y 771-6 del ET? ¿Cómo interactúan estos artículos entre sí?",
    "expected_articles": ["Art. 107", "Art. 771-2", "Art. 771-5", "Art. 771-6"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["causalidad", "necesidad", "proporcionalidad", "factura electrónica", "bancarización"],
    "expected_external_sources": ["doctrina"],
    "complexity_tags": ["multi_norma", "deducciones", "requisitos_acumulativos"]
  },
  {
    "id": "complex-29",
    "category": "regimen_transicion",
    "difficulty": "hard",
    "question": "¿Las personas naturales que tenían rentas de pensiones antes de la Ley 1819 de 2016 mantienen algún beneficio de transición? ¿Qué dice el parágrafo transitorio del Art. 206?",
    "expected_articles": ["Art. 206"],
    "expected_chunk_types": ["contenido", "modificaciones"],
    "expected_answer_contains": ["pensión", "exenta", "transición"],
    "expected_external_sources": ["leyes", "jurisprudencia"],
    "complexity_tags": ["transicion", "pensiones", "derechos_adquiridos"]
  },
  {
    "id": "complex-30",
    "category": "GMF",
    "difficulty": "hard",
    "question": "¿Cuáles movimientos financieros están exentos del GMF (4x1000)? ¿Cuántas cuentas puede marcar una persona natural y una jurídica? ¿Qué dice la Corte Constitucional sobre la progresividad del GMF?",
    "expected_articles": ["Art. 871", "Art. 879"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["GMF", "exención", "cuenta marcada"],
    "expected_external_sources": ["doctrina", "jurisprudencia"],
    "complexity_tags": ["GMF", "exenciones", "jurisprudencia"]
  },
  {
    "id": "complex-31",
    "category": "informacion_faltante",
    "difficulty": "hard",
    "question": "¿Debo declarar renta este año?",
    "expected_articles": ["Art. 592", "Art. 593", "Art. 594-3"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["tope", "UVT"],
    "expected_external_sources": [],
    "complexity_tags": ["abstention_parcial", "pedir_datos", "PN_o_PJ_ambiguo"]
  },
  {
    "id": "complex-32",
    "category": "RUT",
    "difficulty": "hard",
    "question": "¿Cuáles son las obligaciones tributarias de un contribuyente con responsabilidad 05 (contribuyente del régimen ordinario) en el RUT? ¿Qué resolución DIAN establece los códigos de responsabilidad?",
    "expected_articles": ["Art. 555-2"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["RUT", "responsabilidad"],
    "expected_external_sources": ["resoluciones"],
    "complexity_tags": ["RUT", "obligaciones", "resolucion_DIAN"]
  },
  {
    "id": "complex-33",
    "category": "renta_presuntiva",
    "difficulty": "hard",
    "question": "¿Se eliminó la renta presuntiva? ¿Desde cuándo? ¿Qué empresas todavía podrían estar sujetas a renta presuntiva según el régimen de transición?",
    "expected_articles": ["Art. 188", "Art. 189"],
    "expected_chunk_types": ["contenido", "modificaciones"],
    "expected_answer_contains": ["renta presuntiva", "0%"],
    "expected_external_sources": ["leyes"],
    "complexity_tags": ["renta_presuntiva", "transicion", "vigencia"]
  },
  {
    "id": "complex-34",
    "category": "ICA_vs_renta",
    "difficulty": "hard",
    "question": "¿El ICA pagado es descontable del impuesto de renta según el Art. 115? ¿La Ley 2277 de 2022 cambió este beneficio? ¿Qué dice la doctrina DIAN?",
    "expected_articles": ["Art. 115"],
    "expected_chunk_types": ["contenido", "modificaciones"],
    "expected_answer_contains": ["ICA", "descuento", "50%"],
    "expected_external_sources": ["doctrina", "leyes"],
    "complexity_tags": ["ICA", "descuento_tributario", "cambio_normativo"]
  },
  {
    "id": "complex-35",
    "category": "subcapitalizacion",
    "difficulty": "hard",
    "question": "¿Cuáles son las reglas de subcapitalización en Colombia? ¿Los intereses pagados a vinculados del exterior son deducibles sin límite? ¿Qué proporción deuda/patrimonio aplica?",
    "expected_articles": ["Art. 118-1"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["subcapitalización", "deuda", "patrimonio", "intereses"],
    "expected_external_sources": ["decretos", "doctrina"],
    "complexity_tags": ["subcapitalizacion", "internacional", "vinculados"]
  },
  {
    "id": "complex-36",
    "category": "contrato_estabilidad",
    "difficulty": "hard",
    "question": "¿Los contratos de estabilidad jurídica tributaria siguen vigentes en Colombia? ¿Qué dice el ET y la jurisprudencia de la Corte Constitucional?",
    "expected_articles": [],
    "expected_chunk_types": [],
    "expected_answer_contains": ["estabilidad jurídica"],
    "expected_external_sources": ["jurisprudencia"],
    "complexity_tags": ["abstention_parcial", "estabilidad_juridica", "vigencia"]
  },
  {
    "id": "complex-37",
    "category": "facturacion",
    "difficulty": "hard",
    "question": "¿Un responsable de IVA que vende bienes excluidos y gravados al mismo tiempo, cómo debe facturar? ¿Puede emitir una sola factura electrónica con ítems gravados y excluidos? ¿Qué dice la resolución DIAN sobre la facturación mixta?",
    "expected_articles": ["Art. 616-1", "Art. 617"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["factura", "excluido", "gravado"],
    "expected_external_sources": ["resoluciones", "doctrina"],
    "complexity_tags": ["facturacion", "IVA_mixto", "procedimiento"]
  },
  {
    "id": "complex-38",
    "category": "obras_por_impuestos",
    "difficulty": "hard",
    "question": "¿Cómo funciona el mecanismo de obras por impuestos del Art. 238 del ET? ¿Qué porcentaje del impuesto de renta se puede destinar? ¿Hay decreto reglamentario?",
    "expected_articles": ["Art. 238"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["obras por impuestos", "ZOMAC"],
    "expected_external_sources": ["decretos"],
    "complexity_tags": ["obras_por_impuestos", "incentivo", "decreto"]
  },
  {
    "id": "complex-39",
    "category": "tasa_minima",
    "difficulty": "hard",
    "question": "¿Qué es la tasa mínima de tributación del Art. 259-1 creada por la Ley 2277 de 2022? ¿Cómo se calcula la tasa de tributación depurada (TTD) y cuál es el piso del 15%?",
    "expected_articles": ["Art. 259-1"],
    "expected_chunk_types": ["contenido"],
    "expected_answer_contains": ["tasa mínima", "15%", "TTD", "Ley 2277"],
    "expected_external_sources": ["leyes", "doctrina"],
    "complexity_tags": ["tasa_minima", "calculo_complejo", "norma_nueva"]
  },
  {
    "id": "complex-40",
    "category": "negativo_complejo",
    "difficulty": "hard",
    "question": "¿Cuál es la sanción por evasión tributaria agravada en Colombia según el Código Penal? ¿Cuándo un incumplimiento tributario pasa de ser administrativo a penal?",
    "expected_articles": [],
    "expected_chunk_types": [],
    "expected_answer_contains": ["penal"],
    "expected_external_sources": [],
    "complexity_tags": ["negativo", "fuera_de_scope", "penal"]
  }
]
```

---

## V. Protocolo de Evaluación

### Métricas Automáticas (por pregunta)

| Métrica | Tipo | Cómo se calcula |
|---------|------|-----------------|
| `precision_at_5` | Retrieval | expected_articles ∩ retrieved_top5 / 5 |
| `recall_at_5` | Retrieval | expected_articles ∩ retrieved_top5 / expected_articles |
| `MRR` | Retrieval | 1/rank del primer expected article encontrado |
| `citation_accuracy` | Answer Quality | expected_articles mencionados en contexto / total expected |
| `source_presence` | Answer Quality | expected_articles en context.sources / total expected |
| `contains_expected` | Answer Quality | expected_answer_contains encontrados / total |
| `external_source_presence` | Multi-source | namespaces esperados recuperados / esperados |
| `source_type_accuracy` | Multi-source | namespaces esperados en contexto final / esperados |
| `hallucination_proxy` | Faithfulness | artículos citados NO presentes en contexto |
| `latency_ms` | Performance | end-to-end pipeline time |
| `tokens_used` | Cost | estimateTokens del contexto ensamblado |

### Métricas Nuevas Requeridas (Ag4 debe implementar)

| Métrica | Tipo | Cómo se calcula |
|---------|------|-----------------|
| `contradiction_rate` | Quality | % de respuestas con afirmaciones conflictivas (LLM judge) |
| `abstention_quality` | Quality | % de preguntas con info insuficiente donde se abstiene correctamente |
| `completeness_score` | Quality | % de sub-temas de la pregunta que fueron abordados |
| `hierarchy_compliance` | Citation | % de citas que respetan jerarquía normativa (Ley > Decreto > Doctrina) |
| `faithfulness_score` | Faithfulness | supported_claims / total_claims (LLM judge, subset) |

### Criterio de Aprobación por Fase

| Fase | Gate |
|------|------|
| Fase 1 | externalSourcePresence ≥ 50% en subset doctrinal |
| Fase 2 | citation_accuracy +5% sin bajar recall |
| Fase 3 | citationExactness +10% en casos complejos, contradiction_rate no sube |
| Fase 4 | Runner produce 15+ métricas, reporte exportable |
| Fase 5 | externalSourcePresence ≥ 65% en queries multi-norma |
| Fase 6 | contradiction_rate ≤ 5%, abstention_quality ≥ 85% |
| Fase 7 | 100% respuestas con ragMetadata.confidence_level |
| Fase 8 | p95 latency no sube >15% vs baseline para queries complejas |

---

## VI. Prompts para los 6 Agentes CODEX

### AGENTE 1 — Retrieval/Router Engineer (P0)

```
ROL: Retrieval/Router Engineer (P0)
OBJETIVO: Activar query type routing dinámico y multi-hop retrieval.

SCOPE:
- src/lib/rag/namespace-router.ts
- src/lib/rag/retriever.ts
- src/lib/rag/pipeline.ts
- src/config/constants.ts (solo RAG_CONFIG)
- NO tocar: UI, scrapers, prompt-builder, system-prompt

CONTEXTO TÉCNICO:
1. classifyQueryType() y getQueryRoutingConfig() en namespace-router.ts están
   implementados pero NUNCA se llaman en el pipeline. Solo prioritizeNamespaces()
   se usa. Necesitas conectar classifyQueryType al pipeline para que topK y
   maxRerankedResults sean dinámicos según el tipo de query.

2. retrieveMultiNamespace() en retriever.ts usa un threshold fijo compartido
   con el namespace principal. Los scores de doctrina y ET tienen distribuciones
   diferentes. Implementa normalización por namespace (z-score o min-max).

3. Multi-hop: Para queries como "qué dice la doctrina sobre Art. 240", el
   pipeline debe: (a) recuperar Art. 240 del namespace "", (b) usar
   art_240 como filtro para buscar en namespace "doctrina" chunks que
   mencionen ese artículo en su metadata.

4. sameCommunity boost en MULTI_SOURCE_BOOST está definido (+0.08) pero
   nunca se aplica en reranker.ts. Implementarlo.

RESTRICCIONES:
- Cambios atómicos: 1 PR = 1 tema
- Tests: al menos 5 queries de prueba con resultados antes/después
- No cambies el sistema de embeddings ni el modelo
- Mantén compatibilidad con la interfaz de pipeline.ts

DEFINICIÓN DE ÉXITO (medible):
- externalSourcePresence sube de ~40% a ≥55% en subset "doctrina" y "multi_source"
- sourcePresence no baja para queries factual/procedural
- latencia p95 no sube >20%

ENTREGABLE:
1. Diagnóstico: qué está roto y por qué
2. Plan de cambios (3-5 items)
3. Cambios propuestos (archivos, funciones, diffs)
4. Cómo probar: npx tsx eval/run_eval.ts (o script de verificación)
5. Resultados eval antes/después (tabla comparativa)
```

### AGENTE 2 — Legal Chunking & Temporalidad (P0)

```
ROL: Legal Chunking & Temporalidad (P0)
OBJETIVO: Chunking legal granular que preserve parágrafos, incisos y
numerales completos. Metadata de cross-references y vigencia en chunks.

SCOPE:
- scripts/chunking/legal-chunker.ts
- scripts/chunking/metadata-enricher.ts
- scripts/embedding/upsert-pinecone.ts (solo si necesario)
- NO tocar: runtime (src/lib/rag/*), UI, scrapers

CONTEXTO TÉCNICO:
1. legal-chunker.ts usa TARGET_TOKENS=512, MAX_TOKENS=768, OVERLAP_TOKENS=100.
   El problema: un parágrafo del ET puede tener 400 tokens y se parte a la mitad
   si cae en el boundary del overlap. El chunking debe detectar "PARÁGRAFO",
   "NUMERAL", "LITERAL" como boundaries naturales y no cortarlos.

2. Los artículos del ET tienen campo "concordancias" (string) con referencias
   como "Arts. 24, 26, 240 ET". Esto debe parsearse a un array
   cross_references[] en la metadata del chunk para usarlo en retrieval.

3. Los artículos tienen "modificaciones_parsed" con fechas y leyes. El chunk
   de tipo "contenido" debería incluir metadata: ultima_modificacion_year,
   ley_vigente (última ley que lo modificó).

4. Los chunks de doctrina DIAN tienen "fecha" en su metadata pero no siempre
   "vigente". Verificar y normalizar.

RESTRICCIONES:
- No re-embeber todos los vectores (costoso). Solo producir el chunking
  mejorado y verificar que la estructura es correcta.
- Si el re-embebido es necesario para un namespace específico, documentar
  el costo estimado.
- Preservar IDs existentes para no perder compatibilidad con Pinecone.

DEFINICIÓN DE ÉXITO:
- 0% de parágrafos cortados a mitad de oración en chunks de artículos ET
- 100% de chunks de artículos con cross_references[] en metadata
- Reduce "chunk irrelevante" (chunk recuperado que no contiene info pedida)
- Script de verificación que muestra estadísticas de chunking

ENTREGABLE:
1. Diagnóstico: ejemplos de chunks mal cortados actuales
2. Plan de cambios
3. Cambios propuestos
4. Script de verificación: npx tsx scripts/chunking/verify-chunks.ts
5. Estadísticas: chunks antes vs después (tamaño, estructura, metadata)
```

### AGENTE 3 — Answer Composer / Dictamen (P0)

```
ROL: Answer Composer / Dictamen (P0)
OBJETIVO: Implementar formato de respuesta tipo "dictamen auditado"
y citation gating (no afirmar sin fuente recuperada).

SCOPE:
- src/lib/chat/system-prompt.ts
- src/lib/rag/prompt-builder.ts
- NO tocar: retrieval, reranking, chunking, UI

CONTEXTO TÉCNICO:
1. ENHANCED_SYSTEM_PROMPT en system-prompt.ts (107 líneas) define el
   comportamiento del modelo. Necesita restructurarse para producir
   respuestas con secciones fijas:
   - Resumen ejecutivo (3-5 bullets)
   - Hechos asumidos / datos faltantes (checklist)
   - Normas aplicables (tabla: Fuente | Norma | Relevancia)
   - Análisis paso a paso (regla → excepción → condición → conclusión)
   - Riesgos / puntos discutibles
   - Recomendación operativa
   - Fuentes consultadas (citas enumeradas)

2. CITATION_INSTRUCTIONS en prompt-builder.ts (línea 6-19) solo se inyectan
   cuando hasExternalSources === true. Deben inyectarse SIEMPRE.

3. filterRelevantCalculators() en system-prompt.ts está implementada pero
   NUNCA se llama desde buildMessages(). Se usa la lista estática top-25.
   Conectar para filtrar por query.

4. El prompt actual dice "Responde EXCLUSIVAMENTE con base en el contexto"
   pero no tiene instrucciones explícitas sobre qué hacer cuando:
   - El usuario no da suficientes datos (PN vs PJ, año, cuantía, residencia)
   - Hay conflicto entre fuentes (doctrina vs ET vs jurisprudencia)
   - El score de retrieval es bajo (poca evidencia)

5. El formato de cierre actual exige "### Artículos Consultados" y
   "### También podrías preguntar:". El formato dictamen debe incluir
   estas secciones pero integradas en la estructura formal.

RESTRICCIONES:
- El system prompt no debe exceder 3000 tokens (actualmente ~1500)
- El formato dictamen debe ser ADAPTIVO: queries simples ("tarifa IVA")
  no necesitan 7 secciones. Solo queries complejas o multi-norma.
- No perder la sugerencia de calculadoras.

DEFINICIÓN DE ÉXITO:
- citationExactness +15% en el subset de 40 casos complejos
- contradictionRate baja (medido con faithfulness check)
- Queries simples mantienen formato conciso
- Queries complejas producen formato dictamen con ≥5 de 7 secciones

ENTREGABLE:
1. Diagnóstico: 5 ejemplos de respuestas actuales con problemas
2. System prompt v3 propuesto (completo)
3. Cambios en prompt-builder.ts
4. 5 queries de prueba con respuestas antes/después
5. Evaluación de citationExactness
```

### AGENTE 4 — Eval & Benchmark Engineer (P0/P1)

```
ROL: Eval & Benchmark Engineer (P0/P1)
OBJETIVO: Expandir eval con 40 casos complejos y 5 métricas nuevas.

SCOPE:
- eval/dataset.json
- eval/run_eval.ts
- eval/metrics/answer-quality.ts
- eval/metrics/faithfulness.ts (ya existe pero no se usa en runner)
- eval/analysis/significance.ts
- eval/analysis/error-categorizer.ts
- Nuevo: eval/metrics/contradiction.ts
- Nuevo: eval/metrics/completeness.ts
- NO tocar: src/lib/rag/*, UI, scrapers

CONTEXTO TÉCNICO:
1. eval/dataset.json tiene 300 preguntas en 9 categorías:
   factual(43), comparative(40), procedural(60), temporal(20),
   edge_case(30), negative(40), sanctions(27), doctrina(20), multi_source(20).
   40 tienen expected_external_sources.

2. run_eval.ts ejecuta el pipeline RAG (enhance → retrieve → rerank →
   assemble) sin generar la respuesta LLM (no llama a Anthropic para
   la respuesta final). Las métricas son sobre retrieval y contexto.

3. evaluateFaithfulness() en faithfulness.ts usa Claude Haiku como judge
   pero NUNCA se llama desde run_eval.ts. Solo quickHallucinationCheck()
   se usa (heurístico, sin LLM).

4. Métricas que FALTAN y debes implementar:
   a) contradiction_rate: Para un subset (20-30 preguntas), generar
      la respuesta LLM y verificar si hay contradicciones internas.
   b) abstention_quality: Para preguntas donde expected_articles=[],
      verificar que el sistema NO inventa artículos.
   c) completeness_score: Para queries con múltiples sub-temas,
      verificar cuántos fueron abordados.
   d) hierarchy_compliance: Verificar que cuando se citan fuentes,
      se respeta la jerarquía normativa.
   e) faithfulness_score: Activar evaluateFaithfulness() para subset.

5. Los 40 casos complejos (ver sección IV del plan) deben agregarse
   al dataset con campos adicionales: complexity_tags[].

RESTRICCIONES:
- El runner completo con 340 preguntas no debe tardar >30 minutos
  (sin LLM judge). Con LLM judge (subset 30), aceptable hasta 45 min.
- Las métricas con LLM judge deben ser opcionales (flag --with-judge).
- Resultados deben guardarse en eval/results/ con timestamp.
- significance.ts debe producir bootstrap CI 95% para cada métrica.

DEFINICIÓN DE ÉXITO:
- Runner produce 15+ métricas automáticamente
- 40 casos complejos agregados con complexity_tags
- Reporte incluye breakdown por categoría y por difficulty
- Reporte exportable como JSON y summary en consola

ENTREGABLE:
1. Diagnóstico: métricas actuales y sus limitaciones
2. 40 casos complejos en formato EvalQuestion
3. Nuevas métricas implementadas
4. Comando: npx tsx eval/run_eval.ts --experiment baseline-v3 [--with-judge]
5. Reporte de ejemplo con datos reales
```

### AGENTE 5 — Observability/Guardrails (P1)

```
ROL: Observability/Guardrails (P1)
OBJETIVO: Logs auditables, evidence confidence scoring, y guardrails
para baja evidencia y contradicciones.

SCOPE:
- src/app/api/chat/route.ts
- src/app/api/feedback/route.ts
- src/lib/logging/structured-logger.ts
- src/lib/rag/pipeline.ts (solo para pasar metadata adicional)
- Nuevo: src/lib/rag/evidence-checker.ts
- NO tocar: prompt-builder, system-prompt, retrieval logic, UI

CONTEXTO TÉCNICO:
1. ragMetadata en chat/route.ts ya incluye: chunksRetrieved,
   chunksAfterReranking, uniqueArticles, tokensUsed, queryEnhanced,
   hydeGenerated, subQueriesCount, topScore, medianScore,
   dynamicThreshold, namespacesSearched, siblingChunksAdded,
   embeddingCacheHitRate, pipelineMs, timings.

2. Lo que FALTA en ragMetadata:
   a) confidence_level: "high" | "medium" | "low" basado en topScore
      y número de fuentes
   b) evidence_quality: score 0-1 basado en relevancia de fuentes
   c) namespace_contribution: { "": 5, "doctrina": 3, "decretos": 1 }
      cuántos chunks de cada namespace quedaron en contexto final
   d) contradiction_flags: boolean si se detectaron fuentes conflictivas
   e) query_type: resultado de classifyQueryType

3. evidence-checker.ts nuevo módulo:
   - Recibe chunks ensamblados
   - Detecta si fuentes se contradicen (doctrina dice X, ET dice Y)
   - Clasifica confidence: high (topScore>0.75, 3+ fuentes),
     medium (topScore>0.55, 1+ fuentes), low (topScore<0.55)
   - Si confidence=low, pipeline debe inyectar advertencia en prompt

4. feedback/route.ts es in-memory. Debe persistir a archivo JSON
   para no perder datos entre deploys (o documentar migración a KV).

RESTRICCIONES:
- No agregar más de 50ms de latencia al pipeline
- No agregar dependencias externas
- Guardrails deben ser configurables (thresholds en constants.ts)

DEFINICIÓN DE ÉXITO:
- 100% de respuestas tienen confidence_level en ragMetadata
- Cuando confidence=low, la respuesta incluye advertencia visible
- Contradicciones entre fuentes se detectan y se flaguean
- Feedback persiste entre restarts

ENTREGABLE:
1. Diagnóstico: qué falta en observabilidad actual
2. evidence-checker.ts diseño y implementación
3. ragMetadata expandido
4. 5 queries de ejemplo con metadata completa
5. Log de una query compleja mostrando trazabilidad completa
```

### AGENTE 6 — Performance/Cost Engineer (P1)

```
ROL: Performance/Cost Engineer (P1)
OBJETIVO: Reducir latencia y costo sin degradar calidad de respuestas.

SCOPE:
- src/lib/cache/response-cache.ts
- src/lib/rag/pipeline.ts
- src/lib/rag/query-enhancer.ts (solo para early-exit)
- src/lib/rag/retriever.ts (solo para adaptive topK)
- src/lib/rag/reranker.ts (solo para rerank budget)
- NO tocar: prompt-builder, system-prompt, eval, UI, scrapers

CONTEXTO TÉCNICO:
1. Cada query fría dispara hasta 5 LLM API calls:
   - 3x Haiku en query-enhancer (rewrite, HyDE, decompose) — paralelo
   - 1x Haiku en llmRerank — secuencial después de heuristic
   - 1x Sonnet para la respuesta final
   Total de overhead LLM pre-respuesta: ~2-4 segundos.

2. response-cache.ts existe pero:
   - Es in-memory (se pierde en serverless)
   - Se bypasea si conversationHistory no está vacío
   - No tiene TTL inteligente por tipo de query

3. Optimizaciones posibles:
   a) Early-exit para queries de lookup directo: "Qué dice Art. 240"
      → skip HyDE, skip decompose, skip LLM rerank. Solo rewrite + retrieve.
   b) Adaptive topK: queries simples (factual) → topK=10;
      queries complejas → topK=25. Ya está en getQueryRoutingConfig
      pero no conectado.
   c) Rerank budget: llmRerank solo para queries doctrinal/comparative
      donde el heuristic reranker tiene menor confianza.
   d) Embedding cache: cachear embeddings de queries frecuentes
      (top-50 queries por hash).
   e) Pipeline timing: medir cada stage y reportar en ragMetadata.timings.

4. Latencias actuales estimadas:
   - Query enhancement: ~2-3s (3 Haiku calls paralelo)
   - Retrieval: ~300-500ms (Pinecone)
   - Reranking: ~2-4s (Haiku LLM rerank)
   - Context assembly: ~100-200ms
   - Total pipeline: ~5-8s

RESTRICCIONES:
- citation_accuracy NO puede bajar más de 2% en ningún subset
- sourcePresence NO puede bajar
- Latencia target: factual p95 <3s, complejo p95 <12s
- No cambiar el modelo de embedding ni el índice de Pinecone

DEFINICIÓN DE ÉXITO:
- p95 latency para queries factuales: <4s (actualmente ~7s)
- p50 latency general: -30%
- Tokens promedio: -15%
- citation_accuracy no baja
- Benchmark reproducible: 50 queries con timing

ENTREGABLE:
1. Diagnóstico: breakdown de latencia por stage
2. Plan de optimizaciones (priorizado por impacto/riesgo)
3. Cambios propuestos
4. Benchmark: npx tsx eval/benchmark-performance.ts
5. Resultados comparativos antes/después
```

---

## VII. Checklist de Revisión de PRs (Claude Supervisor)

### Para cada PR de un Agente CODEX:

```
□ SEGURIDAD
  □ No expone API keys ni secrets
  □ No introduce inyección de prompt
  □ Rate limiting no se debilita

□ CALIDAD DE CÓDIGO
  □ TypeScript strict, sin any injustificados
  □ Imports ordenados
  □ Nombres descriptivos
  □ Sin código muerto añadido

□ COHERENCIA NORMATIVA
  □ Jerarquía de fuentes respetada en prompts
  □ Citas en formato correcto (Art. X ET, Concepto DIAN No. X)
  □ No se inventan artículos ni normas en tests

□ EVAL / REGRESIÓN
  □ Incluye resultados de eval antes/después
  □ citation_accuracy no baja >2%
  □ sourcePresence no baja >2%
  □ latency p95 no sube >20%

□ INTEGRACIÓN
  □ npm run build pasa
  □ npx tsc --noEmit limpio
  □ Smoke suite 10 queries complejas funciona

□ DOCUMENTACIÓN
  □ PR description con objetivo, cambios, resultados
  □ Archivos tocados listados
  □ Riesgos documentados
```

### Go/No-Go Gates por Merge Order

```
ORDEN DE MERGE:
1. Ag4 (Eval) — primero porque establece las métricas
2. Ag2 (Chunking) — segundo porque no depende de runtime
3. Ag1 (Retrieval/Router) — tercero, usa métricas de Ag4
4. Ag3 (Answer/Dictamen) — cuarto, depende de retrieval mejorado
5. Ag5 (Observability) — quinto, agrega capas sobre pipeline estable
6. Ag6 (Performance) — último, optimiza sobre pipeline final

GATE entre cada merge:
- npm run build ✓
- npx tsc --noEmit ✓
- Smoke suite (10 queries) sin regresión
- Métricas de eval ≥ baseline o justificación
```

---

## VIII. Smoke Suite — 10 Queries de Validación

Estas 10 queries se ejecutan después de cada merge para detectar regresiones:

| # | Query | Expectativa mínima |
|---|-------|--------------------|
| 1 | "¿Cuál es la tarifa general del IVA?" | Art. 468, responde "19%" |
| 2 | "¿Qué dice la doctrina DIAN sobre gastos de representación?" | Recupera ≥1 concepto DIAN + Art. 107 |
| 3 | "Diferencia entre bienes excluidos y exentos de IVA" | Art. 424, Art. 477, tabla comparativa |
| 4 | "¿Cómo se calcula la retención en la fuente por salarios?" | Art. 383, procedimiento paso a paso |
| 5 | "¿Qué cambios hizo la Ley 2277 de 2022 al Art. 240?" | Chunk "modificaciones", menciona 35% |
| 6 | "¿Debo declarar renta?" (sin más datos) | Pide datos: PN/PJ, ingresos, patrimonio |
| 7 | "¿Cuál es la sanción por no presentar declaración de renta?" | Art. 641, formula de sanción |
| 8 | "Art. 240-1 tarifa zonas francas" | Art. 240-1, menciona 20% y condiciones |
| 9 | "¿Los dividendos de una SAS a persona natural tributan?" | Art. 242, Art. 49, tarifas |
| 10 | "¿Qué es la renta presuntiva actualmente?" | Art. 188, menciona 0%, Ley 2010 |

---

## IX. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Rate limits Pinecone durante eval masivo | Alta | Medio | Delays de 30s, batch de 10 queries |
| Sobre-abstención del modelo con prompt estricto | Media | Alto | Threshold adaptivo, A/B test prompt |
| Regresión en queries simples al optimizar para complejas | Media | Alto | Smoke suite después de cada merge |
| Conflictos de merge entre agentes paralelos | Baja | Medio | Merge secuencial, archivos separados por agente |
| Costo de LLM judge en eval | Baja | Bajo | Subset de 30 queries, ~$0.50/run |
| Graph retriever falla en Vercel Edge | Alta | Bajo | Ya degradación silenciosa, documentar |

---

## X. Definición de Done Global

El ejercicio de perfeccionamiento está COMPLETO cuando:

- [ ] 40 casos complejos en eval dataset con complexity_tags
- [ ] Runner produce 15+ métricas automáticamente
- [ ] Citation exactness ≥ 90% en casos complejos
- [ ] Contradiction rate ≤ 3% (medido con LLM judge en subset)
- [ ] Abstention quality ≥ 95% en queries con info insuficiente
- [ ] Latencia p95 ≤ 12s para queries complejas
- [ ] 100% de respuestas con ragMetadata auditable
- [ ] Formato dictamen para queries complejas (≥5 de 7 secciones)
- [ ] Smoke suite 10/10 sin regresiones
- [ ] npm run build && npx tsc --noEmit limpios
- [ ] Deploy en Vercel exitoso
- [ ] CHANGELOG.md documentando todas las mejoras
