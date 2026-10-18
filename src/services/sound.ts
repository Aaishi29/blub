import { DepthZone } from '../types';

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private currentZone: DepthZone = 'sunlight';

  // Ambient nodes
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private isInitialized = false;

  private initContext() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      // Create brown/pink noise buffer for ocean wash
      const bufferSize = this.ctx.sampleRate * 4;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise filter
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 2.5; // Gain compensation
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(500, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(1.5, this.ctx.currentTime);

      this.noiseNode.connect(this.filterNode);
      this.filterNode.connect(this.ambientGain);
      this.noiseNode.start();

      // Soft melodic submarine harmonic drones
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.droneOsc1.type = 'sine';
      this.droneOsc2.type = 'triangle';
      this.droneOsc1.frequency.setValueAtTime(110, this.ctx.currentTime); // A2
      this.droneOsc2.frequency.setValueAtTime(165, this.ctx.currentTime); // E3

      this.droneOsc1.connect(this.droneGain);
      this.droneOsc2.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.droneOsc1.start();
      this.droneOsc2.start();

      this.updateZoneAmbience(this.currentZone);
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio not available or failed to initialize:', e);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!muted) {
      this.initContext();
    }
    if (this.ctx && this.masterGain) {
      const targetGain = muted ? 0 : 0.65;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.4);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Support for ElevenLabs or custom recorded zone music tracks with timestamp looping
  private zoneMusicTracks: Partial<
    Record<
      DepthZone,
      {
        urls: string[];
        startTime?: number;
        endTime?: number;
      }
    >
  > = {};
  private currentMusicAudio: HTMLAudioElement | null = null;
  private activeZone: DepthZone | null = null;
  private isMusicEnabled: boolean = false;
  private loopCheckTimer: number | null = null;
  private playToken: number = 0;

  public setMusicTrack(
    zone: DepthZone,
    urlOrConfig:
      | string
      | string[]
      | { url?: string | string[]; urls?: string[]; startTime?: number; endTime?: number },
    startTime?: number,
    endTime?: number
  ) {
    let urls: string[] = [];
    let start = startTime;
    let end = endTime;

    if (typeof urlOrConfig === 'string') {
      urls = [urlOrConfig];
    } else if (Array.isArray(urlOrConfig)) {
      urls = urlOrConfig;
    } else if (typeof urlOrConfig === 'object' && urlOrConfig !== null) {
      if (Array.isArray(urlOrConfig.urls)) {
        urls = urlOrConfig.urls;
      } else if (Array.isArray(urlOrConfig.url)) {
        urls = urlOrConfig.url;
      } else if (typeof urlOrConfig.url === 'string') {
        urls = [urlOrConfig.url];
      }
      if (urlOrConfig.startTime !== undefined) start = urlOrConfig.startTime;
      if (urlOrConfig.endTime !== undefined) end = urlOrConfig.endTime;
    }

    this.zoneMusicTracks[zone] = {
      urls,
      startTime: start,
      endTime: end,
    };

    if (this.currentZone === zone && this.isMusicEnabled) {
      this.playZoneMusic(zone);
    }
  }

  public setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
    if (enabled) {
      this.initContext();
      this.playZoneMusic(this.currentZone);
    } else {
      this.stopZoneMusic();
    }
  }

  public getMusicEnabled(): boolean {
    return this.isMusicEnabled;
  }

  private playZoneMusic(zone: DepthZone) {
    if (!this.isMusicEnabled) return;

    const config = this.zoneMusicTracks[zone];
    if (!config || !config.urls || config.urls.length === 0) {
      return;
    }

    // Don't re-trigger if already actively playing this zone
    if (this.activeZone === zone && this.currentMusicAudio && !this.currentMusicAudio.paused) {
      return;
    }

    const { urls, startTime = 0, endTime } = config;
    const token = ++this.playToken;
    this.activeZone = zone;

    const attachLoopListener = (audio: HTMLAudioElement) => {
      if (this.loopCheckTimer) {
        clearInterval(this.loopCheckTimer);
        this.loopCheckTimer = null;
      }

      const checkLoop = () => {
        if (this.playToken !== token || !this.currentMusicAudio || this.currentMusicAudio !== audio) {
          if (this.loopCheckTimer) {
            clearInterval(this.loopCheckTimer);
            this.loopCheckTimer = null;
          }
          return;
        }

        if (endTime !== undefined && audio.currentTime >= endTime) {
          audio.currentTime = startTime;
        }
      };

      audio.ontimeupdate = checkLoop;
      this.loopCheckTimer = window.setInterval(checkLoop, 35);
    };

    // If audio is already playing from the same source file (e.g. Bright <-> Warm, or Even <-> Down),
    // perform a seamless micro-crossfade without restarting or overlapping
    const currentSrc = this.currentMusicAudio?.src || '';
    const matchesCurrent = urls.some((u) => currentSrc.endsWith(u) || currentSrc.includes(u));

    if (this.currentMusicAudio && matchesCurrent && !this.currentMusicAudio.paused) {
      const audio = this.currentMusicAudio;
      attachLoopListener(audio);

      const targetVol = 0.45;
      let v = audio.volume;
      const fadeDown = setInterval(() => {
        if (this.playToken !== token) {
          clearInterval(fadeDown);
          return;
        }
        v -= 0.08;
        if (v <= 0.06) {
          clearInterval(fadeDown);
          audio.currentTime = startTime;
          let upV = 0.06;
          const fadeUp = setInterval(() => {
            if (this.playToken !== token) {
              clearInterval(fadeUp);
              return;
            }
            upV += 0.06;
            if (upV >= targetVol) {
              audio.volume = targetVol;
              clearInterval(fadeUp);
            } else {
              audio.volume = upV;
            }
          }, 25);
        } else {
          audio.volume = v;
        }
      }, 25);
      return;
    }

    // Switching to a DIFFERENT track: fade out & stop old audio to guarantee ZERO overlap
    if (this.currentMusicAudio) {
      const retiringAudio = this.currentMusicAudio;
      this.currentMusicAudio = null;
      retiringAudio.ontimeupdate = null;

      let retiringVol = retiringAudio.volume;
      const fadeOutTimer = setInterval(() => {
        retiringVol -= 0.09;
        if (retiringVol <= 0.03) {
          clearInterval(fadeOutTimer);
          retiringAudio.pause();
          retiringAudio.src = '';
        } else {
          retiringAudio.volume = Math.max(0, retiringVol);
        }
      }, 25);
    }

    if (this.loopCheckTimer) {
      clearInterval(this.loopCheckTimer);
      this.loopCheckTimer = null;
    }

    // Try candidate URLs sequentially
    let candidateIndex = 0;
    const tryNextCandidate = () => {
      if (candidateIndex >= urls.length || this.playToken !== token || !this.isMusicEnabled) {
        return;
      }

      const candidateUrl = urls[candidateIndex++];
      const audio = new Audio();
      audio.preload = 'auto';
      audio.loop = false; // Disable native loop so custom timestamp bounds control it
      audio.volume = 0; // Start at 0 volume for a seamless fade-in

      let hasStarted = false;

      const startPlayback = () => {
        if (hasStarted || this.playToken !== token || !this.isMusicEnabled) return;
        hasStarted = true;

        try {
          if (startTime > 0) {
            audio.currentTime = startTime;
          }
        } catch (e) {
          // ignore seek error
        }

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (this.playToken !== token || !this.isMusicEnabled) {
                audio.pause();
                audio.src = '';
                return;
              }

              // Smooth fade-in to target volume
              const targetVol = 0.45;
              let currentVol = 0;
              const fadeInTimer = setInterval(() => {
                if (this.playToken !== token || !this.isMusicEnabled) {
                  clearInterval(fadeInTimer);
                  audio.pause();
                  return;
                }
                currentVol += 0.05;
                if (currentVol >= targetVol) {
                  audio.volume = targetVol;
                  clearInterval(fadeInTimer);
                } else {
                  audio.volume = currentVol;
                }
              }, 25);

              attachLoopListener(audio);
            })
            .catch(() => {
              // Browser autoplay policy or load abort
            });
        }
      };

      audio.addEventListener('loadedmetadata', () => {
        try {
          if (startTime > 0) {
            audio.currentTime = startTime;
          }
        } catch (e) {}
      });

      audio.addEventListener('canplay', startPlayback);

      audio.onerror = () => {
        audio.removeEventListener('canplay', startPlayback);
        if (this.currentMusicAudio === audio) {
          this.currentMusicAudio = null;
        }
        if (this.playToken === token) {
          tryNextCandidate();
        }
      };

      this.currentMusicAudio = audio;
      audio.src = candidateUrl;
      audio.load();
    };

    tryNextCandidate();
  }

  private stopZoneMusic() {
    this.playToken++;
    this.activeZone = null;

    if (this.loopCheckTimer) {
      clearInterval(this.loopCheckTimer);
      this.loopCheckTimer = null;
    }

    if (this.currentMusicAudio) {
      const retiringAudio = this.currentMusicAudio;
      this.currentMusicAudio = null;
      retiringAudio.ontimeupdate = null;

      let vol = retiringAudio.volume;
      const fadeOutTimer = setInterval(() => {
        vol -= 0.09;
        if (vol <= 0.03) {
          clearInterval(fadeOutTimer);
          retiringAudio.pause();
          retiringAudio.src = '';
        } else {
          retiringAudio.volume = Math.max(0, vol);
        }
      }, 25);
    }
  }

  public setZone(zone: DepthZone) {
    const prevZone = this.currentZone;
    this.currentZone = zone;
    if (this.isMusicEnabled && (prevZone !== zone || !this.currentMusicAudio)) {
      this.playZoneMusic(zone);
    }
    if (!this.isInitialized) return;
    this.updateZoneAmbience(zone);
  }

  private updateZoneAmbience(zone: DepthZone) {
    if (!this.ctx || !this.filterNode || !this.droneOsc1 || !this.droneOsc2 || !this.droneGain) return;

    const t = this.ctx.currentTime;
    switch (zone) {
      case 'sunlight':
        // Bright, airy, a little faster
        this.filterNode.frequency.linearRampToValueAtTime(720, t + 1.5);
        this.filterNode.Q.linearRampToValueAtTime(1.1, t + 1.5);
        this.droneOsc1.frequency.linearRampToValueAtTime(220, t + 1.5); // A3
        this.droneOsc2.frequency.linearRampToValueAtTime(330, t + 1.5); // E4
        this.droneGain.gain.linearRampToValueAtTime(0.045, t + 1.5);
        break;

      case 'twilight':
        // Softer and a bit lower
        this.filterNode.frequency.linearRampToValueAtTime(420, t + 1.5);
        this.filterNode.Q.linearRampToValueAtTime(1.6, t + 1.5);
        this.droneOsc1.frequency.linearRampToValueAtTime(146.83, t + 1.5); // D3
        this.droneOsc2.frequency.linearRampToValueAtTime(220, t + 1.5); // A3
        this.droneGain.gain.linearRampToValueAtTime(0.065, t + 1.5);
        break;

      case 'midnight':
        // Deeper, slow, floaty
        this.filterNode.frequency.linearRampToValueAtTime(240, t + 1.5);
        this.filterNode.Q.linearRampToValueAtTime(2.1, t + 1.5);
        this.droneOsc1.frequency.linearRampToValueAtTime(98, t + 1.5); // G2
        this.droneOsc2.frequency.linearRampToValueAtTime(146.83, t + 1.5); // D3
        this.droneGain.gain.linearRampToValueAtTime(0.09, t + 1.5);
        break;

      case 'abyss':
        // Deep, slow, resonant hum, comforting
        this.filterNode.frequency.linearRampToValueAtTime(140, t + 1.5);
        this.filterNode.Q.linearRampToValueAtTime(2.5, t + 1.5);
        this.droneOsc1.frequency.linearRampToValueAtTime(65.4, t + 1.5); // C2
        this.droneOsc2.frequency.linearRampToValueAtTime(98, t + 1.5); // G2
        this.droneGain.gain.linearRampToValueAtTime(0.11, t + 1.5);
        break;

      case 'trench':
        // Lowest octave, soft muffled heartbeat-like pulse, warm and holding
        this.filterNode.frequency.linearRampToValueAtTime(80, t + 1.5);
        this.filterNode.Q.linearRampToValueAtTime(2.9, t + 1.5);
        this.droneOsc1.frequency.linearRampToValueAtTime(45, t + 1.5); // F#1
        this.droneOsc2.frequency.linearRampToValueAtTime(67.5, t + 1.5); // C#2
        this.droneGain.gain.linearRampToValueAtTime(0.13, t + 1.5);
        break;
    }
  }

  // Cute "blub" sound effect for creature appearances or interactions
  public playBlub() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Charming pitch sweep up
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.1);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      // Ignore audio error
    }
  }

  // Happy creature wiggle chirp
  public playWiggle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.linearRampToValueAtTime(820, now + 0.06);
      osc.frequency.linearRampToValueAtTime(680, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {
      // Ignore
    }
  }

  // Splash / deep descent chime
  public playDescentChime(depth: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = Math.max(120, 600 - depth * 3.5);

      [0, 0.08, 0.16].forEach((delay, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const freq = baseFreq * (1 + idx * 0.25);
        osc.frequency.setValueAtTime(freq, now + delay);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.95, now + delay + 0.4);

        gain.gain.setValueAtTime(0.12, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.5);
      });
    } catch (e) {
      // Ignore
    }
  }

  // Shimmering sparkle sound when equipping or buying accessories
  public playSparkle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.06, 0.12, 0.18].forEach((delay, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const freqs = [784, 988, 1175, 1568]; // G5, B5, D6, G6
        osc.frequency.setValueAtTime(freqs[idx], now + delay);

        gain.gain.setValueAtTime(0.12, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.3);
      });
    } catch (e) {
      // Ignore
    }
  }

  // Gentle cork pop sound for sealing Message in a Bottle
  public playCorkPop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.09);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {
      // Ignore
    }
  }

  // Cute playful giggle when catching the crab
  public playCrabGiggle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // 3 bubbly ascending/descending chirps
      [0, 0.08, 0.16, 0.24].forEach((delay, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const base = i % 2 === 0 ? 620 : 840;
        osc.frequency.setValueAtTime(base, now + delay);
        osc.frequency.exponentialRampToValueAtTime(base * 1.3, now + delay + 0.05);

        gain.gain.setValueAtTime(0.16, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.07);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.08);
      });
    } catch (e) {
      // Ignore
    }
  }

  // Proximity chime for low-vision accessibility (louder/higher pitch when close to crab)
  private lastChimeTime = 0;
  public playProximityChime(proximityRatio: number) {
    if (this.isMuted) return;
    const nowMs = performance.now();
    // Throttle chimes based on proximity (faster repeat when closer)
    const interval = Math.max(90, 450 - proximityRatio * 320);
    if (nowMs - this.lastChimeTime < interval) return;
    this.lastChimeTime = nowMs;

    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Pitch sweeps from 340Hz up to 920Hz based on closeness
      const freq = 340 + proximityRatio * 580;
      osc.frequency.setValueAtTime(freq, now);

      const vol = 0.04 + proximityRatio * 0.16;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      // Ignore
    }
  }

  // Soft celebratory chime for Tomorrow's Goal completion
  public playStarfishChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.14, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.5);
      });
    } catch (e) {
      // Ignore
    }
  }

  // Soft bubble pop sound
  public playBubblePop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.07);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      // Ignore
    }
  }

  // Gentle nom sound for feeding the seahorse
  public playSeahorseNom() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.09);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      // Ignore
    }
  }
}

export const soundManager = new SoundManager();
