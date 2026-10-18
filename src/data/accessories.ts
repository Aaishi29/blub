import { AccessoryItem, AvatarLook, EquippedAccessories } from '../types';

export const SKIN_TONES = [
  { id: 'espresso', label: 'Espresso', color: '#45281E' },
  { id: 'chestnut', label: 'Chestnut', color: '#6B4226' },
  { id: 'caramel', label: 'Caramel', color: '#9E6B43' },
  { id: 'bronze', label: 'Bronze', color: '#C68B59' },
  { id: 'golden', label: 'Warm Golden', color: '#DE9E74' },
  { id: 'sand', label: 'Soft Sand', color: '#E9B998' },
  { id: 'peach', label: 'Fair Peach', color: '#F7D2BA' },
  { id: 'pearl', label: 'Moon Pearl', color: '#FDF0E6' },
];

export const HAIR_STYLES = [
  // Short / Masculine / Tapered
  { id: 'short_crop', label: 'Sleek Crop', category: 'short', description: 'Clean, tapered underwater cut' },
  { id: 'short_surfer', label: 'Surfer Waves', category: 'short', description: 'Windswept, textured ocean locks' },
  { id: 'short_fade', label: 'Reef Fade', category: 'short', description: 'Sharp, modern reef fade with textured crown' },

  // Long / Flowing
  { id: 'long_waves', label: 'Flowing Waves', category: 'long', description: 'Voluminous oceanic mane drifting with current' },
  { id: 'long_braids', label: 'Warrior Braids', category: 'long', description: 'Intricate deep-reef braids with shell beads' },
  { id: 'long_straight', label: 'Silk Tresses', category: 'long', description: 'Smooth, sleek locks cascading down' },

  // Curly / Textured
  { id: 'curly_ringlets', label: 'Bouncy Curls', category: 'curly', description: 'Voluminous, playful sea-foam ringlets' },
  { id: 'curly_topknot', label: 'Ocean Topknot', category: 'curly', description: 'High warrior bun fastened with a coral pin' },
  { id: 'curly_afro', label: 'Reef Coils', category: 'curly', description: 'Full crowned coils radiating natural beauty' },
] as const;

export const HAIR_COLORS = [
  { id: 'midnight', label: 'Midnight', color: '#1E293B' },
  { id: 'ocean_blue', label: 'Ocean Blue', color: '#0284C7' },
  { id: 'seafoam', label: 'Seafoam Teal', color: '#2DD4BF' },
  { id: 'coral', label: 'Coral Pink', color: '#FB7185' },
  { id: 'silver', label: 'Moon Silver', color: '#E2E8F0' },
  { id: 'sunbeam', label: 'Sunbeam Gold', color: '#FBBF24' },
  { id: 'amber', label: 'Warm Amber', color: '#D97706' },
  { id: 'violet', label: 'Amethyst', color: '#8B5CF6' },
];

export const TAIL_PATTERNS = [
  { id: 'teal', label: 'Aquamarine', primary: '#0D9488', secondary: '#2DD4BF' },
  { id: 'coral', label: 'Sunset Coral', primary: '#BE123C', secondary: '#FB7185' },
  { id: 'violet', label: 'Twilight Violet', primary: '#6D28D9', secondary: '#A78BFA' },
  { id: 'gold', label: 'Sunlit Gold', primary: '#D97706', secondary: '#FCD34D' },
  { id: 'gradient', label: 'Iridescent', primary: '#0284C7', secondary: '#F43F5E' },
  { id: 'spotted', label: 'Whale Shark', primary: '#1E293B', secondary: '#67E8F9' },
] as const;

export const DEFAULT_MERMAID_PRESET: AvatarLook = {
  preset: 'mermaid',
  skinTone: '#DE9E74',
  hairStyle: 'long_waves',
  hairColor: '#2DD4BF',
  tailPattern: 'teal',
  name: 'Marina',
};

export const DEFAULT_MERMAN_PRESET: AvatarLook = {
  preset: 'merman',
  skinTone: '#9E6B43',
  hairStyle: 'short_surfer',
  hairColor: '#0284C7',
  tailPattern: 'gold',
  name: 'Kai',
};

export const DEFAULT_MERFOLK_PRESET: AvatarLook = {
  preset: 'merfolk',
  skinTone: '#E9B998',
  hairStyle: 'curly_topknot',
  hairColor: '#8B5CF6',
  tailPattern: 'gradient',
  name: 'Sari',
};

// Full Wardrobe Catalog
export const ACCESSORY_CATALOG: AccessoryItem[] = [
  // --- HEAD ---
  {
    id: 'flower_crown',
    name: 'Flower Crown',
    slot: 'head',
    price: 25,
    description: 'Woven tropical reef blossoms with sweet sea scents.',
    themes: ['cozy'],
  },
  {
    id: 'pearl_tiara',
    name: 'Pearl Tiara',
    slot: 'head',
    price: 40,
    description: 'A shimmering diadem crafted from oyster pearls.',
    themes: ['glow'],
  },
  {
    id: 'sea_glass_headband',
    name: 'Sea-Glass Headband',
    slot: 'head',
    price: 20,
    description: 'Smooth frosted aqua glass found in sunlit shallows.',
    themes: ['explorer'],
  },
  {
    id: 'seaweed_laurel',
    name: 'Seaweed Laurel',
    slot: 'head',
    price: 30,
    description: 'Crisp emerald kelp fronds honoring the open sea.',
    themes: ['cozy'],
  },
  {
    id: 'captains_hat',
    name: "Captain's Hat",
    slot: 'head',
    price: 30,
    description: 'A proud nautical cap embroidered with a golden wave anchor.',
    themes: ['explorer', 'pirate'],
  },
  {
    id: 'sea_glass_goggles',
    name: 'Sea-Glass Goggles',
    slot: 'head',
    price: 25,
    description: 'Brass-rimmed explorer goggles fitted with clear sea-glass lenses.',
    themes: ['explorer'],
  },
  {
    id: 'kelp_headband',
    name: 'Kelp Headband',
    slot: 'head',
    price: 15,
    description: 'Soft braided kelp ribbon that keeps drifting locks in place.',
    themes: ['cozy'],
  },
  {
    id: 'coral_horns',
    name: 'Coral Horns',
    slot: 'head',
    price: 35,
    description: 'Stunning branching pink coral coronets that catch bioluminescent rays.',
    themes: ['glow'],
  },
  {
    id: 'bandana',
    name: 'Bandana',
    slot: 'head',
    price: 15,
    description: 'A weathered sea-spun cotton bandana tied at the temple.',
    themes: ['pirate'],
  },
  {
    id: 'jellyfish_hat',
    name: 'Jellyfish Hat',
    slot: 'head',
    price: 40,
    description: 'A translucent, softly glowing bell cap with gentle floating tendrils.',
    themes: ['glow'],
  },

  // --- NECK ---
  {
    id: 'pearl_necklace',
    name: 'Pearl Necklace',
    slot: 'neck',
    price: 25,
    description: 'A delicate string of lustrous iridescent ocean pearls.',
    themes: ['cozy'],
  },
  {
    id: 'shell_pendant',
    name: 'Shell Pendant',
    slot: 'neck',
    price: 20,
    description: 'A spiral nautilus shell holding the roar of the surf.',
    themes: ['explorer', 'cozy'],
  },
  {
    id: 'moonstone_choker',
    name: 'Moonstone Choker',
    slot: 'neck',
    price: 45,
    description: 'A deep-sea luminescent jewel pulsing with calm blue light.',
    themes: ['glow'],
  },
  {
    id: 'seaweed_scarf',
    name: 'Seaweed Scarf',
    slot: 'neck',
    price: 20,
    description: 'Silky ribbons of sea-lettuce and emerald kelp draped loosely.',
    themes: ['cozy'],
  },
  {
    id: 'shark_tooth_cord',
    name: 'Shark-Tooth Cord',
    slot: 'neck',
    price: 25,
    description: 'A fossilized mako tooth strung on braided hemp line.',
    themes: ['pirate'],
  },
  {
    id: 'compass_pendant',
    name: 'Compass Pendant',
    slot: 'neck',
    price: 30,
    description: 'An antique brass pocket compass that always points to safe currents.',
    themes: ['explorer'],
  },
  {
    id: 'bead_strand',
    name: 'Bead Strand',
    slot: 'neck',
    price: 15,
    description: 'Smooth polished driftwood and shell beads in calm ocean hues.',
    themes: ['cozy'],
  },

  // --- TOP ---
  {
    id: 'no_top',
    name: 'No Top',
    slot: 'top',
    price: 0,
    description: 'Natural ocean freedom with a modest sea-silk wrap base.',
    themes: ['cozy'],
  },
  {
    id: 'scalloped_shell_top',
    name: 'Scalloped Shell Top',
    slot: 'top',
    price: 30,
    description: 'Twin polished scallop shells with pearl-string ties.',
    themes: ['cozy'],
  },
  {
    id: 'coral_shoulder_piece',
    name: 'Coral Shoulder Piece',
    slot: 'top',
    price: 35,
    description: 'Branching rose coral sculpted to rest across your shoulder.',
    themes: ['cozy'],
  },
  {
    id: 'sea_silk_sash',
    name: 'Sea-Silk Sash',
    slot: 'top',
    price: 25,
    description: 'Gossamer woven sea-silk that drapes across the chest and shoulders.',
    themes: ['cozy'],
  },
  {
    id: 'kelp_armor_vest',
    name: 'Kelp Armor Vest',
    slot: 'top',
    price: 35,
    description: 'Tough woven deep-sea kelp vest tailored for oceanic explorers.',
    themes: ['explorer'],
  },
  {
    id: 'warrior_shoulder_guard',
    name: 'Warrior Shoulder Guard',
    slot: 'top',
    price: 30,
    description: 'Athletic mother-of-pearl shoulder pauldron with golden dorsal studs.',
    themes: ['explorer'],
  },
  {
    id: 'golden_chest_harness',
    name: 'Golden Sand-Dollar Harness',
    slot: 'top',
    price: 40,
    description: 'Cross-chest braided gold harness studded with sand dollar emblems.',
    themes: ['explorer'],
  },
  {
    id: 'kelp_vest',
    name: 'Kelp Vest',
    slot: 'top',
    price: 30,
    description: 'A cozy woven kelp sleeveless vest laced with seagrass cords.',
    themes: ['cozy', 'explorer'],
  },
  {
    id: 'explorer_jacket',
    name: 'Explorer Jacket',
    slot: 'top',
    price: 40,
    description: 'Durable waterproof trench coat with brass sea-buttons and pockets.',
    themes: ['explorer'],
  },
  {
    id: 'barnacle_shoulder_piece',
    name: 'Barnacle Shoulder Piece',
    slot: 'top',
    price: 35,
    description: 'Natural cluster of weathered volcanic barnacles forming an ornate guard.',
    themes: ['pirate'],
  },

  // --- WRISTS ---
  {
    id: 'pearl_bracelets',
    name: 'Pearl Bracelets',
    slot: 'wrists',
    price: 20,
    description: 'Matching pearlescent bangles that chime softly under water.',
    themes: ['cozy'],
  },
  {
    id: 'kelp_cuffs',
    name: 'Kelp Cuffs',
    slot: 'wrists',
    price: 15,
    description: 'Twisted deep-green kelp strands bound with gold thread.',
    themes: ['cozy'],
  },
  {
    id: 'gold_armbands',
    name: 'Gold Armbands',
    slot: 'wrists',
    price: 35,
    description: 'Polished sand-dollar medallions set into pure sun-gold cuffs.',
    themes: ['explorer'],
  },
  {
    id: 'rope_bracelets',
    name: 'Rope Bracelets',
    slot: 'wrists',
    price: 15,
    description: 'Authentic sailor knots tied from durable ocean-faring hemp.',
    themes: ['pirate', 'cozy'],
  },
  {
    id: 'wristbands',
    name: 'Wristbands',
    slot: 'wrists',
    price: 15,
    description: 'Athletic terry cloth sea-bands that keep grips sure in strong currents.',
    themes: ['explorer'],
  },
  {
    id: 'dive_watch',
    name: 'Dive Watch',
    slot: 'wrists',
    price: 30,
    description: 'Waterproof depth chronograph with a luminescent rotating bezel.',
    themes: ['explorer'],
  },
  {
    id: 'glowing_shell_cuffs',
    name: 'Glowing Shell Cuffs',
    slot: 'wrists',
    price: 35,
    description: 'Translucent clam-shell cuffs that cast gentle aquamarine light.',
    themes: ['glow'],
  },

  // --- TAIL ---
  {
    id: 'shimmering_scales',
    name: 'Shimmering Scale Overlay',
    slot: 'tail',
    price: 40,
    description: 'Prismatic crystal scales that reflect every passing light ray.',
    themes: ['glow'],
  },
  {
    id: 'glowing_fin_tips',
    name: 'Glowing Fin Tips',
    slot: 'tail',
    price: 45,
    description: 'Gentle bioluminescent photophores tracing your fluke edges.',
    themes: ['glow'],
  },
  {
    id: 'starfish_tail_charm',
    name: 'Starfish Tail Charm',
    slot: 'tail',
    price: 25,
    description: 'A tiny golden sea-star fastened with a ribbon of seagrass.',
    themes: ['cozy'],
  },
  {
    id: 'striped_pattern',
    name: 'Striped Pattern',
    slot: 'tail',
    price: 30,
    description: 'Playful horizontal clownfish bars running down the tail.',
    themes: ['cozy'],
  },
  {
    id: 'glowing_spots',
    name: 'Glowing Spots',
    slot: 'tail',
    price: 40,
    description: 'Constellations of cyan bioluminescent dots that glow in the deep.',
    themes: ['glow'],
  },
  {
    id: 'torn_edge_fins',
    name: 'Torn-Edge Fins',
    slot: 'tail',
    price: 30,
    description: 'Rugged frayed fluke tips marked by adventures with oceanic currents.',
    themes: ['pirate'],
  },

  // --- HAND ---
  {
    id: 'tiny_trident',
    name: 'Tiny Trident',
    slot: 'hand',
    price: 40,
    description: 'A modest miniature trident etched with coral runes.',
    themes: ['explorer'],
  },
  {
    id: 'glowing_lantern',
    name: 'Glowing Lantern',
    slot: 'hand',
    price: 35,
    description: 'A cozy brass cage holding a calm plankton starlight spark.',
    themes: ['glow', 'explorer'],
  },
  {
    id: 'conch_shell',
    name: 'Conch Shell',
    slot: 'hand',
    price: 20,
    description: 'A smooth spiral horn that hums with oceanic melodies.',
    themes: ['cozy'],
  },
  {
    id: 'fishing_net',
    name: 'Fishing Net',
    slot: 'hand',
    price: 25,
    description: 'A compact hand net woven from seaweed fiber with cork floats.',
    themes: ['explorer', 'pirate'],
  },
  {
    id: 'telescope',
    name: 'Telescope',
    slot: 'hand',
    price: 30,
    description: 'A collapsible brass spyglass for spotting surface ships and distant reefs.',
    themes: ['explorer', 'pirate'],
  },
  {
    id: 'treasure_map',
    name: 'Treasure Map',
    slot: 'hand',
    price: 20,
    description: 'Waterproof parchment marked with trench secrets and secret caves.',
    themes: ['explorer', 'pirate'],
  },
  {
    id: 'glowing_orb',
    name: 'Glowing Orb',
    slot: 'hand',
    price: 40,
    description: 'A sphere of pure condensed bioluminescence cradled in your hand.',
    themes: ['glow'],
  },
  {
    id: 'small_flag',
    name: 'Small Flag',
    slot: 'hand',
    price: 15,
    description: 'A cheerful flutter flag bearing the friendly Blub wave crest.',
    themes: ['pirate'],
  },

  // --- BACK ---
  {
    id: 'dive_tank',
    name: 'Dive Tank',
    slot: 'back',
    price: 40,
    description: 'A polished explorer scuba cylinder releasing tiny playful rising bubbles.',
    themes: ['explorer'],
  },
  {
    id: 'small_backpack',
    name: 'Small Backpack',
    slot: 'back',
    price: 25,
    description: 'A sturdy sea-leather rucksack carrying notes, shells, and travel gear.',
    themes: ['explorer', 'cozy'],
  },
  {
    id: 'kelp_cape',
    name: 'Kelp Cape',
    slot: 'back',
    price: 35,
    description: 'A majestic emerald kelp cloak billowing gracefully behind you.',
    themes: ['cozy'],
  },

  // --- COMPANION ---
  {
    id: 'baby_crab',
    name: 'Baby Crab',
    slot: 'companion',
    price: 50,
    description: 'A tiny cheerful red crab scuttling and floating gently by your side.',
    themes: ['cozy', 'pirate'],
  },
  {
    id: 'tiny_seahorse',
    name: 'Tiny Seahorse',
    slot: 'companion',
    price: 50,
    description: 'A gentle pastel seahorse with fluttering dorsal fins floating close by.',
    themes: ['explorer', 'cozy'],
  },
  {
    id: 'glowing_jelly',
    name: 'Glowing Jelly',
    slot: 'companion',
    price: 60,
    description: 'A miniature moon jellyfish pulsing with soft warm starlight.',
    themes: ['glow'],
  },
  {
    id: 'pufferfish',
    name: 'Pufferfish',
    slot: 'companion',
    price: 50,
    description: 'A round, smiling little pufferfish bobbing serenely in your wake.',
    themes: ['cozy'],
  },
];

// Consumable Boosts
export interface BoostItem {
  id: string;
  name: string;
  price: number;
  description: string;
  effect: string;
}

export const BOOSTS_CATALOG: BoostItem[] = [
  {
    id: 'wishing_shell',
    name: 'Wishing Shell',
    price: 50,
    description: 'Whisper a wish to the ocean spirit before diving.',
    effect: '+50% exploration points on your next dive!',
  },
];

// Initial Demo State (User starts with 60 sand dollars and seeded wardrobe items including companion)
export const DEMO_SAND_DOLLARS = 60;
export const DEMO_OWNED_ACCESSORIES = [
  'sea_glass_headband',
  'shell_pendant',
  'flower_crown',
  'sea_glass_goggles',
  'dive_watch',
  'baby_crab',
  'no_top',
];
export const DEMO_EQUIPPED_ACCESSORIES: EquippedAccessories = {
  head: 'sea_glass_goggles',
  companion: 'baby_crab',
};
