import React, { useState, useEffect } from 'react';
import { Loan } from '../types';
import { X, Check, CircleDollarSign } from 'lucide-react';
import { playSound } from '../services/sound';
import confetti from 'canvas-confetti';

interface LoanPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  onMakePayment: (loanId: string, amount: number, date: string, comment?: string) => void;
  currency?: string;
}

export const LoanPaymentModal: React.FC<LoanPaymentModalProps> = ({
  isOpen,
  onClose,
  loan,
  onMakePayment,
  currency = '₸',
}) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && loan) {
      // Default to monthly payment or remaining amount if less
      const defAmount = Math.min(loan.monthlyPayment || 0, loan.remainingAmount);
      setAmount(defAmount > 0 ? defAmount.toString() : loan.remainingAmount.toString());
      setDate(new Date().toISOString().split('T')[0]);
      setComment('Плановый платёж');
      setError('');
    }
  }, [isOpen, loan]);

  if (!isOpen || !loan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Сумма платежа должна быть больше 0');
      return;
    }

    if (numAmount > loan.remainingAmount) {
      setError(`Сумма платежа превышает остаток долга (${loan.remainingAmount.toLocaleString('ru-RU')} ${currency})`);
      return;
    }

    if (!date) {
      setError('Укажите дату платежа');
      return;
    }

    const isFullyPaid = loan.remainingAmount - numAmount <= 0;

    if (isFullyPaid) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
      });
      playSound('celebrate');
    } else {
      playSound('payment');
    }

    onMakePayment(loan.id, numAmount, date, comment.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400">
              <CircleDollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">💰 Внести платёж</h3>
              <p className="text-xs text-slate-400 truncate max-w-[200px]">«{loan.title}»</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loan quick state overview */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex justify-between items-center text-xs">
          <div>
            <div className="text-slate-400">Остаток долга:</div>
            <div className="font-bold text-cyan-300 text-sm">
              {loan.remainingAmount.toLocaleString('ru-RU')} {currency}
            </div>
          </div>
          <div className="text-right">
            <div className="text-slate-400">Ежемес. платёж:</div>
            <div className="font-bold text-white text-sm">
              {loan.monthlyPayment.toLocaleString('ru-RU')} {currency}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Сумма платежа ({currency})
            </label>
            <input
              type="number"
              step="any"
              min="1"
              max={loan.remainingAmount}
              required
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3.5 text-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Дата платежа
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Комментарий
            </label>
            <input
              type="text"
              placeholder="Например: Плановый ежемесячный платеж"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
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
              <span>Внести платёж</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
