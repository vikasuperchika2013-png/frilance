import React from 'react';
import { MonthlyComparisonData, AppSettings } from '../types';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
  Sparkles,
  Scale,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';

interface MonthlyComparisonCardProps {
  data: MonthlyComparisonData;
  settings: AppSettings;
  isNight?: boolean;
}

export const MonthlyComparisonCard: React.FC<MonthlyComparisonCardProps> = ({
  data,
  settings,
  isNight = false,
}) => {
  const {
    currentMonthName,
    previousMonthName,
    currentYear,
    previousYear,
    currentIncome,
    previousIncome,
    incomeChangeAmount,
    incomeChangePercent,
    incomeTrend,
    currentExpense,
    previousExpense,
    expenseChangeAmount,
    expenseChangePercent,
    expenseTrend,
    currentNetSavings,
    previousNetSavings,
    netSavingsChange,
    netSavingsTrend,
    hasPreviousData,
    hasCurrentData,
  } = data;

  // Max for proportional visual progress bars
  const maxIncome = Math.max(currentIncome, previousIncome, 1);
  const maxExpense = Math.max(currentExpense, previousExpense, 1);

  const prevIncomeBarWidth = Math.round((previousIncome / maxIncome) * 100);
  const currIncomeBarWidth = Math.round((currentIncome / maxIncome) * 100);

  const prevExpenseBarWidth = Math.round((previousExpense / maxExpense) * 100);
  const currExpenseBarWidth = Math.round((currentExpense / maxExpense) * 100);

  // Income indicator styling
  const isIncomeUp = incomeTrend === 'up';
  const isIncomeDown = incomeTrend === 'down';

  // Expense indicator styling (expense DOWN is positive/good for user!)
  const isExpenseDecreased = expenseTrend === 'down';
  const isExpenseIncreased = expenseTrend === 'up';

  return (
    <div
      id="dashboard-monthly-comparison-card"
      className={`rounded-3xl p-6 border backdrop-blur-xl transition-all duration-300 shadow-xl relative overflow-hidden ${
        isNight
          ? 'bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 border-emerald-500/25 shadow-emerald-950/40'
          : 'bg-white border-slate-200/90 shadow-slate-200/50'
      }`}
    >
      {/* Background ambient glow */}
      <div
        className={`absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
          isNight ? 'bg-emerald-500/10' : 'bg-emerald-100/60'
        }`}
      />

      {/* Header with Title and Comparison Period */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <span>Сравнение с прошлым месяцем</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3 h-3" /> Динамика
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {currentMonthName} {currentYear} в сравнении с {previousMonthName}{' '}
                {previousYear !== currentYear ? previousYear : ''}
              </span>
            </p>
          </div>
        </div>

        {/* Net Cash Flow Summary Badge */}
        <div
          className={`px-3.5 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-2 self-start sm:self-auto ${
            netSavingsTrend === 'up'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : netSavingsTrend === 'down'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
              : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
          }`}
        >
          {netSavingsTrend === 'up' ? (
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          ) : netSavingsTrend === 'down' ? (
            <ArrowDownRight className="w-4 h-4 text-amber-500" />
          ) : (
            <Minus className="w-4 h-4" />
          )}
          <span>
            {netSavingsTrend === 'up'
              ? `Чистый остаток +${Math.abs(netSavingsChange).toLocaleString('ru-RU')} ${settings.currency}`
              : netSavingsTrend === 'down'
              ? `Чистый остаток −${Math.abs(netSavingsChange).toLocaleString('ru-RU')} ${settings.currency}`
              : 'Чистый остаток без изменений'}
          </span>
        </div>
      </div>

      {/* Comparison Grid: Income side & Expense side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
        {/* 1. INCOME COMPARISON BLOCK */}
        <div
          id="monthly-comparison-income-block"
          className={`p-5 rounded-2xl border transition-all ${
            isNight
              ? 'bg-black/30 border-white/10 hover:border-emerald-500/30'
              : 'bg-slate-50/90 border-slate-200/90 hover:border-emerald-300'
          }`}
        >
          {/* Income Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Доходы за месяц
              </span>
            </div>

            {/* Income Dynamic Indicator Badge with Arrow */}
            <div
              id="income-trend-indicator-badge"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                isIncomeUp
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 animate-pulse'
                  : isIncomeDown
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
              }`}
            >
              {isIncomeUp ? (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+{incomeChangePercent}%</span>
                </>
              ) : isIncomeDown ? (
                <>
                  <ArrowDownRight className="w-4 h-4" />
                  <span>{incomeChangePercent}%</span>
                </>
              ) : (
                <>
                  <Minus className="w-3.5 h-3.5" />
                  <span>0%</span>
                </>
              )}
            </div>
          </div>

          {/* Values Comparison Display */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                {currentMonthName} (Текущий)
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{currentIncome.toLocaleString('ru-RU')} {settings.currency}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                {previousMonthName} (Прошлый)
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                +{previousIncome.toLocaleString('ru-RU')} {settings.currency}
              </div>
            </div>
          </div>

          {/* Visual Progress Comparative Bars */}
          <div className="space-y-2 text-xs">
            {/* Current Month Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{currentMonthName}</span>
                <span>{currentIncome.toLocaleString('ru-RU')} {settings.currency}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                  style={{ width: `${Math.max(4, currIncomeBarWidth)}%` }}
                />
              </div>
            </div>

            {/* Previous Month Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{previousMonthName}</span>
                <span>{previousIncome.toLocaleString('ru-RU')} {settings.currency}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-slate-400 dark:bg-slate-600 transition-all duration-700 opacity-80"
                  style={{ width: `${Math.max(4, prevIncomeBarWidth)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Footer Delta Note */}
          <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-white/10 text-xs flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Разница с прошлым:</span>
            <strong
              className={`font-bold ${
                incomeChangeAmount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-300'
              }`}
            >
              {incomeChangeAmount >= 0 ? '+' : '−'}
              {Math.abs(incomeChangeAmount).toLocaleString('ru-RU')} {settings.currency}
            </strong>
          </div>
        </div>

        {/* 2. EXPENSE COMPARISON BLOCK */}
        <div
          id="monthly-comparison-expense-block"
          className={`p-5 rounded-2xl border transition-all ${
            isNight
              ? 'bg-black/30 border-white/10 hover:border-rose-500/30'
              : 'bg-slate-50/90 border-slate-200/90 hover:border-rose-300'
          }`}
        >
          {/* Expense Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
                <TrendingDown className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Расходы за месяц
              </span>
            </div>

            {/* Expense Dynamic Indicator Badge with Arrow */}
            {/* Note: If expense went DOWN, that's green (favorable). If UP, that's rose/amber */}
            <div
              id="expense-trend-indicator-badge"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                isExpenseDecreased
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                  : isExpenseIncreased
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
              }`}
            >
              {isExpenseDecreased ? (
                <>
                  <ArrowDownRight className="w-4 h-4" />
                  <span>{expenseChangePercent}% (Экономия)</span>
                </>
              ) : isExpenseIncreased ? (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+{expenseChangePercent}%</span>
                </>
              ) : (
                <>
                  <Minus className="w-3.5 h-3.5" />
                  <span>0%</span>
                </>
              )}
            </div>
          </div>

          {/* Values Comparison Display */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                {currentMonthName} (Текущий)
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
                −{currentExpense.toLocaleString('ru-RU')} {settings.currency}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                {previousMonthName} (Прошлый)
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                −{previousExpense.toLocaleString('ru-RU')} {settings.currency}
              </div>
            </div>
          </div>

          {/* Visual Progress Comparative Bars */}
          <div className="space-y-2 text-xs">
            {/* Current Month Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{currentMonthName}</span>
                <span>{currentExpense.toLocaleString('ru-RU')} {settings.currency}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-700"
                  style={{ width: `${Math.max(4, currExpenseBarWidth)}%` }}
                />
              </div>
            </div>

            {/* Previous Month Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{previousMonthName}</span>
                <span>{previousExpense.toLocaleString('ru-RU')} {settings.currency}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-slate-400 dark:bg-slate-600 transition-all duration-700 opacity-80"
                  style={{ width: `${Math.max(4, prevExpenseBarWidth)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Footer Delta Note */}
          <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-white/10 text-xs flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Разница в расходах:</span>
            <strong
              className={`font-bold ${
                expenseChangeAmount <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {expenseChangeAmount > 0 ? '+' : '−'}
              {Math.abs(expenseChangeAmount).toLocaleString('ru-RU')} {settings.currency}
            </strong>
          </div>
        </div>
      </div>

      {/* Helpful Smart Insight Banner */}
      <div
        className={`mt-4 p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
          isExpenseDecreased && isIncomeUp
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
            : isExpenseDecreased
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
            : isIncomeUp
            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-800 dark:text-cyan-200'
            : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
        }`}
      >
        {isExpenseDecreased ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
        )}
        <span>
          {!hasPreviousData
            ? `Сравнительная аналитика сформируется автоматически по мере накопления записей за ${currentMonthName} и последующие месяцы.`
            : isExpenseDecreased && isIncomeUp
            ? `Отличный результат! Ваши доходы выросли на ${Math.abs(incomeChangePercent)}%, а расходы снизились на ${Math.abs(expenseChangePercent)}%.`
            : isExpenseDecreased
            ? `В этом месяце вы тратите на ${Math.abs(expenseChangePercent)}% меньше, чем в прошлом (${previousMonthName}).`
            : isIncomeUp
            ? `Доходы увеличились на ${Math.abs(incomeChangePercent)}% по сравнению с ${previousMonthName}.`
            : `Расходы в этом месяце изменились на ${expenseChangePercent > 0 ? '+' : ''}${expenseChangePercent}% относительно прошлого месяца.`}
        </span>
      </div>
    </div>
  );
};
