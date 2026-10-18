import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  getNextBottleToDeliver,
  markBottleReceived,
  saveBottleMessage,
  BLUB_SEEDED_MESSAGES,
  BottleMessage,
} from '../services/bottleStorage';
import { soundManager } from '../services/sound';
import { narrateText } from '../services/api';
import { SandDollarIcon } from '../components/SandDollarIcon';
import {
  X,
  Volume2,
  Heart,
  Sparkles,
  PhoneCall,
  Play,
  Pause,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (sandDollars: number) => void;
  needs_support?: boolean;
}

interface PlanktonItem {
  id: number;
  name: string;
  color: string;
  glowColor: string;
  baseX: number; // percentage in arena (pile area)
  baseY: number;
  isEaten: boolean;
  isGliding: boolean;
}

const INITIAL_PLANKTON: PlanktonItem[] = [
  { id: 1, name: 'Coral Spark', color: '#FDA4AF', glowColor: '#FB7185', baseX: 68, baseY: 64, isEaten: false, isGliding: false },
  { id: 2, name: 'Sun Mote', color: '#FDE047', glowColor: '#F59E0B', baseX: 79, baseY: 66, isEaten: false, isGliding: false },
  { id: 3, name: 'Seafoam Dot', color: '#86EFAC', glowColor: '#22C55E', baseX: 73, baseY: 73, isEaten: false, isGliding: false },
  { id: 4, name: 'Moon Mist', color: '#D8B4FE', glowColor: '#A855F7', baseX: 82, baseY: 75, isEaten: false, isGliding: false },
  { id: 5, name: 'Aqua Bead', color: '#7DD3FC', glowColor: '#0EA5E9', baseX: 75, baseY: 81, isEaten: false, isGliding: false },
];

export const GiftChallenge: React.FC<Props> = ({
  isOpen,
  onClose,
  onComplete,
  needs_support = false,
}) => {
  // Steps: 'bottle_incoming' | 'bottle_opened' | 'leave_bottle_prompt' | 'seahorse' | 'complete'
  const [step, setStep] = useState<
    'bottle_incoming' | 'bottle_opened' | 'leave_bottle_prompt' | 'seahorse' | 'complete'
  >('bottle_incoming');

  // Support / Hotlines modal
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Delivered bottle data
  const [deliveredBottle, setDeliveredBottle] = useState<BottleMessage | null>(null);
  const [isFromBlub, setIsFromBlub] = useState(false);
  const [blubMessage, setBlubMessage] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Leave bottle add-on state
  const [leaveText, setLeaveText] = useState('');

  // Drag-and-feed Seahorse state
  const [planktonList, setPlanktonList] = useState<PlanktonItem[]>(INITIAL_PLANKTON);
  const [activeDragId, setActiveDragId] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [isSeahorseAnticipating, setIsSeahorseAnticipating] = useState(false);
  const [isGulping, setIsGulping] = useState(false);
  const [isSeahorseDancing, setIsSeahorseDancing] = useState(false);
  const [seahorseRotation, setSeahorseRotation] = useState(0);
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const arenaRef = useRef<HTMLDivElement | null>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Load bottle and reset states on open
  useEffect(() => {
    if (!isOpen) return;

    setStep('bottle_incoming');
    setPlanktonList(INITIAL_PLANKTON);
    setActiveDragId(null);
    setDragPos(null);
    setIsSeahorseAnticipating(false);
    setIsGulping(false);
    setIsSeahorseDancing(false);
    setSeahorseRotation(0);
    setBubbles([]);
    setAudioProgress(0);
    setIsPlayingAudio(false);
    setLeaveText('');

    if (needs_support) {
      setShowSupportModal(true);
    }

    getNextBottleToDeliver().then((bottle) => {
      if (bottle) {
        setDeliveredBottle(bottle);
        setIsFromBlub(false);
        if (bottle.type === 'audio' && bottle.audioBlob) {
          const url = URL.createObjectURL(bottle.audioBlob);
          setAudioUrl(url);
        } else {
          setAudioUrl(null);
        }
      } else {
        const randomMsg =
          BLUB_SEEDED_MESSAGES[Math.floor(Math.random() * BLUB_SEEDED_MESSAGES.length)];
        setBlubMessage(randomMsg);
        setIsFromBlub(true);
        setDeliveredBottle(null);
        setAudioUrl(null);
      }
    });

    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [isOpen, needs_support]);

  // Audio player progress listener
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const handleEnded = () => {
      setIsPlayingAudio(false);
      setAudioProgress(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const handleOpenBottle = () => {
    if (deliveredBottle) {
      markBottleReceived(deliveredBottle.id);
    }
    setStep('bottle_opened');
    if (isFromBlub && blubMessage) {
      narrateText(blubMessage);
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleSaveLeaveBottle = async () => {
    if (leaveText.trim()) {
      await saveBottleMessage({
        type: 'text',
        text: leaveText.trim(),
      });
    }
    setStep('seahorse');
  };

  // Eaten count
  const eatenCount = planktonList.filter((p) => p.isEaten).length;

  // Feed a plankton piece to the seahorse
  const feedPlankton = useCallback((planktonId: number) => {
    soundManager.playSeahorseNom();
    setIsGulping(true);
    setIsSeahorseAnticipating(false);

    // Floating bubbles / hearts from mouth
    const newBubbles = Array.from({ length: 4 }).map((_, i) => ({
      id: Date.now() + i,
      x: 36 + (Math.random() - 0.5) * 8,
      y: 44 - Math.random() * 12,
    }));
    setBubbles((prev) => [...prev, ...newBubbles]);

    setTimeout(() => {
      setIsGulping(false);
    }, 450);

    setPlanktonList((prev) => {
      const updated = prev.map((item) =>
        item.id === planktonId ? { ...item, isEaten: true, isGliding: false } : item
      );
      const newEaten = updated.filter((p) => p.isEaten).length;

      if (newEaten === 5) {
        // Trigger completion celebratory dance
        setTimeout(() => {
          celebrateFullSeahorse();
        }, 500);
      }
      return updated;
    });
  }, []);

  // Seahorse fullness victory dance
  const celebrateFullSeahorse = () => {
    soundManager.playStarfishChime();

    if (!prefersReducedMotion) {
      setIsSeahorseDancing(true);
      let angle = 0;
      const interval = setInterval(() => {
        angle += 20;
        setSeahorseRotation(angle);
        if (angle >= 720) {
          clearInterval(interval);
          setStep('complete');
        }
      }, 35);
    } else {
      // Reduced motion: soft glow and gentle pause
      setTimeout(() => {
        setStep('complete');
      }, 1200);
    }
  };

  // Keyboard / Tap Alternative: instantly glides plankton to seahorse mouth
  const handleGlideToFeed = (plankton: PlanktonItem) => {
    if (plankton.isEaten || plankton.isGliding) return;
    setIsSeahorseAnticipating(true);

    setPlanktonList((prev) =>
      prev.map((item) => (item.id === plankton.id ? { ...item, isGliding: true } : item))
    );

    setTimeout(() => {
      feedPlankton(plankton.id);
    }, 400);
  };

  // Pointer Drag Handlers
  const handlePointerDown = (plankton: PlanktonItem, e: React.PointerEvent) => {
    if (plankton.isEaten || plankton.isGliding) return;
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setActiveDragId(plankton.id);
    if (arenaRef.current) {
      const rect = arenaRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setDragPos({ x, y });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activeDragId === null || !arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    setDragPos({ x, y });

    // Seahorse mouth position is at approx (36%, 44%)
    const distToMouth = Math.hypot(x - 36, y - 44);
    setIsSeahorseAnticipating(distToMouth < 28);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDragId === null) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    if (dragPos) {
      const distToMouth = Math.hypot(dragPos.x - 36, dragPos.y - 44);
      if (distToMouth < 24) {
        // Dropped on seahorse mouth/body!
        feedPlankton(activeDragId);
      }
      // If dropped elsewhere, it floats gently back to pile (dragPos resets to null)
    }

    setActiveDragId(null);
    setDragPos(null);
    setIsSeahorseAnticipating(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col select-none overflow-hidden bg-gradient-to-b from-[#060810] via-[#04060d] to-[#010204] text-slate-100"
      role="dialog"
      aria-label="Little Gift and Feed the Seahorse challenge"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Top Header with Soft Tone, 'Talk to a person' & Skip */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-3">
          {/* Always visible 'Talk to a person' button */}
          <button
            onClick={() => setShowSupportModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 text-xs font-medium backdrop-blur-md transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Talk to a person</span>
          </button>
        </div>

        {/* Skip button with no commentary */}
        <button
          onClick={onClose}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs border border-white/15 backdrop-blur-md transition-all"
        >
          <span>Skip</span>
          <X className="w-3.5 h-3.5 ml-1" />
        </button>
      </header>

      {/* Screen Reader Progress Announcement */}
      <div className="sr-only" aria-live="polite">
        {step === 'seahorse' ? `${eatenCount} of 5 fed` : ''}
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* STEP 1A: Floating Bottle Arriving */}
        {step === 'bottle_incoming' && (
          <div className="flex flex-col items-center max-w-sm space-y-7 animate-fade-in">
            <div className="space-y-2">
              <h3 className="text-xl font-medium text-white font-serif tracking-wide">
                A message in a bottle drifted in.
              </h3>
              <p className="text-sm text-cyan-200/70">
                {isFromBlub ? "There's a quiet thought from Blub inside." : "It's from you."}
              </p>
            </div>

            {/* Bobbing Glass Bottle with Cork */}
            <button
              onClick={handleOpenBottle}
              className="relative p-6 rounded-full group cursor-pointer focus:outline-none transition-transform hover:scale-105 active:scale-95"
              aria-label="Tap to open the drifting bottle message"
            >
              <div className="absolute inset-0 bg-cyan-400/15 rounded-full blur-xl group-hover:bg-cyan-400/25 transition-all animate-pulse" />
              <svg width="110" height="110" viewBox="0 0 100 100" className="drop-shadow-2xl">
                <defs>
                  <linearGradient id="giftGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
                    <stop offset="40%" stopColor="#A5F3FC" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0284C7" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                <path d="M44,14 L56,14 L54,20 L46,20 Z" fill="#D97706" />
                <path
                  d="M45,20 L55,20 L55,28 C55,34 68,40 68,52 L68,76 C68,84 62,88 50,88 C38,88 32,84 32,76 L32,52 C32,40 45,34 45,28 Z"
                  fill="url(#giftGlassGrad)"
                  stroke="#E0F2FE"
                  strokeWidth="1.8"
                />
                <rect x="42" y="44" width="16" height="26" rx="3" fill="#FEF08A" fillOpacity="0.85" />
                <line x1="45" y1="50" x2="55" y2="50" stroke="#B45309" strokeWidth="1.2" />
                <line x1="45" y1="55" x2="55" y2="55" stroke="#B45309" strokeWidth="1.2" />
                <line x1="45" y1="60" x2="52" y2="60" stroke="#B45309" strokeWidth="1.2" />
              </svg>
            </button>

            <button
              onClick={handleOpenBottle}
              className="px-6 py-2.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-200 text-sm font-medium transition-all shadow-sm"
            >
              Open the bottle
            </button>
          </div>
        )}

        {/* STEP 1B: Bottle Opened */}
        {step === 'bottle_opened' && (
          <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-7 space-y-6 backdrop-blur-md shadow-2xl animate-fade-in">
            <div className="space-y-1">
              <span className="text-xs font-medium text-cyan-300/80 tracking-wider uppercase">
                {isFromBlub ? 'A gentle word from Blub' : `You left this on a brighter day`}
              </span>
              {!isFromBlub && deliveredBottle && (
                <p className="text-xs text-white/50">{deliveredBottle.dateStr}</p>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-black/30 border border-white/10 min-h-[100px] flex flex-col items-center justify-center">
              {deliveredBottle?.type === 'audio' && audioUrl ? (
                <div className="w-full space-y-4">
                  <audio ref={audioRef} src={audioUrl} />
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={togglePlayAudio}
                      className="p-4 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 transition-all shadow-md"
                      aria-label={isPlayingAudio ? 'Pause message' : 'Play recorded voice message'}
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full transition-all duration-100"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-base text-slate-100 font-serif leading-relaxed italic text-center px-2">
                  "{deliveredBottle?.text || blubMessage}"
                </p>
              )}
            </div>

            {(!deliveredBottle || deliveredBottle.type === 'text') && (
              <button
                onClick={() => narrateText(deliveredBottle?.text || blubMessage)}
                className="inline-flex items-center gap-2 text-xs text-cyan-300/80 hover:text-cyan-200 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen to Blub read this</span>
              </button>
            )}

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => setStep('leave_bottle_prompt')}
                className="w-full py-3 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-200 text-sm font-medium transition-all"
              >
                Leave one for later?
              </button>
              <button
                onClick={() => setStep('seahorse')}
                className="w-full py-2.5 rounded-2xl text-white/60 hover:text-white text-xs transition-colors"
              >
                Close the bottle
              </button>
            </div>
          </div>
        )}

        {/* OPTIONAL STEP: Leave One For Later */}
        {step === 'leave_bottle_prompt' && (
          <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-7 space-y-5 backdrop-blur-md shadow-2xl animate-fade-in text-left">
            <div>
              <h3 className="text-lg font-medium text-white font-serif">
                Leave a thought for another day
              </h3>
              <p className="text-xs text-white/60 mt-1">
                Even on quiet days, a few words stay safe on your device.
              </p>
            </div>

            <textarea
              value={leaveText}
              onChange={(e) => setLeaveText(e.target.value.slice(0, 280))}
              placeholder="What would you tell yourself on another quiet evening?"
              rows={3}
              className="w-full p-3.5 rounded-xl bg-black/30 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-cyan-400 resize-none"
            />

            <div className="flex items-center justify-between text-xs text-white/40">
              <span>{280 - leaveText.length} characters left</span>
              <span>Only on your device</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep('seahorse')}
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-white/70 hover:text-white text-xs transition-colors text-center"
              >
                Skip
              </button>
              <button
                onClick={handleSaveLeaveBottle}
                disabled={!leaveText.trim()}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-900 font-semibold text-xs transition-all text-center"
              >
                Seal Bottle
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Feed the Seahorse (Rebuilt as Drag & Feed) */}
        {step === 'seahorse' && (
          <div className="flex flex-col items-center justify-center w-full max-w-lg space-y-4 animate-fade-in select-none">
            <div className="space-y-1">
              <h3 className="text-xl font-medium text-white font-serif">
                Feed the baby seahorse
              </h3>
              <p className="text-xs text-cyan-200/70">
                Drag each glowing plankton to the seahorse, or tap to send it over.
              </p>
            </div>

            {/* Fullness Indicator: 5 soft glowing shells / hearts */}
            <div className="flex items-center gap-2.5 py-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                    i < eatenCount
                      ? 'bg-amber-400/30 border border-amber-300/60 scale-110 shadow-sm shadow-amber-400/40 text-amber-200'
                      : 'bg-white/5 border border-white/10 text-white/30'
                  }`}
                  title={`${eatenCount} of 5 fed`}
                >
                  <Heart
                    size={13}
                    className={i < eatenCount ? 'fill-amber-300 text-amber-200' : 'text-white/20'}
                  />
                </div>
              ))}
            </div>

            {/* Interactive Sea Arena */}
            <div
              ref={arenaRef}
              className="relative w-full h-80 rounded-3xl bg-white/5 border border-white/15 shadow-2xl overflow-hidden backdrop-blur-sm"
              style={{
                background: 'radial-gradient(ellipse at 30% 50%, rgba(13, 148, 136, 0.15) 0%, rgba(6, 8, 16, 0.8) 75%)',
              }}
            >
              {/* Plankton Sea-Floor Mound / Rock on the Right */}
              <div className="absolute right-4 bottom-2 w-44 h-24 rounded-full bg-slate-800/40 border border-white/5 blur-[1px] pointer-events-none" />
              <div className="absolute right-12 bottom-7 text-xs text-cyan-200/40 pointer-events-none font-medium">
                plankton pile
              </div>

              {/* Floating Hearts & Bubbles from Mouth */}
              {bubbles.map((b) => (
                <div
                  key={b.id}
                  className="absolute text-cyan-300 pointer-events-none animate-float-up text-xs z-20"
                  style={{ left: `${b.x}%`, top: `${b.y}%` }}
                >
                  <Heart className="w-4 h-4 fill-rose-400/80 text-rose-300" />
                </div>
              ))}

              {/* Baby Seahorse floating on the Left Side (~26% X, 48% Y) */}
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 pointer-events-none z-10"
                style={{
                  left: '28%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${seahorseRotation}deg) scale(${
                    isSeahorseDancing ? 1.25 : 1
                  })`,
                }}
              >
                {/* Seahorse Aura */}
                <div
                  className={`absolute inset-0 rounded-full blur-xl transition-all duration-300 ${
                    isSeahorseAnticipating || isGulping
                      ? 'bg-amber-400/30 scale-125'
                      : 'bg-amber-500/10 scale-100'
                  }`}
                />

                <svg
                  width="115"
                  height="150"
                  viewBox="0 0 100 130"
                  className={`drop-shadow-2xl transition-all duration-300 ${
                    isGulping ? 'scale-105' : 'scale-100'
                  }`}
                >
                  <defs>
                    <linearGradient id="babySeahorseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FDE047" />
                      <stop offset="45%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>

                    {/* Belly Fill Glow based on eatenCount */}
                    <radialGradient id="bellyGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FCD34D" stopOpacity={0.2 + eatenCount * 0.16} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Little Fin fluttering on back */}
                  <path
                    d="M 32 55 C 24 52, 22 62, 30 68 C 24 70, 26 80, 34 78"
                    fill="#FEF08A"
                    fillOpacity="0.8"
                    stroke="#D97706"
                    strokeWidth="1"
                    className="animate-pulse"
                  />

                  {/* Curled Tail */}
                  <path
                    d="M 48 85 C 46 98, 38 108, 46 118 C 52 124, 62 118, 58 110 C 55 104, 46 105, 48 96"
                    fill="none"
                    stroke="url(#babySeahorseGrad)"
                    strokeWidth="6.5"
                    strokeLinecap="round"
                  />

                  {/* Seahorse Body & Crown */}
                  <path
                    d="M 48 22 C 44 18, 40 16, 38 18 C 38 22, 42 24, 40 28 C 34 30, 26 35, 24 40 C 22 44, 26 46, 32 44 C 34 48, 38 55, 42 65 C 45 74, 46 85, 48 88 C 54 84, 56 70, 54 60 C 52 50, 48 42, 48 32 Z"
                    fill="url(#babySeahorseGrad)"
                  />

                  {/* Belly Fill Glow (lights up warmly as seahorse eats) */}
                  <ellipse cx="48" cy="62" rx="7" ry="12" fill="url(#bellyGlow)" />

                  {/* Belly Rib Scutes */}
                  <path
                    d="M 42 50 C 46 51, 48 51, 51 48 M 43 58 C 47 59, 50 59, 53 56 M 44 66 C 48 67, 51 67, 54 64"
                    stroke="#FEF3C7"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />

                  {/* Snout with Animated Mouth (Opens when food is near) */}
                  {isSeahorseAnticipating ? (
                    <g className="transition-all duration-200">
                      {/* Upper jaw tilted up */}
                      <path d="M 24 39 L 14 38 L 16 41 L 24 41 Z" fill="#F59E0B" />
                      {/* Lower jaw tilted down (open mouth!) */}
                      <path d="M 24 43 L 15 46 L 17 48 L 24 45 Z" fill="#D97706" />
                      {/* Mouth cavity glow */}
                      <circle cx="17" cy="43" r="2.5" fill="#BE123C" />
                    </g>
                  ) : (
                    /* Resting closed snout */
                    <path
                      d="M 24 40 L 16 41 C 14 41, 14 44, 16 44 L 24 44 Z"
                      fill="#F59E0B"
                    />
                  )}

                  {/* Big Cute Expressive Eye */}
                  {isGulping ? (
                    /* Happy squint / blink during gulp */
                    <path
                      d="M 28 35 Q 33 31 38 35"
                      stroke="#1E293B"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  ) : (
                    /* Wide innocent round eye */
                    <g>
                      <circle cx="33" cy="34" r="5.2" fill="#1E293B" />
                      <circle cx="31.2" cy="32.5" r="2" fill="#FFFFFF" />
                      <circle cx="34.8" cy="35.2" r="0.9" fill="#FFFFFF" />
                    </g>
                  )}

                  {/* Gentle Rosy Blush */}
                  <circle cx="33" cy="42" r="3.2" fill="#FB7185" fillOpacity="0.65" />
                </svg>
              </div>

              {/* 5 Plankton Items in the Pile */}
              {planktonList.map((p, idx) => {
                if (p.isEaten) return null;

                const isBeingDragged = activeDragId === p.id;
                const posX = isBeingDragged && dragPos ? dragPos.x : p.isGliding ? 36 : p.baseX;
                const posY = isBeingDragged && dragPos ? dragPos.y : p.isGliding ? 44 : p.baseY;

                return (
                  <div
                    key={p.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`Plankton ${idx + 1} of 5. Press Space or Enter, or tap to feed seahorse.`}
                    onPointerDown={(e) => handlePointerDown(p, e)}
                    onClick={() => handleGlideToFeed(p)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleGlideToFeed(p);
                      }
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-cyan-300 rounded-full z-20 ${
                      p.isGliding ? 'transition-all duration-300 ease-in-out' : isBeingDragged ? '' : 'transition-all duration-300'
                    }`}
                    style={{
                      left: `${posX}%`,
                      top: `${posY}%`,
                    }}
                  >
                    {/* Glowing Aura */}
                    <div
                      className="absolute inset-0 rounded-full blur-sm scale-150 animate-pulse pointer-events-none"
                      style={{ backgroundColor: p.glowColor, opacity: 0.7 }}
                    />

                    {/* Cute Round Plankton Dot */}
                    <div
                      className="relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg border border-white/60 active:scale-110 transition-transform"
                      style={{ backgroundColor: p.color }}
                    >
                      {/* Tiny cute eye reflections / sparkle */}
                      <div className="absolute top-1.5 left-2 w-2 h-2 rounded-full bg-white/90" />
                      <div className="absolute top-3.5 left-3.5 w-1 h-1 rounded-full bg-white/70" />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-white/50">
              Drop misses float right back. No timers, no penalties.
            </p>
          </div>
        )}

        {/* STEP 3: Complete & Reward */}
        {step === 'complete' && (
          <div className="flex flex-col items-center max-w-sm space-y-6 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-300 to-rose-400 flex items-center justify-center shadow-lg shadow-amber-400/20">
              <Sparkles className="w-8 h-8 text-slate-900" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white font-serif tracking-wide">
                The little seahorse is full & happy
              </h3>
              <p className="text-sm text-cyan-100/80">
                You took gentle care of yourself and the little ocean creatures today.
              </p>
            </div>

            {/* 3 Sand Dollars Award */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-200">
              <SandDollarIcon className="w-5 h-5 text-amber-300" />
              <span className="font-semibold text-sm">+3 Sand Dollars</span>
            </div>

            <div className="w-full pt-2">
              <button
                onClick={() => onComplete(3)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-300 hover:to-rose-300 text-slate-900 font-semibold shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Support / Hotlines Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-rose-400/30 rounded-3xl p-6 space-y-5 shadow-2xl text-left">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white font-serif">
                  You don't have to carry this alone
                </h3>
                <p className="text-xs text-rose-200/80">
                  Free, confidential support from people who want to listen.
                </p>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* 988 Lifeline */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">988 Suicide & Crisis Lifeline</p>
                  <p className="text-white/50 text-[11px]">Free, confidential, available 24/7 (US & Canada)</p>
                </div>
                <a
                  href="tel:988"
                  className="px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 font-medium"
                >
                  Call or Text 988
                </a>
              </div>

              {/* Crisis Text Line */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Crisis Text Line</p>
                  <p className="text-white/50 text-[11px]">Text HOME to connect with a crisis counselor</p>
                </div>
                <a
                  href="sms:741741&body=HOME"
                  className="px-3 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 font-medium"
                >
                  Text 741741
                </a>
              </div>

              {/* The Trevor Project */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">The Trevor Project (LGBTQ+)</p>
                  <p className="text-white/50 text-[11px]">24/7 confidential suicide prevention & crisis hotline</p>
                </div>
                <a
                  href="tel:18664887386"
                  className="px-3 py-1.5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 font-medium"
                >
                  Call 1-866-488-7386
                </a>
              </div>

              {/* International */}
              <div className="p-3 rounded-xl bg-white/5 text-[11px] text-white/60 text-center">
                Outside North America? Visit{' '}
                <a
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 underline"
                >
                  findahelpline.com
                </a>{' '}
                for free global support services.
              </div>
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white/80 font-medium text-xs transition-colors"
            >
              Return to Ocean
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
