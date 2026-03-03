/**
 * Decorative SVG elements for visual narrative.
 * All purely decorative — aria-hidden, pointer-events-none.
 */

/** Pillar background illustration: stacked document layers */
export function DecorativeDocLayers({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <rect x="20" y="30" width="60" height="75" rx="4" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <rect x="30" y="20" width="60" height="75" rx="4" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <rect x="40" y="10" width="60" height="75" rx="4" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      <line x1="50" y1="25" x2="90" y2="25" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <line x1="50" y1="35" x2="85" y2="35" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <line x1="50" y1="45" x2="80" y2="45" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
    </svg>
  );
}

/** Pillar background illustration: triangle computation grid */
export function DecorativeTriangleGrid({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <path d="M20 100L50 40L80 100Z" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <path d="M40 100L60 60L80 100Z" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <path d="M60 100L75 70L90 100Z" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
      <circle cx="50" cy="40" r="2" fill="var(--tribai-gold)" opacity="0.4" />
      <circle cx="60" cy="60" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="75" cy="70" r="1.5" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

/** Pillar background illustration: neural constellation nodes */
export function DecorativeNeuralNet({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <circle cx="60" cy="30" r="4" fill="var(--tribai-gold)" opacity="0.4" />
      <circle cx="30" cy="60" r="3" fill="currentColor" opacity="0.3" />
      <circle cx="90" cy="60" r="3" fill="currentColor" opacity="0.3" />
      <circle cx="40" cy="95" r="3" fill="currentColor" opacity="0.25" />
      <circle cx="80" cy="95" r="3" fill="currentColor" opacity="0.25" />
      <line x1="60" y1="34" x2="32" y2="58" stroke="currentColor" strokeWidth="0.7" opacity="0.25" />
      <line x1="60" y1="34" x2="88" y2="58" stroke="currentColor" strokeWidth="0.7" opacity="0.25" />
      <line x1="30" y1="63" x2="40" y2="92" stroke="currentColor" strokeWidth="0.7" opacity="0.2" />
      <line x1="90" y1="63" x2="80" y2="92" stroke="currentColor" strokeWidth="0.7" opacity="0.2" />
      <line x1="33" y1="60" x2="87" y2="60" stroke="var(--tribai-gold)" strokeWidth="0.5" opacity="0.2" />
    </svg>
  );
}

/** Workflow curved connector path with gold nodes */
export function WorkflowConnector({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 48"
      fill="none"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      {/* Curved path connecting 3 steps */}
      <path
        d="M60 24C180 24 220 8 340 8S500 24 500 24S660 40 660 40S820 24 940 24"
        stroke="var(--border)"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="workflow-path"
      />
      {/* Gold nodes at connection points */}
      <circle cx="170" cy="16" r="4" fill="var(--tribai-gold)" opacity="0.7" />
      <circle cx="170" cy="16" r="2" fill="var(--tribai-gold)" />
      <circle cx="500" cy="24" r="4" fill="var(--tribai-gold)" opacity="0.7" />
      <circle cx="500" cy="24" r="2" fill="var(--tribai-gold)" />
      <circle cx="830" cy="32" r="4" fill="var(--tribai-gold)" opacity="0.7" />
      <circle cx="830" cy="32" r="2" fill="var(--tribai-gold)" />
      {/* Directional arrows */}
      <path d="M310 10l8 0l-3-3M310 10l8 0l-3 3" stroke="var(--tribai-gold)" strokeWidth="1" opacity="0.5" />
      <path d="M640 38l8-2l-4-2M640 38l8-2l-2 4" stroke="var(--tribai-gold)" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

/** Trust strip separator — vertical gold line with nodes */
export function TrustSeparator({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 4 32" fill="none" className={className} aria-hidden="true">
      <line x1="2" y1="4" x2="2" y2="28" stroke="var(--tribai-gold)" strokeWidth="1" opacity="0.3" />
      <circle cx="2" cy="4" r="1.5" fill="var(--tribai-gold)" opacity="0.5" />
      <circle cx="2" cy="28" r="1.5" fill="var(--tribai-gold)" opacity="0.5" />
    </svg>
  );
}

/** Metric corner bracket — decorative L-bracket with node */
export function CornerBracket({ position, className = "" }: { position: "top-left" | "bottom-right"; className?: string }) {
  const isTop = position === "top-left";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`${className} ${isTop ? "" : "rotate-180"}`}
      aria-hidden="true"
    >
      <path d="M2 16V4a2 2 0 0 1 2-2h12" stroke="var(--tribai-gold)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <circle cx="2" cy="16" r="2" fill="var(--tribai-gold)" opacity="0.4" />
    </svg>
  );
}

/** CTA constellation — full decorative background */
export function CTAConstellation({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 400" fill="none" className={className} aria-hidden="true">
      {/* Connection lines */}
      <line x1="100" y1="100" x2="300" y2="180" stroke="#4B9FE1" strokeWidth="0.6" opacity="0.3" />
      <line x1="300" y1="180" x2="600" y2="140" stroke="#4B9FE1" strokeWidth="0.6" opacity="0.3" />
      <line x1="600" y1="140" x2="900" y2="200" stroke="#4B9FE1" strokeWidth="0.6" opacity="0.25" />
      <line x1="900" y1="200" x2="1100" y2="120" stroke="#4B9FE1" strokeWidth="0.6" opacity="0.2" />
      <line x1="300" y1="180" x2="500" y2="300" stroke="#4B9FE1" strokeWidth="0.5" opacity="0.2" />
      <line x1="600" y1="140" x2="700" y2="320" stroke="#D4A83A" strokeWidth="0.5" opacity="0.2" />
      <line x1="900" y1="200" x2="800" y2="340" stroke="#4B9FE1" strokeWidth="0.5" opacity="0.2" />
      {/* Central triangle formed by 3 prominent nodes */}
      <line x1="500" y1="100" x2="700" y2="280" stroke="#D4A83A" strokeWidth="0.8" opacity="0.25" />
      <line x1="700" y1="280" x2="900" y2="100" stroke="#D4A83A" strokeWidth="0.8" opacity="0.25" />
      <line x1="900" y1="100" x2="500" y2="100" stroke="#D4A83A" strokeWidth="0.8" opacity="0.25" />
      {/* Blue nodes */}
      <circle cx="100" cy="100" r="2.5" fill="#4B9FE1" opacity="0.4" />
      <circle cx="300" cy="180" r="2.5" fill="#4B9FE1" opacity="0.4" />
      <circle cx="1100" cy="120" r="2.5" fill="#4B9FE1" opacity="0.35" />
      <circle cx="500" cy="300" r="2" fill="#4B9FE1" opacity="0.3" />
      <circle cx="800" cy="340" r="2" fill="#4B9FE1" opacity="0.3" />
      <circle cx="200" cy="300" r="1.5" fill="#4B9FE1" opacity="0.2" />
      <circle cx="1050" cy="300" r="1.5" fill="#4B9FE1" opacity="0.2" />
      <circle cx="400" cy="50" r="1.5" fill="#4B9FE1" opacity="0.2" />
      <circle cx="750" cy="60" r="1.5" fill="#4B9FE1" opacity="0.2" />
      <circle cx="1000" cy="350" r="1.5" fill="#4B9FE1" opacity="0.15" />
      {/* Gold nodes at triangle vertices */}
      <circle cx="500" cy="100" r="4" fill="#D4A83A" opacity="0.5" />
      <circle cx="500" cy="100" r="2" fill="#D4A83A" />
      <circle cx="700" cy="280" r="4" fill="#D4A83A" opacity="0.5" />
      <circle cx="700" cy="280" r="2" fill="#D4A83A" />
      <circle cx="900" cy="100" r="4" fill="#D4A83A" opacity="0.5" />
      <circle cx="900" cy="100" r="2" fill="#D4A83A" />
      <circle cx="600" cy="140" r="3" fill="#D4A83A" opacity="0.35" />
      <circle cx="900" cy="200" r="3" fill="#D4A83A" opacity="0.35" />
      {/* Gradient mask edges */}
      <defs>
        <radialGradient id="cta-fade" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="white" stopOpacity="1" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
