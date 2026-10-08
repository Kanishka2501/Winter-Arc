import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  CheckCircle, 
  Clock, 
  Dumbbell, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import { ArcConfig, ArchivedArc } from '../types';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';

interface ArcCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  arc: ArcConfig;
  stats: {
    totalDays: number;
    perfectDays: number;
    longestStreak: number;
    missionsCompleted: number;
    focusSessions: number;
    studyHours: number;
    workoutMinutes: number;
    finalScore: number;
  };
  onArchiveAndStartNew: (archivedArc: ArchivedArc) => void;
  soundEnabled: boolean;
}

export const ArcCompletionModal: React.FC<ArcCompletionModalProps> = ({
  isOpen,
  onClose,
  arc,
  stats,
  onArchiveAndStartNew,
  soundEnabled
}) => {
  const [reflection, setReflection] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      sound.playTriumph(soundEnabled);
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#bae6fd', '#0284c7', '#ffffff']
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen, soundEnabled]);

  if (!isOpen) return null;

  const handleStartNewArc = () => {
    if (isSubmitting) return;
    if (!reflection.trim()) {
      setErrorMsg('Please write an honest reflection on who you became before closing this Arc.');
      return;
    }

    setIsSubmitting(true);
    const archived: ArchivedArc = {
      id: 'archived_' + (arc.id || Date.now()),
      name: arc.name,
      mainGoal: arc.mainGoal,
      startDate: arc.startDate,
      endDate: arc.endDate,
      durationDays: stats.totalDays,
      finalStats: stats,
      finalReflection: reflection.trim(),
      archivedAt: new Date().toISOString()
    };

    onArchiveAndStartNew(archived);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl overflow-y-auto"
    >
      <div className="w-full max-w-2xl my-8 bg-[#070b14] border border-cyan-500/30 rounded-3xl p-6 md:p-10 shadow-2xl shadow-cyan-950/60 relative text-slate-100">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="inline-flex p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4 shadow-lg shadow-cyan-950/40">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>
          <div className="text-xs uppercase font-mono tracking-[0.3em] text-cyan-300">
            Mission Fulfilled
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-2 uppercase">
            Winter Arc Complete.
          </h2>
          <p className="mt-3 text-sm md:text-base text-cyan-100/70 font-mono tracking-wider">
            "You disappeared. You endured. You transformed."
          </p>
        </div>

        {/* Final Statistics Grid */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Total Days</span>
            <span className="text-2xl font-bold font-mono text-cyan-300 mt-1 block">{stats.totalDays}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Perfect Days</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-2xl font-bold font-mono text-white">{stats.perfectDays}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Longest Streak</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="text-2xl font-bold font-mono text-amber-300">{stats.longestStreak}d</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Average Arc Score</span>
            <span className="text-2xl font-bold font-mono text-cyan-400 mt-1 block">{stats.finalScore} / 100</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Missions Done</span>
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              <span className="text-2xl font-bold font-mono text-white">{stats.missionsCompleted}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Focus Sessions</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Clock className="w-4 h-4 text-sky-400" />
              <span className="text-2xl font-bold font-mono text-white">{stats.focusSessions}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Study Hours</span>
            <div className="flex items-center gap-1.5 mt-1">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span className="text-2xl font-bold font-mono text-white">{stats.studyHours}h</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Training</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              <span className="text-2xl font-bold font-mono text-white">{stats.workoutMinutes}m</span>
            </div>
          </div>
        </div>

        {/* Reflection */}
        <div className="mt-8">
          <label className="block text-xs uppercase tracking-widest font-mono text-cyan-300 mb-2">
            Who Did You Become?
          </label>
          <p className="text-xs text-slate-400 mb-3">
            Record what changed inside you. What fears vanished? What identity is now etched into your character?
          </p>
          <textarea
            rows={4}
            value={reflection}
            onChange={(e) => {
              setReflection(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="I stepped in weak and undisciplined. I emerged calm, physically dominant, and completely in control of my time..."
            className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:outline-none text-white text-sm placeholder-slate-500 transition-colors resize-none"
          />
          {errorMsg && (
            <p className="mt-2 text-xs text-rose-400">{errorMsg}</p>
          )}
        </div>

        {/* Action */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Review Later
          </button>
          <button
            type="button"
            onClick={handleStartNewArc}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-xl shadow-cyan-500/25 cursor-pointer"
          >
            <span>Archive & Start New Arc</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
