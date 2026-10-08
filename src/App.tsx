import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  AppState, 
  NavigationView, 
  Mission, 
  WorkoutLog, 
  StudySession, 
  FocusSession, 
  JournalEntry, 
  Goal, 
  WeeklyReview, 
  TransformationData, 
  DigitalDetoxLog, 
  ArchivedArc, 
  ArcProfile, 
  ArcConfig, 
  AppSettings,
  MissionCategory,
  AppTheme,
  DailyRecord
} from './types';
import { 
  loadState, 
  saveState, 
  clearState, 
  getInitialState, 
  calculateDayScore,
  recalculateDailyRecord,
  calculateAverageArcScore
} from './utils/storage';
import { 
  getLocalDateString, 
  calculateStreakEngine, 
  daysBetween,
  addDays
} from './utils/date';
import { evaluateAchievements, INITIAL_ACHIEVEMENTS } from './utils/achievements';
import { sound } from './utils/sound';
import { applyThemeToDocument, THEMES } from './utils/themes';

import { ToastProvider, useToast } from './components/Toast';
import { SnowCanvas } from './components/SnowCanvas';
import { Navigation } from './components/Navigation';
import { Onboarding } from './components/Onboarding';
import { ResetModal } from './components/ResetModal';
import { ArcCompletionModal } from './components/ArcCompletionModal';
import { ThemeModal } from './components/ThemeModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

import { HomeView } from './views/HomeView';
import { TheArcView } from './views/TheArcView';
import { MissionsView } from './views/MissionsView';
import { FocusView } from './views/FocusView';
import { PhysicalView } from './views/PhysicalView';
import { MentalView } from './views/MentalView';
import { JournalView } from './views/JournalView';
import { GoalsView } from './views/GoalsView';
import { ProgressView } from './views/ProgressView';
import { AchievementsView } from './views/AchievementsView';
import { DetoxView } from './views/DetoxView';
import { TransformationView } from './views/TransformationView';
import { WeeklyReviewView } from './views/WeeklyReviewView';
import { ArcHistoryView } from './views/ArcHistoryView';
import { SettingsView } from './views/SettingsView';

import confetti from 'canvas-confetti';

function AppContent() {
  const { showToast } = useToast();
  const [state, setState] = useState<AppState>(() => loadState());
  const [currentView, setCurrentView] = useState<NavigationView>('HOME');
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  const todayStr = getLocalDateString();

  // Global Command+K / Ctrl+K listener for instant search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Apply theme to document on mount and when theme setting changes
  useEffect(() => {
    applyThemeToDocument(state.settings.theme || 'glacial');
  }, [state.settings.theme]);

  // Ensure today's daily record exists on first mount/new day
  useEffect(() => {
    if (!state.hasCompletedOnboarding || !state.currentArc) return;

    if (!state.dailyRecords[todayStr]) {
      setState((prev) => {
        const next: AppState = {
          ...prev,
          dailyRecords: {
            ...prev.dailyRecords,
            [todayStr]: recalculateDailyRecord(todayStr, prev)
          }
        };
        const saveRes = saveState(next);
        if (!saveRes.success) {
          showToast('Storage Limit Exceeded', saveRes.error || 'Storage error.', 'error');
        }
        return next;
      });
    }
  }, [state.hasCompletedOnboarding, state.currentArc, todayStr, showToast]);

  // Persist state whenever it changes
  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      
      // Auto check achievements
      const { updatedAchievements, newlyUnlocked } = evaluateAchievements(next);
      if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach((item) => {
          sound.playTriumph(next.settings.soundEnabled);
          showToast(`Achievement Unlocked: ${item.title}`, item.description, 'success');
          try {
            confetti({
              particleCount: 60,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#38bdf8', '#bae6fd', '#0284c7']
            });
          } catch {
            // ignore
          }
        });
        next.achievements = updatedAchievements;
      }

      const saveResult = saveState(next);
      if (!saveResult.success) {
        showToast('Storage Limit Exceeded', saveResult.error || 'Failed to persist state to browser storage.', 'error');
      }
      return next;
    });
  }, [showToast]);

  // Calculated Day Metrics
  const arc = state.currentArc;
  const totalArcDays = arc ? Math.max(1, daysBetween(arc.startDate, arc.endDate) + 1) : 90;
  const currentArcDayNumber = arc ? Math.max(1, Math.min(totalArcDays, daysBetween(arc.startDate, todayStr) + 1)) : 1;

  // Streak engine calculation
  const streakMetrics = useMemo(() => {
    if (!arc) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        perfectDays: 0,
        partialDays: 0,
        missedDays: 0,
        totalActiveDays: 0
      };
    }
    return calculateStreakEngine(state.dailyRecords, arc.startDate, arc.endDate, todayStr);
  }, [state.dailyRecords, arc, todayStr]);

  // Today's score derived from authoritative record
  const todayRecord = state.dailyRecords[todayStr];
  const todayScore = todayRecord ? todayRecord.score : 0;

  // Average Arc Score mathematically calculated over elapsed arc days
  const averageArcScore = useMemo(() => {
    if (!arc) return 0;
    return calculateAverageArcScore(state.dailyRecords, arc.startDate, arc.endDate, todayStr);
  }, [state.dailyRecords, arc, todayStr]);

  // Mission Toggle Handler
  const handleToggleMission = useCallback((missionId: string) => {
    updateState((prev) => {
      const rec = prev.dailyRecords[todayStr] || {
        date: todayStr,
        score: 0,
        completedMissionIds: [],
        totalMissionsCount: prev.missions.length,
        workoutMinutes: 0,
        studyMinutes: 0,
        focusMinutes: 0,
        status: 'FUTURE'
      };

      const isChecked = rec.completedMissionIds.includes(missionId);
      const nextCompletedIds = isChecked
        ? rec.completedMissionIds.filter((id) => id !== missionId)
        : [...rec.completedMissionIds, missionId];

      if (!isChecked) {
        sound.playComplete(prev.settings.soundEnabled);
      }

      // Update individual mission streak if checking
      const updatedMissions = prev.missions.map((m) => {
        if (m.id === missionId) {
          return {
            ...m,
            completed: !isChecked,
            streak: !isChecked ? m.streak + 1 : Math.max(0, m.streak - 1)
          };
        }
        return m;
      });

      const tempState: AppState = {
        ...prev,
        missions: updatedMissions,
        dailyRecords: {
          ...prev.dailyRecords,
          [todayStr]: {
            ...rec,
            completedMissionIds: nextCompletedIds
          }
        }
      };

      const recalculated = recalculateDailyRecord(todayStr, tempState);

      return {
        ...tempState,
        dailyRecords: {
          ...tempState.dailyRecords,
          [todayStr]: recalculated
        }
      };
    });
  }, [todayStr, updateState]);

  // Mission Add / Edit / Delete
  const handleAddMission = useCallback((missionData: { name: string; category: MissionCategory }) => {
    updateState((prev) => {
      const newMission: Mission = {
        id: 'm_' + Date.now(),
        name: missionData.name,
        category: missionData.category,
        completed: false,
        streak: 0,
        createdAt: new Date().toISOString()
      };
      const nextState: AppState = {
        ...prev,
        missions: [...prev.missions, newMission]
      };
      // Recalculate today's record with new active mission set
      const recalculatedToday = recalculateDailyRecord(todayStr, nextState);
      return {
        ...nextState,
        dailyRecords: {
          ...nextState.dailyRecords,
          [todayStr]: recalculatedToday
        }
      };
    });
  }, [todayStr, updateState]);

  const handleEditMission = useCallback((id: string, updates: { name: string; category: MissionCategory }) => {
    updateState((prev) => {
      const nextState: AppState = {
        ...prev,
        missions: prev.missions.map((m) => (m.id === id ? { ...m, ...updates } : m))
      };
      const recalculatedToday = recalculateDailyRecord(todayStr, nextState);
      return {
        ...nextState,
        dailyRecords: {
          ...nextState.dailyRecords,
          [todayStr]: recalculatedToday
        }
      };
    });
  }, [todayStr, updateState]);

  const handleDeleteMission = useCallback((id: string) => {
    updateState((prev) => {
      const remainingMissions = prev.missions.filter((m) => m.id !== id);
      const tempState: AppState = {
        ...prev,
        missions: remainingMissions,
        dailyRecords: { ...prev.dailyRecords }
      };

      // Remove deleted mission ID from EVERY relevant dailyRecord and recalculate
      const updatedDailyRecords: Record<string, DailyRecord> = {};
      for (const [d, rec] of Object.entries(prev.dailyRecords)) {
        const cleanedCompletedIds = (rec.completedMissionIds || []).filter((mid) => mid !== id);
        tempState.dailyRecords[d] = {
          ...rec,
          completedMissionIds: cleanedCompletedIds
        };
        updatedDailyRecords[d] = recalculateDailyRecord(d, tempState);
      }

      return {
        ...prev,
        missions: remainingMissions,
        dailyRecords: updatedDailyRecords
      };
    });
  }, [updateState]);

  // Focus Session Recorded & Deleted
  const handleRecordFocusSession = useCallback((session: FocusSession) => {
    updateState((prev) => {
      const nextState: AppState = {
        ...prev,
        focusSessions: [...prev.focusSessions, session]
      };
      const recalculated = recalculateDailyRecord(session.date, nextState);
      return {
        ...nextState,
        dailyRecords: {
          ...nextState.dailyRecords,
          [session.date]: recalculated
        }
      };
    });
  }, [updateState]);

  const handleDeleteFocusSession = useCallback((id: string) => {
    updateState((prev) => {
      const target = prev.focusSessions.find((f) => f.id === id);
      if (!target) return prev;

      const date = target.date;
      const nextState: AppState = {
        ...prev,
        focusSessions: prev.focusSessions.filter((f) => f.id !== id)
      };

      const recalculated = recalculateDailyRecord(date, nextState);
      return {
        ...nextState,
        dailyRecords: {
          ...nextState.dailyRecords,
          [date]: recalculated
        }
      };
    });
  }, [updateState]);

  // Workout Log Handlers
  const handleAddWorkout = useCallback((workout: Omit<WorkoutLog, 'id' | 'createdAt'>) => {
    updateState((prev) => {
      const newLog: WorkoutLog = {
        ...workout,
        id: 'w_' + Date.now(),
        createdAt: new Date().toISOString()
      };
      const nextState: AppState = {
        ...prev,
        workouts: [...prev.workouts, newLog]
      };
      const recalculated = recalculateDailyRecord(workout.date, nextState);
      return {
        ...nextState,
        dailyRecords: {
          ...nextState.dailyRecords,
          [workout.date]: recalculated
        }
      };
    });
  }, [updateState]);

  const handleEditWorkout = useCallback((id: string, updates: Partial<WorkoutLog>) => {
    updateState((prev) => {
      const oldWorkout = prev.workouts.find((w) => w.id === id);
      if (!oldWorkout) return prev;

      const oldDate = oldWorkout.date;
      const updatedWorkouts = prev.workouts.map((w) => (w.id === id ? { ...w, ...updates } : w));
      const newDate = updates.date || oldDate;

      const nextState: AppState = {
        ...prev,
        workouts: updatedWorkouts
      };

      const updatedDailyRecords = { ...nextState.dailyRecords };
      updatedDailyRecords[oldDate] = recalculateDailyRecord(oldDate, nextState);
      if (newDate !== oldDate) {
        updatedDailyRecords[newDate] = recalculateDailyRecord(newDate, nextState);
      }

      return {
        ...nextState,
        dailyRecords: updatedDailyRecords
      };
    });
  }, [updateState]);

  const handleDeleteWorkout = useCallback((id: string) => {
    updateState((prev) => {
      const target = prev.workouts.find((w) => w.id === id);
      if (!target) return prev;

      const date = target.date;
      const nextState: AppState = {
        ...prev,
        workouts: prev.workouts.filter((w) => w.id !== id)
      };

      const recalculated = recalculateDailyRecord(date, nextState);
      return {
        ...nextState,
        dailyRecords: {
          ...nextState.dailyRecords,
          [date]: recalculated
        }
      };
    });
  }, [updateState]);

  // Study Handlers
  const handleAddProject = useCallback((project: { name: string; color: string }) => {
    updateState((prev) => ({
      ...prev,
      studyProjects: [
        ...prev.studyProjects,
        {
          id: 'sp_' + Date.now(),
          name: project.name,
          color: project.color
        }
      ]
    }));
  }, [updateState]);

  const handleDeleteProject = useCallback((id: string) => {
    updateState((prev) => ({
      ...prev,
      studyProjects: prev.studyProjects.filter((p) => p.id !== id)
    }));
  }, [updateState]);

  const handleAddStudySession = useCallback((session: Omit<StudySession, 'id' | 'createdAt'>) => {
    updateState((prev) => {
      const newSesh: StudySession = {
        ...session,
        id: 'study_' + Date.now(),
        createdAt: new Date().toISOString()
      };
      const nextState: AppState = {
        ...prev,
        studySessions: [...prev.studySessions, newSesh]
      };
      const recalculated = recalculateDailyRecord(session.date, nextState);
      return {
        ...nextState,
        dailyRecords: {
          ...nextState.dailyRecords,
          [session.date]: recalculated
        }
      };
    });
  }, [updateState]);

  const handleDeleteStudySession = useCallback((id: string) => {
    updateState((prev) => {
      const target = prev.studySessions.find((s) => s.id === id);
      if (!target) return prev;

      const date = target.date;
      const nextState: AppState = {
        ...prev,
        studySessions: prev.studySessions.filter((s) => s.id !== id)
      };

      const recalculated = recalculateDailyRecord(date, nextState);
      return {
        ...nextState,
        dailyRecords: {
          ...nextState.dailyRecords,
          [date]: recalculated
        }
      };
    });
  }, [updateState]);

  // Journal Handlers
  const handleAddJournalEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    updateState((prev) => ({
      ...prev,
      journalEntries: [
        ...prev.journalEntries,
        {
          ...entry,
          id: 'j_' + Date.now(),
          createdAt: new Date().toISOString()
        }
      ]
    }));
  }, [updateState]);

  const handleEditJournalEntry = useCallback((id: string, updates: Partial<JournalEntry>) => {
    updateState((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.map((j) => (j.id === id ? { ...j, ...updates } : j))
    }));
  }, [updateState]);

  const handleDeleteJournalEntry = useCallback((id: string) => {
    updateState((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.filter((j) => j.id !== id)
    }));
  }, [updateState]);

  // Goals Handlers
  const handleAddGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt'>) => {
    updateState((prev) => ({
      ...prev,
      goals: [
        ...prev.goals,
        {
          ...goal,
          id: 'g_' + Date.now(),
          createdAt: new Date().toISOString()
        }
      ]
    }));
  }, [updateState]);

  const handleEditGoal = useCallback((id: string, updates: Partial<Goal>) => {
    updateState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updates } : g))
    }));
  }, [updateState]);

  const handleDeleteGoal = useCallback((id: string) => {
    updateState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id)
    }));
  }, [updateState]);

  // Detox Handlers
  const handleSaveDetoxLog = useCallback((date: string, log: DigitalDetoxLog) => {
    updateState((prev) => ({
      ...prev,
      digitalDetox: {
        ...prev.digitalDetox,
        [date]: log
      }
    }));
  }, [updateState]);

  // Transformation Handlers
  const handleSaveTransformation = useCallback((data: TransformationData): boolean => {
    let saveFailed = false;
    updateState((prev) => {
      const next: AppState = {
        ...prev,
        transformation: data
      };
      const res = saveState(next);
      if (!res.success) {
        saveFailed = true;
        if (res.isQuotaError) {
          showToast(
            'Storage Limit Reached',
            'Storage limit reached. Remove large transformation images or export your data.',
            'error'
          );
        } else {
          showToast('Storage Error', res.error || 'Failed to save transformation manifesto.', 'error');
        }
        // Do not alter previous state if save failed
        return prev;
      }
      return next;
    });

    if (!saveFailed) {
      showToast('Transformation Manifesto Saved', 'Your standards have been sealed.', 'success');
      return true;
    }
    return false;
  }, [updateState, showToast]);

  // Weekly Review Handlers
  const handleSaveWeeklyReview = useCallback((review: WeeklyReview) => {
    updateState((prev) => ({
      ...prev,
      weeklyReviews: [...prev.weeklyReviews, review]
    }));
  }, [updateState]);

  // Settings Handlers
  const handleUpdateProfile = useCallback((profile: ArcProfile) => {
    updateState((prev) => ({
      ...prev,
      profile
    }));
  }, [updateState]);

  const handleUpdateArcConfig = useCallback((arcConfig: ArcConfig) => {
    updateState((prev) => ({
      ...prev,
      currentArc: arcConfig
    }));
  }, [updateState]);

  const handleUpdateSettings = useCallback((settings: AppSettings) => {
    updateState((prev) => ({
      ...prev,
      settings
    }));
  }, [updateState]);

  const handleSelectTheme = useCallback((theme: AppTheme) => {
    updateState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme
      }
    }));
    applyThemeToDocument(theme);
    const cfg = THEMES[theme] || THEMES.glacial;
    showToast('Atmospheric Theme Engaged', `Switched to ${cfg.name}.`, 'success');
  }, [updateState, showToast]);

  // Destructive Actions
  const handleResetToday = useCallback(() => {
    updateState((prev) => {
      const rec = prev.dailyRecords[todayStr];
      if (!rec) return prev;
      return {
        ...prev,
        dailyRecords: {
          ...prev.dailyRecords,
          [todayStr]: {
            ...rec,
            completedMissionIds: [],
            score: 0,
            status: 'FUTURE'
          }
        }
      };
    });
  }, [todayStr, updateState]);

  const handleResetCurrentArc = useCallback(() => {
    if (!state.currentArc) return;
    updateState((prev) => {
      const today = getLocalDateString();
      const freshStart = today;
      const freshEnd = addDays(today, 89); // Restarting fresh 90 calendar days from today

      const freshDailyRecords: Record<string, DailyRecord> = {
        [today]: {
          date: today,
          score: 0,
          completedMissionIds: [],
          totalMissionsCount: prev.missions.length,
          workoutMinutes: 0,
          studyMinutes: 0,
          focusMinutes: 0,
          status: 'FUTURE'
        }
      };

      const freshMissions = prev.missions.map((m) => ({
        ...m,
        completed: false,
        streak: 0
      }));

      const freshAchievements = INITIAL_ACHIEVEMENTS.map((a) => ({
        ...a,
        unlocked: false,
        progress: 0,
        unlockedAt: undefined
      }));

      return {
        ...prev,
        currentArc: prev.currentArc ? {
          ...prev.currentArc,
          startDate: freshStart,
          endDate: freshEnd,
          totalDays: 90
        } : null,
        missions: freshMissions,
        dailyRecords: freshDailyRecords,
        workouts: [],
        studySessions: [],
        focusSessions: [],
        weeklyReviews: [],
        digitalDetox: {},
        achievements: freshAchievements
      };
    });
  }, [state.currentArc, updateState]);

  const handleDeleteAllData = useCallback(() => {
    clearState();
    const fresh = getInitialState();
    setState(fresh);
    showToast('Factory Reset Complete', 'All local storage records have been cleared.', 'info');
  }, [showToast]);

  const handleStateImported = useCallback((newState: AppState) => {
    const saveResult = saveState(newState);
    if (!saveResult.success) {
      throw new Error(saveResult.error || 'Failed to save imported state to local storage.');
    }
    setState(newState);
    applyThemeToDocument(newState.settings.theme || 'glacial');
  }, []);

  // Arc Archiving & Culmination
  const handleArchiveAndStartNewArc = useCallback((archivedArc: ArchivedArc) => {
    updateState((prev) => {
      // Prevent duplicate archive entries
      if (prev.archivedArcs.some((a) => a.id === archivedArc.id)) {
        return prev;
      }

      const today = getLocalDateString();
      const freshArcId = 'arc_' + Date.now();
      const freshStart = today;
      const freshEnd = addDays(today, 89); // Exactly 90 calendar days

      const freshDailyRecords: Record<string, DailyRecord> = {
        [today]: {
          date: today,
          score: 0,
          completedMissionIds: [],
          totalMissionsCount: prev.missions.length,
          workoutMinutes: 0,
          studyMinutes: 0,
          focusMinutes: 0,
          status: 'FUTURE'
        }
      };

      const freshMissions = prev.missions.map((m) => ({
        ...m,
        completed: false,
        streak: 0
      }));

      return {
        ...prev,
        archivedArcs: [...prev.archivedArcs, archivedArc],
        currentArc: {
          id: freshArcId,
          name: `Winter Arc ${prev.archivedArcs.length + 2}`,
          mainGoal: prev.profile.mainGoal,
          startDate: freshStart,
          endDate: freshEnd,
          totalDays: 90,
          wakeTime: prev.profile.wakeTime,
          sleepTime: prev.profile.sleepTime,
          createdAt: new Date().toISOString()
        },
        missions: freshMissions,
        dailyRecords: freshDailyRecords,
        workouts: [],
        studySessions: [],
        focusSessions: [],
        weeklyReviews: [],
        digitalDetox: {}
      };
    });
    setIsCompletionModalOpen(false);
    showToast('New Arc Commenced', 'Previous Arc archived to history.', 'success');
  }, [updateState, showToast]);

  // If user hasn't completed onboarding, render cinematic onboarding sequence
  if (!state.hasCompletedOnboarding) {
    return (
      <>
        <SnowCanvas
          enabled={state.settings.snowfallEnabled}
          reducedMotion={state.settings.reducedMotion}
          theme={state.settings.theme || 'glacial'}
        />
        <Onboarding
          soundEnabled={state.settings.soundEnabled}
          onComplete={(newState) => setState(newState)}
        />
      </>
    );
  }

  // Final stats for Arc completion review modal
  const arcTotalWorkoutMinutes = state.workouts.reduce((acc, w) => acc + w.durationMinutes, 0);
  const arcTotalStudyMinutes = state.studySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const arcTotalMissionsCompleted = Object.values(state.dailyRecords).reduce(
    (acc, r) => acc + (r.completedMissionIds?.length || 0), 0
  );

  return (
    <div className="min-h-screen bg-[#05070D] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative">
      {/* Ambient Canvas Background */}
      <SnowCanvas
        enabled={state.settings.snowfallEnabled}
        reducedMotion={state.settings.reducedMotion}
        theme={state.settings.theme || 'glacial'}
      />

      {/* Persistent Navigation */}
      <Navigation
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenReset={() => setIsResetModalOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        currentTheme={state.settings.theme || 'glacial'}
        dayNumber={currentArcDayNumber}
        totalDays={totalArcDays}
        userName={state.profile.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-6 px-4 md:px-8 max-w-7xl w-full mx-auto relative z-10">
        {currentView === 'HOME' && (
          <HomeView
            state={state}
            onToggleMission={handleToggleMission}
            onNavigate={setCurrentView}
            onOpenReset={() => setIsResetModalOpen(true)}
            currentStreak={streakMetrics.currentStreak}
            longestStreak={streakMetrics.longestStreak}
            todayScore={todayScore}
          />
        )}

        {currentView === 'ARC' && (
          <TheArcView
            state={state}
            onOpenReset={() => setIsResetModalOpen(true)}
            onTriggerCompletion={() => setIsCompletionModalOpen(true)}
          />
        )}

        {currentView === 'MISSIONS' && (
          <MissionsView
            state={state}
            onToggleMission={handleToggleMission}
            onAddMission={handleAddMission}
            onEditMission={handleEditMission}
            onDeleteMission={handleDeleteMission}
          />
        )}

        {currentView === 'FOCUS' && (
          <FocusView
            state={state}
            onRecordFocusSession={handleRecordFocusSession}
            onDeleteFocusSession={handleDeleteFocusSession}
          />
        )}

        {currentView === 'PHYSICAL' && (
          <PhysicalView
            state={state}
            onAddWorkout={handleAddWorkout}
            onEditWorkout={handleEditWorkout}
            onDeleteWorkout={handleDeleteWorkout}
          />
        )}

        {currentView === 'MENTAL' && (
          <MentalView
            state={state}
            onAddProject={handleAddProject}
            onDeleteProject={handleDeleteProject}
            onAddStudySession={handleAddStudySession}
            onDeleteStudySession={handleDeleteStudySession}
          />
        )}

        {currentView === 'JOURNAL' && (
          <JournalView
            state={state}
            onAddEntry={handleAddJournalEntry}
            onEditEntry={handleEditJournalEntry}
            onDeleteEntry={handleDeleteJournalEntry}
          />
        )}

        {currentView === 'GOALS' && (
          <GoalsView
            state={state}
            onAddGoal={handleAddGoal}
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {currentView === 'PROGRESS' && (
          <ProgressView
            state={state}
            currentStreak={streakMetrics.currentStreak}
            longestStreak={streakMetrics.longestStreak}
          />
        )}

        {currentView === 'ACHIEVEMENTS' && (
          <AchievementsView
            state={state}
          />
        )}

        {currentView === 'DETOX' && (
          <DetoxView
            state={state}
            onSaveDetoxLog={handleSaveDetoxLog}
          />
        )}

        {currentView === 'TRANSFORMATION' && (
          <TransformationView
            state={state}
            onSaveTransformation={handleSaveTransformation}
          />
        )}

        {currentView === 'WEEKLY_REVIEW' && (
          <WeeklyReviewView
            state={state}
            onSaveReview={handleSaveWeeklyReview}
            currentStreak={streakMetrics.currentStreak}
          />
        )}

        {currentView === 'HISTORY' && (
          <ArcHistoryView
            state={state}
          />
        )}

        {currentView === 'SETTINGS' && (
          <SettingsView
            state={state}
            onUpdateProfile={handleUpdateProfile}
            onUpdateArcConfig={handleUpdateArcConfig}
            onUpdateSettings={handleUpdateSettings}
            onResetToday={handleResetToday}
            onResetCurrentArc={handleResetCurrentArc}
            onDeleteAllData={handleDeleteAllData}
            onStateImported={handleStateImported}
          />
        )}
      </main>

      {/* Full Screen Reset Modal */}
      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetComplete={() => {
          showToast('System Reset Complete', 'Mental slate cleared. Begin again.', 'success');
        }}
        soundEnabled={state.settings.soundEnabled}
      />

      {/* Arc Culmination Modal */}
      {state.currentArc && (
        <ArcCompletionModal
          isOpen={isCompletionModalOpen}
          onClose={() => setIsCompletionModalOpen(false)}
          arc={state.currentArc}
          stats={{
            totalDays: totalArcDays,
            perfectDays: streakMetrics.perfectDays,
            longestStreak: streakMetrics.longestStreak,
            missionsCompleted: arcTotalMissionsCompleted,
            focusSessions: state.focusSessions.length,
            studyHours: Math.round(arcTotalStudyMinutes / 60),
            workoutMinutes: arcTotalWorkoutMinutes,
            finalScore: averageArcScore
          }}
          onArchiveAndStartNew={handleArchiveAndStartNewArc}
          soundEnabled={state.settings.soundEnabled}
        />
      )}

      {/* Atmospheric Theme Switcher Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={state.settings.theme || 'glacial'}
        onSelectTheme={handleSelectTheme}
        soundEnabled={state.settings.soundEnabled}
      />

      {/* Global Command Center Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        state={state}
        onNavigate={setCurrentView}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
