import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DiveLog, AvatarLook, EquippedAccessories } from '../types';
import { X, TrendingDown, Award, Compass, History, Volume2, Palette, ShoppingBag } from 'lucide-react';
import { AvatarIllustration } from './AvatarIllustration';
import { SandDollarIcon } from './SandDollarIcon';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface Props {
  dives: DiveLog[];
  look?: AvatarLook;
  equipped?: EquippedAccessories;
  sandDollars?: number;
  onClose: () => void;
  onReplayNarration: (text: string) => void;
  onClearDives: () => void;
  onChangeLook?: () => void;
  onOpenWardrobe?: () => void;
}

export const DiveChart: React.FC<Props> = ({
  dives,
  look,
  equipped = {},
  sandDollars = 0,
  onClose,
  onReplayNarration,
  onClearDives,
  onChangeLook,
  onOpenWardrobe,
}) => {
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);
  const [viewHistoryTab, setViewHistoryTab] = React.useState<'chart' | 'log'>('chart');

  // Generate plain language summary
  const summaryInsight = React.useMemo(() => {
    if (!dives.length) return 'No dives logged yet. Take your first dive today!';

    let deepest = dives[0];
    let shallowest = dives[0];

    for (const d of dives) {
      if (d.depth > deepest.depth) deepest = d;
      if (d.depth < shallowest.depth) shallowest = d;
    }

    if (dives.length === 1) {
      return `Your first dive reached ${deepest.depth}m in the ${deepest.zone}. A lovely start to your ocean journey.`;
    }

    return `${deepest.dayOfWeek || 'Earlier'} was your deepest dive at ${deepest.depth}m; ${
      shallowest.dayOfWeek || 'another day'
    } brought you back up to ${shallowest.depth}m in the ${shallowest.zone}.`;
  }, [dives]);

  // Aggregate stats
  const stats = React.useMemo(() => {
    if (!dives.length) return { totalDives: 0, deepest: 0, avgDepth: 0, totalPoints: 0 };
    const totalDives = dives.length;
    const deepest = Math.max(...dives.map((d) => d.depth));
    const avgDepth = Math.round(dives.reduce((acc, d) => acc + d.depth, 0) / totalDives);
    const totalPoints = dives.reduce((acc, d) => acc + d.points, 0);
    return { totalDives, deepest, avgDepth, totalPoints };
  }, [dives]);

  // Chart data configuration
  const chartData = {
    labels: dives.map((d) => d.dayOfWeek || new Date(d.timestamp).toLocaleDateString([], { weekday: 'short' })),
    datasets: [
      {
        label: 'Depth (meters)',
        data: dives.map((d) => d.depth),
        fill: true,
        borderColor: '#22D3EE',
        backgroundColor: 'rgba(34, 211, 238, 0.15)',
        pointBackgroundColor: '#06B6D4',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.35,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        reverse: true, // Depth INCREASES DOWNWARD! Surface (0m) at top!
        min: 0,
        max: 140,
        title: {
          display: true,
          text: 'Depth (meters) ↓ Deeper',
          color: '#94A3B8',
          font: { family: 'Nunito, sans-serif', size: 12, weight: 'bold' },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
        },
        ticks: {
          color: '#CBD5E1',
          callback: (value: any) => `${value}m`,
          stepSize: 20,
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.06)',
        },
        ticks: {
          color: '#E2E8F0',
          font: { family: 'Nunito, sans-serif', weight: 'bold' },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#38BDF8',
        bodyColor: '#F8FAFC',
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (context: any) => {
            const dive = dives[context.dataIndex];
            return [
              `Depth: ${dive.depth}m (${dive.zone})`,
              `Points: +${dive.points} pts`,
              dive.summary ? `Blub: "${dive.summary}"` : '',
            ].filter(Boolean);
          },
        },
      },
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900/95 border border-cyan-500/30 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/60 to-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300">
              <TrendingDown size={24} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-cyan-200">
                Dive Profile & Log History
              </h2>
              <p className="text-xs text-slate-300">
                Tracking your emotional depths over time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Close dive profile"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-5 pt-3 pb-1 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
          <div className="flex gap-2">
            <button
              onClick={() => setViewHistoryTab('chart')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewHistoryTab === 'chart'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              Depth Profile Chart
            </button>
            <button
              onClick={() => setViewHistoryTab('log')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewHistoryTab === 'log'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              Journal Logs ({dives.length})
            </button>
          </div>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-[11px] text-rose-300/80 hover:text-rose-200 hover:underline transition-colors"
          >
            Delete my dives
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Avatar Profile & Look Card */}
          {look && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/70 via-cyan-950/60 to-slate-900/80 border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-white/10 p-1 border border-white/20 flex items-center justify-center overflow-hidden shadow-inner">
                  <AvatarIllustration
                    look={look}
                    equipped={equipped}
                    thumbnailMode
                    className="w-12 h-12"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">{look.name || 'Ocean Diver'}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-300/30">
                      {look.preset === 'mermaid' ? 'Mermaid' : look.preset === 'merman' ? 'Merman' : 'Merfolk'}
                    </span>
                  </div>
                  <p className="text-xs text-cyan-200/70 mt-0.5 flex items-center gap-1.5">
                    <SandDollarIcon size={14} />
                    <span>{sandDollars} Sand Dollars</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onChangeLook && (
                  <button
                    onClick={() => {
                      onClose();
                      onChangeLook();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                  >
                    <Palette size={14} />
                    <span>Change my look</span>
                  </button>
                )}
                {onOpenWardrobe && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenWardrobe();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                  >
                    <ShoppingBag size={14} />
                    <span>Wardrobe</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Plain Language Summary Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-900/40 via-teal-900/30 to-blue-900/40 border border-cyan-400/30">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold mb-1">
              <Compass size={15} />
              <span>Blub's Journey Insight</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              "{summaryInsight}"
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="text-[11px] text-slate-400 font-semibold">Total Dives</div>
              <div className="text-xl font-black text-cyan-300">{stats.totalDives}</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="text-[11px] text-slate-400 font-semibold">Deepest Plunge</div>
              <div className="text-xl font-black text-indigo-300">{stats.deepest} m</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="text-[11px] text-slate-400 font-semibold">Average Depth</div>
              <div className="text-xl font-black text-teal-300">{stats.avgDepth} m</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="text-[11px] text-slate-400 font-semibold">Exploration Pts</div>
              <div className="text-xl font-black text-amber-300">{stats.totalPoints}</div>
            </div>
          </div>

          {viewHistoryTab === 'chart' ? (
            <div>
              {/* Depth Chart with accessible aria label */}
              <div
                className="h-64 sm:h-72 w-full p-2 rounded-2xl bg-slate-950/50 border border-white/10"
                role="region"
                aria-label="Interactive line chart showing depth over time, with depth increasing downwards"
              >
                <Line data={chartData} options={chartOptions} />
              </div>

              {/* Accessible text table description for screen readers */}
              <div className="mt-3 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Screen reader overview: </span>
                Depth values increase downward from 0m (sunlit surface) down to 140m (the trench).
                {dives.map((d, i) => (
                  <span key={`sr-dive-${d.id || d.timestamp || 'item'}-${i}`} className="inline-block mr-2">
                    {d.dayOfWeek}: {d.depth}m ({d.zone}).
                  </span>
                ))}
              </div>
            </div>
          ) : (
            /* Journal Entries List */
            <div className="space-y-3">
              {dives.map((dive, idx) => (
                <div
                  key={`log-entry-${dive.id || dive.timestamp || 'entry'}-${idx}`}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/30 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-300">
                      {dive.dayOfWeek} • {dive.dateStr}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-900/60 text-cyan-200 font-semibold">
                      {dive.depth}m ({dive.zone}) • +{dive.points} pts
                    </span>
                  </div>

                  {dive.text ? (
                    <p className="text-sm text-slate-200 italic font-normal">
                      "{dive.text}"
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      (Logged via mood check: {dive.sliderMood}/5)
                    </p>
                  )}

                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-teal-200 font-medium">
                      Blub: "{dive.summary}"
                    </div>

                    <button
                      onClick={() => onReplayNarration(dive.summary)}
                      className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Listen to Blub"
                    >
                      <Volume2 size={13} />
                      <span>Replay Voice</span>
                    </button>
                  </div>

                  {dive.gentleNote && (
                    <div className="text-xs text-amber-200/90 font-medium bg-amber-500/10 p-2 rounded-xl border border-amber-300/20">
                      Comfort Note: {dive.gentleNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showClearConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
            <div className="max-w-md p-6 rounded-3xl bg-slate-900 border border-rose-500/40 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <X size={24} />
              </div>
              <h3 className="text-lg font-black text-white">Reset all dive logs?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                This will erase all saved dives, clear your depth history, reset your avatar look & wardrobe, and reset your creature field guide so you can start a fresh ocean expedition.
              </p>

              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                >
                  Cancel & Keep Dives
                </button>
                <button
                  onClick={() => {
                    onClearDives();
                    setShowClearConfirm(false);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/50 transition-all"
                >
                  Yes, Reset Everything
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
