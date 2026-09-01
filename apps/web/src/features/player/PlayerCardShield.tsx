import type { PlayerCardFace } from "./playerCardModel";

// The card is one self-contained SVG: foil burst, marble grain, bevel and
// gloss are vector and filter effects rather than raster art, so the identical
// artwork can be scaled up for a printed run. Every ornament here is our own —
// no club badge, league mark, or player likeness is reproduced.

const SHIELD = "M24 30 C24 20 32 12 42 12 L278 12 C288 12 296 20 296 30 L296 386 C296 424 256 448 160 466 C64 448 24 424 24 386 Z";
const INNER = "M40 32 C40 25 45 21 51 21 L269 21 C275 21 280 25 280 32 L280 380 C280 411 246 432 160 449 C74 432 40 411 40 380 Z";

const RAY_COUNT = 28;
const RAY_ORIGIN = { x: 198, y: 152 };
const RAY_REACH = 520;
const RAY_SPREAD = Math.PI / 52;

function rayPath(index: number): string {
  const angle = (index / RAY_COUNT) * Math.PI * 2;
  const point = (offset: number) => {
    const x = RAY_ORIGIN.x + Math.cos(angle + offset) * RAY_REACH;
    const y = RAY_ORIGIN.y + Math.sin(angle + offset) * RAY_REACH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };
  return `M${RAY_ORIGIN.x},${RAY_ORIGIN.y} L${point(-RAY_SPREAD)} L${point(RAY_SPREAD)} Z`;
}

export function PlayerCardShield({ card, photoUrl }: { readonly card: PlayerCardFace; readonly photoUrl?: string | null }) {
  return (
    <svg
      className="player-card-shield"
      viewBox="0 0 320 480"
      role="img"
      aria-label={`${card.displayName} 카드, 종합 ${card.rating}, ${card.position}`}
    >
      <defs>
        <linearGradient id="cardPlate" x1="0.12" y1="0" x2="0.88" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--plate-1)" }} />
          <stop offset="18%" style={{ stopColor: "var(--plate-2)" }} />
          <stop offset="46%" style={{ stopColor: "var(--plate-3)" }} />
          <stop offset="76%" style={{ stopColor: "var(--plate-4)" }} />
          <stop offset="100%" style={{ stopColor: "var(--plate-5)" }} />
        </linearGradient>
        <linearGradient id="cardEdge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--edge-bright)" }} />
          <stop offset="38%" style={{ stopColor: "var(--edge-deep)" }} />
          <stop offset="66%" style={{ stopColor: "var(--edge-bright)" }} />
          <stop offset="100%" style={{ stopColor: "var(--edge-deep)" }} />
        </linearGradient>
        <radialGradient id="cardVignette" cx="0.52" cy="0.36" r="0.8">
          <stop offset="52%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" style={{ stopColor: "var(--vignette)" }} />
        </radialGradient>
        <linearGradient id="cardGloss" x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.40)" />
          <stop offset="38%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id="cardBand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="34%" style={{ stopColor: "var(--band)" }} />
          <stop offset="66%" style={{ stopColor: "var(--band)" }} />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <filter id="cardGrain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="7" result="grain" />
          <feColorMatrix in="grain" type="saturate" values="0" result="mono" />
          <feComponentTransfer in="mono">
            <feFuncA type="linear" slope="0.12" intercept="0" />
          </feComponentTransfer>
        </filter>
        <filter id="cardMarble" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.028" numOctaves="4" seed="19" result="veins" />
          <feColorMatrix in="veins" type="saturate" values="0" result="grey" />
          <feComponentTransfer in="grey">
            <feFuncA type="linear" slope="0.22" intercept="0" />
          </feComponentTransfer>
        </filter>
        <radialGradient id="rayFade" cx="0.62" cy="0.32" r="0.66">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="rayMask">
          <rect x="0" y="0" width="320" height="480" fill="url(#rayFade)" />
        </mask>
        <linearGradient id="photoFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="72%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="photoMask">
          <rect x="52" y="34" width="216" height="274" rx="10" fill="url(#photoFade)" />
        </mask>
        <linearGradient id="ratingScrim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" style={{ stopColor: "var(--plate-3)" }} stopOpacity="0.96" />
          <stop offset="62%" style={{ stopColor: "var(--plate-3)" }} stopOpacity="0.72" />
          <stop offset="100%" style={{ stopColor: "var(--plate-3)" }} stopOpacity="0" />
        </linearGradient>
        <clipPath id="cardClip">
          <path d={SHIELD} />
        </clipPath>
      </defs>

      <path d={SHIELD} fill="url(#cardPlate)" />

      <g clipPath="url(#cardClip)">
        <g mask="url(#rayMask)">
          {Array.from({ length: RAY_COUNT }, (_, index) => (
            <path
              key={index}
              className={index % 2 === 0 ? "player-card-ray" : "player-card-ray player-card-ray-dark"}
              d={rayPath(index)}
            />
          ))}
        </g>

        <rect x="0" y="0" width="320" height="480" filter="url(#cardMarble)" className="player-card-marble" />

        {photoUrl ? (
          <>
            <image
              className="player-card-photo"
              href={photoUrl}
              x="52"
              y="34"
              width="216"
              height="274"
              preserveAspectRatio="xMidYMid slice"
              mask="url(#photoMask)"
            />
            {/* Keeps the rating readable over any photo a player picks. */}
            <rect x="24" y="34" width="112" height="160" fill="url(#ratingScrim)" />
          </>
        ) : (
          <g className="player-card-silhouette">
            <circle cx="198" cy="152" r="50" />
            <path d="M198 210 C144 210 116 252 112 304 L284 304 C280 252 252 210 198 210 Z" />
          </g>
        )}

        <rect x="0" y="0" width="320" height="480" fill="url(#cardVignette)" />
        <rect x="0" y="0" width="320" height="480" filter="url(#cardGrain)" opacity="0.55" />
        <path d="M24 12 L188 12 L58 466 L24 396 Z" fill="url(#cardGloss)" />
        <rect x="24" y="284" width="272" height="66" fill="url(#cardBand)" />
      </g>

      <path className="player-card-bevel-outer" d={SHIELD} />
      <path className="player-card-bevel-inner" d={INNER} />

      <g className="player-card-ornament">
        <path d="M152 30 L160 22 L168 30 L160 38 Z" />
        <path d="M138 30 L146 25 L146 35 Z" />
        <path d="M182 30 L174 25 L174 35 Z" />
        <circle className="player-card-ornament-disc" cx="160" cy="437" r="10" />
        <path
          className="player-card-ornament-star"
          d="M160 431 L162.5 436.1 L168.2 436.9 L164.1 440.8 L165.1 446.4 L160 443.7 L154.9 446.4 L155.9 440.8 L151.8 436.9 L157.5 436.1 Z"
        />
      </g>

      <text className="player-card-svg-rating player-card-rating" x="68" y="100" textAnchor="middle">{card.rating}</text>
      <text className="player-card-svg-position" x="68" y="134" textAnchor="middle">{card.positionCode}</text>
      <line className="player-card-rule player-card-rule-short" x1="48" y1="150" x2="88" y2="150" />
      <text className="player-card-svg-shirt" x="68" y="172" textAnchor="middle">#{card.shirtNumber}</text>

      <text className="player-card-svg-name" x="160" y="324" textAnchor="middle">{card.displayName}</text>
      <line className="player-card-rule" x1="60" y1="344" x2="260" y2="344" />

      {card.stats.map((stat, index) => {
        const column = index % 2;
        const row = Math.floor(index / 2);
        const valueX = column === 0 ? 118 : 216;
        const keyX = column === 0 ? 126 : 224;
        const y = 370 + row * 28;
        return (
          <g key={stat.key} data-testid="player-card-stat">
            <text className="player-card-svg-stat-value" x={valueX} y={y} textAnchor="end">{stat.value}</text>
            <text className="player-card-svg-stat-key" x={keyX} y={y}>{stat.key}</text>
            <title>{stat.label} {stat.value}</title>
          </g>
        );
      })}
      <line className="player-card-rule" x1="160" y1="352" x2="160" y2="424" />
    </svg>
  );
}
