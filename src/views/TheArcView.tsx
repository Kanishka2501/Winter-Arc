import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Droplet, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Dumbbell, 
  BookOpen, 
  Timer, 
  ChevronRight, 
  Shield, 
  Info 
} from 'lucide-react';
import { AppState, DailyRecord } from '../types';
import { useToast } from '../components/Toast';
import { 
  getLocalDateString, 
  getDateRangeArray, 
  formatDateDisplay, 
  isPastDate, 
  isFutureDate, 
  isTodayDate,
  daysBetween
} from '../utils/date';

interface TheArcViewProps {
  state: AppState;
  onOpenReset: () => void;
  onTriggerCompletion: () => void;
}

export const TheArcView: React.FC<TheArcViewProps> = ({
  state,
  onOpenReset,
  onTriggerCompletion
}) => {
  const arc = state.currentArc;
  const todayStr = getLocalDateString();
  const { showToast } = useToast();
  const [inspectedDate, setInspectedDate] = useState<string | null>(null);

  if (!arc) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>No active Winter Arc configured.</p>
      </div>
    );
  }

  const allDates = getDateRangeArray(arc.startDate, arc.endDate);
  const totalDays = Math.max(1, daysBetween(arc.startDate, arc.endDate) + 1);
  const daysPassed = Math.max(1, Math.min(totalDays, daysBetween(arc.startDate, todayStr) + 1));
  const daysRemaining = Math.max(0, daysBetween(todayStr, arc.endDate));
  const isArcReachedEnd = todayStr >= arc.endDate;

  const handleCulminateClick = () => {
    if (!isArcReachedEnd) {
      showToast(
        'Arc In Progress',
        `This Arc reaches culmination on ${formatDateDisplay(arc.endDate)} (${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining).`,
        'info'
      );
      return;
    }
    onTriggerCompletion();
  };

  // Determine state for each calendar day
  const getDayState = (dateStr: string): 'FUTURE' | 'MISSED' | 'PARTIAL' | 'COMPLETE' | 'PERFECT' => {
    const isFuture = isFutureDate(dateStr, todayStr);
    if (isFuture) return 'FUTURE';

    const record = state.dailyRecords[dateStr];
    const score = record ? record.score : 0;

    if (score >= 90) return 'PERFECT';
    if (score >= 50) return 'COMPLETE';
    if (score > 0) return 'PARTIAL';
    return 'MISSED';
  };

  const inspectedRecord = inspectedDate ? state.dailyRecords[inspectedDate] : null;
  const inspectedWorkouts = inspectedDate ? state.workouts.filter(w => w.date === inspectedDate) : [];
  const inspectedStudy = inspectedDate ? state.studySessions.filter(s => s.date === inspectedDate) : [];
  const inspectedFocus = inspectedDate ? state.focusSessions.filter(f => f.date === inspectedDate) : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header & Overview */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-10 shadow-2xl shadow-cyan-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-cyan-300 mb-2">
              Architectural Protocol
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">
              {arc.name}
            </h1>
            <p className="mt-2 text-sm text-cyan-200/80 font-mono">
              Timeline: {formatDateDisplay(arc.startDate)} → {formatDateDisplay(arc.endDate)} ({totalDays} Days)
            </p>
            <p className="mt-3 text-sm text-slate-300 max-w-xl">
              <span className="text-cyan-400 font-semibold">Contract:</span> {arc.mainGoal}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenReset}
              className="px-4 py-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
            >
              Reset Protocol
            </button>
            <button
              type="button"
              onClick={handleCulminateClick}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer ${
                isArcReachedEnd
                  ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700'
              }`}
            >
              {isArcReachedEnd ? 'Review & Culminate Arc' : `Culmination (Day ${totalDays})`}
            </button>
          </div>
        </div>

        {/* Standards Grid */}
        <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/15 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Wake Standard</span>
              <span className="text-base font-bold font-mono text-white">{arc.wakeTime}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/15 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Sleep Standard</span>
              <span className="text-base font-bold font-mono text-white">{arc.sleepTime}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/15 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Hydration Target</span>
              <span className="text-base font-bold font-mono text-white">{state.profile.dailyWaterLiters} Liters</span>
            </div>
          </div>
        </div>
      </section>

      {/* Arc Heatmap Calendar */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase">
                Arc Calendar Heatmap
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Every day of your transformation. Click any cell to inspect authentic stored metrics.
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-cyan-400" />
              <span>Perfect (90+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-cyan-700" />
              <span>Complete (50-89)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-amber-700/60" />
              <span>Partial (1-49)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-slate-800" />
              <span>Missed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm border border-slate-700 bg-transparent" />
              <span>Future</span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-14 lg:grid-cols-15 gap-2 select-none">
          {allDates.map((dateStr, idx) => {
            const dayStatus = getDayState(dateStr);
            const isToday = isTodayDate(dateStr);
            const isSelected = inspectedDate === dateStr;
            const record = state.dailyRecords[dateStr];
            const score = record ? record.score : 0;

            let bgColor = 'bg-slate-900/60 border-slate-800 text-slate-500';
            if (dayStatus === 'PERFECT') {
              bgColor = 'bg-cyan-400 border-cyan-300 text-slate-950 font-bold';
            } else if (dayStatus === 'COMPLETE') {
              bgColor = 'bg-cyan-700/80 border-cyan-500 text-white font-semibold';
            } else if (dayStatus === 'PARTIAL') {
              bgColor = 'bg-amber-600/40 border-amber-500/40 text-amber-200';
            } else if (dayStatus === 'MISSED') {
              bgColor = 'bg-slate-800/80 border-slate-700 text-slate-400';
            }

            return (
              <button
                key={dateStr}
                onClick={() => setInspectedDate(dateStr)}
                title={`${dateStr} - ${dayStatus} (${score} pts)`}
                className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center p-1 transition-all cursor-pointer ${bgColor} ${
                  isToday ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#080d19]' : ''
                } ${isSelected ? 'scale-110 shadow-lg shadow-cyan-500/30 z-10' : 'hover:scale-105'}`}
              >
                <span className="text-[10px] font-mono leading-none">
                  {idx + 1}
                </span>
                {dayStatus !== 'FUTURE' && score > 0 && (
                  <span className="text-[8px] font-mono mt-0.5 opacity-80 leading-none">
                    {score}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Date Inspection Modal / Drawer */}
      {inspectedDate && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="w-full max-w-lg bg-[#0a0f1d] border border-cyan-500/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-cyan-950/50 text-slate-100 relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400">
                  Data Log Inspection
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
                  {formatDateDisplay(inspectedDate)}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Day {daysBetween(arc.startDate, inspectedDate) + 1} of Arc · Status: {getDayState(inspectedDate)}
                </span>
              </div>
              <button
                onClick={() => setInspectedDate(null)}
                aria-label="Close Inspection"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {/* Score card */}
              <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Winter Score</span>
                <span className="text-2xl font-bold font-mono text-cyan-300">
                  {inspectedRecord ? inspectedRecord.score : 0} / 100
                </span>
              </div>

              {/* Missions Completed */}
              <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Missions Completed
                  </span>
                  <span className="text-xs font-mono text-cyan-400">
                    {inspectedRecord?.completedMissionIds?.length || 0} / {state.missions.length}
                  </span>
                </div>
                {inspectedRecord && inspectedRecord.completedMissionIds?.length > 0 ? (
                  <ul className="space-y-1.5 mt-2">
                    {state.missions
                      .filter((m) => inspectedRecord.completedMissionIds.includes(m.id))
                      .map((m) => (
                        <li key={m.id} className="text-xs text-slate-200 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{m.name}</span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic mt-1">
                    No missions completed on this date.
                  </p>
                )}
              </div>

              {/* Focus, Study, Workout breakdown */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-black/40 border border-slate-800 text-center">
                  <Timer className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Focus</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {inspectedFocus.length} sesh
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-slate-800 text-center">
                  <BookOpen className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Study</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {inspectedStudy.reduce((acc, s) => acc + s.durationMinutes, 0)} min
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-slate-800 text-center">
                  <Dumbbell className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Workouts</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {inspectedWorkouts.reduce((acc, w) => acc + w.durationMinutes, 0)} min
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectedDate(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
