import React, { useId } from 'react';
import { AvatarLook, EquippedAccessories, HairStyle } from '../types';
import { TAIL_PATTERNS } from '../data/accessories';

interface Props {
  look: AvatarLook;
  equipped?: EquippedAccessories;
  expression?: 'bright' | 'warm' | 'even' | 'down' | 'heavy';
  isWaving?: boolean;
  thumbnailMode?: boolean; // If true, crops strictly to head & shoulders for header button
  className?: string;
}

export const AvatarIllustration: React.FC<Props> = ({
  look,
  equipped = {},
  expression = 'even',
  isWaving = false,
  thumbnailMode = false,
  className = 'w-28 h-40',
}) => {
  const rawId = useId();
  // Safe unique prefix for SVG gradient & filter references so multiple previews never conflict
  const uid = `av-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

  const { preset = 'mermaid', skinTone, hairStyle, hairColor, tailPattern } = look;
  const tailInfo = TAIL_PATTERNS.find((t) => t.id === tailPattern) || TAIL_PATTERNS[0];

  // Head and shoulders thumbnail view (for top header Profile icon)
  if (thumbnailMode) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden rounded-full ${className}`}>
        <svg viewBox="24 5 52 52" className="w-full h-full overflow-hidden drop-shadow-sm">
          {renderDefs(uid, skinTone, hairColor, tailInfo)}

          {/* Back Hair (under neck & shoulders) */}
          {renderBackHair(uid, hairStyle, hairColor)}

          {/* Torso Top & Neck */}
          {preset === 'merman' ? (
            <>
              {/* Broader athletic neck & shoulders */}
              <path d="M 45 35 L 45 44 L 55 44 L 55 35 Z" fill={`url(#${uid}-skin)`} />
              <path d="M 34 46 C 40 40, 60 40, 66 46 L 68 56 L 32 56 Z" fill={`url(#${uid}-skin)`} />
              {renderTop(uid, preset, equipped.top, tailInfo.secondary)}
            </>
          ) : (
            <>
              <path d="M 46 35 L 46 44 L 54 44 L 54 35 Z" fill={`url(#${uid}-skin)`} />
              <path d="M 37 46 C 42 41, 58 41, 63 46 L 65 56 L 35 56 Z" fill={`url(#${uid}-skin)`} />
              {renderTop(uid, preset, equipped.top, tailInfo.secondary)}
            </>
          )}

          {/* Head & Facial Expression */}
          {renderHead(uid, skinTone, expression)}

          {/* Front Hair with rich top volume */}
          {renderFrontHair(uid, hairStyle, hairColor)}

          {/* Accessories */}
          {equipped.head && renderHeadAccessory(equipped.head)}
          {equipped.neck && renderNeckAccessory(equipped.neck)}
        </svg>
      </div>
    );
  }

  // Full-body sea character and live customizer preview
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="-8 0 116 134"
        className="w-full h-full overflow-visible drop-shadow-[0_4px_16px_rgba(20,184,166,0.3)]"
      >
        {renderDefs(uid, skinTone, hairColor, tailInfo)}

        {/* 1. Back Hair Layer (Behind shoulders & back) */}
        {renderBackHair(uid, hairStyle, hairColor)}

        {/* 2. Back Accessory Layer (Behind body) */}
        {equipped.back && renderBackAccessory(equipped.back)}

        {/* 3. Seamless Integrated Tail & Body Group */}
        <g>
          {/* Seamless Tail Body & Flukes */}
          {renderUnifiedTail(uid, tailInfo, equipped.tail)}

          {/* Torso & Hips */}
          {preset === 'merman' ? (
            /* Athletic Merman Torso */
            <path
              d="M 40 45 C 39 53, 42 62, 45 66 C 48 69, 52 69, 55 66 C 58 62, 61 53, 60 45 C 60 40, 40 40, 40 45 Z"
              fill={`url(#${uid}-skin)`}
            />
          ) : (
            /* Graceful Mermaid / Merfolk Torso */
            <path
              d="M 42 45 C 41 53, 43 62, 45 66 C 48 69, 52 69, 55 66 C 57 62, 59 53, 58 45 C 58 41, 42 41, 42 45 Z"
              fill={`url(#${uid}-skin)`}
            />
          )}

          {/* Upper Body Attire / Base Layer (Tailored to preset & accessories) */}
          {renderTop(uid, preset, equipped.top, tailInfo.secondary)}

          {/* Neck */}
          <path d="M 46.5 33 L 46.5 44 L 53.5 44 L 53.5 33 Z" fill={`url(#${uid}-skin)`} />

          {/* Head & Expression */}
          {renderHead(uid, skinTone, expression)}

          {/* Front Hair with rich, styled top volume */}
          {renderFrontHair(uid, hairStyle, hairColor)}

          {/* Head & Neck Accessories */}
          {equipped.head && renderHeadAccessory(equipped.head)}
          {equipped.neck && renderNeckAccessory(equipped.neck)}

          {/* Arms & Hands (includes Wrists and Hand items) */}
          {renderArms(uid, skinTone, isWaving, equipped.wrists, equipped.hand)}
        </g>

        {/* 4. Companion Layer (Floating gently beside avatar, never overlapping whisper) */}
        {equipped.companion && renderCompanion(equipped.companion)}
      </svg>
    </div>
  );
};

// ==========================================
// SVG GRADIENTS & DEFS (WITH UNIQUE PREFIX)
// ==========================================
function renderDefs(uid: string, skinColor: string, hairColor: string, tailInfo: any) {
  return (
    <defs>
      {/* Unique Skin Tone Gradient */}
      <linearGradient id={`${uid}-skin`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={skinColor} />
        <stop offset="100%" stopColor={darkenHex(skinColor, 0.88)} />
      </linearGradient>

      {/* Unique Hair Gradient */}
      <linearGradient id={`${uid}-hair`} x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stopColor={lightenHex(hairColor, 1.2)} />
        <stop offset="55%" stopColor={hairColor} />
        <stop offset="100%" stopColor={darkenHex(hairColor, 0.78)} />
      </linearGradient>

      {/* Unique Tail Gradient */}
      <linearGradient id={`${uid}-tail`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={tailInfo.secondary} />
        <stop offset="50%" stopColor={tailInfo.primary} />
        <stop offset="100%" stopColor={darkenHex(tailInfo.primary, 0.75)} />
      </linearGradient>

      {/* Tail Shimmer */}
      <linearGradient id={`${uid}-shimmer`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
        <stop offset="50%" stopColor="#A5F3FC" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
      </linearGradient>
    </defs>
  );
}

// ==========================================
// SEAMLESS INTEGRATED TAIL & FLUKES
// ==========================================
function renderUnifiedTail(uid: string, tailInfo: any, tailEquipped?: string) {
  return (
    <g>
      {/* 1. Main Tapered Tail Body from Hips (y=64) smoothly extending through Peduncle (y=108) */}
      <path
        d="M 44 64
           C 41 74, 42 86, 46 98
           C 47.5 102, 48.5 106, 50 110
           C 51.5 106, 52.5 102, 54 98
           C 58 86, 59 74, 56 64 Z"
        fill={`url(#${uid}-tail)`}
      />

      {/* 2. Smoothly Attached Left & Right Tail Flukes */}
      {/* Left Fluke */}
      <path
        d={
          tailEquipped === 'torn_edge_fins'
            ? 'M 49.5 107 C 44 111, 29 116, 24 125 C 26 126, 28 124, 30 126 C 33 125, 36 124, 40 121 C 45 117, 48 113, 50 108 Z'
            : 'M 49.5 107 C 44 111, 30 117, 25 125 C 23.5 127.5, 29 128, 36 124 C 44 119, 48 114, 50 108 Z'
        }
        fill={`url(#${uid}-tail)`}
      />
      {/* Right Fluke */}
      <path
        d={
          tailEquipped === 'torn_edge_fins'
            ? 'M 50.5 107 C 56 111, 71 116, 76 125 C 74 126, 72 124, 70 126 C 67 125, 64 124, 60 121 C 55 117, 52 113, 50 108 Z'
            : 'M 50.5 107 C 56 111, 70 117, 75 125 C 76.5 127.5, 71 128, 64 124 C 56 119, 52 114, 50 108 Z'
        }
        fill={`url(#${uid}-tail)`}
      />

      {/* Fluke Center Spine Rib */}
      <path
        d="M 50 105 L 50 115"
        stroke={tailInfo.secondary}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Waist Dorsal Fin Crest */}
      <path
        d="M 42 64 C 46 68, 54 68, 58 64 C 55 67, 45 67, 42 64 Z"
        fill={tailInfo.secondary}
        opacity="0.9"
      />

      {/* Tail Pattern Variations */}
      {tailInfo.id === 'spotted' && (
        <g fill="#A5F3FC" opacity="0.8">
          <circle cx="48" cy="74" r="1.3" />
          <circle cx="52" cy="77" r="1.1" />
          <circle cx="47" cy="82" r="1.2" />
          <circle cx="53" cy="86" r="1.0" />
          <circle cx="49" cy="92" r="0.9" />
          <circle cx="51" cy="98" r="0.8" />
          <circle cx="43" cy="118" r="1.1" />
          <circle cx="57" cy="118" r="1.1" />
        </g>
      )}

      {tailInfo.id === 'gradient' && (
        <path
          d="M 45 70 C 47 82, 53 82, 55 70 C 54 88, 46 88, 45 70 Z"
          fill={`url(#${uid}-shimmer)`}
        />
      )}

      {/* Equipped: Striped Pattern */}
      {tailEquipped === 'striped_pattern' && (
        <g stroke="#FFFFFF" strokeWidth="1.3" strokeOpacity="0.85" fill="none">
          <path d="M 43.5 73 Q 50 77 56.5 73" />
          <path d="M 44.5 82 Q 50 86 55.5 82" />
          <path d="M 46.5 91 Q 50 95 53.5 91" />
          <path d="M 48.5 100 Q 50 103 51.5 100" />
        </g>
      )}

      {/* Equipped: Glowing Spots */}
      {tailEquipped === 'glowing_spots' && (
        <g fill="#67E8F9" className="animate-pulse drop-shadow-[0_0_8px_#22D3EE]">
          <circle cx="49" cy="71" r="1.5" />
          <circle cx="52" cy="75" r="1.3" />
          <circle cx="48" cy="80" r="1.4" />
          <circle cx="52" cy="85" r="1.3" />
          <circle cx="49" cy="91" r="1.2" />
          <circle cx="51" cy="97" r="1.1" />
          <circle cx="50" cy="103" r="1.0" />
          <circle cx="34" cy="120" r="1.4" />
          <circle cx="66" cy="120" r="1.4" />
        </g>
      )}

      {/* Equipped: Shimmering Scale Overlay */}
      {tailEquipped === 'shimmering_scales' && (
        <g fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.85">
          <path d="M 46 72 Q 49 75 52 72 Q 55 75 58 72" />
          <path d="M 46 78 Q 49 81 52 78 Q 55 81 58 78" />
          <path d="M 47 84 Q 50 87 53 84" />
          <path d="M 48 90 Q 51 93 54 90" />
          <path d="M 49 97 Q 50 100 51 97" />
        </g>
      )}

      {/* Equipped: Glowing Fin Tips */}
      {tailEquipped === 'glowing_fin_tips' && (
        <g className="animate-pulse">
          <circle cx="25" cy="125" r="3.2" fill="#67E8F9" className="drop-shadow-[0_0_8px_#22D3EE]" />
          <circle cx="75" cy="125" r="3.2" fill="#67E8F9" className="drop-shadow-[0_0_8px_#22D3EE]" />
          <circle cx="50" cy="110" r="2.2" fill="#A5F3FC" />
        </g>
      )}

      {/* Equipped: Starfish Tail Charm */}
      {tailEquipped === 'starfish_tail_charm' && (
        <g transform="translate(52, 88)">
          <path
            d="M 0 -4 L 1 -1 L 4 0 L 1 1 L 0 4 L -1 1 L -4 0 L -1 -1 Z"
            fill="#FBBF24"
            className="drop-shadow-[0_0_6px_#F59E0B]"
          />
          <circle cx="0" cy="0" r="1.2" fill="#FEF08A" />
        </g>
      )}
    </g>
  );
}

// ==========================================
// HEAD, FACE & EXPRESSION
// ==========================================
function renderHead(uid: string, skinColor: string, expression: string) {
  return (
    <g>
      {/* Calm Oval Head */}
      <ellipse cx="50" cy="26" rx="9" ry="10.5" fill={`url(#${uid}-skin)`} />

      {/* Rosy Oceanic Cheeks */}
      <ellipse cx="44" cy="28.5" rx="2" ry="1.2" fill="#F43F5E" opacity="0.22" />
      <ellipse cx="56" cy="28.5" rx="2" ry="1.2" fill="#F43F5E" opacity="0.22" />

      {/* Facial Features */}
      {renderFaceFeatures(expression)}
    </g>
  );
}

function renderFaceFeatures(expression: string) {
  switch (expression) {
    case 'bright':
      return (
        <g>
          <path d="M 43.5 24.5 Q 46 22.5 48.5 24.5" stroke="#1E293B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M 51.5 24.5 Q 54 22.5 56.5 24.5" stroke="#1E293B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M 46 30 Q 50 33.8 54 30" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" fill="#FFFFFF" />
        </g>
      );

    case 'warm':
      return (
        <g>
          <circle cx="46" cy="25" r="1.2" fill="#1E293B" />
          <circle cx="46.4" cy="24.6" r="0.45" fill="#FFFFFF" />
          <circle cx="54" cy="25" r="1.2" fill="#1E293B" />
          <circle cx="54.4" cy="24.6" r="0.45" fill="#FFFFFF" />
          <path d="M 47 29.5 Q 50 32 53 29.5" stroke="#78350F" strokeWidth="1.1" strokeLinecap="round" fill="none" />
        </g>
      );

    case 'down':
      return (
        <g>
          <circle cx="46" cy="25.5" r="1.1" fill="#334155" />
          <circle cx="54" cy="25.5" r="1.1" fill="#334155" />
          <path d="M 44.5 22.5 Q 46.5 23.5 48.5 23" stroke="#475569" strokeWidth="0.8" fill="none" />
          <path d="M 51.5 23 Q 53.5 23.5 55.5 22.5" stroke="#475569" strokeWidth="0.8" fill="none" />
          <path d="M 47.5 30 Q 50 31 52.5 30" stroke="#78350F" strokeWidth="1" strokeLinecap="round" fill="none" />
        </g>
      );

    case 'heavy':
      return (
        <g>
          <path d="M 44 26 Q 46.5 27.5 49 26" stroke="#334155" strokeWidth="1" strokeLinecap="round" fill="none" />
          <path d="M 51 26 Q 53.5 27.5 56 26" stroke="#334155" strokeWidth="1" strokeLinecap="round" fill="none" />
          <path d="M 48 30 Q 50 31 52 30" stroke="#78350F" strokeWidth="0.9" strokeLinecap="round" fill="none" />
        </g>
      );

    case 'even':
    default:
      return (
        <g>
          <circle cx="46" cy="25" r="1.2" fill="#1E293B" />
          <circle cx="46.3" cy="24.7" r="0.4" fill="#FFFFFF" />
          <circle cx="54" cy="25" r="1.2" fill="#1E293B" />
          <circle cx="54.3" cy="24.7" r="0.4" fill="#FFFFFF" />
          <path d="M 47.5 30 Q 50 31.5 52.5 30" stroke="#78350F" strokeWidth="1" strokeLinecap="round" fill="none" />
        </g>
      );
  }
}

// ==========================================
// VOLUPTUOUS, FULL HAIR (NO BALD SPOTS, GENEROUS TOP VOLUME)
// ==========================================
function renderBackHair(uid: string, rawStyle: HairStyle, color: string) {
  const style = normalizeHairStyle(rawStyle);

  switch (style) {
    case 'long_waves':
    case 'long':
      return (
        <g fill={`url(#${uid}-hair)`}>
          {/* Voluminous oceanic mane rising generously above crown (y=7 to 30) */}
          <path d="M 37 24 C 35 8, 65 8, 63 24 C 69 30, 75 42, 76 56 C 77 72, 67 84, 59 90 C 57 82, 64 68, 63 50 C 62 38, 57 30, 52 28 C 47 30, 42 38, 41 50 C 40 68, 47 82, 45 90 C 38 84, 27 72, 28 56 C 29 42, 35 30, 37 24 Z" />
          <path d="M 30 46 C 23 58, 25 74, 31 84 C 33 76, 29 64, 32 52 Z" opacity="0.9" />
          <path d="M 70 46 C 77 58, 75 74, 69 84 C 67 76, 71 64, 68 52 Z" opacity="0.9" />
        </g>
      );

    case 'long_braids':
      return (
        <g fill={`url(#${uid}-hair)`}>
          {/* Full head back rising to y=8 */}
          <path d="M 38 22 C 37 8, 63 8, 62 22 C 67 30, 69 45, 69 62 C 65 75, 59 84, 56 88 C 55 80, 60 68, 59 52 C 58 35, 52 27, 48 35 C 47 52, 52 68, 51 80 C 49 84, 43 75, 39 62 C 38 45, 41 30, 38 22 Z" />
          <line x1="35" y1="36" x2="33" y2="76" stroke={color} strokeWidth="2.5" strokeDasharray="3,1.5" />
          <line x1="65" y1="36" x2="67" y2="76" stroke={color} strokeWidth="2.5" strokeDasharray="3,1.5" />
        </g>
      );

    case 'long_straight':
      return (
        <g fill={`url(#${uid}-hair)`}>
          <path d="M 38 22 C 37 8, 63 8, 62 22 C 68 30, 70 44, 70 65 C 70 78, 64 86, 59 90 C 58 78, 63 62, 61 48 C 59 32, 54 26, 47 32 C 45 48, 49 62, 48 78 C 44 86, 38 78, 38 65 C 38 44, 40 30, 38 22 Z" />
        </g>
      );

    case 'curly_ringlets':
    case 'curly':
      return (
        <g fill={`url(#${uid}-hair)`}>
          {/* Voluminous cloud of curls extending well above the skull (y=7 to 45) */}
          <ellipse cx="50" cy="20" rx="16" ry="14" />
          <circle cx="34" cy="20" r="8" />
          <circle cx="33" cy="32" r="8.5" />
          <circle cx="35" cy="44" r="8" />
          <circle cx="66" cy="20" r="8" />
          <circle cx="67" cy="32" r="8.5" />
          <circle cx="65" cy="44" r="8" />
        </g>
      );

    case 'curly_topknot':
      return (
        <g fill={`url(#${uid}-hair)`}>
          <ellipse cx="50" cy="20" rx="12" ry="10" />
          {/* High warrior bun on top reaching y=6 */}
          <circle cx="50" cy="8" r="6.5" />
          {/* Coral hair pin */}
          <line x1="41" y1="8" x2="59" y2="8" stroke="#FB7185" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="59" cy="8" r="1.5" fill="#FFE4E6" />
        </g>
      );

    case 'curly_afro':
      return (
        <g fill={`url(#${uid}-hair)`}>
          {/* Rich rounded afro crown reaching y=6 */}
          <circle cx="50" cy="18" r="15" />
          <circle cx="38" cy="16" r="9" />
          <circle cx="62" cy="16" r="9" />
          <circle cx="35" cy="25" r="8" />
          <circle cx="65" cy="25" r="8" />
        </g>
      );

    case 'short_surfer':
    case 'short_crop':
    case 'short_fade':
    case 'short':
    default:
      return (
        <g fill={`url(#${uid}-hair)`}>
          {/* Voluminous back silhouette reaching y=8 */}
          <ellipse cx="50" cy="19" rx="12.5" ry="11" />
        </g>
      );
  }
}

function renderFrontHair(uid: string, rawStyle: HairStyle, color: string) {
  const style = normalizeHairStyle(rawStyle);

  switch (style) {
    case 'short_crop':
    case 'short':
      return (
        <g fill={`url(#${uid}-hair)`}>
          {/* Voluminous crown cap rising to y=8 with layered crests */}
          <path d="M 38 23 C 36 8, 64 8, 62 23 C 58 17, 54 16, 50 16 C 45 16, 41 18, 38 23 Z" />
          <path d="M 44 14 C 47 7, 53 7, 56 14 C 53 10, 47 10, 44 14 Z" opacity="0.9" />
          <path d="M 41 23 L 38 29 L 43 27 Z" />
          <path d="M 59 23 L 62 29 L 57 27 Z" />
        </g>
      );

    case 'short_surfer':
      return (
        <g fill={`url(#${uid}-hair)`}>
          {/* Thick, layered windswept surfer crown rising to y=7 */}
          <path d="M 37 23 C 35 7, 65 7, 63 22 C 59 15, 52 14, 48 16 C 43 17, 40 19, 37 23 Z" />
          <path d="M 42 15 C 46 8, 54 8, 58 15 C 53 11, 47 11, 42 15 Z" opacity="0.95" />
          <path d="M 44 17 C 47 22, 54 23, 56 19 C 52 22, 47 21, 44 17 Z" />
          <path d="M 38 22 L 36 29 L 40 27 Z" />
          <path d="M 61 21 L 63 28 L 59 26 Z" />
        </g>
      );

    case 'short_fade':
      return (
        <g fill={`url(#${uid}-hair)`}>
          {/* Modern high textured quiff/fade on top reaching y=7 */}
          <path d="M 40 21 C 41 9, 59 9, 60 21 C 57 16, 53 15, 50 15 C 47 15, 43 16, 40 21 Z" />
          <path d="M 44 13 Q 50 6 56 13 Q 50 9 44 13" fill={`url(#${uid}-hair)`} />
          <path d="M 46 15 Q 50 8 54 15" stroke={`url(#${uid}-hair)`} strokeWidth="3" strokeLinecap="round" />
        </g>
      );

    case 'long_waves':
    case 'long':
      return (
        <g fill={`url(#${uid}-hair)`}>
          {/* Voluminous crown arches rising over cranium to y=7 with lush wave crests */}
          <path d="M 37 24 C 35 7, 65 7, 63 24 C 59 18, 55 16, 50 16 C 45 16, 41 18, 37 24 Z" />
          {/* Dimensional top hair waves building real height and fullness */}
          <path d="M 42 14 C 46 7, 54 7, 58 14 C 54 10, 46 10, 42 14 Z" opacity="0.95" />
          <path d="M 45 11 C 48 6, 52 6, 55 11 Z" opacity="0.85" />
          {/* Flowing side tendrils framing cheeks */}
          <path d="M 40 23 C 43 29, 39 37, 37 42 C 36 38, 38 30, 40 23 Z" />
          <path d="M 60 23 C 57 29, 61 37, 63 42 C 64 38, 62 30, 60 23 Z" />
        </g>
      );

    case 'long_braids':
      return (
        <g fill={`url(#${uid}-hair)`}>
          {/* Full thick crown reaching y=8 */}
          <path d="M 38 23 C 37 8, 63 8, 62 23 C 58 17, 53 16, 50 16 C 46 16, 41 18, 38 23 Z" />
          <path d="M 43 14 C 47 8, 53 8, 57 14 Z" opacity="0.9" />
          {/* Front decorative braids */}
          <path d="M 41 24 L 39 38 L 42 37 Z" />
          <path d="M 59 24 L 61 38 L 58 37 Z" />
          <circle cx="40" cy="35" r="1.3" fill="#FEF08A" />
          <circle cx="60" cy="35" r="1.3" fill="#FEF08A" />
        </g>
      );

    case 'long_straight':
      return (
        <g fill={`url(#${uid}-hair)`}>
          {/* Sleek, full crown arch reaching y=8 */}
          <path d="M 37 23 C 36 8, 64 8, 63 23 C 59 17, 54 16, 50 16 C 46 16, 40 18, 37 23 Z" />
          <path d="M 43 13 C 47 7, 53 7, 57 13 Z" opacity="0.9" />
          <path d="M 40 23 L 38 36 L 41 34 Z" />
          <path d="M 60 23 L 62 36 L 59 34 Z" />
        </g>
      );

    case 'curly_ringlets':
    case 'curly':
      return (
        <g fill={`url(#${uid}-hair)`}>
          {/* High voluminous ringlet cluster spanning y=6 to y=22 */}
          <circle cx="43" cy="11" r="5" />
          <circle cx="50" cy="9" r="5.5" />
          <circle cx="57" cy="11" r="5" />
          <circle cx="43" cy="17" r="4.8" />
          <circle cx="50" cy="15.5" r="5.2" />
          <circle cx="57" cy="17" r="4.8" />
          <circle cx="40" cy="22" r="4.2" />
          <circle cx="60" cy="22" r="4.2" />
        </g>
      );

    case 'curly_topknot':
      return (
        <g fill={`url(#${uid}-hair)`}>
          {/* Full swept crown leading into topknot */}
          <path d="M 39 23 C 38 9, 62 9, 61 23 C 58 17, 53 16, 50 16 C 45 16, 41 18, 39 23 Z" />
          <circle cx="50" cy="11" r="5" />
          <path d="M 41 22 L 39 27 L 42 25 Z" />
          <path d="M 59 22 L 61 27 L 58 25 Z" />
        </g>
      );

    case 'curly_afro':
      return (
        <g fill={`url(#${uid}-hair)`}>
          {/* Grand, luscious afro crown rising to y=6 */}
          <circle cx="42" cy="10" r="6" />
          <circle cx="50" cy="8" r="6.5" />
          <circle cx="58" cy="10" r="6" />
          <circle cx="43" cy="16" r="5.5" />
          <circle cx="50" cy="14.5" r="6" />
          <circle cx="57" cy="16" r="5.5" />
          <circle cx="39" cy="22" r="4.8" />
          <circle cx="61" cy="22" r="4.8" />
        </g>
      );

    default:
      return null;
  }
}

// Helper to normalize legacy style strings
function normalizeHairStyle(style: HairStyle | string): string {
  if (style === 'long') return 'long_waves';
  if (style === 'short') return 'short_crop';
  if (style === 'curly') return 'curly_ringlets';
  return style;
}

// ==========================================
// UPPER BODY BASE LAYER & ACCESSORY TOPS
// ==========================================
function renderTop(uid: string, preset: string, topId?: string, accentColor = '#2DD4BF') {
  // Option: "No top" (Free option for natural sea exploration)
  if (topId === 'no_top') {
    return (
      <path
        d="M 42 63 C 46 65, 54 65, 58 63 L 58 65 C 54 67, 46 67, 42 65 Z"
        fill={accentColor}
        opacity="0.4"
      />
    );
  }

  // Specific equipped top accessories:
  if (topId === 'scalloped_shell_top') {
    return (
      <g>
        <path d="M 43 48 C 41 44, 48 44, 49 48 C 48 51, 42 51, 43 48 Z" fill="#FEF08A" stroke="#F59E0B" strokeWidth="0.6" />
        <path d="M 51 48 C 52 44, 59 44, 57 48 C 58 51, 52 51, 51 48 Z" fill="#FEF08A" stroke="#F59E0B" strokeWidth="0.6" />
        <line x1="49" y1="48" x2="51" y2="48" stroke="#FDE68A" strokeWidth="0.9" />
      </g>
    );
  }

  if (topId === 'coral_shoulder_piece') {
    return (
      <g>
        <path d="M 40 44 C 37 40, 36 38, 40 39 C 42 37, 44 41, 42 44 Z" fill="#FB7185" className="drop-shadow-[0_0_6px_#FDA4AF]" />
        <circle cx="38" cy="39" r="1.3" fill="#FFE4E6" />
        <path d="M 41 45 L 57 53 L 55 55 L 40 47 Z" fill={accentColor} opacity="0.8" />
      </g>
    );
  }

  if (topId === 'sea_silk_sash') {
    return (
      <g>
        <path d="M 40 43 L 58 54 L 56 57 L 39 46 Z" fill="#BAE6FD" opacity="0.9" />
        <circle cx="48" cy="48" r="1.2" fill="#E0F2FE" />
      </g>
    );
  }

  if (topId === 'kelp_armor_vest') {
    return (
      <g>
        <path d="M 41 45 L 43 56 L 57 56 L 59 45 L 54 44 L 50 49 L 46 44 Z" fill="#065F46" stroke="#047857" strokeWidth="0.7" />
        <line x1="50" y1="49" x2="50" y2="56" stroke="#34D399" strokeWidth="0.8" />
      </g>
    );
  }

  if (topId === 'kelp_vest') {
    return (
      <g>
        <path d="M 40 45 L 42 58 L 58 58 L 60 45 L 54 44 L 50 51 L 46 44 Z" fill="#065F46" stroke="#047857" strokeWidth="0.8" />
        <line x1="47" y1="52" x2="53" y2="52" stroke="#FBBF24" strokeWidth="0.8" />
        <line x1="48" y1="55" x2="52" y2="55" stroke="#FBBF24" strokeWidth="0.8" />
      </g>
    );
  }

  if (topId === 'explorer_jacket') {
    return (
      <g>
        <path d="M 39 45 L 41 62 L 59 62 L 61 45 L 55 44 L 50 50 L 45 44 Z" fill="#1E3A8A" stroke="#172554" strokeWidth="0.8" />
        <circle cx="50" cy="53" r="0.8" fill="#FBBF24" />
        <circle cx="50" cy="57" r="0.8" fill="#FBBF24" />
        <circle cx="50" cy="60" r="0.8" fill="#FBBF24" />
        <polygon points="45,44 50,50 47,47" fill="#1D4ED8" />
        <polygon points="55,44 50,50 53,47" fill="#1D4ED8" />
      </g>
    );
  }

  if (topId === 'barnacle_shoulder_piece') {
    return (
      <g>
        {/* Left Shoulder Cluster */}
        <ellipse cx="40" cy="44" rx="2.5" ry="2" fill="#64748B" stroke="#334155" strokeWidth="0.5" />
        <circle cx="40" cy="44" r="0.8" fill="#FBBF24" />
        <ellipse cx="38" cy="46" rx="2" ry="1.6" fill="#475569" stroke="#334155" strokeWidth="0.5" />
        <circle cx="38" cy="46" r="0.6" fill="#FBBF24" />
        <ellipse cx="42" cy="46" rx="1.8" ry="1.4" fill="#64748B" stroke="#334155" strokeWidth="0.5" />
        {/* Across chest rugged rope strap */}
        <path d="M 41 45 L 57 55 L 55 57 L 39 47 Z" fill="#78350F" opacity="0.85" />
      </g>
    );
  }

  if (topId === 'warrior_shoulder_guard') {
    return (
      <g>
        <path d="M 39 42 C 37 38, 44 38, 45 42 L 43 46 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="0.7" />
        <circle cx="42" cy="40" r="1.2" fill="#FBBF24" />
        <path d="M 42 43 L 56 52 L 55 54 L 41 45 Z" fill="#78350F" opacity="0.85" />
      </g>
    );
  }

  if (topId === 'golden_chest_harness') {
    return (
      <g>
        <line x1="42" y1="44" x2="57" y2="54" stroke="#FBBF24" strokeWidth="1.2" />
        <line x1="58" y1="44" x2="43" y2="54" stroke="#FBBF24" strokeWidth="1.2" />
        <circle cx="50" cy="49" r="2.2" fill="#FEF08A" stroke="#D97706" strokeWidth="0.7" />
        <circle cx="50" cy="49" r="0.6" fill="#D97706" />
      </g>
    );
  }

  // DEFAULT BASE ATTIRE BASED ON PRESET:
  if (preset === 'merman') {
    return (
      <g>
        <path d="M 41 43 L 57 53 L 55 55 L 40 45 Z" fill={accentColor} opacity="0.85" />
        <circle cx="48" cy="48" r="1.1" fill="#FFFFFF" opacity="0.9" />
      </g>
    );
  }

  if (preset === 'merfolk') {
    return (
      <g>
        <path d="M 41 44 L 57 53 L 55 55 L 40 46 Z" fill={accentColor} opacity="0.8" />
        <path d="M 58 44 L 43 53 L 44 55 L 59 46 Z" fill="#A78BFA" opacity="0.75" />
        <circle cx="50" cy="48.5" r="1.3" fill="#E0E7FF" />
      </g>
    );
  }

  // Mermaid Default: Modest covered sea-silk wrap
  return (
    <path
      d="M 42 47 C 46 45, 54 45, 58 47 L 58 52 C 54 54, 46 54, 42 52 Z"
      fill={accentColor}
      opacity="0.88"
    />
  );
}

// ==========================================
// ARMS, WRISTS & HAND ACCESSORIES
// ==========================================
function renderArms(uid: string, skinColor: string, isWaving = false, wristId?: string, handId?: string) {
  return (
    <g>
      {/* Left Arm: Connected at shoulder anchor (42, 45.5) */}
      <g
        className={isWaving ? 'avatar-waving-arm' : ''}
        style={{
          transformOrigin: '42px 45.5px',
        }}
      >
        <circle cx="42" cy="45.5" r="2.2" fill={`url(#${uid}-skin)`} />

        <path
          d="M 42 45.5 C 39 52, 38 60, 40 67 C 40.8 69.5, 43 69.5, 43 67 C 42 61, 42.5 53, 44 46 Z"
          fill={`url(#${uid}-skin)`}
        />

        <circle cx="41" cy="68.5" r="1.9" fill={`url(#${uid}-skin)`} />

        {/* Left Wrist Accessories */}
        {wristId === 'pearl_bracelets' && (
          <circle cx="41" cy="65" r="1.3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.3" />
        )}
        {wristId === 'kelp_cuffs' && (
          <rect x="39.5" y="64" width="3" height="2" rx="0.8" fill="#0D9488" />
        )}
        {wristId === 'gold_armbands' && (
          <rect x="39" y="52" width="3" height="2" rx="0.8" fill="#FBBF24" stroke="#D97706" strokeWidth="0.4" />
        )}
        {wristId === 'rope_bracelets' && (
          <rect x="39.5" y="64" width="3" height="2" rx="0.5" fill="#D97706" />
        )}
        {wristId === 'wristbands' && (
          <rect x="39.5" y="63.5" width="3" height="2.5" rx="0.8" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="0.4" />
        )}
        {wristId === 'dive_watch' && (
          <g>
            <rect x="39.5" y="64" width="3" height="2" rx="0.5" fill="#0F172A" />
            <circle cx="41" cy="65" r="1.5" fill="#0F172A" stroke="#67E8F9" strokeWidth="0.6" />
            <circle cx="41" cy="65" r="0.6" fill="#22D3EE" />
          </g>
        )}
        {wristId === 'glowing_shell_cuffs' && (
          <rect x="39" y="63.5" width="3.5" height="2.5" rx="1" fill="#67E8F9" stroke="#E0F2FE" strokeWidth="0.5" className="animate-pulse drop-shadow-[0_0_6px_#22D3EE]" />
        )}
      </g>

      {/* Right Arm: Connected at shoulder anchor (58, 45.5) */}
      <circle cx="58" cy="45.5" r="2.2" fill={`url(#${uid}-skin)`} />
      <path
        d="M 58 45.5 C 61 52, 62 60, 60 67 C 59.2 69.5, 57 69.5, 57 67 C 58 61, 57.5 53, 56 46 Z"
        fill={`url(#${uid}-skin)`}
      />
      <circle cx="59" cy="68.5" r="1.9" fill={`url(#${uid}-skin)`} />

      {/* Right Wrist Accessories */}
      {wristId === 'pearl_bracelets' && (
        <circle cx="59" cy="65" r="1.3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.3" />
      )}
      {wristId === 'kelp_cuffs' && (
        <rect x="57.5" y="64" width="3" height="2" rx="0.8" fill="#0D9488" />
      )}
      {wristId === 'gold_armbands' && (
        <rect x="58" y="52" width="3" height="2" rx="0.8" fill="#FBBF24" stroke="#D97706" strokeWidth="0.4" />
      )}
      {wristId === 'rope_bracelets' && (
        <rect x="57.5" y="64" width="3" height="2" rx="0.5" fill="#D97706" />
      )}
      {wristId === 'wristbands' && (
        <rect x="57.5" y="63.5" width="3" height="2.5" rx="0.8" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="0.4" />
      )}
      {wristId === 'glowing_shell_cuffs' && (
        <rect x="57.5" y="63.5" width="3.5" height="2.5" rx="1" fill="#67E8F9" stroke="#E0F2FE" strokeWidth="0.5" className="animate-pulse drop-shadow-[0_0_6px_#22D3EE]" />
      )}

      {/* Hand Accessories */}
      {handId === 'tiny_trident' && (
        <g transform="translate(63, 56) rotate(-15)">
          <line x1="0" y1="18" x2="0" y2="-6" stroke="#FBBF24" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M -3 -3 L -3 -9 L 0 -6 L 3 -9 L 3 -3 Z" fill="#FBBF24" />
        </g>
      )}
      {handId === 'glowing_lantern' && (
        <g transform="translate(62, 65)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="#78350F" strokeWidth="0.8" />
          <rect x="-3" y="4" width="6" height="8" rx="1.5" fill="#1E293B" stroke="#D97706" strokeWidth="0.6" />
          <circle cx="0" cy="8" r="2.2" fill="#FDE047" className="animate-pulse" />
        </g>
      )}
      {handId === 'conch_shell' && (
        <g transform="translate(61, 67)">
          <ellipse cx="0" cy="0" rx="3.5" ry="2.2" fill="#FDA4AF" stroke="#E11D48" strokeWidth="0.5" />
          <circle cx="-1.5" cy="0" r="1.2" fill="#FFF1F2" />
        </g>
      )}
      {handId === 'fishing_net' && (
        <g transform="translate(62, 64) rotate(10)">
          <ellipse cx="0" cy="0" rx="3" ry="1.5" fill="none" stroke="#78350F" strokeWidth="0.8" />
          <path d="M -2.5 0 Q 0 8 2.5 0" fill="#E2E8F0" fillOpacity="0.3" stroke="#0D9488" strokeWidth="0.6" />
          <circle cx="0" cy="0" r="0.8" fill="#FBBF24" />
        </g>
      )}
      {handId === 'telescope' && (
        <g transform="translate(62, 63) rotate(-22)">
          <rect x="0" y="0" width="10" height="2.8" rx="0.6" fill="#D97706" stroke="#78350F" strokeWidth="0.5" />
          <rect x="7.5" y="-0.5" width="3.5" height="3.8" rx="0.8" fill="#FBBF24" />
          <circle cx="10" cy="1.4" r="1.2" fill="#A5F3FC" />
        </g>
      )}
      {handId === 'treasure_map' && (
        <g transform="translate(61, 64) rotate(14)">
          <rect x="0" y="0" width="7" height="9" rx="1.2" fill="#FEF3C7" stroke="#B45309" strokeWidth="0.5" />
          <path d="M 1.5 2.5 L 5.5 6.5 M 5.5 2.5 L 1.5 6.5" stroke="#DC2626" strokeWidth="0.7" />
          <path d="M 2 8 Q 3.5 7 5 8" stroke="#78350F" strokeWidth="0.5" fill="none" />
        </g>
      )}
      {handId === 'glowing_orb' && (
        <g transform="translate(61, 65)">
          <circle cx="0" cy="0" r="3.4" fill="#67E8F9" className="animate-pulse drop-shadow-[0_0_10px_#22D3EE]" />
          <circle cx="-1" cy="-1" r="1.1" fill="#FFFFFF" />
        </g>
      )}
      {handId === 'small_flag' && (
        <g transform="translate(62, 54)">
          <line x1="0" y1="18" x2="0" y2="-4" stroke="#78350F" strokeWidth="1" strokeLinecap="round" />
          <polygon points="0,-4 8,-1 0,2" fill="#0EA5E9" stroke="#0284C7" strokeWidth="0.4" />
          <path d="M 2,-1 Q 4,-2 6,-1" stroke="#FFFFFF" strokeWidth="0.5" fill="none" />
        </g>
      )}
    </g>
  );
}

// ==========================================
// BACK ACCESSORIES (Rendered Behind Body)
// ==========================================
function renderBackAccessory(backId: string) {
  if (backId === 'dive_tank') {
    return (
      <g>
        {/* Scuba Air Cylinder */}
        <rect x="45.5" y="44" width="9" height="23" rx="4.5" fill="#0284C7" stroke="#38BDF8" strokeWidth="0.8" />
        {/* Valve & Regulator at top */}
        <rect x="48.5" y="41" width="3" height="3" rx="1" fill="#E2E8F0" />
        <circle cx="50" cy="40.5" r="1.2" fill="#FBBF24" />
        {/* Harness Straps */}
        <path d="M 42 45 L 45.5 48 M 58 45 L 54.5 48" stroke="#0F172A" strokeWidth="1.2" />
        {/* Tiny playful rising bubbles */}
        <g className="animate-bubble">
          <circle cx="53" cy="38" r="1.2" fill="#E0F2FE" opacity="0.8" />
          <circle cx="54.5" cy="33" r="0.8" fill="#E0F2FE" opacity="0.6" />
          <circle cx="52.5" cy="28" r="1.0" fill="#E0F2FE" opacity="0.7" />
        </g>
      </g>
    );
  }

  if (backId === 'small_backpack') {
    return (
      <g>
        {/* Sturdy explorer rucksack */}
        <rect x="44" y="45" width="12" height="15" rx="3.5" fill="#92400E" stroke="#78350F" strokeWidth="0.8" />
        <path d="M 44 49 C 48 53, 52 53, 56 49" fill="#B45309" />
        <rect x="49" y="50" width="2" height="2.5" rx="0.5" fill="#FBBF24" />
      </g>
    );
  }

  if (backId === 'kelp_cape') {
    return (
      <g>
        {/* Majestic flowing kelp cloak billowing behind shoulders */}
        <path
          d="M 41 45 C 33 56, 30 75, 34 92 C 40 78, 47 85, 50 68 C 53 85, 60 78, 66 92 C 70 75, 67 56, 59 45 Z"
          fill="#065F46"
          opacity="0.85"
        />
        <path
          d="M 43 48 C 38 62, 36 80, 40 90 C 45 78, 48 70, 50 58 C 52 70, 55 78, 60 90 C 64 80, 62 62, 57 48 Z"
          fill="#047857"
          opacity="0.75"
        />
      </g>
    );
  }

  return null;
}

// ==========================================
// COMPANION (Floating Beside Avatar)
// ==========================================
function renderCompanion(companionId: string) {
  if (companionId === 'baby_crab') {
    return (
      <g className="animate-companion-bob">
        {/* Cute Baby Crab floating alongside around x=84, y=53 */}
        {/* Legs */}
        <path d="M 78 54 Q 75 58 78 61 M 80 55 Q 78 60 81 62" stroke="#DC2626" strokeWidth="0.7" fill="none" />
        <path d="M 88 54 Q 91 58 88 61 M 86 55 Q 88 60 85 62" stroke="#DC2626" strokeWidth="0.7" fill="none" />
        {/* Body */}
        <ellipse cx="83" cy="53" rx="5.5" ry="4" fill="#EF4444" stroke="#DC2626" strokeWidth="0.5" />
        {/* Eye Stalks */}
        <line x1="81" y1="50" x2="80" y2="47" stroke="#DC2626" strokeWidth="0.9" />
        <circle cx="80" cy="47" r="1.4" fill="#FFFFFF" />
        <circle cx="80" cy="47" r="0.6" fill="#0F172A" />
        <line x1="85" y1="50" x2="86" y2="47" stroke="#DC2626" strokeWidth="0.9" />
        <circle cx="86" cy="47" r="1.4" fill="#FFFFFF" />
        <circle cx="86" cy="47" r="0.6" fill="#0F172A" />
        {/* Tiny Waving Claws */}
        <path d="M 77 52 Q 74 48 76 45 Q 78 48 77 52" fill="#F87171" stroke="#DC2626" strokeWidth="0.4" />
        <path d="M 89 52 Q 92 48 90 45 Q 88 48 89 52" fill="#F87171" stroke="#DC2626" strokeWidth="0.4" />
        {/* Smile */}
        <path d="M 81.5 54 Q 83 55.5 84.5 54" stroke="#7F1D1D" strokeWidth="0.6" fill="none" />
        {/* Little bubble */}
        <circle cx="87" cy="43" r="0.8" fill="#BAE6FD" opacity="0.7" />
      </g>
    );
  }

  if (companionId === 'tiny_seahorse') {
    return (
      <g className="animate-companion-bob">
        {/* Adorable Baby Seahorse */}
        {/* Curved Tail */}
        <path
          d="M 82 45 C 84 43, 87 45, 86 48 C 85 50, 87 53, 85 57 C 83 61, 80 62, 81 64 C 82 65, 83 63, 83 62"
          stroke="#2DD4BF"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Head */}
        <circle cx="85" cy="45" r="2.4" fill="#2DD4BF" />
        {/* Snout */}
        <path d="M 83 45.5 L 80.5 46.5" stroke="#2DD4BF" strokeWidth="1.2" strokeLinecap="round" />
        {/* Eye */}
        <circle cx="84.5" cy="44.5" r="0.6" fill="#0F172A" />
        {/* Back Fin */}
        <path d="M 87 50 Q 89 51 87 53" fill="#5EEAD4" />
        {/* Crown */}
        <polygon points="85,42.5 86.5,41 87,43" fill="#FDE047" />
      </g>
    );
  }

  if (companionId === 'glowing_jelly') {
    return (
      <g className="animate-companion-bob">
        {/* Translucent Glowing Jelly */}
        <ellipse cx="83" cy="48" rx="6" ry="4.5" fill="#A5F3FC" fillOpacity="0.85" className="animate-pulse drop-shadow-[0_0_8px_#22D3EE]" />
        <circle cx="81" cy="48" r="0.8" fill="#FFFFFF" />
        <circle cx="85" cy="48" r="0.8" fill="#FFFFFF" />
        <circle cx="83" cy="46" r="0.9" fill="#FDE047" />
        <path
          d="M 79 52 Q 78 57 80 62 M 81.5 52.5 Q 82 58 81 63 M 84.5 52.5 Q 85 58 84 63 M 87 52 Q 88 57 86 62"
          stroke="#67E8F9"
          strokeWidth="0.8"
          fill="none"
          opacity="0.8"
        />
      </g>
    );
  }

  if (companionId === 'pufferfish') {
    return (
      <g className="animate-companion-bob">
        {/* Cute Smiling Pufferfish */}
        <circle cx="83" cy="51" r="5.5" fill="#FDE047" stroke="#F59E0B" strokeWidth="0.5" />
        <path d="M 78 51 Q 83 57 88 51 Z" fill="#FEF08A" />
        <circle cx="80.5" cy="49" r="1.4" fill="#FFFFFF" />
        <circle cx="80.3" cy="49" r="0.7" fill="#0F172A" />
        {/* Spines */}
        <circle cx="83" cy="45.5" r="0.6" fill="#D97706" />
        <circle cx="86" cy="47" r="0.6" fill="#D97706" />
        <circle cx="87" cy="51" r="0.6" fill="#D97706" />
        <circle cx="86" cy="54" r="0.6" fill="#D97706" />
        {/* Tail & Smile */}
        <polygon points="88.5,51 92,48 91,51 92,54" fill="#FCD34D" />
        <path d="M 78 51 Q 79 52.5 80 51" stroke="#92400E" strokeWidth="0.6" fill="none" />
      </g>
    );
  }

  return null;
}

// ==========================================
// ACCESSORY HELPERS (HEAD & NECK)
// ==========================================
function renderHeadAccessory(headId: string) {
  if (headId === 'flower_crown') {
    return (
      <g>
        <circle cx="44" cy="18" r="2.2" fill="#FB7185" />
        <circle cx="50" cy="16.5" r="2.5" fill="#F43F5E" />
        <circle cx="56" cy="18" r="2.2" fill="#FDA4AF" />
        <circle cx="47" cy="17" r="1.8" fill="#FCD34D" />
        <circle cx="53" cy="17" r="1.8" fill="#FCD34D" />
      </g>
    );
  }

  if (headId === 'pearl_tiara') {
    return (
      <g>
        <path d="M 44 19 L 47 15 L 50 13 L 53 15 L 56 19 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.6" />
        <circle cx="50" cy="12.5" r="1.6" fill="#F8FAFC" className="drop-shadow-sm" />
      </g>
    );
  }

  if (headId === 'sea_glass_headband') {
    return (
      <g>
        <path d="M 42 19 Q 50 16 58 19" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.9" />
        <circle cx="50" cy="16.5" r="1.3" fill="#A5F3FC" />
      </g>
    );
  }

  if (headId === 'seaweed_laurel') {
    return (
      <g stroke="#0D9488" strokeWidth="1.1" fill="none">
        <path d="M 42 20 Q 46 16 50 17" />
        <path d="M 50 17 Q 54 16 58 20" />
      </g>
    );
  }

  if (headId === 'captains_hat') {
    return (
      <g>
        <path d="M 40 18 Q 50 14 60 18 L 59 13 Q 50 10 41 13 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.5" />
        <path d="M 39 18 Q 50 20 61 18 L 60 20 Q 50 22 40 20 Z" fill="#0F172A" />
        <rect x="41" y="16.5" width="18" height="2" fill="#0F172A" />
        <circle cx="50" cy="15" r="1.5" fill="#FBBF24" />
        <path d="M 48.5 15.5 Q 50 17 51.5 15.5" stroke="#FBBF24" strokeWidth="0.6" fill="none" />
      </g>
    );
  }

  if (headId === 'sea_glass_goggles') {
    return (
      <g>
        <circle cx="45" cy="18" r="2.8" fill="#2DD4BF" fillOpacity="0.8" stroke="#D97706" strokeWidth="0.8" />
        <circle cx="55" cy="18" r="2.8" fill="#2DD4BF" fillOpacity="0.8" stroke="#D97706" strokeWidth="0.8" />
        <line x1="47.8" y1="18" x2="52.2" y2="18" stroke="#D97706" strokeWidth="0.9" />
        <path d="M 39 19 L 42.2 18 M 57.8 18 L 61 19" stroke="#78350F" strokeWidth="1.1" />
      </g>
    );
  }

  if (headId === 'kelp_headband') {
    return (
      <g>
        <path d="M 40 19 Q 50 15 60 19" stroke="#047857" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <ellipse cx="44" cy="16.5" rx="1.8" ry="1.1" fill="#10B981" transform="rotate(-20, 44, 16.5)" />
      </g>
    );
  }

  if (headId === 'coral_horns') {
    return (
      <g>
        <path d="M 43 16 Q 41 10 39 6 Q 41 8 43 11 Q 45 7 47 9 Q 44 13 44 16" fill="#FB7185" />
        <path d="M 57 16 Q 59 10 61 6 Q 59 8 57 11 Q 55 7 53 9 Q 56 13 56 16" fill="#FB7185" />
      </g>
    );
  }

  if (headId === 'bandana') {
    return (
      <g>
        <path d="M 39 19 Q 50 16 61 19 L 60 22 Q 50 19 40 22 Z" fill="#DC2626" />
        <circle cx="39" cy="21" r="1.5" fill="#B91C1C" />
        <path d="M 38 22 L 36 26 M 39 22 L 38 27" stroke="#DC2626" strokeWidth="1.1" strokeLinecap="round" />
      </g>
    );
  }

  if (headId === 'jellyfish_hat') {
    return (
      <g>
        <path
          d="M 39 18 C 38 9, 62 9, 61 18 Q 50 20 39 18 Z"
          fill="#67E8F9"
          fillOpacity="0.85"
          stroke="#22D3EE"
          strokeWidth="0.6"
          className="animate-pulse drop-shadow-[0_0_8px_#22D3EE]"
        />
        <path d="M 42 19 Q 40 25 42 29 M 58 19 Q 60 25 58 29" stroke="#A5F3FC" strokeWidth="0.7" fill="none" />
      </g>
    );
  }

  return null;
}

function renderNeckAccessory(neckId: string) {
  if (neckId === 'pearl_necklace') {
    return (
      <g fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.3">
        <circle cx="47" cy="40" r="1.1" />
        <circle cx="48.5" cy="41.2" r="1.2" />
        <circle cx="50" cy="41.8" r="1.3" />
        <circle cx="51.5" cy="41.2" r="1.2" />
        <circle cx="53" cy="40" r="1.1" />
      </g>
    );
  }

  if (neckId === 'shell_pendant') {
    return (
      <g>
        <path d="M 47 38 Q 50 42 53 38" stroke="#D97706" strokeWidth="0.6" fill="none" />
        <path d="M 49 42 L 51 42 L 50 44 Z" fill="#FDE68A" stroke="#D97706" strokeWidth="0.4" />
      </g>
    );
  }

  if (neckId === 'moonstone_choker') {
    return (
      <g>
        <path d="M 46 38 Q 50 40 54 38" stroke="#1E293B" strokeWidth="1.2" fill="none" />
        <circle cx="50" cy="39.2" r="1.6" fill="#67E8F9" className="drop-shadow-[0_0_6px_#22D3EE]" />
      </g>
    );
  }

  if (neckId === 'seaweed_scarf') {
    return (
      <g>
        <path d="M 45 37 Q 50 43 55 37 L 56 40 Q 50 46 44 40 Z" fill="#047857" opacity="0.9" />
        <path d="M 46 40 Q 45 48 44 54 M 48 40 Q 48 50 47 56" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </g>
    );
  }

  if (neckId === 'shark_tooth_cord') {
    return (
      <g>
        <path d="M 46 38 Q 50 42 54 38" stroke="#1E293B" strokeWidth="0.8" fill="none" />
        <polygon points="50,45 48,41 52,41" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="0.4" />
      </g>
    );
  }

  if (neckId === 'compass_pendant') {
    return (
      <g>
        <path d="M 46 38 Q 50 43 54 38" stroke="#F59E0B" strokeWidth="0.7" fill="none" />
        <circle cx="50" cy="44" r="2.2" fill="#FEF08A" stroke="#D97706" strokeWidth="0.6" />
        <polygon points="50,42.5 50.8,44 50,45.5 49.2,44" fill="#DC2626" />
      </g>
    );
  }

  if (neckId === 'bead_strand') {
    return (
      <g fill="#FDE68A" stroke="#B45309" strokeWidth="0.3">
        <circle cx="46" cy="39.5" r="1" fill="#93C5FD" />
        <circle cx="48" cy="41" r="1.1" fill="#FDE68A" />
        <circle cx="50" cy="41.5" r="1.2" fill="#FDA4AF" />
        <circle cx="52" cy="41" r="1.1" fill="#FDE68A" />
        <circle cx="54" cy="39.5" r="1" fill="#93C5FD" />
      </g>
    );
  }

  return null;
}

// ==========================================
// COLOR MATH HELPERS
// ==========================================
function darkenHex(hex: string, factor: number): string {
  try {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    let r = Math.floor(((num >> 16) & 255) * factor);
    let g = Math.floor(((num >> 8) & 255) * factor);
    let b = Math.floor((num & 255) * factor);
    return `rgb(${Math.max(0, r)}, ${Math.max(0, g)}, ${Math.max(0, b)})`;
  } catch {
    return hex;
  }
}

function lightenHex(hex: string, factor: number): string {
  try {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    let r = Math.min(255, Math.floor(((num >> 16) & 255) * factor));
    let g = Math.min(255, Math.floor(((num >> 8) & 255) * factor));
    let b = Math.min(255, Math.floor((num & 255) * factor));
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return hex;
  }
}
