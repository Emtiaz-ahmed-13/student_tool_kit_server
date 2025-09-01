import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import * as studySessionService from "../services/study-session.service";

// Study Session Controllers
const createStudySession = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const result = await studySessionService.createStudySession(
      userId,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Study session created successfully",
      data: result,
    });
  }
);

const updateStudySession = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await studySessionService.updateStudySession(
      userId,
      id,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Study session updated successfully",
      data: result,
    });
  }
);

const getStudySessions = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const filters = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await studySessionService.getStudySessions(
      userId,
      filters,
      page,
      limit
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Study sessions retrieved successfully",
      meta: result.pagination,
      data: result.sessions,
    });
  }
);

const deleteStudySession = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await studySessionService.deleteStudySession(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: null,
    });
  }
);

export {
  createStudySession,
  deleteStudySession,
  getStudySessions,
  updateStudySession,
};
