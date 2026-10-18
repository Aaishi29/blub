import React from 'react';

interface Props {
  id: string;
  className?: string;
  silhouette?: boolean;
}

export const CreatureIllustration: React.FC<Props> = ({ id, className = 'w-24 h-24', silhouette = false }) => {
  if (silhouette) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <div className="w-full h-full opacity-25 filter brightness-0">
          <CreatureSVG id={id} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-light text-cyan-200/60 tracking-widest">???</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <CreatureSVG id={id} />
    </div>
  );
};

const CreatureSVG: React.FC<{ id: string }> = ({ id }) => {
  switch (id) {
    case 'clownfish':
      // Finny: Independent swaying body, swinging tail, fluttering pectoral fin
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(20,184,166,0.3)]">
          <defs>
            <linearGradient id="cfBody" x1="0%" y1="30%" x2="100%" y2="70%">
              <stop offset="0%" stopColor="#E06D53" />
              <stop offset="50%" stopColor="#F39C7F" />
              <stop offset="100%" stopColor="#FCD5B5" />
            </linearGradient>
            <linearGradient id="cfFin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#F87171" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="cfBand" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Independent Tail Fin with Side-to-side Swing */}
          <g className="part-fish-tail">
            <path d="M 24 40 C 14 26, 4 28, 2 38 C 1 43, 6 54, 24 40 Z" fill="url(#cfFin)" />
            <path d="M 18 36 Q 10 38 4 38" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.4" fill="none" />
            <path d="M 18 41 Q 12 43 5 45" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.4" fill="none" />
          </g>

          {/* Main S-Curve Swaying Body & Fins */}
          <g className="part-fish-sway">
            {/* Dorsal & Ventral Fin */}
            <path d="M 44 26 C 52 16, 68 20, 72 26 Z" fill="url(#cfFin)" />
            <path d="M 48 54 C 55 62, 65 58, 68 54 Z" fill="url(#cfFin)" />

            {/* Torpedo Body */}
            <path d="M 22 40 C 26 27, 46 22, 68 26 C 84 29, 93 37, 91 41 C 88 47, 78 55, 62 55 C 44 55, 26 50, 22 40 Z" fill="url(#cfBody)" />

            {/* Stylized Muted Cream Bands */}
            <path d="M 40 24 C 36 33, 36 49, 41 54 C 44 54, 44 24, 40 24 Z" fill="url(#cfBand)" />
            <path d="M 58 24 C 54 34, 54 48, 58 55 C 62 54, 62 25, 58 24 Z" fill="url(#cfBand)" />
            <path d="M 76 30 C 73 36, 73 45, 77 49 C 80 47, 80 32, 76 30 Z" fill="url(#cfBand)" />

            {/* Tiny Simple Dot Eye */}
            <circle cx="83" cy="37" r="1.3" fill="#1E293B" />
          </g>

          {/* Independent Fluttering Pectoral Fin */}
          <g className="part-fin-flutter">
            <ellipse cx="62" cy="43" rx="10" ry="5.5" fill="url(#cfFin)" transform="rotate(-12 62 43)" />
            <line x1="56" y1="43" x2="68" y2="42" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.45" />
          </g>
        </svg>
      );

    case 'sea_turtle':
      // Shelly: Body bob, alternating rhythmic front flipper strokes
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(20,184,166,0.3)]">
          <defs>
            <linearGradient id="stShell" x1="10%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#4D7C66" />
              <stop offset="50%" stopColor="#37604E" />
              <stop offset="100%" stopColor="#254336" />
            </linearGradient>
            <linearGradient id="stLimb" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86EFAC" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#4ADE80" stopOpacity="0.45" />
            </linearGradient>
          </defs>

          {/* Hind flippers */}
          <path d="M 26 27 C 18 20, 14 26, 20 33 Z" fill="url(#stLimb)" />
          <path d="M 26 53 C 18 60, 14 54, 20 47 Z" fill="url(#stLimb)" />

          {/* Top Front Flipper - Alternating Stroke 1 */}
          <g className="part-turtle-flipper-l">
            <path d="M 58 24 C 62 10, 78 8, 82 14 C 74 22, 66 26, 58 24 Z" fill="url(#stLimb)" />
          </g>

          {/* Bottom Front Flipper - Alternating Stroke 2 */}
          <g className="part-turtle-flipper-r">
            <path d="M 58 56 C 62 70, 78 72, 82 66 C 74 58, 66 54, 58 56 Z" fill="url(#stLimb)" />
          </g>

          {/* Body & Head with Gentle Bob */}
          <g className="part-turtle-body">
            {/* Streamlined Head */}
            <path d="M 72 35 C 78 35, 87 37, 88 40 C 87 43, 78 45, 72 45 Z" fill="#6EE7B7" opacity="0.9" />
            <circle cx="83" cy="38" r="1.1" fill="#1C382A" />

            {/* Smooth Shell */}
            <ellipse cx="46" cy="40" rx="26" ry="19" fill="url(#stShell)" />

            {/* Fine Delicate Carapace Tile Lines */}
            <path d="M 34 40 L 42 34 L 52 34 L 58 40 L 52 46 L 42 46 Z" stroke="#A7F3D0" strokeWidth="0.7" strokeOpacity="0.45" fill="none" />
            <path d="M 58 40 L 68 40" stroke="#A7F3D0" strokeWidth="0.7" strokeOpacity="0.4" />
            <path d="M 34 40 L 24 40" stroke="#A7F3D0" strokeWidth="0.7" strokeOpacity="0.4" />
            <path d="M 42 34 L 38 24" stroke="#A7F3D0" strokeWidth="0.7" strokeOpacity="0.4" />
            <path d="M 52 34 L 56 24" stroke="#A7F3D0" strokeWidth="0.7" strokeOpacity="0.4" />
            <path d="M 42 46 L 38 56" stroke="#A7F3D0" strokeWidth="0.7" strokeOpacity="0.4" />
            <path d="M 52 46 L 56 56" stroke="#A7F3D0" strokeWidth="0.7" strokeOpacity="0.4" />
          </g>
        </svg>
      );

    case 'dolphin':
      // Bubbles: Rhythmic body wave, swinging tail flukes, fluttering pectoral fin
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(56,189,248,0.3)]">
          <defs>
            <linearGradient id="dolpBody" x1="10%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#4A7B9D" />
              <stop offset="50%" stopColor="#7DA2C2" />
              <stop offset="100%" stopColor="#D2E2EF" />
            </linearGradient>
            <linearGradient id="dolpFin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* Caudal Flukes with Paddle Swing */}
          <g className="part-fish-tail">
            <path d="M 16 41 C 8 32, 3 34, 4 41 C 3 48, 8 50, 16 41 Z" fill="url(#dolpFin)" />
          </g>

          {/* Main Torpedo Body Sway */}
          <g className="part-fish-sway">
            <path d="M 48 24 C 52 14, 62 16, 62 24 Z" fill="url(#dolpFin)" />
            <path d="M 15 41 C 32 26, 64 24, 78 28 C 88 31, 95 38, 92 41 C 86 44, 76 46, 62 46 C 40 46, 26 44, 15 41 Z" fill="url(#dolpBody)" />
            <path d="M 28 42 C 48 45, 68 44, 82 40 C 76 44, 52 46, 28 42 Z" fill="#F0F9FF" opacity="0.65" />
            <circle cx="82" cy="35" r="1.1" fill="#0F172A" />
            <circle cx="50" cy="35" r="0.8" fill="#FFFFFF" opacity="0.4" />
            <circle cx="55" cy="37" r="0.7" fill="#FFFFFF" opacity="0.35" />
          </g>

          {/* Pectoral Fin Flutter */}
          <g className="part-fin-flutter">
            <path d="M 58 43 C 65 52, 74 50, 70 43 Z" fill="url(#dolpFin)" />
          </g>
        </svg>
      );

    case 'sea_otter':
      // Pip: Body undulation, paddling tail, gentle drifting motion
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(20,184,166,0.3)]">
          <defs>
            <linearGradient id="otterFur" x1="0%" y1="20%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#6E5642" />
              <stop offset="50%" stopColor="#8C735D" />
              <stop offset="100%" stopColor="#CDBCAE" />
            </linearGradient>
            <linearGradient id="otterKelp" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#34D399" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Paddling Tail */}
          <g className="part-otter-tail">
            <path d="M 12 43 C 18 41, 26 42, 28 44 C 24 45, 16 46, 12 43 Z" fill="#5A4534" />
          </g>

          {/* Undulating Body */}
          <g className="part-otter-body">
            <ellipse cx="50" cy="43" rx="26" ry="14" fill="url(#otterFur)" />
            <ellipse cx="54" cy="43" rx="14" ry="9" fill="#E8DED4" opacity="0.8" />
            <path d="M 38 36 Q 44 42 42 50 Q 52 46 54 36" stroke="url(#otterKelp)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <ellipse cx="46" cy="43" rx="3.5" ry="2.5" fill="#755E4A" />
            <ellipse cx="53" cy="43" rx="3.5" ry="2.5" fill="#755E4A" />
            <ellipse cx="74" cy="41" rx="11" ry="9" fill="url(#otterFur)" />
            <ellipse cx="76" cy="42" rx="6" ry="5.5" fill="#E8DED4" opacity="0.85" />
            <circle cx="70" cy="33" r="2" fill="#5A4534" />
            <circle cx="75" cy="39" r="1.1" fill="#1C140D" />
            <circle cx="81" cy="41" r="1.1" fill="#1C140D" />
          </g>
        </svg>
      );

    case 'squid':
      // Inky: Pulsing mantle, trailing wavy tentacles
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible drop-shadow-[0_4px_14px_rgba(168,85,247,0.3)]">
          <defs>
            <linearGradient id="sqBody" x1="30%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7E638D" />
              <stop offset="50%" stopColor="#9C82AB" />
              <stop offset="100%" stopColor="#D4C2DE" />
            </linearGradient>
            <linearGradient id="sqFin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#C084FC" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Trailing Wavy Tentacles lagging behind */}
          <g className="part-tentacles-wave">
            <path d="M 38 37 C 26 34, 16 36, 8 40" stroke="#C084FC" strokeWidth="1.5" strokeOpacity="0.75" fill="none" strokeLinecap="round" />
            <path d="M 38 42 C 24 42, 14 44, 6 47" stroke="#DDD6FE" strokeWidth="1.8" strokeOpacity="0.85" fill="none" strokeLinecap="round" />
            <path d="M 38 47 C 26 50, 16 48, 8 44" stroke="#C084FC" strokeWidth="1.5" strokeOpacity="0.75" fill="none" strokeLinecap="round" />
          </g>

          {/* Rhythmic Pulsing Mantle */}
          <g className="part-mantle-pulse">
            <path d="M 68 25 C 78 28, 86 34, 82 42 C 86 50, 78 56, 68 59 Z" fill="url(#sqFin)" />
            <path d="M 38 42 C 40 28, 54 26, 74 34 C 80 38, 80 46, 74 50 C 54 58, 40 56, 38 42 Z" fill="url(#sqBody)" />
            <circle cx="62" cy="35" r="1.2" fill="#F3E8FF" opacity="0.7" />
            <circle cx="70" cy="39" r="1" fill="#F3E8FF" opacity="0.65" />
            <circle cx="56" cy="44" r="1.1" fill="#F3E8FF" opacity="0.7" />
            <circle cx="64" cy="48" r="1" fill="#F3E8FF" opacity="0.6" />
            <circle cx="45" cy="40" r="1.3" fill="#1E1B4B" />
          </g>
        </svg>
      );

    case 'seahorse':
      // Coral: Slender S-spine, fluttering dorsal fin
      return (
        <svg viewBox="0 0 80 100" className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(245,158,11,0.3)]">
          <defs>
            <linearGradient id="shBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C88E52" />
              <stop offset="50%" stopColor="#DFAD76" />
              <stop offset="100%" stopColor="#F5D0A9" />
            </linearGradient>
            <linearGradient id="shFin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Rapid Delicate Flutter Dorsal Fin */}
          <g className="part-seahorse-fin">
            <path d="M 28 44 C 18 48, 18 56, 26 60 Z" fill="url(#shFin)" />
            <line x1="25" y1="48" x2="21" y2="52" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="26" y1="53" x2="20" y2="55" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.4" />
          </g>

          {/* Main S-Curved Body with subtle bob */}
          <g className="part-turtle-body">
            <path d="M 42 22 C 42 16, 54 16, 54 24 C 62 25, 68 27, 68 30 C 66 32, 60 32, 54 31 C 52 38, 44 38, 41 34 Z" fill="url(#shBody)" />
            <path d="M 45 16 L 48 10 L 51 16 Z" fill="#B4783E" />
            <path d="M 43 35 C 52 42, 52 56, 45 66 C 38 75, 34 84, 40 90 C 44 92, 48 89, 47 84 C 45 81, 41 82, 41 84" fill="none" stroke="url(#shBody)" strokeWidth="6" strokeLinecap="round" />
            <line x1="42" y1="44" x2="49" y2="45" stroke="#925E2B" strokeWidth="0.8" strokeOpacity="0.5" />
            <line x1="41" y1="51" x2="48" y2="52" stroke="#925E2B" strokeWidth="0.8" strokeOpacity="0.5" />
            <line x1="40" y1="58" x2="46" y2="59" stroke="#925E2B" strokeWidth="0.8" strokeOpacity="0.5" />
            <line x1="38" y1="66" x2="44" y2="67" stroke="#925E2B" strokeWidth="0.8" strokeOpacity="0.5" />
            <circle cx="49" cy="24" r="1.1" fill="#291807" />
          </g>
        </svg>
      );

    case 'moon_jelly':
      // Aurelia: Pulsing bell on 3s cycle (contract/relax), trailing delayed tentacles
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-[0_0_18px_rgba(129,140,248,0.55)]">
          <defs>
            <radialGradient id="mjBell" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#EEF2FF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#A5B4FC" stopOpacity="0.65" />
              <stop offset="90%" stopColor="#6366F1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4338CA" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="mjTentacle" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C7D2FE" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Trailing Gossamer Tentacles with Phase Lag */}
          <g className="part-jelly-tentacle-1">
            <path d="M 36 50 Q 30 70 38 92" stroke="url(#mjTentacle)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M 50 53 Q 54 75 48 98" stroke="#EEF2FF" strokeWidth="2.4" strokeOpacity="0.75" fill="none" strokeLinecap="round" />
            <path d="M 64 50 Q 70 70 62 92" stroke="url(#mjTentacle)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </g>
          <g className="part-jelly-tentacle-2">
            <path d="M 44 52 Q 40 74 46 96" stroke="url(#mjTentacle)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M 56 52 Q 60 74 54 96" stroke="url(#mjTentacle)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </g>

          {/* Rhythmic Pulsing Bell (3s Contract-Relax Cycle) */}
          <g className="part-jelly-bell">
            <path d="M 22 50 C 22 20, 78 20, 78 50 C 68 53, 62 48, 50 50 C 38 48, 32 53, 22 50 Z" fill="url(#mjBell)" stroke="#C7D2FE" strokeWidth="0.8" strokeOpacity="0.6" />
            <ellipse cx="44" cy="35" rx="3.5" ry="3" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.8" />
            <ellipse cx="56" cy="35" rx="3.5" ry="3" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.8" />
            <ellipse cx="44" cy="42" rx="3.5" ry="3" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.8" />
            <ellipse cx="56" cy="42" rx="3.5" ry="3" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.8" />
          </g>
        </svg>
      );

    case 'dumbo_octopus':
      // Puff: Fluttering crown ear fins, pulsing mantle, trailing arms
      return (
        <svg viewBox="0 0 100 85" className="w-full h-full overflow-visible drop-shadow-[0_0_16px_rgba(244,114,182,0.45)]">
          <defs>
            <linearGradient id="doBody" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#A87B8D" />
              <stop offset="50%" stopColor="#C998AA" />
              <stop offset="100%" stopColor="#E8CAD5" />
            </linearGradient>
            <linearGradient id="doFin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBCFE8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#DB2777" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Left Ear Fin Flutter */}
          <g className="part-dumbo-ear-l">
            <path d="M 32 26 C 20 18, 14 28, 26 33 Z" fill="url(#doFin)" />
            <line x1="24" y1="27" x2="28" y2="30" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.5" />
          </g>

          {/* Right Ear Fin Flutter */}
          <g className="part-dumbo-ear-r">
            <path d="M 68 26 C 80 18, 86 28, 74 33 Z" fill="url(#doFin)" />
            <line x1="76" y1="27" x2="72" y2="30" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.5" />
          </g>

          {/* Pulsing Bell & Webbed Arms */}
          <g className="part-mantle-pulse">
            <ellipse cx="50" cy="40" rx="24" ry="19" fill="url(#doBody)" />
            <path d="M 26 52 Q 32 60 38 54 Q 44 62 50 55 Q 56 62 62 54 Q 68 60 74 52 Z" fill="url(#doBody)" opacity="0.9" />
            <circle cx="34" cy="56" r="1.1" fill="#FDE047" opacity="0.6" />
            <circle cx="45" cy="58" r="1.1" fill="#FDE047" opacity="0.6" />
            <circle cx="55" cy="58" r="1.1" fill="#FDE047" opacity="0.6" />
            <circle cx="66" cy="56" r="1.1" fill="#FDE047" opacity="0.6" />
            <circle cx="40" cy="40" r="1.3" fill="#1E1B4B" />
            <circle cx="60" cy="40" r="1.3" fill="#1E1B4B" />
          </g>
        </svg>
      );

    case 'anglerfish':
      // Lumi: Swaying plum body, swinging tail, fluttering pectoral fin, glowing lantern
      return (
        <svg viewBox="0 0 100 85" className="w-full h-full overflow-visible drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">
          <defs>
            <linearGradient id="angBody" x1="0%" y1="20%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#252136" />
              <stop offset="50%" stopColor="#37314E" />
              <stop offset="100%" stopColor="#544D74" />
            </linearGradient>
            <radialGradient id="lumiGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
              <stop offset="45%" stopColor="#FACC15" stopOpacity="0.8" />
              <stop offset="85%" stopColor="#CA8A04" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Swinging Tail */}
          <g className="part-fish-tail">
            <path d="M 22 47 C 12 38, 4 41, 6 48 C 4 55, 12 58, 22 49 Z" fill="#6B5B95" opacity="0.65" />
            <line x1="18" y1="46" x2="8" y2="44" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.3" />
            <line x1="18" y1="50" x2="8" y2="52" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.3" />
          </g>

          {/* Swaying Body with Illicium & Glowing Bulb */}
          <g className="part-fish-sway">
            <path d="M 54 28 C 62 10, 84 10, 84 22" fill="none" stroke="#FDE047" strokeWidth="1.2" strokeOpacity="0.8" strokeLinecap="round" />
            <circle cx="84" cy="22" r="8" fill="url(#lumiGlow)" />
            <circle cx="84" cy="22" r="3" fill="#FEF08A" />
            <path d="M 20 48 C 24 34, 46 30, 68 34 C 82 37, 88 44, 86 48 C 84 56, 68 62, 50 62 C 34 62, 22 56, 20 48 Z" fill="url(#angBody)" />
            <circle cx="36" cy="45" r="0.9" fill="#FDE047" opacity="0.65" />
            <circle cx="43" cy="42" r="0.8" fill="#FDE047" opacity="0.65" />
            <circle cx="51" cy="44" r="0.8" fill="#FDE047" opacity="0.65" />
            <circle cx="72" cy="40" r="1.2" fill="#0F172A" />
          </g>

          {/* Fluttering Pectoral Fin */}
          <g className="part-fin-flutter">
            <ellipse cx="48" cy="54" rx="7" ry="3.5" fill="#6B5B95" opacity="0.6" transform="rotate(-15 48 54)" />
          </g>
        </svg>
      );

    case 'goblin_shark':
      // Snouty: Streamlined elongated shark, swinging tail, body sway, fin flutter
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible drop-shadow-[0_0_18px_rgba(244,114,182,0.35)]">
          <defs>
            <linearGradient id="gsBody" x1="0%" y1="30%" x2="100%" y2="70%">
              <stop offset="0%" stopColor="#7E606C" />
              <stop offset="50%" stopColor="#9C7B89" />
              <stop offset="100%" stopColor="#D9BFCA" />
            </linearGradient>
            <linearGradient id="gsFin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBCFE8" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#9D174D" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Swinging Heterocercal Tail */}
          <g className="part-fish-tail">
            <path d="M 18 42 C 8 28, 4 30, 8 40 C 4 48, 8 50, 18 44 Z" fill="url(#gsFin)" />
          </g>

          {/* Main Elongated Torpedo Body Sway */}
          <g className="part-fish-sway">
            <path d="M 44 26 C 50 16, 58 20, 58 27 Z" fill="url(#gsFin)" />
            <path d="M 18 43 C 34 30, 60 28, 76 29 C 88 30, 96 35, 96 38 C 96 41, 80 43, 74 44 C 52 49, 28 47, 18 43 Z" fill="url(#gsBody)" />
            <path d="M 28 42 Q 54 40 80 37" stroke="#FCE7F3" strokeWidth="0.6" strokeOpacity="0.4" fill="none" />
            <circle cx="36" cy="35" r="0.8" fill="#FCE7F3" opacity="0.4" />
            <circle cx="44" cy="35" r="0.7" fill="#FCE7F3" opacity="0.35" />
            <circle cx="76" cy="36" r="1.1" fill="#1C1419" />
          </g>

          {/* Fluttering Pectoral Fin */}
          <g className="part-fin-flutter">
            <path d="M 56 44 C 64 52, 72 49, 68 44 Z" fill="url(#gsFin)" />
          </g>
        </svg>
      );

    case 'silver_fish':
      // Shimmer: Sleek silver schooling fish, swinging tail, fish sway, fin flutter
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(148,163,184,0.35)]">
          <defs>
            <linearGradient id="silvBody" x1="0%" y1="20%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="45%" stopColor="#94A3B8" />
              <stop offset="85%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#F8FAFC" />
            </linearGradient>
            <linearGradient id="silvFin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#64748B" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <g className="part-fish-tail">
            <path d="M 22 40 C 12 30, 4 33, 2 40 C 4 47, 12 50, 22 40 Z" fill="url(#silvFin)" />
          </g>
          <g className="part-fish-sway">
            <path d="M 46 26 C 52 18, 64 22, 68 27 Z" fill="url(#silvFin)" />
            <path d="M 20 40 C 26 28, 48 24, 70 28 C 86 31, 94 38, 92 41 C 88 46, 78 52, 62 52 C 44 52, 26 48, 20 40 Z" fill="url(#silvBody)" />
            <path d="M 30 40 Q 56 38 82 36" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.5" fill="none" />
            <circle cx="83" cy="37" r="1.1" fill="#0F172A" />
          </g>
          <g className="part-fin-flutter">
            <ellipse cx="62" cy="43" rx="8" ry="4" fill="url(#silvFin)" transform="rotate(-15 62 43)" />
          </g>
        </svg>
      );

    case 'reef_shark':
      // Echo: Elegant hydrodynamic reef shark, dark-tipped dorsal fin, heterocercal tail
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible drop-shadow-[0_4px_14px_rgba(100,116,139,0.35)]">
          <defs>
            <linearGradient id="rsBody" x1="0%" y1="30%" x2="100%" y2="70%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
            <linearGradient id="rsFin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748B" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#334155" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <g className="part-fish-tail">
            <path d="M 18 41 C 7 24, 3 26, 8 38 C 3 48, 7 51, 18 43 Z" fill="url(#rsFin)" />
          </g>
          <g className="part-fish-sway">
            {/* Prominent dorsal fin with characteristic black tip */}
            <path d="M 46 27 C 52 14, 60 16, 62 26 Z" fill="url(#rsFin)" />
            <path d="M 52 14 C 55 14, 58 17, 57 20 Z" fill="#0F172A" opacity="0.9" />
            {/* Shark body */}
            <path d="M 16 41 C 32 30, 60 27, 76 29 C 89 31, 96 36, 94 40 C 89 44, 76 47, 58 47 C 38 47, 24 45, 16 41 Z" fill="url(#rsBody)" />
            <path d="M 28 42 C 48 45, 68 44, 82 40 C 76 44, 52 46, 28 42 Z" fill="#E2E8F0" opacity="0.6" />
            <circle cx="82" cy="35" r="1.1" fill="#0F172A" />
            {/* Gill slit marks */}
            <line x1="68" y1="36" x2="68" y2="42" stroke="#1E293B" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="71" y1="36" x2="71" y2="42" stroke="#1E293B" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="74" y1="36" x2="74" y2="42" stroke="#1E293B" strokeWidth="0.5" strokeOpacity="0.4" />
          </g>
          <g className="part-fin-flutter">
            <path d="M 56 44 C 64 54, 74 51, 68 44 Z" fill="url(#rsFin)" />
          </g>
        </svg>
      );

    case 'hammerhead':
      // Nautilus: Wide wing-shaped cephalofoil head, slate body sway, heterocercal tail
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible drop-shadow-[0_4px_14px_rgba(120,113,108,0.35)]">
          <defs>
            <linearGradient id="hhBody" x1="0%" y1="20%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#44403C" />
              <stop offset="50%" stopColor="#57534E" />
              <stop offset="100%" stopColor="#A8A29E" />
            </linearGradient>
            <linearGradient id="hhFin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#78716C" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#292524" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <g className="part-fish-tail">
            <path d="M 16 41 C 6 25, 2 27, 7 38 C 2 48, 6 51, 16 43 Z" fill="url(#hhFin)" />
          </g>
          <g className="part-fish-sway">
            <path d="M 44 26 C 50 14, 58 17, 58 26 Z" fill="url(#hhFin)" />
            {/* Elongated shark body */}
            <path d="M 15 42 C 30 32, 58 30, 74 32 C 82 33, 86 36, 86 40 C 86 44, 78 46, 58 47 C 36 47, 24 45, 15 42 Z" fill="url(#hhBody)" />
            {/* Distinctive T-shaped hammerhead wing */}
            <path d="M 80 24 C 88 23, 94 25, 94 30 L 94 50 C 94 55, 88 57, 80 56 Z" fill="url(#hhBody)" />
            <circle cx="91" cy="28" r="1.1" fill="#1C1917" />
            <circle cx="91" cy="52" r="1.1" fill="#1C1917" />
          </g>
          <g className="part-fin-flutter">
            <path d="M 52 45 C 60 55, 70 52, 64 45 Z" fill="url(#hhFin)" />
          </g>
        </svg>
      );

    case 'lanternfish':
      // Glint: Slender midnight body, glowing photophores along belly line
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible drop-shadow-[0_0_18px_rgba(45,212,191,0.5)]">
          <defs>
            <linearGradient id="lfBody" x1="0%" y1="20%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="50%" stopColor="#115E59" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
            <linearGradient id="lfFin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0F766E" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <g className="part-fish-tail">
            <path d="M 22 41 C 12 32, 4 34, 4 41 C 4 48, 12 50, 22 41 Z" fill="url(#lfFin)" />
          </g>
          <g className="part-fish-sway">
            <path d="M 46 28 C 52 20, 62 23, 64 29 Z" fill="url(#lfFin)" />
            <path d="M 20 41 C 26 30, 48 26, 70 30 C 86 33, 93 39, 91 42 C 87 47, 76 53, 60 53 C 42 53, 26 49, 20 41 Z" fill="url(#lfBody)" />
            <circle cx="82" cy="38" r="1.2" fill="#042F2E" />
            {/* Row of glowing bioluminescent photophores */}
            <circle cx="34" cy="48" r="1.3" fill="#2DD4BF" className="drop-shadow-[0_0_6px_#2DD4BF]" />
            <circle cx="42" cy="49" r="1.3" fill="#2DD4BF" className="drop-shadow-[0_0_6px_#2DD4BF]" />
            <circle cx="50" cy="50" r="1.3" fill="#2DD4BF" className="drop-shadow-[0_0_6px_#2DD4BF]" />
            <circle cx="58" cy="50" r="1.3" fill="#2DD4BF" className="drop-shadow-[0_0_6px_#2DD4BF]" />
            <circle cx="66" cy="49" r="1.3" fill="#2DD4BF" className="drop-shadow-[0_0_6px_#2DD4BF]" />
            <circle cx="74" cy="47" r="1.3" fill="#2DD4BF" className="drop-shadow-[0_0_6px_#2DD4BF]" />
          </g>
          <g className="part-fin-flutter">
            <ellipse cx="60" cy="44" rx="7" ry="3.5" fill="url(#lfFin)" transform="rotate(-15 60 44)" />
          </g>
        </svg>
      );

    case 'greenland_shark':
      // Boreal: Ancient slow weathered slate shark with frosted fin edges
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible drop-shadow-[0_0_16px_rgba(71,85,105,0.4)]">
          <defs>
            <linearGradient id="glBody" x1="0%" y1="20%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="glFin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#1E293B" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <g className="part-fish-tail">
            <path d="M 18 42 C 8 28, 4 30, 8 40 C 4 48, 8 50, 18 44 Z" fill="url(#glFin)" />
          </g>
          <g className="part-fish-sway">
            <path d="M 44 28 C 48 19, 56 22, 56 29 Z" fill="url(#glFin)" />
            {/* Heavy rounded ancient body */}
            <path d="M 16 43 C 32 30, 60 29, 76 31 C 88 33, 94 37, 94 40 C 94 44, 82 48, 68 49 C 48 51, 26 48, 16 43 Z" fill="url(#glBody)" />
            {/* Frosted skin textures */}
            <path d="M 32 40 Q 56 39 78 37" stroke="#CBD5E1" strokeWidth="0.5" strokeOpacity="0.3" fill="none" />
            <circle cx="38" cy="35" r="0.7" fill="#E2E8F0" opacity="0.3" />
            <circle cx="48" cy="36" r="0.6" fill="#E2E8F0" opacity="0.3" />
            <circle cx="62" cy="35" r="0.7" fill="#E2E8F0" opacity="0.3" />
            {/* Pale blue ancient eye */}
            <circle cx="82" cy="37" r="1.1" fill="#93C5FD" opacity="0.85" />
          </g>
          <g className="part-fin-flutter">
            <path d="M 52 46 C 58 54, 66 52, 62 46 Z" fill="url(#glFin)" />
          </g>
        </svg>
      );

    case 'gulper_eel':
      // Pelican: Slender ribbon eel body, massive scoop pouch, glowing photophore tail tip
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible drop-shadow-[0_0_18px_rgba(168,85,247,0.45)]">
          <defs>
            <linearGradient id="geBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="60%" stopColor="#3B0764" />
              <stop offset="100%" stopColor="#581C87" />
            </linearGradient>
            <radialGradient id="geBulb" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDF4FF" />
              <stop offset="50%" stopColor="#E879F9" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g className="part-fish-sway">
            {/* Whiplash ribbon tail tapering left with glowing beacon */}
            <path
              d="M 6 42 Q 16 35 28 44 Q 40 50 50 42"
              fill="none"
              stroke="url(#geBody)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Glowing tail beacon */}
            <circle cx="6" cy="42" r="6" fill="url(#geBulb)" />
            <circle cx="6" cy="42" r="2.2" fill="#F472B6" />
            {/* Big scooper head & pouch */}
            <path
              d="M 50 42 C 55 32, 72 30, 84 32 C 92 34, 94 38, 92 42 C 88 56, 68 58, 52 48 Z"
              fill="url(#geBody)"
            />
            <path
              d="M 60 42 Q 74 44 88 38"
              stroke="#D8B4FE"
              strokeWidth="0.8"
              strokeOpacity="0.4"
              fill="none"
            />
            <circle cx="86" cy="35" r="1.1" fill="#F5D0FE" />
          </g>
        </svg>
      );

    case 'vampire_squid':
      // Velvet: Velvety deep ruby cloak, webbed arms opening/closing, glowing arm tip photophores
      return (
        <svg viewBox="0 0 100 85" className="w-full h-full overflow-visible drop-shadow-[0_0_20px_rgba(225,29,72,0.45)]">
          <defs>
            <linearGradient id="vsBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4C0519" />
              <stop offset="50%" stopColor="#881337" />
              <stop offset="100%" stopColor="#BE123C" />
            </linearGradient>
            <linearGradient id="vsFin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#9F1239" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <g className="part-dumbo-ear-l">
            <path d="M 36 28 C 26 22, 22 30, 32 35 Z" fill="url(#vsFin)" />
          </g>
          <g className="part-dumbo-ear-r">
            <path d="M 64 28 C 74 22, 78 30, 68 35 Z" fill="url(#vsFin)" />
          </g>
          <g className="part-mantle-pulse">
            {/* Mantle Dome */}
            <ellipse cx="50" cy="38" rx="22" ry="18" fill="url(#vsBody)" />
            {/* Webbed cloak arms */}
            <path
              d="M 28 50 Q 36 64 42 56 Q 50 68 58 56 Q 64 64 72 50 Z"
              fill="url(#vsBody)"
              opacity="0.95"
            />
            {/* Glowing arm photophore tips */}
            <circle cx="36" cy="62" r="1.4" fill="#FDA4AF" className="drop-shadow-[0_0_6px_#FDA4AF]" />
            <circle cx="50" cy="66" r="1.4" fill="#FDA4AF" className="drop-shadow-[0_0_6px_#FDA4AF]" />
            <circle cx="64" cy="62" r="1.4" fill="#FDA4AF" className="drop-shadow-[0_0_6px_#FDA4AF]" />
            <circle cx="42" cy="40" r="1.2" fill="#0F172A" />
            <circle cx="58" cy="40" r="1.2" fill="#0F172A" />
          </g>
        </svg>
      );

    case 'giant_squid':
      // Archie: Majestic elongated iridescent violet mantle, flowing long tentacles, large serene eye
      return (
        <svg viewBox="0 0 100 85" className="w-full h-full overflow-visible drop-shadow-[0_0_20px_rgba(192,132,252,0.4)]">
          <defs>
            <linearGradient id="arcBody" x1="20%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B0764" />
              <stop offset="50%" stopColor="#6B21A8" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            <linearGradient id="arcFin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#9333EA" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Long flowing tentacles lagging behind */}
          <g className="part-tentacles-wave">
            <path d="M 36 38 C 22 34, 12 36, 4 40" stroke="#C084FC" strokeWidth="1.8" strokeOpacity="0.85" fill="none" strokeLinecap="round" />
            <path d="M 36 43 C 20 44, 8 46, 2 48" stroke="#E9D5FF" strokeWidth="2.2" strokeOpacity="0.9" fill="none" strokeLinecap="round" />
            <path d="M 36 48 C 22 52, 12 50, 4 46" stroke="#C084FC" strokeWidth="1.8" strokeOpacity="0.85" fill="none" strokeLinecap="round" />
          </g>
          {/* Majestic elongated mantle */}
          <g className="part-mantle-pulse">
            <path d="M 68 24 C 82 28, 92 34, 88 43 C 92 52, 82 58, 68 62 Z" fill="url(#arcFin)" />
            <path d="M 36 43 C 38 27, 54 24, 76 34 C 84 38, 84 48, 76 52 C 54 62, 38 59, 36 43 Z" fill="url(#arcBody)" />
            {/* Large Serene Golden Eye */}
            <circle cx="44" cy="41" r="2.2" fill="#FEF08A" />
            <circle cx="44" cy="41" r="1.2" fill="#713F12" />
          </g>
        </svg>
      );

    case 'seahorse':
      // Pip: Pygmy Seahorse - golden coral ridges, crowned coronet, curly spiral tail, fluttering dorsal fin
      return (
        <svg viewBox="0 0 100 90" className="w-full h-full overflow-visible drop-shadow-[0_4px_16px_rgba(251,191,36,0.4)]">
          <defs>
            <linearGradient id="shBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#FDE68A" />
            </linearGradient>
            <linearGradient id="shFin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          {/* Fluttering dorsal fin */}
          <g className="part-fin-flutter">
            <path d="M 34 42 C 24 38, 22 52, 34 50 Z" fill="url(#shFin)" />
            <line x1="28" y1="42" x2="34" y2="46" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.6" />
          </g>
          {/* S-shaped body & head */}
          <g className="part-fish-sway">
            {/* Snout and crown coronet */}
            <path d="M 58 20 L 62 14 L 66 22 Z" fill="#F59E0B" />
            <path d="M 52 18 C 58 14, 68 18, 64 24 L 76 25 C 77 26, 76 29, 72 29 L 62 30 C 58 38, 66 48, 56 60 C 50 68, 38 72, 38 78 C 38 84, 46 84, 48 80 C 49 76, 44 74, 43 78 Z" fill="url(#shBody)" />
            {/* Coral segment ridges */}
            <circle cx="56" cy="38" r="1.5" fill="#D97706" />
            <circle cx="58" cy="45" r="1.5" fill="#D97706" />
            <circle cx="56" cy="52" r="1.4" fill="#D97706" />
            <circle cx="50" cy="60" r="1.2" fill="#D97706" />
            {/* Cheerful eye */}
            <circle cx="60" cy="22" r="1.8" fill="#1E293B" />
            <circle cx="60.5" cy="21.5" r="0.6" fill="#FFFFFF" />
          </g>
        </svg>
      );

    case 'sea_angel':
      // Seraph: Gymnosomata Sea Angel - translucent glowing wings, visible luminous visceral core
      return (
        <svg viewBox="0 0 100 85" className="w-full h-full overflow-visible drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]">
          <defs>
            <linearGradient id="saBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="saWing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.25" />
            </linearGradient>
            <radialGradient id="saCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Left Wing Flapping */}
          <g className="part-dumbo-ear-l">
            <path d="M 44 38 C 24 24, 16 38, 38 46 Z" fill="url(#saWing)" />
            <path d="M 44 38 Q 28 32 24 38" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.7" fill="none" />
          </g>
          {/* Right Wing Flapping */}
          <g className="part-dumbo-ear-r">
            <path d="M 56 38 C 76 24, 84 38, 62 46 Z" fill="url(#saWing)" />
            <path d="M 56 38 Q 72 32 76 38" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.7" fill="none" />
          </g>
          {/* Translucent Mantle & Luminous Heart Core */}
          <g className="part-mantle-pulse">
            {/* Tapered droplet body */}
            <path d="M 50 18 C 58 18, 62 26, 60 42 C 58 58, 52 74, 50 78 C 48 74, 42 58, 40 42 C 38 26, 42 18, 50 18 Z" fill="url(#saBody)" />
            {/* Glowing Amber Visceral Core */}
            <ellipse cx="50" cy="40" rx="5" ry="7" fill="url(#saCore)" className="drop-shadow-[0_0_10px_#F97316]" />
            <circle cx="50" cy="38" r="2.5" fill="#FEF08A" />
            {/* Cute antenna horns */}
            <path d="M 46 18 Q 44 12 42 10" stroke="#BAE6FD" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M 54 18 Q 56 12 58 10" stroke="#BAE6FD" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </g>
        </svg>
      );

    case 'sperm_whale':
      // Levi: Deep-diving Sperm Whale - broad square head, acoustic sonar ripples, sweeping flukes
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible drop-shadow-[0_4px_18px_rgba(96,165,250,0.35)]">
          <defs>
            <linearGradient id="swBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="swBelly" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
          </defs>
          {/* Oscillating Tail Fluke */}
          <g className="part-fish-tail">
            <path d="M 18 42 C 6 32, 2 34, 4 42 C 2 50, 6 52, 18 44 Z" fill="#334155" />
          </g>
          {/* Main Torpedo Body & Massive Blunt Head */}
          <g className="part-fish-sway">
            {/* Broad square forehead */}
            <path d="M 16 43 C 28 38, 44 32, 64 32 C 84 32, 94 34, 94 44 C 94 50, 88 54, 76 54 C 60 54, 34 50, 16 43 Z" fill="url(#swBody)" />
            {/* Pale Underbelly wash */}
            <path d="M 40 48 C 55 49, 74 48, 86 46 C 84 52, 74 54, 60 54 C 48 54, 42 50, 40 48 Z" fill="url(#swBelly)" opacity="0.6" />
            {/* Small side paddle fin */}
            <ellipse cx="58" cy="46" rx="8" ry="3.5" fill="#1E293B" transform="rotate(15 58 46)" />
            {/* Wise calm eye */}
            <circle cx="78" cy="42" r="1.2" fill="#93C5FD" />
            {/* Faint sonar harmonic rings near melon */}
            <path d="M 90 36 A 8 8 0 0 1 90 48" stroke="#93C5FD" strokeWidth="0.7" strokeOpacity="0.45" fill="none" />
            <path d="M 93 33 A 12 12 0 0 1 93 51" stroke="#93C5FD" strokeWidth="0.6" strokeOpacity="0.3" fill="none" />
          </g>
        </svg>
      );

    case 'sea_bunny':
      // Snowy: Jorunna Parva Sea Bunny - velvety fluffy white mantle with soft bunny rhinophores
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible drop-shadow-[0_0_18px_rgba(241,245,249,0.5)]">
          <defs>
            <linearGradient id="sbBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <linearGradient id="sbEar" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          {/* Cute Bunny Ear Left (Rhinophore) */}
          <g className="part-dumbo-ear-l">
            <ellipse cx="64" cy="26" rx="3" ry="8" fill="url(#sbEar)" transform="rotate(12 64 26)" />
            <path d="M 64 20 Q 65 26 64 32" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.4" fill="none" />
          </g>
          {/* Cute Bunny Ear Right (Rhinophore) */}
          <g className="part-dumbo-ear-r">
            <ellipse cx="72" cy="28" rx="2.8" ry="7.5" fill="url(#sbEar)" transform="rotate(22 72 28)" />
            <path d="M 72 22 Q 73 28 72 34" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.4" fill="none" />
          </g>
          {/* Plump Fluffy White Body */}
          <g className="part-fish-sway">
            <ellipse cx="50" cy="48" rx="28" ry="16" fill="url(#sbBody)" />
            {/* Fluffy branchial plume tail on back */}
            <circle cx="28" cy="40" r="4.5" fill="#F8FAFC" />
            <circle cx="25" cy="43" r="3.5" fill="#E2E8F0" />
            <circle cx="31" cy="43" r="3.5" fill="#E2E8F0" />
            {/* Cute black caryophyllidia specks */}
            <circle cx="44" cy="44" r="1.1" fill="#334155" />
            <circle cx="54" cy="42" r="1.2" fill="#334155" />
            <circle cx="62" cy="46" r="1.1" fill="#334155" />
            <circle cx="48" cy="52" r="0.9" fill="#334155" />
            <circle cx="58" cy="53" r="1.0" fill="#334155" />
            <circle cx="38" cy="47" r="1.0" fill="#334155" />
          </g>
        </svg>
      );

    case 'starfish':
      // Stella: Abyssal Brittle Star - five slender glowing coral-violet arms, bioluminescent core
      return (
        <svg viewBox="0 0 100 85" className="w-full h-full overflow-visible drop-shadow-[0_0_20px_rgba(232,121,249,0.5)]">
          <defs>
            <linearGradient id="stBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C026D3" />
              <stop offset="50%" stopColor="#E879F9" />
              <stop offset="100%" stopColor="#F472B6" />
            </linearGradient>
            <radialGradient id="stCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDF4FF" />
              <stop offset="50%" stopColor="#F0ABFC" />
              <stop offset="100%" stopColor="#C026D3" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g className="part-mantle-pulse">
            {/* 5 Slender undulating brittle star arms */}
            {/* Top arm */}
            <path d="M 48 42 Q 44 26 50 12 Q 54 26 52 42" fill="url(#stBody)" />
            {/* Right Top arm */}
            <path d="M 52 42 Q 68 34 84 32 Q 72 46 52 46" fill="url(#stBody)" />
            {/* Right Bottom arm */}
            <path d="M 52 46 Q 66 60 74 74 Q 58 64 48 48" fill="url(#stBody)" />
            {/* Left Bottom arm */}
            <path d="M 48 48 Q 36 64 24 72 Q 34 58 46 46" fill="url(#stBody)" />
            {/* Left Top arm */}
            <path d="M 46 46 Q 30 42 16 34 Q 32 34 48 42" fill="url(#stBody)" />
            {/* Glowing bioluminescent node points along arms */}
            <circle cx="50" cy="20" r="1.3" fill="#FDF4FF" className="drop-shadow-[0_0_6px_#F0ABFC]" />
            <circle cx="74" cy="34" r="1.3" fill="#FDF4FF" className="drop-shadow-[0_0_6px_#F0ABFC]" />
            <circle cx="66" cy="66" r="1.3" fill="#FDF4FF" className="drop-shadow-[0_0_6px_#F0ABFC]" />
            <circle cx="30" cy="64" r="1.3" fill="#FDF4FF" className="drop-shadow-[0_0_6px_#F0ABFC]" />
            <circle cx="24" cy="36" r="1.3" fill="#FDF4FF" className="drop-shadow-[0_0_6px_#F0ABFC]" />
            {/* Radiant central star pentagon core */}
            <circle cx="50" cy="45" r="9" fill="url(#stCore)" />
            <circle cx="50" cy="45" r="3.5" fill="#FFFFFF" />
          </g>
        </svg>
      );

    default:
      return (
        <div className="w-16 h-16 rounded-full bg-cyan-400/20 flex items-center justify-center text-white/50 text-xs">
          ~
        </div>
      );
  }
};
