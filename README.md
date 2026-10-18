# 🫧 Blub

Blub turns a short note about your day into a dive. Pick a mood or write or speak a few words, and Blub takes you to the part of the sea that matches how you feel, where you meet a creature, hear a soundscape, and get a gentle whisper back. Hard days go deeper, and they earn more points for showing up.

Built for **Technica 2026** by Aaniya Dahiya and Aaishi Pranav.

## Why we built it

Most journaling apps feel like homework, and they feel worst on the days you need them most. Blub flips that: there are no streaks to lose and no guilt, just a calm place to check in, and tough days are rewarded instead of punished.

## Powered by

- **Gemini API:** reads your log to pick your zone, finds themes, checks for signs someone may need support, and writes Blub's whispers
- **ElevenLabs:** gives Blub a voice, so whispers and chart summaries can be read aloud

## How it works

1. **Log your day** in one of two ways:
   - **Write or speak:** type or dictate, and the **Gemini API** reads your entry and picks the zone.
   - **Quick mood:** one tap on Bright, Warm, Even, Down, or Heavy, for low-energy days.
2. **Dive into a zone.** Each mood maps to a part of the ocean, with its own look, sound, and creatures:

   | Mood | Zone | Feel |
   |---|---|---|
   | 😄 Bright | Sunlight | Sun rays, coral, dolphins, turtles, colorful fish |
   | 🙂 Warm | Twilight | Dimmer light, quieter fish, sharks |
   | 😐 Even | Midnight | Deep blue, jellyfish, anglerfish, bioluminescence |
   | 🙁 Down | Abyss | Dark water, sharks, eels |
   | 😞 Heavy | Trench | A dark, quiet seabed with coral, octopus, and squid |

3. **Meet a creature.** Every dive releases one creature, collected in your Field Guide (15 to find).
4. **Get a whisper.** The Gemini API writes a short, kind line that floats in the middle of the sea, and **ElevenLabs** can read it aloud in Blub's voice.
5. **Try an optional challenge.** After a dive, one gentle, skippable challenge appears based on your zone. Completing one earns **sand dollars**.
6. **Dress your merperson.** Choose a mermaid or merman, customize it, and spend sand dollars on accessories.
7. **See your week.** A dive profile chart shows your week as depth over time, with a plain-language summary.

## The challenges

| Zone | Challenge |
|---|---|
| Bright | **Message in a Bottle:** record or write a note to your future self. It stays on your device. |
| Warm | **Catch the Crab:** a playful tap (or voice) game |
| Even | **Tomorrow's Goal:** set one small goal and check in the next day |
| Down | **Bubble Rise:** guide a bubble up through all five zones |
| Heavy | **Little Gift:** a bottle from your past self drifts back to you, then you feed a baby seahorse |

Points come from logging dives. Sand dollars come only from challenges. Skipping a challenge never costs anything.

## Design principles

- **No punishment.** No streaks, no lost progress, no guilt language, and every challenge has a Skip button.
- **Safety first.** If a dive suggests someone may be in crisis, Blub shows no game elements, only a calm screen with the 988 Suicide & Crisis Lifeline (US) and a "Talk to a person" option.
- **Accessibility.** Voice input, one-tap mood logging, keyboard support, screen-reader announcements, colorblind-safe design, and `prefers-reduced-motion` support.
- **Privacy.** Dives, bottles, goals, and your avatar are saved in your own browser (localStorage and IndexedDB). Text you submit for analysis is sent to the Gemini API, and whispers read aloud are sent to ElevenLabs to generate the voice. A "Delete my data" button clears everything stored on your device.

> **Blub is a reflection tool, not therapy or medical advice.** If you're struggling, please reach out to someone you trust or a professional. In the US you can call or text **988**.

## Tech stack

- **Frontend:** React, TypeScript, Vite 
- **Server:** Node (`tsx server.ts`)
- **AI:** Google Gemini API for mood analysis, themes, safety checks, and whispers
- **Voice:** ElevenLabs text-to-speech for Blub's narrator voice, and the browser Web Speech API for dictation
- **Audio:** Tone.js and the Web Audio API for zone soundscapes and sound effects. ElevenLabs Music for background music.
- **Storage:** localStorage and IndexedDB

## Getting started

```bash
# 1. Clone the repo
git clone [repo url]
cd [repo folder]

# 2. Install dependencies
npm install

# 3. Add your API keys
cp .env.example .env
# then edit .env and add:
#   GEMINI_API_KEY=your_key_here
#   ELEVENLABS_API_KEY=your_key_here

# 4. Run it
npm run dev
```

## Project structure

```
src/
  challenges/     one file per challenge + index.js (card UI, sand dollars, Skip)
  lib/            shared helpers (speech, etc.)
  ...
server.ts         dev server
```

## What's next

- Dive buddy mode
- Pattern spotting across your themes
- Monthly expedition report
- Seabed decorations
- Weekly missions

## Team

Aaniya Dahiya, Aaishi Pranav
