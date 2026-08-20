import React, { useState, useMemo } from 'react';
import { Transaction, Category, TransactionType, AppSettings } from '../types';
import { CategoryIcon } from './CategoryIcon';
import {
  Search,
  Plus,
  ArrowUpDown,
  Filter,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  X,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { playSound } from '../services/sound';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  settings: AppSettings;
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (txId: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  categories,
  settings,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const ITEMS_PER_PAGE = 8;
  const isNight = settings.nightMode && settings.theme !== 'light';

  const getCategory = (catId: string) => {
    return (
      categories.find((c) => c.id === catId) || {
        name: 'Другое',
        icon: 'Tag',
        color: '#64748b',
      }
    );
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const cat = getCategory(tx.categoryId);
          const matchDesc = (tx.description || '').toLowerCase().includes(term);
          const matchCat = cat.name.toLowerCase().includes(term);
          const matchAmount = tx.amount.toString().includes(term);
          if (!matchDesc && !matchCat && !matchAmount) return false;
        }

        // Type filter
        if (typeFilter !== 'all' && tx.type !== typeFilter) {
          return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) {
          return false;
        }

        // Date range filter
        if (startDate && tx.date < startDate) {
          return false;
        }
        if (endDate && tx.date > endDate) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return (
            new Date(b.date).getTime() - new Date(a.date).getTime() ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        if (sortBy === 'date_asc') {
          return (
            new Date(a.date).getTime() - new Date(b.date).getTime() ||
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
        if (sortBy === 'amount_desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount_asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, searchTerm, typeFilter, categoryFilter, startDate, endDate, sortBy, categories]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Filtered Totals
  const filteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleDeleteConfirm = () => {
    if (txToDelete) {
      playSound('delete');
      onDeleteTransaction(txToDelete.id);
      setTxToDelete(null);
    }
  };

  const exportCSV = () => {
    playSound('coin');
    const headers = ['ID', 'Тип', 'Сумма', 'Категория', 'Дата', 'Описание'];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.type === 'income' ? 'Доход' : 'Расход',
      tx.amount,
      getCategory(tx.categoryId).name,
      tx.date,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `operations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="transactions-view" className="space-y-6 pb-20 md:pb-8">
      {/* Top Controls Header */}
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border backdrop-blur-xl shadow-xl transition-all ${
          isNight
            ? 'bg-slate-900/80 border-white/10'
            : 'bg-white border-slate-200/90 shadow-slate-200/50'
        }`}
      >
        <div>
          <h3
            className={`text-xl font-bold flex items-center gap-2 ${
              isNight ? 'text-white' : 'text-slate-900'
            }`}
          >
            📜 История операций
          </h3>
          <p
            className={`text-xs ${
              isNight ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Найдено: <strong>{filteredTransactions.length}</strong> из {transactions.length} операций
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={exportCSV}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isNight
                ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Экспорт в CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Экспорт CSV</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              onOpenAddModal();
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Добавить операцию</span>
          </button>
        </div>
      </div>

      {/* Filtered Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          className={`p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between shadow-md ${
            isNight
              ? 'bg-slate-900/80 border-white/10'
              : 'bg-white border-slate-200/90 shadow-slate-200/40'
          }`}
        >
          <span
            className={`text-xs font-semibold ${
              isNight ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Доходы в выборке:
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
            +{filteredIncome.toLocaleString('ru-RU')} {settings.currency}
          </span>
        </div>
        <div
          className={`p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between shadow-md ${
            isNight
              ? 'bg-slate-900/80 border-white/10'
              : 'bg-white border-slate-200/90 shadow-slate-200/40'
          }`}
        >
          <span
            className={`text-xs font-semibold ${
              isNight ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Расходы в выборке:
          </span>
          <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
            −{filteredExpense.toLocaleString('ru-RU')} {settings.currency}
          </span>
        </div>
        <div
          className={`p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between shadow-md ${
            isNight
              ? 'bg-slate-900/80 border-white/10'
              : 'bg-white border-slate-200/90 shadow-slate-200/40'
          }`}
        >
          <span
            className={`text-xs font-semibold ${
              isNight ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Сальдо за период:
          </span>
          <span
            className={`font-bold text-sm ${
              filteredIncome - filteredExpense >= 0
                ? isNight
                  ? 'text-white'
                  : 'text-slate-900'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {(filteredIncome - filteredExpense).toLocaleString('ru-RU')} {settings.currency}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className={`p-5 rounded-3xl border backdrop-blur-xl shadow-xl space-y-4 ${
          isNight
            ? 'bg-slate-900/80 border-white/10'
            : 'bg-white border-slate-200/90 shadow-slate-200/40'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по описанию, категории, сумме..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full border rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-all ${
                isNight
                  ? 'bg-slate-950/80 border-white/10 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Type Filter Buttons */}
          <div
            className={`md:col-span-3 flex rounded-2xl p-1 border text-xs font-semibold ${
              isNight
                ? 'bg-slate-950/80 border-white/10'
                : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              onClick={() => {
                setTypeFilter('all');
                setCurrentPage(1);
              }}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                typeFilter === 'all'
                  ? isNight
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => {
                setTypeFilter('income');
                setCurrentPage(1);
              }}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                typeFilter === 'income'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-emerald-600 dark:hover:text-white'
              }`}
            >
              Доходы
            </button>
            <button
              onClick={() => {
                setTypeFilter('expense');
                setCurrentPage(1);
              }}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                typeFilter === 'expense'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-rose-600 dark:hover:text-white'
              }`}
            >
              Расходы
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-all ${
                isNight
                  ? 'bg-slate-950/80 border-white/10 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="all">Все категории</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.type === 'income' ? '📈' : '📉'} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setSortBy(e.target.value as any);
              }}
              className={`w-full border rounded-2xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500 transition-all ${
                isNight
                  ? 'bg-slate-950/80 border-white/10 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="date_desc">Дата: новые</option>
              <option value="date_asc">Дата: старые</option>
              <option value="amount_desc">Сумма: больше</option>
              <option value="amount_asc">Сумма: меньше</option>
            </select>
          </div>
        </div>

        {/* Date Range Sub-row */}
        <div
          className={`flex flex-wrap items-center gap-3 pt-2 border-t text-xs ${
            isNight ? 'border-white/5 text-slate-400' : 'border-slate-100 text-slate-600'
          }`}
        >
          <span
            className={`flex items-center gap-1 font-semibold ${
              isNight ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Период:
          </span>
          <div className="flex items-center gap-2">
            <span>С:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className={`border rounded-xl px-2.5 py-1 text-xs ${
                isNight
                  ? 'bg-slate-950/80 border-white/10 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>
          <div className="flex items-center gap-2">
            <span>По:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className={`border rounded-xl px-2.5 py-1 text-xs ${
                isNight
                  ? 'bg-slate-950/80 border-white/10 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>
          {(startDate ||
            endDate ||
            searchTerm ||
            typeFilter !== 'all' ||
            categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setCategoryFilter('all');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              className="ml-auto text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 text-xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>Сбросить фильтры</span>
            </button>
          )}
        </div>
      </div>

      {/* Transaction Records List */}
      <div className="space-y-2.5">
        {paginatedTransactions.length === 0 ? (
          <div
            className={`p-12 text-center rounded-3xl border backdrop-blur-md space-y-2 ${
              isNight
                ? 'bg-slate-900/60 border-white/10 text-slate-400'
                : 'bg-white border-slate-200/90 text-slate-500 shadow-sm'
            }`}
          >
            <p
              className={`text-base font-semibold ${
                isNight ? 'text-white' : 'text-slate-900'
              }`}
            >
              Операций не найдено
            </p>
            <p className="text-xs">
              Попробуйте изменить параметры поиска или добавить новую операцию.
            </p>
          </div>
        ) : (
          paginatedTransactions.map((tx) => {
            const cat = getCategory(tx.categoryId);
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                id={`tx-row-${tx.id}`}
                className={`p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between gap-4 transition-all duration-200 group shadow-sm hover:shadow-md ${
                  isNight
                    ? 'bg-slate-900/80 hover:bg-slate-900 border-white/10'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200/90'
                }`}
              >
                {/* Left: Category Icon & Name */}
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <div
                      className={`font-bold text-sm flex items-center gap-2 ${
                        isNight ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          isIncome
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? 'Доход' : 'Расход'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md mt-0.5">
                      {tx.description || 'Без описания'}
                    </div>
                  </div>
                </div>

                {/* Right: Amount, Date & Actions */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div
                      className={`font-bold text-base sm:text-lg tabular-nums ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '−'}
                      {tx.amount.toLocaleString('ru-RU')} {settings.currency}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{tx.date}</span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditTransaction(tx)}
                      className={`p-2 rounded-xl transition-all ${
                        isNight
                          ? 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                      title="Редактировать операцию"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTxToDelete(tx)}
                      className={`p-2 rounded-xl transition-all ${
                        isNight
                          ? 'bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400'
                          : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600'
                      }`}
                      title="Удалить операцию"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          className={`flex items-center justify-between pt-2 text-xs ${
            isNight ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          <div>
            Страница <strong>{currentPage}</strong> из <strong>{totalPages}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3.5 py-2 rounded-xl disabled:opacity-40 disabled:pointer-events-none transition-all font-semibold ${
                isNight
                  ? 'bg-white/5 hover:bg-white/10 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              Назад
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3.5 py-2 rounded-xl disabled:opacity-40 disabled:pointer-events-none transition-all font-semibold ${
                isNight
                  ? 'bg-white/5 hover:bg-white/10 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              Вперед
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base">Удалить операцию?</h4>
                <p className="text-xs text-slate-400">Это действие нельзя отменить</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 text-xs space-y-1">
              <div>
                Категория:{' '}
                <strong className="text-white">
                  {getCategory(txToDelete.categoryId).name}
                </strong>
              </div>
              <div>
                Сумма:{' '}
                <strong className="text-rose-400">
                  {txToDelete.amount.toLocaleString('ru-RU')} {settings.currency}
                </strong>
              </div>
              <div>
                Дата: <strong className="text-slate-300">{txToDelete.date}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setTxToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all"
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
