import React, { useState } from 'react';
import {
  AccessoryItem,
  AccessorySlot,
  AccessoryTheme,
  AvatarLook,
  EquippedAccessories,
} from '../types';
import {
  ACCESSORY_CATALOG,
  BOOSTS_CATALOG,
  BoostItem,
} from '../data/accessories';
import { AvatarIllustration } from './AvatarIllustration';
import { SandDollarIcon } from './SandDollarIcon';
import { soundManager } from '../services/sound';
import {
  X,
  Sparkles,
  ShoppingBag,
  Check,
  Palette,
  Heart,
  Ban,
  Eye,
  RotateCcw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  look: AvatarLook;
  sandDollars: number;
  ownedAccessories: string[];
  equipped: EquippedAccessories;
  onBuyItem: (item: AccessoryItem) => boolean;
  onBuyBoost: (boost: BoostItem) => boolean;
  onEquipItem: (slot: AccessorySlot, itemId: string) => void;
  onUnequipItem: (slot: AccessorySlot) => void;
  onChangeLook: () => void;
}

const SLOT_ORDER: AccessorySlot[] = [
  'head',
  'neck',
  'top',
  'wrists',
  'tail',
  'hand',
  'back',
  'companion',
];

const SLOT_LABELS: Record<AccessorySlot | 'all' | 'boosts', string> = {
  all: 'All Slots',
  head: 'Head',
  neck: 'Neck',
  top: 'Top',
  wrists: 'Wrists',
  tail: 'Tail',
  hand: 'Hand',
  back: 'Back',
  companion: 'Companion',
  boosts: 'Boosts',
};

const THEME_OPTIONS: { id: AccessoryTheme | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Themes', icon: '✨' },
  { id: 'explorer', label: 'Explorer', icon: '🧭' },
  { id: 'pirate', label: 'Pirate', icon: '🏴‍☠️' },
  { id: 'glow', label: 'Glow', icon: '🌟' },
  { id: 'cozy', label: 'Cozy', icon: '🪸' },
];

export const WardrobeDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  look,
  sandDollars,
  ownedAccessories,
  equipped,
  onBuyItem,
  onBuyBoost,
  onEquipItem,
  onUnequipItem,
  onChangeLook,
}) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'closet'>('shop');
  const [selectedSlot, setSelectedSlot] = useState<AccessorySlot | 'all' | 'boosts'>('all');
  const [selectedTheme, setSelectedTheme] = useState<AccessoryTheme | 'all'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sparkleSlot, setSparkleSlot] = useState<string | null>(null);

  // Local preview overrides for trying on items before purchasing
  const [previewOverrides, setPreviewOverrides] = useState<Partial<Record<AccessorySlot, string | null>>>({});

  // Compute live display look for the preview avatar
  const displayEquipped: EquippedAccessories = { ...equipped };
  (Object.keys(previewOverrides) as AccessorySlot[]).forEach((slot) => {
    const val = previewOverrides[slot];
    if (val === null) {
      delete displayEquipped[slot];
    } else if (val) {
      displayEquipped[slot] = val;
    }
  });

  const previewedSlots = Object.keys(previewOverrides) as AccessorySlot[];
  const isPreviewMode = previewedSlots.length > 0;

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3800);
  };

  const handleClearPreview = () => {
    soundManager.playBlub();
    setPreviewOverrides({});
    showToast('Reverted to your equipped wardrobe.');
  };

  const handleClose = () => {
    setPreviewOverrides({});
    onClose();
  };

  const handleBuy = (item: AccessoryItem) => {
    if (sandDollars < item.price) return;
    const success = onBuyItem(item);
    if (success) {
      soundManager.playSparkle();
      setSparkleSlot(item.slot);
      setTimeout(() => setSparkleSlot(null), 1200);
      // Automatically equip the newly bought item and clear preview override for this slot
      onEquipItem(item.slot, item.id);
      setPreviewOverrides((prev) => {
        const next = { ...prev };
        delete next[item.slot];
        return next;
      });
      showToast(`Bought and equipped ${item.name}! That looks lovely on you!`);
    }
  };

  const handleBuyBoostItem = (boost: BoostItem) => {
    if (sandDollars < boost.price) return;
    const success = onBuyBoost(boost);
    if (success) {
      soundManager.playSparkle();
      showToast(`Wishing Shell acquired! +50% bonus on your next dive.`);
    }
  };

  const handleToggleEquip = (item: AccessoryItem) => {
    // Clear preview override for this slot if any
    if (previewOverrides[item.slot] !== undefined) {
      setPreviewOverrides((prev) => {
        const next = { ...prev };
        delete next[item.slot];
        return next;
      });
    }

    const isEquipped = equipped[item.slot] === item.id;
    if (isEquipped) {
      soundManager.playBlub();
      onUnequipItem(item.slot);
    } else {
      soundManager.playSparkle();
      setSparkleSlot(item.slot);
      setTimeout(() => setSparkleSlot(null), 1200);
      onEquipItem(item.slot, item.id);
    }
  };

  const handleTogglePreview = (item: AccessoryItem) => {
    if (previewOverrides[item.slot] === item.id) {
      // Toggle off preview for this slot
      soundManager.playBlub();
      setPreviewOverrides((prev) => {
        const next = { ...prev };
        delete next[item.slot];
        return next;
      });
      showToast(`Removed preview of ${item.name}.`);
    } else {
      // Try it on!
      soundManager.playSparkle();
      setSparkleSlot(item.slot);
      setTimeout(() => setSparkleSlot(null), 1200);
      setPreviewOverrides((prev) => ({
        ...prev,
        [item.slot]: item.id,
      }));
      showToast(`Trying on ${item.name}! See preview above.`);
    }
  };

  // Filter & sort shop items
  const filteredShopItems = ACCESSORY_CATALOG.filter((item) => {
    const matchesSlot = selectedSlot === 'all' || item.slot === selectedSlot;
    const matchesTheme =
      selectedTheme === 'all' || (item.themes && item.themes.includes(selectedTheme));
    return matchesSlot && matchesTheme;
  }).sort((a, b) => {
    const slotDiff = SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot);
    if (slotDiff !== 0) return slotDiff;
    return a.price - b.price;
  });

  const ownedItemObjects = ACCESSORY_CATALOG.filter((item) =>
    ownedAccessories.includes(item.id)
  );

  const filteredClosetItems = ownedItemObjects
    .filter((item) => {
      const matchesSlot =
        selectedSlot === 'all' || selectedSlot === 'boosts' || item.slot === selectedSlot;
      const matchesTheme =
        selectedTheme === 'all' || (item.themes && item.themes.includes(selectedTheme));
      return matchesSlot && matchesTheme;
    })
    .sort((a, b) => {
      const slotDiff = SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot);
      if (slotDiff !== 0) return slotDiff;
      return a.price - b.price;
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm transition-all duration-300">
      {/* Background Click to dismiss */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg h-full bg-gradient-to-b from-sky-950/95 via-slate-900/95 to-slate-950/95 text-white flex flex-col shadow-2xl border-l border-white/15 overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Soft Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-teal-500/90 text-white font-medium text-sm shadow-lg backdrop-blur-md flex items-center gap-2 border border-teal-300/40 animate-in fade-in slide-in-from-top-2 duration-200">
            <Heart size={16} className="text-pink-200 fill-pink-200" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white">
              <ShoppingBag className="text-teal-300" size={20} />
              Wardrobe & Style
            </h2>
            <p className="text-xs text-cyan-200/70">
              Personalize your underwater explorer
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sand Dollars Pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 font-bold text-xs shadow-inner"
              title="Your Sand Dollars balance"
            >
              <SandDollarIcon size={18} animate />
              <span>{sandDollars}</span>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Wardrobe"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Live Avatar Preview Section */}
        <div className="relative bg-gradient-to-b from-cyan-900/40 to-transparent p-4 flex flex-col items-center justify-center border-b border-white/10">
          <div className="absolute w-44 h-44 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />

          {/* Sparkle burst on equip */}
          {sparkleSlot && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-200 text-xs font-semibold animate-pulse border border-amber-300/40">
                <Sparkles size={14} className="text-amber-300" />
                Updated {SLOT_LABELS[sparkleSlot as AccessorySlot] || 'Look'}!
              </div>
            </div>
          )}

          {/* Previewing Try-On Mode Pill */}
          {isPreviewMode && (
            <div className="mb-2 flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/25 border border-amber-400/50 text-amber-200 text-xs font-semibold shadow-md backdrop-blur-md animate-in fade-in">
              <Eye size={13} className="text-amber-300 animate-pulse" />
              <span>Trying on {previewedSlots.length} {previewedSlots.length === 1 ? 'item' : 'items'} (Preview)</span>
              <button
                type="button"
                onClick={handleClearPreview}
                className="ml-1 text-[11px] font-bold text-amber-300 hover:text-white underline underline-offset-2 transition-colors cursor-pointer flex items-center gap-0.5"
                title="Reset preview back to your equipped accessories"
              >
                <RotateCcw size={11} />
                Reset
              </button>
            </div>
          )}

          {/* Large Live Avatar Preview */}
          <div className="relative py-1">
            <AvatarIllustration
              key={`wardrobe-preview-${look.preset}-${look.skinTone}-${look.hairStyle}-${look.hairColor}-${look.tailPattern}`}
              look={look}
              equipped={displayEquipped}
              expression="bright"
              className="w-32 h-44 drop-shadow-xl"
            />
          </div>

          <div className="mt-1 flex items-center gap-3">
            <span className="text-sm font-semibold text-white/90">
              {look.name || 'Diver'}
            </span>
            <span className="text-white/30">•</span>
            {/* "Change Look" Button */}
            <button
              onClick={() => {
                soundManager.playBlub();
                onChangeLook();
              }}
              className="inline-flex items-center gap-1 text-xs text-teal-300 hover:text-teal-200 underline underline-offset-2 transition-colors cursor-pointer"
            >
              <Palette size={13} />
              Change my look
            </button>
          </div>
        </div>

        {/* Tabs: Shop vs My Closet */}
        <div className="flex border-b border-white/10 bg-white/5">
          <button
            onClick={() => {
              soundManager.playBlub();
              setActiveTab('shop');
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all border-b-2 cursor-pointer ${
              activeTab === 'shop'
                ? 'border-cyan-400 text-cyan-200 bg-white/5'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag size={15} />
            Shop ({ACCESSORY_CATALOG.length})
          </button>
          <button
            onClick={() => {
              soundManager.playBlub();
              setActiveTab('closet');
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all border-b-2 cursor-pointer ${
              activeTab === 'closet'
                ? 'border-cyan-400 text-cyan-200 bg-white/5'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles size={15} />
            My Closet ({ownedAccessories.length})
          </button>
        </div>

        {/* Slot Category Filter Chips */}
        <div className="px-3 pt-2.5 pb-1 border-b border-white/10 overflow-x-auto scrollbar-none flex items-center gap-1.5 text-xs">
          {(
            [
              'all',
              'head',
              'neck',
              'top',
              'wrists',
              'tail',
              'hand',
              'back',
              'companion',
              'boosts',
            ] as (AccessorySlot | 'all' | 'boosts')[]
          ).map((slot) => {
            if (slot === 'boosts' && activeTab === 'closet') return null;

            const isSelected = selectedSlot === slot;
            return (
              <button
                key={slot}
                onClick={() => {
                  soundManager.playBlub();
                  setSelectedSlot(slot);
                }}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-medium cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 shadow-sm'
                    : 'bg-white/10 hover:bg-white/15 text-white/70 border border-transparent'
                }`}
              >
                {SLOT_LABELS[slot]}
              </button>
            );
          })}
        </div>

        {/* Theme Filter Chips (Explorer, Pirate, Glow, Cozy) */}
        <div className="px-3 py-1.5 border-b border-white/10 overflow-x-auto scrollbar-none flex items-center gap-1.5 text-[11px] bg-slate-950/20">
          <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider mr-1">
            Theme:
          </span>
          {THEME_OPTIONS.map((theme) => {
            const isSelected = selectedTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  soundManager.playBlub();
                  setSelectedTheme(theme.id);
                }}
                className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-all font-medium flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400/25 border border-amber-300/40 text-amber-200 shadow-sm font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-white/60 border border-transparent'
                }`}
              >
                <span>{theme.icon}</span>
                <span>{theme.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* VISIBLE "NONE" OPTION FOR CURRENTLY SELECTED SLOT */}
          {selectedSlot !== 'all' && selectedSlot !== 'boosts' && (
            <div className="p-3 rounded-2xl border border-white/15 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/60">
                  <Ban size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">None (Unequip {SLOT_LABELS[selectedSlot]})</div>
                  <div className="text-[11px] text-white/50">Keep this slot bare</div>
                </div>
              </div>

              {displayEquipped[selectedSlot] ? (
                <button
                  onClick={() => {
                    soundManager.playBlub();
                    if (previewOverrides[selectedSlot] !== undefined) {
                      setPreviewOverrides((prev) => {
                        const next = { ...prev };
                        delete next[selectedSlot];
                        return next;
                      });
                    }
                    if (equipped[selectedSlot]) {
                      onUnequipItem(selectedSlot);
                    }
                    showToast(`Removed item from ${SLOT_LABELS[selectedSlot]}.`);
                  }}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/25 hover:bg-rose-500/35 text-rose-200 border border-rose-400/40 transition-colors cursor-pointer"
                >
                  Unequip
                </button>
              ) : (
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <Check size={13} /> Empty
                </span>
              )}
            </div>
          )}

          {activeTab === 'shop' ? (
            <>
              {/* Boosts Section (if "all" or "boosts" selected) */}
              {(selectedSlot === 'all' || selectedSlot === 'boosts') && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles size={13} />
                    Ocean Boosts
                  </h3>
                  <div className="space-y-2">
                    {BOOSTS_CATALOG.map((boost) => {
                      const canAfford = sandDollars >= boost.price;
                      return (
                        <div
                          key={boost.id}
                          className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 to-teal-500/10 border border-amber-300/30 flex items-center justify-between gap-3 shadow-sm"
                        >
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                              <span>🐚</span>
                              {boost.name}
                            </div>
                            <p className="text-xs text-white/70 mt-0.5">
                              {boost.description}
                            </p>
                            <span className="text-[11px] font-semibold text-amber-200 mt-1 inline-block">
                              {boost.effect}
                            </span>
                          </div>

                          <button
                            onClick={() => handleBuyBoostItem(boost)}
                            disabled={!canAfford}
                            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                              canAfford
                                ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 active:scale-95 shadow-md'
                                : 'bg-white/10 text-white/40 cursor-not-allowed'
                            }`}
                          >
                            <SandDollarIcon size={15} />
                            <span>{boost.price}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Accessories Grid */}
              {selectedSlot !== 'boosts' && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                      {SLOT_LABELS[selectedSlot]} ({filteredShopItems.length})
                    </h3>
                    {selectedTheme !== 'all' && (
                      <span className="text-[10px] text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-300/30 font-medium">
                        Filtered by {selectedTheme}
                      </span>
                    )}
                  </div>

                  {filteredShopItems.length === 0 ? (
                    <div className="p-6 text-center bg-white/5 rounded-2xl border border-white/10 text-xs text-white/60">
                      No items matching this theme in this slot.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {filteredShopItems.map((item) => {
                        const isOwned = ownedAccessories.includes(item.id);
                        const isEquipped = equipped[item.slot] === item.id;
                        const isPreviewing = previewOverrides[item.slot] === item.id;
                        const isFree = item.price === 0;
                        const canAfford = isFree || sandDollars >= item.price;

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              if (isOwned) {
                                handleToggleEquip(item);
                              } else {
                                handleTogglePreview(item);
                              }
                            }}
                            className={`p-3 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                              isPreviewing
                                ? 'bg-amber-500/20 border-amber-400/70 shadow-lg ring-2 ring-amber-400/50'
                                : isEquipped
                                ? 'bg-cyan-500/20 border-cyan-400/50 shadow-md ring-1 ring-cyan-400/30'
                                : isOwned
                                ? 'bg-white/10 hover:bg-white/15 border-white/20'
                                : 'bg-white/5 hover:bg-white/10 border-white/15'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-bold text-sm text-white leading-tight">
                                  {item.name}
                                </h4>
                                <div className="flex items-center gap-1">
                                  {isPreviewing && (
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-200 border border-amber-300/40 flex items-center gap-1 animate-pulse">
                                      <Eye size={11} /> Trying On
                                    </span>
                                  )}
                                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                                    {item.slot}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-white/60 mt-1 line-clamp-2">
                                {item.description}
                              </p>
                              {item.themes && item.themes.length > 0 && (
                                <div className="flex gap-1 mt-1.5">
                                  {item.themes.map((t) => (
                                    <span
                                      key={t}
                                      className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-cyan-200/70 border border-white/5 uppercase font-medium"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                              {isOwned ? (
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                                    <Check size={13} /> Owned
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleEquip(item);
                                    }}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                      isEquipped
                                        ? 'bg-rose-500/30 hover:bg-rose-500/40 text-rose-200 border border-rose-400/40'
                                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm'
                                    }`}
                                  >
                                    {isEquipped ? 'Unequip' : 'Equip'}
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between w-full gap-2">
                                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 shrink-0">
                                    {isFree ? (
                                      <span className="text-emerald-300 font-bold">Free</span>
                                    ) : (
                                      <>
                                        <SandDollarIcon size={14} />
                                        <span>{item.price}</span>
                                      </>
                                    )}
                                  </span>

                                  <div className="flex items-center gap-1.5">
                                    {/* Try On / Take Off Toggle Button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTogglePreview(item);
                                      }}
                                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                        isPreviewing
                                          ? 'bg-amber-400/35 hover:bg-amber-400/50 text-amber-100 border border-amber-300/60 shadow-sm'
                                          : 'bg-white/10 hover:bg-white/20 text-cyan-200 border border-cyan-400/30'
                                      }`}
                                      title="Try on this item on your avatar above before buying"
                                    >
                                      <Eye size={12} className={isPreviewing ? 'text-amber-300' : 'text-cyan-300'} />
                                      <span>{isPreviewing ? 'Take off' : 'Try on'}</span>
                                    </button>

                                    {/* Buy Button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleBuy(item);
                                      }}
                                      disabled={!canAfford}
                                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                        canAfford
                                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 active:scale-95 shadow-md font-bold'
                                          : 'bg-white/10 text-white/40 cursor-not-allowed'
                                      }`}
                                    >
                                      {isFree ? 'Claim' : canAfford ? 'Buy' : 'Need $'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* My Closet Tab */
            <div>
              {/* Slot None action in closet if specific slot is selected */}
              {selectedSlot !== 'all' && selectedSlot !== 'boosts' && (
                <div className="mb-3" />
              )}

              {filteredClosetItems.length === 0 ? (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-3xl mb-2">🐚</div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    No items found here
                  </h4>
                  <p className="text-xs text-white/60 mb-4">
                    {ownedAccessories.length === 0
                      ? 'Your closet is currently empty. Visit the Shop to discover treasures!'
                      : 'You do not own any items in this slot or theme yet.'}
                  </p>
                  <button
                    onClick={() => {
                      soundManager.playBlub();
                      setActiveTab('shop');
                      setSelectedSlot('all');
                      setSelectedTheme('all');
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Browse the Shop
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredClosetItems.map((item) => {
                    const isEquipped = equipped[item.slot] === item.id;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleEquip(item)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isEquipped
                            ? 'bg-cyan-500/20 border-cyan-400/60 shadow-lg ring-2 ring-cyan-400/40'
                            : 'bg-white/10 hover:bg-white/15 border-white/15'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-sm text-white leading-tight">
                              {item.name}
                            </h4>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                              {item.slot}
                            </span>
                          </div>
                          <p className="text-xs text-white/60 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                          <span
                            className={`text-xs font-bold flex items-center gap-1 ${
                              isEquipped ? 'text-cyan-300' : 'text-white/50'
                            }`}
                          >
                            {isEquipped ? (
                              <>
                                <Check size={14} /> Equipped
                              </>
                            ) : (
                              'Tap to wear'
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleEquip(item);
                            }}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isEquipped
                                ? 'bg-rose-500/30 hover:bg-rose-500/40 text-rose-200 border border-rose-400/40'
                                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm'
                            }`}
                          >
                            {isEquipped ? 'Unequip' : 'Wear'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
