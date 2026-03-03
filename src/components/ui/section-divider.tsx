/**
 * SVG section dividers — 3 variants with tribai triangle/node motif.
 * Insert between landing page sections to break visual monotony.
 */

interface DividerProps {
  variant: "wave" | "node-line" | "constellation-break";
  className?: string;
  flip?: boolean;
}

export function SectionDivider({ variant, className = "", flip }: DividerProps) {
  return (
    <div
      aria-hidden="true"
      className={`w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""} ${className}`}
    >
      {variant === "wave" && <WaveDivider />}
      {variant === "node-line" && <NodeLineDivider />}
      {variant === "constellation-break" && <ConstellationBreakDivider />}
    </div>
  );
}

/** Smooth SVG curve with a gold node at the peak */
function WaveDivider() {
  return (
    <svg
      viewBox="0 0 1440 48"
      fill="none"
      preserveAspectRatio="none"
      className="block h-8 w-full md:h-12"
    >
      <path
        d="M0 48V24C240 0 480 0 720 24S1200 48 1440 24V48H0Z"
        fill="currentColor"
        className="text-background"
      />
      <circle cx="720" cy="18" r="4" fill="var(--tribai-gold)" opacity="0.6" />
      <circle cx="720" cy="18" r="2" fill="var(--tribai-gold)" />
    </svg>
  );
}

/** Horizontal line with 3 nodes: 2 blue small + 1 gold center */
function NodeLineDivider() {
  return (
    <svg
      viewBox="0 0 1200 24"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      className="mx-auto block h-6 w-full max-w-6xl px-6"
    >
      <line x1="100" y1="12" x2="1100" y2="12" stroke="var(--border)" strokeWidth="1" />
      <circle cx="400" cy="12" r="3" fill="var(--tribai-blue)" opacity="0.4" />
      <circle cx="600" cy="12" r="4.5" fill="var(--tribai-gold)" opacity="0.7" />
      <circle cx="600" cy="12" r="2.5" fill="var(--tribai-gold)" />
      <circle cx="800" cy="12" r="3" fill="var(--tribai-blue)" opacity="0.4" />
      {/* Connection lines from small nodes to center */}
      <line x1="403" y1="12" x2="595" y2="12" stroke="var(--tribai-blue)" strokeWidth="0.5" opacity="0.2" />
      <line x1="605" y1="12" x2="797" y2="12" stroke="var(--tribai-blue)" strokeWidth="0.5" opacity="0.2" />
    </svg>
  );
}

/** Dispersed nodes with connections — for navy sections */
function ConstellationBreakDivider() {
  return (
    <svg
      viewBox="0 0 1200 40"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      className="mx-auto block h-8 w-full max-w-6xl px-6 md:h-10"
    >
      {/* Connection lines */}
      <line x1="200" y1="20" x2="400" y2="12" stroke="var(--tribai-blue)" strokeWidth="0.6" opacity="0.15" />
      <line x1="400" y1="12" x2="600" y2="20" stroke="var(--tribai-blue)" strokeWidth="0.6" opacity="0.15" />
      <line x1="600" y1="20" x2="800" y2="10" stroke="var(--tribai-blue)" strokeWidth="0.6" opacity="0.15" />
      <line x1="800" y1="10" x2="1000" y2="22" stroke="var(--tribai-blue)" strokeWidth="0.6" opacity="0.15" />
      <line x1="400" y1="12" x2="600" y2="28" stroke="var(--tribai-gold)" strokeWidth="0.5" opacity="0.15" />
      <line x1="600" y1="28" x2="800" y2="10" stroke="var(--tribai-gold)" strokeWidth="0.5" opacity="0.15" />
      {/* Nodes */}
      <circle cx="200" cy="20" r="2.5" fill="var(--tribai-blue)" opacity="0.3" />
      <circle cx="400" cy="12" r="2.5" fill="var(--tribai-blue)" opacity="0.4" />
      <circle cx="600" cy="20" r="3.5" fill="var(--tribai-gold)" opacity="0.6" />
      <circle cx="600" cy="20" r="2" fill="var(--tribai-gold)" />
      <circle cx="800" cy="10" r="2.5" fill="var(--tribai-blue)" opacity="0.4" />
      <circle cx="1000" cy="22" r="2.5" fill="var(--tribai-blue)" opacity="0.3" />
      <circle cx="600" cy="28" r="2" fill="var(--tribai-gold)" opacity="0.35" />
    </svg>
  );
}
