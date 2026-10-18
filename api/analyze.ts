import { GoogleGenAI, Type } from '@google/genai';
import { checkRateLimit, getClientIp, generateSmartDiveFallback } from './_shared.js';

// Maximum allowed input text length (characters)
const MAX_TEXT_LENGTH = 5000;
// Per-IP rate limit: max 30 analysis requests per 60 seconds
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export default async function handler(req: any, res: any) {
  // CORS & preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // 1. Per-IP Rate Limiting
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(clientIp, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());

  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString());
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment before taking another dive.',
    });
  }

  // 2. Request validation & Max Length enforcement
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }
  }

  const text = typeof body?.text === 'string' ? body.text : '';

  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({
      error: `Journal text exceeds maximum allowed length of ${MAX_TEXT_LENGTH} characters.`,
    });
  }

  // 3. Fallback if Gemini key is missing in environment
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    const fallback = generateSmartDiveFallback(text);
    return res.status(200).json(fallback);
  }

  // 4. Gemini AI Depth Analysis
  try {
    const ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'blub-ocean-journal',
        },
      },
    });

    const prompt = `You are the emotional depth analyzer for "Blub", an ocean day journal app.
Analyze the user's journal entry to assign their ocean depth zone based solely on their written text.

CRITICAL INSTRUCTION - WRITTEN TEXT IS 100% AUTHORITATIVE:
- Determine the zone, score, and themes strictly from the user's WRITTEN JOURNAL TEXT.
- If the user writes about a hard, painful, exhausting, or bad day (e.g. "my day was the worst", "terrible day", "everything sucks", "I feel awful", "so stressed and tired", "lonely and overwhelmed"), you MUST classify them into TRENCH (106-140m) or ABYSS (76-105m)!
- Never assign Sunlight, Twilight, or Midnight to an entry expressing clear sadness, anger, exhaustion, pain, or suffering!

Zone classification criteria:
1. "trench" (Heavy 😞, depth 106-140m, score -0.75 to -1.0):
   - Worst days, deeply exhausting, devastating, painful, despairing, heavy, unbearable, traumatic, overwhelmed to tears.
   - Examples: "my day was the worst", "terrible day", "I can't do this anymore", "cried all day", "everything fell apart".

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

User's journal text: "${text}"

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
          return res.status(200).json({ ...parsed, usedFallback: false });
        }
      } catch (err: any) {
        console.warn(`[AI] Model ${modelName} unavailable, attempting next candidate or fallback.`);
      }
    }
  } catch (err: any) {
    console.warn('[AI] Error in Gemini initialization/execution:', err?.message);
  }

  // Graceful offline fallback
  const fallback = generateSmartDiveFallback(text);
  return res.status(200).json(fallback);
}
