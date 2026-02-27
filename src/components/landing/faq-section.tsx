import Link from "next/link";
import { ChevronDown } from "lucide-react";
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
      className="bg-muted/40 px-6 py-16 md:px-8 md:py-24"
    >
      <Reveal className="mx-auto max-w-4xl">
        <h2 id="faq-title" className="heading-serif text-3xl text-foreground md:text-5xl">
          Antes de arrancar, resolvamos dudas.
        </h2>

        <div className="mt-10 space-y-4">
          {items.map((item, index) => (
            <details
              key={item.question}
              className="group rounded-xl border border-border bg-card transition-all duration-300 open:border-foreground/20 open:shadow-sm"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-base font-semibold text-foreground transition-colors hover:text-foreground/80">
                {item.question}
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>

        <Link
          href="#asistente"
          className="mt-8 inline-flex text-sm font-semibold text-foreground underline underline-offset-4 decoration-border transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Ir al asistente IA
        </Link>
      </Reveal>
    </section>
  );
}
