import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CalendarClock,
  MessageSquareText,
  Scale,
  ShieldCheck,
  Target,
  FileSearch,
  Bookmark,
  Zap,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { HeroVideo } from "@/components/hero/hero-video";
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
    icon: BookOpen,
    title: "Estatuto Tributario completo",
    description:
      "1.294 artículos indexados, con historial de reformas, artículos relacionados y concordancias. Busque por número, tema o palabra clave.",
    href: "/explorador",
    cta: "Explorar el Estatuto",
    stat: "1.294",
    statLabel: "artículos",
  },
  {
    icon: Calculator,
    title: "Calculadoras de precisión",
    description:
      "35 calculadoras que reflejan la norma vigente 2026. Retención, renta, sanciones, IVA, laboral, patrimonio y más. Cada resultado cita su artículo.",
    href: "/calculadoras",
    cta: "Ver calculadoras",
    stat: "35",
    statLabel: "calculadoras",
  },
  {
    icon: MessageSquareText,
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
    icon: CalendarClock,
    title: "Calendario DIAN 2026",
    description: "Vencimientos por NIT, alertas y exportación a calendario.",
    href: "/calendario",
  },
  {
    icon: Scale,
    title: "Doctrina DIAN",
    description: "841 conceptos curados, clasificados y vinculados al ET.",
    href: "/doctrina",
  },
  {
    icon: Target,
    title: "Indicadores económicos",
    description: "UVT, SMLMV, inflación y tasas con histórico desde 2006.",
    href: "/indicadores",
  },
  {
    icon: FileSearch,
    title: "Comparador de artículos",
    description: "Compare versiones históricas y vea qué cambió en cada reforma.",
    href: "/comparar",
  },
  {
    icon: ShieldCheck,
    title: "Guías interactivas",
    description: "Árboles de decisión para determinar obligaciones paso a paso.",
    href: "/guias",
  },
  {
    icon: Bookmark,
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

export default function Home() {
  return (
    <main className="min-h-screen bg-background pb-20 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ═══════════════════════════════════════════
          SECTION 1: HERO — Pain recognition + solution
          ═══════════════════════════════════════════ */}
      <section
        aria-labelledby="hero-title"
        className="relative min-h-[92svh] overflow-hidden"
        style={{ background: "var(--tribai-navy)" }}
      >
        <HeroVideo />

        <div className="relative z-20">
          <Header variant="transparent" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[92svh] w-full max-w-6xl items-end px-6 pb-20 pt-28 md:px-8 md:pb-28">
          <div>
            {/* Narrative hook */}
            <p className="mb-4 text-sm font-medium tracking-wide text-white/50 md:text-base">
              ¿Cuántas pestañas abiertas tiene ahora mismo?
            </p>

            <h1
              id="hero-title"
              className="heading-serif max-w-4xl text-4xl text-white sm:text-5xl md:text-7xl"
            >
              Inteligencia tributaria para contadores que no improvisan.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
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
                  className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm"
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/calculadoras/debo-declarar"
                className="inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-tribai-navy transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Calcule si debe declarar renta
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="#asistente"
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/25 bg-white/5 px-6 text-sm font-medium text-white transition hover:border-white/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Pregúntele al asistente IA
              </Link>
            </div>

            <p className="mt-3 text-xs font-medium tracking-wide text-white/40">
              Sin registro. Sin costo. Con fuente del Estatuto.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2: TRUST — Quick proof strip
          ═══════════════════════════════════════════ */}
      <section className="border-b border-border bg-background px-6 py-10 md:px-8 md:py-14">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { icon: BookOpen, text: "1.294 artículos del ET indexados y consultables" },
            { icon: Scale, text: "841 conceptos DIAN vinculados para sustento técnico" },
            { icon: Zap, text: "Acceso gratuito y actualizado para 2026" },
            { icon: Target, text: "Hecho en Colombia para contadores colombianos" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tribai-blue/10">
                <Icon className="h-4 w-4 text-tribai-blue" aria-hidden="true" />
              </div>
              <p className="text-sm leading-snug text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3: THREE PILLARS — Core value prop
          ═══════════════════════════════════════════ */}
      <section
        aria-labelledby="pillars-title"
        className="bg-background px-6 py-20 md:px-8 md:py-28"
      >
        <Reveal className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-tribai-blue">
            El Estatuto, la calculadora y el criterio
          </p>
          <h2
            id="pillars-title"
            className="heading-serif mt-3 max-w-3xl text-3xl text-foreground md:text-5xl"
          >
            Todo lo que necesita para resolver tributaria colombiana. En un solo lugar.
          </h2>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="group rounded-xl border border-border bg-card p-7 transition hover:border-tribai-blue/30 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-tribai-blue/10">
                    <pillar.icon className="h-5 w-5 text-tribai-blue" aria-hidden="true" />
                  </div>
                  <div className="text-right">
                    <span className="font-values text-2xl font-semibold text-tribai-gold">
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
        className="bg-muted/40 px-6 py-20 md:px-8 md:py-28"
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
        className="bg-muted/40 px-6 py-20 md:px-8 md:py-28"
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

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-xl border border-border bg-card p-6 transition hover:border-tribai-blue/30 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tribai-blue/10">
                  <tool.icon className="h-5 w-5 text-tribai-blue" aria-hidden="true" />
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
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 7: METRICS — Hard numbers
          ═══════════════════════════════════════════ */}
      <section
        aria-labelledby="metrics-title"
        className="bg-background px-6 py-20 md:px-8 md:py-28"
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
        className="section-navy px-6 py-20 md:px-8 md:py-28"
      >
        <Reveal className="mx-auto max-w-6xl" delay={50}>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-tribai-gold">
              Asistente con inteligencia artificial
            </p>
            <h2
              id="asistente-title"
              className="heading-serif mx-auto mt-3 max-w-3xl text-3xl text-white md:text-5xl"
            >
              Pregunte como le preguntaría a un colega. Reciba respuesta con artículo.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
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

          <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-background shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="border-b border-border/50 bg-muted/30 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-tribai-gold" />
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
        className="section-navy px-6 py-20 md:px-8 md:py-28"
      >
        <Reveal className="mx-auto max-w-3xl text-center" delay={50}>
          <h2
            id="cta-final-title"
            className="heading-serif text-3xl text-white md:text-5xl lg:text-6xl"
          >
            Resuelva su primera consulta. Ahora mismo.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/60 md:text-lg">
            Sin registro. Sin costo. Con el rigor que su profesión exige.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/calculadoras"
              className="inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-tribai-navy transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Explorar calculadoras
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/asistente"
              className="inline-flex h-12 items-center justify-center rounded-md border border-white/25 bg-white/5 px-6 text-sm font-medium text-white transition hover:border-white/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Preguntarle a la IA
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/30">
            Hecho en Colombia para contadores colombianos.
          </p>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <section className="section-navy border-t border-white/5 px-6 pb-20 pt-14 md:px-8 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <FooterLinks />
        </div>
      </section>

      <MobileStickyCta />
    </main>
  );
}
