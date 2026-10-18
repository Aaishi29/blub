// Shared utilities for Vercel serverless functions & local server

// Roster of creatures per zone
export const ZONE_ROSTER = {
  sunlight: ['dolphin', 'sea_turtle', 'clownfish', 'seahorse'],
  twilight: ['silver_fish', 'reef_shark', 'hammerhead', 'sea_angel'],
  midnight: ['moon_jelly', 'anglerfish', 'lanternfish', 'sperm_whale'],
  abyss: ['goblin_shark', 'greenland_shark', 'gulper_eel', 'sea_bunny'],
  trench: ['vampire_squid', 'dumbo_octopus', 'giant_squid', 'starfish'],
};

// In-memory sliding window rate limiter per IP
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale rate limit entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function checkRateLimit(
  ip: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(ip, newRecord);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newRecord.resetTime,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

export function getClientIp(req: any): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (forwarded) {
    const firstIp = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    if (firstIp) return firstIp.trim();
  }
  return (
    req.headers?.['x-real-ip'] ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    '127.0.0.1'
  );
}

// High-fidelity fallback analyzer prioritizing written text sentiment alone (no slider hint)
export function generateSmartDiveFallback(rawText: string) {
  const text = (rawText || '').trim().toLowerCase();

  let zone: 'sunlight' | 'twilight' | 'midnight' | 'abyss' | 'trench';
  let depth_m: number;
  let score: number;

  // Crisis & safety keywords -> needs_support: true, Trench
  const safetyKeywords = [
    'suicide', 'kill myself', 'end my life', 'end it all', 'want to die',
    'self harm', 'cutting myself', 'harming myself', 'suicidal'
  ];
  const needs_support = safetyKeywords.some((w) => text.includes(w));

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

  if (needs_support || trenchKeywords.some((w) => text.includes(w))) {
    zone = 'trench';
    depth_m = Math.round(112 + Math.random() * 22); // 112 - 134m
    score = -0.92;
  } else if (abyssKeywords.some((w) => text.includes(w))) {
    zone = 'abyss';
    depth_m = Math.round(80 + Math.random() * 20); // 80 - 100m
    score = -0.68;
  } else if (sunlightKeywords.some((w) => text.includes(w))) {
    zone = 'sunlight';
    depth_m = Math.round(7 + Math.random() * 10); // 7 - 17m
    score = 0.85;
  } else if (twilightKeywords.some((w) => text.includes(w))) {
    zone = 'twilight';
    depth_m = Math.round(24 + Math.random() * 16); // 24 - 40m
    score = 0.45;
  } else {
    // Neutral / quiet day defaults to Midnight (46 - 75m)
    zone = 'midnight';
    depth_m = 60;
    score = 0.0;
  }

  depth_m = Math.max(5, Math.min(140, depth_m));

  // Themes
  const themes: string[] = [];
  if (/school|exam|class|homework|study|teacher|grade/i.test(text)) themes.push('school');
  if (/work|job|boss|meeting|project|deadline|client|colleague/i.test(text)) themes.push('work');
  if (/friend|people|talked|hangout|date|party|someone/i.test(text)) themes.push('people');
  if (/sleep|nap|tired|awake|dream|rest|bed/i.test(text)) themes.push('sleep');
  if (/health|sick|headache|doctor|body|walk|run|gym/i.test(text)) themes.push('health');
  if (/money|bought|cost|pay|expensive|bills/i.test(text)) themes.push('money');
  if (/family|mom|dad|sister|brother|parents|kids/i.test(text)) themes.push('family');
  if (/game|fun|hobby|art|music|movie|play|read/i.test(text)) themes.push('fun');
  if (themes.length === 0) themes.push('other');

  // Creature selection
  const roster = ZONE_ROSTER[zone];
  const creature_id = roster[Math.floor(Math.random() * roster.length)];

  // Zone-specific Blub summary lines
  const summaries: Record<string, string[]> = {
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

  const zoneSummaries = summaries[zone];
  const summary = zoneSummaries[Math.floor(Math.random() * zoneSummaries.length)];

  let gentle_note = '';
  if (zone === 'abyss') {
    gentle_note = 'Heavy water asks only for gentle breathing. You did enough today.';
  } else if (zone === 'trench') {
    gentle_note = 'It is safe to rest in the quiet deep; you made it through today.';
  }

  return {
    zone,
    score,
    depth_m,
    themes: themes.slice(0, 3),
    creature_id,
    summary,
    gentle_note,
    needs_support,
    usedFallback: true,
  };
}
