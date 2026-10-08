import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  CheckSquare, 
  BookMarked, 
  Target, 
  Dumbbell, 
  Brain, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AppState, NavigationView } from '../types';
import { formatDateDisplay } from '../utils/date';
import { sound } from '../utils/sound';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onNavigate: (view: NavigationView) => void;
}

interface SearchResultItem {
  id: string;
  type: 'MISSION' | 'JOURNAL' | 'GOAL' | 'WORKOUT' | 'STUDY';
  title: string;
  subtitle: string;
  detail?: string;
  view: NavigationView;
  meta?: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  state,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard shortcut listener for Esc, Up/Down arrows, Enter
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Aggregate search across missions, journal, goals, workouts, study
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // If empty query, show quick recommendations / recent items
      const recentMissions: SearchResultItem[] = state.missions.slice(0, 3).map((m) => ({
        id: 'rec_m_' + m.id,
        type: 'MISSION',
        title: m.name,
        subtitle: `Standard · ${m.category}`,
        view: 'MISSIONS'
      }));

      const recentGoals: SearchResultItem[] = state.goals.slice(0, 2).map((g) => ({
        id: 'rec_g_' + g.id,
        type: 'GOAL',
        title: g.title,
        subtitle: `Objective · ${g.progress}% Complete`,
        view: 'GOALS'
      }));

      const recentJournal: SearchResultItem[] = state.journalEntries.slice(0, 2).map((j) => ({
        id: 'rec_j_' + j.id,
        type: 'JOURNAL',
        title: j.title,
        subtitle: `Journal · ${formatDateDisplay(j.date)} (${j.mood})`,
        view: 'JOURNAL'
      }));

      return [...recentMissions, ...recentGoals, ...recentJournal];
    }

    const items: SearchResultItem[] = [];

    // 1. Search Missions
    state.missions.forEach((m) => {
      if (m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)) {
        items.push({
          id: 'm_' + m.id,
          type: 'MISSION',
          title: m.name,
          subtitle: `Daily Standard · ${m.category}`,
          detail: m.completed ? 'Status: Completed Today' : 'Status: Pending',
          view: 'MISSIONS'
        });
      }
    });

    // 2. Search Goals
    state.goals.forEach((g) => {
      if (
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
      ) {
        items.push({
          id: 'g_' + g.id,
          type: 'GOAL',
          title: g.title,
          subtitle: `Mission Objective · ${g.category} · Target: ${formatDateDisplay(g.deadline)}`,
          detail: `${g.progress}% completed`,
          view: 'GOALS'
        });
      }
    });

    // 3. Search Journal Entries
    state.journalEntries.forEach((j) => {
      if (
        j.title.toLowerCase().includes(q) ||
        j.entry.toLowerCase().includes(q) ||
        j.mood.toLowerCase().includes(q)
      ) {
        // Snippet around match
        let snippet = j.entry.substring(0, 100);
        const matchIdx = j.entry.toLowerCase().indexOf(q);
        if (matchIdx > 20) {
          snippet = '...' + j.entry.substring(matchIdx - 15, matchIdx + 85) + '...';
        }

        items.push({
          id: 'j_' + j.id,
          type: 'JOURNAL',
          title: j.title,
          subtitle: `Reflection · ${formatDateDisplay(j.date)} · Mood: ${j.mood}`,
          detail: snippet,
          view: 'JOURNAL'
        });
      }
    });

    // 4. Search Workouts
    state.workouts.forEach((w) => {
      const typeStr = (w.type === 'Custom' ? w.customTypeName : w.type) || '';
      if (typeStr.toLowerCase().includes(q) || (w.notes && w.notes.toLowerCase().includes(q))) {
        items.push({
          id: 'w_' + w.id,
          type: 'WORKOUT',
          title: `${typeStr} (${w.durationMinutes} min)`,
          subtitle: `Physical Training · ${formatDateDisplay(w.date)}`,
          detail: w.notes,
          view: 'PHYSICAL'
        });
      }
    });

    // 5. Search Study Sessions
    state.studySessions.forEach((s) => {
      if (
        s.projectName.toLowerCase().includes(q) ||
        (s.tasksCompleted && s.tasksCompleted.toLowerCase().includes(q))
      ) {
        items.push({
          id: 's_' + s.id,
          type: 'STUDY',
          title: `${s.projectName} (${s.durationMinutes} min)`,
          subtitle: `Mental Arc · ${formatDateDisplay(s.date)}`,
          detail: s.tasksCompleted,
          view: 'MENTAL'
        });
      }
    });

    return items;
  }, [query, state]);

  const handleSelectResult = (item: SearchResultItem) => {
    sound.playComplete(state.settings.soundEnabled);
    onNavigate(item.view);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelectResult(results[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#080d19] border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-950/70 overflow-hidden text-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-black/40">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search missions, journal reflections, targets, workouts..."
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm md:text-base focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700">
            ESC
          </span>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          {!query.trim() && (
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Suggested Command Shortcuts</span>
            </div>
          )}

          {results.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
              <p className="text-sm text-slate-400 font-medium">No results found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">Try another keyword or category name.</p>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = selectedIndex === idx;

              let icon = <CheckSquare className="w-4 h-4 text-cyan-400" />;
              let badgeColor = 'text-cyan-400 bg-cyan-950/40 border-cyan-500/20';

              if (item.type === 'GOAL') {
                icon = <Target className="w-4 h-4 text-amber-400" />;
                badgeColor = 'text-amber-400 bg-amber-950/40 border-amber-500/20';
              } else if (item.type === 'JOURNAL') {
                icon = <BookMarked className="w-4 h-4 text-indigo-400" />;
                badgeColor = 'text-indigo-400 bg-indigo-950/40 border-indigo-500/20';
              } else if (item.type === 'WORKOUT') {
                icon = <Dumbbell className="w-4 h-4 text-emerald-400" />;
                badgeColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20';
              } else if (item.type === 'STUDY') {
                icon = <Brain className="w-4 h-4 text-purple-400" />;
                badgeColor = 'text-purple-400 bg-purple-950/40 border-purple-500/20';
              }

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectResult(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-start justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 border border-cyan-500/40 text-white shadow-md shadow-cyan-950/30'
                      : 'bg-black/30 hover:bg-black/50 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="mt-0.5 p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                      {icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white truncate">
                          {item.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border font-bold ${badgeColor}`}>
                          {item.type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 font-mono truncate">
                        {item.subtitle}
                      </div>
                      {item.detail && (
                        <p className="text-[11px] text-slate-300/80 mt-1 italic line-clamp-1">
                          "{item.detail}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-3 text-cyan-400 self-center">
                    <span className="text-[10px] font-mono uppercase hidden sm:inline-block">
                      Jump to {item.view}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Tip */}
        <div className="px-5 py-2.5 bg-black/60 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span><strong className="text-slate-400">↑↓</strong> Navigate</span>
            <span><strong className="text-slate-400">↵</strong> Select</span>
            <span><strong className="text-slate-400">ESC</strong> Close</span>
          </div>
          <span className="text-cyan-400/80">Winter Arc Command Engine</span>
        </div>
      </div>
    </div>
  );
};
