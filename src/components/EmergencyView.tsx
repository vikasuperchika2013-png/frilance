import React, { useState, useMemo } from 'react';
import { EmergencyFund, AppSettings, Transaction } from '../types';
import { AnimatedProgressBar } from './AnimatedProgressBar';
import { SparklineChart, buildAccumulatedTimeline } from './SparklineChart';
import {
  ShieldCheck,
  Plus,
  Minus,
  Settings,
  HelpCircle,
  History,
  AlertTriangle,
  Sparkles,
  HeartHandshake,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { playSound } from '../services/sound';
import { calculateTotals } from '../services/storage';

interface EmergencyViewProps {
  fund: EmergencyFund;
  transactions: Transaction[];
  settings: AppSettings;
  onOpenActionModal: (mode: 'deposit' | 'withdraw' | 'configure') => void;
}

export const EmergencyView: React.FC<EmergencyViewProps> = ({
  fund,
  transactions,
  settings,
  onOpenActionModal,
}) => {
  const { monthExpense, totalExpense } = calculateTotals(transactions);
  const progressPct =
    fund.targetAmount > 0
      ? Math.min(100, Math.round((fund.currentAmount / fund.targetAmount) * 100))
      : 0;

  // Recommended fund: 3 to 6 months of monthly expenses
  const estimatedMonthExpense = monthExpense > 0 ? monthExpense : totalExpense > 0 ? Math.round(totalExpense / 3) : 150000;
  const recommendedMin = estimatedMonthExpense * 3;
  const recommendedMax = estimatedMonthExpense * 6;

  // Compute timeline of emergency fund changes
  const fundTimeline = useMemo(() => {
    return buildAccumulatedTimeline(fund.history || [], fund.currentAmount, fund.updatedAt);
  }, [fund.history, fund.currentAmount, fund.updatedAt]);

  const totalDeposited = (fund.history || [])
    .filter((h) => h.type === 'deposit')
    .reduce((sum, h) => sum + h.amount, 0);

  const totalWithdrawn = (fund.history || [])
    .filter((h) => h.type === 'withdraw')
    .reduce((sum, h) => sum + h.amount, 0);

  return (
    <div id="emergency-view" className="space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            🛡️ На чёрный день (Подушка безопасности)
          </h3>
          <p className="text-xs text-slate-400">
            Резервный фонд на случай непредвиденных обстоятельств и потери дохода
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              playSound('click');
              onOpenActionModal('configure');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold transition-all"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>Настроить цель</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              onOpenActionModal('deposit');
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Пополнить подушку</span>
          </button>
        </div>
      </div>

      {/* Main Status Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900/90 to-teal-950/80 border border-emerald-500/30 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-lg shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                Текущий резерв
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                {fund.currentAmount.toLocaleString('ru-RU')} {settings.currency}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Целевой размер</span>
            <div className="text-lg sm:text-xl font-bold text-emerald-300">
              {fund.targetAmount.toLocaleString('ru-RU')} {settings.currency}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-emerald-300">
            <span>Уровень готовности подушки безопасности</span>
            <span>{progressPct}%</span>
          </div>
          <AnimatedProgressBar
            percentage={progressPct}
            color="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"
          />
          <div className="flex justify-between text-xs text-slate-400 pt-1">
            <span>0 {settings.currency}</span>
            <span>
              Осталось накопить: <strong>{Math.max(0, fund.targetAmount - fund.currentAmount).toLocaleString('ru-RU')} {settings.currency}</strong>
            </span>
          </div>
        </div>

        {/* Sparkline Dynamics Chart inside Hero Card */}
        <div className="p-4 rounded-2xl bg-black/30 border border-emerald-500/20 space-y-2">
          <SparklineChart
            points={fundTimeline}
            color="#10b981"
            height={68}
            targetAmount={fund.targetAmount}
            showTargetLine={true}
            currency={settings.currency}
            label="📈 Динамика изменения суммы подушки"
            showDots={true}
            showTrendBadge={true}
            showTooltip={true}
            showMinMaxLabels={true}
          />
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
          <button
            onClick={() => {
              playSound('click');
              onOpenActionModal('deposit');
            }}
            className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Внести средства в подушку</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              onOpenActionModal('withdraw');
            }}
            disabled={fund.currentAmount <= 0}
            className="py-3 px-4 rounded-2xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 disabled:opacity-40 disabled:pointer-events-none font-semibold text-sm border border-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Minus className="w-4 h-4" />
            <span>Использовать при форс-мажоре</span>
          </button>
        </div>
      </div>

      {/* Recommendations & Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recommendation Card */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white">
              Рекомендованный размер
            </h4>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Финансовые консультанты рекомендуют иметь подушку в размере <strong>3–6 месяцев обязательных расходов</strong>:
          </p>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Ваши расходы за месяц:</span>
              <span className="font-bold text-white">~{estimatedMonthExpense.toLocaleString('ru-RU')} {settings.currency}</span>
            </div>
            <div className="flex justify-between items-center text-cyan-300 font-semibold pt-1 border-t border-white/5">
              <span>Рекомендуемый фонд (3-6 мес):</span>
              <span>{recommendedMin.toLocaleString('ru-RU')} – {recommendedMax.toLocaleString('ru-RU')} {settings.currency}</span>
            </div>
          </div>
        </div>

        {/* Rules Card */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white">
              Правила использования
            </h4>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Когда использовать:</strong> Внезапное лечение, потеря работы, срочный неотложный ремонт.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">✕</span>
              <span><strong>Когда НЕ использовать:</strong> Скидки, шопинг, спонтанный отдых или развлечения.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Emergency Fund History Ledger */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-base text-white">История операций подушки</h4>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 font-semibold">
              Внесено: +{totalDeposited.toLocaleString('ru-RU')} {settings.currency}
            </span>
            {totalWithdrawn > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/20 font-semibold">
                Снято: −{totalWithdrawn.toLocaleString('ru-RU')} {settings.currency}
              </span>
            )}
          </div>
        </div>

        {!fund.history || fund.history.length === 0 ? (
          <div className="text-xs text-slate-400 text-center py-6">
            История операций пока пуста. Пополните фонд безопасности!
          </div>
        ) : (
          <div className="space-y-2">
            {fund.history.map((item, idx) => {
              const isDep = item.type === 'deposit';
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        isDep ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {isDep ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-white">
                        {item.note || (isDep ? 'Пополнение подушки' : 'Снятие средств')}
                      </div>
                      <div className="text-[11px] text-slate-500">{item.date}</div>
                    </div>
                  </div>

                  <div className={`font-bold text-sm ${isDep ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isDep ? '+' : '−'}{item.amount.toLocaleString('ru-RU')} {settings.currency}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
