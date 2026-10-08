import React, { useState } from 'react';
import { 
  FileText, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Dumbbell, 
  BookOpen, 
  Flame,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AppState, WeeklyReview } from '../types';
import { getLocalDateString, addDays, formatDateDisplay } from '../utils/date';
import { useToast } from '../components/Toast';
import { sound } from '../utils/sound';

interface WeeklyReviewViewProps {
  state: AppState;
  onSaveReview: (review: WeeklyReview) => void;
  currentStreak: number;
}

export const WeeklyReviewView: React.FC<WeeklyReviewViewProps> = ({
  state,
  onSaveReview,
  currentStreak
}) => {
  const { showToast } = useToast();
  const todayStr = getLocalDateString();
  const weekStartStr = addDays(todayStr, -6);

  // Calculate 7-day stats
  const past7Days = Array.from({ length: 7 }, (_, i) => addDays(todayStr, -(6 - i)));
  const records = past7Days.map((d) => state.dailyRecords[d]).filter(Boolean);

  const totalMissionsCompleted = records.reduce((acc, r) => acc + (r.completedMissionIds?.length || 0), 0);
  const totalMissionsPossible = records.reduce((acc, r) => acc + (r.totalMissionsCount || state.missions.length), 0);
  const missionRate = totalMissionsPossible > 0 ? Math.round((totalMissionsCompleted / totalMissionsPossible) * 100) : 0;

  const validScores = records.map((r) => r.score).filter((s) => s > 0);
  const averageScore = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
  const perfectDaysCount = records.filter((r) => r.score >= 90).length;

  const workoutsThisWeek = state.workouts.filter((w) => w.date >= weekStartStr && w.date <= todayStr);
  const workoutMinutes = workoutsThisWeek.reduce((acc, w) => acc + w.durationMinutes, 0);

  const studyThisWeek = state.studySessions.filter((s) => s.date >= weekStartStr && s.date <= todayStr);
  const studyHours = +(studyThisWeek.reduce((acc, s) => acc + s.durationMinutes, 0) / 60).toFixed(1);

  const focusThisWeek = state.focusSessions.filter((f) => f.date >= weekStartStr && f.date <= todayStr);

  // Form states
  const [whatWorked, setWhatWorked] = useState('');
  const [whatDidnt, setWhatDidnt] = useState('');
  const [whatAmIChanging, setWhatAmIChanging] = useState('');
  const [whatAmIProudOf, setWhatAmIProudOf] = useState('');
  const [formError, setFormError] = useState('');

  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatWorked.trim() || !whatDidnt.trim() || !whatAmIChanging.trim() || !whatAmIProudOf.trim()) {
      setFormError('Please answer all 4 reflection prompts.');
      return;
    }

    sound.playTriumph(state.settings.soundEnabled);

    const review: WeeklyReview = {
      id: 'rev_' + Date.now(),
      weekStartDate: weekStartStr,
      weekEndDate: todayStr,
      missionCompletionRate: missionRate,
      averageScore,
      focusSessionsCount: focusThisWeek.length,
      studyHours,
      workoutMinutes,
      streakDays: currentStreak,
      perfectDaysCount,
      whatWorked: whatWorked.trim(),
      whatDidnt: whatDidnt.trim(),
      whatAmIChanging: whatAmIChanging.trim(),
      whatAmIProudOf: whatAmIProudOf.trim(),
      createdAt: new Date().toISOString()
    };

    onSaveReview(review);
    showToast('Weekly Review Sealed', 'Your review has been preserved in your Arc annals.', 'success');

    // Reset fields
    setWhatWorked('');
    setWhatDidnt('');
    setWhatAmIChanging('');
    setWhatAmIProudOf('');
    setFormError('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
            Weekly Review & Strategic Audit
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Review span: {formatDateDisplay(weekStartStr)} → {formatDateDisplay(todayStr)}. Relentless self-honesty.
        </p>

        {/* 7-Day Performance Stats */}
        <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Avg Winter Score</span>
            <span className="text-2xl font-black font-mono text-cyan-400 mt-1 block">{averageScore} / 100</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Missions Met</span>
            <span className="text-2xl font-black font-mono text-white mt-1 block">{missionRate}%</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Training Time</span>
            <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">{workoutMinutes}m</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Study Hours</span>
            <span className="text-2xl font-black font-mono text-indigo-400 mt-1 block">{studyHours}h</span>
          </div>
        </div>
      </section>

      {/* Review Form */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6">
          The 4 Pillars of Review
        </h2>

        <form onSubmit={handleSave} className="space-y-6">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-cyan-300 mb-1.5">
              1. What worked this week?
            </label>
            <textarea
              rows={3}
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              placeholder="What routines held strong? Which mornings were won without hesitation?"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-xs resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-rose-400 mb-1.5">
              2. What didn't work? Where did weakness slip in?
            </label>
            <textarea
              rows={3}
              value={whatDidnt}
              onChange={(e) => setWhatDidnt(e.target.value)}
              placeholder="Where was discipline compromised? What excuses did you almost believe?"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-xs resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-amber-400 mb-1.5">
              3. What am I changing for the next 7 days?
            </label>
            <textarea
              rows={3}
              value={whatAmIChanging}
              onChange={(e) => setWhatAmIChanging(e.target.value)}
              placeholder="Adjust sleep target? Remove another distraction? Increase workout intensity?"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-xs resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1.5">
              4. What am I proud of?
            </label>
            <textarea
              rows={3}
              value={whatAmIProudOf}
              onChange={(e) => setWhatAmIProudOf(e.target.value)}
              placeholder="Acknowledge your progress. What difficult thing did you execute in silence?"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-xs resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Seal Weekly Review</span>
            </button>
          </div>
        </form>
      </section>

      {/* Historical Reviews List */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider px-1">
          Archived Weekly Audits
        </h2>

        {state.weeklyReviews.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-[#080d19]/50 border border-dashed border-slate-800 p-6 text-slate-500 text-xs">
            No past reviews saved yet. Seal your first weekly audit above.
          </div>
        ) : (
          <div className="space-y-3">
            {[...state.weeklyReviews].reverse().map((rev) => {
              const isExpanded = expandedReviewId === rev.id;

              return (
                <div
                  key={rev.id}
                  className="rounded-3xl bg-[#080d19]/80 border border-slate-800 p-5 text-slate-200 transition-all"
                >
                  <div
                    onClick={() => setExpandedReviewId(isExpanded ? null : rev.id)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div>
                      <div className="text-sm font-bold text-white">
                        Week of {formatDateDisplay(rev.weekStartDate)} → {formatDateDisplay(rev.weekEndDate)}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono text-cyan-400 mt-0.5">
                        <span>Score: {rev.averageScore}/100</span>
                        <span>·</span>
                        <span>Missions: {rev.missionCompletionRate}%</span>
                        <span>·</span>
                        <span>Workouts: {rev.workoutMinutes}m</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 pt-4 border-t border-white/5 space-y-3 text-xs leading-relaxed">
                      <div>
                        <span className="font-bold text-cyan-400 uppercase font-mono block">What Worked:</span>
                        <p className="text-slate-300 mt-0.5 whitespace-pre-wrap">{rev.whatWorked}</p>
                      </div>
                      <div>
                        <span className="font-bold text-rose-400 uppercase font-mono block">What Didn't:</span>
                        <p className="text-slate-300 mt-0.5 whitespace-pre-wrap">{rev.whatDidnt}</p>
                      </div>
                      <div>
                        <span className="font-bold text-amber-400 uppercase font-mono block">Adjustments Made:</span>
                        <p className="text-slate-300 mt-0.5 whitespace-pre-wrap">{rev.whatAmIChanging}</p>
                      </div>
                      <div>
                        <span className="font-bold text-emerald-400 uppercase font-mono block">Proud Moments:</span>
                        <p className="text-slate-300 mt-0.5 whitespace-pre-wrap">{rev.whatAmIProudOf}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
