import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3, 
  Filter, 
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';
import { AppState, Mission, MissionCategory } from '../types';
import { getLocalDateString } from '../utils/date';
import { ConfirmModal } from '../components/ConfirmModal';
import { useToast } from '../components/Toast';
import { sound } from '../utils/sound';

interface MissionsViewProps {
  state: AppState;
  onToggleMission: (missionId: string) => void;
  onAddMission: (mission: { name: string; category: MissionCategory }) => void;
  onEditMission: (id: string, updates: { name: string; category: MissionCategory }) => void;
  onDeleteMission: (id: string) => void;
}

const CATEGORIES: MissionCategory[] = [
  'PHYSICAL',
  'MENTAL',
  'ACADEMIC',
  'CAREER',
  'DISCIPLINE',
  'SELF-CARE',
  'SPIRITUAL',
  'SOCIAL'
];

export const MissionsView: React.FC<MissionsViewProps> = ({
  state,
  onToggleMission,
  onAddMission,
  onEditMission,
  onDeleteMission
}) => {
  const { showToast } = useToast();
  const todayStr = getLocalDateString();
  const todayRecord = state.dailyRecords[todayStr];
  const completedIds = todayRecord?.completedMissionIds || [];

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [missionToDelete, setMissionToDelete] = useState<Mission | null>(null);

  // Form states
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<MissionCategory>('DISCIPLINE');
  const [formError, setFormError] = useState<string>('');

  const filteredMissions = state.missions.filter((m) => {
    if (selectedCategory === 'ALL') return true;
    return m.category === selectedCategory;
  });

  const totalCount = state.missions.length;
  const completedCount = completedIds.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleOpenAdd = () => {
    setFormName('');
    setFormCategory('DISCIPLINE');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (mission: Mission) => {
    setEditingMission(mission);
    setFormName(mission.name);
    setFormCategory(mission.category);
    setFormError('');
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Mission name cannot be empty.');
      return;
    }

    // Check duplicate
    const exists = state.missions.some(
      (m) => m.name.toLowerCase() === formName.trim().toLowerCase()
    );
    if (exists) {
      setFormError('A mission with this name already exists.');
      return;
    }

    onAddMission({
      name: formName.trim(),
      category: formCategory
    });
    showToast('Mission created', `Added "${formName.trim()}" to daily standards.`, 'success');
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMission) return;
    if (!formName.trim()) {
      setFormError('Mission name cannot be empty.');
      return;
    }

    onEditMission(editingMission.id, {
      name: formName.trim(),
      category: formCategory
    });
    showToast('Mission updated', `Standard updated.`, 'info');
    setEditingMission(null);
  };

  const confirmDelete = () => {
    if (!missionToDelete) return;
    onDeleteMission(missionToDelete.id);
    showToast('Mission removed', `Removed standard from your Arc.`, 'info');
    setMissionToDelete(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-cyan-400" />
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                Daily Mission Control
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Non-negotiable daily protocols that forge your identity.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Mission</span>
          </button>
        </div>

        {/* Progress summary banner */}
        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Completion Rate Today
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              {completedCount} of {totalCount} Standards ({completionPercent}%)
            </div>
          </div>

          <div className="w-full sm:w-64 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-cyan-400 transition-all duration-500 rounded-full"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-cyan-400 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All ({state.missions.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = state.missions.filter((m) => m.category === cat).length;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-cyan-400 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Missions Grid */}
      <section className="space-y-3">
        {filteredMissions.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-[#080d19]/50 border border-dashed border-slate-800 p-6">
            <CheckSquare className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-base text-slate-300 font-medium">No missions found in this category.</p>
            <p className="text-xs text-slate-500 mt-1">Add a new standard to begin tracking.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Add Standard
            </button>
          </div>
        ) : (
          filteredMissions.map((mission) => {
            const isChecked = completedIds.includes(mission.id);

            return (
              <div
                key={mission.id}
                className={`flex items-center justify-between p-4 md:p-5 rounded-2xl border transition-all ${
                  isChecked
                    ? 'bg-cyan-950/20 border-cyan-500/30 text-slate-300'
                    : 'bg-[#080d19]/80 border-slate-800/80 text-white hover:border-slate-700'
                }`}
              >
                <div 
                  onClick={() => onToggleMission(mission.id)}
                  className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer select-none"
                >
                  <button
                    type="button"
                    aria-label={`Toggle ${mission.name}`}
                    className="shrink-0 transition-transform active:scale-90 p-1"
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-600 hover:text-slate-400" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className={`text-base tracking-wide transition-all ${isChecked ? 'line-through text-slate-500' : 'font-medium text-white'}`}>
                      {mission.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400/80">
                        {mission.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Controls */}
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(mission)}
                    aria-label={`Edit ${mission.name}`}
                    className="p-2 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMissionToDelete(mission)}
                    aria-label={`Delete ${mission.name}`}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Add Mission Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-[#0a0f1d] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-950/50 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Create Daily Standard
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
                  Standard / Mission Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Read 20 pages, Cold shower, Run 5k"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as MissionCategory)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm [color-scheme:dark]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Save Standard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Mission Modal */}
      {editingMission && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-[#0a0f1d] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-950/50 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Edit Daily Standard
              </h3>
              <button
                onClick={() => setEditingMission(null)}
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
                  Standard Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as MissionCategory)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm [color-scheme:dark]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingMission(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(missionToDelete)}
        title="Delete Standard"
        message={`Are you sure you want to remove "${missionToDelete?.name}" from your daily standards? This will not erase historical completions.`}
        confirmLabel="Delete Standard"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setMissionToDelete(null)}
      />
    </div>
  );
};
