import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  items: FaqItem[];
}

export function FaqSection({ items }: FaqSectionProps) {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="bg-background px-6 py-28 md:px-8 md:py-36"
    >
      <Reveal className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-tribai-blue">
          Preguntas frecuentes
        </p>
        <h2
          id="faq-title"
          className="heading-serif mt-3 max-w-3xl text-3xl text-foreground md:text-5xl"
        >
          Las preguntas que el contador realmente tiene.
        </h2>

        <div className="mt-10 max-w-4xl space-y-3">
          {items.map((item, index) => (
            <details
              key={item.question}
              className="group rounded-xl border border-border bg-card transition-colors open:border-tribai-blue/30 open:shadow-sm"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-base font-semibold text-foreground transition-colors hover:text-foreground/80">
                {item.question}
                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/asistente"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-tribai-blue transition-colors hover:text-tribai-blue/80"
          >
            Ir al asistente IA
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
