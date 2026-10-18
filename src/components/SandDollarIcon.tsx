import React from 'react';

interface Props {
  size?: number | string;
  className?: string;
  animate?: boolean;
}

export const SandDollarIcon: React.FC<Props> = ({
  size = 20,
  className = '',
  animate = false,
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg
      viewBox="0 0 120 120"
      width={pixelSize}
      height={pixelSize}
      className={`inline-block select-none overflow-visible shrink-0 ${animate ? 'hover:rotate-12 transition-transform duration-300' : ''} ${className}`}
      aria-label="Sand Dollar"
      role="img"
    >
      <defs>
        {/* Soft Sand Dollar Organic Texture Gradient */}
        <radialGradient id="sdBodyGrad" cx="50%" cy="48%" r="52%">
          <stop offset="0%" stopColor="#FFF2E2" />
          <stop offset="45%" stopColor="#FDE1C3" />
          <stop offset="85%" stopColor="#F5CAA1" />
          <stop offset="100%" stopColor="#EAB98B" />
        </radialGradient>

        {/* Soft inner petal shadow */}
        <filter id="sdPetalShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0.5" stdDeviation="0.6" floodColor="#B47B49" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Outer Shell Silhouette: Organic Curved Pentagon (Pure Sand Dollar Outline without background) */}
      <path
        d="M 60 14
           C 72 14, 88 23, 98 37
           C 107 50, 108 67, 102 82
           C 96 96, 81 106, 60 106
           C 39 106, 24 96, 18 82
           C 12 67, 13 50, 22 37
           C 32 23, 48 14, 60 14 Z"
        fill="url(#sdBodyGrad)"
        stroke="#DEAA7D"
        strokeWidth="1.8"
        strokeLinejoin="round"
        className="drop-shadow-sm"
      />

      {/* Subtle Rim Accent */}
      <path
        d="M 60 18
           C 70 18, 85 26, 93 39
           C 101 51, 102 65, 97 78
           C 92 91, 78 101, 60 101
           C 42 101, 28 91, 23 78
           C 18 65, 19 51, 27 39
           C 35 26, 50 18, 60 18 Z"
        fill="none"
        stroke="#FFF8F0"
        strokeWidth="0.8"
        opacity="0.6"
      />

      {/* 5 Radial Perforation Dotted Tracks (from center to five shell lobes) */}
      <g fill="#FFFFFF" opacity="0.95">
        {/* Top track */}
        <circle cx="60" cy="18" r="1.3" />
        <circle cx="60" cy="23" r="1.3" />
        <circle cx="60" cy="28" r="1.2" />

        {/* Top-Right track */}
        <circle cx="94" cy="45" r="1.3" />
        <circle cx="89" cy="48" r="1.3" />
        <circle cx="84" cy="51" r="1.2" />

        {/* Bottom-Right track */}
        <circle cx="81" cy="94" r="1.3" />
        <circle cx="78" cy="89" r="1.3" />
        <circle cx="75" cy="84" r="1.2" />

        {/* Bottom-Left track */}
        <circle cx="39" cy="94" r="1.3" />
        <circle cx="42" cy="89" r="1.3" />
        <circle cx="45" cy="84" r="1.2" />

        {/* Top-Left track */}
        <circle cx="26" cy="45" r="1.3" />
        <circle cx="31" cy="48" r="1.3" />
        <circle cx="36" cy="51" r="1.2" />
      </g>

      {/* Central Star Petaloid (5 Petals perfectly matching the reference image) */}
      <g filter="url(#sdPetalShadow)">
        {/* Five Petals rotated at 0°, 72°, 144°, 216°, 288° */}
        {[0, 72, 144, 216, 288].map((angle, idx) => (
          <g key={idx} transform={`rotate(${angle} 60 60)`}>
            {/* Outer Petal Border */}
            <path
              d="M 60 55
                 C 55 50, 53 40, 56 34
                 C 58 31, 60 27, 60 27
                 C 60 27, 62 31, 64 34
                 C 67 40, 65 50, 60 55 Z"
              fill="#F9D7B7"
              stroke="#CCA077"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            {/* Inner White Slit / Crest */}
            <path
              d="M 60 32 L 60 49"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </g>
        ))}
      </g>

      {/* Central Pore Hole */}
      <circle
        cx="60"
        cy="60"
        r="3.6"
        fill="#FFFFFF"
        stroke="#CCA077"
        strokeWidth="1.4"
      />
    </svg>
  );
};
