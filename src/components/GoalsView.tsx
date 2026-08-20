import React, { useState, useMemo } from 'react';
import { SavingsGoal, AppSettings } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { AnimatedProgressBar } from './AnimatedProgressBar';
import { SparklineChart, buildAccumulatedTimeline } from './SparklineChart';
import {
  PiggyBank,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  History,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { playSound } from '../services/sound';

interface GoalsViewProps {
  goals: SavingsGoal[];
  settings: AppSettings;
  onOpenCreateGoal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (goalId: string) => void;
  onOpenActionModal: (goal: SavingsGoal, mode: 'deposit' | 'withdraw') => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  settings,
  onOpenCreateGoal,
  onEditGoal,
  onDeleteGoal,
  onOpenActionModal,
}) => {
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);
  const [expandedHistoryGoalId, setExpandedHistoryGoalId] = useState<string | null>(null);

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const completedCount = goals.filter((g) => g.currentAmount >= g.targetAmount).length;

  const calculateDaysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Срок истёк';
    if (days === 0) return 'Сегодня';
    return `Осталось ${days} дн.`;
  };

  // Aggregated total savings timeline across all goals
  const totalSavingsTimeline = useMemo(() => {
    const allHistory: Array<{ date: string; amount: number; type: 'deposit' | 'withdraw'; note?: string }> = [];
    goals.forEach((g) => {
      (g.history || []).forEach((h) => {
        allHistory.push({
          date: h.date,
          amount: h.amount,
          type: h.type,
          note: `${g.title}: ${h.note || (h.type === 'deposit' ? 'Пополнение' : 'Снятие')}`,
        });
      });
    });
    return buildAccumulatedTimeline(allHistory, totalSaved);
  }, [goals, totalSaved]);

  return (
    <div id="goals-view" className="space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            🐷 Копилки и финансовые цели
          </h3>
          <p className="text-xs text-slate-400">
            Накоплено: <strong className="text-purple-300">{totalSaved.toLocaleString('ru-RU')} {settings.currency}</strong> из {totalTarget.toLocaleString('ru-RU')} {settings.currency} (Выполнено: {completedCount}/{goals.length})
          </p>
        </div>

        <button
          onClick={() => {
            playSound('click');
            onOpenCreateGoal();
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-500/25 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Создать копилку</span>
        </button>
      </div>

      {/* Aggregate Savings Dynamics Card (when at least 1 goal exists) */}
      {goals.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-purple-500/20 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Общая динамика всех накоплений</h4>
                <p className="text-xs text-slate-400">
                  Совокупный график роста средств по всем активным копилкам
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Всего в целях</span>
              <span className="text-lg font-black text-purple-300">
                {totalSaved.toLocaleString('ru-RU')} {settings.currency}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <SparklineChart
              points={totalSavingsTimeline}
              color="#a855f7"
              height={64}
              currency={settings.currency}
              showDots={true}
              showTrendBadge={true}
              showTooltip={true}
              showMinMaxLabels={true}
            />
          </div>
        </div>
      )}

      {/* Goals Cards List */}
      {goals.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-white/10 text-center text-slate-400 space-y-4">
          <PiggyBank className="w-12 h-12 mx-auto text-purple-400 opacity-60" />
          <div>
            <h4 className="font-bold text-white text-base">У вас пока нет активных целей</h4>
            <p className="text-xs text-slate-400 mt-1">
              Создайте копилку на покупку гаджета, отпуск или автомобиль и отслеживайте прогресс!
            </p>
          </div>
          <button
            onClick={onOpenCreateGoal}
            className="px-5 py-2.5 rounded-xl bg-purple-500 text-white text-xs font-bold shadow-lg"
          >
            + Создать первую копилку
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const daysText = calculateDaysLeft(goal.deadline);
            const isHistoryOpen = expandedHistoryGoalId === goal.id;

            return (
              <div
                key={goal.id}
                id={`goal-card-${goal.id}`}
                className={`p-6 rounded-3xl bg-slate-900/80 border backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-5 transition-all duration-300 ${
                  isCompleted
                    ? 'border-emerald-500/50 shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                    : 'border-white/10 hover:border-purple-500/30'
                }`}
              >
                {/* Header of Goal Card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
                      style={{ backgroundColor: goal.color || '#8b5cf6' }}
                    >
                      <CategoryIcon name={goal.icon || 'Sparkles'} className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-white">{goal.title}</h4>
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Достигнута!
                          </span>
                        )}
                      </div>
                      {goal.deadline && (
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />
                          <span>{goal.deadline}</span>
                          {daysText && <span className="text-purple-300 font-semibold">({daysText})</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditGoal(goal)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
                      title="Редактировать цель"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setGoalToDelete(goal)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400"
                      title="Удалить цель"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar & Amounts */}
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block">Накоплено</span>
                      <span className="text-2xl font-extrabold text-white">
                        {goal.currentAmount.toLocaleString('ru-RU')} {settings.currency}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Цель</span>
                      <span className="text-sm font-bold text-slate-300">
                        {goal.targetAmount.toLocaleString('ru-RU')} {settings.currency}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-purple-300 mb-1">
                      <span>Прогресс: {pct}%</span>
                      {!isCompleted && <span>Осталось: {remaining.toLocaleString('ru-RU')} {settings.currency}</span>}
                    </div>
                    <AnimatedProgressBar
                      percentage={pct}
                      color={isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-purple-500 to-pink-500'}
                    />
                  </div>
                </div>

                {/* Sparkline Dynamics Graph for this goal */}
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                  <SparklineChart
                    history={goal.history}
                    currentAmount={goal.currentAmount}
                    createdAt={goal.createdAt}
                    targetAmount={goal.targetAmount}
                    color={goal.color || '#8b5cf6'}
                    height={46}
                    currency={settings.currency}
                    label="Динамика накоплений"
                    showDots={true}
                    showTrendBadge={true}
                    showTooltip={true}
                  />
                </div>

                {/* Action buttons */}
                <div className="pt-2 flex items-center gap-2 border-t border-white/5">
                  <button
                    onClick={() => onOpenActionModal(goal, 'deposit')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Пополнить</span>
                  </button>

                  <button
                    onClick={() => onOpenActionModal(goal, 'withdraw')}
                    disabled={goal.currentAmount <= 0}
                    className="py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold transition-all flex items-center gap-1"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Снять</span>
                  </button>

                  {goal.history && goal.history.length > 0 && (
                    <button
                      onClick={() => setExpandedHistoryGoalId(isHistoryOpen ? null : goal.id)}
                      className={`p-2.5 rounded-xl border text-xs transition-all ${
                        isHistoryOpen
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                      title="История пополнений"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Deposit History Dropdown */}
                {isHistoryOpen && goal.history && goal.history.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2 text-xs">
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      История операций копилки:
                    </div>
                    <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1.5">
                      {goal.history.map((h, i) => (
                        <div key={i} className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-500">{h.date}</span>
                          <span className="text-slate-400 truncate max-w-[120px]">{h.note || (h.type === 'deposit' ? 'Пополнение' : 'Снятие')}</span>
                          <span className={`font-bold ${h.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {h.type === 'deposit' ? '+' : '−'}{h.amount.toLocaleString('ru-RU')} {settings.currency}
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

      {/* Delete Goal Safeguard */}
      {goalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base">Удалить копилку?</h4>
                <p className="text-xs text-slate-400">«{goalToDelete.title}»</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Копилка с накопленной суммой <strong>{goalToDelete.currentAmount.toLocaleString('ru-RU')} {settings.currency}</strong> будет удалена.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setGoalToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  playSound('delete');
                  onDeleteGoal(goalToDelete.id);
                  setGoalToDelete(null);
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
