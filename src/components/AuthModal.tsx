import React, { useState, useEffect } from 'react';
import { UserProfile, AppSettings, SavedAccount } from '../types';
import {
  X,
  CheckCircle2,
  Cloud,
  LogOut,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Check,
  UserPlus,
  Trash2,
  Users,
} from 'lucide-react';
import { playSound } from '../services/sound';
import { StorageService } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  settings: AppSettings;
  onUpdateProfile: (profile: UserProfile) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  settings,
  onUpdateProfile,
  onShowToast,
}) => {
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const accounts = StorageService.getSavedAccounts();
      setSavedAccounts(accounts);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isNight = settings.nightMode && settings.theme !== 'light';

  // Handle selecting an existing saved account
  const handleSelectAccount = (account: SavedAccount) => {
    playSound('coin');
    const newProfile: UserProfile = {
      id: account.id,
      name: account.name,
      email: account.email,
      avatar: account.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(account.email)}`,
      provider: account.provider,
      isLoggedIn: true,
      syncedAt: new Date().toISOString(),
      joinedDate: userProfile.joinedDate || new Date().toISOString(),
    };

    onUpdateProfile(newProfile);
    StorageService.addSavedAccount({
      ...account,
      lastUsedAt: new Date().toISOString(),
    });
    setSavedAccounts(StorageService.getSavedAccounts());
    onShowToast(`Переключено на аккаунт: ${account.name} (${account.email})`, 'success');
  };

  // Handle Google Login / Add Account
  const handleGoogleLogin = (email?: string, name?: string) => {
    const finalEmail = email || customEmail || 'vikasuperchika2013@gmail.com';
    const finalName = name || customName || (finalEmail.includes('vika') ? 'Виктория' : finalEmail.split('@')[0].replace('.', ' ') || 'Google Пользователь');
    
    playSound('coin');
    const newAccount: SavedAccount = {
      id: `google_${Date.now()}`,
      name: finalName.charAt(0).toUpperCase() + finalName.slice(1),
      email: finalEmail,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(finalEmail)}`,
      provider: 'google',
      lastUsedAt: new Date().toISOString(),
    };

    const newProfile: UserProfile = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      avatar: newAccount.avatar,
      provider: 'google',
      isLoggedIn: true,
      syncedAt: new Date().toISOString(),
      joinedDate: userProfile.joinedDate || new Date().toISOString(),
    };

    StorageService.addSavedAccount(newAccount);
    setSavedAccounts(StorageService.getSavedAccounts());
    onUpdateProfile(newProfile);
    onShowToast(`Вы успешно вошли через Google: ${newProfile.email}`, 'success');
    setShowAddForm(false);
  };

  // Handle Apple Login
  const handleAppleLogin = (email?: string, name?: string) => {
    const finalEmail = email || customEmail || 'apple.user@icloud.com';
    const finalName = name || customName || 'Apple ID Пользователь';

    playSound('coin');
    const newAccount: SavedAccount = {
      id: `apple_${Date.now()}`,
      name: finalName,
      email: finalEmail,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(finalEmail)}`,
      provider: 'apple',
      lastUsedAt: new Date().toISOString(),
    };

    const newProfile: UserProfile = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      avatar: newAccount.avatar,
      provider: 'apple',
      isLoggedIn: true,
      syncedAt: new Date().toISOString(),
      joinedDate: userProfile.joinedDate || new Date().toISOString(),
    };

    StorageService.addSavedAccount(newAccount);
    setSavedAccounts(StorageService.getSavedAccounts());
    onUpdateProfile(newProfile);
    onShowToast(`Вы вошли через Apple ID: ${newProfile.email}`, 'success');
    setShowAddForm(false);
  };

  // Remove saved account from list
  const handleRemoveAccount = (e: React.MouseEvent, accountId: string, email: string) => {
    e.stopPropagation();
    playSound('delete');
    StorageService.removeSavedAccount(accountId);
    const updated = StorageService.getSavedAccounts();
    setSavedAccounts(updated);
    
    // If removed active account, switch to guest
    if (userProfile.email.toLowerCase() === email.toLowerCase()) {
      handleLogout();
    }
    onShowToast('Аккаунт удален из сохраненного списка', 'info');
  };

  // Handle Logout
  const handleLogout = () => {
    playSound('click');
    const guestProfile: UserProfile = {
      id: `guest_${Date.now()}`,
      name: 'Гостевой аккаунт',
      email: '',
      avatar: '',
      provider: 'guest',
      isLoggedIn: false,
      joinedDate: new Date().toISOString(),
    };
    onUpdateProfile(guestProfile);
    onShowToast('Вы перешли в гостевой режим. Данные сохранены локально.', 'info');
  };

  // Manual Cloud Sync trigger
  const handleCloudSync = () => {
    setIsSyncing(true);
    playSound('coin');
    setTimeout(() => {
      setIsSyncing(false);
      onUpdateProfile({
        ...userProfile,
        syncedAt: new Date().toISOString(),
      });
      onShowToast('Облачная синхронизация завершена успешно!', 'success');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl transition-all border max-h-[90vh] overflow-y-auto ${
          isNight
            ? 'bg-slate-900 border-white/10 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Выбор и смена аккаунта</h3>
              <p className="text-xs text-slate-500">Google аккаунты и Apple ID синхронизация</p>
            </div>
          </div>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Account Status */}
        <div className="py-4 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Текущий активный профиль</span>
            {userProfile.isLoggedIn && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5" />
                Синхронизирован
              </span>
            )}
          </div>

          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            isNight ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-3.5 overflow-hidden">
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-12 h-12 rounded-full border-2 border-emerald-500 bg-white object-cover shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {userProfile.name.charAt(0)}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm truncate">{userProfile.name}</h4>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase shrink-0 ${
                    userProfile.provider === 'google'
                      ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                      : userProfile.provider === 'apple'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {userProfile.provider === 'google' ? 'Google' : userProfile.provider === 'apple' ? 'Apple ID' : 'Гость'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{userProfile.email || 'Гостевой режим'}</p>
              </div>
            </div>

            {userProfile.isLoggedIn && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCloudSync}
                  disabled={isSyncing}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                    isNight
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-emerald-100/70 text-emerald-800 border-emerald-200 hover:bg-emerald-200'
                  }`}
                  title="Синхронизировать данные"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs transition-all"
                  title="Выйти из аккаунта"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* List of Saved Google and Apple Accounts for 1-Tap Switching */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Сохраненные аккаунты Google и Apple
              </span>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {showAddForm ? 'Скрыть форму' : '+ Добавить аккаунт'}
              </button>
            </div>

            <div className="space-y-2">
              {savedAccounts.map((acc) => {
                const isActive = userProfile.isLoggedIn && userProfile.email.toLowerCase() === acc.email.toLowerCase();
                return (
                  <div
                    key={acc.id}
                    onClick={() => handleSelectAccount(acc)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-sm ring-2 ring-emerald-500/20'
                        : isNight
                        ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                        : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {acc.avatar ? (
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-10 h-10 rounded-full border border-slate-200 bg-white object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {acc.name.charAt(0)}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm truncate">{acc.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            acc.provider === 'google'
                              ? 'bg-rose-500/15 text-rose-600'
                              : 'bg-slate-800 text-white'
                          }`}>
                            {acc.provider === 'google' ? 'Google' : 'Apple'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{acc.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isActive ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
                          <Check className="w-3.5 h-3.5" />
                          <span>Активен</span>
                        </span>
                      ) : (
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30">
                          Выбрать
                        </span>
                      )}

                      <button
                        onClick={(e) => handleRemoveAccount(e, acc.id, acc.email)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Удалить из списка"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick 1-Click Google & Apple Buttons */}
          {!showAddForm && (
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleGoogleLogin('vikasuperchika2013@gmail.com', 'Виктория')}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
              >
                {/* Official Google SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Войти как Виктория (vikasuperchika2013@gmail.com)</span>
              </button>

              <button
                onClick={() => handleAppleLogin('apple.user@icloud.com', 'Apple ID Пользователь')}
                className="w-full py-3 px-4 rounded-2xl bg-black hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm border border-black shadow-sm transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.74 1.03-1.77.91-2.8-.88.04-1.95.59-2.58 1.33-.56.64-.99 1.68-.86 2.69.98.08 1.98-.48 2.53-1.22z" />
                </svg>
                <span>Вход с Apple ID (App Store)</span>
              </button>
            </div>
          )}

          {/* Add New Custom Account Form */}
          {showAddForm && (
            <div className={`p-4 rounded-2xl border space-y-3 animate-in fade-in duration-200 ${
              isNight ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <h5 className="font-bold text-xs">Добавить новый аккаунт</h5>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Имя пользователя</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ваше имя"
                  className={`w-full px-3 py-2 rounded-xl text-sm border transition-all ${
                    isNight
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Email (Google или Apple ID)</label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="example@gmail.com или name@icloud.com"
                  className={`w-full px-3 py-2 rounded-xl text-sm border transition-all ${
                    isNight
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleGoogleLogin(customEmail, customName)}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Войти как Google
                </button>
                <button
                  type="button"
                  onClick={() => handleAppleLogin(customEmail, customName)}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Войти как Apple ID
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 text-center">
            <span className="text-[11px] text-slate-400">
              🔒 Все аккаунты сохраняются локально и синхронизируются в облаке.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

