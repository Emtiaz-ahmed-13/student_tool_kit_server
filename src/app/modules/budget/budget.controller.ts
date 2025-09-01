import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { BudgetServices } from "./budget.service";
import { IBudgetFilters } from "./budget.types";

const createBudget = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const result = await BudgetServices.createBudget(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Budget entry created successfully",
      data: result,
    });
  }
);

const getBudgets = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const filters: IBudgetFilters = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await BudgetServices.getBudgets(
      userId,
      filters,
      page,
      limit
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Budget entries retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getBudgetById = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await BudgetServices.getBudgetById(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Budget entry retrieved successfully",
      data: result,
    });
  }
);

const updateBudget = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await BudgetServices.updateBudget(userId, id, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Budget entry updated successfully",
      data: result,
    });
  }
);

const deleteBudget = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await BudgetServices.deleteBudget(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Budget entry deleted successfully",
      data: result,
    });
  }
);

const getBudgetSummary = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const result = await BudgetServices.getBudgetSummary(userId, start, end);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Budget summary retrieved successfully",
      data: result,
    });
  }
);

const getBudgetAnalytics = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const result = await BudgetServices.getBudgetAnalytics(userId, start, end);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Budget analytics retrieved successfully",
      data: result,
    });
  }
);

const getRecentTransactions = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const limit = Number(req.query.limit) || 5;

    const result = await BudgetServices.getRecentTransactions(userId, limit);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Recent transactions retrieved successfully",
      data: result,
    });
  }
);

export const BudgetControllers = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
  getBudgetAnalytics,
  getRecentTransactions,
};
