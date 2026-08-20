import React, { useState } from 'react';
import {
  FinancialReminder,
  AppSettings,
  ReminderCategory,
} from '../types';
import {
  Bell,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  CreditCard,
  Zap,
  PiggyBank,
  RefreshCw,
  Tag,
  Clock,
  ChevronRight,
  Sparkles,
  Edit2,
  Trash2,
} from 'lucide-react';
import { playSound } from '../services/sound';

interface RemindersWidgetProps {
  reminders: FinancialReminder[];
  settings: AppSettings;
  onToggleReminder: (id: string) => void;
  onOpenAddReminder: () => void;
  onOpenEditReminder: (reminder: FinancialReminder) => void;
  onDeleteReminder: (id: string) => void;
  isNight?: boolean;
}

export const RemindersWidget: React.FC<RemindersWidgetProps> = ({
  reminders,
  settings,
  onToggleReminder,
  onOpenAddReminder,
  onOpenEditReminder,
  onDeleteReminder,
  isNight = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  const todayStr = new Date().toISOString().split('T')[0];

  const getCategoryMeta = (cat: ReminderCategory) => {
    switch (cat) {
      case 'loan':
        return { label: 'Кредит', icon: <CreditCard className="w-3.5 h-3.5" />, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
      case 'bill':
        return { label: 'Счёт/ЖКХ', icon: <Zap className="w-3.5 h-3.5" />, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'goal':
        return { label: 'Копилка', icon: <PiggyBank className="w-3.5 h-3.5" />, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      case 'subscription':
        return { label: 'Подписка', icon: <RefreshCw className="w-3.5 h-3.5" />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      default:
        return { label: 'Заметка', icon: <Tag className="w-3.5 h-3.5" />, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
    }
  };

  const getDueStatus = (dueDate: string, isCompleted: boolean) => {
    if (isCompleted) {
      return {
        label: 'Выполнено',
        badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        isUrgent: false,
      };
    }

    const due = new Date(dueDate).getTime();
    const today = new Date(todayStr).getTime();
    const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Просрочено на ${Math.abs(diffDays)} дн.`,
        badgeClass: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40 animate-pulse font-bold',
        isUrgent: true,
      };
    } else if (diffDays === 0) {
      return {
        label: 'Сегодня!',
        badgeClass: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 font-bold animate-pulse',
        isUrgent: true,
      };
    } else if (diffDays === 1) {
      return {
        label: 'Завтра',
        badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold',
        isUrgent: false,
      };
    } else if (diffDays <= 3) {
      return {
        label: `Через ${diffDays} дня`,
        badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
        isUrgent: false,
      };
    } else {
      return {
        label: `До ${dueDate}`,
        badgeClass: 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 border-transparent',
        isUrgent: false,
      };
    }
  };

  const pendingCount = reminders.filter((r) => !r.isCompleted).length;
  const overdueCount = reminders.filter((r) => !r.isCompleted && r.dueDate < todayStr).length;

  const filteredReminders = reminders
    .filter((r) => {
      if (filter === 'pending') return !r.isCompleted;
      if (filter === 'completed') return r.isCompleted;
      return true;
    })
    .sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  return (
    <div
      id="dashboard-reminders-widget"
      className={`rounded-3xl p-6 border backdrop-blur-xl transition-all duration-300 shadow-xl relative overflow-hidden space-y-4 ${
        isNight
          ? 'bg-slate-900/80 border-amber-500/20 shadow-amber-950/20'
          : 'bg-white border-slate-200/90 shadow-slate-200/50'
      }`}
    >
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <span>Финансовые напоминания</span>
              {pendingCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                  {pendingCount} активных
                </span>
              )}
              {overdueCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold border border-rose-500/30 animate-pulse">
                  {overdueCount} просрочено
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              График платежей, продление подписок и запланированные расходы
            </p>
          </div>
        </div>

        {/* Add Reminder CTA */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              playSound('click');
              onOpenAddReminder();
            }}
            id="add-reminder-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Напоминание</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setFilter('pending');
            playSound('click');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'pending'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
          }`}
        >
          Предстоящие ({reminders.filter((r) => !r.isCompleted).length})
        </button>

        <button
          onClick={() => {
            setFilter('all');
            playSound('click');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
          }`}
        >
          Все ({reminders.length})
        </button>

        <button
          onClick={() => {
            setFilter('completed');
            playSound('click');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'completed'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
          }`}
        >
          Выполненные ({reminders.filter((r) => r.isCompleted).length})
        </button>
      </div>

      {/* List of Reminders */}
      {filteredReminders.length === 0 ? (
        <div className="py-8 text-center text-slate-400 space-y-3">
          <p className="text-xs sm:text-sm">
            {filter === 'pending'
              ? '🎉 Все напоминания выполнены! Нет предстоящих платежей.'
              : filter === 'completed'
              ? 'Пока нет завершенных напоминаний.'
              : 'Список напоминаний пуст. Создайте первое напоминание!'}
          </p>
          <button
            onClick={() => {
              playSound('click');
              onOpenAddReminder();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 font-semibold text-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Добавить напоминание</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredReminders.map((rem) => {
            const catMeta = getCategoryMeta(rem.category);
            const dueStatus = getDueStatus(rem.dueDate, rem.isCompleted);

            return (
              <div
                key={rem.id}
                id={`reminder-item-${rem.id}`}
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  rem.isCompleted
                    ? 'opacity-60 bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5'
                    : dueStatus.isUrgent
                    ? isNight
                      ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/60'
                      : 'bg-amber-50/70 border-amber-300 hover:border-amber-400'
                    : isNight
                    ? 'bg-white/5 border-white/10 hover:border-white/20'
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Left side: Checkbox + Title + Meta */}
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => {
                      playSound('success');
                      onToggleReminder(rem.id);
                    }}
                    title={rem.isCompleted ? 'Отметить как невыполненное' : 'Отметить как выполненное'}
                    className="mt-0.5 p-1 text-amber-500 hover:scale-110 transition-transform shrink-0"
                  >
                    {rem.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400 hover:text-amber-500" />
                    )}
                  </button>

                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-semibold text-sm truncate ${
                          rem.isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'
                        }`}
                      >
                        {rem.title}
                      </span>

                      {/* Category Badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border font-medium ${catMeta.color}`}
                      >
                        {catMeta.icon}
                        <span>{catMeta.label}</span>
                      </span>

                      {/* Due Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border ${dueStatus.badgeClass}`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{dueStatus.label}</span>
                      </span>
                    </div>

                    {/* Notes & details */}
                    {rem.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {rem.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side: Amount + Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pl-8 sm:pl-0 shrink-0">
                  {rem.amount !== undefined && (
                    <div className="text-right">
                      <div className="font-extrabold text-sm sm:text-base text-amber-600 dark:text-amber-300 tabular-nums">
                        {rem.amount.toLocaleString('ru-RU')} {settings.currency}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {rem.recurring === 'monthly'
                          ? 'Ежемесячно'
                          : rem.recurring === 'weekly'
                          ? 'Еженедельно'
                          : rem.recurring === 'yearly'
                          ? 'Ежегодно'
                          : 'Однократно'}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        playSound('click');
                        onOpenEditReminder(rem);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                      title="Редактировать"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        playSound('delete');
                        onDeleteReminder(rem.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      title="Удалить"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
