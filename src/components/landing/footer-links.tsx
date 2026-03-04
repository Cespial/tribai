import Link from "next/link";

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
      <path d="M32 6L58 54H6L32 6Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
      <circle cx="32" cy="14" r="2.5" fill="currentColor"/>
      <circle cx="18" cy="44" r="2.5" fill="currentColor"/>
      <circle cx="46" cy="44" r="2.5" fill="currentColor"/>
      <circle cx="32" cy="34" r="3" fill="var(--tribai-blue)"/>
      <line x1="32" y1="14" x2="32" y2="31" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="32" y1="34" x2="18" y2="44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="32" y1="34" x2="46" y2="44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

/** Custom LinkedIn icon — brand style with stroke 1.5 */
function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 10v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Custom X/Twitter icon — brand style */
function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 4l6.5 8L4 20h2l5.5-6.8L16 20h4l-6.8-8.4L19.5 4h-2l-5.2 6.4L8 4H4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Custom Email icon — brand style */
function EmailIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 7l10 6 10-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
          <p className="heading-serif text-lg text-white/90">
            trib<span className="text-tribai-blue">ai</span>
            <span className="text-white/40 text-xs">.co</span>
          </p>
          <p className="text-xs text-white/50">Inteligencia tributaria colombiana.</p>
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-2 gap-8 md:grid-cols-3 md:gap-12">
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
              {column.title}
            </h3>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
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
      <div className="mt-14 flex flex-col justify-between gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center">
        <div className="max-w-2xl space-y-1">
          <p className="text-xs leading-relaxed text-white/50">
            Herramienta informativa de apoyo tributario. No constituye asesoría
            legal o contable personalizada. El criterio profesional siempre
            prevalece.
          </p>
          <p className="text-xs text-white/30">
            &copy; {currentYear} tribai.co — Hecho en Colombia para Colombia.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 transition-colors hover:text-white"
            aria-label="LinkedIn"
          >
            <LinkedInIcon className="h-5 w-5" />
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 transition-colors hover:text-white"
            aria-label="X / Twitter"
          >
            <XIcon className="h-5 w-5" />
          </a>
          <a
            href="mailto:hola@tribai.co"
            className="text-white/50 transition-colors hover:text-white"
            aria-label="Email"
          >
            <EmailIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
