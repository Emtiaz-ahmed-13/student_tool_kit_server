import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ClassServices } from "./class.service";
import { IClassFilters } from "./class.types";

const createClass = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const result = await ClassServices.createClass(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Class created successfully",
      data: result,
    });
  }
);

const getClasses = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const filters: IClassFilters = req.query;

    const result = await ClassServices.getClasses(userId, filters);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Classes retrieved successfully",
      data: result,
    });
  }
);

const getWeeklySchedule = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const result = await ClassServices.getWeeklySchedule(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Weekly schedule retrieved successfully",
      data: result,
    });
  }
);

const getClassById = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await ClassServices.getClassById(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Class retrieved successfully",
      data: result,
    });
  }
);

const updateClass = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await ClassServices.updateClass(userId, id, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Class updated successfully",
      data: result,
    });
  }
);

const deleteClass = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await ClassServices.deleteClass(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Class deleted successfully",
      data: result,
    });
  }
);

const getTodaysClasses = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const result = await ClassServices.getTodaysClasses(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Today's classes retrieved successfully",
      data: result,
    });
  }
);

const getUpcomingClasses = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const result = await ClassServices.getUpcomingClasses(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Upcoming classes retrieved successfully",
      data: result,
    });
  }
);

export const ClassControllers = {
  createClass,
  getClasses,
  getWeeklySchedule,
  getClassById,
  updateClass,
  deleteClass,
  getTodaysClasses,
  getUpcomingClasses,
};
