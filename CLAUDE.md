# CLAUDE.md — SuperApp Tributaria Colombia

## Identidad del Proyecto

**SuperApp Tributaria Colombia** es la plataforma tributaria más completa de Colombia. Combina 35 calculadoras fiscales, los 1,294 artículos del Estatuto Tributario (ET) indexados y navegables, un asistente IA con RAG sobre el ET, calendario fiscal 2026, doctrina DIAN, indicadores económicos, glosario tributario, guías interactivas y herramientas de productividad profesional.

- **URL producción:** https://superapp-tributaria-colombia.vercel.app
- **Repositorio:** https://github.com/Cespial/superapp-tributaria-colombia
- **Inspiración de diseño:** Harvey.ai (legal tech premium)

---

## Stack Técnico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.1.6 |
| UI | React | 19.2.3 |
| Estilos | Tailwind CSS v4 (CSS-first, `@theme inline`) | 4.x |
| Lenguaje | TypeScript (strict mode) | 5.x |
| IA — LLM | Anthropic Claude via Vercel AI SDK | Sonnet 4.5 (`claude-sonnet-4-5-20250929`) |
| IA — Query rewrite | Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) | |
| IA — Embeddings | Pinecone Inference (`multilingual-e5-large`, 1024d) | |
| Vector DB | Pinecone | SDK 7.x |
| Gráficas | Recharts | 3.7 |
| Grafos | react-force-graph-2d | 1.29 |
| Markdown | react-markdown + remark-gfm | |
| Sanitización | isomorphic-dompurify | |
| Matemáticas | decimal.js (precisión financiera) | |
| Validación | Zod v4 (importar desde `zod/v4` o `zod`) | |
| Iconos | lucide-react | |
| Temas | next-themes (dark mode) | |
| Deploy | Vercel | |
| PWA | Service Worker + manifest.json | |

---

## Arquitectura de Archivos

```
src/
├── app/                          # App Router — páginas y API
│   ├── page.tsx                  # Landing page (8 secciones)
│   ├── layout.tsx                # Root layout (fonts, providers, metadata)
│   ├── api/chat/route.ts         # Streaming RAG chat endpoint
│   ├── articulo/[slug]/          # 1,294 artículos SSG
│   ├── calculadoras/             # 35 calculadoras (client components)
│   ├── calendario/               # Calendario fiscal 2026
│   ├── comparar/                 # Comparador de artículos (diff)
│   ├── dashboard/                # Analytics del ET
│   ├── doctrina/                 # Doctrina DIAN
│   ├── explorador/               # Explorador de artículos + grafo
│   ├── favoritos/                # Bookmarks + notas + workspaces
│   ├── glosario/                 # Glosario tributario A-Z
│   ├── guias/                    # Guías interactivas (decision trees)
│   ├── indicadores/              # Indicadores económicos 2026
│   ├── novedades/                # Novedades normativas
│   ├── tablas/retencion/         # Tabla de retención con calculadora inline
│   └── asistente/                # Chat IA standalone
├── components/                   # ~113 componentes en 18 directorios
│   ├── article/                  # Contenido, header, sidebar, timeline, concordancias
│   ├── calculators/              # Cards, results, inputs, charts
│   ├── calendar/                 # AddToCalendar, filtros, status
│   ├── chat/                     # Container, input, bubbles, citations, suggestions
│   ├── comparison/               # Diff viewer, version selector
│   ├── dashboard/                # Stats, charts, tables
│   ├── explorer/                 # Cards, grid, filters, search, graph
│   ├── hero/                     # Video carousel (3 escenas, crossfade)
│   ├── indicators/               # Charts UVT
│   ├── landing/                  # Footer, metrics, ticker, social proof
│   ├── layout/                   # Header, ReferencePageLayout
│   ├── novedades/                # Cards, timeline, filters
│   ├── workspace/                # Workspaces de productividad
│   ├── pdf/                      # Export y print wrapper
│   ├── retention/                # QuickCalculator, tabla
│   └── ui/                       # reveal, skeleton, spinner, toast
├── config/                       # 21 archivos de datos estáticos
│   ├── tax-data*.ts              # Datos tributarios (UVT, tarifas, topes)
│   ├── calendario-data.ts        # Obligaciones fiscales 2026
│   ├── doctrina-data.ts          # Conceptos DIAN curados
│   ├── novedades-data.ts         # Novedades normativas
│   ├── glosario-data.ts          # Términos tributarios
│   ├── guias-data.ts             # Árboles de decisión
│   ├── indicadores-data.ts       # Indicadores económicos
│   ├── retencion-tabla-data.ts   # Conceptos de retención
│   ├── constants.ts              # RAG config, Pinecone host, embeddings
│   └── categories.ts             # Libros del ET, keywords
├── lib/
│   ├── rag/                      # Pipeline RAG completo (9 módulos)
│   │   ├── pipeline.ts           # Orquestador: enhance → route → retrieve → rerank → assemble → evidence → build
│   │   ├── query-enhancer.ts     # Rewrite + HyDE + decomposition (Haiku) + early-exit
│   │   ├── namespace-router.ts   # Clasificación de query → config de routing dinámico
│   │   ├── retriever.ts          # Multi-namespace retrieval + multi-hop (2 rondas)
│   │   ├── graph-retriever.ts    # PageRank, community detection, graph-based boosting
│   │   ├── reranker.ts           # Heuristic boost scoring (ET + multi-source)
│   │   ├── context-assembler.ts  # Sibling retrieval + token budget + namespace diversity
│   │   ├── evidence-checker.ts   # Confidence scoring, contradiction detection, quality metrics
│   │   └── prompt-builder.ts     # XML context + evidence warnings + calculator injection
│   ├── cache/
│   │   └── response-cache.ts     # LRU response cache (500 entries, 24h TTL)
│   ├── pinecone/
│   │   ├── client.ts             # Singleton Pinecone client
│   │   └── embedder.ts           # multilingual-e5-large embeddings (LRU cache 2000)
│   ├── chat/
│   │   ├── system-prompt.ts      # System prompt con constantes 2026
│   │   ├── session-memory.ts     # Context de conversación (5 turnos)
│   │   ├── calculator-context.ts # Sugerencias de calculadoras por keyword
│   │   ├── history-storage.ts    # localStorage (30 conv, 80 msgs)
│   │   └── contextual-questions.ts # Preguntas por ruta
│   ├── hooks/                    # useBookmarks, useNotes, useScrollReveal
│   ├── contexts/                 # ArticlePanelContext
│   ├── utils/                    # Normalización, parsing
│   ├── export/                   # JSON, CSV, PDF
│   ├── api/                      # Rate limiter, Zod validation
│   ├── calculators/              # Popularity, search, share, format, url-state
│   └── types/                    # articles.ts
├── types/                        # Type definitions globales
│   ├── rag.ts                    # EnhancedQuery, RetrievalResult, SourceCitation, RAGConfig
│   ├── pinecone.ts               # ChunkMetadata (14+ campos), ScoredChunk
│   ├── chat.ts                   # Chat types
│   ├── chat-history.ts           # ChatConversation, ChatMessageFeedback
│   ├── calendar.ts
│   ├── productivity.ts
│   └── knowledge.ts
public/
├── data/
│   ├── articles/                 # 1,294 JSON individuales
│   ├── articles-index.json       # Índice (443KB)
│   ├── articles-index.enriched.json  # Índice enriquecido (1.4MB)
│   ├── dashboard-stats.json      # Estadísticas del ET
│   ├── dashboard-timeseries.json # Series temporales
│   ├── explorer-facets.json      # Facetas para filtros
│   ├── featured-articles.json    # Artículos destacados
│   └── graph-data.json           # Datos del grafo de relaciones (136KB)
├── hero/                         # 3 videos MP4 (~6MB total)
scripts/
├── build-analytics-datasets.mjs  # Genera dashboard-stats, graph-data, explorer-facets
├── verify-data-integrity.mjs     # Verificación de datos
├── orchestrator.ts               # Pipeline master: scrape → parse → chunk → embed → upsert
├── scraping/                     # 7 scrapers + 3 parsers + utils
├── chunking/                     # legal-chunker.ts, metadata-enricher.ts
├── embedding/                    # batch-embedder.ts, upsert-pinecone.ts, validate-upsert.ts
├── enrichment/                   # backfill-articles.ts (vincula fuentes externas a ET)
└── graph/                        # build-graph.ts, compute-metrics.ts, extract-references.ts
eval/                             # Framework de evaluación RAG (340 queries, 17 métricas)
├── run_eval.ts                   # Evaluación completa: retrieval + answer quality + performance
├── smoke-test.ts                 # 10 smoke tests con assertions (pass/fail)
├── dataset.json                  # 300 standard + 40 complex queries
├── baseline-results.json         # Resultados de referencia actuales
├── experiments/config-grid.ts    # Grid de configuraciones para sweeps
├── metrics/                      # retrieval, answer-quality, faithfulness, llm-judge
├── analysis/                     # error-categorizer, significance testing
└── results/                      # Historial de resultados por timestamp
```

---

## Sistema de Diseño

### Paleta (warm-gray premium, Harvey.ai)

| Token | Light | Dark |
|-------|-------|------|
| `--background` | `#fafaf9` (ivory cálido) | `#0f0e0d` (negro cálido) |
| `--foreground` | `#0f0e0d` | `#fafaf9` |
| `--card` | `#ffffff` | `#1f1d1a` |
| `--muted` | `#f2f1f0` | `#1f1d1a` |
| `--muted-foreground` | `#706d66` | `#8f8b85` |
| `--border` | `#e5e5e3` | `#33312c` |
| `--primary` | `#0f0e0d` | `#fafaf9` |
| `--destructive` | `#dc2626` | `#ef4444` |
| `--success` | `#16a34a` | `#22c55e` |

### Tipografía

- **Headings serif:** Playfair Display 400, `letter-spacing: -0.0175em`, `line-height: 1.05` → clase `.heading-serif`
- **Body sans:** Geist (variable de Next.js)
- **Monospace:** Geist Mono

### Clases CSS Utilitarias Propias

- `.heading-serif` — Headings con Playfair Display
- `.surface-card` — Card con bg, border, y hover-lift
- `.hover-lift` — Eleva card on hover
- `.prose-chat` — Markdown rendering en el chat
- `.callout-info` — Callout informativo
- `.section-dark` — Sección con fondo oscuro
- `.reveal-on-scroll` — Animación de entrada al scroll

### Patrones de UI

- Tailwind v4 CSS-first: `@import "tailwindcss"` + `@theme inline` en `globals.css`
- No hay `tailwind.config.js` — todo en CSS
- Transiciones globales: `* { transition: color, background-color, border-color, box-shadow, opacity 150ms }`
- Custom easing curves: `--ease-in`, `--ease-out`, `--ease-in-out`
- Scrollbars finos (6px)
- `prefers-reduced-motion` respetado
- Scroll-reveal con `IntersectionObserver` (hook `useScrollReveal`)
- Print styles para artículos y guías

---

## Convenciones de Código

### General

- TypeScript strict. No `any` sin justificación.
- Path alias: `@/*` → `./src/*`
- Imports ordenados: React → next → third-party → locales → types
- Componentes: PascalCase. Hooks: camelCase con `use` prefix. Utilidades: camelCase.
- Archivos de componentes: kebab-case (`article-card.tsx`, `filter-panel.tsx`)
- Un componente exportado por archivo (excepto sub-componentes internos)

### React

- Server Components por defecto. `"use client"` solo cuando se necesita interactividad.
- Artículos: SSG con `generateStaticParams` (1,294 páginas estáticas)
- Calculadoras: Client Components (formularios interactivos)
- Referencias de páginas (explorador, calendario, etc.): Client Components con estado de filtros
- Hooks personalizados en `src/lib/hooks/`
- Contextos en `src/lib/contexts/`

### Estilos

- Tailwind utility-first. Sin CSS modules.
- Responsive: mobile-first (`sm:`, `md:`, `lg:`)
- Dark mode: via `.dark` class (next-themes)
- Composición de clases: `clsx()` + `tailwind-merge` (función `cn()` si existe, o inline)
- Colores siempre via tokens CSS (`text-foreground`, `bg-card`, `border-border`)
- Nunca colores hardcodeados excepto en gradientes del hero

### Datos

- Datos estáticos en `src/config/*.ts` (exportan arrays/objetos tipados)
- Artículos como JSON individuales en `public/data/articles/[slug].json`
- Índice de artículos en `public/data/articles-index.json`
- Scripts de generación de datos: `npm run data:build`, `npm run data:verify`

---

## Pipeline RAG — Arquitectura Completa (Post v3.1 Sprint)

### Flujo (8 etapas)

```
Query del usuario
    ↓
[0] Cache Check
    └── LRU response cache (500 entries, 24h TTL, normalized key)
    ↓ (miss)
[1] Query Enhancement (Haiku 4.5)
    ├── Early-exit: queries directas (Art. X) saltan LLM calls
    ├── Rewrite: reformula con terminología legal colombiana
    ├── HyDE: genera respuesta hipotética para embedding
    ├── Decomposition: descompone queries complejas en sub-queries
    └── Query expansion: sinónimos y términos legales colombianos
    ↓
[2] Query Routing (namespace-router.ts)
    ├── classifyQueryType: factual | comparative | procedural | temporal | doctrina | sanctions
    ├── getQueryRoutingConfig: topK, maxReranked, namespaces dinámicos por tipo
    └── Detect article slugs para multi-hop
    ↓
[3] Retrieval (Pinecone — 6 namespaces)
    ├── Ronda 1: Multi-query search en namespace default (ET)
    │   ├── Parallel embedding (multilingual-e5-large, 1024d, cache 2000)
    │   ├── topK: 20 por query
    │   ├── Similarity threshold: 0.28 (dinámico por namespace)
    │   └── Cross-namespace normalization (min-max scaling)
    ├── Ronda 1b: Multi-namespace search (doctrina, jurisprudencia, decretos, resoluciones, leyes)
    │   ├── topK: 15 por namespace
    │   └── Namespace-specific thresholds (doctrina: 0.20, decretos: 0.23, etc.)
    └── Ronda 2 (Multi-hop): Busca fuentes externas que citen artículos recuperados
        └── Filter: { articulos_slugs: { $in: retrievedArticleSlugs } }
    ↓
[4] Heuristic Reranking (2 pipelines paralelos)
    ├── ET Reranking:
    │   ├── chunk_type boost: contenido +0.15, modificaciones +0.10
    │   ├── Direct article mention: +0.30
    │   ├── Title overlap: +0.05/word (max 0.15)
    │   ├── Derogated penalty: -0.15 (salvo queries históricas: +0.20)
    │   ├── Vigente boost: +0.05
    │   ├── Ley match: +0.15
    │   └── maxRerankedResults: 10
    └── Multi-Source Reranking:
        ├── PageRank boost: +0.10 (high PR > 0.01)
        ├── Same community boost: +0.08
        ├── Doctrina vigente: +0.15, revocada: -0.20
        ├── Sentencia SU-: +0.25, C-: +0.20
        ├── Multi-hop overlap: +0.12 base (cap 0.21)
        └── Decreto reciente: +0.10 (< 3 años)
    ↓
[5] Context Assembly
    ├── Sibling retrieval: busca todos los chunks del mismo artículo
    ├── Dedup por chunk ID
    ├── Agrupación por artículo: contenido, modificaciones, textoAnterior
    ├── Token budget: 12,000 tokens max
    └── External source budget: namespace diversity round-robin
        ├── Phase 1: Best source from each namespace (guaranteed diversity)
        └── Phase 2: Greedy fill by score (remaining budget)
    ↓
[6] Evidence Check (heuristic, <5ms)
    ├── Confidence classification: high | medium | low
    │   ├── high: topScore ≥ 0.75 AND sources ≥ 3
    │   ├── medium: topScore ≥ 0.55 AND sources ≥ 1
    │   └── low: everything else
    ├── Evidence quality score (0-1): weighted(topScore, coverage, distribution, diversity)
    ├── Namespace contribution tracking: Record<namespace, count>
    └── Contradiction detection: derogated+vigente conflicts, conflicting percentages
    ↓
[7] Prompt Building
    ├── System prompt con constantes 2026 (UVT $52,374, SMLMV $1,750,905)
    ├── 35 sugerencias de calculadoras (dinámicas por keyword)
    ├── Contexto RAG en XML: <context><article>...</article><external_sources>...</external_sources></context>
    ├── <evidence quality="high|medium|low" confidence="0.XX">
    ├── <low_evidence_warning> cuando topScore < 0.45
    ├── <contradiction_warning> cuando se detectan conflictos
    ├── <page_context> si aplica
    └── <conversation_history> (últimos 5 turnos, 200 chars cada uno)
    ↓
[8] Streaming Response (Sonnet 4.5)
    ├── Metadata on finish: sources, suggestedCalculators, ragMetadata
    ├── ragMetadata incluye: confidenceLevel, evidenceQuality, namespaceContribution, contradictionFlags
    └── Structured pipeline trace log (latency per stage, article counts, scores)
```

### Configuración RAG (`src/config/constants.ts`)

```typescript
RAG_CONFIG = {
  topK: 20,
  similarityThreshold: 0.28,
  maxContextTokens: 12000,
  maxRerankedResults: 10,
  useHyDE: true,
  useLLMRerank: true,
  useQueryExpansion: true,
  useSiblingRetrieval: true,
  useMultiNamespace: true,
  additionalNamespaces: ["doctrina", "jurisprudencia", "decretos", "resoluciones", "leyes"],
  multiNamespaceTopK: 15,
  externalSourceBudgetRatio: 0.30,
  namespaceThresholds: {
    "": 0.28,
    doctrina: 0.20,
    jurisprudencia: 0.20,
    decretos: 0.23,
    resoluciones: 0.23,
    leyes: 0.23,
  },
}

EVIDENCE_THRESHOLDS = {
  highConfidenceScore: 0.75,
  highConfidenceSources: 3,
  mediumConfidenceScore: 0.55,
  lowEvidenceFallback: 0.45,
}
```

### Pinecone Index

- **Nombre:** `estatuto-tributario`
- **Host:** `https://estatuto-tributario-vrkkwsx.svc.aped-4627-b74a.pinecone.io`
- **Modelo de embedding:** `multilingual-e5-large` (1024 dimensiones)
- **Vectores totales:** ~36,000 (5K ET + 31K fuentes externas)
- **Namespaces:** `""` (ET), `doctrina`, `jurisprudencia`, `decretos`, `resoluciones`, `leyes`
- **Chunk metadata:** id_articulo, titulo, libro, estado, chunk_type, chunk_index, total_chunks, complexity_score, total_mods, has_normas, vigente, cross_references, pagerank, community, degree, articulos_slugs

### Esquema de Artículo (`public/data/articles/[slug].json`)

```typescript
{
  id_articulo: string;           // "Art. 240"
  titulo: string;
  titulo_corto: string;
  slug: string;
  url_origen: string;
  libro: string;                 // "Libro I - Renta"
  libro_full: string;
  estado: "vigente" | "modificado" | "derogado";
  complexity_score: number;      // 0-10
  contenido_texto: string;
  contenido_html: string;
  modificaciones_raw: string;
  modificaciones_parsed: ModificacionParsed[];
  total_modificaciones: number;
  ultima_modificacion_year: number;
  leyes_modificatorias: string[];
  texto_derogado: string[];
  texto_derogado_parsed: TextoDerogadoParsed[];
  normas_parsed: {
    jurisprudencia: string[];
    decretos: string[];
    doctrina_dian: string[];
    notas: string[];
    otros: string[];
  };
  total_normas: number;
  cross_references: string[];
  referenced_by: string[];
  concordancias: string;
  doctrina_dian_scrape: string;
  notas_editoriales: string;
}
```

---

## Variables de Entorno

```
ANTHROPIC_API_KEY=sk-ant-...        # Requerido — API key de Anthropic
PINECONE_API_KEY=pcsk_...           # Requerido — API key de Pinecone
PINECONE_INDEX_NAME=estatuto-tributario  # Nombre del índice
CHAT_MODEL=claude-sonnet-4-5-20250929   # Opcional — modelo del chat (default: Sonnet 4.5)
```

---

## Comandos de Desarrollo

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Build de producción (verifica TypeScript + genera 1,347 páginas)
npm run lint         # ESLint
npm run data:build   # Regenera datasets analíticos desde los JSONs de artículos
npm run data:verify  # Verifica integridad de datos
npm run smoke-test   # 10 smoke tests del pipeline RAG (pass/fail, exit code 0/1)
npm run eval         # Evaluación completa: 340 queries, 17 métricas, ~6 min
npm run eval:judge   # Eval + LLM Judge: genera respuestas + evalúa calidad (30 sample, ~15 min)
npx tsc --noEmit     # Type check sin emitir
```

---

## Mercado Objetivo — Colombia

### Audiencia (por prioridad)

1. **Contadores públicos independientes** (~60% del tráfico) — ~300,000 activos en Colombia (JCC). Necesitan eficiencia, precisión, referencias al ET. Manejan 10-50 clientes simultáneamente.
2. **Empresarios PyME** — No dominan tributaria. Necesitan claridad, confianza, respuestas simples.
3. **Abogados tributaristas** — Profundidad técnica, doctrina DIAN actualizada, argumentación legal.
4. **Personas naturales declarantes** — Pregunta #1: "¿Debo declarar renta?"
5. **Departamentos contables corporativos** — Herramientas de equipo, exportación, workflows.

### Pain Points del Mercado

- La DIAN cambia normas constantemente (reformas tributarias frecuentes)
- El Estatuto Tributario tiene 1,294 artículos densos y difíciles de navegar
- Contadores pierden horas buscando artículos y calculando manualmente
- Miedo a sanciones por errores en declaraciones
- Software existente (Siigo, World Office) es caro y complejo
- No existe plataforma gratuita integral: calculadoras + ET + IA + calendario

### Constantes Tributarias 2026

```
UVT 2026:    $52,374
SMLMV 2026:  $1,750,905
Auxilio transporte: $249,095 (Decreto 1470 de 2025)
```

---

## Base de Conocimiento — Fuentes Embebidas (COMPLETADO)

~36,000 vectores en Pinecone distribuidos en 6 namespaces:

| Namespace | Fuente | Documentos | Chunks | Estado |
|-----------|--------|-----------|--------|--------|
| `""` (default) | Estatuto Tributario (estatuto.co) | 1,294 artículos | ~5,000 | COMPLETADO |
| `doctrina` | DIAN + CIJUF | ~15,495 conceptos | ~30,000 | COMPLETADO |
| `jurisprudencia` | Corte Constitucional | ~175 sentencias | ~700 | COMPLETADO |
| `decretos` | DUR 1625/2016 (SUIN) | ~2,793 artículos | ~3,500 | COMPLETADO |
| `resoluciones` | DIAN Resoluciones | ~626 resoluciones | ~1,300 | COMPLETADO |
| `leyes` | Senado (Leyes tributarias) | ~8 leyes | ~60 | COMPLETADO |

### Pipeline de Datos (scripts/)

```
scripts/orchestrator.ts               # Pipeline master: scrape → parse → chunk → embed → upsert
scripts/scraping/
├── scrapers/                         # 7 scrapers (DIAN, CIJUF, CC, CE, SUIN, Senado)
├── parsers/                          # doctrina-parser, sentencia-parser, decreto-parser
└── utils/                            # rate-limiter, html-fetcher, dedup, regex-patterns
scripts/chunking/
├── legal-chunker.ts                  # 512 tokens target, respeta límites legales
└── metadata-enricher.ts              # Agrega PageRank, community, degree, cross-references
scripts/embedding/
├── batch-embedder.ts                 # 96 chunks/batch, 16s delay, backoff exponencial
├── upsert-pinecone.ts                # Upsert por namespace (idempotente)
└── validate-upsert.ts                # Valida vectores por namespace + sample queries
scripts/enrichment/
└── backfill-articles.ts              # Vincula doctrina/jurisprudencia/decretos a artículos ET
scripts/graph/
├── build-graph.ts                    # Knowledge graph del ET (540 nodos, cross-references)
├── compute-metrics.ts                # PageRank, Louvain communities, degree centrality
└── extract-references.ts             # Extrae relaciones entre artículos
```

---

## Estándares de Calidad

### Antes de cada commit

```bash
npm run build        # 0 errores, todas las páginas generadas
npm run lint         # Sin warnings
npx tsc --noEmit     # Type check limpio
```

### Copy y Lenguaje

- Español colombiano (no de España): "computador" no "ordenador", "tasa" no "tipo impositivo"
- Tono: profesional pero accesible. Autoritativo sin ser académico.
- Citar siempre artículos del ET con formato: "Art. 241 ET", "Arts. 592-594 ET"
- Citar doctrina DIAN con formato: "Concepto DIAN No. 012345 de 2024"
- Citar jurisprudencia: "Sentencia C-XXX de YYYY, M.P. Nombre Apellido"
- UVT siempre con valor en pesos al lado: "1,090 UVT ($57,087,660)"

### Performance

- First Contentful Paint < 1.5s
- Videos del hero: preload="auto" para scene 1, preload="metadata" para 2 y 3
- Artículos: SSG (build-time), 0 JS para lectura
- Calculadoras: Client-side only, sin API calls
- Chat: Streaming response, no blocking

### Accesibilidad

- `aria-hidden="true"` en elementos decorativos (hero video)
- Labels en todos los inputs de formulario
- Contraste WCAG AA mínimo
- Keyboard navigation funcional
- `prefers-reduced-motion` desactiva animaciones

---

## Evaluación RAG (`eval/`) — Runbook

### Comandos

```bash
npm run smoke-test   # Rápido: 10 queries, ~15s, pass/fail con exit code
npm run eval         # Completo: 340 queries, 17 métricas, ~6 min
```

### Dataset

- **`eval/dataset.json`** — 340 queries (300 standard + 40 complejas)
- **Categorías:** factual, comparative, procedural, temporal, edge_case, negative, sanctions, doctrina, multi_source, y 20+ categorías especializadas
- **Dificultad:** easy (28), medium (99), hard (213)
- **Campos:** `id`, `category`, `difficulty`, `question`, `expected_articles[]`, `expected_chunk_types[]`, `expected_answer_contains[]`, `expected_external_sources[]`, `complexity_tags[]`

### Métricas (17 total)

| Métrica | Descripción | Target |
|---------|-------------|--------|
| P@5 adj | Precision@5 ajustada (penaliza artículos irrelevantes) | ≥0.85 |
| Recall@5 | % de artículos esperados encontrados en top-5 | ≥0.55 |
| MRR | Mean Reciprocal Rank del primer artículo correcto | ≥0.38 |
| NDCG@5 | Normalized DCG para ranking quality | ≥0.65 |
| Citation Acc | % de artículos citados que son correctos | ≥0.65 |
| Source Presence | % de fuentes esperadas presentes en contexto | ≥0.50 |
| Contains Expected | % de respuestas con contenido esperado | ≥0.90 |
| Error Rate | % de queries con errores de retrieval | ≤0.35 |
| Ext Src Retrieved | % de queries con fuentes externas recuperadas | ≥0.99 |
| Ext Src in Context | % de fuentes externas que llegan al contexto | ≥0.88 |
| Abstention Quality | Calidad de abstención cuando evidencia insuficiente | ≥0.57 |
| Completeness | % de respuestas completas (todos los aspectos cubiertos) | ≥0.91 |
| Avg Latency | Latencia promedio del pipeline (ms) | ≤1,200 |
| P95 Latency | Percentil 95 de latencia (ms) | ≤1,600 |
| Avg Tokens | Tokens promedio por respuesta | ~9,350 |
| Complex P@5 | Precision para queries complejas (40 casos) | ≥0.29 |
| Complex Completeness | Completeness para queries complejas | ≥0.84 |
| Judge Faithfulness* | Fidelidad de respuesta al contexto (1-5) | ≥4.0 |
| Judge Completeness* | Cobertura de todos los aspectos (1-5) | ≥3.5 |
| Judge Relevance* | Relevancia de la respuesta (1-5) | ≥4.0 |
| Judge Citation* | Calidad de citaciones (1-5) | ≥3.5 |
| Judge Clarity* | Claridad y estructura (1-5) | ≥4.0 |
| Judge Composite* | Promedio de las 5 dimensiones (1-5) | ≥3.8 |

*Métricas de Judge requieren `--judge` flag. Usan Haiku como evaluador + Sonnet para generar respuestas.

### Resultados Actuales (Post v3.1 Sprint)

```
P@5 adj:          0.884    Ext Src Retrieved: 0.993
Recall@5:         0.558    Ext Src in Context: 0.886
MRR:              0.383    Abstention:         0.574
Completeness:     0.913    Avg Latency:        1,094ms
Complex P@5:      0.290    P95 Latency:        1,549ms
```

### Smoke Tests (10 queries)

Cada smoke test verifica: artículos esperados en contexto, contenido presente, latencia bajo umbral, confidence_level presente, fuentes externas cuando se esperan. Exit code 0 = 10/10 pass.

### Cómo agregar test cases

1. Agregar al array `SMOKE_TESTS` en `eval/smoke-test.ts` para smoke tests
2. Agregar al array en `eval/dataset.json` para evaluación completa
3. Campos requeridos: `id`, `category`, `difficulty`, `question`, `expected_articles[]`, `expected_answer_contains[]`

---

## Permisos Pre-configurados (`.claude/settings.json`)

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run build)",
      "Bash(npx tsc --noEmit)",
      "Bash(git *)",
      "Bash(ls *)",
      "Bash(wc *)",
      "Bash(npm run lint *)",
      "Bash(npm run build *)",
      "Bash(npx *)"
    ]
  }
}
```
