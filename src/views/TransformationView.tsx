import React, { useState } from 'react';
import { 
  Flame, 
  ArrowDown, 
  Upload, 
  Save, 
  Image as ImageIcon, 
  Trash2, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { AppState, TransformationData } from '../types';
import { useToast } from '../components/Toast';
import { sound } from '../utils/sound';

interface TransformationViewProps {
  state: AppState;
  onSaveTransformation: (data: TransformationData) => boolean | void;
}

export const TransformationView: React.FC<TransformationViewProps> = ({
  state,
  onSaveTransformation
}) => {
  const { showToast } = useToast();
  const [data, setData] = useState<TransformationData>(state.transformation);

  const handleTextChange = (field: keyof TransformationData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (field: 'beforePhoto' | 'afterPhoto', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image Too Large', 'Please select an image under 2MB for local storage.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setData((prev) => ({ ...prev, [field]: reader.result }));
        showToast('Image Loaded Locally', 'Stored securely in browser memory.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (field: 'beforePhoto' | 'afterPhoto') => {
    setData((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onSaveTransformation({
      ...data,
      lastUpdated: new Date().toISOString()
    });
    if (result !== false) {
      sound.playTriumph(state.settings.soundEnabled);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <section className="rounded-3xl bg-[#080d19]/90 border border-cyan-500/20 p-6 md:p-8 shadow-xl text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <span className="text-xs uppercase font-mono tracking-[0.25em] text-cyan-300">
            Metamorphosis
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
          Who I Was → Who I'm Becoming
        </h1>
        <p className="text-xs text-slate-400 mt-2">
          Define the chasm between the person you refuse to remain and the sovereign you are forging.
        </p>
      </section>

      <form onSubmit={handleSave} className="space-y-8">
        {/* WHO I WAS */}
        <section className="rounded-3xl bg-[#0a0709]/90 border border-rose-500/20 p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-rose-500/20 mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-rose-400">
                The Former State
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
                Who I Was
              </h2>
            </div>
            <span className="text-xs font-mono text-rose-400/80">BURNING THE PAST</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Old Habits
              </label>
              <textarea
                rows={3}
                value={data.oldHabits}
                onChange={(e) => handleTextChange('oldHabits', e.target.value)}
                placeholder="What daily actions were weakening you?"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-slate-800 focus:border-rose-400 focus:outline-none text-white text-xs resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Old Patterns & Triggers
              </label>
              <textarea
                rows={3}
                value={data.oldPatterns}
                onChange={(e) => handleTextChange('oldPatterns', e.target.value)}
                placeholder="Where did you habitually self-sabotage?"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-slate-800 focus:border-rose-400 focus:outline-none text-white text-xs resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Old Mindset & Rationalizations
              </label>
              <textarea
                rows={3}
                value={data.oldMindset}
                onChange={(e) => handleTextChange('oldMindset', e.target.value)}
                placeholder="What lies did you tell yourself to stay comfortable?"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-slate-800 focus:border-rose-400 focus:outline-none text-white text-xs resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Things Left Behind
              </label>
              <textarea
                rows={3}
                value={data.thingsLeftBehind}
                onChange={(e) => handleTextChange('thingsLeftBehind', e.target.value)}
                placeholder="Relationships, vices, environments that no longer exist for you."
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-slate-800 focus:border-rose-400 focus:outline-none text-white text-xs resize-none"
              />
            </div>
          </div>

          {/* Optional Before Photo */}
          <div className="mt-6 pt-4 border-t border-rose-500/10">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Before Photo / Day 1 Baseline (Local Only)
            </label>
            {data.beforePhoto ? (
              <div className="relative inline-block">
                <img
                  src={data.beforePhoto}
                  alt="Before baseline"
                  className="w-32 h-32 object-cover rounded-2xl border border-rose-500/40"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage('beforePhoto')}
                  className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white cursor-pointer">
                <Upload className="w-4 h-4 text-rose-400" />
                <span>Upload Baseline Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('beforePhoto', e)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </section>

        {/* Transition Icon */}
        <div className="flex justify-center">
          <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 animate-bounce">
            <ArrowDown className="w-6 h-6" />
          </div>
        </div>

        {/* WHO I'M BECOMING */}
        <section className="rounded-3xl bg-[#060c18]/90 border border-cyan-500/30 p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">
                The Sovereign Rebirth
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
                Who I'm Becoming
              </h2>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">FORGED IN WINTER</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                New Non-Negotiable Standards
              </label>
              <textarea
                rows={3}
                value={data.newStandards}
                onChange={(e) => handleTextChange('newStandards', e.target.value)}
                placeholder="What behaviors are completely off the table? What is absolute?"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-slate-800 focus:border-cyan-400 focus:outline-none text-white text-xs resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                New Daily Habits
              </label>
              <textarea
                rows={3}
                value={data.newHabits}
                onChange={(e) => handleTextChange('newHabits', e.target.value)}
                placeholder="Habits executed regardless of mood, temperature, or sleep."
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-slate-800 focus:border-cyan-400 focus:outline-none text-white text-xs resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                New Identity & Aura
              </label>
              <textarea
                rows={3}
                value={data.newIdentity}
                onChange={(e) => handleTextChange('newIdentity', e.target.value)}
                placeholder="How do you carry yourself? How do you react to adversity?"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-slate-800 focus:border-cyan-400 focus:outline-none text-white text-xs resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                What I'm Building
              </label>
              <textarea
                rows={3}
                value={data.whatImBuilding}
                onChange={(e) => handleTextChange('whatImBuilding', e.target.value)}
                placeholder="Physique, enterprise, mental mastery, legacy."
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-slate-800 focus:border-cyan-400 focus:outline-none text-white text-xs resize-none"
              />
            </div>
          </div>

          {/* Optional Current / Vision Photo */}
          <div className="mt-6 pt-4 border-t border-cyan-500/10">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Vision / Current State Photo (Local Only)
            </label>
            {data.afterPhoto ? (
              <div className="relative inline-block">
                <img
                  src={data.afterPhoto}
                  alt="Current / Vision"
                  className="w-32 h-32 object-cover rounded-2xl border border-cyan-500/40"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage('afterPhoto')}
                  className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white cursor-pointer">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload Progress / Target Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('afterPhoto', e)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold uppercase tracking-wider text-xs flex items-center gap-2 transition-all shadow-xl shadow-cyan-500/25 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Seal Transformation Manifesto</span>
          </button>
        </div>
      </form>
    </div>
  );
};
