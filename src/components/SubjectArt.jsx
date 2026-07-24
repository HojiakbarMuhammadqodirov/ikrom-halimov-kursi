// Subject art — inline SVG illustrations for the Fizika & Matematika theme.
// No external dependencies, no network, no dangerouslySetInnerHTML.
// Each illustration accepts className / accent overrides so the same art
// can be reused at multiple opacities and sizes.

import React from 'react';

const STROKE = 'currentColor';
const FILL = 'none';

/* ============================================================
   ATOM ORBIT — three elliptical orbits around a nucleus.
   Used in the login aside behind the headline.
   ============================================================ */
export function AtomOrbit({ className, accent = 'currentColor', size = 480 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      fill={FILL}
      stroke={STROKE}
      strokeWidth="0.6"
      aria-hidden="true"
    >
      <g opacity="0.95">
        {/* Three tilted orbits */}
        <ellipse cx="0" cy="0" rx="90" ry="34" transform="rotate(0)" />
        <ellipse cx="0" cy="0" rx="90" ry="34" transform="rotate(60)" />
        <ellipse cx="0" cy="0" rx="90" ry="34" transform="rotate(-60)" />

        {/* Nucleus */}
        <circle cx="0" cy="0" r="9" fill={accent} stroke="none" />
        <circle cx="0" cy="0" r="3" fill="#fff" stroke="none" />

        {/* Electron dots */}
        <circle cx="90" cy="0" r="2" fill={STROKE} stroke="none" />
        <circle cx="-45" cy="-29" r="2" fill={STROKE} stroke="none" />
        <circle cx="-45" cy="29" r="2" fill={STROKE} stroke="none" />
      </g>
    </svg>
  );
}

/* ============================================================
   INTEGRAL GLYPH — large stylized ∫ with a curve under it.
   Used as an empty-state illustration.
   ============================================================ */
export function IntegralGlyph({ className, accent = 'currentColor', size = 200 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill={FILL}
      stroke={STROKE}
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {/* The integral sign — a tall S curve */}
      <path
        d="M 70 15
           C 70 50, 100 70, 100 100
           C 100 130, 70 150, 70 185"
        stroke={accent}
        strokeWidth="3"
      />
      {/* The integration range, like real notation */}
      <line x1="118" y1="20" x2="118" y2="50" stroke={accent} strokeWidth="1.5" />
      <line x1="118" y1="155" x2="118" y2="185" stroke={accent} strokeWidth="1.5" />
      <text x="128" y="42" fill={accent} fontFamily="Georgia, serif" fontSize="14" stroke="none">0</text>
      <text x="128" y="178" fill={accent} fontFamily="Georgia, serif" fontSize="14" stroke="none">1</text>
      <text x="145" y="115" fill={STROKE} fontFamily="Georgia, serif" fontSize="22" fontStyle="italic" stroke="none">x</text>
      <text x="170" y="115" fill={STROKE} fontFamily="Georgia, serif" fontSize="14" stroke="none">dx</text>

      {/* Decorative tick marks below */}
      <g opacity="0.5">
        <line x1="20" y1="195" x2="180" y2="195" />
        <line x1="40" y1="195" x2="40" y2="200" />
        <line x1="80" y1="195" x2="80" y2="200" />
        <line x1="120" y1="195" x2="120" y2="200" />
        <line x1="160" y1="195" x2="160" y2="200" />
      </g>
    </svg>
  );
}

/* ============================================================
   RULER COMPASS — drafting compass drawing an arc.
   Used in the teacher panel header strip and admin overview.
   ============================================================ */
export function RulerCompass({ className, accent = 'currentColor', size = 200 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill={FILL}
      stroke={STROKE}
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {/* Arc being drawn */}
      <path d="M 30 150 A 80 80 0 0 1 170 150" stroke={accent} strokeWidth="1" strokeDasharray="2 3" />
      <path d="M 50 130 A 60 60 0 0 1 150 130" stroke={accent} strokeWidth="0.8" opacity="0.5" />

      {/* Compass legs */}
      <line x1="100" y1="40" x2="60" y2="150" stroke={STROKE} strokeWidth="2.2" />
      <line x1="100" y1="40" x2="140" y2="150" stroke={STROKE} strokeWidth="2.2" />

      {/* Hinge */}
      <circle cx="100" cy="40" r="5" fill={STROKE} stroke="none" />
      <circle cx="100" cy="40" r="2" fill={accent} stroke="none" />

      {/* Feet */}
      <circle cx="60" cy="150" r="3" fill={STROKE} stroke="none" />
      <circle cx="140" cy="150" r="3" fill={STROKE} stroke="none" />

      {/* Pencil lead extension */}
      <line x1="60" y1="150" x2="50" y2="170" stroke={accent} strokeWidth="1" />
      <line x1="140" y1="150" x2="150" y2="170" stroke={STROKE} strokeWidth="1" />

      {/* Center mark */}
      <circle cx="100" cy="150" r="2" fill={accent} stroke="none" />
      <line x1="100" y1="150" x2="100" y2="160" stroke={STROKE} strokeWidth="1" />
    </svg>
  );
}

/* ============================================================
   WAVE INTERFERENCE — two overlapping sine waves.
   Used in the login aside footer strip.
   ============================================================ */
export function WaveInterference({ className, accent = 'currentColor', size = 600, height = 80 }) {
  const w = size;
  const h = height;
  return (
    <svg
      className={className}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill={FILL}
      stroke={STROKE}
      strokeWidth="1.5"
      strokeLinecap="round"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Wave A — solid */}
      <path
        d={`M 0 ${h / 2} ${Array.from({ length: 8 }).map((_, i) => {
          const x1 = (i * 2 + 1) * w / 16;
          const x2 = (i * 2 + 2) * w / 16;
          const cp1x = (i * 2 + 1.5) * w / 16;
          return `C ${cp1x} 0, ${cp1x} ${h}, ${x2} ${h / 2} M ${x2} ${h / 2}`;
        }).join(' ')}`}
        stroke={accent}
        strokeWidth="1.4"
      />
      {/* Wave B — dashed (slightly offset phase) */}
      <path
        d={`M 0 ${h / 2 + 4} ${Array.from({ length: 8 }).map((_, i) => {
          const x1 = (i * 2 + 1) * w / 16;
          const x2 = (i * 2 + 2) * w / 16;
          const cp1x = (i * 2 + 1.5) * w / 16;
          return `C ${cp1x} ${h + 8}, ${cp1x} -4, ${x2} ${h / 2 + 4} M ${x2} ${h / 2 + 4}`;
        }).join(' ')}`}
        stroke={STROKE}
        strokeWidth="0.8"
        strokeDasharray="3 4"
        opacity="0.6"
      />
    </svg>
  );
}

/* ============================================================
   PYTHAGOREAN — right triangle with a² + b² = c² annotation.
   Used in the student empty state.
   ============================================================ */
export function Pythagorean({ className, accent = 'currentColor', size = 200 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill={FILL}
      stroke={STROKE}
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {/* Right triangle */}
      <polygon points="30,170 170,170 170,50" stroke={STROKE} strokeWidth="1.6" />

      {/* Right-angle marker */}
      <polyline points="158,170 158,158 170,158" stroke={accent} strokeWidth="1.2" fill="none" />

      {/* Side labels */}
      <text x="95" y="190" fill={STROKE} fontFamily="Georgia, serif" fontSize="14" fontStyle="italic" stroke="none">a</text>
      <text x="178" y="115" fill={STROKE} fontFamily="Georgia, serif" fontSize="14" fontStyle="italic" stroke="none">b</text>
      <text x="80" y="100" fill={accent} fontFamily="Georgia, serif" fontSize="14" fontStyle="italic" stroke="none">c</text>

      {/* Squares on each side (subtle) */}
      <rect x="30" y="170" width="140" height="20" stroke={STROKE} strokeWidth="0.6" opacity="0.35" />
      <rect x="150" y="50" width="20" height="120" stroke={STROKE} strokeWidth="0.6" opacity="0.35" />
      <rect x="30" y="50" width="20" height="120" stroke={accent} strokeWidth="0.6" opacity="0.45" transform="rotate(35.5 30 50)" />

      {/* Equation annotation */}
      <text x="30" y="35" fill={accent} fontFamily="Georgia, serif" fontSize="13" fontStyle="italic" stroke="none">
        a² + b² = c²
      </text>
    </svg>
  );
}

/* ============================================================
   BLACKBOARD — chalk-dust rectangle with formula lines.
   Used as a small decoration on test/material cards.
   ============================================================ */
export function Blackboard({ className, accent = 'currentColor', size = 80 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size * 0.6}
      viewBox="0 0 100 60"
      fill={FILL}
      stroke={STROKE}
      strokeWidth="0.8"
      aria-hidden="true"
    >
      {/* Frame */}
      <rect x="2" y="2" width="96" height="56" rx="2" />
      {/* Inner chalk area */}
      <rect x="6" y="6" width="88" height="48" rx="1" stroke={accent} opacity="0.6" />

      {/* Formula scribbles */}
      <text x="12" y="22" fontFamily="Georgia, serif" fontSize="9" fontStyle="italic" stroke="none" fill={accent}>∫ f(x) dx</text>
      <text x="12" y="36" fontFamily="Georgia, serif" fontSize="9" fontStyle="italic" stroke="none" fill={STROKE}>F = ma</text>
      <text x="12" y="48" fontFamily="Georgia, serif" fontSize="9" fontStyle="italic" stroke="none" fill={STROKE}>πr²</text>

      {/* Dust dots */}
      <circle cx="40" cy="14" r="0.6" fill={STROKE} stroke="none" opacity="0.4" />
      <circle cx="78" cy="20" r="0.6" fill={STROKE} stroke="none" opacity="0.4" />
      <circle cx="55" cy="44" r="0.6" fill={STROKE} stroke="none" opacity="0.4" />
    </svg>
  );
}

/* ============================================================
   DIVIDER — a thin line with a centered glyph.
   Used between section blocks.
   ============================================================ */
export function Divider({ glyph = '·', className }) {
  return (
    <div className={`art-divider ${className || ''}`} aria-hidden="true">
      <span className="art-divider-line" />
      <span className="art-divider-glyph">{glyph}</span>
      <span className="art-divider-line" />
    </div>
  );
}
