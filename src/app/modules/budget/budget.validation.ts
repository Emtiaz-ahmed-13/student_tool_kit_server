import { z } from "zod";
import {
  BudgetType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "./budget.types";

const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export const createBudgetSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: "Title is required",
      })
      .min(1, "Title cannot be empty"),

    amount: z
      .number({
        required_error: "Amount is required",
        invalid_type_error: "Amount must be a number",
      })
      .positive("Amount must be positive"),

    type: z.nativeEnum(BudgetType, {
      required_error: "Type is required",
      invalid_type_error: "Type must be either INCOME or EXPENSE",
    }),

    category: z
      .string({
        required_error: "Category is required",
      })
      .min(1, "Category cannot be empty"),

    description: z.string().optional(),

    date: z.string().datetime().optional(),
  }),
});

export const updateBudgetSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title cannot be empty").optional(),
    amount: z.number().positive("Amount must be positive").optional(),
    type: z.nativeEnum(BudgetType).optional(),
    category: z.string().min(1, "Category cannot be empty").optional(),
    description: z.string().optional(),
    date: z.string().datetime().optional(),
  }),
});

export const getBudgetsSchema = z.object({
  query: z.object({
    type: z.nativeEnum(BudgetType).optional(),
    category: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    minAmount: z.string().transform(Number).optional(),
    maxAmount: z.string().transform(Number).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

export const getBudgetSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: "Budget ID is required",
    }),
  }),
});

export const deleteBudgetSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: "Budget ID is required",
    }),
  }),
});

export const getBudgetAnalyticsSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    period: z.enum(["week", "month", "quarter", "year"]).optional(),
  }),
});
