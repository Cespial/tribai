/**
 * HeroBackground — SVG constellation pattern with animated nodes.
 * Replaces CSS radial-gradient dots with proper SVG circles + lines.
 */
export function HeroVideo() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {/* Base: deep navy gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_40%,#152240_0%,#0E1B33_40%,#0A1628_100%)]" />

      {/* Constellation: SVG inline with nodes + connections */}
      <svg
        className="constellation-drift absolute inset-0 h-full w-full opacity-[0.12]"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Connection lines between nodes */}
        <line x1="216" y1="225" x2="648" y2="135" stroke="#4B9FE1" strokeWidth="0.8" />
        <line x1="648" y1="135" x2="1080" y2="315" stroke="#4B9FE1" strokeWidth="0.8" />
        <line x1="216" y1="225" x2="432" y2="585" stroke="#4B9FE1" strokeWidth="0.6" />
        <line x1="648" y1="135" x2="432" y2="585" stroke="#4B9FE1" strokeWidth="0.6" />
        <line x1="1080" y1="315" x2="1224" y2="630" stroke="#4B9FE1" strokeWidth="0.6" />
        <line x1="432" y1="585" x2="864" y2="495" stroke="#D4A83A" strokeWidth="0.6" />
        <line x1="864" y1="495" x2="1224" y2="630" stroke="#4B9FE1" strokeWidth="0.6" />
        <line x1="144" y1="720" x2="432" y2="585" stroke="#4B9FE1" strokeWidth="0.5" />
        <line x1="720" y1="765" x2="864" y2="495" stroke="#4B9FE1" strokeWidth="0.5" />
        <line x1="1296" y1="180" x2="1080" y2="315" stroke="#4B9FE1" strokeWidth="0.5" />

        {/* Blue nodes */}
        <circle cx="216" cy="225" r="2.5" fill="#4B9FE1" />
        <circle cx="1080" cy="315" r="2.5" fill="#4B9FE1" />
        <circle cx="432" cy="585" r="2" fill="#4B9FE1" />
        <circle cx="1224" cy="630" r="2" fill="#4B9FE1" />
        <circle cx="144" cy="720" r="2" fill="#4B9FE1" />
        <circle cx="720" cy="765" r="2" fill="#4B9FE1" />
        <circle cx="1296" cy="180" r="2" fill="#4B9FE1" />
        <circle cx="360" cy="360" r="1.5" fill="#4B9FE1" />
        <circle cx="936" cy="180" r="1.5" fill="#4B9FE1" />
        <circle cx="576" cy="720" r="1.5" fill="#4B9FE1" />
        <circle cx="1080" cy="720" r="1.5" fill="#4B9FE1" />
        <circle cx="180" cy="450" r="1.5" fill="#4B9FE1" />

        {/* Gold accent nodes — strategic positions */}
        <circle cx="648" cy="135" r="3.5" fill="#D4A83A" className="animate-node-pulse" />
        <circle cx="864" cy="495" r="3" fill="#D4A83A" className="animate-node-pulse" style={{ animationDelay: "1.5s" }} />
        <circle cx="360" cy="810" r="2.5" fill="#D4A83A" className="animate-node-pulse" style={{ animationDelay: "3s" }} />
        <circle cx="1152" cy="450" r="2.5" fill="#D4A83A" />

        {/* Extra scattered dots for density */}
        <circle cx="72" cy="135" r="1" fill="#4B9FE1" opacity="0.5" />
        <circle cx="1368" cy="405" r="1" fill="#4B9FE1" opacity="0.5" />
        <circle cx="504" cy="315" r="1" fill="#4B9FE1" opacity="0.4" />
        <circle cx="792" cy="630" r="1" fill="#4B9FE1" opacity="0.4" />
      </svg>

      {/* Ambient glow: warm gold from bottom-left */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_10%_90%,rgba(196,149,42,0.06)_0%,transparent_70%)]" />

      {/* Blue glow accent: top-right */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_85%_15%,rgba(75,159,225,0.04)_0%,transparent_70%)]" />

      {/* Noise/grain texture for depth */}
      <div className="grain-overlay absolute inset-0" />

      {/* Readability gradients (left side for text) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/50 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/40 via-transparent to-transparent" />
    </div>
  );
}
