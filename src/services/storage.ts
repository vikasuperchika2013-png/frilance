import {
  Category,
  Transaction,
  SavingsGoal,
  EmergencyFund,
  Loan,
  LoanPayment,
  AppSettings,
  UserProfile,
  SavedAccount,
  FinancialReminder,
  MonthlyComparisonData,
} from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'fin_app_settings',
  CATEGORIES: 'fin_app_categories',
  TRANSACTIONS: 'fin_app_transactions',
  GOALS: 'fin_app_goals',
  EMERGENCY_FUND: 'fin_app_emergency_fund',
  LOANS: 'fin_app_loans',
  REMINDERS: 'fin_app_reminders',
  USER_PROFILE: 'fin_app_user_profile',
  SAVED_ACCOUNTS: 'fin_app_saved_accounts',
};

// Initial default categories
export const DEFAULT_CATEGORIES: Category[] = [
  // Income
  { id: 'cat_inc_1', name: 'Зарплата', type: 'income', icon: 'Briefcase', color: '#10b981' },
  { id: 'cat_inc_2', name: 'Подработка', type: 'income', icon: 'Laptop', color: '#3b82f6' },
  { id: 'cat_inc_3', name: 'Подарок', type: 'income', icon: 'Gift', color: '#ec4899' },
  { id: 'cat_inc_4', name: 'Инвестиции', type: 'income', icon: 'TrendingUp', color: '#8b5cf6' },
  { id: 'cat_inc_5', name: 'Другое', type: 'income', icon: 'Coins', color: '#64748b' },

  // Expense
  { id: 'cat_exp_1', name: 'Еда', type: 'expense', icon: 'Utensils', color: '#f59e0b' },
  { id: 'cat_exp_2', name: 'Транспорт', type: 'expense', icon: 'Car', color: '#06b6d4' },
  { id: 'cat_exp_3', name: 'Развлечения', type: 'expense', icon: 'Gamepad2', color: '#a855f7' },
  { id: 'cat_exp_4', name: 'Одежда', type: 'expense', icon: 'Shirt', color: '#ec4899' },
  { id: 'cat_exp_5', name: 'Образование', type: 'expense', icon: 'GraduationCap', color: '#3b82f6' },
  { id: 'cat_exp_6', name: 'Дом', type: 'expense', icon: 'Home', color: '#eab308' },
  { id: 'cat_exp_7', name: 'Здоровье', type: 'expense', icon: 'HeartPulse', color: '#ef4444' },
  { id: 'cat_exp_8', name: 'Другое', type: 'expense', icon: 'Package', color: '#94a3b8' },
];

// Clean Zero initial state as requested by user
export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_GOALS: SavingsGoal[] = [];

export const INITIAL_EMERGENCY_FUND: EmergencyFund = {
  targetAmount: 0,
  currentAmount: 0,
  updatedAt: new Date().toISOString(),
  history: [],
};

export const INITIAL_LOANS: Loan[] = [];

export const INITIAL_REMINDERS: FinancialReminder[] = [
  {
    id: 'rem_1',
    title: 'Оплата интернета и сервисов',
    amount: 7500,
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    category: 'bill',
    isCompleted: false,
    recurring: 'monthly',
    priority: 'medium',
    notes: 'Лицевой счет онлайн',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem_2',
    title: 'Ежемесячный платеж по кредиту',
    amount: 35000,
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    category: 'loan',
    isCompleted: false,
    recurring: 'monthly',
    priority: 'high',
    notes: 'Kaspi / Банк',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem_3',
    title: 'Пополнение финансовой подушки',
    amount: 20000,
    dueDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
    category: 'goal',
    isCompleted: false,
    recurring: 'monthly',
    priority: 'medium',
    notes: 'Резерв на чёрный день',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'guest_default',
  name: 'Гостевой аккаунт',
  email: '',
  avatar: '',
  provider: 'guest',
  isLoggedIn: false,
  joinedDate: new Date().toISOString(),
};

export const DEFAULT_SAVED_ACCOUNTS: SavedAccount[] = [
  {
    id: 'google_vika',
    name: 'Виктория',
    email: 'vikasuperchika2013@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikasuperchika2013@gmail.com',
    provider: 'google',
    lastUsedAt: new Date().toISOString(),
  },
  {
    id: 'google_finance',
    name: 'Личный Бюджет',
    email: 'my.finance.google@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=my.finance.google@gmail.com',
    provider: 'google',
    lastUsedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'apple_demo',
    name: 'Apple ID (iCloud)',
    email: 'apple.user@icloud.com',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=apple.user@icloud.com',
    provider: 'apple',
    lastUsedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light', // Crisp white theme by default
  nightMode: false, // Light mode by default for crisp white look
  currency: '₸',
  soundEnabled: true,
  speechFeedback: true,
  hasSeenWelcome: true,
};

// Storage Service Wrapper
export class StorageService {
  static getSavedAccounts(): SavedAccount[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED_ACCOUNTS);
      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed reading saved accounts', e);
    }
    this.saveSavedAccounts(DEFAULT_SAVED_ACCOUNTS);
    return DEFAULT_SAVED_ACCOUNTS;
  }

  static saveSavedAccounts(accounts: SavedAccount[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_ACCOUNTS, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed saving saved accounts', e);
    }
  }

  static addSavedAccount(account: SavedAccount): void {
    const existing = this.getSavedAccounts();
    const filtered = existing.filter((a) => a.email.toLowerCase() !== account.email.toLowerCase());
    const updated = [account, ...filtered];
    this.saveSavedAccounts(updated);
  }

  static removeSavedAccount(accountId: string): void {
    const existing = this.getSavedAccounts();
    const updated = existing.filter((a) => a.id !== accountId);
    this.saveSavedAccounts(updated);
  }

  static getUserProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_USER_PROFILE,
            ...parsed,
          };
        }
      }
    } catch (e) {
      console.warn('Failed reading user profile', e);
    }
    return { ...DEFAULT_USER_PROFILE };
  }

  static saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed saving user profile', e);
    }
  }

  static getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_SETTINGS,
            ...parsed,
          };
        }
      }
    } catch (e) {
      console.warn('Failed reading settings from storage', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed saving settings', e);
    }
  }

  static getCategories(): Category[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed reading categories', e);
    }
    this.saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }

  static saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed saving categories', e);
    }
  }

  static getTransactions(): Transaction[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed reading transactions', e);
    }
    this.saveTransactions(INITIAL_TRANSACTIONS);
    return INITIAL_TRANSACTIONS;
  }

  static saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed saving transactions', e);
    }
  }

  static getGoals(): SavingsGoal[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed reading goals', e);
    }
    this.saveGoals(INITIAL_GOALS);
    return INITIAL_GOALS;
  }

  static saveGoals(goals: SavingsGoal[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed saving goals', e);
    }
  }

  static getEmergencyFund(): EmergencyFund {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EMERGENCY_FUND);
      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && typeof parsed.targetAmount === 'number') {
          return {
            ...INITIAL_EMERGENCY_FUND,
            ...parsed,
          };
        }
      }
    } catch (e) {
      console.warn('Failed reading emergency fund', e);
    }
    this.saveEmergencyFund(INITIAL_EMERGENCY_FUND);
    return INITIAL_EMERGENCY_FUND;
  }

  static saveEmergencyFund(fund: EmergencyFund): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EMERGENCY_FUND, JSON.stringify(fund));
    } catch (e) {
      console.error('Failed saving emergency fund', e);
    }
  }

  static getLoans(): Loan[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOANS);
      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed reading loans', e);
    }
    this.saveLoans(INITIAL_LOANS);
    return INITIAL_LOANS;
  }

  static saveLoans(loans: Loan[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
    } catch (e) {
      console.error('Failed saving loans', e);
    }
  }

  static getReminders(): FinancialReminder[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed reading reminders', e);
    }
    this.saveReminders(INITIAL_REMINDERS);
    return INITIAL_REMINDERS;
  }

  static saveReminders(reminders: FinancialReminder[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    } catch (e) {
      console.error('Failed saving reminders', e);
    }
  }

  static addReminder(reminder: FinancialReminder): void {
    const reminders = this.getReminders();
    const updated = [reminder, ...reminders];
    this.saveReminders(updated);
  }

  static updateReminder(reminder: FinancialReminder): void {
    const reminders = this.getReminders();
    const updated = reminders.map((r) => (r.id === reminder.id ? reminder : r));
    this.saveReminders(updated);
  }

  static toggleReminder(id: string): void {
    const reminders = this.getReminders();
    const updated = reminders.map((r) => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r));
    this.saveReminders(updated);
  }

  static deleteReminder(id: string): void {
    const reminders = this.getReminders();
    const updated = reminders.filter((r) => r.id !== id);
    this.saveReminders(updated);
  }

  static resetToZero(): void {
    this.saveTransactions([]);
    this.saveGoals([]);
    this.saveEmergencyFund({
      targetAmount: 0,
      currentAmount: 0,
      updatedAt: new Date().toISOString(),
      history: [],
    });
    this.saveLoans([]);
    this.saveReminders([]);
  }

  static resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.EMERGENCY_FUND);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.REMINDERS);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  }

  static exportFullBackup(): string {
    const data = {
      version: 1,
      exportDate: new Date().toISOString(),
      settings: this.getSettings(),
      categories: this.getCategories(),
      transactions: this.getTransactions(),
      goals: this.getGoals(),
      emergencyFund: this.getEmergencyFund(),
      loans: this.getLoans(),
      reminders: this.getReminders(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importFullBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.categories && data.transactions) {
        if (data.settings) this.saveSettings(data.settings);
        if (data.categories) this.saveCategories(data.categories);
        if (data.transactions) this.saveTransactions(data.transactions);
        if (data.goals) this.saveGoals(data.goals);
        if (data.emergencyFund) this.saveEmergencyFund(data.emergencyFund);
        if (data.loans) this.saveLoans(data.loans);
        if (data.reminders) this.saveReminders(data.reminders);
        return true;
      }
    } catch (e) {
      console.error('Import failed', e);
    }
    return false;
  }
}

// Financial Calculation Utilities
export function calculateTotals(transactions: Transaction[]) {
  let totalIncome = 0;
  let totalExpense = 0;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let monthIncome = 0;
  let monthExpense = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpense += tx.amount;
    }

    const txDate = new Date(tx.date);
    if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth) {
      if (tx.type === 'income') {
        monthIncome += tx.amount;
      } else {
        monthExpense += tx.amount;
      }
    }
  });

  const totalBalance = totalIncome - totalExpense;

  return {
    totalBalance,
    totalIncome,
    totalExpense,
    monthIncome,
    monthExpense,
  };
}

export function calculateLoanTotals(loans: Loan[]) {
  const activeLoans = loans.filter((l) => !l.isCompleted && l.remainingAmount > 0);
  const totalInitial = activeLoans.reduce((sum, l) => sum + l.initialAmount, 0);
  const totalRemaining = activeLoans.reduce((sum, l) => sum + l.remainingAmount, 0);
  const totalPaid = Math.max(0, totalInitial - totalRemaining);
  const overallProgress = totalInitial > 0 ? Math.min(100, Math.round((totalPaid / totalInitial) * 100)) : 100;

  return {
    activeCount: activeLoans.length,
    totalInitial,
    totalRemaining,
    totalPaid,
    overallProgress,
  };
}

export function calculateGoalsTotals(goals: SavingsGoal[]) {
  const activeGoals = goals.filter((g) => !g.isCompleted);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  
  // Nearest goal by progress %
  let nearestGoal: SavingsGoal | null = null;
  let highestProgress = -1;

  activeGoals.forEach((goal) => {
    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    if (progress > highestProgress) {
      highestProgress = progress;
      nearestGoal = goal;
    }
  });

  return {
    count: goals.length,
    activeCount: activeGoals.length,
    totalSaved,
    totalTarget,
    nearestGoal,
    nearestGoalProgress: Math.min(100, Math.round(highestProgress)),
  };
}

export function formatCurrency(amount: number, currency: string = '₸'): string {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} ${currency}`;
}

const MONTH_NAMES_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export function calculateMonthlyComparison(
  transactions: Transaction[],
  referenceDate: Date = new Date()
): MonthlyComparisonData {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth();

  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const previousYear = prevMonthDate.getFullYear();
  const previousMonth = prevMonthDate.getMonth();

  let currentIncome = 0;
  let currentExpense = 0;
  let previousIncome = 0;
  let previousExpense = 0;

  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    const y = d.getFullYear();
    const m = d.getMonth();

    if (y === currentYear && m === currentMonth) {
      if (tx.type === 'income') {
        currentIncome += tx.amount;
      } else {
        currentExpense += tx.amount;
      }
    } else if (y === previousYear && m === previousMonth) {
      if (tx.type === 'income') {
        previousIncome += tx.amount;
      } else {
        previousExpense += tx.amount;
      }
    }
  });

  // Income Comparison
  const incomeChangeAmount = currentIncome - previousIncome;
  let incomeChangePercent = 0;
  if (previousIncome > 0) {
    incomeChangePercent = ((currentIncome - previousIncome) / previousIncome) * 100;
  } else if (currentIncome > 0) {
    incomeChangePercent = 100;
  }
  const incomeTrend: 'up' | 'down' | 'same' =
    incomeChangeAmount > 0 ? 'up' : incomeChangeAmount < 0 ? 'down' : 'same';

  // Expense Comparison
  const expenseChangeAmount = currentExpense - previousExpense;
  let expenseChangePercent = 0;
  if (previousExpense > 0) {
    expenseChangePercent = ((currentExpense - previousExpense) / previousExpense) * 100;
  } else if (currentExpense > 0) {
    expenseChangePercent = 100;
  }
  const expenseTrend: 'up' | 'down' | 'same' =
    expenseChangeAmount > 0 ? 'up' : expenseChangeAmount < 0 ? 'down' : 'same';

  // Net Savings (Income - Expense)
  const currentNetSavings = currentIncome - currentExpense;
  const previousNetSavings = previousIncome - previousExpense;
  const netSavingsChange = currentNetSavings - previousNetSavings;
  let netSavingsChangePercent = 0;
  if (Math.abs(previousNetSavings) > 0) {
    netSavingsChangePercent = (netSavingsChange / Math.abs(previousNetSavings)) * 100;
  } else if (currentNetSavings !== 0) {
    netSavingsChangePercent = currentNetSavings > 0 ? 100 : -100;
  }
  const netSavingsTrend: 'up' | 'down' | 'same' =
    netSavingsChange > 0 ? 'up' : netSavingsChange < 0 ? 'down' : 'same';

  return {
    currentMonthName: MONTH_NAMES_RU[currentMonth],
    previousMonthName: MONTH_NAMES_RU[previousMonth],
    currentYear,
    previousYear,
    currentIncome,
    previousIncome,
    incomeChangeAmount,
    incomeChangePercent: Math.round(incomeChangePercent * 10) / 10,
    incomeTrend,
    currentExpense,
    previousExpense,
    expenseChangeAmount,
    expenseChangePercent: Math.round(expenseChangePercent * 10) / 10,
    expenseTrend,
    currentNetSavings,
    previousNetSavings,
    netSavingsChange,
    netSavingsChangePercent: Math.round(netSavingsChangePercent * 10) / 10,
    netSavingsTrend,
    hasPreviousData: previousIncome > 0 || previousExpense > 0,
    hasCurrentData: currentIncome > 0 || currentExpense > 0,
  };
}

