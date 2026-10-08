import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  Circle, 
  Plus, 
  ArrowRight, 
  Play, 
  Trophy, 
  Calendar, 
  Sparkles,
  RefreshCw,
  ExternalLink,
  Droplet
} from 'lucide-react';
import { AppState, Mission, NavigationView } from '../types';
import { getLocalDateString, daysBetween, formatDateDisplay } from '../utils/date';
import { getDailyQuote, getRandomQuote, Quote } from '../utils/quotes';
import { getScoreMessage } from '../utils/storage';
import { sound } from '../utils/sound';

interface HomeViewProps {
  state: AppState;
  onToggleMission: (missionId: string) => void;
  onNavigate: (view: NavigationView) => void;
  onOpenReset: () => void;
  currentStreak: number;
  longestStreak: number;
  todayScore: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  state,
  onToggleMission,
  onNavigate,
  onOpenReset,
  currentStreak,
  longestStreak,
  todayScore,
}) => {
  const todayStr = getLocalDateString();
  const arc = state.currentArc;

  const [quote, setQuote] = useState<Quote>(() => getDailyQuote(todayStr));
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Real-time Countdown to End of Arc
  useEffect(() => {
    if (!arc) return;

    const calculateTimeRemaining = () => {
      const endDateTime = new Date(`${arc.endDate}T23:59:59`).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, endDateTime - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown({ days, hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [arc]);

  const totalArcDays = arc ? Math.max(1, daysBetween(arc.startDate, arc.endDate) + 1) : 90;
  const currentArcDayNumber = arc ? Math.max(1, Math.min(totalArcDays, daysBetween(arc.startDate, todayStr) + 1)) : 1;
  const daysRemaining = arc ? Math.max(0, daysBetween(todayStr, arc.endDate)) : 0;
  const overallArcProgress = Math.min(100, Math.round((currentArcDayNumber / totalArcDays) * 100));

  // Today's Missions
  const todayRecord = state.dailyRecords[todayStr];
  const completedIds = todayRecord?.completedMissionIds || [];
  const missions = state.missions;
  const completedCount = completedIds.length;
  const totalMissions = missions.length;
  const missionProgressPercent = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;

  // Circular score stroke calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (todayScore / 100) * circumference;

  const scoreMsg = getScoreMessage(todayScore);

  const handleRefreshQuote = () => {
    sound.playComplete(state.settings.soundEnabled);
    setQuote(getRandomQuote());
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Banner / Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1222] via-[#070b14] to-[#04060c] border border-cyan-500/20 p-6 md:p-10 shadow-2xl shadow-cyan-950/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-cyan-300">
                Command Center · {state.profile.name || 'Operator'}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
              Winter Arc
            </h1>
            <p className="mt-2 text-cyan-200/80 font-mono text-sm tracking-wider">
              "Disappear. Discipline. Transform."
            </p>
            {arc?.mainGoal && (
              <p className="mt-4 text-xs md:text-sm text-slate-300 max-w-xl line-clamp-2">
                <span className="text-cyan-400 font-semibold">Objective:</span> {arc.mainGoal}
              </p>
            )}
          </div>

          {/* Day Metrics Badge */}
          <div className="flex items-center gap-4 bg-black/50 border border-cyan-500/30 rounded-2xl p-4 md:p-6 backdrop-blur-md shrink-0">
            <div className="text-center">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Position</div>
              <div className="text-2xl md:text-4xl font-black font-mono text-white mt-1">
                DAY {currentArcDayNumber}
              </div>
              <div className="text-[10px] font-mono text-cyan-400 mt-0.5">OF {totalArcDays} DAYS</div>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Progress</div>
              <div className="text-2xl md:text-4xl font-black font-mono text-cyan-400 mt-1">
                {overallArcProgress}%
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">{daysRemaining} REMAINING</div>
            </div>
          </div>
        </div>

        {/* Live Countdown Grid */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Time Remaining In Arc
            </span>
            <span className="text-xs font-mono text-cyan-400">
              End: {formatDateDisplay(arc?.endDate || todayStr)}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 md:gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-2xl md:text-3xl font-mono font-bold text-white">{countdown.days}</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-1">Days</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-2xl md:text-3xl font-mono font-bold text-cyan-300">
                {String(countdown.hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-1">Hours</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-2xl md:text-3xl font-mono font-bold text-cyan-400">
                {String(countdown.minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-1">Minutes</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-2xl md:text-3xl font-mono font-bold text-cyan-200">
                {String(countdown.seconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-1">Seconds</div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Row: Winter Score Ring + Streak + Fast Launchers */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Winter Score Card */}
        <div className="rounded-3xl bg-[#090e1b]/90 border border-cyan-500/20 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Winter Score
            </span>
            <span className="text-xs font-mono text-cyan-400 font-semibold">
              Today's Standard
            </span>
          </div>

          <div className="flex items-center gap-6 my-2">
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-cyan-400 transition-all duration-700 ease-out"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-mono text-white">{todayScore}</span>
                <span className="text-[9px] font-mono text-slate-400">/ 100</span>
              </div>
            </div>

            <div>
              <div className="text-base font-bold text-white tracking-wide">
                {scoreMsg}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Calculated dynamically from completed daily missions, workouts, and focus sessions.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Missions: {completedCount} / {totalMissions}</span>
            <button
              onClick={() => onNavigate('MISSIONS')}
              className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Missions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Streak Engine Card */}
        <div className="rounded-3xl bg-[#090e1b]/90 border border-cyan-500/20 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Streak Engine
            </span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-black font-mono text-white">
                {currentStreak}
              </span>
              <span className="text-sm font-mono text-amber-400 font-semibold uppercase tracking-wider">
                Days Unbroken
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Maintained by completing at least 50% of your daily standards each day without interruption.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-black/40 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Record</span>
              <span className="font-mono text-white font-bold">{longestStreak} Days</span>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Wake Standard</span>
              <span className="font-mono text-cyan-300 font-bold">{state.profile.wakeTime}</span>
            </div>
          </div>
        </div>

        {/* Quick Launchers / Focus Card */}
        <div className="rounded-3xl bg-[#090e1b]/90 border border-cyan-500/20 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Quick Actions
            </span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('FOCUS')}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Play className="w-4 h-4 text-cyan-400" />
                <span>Launch Focus Pomodoro</span>
              </div>
              <span className="font-mono text-[10px]">25:00</span>
            </button>

            <button
              onClick={() => onNavigate('PHYSICAL')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Log Training / Workout</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">Record</span>
            </button>

            <button
              onClick={() => onNavigate('JOURNAL')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Evening Journal Reflection</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">Write</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-cyan-400" />
              Target: {state.profile.dailyWaterLiters}L Water
            </span>
            <button
              onClick={onOpenReset}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Full Reset
            </button>
          </div>
        </div>
      </section>

      {/* Today's Missions Quick Checklist */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase">
                Today's Missions
              </h2>
              <span className="text-xs font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/20">
                {completedCount} / {totalMissions}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Check off your non-negotiables for {formatDateDisplay(todayStr)}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('MISSIONS')}
              className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Manage Missions</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-cyan-400 transition-all duration-500 rounded-full"
            style={{ width: `${missionProgressPercent}%` }}
          />
        </div>

        {/* Missions List */}
        {missions.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl p-6">
            <p className="text-sm text-slate-400">No missions yet. Build your first standard.</p>
            <button
              onClick={() => onNavigate('MISSIONS')}
              className="mt-4 px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Add First Mission
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {missions.map((mission) => {
              const isChecked = completedIds.includes(mission.id);
              return (
                <div
                  key={mission.id}
                  onClick={() => onToggleMission(mission.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? 'bg-cyan-950/20 border-cyan-500/40 text-slate-300'
                      : 'bg-black/30 hover:bg-black/50 border-slate-800/80 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      type="button"
                      aria-label={`Toggle ${mission.name}`}
                      className="shrink-0 transition-transform active:scale-90"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <span className={`text-sm block truncate ${isChecked ? 'line-through text-slate-500' : 'font-medium'}`}>
                        {mission.name}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                        {mission.category}
                      </span>
                    </div>
                  </div>

                  {isChecked && (
                    <span className="text-[10px] font-mono text-cyan-400 shrink-0 font-semibold">
                      COMPLETED
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Daily Stoic Quote */}
      <section className="rounded-3xl bg-[#090d18]/80 border border-cyan-500/15 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400 mb-2">
            Daily Doctrine
          </div>
          <blockquote className="text-base md:text-lg italic font-medium text-slate-200">
            "{quote.text}"
          </blockquote>
          <div className="mt-2 text-xs font-mono text-slate-500">
            — {quote.author}
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefreshQuote}
          aria-label="Refresh daily quote"
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-300 transition-colors shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
