import { CATEGORIES, DEFAULT_PROFILE, DEFAULT_TRANSACTIONS } from '@/constants';
import { useCallback, useEffect, useState } from 'react';
import { loadData, saveData } from './useStorage';

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  date: string;
};

export type Profile = {
  name: string;
  email: string;
  monthlyIncome: number;
  currency: string;
  avatar: string;
};

export type Priority = 'high' | 'medium' | 'low';

export type BudgetShift = {
  from: string;
  to: string;
  amount: number;
  reason: string;
};

export type BudgetTransfer = {
  fromCategoryId: string;
  toCategoryId: string;
  amount: number;
};

export type PriorityAlert = {
  category: string;
  icon: string;
  overspent: number;
};

export function useBudget() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile]           = useState<Profile>(DEFAULT_PROFILE);
  const [loaded, setLoaded]             = useState(false);
  const [categoryBudgetOverrides, setCategoryBudgetOverrides] = useState<Record<string, number>>({});

  // Load from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      const savedTx      = await loadData<Transaction[]>('transactions', DEFAULT_TRANSACTIONS);
      const savedProfile = await loadData<Profile>('profile', DEFAULT_PROFILE);
      const savedBudgets = await loadData<Record<string, number>>('categoryBudgets', {});
      setTransactions(savedTx);
      setProfile(savedProfile);
      setCategoryBudgetOverrides(savedBudgets);
      setLoaded(true);
    })();
  }, []);

  // Add transaction
  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: Date.now().toString() };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    await saveData('transactions', updated);
  }, [transactions]);

  // Delete transaction
  const deleteTransaction = useCallback(async (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    await saveData('transactions', updated);
  }, [transactions]);

  // Update profile
  const updateProfile = useCallback(async (p: Profile) => {
    setProfile(p);
    await saveData('profile', p);
  }, []);

  // Reset all data
  const resetData = useCallback(async () => {
    setTransactions(DEFAULT_TRANSACTIONS);
    await saveData('transactions', DEFAULT_TRANSACTIONS);
  }, []);

  // Transfer budget between categories
  const transferBudget = useCallback(async (transfers: BudgetTransfer[]): Promise<boolean> => {
    try {
      const savedBudgets = await loadData<Record<string, number>>(
        'categoryBudgets',
        {}
      );

      const updatedBudgets = { ...savedBudgets };
      transfers.forEach(t => {
        const fromCat = CATEGORIES.find(c => c.id === t.fromCategoryId);
        const toCat   = CATEGORIES.find(c => c.id === t.toCategoryId);
        if (!fromCat || !toCat) return;

        const currentFromBudget = updatedBudgets[t.fromCategoryId] ?? fromCat.budget;
        const currentToBudget   = updatedBudgets[t.toCategoryId]   ?? toCat.budget;

        updatedBudgets[t.fromCategoryId] = currentFromBudget - t.amount;
        updatedBudgets[t.toCategoryId]   = currentToBudget   + t.amount;
      });

      await saveData('categoryBudgets', updatedBudgets);
      setCategoryBudgetOverrides(updatedBudgets);
      return true;
    } catch (error) {
      console.error('Budget transfer failed:', error);
      return false;
    }
  }, []);

  const getEffectiveBudget = useCallback((categoryId: string) => {
    const override = categoryBudgetOverrides[categoryId];
    if (override !== undefined) return override;
    return CATEGORIES.find(c => c.id === categoryId)?.budget ?? 0;
  }, [categoryBudgetOverrides]);

  const getTotalSpentForCategory = useCallback((categoryId: string) => {
    return transactions
      .filter(t => t.categoryId === categoryId && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  // ── Derived stats ────────────────────────────────────────────
  const income   = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const balance  = income - expenses;

  // ── Category spending ────────────────────────────────────────
  const categoryStats = CATEGORIES.map(cat => {
    const overrideBudget = categoryBudgetOverrides[cat.id];
    const effectiveBudget = overrideBudget !== undefined 
      ? overrideBudget 
      : cat.budget;
    const spent = transactions
      .filter(t => t.categoryId === cat.id && t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return {
      ...cat,
      budget: effectiveBudget,
      spent,
      remaining: Math.max(effectiveBudget - spent, 0),
      over: effectiveBudget > 0 && spent > effectiveBudget,
    };
  });

  // ── Monthly chart data (last 6 months) ───────────────────────
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleString('default', { month: 'short' });
    const spent = transactions
      .filter(t => {
        const td = new Date(t.date);
        return td.getMonth() === d.getMonth()
          && td.getFullYear() === d.getFullYear()
          && t.amount < 0;
      })
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return { label, spent };
  });

  // ── Priority Alerts ──────────────────────────────────────────
  // Find all HIGH priority categories that exceeded their budget
  const priorityAlerts: PriorityAlert[] = categoryStats
    .filter(c => c.priority === 'high' && c.over && c.budget > 0)
    .map(c => ({
      category: c.name,
      icon:     c.icon,
      overspent: c.spent - c.budget,
      message:  `⚠️ ${c.name} exceeded budget by ₹${(c.spent - c.budget).toLocaleString('en-IN')}`,
    }));

  // ── Auto Budget Shift Logic ──────────────────────────────────
  // When HIGH priority is over budget → pull from LOW priority remaining
  const budgetShifts: BudgetShift[] = (() => {
    const shifts: BudgetShift[] = [];

    // HIGH priority categories that are over budget
    const overHigh = categoryStats.filter(
      c => c.priority === 'high' && c.over && c.budget > 0
    );

    // LOW priority categories that still have remaining budget
    // Use a mutable copy so we can reduce remaining as we shift
    const lowRemaining = categoryStats
      .filter(c => c.priority === 'low' && c.remaining > 0)
      .map(c => ({ ...c, availableToShift: c.remaining }));

    overHigh.forEach(highCat => {
      let stillNeeded = highCat.spent - highCat.budget;

      lowRemaining.forEach(lowCat => {
        if (stillNeeded <= 0 || lowCat.availableToShift <= 0) return;

        const shiftAmount = Math.min(lowCat.availableToShift, stillNeeded);

        shifts.push({
          from:   lowCat.name,
          to:     highCat.name,
          amount: shiftAmount,
          reason: `${highCat.name} exceeded by ₹${(highCat.spent - highCat.budget).toLocaleString('en-IN')}`,
        });

        // Reduce available amount so same low budget isn't used twice
        lowCat.availableToShift -= shiftAmount;
        stillNeeded             -= shiftAmount;
      });
    });

    return shifts;
  })();

  // ── Priority summary counts ──────────────────────────────────
  const prioritySummary = {
    highOver:   categoryStats.filter(c => c.priority === 'high'   && c.over).length,
    mediumOver: categoryStats.filter(c => c.priority === 'medium' && c.over).length,
    lowOver:    categoryStats.filter(c => c.priority === 'low'    && c.over).length,
    totalShifted: budgetShifts.reduce((s, b) => s + b.amount, 0),
  };

  return {
    // Data
    transactions,
    profile,
    loaded,

    // Actions
    addTransaction,
    deleteTransaction,
    updateProfile,
    resetData,
    transferBudget,

    // Stats
    income,
    expenses,
    balance,
    categoryStats,
    monthlyData,
    categoryBudgetOverrides,
    getEffectiveBudget,
    getTotalSpentForCategory,

    // Priority system
    priorityAlerts,
    budgetShifts,
    prioritySummary,
  };
}