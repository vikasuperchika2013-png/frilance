import { ThemeName } from '../types';

export interface ThemeConfig {
  id: ThemeName;
  name: string;
  description: string;
  previewGradient: string;
  bgClass: string;
  cardClass: string;
  cardBorderClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
  accentClass: string;
  sidebarClass: string;
  badgeClass: string;
  hasBackgroundOverlay?: boolean;
}

export const THEMES: Record<ThemeName, ThemeConfig> = {
  nature: {
    id: 'nature',
    name: '🌲 Природная',
    description: 'Горный пейзаж, стеклянный морфизм, эффект размытия и чистый воздух',
    previewGradient: 'from-emerald-900 via-teal-900 to-slate-900',
    bgClass: 'bg-nature-mountains bg-cover bg-fixed bg-center text-slate-100',
    cardClass: 'bg-slate-950/65 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-emerald-500/30 transition-all duration-300',
    cardBorderClass: 'border-white/10',
    textPrimaryClass: 'text-white',
    textSecondaryClass: 'text-emerald-100/70',
    accentClass: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25',
    sidebarClass: 'bg-slate-950/75 backdrop-blur-2xl border-r border-white/10 text-white',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    hasBackgroundOverlay: true,
  },
  dark: {
    id: 'dark',
    name: '🌙 Тёмная',
    description: 'Глубокий графитовый фон, стильные тёмные карточки и мягкие тени',
    previewGradient: 'from-slate-950 via-slate-900 to-zinc-900',
    bgClass: 'bg-slate-950 text-slate-100',
    cardClass: 'bg-slate-900/90 border border-slate-800 shadow-xl hover:border-slate-700 transition-all duration-300',
    cardBorderClass: 'border-slate-800',
    textPrimaryClass: 'text-slate-100',
    textSecondaryClass: 'text-slate-400',
    accentClass: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20',
    sidebarClass: 'bg-slate-900/95 border-r border-slate-800 text-slate-100',
    badgeClass: 'bg-slate-800 text-slate-300 border border-slate-700',
  },
  light: {
    id: 'light',
    name: '☀️ Белоснежная (Светлая)',
    description: 'Абсолютно чистый белый дизайн, высокая контрастность и кристальная чёткость',
    previewGradient: 'from-white via-slate-50 to-gray-100',
    bgClass: 'bg-white text-slate-900',
    cardClass: 'bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300',
    cardBorderClass: 'border-slate-200',
    textPrimaryClass: 'text-slate-900',
    textSecondaryClass: 'text-slate-500',
    accentClass: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
    sidebarClass: 'bg-white border-r border-slate-200 text-slate-900',
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
  },
  muted: {
    id: 'muted',
    name: '🌫️ Тусклая',
    description: 'Спокойные серо-голубые, бежевые и мягкие приглушённые тона',
    previewGradient: 'from-slate-800 via-stone-800 to-neutral-900',
    bgClass: 'bg-[#181d24] text-slate-200',
    cardClass: 'bg-[#222831]/80 border border-slate-700/60 shadow-lg hover:border-slate-600 transition-all duration-300',
    cardBorderClass: 'border-slate-700/60',
    textPrimaryClass: 'text-[#e5e9f0]',
    textSecondaryClass: 'text-[#9ca3af]',
    accentClass: 'bg-[#5e81ac] hover:bg-[#81a1c1] text-white shadow-blue-900/20',
    sidebarClass: 'bg-[#1c222b]/95 border-r border-slate-700/60 text-[#e5e9f0]',
    badgeClass: 'bg-[#2e3440] text-[#d8dee9] border border-slate-700',
  },
  vibrant: {
    id: 'vibrant',
    name: '⚡ Яркая',
    description: 'Современные неоновые градиенты, выразительные акценты и драйв',
    previewGradient: 'from-indigo-900 via-purple-900 to-pink-900',
    bgClass: 'bg-[#0b0c16] text-white',
    cardClass: 'bg-indigo-950/40 backdrop-blur-lg border border-purple-500/20 shadow-2xl hover:border-purple-500/50 hover:shadow-purple-500/10 transition-all duration-300',
    cardBorderClass: 'border-purple-500/20',
    textPrimaryClass: 'text-white',
    textSecondaryClass: 'text-purple-200/70',
    accentClass: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-pink-500/25',
    sidebarClass: 'bg-indigo-950/80 backdrop-blur-xl border-r border-purple-500/20 text-white',
    badgeClass: 'bg-purple-500/20 text-purple-200 border border-purple-500/30',
  },
  colorful: {
    id: 'colorful',
    name: '🎨 Разноцветная',
    description: 'Индивидуальные сочные цветовые акценты для каждого финансового модуля',
    previewGradient: 'from-blue-900 via-emerald-900 to-amber-900',
    bgClass: 'bg-[#0f172a] text-slate-100',
    cardClass: 'bg-slate-900/90 border border-slate-800 shadow-xl hover:border-cyan-500/30 transition-all duration-300',
    cardBorderClass: 'border-slate-800',
    textPrimaryClass: 'text-slate-100',
    textSecondaryClass: 'text-slate-400',
    accentClass: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/25',
    sidebarClass: 'bg-slate-900 border-r border-slate-800 text-slate-100',
    badgeClass: 'bg-cyan-950/80 text-cyan-300 border border-cyan-800',
  },
};

export const getThemeColors = (themeName: ThemeName) => {
  const theme = THEMES[themeName] || THEMES.nature;
  return {
    accent: theme.accentClass,
    card: theme.cardClass,
    badge: theme.badgeClass,
    sidebar: theme.sidebarClass,
  };
};

export default THEMES;
