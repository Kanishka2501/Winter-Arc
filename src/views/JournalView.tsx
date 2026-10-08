import React, { useState } from 'react';
import { 
  BookMarked, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  Smile, 
  Sparkles,
  Lock,
  X
} from 'lucide-react';
import { AppState, JournalEntry, MoodType } from '../types';
import { getLocalDateString, formatDateDisplay } from '../utils/date';
import { ConfirmModal } from '../components/ConfirmModal';
import { useToast } from '../components/Toast';
import { sound } from '../utils/sound';

interface JournalViewProps {
  state: AppState;
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  onEditEntry: (id: string, updates: Partial<JournalEntry>) => void;
  onDeleteEntry: (id: string) => void;
}

const MOODS: { type: MoodType; label: string; color: string }[] = [
  { type: 'CALM', label: 'Calm', color: 'text-sky-400 bg-sky-950/40 border-sky-500/30' },
  { type: 'DETERMINED', label: 'Determined', color: 'text-amber-400 bg-amber-950/40 border-amber-500/30' },
  { type: 'ENERGIZED', label: 'Energized', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' },
  { type: 'FOCUSED', label: 'Focused', color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30' },
  { type: 'LOW', label: 'Low', color: 'text-slate-400 bg-slate-800/40 border-slate-700/40' },
  { type: 'REFLECTIVE', label: 'Reflective', color: 'text-purple-400 bg-purple-950/40 border-purple-500/30' },
];

export const JournalView: React.FC<JournalViewProps> = ({
  state,
  onAddEntry,
  onEditEntry,
  onDeleteEntry
}) => {
  const { showToast } = useToast();
  const todayStr = getLocalDateString();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formMood, setFormMood] = useState<MoodType>('DETERMINED');
  const [formContent, setFormContent] = useState('');
  const [formDate, setFormDate] = useState(todayStr);
  const [formError, setFormError] = useState('');

  const filteredEntries = state.journalEntries
    .filter((e) => {
      const matchQuery =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.entry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchMood = selectedMoodFilter === 'ALL' || e.mood === selectedMoodFilter;
      return matchQuery && matchMood;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleOpenAdd = () => {
    setEditingEntry(null);
    setFormTitle('');
    setFormMood('DETERMINED');
    setFormContent('');
    setFormDate(todayStr);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormTitle(entry.title);
    setFormMood(entry.mood);
    setFormContent(entry.entry);
    setFormDate(entry.date);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Please provide a title for this reflection.');
      return;
    }
    if (!formContent.trim()) {
      setFormError('Journal content cannot be empty.');
      return;
    }

    sound.playComplete(state.settings.soundEnabled);

    if (editingEntry) {
      onEditEntry(editingEntry.id, {
        title: formTitle.trim(),
        mood: formMood,
        entry: formContent.trim(),
        date: formDate,
        updatedAt: new Date().toISOString()
      });
      showToast('Reflection Updated', 'Journal entry updated.', 'info');
    } else {
      onAddEntry({
        title: formTitle.trim(),
        mood: formMood,
        entry: formContent.trim(),
        date: formDate
      });
      showToast('Reflection Saved', 'Your words remain strictly private.', 'success');
    }

    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (!entryToDelete) return;
    onDeleteEntry(entryToDelete.id);
    showToast('Entry Deleted', 'Journal record deleted.', 'info');
    setEntryToDelete(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-indigo-400" />
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                Private Journal
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-cyan-400" />
              100% Client-side local encryption. Nothing leaves this browser.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Entry</span>
          </button>
        </div>

        {/* Search & Mood Filter Bar */}
        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reflections, keywords, thoughts..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-cyan-400 focus:outline-none text-white text-xs placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedMoodFilter('ALL')}
              className={`px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors ${
                selectedMoodFilter === 'ALL'
                  ? 'bg-cyan-400 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All
            </button>
            {MOODS.map((m) => (
              <button
                key={m.type}
                onClick={() => setSelectedMoodFilter(m.type)}
                className={`px-2.5 py-2 rounded-lg text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors ${
                  selectedMoodFilter === m.type
                    ? 'bg-cyan-400 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Journal Entries Feed */}
      <section className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-[#080d19]/50 border border-dashed border-slate-800 p-6">
            <BookMarked className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-base text-slate-300 font-medium">No journal entries found.</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery ? 'Try clearing your search query.' : 'Your unfiltered thoughts belong here.'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleOpenAdd}
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Write First Reflection
              </button>
            )}
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const moodObj = MOODS.find((m) => m.type === entry.mood);

            return (
              <article
                key={entry.id}
                className="rounded-3xl bg-[#080d19]/80 border border-slate-800/80 hover:border-cyan-500/30 transition-all p-6 md:p-8 text-slate-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">
                      {entry.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-xs font-mono text-slate-400">
                      <span>{formatDateDisplay(entry.date)}</span>
                      {entry.updatedAt && <span>(edited)</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {moodObj && (
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider border font-semibold ${moodObj.color}`}>
                        {moodObj.label}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(entry)}
                      aria-label="Edit entry"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntryToDelete(entry)}
                      aria-label="Delete entry"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-sm md:text-base text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {entry.entry}
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Write/Edit Entry Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        >
          <div className="w-full max-w-2xl bg-[#090e1b] border border-cyan-500/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-cyan-950/60 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                {editingEntry ? 'Edit Private Reflection' : 'New Journal Reflection'}
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
                  Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Day 14: Overcoming the urge to surrender"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Mood / Mental State
                  </label>
                  <select
                    value={formMood}
                    onChange={(e) => setFormMood(e.target.value as MoodType)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm [color-scheme:dark]"
                  >
                    {MOODS.map((m) => (
                      <option key={m.type} value={m.type}>
                        {m.label}
                      </option>
                    ))}
                  </select>
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
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Reflection / Raw Truth
                </label>
                <textarea
                  rows={8}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="What happened today? Did you uphold your standards? Where did you hesitate? What will you sharpen tomorrow?"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm leading-relaxed resize-none"
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
                  className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  {editingEntry ? 'Update Entry' : 'Save Reflection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(entryToDelete)}
        title="Delete Reflection"
        message="Are you sure you want to permanently delete this journal entry?"
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setEntryToDelete(null)}
      />
    </div>
  );
};
