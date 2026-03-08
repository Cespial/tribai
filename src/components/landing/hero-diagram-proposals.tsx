/* ═══════════════════════════════════════════════════════════════
   Hero Diagram Proposals — 3 SVG options for the landing hero
   Each renders at ~350-450px width in the hero's right column
   ═══════════════════════════════════════════════════════════════ */

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PROPOSAL A: "Pipeline Flow"
   Vertical flow showing: Query → AI → Sources → Answer
   Most informative — explains the product at a glance.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProposalPipeline() {
  return (
    <svg
      viewBox="0 0 360 480"
      fill="none"
      className="h-auto w-full max-w-sm"
      aria-hidden="true"
    >
      {/* ── Background dot grid ── */}
      {Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: 7 }, (_, col) => (
          <circle
            key={`d-${row}-${col}`}
            cx={30 + col * 50}
            cy={20 + row * 52}
            r="0.8"
            fill="currentColor"
            opacity="0.06"
          />
        ))
      )}

      {/* ── Stage 1: Query Input ── */}
      <rect
        x="80" y="20" width="200" height="44" rx="8"
        stroke="currentColor" strokeWidth="1" opacity="0.15"
      />
      <circle cx="106" cy="42" r="5" fill="var(--tribai-blue)" opacity="0.12" />
      <circle cx="106" cy="42" r="2" fill="var(--tribai-blue)" opacity="0.5" />
      <text
        x="190" y="47" textAnchor="middle"
        fill="currentColor" fontSize="12" fontWeight="500" opacity="0.5"
      >
        Su consulta tributaria
      </text>

      {/* ── Connector: Query → AI ── */}
      <line x1="180" y1="64" x2="180" y2="104" stroke="var(--tribai-blue)" strokeWidth="1.2" opacity="0.25" />
      <path d="M175 98l5 7 5-7" stroke="var(--tribai-blue)" strokeWidth="1" opacity="0.25" fill="none" />

      {/* ── Stage 2: AI Processing (hero node) ── */}
      <rect
        x="50" y="108" width="260" height="60" rx="10"
        stroke="var(--tribai-blue)" strokeWidth="1.5" opacity="0.25"
      />
      <rect
        x="52" y="110" width="256" height="56" rx="9"
        fill="var(--tribai-blue)" opacity="0.03"
      />
      {/* Pulse rings */}
      <circle cx="88" cy="138" r="14" stroke="var(--tribai-blue)" strokeWidth="0.8" opacity="0.1" />
      <circle cx="88" cy="138" r="8" stroke="var(--tribai-blue)" strokeWidth="1" opacity="0.2" />
      <circle cx="88" cy="138" r="3.5" fill="var(--tribai-blue)" />
      <text
        x="210" y="133" textAnchor="middle"
        fill="currentColor" fontSize="14" fontWeight="700" opacity="0.75"
      >
        tribai IA
      </text>
      <text
        x="210" y="150" textAnchor="middle"
        fill="currentColor" fontSize="10.5" opacity="0.35"
      >
        36.000 vectores normativos
      </text>

      {/* ── Connectors: AI → 3 Sources ── */}
      <line x1="120" y1="168" x2="80" y2="218" stroke="currentColor" strokeWidth="0.8" opacity="0.12" />
      <line x1="180" y1="168" x2="180" y2="218" stroke="var(--tribai-blue)" strokeWidth="0.8" opacity="0.15" />
      <line x1="240" y1="168" x2="280" y2="218" stroke="currentColor" strokeWidth="0.8" opacity="0.12" />

      {/* ── Stage 3a: ET (primary source, blue accent) ── */}
      <rect
        x="30" y="218" width="100" height="76" rx="8"
        stroke="var(--tribai-blue)" strokeWidth="1.2" opacity="0.2"
      />
      <rect
        x="32" y="220" width="96" height="72" rx="7"
        fill="var(--tribai-blue)" opacity="0.02"
      />
      <text
        x="80" y="250" textAnchor="middle"
        fill="var(--tribai-blue)" fontSize="22" fontWeight="700" opacity="0.75"
      >
        1.294
      </text>
      <text
        x="80" y="268" textAnchor="middle"
        fill="currentColor" fontSize="10" fontWeight="500" opacity="0.45"
      >
        Artículos del ET
      </text>
      <text
        x="80" y="282" textAnchor="middle"
        fill="currentColor" fontSize="8.5" opacity="0.28"
      >
        Vigente + reformas
      </text>

      {/* ── Stage 3b: Doctrina ── */}
      <rect
        x="140" y="218" width="80" height="76" rx="8"
        stroke="currentColor" strokeWidth="1" opacity="0.13"
      />
      <text
        x="180" y="250" textAnchor="middle"
        fill="currentColor" fontSize="20" fontWeight="700" opacity="0.55"
      >
        841
      </text>
      <text
        x="180" y="268" textAnchor="middle"
        fill="currentColor" fontSize="10" fontWeight="500" opacity="0.4"
      >
        Doctrina
      </text>
      <text
        x="180" y="282" textAnchor="middle"
        fill="currentColor" fontSize="8.5" opacity="0.25"
      >
        Conceptos DIAN
      </text>

      {/* ── Stage 3c: Otros ── */}
      <rect
        x="230" y="218" width="100" height="76" rx="8"
        stroke="currentColor" strokeWidth="1" opacity="0.13"
      />
      <text
        x="280" y="248" textAnchor="middle"
        fill="currentColor" fontSize="17" fontWeight="700" opacity="0.55"
      >
        3.600+
      </text>
      <text
        x="280" y="266" textAnchor="middle"
        fill="currentColor" fontSize="10" fontWeight="500" opacity="0.4"
      >
        Decretos y leyes
      </text>
      <text
        x="280" y="280" textAnchor="middle"
        fill="currentColor" fontSize="8.5" opacity="0.25"
      >
        Jurisprudencia
      </text>

      {/* ── Connectors: Sources → Result ── */}
      <line x1="80" y1="294" x2="130" y2="354" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
      <line x1="180" y1="294" x2="180" y2="354" stroke="var(--tribai-blue)" strokeWidth="0.8" opacity="0.12" />
      <line x1="280" y1="294" x2="230" y2="354" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
      <path d="M175 348l5 7 5-7" stroke="var(--tribai-blue)" strokeWidth="1" opacity="0.2" fill="none" />

      {/* ── Stage 4: Result ── */}
      <rect
        x="50" y="358" width="260" height="60" rx="10"
        stroke="var(--tribai-blue)" strokeWidth="1.2" opacity="0.2"
      />
      {/* Check circle */}
      <circle cx="88" cy="388" r="10" fill="var(--tribai-blue)" opacity="0.08" />
      <path
        d="M83 388l3.5 3.5 7-7"
        stroke="var(--tribai-blue)" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.55"
      />
      <text
        x="210" y="383" textAnchor="middle"
        fill="currentColor" fontSize="13" fontWeight="600" opacity="0.65"
      >
        Respuesta + artículo
      </text>
      <text
        x="210" y="400" textAnchor="middle"
        fill="currentColor" fontSize="10.5" opacity="0.35"
      >
        Con fuente normativa verificable
      </text>

      {/* ── Side labels (rotated) ── */}
      <text
        x="0" y="0" fill="currentColor" fontSize="8" opacity="0.15"
        fontWeight="600" letterSpacing="0.1em"
        transform="translate(14, 178) rotate(-90)"
      >
        PROCESAMIENTO
      </text>
      <text
        x="0" y="0" fill="currentColor" fontSize="8" opacity="0.15"
        fontWeight="600" letterSpacing="0.1em"
        transform="translate(14, 310) rotate(-90)"
      >
        FUENTES
      </text>

      {/* ── Decorative: subtle vertical guide line ── */}
      <line x1="180" y1="8" x2="180" y2="472" stroke="currentColor" strokeWidth="0.5" opacity="0.04" strokeDasharray="4 8" />
    </svg>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PROPOSAL B: "Constellation" — Production-Quality Hero
   Central AI hub with 6 orbiting data source nodes.
   Multi-layered SVG with gradients, glow filters, animated
   data-flow particles, orbital rings, and entrance stagger.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProposalConstellation() {
  const cx = 200;
  const cy = 200;
  const orbit = 140;

  const sources: {
    label: string;
    count: string;
    angle: number;
    accent: boolean;
  }[] = [
    { label: "Estatuto Tributario", count: "1.294", angle: -90, accent: true },
    { label: "Doctrina DIAN", count: "841", angle: -30, accent: false },
    { label: "Jurisprudencia", count: "175", angle: 30, accent: false },
    { label: "Decretos", count: "2.793", angle: 90, accent: false },
    { label: "Resoluciones", count: "626", angle: 150, accent: false },
    { label: "Leyes", count: "8", angle: 210, accent: false },
  ];

  /* ── Helper: polar → cartesian ── */
  const pos = (angleDeg: number, r: number) => ({
    x: cx + Math.cos((angleDeg * Math.PI) / 180) * r,
    y: cy + Math.sin((angleDeg * Math.PI) / 180) * r,
  });

  /* ── Helper: quadratic Bézier with perpendicular control offset ── */
  const bezier = (x1: number, y1: number, x2: number, y2: number, offset = 18) => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const qx = mx + nx * offset;
    const qy = my + ny * offset;
    return { d: `M${x1},${y1} Q${qx},${qy} ${x2},${y2}`, qx, qy };
  };

  /* Pre-compute satellite positions */
  const satellites = sources.map((s) => ({
    ...s,
    ...pos(s.angle, orbit),
    nodeR: s.accent ? 30 : 24,
  }));

  return (
    <svg
      viewBox="0 0 400 430"
      fill="none"
      className="constellation-enter h-auto w-full max-w-sm"
      aria-hidden="true"
    >
      {/* ═══ LAYER 0: Definitions ═══ */}
      <defs>
        {/* Gradients */}
        <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--tribai-blue)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--tribai-blue)" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="atmosphere-glow" cx="50%" cy="47%" r="50%">
          <stop offset="0%" stopColor="var(--tribai-blue)" stopOpacity="0.06" />
          <stop offset="60%" stopColor="var(--tribai-blue)" stopOpacity="0.02" />
          <stop offset="100%" stopColor="var(--tribai-blue)" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="et-node-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--tribai-blue)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--tribai-blue)" stopOpacity="0.02" />
        </radialGradient>

        <radialGradient id="node-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.06" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.01" />
        </radialGradient>

        {/* Filters */}
        <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
        </filter>

        <filter id="glow-core" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur2" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ═══ LAYER 1: Atmospheric halos ═══ */}
      <circle cx={cx} cy={cy - 10} r="200" fill="url(#atmosphere-glow)" />
      <circle cx={cx} cy={cy} r="130" fill="url(#atmosphere-glow)" />

      {/* ═══ LAYER 2: Micro dot grid ═══ */}
      {Array.from({ length: 12 }, (_, row) =>
        Array.from({ length: 11 }, (_, col) => (
          <circle
            key={`grid-${row}-${col}`}
            cx={25 + col * 35}
            cy={15 + row * 35}
            r="0.5"
            fill="currentColor"
            opacity="0.04"
          />
        ))
      )}

      {/* ═══ LAYER 3: Scatter particles ═══ */}
      {[
        [32, 48, 1.0], [365, 55, 0.8], [52, 365, 0.7], [355, 370, 0.9],
        [175, 10, 0.8], [18, 190, 1.0], [382, 210, 0.7], [135, 405, 0.8],
        [275, 415, 0.9], [88, 88, 0.7], [320, 105, 0.8], [58, 280, 0.9],
        [338, 305, 0.7], [195, 420, 0.8], [258, 32, 0.7], [15, 130, 0.6],
        [385, 155, 0.7], [110, 370, 0.6], [305, 380, 0.8], [42, 220, 0.7],
        [360, 240, 0.6], [145, 18, 0.7], [240, 8, 0.6], [78, 315, 0.7],
        [325, 340, 0.6], [395, 85, 0.5], [5, 310, 0.6], [220, 395, 0.5],
        [280, 22, 0.6], [65, 155, 0.5], [340, 165, 0.6], [125, 335, 0.5],
        [290, 355, 0.6], [180, 385, 0.5], [50, 45, 0.6],
      ].map(([x, y, r], i) => (
        <circle
          key={`scatter-${i}`}
          cx={x}
          cy={y}
          r={r}
          fill="currentColor"
          className={i % 3 === 0 ? "constellation-twinkle" : undefined}
          opacity={i % 3 === 0 ? undefined : "0.05"}
        />
      ))}

      {/* ═══ LAYER 4: Orbital rings ═══ */}
      <g className="constellation-orbit-rotate">
        <circle
          cx={cx} cy={cy} r={orbit}
          stroke="currentColor" strokeWidth="0.6" opacity="0.07"
          strokeDasharray="6 10"
        />
      </g>
      <circle
        cx={cx} cy={cy} r={orbit * 0.65}
        stroke="currentColor" strokeWidth="0.5" opacity="0.05"
      />
      <g className="constellation-orbit-rotate-reverse">
        <circle
          cx={cx} cy={cy} r={orbit * 0.35}
          stroke="var(--tribai-blue)" strokeWidth="0.5" opacity="0.08"
          strokeDasharray="4 8"
        />
      </g>

      {/* ═══ LAYER 5: Cross-connections (arcs between adjacent satellites) ═══ */}
      {satellites.map((s, i) => {
        const next = satellites[(i + 1) % satellites.length];
        const { d } = bezier(s.x, s.y, next.x, next.y, 22);
        return (
          <path
            key={`cross-${i}`}
            d={d}
            stroke="currentColor"
            strokeWidth="0.4"
            opacity="0.06"
            fill="none"
            strokeDasharray="3 6"
          />
        );
      })}

      {/* ═══ LAYER 6: Connection paths (bezier curves hub → satellite) ═══ */}
      {satellites.map((s, i) => {
        const { d } = bezier(cx, cy, s.x, s.y, 18);
        return (
          <path
            key={`conn-${i}`}
            d={d}
            stroke={s.accent ? "var(--tribai-blue)" : "currentColor"}
            strokeWidth={s.accent ? "1" : "0.7"}
            opacity={s.accent ? "0.18" : "0.09"}
            fill="none"
          />
        );
      })}

      {/* ═══ LAYER 7: Data flow particles ═══ */}
      {satellites.map((s, i) => {
        const { d } = bezier(cx, cy, s.x, s.y, 18);
        return (
          <path
            key={`flow-${i}`}
            d={d}
            stroke={s.accent ? "var(--tribai-blue)" : "currentColor"}
            strokeWidth={s.accent ? "1.5" : "1"}
            opacity={s.accent ? "0.35" : "0.15"}
            fill="none"
            strokeDasharray="4 28"
            className={`constellation-flow constellation-flow-delay-${i}`}
          />
        );
      })}

      {/* ═══ LAYER 8: Central AI hub (8 concentric elements) ═══ */}
      {/* 8a. Glow circle */}
      <circle cx={cx} cy={cy} r="50" fill="var(--tribai-blue)" opacity="0.06" filter="url(#glow-soft)" />
      {/* 8b. Pulse ring outer */}
      <circle
        cx={cx} cy={cy} r="44"
        stroke="var(--tribai-blue)" strokeWidth="1"
        fill="none"
        className="constellation-pulse-outer"
      />
      {/* 8c. Mid ring (structural) */}
      <circle
        cx={cx} cy={cy} r="36"
        stroke="var(--tribai-blue)" strokeWidth="0.6"
        opacity="0.12" fill="none"
      />
      {/* 8d. Pulse ring inner */}
      <circle
        cx={cx} cy={cy} r="26"
        stroke="var(--tribai-blue)" strokeWidth="0.8"
        fill="none"
        className="constellation-pulse-inner"
      />
      {/* 8e. Gradient fill disc */}
      <circle cx={cx} cy={cy} r="18" fill="url(#hub-glow)" />
      {/* 8f. Solid disc */}
      <circle cx={cx} cy={cy} r="10" fill="var(--tribai-blue)" opacity="0.15" />
      {/* 8g. Core dot with glow */}
      <circle
        cx={cx} cy={cy} r="4.5"
        fill="var(--tribai-blue)"
        filter="url(#glow-core)"
        className="constellation-core-pulse"
      />
      {/* 8h. Center point */}
      <circle cx={cx} cy={cy} r="2" fill="var(--tribai-blue)" opacity="0.9" />

      {/* ═══ LAYER 9: Hub labels ═══ */}
      <text
        x={cx} y={cy + 58} textAnchor="middle"
        fill="currentColor" fontSize="14" fontWeight="700" opacity="0.75"
        fontFamily="var(--font-body)"
      >
        tribai IA
      </text>
      <text
        x={cx} y={cy + 73} textAnchor="middle"
        fill="currentColor" fontSize="10" opacity="0.35"
        fontFamily="var(--font-mono)"
        letterSpacing="-0.01em"
      >
        36.000 vectores
      </text>

      {/* ═══ LAYER 10: Satellite nodes ═══ */}
      {satellites.map((s, i) => {
        const labelY = s.accent
          ? s.y - s.nodeR - 10 /* ET label above */
          : s.y + s.nodeR + 14;
        return (
          <g
            key={`node-${i}`}
            className={`constellation-node-entrance constellation-node-delay-${i}`}
            style={{ transformOrigin: `${s.x}px ${s.y}px` }}
          >
            {/* Outer glow ring (accent only) */}
            {s.accent && (
              <circle
                cx={s.x} cy={s.y} r={s.nodeR + 4}
                stroke="var(--tribai-blue)" strokeWidth="0.5"
                opacity="0.1" fill="none"
                className="constellation-pulse-outer"
                style={{ transformOrigin: `${s.x}px ${s.y}px` }}
              />
            )}

            {/* Main ring */}
            <circle
              cx={s.x} cy={s.y} r={s.nodeR}
              stroke={s.accent ? "var(--tribai-blue)" : "currentColor"}
              strokeWidth={s.accent ? "1.2" : "0.8"}
              opacity={s.accent ? "0.3" : "0.14"}
              fill="none"
            />

            {/* Inner gradient fill */}
            <circle
              cx={s.x} cy={s.y} r={s.nodeR}
              fill={s.accent ? "url(#et-node-fill)" : "url(#node-fill)"}
            />

            {/* Inner detail ring */}
            <circle
              cx={s.x} cy={s.y} r={s.nodeR * 0.55}
              stroke={s.accent ? "var(--tribai-blue)" : "currentColor"}
              strokeWidth="0.4"
              opacity={s.accent ? "0.12" : "0.06"}
              fill="none"
            />

            {/* Activity indicator dot */}
            <circle
              cx={s.x + s.nodeR * 0.65}
              cy={s.y - s.nodeR * 0.65}
              r="2"
              fill={s.accent ? "var(--tribai-blue)" : "currentColor"}
              opacity={s.accent ? "0.5" : "0.2"}
              className="constellation-core-pulse"
            />

            {/* Count */}
            <text
              x={s.x} y={s.y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill={s.accent ? "var(--tribai-blue)" : "currentColor"}
              fontSize={s.accent ? "15" : "13"}
              fontWeight="700"
              fontFamily="var(--font-mono)"
              opacity={s.accent ? "0.75" : "0.5"}
            >
              {s.count}
            </text>

            {/* Label */}
            <text
              x={s.x} y={labelY}
              textAnchor="middle"
              fill="currentColor"
              fontSize="9"
              fontWeight="500"
              opacity="0.6"
              fontFamily="var(--font-body)"
            >
              {s.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PROPOSAL C: "Knowledge Network"
   Abstract mesh of interconnected nodes with cluster zones.
   Most atmospheric — modern SaaS aesthetic like Linear/Stripe.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProposalNetwork() {
  // Pre-defined node positions in 3 clusters
  const clusterET = [
    [70, 80], [95, 55], [120, 90], [55, 120], [100, 130],
    [140, 60], [75, 160], [130, 150], [45, 90], [110, 110],
    [85, 140], [60, 55], [150, 110], [90, 170],
  ];
  const clusterDoctrina = [
    [230, 70], [260, 95], [245, 130], [210, 100], [280, 70],
    [270, 140], [225, 55], [295, 110], [250, 160], [215, 140],
    [260, 50], [240, 105],
  ];
  const clusterJuris = [
    [170, 230], [200, 250], [230, 220], [155, 260], [195, 280],
    [240, 260], [165, 215], [215, 290], [180, 300], [250, 240],
    [145, 240], [270, 275],
  ];

  // Connector logic: connect nodes within threshold distance
  function getEdges(nodes: number[][], maxDist: number) {
    const edges: [number, number, number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i][0] - nodes[j][0];
        const dy = nodes[i][1] - nodes[j][1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          edges.push([nodes[i][0], nodes[i][1], nodes[j][0], nodes[j][1]]);
        }
      }
    }
    return edges;
  }

  // Cross-cluster bridges
  const bridges: [number, number, number, number][] = [
    [150, 110, 210, 100],
    [130, 150, 170, 230],
    [250, 160, 240, 260],
    [140, 60, 225, 55],
    [100, 130, 165, 215],
    [295, 110, 270, 275],
  ];

  const etEdges = getEdges(clusterET, 65);
  const docEdges = getEdges(clusterDoctrina, 65);
  const jurEdges = getEdges(clusterJuris, 65);

  return (
    <svg
      viewBox="0 0 360 380"
      fill="none"
      className="h-auto w-full max-w-sm"
      aria-hidden="true"
    >
      {/* ── Cluster zone halos ── */}
      <circle cx="95" cy="110" r="70" fill="var(--tribai-blue)" opacity="0.015" />
      <circle cx="255" cy="100" r="60" fill="currentColor" opacity="0.012" />
      <circle cx="200" cy="255" r="60" fill="currentColor" opacity="0.012" />

      {/* ── Intra-cluster edges ── */}
      {etEdges.map(([x1, y1, x2, y2], i) => (
        <line key={`et-e-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="var(--tribai-blue)" strokeWidth="0.6" opacity="0.1" />
      ))}
      {docEdges.map(([x1, y1, x2, y2], i) => (
        <line key={`doc-e-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="currentColor" strokeWidth="0.5" opacity="0.07" />
      ))}
      {jurEdges.map(([x1, y1, x2, y2], i) => (
        <line key={`jur-e-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="currentColor" strokeWidth="0.5" opacity="0.07" />
      ))}

      {/* ── Cross-cluster bridges ── */}
      {bridges.map(([x1, y1, x2, y2], i) => (
        <line key={`br-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="var(--tribai-blue)" strokeWidth="0.5" opacity="0.06"
          strokeDasharray="3 4"
        />
      ))}

      {/* ── Cluster ET nodes ── */}
      {clusterET.map(([x, y], i) => (
        <circle key={`et-${i}`} cx={x} cy={y}
          r={i < 3 ? "3.5" : "2.5"}
          fill="var(--tribai-blue)"
          opacity={i < 3 ? "0.45" : "0.25"}
        />
      ))}
      {/* ── Cluster Doctrina nodes ── */}
      {clusterDoctrina.map(([x, y], i) => (
        <circle key={`doc-${i}`} cx={x} cy={y}
          r={i < 2 ? "3" : "2"}
          fill="currentColor"
          opacity={i < 2 ? "0.3" : "0.18"}
        />
      ))}
      {/* ── Cluster Jurisprudencia nodes ── */}
      {clusterJuris.map(([x, y], i) => (
        <circle key={`jur-${i}`} cx={x} cy={y}
          r={i < 2 ? "3" : "2"}
          fill="currentColor"
          opacity={i < 2 ? "0.3" : "0.18"}
        />
      ))}

      {/* ── Cluster labels ── */}
      <text x="95" y="196" textAnchor="middle" fill="var(--tribai-blue)"
        fontSize="11" fontWeight="700" opacity="0.5">
        ET · 1.294
      </text>
      <text x="260" y="178" textAnchor="middle" fill="currentColor"
        fontSize="10" fontWeight="600" opacity="0.3">
        Doctrina · 841
      </text>
      <text x="200" y="325" textAnchor="middle" fill="currentColor"
        fontSize="10" fontWeight="600" opacity="0.3">
        Jurisprudencia + Decretos
      </text>

      {/* ── Query input pulse (left) ── */}
      <circle cx="20" cy="170" r="8" stroke="var(--tribai-blue)" strokeWidth="1" opacity="0.2" />
      <circle cx="20" cy="170" r="3" fill="var(--tribai-blue)" opacity="0.5" />
      <line x1="28" y1="170" x2="50" y2="140" stroke="var(--tribai-blue)" strokeWidth="0.8" opacity="0.15" />
      <text x="18" y="190" textAnchor="middle" fill="currentColor"
        fontSize="8" opacity="0.25">
        Consulta
      </text>

      {/* ── Result output (right) ── */}
      <circle cx="340" cy="200" r="8" stroke="var(--tribai-blue)" strokeWidth="1" opacity="0.2" />
      <circle cx="340" cy="200" r="3" fill="var(--tribai-blue)" opacity="0.5" />
      <line x1="310" y1="240" x2="332" y2="204" stroke="var(--tribai-blue)" strokeWidth="0.8" opacity="0.15" />
      {/* Check mark in result */}
      <path d="M336 200l2.5 2.5 5-5" stroke="var(--tribai-blue)" strokeWidth="1" strokeLinecap="round" opacity="0.4" fill="none" />
      <text x="340" y="220" textAnchor="middle" fill="currentColor"
        fontSize="8" opacity="0.25">
        Respuesta
      </text>

      {/* ── Bottom label ── */}
      <text x="180" y="365" textAnchor="middle" fill="currentColor"
        fontSize="10.5" fontWeight="500" opacity="0.25">
        36.000 vectores de conocimiento normativo
      </text>
    </svg>
  );
}
