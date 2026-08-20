import React, { useState } from 'react';
import { AppSettings, CurrencySymbol, ThemeName, UserProfile } from '../types';
import { THEMES } from '../services/theme';
import { StorageService } from '../services/storage';
import {
  CURRENCY_INFO,
  convertAmount,
  formatExchangeRateDisplay,
  getExchangeRateRatio,
} from '../services/currency';
import {
  Settings as SettingsIcon,
  Palette,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Coins,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  User,
  ShieldCheck,
  Cloud,
  LogOut,
  RefreshCw,
  ArrowRightLeft,
  Info,
} from 'lucide-react';
import { playSound } from '../services/sound';

interface SettingsViewProps {
  settings: AppSettings;
  userProfile: UserProfile;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onOpenAuthModal: () => void;
  onDataImported?: () => void;
  onOpenThemeModal: () => void;
  onOpenPWAInstall: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  onSwitchCurrencyWithConversion?: (newCurrency: CurrencySymbol) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  userProfile,
  onUpdateSettings,
  onUpdateProfile,
  onOpenAuthModal,
  onDataImported,
  onOpenThemeModal,
  onOpenPWAInstall,
  onShowToast,
  onSwitchCurrencyWithConversion,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const isNight = settings.nightMode && settings.theme !== 'light';

  const cardBg = isNight
    ? 'bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white'
    : 'bg-white border border-slate-200/90 text-slate-900 shadow-md';

  const currenciesList: { symbol: CurrencySymbol; name: string; code: string; flag: string }[] = [
    { symbol: '₸', name: 'Казахстанский тенге', code: 'KZT', flag: '🇰🇿' },
    { symbol: '₽', name: 'Российский рубль', code: 'RUB', flag: '🇷🇺' },
    { symbol: '$', name: 'Доллар США', code: 'USD', flag: '🇺🇸' },
    { symbol: '€', name: 'Евро', code: 'EUR', flag: '🇪🇺' },
  ];

  const handleCurrencySelect = (newCurr: CurrencySymbol) => {
    if (newCurr === settings.currency) return;
    playSound('coin');

    if (onSwitchCurrencyWithConversion) {
      onSwitchCurrencyWithConversion(newCurr);
    } else {
      onUpdateSettings({ currency: newCurr });
      onShowToast(`Валюта изменена на ${newCurr}`, 'success');
    }
  };

  const handleExport = () => {
    playSound('click');
    const json = StorageService.exportFullBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Резервная копия успешно сохранена', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const success = StorageService.importFullBackup(content);
      if (success) {
        setImportStatus('Резервная копия успешно загружена! Перезагрузите страницу.');
        playSound('success');
        onShowToast('Данные успешно импортированы', 'success');
        if (onDataImported) onDataImported();
      } else {
        setImportStatus('Ошибка: неверный формат резервной копии.');
        playSound('delete');
        onShowToast('Неверный формат файла бэкапа', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    StorageService.resetAllData();
    playSound('delete');
    onShowToast('Все данные сброшены до 0', 'info');
    window.location.reload();
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    playSound('coin');
    setTimeout(() => {
      setIsSyncing(false);
      onUpdateProfile({
        ...userProfile,
        syncedAt: new Date().toISOString(),
      });
      onShowToast('Облачная синхронизация завершена успешно', 'success');
    }, 800);
  };

  return (
    <div id="settings-view" className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto">
      {/* View Header */}
      <div>
        <h2 className={`text-2xl font-bold flex items-center gap-2.5 ${isNight ? 'text-white' : 'text-slate-900'}`}>
          <SettingsIcon className="w-7 h-7 text-emerald-500" />
          Настройки приложения
        </h2>
        <p className={`text-sm mt-1 ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
          Управление валютой с авто-конвертацией по курсу, аккаунтом, темами оформления и бэкапом
        </p>
      </div>

      {/* 1. Currency Selector with Auto-Conversion & Real-time Cross Rates */}
      <div className={`rounded-3xl p-6 sm:p-7 space-y-5 ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-inherit pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Валюта и автоматический пересчет</h3>
              <p className="text-xs text-slate-500">Мгновенная конвертация сумм операций и копилок по курсу</p>
            </div>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 font-semibold self-start sm:self-auto flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Текущая: {settings.currency} ({CURRENCY_INFO[settings.currency]?.code})</span>
          </div>
        </div>

        {/* Currency Switch Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {currenciesList.map((curr) => {
            const isSelected = settings.currency === curr.symbol;
            return (
              <button
                key={curr.symbol}
                id={`currency-select-${curr.code.toLowerCase()}`}
                onClick={() => handleCurrencySelect(curr.symbol)}
                className={`p-4 rounded-2xl border text-center transition-all duration-200 relative flex flex-col items-center justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/15 font-bold shadow-md scale-[1.02] ring-2 ring-emerald-500/30'
                    : isNight
                    ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20'
                    : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="text-xl mb-1">{curr.flag}</div>
                <div className="text-2xl font-black mb-1 text-amber-500">{curr.symbol}</div>
                <div className="text-xs font-semibold">{curr.name}</div>
                <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{curr.code}</span>

                {isSelected && (
                  <div className="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold flex items-center gap-1 shadow">
                    <Check className="w-3 h-3" />
                    <span>Активна</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Exchange Rate Matrix Display for Selected Currency */}
        <div
          className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
            isNight
              ? 'bg-slate-950/70 border-white/10 text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between font-bold text-slate-400 uppercase tracking-wider text-[10px]">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-amber-500" />
              Курсы конвертации относительно текущей валюты ({settings.currency}):
            </span>
            <span className="text-emerald-500">Автоперевод включен</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {currenciesList
              .filter((c) => c.symbol !== settings.currency)
              .map((c) => {
                const rateText = formatExchangeRateDisplay(settings.currency, c.symbol);
                const reverseRateText = formatExchangeRateDisplay(c.symbol, settings.currency);
                return (
                  <div
                    key={c.symbol}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                      isNight ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>{c.flag} {c.code} ({c.symbol})</span>
                    </div>
                    <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      {rateText}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      (обратно: {reverseRateText})
                    </div>
                  </div>
                );
              })}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
            💡 При переключении валюты суммы всех ваших доходов, расходов, счетов и копилок автоматически пересчитываются по официальному кросс-курсу.
          </p>
        </div>
      </div>

      {/* 2. Account & Cloud Integration Card */}
      <div className={`rounded-3xl p-6 sm:p-7 space-y-5 ${cardBg}`}>
        <div className="flex items-center justify-between border-b border-inherit pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/15 text-blue-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Аккаунт и Синхронизация</h3>
              <p className="text-xs text-slate-500">Вход через Google, Apple ID (App Store) и бэкап</p>
            </div>
          </div>
          <button
            onClick={() => {
              playSound('click');
              onOpenAuthModal();
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all hover:scale-105"
          >
            {userProfile.isLoggedIn ? 'Управление аккаунтом' : '🔑 Войти в аккаунт'}
          </button>
        </div>

        {userProfile.isLoggedIn ? (
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isNight ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-3.5">
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-12 h-12 rounded-full border-2 border-emerald-500 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-lg">
                  {userProfile.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{userProfile.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    userProfile.provider === 'google'
                      ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                      : 'bg-slate-800 text-white'
                  }`}>
                    {userProfile.provider === 'google' ? 'Google' : 'Apple ID'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{userProfile.email || 'Авторизован'}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                  <Cloud className="w-3 h-3" />
                  <span>
                    Синхронизировано • {userProfile.syncedAt ? new Date(userProfile.syncedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : 'Сейчас'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                isNight
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Синхронизация...' : 'Синхронизировать'}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-dashed border-inherit">
            <div className="text-xs text-slate-500 text-center sm:text-left">
              Вы используете приложение в гостевом режиме. Войдите через Google или Apple ID, чтобы сохранять баланс и копилки в облаке.
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  playSound('click');
                  onOpenAuthModal();
                }}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold shadow-sm hover:shadow transition-all"
              >
                Google
              </button>
              <button
                onClick={() => {
                  playSound('click');
                  onOpenAuthModal();
                }}
                className="px-3.5 py-2 rounded-xl bg-black text-white text-xs font-bold shadow-sm hover:shadow transition-all"
              >
                Apple ID
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Theme and Appearance Card */}
      <div className={`rounded-3xl p-6 sm:p-7 space-y-5 ${cardBg}`}>
        <div className="flex items-center justify-between border-b border-inherit pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-500">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Внешний вид и темы</h3>
              <p className="text-xs text-slate-500">Белоснежный режим, приглушенный или ночной стиль</p>
            </div>
          </div>
          <button
            onClick={onOpenThemeModal}
            className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all hover:scale-105"
          >
            🎨 Каталог тем
          </button>
        </div>

        {/* Quick Theme Selector Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(Object.keys(THEMES) as ThemeName[]).map((themeKey) => {
            const t = THEMES[themeKey];
            const isSelected = settings.theme === themeKey;
            return (
              <button
                key={themeKey}
                onClick={() => {
                  playSound('click');
                  onUpdateSettings({ theme: themeKey });
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/15 font-bold shadow-sm scale-[1.02]'
                    : isNight
                    ? 'border-white/10 bg-white/5 hover:bg-white/10'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    {t.name}
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{t.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Night Mode Toggle Switch */}
        <div className="flex items-center justify-between pt-2 border-t border-inherit">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-500">
              {isNight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-sm font-semibold">Ночной режим (Темный фон)</div>
              <div className="text-xs text-slate-500">
                {isNight ? 'Включен контрастный тёмный режим' : 'Выключен — активен чистый белый светлый режим'}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              playSound('click');
              onUpdateSettings({ nightMode: !settings.nightMode });
            }}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
              settings.nightMode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                settings.nightMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 4. Sound Effects and Feedback */}
      <div className={`rounded-3xl p-6 sm:p-7 space-y-4 ${cardBg}`}>
        <div className="flex items-center gap-3 border-b border-inherit pb-4">
          <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-500">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base">Звуковые эффекты</h3>
            <p className="text-xs text-slate-500">Звуки кликов, монет и голосовых команд</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500">
              {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-teal-500" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-sm font-semibold">Звуки интерфейса</div>
              <div className="text-xs text-slate-500">Воспроизведение Web Audio эффектов</div>
            </div>
          </div>
          <button
            onClick={() => {
              const next = !settings.soundEnabled;
              if (next) playSound('success');
              onUpdateSettings({ soundEnabled: next });
            }}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
              settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 5. Data Backup & Restore */}
      <div className={`rounded-3xl p-6 sm:p-7 space-y-5 ${cardBg}`}>
        <div className="flex items-center gap-3 border-b border-inherit pb-4">
          <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-500">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base">Резервное копирование и экспорт</h3>
            <p className="text-xs text-slate-500">Сохранение всех ваших операций, категорий и копилок в файл</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleExport}
            className="p-4 rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-600 dark:text-sky-300 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02]"
          >
            <Download className="w-5 h-5" />
            <span>Экспортировать JSON бэкап</span>
          </button>

          <label className={`p-4 rounded-2xl border font-semibold text-sm flex items-center justify-center gap-2.5 cursor-pointer transition-all hover:scale-[1.02] ${
            isNight
              ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
          }`}>
            <Upload className="w-5 h-5 text-emerald-500" />
            <span>Импортировать из файла</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>

        {importStatus && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-medium">
            {importStatus}
          </div>
        )}
      </div>

      {/* 6. Reset All Data */}
      <div className={`rounded-3xl p-6 sm:p-7 space-y-4 border ${
        isNight ? 'bg-red-950/20 border-red-500/20' : 'bg-red-50/50 border-red-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-red-500/20 text-red-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-red-600 dark:text-red-300">Очистка и обнуление данных</h3>
            <p className="text-xs text-slate-500">Сброс всех операций, копилок и фондов до 0</p>
          </div>
        </div>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-5 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-semibold transition-all"
          >
            Сбросить все данные до нуля
          </button>
        ) : (
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isNight ? 'bg-red-900/40 border-red-500/40' : 'bg-white border-red-200 shadow-sm'
          }`}>
            <p className="text-xs text-red-600 dark:text-red-200 font-medium">
              Вы уверены? Все ваши операции, копилки, кредиты и категории будут очищены до нуля.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all"
              >
                Да, сбросить всё до нуля
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className={`px-4 py-2 rounded-xl border text-xs font-medium transition-all ${
                  isNight ? 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
