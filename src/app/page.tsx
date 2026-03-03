import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  TribaiIconET,
  TribaiIconCalculator,
  TribaiIconAI,
  TribaiIconCalendar,
  TribaiIconBalance,
  TribaiIconTarget,
  TribaiIconComparador,
  TribaiIconGuias,
  TribaiIconWorkspace,
} from "@/components/icons/tribai-icons";
import { Header } from "@/components/layout/header";
import { PersonaSwitcher } from "@/components/landing/persona-switcher";
import { WorkflowSteps } from "@/components/landing/workflow-steps";
import { MetricsSection } from "@/components/landing/metrics-section";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FooterLinks } from "@/components/landing/footer-links";
import { MobileStickyCta } from "@/components/landing/mobile-sticky-cta";
import { LazyChatContainer } from "@/components/landing/lazy-chat-container";
import { Reveal } from "@/components/ui/reveal";
import { ChatQuerySuggestions } from "@/components/landing/chat-query-suggestions";

export const metadata: Metadata = {
  title: "tribai.co — Inteligencia tributaria para contadores colombianos",
  description:
    "Resuelva tributaria colombiana en minutos: 35 calculadoras de precisión, 1.294 artículos del Estatuto Tributario y asistente IA con citación de fuentes. Sin costo. Sin registro.",
  alternates: {
    canonical: "https://superapp-tributaria-colombia.vercel.app/",
  },
  keywords: [
    "tribai",
    "tributaria colombia",
    "calculadora renta colombia",
    "retencion en la fuente",
    "estatuto tributario",
    "dian",
    "debo declarar renta",
    "asistente tributario ia",
    "calculadoras tributarias colombia",
    "contadores colombia",
  ],
  openGraph: {
    title: "tribai.co — Inteligencia tributaria colombiana",
    description:
      "El Estatuto, la calculadora y el criterio. Todo en uno. Sin costo.",
    url: "https://superapp-tributaria-colombia.vercel.app/",
    locale: "es_CO",
    type: "website",
    siteName: "tribai.co",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "tribai.co — Inteligencia tributaria colombiana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "tribai.co — Inteligencia tributaria colombiana",
    description:
      "35 calculadoras. 1.294 artículos del ET. IA con fuente normativa. Gratis.",
    images: ["/og-image.png"],
  },
};

/* ── Three Pillars ── */
const PILLARS = [
  {
    icon: TribaiIconET,
    title: "Estatuto Tributario completo",
    description:
      "1.294 artículos indexados, con historial de reformas, artículos relacionados y concordancias. Busque por número, tema o palabra clave.",
    href: "/explorador",
    cta: "Explorar el Estatuto",
    stat: "1.294",
    statLabel: "artículos",
  },
  {
    icon: TribaiIconCalculator,
    title: "Calculadoras de precisión",
    description:
      "35 calculadoras que reflejan la norma vigente 2026. Retención, renta, sanciones, IVA, laboral, patrimonio y más. Cada resultado cita su artículo.",
    href: "/calculadoras",
    cta: "Ver calculadoras",
    stat: "35",
    statLabel: "calculadoras",
  },
  {
    icon: TribaiIconAI,
    title: "Asistente IA con fuentes",
    description:
      "Pregunte como le preguntaría a un colega. Reciba respuesta con el artículo exacto del ET, doctrina DIAN y jurisprudencia. Si no tiene evidencia, se lo dice.",
    href: "/asistente",
    cta: "Hacer una consulta",
    stat: "36K",
    statLabel: "fuentes",
  },
];

/* ── Tools Grid ── */
const TOOLS = [
  {
    icon: TribaiIconCalendar,
    title: "Calendario DIAN 2026",
    description: "Vencimientos por NIT, alertas y exportación a calendario.",
    href: "/calendario",
  },
  {
    icon: TribaiIconBalance,
    title: "Doctrina DIAN",
    description: "841 conceptos curados, clasificados y vinculados al ET.",
    href: "/doctrina",
  },
  {
    icon: TribaiIconTarget,
    title: "Indicadores económicos",
    description: "UVT, SMLMV, inflación y tasas con histórico desde 2006.",
    href: "/indicadores",
  },
  {
    icon: TribaiIconComparador,
    title: "Comparador de artículos",
    description: "Compare versiones históricas y vea qué cambió en cada reforma.",
    href: "/comparar",
  },
  {
    icon: TribaiIconGuias,
    title: "Guías interactivas",
    description: "Árboles de decisión para determinar obligaciones paso a paso.",
    href: "/guias",
  },
  {
    icon: TribaiIconWorkspace,
    title: "Espacio de trabajo",
    description: "Favoritos, notas y workspaces organizados por cliente.",
    href: "/favoritos",
  },
];

/* ── FAQ ── */
const FAQ_ENTRIES = [
  {
    question: "¿La IA inventa artículos o usa fuentes reales?",
    answer:
      "Usa fuentes reales. Nuestro asistente busca en una base de 36.000 vectores que incluyen el Estatuto Tributario completo, doctrina DIAN, jurisprudencia y decretos. Cada respuesta muestra el artículo exacto de donde sale. Si no encuentra suficiente evidencia, se lo dice con transparencia.",
  },
  {
    question: "¿Está actualizado con las normas y el UVT de 2026?",
    answer:
      "Sí. Todas las calculadoras reflejan el UVT 2026 ($52.374), el SMLMV ($1.750.905) y las tarifas vigentes. El calendario incluye todas las obligaciones del año gravable 2026, incluidos los plazos del Decreto 1474.",
  },
  {
    question: "¿Reemplaza mi criterio profesional?",
    answer:
      "No. Tribai es su herramienta de apoyo. Acelera búsquedas, automatiza cálculos y sustenta respuestas con fuentes normativas. Pero el criterio profesional siempre es suyo. Cada resultado lo dice explícitamente.",
  },
  {
    question: "¿Por qué es gratuito?",
    answer:
      "Porque el Estatuto Tributario es público. La doctrina DIAN es pública. Nuestro trabajo es organizar esa información, conectarla inteligentemente y hacerla útil. Creemos que la información tributaria no debería tener paywall.",
  },
  {
    question: "¿Puedo usarlo para mis clientes?",
    answer:
      "Sí. Calculadoras, artículos y consultas al asistente se pueden usar directamente para resolver casos de clientes. Los resultados incluyen siempre el artículo y la norma para que usted valide y sustente.",
  },
  {
    question: "¿Mis datos quedan almacenados?",
    answer:
      "Tribai no requiere registro ni almacena datos personales. Las consultas al asistente IA se procesan en tiempo real. Los favoritos y notas se guardan localmente en su navegador.",
  },
];

/* ── JSON-LD ── */
const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "tribai.co",
  url: "https://superapp-tributaria-colombia.vercel.app/",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "es-CO",
  offers: { "@type": "Offer", price: "0", priceCurrency: "COP" },
  description:
    "Plataforma de inteligencia tributaria colombiana con calculadoras, Estatuto Tributario y asistente IA con citación de fuentes.",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ENTRIES.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

/* ── Hero flow diagram ── */
function HeroFlowDiagram() {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      className="hidden h-auto w-full max-w-md opacity-80 md:block"
      aria-hidden="true"
    >
      {/* Connection lines */}
      <line x1="100" y1="80" x2="200" y2="150" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <line x1="200" y1="150" x2="300" y2="80" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <line x1="200" y1="150" x2="200" y2="240" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />

      {/* Arrows */}
      <path d="M185 135l15 15 15-15" stroke="currentColor" strokeWidth="1.2" opacity="0.3" fill="none" />
      <path d="M195 225l5 15 5-15" stroke="currentColor" strokeWidth="1.2" opacity="0.3" fill="none" />

      {/* Node: Pregunta */}
      <circle cx="100" cy="80" r="28" stroke="currentColor" strokeWidth="1.2" opacity="0.15" fill="none" />
      <circle cx="100" cy="80" r="4" fill="var(--tribai-blue)" opacity="0.6" />
      <text x="100" y="125" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="500" opacity="0.5">Pregunta</text>

      {/* Node: IA (center, active) */}
      <circle cx="200" cy="150" r="32" stroke="var(--tribai-blue)" strokeWidth="1.5" opacity="0.3" fill="none" />
      <circle cx="200" cy="150" r="6" fill="var(--tribai-blue)" />
      <text x="200" y="195" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="600" opacity="0.7">Búsqueda IA</text>

      {/* Node: Fuentes */}
      <circle cx="300" cy="80" r="28" stroke="currentColor" strokeWidth="1.2" opacity="0.15" fill="none" />
      <circle cx="300" cy="80" r="4" fill="var(--tribai-blue)" opacity="0.6" />
      <text x="300" y="125" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="500" opacity="0.5">36K fuentes</text>

      {/* Node: Respuesta */}
      <circle cx="200" cy="250" r="28" stroke="var(--tribai-blue)" strokeWidth="1.2" opacity="0.2" fill="none" />
      <circle cx="200" cy="250" r="4" fill="var(--tribai-blue)" opacity="0.6" />
      <text x="200" y="290" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="500" opacity="0.5">Respuesta + Art.</text>
    </svg>
  );
}

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ═══════════════════════════════════════════
          SECTION 1: HERO — Split layout light
          ═══════════════════════════════════════════ */}
      <section
        aria-labelledby="hero-title"
        className="bg-background px-6 pb-32 pt-24 md:px-8 md:pb-40 md:pt-32"
      >
        <div className="mx-auto flex max-w-6xl items-center gap-16">
          <div className="hero-stagger w-full max-w-2xl">
            {/* Narrative hook */}
            <p className="mb-4 text-sm font-medium tracking-wide text-muted-foreground md:text-base">
              ¿Cuántas pestañas abiertas tiene ahora mismo?
            </p>

            <h1
              id="hero-title"
              className="heading-serif max-w-4xl text-4xl text-foreground sm:text-5xl md:text-7xl"
            >
              Inteligencia tributaria para contadores que no improvisan.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              El Estatuto Tributario completo, 35 calculadoras de precisión y un
              asistente IA que cita sus fuentes. Todo en un solo lugar. Sin
              costo. Hecho en Colombia para contadores colombianos.
            </p>

            {/* Proof badges */}
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "1.294 artículos del ET",
                "35 calculadoras · 2026",
                "IA con fuente normativa",
                "Sin registro · Gratuito",
              ].map((badge) => (
                <span
                  key={badge}
                  className="rounded-md border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground"
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/calculadoras/debo-declarar"
                className="btn-primary h-12 px-6"
              >
                Calcule si debe declarar renta
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="#asistente"
                className="btn-secondary h-12 px-6"
              >
                Pregúntele al asistente IA
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2" aria-hidden="true">
                {[
                  "bg-tribai-blue",
                  "bg-tribai-blue/60",
                  "bg-tribai-light-blue",
                  "bg-tribai-blue/40",
                ].map((bg, i) => (
                  <div
                    key={i}
                    className={`h-7 w-7 rounded-full border-2 border-background ${bg}`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Más de <span className="font-semibold text-foreground">500 contadores</span> lo usan cada semana
              </p>
            </div>
          </div>

          {/* Flow diagram — desktop only */}
          <div className="hidden flex-1 items-center justify-center md:flex">
            <HeroFlowDiagram />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2: TRUST — Quick proof strip
          ═══════════════════════════════════════════ */}
      <section className="border-y border-border bg-background px-6 py-14 md:px-8 md:py-18">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 md:justify-between">
          {[
            { value: "1.294", label: "artículos del ET" },
            { value: "35", label: "calculadoras · 2026" },
            { value: "841", label: "conceptos DIAN" },
            { value: "36K", label: "fuentes normativas" },
          ].map(({ value, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <span className="font-values text-lg font-semibold text-foreground">{value}</span>
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3: THREE PILLARS — Core value prop
          ═══════════════════════════════════════════ */}
      <section
        aria-labelledby="pillars-title"
        className="bg-background px-6 py-32 md:px-8 md:py-40"
      >
        <Reveal className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-tribai-blue">
            El Estatuto, la calculadora y el criterio
          </p>
          <h2
            id="pillars-title"
            className="heading-serif mt-3 max-w-3xl text-3xl text-foreground md:text-5xl"
          >
            Estatuto Tributario, calculadoras fiscales e inteligencia artificial. En una sola plataforma.
          </h2>

          <div className="mt-20 overflow-hidden rounded-lg border border-border md:grid md:grid-cols-3 md:divide-x md:divide-border">
            {PILLARS.map((pillar, index) => (
              <div
                key={pillar.title}
                className={`group p-8 ${index < PILLARS.length - 1 ? "border-b border-border md:border-b-0" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md border border-border">
                    <pillar.icon className="h-5 w-5 text-tribai-blue" />
                  </div>
                  <div className="text-right">
                    <span className="font-values text-2xl font-semibold text-foreground">
                      {pillar.stat}
                    </span>
                    <p className="text-xs text-muted-foreground">{pillar.statLabel}</p>
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
                <Link
                  href={pillar.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-tribai-blue transition-colors hover:text-tribai-blue/80"
                >
                  {pillar.cta}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4: PERSONAS — "¿Esto es para mí?"
          ═══════════════════════════════════════════ */}
      <section
        aria-labelledby="personas-title"
        className="bg-muted/30 px-6 py-32 md:px-8 md:py-40"
      >
        <Reveal className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-tribai-blue">
            Para quién es Tribai
          </p>
          <h2
            id="personas-title"
            className="heading-serif mt-3 max-w-3xl text-3xl text-foreground md:text-5xl"
          >
            Elija su perfil. Le mostramos por dónde empezar.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Cada contador tiene necesidades distintas. Tribai se adapta a su
            realidad — ya sea independiente, en firma, abogado o empresario.
          </p>
          <div className="mt-10">
            <PersonaSwitcher />
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5: WORKFLOW — 3 steps
          ═══════════════════════════════════════════ */}
      <WorkflowSteps />

      {/* ═══════════════════════════════════════════
          SECTION 6: TOOLS GRID — "¿Qué más tiene?"
          ═══════════════════════════════════════════ */}
      <section
        aria-labelledby="tools-title"
        className="bg-muted/30 px-6 py-32 md:px-8 md:py-40"
      >
        <Reveal className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-tribai-blue">
            El arsenal completo
          </p>
          <h2
            id="tools-title"
            className="heading-serif mt-3 max-w-3xl text-3xl text-foreground md:text-5xl"
          >
            Más que calculadoras. Una plataforma tributaria integral.
          </h2>

          <div className="mt-20 overflow-hidden rounded-lg border border-border">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS.map((tool, index) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`group block p-6 transition-colors hover:bg-muted ${
                    index < 3 ? "border-b border-border" : ""
                  } ${
                    index % 3 !== 2 ? "lg:border-r lg:border-border" : ""
                  } ${
                    index % 2 === 0 ? "sm:border-r sm:border-border" : ""
                  } ${
                    index < 4 ? "sm:border-b sm:border-border" : ""
                  } sm:last:border-b-0`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border">
                    <tool.icon className="h-5 w-5 text-tribai-blue" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {tool.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {tool.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 7: METRICS — Hard numbers
          ═══════════════════════════════════════════ */}
      <section
        aria-labelledby="metrics-title"
        className="bg-background px-6 py-32 md:px-8 md:py-40"
      >
        <Reveal className="mx-auto max-w-6xl" delay={50}>
          <MetricsSection />
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 8: ASISTENTE IA — Live demo
          ═══════════════════════════════════════════ */}
      <section
        id="asistente"
        aria-labelledby="asistente-title"
        className="bg-muted/30 px-6 py-32 md:px-8 md:py-40"
      >
        <Reveal className="mx-auto max-w-6xl" delay={50}>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-tribai-blue">
              Asistente con inteligencia artificial
            </p>
            <h2
              id="asistente-title"
              className="heading-serif mx-auto mt-3 max-w-3xl text-3xl text-foreground md:text-5xl"
            >
              Pregunte como le preguntaría a un colega. Reciba respuesta con artículo.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Consulte artículos del ET, sanciones, retención e interpretación
              práctica. La IA busca en 36.000 fuentes normativas y le muestra
              exactamente de dónde sale cada respuesta.
            </p>
          </div>

          <ChatQuerySuggestions
            queries={[
              "¿Debo declarar renta por ingresos de 2025?",
              "¿Cómo calculo retención en la fuente por salarios?",
              "¿Qué sanción aplica por declarar extemporáneo?",
              "Muéstreme el artículo del ET sobre ganancias ocasionales.",
            ]}
          />

          <div className="mt-10 overflow-hidden rounded-lg border border-border bg-background">
            <div className="border-b border-border bg-muted/30 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-tribai-blue" />
                <h3 className="text-sm font-semibold text-foreground">
                  Asistente IA — contexto tributario colombiano
                </h3>
              </div>
            </div>
            <div className="h-[360px] sm:h-[500px] md:h-[620px]">
              <LazyChatContainer />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 9: COMPARISON — Rigor
          ═══════════════════════════════════════════ */}
      <ComparisonSection />

      {/* ═══════════════════════════════════════════
          SECTION 10: FAQ
          ═══════════════════════════════════════════ */}
      <FaqSection items={FAQ_ENTRIES} />

      {/* ═══════════════════════════════════════════
          SECTION 11: FINAL CTA
          ═══════════════════════════════════════════ */}
      <section
        aria-labelledby="cta-final-title"
        className="bg-muted/30 px-6 py-32 md:px-8 md:py-40"
      >
        <Reveal className="mx-auto max-w-3xl text-center" delay={50}>
          <h2
            id="cta-final-title"
            className="heading-serif text-3xl text-foreground md:text-5xl lg:text-6xl"
          >
            Resuelva su primera consulta. Ahora mismo.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            Sin registro. Sin costo. Con el rigor que su profesión exige.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/calculadoras"
              className="btn-primary h-12 px-6"
            >
              Explorar calculadoras
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/asistente"
              className="btn-secondary h-12 px-6"
            >
              Preguntarle a la IA
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Hecho en Colombia para contadores colombianos.
          </p>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <section className="border-t border-border bg-muted/30 px-6 pb-20 pt-14 md:px-8 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <FooterLinks />
        </div>
      </section>

      <MobileStickyCta />
    </main>
  );
}
