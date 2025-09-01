export interface IBudget {
  id?: string;
  title: string;
  amount: number;
  type: BudgetType;
  category: string;
  description?: string | null;
  date: Date;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBudgetCreate {
  title: string;
  amount: number;
  type: BudgetType;
  category: string;
  description?: string;
  date?: Date;
}

export interface IBudgetUpdate {
  title?: string;
  amount?: number;
  type?: BudgetType;
  category?: string;
  description?: string;
  date?: Date;
}

export enum BudgetType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export interface IBudgetFilters {
  type?: BudgetType;
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface IBudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
}

export interface IBudgetCategoryAnalysis {
  category: string;
  totalAmount: number;
  count: number;
  percentage: number;
}

export interface IBudgetAnalytics {
  summary: IBudgetSummary;
  incomeByCategory: IBudgetCategoryAnalysis[];
  expensesByCategory: IBudgetCategoryAnalysis[];
  monthlyTrend: { month: string; income: number; expenses: number }[];
}

// Common budget categories
export const INCOME_CATEGORIES = [
  "Allowance",
  "Part-time Job",
  "Scholarship",
  "Family Support",
  "Freelancing",
  "Tutoring",
  "Gifts",
  "Other Income",
] as const;

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Books & Supplies",
  "Entertainment",
  "Clothing",
  "Health & Medicine",
  "Technology",
  "Accommodation",
  "Utilities",
  "Subscriptions",
  "Sports & Recreation",
  "Personal Care",
  "Miscellaneous",
] as const;
