import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category } from '../types';
import { X, Mic, Calendar, AlignLeft, Check, Sparkles } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';
import { playSound } from '../services/sound';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  categories: Category[];
  initialData?: Transaction | null;
  currency?: string;
  onOpenVoiceInput?: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  initialData,
  currency = '₸',
  onOpenVoiceInput,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type);
        setAmount(initialData.amount.toString());
        setCategoryId(initialData.categoryId);
        setDate(initialData.date);
        setDescription(initialData.description || '');
      } else {
        setType('expense');
        setAmount('');
        const firstExpenseCat = categories.find((c) => c.type === 'expense');
        setCategoryId(firstExpenseCat ? firstExpenseCat.id : categories[0]?.id || '');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
      }
      setError('');
    }
  }, [isOpen, initialData, categories]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Сумма должна быть больше нуля');
      playSound('delete');
      return;
    }

    if (!categoryId) {
      setError('Выберите категорию');
      return;
    }

    if (!date) {
      setError('Укажите дату операции');
      return;
    }

    playSound(type === 'income' ? 'coin' : 'payment');

    onSave({
      type,
      amount: numAmount,
      categoryId,
      date,
      description: description.trim(),
    });

    onClose();
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const available = categories.filter((c) => c.type === newType);
    if (available.length > 0) {
      setCategoryId(available[0].id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        id="transaction-modal"
        className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {initialData ? 'Редактировать операцию' : 'Новая операция'}
              </h3>
              <p className="text-xs text-slate-400">Заполните данные о доходе или расходе</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Operation Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Тип операции
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="type-expense-btn"
                onClick={() => handleTypeChange('expense')}
                className={`py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                  type === 'expense'
                    ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>📉 Расход</span>
              </button>
              <button
                type="button"
                id="type-income-btn"
                onClick={() => handleTypeChange('income')}
                className={`py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                  type === 'income'
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>📈 Доход</span>
              </button>
            </div>
          </div>

          {/* Amount Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Сумма ({currency})
              </label>
              {onOpenVoiceInput && (
                <button
                  type="button"
                  onClick={onOpenVoiceInput}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Голосовой ввод</span>
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="transaction-amount-input"
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3.5 text-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all tabular-nums"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-500">
                {currency}
              </span>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Категория
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-1 text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <span className="truncate w-full text-center">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Дата операции</span>
            </label>
            <input
              id="transaction-date-input"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Описание (необязательно)</span>
            </label>
            <input
              id="transaction-desc-input"
              type="text"
              placeholder="Например: Супермаркет или Премия"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm transition-all"
            >
              Отмена
            </button>
            <button
              type="submit"
              id="transaction-submit-btn"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Сохранить изменения' : 'Добавить операцию'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
