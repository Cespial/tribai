"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, ChevronDown } from "lucide-react";
import { useSyncExternalStore, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const MAIN_NAV = [
  { href: "/asistente", label: "Asistente IA" },
  { href: "/calculadoras", label: "Calculadoras" },
  { href: "/explorador", label: "Estatuto" },
  { href: "/calendario", label: "Calendario" },
  { href: "/doctrina", label: "Doctrina" },
];

const MORE_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/comparar", label: "Comparador" },
  { href: "/tablas/retencion", label: "Tablas de retención" },
  { href: "/indicadores", label: "Indicadores" },
  { href: "/glosario", label: "Glosario" },
  { href: "/novedades", label: "Novedades" },
  { href: "/guias", label: "Guías" },
  { href: "/favoritos", label: "Favoritos" },
];

const ALL_NAV = [{ href: "/", label: "Inicio" }, ...MAIN_NAV, ...MORE_NAV];

/* ── Tribai Isotipo SVG inline ── */
function TribaiLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M32 6L58 54H6L32 6Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="32" cy="14" r="2.5" fill="currentColor" />
      <circle cx="18" cy="44" r="2.5" fill="currentColor" />
      <circle cx="46" cy="44" r="2.5" fill="currentColor" />
      <circle cx="32" cy="34" r="3" fill="var(--tribai-gold, #C4952A)" />
      <line x1="32" y1="14" x2="32" y2="31" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="34" x2="18" y2="44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="34" x2="46" y2="44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="14" x2="18" y2="44" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" opacity="0.4" />
      <line x1="32" y1="14" x2="46" y2="44" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" opacity="0.4" />
      <line x1="18" y1="44" x2="46" y2="44" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!moreOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [moreOpen]);

  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background print:hidden"
    >
      <div className="mx-auto flex h-[72px] max-w-[1120px] items-center justify-between px-6 md:px-12 lg:px-16">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <TribaiLogo className="h-7 w-7 text-foreground" />
          <span className="heading-serif text-lg text-foreground">
            trib<span className="text-tribai-blue">ai</span>
            <span className="text-xs text-muted-foreground">.co</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
          {MAIN_NAV.map(({ href, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "relative rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
                {isActive && (
                  <span className="absolute inset-x-3 -bottom-[7px] h-[2px] rounded-full bg-tribai-blue" />
                )}
              </Link>
            );
          })}

          {/* More dropdown */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="flex items-center gap-1 rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              aria-expanded={moreOpen}
            >
              Más
              <ChevronDown className={clsx("h-3 w-3 transition-transform", moreOpen && "rotate-180")} />
            </button>

            {moreOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-border bg-card p-1.5 shadow-sm">
                {MORE_NAV.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={clsx(
                      "block rounded-md px-3 py-2 text-sm transition-colors",
                      pathname.startsWith(href)
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* CTA — desktop only */}
          <Link
            href="/asistente"
            className="hidden rounded-lg bg-tribai-blue px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-tribai-blue/90 md:inline-flex"
          >
            Preguntarle a la IA
          </Link>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            aria-label="Menú de navegación"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-[72px] z-40 bg-foreground/20 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav
            id="mobile-navigation"
            className="fixed right-0 top-[72px] z-50 h-[calc(100vh-72px)] w-72 overflow-y-auto border-l border-border bg-background p-5 md:hidden"
          >
            <div className="flex flex-col gap-0.5">
              {ALL_NAV.map(({ href, label }) => {
                const isActive =
                  href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <Link
                href="/asistente"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full rounded-md bg-tribai-blue px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Preguntarle a la IA
              </Link>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
