import React, { useState } from 'react';
import { 
  PhoneOff, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  Save, 
  Sparkles,
  Smartphone,
  EyeOff
} from 'lucide-react';
import { AppState, DigitalDetoxLog } from '../types';
import { getLocalDateString, formatDateDisplay } from '../utils/date';
import { useToast } from '../components/Toast';
import { sound } from '../utils/sound';

interface DetoxViewProps {
  state: AppState;
  onSaveDetoxLog: (date: string, log: DigitalDetoxLog) => void;
}

export const DetoxView: React.FC<DetoxViewProps> = ({ state, onSaveDetoxLog }) => {
  const { showToast } = useToast();
  const todayStr = getLocalDateString();
  const currentTodayLog = state.digitalDetox[todayStr] || {
    date: todayStr,
    screenTimeMinutes: 120,
    socialMediaMinutes: 30,
    scrollFree: false,
    phoneFreeSessionsCount: 2,
    notes: ''
  };

  const [screenTimeMinutes, setScreenTimeMinutes] = useState<number>(currentTodayLog.screenTimeMinutes);
  const [socialMediaMinutes, setSocialMediaMinutes] = useState<number>(currentTodayLog.socialMediaMinutes);
  const [scrollFree, setScrollFree] = useState<boolean>(currentTodayLog.scrollFree);
  const [phoneFreeSessions, setPhoneFreeSessions] = useState<number>(currentTodayLog.phoneFreeSessionsCount);
  const [notes, setNotes] = useState<string>(currentTodayLog.notes || '');

  // Calculate Distraction Score (0 - 100, where lower score is better, or discipline score where 100 is best)
  // Let's create DISTRACTION SCORE (0 - 100, 0 = pure monk, 100 = completely hijacked)
  const calcDistractionScore = (screen: number, social: number, scrollFreeActive: boolean) => {
    let score = 0;
    // Social media heavily weighs: 1 min social = 0.5 distraction point (capped at 60)
    score += Math.min(60, social * 0.5);
    // General screen time: every hour over 2 hours adds 10 points
    const excessScreenMins = Math.max(0, screen - 120);
    score += Math.min(30, (excessScreenMins / 60) * 10);
    if (!scrollFreeActive) score += 10;
    return Math.min(100, Math.round(score));
  };

  const distractionScore = calcDistractionScore(screenTimeMinutes, socialMediaMinutes, scrollFree);

  const getDistractionRating = (score: number) => {
    if (score <= 20) return { label: 'Silent Monk · Elite Restraint', color: 'text-cyan-400' };
    if (score <= 50) return { label: 'Disciplined · Controlled Exposure', color: 'text-emerald-400' };
    if (score <= 75) return { label: 'Moderate Noise · Tighten Standards', color: 'text-amber-400' };
    return { label: 'Dopamine Trap · Disconnect Now', color: 'text-rose-400' };
  };

  const rating = getDistractionRating(distractionScore);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playComplete(state.settings.soundEnabled);

    onSaveDetoxLog(todayStr, {
      date: todayStr,
      screenTimeMinutes,
      socialMediaMinutes,
      scrollFree,
      phoneFreeSessionsCount: phoneFreeSessions,
      notes: notes.trim() || undefined
    });

    showToast('Digital Discipline Saved', 'Logged daily screentime standards.', 'success');
  };

  // Historical scroll free days count
  const totalScrollFreeDays = Object.values(state.digitalDetox).filter((d) => d.scrollFree).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-2">
          <PhoneOff className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
            Digital Discipline & Detox
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Reclaim your cognitive sovereignty from cheap algorithms and endless feeds.
        </p>

        {/* Notice Disclaimer */}
        <div className="mt-6 p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-xs text-cyan-200/90 leading-relaxed">
            <span className="font-semibold text-white">Transparent Tracking:</span> Web browsers cannot access native iOS or Android screen time APIs. You manually record your daily device stats here to remain brutally honest with yourself.
          </p>
        </div>
      </section>

      {/* Distraction Meter Card */}
      <section className="rounded-3xl bg-gradient-to-br from-[#0c1426] to-[#070b14] border border-cyan-500/30 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-400">
              Today's Distraction Index
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl md:text-5xl font-black font-mono text-white">
                {distractionScore}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 100</span>
            </div>
            <div className={`text-sm font-semibold tracking-wide mt-2 ${rating.color}`}>
              {rating.label}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center shrink-0">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Scroll-Free Days</span>
              <span className="text-2xl font-bold font-mono text-cyan-300 mt-1 block">
                {totalScrollFreeDays}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/40 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Phone-Free Blocks</span>
              <span className="text-2xl font-bold font-mono text-white mt-1 block">
                {phoneFreeSessions}
              </span>
            </div>
          </div>
        </div>

        {/* Bar */}
        <div className="mt-6 h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              distractionScore <= 30
                ? 'bg-cyan-400'
                : distractionScore <= 60
                ? 'bg-amber-400'
                : 'bg-rose-500'
            }`}
            style={{ width: `${distractionScore}%` }}
          />
        </div>
      </section>

      {/* Manual Input Form */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6">
          Log Today's Device Discipline ({formatDateDisplay(todayStr)})
        </h2>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  Total Screen Time
                </label>
                <span className="text-xs font-mono text-cyan-300 font-bold">
                  {Math.floor(screenTimeMinutes / 60)}h {screenTimeMinutes % 60}m
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={600}
                step={15}
                value={screenTimeMinutes}
                onChange={(e) => setScreenTimeMinutes(parseInt(e.target.value) || 0)}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                Slide to match phone battery/screen time dashboard.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-amber-400" />
                  Social Media & Entertainment
                </label>
                <span className="text-xs font-mono text-amber-300 font-bold">
                  {socialMediaMinutes} mins
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={300}
                step={5}
                value={socialMediaMinutes}
                onChange={(e) => setSocialMediaMinutes(parseInt(e.target.value) || 0)}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                TikTok, Reels, Twitter/X, YouTube shorts, Instagram.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                Phone-Free Focus Blocks Completed
              </label>
              <div className="flex items-center gap-3">
                {[0, 1, 2, 3, 4, 5].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setPhoneFreeSessions(cnt)}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      phoneFreeSessions === cnt
                        ? 'bg-cyan-400 text-slate-950'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <label
                onClick={() => setScrollFree(!scrollFree)}
                className={`w-full p-4 rounded-2xl border flex items-center gap-3.5 cursor-pointer select-none transition-all ${
                  scrollFree
                    ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300'
                    : 'bg-black/30 border-slate-800 text-slate-400'
                }`}
              >
                <div className={`p-2 rounded-xl ${scrollFree ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold block text-white">Zero Short-Form Scrolling Today</span>
                  <span className="text-xs text-slate-400">Maintained complete abstinence from algorithmic feeds.</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Daily Notes / Triggers
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What triggered you to reach for the phone? Boredom, fatigue, or discomfort?"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-xs resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Digital Discipline</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
