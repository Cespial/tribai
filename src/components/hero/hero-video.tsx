/**
 * HeroBackground — Pure CSS background with constellation pattern.
 *
 * Image-ready: when Midjourney assets arrive, add them as:
 *   <img src="/hero/constellation-desktop.webp" ... />
 * The gradient overlays ensure text readability over any image.
 */
export function HeroVideo() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {/* Base: deep navy gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_40%,#152240_0%,#0E1B33_40%,#0A1628_100%)]" />

      {/* Constellation: subtle node pattern via radial dots */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 25%, #4B9FE1 1px, transparent 1px),
            radial-gradient(circle at 45% 15%, #D4A83A 1.5px, transparent 1.5px),
            radial-gradient(circle at 75% 35%, #4B9FE1 1px, transparent 1px),
            radial-gradient(circle at 30% 65%, #4B9FE1 1px, transparent 1px),
            radial-gradient(circle at 85% 70%, #D4A83A 1.5px, transparent 1.5px),
            radial-gradient(circle at 60% 55%, #4B9FE1 1px, transparent 1px),
            radial-gradient(circle at 10% 80%, #4B9FE1 1px, transparent 1px),
            radial-gradient(circle at 50% 85%, #4B9FE1 1px, transparent 1px),
            radial-gradient(circle at 90% 20%, #4B9FE1 1px, transparent 1px),
            radial-gradient(circle at 25% 45%, #D4A83A 1px, transparent 1px)
          `,
        }}
      />

      {/* Ambient glow: warm gold from bottom-left */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_10%_90%,rgba(196,149,42,0.06)_0%,transparent_70%)]" />

      {/* Blue glow accent: top-right */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_85%_15%,rgba(75,159,225,0.04)_0%,transparent_70%)]" />

      {/* Noise/grain texture for depth */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Readability gradients (left side for text) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/50 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/40 via-transparent to-transparent" />
    </div>
  );
}
