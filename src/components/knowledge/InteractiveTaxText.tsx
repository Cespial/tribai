"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Gavel, ScrollText, BookOpen } from "lucide-react";
import { ENRICHED_GLOSARIO } from "@/lib/knowledge/knowledge-index";
import { TermTooltip } from "@/components/knowledge/TermTooltip";

interface InteractiveTaxTextProps {
  text: string;
  className?: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const TERM_ALIASES = ENRICHED_GLOSARIO.flatMap((term) => [
  { key: term.termino.toLowerCase(), term },
  ...term.aliases.map((alias) => ({ key: alias.toLowerCase(), term })),
]);

const ALIAS_LOOKUP = new Map(TERM_ALIASES.map((item) => [item.key, item.term]));

const GLOSARIO_PATTERN = TERM_ALIASES.map((item) => escapeRegExp(item.key))
  .sort((a, b) => b.length - a.length)
  .join("|");

// Regex patterns
const RE_ART = /Art(?:ículo|ic\.?|iculo)?\.?\s*(\d+[-]?\d*[A-Za-z]?)/gi;
const RE_LEY = /Ley\s+(\d+)\s+de\s+(\d{4})/gi;
const RE_DECRETO = /Decreto\s+(\d+)/gi;
const RE_CONCEPTO = /Concepto\s+DIAN\s+No\.\s+(\d+)/gi;

const COMBINED_REGEX = new RegExp(
  `(${GLOSARIO_PATTERN})|(${RE_ART.source})|(${RE_LEY.source})|(${RE_DECRETO.source})|(${RE_CONCEPTO.source})`,
  "gi"
);

function LegalTooltip({
  href,
  label,
  type,
  children,
}: {
  href: string;
  label: string;
  type: "articulo" | "ley" | "decreto" | "concepto";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const Icon = {
    articulo: FileText,
    ley: Gavel,
    decreto: ScrollText,
    concepto: BookOpen,
  }[type];

  const typeLabel = {
    articulo: "Artículo ET",
    ley: "Ley de la República",
    decreto: "Decreto Reglamentario",
    concepto: "Doctrina DIAN",
  }[type];

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={href}
        className="inline-flex items-center rounded-sm border-b border-dotted border-primary/50 px-0.5 font-medium text-primary hover:border-primary hover:bg-primary/5"
      >
        {children}
      </Link>

      {open && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border border-border bg-card p-3 shadow-xl animate-in fade-in slide-in-from-bottom-1">
          <div className="flex items-center gap-2 mb-1.5">
            <Icon className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {typeLabel}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            Presione para ver el contenido completo, vigencia y doctrina relacionada en nuestro explorador.
          </p>
          <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full w-1/3 bg-primary/40" />
          </div>
        </div>
      )}
    </span>
  );
}

export function InteractiveTaxText({ text, className }: InteractiveTaxTextProps) {
  const nodes = useMemo(() => {
    if (!text || !text.trim()) return text;

    // Use a more robust split that captures all groups
    const parts: string[] = [];
    let lastIndex = 0;
    let match;

    // Reset regex index
    // eslint-disable-next-line react-hooks/immutability
    COMBINED_REGEX.lastIndex = 0;

    while ((match = COMBINED_REGEX.exec(text)) !== null) {
      // Add preceding plain text
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Add the matched part
      parts.push(match[0]);
      lastIndex = COMBINED_REGEX.lastIndex;
    }

    // Add remaining plain text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.map((part, index) => {
      const lowerPart = part.toLowerCase();

      // 1. Check Glossary
      const term = ALIAS_LOOKUP.get(lowerPart);
      if (term) {
        return (
          <TermTooltip key={`term-${index}-${term.id}`} term={term}>
            {part}
          </TermTooltip>
        );
      }

      // 2. Check Article
      const artMatch = part.match(RE_ART);
      if (artMatch) {
        // eslint-disable-next-line react-hooks/immutability
        RE_ART.lastIndex = 0; // Reset
        const exec = RE_ART.exec(part);
        const artNum = exec ? exec[1] : part.replace(/\D/g, "");
        return (
          <LegalTooltip
            key={`art-${index}`}
            type="articulo"
            label={`Artículo ${artNum} del Estatuto Tributario`}
            href={`/articulo/${artNum}`}
          >
            {part}
          </LegalTooltip>
        );
      }

      // 3. Check Ley
      const leyMatch = part.match(RE_LEY);
      if (leyMatch) {
        // eslint-disable-next-line react-hooks/immutability
        RE_LEY.lastIndex = 0;
        const exec = RE_LEY.exec(part);
        const _leyNum = exec ? exec[1] : "";
        return (
          <LegalTooltip
            key={`ley-${index}`}
            type="ley"
            label={part}
            href={`/novedades?q=${encodeURIComponent(part)}`}
          >
            {part}
          </LegalTooltip>
        );
      }

      // 4. Check Decreto
      const decMatch = part.match(RE_DECRETO);
      if (decMatch) {
        // eslint-disable-next-line react-hooks/immutability
        RE_DECRETO.lastIndex = 0;
        const exec = RE_DECRETO.exec(part);
        const _decNum = exec ? exec[1] : "";
        return (
          <LegalTooltip
            key={`dec-${index}`}
            type="decreto"
            label={part}
            href={`/novedades?q=${encodeURIComponent(part)}`}
          >
            {part}
          </LegalTooltip>
        );
      }

      // 5. Check Concepto DIAN
      const conMatch = part.match(RE_CONCEPTO);
      if (conMatch) {
        // eslint-disable-next-line react-hooks/immutability
        RE_CONCEPTO.lastIndex = 0;
        const exec = RE_CONCEPTO.exec(part);
        const conNum = exec ? exec[1] : "";
        return (
          <LegalTooltip
            key={`con-${index}`}
            type="concepto"
            label={part}
            href={`/doctrina?doc=${conNum}`}
          >
            {part}
          </LegalTooltip>
        );
      }

      return <span key={`plain-${index}`}>{part}</span>;
    });
  }, [text]);

  return <span className={className}>{nodes}</span>;
}
