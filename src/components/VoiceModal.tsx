import React, { useState, useEffect, useRef } from 'react';
import { Category, ParsedVoiceCommand, Transaction, ActivePage, ThemeName } from '../types';
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  Check,
  Send,
  Volume2,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Navigation,
  Palette,
  CreditCard,
  PiggyBank,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  parseVoiceInput,
  speakFeedback,
} from '../services/voice';
import { playSound } from '../services/sound';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onExecuteTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onNavigate: (page: ActivePage) => void;
  onSetTheme: (theme: ThemeName) => void;
  onSetNightMode: (enabled: boolean) => void;
  onShowBalance: () => void;
  currency?: string;
  enableSpeechFeedback?: boolean;
  isNight?: boolean;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  categories,
  onExecuteTransaction,
  onNavigate,
  onSetTheme,
  onSetNightMode,
  onShowBalance,
  currency = '₸',
  enableSpeechFeedback = true,
  isNight = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedCommand, setParsedCommand] = useState<ParsedVoiceCommand | null>(null);
  const [manualText, setManualText] = useState('');
  const [statusMessage, setStatusMessage] = useState('Нажмите микрофон и скажите команду');
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognizerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setParsedCommand(null);
      setManualText('');
      setPermissionError(null);
      setStatusMessage('Нажмите микрофон и скажите команду');

      if (isSpeechRecognitionSupported()) {
        startListening();
      } else {
        setStatusMessage('В вашем браузере включен текстовый ввод команд');
      }
    } else {
      stopListening();
    }

    return () => {
      stopListening();
    };
  }, [isOpen]);

  const startListening = async () => {
    setPermissionError(null);

    // Request microphone access in browser if available
    if (navigator?.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Close audio track stream once permission granted
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.warn('Microphone permission info:', err);
      }
    }

    if (!isSpeechRecognitionSupported()) {
      setStatusMessage('Используйте текстовый ввод команд ниже');
      return;
    }

    try {
      if (recognizerRef.current) {
        recognizerRef.current.abort();
      }

      const recognizer = createSpeechRecognizer();
      if (!recognizer) return;

      recognizer.onstart = () => {
        setIsListening(true);
        setStatusMessage('Слушаю вас... Говорите четко');
        playSound('voice');
      };

      recognizer.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);

        if (event.results[current].isFinal) {
          handleParseText(text);
        }
      };

      recognizer.onerror = (event: any) => {
        setIsListening(false);
        const errType = event?.error || 'error';
        if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          setPermissionError('Доступ к микрофону заблокирован в браузере. Разрешите доступ или воспользуйтесь кнопками ниже.');
          setStatusMessage('Микрофон заблокирован');
        } else if (errType === 'no-speech') {
          setStatusMessage('Речь не обнаружена. Попробуйте еще раз или нажмите готовые фразы.');
        } else {
          setStatusMessage('Нажмите на микрофон еще раз или выберите готовую команду.');
        }
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      recognizerRef.current = recognizer;
      recognizer.start();
    } catch {
      setIsListening(false);
      setStatusMessage('Нажмите готовые фразы ниже для быстрого выполнения команды');
    }
  };

  const stopListening = () => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch {
        // ignore
      }
      recognizerRef.current = null;
    }
    setIsListening(false);
  };

  const handleParseText = (text: string) => {
    if (!text.trim()) return;
    const parsed = parseVoiceInput(text, categories);
    setParsedCommand(parsed);
    setStatusMessage('Команда распознана. Подтвердите выполнение:');
    playSound('coin');

    if (enableSpeechFeedback && parsed.confidenceMessage) {
      speakFeedback(parsed.confidenceMessage);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    setTranscript(manualText);
    handleParseText(manualText);
  };

  const handleExecute = () => {
    if (!parsedCommand) return;

    if (parsedCommand.action === 'add_transaction' && parsedCommand.amount && parsedCommand.categoryId && parsedCommand.type) {
      onExecuteTransaction({
        type: parsedCommand.type,
        amount: parsedCommand.amount,
        categoryId: parsedCommand.categoryId,
        date: new Date().toISOString().split('T')[0],
        description: `Голос: ${parsedCommand.rawText}`,
      });
      playSound('success');
      onClose();
    } else if (parsedCommand.action === 'navigate' && parsedCommand.targetPage) {
      onNavigate(parsedCommand.targetPage);
      playSound('click');
      onClose();
    } else if (parsedCommand.action === 'toggle_theme') {
      if (parsedCommand.nightMode !== undefined) {
        onSetNightMode(parsedCommand.nightMode);
      }
      if (parsedCommand.themeName) {
        onSetTheme(parsedCommand.themeName);
      }
      playSound('success');
      onClose();
    } else if (parsedCommand.action === 'show_balance') {
      onShowBalance();
      playSound('coin');
      onClose();
    }
  };

  const handleQuickCommand = (sample: string) => {
    setManualText(sample);
    setTranscript(sample);
    handleParseText(sample);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        id="voice-assistant-modal"
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl transition-all space-y-6 max-h-[92vh] overflow-y-auto border ${
          isNight
            ? 'bg-slate-900 border-emerald-500/30 text-white shadow-emerald-950/60'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-inherit pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white shrink-0">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                Голосовой помощник
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </h3>
              <p className="text-xs text-slate-500">Управление финансами голосом и быстрыми командами</p>
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

        {/* Permission Notice if Blocked */}
        {permissionError && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{permissionError}</span>
          </div>
        )}

        {/* Voice Active Mic Visualizer */}
        <div className={`flex flex-col items-center justify-center py-6 px-4 rounded-2xl border text-center relative overflow-hidden ${
          isNight ? 'bg-slate-950/80 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          {/* Animated Wave Rings */}
          {isListening && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-28 h-28 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="w-44 h-44 rounded-full bg-emerald-500/10 animate-pulse" />
            </div>
          )}

          <button
            id="voice-record-toggle-btn"
            onClick={isListening ? stopListening : startListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-95 z-10 ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/40 ring-4 ring-rose-500/30 scale-110'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/40 hover:scale-105'
            }`}
            title={isListening ? 'Остановить запись' : 'Включить микрофон'}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>

          <div className="mt-4 font-bold text-sm">
            {statusMessage}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {isListening ? 'Говорите четко на русском языке...' : 'Нажмите на кнопку, чтобы сказать команду'}
          </div>

          {/* Equalizer animation when listening */}
          {isListening && (
            <div className="flex items-center gap-1 mt-3">
              {[40, 70, 90, 60, 80, 50, 100, 75, 45].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-emerald-500 rounded-full animate-pulse"
                  style={{ height: `${h * 0.25}px`, animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Live Transcript Box */}
        {transcript && (
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isNight ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
              <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>🎙️ Распознанный текст:</span>
            </div>
            <div className="text-base font-semibold text-emerald-600 dark:text-emerald-300 italic">
              «{transcript}»
            </div>
          </div>
        )}

        {/* Parsed Command Card */}
        {parsedCommand && parsedCommand.action !== 'unknown' && (
          <div className={`p-5 rounded-2xl border shadow-xl space-y-4 ${
            isNight
              ? 'bg-emerald-950/60 border-emerald-500/40'
              : 'bg-emerald-50/80 border-emerald-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Результат распознавания
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/30">
                Готово к выполнению
              </span>
            </div>

            {parsedCommand.action === 'add_transaction' && (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className={`p-3 rounded-xl border ${
                  isNight ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="text-[11px] text-slate-500 mb-1">Тип</div>
                  <div className="font-bold text-xs sm:text-sm flex items-center justify-center gap-1">
                    {parsedCommand.type === 'income' ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> Доход
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" /> Расход
                      </span>
                    )}
                  </div>
                </div>

                <div className={`p-3 rounded-xl border ${
                  isNight ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="text-[11px] text-slate-500 mb-1">Сумма</div>
                  <div className="font-bold text-xs sm:text-sm text-emerald-600 dark:text-amber-300">
                    {parsedCommand.amount?.toLocaleString('ru-RU')} {currency}
                  </div>
                </div>

                <div className={`p-3 rounded-xl border ${
                  isNight ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="text-[11px] text-slate-500 mb-1">Категория</div>
                  <div className="font-bold text-xs sm:text-sm text-blue-600 dark:text-cyan-300 truncate">
                    {parsedCommand.categoryName || 'Другое'}
                  </div>
                </div>
              </div>
            )}

            {parsedCommand.action === 'navigate' && (
              <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                isNight ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200'
              }`}>
                <Navigation className="w-5 h-5 text-sky-500 shrink-0" />
                <div className="text-sm font-semibold">
                  Переход в раздел «{parsedCommand.targetPage}»
                </div>
              </div>
            )}

            {parsedCommand.action === 'toggle_theme' && (
              <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                isNight ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200'
              }`}>
                <Palette className="w-5 h-5 text-purple-500 shrink-0" />
                <div className="text-sm font-semibold">
                  {parsedCommand.nightMode !== undefined
                    ? parsedCommand.nightMode
                      ? 'Включение тёмной темы'
                      : 'Включение белоснежной светлой темы'
                    : `Установка темы: ${parsedCommand.themeName}`}
                </div>
              </div>
            )}

            {parsedCommand.action === 'show_balance' && (
              <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                isNight ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200'
              }`}>
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="text-sm font-semibold">
                  Показать общий баланс на экране
                </div>
              </div>
            )}

            <button
              id="voice-confirm-action-btn"
              onClick={handleExecute}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Подтвердить и выполнить</span>
            </button>
          </div>
        )}

        {/* Fallback Text Simulator / Manual Input */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Или введите команду текстом
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="voice-text-simulator-input"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Например: Расход 5000 на еду или Доход 200000 зарплата"
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                isNight
                  ? 'bg-slate-950/80 border-white/15 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Example Commands Quick Chips */}
        <div className="space-y-2.5 pt-2 border-t border-inherit">
          <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Готовые фразы для быстрой проверки:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Расход 3500 еда',
              'Доход 250000 зарплата',
              'Расход 1800 такси',
              'Открыть копилки',
              'Открыть кредиты',
              'Открыть статистику',
              'Белая тема',
              'Тёмная тема',
              'Показать баланс',
            ].map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickCommand(sample)}
                className={`text-[11px] px-2.5 py-1.5 rounded-xl border transition-all text-left font-medium ${
                  isNight
                    ? 'bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border-white/10 hover:border-emerald-500/30'
                    : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border-slate-200 hover:border-emerald-300'
                }`}
              >
                «{sample}»
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

