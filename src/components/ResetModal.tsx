import React, { useState } from 'react';
import { 
  X, 
  Wind, 
  Droplet, 
  Sparkles, 
  ShowerHead, 
  Activity, 
  Zap, 
  BookOpen, 
  Moon, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { sound } from '../utils/sound';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetComplete: () => void;
  soundEnabled: boolean;
}

const RESET_STEPS = [
  {
    step: 1,
    title: 'Breathe.',
    instruction: 'Inhale for 4 seconds. Hold for 4. Exhale slowly for 6. Release the anxiety and mental clutter right now.',
    icon: Wind,
    color: 'text-cyan-400'
  },
  {
    step: 2,
    title: 'Drink water.',
    instruction: 'Drink a cold, full 500ml glass of water immediately. Rehydrate your brain and kickstart your alertness.',
    icon: Droplet,
    color: 'text-sky-400'
  },
  {
    step: 3,
    title: 'Clean your space.',
    instruction: 'Clear your desk. Throw out trash. Remove clutter. Your external order directly shapes your internal state.',
    icon: Sparkles,
    color: 'text-amber-400'
  },
  {
    step: 4,
    title: 'Take a cold shower.',
    instruction: 'Shock the nervous system. Strip away lethargy and brain fog with cold water.',
    icon: ShowerHead,
    color: 'text-blue-400'
  },
  {
    step: 5,
    title: 'Move.',
    instruction: 'Do 20 pushups, 30 jumping jacks, or a brisk walk. Force physical momentum into your body.',
    icon: Activity,
    color: 'text-emerald-400'
  },
  {
    step: 6,
    title: 'Do one difficult thing.',
    instruction: 'Pick the single most resisted task on your list. Set a timer for 10 minutes and attack it without emotion.',
    icon: Zap,
    color: 'text-yellow-400'
  },
  {
    step: 7,
    title: 'Study & sharpen.',
    instruction: 'Feed your mind signal, not noise. 15 minutes of uninterrupted focused learning.',
    icon: BookOpen,
    color: 'text-indigo-400'
  },
  {
    step: 8,
    title: 'Protect your sleep.',
    instruction: 'No screens 45 minutes before bedtime. Dark room, cold air. Rebuild for tomorrow\'s war.',
    icon: Moon,
    color: 'text-purple-400'
  },
  {
    step: 9,
    title: 'Begin again.',
    instruction: 'The past hour does not define the next hour. You are not starting from zero; you are starting from experience.',
    icon: RefreshCw,
    color: 'text-cyan-400'
  }
];

export const ResetModal: React.FC<ResetModalProps> = ({
  isOpen,
  onClose,
  onResetComplete,
  soundEnabled
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = RESET_STEPS[currentStepIndex];
  const IconComponent = currentStep.icon;

  const handleNext = () => {
    sound.playComplete(soundEnabled);
    if (currentStepIndex < RESET_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      sound.playTriumph(soundEnabled);
      onResetComplete();
      onClose();
      setCurrentStepIndex(0);
    }
  };

  const handleResetDirect = () => {
    sound.playTriumph(soundEnabled);
    onResetComplete();
    onClose();
    setCurrentStepIndex(0);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03050a]/95 backdrop-blur-2xl"
    >
      <div className="w-full max-w-xl relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Reset"
          className="absolute -top-12 right-0 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 bg-[#080d1a]/80 border border-cyan-500/30 rounded-3xl p-8 md:p-12 shadow-2xl shadow-cyan-950/50">
          <div className="inline-flex items-center gap-2 mb-6">
            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="text-xs uppercase font-mono tracking-[0.3em] text-cyan-300">
              Protocol: Reset.
            </span>
          </div>

          {/* Current Step Icon */}
          <div className="my-4 flex justify-center">
            <div className="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 shadow-lg shadow-cyan-950/30">
              <IconComponent className={`w-12 h-12 ${currentStep.color}`} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-4">
            {currentStep.title}
          </h2>

          {/* Instruction */}
          <p className="mt-4 text-slate-300 text-base md:text-lg leading-relaxed max-w-md mx-auto">
            {currentStep.instruction}
          </p>

          {/* Step indicators */}
          <div className="mt-8 flex justify-center gap-1.5">
            {RESET_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                aria-label={`Jump to step ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-8 bg-cyan-400'
                    : idx < currentStepIndex
                    ? 'w-3 bg-cyan-700/80'
                    : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {currentStepIndex < RESET_STEPS.length - 1 ? (
              <>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold uppercase tracking-wider text-sm transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  Next Step ({currentStepIndex + 1}/{RESET_STEPS.length})
                </button>
                <button
                  type="button"
                  onClick={handleResetDirect}
                  className="text-xs font-mono text-slate-400 hover:text-cyan-300 uppercase tracking-widest transition-colors py-2 cursor-pointer"
                >
                  I'm Resetting Now
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleResetDirect}
                className="w-full sm:w-auto px-10 py-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black uppercase tracking-widest text-base transition-all shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>I'M RESETTING.</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
