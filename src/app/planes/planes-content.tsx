"use client";

import { useState } from "react";
import { Check, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

const PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "";
const HAS_CLERK = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const BASIC_FEATURES = [
  "Consultas ilimitadas con IA (Haiku)",
  "Planificador tributario (Sonnet)",
  "Acceso a todas las calculadoras",
  "Exportar a PDF",
];

const PRO_FEATURES = [
  "Todo lo del plan Basico",
  "Consultas con IA avanzada (Sonnet)",
  "Planificador con IA premium (Opus)",
  "Analisis mas profundo y preciso",
  "Prioridad en respuestas",
];

const FAQ_ITEMS = [
  {
    question: "Puedo cancelar mi suscripcion en cualquier momento?",
    answer:
      "Si. Puede cancelar su suscripcion Pro cuando quiera desde el portal de facturacion. Mantendra el acceso Pro hasta el final de su periodo de facturacion actual.",
  },
  {
    question: "Que metodos de pago aceptan?",
    answer:
      "Aceptamos tarjetas de credito y debito (Visa, Mastercard, American Express). El pago se procesa de forma segura a traves de Stripe.",
  },
  {
    question: "Cual es la diferencia entre los modelos de IA?",
    answer:
      "El plan Basico usa Claude Haiku para consultas (rapido y eficiente) y Claude Sonnet para planificacion. El plan Pro usa Claude Sonnet para consultas (mas profundo) y Claude Opus para planificacion (el modelo mas avanzado de Anthropic).",
  },
  {
    question: "Pierdo mis conversaciones si cambio de plan?",
    answer:
      "No. Su historial de conversaciones se mantiene independientemente del plan que tenga. Al cambiar a Pro, las nuevas conversaciones usaran los modelos avanzados automaticamente.",
  },
];

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-foreground transition-colors hover:text-tribai-blue"
      >
        {question}
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-muted-foreground">
          {answer}
        </p>
      )}
    </div>
  );
}

function useClerkUser() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useUser } = require("@clerk/nextjs") as { useUser: () => { user: { publicMetadata?: Record<string, unknown> } | null; isLoaded: boolean } };
  return useUser();
}

export default function PlanesContent() {
  const clerkState = HAS_CLERK ? useClerkUser() : null;
  const user = clerkState?.user ?? null;
  const isLoaded = clerkState?.isLoaded ?? true;
  const [loading, setLoading] = useState(false);

  const currentPlan =
    (user?.publicMetadata?.plan as string | undefined) || "basic";
  const isPro = currentPlan === "pro";

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: PRICE_ID }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error al iniciar el pago:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleManageBilling() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error al abrir el portal:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-background">
      {/* Hero */}
      <section className="px-4 pb-8 pt-16 text-center md:pb-12 md:pt-20">
        <h1 className="heading-serif text-3xl text-foreground md:text-4xl">
          Planes y precios
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
          Acceda a la inteligencia tributaria que necesita. Sin contratos, sin
          compromisos.
        </p>
      </section>

      {/* Cards */}
      <section className="mx-auto grid max-w-3xl gap-6 px-4 pb-16 md:grid-cols-2 md:px-8">
        {/* Basico */}
        <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Plan Basico
            </h2>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">
                Gratis
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Para empezar a resolver dudas tributarias con IA.
            </p>
          </div>

          <ul className="mb-8 flex flex-1 flex-col gap-3">
            {BASIC_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2.5 text-sm text-foreground"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            disabled
            className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground"
          >
            Plan actual
          </button>
        </div>

        {/* Pro */}
        <div className="relative flex flex-col rounded-xl border-2 border-tribai-blue bg-card p-6 shadow-sm">
          <div className="absolute -top-3 right-4 rounded-full bg-tribai-blue px-3 py-0.5 text-xs font-semibold text-white">
            Recomendado
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                Plan Pro
              </h2>
              <Sparkles className="h-4 w-4 text-tribai-gold" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">
                $29.900
              </span>
              <span className="text-sm text-muted-foreground">/mes</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              IA avanzada para profesionales tributarios exigentes.
            </p>
          </div>

          <ul className="mb-8 flex flex-1 flex-col gap-3">
            {PRO_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2.5 text-sm text-foreground"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-tribai-blue" />
                {feature}
              </li>
            ))}
          </ul>

          {!isLoaded ? (
            <div className="h-[42px] w-full animate-pulse rounded-lg bg-muted" />
          ) : isPro ? (
            <button
              onClick={handleManageBilling}
              disabled={loading}
              className={clsx(
                "w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors",
                loading
                  ? "cursor-not-allowed text-muted-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {loading ? "Cargando..." : "Administrar suscripcion"}
            </button>
          ) : user ? (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className={clsx(
                "w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors",
                loading
                  ? "cursor-not-allowed bg-tribai-blue/60"
                  : "bg-tribai-blue hover:bg-tribai-blue/90"
              )}
            >
              {loading ? "Redirigiendo..." : "Comenzar prueba Pro"}
            </button>
          ) : (
            <Link
              href={HAS_CLERK ? "/sign-up" : "/asistente"}
              className="block w-full rounded-lg bg-tribai-blue px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-tribai-blue/90"
            >
              {HAS_CLERK ? "Comenzar prueba Pro" : "Ir al Asistente"}
            </Link>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-4 pb-20">
        <h2 className="heading-serif mb-6 text-center text-2xl text-foreground">
          Preguntas frecuentes
        </h2>
        <div className="rounded-xl border border-border bg-card p-6">
          {FAQ_ITEMS.map((item) => (
            <FAQItem
              key={item.question}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        Derechos Reservados de tribai e inplux
      </footer>
    </main>
  );
}
