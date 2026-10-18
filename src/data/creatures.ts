import { CreatureInfo, DepthZone } from '../types';

export const CREATURES: CreatureInfo[] = [
  // 1. SUNLIGHT ZONE (0-20 m, Bright 😄)
  {
    id: 'dolphin',
    name: 'Bubbles',
    species: 'Spotted Dolphin',
    zone: 'sunlight',
    minDepth: 3,
    maxDepth: 18,
    pattern: 'Playful side specks & pearl underbelly',
    accentColor: '#38BDF8',
    funFact: 'Dolphins whistle unique signature melodies to greet each friend in the pod!',
  },
  {
    id: 'sea_turtle',
    name: 'Shelly',
    species: 'Green Sea Turtle',
    zone: 'sunlight',
    minDepth: 5,
    maxDepth: 20,
    pattern: 'Geometric carapace tiles & spotted flippers',
    accentColor: '#34D399',
    funFact: 'Sea turtles can hold their breath for hours while peacefully snoozing on reef cushions.',
  },
  {
    id: 'clownfish',
    name: 'Finny',
    species: 'Tropical Clownfish',
    zone: 'sunlight',
    minDepth: 2,
    maxDepth: 15,
    pattern: 'Three soft cream banded stripes',
    accentColor: '#FB923C',
    funFact: 'Clownfish love cuddling inside anemone tentacles for soft tickly naps!',
  },
  {
    id: 'seahorse',
    name: 'Pip',
    species: 'Pygmy Seahorse',
    zone: 'sunlight',
    minDepth: 4,
    maxDepth: 19,
    pattern: 'Golden coral ridges & curling spiral tail',
    accentColor: '#FBBF24',
    funFact: 'Seahorses hold tails with their best friends using their tiny prehensile tails so they don’t drift apart!',
  },

  // 2. TWILIGHT ZONE (20-45 m, Warm 🙂)
  {
    id: 'silver_fish',
    name: 'Shimmer',
    species: 'Silver Schooling Fish',
    zone: 'twilight',
    minDepth: 22,
    maxDepth: 42,
    pattern: 'Iridescent metallic silver scales & blue spine',
    accentColor: '#94A3B8',
    funFact: 'Silver schooling fish synchronize their graceful turns like a single shimmering cloud.',
  },
  {
    id: 'reef_shark',
    name: 'Echo',
    species: 'Blacktip Reef Shark',
    zone: 'twilight',
    minDepth: 20,
    maxDepth: 45,
    pattern: 'Muted slate flank & dark tipped dorsal fin',
    accentColor: '#64748B',
    funFact: 'Reef sharks are shy and curious swimmers that rest by gently gliding over sandbanks.',
  },
  {
    id: 'hammerhead',
    name: 'Nautilus',
    species: 'Smooth Hammerhead',
    zone: 'twilight',
    minDepth: 25,
    maxDepth: 44,
    pattern: 'Wing-shaped cephalofoil & pale belly wash',
    accentColor: '#78716C',
    funFact: 'The hammerhead’s wide head gives it 360-degree panoramic vision of the open water!',
  },
  {
    id: 'sea_angel',
    name: 'Seraph',
    species: 'Gymnosomata Sea Angel',
    zone: 'twilight',
    minDepth: 22,
    maxDepth: 44,
    pattern: 'Translucent glowing amber wings & luminous visceral core',
    accentColor: '#38BDF8',
    funFact: 'Sea angels fly through twilight currents by gently flapping their translucent angel wings!',
  },

  // 3. MIDNIGHT ZONE (45-75 m, Even 😐)
  {
    id: 'moon_jelly',
    name: 'Aurelia',
    species: 'Moon Jellyfish',
    zone: 'midnight',
    minDepth: 46,
    maxDepth: 70,
    pattern: 'Four glowing horseshoe rings & gossamer arms',
    accentColor: '#818CF8',
    funFact: 'Moon jellies are 95% water and drift softly in the midnight blue like living starlight.',
  },
  {
    id: 'anglerfish',
    name: 'Lumi',
    species: 'Deepsea Anglerfish',
    zone: 'midnight',
    minDepth: 55,
    maxDepth: 75,
    pattern: 'Glowing yellow lantern & constellation freckles',
    accentColor: '#EAB308',
    funFact: 'Lumi’s cozy lantern shines thanks to millions of happy glowing bacteria friends!',
  },
  {
    id: 'lanternfish',
    name: 'Glint',
    species: 'Spotted Lanternfish',
    zone: 'midnight',
    minDepth: 48,
    maxDepth: 74,
    pattern: 'Row of glowing bioluminescent photophores along belly',
    accentColor: '#2DD4BF',
    funFact: 'Lanternfish migrate upward every evening like underwater fireflies in the twilight!',
  },
  {
    id: 'sperm_whale',
    name: 'Levi',
    species: 'Deep-diving Sperm Whale',
    zone: 'midnight',
    minDepth: 48,
    maxDepth: 75,
    pattern: 'Mottled slate blue flank & deep harmonic sonar pulse',
    accentColor: '#60A5FA',
    funFact: 'Sperm whales can dive down to the midnight depths on a single breath, singing rhythmic click songs across the ocean!',
  },

  // 4. ABYSS ZONE (75-105 m, Down 🙁)
  {
    id: 'goblin_shark',
    name: 'Snouty',
    species: 'Baby Goblin Shark',
    zone: 'abyss',
    minDepth: 78,
    maxDepth: 104,
    pattern: 'Soft dusty rose quartz hue & rounded elongated snout',
    accentColor: '#F472B6',
    funFact: 'Deep in the dark abyss, Snouty glides like a gentle slow cloud looking for ocean treats.',
  },
  {
    id: 'greenland_shark',
    name: 'Boreal',
    species: 'Greenland Shark',
    zone: 'abyss',
    minDepth: 80,
    maxDepth: 105,
    pattern: 'Weathered slate-indigo hide & frosted fin edges',
    accentColor: '#475569',
    funFact: 'Greenland sharks can live for over 400 peaceful years in the deep icy currents.',
  },
  {
    id: 'gulper_eel',
    name: 'Pelican',
    species: 'Gulper Eel',
    zone: 'abyss',
    minDepth: 76,
    maxDepth: 102,
    pattern: 'Ribbon-like slender body & luminous tail tip bulb',
    accentColor: '#A855F7',
    funFact: 'The gulper eel’s tail ends in a glowing pink bioluminescent beacon that lights the dark.',
  },
  {
    id: 'sea_bunny',
    name: 'Snowy',
    species: 'Jorunna Parva Sea Bunny',
    zone: 'abyss',
    minDepth: 76,
    maxDepth: 104,
    pattern: 'Velvety fluffy white mantle with soft black sensory bunny ears',
    accentColor: '#E2E8F0',
    funFact: 'Sea bunnies look like fluffy underwater rabbits — their cute bunny "ears" are actually delicate scent detectors!',
  },

  // 5. TRENCH ZONE (105-140 m, Heavy 😞)
  {
    id: 'vampire_squid',
    name: 'Velvet',
    species: 'Vampire Squid',
    zone: 'trench',
    minDepth: 108,
    maxDepth: 138,
    pattern: 'Velvety webbed cloak with ruby-violet luminescence',
    accentColor: '#E11D48',
    funFact: 'Despite its spooky name, Velvet is a gentle scavenger that feeds on drifting marine snow.',
  },
  {
    id: 'dumbo_octopus',
    name: 'Puff',
    species: 'Dumbo Octopus',
    zone: 'trench',
    minDepth: 110,
    maxDepth: 140,
    pattern: 'Fluttering crown ear-fins & golden circular suction pads',
    accentColor: '#FB7185',
    funFact: 'Dumbo octopuses fly through the deepest ocean trenches by flapping tiny ear-fins like wings!',
  },
  {
    id: 'giant_squid',
    name: 'Archie',
    species: 'Architeuthis Giant Squid',
    zone: 'trench',
    minDepth: 115,
    maxDepth: 140,
    pattern: 'Long flowing iridescent tentacles & serene golden eye',
    accentColor: '#C084FC',
    funFact: 'Archie’s eye is the size of a dinner plate, designed to catch the faintest glimmers in the trench.',
  },
  {
    id: 'starfish',
    name: 'Stella',
    species: 'Abyssal Brittle Star',
    zone: 'trench',
    minDepth: 106,
    maxDepth: 140,
    pattern: 'Five slender glowing coral-violet arms & bioluminescent star core',
    accentColor: '#E879F9',
    funFact: 'Abyssal brittle stars can glow with soft bioluminescence along their five slender arms to light up the trench floor!',
  },
];

export function getCreatureById(id: string): CreatureInfo {
  const found = CREATURES.find((c) => c.id === id);
  return found || CREATURES[0];
}

export function getCreaturesForZone(zone: DepthZone): CreatureInfo[] {
  return CREATURES.filter((c) => c.zone === zone);
}

// Map depth in meters to one of the 5 mood zones
export function getZoneFromDepth(depth: number): DepthZone {
  if (depth <= 20) return 'sunlight';
  if (depth <= 45) return 'twilight';
  if (depth <= 75) return 'midnight';
  if (depth <= 105) return 'abyss';
  return 'trench';
}

// Map mood slider (1 to 5) directly to zone
export function getZoneFromMoodSlider(sliderVal: number): DepthZone {
  switch (sliderVal) {
    case 5:
      return 'sunlight'; // Bright 😄
    case 4:
      return 'twilight'; // Warm 🙂
    case 3:
      return 'midnight'; // Even 😐
    case 2:
      return 'abyss';    // Down 🙁
    case 1:
    default:
      return 'trench';   // Heavy 😞
  }
}

// Pick one creature from that zone's roster of 3, preferring unlocked ones
export function pickCreatureForDive(zone: DepthZone, unlockedIds: Set<string>): string {
  const roster = getCreaturesForZone(zone);
  const unobtained = roster.filter((c) => !unlockedIds.has(c.id));
  if (unobtained.length > 0) {
    return unobtained[Math.floor(Math.random() * unobtained.length)].id;
  }
  // All unlocked: repeat one at random
  return roster[Math.floor(Math.random() * roster.length)].id;
}

export function getZoneDetails(zone: DepthZone) {
  switch (zone) {
    case 'sunlight':
      return {
        name: 'Sunlight Zone',
        moodName: 'Bright',
        emoji: '😄',
        depthRange: '0 - 20 m',
        multiplier: '1.0x',
        multiplierNum: 1.0,
        description: 'Warm, saturated blue waters shimmering with sunlight, light caustics, and coral.',
        bgClass: 'from-[#0ea5e9] via-[#0284c7] to-[#0369a1]',
        accentColor: '#38BDF8',
      };
    case 'twilight':
      return {
        name: 'Twilight Zone',
        moodName: 'Warm',
        emoji: '🙂',
        depthRange: '20 - 45 m',
        multiplier: '1.5x',
        multiplierNum: 1.5,
        description: 'Dimmer, cooler teal-blue sanctuary with fading light and silvery sleek swimmers.',
        bgClass: 'from-[#0d9488] via-[#0f766e] to-[#134e4a]',
        accentColor: '#2DD4BF',
      };
    case 'midnight':
      return {
        name: 'Midnight Zone',
        moodName: 'Even',
        emoji: '😐',
        depthRange: '45 - 75 m',
        multiplier: '2.0x',
        multiplierNum: 2.0,
        description: 'Dark navy-to-indigo gradient with gentle bioluminescent specks and glowing trails.',
        bgClass: 'from-[#1e1b4b] via-[#1e293b] to-[#0f172a]',
        accentColor: '#818CF8',
      };
    case 'abyss':
      return {
        name: 'Abyss Zone',
        moodName: 'Down',
        emoji: '🙁',
        depthRange: '75 - 105 m',
        multiplier: '2.5x',
        multiplierNum: 2.5,
        description: 'Deep cold blue haze with minimal light, home to graceful ancient sharks and eels.',
        bgClass: 'from-[#0b1329] via-[#070d1e] to-[#030611]',
        accentColor: '#60A5FA',
      };
    case 'trench':
      return {
        name: 'Trench Zone',
        moodName: 'Heavy',
        emoji: '😞',
        depthRange: '105 - 140 m',
        multiplier: '3.0x',
        multiplierNum: 3.0,
        description: 'Blackish navy expanse with silhouetted seabed, sheltering and quiet.',
        bgClass: 'from-[#060810] via-[#030409] to-[#010205]',
        accentColor: '#F43F5E',
      };
  }
}
