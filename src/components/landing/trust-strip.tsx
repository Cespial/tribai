import { BadgeCheck, BookCheck, MapPin, Zap } from "lucide-react";

export function TrustStrip() {
  return (
    <section
      aria-label="Credenciales de confianza"
      className="border-y border-border bg-background/80"
    >
      <div className="mx-auto grid max-w-6xl gap-4 px-6 py-5 md:grid-cols-4 md:px-8">
        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 px-4 py-3 text-sm text-foreground/80 transition hover:border-foreground/20">
          <BadgeCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-foreground/60" />
          <p><span className="font-semibold text-foreground">1.294 artículos</span> del ET indexados y consultables.</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 px-4 py-3 text-sm text-foreground/80 transition hover:border-foreground/20">
          <BookCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-foreground/60" />
          <p><span className="font-semibold text-foreground">841 doctrinas</span> vinculadas para sustento técnico.</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 px-4 py-3 text-sm text-foreground/80 transition hover:border-foreground/20">
          <Zap aria-hidden="true" className="h-4 w-4 shrink-0 text-foreground/60" />
          <p><span className="font-semibold text-foreground">Acceso gratuito</span> y actualizado para 2026.</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 px-4 py-3 text-sm text-foreground/80 transition hover:border-foreground/20">
          <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-foreground/60" />
          <p><span className="font-semibold text-foreground">Hecho en Colombia</span> para contadores colombianos.</p>
        </div>
      </div>
    </section>
  );
}
