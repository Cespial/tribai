/**
 * HeroBackground — Animated video with SVG constellation fallback.
 * Video: WebM (VP9) primary, MP4 (H.264) fallback for Safari.
 * SVG constellation remains as visual layer + loading state.
 */
export function HeroVideo() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {/* Base: deep navy gradient (visible while video loads) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_40%,#152240_0%,#0E1B33_40%,#0A1628_100%)]" />

      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/hero/hero-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/hero/hero-bg.webm" type="video/webm" />
        <source src="/hero/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* SVG constellation overlay — adds depth on top of video */}
      <svg
        className="constellation-drift absolute inset-0 h-full w-full opacity-[0.07]"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <line x1="216" y1="225" x2="648" y2="135" stroke="#4B9FE1" strokeWidth="0.8" />
        <line x1="648" y1="135" x2="1080" y2="315" stroke="#4B9FE1" strokeWidth="0.8" />
        <line x1="216" y1="225" x2="432" y2="585" stroke="#4B9FE1" strokeWidth="0.6" />
        <line x1="648" y1="135" x2="432" y2="585" stroke="#4B9FE1" strokeWidth="0.6" />
        <line x1="1080" y1="315" x2="1224" y2="630" stroke="#4B9FE1" strokeWidth="0.6" />
        <line x1="432" y1="585" x2="864" y2="495" stroke="#D4A83A" strokeWidth="0.6" />
        <line x1="864" y1="495" x2="1224" y2="630" stroke="#4B9FE1" strokeWidth="0.6" />
        <circle cx="648" cy="135" r="3.5" fill="#D4A83A" className="animate-node-pulse" />
        <circle cx="864" cy="495" r="3" fill="#D4A83A" className="animate-node-pulse" style={{ animationDelay: "1.5s" }} />
        <circle cx="216" cy="225" r="2.5" fill="#4B9FE1" />
        <circle cx="1080" cy="315" r="2.5" fill="#4B9FE1" />
        <circle cx="432" cy="585" r="2" fill="#4B9FE1" />
        <circle cx="1224" cy="630" r="2" fill="#4B9FE1" />
      </svg>

      {/* Ambient glow: warm gold from bottom-left */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_10%_90%,rgba(196,149,42,0.06)_0%,transparent_70%)]" />

      {/* Blue glow accent: top-right */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_85%_15%,rgba(75,159,225,0.04)_0%,transparent_70%)]" />

      {/* Noise/grain texture for depth */}
      <div className="grain-overlay absolute inset-0" />

      {/* Readability gradients (left side for text) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/60 via-[#0A1628]/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/50 via-transparent to-transparent" />
    </div>
  );
}
