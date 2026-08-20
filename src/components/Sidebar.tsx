import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  FolderTree,
  BarChart3,
  PiggyBank,
  ShieldCheck,
  CreditCard,
  Mic,
  Palette,
  Moon,
  Sun,
  Download,
  Settings,
  Coins,
  Sparkles,
  User,
  Shield,
  Cloud,
} from 'lucide-react';
import { ActivePage, AppSettings, UserProfile } from '../types';
import { playSound } from '../services/sound';

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  settings: AppSettings;
  userProfile: UserProfile;
  onToggleNightMode: () => void;
  onOpenVoiceModal: () => void;
  onOpenThemeModal: () => void;
  onOpenPWAInstall: () => void;
  onOpenAuthModal: () => void;
  canInstallPWA: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  settings,
  userProfile,
  onToggleNightMode,
  onOpenVoiceModal,
  onOpenThemeModal,
  onOpenPWAInstall,
  onOpenAuthModal,
  canInstallPWA,
}) => {
  const navItems: { id: ActivePage; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Главная', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'transactions', label: 'Операции', icon: <ArrowLeftRight className="w-5 h-5" /> },
    { id: 'categories', label: 'Категории', icon: <FolderTree className="w-5 h-5" /> },
    { id: 'statistics', label: 'Статистика', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'goals', label: 'Копилки', icon: <PiggyBank className="w-5 h-5" /> },
    { id: 'emergency', label: 'На чёрный день', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'loans', label: 'Кредиты', icon: <CreditCard className="w-5 h-5" /> },
  ];

  const isNight = settings.nightMode && settings.theme !== 'light';

  const handleNavClick = (page: ActivePage) => {
    playSound('click');
    onNavigate(page);
  };

  return (
    <aside
      id="main-sidebar"
      className={`hidden md:flex flex-col w-64 h-screen sticky top-0 shrink-0 select-none transition-colors duration-300 z-30 border-r ${
        isNight
          ? 'bg-slate-950/85 backdrop-blur-2xl border-white/10 text-white'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Brand Header */}
      <div className={`p-5 flex items-center gap-3 border-b ${isNight ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
          <Coins className="w-6 h-6 text-white" />
        </div>
        <div className="overflow-hidden">
          <h1 className={`font-bold text-base leading-tight tracking-tight flex items-center gap-1.5 ${
            isNight ? 'text-white' : 'text-slate-900'
          }`}>
            ФинПомощник
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </h1>
          <p className={`text-xs truncate ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>Личные финансы</p>
        </div>
      </div>

      {/* User Profile Mini Banner */}
      <div className="px-4 pt-3">
        <button
          onClick={() => {
            playSound('click');
            onOpenAuthModal();
          }}
          className={`w-full p-2.5 rounded-2xl border flex items-center gap-2.5 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
            userProfile.isLoggedIn
              ? isNight
                ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                : 'bg-emerald-50/70 border-emerald-200 text-slate-900'
              : isNight
              ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          {userProfile.isLoggedIn ? (
            <>
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-8 h-8 rounded-full object-cover border border-emerald-500 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  {userProfile.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold truncate">{userProfile.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    userProfile.provider === 'google' ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-700 text-white'
                  }`}>
                    {userProfile.provider === 'google' ? 'G' : 'Apple'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1">
                  <Cloud className="w-3 h-3" /> Облако активно
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold block">Вход в аккаунт</span>
                <span className="text-[10px] text-slate-500 block truncate">Google / App Store</span>
              </div>
            </>
          )}
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 custom-scrollbar">
        <div className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
          isNight ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Разделы
        </div>

        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 font-semibold'
                  : isNight
                  ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}

        <div className="pt-3 pb-1 px-3">
          <div className={`h-px w-full mb-2.5 ${isNight ? 'bg-white/10' : 'bg-slate-200'}`} />
          <div className={`text-[11px] font-bold uppercase tracking-wider ${
            isNight ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Инструменты
          </div>
        </div>

        {/* Voice Input Action */}
        <button
          id="sidebar-voice-btn"
          onClick={() => {
            playSound('voice');
            onOpenVoiceModal();
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
            isNight
              ? 'text-emerald-400 hover:bg-emerald-500/15 border-emerald-500/20'
              : 'text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 border-emerald-200'
          }`}
        >
          <Mic className="w-5 h-5 animate-pulse text-emerald-500 shrink-0" />
          <span className="font-semibold">🎙️ Голосовой ввод</span>
        </button>

        {/* Design Themes */}
        <button
          id="sidebar-design-btn"
          onClick={() => {
            playSound('click');
            onOpenThemeModal();
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            isNight
              ? 'text-slate-300 hover:bg-white/10 hover:text-white'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Palette className="w-5 h-5 text-purple-500 shrink-0" />
          <span>🎨 Дизайн</span>
        </button>

        {/* Night mode toggle */}
        <button
          id="sidebar-nightmode-btn"
          onClick={() => {
            playSound('click');
            onToggleNightMode();
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            isNight
              ? 'text-slate-300 hover:bg-white/10 hover:text-white'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            {isNight ? (
              <Moon className="w-5 h-5 text-indigo-400 shrink-0" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500 shrink-0" />
            )}
            <span>{isNight ? '🌙 Ночной режим' : '☀️ Светлый режим'}</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isNight ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700'
          }`}>
            {isNight ? 'Тёмный' : 'Белый'}
          </span>
        </button>

        {/* PWA install prompt button */}
        <button
          id="sidebar-pwa-install-btn"
          onClick={() => {
            playSound('click');
            onOpenPWAInstall();
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
            isNight
              ? 'text-sky-400 hover:bg-sky-500/15 border-sky-500/20'
              : 'text-sky-700 bg-sky-50/50 hover:bg-sky-100 border-sky-200'
          }`}
        >
          <Download className="w-5 h-5 shrink-0" />
          <span>📲 Установить PWA</span>
        </button>

        {/* Settings */}
        <button
          id="sidebar-settings-btn"
          onClick={() => handleNavClick('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            activePage === 'settings'
              ? 'bg-emerald-500 text-white font-semibold shadow-md'
              : isNight
              ? 'text-slate-300 hover:bg-white/10 hover:text-white'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Settings className="w-5 h-5 text-slate-400 shrink-0" />
          <span>⚙️ Настройки</span>
        </button>
      </div>

      {/* Footer Currency info */}
      <div className={`p-4 border-t text-xs flex items-center justify-between ${
        isNight
          ? 'border-white/10 bg-black/20 text-slate-400'
          : 'border-slate-200 bg-slate-50 text-slate-600'
      }`}>
        <div>
          <span className="font-semibold">Валюта:</span> {settings.currency}
        </div>
        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/20 font-medium">
          Cloud & PWA Ready
        </div>
      </div>
    </aside>
  );
};
