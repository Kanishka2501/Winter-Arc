import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Timer, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Flame,
  Volume2,
  VolumeX,
  Trash2
} from 'lucide-react';
import { AppState, FocusSession } from '../types';
import { getLocalDateString, formatTimeDisplay } from '../utils/date';
import { sound } from '../utils/sound';
import { useToast } from '../components/Toast';
import confetti from 'canvas-confetti';

interface FocusViewProps {
  state: AppState;
  onRecordFocusSession: (session: FocusSession) => void;
  onDeleteFocusSession?: (sessionId: string) => void;
}

type ModeType = '25/5' | '50/10' | '90/20' | 'CUSTOM';
type PhaseType = 'WORK' | 'BREAK';

export const FocusView: React.FC<FocusViewProps> = ({
  state,
  onRecordFocusSession,
  onDeleteFocusSession
}) => {
  const { showToast } = useToast();
  const [mode, setMode] = useState<ModeType>('25/5');
  const [phase, setPhase] = useState<PhaseType>('WORK');
  const [customMinutes, setCustomMinutes] = useState<number>(45);

  const getTargetSeconds = (selectedMode: ModeType, currentPhase: PhaseType) => {
    if (selectedMode === '25/5') {
      return currentPhase === 'WORK' ? 25 * 60 : 5 * 60;
    }
    if (selectedMode === '50/10') {
      return currentPhase === 'WORK' ? 50 * 60 : 10 * 60;
    }
    if (selectedMode === '90/20') {
      return currentPhase === 'WORK' ? 90 * 60 : 20 * 60;
    }
    return currentPhase === 'WORK' ? customMinutes * 60 : 10 * 60;
  };

  const [timeLeft, setTimeLeft] = useState<number>(() => getTargetSeconds('25/5', 'WORK'));
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionLabel, setSessionLabel] = useState<string>('Deep Work & Focus');
  const isCompletedRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);

  // Sync mode changes
  const switchMode = (newMode: ModeType) => {
    setIsRunning(false);
    setMode(newMode);
    setPhase('WORK');
    setTimeLeft(getTargetSeconds(newMode, 'WORK'));
    isCompletedRef.current = false;
    isProcessingRef.current = false;
  };

  // Timer Tick Engine
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning && !isCompletedRef.current && !isProcessingRef.current) {
      isCompletedRef.current = true;
      setIsRunning(false);
      handleSessionCompleted();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const handleSessionCompleted = () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    sound.playFocusEnd(state.settings.soundEnabled);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#bae6fd', '#0284c7']
      });
    } catch {
      // ignore
    }

    const durationMins = Math.round(getTargetSeconds(mode, phase) / 60);

    const newSession: FocusSession = {
      id: 'focus_' + Date.now(),
      durationMinutes: durationMins,
      type: phase,
      mode,
      completedAt: new Date().toISOString(),
      date: getLocalDateString(),
      label: sessionLabel || 'Deep Focus'
    };

    onRecordFocusSession(newSession);

    if (phase === 'WORK') {
      showToast('Focus Interval Completed!', `Logged ${durationMins} minutes of intense deep work.`, 'success');
      // Switch to break
      setPhase('BREAK');
      setTimeLeft(getTargetSeconds(mode, 'BREAK'));
    } else {
      showToast('Break Completed!', `Recharged and ready to attack next focus block.`, 'info');
      // Switch back to work
      setPhase('WORK');
      setTimeLeft(getTargetSeconds(mode, 'WORK'));
    }

    isCompletedRef.current = false;
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 600);
  };

  const handleStart = () => {
    sound.playComplete(state.settings.soundEnabled);
    isCompletedRef.current = false;
    isProcessingRef.current = false;
    setIsRunning(true);
  };

  const handlePause = () => {
    sound.playComplete(state.settings.soundEnabled);
    setIsRunning(false);
  };

  const handleReset = () => {
    sound.playComplete(state.settings.soundEnabled);
    setIsRunning(false);
    isCompletedRef.current = false;
    isProcessingRef.current = false;
    setTimeLeft(getTargetSeconds(mode, phase));
  };

  const handleSkip = () => {
    sound.playComplete(state.settings.soundEnabled);
    setIsRunning(false);
    isCompletedRef.current = false;
    isProcessingRef.current = false;
    const nextPhase = phase === 'WORK' ? 'BREAK' : 'WORK';
    setPhase(nextPhase);
    setTimeLeft(getTargetSeconds(mode, nextPhase));
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = getTargetSeconds(mode, phase);
  const progressPercent = Math.min(100, Math.max(0, ((totalDuration - timeLeft) / totalDuration) * 100));

  // Today's Focus stats
  const todayStr = getLocalDateString();
  const todaySessions = state.focusSessions.filter((s) => s.date === todayStr);
  const todayTotalMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <section className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 mb-2">
          <Timer className="w-5 h-5 text-cyan-400" />
          <span className="text-xs uppercase font-mono tracking-[0.25em] text-cyan-300">
            Immersion Protocol
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
          Focus Mode
        </h1>
        <p className="text-xs text-slate-400 mt-2">
          Silence all notifications. Lock in. Do not negotiate with distractions.
        </p>
      </section>

      {/* Mode Selectors */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {(['25/5', '50/10', '90/20', 'CUSTOM'] as ModeType[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              mode === m
                ? 'bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-[#080d19] border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {m === 'CUSTOM' ? `Custom (${customMinutes}m)` : m}
          </button>
        ))}
      </div>

      {mode === 'CUSTOM' && !isRunning && (
        <div className="max-w-xs mx-auto p-4 rounded-2xl bg-black/40 border border-slate-800 flex items-center justify-between">
          <label className="text-xs font-mono text-slate-400 uppercase">Set Work Duration:</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={5}
              max={180}
              value={customMinutes}
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value) || 25);
                setCustomMinutes(val);
                if (phase === 'WORK') setTimeLeft(val * 60);
              }}
              className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-center font-mono text-cyan-400 text-sm focus:outline-none focus:border-cyan-400"
            />
            <span className="text-xs text-slate-500 font-mono">min</span>
          </div>
        </div>
      )}

      {/* Main Timer Display */}
      <section className="relative rounded-3xl bg-gradient-to-b from-[#0a0f1e] to-[#04070e] border border-cyan-500/25 p-8 md:p-14 text-center shadow-2xl shadow-cyan-950/40">
        <div className="inline-block px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-widest uppercase mb-6">
          {phase === 'WORK' ? 'Deep Work Block' : 'Recovery & Hydration'}
        </div>

        {/* Circular Progress Display */}
        <div className="my-4">
          <span className="text-6xl sm:text-8xl md:text-9xl font-black font-mono tracking-tighter text-white select-none">
            {timeFormatted}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mt-6 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-cyan-400 transition-all duration-1000 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Task Label Input */}
        <div className="max-w-sm mx-auto mt-6">
          <input
            type="text"
            value={sessionLabel}
            onChange={(e) => setSessionLabel(e.target.value)}
            disabled={isRunning}
            placeholder="Focus objective (e.g. Code feature, read book)"
            className="w-full px-4 py-2 text-center text-xs rounded-xl bg-black/40 border border-slate-800 focus:border-cyan-400 focus:outline-none text-slate-300 placeholder-slate-600 font-medium"
          />
        </div>

        {/* Timer Controls */}
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          {!isRunning ? (
            <button
              type="button"
              onClick={handleStart}
              className="px-8 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center gap-2.5 transition-all shadow-xl shadow-cyan-500/25 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePause}
              className="px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center gap-2.5 transition-all shadow-xl shadow-amber-500/25 cursor-pointer"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset timer"
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleSkip}
            aria-label="Skip to next phase"
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Focus Statistics & Today's Logs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[#080d19]/80 border border-cyan-500/15">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block">Today's Focus Time</span>
          <div className="text-3xl font-black font-mono text-cyan-300 mt-2">
            {todayTotalMinutes} <span className="text-sm font-normal text-slate-400">minutes</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {todaySessions.length} sessions logged today
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-[#080d19]/80 border border-cyan-500/15">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block">Total Focus Sessions</span>
          <div className="text-3xl font-black font-mono text-white mt-2">
            {state.focusSessions.length}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Across your entire Arc
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-[#080d19]/80 border border-cyan-500/15">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block">Deep Work Protocol</span>
          <div className="text-xs text-slate-300 leading-relaxed mt-2">
            Phone in another room. Zero tabs open that don't serve the immediate mission. Single-tasking only.
          </div>
        </div>
      </section>

      {/* Recent Sessions List */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
          Recent Focus Sessions
        </h2>

        {state.focusSessions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No focus sessions logged yet. Complete your first interval above.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {state.focusSessions.slice(-8).reverse().map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${session.type === 'WORK' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">
                      {session.label || 'Deep Focus'}
                    </span>
                    <span className="text-slate-500 text-[10px] font-mono">
                      {session.date} · {session.mode} Mode
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-mono text-cyan-300 font-bold block">
                      +{session.durationMinutes} min
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatTimeDisplay(session.completedAt)}
                    </span>
                  </div>
                  {onDeleteFocusSession && (
                    <button
                      type="button"
                      onClick={() => onDeleteFocusSession(session.id)}
                      aria-label="Delete focus session"
                      className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
