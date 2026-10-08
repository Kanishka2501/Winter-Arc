import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  X,
  Check
} from 'lucide-react';
import { AppState, Goal } from '../types';
import { getLocalDateString, formatDateDisplay, daysBetween } from '../utils/date';
import { ConfirmModal } from '../components/ConfirmModal';
import { useToast } from '../components/Toast';
import { sound } from '../utils/sound';

interface GoalsViewProps {
  state: AppState;
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  onEditGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
}

type TabType = 'ACTIVE' | 'COMPLETED' | 'OVERDUE';

export const GoalsView: React.FC<GoalsViewProps> = ({
  state,
  onAddGoal,
  onEditGoal,
  onDeleteGoal
}) => {
  const { showToast } = useToast();
  const todayStr = getLocalDateString();
  const [activeTab, setActiveTab] = useState<TabType>('ACTIVE');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('PHYSIQUE');
  const [formDeadline, setFormDeadline] = useState(state.currentArc?.endDate || todayStr);
  const [formProgress, setFormProgress] = useState<number>(0);
  const [formError, setFormError] = useState('');

  // Classify goals
  const activeGoals: Goal[] = [];
  const completedGoals: Goal[] = [];
  const overdueGoals: Goal[] = [];

  state.goals.forEach((g) => {
    if (g.progress >= 100) {
      completedGoals.push(g);
    } else if (g.deadline < todayStr) {
      overdueGoals.push(g);
    } else {
      activeGoals.push(g);
    }
  });

  const currentList =
    activeTab === 'ACTIVE'
      ? activeGoals
      : activeTab === 'COMPLETED'
      ? completedGoals
      : overdueGoals;

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setFormTitle('');
    setFormDesc('');
    setFormCategory('PHYSIQUE');
    setFormDeadline(state.currentArc?.endDate || todayStr);
    setFormProgress(0);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormTitle(goal.title);
    setFormDesc(goal.description);
    setFormCategory(goal.category);
    setFormDeadline(goal.deadline);
    setFormProgress(goal.progress);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Goal title is required.');
      return;
    }

    sound.playComplete(state.settings.soundEnabled);

    if (editingGoal) {
      onEditGoal(editingGoal.id, {
        title: formTitle.trim(),
        description: formDesc.trim(),
        category: formCategory,
        deadline: formDeadline,
        progress: formProgress
      });
      showToast('Mission Objective Updated', 'Goal updated.', 'info');
    } else {
      onAddGoal({
        title: formTitle.trim(),
        description: formDesc.trim(),
        category: formCategory,
        deadline: formDeadline,
        progress: formProgress
      });
      showToast('Mission Objective Locked', `Objective created.`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleProgressSliderChange = (goalId: string, newProgress: number) => {
    onEditGoal(goalId, { progress: newProgress });
    if (newProgress === 100) {
      sound.playTriumph(state.settings.soundEnabled);
      showToast('Target Achieved!', 'Objective marked 100% complete.', 'success');
    }
  };

  const confirmDelete = () => {
    if (!goalToDelete) return;
    onDeleteGoal(goalToDelete.id);
    showToast('Objective Deleted', 'Goal removed from command center.', 'info');
    setGoalToDelete(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                The Mission · Long-Term Objectives
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Fixed targets with deadlines. Do not negotiate with milestones.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Objective</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'ACTIVE'
                ? 'bg-cyan-400 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Active ({activeGoals.length})
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'COMPLETED'
                ? 'bg-cyan-400 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Completed ({completedGoals.length})
          </button>
          <button
            onClick={() => setActiveTab('OVERDUE')}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'OVERDUE'
                ? 'bg-cyan-400 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Overdue ({overdueGoals.length})
          </button>
        </div>
      </section>

      {/* Goals Grid */}
      <section className="space-y-4">
        {currentList.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-[#080d19]/50 border border-dashed border-slate-800 p-6">
            <Target className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-base text-slate-300 font-medium">No {activeTab.toLowerCase()} objectives.</p>
            <p className="text-xs text-slate-500 mt-1">Set clear targets for your transformation.</p>
            {activeTab === 'ACTIVE' && (
              <button
                onClick={handleOpenAdd}
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Set Objective
              </button>
            )}
          </div>
        ) : (
          currentList.map((goal) => {
            const isCompleted = goal.progress >= 100;
            const daysLeft = daysBetween(todayStr, goal.deadline);

            return (
              <div
                key={goal.id}
                className={`rounded-3xl border p-6 md:p-8 transition-all ${
                  isCompleted
                    ? 'bg-cyan-950/20 border-cyan-500/30'
                    : goal.deadline < todayStr
                    ? 'bg-rose-950/15 border-rose-500/30'
                    : 'bg-[#080d19]/80 border-slate-800/80 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                        {goal.category}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase">
                          · COMPLETED
                        </span>
                      )}
                      {!isCompleted && goal.deadline < todayStr && (
                        <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">
                          · OVERDUE
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-white mt-1">
                      {goal.title}
                    </h2>
                    {goal.description && (
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(goal)}
                      aria-label="Edit goal"
                      className="p-2 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoalToDelete(goal)}
                      aria-label="Delete goal"
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar & slider */}
                <div className="mt-6 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-cyan-300 font-bold">{goal.progress}%</span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={goal.progress}
                    onChange={(e) => handleProgressSliderChange(goal.id, parseInt(e.target.value) || 0)}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Target: {formatDateDisplay(goal.deadline)}
                    </span>
                    {!isCompleted && (
                      <span>
                        {daysLeft >= 0 ? `${daysLeft} days remaining` : `${Math.abs(daysLeft)} days overdue`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-[#0a0f1d] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-950/50 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                {editingGoal ? 'Edit Objective' : 'New Mission Target'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Target Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Sub-12% body fat, Ship SaaS v1, 100km run"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. PHYSIQUE, CAREER, INTELLECT, FINANCES"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm font-mono [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Initial Progress ({formProgress}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={formProgress}
                  onChange={(e) => setFormProgress(parseInt(e.target.value) || 0)}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Description / Milestones
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Specific requirements for this target to be considered complete."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Save Objective
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(goalToDelete)}
        title="Delete Objective"
        message="Are you sure you want to delete this target from your Arc?"
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setGoalToDelete(null)}
      />
    </div>
  );
};
