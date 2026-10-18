import React, { useState } from 'react';
import { AvatarLook, AvatarPreset, HairStyle, TailPattern, EquippedAccessories } from '../types';
import {
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  TAIL_PATTERNS,
  DEFAULT_MERMAID_PRESET,
  DEFAULT_MERMAN_PRESET,
  DEFAULT_MERFOLK_PRESET,
} from '../data/accessories';
import { AvatarIllustration } from './AvatarIllustration';
import { soundManager } from '../services/sound';
import { Sparkles, Check, ChevronRight, X, Waves, ArrowLeft } from 'lucide-react';

interface Props {
  initialLook?: AvatarLook | null;
  equipped?: EquippedAccessories;
  isFirstLaunch?: boolean;
  onSave: (look: AvatarLook) => void;
  onClose?: () => void;
}

export const AvatarPickerModal: React.FC<Props> = ({
  initialLook,
  equipped = {},
  isFirstLaunch = false,
  onSave,
  onClose,
}) => {
  // Step 1: 'pick_preset' (Who's diving today?), Step 2: 'customize' (Make it yours)
  const [step, setStep] = useState<'pick_preset' | 'customize'>(
    isFirstLaunch ? 'pick_preset' : 'customize'
  );

  const [currentLook, setCurrentLook] = useState<AvatarLook>(() => {
    return initialLook || DEFAULT_MERMAID_PRESET;
  });

  const [tappedPreset, setTappedPreset] = useState<AvatarPreset | null>(null);
  const [hairCategory, setHairCategory] = useState<'all' | 'short' | 'long' | 'curly'>('all');

  // Handle Preset selection with sound & bubble burst
  const handleSelectPreset = (preset: AvatarPreset) => {
    soundManager.playBlub();
    setTappedPreset(preset);

    let base = DEFAULT_MERMAID_PRESET;
    if (preset === 'merman') base = DEFAULT_MERMAN_PRESET;
    if (preset === 'merfolk') base = DEFAULT_MERFOLK_PRESET;

    setCurrentLook((prev) => ({
      ...base,
      name: prev.name && prev.name !== 'Marina' && prev.name !== 'Kai' && prev.name !== 'Sari' ? prev.name : base.name,
    }));

    setTimeout(() => {
      setTappedPreset(null);
      setStep('customize');
    }, 400);
  };

  const handleDone = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playBlub();
    const fallbackName =
      currentLook.preset === 'mermaid' ? 'Marina' : currentLook.preset === 'merman' ? 'Kai' : 'Sari';
    const finalLook: AvatarLook = {
      ...currentLook,
      name: currentLook.name.trim() || fallbackName,
    };
    onSave(finalLook);
  };

  // Filter hair styles by chosen category
  const filteredHairStyles = HAIR_STYLES.filter((h) => {
    if (hairCategory === 'all') return true;
    return h.category === hairCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Container */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900/95 border border-cyan-500/30 text-white shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-teal-950/70 via-slate-900/60 to-cyan-950/70">
          <div className="flex items-center gap-2.5">
            {step === 'customize' && isFirstLaunch && (
              <button
                type="button"
                onClick={() => setStep('pick_preset')}
                className="p-1.5 rounded-xl hover:bg-white/10 text-cyan-300 transition-colors mr-1"
                title="Back to character selection"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <Waves size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{step === 'pick_preset' ? "Who's diving today?" : 'Make it yours'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 uppercase font-bold tracking-wider">
                  {step === 'pick_preset' ? 'Step 1 of 2' : 'Customize Look'}
                </span>
              </h2>
              <p className="text-xs text-cyan-200/70 font-medium">
                {step === 'pick_preset'
                  ? 'Choose your diver to begin your journey through the ocean depths'
                  : 'Customize your skin, hair, and tail colors freely'}
              </p>
            </div>
          </div>

          {!isFirstLaunch && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* STEP 1: WHO'S DIVING TODAY? */}
        {step === 'pick_preset' && (
          <div className="p-5 sm:p-8 flex flex-col items-center justify-center text-center space-y-6 overflow-y-auto">
            <p className="text-sm sm:text-base text-cyan-100/90 max-w-md font-medium leading-relaxed">
              Welcome to Blub! Choose your companion diver to guide your reflections through the deep sea:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl">
              {/* 1. Mermaid Card */}
              <button
                type="button"
                onClick={() => handleSelectPreset('mermaid')}
                className={`relative p-4 rounded-3xl border transition-all flex flex-col items-center group cursor-pointer ${
                  tappedPreset === 'mermaid'
                    ? 'bg-cyan-500/30 border-cyan-300 scale-105 ring-4 ring-cyan-400/40 shadow-2xl'
                    : 'bg-white/5 hover:bg-white/15 border-white/15 hover:border-cyan-300/40 hover:scale-102'
                }`}
              >
                <div className="w-24 h-36 flex items-center justify-center py-1">
                  <AvatarIllustration look={DEFAULT_MERMAID_PRESET} className="w-24 h-36" />
                </div>
                <div className="mt-2 text-center">
                  <h3 className="text-base font-black text-white group-hover:text-cyan-200 transition-colors">
                    Mermaid
                  </h3>
                  <span className="text-[11px] text-cyan-300/80 font-medium">Flowing waves & teal tail</span>
                </div>
              </button>

              {/* 2. Merman Card */}
              <button
                type="button"
                onClick={() => handleSelectPreset('merman')}
                className={`relative p-4 rounded-3xl border transition-all flex flex-col items-center group cursor-pointer ${
                  tappedPreset === 'merman'
                    ? 'bg-cyan-500/30 border-cyan-300 scale-105 ring-4 ring-cyan-400/40 shadow-2xl'
                    : 'bg-white/5 hover:bg-white/15 border-white/15 hover:border-cyan-300/40 hover:scale-102'
                }`}
              >
                <div className="w-24 h-36 flex items-center justify-center py-1">
                  <AvatarIllustration look={DEFAULT_MERMAN_PRESET} className="w-24 h-36" />
                </div>
                <div className="mt-2 text-center">
                  <h3 className="text-base font-black text-white group-hover:text-cyan-200 transition-colors">
                    Merman
                  </h3>
                  <span className="text-[11px] text-cyan-300/80 font-medium">Surfer waves & golden tail</span>
                </div>
              </button>

              {/* 3. Merfolk Card */}
              <button
                type="button"
                onClick={() => handleSelectPreset('merfolk')}
                className={`relative p-4 rounded-3xl border transition-all flex flex-col items-center group cursor-pointer ${
                  tappedPreset === 'merfolk'
                    ? 'bg-cyan-500/30 border-cyan-300 scale-105 ring-4 ring-cyan-400/40 shadow-2xl'
                    : 'bg-white/5 hover:bg-white/15 border-white/15 hover:border-cyan-300/40 hover:scale-102'
                }`}
              >
                <div className="w-24 h-36 flex items-center justify-center py-1">
                  <AvatarIllustration look={DEFAULT_MERFOLK_PRESET} className="w-24 h-36" />
                </div>
                <div className="mt-2 text-center">
                  <h3 className="text-base font-black text-white group-hover:text-cyan-200 transition-colors">
                    Merfolk
                  </h3>
                  <span className="text-[11px] text-cyan-300/80 font-medium">Topknot & iridescent tail</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MAKE IT YOURS */}
        {step === 'customize' && (
          <form onSubmit={handleDone} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Character Identity Switcher (Mermaid / Merman / Merfolk) */}
              <div>
                <label className="block text-[11px] font-bold text-cyan-200 uppercase tracking-wider mb-1.5">
                  Character Preset
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'mermaid', label: '🧜‍♀️ Mermaid' },
                      { id: 'merman', label: '🧜‍♂️ Merman' },
                      { id: 'merfolk', label: '🪸 Merfolk' },
                    ] as const
                  ).map((p) => {
                    const isSelected = currentLook.preset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          soundManager.playWiggle();
                          setCurrentLook((prev) => ({
                            ...prev,
                            preset: p.id,
                            name:
                              prev.name === 'Marina' && p.id === 'merman'
                                ? 'Kai'
                                : prev.name === 'Kai' && p.id === 'mermaid'
                                ? 'Marina'
                                : prev.name === 'Kai' && p.id === 'merfolk'
                                ? 'Sari'
                                : prev.name,
                          }));
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-sm ring-1 ring-cyan-400/40'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70'
                        }`}
                      >
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Top Live Preview Banner (Updates in real time on every click!) */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-3xl bg-slate-950/50 border border-white/10">
                <div className="w-28 h-40 flex items-center justify-center bg-cyan-950/40 rounded-2xl border border-cyan-500/25 shadow-inner shrink-0">
                  <AvatarIllustration
                    key={`preview-${currentLook.preset}-${currentLook.skinTone}-${currentLook.hairStyle}-${currentLook.hairColor}-${currentLook.tailPattern}`}
                    look={currentLook}
                    equipped={equipped}
                    className="w-24 h-36"
                  />
                </div>

                <div className="flex-1 w-full space-y-2.5">
                  <div>
                    <label
                      htmlFor="avatar-name"
                      className="block text-xs font-bold text-cyan-200 uppercase tracking-wider mb-1"
                    >
                      What should Blub call you?
                    </label>
                    <input
                      id="avatar-name"
                      type="text"
                      maxLength={24}
                      value={currentLook.name}
                      onChange={(e) => setCurrentLook((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder={
                        currentLook.preset === 'mermaid'
                          ? 'e.g. Marina'
                          : currentLook.preset === 'merman'
                          ? 'e.g. Kai'
                          : 'e.g. Sari'
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 font-semibold"
                    />
                  </div>

                  <p className="text-[11px] text-cyan-100/70 leading-relaxed">
                    Blub will welcome you warmly by this name and celebrate your daily reflections with you!
                  </p>
                </div>
              </div>

              {/* Customization Options */}
              <div className="space-y-4">
                {/* 1. Skin Tone (8 Options) */}
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                    Skin Tone
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_TONES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          soundManager.playWiggle();
                          setCurrentLook((prev) => ({ ...prev, skinTone: t.color }));
                        }}
                        className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                          currentLook.skinTone === t.color
                            ? 'border-white scale-110 shadow-lg ring-2 ring-cyan-400'
                            : 'border-white/20 hover:scale-105'
                        }`}
                        style={{ backgroundColor: t.color }}
                        title={t.label}
                        aria-label={t.label}
                      >
                        {currentLook.skinTone === t.color && <Check size={14} className="text-white drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Hair Style (3 Short, 3 Long, 3 Curly = 9 options total) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Hair Style
                    </h4>
                    {/* Hair Category Filter */}
                    <div className="flex items-center gap-1 text-[10px]">
                      {(['all', 'short', 'long', 'curly'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setHairCategory(cat)}
                          className={`px-2 py-0.5 rounded-md font-semibold transition-all capitalize ${
                            hairCategory === cat
                              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40'
                              : 'text-white/50 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filteredHairStyles.map((h) => {
                      const isSelected =
                        currentLook.hairStyle === h.id ||
                        (currentLook.hairStyle === 'long' && h.id === 'long_waves') ||
                        (currentLook.hairStyle === 'short' && h.id === 'short_crop') ||
                        (currentLook.hairStyle === 'curly' && h.id === 'curly_ringlets');

                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => {
                            soundManager.playWiggle();
                            setCurrentLook((prev) => ({ ...prev, hairStyle: h.id as HairStyle }));
                          }}
                          className={`p-2.5 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold shadow-md ring-1 ring-cyan-400/30'
                              : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
                          }`}
                        >
                          <div className="text-xs font-bold truncate">{h.label}</div>
                          <div className="text-[10px] text-white/50 truncate mt-0.5">{h.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Hair Color (8 Options) */}
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                    Hair Color
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {HAIR_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          soundManager.playWiggle();
                          setCurrentLook((prev) => ({ ...prev, hairColor: c.color }));
                        }}
                        className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                          currentLook.hairColor === c.color
                            ? 'border-white scale-110 shadow-lg ring-2 ring-cyan-400'
                            : 'border-white/20 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.color }}
                        title={c.label}
                        aria-label={c.label}
                      >
                        {currentLook.hairColor === c.color && <Check size={14} className="text-white drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Tail Pattern & Color (6 Options) */}
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                    Tail Pattern & Colors
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TAIL_PATTERNS.map((tp) => {
                      const isSelected = currentLook.tailPattern === tp.id;
                      return (
                        <button
                          key={tp.id}
                          type="button"
                          onClick={() => {
                            soundManager.playWiggle();
                            setCurrentLook((prev) => ({ ...prev, tailPattern: tp.id as TailPattern }));
                          }}
                          className={`p-2 rounded-2xl border flex items-center gap-2.5 transition-all ${
                            isSelected
                              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold shadow-md'
                              : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
                          }`}
                        >
                          <div
                            className="w-7 h-7 rounded-xl border border-white/20 shadow-inner shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${tp.secondary} 0%, ${tp.primary} 100%)`,
                            }}
                          />
                          <div className="text-xs font-semibold truncate text-left">{tp.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-slate-950/70 flex items-center justify-between">
              {isFirstLaunch ? (
                <button
                  type="button"
                  onClick={() => setStep('pick_preset')}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white/80 transition-colors"
                >
                  Back to Characters
                </button>
              ) : (
                <span className="text-xs text-white/40 font-medium">Changes take effect immediately</span>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-black text-sm flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
              >
                <span>Enter the Sea</span>
                <ChevronRight size={17} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
