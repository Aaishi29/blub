import React from 'react';
import { CreatureIllustration } from './CreatureIllustration';
import { getCreatureById, getZoneDetails } from '../data/creatures';

interface Props {
  creatureId: string;
  x: number; // 0 - 100%
  y: number; // 0 - 100%
  facing: 1 | -1;
  rotation?: number; // Tilt in degrees (-15 to +15)
  layer?: number; // 0 (far/deep) to 1 (near/front)
  scale?: number;
  isNew?: boolean;
  isWiggling?: boolean;
  speechBubble?: string;
  onClick: () => void;
}

export const Creature: React.FC<Props> = ({
  creatureId,
  x,
  y,
  facing,
  rotation = 0,
  layer = 0.6,
  scale = 1,
  isNew = false,
  isWiggling = false,
  speechBubble,
  onClick,
}) => {
  const info = getCreatureById(creatureId);
  const zoneInfo = getZoneDetails(info.zone);

  // Depth-layer calculations (0 is far/deep, 1 is near/foreground)
  const depthScale = scale * (0.72 + layer * 0.38);
  const depthOpacity = 0.62 + layer * 0.38;
  const depthZIndex = Math.round(10 + layer * 15);

  return (
    <div
      className="absolute cursor-pointer select-none group pointer-events-auto"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%)`,
        zIndex: depthZIndex,
        opacity: depthOpacity,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${info.name} the ${info.species}. Click to view fun fact.`}
    >
      {/* Pop-in bubble burst particles if brand new */}
      {isNew && (
        <div className="absolute inset-0 pointer-events-none -m-6 animate-bubble-burst">
          <div className="w-full h-full rounded-full border-2 border-cyan-200/80 bg-white/20" />
        </div>
      )}

      {/* Tiny subtle trailing micro-bubbles behind swimming creature */}
      <div
        className="absolute pointer-events-none -z-10 transition-opacity duration-300"
        style={{
          left: facing === 1 ? '-8px' : 'calc(100% + 2px)',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/40 animate-ping" />
      </div>

      {/* Speech Bubble when tapped */}
      {speechBubble && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 sm:w-64 p-3 rounded-2xl bg-white/95 text-slate-800 shadow-xl border-2 border-cyan-200 backdrop-blur-md animate-speech-pop pointer-events-auto z-40 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="font-extrabold text-xs uppercase tracking-wider text-cyan-700">
              {info.name}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">({info.species})</span>
          </div>
          <p className="text-xs text-slate-600 leading-snug font-medium">
            "{info.funFact}"
          </p>
          <div className="mt-1.5 flex items-center justify-center gap-1">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-semibold">
              Pattern: {info.pattern}
            </span>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
        </div>
      )}

      {/* Smooth Turn Wrapper (scaleX squash through zero over 0.5s instead of snapping) */}
      <div
        className="transition-transform duration-500 ease-in-out"
        style={{
          transform: `scaleX(${facing}) rotate(${rotation * facing}deg)`,
          transformOrigin: 'center center',
        }}
      >
        {/* Depth Scale & Interactive Wiggle Layer */}
        <div
          className={`transform transition-transform duration-300 ${
            isWiggling ? 'animate-wiggle' : ''
          } ${isNew ? 'animate-pop-in' : ''}`}
          style={{
            transform: `scale(${depthScale})`,
          }}
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 hover:scale-105 active:scale-95 transition-transform">
            <CreatureIllustration id={creatureId} className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
