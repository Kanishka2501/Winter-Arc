import React, { useState } from 'react';
import {
  Snowflake,
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Timer,
  Dumbbell,
  Brain,
  BookMarked,
  Target,
  LineChart,
  Trophy,
  PhoneOff,
  Flame,
  FileText,
  History,
  Settings,
  RefreshCw,
  Menu,
  X,
  Palette,
  Search
} from 'lucide-react';
import { NavigationView, AppTheme } from '../types';

interface NavigationProps {
  currentView: NavigationView;
  onSelectView: (view: NavigationView) => void;
  onOpenReset: () => void;
  onOpenThemeModal?: () => void;
  onOpenSearch?: () => void;
  currentTheme?: AppTheme;
  dayNumber: number;
  totalDays: number;
  userName: string;
}

interface NavItem {
  id: NavigationView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'HOME', label: 'Command Center', icon: LayoutDashboard },
  { id: 'ARC', label: 'The Arc', icon: Calendar },
  { id: 'MISSIONS', label: 'Missions', icon: CheckSquare },
  { id: 'FOCUS', label: 'Focus Mode', icon: Timer },
  { id: 'PHYSICAL', label: 'Physical Arc', icon: Dumbbell },
  { id: 'MENTAL', label: 'Mental Arc', icon: Brain },
  { id: 'JOURNAL', label: 'Private Journal', icon: BookMarked },
  { id: 'GOALS', label: 'The Mission', icon: Target },
  { id: 'PROGRESS', label: 'Analytics', icon: LineChart },
  { id: 'ACHIEVEMENTS', label: 'Achievements', icon: Trophy },
  { id: 'DETOX', label: 'Digital Detox', icon: PhoneOff },
  { id: 'TRANSFORMATION', label: 'Transformation', icon: Flame },
  { id: 'WEEKLY_REVIEW', label: 'Weekly Review', icon: FileText },
  { id: 'HISTORY', label: 'Arc History', icon: History },
  { id: 'SETTINGS', label: 'Settings', icon: Settings },
];

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onSelectView,
  onOpenReset,
  onOpenThemeModal,
  onOpenSearch,
  currentTheme = 'glacial',
  dayNumber,
  totalDays,
  userName,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: NavigationView) => {
    onSelectView(view);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#060912]/95 backdrop-blur-md border-b border-cyan-500/20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Snowflake className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-1.5">
              <span>Winter Arc</span>
            </div>
            <div className="text-[10px] font-mono text-cyan-400">
              DAY {dayNumber} / {totalDays}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              title="Global Search"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              <Search className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          {onOpenThemeModal && (
            <button
              type="button"
              onClick={onOpenThemeModal}
              title="Change Theme"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              <Palette className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenReset}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-wider flex items-center gap-1.5 cursor-pointer hover:bg-cyan-900/60"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white bg-white/5 border border-white/10 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col pt-16 px-4 pb-6 overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-wider">{userName || 'OPERATOR'}</div>
              <div className="text-xs font-mono text-cyan-400">ARC ACTIVE · DAY {dayNumber} OF {totalDays}</div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReset();
              }}
              className="w-full py-3 px-4 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span>Full System Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-[#050811]/95 backdrop-blur-xl border-r border-cyan-500/15 z-30 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-cyan-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-md shadow-cyan-950/40">
              <Snowflake className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-widest text-white uppercase">
                Winter Arc
              </h1>
              <div className="text-[10px] font-mono tracking-wider text-cyan-400 uppercase mt-0.5">
                Private HQ
              </div>
            </div>
          </div>

          {/* User & Arc Status */}
          <div className="mt-5 p-3 rounded-xl bg-black/40 border border-cyan-500/15">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 truncate font-medium">{userName || 'OPERATOR'}</span>
              <span className="font-mono text-cyan-300 font-semibold">
                DAY {dayNumber}/{totalDays}
              </span>
            </div>
            {/* Tiny progress bar */}
            <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.round((dayNumber / (totalDays || 1)) * 100))}%` }}
              />
            </div>
          </div>

          {/* Quick Search Shortcut Button */}
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              className="mt-3 w-full px-3 py-2 rounded-xl bg-black/50 hover:bg-black/80 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-white flex items-center justify-between text-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-mono">Search Arc...</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-400">
                ⌘K
              </span>
            </button>
          )}
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs tracking-wide transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm shadow-cyan-950/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer / Reset & Theme Action */}
        <div className="p-4 border-t border-cyan-500/10 space-y-2">
          {onOpenThemeModal && (
            <button
              type="button"
              onClick={onOpenThemeModal}
              className="w-full py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-slate-300 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer hover:text-white"
            >
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span>Theme Atmosphere</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenReset}
            className="w-full py-2.5 px-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-cyan-950/30 group"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
            <span>Reset Mode</span>
          </button>
        </div>
      </aside>
    </>
  );
};
