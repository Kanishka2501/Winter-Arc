import React, { useState } from 'react';
import { 
  Dumbbell, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  Activity, 
  Flame,
  X,
  CheckCircle2
} from 'lucide-react';
import { AppState, WorkoutLog, WorkoutType } from '../types';
import { getLocalDateString, formatDateDisplay, addDays } from '../utils/date';
import { ConfirmModal } from '../components/ConfirmModal';
import { useToast } from '../components/Toast';
import { sound } from '../utils/sound';

interface PhysicalViewProps {
  state: AppState;
  onAddWorkout: (workout: Omit<WorkoutLog, 'id' | 'createdAt'>) => void;
  onEditWorkout: (id: string, updates: Partial<WorkoutLog>) => void;
  onDeleteWorkout: (id: string) => void;
}

const WORKOUT_TYPES: WorkoutType[] = [
  'Strength',
  'Cardio',
  'Running',
  'Walking',
  'Pilates',
  'Mobility',
  'Workout',
  'Custom'
];

export const PhysicalView: React.FC<PhysicalViewProps> = ({
  state,
  onAddWorkout,
  onEditWorkout,
  onDeleteWorkout
}) => {
  const { showToast } = useToast();
  const todayStr = getLocalDateString();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkoutLog | null>(null);
  const [logToDelete, setLogToDelete] = useState<WorkoutLog | null>(null);

  // Form states
  const [formType, setFormType] = useState<WorkoutType>('Strength');
  const [formCustomName, setFormCustomName] = useState('');
  const [formDuration, setFormDuration] = useState<number>(45);
  const [formDate, setFormDate] = useState<string>(todayStr);
  const [formNotes, setFormNotes] = useState<string>('');
  const [formIntensity, setFormIntensity] = useState<'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'>('HIGH');
  const [formError, setFormError] = useState<string>('');

  // Weekly stats calculation (past 7 days including today)
  const weekStartStr = addDays(todayStr, -6);
  const workoutsThisWeek = state.workouts.filter(w => w.date >= weekStartStr && w.date <= todayStr);
  const minutesThisWeek = workoutsThisWeek.reduce((acc, w) => acc + w.durationMinutes, 0);
  const totalWorkouts = state.workouts.length;

  // Consistency: out of past 7 days, how many had at least one workout
  const uniqueWorkoutDaysThisWeek = new Set(workoutsThisWeek.map(w => w.date)).size;
  const consistencyPercent = Math.min(100, Math.round((uniqueWorkoutDaysThisWeek / 7) * 100));

  const handleOpenAdd = () => {
    setFormType('Strength');
    setFormCustomName('');
    setFormDuration(45);
    setFormDate(todayStr);
    setFormNotes('');
    setFormIntensity('HIGH');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (log: WorkoutLog) => {
    setEditingLog(log);
    setFormType(log.type);
    setFormCustomName(log.customTypeName || '');
    setFormDuration(log.durationMinutes);
    setFormDate(log.date);
    setFormNotes(log.notes || '');
    setFormIntensity(log.intensity || 'HIGH');
    setFormError('');
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (formDuration <= 0) {
      setFormError('Duration must be greater than 0 minutes.');
      return;
    }
    if (formType === 'Custom' && !formCustomName.trim()) {
      setFormError('Please specify the custom workout name.');
      return;
    }

    sound.playComplete(state.settings.soundEnabled);
    onAddWorkout({
      type: formType,
      customTypeName: formType === 'Custom' ? formCustomName.trim() : undefined,
      durationMinutes: formDuration,
      date: formDate,
      notes: formNotes.trim() || undefined,
      intensity: formIntensity
    });

    showToast('Training Logged', `Recorded ${formDuration}m of ${formType === 'Custom' ? formCustomName : formType}.`, 'success');
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;
    if (formDuration <= 0) {
      setFormError('Duration must be greater than 0 minutes.');
      return;
    }
    if (formType === 'Custom' && !formCustomName.trim()) {
      setFormError('Please specify the custom workout name.');
      return;
    }

    onEditWorkout(editingLog.id, {
      type: formType,
      customTypeName: formType === 'Custom' ? formCustomName.trim() : undefined,
      durationMinutes: formDuration,
      date: formDate,
      notes: formNotes.trim() || undefined,
      intensity: formIntensity
    });

    showToast('Log Updated', 'Workout details updated.', 'info');
    setEditingLog(null);
  };

  const confirmDelete = () => {
    if (!logToDelete) return;
    onDeleteWorkout(logToDelete.id);
    showToast('Workout Deleted', 'Training entry removed.', 'info');
    setLogToDelete(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-cyan-400" />
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                Physical Arc
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Forge a body that can endure the standards of your mind.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Log Training</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Workouts This Week
            </span>
            <span className="text-2xl font-black font-mono text-white mt-1 block">
              {workoutsThisWeek.length}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Minutes This Week
            </span>
            <span className="text-2xl font-black font-mono text-cyan-400 mt-1 block">
              {minutesThisWeek}m
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Total Arc Workouts
            </span>
            <span className="text-2xl font-black font-mono text-white mt-1 block">
              {totalWorkouts}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              7-Day Consistency
            </span>
            <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
              {consistencyPercent}%
            </span>
          </div>
        </div>
      </section>

      {/* Workout Logs List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Training History
          </h2>
          <span className="text-xs font-mono text-slate-500">
            {state.workouts.length} total entries
          </span>
        </div>

        {state.workouts.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-[#080d19]/50 border border-dashed border-slate-800 p-6">
            <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-base text-slate-300 font-medium">No workouts logged.</p>
            <p className="text-xs text-slate-500 mt-1">Start with one session today. Iron sharpens iron.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Log First Workout
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {[...state.workouts].reverse().map((workout) => (
              <div
                key={workout.id}
                className="flex items-center justify-between p-4 md:p-5 rounded-2xl bg-[#080d19]/80 border border-slate-800/80 hover:border-cyan-500/20 transition-all text-slate-200"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">
                        {workout.type === 'Custom' ? workout.customTypeName : workout.type}
                      </span>
                      {workout.intensity && (
                        <span className="text-[10px] font-mono text-cyan-400/80 uppercase">
                          · {workout.intensity}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 font-mono">
                      <span>{formatDateDisplay(workout.date)}</span>
                      <span>·</span>
                      <span className="text-cyan-300 font-semibold">{workout.durationMinutes} min</span>
                    </div>
                    {workout.notes && (
                      <p className="text-xs text-slate-300 mt-1.5 italic line-clamp-2">
                        "{workout.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(workout)}
                    aria-label="Edit workout"
                    className="p-2 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogToDelete(workout)}
                    aria-label="Delete workout"
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Workout Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-[#0a0f1d] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-950/50 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Log Physical Training
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Workout Type
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as WorkoutType)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm [color-scheme:dark]"
                >
                  {WORKOUT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {formType === 'Custom' && (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Custom Exercise Name
                  </label>
                  <input
                    type="text"
                    value={formCustomName}
                    onChange={(e) => setFormCustomName(e.target.value)}
                    placeholder="e.g. Boxing, Rowing, Kettlebell Circuit"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={360}
                    value={formDuration}
                    onChange={(e) => setFormDuration(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Intensity
                  </label>
                  <select
                    value={formIntensity}
                    onChange={(e) => setFormIntensity(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm [color-scheme:dark]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="HIGH">High</option>
                    <option value="EXTREME">Extreme</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm font-mono [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Notes / Sets / Milestones
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. 5x5 squats @ 225 lbs, felt strong"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Log Workout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Workout Modal */}
      {editingLog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-[#0a0f1d] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-950/50 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Edit Training Log
              </h3>
              <button
                onClick={() => setEditingLog(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Workout Type
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as WorkoutType)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm [color-scheme:dark]"
                >
                  {WORKOUT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {formType === 'Custom' && (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Custom Exercise Name
                  </label>
                  <input
                    type="text"
                    value={formCustomName}
                    onChange={(e) => setFormCustomName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={360}
                    value={formDuration}
                    onChange={(e) => setFormDuration(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Intensity
                  </label>
                  <select
                    value={formIntensity}
                    onChange={(e) => setFormIntensity(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm [color-scheme:dark]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="HIGH">High</option>
                    <option value="EXTREME">Extreme</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm font-mono [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(logToDelete)}
        title="Delete Workout Log"
        message="Are you sure you want to delete this workout log? This action cannot be undone."
        confirmLabel="Delete Log"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setLogToDelete(null)}
      />
    </div>
  );
};
