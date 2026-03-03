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

/** Decorative footer top border — line with 3-node triangle cluster */
function FooterBorder() {
  return (
    <svg
      viewBox="0 0 1200 16"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      className="mb-10 block w-full"
      aria-hidden="true"
    >
      <line x1="0" y1="8" x2="1200" y2="8" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      {/* Central triangle cluster */}
      <circle cx="590" cy="5" r="2" fill="#D4A83A" opacity="0.5" />
      <circle cx="610" cy="5" r="2" fill="#D4A83A" opacity="0.5" />
      <circle cx="600" cy="13" r="2" fill="#D4A83A" opacity="0.5" />
      <line x1="590" y1="5" x2="610" y2="5" stroke="#D4A83A" strokeWidth="0.5" opacity="0.3" />
      <line x1="610" y1="5" x2="600" y2="13" stroke="#D4A83A" strokeWidth="0.5" opacity="0.3" />
      <line x1="600" y1="13" x2="590" y2="5" stroke="#D4A83A" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

/** Constellation dots behind logo */
function LogoConstellation() {
  return (
    <svg viewBox="0 0 80 40" fill="none" className="absolute -left-4 -top-2 h-12 w-20" aria-hidden="true">
      <circle cx="8" cy="10" r="1.5" fill="#4B9FE1" opacity="0.12" />
      <circle cx="72" cy="8" r="1.5" fill="#4B9FE1" opacity="0.1" />
      <circle cx="40" cy="35" r="1.5" fill="#D4A83A" opacity="0.1" />
      <circle cx="65" cy="30" r="1" fill="#4B9FE1" opacity="0.08" />
      <circle cx="15" cy="32" r="1" fill="#4B9FE1" opacity="0.08" />
    </svg>
  );
}

export function FooterLinks() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <FooterBorder />

      {/* Logo + tagline */}
      <div className="relative mb-10 flex items-center gap-3">
        <LogoConstellation />
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
                    className="footer-link-hover text-sm text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
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
            <LinkedInIcon className="h-5 w-5" />
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 transition-colors hover:text-white"
            aria-label="X / Twitter"
          >
            <XIcon className="h-5 w-5" />
          </a>
          <a
            href="mailto:hola@tribai.co"
            className="text-white/30 transition-colors hover:text-white"
            aria-label="Email"
          >
            <EmailIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
