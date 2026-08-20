export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  description: string;
  createdAt: string;
}

export interface GoalHistoryItem {
  id?: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  date: string;
  note?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
  deadline?: string;
  isCompleted?: boolean;
  createdAt: string;
  history: GoalHistoryItem[];
}

export interface FundTransaction {
  id?: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  date: string;
  note?: string;
}

export interface EmergencyFund {
  targetAmount: number;
  currentAmount: number;
  updatedAt: string;
  history: FundTransaction[];
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  comment?: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  title: string;
  initialAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  interestRate: number; // percentage e.g. 15%
  startDate: string;
  endDate?: string;
  description?: string;
  isCompleted?: boolean;
  createdAt: string;
  payments: LoanPayment[];
}

export type ThemeName = 'light' | 'dark' | 'muted' | 'vibrant' | 'colorful' | 'nature';

export type CurrencySymbol = '₸' | '₽' | '$' | '€';

export type AuthProvider = 'google' | 'apple' | 'guest';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: AuthProvider;
  isLoggedIn: boolean;
  syncedAt?: string;
  joinedDate?: string;
}

export interface SavedAccount {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: AuthProvider;
  lastUsedAt?: string;
}

export interface AppSettings {
  theme: ThemeName;
  nightMode: boolean;
  currency: CurrencySymbol;
  soundEnabled: boolean;
  speechFeedback: boolean;
  hasSeenWelcome?: boolean;
}

export type ActivePage = 
  | 'dashboard'
  | 'transactions'
  | 'categories'
  | 'statistics'
  | 'goals'
  | 'emergency'
  | 'loans'
  | 'settings';

export type ReminderCategory = 'bill' | 'loan' | 'goal' | 'subscription' | 'other';
export type ReminderRecurring = 'none' | 'monthly' | 'weekly' | 'yearly';
export type ReminderPriority = 'high' | 'medium' | 'low';

export interface FinancialReminder {
  id: string;
  title: string;
  amount?: number;
  dueDate: string; // YYYY-MM-DD
  category: ReminderCategory;
  isCompleted: boolean;
  recurring: ReminderRecurring;
  priority: ReminderPriority;
  notes?: string;
  createdAt: string;
}

export interface MonthlyComparisonData {
  currentMonthName: string;
  previousMonthName: string;
  currentYear: number;
  previousYear: number;
  
  currentIncome: number;
  previousIncome: number;
  incomeChangeAmount: number;
  incomeChangePercent: number;
  incomeTrend: 'up' | 'down' | 'same';

  currentExpense: number;
  previousExpense: number;
  expenseChangeAmount: number;
  expenseChangePercent: number;
  expenseTrend: 'up' | 'down' | 'same';

  currentNetSavings: number;
  previousNetSavings: number;
  netSavingsChange: number;
  netSavingsChangePercent: number;
  netSavingsTrend: 'up' | 'down' | 'same';

  hasPreviousData: boolean;
  hasCurrentData: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
}

export type ToastNotification = ToastMessage;

export interface ParsedVoiceCommand {
  action: 'add_transaction' | 'navigate' | 'toggle_theme' | 'show_balance' | 'deposit_goal' | 'loan_payment' | 'unknown';
  type?: TransactionType;
  amount?: number;
  categoryName?: string;
  categoryId?: string;
  targetPage?: ActivePage;
  themeName?: ThemeName;
  nightMode?: boolean;
  goalTitle?: string;
  rawText: string;
  confidenceMessage?: string;
}
