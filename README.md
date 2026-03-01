# SuperApp Tributaria Colombia

La plataforma tributaria mas completa de Colombia. 35 calculadoras fiscales, los 1,294 articulos del Estatuto Tributario indexados y navegables, asistente IA con RAG avanzado, doctrina DIAN, calendario fiscal 2026, indicadores economicos, guias interactivas, glosario y herramientas de productividad profesional.

**Live:** [superapp-tributaria-colombia.vercel.app](https://superapp-tributaria-colombia.vercel.app)

## Funcionalidades

### Asistente IA (RAG v3.1)

Pipeline RAG de 9 modulos con recuperacion multi-hop, confidence scoring y formato dictamen auditado.

- Consulta inteligente de los 1,294 articulos del Estatuto Tributario + ~20K documentos externos
- Multi-hop retrieval (2 rondas) con 5 namespaces de Pinecone
- Query routing dinamico por tipo (factual, comparative, procedural, temporal, doctrina, sanciones)
- Evidence checker con confidence scoring, deteccion de contradicciones y quality metrics
- Formato dictamen adaptativo: Resumen, Hechos, Normas, Analisis, Riesgos, Recomendacion, Fuentes
- Inyeccion dinamica de calculadoras relevantes por keyword
- Early-exit para lookups directos de articulos (<100ms)
- Fallback automatico OpenAI cuando Anthropic alcanza limites
- Cache LRU de respuestas (500 entries, 24h TTL) + cache de embeddings (2,000 entries)
- Circuit breaker para Pinecone con modo degradado resiliente

**Metricas RAG:** P@5 = 0.89 | Recall@5 = 0.93 | MRR = 0.85 | P95 latency = 1,488ms

### 35 Calculadoras Tributarias

| Categoria | Calculadoras |
|-----------|-------------|
| **Impuestos Nacionales** | Renta PN, Renta PJ, GMF (4x1000), IVA, Impuesto al Consumo, Patrimonio, Timbre, Dividendos PN, Dividendos PJ, Ganancias Ocasionales, Ganancias Loterias |
| **Retenciones** | Retencion en la Fuente, Retencion Salarios Proc. 1 |
| **Regimen SIMPLE** | SIMPLE (RST) con comparativo vs ordinario, Comparador de Regimenes |
| **Sanciones** | Extemporaneidad, Sanciones Ampliadas (no declarar, correccion, inexactitud), Intereses Moratorios DIAN |
| **Laboral y SS** | Seguridad Social (4 tipos cotizante), Liquidacion Laboral, Horas Extras, Nomina Completa, Licencia Maternidad, Pension |
| **Planeacion Fiscal** | Anticipo de Renta, Beneficio Auditoria, Depreciacion Fiscal, Descuentos Tributarios, Comparacion Patrimonial, Zonas Francas |
| **Herramientas** | Conversor UVT, Comparador Contratacion, Debo Declarar?, ICA Municipal |

### Herramientas de Referencia

- **Calendario Tributario 2026** — Vencimientos con filtros por obligacion y digito NIT, integracion con calendario personal
- **Tabla de Retencion** — Conceptos, bases y tarifas de retencion en la fuente con calculadora inline
- **Indicadores Economicos** — UVT, SMLMV, inflacion, tasa de usura con graficas historicas (Recharts)
- **Glosario Tributario** — Terminos clave del derecho tributario colombiano A-Z
- **Doctrina DIAN** — Conceptos y oficios curados de la DIAN
- **Novedades Normativas** — Timeline de cambios legislativos y reformas tributarias
- **Guias Interactivas** — Arboles de decision para procesos tributarios comunes

### Explorador del Estatuto Tributario

- Navegacion completa de los 1,294 articulos del ET
- Busqueda por numero, titulo o contenido
- Clasificacion por libros y titulos
- Comparador de articulos (diff entre versiones)
- Knowledge graph interactivo (react-force-graph-2d)
- Dashboard analitico con estadisticas del corpus
- Sistema de favoritos con notas y workspaces de productividad

### App Nativa iOS (SwiftUI)

- 35 calculadoras portadas a SwiftUI nativo
- Explorador del Estatuto Tributario offline
- Chat RAG conectado al backend
- Navegacion con 5 tabs (Home, Calculadoras, ET, Chat, Mas)
- 8 features de contenido (calendario, glosario, indicadores, doctrina, guias, novedades, favoritos, tablas)

## Stack Tecnologico

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.1.6 |
| UI | React | 19.2.3 |
| Estilos | Tailwind CSS v4 (CSS-first) | 4.x |
| Lenguaje | TypeScript (strict) | 5.x |
| IA — LLM | Claude Sonnet 4.5 via Vercel AI SDK | @ai-sdk/anthropic |
| IA — Query rewrite | Claude Haiku 4.5 | |
| IA — Fallback | OpenAI GPT-4o | @ai-sdk/openai |
| IA — Embeddings | multilingual-e5-large (1024d) | Pinecone Inference |
| Vector DB | Pinecone (5 namespaces, ~20K vectors) | SDK 7.x |
| Graficas | Recharts | 3.7 |
| Grafos | react-force-graph-2d | 1.29 |
| Validacion | Zod v4 | |
| Precision | decimal.js (financiera) | |
| PWA | Service Worker + manifest.json | |
| iOS | SwiftUI (Xcode, Swift Package Manager) | |
| Deploy | Vercel | |

## Arquitectura RAG

```
Query → Query Enhancer (rewrite + HyDE + decompose)
      → Namespace Router (classify → routing config)
      → Multi-Namespace Retriever (round 1: ET, round 2: external multi-hop)
      → Graph Retriever (PageRank, community boost)
      → Reranker (heuristic scoring + graph boost)
      → Context Assembler (sibling retrieval + token budget + diversity)
      → Evidence Checker (confidence + contradictions + quality)
      → Prompt Builder (XML context + evidence warnings + calculator injection)
      → LLM (Claude Sonnet 4.5, streaming)
```

## Desarrollo Local

```bash
git clone https://github.com/Cespial/superapp-tributaria-colombia.git
cd superapp-tributaria-colombia

npm install

cp .env.example .env.local
# Configurar: ANTHROPIC_API_KEY, PINECONE_API_KEY, PINECONE_INDEX_NAME
# Opcional: OPENAI_API_KEY (fallback), CHAT_MODEL, LLM_PROVIDER

npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Calidad y Testing

```bash
npm run lint           # ESLint
npm run lint:strict    # Falla con warnings
npm run typecheck      # TypeScript global
npm run verify         # Lint + typecheck + build

npm run smoke-test     # 10 smoke tests con assertions
npm run eval           # 340 queries, 17 metricas
npm run eval:judge     # + LLM Judge (30 queries sample)

npm run data:build     # Rebuild analytics datasets
npm run data:verify    # Verificar integridad de datos
```

## CI/CD

- GitHub Actions: `.github/workflows/ci.yml` → `lint:strict`, `typecheck`, `build`
- Deploy automatico via Vercel (rama `main`)
- Docs: `docs/release-runbook.md`, `docs/vercel-environment-matrix.md`

## Estructura del Proyecto

```
├── src/
│   ├── app/                    # 18 rutas (App Router)
│   │   ├── api/chat/           # Streaming RAG endpoint
│   │   ├── api/health/         # Health check + circuit breaker status
│   │   ├── articulo/[slug]/    # 1,294 paginas SSG
│   │   ├── asistente/          # Chat IA standalone
│   │   ├── calculadoras/       # 35 calculadoras
│   │   ├── calendario/         # Calendario tributario 2026
│   │   ├── comparar/           # Comparador de articulos (diff)
│   │   ├── dashboard/          # Dashboard analitico
│   │   ├── doctrina/           # Doctrina DIAN
│   │   ├── explorador/         # Explorador ET + knowledge graph
│   │   ├── favoritos/          # Bookmarks + notas + workspaces
│   │   ├── glosario/           # Glosario tributario A-Z
│   │   ├── guias/              # Guias interactivas (decision trees)
│   │   ├── indicadores/        # Indicadores economicos
│   │   ├── novedades/          # Novedades normativas
│   │   └── tablas/retencion/   # Tabla de retencion + calculadora inline
│   ├── components/             # ~113 componentes en 18 directorios
│   ├── config/                 # 21 archivos de datos estaticos
│   └── lib/
│       ├── rag/                # Pipeline RAG (9 modulos)
│       ├── cache/              # Response cache LRU
│       ├── pinecone/           # Client + embedder
│       ├── chat/               # System prompt, session memory, history
│       ├── hooks/              # useBookmarks, useNotes, useScrollReveal
│       ├── export/             # JSON, CSV, PDF
│       └── api/                # Rate limiter, Zod validation
├── ios/                        # App nativa SwiftUI
│   ├── SuperAppTributaria/     # Source code
│   ├── Package.swift           # Swift Package Manager
│   └── project.yml             # XcodeGen config
├── eval/                       # Suite de evaluacion RAG
│   ├── run_eval.ts             # 340 queries, 17 metricas
│   └── smoke-test.ts           # 10 integration tests
├── data/                       # Datos del ET + fuentes externas
├── scripts/                    # Build & verify scripts
└── docs/                       # Runbooks y documentacion operativa
```

## Licencia

Proyecto privado.
