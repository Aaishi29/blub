import React, { useMemo } from 'react';
import { DepthZone } from '../types';

interface Props {
  zone: DepthZone;
  depth: number;
}

export const SeaBackground: React.FC<Props> = ({ zone }) => {
  // Deterministic bubbles for Sunlight zone
  const sunlightBubbles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${(i * 17 + 3) % 94 + 3}%`,
      size: `${6 + (i % 4) * 4}px`,
      duration: `${8 + (i % 5) * 2}s`,
      delay: `-${(i * 1.5) % 8}s`,
      drift: `${(i % 2 === 0 ? 1 : -1) * (12 + (i % 3) * 8)}px`,
    }));
  }, []);

  // Organic, naturally scattered pale-blue & teal bioluminescent specks for Twilight zone
  const twilightSpecks = useMemo(() => {
    const rawCoords = [
      { x: 12, y: 18, s: 3.2, dur: 5.2, del: 0.2, col: '#7DD3FC' },
      { x: 28, y: 34, s: 2.6, dur: 6.4, del: 1.5, col: '#5EEAD4' },
      { x: 42, y: 22, s: 3.8, dur: 4.8, del: 2.1, col: '#A5F3FC' },
      { x: 67, y: 15, s: 2.8, dur: 5.9, del: 0.8, col: '#7DD3FC' },
      { x: 84, y: 29, s: 3.5, dur: 4.5, del: 1.9, col: '#5EEAD4' },
      { x: 19, y: 52, s: 2.5, dur: 6.1, del: 2.7, col: '#A5F3FC' },
      { x: 36, y: 64, s: 4.0, dur: 5.0, del: 0.5, col: '#7DD3FC' },
      { x: 53, y: 48, s: 2.8, dur: 5.6, del: 1.2, col: '#5EEAD4' },
      { x: 72, y: 58, s: 3.4, dur: 4.9, del: 2.4, col: '#A5F3FC' },
      { x: 91, y: 44, s: 2.6, dur: 6.3, del: 0.9, col: '#7DD3FC' },
      { x: 14, y: 78, s: 3.6, dur: 5.4, del: 1.7, col: '#5EEAD4' },
      { x: 31, y: 82, s: 2.4, dur: 6.0, del: 3.1, col: '#A5F3FC' },
      { x: 61, y: 76, s: 3.2, dur: 4.7, del: 0.4, col: '#7DD3FC' },
      { x: 79, y: 85, s: 2.8, dur: 5.8, del: 2.2, col: '#5EEAD4' },
      { x: 48, y: 88, s: 3.5, dur: 5.3, del: 1.4, col: '#A5F3FC' },
      { x: 86, y: 69, s: 2.7, dur: 6.2, del: 2.8, col: '#7DD3FC' },
      { x: 23, y: 26, s: 3.0, dur: 5.5, del: 0.6, col: '#5EEAD4' },
      { x: 76, y: 38, s: 3.8, dur: 4.6, del: 1.8, col: '#A5F3FC' },
    ];
    return rawCoords.map((item, i) => ({
      id: i,
      left: `${item.x}%`,
      top: `${item.y}%`,
      size: `${item.s}px`,
      duration: `${item.dur}s`,
      delay: `${item.del}s`,
      color: item.col,
    }));
  }, []);

  // Organic, beautifully scattered bioluminescent specks for Midnight zone (no lines or grids)
  const midnightGlows = useMemo(() => {
    const points = [
      { x: 8, y: 18, s: 3.5, dur: 4.2, del: 0.3, col: '#38BDF8' },
      { x: 21, y: 12, s: 2.4, dur: 5.6, del: 1.8, col: '#A78BFA' },
      { x: 14, y: 32, s: 4.2, dur: 3.8, del: 2.5, col: '#2DD4BF' },
      { x: 27, y: 24, s: 2.8, dur: 6.1, del: 0.9, col: '#818CF8' },
      { x: 44, y: 15, s: 3.6, dur: 4.7, del: 3.1, col: '#C084FC' },
      { x: 53, y: 28, s: 2.2, dur: 5.3, del: 1.2, col: '#67E8F9' },
      { x: 39, y: 36, s: 4.8, dur: 4.0, del: 2.8, col: '#2DD4BF' },
      { x: 61, y: 19, s: 3.0, dur: 5.9, del: 0.5, col: '#38BDF8' },
      { x: 76, y: 14, s: 2.6, dur: 6.4, del: 2.2, col: '#A78BFA' },
      { x: 89, y: 22, s: 4.0, dur: 4.4, del: 1.6, col: '#818CF8' },
      { x: 82, y: 34, s: 2.5, dur: 5.7, del: 3.4, col: '#2DD4BF' },
      { x: 95, y: 17, s: 3.2, dur: 4.9, del: 0.7, col: '#C084FC' },
      { x: 9, y: 48, s: 2.8, dur: 6.2, del: 2.9, col: '#67E8F9' },
      { x: 18, y: 62, s: 4.5, dur: 3.9, del: 1.4, col: '#38BDF8' },
      { x: 26, y: 44, s: 2.4, dur: 5.5, del: 0.2, col: '#A78BFA' },
      { x: 12, y: 72, s: 3.8, dur: 4.6, del: 2.6, col: '#818CF8' },
      { x: 48, y: 46, s: 2.5, dur: 6.0, del: 3.7, col: '#2DD4BF' },
      { x: 57, y: 58, s: 4.2, dur: 4.3, del: 0.8, col: '#C084FC' },
      { x: 36, y: 54, s: 3.0, dur: 5.1, del: 2.1, col: '#38BDF8' },
      { x: 66, y: 42, s: 2.7, dur: 5.8, del: 1.5, col: '#67E8F9' },
      { x: 74, y: 52, s: 4.4, dur: 4.1, del: 3.0, col: '#A78BFA' },
      { x: 86, y: 48, s: 2.4, dur: 6.5, del: 0.4, col: '#818CF8' },
      { x: 93, y: 64, s: 3.6, dur: 4.8, del: 1.9, col: '#2DD4BF' },
      { x: 80, y: 68, s: 2.6, dur: 5.4, del: 2.7, col: '#38BDF8' },
      { x: 7, y: 86, s: 3.4, dur: 4.5, del: 0.6, col: '#C084FC' },
      { x: 22, y: 78, s: 2.8, dur: 6.3, del: 3.2, col: '#67E8F9' },
      { x: 32, y: 88, s: 4.6, dur: 3.7, del: 1.7, col: '#A78BFA' },
      { x: 16, y: 92, s: 2.3, dur: 5.6, del: 2.4, col: '#818CF8' },
      { x: 45, y: 78, s: 3.8, dur: 4.9, del: 0.1, col: '#2DD4BF' },
      { x: 54, y: 86, s: 2.5, dur: 6.1, del: 2.8, col: '#38BDF8' },
      { x: 63, y: 72, s: 4.2, dur: 4.2, del: 1.3, col: '#C084FC' },
      { x: 41, y: 91, s: 2.7, dur: 5.2, del: 3.5, col: '#67E8F9' },
      { x: 73, y: 84, s: 3.5, dur: 4.7, del: 0.9, col: '#A78BFA' },
      { x: 85, y: 82, s: 2.4, dur: 6.4, del: 2.3, col: '#818CF8' },
      { x: 92, y: 88, s: 4.0, dur: 4.4, del: 1.1, col: '#2DD4BF' },
      { x: 79, y: 94, s: 2.6, dur: 5.5, del: 3.0, col: '#38BDF8' },
    ];
    return points.map((p, i) => ({
      id: i,
      left: `${p.x}%`,
      top: `${p.y}%`,
      size: `${p.s}px`,
      duration: `${p.dur}s`,
      delay: `${p.del}s`,
      color: p.col,
    }));
  }, []);

  // Marine snow (falling slowly) for Abyss zone
  const abyssMarineSnow = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${(i * 19 + 5) % 94 + 3}%`,
      size: `${2 + (i % 3)}px`,
      duration: `${12 + (i % 5) * 3}s`,
      delay: `-${(i * 2.1) % 12}s`,
      drift: `${(i % 2 === 0 ? 1 : -1) * (8 + (i % 3) * 5)}px`,
    }));
  }, []);

  // Gentle rose, violet, and gold motes for Trench zone
  const trenchMotes = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const colors = ['#F43F5E', '#FB7185', '#C084FC', '#FBBF24', '#F472B6'];
      return {
        id: i,
        left: `${(i * 21 + 9) % 92 + 4}%`,
        top: `${(i * 29 + 19) % 80 + 10}%`,
        size: `${4 + (i % 3) * 2.5}px`,
        duration: `${5 + (i % 3) * 2}s`,
        delay: `${(i * 0.6) % 5}s`,
        color: colors[i % colors.length],
      };
    });
  }, []);

  // Zone specific gradient classes (transition ~2.5s)
  const getGradientClass = (z: DepthZone) => {
    switch (z) {
      case 'sunlight':
        // Bright saturated blue gradient: light at top, slightly deeper at bottom
        return 'from-[#38bdf8] via-[#0284c7] to-[#0369a1]';
      case 'twilight':
        // Dimmer cooler teal-blue
        return 'from-[#0d9488] via-[#0f766e] to-[#134e4a]';
      case 'midnight':
        // Dark navy-to-indigo gradient
        return 'from-[#1e1b4b] via-[#1e293b] to-[#0f172a]';
      case 'abyss':
        // Very dark blue, nearly black
        return 'from-[#091122] via-[#050b17] to-[#02050c]';
      case 'trench':
        // Blackish navy, almost pitch black
        return 'from-[#060810] via-[#030409] to-[#010205]';
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Background Gradient with smooth 2.5s descent transition */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${getGradientClass(
          zone
        )} transition-all duration-[2500ms] ease-in-out`}
      />

      {/* 1. SUNLIGHT ZONE: Soft sun rays streaming down + light caustics */}
      <div
        className={`absolute inset-0 transition-opacity duration-[2200ms] ${
          zone === 'sunlight' ? 'opacity-85' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Soft bright glow along the very top edge of the water */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-white/35 via-cyan-100/15 to-transparent pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-2.5 bg-white/45 blur-[2px] pointer-events-none" />

        {/* Shimmering Caustics Grid at surface */}
        <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-white/20 via-cyan-200/10 to-transparent mix-blend-overlay pointer-events-none" />
        
        {/* 8 Soft Sun Rays fanning down from above across the full width */}
        <svg
          viewBox="0 0 1000 650"
          preserveAspectRatio="none"
          className="w-full h-full object-cover pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sunRayGrad1" x1="0%" y1="0%" x2="25%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="40%" stopColor="#67E8F9" stopOpacity="0.18" />
              <stop offset="85%" stopColor="#0284C7" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sunRayGrad2" x1="0%" y1="0%" x2="30%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.32" />
              <stop offset="45%" stopColor="#38BDF8" stopOpacity="0.16" />
              <stop offset="90%" stopColor="#0369A1" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sunRayGrad3" x1="0%" y1="0%" x2="25%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.38" />
              <stop offset="35%" stopColor="#A5F3FC" stopOpacity="0.2" />
              <stop offset="80%" stopColor="#0284C7" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sunRayGrad4" x1="0%" y1="0%" x2="30%" y2="100%">
              <stop offset="0%" stopColor="#FEF9C3" stopOpacity="0.28" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.14" />
              <stop offset="85%" stopColor="#0369A1" stopOpacity="0" />
            </linearGradient>
            <filter id="softRayBlur" x="-10%" y="0%" width="120%" height="100%">
              <feGaussianBlur stdDeviation="3.5" />
            </filter>
          </defs>

          {/* Rays fade out toward the middle of the screen so they don't wash out creatures */}
          <g filter="url(#softRayBlur)">
            {/* Ray 1 (far left) */}
            <polygon
              points="10,0 60,0 135,460 65,460"
              fill="url(#sunRayGrad1)"
              className="animate-ray-sway"
              style={{ animationDuration: '13s' }}
            />
            {/* Ray 2 (left-mid) */}
            <polygon
              points="125,0 185,0 280,530 195,530"
              fill="url(#sunRayGrad2)"
              className="animate-ray-sway-delayed"
              style={{ animationDuration: '17s' }}
            />
            {/* Ray 3 (mid-left) */}
            <polygon
              points="245,0 315,0 415,480 325,480"
              fill="url(#sunRayGrad3)"
              className="animate-ray-sway"
              style={{ animationDuration: '15s', animationDelay: '-3s' }}
            />
            {/* Ray 4 (center-left) */}
            <polygon
              points="380,0 460,0 580,560 480,560"
              fill="url(#sunRayGrad1)"
              className="animate-ray-sway-delayed"
              style={{ animationDuration: '19s', animationDelay: '-5s' }}
            />
            {/* Ray 5 (center-right) */}
            <polygon
              points="515,0 585,0 710,490 620,490"
              fill="url(#sunRayGrad4)"
              className="animate-ray-sway"
              style={{ animationDuration: '14s', animationDelay: '-2s' }}
            />
            {/* Ray 6 (mid-right) */}
            <polygon
              points="645,0 725,0 860,540 765,540"
              fill="url(#sunRayGrad2)"
              className="animate-ray-sway-delayed"
              style={{ animationDuration: '16s', animationDelay: '-7s' }}
            />
            {/* Ray 7 (right-mid) */}
            <polygon
              points="775,0 855,0 990,470 900,470"
              fill="url(#sunRayGrad3)"
              className="animate-ray-sway"
              style={{ animationDuration: '18s', animationDelay: '-4s' }}
            />
            {/* Ray 8 (far right) */}
            <polygon
              points="895,0 970,0 1100,510 1010,510"
              fill="url(#sunRayGrad1)"
              className="animate-ray-sway-delayed"
              style={{ animationDuration: '15s', animationDelay: '-8s' }}
            />
          </g>
        </svg>

        {/* Beachy sandy seabed with colorful coral & green seaweed in Sunlight */}
        <div className="absolute inset-x-0 bottom-0 h-44 pointer-events-none">
          {/* Sandy floor gradient */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#e0bb88]/40 via-[#d4a373]/20 to-transparent" />

          {/* SVG Coral & Seaweed Silhouettes */}
          <svg viewBox="0 0 1000 160" preserveAspectRatio="none" className="w-full h-full">
            {/* Soft sandy hills */}
            <path d="M 0 160 Q 250 110 500 135 T 1000 120 L 1000 160 Z" fill="#b08968" opacity="0.35" />

            {/* Coral formations: left & right */}
            {/* Colorful coral left */}
            <path d="M 40 160 Q 50 110 70 120 Q 80 90 95 115 Q 110 100 120 130 Q 135 120 145 160 Z" fill="#F43F5E" opacity="0.55" />
            <circle cx="70" cy="118" r="8" fill="#FB7185" opacity="0.6" />
            <circle cx="95" cy="112" r="7" fill="#FDA4AF" opacity="0.6" />
            <circle cx="120" cy="126" r="6" fill="#F43F5E" opacity="0.6" />

            {/* Coral formations right */}
            <path d="M 860 160 Q 875 105 895 125 Q 915 95 935 120 Q 950 110 965 160 Z" fill="#F59E0B" opacity="0.5" />
            <circle cx="895" cy="122" r="7" fill="#FBBF24" opacity="0.55" />
            <circle cx="935" cy="118" r="8" fill="#FDE68A" opacity="0.55" />

            {/* Swaying green seaweed cluster left */}
            <path d="M 170 160 Q 160 110 180 70 Q 190 40 175 15 Q 200 40 185 80 Q 170 120 185 160 Z" fill="#10B981" opacity="0.65" />
            <path d="M 200 160 Q 220 115 205 75 Q 195 45 210 20 Q 215 50 210 90 Q 230 130 215 160 Z" fill="#059669" opacity="0.6" />

            {/* Swaying green seaweed cluster right */}
            <path d="M 800 160 Q 820 110 805 65 Q 795 30 810 10 Q 825 40 815 80 Q 830 120 815 160 Z" fill="#10B981" opacity="0.6" />
            <path d="M 770 160 Q 750 115 765 75 Q 780 45 765 20 Q 785 50 775 90 Q 760 130 780 160 Z" fill="#047857" opacity="0.55" />
          </svg>
        </div>
      </div>

      {/* 2. TWILIGHT ZONE: Faint diffuse light at surface + sparser muted seaweed + faint sandy seabed */}
      <div
        className={`absolute inset-0 transition-opacity duration-[2200ms] ${
          zone === 'twilight' ? 'opacity-75' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Soft, gentle ambient surface glow fading out in upper water column - no diagonal lines */}
        <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-teal-200/18 via-teal-400/8 to-transparent pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-cyan-200/15 to-transparent blur-md pointer-events-none" />

        {/* Soft diffuse horizontal ambient light pools (fading out completely before mid-depth) */}
        <svg
          viewBox="0 0 1000 350"
          preserveAspectRatio="none"
          className="w-full h-64 object-cover opacity-25 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="twilightLightPool" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0F766E" stopOpacity="0" />
            </linearGradient>
            <filter id="twilightSoftBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="16" />
            </filter>
          </defs>
          <g filter="url(#twilightSoftBlur)">
            <ellipse cx="220" cy="30" rx="140" ry="110" fill="url(#twilightLightPool)" className="animate-ray-sway" />
            <ellipse cx="520" cy="40" rx="160" ry="120" fill="url(#twilightLightPool)" className="animate-ray-sway-delayed" />
            <ellipse cx="800" cy="35" rx="150" ry="110" fill="url(#twilightLightPool)" className="animate-ray-sway" />
          </g>
        </svg>

        {/* Soft sandy seabed barely visible with sparser muted seaweed strands */}
        <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none">
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#134e4a]/50 to-transparent" />
          <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="w-full h-full">
            <path d="M 0 120 Q 300 95 600 110 T 1000 100 L 1000 120 Z" fill="#0f3d38" opacity="0.35" />
            {/* Few sparse muted seaweed strands */}
            <path d="M 80 120 Q 95 75 85 40 Q 105 75 95 120 Z" fill="#115e59" opacity="0.5" />
            <path d="M 900 120 Q 885 80 895 45 Q 910 80 905 120 Z" fill="#115e59" opacity="0.5" />
          </svg>
        </div>
      </div>

      {/* 3. MIDNIGHT ZONE: Organic scattered bioluminescence (no lines, grids, or trails) */}
      <div
        className={`absolute inset-0 transition-opacity duration-[2200ms] ${
          zone === 'midnight' ? 'opacity-95' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Soft, atmospheric ambient glow clouds in deep water */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-2/3 right-1/4 w-72 h-72 rounded-full bg-teal-500/8 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-3/5 w-64 h-64 rounded-full bg-violet-500/8 blur-3xl pointer-events-none" />

        {/* Scattered bioluminescent dots with independent pulsing and gentle glows */}
        {midnightGlows.map((g) => (
          <div
            key={g.id}
            className="absolute rounded-full animate-float-pulse pointer-events-none"
            style={{
              left: g.left,
              top: g.top,
              width: g.size,
              height: g.size,
              backgroundColor: g.color,
              boxShadow: `0 0 8px ${g.color}, 0 0 16px ${g.color}`,
              animationDuration: g.duration,
              animationDelay: g.delay,
            }}
          />
        ))}
      </div>

      {/* 4. ABYSS ZONE: Subtle cold-blue fog/haze at edges + Marine Snow falling slowly */}
      <div
        className={`absolute inset-0 transition-opacity duration-[2200ms] ${
          zone === 'abyss' ? 'opacity-90' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Cold-blue peripheral fog/haze */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(15,23,42,0.85)_100%)] pointer-events-none" />
        <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(56,189,248,0.08)] pointer-events-none" />

        {/* Drifting Marine Snow Falling Downward */}
        {abyssMarineSnow.map((snow) => (
          <div
            key={snow.id}
            className="absolute top-0 rounded-full bg-cyan-100/60 pointer-events-none"
            style={{
              left: snow.left,
              width: snow.size,
              height: snow.size,
              boxShadow: '0 0 6px rgba(224, 242, 254, 0.5)',
              animation: `marineSnowFall ${snow.duration} linear infinite`,
              animationDelay: snow.delay,
              ['--snow-drift' as any]: snow.drift,
            }}
          />
        ))}
      </div>

      {/* 5. TRENCH ZONE: Faint silhouetted seafloor + Gentle slow bioluminescent motes (rose, violet, gold) */}
      <div
        className={`absolute inset-0 transition-opacity duration-[2200ms] ${
          zone === 'trench' ? 'opacity-95' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Deep vignetting sheltering darkness */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,_transparent_20%,_rgba(1,2,5,0.92)_100%)] pointer-events-none" />

        {/* Visible dark seabed, coral formations & swaying kelp along the bottom */}
        <div className="absolute inset-x-0 bottom-0 h-44 sm:h-52 pointer-events-none z-0">
          <svg viewBox="0 0 1000 170" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="trenchSeabedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0a1224" />
                <stop offset="40%" stopColor="#060b17" />
                <stop offset="100%" stopColor="#020409" />
              </linearGradient>
            </defs>

            {/* Back Rocky Ridge with faint blue rim light */}
            <path
              d="M 0 170 L 0 78 Q 110 58 220 76 Q 340 98 460 66 Q 590 50 720 74 Q 850 96 950 68 L 1000 75 L 1000 170 Z"
              fill="url(#trenchSeabedGrad)"
            />
            {/* Top rim light in faint blue */}
            <path
              d="M 0 78 Q 110 58 220 76 Q 340 98 460 66 Q 590 50 720 74 Q 850 96 950 68 L 1000 75"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="1.5"
              strokeOpacity="0.28"
            />

            {/* Front Rocky Uneven Floor with cool-blue navy tone */}
            <path
              d="M 0 170 L 0 110 Q 90 92 180 114 Q 280 135 400 102 Q 520 125 640 96 Q 760 120 870 94 L 1000 108 L 1000 170 Z"
              fill="#03050a"
            />
            {/* Secondary subtle rim light */}
            <path
              d="M 0 110 Q 90 92 180 114 Q 280 135 400 102 Q 520 125 640 96 Q 760 120 870 94 L 1000 108"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="1"
              strokeOpacity="0.18"
            />

            {/* CORAL FORMATIONS in dark navy-black with cool blue tones */}

            {/* 1. Branching Coral (Left: ~x=60..120) */}
            <g fill="#0e1b30">
              <path d="M 75 125 Q 70 85 85 65 Q 90 50 82 40 Q 92 48 94 65 Q 105 52 110 35 Q 116 48 106 72 Q 120 62 130 52 Q 126 68 112 85 Q 105 105 105 125 Z" />
              <path d="M 60 125 Q 52 95 42 80 Q 52 86 58 98 Q 65 110 70 125 Z" />
            </g>
            {/* Bioluminescent specks on left branching coral */}
            <circle cx="82" cy="40" r="2.2" fill="#2DD4BF" opacity="0.85" className="animate-pulse" />
            <circle cx="110" cy="35" r="2" fill="#C084FC" opacity="0.8" />
            <circle cx="130" cy="52" r="2.2" fill="#2DD4BF" opacity="0.75" />
            <circle cx="42" cy="80" r="1.8" fill="#A855F7" opacity="0.7" />

            {/* 2. Tube Coral Cluster (Mid-Left: ~x=175..215) */}
            <g fill="#0c172a" stroke="#1e293b" strokeWidth="0.8">
              {/* Tube 1 */}
              <path d="M 175 130 L 178 88 Q 183 85 188 88 L 191 130 Z" />
              <ellipse cx="183" cy="88" rx="5" ry="2" fill="#0f243a" stroke="#2DD4BF" strokeWidth="0.8" strokeOpacity="0.7" />
              {/* Tube 2 */}
              <path d="M 190 130 L 194 72 Q 200 69 206 72 L 209 130 Z" />
              <ellipse cx="200" cy="72" rx="6" ry="2.5" fill="#142e47" stroke="#38BDF8" strokeWidth="0.9" strokeOpacity="0.8" />
              {/* Tube 3 */}
              <path d="M 207 130 L 210 95 Q 215 92 220 95 L 223 130 Z" />
              <ellipse cx="215" cy="95" rx="5" ry="2" fill="#0f243a" stroke="#C084FC" strokeWidth="0.8" strokeOpacity="0.7" />
            </g>
            {/* Tiny glowing vents in tube coral */}
            <circle cx="183" cy="88" r="1.6" fill="#2DD4BF" opacity="0.9" />
            <circle cx="200" cy="72" r="2" fill="#38BDF8" opacity="0.95" />
            <circle cx="215" cy="95" r="1.6" fill="#C084FC" opacity="0.9" />

            {/* 3. Swaying Dark Kelp Strand (Left: ~x=290) */}
            <g className="animate-kelp-left" style={{ transformOrigin: '290px 145px' }}>
              <path
                d="M 288 145 Q 278 105 292 72 Q 302 45 288 20 Q 312 45 300 80 Q 288 115 298 145 Z"
                fill="#091b29"
                opacity="0.9"
              />
              {/* Tiny bioluminescent specks */}
              <circle cx="288" cy="20" r="2.2" fill="#2DD4BF" opacity="0.85" />
              <circle cx="298" cy="55" r="1.8" fill="#C084FC" opacity="0.75" />
            </g>

            {/* 4. Fan Coral (Center: ~x=460..520) */}
            <g fill="#0b162c" stroke="#162947" strokeWidth="0.8">
              <path d="M 490 135 Q 460 110 455 80 Q 480 65 500 68 Q 525 65 540 85 Q 525 110 495 135 Z" opacity="0.85" />
              {/* Fan ribs */}
              <path d="M 492 130 Q 475 105 468 85" fill="none" stroke="#22395d" strokeWidth="0.7" />
              <path d="M 492 130 Q 492 98 495 72" fill="none" stroke="#22395d" strokeWidth="0.7" />
              <path d="M 492 130 Q 510 105 528 88" fill="none" stroke="#22395d" strokeWidth="0.7" />
            </g>
            {/* Bioluminescent specks on fan coral edge */}
            <circle cx="458" cy="80" r="1.8" fill="#C084FC" opacity="0.8" />
            <circle cx="478" cy="67" r="1.8" fill="#2DD4BF" opacity="0.8" />
            <circle cx="500" cy="68" r="2" fill="#A855F7" opacity="0.85" />
            <circle cx="522" cy="72" r="1.8" fill="#2DD4BF" opacity="0.8" />
            <circle cx="538" cy="86" r="1.8" fill="#C084FC" opacity="0.8" />

            {/* 5. Swaying Dark Kelp Strand (Right: ~x=650) */}
            <g className="animate-kelp-right" style={{ transformOrigin: '650px 145px' }}>
              <path
                d="M 648 145 Q 662 105 650 68 Q 638 38 652 14 Q 665 42 656 78 Q 670 115 658 145 Z"
                fill="#071724"
                opacity="0.9"
              />
              {/* Bioluminescent specks */}
              <circle cx="652" cy="14" r="2.2" fill="#C084FC" opacity="0.85" />
              <circle cx="645" cy="50" r="1.8" fill="#2DD4BF" opacity="0.75" />
            </g>

            {/* 6. Tube Coral Cluster (Right-Mid: ~x=770..810) */}
            <g fill="#0c172a" stroke="#1e293b" strokeWidth="0.8">
              <path d="M 775 135 L 778 98 Q 783 95 788 98 L 791 135 Z" />
              <ellipse cx="783" cy="98" rx="5" ry="2" fill="#0f243a" stroke="#2DD4BF" strokeWidth="0.8" strokeOpacity="0.7" />
              <path d="M 790 135 L 794 82 Q 800 79 806 82 L 809 135 Z" />
              <ellipse cx="800" cy="82" rx="6" ry="2.5" fill="#142e47" stroke="#38BDF8" strokeWidth="0.9" strokeOpacity="0.8" />
            </g>
            <circle cx="783" cy="98" r="1.6" fill="#2DD4BF" opacity="0.9" />
            <circle cx="800" cy="82" r="2" fill="#38BDF8" opacity="0.95" />

            {/* 7. Branching Coral (Far Right: ~x=880..950) */}
            <g fill="#0e1a30">
              <path d="M 900 135 Q 892 98 908 75 Q 912 60 904 48 Q 916 56 918 75 Q 930 62 935 42 Q 942 56 932 80 Q 948 70 958 58 Q 952 76 938 95 Q 930 115 930 135 Z" />
            </g>
            {/* Bioluminescent specks on far right coral */}
            <circle cx="904" cy="48" r="2.2" fill="#2DD4BF" opacity="0.85" />
            <circle cx="935" cy="42" r="2.2" fill="#C084FC" opacity="0.85" />
            <circle cx="958" cy="58" r="2" fill="#2DD4BF" opacity="0.8" />
          </svg>
        </div>

        {/* Gentle, slow bioluminescent motes (rose, violet, gold) drifting up or hovering */}
        {trenchMotes.map((mote) => (
          <div
            key={mote.id}
            className="absolute rounded-full animate-float-pulse"
            style={{
              left: mote.left,
              top: mote.top,
              width: mote.size,
              height: mote.size,
              backgroundColor: mote.color,
              boxShadow: `0 0 12px ${mote.color}, 0 0 24px ${mote.color}`,
              animationDuration: mote.duration,
              animationDelay: mote.delay,
            }}
          />
        ))}
      </div>

      {/* Sunlight Rising Bubbles (active mainly in Sunlight) */}
      <div
        className={`absolute inset-0 overflow-hidden transition-opacity duration-[2000ms] ${
          zone === 'sunlight' ? 'opacity-100' : 'opacity-15'
        }`}
      >
        {sunlightBubbles.map((b) => (
          <div
            key={b.id}
            className="absolute bottom-0 rounded-full border border-white/50 bg-white/20 backdrop-blur-[0.5px] animate-bubble pointer-events-none"
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              animationDuration: b.duration,
              animationDelay: b.delay,
              ['--bubble-drift' as any]: b.drift,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white/80 ml-0.5 mt-0.5" />
          </div>
        ))}
      </div>

      {/* Twilight Pale Blue Specks (active mainly in Twilight) */}
      <div
        className={`absolute inset-0 overflow-hidden transition-opacity duration-[2000ms] ${
          zone === 'twilight' ? 'opacity-85' : 'opacity-0'
        }`}
      >
        {twilightSpecks.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full animate-float-pulse pointer-events-none"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              backgroundColor: s.color,
              boxShadow: `0 0 8px ${s.color}, 0 0 16px ${s.color}`,
              animationDuration: s.duration,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
};
