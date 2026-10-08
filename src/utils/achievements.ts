import { Achievement, AppState } from '../types';
import { getLocalDateString, calculateStreakEngine } from './date';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'FIRST STEP',
    description: 'Complete your first daily mission.',
    icon: 'Footprints',
    unlocked: false,
    progress: 0,
    targetLabel: '1 mission'
  },
  {
    id: 'seven_unbroken',
    title: 'SEVEN UNBROKEN',
    description: 'Reach a 7-day streak of disciplined execution.',
    icon: 'Flame',
    unlocked: false,
    progress: 0,
    targetLabel: '7 days'
  },
  {
    id: 'fourteen_unbroken',
    title: 'FOURTEEN UNBROKEN',
    description: 'Push through two full weeks without breaking the chain.',
    icon: 'Shield',
    unlocked: false,
    progress: 0,
    targetLabel: '14 days'
  },
  {
    id: 'thirty_days',
    title: 'THIRTY DAYS',
    description: 'Accumulate 30 total active days in the Arc.',
    icon: 'Calendar',
    unlocked: false,
    progress: 0,
    targetLabel: '30 days'
  },
  {
    id: 'focus_master',
    title: 'FOCUS MODE',
    description: 'Complete 10 focused Pomodoro sessions.',
    icon: 'Timer',
    unlocked: false,
    progress: 0,
    targetLabel: '10 sessions'
  },
  {
    id: 'iron_discipline',
    title: 'IRON DISCIPLINE',
    description: 'Achieve 10 perfect days with a Winter Score of 90+.',
    icon: 'Award',
    unlocked: false,
    progress: 0,
    targetLabel: '10 days (90+ score)'
  },
  {
    id: 'physical_iron',
    title: 'PHYSICAL IRON',
    description: 'Log 15 workouts or training sessions.',
    icon: 'Dumbbell',
    unlocked: false,
    progress: 0,
    targetLabel: '15 sessions'
  },
  {
    id: 'the_scholar',
    title: 'THE SCHOLAR',
    description: 'Log at least 20 hours of study or deep work.',
    icon: 'BookOpen',
    unlocked: false,
    progress: 0,
    targetLabel: '20 hours'
  },
  {
    id: 'deep_scribe',
    title: 'DEEP SCRIBE',
    description: 'Write 10 honest reflections in your private journal.',
    icon: 'Feather',
    unlocked: false,
    progress: 0,
    targetLabel: '10 entries'
  },
  {
    id: 'silent_monk',
    title: 'DIGITAL MONK',
    description: 'Log 5 scroll-free digital detox days.',
    icon: 'PhoneOff',
    unlocked: false,
    progress: 0,
    targetLabel: '5 days'
  },
  {
    id: 'winter_survivor',
    title: 'WINTER SURVIVOR',
    description: 'Complete the entire span of your Winter Arc.',
    icon: 'Snowflake',
    unlocked: false,
    progress: 0,
    targetLabel: 'Reach end date'
  }
];

export function evaluateAchievements(state: AppState): {
  updatedAchievements: Achievement[];
  newlyUnlocked: Achievement[];
} {
  const currentList = state.achievements && state.achievements.length > 0 
    ? state.achievements 
    : INITIAL_ACHIEVEMENTS;

  const todayStr = getLocalDateString();
  const newlyUnlocked: Achievement[] = [];

  // Metrics
  const totalMissionsCompleted = Object.values(state.dailyRecords).reduce(
    (acc, r) => acc + (r.completedMissionIds?.length || 0), 0
  );

  const focusCount = state.focusSessions?.length || 0;
  const workoutCount = state.workouts?.length || 0;
  const totalStudyMinutes = (state.studySessions || []).reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalStudyHours = Math.floor(totalStudyMinutes / 60);
  const journalCount = state.journalEntries?.length || 0;
  const scrollFreeDays = Object.values(state.digitalDetox || {}).filter(d => d.scrollFree).length;

  // Use authoritative streak engine scoped to current Arc
  const arc = state.currentArc;
  const streakMetrics = arc
    ? calculateStreakEngine(state.dailyRecords || {}, arc.startDate, arc.endDate, todayStr)
    : { longestStreak: 0, currentStreak: 0, perfectDays: 0, totalActiveDays: 0 };

  const maxStreak = streakMetrics.longestStreak;
  const perfectDaysCount = streakMetrics.perfectDays;
  const activeDaysCount = streakMetrics.totalActiveDays;

  // Arc completion check
  const isArcComplete = state.currentArc ? todayStr >= state.currentArc.endDate : false;

  const updatedAchievements = currentList.map(item => {
    let progress = item.progress;
    let shouldUnlock = item.unlocked;

    switch (item.id) {
      case 'first_step':
        progress = Math.min(100, (totalMissionsCompleted / 1) * 100);
        shouldUnlock = totalMissionsCompleted >= 1;
        break;
      case 'seven_unbroken':
        progress = Math.min(100, Math.round((maxStreak / 7) * 100));
        shouldUnlock = maxStreak >= 7;
        break;
      case 'fourteen_unbroken':
        progress = Math.min(100, Math.round((maxStreak / 14) * 100));
        shouldUnlock = maxStreak >= 14;
        break;
      case 'thirty_days':
        progress = Math.min(100, Math.round((activeDaysCount / 30) * 100));
        shouldUnlock = activeDaysCount >= 30;
        break;
      case 'focus_master':
        progress = Math.min(100, Math.round((focusCount / 10) * 100));
        shouldUnlock = focusCount >= 10;
        break;
      case 'iron_discipline':
        progress = Math.min(100, Math.round((perfectDaysCount / 10) * 100));
        shouldUnlock = perfectDaysCount >= 10;
        break;
      case 'physical_iron':
        progress = Math.min(100, Math.round((workoutCount / 15) * 100));
        shouldUnlock = workoutCount >= 15;
        break;
      case 'the_scholar':
        progress = Math.min(100, Math.round((totalStudyHours / 20) * 100));
        shouldUnlock = totalStudyHours >= 20;
        break;
      case 'deep_scribe':
        progress = Math.min(100, Math.round((journalCount / 10) * 100));
        shouldUnlock = journalCount >= 10;
        break;
      case 'silent_monk':
        progress = Math.min(100, Math.round((scrollFreeDays / 5) * 100));
        shouldUnlock = scrollFreeDays >= 5;
        break;
      case 'winter_survivor':
        progress = isArcComplete ? 100 : 0;
        shouldUnlock = isArcComplete;
        break;
    }

    if (shouldUnlock && !item.unlocked) {
      const unlockedItem = {
        ...item,
        unlocked: true,
        progress: 100,
        unlockedAt: new Date().toISOString()
      };
      newlyUnlocked.push(unlockedItem);
      return unlockedItem;
    }

    return {
      ...item,
      progress
    };
  });

  return { updatedAchievements, newlyUnlocked };
}
