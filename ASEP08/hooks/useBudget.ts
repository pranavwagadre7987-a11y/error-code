import { useState } from 'react';
import { BUDGET_CATEGORIES, RECENT_TRANSACTIONS } from '@/constants';

export function useBudget() {
  const [categories] = useState(BUDGET_CATEGORIES);
  const [transactions] = useState(RECENT_TRANSACTIONS);

  const totalBudget = categories.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent  = categories.reduce((sum, c) => sum + c.spent,  0);
  const totalSaved  = totalBudget - totalSpent;
  const spentPct    = Math.round((totalSpent / totalBudget) * 100);

  return { categories, transactions, totalBudget, totalSpent, totalSaved, spentPct };
}