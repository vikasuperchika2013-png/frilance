import React, { useState, useEffect } from 'react';
import {
  FinancialReminder,
  ReminderCategory,
  ReminderRecurring,
  ReminderPriority,
  AppSettings,
  Loan,
  SavingsGoal,
} from '../types';
import {
  X,
  Bell,
  Calendar,
  CreditCard,
  Zap,
  PiggyBank,
  RefreshCw,
  Tag,
  AlertTriangle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { playSound } from '../services/sound';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveReminder: (reminder: FinancialReminder) => void;
  onDeleteReminder?: (id: string) => void;
  reminderToEdit?: FinancialReminder | null;
  settings: AppSettings;
  loans?: Loan[];
  goals?: SavingsGoal[];
  isNight?: boolean;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  onSaveReminder,
  onDeleteReminder,
  reminderToEdit,
  settings,
  loans = [],
  goals = [],
  isNight = false,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [category, setCategory] = useState<ReminderCategory>('bill');
  const [recurring, setRecurring] = useState<ReminderRecurring>('monthly');
  const [priority, setPriority] = useState<ReminderPriority>('medium');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (reminderToEdit) {
      setTitle(reminderToEdit.title);
      setAmount(reminderToEdit.amount ? reminderToEdit.amount.toString() : '');
      setDueDate(reminderToEdit.dueDate);
      setCategory(reminderToEdit.category);
      setRecurring(reminderToEdit.recurring);
      setPriority(reminderToEdit.priority);
      setNotes(reminderToEdit.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setDueDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
      setCategory('bill');
      setRecurring('monthly');
      setPriority('medium');
      setNotes('');
    }
  }, [reminderToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const reminder: FinancialReminder = {
      id: reminderToEdit ? reminderToEdit.id : `rem_${Date.now()}`,
      title: title.trim(),
      amount: amount ? Math.max(0, parseFloat(amount) || 0) : undefined,
      dueDate,
      category,
      recurring,
      priority,
      notes: notes.trim() || undefined,
      isCompleted: reminderToEdit ? reminderToEdit.isCompleted : false,
      createdAt: reminderToEdit ? reminderToEdit.createdAt : new Date().toISOString(),
    };

    playSound('success');
    onSaveReminder(reminder);
    onClose();
  };

  const categoriesList: { id: ReminderCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'bill', label: 'Счета и ЖКХ', icon: <Zap className="w-4 h-4" /> },
    { id: 'loan', label: 'Кредит / Долг', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'goal', label: 'Копилка / Цель', icon: <PiggyBank className="w-4 h-4" /> },
    { id: 'subscription', label: 'Подписка', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'other', label: 'Другое', icon: <Tag className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        id="reminder-modal-content"
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl transition-all space-y-6 max-h-[92vh] overflow-y-auto border ${
          isNight
            ? 'bg-slate-900 border-emerald-500/30 text-white shadow-emerald-950/60'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-inherit pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-500/30 text-white shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {reminderToEdit ? 'Редактировать напоминание' : 'Новое финансовое напоминание'}
              </h3>
              <p className="text-xs text-slate-500">
                Запланируйте платеж, дату погашения кредита или подписку
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestions from Active Loans & Goals */}
        {!reminderToEdit && (loans.length > 0 || goals.length > 0) && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Быстрое заполнение из ваших данных:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {loans
                .filter((l) => !l.isCompleted)
                .slice(0, 2)
                .map((loan) => (
                  <button
                    key={loan.id}
                    type="button"
                    onClick={() => {
                      setTitle(`Платёж по кредиту: ${loan.title}`);
                      setAmount(loan.monthlyPayment > 0 ? loan.monthlyPayment.toString() : '');
                      setCategory('loan');
                      setPriority('high');
                      playSound('click');
                    }}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all text-left flex items-center gap-1.5 ${
                      isNight
                        ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50'
                        : 'bg-cyan-50 border-cyan-200 text-cyan-800 hover:bg-cyan-100'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{loan.title} ({loan.monthlyPayment.toLocaleString('ru-RU')} {settings.currency})</span>
                  </button>
                ))}

              {goals
                .filter((g) => !g.isCompleted)
                .slice(0, 2)
                .map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => {
                      setTitle(`Пополнение копилки: ${goal.title}`);
                      setCategory('goal');
                      setPriority('medium');
                      playSound('click');
                    }}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all text-left flex items-center gap-1.5 ${
                      isNight
                        ? 'bg-purple-950/40 border-purple-500/30 text-purple-300 hover:bg-purple-900/50'
                        : 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100'
                    }`}
                  >
                    <PiggyBank className="w-3.5 h-3.5" />
                    <span>{goal.title}</span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Название напоминания *
            </label>
            <input
              id="reminder-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Оплата интернета, Платёж по рассрочке"
              className={`w-full rounded-2xl px-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                isNight
                  ? 'bg-slate-950 border-white/15 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Amount & Date in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Сумма ({settings.currency}) (Необязательно)
              </label>
              <input
                id="reminder-amount-input"
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className={`w-full rounded-2xl px-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                  isNight
                    ? 'bg-slate-950 border-white/15 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Дата платежа / события *</span>
              </label>
              <input
                id="reminder-date-input"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full rounded-2xl px-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                  isNight
                    ? 'bg-slate-950 border-white/15 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Category Chip Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Категория
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categoriesList.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id);
                    playSound('click');
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                    category === cat.id
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
                      : isNight
                      ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.icon}
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recurring & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5 flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Повторение</span>
              </label>
              <select
                id="reminder-recurring-select"
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as ReminderRecurring)}
                className={`w-full rounded-2xl px-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                  isNight
                    ? 'bg-slate-950 border-white/15 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="none">Без повтора (Однократно)</option>
                <option value="monthly">Каждый месяц</option>
                <option value="weekly">Каждую неделю</option>
                <option value="yearly">Каждый год</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Приоритет</span>
              </label>
              <select
                id="reminder-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as ReminderPriority)}
                className={`w-full rounded-2xl px-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                  isNight
                    ? 'bg-slate-950 border-white/15 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="high">🔴 Высокий (Срочно)</option>
                <option value="medium">🟡 Средний</option>
                <option value="low">🟢 Обычный</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Заметка / Комментарий</span>
            </label>
            <input
              id="reminder-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Номер договора, ссылка или заметка"
              className={`w-full rounded-2xl px-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                isNight
                  ? 'bg-slate-950 border-white/15 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-inherit">
            {reminderToEdit && onDeleteReminder && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Удалить это напоминание?')) {
                    playSound('delete');
                    onDeleteReminder(reminderToEdit.id);
                    onClose();
                  }
                }}
                className="px-4 py-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 font-bold text-sm transition-all"
              >
                Удалить
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all"
            >
              Отмена
            </button>

            <button
              type="submit"
              id="save-reminder-btn"
              className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-98"
            >
              {reminderToEdit ? 'Сохранить изменения' : 'Создать напоминание'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
