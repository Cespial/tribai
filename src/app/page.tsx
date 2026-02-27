import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Landmark,
  Layers,
  Percent,
  Receipt,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { HeroVideo } from "@/components/hero/hero-video";
import { TrustStrip } from "@/components/landing/trust-strip";
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
  title: "Tributaria Colombia | Calculadoras, ET e IA para Colombia",
  description:
    "Resuelva su tributaria en minutos: 35 calculadoras, 1.294 articulos del Estatuto Tributario, calendario DIAN 2026 y asistente IA con fuentes.",
  alternates: {
    canonical: "https://superapp-tributaria-colombia.vercel.app/",
  },
  keywords: [
    "tributaria colombia",
    "calculadora renta colombia",
    "retencion en la fuente",
    "estatuto tributario",
    "dian",
    "debo declarar renta",
    "asistente tributario ia",
  ],
  openGraph: {
    title: "Tributaria Colombia | Superapp tributaria para Colombia",
    description:
      "Calcule, consulte y sustente decisiones tributarias con calculadoras, ET e IA en un solo lugar.",
    url: "https://superapp-tributaria-colombia.vercel.app/",
    locale: "es_CO",
    type: "website",
    siteName: "SuperApp Tributaria Colombia",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tributaria Colombia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tributaria Colombia | Calculadoras y ET con IA",
    description:
      "Valide renta, retencion, IVA y obligaciones DIAN 2026 en minutos.",
    images: ["/og-image.png"],
  },
};

const QUICK_ACCESS = [
  {
    href: "/calculadoras/debo-declarar",
    title: "Debo declarar renta",
    description:
      "Valide topes y condiciones para saber si esta obligado a declarar.",
    icon: CheckCircle2,
  },
  {
    href: "/calculadoras/renta",
    title: "Renta personas naturales",
    description: "Liquide impuesto de renta segun reglas vigentes del ET.",
    icon: Landmark,
  },
  {
    href: "/calculadoras/retencion",
    title: "Retencion en la fuente",
    description: "Calcule retencion por concepto, monto y tarifa aplicable.",
    icon: Receipt,
  },
  {
    href: "/calculadoras/iva",
    title: "IVA",
    description: "Simule el valor de IVA y contraste escenarios rapidamente.",
    icon: Percent,
  },
  {
    href: "/calculadoras/simple",
    title: "Regimen SIMPLE",
    description:
      "Estime impuesto unificado por actividad economica y periodicidad.",
    icon: Layers,
  },
  {
    href: "/calculadoras/comparador",
    title: "Comparador de contratacion",
    description: "Compare laboral, integral y servicios para tomar decisiones.",
    icon: Users,
  },
];

const FAQ_ENTRIES = [
  {
    question: "La plataforma tiene costo?",
    answer:
      "Puede empezar gratis y usar calculadoras, explorador y asistente para resolver consultas frecuentes.",
  },
  {
    question: "Reemplaza la asesoria de un contador o abogado?",
    answer:
      "No. Es una herramienta de apoyo tecnico para acelerar analisis y reducir errores operativos.",
  },
  {
    question: "Cada cuanto actualizan la informacion?",
    answer:
      "Se actualiza de forma continua con foco en normativa y contenido tributario colombiano vigente.",
  },
  {
    question: "Sirve si soy persona natural?",
    answer:
      "Si. Puede empezar por 'Debo declarar renta?' y seguir con calculadoras especificas para su caso.",
  },
  {
    question: "Las respuestas del asistente traen fuente?",
    answer:
      "Si. El asistente prioriza articulos del ET y contexto normativo para que usted valide.",
  },
  {
    question: "Puedo usarla con mi equipo?",
    answer:
      "Si. Panel de control, favoritos y herramientas compartidas facilitan trabajo estandar.",
  },
];

const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SuperApp Tributaria Colombia",
  url: "https://superapp-tributaria-colombia.vercel.app/",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "es-CO",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "COP",
  },
  description:
    "Superapp tributaria para Colombia con calculadoras, explorador del Estatuto Tributario, calendario DIAN y asistente IA con fuentes.",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ENTRIES.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
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

      <section
        aria-labelledby="hero-title"
        className="relative min-h-[92svh] overflow-hidden bg-black"
      >
        <HeroVideo />

        <div className="relative z-20">
          <Header variant="transparent" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[92svh] w-full max-w-6xl items-end px-6 pb-24 pt-28 md:px-8 md:pb-28">
          <div>
            <h1
              id="hero-title"
              className="heading-serif max-w-3xl text-4xl text-white sm:text-5xl md:text-7xl lg:text-[5.5rem]"
            >
              Toda su tributaria colombiana en un solo lugar. Sin enredos.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
              Calcule renta, retencion, IVA y mas. Consulte el Estatuto
              Tributario con IA y valide vencimientos DIAN 2026 desde una sola
              plataforma gratuita. Hecho en Colombia para profesionales colombianos.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur">
                35 calculadoras listas
              </span>
              <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur">
                1.294 articulos del ET
              </span>
              <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur">
                Calendario fiscal 2026
              </span>
              <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur">
                Asistente IA 24/7
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/calculadoras/debo-declarar"
                className="inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Calcule si debe declarar renta
              </Link>
              <Link
                href="#asistente"
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/35 bg-white/5 px-6 text-sm font-medium text-white transition hover:border-white/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Haga una consulta al asistente IA
              </Link>
            </div>

            <p className="mt-3 text-xs font-medium tracking-[0.03em] text-white/70">
              Sin registro. Sin costo. Con fuente del Estatuto.
            </p>
          </div>
        </div>
      </section>

      <TrustStrip />

      <section aria-labelledby="personas-title" className="bg-background px-6 py-16 md:px-8 md:py-24">
        <Reveal className="mx-auto max-w-6xl">
          <h2
            id="personas-title"
            className="heading-serif max-w-3xl text-3xl text-foreground md:text-5xl"
          >
            Elija su perfil. Le mostramos por donde empezar.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Tributaria Colombia prioriza necesidades reales de contadores,
            empresarios, abogados y declarantes.
          </p>
          <div className="mt-10">
            <PersonaSwitcher />
          </div>
        </Reveal>
      </section>

      <WorkflowSteps />

      <section
        id="calculadoras"
        aria-labelledby="calculadoras-title"
        className="bg-background px-6 py-16 md:px-8 md:py-24"
      >
        <Reveal className="mx-auto max-w-6xl">
          <h2
            id="calculadoras-title"
            className="heading-serif text-3xl text-foreground md:text-5xl"
          >
            Las calculadoras que mas usan los contadores colombianos.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Creadas desde cero para la realidad tributaria de Colombia.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_ACCESS.map((calc) => (
              <Link
                key={calc.href}
                href={calc.href}
                className="group rounded-xl border border-border/70 bg-card p-6 transition hover:border-foreground/25 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
                  <calc.icon
                    aria-hidden="true"
                    className="h-5 w-5 text-foreground/70 transition group-hover:text-foreground"
                  />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {calc.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {calc.description}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/calculadoras"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline underline-offset-4 decoration-border transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Ver las 35 calculadoras
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>
      </section>

      <section
        aria-labelledby="metrics-title"
        className="bg-muted/30 px-6 py-16 md:px-8 md:py-24"
      >
        <Reveal className="mx-auto max-w-6xl" delay={50}>
          <MetricsSection />
        </Reveal>
      </section>

      <section
        id="asistente"
        aria-labelledby="asistente-title"
        className="bg-zinc-950 px-6 py-16 md:px-8 md:py-24"
      >
        <Reveal className="mx-auto max-w-6xl" delay={50}>
          <h2
            id="asistente-title"
            className="heading-serif text-center text-3xl text-white md:text-5xl"
          >
            Pregunte como le preguntaria a un colega. Reciba respuesta con articulo.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-zinc-400 md:text-lg">
            Consulte articulos del ET, sanciones, retencion e interpretacion
            practica en un solo chat.
          </p>

          <ChatQuerySuggestions
            queries={[
              "Debo declarar renta por ingresos de 2025?",
              "Como calculo retencion en la fuente por salarios?",
              "Que sancion aplica por declarar extemporaneo?",
              "Muestreme el articulo del ET sobre ganancias ocasionales.",
            ]}
          />

          <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-background shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="border-b border-border/50 bg-muted/30 px-5 py-4">
              <h3 className="text-sm font-semibold text-foreground">
                Asistente IA con contexto tributario colombiano
              </h3>
            </div>
            <div className="h-[360px] sm:h-[500px] md:h-[620px]">
              <LazyChatContainer />
            </div>
          </div>
        </Reveal>
      </section>

      <ComparisonSection />

      <FaqSection items={FAQ_ENTRIES} />

      <section
        aria-labelledby="cta-final-title"
        className="bg-zinc-950 px-6 py-16 md:px-8 md:py-24"
      >
        <Reveal className="mx-auto max-w-3xl text-center" delay={50}>
          <h2
            id="cta-final-title"
            className="heading-serif text-4xl text-white md:text-6xl"
          >
            Haga su primera consulta en menos de 2 minutos.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-zinc-400 md:text-lg">
            Temporada de vencimientos DIAN 2026. Arranque ahora y evite
            reprocesos.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/calculadoras/debo-declarar"
              className="inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Empezar con &quot;Debo declarar renta?&quot;
            </Link>
            <Link
              href="#asistente"
              className="inline-flex h-12 items-center justify-center rounded-md border border-white/35 bg-white/5 px-6 text-sm font-medium text-white transition hover:border-white/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Abrir asistente IA
            </Link>
          </div>
          <p className="mt-3 text-xs font-medium text-zinc-500">
            Sin registro. Sin costo.
          </p>
        </Reveal>
      </section>

      <section className="bg-zinc-950 px-6 pb-20 pt-14 md:px-8 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <FooterLinks />
        </div>
      </section>

      <MobileStickyCta />
    </main>
  );
}
