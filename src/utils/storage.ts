import { 
  AppState, 
  Mission, 
  DailyRecord, 
  ArcProfile, 
  ArcConfig,
  WeeklyReview,
  DigitalDetoxLog,
  ArchivedArc,
  WorkoutLog,
  WorkoutType,
  FocusSession
} from '../types';
import { INITIAL_ACHIEVEMENTS } from './achievements';
import { getLocalDateString, addDays, daysBetween } from './date';

export const STORAGE_KEY = 'winter_arc_state_v1';
export const APP_VERSION = '1.0.0';

export const DEFAULT_STARTER_MISSIONS: Mission[] = [
  {
    id: 'm_wake',
    name: 'Wake up on time',
    category: 'DISCIPLINE',
    completed: false,
    streak: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'm_water',
    name: 'Drink 3L of water',
    category: 'PHYSICAL',
    completed: false,
    streak: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'm_move',
    name: 'Move your body (Workout / Cardio)',
    category: 'PHYSICAL',
    completed: false,
    streak: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'm_deep_work',
    name: 'Execute deep work session',
    category: 'CAREER',
    completed: false,
    streak: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'm_study',
    name: 'Study / Learn something hard',
    category: 'ACADEMIC',
    completed: false,
    streak: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'm_read',
    name: 'Read 20 pages of a book',
    category: 'MENTAL',
    completed: false,
    streak: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'm_journal',
    name: 'Complete evening journal reflection',
    category: 'MENTAL',
    completed: false,
    streak: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'm_detox',
    name: 'No mindless scrolling or cheap dopamine',
    category: 'DISCIPLINE',
    completed: false,
    streak: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'm_self_care',
    name: 'Cold shower / Self-care protocol',
    category: 'SELF-CARE',
    completed: false,
    streak: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'm_sleep',
    name: 'Lights out & sleep on time',
    category: 'DISCIPLINE',
    completed: false,
    streak: 0,
    createdAt: new Date().toISOString()
  }
];

export function getInitialState(): AppState {
  return {
    version: APP_VERSION,
    hasCompletedOnboarding: false,
    profile: {
      name: '',
      mainGoal: '',
      wakeTime: '05:30',
      sleepTime: '22:30',
      dailyWaterLiters: 3
    },
    currentArc: null,
    archivedArcs: [],
    missions: [],
    dailyRecords: {},
    workouts: [],
    studyProjects: [
      { id: 'sp_1', name: 'Core Arc Project', color: '#38bdf8' },
      { id: 'sp_2', name: 'Skill Mastery', color: '#818cf8' }
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
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return getInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialState();
    
    const parsed = JSON.parse(raw);
    const base = getInitialState();

    // Deep merge safe fallbacks so no missing arrays or properties crash the UI
    return {
      ...base,
      ...parsed,
      profile: { ...base.profile, ...(parsed.profile || {}) },
      transformation: { ...base.transformation, ...(parsed.transformation || {}) },
      settings: { ...base.settings, ...(parsed.settings || {}) },
      missions: Array.isArray(parsed.missions) ? parsed.missions : base.missions,
      archivedArcs: Array.isArray(parsed.archivedArcs) ? parsed.archivedArcs : [],
      workouts: Array.isArray(parsed.workouts) ? parsed.workouts : [],
      studyProjects: Array.isArray(parsed.studyProjects) && parsed.studyProjects.length > 0 ? parsed.studyProjects : base.studyProjects,
      studySessions: Array.isArray(parsed.studySessions) ? parsed.studySessions : [],
      focusSessions: Array.isArray(parsed.focusSessions) ? parsed.focusSessions : [],
      journalEntries: Array.isArray(parsed.journalEntries) ? parsed.journalEntries : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      achievements: Array.isArray(parsed.achievements) && parsed.achievements.length > 0 ? parsed.achievements : INITIAL_ACHIEVEMENTS,
      weeklyReviews: Array.isArray(parsed.weeklyReviews) ? parsed.weeklyReviews : [],
      dailyRecords: typeof parsed.dailyRecords === 'object' && parsed.dailyRecords !== null ? parsed.dailyRecords : {},
      digitalDetox: typeof parsed.digitalDetox === 'object' && parsed.digitalDetox !== null ? parsed.digitalDetox : {}
    };
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return getInitialState();
  }
}

export interface SaveStateResult {
  success: boolean;
  isQuotaError?: boolean;
  error?: string;
}

export function saveState(state: AppState): SaveStateResult {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Window environment not available.' };
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { success: true };
  } catch (err: any) {
    const isQuota =
      err &&
      (err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err.code === 22 ||
        err.code === 1014);

    console.error('Failed to save state to localStorage:', err);
    return {
      success: false,
      isQuotaError: isQuota,
      error: isQuota
        ? 'Storage limit reached. Remove large transformation images or export your data.'
        : 'Failed to persist application state to browser storage.'
    };
  }
}

export function clearState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear state:', err);
  }
}

export function exportStateAsJson(state: AppState): void {
  try {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `winter-arc-backup-${getLocalDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } catch (err) {
    console.error('Export failed:', err);
    throw new Error('Could not export backup file.');
  }
}

function isValidDateString(val: any): boolean {
  if (typeof val !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
  const d = new Date(val + 'T00:00:00');
  return !isNaN(d.getTime());
}

function sanitizeString(val: any, maxLength = 5000): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLength);
}

export function validateAndImportJson(jsonText: string): AppState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('Invalid JSON format: unable to parse the file.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid backup file: root must be a JSON object.');
  }

  const obj = parsed as Record<string, any>;

  // 1. Validate profile
  if (!obj.profile || typeof obj.profile !== 'object') {
    throw new Error('Invalid backup file: missing profile configuration.');
  }
  const profile: ArcProfile = {
    name: sanitizeString(obj.profile.name, 100) || 'Warrior',
    mainGoal: sanitizeString(obj.profile.mainGoal, 500),
    wakeTime: typeof obj.profile.wakeTime === 'string' && /^\d{2}:\d{2}$/.test(obj.profile.wakeTime) ? obj.profile.wakeTime : '05:30',
    sleepTime: typeof obj.profile.sleepTime === 'string' && /^\d{2}:\d{2}$/.test(obj.profile.sleepTime) ? obj.profile.sleepTime : '22:30',
    dailyWaterLiters: typeof obj.profile.dailyWaterLiters === 'number' && obj.profile.dailyWaterLiters > 0 ? obj.profile.dailyWaterLiters : 3
  };

  // 2. Validate currentArc if present
  let currentArc: ArcConfig | null = null;
  if (obj.currentArc && typeof obj.currentArc === 'object') {
    const c = obj.currentArc;
    if (isValidDateString(c.startDate) && isValidDateString(c.endDate) && c.endDate >= c.startDate) {
      currentArc = {
        id: sanitizeString(c.id, 100) || 'arc_' + Date.now(),
        name: sanitizeString(c.name, 100) || 'Winter Arc',
        mainGoal: sanitizeString(c.mainGoal, 500) || profile.mainGoal,
        startDate: c.startDate,
        endDate: c.endDate,
        totalDays: typeof c.totalDays === 'number' && c.totalDays > 0 ? c.totalDays : Math.max(1, daysBetween(c.startDate, c.endDate) + 1),
        wakeTime: typeof c.wakeTime === 'string' ? c.wakeTime : profile.wakeTime,
        sleepTime: typeof c.sleepTime === 'string' ? c.sleepTime : profile.sleepTime,
        createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date().toISOString()
      };
    }
  }

  // 3. Validate missions array
  if (!Array.isArray(obj.missions)) {
    throw new Error('Invalid backup file: missions must be an array.');
  }
  const validCategories = new Set([
    'PHYSICAL',
    'MENTAL',
    'ACADEMIC',
    'CAREER',
    'DISCIPLINE',
    'SELF-CARE',
    'SPIRITUAL',
    'SOCIAL'
  ]);
  const missions: Mission[] = [];
  for (const m of obj.missions) {
    if (typeof m === 'object' && m !== null && typeof m.name === 'string' && m.name.trim()) {
      missions.push({
        id: sanitizeString(m.id, 100) || 'm_' + Math.random().toString(36).substring(2, 9),
        name: sanitizeString(m.name, 200),
        category: validCategories.has(m.category) ? m.category : 'DISCIPLINE',
        completed: Boolean(m.completed),
        streak: typeof m.streak === 'number' && m.streak >= 0 ? m.streak : 0,
        createdAt: typeof m.createdAt === 'string' ? m.createdAt : new Date().toISOString()
      });
    }
  }

  // 4. Validate workouts
  const validWorkoutTypes = new Set(['Workout', 'Walking', 'Running', 'Pilates', 'Strength', 'Cardio', 'Mobility', 'Custom']);
  const workouts: WorkoutLog[] = Array.isArray(obj.workouts)
    ? obj.workouts
        .filter((w: any) => typeof w === 'object' && w !== null && isValidDateString(w.date))
        .map((w: any) => ({
          id: sanitizeString(w.id, 100) || 'w_' + Math.random().toString(36).substring(2, 9),
          type: (validWorkoutTypes.has(w.type) ? w.type : 'Workout') as WorkoutType,
          customTypeName: w.customTypeName ? sanitizeString(w.customTypeName, 100) : undefined,
          durationMinutes: typeof w.durationMinutes === 'number' && w.durationMinutes > 0 ? w.durationMinutes : 30,
          date: w.date,
          notes: w.notes ? sanitizeString(w.notes, 1000) : undefined,
          intensity: ['LOW', 'MODERATE', 'HIGH', 'EXTREME'].includes(w.intensity) ? w.intensity : 'HIGH',
          createdAt: typeof w.createdAt === 'string' ? w.createdAt : new Date().toISOString()
        }))
    : [];

  // 5. Validate study sessions
  const studySessions = Array.isArray(obj.studySessions)
    ? obj.studySessions
        .filter((s: any) => typeof s === 'object' && s !== null && isValidDateString(s.date))
        .map((s: any) => ({
          id: sanitizeString(s.id, 100) || 'study_' + Math.random().toString(36).substring(2, 9),
          projectId: sanitizeString(s.projectId, 100) || 'sp_default',
          projectName: sanitizeString(s.projectName, 100) || 'General Study',
          durationMinutes: typeof s.durationMinutes === 'number' && s.durationMinutes > 0 ? s.durationMinutes : 30,
          date: s.date,
          tasksCompleted: s.tasksCompleted ? sanitizeString(s.tasksCompleted, 500) : undefined,
          notes: s.notes ? sanitizeString(s.notes, 1000) : undefined,
          createdAt: typeof s.createdAt === 'string' ? s.createdAt : new Date().toISOString()
        }))
    : [];

  // 6. Validate focus sessions
  const focusSessions: FocusSession[] = Array.isArray(obj.focusSessions)
    ? obj.focusSessions
        .filter((f: any) => typeof f === 'object' && f !== null && isValidDateString(f.date))
        .map((f: any) => ({
          id: sanitizeString(f.id, 100) || 'focus_' + Math.random().toString(36).substring(2, 9),
          durationMinutes: typeof f.durationMinutes === 'number' && f.durationMinutes > 0 ? f.durationMinutes : 25,
          type: (f.type === 'BREAK' ? 'BREAK' : 'WORK') as 'WORK' | 'BREAK',
          mode: ['25/5', '50/10', '90/20', 'CUSTOM'].includes(f.mode) ? f.mode : '25/5',
          completedAt: typeof f.completedAt === 'string' ? f.completedAt : new Date().toISOString(),
          date: f.date,
          label: f.label ? sanitizeString(f.label, 200) : 'Deep Focus'
        }))
    : [];

  // 7. Validate journal entries
  const validMoods = new Set(['CALM', 'DETERMINED', 'ENERGIZED', 'FOCUSED', 'LOW', 'REFLECTIVE']);
  const journalEntries = Array.isArray(obj.journalEntries)
    ? obj.journalEntries
        .filter((j: any) => typeof j === 'object' && j !== null && isValidDateString(j.date))
        .map((j: any) => ({
          id: sanitizeString(j.id, 100) || 'j_' + Math.random().toString(36).substring(2, 9),
          title: sanitizeString(j.title, 200) || 'Daily Reflection',
          mood: validMoods.has(j.mood) ? j.mood : 'DETERMINED',
          entry: sanitizeString(j.entry, 20000),
          date: j.date,
          updatedAt: j.updatedAt ? sanitizeString(j.updatedAt, 100) : undefined,
          createdAt: typeof j.createdAt === 'string' ? j.createdAt : new Date().toISOString()
        }))
    : [];

  // 8. Validate goals
  const goals = Array.isArray(obj.goals)
    ? obj.goals
        .filter((g: any) => typeof g === 'object' && g !== null && isValidDateString(g.deadline))
        .map((g: any) => ({
          id: sanitizeString(g.id, 100) || 'goal_' + Math.random().toString(36).substring(2, 9),
          title: sanitizeString(g.title, 200),
          description: sanitizeString(g.description, 1000),
          category: sanitizeString(g.category, 100) || 'CORE',
          deadline: g.deadline,
          progress: typeof g.progress === 'number' ? Math.max(0, Math.min(100, Math.round(g.progress))) : 0,
          createdAt: typeof g.createdAt === 'string' ? g.createdAt : new Date().toISOString()
        }))
    : [];

  // 9. Validate daily records
  const dailyRecords: Record<string, DailyRecord> = {};
  if (typeof obj.dailyRecords === 'object' && obj.dailyRecords !== null) {
    for (const [dateKey, r] of Object.entries(obj.dailyRecords as Record<string, any>)) {
      if (isValidDateString(dateKey) && typeof r === 'object' && r !== null) {
        dailyRecords[dateKey] = {
          date: dateKey,
          score: typeof r.score === 'number' ? Math.max(0, Math.min(100, Math.round(r.score))) : 0,
          completedMissionIds: Array.isArray(r.completedMissionIds) ? r.completedMissionIds.map(String) : [],
          totalMissionsCount: typeof r.totalMissionsCount === 'number' ? Math.max(0, r.totalMissionsCount) : missions.length,
          workoutMinutes: typeof r.workoutMinutes === 'number' ? Math.max(0, r.workoutMinutes) : 0,
          studyMinutes: typeof r.studyMinutes === 'number' ? Math.max(0, r.studyMinutes) : 0,
          focusMinutes: typeof r.focusMinutes === 'number' ? Math.max(0, r.focusMinutes) : 0,
          status: ['FUTURE', 'MISSED', 'PARTIAL', 'COMPLETE', 'PERFECT'].includes(r.status) ? r.status : 'FUTURE',
          notes: r.notes ? sanitizeString(r.notes, 1000) : undefined
        };
      }
    }
  }

  // 10. Validate transformation
  const transformation = {
    oldHabits: sanitizeString(obj.transformation?.oldHabits, 2000),
    oldPatterns: sanitizeString(obj.transformation?.oldPatterns, 2000),
    oldMindset: sanitizeString(obj.transformation?.oldMindset, 2000),
    thingsLeftBehind: sanitizeString(obj.transformation?.thingsLeftBehind, 2000),
    newStandards: sanitizeString(obj.transformation?.newStandards, 2000),
    newHabits: sanitizeString(obj.transformation?.newHabits, 2000),
    newIdentity: sanitizeString(obj.transformation?.newIdentity, 2000),
    whatImBuilding: sanitizeString(obj.transformation?.whatImBuilding, 2000),
    beforePhoto: typeof obj.transformation?.beforePhoto === 'string' && obj.transformation.beforePhoto.startsWith('data:image/') && obj.transformation.beforePhoto.length < 3000000 ? obj.transformation.beforePhoto : undefined,
    afterPhoto: typeof obj.transformation?.afterPhoto === 'string' && obj.transformation.afterPhoto.startsWith('data:image/') && obj.transformation.afterPhoto.length < 3000000 ? obj.transformation.afterPhoto : undefined,
    lastUpdated: typeof obj.transformation?.lastUpdated === 'string' ? obj.transformation.lastUpdated : undefined
  };

  // 11. Validate weeklyReviews
  const weeklyReviews: WeeklyReview[] = Array.isArray(obj.weeklyReviews)
    ? obj.weeklyReviews
        .filter((r: any) => typeof r === 'object' && r !== null && isValidDateString(r.weekStartDate) && isValidDateString(r.weekEndDate))
        .map((r: any) => ({
          id: sanitizeString(r.id, 100) || 'review_' + Math.random().toString(36).substring(2, 9),
          weekStartDate: r.weekStartDate,
          weekEndDate: r.weekEndDate,
          missionCompletionRate: typeof r.missionCompletionRate === 'number' ? Math.max(0, Math.min(100, Math.round(r.missionCompletionRate))) : 0,
          averageScore: typeof r.averageScore === 'number' ? Math.max(0, Math.min(100, Math.round(r.averageScore))) : 0,
          focusSessionsCount: typeof r.focusSessionsCount === 'number' ? Math.max(0, r.focusSessionsCount) : 0,
          studyHours: typeof r.studyHours === 'number' ? Math.max(0, r.studyHours) : 0,
          workoutMinutes: typeof r.workoutMinutes === 'number' ? Math.max(0, r.workoutMinutes) : 0,
          streakDays: typeof r.streakDays === 'number' ? Math.max(0, r.streakDays) : 0,
          perfectDaysCount: typeof r.perfectDaysCount === 'number' ? Math.max(0, r.perfectDaysCount) : 0,
          whatWorked: sanitizeString(r.whatWorked, 3000),
          whatDidnt: sanitizeString(r.whatDidnt, 3000),
          whatAmIChanging: sanitizeString(r.whatAmIChanging, 3000),
          whatAmIProudOf: sanitizeString(r.whatAmIProudOf, 3000),
          createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date().toISOString()
        }))
    : [];

  // 12. Validate digitalDetox
  const digitalDetox: Record<string, DigitalDetoxLog> = {};
  if (typeof obj.digitalDetox === 'object' && obj.digitalDetox !== null) {
    for (const [dateKey, d] of Object.entries(obj.digitalDetox as Record<string, any>)) {
      if (isValidDateString(dateKey) && typeof d === 'object' && d !== null) {
        digitalDetox[dateKey] = {
          date: dateKey,
          screenTimeMinutes: typeof d.screenTimeMinutes === 'number' ? Math.max(0, d.screenTimeMinutes) : 0,
          socialMediaMinutes: typeof d.socialMediaMinutes === 'number' ? Math.max(0, d.socialMediaMinutes) : 0,
          scrollFree: Boolean(d.scrollFree),
          phoneFreeSessionsCount: typeof d.phoneFreeSessionsCount === 'number' ? Math.max(0, d.phoneFreeSessionsCount) : 0,
          notes: d.notes ? sanitizeString(d.notes, 1000) : undefined
        };
      }
    }
  }

  // 13. Validate archivedArcs
  const archivedArcs: ArchivedArc[] = Array.isArray(obj.archivedArcs)
    ? obj.archivedArcs
        .filter((a: any) => typeof a === 'object' && a !== null && isValidDateString(a.startDate) && isValidDateString(a.endDate))
        .map((a: any) => ({
          id: sanitizeString(a.id, 100) || 'archived_' + Math.random().toString(36).substring(2, 9),
          name: sanitizeString(a.name, 100) || 'Archived Arc',
          mainGoal: sanitizeString(a.mainGoal, 500) || '',
          startDate: a.startDate,
          endDate: a.endDate,
          durationDays: typeof a.durationDays === 'number' ? Math.max(1, a.durationDays) : 90,
          finalStats: typeof a.finalStats === 'object' && a.finalStats !== null ? {
            totalDays: typeof a.finalStats.totalDays === 'number' ? a.finalStats.totalDays : 90,
            perfectDays: typeof a.finalStats.perfectDays === 'number' ? a.finalStats.perfectDays : 0,
            longestStreak: typeof a.finalStats.longestStreak === 'number' ? a.finalStats.longestStreak : 0,
            missionsCompleted: typeof a.finalStats.missionsCompleted === 'number' ? a.finalStats.missionsCompleted : 0,
            focusSessions: typeof a.finalStats.focusSessions === 'number' ? a.finalStats.focusSessions : 0,
            studyHours: typeof a.finalStats.studyHours === 'number' ? a.finalStats.studyHours : 0,
            workoutMinutes: typeof a.finalStats.workoutMinutes === 'number' ? a.finalStats.workoutMinutes : 0,
            finalScore: typeof a.finalStats.finalScore === 'number' ? Math.max(0, Math.min(100, a.finalStats.finalScore)) : 0
          } : {
            totalDays: 90,
            perfectDays: 0,
            longestStreak: 0,
            missionsCompleted: 0,
            focusSessions: 0,
            studyHours: 0,
            workoutMinutes: 0,
            finalScore: 0
          },
          finalReflection: sanitizeString(a.finalReflection, 10000),
          archivedAt: typeof a.archivedAt === 'string' ? a.archivedAt : new Date().toISOString()
        }))
    : [];

  // 14. Validate studyProjects
  const studyProjects = Array.isArray(obj.studyProjects) && obj.studyProjects.length > 0
    ? obj.studyProjects
        .filter((p: any) => typeof p === 'object' && p !== null && typeof p.name === 'string' && p.name.trim())
        .map((p: any) => ({
          id: sanitizeString(p.id, 100) || 'sp_' + Math.random().toString(36).substring(2, 9),
          name: sanitizeString(p.name, 100),
          color: sanitizeString(p.color, 30) || '#38bdf8'
        }))
    : [
        { id: 'sp_1', name: 'Core Arc Project', color: '#38bdf8' },
        { id: 'sp_2', name: 'Skill Mastery', color: '#818cf8' }
      ];

  // 15. Validate achievements
  const achievements = Array.isArray(obj.achievements) && obj.achievements.length > 0
    ? INITIAL_ACHIEVEMENTS.map((initial) => {
        const matching = obj.achievements.find((a: any) => a && a.id === initial.id);
        if (matching) {
          return {
            ...initial,
            unlocked: Boolean(matching.unlocked),
            unlockedAt: typeof matching.unlockedAt === 'string' ? matching.unlockedAt : undefined,
            progress: typeof matching.progress === 'number' ? Math.max(0, Math.min(100, Math.round(matching.progress))) : 0
          };
        }
        return initial;
      })
    : INITIAL_ACHIEVEMENTS;

  // 16. Validate settings
  const validThemes = new Set(['glacial', 'aurora', 'stealth', 'blood_frost', 'cyber', 'solaris']);
  const settings = {
    theme: validThemes.has(obj.settings?.theme) ? obj.settings.theme : 'glacial',
    snowfallEnabled: typeof obj.settings?.snowfallEnabled === 'boolean' ? obj.settings.snowfallEnabled : true,
    soundEnabled: typeof obj.settings?.soundEnabled === 'boolean' ? obj.settings.soundEnabled : true,
    reducedMotion: typeof obj.settings?.reducedMotion === 'boolean' ? obj.settings.reducedMotion : false,
    highContrast: typeof obj.settings?.highContrast === 'boolean' ? obj.settings.highContrast : false
  };

  const base = getInitialState();
  const validState: AppState = {
    ...base,
    version: APP_VERSION,
    hasCompletedOnboarding: Boolean(obj.hasCompletedOnboarding || currentArc),
    profile,
    currentArc,
    archivedArcs,
    missions,
    dailyRecords,
    workouts,
    studyProjects,
    studySessions,
    focusSessions,
    journalEntries,
    goals,
    achievements,
    weeklyReviews,
    transformation,
    digitalDetox,
    settings
  };

  // Recalculate daily records to ensure internal logical consistency
  Object.keys(validState.dailyRecords).forEach((d) => {
    validState.dailyRecords[d] = recalculateDailyRecord(d, validState);
  });

  return validState;
}

/**
 * Calculates Winter Score (0 - 100) dynamically based on actual completed data for a date.
 */
export function calculateDayScore(
  completedMissionIds: string[],
  totalMissions: number,
  workoutMinutes: number = 0,
  studyOrFocusMinutes: number = 0
): number {
  if (totalMissions <= 0) {
    const workoutPoints = Math.min(15, (workoutMinutes / 45) * 15);
    const focusPoints = Math.min(15, (studyOrFocusMinutes / 50) * 15);
    return Math.min(100, Math.round(workoutPoints + focusPoints));
  }

  // Base score from missions: up to 70 points
  const missionRatio = Math.min(1, (completedMissionIds?.length || 0) / totalMissions);
  const missionPoints = missionRatio * 70;

  // Physical bonus: up to 15 points (e.g. 45+ mins gives full 15)
  const workoutPoints = Math.min(15, (workoutMinutes / 45) * 15);

  // Focus/Mental bonus: up to 15 points (e.g. 50+ mins gives full 15)
  const focusPoints = Math.min(15, (studyOrFocusMinutes / 50) * 15);

  return Math.min(100, Math.round(missionPoints + workoutPoints + focusPoints));
}

export function getScoreMessage(score: number): string {
  if (score >= 90) return 'Elite consistency.';
  if (score >= 70) return 'Strong day. Keep moving.';
  if (score >= 50) return 'Progress still counts.';
  return 'Reset. The Arc continues.';
}

/**
 * Authoritative source-of-truth recalculation engine for a daily record.
 * Derives completed missions, counts, workout minutes, study minutes, focus minutes,
 * score, and status directly from source state arrays.
 */
export function recalculateDailyRecord(date: string, state: AppState): DailyRecord {
  const existingRecord = state.dailyRecords?.[date];
  const activeMissionIds = new Set((state.missions || []).map((m) => m.id));

  // Only currently active missions are counted
  const validCompletedMissionIds = (existingRecord?.completedMissionIds || []).filter((id) =>
    activeMissionIds.has(id)
  );

  const todayStr = getLocalDateString();
  const isToday = date === todayStr;

  // For today, total count is current active missions count.
  // For historical days, preserve the record's total count if recorded, otherwise default to state.missions.length.
  let totalMissionsCount = isToday
    ? (state.missions || []).length
    : (existingRecord?.totalMissionsCount ?? (state.missions || []).length);
  totalMissionsCount = Math.max(validCompletedMissionIds.length, totalMissionsCount, 0);

  // Workout minutes for this date from state.workouts
  const workoutMinutes = (state.workouts || [])
    .filter((w) => w.date === date)
    .reduce((sum, w) => sum + (Number(w.durationMinutes) || 0), 0);

  // Study minutes for this date from state.studySessions
  const studyMinutes = (state.studySessions || [])
    .filter((s) => s.date === date)
    .reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0);

  // Focus minutes for this date (only WORK intervals) from state.focusSessions
  const focusMinutes = (state.focusSessions || [])
    .filter((f) => f.date === date && f.type === 'WORK')
    .reduce((sum, f) => sum + (Number(f.durationMinutes) || 0), 0);

  // Derive score directly from source-of-truth data
  const score = calculateDayScore(
    validCompletedMissionIds,
    totalMissionsCount,
    workoutMinutes,
    studyMinutes + focusMinutes
  );

  // Status derivation
  let status: 'FUTURE' | 'MISSED' | 'PARTIAL' | 'COMPLETE' | 'PERFECT' = 'FUTURE';
  if (date > todayStr) {
    status = 'FUTURE';
  } else if (score >= 90) {
    status = 'PERFECT';
  } else if (score >= 50) {
    status = 'COMPLETE';
  } else if (score > 0) {
    status = 'PARTIAL';
  } else {
    // Untouched day
    if (state.currentArc && date >= state.currentArc.startDate && date < todayStr) {
      status = 'MISSED';
    } else {
      status = 'FUTURE';
    }
  }

  return {
    date,
    score,
    completedMissionIds: validCompletedMissionIds,
    totalMissionsCount,
    workoutMinutes,
    studyMinutes,
    focusMinutes,
    status,
    notes: existingRecord?.notes
  };
}

/**
 * Calculates the mathematically consistent Average Arc Score across all elapsed Arc days.
 * Untouched days within the elapsed range are counted as 0.
 * Future days are excluded.
 */
export function calculateAverageArcScore(
  dailyRecords: Record<string, DailyRecord>,
  arcStartDate: string,
  arcEndDate: string,
  todayStr: string = getLocalDateString()
): number {
  if (!arcStartDate || !arcEndDate || arcStartDate > arcEndDate) return 0;

  // Calculate average across all elapsed Arc days up to today or arcEndDate
  const effectiveEnd = todayStr < arcEndDate ? todayStr : arcEndDate;
  if (effectiveEnd < arcStartDate) return 0;

  const totalDays = daysBetween(arcStartDate, effectiveEnd) + 1;
  if (totalDays <= 0) return 0;

  let totalScore = 0;
  let cursor = arcStartDate;

  for (let i = 0; i < totalDays; i++) {
    const rec = dailyRecords[cursor];
    // Untouched day has score 0
    totalScore += rec ? (Number(rec.score) || 0) : 0;
    cursor = addDays(cursor, 1);
  }

  return Math.round(totalScore / totalDays);
}
