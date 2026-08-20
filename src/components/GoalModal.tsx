import React, { useState, useEffect } from 'react';
import { SavingsGoal } from '../types';
import { AVAILABLE_ICONS, CategoryIcon } from './CategoryIcon';
import { X, Check, PiggyBank, Plus, Minus } from 'lucide-react';
import { playSound } from '../services/sound';
import confetti from 'canvas-confetti';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'history'>) => void;
  initialData?: SavingsGoal | null;
  currency?: string;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  currency = '₸',
}) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('Smartphone');
  const [color, setColor] = useState('#3b82f6');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setTargetAmount(initialData.targetAmount.toString());
        setCurrentAmount(initialData.currentAmount.toString());
        setDeadline(initialData.deadline || '');
        setIcon(initialData.icon || 'Smartphone');
        setColor(initialData.color || '#3b82f6');
      } else {
        setTitle('');
        setTargetAmount('');
        setCurrentAmount('0');
        setDeadline('');
        setIcon('Smartphone');
        setColor('#3b82f6');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;

    if (!title.trim()) {
      setError('Введите название цели');
      return;
    }

    if (isNaN(target) || target <= 0) {
      setError('Целевая сумма должна быть больше 0');
      return;
    }

    const isCompleted = current >= target;

    if (isCompleted) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      playSound('success');
    } else {
      playSound('coin');
    }

    onSave({
      title: title.trim(),
      targetAmount: target,
      currentAmount: current,
      deadline: deadline || undefined,
      icon,
      color,
      isCompleted,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        id="goal-modal"
        className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: color }}
            >
              <CategoryIcon name={icon} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {initialData ? 'Редактировать цель' : 'Создать копилку'}
              </h3>
              <p className="text-xs text-slate-400">Накопите на мечту шаг за шагом</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white"
          >
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
              Название финансовой цели
            </label>
            <input
              type="text"
              required
              placeholder="Например: Новый телефон или Отпуск"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Целевая сумма ({currency})
              </label>
              <input
                type="number"
                step="any"
                min="1"
                required
                placeholder="500 000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-base font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Уже накоплено ({currency})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-base font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Желаемая дата достижения (необязательно)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Иконка цели
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-36 overflow-y-auto custom-scrollbar p-1">
              {AVAILABLE_ICONS.map((iconKey) => {
                const isSelected = icon === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setIcon(iconKey)}
                    className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/40'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CategoryIcon name={iconKey} className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

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
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Сохранить' : 'Создать копилку'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Deposit or Withdraw from a Goal Modal
interface GoalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  mode: 'deposit' | 'withdraw';
  onAction: (goalId: string, amount: number, mode: 'deposit' | 'withdraw', note?: string) => void;
  currency?: string;
}

export const GoalActionModal: React.FC<GoalActionModalProps> = ({
  isOpen,
  onClose,
  goal,
  mode,
  onAction,
  currency = '₸',
}) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setNote('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Введите сумму больше нуля');
      return;
    }

    if (mode === 'withdraw' && num > goal.currentAmount) {
      setError(`Нельзя снять больше, чем накоплено (${goal.currentAmount.toLocaleString('ru-RU')} ${currency})`);
      return;
    }

    onAction(goal.id, num, mode, note.trim() || undefined);

    if (mode === 'deposit' && goal.currentAmount + num >= goal.targetAmount) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    playSound(mode === 'deposit' ? 'coin' : 'payment');
    onClose();
  };

  const isDeposit = mode === 'deposit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isDeposit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {isDeposit ? <Plus className="w-6 h-6" /> : <Minus className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {isDeposit ? 'Пополнить копилку' : 'Снять часть средств'}
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-[200px]">«{goal.title}»</p>
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
              Сумма ({currency})
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Комментарий (необязательно)
            </label>
            <input
              type="text"
              placeholder="Например: С зарплаты"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

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
              className={`px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg flex items-center gap-2 ${
                isDeposit
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isDeposit ? 'Пополнить' : 'Снять средства'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
