import React from 'react';
import {
  Transaction,
  Category,
  SavingsGoal,
  EmergencyFund,
  Loan,
  ActivePage,
  AppSettings,
  FinancialReminder,
} from '../types';
import {
  calculateTotals,
  calculateLoanTotals,
  calculateGoalsTotals,
  calculateMonthlyComparison,
} from '../services/storage';
import { AnimatedNumber } from './AnimatedNumber';
import { AnimatedProgressBar } from './AnimatedProgressBar';
import { CategoryIcon } from './CategoryIcon';
import { SparklineChart } from './SparklineChart';
import { MonthlyComparisonCard } from './MonthlyComparisonCard';
import { RemindersWidget } from './RemindersWidget';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  CreditCard,
  PiggyBank,
  ShieldCheck,
  Plus,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Mic,
  Coins,
} from 'lucide-react';
import { playSound } from '../services/sound';

interface DashboardViewProps {
  transactions: Transaction[];
  categories: Category[];
  goals: SavingsGoal[];
  emergencyFund: EmergencyFund;
  loans: Loan[];
  reminders: FinancialReminder[];
  settings: AppSettings;
  onNavigate: (page: ActivePage) => void;
  onOpenAddTransaction: () => void;
  onOpenVoiceModal: () => void;
  onOpenEmergencyAction: (mode: 'deposit' | 'withdraw' | 'configure') => void;
  onOpenLoanPayment: (loan: Loan) => void;
  onToggleReminder: (id: string) => void;
  onOpenAddReminder: () => void;
  onOpenEditReminder: (reminder: FinancialReminder) => void;
  onDeleteReminder: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  categories,
  goals,
  emergencyFund,
  loans,
  reminders,
  settings,
  onNavigate,
  onOpenAddTransaction,
  onOpenVoiceModal,
  onOpenEmergencyAction,
  onOpenLoanPayment,
  onToggleReminder,
  onOpenAddReminder,
  onOpenEditReminder,
  onDeleteReminder,
}) => {
  const isNight = settings?.nightMode && settings?.theme !== 'light';

  const { totalBalance, totalIncome, totalExpense, monthIncome, monthExpense } =
    calculateTotals(transactions);
  const loanStats = calculateLoanTotals(loans);
  const goalStats = calculateGoalsTotals(goals);
  const monthlyComparison = calculateMonthlyComparison(transactions);

  const emergencyProgress =
    emergencyFund.targetAmount > 0
      ? Math.min(100, Math.round((emergencyFund.currentAmount / emergencyFund.targetAmount) * 100))
      : 0;

  // Recent 5 transactions
  const recentTransactions = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime() ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const getCategory = (catId: string) => {
    return (
      categories.find((c) => c.id === catId) || {
        name: 'Другое',
        icon: 'Tag',
        color: '#64748b',
      }
    );
  };

  return (
    <div id="dashboard-view" className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner with Voice Quick Banner */}
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border backdrop-blur-xl shadow-xl transition-all ${
          isNight
            ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-teal-950/40 border-emerald-500/20 shadow-emerald-950/30'
            : 'bg-white border-slate-200/90 shadow-slate-200/50'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3
              className={`font-bold text-base sm:text-lg ${
                isNight ? 'text-white' : 'text-slate-900'
              }`}
            >
              Приветствуем в ФинПомощнике!
            </h3>
            <p
              className={`text-xs sm:text-sm ${
                isNight ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Ваш баланс синхронизирован, используйте голос или формы для новых операций.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => {
              playSound('voice');
              onOpenVoiceModal();
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 font-semibold text-xs sm:text-sm transition-all"
          >
            <Mic className="w-4 h-4 animate-pulse text-emerald-500" />
            <span>Сказать команду</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              onOpenAddTransaction();
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить</span>
          </button>
        </div>
      </div>

      {/* Main KPI Financial Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* 1. Общий баланс */}
        <div
          id="kpi-total-balance-card"
          className={`relative overflow-hidden rounded-3xl p-6 border backdrop-blur-xl shadow-xl transition-all duration-300 group ${
            isNight
              ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900/90 to-slate-950 border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-emerald-950/50'
              : 'bg-white border-slate-200/90 shadow-slate-200/50 hover:border-emerald-400'
          }`}
        >
          <div
            className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-2xl transition-all ${
              isNight
                ? 'bg-emerald-500/15 group-hover:bg-emerald-500/25'
                : 'bg-emerald-100 group-hover:bg-emerald-200'
            }`}
          />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Wallet className="w-4 h-4" />
              <span>💰 Общий баланс</span>
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/30">
              Доходы − Расходы
            </span>
          </div>

          <div
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight relative z-10 ${
              totalBalance >= 0
                ? isNight
                  ? 'text-white'
                  : 'text-slate-900'
                : 'text-rose-500'
            }`}
          >
            <AnimatedNumber
              id="total-balance-value"
              value={totalBalance}
              currency={settings.currency}
              className={
                totalBalance >= 0
                  ? isNight
                    ? 'text-white'
                    : 'text-slate-900'
                  : 'text-rose-500'
              }
            />
          </div>

          <div
            className={`mt-4 pt-4 border-t flex items-center justify-between text-xs relative z-10 ${
              isNight
                ? 'border-white/10 text-slate-400'
                : 'border-slate-100 text-slate-600'
            }`}
          >
            <span>
              Все доходы:{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">
                +{totalIncome.toLocaleString('ru-RU')} {settings.currency}
              </strong>
            </span>
            <span>
              Расходы:{' '}
              <strong className="text-rose-600 dark:text-rose-400">
                −{totalExpense.toLocaleString('ru-RU')} {settings.currency}
              </strong>
            </span>
          </div>
        </div>

        {/* 2. Доходы */}
        <div
          id="kpi-income-card"
          className={`rounded-3xl p-6 border backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl ${
            isNight
              ? 'bg-slate-900/80 border-white/10 hover:border-emerald-500/30'
              : 'bg-white border-slate-200/90 shadow-slate-200/50 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>📈 Доходы</span>
            </span>
            <span className="text-[11px] text-slate-500">Всего за всё время</span>
          </div>

          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            <AnimatedNumber
              value={totalIncome}
              prefix="+"
              currency={settings.currency}
              className="text-emerald-600 dark:text-emerald-400"
            />
          </div>

          <div
            className={`mt-4 pt-4 border-t flex items-center justify-between text-xs ${
              isNight
                ? 'border-white/10 text-slate-400'
                : 'border-slate-100 text-slate-600'
            }`}
          >
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>Заработано за месяц:</span>
            </span>
            <strong className="text-emerald-600 dark:text-emerald-300 font-bold">
              +{monthIncome.toLocaleString('ru-RU')} {settings.currency}
            </strong>
          </div>
        </div>

        {/* 3. Расходы */}
        <div
          id="kpi-expense-card"
          className={`rounded-3xl p-6 border backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl ${
            isNight
              ? 'bg-slate-900/80 border-white/10 hover:border-rose-500/30'
              : 'bg-white border-slate-200/90 shadow-slate-200/50 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" />
              <span>📉 Расходы</span>
            </span>
            <span className="text-[11px] text-slate-500">Всего за всё время</span>
          </div>

          <div className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400">
            <AnimatedNumber
              value={totalExpense}
              prefix="−"
              currency={settings.currency}
              className="text-rose-600 dark:text-rose-400"
            />
          </div>

          <div
            className={`mt-4 pt-4 border-t flex items-center justify-between text-xs ${
              isNight
                ? 'border-white/10 text-slate-400'
                : 'border-slate-100 text-slate-600'
            }`}
          >
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span>Потрачено за месяц:</span>
            </span>
            <strong className="text-rose-600 dark:text-rose-300 font-bold">
              −{monthExpense.toLocaleString('ru-RU')} {settings.currency}
            </strong>
          </div>
        </div>
      </div>

      {/* NEW REQUESTED FEATURE: Monthly Comparison Card with Dynamic Arrows */}
      <MonthlyComparisonCard
        data={monthlyComparison}
        settings={settings}
        isNight={isNight}
      />

      {/* NEW REQUESTED FEATURE: Financial Reminders Widget */}
      <RemindersWidget
        reminders={reminders}
        settings={settings}
        onToggleReminder={onToggleReminder}
        onOpenAddReminder={onOpenAddReminder}
        onOpenEditReminder={onOpenEditReminder}
        onDeleteReminder={onDeleteReminder}
        isNight={isNight}
      />

      {/* Secondary Strategic Modules: Loans, Goals, Emergency Fund */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 💳 Кредиты Card */}
        <div
          id="dashboard-loans-card"
          className={`rounded-3xl p-6 border backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4 transition-all group ${
            isNight
              ? 'bg-slate-900/80 border-cyan-500/20 hover:border-cyan-500/40'
              : 'bg-white border-slate-200/90 shadow-slate-200/50 hover:border-cyan-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-500">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4
                  className={`font-bold text-base ${
                    isNight ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  💳 Кредиты
                </h4>
                <p className="text-xs text-slate-500">
                  Активных:{' '}
                  <strong className="text-cyan-600 dark:text-cyan-300">
                    {loanStats.activeCount}
                  </strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('loans')}
              className={`p-1.5 rounded-full transition-all ${
                isNight
                  ? 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div
              className={`flex justify-between items-center ${
                isNight ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              <span>Общий долг:</span>
              <span
                className={`font-bold text-sm ${
                  isNight ? 'text-white' : 'text-slate-900'
                }`}
              >
                {loanStats.totalInitial.toLocaleString('ru-RU')} {settings.currency}
              </span>
            </div>

            <div
              className={`flex justify-between items-center ${
                isNight ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              <span>Выплачено:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {loanStats.totalPaid.toLocaleString('ru-RU')} {settings.currency}
              </span>
            </div>

            <div
              className={`flex justify-between items-center ${
                isNight ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              <span>Осталось:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                {loanStats.totalRemaining.toLocaleString('ru-RU')} {settings.currency}
              </span>
            </div>

            <div className="pt-1">
              <div className="flex justify-between items-center text-xs mb-1 font-semibold text-cyan-600 dark:text-cyan-300">
                <span>Прогресс погашения</span>
                <span>{loanStats.overallProgress}%</span>
              </div>
              <AnimatedProgressBar
                percentage={loanStats.overallProgress}
                color="bg-gradient-to-r from-cyan-500 to-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            {loans.length > 0 && loans[0] && !loans[0].isCompleted && (
              <button
                onClick={() => onOpenLoanPayment(loans[0])}
                className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-600/15 hover:bg-cyan-600/25 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Внести платёж</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('loans')}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                isNight
                  ? 'bg-white/5 hover:bg-white/10 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Подробнее
            </button>
          </div>
        </div>

        {/* 🐷 Копилки Card */}
        <div
          id="dashboard-goals-card"
          className={`rounded-3xl p-6 border backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4 transition-all group ${
            isNight
              ? 'bg-slate-900/80 border-purple-500/20 hover:border-purple-500/40'
              : 'bg-white border-slate-200/90 shadow-slate-200/50 hover:border-purple-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-500">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <h4
                  className={`font-bold text-base ${
                    isNight ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  🐷 Копилки
                </h4>
                <p className="text-xs text-slate-500">
                  Целей:{' '}
                  <strong className="text-purple-600 dark:text-purple-300">
                    {goalStats.count}
                  </strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('goals')}
              className={`p-1.5 rounded-full transition-all ${
                isNight
                  ? 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div
              className={`flex justify-between items-center ${
                isNight ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              <span>Всего накоплено:</span>
              <span className="font-bold text-purple-600 dark:text-purple-300 text-sm">
                {goalStats.totalSaved.toLocaleString('ru-RU')} {settings.currency}
              </span>
            </div>

            {goalStats.nearestGoal ? (
              <div
                className={`p-3 rounded-2xl border space-y-2 ${
                  isNight
                    ? 'bg-white/5 border-white/10'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div
                  className={`flex items-center justify-between ${
                    isNight ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  <span
                    className={`font-semibold truncate max-w-[130px] ${
                      isNight ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    🎯 {goalStats.nearestGoal.title}
                  </span>
                  <span className="font-bold text-purple-600 dark:text-purple-300">
                    {goalStats.nearestGoalProgress}%
                  </span>
                </div>
                <AnimatedProgressBar
                  percentage={goalStats.nearestGoalProgress}
                  color="bg-gradient-to-r from-purple-500 to-pink-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>
                    {goalStats.nearestGoal.currentAmount.toLocaleString('ru-RU')}{' '}
                    {settings.currency}
                  </span>
                  <span>
                    {goalStats.nearestGoal.targetAmount.toLocaleString('ru-RU')}{' '}
                    {settings.currency}
                  </span>
                </div>
                {/* Mini Sparkline for nearest goal */}
                <div
                  className={`pt-1 border-t ${
                    isNight ? 'border-white/5' : 'border-slate-200'
                  }`}
                >
                  <SparklineChart
                    history={goalStats.nearestGoal.history}
                    currentAmount={goalStats.nearestGoal.currentAmount}
                    createdAt={goalStats.nearestGoal.createdAt}
                    color={goalStats.nearestGoal.color || '#a855f7'}
                    height={36}
                    currency={settings.currency}
                    showDots={false}
                    showTrendBadge={true}
                    showTooltip={true}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-slate-400">
                Нет активных целей
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('goals')}
              className="w-full py-2.5 px-3 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Создать новую цель</span>
            </button>
          </div>
        </div>

        {/* 🛡️ На чёрный день (Финансовая подушка) */}
        <div
          id="dashboard-emergency-card"
          className={`rounded-3xl p-6 border backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4 transition-all group ${
            isNight
              ? 'bg-slate-900/80 border-emerald-500/25 hover:border-emerald-500/50'
              : 'bg-white border-slate-200/90 shadow-slate-200/50 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4
                  className={`font-bold text-base ${
                    isNight ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  🛡️ Финансовая подушка
                </h4>
                <p className="text-xs text-slate-500">Резерв на чёрный день</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('emergency')}
              className={`p-1.5 rounded-full transition-all ${
                isNight
                  ? 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span
                className={`text-2xl font-bold ${
                  isNight ? 'text-white' : 'text-slate-900'
                }`}
              >
                {emergencyFund.currentAmount.toLocaleString('ru-RU')} {settings.currency}
              </span>
              <span className="text-xs text-slate-500">
                из {emergencyFund.targetAmount.toLocaleString('ru-RU')}{' '}
                {settings.currency}
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1 font-semibold text-emerald-600 dark:text-emerald-300">
                <span>Готовность подушки</span>
                <span>{emergencyProgress}%</span>
              </div>
              <AnimatedProgressBar
                percentage={emergencyProgress}
                color="bg-gradient-to-r from-emerald-500 to-teal-400"
              />
            </div>

            {/* Mini Sparkline for Emergency fund dynamics */}
            <div
              className={`pt-1 border-t ${
                isNight ? 'border-white/5' : 'border-slate-200'
              }`}
            >
              <SparklineChart
                history={emergencyFund.history}
                currentAmount={emergencyFund.currentAmount}
                createdAt={emergencyFund.updatedAt}
                color="#10b981"
                height={36}
                currency={settings.currency}
                showDots={false}
                showTrendBadge={true}
                showTooltip={true}
              />
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => onOpenEmergencyAction('deposit')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Пополнить</span>
            </button>
            <button
              onClick={() => onOpenEmergencyAction('withdraw')}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                isNight
                  ? 'bg-white/5 hover:bg-white/10 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Снять
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div
        className={`rounded-3xl p-6 border backdrop-blur-xl shadow-xl space-y-4 ${
          isNight
            ? 'bg-slate-900/80 border-white/10'
            : 'bg-white border-slate-200/90 shadow-slate-200/50'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4
              className={`font-bold text-base flex items-center gap-2 ${
                isNight ? 'text-white' : 'text-slate-900'
              }`}
            >
              📜 Последние операции
            </h4>
            <p className="text-xs text-slate-500">Недавние движения средств</p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Вся история ({transactions.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-sm">Операций пока нет. Добавьте первую операцию!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => {
              const cat = getCategory(tx.categoryId);
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  id={`dashboard-tx-${tx.id}`}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all duration-200 ${
                    isNight
                      ? 'bg-white/5 hover:bg-white/10 border-white/5'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <div
                        className={`font-semibold text-sm truncate max-w-[200px] sm:max-w-md ${
                          isNight ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {cat.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[180px] sm:max-w-sm">
                        {tx.description || tx.date}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-bold text-sm sm:text-base tabular-nums ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '−'}
                      {tx.amount.toLocaleString('ru-RU')} {settings.currency}
                    </div>
                    <div className="text-[11px] text-slate-400">{tx.date}</div>
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
