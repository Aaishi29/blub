import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { checkRateLimit, getClientIp } from './api/_shared';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Cache for generated ElevenLabs TTS audio base64 strings: text -> base64
const ttsCache = new Map<string, string>();

// Roster of creatures per zone
const ZONE_ROSTER = {
  sunlight: ['dolphin', 'sea_turtle', 'clownfish', 'seahorse'],
  twilight: ['silver_fish', 'reef_shark', 'hammerhead', 'sea_angel'],
  midnight: ['moon_jelly', 'anglerfish', 'lanternfish', 'sperm_whale'],
  abyss: ['goblin_shark', 'greenland_shark', 'gulper_eel', 'sea_bunny'],
  trench: ['vampire_squid', 'dumbo_octopus', 'giant_squid', 'starfish'],
};

// High-fidelity fallback analyzer prioritizing written text sentiment alone (no slider hint)
function generateSmartDiveFallback(rawText: string) {
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

// Gemini analysis endpoint (supports both /api/analyze and /api/analyze-dive)
app.post(['/api/analyze', '/api/analyze-dive'], async (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(clientIp, 30, 60000);
  res.setHeader('X-RateLimit-Limit', '30');
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());

  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString());
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  const { text } = req.body || {};
  if (typeof text === 'string' && text.length > 5000) {
    return res.status(400).json({ error: 'Journal text exceeds maximum allowed length of 5000 characters.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    const fallback = generateSmartDiveFallback(text);
    return res.json(fallback);
  }

  const prompt = `You are the emotional depth analyzer for "Blub", an ocean day journal app.
Analyze the user's journal entry to assign their ocean depth zone based solely on their written text.

CRITICAL INSTRUCTION - WRITTEN TEXT IS 100% AUTHORITATIVE:
- Determine the zone, score, and themes strictly from the user's WRITTEN JOURNAL TEXT.
- If the user writes about a hard, painful, exhausting, or bad day (e.g. "my day was the worst", "terrible day", "everything sucks", "I feel awful", "so stressed and tired", "lonely and overwhelmed"), you MUST classify them into TRENCH (106-140m) or ABYSS (76-105m)!
- Never assign Sunlight, Twilight, or Midnight to an entry expressing clear sadness, anger, exhaustion, pain, or suffering!

Zone classification criteria:
1. "trench" (Heavy 😞, depth 106-140m, score -0.75 to -1.0):
   - Worst days, deeply exhausting, devastating, painful, despairing, heavy, unbearable, traumatic, overwhelmed to tears.
   - Examples: "my day ws the worst", "terrible day", "I can't do this anymore", "cried all day", "everything fell apart".

2. "abyss" (Down 🙁, depth 76-105m, score -0.4 to -0.74):
   - Sad, anxious, tired, drained, frustrated, tough, lonely, struggling, bad day.
   - Examples: "had a bad day", "feeling really low", "so stressed about exams", "tired and burnt out".

3. "midnight" (Even 😐, depth 46-75m, score -0.2 to +0.2):
   - Neutral, reflective, quiet, ordinary, routine, uneventful day.
   - Examples: "just an average day", "worked and ran errands", "nothing special today".

4. "twilight" (Warm 🙂, depth 21-45m, score +0.21 to +0.55):
   - Gentle, calm, pleasant, mild, steady, cozy, peaceful day.
   - Examples: "pretty good day", "nice quiet afternoon", "felt relaxed after work".

5. "sunlight" (Bright 😄, depth 5-20m, score +0.56 to +1.0):
   - Joyful, accomplished, celebratory, energetic, sunny, thrilling day.
   - Examples: "had the best time", "so happy and proud", "amazing day with friends".

User's journal text: "${text || ''}"

Determine:
1. zone: exactly one of ["sunlight", "twilight", "midnight", "abyss", "trench"] from the text alone.
2. score: number between -1.0 (heaviest day) to 1.0 (brightest day).
3. depth_m: integer within the selected zone's depth range:
   - sunlight: 5 - 20 m
   - twilight: 21 - 45 m
   - midnight: 46 - 75 m
   - abyss: 76 - 105 m
   - trench: 106 - 140 m

4. themes: array of up to 3 tags from ["school","work","people","sleep","health","money","family","fun","other"].

5. creature_id: choose one creature from that zone's roster:
   - sunlight: "dolphin", "sea_turtle", "clownfish", "seahorse"
   - twilight: "silver_fish", "reef_shark", "hammerhead", "sea_angel"
   - midnight: "moon_jelly", "anglerfish", "lanternfish", "sperm_whale"
   - abyss: "goblin_shark", "greenland_shark", "gulper_eel", "sea_bunny"
   - trench: "vampire_squid", "dumbo_octopus", "giant_squid", "starfish"

6. summary: One warm, playful sentence in Sunlight/Twilight, or tender and comforting sentence in Midnight/Abyss/Trench (max 20 words) written as Blub the ocean spirit. Never clinical, never diagnosing.
7. gentle_note: If the day sounds hard (Abyss or Trench), one short kind line without emojis (e.g. "It is safe to rest in the quiet deep; you made it through today."). Otherwise empty string.
8. needs_support: boolean, true if user expresses self-harm, suicidal thoughts, or extreme crisis; otherwise false.`;

  // Candidate models to try before falling back
  const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash'];

  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction:
            'You are Blub, a warm, serene underwater spirit companion. Never give medical advice or clinical diagnosis. Treat sarcasm and mixed emotions with gentle care and playful or tender warmth matching the depth zone.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              zone: {
                type: Type.STRING,
                description: 'One of sunlight, twilight, midnight, abyss, trench',
              },
              score: {
                type: Type.NUMBER,
                description: 'Score from -1.0 (heavy) to 1.0 (bright)',
              },
              depth_m: {
                type: Type.INTEGER,
                description: 'Depth in meters within the selected zone range',
              },
              themes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Up to 3 themes from the specified list',
              },
              creature_id: {
                type: Type.STRING,
                description: 'ID of creature matching the zone',
              },
              summary: {
                type: Type.STRING,
                description: 'One warm or tender sentence (max 20 words) as Blub',
              },
              gentle_note: {
                type: Type.STRING,
                description: 'Optional kind comfort line for hard days, or empty string',
              },
              needs_support: {
                type: Type.BOOLEAN,
                description: 'True if self-harm or suicidal crisis is expressed',
              },
            },
            required: ['zone', 'score', 'depth_m', 'themes', 'creature_id', 'summary'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.depth_m && parsed.creature_id) {
        return res.json({ ...parsed, usedFallback: false });
      }
    } catch (err: any) {
      // If 429 quota reached or model unavailable, try next model or fallback
      console.warn(`[AI] Model ${modelName} unavailable (${err?.status || err?.message?.slice(0, 60)}), trying fallback.`);
    }
  }

  // Graceful fallback: Never return 500 error or log console.error
  const fallback = generateSmartDiveFallback(text);
  return res.json(fallback);
});

// Free premade voices supported on ElevenLabs, prioritized for natural, conversational delivery
const FREE_PREMADE_VOICE_IDS = [
  'EXAVITQu4vr4xnSDxMaL', // Sarah - Casual, Warm & Conversational (Priority)
  'cgSgspJ2msm6clMCkdW9', // Jessica - Natural, Expressive & Conversational
  'FGY2WhTYpPnrIDTdsKH5', // Laura - Friendly, Natural & Warm
  'Xb7hH8MSUJpSbSDYk0k2', // Alice - Approachable & Clear
];

// ElevenLabs TTS endpoint (supports both /api/narrate and /api/tts)
app.post(['/api/narrate', '/api/tts'], async (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(clientIp, 40, 60000);
  res.setHeader('X-RateLimit-Limit', '40');
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());

  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString());
    return res.status(429).json({ error: 'Too many narration requests. Please wait a moment.' });
  }

  const { text } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (text.length > 1000) {
    return res.status(400).json({ error: 'Text exceeds maximum allowed length of 1000 characters.' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.json({ audioUrl: null, note: 'No ElevenLabs API key configured' });
  }

  // Check cache
  const cachedAudio = ttsCache.get(text);
  if (cachedAudio) {
    return res.json({ audioData: cachedAudio, cached: true });
  }

  // Prefer user specified voice or Sarah (natural conversational voice)
  const candidateVoiceIds = [
    process.env.ELEVENLABS_VOICE_ID,
    ...FREE_PREMADE_VOICE_IDS,
  ].filter((v): v is string => Boolean(v && v !== '21m00Tcm4TlvDq8ikWAM'));

  for (const voiceId of candidateVoiceIds) {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: {
              stability: 0.45, // Soft, steady conversational flow
              similarity_boost: 0.85,
              style: 0.22, // Gentler, softer, more intimate delivery
              use_speaker_boost: false, // Turn off loudness boost for a softer, relaxed tone
            },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        // If 402 (paid plan required for this specific voice) or 400, try next free candidate
        if (response.status === 402 || response.status === 400) {
          continue;
        }
        // Other non-fatal errors
        return res.json({ audioUrl: null, note: 'ElevenLabs generation skipped' });
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const audioDataUrl = `data:audio/mp3;base64,${base64}`;

      ttsCache.set(text, audioDataUrl);
      return res.json({ audioData: audioDataUrl, cached: false });
    } catch (err: any) {
      // Continue to next voice candidate or exit silently
    }
  }

  // If all candidate voices fail or free quota is reached, gracefully return audioUrl: null
  return res.json({ audioUrl: null, note: 'ElevenLabs voice unavailable' });
});

// Vite dev middleware or static serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Blub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
