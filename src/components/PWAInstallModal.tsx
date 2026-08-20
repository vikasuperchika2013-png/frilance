import React from 'react';
import { X, Download, Smartphone, Monitor, CheckCircle, Sparkles } from 'lucide-react';
import { playSound } from '../services/sound';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  canInstallPrompt: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  canInstallPrompt,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        id="pwa-install-modal"
        className="w-full max-w-lg bg-slate-900 border border-sky-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-1.5">
                📲 Установка приложения (PWA)
                <Sparkles className="w-4 h-4 text-sky-400" />
              </h3>
              <p className="text-xs text-slate-400">Быстрый доступ с рабочего стола и офлайн</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Работает без интернета</span>
              <span className="text-slate-400">Все данные и интерфейс сохраняются локально</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Отдельное окно</span>
              <span className="text-slate-400">Запуск без лишних адресных строк браузера</span>
            </div>
          </div>
        </div>

        {/* Install Action or Guide */}
        <div className="space-y-4 pt-1">
          {canInstallPrompt ? (
            <button
              id="pwa-native-install-button"
              onClick={() => {
                playSound('success');
                onInstall();
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Download className="w-5 h-5" />
              <span>Установить «ФинПомощник» на устройство</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Как установить вручную:
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <strong className="text-white">На телефоне (Chrome / Safari):</strong> Нажмите кнопку меню «Поделиться» или три точки ⋮ в браузере и выберите <strong>«На экран Домой»</strong> / <strong>«Установить приложение»</strong>.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex items-start gap-3">
                <Monitor className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <strong className="text-white">На компьютере (Chrome / Edge):</strong> Нажмите на значок установки <span className="font-mono bg-white/10 px-1 py-0.5 rounded">⊕</span> в правой части адресной строки браузера.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
