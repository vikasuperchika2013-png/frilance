import React, { useState } from 'react';
import { Category, Transaction, TransactionType, AppSettings } from '../types';
import { CategoryIcon } from './CategoryIcon';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Search,
  PieChart,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { playSound } from '../services/sound';
import { DEFAULT_CATEGORIES } from '../services/storage';

interface CategoriesViewProps {
  categories: Category[];
  transactions: Transaction[];
  settings: AppSettings;
  onOpenAddModal: (type?: TransactionType) => void;
  onEditCategory: (cat: Category) => void;
  onDeleteCategory: (catId: string) => void;
  onResetCategories: (defaults: Category[]) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  transactions,
  settings,
  onOpenAddModal,
  onEditCategory,
  onDeleteCategory,
  onResetCategories,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | TransactionType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);

  const isNight = settings.nightMode && settings.theme !== 'light';

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  // Filter list
  const filteredCategories = categories.filter((c) => {
    if (activeTab !== 'all' && c.type !== activeTab) return false;
    if (searchTerm.trim()) {
      return c.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  // Calculate volume & transaction count per category
  const getCategoryStats = (catId: string) => {
    const matched = transactions.filter((t) => t.categoryId === catId);
    const totalAmount = matched.reduce((sum, t) => sum + t.amount, 0);
    return {
      count: matched.length,
      totalAmount,
    };
  };

  const totalExpenseVolume = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncomeVolume = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleDelete = () => {
    if (catToDelete) {
      playSound('delete');
      onDeleteCategory(catToDelete.id);
      setCatToDelete(null);
    }
  };

  return (
    <div id="categories-view" className="space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border backdrop-blur-xl shadow-xl transition-all ${
          isNight
            ? 'bg-slate-900/80 border-white/10'
            : 'bg-white border-slate-200/90 shadow-slate-200/50'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <h3
              className={`font-bold text-lg ${
                isNight ? 'text-white' : 'text-slate-900'
              }`}
            >
              📂 Категории доходов и расходов
            </h3>
            <p
              className={`text-xs sm:text-sm ${
                isNight ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Всего: <strong>{categories.length}</strong> (Расходов: {expenseCategories.length}, Доходов: {incomeCategories.length})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => {
              if (confirm('Сбросить категории к стандартному набору?')) {
                playSound('success');
                onResetCategories(DEFAULT_CATEGORIES);
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isNight
                ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Восстановить исходные категории"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Сбросить</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              onOpenAddModal(activeTab === 'all' ? 'expense' : activeTab);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Новая категория</span>
          </button>
        </div>
      </div>

      {/* Filter & Summary Bar */}
      <div
        className={`p-4 rounded-3xl border backdrop-blur-xl shadow-md flex flex-col md:flex-row items-center justify-between gap-3 ${
          isNight
            ? 'bg-slate-900/80 border-white/10'
            : 'bg-white border-slate-200/90 shadow-slate-200/40'
        }`}
      >
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск категорий..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm border focus:outline-none focus:border-emerald-500 transition-all ${
              isNight
                ? 'bg-slate-950/80 border-white/10 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        {/* Tabs: All / Expenses / Income */}
        <div
          className={`flex rounded-2xl p-1 border text-xs font-bold w-full md:w-auto ${
            isNight
              ? 'bg-slate-950/80 border-white/10'
              : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            onClick={() => {
              playSound('click');
              setActiveTab('all');
            }}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl transition-all ${
              activeTab === 'all'
                ? isNight
                  ? 'bg-white/20 text-white shadow'
                  : 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Все ({categories.length})
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('expense');
            }}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'expense'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Расходы ({expenseCategories.length})</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('income');
            }}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'income'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Доходы ({incomeCategories.length})</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div
          className={`text-center py-16 rounded-3xl border ${
            isNight
              ? 'bg-slate-900/40 border-white/10 text-slate-400'
              : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">Категории не найдены</p>
          <p className="text-xs text-slate-400 mt-1">Попробуйте изменить поисковый запрос</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => {
            const stats = getCategoryStats(cat.id);
            const totalVol = cat.type === 'expense' ? totalExpenseVolume : totalIncomeVolume;
            const percentOfTotal = totalVol > 0 ? Math.round((stats.totalAmount / totalVol) * 100) : 0;

            return (
              <div
                key={cat.id}
                id={`cat-card-${cat.id}`}
                className={`p-5 rounded-3xl border backdrop-blur-xl shadow-lg flex flex-col justify-between space-y-4 transition-all duration-200 group ${
                  isNight
                    ? 'bg-slate-900/80 border-white/10 hover:border-white/20'
                    : 'bg-white border-slate-200/90 shadow-slate-200/40 hover:border-slate-300 hover:shadow-xl'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-6 h-6" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <h4
                          className={`font-bold text-base truncate ${
                            isNight ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {cat.name}
                        </h4>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                            cat.type === 'income'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {cat.type === 'income' ? 'Доход' : 'Расход'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {stats.count} {stats.count === 1 ? 'операция' : 'операций'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditCategory(cat)}
                      className={`p-1.5 rounded-lg transition-all ${
                        isNight
                          ? 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                      title="Редактировать"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setCatToDelete(cat)}
                      className={`p-1.5 rounded-lg transition-all ${
                        isNight
                          ? 'bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400'
                          : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600'
                      }`}
                      title="Удалить категорию"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div
                  className={`pt-3 border-t space-y-1.5 ${
                    isNight ? 'border-white/5' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Сумма:</span>
                    <span
                      className={`font-bold ${
                        cat.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {cat.type === 'income' ? '+' : '−'}
                      {stats.totalAmount.toLocaleString('ru-RU')} {settings.currency}
                    </span>
                  </div>

                  {totalVol > 0 && stats.totalAmount > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Доля в категории:</span>
                      <span className="font-semibold text-slate-500 dark:text-slate-300">{percentOfTotal}%</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Category Safeguard Modal */}
      {catToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base">Удалить категорию?</h4>
                <p className="text-xs text-slate-400">«{catToDelete.name}»</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Существующие операции в этой категории останутся в истории, но категория будет удалена из списка активных.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCatToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
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
