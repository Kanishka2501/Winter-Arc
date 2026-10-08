import React, { useState } from 'react';
import { 
  Snowflake, 
  ArrowRight, 
  Clock, 
  Calendar, 
  Target, 
  User, 
  CheckCircle, 
  Droplet,
  ChevronLeft
} from 'lucide-react';
import { ArcProfile, ArcConfig, AppState } from '../types';
import { getLocalDateString, addDays, daysBetween, formatDateDisplay } from '../utils/date';
import { DEFAULT_STARTER_MISSIONS, saveState } from '../utils/storage';
import { INITIAL_ACHIEVEMENTS } from '../utils/achievements';
import { sound } from '../utils/sound';

interface OnboardingProps {
  onComplete: (newState: AppState) => void;
  soundEnabled: boolean;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, soundEnabled }) => {
  const today = getLocalDateString();
  const defaultEnd = addDays(today, 89); // Exactly 90 calendar days (day 1 to day 90 inclusive)

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(defaultEnd);
  const [wakeTime, setWakeTime] = useState<string>('05:30');
  const [sleepTime, setSleepTime] = useState<string>('22:30');
  const [waterLiters, setWaterLiters] = useState<number>(3);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const duration = Math.max(1, daysBetween(startDate, endDate) + 1);

  const nextStep = () => {
    setErrorMsg('');
    if (step === 2 && !name.trim()) {
      setErrorMsg('Please enter your name or callsign.');
      return;
    }
    if (step === 3 && !goal.trim()) {
      setErrorMsg('Define what you are rebuilding in this Arc.');
      return;
    }
    if (step === 5) {
      if (endDate <= startDate) {
        setErrorMsg('The Arc end date must be after the start date.');
        return;
      }
    }

    sound.playComplete(soundEnabled);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setErrorMsg('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinish = () => {
    sound.playTriumph(soundEnabled);

    const profile: ArcProfile = {
      name: name.trim() || 'Warrior',
      mainGoal: goal.trim() || 'Total physical & mental mastery',
      wakeTime,
      sleepTime,
      dailyWaterLiters: waterLiters
    };

    const currentArc: ArcConfig = {
      id: 'arc_' + Date.now(),
      name: 'Winter Arc I',
      mainGoal: profile.mainGoal,
      startDate,
      endDate,
      totalDays: duration,
      wakeTime,
      sleepTime,
      createdAt: new Date().toISOString()
    };

    // Initialize with starter missions
    const starterMissions = DEFAULT_STARTER_MISSIONS.map(m => ({
      ...m,
      id: 'm_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    }));

    // Create today's initial record
    const todayStr = getLocalDateString();
    const initialDailyRecords = {
      [todayStr]: {
        date: todayStr,
        score: 0,
        completedMissionIds: [],
        totalMissionsCount: starterMissions.length,
        workoutMinutes: 0,
        studyMinutes: 0,
        focusMinutes: 0,
        status: 'FUTURE' as const
      }
    };

    const updatedState: AppState = {
      version: '1.0.0',
      hasCompletedOnboarding: true,
      profile,
      currentArc,
      archivedArcs: [],
      missions: starterMissions,
      dailyRecords: initialDailyRecords,
      workouts: [],
      studyProjects: [
        { id: 'sp_1', name: 'Discipline & Physique', color: '#38bdf8' },
        { id: 'sp_2', name: 'Mastery & Career', color: '#818cf8' }
      ],
      studySessions: [],
      focusSessions: [],
      journalEntries: [],
      goals: [],
      achievements: INITIAL_ACHIEVEMENTS,
      weeklyReviews: [],
      transformation: {
        oldHabits: '',
        oldPatterns: '',
        oldMindset: '',
        thingsLeftBehind: '',
        newStandards: '',
        newHabits: '',
        newIdentity: '',
        whatImBuilding: ''
      },
      digitalDetox: {},
      settings: {
        theme: 'glacial',
        snowfallEnabled: true,
        soundEnabled: true,
        reducedMotion: false,
        highContrast: false
      }
    };

    saveState(updatedState);
    onComplete(updatedState);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 bg-[#04060b] relative overflow-hidden">
      {/* Cinematic Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2">
            <Snowflake className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-cyan-300">
              Winter Arc Protocol
            </span>
          </div>
          <span className="text-xs font-mono text-slate-300 tracking-wider">
            PHASE {step} OF 7
          </span>
        </div>

        {/* Card container */}
        <div className="bg-[#080d19]/90 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-6 md:p-10 shadow-2xl shadow-cyan-950/40 relative">
          {errorMsg && (
            <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium tracking-wide">
              {errorMsg}
            </div>
          )}

          {/* SCREEN 1 */}
          {step === 1 && (
            <div className="text-center py-6">
              <div className="inline-flex p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-6">
                <Snowflake className="w-10 h-10" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
                Winter Arc
              </h1>
              <p className="mt-4 text-cyan-200/80 font-mono tracking-widest text-sm uppercase">
                "Disappear. Discipline. Transform."
              </p>
              <p className="mt-6 text-slate-300 text-base leading-relaxed max-w-md mx-auto">
                Your old routine ends here. For the next season, you go dark. No noise. No excuses. Only relentless execution.
              </p>
              <div className="mt-10">
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full py-4 px-6 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-base tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <span>Enter The Arc</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 2 */}
          {step === 2 && (
            <div className="py-4">
              <div className="flex items-center gap-3 text-cyan-400 mb-3">
                <User className="w-6 h-6" />
                <span className="text-xs uppercase tracking-widest font-mono text-cyan-300">Identity</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                What should we call you?
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Enter your name or the callsign you answer to in the shadows.
              </p>
              <div className="mt-8">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kanishka / Phantom / Apex"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                  className="w-full px-5 py-4 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 focus:outline-none text-white text-lg placeholder-slate-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* SCREEN 3 */}
          {step === 3 && (
            <div className="py-4">
              <div className="flex items-center gap-3 text-cyan-400 mb-3">
                <Target className="w-6 h-6" />
                <span className="text-xs uppercase tracking-widest font-mono text-cyan-300">Manifesto</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                What are you rebuilding?
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                State your singular, obsessive objective for this transformation period.
              </p>
              <div className="mt-8">
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Peak physical condition, elite deep work habits, complete financial and mental autonomy."
                  rows={4}
                  autoFocus
                  className="w-full px-5 py-4 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 focus:outline-none text-white text-base placeholder-slate-500 transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* SCREEN 4 */}
          {step === 4 && (
            <div className="py-4">
              <div className="flex items-center gap-3 text-cyan-400 mb-3">
                <Calendar className="w-6 h-6" />
                <span className="text-xs uppercase tracking-widest font-mono text-cyan-300">Commencement</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                When does your Arc begin?
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Most begin today. The standard starts the moment you commit.
              </p>
              <div className="mt-8">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 focus:outline-none text-white text-base transition-colors [color-scheme:dark]"
                />
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Selected: {formatDateDisplay(startDate)}</span>
                  <button
                    type="button"
                    onClick={() => setStartDate(today)}
                    className="text-cyan-400 hover:underline"
                  >
                    Set to Today
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 5 */}
          {step === 5 && (
            <div className="py-4">
              <div className="flex items-center gap-3 text-cyan-400 mb-3">
                <Calendar className="w-6 h-6" />
                <span className="text-xs uppercase tracking-widest font-mono text-cyan-300">The Deadline</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                When does it end?
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Select your target culmination date. A true Winter Arc spans 60 to 100 days.
              </p>

              {/* Quick Presets */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: '60 Days', days: 60 },
                  { label: '90 Days', days: 90 },
                  { label: '100 Days', days: 100 },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setEndDate(addDays(startDate, preset.days))}
                    className="py-2.5 px-3 rounded-xl bg-slate-900/90 border border-cyan-500/20 hover:border-cyan-400 text-xs font-mono tracking-wider text-cyan-300 hover:text-white transition-all cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 focus:outline-none text-white text-base transition-colors [color-scheme:dark]"
                />
                <div className="mt-3 text-xs text-cyan-400 font-mono">
                  Calculated Duration: {duration} Days of Unforgiving Discipline
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 6 */}
          {step === 6 && (
            <div className="py-4">
              <div className="flex items-center gap-3 text-cyan-400 mb-3">
                <Clock className="w-6 h-6" />
                <span className="text-xs uppercase tracking-widest font-mono text-cyan-300">The Standards</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Set your daily standards.
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Discipline is built on non-negotiable anchor points.
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Wake Up Target
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 focus:outline-none text-white text-base font-mono [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Sleep / Lights Out Target
                  </label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 focus:outline-none text-white text-base font-mono [color-scheme:dark]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                      Daily Water Target
                    </label>
                    <span className="text-xs font-mono text-cyan-400">{waterLiters} Liters</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={6}
                    step={0.5}
                    value={waterLiters}
                    onChange={(e) => setWaterLiters(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 7 */}
          {step === 7 && (
            <div className="py-4">
              <div className="flex items-center gap-3 text-cyan-400 mb-3">
                <CheckCircle className="w-6 h-6" />
                <span className="text-xs uppercase tracking-widest font-mono text-cyan-300">Confirmation</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Your Arc is ready.
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Review your contract with yourself. Once you step into the cold, look only forward.
              </p>

              <div className="mt-6 p-5 rounded-2xl bg-black/40 border border-cyan-500/30 space-y-3.5">
                <div className="flex items-center justify-between text-sm border-b border-white/5 pb-2.5">
                  <span className="text-slate-400">Candidate</span>
                  <span className="font-semibold text-white">{name}</span>
                </div>
                <div className="flex items-start justify-between text-sm border-b border-white/5 pb-2.5 gap-4">
                  <span className="text-slate-400 shrink-0">Objective</span>
                  <span className="font-semibold text-cyan-300 text-right">{goal}</span>
                </div>
                <div className="flex items-center justify-between text-sm border-b border-white/5 pb-2.5">
                  <span className="text-slate-400">Duration</span>
                  <span className="font-mono text-white">{duration} Days</span>
                </div>
                <div className="flex items-center justify-between text-sm border-b border-white/5 pb-2.5">
                  <span className="text-slate-400">Timeline</span>
                  <span className="font-mono text-xs text-slate-300">
                    {formatDateDisplay(startDate)} → {formatDateDisplay(endDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Standards</span>
                  <span className="font-mono text-xs text-slate-300">
                    Wake: {wakeTime} · Sleep: {sleepTime} · Water: {waterLiters}L
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full py-4 px-6 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-base tracking-widest uppercase transition-all shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Snowflake className="w-5 h-5" />
                  <span>Begin Winter Arc</span>
                </button>
              </div>
            </div>
          )}

          {/* Action buttons (steps 2-6) */}
          {step > 1 && step < 7 && (
            <div className="mt-8 flex items-center justify-between pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={prevStep}
                className="py-2.5 px-4 rounded-xl text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="py-2.5 px-6 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
