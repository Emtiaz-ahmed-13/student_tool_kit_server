import express from 'express';
import { BudgetControllers } from './budget.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import {
  createBudgetSchema,
  updateBudgetSchema,
  getBudgetsSchema,
  getBudgetSchema,
  deleteBudgetSchema,
  getBudgetAnalyticsSchema
} from './budget.validation';

const router = express.Router();

// Create a new budget entry
router.post(
  '/',
  auth(),
  validateRequest(createBudgetSchema),
  BudgetControllers.createBudget
);

// Get all budget entries with optional filters
router.get(
  '/',
  auth(),
  validateRequest(getBudgetsSchema),
  BudgetControllers.getBudgets
);

// Get budget summary
router.get(
  '/summary',
  auth(),
  BudgetControllers.getBudgetSummary
);

// Get budget analytics
router.get(
  '/analytics',
  auth(),
  validateRequest(getBudgetAnalyticsSchema),
  BudgetControllers.getBudgetAnalytics
);

// Get recent transactions
router.get(
  '/recent',
  auth(),
  BudgetControllers.getRecentTransactions
);

// Get a specific budget entry by ID
router.get(
  '/:id',
  auth(),
  validateRequest(getBudgetSchema),
  BudgetControllers.getBudgetById
);

// Update a budget entry
router.patch(
  '/:id',
  auth(),
  validateRequest(updateBudgetSchema),
  BudgetControllers.updateBudget
);

// Delete a budget entry
router.delete(
  '/:id',
  auth(),
  validateRequest(deleteBudgetSchema),
  BudgetControllers.deleteBudget
);

export const BudgetRoutes = router;