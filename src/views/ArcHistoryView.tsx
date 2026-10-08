import React, { useState } from 'react';
import { 
  History, 
  Trophy, 
  Flame, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Dumbbell, 
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AppState, ArchivedArc } from '../types';
import { formatDateDisplay } from '../utils/date';

interface ArcHistoryViewProps {
  state: AppState;
}

export const ArcHistoryView: React.FC<ArcHistoryViewProps> = ({ state }) => {
  const [expandedArcId, setExpandedArcId] = useState<string | null>(null);
  const archives = state.archivedArcs || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
            Winter Arc Archives
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Historical records of your completed seasons of discipline. Permanent and unalterable.
        </p>

        <div className="mt-4 text-xs font-mono text-cyan-400">
          {archives.length} Archived Seasons on Record
        </div>
      </section>

      {/* Archives List */}
      <section className="space-y-4">
        {archives.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-[#080d19]/50 border border-dashed border-slate-800 p-6">
            <History className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-base text-slate-300 font-medium">No archived Arcs yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              When your current transformation reaches culmination, its final statistics and reflection will be archived here.
            </p>
          </div>
        ) : (
          archives.map((arc) => {
            const isExpanded = expandedArcId === arc.id;
            const stats = arc.finalStats;

            return (
              <div
                key={arc.id}
                className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/25 p-6 md:p-8 shadow-xl text-slate-200"
              >
                <div
                  onClick={() => setExpandedArcId(isExpanded ? null : arc.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
                        {arc.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        ({arc.durationDays} Days)
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white mt-1">
                      {arc.mainGoal}
                    </h2>
                    <span className="text-xs font-mono text-slate-400 mt-1 block">
                      {formatDateDisplay(arc.startDate)} → {formatDateDisplay(arc.endDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-mono text-slate-400 uppercase block">Final Score</span>
                      <span className="text-2xl font-black font-mono text-cyan-300">
                        {stats.finalScore} / 100
                      </span>
                    </div>

                    <button
                      type="button"
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Final Stats Overview */}
                <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-black/40 border border-slate-800 text-center">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Longest Streak</span>
                    <span className="text-lg font-bold font-mono text-amber-300">{stats.longestStreak}d</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-slate-800 text-center">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Perfect Days</span>
                    <span className="text-lg font-bold font-mono text-cyan-300">{stats.perfectDays}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-slate-800 text-center">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Workouts</span>
                    <span className="text-lg font-bold font-mono text-emerald-300">{stats.workoutMinutes}m</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-slate-800 text-center">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Focus Sessions</span>
                    <span className="text-lg font-bold font-mono text-white">{stats.focusSessions}</span>
                  </div>
                </div>

                {/* Expanded Reflection */}
                {isExpanded && (
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <span className="text-xs font-mono uppercase tracking-widest text-cyan-300 block mb-2 font-bold">
                      Who You Became (Final Reflection):
                    </span>
                    <blockquote className="p-4 rounded-2xl bg-black/50 border border-slate-800 text-sm text-slate-300 italic leading-relaxed whitespace-pre-wrap">
                      "{arc.finalReflection}"
                    </blockquote>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};
