import React from 'react';
import { ThemeName, AppSettings, CurrencySymbol } from '../types';
import { THEMES } from '../services/theme';
import { CURRENCY_INFO, formatExchangeRateDisplay } from '../services/currency';
import { X, Check, Moon, Sun, Volume2, VolumeX, Sparkles, Coins, ArrowRightLeft } from 'lucide-react';
import { playSound } from '../services/sound';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onSwitchCurrencyWithConversion?: (newCurrency: CurrencySymbol) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onSwitchCurrencyWithConversion,
}) => {
  if (!isOpen) return null;

  const currencies: { symbol: CurrencySymbol; name: string; flag: string; code: string }[] = [
    { symbol: '₸', name: 'Казахстанский тенге', flag: '🇰🇿', code: 'KZT' },
    { symbol: '₽', name: 'Российский рубль', flag: '🇷🇺', code: 'RUB' },
    { symbol: '$', name: 'Доллар США', flag: '🇺🇸', code: 'USD' },
    { symbol: '€', name: 'Евро', flag: '🇪🇺', code: 'EUR' },
  ];

  const handleCurrencyChange = (currSymbol: CurrencySymbol) => {
    if (currSymbol === settings.currency) return;
    playSound('coin');
    if (onSwitchCurrencyWithConversion) {
      onSwitchCurrencyWithConversion(currSymbol);
    } else {
      onUpdateSettings({ currency: currSymbol });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        id="theme-selector-modal"
        className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">🎨 Персонализация и дизайн</h3>
              <p className="text-xs text-slate-400">Выберите стиль оформления, светлый/темный режим и валюту</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Theme Grid Cards */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            6 визуальных тем оформления
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.keys(THEMES) as ThemeName[]).map((themeKey) => {
              const theme = THEMES[themeKey];
              const isSelected = settings.theme === themeKey;

              return (
                <button
                  key={themeKey}
                  id={`theme-card-${themeKey}`}
                  onClick={() => {
                    playSound('click');
                    onUpdateSettings({ theme: themeKey });
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 relative flex flex-col justify-between overflow-hidden group ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-950/40 scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div
                    className={`h-12 w-full rounded-xl mb-3 bg-gradient-to-r ${theme.previewGradient} flex items-center justify-end px-3 shadow-inner`}
                  >
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                      {theme.name}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {theme.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Night mode & sound preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
          {/* Night mode switch */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.nightMode ? (
                <Moon className="w-5 h-5 text-indigo-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
              <div>
                <div className="font-semibold text-sm">Ночной режим</div>
                <div className="text-xs text-slate-400">Глубокие темные тона</div>
              </div>
            </div>
            <button
              id="theme-night-mode-toggle"
              onClick={() => {
                playSound('click');
                onUpdateSettings({ nightMode: !settings.nightMode });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.nightMode ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.nightMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound switch */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <div className="font-semibold text-sm">Звуковые эффекты</div>
                <div className="text-xs text-slate-400">Монеты, клики, платежи</div>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !settings.soundEnabled;
                onUpdateSettings({ soundEnabled: next });
                if (next) playSound('coin');
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.soundEnabled ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Currency selection with Auto-Conversion */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Основная валюта (Автоконвертация по курсу)</span>
            </label>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <ArrowRightLeft className="w-3 h-3" />
              <span>Кросс-курс активен</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {currencies.map((curr) => {
              const isSelected = settings.currency === curr.symbol;
              const rateDisplay = formatExchangeRateDisplay(settings.currency, curr.symbol);

              return (
                <button
                  key={curr.symbol}
                  onClick={() => handleCurrencyChange(curr.symbol)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{curr.flag}</span>
                    <span className="text-lg font-bold">{curr.symbol}</span>
                  </div>
                  <div className="text-xs font-semibold mt-1 truncate">{curr.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">
                    {curr.symbol === settings.currency ? 'Текущая' : rateDisplay}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Close button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all hover:scale-105 active:scale-95"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
