import React, { useState } from 'react';
import { AvatarLook, EquippedAccessories } from '../types';
import { AvatarIllustration } from './AvatarIllustration';
import { soundManager } from '../services/sound';
import { Sparkles, Shirt } from 'lucide-react';

interface Props {
  look: AvatarLook;
  equipped?: EquippedAccessories;
  moodExpression?: 'bright' | 'warm' | 'even' | 'down' | 'heavy';
  isWaving?: boolean;
  onOpenWardrobe: () => void;
  className?: string;
}

export const AvatarCharacter: React.FC<Props> = ({
  look,
  equipped = {},
  moodExpression = 'even',
  isWaving = false,
  onOpenWardrobe,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [clickPulse, setClickPulse] = useState(false);

  const handleClick = () => {
    soundManager.playBlub();
    setClickPulse(true);
    setTimeout(() => setClickPulse(false), 500);
    onOpenWardrobe();
  };

  return (
    <div
      className={`fixed left-1/2 top-[51%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center select-none pointer-events-auto ${className}`}
      style={{
        // Smooth transition if resized
        transition: 'transform 0.4s ease, opacity 0.5s ease',
      }}
    >
      <div
        className="relative group cursor-pointer"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-label={`Avatar ${look.name}. Tap to open Wardrobe.`}
        title="Tap to open Wardrobe"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {/* Soft magical aura glow around avatar in the open sea */}
        <div
          className={`absolute inset-0 rounded-full blur-xl pointer-events-none transition-all duration-700 ${
            moodExpression === 'bright'
              ? 'bg-amber-300/25 scale-125'
              : moodExpression === 'warm'
              ? 'bg-rose-400/25 scale-125'
              : moodExpression === 'down'
              ? 'bg-blue-400/20 scale-120'
              : moodExpression === 'heavy'
              ? 'bg-indigo-400/20 scale-120'
              : 'bg-teal-300/20 scale-115'
          } ${isHovered ? 'scale-135 opacity-90' : 'opacity-60'}`}
        />

        {/* Gentle bobbing animation wrapper */}
        <div
          className={`relative animate-avatar-bob transition-transform duration-300 ${
            clickPulse ? 'scale-105' : isHovered ? 'scale-103' : 'scale-100'
          }`}
        >
          {/* Avatar SVG Illustration: slightly larger than creatures, approx 140px width x 180px height */}
          <AvatarIllustration
            key={`avatar-char-${look.preset}-${look.skinTone}-${look.hairStyle}-${look.hairColor}-${look.tailPattern}`}
            look={look}
            equipped={equipped}
            expression={moodExpression}
            isWaving={isWaving}
            className="w-32 h-44 sm:w-36 sm:h-48 drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
          />

          {/* Dive celebration sparkle bursts */}
          {isWaving && (
            <div className="absolute -top-3 -right-2 pointer-events-none animate-bounce">
              <Sparkles size={22} className="text-amber-300 drop-shadow-md animate-spin" />
            </div>
          )}
        </div>

        {/* Soft hovering tooltip / pill prompt */}
        <div
          className={`absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white/90 text-[11px] font-medium shadow-md transition-all duration-300 pointer-events-none whitespace-nowrap ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
          }`}
        >
          <Shirt size={12} className="text-teal-300" />
          <span>Wardrobe</span>
        </div>
      </div>
    </div>
  );
};
