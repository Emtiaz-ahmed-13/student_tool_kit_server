import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { StudyPlannerServices } from "./study-planner.service";
import { IStudyPlanFilters } from "./study-planner.types";

const createStudyPlan = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const result = await StudyPlannerServices.createStudyPlan(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Study plan created successfully",
      data: result,
    });
  }
);

const getStudyPlans = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const filters: IStudyPlanFilters = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await StudyPlannerServices.getStudyPlans(
      userId,
      filters,
      page,
      limit
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Study plans retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getStudyPlanById = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await StudyPlannerServices.getStudyPlanById(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Study plan retrieved successfully",
      data: result,
    });
  }
);

const updateStudyPlan = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await StudyPlannerServices.updateStudyPlan(
      userId,
      id,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Study plan updated successfully",
      data: result,
    });
  }
);

const deleteStudyPlan = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await StudyPlannerServices.deleteStudyPlan(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Study plan deleted successfully",
      data: result,
    });
  }
);

const createStudyTask = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { planId } = req.params;

    const result = await StudyPlannerServices.createStudyTask(
      userId,
      planId,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Study task created successfully",
      data: result,
    });
  }
);

const updateStudyTask = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { planId, taskId } = req.params;

    const result = await StudyPlannerServices.updateStudyTask(
      userId,
      planId,
      taskId,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Study task updated successfully",
      data: result,
    });
  }
);

const deleteStudyTask = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { planId, taskId } = req.params;

    const result = await StudyPlannerServices.deleteStudyTask(
      userId,
      planId,
      taskId
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Study task deleted successfully",
      data: result,
    });
  }
);

const getStudyAnalytics = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { startDate, endDate, subject } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const result = await StudyPlannerServices.getStudyAnalytics(
      userId,
      start,
      end,
      subject as string
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Study analytics retrieved successfully",
      data: result,
    });
  }
);

const getPriorityMatrix = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const result = await StudyPlannerServices.getPriorityMatrix(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Priority matrix retrieved successfully",
      data: result,
    });
  }
);

const getUpcomingDeadlines = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const days = Number(req.query.days) || 7;

    const result = await StudyPlannerServices.getUpcomingDeadlines(
      userId,
      days
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Upcoming deadlines retrieved successfully",
      data: result,
    });
  }
);

export const StudyPlannerControllers = {
  createStudyPlan,
  getStudyPlans,
  getStudyPlanById,
  updateStudyPlan,
  deleteStudyPlan,
  createStudyTask,
  updateStudyTask,
  deleteStudyTask,
  getStudyAnalytics,
  getPriorityMatrix,
  getUpcomingDeadlines,
};
