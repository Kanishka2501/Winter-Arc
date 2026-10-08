import React, { useState } from 'react';
import { 
  LineChart, 
  BarChart3, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Dumbbell, 
  BookOpen, 
  Calendar,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { AppState } from '../types';
import { getLocalDateString, addDays, formatDateDisplay } from '../utils/date';

interface ProgressViewProps {
  state: AppState;
  currentStreak: number;
  longestStreak: number;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  state,
  currentStreak,
  longestStreak
}) => {
  const [timeframe, setTimeframe] = useState<'7' | '30'>('7');
  const todayStr = getLocalDateString();
  const dayCount = parseInt(timeframe, 10);

  // Generate date array for the selected timeframe
  const dates = Array.from({ length: dayCount }, (_, i) => {
    return addDays(todayStr, -(dayCount - 1 - i));
  });

  // Collect data points
  const scoreData = dates.map((d) => {
    const rec = state.dailyRecords[d];
    return {
      date: d,
      displayDate: formatDateDisplay(d, { month: 'numeric', day: 'numeric' }),
      score: rec ? rec.score : 0,
      completedMissions: rec?.completedMissionIds?.length || 0
    };
  });

  // Calculate totals in this period
  const totalMissionsDoneInPeriod = scoreData.reduce((acc, d) => acc + d.completedMissions, 0);
  const activeDaysInPeriod = scoreData.filter((d) => d.score > 0).length;
  const avgScoreInPeriod =
    activeDaysInPeriod > 0
      ? Math.round(scoreData.reduce((acc, d) => acc + d.score, 0) / activeDaysInPeriod)
      : 0;

  // Workouts in this period
  const minDate = dates[0];
  const workoutsInPeriod = state.workouts.filter((w) => w.date >= minDate && w.date <= todayStr);
  const workoutMinutesInPeriod = workoutsInPeriod.reduce((acc, w) => acc + w.durationMinutes, 0);

  // Study in this period
  const studyInPeriod = state.studySessions.filter((s) => s.date >= minDate && s.date <= todayStr);
  const studyHoursInPeriod = (studyInPeriod.reduce((acc, s) => acc + s.durationMinutes, 0) / 60).toFixed(1);

  // Focus in this period
  const focusInPeriod = state.focusSessions.filter((f) => f.date >= minDate && f.date <= todayStr);

  const hasAnyData = Object.keys(state.dailyRecords).length > 0 || state.workouts.length > 0 || state.focusSessions.length > 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                Progress Analytics
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Objective proof of your transformation. No simulated numbers.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTimeframe('7')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                timeframe === '7'
                  ? 'bg-cyan-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              7-Day Trend
            </button>
            <button
              onClick={() => setTimeframe('30')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                timeframe === '30'
                  ? 'bg-cyan-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              30-Day Trend
            </button>
          </div>
        </div>

        {/* Aggregated Cards */}
        <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Average Score
            </span>
            <span className="text-2xl md:text-3xl font-black font-mono text-cyan-400 mt-1 block">
              {avgScoreInPeriod} / 100
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Missions Completed
            </span>
            <span className="text-2xl md:text-3xl font-black font-mono text-white mt-1 block">
              {totalMissionsDoneInPeriod}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Training Volume
            </span>
            <span className="text-2xl md:text-3xl font-black font-mono text-emerald-400 mt-1 block">
              {workoutMinutesInPeriod}m
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Study & Deep Work
            </span>
            <span className="text-2xl md:text-3xl font-black font-mono text-indigo-400 mt-1 block">
              {studyHoursInPeriod}h
            </span>
          </div>
        </div>
      </section>

      {/* Main Score Trend Bar Chart */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              Winter Score Trend ({timeframe} Days)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Score (0–100)</span>
        </div>

        {!hasAnyData ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-sm">Not enough data recorded yet.</p>
            <p className="text-xs mt-1">Complete your daily missions and sessions to populate the graph.</p>
          </div>
        ) : (
          <div className="pt-8 pb-4 flex items-end justify-between gap-1.5 sm:gap-3 h-56 border-b border-slate-800">
            {scoreData.map((d) => {
              const heightPercent = Math.max(6, d.score);
              const isToday = d.date === todayStr;

              return (
                <div key={d.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[9px] font-mono text-cyan-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.score}
                  </span>
                  <div className="w-full bg-slate-900 rounded-t-lg overflow-hidden h-full flex items-end">
                    <div
                      className={`w-full transition-all duration-500 rounded-t-lg ${
                        d.score >= 90
                          ? 'bg-cyan-400'
                          : d.score >= 50
                          ? 'bg-cyan-600/80'
                          : d.score > 0
                          ? 'bg-amber-600/60'
                          : 'bg-slate-800/40'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className={`text-[8px] sm:text-[9px] font-mono mt-2 truncate w-full text-center ${isToday ? 'text-cyan-300 font-bold' : 'text-slate-500'}`}>
                    {d.displayDate}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Streak History Details */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            Streak Records & Discipline Threshold
          </h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          A day is recorded as complete when you achieve a Winter Score of at least <span className="text-cyan-400 font-bold">50 points</span> (or complete at least 50% of your daily standards). Days with <span className="text-cyan-400 font-bold">90+ points</span> are stamped as Perfect Days.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Current Streak</span>
            <span className="text-3xl font-black font-mono text-amber-300 mt-1 block">
              {currentStreak}d
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Longest Arc Streak</span>
            <span className="text-3xl font-black font-mono text-white mt-1 block">
              {longestStreak}d
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Focus Intervals</span>
            <span className="text-3xl font-black font-mono text-cyan-400 mt-1 block">
              {focusInPeriod.length}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Active Days</span>
            <span className="text-3xl font-black font-mono text-emerald-400 mt-1 block">
              {activeDaysInPeriod} / {dayCount}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
