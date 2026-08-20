import React from 'react';
import { ActivePage, AppSettings, UserProfile } from '../types';
import { Plus, Mic, Palette, Download, Sparkles, Moon, Sun, User, LogIn, Cloud } from 'lucide-react';
import { playSound } from '../services/sound';

interface HeaderProps {
  activePage: ActivePage;
  settings: AppSettings;
  userProfile: UserProfile;
  onOpenAddTransaction: () => void;
  onOpenVoiceModal: () => void;
  onOpenThemeModal: () => void;
  onToggleNightMode: () => void;
  onOpenPWAInstall: () => void;
  onOpenAuthModal: () => void;
}

const PAGE_TITLES: Record<ActivePage, { title: string; subtitle: string; icon: string }> = {
  dashboard: { title: 'Главная панель', subtitle: 'Обзор личных финансов и баланса', icon: '💰' },
  transactions: { title: 'История операций', subtitle: 'Управление доходами и расходами', icon: '💸' },
  categories: { title: 'Категории', subtitle: 'Структура расходов и доходов', icon: '📂' },
  statistics: { title: 'Финансовая аналитика', subtitle: 'Наглядные графики и отчеты', icon: '📊' },
  goals: { title: 'Мои копилки', subtitle: 'Накопления и финансовые цели', icon: '🐷' },
  emergency: { title: 'На чёрный день', subtitle: 'Резервный фонд и финансовая подушка', icon: '🛡️' },
  loans: { title: 'Мои кредиты', subtitle: 'Учет долгов, расчеты и платежи', icon: '💳' },
  settings: { title: 'Настройки', subtitle: 'Валюта, темы, аккаунт и PWA', icon: '⚙️' },
};

export const Header: React.FC<HeaderProps> = ({
  activePage,
  settings,
  userProfile,
  onOpenAddTransaction,
  onOpenVoiceModal,
  onOpenThemeModal,
  onToggleNightMode,
  onOpenPWAInstall,
  onOpenAuthModal,
}) => {
  const pageInfo = PAGE_TITLES[activePage] || {
    title: 'Финансовый помощник',
    subtitle: 'Управление бюджетом',
    icon: '💰',
  };

  const isNight = settings.nightMode && settings.theme !== 'light';

  return (
    <header
      className={`sticky top-0 z-20 w-full px-4 sm:px-8 py-3.5 backdrop-blur-md flex items-center justify-between transition-all border-b ${
        isNight
          ? 'bg-slate-950/80 border-white/10 text-white'
          : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-sm'
      }`}
    >
      {/* Title & Section */}
      <div className="flex items-center gap-3">
        <span className="text-2xl sm:text-3xl select-none" role="img" aria-label="Icon">
          {pageInfo.icon}
        </span>
        <div>
          <h2 className={`text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2 ${
            isNight ? 'text-white' : 'text-slate-900'
          }`}>
            {pageInfo.title}
          </h2>
          <p className={`text-xs hidden sm:block ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* User Account / Google / Apple ID trigger button */}
        <button
          id="header-user-profile-btn"
          onClick={() => {
            playSound('click');
            onOpenAuthModal();
          }}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:scale-105 active:scale-95 ${
            userProfile.isLoggedIn
              ? isNight
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isNight
              ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
          title="Личный кабинет Google / Apple ID"
        >
          {userProfile.isLoggedIn ? (
            <>
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {userProfile.name.charAt(0)}
                </div>
              )}
              <span className="max-w-[80px] sm:max-w-[120px] truncate hidden xs:inline">
                {userProfile.name}
              </span>
            </>
          ) : (
            <>
              <User className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Войти</span>
            </>
          )}
        </button>

        {/* Voice button */}
        <button
          id="header-voice-btn"
          onClick={() => {
            playSound('voice');
            onOpenVoiceModal();
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm ${
            isNight
              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
          }`}
          title="Голосовой ввод (Web Speech API)"
        >
          <Mic className="w-4 h-4 animate-pulse text-emerald-500" />
          <span className="hidden sm:inline">Голос</span>
        </button>

        {/* Quick Add Transaction Button */}
        <button
          id="header-add-transaction-btn"
          onClick={() => {
            playSound('click');
            onOpenAddTransaction();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Операция</span>
        </button>

        {/* Quick Theme Trigger */}
        <button
          id="header-theme-btn"
          onClick={() => {
            playSound('click');
            onOpenThemeModal();
          }}
          className={`p-2 rounded-xl border transition-all ${
            isNight
              ? 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border-white/10'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
          }`}
          title="Сменить дизайн"
        >
          <Palette className="w-4 h-4 text-purple-500" />
        </button>

        {/* Quick Night Mode Toggle */}
        <button
          id="header-night-mode-btn"
          onClick={() => {
            playSound('click');
            onToggleNightMode();
          }}
          className={`p-2 rounded-xl border transition-all hidden sm:flex ${
            isNight
              ? 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border-white/10'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
          }`}
          title="Переключить тему (День / Ночь)"
        >
          {isNight ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </button>
      </div>
    </header>
  );
};

