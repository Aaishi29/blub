export type DepthZone = 'sunlight' | 'twilight' | 'midnight' | 'abyss' | 'trench';

export interface CreatureInfo {
  id: string;
  name: string;
  species: string;
  zone: DepthZone;
  minDepth: number;
  maxDepth: number;
  funFact: string;
  pattern: string;
  accentColor: string;
}

export interface DiveLog {
  id: string;
  timestamp: number;
  dateStr: string;
  dayOfWeek: string;
  text: string;
  sliderMood?: number; // 1 to 5 (Heavy=1, Down=2, Even=3, Warm=4, Bright=5)
  source?: 'text' | 'mood';
  score: number; // -1 to 1
  depth: number; // in meters (0 - 140)
  zone: DepthZone;
  creatureId: string;
  themes: string[];
  summary: string;
  gentleNote?: string;
  points: number;
  multiplier: number;
  needs_support?: boolean;
}

export interface FloatingCreatureInstance {
  instanceId: string;
  creatureId: string;
  x: number; // percentage in viewport
  y: number; // percentage in viewport
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  scale: number;
  layer: number; // 0 (far/deep) to 1 (near/front)
  facing: 1 | -1;
  rotation: number; // tilt angle in degrees (-15 to +15)
  speed: number;
  lingerFrames: number;
  swimCycle: number;
  speechBubble?: string;
  bubbleTimeout?: any;
  isWiggling?: boolean;
}

export interface AudioSettings {
  ambientMuted: boolean;
  narratorEnabled?: boolean;
  musicEnabled: boolean;
}

// Avatar Customization & Presets
export type AvatarPreset = 'mermaid' | 'merman' | 'merfolk';
export type HairStyle =
  | 'long'
  | 'short'
  | 'curly'
  | 'long_waves'
  | 'long_braids'
  | 'long_straight'
  | 'short_crop'
  | 'short_surfer'
  | 'short_fade'
  | 'curly_ringlets'
  | 'curly_topknot'
  | 'curly_afro';
export type TailPattern = 'teal' | 'coral' | 'violet' | 'gold' | 'gradient' | 'spotted';

export interface AvatarLook {
  preset: AvatarPreset;
  skinTone: string; // Hex color
  hairStyle: HairStyle;
  hairColor: string; // Hex color
  tailPattern: TailPattern;
  name: string;
}

// Wardrobe Slots & Accessories
export type AccessorySlot =
  | 'head'
  | 'neck'
  | 'top'
  | 'wrists'
  | 'tail'
  | 'hand'
  | 'back'
  | 'companion';

export type AccessoryTheme = 'explorer' | 'pirate' | 'glow' | 'cozy';

export interface AccessoryItem {
  id: string;
  name: string;
  slot: AccessorySlot;
  price: number; // in sand dollars (0 for free)
  description: string;
  themes?: AccessoryTheme[];
}

export type EquippedAccessories = Partial<Record<AccessorySlot, string>>;

