export const Colors = {
  background:   '#F8F7F4',
  surface:      '#FFFFFF',
  border:       '#ECECEA',
  text: {
    primary:   '#1A1A1A',
    secondary: '#6B6B6B',
    muted:     '#ADADAD',
  },
  accent:       '#2D6A4F',
  accentLight:  '#E8F5EE',
  danger:       '#C0392B',
  dangerLight:  '#FDECEA',
  warning:      '#D4A017',
  warningLight: '#FDF6E3',
  success:      '#27AE60',
  successLight: '#E9F7EF',
};

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const Radius = {
  sm: 8, md: 14, lg: 20, full: 999,
};

export const CATEGORIES = [
  { id: '1', name: 'Housing',   icon: '🏠', color: '#2D6A4F', budget: 15000 },
  { id: '2', name: 'Food',      icon: '🍱', color: '#E67E22', budget: 8000  },
  { id: '3', name: 'Transport', icon: '🚌', color: '#2980B9', budget: 3000  },
  { id: '4', name: 'Health',    icon: '💊', color: '#8E44AD', budget: 2000  },
  { id: '5', name: 'Shopping',  icon: '🛍️', color: '#C0392B', budget: 5000  },
  { id: '6', name: 'Savings',   icon: '💰', color: '#27AE60', budget: 10000 },
  { id: '7', name: 'Income',    icon: '💼', color: '#2D6A4F', budget: 0     },
  { id: '8', name: 'Other',     icon: '📦', color: '#7F8C8D', budget: 2000  },
];

export const DEFAULT_TRANSACTIONS = [
  { id: '1', title: 'Grocery Store',    amount: -450,  categoryId: '2', date: new Date().toISOString() },
  { id: '2', title: 'Salary Credit',    amount: 55000, categoryId: '7', date: new Date().toISOString() },
  { id: '3', title: 'Electricity Bill', amount: -1200, categoryId: '1', date: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', title: 'Uber Ride',        amount: -180,  categoryId: '3', date: new Date(Date.now() - 86400000).toISOString() },
  { id: '5', title: 'Pharmacy',         amount: -320,  categoryId: '4', date: new Date(Date.now() - 172800000).toISOString() },
  { id: '6', title: 'Amazon Order',     amount: -2200, categoryId: '5', date: new Date(Date.now() - 259200000).toISOString() },
];

export const DEFAULT_PROFILE = {
  name: 'Pranav',
  email: 'pranav@example.com',
  monthlyIncome: 55000,
  currency: '₹',
  avatar: '👤',
};