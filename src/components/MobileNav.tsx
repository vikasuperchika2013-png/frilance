import React, { useState } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  PiggyBank,
  MoreHorizontal,
  FolderTree,
  ShieldCheck,
  CreditCard,
  Mic,
  Palette,
  Moon,
  Sun,
  Download,
  Settings,
  X,
  User,
  Shield,
  Cloud,
} from 'lucide-react';
import { ActivePage, AppSettings, UserProfile } from '../types';
import { playSound } from '../services/sound';

interface MobileNavProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  settings: AppSettings;
  userProfile: UserProfile;
  onToggleNightMode: () => void;
  onOpenVoiceModal: () => void;
  onOpenThemeModal: () => void;
  onOpenPWAInstall: () => void;
  onOpenAuthModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activePage,
  onNavigate,
  settings,
  userProfile,
  onToggleNightMode,
  onOpenVoiceModal,
  onOpenThemeModal,
  onOpenPWAInstall,
  onOpenAuthModal,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isNight = settings.nightMode && settings.theme !== 'light';

  const mainTabs: { id: ActivePage; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Главная', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'transactions', label: 'Операции', icon: <ArrowLeftRight className="w-5 h-5" /> },
    { id: 'statistics', label: 'Статистика', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'goals', label: 'Копилки', icon: <PiggyBank className="w-5 h-5" /> },
  ];

  const handleTabClick = (page: ActivePage) => {
    playSound('click');
    onNavigate(page);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Bottom Sticky Tab Bar */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t px-2 py-1.5 flex items-center justify-around transition-all ${
          isNight
            ? 'bg-slate-950/95 border-white/10 text-white'
            : 'bg-white/95 border-slate-200 text-slate-800 shadow-lg'
        }`}
      >
        {mainTabs.map((tab) => {
          const isActive = activePage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-500/15' : ''}`}>
                {tab.icon}
              </div>
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        {/* Center Voice Floating Quick Button */}
        <button
          id="mobile-quick-voice-btn"
          onClick={() => {
            playSound('voice');
            onOpenVoiceModal();
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30 -translate-y-2 active:scale-95 transition-transform"
        >
          <Mic className="w-5 h-5 animate-pulse" />
        </button>

        {/* Menu More Button */}
        <button
          id="mobile-drawer-toggle"
          onClick={() => {
            playSound('click');
            setDrawerOpen(!drawerOpen);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all ${
            drawerOpen
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="p-1 rounded-lg">
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">Ещё</span>
        </button>
      </div>

      {/* Slide-up Drawer for Extra Sections & Tools */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-fade-in">
          <div
            className={`border-t rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl ${
              isNight
                ? 'bg-slate-900 border-white/10 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <span className="font-bold text-base">Меню приложения</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account Card in Drawer */}
            <button
              onClick={() => {
                setDrawerOpen(false);
                onOpenAuthModal();
              }}
              className={`w-full p-3.5 rounded-2xl border flex items-center gap-3 text-left transition-all ${
                userProfile.isLoggedIn
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : isNight
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-10 h-10 rounded-full border border-emerald-500"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                  {userProfile.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm truncate">{userProfile.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                    {userProfile.provider}
                  </span>
                </div>
                <span className="text-xs text-slate-500 block truncate">
                  {userProfile.isLoggedIn ? (userProfile.email || 'Синхронизировано') : 'Нажмите для входа Google / Apple'}
                </span>
              </div>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleTabClick('emergency')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  activePage === 'emergency'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 font-semibold'
                    : isNight
                    ? 'bg-white/5 border-white/10 text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-xs font-semibold">На чёрный день</span>
              </button>

              <button
                onClick={() => handleTabClick('loans')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  activePage === 'loans'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 font-semibold'
                    : isNight
                    ? 'bg-white/5 border-white/10 text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <CreditCard className="w-5 h-5 text-cyan-500 shrink-0" />
                <span className="text-xs font-semibold">Кредиты</span>
              </button>

              <button
                onClick={() => handleTabClick('categories')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  activePage === 'categories'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 font-semibold'
                    : isNight
                    ? 'bg-white/5 border-white/10 text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <FolderTree className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-xs font-semibold">Категории</span>
              </button>

              <button
                onClick={() => handleTabClick('settings')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  activePage === 'settings'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 font-semibold'
                    : isNight
                    ? 'bg-white/5 border-white/10 text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <Settings className="w-5 h-5 text-purple-500 shrink-0" />
                <span className="text-xs font-semibold">Настройки</span>
              </button>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  onOpenThemeModal();
                }}
                className={`w-full py-3 px-4 rounded-xl border text-sm font-medium flex items-center gap-3 ${
                  isNight ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <Palette className="w-5 h-5 text-purple-500" />
                <span>🎨 Сменить тему оформления</span>
              </button>

              <button
                onClick={() => {
                  onToggleNightMode();
                }}
                className={`w-full py-3 px-4 rounded-xl border text-sm font-medium flex items-center justify-between ${
                  isNight ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isNight ? (
                    <Moon className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-500" />
                  )}
                  <span>{isNight ? '🌙 Ночной режим' : '☀️ Белый / Светлый режим'}</span>
                </div>
                <span className="text-xs text-slate-500 font-bold">
                  {isNight ? 'Тёмный' : 'Белый'}
                </span>
              </button>

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  onOpenPWAInstall();
                }}
                className="w-full py-3 px-4 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-600 dark:text-sky-300 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                <span>📲 Установить приложение (PWA)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

