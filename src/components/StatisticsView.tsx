import React, { useState, useMemo } from 'react';
import { Transaction, Category, AppSettings } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { CategoryIcon } from './CategoryIcon';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { playSound } from '../services/sound';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StatisticsViewProps {
  transactions: Transaction[];
  categories: Category[];
  settings: AppSettings;
}

type TimeFilter = 'week' | 'month' | '3months' | '6months' | 'year' | 'all';

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  transactions,
  categories,
  settings,
}) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('6months');

  const filterLabels: { key: TimeFilter; label: string }[] = [
    { key: 'week', label: 'Неделя' },
    { key: 'month', label: 'Месяц' },
    { key: '3months', label: '3 месяца' },
    { key: '6months', label: '6 месяцев' },
    { key: 'year', label: 'Год' },
    { key: 'all', label: 'Всё время' },
  ];

  // Filter transactions by selected timeframe
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let cutoff = new Date();

    if (timeFilter === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else if (timeFilter === 'month') {
      cutoff.setMonth(now.getMonth() - 1);
    } else if (timeFilter === '3months') {
      cutoff.setMonth(now.getMonth() - 3);
    } else if (timeFilter === '6months') {
      cutoff.setMonth(now.getMonth() - 6);
    } else if (timeFilter === 'year') {
      cutoff.setFullYear(now.getFullYear() - 1);
    } else {
      cutoff = new Date(0); // all time
    }

    const cutoffStr = cutoff.toISOString().split('T')[0];
    return transactions.filter((t) => t.date >= cutoffStr);
  }, [transactions, timeFilter]);

  const getCategory = (catId: string) => {
    return categories.find((c) => c.id === catId) || {
      name: 'Другое',
      icon: 'Tag',
      color: '#64748b',
    };
  };

  // 1. Monthly Income vs Expenses Bar Chart Data
  const monthlyData = useMemo(() => {
    const monthMap: Record<string, { income: number; expense: number }> = {};

    // Get last 6 months list in order
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7); // YYYY-MM
      monthMap[key] = { income: 0, expense: 0 };
    }

    // Populate with transactions
    transactions.forEach((tx) => {
      const key = tx.date.slice(0, 7);
      if (!monthMap[key]) {
        monthMap[key] = { income: 0, expense: 0 };
      }
      if (tx.type === 'income') {
        monthMap[key].income += tx.amount;
      } else {
        monthMap[key].expense += tx.amount;
      }
    });

    const sortedKeys = Object.keys(monthMap).sort().slice(-6);
    const monthNames = [
      'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
      'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
    ];

    const labels = sortedKeys.map((k) => {
      const [year, m] = k.split('-');
      return `${monthNames[parseInt(m, 10) - 1]} ${year.slice(2)}`;
    });

    const incomeValues = sortedKeys.map((k) => monthMap[k].income);
    const expenseValues = sortedKeys.map((k) => monthMap[k].expense);

    return {
      labels,
      datasets: [
        {
          label: 'Доходы',
          data: incomeValues,
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderRadius: 8,
          borderColor: '#10b981',
          borderWidth: 1,
        },
        {
          label: 'Расходы',
          data: expenseValues,
          backgroundColor: 'rgba(244, 63, 94, 0.8)',
          borderRadius: 8,
          borderColor: '#f43f5e',
          borderWidth: 1,
        },
      ],
    };
  }, [transactions]);

  // 2. Expenses by Category Doughnut Chart Data
  const categoryDoughnutData = useMemo(() => {
    const expenseMap: Record<string, { name: string; amount: number; color: string }> = {};

    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = getCategory(t.categoryId);
        if (!expenseMap[cat.name]) {
          expenseMap[cat.name] = { name: cat.name, amount: 0, color: cat.color };
        }
        expenseMap[cat.name].amount += t.amount;
      });

    const sortedCategories = Object.values(expenseMap).sort((a, b) => b.amount - a.amount);
    const labels = sortedCategories.map((c) => c.name);
    const data = sortedCategories.map((c) => c.amount);
    const colors = sortedCategories.map((c) => c.color);

    return {
      labels: labels.length > 0 ? labels : ['Нет данных'],
      datasets: [
        {
          data: data.length > 0 ? data : [1],
          backgroundColor: colors.length > 0 ? colors : ['#334155'],
          borderColor: '#0f172a',
          borderWidth: 3,
          hoverOffset: 6,
        },
      ],
      breakdown: sortedCategories,
    };
  }, [filteredTransactions, categories]);

  // 3. Balance Dynamics Timeline Line Chart
  const balanceTimelineData = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let cumulative = 0;
    const dateMap: Record<string, number> = {};

    sorted.forEach((t) => {
      cumulative += t.type === 'income' ? t.amount : -t.amount;
      dateMap[t.date] = cumulative;
    });

    const labels = Object.keys(dateMap);
    const data = Object.values(dateMap);

    return {
      labels: labels.length > 0 ? labels : ['Сейчас'],
      datasets: [
        {
          label: 'Баланс',
          data: data.length > 0 ? data : [0],
          fill: true,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: '#10b981',
        },
      ],
    };
  }, [filteredTransactions]);

  const totalPeriodIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPeriodExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate =
    totalPeriodIncome > 0
      ? Math.max(0, Math.round(((totalPeriodIncome - totalPeriodExpense) / totalPeriodIncome) * 100))
      : 0;

  return (
    <div id="statistics-view" className="space-y-6 pb-20 md:pb-8">
      {/* Top Header & Filter Chips */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            📊 Финансовая статистика
          </h3>
          <p className="text-xs text-slate-400">
            Детальная аналитика доходов, расходов и динамики накоплений
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-white/10 text-xs">
          {filterLabels.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                playSound('click');
                setTimeFilter(f.key);
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                timeFilter === f.key
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats in Period */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Доходы за период</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              +{totalPeriodIncome.toLocaleString('ru-RU')} {settings.currency}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-rose-500/20 backdrop-blur-xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Расходы за период</span>
            <div className="text-xl font-bold text-rose-400 mt-1">
              −{totalPeriodExpense.toLocaleString('ru-RU')} {settings.currency}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
            <TrendingUp className="w-5 h-5 rotate-180" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Норма сбережений</span>
            <div className="text-xl font-bold text-cyan-300 mt-1">
              {savingsRate}%
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Income vs Expenses */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm sm:text-base text-white">
                Доходы и расходы по месяцам
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">Динамика</span>
          </div>

          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            <Bar
              data={monthlyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: { color: '#94a3b8', font: { family: 'inherit', size: 12 } },
                  },
                },
                scales: {
                  x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8' },
                  },
                  y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8' },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Chart 2: Expenses by Category Doughnut */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                <PieChart className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm sm:text-base text-white">
                Расходы по категориям
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">Структура</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-56 w-full flex items-center justify-center">
              <Doughnut
                data={categoryDoughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  cutout: '70%',
                }}
              />
            </div>

            {/* Category breakdown table */}
            <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {categoryDoughnutData.breakdown.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-8">
                  Нет расходов за период
                </div>
              ) : (
                categoryDoughnutData.breakdown.map((item, idx) => {
                  const pct = totalPeriodExpense > 0 ? Math.round((item.amount / totalPeriodExpense) * 100) : 0;
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-300 truncate">{item.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-white mr-1.5">{item.amount.toLocaleString('ru-RU')} {settings.currency}</span>
                        <span className="text-[10px] text-slate-500">({pct}%)</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Chart 3: Balance Timeline Full Width */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm sm:text-base text-white">
                Динамика изменения баланса
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">Накопительный итог</span>
          </div>

          <div className="h-64 sm:h-80 w-full">
            <Line
              data={balanceTimelineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8' },
                  },
                  y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8' },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
