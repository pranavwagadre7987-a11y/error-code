import { useState, useEffect, useCallback } from 'react';
import { CATEGORIES, DEFAULT_TRANSACTIONS, DEFAULT_PROFILE } from '@/constants';
import { saveData, loadData } from './useStorage';

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

export function useBudget() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile]           = useState<Profile>(DEFAULT_PROFILE);
  const [loaded, setLoaded]             = useState(false);

  // Load from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      const savedTx      = await loadData<Transaction[]>('transactions', DEFAULT_TRANSACTIONS);
      const savedProfile = await loadData<Profile>('profile', DEFAULT_PROFILE);
      setTransactions(savedTx);
      setProfile(savedProfile);
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

  // Derived stats
  const income   = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const balance  = income - expenses;

  // Category spending
  const categoryStats = CATEGORIES.map(cat => {
    const spent = transactions
      .filter(t => t.categoryId === cat.id && t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return { ...cat, spent, remaining: Math.max(cat.budget - spent, 0), over: spent > cat.budget };
  });

  // Monthly chart data (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d     = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleString('default', { month: 'short' });
    const spent = transactions
      .filter(t => {
        const td = new Date(t.date);
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() && t.amount < 0;
      })
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return { label, spent };
  });

  return {
    transactions, profile, loaded,
    addTransaction, deleteTransaction, updateProfile, resetData,
    income, expenses, balance,
    categoryStats, monthlyData,
  };
}