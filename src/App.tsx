import React, { useState, useEffect, useCallback } from 'react';
import {
  Transaction,
  Category,
  SavingsGoal,
  EmergencyFund,
  Loan,
  AppSettings,
  ActivePage,
  ToastNotification,
  TransactionType,
  UserProfile,
  FinancialReminder,
} from './types';
import {
  StorageService,
  calculateTotals,
} from './services/storage';
import { THEMES, getThemeColors } from './services/theme';
import { playSound } from './services/sound';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { ToastContainer } from './components/ToastContainer';

// Views
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { CategoriesView } from './components/CategoriesView';
import { StatisticsView } from './components/StatisticsView';
import { GoalsView } from './components/GoalsView';
import { EmergencyView } from './components/EmergencyView';
import { LoansView } from './components/LoansView';
import { SettingsView } from './components/SettingsView';

// Modals
import { TransactionModal } from './components/TransactionModal';
import { VoiceModal } from './components/VoiceModal';
import { ThemeModal } from './components/ThemeModal';
import { CategoryModal } from './components/CategoryModal';
import { GoalModal, GoalActionModal } from './components/GoalModal';
import { EmergencyModal } from './components/EmergencyModal';
import { LoanModal } from './components/LoanModal';
import { LoanPaymentModal } from './components/LoanPaymentModal';
import { ReminderModal } from './components/ReminderModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { AuthModal } from './components/AuthModal';

export const App: React.FC = () => {
  // State from Storage
  const [transactions, setTransactions] = useState<Transaction[]>(() => StorageService.getTransactions());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [goals, setGoals] = useState<SavingsGoal[]>(() => StorageService.getGoals());
  const [emergencyFund, setEmergencyFund] = useState<EmergencyFund>(() => StorageService.getEmergencyFund());
  const [loans, setLoans] = useState<Loan[]>(() => StorageService.getLoans());
  const [reminders, setReminders] = useState<FinancialReminder[]>(() => StorageService.getReminders());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => StorageService.getUserProfile());

  // UI Navigation State
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Modals Open State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [isGoalActionModalOpen, setIsGoalActionModalOpen] = useState(false);
  const [goalActionTarget, setGoalActionTarget] = useState<SavingsGoal | null>(null);
  const [goalActionMode, setGoalActionMode] = useState<'deposit' | 'withdraw'>('deposit');

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyActionMode, setEmergencyActionMode] = useState<'deposit' | 'withdraw' | 'configure'>('deposit');

  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  const [isLoanPaymentModalOpen, setIsLoanPaymentModalOpen] = useState(false);
  const [actionLoanTarget, setActionLoanTarget] = useState<Loan | null>(null);

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<FinancialReminder | null>(null);

  // PWA Install State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPWAModalOpen, setIsPWAModalOpen] = useState(false);

  // Derived financial metrics
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  // Helper for Toasts
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    StorageService.saveUserProfile(newProfile);
  };

  // PWA Service Worker & Install event registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          showToast('Приложение успешно установлено!', 'success');
        }
        setDeferredPrompt(null);
      });
    }
    setIsPWAModalOpen(false);
  };

  // Sync state changes with StorageService
  const handleUpdateSettings = (newPartial: Partial<AppSettings>) => {
    const updated = { ...settings, ...newPartial };
    setSettings(updated);
    StorageService.saveSettings(updated);
    showToast('Настройки сохранены', 'success');
  };

  // --- Transactions Handlers ---
  const handleSaveTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTx) {
      const updatedList = transactions.map((t) =>
        t.id === editingTx.id ? { ...t, ...txData } : t
      );
      setTransactions(updatedList);
      StorageService.saveTransactions(updatedList);
      showToast('Операция обновлена', 'success');
    } else {
      const newTx: Transaction = {
        ...txData,
        id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        createdAt: new Date().toISOString(),
      };
      const updatedList = [newTx, ...transactions];
      setTransactions(updatedList);
      StorageService.saveTransactions(updatedList);
      showToast(
        txData.type === 'income'
          ? `Доход +${txData.amount.toLocaleString('ru-RU')} ${settings.currency} добавлен`
          : `Расход −${txData.amount.toLocaleString('ru-RU')} ${settings.currency} записан`,
        'success'
      );
    }
  };

  const handleDeleteTransaction = (txId: string) => {
    const updatedList = transactions.filter((t) => t.id !== txId);
    setTransactions(updatedList);
    StorageService.saveTransactions(updatedList);
    showToast('Операция удалена', 'info');
  };

  // --- Categories Handlers ---
  const handleSaveCategory = (catData: Omit<Category, 'id'>) => {
    if (editingCategory) {
      const updated = categories.map((c) =>
        c.id === editingCategory.id ? { ...c, ...catData } : c
      );
      setCategories(updated);
      StorageService.saveCategories(updated);
      showToast('Категория обновлена', 'success');
    } else {
      const newCat: Category = {
        ...catData,
        id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      };
      const updated = [...categories, newCat];
      setCategories(updated);
      StorageService.saveCategories(updated);
      showToast(`Категория «${catData.name}» создана`, 'success');
    }
  };

  const handleDeleteCategory = (catId: string) => {
    const updated = categories.filter((c) => c.id !== catId);
    setCategories(updated);
    StorageService.saveCategories(updated);
    showToast('Категория удалена', 'info');
  };

  const handleResetCategories = (defaults: Category[]) => {
    setCategories(defaults);
    StorageService.saveCategories(defaults);
    showToast('Категории восстановлены по умолчанию', 'success');
  };

  // --- Savings Goals Handlers ---
  const handleSaveGoal = (goalData: Omit<SavingsGoal, 'id' | 'createdAt' | 'history'>) => {
    if (editingGoal) {
      const updated = goals.map((g) =>
        g.id === editingGoal.id ? { ...g, ...goalData } : g
      );
      setGoals(updated);
      StorageService.saveGoals(updated);
      showToast('Копилка обновлена', 'success');
    } else {
      const newGoal: SavingsGoal = {
        ...goalData,
        id: 'goal_' + Date.now(),
        createdAt: new Date().toISOString(),
        history: [],
      };
      const updated = [...goals, newGoal];
      setGoals(updated);
      StorageService.saveGoals(updated);
      showToast(`Копилка «${goalData.title}» создана`, 'success');
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    const updated = goals.filter((g) => g.id !== goalId);
    setGoals(updated);
    StorageService.saveGoals(updated);
    showToast('Копилка удалена', 'info');
  };

  const handleGoalAction = (
    goalId: string,
    amount: number,
    mode: 'deposit' | 'withdraw',
    note?: string
  ) => {
    const updated = goals.map((g) => {
      if (g.id === goalId) {
        const newAmount =
          mode === 'deposit'
            ? g.currentAmount + amount
            : Math.max(0, g.currentAmount - amount);
        const historyItem = {
          date: new Date().toISOString().split('T')[0],
          amount,
          type: mode,
          note,
        };
        return {
          ...g,
          currentAmount: newAmount,
          isCompleted: newAmount >= g.targetAmount,
          history: [historyItem, ...(g.history || [])],
        };
      }
      return g;
    });

    setGoals(updated);
    StorageService.saveGoals(updated);
    showToast(
      mode === 'deposit'
        ? `В копилку внесено +${amount.toLocaleString('ru-RU')} ${settings.currency}`
        : `Из копилки снято −${amount.toLocaleString('ru-RU')} ${settings.currency}`,
      'success'
    );
  };

  // --- Emergency Fund Handlers ---
  const handleEmergencyAction = (
    amount: number,
    mode: 'deposit' | 'withdraw' | 'configure',
    note?: string
  ) => {
    let updated: EmergencyFund;
    if (mode === 'configure') {
      updated = {
        ...emergencyFund,
        targetAmount: amount,
      };
      showToast(`Новая цель подушки: ${amount.toLocaleString('ru-RU')} ${settings.currency}`, 'success');
    } else {
      const newAmount =
        mode === 'deposit'
          ? emergencyFund.currentAmount + amount
          : Math.max(0, emergencyFund.currentAmount - amount);

      const historyItem = {
        date: new Date().toISOString().split('T')[0],
        amount,
        type: mode,
        note,
      };

      updated = {
        ...emergencyFund,
        currentAmount: newAmount,
        history: [historyItem, ...(emergencyFund.history || [])],
      };

      showToast(
        mode === 'deposit'
          ? `Подушка пополнена на +${amount.toLocaleString('ru-RU')} ${settings.currency}`
          : `Из подушки снято −${amount.toLocaleString('ru-RU')} ${settings.currency}`,
        'success'
      );
    }

    setEmergencyFund(updated);
    StorageService.saveEmergencyFund(updated);
  };

  // --- Loans Handlers ---
  const handleSaveLoan = (
    loanData: Omit<Loan, 'id' | 'createdAt' | 'payments' | 'isCompleted'>
  ) => {
    if (editingLoan) {
      const updated = loans.map((l) =>
        l.id === editingLoan.id
          ? {
              ...l,
              ...loanData,
              isCompleted: loanData.remainingAmount <= 0,
            }
          : l
      );
      setLoans(updated);
      StorageService.saveLoans(updated);
      showToast('Кредит обновлен', 'success');
    } else {
      const newLoan: Loan = {
        ...loanData,
        id: 'loan_' + Date.now(),
        createdAt: new Date().toISOString(),
        payments: [],
        isCompleted: loanData.remainingAmount <= 0,
      };
      const updated = [...loans, newLoan];
      setLoans(updated);
      StorageService.saveLoans(updated);
      showToast(`Кредит «${loanData.title}» добавлен`, 'success');
    }
  };

  const handleDeleteLoan = (loanId: string) => {
    const updated = loans.filter((l) => l.id !== loanId);
    setLoans(updated);
    StorageService.saveLoans(updated);
    showToast('Кредит удален', 'info');
  };

  const handleMakeLoanPayment = (
    loanId: string,
    amount: number,
    date: string,
    comment?: string
  ) => {
    const updated = loans.map((l) => {
      if (l.id === loanId) {
        const newRemaining = Math.max(0, l.remainingAmount - amount);
        const paymentRecord = {
          date,
          amount,
          comment,
        };
        return {
          ...l,
          remainingAmount: newRemaining,
          isCompleted: newRemaining <= 0,
          payments: [paymentRecord, ...(l.payments || [])],
        };
      }
      return l;
    });

    setLoans(updated);
    StorageService.saveLoans(updated);

    // Also register an expense transaction automatically for seamless bookkeeping
    const loanTarget = loans.find((l) => l.id === loanId);
    if (loanTarget) {
      const loanCat = categories.find((c) => c.name.toLowerCase().includes('кредит') || c.name.toLowerCase().includes('счета')) || categories[0];
      const autoTx: Transaction = {
        id: 'tx_loan_' + Date.now(),
        type: 'expense',
        amount,
        categoryId: loanCat ? loanCat.id : 'expense_bills',
        date,
        description: `Платёж по кредиту «${loanTarget.title}»`,
        createdAt: new Date().toISOString(),
      };
      const newTxList = [autoTx, ...transactions];
      setTransactions(newTxList);
      StorageService.saveTransactions(newTxList);
    }

    showToast(`Внесён платёж по кредиту: −${amount.toLocaleString('ru-RU')} ${settings.currency}`, 'success');
  };

  // --- Reminders Handlers ---
  const handleSaveReminder = (reminder: FinancialReminder) => {
    if (editingReminder) {
      const updated = reminders.map((r) => (r.id === reminder.id ? reminder : r));
      setReminders(updated);
      StorageService.saveReminders(updated);
      showToast('Напоминание сохранено', 'success');
    } else {
      const updated = [reminder, ...reminders];
      setReminders(updated);
      StorageService.saveReminders(updated);
      showToast(`Напоминание «${reminder.title}» добавлено`, 'success');
    }
  };

  const handleToggleReminder = (reminderId: string) => {
    const updated = reminders.map((r) =>
      r.id === reminderId ? { ...r, isCompleted: !r.isCompleted } : r
    );
    setReminders(updated);
    StorageService.saveReminders(updated);
    const target = reminders.find((r) => r.id === reminderId);
    if (target && !target.isCompleted) {
      showToast(`Напоминание «${target.title}» выполнено!`, 'success');
    }
  };

  const handleDeleteReminder = (reminderId: string) => {
    const updated = reminders.filter((r) => r.id !== reminderId);
    setReminders(updated);
    StorageService.saveReminders(updated);
    showToast('Напоминание удалено', 'info');
  };

  // Get current active theme config
  const currentTheme = THEMES[settings?.theme] || THEMES.nature;
  const isNight = settings?.nightMode && settings?.theme !== 'light';

  return (
    <div
      id="app-root-container"
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 selection:bg-emerald-500 selection:text-white ${
        isNight ? 'bg-black text-slate-200' : currentTheme.bgClass
      }`}
    >
      {/* Top Application Header */}
      <Header
        activePage={activePage}
        settings={settings}
        userProfile={userProfile}
        onOpenAuthModal={() => {
          playSound('click');
          setIsAuthModalOpen(true);
        }}
        onOpenAddTransaction={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        onOpenVoiceModal={() => {
          playSound('voice');
          setIsVoiceModalOpen(true);
        }}
        onOpenThemeModal={() => {
          playSound('click');
          setIsThemeModalOpen(true);
        }}
        onToggleNightMode={() => handleUpdateSettings({ nightMode: !settings.nightMode })}
        onOpenPWAInstall={() => {
          playSound('click');
          setIsPWAModalOpen(true);
        }}
      />

      {/* Main Two-Column Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex gap-8">
        {/* Desktop Left Sidebar Navigation */}
        <Sidebar
          activePage={activePage}
          onNavigate={(page) => {
            playSound('click');
            setActivePage(page);
          }}
          settings={settings}
          userProfile={userProfile}
          onOpenAuthModal={() => {
            playSound('click');
            setIsAuthModalOpen(true);
          }}
          onToggleNightMode={() => handleUpdateSettings({ nightMode: !settings.nightMode })}
          onOpenVoiceModal={() => {
            playSound('voice');
            setIsVoiceModalOpen(true);
          }}
          onOpenThemeModal={() => {
            playSound('click');
            setIsThemeModalOpen(true);
          }}
          onOpenPWAInstall={() => {
            playSound('click');
            setIsPWAModalOpen(true);
          }}
          canInstallPWA={!!deferredPrompt}
        />

        {/* Dynamic Main View Content Area */}
        <main className="flex-1 w-full min-w-0">
          {activePage === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              categories={categories}
              goals={goals}
              emergencyFund={emergencyFund}
              loans={loans}
              reminders={reminders}
              settings={settings}
              onNavigate={setActivePage}
              onOpenAddTransaction={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              onOpenEmergencyAction={(mode) => {
                setEmergencyActionMode(mode);
                setIsEmergencyModalOpen(true);
              }}
              onOpenLoanPayment={(loan) => {
                setActionLoanTarget(loan);
                setIsLoanPaymentModalOpen(true);
              }}
              onToggleReminder={handleToggleReminder}
              onOpenAddReminder={() => {
                setEditingReminder(null);
                setIsReminderModalOpen(true);
              }}
              onOpenEditReminder={(rem) => {
                setEditingReminder(rem);
                setIsReminderModalOpen(true);
              }}
              onDeleteReminder={handleDeleteReminder}
            />
          )}

          {activePage === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              categories={categories}
              settings={settings}
              onOpenAddModal={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              onEditTransaction={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activePage === 'categories' && (
            <CategoriesView
              categories={categories}
              transactions={transactions}
              settings={settings}
              onOpenAddModal={(type?: TransactionType) => {
                setEditingCategory(null);
                setIsCategoryModalOpen(true);
              }}
              onEditCategory={(cat) => {
                setEditingCategory(cat);
                setIsCategoryModalOpen(true);
              }}
              onDeleteCategory={handleDeleteCategory}
              onResetCategories={handleResetCategories}
            />
          )}

          {activePage === 'statistics' && (
            <StatisticsView
              transactions={transactions}
              categories={categories}
              settings={settings}
            />
          )}

          {activePage === 'goals' && (
            <GoalsView
              goals={goals}
              settings={settings}
              onOpenCreateGoal={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
              onEditGoal={(goal) => {
                setEditingGoal(goal);
                setIsGoalModalOpen(true);
              }}
              onDeleteGoal={handleDeleteGoal}
              onOpenActionModal={(goal, mode) => {
                setGoalActionTarget(goal);
                setGoalActionMode(mode);
                setIsGoalActionModalOpen(true);
              }}
            />
          )}

          {activePage === 'emergency' && (
            <EmergencyView
              fund={emergencyFund}
              transactions={transactions}
              settings={settings}
              onOpenActionModal={(mode) => {
                setEmergencyActionMode(mode);
                setIsEmergencyModalOpen(true);
              }}
            />
          )}

          {activePage === 'loans' && (
            <LoansView
              loans={loans}
              settings={settings}
              onOpenCreateLoan={() => {
                setEditingLoan(null);
                setIsLoanModalOpen(true);
              }}
              onEditLoan={(loan) => {
                setEditingLoan(loan);
                setIsLoanModalOpen(true);
              }}
              onDeleteLoan={handleDeleteLoan}
              onOpenPaymentModal={(loan) => {
                setActionLoanTarget(loan);
                setIsLoanPaymentModalOpen(true);
              }}
            />
          )}

          {activePage === 'settings' && (
            <SettingsView
              settings={settings}
              userProfile={userProfile}
              onUpdateSettings={handleUpdateSettings}
              onUpdateProfile={handleUpdateProfile}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onOpenThemeModal={() => setIsThemeModalOpen(true)}
              onOpenPWAInstall={() => setIsPWAModalOpen(true)}
              onShowToast={showToast}
              onDataImported={() => {
                setTransactions(StorageService.getTransactions());
                setCategories(StorageService.getCategories());
                setGoals(StorageService.getGoals());
                setEmergencyFund(StorageService.getEmergencyFund());
                setLoans(StorageService.getLoans());
                setReminders(StorageService.getReminders());
                setSettings(StorageService.getSettings());
                setUserProfile(StorageService.getUserProfile());
                showToast('Данные успешно импортированы', 'success');
              }}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activePage={activePage}
        onNavigate={(page) => {
          playSound('click');
          setActivePage(page);
        }}
        settings={settings}
        userProfile={userProfile}
        onOpenAuthModal={() => {
          playSound('click');
          setIsAuthModalOpen(true);
        }}
        onToggleNightMode={() => handleUpdateSettings({ nightMode: !settings.nightMode })}
        onOpenVoiceModal={() => {
          playSound('voice');
          setIsVoiceModalOpen(true);
        }}
        onOpenThemeModal={() => {
          playSound('click');
          setIsThemeModalOpen(true);
        }}
        onOpenPWAInstall={() => {
          playSound('click');
          setIsPWAModalOpen(true);
        }}
      />

      {/* Floating Global Voice Floating Action Button on Mobile */}
      <button
        id="mobile-floating-voice-fab"
        onClick={() => {
          playSound('voice');
          setIsVoiceModalOpen(true);
        }}
        className="md:hidden fixed right-4 bottom-20 z-40 w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 border border-white/20 active:scale-95 transition-transform"
        aria-label="Голосовой ввод"
      >
        <span className="text-xl">🎙️</span>
      </button>

      {/* ================= MODALS ================= */}

      {/* 0. Google & Apple Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        userProfile={userProfile}
        settings={settings}
        onUpdateProfile={handleUpdateProfile}
        onShowToast={showToast}
      />

      {/* 1. Transaction Add/Edit Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        initialData={editingTx}
        currency={settings.currency}
      />

      {/* 2. Voice Input and Assistant Modal */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        categories={categories}
        onExecuteTransaction={(tx) => {
          handleSaveTransaction(tx);
          showToast('Транзакция успешно добавлена голосом', 'success');
        }}
        onNavigate={(page) => {
          setActivePage(page);
          showToast(`Переход в раздел: ${page}`, 'info');
        }}
        onSetTheme={(theme) => {
          handleUpdateSettings({ theme });
          showToast(`Тема изменена: ${theme}`, 'success');
        }}
        onSetNightMode={(nightMode) => {
          handleUpdateSettings({ nightMode });
          showToast(nightMode ? 'Тёмная тема включена' : 'Белоснежная светлая тема включена', 'success');
        }}
        onShowBalance={() => {
          setActivePage('dashboard');
          showToast(`Текущий баланс: ${totalBalance.toLocaleString('ru-RU')} ${settings.currency}`, 'info');
        }}
        currency={settings.currency}
        enableSpeechFeedback={settings.speechFeedback}
        isNight={settings.nightMode}
      />

      {/* 3. Theme & Settings Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* 4. Category Add/Edit Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        initialData={editingCategory}
      />

      {/* 5. Savings Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        initialData={editingGoal}
        currency={settings.currency}
      />

      {/* 6. Goal Deposit/Withdraw Action Modal */}
      <GoalActionModal
        isOpen={isGoalActionModalOpen}
        onClose={() => {
          setIsGoalActionModalOpen(false);
          setGoalActionTarget(null);
        }}
        goal={goalActionTarget}
        mode={goalActionMode}
        onAction={handleGoalAction}
        currency={settings.currency}
      />

      {/* 7. Emergency Fund Action Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        fund={emergencyFund}
        mode={emergencyActionMode}
        onAction={handleEmergencyAction}
        currency={settings.currency}
      />

      {/* 8. Loan Add/Edit Modal */}
      <LoanModal
        isOpen={isLoanModalOpen}
        onClose={() => {
          setIsLoanModalOpen(false);
          setEditingLoan(null);
        }}
        onSave={handleSaveLoan}
        initialData={editingLoan}
        currency={settings.currency}
      />

      {/* 9. Loan Payment Modal */}
      <LoanPaymentModal
        isOpen={isLoanPaymentModalOpen}
        onClose={() => {
          setIsLoanPaymentModalOpen(false);
          setActionLoanTarget(null);
        }}
        loan={actionLoanTarget}
        onMakePayment={handleMakeLoanPayment}
        currency={settings.currency}
      />

      {/* 9.5. Reminder Add/Edit Modal */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setEditingReminder(null);
        }}
        onSaveReminder={handleSaveReminder}
        onDeleteReminder={handleDeleteReminder}
        reminderToEdit={editingReminder}
        settings={settings}
        loans={loans}
        goals={goals}
        isNight={settings.nightMode}
      />

      {/* 10. PWA Installation Modal */}
      <PWAInstallModal
        isOpen={isPWAModalOpen}
        onClose={() => setIsPWAModalOpen(false)}
        onInstall={handleInstallPWA}
        canInstallPrompt={!!deferredPrompt}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default App;

