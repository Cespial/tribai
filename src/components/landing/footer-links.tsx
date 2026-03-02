import Link from "next/link";
import { Linkedin } from "lucide-react";

const FOOTER_COLUMNS = [
  {
    title: "Herramientas",
    links: [
      { label: "Calculadoras", href: "/calculadoras" },
      { label: "Explorador del ET", href: "/explorador" },
      { label: "Asistente IA", href: "/asistente" },
      { label: "Calendario DIAN 2026", href: "/calendario" },
      { label: "Doctrina DIAN", href: "/doctrina" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Glosario tributario", href: "/glosario" },
      { label: "Indicadores económicos", href: "/indicadores" },
      { label: "Novedades normativas", href: "/novedades" },
      { label: "Guías interactivas", href: "/guias" },
      { label: "Tablas de retención", href: "/tablas/retencion" },
    ],
  },
  {
    title: "Más",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Comparador de artículos", href: "/comparar" },
      { label: "Favoritos", href: "/favoritos" },
      { label: "Preguntas frecuentes", href: "#faq" },
    ],
  },
] as const;

/* Tribai Isotipo inline for footer */
function TribaiLogoSmall() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M32 6L58 54H6L32 6Z" stroke="#4B9FE1" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
      <circle cx="32" cy="14" r="2.5" fill="#4B9FE1"/>
      <circle cx="18" cy="44" r="2.5" fill="#4B9FE1"/>
      <circle cx="46" cy="44" r="2.5" fill="#4B9FE1"/>
      <circle cx="32" cy="34" r="3" fill="#D4A83A"/>
      <line x1="32" y1="14" x2="32" y2="31" stroke="#4B9FE1" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="32" y1="34" x2="18" y2="44" stroke="#4B9FE1" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="32" y1="34" x2="46" y2="44" stroke="#4B9FE1" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function FooterLinks() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      {/* Logo + tagline */}
      <div className="mb-10 flex items-center gap-3">
        <TribaiLogoSmall />
        <div>
          <p className="heading-serif text-lg text-white">
            trib<span className="text-tribai-gold">ai</span>
            <span className="text-white/40 text-sm">.co</span>
          </p>
          <p className="text-xs text-white/40">Inteligencia tributaria colombiana.</p>
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-2 gap-8 md:grid-cols-3 md:gap-12">
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/30">
              {column.title}
            </h3>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="mt-14 flex flex-col justify-between gap-6 border-t border-white/5 pt-8 md:flex-row md:items-center">
        <div className="max-w-2xl space-y-1">
          <p className="text-xs leading-relaxed text-white/30">
            Herramienta informativa de apoyo tributario. No constituye asesoría
            legal o contable personalizada. El criterio profesional siempre
            prevalece.
          </p>
          <p className="text-xs text-white/20">
            &copy; {currentYear} tribai.co — Hecho en Colombia para Colombia.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 transition-colors hover:text-white"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
