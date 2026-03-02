"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, ChevronDown } from "lucide-react";
import { useSyncExternalStore, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const MAIN_NAV = [
  { href: "/calculadoras", label: "Calculadoras" },
  { href: "/explorador", label: "Estatuto" },
  { href: "/asistente", label: "Asistente IA" },
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
      <circle cx="32" cy="34" r="3" fill="var(--gold, #C4952A)" />
      <line x1="32" y1="14" x2="32" y2="31" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="34" x2="18" y2="44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="34" x2="46" y2="44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="14" x2="18" y2="44" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" opacity="0.3" />
      <line x1="32" y1="14" x2="46" y2="44" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" opacity="0.3" />
      <line x1="18" y1="44" x2="46" y2="44" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

interface HeaderProps {
  variant?: "default" | "transparent";
}

export function Header({ variant = "default" }: HeaderProps) {
  const isTransparent = variant === "transparent";
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== "transparent") return;
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.85);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [variant]);

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

  const showTransparent = isTransparent && !scrolled;

  const textColor = showTransparent ? "text-white" : "text-foreground";
  const mutedColor = showTransparent ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground";
  const goldColor = "text-tribai-gold";

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 will-change-transform transition-all duration-300 print:hidden",
        showTransparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-border/40 bg-background/80 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <TribaiLogo className={clsx("h-7 w-7", textColor)} />
          <span className={clsx("heading-serif text-lg", textColor)}>
            trib<span className={goldColor}>ai</span>
            <span className={clsx("text-sm", showTransparent ? "text-white/50" : "text-muted-foreground")}>.co</span>
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
                  "relative rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                  isActive
                    ? clsx(textColor, "font-semibold")
                    : mutedColor
                )}
              >
                {label}
                {isActive && (
                  <span className={clsx(
                    "absolute inset-x-3 -bottom-[7px] h-[2px] rounded-full",
                    showTransparent ? "bg-white" : "bg-tribai-blue"
                  )} />
                )}
              </Link>
            );
          })}

          {/* More dropdown */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={clsx(
                "flex items-center gap-1 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                mutedColor
              )}
              aria-expanded={moreOpen}
            >
              Más
              <ChevronDown className={clsx("h-3 w-3 transition-transform", moreOpen && "rotate-180")} />
            </button>

            {moreOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-border bg-card p-1.5 shadow-lg">
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
            href="/calculadoras"
            className={clsx(
              "hidden rounded-md px-4 py-2 text-[13px] font-semibold transition-colors md:inline-flex",
              showTransparent
                ? "bg-white text-tribai-navy hover:bg-white/90"
                : "bg-tribai-blue text-white hover:bg-tribai-blue/90"
            )}
          >
            Probar ahora
          </Link>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={clsx("rounded-md p-2 transition-colors", mutedColor)}
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={clsx("rounded-md p-2 transition-colors md:hidden", mutedColor)}
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
            className="fixed inset-0 top-16 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav
            id="mobile-navigation"
            className="fixed right-0 top-16 z-50 h-[calc(100vh-64px)] w-72 overflow-y-auto border-l border-border/40 bg-background p-5 shadow-lg md:hidden"
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
                href="/calculadoras"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full rounded-md bg-tribai-blue px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Probar ahora
              </Link>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
