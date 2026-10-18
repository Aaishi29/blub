import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SeaBackground } from './components/SeaBackground';
import { Creature } from './components/Creature';
import { LogPanel, DiveSubmission } from './components/LogPanel';
import { FieldGuide } from './components/FieldGuide';
import { DiveChart } from './components/DiveChart';
import { AvatarCharacter } from './components/AvatarCharacter';
import { WardrobeDrawer } from './components/WardrobeDrawer';
import { AvatarPickerModal } from './components/AvatarPickerModal';
import { AvatarIllustration } from './components/AvatarIllustration';
import { SandDollarIcon } from './components/SandDollarIcon';
import { getCreatureById, getCreaturesForZone, getZoneDetails, getZoneFromDepth } from './data/creatures';
import { SEED_DIVES } from './data/seedData';
import { soundManager } from './services/sound';
import { analyzeDive, narrateText, getQuickMoodDiveResult, DiveAnalysisResult } from './services/api';
import {
  DiveLog,
  FloatingCreatureInstance,
  DepthZone,
  AvatarLook,
  EquippedAccessories,
  AccessoryItem,
  AccessorySlot,
} from './types';
import {
  DEFAULT_MERMAID_PRESET,
  DEMO_SAND_DOLLARS,
  DEMO_OWNED_ACCESSORIES,
  DEMO_EQUIPPED_ACCESSORIES,
  BoostItem,
} from './data/accessories';
import {
  Volume2,
  VolumeX,
  Compass,
  TrendingDown,
  Sparkles,
  Music,
  Waves,
  ShoppingBag,
  Award,
  Target,
  X,
  HeartHandshake,
} from 'lucide-react';
import { BottleChallenge } from './challenges/bottle';
import { CrabChallenge } from './challenges/crab';
import {
  GoalSetModal,
  GoalCheckCard,
  getActiveGoal,
  clearActiveGoal,
  TomorrowGoal,
} from './challenges/goal';
import { BubbleChallenge } from './challenges/bubble';
import { GiftChallenge } from './challenges/gift';
import { clearAllBottles, seedDemoBottles } from './services/bottleStorage';

const STORAGE_KEY = 'blub_dives_v2';
const SOUND_PREF_KEY = 'blub_sound_pref_v2';
const MUSIC_PREF_KEY = 'blub_music_pref_v2';
const AVATAR_STORAGE_KEY = 'blub_avatar_v1';
const SAND_DOLLARS_STORAGE_KEY = 'blub_sand_dollars_v1';
const OWNED_ACCESSORIES_STORAGE_KEY = 'blub_owned_accessories_v1';
const EQUIPPED_ACCESSORIES_STORAGE_KEY = 'blub_equipped_accessories_v1';
const ONBOARDED_STORAGE_KEY = 'blub_avatar_onboarded_v1';

const ZONE_CHALLENGES_INFO: Record<
  DepthZone,
  {
    name: string;
    key: 'bottle' | 'crab' | 'goal' | 'bubble' | 'gift';
    icon: string;
    description: string;
    reward: number;
    moodLabel: string;
  }
> = {
  sunlight: {
    name: 'Message in a Bottle',
    key: 'bottle',
    icon: '🍾',
    description: 'Record an audio memo or note for a harder day. 100% private on your device.',
    reward: 3,
    moodLabel: 'Bright 😄',
  },
  twilight: {
    name: 'Catch the Crab',
    key: 'crab',
    icon: '🦀',
    description: 'A cute crab scuttles sideways across a sunny sandbar. Tap or click to catch it!',
    reward: 3,
    moodLabel: 'Warm 🙂',
  },
  midnight: {
    name: "Tomorrow's Goal",
    key: 'goal',
    icon: '🎯',
    description: 'Set one small kind goal for tomorrow. Check in when you return for sand dollars.',
    reward: 5,
    moodLabel: 'Even 😐',
  },
  abyss: {
    name: 'Bubble Rise',
    key: 'bubble',
    icon: '🫧',
    description: 'Guide a delicate bubble upward through the deep ocean zones up to the sunny surface.',
    reward: 4,
    moodLabel: 'Down 🙁',
  },
  trench: {
    name: 'A Gentle Gift & Feed the Seahorse',
    key: 'gift',
    icon: '🎁',
    description: 'Receive a comforting bottle message, then gently feed a baby seahorse 5 plankton pieces.',
    reward: 3,
    moodLabel: 'Heavy 😞',
  },
};

// Base creature swimming speeds (jellyfish slowest, fish fastest, calm overall)
const SPECIES_BASE_SPEED: Record<string, number> = {
  moon_jelly: 0.02,
  vampire_squid: 0.022,
  greenland_shark: 0.024,
  sea_turtle: 0.025,
  dumbo_octopus: 0.027,
  giant_squid: 0.03,
  gulper_eel: 0.032,
  lanternfish: 0.036,
  goblin_shark: 0.038,
  anglerfish: 0.04,
  silver_fish: 0.042,
  reef_shark: 0.044,
  clownfish: 0.046,
  hammerhead: 0.048,
  dolphin: 0.052,
  // New zone creatures
  seahorse: 0.025,
  sea_angel: 0.026,
  sperm_whale: 0.03,
  sea_bunny: 0.022,
  starfish: 0.02,
  // legacy fallbacks
  squid: 0.034,
  sea_otter: 0.036,
};

// Safe open water area strictly between header and bottom panel
const OPEN_WATER = {
  minX: 10,
  maxX: 90,
  minY: 18,
  maxY: 68,
};

// Central whisper & avatar obstacle zone (30% - 70% horizontally, 18% - 58% vertically)
function isInsideWhisperZone(x: number, y: number): boolean {
  return x >= 30 && x <= 70 && y >= 18 && y <= 58;
}

// Function to pick a new purposeful waypoint in open water away from whisper & other waypoints
function pickWaypoint(
  currentList: FloatingCreatureInstance[],
  creatureId: string,
  currentX: number,
  currentY: number
): { x: number; y: number } {
  const MIN_DIST = 14;
  for (let attempt = 0; attempt < 40; attempt++) {
    const rx = OPEN_WATER.minX + Math.random() * (OPEN_WATER.maxX - OPEN_WATER.minX);
    const ry = OPEN_WATER.minY + Math.random() * (OPEN_WATER.maxY - OPEN_WATER.minY);

    if (isInsideWhisperZone(rx, ry)) continue;
    if (Math.hypot(rx - currentX, ry - currentY) < 14) continue;

    let collides = false;
    for (const other of currentList) {
      if (other.creatureId === creatureId) continue;
      if (Math.hypot(rx - other.targetX, ry - other.targetY) < MIN_DIST) {
        collides = true;
        break;
      }
      if (Math.hypot(rx - other.x, ry - other.y) < MIN_DIST * 0.8) {
        collides = true;
        break;
      }
    }

    if (!collides) {
      return { x: rx, y: ry };
    }
  }

  // Fallback candidate
  const fx = OPEN_WATER.minX + Math.random() * (OPEN_WATER.maxX - OPEN_WATER.minX);
  const fy = Math.random() > 0.5 ? 20 : 64;
  return { x: fx, y: fy };
}

export default function App() {
  // Saved Dives State
  const [dives, setDives] = useState<DiveLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const seen = new Set<string>();
          const clean: DiveLog[] = [];
          for (let i = 0; i < parsed.length; i++) {
            const item = parsed[i];
            const uid = String(item.id || `dive-${item.timestamp || Date.now()}-${i}`);
            if (!seen.has(uid)) {
              seen.add(uid);
              clean.push({ ...item, id: uid });
            } else {
              const freshId = `${uid}-dup-${i}`;
              seen.add(freshId);
              clean.push({ ...item, id: freshId });
            }
          }
          if (clean.length > 0) return clean;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved dives:', e);
    }
    return SEED_DIVES;
  });

  // Current Depth and Zone
  const [currentDepth, setCurrentDepth] = useState<number>(() => {
    return dives.length > 0 ? dives[0].depth : 12;
  });
  const currentZone = getZoneFromDepth(currentDepth);

  // Audio settings
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const pref = localStorage.getItem(SOUND_PREF_KEY);
    return pref ? JSON.parse(pref) : true;
  });
  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(() => {
    const pref = localStorage.getItem(MUSIC_PREF_KEY);
    return pref ? JSON.parse(pref) : false;
  });
  const [isPlayingNarration, setIsPlayingNarration] = useState(false);

  // Modals & UI View State
  const [activeModal, setActiveModal] = useState<'none' | 'fieldGuide' | 'diveProfile'>('none');
  const [isLoadingDive, setIsLoadingDive] = useState(false);
  const [newlyUnlockedCreatureId, setNewlyUnlockedCreatureId] = useState<string | null>(null);

  // Avatar & Wardrobe Customization State
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ONBOARDED_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [avatarLook, setAvatarLook] = useState<AvatarLook>(() => {
    try {
      const saved = localStorage.getItem(AVATAR_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_MERMAID_PRESET;
  });

  const [sandDollars, setSandDollars] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(SAND_DOLLARS_STORAGE_KEY);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return DEMO_SAND_DOLLARS;
  });

  const [ownedAccessories, setOwnedAccessories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(OWNED_ACCESSORIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEMO_OWNED_ACCESSORIES;
  });

  const [equippedAccessories, setEquippedAccessories] = useState<EquippedAccessories>(() => {
    try {
      const saved = localStorage.getItem(EQUIPPED_ACCESSORIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEMO_EQUIPPED_ACCESSORIES;
  });

  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState<boolean>(() => !isOnboarded);
  const [isWardrobeOpen, setIsWardrobeOpen] = useState<boolean>(false);
  const [avatarReaction, setAvatarReaction] = useState<{
    isWaving: boolean;
    expression: 'bright' | 'warm' | 'even' | 'down' | 'heavy';
  }>({
    isWaving: false,
    expression: 'even',
  });
  const [wishingShellActive, setWishingShellActive] = useState<boolean>(false);

  // Zone Challenges & Mini-games State
  const [activeChallenge, setActiveChallenge] = useState<
    'none' | 'bottle' | 'crab' | 'goal' | 'bubble' | 'gift' | 'selector'
  >('none');
  const [pendingGoalCheck, setPendingGoalCheck] = useState<TomorrowGoal | null>(null);
  const [readyChallengePrompt, setReadyChallengePrompt] = useState<{
    zone: DepthZone;
    name: string;
    challengeKey: 'bottle' | 'crab' | 'goal' | 'bubble' | 'gift';
    icon: string;
    description: string;
    reward: number;
    moodLabel: string;
  } | null>(null);

  // Check for active goal check-in on app open and seed demo bottles
  useEffect(() => {
    seedDemoBottles();
    const goal = getActiveGoal();
    if (goal) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (goal.setDate !== todayStr) {
        setPendingGoalCheck(goal);
      }
    }
  }, []);

  // Sync Avatar & Closet to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatarLook));
    } catch {}
  }, [avatarLook]);

  useEffect(() => {
    try {
      localStorage.setItem(SAND_DOLLARS_STORAGE_KEY, JSON.stringify(sandDollars));
    } catch {}
  }, [sandDollars]);

  useEffect(() => {
    try {
      localStorage.setItem(OWNED_ACCESSORIES_STORAGE_KEY, JSON.stringify(ownedAccessories));
    } catch {}
  }, [ownedAccessories]);

  useEffect(() => {
    try {
      localStorage.setItem(EQUIPPED_ACCESSORIES_STORAGE_KEY, JSON.stringify(equippedAccessories));
    } catch {}
  }, [equippedAccessories]);

  const handleSaveAvatarLook = (newLook: AvatarLook) => {
    setAvatarLook(newLook);
    setIsOnboarded(true);
    try {
      localStorage.setItem(ONBOARDED_STORAGE_KEY, 'true');
    } catch {}
    setIsAvatarPickerOpen(false);
  };

  const handleBuyItem = (item: AccessoryItem): boolean => {
    if (sandDollars < item.price) return false;
    setSandDollars((prev) => prev - item.price);
    setOwnedAccessories((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
    // Auto-equip newly bought item
    setEquippedAccessories((prev) => ({
      ...prev,
      [item.slot]: item.id,
    }));
    return true;
  };

  const handleBuyBoost = (boost: BoostItem): boolean => {
    if (sandDollars < boost.price) return false;
    setSandDollars((prev) => prev - boost.price);
    setWishingShellActive(true);
    return true;
  };

  const handleEquipItem = (slot: AccessorySlot, itemId: string) => {
    setEquippedAccessories((prev) => ({
      ...prev,
      [slot]: itemId,
    }));
  };

  const handleUnequipItem = (slot: AccessorySlot) => {
    setEquippedAccessories((prev) => {
      const copy = { ...prev };
      delete copy[slot];
      return copy;
    });
  };

  // Floating points celebration banner
  const [floatingPoints, setFloatingPoints] = useState<{
    points: number;
    multiplier: number;
    zoneName: string;
    id: number;
  } | null>(null);

  // Preview a zone by tapping the side depth meter
  const handlePreviewZone = (zone: DepthZone) => {
    let previewDepth = 12;
    switch (zone) {
      case 'sunlight':
        previewDepth = 12;
        break;
      case 'twilight':
        previewDepth = 32;
        break;
      case 'midnight':
        previewDepth = 60;
        break;
      case 'abyss':
        previewDepth = 90;
        break;
      case 'trench':
        previewDepth = 122;
        break;
    }
    soundManager.playDescentChime(previewDepth);
    setCurrentDepth(previewDepth);

    // Preload & prompt corresponding zone challenge from the quick-switch row
    const matching = ZONE_CHALLENGES_INFO[zone];
    if (matching) {
      setReadyChallengePrompt({
        zone,
        name: matching.name,
        challengeKey: matching.key,
        icon: matching.icon,
        description: matching.description,
        reward: matching.reward,
        moodLabel: matching.moodLabel,
      });
    }
  };

  // FIXED UPPER-MIDDLE WATER WHISPER (Stays centered in open water, stays longer)
  const [whisperData, setWhisperData] = useState<{
    text: string;
    gentleNote?: string;
    key: number;
  } | null>(() => {
    if (dives.length > 0) {
      const latest = dives[0];
      return {
        text: latest.summary,
        gentleNote: latest.gentleNote
          ? latest.gentleNote.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()
          : undefined,
        key: Date.now(),
      };
    }
    return null;
  });
  const [isWhisperDimmed, setIsWhisperDimmed] = useState<boolean>(false);
  const whisperDimTimerRef = useRef<any>(null);

  // Helper to refresh whisper brightness for 30 seconds
  const refreshWhisperTimer = useCallback(() => {
    setIsWhisperDimmed(false);
    if (whisperDimTimerRef.current) {
      clearTimeout(whisperDimTimerRef.current);
    }
    whisperDimTimerRef.current = setTimeout(() => {
      setIsWhisperDimmed(true);
    }, 30000);
  }, []);

  useEffect(() => {
    if (whisperData) {
      refreshWhisperTimer();
    }
    return () => {
      if (whisperDimTimerRef.current) clearTimeout(whisperDimTimerRef.current);
    };
  }, []);

  // Unlocked creatures set
  const unlockedCreatureIds = new Set<string>(dives.map((d) => d.creatureId));

  // Floating creatures in the sea
  const [floatingCreatures, setFloatingCreatures] = useState<FloatingCreatureInstance[]>([]);
  const newInstanceIdRef = useRef<string | null>(null);

  // Initialize and update floating creatures strictly for the current depth zone
  useEffect(() => {
    // 1. Get creatures belonging exclusively to the current zone
    const zoneRoster = getCreaturesForZone(currentZone);
    const zoneCreatureIds = new Set(zoneRoster.map((c) => c.id));

    // 2. Filter user's unlocked creatures that belong to this zone
    const unlockedForThisZone = Array.from(unlockedCreatureIds).filter((id) =>
      zoneCreatureIds.has(id)
    );

    // 3. Show unlocked creatures for this zone, or the zone's default first creature if none unlocked yet
    const activeList =
      unlockedForThisZone.length > 0 ? unlockedForThisZone : [zoneRoster[0].id];

    setFloatingCreatures((prev) => {
      // Keep only existing creature instances that actually belong to the current zone
      const filteredPrev = prev.filter((p) => {
        const info = getCreatureById(p.creatureId);
        return info.zone === currentZone;
      });

      const existingMap = new Map(filteredPrev.map((p) => [p.creatureId, p]));

      return activeList.map((cId, idx) => {
        if (existingMap.has(cId)) {
          return existingMap.get(cId)!;
        }

        // Generate non-overlapping initial position in open water outside whisper zone
        let startX = 15 + ((idx * 23) % 70);
        let startY = 20 + ((idx * 17) % 45);
        if (isInsideWhisperZone(startX, startY)) {
          startY = startY > 31 ? 55 : 20;
        }

        const wp = pickWaypoint(filteredPrev, cId, startX, startY);
        const layer = 0.25 + ((idx * 0.17) % 0.72); // layer 0-1 sets size, opacity, speed

        return {
          instanceId: `inst-${cId}-${Date.now()}-${idx}`,
          creatureId: cId,
          x: startX,
          y: startY,
          targetX: wp.x,
          targetY: wp.y,
          vx: 0,
          vy: 0,
          scale: 0.95 + (idx % 3) * 0.08,
          layer,
          facing: wp.x >= startX ? 1 : -1,
          rotation: 0,
          speed: SPECIES_BASE_SPEED[cId] || 0.035,
          lingerFrames: Math.floor(Math.random() * 60),
          swimCycle: Math.random() * 100,
        };
      });
    });
  }, [dives, currentZone]);

  // Synchronize ambient sound with mute state and current depth zone
  useEffect(() => {
    soundManager.setMuted(isMuted);
    localStorage.setItem(SOUND_PREF_KEY, JSON.stringify(isMuted));
  }, [isMuted]);

  // Configure ElevenLabs background music loops for each depth zone
  useEffect(() => {
    // 1. Bright (Sunlight): https://elevenmusic.io/tracks/VNrYiGLOJQ9eCnOp (0:33 - 0:41 on loop)
    soundManager.setMusicTrack(
      'sunlight',
      [
        '/music/VNrYiGLOJQ9eCnOp.mp3',
        '/music/VNrYiGLOJQ9eCnOp.m4a',
        '/music/VNrYiGLOJQ9eCnOp.wav',
        '/music/bright.mp3',
        '/music/sunlight.mp3',
        '/music/sunlit_currents.mp3',
      ],
      33,
      41
    );

    // 2. Warm (Twilight): https://elevenmusic.io/tracks/VNrYiGLOJQ9eCnOp (0:02 - 0:08 on loop)
    soundManager.setMusicTrack(
      'twilight',
      [
        '/music/VNrYiGLOJQ9eCnOp.mp3',
        '/music/VNrYiGLOJQ9eCnOp.m4a',
        '/music/VNrYiGLOJQ9eCnOp.wav',
        '/music/warm.mp3',
        '/music/twilight.mp3',
        '/music/sunlit_currents.mp3',
      ],
      2,
      8
    );

    // 3. Even (Midnight): https://elevenmusic.io/tracks/hAUOagzqlB1XUDfL (0:22 - 0:34 on loop)
    soundManager.setMusicTrack(
      'midnight',
      [
        '/music/hAUOagzqlB1XUDfL.mp3',
        '/music/hAUOagzqlB1XUDfL.m4a',
        '/music/hAUOagzqlB1XUDfL.wav',
        '/music/even.mp3',
        '/music/midnight.mp3',
        '/music/balance_point.mp3',
      ],
      22,
      34
    );

    // 4. Down (Abyss): https://elevenmusic.io/tracks/hAUOagzqlB1XUDfL (0:01 - 0:11 on loop)
    soundManager.setMusicTrack(
      'abyss',
      [
        '/music/hAUOagzqlB1XUDfL.mp3',
        '/music/hAUOagzqlB1XUDfL.m4a',
        '/music/hAUOagzqlB1XUDfL.wav',
        '/music/down.mp3',
        '/music/abyss.mp3',
        '/music/balance_point.mp3',
      ],
      1,
      11
    );

    // 5. Heavy (Trench): https://elevenmusic.io/tracks/TIxWMVoAMXSZ4D5b (0:01 - 0:14 on loop)
    soundManager.setMusicTrack(
      'trench',
      [
        '/music/TIxWMVoAMXSZ4D5b.mp3',
        '/music/TIxWMVoAMXSZ4D5b.m4a',
        '/music/TIxWMVoAMXSZ4D5b.wav',
        '/music/heavy.mp3',
        '/music/trench.mp3',
        '/music/sunlit_serenity.mp3',
      ],
      1,
      14
    );
  }, []);

  useEffect(() => {
    soundManager.setMusicEnabled(isMusicEnabled);
    localStorage.setItem(MUSIC_PREF_KEY, JSON.stringify(isMusicEnabled));
  }, [isMusicEnabled]);

  useEffect(() => {
    soundManager.setZone(currentZone);
  }, [currentZone]);

  // Real purposeful swimming motion & separation steering loop
  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 16.66, 2.5); // normalize to ~60fps
      lastTime = currentTime;

      setFloatingCreatures((prevList) => {
        // Clone array to update
        const updated = prevList.map((c) => ({ ...c }));

        for (let i = 0; i < updated.length; i++) {
          const c = updated[i];

          // 1. Steering towards waypoint
          const dx = c.targetX - c.x;
          const dy = c.targetY - c.y;
          const dist = Math.hypot(dx, dy);

          let desiredVx = 0;
          let desiredVy = 0;

          if (dist < 3.2) {
            // Reached waypoint: linger / slow down
            c.lingerFrames -= dt;
            if (c.lingerFrames <= 0) {
              const nextWp = pickWaypoint(updated, c.creatureId, c.x, c.y);
              c.targetX = nextWp.x;
              c.targetY = nextWp.y;
              c.lingerFrames = 60 + Math.random() * 120; // linger 1 - 3 seconds
            }
          } else {
            // Ease-in and ease-out speed factor
            const speedFactor = Math.min(1, Math.max(0.35, dist / 8));
            const effSpeed = c.speed * (0.75 + c.layer * 0.45) * speedFactor;
            desiredVx = (dx / dist) * effSpeed;
            desiredVy = (dy / dist) * effSpeed;
          }

          // 2. Obstacle Avoidance: Whisper & Avatar Zone in Upper-Middle
          if (c.x > 29 && c.x < 71 && c.y > 17 && c.y < 59) {
            const pushX = c.x >= 50 ? 0.04 : -0.04;
            const pushY = c.y >= 38 ? 0.035 : -0.035;
            desiredVx += pushX;
            desiredVy += pushY;
          }

          // 3. Separation Steering (No Overlapping):
          const MIN_SEP = 13.5;
          for (let j = 0; j < updated.length; j++) {
            if (i === j) continue;
            const other = updated[j];
            const sepX = c.x - other.x;
            const sepY = c.y - other.y;
            const sepDist = Math.hypot(sepX, sepY);

            if (sepDist < MIN_SEP && sepDist > 0.001) {
              const overlap = MIN_SEP - sepDist;
              // If two creatures come within min distance, the one with lower layer gently steers away
              if (c.layer <= other.layer) {
                const pushForce = (overlap / MIN_SEP) * 0.06;
                desiredVx += (sepX / sepDist) * pushForce;
                desiredVy += (sepY / sepDist) * pushForce;
              }
            }
          }

          // 4. Smooth Acceleration
          c.vx += (desiredVx - c.vx) * 0.045 * dt;
          c.vy += (desiredVy - c.vy) * 0.045 * dt;

          c.x += c.vx * dt;
          c.y += c.vy * dt;

          // Clamp strictly in open water bounds
          c.x = Math.max(OPEN_WATER.minX, Math.min(OPEN_WATER.maxX, c.x));
          c.y = Math.max(OPEN_WATER.minY, Math.min(OPEN_WATER.maxY, c.y));

          // 5. Direction Facing (smooth turn animation in Creature component)
          if (Math.abs(c.vx) > 0.004) {
            c.facing = c.vx > 0 ? 1 : -1;
          }

          // 6. Smooth Tilt toward direction of travel (max ~15 degrees)
          const targetTilt = Math.max(-15, Math.min(15, (c.vy / (Math.abs(c.vx) + 0.012)) * 14));
          c.rotation += (targetTilt - c.rotation) * 0.08 * dt;

          // 7. Swim cycle increment
          c.swimCycle += Math.hypot(c.vx, c.vy) * 12;
        }

        return updated;
      });

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  // Save dives to localStorage
  const saveDives = (newDives: DiveLog[]) => {
    const seen = new Set<string>();
    const sanitized: DiveLog[] = [];
    for (let i = 0; i < newDives.length; i++) {
      const d = newDives[i];
      let id = d.id || `dive-${d.timestamp || Date.now()}-${i}`;
      if (seen.has(id)) {
        id = `${id}-dup-${i}`;
      }
      seen.add(id);
      sanitized.push({ ...d, id });
    }
    setDives(sanitized);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  };

  // Handle Creature Click
  const handleCreatureClick = (instanceId: string) => {
    soundManager.playWiggle();

    setFloatingCreatures((prev) =>
      prev.map((c) => {
        if (c.instanceId === instanceId) {
          const info = getCreatureById(c.creatureId);
          return {
            ...c,
            isWiggling: true,
            speechBubble: info.funFact,
          };
        }
        return c;
      })
    );

    // Clear speech bubble after 4.5 seconds
    setTimeout(() => {
      setFloatingCreatures((prev) =>
        prev.map((c) => {
          if (c.instanceId === instanceId) {
            return {
              ...c,
              isWiggling: false,
              speechBubble: undefined,
            };
          }
          return c;
        })
      );
    }, 4500);
  };

  // Replay Narration
  const handleReplayNarration = async (textToSpeak: string) => {
    setIsPlayingNarration(true);
    await narrateText(textToSpeak);
    setIsPlayingNarration(false);
  };

  // Crisis Support Resources Modal
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Handle Dive Submission (supporting Tab 1 'text' and Tab 2 'mood')
  const handleDive = async (submission: DiveSubmission | string, legacySlider?: number) => {
    setIsLoadingDive(true);

    try {
      let source: 'text' | 'mood' = 'text';
      let text = '';
      let sliderMood: number | undefined = undefined;
      let analysis: DiveAnalysisResult;

      if (typeof submission === 'object') {
        source = submission.source;
        if (submission.source === 'mood') {
          sliderMood = submission.mood;
          // The selected mood maps directly to its zone:
          // Bright = Sunlight, Warm = Twilight, Even = Midnight, Down = Abyss, Heavy = Trench.
          // Do not call Gemini to decide the zone!
          analysis = getQuickMoodDiveResult(submission.mood);
        } else {
          text = submission.text;
          // Tab 1: Send text to Gemini without slider hint. Gemini decides zone from text alone.
          analysis = await analyzeDive(text);
        }
      } else {
        text = submission;
        sliderMood = legacySlider || 3;
        analysis = await analyzeDive(text);
      }

      // If crisis safety check was triggered, pop open the support modal
      if (analysis.needs_support) {
        setIsSupportModalOpen(true);
      }

      // Determine zone and multiplier
      const calculatedZone = analysis.zone || getZoneFromDepth(analysis.depth_m);
      const calculatedZoneDetails = getZoneDetails(calculatedZone);
      const multiplier = calculatedZoneDetails.multiplierNum;

      const basePoints = 75;
      const rawPoints = Math.round(basePoints * multiplier);
      const points = wishingShellActive ? Math.round(rawPoints * 1.5) : rawPoints;
      if (wishingShellActive) setWishingShellActive(false);

      // Trigger Avatar celebratory wave and mood-matching expression
      const moodMap: Record<DepthZone, 'bright' | 'warm' | 'even' | 'down' | 'heavy'> = {
        sunlight: 'bright',
        twilight: 'warm',
        midnight: 'even',
        abyss: 'down',
        trench: 'heavy',
      };
      const moodExpr = moodMap[calculatedZone] || 'even';
      setAvatarReaction({ isWaving: true, expression: moodExpr });
      setTimeout(() => {
        setAvatarReaction((prev) => ({ ...prev, isWaving: false }));
      }, 4500);

      const now = new Date();
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayOfWeek = dayNames[now.getDay()];
      const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' });

      // Occasionally address the user by name in Blub's whisper
      let whisperSummary = analysis.summary;
      if (
        avatarLook.name &&
        Math.random() < 0.45 &&
        !whisperSummary.toLowerCase().includes(avatarLook.name.toLowerCase())
      ) {
        whisperSummary = `${avatarLook.name}, ${whisperSummary.charAt(0).toLowerCase()}${whisperSummary.slice(1)}`;
      }

      const uniqueId = `dive-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newDive: DiveLog = {
        id: uniqueId,
        timestamp: Date.now(),
        dateStr,
        dayOfWeek,
        text,
        sliderMood,
        source,
        score: analysis.score,
        depth: analysis.depth_m,
        zone: calculatedZone,
        creatureId: analysis.creature_id,
        themes: source === 'mood' ? [] : analysis.themes,
        summary: whisperSummary,
        gentleNote: analysis.gentle_note,
        needs_support: source === 'mood' ? false : analysis.needs_support,
        points,
        multiplier,
      };

      // Play soundscape descent chime
      soundManager.playDescentChime(analysis.depth_m);

      // Descent transition
      setCurrentDepth(analysis.depth_m);

      // Save dive
      const updatedDives = [newDive, ...dives];
      saveDives(updatedDives);

      // Trigger floating points animation with multiplier & zone label
      setFloatingPoints({
        points,
        multiplier,
        zoneName: calculatedZoneDetails.name.replace(' Zone', ''),
        id: Date.now(),
      });

      // Sound blub for creature appearance
      setTimeout(() => {
        soundManager.playBlub();
      }, 700);

      // Highlight newly unlocked creature
      setNewlyUnlockedCreatureId(analysis.creature_id);

      // Strip emojis from gentle note if present
      const cleanGentleNote = analysis.gentle_note
        ? analysis.gentle_note.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()
        : undefined;

      // Update fixed upper-middle whisper and refresh 30s timer with cross-fade
      setWhisperData({
        text: whisperSummary,
        gentleNote: cleanGentleNote,
        key: Date.now(),
      });
      refreshWhisperTimer();

      // Add to floating creatures if not already floating
      setFloatingCreatures((prev) => {
        const exists = prev.some((p) => p.creatureId === analysis.creature_id);
        if (!exists && prev.length < 12) {
          const spawnX = Math.random() > 0.5 ? 20 : 80;
          const spawnY = Math.random() > 0.5 ? 24 : 60;
          const wp = pickWaypoint(prev, analysis.creature_id, spawnX, spawnY);
          const newInst: FloatingCreatureInstance = {
            instanceId: `inst-${analysis.creature_id}-${Date.now()}`,
            creatureId: analysis.creature_id,
            x: spawnX,
            y: spawnY,
            targetX: wp.x,
            targetY: wp.y,
            vx: 0,
            vy: 0,
            scale: 1.0,
            layer: 0.85, // New creature appears in clear front layer
            facing: wp.x >= spawnX ? 1 : -1,
            rotation: 0,
            speed: SPECIES_BASE_SPEED[analysis.creature_id] || 0.04,
            lingerFrames: 30,
            swimCycle: 0,
          };
          newInstanceIdRef.current = newInst.instanceId;
          return [newInst, ...prev];
        }
        return prev;
      });

      // Speak Blub's summary line softly via ElevenLabs
      if (whisperSummary) {
        setIsPlayingNarration(true);
        narrateText(whisperSummary).finally(() => {
          setIsPlayingNarration(false);
        });
      }

      // Prompt matching seaside challenge for this dive's zone
      const matchingChallenge = ZONE_CHALLENGES_INFO[calculatedZone];
      if (matchingChallenge) {
        setReadyChallengePrompt({
          zone: calculatedZone,
          name: matchingChallenge.name,
          challengeKey: matchingChallenge.key,
          icon: matchingChallenge.icon,
          description: matchingChallenge.description,
          reward: matchingChallenge.reward,
          moodLabel: matchingChallenge.moodLabel,
        });
      }
    } catch (err) {
      console.error('Dive processing error:', err);
    } finally {
      setIsLoadingDive(false);
    }
  };

  // Reset/Clear Dives & Avatar/Wardrobe State
  const handleClearDives = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AVATAR_STORAGE_KEY);
    localStorage.removeItem(SAND_DOLLARS_STORAGE_KEY);
    localStorage.removeItem(OWNED_ACCESSORIES_STORAGE_KEY);
    localStorage.removeItem(EQUIPPED_ACCESSORIES_STORAGE_KEY);
    localStorage.removeItem(ONBOARDED_STORAGE_KEY);
    clearActiveGoal();
    clearAllBottles();

    setDives([]);
    setCurrentDepth(10);
    setFloatingCreatures([]);
    setWhisperData(null);
    setIsWhisperDimmed(false);
    setPendingGoalCheck(null);
    setReadyChallengePrompt(null);
    setActiveChallenge('none');

    setAvatarLook(DEFAULT_MERMAID_PRESET);
    setSandDollars(DEMO_SAND_DOLLARS);
    setOwnedAccessories(DEMO_OWNED_ACCESSORIES);
    setEquippedAccessories(DEMO_EQUIPPED_ACCESSORIES);
    setIsOnboarded(false);
    setIsAvatarPickerOpen(true);
  };

  // Total points calculation
  const totalPoints = dives.reduce((sum, d) => sum + d.points, 0);
  const zoneInfo = getZoneDetails(currentZone);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between text-white font-sans">
      {/* Dynamic Animated Sea Background */}
      <SeaBackground zone={currentZone} depth={currentDepth} />

      {/* Floating Creatures in the Living Sea */}
      {floatingCreatures.map((item, idx) => (
        <Creature
          key={`float-inst-${item.instanceId}-${idx}`}
          creatureId={item.creatureId}
          x={item.x}
          y={item.y}
          facing={item.facing}
          rotation={item.rotation}
          layer={item.layer}
          scale={item.scale}
          isNew={item.instanceId === newInstanceIdRef.current}
          isWiggling={item.isWiggling}
          speechBubble={item.speechBubble}
          onClick={() => handleCreatureClick(item.instanceId)}
        />
      ))}

      {/* Floating Points celebration banner */}
      {floatingPoints && (
        <div
          key={`pts-banner-${floatingPoints.id}`}
          className="fixed top-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-30 animate-float-points flex flex-col items-center gap-1.5"
        >
          <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-lg sm:text-xl shadow-2xl flex items-center gap-2 border-2 border-white/80">
            <Sparkles size={20} className="text-amber-800" />
            <span>+{floatingPoints.points} ({floatingPoints.multiplier.toFixed(1)}x {floatingPoints.zoneName})</span>
          </div>
          <div className="px-3.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-300/40 text-amber-200 text-xs font-bold flex items-center gap-1.5 shadow-lg">
            <SandDollarIcon size={15} />
            <span>+20 Sand Dollars</span>
          </div>
        </div>
      )}

      {/* TOP APP HEADER */}
      <header className="relative z-30 px-4 sm:px-6 pt-3 pb-2 flex items-center justify-between pointer-events-auto">
        {/* Brand / Logo with custom wave mark */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-cyan-400/25 backdrop-blur-md border border-cyan-300/40 p-1 flex items-center justify-center shadow-lg group hover:scale-105 transition-transform overflow-hidden">
            <img
              src="/logo-wave.png"
              alt="Blub Wave"
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(34,211,238,0.85)] scale-115"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-md flex items-center gap-1.5">
              Blub
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-300/30 tracking-wider">
                Ocean Journal
              </span>
            </h1>
            <p className="text-[11px] text-cyan-100/80 font-medium hidden sm:block">
              {zoneInfo.name} • {currentDepth}m depth
            </p>
          </div>
        </div>

        {/* Center Zone & Depth Indicator Badge */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/15 dark:bg-black/30 backdrop-blur-lg border border-white/20 shadow-sm text-xs font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping" />
          <span className="text-cyan-200">{zoneInfo.name}</span>
          <span className="text-white/60">•</span>
          <span className="text-amber-300 font-bold">{currentDepth} m</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-800/60 text-cyan-200 font-bold">
            {zoneInfo.multiplier}
          </span>
        </div>

        {/* Right Navigation & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Total Points Pill */}
          <div
            className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-amber-400/20 backdrop-blur-md border border-amber-300/40 text-amber-200 text-xs font-bold shadow-sm"
            title="Total Exploration Points"
          >
            <Sparkles size={14} className="text-amber-300" />
            <span>{totalPoints} pts</span>
          </div>

          {/* Web Audio Ambient Sound Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-2xl backdrop-blur-md border transition-all ${
              !isMuted
                ? 'bg-cyan-500/30 border-cyan-300/50 text-cyan-200 shadow-cyan-500/20 shadow-md ring-2 ring-cyan-400/30'
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/70'
            }`}
            title={!isMuted ? 'Mute ambient soundscape' : 'Play ambient underwater soundscape'}
            aria-label={!isMuted ? 'Mute sound' : 'Unmute sound'}
          >
            {!isMuted ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Zone Music Toggle (supports ambient soundscape & custom ElevenLabs zone tracks) */}
          <button
            onClick={() => {
              setIsMusicEnabled(!isMusicEnabled);
            }}
            className={`p-2 rounded-2xl backdrop-blur-md border transition-all flex items-center gap-1.5 ${
              isMusicEnabled
                ? 'bg-purple-500/30 border-purple-300/50 text-purple-200 shadow-purple-500/20 shadow-md ring-2 ring-purple-400/30'
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/70'
            }`}
            title={isMusicEnabled ? 'Zone music is ON (Tap to mute music)' : 'Turn zone music ON'}
            aria-label="Zone music toggle"
          >
            <Music size={18} className={isMusicEnabled ? 'animate-pulse text-purple-300' : ''} />
            <span className="text-[10px] font-bold hidden sm:inline">
              {isMusicEnabled ? 'Music ON' : 'Music'}
            </span>
          </button>

          {/* Replay Whisper Bubble Icon in Header */}
          {whisperData && (
            <button
              onClick={() => {
                refreshWhisperTimer();
                handleReplayNarration(whisperData.text);
              }}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-cyan-200 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center"
              title="Replay Blub's whisper"
              aria-label="Replay Blub's whisper"
            >
              <span className="text-base leading-none">🫧</span>
            </button>
          )}

          {/* Field Guide Button */}
          <button
            onClick={() => setActiveModal('fieldGuide')}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            aria-label="Open Field Guide"
          >
            <Compass size={17} className="text-cyan-300" />
            <span className="hidden sm:inline">Guide ({unlockedCreatureIds.size}/20)</span>
          </button>

          {/* Seaside Challenges Button */}
          <button
            onClick={() => setActiveChallenge('selector')}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 backdrop-blur-md border border-cyan-400/30 text-cyan-200 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            aria-label="Open Seaside Challenges"
            title="Seaside Challenges & Mini-games"
          >
            <Award size={17} className="text-cyan-300" />
            <span className="hidden sm:inline">Challenges</span>
          </button>

          {/* Sand Dollars & Wardrobe Shortcut */}
          <button
            onClick={() => setIsWardrobeOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur-md border border-amber-300/40 text-amber-200 text-xs font-bold shadow-sm transition-all active:scale-95"
            title="Open Wardrobe & Accessory Shop"
            aria-label="Open Wardrobe"
          >
            <SandDollarIcon size={16} animate />
            <span>{sandDollars}</span>
          </button>

          {/* Dive Profile Chart & Avatar Button */}
          <button
            onClick={() => setActiveModal('diveProfile')}
            className="p-1 sm:px-2.5 sm:py-1 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95"
            aria-label={`Open Profile for ${avatarLook.name}`}
            title={`Profile (${avatarLook.name})`}
          >
            <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 border border-white/40 flex items-center justify-center shadow-inner">
              <AvatarIllustration
                key={`thumb-${avatarLook.preset}-${avatarLook.skinTone}-${avatarLook.hairStyle}-${avatarLook.hairColor}-${avatarLook.tailPattern}`}
                look={avatarLook}
                equipped={equippedAccessories}
                thumbnailMode
                className="w-5 h-5"
              />
            </div>
            <span className="hidden sm:inline">{avatarLook.name || 'Profile'}</span>
          </button>
        </div>
      </header>

      {/* FIXED EMBEDDED WATER WHISPER (Centered horizontally, upper-middle open water, no box) */}
      {whisperData && (
        <div
          key={`whisper-msg-${whisperData.key}`}
          onClick={() => {
            refreshWhisperTimer();
            handleReplayNarration(whisperData.text);
          }}
          className={`fixed left-1/2 top-[31%] -translate-x-1/2 -translate-y-1/2 z-20 max-w-[420px] sm:max-w-[520px] w-[90%] text-center cursor-pointer select-none transition-opacity duration-1000 ${
            isWhisperDimmed ? 'opacity-40 hover:opacity-100' : 'opacity-95'
          }`}
          title="Tap to brighten or listen"
          aria-label="Blub's whisper thought"
        >
          <div className="px-3">
            {/* Soft whisper text in quotes with tiny speaker icon (+3pt bigger: 24px/26px) */}
            <div
              className="text-[24px] sm:text-[26px] font-normal leading-relaxed text-white/95"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: 'italic',
                textShadow:
                  currentZone === 'sunlight'
                    ? '0 2px 14px rgba(56, 189, 248, 0.75)'
                    : currentZone === 'twilight'
                    ? '0 2px 14px rgba(45, 212, 191, 0.75)'
                    : currentZone === 'midnight'
                    ? '0 2px 16px rgba(129, 140, 248, 0.85)'
                    : currentZone === 'abyss'
                    ? '0 2px 16px rgba(96, 165, 250, 0.75)'
                    : '0 2px 16px rgba(244, 63, 94, 0.8)',
              }}
            >
              <span>“{whisperData.text}”</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  refreshWhisperTimer();
                  handleReplayNarration(whisperData.text);
                }}
                className="inline-flex items-center ml-2.5 opacity-40 hover:opacity-100 active:opacity-100 transition-opacity p-0.5 align-middle text-cyan-200"
                title="Listen to whisper"
                aria-label="Listen to narration"
              >
                <Volume2 size={17} className={isPlayingNarration ? 'animate-pulse text-cyan-300' : ''} />
              </button>
            </div>

            {/* Second smaller, dimmer comforting line beneath it, without emoji (+3pt bigger: 18px/19px) */}
            {whisperData.gentleNote && (
              <div
                className="text-[18px] sm:text-[19px] text-white/65 leading-normal mt-2"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: 'italic',
                  textShadow:
                    currentZone === 'sunlight'
                      ? '0 1px 10px rgba(56, 189, 248, 0.5)'
                      : currentZone === 'twilight'
                      ? '0 1px 10px rgba(45, 212, 191, 0.5)'
                      : currentZone === 'midnight'
                      ? '0 1px 12px rgba(129, 140, 248, 0.6)'
                      : currentZone === 'abyss'
                      ? '0 1px 12px rgba(96, 165, 250, 0.5)'
                      : '0 1px 12px rgba(244, 63, 94, 0.5)',
                }}
              >
                {whisperData.gentleNote}
              </div>
            )}

            {/* Always-visible 'Talk to a person' button on Heavy / Trench dives */}
            {currentZone === 'trench' && (
              <div className="mt-2.5 flex justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSupportModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/25 hover:bg-rose-500/35 border border-rose-400/40 text-rose-200 text-xs font-semibold shadow-md transition-all cursor-pointer"
                  title="Talk to a person - free confidential support"
                >
                  <HeartHandshake size={13} className="text-rose-300" />
                  <span>Talk to a person</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* IN-SEA AVATAR CHARACTER (Phase 0: Fixed placement under whisper, gentle bobbing, dive reactions) */}
      <AvatarCharacter
        look={avatarLook}
        equipped={equippedAccessories}
        moodExpression={avatarReaction.expression}
        isWaving={avatarReaction.isWaving}
        onOpenWardrobe={() => setIsWardrobeOpen(true)}
      />

      {/* INTERACTIVE SIDE DEPTH METER (Left Margin) */}
      <div className="fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 pointer-events-auto">
        <div className="rounded-2xl bg-slate-950/45 backdrop-blur-md border border-white/20 p-2 sm:p-2.5 shadow-2xl flex flex-col items-center">
          {/* Header */}
          <div className="text-[9px] font-black tracking-wider text-cyan-200/80 uppercase mb-1">
            0m Surface
          </div>

          {/* Depth track container */}
          <div className="flex items-center gap-2">
            {/* The Vertical Depth Gauge Bar with Sliding Indicator */}
            <div className="relative w-2 h-64 sm:h-72 rounded-full bg-white/10 overflow-visible border border-white/20">
              {/* Colored zone sections on bar */}
              <div className="absolute inset-0 rounded-full overflow-hidden flex flex-col">
                <div style={{ height: `${(20 / 140) * 100}%` }} className="bg-sky-400/50" title="Sunlight 0-20m" />
                <div style={{ height: `${(25 / 140) * 100}%` }} className="bg-teal-400/50" title="Twilight 20-45m" />
                <div style={{ height: `${(30 / 140) * 100}%` }} className="bg-indigo-400/50" title="Midnight 45-75m" />
                <div style={{ height: `${(30 / 140) * 100}%` }} className="bg-blue-600/50" title="Abyss 75-105m" />
                <div style={{ height: `${(35 / 140) * 100}%` }} className="bg-rose-600/50" title="Trench 105-140m" />
              </div>

              {/* Smoothly Sliding Depth Indicator Marker */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-10 flex items-center"
                style={{ top: `${Math.min(100, Math.max(0, (currentDepth / 140) * 100))}%` }}
              >
                {/* Glowing Marker Ping */}
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-4 h-4 rounded-full bg-cyan-400/60 animate-ping" />
                  <span className="w-3.5 h-3.5 rounded-full bg-white border-2 border-cyan-400 shadow-[0_0_10px_#22D3EE]" />
                </div>
              </div>
            </div>

            {/* 5 Zone Tappable Preview Rows */}
            <div className="flex flex-col justify-between h-64 sm:h-72 py-0.5">
              {[
                { zone: 'sunlight' as DepthZone, name: 'Sunlight', emoji: '😄', range: '0-20m', mult: '1.0x', color: '#38BDF8' },
                { zone: 'twilight' as DepthZone, name: 'Twilight', emoji: '🙂', range: '20-45m', mult: '1.5x', color: '#2DD4BF' },
                { zone: 'midnight' as DepthZone, name: 'Midnight', emoji: '😐', range: '45-75m', mult: '2.0x', color: '#818CF8' },
                { zone: 'abyss' as DepthZone, name: 'Abyss', emoji: '🙁', range: '75-105m', mult: '2.5x', color: '#60A5FA' },
                { zone: 'trench' as DepthZone, name: 'Trench', emoji: '😞', range: '105-140m', mult: '3.0x', color: '#F43F5E' },
              ].map((item) => {
                const isActive = currentZone === item.zone;
                return (
                  <button
                    key={item.zone}
                    onClick={() => handlePreviewZone(item.zone)}
                    className={`px-1.5 sm:px-2 py-1 rounded-xl text-left transition-all flex items-center gap-1.5 group cursor-pointer ${
                      isActive
                        ? 'bg-white/20 border border-white/40 shadow-sm scale-102 font-bold'
                        : 'bg-white/5 hover:bg-white/15 border border-white/5 opacity-70 hover:opacity-100'
                    }`}
                    title={`Tap to preview ${item.name} (${item.range})`}
                    aria-label={`Preview ${item.name} zone`}
                  >
                    <span className="text-xs sm:text-sm leading-none">{item.emoji}</span>
                    <div className="hidden sm:block">
                      <div className="text-[10px] text-white/90 font-semibold leading-tight flex items-center gap-1">
                        <span>{item.name}</span>
                        <span
                          className="text-[9px] px-1 py-0.2 rounded font-black"
                          style={{ backgroundColor: `${item.color}33`, color: item.color }}
                        >
                          {item.mult}
                        </span>
                      </div>
                      <div className="text-[8px] text-white/50">{item.range}</div>
                    </div>
                    {/* Compact indicator on small screen */}
                    <span className="sm:hidden text-[9px] font-bold text-cyan-200">{item.mult}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer current depth readout */}
          <div className="text-[10px] font-black text-amber-300 tracking-wider uppercase mt-1 flex items-center gap-1">
            <span>{currentDepth}m</span>
            <span className="text-[8px] text-cyan-300">({zoneInfo.multiplier})</span>
          </div>
        </div>
      </div>

      {/* BOTTOM LOGGING UI */}
      <div className="relative z-20 pb-4 sm:pb-6 pointer-events-auto">
        <LogPanel onDive={handleDive} isLoading={isLoadingDive} />
      </div>

      {/* MODAL: FIELD GUIDE */}
      {activeModal === 'fieldGuide' && (
        <FieldGuide
          unlockedCreatureIds={unlockedCreatureIds}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* MODAL: DIVE PROFILE */}
      {activeModal === 'diveProfile' && (
        <DiveChart
          dives={dives}
          look={avatarLook}
          equipped={equippedAccessories}
          sandDollars={sandDollars}
          onClose={() => setActiveModal('none')}
          onReplayNarration={handleReplayNarration}
          onClearDives={handleClearDives}
          onChangeLook={() => {
            setActiveModal('none');
            setIsAvatarPickerOpen(true);
          }}
          onOpenWardrobe={() => {
            setActiveModal('none');
            setIsWardrobeOpen(true);
          }}
        />
      )}

      {/* MODAL: AVATAR ONBOARDING & "CHANGE MY LOOK" */}
      {isAvatarPickerOpen && (
        <AvatarPickerModal
          initialLook={avatarLook}
          equipped={equippedAccessories}
          isFirstLaunch={!isOnboarded}
          onSave={handleSaveAvatarLook}
          onClose={isOnboarded ? () => setIsAvatarPickerOpen(false) : undefined}
        />
      )}

      {/* DRAWER: WARDROBE & ACCESSORY SHOP */}
      <WardrobeDrawer
        isOpen={isWardrobeOpen}
        onClose={() => setIsWardrobeOpen(false)}
        look={avatarLook}
        sandDollars={sandDollars}
        ownedAccessories={ownedAccessories}
        equipped={equippedAccessories}
        onBuyItem={handleBuyItem}
        onBuyBoost={handleBuyBoost}
        onEquipItem={handleEquipItem}
        onUnequipItem={handleUnequipItem}
        onChangeLook={() => {
          setIsWardrobeOpen(false);
          setIsAvatarPickerOpen(true);
        }}
      />

      {/* FLOATING PROMPT FOR TODAY'S ZONE CHALLENGE (COMPACT SLEEK SEASIDE BANNER) */}
      {readyChallengePrompt && activeChallenge === 'none' && (
        <div className="fixed top-16 sm:top-[4.5rem] left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top-2 duration-200 max-w-[92vw] sm:max-w-lg w-auto bg-slate-950/90 backdrop-blur-md border border-cyan-400/40 rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 text-white shadow-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Compact Challenge Icon */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-400/25 to-blue-600/20 border border-cyan-300/40 flex items-center justify-center text-xl sm:text-2xl shadow-inner shrink-0 relative">
              <span className="drop-shadow-sm select-none">{readyChallengePrompt.icon}</span>
            </div>

            {/* Banner Titles & Details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-cyan-300">
                <Sparkles size={11} className="text-amber-300 shrink-0" />
                <span className="truncate">{readyChallengePrompt.zone} Challenge</span>
                <span className="text-white/40">•</span>
                <span className="text-amber-300 font-extrabold shrink-0 flex items-center gap-1">
                  <span>+{readyChallengePrompt.reward}</span>
                  <SandDollarIcon size={13} />
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                {readyChallengePrompt.name}
              </h3>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                soundManager.playSparkle();
                setActiveChallenge(readyChallengePrompt.challengeKey);
                setReadyChallengePrompt(null);
              }}
              className="px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Award size={14} className="text-slate-950" />
              <span>Start</span>
            </button>
            <button
              onClick={() => {
                soundManager.playBlub();
                setReadyChallengePrompt(null);
              }}
              className="p-1 sm:p-1.5 rounded-lg text-white/50 hover:text-white transition-colors cursor-pointer"
              aria-label="Dismiss challenge prompt"
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* CHALLENGE: GOAL CHECK CARD (UPON RETURNING ON NEXT DAY) */}
      {pendingGoalCheck && (
        <GoalCheckCard
          goal={pendingGoalCheck}
          onReward={(amt) => {
            setSandDollars((s) => s + amt);
            setPendingGoalCheck(null);
          }}
          onDismiss={() => setPendingGoalCheck(null)}
          onPickNew={() => {
            setPendingGoalCheck(null);
            setActiveChallenge('goal');
          }}
        />
      )}

      {/* CHALLENGE 1: MESSAGE IN A BOTTLE (SUNLIGHT) */}
      {activeChallenge === 'bottle' && (
        <BottleChallenge
          onClose={() => setActiveChallenge('none')}
          onComplete={(dollars) => {
            setSandDollars((s) => s + dollars);
            setActiveChallenge('none');
          }}
        />
      )}

      {/* CHALLENGE 2: CATCH THE CRAB (TWILIGHT) */}
      {activeChallenge === 'crab' && (
        <CrabChallenge
          onClose={() => setActiveChallenge('none')}
          onComplete={(dollars) => {
            setSandDollars((s) => s + dollars);
            setActiveChallenge('none');
          }}
        />
      )}

      {/* CHALLENGE 3: TOMORROW'S GOAL (MIDNIGHT) */}
      {activeChallenge === 'goal' && (
        <GoalSetModal
          onClose={() => setActiveChallenge('none')}
          onComplete={() => setActiveChallenge('none')}
        />
      )}

      {/* CHALLENGE 4: BUBBLE RISE (ABYSS) */}
      {activeChallenge === 'bubble' && (
        <BubbleChallenge
          isOpen
          onClose={() => setActiveChallenge('none')}
          onComplete={(dollars) => {
            setSandDollars((s) => s + dollars);
            setActiveChallenge('none');
          }}
          initialZone={currentZone}
        />
      )}

      {/* CHALLENGE 5: A GENTLE GIFT & FEED THE SEAHORSE (TRENCH) */}
      {activeChallenge === 'gift' && (
        <GiftChallenge
          isOpen
          onClose={() => setActiveChallenge('none')}
          onComplete={(dollars) => {
            setSandDollars((s) => s + dollars);
            setActiveChallenge('none');
          }}
        />
      )}

      {/* SEASIDE CHALLENGES SELECTOR MODAL */}
      {activeChallenge === 'selector' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-cyan-400/30 rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white font-serif tracking-wide flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-300" />
                  <span>Seaside Challenges</span>
                </h3>
                <p className="text-xs text-cyan-100/70 mt-1">
                  Gentle daily ocean activities. Earn sand dollars to expand your wardrobe.
                </p>
              </div>
              <button
                onClick={() => setActiveChallenge('none')}
                className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                aria-label="Close challenges menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of 5 Zone Challenges */}
            <div className="space-y-3">
              {[
                {
                  id: 'bottle' as const,
                  zoneName: 'Sunlight Zone',
                  mood: 'Bright',
                  title: 'Message in a Bottle',
                  desc: 'Record a voice memo or note to your future self for a harder day. 100% private.',
                  reward: 3,
                  color: 'from-amber-400 to-yellow-500',
                  accentBorder: 'border-amber-400/30',
                  badgeBg: 'bg-amber-400/20 text-amber-200',
                },
                {
                  id: 'crab' as const,
                  zoneName: 'Twilight Zone',
                  mood: 'Warm',
                  title: 'Catch the Crab',
                  desc: 'A cute crab scuttles sideways across a sunny sandbar. Tap or press space to catch it!',
                  reward: 3,
                  color: 'from-teal-400 to-emerald-500',
                  accentBorder: 'border-teal-400/30',
                  badgeBg: 'bg-teal-400/20 text-teal-200',
                },
                {
                  id: 'goal' as const,
                  zoneName: 'Midnight Zone',
                  mood: 'Even',
                  title: "Tomorrow's Goal",
                  desc: 'Set one small kind goal for tomorrow. Check in when you return for sand dollars.',
                  reward: 5,
                  color: 'from-indigo-400 to-purple-500',
                  accentBorder: 'border-indigo-400/30',
                  badgeBg: 'bg-indigo-400/20 text-indigo-200',
                },
                {
                  id: 'bubble' as const,
                  zoneName: 'Abyss Zone',
                  mood: 'Down',
                  title: 'Bubble Rise',
                  desc: 'Guide a delicate bubble upward through all 5 ocean depth zones up to the sunny surface.',
                  reward: 4,
                  color: 'from-cyan-400 to-blue-500',
                  accentBorder: 'border-cyan-400/30',
                  badgeBg: 'bg-cyan-400/20 text-cyan-200',
                },
                {
                  id: 'gift' as const,
                  zoneName: 'Trench Zone',
                  mood: 'Heavy',
                  title: 'A Gentle Gift & Feed the Seahorse',
                  desc: 'Receive a comforting bottle message, then gently feed a baby seahorse 5 plankton pieces.',
                  reward: 3,
                  color: 'from-rose-400 to-pink-500',
                  accentBorder: 'border-rose-400/30',
                  badgeBg: 'bg-rose-400/20 text-rose-200',
                },
              ].map((c) => (
                <div
                  key={c.id}
                  className={`p-4 rounded-2xl bg-white/5 border ${c.accentBorder} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-white/10 transition-colors`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badgeBg}`}>
                        {c.zoneName} ({c.mood})
                      </span>
                      <h4 className="font-semibold text-white text-sm">{c.title}</h4>
                    </div>
                    <p className="text-xs text-white/60">{c.desc}</p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-1 text-amber-300 font-bold text-xs whitespace-nowrap">
                      <SandDollarIcon size={14} />
                      <span>+{c.reward}</span>
                    </div>

                    <button
                      onClick={() => setActiveChallenge(c.id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 whitespace-nowrap"
                    >
                      Play
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CRISIS / TALK TO A PERSON MODAL */}
      {isSupportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="app-support-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div className="w-full max-w-sm rounded-3xl bg-slate-900/95 border border-rose-400/40 p-5 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-400" />
                <h3 id="app-support-title" className="text-sm font-bold text-rose-200">
                  Talk to a Person
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(false)}
                className="p-1 text-white/50 hover:text-white"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              If things feel heavy or you need someone to listen, free, confidential support is available 24/7.
            </p>
            <div className="space-y-2.5 text-xs">
              <a
                href="tel:988"
                className="block p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <div className="font-bold text-white">988 Suicide & Crisis Lifeline</div>
                <div className="text-[11px] text-white/50">Call or Text 988 (US & Canada, 24/7)</div>
              </a>
              <a
                href="sms:741741&body=HOME"
                className="block p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <div className="font-bold text-white">Crisis Text Line</div>
                <div className="text-[11px] text-white/50">Text HOME to 741741 (Free & Confidential)</div>
              </a>
              <a
                href="https://findahelpline.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <div className="font-bold text-white">International Resources</div>
                <div className="text-[11px] text-cyan-300 underline">findahelpline.com</div>
              </a>
            </div>
            <button
              type="button"
              onClick={() => setIsSupportModalOpen(false)}
              className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white/90 font-bold text-xs"
            >
              Return to Sea
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
