import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../services/sound';
import { SandDollarIcon } from '../components/SandDollarIcon';
import { Sparkles, Check, X, Mic, MicOff, Star, Heart, Calendar } from 'lucide-react';

const GOAL_STORAGE_KEY = 'blub_tomorrow_goal_v1';

export interface TomorrowGoal {
  id: string;
  text: string;
  setDate: string; // YYYY-MM-DD
  setTimestamp: number;
  status: 'active' | 'completed' | 'dismissed';
}

export function getActiveGoal(): TomorrowGoal | null {
  try {
    const raw = localStorage.getItem(GOAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.status === 'active') return parsed;
  } catch (e) {
    console.warn('Error reading active goal:', e);
  }
  return null;
}

export function saveActiveGoal(text: string): TomorrowGoal {
  const now = new Date();
  const setDate = now.toISOString().split('T')[0];
  const goal: TomorrowGoal = {
    id: `goal-${Date.now()}`,
    text: text.trim(),
    setDate,
    setTimestamp: Date.now(),
    status: 'active',
  };
  localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(goal));
  return goal;
}

export function clearActiveGoal(): void {
  localStorage.removeItem(GOAL_STORAGE_KEY);
}

// ==========================================
// 1. MODAL TO SET TOMORROW'S GOAL (EVEN ZONE)
// ==========================================
interface SetGoalProps {
  onComplete: () => void;
  onClose: () => void;
}

const GOAL_SUGGESTIONS = [
  'Take a 10-minute walk',
  'Drink water at lunch',
  'Message a friend',
];

import {
  isSpeechSupported,
  startListening as startSharedSpeech,
  stopListening as stopSharedSpeech,
} from '../lib/speech';

export const GoalSetModal: React.FC<SetGoalProps> = ({ onComplete, onClose }) => {
  const [goalText, setGoalText] = useState('');
  const [interimGoal, setInterimGoal] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [dictationNotice, setDictationNotice] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopSharedSpeech();
    };
  }, []);

  const toggleDictation = () => {
    setDictationNotice(null);
    if (!isSpeechSupported()) {
      setDictationNotice('Try typing, or use Chrome for voice.');
      return;
    }

    if (isDictating) {
      stopSharedSpeech();
      setIsDictating(false);
      setInterimGoal('');
    } else {
      soundManager.playBlub();
      const started = startSharedSpeech(
        'goal-dictation',
        {
          onFinal: (finalWord) => {
            setGoalText(finalWord);
            setInterimGoal('');
          },
          onInterim: (interimWord) => {
            setInterimGoal(interimWord);
          },
          onError: (errMsg) => {
            setDictationNotice(errMsg);
            setIsDictating(false);
            setInterimGoal('');
          },
          onStateChange: (listening) => {
            setIsDictating(listening);
            if (!listening) setInterimGoal('');
          },
        },
        false
      );

      if (!started) {
        setIsDictating(false);
      }
    }
  };

  const handleSave = (textToSave: string) => {
    if (!textToSave.trim()) return;
    soundManager.playBlub();
    saveActiveGoal(textToSave);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-indigo-950/95 via-slate-900/95 to-slate-950/95 border border-indigo-400/40 text-white shadow-2xl p-5 sm:p-7 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌙</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-indigo-200">
                Tomorrow's Goal
              </h3>
              <p className="text-[11px] text-indigo-300/80">
                Even Zone • One gentle intention for tomorrow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Prompt */}
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-white/90">
            Set one small, caring goal for tomorrow.
          </p>
          <p className="text-xs text-indigo-200/70">
            Keep it simple. Check in tomorrow to earn Sand Dollars!
          </p>
        </div>

        {/* 3 Tappable Suggestions */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
            Gentle Suggestions
          </label>
          <div className="grid grid-cols-1 gap-2">
            {GOAL_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setGoalText(suggestion)}
                className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                  goalText === suggestion
                    ? 'bg-indigo-500/30 border-indigo-400 text-indigo-100 shadow-md ring-1 ring-indigo-400/40'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
                }`}
              >
                <span>{suggestion}</span>
                {goalText === suggestion && <Check size={14} className="text-indigo-300" />}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input Field with Speech Dictation */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
            Or Write Your Own
          </label>
          <div className="relative">
            <input
              type="text"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="e.g. Read for 10 minutes..."
              maxLength={80}
              className="w-full px-4 py-3 pr-11 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
            />
            <button
              type="button"
              onClick={toggleDictation}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                isDictating ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/10 text-indigo-200'
              }`}
              title="Dictate goal"
            >
              {isDictating ? <MicOff size={15} /> : <Mic size={15} />}
            </button>
          </div>
          {isDictating && interimGoal && (
            <p className="text-[11px] text-indigo-200 italic mt-1 font-normal">
              "{interimGoal}..."
            </p>
          )}
          {dictationNotice && (
            <p className="text-[11px] text-amber-200 mt-1 font-medium bg-amber-400/10 p-1.5 rounded-lg border border-amber-300/30">
              {dictationNotice}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-white/50 hover:text-white font-medium"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={() => handleSave(goalText)}
            disabled={!goalText.trim()}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all ${
              goalText.trim()
                ? 'bg-gradient-to-r from-indigo-400 to-cyan-400 text-slate-950 hover:opacity-90 active:scale-95 cursor-pointer shadow-indigo-500/20'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            <span>Set Goal</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. GOAL CHECK CARD (SHOWN ON NEXT RETURN)
// ==========================================
interface CheckCardProps {
  goal: TomorrowGoal;
  onReward: (sandDollarsEarned: number) => void;
  onDismiss: () => void;
  onPickNew: () => void;
}

export const GoalCheckCard: React.FC<CheckCardProps> = ({
  goal,
  onReward,
  onDismiss,
  onPickNew,
}) => {
  const [completedState, setCompletedState] = useState<'prompt' | 'yes' | 'not_today'>('prompt');

  // Calculate days passed since goal was set
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const setDateObj = new Date(goal.setTimestamp);
  const diffDays = Math.floor((now.getTime() - setDateObj.getTime()) / (1000 * 60 * 60 * 24));
  const isSeveralDays = diffDays >= 2;

  // Handler for YES
  const handleYes = () => {
    soundManager.playStarfishChime();
    soundManager.playSparkle();
    setCompletedState('yes');
    clearActiveGoal();
    setTimeout(() => {
      onReward(5);
    }, 2400);
  };

  // Handler for NOT TODAY
  const handleNotToday = () => {
    soundManager.playBlub();
    setCompletedState('not_today');
    clearActiveGoal();
    setTimeout(() => {
      onReward(1);
    }, 2400);
  };

  // Handler for LET IT DRIFT AWAY
  const handleLetDrift = () => {
    soundManager.playBlub();
    clearActiveGoal();
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-indigo-950/95 via-slate-900/95 to-slate-950/95 border border-indigo-400/40 text-white shadow-2xl p-6 sm:p-7 space-y-4">
        
        {/* State: Prompt */}
        {completedState === 'prompt' && (
          <>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <div>
                  <h3 className="text-base font-black text-indigo-200">
                    {isSeveralDays ? 'Welcome Back!' : 'Goal Check'}
                  </h3>
                  <p className="text-[11px] text-indigo-300/80">
                    {isSeveralDays ? 'Gentle reflection from a few tides ago' : "Checking in on yesterday's goal"}
                  </p>
                </div>
              </div>
              <button
                onClick={onDismiss}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
                aria-label="Skip"
              >
                <X size={18} />
              </button>
            </div>

            {/* Goal quote */}
            <div className="p-4 rounded-2xl bg-white/5 border border-indigo-300/20 text-center">
              <p className="text-xs uppercase font-bold text-indigo-300 tracking-wider mb-1">
                Your Intention:
              </p>
              <p className="text-base font-bold text-white italic">
                “{goal.text}”
              </p>
            </div>

            {/* Prompt text based on time passed */}
            {isSeveralDays ? (
              <div className="text-center space-y-3">
                <p className="text-xs text-indigo-100/80 leading-relaxed">
                  Welcome back! The sea is always patient with you. Want to keep this goal, pick a new one, or let it drift away?
                </p>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={handleYes}
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span>I did it! (+5</span>
                    <SandDollarIcon size={14} />
                    <span>)</span>
                  </button>
                  <button
                    onClick={onPickNew}
                    className="w-full py-2.5 rounded-xl bg-indigo-500/30 hover:bg-indigo-500/40 text-indigo-200 border border-indigo-400/40 font-bold text-xs"
                  >
                    Pick a new goal
                  </button>
                  <button
                    onClick={handleLetDrift}
                    className="w-full py-2 text-white/50 hover:text-white text-xs font-medium"
                  >
                    Let it drift away (no guilt)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-sm font-semibold text-white/90">
                  Did you get a chance to do this?
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleYes}
                    className="py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
                  >
                    <Check size={16} />
                    <span>Yes (+5</span>
                    <SandDollarIcon size={15} />
                    <span>)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNotToday}
                    className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-indigo-200 font-bold text-xs flex items-center justify-center gap-1 border border-white/15 active:scale-95 transition-all"
                  >
                    <span>Not today (+1</span>
                    <SandDollarIcon size={14} />
                    <span>)</span>
                  </button>
                </div>

                <div className="text-center">
                  <button
                    onClick={onDismiss}
                    className="text-xs text-white/50 hover:text-white font-medium"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* State: YES -> Dancing Starfish Animation */}
        {completedState === 'yes' && (
          <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
            {/* Cute Dancing Starfish SVG */}
            <div className="relative animate-bounce">
              <svg viewBox="0 0 80 80" width="80" height="80" className="drop-shadow-[0_0_15px_#F59E0B]">
                {/* 5-pointed cute coral starfish */}
                <path
                  d="M 40 8
                     L 48 26 L 68 28
                     L 52 42 L 57 62
                     L 40 50 L 23 62
                     L 28 42 L 12 28
                     L 32 26 Z"
                  fill="#FB7185"
                  stroke="#E11D48"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {/* Cheerful Starfish Face */}
                <circle cx="36" cy="36" r="2" fill="#1E293B" />
                <circle cx="44" cy="36" r="2" fill="#1E293B" />
                <circle cx="37" cy="35" r="0.7" fill="#FFFFFF" />
                <circle cx="45" cy="35" r="0.7" fill="#FFFFFF" />
                <path d="M 37 42 Q 40 45 43 42" stroke="#881337" strokeWidth="1.4" strokeLinecap="round" fill="none" />
                <circle cx="32" cy="39" r="1.8" fill="#F43F5E" opacity="0.6" />
                <circle cx="48" cy="39" r="1.8" fill="#F43F5E" opacity="0.6" />
              </svg>
            </div>

            <h4 className="text-lg font-black text-amber-300">
              Lovely job! ✨
            </h4>
            <p className="text-xs text-indigo-100/80 max-w-xs leading-relaxed">
              Every small step matters in your ocean journey.
            </p>

            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400 text-slate-950 font-black text-sm shadow-lg animate-pulse">
              <SandDollarIcon size={16} />
              <span>+5 Sand Dollars</span>
            </div>
          </div>
        )}

        {/* State: NOT TODAY -> Warm No-Guilt Message */}
        {completedState === 'not_today' && (
          <div className="p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-2xl">
              🌊
            </div>

            <h4 className="text-base font-bold text-cyan-200">
              That's okay, tomorrow's tide comes back.
            </h4>
            <p className="text-xs text-white/70 max-w-xs leading-relaxed">
              No pressure and no guilt. Rest when you need to rest; the ocean will be right here.
            </p>

            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/20 text-cyan-200 font-bold text-xs border border-cyan-400/40">
              <SandDollarIcon size={15} />
              <span>+1 Sand Dollar for checking in</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
