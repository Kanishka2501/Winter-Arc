import React from 'react';
import { Palette, Check, X, Sparkles } from 'lucide-react';
import { AppTheme } from '../types';
import { THEME_LIST, THEMES, applyThemeToDocument } from '../utils/themes';
import { sound } from '../utils/sound';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  soundEnabled: boolean;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  soundEnabled
}) => {
  if (!isOpen) return null;

  const handlePick = (theme: AppTheme) => {
    sound.playComplete(soundEnabled);
    applyThemeToDocument(theme);
    onSelectTheme(theme);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <div 
        className="w-full max-w-xl bg-[#080d19] border border-cyan-500/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-cyan-950/60 text-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Atmospheric Command Themes
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch your visual environment. Changes aura, accents, and snowfall.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Theme Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {THEME_LIST.map((t) => {
            const isSelected = currentTheme === t.id;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handlePick(t.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-black/80 shadow-lg scale-[1.02]'
                    : 'bg-black/40 hover:bg-black/60 border-slate-800'
                }`}
                style={{
                  borderColor: isSelected ? t.accentHex : undefined,
                  boxShadow: isSelected ? `0 0 16px ${t.borderHex}` : undefined
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white tracking-wide">
                      {t.name}
                    </span>
                    {isSelected && (
                      <span 
                        className="p-1 rounded-full text-slate-950 flex items-center justify-center shrink-0"
                        style={{ backgroundColor: t.accentHex }}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {t.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5">
                  {t.previewColors.map((c, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-md border border-white/10 shrink-0"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <span 
                    className="text-[10px] font-mono uppercase ml-auto font-semibold"
                    style={{ color: isSelected ? t.accentHex : '#64748b' }}
                  >
                    {isSelected ? 'ACTIVE' : 'SELECT'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
