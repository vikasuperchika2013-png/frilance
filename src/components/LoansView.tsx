import React, { useState } from 'react';
import { Loan, AppSettings } from '../types';
import { calculateLoanTotals } from '../services/storage';
import { AnimatedProgressBar } from './AnimatedProgressBar';
import {
  CreditCard,
  Plus,
  Coins,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  History,
  TrendingDown,
  Percent,
} from 'lucide-react';
import { playSound } from '../services/sound';

interface LoansViewProps {
  loans: Loan[];
  settings: AppSettings;
  onOpenCreateLoan: () => void;
  onEditLoan: (loan: Loan) => void;
  onDeleteLoan: (loanId: string) => void;
  onOpenPaymentModal: (loan: Loan) => void;
}

export const LoansView: React.FC<LoansViewProps> = ({
  loans,
  settings,
  onOpenCreateLoan,
  onEditLoan,
  onDeleteLoan,
  onOpenPaymentModal,
}) => {
  const [loanToDelete, setLoanToDelete] = useState<Loan | null>(null);
  const [expandedLoanHistoryId, setExpandedLoanHistoryId] = useState<string | null>(null);

  const stats = calculateLoanTotals(loans);

  return (
    <div id="loans-view" className="space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            💳 Кредиты и долги
          </h3>
          <p className="text-xs text-slate-400">
            Остаток долга: <strong className="text-rose-400">{stats.totalRemaining.toLocaleString('ru-RU')} {settings.currency}</strong> (Выплачено: {stats.totalPaid.toLocaleString('ru-RU')} {settings.currency})
          </p>
        </div>

        <button
          onClick={() => {
            playSound('click');
            onOpenCreateLoan();
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-600/25 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Добавить кредит</span>
        </button>
      </div>

      {/* Aggregate KPI Stats Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
          <span className="text-xs text-slate-400 block font-semibold">Изначальный долг</span>
          <div className="text-base sm:text-xl font-bold text-white mt-1">
            {stats.totalInitial.toLocaleString('ru-RU')} {settings.currency}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-xl shadow-xl">
          <span className="text-xs text-slate-400 block font-semibold">Уже выплачено</span>
          <div className="text-base sm:text-xl font-bold text-emerald-400 mt-1">
            {stats.totalPaid.toLocaleString('ru-RU')} {settings.currency}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-rose-500/20 backdrop-blur-xl shadow-xl">
          <span className="text-xs text-slate-400 block font-semibold">Остаток долга</span>
          <div className="text-base sm:text-xl font-bold text-rose-400 mt-1">
            {stats.totalRemaining.toLocaleString('ru-RU')} {settings.currency}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-xl shadow-xl">
          <span className="text-xs text-slate-400 block font-semibold">Общий прогресс</span>
          <div className="text-base sm:text-xl font-bold text-cyan-300 mt-1">
            {stats.overallProgress}%
          </div>
        </div>
      </div>

      {/* Loans Cards Grid */}
      {loans.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-white/10 text-center text-slate-400 space-y-4">
          <CreditCard className="w-12 h-12 mx-auto text-cyan-400 opacity-60" />
          <div>
            <h4 className="font-bold text-white text-base">Кредитов и долгов не найдено</h4>
            <p className="text-xs text-slate-400 mt-1">
              У вас нет активных задолженностей, или вы можете добавить кредит для учета выплат.
            </p>
          </div>
          <button
            onClick={onOpenCreateLoan}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold shadow-lg"
          >
            + Добавить кредит
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {loans.map((loan) => {
            const paid = Math.max(0, loan.initialAmount - loan.remainingAmount);
            const progress =
              loan.initialAmount > 0
                ? Math.min(100, Math.round((paid / loan.initialAmount) * 100))
                : 100;
            const isCompleted = loan.remainingAmount <= 0;
            const isHistoryOpen = expandedLoanHistoryId === loan.id;

            return (
              <div
                key={loan.id}
                id={`loan-card-${loan.id}`}
                className={`p-6 rounded-3xl bg-slate-900/80 border backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-5 transition-all duration-300 ${
                  isCompleted
                    ? 'border-emerald-500/50 shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                    : 'border-white/10 hover:border-cyan-500/30'
                }`}
              >
                {/* Loan Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 ${
                        isCompleted ? 'bg-emerald-600' : 'bg-gradient-to-tr from-cyan-600 to-blue-600'
                      }`}
                    >
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-white">{loan.title}</h4>
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Погашен!
                          </span>
                        )}
                      </div>
                      {loan.description && (
                        <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">
                          {loan.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditLoan(loan)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
                      title="Редактировать"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setLoanToDelete(loan)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400"
                      title="Удалить кредит"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Financial details breakdown */}
                <div className="grid grid-cols-2 gap-2 text-xs p-3.5 rounded-2xl bg-slate-950/70 border border-white/5">
                  <div>
                    <span className="text-slate-400 block">Остаток долга:</span>
                    <span className={`font-bold text-sm ${isCompleted ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {loan.remainingAmount.toLocaleString('ru-RU')} {settings.currency}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Изначальный долг:</span>
                    <span className="font-bold text-white text-sm">
                      {loan.initialAmount.toLocaleString('ru-RU')} {settings.currency}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-slate-400 block">Ежемесячный платёж:</span>
                    <span className="font-semibold text-white">
                      {loan.monthlyPayment.toLocaleString('ru-RU')} {settings.currency}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-slate-400 block">Ставка:</span>
                    <span className="font-semibold text-cyan-300">{loan.interestRate}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-cyan-300">
                    <span>Выплачено: {paid.toLocaleString('ru-RU')} {settings.currency}</span>
                    <span>{progress}%</span>
                  </div>
                  <AnimatedProgressBar
                    percentage={progress}
                    color={isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-2 border-t border-white/5">
                  {!isCompleted && (
                    <button
                      onClick={() => onOpenPaymentModal(loan)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Внести платёж</span>
                    </button>
                  )}

                  {loan.payments && loan.payments.length > 0 && (
                    <button
                      onClick={() => setExpandedLoanHistoryId(isHistoryOpen ? null : loan.id)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isHistoryOpen
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>История ({loan.payments.length})</span>
                    </button>
                  )}
                </div>

                {/* Loan Payments History Ledger */}
                {isHistoryOpen && loan.payments && loan.payments.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2 text-xs animate-fade-in">
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      История внесенных платежей:
                    </div>
                    <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1.5">
                      {loan.payments.map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-500">{p.date}</span>
                          <span className="text-slate-400 truncate max-w-[130px]">{p.comment || 'Платёж по кредиту'}</span>
                          <span className="font-bold text-emerald-400">
                            −{p.amount.toLocaleString('ru-RU')} {settings.currency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Loan Safeguard Modal */}
      {loanToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base">Удалить кредит?</h4>
                <p className="text-xs text-slate-400">«{loanToDelete.title}»</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Остаток долга по кредиту: <strong>{loanToDelete.remainingAmount.toLocaleString('ru-RU')} {settings.currency}</strong>.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setLoanToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  playSound('delete');
                  onDeleteLoan(loanToDelete.id);
                  setLoanToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
