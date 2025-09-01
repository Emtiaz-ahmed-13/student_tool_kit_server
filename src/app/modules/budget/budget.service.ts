import prisma from '../../shared/prisma';
import ApiError from '../../errors/ApiError';
import { 
  IBudgetCreate, 
  IBudgetUpdate, 
  IBudgetFilters, 
  IBudgetSummary, 
  IBudgetAnalytics,
  IBudgetCategoryAnalysis,
  BudgetType 
} from './budget.types';

const createBudget = async (userId: string, payload: IBudgetCreate) => {
  const budgetData = {
    ...payload,
    userId,
    date: payload.date ? new Date(payload.date) : new Date()
  };

  const newBudget = await prisma.budget.create({
    data: budgetData
  });

  return newBudget;
};

const getBudgets = async (userId: string, filters: IBudgetFilters, page = 1, limit = 10) => {
  const where: any = { userId };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.category) {
    where.category = {
      contains: filters.category,
      mode: 'insensitive'
    };
  }

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.date.lte = new Date(filters.endDate);
    }
  }

  if (filters.minAmount || filters.maxAmount) {
    where.amount = {};
    if (filters.minAmount) {
      where.amount.gte = filters.minAmount;
    }
    if (filters.maxAmount) {
      where.amount.lte = filters.maxAmount;
    }
  }

  const skip = (page - 1) * limit;

  const [budgets, total] = await Promise.all([
    prisma.budget.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit
    }),
    prisma.budget.count({ where })
  ]);

  return {
    data: budgets,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getBudgetById = async (userId: string, budgetId: string) => {
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId
    }
  });

  if (!budget) {
    throw new ApiError(404, 'Budget entry not found');
  }

  return budget;
};

const updateBudget = async (userId: string, budgetId: string, payload: IBudgetUpdate) => {
  await getBudgetById(userId, budgetId); // Check if budget exists

  const updateData = { ...payload };
  if (payload.date) {
    updateData.date = new Date(payload.date);
  }

  const updatedBudget = await prisma.budget.update({
    where: { id: budgetId },
    data: updateData
  });

  return updatedBudget;
};

const deleteBudget = async (userId: string, budgetId: string) => {
  await getBudgetById(userId, budgetId); // Check if budget exists

  await prisma.budget.delete({
    where: { id: budgetId }
  });

  return { message: 'Budget entry deleted successfully' };
};

const getBudgetSummary = async (userId: string, startDate?: Date, endDate?: Date) => {
  const where: any = { userId };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }

  const [incomeData, expenseData] = await Promise.all([
    prisma.budget.aggregate({
      where: { ...where, type: BudgetType.INCOME },
      _sum: { amount: true },
      _count: true
    }),
    prisma.budget.aggregate({
      where: { ...where, type: BudgetType.EXPENSE },
      _sum: { amount: true },
      _count: true
    })
  ]);

  const totalIncome = incomeData._sum.amount || 0;
  const totalExpenses = expenseData._sum.amount || 0;

  const summary: IBudgetSummary = {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    incomeCount: incomeData._count,
    expenseCount: expenseData._count
  };

  return summary;
};

const getCategoryAnalysis = async (userId: string, type: BudgetType, startDate?: Date, endDate?: Date) => {
  const where: any = { userId, type };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }

  const categoryData = await prisma.budget.groupBy({
    by: ['category'],
    where,
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: 'desc' } }
  });

  const total = categoryData.reduce((sum, item) => sum + (item._sum.amount || 0), 0);

  const analysis: IBudgetCategoryAnalysis[] = categoryData.map(item => ({
    category: item.category,
    totalAmount: item._sum.amount || 0,
    count: item._count,
    percentage: total > 0 ? ((item._sum.amount || 0) / total) * 100 : 0
  }));

  return analysis;
};

const getMonthlyTrend = async (userId: string, months = 6) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { date: 'asc' }
  });

  const monthlyData: { [key: string]: { income: number; expenses: number } } = {};

  budgets.forEach(budget => {
    const monthKey = budget.date.toISOString().slice(0, 7); // YYYY-MM format
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expenses: 0 };
    }

    if (budget.type === BudgetType.INCOME) {
      monthlyData[monthKey].income += budget.amount;
    } else {
      monthlyData[monthKey].expenses += budget.amount;
    }
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    income: data.income,
    expenses: data.expenses
  }));
};

const getBudgetAnalytics = async (userId: string, startDate?: Date, endDate?: Date) => {
  const [summary, incomeByCategory, expensesByCategory, monthlyTrend] = await Promise.all([
    getBudgetSummary(userId, startDate, endDate),
    getCategoryAnalysis(userId, BudgetType.INCOME, startDate, endDate),
    getCategoryAnalysis(userId, BudgetType.EXPENSE, startDate, endDate),
    getMonthlyTrend(userId)
  ]);

  const analytics: IBudgetAnalytics = {
    summary,
    incomeByCategory,
    expensesByCategory,
    monthlyTrend
  };

  return analytics;
};

const getRecentTransactions = async (userId: string, limit = 5) => {
  const recentBudgets = await prisma.budget.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  return recentBudgets;
};

export const BudgetServices = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
  getCategoryAnalysis,
  getBudgetAnalytics,
  getRecentTransactions
};