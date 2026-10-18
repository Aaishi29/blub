import React, { useState } from 'react';
import { CREATURES, getZoneDetails } from '../data/creatures';
import { CreatureIllustration } from './CreatureIllustration';
import { DepthZone } from '../types';
import { Sparkles, Compass, CheckCircle2, Lock, X } from 'lucide-react';

interface Props {
  unlockedCreatureIds: Set<string>;
  onClose: () => void;
  onSelectCreature?: (id: string) => void;
}

export const FieldGuide: React.FC<Props> = ({ unlockedCreatureIds, onClose, onSelectCreature }) => {
  const [activeZone, setActiveZone] = useState<DepthZone | 'all'>('all');
  const [selectedCreatureId, setSelectedCreatureId] = useState<string | null>(null);

  const filteredCreatures = CREATURES.filter(
    (c) => activeZone === 'all' || c.zone === activeZone
  );

  const totalCount = CREATURES.length;
  const unlockedCount = CREATURES.filter((c) => unlockedCreatureIds.has(c.id)).length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const inspectedCreature = selectedCreatureId
    ? CREATURES.find((c) => c.id === selectedCreatureId)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900/90 border border-cyan-500/30 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-teal-900/50 to-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300">
              <Compass size={24} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-cyan-200">
                Ocean Field Guide
              </h2>
              <p className="text-xs text-slate-300">
                Discover and catalog the gentle companions of every ocean depth
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Close field guide"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar & Filter Pills */}
        <div className="p-4 bg-slate-950/40 border-b border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-300" />
              Discovered: {unlockedCount} / {totalCount} ({progressPercent}%)
            </span>
            <span className="text-[11px] text-cyan-400 font-medium">
              {unlockedCount === totalCount
                ? 'Master Explorer! All species found 🎉'
                : 'Keep logging dives to meet more friends!'}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400 transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Zone filters */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(['all', 'sunlight', 'twilight', 'midnight', 'abyss', 'trench'] as const).map((z) => {
              const label = z === 'all' ? 'All (15)' : `${getZoneDetails(z).emoji} ${getZoneDetails(z).name.replace(' Zone', '')}`;
              return (
                <button
                  key={z}
                  onClick={() => setActiveZone(z)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    activeZone === z
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                      : 'bg-white/10 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid of Creatures */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {filteredCreatures.map((creature) => {
            const isUnlocked = unlockedCreatureIds.has(creature.id);
            const zoneInfo = getZoneDetails(creature.zone);

            return (
              <div
                key={creature.id}
                onClick={() => setSelectedCreatureId(creature.id)}
                className={`p-3 rounded-2xl border transition-all text-center cursor-pointer flex flex-col items-center justify-between ${
                  isUnlocked
                    ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-cyan-400/50 hover:scale-102 shadow-lg'
                    : 'bg-black/40 border-white/5 opacity-60 hover:opacity-75'
                }`}
              >
                <div className="w-20 h-20 my-1 flex items-center justify-center">
                  <CreatureIllustration
                    id={creature.id}
                    className="w-full h-full"
                    silhouette={!isUnlocked}
                  />
                </div>

                <div className="w-full mt-2">
                  <div className="font-bold text-sm truncate text-white">
                    {isUnlocked ? creature.name : '???'}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {isUnlocked ? creature.species : `${zoneInfo.name}`}
                  </div>
                </div>

                <div className="mt-2 w-full flex items-center justify-center gap-1">
                  {isUnlocked ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={10} /> Discovered
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium flex items-center gap-1">
                      <Lock size={10} /> {creature.minDepth} - {creature.maxDepth}m
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Modal / Drawer if a creature is clicked */}
        {inspectedCreature && (
          <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/90 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0">
              <CreatureIllustration
                id={inspectedCreature.id}
                className="w-full h-full"
                silhouette={!unlockedCreatureIds.has(inspectedCreature.id)}
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h4 className="font-extrabold text-base text-cyan-300">
                  {unlockedCreatureIds.has(inspectedCreature.id)
                    ? `${inspectedCreature.name} the ${inspectedCreature.species}`
                    : `Unknown Species (${inspectedCreature.zone})`}
                </h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-200">
                  {inspectedCreature.minDepth}m - {inspectedCreature.maxDepth}m depth
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-1">
                {unlockedCreatureIds.has(inspectedCreature.id)
                  ? inspectedCreature.funFact
                  : `Log dives around ${inspectedCreature.minDepth}m to discover this shy swimmer.`}
              </p>

              <div className="text-[11px] text-amber-200/90 font-medium mt-1">
                Distinguishing pattern: {inspectedCreature.pattern}
              </div>
            </div>

            <button
              onClick={() => setSelectedCreatureId(null)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
            >
              Close Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
