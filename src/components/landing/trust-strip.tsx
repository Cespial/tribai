import { BookOpen, Scale, Zap, Target } from "lucide-react";

export function TrustStrip() {
  return (
    <section
      aria-label="Credenciales de confianza"
      className="border-b border-border bg-background px-6 py-10 md:px-8 md:py-14"
    >
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
  );
}
