import React, { useState, useRef, useEffect } from 'react';
import { saveBottleMessage } from '../services/bottleStorage';
import { soundManager } from '../services/sound';
import { SandDollarIcon } from '../components/SandDollarIcon';
import { Mic, MicOff, Square, Play, Pause, RotateCcw, Send, X, Shield, Sparkles } from 'lucide-react';

import {
  isSpeechSupported,
  startListening as startSharedSpeech,
  stopListening as stopSharedSpeech,
} from '../lib/speech';

interface Props {
  onComplete: (sandDollarsEarned: number) => void;
  onClose: () => void;
}

export const BottleChallenge: React.FC<Props> = ({ onComplete, onClose }) => {
  const [mode, setMode] = useState<'text' | 'audio'>('text');
  const [textMessage, setTextMessage] = useState('');
  const [interimDictation, setInterimDictation] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [dictationNotice, setDictationNotice] = useState<string | null>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Bottle animation state: 'composing' | 'sealing' | 'sealed'
  const [bottleState, setBottleState] = useState<'composing' | 'sealing' | 'sealed'>('composing');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio blob URL and speech on unmount
  useEffect(() => {
    return () => {
      stopSharedSpeech();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [audioUrl]);

  // Voice dictation into text field using shared speech helper
  const toggleDictation = () => {
    setDictationNotice(null);
    if (!isSpeechSupported()) {
      setDictationNotice('Try typing, or use Chrome for voice.');
      return;
    }

    if (isDictating) {
      stopSharedSpeech();
      setIsDictating(false);
      setInterimDictation('');
    } else {
      soundManager.playBlub();
      const started = startSharedSpeech(
        'bottle-dictation',
        {
          onFinal: (finalWord) => {
            setTextMessage((prev) => {
              const combined = (prev ? `${prev} ${finalWord}` : finalWord).trim();
              return combined.slice(0, 280);
            });
            setInterimDictation('');
          },
          onInterim: (interimWord) => {
            setInterimDictation(interimWord);
          },
          onError: (errMsg) => {
            setDictationNotice(errMsg);
            setIsDictating(false);
            setInterimDictation('');
          },
          onStateChange: (listening) => {
            setIsDictating(listening);
            if (!listening) setInterimDictation('');
          },
        },
        true
      );
      if (!started) {
        setIsDictating(false);
      }
    }
  };

  // Audio Recording (Max 30 seconds)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
      soundManager.playBlub();

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 29) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('Microphone access error:', err);
      alert('Microphone access is needed to record your voice bottle.');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    soundManager.playBlub();
  };

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setRecordedAudioBlob(null);
    setAudioUrl(null);
    setRecordingSeconds(0);
    setIsPlayingAudio(false);
  };

  const togglePlayAudio = () => {
    if (!audioUrl) return;
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Seal & Save Bottle
  const handleSealBottle = async () => {
    if (mode === 'text' && !textMessage.trim()) return;
    if (mode === 'audio' && !recordedAudioBlob) return;

    // Trigger Cork Pop sound & sealing animation
    soundManager.playCorkPop();
    setBottleState('sealing');

    try {
      await saveBottleMessage({
        type: mode,
        text: mode === 'text' ? textMessage.trim() : undefined,
        audioBlob: mode === 'audio' && recordedAudioBlob ? recordedAudioBlob : undefined,
      });
    } catch (e) {
      console.warn('Failed to save bottle message:', e);
    }

    setTimeout(() => {
      soundManager.playSparkle();
      setBottleState('sealed');
      setTimeout(() => {
        onComplete(3);
      }, 1800);
    }, 1100);
  };

  const hasContent = mode === 'text' ? textMessage.trim().length > 0 : recordedAudioBlob !== null;
  const todayDateStr = new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-sky-950/95 via-cyan-950/95 to-slate-900/95 border border-amber-300/30 text-white shadow-2xl overflow-hidden flex flex-col p-5 sm:p-7">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍾</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-200">
                Message in a Bottle
              </h3>
              <p className="text-[11px] text-cyan-200/80">
                Bright Zone Challenge • Earn 3 Sand Dollars
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

        {/* Content Area */}
        <div className="py-4 space-y-4">
          {/* Floating Glass Bottle SVG Scene */}
          <div className="relative h-28 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-sky-400/20 via-teal-500/10 to-transparent border border-white/10">
            {/* Ambient water ripple */}
            <div className="absolute inset-x-0 bottom-0 h-8 bg-cyan-500/20 rounded-b-2xl blur-sm pointer-events-none" />

            {/* Floating Glass Bottle Graphic */}
            <div
              className={`relative transition-all duration-1000 ${
                bottleState === 'sealing'
                  ? 'scale-105 rotate-6'
                  : bottleState === 'sealed'
                  ? 'translate-x-56 -translate-y-8 opacity-0 rotate-12'
                  : 'animate-avatar-bob'
              }`}
            >
              <svg viewBox="0 0 80 80" width="70" height="70" className="drop-shadow-lg">
                <defs>
                  <linearGradient id="bottleGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A5F3FC" stopOpacity="0.8" />
                    <stop offset="40%" stopColor="#67E8F9" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0891B2" stopOpacity="0.6" />
                  </linearGradient>
                </defs>

                {/* Bottle body */}
                <path
                  d="M 35 18 L 35 26 C 30 30, 22 36, 22 48 C 22 62, 28 68, 40 68 C 52 68, 58 62, 58 48 C 58 36, 50 30, 45 26 L 45 18 Z"
                  fill="url(#bottleGlass)"
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                />

                {/* Inner rolled parchment scroll */}
                <path
                  d="M 33 42 C 33 38, 47 38, 47 42 L 46 56 C 46 60, 34 60, 34 56 Z"
                  fill="#FEF3C7"
                  stroke="#D97706"
                  strokeWidth="0.8"
                />
                <line x1="37" y1="46" x2="43" y2="46" stroke="#B45309" strokeWidth="0.6" />
                <line x1="37" y1="50" x2="42" y2="50" stroke="#B45309" strokeWidth="0.6" />

                {/* Bottle Cork */}
                <path
                  d={
                    bottleState !== 'composing'
                      ? 'M 34 14 L 46 14 L 44 20 L 36 20 Z' // Cork inserted & sealed
                      : 'M 35 6 L 47 6 L 45 12 L 37 12 Z' // Cork hovering open
                  }
                  fill="#B45309"
                  stroke="#78350F"
                  strokeWidth="0.8"
                  className="transition-all duration-300"
                />
              </svg>
            </div>

            {bottleState === 'sealed' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-amber-200 bg-black/40 px-3 py-1 rounded-full border border-amber-300/40 animate-pulse">
                  Sealed with care • {todayDateStr}
                </span>
              </div>
            )}
          </div>

          {/* Gentle Prompt */}
          <div className="text-center space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-white">
              Leave a message for a harder day.
            </h4>
            <p className="text-xs text-cyan-200/80">
              What would you want to hear from yourself when the water feels heavy?
            </p>
          </div>

          {/* Mode Switch Tabs (Text vs Audio side-by-side) */}
          <div className="flex rounded-2xl bg-white/10 p-1 border border-white/15">
            <button
              type="button"
              onClick={() => setMode('text')}
              disabled={bottleState !== 'composing'}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'text'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Write Text (280 chars)
            </button>
            <button
              type="button"
              onClick={() => setMode('audio')}
              disabled={bottleState !== 'composing'}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'audio'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Record Voice (30s)
            </button>
          </div>

          {/* Mode 1: Text Field with Dictation */}
          {mode === 'text' && (
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  value={textMessage}
                  onChange={(e) => setTextMessage(e.target.value.slice(0, 280))}
                  placeholder="Dear future me: Remember to breathe. You made it through before, and the sunlit waters will find you again..."
                  rows={4}
                  disabled={bottleState !== 'composing'}
                  className="w-full p-3.5 pr-11 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none font-medium leading-relaxed"
                />

                {/* Voice Dictation Button inside text box */}
                <button
                  type="button"
                  onClick={toggleDictation}
                  disabled={bottleState !== 'composing'}
                  className={`absolute right-3 bottom-4 p-2 rounded-xl transition-all ${
                    isDictating
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-white/15 hover:bg-white/25 text-cyan-200'
                  }`}
                  title={isDictating ? 'Stop dictation' : 'Voice dictation'}
                  aria-label="Voice dictation into text message"
                >
                  {isDictating ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-white/50 px-1">
                <span>{280 - textMessage.length} characters left</span>
                {isDictating && (
                  <span className="text-cyan-300 font-semibold animate-pulse">
                    Listening... {interimDictation ? `"${interimDictation}"` : ''}
                  </span>
                )}
              </div>

              {dictationNotice && (
                <div className="text-[11px] text-amber-200 bg-amber-400/15 p-2 rounded-xl border border-amber-300/30 flex justify-between items-center">
                  <span>{dictationNotice}</span>
                  <button
                    type="button"
                    onClick={() => setDictationNotice(null)}
                    className="ml-2 text-amber-300 hover:text-white font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Audio Recording */}
          {mode === 'audio' && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/15 flex flex-col items-center justify-center space-y-3">
              <div aria-live="polite" className="text-center">
                {isRecording ? (
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                    <span>Recording: {recordingSeconds}s / 30s</span>
                  </div>
                ) : recordedAudioBlob ? (
                  <div className="flex items-center gap-1.5 text-emerald-300 font-semibold text-xs">
                    <Sparkles size={14} />
                    <span>Voice message captured ({recordingSeconds}s)</span>
                  </div>
                ) : (
                  <span className="text-xs text-white/70">
                    Tap record to speak a 30-second message
                  </span>
                )}
              </div>

              {/* Recording Controls */}
              <div className="flex items-center gap-3">
                {!isRecording && !recordedAudioBlob && (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/25 active:scale-95 transition-all"
                  >
                    <Mic size={16} />
                    <span>Start Recording</span>
                  </button>
                )}

                {isRecording && (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-5 py-2.5 rounded-2xl bg-slate-900 text-rose-400 border border-rose-400/50 font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                  >
                    <Square size={16} className="fill-rose-400" />
                    <span>Stop ({30 - recordingSeconds}s left)</span>
                  </button>
                )}

                {recordedAudioBlob && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={togglePlayAudio}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                    >
                      {isPlayingAudio ? <Pause size={14} /> : <Play size={14} />}
                      <span>{isPlayingAudio ? 'Pause' : 'Play back'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={resetRecording}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Record again"
                    >
                      <RotateCcw size={13} />
                      <span>Re-record</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Privacy Reassurance Banner */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-400/20 text-[11px] text-cyan-200/90 font-medium">
            <Shield size={14} className="text-teal-300 shrink-0" />
            <span>Only you will ever see this. It stays strictly on your device.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-white/50 hover:text-white transition-colors font-medium px-2 py-1"
          >
            Skip for now
          </button>

          <button
            type="button"
            onClick={handleSealBottle}
            disabled={!hasContent || bottleState !== 'composing'}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
              hasContent && bottleState === 'composing'
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/25 active:scale-95 cursor-pointer'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            <SandDollarIcon size={16} />
            <span>Seal & Send (+3)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
