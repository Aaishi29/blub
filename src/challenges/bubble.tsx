import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DepthZone } from '../types';
import { soundManager } from '../services/sound';
import { SandDollarIcon } from '../components/SandDollarIcon';
import { X, ArrowUp, Compass, Volume2, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (sandDollars: number) => void;
  initialZone?: DepthZone;
}

// 5 Zones from bottom to top
const ZONES_ORDER: { zone: DepthZone; name: string; mood: string; color: string; bgClass: string; depthRange: string }[] = [
  { zone: 'trench', name: 'The Trench', mood: 'Heavy', color: '#060810', bgClass: 'from-[#060810] via-[#030409] to-[#010205]', depthRange: '130m' },
  { zone: 'abyss', name: 'The Abyss', mood: 'Down', color: '#091122', bgClass: 'from-[#091122] via-[#050b17] to-[#02050c]', depthRange: '95m' },
  { zone: 'midnight', name: 'Midnight', mood: 'Even', color: '#1e1b4b', bgClass: 'from-[#1e1b4b] via-[#1e293b] to-[#0f172a]', depthRange: '60m' },
  { zone: 'twilight', name: 'Twilight', mood: 'Warm', color: '#0d9488', bgClass: 'from-[#0d9488] via-[#0f766e] to-[#134e4a]', depthRange: '30m' },
  { zone: 'sunlight', name: 'Sunlight', mood: 'Bright', color: '#38bdf8', bgClass: 'from-[#38bdf8] via-[#0284c7] to-[#0369a1]', depthRange: '5m' },
];

export const BubbleChallenge: React.FC<Props> = ({
  isOpen,
  onClose,
  onComplete,
  initialZone = 'abyss',
}) => {
  // Progress 0% (trench bottom) to 100% (sunlight surface)
  const [progress, setProgress] = useState(0);
  const [currentZoneIndex, setCurrentZoneIndex] = useState(0);
  const [autoAssist, setAutoAssist] = useState(true);
  const [isPopped, setIsPopped] = useState(false);
  const [bubbleX, setBubbleX] = useState(50); // percentage 10% - 90%
  const [bubbleY, setBubbleY] = useState(88); // visual percentage in view 88% down to 12%
  const [wobble, setWobble] = useState(0);
  const [announcedZone, setAnnouncedZone] = useState('');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const tiltRef = useRef<number>(0);
  const keysDownRef = useRef<Set<string>>(new Set());

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

  // Save previous zone and restore on unmount/close
  useEffect(() => {
    if (!isOpen) return;

    setProgress(0);
    setCurrentZoneIndex(0);
    setIsPopped(false);
    setBubbleX(50);
    setBubbleY(88);
    lastTimeRef.current = Date.now();

    // Set audio to trench at start
    soundManager.setZone('trench');

    return () => {
      soundManager.setZone(initialZone);
    };
  }, [isOpen, initialZone]);

  // Handle device orientation (tilt)
  useEffect(() => {
    if (!isOpen) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null) {
        // gamma: left-to-right tilt in degrees [-90, 90]
        tiltRef.current = Math.max(-1, Math.min(1, e.gamma / 30));
      }
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [isOpen]);

  // Handle keyboard arrow keys
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'].includes(e.code)) {
        e.preventDefault();
        keysDownRef.current.add(e.code);
        if (e.code === 'ArrowUp' || e.code === 'Space') {
          // Buoyancy pulse
          boostBubble();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen]);

  // Buoyant upward nudge when player taps anywhere or presses space/up
  const boostBubble = useCallback(() => {
    if (isPopped) return;
    setWobble((prev) => prev + 1);
    setProgress((prev) => Math.min(100, prev + 2.5));
  }, [isPopped]);

  // Main physics & ascent animation loop
  useEffect(() => {
    if (!isOpen || isPopped) return;

    const loop = () => {
      const now = Date.now();
      const dt = Math.min(0.1, (now - lastTimeRef.current) / 1000); // delta in seconds
      lastTimeRef.current = now;

      // Base ascent rate: ~50 seconds total to rise from 0 to 100
      // 100% / 50s = 2.0% per second
      const baseRiseRate = autoAssist ? 2.0 : 1.2;

      setProgress((prev) => {
        const next = Math.min(100, prev + baseRiseRate * dt);

        // Update zone index
        // 0-20: trench (0), 20-40: abyss (1), 40-60: midnight (2), 60-80: twilight (3), 80-100: sunlight (4)
        const newZoneIndex = Math.min(4, Math.floor((next / 100) * 5));
        if (newZoneIndex !== currentZoneIndex) {
          setCurrentZoneIndex(newZoneIndex);
          const currentZ = ZONES_ORDER[newZoneIndex];
          soundManager.setZone(currentZ.zone);
          setAnnouncedZone(`Rising into ${currentZ.name} — ${currentZ.mood} mood zone`);
        }

        // Calculate visual Y (88% at start -> 14% at top)
        const newY = 88 - (next / 100) * 74;
        setBubbleY(newY);

        if (next >= 100 && !isPopped) {
          triggerSurfacePop();
        }

        return next;
      });

      // Horizontal current drift + user controls
      setBubbleX((prevX) => {
        let vx = 0;

        // Gentle sine currents
        const timeSec = now / 1000;
        const currentStrength = Math.sin(timeSec * 0.9 + progress * 0.08) * 4;
        vx += currentStrength * dt;

        // Tilt controls
        if (tiltRef.current !== 0) {
          vx += tiltRef.current * 18 * dt;
        }

        // Arrow keys
        if (keysDownRef.current.has('ArrowLeft')) vx -= 24 * dt;
        if (keysDownRef.current.has('ArrowRight')) vx += 24 * dt;

        const nextX = Math.max(12, Math.min(88, prevX + vx));
        return nextX;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = Date.now();
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isPopped, autoAssist, currentZoneIndex, progress]);

  // Surface Pop Celebration
  const triggerSurfacePop = () => {
    setIsPopped(true);
    soundManager.playBubblePop();

    // Canvas confetti particle burst
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
      rotation: number;
      vRot: number;
    }[] = [];

    const colors = ['#38BDF8', '#7DD3FC', '#FDE047', '#FEF08A', '#F472B6', '#C084FC', '#FFFFFF'];
    const originX = (canvas.width * bubbleX) / 100;
    const originY = (canvas.height * bubbleY) / 100;

    const count = prefersReducedMotion ? 12 : 55;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = prefersReducedMotion ? 1.5 + Math.random() * 2 : 3 + Math.random() * 6;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (prefersReducedMotion ? 0.5 : 2.5),
        radius: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 8,
      });
    }

    let pAnimId: number;
    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        if (p.alpha <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // subtle gravity
        p.alpha -= prefersReducedMotion ? 0.015 : 0.012;
        p.rotation += p.vRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      if (alive) {
        pAnimId = requestAnimationFrame(drawParticles);
      }
    };

    pAnimId = requestAnimationFrame(drawParticles);
  };

  // Touch & Mouse Dragging handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    boostBubble();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || isPopped) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    setBubbleX(Math.max(12, Math.min(88, xPct)));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  if (!isOpen) return null;

  const currentZoneData = ZONES_ORDER[currentZoneIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col select-none overflow-hidden"
      role="dialog"
      aria-label="Bubble Rise ocean challenge"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Dynamic 5-zone layered background gradient matching ocean depths */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${currentZoneData.bgClass} transition-colors duration-1000 ease-in-out`}
      />

      {/* Surface light caustics appearing when nearing Sunlight zone */}
      <div
        className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-white/35 via-cyan-200/10 to-transparent transition-opacity duration-1000 pointer-events-none"
        style={{ opacity: Math.max(0, (progress - 60) / 40) }}
      />

      {/* Bioluminescent floating specks / ambient particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-200 blur-[1px] animate-pulse"
            style={{
              width: `${2 + (i % 3) * 2}px`,
              height: `${2 + (i % 3) * 2}px`,
              left: `${(i * 19 + 7) % 94}%`,
              top: `${(i * 23 + 11) % 90}%`,
              animationDuration: `${3 + (i % 4)}s`,
              opacity: 0.3 + (i % 4) * 0.15,
            }}
          />
        ))}
      </div>

      {/* Top Navigation & Status Bar */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium flex items-center gap-2 shadow-sm">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor:
                  currentZoneData.zone === 'sunlight'
                    ? '#FDE047'
                    : currentZoneData.zone === 'twilight'
                    ? '#2DD4BF'
                    : currentZoneData.zone === 'midnight'
                    ? '#818CF8'
                    : currentZoneData.zone === 'abyss'
                    ? '#38BDF8'
                    : '#94A3B8',
              }}
            />
            <span>{currentZoneData.name}</span>
            <span className="text-white/60">({currentZoneData.mood})</span>
            <span className="text-white/40 font-mono">~{currentZoneData.depthRange}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setAutoAssist((v) => !v);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 backdrop-blur-md ${
              autoAssist
                ? 'bg-cyan-500/25 border-cyan-400/40 text-cyan-200'
                : 'bg-white/5 border-white/20 text-white/70 hover:text-white'
            }`}
            title="Auto-assist gently lifts the bubble on its own"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Auto Float: {autoAssist ? 'On' : 'Off'}</span>
          </button>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md border border-white/15 transition-all"
          aria-label="Skip bubble rise challenge"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite">
        {announcedZone}
      </div>

      {/* Main Ocean Stage */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Depth Meter Guide along Left Edge */}
        <div className="absolute left-4 top-10 bottom-10 w-1.5 bg-white/15 rounded-full overflow-hidden pointer-events-none">
          <div
            className="w-full bg-gradient-to-t from-cyan-400 to-amber-300 rounded-full transition-all duration-300"
            style={{ height: `${progress}%` }}
          />
        </div>

        {/* The Rising Bubble */}
        {!isPopped && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 cursor-grab active:cursor-grabbing"
            style={{
              left: `${bubbleX}%`,
              top: `${bubbleY}%`,
              transform: `translate(-50%, -50%) scale(${1 + Math.sin(wobble * 2) * 0.08})`,
            }}
            tabIndex={0}
            role="button"
            aria-label="Rising ocean bubble. Press space or up arrow to boost, drag to steer."
          >
            {/* Glowing Aura */}
            <div className="absolute inset-0 rounded-full bg-cyan-300/30 blur-md scale-150 animate-pulse pointer-events-none" />

            {/* Bubble SVG */}
            <svg width="68" height="68" viewBox="0 0 100 100" className="drop-shadow-lg">
              <defs>
                <radialGradient id="bubbleGrad" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                  <stop offset="35%" stopColor="#A5F3FC" stopOpacity="0.5" />
                  <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.3" />
                  <stop offset="95%" stopColor="#0284C7" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.9" />
                </radialGradient>
                <linearGradient id="bubbleRim" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#67E8F9" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Main bubble sphere */}
              <circle cx="50" cy="50" r="44" fill="url(#bubbleGrad)" stroke="url(#bubbleRim)" strokeWidth="2.5" />

              {/* Gleam highlights */}
              <ellipse cx="36" cy="30" rx="14" ry="7" fill="#FFFFFF" fillOpacity="0.8" transform="rotate(-30 36 30)" />
              <circle cx="64" cy="68" r="4" fill="#FFFFFF" fillOpacity="0.5" />
            </svg>

            {/* Subtle gentle buoyant wake bubbles trailing below */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-50 pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-white/70 blur-[0.5px]" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            </div>
          </div>
        )}

        {/* Confetti / Burst Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20" />

        {/* Helpful Guidance Hint at Bottom */}
        {!isPopped && (
          <div className="absolute bottom-6 inset-x-0 flex flex-col items-center gap-1 pointer-events-none px-4 text-center">
            <p className="text-white/80 text-xs font-medium backdrop-blur-md bg-black/25 px-4 py-2 rounded-full border border-white/10 shadow-sm">
              Tap anywhere to boost, or drag & use arrow keys to steer upward
            </p>
          </div>
        )}

        {/* Completion Modal when Reaching Sunlight Surface */}
        {isPopped && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900/90 border border-cyan-400/40 rounded-3xl p-7 max-w-sm w-full text-center shadow-2xl space-y-5 animate-scale-up">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-amber-300 mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-8 h-8 text-slate-900" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white font-serif tracking-wide">
                  You reached the surface!
                </h3>
                <p className="text-sm text-cyan-100/80 mt-1.5">
                  The sun is warm and bright. Your bubble safely rose through every depth.
                </p>
              </div>

              {/* Reward Badge: 4 Sand Dollars */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-200">
                <SandDollarIcon className="w-5 h-5 text-amber-300" />
                <span className="font-semibold text-sm">+4 Sand Dollars</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete(4);
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 transition-all"
                >
                  Claim & Return to Sea
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
