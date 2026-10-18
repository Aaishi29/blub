import { checkRateLimit, getClientIp } from './_shared';

// Maximum allowed input text length for narration (characters)
const MAX_NARRATION_LENGTH = 1000;
// Per-IP rate limit: max 40 narration requests per 60 seconds
const RATE_LIMIT_MAX = 40;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

// In-memory cache for audio base64 data URLs: text -> base64 Data URL
const ttsCache = new Map<string, string>();

// Free premade conversational voices supported on ElevenLabs
const FREE_PREMADE_VOICE_IDS = [
  'EXAVITQu4vr4xnSDxMaL', // Sarah - Casual, Warm & Conversational
  'cgSgspJ2msm6clMCkdW9', // Jessica - Natural, Expressive & Conversational
  'FGY2WhTYpPnrIDTdsKH5', // Laura - Friendly, Natural & Warm
  'Xb7hH8MSUJpSbSDYk0k2', // Alice - Approachable & Clear
];

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
      error: 'Too many narration requests. Please wait a moment before trying again.',
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

  const text = typeof body?.text === 'string' ? body.text.trim() : '';

  if (!text) {
    return res.status(400).json({ error: 'Text parameter is required' });
  }

  if (text.length > MAX_NARRATION_LENGTH) {
    return res.status(400).json({
      error: `Text exceeds maximum allowed length of ${MAX_NARRATION_LENGTH} characters.`,
    });
  }

  // 3. Check in-memory audio cache
  const cachedAudio = ttsCache.get(text);
  if (cachedAudio) {
    return res.status(200).json({ audioData: cachedAudio, cached: true });
  }

  // 4. Check for ElevenLabs API key in environment
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ audioData: null, note: 'No ElevenLabs API key configured' });
  }

  // Candidate voices: custom user voice if set, followed by free premade voices
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
              stability: 0.45,
              similarity_boost: 0.85,
              style: 0.22,
              use_speaker_boost: false,
            },
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 402 || response.status === 400) {
          continue; // Try next voice candidate
        }
        return res.status(200).json({ audioData: null, note: 'ElevenLabs generation skipped' });
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const audioDataUrl = `data:audio/mp3;base64,${base64}`;

      ttsCache.set(text, audioDataUrl);
      return res.status(200).json({ audioData: audioDataUrl, cached: false });
    } catch {
      // Continue to next candidate
    }
  }

  return res.status(200).json({ audioData: null, note: 'ElevenLabs voice unavailable' });
}
