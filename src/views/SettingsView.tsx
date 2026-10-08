import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Clock, 
  Calendar, 
  Eye, 
  Volume2, 
  VolumeX, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Sparkles, 
  Save, 
  Droplet,
  ShieldAlert,
  Snowflake,
  Palette,
  Check
} from 'lucide-react';
import { AppState, ArcProfile, ArcConfig, AppSettings, AppTheme } from '../types';
import { THEME_LIST, THEMES, applyThemeToDocument } from '../utils/themes';
import { ConfirmModal } from '../components/ConfirmModal';
import { useToast } from '../components/Toast';
import { 
  exportStateAsJson, 
  validateAndImportJson, 
  clearState 
} from '../utils/storage';
import { sound } from '../utils/sound';

interface SettingsViewProps {
  state: AppState;
  onUpdateProfile: (profile: ArcProfile) => void;
  onUpdateArcConfig: (arc: ArcConfig) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onResetToday: () => void;
  onResetCurrentArc: () => void;
  onDeleteAllData: () => void;
  onStateImported: (newState: AppState) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onUpdateProfile,
  onUpdateArcConfig,
  onUpdateSettings,
  onResetToday,
  onResetCurrentArc,
  onDeleteAllData,
  onStateImported
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Profile Form
  const [profileName, setProfileName] = useState(state.profile.name);
  const [profileGoal, setProfileGoal] = useState(state.profile.mainGoal);
  const [wakeTime, setWakeTime] = useState(state.profile.wakeTime);
  const [sleepTime, setSleepTime] = useState(state.profile.sleepTime);
  const [waterLiters, setWaterLiters] = useState(state.profile.dailyWaterLiters);

  // Arc Dates Form
  const [arcName, setArcName] = useState(state.currentArc?.name || 'Winter Arc I');
  const [arcStartDate, setArcStartDate] = useState(state.currentArc?.startDate || '');
  const [arcEndDate, setArcEndDate] = useState(state.currentArc?.endDate || '');

  // Settings
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(state.settings.theme || 'glacial');
  const [snowfall, setSnowfall] = useState(state.settings.snowfallEnabled);
  const [soundEnabled, setSoundEnabled] = useState(state.settings.soundEnabled);
  const [reducedMotion, setReducedMotion] = useState(state.settings.reducedMotion);

  // Synchronize local form inputs when AppState changes externally (e.g. import, reset)
  useEffect(() => {
    setProfileName(state.profile.name);
    setProfileGoal(state.profile.mainGoal);
    setWakeTime(state.profile.wakeTime);
    setSleepTime(state.profile.sleepTime);
    setWaterLiters(state.profile.dailyWaterLiters);
  }, [state.profile]);

  useEffect(() => {
    setArcName(state.currentArc?.name || 'Winter Arc I');
    setArcStartDate(state.currentArc?.startDate || '');
    setArcEndDate(state.currentArc?.endDate || '');
  }, [state.currentArc]);

  useEffect(() => {
    setSelectedTheme(state.settings.theme || 'glacial');
    setSnowfall(state.settings.snowfallEnabled);
    setSoundEnabled(state.settings.soundEnabled);
    setReducedMotion(state.settings.reducedMotion);
  }, [state.settings]);

  const handleSelectTheme = (theme: AppTheme) => {
    setSelectedTheme(theme);
    applyThemeToDocument(theme);
    sound.playComplete(soundEnabled);
    onUpdateSettings({ ...state.settings, theme });
    const cfg = THEMES[theme] || THEMES.glacial;
    showToast('Atmospheric Theme Engaged', `Theme switched to ${cfg.name}.`, 'success');
  };

  // Confirmation Modals
  const [confirmResetTodayOpen, setConfirmResetTodayOpen] = useState(false);
  const [confirmResetArcOpen, setConfirmResetArcOpen] = useState(false);
  const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playComplete(soundEnabled);
    onUpdateProfile({
      name: profileName.trim() || 'Warrior',
      mainGoal: profileGoal.trim(),
      wakeTime,
      sleepTime,
      dailyWaterLiters: waterLiters
    });
    showToast('Profile Saved', 'Personal standards updated.', 'success');
  };

  const handleSaveArcConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.currentArc) return;
    if (arcEndDate <= arcStartDate) {
      showToast('Invalid Dates', 'End date must be after start date.', 'error');
      return;
    }

    sound.playComplete(soundEnabled);
    onUpdateArcConfig({
      ...state.currentArc,
      name: arcName.trim() || state.currentArc.name,
      mainGoal: profileGoal.trim() || state.currentArc.mainGoal,
      startDate: arcStartDate,
      endDate: arcEndDate,
      wakeTime,
      sleepTime
    });
    showToast('Arc Schedule Updated', 'Timeline recalculated.', 'success');
  };

  const handleToggleSnow = (checked: boolean) => {
    setSnowfall(checked);
    onUpdateSettings({ ...state.settings, snowfallEnabled: checked });
  };

  const handleToggleSound = (checked: boolean) => {
    setSoundEnabled(checked);
    onUpdateSettings({ ...state.settings, soundEnabled: checked });
  };

  const handleToggleReducedMotion = (checked: boolean) => {
    setReducedMotion(checked);
    onUpdateSettings({ ...state.settings, reducedMotion: checked });
  };

  const handleExport = () => {
    try {
      exportStateAsJson(state);
      showToast('Backup Exported', 'winter-arc-backup.json downloaded successfully.', 'success');
    } catch {
      showToast('Export Error', 'Could not export backup.', 'error');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const validState = validateAndImportJson(text);
        onStateImported(validState);
        showToast('Backup Restored', 'All Arc records and standards restored.', 'success');
      } catch (err: any) {
        showToast('Import Failed', err.message || 'Malformed backup JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
            Command Center Settings
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure personal standards, visual preferences, and backup operations.
        </p>
      </section>

      {/* Profile & Standards */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <h2 className="text-base font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          <span>Profile & Daily Standards</span>
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Operator Call-Sign / Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Daily Water Standard (Liters)
              </label>
              <input
                type="number"
                step={0.5}
                min={1}
                max={8}
                value={waterLiters}
                onChange={(e) => setWaterLiters(parseFloat(e.target.value) || 3)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Core Arc Transformation Manifesto
            </label>
            <input
              type="text"
              value={profileGoal}
              onChange={(e) => setProfileGoal(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Wake Up Target
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm font-mono [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Lights Out / Sleep Target
              </label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm font-mono [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold uppercase tracking-wider text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Save Standards</span>
            </button>
          </div>
        </form>
      </section>

      {/* Arc Dates & Schedule */}
      {state.currentArc && (
        <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
          <h2 className="text-base font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Arc Schedule & Dates</span>
          </h2>

          <form onSubmit={handleSaveArcConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Arc Title
              </label>
              <input
                type="text"
                value={arcName}
                onChange={(e) => setArcName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={arcStartDate}
                  onChange={(e) => setArcStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm font-mono [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={arcEndDate}
                  onChange={(e) => setArcEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm font-mono [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold uppercase tracking-wider text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Update Schedule</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Atmospheric Themes Section */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span>Atmospheric Command Themes</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your private headquarters aesthetic. Changes colors, ambient aura, and snowfall particles.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
            6 Available Protocols
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {THEME_LIST.map((themeItem) => {
            const isSelected = selectedTheme === themeItem.id;

            return (
              <button
                key={themeItem.id}
                type="button"
                onClick={() => handleSelectTheme(themeItem.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-black/60 shadow-lg scale-[1.02]'
                    : 'bg-black/30 hover:bg-black/50 border-slate-800'
                }`}
                style={{
                  borderColor: isSelected ? themeItem.accentHex : undefined,
                  boxShadow: isSelected ? `0 0 20px ${themeItem.borderHex}` : undefined
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white tracking-wide">
                      {themeItem.name}
                    </span>
                    {isSelected && (
                      <span 
                        className="p-1 rounded-full text-slate-950 flex items-center justify-center shrink-0"
                        style={{ backgroundColor: themeItem.accentHex }}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {themeItem.subtitle}
                  </p>
                </div>

                {/* Color Swatches Palette */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5">
                  {themeItem.previewColors.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-5 h-5 rounded-md border border-white/10 shrink-0"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <span className="text-[10px] font-mono text-slate-500 uppercase ml-auto">
                    {isSelected ? 'ACTIVE' : 'SELECT'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Atmospheric & Audio Settings */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <h2 className="text-base font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Atmosphere & Sound</span>
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-slate-800">
            <div className="flex items-center gap-3">
              <Snowflake className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-sm font-bold text-white block">Subtle Ambient Snowfall</span>
                <span className="text-xs text-slate-400">Lightweight particle snowfall background.</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={snowfall}
              onChange={(e) => handleToggleSnow(e.target.checked)}
              className="w-5 h-5 accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-slate-800">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-cyan-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <span className="text-sm font-bold text-white block">Synthesized Audio Chimes</span>
                <span className="text-xs text-slate-400">Frost chimes for mission completion & focus timer.</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => handleToggleSound(e.target.checked)}
              className="w-5 h-5 accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-slate-800">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-slate-400" />
              <div>
                <span className="text-sm font-bold text-white block">Reduced Motion</span>
                <span className="text-xs text-slate-400">Disables animations for high-focus performance.</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => handleToggleReducedMotion(e.target.checked)}
              className="w-5 h-5 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Data Management & Backup */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <h2 className="text-base font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Data Backup & Restoration</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleExport}
            className="p-4 rounded-2xl bg-black/40 hover:bg-black/60 border border-cyan-500/25 text-left flex items-start gap-3 transition-colors cursor-pointer"
          >
            <Download className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-sm font-bold text-white block">Export Data Backup</span>
              <span className="text-xs text-slate-400">Download complete application state to JSON.</span>
            </div>
          </button>

          <label className="p-4 rounded-2xl bg-black/40 hover:bg-black/60 border border-cyan-500/25 text-left flex items-start gap-3 transition-colors cursor-pointer">
            <Upload className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-sm font-bold text-white block">Import Data Backup</span>
              <span className="text-xs text-slate-400">Restore verified winter-arc-backup.json file.</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

        {/* Destructive Actions */}
        <div className="mt-8 pt-6 border-t border-rose-500/10 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold block">
            Danger Zone
          </span>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => setConfirmResetTodayOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Today's Record</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmResetArcOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Current Arc</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmDeleteAllOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Data</span>
            </button>
          </div>
        </div>
      </section>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmResetTodayOpen}
        title="Reset Today's Record"
        message="This will reset today's mission completion checkboxes and today's score back to zero. Historical days will remain untouched."
        confirmLabel="Reset Today"
        isDestructive={true}
        onConfirm={() => {
          onResetToday();
          setConfirmResetTodayOpen(false);
          showToast('Today Reset', 'Mission checkboxes cleared for today.', 'info');
        }}
        onCancel={() => setConfirmResetTodayOpen(false)}
      />

      <ConfirmModal
        isOpen={confirmResetArcOpen}
        title="Reset Current Arc"
        message="This will reset all daily records, workout logs, study sessions, focus intervals, detox logs, and weekly reviews for the current Arc, restarting from Day 1. Your profile, personal transformation manifesto, journal reflections, long-term goals, and theme settings will be preserved."
        confirmLabel="Reset Entire Arc"
        isDestructive={true}
        onConfirm={() => {
          onResetCurrentArc();
          setConfirmResetArcOpen(false);
          showToast('Arc Reset', 'Current season reset to Day 1.', 'info');
        }}
        onCancel={() => setConfirmResetArcOpen(false)}
      />

      <ConfirmModal
        isOpen={confirmDeleteAllOpen}
        title="Delete All Data & Factory Reset"
        message="WARNING: This will permanently purge your profile, current Arc, archived seasons, journal reflections, and all progress from browser storage. This cannot be undone."
        confirmLabel="Delete Everything"
        isDestructive={true}
        onConfirm={() => {
          onDeleteAllData();
          setConfirmDeleteAllOpen(false);
        }}
        onCancel={() => setConfirmDeleteAllOpen(false)}
      />
    </div>
  );
};
