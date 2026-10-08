import { AppTheme } from '../types';

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  subtitle: string;
  icon: string;
  accentHex: string;
  secondaryHex: string;
  bgRoot: string;
  cardBg: string;
  borderHex: string;
  snowColor: string;
  snowGlow: string;
  previewColors: string[];
}

export const THEMES: Record<AppTheme, ThemeConfig> = {
  glacial: {
    id: 'glacial',
    name: 'Glacial Ice ❄️',
    subtitle: 'Pure sub-zero discipline · Cyan & Frost',
    icon: 'Snowflake',
    accentHex: '#38bdf8',
    secondaryHex: '#0284c7',
    bgRoot: '#05070D',
    cardBg: '#080d19',
    borderHex: 'rgba(56, 189, 248, 0.22)',
    snowColor: 'rgba(224, 242, 254, 0.75)',
    snowGlow: 'rgba(186, 230, 253, 0.45)',
    previewColors: ['#05070D', '#080d19', '#38bdf8', '#bae6fd']
  },
  aurora: {
    id: 'aurora',
    name: 'Nordic Aurora 🌌',
    subtitle: 'Boreal lights · Emerald, Teal & Polar Violet',
    icon: 'Sparkles',
    accentHex: '#10b981',
    secondaryHex: '#06b6d4',
    bgRoot: '#040907',
    cardBg: '#07130f',
    borderHex: 'rgba(16, 185, 129, 0.22)',
    snowColor: 'rgba(167, 243, 208, 0.75)',
    snowGlow: 'rgba(52, 211, 153, 0.45)',
    previewColors: ['#040907', '#07130f', '#10b981', '#6ee7b7']
  },
  stealth: {
    id: 'stealth',
    name: 'Midnight Stealth ⚔️',
    subtitle: 'Pure tactical carbon · Monochrome Silver & Black',
    icon: 'Shield',
    accentHex: '#e2e8f0',
    secondaryHex: '#94a3b8',
    bgRoot: '#020203',
    cardBg: '#0a0a0c',
    borderHex: 'rgba(226, 232, 240, 0.18)',
    snowColor: 'rgba(241, 245, 249, 0.65)',
    snowGlow: 'rgba(203, 213, 225, 0.35)',
    previewColors: ['#020203', '#0a0a0c', '#e2e8f0', '#64748b']
  },
  blood_frost: {
    id: 'blood_frost',
    name: 'Blood Frost 🩸',
    subtitle: 'Savage intensity · Obsidian Crimson & Ruby',
    icon: 'Flame',
    accentHex: '#f43f5e',
    secondaryHex: '#be123c',
    bgRoot: '#080305',
    cardBg: '#13070b',
    borderHex: 'rgba(244, 63, 94, 0.22)',
    snowColor: 'rgba(254, 205, 211, 0.7)',
    snowGlow: 'rgba(251, 113, 133, 0.4)',
    previewColors: ['#080305', '#13070b', '#f43f5e', '#fecdd3']
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Blizzard ⚡',
    subtitle: 'High voltage focus · Neon Indigo & Electric Violet',
    icon: 'Zap',
    accentHex: '#818cf8',
    secondaryHex: '#6366f1',
    bgRoot: '#050614',
    cardBg: '#0a0c20',
    borderHex: 'rgba(129, 140, 248, 0.25)',
    snowColor: 'rgba(224, 231, 255, 0.75)',
    snowGlow: 'rgba(165, 180, 252, 0.45)',
    previewColors: ['#050614', '#0a0c20', '#818cf8', '#c7d2fe']
  },
  solaris: {
    id: 'solaris',
    name: 'Solaris Eclipse 🌑',
    subtitle: 'Golden cold horizon · Dark Charcoal & Amber Bronze',
    icon: 'Sun',
    accentHex: '#f59e0b',
    secondaryHex: '#d97706',
    bgRoot: '#070603',
    cardBg: '#130f06',
    borderHex: 'rgba(245, 158, 11, 0.22)',
    snowColor: 'rgba(254, 243, 199, 0.7)',
    snowGlow: 'rgba(252, 211, 77, 0.4)',
    previewColors: ['#070603', '#130f06', '#f59e0b', '#fde68a']
  }
};

export const THEME_LIST = Object.values(THEMES);

export function applyThemeToDocument(theme: AppTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const config = THEMES[theme] || THEMES.glacial;

  root.setAttribute('data-theme', theme);
  root.style.setProperty('--theme-accent', config.accentHex);
  root.style.setProperty('--theme-secondary', config.secondaryHex);
  root.style.setProperty('--theme-bg-root', config.bgRoot);
  root.style.setProperty('--theme-card-bg', config.cardBg);
  root.style.setProperty('--theme-border', config.borderHex);
}
