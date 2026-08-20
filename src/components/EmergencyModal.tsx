import React, { useState, useEffect } from 'react';
import { EmergencyFund } from '../types';
import { X, Check, ShieldCheck, Plus, Minus, Settings } from 'lucide-react';
import { playSound } from '../services/sound';

interface EmergencyActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  fund: EmergencyFund;
  mode: 'deposit' | 'withdraw' | 'configure';
  onAction: (amount: number, mode: 'deposit' | 'withdraw' | 'configure', note?: string) => void;
  currency?: string;
}

export const EmergencyModal: React.FC<EmergencyActionModalProps> = ({
  isOpen,
  onClose,
  fund,
  mode,
  onAction,
  currency = '₸',
}) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (mode === 'configure') {
        setAmount(fund.targetAmount.toString());
      } else {
        setAmount('');
      }
      setNote('');
      setError('');
    }
  }, [isOpen, mode, fund]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);

    if (isNaN(num) || num <= 0) {
      setError('Сумма должна быть больше 0');
      return;
    }

    if (mode === 'withdraw' && num > fund.currentAmount) {
      setError(`Нельзя использовать больше, чем накоплено в подушке (${fund.currentAmount.toLocaleString('ru-RU')} ${currency})`);
      return;
    }

    playSound(mode === 'deposit' ? 'coin' : 'payment');
    onAction(num, mode, note.trim() || undefined);
    onClose();
  };

  let title = 'Пополнить подушку';
  let subtitle = 'Внесите средства в резервный фонд безопасности';
  let icon = <Plus className="w-6 h-6 text-emerald-400" />;
  let btnClass = 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30';
  let btnText = 'Пополнить фонд';

  if (mode === 'withdraw') {
    title = 'Использовать средства фонда';
    subtitle = 'Снятие денег из подушки на экстренные непредвиденные расходы';
    icon = <Minus className="w-6 h-6 text-amber-400" />;
    btnClass = 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30';
    btnText = 'Использовать средства';
  } else if (mode === 'configure') {
    title = 'Настроить целевой размер подушки';
    subtitle = 'Рекомендуется от 3 до 6 месяцев обязательных расходов';
    icon = <Settings className="w-6 h-6 text-cyan-400" />;
    btnClass = 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/30';
    btnText = 'Сохранить целевую сумму';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {mode === 'configure' ? `Новая цель фонда (${currency})` : `Сумма (${currency})`}
            </label>
            <input
              type="number"
              step="any"
              min="1"
              required
              autoFocus
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3.5 text-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {mode !== 'configure' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Причина / Комментарий (необязательно)
              </label>
              <input
                type="text"
                placeholder="Например: С квартального бонуса"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm"
            >
              Отмена
            </button>
            <button
              type="submit"
              className={`px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg flex items-center gap-2 ${btnClass}`}
            >
              <Check className="w-4 h-4" />
              <span>{btnText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
