export type MissionCategory = 
  | 'PHYSICAL'
  | 'MENTAL'
  | 'ACADEMIC'
  | 'CAREER'
  | 'DISCIPLINE'
  | 'SELF-CARE'
  | 'SPIRITUAL'
  | 'SOCIAL';

export interface Mission {
  id: string;
  name: string;
  category: MissionCategory;
  completed: boolean;
  streak: number;
  icon?: string;
  createdAt: string;
}

export type WorkoutType =
  | 'Workout'
  | 'Walking'
  | 'Running'
  | 'Pilates'
  | 'Strength'
  | 'Cardio'
  | 'Mobility'
  | 'Custom';

export interface WorkoutLog {
  id: string;
  type: WorkoutType;
  customTypeName?: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  intensity?: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  createdAt: string;
}

export interface StudyProject {
  id: string;
  name: string;
  color?: string;
}

export interface StudySession {
  id: string;
  projectId: string;
  projectName: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  tasksCompleted?: string;
  notes?: string;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  durationMinutes: number;
  type: 'WORK' | 'BREAK';
  mode: '25/5' | '50/10' | '90/20' | 'CUSTOM';
  completedAt: string; // ISO
  date: string; // YYYY-MM-DD
  label?: string;
}

export type MoodType =
  | 'CALM'
  | 'DETERMINED'
  | 'ENERGIZED'
  | 'FOCUSED'
  | 'LOW'
  | 'REFLECTIVE';

export interface JournalEntry {
  id: string;
  title: string;
  mood: MoodType;
  entry: string;
  date: string; // YYYY-MM-DD
  updatedAt?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  deadline: string; // YYYY-MM-DD
  progress: number; // 0 - 100
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 - 100
  targetLabel?: string;
}

export interface WeeklyReview {
  id: string;
  weekStartDate: string; // YYYY-MM-DD
  weekEndDate: string; // YYYY-MM-DD
  missionCompletionRate: number;
  averageScore: number;
  focusSessionsCount: number;
  studyHours: number;
  workoutMinutes: number;
  streakDays: number;
  perfectDaysCount: number;
  whatWorked: string;
  whatDidnt: string;
  whatAmIChanging: string;
  whatAmIProudOf: string;
  createdAt: string;
}

export interface TransformationData {
  oldHabits: string;
  oldPatterns: string;
  oldMindset: string;
  thingsLeftBehind: string;
  newStandards: string;
  newHabits: string;
  newIdentity: string;
  whatImBuilding: string;
  beforePhoto?: string; // base64
  afterPhoto?: string; // base64
  lastUpdated?: string;
}

export interface DigitalDetoxLog {
  date: string; // YYYY-MM-DD
  screenTimeMinutes: number;
  socialMediaMinutes: number;
  scrollFree: boolean;
  phoneFreeSessionsCount: number;
  notes?: string;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  score: number; // 0 - 100
  completedMissionIds: string[];
  totalMissionsCount: number;
  workoutMinutes: number;
  studyMinutes: number;
  focusMinutes: number;
  status: 'FUTURE' | 'MISSED' | 'PARTIAL' | 'COMPLETE' | 'PERFECT';
  notes?: string;
}

export interface ArcProfile {
  name: string;
  mainGoal: string;
  wakeTime: string; // HH:mm e.g. 05:30
  sleepTime: string; // HH:mm e.g. 22:30
  dailyWaterLiters: number;
}

export interface ArcConfig {
  id: string;
  name: string;
  mainGoal: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  wakeTime: string;
  sleepTime: string;
  createdAt: string;
}

export interface ArchivedArc {
  id: string;
  name: string;
  mainGoal: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  finalStats: {
    totalDays: number;
    perfectDays: number;
    longestStreak: number;
    missionsCompleted: number;
    focusSessions: number;
    studyHours: number;
    workoutMinutes: number;
    finalScore: number;
  };
  finalReflection: string;
  archivedAt: string;
}

export type AppTheme = 
  | 'glacial'
  | 'aurora'
  | 'stealth'
  | 'blood_frost'
  | 'cyber'
  | 'solaris';

export interface AppSettings {
  theme: AppTheme;
  snowfallEnabled: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface AppState {
  version: string;
  hasCompletedOnboarding: boolean;
  profile: ArcProfile;
  currentArc: ArcConfig | null;
  archivedArcs: ArchivedArc[];
  missions: Mission[];
  dailyRecords: Record<string, DailyRecord>; // keyed by YYYY-MM-DD
  workouts: WorkoutLog[];
  studyProjects: StudyProject[];
  studySessions: StudySession[];
  focusSessions: FocusSession[];
  journalEntries: JournalEntry[];
  goals: Goal[];
  achievements: Achievement[];
  weeklyReviews: WeeklyReview[];
  transformation: TransformationData;
  digitalDetox: Record<string, DigitalDetoxLog>; // keyed by YYYY-MM-DD
  settings: AppSettings;
}

export type NavigationView =
  | 'HOME'
  | 'ARC'
  | 'MISSIONS'
  | 'FOCUS'
  | 'PHYSICAL'
  | 'MENTAL'
  | 'JOURNAL'
  | 'GOALS'
  | 'PROGRESS'
  | 'ACHIEVEMENTS'
  | 'DETOX'
  | 'TRANSFORMATION'
  | 'WEEKLY_REVIEW'
  | 'HISTORY'
  | 'SETTINGS';
