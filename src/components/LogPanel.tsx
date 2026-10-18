import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PenLine,
  Smile,
  Anchor,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  isSpeechSupported,
  startListening as startSharedSpeech,
  stopListening as stopSharedSpeech,
} from '../lib/speech';

export type DiveSubmission =
  | { source: 'text'; text: string }
  | { source: 'mood'; mood: 1 | 2 | 3 | 4 | 5 };

interface Props {
  onDive: (submission: DiveSubmission) => Promise<void>;
  isLoading: boolean;
}

const TAB_STORAGE_KEY = 'blub_log_panel_active_tab';

interface MoodOption {
  val: 1 | 2 | 3 | 4 | 5;
  emoji: string;
  label: string;
  zoneName: string;
  gradient: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { val: 5, emoji: '😄', label: 'Bright', zoneName: 'Sunlight', gradient: 'from-amber-400/30 to-yellow-300/30' },
  { val: 4, emoji: '🙂', label: 'Warm', zoneName: 'Twilight', gradient: 'from-teal-400/30 to-emerald-300/30' },
  { val: 3, emoji: '😐', label: 'Even', zoneName: 'Midnight', gradient: 'from-indigo-400/30 to-blue-300/30' },
  { val: 2, emoji: '🙁', label: 'Down', zoneName: 'Abyss', gradient: 'from-blue-500/30 to-cyan-400/30' },
  { val: 1, emoji: '😞', label: 'Heavy', zoneName: 'Trench', gradient: 'from-rose-500/30 to-pink-400/30' },
];

export const LogPanel: React.FC<Props> = ({ onDive, isLoading }) => {
  // Remember last-used tab in localStorage, defaulting to 'text' on first launch
  const [activeTab, setActiveTab] = useState<'text' | 'mood'>(() => {
    try {
      const saved = localStorage.getItem(TAB_STORAGE_KEY);
      if (saved === 'text' || saved === 'mood') return saved;
    } catch {}
    return 'text';
  });

  // Tab 1 state: Draft text preserved when switching tabs
  const [text, setText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [micStatus, setMicStatus] = useState<string | null>(null);

  // Tab 2 state: Selected mood (nothing pre-selected by default)
  const [selectedMood, setSelectedMood] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

  // Panel collapse & accessibility announcements
  const [isExpanded, setIsExpanded] = useState(true);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Refs for keyboard navigation
  const tabTextRef = useRef<HTMLButtonElement>(null);
  const tabMoodRef = useRef<HTMLButtonElement>(null);
  const moodButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Check speech recognition capability on mount
  useEffect(() => {
    setSpeechSupported(isSpeechSupported());
    return () => {
      stopSharedSpeech();
    };
  }, []);

  // Switch tabs and store preference
  const handleTabChange = (tab: 'text' | 'mood') => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setLiveAnnouncement(tab === 'text' ? 'Write or speak tab selected' : 'Quick mood tab selected');
    try {
      localStorage.setItem(TAB_STORAGE_KEY, tab);
    } catch {}
  };

  // Keyboard navigation for tablist (Left / Right arrows)
  const handleTabKeyDown = (e: React.KeyboardEvent, current: 'text' | 'mood') => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = current === 'text' ? 'mood' : 'text';
      handleTabChange(next);
      if (next === 'text') {
        tabTextRef.current?.focus();
      } else {
        tabMoodRef.current?.focus();
      }
    }
  };

  // Toggle voice dictation using shared speech helper
  const toggleListening = () => {
    setMicStatus(null);
    if (!speechSupported) {
      setMicStatus('Try typing, or use Chrome for voice.');
      return;
    }

    if (isListening) {
      stopSharedSpeech();
      setIsListening(false);
      setInterimText('');
      setLiveAnnouncement('Microphone stopped');
    } else {
      setLiveAnnouncement('Microphone listening');
      const started = startSharedSpeech(
        'log-panel-dictation',
        {
          onFinal: (finalWord) => {
            setText((prev) => {
              const cleaned = (prev ? `${prev} ${finalWord}` : finalWord)
                .replace(/\s+/g, ' ')
                .trim();
              return cleaned;
            });
            setInterimText('');
          },
          onInterim: (interimWord) => {
            setInterimText(interimWord);
          },
          onError: (errMsg) => {
            setMicStatus(errMsg);
            setIsListening(false);
            setInterimText('');
            setLiveAnnouncement(`Speech error: ${errMsg}`);
          },
          onStateChange: (listening) => {
            setIsListening(listening);
            if (!listening) setInterimText('');
          },
        },
        true // continuous
      );

      if (!started) {
        setIsListening(false);
      }
    }
  };

  // Tab 1 Submit (Write or Speak)
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !text.trim()) return;

    if (isListening) {
      stopSharedSpeech();
      setIsListening(false);
      setInterimText('');
    }

    await onDive({ source: 'text', text: text.trim() });
    setText('');
    setIsExpanded(false);
  };

  // Tab 2 Submit (Quick Mood)
  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || selectedMood === null) return;

    await onDive({ source: 'mood', mood: selectedMood });
    setSelectedMood(null);
    setIsExpanded(false);
  };

  // Keyboard navigation for mood radio group (Arrow keys)
  const handleMoodKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % MOOD_OPTIONS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + MOOD_OPTIONS.length) % MOOD_OPTIONS.length;
    }

    if (nextIndex >= 0) {
      const nextMood = MOOD_OPTIONS[nextIndex];
      setSelectedMood(nextMood.val);
      setLiveAnnouncement(`Selected ${nextMood.label} mood`);
      moodButtonRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 z-20">
      <div className="rounded-3xl bg-white/25 dark:bg-slate-900/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-300">
        {/* Toggle Collapse Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/20 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wide text-white drop-shadow-sm">
              Today's Log & Dive
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-cyan-100 font-medium hidden sm:inline">
              Deeper dives earn up to 3.0x points ✨
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300 outline-none"
              aria-label={isExpanded ? 'Collapse log panel' : 'Expand log panel'}
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div>
            {/* Two-Tab Switcher Directly Under Header */}
            <div className="px-4 pt-3 pb-2 border-b border-white/15">
              <div
                role="tablist"
                aria-label="Dive entry method"
                className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950/30 border border-white/15 backdrop-blur-sm"
              >
                <button
                  ref={tabTextRef}
                  role="tab"
                  id="tab-write-speak"
                  aria-selected={activeTab === 'text'}
                  aria-controls="panel-write-speak"
                  tabIndex={activeTab === 'text' ? 0 : -1}
                  onClick={() => handleTabChange('text')}
                  onKeyDown={(e) => handleTabKeyDown(e, 'text')}
                  className={`min-h-[44px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-300 outline-none ${
                    activeTab === 'text'
                      ? 'bg-white/95 text-slate-900 shadow-md font-extrabold'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <PenLine size={15} className={activeTab === 'text' ? 'text-cyan-600' : 'text-cyan-300'} />
                  <span>Write or speak</span>
                </button>

                <button
                  ref={tabMoodRef}
                  role="tab"
                  id="tab-quick-mood"
                  aria-selected={activeTab === 'mood'}
                  aria-controls="panel-quick-mood"
                  tabIndex={activeTab === 'mood' ? 0 : -1}
                  onClick={() => handleTabChange('mood')}
                  onKeyDown={(e) => handleTabKeyDown(e, 'mood')}
                  className={`min-h-[44px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-300 outline-none ${
                    activeTab === 'mood'
                      ? 'bg-white/95 text-slate-900 shadow-md font-extrabold'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Smile size={16} className={activeTab === 'mood' ? 'text-amber-500' : 'text-amber-300'} />
                  <span>Quick mood</span>
                </button>
              </div>
            </div>

            {/* TAB 1: WRITE OR SPEAK */}
            {activeTab === 'text' && (
              <form
                role="tabpanel"
                id="panel-write-speak"
                aria-labelledby="tab-write-speak"
                onSubmit={handleTextSubmit}
                className="p-4 space-y-3.5 animate-tab-fade"
              >
                {/* Journal Input */}
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="How was your day?"
                    rows={2}
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 rounded-2xl bg-white/70 dark:bg-slate-950/50 border border-white/50 dark:border-white/15 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/90 dark:focus:bg-slate-900/80 transition-all resize-none font-medium shadow-inner"
                  />

                  {/* Dictation Button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={isLoading}
                    title={speechSupported ? 'Dictate with your voice' : 'Speech dictation not supported'}
                    className={`absolute right-2.5 top-2.5 p-2 rounded-xl transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-cyan-300 outline-none ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-400/50'
                        : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-800 dark:text-cyan-200'
                    }`}
                    aria-label={isListening ? 'Stop listening' : 'Start voice dictation'}
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                </div>

                {/* Listening Banner & Interim Transcription */}
                {isListening && (
                  <div className="text-center py-1.5 px-3 rounded-xl bg-cyan-500/20 border border-cyan-300/40 text-cyan-100 text-xs font-semibold animate-pulse flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>Listening... speak naturally (tap Stop to finish)</span>
                    </div>
                    {interimText && (
                      <p className="text-[11px] text-cyan-200/80 italic font-normal max-w-md truncate">
                        "{interimText}..."
                      </p>
                    )}
                  </div>
                )}

                {/* Microphone Status Notice / Error */}
                {micStatus && (
                  <div className="text-center py-1.5 px-3 rounded-xl bg-amber-500/20 border border-amber-300/40 text-amber-100 text-xs font-medium flex items-center justify-between gap-2">
                    <span>{micStatus}</span>
                    <button
                      type="button"
                      onClick={() => setMicStatus(null)}
                      className="text-amber-200 hover:text-white text-xs px-1 font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Submit Button for Tab 1 */}
                <button
                  type="submit"
                  disabled={isLoading || !text.trim()}
                  className={`w-full py-3.5 px-6 rounded-2xl font-black text-base tracking-wide flex items-center justify-center gap-2.5 text-white shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-cyan-300 outline-none ${
                    isLoading
                      ? 'bg-cyan-700/60 cursor-wait'
                      : !text.trim()
                      ? 'bg-white/20 text-white/40 cursor-not-allowed border border-white/10'
                      : 'bg-gradient-to-r from-teal-400 via-cyan-500 to-sky-500 hover:from-teal-300 hover:to-sky-400 active:scale-98 shadow-cyan-500/30 hover:shadow-cyan-400/50 cursor-pointer'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="animate-pulse">Blub is diving...</span>
                    </>
                  ) : (
                    <>
                      <Anchor size={19} className="animate-bounce" />
                      <span>Log & Take the Dive!</span>
                      <Sparkles size={17} className="text-yellow-200" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: QUICK MOOD */}
            {activeTab === 'mood' && (
              <form
                role="tabpanel"
                id="panel-quick-mood"
                aria-labelledby="tab-quick-mood"
                onSubmit={handleMoodSubmit}
                className="p-4 space-y-3.5 animate-tab-fade"
              >
                {/* Short Prompt */}
                <p className="text-xs font-bold text-white/90 text-center">
                  How are you feeling right now?
                </p>

                {/* 5 Mood Buttons as Large, Tappable Cards in a Radio Group */}
                <div
                  role="radiogroup"
                  aria-label="How are you feeling right now?"
                  className="grid grid-cols-5 gap-2"
                >
                  {MOOD_OPTIONS.map((m, idx) => {
                    const isSelected = selectedMood === m.val;
                    return (
                      <button
                        key={m.val}
                        ref={(el) => {
                          moodButtonRefs.current[idx] = el;
                        }}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`${m.label} mood`}
                        tabIndex={isSelected || (selectedMood === null && idx === 0) ? 0 : -1}
                        onClick={() => {
                          setSelectedMood(m.val);
                          setLiveAnnouncement(`Selected ${m.label} mood`);
                        }}
                        onKeyDown={(e) => handleMoodKeyDown(e, idx)}
                        className={`min-h-[72px] py-2.5 px-1 rounded-2xl text-center transition-all cursor-pointer flex flex-col items-center justify-center focus-visible:ring-2 focus-visible:ring-cyan-300 outline-none ${
                          isSelected
                            ? 'bg-white text-slate-900 shadow-xl scale-105 font-extrabold ring-3 ring-cyan-400'
                            : 'bg-white/15 hover:bg-white/25 text-white/90 border border-white/20 hover:scale-102'
                        }`}
                      >
                        <div className="text-2xl sm:text-3xl leading-none transition-transform group-hover:scale-110">
                          {m.emoji}
                        </div>
                        <div
                          className={`text-xs mt-1.5 tracking-tight font-bold truncate ${
                            isSelected ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          {m.label}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Submit Button for Tab 2 */}
                <button
                  type="submit"
                  disabled={isLoading || selectedMood === null}
                  className={`w-full py-3.5 px-6 rounded-2xl font-black text-base tracking-wide flex items-center justify-center gap-2.5 text-white shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-cyan-300 outline-none ${
                    isLoading
                      ? 'bg-cyan-700/60 cursor-wait'
                      : selectedMood === null
                      ? 'bg-white/20 text-white/40 cursor-not-allowed border border-white/10'
                      : 'bg-gradient-to-r from-teal-400 via-cyan-500 to-sky-500 hover:from-teal-300 hover:to-sky-400 active:scale-98 shadow-cyan-500/30 hover:shadow-cyan-400/50 cursor-pointer'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="animate-pulse">Blub is diving...</span>
                    </>
                  ) : (
                    <>
                      <Anchor size={19} className="animate-bounce" />
                      <span>Take the Dive!</span>
                      <Sparkles size={17} className="text-yellow-200" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Screen Reader Live Announcements */}
      <div className="sr-only" aria-live="polite">
        {liveAnnouncement}
      </div>
    </div>
  );
};
