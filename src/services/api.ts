import { DepthZone } from '../types';
import { getCreaturesForZone, getZoneFromDepth } from '../data/creatures';

export interface DiveAnalysisResult {
  zone?: DepthZone;
  score: number;
  depth_m: number;
  themes: string[];
  creature_id: string;
  summary: string;
  gentle_note?: string;
  needs_support?: boolean;
  usedFallback?: boolean;
}

// 3 PRESET WHISPERS PER ZONE FOR INSTANT RESPONSES
export const ZONE_PRESET_WHISPERS: Record<DepthZone, string[]> = {
  sunlight: [
    'Blub leaped into shimmering sunlit waters! Your bright day brought warmth to the entire coral reef.',
    'Golden sunbeams danced around you today. Blub floated with delight in the bright surface waters.',
    'What a vibrant, cheerful day! Blub spun gentle bubbles celebrating your clear, sunny energy.',
  ],
  twilight: [
    'Blub glided calmly through the cool teal current. A steady, peaceful rhythm carried you forward.',
    'Soft shadows and gentle currents surrounded you today. Blub drifted alongside with quiet appreciation.',
    'A serene and steady twilight swim. Blub sends peaceful ripples for your balanced, reflective day.',
  ],
  midnight: [
    'Blub followed gentle glowing trails beside you through the calm starlit indigo.',
    'In the quiet midnight waters, soft bioluminescence glowed around your peaceful reflection.',
    'A quiet, even day. Blub floats steadily beside you in the stillness of the midnight sea.',
  ],
  abyss: [
    'Blub floats quietly close by. In the cold deep, you are safe to pause and exhale.',
    'Heavy waters ask only for gentle breathing. Blub stays near, keeping watch while you rest.',
    'The silent deep protects you now. Blub wraps you in soothing stillness after a wearying day.',
  ],
  trench: [
    'Blub softly tucks you into the sheltering quiet of the ocean floor. You are completely safe.',
    'Deep down where the sea is quietest, Blub cradles your tired heart. You survived today.',
    'You carried heavy weight today. Here in the trench, you can let go and let the quiet hold you.',
  ],
};

// QUICK MOOD DIRECT MAPPER (NO GEMINI CALL FOR ZONE)
export function getQuickMoodDiveResult(mood: 1 | 2 | 3 | 4 | 5): DiveAnalysisResult {
  let zone: DepthZone;
  let depth_m: number;
  let score: number;

  switch (mood) {
    case 5: // Bright
      zone = 'sunlight';
      depth_m = 12;
      score = 0.85;
      break;
    case 4: // Warm
      zone = 'twilight';
      depth_m = 32;
      score = 0.45;
      break;
    case 3: // Even
      zone = 'midnight';
      depth_m = 60;
      score = 0.0;
      break;
    case 2: // Down
      zone = 'abyss';
      depth_m = 88;
      score = -0.55;
      break;
    case 1: // Heavy
    default:
      zone = 'trench';
      depth_m = 122;
      score = -0.9;
      break;
  }

  const zoneCreatures = getCreaturesForZone(zone);
  const randomCreature = zoneCreatures[Math.floor(Math.random() * zoneCreatures.length)].id;
  const presets = ZONE_PRESET_WHISPERS[zone];
  const summary = presets[Math.floor(Math.random() * presets.length)];

  let gentle_note: string | undefined = undefined;
  if (zone === 'trench') {
    gentle_note = 'It is safe to rest in the quiet deep; you made it through today.';
  } else if (zone === 'abyss') {
    gentle_note = 'Heavy water asks only for gentle breathing. You did enough today.';
  }

  return {
    zone,
    score,
    depth_m,
    themes: [],
    creature_id: randomCreature,
    summary,
    gentle_note,
    needs_support: false,
    usedFallback: false,
  };
}

// In-memory audio cache for ElevenLabs narration
const audioCache = new Map<string, string>();
let currentAudioElement: HTMLAudioElement | null = null;

// CLEARLY LABELED FALLBACK KEYWORD SENTIMENT SCORER FOR 5 MOOD ZONES (FROM TEXT ALONE)
export function keywordSentimentFallback(text: string, _legacySlider?: number): DiveAnalysisResult {
  const lower = (text || '').toLowerCase().trim();

  // Safety / crisis check
  const safetyKeywords = [
    'suicide', 'kill myself', 'end my life', 'end it all', 'want to die',
    'self harm', 'cutting myself', 'harming myself', 'suicidal'
  ];
  const needs_support = safetyKeywords.some((w) => lower.includes(w));

  let zone: DepthZone;
  let depth_m: number;
  let combinedScore: number;

  // Extreme heavy keywords -> Trench (106 - 140m)
  const trenchKeywords = [
    'worst', 'terrible', 'horrible', 'awful', 'miserable', 'depressed', 'depression',
    'devastated', 'breakdown', 'hopeless', 'unbearable', 'nightmare', 'hate my life',
    'hate today', 'ruined', 'crushed', 'suicidal', 'trauma', 'agony', 'grief',
    'deepest pain', 'cant take this', 'cant do this', 'crying all day', 'falling apart'
  ];

  // Strong negative keywords -> Abyss (76 - 105m)
  const abyssKeywords = [
    'bad', 'sad', 'lonely', 'exhausted', 'drained', 'burnout', 'burned out', 'anxious',
    'anxiety', 'overwhelmed', 'panic', 'struggling', 'struggle', 'angry', 'furious',
    'upset', 'hurting', 'hurt', 'pain', 'sick', 'sucks', 'sucked', 'rough', 'tough',
    'failure', 'failed', 'disaster', 'bleak', 'dread', 'numb', 'stress', 'stressed',
    'crying', 'cry', 'heavy', 'hard day', 'hate'
  ];

  // Gentle positive keywords -> Twilight (21 - 45m)
  const twilightKeywords = [
    'good', 'nice', 'decent', 'calm', 'peaceful', 'relaxed', 'relaxing', 'cozy',
    'steady', 'mild', 'content', 'gentle', 'chill', 'pleasant', 'fair', 'alright',
    'warm', 'soothing', 'comfort', 'comfortable', 'rested'
  ];

  // Bright joyful keywords -> Sunlight (5 - 20m)
  const sunlightKeywords = [
    'great', 'best', 'amazing', 'awesome', 'wonderful', 'fantastic', 'super',
    'happy', 'love', 'loved', 'excited', 'proud', 'accomplished', 'celebrate',
    'celebrated', 'joy', 'joyful', 'blessed', 'grateful', 'smiling', 'laugh',
    'laughed', 'laughing', 'thriving', 'sunshine', 'sunny', 'brilliant', 'fun'
  ];

  const hasTrench = trenchKeywords.some((w) => lower.includes(w));
  const hasAbyss = abyssKeywords.some((w) => lower.includes(w));
  const hasSunlight = sunlightKeywords.some((w) => lower.includes(w));
  const hasTwilight = twilightKeywords.some((w) => lower.includes(w));

  if (needs_support || hasTrench) {
    zone = 'trench';
    depth_m = Math.round(112 + Math.random() * 22); // 112 - 134m
    combinedScore = -0.92;
  } else if (hasAbyss) {
    zone = 'abyss';
    depth_m = Math.round(80 + Math.random() * 20); // 80 - 100m
    combinedScore = -0.68;
  } else if (hasSunlight) {
    zone = 'sunlight';
    depth_m = Math.round(7 + Math.random() * 10); // 7 - 17m
    combinedScore = 0.85;
  } else if (hasTwilight) {
    zone = 'twilight';
    depth_m = Math.round(24 + Math.random() * 16); // 24 - 40m
    combinedScore = 0.45;
  } else {
    // Neutral or unclassified text defaults to Midnight (Even)
    zone = 'midnight';
    depth_m = 60;
    combinedScore = 0.0;
  }

  depth_m = Math.max(5, Math.min(140, depth_m));

  const zoneCreatures = getCreaturesForZone(zone);
  const randomCreature = zoneCreatures[Math.floor(Math.random() * zoneCreatures.length)].id;

  // Detect themes
  const detectedThemes: string[] = [];
  if (/school|exam|class|homework|study|teacher|grade/i.test(lower)) detectedThemes.push('school');
  if (/work|job|boss|meeting|project|deadline|client|colleague/i.test(lower)) detectedThemes.push('work');
  if (/friend|people|talked|hangout|date|party|someone/i.test(lower)) detectedThemes.push('people');
  if (/sleep|nap|tired|awake|dream|rest|bed/i.test(lower)) detectedThemes.push('sleep');
  if (/health|sick|headache|doctor|body|walk|run|gym/i.test(lower)) detectedThemes.push('health');
  if (/money|bought|cost|pay|expensive|bills/i.test(lower)) detectedThemes.push('money');
  if (/family|mom|dad|sister|brother|parents|kids/i.test(lower)) detectedThemes.push('family');
  if (/game|fun|hobby|art|music|movie|play|read/i.test(lower)) detectedThemes.push('fun');

  if (detectedThemes.length === 0) {
    detectedThemes.push('other');
  }

  // Zone-matched Blub summaries (playful in Sunlight, tender in Trench)
  const presets = ZONE_PRESET_WHISPERS[zone];
  const summary = presets[Math.floor(Math.random() * presets.length)];
  let gentle_note: string | undefined = undefined;

  if (zone === 'abyss') {
    gentle_note = 'Heavy water asks only for gentle breathing. You did enough today.';
  } else if (zone === 'trench') {
    gentle_note = 'It is safe to rest in the quiet deep; you made it through today.';
  }

  return {
    zone,
    score: Number(combinedScore.toFixed(2)),
    depth_m,
    themes: detectedThemes.slice(0, 3),
    creature_id: randomCreature,
    summary,
    gentle_note,
    needs_support,
    usedFallback: true,
  };
}

// PRIMARY GEMINI ANALYSIS FROM TEXT ALONE (NO SLIDER HINT)
export async function analyzeDive(text: string, _legacySlider?: number): Promise<DiveAnalysisResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch('/api/analyze-dive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn('Gemini endpoint returned error, using offline keyword fallback');
      return keywordSentimentFallback(text);
    }

    const data = await res.json();
    if (data.useFallback || !data.depth_m || !data.creature_id) {
      return keywordSentimentFallback(text);
    }

    return {
      score: data.score ?? 0,
      depth_m: data.depth_m,
      themes: Array.isArray(data.themes) ? data.themes.slice(0, 3) : ['other'],
      creature_id: data.creature_id,
      summary: data.summary || 'Blub greeted you with gentle bubbles.',
      gentle_note: data.gentle_note || undefined,
      needs_support: Boolean(data.needs_support),
      usedFallback: false,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.info('Using offline sentiment analyzer fallback:', (err as any)?.message);
    return keywordSentimentFallback(text);
  }
}

// ELEVENLABS NARRATION SERVICE
export async function narrateText(text: string): Promise<boolean> {
  if (!text) return false;

  // Stop previous audio if playing
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch (e) {
      // Ignore
    }
  }

  // Check cache first
  const cachedAudio = audioCache.get(text);
  if (cachedAudio) {
    try {
      currentAudioElement = new Audio(cachedAudio);
      await currentAudioElement.play();
      return true;
    } catch (err) {
      console.warn('Cached narration playback error:', err);
      return false;
    }
  }

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = res.ok ? await res.json() : {};

    if (data.audioData) {
      audioCache.set(text, data.audioData);
      currentAudioElement = new Audio(data.audioData);
      await currentAudioElement.play();
      return true;
    }

    // Graceful fallback to browser speech synthesis if ElevenLabs has no quota or is unavailable
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.98; // Natural, conversational talking pace
        utterance.pitch = 1.05; // Softer, natural pitch
        const voices = window.speechSynthesis.getVoices();
        const calmFemale = voices.find((v) => 
          /samantha|karen|victoria|serena|moira|zira|female/i.test(v.name)
        );
        if (calmFemale) {
          utterance.voice = calmFemale;
        }
        window.speechSynthesis.speak(utterance);
        return true;
      } catch (e) {
        // Silently skip
      }
    }

    return false;
  } catch (err) {
    // If network or request fails, gracefully try browser speech synthesis or silently skip
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.98;
        utterance.pitch = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const calmFemale = voices.find((v) => 
          /samantha|karen|victoria|serena|moira|zira|female/i.test(v.name)
        );
        if (calmFemale) {
          utterance.voice = calmFemale;
        }
        window.speechSynthesis.speak(utterance);
        return true;
      } catch (e) {
        // Silently skip
      }
    }
    return false;
  }
}

export function stopNarration() {
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch (e) {
      // Ignore
    }
  }
}

export function hasCachedNarration(text: string): boolean {
  return audioCache.has(text);
}
