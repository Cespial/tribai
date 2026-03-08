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
import { ProposalConstellation } from "@/components/landing/hero-diagram-proposals";
import { PhoneMockupSection } from "@/components/landing/phone-mockup-section";
import { BrainGraphSection } from "@/components/landing/brain-graph-section";

export const metadata: Metadata = {
  title: "tribai.co — Inteligencia tributaria colombiana",
  description:
    "Resuelva tributaria colombiana con rigor: 35 calculadoras, 1.294 artículos del Estatuto Tributario, asistente IA con citación de fuentes. Sin costo. Sin registro.",
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
};

/* ── Three Pillars ── */
const PILLARS = [
  {
    icon: TribaiIconAI,
    title: "Asistente IA con fuentes",
    description:
      "Pregunte como le preguntaría a un colega. Reciba respuesta con el artículo exacto del ET, doctrina DIAN y jurisprudencia. Si no tiene evidencia, se lo dice.",
    href: "/asistente",
    cta: "Hacer una consulta",
    stat: "36K",
    statLabel: "fuentes",
    featured: true,
  },
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

export default function Home() {
  return (
    <main id="main-content" className="hero-grid-bg min-h-screen bg-background pb-20 md:pb-0">
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
        className="bg-background px-6 pb-10 pt-12 md:px-12 md:pb-24 md:pt-16 lg:px-20"
      >
        <div className="mx-auto flex max-w-[960px] items-start gap-10 md:gap-12 lg:items-center">
          {/* Left column — text */}
          <div className="hero-stagger w-full shrink-0 md:w-[48%]">
            {/* Eyebrow */}
            <p className="eyebrow-label mb-5">
              Inteligencia tributaria colombiana
            </p>

            <h1
              id="hero-title"
              className="heading-serif text-3xl text-foreground sm:text-4xl md:text-[2.75rem] md:leading-[1.15] md:tracking-[-0.02em]"
            >
              El Estatuto, la calculadora y el criterio.{" "}
              <span className="text-tribai-blue">Todo en uno.</span>
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-foreground-body">
              1.294 artículos del ET, 35 calculadoras de precisión y un
              asistente IA que cita sus fuentes. Sin costo. Sin registro.
            </p>

            {/* CTAs — Pinecone-style bracketed buttons */}
            <div className="mt-8 flex flex-col gap-1 sm:flex-row sm:items-center">
              <div className="hero-btn-bracket">
                <Link
                  href="/asistente"
                  className="inline-flex h-12 items-center justify-center bg-tribai-blue px-7 text-[15px] font-semibold text-white transition-colors hover:bg-tribai-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Preguntarle a la IA
                </Link>
              </div>
              <div className="hero-btn-bracket">
                <Link
                  href="/calculadoras"
                  className="inline-flex h-12 items-center justify-center border border-border px-7 text-[15px] font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Ver calculadoras
                </Link>
              </div>
            </div>

            {/* Launch teaser */}
            <div className="mt-8 flex items-center gap-2.5">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tribai-blue opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-tribai-blue" />
              </span>
              <p className="text-xs text-muted-foreground">
                Disponible ahora — <span className="font-semibold text-foreground">gratis y sin registro</span>
              </p>
            </div>
          </div>

          {/* Right column — constellation diagram, tablet+ */}
          <div className="hidden flex-1 items-center justify-center sm:flex">
            <ProposalConstellation />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2: TRUST — Quick proof strip
          ═══════════════════════════════════════════ */}
      <section aria-label="Garantías de la plataforma" className="border-y border-border bg-background px-6 py-8 md:px-12 md:py-10 lg:px-20">
        <div className="mx-auto flex max-w-[960px] flex-wrap items-center justify-center gap-x-10 gap-y-4 md:justify-between">
          {[
            "Norma vigente 2026",
            "Gratis · Sin registro",
            "Citación de fuentes",
            "UVT $52.374",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-tribai-blue" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground-body">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3: THREE PILLARS — Core value prop
          ═══════════════════════════════════════════ */}
      <section
        aria-labelledby="pillars-title"
        className="bg-background px-6 py-10 md:px-12 md:py-24 lg:px-20"
      >
        <Reveal className="mx-auto max-w-[960px]">
          <p className="eyebrow-label">
            Tres pilares, una plataforma
          </p>
          <h2
            id="pillars-title"
            className="heading-serif mt-4 max-w-3xl text-2xl text-foreground md:text-4xl"
          >
            Todo lo que necesita un contador colombiano. En un solo lugar.
          </h2>

          <div className="mt-12 overflow-hidden rounded-lg border border-border md:grid md:grid-cols-3 md:divide-x md:divide-border">
            {PILLARS.map((pillar, index) => {
              const isFeatured = "featured" in pillar && pillar.featured;
              return (
                <article
                  key={pillar.title}
                  className={`group p-8 ${index < PILLARS.length - 1 ? "border-b border-border md:border-b-0" : ""} ${isFeatured ? "border-l-2 border-l-tribai-blue bg-tribai-blue/[0.06] dark:bg-tribai-blue/[0.08] md:border-l-0 md:border-t-2 md:border-t-tribai-blue" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-md border ${isFeatured ? "border-tribai-blue/30 bg-tribai-blue/10" : "border-border"}`}>
                      <pillar.icon className="h-5 w-5 text-tribai-blue" />
                    </div>
                    <div className="text-right">
                      <span className="font-values text-2xl font-semibold text-foreground">
                        {pillar.stat}
                      </span>
                      <p className="text-xs text-muted-foreground">{pillar.statLabel}</p>
                    </div>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-foreground">
                    {pillar.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-foreground-body">
                    {pillar.description}
                  </p>
                  <Link
                    href={pillar.href}
                    className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 hover:underline ${isFeatured ? "rounded-md bg-tribai-blue px-4 py-2 text-white hover:bg-tribai-blue/90 hover:no-underline focus-visible:ring-offset-2" : "min-h-[44px] items-center text-tribai-blue hover:text-tribai-blue"}`}
                  >
                    {pillar.cta}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4: COMPARISON — Why trust Tribai (early objection handling)
          ═══════════════════════════════════════════ */}
      <ComparisonSection />

      {/* ═══════════════════════════════════════════
          SECTION 5: PERSONAS — "¿Esto es para mí?"
          ═══════════════════════════════════════════ */}
      <section
        aria-labelledby="personas-title"
        className="border-t border-border bg-background px-6 py-10 md:px-12 md:py-24 lg:px-20"
      >
        <Reveal className="mx-auto max-w-[960px]">
          <p className="eyebrow-label">
            Para quién es Tribai
          </p>
          <h2
            id="personas-title"
            className="heading-serif mt-4 max-w-3xl text-2xl text-foreground md:text-4xl"
          >
            Elija su perfil. Le mostramos por dónde empezar.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground-body">
            Cada contador tiene necesidades distintas. Tribai se adapta a su
            realidad — ya sea independiente, en firma, abogado o empresario.
          </p>
          <div className="mt-10">
            <PersonaSwitcher />
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 6: ASISTENTE IA — Live demo (promoted)
          ═══════════════════════════════════════════ */}
      <section
        id="asistente"
        aria-labelledby="asistente-title"
        className="border-t border-border bg-background px-6 py-10 md:px-12 md:py-24 lg:px-20"
      >
        <Reveal className="mx-auto max-w-[960px]" delay={50}>
          <div className="text-center">
            <p className="eyebrow-label">
              Asistente con inteligencia artificial
            </p>
            <h2
              id="asistente-title"
              className="heading-serif mx-auto mt-4 max-w-3xl text-2xl text-foreground md:text-4xl"
            >
              Pregunte como le preguntaría a un colega. Reciba respuesta con artículo.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-foreground-body md:text-lg">
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

          <div className="mt-10 overflow-hidden rounded-lg border border-border bg-card">
            <div className="border-b border-border bg-tribai-navy px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success" />
                <h3 className="text-sm font-semibold text-white/90">
                  Asistente IA — contexto tributario colombiano
                </h3>
              </div>
            </div>
            <div className="h-[360px] sm:h-[500px] md:h-[640px]">
              <LazyChatContainer />
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Sin registro · Sin costo · Herramienta informativa, no constituye asesoría personalizada.
          </p>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 7: WORKFLOW — 3 steps
          ═══════════════════════════════════════════ */}
      <WorkflowSteps />

      {/* ═══════════════════════════════════════════
          SECTION 8: BRAIN GRAPH — Knowledge graph
          ═══════════════════════════════════════════ */}
      <BrainGraphSection />

      {/* ═══════════════════════════════════════════
          SECTION 9: TOOLS + METRICS
          ═══════════════════════════════════════════ */}
      <section
        aria-labelledby="tools-title"
        className="border-t border-border bg-background px-6 py-10 md:px-12 md:py-24 lg:px-20"
      >
        <Reveal className="mx-auto max-w-[960px]">
          <p className="eyebrow-label">
            El arsenal completo
          </p>
          <h2
            id="tools-title"
            className="heading-serif mt-4 max-w-3xl text-2xl text-foreground md:text-4xl"
          >
            Más que calculadoras. Una plataforma tributaria integral.
          </h2>

          <div className="mt-12 overflow-hidden rounded-lg border border-border">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS.map((tool, index) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`group block p-7 transition-colors hover:bg-muted-section ${
                    index < TOOLS.length - 1 ? "border-b border-border" : ""
                  } ${
                    index % 3 !== 2 ? "lg:border-r lg:border-border" : ""
                  } ${
                    index % 2 === 0 ? "sm:border-r sm:border-border" : ""
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

          {/* Metrics — integrated into tools section */}
          <div className="mt-16">
            <MetricsSection />
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 10: APP PREVIEW — iPhone mockup
          ═══════════════════════════════════════════ */}
      <PhoneMockupSection />

      {/* ═══════════════════════════════════════════
          SECTION 11: FAQ
          ═══════════════════════════════════════════ */}
      <FaqSection items={FAQ_ENTRIES} />

      {/* ═══════════════════════════════════════════
          SECTION 12: FINAL CTA
          ═══════════════════════════════════════════ */}
      <section
        aria-labelledby="cta-final-title"
        className="section-navy px-6 py-10 md:px-12 md:py-24 lg:px-20"
      >
        <Reveal className="mx-auto max-w-3xl text-center" delay={50}>
          <h2
            id="cta-final-title"
            className="heading-serif text-2xl text-white md:text-4xl"
          >
            Resuelva su primera consulta. Ahora mismo.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/80 md:text-lg">
            Sin registro. Sin costo. Con el rigor que su profesión exige.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/asistente"
              className="btn-primary h-12 px-6"
            >
              Empezar ahora — es gratis
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/calculadoras"
              className="btn-secondary h-12 border-white/20 px-6 text-white hover:border-white/40 hover:bg-white/10"
            >
              Ver calculadoras
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/50">
            Herramienta de apoyo tributario. No constituye asesoría legal personalizada.
          </p>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <section aria-label="Pie de página" className="section-navy px-6 pb-20 pt-14 md:px-12 md:pt-16 lg:px-20">
        <div className="mx-auto max-w-[960px]">
          <FooterLinks />
        </div>
      </section>

      <MobileStickyCta />
    </main>
  );
}
