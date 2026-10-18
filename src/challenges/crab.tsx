import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../services/sound';
import { SandDollarIcon } from '../components/SandDollarIcon';
import { Sparkles, Mic, MicOff, Volume2, X, Trophy } from 'lucide-react';
import {
  isSpeechSupported,
  startListening as startSharedSpeech,
  stopListening as stopSharedSpeech,
} from '../lib/speech';

interface Props {
  onComplete: (sandDollarsEarned: number) => void;
  onClose: () => void;
}

export const CrabChallenge: React.FC<Props> = ({ onComplete, onClose }) => {
  // Crab position in percentage (0 - 100) inside sandbar arena
  const [crabX, setCrabX] = useState(50);
  const [crabY, setCrabY] = useState(55);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = right, -1 = left
  const [isWiggling, setIsWiggling] = useState(false);
  const [isCaught, setIsCaught] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const speedRef = useRef(0.45);
  const targetXRef = useRef(50);
  const pauseTimerRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const arenaRef = useRef<HTMLDivElement | null>(null);

  // Clean up voice recognizer on unmount
  useEffect(() => {
    return () => {
      stopSharedSpeech();
    };
  }, []);

  // Catch Crab function
  const handleCatch = useCallback(() => {
    if (isCaught) return;
    setIsCaught(true);
    stopSharedSpeech();
    setIsVoiceActive(false);

    soundManager.playCrabGiggle();
    soundManager.playSparkle();

    setTimeout(() => {
      onComplete(3);
    }, 2200);
  }, [isCaught, onComplete]);

  // Push-to-talk toggle for voice catch command
  const toggleVoiceCatch = () => {
    if (isCaught) return;
    setVoiceNotice(null);

    if (!isSpeechSupported()) {
      setVoiceNotice('Voice not supported in this browser. Tap the crab or press Space!');
      return;
    }

    if (isVoiceActive) {
      stopSharedSpeech();
      setIsVoiceActive(false);
    } else {
      const started = startSharedSpeech(
        'crab-voice-catch',
        {
          onFinal: (transcript) => {
            checkCatchVoice(transcript);
          },
          onInterim: (transcript) => {
            checkCatchVoice(transcript);
          },
          onError: (errMsg) => {
            setVoiceNotice(errMsg);
            setIsVoiceActive(false);
          },
          onStateChange: (listening) => {
            setIsVoiceActive(listening);
          },
        },
        true // continuous while listening
      );

      if (!started) {
        setIsVoiceActive(false);
      }
    }
  };

  // Check recognized speech for "catch" or near misses ("cat", "patch", "match")
  const checkCatchVoice = (text: string) => {
    if (isCaught) return;
    const lower = (text || '').toLowerCase();
    const hasCatch = /\b(catch|cat|patch|match|gotcha|grab)\b/i.test(lower) || lower.includes('catch');
    if (hasCatch) {
      handleCatch();
    }
  };

  // Spacebar key accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleCatch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCatch]);

  // Fast Scuttle Movement Loop
  useEffect(() => {
    if (isCaught) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.66, 2);
      lastTime = time;

      if (pauseTimerRef.current > 0) {
        pauseTimerRef.current -= dt;
      } else {
        setCrabX((prev) => {
          let next = prev + direction * speedRef.current * dt;

          // Bounce off sandbar sides with slight random pause
          if (next >= 85) {
            next = 85;
            setDirection(-1);
            if (Math.random() < 0.3) pauseTimerRef.current = 15 + Math.random() * 20;
          } else if (next <= 15) {
            next = 15;
            setDirection(1);
            if (Math.random() < 0.3) pauseTimerRef.current = 15 + Math.random() * 20;
          } else if (Math.random() < 0.015) {
            // Random direction flip or quick pause
            setDirection((d) => (d === 1 ? -1 : 1));
            pauseTimerRef.current = 10 + Math.random() * 15;
          }

          // Ease speed back down to baseline
          if (speedRef.current > 0.45) {
            speedRef.current = Math.max(0.45, speedRef.current - 0.005 * dt);
          }

          return next;
        });

        // Gentle sinusoidal sandbar depth undulation
        setCrabY(52 + Math.sin(time / 280) * 4);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [direction, isCaught]);

  // Near miss handler: clicking arena without hitting crab
  const handleArenaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isCaught) return;
    soundManager.playWiggle();
    setIsWiggling(true);
    // Crab accelerates slightly after near miss, then eases back
    speedRef.current = 0.95;
    setTimeout(() => setIsWiggling(false), 600);
  };

  // Pointer move proximity chime for low-vision accessibility
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isCaught || !arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;

    const dx = mouseX - crabX;
    const dy = mouseY - crabY;
    const dist = Math.hypot(dx, dy); // distance in percentage (0 to ~100)

    if (dist < 35) {
      const proximityRatio = Math.max(0, 1 - dist / 35);
      soundManager.playProximityChime(proximityRatio);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-gradient-to-b from-amber-950/90 via-sky-950/90 to-slate-950/95 border border-amber-400/40 text-white shadow-2xl overflow-hidden flex flex-col p-5 sm:p-7">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xl">🦀</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-200">
                Catch the Crab
              </h3>
              <p className="text-[11px] text-amber-300/80 font-medium">
                Warm Zone Sandbar • Earn 3 Sand Dollars
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            aria-label="Skip Challenge"
          >
            <X size={18} />
          </button>
        </div>

        {/* Challenge Instructions & Accessibility Indicators */}
        <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-100/80">
          <span>Tap or click the speedy crab to catch it!</span>
          <div className="flex items-center gap-2 text-[11px]">
            {/* Clear Push-to-Talk Toggle */}
            <button
              type="button"
              onClick={toggleVoiceCatch}
              disabled={isCaught}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all shadow-sm ${
                isVoiceActive
                  ? 'bg-rose-500 text-white animate-pulse ring-2 ring-rose-400'
                  : 'bg-white/15 hover:bg-white/25 text-cyan-200 border border-white/20'
              } ${isCaught ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
              title={isVoiceActive ? 'Listening... say "catch"! Tap to stop' : 'Tap to enable voice catch'}
              aria-label={isVoiceActive ? 'Voice active. Say catch or tap to stop' : 'Enable voice command catch'}
            >
              {isVoiceActive ? (
                <>
                  <MicOff size={12} />
                  <span>Listening... say catch</span>
                </>
              ) : (
                <>
                  <Mic size={12} />
                  <span>Say "Catch"</span>
                </>
              )}
            </button>
            <span className="hidden sm:inline bg-white/10 px-2 py-1 rounded-md text-white/60 text-[10px]">
              [Space] key
            </span>
          </div>
        </div>

        {voiceNotice && (
          <div className="text-[11px] text-amber-200 bg-black/40 px-3 py-1 rounded-xl border border-amber-300/30 flex justify-between items-center mb-1">
            <span>{voiceNotice}</span>
            <button
              type="button"
              onClick={() => setVoiceNotice(null)}
              className="ml-2 text-amber-300 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Sandbar Interactive Arena */}
        <div
          ref={arenaRef}
          onClick={handleArenaClick}
          onMouseMove={handleMouseMove}
          className="relative w-full h-64 sm:h-72 rounded-3xl overflow-hidden cursor-crosshair select-none border-2 border-amber-300/30 shadow-inner"
          style={{
            background: 'linear-gradient(180deg, #38BDF8 0%, #2DD4BF 35%, #FDE047 80%, #F59E0B 100%)',
          }}
        >
          {/* Sunny Water Ripples & Shells on Sandbar */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-4 left-8 text-lg">🐚</div>
            <div className="absolute top-10 right-14 text-sm">🪸</div>
            <div className="absolute bottom-5 left-1/4 text-sm">⭐</div>
            <div className="absolute bottom-6 right-1/3 text-base">🐚</div>
          </div>

          {/* Victory Bubble Burst on Catch */}
          {isCaught ? (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none animate-bubble-burst z-20"
              style={{ left: `${crabX}%`, top: `${crabY}%` }}
            >
              <div className="w-24 h-24 rounded-full bg-cyan-300/40 border-2 border-white backdrop-blur-sm flex items-center justify-center shadow-2xl">
                <span className="text-3xl animate-bounce">🫧</span>
              </div>
              <span className="mt-2 text-sm font-black text-amber-200 drop-shadow-md">
                Gotcha! ✨
              </span>
            </div>
          ) : (
            /* Speedy Scuttling Crab (Large hit target for easy tapping) */
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleCatch();
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 p-3 cursor-pointer transition-transform duration-100 ${
                isWiggling ? 'scale-115 rotate-12' : 'hover:scale-110 active:scale-95'
              }`}
              style={{
                left: `${crabX}%`,
                top: `${crabY}%`,
                transform: `translate(-50%, -50%) scaleX(${direction})`,
              }}
              role="button"
              tabIndex={0}
              aria-label="Catchable Crab. Tap or press space to catch."
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCatch();
                }
              }}
            >
              {/* Cute Stylized Sand Crab SVG */}
              <svg viewBox="0 0 60 45" width="56" height="42" className="drop-shadow-md overflow-visible">
                {/* 6 Scuttling Crab Legs */}
                <g stroke="#BE123C" strokeWidth="2.2" strokeLinecap="round" fill="none">
                  {/* Left legs */}
                  <path d="M 18 24 Q 10 26 8 34" className={direction === -1 ? 'animate-pulse' : ''} />
                  <path d="M 18 28 Q 12 32 11 38" />
                  <path d="M 19 32 Q 14 36 15 42" />

                  {/* Right legs */}
                  <path d="M 42 24 Q 50 26 52 34" className={direction === 1 ? 'animate-pulse' : ''} />
                  <path d="M 42 28 Q 48 32 49 38" />
                  <path d="M 41 32 Q 46 36 45 42" />
                </g>

                {/* Crab Shell Body */}
                <ellipse cx="30" cy="28" rx="14" ry="10" fill="#FB7185" stroke="#E11D48" strokeWidth="1.6" />
                <ellipse cx="30" cy="27" rx="11" ry="7" fill="#F43F5E" />

                {/* Shell Highlight */}
                <path d="M 23 24 Q 30 20 37 24" stroke="#FFE4E6" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.8" />

                {/* Waving Claws (Arms) */}
                <g fill="#FB7185" stroke="#E11D48" strokeWidth="1.4">
                  {/* Left Claw */}
                  <path d="M 17 24 Q 10 16 7 12 C 4 9 9 6 12 10 Q 15 16 19 22 Z" />
                  <circle cx="8" cy="9" r="2.5" fill="#FDA4AF" />

                  {/* Right Claw */}
                  <path d="M 43 24 Q 50 16 53 12 C 56 9 51 6 48 10 Q 45 16 41 22 Z" />
                  <circle cx="52" cy="9" r="2.5" fill="#FDA4AF" />
                </g>

                {/* Cute Big Googly Eyes */}
                <g fill="#FFFFFF" stroke="#BE123C" strokeWidth="0.8">
                  <ellipse cx="25" cy="18" rx="3.5" ry="4" />
                  <ellipse cx="35" cy="18" rx="3.5" ry="4" />
                </g>
                <circle cx="26" cy="18" r="1.8" fill="#1E293B" />
                <circle cx="27" cy="17" r="0.6" fill="#FFFFFF" />
                <circle cx="34" cy="18" r="1.8" fill="#1E293B" />
                <circle cx="35" cy="17" r="0.6" fill="#FFFFFF" />

                {/* Sweet Rosy Cheeks */}
                <circle cx="21" cy="29" r="1.6" fill="#FDA4AF" opacity="0.6" />
                <circle cx="39" cy="29" r="1.6" fill="#FDA4AF" opacity="0.6" />

                {/* Tiny Smile */}
                <path d="M 27 30 Q 30 32.5 33 30" stroke="#881337" strokeWidth="1" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex items-center justify-between text-xs">
          <span className="text-white/60">
            {isCaught ? 'Victory dance complete!' : 'No timer • Enjoy the sunshine!'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white px-3 py-1.5 transition-colors font-medium"
            >
              Skip
            </button>
            {isCaught && (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-950 font-bold shadow-md animate-pulse">
                <SandDollarIcon size={15} />
                <span>+3 Sand Dollars</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
