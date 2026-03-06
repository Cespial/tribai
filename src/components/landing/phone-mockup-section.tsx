"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Smartphone } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

export function PhoneMockupSection() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  return (
    <section
      aria-labelledby="app-preview-title"
      className="section-navy relative overflow-hidden px-6 py-16 md:px-12 md:py-24 lg:px-20"
    >
      <Reveal className="mx-auto max-w-[960px]" delay={50}>
        <div className="flex flex-col items-center gap-12 md:flex-row md:items-center md:gap-16">
          {/* Left — Copy */}
          <div className="w-full shrink-0 md:w-[45%]">
            <p className="eyebrow-label !text-tribai-gold">
              Proximamente en iOS
            </p>
            <h2
              id="app-preview-title"
              className="heading-serif mt-4 text-2xl text-white md:text-4xl"
            >
              Todo el poder tributario. En su bolsillo.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/70">
              La misma inteligencia de tribai.co — asistente IA con fuentes,
              calculadoras de precisión y el Estatuto completo — en una app nativa
              para iPhone. Diseñada para contadores en movimiento.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Asistente IA con artículos del ET en tiempo real",
                "35 calculadoras offline, actualizadas a 2026",
                "1.294 artículos navegables con historial de reformas",
                "Calendario DIAN con notificaciones push",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[14px] text-white/80">
                  <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full bg-tribai-gold" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/asistente"
                className="btn-primary h-12 px-6"
              >
                Probar el asistente
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <span className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/20 px-6 text-[14px] font-medium text-white/50">
                <Smartphone className="h-4 w-4" />
                App Store — pronto
              </span>
            </div>
          </div>

          {/* Right — iPhone Mockup */}
          <div className="flex flex-1 justify-center">
            <div className="phone-mockup">
              {/* Dynamic Island */}
              <div className="phone-dynamic-island" />

              {/* Screen content — iframe */}
              <div className="phone-screen">
                {!loaded && (
                  <div className="flex h-full items-center justify-center bg-background">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-tribai-blue border-t-transparent" />
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src="/app"
                  title="Tribai App Preview"
                  className={`h-full w-full border-0 ${loaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setLoaded(true)}
                  loading="lazy"
                />
              </div>

              {/* Home indicator */}
              <div className="phone-home-indicator" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
