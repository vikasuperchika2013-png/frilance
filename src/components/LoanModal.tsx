import React, { useState, useEffect } from 'react';
import { Loan } from '../types';
import { X, Check, CreditCard } from 'lucide-react';
import { playSound } from '../services/sound';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loan: Omit<Loan, 'id' | 'createdAt' | 'payments' | 'isCompleted'>) => void;
  initialData?: Loan | null;
  currency?: string;
}

export const LoanModal: React.FC<LoanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  currency = '₸',
}) => {
  const [title, setTitle] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [interestRate, setInterestRate] = useState('15');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setInitialAmount(initialData.initialAmount.toString());
        setRemainingAmount(initialData.remainingAmount.toString());
        setMonthlyPayment(initialData.monthlyPayment.toString());
        setInterestRate(initialData.interestRate.toString());
        setStartDate(initialData.startDate);
        setEndDate(initialData.endDate || '');
        setDescription(initialData.description || '');
      } else {
        setTitle('');
        setInitialAmount('');
        setRemainingAmount('');
        setMonthlyPayment('');
        setInterestRate('15');
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate('');
        setDescription('');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleInitialAmountChange = (val: string) => {
    setInitialAmount(val);
    if (!initialData && !remainingAmount) {
      setRemainingAmount(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const initVal = parseFloat(initialAmount);
    const remVal = parseFloat(remainingAmount);
    const monthVal = parseFloat(monthlyPayment) || 0;
    const rateVal = parseFloat(interestRate) || 0;

    if (!title.trim()) {
      setError('Введите название кредита');
      return;
    }

    if (isNaN(initVal) || initVal <= 0) {
      setError('Изначальная сумма должна быть больше 0');
      return;
    }

    if (isNaN(remVal) || remVal < 0) {
      setError('Текущий остаток долга не может быть отрицательным');
      return;
    }

    if (remVal > initVal) {
      setError('Остаток долга не может превышать изначальную сумму кредита');
      return;
    }

    playSound('success');

    onSave({
      title: title.trim(),
      initialAmount: initVal,
      remainingAmount: remVal,
      monthlyPayment: monthVal,
      interestRate: rateVal,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || undefined,
      description: description.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        id="loan-modal"
        className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {initialData ? 'Редактировать кредит' : 'Добавить кредит / долг'}
              </h3>
              <p className="text-xs text-slate-400">Учет выплат, процентов и остатка</p>
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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Название кредита
            </label>
            <input
              type="text"
              required
              placeholder="Например: Кредит на телефон или Автокредит"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Изначальная сумма ({currency})
              </label>
              <input
                type="number"
                step="any"
                min="1"
                required
                placeholder="500 000"
                value={initialAmount}
                onChange={(e) => handleInitialAmountChange(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Текущий остаток долга ({currency})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                placeholder="200 000"
                value={remainingAmount}
                onChange={(e) => setRemainingAmount(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Ежемесячный платёж ({currency})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="50 000"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Процентная ставка (%)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="15"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Дата начала
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Дата окончания
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Описание / Примечание
            </label>
            <input
              type="text"
              placeholder="Например: Рассрочка в банке"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
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
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Сохранить' : 'Добавить кредит'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
