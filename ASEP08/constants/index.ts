export const Colors = {
  background: '#F8F7F4',
  surface: '#FFFFFF',
  border: '#ECECEA',
  text: {
    primary: '#1A1A1A',
    secondary: '#6B6B6B',
    muted: '#ADADAD',
  },
  accent: '#2D6A4F',       // deep green — money/growth
  accentLight: '#E8F5EE',
  danger: '#C0392B',
  dangerLight: '#FDECEA',
  warning: '#D4A017',
  warningLight: '#FDF6E3',
  success: '#27AE60',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  full: 999,
};

export const BUDGET_CATEGORIES = [
  { id: '1', name: 'Housing',     icon: '🏠', budget: 15000, spent: 12000, color: '#2D6A4F' },
  { id: '2', name: 'Food',        icon: '🍱', budget: 8000,  spent: 6200,  color: '#E67E22' },
  { id: '3', name: 'Transport',   icon: '🚌', budget: 3000,  spent: 2100,  color: '#2980B9' },
  { id: '4', name: 'Health',      icon: '💊', budget: 2000,  spent: 800,   color: '#8E44AD' },
  { id: '5', name: 'Shopping',    icon: '🛍️', budget: 5000,  spent: 5400,  color: '#C0392B' },
  { id: '6', name: 'Savings',     icon: '💰', budget: 10000, spent: 10000, color: '#27AE60' },
];

export const RECENT_TRANSACTIONS = [
  { id: '1', title: 'Grocery Store',    amount: -450,  category: 'Food',      date: 'Today',      icon: '🍱' },
  { id: '2', title: 'Salary Credit',    amount: 55000, category: 'Income',    date: 'Today',      icon: '💼' },
  { id: '3', title: 'Electricity Bill', amount: -1200, category: 'Housing',   date: 'Yesterday',  icon: '🏠' },
  { id: '4', title: 'Uber Ride',        amount: -180,  category: 'Transport', date: 'Yesterday',  icon: '🚌' },
  { id: '5', title: 'Pharmacy',         amount: -320,  category: 'Health',    date: '24 Apr',     icon: '💊' },
  { id: '6', title: 'Amazon Order',     amount: -2200, category: 'Shopping',  date: '23 Apr',     icon: '🛍️' },
];