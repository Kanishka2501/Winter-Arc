import React, { useState } from 'react';
import { 
  Brain, 
  Plus, 
  Trash2, 
  BookOpen, 
  FolderPlus, 
  Clock, 
  CheckCircle2, 
  BarChart3,
  X
} from 'lucide-react';
import { AppState, StudyProject, StudySession } from '../types';
import { getLocalDateString, formatDateDisplay, addDays } from '../utils/date';
import { ConfirmModal } from '../components/ConfirmModal';
import { useToast } from '../components/Toast';
import { sound } from '../utils/sound';

interface MentalViewProps {
  state: AppState;
  onAddProject: (project: { name: string; color: string }) => void;
  onDeleteProject: (id: string) => void;
  onAddStudySession: (session: Omit<StudySession, 'id' | 'createdAt'>) => void;
  onDeleteStudySession: (id: string) => void;
}

const PROJECT_COLORS = ['#38bdf8', '#818cf8', '#a855f7', '#34d399', '#f59e0b', '#f43f5e'];

export const MentalView: React.FC<MentalViewProps> = ({
  state,
  onAddProject,
  onDeleteProject,
  onAddStudySession,
  onDeleteStudySession
}) => {
  const { showToast } = useToast();
  const todayStr = getLocalDateString();

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<StudySession | null>(null);

  // Form states
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    state.studyProjects[0]?.id || ''
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [sessionDate, setSessionDate] = useState<string>(todayStr);
  const [tasksCompleted, setTasksCompleted] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // New project state
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_COLORS[0]);

  // Aggregate stats
  const totalMinutes = state.studySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const totalSessions = state.studySessions.length;

  // Weekly Chart Data (Past 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(todayStr, -(6 - i));
    const daySessions = state.studySessions.filter((s) => s.date === d);
    const dayMins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    return {
      date: d,
      displayDate: formatDateDisplay(d, { weekday: 'short' }),
      minutes: dayMins,
      hours: +(dayMins / 60).toFixed(1)
    };
  });

  const maxMinutesInWeek = Math.max(60, ...last7Days.map((d) => d.minutes));

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setFormError('Please select or create a project/subject.');
      return;
    }
    if (durationMinutes <= 0) {
      setFormError('Duration must be greater than 0.');
      return;
    }

    const proj = state.studyProjects.find((p) => p.id === selectedProjectId);
    const projectName = proj ? proj.name : 'General Study';

    sound.playComplete(state.settings.soundEnabled);
    onAddStudySession({
      projectId: selectedProjectId,
      projectName,
      durationMinutes,
      date: sessionDate,
      tasksCompleted: tasksCompleted.trim() || undefined,
      notes: sessionNotes.trim() || undefined
    });

    showToast('Deep Work Logged', `Recorded ${durationMinutes}m for ${projectName}.`, 'success');
    setIsLogModalOpen(false);
    setTasksCompleted('');
    setSessionNotes('');
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    onAddProject({
      name: newProjectName.trim(),
      color: newProjectColor
    });

    showToast('Project Created', `Added ${newProjectName.trim()}.`, 'info');
    setIsProjectModalOpen(false);
    setNewProjectName('');
  };

  const confirmDeleteSession = () => {
    if (!sessionToDelete) return;
    onDeleteStudySession(sessionToDelete.id);
    showToast('Session Removed', 'Study log removed.', 'info');
    setSessionToDelete(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-400" />
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                Mental Arc & Deep Work
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sharpen the weapon of intellect. Track high-leverage study and relentless skill acquisition.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsProjectModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Subject</span>
            </button>
            <button
              type="button"
              onClick={() => setIsLogModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Study</span>
            </button>
          </div>
        </div>

        {/* Aggregated Totals */}
        <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Deep Work</span>
            <span className="text-3xl font-black font-mono text-cyan-300 mt-1 block">{totalHours}h</span>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Study Sessions</span>
            <span className="text-3xl font-black font-mono text-white mt-1 block">{totalSessions}</span>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 col-span-2 md:col-span-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Active Subjects</span>
            <span className="text-3xl font-black font-mono text-indigo-400 mt-1 block">{state.studyProjects.length}</span>
          </div>
        </div>
      </section>

      {/* Weekly Visual Chart */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              7-Day Study Volume
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Hours per day</span>
        </div>

        {/* Chart Bars */}
        <div className="pt-8 pb-4 flex items-end justify-between gap-2 md:gap-6 h-48 border-b border-slate-800">
          {last7Days.map((day) => {
            const heightPercent = Math.min(100, Math.max(8, (day.minutes / maxMinutesInWeek) * 100));
            const isToday = day.date === todayStr;

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] font-mono text-cyan-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {day.hours}h
                </span>
                <div className="w-full max-w-[40px] bg-slate-900 rounded-t-xl overflow-hidden h-full flex items-end">
                  <div
                    className={`w-full transition-all duration-700 rounded-t-xl ${
                      isToday ? 'bg-cyan-400' : 'bg-cyan-600/60 hover:bg-cyan-500'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className={`text-[10px] font-mono mt-3 uppercase ${isToday ? 'text-cyan-300 font-bold' : 'text-slate-500'}`}>
                  {day.displayDate}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Subjects & Projects Manager */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Disciplines & Projects
          </h2>
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Discipline</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {state.studyProjects.map((p) => {
            const projectMinutes = state.studySessions
              .filter((s) => s.projectId === p.id)
              .reduce((acc, s) => acc + s.durationMinutes, 0);

            return (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-black/40 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color || '#38bdf8' }} />
                  <div>
                    <span className="font-semibold text-sm text-white block">{p.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{(projectMinutes / 60).toFixed(1)}h tracked</span>
                  </div>
                </div>

                {state.studyProjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteProject(p.id)}
                    className="p-1.5 text-slate-600 hover:text-rose-400 transition-colors cursor-pointer"
                    aria-label={`Delete ${p.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Sessions List */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-white uppercase tracking-wider px-1">
          Recent Study Sessions
        </h2>

        {state.studySessions.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-[#080d19]/50 border border-dashed border-slate-800 p-6">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No study sessions logged.</p>
            <p className="text-xs text-slate-500 mt-1">Log your reading, coding, or research blocks.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...state.studySessions].reverse().map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#080d19]/80 border border-slate-800 hover:border-indigo-500/20 transition-all text-slate-200"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{session.projectName}</span>
                      <span className="text-xs font-mono text-cyan-300">+{session.durationMinutes} min</span>
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      {formatDateDisplay(session.date)}
                    </div>
                    {session.tasksCompleted && (
                      <div className="mt-1 text-xs text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{session.tasksCompleted}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSessionToDelete(session)}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer shrink-0 ml-3"
                  aria-label="Delete session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Log Study Modal */}
      {isLogModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-[#0a0f1d] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-950/50 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Log Deep Work Session
              </h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Discipline / Project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm [color-scheme:dark]"
                >
                  {state.studyProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm font-mono [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Tasks Accomplished
                </label>
                <input
                  type="text"
                  value={tasksCompleted}
                  onChange={(e) => setTasksCompleted(e.target.value)}
                  placeholder="e.g. Read chapters 3 & 4, implemented auth logic"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {isProjectModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm bg-[#0a0f1d] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-950/50 text-slate-100">
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4">
              Add Subject / Discipline
            </h3>
            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Systems Architecture, Stoicism"
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Badge Color
                </label>
                <div className="flex items-center gap-3">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewProjectColor(color)}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                        newProjectColor === color ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold uppercase tracking-wider"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(sessionToDelete)}
        title="Delete Study Record"
        message="Are you sure you want to delete this study session?"
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={confirmDeleteSession}
        onCancel={() => setSessionToDelete(null)}
      />
    </div>
  );
};
