import React from 'react';
import { 
  Trophy, 
  Flame, 
  Shield, 
  Calendar, 
  Timer, 
  Award, 
  Dumbbell, 
  BookOpen, 
  Feather, 
  PhoneOff, 
  Snowflake,
  Lock,
  CheckCircle2,
  Footprints
} from 'lucide-react';
import { Achievement, AppState } from '../types';
import { formatDateDisplay } from '../utils/date';

interface AchievementsViewProps {
  state: AppState;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Footprints,
  Flame,
  Shield,
  Calendar,
  Timer,
  Award,
  Dumbbell,
  BookOpen,
  Feather,
  PhoneOff,
  Snowflake
};

export const AchievementsView: React.FC<AchievementsViewProps> = ({ state }) => {
  const achievements = state.achievements || [];
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const unlockPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                Arc Achievements
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Earned solely through undeniable discipline. Automatic real-data verification.
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black font-mono text-cyan-400">
              {unlockedCount} / {totalCount}
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              {unlockPercent}% Unlocked
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-cyan-400 transition-all duration-700 rounded-full"
            style={{ width: `${unlockPercent}%` }}
          />
        </div>
      </section>

      {/* Achievements Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((item) => {
          const IconComponent = ICON_MAP[item.icon] || Trophy;

          return (
            <div
              key={item.id}
              className={`rounded-3xl p-6 border transition-all relative overflow-hidden ${
                item.unlocked
                  ? 'bg-gradient-to-br from-[#0c1426] to-[#070b14] border-cyan-500/40 shadow-xl shadow-cyan-950/30'
                  : 'bg-[#060810]/80 border-slate-800/80 opacity-70'
              }`}
            >
              {item.unlocked && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              )}

              <div className="flex items-start gap-4">
                <div
                  className={`p-3.5 rounded-2xl shrink-0 ${
                    item.unlocked
                      ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-300'
                      : 'bg-slate-900 border border-slate-800 text-slate-600'
                  }`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className={`text-base font-bold tracking-wide uppercase ${item.unlocked ? 'text-white' : 'text-slate-400'}`}>
                      {item.title}
                    </h2>
                    {item.unlocked ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 uppercase font-bold shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Unlocked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500 uppercase shrink-0">
                        <Lock className="w-3.5 h-3.5" />
                        Locked
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Progress / Status Bar */}
                  <div className="mt-4 pt-3 border-t border-white/5">
                    {item.unlocked ? (
                      <div className="text-[10px] font-mono text-cyan-300/80">
                        Completed · {item.unlockedAt ? formatDateDisplay(item.unlockedAt.split('T')[0]) : 'Recorded'}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                          <span>Target: {item.targetLabel}</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-cyan-700 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
