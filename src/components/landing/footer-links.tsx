import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

const FOOTER_COLUMNS = [
  {
    title: "Calculadoras",
    links: [
      { label: "Debo declarar renta", href: "/calculadoras/debo-declarar" },
      { label: "Renta personas naturales", href: "/calculadoras/renta" },
      { label: "Retencion en la fuente", href: "/calculadoras/retencion" },
      { label: "IVA", href: "/calculadoras/iva" },
      { label: "Regimen SIMPLE", href: "/calculadoras/simple" },
      { label: "Ver las 35", href: "/calculadoras" },
    ],
  },
  {
    title: "Referencia",
    links: [
      { label: "Estatuto Tributario", href: "/explorador" },
      { label: "Calendario fiscal", href: "/calendario" },
      { label: "Indicadores", href: "/indicadores" },
      { label: "Glosario", href: "/glosario" },
      { label: "Tablas de retencion", href: "/tablas/retencion" },
    ],
  },
  {
    title: "Herramientas",
    links: [
      { label: "Comparador de articulos", href: "/comparar" },
      { label: "Novedades normativas", href: "/novedades" },
      { label: "Doctrina DIAN", href: "/doctrina" },
      { label: "Guias interactivas", href: "/guias" },
      { label: "Favoritos", href: "/favoritos" },
    ],
  },
  {
    title: "Plataforma",
    links: [
      { label: "Panel", href: "/dashboard" },
      { label: "Asistente IA", href: "#asistente" },
      { label: "Preguntas frecuentes", href: "#faq" },
      { label: "Comparativa", href: "#comparativa" },
    ],
  },
] as const;

export function FooterLinks() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.05em] text-white/40">
              {column.title}
            </h3>
            <ul className="space-y-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col justify-between gap-8 border-t border-white/5 pt-8 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <p className="text-xs leading-relaxed text-zinc-500">
            &copy; {currentYear} SuperApp Tributaria Colombia. Herramienta informativa de apoyo
            tributario. No constituye asesoria legal o contable personalizada.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600">
            Basada en normativa tributaria colombiana y consulta del Estatuto
            Tributario. Hecho en Colombia.
          </p>
        </div>

        <div className="flex items-center gap-5">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 transition-colors hover:text-white"
            aria-label="Twitter"
          >
            <Twitter className="h-5 w-5" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 transition-colors hover:text-white"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 transition-colors hover:text-white"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
